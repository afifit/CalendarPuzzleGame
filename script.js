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
    let isDraggingPlacedPiece = false;
    
    // DOM elements
    const boardElement = document.getElementById('board');
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
        const piecesLeftElement = document.getElementById('pieces-left');
        const piecesRightElement = document.getElementById('pieces-right');
        
        piecesLeftElement.innerHTML = '';
        piecesRightElement.innerHTML = '';
        
        pieceShapes.forEach((shape, index) => {
            const pieceElement = document.createElement('div');
            pieceElement.classList.add('piece');
            pieceElement.dataset.pieceId = index;
            pieceElement.setAttribute('draggable', 'true');
            
            const rows = shape.length;
            const cols = Math.max(...shape.map(row => row.length));
            
            const pieceGrid = document.createElement('div');
            pieceGrid.classList.add('piece-grid');
            
            // Use a 4x4 grid for all pieces to ensure consistent space for rotations
            pieceGrid.style.gridTemplateColumns = `repeat(4, 60px)`;
            pieceGrid.style.gridTemplateRows = `repeat(4, 60px)`;
            
            // Center the piece in the 4x4 grid
            const offsetRow = Math.floor((4 - rows) / 2);
            const offsetCol = Math.floor((4 - cols) / 2);
            
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    const cell = document.createElement('div');
                    
                    const shapeRow = row - offsetRow;
                    const shapeCol = col - offsetCol;
                    
                    if (shapeRow >= 0 && shapeRow < rows && 
                        shapeCol >= 0 && shapeCol < cols && 
                        shape[shapeRow] && shape[shapeRow][shapeCol] === 1) {
                        cell.classList.add('piece-cell');
                    } else {
                        cell.classList.add('piece-cell', 'empty');
                    }
                    
                    pieceGrid.appendChild(cell);
                }
            }
            
            pieceElement.appendChild(pieceGrid);
            
            // Add first 4 pieces to left side, rest to right side
            if (index < 4) {
                piecesLeftElement.appendChild(pieceElement);
            } else {
                piecesRightElement.appendChild(pieceElement);
            }
        });
    }

    // Setup event listeners
    function setupEventListeners() {
        // Make pieces draggable
        document.querySelectorAll('.piece').forEach(piece => {
            if (piece.classList.contains('placed')) return;
            
            piece.setAttribute('draggable', 'true');
            
            piece.addEventListener('dragstart', (e) => {
                // Clear any previous selection
                document.querySelectorAll('.piece').forEach(p => p.classList.remove('selected'));
                
                // Mark this piece as selected
                piece.classList.add('selected');
                if (piece.dataset.rotatedShape) {
                    selectedPiece = {
                        element: piece,
                        id: parseInt(piece.dataset.pieceId),
                        shape: JSON.parse(piece.dataset.rotatedShape)
                    };
                } else {
                    selectedPiece = {
                        element: piece,
                        id: parseInt(piece.dataset.pieceId),
                        shape: JSON.parse(JSON.stringify(pieceShapes[parseInt(piece.dataset.pieceId)]))
                    };
                }
                
                // Create a custom drag image that only shows the colored cells
                const pieceGrid = piece.querySelector('.piece-grid');
                if (pieceGrid) {
                    // Create a clone of the grid for the drag image
                    const dragImage = pieceGrid.cloneNode(true);
                    dragImage.style.position = 'absolute';
                    dragImage.style.top = '-1000px';
                    document.body.appendChild(dragImage);
                
                    // Find the first non-empty cell to use as the drag handle point
                    const cells = Array.from(pieceGrid.querySelectorAll('.piece-cell:not(.empty)'));
                    let offsetX = 30;
                    let offsetY = 30;
                
                    if (cells.length > 0) {
                        const firstCell = cells[0];
                        const rect = firstCell.getBoundingClientRect();
                        const gridRect = pieceGrid.getBoundingClientRect();
                        offsetX = rect.left - gridRect.left + rect.width / 2;
                        offsetY = rect.top - gridRect.top + rect.height / 2;
                    }
                
                    e.dataTransfer.setDragImage(dragImage, offsetX, offsetY);
                
                    // Remove the clone after a short delay
                    setTimeout(() => {
                        document.body.removeChild(dragImage);
                    }, 100);
                }
                
                // Set data (required for Firefox)
                e.dataTransfer.setData('text/plain', piece.dataset.pieceId);
                e.dataTransfer.effectAllowed = 'move';
            });
            
            piece.addEventListener('click', () => {
                if (piece.classList.contains('placed')) return;
                
                document.querySelectorAll('.piece').forEach(p => p.classList.remove('selected'));
                piece.classList.add('selected');
                if (piece.dataset.rotatedShape) {
                    selectedPiece = {
                        element: piece,
                        id: parseInt(piece.dataset.pieceId),
                        shape: JSON.parse(piece.dataset.rotatedShape)
                    };
                } else {
                    selectedPiece = {
                        element: piece,
                        id: parseInt(piece.dataset.pieceId),
                        shape: JSON.parse(JSON.stringify(pieceShapes[parseInt(piece.dataset.pieceId)]))
                    };
                }
            });
        });
        
        // Make board cells drop targets and draggable
        boardElement.addEventListener('dragover', (e) => {
            e.preventDefault(); // Allow drop
            e.dataTransfer.dropEffect = 'move';
            
            // Visual feedback
            const cell = e.target.closest('.cell');
            if (cell) {
                cell.classList.add('drag-over');
            }
        });
        
        boardElement.addEventListener('dragleave', (e) => {
            const cell = e.target.closest('.cell');
            if (cell) {
                cell.classList.remove('drag-over');
            }
        });
        
        // Make placed pieces draggable (for removal)
        boardElement.addEventListener('mousedown', (e) => {
            const cell = e.target.closest('.cell.piece-part');
            if (!cell) return;
            
            const placedIndex = cell.dataset.placedIndex;
            if (placedIndex === undefined) return;
            
            // Highlight all cells of this piece
            document.querySelectorAll(`.cell[data-placed-index="${placedIndex}"]`).forEach(cell => {
                cell.classList.add('removing');
            });
            
            isDraggingPlacedPiece = true;
        });
        
        // Handle touch events for mobile
        boardElement.addEventListener('touchstart', (e) => {
            const cell = e.target.closest('.cell.piece-part');
            if (!cell) return;
            
            const placedIndex = cell.dataset.placedIndex;
            if (placedIndex === undefined) return;
            
            // Highlight all cells of this piece
            document.querySelectorAll(`.cell[data-placed-index="${placedIndex}"]`).forEach(cell => {
                cell.classList.add('removing');
            });
            
            isDraggingPlacedPiece = true;
        }, { passive: false });
        
        document.addEventListener('mouseup', (e) => {
            if (!isDraggingPlacedPiece) return;
            
            const removingCells = document.querySelectorAll('.cell.removing');
            if (removingCells.length === 0) return;
            
            const placedIndex = removingCells[0].dataset.placedIndex;
            
            // Check if mouse is outside the board (to remove the piece)
            const boardRect = boardElement.getBoundingClientRect();
            if (
                e.clientX < boardRect.left || 
                e.clientX > boardRect.right || 
                e.clientY < boardRect.top || 
                e.clientY > boardRect.bottom
            ) {
                removePieceFromBoard(placedIndex);
            }
            
            // Remove highlighting
            removingCells.forEach(cell => {
                cell.classList.remove('removing');
            });
            
            isDraggingPlacedPiece = false;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!isDraggingPlacedPiece) return;
            
            const removingCells = document.querySelectorAll('.cell.removing');
            if (removingCells.length === 0) return;
            
            const placedIndex = removingCells[0].dataset.placedIndex;
            
            // Get touch position
            const touch = e.changedTouches[0];
            const boardRect = boardElement.getBoundingClientRect();
            
            // Check if touch ended outside the board (to remove the piece)
            if (
                touch.clientX < boardRect.left || 
                touch.clientX > boardRect.right || 
                touch.clientY < boardRect.top || 
                touch.clientY > boardRect.bottom
            ) {
                removePieceFromBoard(placedIndex);
            }
            
            // Remove highlighting
            removingCells.forEach(cell => {
                cell.classList.remove('removing');
            });
            
            isDraggingPlacedPiece = false;
        }, { passive: false });
        
        boardElement.addEventListener('drop', (e) => {
            e.preventDefault();
            
            if (!selectedPiece) return;
            
            const cell = e.target.closest('.cell');
            if (!cell) return;
            
            // Remove any drag-over styling
            document.querySelectorAll('.cell').forEach(c => {
                c.classList.remove('drag-over');
            });
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            tryPlacePiece(row, col);
        });
        
        // Keep click placement as fallback
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
        
        // Find the first filled cell in the shape to use as the anchor point
        let anchorRow = 0;
        let anchorCol = 0;
        let foundAnchor = false;
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (shape[r] && shape[r][c] === 1) {
                    anchorRow = r;
                    anchorCol = c;
                    foundAnchor = true;
                    break;
                }
            }
            if (foundAnchor) break;
        }
        
        // Adjust the starting position based on the anchor point
        startRow = startRow - anchorRow;
        startCol = startCol - anchorCol;
        
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
        
        // Store piece data for potential removal later
        const placedPieceData = {
            id: selectedPiece.id,
            startRow,
            startCol,
            shape: JSON.parse(JSON.stringify(selectedPiece.shape)),
            cells: []
        };
        
        // Place the piece
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (!shape[row] || shape[row][col] !== 1) continue;
                
                const boardRow = startRow + row;
                const boardCol = startCol + col;
                
                boardState[boardRow][boardCol] = {
                    pieceId: selectedPiece.id,
                    placedIndex: placedPieces.length
                };
                
                // Update the visual board
                const cell = document.querySelector(`.cell[data-row="${boardRow}"][data-col="${boardCol}"]`);
                cell.style.backgroundColor = '#4CAF50';
                cell.style.color = 'white';
                cell.classList.add('piece-part');
                cell.dataset.pieceId = selectedPiece.id;
                cell.dataset.placedIndex = placedPieces.length;
                
                // Store cell position for removal
                placedPieceData.cells.push({row: boardRow, col: boardCol});
            }
        }
        
        // Mark the piece as placed
        selectedPiece.element.classList.add('placed');
        selectedPiece.element.classList.remove('selected');
        selectedPiece.element.style.opacity = '0.5';
        
        // Add to placed pieces
        placedPieces.push(placedPieceData);
        
        // Reset selected piece
        selectedPiece = null;
        
        return true;
    }
    
// Remove a piece from the board
function removePieceFromBoard(placedIndex) {
    const pieceData = placedPieces[placedIndex];
    if (!pieceData) return;

    // Clear board state
    pieceData.cells.forEach(({row, col}) => {
        boardState[row][col] = null;

        // Update visual board
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.style.backgroundColor = '';
        cell.style.color = '';
        cell.classList.remove('piece-part');
        delete cell.dataset.pieceId;
        delete cell.dataset.placedIndex;
    });

    // Find the original piece element and restore it
    const pieceElement = document.querySelector(`.piece[data-piece-id="${pieceData.id}"]`);
    if (pieceElement) {
        pieceElement.classList.remove('placed');
        pieceElement.style.opacity = '1';

        // Store the rotated shape on the piece element
        pieceElement.dataset.rotatedShape = JSON.stringify(pieceData.shape);

        // Update the visual representation to match the rotated shape
        const shape = pieceData.shape;
        const rows = shape.length;
        const cols = Math.max(...shape.map(row => row.length));

        const pieceGrid = pieceElement.querySelector('.piece-grid');
        if (pieceGrid) {
            pieceGrid.innerHTML = '';
            pieceGrid.style.gridTemplateColumns = `repeat(${cols}, 60px)`;
            pieceGrid.style.gridTemplateRows = `repeat(${rows}, 60px)`;

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
    }

    // Remove from placed pieces array
    placedPieces[placedIndex] = null;
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
        
        // Store the rotated shape on the piece element
        if (selectedPiece && selectedPiece.element) {
            selectedPiece.element.dataset.rotatedShape = JSON.stringify(rotated);
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
        
        // Use a 4x4 grid for all pieces to ensure consistent space for rotations
        pieceGrid.style.gridTemplateColumns = `repeat(4, 60px)`;
        pieceGrid.style.gridTemplateRows = `repeat(4, 60px)`;
        
        // Center the piece in the 4x4 grid
        const offsetRow = Math.floor((4 - rows) / 2);
        const offsetCol = Math.floor((4 - cols) / 2);
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const cell = document.createElement('div');
                
                const shapeRow = row - offsetRow;
                const shapeCol = col - offsetCol;
                
                if (shapeRow >= 0 && shapeRow < rows && 
                    shapeCol >= 0 && shapeCol < cols && 
                    shape[shapeRow] && shape[shapeRow][shapeCol] === 1) {
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
        isDraggingPlacedPiece = false;
        
        // Reset the board visuals
        document.querySelectorAll('.cell').forEach(cell => {
            cell.style.backgroundColor = '';
            cell.style.color = '';
            cell.classList.remove('piece-part', 'removing');
            delete cell.dataset.pieceId;
            delete cell.dataset.placedIndex;
            
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
