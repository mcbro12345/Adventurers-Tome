using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Numerics;
using Dalamud;
using Dalamud.Bindings.ImGui;
using Dalamud.Configuration;
using Dalamud.Game.Addon.Lifecycle;
using Dalamud.Game.Addon.Lifecycle.AddonArgTypes;
using Dalamud.Game.Command;
using Dalamud.Game.Gui.NamePlate;
using Dalamud.Interface.ManagedFontAtlas;
using Dalamud.Interface.Windowing;
using Dalamud.IoC;
using Dalamud.Plugin;
using Dalamud.Plugin.Services;
using FFXIVClientStructs.FFXIV.Client.Graphics;
using FFXIVClientStructs.FFXIV.Client.UI;
using FFXIVClientStructs.FFXIV.Client.UI.Arrays;
using FFXIVClientStructs.FFXIV.Component.GUI;
using Lumina.Excel.Sheets;

namespace SmoothNameplates;

[Serializable]
public sealed class Config : IPluginConfiguration
{
    public int Version { get; set; } = 3;

    // WoW-style text: the game's (and other plugins') text and colours, drawn as smooth vector-like text
    public bool WowText = true;
    public string FontPath = "";     // e.g. your own FRIZQT__.TTF; empty = Dalamud's Noto Sans
    public float TextScale = 1.0f;
    public bool Outline = true;      // WoW's "NORMAL" outline (SystemFont_NamePlate_Outlined)
    public float OutlinePx = 1.0f;
    public bool Shadow = false;

    // WoW's nameplate CVars, at their client defaults (Ketho/BlizzardInterfaceResources, Resources/CVars.lua)
    public bool WowDistance = true;
    public float MaxDistance = 60f;        // nameplateMaxDistance
    public float MaxScale = 1.0f;          // nameplateMaxScale
    public float MaxScaleDistance = 10f;   // nameplateMaxScaleDistance (from the camera)
    public float MinScale = 0.8f;          // nameplateMinScale
    public float MinScaleDistance = 10f;   // nameplateMinScaleDistance (back from the max distance)
    public float SelectedScale = 1.2f;     // nameplateSelectedScale
    public float MaxAlpha = 1.0f;          // nameplateMaxAlpha
    public float MaxAlphaDistance = 40f;   // nameplateMaxAlphaDistance
    public float MinAlpha = 0.6f;          // nameplateMinAlpha
    public float MinAlphaDistance = 10f;   // nameplateMinAlphaDistance
    public float SelectedAlpha = 1.0f;     // nameplateSelectedAlpha
    public float NotSelectedAlpha = -1f;   // nameplateNotSelectedAlpha (negative = unused)
    public float TopInset = 0.08f;         // nameplateTopInset
    public float BottomInset = 0.10f;      // nameplateBottomInset

    // placement
    public bool SteadyAnchor = true;       // hang the name on a steady point, not the bobbing head
    public bool HalfPixel = false;
    public int ForceLag = -1;              // -1 = work it out

    // game-side readability
    public bool SharpText = false;         // bake the game's text at the real size instead of the fixed resolution
    public float EdgeDarken = 0.45f;       // 0 = game's outline, 1 = black outline
}

public sealed unsafe class Plugin : IDalamudPlugin
{
    [PluginService] internal static IDalamudPluginInterface Pi { get; private set; } = null!;
    [PluginService] internal static INamePlateGui NamePlates { get; private set; } = null!;
    [PluginService] internal static IAddonLifecycle Lifecycle { get; private set; } = null!;
    [PluginService] internal static IGameGui GameGui { get; private set; } = null!;
    [PluginService] internal static ICommandManager Commands { get; private set; } = null!;
    [PluginService] internal static IDataManager DataManager { get; private set; } = null!;
    [PluginService] internal static ITargetManager Targets { get; private set; } = null!;
    [PluginService] internal static IPluginLog Log { get; private set; } = null!;

    private const string Cmd = "/smoothtags";
    private const int Count = 50;

    // WoW (nameplateMotion 0) places every plate exactly where its overhead point projects, every frame, with the
    // frame's own camera. FFXIV instead hands the addon whole-pixel X/Y worked out from an older camera and a point that
    // bobs with the head. So we keep, per plate:
    //  - O: the game's spot minus our projection of the game's own anchor, from the frame the game actually used. That's
    //    only the plate's layout, so it filters hard without lag.
    //  - D: the game anchor's offset from the character's position, averaged slowly in world space, so the point we
    //    project is steady instead of bobbing.
    // and at draw time put the plate at project(position + D) + O.
    private const int Lags = 3; // candidate delays, in updates
    private sealed class Plate
    {
        public ulong Id;
        public bool Live;
        public Vector3 GameAnchor, Position, D;
        public bool HasPosition, DReady;
        public float CameraDistance;
        public float GameX, GameY;                       // the game's whole-pixel spot this update
        public readonly Vector2[] S = new Vector2[Lags]; // projections of the game anchor, newest first
        public int History;
        public readonly OneEuro[] Ox = new OneEuro[Lags], Oy = new OneEuro[Lags];
        public readonly Vector2[] LastRaw = new Vector2[Lags];
        public float IconDx, MarkerDy;                   // keep the name icon and the marker above clear of our text

        public void Reset(ulong id)
        {
            Id = id; History = 0; DReady = false;
            Array.Clear(Ox); Array.Clear(Oy);
        }
    }

    private readonly Plate[] plates = CreatePlates();
    private static Plate[] CreatePlates() { var a = new Plate[Count]; for (var i = 0; i < Count; i++) a[i] = new Plate(); return a; }
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

    // shown in the settings window
    internal int UpdatesPerSec, DrawsPerSec, NamesDrawn;
    private int updates, draws;
    private double statT;

    public Plugin()
    {
        Cfg = Pi.GetPluginConfig() as Config ?? new Config();
        if (Cfg.Version < 3) Cfg = new Config();
        window = new ConfigWindow(this);
        windows.AddWindow(window);
        Pi.UiBuilder.Draw += windows.Draw;
        Pi.UiBuilder.OpenConfigUi += window.Toggle;
        Pi.UiBuilder.OpenMainUi += window.Toggle;
        Commands.AddHandler(Cmd, new CommandInfo((_, _) => window.Toggle()) { HelpMessage = "Smooth Nameplates settings." });
        NamePlates.OnDataUpdate += OnDataUpdate;
        NamePlates.OnPostDataUpdate += OnPostDataUpdate;
        Lifecycle.RegisterListener(AddonEvent.PreDraw, "NamePlate", OnPreDraw);
        Lifecycle.RegisterListener(AddonEvent.PostDraw, "NamePlate", OnPostDraw);
        Pi.UiBuilder.Draw += DrawNames;
        uiColors = LoadUiColors();
        BuildFont();
        NamePlates.RequestRedraw();
    }

    public void Dispose()
    {
        Lifecycle.UnregisterListener(AddonEvent.PreDraw, "NamePlate", OnPreDraw);
        Lifecycle.UnregisterListener(AddonEvent.PostDraw, "NamePlate", OnPostDraw);
        Pi.UiBuilder.Draw -= DrawNames;
        RestoreHidden();
        font?.Dispose();
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

    internal void ResetToWow()
    {
        var keep = (Cfg.FontPath, Cfg.TextScale);
        var d = new Config();
        foreach (var f in typeof(Config).GetFields()) f.SetValue(Cfg, f.GetValue(d));
        (Cfg.FontPath, Cfg.TextScale) = keep;
        Save();
    }

    private static NamePlateNumberArray.NamePlateObjectIntArrayData* Data(NamePlateNumberArray* na, int arrayIndex) =>
        (NamePlateNumberArray.NamePlateObjectIntArrayData*)((int*)na + 6) + arrayIndex; // the 50 blocks follow 6 header ints

    // ---- game-side tweaks, before the addon reads the data; nothing here may force a rebake every frame ----

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
            // written into the data without raising the update flag: the addon picks it up whenever the game itself
            // says the colours changed, instead of us asking for a redraw every frame
            var d = Data(na, ai);
            var c = d->NameEdgeColor;
            if (c == edgeOurs[ai]) continue;
            d->NameEdgeColor = edgeOurs[ai] = Darken(c, Cfg.EdgeDarken);
        }
    }

    // ---- tracking, after the addon placed its nodes ----

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
        var dAlpha = 1 - MathF.Exp(-dt / 0.4f); // the head offset settles over ~0.4 s: steadier than any walk bob

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

            UI3DModule.ObjectInfo* info = null;
            if (ui3d != null && h.ArrayIndex < ui3d->NamePlateObjectInfoCount)
                info = ui3d->NamePlateObjectInfoPointers[h.ArrayIndex].Value;
            var go = h.GameObject;
            if (info != null) { p.GameAnchor = info->NamePlatePos; p.CameraDistance = info->DistanceFromCamera; }
            else if (go != null) p.GameAnchor = go.Position;
            else { p.Reset(p.Id); continue; }

            p.HasPosition = go != null;
            if (go != null)
            {
                p.Position = go.Position;
                var raw = p.GameAnchor - p.Position;
                // a real change (mounting, sitting, a different model) is taken at once
                if (!p.DReady || Vector3.Distance(raw, p.D) > 0.6f) { p.D = raw; p.DReady = true; }
                else p.D += (raw - p.D) * dAlpha;
            }

            if (!GameGui.WorldToScreen(p.GameAnchor, out var s)) { p.Reset(p.Id); continue; }
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
                p.Ox[k].Step(ox, dt, 1.0f, 0.05f);
                p.Oy[k].Step(oy, dt, 1.0f, 0.05f);
            }
        }
        for (var i = 0; i < Count; i++)
            if (!seen[i]) plates[i].Live = false;

        // which delay leaves the steadiest offset; only learnt while things move, when standing still they all look alike
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

    // Where the game's spot for this plate should be right now: project(steady point) + layout offset.
    private bool Spot(Plate p, out Vector2 spot)
    {
        spot = default;
        var k = Math.Min(Lag, p.History - 1);
        if (!p.Live || k < 0 || !p.Ox[k].Ready) return false;
        var world = Cfg.SteadyAnchor && p.HasPosition && p.DReady ? p.Position + p.D : p.GameAnchor;
        if (!GameGui.WorldToScreen(world, out var s)) return false;
        spot = new Vector2(s.X + p.Ox[k].X, s.Y + p.Oy[k].X);
        if (Cfg.HalfPixel) spot = new Vector2(MathF.Round(spot.X * 2) / 2, MathF.Round(spot.Y * 2) / 2);
        return true;
    }

    // ---- right before the plates draw: read the names, then move the game's remaining parts (icons, gauges) ----

    private void OnPreDraw(AddonEvent type, AddonArgs args)
    {
        draws++;
        var t = clock.Elapsed.TotalSeconds;
        if (t - statT >= 1) { UpdatesPerSec = updates; DrawsPerSec = draws; updates = draws = 0; statT = t; }

        var addon = (AddonNamePlate*)args.Addon.Address;
        if (addon == null || addon->NamePlateObjectArray == null) return;

        CollectNames(addon); // reads the nodes where the game (and other plugins) put them

        for (var i = 0; i < Count; i++)
        {
            ref var obj = ref addon->NamePlateObjectArray[i];
            var root = obj.RootComponentNode;
            if (root == null) continue;
            var p = plates[i];
            float dx = 0, dy = 0;
            if (Spot(p, out var spot)) { dx = spot.X - p.GameX; dy = spot.Y - p.GameY; }
            if (dx == 0 && dy == 0 && p.IconDx == 0 && p.MarkerDy == 0 && !shifts.ContainsKey((nint)root)) continue;

            // The game already turned X/Y into screen positions for this frame, so shift those finished positions.
            Shift((AtkResNode*)root, dx, dy);
            var comp = root->Component;
            if (comp == null) continue;
            var list = comp->UldManager.NodeList;
            var icon = (AtkResNode*)obj.NameIcon;
            var marker = (AtkResNode*)obj.MarkerIcon;
            for (var n = 0; list != null && n < comp->UldManager.NodeListCount; n++)
            {
                var node = list[n];
                if (node == null) continue;
                Shift(node, node == icon ? dx + p.IconDx : dx, node == marker ? dy + p.MarkerDy : dy);
            }
        }
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

    // ---- WoW-style text ----
    // Read each name's final text, colours, size, alignment and fade (whatever the game and other plugins made of it),
    // hide only the game's text node while the plates draw, and draw the same text ourselves.

    private const float BakePx = 36; // glyphs are baked this big and drawn smaller, so scaling stays smooth
    private IFontHandle? font;
    private string builtFontPath = "";
    private readonly uint[]? uiColors;

    private sealed class NameDraw
    {
        public int Plate;
        public List<Line> Lines = null!;
        public float[] Widths = null!;
        public Vector2 Rel;   // the text's alignment point relative to the game's spot
        public int Align;
        public float Px, Alpha;
    }

    private readonly List<NameDraw> pending = new();
    private bool fresh;
    private bool drawRan;
    private int missedDraws;
    private readonly List<nint> hidden = new();
    private readonly List<(Vector2 Min, Vector2 Max)> openWindows = new();

    private static uint[]? LoadUiColors()
    {
        try
        {
            var sheet = DataManager.GetExcelSheet<UIColor>();
            uint max = 0;
            foreach (var r in sheet) max = Math.Max(max, r.RowId);
            var a = new uint[max + 1];
            // sheet colours are 0xRRGGBBAA; ImGui wants 0xAABBGGRR
            foreach (var r in sheet) a[r.RowId] = System.Buffers.Binary.BinaryPrimitives.ReverseEndianness(r.Dark);
            return a;
        }
        catch (Exception e) { Log.Warning(e, "UIColor sheet unavailable"); return null; }
    }

    internal void BuildFont()
    {
        font?.Dispose();
        builtFontPath = Cfg.FontPath;
        var path = Cfg.FontPath.Trim().Trim('"');
        font = Pi.UiBuilder.FontAtlas.NewDelegateFontHandle(e => e.OnPreBuild(tk =>
        {
            var cfg = new SafeFontConfig
            {
                SizePx = BakePx, OversampleH = 3, OversampleV = 2, PixelSnapH = false,
                GlyphRanges = [0x0020, 0x024F, 0x2000, 0x206F, 0x2190, 0x21FF, 0x2460, 0x24FF, 0x25A0, 0x26FF, 0],
            };
            ImFontPtr f;
            if (path.Length > 0 && File.Exists(path)) f = tk.AddFontFromFile(path, cfg);
            else f = tk.AddDalamudAssetFont(DalamudAsset.NotoSansCjkMedium, cfg);
            // the game's private-use symbols (cross-world mark etc.) and Japanese
            tk.AddGameSymbol(new SafeFontConfig { SizePx = BakePx, OversampleH = 3, OversampleV = 2, PixelSnapH = false, MergeFont = f });
            tk.AttachExtraGlyphsForDalamudLanguage(new SafeFontConfig { SizePx = BakePx, OversampleH = 2, PixelSnapH = false, MergeFont = f });
        }));
    }

    // Open, focusable windows (inventory, character, ...) cover the plates; HUD layers don't count.
    private void CollectWindows()
    {
        openWindows.Clear();
        var stage = AtkStage.Instance();
        if (stage == null || stage->RaptureAtkUnitManager == null) return;
        ref var list = ref stage->RaptureAtkUnitManager->AtkUnitManager.FocusedUnitsList;
        for (var i = 0; i < list.Count; i++)
        {
            var u = list.Entries[i].Value;
            if (u == null || !u->IsVisible || u->RootNode == null) continue;
            var sc = u->Scale > 0 ? u->Scale : 1;
            var min = new Vector2(u->X, u->Y);
            var size = new Vector2(u->RootNode->Width, u->RootNode->Height) * sc;
            if (size.X > 1 && size.Y > 1) openWindows.Add((min, min + size));
        }
    }

    private bool UnderWindow(Vector2 min, Vector2 max)
    {
        foreach (var (a, b) in openWindows)
            if (min.X < b.X && max.X > a.X && min.Y < b.Y && max.Y > a.Y) return true;
        return false;
    }

    private void CollectNames(AddonNamePlate* addon)
    {
        pending.Clear();
        RestoreHidden();
        foreach (var p in plates) { p.IconDx = 0; p.MarkerDy = 0; }
        // our draw keeps not running (plugin UI hidden): leave the game's text alone then
        missedDraws = drawRan ? 0 : missedDraws + 1;
        drawRan = false;
        fresh = false;
        if (!Cfg.WowText || font is not { Available: true } || !addon->IsVisible || missedDraws > 1) return;
        fresh = true;
        CollectWindows();
        using var locked = font.Lock();
        var f = locked.ImFont;

        var targetId = Targets.Target?.GameObjectId;
        for (var i = 0; i < Count; i++)
        {
            ref var obj = ref addon->NamePlateObjectArray[i];
            var text = obj.NameText;
            var p = plates[i];
            if (text == null || obj.RootComponentNode == null || !p.Live) continue;

            // visibility and fade come from the whole chain, so the game's (and plugins') fades keep working
            float alpha = 1, scale = 1;
            var visible = true;
            for (var n = (AtkResNode*)text; n != null; n = n->ParentNode)
            {
                if (!n->IsVisible()) { visible = false; break; }
                alpha *= n->Color.A / 255f;
                scale *= n->ScaleX;
            }
            if (!visible || alpha <= 0.01f) continue;
            var uiScale = addon->Scale > 0 ? addon->Scale : 1;
            scale *= uiScale;

            var bytes = text->NodeText.AsSpan();
            if (bytes.Length == 0) continue;
            var lines = TextRenderer.Parse(bytes, Rgba(text->TextColor), Rgba(text->EdgeColor), uiColors);
            if (lines.Count == 0) continue;

            var min = new Vector2(text->ScreenX, text->ScreenY);
            var size = new Vector2(text->Width, text->Height) * scale;
            var align = text->AlignmentFontType & 0xF;
            var point = new Vector2(
                (align % 3) switch { 0 => min.X, 1 => min.X + size.X / 2, _ => min.X + size.X },
                (align / 3) switch { 0 => min.Y, 1 => min.Y + size.Y / 2, _ => min.Y + size.Y });

            float px;
            if (Cfg.WowDistance)
            {
                // WoW sizes and fades by distance from the camera instead of the game's own shrinking
                var selected = targetId == p.Id;
                px = text->FontSize * uiScale * (selected ? Cfg.SelectedScale : WowScale(p.CameraDistance));
                alpha *= selected ? Cfg.SelectedAlpha
                       : targetId != null && Cfg.NotSelectedAlpha >= 0 ? Cfg.NotSelectedAlpha
                       : WowAlpha(p.CameraDistance);
            }
            else px = text->FontSize * scale;
            px = MathF.Max(4, px * Cfg.TextScale);

            hidden.Add((nint)text);
            text->NodeFlags &= ~NodeFlags.Visible;
            // under an open window the game would have drawn it beneath that window: draw nothing there
            if (UnderWindow(min, min + size)) continue;

            var sc = px / BakePx;
            var widths = new float[lines.Count];
            float ours = 0;
            for (var l = 0; l < lines.Count; l++)
            {
                foreach (var r in lines[l].Runs) widths[l] += TextRenderer.Measure(f, r.Text, sc);
                ours = MathF.Max(ours, widths[l]);
            }
            // the game put its name icon beside its own text width; keep it beside ours instead
            var theirs = obj.TextW > 0 ? obj.TextW * scale : size.X;
            var grow = ours - theirs;
            p.IconDx = (align % 3) switch { 0 => 0, 1 => -grow / 2, _ => -grow };
            // text that grows upwards (bottom-aligned, the usual) pushes the marker above it up as much
            var growH = px * 1.15f * lines.Count - size.Y;
            if (align / 3 == 2 && growH > 0) p.MarkerDy = -growH;

            pending.Add(new NameDraw
            {
                Plate = i, Lines = lines, Widths = widths, Rel = point - new Vector2(p.GameX, p.GameY), Align = align,
                Px = px, Alpha = Math.Clamp(alpha, 0, 1),
            });
        }
    }

    private float WowScale(float d)
    {
        var far = Cfg.MaxDistance - Cfg.MinScaleDistance;
        if (d <= Cfg.MaxScaleDistance) return Cfg.MaxScale;
        if (d >= far) return Cfg.MinScale;
        return Cfg.MaxScale + (Cfg.MinScale - Cfg.MaxScale) * (d - Cfg.MaxScaleDistance) / MathF.Max(1, far - Cfg.MaxScaleDistance);
    }

    private float WowAlpha(float d)
    {
        var far = Cfg.MaxDistance - Cfg.MinAlphaDistance;
        if (d <= Cfg.MaxAlphaDistance) return Cfg.MaxAlpha;
        if (d >= far) return Cfg.MinAlpha;
        return Cfg.MaxAlpha + (Cfg.MinAlpha - Cfg.MaxAlpha) * (d - Cfg.MaxAlphaDistance) / MathF.Max(1, far - Cfg.MaxAlphaDistance);
    }

    // The game's text nodes are only hidden while the plates draw, so the next update (and other plugins) see them as usual.
    private void OnPostDraw(AddonEvent type, AddonArgs args) => RestoreHidden();

    private void RestoreHidden()
    {
        foreach (var n in hidden) ((AtkResNode*)n)->NodeFlags |= NodeFlags.Visible;
        hidden.Clear();
    }

    private static uint Rgba(ByteColor c) => (uint)(c.R | (c.G << 8) | (c.B << 16) | (c.A << 24));

    private void DrawNames()
    {
        drawRan = true;
        // rebuild once the typed path is empty or names a real file, not on every keystroke
        var want = Cfg.FontPath.Trim().Trim('"');
        if (builtFontPath != Cfg.FontPath && (want.Length == 0 || File.Exists(want))) BuildFont();
        // nothing new since the last frame (UI hidden, plates not drawn): draw nothing rather than stale names
        if (!fresh) return;
        fresh = false;
        NamesDrawn = 0;
        if (pending.Count == 0 || font is not { Available: true }) return;
        using var locked = font.Lock();
        var f = locked.ImFont;
        var dl = ImGui.GetBackgroundDrawList();
        var screen = ImGui.GetMainViewport().Size;
        var outline = Cfg.Outline ? Cfg.OutlinePx : 0;
        var shadow = Cfg.Shadow ? new Vector2(1, 1) : Vector2.Zero;

        foreach (var d in pending)
        {
            var p = plates[d.Plate];
            // projected now, with the camera of the frame being shown
            var spot = Spot(p, out var s) ? s : new Vector2(p.GameX, p.GameY);
            var point = spot + d.Rel;

            var sc = d.Px / BakePx;
            var lineH = d.Px * 1.15f;
            var totalH = lineH * d.Lines.Count;
            var col = d.Align % 3;
            var y = (d.Align / 3) switch { 0 => point.Y, 1 => point.Y - totalH / 2, _ => point.Y - totalH };
            // WoW clamps plates inside the top and bottom insets
            y = Math.Clamp(y, screen.Y * Cfg.TopInset, MathF.Max(screen.Y * Cfg.TopInset, screen.Y * (1 - Cfg.BottomInset) - totalH));

            // shadow, then outline, then fill, so no letter's outline covers its neighbour's fill
            for (var pass = 0; pass < 3; pass++)
                for (var l = 0; l < d.Lines.Count; l++)
                {
                    var w = d.Widths[l];
                    var x = col switch { 0 => point.X, 1 => point.X - w / 2, _ => point.X - w };
                    var pen = new Vector2(x, y + l * lineH + (lineH - d.Px) / 2);
                    foreach (var r in d.Lines[l].Runs)
                        pen = TextRenderer.DrawRun(dl, f, pen, r.Text, sc,
                            TextRenderer.WithAlpha(r.Color, d.Alpha), TextRenderer.WithAlpha(r.Edge, d.Alpha),
                            outline, shadow, TextRenderer.WithAlpha(0xFF000000, d.Alpha * 0.8f), pass);
                }
            NamesDrawn++;
        }
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
        changed |= ImGui.Checkbox("WoW-style text", ref c.WowText);
        if (c.WowText)
        {
            ImGui.SetNextItemWidth(260);
            if (ImGui.InputText("Font file (.ttf/.otf)", ref c.FontPath, 512)) changed = true;
            ImGui.TextDisabled("  e.g. your own copy of WoW's FRIZQT__.TTF; empty uses Noto Sans");
            changed |= ImGui.SliderFloat("Text size", ref c.TextScale, 0.6f, 2f, "%.2f");
            changed |= ImGui.Checkbox("Outline", ref c.Outline);
            if (c.Outline) changed |= ImGui.SliderFloat("Outline width", ref c.OutlinePx, 0.5f, 2.5f, "%.2f px");
            changed |= ImGui.Checkbox("Drop shadow", ref c.Shadow);
            changed |= ImGui.Checkbox("WoW distance scale and fade", ref c.WowDistance);
            if (c.WowDistance && ImGui.TreeNode("WoW nameplate settings"))
            {
                changed |= ImGui.SliderFloat("nameplateMaxDistance", ref c.MaxDistance, 10, 100, "%.0f");
                changed |= ImGui.SliderFloat("nameplateMaxScale", ref c.MaxScale, 0.3f, 2, "%.2f");
                changed |= ImGui.SliderFloat("nameplateMaxScaleDistance", ref c.MaxScaleDistance, 0, 60, "%.0f");
                changed |= ImGui.SliderFloat("nameplateMinScale", ref c.MinScale, 0.3f, 2, "%.2f");
                changed |= ImGui.SliderFloat("nameplateMinScaleDistance", ref c.MinScaleDistance, 0, 60, "%.0f");
                changed |= ImGui.SliderFloat("nameplateSelectedScale", ref c.SelectedScale, 0.5f, 2, "%.2f");
                changed |= ImGui.SliderFloat("nameplateMaxAlpha", ref c.MaxAlpha, 0, 1, "%.2f");
                changed |= ImGui.SliderFloat("nameplateMaxAlphaDistance", ref c.MaxAlphaDistance, 0, 100, "%.0f");
                changed |= ImGui.SliderFloat("nameplateMinAlpha", ref c.MinAlpha, 0, 1, "%.2f");
                changed |= ImGui.SliderFloat("nameplateMinAlphaDistance", ref c.MinAlphaDistance, 0, 60, "%.0f");
                changed |= ImGui.SliderFloat("nameplateSelectedAlpha", ref c.SelectedAlpha, 0, 1, "%.2f");
                changed |= ImGui.SliderFloat("nameplateNotSelectedAlpha", ref c.NotSelectedAlpha, -1, 1, "%.2f");
                changed |= ImGui.SliderFloat("nameplateTopInset", ref c.TopInset, 0, 0.5f, "%.2f");
                changed |= ImGui.SliderFloat("nameplateBottomInset", ref c.BottomInset, 0, 0.5f, "%.2f");
                ImGui.TreePop();
            }
            ImGui.Separator();
        }
        changed |= ImGui.Checkbox("Steady anchor (no head bob)", ref c.SteadyAnchor);
        changed |= ImGui.Checkbox("Snap to half pixels", ref c.HalfPixel);
        changed |= ImGui.Checkbox("Sharp game text (no fixed font resolution)", ref c.SharpText);
        if (c.SharpText && plugin.SharpGaveUp) ImGui.TextDisabled("  The game keeps turning this back off, so it's paused.");
        changed |= ImGui.SliderFloat("Darker outline", ref c.EdgeDarken, 0f, 1f, "%.2f");
        changed |= ImGui.SliderInt("Frames behind (-1 = auto)", ref c.ForceLag, -1, 2);
        if (ImGui.Button("Reset to WoW defaults")) plugin.ResetToWow();
        if (changed) plugin.Save();
        ImGui.Separator();
        ImGui.TextDisabled($"Nameplate updates/s: {plugin.UpdatesPerSec}   draws/s: {plugin.DrawsPerSec}   names drawn: {plugin.NamesDrawn}");
        ImGui.TextDisabled($"Game is {plugin.Lag} frame(s) behind" + (c.ForceLag < 0 ? " (auto)" : ""));
    }
}
