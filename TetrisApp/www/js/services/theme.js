/**
 * @brief Stores the key/name of the currently active theme.
 * Initialized with `DEFAULT_THEME_NAME` from `constants.js`.
 * @type {string}
 */
let currentThemeName = DEFAULT_THEME_NAME;

/**
 * @brief Stores the grid color for the currently active theme.
 * Initialized with the grid color of the `DEFAULT_THEME_NAME`.
 * @type {string}
 */
let currentGridColor = THEMES[DEFAULT_THEME_NAME]['--grid-color'];


/**
 * @brief Gets the key/name of the currently active theme.
 * @returns {string} The name of the current theme.
 */
function getCurrentThemeName() {
    return currentThemeName;
}


/**
 * @brief Gets the grid color for the currently active theme.
 * This color is used by `board.js` to draw the game board grid.
 * @returns {string} The CSS color string for the current theme's grid.
 */
function getCurrentGridColor() {
    return currentGridColor;
}


/**
 * @brief Applies a new theme to the application.
 * Updates CSS custom properties on the root element, saves the theme preference to localStorage,
 * and updates the theme selector UI element.
 * @param {string} themeName - The key/name of the theme to apply (must be a key in the global `THEMES` object).
 * @param {function} [needsRedrawCallback] - An optional callback function
 * that is called after the theme is applied, usually to redraw game elements if they are visible.
 * @returns None.
 */
function applyTheme(themeName, needsRedrawCallback) { 
    if (!THEMES[themeName]) {
        console.warn(`Theme '${themeName}' not found. Using default theme.`);
        themeName = DEFAULT_THEME_NAME;
    }
    currentThemeName = themeName;
    const theme = THEMES[themeName];

    for (const [key, value] of Object.entries(theme)) {
        if (key.startsWith('--')) {
            document.documentElement.style.setProperty(key, value);
        }
    }

    currentGridColor = theme['--grid-color'];

    if (typeof needsRedrawCallback === 'function') {
        needsRedrawCallback();
    }

    try {
        localStorage.setItem(THEME_STORAGE_KEY, themeName);
    } catch (e) {
        console.error("Error saving theme to localStorage:", e);
    }

    const themeSelectorElement = document.getElementById('theme-selector');
    if (themeSelectorElement) {
        themeSelectorElement.value = currentThemeName;
    }
}


/**
 * @brief Loads the saved theme preference from localStorage, or defaults to `DEFAULT_THEME_NAME`.
 * @returns {string} The preferred theme name.
 */
function loadThemePreference() {
    let savedTheme = DEFAULT_THEME_NAME;
    try {
        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme && THEMES[storedTheme]) {
            savedTheme = storedTheme;
        }
    } catch (e) { console.error("Error loading localStorage theme:", e); }
    return savedTheme;
}