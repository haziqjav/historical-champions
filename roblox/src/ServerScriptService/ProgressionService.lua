-- Persistent player profile data for Historical Champions.
-- DataStore failures are handled safely: the game still runs with session-only stats.

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local GameConfig = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("GameConfig"))
local Store = DataStoreService:GetDataStore("HistoricalChampionsProfiles_v1")
local Service = {}
local saving = {}
local loaded = {}

local function integer(value, fallback)
    if typeof(value) ~= "number" then return fallback end
    return math.clamp(math.floor(value), 0, 2000000000)
end

local function valueObject(folder, name, defaultValue)
    local value = folder:FindFirstChild(name)
    if not value then
        value = Instance.new("IntValue")
        value.Name = name
        value.Value = defaultValue
        value.Parent = folder
    end
    return value
end

local function getProfile(player)
    local stats = player:FindFirstChild("leaderstats")
    if not stats then return nil end
    local coins = stats:FindFirstChild("Coins")
    local wins = stats:FindFirstChild("Wins")
    local xp = stats:FindFirstChild("XP")
    if not coins or not wins or not xp then return nil end

    return {
        coins = integer(coins.Value, 0),
        wins = integer(wins.Value, 0),
        xp = integer(xp.Value, 0),
        champion = player:GetAttribute("SelectedChampion"),
    }
end

local function applyProfile(player, data)
    if typeof(data) ~= "table" then data = {} end
    local stats = player:FindFirstChild("leaderstats")
    if not stats then
        stats = Instance.new("Folder")
        stats.Name = "leaderstats"
        stats.Parent = player
    end

    valueObject(stats, "Coins", 0).Value = integer(data.coins, 0)
    valueObject(stats, "Wins", 0).Value = integer(data.wins, 0)
    local xp = valueObject(stats, "XP", 0)
    xp.Value = integer(data.xp, 0)
    local level = valueObject(stats, "Level", 1)
    level.Value = math.floor(xp.Value / GameConfig.Progression.XPPerLevel) + 1
    player:SetAttribute("Level", level.Value)

    if typeof(data.champion) == "string" and table.find(GameConfig.Roster, data.champion) then
        player:SetAttribute("SelectedChampion", data.champion)
    end
end

function Service.SavePlayer(player)
    if not player or saving[player] or not loaded[player] then return end
    local profile = getProfile(player)
    if not profile then return end

    saving[player] = true
    local key = "Player_" .. tostring(player.UserId)
    local ok, err = pcall(function()
        Store:UpdateAsync(key, function()
            return profile
        end)
    end)
    saving[player] = nil

    if not ok then
        warn("[HistoricalChampions] Profile save failed for " .. player.Name .. ": " .. tostring(err))
    end
end

local function loadPlayer(player)
    if loaded[player] then return end
    local key = "Player_" .. tostring(player.UserId)
    local data
    local ok, result = pcall(function()
        return Store:GetAsync(key)
    end)

    if ok then
        data = result
    else
        warn("[HistoricalChampions] Profile load failed for " .. player.Name .. "; using session defaults.")
    end

    if not player.Parent then return end
    applyProfile(player, data)
    loaded[player] = true
    player:SetAttribute("HC_ProfileLoaded", true)
end

function Service.Init()
    Players.PlayerAdded:Connect(function(player)
        task.spawn(loadPlayer, player)
    end)
    Players.PlayerRemoving:Connect(function(player)
        Service.SavePlayer(player)
        loaded[player] = nil
        saving[player] = nil
    end)

    for _, player in ipairs(Players:GetPlayers()) do
        task.spawn(loadPlayer, player)
    end

    task.spawn(function()
        while true do
            task.wait(90)
            for _, player in ipairs(Players:GetPlayers()) do
                task.spawn(Service.SavePlayer, player)
            end
        end
    end)

    game:BindToClose(function()
        local pending = 0
        for _, player in ipairs(Players:GetPlayers()) do
            pending += 1
            task.spawn(function()
                Service.SavePlayer(player)
                pending -= 1
            end)
        end
        local deadline = os.clock() + 20
        while pending > 0 and os.clock() < deadline do
            task.wait(0.1)
        end
    end)
end

return Service
