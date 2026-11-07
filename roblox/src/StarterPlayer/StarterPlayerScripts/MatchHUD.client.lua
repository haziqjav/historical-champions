-- Compact round-state HUD for desktop and touch screens.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local player = Players.LocalPlayer
local remote = ReplicatedStorage:WaitForChild("HistoricalChampionsRemotes"):WaitForChild("MatchState")
local gui = Instance.new("ScreenGui")
gui.Name = "HC_MatchHUD"; gui.ResetOnSpawn = false; gui.Parent = player:WaitForChild("PlayerGui")
local bar = Instance.new("Frame")
bar.AnchorPoint = Vector2.new(.5,0); bar.Position = UDim2.new(.5,0,0,12); bar.Size = UDim2.new(.72,0,0,62)
bar.BackgroundColor3 = Color3.fromRGB(18,22,29); bar.BackgroundTransparency = .12
bar.BorderSizePixel = 0; bar.Parent = gui
local corner = Instance.new("UICorner"); corner.CornerRadius = UDim.new(0,12); corner.Parent = bar
local stroke = Instance.new("UIStroke"); stroke.Color = Color3.fromRGB(174,135,74); stroke.Transparency = .25; stroke.Parent = bar
local title = Instance.new("TextLabel")
title.BackgroundTransparency = 1; title.Position = UDim2.fromOffset(10,5); title.Size = UDim2.new(1,-20,0,28)
title.Font = Enum.Font.GothamBold; title.Text = "HISTORICAL CHAMPIONS"
title.TextColor3 = Color3.fromRGB(244,215,161); title.TextScaled = true; title.Parent = bar
local subtitle = Instance.new("TextLabel")
subtitle.BackgroundTransparency = 1; subtitle.Position = UDim2.fromOffset(10,34); subtitle.Size = UDim2.new(1,-20,0,20)
subtitle.Font = Enum.Font.Gotham; subtitle.Text = "Connecting to the arena..."
subtitle.TextColor3 = Color3.fromRGB(226,229,235); subtitle.TextScaled = true; subtitle.Parent = bar
remote.OnClientEvent:Connect(function(data)
    if typeof(data) ~= "table" then return end
    local timer = data.seconds and data.seconds > 0 and ("  •  " .. tostring(data.seconds) .. "s") or ""
    local count = data.players and ("  •  Fighters: " .. tostring(data.players)) or ""
    subtitle.Text = (data.message or data.state or "Ready") .. timer .. count
    if data.state == "Round" then
        title.Text = "⚔  DUEL IN PROGRESS  ⚔"
    elseif data.state == "Results" then
        title.Text = "ROUND RESULTS"
    elseif data.state == "Intermission" then
        title.Text = "NEXT ROUND"
    else
        title.Text = "HISTORICAL CHAMPIONS"
    end
end)
