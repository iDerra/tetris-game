/**
 * @brief Represents the game board as a 2D array.
 * Each cell stores either 0 (empty) or a string representing the type of piece fixed in that cell (e.g., "I", "O").
 * @type {Array<Array<number|string>>}
 */
let gameBoard;

/**
 * @brief Initializes the game board to an empty state.
 * Creates a 2D array (`gameBoard`) of size ROWS x COLS, filling it with 0s, where 0 represents an empty cell.
 * @arguments None.
 * @returns None.
 */
function initGameBoard() {
    gameBoard = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}


/**
 * @brief Draws the grid lines on the game board canvas.
 * @param {CanvasRenderingContext2D} context - The 2D rendering context of the main game canvas.
 * @param {string} gridColorToUse - The color string to use for drawing the grid lines.
 * @returns None.
 */
function drawBoardGrid(context, gridColorToUse) {
    context.strokeStyle = gridColorToUse || '#4a6572';
    context.lineWidth = 0.5;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            context.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }
}


/**
 * @brief Draws all the pieces that have been fixed onto the game board.
 * It renders each block of these pieces with a bevel effect based on the current theme's piece colors.
 * @param {CanvasRenderingContext2D} context - The 2D rendering context of the main game canvas.
 * @param {string} themeNameToUse - The key/name of the current theme, used to fetch appropriate piece colors.
 * @returns None.
 */
function drawFixedPieces(context, themeNameToUse) {
    const bs = BEVEL_SIZE;
    const themePieceColors = THEMES[themeNameToUse].pieceColors;

    gameBoard.forEach((row, r_idx) => {
        row.forEach((pieceTypeKey, c_idx) => { 
            if (pieceTypeKey !== 0) { 
                const baseColor = themePieceColors[pieceTypeKey];
                if (!baseColor) {
                    console.error(`Colour not defined for type ${pieceTypeKey} in theme ${currentThemeName}`);
                    context.fillStyle = '#555555';
                    context.fillRect(c_idx * BLOCK_SIZE, r_idx * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    return;
                }

                const light = lightenColor(baseColor, HIGHLIGHT_PERCENT);
                const dark = darkenColor(baseColor, SHADOW_PERCENT);
                const x = c_idx * BLOCK_SIZE;
                const y = r_idx * BLOCK_SIZE;

                context.fillStyle = dark;
                context.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);

                context.fillStyle = light;
                context.beginPath();
                context.moveTo(x, y + BLOCK_SIZE - bs);
                context.lineTo(x, y);
                context.lineTo(x + BLOCK_SIZE - bs, y);
                context.lineTo(x + BLOCK_SIZE - bs, y + bs);
                context.lineTo(x + bs, y + bs);
                context.lineTo(x + bs, y + BLOCK_SIZE - bs);
                context.closePath();
                context.fill();
                
                context.fillStyle = baseColor;
                context.fillRect(x + bs, y + bs, BLOCK_SIZE - 2 * bs, BLOCK_SIZE - 2 * bs);
            }
        });
    });
}


/**
 * @brief Fixes the blocks of a landed piece onto the game board.
 * Updates the `gameBoard` array by marking the cells occupied by the piece with the piece's type.
 * @param {object} piece - The piece object to be fixed. Expected to have `shape` (2D array), `x` (column), `y` (row), and `type` (string) properties.
 * @returns None.
 */
function fixPieceOnBoard(piece) {
    piece.shape.forEach((row, yOffset) => {
        row.forEach((value, xOffset) => {
            if (value === 1) {
                const boardX = piece.x + xOffset;
                const boardY = piece.y + yOffset;
                if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
                    gameBoard[boardY][boardX] = piece.type;
                }
            }
        });
    });
}

/**
 * @brief Checks if a given position for a piece is valid on the game board.
 * A position is valid if the piece is within the board boundaries and does not collide with any fixed pieces.
 * @param {object} piece - The piece object to validate. Expected to have `shape` (2D array).
 * @param {number} newX - The target X-coordinate (column) for the piece's top-left corner.
 * @param {number} newY - The target Y-coordinate (row) for the piece's top-left corner.
 * @returns {boolean} `true` if the position is valid, `false` otherwise.
 */
function isPositionValid(piece, newX, newY) {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c] === 1) {
                let finalX = newX + c;
                let finalY = newY + r;

                if (finalX < 0 || finalX >= COLS || finalY >= ROWS) {
                    return false;
                }
                if (finalY >= 0 && gameBoard[finalY] && gameBoard[finalY][finalX] !== 0) {
                    return false;
                }
            }
        }
    }
    return true;
}


/**
 * @brief Checks if a specific row on the game board is full.
 * @param {number} rowIndex - The index of the row to check.
 * @returns {boolean} `true` if the row is full, `false` otherwise or if the row index is invalid.
 */
function isRowFull(rowIndex) {
    if (gameBoard[rowIndex]) {
        return gameBoard[rowIndex].every(cell => cell !== 0);
    }
    return false;
}


/**
 * @brief Checks for and clears any full lines on the game board.
 * When lines are cleared, an animation may be triggered, and the score is updated elsewhere.
 * @returns {object} An object containing:
 * - `count`: {number} The number of lines cleared in this turn.
 * - `indices`: {Array<number>} An array of the original row indices that were cleared.
 */
function checkAndClearLines() {
    let linesClearedThisTurn = 0;
    let clearedRowIndicesThisTurn = [];

    for (let r = ROWS - 1; r >= 0; r--) {
        if (isRowFull(r)) {
            clearedRowIndicesThisTurn.push(r); // Save the index BEFORE deleting
            gameBoard.splice(r, 1); // Delete the entire row
            gameBoard.unshift(Array(COLS).fill(0)); // Add new empty row at the top
            linesClearedThisTurn++;
            r++; // Re-evaluate the row that has just moved down to this position
        }
    }
    return { count: linesClearedThisTurn, indices: clearedRowIndicesThisTurn };
}


/**
 * @brief Calculates the Y-coordinate where the "ghost" or preview of the current piece would land if dropped straight down.
 * @param {object} piece - The current piece object, expected to have `x` (current column) and `shape` properties. `piece.y` is its current row.
 * @returns {number} The Y-coordinate of the ghost piece's landing position.
 */
function getGhostPieceY(piece) {
    let testY = piece.y;
    // Create a temporary object for validation, using piece.x and piece.shape
    const tempValidationPiece = {
        x: piece.x,
        shape: piece.shape
    };
    while (isPositionValid(tempValidationPiece, tempValidationPiece.x, testY + 1)) {
        testY++;
    }
    return testY;
}