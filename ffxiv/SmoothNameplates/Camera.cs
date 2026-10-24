using System.Numerics;
using FFXIVClientStructs.FFXIV.Client.Game.Control;
using FFXIVClientStructs.FFXIV.Client.Graphics.Kernel;

namespace SmoothNameplates;

// One frame's camera. The render camera keeps two projections: ProjectionMatrix2 carries the anti-aliasing's
// per-frame sub-pixel shake (TAA/DLSS/FSR), ProjectionMatrix doesn't. Projecting with the clean one keeps names from
// wobbling a quarter pixel in step with the anti-aliasing while the scene itself holds still.
internal unsafe struct View
{
    public Matrix4x4 ViewProj;
    public Vector3 Position;
    public float Width, Height;
    public bool Ok;

    public static View Capture()
    {
        var v = new View();
        var device = Device.Instance();
        var cm = CameraManager.Instance();
        if (device == null || cm == null || cm->Camera == null) return v;
        var scene = &cm->Camera->CameraBase.SceneCamera;
        if (scene->RenderCamera == null) return v;

        Matrix4x4 view = scene->ViewMatrix;
        Matrix4x4 proj = scene->RenderCamera->ProjectionMatrix;
        if (!Matrix4x4.Invert(view, out var inverse)) return v;
        v.ViewProj = view * proj;
        v.Position = inverse.Translation;
        v.Width = device->Width;
        v.Height = device->Height;
        v.Ok = true;
        return v;
    }

    public readonly bool Project(Vector3 world, Vector2 origin, out Vector2 screen)
    {
        screen = default;
        if (!Ok) return false;
        var c = Vector4.Transform(new Vector4(world, 1), ViewProj);
        if (c.W <= float.Epsilon) return false;
        screen = new Vector2((c.X / c.W + 1) * Width / 2 + origin.X, (1 - c.Y / c.W) * Height / 2 + origin.Y);
        return true;
    }
}

// One Euro filter: heavy smoothing while a value holds steady, quick catch-up when it really moves.
internal struct OneEuro
{
    public bool Ready;
    public float X, Dx;

    public float Step(float v, float dt, float minCutoff, float beta)
    {
        if (!Ready) { Ready = true; X = v; Dx = 0; return v; }
        Dx += Alpha(dt, 1f) * ((v - X) / dt - Dx);
        X += Alpha(dt, minCutoff + beta * System.MathF.Abs(Dx)) * (v - X);
        return X;
    }

    private static float Alpha(float dt, float cutoff) => 1f / (1f + 1f / (2 * System.MathF.PI * cutoff * dt));
}
