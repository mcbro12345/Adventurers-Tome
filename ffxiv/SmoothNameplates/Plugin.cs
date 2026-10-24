using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Numerics;
using Dalamud.Bindings.ImGui;
using Dalamud.Game.Addon.Lifecycle;
using Dalamud.Game.Addon.Lifecycle.AddonArgTypes;
using Dalamud.Game.Command;
using Dalamud.Interface.Windowing;
using Dalamud.IoC;
using Dalamud.Plugin;
using Dalamud.Plugin.Services;
using FFXIVClientStructs.FFXIV.Client.UI;
using FFXIVClientStructs.FFXIV.Client.UI.Arrays;
using FFXIVClientStructs.FFXIV.Component.GUI;

namespace SmoothNameplates;

// Changes FFXIV's own name tags in place: no overlay, so they keep drawing with the frame they belong to, under the HUD,
// with their icons, and other plugins' changes to them keep working.
//
// Look: after the game sets up a tag's name text each update, switch its font, size, bold/outline/glow and fixed
// resolution to the configured ones, and have the game re-render ("bake") that tag once when anything changed.
//
// Movement: right before the tags draw, move each tag's finished screen positions to where its overhead point projects
// with the camera's clean projection (no anti-aliasing shake), using a steady point (the character's position plus a
// slowly averaged head height; the game's point bobs with the walk) and a filtered layout offset (so the game's
// whole-pixel rounding doesn't come through).
public sealed unsafe class Plugin : IDalamudPlugin
{
    [PluginService] internal static IDalamudPluginInterface Pi { get; private set; } = null!;
    [PluginService] internal static IAddonLifecycle Lifecycle { get; private set; } = null!;
    [PluginService] internal static ICommandManager Commands { get; private set; } = null!;

    private const string Cmd = "/smoothtags";
    private const int Count = 50;

    internal Config Cfg;
    private readonly WindowSystem windows = new("SmoothNameplates");
    private readonly ConfigWindow window;
    private readonly Stopwatch clock = Stopwatch.StartNew();

    // per text node: the game's own settings, and what we last set
    private struct Look
    {
        public byte GameFont, GameSize, OurFont, OurSize;
        public TextFlags GameFlags, OurFlags;
    }

    private readonly Dictionary<nint, Look> looks = new();

    private sealed class Plate
    {
        public nint Object;
        public double SeenT;
        public Vector3 D;       // head point minus position, averaged
        public bool DReady;
        public Vector2 Rel;     // the tag's layout: the game's tag spot minus its projected head point
        public bool RelReady;
        public Vector2 LastHead; // projected steady point last frame, to tell when it's moving
    }

    private readonly Plate[] plates = Enumerable.Range(0, Count).Select(_ => new Plate()).ToArray();
    private readonly Dictionary<nint, (float WroteX, float WroteY, float Dx, float Dy)> shifts = new();
    private Vector2 viewportOrigin;
    private double lastT;

    internal int FramesPerSec, RebakesPerSec, Moved;
    internal string Resets = "";
    private int resetFont, resetSize, resetDirect;
    private bool sharpSet;

    // recorder: a few seconds of what the game and we do with every tag, every frame, for diagnosis
    private StreamWriter? record;
    private double recordUntil;
    private long recordFrame;
    internal string RecordStatus = "";

    internal void StartRecording()
    {
        record?.Dispose();
        var dir = Pi.GetPluginConfigDirectory();
        Directory.CreateDirectory(dir);
        var path = Path.Combine(dir, $"record-{DateTime.Now:yyyyMMdd-HHmmss}.csv");
        record = new StreamWriter(path);
        record.WriteLine("frame,t,smooth,tag,object,headX,headY,steadyX,steadyY,gameX,gameY,drawnX,drawnY,relX,relY,still,camX,camY,camZ");
        recordUntil = clock.Elapsed.TotalSeconds + 6;
        recordFrame = 0;
        RecordStatus = $"Recording 6 s to {path}";
    }

    private void StopRecording()
    {
        if (record == null) return;
        record.Dispose();
        record = null;
        RecordStatus = RecordStatus.Replace("Recording 6 s to", "Saved") + "  (send me this file)";
    }
    private int frameCount, rebakes;
    private double statT;

    public Plugin()
    {
        Cfg = Pi.GetPluginConfig() as Config is { Version: Config.Current } c ? c : new Config();
        window = new ConfigWindow(this);
        windows.AddWindow(window);
        Pi.UiBuilder.Draw += windows.Draw;
        Pi.UiBuilder.Draw += TrackViewport;
        Pi.UiBuilder.OpenConfigUi += window.Toggle;
        Pi.UiBuilder.OpenMainUi += window.Toggle;
        Commands.AddHandler(Cmd, new CommandInfo((_, _) => window.Toggle()) { HelpMessage = "Smooth Nameplates settings." });
        Lifecycle.RegisterListener(AddonEvent.PreRequestedUpdate, "NamePlate", OnPreUpdate);
        Lifecycle.RegisterListener(AddonEvent.PostRequestedUpdate, "NamePlate", OnPostUpdate);
        Lifecycle.RegisterListener(AddonEvent.PreDraw, "NamePlate", OnPreDraw);
    }

    public void Dispose()
    {
        Lifecycle.UnregisterListener(AddonEvent.PreRequestedUpdate, "NamePlate", OnPreUpdate);
        Lifecycle.UnregisterListener(AddonEvent.PostRequestedUpdate, "NamePlate", OnPostUpdate);
        var na = NamePlateNumberArray.Instance();
        if (sharpSet && na != null) { na->DisableFixedFontResolution = false; na->ForceNamePlateRebake = true; }
        Lifecycle.UnregisterListener(AddonEvent.PreDraw, "NamePlate", OnPreDraw);
        Commands.RemoveHandler(Cmd);
        Pi.UiBuilder.Draw -= windows.Draw;
        Pi.UiBuilder.Draw -= TrackViewport;
        Pi.UiBuilder.OpenConfigUi -= window.Toggle;
        Pi.UiBuilder.OpenMainUi -= window.Toggle;
        windows.RemoveAllWindows();
        RestoreLooks();
        record?.Dispose();
    }

    internal void Save() => Pi.SavePluginConfig(Cfg);

    internal void Reset()
    {
        Cfg = new Config();
        Save();
    }

    private void TrackViewport() => viewportOrigin = ImGui.GetMainViewport().Pos;

    private static AddonNamePlate* Addon()
    {
        var stage = AtkStage.Instance();
        if (stage == null || stage->RaptureAtkUnitManager == null) return null;
        return (AddonNamePlate*)stage->RaptureAtkUnitManager->GetAddonByName("NamePlate");
    }

    // ---- look ----

    // "Sharp" is the game's own setting in its nameplate data (it copies it onto the text every update, so setting it on
    // the text would be undone every frame and re-render the tag every frame). Set it where the game reads it.
    private void OnPreUpdate(AddonEvent type, AddonArgs args)
    {
        var na = NamePlateNumberArray.Instance();
        if (na == null) return;
        if (na->DisableFixedFontResolution != Cfg.Sharp && (Cfg.Sharp || sharpSet))
        {
            na->DisableFixedFontResolution = Cfg.Sharp;
            if (!sharpSet || !Cfg.Sharp) na->ForceNamePlateRebake = true;
            sharpSet = Cfg.Sharp;
        }
    }

    private void OnPostUpdate(AddonEvent type, AddonArgs args) => ApplyLooks((AddonNamePlate*)args.Addon.Address);

    private void ApplyLooks(AddonNamePlate* addon)
    {
        if (addon == null || addon->NamePlateObjectArray == null) return;
        for (var i = 0; i < Count; i++)
        {
            ref var obj = ref addon->NamePlateObjectArray[i];
            var t = obj.NameText;
            if (t == null) continue;
            var font = (byte)(t->AlignmentFontType >> 4);
            var size = t->FontSize;
            var flags = t->TextFlags;

            // anything that isn't what we set is the game's (or another plugin's) own choice: start from that
            looks.TryGetValue((nint)t, out var look);
            var known = looks.ContainsKey((nint)t);
            if (known)
            {
                if (font != look.OurFont) resetFont++;
                if (size != look.OurSize) resetSize++;
                if (Cfg.Direct && !obj.DrawOriginalText) resetDirect++;
            }
            if (!known || font != look.OurFont || size != look.OurSize)
            {
                look.GameFont = font;
                look.GameSize = size;
                look.GameFlags = flags;
            }

            var wantFont = Cfg.Font is >= 0 and <= 5 ? (byte)Cfg.Font : look.GameFont;
            var wantSize = (byte)Math.Clamp(MathF.Round(look.GameSize * Cfg.Size), 6, 64);
            // bold/outline/glow stay the game's: it rewrites them on every update, so changing them meant re-rendering
            // tags every frame (and the tags hopping as they re-rendered)
            var wantFlags = flags;

            // the game normally draws a pre-rendered image of the name ("bake"), which keeps its own font; drawing the
            // text itself is what lets the chosen font show
            if (Cfg.Direct) obj.DrawOriginalText = true;
            else if (directWas) { obj.DrawOriginalText = false; obj.NeedsToBeBaked = true; }
            if (font != wantFont || size != wantSize)
            {
                if (font != wantFont) t->SetFont((FontType)wantFont);
                t->FontSize = wantSize;
                obj.NeedsToBeBaked = true;
                rebakes++;
            }
            look.OurFont = wantFont;
            look.OurSize = wantSize;
            look.OurFlags = wantFlags;
            looks[(nint)t] = look;
        }
        directWas = Cfg.Direct;
    }

    private bool directWas;

    private void RestoreLooks()
    {
        var addon = Addon();
        if (addon == null || addon->NamePlateObjectArray == null) return;
        for (var i = 0; i < Count; i++)
        {
            ref var obj = ref addon->NamePlateObjectArray[i];
            var t = obj.NameText;
            if (t == null || !looks.TryGetValue((nint)t, out var look)) continue;
            t->SetFont((FontType)look.GameFont);
            t->FontSize = look.GameSize;
            if (Cfg.Direct) obj.DrawOriginalText = false;
            obj.NeedsToBeBaked = true;
        }
    }

    internal void LookChanged()
    {
        Save();
        ApplyLooks(Addon());
    }

    // ---- movement, right before the tags draw ----

    private void OnPreDraw(AddonEvent type, AddonArgs args)
    {
        var t = clock.Elapsed.TotalSeconds;
        var dt = (float)Math.Clamp(t - lastT, 1e-4, 0.25);
        lastT = t;
        frameCount++;
        if (t - statT >= 1)
        {
            FramesPerSec = frameCount; RebakesPerSec = rebakes;
            Resets = $"game reset per second: font {resetFont}, size {resetSize}, direct text {resetDirect}";
            frameCount = rebakes = resetFont = resetSize = resetDirect = 0; statT = t;
        }

        var addon = (AddonNamePlate*)args.Addon.Address;
        ApplyLooks(addon); // a plugin that changed a tag after the update gets our look on top again
        Moved = 0;
        if (record != null && t > recordUntil) StopRecording();
        recordFrame++;
        if (addon == null || addon->NamePlateObjectArray == null) return;
        var ui = UIModule.Instance();
        var ui3d = ui != null ? ui->GetUI3DModule() : null;
        var numbers = NamePlateNumberArray.Instance();
        var view = View.Capture();
        if (ui3d == null || numbers == null || !view.Ok) return;

        // entry k of the nameplate data goes with the 3D module's entry k; the data says which tag (0-49) it fills
        var data = (NamePlateNumberArray.NamePlateObjectIntArrayData*)((int*)numbers + 6); // 50 blocks after 6 header ints
        var active = Math.Min(Math.Min(numbers->ActiveNamePlateCount, ui3d->NamePlateObjectInfoCount), Count);
        for (var k = 0; k < active; k++)
        {
            var info = ui3d->NamePlateObjectInfoPointers[k].Value;
            var i = data[k].NamePlateObjectIndex;
            if (info == null || info->GameObject == null || (uint)i >= Count) continue;
            var root = (AtkResNode*)addon->NamePlateObjectArray[i].RootComponentNode;
            if (root == null || !root->IsVisible()) continue;

            var p = plates[i];
            if (p.Object != (nint)info->GameObject || t - p.SeenT > 0.2)
            {
                p.Object = (nint)info->GameObject;
                p.DReady = false;
                p.RelReady = false;
            }
            p.SeenT = t;

            Vector3 head = info->NamePlatePos;
            Vector3 position = info->GameObject->Position;
            var raw = head - position;
            if (!p.DReady || Vector3.Distance(raw, p.D) > 0.6f) { p.D = raw; p.DReady = true; }
            else p.D += (raw - p.D) * (1 - MathF.Exp(-dt / 0.4f));

            if (!view.Project(head, viewportOrigin, out var headOnScreen) ||
                !view.Project(position + p.D, viewportOrigin, out var steadyOnScreen)) continue;
            var native = Native(root);
            var rel = native - headOnScreen;
            // The game's spot comes from an older camera, so while anything moves it trails; learning the layout then
            // would bring that trail back. So the layout is learnt while the tag's point holds still on screen (where
            // the game's spot is right), and held while it moves. A big change (new layout, size) is taken at once.
            var still = Vector2.Distance(steadyOnScreen, p.LastHead) < 0.3f;
            p.LastHead = steadyOnScreen;
            var jump = Vector2.Distance(rel, p.Rel);
            if (!p.RelReady || jump > 80 || (still && jump > 24)) { p.Rel = rel; p.RelReady = true; }
            else if (still) p.Rel += (rel - p.Rel) * (1 - MathF.Exp(-dt / 0.3f));
            var want = steadyOnScreen + p.Rel;
            // with smoothing off the tags go back to (and stay at) the game's own spots
            var delta = Cfg.Smooth ? want - native : Vector2.Zero;
            record?.WriteLine(string.Create(CultureInfo.InvariantCulture,
                $"{recordFrame},{t:0.0000},{(Cfg.Smooth ? 1 : 0)},{i},{(ulong)info->GameObject:X},{headOnScreen.X:0.00},{headOnScreen.Y:0.00},{steadyOnScreen.X:0.00},{steadyOnScreen.Y:0.00},{native.X:0.00},{native.Y:0.00},{native.X + delta.X:0.00},{native.Y + delta.Y:0.00},{p.Rel.X:0.00},{p.Rel.Y:0.00},{(still ? 1 : 0)},{view.Position.X:0.000},{view.Position.Y:0.000},{view.Position.Z:0.000}"));

            Shift(root, delta);
            var comp = ((AtkComponentNode*)root)->Component;
            if (comp != null && comp->UldManager.NodeList != null)
                for (var n = 0; n < comp->UldManager.NodeListCount; n++)
                    if (comp->UldManager.NodeList[n] != null) Shift(comp->UldManager.NodeList[n], delta);
            Moved++;
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
}

internal sealed class ConfigWindow : Window
{
    private static readonly string[] Fonts = { "Game's choice", "Axis", "Miedinger Med", "Miedinger", "Trump Gothic", "Jupiter", "Jupiter Large" };
    private readonly Plugin plugin;

    public ConfigWindow(Plugin plugin) : base("Smooth Nameplates###smoothtags", ImGuiWindowFlags.AlwaysAutoResize)
    {
        this.plugin = plugin;
    }

    public override void Draw()
    {
        var c = plugin.Cfg;
        var look = false;
        var font = c.Font + 1;
        ImGui.SetNextItemWidth(200);
        if (ImGui.Combo("Font", ref font, Fonts, Fonts.Length)) { c.Font = font - 1; look = true; }
        look |= ImGui.SliderFloat("Size", ref c.Size, 0.6f, 2f, "%.2fx");
        look |= ImGui.Checkbox("Draw the text itself (lets the font change)", ref c.Direct);
        look |= ImGui.Checkbox("Sharp (no fixed font resolution)", ref c.Sharp);
        if (look) plugin.LookChanged();
        if (ImGui.Checkbox("Smooth movement", ref c.Smooth)) plugin.Save();
        if (ImGui.Button("Reset to defaults")) { plugin.Reset(); plugin.LookChanged(); }
        ImGui.Separator();
        ImGui.TextDisabled($"{plugin.FramesPerSec} frames/s   {plugin.Moved} tags moved   {plugin.RebakesPerSec} re-renders/s");
        ImGui.TextDisabled(plugin.Resets);
        if (ImGui.Button("Record 6 seconds")) plugin.StartRecording();
        if (plugin.RecordStatus.Length > 0)
        {
            ImGui.TextWrapped(plugin.RecordStatus);
            if (ImGui.Button("Copy path")) ImGui.SetClipboardText(plugin.RecordStatus.Split(" to ").Last().Split("  (")[0].Replace("Saved ", ""));
        }
    }
}
