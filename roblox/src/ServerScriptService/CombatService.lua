-- Phase 3: server-authoritative melee combat.
-- Clients send action names only. The server owns hit detection, damage, stamina,
-- cooldowns, parry windows, dodge invulnerability, and combat state.

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local Workspace = game:GetService("Workspace")

local GameConfig = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("GameConfig"))
local Combat = GameConfig.Combat
local CombatService = {}

local cooldowns = {}
local rateWindows = {}
local blocking = {}
local parryUntil = {}
local invulnerableUntil = {}
local stunnedUntil = {}
local comboState = {}
local lastStaminaUse = {}
local staminaUpdateAt = {}

local function getCharacterParts(player)
    local character = player.Character
    if not character then return nil end

    local humanoid = character:FindFirstChildOfClass("Humanoid")
    local root = character:FindFirstChild("HumanoidRootPart")
    if not humanoid or not root or humanoid.Health <= 0 then return nil end

    return character, humanoid, root
end

local function setState(player, state)
    if player.Parent then
        player:SetAttribute("CombatState", state)
    end
end

local function isStunned(player, now)
    return (stunnedUntil[player] or 0) > now
end

local function withinRateLimit(player)
    local now = os.clock()
    local window = rateWindows[player]

    if not window or now - window.startedAt >= Combat.ActionRateWindow then
        rateWindows[player] = { startedAt = now, count = 1 }
        return true
    end

    window.count += 1
    return window.count <= Combat.ActionRateLimit
end

local function canUse(player, action, cooldown)
    local now = os.clock()
    cooldowns[player] = cooldowns[player] or {}
    local nextAllowed = cooldowns[player][action] or 0
    if now < nextAllowed then return false end

    cooldowns[player][action] = now + cooldown
    return true
end

local function getStamina(player)
    return player:GetAttribute("Stamina") or Combat.MaxStamina
end

local function spendStamina(player, amount)
    local current = getStamina(player)
    if current < amount then return false end

    player:SetAttribute("Stamina", math.max(0, current - amount))
    lastStaminaUse[player] = os.clock()
    staminaUpdateAt[player] = os.clock()
    return true
end

local function applyStun(player, duration, feedback)
    local now = os.clock()
    stunnedUntil[player] = math.max(stunnedUntil[player] or 0, now + duration)
    local wasBlocking = blocking[player] == true
    blocking[player] = nil
    parryUntil[player] = nil

    player:SetAttribute("IsBlocking", false)
    if wasBlocking and feedback then
        feedback:FireAllClients("BlockEndCue", { userId = player.UserId })
    end
    setState(player, "Stunned")

    task.delay(duration, function()
        if player.Parent and not isStunned(player, os.clock()) then
            setState(player, "Idle")
        end
    end)
end

local function isFacing(sourceRoot, targetPosition)
    local offset = targetPosition - sourceRoot.Position
    if offset.Magnitude < 0.01 then return true end
    return sourceRoot.CFrame.LookVector:Dot(offset.Unit) > 0.12
end

local function findTargets(attacker, root, range)
    local character = attacker.Character
    if not character then return {} end

    local params = OverlapParams.new()
    params.FilterType = Enum.RaycastFilterType.Exclude
    params.FilterDescendantsInstances = { character }
    params.MaxParts = 100

    local boxDepth = range
    local boxSize = Vector3.new(Combat.HitboxWidth, Combat.HitboxHeight, boxDepth)
    local boxCFrame = root.CFrame * CFrame.new(0, 0, -(boxDepth * 0.5 + 1.25))
    local parts = Workspace:GetPartBoundsInBox(boxCFrame, boxSize, params)

    local seen = {}
    local candidates = {}

    for _, part in ipairs(parts) do
        local model = part:FindFirstAncestorOfClass("Model")
        if model and not seen[model] then
            seen[model] = true
            local targetPlayer = Players:GetPlayerFromCharacter(model)

            if targetPlayer and targetPlayer ~= attacker then
                local _, targetHumanoid, targetRoot = getCharacterParts(targetPlayer)
                if targetHumanoid and targetRoot
                    and isFacing(root, targetRoot.Position)
                    and (targetRoot.Position - root.Position).Magnitude <= range + 2 then
                    table.insert(candidates, {
                        player = targetPlayer,
                        humanoid = targetHumanoid,
                        root = targetRoot,
                        distance = (targetRoot.Position - root.Position).Magnitude,
                    })
                end
            end
        end
    end

    table.sort(candidates, function(a, b)
        return a.distance < b.distance
    end)

    return candidates
end

local function resolveHit(attacker, root, action, comboIndex, feedback, signature)
    local isHeavy = action == "HeavyAttack"
    local range = isHeavy and Combat.HeavyRange or Combat.LightRange
    local candidates = findTargets(attacker, root, range)
    local target = candidates[1]
    if not target then return end

    local defender = target.player
    local now = os.clock()

    if (invulnerableUntil[defender] or 0) > now then
        feedback:FireAllClients("DodgeEvade", {
            attackerUserId = attacker.UserId,
            targetUserId = defender.UserId,
            position = target.root.Position,
        })
        return
    end

    local baseDamage = isHeavy and Combat.HeavyDamage or Combat.LightDamage
    if signature then baseDamage = math.floor(baseDamage * 1.65) end
    if not isHeavy then
        baseDamage += math.max(0, comboIndex - 1) * 2
    end

    local blocked = blocking[defender] == true and isFacing(target.root, root.Position)
    if blocked and (parryUntil[defender] or 0) >= now then
        applyStun(attacker, Combat.ParryStunSeconds, feedback)
        feedback:FireAllClients("Parried", {
            attackerUserId = attacker.UserId,
            defenderUserId = defender.UserId,
            position = target.root.Position,
        })
        return
    end

    local finalDamage = baseDamage
    local guardBroken = false

    if blocked then
        local staminaCost = math.max(12, math.floor(baseDamage * 1.5))
        local remaining = getStamina(defender) - staminaCost

        if remaining <= 0 then
            defender:SetAttribute("Stamina", 0)
            applyStun(defender, Combat.GuardBreakStunSeconds, feedback)
            guardBroken = true
        else
            defender:SetAttribute("Stamina", remaining)
            lastStaminaUse[defender] = now
            finalDamage = math.max(1, math.floor(baseDamage * Combat.BlockDamageMultiplier))
        end
    end

    target.humanoid:TakeDamage(finalDamage)
    attacker:SetAttribute("Power", math.clamp((attacker:GetAttribute("Power") or 0) + 15, 0, 100))

    if not blocked or guardBroken then
        local direction = target.root.Position - root.Position
        local flatDirection = Vector3.new(direction.X, 0, direction.Z)
        if flatDirection.Magnitude > 0.01 then
            local push = flatDirection.Unit * (isHeavy and 15 or 7) + Vector3.new(0, isHeavy and 3 or 1, 0)
            target.root:ApplyImpulse(push * target.root.AssemblyMass)
        end
    end

    feedback:FireAllClients("Hit", {
        attackerUserId = attacker.UserId,
        targetUserId = defender.UserId,
        damage = finalDamage,
        blocked = blocked and not guardBroken,
        guardBroken = guardBroken,
        heavy = isHeavy,
        combo = comboIndex,
        position = target.root.Position,
    })
end

local function performAttack(player, action, feedback)
    local character, humanoid, root = getCharacterParts(player)
    if not humanoid or isStunned(player, os.clock()) or blocking[player] then return end
    if player:GetAttribute("CombatState") ~= "Idle" then return end

    local isHeavy = action == "HeavyAttack"
    local staminaCost = isHeavy and Combat.HeavyStaminaCost or Combat.LightStaminaCost
    local cooldown = isHeavy and Combat.HeavyCooldown or Combat.LightCooldown
    local windup = isHeavy and Combat.HeavyWindup or Combat.LightWindup
    local recovery = isHeavy and Combat.HeavyRecovery or Combat.LightRecovery

    if not spendStamina(player, staminaCost) then
        feedback:FireClient(player, "TooTired", {})
        return
    end
    if not canUse(player, action, cooldown) then
        player:SetAttribute("Stamina", math.min(Combat.MaxStamina, getStamina(player) + staminaCost))
        return
    end

    local comboIndex = 1
    if not isHeavy then
        local previous = comboState[player]
        if previous and os.clock() - previous.lastAt <= Combat.ComboWindow then
            comboIndex = (previous.index % Combat.MaxLightCombo) + 1
        end
        comboState[player] = { index = comboIndex, lastAt = os.clock() }
    else
        comboState[player] = nil
    end

    player:SetAttribute("ComboCount", isHeavy and 0 or comboIndex)
    setState(player, "Attacking")

    feedback:FireAllClients("AttackCue", {
        userId = player.UserId,
        action = action,
        combo = comboIndex,
        position = root.Position,
        lookVector = root.CFrame.LookVector,
    })

    task.delay(windup, function()
        local currentCharacter, currentHumanoid, currentRoot = getCharacterParts(player)
        if player.Parent and currentCharacter == character and currentHumanoid == humanoid
            and currentHumanoid.Health > 0 then
            resolveHit(player, currentRoot, action, comboIndex, feedback)
        end
    end)

    task.delay(windup + recovery, function()
        if player.Parent and player.Character == character and not isStunned(player, os.clock()) then
            setState(player, blocking[player] and "Blocking" or "Idle")
        end
    end)
end

local function startBlock(player, feedback)
    if not getCharacterParts(player) or isStunned(player, os.clock()) then return end
    local state = player:GetAttribute("CombatState")
    if state ~= "Idle" and state ~= "Blocking" then return end
    if getStamina(player) <= 0 then return end

    blocking[player] = true
    parryUntil[player] = os.clock() + Combat.ParryWindow
    player:SetAttribute("IsBlocking", true)
    setState(player, "Blocking")

    feedback:FireAllClients("BlockCue", { userId = player.UserId })
end

local function stopBlock(player, feedback)
    local wasBlocking = blocking[player] == true
    blocking[player] = nil
    parryUntil[player] = nil
    if wasBlocking and player.Parent then
        player:SetAttribute("IsBlocking", false)
        if not isStunned(player, os.clock()) then
            setState(player, "Idle")
        end
        feedback:FireAllClients("BlockEndCue", { userId = player.UserId })
    end
end

local function performDodge(player, feedback)
    local _, humanoid, root = getCharacterParts(player)
    if not humanoid or isStunned(player, os.clock()) or blocking[player] then return end
    if player:GetAttribute("CombatState") ~= "Idle" then return end
    if not spendStamina(player, Combat.DodgeStaminaCost) then
        feedback:FireClient(player, "TooTired", {})
        return
    end
    if not canUse(player, "Dodge", Combat.DodgeCooldown) then
        player:SetAttribute("Stamina", math.min(Combat.MaxStamina, getStamina(player) + Combat.DodgeStaminaCost))
        return
    end

    local moveDirection = humanoid.MoveDirection
    local direction = moveDirection.Magnitude > 0.1 and moveDirection or root.CFrame.LookVector
    direction = Vector3.new(direction.X, 0, direction.Z)

    if direction.Magnitude > 0.01 then
        root:ApplyImpulse(direction.Unit * root.AssemblyMass * Combat.DodgeImpulse)
    end

    invulnerableUntil[player] = os.clock() + Combat.DodgeInvulnerabilitySeconds
    setState(player, "Dodging")
    feedback:FireAllClients("DodgeCue", {
        userId = player.UserId,
        position = root.Position,
    })

    task.delay(0.38, function()
        if player.Parent and not isStunned(player, os.clock()) then
            setState(player, blocking[player] and "Blocking" or "Idle")
        end
    end)
end

local function performSignature(player, feedback)
    local character, humanoid, root = getCharacterParts(player)
    if not humanoid or isStunned(player, os.clock()) or blocking[player] then return end
    if player:GetAttribute("CombatState") ~= "Idle" then return end
    if (player:GetAttribute("Power") or 0) < 100 then
        feedback:FireClient(player, "SignatureNotReady", {})
        return
    end
    if not canUse(player, "Signature", 12) then return end
    player:SetAttribute("Power", 0)
    setState(player, "Attacking")
    feedback:FireAllClients("AttackCue", {
        userId = player.UserId, action = "HeavyAttack", combo = 0,
        position = root.Position, lookVector = root.CFrame.LookVector,
    })
    task.delay(0.24, function()
        local currentCharacter, currentHumanoid, currentRoot = getCharacterParts(player)
        if player.Parent and currentCharacter == character and currentHumanoid == humanoid and currentHumanoid.Health > 0 then
            resolveHit(player, currentRoot, "HeavyAttack", 0, feedback, true)
        end
    end)
    task.delay(0.9, function()
        if player.Parent and player.Character == character and not isStunned(player, os.clock()) then
            setState(player, "Idle")
        end
    end)
end

local function handleAction(player, action, feedback)
    if typeof(action) ~= "string" or not withinRateLimit(player) then return end
    if player:GetAttribute("RoundEliminated") == true then return end

    if action == "LightAttack" or action == "HeavyAttack" then
        performAttack(player, action, feedback)
    elseif action == "BlockStart" then
        startBlock(player, feedback)
    elseif action == "BlockEnd" then
        stopBlock(player, feedback)
    elseif action == "Dodge" then
        performDodge(player, feedback)
    elseif action == "Signature" then
        performSignature(player, feedback)
    end
end

function CombatService.Init(actionRequest, actionFeedback)
    actionRequest.OnServerEvent:Connect(function(player, action)
        handleAction(player, action, actionFeedback)
    end)

    local function preparePlayer(player)
        local function prepareCharacter()
            blocking[player] = nil
            parryUntil[player] = nil
            invulnerableUntil[player] = nil
            stunnedUntil[player] = nil
            comboState[player] = nil
            player:SetAttribute("IsBlocking", false)
            player:SetAttribute("CombatState", "Idle")
            player:SetAttribute("MaxStamina", Combat.MaxStamina)
            player:SetAttribute("Stamina", Combat.MaxStamina)
            player:SetAttribute("ComboCount", 0)
        end

        player.CharacterAdded:Connect(prepareCharacter)
        if player.Character then prepareCharacter() end
    end

    Players.PlayerAdded:Connect(preparePlayer)
    for _, player in ipairs(Players:GetPlayers()) do
        preparePlayer(player)
    end

    Players.PlayerRemoving:Connect(function(player)
        cooldowns[player] = nil
        rateWindows[player] = nil
        blocking[player] = nil
        parryUntil[player] = nil
        invulnerableUntil[player] = nil
        stunnedUntil[player] = nil
        comboState[player] = nil
        lastStaminaUse[player] = nil
        staminaUpdateAt[player] = nil
    end)

    local accumulator = 0
    RunService.Heartbeat:Connect(function(deltaTime)
        accumulator += deltaTime
        if accumulator < 0.1 then return end
        local step = accumulator
        accumulator = 0

        local now = os.clock()
        for _, player in ipairs(Players:GetPlayers()) do
            local stamina = getStamina(player)
            local maxStamina = player:GetAttribute("MaxStamina") or Combat.MaxStamina

            if blocking[player] then
                stamina = math.max(0, stamina - Combat.BlockStaminaDrainPerSecond * step)
                if stamina <= 0 then
                    blocking[player] = nil
                    player:SetAttribute("IsBlocking", false)
                    actionFeedback:FireAllClients("BlockEndCue", { userId = player.UserId })
                    applyStun(player, Combat.GuardBreakStunSeconds, actionFeedback)
                end
                lastStaminaUse[player] = now
            elseif now - (lastStaminaUse[player] or 0) >= Combat.StaminaRegenDelay then
                stamina = math.min(maxStamina, stamina + Combat.StaminaRegenPerSecond * step)
            end

            if now - (staminaUpdateAt[player] or 0) >= 0.1 then
                player:SetAttribute("Stamina", math.floor(stamina + 0.5))
                staminaUpdateAt[player] = now
            end
        end
    end)
end

return CombatService
