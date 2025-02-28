Make a webgame that will have pieces to drag onto a puzzle board.

The board is:

 Jan | Feb | Mar | Apr | May | Jun | X 

 Jul | Aug | Sep | Oct | Nov | Dec | X 

  1  |  2  |  3  |  4  |  5  |  6  |  7 

  8  |  9  |  10 |  11 |  12 |  13 |  14

  15 |  16 |  17 |  18 |  19 |  20 |  21

  22 |  23 |  24 |  25 |  26 |  27 |  28

  29 |  30 |  31 |  X  |  X  |  X  |  X

  The pieces teteris like in these shapes:
[
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

Dont allow pieces to be on top of each other.

Board cells and pieces cells should be the same size.

Allow to all rotations of the pieces by any amount of 90 degree.