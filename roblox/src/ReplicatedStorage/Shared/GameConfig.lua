-- Shared constants for Historical Champions: Roblox Edition.
-- Keep gameplay authority on the server; these values are not security boundaries.

local GameConfig = {}

GameConfig.Match = {
    MaxPlayers = 2,
    RoundDurationSeconds = 180,
    IntermissionSeconds = 12,
}

GameConfig.Combat = {
    LightDamage = 8,
    HeavyDamage = 16,
    LightRange = 10,
    HeavyRange = 9,
    LightCooldown = 0.55,
    HeavyCooldown = 1.15,
    DodgeCooldown = 1.8,
    BlockDamageMultiplier = 0.15,
    ActionRateLimit = 8,
    ActionRateWindow = 2,
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
