-- Server-authoritative combat foundation.
-- Clients send action names only. The server selects targets and computes damage.

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local GameConfig = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("GameConfig"))
local CombatService = {}

local lastActionAt = {}
local rateWindows = {}
local cooldowns = {}
local blockState = {}

local function getCharacterParts(player)
    local character = player.Character
    if not character then return nil end
    local humanoid = character:FindFirstChildOfClass("Humanoid")
    local root = character:FindFirstChild("HumanoidRootPart")
    if not humanoid or not root or humanoid.Health <= 0 then return nil end
    return character, humanoid, root
end

local function withinRateLimit(player)
    local now = os.clock()
    local window = rateWindows[player]
    if not window or now - window.startedAt >= GameConfig.Combat.ActionRateWindow then
        rateWindows[player] = { startedAt = now, count = 1 }
        return true
    end
    window.count += 1
    return window.count <= GameConfig.Combat.ActionRateLimit
end

local function canUse(player, action, cooldown)
    local now = os.clock()
    cooldowns[player] = cooldowns[player] or {}
    local nextAllowed = cooldowns[player][action] or 0
    if now < nextAllowed then return false end
    cooldowns[player][action] = now + cooldown
    return true
end

local function findNearestOpponent(attacker, origin, maxRange)
    local nearestPlayer, nearestHumanoid, nearestRoot
    local nearestDistance = maxRange

    for _, candidate in Players:GetPlayers() do
        if candidate ~= attacker then
            local _, humanoid, root = getCharacterParts(candidate)
            if humanoid and root then
                local distance = (root.Position - origin.Position).Magnitude
                if distance <= nearestDistance then
                    nearestDistance = distance
                    nearestPlayer, nearestHumanoid, nearestRoot = candidate, humanoid, root
                end
            end
        end
    end

    return nearestPlayer, nearestHumanoid, nearestRoot, nearestDistance
end

local function faceCheck(origin, targetPosition)
    local offset = targetPosition - origin.Position
    if offset.Magnitude < 0.01 then return true end
    return origin.CFrame.LookVector:Dot(offset.Unit) > -0.15
end

local function performAttack(player, action, feedback)
    local _, humanoid, root = getCharacterParts(player)
    if not humanoid then return end

    local isHeavy = action == "HeavyAttack"
    local cooldown = isHeavy and GameConfig.Combat.HeavyCooldown or GameConfig.Combat.LightCooldown
    if not canUse(player, action, cooldown) then return end

    player:SetAttribute("CombatState", action)
    local range = isHeavy and GameConfig.Combat.HeavyRange or GameConfig.Combat.LightRange
    local damage = isHeavy and GameConfig.Combat.HeavyDamage or GameConfig.Combat.LightDamage

    local targetPlayer, targetHumanoid, targetRoot = findNearestOpponent(player, root, range)
    if targetPlayer and targetHumanoid and targetRoot and faceCheck(root, targetRoot.Position) then
        local finalDamage = damage
        if blockState[targetPlayer] then
            finalDamage = math.max(1, math.floor(damage * GameConfig.Combat.BlockDamageMultiplier))
        end
        targetHumanoid:TakeDamage(finalDamage)
        local power = math.clamp((targetPlayer:GetAttribute("Power") or 0) + 12, 0, 100)
        targetPlayer:SetAttribute("Power", power)
        feedback:FireClient(player, "HitConfirmed", { target = targetPlayer.UserId, damage = finalDamage })
        feedback:FireClient(targetPlayer, "HitReceived", { damage = finalDamage })
    end

    task.delay(0.25, function()
        if player.Parent then
            player:SetAttribute("CombatState", blockState[player] and "Blocking" or "Idle")
        end
    end)
end

function CombatService.Init(actionRequest, actionFeedback)
    actionRequest.OnServerEvent:Connect(function(player, action)
        if typeof(action) ~= "string" or not withinRateLimit(player) then return end
        if action == "LightAttack" or action == "HeavyAttack" then
            if blockState[player] then return end
            performAttack(player, action, actionFeedback)
        elseif action == "BlockStart" then
            if getCharacterParts(player) then
                blockState[player] = true
                player:SetAttribute("IsBlocking", true)
                player:SetAttribute("CombatState", "Blocking")
            end
        elseif action == "BlockEnd" then
            blockState[player] = nil
            player:SetAttribute("IsBlocking", false)
            player:SetAttribute("CombatState", "Idle")
        elseif action == "Dodge" then
            local _, humanoid, root = getCharacterParts(player)
            if humanoid and canUse(player, "Dodge", GameConfig.Combat.DodgeCooldown) then
                local direction = root.CFrame.LookVector
                root:ApplyImpulse(direction * root.AssemblyMass * 35)
                player:SetAttribute("CombatState", "Dodging")
                task.delay(0.35, function()
                    if player.Parent then
                        player:SetAttribute("CombatState", blockState[player] and "Blocking" or "Idle")
                    end
                end)
            end
        end
    end)

    Players.PlayerRemoving:Connect(function(player)
        lastActionAt[player] = nil
        rateWindows[player] = nil
        cooldowns[player] = nil
        blockState[player] = nil
    end)
end

return CombatService
