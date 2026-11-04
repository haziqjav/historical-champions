-- Historical Champions — Phase 2 visual arena prototype
-- Builds a self-contained medieval desert fortress courtyard from Roblox parts.
-- Safe to rerun: replaces only the model named HC_VisualArena.
-- This is a greybox/art-direction prototype, not a final custom mesh environment.

local Workspace = game:GetService("Workspace")
local Lighting = game:GetService("Lighting")

local old = Workspace:FindFirstChild("HC_VisualArena")
if old then
    old:Destroy()
end

local arena = Instance.new("Model")
arena.Name = "HC_VisualArena"
arena.Parent = Workspace

local C = {
    sandstone = Color3.fromRGB(174, 137, 91),
    lightStone = Color3.fromRGB(205, 174, 128),
    darkStone = Color3.fromRGB(91, 75, 59),
    floor = Color3.fromRGB(119, 91, 62),
    sand = Color3.fromRGB(194, 157, 104),
    iron = Color3.fromRGB(53, 55, 57),
    gold = Color3.fromRGB(190, 145, 63),
    red = Color3.fromRGB(116, 35, 30),
    blue = Color3.fromRGB(35, 64, 91),
    flame = Color3.fromRGB(255, 146, 48),
}

local function part(name, size, cf, color, material, parent, shape)
    local p = Instance.new("Part")
    p.Name = name
    p.Size = size
    p.CFrame = cf
    p.Anchored = true
    p.Color = color
    p.Material = material or Enum.Material.Sandstone
    p.TopSurface = Enum.SurfaceType.Smooth
    p.BottomSurface = Enum.SurfaceType.Smooth
    if shape then p.Shape = shape end
    p.Parent = parent or arena
    return p
end

local function block(name, x, y, z, sx, sy, sz, color, material)
    return part(name, Vector3.new(sx, sy, sz), CFrame.new(x, y, z), color, material)
end

local function torch(x, y, z)
    local holder = block("Iron torch bracket", x, y, z, 0.35, 1.1, 0.35, C.iron, Enum.Material.Metal)
    local bowl = block("Torch brazier", x, y + 0.72, z, 0.8, 0.35, 0.8, C.darkStone, Enum.Material.Slate)
    local fire = part("Torch flame", Vector3.new(0.45, 0.85, 0.45), CFrame.new(x, y + 1.28, z), C.flame, Enum.Material.Neon, arena)
    fire.CanCollide = false
    local light = Instance.new("PointLight")
    light.Color = C.flame
    light.Brightness = 2.2
    light.Range = 18
    light.Parent = fire
    return holder, bowl, fire
end

local function banner(x, y, z, color, facing)
    local pole = block("Banner pole", x, y, z, 0.16, 5.5, 0.16, C.gold, Enum.Material.Metal)
    local cloth = part("House banner", Vector3.new(2.4, 3.1, 0.16), CFrame.new(x + facing * 1.15, y - 0.8, z), color, Enum.Material.Fabric)
    cloth.CanCollide = false
    local emblem = part("Banner emblem", Vector3.new(0.65, 0.65, 0.18), cloth.CFrame * CFrame.new(0, 0.35, -0.1), C.gold, Enum.Material.Metal)
    emblem.CanCollide = false
end

local function tower(cx, cz)
    -- Square tower body, corner pilasters, crenellated crown and roof cap.
    block("Fortress tower", cx, 11, cz, 13, 22, 13, C.sandstone, Enum.Material.Sandstone)
    for _, dx in ipairs({-5.5, 5.5}) do
        for _, dz in ipairs({-5.5, 5.5}) do
            block("Tower corner stone", cx + dx, 11, cz + dz, 1.2, 22.5, 1.2, C.lightStone, Enum.Material.Limestone)
        end
    end
    block("Tower parapet", cx, 22.5, cz, 14.5, 1.2, 14.5, C.darkStone, Enum.Material.Slate)
    for dx = -6, 6, 3 do
        for dz = -6, 6, 3 do
            if math.abs(dx) == 6 or math.abs(dz) == 6 then
                block("Tower merlon", cx + dx, 24, cz + dz, 1.5, 2.8, 1.5, C.lightStone, Enum.Material.Limestone)
            end
        end
    end
    block("Tower roof", cx, 25.6, cz, 9.5, 0.6, 9.5, C.darkStone, Enum.Material.Slate)
    for y = 5, 17, 6 do
        block("Arrow slit shadow", cx, y, cz - 6.57, 0.65, 2.6, 0.12, C.darkStone, Enum.Material.Slate)
    end
    torch(cx, 14, cz - 7.4)
end

-- Foundation and arena floor
block("Outer foundation", 0, -1.1, 0, 174, 2, 144, C.darkStone, Enum.Material.Slate)
block("Courtyard paving", 0, 0, 0, 164, 1, 134, C.sandstone, Enum.Material.Cobblestone)
block("Combat sand floor", 0, 0.58, 0, 86, 0.18, 58, C.sand, Enum.Material.Sand)
-- Border bands around the fighting ground
for _, z in ipairs({-31, 31}) do
    block("Arena border", 0, 0.72, z, 91, 0.45, 1.2, C.darkStone, Enum.Material.Slate)
end
for _, x in ipairs({-46, 46}) do
    block("Arena border", x, 0.72, 0, 1.2, 0.45, 63, C.darkStone, Enum.Material.Slate)
end

-- Four fortress towers
tower(-72, -56)
tower(72, -56)
tower(-72, 56)
tower(72, 56)

-- Perimeter walls, divided into stone courses
block("North curtain wall", 0, 9, -65, 132, 18, 7, C.sandstone, Enum.Material.Sandstone)
block("South curtain wall", 0, 9, 65, 132, 18, 7, C.sandstone, Enum.Material.Sandstone)
block("West curtain wall", -82, 9, 0, 7, 18, 112, C.sandstone, Enum.Material.Sandstone)
block("East curtain wall", 82, 9, 0, 7, 18, 112, C.sandstone, Enum.Material.Sandstone)

-- Wall walkways and battlements
for _, z in ipairs({-65, 65}) do
    block("Wall walk", 0, 18.4, z, 134, 1, 9, C.darkStone, Enum.Material.Slate)
    for x = -62, 62, 6 do
        block("Wall merlon", x, 20.2, z, 2.5, 3, 3.2, C.lightStone, Enum.Material.Limestone)
    end
end
for _, x in ipairs({-82, 82}) do
    block("Wall walk", x, 18.4, 0, 9, 1, 114, C.darkStone, Enum.Material.Slate)
    for z = -52, 52, 6 do
        block("Wall merlon", x, 20.2, z, 3.2, 3, 2.5, C.lightStone, Enum.Material.Limestone)
    end
end

-- Gatehouse on the south side: heavy portal with recessed dark opening.
block("Gatehouse left pier", -17, 12, 65, 8, 24, 12, C.lightStone, Enum.Material.Limestone)
block("Gatehouse right pier", 17, 12, 65, 8, 24, 12, C.lightStone, Enum.Material.Limestone)
block("Gatehouse lintel", 0, 24, 65, 28, 5, 12, C.lightStone, Enum.Material.Limestone)
block("Gate opening shadow", 0, 8, 58.7, 24, 16, 0.25, C.darkStone, Enum.Material.Slate)
block("Portcullis beam", 0, 15, 58, 22, 0.8, 1, C.iron, Enum.Material.Metal)
for x = -10, 10, 2 do
    block("Portcullis iron bar", x, 8, 58, 0.35, 14, 0.35, C.iron, Enum.Material.Metal)
end
banner(-23, 21, 57, C.red, 1)
banner(23, 21, 57, C.blue, -1)

-- Central raised dais and four ornamental corner pillars
block("Champion dais", 0, 1.3, 0, 18, 1.2, 12, C.darkStone, Enum.Material.Slate)
block("Dais top", 0, 2.05, 0, 15, 0.35, 9, C.lightStone, Enum.Material.Limestone)
for x = -7, 7, 14 do
    for z = -4, 4, 8 do
        block("Dais gold post", x, 4.2, z, 0.55, 4, 0.55, C.gold, Enum.Material.Metal)
    end
end

-- Torches around the courtyard and banners on the walls
for _, x in ipairs({-48, -24, 24, 48}) do
    torch(x, 4, -59)
    torch(x, 4, 59)
end
for _, z in ipairs({-35, 0, 35}) do
    torch(-76, 4, z)
    torch(76, 4, z)
end
banner(-42, 16, -60, C.red, 1)
banner(42, 16, -60, C.blue, -1)

-- Spawn pads for the two fighters
local spawnA = Instance.new("SpawnLocation")
spawnA.Name = "ChampionSpawn_Red"
spawnA.Size = Vector3.new(7, 1, 7)
spawnA.CFrame = CFrame.new(-24, 1.2, 0)
spawnA.Anchored = true
spawnA.Neutral = true
spawnA.Duration = 0
spawnA.Color = C.red
spawnA.Material = Enum.Material.Slate
spawnA.Parent = arena

local spawnB = Instance.new("SpawnLocation")
spawnB.Name = "ChampionSpawn_Blue"
spawnB.Size = Vector3.new(7, 1, 7)
spawnB.CFrame = CFrame.new(24, 1.2, 0)
spawnB.Anchored = true
spawnB.Neutral = true
spawnB.Duration = 0
spawnB.Color = C.blue
spawnB.Material = Enum.Material.Slate
spawnB.Parent = arena

-- Environment lighting: warm late-afternoon desert mood.
Lighting.ClockTime = 17.2
Lighting.Brightness = 2
Lighting.Ambient = Color3.fromRGB(112, 91, 76)
Lighting.OutdoorAmbient = Color3.fromRGB(145, 121, 94)
Lighting.EnvironmentDiffuseScale = 0.45
Lighting.EnvironmentSpecularScale = 0.55

local atmosphere = Lighting:FindFirstChildOfClass("Atmosphere") or Instance.new("Atmosphere")
atmosphere.Density = 0.28
atmosphere.Offset = 0.15
atmosphere.Color = Color3.fromRGB(222, 185, 139)
atmosphere.Decay = Color3.fromRGB(112, 87, 69)
atmosphere.Glare = 0.25
atmosphere.Haze = 1.4
atmosphere.Parent = Lighting

local bloom = Lighting:FindFirstChild("HC_ArenaBloom") or Instance.new("BloomEffect")
bloom.Name = "HC_ArenaBloom"
bloom.Intensity = 0.22
bloom.Size = 24
bloom.Threshold = 1.8
bloom.Parent = Lighting

local color = Lighting:FindFirstChild("HC_ArenaColor") or Instance.new("ColorCorrectionEffect")
color.Name = "HC_ArenaColor"
color.Brightness = 0.02
color.Contrast = 0.12
color.Saturation = -0.08
color.TintColor = Color3.fromRGB(255, 231, 202)
color.Parent = Lighting

print("[HistoricalChampions] Phase 2 visual arena generated. Inspect Workspace.HC_VisualArena.")
