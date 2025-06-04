/**
 * @brief Represents a Tetris piece (tetromino).
 * Handles its shape, position, movement, rotation, and drawing.
 * @class Piece
 */
class Piece {
    /**
     * @brief Constructs a new Piece object.
     * @param {string} typeKey - The key representing the type of the piece,`.
     */
    constructor(typeKey) {
        this.type = typeKey;
        const pieceData = PIECE_TYPES[this.type];
        if (!pieceData) {
            console.error(`Definition of piece not found for type: ${typeKey}`);
            this.shape = [[1]]; 
        } else {
            this.shape = pieceData.shape.map(row => [...row]);
        }
        
        this.x = Math.floor((COLS - (this.shape[0] ? this.shape[0].length : 1)) / 2);
        this.y = 0;
    }

    /**
     * @brief Draws the piece on the main game canvas with a 3D bevel effect. The colors are determined by the current theme.
     * @param {CanvasRenderingContext2D} context - The 2D rendering context of the main game canvas.
     * @returns None.
     */
    draw(context) {
        const themePieceColors = THEMES[currentThemeName].pieceColors;
        const baseColor = themePieceColors[this.type];

        if (!baseColor) {
            console.error(`Colour not defined for the standard piece ${this.type} on the theme ${currentThemeName}`);
            context.fillStyle = '#888888'; 
            this.shape.forEach((row, r) => {
                row.forEach((value, c) => {
                    if (value === 1) {
                        const x = (this.x + c) * BLOCK_SIZE;
                        const y = (this.y + r) * BLOCK_SIZE;
                        if (this.y + r >= 0) {
                            context.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE); 
                        }
                    }
                });
            });
            return;
        }
        
        const light = lightenColor(baseColor, HIGHLIGHT_PERCENT);
        const dark = darkenColor(baseColor, SHADOW_PERCENT);
        const bs = BEVEL_SIZE;

        this.shape.forEach((row, r) => {
            row.forEach((value, c) => {
                if (value === 1) {
                    const x = (this.x + c) * BLOCK_SIZE;
                    const y = (this.y + r) * BLOCK_SIZE;

                    if (this.y + r >= 0) {
                        // Dark part (block background for the bevel)
                        context.fillStyle = dark;
                        context.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
                        
                        // Light part (top and left edges)
                        context.fillStyle = light;
                        context.beginPath();
                        context.moveTo(x, y + BLOCK_SIZE - bs); 
                        context.lineTo(x, y);                   
                        context.lineTo(x + BLOCK_SIZE - bs, y);

                        // Triangles for smoother bevel corners
                        context.lineTo(x + BLOCK_SIZE - bs, y + bs);
                        context.lineTo(x + bs, y + bs);
                        context.lineTo(x + bs, y + BLOCK_SIZE - bs);
                        context.closePath();
                        context.fill();
                        
                        // Main color in the center
                        context.fillStyle = baseColor;
                        context.fillRect(x + bs, y + bs, BLOCK_SIZE - 2 * bs, BLOCK_SIZE - 2 * bs);
                    }
                }
            });
        });
    }

    /**
     * @brief Draws the "ghost" or drop preview of the piece.
     * This shows a semi-transparent silhouette where the piece would land if dropped.
     * @param {CanvasRenderingContext2D} context - The 2D rendering context of the main game canvas.
     * @param {number} ghostY - The calculated Y-coordinate (row) where the top of the ghost piece should be drawn.
     * @param {string} themeName - The key/name of the current theme, used to fetch the ghost piece color.
     * @returns None.
     */
    drawGhost(context, ghostY, themeName) {
        const theme = THEMES[themeName];
        if (!theme || !theme.ghostFillColor) {
            context.fillStyle = 'rgba(200, 200, 200, 0.2)'; 
        } else {
            context.fillStyle = theme.ghostFillColor;
        }

        this.shape.forEach((row, r) => {
            row.forEach((value, c) => {
                if (value === 1) {
                    const x_pos = (this.x + c) * BLOCK_SIZE;
                    const y_pos = (ghostY + r) * BLOCK_SIZE;

                    if (ghostY + r >= 0) { 
                        context.fillRect(x_pos, y_pos, BLOCK_SIZE, BLOCK_SIZE);
                    }
                }
            });
        });
    }
    
    /**
     * @brief Attempts to move the piece one step down.
     * @returns {boolean} `true` if the piece has landed or cannot move down, `false` otherwise.
     */
    moveDown() {
        if (isPositionValid(this, this.x, this.y + 1)) {
            this.y++;
            return false;
        } else {
            return true;
        }
    }

    /**
     * @brief Attempts to move the piece one step to the left.
     * @arguments None.
     * @returns None.
     */
    moveLeft() {
        if (isPositionValid(this, this.x - 1, this.y)) {
            this.x--;
        }
    }

    /**
     * @brief Attempts to move the piece one step to the right.
     * @arguments None.
     * @returns None.
     */
    moveRight() {
        if (isPositionValid(this, this.x + 1, this.y)) {
            this.x++;
        }
    }

    /**
     * @brief Attempts to rotate the piece 90 degrees clockwise.
     * Implements a basic wall kick system by trying offsets if the initial rotation collides.
     * @arguments None.
     * @returns None.
     */
    rotate() {
        // The ‘O’ (square) piece does not need to be visually rotated.
        if (this.type === 'O') {
            return;
        }

        const originalShape = this.shape.map(row => [...row]); // Deep copying of the current form
        const numRowsOriginal = originalShape.length;
        const numColsOriginal = originalShape[0].length;

        // The new form will have the dimensions swapped
        const newRotatedShape = [];
        for (let i = 0; i < numColsOriginal; i++) {
            newRotatedShape[i] = Array(numRowsOriginal).fill(0);
        }

        // 90 degrees clockwise rotation algorithm
        for (let r = 0; r < numRowsOriginal; r++) {
            for (let c = 0; c < numColsOriginal; c++) {
                if (originalShape[r][c]) { // Only transpose blocks with value 1
                    newRotatedShape[c][numRowsOriginal - 1 - r] = originalShape[r][c];
                }
            }
        }
        
        // Save current form before attempting rotation
        const previousShape = this.shape;
        this.shape = newRotatedShape;

        // Attempt to validate the rotation at the current position and with basic wall kicks.
        const kickOffsets = [
            { dx: 0, dy: 0 },   
            { dx: -1, dy: 0 },  
            { dx: 1, dy: 0 },   
            { dx: -2, dy: 0 },  
            { dx: 2, dy: 0 },   
        ];

        let rotationApplied = false;
        for (const offset of kickOffsets) {
            if (isPositionValid(this, this.x + offset.dx, this.y + offset.dy)) {
                this.x += offset.dx;
                this.y += offset.dy; 
                rotationApplied = true;
                break;
            }
        }

        if (!rotationApplied) {
            this.shape = previousShape; // Revert to original form if rotation failed
        }
    }
}