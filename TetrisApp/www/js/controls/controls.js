let _controlsInternalGameInstance = null;


/**
 * @brief Initializes the control system by storing the game instance and setting up keyboard and touch event listeners.
 * This function should be called once when the application starts.
 * @param {object} passedInstance - The main game instance object from `main.js`. This object should expose
 * methods and properties necessary for controls to interact with the game.
 * @returns None.
 */
function initControls(passedInstance) {
    _controlsInternalGameInstance = passedInstance;
    _setupKeyboardControls();
    _setupTouchControls();
}


/**
 * @brief Sets up touch event listeners on the game canvas for mobile controls.
 * It handles taps for rotation, vertical swipes for hard drop or pause, and horizontal drags for piece movement.
 * @arguments None.
 * @returns None.
 */
function _setupTouchControls() {
    const gameCanvas = document.getElementById('tetris-canvas');
    if (!gameCanvas) {
        console.error("Error in _setupTouchControls: Element ‘tetris-canvas’ was not found.");
        return;
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isDraggingHorizontally = false;
    let pieceInitialX = 0;

    // Constants for touch logic
    const TAP_DURATION_THRESHOLD = 250; // ms
    const TAP_MOVEMENT_THRESHOLD = 20;  // pixels
    const HORIZONTAL_DRAG_SENSITIVITY_FACTOR = 0.8; // Adjusts the drag sensitivity
    const VERTICAL_SWIPE_THRESHOLD = 50; // Minimum pixels for vertical swipe

    
    gameCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && _controlsInternalGameInstance && _controlsInternalGameInstance.currentPiece && _controlsInternalGameInstance.gameState === 'PLAYING') {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = performance.now();
            
            pieceInitialX = _controlsInternalGameInstance.currentPiece.x;
            isDraggingHorizontally = false;
        }
    }, { passive: false });


    gameCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && _controlsInternalGameInstance && _controlsInternalGameInstance.currentPiece && _controlsInternalGameInstance.gameState === 'PLAYING') {
            const touch = e.touches[0];
            const currentX = touch.clientX;
            const currentY = touch.clientY;

            const deltaXFromStart = currentX - touchStartX;
            const deltaYFromStart = currentY - touchStartY;

            // Determining whether the movement is predominantly horizontal or vertical.
            if (!isDraggingHorizontally && Math.abs(deltaYFromStart) > Math.abs(deltaXFromStart) && Math.abs(deltaYFromStart) > TAP_MOVEMENT_THRESHOLD / 2) {
                // If a vertical drag was already detected, do not allow horizontal dragging in this same gesture.
            } else if (Math.abs(deltaXFromStart) > Math.abs(deltaYFromStart) && Math.abs(deltaXFromStart) > TAP_MOVEMENT_THRESHOLD / 2) {
                isDraggingHorizontally = true;
            }

            if (isDraggingHorizontally) {
                const pixelMoved = currentX - touchStartX;
                // How many full columns we have moved with respect to the START of the current crawl for this part
                const columnsToMove = Math.floor(pixelMoved / (BLOCK_SIZE * HORIZONTAL_DRAG_SENSITIVITY_FACTOR));
                
                let targetX = pieceInitialX + columnsToMove;
                let movedThisFrame = false;

                // Move the piece one column at a time towards the targetX
                while (_controlsInternalGameInstance.currentPiece.x !== targetX) {
                    const direction = targetX > _controlsInternalGameInstance.currentPiece.x ? 1 : -1;
                    if (isPositionValid(_controlsInternalGameInstance.currentPiece, _controlsInternalGameInstance.currentPiece.x + direction, _controlsInternalGameInstance.currentPiece.y)) { // isPositionValid de board.js
                        _controlsInternalGameInstance.currentPiece.x += direction;
                        movedThisFrame = true;
                    } else {
                        // Cannot move further in that direction, update pieceInitialX to reflect the limit.
                        pieceInitialX = _controlsInternalGameInstance.currentPiece.x;
                        // And reset touchStartX so that the next columnsToMove calculation is from the current position.
                        touchStartX = currentX - (_controlsInternalGameInstance.currentPiece.x - pieceInitialX) * (BLOCK_SIZE * HORIZONTAL_DRAG_SENSITIVITY_FACTOR);
                        break; // Exit while if unable to move
                    }
                }

                if (movedThisFrame) {
                    if (_controlsInternalGameInstance.isPieceLandedState()) {
                        _controlsInternalGameInstance.handleLandedPieceHorizontalMove();
                    }
                    _controlsInternalGameInstance.drawGame();
                }
            }
        }
    }, { passive: false });

    gameCanvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (!_controlsInternalGameInstance || _controlsInternalGameInstance.gameState !== 'PLAYING' || !_controlsInternalGameInstance.currentPiece) {
            isDraggingHorizontally = false;
            return;
        }

        const touchEndTime = performance.now();
        const deltaTime = touchEndTime - touchStartTime;
        let finalDeltaX = 0;
        let finalDeltaY = 0;

        if (e.changedTouches.length === 1) {
            const touch = e.changedTouches[0];
            finalDeltaX = touch.clientX - touchStartX;
            finalDeltaY = touch.clientY - touchStartY;
        }

        // Priority: Tap (Rotate), then Swipe Vertical (Pause or Hard Drop)
        if (!isDraggingHorizontally && deltaTime < TAP_DURATION_THRESHOLD && Math.abs(finalDeltaX) < TAP_MOVEMENT_THRESHOLD && Math.abs(finalDeltaY) < TAP_MOVEMENT_THRESHOLD) { // It is a TAP - ROTATE
            _controlsInternalGameInstance.currentPiece.rotate();

            if (_controlsInternalGameInstance.isPieceLandedState()) {
                _controlsInternalGameInstance.handleLandedPieceHorizontalMove(); 
            }
        } else if (!isDraggingHorizontally && Math.abs(finalDeltaY) > VERTICAL_SWIPE_THRESHOLD && Math.abs(finalDeltaY) > Math.abs(finalDeltaX) * 1.5) { // It is a VERTICAL SWIPE
            if (finalDeltaY < 0) { // Negative means swipe UP - PAUSE
                _controlsInternalGameInstance.setGameState('PAUSED');
                if (typeof pauseBackgroundMusic === 'function') pauseBackgroundMusic(); 
                if (typeof showScreen === 'function') showScreen('PAUSED'); 
            } else { // Positive means swipe DOWN - HARD DROP (land and initiate lock delay).
                // Move the piece to the bottom
                while (!_controlsInternalGameInstance.currentPiece.moveDown()) {/* Keep falling */} 
                
                _controlsInternalGameInstance.pieceDroppedToBottom();
                _controlsInternalGameInstance.resetDropCounter();
            }
        }
        // Always redraw at the end of a touchend if the game is active, to reflect rotations or the start of the lock delay.
        _controlsInternalGameInstance.drawGame(); 
        isDraggingHorizontally = false;
    }, { passive: false });
}


/**
 * @brief Sets up keyboard event listeners for game controls.
 * Handles piece movement (left, right, down), rotation, hard drop (space), and pausing (P).
 * @arguments None.
 * @returns None.
 */
function _setupKeyboardControls() {
    document.addEventListener('keydown', (event) => {
        if (!_controlsInternalGameInstance) return;

        if (_controlsInternalGameInstance.gameState === 'PLAYING') {
            let handled = false;
            if (!_controlsInternalGameInstance.currentPiece) return;

            switch (event.key.toLowerCase()) {
                case 'arrowleft': case 'a': 
                    _controlsInternalGameInstance.currentPiece.moveLeft(); 
                    handled = true; break;

                case 'arrowright': case 'd': 
                    _controlsInternalGameInstance.currentPiece.moveRight(); 
                    handled = true; break;

                case 'arrowdown': case 's':
                    const landed = _controlsInternalGameInstance.currentPiece.moveDown();
                    if (landed) {
                        fixPieceOnBoard(_controlsInternalGameInstance.currentPiece);
                        const linesClearedInfo = checkAndClearLines();
                        _controlsInternalGameInstance.handleLineClears(linesClearedInfo);
                        _controlsInternalGameInstance.spawnNewPieceInternalLogic();
                        if (_controlsInternalGameInstance.gameOver) { _controlsInternalGameInstance.drawGame(); _controlsInternalGameInstance.handleGameOver(); return; }
                    }
                    _controlsInternalGameInstance.resetDropCounter();
                    handled = true;
                    break;

                case 'arrowup': case 'w': case 'x': 
                    _controlsInternalGameInstance.currentPiece.rotate(); 
                    handled = true; break;

                case ' ': // Space for Hard Drop
                    while (!_controlsInternalGameInstance.currentPiece.moveDown()) { /* Keep falling */ }
                    fixPieceOnBoard(_controlsInternalGameInstance.currentPiece);
                    const linesClearedInfoHardDrop = checkAndClearLines();
                    _controlsInternalGameInstance.handleLineClears(linesClearedInfoHardDrop);
                    _controlsInternalGameInstance.spawnNewPieceInternalLogic();

                    if (_controlsInternalGameInstance.gameOver) { _controlsInternalGameInstance.drawGame(); _controlsInternalGameInstance.handleGameOver(); return; }
                    _controlsInternalGameInstance.resetDropCounter();
                    handled = true;
                    break;

                case 'p':
                    _controlsInternalGameInstance.setGameState('PAUSED');
                    if (typeof pauseBackgroundMusic === 'function') pauseBackgroundMusic();
                    if (typeof showScreen === 'function') showScreen('PAUSED');
                    break;
            }
            if (handled && _controlsInternalGameInstance.gameState === 'PLAYING') _controlsInternalGameInstance.drawGame();
        } else if (_controlsInternalGameInstance.gameState === 'PAUSED' && event.key.toLowerCase() === 'p') {
            if (_controlsInternalGameInstance.gameControlActions && _controlsInternalGameInstance.gameControlActions.onResumeGame) {
                _controlsInternalGameInstance.gameControlActions.onResumeGame();
            }
        }
    });
}