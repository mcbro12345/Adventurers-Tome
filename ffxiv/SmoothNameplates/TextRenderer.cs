using System;
using System.Collections.Generic;
using System.Numerics;
using System.Text;
using Dalamud.Bindings.ImGui;
using Dalamud.Interface.Utility;
using Lumina.Text.Expressions;
using Lumina.Text.Payloads;
using Lumina.Text.ReadOnly;

namespace SmoothNameplates;

// A run of text in one colour, as the game would colour it.
internal struct Run
{
    public string Text;
    public uint Color, Edge; // ImGui RGBA (0xAABBGGRR)
}

internal sealed class Line
{
    public readonly List<Run> Runs = new();
}

// WoW draws nameplate text as vector glyphs (Slug): every letter sits at its exact fractional position and scales
// smoothly. Dalamud's own SeString renderer rounds each glyph to whole pixels, so this draws the glyphs itself: a font
// baked larger than it is shown, with oversampling and no pixel snapping, drawn as float-positioned quads.
internal static unsafe class TextRenderer
{
    // Splits the game's text into coloured lines, following its colour macros the way the game does (a stack per kind).
    public static List<Line> Parse(ReadOnlySpan<byte> bytes, uint baseColor, uint baseEdge, uint[]? uiColors)
    {
        var lines = new List<Line> { new() };
        var color = new List<uint> { baseColor };
        var edge = new List<uint> { baseEdge };
        var text = new StringBuilder();

        void Flush()
        {
            if (text.Length == 0) return;
            lines[^1].Runs.Add(new Run { Text = text.ToString(), Color = color[^1], Edge = edge[^1] });
            text.Clear();
        }

        foreach (var p in new ReadOnlySeStringSpan(bytes))
        {
            if (p.Type == ReadOnlySePayloadType.Text)
            {
                text.Append(Encoding.UTF8.GetString(p.Body));
                continue;
            }
            if (p.Type != ReadOnlySePayloadType.Macro) continue;
            switch (p.MacroCode)
            {
                case MacroCode.NewLine:
                    Flush();
                    lines.Add(new Line());
                    break;
                case MacroCode.Color:
                    Flush();
                    Adjust(color, p);
                    break;
                case MacroCode.EdgeColor:
                    Flush();
                    Adjust(edge, p);
                    break;
                case MacroCode.ColorType:
                    Flush();
                    AdjustType(color, p, uiColors);
                    break;
                case MacroCode.EdgeColorType:
                    Flush();
                    AdjustType(edge, p, uiColors);
                    break;
                case MacroCode.NonBreakingSpace:
                    text.Append(' ');
                    break;
                case MacroCode.Hyphen:
                case MacroCode.SoftHyphen:
                    text.Append('-');
                    break;
            }
        }
        Flush();
        lines.RemoveAll(l => l.Runs.Count == 0);
        return lines;
    }

    private static void Adjust(List<uint> stack, ReadOnlySePayloadSpan p)
    {
        if (!p.TryGetExpression(out var e)) return;
        if (e.TryGetPlaceholderExpression(out var ph) && ph == (int)ExpressionType.StackColor)
        {
            if (stack.Count > 1) stack.RemoveAt(stack.Count - 1);
            return;
        }
        if (e.TryGetUInt(out var bgra))
        {
            // <color(0)> pushes the current colour again
            stack.Add(bgra == 0 ? stack[^1] : SwapRedBlue(bgra) | 0xFF000000u);
            return;
        }
        stack.Add(stack[^1]);
    }

    private static void AdjustType(List<uint> stack, ReadOnlySePayloadSpan p, uint[]? uiColors)
    {
        if (!p.TryGetExpression(out var e) || !e.TryGetUInt(out var id)) return;
        if (id == 0)
        {
            if (stack.Count > 1) stack.RemoveAt(stack.Count - 1);
            return;
        }
        stack.Add(uiColors != null && id < uiColors.Length && uiColors[id] != 0 ? uiColors[id] : stack[^1]);
    }

    private static uint SwapRedBlue(uint c) => (c & 0xFF00FF00u) | ((c >> 16) & 0xFF) | ((c & 0xFF) << 16);

    public static float Measure(ImFontPtr font, string s, float scale)
    {
        float w = 0;
        foreach (var r in s.EnumerateRunes()) w += Glyph(font, r).AdvanceX * scale;
        return w;
    }

    private static ref ImGuiHelpers.ImFontGlyphReal Glyph(ImFontPtr font, Rune r)
    {
        var p = r.Value < ushort.MaxValue ? (ImFontGlyphPtr)font.FindGlyph((ushort)r.Value) : font.FallbackGlyph;
        return ref *(ImGuiHelpers.ImFontGlyphReal*)p.Handle;
    }

    // Draws one run starting at the float position `pen` (left edge, top of the line box) and returns the pen after it.
    public static Vector2 DrawRun(ImDrawListPtr dl, ImFontPtr font, Vector2 pen, string s, float scale, uint color,
                                  uint edge, float outline, Vector2 shadow, uint shadowColor, int pass)
    {
        foreach (var r in s.EnumerateRunes())
        {
            ref var g = ref Glyph(font, r);
            if (g.Visible)
            {
                var tex = font.ContainerAtlas.Textures.Ref<ImFontAtlasTexture>(g.TextureIndex).TexID;
                var a = pen + new Vector2(g.X0, g.Y0) * scale;
                var b = pen + new Vector2(g.X1, g.Y1) * scale;
                var uv0 = new Vector2(g.U0, g.V0);
                var uv1 = new Vector2(g.U1, g.V1);
                switch (pass)
                {
                    case 0 when shadowColor >> 24 != 0 && shadow != Vector2.Zero:
                        dl.AddImage(tex, a + shadow, b + shadow, uv0, uv1, shadowColor);
                        break;
                    case 1 when outline > 0 && edge >> 24 != 0:
                        // eight taps around the glyph make an even outline, like WoW's "NORMAL" outline
                        for (var k = 0; k < 8; k++)
                        {
                            var ang = k * MathF.PI / 4;
                            var o = new Vector2(MathF.Cos(ang), MathF.Sin(ang)) * outline;
                            dl.AddImage(tex, a + o, b + o, uv0, uv1, edge);
                        }
                        break;
                    case 2:
                        dl.AddImage(tex, a, b, uv0, uv1, color);
                        break;
                }
            }
            pen.X += g.AdvanceX * scale;
        }
        return pen;
    }

    public static uint WithAlpha(uint c, float a) =>
        (c & 0x00FFFFFFu) | ((uint)Math.Clamp((c >> 24) * a, 0, 255) << 24);
}
