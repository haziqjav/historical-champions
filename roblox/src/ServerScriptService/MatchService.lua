-- Match lifecycle and server-validated champion selection.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")
local GameConfig = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("GameConfig"))

local Service = {}
local remotes
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
    })
end

local function validChampion(name)
    if typeof(name) ~= "string" then return false end
    for _, champion in ipairs(GameConfig.Roster) do
        if champion == name then return true end
    end
    return false
end

local function chooseChampion(player, name)
    if not validChampion(name) then return end
    if roundActive then
        selectFeedback:FireClient(player, false, "You can change champion after this round.")
        return
    end
    player:SetAttribute("SelectedChampion", name)
    selectFeedback:FireClient(player, true, name)
end

local function alivePlayers(participants)
    local alive = {}
    for _, player in ipairs(participants) do
        if player.Parent and not eliminated[player] then
            local character = player.Character
            local humanoid = character and character:FindFirstChildOfClass("Humanoid")
            if humanoid and humanoid.Health > 0 then table.insert(alive, player) end
        end
    end
    return alive
end

local function teleportToSpawn(player, side)
    local arena = Workspace:FindFirstChild("HistoricalChampionsArena")
    if not arena then return end
    local spawnPart = arena:FindFirstChild(side == 1 and "WestChampionSpawn" or "EastChampionSpawn")
    if player.Character and spawnPart then
        player.Character:PivotTo(spawnPart.CFrame + Vector3.new(0, 4, 0))
    end
end

local function award(winner, participants)
    for _, player in ipairs(participants) do
        local stats = player:FindFirstChild("leaderstats")
        if stats then
            local coins = stats:FindFirstChild("Coins")
            if coins then coins.Value += GameConfig.Progression.ParticipationCoins end
            if winner == player then
                local wins = stats:FindFirstChild("Wins")
                if wins then wins.Value += 1 end
                if coins then coins.Value += GameConfig.Progression.WinCoins end
            end
        end
    end
end

local function runRound()
    local participants = Players:GetPlayers()
    if #participants < 2 then
        roundActive = false
        sendState("Waiting", 0, "Waiting for another champion to join")
        return
    end

    roundActive = true
    table.clear(eliminated)
    for index, player in ipairs(participants) do
        eliminated[player] = false
        player:SetAttribute("RoundEliminated", false)
        player:SetAttribute("Power", 0)
        player:SetAttribute("Stamina", GameConfig.Combat.MaxStamina)
        local character = player.Character or player.CharacterAdded:Wait()
        local humanoid = character:FindFirstChildOfClass("Humanoid")
        if humanoid then
            humanoid.Health = humanoid.MaxHealth
            humanoid.Died:Connect(function()
                if roundActive and not eliminated[player] then
                    eliminated[player] = true
                    player:SetAttribute("RoundEliminated", true)
                    sendState("Fighting", 0, player.DisplayName .. " has been eliminated")
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
    roundActive = false
    for _, player in ipairs(participants) do
        player:SetAttribute("RoundEliminated", false)
        if player.Parent then
            player:SetAttribute("Power", 0)
            if player.Character then
                local humanoid = player.Character:FindFirstChildOfClass("Humanoid")
                if humanoid and humanoid.Health <= 0 then player:LoadCharacter() end
            end
        end
    end
    sendState("Results", GameConfig.Match.IntermissionSeconds,
        winner and (winner.DisplayName .. " wins the round!") or "Draw! No winner this round")
    task.wait(GameConfig.Match.IntermissionSeconds)
end

function Service.Init(remoteFolder)
    remotes = remoteFolder
    stateRemote = remotes:FindFirstChild("MatchState") or Instance.new("RemoteEvent")
    stateRemote.Name = "MatchState"; stateRemote.Parent = remotes
    selectFeedback = remotes:FindFirstChild("ChampionSelectFeedback") or Instance.new("RemoteEvent")
    selectFeedback.Name = "ChampionSelectFeedback"; selectFeedback.Parent = remotes
    local selectRequest = remotes:FindFirstChild("ChampionSelectRequest") or Instance.new("RemoteEvent")
    selectRequest.Name = "ChampionSelectRequest"; selectRequest.Parent = remotes
    selectRequest.OnServerEvent:Connect(chooseChampion)

    Players.PlayerAdded:Connect(function(player)
        player:SetAttribute("RoundEliminated", false)
        task.defer(function()
            sendState("Waiting", 0, "Choose your champion")
        end)
    end)
    Players.PlayerRemoving:Connect(function(player)
        eliminated[player] = nil
    end)

    task.spawn(function()
        while true do
            local count = #Players:GetPlayers()
            if count < 2 then
                sendState("Waiting", 0, "Waiting for another champion to join")
                task.wait(3)
            else
                for seconds = GameConfig.Match.IntermissionSeconds, 1, -1 do
                    if #Players:GetPlayers() < 2 then break end
                    sendState("Intermission", seconds, "Next duel begins soon")
                    task.wait(1)
                end
                if #Players:GetPlayers() >= 2 then runRound() end
            end
        end
    end)
    print("[HistoricalChampions] Match lifecycle and champion selection initialized.")
end

return Service
