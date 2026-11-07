-- Champion-colored signature and combat impact effects.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Debris = game:GetService("Debris")
local remote = ReplicatedStorage:WaitForChild("HistoricalChampionsRemotes"):WaitForChild("ActionFeedback")

local palette = {
    Salahuddin = Color3.fromRGB(54,190,145),
    BaldwinIV = Color3.fromRGB(232,198,92),
    Reynald = Color3.fromRGB(190,65,55),
    Guy = Color3.fromRGB(220,220,205),
    Balian = Color3.fromRGB(115,165,220),
    Nooruddin = Color3.fromRGB(70,175,205),
    Shirkuh = Color3.fromRGB(190,145,65),
    Bori = Color3.fromRGB(165,105,210),
}

local function burst(position,color,large)
    if typeof(position) ~= "Vector3" then return end
    local anchor = Instance.new("Part")
    anchor.Name = "HC_CombatBurst"
    anchor.Size = Vector3.new(.2,.2,.2)
    anchor.Transparency = 1
    anchor.Anchored = true
    anchor.CanCollide = false
    anchor.CanQuery = false
    anchor.CanTouch = false
    anchor.CFrame = CFrame.new(position)
    anchor.Parent = workspace

    local emitter = Instance.new("ParticleEmitter")
    emitter.Texture = "rbxasset://textures/particles/sparkles_main.dds"
    emitter.Color = ColorSequence.new(color)
    emitter.LightEmission = .85
    emitter.Lifetime = NumberRange.new(.18,.42)
    emitter.Speed = NumberRange.new(large and 22 or 10,large and 34 or 18)
    emitter.SpreadAngle = Vector2.new(180,180)
    emitter.Rotation = NumberRange.new(0,360)
    emitter.RotSpeed = NumberRange.new(-180,180)
    emitter.Size = NumberSequence.new({
        NumberSequenceKeypoint.new(0,large and .75 or .35),
        NumberSequenceKeypoint.new(1,0)
    })
    emitter.Transparency = NumberSequence.new({
        NumberSequenceKeypoint.new(0,.05),
        NumberSequenceKeypoint.new(1,1)
    })
    emitter.Parent = anchor
    emitter:Emit(large and 42 or 18)
    Debris:AddItem(anchor,1)
end

local function signature(data)
    local color = palette[data.champion] or Color3.fromRGB(235,190,95)
    local fighter
    for _,candidate in ipairs(Players:GetPlayers()) do
        if candidate.UserId == data.userId then fighter = candidate break end
    end
    local character = fighter and fighter.Character
    local root = character and character:FindFirstChild("HumanoidRootPart")
    if not root then
        burst(data.position,color,true)
        return
    end

    local glow = Instance.new("Highlight")
    glow.Name = "HC_SignatureGlow"
    glow.Adornee = character
    glow.FillColor = color
    glow.OutlineColor = Color3.new(1,1,1)
    glow.FillTransparency = .55
    glow.OutlineTransparency = .1
    glow.DepthMode = Enum.HighlightDepthMode.Occluded
    glow.Parent = character
    Debris:AddItem(glow,.55)

    local ring = Instance.new("Part")
    ring.Name = "HC_SignatureRing"
    ring.Shape = Enum.PartType.Cylinder
    ring.Size = Vector3.new(.22,7,7)
    ring.Material = Enum.Material.Neon
    ring.Color = color
    ring.Transparency = .18
    ring.Anchored = true
    ring.CanCollide = false
    ring.CanQuery = false
    ring.CanTouch = false
    ring.CFrame = CFrame.new(root.Position-Vector3.new(0,2.5,0))*CFrame.Angles(0,0,math.rad(90))
    ring.Parent = workspace
    task.spawn(function()
        for step=1,8 do
            if not ring.Parent then break end
            ring.Size = Vector3.new(.22,7+step*2,7+step*2)
            ring.Transparency = .18+step*.095
            task.wait(.025)
        end
    end)
    Debris:AddItem(ring,.35)
    burst(root.Position+Vector3.new(0,1,0),color,true)
end

remote.OnClientEvent:Connect(function(event,data)
    if typeof(data) ~= "table" then return end
    if event == "SignatureCue" then
        signature(data)
    elseif event == "Hit" then
        burst(data.position,data.blocked and Color3.fromRGB(105,190,255) or Color3.fromRGB(255,185,92),data.heavy == true)
    elseif event == "Parried" then
        burst(data.position,Color3.fromRGB(125,205,255),true)
    elseif event == "DodgeEvade" then
        burst(data.position,Color3.fromRGB(170,220,235),false)
    end
end)
