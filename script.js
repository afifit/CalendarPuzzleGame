document.addEventListener('DOMContentLoaded', () => {
    // Board configuration
    const boardConfig = [
        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'X'],
        ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'X'],
        ['1', '2', '3', '4', '5', '6', '7'],
        ['8', '9', '10', '11', '12', '13', '14'],
        ['15', '16', '17', '18', '19', '20', '21'],
        ['22', '23', '24', '25', '26', '27', '28'],
        ['29', '30', '31', 'X', 'X', 'X', 'X']
    ];

    // Piece shapes
    const pieceShapes = [
        // X
        // X
        // X|X
        // X
        [
            [1, 0],
            [1, 0],
            [1, 1],
            [1, 0]
        ],
        
        // X
        // X
        // X
        // X|X
        [
            [1, 0],
            [1, 0],
            [1, 0],
            [1, 1]
        ],
        
        // X|X|X
        // X| |X
        [
            [1, 1, 1],
            [1, 0, 1]
        ],
        
        // X
        // X|X|X
        //   | |X
        [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 1]
        ],
        
        // X
        // X
        // X|X
        //   |X
        [
            [1, 0],
            [1, 0],
            [1, 1],
            [0, 1]
        ],
        
        // X|X
        // X|X
        // X|X
        [
            [1, 1],
            [1, 1],
            [1, 1]
        ],
        
        // X
        // X
        // X|X|X
        [
            [1, 0, 0],
            [1, 0, 0],
            [1, 1, 1]
        ],
        
        // X
        // X|X
        // X|X
        // X|X
        [
            [1, 0],
            [1, 1],
            [1, 1],
            [1, 1]
        ]
    ];

    // Game state
    let boardState = Array(7).fill().map(() => Array(7).fill(null));
    let selectedPiece = null;
    let placedPieces = [];
    
    // DOM elements
    const boardElement = document.getElementById('board');
    const piecesElement = document.getElementById('pieces');
    const rotateButton = document.getElementById('rotate-btn');
    const resetButton = document.getElementById('reset-btn');

    // Initialize the game
    function initGame() {
        createBoard();
        createPieces();
        setupEventListeners();
    }

    // Create the board
    function createBoard() {
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 7; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                const cellValue = boardConfig[row][col];
                cell.textContent = cellValue;
                
                if (cellValue === 'X') {
                    cell.classList.add('disabled');
                    boardState[row][col] = 'disabled';
                }
                
                boardElement.appendChild(cell);
            }
        }
    }

    // Create the pieces
    function createPieces() {
        piecesElement.innerHTML = '';
        
        pieceShapes.forEach((shape, index) => {
            const pieceElement = document.createElement('div');
            pieceElement.classList.add('piece');
            pieceElement.dataset.pieceId = index;
            
            const rows = shape.length;
            const cols = Math.max(...shape.map(row => row.length));
            
            const pieceGrid = document.createElement('div');
            pieceGrid.classList.add('piece-grid');
            pieceGrid.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
            pieceGrid.style.gridTemplateRows = `repeat(${rows}, 30px)`;
            
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const cell = document.createElement('div');
                    
                    if (shape[row] && shape[row][col] === 1) {
                        cell.classList.add('piece-cell');
                    } else {
                        cell.classList.add('piece-cell', 'empty');
                    }
                    
                    pieceGrid.appendChild(cell);
                }
            }
            
            pieceElement.appendChild(pieceGrid);
            piecesElement.appendChild(pieceElement);
        });
    }

    // Setup event listeners
    function setupEventListeners() {
        // Piece selection
        document.querySelectorAll('.piece').forEach(piece => {
            piece.addEventListener('click', () => {
                if (piece.classList.contains('placed')) return;
                
                document.querySelectorAll('.piece').forEach(p => p.classList.remove('selected'));
                piece.classList.add('selected');
                selectedPiece = {
                    element: piece,
                    id: parseInt(piece.dataset.pieceId),
                    shape: JSON.parse(JSON.stringify(pieceShapes[parseInt(piece.dataset.pieceId)]))
                };
            });
        });
        
        // Board cell click for placement
        boardElement.addEventListener('click', (e) => {
            const cell = e.target.closest('.cell');
            if (!cell || !selectedPiece) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            tryPlacePiece(row, col);
        });
        
        // Rotate button
        rotateButton.addEventListener('click', () => {
            if (!selectedPiece) return;
            
            const shape = selectedPiece.shape;
            const rotatedShape = rotateShape(shape);
            selectedPiece.shape = rotatedShape;
            
            // Update the visual representation
            updatePieceVisual(selectedPiece);
        });
        
        // Reset button
        resetButton.addEventListener('click', resetGame);
    }

    // Try to place a piece on the board
    function tryPlacePiece(startRow, startCol) {
        if (!selectedPiece) return;
        
        const shape = selectedPiece.shape;
        const rows = shape.length;
        const cols = Math.max(...shape.map(row => row.length));
        
        // Check if the piece fits on the board
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (!shape[row] || shape[row][col] !== 1) continue;
                
                const boardRow = startRow + row;
                const boardCol = startCol + col;
                
                // Check if out of bounds
                if (boardRow < 0 || boardRow >= 7 || boardCol < 0 || boardCol >= 7) {
                    return false;
                }
                
                // Check if cell is already occupied or disabled
                if (boardState[boardRow][boardCol]) {
                    return false;
                }
            }
        }
        
        // Place the piece
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (!shape[row] || shape[row][col] !== 1) continue;
                
                const boardRow = startRow + row;
                const boardCol = startCol + col;
                
                boardState[boardRow][boardCol] = selectedPiece.id;
                
                // Update the visual board
                const cell = document.querySelector(`.cell[data-row="${boardRow}"][data-col="${boardCol}"]`);
                cell.style.backgroundColor = '#4CAF50';
                cell.style.color = 'white';
            }
        }
        
        // Mark the piece as placed
        selectedPiece.element.classList.add('placed');
        selectedPiece.element.classList.remove('selected');
        selectedPiece.element.style.opacity = '0.5';
        
        // Add to placed pieces
        placedPieces.push({
            id: selectedPiece.id,
            startRow,
            startCol,
            shape: JSON.parse(JSON.stringify(selectedPiece.shape))
        });
        
        // Reset selected piece
        selectedPiece = null;
        
        return true;
    }

    // Rotate a shape 90 degrees clockwise
    function rotateShape(shape) {
        const rows = shape.length;
        const cols = Math.max(...shape.map(row => row.length));
        
        // Create a new matrix with swapped dimensions
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < (shape[row] ? shape[row].length : 0); col++) {
                if (shape[row][col]) {
                    rotated[col][rows - 1 - row] = shape[row][col];
                }
            }
        }
        
        return rotated;
    }

    // Update the visual representation of a piece
    function updatePieceVisual(piece) {
        const shape = piece.shape;
        const rows = shape.length;
        const cols = Math.max(...shape.map(row => row.length));
        
        const pieceGrid = piece.element.querySelector('.piece-grid');
        pieceGrid.innerHTML = '';
        pieceGrid.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
        pieceGrid.style.gridTemplateRows = `repeat(${rows}, 30px)`;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement('div');
                
                if (shape[row] && shape[row][col] === 1) {
                    cell.classList.add('piece-cell');
                } else {
                    cell.classList.add('piece-cell', 'empty');
                }
                
                pieceGrid.appendChild(cell);
            }
        }
    }

    // Reset the game
    function resetGame() {
        boardState = Array(7).fill().map(() => Array(7).fill(null));
        
        // Reset disabled cells
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 7; col++) {
                if (boardConfig[row][col] === 'X') {
                    boardState[row][col] = 'disabled';
                }
            }
        }
        
        selectedPiece = null;
        placedPieces = [];
        
        // Reset the board visuals
        document.querySelectorAll('.cell').forEach(cell => {
            cell.style.backgroundColor = '';
            cell.style.color = '';
            
            if (cell.classList.contains('disabled')) {
                cell.style.backgroundColor = '#ddd';
                cell.style.color = '#999';
            }
        });
        
        // Reset the pieces
        document.querySelectorAll('.piece').forEach(piece => {
            piece.classList.remove('selected', 'placed');
            piece.style.opacity = '1';
        });
    }

    // Initialize the game
    initGame();
});
