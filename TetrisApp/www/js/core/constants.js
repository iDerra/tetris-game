// --- Dimensions of the Board and Blocks ---
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// --- Language Settings ---
const DEFAULT_LANGUAGE = 'es';
const LANGUAGE_STORAGE_KEY = 'tetrisJSLanguage';

// --- Audio Mute Settings Storage Keys ---
const MUSIC_MUTE_STORAGE_KEY = 'tetrisJSMusicMuted_v1';
const SFX_MUTE_STORAGE_KEY = 'tetrisJSSfxMuted_v1';

// --- Piece Definitions ---
const PIECE_TYPES = {
    I: { shape: [[1, 1, 1, 1]] },
    O: { shape: [[1, 1], [1, 1]] },
    T: { shape: [[0, 1, 0], [1, 1, 1]] },
    S: { shape: [[0, 1, 1], [1, 1, 0]] },
    Z: { shape: [[1, 1, 0], [0, 1, 1]] },
    J: { shape: [[1, 0, 0], [1, 1, 1]] },
    L: { shape: [[0, 0, 1], [1, 1, 1]] }
};

// --- Scoring System ---
const BASE_POINTS_LINE_CLEAR = {
    1: 100,
    2: 220,
    3: 350,
    4: 500
};

// --- Game Speed and Level Progression ---
const ORIGINAL_DROP_INTERVAL = 1000; // Initial drop interval in milliseconds
const MIN_DROP_INTERVAL = 100;       // Minimum drop interval
const BASE_POINTS_TO_LEVEL_UP = 2000; // Points needed to increase speed
const MAX_GAME_LEVEL = 15;
const DROP_INTERVAL_REDUCTION_PER_LEVEL = 65;

// --- Piece Mechanics ---
const LOCK_DELAY_DURATION = 200;

// --- Visual Effects for Pieces ---
const BEVEL_SIZE = 3;
const HIGHLIGHT_PERCENT = 25;
const SHADOW_PERCENT = 25;

// --- Theme Management ---
const DEFAULT_THEME_NAME = 'classicDark';
const THEME_STORAGE_KEY = 'tetrisJSTSelectedTheme';

// --- High Score Management ---
const HIGH_SCORES_KEY = 'tetrisJSHighScores_v1';
const MAX_HIGH_SCORES = 5;



// --- THEME DEFINITIONS ---
/**
 * @const {Object.<string, Object>} THEMES
 * An object containing definitions for all available themes.
 * Each key is a unique theme identifier.
 * Each value is an object containing:
 * - `name`: {string} The display name of the theme.
 * - CSS custom property overrides (strings starting with '--') for various UI elements.
 * - `pieceColors`: {Object.<string, string>} Colors for each Tetris piece type.
 * - `ghostFillColor`: {string} Fill color for the ghost piece preview.
 * - Background image properties.
 */
const THEMES = {
    classicDark: {
        name: "Classic Dark",
        '--body-bg': '#1e293b',
        '--menu-overlay-bg': 'rgba(30, 41, 59, 0.85)',
        '--menu-card-bg': 'rgba(51, 65, 85, 0.9)',
        '--text-color-light': '#e2e8f0',
        '--text-color-medium': '#94a3b8',
        '--text-color-dark': '#0f172a',
        '--accent-color-primary': '#f59e0b',
        '--accent-color-primary-hover': '#d97706',
        '--accent-color-secondary-border': '#f59e0b',
        '--accent-color-secondary-hover-bg': 'rgba(245, 158, 11, 0.1)',
        '--board-bg': '#0f172a',
        '--board-border': '#475569',
        '--grid-color': '#334155',
        '--side-panel-card-bg': 'rgba(51, 65, 85, 0.7)',
        '--side-panel-card-border': 'rgba(71, 85, 105, 0.8)',
        '--checkbox-accent': '#f59e0b',
        pieceColors: { 
            I: '#06b6d4', 
            O: '#facc15', 
            T: '#8b5cf6', 
            S: '#22c55e', 
            Z: '#ef4444', 
            J: '#3b82f6', 
            L: '#f97316' 
        },
        ghostFillColor: 'rgba(226, 232, 240, 0.25)',
        '--body-background-image': 'url("../images/themes/classic-dark-bg.webp")',
        '--body-background-size': 'cover',
        '--body-background-position': 'center center',
        '--body-background-repeat': 'no-repeat',
        '--body-background-attachment': 'fixed', 
        '--body-background-overlay-color': 'rgba(30, 41, 59, 0.3)'
    },

    neonPulse: {
        name: "Neon Pulse",
        '--body-bg': '#0d0d0d',
        '--menu-overlay-bg': 'rgba(10, 10, 10, 0.8)',
        '--menu-card-bg': 'rgba(25, 25, 25, 0.85)',
        '--text-color-light': '#f0f0f0',
        '--text-color-medium': '#a0a0a0',
        '--text-color-dark': '#0d0d0d',
        '--accent-color-primary': '#ff00ff',
        '--accent-color-primary-hover': '#cc00cc',
        '--accent-color-secondary-border': '#00ffff',
        '--accent-color-secondary-hover-bg': 'rgba(0, 255, 255, 0.1)',
        '--board-bg': '#050505',
        '--board-border': '#00ffff',
        '--grid-color': '#222222',
        '--side-panel-card-bg': 'rgba(25, 25, 25, 0.7)',
        '--side-panel-card-border': 'rgba(40, 40, 40, 0.8)',
        '--checkbox-accent': '#ff00ff',
        pieceColors: { 
            I: '#00ffff', 
            O: '#ffff00', 
            T: '#ff00ff', 
            S: '#00ff00', 
            Z: '#ff3300', 
            J: '#3333ff', 
            L: '#ff9900' 
        },
        ghostFillColor: 'rgba(200, 200, 255, 0.25)',
        '--body-background-image': 'url("../images/themes/neon-pulse-bg.webp")',
        '--body-background-size': 'cover',
        '--body-background-position': 'center center',
        '--body-background-repeat': 'no-repeat',
        '--body-background-attachment': 'fixed', 
        '--body-background-overlay-color': 'rgba(30, 41, 59, 0.3)'
    },

    arcticLight: {
        name: "Arctic Light",
        '--body-bg': '#e0e7ff',
        '--menu-overlay-bg': 'rgba(240, 245, 255, 0.85)',
        '--menu-card-bg': 'rgba(255, 255, 255, 0.9)',
        '--text-color-light': '#2c3e50',
        '--text-color-medium': '#5a6a7a',
        '--text-color-dark': '#ffffff',
        '--accent-color-primary': '#3b82f6',
        '--accent-color-primary-hover': '#2563eb',
        '--accent-color-secondary-border': '#10b981',
        '--accent-color-secondary-hover-bg': 'rgba(16, 185, 129, 0.1)',
        '--board-bg': '#cbd5e1',
        '--board-border': '#94a3b8',
        '--grid-color': '#a8b2c2',
        '--side-panel-card-bg': 'rgba(226, 232, 240, 0.8)',
        '--side-panel-card-border': 'rgba(203, 213, 225, 0.9)',
        '--checkbox-accent': '#3b82f6',
        pieceColors: { 
            I: '#60a5fa', 
            O: '#a7f3d0', 
            T: '#c4b5fd', 
            S: '#5eead4', 
            Z: '#f9a8d4', 
            J: '#93c5fd', 
            L: '#fdba74' 
        },
        ghostFillColor: 'rgba(44, 62, 80, 0.2)',
        '--body-background-image': 'url("../images/themes/arctic-light-bg.webp")',
        '--body-background-size': 'cover',
        '--body-background-position': 'center center',
        '--body-background-repeat': 'no-repeat',
        '--body-background-attachment': 'fixed',
        '--body-background-overlay-color': 'rgba(30, 41, 59, 0.3)'
    },

    retroWave: {
        name: "Retro Wave",
        '--body-bg': '#231942',
        '--menu-overlay-bg': 'rgba(35, 25, 66, 0.85)',
        '--menu-card-bg': 'rgba(56, 40, 97, 0.9)',
        '--text-color-light': '#f3ccff',
        '--text-color-medium': '#bfa0c8',
        '--text-color-dark': '#231942',
        '--accent-color-primary': '#ff37a6',
        '--accent-color-primary-hover': '#e01e8f',
        '--accent-color-secondary-border': '#00f5d4',
        '--accent-color-secondary-hover-bg': 'rgba(0, 245, 212, 0.1)',
        '--board-bg': '#18112c',
        '--board-border': '#00f5d4',
        '--grid-color': '#4f3a6f',
        '--side-panel-card-bg': 'rgba(56, 40, 97, 0.7)',
        '--side-panel-card-border': 'rgba(79, 58, 111, 0.8)',
        '--checkbox-accent': '#ff37a6',
        pieceColors: { 
            I: '#00f5d4', 
            O: '#f7f558', 
            T: '#a049f0', 
            S: '#44f088', 
            Z: '#f04455', 
            J: '#4990f0', 
            L: '#f08833' 
        },
        ghostFillColor: 'rgba(0, 245, 212, 0.2)',
        '--body-background-image': 'url("../images/themes/retro-wave-bg.webp")', 
        '--body-background-size': 'cover',
        '--body-background-position': 'center center',
        '--body-background-repeat': 'no-repeat',
        '--body-background-attachment': 'fixed',
        '--body-background-overlay-color': 'rgba(30, 41, 59, 0.3)' 
    },

    forestCalm: {
        name: "Forest Calm",
        '--body-bg': '#31473A',
        '--menu-overlay-bg': 'rgba(49, 71, 58, 0.85)',
        '--menu-card-bg': 'rgba(66, 90, 75, 0.9)',
        '--text-color-light': '#E0EEDD',
        '--text-color-medium': '#A3B9A1',
        '--text-color-dark': '#203025',
        '--accent-color-primary': '#D4A276', 
        '--accent-color-primary-hover': '#BC8C5A',
        '--accent-color-secondary-border': '#82A074', 
        '--accent-color-secondary-hover-bg': 'rgba(130, 160, 116, 0.1)',
        '--board-bg': '#203025',
        '--board-border': '#5A7052',
        '--grid-color': '#415849',
        '--side-panel-card-bg': 'rgba(66, 90, 75, 0.7)',
        '--side-panel-card-border': 'rgba(90, 112, 82, 0.8)',
        '--checkbox-accent': '#D4A276',
        pieceColors: { 
            I: '#A8DADC', 
            O: '#F1FAEE', 
            T: '#E63946', 
            S: '#A1C181', 
            Z: '#F28482', 
            J: '#588157', 
            L: '#F7B267' 
        },
        ghostFillColor: 'rgba(224, 238, 221, 0.3)',
        '--body-background-image': 'url("../images/themes/forest-calm-bg.webp")', 
        '--body-background-size': 'cover',
        '--body-background-position': 'center center',
        '--body-background-repeat': 'no-repeat',
        '--body-background-attachment': 'fixed',
        '--body-background-overlay-color': 'rgba(30, 41, 59, 0.3)'
    },

    charmingPink: {
        name: "Charming Pink",
        '--body-bg': '#4a2c3a',
        '--menu-overlay-bg': 'rgba(74, 44, 58, 0.85)',
        '--menu-card-bg': 'rgba(102, 62, 81, 0.9)',
        '--text-color-light': '#fce7f3',
        '--text-color-medium': '#f4abc4',
        '--text-color-dark': '#831843',
        '--accent-color-primary': '#ec4899',
        '--accent-color-primary-hover': '#db2777',
        '--accent-color-secondary-border': '#f472b6',
        '--accent-color-secondary-hover-bg': 'rgba(244, 114, 182, 0.1)',
        '--board-bg': '#581c37',
        '--board-border': '#9d174d',
        '--grid-color': '#831843',
        '--side-panel-card-bg': 'rgba(102, 62, 81, 0.7)',
        '--side-panel-card-border': 'rgba(147, 82, 111, 0.8)',
        '--checkbox-accent': '#ec4899',
        pieceColors: { 
            I: '#fbcfe8', 
            O: '#f9a8d4', 
            T: '#f472b6', 
            S: '#ec4899', 
            Z: '#db2777', 
            J: '#be185d', 
            L: '#9d174d' 
        },
        ghostFillColor: 'rgba(252, 231, 243, 0.3)',
        '--body-background-image': 'url("../images/themes/charming-pink-bg.webp")',
        '--body-background-size': 'cover',
        '--body-background-position': 'center center',
        '--body-background-repeat': 'no-repeat',
        '--body-background-attachment': 'fixed',
        '--body-background-overlay-color': 'rgba(30, 41, 59, 0.3)'
    },

    sanrio: {
        name: "Sanrio",
        '--body-bg': '#fff0f5',
        '--menu-overlay-bg': 'rgba(255, 240, 245, 0.85)',
        '--menu-card-bg': 'rgba(255, 250, 250, 0.92)',
        '--text-color-light': '#735260',
        '--text-color-medium': '#a1808c',
        '--text-color-dark': '#fff0f5',
        '--accent-color-primary': '#ffadc6',
        '--accent-color-primary-hover': '#ff99bb',
        '--accent-color-secondary-border': '#fddde6',
        '--accent-color-secondary-hover-bg': 'rgba(255, 173, 198, 0.1)',
        '--board-bg': '#fff5f7',
        '--board-border': '#ffc0cb',
        '--grid-color': '#ffe4e1',
        '--side-panel-card-bg': 'rgba(255, 245, 247, 0.85)',
        '--side-panel-card-border': 'rgba(255, 220, 230, 0.9)',
        '--checkbox-accent': '#ffadc6',
        pieceColors: { 
            I: '#89cff0',  
            O: '#fff79a', 
            T: '#ffb3de', 
            S: '#b2f2bb',  
            Z: '#f7c08c', 
            J: '#c7b9ff', 
            L: '#ffd1dc' 
        },
        ghostFillColor: 'rgba(187, 187, 205, 0.3)',
        '--body-background-image': 'url("../images/themes/sanrio-bg.webp")',
        '--body-background-size': 'cover',
        '--body-background-position': 'center center',
        '--body-background-repeat': 'no-repeat',
        '--body-background-attachment': 'fixed',
        '--body-background-overlay-color': 'rgba(30, 41, 59, 0.3)'
    },

    kafkaHSR: {
        name: "Kafka", 
        '--body-bg': '#1a141f',
        '--menu-overlay-bg': 'rgba(26, 20, 31, 0.88)', 
        '--menu-card-bg': 'rgba(38, 31, 45, 0.92)',
        '--text-color-light': '#e8e0f0',
        '--text-color-medium': '#9c8daf',
        '--text-color-dark': '#120c16',
        '--accent-color-primary': '#e60073',
        '--accent-color-primary-hover': '#ff3399',
        '--accent-color-secondary-border': '#8c143c',
        '--accent-color-secondary-hover-bg': 'rgba(140, 20, 60, 0.2)',
        '--board-bg': '#201a28',
        '--board-border': '#e60073',
        '--grid-color': '#403548',
        '--side-panel-card-bg': 'rgba(38, 31, 45, 0.8)',
        '--side-panel-card-border': 'rgba(64, 53, 72, 0.85)',
        '--checkbox-accent': '#e60073',
        pieceColors: { 
            I: '#8a2be2',
            O: '#e60073',
            T: '#4b0082',
            S: '#c71585',
            Z: '#9932cc',
            J: '#6a0dad',
            L: '#dcb4ea'
        },
        ghostFillColor: 'rgba(230, 200, 255, 0.25)',
        '--body-background-image': 'url("../images/themes/kafka-hsr-bg.webp")',
        '--body-background-size': 'cover',
        '--body-background-position': 'center center',
        '--body-background-repeat': 'no-repeat',
        '--body-background-attachment': 'fixed',
        '--body-background-overlay-color': 'rgba(15, 10, 20, 0.55)'
    },

    topazHSR: {
        name: "Topaz & Numby",
        '--body-bg': '#fdfbf5',
        '--menu-overlay-bg': 'rgba(253, 251, 245, 0.88)',
        '--menu-card-bg': 'rgba(250, 245, 239, 0.95)',
        '--text-color-light': '#5c3a3a', 
        '--text-color-medium': '#8c6b62',
        '--text-color-dark': '#fdfbf5',
        '--accent-color-primary': '#daa520',
        '--accent-color-primary-hover': '#f0c040',
        '--accent-color-secondary-border': '#b22222',
        '--accent-color-secondary-hover-bg': 'rgba(178, 34, 34, 0.1)',
        '--board-bg': '#f5efea',
        '--board-border': '#daa520',
        '--grid-color': '#e0d5cb',
        '--side-panel-card-bg': 'rgba(250, 245, 239, 0.88)',
        '--side-panel-card-border': 'rgba(218, 165, 32, 0.7)',
        '--checkbox-accent': '#daa520',
        pieceColors: { 
            I: '#ffffff',
            O: '#ffd700',
            T: '#dc143c',
            S: '#e74c3c',
            Z: '#f0e68c',
            J: '#b22222',
            L: '#fffacd'
        },
        ghostFillColor: 'rgba(218, 165, 32, 0.25)',
        '--body-background-image': 'url("../images/themes/topaz-hsr-bg.webp")',
        '--body-background-size': 'cover',
        '--body-background-position': 'center center',
        '--body-background-repeat': 'no-repeat',
        '--body-background-attachment': 'fixed',
        '--body-background-overlay-color': 'rgba(240, 230, 220, 0.15)'
    },

    march7thHSR: {
        name: "March 7th",
        '--body-bg': '#e0f2f7',
        '--menu-overlay-bg': 'rgba(224, 242, 247, 0.85)',
        '--menu-card-bg': 'rgba(255, 255, 255, 0.92)',
        '--text-color-light': '#3d5a80', 
        '--text-color-medium': '#7a91ab',
        '--text-color-dark': '#ffffff',
        '--accent-color-primary': '#ff8fab',
        '--accent-color-primary-hover': '#ffadd2',
        '--accent-color-secondary-border': '#89cff0',
        '--accent-color-secondary-hover-bg': 'rgba(137, 207, 240, 0.15)',
        '--board-bg': '#f0faff',
        '--board-border': '#a0d2eb',
        '--grid-color': '#cde8f3',
        '--side-panel-card-bg': 'rgba(240, 248, 255, 0.88)',
        '--side-panel-card-border': 'rgba(176, 224, 230, 0.9)',
        '--checkbox-accent': '#ff8fab',
        pieceColors: {
            I: '#89cff0',
            O: '#ffd1dc',
            T: '#ff8fab',
            S: '#b0e0e6',
            Z: '#f0a6ca',
            J: '#add8e6',
            L: '#ffffff'
        },
        ghostFillColor: 'rgba(173, 216, 230, 0.3)',
        '--body-background-image': 'url("../images/themes/7march-hsr-bg.webp")',
        '--body-background-size': 'cover',
        '--body-background-position': 'center center',
        '--body-background-repeat': 'no-repeat',
        '--body-background-attachment': 'fixed',
        '--body-background-overlay-color': 'rgba(230, 245, 255, 0.1)'
    }
};


// --- TRANSLATIONS ---
/**
 * @const {Object.<string, Object.<string, string>>} TRANSLATIONS
 * Contains translations for UI text elements.
 * The outer keys are language codes.
 * The inner keys are i18n keys used in `data-i18n-key` attributes in HTML or by JavaScript,
 * and their values are the translated strings.
 */
const TRANSLATIONS = {
    es: {
        // General Titles and Labels
        tetrisTitle: "TETRIS",
        languageLabel: "Idioma:",
        themeLabel: "Tema:",
        // Main Menu
        dynamicDescentLabel: "Velocidad dinámica",
        startGameButton: "Iniciar Juego",
        highScoresButton: "Mejores Puntuaciones",
        musicLabel: "Música",
        sfxLabel: "Sonidos",
        // Pause Menu
        pauseTitle: "Pausa",
        resumeButton: "Continuar",
        restartButton: "Reiniciar Partida",
        mainMenuButton: "Menú Principal",
        // Game Over Menu
        gameOverTitle: "Game Over",
        yourScoreLabel: "Tu Puntuación:",
        globalMaxScoreLabel: "Máxima Global:",
        newHighScoreMsg: "¡Nueva Máxima Puntuación en el Top 5!",
        continueGameOverButton: "Continuar",
        // High Scores Screen
        highScoresTitle: "Mejores Puntuaciones",
        noScoresMsg: "Aún no hay puntuaciones.",
        backToMenuButton: "Volver al Menú",
        // Game Side Panel
        scoreLabelCaps: "PUNTUACIÓN",
        nextPieceLabelCaps: "SIGUIENTE",
        instructionsTitle: "Controles:",
        instructionsText: "P: Pausa<br>↑ / W / X: Rotar<br>← / A: Izquierda<br>→ / D: Derecha<br>↓ / S: Bajar<br>SPACE: Drop",
        levelLabelCaps: "NIVEL",
    },
    en: {
        // General Titles and Labels
        tetrisTitle: "TETRIS",
        languageLabel: "Language:",
        themeLabel: "Theme:",
        // Main Menu
        dynamicDescentLabel: "Dynamic velocity",
        startGameButton: "Start Game",
        highScoresButton: "High Scores",
        musicLabel: "Music",
        sfxLabel: "SFX",
        // Pause Menu
        pauseTitle: "Paused",
        resumeButton: "Resume",
        restartButton: "Restart Game",
        mainMenuButton: "Main Menu",
        // Game Over Menu
        gameOverTitle: "Game Over",
        yourScoreLabel: "Your Score:",
        globalMaxScoreLabel: "Global High:",
        newHighScoreMsg: "New Top 5 High Score!",
        continueGameOverButton: "Continue",
        // High Scores Screen
        highScoresTitle: "High Scores",
        noScoresMsg: "No scores yet.",
        backToMenuButton: "Back to Menu",
        // Game Side Panel
        scoreLabelCaps: "SCORE",
        nextPieceLabelCaps: "NEXT",
        instructionsTitle: "Controls:",
        instructionsText: "P: Pause<br>↑ / W / X: Rotate<br>← / A: Left<br>→ / D: Right<br>↓ / S: Down<br>SPACE: Drop",
        levelLabelCaps: "LEVEL",
    }
};


// --- Utility Functions for Color Manipulation ---
/**
 * @brief Lightens a given hex color by a specified percentage.
 * @param {string} hex - The hex color string.
 * @param {number} percent - The percentage by which to lighten the color.
 * @returns {string} The lightened hex color string in '#RRGGBB' format.
 */
function lightenColor(hex, percent) {
    hex = hex.replace(/^\s*#|\s*$/g, '');
    if (hex.length === 3) {
        hex = hex.replace(/(.)/g, '$1$1');
    }
    let r = parseInt(hex.substring(0, 2), 16),
        g = parseInt(hex.substring(2, 4), 16),
        b = parseInt(hex.substring(4, 6), 16);

    r = Math.min(255, Math.floor(r * (1 + percent / 100)));
    g = Math.min(255, Math.floor(g * (1 + percent / 100)));
    b = Math.min(255, Math.floor(b * (1 + percent / 100)));

    return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}


/**
 * @brief Darkens a given hex color by a specified percentage.
 * Internally calls `lightenColor` with a negative percentage.
 * @param {string} hex - The hex color string.
 * @param {number} percent - The percentage by which to darken the color.
 * @returns {string} The darkened hex color string in '#RRGGBB' format.
 */
function darkenColor(hex, percent) {
    return lightenColor(hex, -percent);
}
function darkenColor(hex, percent) {
    return lightenColor(hex, -percent);
}

