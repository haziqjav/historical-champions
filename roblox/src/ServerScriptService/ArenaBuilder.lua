-- Builds the first greybox medieval desert arena using native Roblox parts.
-- Safe to regenerate: the previous generated arena folder is replaced.
local ArenaBuilder = {}

local Workspace = game:GetService("Workspace")
local Lighting = game:GetService("Lighting")

local function part(parent, name, size, cframe, color, material, shape)
    local p = Instance.new("Part")
    p.Name = name
    p.Size = size
    p.CFrame = cframe
    p.Anchored = true
    p.TopSurface = Enum.SurfaceType.Smooth
    p.BottomSurface = Enum.SurfaceType.Smooth
    p.Color = color
    p.Material = material or Enum.Material.Sandstone
    if shape then p.Shape = shape end
    p.Parent = parent
    return p
end

local function point(x, y, z)
    return CFrame.new(x, y, z)
end

local function buildTower(parent, x, z)
    part(parent, "FortressTower", Vector3.new(18, 34, 18), point(x, 19, z), Color3.fromRGB(133, 105, 77), Enum.Material.Sandstone)
    part(parent, "TowerBattlement", Vector3.new(22, 4, 22), point(x, 38, z), Color3.fromRGB(165, 135, 99), Enum.Material.Limestone)
    for i = 1, 4 do
        local angle = math.rad((i - 1) * 90)
        local dx, dz = math.cos(angle) * 10, math.sin(angle) * 10
        part(parent, "BattlementMerlon", Vector3.new(5, 5, 5), point(x + dx, 42, z + dz), Color3.fromRGB(165, 135, 99), Enum.Material.Limestone)
    end
    part(parent, "TowerWindow", Vector3.new(3, 8, 0.6), point(x, 24, z - 9.4), Color3.fromRGB(38, 31, 25), Enum.Material.Slate)
end

local function buildTorch(parent, x, z)
    local pole = part(parent, "TorchPost", Vector3.new(1.2, 9, 1.2), point(x, 7, z), Color3.fromRGB(76, 49, 30), Enum.Material.Wood)
    local holder = part(parent, "TorchBowl", Vector3.new(2.5, 1.2, 2.5), point(x, 12, z), Color3.fromRGB(70, 66, 60), Enum.Material.Metal, Enum.PartType.Ball)
    local fire = Instance.new("Fire")
    fire.Heat = 7
    fire.Size = 5
    fire.Parent = holder
    local light = Instance.new("PointLight")
    light.Color = Color3.fromRGB(255, 164, 74)
    light.Brightness = 1.8
    light.Range = 22
    light.Parent = holder
    return pole
end

local function buildBanner(parent, x, z, color, facing)
    local cf = point(x, 17, z)
    part(parent, "BannerPole", Vector3.new(0.8, 30, 0.8), cf, Color3.fromRGB(76, 48, 27), Enum.Material.Wood)
    local cloth = part(parent, "ChampionBanner", Vector3.new(11, 15, 0.5), point(x, 23, z), color, Enum.Material.Fabric)
    cloth.CFrame = cloth.CFrame * CFrame.Angles(0, math.rad(facing), 0)
    part(parent, "BannerCrossbar", Vector3.new(13, 0.8, 0.8), point(x, 30.5, z), Color3.fromRGB(177, 143, 89), Enum.Material.Metal)
end

function ArenaBuilder.Build()
    local previous = Workspace:FindFirstChild("HistoricalChampionsArena")
    if previous then previous:Destroy() end

    local arena = Instance.new("Folder")
    arena.Name = "HistoricalChampionsArena"
    arena.Parent = Workspace

    local sand = Color3.fromRGB(194, 159, 108)
    local stone = Color3.fromRGB(137, 126, 108)
    local darkStone = Color3.fromRGB(85, 78, 68)

    -- Large desert foundation and raised circular fighting platform.
    part(arena, "DesertFoundation", Vector3.new(220, 6, 220), point(0, -5, 0), sand, Enum.Material.Sand)
    part(arena, "OuterStoneRing", Vector3.new(118, 5, 118), point(0, 0, 0), darkStone, Enum.Material.Slate, Enum.PartType.Cylinder)
    part(arena, "ArenaMainPlatform", Vector3.new(108, 5, 108), point(0, 3, 0), stone, Enum.Material.Limestone, Enum.PartType.Cylinder)
    part(arena, "ArenaInnerFloor", Vector3.new(84, 0.7, 84), point(0, 5.7, 0), Color3.fromRGB(174, 157, 127), Enum.Material.Slate, Enum.PartType.Cylinder)
    part(arena, "CentralEmblem", Vector3.new(24, 0.35, 24), point(0, 6.2, 0), Color3.fromRGB(112, 91, 66), Enum.Material.Cobblestone, Enum.PartType.Cylinder)

    -- Rectangular outer curtain wall with a southern gate opening.
    part(arena, "NorthWall", Vector3.new(170, 22, 8), point(0, 11, -82), stone, Enum.Material.Sandstone)
    part(arena, "WestWall", Vector3.new(8, 22, 170), point(-82, 11, 0), stone, Enum.Material.Sandstone)
    part(arena, "EastWall", Vector3.new(8, 22, 170), point(82, 11, 0), stone, Enum.Material.Sandstone)
    part(arena, "SouthWallLeft", Vector3.new(68, 22, 8), point(-51, 11, 82), stone, Enum.Material.Sandstone)
    part(arena, "SouthWallRight", Vector3.new(68, 22, 8), point(51, 11, 82), stone, Enum.Material.Sandstone)
    part(arena, "GateLintel", Vector3.new(38, 7, 10), point(0, 24, 82), darkStone, Enum.Material.Slate)
    part(arena, "GateDoorLeft", Vector3.new(2, 17, 4), point(-17, 8.5, 78), Color3.fromRGB(82, 51, 30), Enum.Material.Wood)
    part(arena, "GateDoorRight", Vector3.new(2, 17, 4), point(17, 8.5, 78), Color3.fromRGB(82, 51, 30), Enum.Material.Wood)

    buildTower(arena, -82, -82)
    buildTower(arena, 82, -82)
    buildTower(arena, -82, 82)
    buildTower(arena, 82, 82)

    -- Two opposing team entry platforms and spawn locations.
    part(arena, "WestSpawnPad", Vector3.new(24, 1, 24), point(-49, 0.5, 0), Color3.fromRGB(91, 112, 123), Enum.Material.Slate)
    part(arena, "EastSpawnPad", Vector3.new(24, 1, 24), point(49, 0.5, 0), Color3.fromRGB(151, 104, 77), Enum.Material.Slate)

    local spawnA = Instance.new("SpawnLocation")
    spawnA.Name = "WestChampionSpawn"
    spawnA.Size = Vector3.new(8, 1, 8)
    spawnA.CFrame = point(-49, 2, 0)
    spawnA.Anchored = true
    spawnA.Neutral = true
    spawnA.Duration = 0
    spawnA.Transparency = 1
    spawnA.CanCollide = false
    spawnA.Parent = arena

    local spawnB = spawnA:Clone()
    spawnB.Name = "EastChampionSpawn"
    spawnB.CFrame = point(49, 2, 0)
    spawnB.Parent = arena

    buildBanner(arena, -49, -17, Color3.fromRGB(35, 83, 105), 0)
    buildBanner(arena, 49, -17, Color3.fromRGB(139, 48, 38), 180)

    buildTorch(arena, -57, -42)
    buildTorch(arena, 57, -42)
    buildTorch(arena, -57, 42)
    buildTorch(arena, 57, 42)

    -- Low perimeter rocks provide a little desert silhouette without blocking play.
    for i = 1, 18 do
        local angle = (math.pi * 2) * (i / 18)
        local x, z = math.cos(angle) * 103, math.sin(angle) * 103
        local rock = part(arena, "DesertRock", Vector3.new(10, 5, 8), point(x, -0.5, z), Color3.fromRGB(151, 119, 82), Enum.Material.Rock)
        rock.CFrame = rock.CFrame * CFrame.Angles(0, angle, math.rad((i % 3) * 4))
    end

    Lighting.ClockTime = 16.5
    Lighting.Brightness = 2
    Lighting.Ambient = Color3.fromRGB(125, 112, 94)
    Lighting.OutdoorAmbient = Color3.fromRGB(160, 143, 115)
    Lighting.FogColor = Color3.fromRGB(215, 181, 132)
    Lighting.FogStart = 180
    Lighting.FogEnd = 420

    local atmosphere = Lighting:FindFirstChildOfClass("Atmosphere")
    if not atmosphere then
        atmosphere = Instance.new("Atmosphere")
        atmosphere.Parent = Lighting
    end
    atmosphere.Density = 0.22
    atmosphere.Offset = 0.1
    atmosphere.Color = Color3.fromRGB(214, 183, 140)
    atmosphere.Decay = Color3.fromRGB(118, 91, 68)

    print("[HistoricalChampions] Medieval desert arena generated.")
end

return ArenaBuilder
