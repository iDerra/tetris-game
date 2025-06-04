// --- DOM Element References for Menus ---
const startMenu = document.getElementById('start-menu');
const pauseMenu = document.getElementById('pause-menu');
const gameOverMenu = document.getElementById('game-over-menu');
const highScoresScreen = document.getElementById('high-scores-screen');
const gameContent = document.getElementById('game-content');

// --- DOM Element References for Score Displays & UI Text ---
const currentGameScoreValueElement = document.getElementById('current-game-score-value');
const allTimeHighScoreValueElement = document.getElementById('all-time-high-score-value');
const newHighScoreMessageElement = document.getElementById('new-high-score-message');
const highScoresListElement = document.getElementById('high-scores-list');
const themeSelectorElement = document.getElementById('theme-selector');
const languageSelectorElement = document.getElementById('language-selector');

// --- DOM Element References for Standard Menu Buttons ---
const startGameButton = document.getElementById('start-game-button');
const highScoresButton = document.getElementById('high-scores-button');
const resumeGameButton = document.getElementById('resume-game-button');
const restartPauseButton = document.getElementById('restart-pause-button');
const mainMenuPauseButton = document.getElementById('main-menu-pause-button');
const continueAfterGameOverButton = document.getElementById('continue-after-game-over-button');
const restartGameOverButton = document.getElementById('restart-game-over-button');
const mainMenuGameOverButton = document.getElementById('main-menu-game-over-button');
const backToMainMenuHsButton = document.getElementById('back-to-main-menu-hs-button');

// --- DOM Element References for Mute Buttons ---
let toggleMusicStartButton, toggleSfxStartButton;
let toggleMusicPauseButton, toggleSfxPauseButton;

// --- Constants for Mute Button Icons ---
const MUSIC_ON_ICON = '🎵';
const MUSIC_OFF_ICON = '🔇';
const SFX_ON_ICON = '🔊';
const SFX_OFF_ICON = '🔇';


/**
 * @brief Updates the icons on the music and SFX mute buttons based on their current mute state.
 * @arguments None.
 * @returns None.
 */
function updateMuteButtonIcons() {
    const musicMuted = typeof getMusicMuteState === 'function' ? getMusicMuteState() : false;
    const sfxMuted = typeof getSfxMuteState === 'function' ? getSfxMuteState() : false;

    if (toggleMusicStartButton && toggleMusicStartButton.querySelector('.icon')) {
        toggleMusicStartButton.querySelector('.icon').textContent = musicMuted ? MUSIC_OFF_ICON : MUSIC_ON_ICON;
    }
    if (toggleSfxStartButton && toggleSfxStartButton.querySelector('.icon')) {
        toggleSfxStartButton.querySelector('.icon').textContent = sfxMuted ? SFX_OFF_ICON : SFX_ON_ICON;
    }
    if (toggleMusicPauseButton && toggleMusicPauseButton.querySelector('.icon')) {
        toggleMusicPauseButton.querySelector('.icon').textContent = musicMuted ? MUSIC_OFF_ICON : MUSIC_ON_ICON;
    }
    if (toggleSfxPauseButton && toggleSfxPauseButton.querySelector('.icon')) {
        toggleSfxPauseButton.querySelector('.icon').textContent = sfxMuted ? SFX_OFF_ICON : SFX_ON_ICON;
    }
}


/**
 * @brief Shows a specified screen/menu overlay and hides others.
 * @param {string} screenName - The name of the screen to show. Expected values:
 * 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER', 'HIGH_SCORES'.
 * @returns None.
 */
function showScreen(screenName) {
    startMenu.classList.remove('active');
    pauseMenu.classList.remove('active');
    gameOverMenu.classList.remove('active');
    highScoresScreen.classList.remove('active');
    gameContent.classList.remove('active');

    if (screenName === 'MENU') startMenu.classList.add('active');
    else if (screenName === 'PLAYING') gameContent.classList.add('active');
    else if (screenName === 'PAUSED') pauseMenu.classList.add('active');
    else if (screenName === 'GAMEOVER') gameOverMenu.classList.add('active');
    else if (screenName === 'HIGH_SCORES') highScoresScreen.classList.add('active');
}


/**
 * @brief Updates the displayed final score, typically on the Game Over menu.
 * @param {number} score - The final score to display.
 * @returns None.
 */
function updateFinalScoreOnMenu(score) {
    if (currentGameScoreValueElement) {
        currentGameScoreValueElement.textContent = score;
    }
}


/**
 * @brief Updates the Game Over screen with the player's score, global high score, and a new high score message if applicable.
 * @param {number} currentScore - The player's score for the just-ended game.
 * @param {number} globalHighScore - The current all-time high score.
 * @param {boolean} isNewHigh - True if `currentScore` is a new high score, false otherwise.
 * @returns None.
 */
function updateGameOverScreenInfo(currentScore, globalHighScore, isNewHigh) {
    if (currentGameScoreValueElement) currentGameScoreValueElement.textContent = currentScore;
    if (allTimeHighScoreValueElement) allTimeHighScoreValueElement.textContent = globalHighScore;
    
    if (newHighScoreMessageElement) {
        newHighScoreMessageElement.classList.remove('animate-flash');

        if (isNewHigh) {
            newHighScoreMessageElement.style.display = 'block';
            void newHighScoreMessageElement.offsetWidth;
            newHighScoreMessageElement.classList.add('animate-flash');

            setTimeout(() => {
                if (newHighScoreMessageElement) {
                    newHighScoreMessageElement.classList.remove('animate-flash');
                }
            }, 1800);
        } else {
            newHighScoreMessageElement.style.display = 'none';
        }
    }
}


/**
 * @brief Displays the list of high scores on the High Scores screen.
 * @param {Array<number>} scoresArray - An array of high scores (numbers) to display.
 * @param {string} [noScoresMsgKey='noScoresMsg'] - The i18n key for the message to display if `scoresArray` is empty.
 * @returns None.
 */
function displayHighScoresOnMenu(scoresArray, noScoresMsgKey = 'noScoresMsg') {
    if (highScoresListElement) {
        highScoresListElement.innerHTML = '';
        if (scoresArray && scoresArray.length > 0) {
            scoresArray.forEach(score => {
                const listItem = document.createElement('li');
                const scoreSpan = document.createElement('span');
                scoreSpan.className = 'score-value-entry';
                scoreSpan.textContent = score;
                listItem.appendChild(scoreSpan);
                highScoresListElement.appendChild(listItem);
            });
        } else {
            const listItem = document.createElement('li');
            listItem.textContent = (TRANSLATIONS && currentLanguage && TRANSLATIONS[currentLanguage] && TRANSLATIONS[currentLanguage][noScoresMsgKey]) ? TRANSLATIONS[currentLanguage][noScoresMsgKey] : "No scores yet.";
            listItem.classList.add('no-scores-message');
            highScoresListElement.appendChild(listItem);
        }
    }
}


/**
 * @brief Initializes event listeners for all interactive elements in the menus.
 * This includes game control buttons, mute buttons, and theme/language selectors.
 * @param {object} gameActions - An object passed from `main.js` containing callback functions for core game actions.
 * @returns None.
 */
function initializeMenuEventListeners(gameActions) { 
    if (!gameActions) {
        console.error("gameActions was not provided to initializeMenuEventListeners"); 
        return; 
    }

    // Get references to mute buttons
    toggleMusicStartButton = document.getElementById('toggle-music-start');
    toggleSfxStartButton = document.getElementById('toggle-sfx-start');
    toggleMusicPauseButton = document.getElementById('toggle-music-pause');
    toggleSfxPauseButton = document.getElementById('toggle-sfx-pause');

    // Mute button listeners
    if (toggleMusicStartButton) {
        toggleMusicStartButton.addEventListener('click', () => {
            if (typeof playButtonClickSound === 'function') playButtonClickSound();
            if (typeof toggleMusicMute === 'function') toggleMusicMute();
            updateMuteButtonIcons();
        });
    }
    if (toggleSfxStartButton) {
        toggleSfxStartButton.addEventListener('click', () => { 
            if (typeof playButtonClickSound === 'function') playButtonClickSound();
            if (typeof toggleSfxMute === 'function') toggleSfxMute();
            updateMuteButtonIcons();
        });
    }
    if (toggleMusicPauseButton) {
        toggleMusicPauseButton.addEventListener('click', () => {
            if (typeof playButtonClickSound === 'function') playButtonClickSound();
            if (typeof toggleMusicMute === 'function') toggleMusicMute();
            updateMuteButtonIcons();
        });
    }
    if (toggleSfxPauseButton) {
        toggleSfxPauseButton.addEventListener('click', () => {
            if (typeof playButtonClickSound === 'function') playButtonClickSound();
            if (typeof toggleSfxMute === 'function') toggleSfxMute();
            updateMuteButtonIcons();
        });
    }

    // Helper function to add listeners with sound to standard menu buttons
    function addButtonListenerWithSound(buttonElement, action) {
        if (buttonElement) {
            buttonElement.addEventListener('click', () => {
                if (typeof playButtonClickSound === 'function') {
                    playButtonClickSound();
                }
                action();
            });
        }
    }

    // Listeners for existing menu buttons
    addButtonListenerWithSound(startGameButton, gameActions.onStartGame);
    addButtonListenerWithSound(highScoresButton, gameActions.onShowHighScores);
    addButtonListenerWithSound(resumeGameButton, gameActions.onResumeGame);
    addButtonListenerWithSound(restartPauseButton, gameActions.onRestartGame);
    addButtonListenerWithSound(mainMenuPauseButton, gameActions.onGoToMainMenu);
    addButtonListenerWithSound(continueAfterGameOverButton, gameActions.onContinueAfterGameOver);
    addButtonListenerWithSound(restartGameOverButton, gameActions.onRestartGame);
    addButtonListenerWithSound(mainMenuGameOverButton, gameActions.onGoToMainMenu);
    addButtonListenerWithSound(backToMainMenuHsButton, gameActions.onGoToMainMenu);

    // Theme selector listener
    if (themeSelectorElement && typeof THEMES !== 'undefined') {
        Object.keys(THEMES).forEach(themeKey => {
            const option = document.createElement('option');
            option.value = themeKey;
            option.textContent = THEMES[themeKey].name;
            themeSelectorElement.appendChild(option);
        });

        themeSelectorElement.addEventListener('change', (event) => {
            if (typeof playButtonClickSound === 'function') {
                playButtonClickSound();
            }
            if (gameActions.onThemeChange) {
                gameActions.onThemeChange(event.target.value);
            }
        });
        if (typeof currentThemeName !== 'undefined') {
            themeSelectorElement.value = currentThemeName;
        }
    }

    // Listener for language selector
    if (languageSelectorElement) {
        languageSelectorElement.addEventListener('change', (event) => {
            if (typeof playButtonClickSound === 'function') {
                playButtonClickSound();
            }
            if (gameActions.onLanguageChange) {
                gameActions.onLanguageChange(event.target.value);
            }
        });
    }
    updateMuteButtonIcons();
}