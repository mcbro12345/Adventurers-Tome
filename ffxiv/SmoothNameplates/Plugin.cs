using System;
using System.Collections.Generic;
using System.Diagnostics;
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

// Changes the look of FFXIV's own name tags in place: after the game sets up a tag's name text each update, switch
// its font and size to the configured ones (re-rendering that tag once when something changed), and set the game's
// own "fixed font resolution" switch. The tags themselves stay the game's: placed, layered and drawn by it.
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
        public byte GameFont, GameSize, GameSpacing, OurFont, OurSize, OurSpacing;
    }

    private readonly Dictionary<nint, Look> looks = new();

    internal int FramesPerSec, RebakesPerSec;
    internal string Resets = "";
    private int resetFont, resetSize, resetSpacing, resetDirect;
    private bool sharpSet;
    private int frameCount, rebakes;
    private double statT;

    public Plugin()
    {
        Cfg = Pi.GetPluginConfig() as Config is { Version: Config.Current } c ? c : new Config();
        window = new ConfigWindow(this);
        windows.AddWindow(window);
        Pi.UiBuilder.Draw += windows.Draw;
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
        Lifecycle.UnregisterListener(AddonEvent.PreDraw, "NamePlate", OnPreDraw);
        var na = NamePlateNumberArray.Instance();
        if (sharpSet && na != null) { na->DisableFixedFontResolution = false; na->ForceNamePlateRebake = true; }
        Commands.RemoveHandler(Cmd);
        Pi.UiBuilder.Draw -= windows.Draw;
        Pi.UiBuilder.OpenConfigUi -= window.Toggle;
        Pi.UiBuilder.OpenMainUi -= window.Toggle;
        windows.RemoveAllWindows();
        RestoreLooks();
    }

    internal void Save() => Pi.SavePluginConfig(Cfg);

    internal void Reset()
    {
        Cfg = new Config();
        Save();
    }

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
            var spacing = t->LineSpacing;

            // anything that isn't what we set is the game's (or another plugin's) own choice: start from that
            looks.TryGetValue((nint)t, out var look);
            var known = looks.ContainsKey((nint)t);
            if (known)
            {
                if (font != look.OurFont) resetFont++;
                if (size != look.OurSize) resetSize++;
                if (spacing != look.OurSpacing) resetSpacing++;
                if (Cfg.Direct && !obj.DrawOriginalText) resetDirect++;
            }
            if (!known || font != look.OurFont || size != look.OurSize || spacing != look.OurSpacing)
            {
                look.GameFont = font;
                look.GameSize = size;
                look.GameSpacing = spacing;
            }

            var wantFont = Cfg.Font is >= 0 and <= 5 ? (byte)Cfg.Font : look.GameFont;
            var wantSize = (byte)Math.Clamp(MathF.Round(look.GameSize * Cfg.Size), 6, 64);
            var wantSpacing = (byte)Math.Clamp(look.GameSpacing + Cfg.LineSpacing, 0, 100);

            // the game normally draws a pre-rendered image of the name ("bake"), which keeps its own font; drawing the
            // text itself is what lets the chosen font show
            if (Cfg.Direct) obj.DrawOriginalText = true;
            else if (directWas) { obj.DrawOriginalText = false; obj.NeedsToBeBaked = true; }
            if (font != wantFont || size != wantSize || spacing != wantSpacing)
            {
                if (font != wantFont)
                {
                    t->SetFont((FontType)wantFont);
                    // a text node can keep its glyphs in a cache built for the old font
                    if ((t->TextFlags & TextFlags.FontCache) != 0) t->FreeFontCache();
                }
                t->FontSize = wantSize;
                t->LineSpacing = wantSpacing;
                obj.NeedsToBeBaked = true;
                rebakes++;
            }
            look.OurFont = wantFont;
            look.OurSize = wantSize;
            look.OurSpacing = wantSpacing;
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
            t->LineSpacing = look.GameSpacing;
            if (Cfg.Direct) obj.DrawOriginalText = false;
            obj.NeedsToBeBaked = true;
        }
    }

    internal void LookChanged()
    {
        Save();
        ApplyLooks(Addon());
    }

    // ---- each frame, right before the tags draw ----

    private void OnPreDraw(AddonEvent type, AddonArgs args)
    {
        var t = clock.Elapsed.TotalSeconds;
        frameCount++;
        if (t - statT >= 1)
        {
            FramesPerSec = frameCount; RebakesPerSec = rebakes;
            Resets = $"game reset per second: font {resetFont}, size {resetSize}, line spacing {resetSpacing}, direct text {resetDirect}";
            frameCount = rebakes = resetFont = resetSize = resetSpacing = resetDirect = 0; statT = t;
        }
        ApplyLooks((AddonNamePlate*)args.Addon.Address); // a plugin that changed a tag after the update gets our look again
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
        look |= ImGui.SliderInt("Line spacing", ref c.LineSpacing, -10, 30, "%+d px");
        look |= ImGui.Checkbox("Draw the text itself (lets the font change)", ref c.Direct);
        look |= ImGui.Checkbox("Sharp (no fixed font resolution)", ref c.Sharp);
        if (look) plugin.LookChanged();
        if (ImGui.Button("Reset to defaults")) { plugin.Reset(); plugin.LookChanged(); }
        ImGui.Separator();
        ImGui.TextDisabled($"{plugin.FramesPerSec} frames/s   {plugin.RebakesPerSec} re-renders/s");
        ImGui.TextDisabled(plugin.Resets);
    }
}
