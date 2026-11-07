-- In-game field guide: combat controls, roster notes, and a concise historical chronicle.
-- Historical notes are educational summaries; the arena duels are fictionalized gameplay.

local Players = game:GetService("Players")
local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

local old = playerGui:FindFirstChild("HC_FieldGuide")
if old then old:Destroy() end

local gui = Instance.new("ScreenGui")
gui.Name = "HC_FieldGuide"
gui.ResetOnSpawn = false
gui.DisplayOrder = 20
gui.Parent = playerGui

local openButton = Instance.new("TextButton")
openButton.Name = "OpenGuide"
openButton.AnchorPoint = Vector2.new(1, 0)
openButton.Position = UDim2.new(1, -18, 0, 84)
openButton.Size = UDim2.fromOffset(132, 34)
openButton.BackgroundColor3 = Color3.fromRGB(28, 34, 43)
openButton.TextColor3 = Color3.fromRGB(244, 215, 161)
openButton.Text = "📜 FIELD GUIDE"
openButton.Font = Enum.Font.GothamBold
openButton.TextSize = 12
openButton.AutoButtonColor = true
openButton.Parent = gui
local openCorner = Instance.new("UICorner")
openCorner.CornerRadius = UDim.new(0, 8)
openCorner.Parent = openButton
local openStroke = Instance.new("UIStroke")
openStroke.Color = Color3.fromRGB(174, 135, 74)
openStroke.Thickness = 1.2
openStroke.Parent = openButton

local panel = Instance.new("Frame")
panel.Name = "GuidePanel"
panel.AnchorPoint = Vector2.new(0.5, 0.5)
panel.Position = UDim2.fromScale(0.5, 0.52)
panel.Size = UDim2.new(0.92, 0, 0.78, 0)
panel.BackgroundColor3 = Color3.fromRGB(17, 21, 29)
panel.BorderSizePixel = 0
panel.Visible = false
panel.Parent = gui
local sizeLimit = Instance.new("UISizeConstraint")
sizeLimit.MinSize = Vector2.new(300, 310)
sizeLimit.MaxSize = Vector2.new(660, 440)
sizeLimit.Parent = panel
local panelCorner = Instance.new("UICorner")
panelCorner.CornerRadius = UDim.new(0, 14)
panelCorner.Parent = panel
local panelStroke = Instance.new("UIStroke")
panelStroke.Color = Color3.fromRGB(185, 145, 76)
panelStroke.Thickness = 1.5
panelStroke.Parent = panel

local header = Instance.new("TextLabel")
header.BackgroundTransparency = 1
header.Position = UDim2.fromOffset(16, 10)
header.Size = UDim2.new(1, -68, 0, 28)
header.Font = Enum.Font.GothamBold
header.Text = "THE CHRONICLE OF THE LEVANT"
header.TextColor3 = Color3.fromRGB(244, 215, 161)
header.TextSize = 17
header.TextXAlignment = Enum.TextXAlignment.Left
header.Parent = panel

local close = Instance.new("TextButton")
close.AnchorPoint = Vector2.new(1, 0)
close.Position = UDim2.new(1, -10, 0, 8)
close.Size = UDim2.fromOffset(34, 30)
close.BackgroundColor3 = Color3.fromRGB(55, 45, 42)
close.Text = "✕"
close.TextColor3 = Color3.fromRGB(245, 235, 220)
close.Font = Enum.Font.GothamBold
close.TextSize = 15
close.Parent = panel
local closeCorner = Instance.new("UICorner")
closeCorner.CornerRadius = UDim.new(0, 7)
closeCorner.Parent = close

local tabs = Instance.new("Frame")
tabs.BackgroundTransparency = 1
tabs.Position = UDim2.fromOffset(12, 45)
tabs.Size = UDim2.new(1, -24, 0, 34)
tabs.Parent = panel
local tabLayout = Instance.new("UIListLayout")
tabLayout.FillDirection = Enum.FillDirection.Horizontal
tabLayout.HorizontalAlignment = Enum.HorizontalAlignment.Left
tabLayout.VerticalAlignment = Enum.VerticalAlignment.Center
tabLayout.Padding = UDim.new(0, 6)
tabLayout.Parent = tabs

local content = Instance.new("ScrollingFrame")
content.Name = "GuideContent"
content.Position = UDim2.fromOffset(12, 86)
content.Size = UDim2.new(1, -24, 1, -98)
content.BackgroundColor3 = Color3.fromRGB(25, 30, 39)
content.BackgroundTransparency = 0.08
content.BorderSizePixel = 0
content.ScrollBarThickness = 5
content.AutomaticCanvasSize = Enum.AutomaticSize.Y
content.CanvasSize = UDim2.new(0, 0, 0, 0)
content.Parent = panel
local contentCorner = Instance.new("UICorner")
contentCorner.CornerRadius = UDim.new(0, 9)
contentCorner.Parent = content
local contentPad = Instance.new("UIPadding")
contentPad.PaddingTop = UDim.new(0, 10)
contentPad.PaddingBottom = UDim.new(0, 16)
contentPad.PaddingLeft = UDim.new(0, 12)
contentPad.PaddingRight = UDim.new(0, 12)
contentPad.Parent = content

local body = Instance.new("TextLabel")
body.Name = "PageText"
body.BackgroundTransparency = 1
body.Size = UDim2.new(1, -4, 0, 0)
body.AutomaticSize = Enum.AutomaticSize.Y
body.Font = Enum.Font.Gotham
body.TextColor3 = Color3.fromRGB(225, 228, 233)
body.TextSize = 14
body.TextWrapped = true
body.TextXAlignment = Enum.TextXAlignment.Left
body.TextYAlignment = Enum.TextYAlignment.Top
body.LineHeight = 1.18
body.Parent = content

local pages = {
    Controls = [[HOW TO FIGHT

MOVE
W A S D or the arrow keys. Space jumps. Keep your opponent in front of you; blocks only protect your front.

LIGHT ATTACK  —  Z or left mouse button
Fast strikes. Chain up to three hits by timing your next attack.

HEAVY ATTACK  —  X or right mouse button
Slower, stronger and more costly in stamina. Use it when your opponent is recovering.

BLOCK / PARRY  —  hold V or F
A short opening at the start of a block can parry an incoming strike. Holding block drains stamina.

DODGE  —  C or Left Shift
A quick evasive movement with a brief window of protection. Direction follows your movement input.

SIGNATURE STRIKE  —  R or SPECIAL
Successful hits charge Power. At 100%, release your champion's signature strike.

TACTICAL TIPS
Do not mash every action. Watch your stamina, vary your timing, face your opponent, and use a dodge to escape a heavy attack. A broken guard leaves you exposed.

On phones and tablets, use the generated on-screen combat buttons. Rotate to landscape for the widest view.]],

    Chronicle = [[A SHORT HISTORY OF THE CONTESTED LEVANT

The people in this roster lived across different decades of the 12th century. The game brings them together for fictionalized arena duels; these exact one-on-one matchups did not happen as shown.

1085 — Tâcülmülûk Böri was born. He later became atabeg of Damascus (1128–1132), during the Burid dynasty.

1146 — Nur ad-Din succeeded his father Zengi in Aleppo. He later took Damascus in 1154, bringing the city under Zengid rule.

1160s — As an experienced commander serving Nur ad-Din, Shirkuh led campaigns in Egypt. After his death in 1169, his nephew Saladin succeeded him as vizier.

1171 — Saladin ended the Fatimid caliphate in Egypt and governed in the name of Nur ad-Din before building his own Ayyubid power.

1174 — Nur ad-Din died. Baldwin IV became king of Jerusalem at age thirteen. The balance of power in Syria, Egypt and the Crusader states shifted rapidly.

1177 — Baldwin IV's forces defeated Saladin's army at Montgisard. Medieval battles depended on armies, logistics and alliances—not simply on two champions.

1182 — Reynald of Châtillon led a controversial Red Sea expedition. Its aims and details are debated by historians; it provoked strong reactions in contemporary Muslim accounts.

4 JULY 1187 — Saladin's army defeated the Crusader field army at Hattin. Guy of Lusignan was captured. The defeat opened the way for Saladin's campaign to recover Jerusalem.

2 OCTOBER 1187 — Jerusalem surrendered to Saladin after a siege. Balian of Ibelin helped organise the city's defence and negotiated terms for the population.

WHY THIS MATTERS
The Crusades were not a simple story of heroes and villains. They involved rulers, soldiers, merchants, religious communities and civilians. Alliances changed, sources disagree, and ordinary people paid a heavy price. Learn the context—not just the battles.]],

    Champions = [[THE EIGHT CHAMPIONS

SALAHUDDIN — Ayyubid ruler
Ṣalāḥ al-Dīn (Saladin) rose to power in Egypt and Syria. He defeated the Crusader army at Hattin in 1187 and later negotiated Jerusalem's surrender.

BALDWIN IV — King of Jerusalem
Ruled from 1174 to 1185 while living with leprosy. His forces won at Montgisard in 1177. His reign was shaped by fragile alliances and succession disputes.

REYNALD OF CHÂTILLON — Lord of Oultrejordain
A powerful and controversial Frankish lord. His raids, including a Red Sea expedition, contributed to the conflict with Saladin. He was captured at Hattin.

GUY OF LUSIGNAN — King of Jerusalem
Became king in 1186 through his marriage to Sibylla. He led the Crusader army at Hattin, was captured, later released, and eventually ruled Cyprus.

BALIAN OF IBELIN — Lord and negotiator
A Frankish noble who organised Jerusalem's defence in 1187. He negotiated the city's surrender with Saladin, seeking terms for its inhabitants.

NUR AD-DIN — Zengid ruler
Nūr al-Dīn Maḥmūd ruled in Aleppo and Damascus. He strengthened Zengid power in Syria; Saladin initially rose within the political and military world he shaped.

SHIRKUH — Military commander
Asad al-Din Shirkuh served Nur ad-Din and led campaigns in Egypt. His short tenure as vizier in 1169 was followed by Saladin's rise.

BÖRI — Burid atabeg of Damascus
Tâcülmülûk Böri ruled Damascus from 1128 to 1132. He belonged to the Burid dynasty, which governed Damascus before Nur ad-Din took the city in 1154.

HISTORICAL NOTE
Names, titles and dates vary across Arabic, Latin and modern sources. Armour colours, exact face designs, signature moves and the arena presentation are artistic interpretations—not verified portraits or reconstructions of specific historical equipment.]],
}

local tabButtons = {}
local function showPage(name)
    body.Text = pages[name]
    for key, button in pairs(tabButtons) do
        local selected = key == name
        button.BackgroundColor3 = selected and Color3.fromRGB(113, 79, 40) or Color3.fromRGB(42, 49, 60)
        button.TextColor3 = selected and Color3.fromRGB(255, 229, 177) or Color3.fromRGB(225, 229, 235)
    end
    content.CanvasPosition = Vector2.zero
end

for _, name in ipairs({"Controls", "Chronicle", "Champions"}) do
    local button = Instance.new("TextButton")
    button.Name = name .. "Tab"
    button.Size = UDim2.new(0.333, -5, 1, 0)
    button.BackgroundColor3 = Color3.fromRGB(42, 49, 60)
    button.BorderSizePixel = 0
    button.Text = name
    button.Font = Enum.Font.GothamBold
    button.TextSize = 12
    button.TextColor3 = Color3.fromRGB(225, 229, 235)
    button.Parent = tabs
    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 7)
    corner.Parent = button
    tabButtons[name] = button
    button.Activated:Connect(function()
        showPage(name)
    end)
end

openButton.Activated:Connect(function()
    panel.Visible = not panel.Visible
end)
close.Activated:Connect(function()
    panel.Visible = false
end)

showPage("Controls")
