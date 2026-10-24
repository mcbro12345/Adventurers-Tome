using System;
using Dalamud.Configuration;

namespace SmoothNameplates;

[Serializable]
public sealed class Config : IPluginConfiguration
{
    public const int Current = 8;
    public int Version { get; set; } = Current;

    // the look of the game's own name text
    public int Font = -1;            // -1 = the game's choice, else FontType: 0 Axis, 1 Miedinger Med, 2 Miedinger, 3 Trump Gothic, 4 Jupiter, 5 Jupiter Large
    public float Size = 1.0f;        // times the game's size
    public float NpcSize = 1.0f;     // times that again, for every tag that isn't a player's
    public int LineSpacing = 0;      // pixels added to the game's space between the name, title and free company lines
    public int NpcLineSpacing = 0;   // the same, for every tag that isn't a player's

    // your own font, put into one of the game's font families (see FontSwap)
    public string CustomFont = "";   // path to a .ttf/.otf; empty = off
    public int CustomFamily = 0;     // index into FontSwap.Families (default: Axis, the tags' own)
    public float CustomScale = 1.0f; // how much of the game font's line the letters fill
    public int Sizing = 0;           // FontBaker.Sizing: 0 font size, 1 fit line, 2 match capitals
    public int Bold = 0;             // faux bold: pixels the letters are thickened by
}
