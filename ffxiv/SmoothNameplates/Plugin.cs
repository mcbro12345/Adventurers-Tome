using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using Dalamud.Bindings.ImGui;
using Dalamud.Game.Addon.Lifecycle;
using Dalamud.Game.Addon.Lifecycle.AddonArgTypes;
using Dalamud.Game.Command;
using Dalamud.Interface.Windowing;
using Dalamud.IoC;
using Dalamud.Plugin;
using Dalamud.Plugin.Services;
using FFXIVClientStructs.FFXIV.Client.UI;
using FFXIVClientStructs.FFXIV.Component.GUI;

namespace SmoothNameplates;

// Changes the look of FFXIV's own name tags in place: after the game sets up a tag's name text each update, switch
// its font, size and line spacing to the configured ones (re-rendering that tag once when something changed).
// The tags themselves stay the game's: placed, layered and drawn by it.
public sealed unsafe class Plugin : IDalamudPlugin
{
    [PluginService] internal static IDalamudPluginInterface Pi { get; private set; } = null!;
    [PluginService] internal static IAddonLifecycle Lifecycle { get; private set; } = null!;
    [PluginService] internal static ICommandManager Commands { get; private set; } = null!;
    [PluginService] internal static IFramework Framework { get; private set; } = null!;
    [PluginService] internal static ITextureProvider Textures { get; private set; } = null!;

    internal readonly FontSwap Swap = new();
    internal readonly Dalamud.Interface.ImGuiFileDialog.FileDialogManager Dialog = new();
    private bool swapPending;

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
    internal int GameFont = -1;          // the font the game picks for its tags
    internal string TagDetails = "";     // the visible tags, for the settings window
    private double tagsT;

    private void ListTags(AddonNamePlate* addon)
    {
        var lines = new List<string>();
        for (var i = 0; i < Count; i++)
        {
            ref var obj = ref addon->NamePlateObjectArray[i];
            var t = obj.NameText;
            var root = (AtkResNode*)obj.RootComponentNode;
            if (t == null || root == null || !root->IsVisible()) continue;
            float scale = 1;
            for (var n = (AtkResNode*)t; n != null; n = n->ParentNode) scale *= n->ScaleX;
            string name;
            try { name = Dalamud.Game.Text.SeStringHandling.SeString.Parse(t->NodeText.AsSpan()).TextValue.Replace("\r", " / ").Replace("\n", " / "); }
            catch { name = "?"; }
            if (name.Length > 28) name = name[..28] + "...";
            lines.Add($"{name}: font size {t->FontSize}, font {t->AlignmentFontType >> 4}, scale {scale:0.00}, kind {obj.NamePlateKind}, " +
                      $"{(obj.BakeData.IsBaked ? "pre-rendered" : "not pre-rendered")}{(obj.DrawOriginalText ? ", drawn directly" : "")}, box {t->Width}x{t->Height}");
        }
        TagDetails = string.Join("\n", lines);
    }
    private int resetFont, resetSize, resetSpacing;
    private int frameCount, rebakes;
    private double statT;

    public Plugin()
    {
        Cfg = Pi.GetPluginConfig() as Config is { Version: Config.Current } c ? c : new Config();
        window = new ConfigWindow(this);
        windows.AddWindow(window);
        Pi.UiBuilder.Draw += windows.Draw;
        Pi.UiBuilder.Draw += Dialog.Draw;
        Pi.UiBuilder.OpenConfigUi += window.Toggle;
        Pi.UiBuilder.OpenMainUi += window.Toggle;
        Commands.AddHandler(Cmd, new CommandInfo((_, _) => window.Toggle()) { HelpMessage = "Smooth Nameplates settings." });
        Lifecycle.RegisterListener(AddonEvent.PostRequestedUpdate, "NamePlate", OnPostUpdate);
        Lifecycle.RegisterListener(AddonEvent.PreDraw, "NamePlate", OnPreDraw);
        // the custom font is only in place while the name tags lay out and draw
        Lifecycle.RegisterListener(AddonEvent.PreRequestedUpdate, "NamePlate", SwapIn);
        Lifecycle.RegisterListener(AddonEvent.PreUpdate, "NamePlate", SwapIn);
        Lifecycle.RegisterListener(AddonEvent.PreDraw, "NamePlate", SwapIn);
        Lifecycle.RegisterListener(AddonEvent.PostRequestedUpdate, "NamePlate", SwapOut);
        Lifecycle.RegisterListener(AddonEvent.PostUpdate, "NamePlate", SwapOut);
        Lifecycle.RegisterListener(AddonEvent.PostDraw, "NamePlate", SwapOut);
        // and never anywhere else: whatever happened before, every other window starts with the game's own letters
        Lifecycle.RegisterListener(AddonEvent.PreRequestedUpdate, Guard);
        Lifecycle.RegisterListener(AddonEvent.PreUpdate, Guard);
        Lifecycle.RegisterListener(AddonEvent.PreDraw, Guard);
        Framework.Update += OnFrameworkUpdate;
        swapPending = Cfg.CustomFont.Length > 0;
    }

    // The custom font goes in on the game thread, once the game's fonts are loaded.
    private void OnFrameworkUpdate(IFramework framework)
    {
        Swap.Disable();
        Swap.FreeRetired();
        if (!swapPending) return;
        swapPending = false;
        ApplyCustomFont();
    }

    internal void RequestCustomFont() => swapPending = true;

    private void SwapIn(AddonEvent type, AddonArgs args) => Swap.Enable();
    private void SwapOut(AddonEvent type, AddonArgs args) => Swap.Disable();

    private void Guard(AddonEvent type, AddonArgs args)
    {
        if (args.AddonName != "NamePlate") Swap.Disable();
    }

    // Imports the chosen file into the plugin's own folder, so the original can be moved or deleted afterwards.
    private void ImportCustomFont()
    {
        var path = Cfg.CustomFont.Trim().Trim('"');
        if (path.Length == 0 || !System.IO.File.Exists(path)) return;
        var dir = System.IO.Path.Combine(Pi.GetPluginConfigDirectory(), "fonts");
        var full = System.IO.Path.GetFullPath(path);
        if (full.StartsWith(System.IO.Path.GetFullPath(dir), StringComparison.OrdinalIgnoreCase)) return;
        System.IO.Directory.CreateDirectory(dir);
        var copy = System.IO.Path.Combine(dir, System.IO.Path.GetFileName(full));
        System.IO.File.Copy(full, copy, true);
        Cfg.CustomFont = copy;
    }

    private void ApplyCustomFont()
    {
        try { ImportCustomFont(); }
        catch (Exception e) { Swap.Status = $"Couldn't import that font: {e.Message}"; return; }
        if (Cfg.CustomFont.Trim().Length == 0) Swap.Restore();
        else
        {
            Swap.Apply(Cfg.CustomFont, Math.Clamp(Cfg.CustomFamily, 0, FontSwap.Families.Length - 1), Cfg.CustomScale, Cfg.Bold, Cfg.Sizing, Textures);
            // the tags use the family that now carries your font
            if (Swap.Active) Cfg.Font = FontSwap.Families[Math.Clamp(Cfg.CustomFamily, 0, FontSwap.Families.Length - 1)].Type;
        }
        var na = FFXIVClientStructs.FFXIV.Client.UI.Arrays.NamePlateNumberArray.Instance();
        if (na != null) na->ForceNamePlateRebake = true;
        Save();
        ApplyLooks(Addon());
    }

    public void Dispose()
    {
        Lifecycle.UnregisterListener(AddonEvent.PostRequestedUpdate, "NamePlate", OnPostUpdate);
        Lifecycle.UnregisterListener(AddonEvent.PreDraw, "NamePlate", OnPreDraw);
        Lifecycle.UnregisterListener(AddonEvent.PreRequestedUpdate, "NamePlate", SwapIn);
        Lifecycle.UnregisterListener(AddonEvent.PreUpdate, "NamePlate", SwapIn);
        Lifecycle.UnregisterListener(AddonEvent.PreDraw, "NamePlate", SwapIn);
        Lifecycle.UnregisterListener(AddonEvent.PostRequestedUpdate, "NamePlate", SwapOut);
        Lifecycle.UnregisterListener(AddonEvent.PostUpdate, "NamePlate", SwapOut);
        Lifecycle.UnregisterListener(AddonEvent.PostDraw, "NamePlate", SwapOut);
        Lifecycle.UnregisterListener(AddonEvent.PreRequestedUpdate, Guard);
        Lifecycle.UnregisterListener(AddonEvent.PreUpdate, Guard);
        Lifecycle.UnregisterListener(AddonEvent.PreDraw, Guard);
        Commands.RemoveHandler(Cmd);
        Pi.UiBuilder.Draw -= windows.Draw;
        Pi.UiBuilder.Draw -= Dialog.Draw;
        Pi.UiBuilder.OpenConfigUi -= window.Toggle;
        Pi.UiBuilder.OpenMainUi -= window.Toggle;
        windows.RemoveAllWindows();
        RestoreLooks();
        Framework.Update -= OnFrameworkUpdate;
        void Unload() { Swap.Restore(); Swap.FreeRetired(all: true); }
        if (Framework.IsInFrameworkUpdateThread) Unload();
        else Framework.RunOnFrameworkThread(Unload).Wait();
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

    private void OnPostUpdate(AddonEvent type, AddonArgs args) => ApplyLooks((AddonNamePlate*)args.Addon.Address);

    // The size and spacing most tags started with. The game never resets a tag's size itself, so a tag still carrying
    // an enlarged size from before (an earlier session of the plugin) would otherwise be taken as "the game's" and get
    // enlarged again, and again. What most tags agree on is the game's own.
    private static byte Mode(Dictionary<byte, int> counts, byte fallback)
    {
        byte best = fallback;
        var n = 0;
        foreach (var (v, c) in counts)
            if (c > n || (c == n && v < best)) { best = v; n = c; }
        return best;
    }

    private void ApplyLooks(AddonNamePlate* addon)
    {
        if (addon == null || addon->NamePlateObjectArray == null) return;
        var sizes = new Dictionary<byte, int>();
        var spacings = new Dictionary<byte, int>();
        var samples = 0;
        for (var i = 0; i < Count; i++)
        {
            var t = addon->NamePlateObjectArray[i].NameText;
            if (t == null) continue;
            var seen = looks.TryGetValue((nint)t, out var l);
            var size = seen && t->FontSize == l.OurSize ? l.GameSize : t->FontSize;
            var spacing = seen && t->LineSpacing == l.OurSpacing ? l.GameSpacing : t->LineSpacing;
            sizes[size] = sizes.GetValueOrDefault(size) + 1;
            spacings[spacing] = spacings.GetValueOrDefault(spacing) + 1;
            samples++;
        }
        var commonSize = Mode(sizes, 0);
        var commonSpacing = Mode(spacings, 0);

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
            }
            if (!known || font != look.OurFont || size != look.OurSize || spacing != look.OurSpacing)
            {
                look.GameFont = font;
                look.GameSize = size;
                look.GameSpacing = spacing;
            }
            if (samples >= 3)
            {
                look.GameSize = commonSize;
                look.GameSpacing = commonSpacing;
            }

            if (obj.RootComponentNode != null && ((AtkResNode*)obj.RootComponentNode)->IsVisible()) GameFont = look.GameFont;
            var wantFont = Cfg.Font is >= 0 and <= 5 ? (byte)Cfg.Font : look.GameFont;
            var player = obj.NamePlateKind == FFXIVClientStructs.FFXIV.Client.UI.UIObjectKind.PlayerCharacter;
            var kindSize = player ? 1f : Cfg.NpcSize;
            var wantSize = (byte)Math.Clamp(MathF.Round(look.GameSize * Cfg.Size * kindSize), 6, 64);
            var wantSpacing = (byte)Math.Clamp(look.GameSpacing + (player ? Cfg.LineSpacing : Cfg.NpcLineSpacing), 0, 100);

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
    }

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
            Resets = $"game reset per second: font {resetFont}, size {resetSize}, line spacing {resetSpacing}";
            frameCount = rebakes = resetFont = resetSize = resetSpacing = 0; statT = t;
        }
        var addon = (AddonNamePlate*)args.Addon.Address;
        if (addon != null && addon->NamePlateObjectArray != null && t - tagsT > 0.5) { tagsT = t; ListTags(addon); }
        ApplyLooks(addon); // a plugin that changed a tag after the update gets our look again
    }
}

internal sealed class ConfigWindow : Window
{
    private static readonly string[] Fonts = { "Game's choice (Axis)", "Axis", "Miedinger Med", "Miedinger", "Trump Gothic", "Jupiter (small capitals)", "Jupiter Large" };
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
        look |= ImGui.SliderFloat("NPC size", ref c.NpcSize, 0.5f, 1.5f, "%.2fx");
        if (ImGui.IsItemHovered()) ImGui.SetTooltip("On top of Size, for everything that isn't a player. The game makes NPC tags bigger than player tags.");
        look |= ImGui.SliderInt("NPC line spacing", ref c.NpcLineSpacing, -10, 30, "%+d px");
        if (ImGui.IsItemHovered()) ImGui.SetTooltip("Used instead of Line spacing for everything that isn't a player.");
        look |= ImGui.SliderInt("Line spacing", ref c.LineSpacing, -10, 30, "%+d px");
        if (look) plugin.LookChanged();

        ImGui.Separator();
        ImGui.TextUnformatted("Your own font (experimental)");
        ImGui.SetNextItemWidth(300);
        ImGui.InputText("##fontfile", ref c.CustomFont, 512);
        ImGui.SameLine();
        if (ImGui.Button("Choose font file..."))
        {
            var start = System.IO.Path.GetDirectoryName(c.CustomFont.Trim().Trim('"'));
            if (string.IsNullOrEmpty(start) || !System.IO.Directory.Exists(start))
                start = System.IO.Directory.Exists(@"C:\Windows\Fonts") ? @"C:\Windows\Fonts" : null;
            plugin.Dialog.OpenFileDialog("Choose a font", "Font files{.ttf,.otf,.ttc}", (ok, files) =>
            {
                if (!ok || files.Count == 0) return;
                c.CustomFont = files[0];
                plugin.RequestCustomFont();
            }, 1, start);
        }
        var families = FontSwap.Families.Select(f => f.Label).ToArray();
        ImGui.SetNextItemWidth(200);
        ImGui.Combo("In place of", ref c.CustomFamily, families, families.Length);
        ImGui.TextDisabled("  Only the name tags use it; the rest of the UI keeps the game's fonts.");
        var sizings = new[] { "Font size", "Fit line", "Match capitals" };
        ImGui.SetNextItemWidth(200);
        ImGui.Combo("Sizing", ref c.Sizing, sizings, sizings.Length);
        if (ImGui.IsItemHovered()) ImGui.SetTooltip("How your font is sized against each size of the game's font. Press Apply font after changing it.");
        ImGui.SliderFloat("Letter size", ref c.CustomScale, 0.6f, 1.4f, "%.2f");
        ImGui.SliderInt("Bold", ref c.Bold, 0, 3, c.Bold == 0 ? "off" : "%d px");
        if (ImGui.Button("Apply font")) plugin.RequestCustomFont();
        ImGui.SameLine();
        if (ImGui.Button("Back to the game's font")) { c.CustomFont = ""; plugin.RequestCustomFont(); }
        if (plugin.Swap.Status.Length > 0) ImGui.TextWrapped(plugin.Swap.Status);
        if (plugin.Swap.Details.Length > 0 && ImGui.TreeNode("Font sizes"))
        {
            ImGui.TextDisabled(plugin.Swap.Details);
            ImGui.TreePop();
        }
        if (ImGui.Button("Reset to defaults")) { plugin.Reset(); plugin.LookChanged(); }
        ImGui.Separator();
        ImGui.TextDisabled($"{plugin.FramesPerSec} frames/s   {plugin.RebakesPerSec} re-renders/s");
        ImGui.TextDisabled(plugin.Resets);
        if (plugin.TagDetails.Length > 0 && ImGui.TreeNode("Tags on screen"))
        {
            ImGui.TextDisabled(plugin.TagDetails);
            ImGui.TreePop();
        }
        ImGui.TextDisabled(plugin.GameFont >= 0 ? $"The game's own font for these tags: {(plugin.GameFont <= 5 ? Fonts[plugin.GameFont + 1] : $"type {plugin.GameFont}")}" : "");
    }
}
