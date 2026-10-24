using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Dalamud.Interface.Textures;
using Dalamud.Plugin.Services;
using FFXIVClientStructs.FFXIV.Client.Graphics.Kernel;
using FFXIVClientStructs.FFXIV.Component.GUI;

namespace SmoothNameplates;

// Puts the user's own font into one of the game's font families, in memory: for every loaded font file of that family
// (one per size), the user's font is rendered at that size into new textures added to the font, and each glyph's entry
// in the game's glyph table is pointed at the new image and given the new spacing. The game then draws "its" font
// with the user's letters. Everything is put back as it was on Restore.
internal sealed unsafe class FontSwap
{
    public static readonly (string Label, string File, byte Type)[] Families =
    {
        ("Axis", "AXIS_", 0),
        ("Miedinger Med", "MiedingerMid_", 1),
        ("Miedinger", "Meidinger_", 2),
        ("Trump Gothic", "TrumpGothic_", 3),
        ("Jupiter", "Jupiter_", 4),
    };

    private sealed class Saved
    {
        public AtkFontManager.Font* Font;
        public AtkFontManager.Glyph[] Glyphs = null!;
        public nint[] Textures = null!;
        public ushort TextureCount;
        public uint KerningCount;
        public readonly List<nint> Ours = new();
    }

    private readonly List<Saved> saved = new();
    public string Status { get; set; } = "";
    public bool Active => saved.Count > 0;

    private static AtkFontManager* Manager()
    {
        var stage = AtkStage.Instance();
        return stage != null ? stage->AtkFontManager : null;
    }

    private static string FileOf(AtkFontManager.Font* font) =>
        font->FontdataResourceHandle != null ? font->FontdataResourceHandle->FileName.ToString() : "";

    // Game thread only.
    public void Apply(string path, int family, float scale, int bold, ITextureProvider textures)
    {
        Restore();
        path = path.Trim().Trim('"');
        if (!File.Exists(path)) { Status = "No font file at that path."; return; }
        var fm = Manager();
        if (fm == null || fm->Fonts == null) { Status = "The game's fonts aren't loaded yet."; return; }
        var prefix = "/" + Families[family].File;
        var bytes = File.ReadAllBytes(path);
        int fonts = 0, glyphs = 0, skipped = 0;
        try
        {
            for (var i = 0; i < fm->FontCount; i++)
            {
                var font = fm->Fonts + i;
                if (font->Glyphs == null || font->GlyphCount == 0 || !FileOf(font).Contains(prefix, StringComparison.OrdinalIgnoreCase)) continue;

                var s = new Saved
                {
                    Font = font,
                    Glyphs = new Span<AtkFontManager.Glyph>(font->Glyphs, (int)font->GlyphCount).ToArray(),
                    Textures = Enumerable.Range(0, AtkFontManager.Font.MaxTextures).Select(t => (nint)font->Textures[t].Value).ToArray(),
                    TextureCount = font->TextureCount,
                    KerningCount = font->KerningCount,
                };
                saved.Add(s);

                int pageW = font->TextureWidth > 0 ? font->TextureWidth : 1024, pageH = font->TextureHeight > 0 ? font->TextureHeight : 1024;
                var baked = FontBaker.Bake(bytes, s.Glyphs.Select(g => g.Utf8Value), font->LineHeight, font->Ascent, scale, bold, pageW, pageH);
                var freeSlots = AtkFontManager.Font.MaxTextures - font->TextureCount;
                var pages = Math.Min(baked.Pages.Count, freeSlots);
                var firstSlot = font->TextureCount;
                for (var p = 0; p < pages; p++)
                {
                    var wrap = textures.CreateFromRaw(RawImageSpecification.Bgra32(pageW, pageH), baked.Pages[p], "SmoothNameplates font");
                    var kernel = textures.ConvertToKernelTexture(wrap);
                    s.Ours.Add(kernel);
                    font->Textures[firstSlot + p] = (Texture*)kernel;
                }
                font->TextureCount = (ushort)(firstSlot + pages);

                var index = new Dictionary<uint, int>(s.Glyphs.Length);
                for (var g = 0; g < s.Glyphs.Length; g++) index.TryAdd(s.Glyphs[g].Utf8Value, g);
                foreach (var b in baked.Glyphs)
                {
                    if (!index.TryGetValue(b.Utf8Value, out var g)) continue;
                    if (b.Width > 0 && b.Page >= pages) { skipped++; continue; } // no texture slot left for its page
                    ref var entry = ref font->Glyphs[g];
                    if (b.Width > 0) entry.Packed = (b.X, b.Y, 0, firstSlot + b.Page);
                    entry.Width = b.Width;
                    entry.Height = b.Height;
                    entry.OffsetX = b.NextOffsetX;
                    entry.OffsetY = b.OffsetY;
                    glyphs++;
                }
                // the game's kerning pairs belong to its own letters
                font->KerningCount = 0;
                fonts++;
            }
        }
        catch (Exception e)
        {
            Restore();
            Status = "Couldn't use that font: " + e.Message;
            return;
        }
        Status = fonts == 0
            ? $"No loaded {Families[family].Label} fonts found."
            : $"Using {Path.GetFileName(path)} for {Families[family].Label}: {fonts} sizes, {glyphs} letters" + (skipped > 0 ? $" ({skipped} didn't fit)" : "");
    }

    // Game thread only.
    public void Restore()
    {
        foreach (var s in saved)
        {
            var font = s.Font;
            new Span<AtkFontManager.Glyph>(s.Glyphs).CopyTo(new Span<AtkFontManager.Glyph>(font->Glyphs, s.Glyphs.Length));
            for (var t = 0; t < AtkFontManager.Font.MaxTextures; t++) font->Textures[t] = (Texture*)s.Textures[t];
            font->TextureCount = s.TextureCount;
            font->KerningCount = s.KerningCount;
            foreach (var k in s.Ours) ((Texture*)k)->DecRef();
        }
        if (saved.Count > 0) Status = "Back to the game's own font.";
        saved.Clear();
    }
}
