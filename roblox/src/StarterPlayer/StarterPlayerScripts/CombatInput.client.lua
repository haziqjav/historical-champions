-- Keyboard, mouse, and touch controls for server-validated combat actions.
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
    {
        name = "HC_Light",
        action = "LightAttack",
        title = "LIGHT",
        keys = { Enum.KeyCode.Z, Enum.UserInputType.MouseButton1 },
        position = UDim2.new(0.78, 0, 0.70, 0),
    },
    {
        name = "HC_Heavy",
        action = "HeavyAttack",
        title = "HEAVY",
        keys = { Enum.KeyCode.X, Enum.UserInputType.MouseButton2 },
        position = UDim2.new(0.88, 0, 0.58, 0),
    },
    {
        name = "HC_Dodge",
        action = "Dodge",
        title = "DODGE",
        keys = { Enum.KeyCode.C, Enum.KeyCode.LeftShift },
        position = UDim2.new(0.68, 0, 0.58, 0),
    },
}

for _, binding in ipairs(bindings) do
    ContextActionService:BindAction(binding.name, function(_, state)
        if state == Enum.UserInputState.Begin then
            send(binding.action)
        end
        return Enum.ContextActionResult.Sink
    end, true, table.unpack(binding.keys))

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
end, true, Enum.KeyCode.V, Enum.KeyCode.F)
ContextActionService:SetTitle("HC_Block", "BLOCK")
ContextActionService:SetPosition("HC_Block", UDim2.new(0.88, 0, 0.78, 0))

UserInputService.WindowFocusReleased:Connect(function()
    send("BlockEnd")
end)

player.CharacterAdded:Connect(function()
    task.wait(0.5)
    send("BlockEnd")
end)
