-- Server bootstrap. The server owns player state, progression, combat, and match results.

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local GameConfig = require(Shared:WaitForChild("GameConfig"))

local remotes = ReplicatedStorage:FindFirstChild("HistoricalChampionsRemotes")
if not remotes then
    remotes = Instance.new("Folder")
    remotes.Name = "HistoricalChampionsRemotes"
    remotes.Parent = ReplicatedStorage
end

local function ensureRemote(name)
    local remote = remotes:FindFirstChild(name)
    if not remote then
        remote = Instance.new("RemoteEvent")
        remote.Name = name
        remote.Parent = remotes
    end
    return remote
end

local actionRequest = ensureRemote("ActionRequest")
local actionFeedback = ensureRemote("ActionFeedback")

local function setupPlayer(player)
    player:SetAttribute("CombatState", "Idle")
    player:SetAttribute("IsBlocking", false)
    player:SetAttribute("Power", 0)
    player:SetAttribute("InMatch", false)
    player:SetAttribute("RoundEliminated", false)
    player:SetAttribute("SpawnProtectedUntil", 0)
    player:SetAttribute("HC_ProfileLoaded", false)
    player:SetAttribute("Level", 1)

    local defaultChampionIndex = (player.UserId % #GameConfig.Roster) + 1
    if not player:GetAttribute("SelectedChampion") then
        player:SetAttribute("SelectedChampion", GameConfig.Roster[defaultChampionIndex])
    end
    player:SetAttribute("MaxStamina", GameConfig.Combat.MaxStamina)
    player:SetAttribute("Stamina", GameConfig.Combat.MaxStamina)
    player:SetAttribute("ComboCount", 0)

    local leaderstats = player:FindFirstChild("leaderstats")
    if not leaderstats then
        leaderstats = Instance.new("Folder")
        leaderstats.Name = "leaderstats"
        leaderstats.Parent = player
    end

    local function ensureStat(name, value)
        local stat = leaderstats:FindFirstChild(name)
        if not stat then
            stat = Instance.new("IntValue")
            stat.Name = name
            stat.Value = value
            stat.Parent = leaderstats
        end
    end

    ensureStat("Coins", GameConfig.Progression.StartingCoins)
    ensureStat("Wins", 0)
    ensureStat("XP", 0)
end

Players.PlayerAdded:Connect(setupPlayer)
for _, player in ipairs(Players:GetPlayers()) do
    setupPlayer(player)
end

local ProgressionService = require(script.Parent:WaitForChild("ProgressionService"))
ProgressionService.Init()

local ArenaBuilder = require(script.Parent:WaitForChild("ArenaBuilder"))
ArenaBuilder.Build()

local CombatService = require(script.Parent:WaitForChild("CombatService"))
CombatService.Init(actionRequest, actionFeedback)

local CharacterVisuals = require(script.Parent:WaitForChild("CharacterVisuals"))
CharacterVisuals.Init()

local MatchService = require(script.Parent:WaitForChild("MatchService"))
MatchService.Init(remotes)

print("[HistoricalChampions] Final master gameplay systems initialized.")
