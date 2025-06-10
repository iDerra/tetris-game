/**
 * @brief Stores the currently active language code for the application.
 * Initialized with `DEFAULT_LANGUAGE` from `constants.js`.
 * @type {string}
 */
let currentLanguage = DEFAULT_LANGUAGE;

/**
 * @brief Gets the currently active language code.
 * @returns {string} The current language code.
 */
function getCurrentLanguage() {
    return currentLanguage;
}


/**
 * @brief Sets the application's language, updates UI elements with translations, and saves the preference.
 * @param {string} langCode - The language code to set (e.g., 'es', 'en').
 * @param {string} gameState - The current state of the game (e.g., 'MENU', 'HIGH_SCORES').
 * Used to determine if certain UI elements like the high score list need immediate re-translation.
 * @param {Array<number>} highScores - The current high scores array. Passed to `displayHighScoresOnMenu`
 * if the game is in the 'HIGH_SCORES' state to refresh the list with the new language.
 * @returns None.
 */
function setLanguage(langCode, gameState, highScores) {
    if (!TRANSLATIONS[langCode]) {
        console.warn(`Language '${langCode}' not found. Using default language.`);
        langCode = DEFAULT_LANGUAGE;
    }
    currentLanguage = langCode;
    document.documentElement.lang = langCode;

    document.querySelectorAll('[data-i18n-key]').forEach(element => {
        const key = element.getAttribute('data-i18n-key');
        if (TRANSLATIONS[currentLanguage] && TRANSLATIONS[currentLanguage][key]) {
            if (element.tagName === 'TITLE' || key === 'instructionsText') {
                element.innerHTML = TRANSLATIONS[currentLanguage][key];
            } else {
                element.textContent = TRANSLATIONS[currentLanguage][key];
            }
        }
    });

    const languageSelectorElement = document.getElementById('language-selector');
    if (languageSelectorElement) {
        languageSelectorElement.value = currentLanguage;
    }

    if (gameState === 'HIGH_SCORES') {
        if (typeof displayHighScoresOnMenu === 'function') {
            displayHighScoresOnMenu(highScores);
        }
    }

    try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
    } catch (e) {
        console.error("Error saving language in localStorage:", e);
    }
}


/**
 * @brief Loads the preferred language from localStorage, or defaults to `DEFAULT_LANGUAGE`.
 * @returns {string} The preferred language code.
 */
function loadLanguagePreference() {
    let savedLang = DEFAULT_LANGUAGE;
    try {
        const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (storedLang && TRANSLATIONS[storedLang]) {
            savedLang = storedLang;
        }
    } catch (e) { console.error("Error loading language from localStorage:", e); }
    return savedLang;
}