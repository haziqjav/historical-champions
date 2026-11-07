-- Shared tuning values for Historical Champions: Roblox Edition.
-- These are gameplay defaults, not security boundaries. The server validates every action.

local GameConfig = {}

GameConfig.Match = {
    MaxPlayers = 2,
    RoundDurationSeconds = 180,
    IntermissionSeconds = 12,
}

GameConfig.Combat = {
    LightDamage = 9,
    HeavyDamage = 21,
    LightRange = 10,
    HeavyRange = 11,
    LightCooldown = 0.34,
    HeavyCooldown = 1.05,
    DodgeCooldown = 1.65,

    LightWindup = 0.12,
    HeavyWindup = 0.32,
    LightRecovery = 0.25,
    HeavyRecovery = 0.48,
    ComboWindow = 0.95,
    MaxLightCombo = 3,

    BlockDamageMultiplier = 0.18,
    ParryWindow = 0.22,
    ParryStunSeconds = 0.85,
    GuardBreakStunSeconds = 1.05,
    DodgeInvulnerabilitySeconds = 0.30,
    DodgeImpulse = 48,

    MaxStamina = 100,
    LightStaminaCost = 9,
    HeavyStaminaCost = 23,
    DodgeStaminaCost = 22,
    BlockStaminaDrainPerSecond = 9,
    StaminaRegenPerSecond = 19,
    StaminaRegenDelay = 0.65,

    ActionRateLimit = 14,
    ActionRateWindow = 2,
    HitboxWidth = 7,
    HitboxHeight = 6,
}

GameConfig.Progression = {
    StartingCoins = 0,
    WinCoins = 25,
    ParticipationCoins = 8,
}

GameConfig.Roster = {
    "Salahuddin",
    "BaldwinIV",
    "Reynald",
    "Guy",
    "Balian",
    "Nooruddin",
    "Shirkuh",
    "Bori",
}

return GameConfig
