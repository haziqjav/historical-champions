-- Phase 3 client feedback: combat HUD, impact visuals, floating feedback, and slash cues.
-- All damage and combat decisions are still made by the server.

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")
local Debris = game:GetService("Debris")

local player = Players.LocalPlayer
local remotes = ReplicatedStorage:WaitForChild("HistoricalChampionsRemotes")
local feedback = remotes:WaitForChild("ActionFeedback")
local playerGui = player:WaitForChild("PlayerGui")

local oldGui = playerGui:FindFirstChild("HistoricalChampionsHUD")
if oldGui then oldGui:Destroy() end

local gui = Instance.new("ScreenGui")
gui.Name = "HistoricalChampionsHUD"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = false
gui.Parent = playerGui

local function make(className, parent, properties)
    local object = Instance.new(className)
    for key, value in pairs(properties) do
        object[key] = value
    end
    object.Parent = parent
    return object
end

local panel = make("Frame", gui, {
    Name = "StatusPanel",
    AnchorPoint = Vector2.new(0, 1),
    Position = UDim2.new(0, 22, 1, -22),
    Size = UDim2.fromOffset(278, 104),
    BackgroundColor3 = Color3.fromRGB(18, 22, 28),
    BackgroundTransparency = 0.12,
    BorderSizePixel = 0,
})
make("UICorner", panel, { CornerRadius = UDim.new(0, 12) })
make("UIStroke", panel, {
    Color = Color3.fromRGB(178, 145, 91),
    Transparency = 0.25,
    Thickness = 1.2,
})

make("TextLabel", panel, {
    Name = "Title",
    BackgroundTransparency = 1,
    Position = UDim2.fromOffset(13, 7),
    Size = UDim2.new(1, -26, 0, 20),
    Font = Enum.Font.GothamBold,
    Text = "HISTORICAL CHAMPIONS",
    TextColor3 = Color3.fromRGB(235, 218, 183),
    TextSize = 12,
    TextXAlignment = Enum.TextXAlignment.Left,
})

local function makeBar(name, y, color, labelText)
    make("TextLabel", panel, {
        Name = name .. "Label",
        BackgroundTransparency = 1,
        Position = UDim2.fromOffset(13, y),
        Size = UDim2.fromOffset(55, 18),
        Font = Enum.Font.GothamBold,
        Text = labelText,
        TextColor3 = Color3.fromRGB(225, 225, 225),
        TextSize = 10,
        TextXAlignment = Enum.TextXAlignment.Left,
    })

    local track = make("Frame", panel, {
        Name = name .. "Track",
        Position = UDim2.fromOffset(68, y + 2),
        Size = UDim2.new(1, -82, 0, 13),
        BackgroundColor3 = Color3.fromRGB(48, 51, 56),
        BorderSizePixel = 0,
    })
    make("UICorner", track, { CornerRadius = UDim.new(1, 0) })

    local fill = make("Frame", track, {
        Name = "Fill",
        Size = UDim2.fromScale(1, 1),
        BackgroundColor3 = color,
        BorderSizePixel = 0,
    })
    make("UICorner", fill, { CornerRadius = UDim.new(1, 0) })
    return fill
end

local healthFill = makeBar("Health", 34, Color3.fromRGB(181, 53, 47), "HEALTH")
local staminaFill = makeBar("Stamina", 60, Color3.fromRGB(65, 153, 194), "STAMINA")
local comboLabel = make("TextLabel", gui, {
    Name = "ComboNotice",
    AnchorPoint = Vector2.new(0.5, 0),
    Position = UDim2.new(0.5, 0, 0.13, 0),
    Size = UDim2.fromOffset(280, 42),
    BackgroundTransparency = 1,
    Font = Enum.Font.GothamBlack,
    Text = "",
    TextColor3 = Color3.fromRGB(244, 205, 133),
    TextStrokeTransparency = 0.35,
    TextSize = 22,
})

local flash = make("Frame", gui, {
    Name = "DamageFlash",
    Size = UDim2.fromScale(1, 1),
    BackgroundColor3 = Color3.fromRGB(180, 28, 24),
    BackgroundTransparency = 1,
    BorderSizePixel = 0,
    ZIndex = 20,
})

local function updateHealth()
    local character = player.Character
    local humanoid = character and character:FindFirstChildOfClass("Humanoid")
    if not humanoid then
        healthFill.Size = UDim2.fromScale(0, 1)
        return
    end
    local ratio = math.clamp(humanoid.Health / math.max(1, humanoid.MaxHealth), 0, 1)
    TweenService:Create(healthFill, TweenInfo.new(0.12), { Size = UDim2.fromScale(ratio, 1) }):Play()
end

local function updateStamina()
    local maximum = player:GetAttribute("MaxStamina") or 100
    local current = player:GetAttribute("Stamina") or maximum
    local ratio = math.clamp(current / math.max(1, maximum), 0, 1)
    TweenService:Create(staminaFill, TweenInfo.new(0.12), { Size = UDim2.fromScale(ratio, 1) }):Play()
end

local function connectCharacter(character)
    local humanoid = character:WaitForChild("Humanoid", 8)
    if humanoid then
        updateHealth()
        humanoid.HealthChanged:Connect(updateHealth)
    end
end

player.CharacterAdded:Connect(connectCharacter)
if player.Character then task.spawn(connectCharacter, player.Character) end
player:GetAttributeChangedSignal("Stamina"):Connect(updateStamina)
player:GetAttributeChangedSignal("MaxStamina"):Connect(updateStamina)
player:GetAttributeChangedSignal("ComboCount"):Connect(function()
    local count = player:GetAttribute("ComboCount") or 0
    if count > 0 then
        comboLabel.Text = "COMBO  " .. tostring(count) .. " / 3"
        comboLabel.TextTransparency = 0
        task.delay(0.75, function()
            if comboLabel.Parent then
                TweenService:Create(comboLabel, TweenInfo.new(0.25), { TextTransparency = 1 }):Play()
            end
        end)
    end
end)
updateStamina()

local function floatingText(position, message, color)
    local anchor = Instance.new("Part")
    anchor.Name = "HC_LocalCombatText"
    anchor.Anchored = true
    anchor.CanCollide = false
    anchor.CanQuery = false
    anchor.Transparency = 1
    anchor.Size = Vector3.new(0.1, 0.1, 0.1)
    anchor.CFrame = CFrame.new(position + Vector3.new(0, 2.8, 0))
    anchor.Parent = workspace

    local billboard = make("BillboardGui", anchor, {
        Size = UDim2.fromOffset(150, 42),
        AlwaysOnTop = true,
        StudsOffset = Vector3.zero,
    })
    local label = make("TextLabel", billboard, {
        Size = UDim2.fromScale(1, 1),
        BackgroundTransparency = 1,
        Font = Enum.Font.GothamBlack,
        Text = message,
        TextColor3 = color,
        TextStrokeTransparency = 0.25,
        TextSize = 19,
    })

    TweenService:Create(anchor, TweenInfo.new(0.65, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
        CFrame = anchor.CFrame + Vector3.new(0, 2.1, 0),
    }):Play()
    TweenService:Create(label, TweenInfo.new(0.65), { TextTransparency = 1, TextStrokeTransparency = 1 }):Play()
    Debris:AddItem(anchor, 0.8)
end

local function impactBurst(position, blocked, heavy)
    local mainColor = blocked and Color3.fromRGB(85, 183, 255)
        or (heavy and Color3.fromRGB(255, 177, 73) or Color3.fromRGB(244, 225, 180))

    local core = Instance.new("Part")
    core.Name = "HC_LocalImpact"
    core.Shape = Enum.PartType.Ball
    core.Anchored = true
    core.CanCollide = false
    core.CanQuery = false
    core.Material = Enum.Material.Neon
    core.Color = mainColor
    core.Transparency = 0.12
    core.Size = Vector3.new(0.45, 0.45, 0.45)
    core.CFrame = CFrame.new(position)
    core.Parent = workspace
    TweenService:Create(core, TweenInfo.new(0.22), {
        Size = Vector3.new(2.4, 2.4, 2.4),
        Transparency = 1,
    }):Play()
    Debris:AddItem(core, 0.3)

    for index = 1, 7 do
        local angle = (math.pi * 2 / 7) * index
        local spark = Instance.new("Part")
        spark.Name = "HC_LocalSpark"
        spark.Anchored = true
        spark.CanCollide = false
        spark.CanQuery = false
        spark.Material = Enum.Material.Neon
        spark.Color = mainColor
        spark.Size = Vector3.new(0.11, 0.11, heavy and 0.95 or 0.65)
        spark.CFrame = CFrame.new(position)
            * CFrame.Angles(0, angle, 0)
        spark.Parent = workspace
        local target = CFrame.new(position + Vector3.new(math.cos(angle) * 2, math.sin(angle) * 1.2, math.sin(angle) * 2))
            * CFrame.Angles(0, angle, 0)
        TweenService:Create(spark, TweenInfo.new(0.24), {
            CFrame = target,
            Transparency = 1,
            Size = Vector3.new(0.02, 0.02, 0.25),
        }):Play()
        Debris:AddItem(spark, 0.3)
    end
end

local function slashCue(data)
    local fighter = Players:GetPlayerByUserId(data.userId)
    local character = fighter and fighter.Character
    local root = character and character:FindFirstChild("HumanoidRootPart")
    if not root then return end

    local heavy = data.action == "HeavyAttack"
    local color = heavy and Color3.fromRGB(255, 174, 73) or Color3.fromRGB(222, 230, 236)
    local count = heavy and 3 or 2

    for index = 1, count do
        local slash = Instance.new("Part")
        slash.Name = "HC_LocalSlash"
        slash.Anchored = true
        slash.CanCollide = false
        slash.CanQuery = false
        slash.Material = Enum.Material.Neon
        slash.Color = color
        slash.Transparency = 0.2
        slash.Size = Vector3.new(0.12, 0.12, heavy and 5.3 or 4.3)
        local tilt = (index - (count + 1) / 2) * 0.22
        slash.CFrame = root.CFrame * CFrame.new(0, 1.1 + tilt, -2.2)
            * CFrame.Angles(0, 0, tilt + (data.combo or 1) * 0.12)
        slash.Parent = workspace

        TweenService:Create(slash, TweenInfo.new(0.18), {
            CFrame = slash.CFrame * CFrame.new(0, 0.45, -1.2),
            Transparency = 1,
            Size = Vector3.new(0.02, 0.02, 2.0),
        }):Play()
        Debris:AddItem(slash, 0.22)
    end
end

local function showDamageFlash()
    flash.BackgroundTransparency = 0.72
    TweenService:Create(flash, TweenInfo.new(0.24), { BackgroundTransparency = 1 }):Play()
end

feedback.OnClientEvent:Connect(function(eventName, data)
    data = data or {}

    if eventName == "AttackCue" then
        slashCue(data)
    elseif eventName == "Hit" then
        impactBurst(data.position, data.blocked, data.heavy)
        if data.blocked then
            floatingText(data.position, "BLOCKED", Color3.fromRGB(117, 202, 255))
        elseif data.guardBroken then
            floatingText(data.position, "GUARD BREAK", Color3.fromRGB(255, 190, 93))
        else
            floatingText(data.position, "-" .. tostring(data.damage), Color3.fromRGB(255, 233, 208))
        end

        if data.targetUserId == player.UserId then
            showDamageFlash()
        end
    elseif eventName == "Parried" then
        impactBurst(data.position, true, true)
        floatingText(data.position, "PARRIED!", Color3.fromRGB(100, 195, 255))
    elseif eventName == "DodgeEvade" then
        floatingText(data.position, "EVADED", Color3.fromRGB(145, 224, 180))
    elseif eventName == "DodgeCue" then
        local fighter = Players:GetPlayerByUserId(data.userId)
        local character = fighter and fighter.Character
        local root = character and character:FindFirstChild("HumanoidRootPart")
        if root then
            local puff = Instance.new("Part")
            puff.Name = "HC_DodgeDust"
            puff.Shape = Enum.PartType.Ball
            puff.Anchored = true
            puff.CanCollide = false
            puff.CanQuery = false
            puff.Material = Enum.Material.Sand
            puff.Color = Color3.fromRGB(196, 158, 105)
            puff.Transparency = 0.5
            puff.Size = Vector3.new(1.2, 0.35, 1.2)
            puff.CFrame = root.CFrame * CFrame.new(0, -2.3, 0.5)
            puff.Parent = workspace
            TweenService:Create(puff, TweenInfo.new(0.3), {
                Size = Vector3.new(3.2, 0.15, 3.2),
                Transparency = 1,
            }):Play()
            Debris:AddItem(puff, 0.35)
        end
    elseif eventName == "TooTired" then
        comboLabel.Text = "LOW STAMINA"
        comboLabel.TextColor3 = Color3.fromRGB(112, 194, 235)
        comboLabel.TextTransparency = 0
        task.delay(0.8, function()
            if comboLabel.Parent then
                TweenService:Create(comboLabel, TweenInfo.new(0.25), { TextTransparency = 1 }):Play()
            end
        end)
    end
end)
