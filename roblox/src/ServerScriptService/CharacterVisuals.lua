-- Phase 4: first-pass champion gear and weapons, built from native Roblox parts.
-- Replace these stylized editable assets with custom meshes in the later art pass.

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local GameConfig = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("GameConfig"))
local Service = {}

local P = {
    Salahuddin={title="Ayyubid Commander",a=Color3.fromRGB(24,76,54),b=Color3.fromRGB(190,151,76),m=Color3.fromRGB(174,179,169),h="Turban",curve=true},
    BaldwinIV={title="The Leper King",a=Color3.fromRGB(206,196,168),b=Color3.fromRGB(171,133,66),m=Color3.fromRGB(181,188,194),h="RoyalHelm"},
    Reynald={title="Lord of Oultrejordain",a=Color3.fromRGB(91,34,34),b=Color3.fromRGB(48,43,42),m=Color3.fromRGB(151,157,159),h="CrusaderHelm"},
    Guy={title="King of Jerusalem",a=Color3.fromRGB(117,32,40),b=Color3.fromRGB(190,149,67),m=Color3.fromRGB(177,182,186),h="CrownHelm"},
    Balian={title="Defender of Jerusalem",a=Color3.fromRGB(43,69,94),b=Color3.fromRGB(169,178,185),m=Color3.fromRGB(151,163,172),h="OpenHelm"},
    Nooruddin={title="Zengid Sultan",a=Color3.fromRGB(29,73,92),b=Color3.fromRGB(174,137,76),m=Color3.fromRGB(173,179,170),h="Turban"},
    Shirkuh={title="The Lion of Egypt",a=Color3.fromRGB(92,54,37),b=Color3.fromRGB(177,125,55),m=Color3.fromRGB(156,158,147),h="WarTurban",curve=true},
    Bori={title="The Steppe Warlord",a=Color3.fromRGB(46,57,70),b=Color3.fromRGB(149,108,58),m=Color3.fromRGB(160,166,166),h="SteppeHelm",curve=true},
}

local function part(parent,name,size,color,material,cf,shape)
    local p=Instance.new("Part")
    p.Name=name; p.Size=size; p.Color=color; p.Material=material or Enum.Material.SmoothPlastic
    p.CFrame=cf; p.Shape=shape or Enum.PartType.Block
    p.Anchored=false; p.CanCollide=false; p.CanTouch=false; p.CanQuery=false
    p.Massless=true; p.CastShadow=true; p.TopSurface=Enum.SurfaceType.Smooth; p.BottomSurface=Enum.SurfaceType.Smooth
    p.Parent=parent
    return p
end

local function weld(p,anchor)
    local w=Instance.new("WeldConstraint")
    w.Part0=p; w.Part1=anchor; w.Parent=p
end

local function gear(folder,anchor,name,size,offset,color,material,shape)
    local p=part(folder,name,size,color,material,anchor.CFrame*offset,shape)
    weld(p,anchor)
    return p
end

local function getPart(char,...)
    for _,n in ipairs({...}) do
        local p=char:FindFirstChild(n)
        if p and p:IsA("BasePart") then return p end
    end
end

local function addHeadwear(folder,head,profile)
    if profile.h=="Turban" or profile.h=="WarTurban" then
        gear(folder,head,"HC_Turban",Vector3.new(1.18,.55,1.12),CFrame.new(0,.38,.02),profile.a,Enum.Material.Fabric,Enum.PartType.Ball)
        gear(folder,head,"HC_TurbanBand",Vector3.new(1.12,.13,1.08),CFrame.new(0,.27,-.02),profile.b,Enum.Material.Fabric,Enum.PartType.Ball)
        gear(folder,head,"HC_TurbanCrest",Vector3.new(.25,.16,.14),CFrame.new(0,.68,-.02),profile.b,Enum.Material.Metal,Enum.PartType.Ball)
        gear(folder,head,"HC_TurbanTail",Vector3.new(.58,.43,.12),CFrame.new(0,-.20,.48)*CFrame.Angles(math.rad(-12),0,0),profile.a,Enum.Material.Fabric)
    else
        gear(folder,head,"HC_HelmetDome",Vector3.new(1.18,.70,1.12),CFrame.new(0,.36,0),profile.m,Enum.Material.Metal,Enum.PartType.Ball)
        gear(folder,head,"HC_HelmetRim",Vector3.new(1.15,.13,1.1),CFrame.new(0,.11,0),profile.b,Enum.Material.Metal)
        gear(folder,head,"HC_NasalGuard",Vector3.new(.13,.5,.13),CFrame.new(0,-.13,-.52),profile.b,Enum.Material.Metal)
        if profile.h=="RoyalHelm" or profile.h=="CrownHelm" then
            for i=-1,1 do
                gear(folder,head,"HC_CrownPoint",Vector3.new(.12,.3,.12),CFrame.new(i*.28,.77,0),profile.b,Enum.Material.Metal)
            end
        elseif profile.h=="SteppeHelm" then
            gear(folder,head,"HC_HelmRidge",Vector3.new(.12,.52,.14),CFrame.new(0,.73,.03),profile.b,Enum.Material.Metal)
        else
            gear(folder,head,"HC_CheekGuardL",Vector3.new(.16,.42,.58),CFrame.new(-.49,-.16,.04),profile.m,Enum.Material.Metal)
            gear(folder,head,"HC_CheekGuardR",Vector3.new(.16,.42,.58),CFrame.new(.49,-.16,.04),profile.m,Enum.Material.Metal)
        end
    end
end

local function addSword(folder,hand,name,profile)
    local sword=Instance.new("Model"); sword.Name="HC_Weapon_"..name; sword.Parent=folder
    local grip=hand.CFrame*CFrame.new(0,-.18,-.13)*CFrame.Angles(math.rad(-66),0,math.rad(4))
    local handle=part(sword,"Handle",Vector3.new(.18,.72,.18),Color3.fromRGB(83,54,36),Enum.Material.Wood,grip)
    sword.PrimaryPart=handle
    local function bladePart(n,size,offset,color,mat,shape)
        local p=part(sword,n,size,color,mat,grip*offset,shape); weld(p,handle); return p
    end
    bladePart("HC_LeatherGrip",Vector3.new(.205,.4,.205),CFrame.new(0,-.04,0),Color3.fromRGB(50,39,32),Enum.Material.SmoothPlastic)
    bladePart("HC_Pommel",Vector3.new(.30,.24,.30),CFrame.new(0,-.43,0),profile.b,Enum.Material.Metal,Enum.PartType.Ball)
    bladePart("HC_CrossGuard",Vector3.new(1.02,.13,.20),CFrame.new(0,.38,0),profile.b,Enum.Material.Metal)
    bladePart("HC_GuardGem",Vector3.new(.22,.19,.22),CFrame.new(0,.38,0),profile.b,Enum.Material.Metal,Enum.PartType.Ball)
    local base=bladePart("HC_BladeBase",Vector3.new(.36,.62,.07),CFrame.new(0,.76,0),Color3.fromRGB(204,213,210),Enum.Material.Metal)
    bladePart("HC_BladeMid",Vector3.new(.31,.72,.065),CFrame.new(profile.curve and .05 or 0,1.40,0),Color3.fromRGB(204,213,210),Enum.Material.Metal)
    bladePart("HC_BladeUpper",Vector3.new(.23,.66,.06),CFrame.new(profile.curve and .13 or 0,2.08,0),Color3.fromRGB(204,213,210),Enum.Material.Metal)
    local tip=bladePart("HC_BladeTip",Vector3.new(.12,.46,.045),CFrame.new(profile.curve and .22 or 0,2.57,0)*CFrame.Angles(0,0,profile.curve and math.rad(9) or 0),Color3.fromRGB(204,213,210),Enum.Material.Metal)
    local a0=Instance.new("Attachment"); a0.Position=Vector3.new(0,-.25,0); a0.Parent=base
    local a1=Instance.new("Attachment"); a1.Position=Vector3.new(0,.20,0); a1.Parent=tip
    local trail=Instance.new("Trail"); trail.Name="HC_SwordTrail"; trail.Attachment0=a0; trail.Attachment1=a1
    trail.Lifetime=.18; trail.MinLength=.08; trail.LightEmission=.55
    trail.Color=ColorSequence.new(profile.b,Color3.fromRGB(225,230,230))
    trail.Transparency=NumberSequence.new({NumberSequenceKeypoint.new(0,.18),NumberSequenceKeypoint.new(1,1)})
    trail.Enabled=false; trail.Parent=base
    local gripWeld=Instance.new("WeldConstraint"); gripWeld.Part0=handle; gripWeld.Part1=hand; gripWeld.Parent=handle
end

local function addNameplate(head,name,profile)
    local gui=Instance.new("BillboardGui"); gui.Name="HC_ChampionNameplate"; gui.Size=UDim2.fromOffset(190,42)
    gui.StudsOffset=Vector3.new(0,1.55,0); gui.MaxDistance=100; gui.Adornee=head; gui.Parent=head
    local title=Instance.new("TextLabel"); title.Size=UDim2.new(1,0,0,22); title.BackgroundTransparency=1
    title.Font=Enum.Font.GothamBold; title.Text=name; title.TextColor3=profile.b
    title.TextStrokeTransparency=.35; title.TextScaled=true; title.Parent=gui
    local sub=Instance.new("TextLabel"); sub.Position=UDim2.fromOffset(0,22); sub.Size=UDim2.new(1,0,0,17)
    sub.BackgroundTransparency=1; sub.Font=Enum.Font.Gotham; sub.Text=profile.title
    sub.TextColor3=Color3.fromRGB(224,222,214); sub.TextStrokeTransparency=.5; sub.TextScaled=true; sub.Parent=gui
end

function Service.Apply(player,char)
    if not player or not char or not char.Parent then return end
    local head=getPart(char,"Head")
    local torso=getPart(char,"UpperTorso","Torso")
    local lower=getPart(char,"LowerTorso")
    local hand=getPart(char,"RightHand","Right Arm")
    if not head or not torso or not hand or not char:FindFirstChildOfClass("Humanoid") then return end
    local name=player:GetAttribute("SelectedChampion")
    local profile=P[name]
    if not profile then name=GameConfig.Roster[1]; profile=P[name] end

    local old=char:FindFirstChild("HC_CharacterVisuals"); if old then old:Destroy() end
    local folder=Instance.new("Folder"); folder.Name="HC_CharacterVisuals"; folder.Parent=char

    -- Cloak, surcoat, chest armour, belt and shoulder/forearm protection.
    gear(folder,torso,"HC_Cloak",Vector3.new(torso.Size.X*.92,torso.Size.Y*1.12,.13),CFrame.new(0,-.05,torso.Size.Z*.5+.11),profile.a,Enum.Material.Fabric)
    gear(folder,torso,"HC_CloakTrim",Vector3.new(torso.Size.X*.94,.07,.15),CFrame.new(0,-torso.Size.Y*.57,torso.Size.Z*.5+.12),profile.b,Enum.Material.Metal)
    gear(folder,torso,"HC_Surcoat",Vector3.new(torso.Size.X*.64,torso.Size.Y*.76,.12),CFrame.new(0,-.03,-torso.Size.Z*.5-.075),profile.a,Enum.Material.Fabric)
    gear(folder,torso,"HC_Chestplate",Vector3.new(torso.Size.X*.72,torso.Size.Y*.23,.14),CFrame.new(0,torso.Size.Y*.23,-torso.Size.Z*.5-.15),profile.m,Enum.Material.Metal)
    gear(folder,torso,"HC_ChestTrim",Vector3.new(torso.Size.X*.77,.055,.15),CFrame.new(0,torso.Size.Y*.06,-torso.Size.Z*.5-.17),profile.b,Enum.Material.Metal)
    local beltAnchor=lower or torso
    gear(folder,beltAnchor,"HC_Belt",Vector3.new(beltAnchor.Size.X*1.04,.15,beltAnchor.Size.Z*1.04),CFrame.new(0,beltAnchor.Size.Y*.10,0),profile.b,Enum.Material.SmoothPlastic)
    local crusader=name=="BaldwinIV" or name=="Reynald" or name=="Guy" or name=="Balian"
    gear(folder,torso,"HC_Emblem",crusader and Vector3.new(.12,.52,.045) or Vector3.new(.24,.24,.05),
        CFrame.new(0,torso.Size.Y*.18,-torso.Size.Z*.5-.23)*CFrame.Angles(0,0,crusader and 0 or math.rad(45)),profile.b,Enum.Material.Metal)
    if crusader then gear(folder,torso,"HC_EmblemBar",Vector3.new(.38,.11,.05),CFrame.new(0,torso.Size.Y*.22,-torso.Size.Z*.5-.235),profile.b,Enum.Material.Metal) end

    for _,arm in ipairs({getPart(char,"LeftUpperArm","Left Arm"),getPart(char,"RightUpperArm","Right Arm")}) do
        if arm then gear(folder,arm,"HC_ShoulderGuard",Vector3.new(arm.Size.X*1.35,.32,arm.Size.Z*1.5),CFrame.new(0,arm.Size.Y*.34,0),profile.m,Enum.Material.Metal,Enum.PartType.Ball) end
    end
    for _,arm in ipairs({getPart(char,"LeftLowerArm","Left Arm"),getPart(char,"RightLowerArm","Right Arm")}) do
        if arm then
            gear(folder,arm,"HC_ForearmBracer",Vector3.new(arm.Size.X*1.2,arm.Size.Y*.46,arm.Size.Z*1.15),CFrame.new(),profile.b,Enum.Material.Metal)
            gear(folder,arm,"HC_BracerRim",Vector3.new(arm.Size.X*1.24,.08,arm.Size.Z*1.18),CFrame.new(0,-arm.Size.Y*.23,0),profile.m,Enum.Material.Metal)
        end
    end

    addHeadwear(folder,head,profile)
    addSword(folder,hand,name,profile)
    addNameplate(head,name,profile)
    char:SetAttribute("HC_VisualsReady",true)
    char:SetAttribute("HC_Champion",name)
end

local function watch(player)
    local function apply(char)
        task.spawn(function()
            for _=1,35 do
                if not char.Parent then return end
                if getPart(char,"Head") and getPart(char,"UpperTorso","Torso") and getPart(char,"RightHand","Right Arm") then break end
                task.wait(.2)
            end
            task.wait(.3)
            Service.Apply(player,char)
        end)
    end
    player.CharacterAdded:Connect(apply)
    player:GetAttributeChangedSignal("SelectedChampion"):Connect(function()
        if player.Character then apply(player.Character) end
    end)
    if player.Character then apply(player.Character) end
end

function Service.Init()
    Players.PlayerAdded:Connect(watch)
    for _,player in ipairs(Players:GetPlayers()) do watch(player) end
end
return Service
