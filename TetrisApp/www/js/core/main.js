// --- References to Game DOM Elements ---
const canvas = document.getElementById('tetris-canvas');
const context = canvas.getContext('2d');
const nextPieceCanvas = document.getElementById('next-piece-canvas');
const contextNextPiece = nextPieceCanvas.getContext('2d');
const scoreValueElement = document.getElementById('score-value');
const dynamicSpeedToggle = document.getElementById('dynamic-speed-toggle');
const levelValueHeaderElement = document.getElementById('level-value-header');

// --- Canvas configuration ---
canvas.width = COLS * BLOCK_SIZE; // COLS, BLOCK_SIZE from constants.js
canvas.height = ROWS * BLOCK_SIZE; // ROWS from constants.js
const NEXT_CANVAS_SIZE_BLOCKS = 4;
nextPieceCanvas.width = NEXT_CANVAS_SIZE_BLOCKS * BLOCK_SIZE;
nextPieceCanvas.height = NEXT_CANVAS_SIZE_BLOCKS * BLOCK_SIZE;

// --- Game State Variables ---
let currentPiece = null;
let nextPiece = null;
let lastTime = 0;
let dropCounter = 0;
let score = 0;
let gameOver = false;
let gameState = 'MENU'; // Initial state
let animationFrameId = null;
let dynamicSpeedEnabled = true;
let currentDropInterval = ORIGINAL_DROP_INTERVAL; // From constants.js
let lineClearAnimations = [];
let gameLevel = 0;
let scoreNeededToReachNextLevel = 0;
let canSwapPiece = true;
let isPieceLanded = false;
let lockDelayTimerId = null;


// --- Game Logic Instance for Controls.js ---
// This object will be passed to controls.js to interact with game state & functions
const gameInstance = {
    get currentPiece() { return currentPiece; },
    get gameState() { return gameState; },
    setGameState: (newState) => { gameState = newState; },
    get gameOver() { return gameOver; },
    drawGame: () => drawGame(),
    handleLineClears: (info) => handleLineClears(info),
    spawnNewPieceInternalLogic: () => spawnNewPieceInternalLogic(),
    handleGameOver: () => handleGameOver(),
    isPieceLandedState: () => isPieceLanded,
    clearLockDelayTimer: () => {
        clearTimeout(lockDelayTimerId);
        lockDelayTimerId = null;
    },
    lockPieceAndContinue: () => lockPieceAndContinue(),
    resetDropCounter: () => { dropCounter = 0; }, 
    handleLandedPieceHorizontalMove: () => handleLandedPieceHorizontalMove(),
    pieceDroppedToBottom: () => pieceDroppedToBottom(),
    gameControlActions: null
};


/** ----- Initialisation and Core Set Lifecycle Functions ----- */

/**
 * @brief Initializes or resets the game to a new state.
 * This function sets up all necessary variables for a new game or a restarted game,
 * optionally keeping the score and level if continuing after a game over.
 * @returns None.
 */
function initializeNewGame(keepScore = false) {
    initGameBoard();
    gameOver = false;
    isPieceLanded = false;

    clearTimeout(lockDelayTimerId);
    lockDelayTimerId = null;
    
    if (!keepScore) {
        score = 0;
        gameLevel = 0;
        scoreNeededToReachNextLevel = calculateTotalScoreNeededForLevel(gameLevel + 1);
    }
    canSwapPiece = true;
    updateScoreDisplay();

    if (dynamicSpeedToggle) dynamicSpeedEnabled = dynamicSpeedToggle.checked;
    else dynamicSpeedEnabled = true;
    updateDropSpeed();

    lastTime = performance.now(); 
    dropCounter = 0; 

    nextPiece = new Piece(getRandomPieceTypeKey()); 
    spawnNewPieceInternalLogic();

    if (gameOver) {
        handleGameOver();
    } else {
        gameState = 'PLAYING';
        playBackgroundMusic();
        if (typeof showScreen === 'function') showScreen('PLAYING');
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(updateGame);
    }
}


/**
 * @brief Handles the game over sequence.
 * This function is called when the game over condition is met.
 * It updates the game state, stops music and animations, clears timers, processes the final score,
 * plays appropriate sounds, and shows the game over screen.
 * @arguments None.
 * @returns None.
 */
function handleGameOver() {
    gameState = 'GAMEOVER';
    stopBackgroundMusic();
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = null;

    isPieceLanded = false;
    clearTimeout(lockDelayTimerId);
    lockDelayTimerId = null;

    const currentScoreVal = score;
    const isNewHigh = addScoreToHighScoresList(currentScoreVal);
    const allHighScores = getHighScores();
    const globalHighScore = allHighScores.length > 0 ? allHighScores[0] : 0;

    if (isNewHigh) {
        playNewHighScoreSound();
    } else {
        playGameOverSound();
    }

    if (typeof updateGameOverScreenInfo === 'function') {
        updateGameOverScreenInfo(currentScoreVal, globalHighScore, isNewHigh);
    }
    if (typeof showScreen === 'function') {
        showScreen('GAMEOVER');
    }
}


/** ----- Appearance Logic and Piece Manipulation ----- */

/**
 * @brief Selects and returns a random piece type key from the defined PIECE_TYPES.
 * @arguments None.
 * @returns {string} A string representing a random piece type key.
 */
function getRandomPieceTypeKey() {
    const pieceTypeKeys = Object.keys(PIECE_TYPES);
    return pieceTypeKeys[Math.floor(Math.random() * pieceTypeKeys.length)];
}


/**
 * @brief Handles the internal logic for spawning a new piece.
 * This function is called after a piece locks or at the beginning of a new game.
 * It sets the previously "next" piece as the "current" piece, generates a new "next" piece,
 * resets states related to piece landing and swapping, and checks for game over if the new
 * current piece cannot be placed.
 * @arguments None.
 * @returns None.
 */
function spawnNewPieceInternalLogic() {
    isPieceLanded = false;
    clearTimeout(lockDelayTimerId);
    lockDelayTimerId = null;
    
    currentPiece = nextPiece;
    nextPiece = new Piece(getRandomPieceTypeKey());
    canSwapPiece = true;
    
    if (currentPiece && !isPositionValid(currentPiece, currentPiece.x, currentPiece.y)) {
        gameOver = true;
    }
}


/**
 * @brief Swaps the current falling piece with the next piece.
 * @arguments None.
 * @returns None.
 */
function performPieceSwap() {
    if (!currentPiece || !nextPiece || !canSwapPiece || gameState !== 'PLAYING') { return; }

    const originalCurrentPieceType = currentPiece.type;
    currentPiece = new Piece(nextPiece.type); 

    if (!isPositionValid(currentPiece, currentPiece.x, currentPiece.y)) {
        gameOver = true; 
        handleGameOver();
        return;
    }
    nextPiece = new Piece(originalCurrentPieceType);

    canSwapPiece = false; 
    dropCounter = 0;
    drawGame(); 
}


/** ----- Part Landing Logic and 'Lock Delay' ----- */

/**
 * @brief Handles the event when a piece has landed. It sets the `isPieceLanded` state to true and 
 * starts the lock delay timer. During the lock delay, the piece can be moved horizontally.
 * @arguments None.
 * @returns None.
 */
function pieceHasLanded() {
    if (gameOver || !currentPiece) return;

    isPieceLanded = true;
    clearTimeout(lockDelayTimerId); 
    lockDelayTimerId = setTimeout(lockPieceAndContinue, LOCK_DELAY_DURATION);
}


/**
 * @brief Handles logic when a piece that is already in a "landed" state is moved horizontally by the player.
 * It resets the lock delay timer if the piece is still landed after the move, or cancels the landed state if the piece is no longer on a surface.
 * @arguments None.
 * @returns None.
 */
function handleLandedPieceHorizontalMove() {
    if (!isPieceLanded || !currentPiece) return;

    clearTimeout(lockDelayTimerId);
    lockDelayTimerId = null;

    if (isPositionValid(currentPiece, currentPiece.x, currentPiece.y + 1)) {
        isPieceLanded = false;
    } else {
        lockDelayTimerId = setTimeout(lockPieceAndContinue, LOCK_DELAY_DURATION);
    }
    drawGame();
}


/**
 * @brief Handles the situation when a piece has been actively dropped to the bottom by player controls.
 * It initiates the lock delay process by calling `pieceHasLanded()` and resets the `dropCounter`.
 * @arguments None.
 * @returns None.
 */
function pieceDroppedToBottom() {
    if (gameOver || !currentPiece) return;

    pieceHasLanded();
    dropCounter = 0;
}


/**
 * @brief Locks the current piece onto the board, processes line clears, spawns a new piece, and resets relevant game states.
 * This function is typically called when the lock delay timer expires or a piece is forced to lock.
 * * @arguments None.
 * @returns None.
 */
function lockPieceAndContinue() {
    if (!currentPiece) return;

    fixPieceOnBoard(currentPiece); 
    const linesClearedInfo = checkAndClearLines(); 
    handleLineClears(linesClearedInfo);
    
    spawnNewPieceInternalLogic();

    if (gameOver) {
        drawGame();
        handleGameOver();
        return;
    }
    
    isPieceLanded = false;
    clearTimeout(lockDelayTimerId);
    lockDelayTimerId = null;
    dropCounter = 0;
    
    // The updateGame loop will take care of redrawing if not gameOver
    if (!gameOver) { //
        drawGame();
    }
}


/** ----- Game Event Management ----- */

/**
 * @brief Handles the events following one or more lines being cleared.
 * This includes adding to the score, playing appropriate sounds, and queuing line-clearing animations.
 * @param {object} linesClearedInfo - An object containing information about the lines cleared.
 * @returns None.
 */
function handleLineClears(linesClearedInfo) {
    if (linesClearedInfo.count > 0) {
        addScore(linesClearedInfo.count);

        if (linesClearedInfo.count === 4) {
            playTetrisClearSound();
        } else {
            playLineClearSound();
        }

        lineClearAnimations.push({
            rows: linesClearedInfo.indices,
            type: linesClearedInfo.count === 4 ? 'tetris' : 'normal',
            startTime: performance.now(),
            duration: linesClearedInfo.count === 4 ? 600 : 350
        });
    }
}


/** ----- Rendering and UI Update Functions ----- */

/**
 * @brief Updates the score and level display elements in the UI.
 * @arguments None.
 * @returns None. (This function modifies DOM elements directly).
 */
function updateScoreDisplay() {
    if (scoreValueElement) scoreValueElement.textContent = score;

    if (levelValueHeaderElement) {
        levelValueHeaderElement.textContent = gameLevel;
    }
}


/**
 * @brief Main rendering function for the game.
 * Clears the main game canvas and redraws all active game elements based on the current game state and theme.
 * @arguments None.
 * @returns None. (This function draws directly to the canvas contexts).
 */
function drawGame() {
    const currentActiveThemeName = getCurrentThemeName();

    context.fillStyle = THEMES[currentActiveThemeName]['--board-bg'] || '#0f172a';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    drawBoardGrid(context, getCurrentGridColor()); 
    drawFixedPieces(context, currentActiveThemeName); 
    
    // --- Draw Ghost Piece ---
    if (currentPiece && !gameOver && gameState === 'PLAYING') { 
        const ghostY = getGhostPieceY(currentPiece); 
        if (typeof currentPiece.drawGhost === 'function') {
            currentPiece.drawGhost(context, ghostY, currentActiveThemeName);
        }
    }

    if (currentPiece && !gameOver) {
        currentPiece.draw(context, currentActiveThemeName);
    }
    
    lineClearAnimations = drawLineClearAnimationsFrame(context, lineClearAnimations, canvas.width);
    drawNextPiecePreview(nextPiece, contextNextPiece, currentActiveThemeName, NEXT_CANVAS_SIZE_BLOCKS);
}


/** ----- Main Game Loop ----- */

/**
 * @brief The main game loop function, called repeatedly using `requestAnimationFrame`.
 * It handles game timing, piece falling logic (gravity), and redrawing the game screen.
 * @param {DOMHighResTimeStamp} [currentTime=0] - The timestamp passed by `requestAnimationFrame`, indicating the current time.
 * @returns None.
 */
function updateGame(currentTime = 0) {
    if (gameState !== 'PLAYING') {
        if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
        return;
    }
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    if (!isPieceLanded) {
        dropCounter += deltaTime;
        if (dropCounter > currentDropInterval) {
            if (currentPiece) {
                const hasLandedByGravity = currentPiece.moveDown();
                if (hasLandedByGravity) {
                    pieceHasLanded();
                }
            }
            dropCounter = 0;
        }
    }
    drawGame();
    animationFrameId = requestAnimationFrame(updateGame);
}


/** ----- Callbacks for Menus and Control Actions ----- */

/**
 * @brief A collection of callback functions that define core game actions triggered by menu interactions.
 * This object is typically passed to menu initialization functions to link UI elements
 * to specific game logic defined in `main.js`. It also gets assigned to `gameInstance.gameControlActions`
 * to be accessible by other modules if needed.
 */
const gameControlActions = {
    /**
     * @brief Initiates a new game, resetting score and level.
     */
    onStartGame: () => { 
        playButtonClickSound(); 
        initializeNewGame(false); 
    },

    /**
     * @brief Resumes the game if it was previously paused.
     */
    onResumeGame: () => {
        playButtonClickSound();
        if (gameState !== 'PAUSED') return;
        gameState = 'PLAYING';
        playBackgroundMusic();
        if (typeof showScreen === 'function') showScreen('PLAYING');
        lastTime = performance.now();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(updateGame);
    },

    /**
     * @brief Restarts the current game from the beginning, resetting score and level.
     */
    onRestartGame: () => {
        playButtonClickSound();
        stopBackgroundMusic();
        initializeNewGame(false);
    },

    /**
     * @brief Navigates the player back to the main menu screen.
     */
    onGoToMainMenu: () => {
        playButtonClickSound();
        gameState = 'MENU';
        stopBackgroundMusic();
        if (typeof showScreen === 'function') showScreen('MENU');
        if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
    },

    /**
     * @brief Allows the player to start a new game after a "Game Over", typically keeping the previous score and level.
     */
    onContinueAfterGameOver: () => {
        playButtonClickSound();
        initializeNewGame(true);
    },

    /**
     * @brief Displays the high scores screen.
     */
    onShowHighScores: () => {
        playButtonClickSound();
        if (typeof displayHighScoresOnMenu === 'function') displayHighScoresOnMenu(getHighScores());
        if (typeof showScreen === 'function') showScreen('HIGH_SCORES');
    },

    /**
     * @brief Handles a request to change the game's visual theme.
     * @param {string} newThemeName - The identifier of the theme to be applied.
     */
    onThemeChange: (newThemeName) => {
        playButtonClickSound();
        applyTheme(newThemeName, () => {
            if (gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'GAMEOVER') {
                drawGame();
            }
        });
    },

    /**
     * @brief Handles a request to change the game's display language.
     * @param {string} newLangCode - The language code for the new language (e.g., 'es', 'en').
     */
    onLanguageChange: (newLangCode) => {
        playButtonClickSound();
        setLanguage(newLangCode, gameState, getHighScores());
    }
};
gameInstance.gameControlActions = gameControlActions;


/**
 * @brief Initializes the entire application.
 * This function is the main entry point for setting up the game when the page loads.
 * It initializes audio, loads saved preferences (mute settings, high scores, language, theme),
 * sets up menu event listeners, initializes game controls, and displays the main menu.
 * @arguments None.
 * @returns None.
 */
function initializeApp() {
    initAudioElements(); 
    if (typeof loadMuteSettings === 'function') { 
        loadMuteSettings();
    } else {
        console.error("loadMuteSettings function is not defined in audio.js");
    }

    loadHighScoresFromStorage();

    const preferredLang = loadLanguagePreference();
    setLanguage(preferredLang, gameState, getHighScores()); 

    const preferredTheme = loadThemePreference(); 
    applyTheme(preferredTheme, () => {
        if (gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'GAMEOVER') {
            drawGame();
        }
    });


    if (typeof initializeMenuEventListeners === 'function') {
        initializeMenuEventListeners(gameControlActions);
    } else { console.error("initializeMenuEventListeners is not defined."); }

    if (dynamicSpeedToggle) dynamicSpeedEnabled = dynamicSpeedToggle.checked;

    initControls(gameInstance);
    
    if (nextPieceCanvas) {
        nextPieceCanvas.addEventListener('click', () => {
            if (gameState === 'PLAYING') {
                performPieceSwap();
            }
        });
        nextPieceCanvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (gameState === 'PLAYING') {
                performPieceSwap();
            }
        });
    }
    
    if (typeof showScreen === 'function') showScreen('MENU');
    else { console.error("showScreen is not defined."); if(document.getElementById('start-menu')) document.getElementById('start-menu').classList.add('active'); }
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}