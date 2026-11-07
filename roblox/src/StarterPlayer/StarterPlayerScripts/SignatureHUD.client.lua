-- Signature attack: press R on keyboard or use the generated touch action button.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ContextActionService = game:GetService("ContextActionService")
local player = Players.LocalPlayer
local remotes = ReplicatedStorage:WaitForChild("HistoricalChampionsRemotes")
local actionRequest = remotes:WaitForChild("ActionRequest")
local feedback = remotes:WaitForChild("ActionFeedback")

local gui = Instance.new("ScreenGui")
gui.Name = "HC_SignatureHUD"; gui.ResetOnSpawn = false; gui.Parent = player:WaitForChild("PlayerGui")
local holder = Instance.new("Frame")
holder.AnchorPoint = Vector2.new(.5,1); holder.Position = UDim2.new(.5,0,1,-24)
holder.Size = UDim2.fromOffset(250,48); holder.BackgroundColor3 = Color3.fromRGB(20,24,31)
holder.BackgroundTransparency = .12; holder.BorderSizePixel = 0; holder.Parent = gui
local corner = Instance.new("UICorner"); corner.CornerRadius = UDim.new(0,10); corner.Parent = holder
local outline = Instance.new("UIStroke"); outline.Color = Color3.fromRGB(180,140,72); outline.Parent = holder
local label = Instance.new("TextLabel")
label.BackgroundTransparency = 1; label.Position = UDim2.fromOffset(8,2); label.Size = UDim2.new(1,-16,0,18)
label.Font = Enum.Font.GothamBold; label.Text = "SIGNATURE STRIKE  •  R"
label.TextColor3 = Color3.fromRGB(244,215,161); label.TextSize = 11; label.Parent = holder
local back = Instance.new("Frame")
back.Position = UDim2.fromOffset(10,25); back.Size = UDim2.new(1,-20,0,12)
back.BackgroundColor3 = Color3.fromRGB(55,59,67); back.BorderSizePixel = 0; back.Parent = holder
local backCorner = Instance.new("UICorner"); backCorner.CornerRadius = UDim.new(1,0); backCorner.Parent = back
local fill = Instance.new("Frame")
fill.Size = UDim2.new(0,0,1,0); fill.BackgroundColor3 = Color3.fromRGB(201,151,69)
fill.BorderSizePixel = 0; fill.Parent = back
local fillCorner = Instance.new("UICorner"); fillCorner.CornerRadius = UDim.new(1,0); fillCorner.Parent = fill

local function update()
    local power = math.clamp(player:GetAttribute("Power") or 0,0,100)
    fill.Size = UDim2.new(power/100,0,1,0)
    label.Text = power >= 100 and "SIGNATURE READY  •  PRESS R" or ("SIGNATURE CHARGE  •  "..power.."%")
end
player:GetAttributeChangedSignal("Power"):Connect(update)
update()

local function useSignature(_, inputState)
    if inputState == Enum.UserInputState.Begin then actionRequest:FireServer("Signature") end
    return Enum.ContextActionResult.Sink
end
ContextActionService:BindAction("HC_SignatureStrike",useSignature,true,Enum.KeyCode.R)
ContextActionService:SetTitle("HC_SignatureStrike","SPECIAL")
ContextActionService:SetPosition("HC_SignatureStrike",UDim2.new(1,-116,1,-210))

feedback.OnClientEvent:Connect(function(event)
    if event == "SignatureNotReady" then
        label.Text = "BUILD POWER TO 100% FIRST"
        task.delay(1.2,update)
    end
end)
