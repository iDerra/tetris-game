/**
 * @brief Calculates the score multiplier based on the current game level.
 * The multiplier progression is: Level 0 -> x1, Level 1 -> x1.1, Level 2 -> x1.3, Level 3 -> x1.6, and so on,
 * where the increment added at each level itself increases by 0.1.
 * @param {number} level - The current game level.
 * @returns {number} The calculated score multiplier.
 */
function getScoreMultiplier(level) {
    if (level < 0) level = 0;
    if (typeof MAX_GAME_LEVEL !== 'undefined' && level > MAX_GAME_LEVEL) {
        level = MAX_GAME_LEVEL;
    }

    if (level === 0) return 1.0;
    
    let multiplier = 1.0;
    for (let i = 1; i <= level; i++) {
        multiplier += (0.1 * i);
    }
    return parseFloat(multiplier.toFixed(2));
}


/**
 * @brief Calculates the total accumulated score required to reach a specific target level.
 * @param {number} targetLevel - The level for which the total score threshold is being calculated.
 * @returns {number} The total score points needed to achieve the `targetLevel`.
 */
function calculateTotalScoreNeededForLevel(targetLevel) {
    if (targetLevel <= 0) return 0; 
    
    let totalScoreRequired = 0;
    for (let i = 0; i < targetLevel; i++) {
        totalScoreRequired += Math.round(BASE_POINTS_TO_LEVEL_UP * getScoreMultiplier(i));
    }
    return totalScoreRequired;
}


/**
 * @brief Updates the global `currentDropInterval` based on the current `gameLevel` and other constants.
 * This function determines how fast pieces fall.
 * @arguments None.
 * @returns None.
 */
function updateDropSpeed() {
    if (!dynamicSpeedEnabled) { 
        currentDropInterval = ORIGINAL_DROP_INTERVAL; 
        return; 
    }

    let effectiveLevel = gameLevel;
    if (typeof MAX_GAME_LEVEL !== 'undefined' && effectiveLevel > MAX_GAME_LEVEL) {
        effectiveLevel = MAX_GAME_LEVEL;
    }

    let newInterval = ORIGINAL_DROP_INTERVAL - (effectiveLevel * DROP_INTERVAL_REDUCTION_PER_LEVEL); 
    currentDropInterval = Math.max(MIN_DROP_INTERVAL, newInterval);
}


/**
 * @brief Checks if the current score has reached the threshold for the next level, and if so, updates the game level and related states.
 * @arguments None.
 * @returns None.
 */
function checkLevelUp() {
    let levelIncreasedThisCheck = false;
    while (score >= scoreNeededToReachNextLevel && (typeof MAX_GAME_LEVEL === 'undefined' || gameLevel < MAX_GAME_LEVEL)) {
        gameLevel++;
        levelIncreasedThisCheck = true;
        scoreNeededToReachNextLevel = calculateTotalScoreNeededForLevel(gameLevel + 1);
    }

    if (levelIncreasedThisCheck) {
        updateDropSpeed();
        updateScoreDisplay();
    }
}

/**
 * @brief Adds points to the player's score based on the number of lines cleared and the current game level multiplier.
 * After adding points, it updates the score display and checks for a potential level up.
 * @param {number} linesCleared - The number of lines cleared by the player.
 * @returns None.
 */
function addScore(linesCleared) {
    let basePoints = BASE_POINTS_LINE_CLEAR[linesCleared] || 0; 
    if (basePoints === 0) return;

    let currentMultiplier = getScoreMultiplier(gameLevel);
    let pointsEarned = Math.round(basePoints * currentMultiplier);

    score += pointsEarned;
    updateScoreDisplay();
    checkLevelUp();
}