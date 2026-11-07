-- Phase 4 procedural R6/R15 combat poses.
-- The same server-broadcast cues animate all visible fighters on each client.
-- These poses are a prototype; authored Roblox animation clips are a later art task.

local Players=game:GetService("Players")
local ReplicatedStorage=game:GetService("ReplicatedStorage")
local RunService=game:GetService("RunService")
local feedback=ReplicatedStorage:WaitForChild("HistoricalChampionsRemotes"):WaitForChild("ActionFeedback")

local generation={}
local blocking={}

local function joint(char,names)
    for _,d in ipairs(char:GetDescendants()) do
        if d:IsA("Motor6D") then
            for _,n in ipairs(names) do if d.Name==n then return d end end
        end
    end
end

local function rig(char)
    return {
        right=joint(char,{"RightShoulder","Right Shoulder"}),
        left=joint(char,{"LeftShoulder","Left Shoulder"}),
        waist=joint(char,{"Waist","RootJoint"})
    }
end

local function trail(char,on)
    local f=char:FindFirstChild("HC_CharacterVisuals")
    if not f then return end
    for _,d in ipairs(f:GetDescendants()) do
        if d:IsA("Trail") and d.Name=="HC_SwordTrail" then d.Enabled=on end
    end
end

local function animate(char,sequence,holdUserId)
    if not char or not char.Parent then return end
    local r=rig(char); if not r.right then return end
    generation[char]=(generation[char] or 0)+1
    local token=generation[char]
    local baseR=r.right.Transform
    local baseL=r.left and r.left.Transform or CFrame.identity
    local baseW=r.waist and r.waist.Transform or CFrame.identity
    local curR,curL,curW=baseR,baseL,baseW

    local function toPose(p)
        local fromR,fromL,fromW=curR,curL,curW
        local destR=baseR*(p.r or CFrame.identity)
        local destL=baseL*(p.l or CFrame.identity)
        local destW=baseW*(p.w or CFrame.identity)
        local start=os.clock()
        repeat
            if generation[char]~=token or not char.Parent then return false end
            local a=math.clamp((os.clock()-start)/math.max(p.t,.01),0,1)
            local e=a*a*(3-2*a)
            if r.right and r.right.Parent then r.right.Transform=fromR:Lerp(destR,e) end
            if r.left and r.left.Parent then r.left.Transform=fromL:Lerp(destL,e) end
            if r.waist and r.waist.Parent then r.waist.Transform=fromW:Lerp(destW,e) end
            RunService.RenderStepped:Wait()
        until os.clock()-start>=p.t
        curR,curL,curW=destR,destL,destW
        return true
    end

    for _,p in ipairs(sequence) do
        if p.trail~=nil then trail(char,p.trail) end
        if not toPose(p) then return end
    end
    while holdUserId and blocking[holdUserId] and generation[char]==token and char.Parent do
        RunService.RenderStepped:Wait()
    end
    trail(char,false)
    if generation[char]==token then
        toPose({t=.13,r=CFrame.identity,l=CFrame.identity,w=CFrame.identity})
    end
end

local poses={
    light={
        {t=.08,r=CFrame.Angles(math.rad(-92),math.rad(12),math.rad(34)),l=CFrame.Angles(math.rad(-12),0,math.rad(-10)),w=CFrame.Angles(0,math.rad(-8),0)},
        {t=.11,r=CFrame.Angles(math.rad(28),math.rad(-12),math.rad(-72)),l=CFrame.Angles(math.rad(-20),0,math.rad(-18)),w=CFrame.Angles(0,math.rad(17),0),trail=true},
        {t=.13,r=CFrame.Angles(math.rad(12),math.rad(-8),math.rad(-42)),l=CFrame.Angles(math.rad(-8),0,math.rad(-8)),w=CFrame.Angles(0,math.rad(8),0),trail=false}
    },
    heavy={
        {t=.21,r=CFrame.Angles(math.rad(-145),math.rad(8),math.rad(18)),l=CFrame.Angles(math.rad(-36),0,math.rad(-28)),w=CFrame.Angles(math.rad(-8),math.rad(-13),0)},
        {t=.17,r=CFrame.Angles(math.rad(55),math.rad(-22),math.rad(-88)),l=CFrame.Angles(math.rad(-28),0,math.rad(-25)),w=CFrame.Angles(math.rad(9),math.rad(20),0),trail=true},
        {t=.20,r=CFrame.Angles(math.rad(18),math.rad(-12),math.rad(-38)),l=CFrame.Angles(math.rad(-8),0,math.rad(-10)),w=CFrame.Angles(0,math.rad(8),0),trail=false}
    },
    block={{t=.12,r=CFrame.Angles(math.rad(-105),math.rad(3),math.rad(18)),l=CFrame.Angles(math.rad(-105),math.rad(-3),math.rad(-18)),w=CFrame.Angles(math.rad(-4),0,0)}},
    dodge={
        {t=.09,r=CFrame.Angles(math.rad(-35),0,math.rad(45)),l=CFrame.Angles(math.rad(-35),0,math.rad(-45)),w=CFrame.Angles(math.rad(18),0,0)},
        {t=.20,r=CFrame.Angles(math.rad(-15),0,math.rad(24)),l=CFrame.Angles(math.rad(-15),0,math.rad(-24)),w=CFrame.Angles(math.rad(8),0,0)}
    },
    hit={
        {t=.07,r=CFrame.Angles(math.rad(22),0,math.rad(48)),l=CFrame.Angles(math.rad(18),0,math.rad(-38)),w=CFrame.Angles(math.rad(6),math.rad(-12),0)},
        {t=.15,r=CFrame.Angles(math.rad(-8),0,math.rad(18)),l=CFrame.Angles(math.rad(-5),0,math.rad(-15)),w=CFrame.identity}
    },
    parry={
        {t=.11,r=CFrame.Angles(math.rad(-120),0,math.rad(28)),l=CFrame.Angles(math.rad(-90),0,math.rad(-25)),w=CFrame.Angles(0,math.rad(-8),0)},
        {t=.14,r=CFrame.Angles(math.rad(-62),0,math.rad(-45)),l=CFrame.Angles(math.rad(-40),0,math.rad(-25)),w=CFrame.Angles(0,math.rad(10),0)}
    }
}

local function byUserId(id)
    for _,p in ipairs(Players:GetPlayers()) do if p.UserId==id then return p end end
end

feedback.OnClientEvent:Connect(function(event,data)
    if typeof(data)~="table" then return end
    if event=="AttackCue" then
        local p=byUserId(data.userId)
        if p and p.Character then task.spawn(animate,p.Character,data.action=="HeavyAttack" and poses.heavy or poses.light) end
    elseif event=="BlockCue" then
        blocking[data.userId]=true
        local p=byUserId(data.userId)
        if p and p.Character then task.spawn(animate,p.Character,poses.block,data.userId) end
    elseif event=="BlockEndCue" then
        blocking[data.userId]=nil
    elseif event=="DodgeCue" then
        local p=byUserId(data.userId)
        if p and p.Character then task.spawn(animate,p.Character,poses.dodge) end
    elseif event=="Hit" then
        local p=byUserId(data.targetUserId)
        if p and p.Character then task.spawn(animate,p.Character,poses.hit) end
    elseif event=="Parried" then
        local p=byUserId(data.attackerUserId)
        if p and p.Character then task.spawn(animate,p.Character,poses.parry) end
    end
end)
