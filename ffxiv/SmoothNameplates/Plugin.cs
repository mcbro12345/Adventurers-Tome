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
    public int Version { get; set; } = 1;
    public bool Smooth = true;
    public float MinCutoff = 1.5f;   // Hz: lower = steadier when standing still
    public float Beta = 0.05f;       // how fast it catches up while moving
    public bool HalfPixel = true;
    public bool SharpText = true;    // bake the text at the real size instead of the fixed resolution
    public float EdgeDarken = 0.45f; // 0 = game's outline, 1 = black outline
}

public sealed unsafe class Plugin : IDalamudPlugin
{
    [PluginService] internal static IDalamudPluginInterface Pi { get; private set; } = null!;
    [PluginService] internal static INamePlateGui NamePlates { get; private set; } = null!;
    [PluginService] internal static IAddonLifecycle Lifecycle { get; private set; } = null!;
    [PluginService] internal static IGameGui GameGui { get; private set; } = null!;
    [PluginService] internal static ICommandManager Commands { get; private set; } = null!;

    private const string Cmd = "/smoothtags";

    // The game hands the addon whole-pixel X/Y every frame, so a plate steps a pixel at a time out of step with the
    // character and flickers ±1px from rounding and head bob. We project the plate's own world anchor ourselves (a float),
    // keep a filtered offset between that and the game's spot, and place the node there instead.
    private struct Plate
    {
        public ulong Id;
        public long Frame;
        public OneEuro Fx, Fy;
        public float Dx, Dy;          // node-space shift from where the game put it
        public float BaseX, BaseY;    // where the game put it
        public float WroteX, WroteY;  // where we put it
    }

    private readonly Plate[] plates = new Plate[AddonNamePlate.NumNamePlateObjects];
    private readonly uint[] edgeWritten = new uint[AddonNamePlate.NumNamePlateObjects];
    private readonly Stopwatch clock = Stopwatch.StartNew();
    private readonly WindowSystem windows = new("SmoothNameplates");
    private readonly ConfigWindow window;
    internal readonly Config Cfg;
    private long frame;
    private double lastT;
    private bool sharpApplied;

    public Plugin()
    {
        Cfg = Pi.GetPluginConfig() as Config ?? new Config();
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
        Array.Clear(edgeWritten);
        NamePlates.RequestRedraw();
    }

    // Before the addon reads the data: readability tweaks.
    private void OnDataUpdate(INamePlateUpdateContext ctx, IReadOnlyList<INamePlateUpdateHandler> handlers)
    {
        var na = (NamePlateNumberArray*)ctx.NumberArrayDataEntryAddress;
        if (na != null)
        {
            if (Cfg.SharpText) na->DisableFixedFontResolution = true;
            if (Cfg.SharpText != sharpApplied)
            {
                if (!Cfg.SharpText) na->DisableFixedFontResolution = false;
                na->ForceNamePlateRebake = true;
                sharpApplied = Cfg.SharpText;
            }
        }

        if (Cfg.EdgeDarken <= 0) return;
        foreach (var h in handlers)
        {
            var i = h.NamePlateIndex;
            if ((uint)i >= edgeWritten.Length) continue;
            var c = h.EdgeColor;
            if (c == edgeWritten[i] && c != 0) continue; // already ours; don't darken twice
            h.EdgeColor = edgeWritten[i] = Darken(c, Cfg.EdgeDarken);
        }
    }

    // After the addon placed its nodes: move them to the smooth position.
    private void OnPostDataUpdate(INamePlateUpdateContext ctx, IReadOnlyList<INamePlateUpdateHandler> handlers)
    {
        frame++;
        var t = clock.Elapsed.TotalSeconds;
        var dt = (float)Math.Clamp(t - lastT, 1e-4, 0.25);
        lastT = t;
        if (!Cfg.Smooth && !Cfg.HalfPixel) return;

        var addon = (AddonNamePlate*)ctx.AddonAddress;
        var na = (NamePlateNumberArray*)ctx.NumberArrayDataEntryAddress;
        var uiModule = UIModule.Instance();
        var ui3d = uiModule != null ? uiModule->GetUI3DModule() : null;
        if (addon == null || na == null || addon->NamePlateObjectArray == null) return;
        var scale = addon->Scale > 0 ? addon->Scale : 1f;
        // the 50 per-plate blocks start after the 6 header ints
        var data = (NamePlateNumberArray.NamePlateObjectIntArrayData*)((int*)na + 6);

        foreach (var h in handlers)
        {
            var i = h.NamePlateIndex;
            if ((uint)i >= plates.Length || (uint)h.ArrayIndex >= 50) continue;
            var node = (AtkResNode*)addon->NamePlateObjectArray[i].RootComponentNode;
            if (node == null) continue;
            ref var p = ref plates[i];
            var d = data + h.ArrayIndex;

            if (p.Id != h.GameObjectId || p.Frame != frame - 1) { p = default; p.Id = h.GameObjectId; }
            p.Frame = frame;

            var gameX = (float)d->X;
            var gameY = (float)d->Y;
            var wantX = gameX;
            var wantY = gameY;

            if (Cfg.Smooth && Anchor(ui3d, h, out var world) && GameGui.WorldToScreen(world, out var s))
            {
                var ox = gameX - s.X;
                var oy = gameY - s.Y;
                // a big jump is a real move (new target, teleport, plate reused): follow it at once
                if (p.Fx.Ready && (MathF.Abs(ox - p.Fx.X) > 40 || MathF.Abs(oy - p.Fy.X) > 40)) { p.Fx = default; p.Fy = default; }
                wantX = s.X + p.Fx.Step(ox, dt, Cfg.MinCutoff, Cfg.Beta);
                wantY = s.Y + p.Fy.Step(oy, dt, Cfg.MinCutoff, Cfg.Beta);
            }

            if (Cfg.HalfPixel)
            {
                wantX = MathF.Round(wantX * 2) / 2;
                wantY = MathF.Round(wantY * 2) / 2;
            }

            p.Dx = (wantX - gameX) / scale;
            p.Dy = (wantY - gameY) / scale;
            Place(node, ref p);
        }
    }

    // Anything that moved a node after our update (the addon's own per-frame update) gets the same shift reapplied.
    private void OnPreDraw(AddonEvent type, AddonArgs args)
    {
        if (!Cfg.Smooth && !Cfg.HalfPixel) return;
        var addon = (AddonNamePlate*)args.Addon.Address;
        if (addon == null || addon->NamePlateObjectArray == null) return;
        for (var i = 0; i < plates.Length; i++)
        {
            ref var p = ref plates[i];
            if (p.Frame != frame || p.Frame == 0) continue;
            var node = (AtkResNode*)addon->NamePlateObjectArray[i].RootComponentNode;
            if (node != null && (node->X != p.WroteX || node->Y != p.WroteY)) Place(node, ref p);
        }
    }

    private static void Place(AtkResNode* node, ref Plate p)
    {
        // if the node still sits where we left it, the game didn't move it this time
        if (node->X != p.WroteX || node->Y != p.WroteY || p.WroteX == 0 && p.WroteY == 0)
        {
            p.BaseX = node->X;
            p.BaseY = node->Y;
        }
        p.WroteX = p.BaseX + p.Dx;
        p.WroteY = p.BaseY + p.Dy;
        node->SetPositionFloat(p.WroteX, p.WroteY);
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

// One Euro filter: heavy smoothing while still, little lag while moving.
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
            changed |= ImGui.SliderFloat("Steadiness (Hz, lower = steadier)", ref c.MinCutoff, 0.3f, 8f, "%.2f");
            changed |= ImGui.SliderFloat("Catch-up while moving", ref c.Beta, 0f, 0.3f, "%.3f");
        }
        changed |= ImGui.Checkbox("Snap to half pixels", ref c.HalfPixel);
        changed |= ImGui.Checkbox("Sharp text (no fixed font resolution)", ref c.SharpText);
        changed |= ImGui.SliderFloat("Darker outline", ref c.EdgeDarken, 0f, 1f, "%.2f");
        if (changed) plugin.Save();
    }
}
