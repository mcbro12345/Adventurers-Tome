using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Numerics;
using Dalamud.Bindings.ImGui;
using Dalamud.Configuration;
using Dalamud.Game.Addon.Lifecycle;
using Dalamud.Game.Addon.Lifecycle.AddonArgTypes;
using Dalamud.Game.Command;
using Dalamud.Game.Gui.NamePlate;
using Dalamud.Interface.Windowing;
using Dalamud.IoC;
using Dalamud.Plugin;
using Dalamud.Plugin.Services;
using FFXIVClientStructs.FFXIV.Client.UI;
using FFXIVClientStructs.FFXIV.Client.UI.Arrays;
using FFXIVClientStructs.FFXIV.Component.GUI;

namespace SmoothNameplates;

[Serializable]
public sealed class Config : IPluginConfiguration
{
    public int Version { get; set; } = 2;
    public bool Smooth = true;
    public float MinCutoff = 1.0f;   // Hz: lower = steadier
    public float Beta = 0.05f;       // how fast the offset catches up when it really changes (zooming)
    public bool HalfPixel = true;
    public bool SharpText = false;   // bake the text at the real size instead of the fixed resolution
    public float EdgeDarken = 0.45f; // 0 = game's outline, 1 = black outline
    public int ForceLag = -1;        // -1 = work it out
}

public sealed unsafe class Plugin : IDalamudPlugin
{
    [PluginService] internal static IDalamudPluginInterface Pi { get; private set; } = null!;
    [PluginService] internal static INamePlateGui NamePlates { get; private set; } = null!;
    [PluginService] internal static IAddonLifecycle Lifecycle { get; private set; } = null!;
    [PluginService] internal static IGameGui GameGui { get; private set; } = null!;
    [PluginService] internal static ICommandManager Commands { get; private set; } = null!;

    private const string Cmd = "/smoothtags";
    private const int Count = 50;

    // The game hands the addon whole-pixel X/Y worked out with an older camera, so while the camera turns a plate
    // trails its character by a frame or so (up to 10+ px) and steps a pixel at a time. At draw time (the camera of the
    // frame on screen) we project the plate's own world anchor as a float and add the offset between the game's spot and
    // our projection from the frame the game actually used. That offset is only the plate's layout, so it can be
    // filtered hard without adding lag.
    private const int Lags = 3; // candidate delays, in updates
    private sealed class Plate
    {
        public ulong Id;
        public bool Live;
        public Vector3 Anchor;
        public float GameX, GameY;                     // the game's whole-pixel spot this update
        public readonly Vector2[] S = new Vector2[Lags]; // our projections, newest first
        public int History;                            // how many of S are valid
        public readonly OneEuro[] Ox = new OneEuro[Lags], Oy = new OneEuro[Lags];
        public readonly Vector2[] LastRaw = new Vector2[Lags];

        public void Reset(ulong id)
        {
            Id = id; History = 0;
            Array.Clear(Ox); Array.Clear(Oy);
        }
    }

    private readonly Plate[] plates = CreatePlates();
    private static Plate[] CreatePlates() { var a = new Plate[Count]; for (var i = 0; i < Count; i++) a[i] = new Plate(); return a; }
    // how much each candidate delay's offset wobbles; the real delay is the one that leaves a steady offset
    private readonly float[] lagWobble = new float[Lags];
    internal int Lag = 1;
    private readonly uint[] edgeOurs = new uint[Count];
    private readonly Stopwatch clock = Stopwatch.StartNew();
    private readonly WindowSystem windows = new("SmoothNameplates");
    private readonly ConfigWindow window;
    internal readonly Config Cfg;
    private double lastUpdateT;
    private bool sharpApplied;
    private int sharpFights;
    internal bool SharpGaveUp;

    // shown in the settings window, per second
    internal int UpdatesPerSec, DrawsPerSec;
    internal int LivePlates, ReadyPlates, MovedPlates;
    internal float MaxShift, MaxShiftShown;
    internal bool TestPush; // shove every plate 30px right, to see whether moving them works at all
    private int updates, draws;
    private double statT;

    public Plugin()
    {
        Cfg = Pi.GetPluginConfig() as Config ?? new Config();
        if (Cfg.Version < 2) { Cfg.Version = 2; Cfg.SharpText = false; Cfg.MinCutoff = 1.0f; }
        window = new ConfigWindow(this);
        windows.AddWindow(window);
        Pi.UiBuilder.Draw += windows.Draw;
        Pi.UiBuilder.OpenConfigUi += window.Toggle;
        Pi.UiBuilder.OpenMainUi += window.Toggle;
        Commands.AddHandler(Cmd, new CommandInfo((_, _) => window.Toggle()) { HelpMessage = "Smooth Nameplates settings." });
        NamePlates.OnDataUpdate += OnDataUpdate;
        NamePlates.OnPostDataUpdate += OnPostDataUpdate;
        Lifecycle.RegisterListener(AddonEvent.PreDraw, "NamePlate", OnPreDraw);
        NamePlates.RequestRedraw();
    }

    public void Dispose()
    {
        Lifecycle.UnregisterListener(AddonEvent.PreDraw, "NamePlate", OnPreDraw);
        NamePlates.OnDataUpdate -= OnDataUpdate;
        NamePlates.OnPostDataUpdate -= OnPostDataUpdate;
        Commands.RemoveHandler(Cmd);
        Pi.UiBuilder.Draw -= windows.Draw;
        Pi.UiBuilder.OpenConfigUi -= window.Toggle;
        Pi.UiBuilder.OpenMainUi -= window.Toggle;
        windows.RemoveAllWindows();
        if (sharpApplied)
        {
            var na = NamePlateNumberArray.Instance();
            if (na != null) { na->DisableFixedFontResolution = false; na->ForceNamePlateRebake = true; }
        }
        NamePlates.RequestRedraw();
    }

    internal void Save()
    {
        Pi.SavePluginConfig(Cfg);
        Array.Clear(edgeOurs);
        SharpGaveUp = false;
        sharpFights = 0;
        NamePlates.RequestRedraw();
    }

    private static NamePlateNumberArray.NamePlateObjectIntArrayData* Data(NamePlateNumberArray* na, int arrayIndex) =>
        (NamePlateNumberArray.NamePlateObjectIntArrayData*)((int*)na + 6) + arrayIndex; // the 50 blocks follow 6 header ints

    // Before the addon reads the data: readability tweaks. Nothing here may force a rebake every frame.
    private void OnDataUpdate(INamePlateUpdateContext ctx, IReadOnlyList<INamePlateUpdateHandler> handlers)
    {
        var na = (NamePlateNumberArray*)ctx.NumberArrayDataEntryAddress;
        if (na == null) return;

        var wantSharp = Cfg.SharpText && !SharpGaveUp;
        if (wantSharp && !na->DisableFixedFontResolution)
        {
            // the game setting it back every frame would mean a rebake every frame; stop fighting it
            if (sharpApplied && ++sharpFights > 3) { SharpGaveUp = true; wantSharp = false; }
            else { na->DisableFixedFontResolution = true; na->ForceNamePlateRebake = true; }
        }
        if (!wantSharp && sharpApplied) { na->DisableFixedFontResolution = false; na->ForceNamePlateRebake = true; }
        sharpApplied = wantSharp;

        if (Cfg.EdgeDarken <= 0) return;
        foreach (var h in handlers)
        {
            var ai = h.ArrayIndex;
            if ((uint)ai >= Count) continue;
            // written straight into the data without raising the update flag: the addon picks it up whenever the game
            // itself says the colours changed, instead of us asking for a redraw every frame
            var d = Data(na, ai);
            var c = d->NameEdgeColor;
            if (c == edgeOurs[ai]) continue;
            d->NameEdgeColor = edgeOurs[ai] = Darken(c, Cfg.EdgeDarken);
        }
    }

    // After the addon placed its nodes: note where the game wants each plate and learn the offset.
    private void OnPostDataUpdate(INamePlateUpdateContext ctx, IReadOnlyList<INamePlateUpdateHandler> handlers)
    {
        updates++;
        var t = clock.Elapsed.TotalSeconds;
        var dt = (float)Math.Clamp(t - lastUpdateT, 1e-4, 0.25);
        lastUpdateT = t;

        var na = (NamePlateNumberArray*)ctx.NumberArrayDataEntryAddress;
        if (na == null) return;
        var uiModule = UIModule.Instance();
        var ui3d = uiModule != null ? uiModule->GetUI3DModule() : null;

        Span<bool> seen = stackalloc bool[Count];
        Span<float> wobble = stackalloc float[Lags];
        Span<int> seenK = stackalloc int[Lags];
        foreach (var h in handlers)
        {
            var i = h.NamePlateIndex;
            if ((uint)i >= Count || (uint)h.ArrayIndex >= Count) continue;
            var p = plates[i];
            seen[i] = true;
            if (!p.Live || p.Id != h.GameObjectId) p.Reset(h.GameObjectId);
            p.Live = true;

            var d = Data(na, h.ArrayIndex);
            p.GameX = d->X;
            p.GameY = d->Y;
            if (!Anchor(ui3d, h, out p.Anchor) || !GameGui.WorldToScreen(p.Anchor, out var s)) { p.Reset(p.Id); continue; }

            for (var k = Lags - 1; k > 0; k--) p.S[k] = p.S[k - 1];
            p.S[0] = s;
            p.History = Math.Min(p.History + 1, Lags);

            for (var k = 0; k < p.History; k++)
            {
                var ox = p.GameX - p.S[k].X;
                var oy = p.GameY - p.S[k].Y;
                if (p.Ox[k].Ready)
                {
                    var w = MathF.Abs(ox - p.LastRaw[k].X) + MathF.Abs(oy - p.LastRaw[k].Y);
                    wobble[k] += MathF.Min(w, 20); seenK[k]++;
                    // a big jump is a real change (plate reused, size change): take it at once
                    if (MathF.Abs(ox - p.Ox[k].X) > 24 || MathF.Abs(oy - p.Oy[k].X) > 24) { p.Ox[k] = default; p.Oy[k] = default; }
                }
                p.LastRaw[k] = new Vector2(ox, oy);
                p.Ox[k].Step(ox, dt, Cfg.MinCutoff, Cfg.Beta);
                p.Oy[k].Step(oy, dt, Cfg.MinCutoff, Cfg.Beta);
            }
        }
        for (var i = 0; i < Count; i++)
            if (!seen[i]) plates[i].Live = false;

        // only learn while things move; standing still every delay looks equally good
        float total = 0;
        for (var k = 0; k < Lags; k++) total += seenK[k] > 0 ? wobble[k] / seenK[k] : 0;
        if (total > 0.5f)
            for (var k = 0; k < Lags; k++)
                if (seenK[k] > 0) lagWobble[k] += 0.05f * (wobble[k] / seenK[k] - lagWobble[k]);
        var best = Lag;
        for (var k = 0; k < Lags; k++)
            if (lagWobble[k] < lagWobble[best] * 0.8f) best = k;
        Lag = Cfg.ForceLag >= 0 ? Math.Min(Cfg.ForceLag, Lags - 1) : best;
    }

    // Right before the plates are drawn: project with this frame's camera and place the nodes.
    private void OnPreDraw(AddonEvent type, AddonArgs args)
    {
        draws++;
        var t = clock.Elapsed.TotalSeconds;
        if (t - statT >= 1) { UpdatesPerSec = updates; DrawsPerSec = draws; updates = draws = 0; statT = t; MaxShiftShown = MaxShift; MaxShift = 0; }

        var addon = (AddonNamePlate*)args.Addon.Address;
        if (addon == null || addon->NamePlateObjectArray == null) return;
        int live = 0, ready = 0, moved = 0;
        for (var i = 0; i < Count; i++)
        {
            var p = plates[i];
            if (!p.Live) continue;
            live++;
            var root = addon->NamePlateObjectArray[i].RootComponentNode;
            if (root == null) continue;
            var k = Math.Min(Lag, p.History - 1);
            var ok = k >= 0 && p.Ox[k].Ready;
            if (ok) ready++;

            float dx = 0, dy = 0;
            if (Cfg.Smooth && ok && GameGui.WorldToScreen(p.Anchor, out var s))
            {
                var wantX = s.X + p.Ox[k].X;
                var wantY = s.Y + p.Oy[k].X;
                if (Cfg.HalfPixel)
                {
                    wantX = MathF.Round(wantX * 2) / 2;
                    wantY = MathF.Round(wantY * 2) / 2;
                }
                dx = wantX - p.GameX;
                dy = wantY - p.GameY;
                MaxShift = MathF.Max(MaxShift, MathF.Max(MathF.Abs(dx), MathF.Abs(dy)));
            }
            if (TestPush) dx += 30;
            if (dx == 0 && dy == 0 && !shifts.ContainsKey((nint)root)) continue;
            moved++;

            // The game already turned X/Y into screen positions for this frame, so moving X/Y now would only show up
            // after the next update overwrote it. Shift the finished screen positions of the plate's nodes instead.
            Shift((AtkResNode*)root, dx, dy);
            var comp = root->Component;
            if (comp == null) continue;
            var list = comp->UldManager.NodeList;
            for (var n = 0; list != null && n < comp->UldManager.NodeListCount; n++)
                if (list[n] != null) Shift(list[n], dx, dy);
        }
        LivePlates = live; ReadyPlates = ready; MovedPlates = moved;
    }

    private struct NodeShift { public float WroteX, WroteY, Dx, Dy; }
    private readonly Dictionary<nint, NodeShift> shifts = new();

    private void Shift(AtkResNode* node, float dx, float dy)
    {
        var x = node->ScreenX;
        var y = node->ScreenY;
        // a node the game didn't recompute since last frame still carries our previous shift: take it off first
        if (shifts.TryGetValue((nint)node, out var old) && x == old.WroteX && y == old.WroteY) { x -= old.Dx; y -= old.Dy; }
        var n = new NodeShift { WroteX = x + dx, WroteY = y + dy, Dx = dx, Dy = dy };
        node->ScreenX = n.WroteX;
        node->ScreenY = n.WroteY;
        shifts[(nint)node] = n;
    }

    // The world point the game itself projects for this plate (above the head), else the object's position.
    private static bool Anchor(UI3DModule* ui3d, INamePlateUpdateHandler h, out Vector3 world)
    {
        world = default;
        if (ui3d != null && h.ArrayIndex < ui3d->NamePlateObjectInfoCount)
        {
            var info = ui3d->NamePlateObjectInfoPointers[h.ArrayIndex].Value;
            if (info != null) { world = info->NamePlatePos; return true; }
        }
        if (h.GameObject is { } go) { world = go.Position; return true; }
        return false;
    }

    // Scales the colour bytes toward black and leaves the alpha byte alone (it's the end byte that reads 0xFF).
    private static uint Darken(uint c, float k)
    {
        var alphaLow = (c & 0xFF) == 0xFF && (c >> 24) != 0xFF;
        var f = 1 - Math.Clamp(k, 0, 1);
        uint r = 0;
        for (var b = 0; b < 4; b++)
        {
            var v = (c >> (b * 8)) & 0xFF;
            var isAlpha = alphaLow ? b == 0 : b == 3;
            r |= (isAlpha ? v : (uint)(v * f)) << (b * 8);
        }
        return r;
    }
}

// One Euro filter: heavy smoothing while steady, quick catch-up when the value really moves.
internal struct OneEuro
{
    public bool Ready;
    public float X, Dx;

    public float Step(float v, float dt, float minCutoff, float beta)
    {
        if (!Ready) { Ready = true; X = v; Dx = 0; return v; }
        Dx += Alpha(dt, 1f) * ((v - X) / dt - Dx);
        X += Alpha(dt, minCutoff + beta * MathF.Abs(Dx)) * (v - X);
        return X;
    }

    private static float Alpha(float dt, float cutoff) => 1f / (1f + 1f / (2 * MathF.PI * cutoff * dt));
}

internal sealed class ConfigWindow : Window
{
    private readonly Plugin plugin;

    public ConfigWindow(Plugin plugin) : base("Smooth Nameplates###smoothtags", ImGuiWindowFlags.AlwaysAutoResize)
    {
        this.plugin = plugin;
    }

    public override void Draw()
    {
        var c = plugin.Cfg;
        var changed = false;
        changed |= ImGui.Checkbox("Smooth movement", ref c.Smooth);
        if (c.Smooth)
        {
            changed |= ImGui.SliderFloat("Steadiness (Hz, lower = steadier)", ref c.MinCutoff, 0.2f, 5f, "%.2f");
            changed |= ImGui.SliderFloat("Catch-up when zooming", ref c.Beta, 0f, 0.3f, "%.3f");
            changed |= ImGui.Checkbox("Snap to half pixels", ref c.HalfPixel);
        }
        changed |= ImGui.Checkbox("Sharp text (no fixed font resolution)", ref c.SharpText);
        if (c.SharpText && plugin.SharpGaveUp) ImGui.TextDisabled("  The game keeps turning this back off, so it's paused.");
        changed |= ImGui.SliderFloat("Darker outline", ref c.EdgeDarken, 0f, 1f, "%.2f");
        if (changed) plugin.Save();
        ImGui.Separator();
        ImGui.TextDisabled($"Nameplate updates/s: {plugin.UpdatesPerSec}   draws/s: {plugin.DrawsPerSec}");
        ImGui.TextDisabled($"Plates: {plugin.LivePlates} seen, {plugin.ReadyPlates} tracked, {plugin.MovedPlates} moved; biggest shift {plugin.MaxShiftShown:0.00}px");
        ImGui.TextDisabled($"Game is {plugin.Lag} frame(s) behind" + (c.ForceLag < 0 ? " (auto)" : ""));
        changed |= ImGui.SliderInt("Frames behind (-1 = auto)", ref c.ForceLag, -1, 2);
        ImGui.Checkbox("Test: push every tag 30px right", ref plugin.TestPush);
    }
}
