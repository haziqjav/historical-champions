-- Basic input adapter. Server validates every action and computes all combat results.
local Players = game:GetService("Players")
local ContextActionService = game:GetService("ContextActionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")

local player = Players.LocalPlayer
local actionRequest = ReplicatedStorage:WaitForChild("HistoricalChampionsRemotes"):WaitForChild("ActionRequest")

local function send(action)
    actionRequest:FireServer(action)
end

local bindings = {
    { name = "HC_Light", action = "LightAttack", key = Enum.KeyCode.Z, title = "LIGHT", position = UDim2.new(0.78, 0, 0.68, 0) },
    { name = "HC_Heavy", action = "HeavyAttack", key = Enum.KeyCode.X, title = "HEAVY", position = UDim2.new(0.88, 0, 0.58, 0) },
    { name = "HC_Dodge", action = "Dodge", key = Enum.KeyCode.C, title = "DODGE", position = UDim2.new(0.68, 0, 0.58, 0) },
}

for _, binding in ipairs(bindings) do
    ContextActionService:BindAction(binding.name, function(_, state)
        if state == Enum.UserInputState.Begin then send(binding.action) end
        return Enum.ContextActionResult.Sink
    end, true, binding.key)
    ContextActionService:SetTitle(binding.name, binding.title)
    ContextActionService:SetPosition(binding.name, binding.position)
end

ContextActionService:BindAction("HC_Block", function(_, state)
    if state == Enum.UserInputState.Begin then
        send("BlockStart")
    elseif state == Enum.UserInputState.End or state == Enum.UserInputState.Cancel then
        send("BlockEnd")
    end
    return Enum.ContextActionResult.Sink
end, true, Enum.KeyCode.V)
ContextActionService:SetTitle("HC_Block", "BLOCK")
ContextActionService:SetPosition("HC_Block", UDim2.new(0.88, 0, 0.78, 0))

UserInputService.WindowFocusReleased:Connect(function()
    send("BlockEnd")
end)

player.CharacterAdded:Connect(function()
    task.wait(0.5)
    send("BlockEnd")
end)
