using System;
using System.Collections.Generic;
using StbTrueTypeSharp;
using static StbTrueTypeSharp.StbTrueType;

namespace SmoothNameplates;

// One glyph of the user's font, laid out the way the game's font tables describe glyphs: an image of
// Width x Height drawn at the pen position, OffsetY below the top of the line, after which the pen moves
// Width + NextOffsetX to the right.
internal struct BakedGlyph
{
    public uint Utf8Value;    // the game's key: the character's UTF-8 bytes read as one big-endian number
    public int Page, X, Y;
    public byte Width, Height;
    public sbyte NextOffsetX, OffsetY;
}

internal sealed class BakedFont
{
    public readonly List<BakedGlyph> Glyphs = new();
    public readonly List<byte[]> Pages = new(); // BGRA, the same coverage in every channel
    public int PageWidth, PageHeight;
    public float Scale, Baseline, CapHeight; // for the settings window
}

// Renders a TrueType/OpenType font with StbTrueType into texture pages shaped like the game's font textures.
internal static unsafe class FontBaker
{
    private const int Pad = 2; // empty texels around each glyph, so the game's outline has room

    // How the user's font is sized against each size of the game's font (the game switches between sizes as tags shrink
    // with distance, so the sizing has to stay in proportion across them).
    public enum Sizing { FontSize = 0, FitLine = 1, MatchCapitals = 2 }

    public readonly record struct Target(int LineHeight, int Ascent, float PointSize, int CapHeight, int CapBaseline);

    public static BakedFont Bake(byte[] fontFile, IEnumerable<uint> utf8Values, Target target, Sizing sizing,
                                 float size, int bold, int pageWidth, int pageHeight)
    {
        var result = new BakedFont { PageWidth = pageWidth, PageHeight = pageHeight };
        fixed (byte* data = fontFile)
        {
            var info = new stbtt_fontinfo();
            if (stbtt_InitFont(info, data, 0) == 0) throw new InvalidOperationException("That file isn't a font StbTrueType can read.");
            int fontAscent, fontDescent, lineGap;
            stbtt_GetFontVMetrics(info, &fontAscent, &fontDescent, &lineGap);
            float scale, baseline;
            int hx0 = 0, hy0 = 0, hx1 = 0, hy1 = 0;
            var capGlyph = stbtt_FindGlyphIndex(info, 'H');
            var hasCap = capGlyph != 0 && stbtt_GetGlyphBox(info, capGlyph, &hx0, &hy0, &hx1, &hy1) != 0 && hy1 > 0;
            if (sizing == Sizing.FontSize && target.PointSize > 0)
            {
                // the game font's nominal size (points, at 96 dpi) as our em, on the game's baseline
                scale = stbtt_ScaleForMappingEmToPixels(info, target.PointSize * 4 / 3 * size);
                baseline = target.Ascent;
            }
            else if (sizing == Sizing.MatchCapitals && target.CapHeight > 0 && hasCap)
            {
                // our "H" as tall as the game's, standing on the same baseline
                scale = target.CapHeight * size / hy1;
                baseline = target.CapBaseline;
            }
            else
            {
                // the font's whole line (ascender to descender) fills the game font's line height; our line box starts at
                // the top of the game's line
                scale = stbtt_ScaleForPixelHeight(info, target.LineHeight * size);
                baseline = MathF.Round(fontAscent * scale);
            }
            result.Scale = scale;
            result.Baseline = baseline;
            result.CapHeight = hasCap ? hy1 * scale : 0;

            byte[]? page = null;
            int penX = Pad, penY = Pad, rowH = 0;
            foreach (var utf8 in utf8Values)
            {
                var cp = Decode(utf8);
                if (cp < 0) continue;
                var g = stbtt_FindGlyphIndex(info, cp);
                if (g == 0 && cp != ' ') continue; // the font hasn't got it: leave the game's glyph

                int advance, lsb, x0, y0, x1, y1;
                stbtt_GetGlyphHMetrics(info, g, &advance, &lsb);
                stbtt_GetGlyphBitmapBox(info, g, scale, scale, &x0, &y0, &x1, &y1);
                var adv = (int)MathF.Round(advance * scale) + bold;

                // the game has no left bearing per glyph: the image starts at the pen, so blank columns stand in for a
                // positive bearing, and a negative one is moved right
                var left = Math.Max(0, x0);
                var inkW = Math.Max(0, x1 - x0);
                var inkH = Math.Max(0, y1 - y0);
                var w = inkW == 0 ? 0 : left + inkW + bold;
                var h = inkW == 0 ? 0 : inkH;
                if (w > 255 || h > 255) continue;

                var glyph = new BakedGlyph
                {
                    Utf8Value = utf8,
                    Width = (byte)w,
                    Height = (byte)h,
                    NextOffsetX = (sbyte)Math.Clamp(adv - w, sbyte.MinValue, sbyte.MaxValue),
                    OffsetY = (sbyte)Math.Clamp(baseline + y0, sbyte.MinValue, sbyte.MaxValue),
                };

                if (w > 0)
                {
                    if (penX + w + Pad > pageWidth) { penX = Pad; penY += rowH + Pad; rowH = 0; }
                    if (page == null || penY + h + Pad > pageHeight)
                    {
                        page = new byte[pageWidth * pageHeight * 4];
                        result.Pages.Add(page);
                        penX = Pad; penY = Pad; rowH = 0;
                    }

                    var ink = new byte[inkW * inkH];
                    fixed (byte* p = ink) stbtt_MakeGlyphBitmap(info, p, inkW, inkH, inkW, scale, scale, g);
                    for (var y = 0; y < inkH; y++)
                        for (var x = 0; x < inkW; x++)
                        {
                            var v = ink[y * inkW + x];
                            if (v == 0) continue;
                            // faux bold: the ink smeared `bold` pixels to the right
                            for (var b = 0; b <= bold; b++)
                            {
                                var o = ((penY + y) * pageWidth + penX + left + x + b) * 4;
                                if (page[o] >= v) continue;
                                page[o] = page[o + 1] = page[o + 2] = page[o + 3] = v;
                            }
                        }

                    glyph.Page = result.Pages.Count - 1;
                    glyph.X = penX;
                    glyph.Y = penY;
                    penX += w + Pad;
                    rowH = Math.Max(rowH, h);
                }
                result.Glyphs.Add(glyph);
            }
        }
        return result;
    }

    // The game keys glyphs by the character's UTF-8 bytes read as a big-endian number ('A' = 0x41, 'é' = 0xC3A9).
    public static int Decode(uint utf8)
    {
        Span<byte> bytes = stackalloc byte[4];
        var n = 0;
        for (var shift = 24; shift >= 0; shift -= 8)
        {
            var b = (byte)(utf8 >> shift);
            if (n == 0 && b == 0) continue;
            bytes[n++] = b;
        }
        if (n == 0) return -1;
        return System.Text.Rune.DecodeFromUtf8(bytes[..n], out var rune, out var used) == System.Buffers.OperationStatus.Done && used == n
            ? rune.Value : -1;
    }

    public static uint Encode(int codepoint)
    {
        Span<byte> bytes = stackalloc byte[4];
        var n = new System.Text.Rune(codepoint).EncodeToUtf8(bytes);
        uint v = 0;
        for (var i = 0; i < n; i++) v = (v << 8) | bytes[i];
        return v;
    }
}
