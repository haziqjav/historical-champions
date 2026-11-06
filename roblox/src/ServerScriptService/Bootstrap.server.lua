-- Server bootstrap: creates remotes, initializes player state, and builds the arena.
-- All authoritative gameplay state belongs on the server.

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
    player:SetAttribute("SelectedChampion", GameConfig.Roster[1])

    if player:FindFirstChild("leaderstats") then return end
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player

    local coins = Instance.new("IntValue")
    coins.Name = "Coins"
    coins.Value = GameConfig.Progression.StartingCoins
    coins.Parent = leaderstats

    local wins = Instance.new("IntValue")
    wins.Name = "Wins"
    wins.Value = 0
    wins.Parent = leaderstats
end

Players.PlayerAdded:Connect(setupPlayer)
for _, player in Players:GetPlayers() do
    setupPlayer(player)
end

local ArenaBuilder = require(script.Parent:WaitForChild("ArenaBuilder"))
ArenaBuilder.Build()

local CombatService = require(script.Parent:WaitForChild("CombatService"))
CombatService.Init(actionRequest, actionFeedback)

print("[HistoricalChampions] Server foundation initialized.")
