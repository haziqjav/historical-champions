-- Basic input adapter. The server remains authoritative for all combat results.
local Players = game:GetService("Players")
local ContextActionService = game:GetService("ContextActionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")

local player = Players.LocalPlayer
local remotes = ReplicatedStorage:WaitForChild("HistoricalChampionsRemotes")
local actionRequest = remotes:WaitForChild("ActionRequest")

local function send(action)
    actionRequest:FireServer(action)
end

local function bindAction(actionName, serverAction, keyCode, title)
    ContextActionService:BindAction(actionName, function(_, inputState)
        if inputState == Enum.UserInputState.Begin then
            send(serverAction)
        end
        return Enum.ContextActionResult.Sink
    end, true, keyCode)
    ContextActionService:SetTitle(actionName, title)
    ContextActionService:SetPosition(actionName, UDim2.new(0.82, 0, 0.55 + (#ContextActionService:GetAllBoundActionInfo() * 0.02), 0))
end

bindAction("HC_Light", "LightAttack", Enum.KeyCode.Z, "LIGHT")
bindAction("HC_Heavy", "HeavyAttack", Enum.KeyCode.X, "HEAVY")
bindAction("HC_Dodge", "Dodge", Enum.KeyCode.C, "DODGE")

ContextActionService:BindAction("HC_Block", function(_, inputState)
    if inputState == Enum.UserInputState.Begin then
        send("BlockStart")
    elseif inputState == Enum.UserInputState.End or inputState == Enum.UserInputState.Cancel then
        send("BlockEnd")
    end
    return Enum.ContextActionResult.Sink
end, true, Enum.KeyCode.V)
ContextActionService:SetTitle("HC_Block", "BLOCK")

-- PC fallback: ContextActionService also handles keyboard keys above.
-- Release block if the window loses focus so the player cannot get stuck guarding.
UserInputService.WindowFocusReleased:Connect(function()
    send("BlockEnd")
end)

player.CharacterAdded:Connect(function()
    task.wait(0.5)
    send("BlockEnd")
end)
