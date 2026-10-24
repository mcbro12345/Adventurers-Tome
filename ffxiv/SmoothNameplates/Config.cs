using System;
using Dalamud.Configuration;

namespace SmoothNameplates;

[Serializable]
public sealed class Config : IPluginConfiguration
{
    public const int Current = 6;
    public int Version { get; set; } = Current;

    // the look of the game's own name text
    public int Font = 4;             // -1 = the game's choice, else FontType: 0 Axis, 1 Miedinger Med, 2 Miedinger, 3 Trump Gothic, 4 Jupiter, 5 Jupiter Large
    public float Size = 1.0f;        // times the game's size
    public bool Bold = false;
    public bool Outline = true;      // the game's edge
    public bool Glow = false;        // the game's glare
    public bool Sharp = true;        // draw at the real size instead of the fixed font resolution

    // movement
    public bool Smooth = true;       // place tags from the clean camera on a steady point, not the game's whole-pixel spot
}
