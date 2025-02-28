const boardData = [
  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'X'],
  ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'X'],
  ['1', '2', '3', '4', '5', '6', '7'],
  ['8', '9', '10', '11', '12', '13', '14'],
  ['15', '16', '17', '18', '19', '20', '21'],
  ['22', '23', '24', '25', '26', '27', '28'],
  ['29', '30', '31', 'X', 'X', 'X', 'X']
];

const pieces = [
  [[1], [1], [1,1]],
  [[1], [1], [1], [1]],
  [[1,1,1]],
  [[1,0,1], [1,1,1]],
  [[1,1,1], [0,0,1]],
  [[1], [1,1], [0,1]],
  [[1,1], [1,1]],
  [[1,1], [1], [1]]
];

class Game {
  constructor() {
    this.board = document.getElementById('board');
    this.piecesContainer = document.getElementById('pieces-container');
    this.draggingPiece = null;
    this.offsetX = 0;
    this.offsetY = 0;
    this.initBoard();
    this.createPieces();
    this.setupDragAndDrop();
  }

  initBoard() {
    this.board.style.gridTemplateColumns = `repeat(${boardData[0].length}, 40px)`;
    boardData.forEach(row => {
      row.forEach(cell => {
        const div = document.createElement('div');
        div.className = 'cell board-cell';
        div.textContent = cell;
        this.board.appendChild(div);
      });
    });
  }

  createPieces() {
    pieces.forEach((piece, index) => {
      const pieceDiv = document.createElement('div');
      pieceDiv.className = 'piece';
      pieceDiv.dataset.index = index;
      pieceDiv.style.gridTemplateColumns = `repeat(${piece[0].length}, 40px)`;
      
      piece.forEach(row => {
        row.forEach(cell => {
          if (cell) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell piece-cell';
            pieceDiv.appendChild(cellDiv);
          }
        });
      });
      
      this.piecesContainer.appendChild(pieceDiv);
    });
  }

  setupDragAndDrop() {
    const pieces = document.querySelectorAll('.piece');
    pieces.forEach(piece => {
      piece.addEventListener('mousedown', this.startDrag.bind(this));
      piece.addEventListener('touchstart', this.startDrag.bind(this), { passive: false });
    });

    document.addEventListener('mousemove', this.drag.bind(this));
    document.addEventListener('touchmove', this.drag.bind(this), { passive: false });
    document.addEventListener('mouseup', this.endDrag.bind(this));
    document.addEventListener('touchend', this.endDrag.bind(this));
  }

  startDrag(e) {
    this.draggingPiece = e.currentTarget;
    this.draggingPiece.classList.add('dragging');
    
    const rect = this.draggingPiece.getBoundingClientRect();
    if (e.type === 'touchstart') {
      this.offsetX = e.touches[0].clientX - rect.left;
      this.offsetY = e.touches[0].clientY - rect.top;
    } else {
      this.offsetX = e.clientX - rect.left;
      this.offsetY = e.clientY - rect.top;
    }
  }

  drag(e) {
    if (!this.draggingPiece) return;
    
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    this.draggingPiece.style.left = `${clientX - this.offsetX}px`;
    this.draggingPiece.style.top = `${clientY - this.offsetY}px`;
  }

  endDrag() {
    if (!this.draggingPiece) return;
    
    this.draggingPiece.classList.remove('dragging');
    this.draggingPiece = null;
  }

  rotatePiece(piece) {
    piece.classList.add('rotating');
    
    setTimeout(() => {
      const index = piece.dataset.index;
      const matrix = pieces[index];
      
      // Rotate matrix 90 degrees clockwise
      const newMatrix = matrix[0].map((_, i) => 
        matrix.map(row => row[row.length - 1 - i])
      );
      
      // Update the pieces array
      pieces[index] = newMatrix;
      
      // Clear and recreate piece
      piece.innerHTML = '';
      piece.style.gridTemplateColumns = `repeat(${newMatrix[0].length}, 40px)`;
      piece.style.gridTemplateRows = `repeat(${newMatrix.length}, 40px)`;
      
      newMatrix.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell piece-cell';
            cellDiv.style.gridColumn = x + 1;
            cellDiv.style.gridRow = y + 1;
            piece.appendChild(cellDiv);
          }
        });
      });
      
      piece.classList.remove('rotating');
    }, 200);
  }
}

new Game();

// Add rotation on double click
document.addEventListener('dblclick', (e) => {
  if (e.target.classList.contains('piece')) {
    const game = new Game(); // This should be a reference to the existing game instance
    game.rotatePiece(e.target);
  }
});
