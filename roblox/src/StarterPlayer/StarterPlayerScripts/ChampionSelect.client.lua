-- Champion selection menu. The server validates every requested fighter.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local player = Players.LocalPlayer
local roster = {"Salahuddin","BaldwinIV","Reynald","Guy","Balian","Nooruddin","Shirkuh","Bori"}
local displayNames = {
    Salahuddin="Salahuddin", BaldwinIV="Baldwin IV", Reynald="Reynald",
    Guy="Guy of Lusignan", Balian="Balian", Nooruddin="Nur ad-Din",
    Shirkuh="Shirkuh", Bori="Bori"
}
local remotes = ReplicatedStorage:WaitForChild("HistoricalChampionsRemotes")
local request = remotes:WaitForChild("ChampionSelectRequest")
local feedback = remotes:WaitForChild("ChampionSelectFeedback")

local gui = Instance.new("ScreenGui")
gui.Name = "HC_ChampionSelect"; gui.ResetOnSpawn = false; gui.IgnoreGuiInset = true
gui.Parent = player:WaitForChild("PlayerGui")
local panel = Instance.new("Frame")
panel.Name = "Panel"; panel.AnchorPoint = Vector2.new(0,0.5)
panel.Position = UDim2.new(0,18,0.5,0); panel.Size = UDim2.fromOffset(225,390)
panel.BackgroundColor3 = Color3.fromRGB(20,24,32); panel.BackgroundTransparency = .08
panel.BorderSizePixel = 0; panel.Parent = gui
local corner = Instance.new("UICorner"); corner.CornerRadius = UDim.new(0,12); corner.Parent = panel
local stroke = Instance.new("UIStroke"); stroke.Color = Color3.fromRGB(190,151,83); stroke.Thickness = 1.5; stroke.Parent = panel
local title = Instance.new("TextLabel")
title.BackgroundTransparency = 1; title.Position = UDim2.fromOffset(12,9); title.Size = UDim2.new(1,-24,0,30)
title.Font = Enum.Font.GothamBold; title.Text = "CHOOSE YOUR CHAMPION"
title.TextColor3 = Color3.fromRGB(238,211,155); title.TextSize = 15; title.Parent = panel
local hint = Instance.new("TextLabel")
hint.BackgroundTransparency = 1; hint.Position = UDim2.fromOffset(12,39); hint.Size = UDim2.new(1,-24,0,23)
hint.Font = Enum.Font.Gotham; hint.Text = "Select a fighter before the duel"
hint.TextColor3 = Color3.fromRGB(195,199,207); hint.TextSize = 11; hint.Parent = panel
local list = Instance.new("ScrollingFrame")
list.Position = UDim2.fromOffset(10,68); list.Size = UDim2.new(1,-20,1,-112)
list.BackgroundTransparency = 1; list.BorderSizePixel = 0; list.ScrollBarThickness = 4
list.CanvasSize = UDim2.new(0,0,0,0); list.AutomaticCanvasSize = Enum.AutomaticSize.Y
list.Parent = panel
local layout = Instance.new("UIListLayout"); layout.Padding = UDim.new(0,6); layout.SortOrder = Enum.SortOrder.LayoutOrder; layout.Parent = list
local status = Instance.new("TextLabel")
status.Position = UDim2.new(0,10,1,-38); status.Size = UDim2.new(1,-20,0,28)
status.BackgroundTransparency = 1; status.Font = Enum.Font.Gotham; status.Text = "Your fighter is ready"
status.TextColor3 = Color3.fromRGB(220,220,220); status.TextSize = 11; status.Parent = panel

local buttons = {}
local function updateSelected(name)
    for key, button in pairs(buttons) do
        button.BackgroundColor3 = key == name and Color3.fromRGB(105,76,38) or Color3.fromRGB(39,46,58)
        button.TextColor3 = key == name and Color3.fromRGB(255,226,164) or Color3.fromRGB(235,237,241)
    end
end
for index, name in ipairs(roster) do
    local button = Instance.new("TextButton")
    button.Name = name; button.LayoutOrder = index; button.Size = UDim2.new(1,-6,0,32)
    button.BackgroundColor3 = Color3.fromRGB(39,46,58); button.BorderSizePixel = 0
    button.Font = Enum.Font.GothamSemibold; button.Text = displayNames[name]
    button.TextColor3 = Color3.fromRGB(235,237,241); button.TextSize = 13
    button.AutoButtonColor = true; button.Parent = list
    local c = Instance.new("UICorner"); c.CornerRadius = UDim.new(0,7); c.Parent = button
    buttons[name] = button
    button.Activated:Connect(function()
        request:FireServer(name)
        status.Text = "Requesting " .. displayNames[name] .. "..."
    end)
end
updateSelected(player:GetAttribute("SelectedChampion"))
player:GetAttributeChangedSignal("SelectedChampion"):Connect(function()
    updateSelected(player:GetAttribute("SelectedChampion"))
end)
feedback.OnClientEvent:Connect(function(ok, message)
    status.Text = ok and ("Selected: " .. (displayNames[message] or message)) or tostring(message)
    if ok then updateSelected(message) end
end)
