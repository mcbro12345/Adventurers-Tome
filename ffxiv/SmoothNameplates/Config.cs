using System;
using Dalamud.Configuration;

namespace SmoothNameplates;

[Serializable]
public sealed class Config : IPluginConfiguration
{
    public const int Current = 5;
    public int Version { get; set; } = Current;

    // look
    public string FontPath = "";     // e.g. your own FRIZQT__.TTF; empty = Noto Sans
    public float TextScale = 1.0f;
    public bool Outline = true;      // WoW's "NORMAL" outline (SystemFont_NamePlate_Outlined)
    public float OutlinePx = 1.0f;
    public bool Shadow = false;

    // WoW's nameplate CVars at their client defaults (Ketho/BlizzardInterfaceResources, Resources/CVars.lua)
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

    // timing: which frame's camera the overlay draws with (0 = the frame the plates were just laid out for)
    public int DrawDelay = 0;
}
