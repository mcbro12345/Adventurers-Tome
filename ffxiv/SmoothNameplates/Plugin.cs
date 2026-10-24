using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Numerics;
using Dalamud;
using Dalamud.Bindings.ImGui;
using Dalamud.Game.Addon.Lifecycle;
using Dalamud.Game.Addon.Lifecycle.AddonArgTypes;
using Dalamud.Game.Command;
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

// WoW-style name tags for FFXIV.
//
// Every frame, right before the game draws its name tags (by then the game and every other plugin have set their
// text, colours, fades and layout), this reads each tag's name text, hides only that text node while the tags draw,
// and draws the same text itself with smooth, float-positioned glyphs. The rest of each tag (icons, gauges) stays the
// game's, moved along with the text.
//
// Placement follows WoW (nameplateMotion 0): each frame a tag sits exactly where its overhead point projects with
// that frame's camera. The point is the character's position plus a slowly averaged head height (the game's own point
// bobs with the walk), projected with the camera's clean projection (no anti-aliasing shake). The offset between the
// game's point and where the game put the text is the tag's layout; it's filtered, so the game's whole-pixel rounding
// doesn't come through.
public sealed unsafe class Plugin : IDalamudPlugin
{
    [PluginService] internal static IDalamudPluginInterface Pi { get; private set; } = null!;
    [PluginService] internal static IAddonLifecycle Lifecycle { get; private set; } = null!;
    [PluginService] internal static ICommandManager Commands { get; private set; } = null!;
    [PluginService] internal static IDataManager DataManager { get; private set; } = null!;
    [PluginService] internal static ITargetManager Targets { get; private set; } = null!;
    [PluginService] internal static IPluginLog Log { get; private set; } = null!;

    private const string Cmd = "/smoothtags";
    private const int Count = 50;
    private const float BakePx = 36; // glyphs are baked this big and drawn smaller, so scaling stays smooth

    internal Config Cfg;
    private readonly WindowSystem windows = new("SmoothNameplates");
    private readonly ConfigWindow window;
    private readonly Stopwatch clock = Stopwatch.StartNew();
    private readonly uint[]? uiColors;
    private IFontHandle? font;
    private string builtFontPath = "";

    private sealed class Plate
    {
        public nint Object;
        public double SeenT;
        public Vector3 D;          // head point minus position, averaged
        public bool DReady;
        public OneEuro Rx, Ry;     // the game's text spot minus its projected head point
    }

    private readonly Plate[] plates = Enumerable.Range(0, Count).Select(_ => new Plate()).ToArray();
    private double lastT;

    // what the overlay draws: one per frame the tags were laid out
    private sealed class Line
    {
        public List<Run> Runs = null!;
        public Vector2 Pen;    // left end of the line's box
    }

    private sealed class Name
    {
        public List<Line> Lines = new();
        public float Px, Alpha;
        public Vector2 Min, Max;
        public string Debug = "";
    }

    private sealed class Frame
    {
        public List<Name> Names = new();
        public List<(Vector2 Min, Vector2 Max)> Hud = new();
    }

    private readonly Frame[] frames = { new(), new(), new() }; // newest first
    private Vector2 viewportOrigin;
    private double lastDrawT = -1;
    private readonly List<nint> hidden = new();
    private readonly Dictionary<nint, (float WroteX, float WroteY, float Dx, float Dy)> shifts = new();

    internal bool AlignmentTest, DebugLabels;
    internal int FramesPerSec, NamesDrawn;
    internal string Funnel = ""; // where names drop out, for the settings window
    private int frameCount;
    private double statT;

    public Plugin()
    {
        Cfg = Pi.GetPluginConfig() as Config is { Version: Config.Current } c ? c : new Config();
        window = new ConfigWindow(this);
        windows.AddWindow(window);
        uiColors = LoadUiColors();
        BuildFont();

        // name tags show in cutscenes, gpose and with plugin UI hidden as the game decides; so must our text
        Pi.UiBuilder.DisableAutomaticUiHide = true;
        Pi.UiBuilder.Draw += Draw;
        Pi.UiBuilder.Draw += windows.Draw;
        Pi.UiBuilder.OpenConfigUi += window.Toggle;
        Pi.UiBuilder.OpenMainUi += window.Toggle;
        Commands.AddHandler(Cmd, new CommandInfo((_, _) => window.Toggle()) { HelpMessage = "Smooth Nameplates settings." });
        Lifecycle.RegisterListener(AddonEvent.PreDraw, "NamePlate", OnPreDraw);
        Lifecycle.RegisterListener(AddonEvent.PostDraw, "NamePlate", OnPostDraw);
    }

    public void Dispose()
    {
        Lifecycle.UnregisterListener(AddonEvent.PreDraw, "NamePlate", OnPreDraw);
        Lifecycle.UnregisterListener(AddonEvent.PostDraw, "NamePlate", OnPostDraw);
        Commands.RemoveHandler(Cmd);
        Pi.UiBuilder.Draw -= Draw;
        Pi.UiBuilder.Draw -= windows.Draw;
        Pi.UiBuilder.OpenConfigUi -= window.Toggle;
        Pi.UiBuilder.OpenMainUi -= window.Toggle;
        windows.RemoveAllWindows();
        RestoreHidden();
        font?.Dispose();
    }

    internal void Save() => Pi.SavePluginConfig(Cfg);

    internal void Reset()
    {
        var keep = (Cfg.FontPath, Cfg.TextScale);
        Cfg = new Config { FontPath = keep.FontPath, TextScale = keep.TextScale };
        Save();
    }

    // ---- each frame, right before the tags draw (game thread) ----

    private void OnPreDraw(AddonEvent type, AddonArgs args)
    {
        var t = clock.Elapsed.TotalSeconds;
        var dt = (float)Math.Clamp(t - lastT, 1e-4, 0.25);
        lastT = t;
        frameCount++;
        if (t - statT >= 1) { FramesPerSec = frameCount; frameCount = 0; statT = t; }

        RestoreHidden();
        var frame = new Frame();
        var addon = (AddonNamePlate*)args.Addon.Address;
        var ui = UIModule.Instance();
        var ui3d = ui != null ? ui->GetUI3DModule() : null;
        var view = View.Capture();
        // our overlay hasn't drawn lately (it can't, for some reason): leave the game's text alone
        var overlayAlive = t - lastDrawT < 0.25;
        var numbers = NamePlateNumberArray.Instance();
        if (addon == null || addon->NamePlateObjectArray == null || ui3d == null || numbers == null || !view.Ok || !addon->IsVisible
            || font is not { Available: true } || !overlayAlive)
        {
            Funnel = $"waiting: addon {(addon != null && addon->IsVisible ? "ok" : "hidden")}, 3D {(ui3d != null ? "ok" : "none")}, " +
                     $"data {(numbers != null ? "ok" : "none")}, camera {(view.Ok ? "ok" : "none")}, " +
                     $"font {(font is { Available: true } ? "ok" : "loading")}, overlay {(overlayAlive ? "ok" : "not drawing")}";
            Publish(frame);
            return;
        }
        int active = 0, withObject = 0, shown = 0;

        using var locked = font.Lock();
        var f = locked.ImFont;
        var targetAddress = Targets.Target?.Address ?? 0;
        var uiScale = addon->Scale > 0 ? addon->Scale : 1;

        // entry k of the nameplate data goes with the 3D module's entry k; the data says which tag (0-49) it fills
        var data = (NamePlateNumberArray.NamePlateObjectIntArrayData*)((int*)numbers + 6); // 50 blocks after 6 header ints
        var activeCount = Math.Min(Math.Min(numbers->ActiveNamePlateCount, ui3d->NamePlateObjectInfoCount), Count);
        for (var k = 0; k < activeCount; k++)
        {
            active++;
            var info = ui3d->NamePlateObjectInfoPointers[k].Value;
            var i = data[k].NamePlateObjectIndex;
            if (info == null || info->GameObject == null || (uint)i >= Count) continue;
            withObject++;
            ref var obj = ref addon->NamePlateObjectArray[i];
            var text = obj.NameText;
            var root = obj.RootComponentNode;
            if (text == null || root == null) continue;

            // the game's (and plugins') visibility, fade and size for this name
            float alpha = 1, scale = 1;
            var visible = true;
            for (var n = (AtkResNode*)text; n != null; n = n->ParentNode)
            {
                if (!n->IsVisible()) { visible = false; break; }
                alpha *= n->Color.A / 255f;
                scale *= n->ScaleX;
            }
            if (!visible || alpha <= 0.01f) continue;
            shown++;
            var bytes = text->NodeText.AsSpan();
            if (bytes.Length == 0) continue;
            var lines = TextRenderer.Parse(bytes, Rgba(text->TextColor), Rgba(text->EdgeColor), uiColors);
            if (lines.Count == 0) continue;

            var p = plates[i];
            if (p.Object != (nint)info->GameObject || t - p.SeenT > 0.2)
            {
                p.Object = (nint)info->GameObject;
                p.DReady = false;
                p.Rx = default;
                p.Ry = default;
            }
            p.SeenT = t;

            // the steady point: position plus the head offset averaged over ~0.4 s (a real change, like mounting, at once)
            Vector3 head = info->NamePlatePos;
            Vector3 position = info->GameObject->Position;
            var raw = head - position;
            if (!p.DReady || Vector3.Distance(raw, p.D) > 0.6f) { p.D = raw; p.DReady = true; }
            else p.D += (raw - p.D) * (1 - MathF.Exp(-dt / 0.4f));

            // where the game put the text (before any shift of ours) and where its alignment point is
            var nativeMin = Native((AtkResNode*)text);
            var box = new Vector2(text->Width, text->Height) * scale;
            var align = text->AlignmentFontType & 0xF;
            var nativePoint = nativeMin + new Vector2(
                (align % 3) switch { 0 => 0, 1 => box.X / 2, _ => box.X },
                (align / 3) switch { 0 => 0, 1 => box.Y / 2, _ => box.Y });

            if (!view.Project(head, viewportOrigin, out var headOnScreen) ||
                !view.Project(position + p.D, viewportOrigin, out var steadyOnScreen)) continue;
            var rel = nativePoint - headOnScreen;
            if (p.Rx.Ready && (MathF.Abs(rel.X - p.Rx.X) > 30 || MathF.Abs(rel.Y - p.Ry.X) > 30)) { p.Rx = default; p.Ry = default; }
            var point = steadyOnScreen + new Vector2(p.Rx.Step(rel.X, dt, 0.5f, 0.02f), p.Ry.Step(rel.Y, dt, 0.5f, 0.02f));

            // WoW sizes and fades by distance from the camera; the target is bigger and fully opaque
            var distance = Vector3.Distance(view.Position, head);
            var selected = targetAddress != 0 && targetAddress == (nint)info->GameObject;
            var px = text->FontSize * uiScale * (selected ? Cfg.SelectedScale : WowScale(distance)) * Cfg.TextScale;
            px = MathF.Max(4, px);
            alpha *= selected ? Cfg.SelectedAlpha
                   : targetAddress != 0 && Cfg.NotSelectedAlpha >= 0 ? Cfg.NotSelectedAlpha
                   : WowAlpha(distance);

            // lay the lines out around the alignment point, kept inside WoW's top/bottom insets
            var sc = px / BakePx;
            var lineH = px * 1.15f;
            var widths = lines.Select(l => l.Runs.Sum(r => TextRenderer.Measure(f, r.Text, sc))).ToArray();
            var totalH = lineH * lines.Count;
            var top = (align / 3) switch { 0 => point.Y, 1 => point.Y - totalH / 2, _ => point.Y - totalH };
            top = Math.Clamp(top, view.Height * Cfg.TopInset, MathF.Max(view.Height * Cfg.TopInset, view.Height * (1 - Cfg.BottomInset) - totalH));
            var name = new Name { Px = px, Alpha = Math.Clamp(alpha, 0, 1) };
            var widest = widths.Max();
            for (var l = 0; l < lines.Count; l++)
            {
                var x = (align % 3) switch { 0 => point.X, 1 => point.X - widths[l] / 2, _ => point.X - widths[l] };
                name.Lines.Add(new Line { Runs = lines[l].Runs, Pen = new Vector2(x, top + l * lineH + (lineH - px) / 2) });
            }
            var left = (align % 3) switch { 0 => point.X, 1 => point.X - widest / 2, _ => point.X - widest };
            name.Min = new Vector2(left, top);
            name.Max = new Vector2(left + widest, top + totalH);
            if (DebugLabels) name.Debug = $"cam {distance:0.0}  alpha {name.Alpha:0.00}";
            frame.Names.Add(name);

            // move the tag's other parts with the text; the name icon goes beside our text's width, the marker above
            // its height (bottom-aligned text grows upwards)
            var delta = point - nativePoint;
            var theirs = obj.TextW > 0 ? obj.TextW * scale : box.X;
            var iconDx = (align % 3) switch { 0 => 0, 1 => -(widest - theirs) / 2, _ => -(widest - theirs) };
            var markerDy = align / 3 == 2 ? -MathF.Max(0, totalH - box.Y) : 0;
            Shift((AtkResNode*)root, delta);
            var comp = root->Component;
            if (comp != null && comp->UldManager.NodeList != null)
                for (var n = 0; n < comp->UldManager.NodeListCount; n++)
                {
                    var node = comp->UldManager.NodeList[n];
                    if (node == null) continue;
                    var extra = node == (AtkResNode*)obj.NameIcon ? new Vector2(iconDx, 0)
                              : node == (AtkResNode*)obj.MarkerIcon ? new Vector2(0, markerDy)
                              : Vector2.Zero;
                    Shift(node, delta + extra);
                }

            if (!AlignmentTest)
            {
                text->NodeFlags &= ~NodeFlags.Visible;
                hidden.Add((nint)text);
            }
        }

        Funnel = $"tags {active}, with a character {withObject}, visible {shown}, ours {frame.Names.Count}";
        frame.Hud = CollectHud(view.Width * view.Height);
        Publish(frame);
    }

    // Only hidden while the tags draw, so the game's next update and other plugins see the text nodes as usual.
    private void OnPostDraw(AddonEvent type, AddonArgs args) => RestoreHidden();

    private void RestoreHidden()
    {
        foreach (var n in hidden) ((AtkResNode*)n)->NodeFlags |= NodeFlags.Visible;
        hidden.Clear();
    }

    private void Publish(Frame frame)
    {
        lock (frames)
        {
            frames[2] = frames[1];
            frames[1] = frames[0];
            frames[0] = frame;
        }
    }

    // A node's position as the game left it: if the game didn't recompute it, it still carries our last shift.
    private Vector2 Native(AtkResNode* node)
    {
        var at = new Vector2(node->ScreenX, node->ScreenY);
        if (shifts.TryGetValue((nint)node, out var s) && at.X == s.WroteX && at.Y == s.WroteY) at -= new Vector2(s.Dx, s.Dy);
        return at;
    }

    // The game already turned the tag's layout into screen positions for this frame; move those.
    private void Shift(AtkResNode* node, Vector2 d)
    {
        var at = Native(node) + d;
        node->ScreenX = at.X;
        node->ScreenY = at.Y;
        shifts[(nint)node] = (at.X, at.Y, d.X, d.Y);
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

    // The game draws name tags under all of its HUD; our overlay is on top of everything. So note where the HUD has
    // something drawn (text, images, frames, window backgrounds) and leave those spots out of the names.
    private static List<(Vector2, Vector2)> CollectHud(float screenArea)
    {
        var rects = new List<(Vector2, Vector2)>();
        var stage = AtkStage.Instance();
        if (stage == null || stage->RaptureAtkUnitManager == null) return rects;
        ref var list = ref stage->RaptureAtkUnitManager->AtkUnitManager.AllLoadedUnitsList;
        for (var i = 0; i < list.Count; i++)
        {
            var u = list.Entries[i].Value;
            if (u == null || !u->IsVisible || u->RootNode == null || u->NameString == "NamePlate") continue;
            AddHud(&u->UldManager, rects, screenArea, 0);
        }
        return rects;
    }

    private static void AddHud(AtkUldManager* uld, List<(Vector2, Vector2)> rects, float screenArea, int depth)
    {
        if (uld == null || uld->NodeList == null || depth > 4) return;
        for (var n = 0; n < uld->NodeListCount; n++)
        {
            var node = uld->NodeList[n];
            if (node == null || !node->IsVisible()) continue;
            var type = (int)node->Type;
            if (type >= 1000)
            {
                var comp = ((AtkComponentNode*)node)->Component;
                if (comp != null) AddHud(&comp->UldManager, rects, screenArea, depth + 1);
                continue;
            }
            if (type is not (2 or 3 or 4 or 5)) continue; // image, text, nine-grid, counter
            float alpha = 1, scale = 1;
            var shown = true;
            for (var a = node; a != null; a = a->ParentNode)
            {
                if (!a->IsVisible()) { shown = false; break; }
                alpha *= a->Color.A / 255f;
                scale *= a->ScaleX;
            }
            if (!shown || alpha < 0.05f) continue;
            var min = new Vector2(node->ScreenX, node->ScreenY);
            var size = new Vector2(node->Width, node->Height) * scale;
            // empty boxes and screen-wide layers (fades, backdrops) don't count
            if (size.X < 1 || size.Y < 1 || size.X * size.Y > screenArea * 0.25f) continue;
            rects.Add((min, min + size));
        }
    }

    // ---- the overlay (Dalamud's draw, once per frame on the game thread) ----

    private void Draw()
    {
        var t = clock.Elapsed.TotalSeconds;
        lastDrawT = t;
        viewportOrigin = ImGui.GetMainViewport().Pos;
        var want = Cfg.FontPath.Trim().Trim('"');
        if (builtFontPath != Cfg.FontPath && (want.Length == 0 || File.Exists(want))) BuildFont();

        Frame frame;
        lock (frames) frame = frames[Math.Clamp(Cfg.DrawDelay, 0, 2)];
        NamesDrawn = 0;
        // the tags stopped drawing (UI hidden, loading): don't leave old names up
        if (t - lastT > 0.25 || frame.Names.Count == 0 || font is not { Available: true }) return;

        using var locked = font.Lock();
        var f = locked.ImFont;
        var dl = ImGui.GetBackgroundDrawList();
        var outline = Cfg.Outline ? Cfg.OutlinePx : 0;
        var shadow = Cfg.Shadow ? new Vector2(1, 1) : Vector2.Zero;
        var covered = new List<(Vector2 Min, Vector2 Max)>();

        foreach (var name in frame.Names)
        {
            covered.Clear();
            foreach (var (a, b) in frame.Hud)
                if (a.X < name.Max.X + 4 && b.X > name.Min.X - 4 && a.Y < name.Max.Y + 4 && b.Y > name.Min.Y - 4) covered.Add((a, b));
            var sc = name.Px / BakePx;
            var shadowColor = TextRenderer.WithAlpha(0xFF000000, name.Alpha * 0.8f);
            // shadow, then outline, then fill, so no letter's outline covers its neighbour's fill
            for (var pass = 0; pass < 3; pass++)
                foreach (var line in name.Lines)
                {
                    var pen = line.Pen;
                    foreach (var r in line.Runs)
                        pen = TextRenderer.DrawRun(dl, f, pen, r.Text, sc,
                            TextRenderer.WithAlpha(r.Color, name.Alpha), TextRenderer.WithAlpha(r.Edge, name.Alpha),
                            outline, shadow, shadowColor, pass, covered);
                }
            if (name.Debug.Length > 0) dl.AddText(new Vector2(name.Min.X, name.Max.Y + 2), 0xFF00FFFF, name.Debug);
            NamesDrawn++;
        }
    }

    // ---- setup ----

    private static uint Rgba(ByteColor c) => (uint)(c.R | (c.G << 8) | (c.B << 16) | (c.A << 24));

    private static uint[]? LoadUiColors()
    {
        try
        {
            var sheet = DataManager.GetExcelSheet<UIColor>();
            var a = new uint[sheet.Max(r => r.RowId) + 1];
            // sheet colours are 0xRRGGBBAA; ImGui wants 0xAABBGGRR
            foreach (var r in sheet) a[r.RowId] = System.Buffers.Binary.BinaryPrimitives.ReverseEndianness(r.Dark);
            return a;
        }
        catch (Exception e) { Log.Warning(e, "UIColor sheet unavailable"); return null; }
    }

    private void BuildFont()
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
            var main = path.Length > 0 && File.Exists(path)
                ? tk.AddFontFromFile(path, cfg)
                : tk.AddDalamudAssetFont(DalamudAsset.NotoSansCjkMedium, cfg);
            // the game's private-use symbols (cross-world mark etc.) and Japanese
            tk.AddGameSymbol(new SafeFontConfig { SizePx = BakePx, OversampleH = 3, OversampleV = 2, PixelSnapH = false, MergeFont = main });
            tk.AttachExtraGlyphsForDalamudLanguage(new SafeFontConfig { SizePx = BakePx, OversampleH = 2, PixelSnapH = false, MergeFont = main });
        }));
    }
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
        ImGui.SetNextItemWidth(260);
        changed |= ImGui.InputText("Font file (.ttf/.otf)", ref c.FontPath, 512);
        ImGui.TextDisabled("  e.g. your own copy of WoW's FRIZQT__.TTF; empty uses Noto Sans");
        changed |= ImGui.SliderFloat("Text size", ref c.TextScale, 0.6f, 2f, "%.2f");
        changed |= ImGui.Checkbox("Outline", ref c.Outline);
        if (c.Outline) changed |= ImGui.SliderFloat("Outline width", ref c.OutlinePx, 0.5f, 2.5f, "%.2f px");
        changed |= ImGui.Checkbox("Drop shadow", ref c.Shadow);

        if (ImGui.TreeNode("WoW nameplate settings"))
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
        changed |= ImGui.SliderInt("Overlay frame delay", ref c.DrawDelay, 0, 2);
        ImGui.Checkbox("Alignment test: also show the game's own names", ref plugin.AlignmentTest);
        if (plugin.AlignmentTest)
            ImGui.TextDisabled("  Turn the camera: the right frame delay keeps both copies together.");
        ImGui.Checkbox("Show debug numbers under names", ref plugin.DebugLabels);
        if (ImGui.Button("Reset to defaults")) plugin.Reset();
        if (changed) plugin.Save();
        ImGui.TextDisabled($"{plugin.FramesPerSec} frames/s   {plugin.NamesDrawn} names drawn");
        ImGui.TextDisabled(plugin.Funnel);
    }
}
