/**
 * @brief Module-scoped array to store the current list of high scores.
 * This array is populated by `loadHighScoresFromStorage` and modified by `addScoreToHighScoresList`.
 * @type {Array<number>}
 */
let highScores = [];

/**
 * @brief Loads high scores from localStorage into the module-scoped `highScores` array.
 * @returns {Array<number>} An array of high scores loaded from storage, or an empty array if none found or on error.
 */
function loadHighScoresFromStorage() {
    try {
        const scoresJSON = localStorage.getItem(HIGH_SCORES_KEY);
        if (scoresJSON) {
            const parsedScores = JSON.parse(scoresJSON);
            if (Array.isArray(parsedScores) && parsedScores.every(s => typeof s === 'number')) {
                highScores = parsedScores;
                return parsedScores;
            }
        }
    } catch (error) {
        console.error("Error loading high scores from localStorage:", error);
    }
    highScores = [];
    return [];
}


/**
 * @brief Returns a copy of the current high scores list.
 * @returns {Array<number>} A new array containing the current high scores.
 */
function getHighScores() {
    return [...highScores];
}


/**
 * @brief Saves the current state of the module-scoped `highScores` array to localStorage.
 * @arguments None.
 * @returns None.
 */
function saveHighScoresToStorage() {
    try {
        localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(highScores));
    } catch (error) {
        console.error("Error saving high scores in localStorage:", error);
    }
}


/**
 * @brief Adds a new score to the high scores list, keeps the list sorted and capped at `MAX_HIGH_SCORES`,
 * and then saves the updated list to localStorage.
 * @param {number} scoreToAdd - The new score to be added to the high scores list.
 * @returns {boolean} `true` if the new score was added and resulted in a change to the top high scores list
 * (and is part of the new list), `false` otherwise.
 */
function addScoreToHighScoresList(scoreToAdd) {
    const oldHighScoresString = JSON.stringify(highScores);

    highScores.push(scoreToAdd);
    highScores.sort((a, b) => b - a);
    highScores = highScores.slice(0, MAX_HIGH_SCORES);

    saveHighScoresToStorage();

    const newHighScoresString = JSON.stringify(highScores);
    return (newHighScoresString !== oldHighScoresString) && highScores.includes(scoreToAdd);
}