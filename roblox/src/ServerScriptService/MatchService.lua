-- Server-owned 1v1 queue, round lifecycle, rewards, and champion selection.
-- The first two players in the server duel; additional players spectate the queue.

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")
local GameConfig = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("GameConfig"))

local Service = {}
local stateRemote
local selectFeedback
local eliminated = {}
local roundActive = false

local function sendState(state, seconds, message)
    stateRemote:FireAllClients({
        state = state,
        seconds = seconds or 0,
        message = message or "",
        players = #Players:GetPlayers(),
        queued = math.max(0, #Players:GetPlayers() - GameConfig.Match.MaxPlayers),
    })
end

local function validChampion(name)
    if typeof(name) ~= "string" then return false end
    return table.find(GameConfig.Roster, name) ~= nil
end

local function chooseChampion(player, name)
    if not validChampion(name) then return end
    if roundActive or player:GetAttribute("InMatch") == true then
        selectFeedback:FireClient(player, false, "You can change champion after the current duel.")
        return
    end
    player:SetAttribute("SelectedChampion", name)
    selectFeedback:FireClient(player, true, name)
end

local function alivePlayers(participants)
    local alive = {}
    for _, player in ipairs(participants) do
        if player.Parent and not eliminated[player] and player:GetAttribute("InMatch") == true then
            local character = player.Character
            local humanoid = character and character:FindFirstChildOfClass("Humanoid")
            if humanoid and humanoid.Health > 0 then
                table.insert(alive, player)
            end
        end
    end
    return alive
end

local function teleportToSpawn(player, side)
    local arena = Workspace:FindFirstChild("HistoricalChampionsArena")
    local character = player.Character
    if not arena or not character then return end

    local spawnPart = arena:FindFirstChild(side == 1 and "WestChampionSpawn" or "EastChampionSpawn")
    if not spawnPart then return end

    local position = spawnPart.Position + Vector3.new(0, 4, 0)
    local target = side == 1 and Vector3.new(49, position.Y, 0) or Vector3.new(-49, position.Y, 0)
    character:PivotTo(CFrame.lookAt(position, target))
    player:SetAttribute("SpawnProtectedUntil", os.clock() + 1.5)
end

local function award(winner, participants)
    for _, player in ipairs(participants) do
        if player.Parent then
            local stats = player:FindFirstChild("leaderstats")
            if stats then
                local coins = stats:FindFirstChild("Coins")
                local wins = stats:FindFirstChild("Wins")
                local xp = stats:FindFirstChild("XP")

                if coins then coins.Value += GameConfig.Progression.ParticipationCoins end
                if xp then xp.Value += GameConfig.Progression.ParticipationXP end
                if winner == player then
                    if wins then wins.Value += 1 end
                    if coins then coins.Value += GameConfig.Progression.WinCoins end
                    if xp then xp.Value += GameConfig.Progression.WinXP end
                end
                if xp then
                    local level = math.floor(xp.Value / GameConfig.Progression.XPPerLevel) + 1
                    player:SetAttribute("Level", level)
                end
            end
        end
    end
end

local function resetAfterRound(participants)
    roundActive = false
    for _, player in ipairs(participants) do
        eliminated[player] = nil
        if player.Parent then
            player:SetAttribute("InMatch", false)
            player:SetAttribute("RoundEliminated", false)
            player:SetAttribute("Power", 0)
            player:SetAttribute("SpawnProtectedUntil", 0)

            local character = player.Character
            local humanoid = character and character:FindFirstChildOfClass("Humanoid")
            if humanoid and humanoid.Health <= 0 then
                player:LoadCharacter()
            end
        end
    end
end

local function runRound()
    local allPlayers = Players:GetPlayers()
    if #allPlayers < GameConfig.Match.MaxPlayers then
        roundActive = false
        sendState("Waiting", 0, "Waiting for another champion to join")
        return
    end

    local participants = {}
    for index = 1, GameConfig.Match.MaxPlayers do
        local player = allPlayers[index]
        if player then table.insert(participants, player) end
    end
    if #participants < GameConfig.Match.MaxPlayers then return end

    roundActive = true
    table.clear(eliminated)

    for _, player in ipairs(Players:GetPlayers()) do
        player:SetAttribute("InMatch", false)
        player:SetAttribute("RoundEliminated", false)
    end

    local deathConnections = {}
    for index, player in ipairs(participants) do
        eliminated[player] = false
        player:SetAttribute("InMatch", true)
        player:SetAttribute("RoundEliminated", false)
        player:SetAttribute("Power", 0)
        player:SetAttribute("Stamina", GameConfig.Combat.MaxStamina)

        local character = player.Character
        if not character then
            player:LoadCharacter()
            character = player.CharacterAdded:Wait()
        end
        local humanoid = character and character:FindFirstChildOfClass("Humanoid")
        if humanoid then
            humanoid.Health = humanoid.MaxHealth
            deathConnections[player] = humanoid.Died:Connect(function()
                if roundActive and not eliminated[player] then
                    eliminated[player] = true
                    player:SetAttribute("RoundEliminated", true)
                    sendState("Round", 0, player.DisplayName .. " has been eliminated")
                end
            end)
        end
        teleportToSpawn(player, index)
    end

    sendState("Round", GameConfig.Match.RoundDurationSeconds, "FIGHT!")
    local remaining = GameConfig.Match.RoundDurationSeconds
    while remaining > 0 and roundActive do
        local alive = alivePlayers(participants)
        if #alive <= 1 then break end
        sendState("Round", remaining, "Defeat your opponent")
        task.wait(1)
        remaining -= 1
    end

    local alive = alivePlayers(participants)
    local winner = #alive == 1 and alive[1] or nil
    award(winner, participants)

    for _, connection in pairs(deathConnections) do
        connection:Disconnect()
    end
    resetAfterRound(participants)
    sendState("Results", 4, winner and (winner.DisplayName .. " wins the duel!") or "Draw! No winner this round")
    task.wait(4)
end

function Service.Init(remoteFolder)
    stateRemote = remoteFolder:FindFirstChild("MatchState") or Instance.new("RemoteEvent")
    stateRemote.Name = "MatchState"
    stateRemote.Parent = remoteFolder

    selectFeedback = remoteFolder:FindFirstChild("ChampionSelectFeedback") or Instance.new("RemoteEvent")
    selectFeedback.Name = "ChampionSelectFeedback"
    selectFeedback.Parent = remoteFolder

    local selectRequest = remoteFolder:FindFirstChild("ChampionSelectRequest") or Instance.new("RemoteEvent")
    selectRequest.Name = "ChampionSelectRequest"
    selectRequest.Parent = remoteFolder
    selectRequest.OnServerEvent:Connect(chooseChampion)

    Players.PlayerAdded:Connect(function(player)
        player:SetAttribute("InMatch", false)
        player:SetAttribute("RoundEliminated", false)
        task.defer(function()
            sendState(roundActive and "Round" or "Waiting", 0,
                roundActive and "A duel is in progress. You are in the queue." or "Choose your champion")
        end)
    end)
    Players.PlayerRemoving:Connect(function(player)
        eliminated[player] = nil
    end)

    task.spawn(function()
        while true do
            if #Players:GetPlayers() < GameConfig.Match.MaxPlayers then
                for _, player in ipairs(Players:GetPlayers()) do
                    player:SetAttribute("InMatch", false)
                end
                sendState("Waiting", 0, "Waiting for another champion to join")
                task.wait(3)
            else
                local cancelled = false
                for seconds = GameConfig.Match.IntermissionSeconds, 1, -1 do
                    if #Players:GetPlayers() < GameConfig.Match.MaxPlayers then
                        cancelled = true
                        break
                    end
                    sendState("Intermission", seconds, "Next duel begins soon")
                    task.wait(1)
                end
                if not cancelled and #Players:GetPlayers() >= GameConfig.Match.MaxPlayers then
                    runRound()
                end
            end
        end
    end)

    print("[HistoricalChampions] Final 1v1 match lifecycle initialized.")
end

return Service
