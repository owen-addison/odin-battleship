/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/actionController.js":
/*!*********************************!*\
  !*** ./src/actionController.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const placeShipPrompt = "Place your ships on the board using the console.";
const ActionController = (uiManager, game) => {
  const promptShipPlacement = () => {
    // Create a prompt object with the prompt and prompt type
    const promptObj = {
      prompt: placeShipPrompt,
      promptType: "instruction"
    };

    // Call the displayPrompt method on the UiManager
    uiManager.displayPrompt({
      promptObj
    });
  };
  return {
    promptShipPlacement
  };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ActionController);

/***/ }),

/***/ "./src/errors.js":
/*!***********************!*\
  !*** ./src/errors.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   InvalidMoveEntryError: () => (/* binding */ InvalidMoveEntryError),
/* harmony export */   InvalidPlayerTypeError: () => (/* binding */ InvalidPlayerTypeError),
/* harmony export */   InvalidShipLengthError: () => (/* binding */ InvalidShipLengthError),
/* harmony export */   InvalidShipTypeError: () => (/* binding */ InvalidShipTypeError),
/* harmony export */   OverlappingShipsError: () => (/* binding */ OverlappingShipsError),
/* harmony export */   RepeatAttackedError: () => (/* binding */ RepeatAttackedError),
/* harmony export */   ShipAllocationReachedError: () => (/* binding */ ShipAllocationReachedError),
/* harmony export */   ShipPlacementBoundaryError: () => (/* binding */ ShipPlacementBoundaryError),
/* harmony export */   ShipTypeAllocationReachedError: () => (/* binding */ ShipTypeAllocationReachedError)
/* harmony export */ });
/* eslint-disable max-classes-per-file */

class OverlappingShipsError extends Error {
  constructor(message = "Ships are overlapping.") {
    super(message);
    this.name = "OverlappingShipsError";
  }
}
class ShipAllocationReachedError extends Error {
  constructor(message = "Ship allocation limit reached.") {
    super(message);
    this.name = "ShipAllocationReachedError";
  }
}
class ShipTypeAllocationReachedError extends Error {
  constructor(message = "Ship type allocation limit reached.") {
    super(message);
    this.name = "ShipTypeAllocationReachedError";
  }
}
class InvalidShipLengthError extends Error {
  constructor(message = "Invalid ship length.") {
    super(message);
    this.name = "InvalidShipLengthError";
  }
}
class InvalidShipTypeError extends Error {
  constructor(message = "Invalid ship type.") {
    super(message);
    this.name = "InvalidShipTypeError";
  }
}
class InvalidPlayerTypeError extends Error {
  constructor(message = "Invalid player type. Valid player types: 'human' & 'computer'") {
    super(message);
    this.name = "InvalidShipTypeError";
  }
}
class ShipPlacementBoundaryError extends Error {
  constructor(message = "Invalid ship placement. Boundary error!") {
    super(message);
    this.name = "ShipPlacementBoundaryError";
  }
}
class RepeatAttackedError extends Error {
  constructor(message = "Invalid attack entry. Position already attacked!") {
    super(message);
    this.name = "RepeatAttackError";
  }
}
class InvalidMoveEntryError extends Error {
  constructor(message = "Invalid move entry!") {
    super(message);
    this.name = "InvalidMoveEntryError";
  }
}


/***/ }),

/***/ "./src/game.js":
/*!*********************!*\
  !*** ./src/game.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./player */ "./src/player.js");
/* harmony import */ var _gameboard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./gameboard */ "./src/gameboard.js");
/* harmony import */ var _ship__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ship */ "./src/ship.js");
/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./errors */ "./src/errors.js");




const Game = () => {
  // Initialise, create gameboards for both players and create players of types human and computer
  const humanGameboard = (0,_gameboard__WEBPACK_IMPORTED_MODULE_1__["default"])(_ship__WEBPACK_IMPORTED_MODULE_2__["default"]);
  const computerGameboard = (0,_gameboard__WEBPACK_IMPORTED_MODULE_1__["default"])(_ship__WEBPACK_IMPORTED_MODULE_2__["default"]);
  const humanPlayer = (0,_player__WEBPACK_IMPORTED_MODULE_0__["default"])(humanGameboard, "human");
  const computerPlayer = (0,_player__WEBPACK_IMPORTED_MODULE_0__["default"])(computerGameboard, "computer");
  let currentPlayer;
  let gameOverState = false;

  // Store players in a player object
  const players = {
    human: humanPlayer,
    computer: computerPlayer
  };

  // Set up phase
  const setUp = humanShips => {
    // Automatic placement for computer
    computerPlayer.placeShips();

    // Place ships from the human player's selection on their respective gameboard
    humanShips.forEach(ship => {
      humanPlayer.placeShips(ship.shipType, ship.start, ship.direction);
    });

    // Set the current player to human player
    currentPlayer = humanPlayer;
  };

  // Game ending function
  const endGame = () => {
    gameOverState = true;
  };

  // Take turn method
  const takeTurn = move => {
    let feedback;

    // Determine the opponent based on the current player
    const opponent = currentPlayer === humanPlayer ? computerPlayer : humanPlayer;

    // Call the makeMove method on the current player with the opponent's gameboard and store as move feedback
    const result = currentPlayer.makeMove(opponent.gameboard, move);

    // If result is a hit, check whether the ship is sunk
    if (result.hit) {
      // Check whether the ship is sunk and add result as value to feedback object with key "isShipSunk"
      if (opponent.gameboard.isShipSunk(result.shipType)) {
        feedback = {
          ...result,
          isShipSunk: true,
          gameWon: opponent.gameboard.checkAllShipsSunk()
        };
      } else {
        feedback = {
          ...result,
          isShipSunk: false
        };
      }
    } else if (!result.hit) {
      // Set feedback to just the result
      feedback = result;
    }

    // If game is won, end game
    if (feedback.gameWon) {
      endGame();
    }

    // Switch the current player
    currentPlayer = opponent;

    // Return the feedback for the move
    return feedback;
  };
  return {
    get currentPlayer() {
      return currentPlayer;
    },
    get gameOverState() {
      return gameOverState;
    },
    players,
    setUp,
    takeTurn
  };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Game);

/***/ }),

/***/ "./src/gameboard.js":
/*!**************************!*\
  !*** ./src/gameboard.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./errors */ "./src/errors.js");

const grid = [["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10"], ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10"], ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10"], ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"], ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10"], ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10"], ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10"], ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10"], ["I1", "I2", "I3", "I4", "I5", "I6", "I7", "I8", "I9", "I10"], ["J1", "J2", "J3", "J4", "J5", "J6", "J7", "J8", "J9", "J10"]];
const indexCalcs = start => {
  const colLetter = start[0].toUpperCase(); // This is the column
  const rowNumber = parseInt(start.slice(1), 10); // This is the row

  const colIndex = colLetter.charCodeAt(0) - "A".charCodeAt(0); // Column index based on letter
  const rowIndex = rowNumber - 1; // Row index based on number

  return [colIndex, rowIndex]; // Return [row, column]
};
const checkType = (ship, shipPositions) => {
  // Iterate through the shipPositions object
  Object.keys(shipPositions).forEach(existingShipType => {
    if (existingShipType === ship) {
      throw new _errors__WEBPACK_IMPORTED_MODULE_0__.ShipTypeAllocationReachedError();
    }
  });
};
const checkBoundaries = (shipLength, coords, direction) => {
  // Set row and col limits
  const xLimit = grid.length; // This is the total number of columns (x)
  const yLimit = grid[0].length; // This is the total number of rows (y)

  const x = coords[0];
  const y = coords[1];

  // Check for valid start position on board
  if (x < 0 || x >= xLimit || y < 0 || y >= yLimit) {
    return false;
  }

  // Check right boundary for horizontal placement
  if (direction === "h" && x + shipLength > xLimit) {
    return false;
  }
  // Check bottom boundary for vertical placement
  if (direction === "v" && y + shipLength > yLimit) {
    return false;
  }

  // If none of the invalid conditions are met, return true
  return true;
};
const calculateShipPositions = (shipLength, coords, direction) => {
  const colIndex = coords[0]; // This is the column index
  const rowIndex = coords[1]; // This is the row index

  const positions = [];
  if (direction.toLowerCase() === "h") {
    // Horizontal placement: increment the column index
    for (let i = 0; i < shipLength; i++) {
      positions.push(grid[colIndex + i][rowIndex]);
    }
  } else {
    // Vertical placement: increment the row index
    for (let i = 0; i < shipLength; i++) {
      positions.push(grid[colIndex][rowIndex + i]);
    }
  }
  return positions;
};
const checkForOverlap = (positions, shipPositions) => {
  Object.entries(shipPositions).forEach(([shipType, existingShipPositions]) => {
    if (positions.some(position => existingShipPositions.includes(position))) {
      throw new _errors__WEBPACK_IMPORTED_MODULE_0__.OverlappingShipsError(`Overlap detected with ship type ${shipType}`);
    }
  });
};
const checkForHit = (position, shipPositions) => {
  const foundShip = Object.entries(shipPositions).find(([_, existingShipPositions]) => existingShipPositions.includes(position));
  return foundShip ? {
    hit: true,
    shipType: foundShip[0]
  } : {
    hit: false
  };
};
const Gameboard = shipFactory => {
  const ships = {};
  const shipPositions = {};
  const hitPositions = {};
  const attackLog = [[], []];
  const placeShip = (type, start, direction) => {
    const newShip = shipFactory(type);

    // Check the ship type against existing types
    checkType(type, shipPositions);

    // Calculate start point coordinates based on start point grid key
    const coords = indexCalcs(start);

    // Check boundaries, if ok continue to next step
    if (checkBoundaries(newShip.shipLength, coords, direction)) {
      // Calculate and store positions for a new ship
      const positions = calculateShipPositions(newShip.shipLength, coords, direction);

      // Check for overlap before placing the ship
      checkForOverlap(positions, shipPositions);

      // If no overlap, proceed to place ship
      shipPositions[type] = positions;
      // Add ship to ships object
      ships[type] = newShip;

      // Initialise hitPositions for this ship type as an empty array
      hitPositions[type] = [];
    } else {
      throw new _errors__WEBPACK_IMPORTED_MODULE_0__.ShipPlacementBoundaryError(`Invalid ship placement. Boundary error! Ship type: ${type}`);
    }
  };

  // Register an attack and test for valid hit
  const attack = position => {
    let response;

    // Check for valid attack
    if (attackLog[0].includes(position) || attackLog[1].includes(position)) {
      // console.log(`Repeat attack: ${position}`);
      throw new _errors__WEBPACK_IMPORTED_MODULE_0__.RepeatAttackedError();
    }

    // Check for valid hit
    const checkResults = checkForHit(position, shipPositions);
    if (checkResults.hit) {
      // Register valid hit
      hitPositions[checkResults.shipType].push(position);
      ships[checkResults.shipType].hit();

      // Log the attack as a valid hit
      attackLog[0].push(position);
      response = {
        ...checkResults
      };
    } else {
      // console.log(`MISS!: ${position}`);
      // Log the attack as a miss
      attackLog[1].push(position);
      response = {
        ...checkResults
      };
    }
    return response;
  };
  const isShipSunk = type => ships[type].isSunk;
  const checkAllShipsSunk = () => Object.entries(ships).every(([shipType, ship]) => ship.isSunk);

  // Function for reporting the number of ships left afloat
  const shipReport = () => {
    const floatingShips = Object.entries(ships).filter(([shipType, ship]) => !ship.isSunk).map(([shipType, _]) => shipType);
    return [floatingShips.length, floatingShips];
  };
  return {
    get grid() {
      return grid;
    },
    get ships() {
      return ships;
    },
    get attackLog() {
      return attackLog;
    },
    getShip: shipType => ships[shipType],
    getShipPositions: shipType => shipPositions[shipType],
    getHitPositions: shipType => hitPositions[shipType],
    placeShip,
    attack,
    isShipSunk,
    checkAllShipsSunk,
    shipReport
  };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Gameboard);

/***/ }),

/***/ "./src/player.js":
/*!***********************!*\
  !*** ./src/player.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./errors */ "./src/errors.js");

const checkMove = (move, gbGrid) => {
  let valid = false;
  gbGrid.forEach(el => {
    if (el.find(p => p === move)) {
      valid = true;
    }
  });
  return valid;
};
const randMove = (grid, moveLog) => {
  // Flatten the grid into a single array of moves
  const allMoves = grid.flatMap(row => row);

  // Filter out the moves that are already in the moveLog
  const possibleMoves = allMoves.filter(move => !moveLog.includes(move));

  // Select a random move from the possible moves
  const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  return randomMove;
};
const generateRandomStart = (size, direction, grid) => {
  const validStarts = [];
  if (direction === "h") {
    // For horizontal orientation, limit the columns
    for (let col = 0; col < grid.length - size + 1; col++) {
      for (let row = 0; row < grid[col].length; row++) {
        validStarts.push(grid[col][row]);
      }
    }
  } else {
    // For vertical orientation, limit the rows
    for (let row = 0; row < grid[0].length - size + 1; row++) {
      for (let col = 0; col < grid.length; col++) {
        validStarts.push(grid[col][row]);
      }
    }
  }

  // Randomly select a starting position
  const randomIndex = Math.floor(Math.random() * validStarts.length);
  return validStarts[randomIndex];
};
const autoPlacement = gameboard => {
  const shipTypes = [{
    type: "carrier",
    size: 5
  }, {
    type: "battleship",
    size: 4
  }, {
    type: "cruiser",
    size: 3
  }, {
    type: "submarine",
    size: 3
  }, {
    type: "destroyer",
    size: 2
  }];
  shipTypes.forEach(ship => {
    let placed = false;
    while (!placed) {
      const direction = Math.random() < 0.5 ? "h" : "v";
      const start = generateRandomStart(ship.size, direction, gameboard.grid);
      try {
        gameboard.placeShip(ship.type, start, direction);
        placed = true;
      } catch (error) {
        if (!(error instanceof _errors__WEBPACK_IMPORTED_MODULE_0__.ShipPlacementBoundaryError) && !(error instanceof _errors__WEBPACK_IMPORTED_MODULE_0__.OverlappingShipsError)) {
          throw error; // Rethrow non-placement errors
        }
        // If placement fails, catch the error and try again
      }
    }
  });
};
const Player = (gameboard, type) => {
  const moveLog = [];
  const placeShips = (shipType, start, direction) => {
    if (type === "human") {
      gameboard.placeShip(shipType, start, direction);
    } else if (type === "computer") {
      autoPlacement(gameboard);
    } else {
      throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidPlayerTypeError(`Invalid player type. Valid player types: "human" & "computer". Entered: ${type}.`);
    }
  };
  const makeMove = (oppGameboard, input) => {
    let move;

    // Check for the type of player
    if (type === "human") {
      // Format the input
      move = `${input.charAt(0).toUpperCase()}${input.substring(1)}`;
    } else if (type === "computer") {
      move = randMove(oppGameboard.grid, moveLog);
    } else {
      throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidPlayerTypeError(`Invalid player type. Valid player types: "human" & "computer". Entered: ${type}.`);
    }

    // Check the input against the possible moves on the gameboard's grid
    if (!checkMove(move, oppGameboard.grid)) {
      throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidMoveEntryError(`Invalid move entry! Move: ${move}.`);
    }

    // If the move exists in the moveLog array, throw an error
    if (moveLog.find(el => el === move)) {
      throw new _errors__WEBPACK_IMPORTED_MODULE_0__.RepeatAttackedError();
    }

    // Else, call attack method on gameboard and log move in moveLog
    const response = oppGameboard.attack(move);
    moveLog.push(move);
    // Return the response of the attack (object: { hit: false } for miss; { hit: true, shipType: string } for hit).
    return {
      player: type,
      ...response
    };
  };
  return {
    get type() {
      return type;
    },
    get gameboard() {
      return gameboard;
    },
    get moveLog() {
      return moveLog;
    },
    makeMove,
    placeShips
  };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Player);

/***/ }),

/***/ "./src/ship.js":
/*!*********************!*\
  !*** ./src/ship.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./errors */ "./src/errors.js");

const Ship = type => {
  const setLength = () => {
    switch (type) {
      case "carrier":
        return 5;
      case "battleship":
        return 4;
      case "cruiser":
      case "submarine":
        return 3;
      case "destroyer":
        return 2;
      default:
        throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidShipTypeError();
    }
  };
  const shipLength = setLength();
  let hits = 0;
  const hit = () => {
    if (hits < shipLength) {
      hits += 1;
    }
  };
  return {
    get type() {
      return type;
    },
    get shipLength() {
      return shipLength;
    },
    get hits() {
      return hits;
    },
    get isSunk() {
      return hits === shipLength;
    },
    hit
  };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Ship);

/***/ }),

/***/ "./src/uiManager.js":
/*!**************************!*\
  !*** ./src/uiManager.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _gameboard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gameboard */ "./src/gameboard.js");


/*
/////////PSEUDOCODE////////

BUILDING THE DISPLAY DOM ELEMENTS FOR EACH SHIP
- Take the ship object to build a display for as an argument.
- Extract the type and/or shipLength of the ship as constants.
- Use the ship's length and/or type to create a visual display element of the
  correct size.
  - Give each section of the ship a unique id.
  - Set the TailwindCSS classes for each section of the ship.  
- Return the display element ready for pushing to the DOM.
  - Either return an array of these elements or a full div/container with the
    sections laid out.
  
RENDER THE SHIPS TO THE SHIP STATUS DISPLAY
- Take the player object in as an argument.
- From the type of player, set the id selector for the DOM element.
- Use the id selector and class selector of the "ships-container" to get the
  correct DOM container.
- For each ship in the player's array, render a container with the type of ship
  and another container with each section of the ship laid out.
*/

// Array of different ship types and their lengths
const shipTypes = [{
  type: "carrier",
  shipLength: 5
}, {
  type: "battleship",
  shipLength: 4
}, {
  type: "cruiser",
  shipLength: 3
}, {
  type: "submarine",
  shipLength: 3
}, {
  type: "destroyer",
  shipLength: 2
}];

// Function for building a ship, depending on the ship type
const buildShip = (obj, domSel) => {
  // Extract the ship's type and length from the object
  const {
    type,
    shipLength: length
  } = obj;
  // Create and array for the ship's sections
  const shipSects = [];

  // Use the length of the ship to create the correct number of sections
  for (let i = 1; i < length + 1; i++) {
    // Create an element for the section
    const sect = document.createElement("div");
    sect.className = "w-4 h-4 rounded-full bg-gray-800"; // Set the default styling for the section element
    sect.setAttribute("id", `DOM-${domSel}-ship-${type}-sect-${i}`); // Set a unique id for the ship section
    shipSects.push(sect); // Add the section to the array
  }

  // Return the array of ship sections
  return shipSects;
};

// The function for updating the output div element
const updateOutput = (message, output) => {
  // Append new message
  const messageElement = document.createElement("div"); // Create a new div for the message
  messageElement.textContent = message; // Set the text content to the message
  output.appendChild(messageElement); // Add the element to the output

  // eslint-disable-next-line no-param-reassign
  output.scrollTop = output.scrollHeight; // Scroll to the bottom of the output container
};

// The function for executing commands from the console input
const executeCommand = (command, output) => {
  // Process the command
  // For example, if command is "move A1", call the relevant game function
  console.log(`Executing command: ${command}`); // Placeholder for actual command processing

  // Update the console output
  updateOutput(`> ${command}`, output);

  // Clear the input
  document.getElementById("console-input").value = "";
};

// Function called when a cell on the gamboard is clicked
const gameboardClick = event => {
  // Get the target element
  const {
    id
  } = event.target;
  // Get the target player and position dataset attributes
  const {
    player,
    position
  } = event.target.dataset;
  console.log(`Clicked cell ID: ${id}. Player & position: ${player}, ${position}.`);
};
const UiManager = () => {
  const {
    grid
  } = (0,_gameboard__WEBPACK_IMPORTED_MODULE_0__["default"])();
  const createGameboard = containerID => {
    const container = document.getElementById(containerID);

    // Set player type depending on the containerID
    const {
      player
    } = container.dataset;

    // Create the grid container
    const gridDiv = document.createElement("div");
    gridDiv.className = "grid grid-cols-11 auto-rows-min gap-1 p-6";

    // Add the top-left corner empty cell
    gridDiv.appendChild(document.createElement("div"));

    // Add column headers A-J
    const columns = "ABCDEFGHIJ";
    for (let i = 0; i < columns.length; i++) {
      const header = document.createElement("div");
      header.className = "text-center";
      header.textContent = columns[i];
      gridDiv.appendChild(header);
    }

    // Add row labels and cells
    for (let row = 1; row <= 10; row++) {
      // Row label
      const rowLabel = document.createElement("div");
      rowLabel.className = "text-center";
      rowLabel.textContent = row;
      gridDiv.appendChild(rowLabel);

      // Cells for each row
      for (let col = 0; col < 10; col++) {
        const cellId = `${columns[col]}${row}`; // Set the cellId
        const cell = document.createElement("div");
        cell.id = `${player}-${cellId}`; // Set the element id
        cell.className = "w-6 h-6 bg-gray-200 cursor-pointer hover:bg-orange-500"; // Add more classes as needed for styling
        cell.dataset.position = cellId; // Assign position data attribute for identification
        cell.dataset.player = player; // Assign player data attribute for identification

        // Add an event listener to the cell
        cell.addEventListener("click", gameboardClick);
        gridDiv.appendChild(cell);
      }
    }

    // Append the grid to the container
    container.appendChild(gridDiv);
  };
  const initConsoleUI = () => {
    const consoleContainer = document.getElementById("console"); // Get the console container from the DOM
    consoleContainer.classList.add("flex", "flex-col", "justify-between", "text-sm"); // Set flexbox rules for container

    // Create a container for the input and button elements
    const inputDiv = document.createElement("div");
    inputDiv.className = "flex flex-row w-full h-1/5 justify-between"; // Set the flexbox rules for the container

    const input = document.createElement("input"); // Create an input element for the console
    input.type = "text"; // Set the input type of this element to text
    input.setAttribute("id", "console-input"); // Set the id for this element to "console-input"
    input.className = "p-1 bg-gray-400 flex-1"; // Add TailwindCSS classes
    const submitButton = document.createElement("button"); // Create a button element for the console submit
    submitButton.textContent = "Submit"; // Add the text "Submit" to the button
    submitButton.setAttribute("id", "console-submit"); // Set the id for the button
    submitButton.className = "px-3 py-1 bg-gray-800 text-center text-sm"; // Add TailwindCSS classes
    const output = document.createElement("div"); // Create an div element for the output of the console
    output.setAttribute("id", "console-output"); // Set the id for the output element
    output.className = "p-1 bg-gray-200 flex-1 h-4/5 overflow-auto"; // Add TailwindCSS classes

    // Add the input elements to the input container
    inputDiv.appendChild(input);
    inputDiv.appendChild(submitButton);

    // Append elements to the console container
    consoleContainer.appendChild(output);
    consoleContainer.appendChild(inputDiv);

    // Setup event listeners
    submitButton.addEventListener("click", () => executeCommand(input.value, output));
    input.addEventListener("keypress", e => {
      if (e.key === "Enter") {
        executeCommand(input.value, output);
      }
    });
  };
  const displayPrompt = promptObjs => {
    // Get the prompt display
    const display = document.getElementById("prompt-display");

    // Clear the display of all children
    while (display.firstChild) {
      display.removeChild(display.firstChild);
    }

    // Iterate over each prompt in the prompts object
    Object.entries(promptObjs).forEach(([key, {
      prompt,
      promptType
    }]) => {
      // Create a new div for each prompt
      const promptDiv = document.createElement("div");
      promptDiv.textContent = prompt;

      // Apply styling based on promptType
      switch (promptType) {
        case "instruction":
          promptDiv.classList.add("text-orange-500");
          break;
        case "error":
          promptDiv.classList.add("text-red-500");
          break;
        default:
          promptDiv.classList.add("text-gray-800");
        // Default text color
      }

      // Append the new div to the display container
      display.appendChild(promptDiv);
    });
  };

  // Function for rendering ships to the Ship Status display section
  const renderShipDisp = playerObj => {
    let idSel;

    // Set the correct id selector for the type of player
    if (playerObj.type === "human") {
      idSel = "human-ships";
    } else if (playerObj.type === "computer") {
      idSel = "comp-ships";
    } else {
      throw Error;
    }

    // Get the correct DOM element
    const dispDiv = document.getElementById(idSel).querySelector(".ships-container");

    // For each of the player's ships, render the ship to the container
    Object.values(playerObj.gameboard.ships).forEach(ship => {
      // Create a div for the ship
      const shipDiv = document.createElement("div");
      shipDiv.className = "px-4 py-2 flex flex-col gap-1";

      // Add a title the the div
      const title = document.createElement("h2");
      title.textContent = ship.type; // Set the title to the ship type
      shipDiv.appendChild(title);

      // Build the ship sections
      const shipSects = buildShip(ship, idSel);

      // Add the ship sections to the div
      const sectsDiv = document.createElement("div");
      sectsDiv.className = "flex flex-row gap-1";
      shipSects.forEach(sect => {
        sectsDiv.appendChild(sect);
      });
      shipDiv.appendChild(sectsDiv);
      dispDiv.appendChild(shipDiv);
    });
  };
  return {
    createGameboard,
    initConsoleUI,
    displayPrompt,
    renderShipDisp
  };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (UiManager);

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[1].use[2]!./src/styles.css":
/*!************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[1].use[2]!./src/styles.css ***!
  \************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/*
! tailwindcss v3.4.1 | MIT License | https://tailwindcss.com
*//*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/

*,
::before,
::after {
  box-sizing: border-box; /* 1 */
  border-width: 0; /* 2 */
  border-style: solid; /* 2 */
  border-color: #e5e7eb; /* 2 */
}

::before,
::after {
  --tw-content: '';
}

/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured \`sans\` font-family by default.
5. Use the user's configured \`sans\` font-feature-settings by default.
6. Use the user's configured \`sans\` font-variation-settings by default.
7. Disable tap highlights on iOS
*/

html,
:host {
  line-height: 1.5; /* 1 */
  -webkit-text-size-adjust: 100%; /* 2 */
  -moz-tab-size: 4; /* 3 */
  -o-tab-size: 4;
     tab-size: 4; /* 3 */
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; /* 4 */
  font-feature-settings: normal; /* 5 */
  font-variation-settings: normal; /* 6 */
  -webkit-tap-highlight-color: transparent; /* 7 */
}

/*
1. Remove the margin in all browsers.
2. Inherit line-height from \`html\` so users can set them as a class directly on the \`html\` element.
*/

body {
  margin: 0; /* 1 */
  line-height: inherit; /* 2 */
}

/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

hr {
  height: 0; /* 1 */
  color: inherit; /* 2 */
  border-top-width: 1px; /* 3 */
}

/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}

/*
Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  text-decoration: inherit;
}

/*
Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

/*
1. Use the user's configured \`mono\` font-family by default.
2. Use the user's configured \`mono\` font-feature-settings by default.
3. Use the user's configured \`mono\` font-variation-settings by default.
4. Correct the odd \`em\` font sizing in all browsers.
*/

code,
kbd,
samp,
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; /* 1 */
  font-feature-settings: normal; /* 2 */
  font-variation-settings: normal; /* 3 */
  font-size: 1em; /* 4 */
}

/*
Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

/*
Prevent \`sub\` and \`sup\` elements from affecting the line height in all browsers.
*/

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0; /* 1 */
  border-color: inherit; /* 2 */
  border-collapse: collapse; /* 3 */
}

/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

button,
input,
optgroup,
select,
textarea {
  font-family: inherit; /* 1 */
  font-feature-settings: inherit; /* 1 */
  font-variation-settings: inherit; /* 1 */
  font-size: 100%; /* 1 */
  font-weight: inherit; /* 1 */
  line-height: inherit; /* 1 */
  color: inherit; /* 1 */
  margin: 0; /* 2 */
  padding: 0; /* 3 */
}

/*
Remove the inheritance of text transform in Edge and Firefox.
*/

button,
select {
  text-transform: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

button,
[type='button'],
[type='reset'],
[type='submit'] {
  -webkit-appearance: button; /* 1 */
  background-color: transparent; /* 2 */
  background-image: none; /* 2 */
}

/*
Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

/*
Remove the additional \`:invalid\` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

:-moz-ui-invalid {
  box-shadow: none;
}

/*
Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

[type='search'] {
  -webkit-appearance: textfield; /* 1 */
  outline-offset: -2px; /* 2 */
}

/*
Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to \`inherit\` in Safari.
*/

::-webkit-file-upload-button {
  -webkit-appearance: button; /* 1 */
  font: inherit; /* 2 */
}

/*
Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
Removes the default spacing and border for appropriate elements.
*/

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/*
Reset default styling for dialogs.
*/
dialog {
  padding: 0;
}

/*
Prevent resizing textareas horizontally by default.
*/

textarea {
  resize: vertical;
}

/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/

input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1; /* 1 */
  color: #9ca3af; /* 2 */
}

input::placeholder,
textarea::placeholder {
  opacity: 1; /* 1 */
  color: #9ca3af; /* 2 */
}

/*
Set the default cursor for buttons.
*/

button,
[role="button"] {
  cursor: pointer;
}

/*
Make sure disabled buttons don't get the pointer cursor.
*/
:disabled {
  cursor: default;
}

/*
1. Make replaced elements \`display: block\` by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add \`vertical-align: middle\` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block; /* 1 */
  vertical-align: middle; /* 2 */
}

/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

img,
video {
  max-width: 100%;
  height: auto;
}

/* Make elements with the HTML hidden attribute stay hidden by default */
[hidden] {
  display: none;
}

*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
}
.container {
  width: 100%;
}
@media (min-width: 640px) {

  .container {
    max-width: 640px;
  }
}
@media (min-width: 768px) {

  .container {
    max-width: 768px;
  }
}
@media (min-width: 1024px) {

  .container {
    max-width: 1024px;
  }
}
@media (min-width: 1280px) {

  .container {
    max-width: 1280px;
  }
}
@media (min-width: 1536px) {

  .container {
    max-width: 1536px;
  }
}
.visible {
  visibility: visible;
}
.collapse {
  visibility: collapse;
}
.relative {
  position: relative;
}
.m-5 {
  margin: 1.25rem;
}
.m-8 {
  margin: 2rem;
}
.ml-10 {
  margin-left: 2.5rem;
}
.ml-8 {
  margin-left: 2rem;
}
.block {
  display: block;
}
.flex {
  display: flex;
}
.table {
  display: table;
}
.grid {
  display: grid;
}
.contents {
  display: contents;
}
.hidden {
  display: none;
}
.h-1 {
  height: 0.25rem;
}
.h-1\\/5 {
  height: 20%;
}
.h-4 {
  height: 1rem;
}
.h-4\\/5 {
  height: 80%;
}
.h-40 {
  height: 10rem;
}
.h-6 {
  height: 1.5rem;
}
.h-max {
  height: -moz-max-content;
  height: max-content;
}
.w-1 {
  width: 0.25rem;
}
.w-1\\/2 {
  width: 50%;
}
.w-4 {
  width: 1rem;
}
.w-4\\/12 {
  width: 33.333333%;
}
.w-6 {
  width: 1.5rem;
}
.w-auto {
  width: auto;
}
.w-full {
  width: 100%;
}
.min-w-44 {
  min-width: 11rem;
}
.min-w-max {
  min-width: -moz-max-content;
  min-width: max-content;
}
.min-w-min {
  min-width: -moz-min-content;
  min-width: min-content;
}
.flex-1 {
  flex: 1 1 0%;
}
.flex-none {
  flex: none;
}
.border-collapse {
  border-collapse: collapse;
}
.transform {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
.cursor-help {
  cursor: help;
}
.cursor-pointer {
  cursor: pointer;
}
.cursor-text {
  cursor: text;
}
.resize {
  resize: both;
}
.auto-rows-min {
  grid-auto-rows: min-content;
}
.grid-cols-11 {
  grid-template-columns: repeat(11, minmax(0, 1fr));
}
.flex-row {
  flex-direction: row;
}
.flex-col {
  flex-direction: column;
}
.justify-start {
  justify-content: flex-start;
}
.justify-center {
  justify-content: center;
}
.justify-between {
  justify-content: space-between;
}
.justify-around {
  justify-content: space-around;
}
.gap-1 {
  gap: 0.25rem;
}
.gap-10 {
  gap: 2.5rem;
}
.gap-2 {
  gap: 0.5rem;
}
.gap-6 {
  gap: 1.5rem;
}
.overflow-auto {
  overflow: auto;
}
.rounded-full {
  border-radius: 9999px;
}
.rounded-xl {
  border-radius: 0.75rem;
}
.border {
  border-width: 1px;
}
.border-solid {
  border-style: solid;
}
.border-blue-800 {
  --tw-border-opacity: 1;
  border-color: rgb(30 64 175 / var(--tw-border-opacity));
}
.border-gray-800 {
  --tw-border-opacity: 1;
  border-color: rgb(31 41 55 / var(--tw-border-opacity));
}
.border-green-600 {
  --tw-border-opacity: 1;
  border-color: rgb(22 163 74 / var(--tw-border-opacity));
}
.border-orange-400 {
  --tw-border-opacity: 1;
  border-color: rgb(251 146 60 / var(--tw-border-opacity));
}
.border-red-700 {
  --tw-border-opacity: 1;
  border-color: rgb(185 28 28 / var(--tw-border-opacity));
}
.bg-gray-200 {
  --tw-bg-opacity: 1;
  background-color: rgb(229 231 235 / var(--tw-bg-opacity));
}
.bg-gray-400 {
  --tw-bg-opacity: 1;
  background-color: rgb(156 163 175 / var(--tw-bg-opacity));
}
.bg-gray-800 {
  --tw-bg-opacity: 1;
  background-color: rgb(31 41 55 / var(--tw-bg-opacity));
}
.p-1 {
  padding: 0.25rem;
}
.p-2 {
  padding: 0.5rem;
}
.p-4 {
  padding: 1rem;
}
.p-6 {
  padding: 1.5rem;
}
.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}
.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}
.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}
.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
.pl-2 {
  padding-left: 0.5rem;
}
.pl-5 {
  padding-left: 1.25rem;
}
.pl-8 {
  padding-left: 2rem;
}
.text-center {
  text-align: center;
}
.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
.text-gray-800 {
  --tw-text-opacity: 1;
  color: rgb(31 41 55 / var(--tw-text-opacity));
}
.text-orange-500 {
  --tw-text-opacity: 1;
  color: rgb(249 115 22 / var(--tw-text-opacity));
}
.text-red-500 {
  --tw-text-opacity: 1;
  color: rgb(239 68 68 / var(--tw-text-opacity));
}
.text-teal-900 {
  --tw-text-opacity: 1;
  color: rgb(19 78 74 / var(--tw-text-opacity));
}
.underline {
  text-decoration-line: underline;
}
.outline {
  outline-style: solid;
}
.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.hover\\:bg-orange-500:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(249 115 22 / var(--tw-bg-opacity));
}`, "",{"version":3,"sources":["webpack://./src/styles.css"],"names":[],"mappings":"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","sourcesContent":["@tailwind base;\n@tailwind components;\n@tailwind utilities;"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {



module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ "./src/styles.css":
/*!************************!*\
  !*** ./src/styles.css ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_1_use_2_styles_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!../node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[1].use[2]!./styles.css */ "./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[1].use[2]!./src/styles.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_1_use_2_styles_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_1_use_2_styles_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_1_use_2_styles_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_1_use_2_styles_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {



var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {



var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _styles_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./styles.css */ "./src/styles.css");
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./game */ "./src/game.js");
/* harmony import */ var _uiManager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./uiManager */ "./src/uiManager.js");
/* harmony import */ var _actionController__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./actionController */ "./src/actionController.js");





// Create a new UI manager
const newUiManager = (0,_uiManager__WEBPACK_IMPORTED_MODULE_2__["default"])();

// Instantiate a new game
const newGame = (0,_game__WEBPACK_IMPORTED_MODULE_1__["default"])();

// Initialise console
newUiManager.initConsoleUI();

// Set up the gameboard displays using UiManager
newUiManager.createGameboard("human-gb");
newUiManager.createGameboard("comp-gb");

// Create a new action controller
const actController = (0,_actionController__WEBPACK_IMPORTED_MODULE_3__["default"])(newUiManager, newGame);
actController.promptShipPlacement();

// Create a mock array of human player entries
const humanShips = [{
  shipType: "carrier",
  start: "J6",
  direction: "v"
}, {
  shipType: "battleship",
  start: "D7",
  direction: "v"
}, {
  shipType: "submarine",
  start: "A1",
  direction: "h"
}, {
  shipType: "cruiser",
  start: "G1",
  direction: "h"
}, {
  shipType: "destroyer",
  start: "F8",
  direction: "h"
}];

// Call the setUp method on the game
newGame.setUp(humanShips);

// Render the two player's ship status displays
newUiManager.renderShipDisp(newGame.players.human);
newUiManager.renderShipDisp(newGame.players.computer);

// Console log the players
console.log(`Players: First player of type ${newGame.players.human.type}, second player of type ${newGame.players.computer.type}!`);
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxF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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxjQUFjO0FBQ2Qsa0JBQWtCO0FBQ2xCOztBQUVBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Qsa0JBQWtCO0FBQ2xCOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCLDBCQUEwQjtBQUMxQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsT0FBTyxrRkFBa0YsWUFBWSxNQUFNLE9BQU8scUJBQXFCLG9CQUFvQixxQkFBcUIscUJBQXFCLE1BQU0sTUFBTSxXQUFXLE1BQU0sWUFBWSxNQUFNLE1BQU0scUJBQXFCLHFCQUFxQixxQkFBcUIsVUFBVSxvQkFBb0IscUJBQXFCLHFCQUFxQixxQkFBcUIscUJBQXFCLE1BQU0sT0FBTyxNQUFNLEtBQUssb0JBQW9CLHFCQUFxQixNQUFNLFFBQVEsTUFBTSxLQUFLLG9CQUFvQixvQkFBb0IscUJBQXFCLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxXQUFXLE1BQU0sTUFBTSxNQUFNLFVBQVUsV0FBVyxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssVUFBVSxXQUFXLE1BQU0sTUFBTSxNQUFNLE1BQU0sV0FBVyxNQUFNLFNBQVMsTUFBTSxRQUFRLHFCQUFxQixxQkFBcUIscUJBQXFCLG9CQUFvQixNQUFNLE1BQU0sTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLE1BQU0sTUFBTSxVQUFVLFVBQVUsV0FBVyxXQUFXLE1BQU0sS0FBSyxVQUFVLE1BQU0sS0FBSyxVQUFVLE1BQU0sUUFBUSxNQUFNLEtBQUssb0JBQW9CLHFCQUFxQixxQkFBcUIsTUFBTSxRQUFRLE1BQU0sU0FBUyxxQkFBcUIscUJBQXFCLHFCQUFxQixvQkFBb0IscUJBQXFCLHFCQUFxQixvQkFBb0Isb0JBQW9CLG9CQUFvQixNQUFNLE1BQU0sTUFBTSxNQUFNLFdBQVcsTUFBTSxPQUFPLE1BQU0sUUFBUSxxQkFBcUIscUJBQXFCLHFCQUFxQixNQUFNLE1BQU0sTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sTUFBTSxNQUFNLFVBQVUsTUFBTSxPQUFPLE1BQU0sS0FBSyxxQkFBcUIscUJBQXFCLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE9BQU8sTUFBTSxLQUFLLHFCQUFxQixvQkFBb0IsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxNQUFNLGlCQUFpQixVQUFVLE1BQU0sS0FBSyxVQUFVLFVBQVUsTUFBTSxLQUFLLFVBQVUsTUFBTSxPQUFPLFdBQVcsVUFBVSxVQUFVLE1BQU0sTUFBTSxLQUFLLEtBQUssVUFBVSxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxPQUFPLE1BQU0sS0FBSyxvQkFBb0Isb0JBQW9CLE1BQU0sTUFBTSxvQkFBb0Isb0JBQW9CLE1BQU0sTUFBTSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sS0FBSyxLQUFLLFVBQVUsTUFBTSxRQUFRLE1BQU0sWUFBWSxvQkFBb0IscUJBQXFCLE1BQU0sTUFBTSxNQUFNLE1BQU0sVUFBVSxVQUFVLE1BQU0sV0FBVyxLQUFLLFVBQVUsTUFBTSxLQUFLLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsS0FBSyxNQUFNLEtBQUssV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxLQUFLLEtBQUssS0FBSyxLQUFLLE1BQU0sT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0s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QUFJO0VBQUVDLFNBQVMsRUFBRTtBQUFJLENBQUMsRUFDdEQ7RUFBRUYsUUFBUSxFQUFFLFNBQVM7RUFBRUMsS0FBSyxFQUFFLElBQUk7RUFBRUMsU0FBUyxFQUFFO0FBQUksQ0FBQyxFQUNwRDtFQUFFRixRQUFRLEVBQUUsV0FBVztFQUFFQyxLQUFLLEVBQUUsSUFBSTtFQUFFQyxTQUFTLEVBQUU7QUFBSSxDQUFDLENBQ3ZEOztBQUVEO0FBQ0FrSyxPQUFPLENBQUN6SyxLQUFLLENBQUNDLFVBQVUsQ0FBQzs7QUFFekI7QUFDQXVLLFlBQVksQ0FBQ1QsY0FBYyxDQUFDVSxPQUFPLENBQUM1SyxPQUFPLENBQUNDLEtBQUssQ0FBQztBQUNsRDBLLFlBQVksQ0FBQ1QsY0FBYyxDQUFDVSxPQUFPLENBQUM1SyxPQUFPLENBQUNFLFFBQVEsQ0FBQzs7QUFFckQ7QUFDQStILE9BQU8sQ0FBQ0MsR0FBRyxDQUNSLGlDQUFnQzBDLE9BQU8sQ0FBQzVLLE9BQU8sQ0FBQ0MsS0FBSyxDQUFDaUUsSUFBSywyQkFBMEIwRyxPQUFPLENBQUM1SyxPQUFPLENBQUNFLFFBQVEsQ0FBQ2dFLElBQUssR0FDdEgsQ0FBQyxDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2FjdGlvbkNvbnRyb2xsZXIuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2Vycm9ycy5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvZ2FtZS5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvZ2FtZWJvYXJkLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9wbGF5ZXIuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3NoaXAuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3VpTWFuYWdlci5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvc3R5bGVzLmNzcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9zdHlsZXMuY3NzPzBhMjUiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9ub25jZSIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgcGxhY2VTaGlwUHJvbXB0ID0gXCJQbGFjZSB5b3VyIHNoaXBzIG9uIHRoZSBib2FyZCB1c2luZyB0aGUgY29uc29sZS5cIjtcblxuY29uc3QgQWN0aW9uQ29udHJvbGxlciA9ICh1aU1hbmFnZXIsIGdhbWUpID0+IHtcbiAgY29uc3QgcHJvbXB0U2hpcFBsYWNlbWVudCA9ICgpID0+IHtcbiAgICAvLyBDcmVhdGUgYSBwcm9tcHQgb2JqZWN0IHdpdGggdGhlIHByb21wdCBhbmQgcHJvbXB0IHR5cGVcbiAgICBjb25zdCBwcm9tcHRPYmogPSB7IHByb21wdDogcGxhY2VTaGlwUHJvbXB0LCBwcm9tcHRUeXBlOiBcImluc3RydWN0aW9uXCIgfTtcblxuICAgIC8vIENhbGwgdGhlIGRpc3BsYXlQcm9tcHQgbWV0aG9kIG9uIHRoZSBVaU1hbmFnZXJcbiAgICB1aU1hbmFnZXIuZGlzcGxheVByb21wdCh7IHByb21wdE9iaiB9KTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIHByb21wdFNoaXBQbGFjZW1lbnQsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBBY3Rpb25Db250cm9sbGVyO1xuIiwiLyogZXNsaW50LWRpc2FibGUgbWF4LWNsYXNzZXMtcGVyLWZpbGUgKi9cblxuY2xhc3MgT3ZlcmxhcHBpbmdTaGlwc0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJTaGlwcyBhcmUgb3ZlcmxhcHBpbmcuXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIk92ZXJsYXBwaW5nU2hpcHNFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIFNoaXBBbGxvY2F0aW9uUmVhY2hlZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJTaGlwIGFsbG9jYXRpb24gbGltaXQgcmVhY2hlZC5cIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiU2hpcEFsbG9jYXRpb25SZWFjaGVkRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIlNoaXAgdHlwZSBhbGxvY2F0aW9uIGxpbWl0IHJlYWNoZWQuXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIlNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRTaGlwTGVuZ3RoRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIkludmFsaWQgc2hpcCBsZW5ndGguXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRTaGlwTGVuZ3RoRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBJbnZhbGlkU2hpcFR5cGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBzaGlwIHR5cGUuXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRTaGlwVHlwZUVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgSW52YWxpZFBsYXllclR5cGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZSA9IFwiSW52YWxpZCBwbGF5ZXIgdHlwZS4gVmFsaWQgcGxheWVyIHR5cGVzOiAnaHVtYW4nICYgJ2NvbXB1dGVyJ1wiLFxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRTaGlwVHlwZUVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIkludmFsaWQgc2hpcCBwbGFjZW1lbnQuIEJvdW5kYXJ5IGVycm9yIVwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIFJlcGVhdEF0dGFja2VkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIkludmFsaWQgYXR0YWNrIGVudHJ5LiBQb3NpdGlvbiBhbHJlYWR5IGF0dGFja2VkIVwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJSZXBlYXRBdHRhY2tFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRNb3ZlRW50cnlFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBtb3ZlIGVudHJ5IVwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJJbnZhbGlkTW92ZUVudHJ5RXJyb3JcIjtcbiAgfVxufVxuXG5leHBvcnQge1xuICBPdmVybGFwcGluZ1NoaXBzRXJyb3IsXG4gIFNoaXBBbGxvY2F0aW9uUmVhY2hlZEVycm9yLFxuICBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IsXG4gIEludmFsaWRTaGlwTGVuZ3RoRXJyb3IsXG4gIEludmFsaWRTaGlwVHlwZUVycm9yLFxuICBJbnZhbGlkUGxheWVyVHlwZUVycm9yLFxuICBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvcixcbiAgUmVwZWF0QXR0YWNrZWRFcnJvcixcbiAgSW52YWxpZE1vdmVFbnRyeUVycm9yLFxufTtcbiIsImltcG9ydCBQbGF5ZXIgZnJvbSBcIi4vcGxheWVyXCI7XG5pbXBvcnQgR2FtZWJvYXJkIGZyb20gXCIuL2dhbWVib2FyZFwiO1xuaW1wb3J0IFNoaXAgZnJvbSBcIi4vc2hpcFwiO1xuaW1wb3J0IHsgSW52YWxpZFBsYXllclR5cGVFcnJvciB9IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBHYW1lID0gKCkgPT4ge1xuICAvLyBJbml0aWFsaXNlLCBjcmVhdGUgZ2FtZWJvYXJkcyBmb3IgYm90aCBwbGF5ZXJzIGFuZCBjcmVhdGUgcGxheWVycyBvZiB0eXBlcyBodW1hbiBhbmQgY29tcHV0ZXJcbiAgY29uc3QgaHVtYW5HYW1lYm9hcmQgPSBHYW1lYm9hcmQoU2hpcCk7XG4gIGNvbnN0IGNvbXB1dGVyR2FtZWJvYXJkID0gR2FtZWJvYXJkKFNoaXApO1xuICBjb25zdCBodW1hblBsYXllciA9IFBsYXllcihodW1hbkdhbWVib2FyZCwgXCJodW1hblwiKTtcbiAgY29uc3QgY29tcHV0ZXJQbGF5ZXIgPSBQbGF5ZXIoY29tcHV0ZXJHYW1lYm9hcmQsIFwiY29tcHV0ZXJcIik7XG4gIGxldCBjdXJyZW50UGxheWVyO1xuICBsZXQgZ2FtZU92ZXJTdGF0ZSA9IGZhbHNlO1xuXG4gIC8vIFN0b3JlIHBsYXllcnMgaW4gYSBwbGF5ZXIgb2JqZWN0XG4gIGNvbnN0IHBsYXllcnMgPSB7IGh1bWFuOiBodW1hblBsYXllciwgY29tcHV0ZXI6IGNvbXB1dGVyUGxheWVyIH07XG5cbiAgLy8gU2V0IHVwIHBoYXNlXG4gIGNvbnN0IHNldFVwID0gKGh1bWFuU2hpcHMpID0+IHtcbiAgICAvLyBBdXRvbWF0aWMgcGxhY2VtZW50IGZvciBjb21wdXRlclxuICAgIGNvbXB1dGVyUGxheWVyLnBsYWNlU2hpcHMoKTtcblxuICAgIC8vIFBsYWNlIHNoaXBzIGZyb20gdGhlIGh1bWFuIHBsYXllcidzIHNlbGVjdGlvbiBvbiB0aGVpciByZXNwZWN0aXZlIGdhbWVib2FyZFxuICAgIGh1bWFuU2hpcHMuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgICAgaHVtYW5QbGF5ZXIucGxhY2VTaGlwcyhzaGlwLnNoaXBUeXBlLCBzaGlwLnN0YXJ0LCBzaGlwLmRpcmVjdGlvbik7XG4gICAgfSk7XG5cbiAgICAvLyBTZXQgdGhlIGN1cnJlbnQgcGxheWVyIHRvIGh1bWFuIHBsYXllclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBodW1hblBsYXllcjtcbiAgfTtcblxuICAvLyBHYW1lIGVuZGluZyBmdW5jdGlvblxuICBjb25zdCBlbmRHYW1lID0gKCkgPT4ge1xuICAgIGdhbWVPdmVyU3RhdGUgPSB0cnVlO1xuICB9O1xuXG4gIC8vIFRha2UgdHVybiBtZXRob2RcbiAgY29uc3QgdGFrZVR1cm4gPSAobW92ZSkgPT4ge1xuICAgIGxldCBmZWVkYmFjaztcblxuICAgIC8vIERldGVybWluZSB0aGUgb3Bwb25lbnQgYmFzZWQgb24gdGhlIGN1cnJlbnQgcGxheWVyXG4gICAgY29uc3Qgb3Bwb25lbnQgPVxuICAgICAgY3VycmVudFBsYXllciA9PT0gaHVtYW5QbGF5ZXIgPyBjb21wdXRlclBsYXllciA6IGh1bWFuUGxheWVyO1xuXG4gICAgLy8gQ2FsbCB0aGUgbWFrZU1vdmUgbWV0aG9kIG9uIHRoZSBjdXJyZW50IHBsYXllciB3aXRoIHRoZSBvcHBvbmVudCdzIGdhbWVib2FyZCBhbmQgc3RvcmUgYXMgbW92ZSBmZWVkYmFja1xuICAgIGNvbnN0IHJlc3VsdCA9IGN1cnJlbnRQbGF5ZXIubWFrZU1vdmUob3Bwb25lbnQuZ2FtZWJvYXJkLCBtb3ZlKTtcblxuICAgIC8vIElmIHJlc3VsdCBpcyBhIGhpdCwgY2hlY2sgd2hldGhlciB0aGUgc2hpcCBpcyBzdW5rXG4gICAgaWYgKHJlc3VsdC5oaXQpIHtcbiAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIHNoaXAgaXMgc3VuayBhbmQgYWRkIHJlc3VsdCBhcyB2YWx1ZSB0byBmZWVkYmFjayBvYmplY3Qgd2l0aCBrZXkgXCJpc1NoaXBTdW5rXCJcbiAgICAgIGlmIChvcHBvbmVudC5nYW1lYm9hcmQuaXNTaGlwU3VuayhyZXN1bHQuc2hpcFR5cGUpKSB7XG4gICAgICAgIGZlZWRiYWNrID0ge1xuICAgICAgICAgIC4uLnJlc3VsdCxcbiAgICAgICAgICBpc1NoaXBTdW5rOiB0cnVlLFxuICAgICAgICAgIGdhbWVXb246IG9wcG9uZW50LmdhbWVib2FyZC5jaGVja0FsbFNoaXBzU3VuaygpLFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmVlZGJhY2sgPSB7IC4uLnJlc3VsdCwgaXNTaGlwU3VuazogZmFsc2UgfTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFyZXN1bHQuaGl0KSB7XG4gICAgICAvLyBTZXQgZmVlZGJhY2sgdG8ganVzdCB0aGUgcmVzdWx0XG4gICAgICBmZWVkYmFjayA9IHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBJZiBnYW1lIGlzIHdvbiwgZW5kIGdhbWVcbiAgICBpZiAoZmVlZGJhY2suZ2FtZVdvbikge1xuICAgICAgZW5kR2FtZSgpO1xuICAgIH1cblxuICAgIC8vIFN3aXRjaCB0aGUgY3VycmVudCBwbGF5ZXJcbiAgICBjdXJyZW50UGxheWVyID0gb3Bwb25lbnQ7XG5cbiAgICAvLyBSZXR1cm4gdGhlIGZlZWRiYWNrIGZvciB0aGUgbW92ZVxuICAgIHJldHVybiBmZWVkYmFjaztcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldCBjdXJyZW50UGxheWVyKCkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRQbGF5ZXI7XG4gICAgfSxcbiAgICBnZXQgZ2FtZU92ZXJTdGF0ZSgpIHtcbiAgICAgIHJldHVybiBnYW1lT3ZlclN0YXRlO1xuICAgIH0sXG4gICAgcGxheWVycyxcbiAgICBzZXRVcCxcbiAgICB0YWtlVHVybixcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWU7XG4iLCJpbXBvcnQge1xuICBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IsXG4gIE92ZXJsYXBwaW5nU2hpcHNFcnJvcixcbiAgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IsXG4gIFJlcGVhdEF0dGFja2VkRXJyb3IsXG59IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBncmlkID0gW1xuICBbXCJBMVwiLCBcIkEyXCIsIFwiQTNcIiwgXCJBNFwiLCBcIkE1XCIsIFwiQTZcIiwgXCJBN1wiLCBcIkE4XCIsIFwiQTlcIiwgXCJBMTBcIl0sXG4gIFtcIkIxXCIsIFwiQjJcIiwgXCJCM1wiLCBcIkI0XCIsIFwiQjVcIiwgXCJCNlwiLCBcIkI3XCIsIFwiQjhcIiwgXCJCOVwiLCBcIkIxMFwiXSxcbiAgW1wiQzFcIiwgXCJDMlwiLCBcIkMzXCIsIFwiQzRcIiwgXCJDNVwiLCBcIkM2XCIsIFwiQzdcIiwgXCJDOFwiLCBcIkM5XCIsIFwiQzEwXCJdLFxuICBbXCJEMVwiLCBcIkQyXCIsIFwiRDNcIiwgXCJENFwiLCBcIkQ1XCIsIFwiRDZcIiwgXCJEN1wiLCBcIkQ4XCIsIFwiRDlcIiwgXCJEMTBcIl0sXG4gIFtcIkUxXCIsIFwiRTJcIiwgXCJFM1wiLCBcIkU0XCIsIFwiRTVcIiwgXCJFNlwiLCBcIkU3XCIsIFwiRThcIiwgXCJFOVwiLCBcIkUxMFwiXSxcbiAgW1wiRjFcIiwgXCJGMlwiLCBcIkYzXCIsIFwiRjRcIiwgXCJGNVwiLCBcIkY2XCIsIFwiRjdcIiwgXCJGOFwiLCBcIkY5XCIsIFwiRjEwXCJdLFxuICBbXCJHMVwiLCBcIkcyXCIsIFwiRzNcIiwgXCJHNFwiLCBcIkc1XCIsIFwiRzZcIiwgXCJHN1wiLCBcIkc4XCIsIFwiRzlcIiwgXCJHMTBcIl0sXG4gIFtcIkgxXCIsIFwiSDJcIiwgXCJIM1wiLCBcIkg0XCIsIFwiSDVcIiwgXCJINlwiLCBcIkg3XCIsIFwiSDhcIiwgXCJIOVwiLCBcIkgxMFwiXSxcbiAgW1wiSTFcIiwgXCJJMlwiLCBcIkkzXCIsIFwiSTRcIiwgXCJJNVwiLCBcIkk2XCIsIFwiSTdcIiwgXCJJOFwiLCBcIkk5XCIsIFwiSTEwXCJdLFxuICBbXCJKMVwiLCBcIkoyXCIsIFwiSjNcIiwgXCJKNFwiLCBcIko1XCIsIFwiSjZcIiwgXCJKN1wiLCBcIko4XCIsIFwiSjlcIiwgXCJKMTBcIl0sXG5dO1xuXG5jb25zdCBpbmRleENhbGNzID0gKHN0YXJ0KSA9PiB7XG4gIGNvbnN0IGNvbExldHRlciA9IHN0YXJ0WzBdLnRvVXBwZXJDYXNlKCk7IC8vIFRoaXMgaXMgdGhlIGNvbHVtblxuICBjb25zdCByb3dOdW1iZXIgPSBwYXJzZUludChzdGFydC5zbGljZSgxKSwgMTApOyAvLyBUaGlzIGlzIHRoZSByb3dcblxuICBjb25zdCBjb2xJbmRleCA9IGNvbExldHRlci5jaGFyQ29kZUF0KDApIC0gXCJBXCIuY2hhckNvZGVBdCgwKTsgLy8gQ29sdW1uIGluZGV4IGJhc2VkIG9uIGxldHRlclxuICBjb25zdCByb3dJbmRleCA9IHJvd051bWJlciAtIDE7IC8vIFJvdyBpbmRleCBiYXNlZCBvbiBudW1iZXJcblxuICByZXR1cm4gW2NvbEluZGV4LCByb3dJbmRleF07IC8vIFJldHVybiBbcm93LCBjb2x1bW5dXG59O1xuXG5jb25zdCBjaGVja1R5cGUgPSAoc2hpcCwgc2hpcFBvc2l0aW9ucykgPT4ge1xuICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIHNoaXBQb3NpdGlvbnMgb2JqZWN0XG4gIE9iamVjdC5rZXlzKHNoaXBQb3NpdGlvbnMpLmZvckVhY2goKGV4aXN0aW5nU2hpcFR5cGUpID0+IHtcbiAgICBpZiAoZXhpc3RpbmdTaGlwVHlwZSA9PT0gc2hpcCkge1xuICAgICAgdGhyb3cgbmV3IFNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvcigpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5jb25zdCBjaGVja0JvdW5kYXJpZXMgPSAoc2hpcExlbmd0aCwgY29vcmRzLCBkaXJlY3Rpb24pID0+IHtcbiAgLy8gU2V0IHJvdyBhbmQgY29sIGxpbWl0c1xuICBjb25zdCB4TGltaXQgPSBncmlkLmxlbmd0aDsgLy8gVGhpcyBpcyB0aGUgdG90YWwgbnVtYmVyIG9mIGNvbHVtbnMgKHgpXG4gIGNvbnN0IHlMaW1pdCA9IGdyaWRbMF0ubGVuZ3RoOyAvLyBUaGlzIGlzIHRoZSB0b3RhbCBudW1iZXIgb2Ygcm93cyAoeSlcblxuICBjb25zdCB4ID0gY29vcmRzWzBdO1xuICBjb25zdCB5ID0gY29vcmRzWzFdO1xuXG4gIC8vIENoZWNrIGZvciB2YWxpZCBzdGFydCBwb3NpdGlvbiBvbiBib2FyZFxuICBpZiAoeCA8IDAgfHwgeCA+PSB4TGltaXQgfHwgeSA8IDAgfHwgeSA+PSB5TGltaXQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBDaGVjayByaWdodCBib3VuZGFyeSBmb3IgaG9yaXpvbnRhbCBwbGFjZW1lbnRcbiAgaWYgKGRpcmVjdGlvbiA9PT0gXCJoXCIgJiYgeCArIHNoaXBMZW5ndGggPiB4TGltaXQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gQ2hlY2sgYm90dG9tIGJvdW5kYXJ5IGZvciB2ZXJ0aWNhbCBwbGFjZW1lbnRcbiAgaWYgKGRpcmVjdGlvbiA9PT0gXCJ2XCIgJiYgeSArIHNoaXBMZW5ndGggPiB5TGltaXQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBJZiBub25lIG9mIHRoZSBpbnZhbGlkIGNvbmRpdGlvbnMgYXJlIG1ldCwgcmV0dXJuIHRydWVcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5jb25zdCBjYWxjdWxhdGVTaGlwUG9zaXRpb25zID0gKHNoaXBMZW5ndGgsIGNvb3JkcywgZGlyZWN0aW9uKSA9PiB7XG4gIGNvbnN0IGNvbEluZGV4ID0gY29vcmRzWzBdOyAvLyBUaGlzIGlzIHRoZSBjb2x1bW4gaW5kZXhcbiAgY29uc3Qgcm93SW5kZXggPSBjb29yZHNbMV07IC8vIFRoaXMgaXMgdGhlIHJvdyBpbmRleFxuXG4gIGNvbnN0IHBvc2l0aW9ucyA9IFtdO1xuXG4gIGlmIChkaXJlY3Rpb24udG9Mb3dlckNhc2UoKSA9PT0gXCJoXCIpIHtcbiAgICAvLyBIb3Jpem9udGFsIHBsYWNlbWVudDogaW5jcmVtZW50IHRoZSBjb2x1bW4gaW5kZXhcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoaXBMZW5ndGg7IGkrKykge1xuICAgICAgcG9zaXRpb25zLnB1c2goZ3JpZFtjb2xJbmRleCArIGldW3Jvd0luZGV4XSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIFZlcnRpY2FsIHBsYWNlbWVudDogaW5jcmVtZW50IHRoZSByb3cgaW5kZXhcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoaXBMZW5ndGg7IGkrKykge1xuICAgICAgcG9zaXRpb25zLnB1c2goZ3JpZFtjb2xJbmRleF1bcm93SW5kZXggKyBpXSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBvc2l0aW9ucztcbn07XG5cbmNvbnN0IGNoZWNrRm9yT3ZlcmxhcCA9IChwb3NpdGlvbnMsIHNoaXBQb3NpdGlvbnMpID0+IHtcbiAgT2JqZWN0LmVudHJpZXMoc2hpcFBvc2l0aW9ucykuZm9yRWFjaCgoW3NoaXBUeXBlLCBleGlzdGluZ1NoaXBQb3NpdGlvbnNdKSA9PiB7XG4gICAgaWYgKFxuICAgICAgcG9zaXRpb25zLnNvbWUoKHBvc2l0aW9uKSA9PiBleGlzdGluZ1NoaXBQb3NpdGlvbnMuaW5jbHVkZXMocG9zaXRpb24pKVxuICAgICkge1xuICAgICAgdGhyb3cgbmV3IE92ZXJsYXBwaW5nU2hpcHNFcnJvcihcbiAgICAgICAgYE92ZXJsYXAgZGV0ZWN0ZWQgd2l0aCBzaGlwIHR5cGUgJHtzaGlwVHlwZX1gLFxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgY2hlY2tGb3JIaXQgPSAocG9zaXRpb24sIHNoaXBQb3NpdGlvbnMpID0+IHtcbiAgY29uc3QgZm91bmRTaGlwID0gT2JqZWN0LmVudHJpZXMoc2hpcFBvc2l0aW9ucykuZmluZChcbiAgICAoW18sIGV4aXN0aW5nU2hpcFBvc2l0aW9uc10pID0+IGV4aXN0aW5nU2hpcFBvc2l0aW9ucy5pbmNsdWRlcyhwb3NpdGlvbiksXG4gICk7XG5cbiAgcmV0dXJuIGZvdW5kU2hpcCA/IHsgaGl0OiB0cnVlLCBzaGlwVHlwZTogZm91bmRTaGlwWzBdIH0gOiB7IGhpdDogZmFsc2UgfTtcbn07XG5cbmNvbnN0IEdhbWVib2FyZCA9IChzaGlwRmFjdG9yeSkgPT4ge1xuICBjb25zdCBzaGlwcyA9IHt9O1xuICBjb25zdCBzaGlwUG9zaXRpb25zID0ge307XG4gIGNvbnN0IGhpdFBvc2l0aW9ucyA9IHt9O1xuICBjb25zdCBhdHRhY2tMb2cgPSBbW10sIFtdXTtcblxuICBjb25zdCBwbGFjZVNoaXAgPSAodHlwZSwgc3RhcnQsIGRpcmVjdGlvbikgPT4ge1xuICAgIGNvbnN0IG5ld1NoaXAgPSBzaGlwRmFjdG9yeSh0eXBlKTtcblxuICAgIC8vIENoZWNrIHRoZSBzaGlwIHR5cGUgYWdhaW5zdCBleGlzdGluZyB0eXBlc1xuICAgIGNoZWNrVHlwZSh0eXBlLCBzaGlwUG9zaXRpb25zKTtcblxuICAgIC8vIENhbGN1bGF0ZSBzdGFydCBwb2ludCBjb29yZGluYXRlcyBiYXNlZCBvbiBzdGFydCBwb2ludCBncmlkIGtleVxuICAgIGNvbnN0IGNvb3JkcyA9IGluZGV4Q2FsY3Moc3RhcnQpO1xuXG4gICAgLy8gQ2hlY2sgYm91bmRhcmllcywgaWYgb2sgY29udGludWUgdG8gbmV4dCBzdGVwXG4gICAgaWYgKGNoZWNrQm91bmRhcmllcyhuZXdTaGlwLnNoaXBMZW5ndGgsIGNvb3JkcywgZGlyZWN0aW9uKSkge1xuICAgICAgLy8gQ2FsY3VsYXRlIGFuZCBzdG9yZSBwb3NpdGlvbnMgZm9yIGEgbmV3IHNoaXBcbiAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IGNhbGN1bGF0ZVNoaXBQb3NpdGlvbnMoXG4gICAgICAgIG5ld1NoaXAuc2hpcExlbmd0aCxcbiAgICAgICAgY29vcmRzLFxuICAgICAgICBkaXJlY3Rpb24sXG4gICAgICApO1xuXG4gICAgICAvLyBDaGVjayBmb3Igb3ZlcmxhcCBiZWZvcmUgcGxhY2luZyB0aGUgc2hpcFxuICAgICAgY2hlY2tGb3JPdmVybGFwKHBvc2l0aW9ucywgc2hpcFBvc2l0aW9ucyk7XG5cbiAgICAgIC8vIElmIG5vIG92ZXJsYXAsIHByb2NlZWQgdG8gcGxhY2Ugc2hpcFxuICAgICAgc2hpcFBvc2l0aW9uc1t0eXBlXSA9IHBvc2l0aW9ucztcbiAgICAgIC8vIEFkZCBzaGlwIHRvIHNoaXBzIG9iamVjdFxuICAgICAgc2hpcHNbdHlwZV0gPSBuZXdTaGlwO1xuXG4gICAgICAvLyBJbml0aWFsaXNlIGhpdFBvc2l0aW9ucyBmb3IgdGhpcyBzaGlwIHR5cGUgYXMgYW4gZW1wdHkgYXJyYXlcbiAgICAgIGhpdFBvc2l0aW9uc1t0eXBlXSA9IFtdO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIHNoaXAgcGxhY2VtZW50LiBCb3VuZGFyeSBlcnJvciEgU2hpcCB0eXBlOiAke3R5cGV9YCxcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJlZ2lzdGVyIGFuIGF0dGFjayBhbmQgdGVzdCBmb3IgdmFsaWQgaGl0XG4gIGNvbnN0IGF0dGFjayA9IChwb3NpdGlvbikgPT4ge1xuICAgIGxldCByZXNwb25zZTtcblxuICAgIC8vIENoZWNrIGZvciB2YWxpZCBhdHRhY2tcbiAgICBpZiAoYXR0YWNrTG9nWzBdLmluY2x1ZGVzKHBvc2l0aW9uKSB8fCBhdHRhY2tMb2dbMV0uaW5jbHVkZXMocG9zaXRpb24pKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhgUmVwZWF0IGF0dGFjazogJHtwb3NpdGlvbn1gKTtcbiAgICAgIHRocm93IG5ldyBSZXBlYXRBdHRhY2tlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGhpdFxuICAgIGNvbnN0IGNoZWNrUmVzdWx0cyA9IGNoZWNrRm9ySGl0KHBvc2l0aW9uLCBzaGlwUG9zaXRpb25zKTtcbiAgICBpZiAoY2hlY2tSZXN1bHRzLmhpdCkge1xuICAgICAgLy8gUmVnaXN0ZXIgdmFsaWQgaGl0XG4gICAgICBoaXRQb3NpdGlvbnNbY2hlY2tSZXN1bHRzLnNoaXBUeXBlXS5wdXNoKHBvc2l0aW9uKTtcbiAgICAgIHNoaXBzW2NoZWNrUmVzdWx0cy5zaGlwVHlwZV0uaGl0KCk7XG5cbiAgICAgIC8vIExvZyB0aGUgYXR0YWNrIGFzIGEgdmFsaWQgaGl0XG4gICAgICBhdHRhY2tMb2dbMF0ucHVzaChwb3NpdGlvbik7XG4gICAgICByZXNwb25zZSA9IHsgLi4uY2hlY2tSZXN1bHRzIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGBNSVNTITogJHtwb3NpdGlvbn1gKTtcbiAgICAgIC8vIExvZyB0aGUgYXR0YWNrIGFzIGEgbWlzc1xuICAgICAgYXR0YWNrTG9nWzFdLnB1c2gocG9zaXRpb24pO1xuICAgICAgcmVzcG9uc2UgPSB7IC4uLmNoZWNrUmVzdWx0cyB9O1xuICAgIH1cblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfTtcblxuICBjb25zdCBpc1NoaXBTdW5rID0gKHR5cGUpID0+IHNoaXBzW3R5cGVdLmlzU3VuaztcblxuICBjb25zdCBjaGVja0FsbFNoaXBzU3VuayA9ICgpID0+XG4gICAgT2JqZWN0LmVudHJpZXMoc2hpcHMpLmV2ZXJ5KChbc2hpcFR5cGUsIHNoaXBdKSA9PiBzaGlwLmlzU3Vuayk7XG5cbiAgLy8gRnVuY3Rpb24gZm9yIHJlcG9ydGluZyB0aGUgbnVtYmVyIG9mIHNoaXBzIGxlZnQgYWZsb2F0XG4gIGNvbnN0IHNoaXBSZXBvcnQgPSAoKSA9PiB7XG4gICAgY29uc3QgZmxvYXRpbmdTaGlwcyA9IE9iamVjdC5lbnRyaWVzKHNoaXBzKVxuICAgICAgLmZpbHRlcigoW3NoaXBUeXBlLCBzaGlwXSkgPT4gIXNoaXAuaXNTdW5rKVxuICAgICAgLm1hcCgoW3NoaXBUeXBlLCBfXSkgPT4gc2hpcFR5cGUpO1xuXG4gICAgcmV0dXJuIFtmbG9hdGluZ1NoaXBzLmxlbmd0aCwgZmxvYXRpbmdTaGlwc107XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBnZXQgZ3JpZCgpIHtcbiAgICAgIHJldHVybiBncmlkO1xuICAgIH0sXG4gICAgZ2V0IHNoaXBzKCkge1xuICAgICAgcmV0dXJuIHNoaXBzO1xuICAgIH0sXG4gICAgZ2V0IGF0dGFja0xvZygpIHtcbiAgICAgIHJldHVybiBhdHRhY2tMb2c7XG4gICAgfSxcbiAgICBnZXRTaGlwOiAoc2hpcFR5cGUpID0+IHNoaXBzW3NoaXBUeXBlXSxcbiAgICBnZXRTaGlwUG9zaXRpb25zOiAoc2hpcFR5cGUpID0+IHNoaXBQb3NpdGlvbnNbc2hpcFR5cGVdLFxuICAgIGdldEhpdFBvc2l0aW9uczogKHNoaXBUeXBlKSA9PiBoaXRQb3NpdGlvbnNbc2hpcFR5cGVdLFxuICAgIHBsYWNlU2hpcCxcbiAgICBhdHRhY2ssXG4gICAgaXNTaGlwU3VuayxcbiAgICBjaGVja0FsbFNoaXBzU3VuayxcbiAgICBzaGlwUmVwb3J0LFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgR2FtZWJvYXJkO1xuIiwiaW1wb3J0IHtcbiAgSW52YWxpZFBsYXllclR5cGVFcnJvcixcbiAgSW52YWxpZE1vdmVFbnRyeUVycm9yLFxuICBSZXBlYXRBdHRhY2tlZEVycm9yLFxuICBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvcixcbiAgT3ZlcmxhcHBpbmdTaGlwc0Vycm9yLFxufSBmcm9tIFwiLi9lcnJvcnNcIjtcblxuY29uc3QgY2hlY2tNb3ZlID0gKG1vdmUsIGdiR3JpZCkgPT4ge1xuICBsZXQgdmFsaWQgPSBmYWxzZTtcblxuICBnYkdyaWQuZm9yRWFjaCgoZWwpID0+IHtcbiAgICBpZiAoZWwuZmluZCgocCkgPT4gcCA9PT0gbW92ZSkpIHtcbiAgICAgIHZhbGlkID0gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB2YWxpZDtcbn07XG5cbmNvbnN0IHJhbmRNb3ZlID0gKGdyaWQsIG1vdmVMb2cpID0+IHtcbiAgLy8gRmxhdHRlbiB0aGUgZ3JpZCBpbnRvIGEgc2luZ2xlIGFycmF5IG9mIG1vdmVzXG4gIGNvbnN0IGFsbE1vdmVzID0gZ3JpZC5mbGF0TWFwKChyb3cpID0+IHJvdyk7XG5cbiAgLy8gRmlsdGVyIG91dCB0aGUgbW92ZXMgdGhhdCBhcmUgYWxyZWFkeSBpbiB0aGUgbW92ZUxvZ1xuICBjb25zdCBwb3NzaWJsZU1vdmVzID0gYWxsTW92ZXMuZmlsdGVyKChtb3ZlKSA9PiAhbW92ZUxvZy5pbmNsdWRlcyhtb3ZlKSk7XG5cbiAgLy8gU2VsZWN0IGEgcmFuZG9tIG1vdmUgZnJvbSB0aGUgcG9zc2libGUgbW92ZXNcbiAgY29uc3QgcmFuZG9tTW92ZSA9XG4gICAgcG9zc2libGVNb3Zlc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwb3NzaWJsZU1vdmVzLmxlbmd0aCldO1xuXG4gIHJldHVybiByYW5kb21Nb3ZlO1xufTtcblxuY29uc3QgZ2VuZXJhdGVSYW5kb21TdGFydCA9IChzaXplLCBkaXJlY3Rpb24sIGdyaWQpID0+IHtcbiAgY29uc3QgdmFsaWRTdGFydHMgPSBbXTtcblxuICBpZiAoZGlyZWN0aW9uID09PSBcImhcIikge1xuICAgIC8vIEZvciBob3Jpem9udGFsIG9yaWVudGF0aW9uLCBsaW1pdCB0aGUgY29sdW1uc1xuICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IGdyaWQubGVuZ3RoIC0gc2l6ZSArIDE7IGNvbCsrKSB7XG4gICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBncmlkW2NvbF0ubGVuZ3RoOyByb3crKykge1xuICAgICAgICB2YWxpZFN0YXJ0cy5wdXNoKGdyaWRbY29sXVtyb3ddKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gRm9yIHZlcnRpY2FsIG9yaWVudGF0aW9uLCBsaW1pdCB0aGUgcm93c1xuICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IGdyaWRbMF0ubGVuZ3RoIC0gc2l6ZSArIDE7IHJvdysrKSB7XG4gICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCBncmlkLmxlbmd0aDsgY29sKyspIHtcbiAgICAgICAgdmFsaWRTdGFydHMucHVzaChncmlkW2NvbF1bcm93XSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gUmFuZG9tbHkgc2VsZWN0IGEgc3RhcnRpbmcgcG9zaXRpb25cbiAgY29uc3QgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB2YWxpZFN0YXJ0cy5sZW5ndGgpO1xuICByZXR1cm4gdmFsaWRTdGFydHNbcmFuZG9tSW5kZXhdO1xufTtcblxuY29uc3QgYXV0b1BsYWNlbWVudCA9IChnYW1lYm9hcmQpID0+IHtcbiAgY29uc3Qgc2hpcFR5cGVzID0gW1xuICAgIHsgdHlwZTogXCJjYXJyaWVyXCIsIHNpemU6IDUgfSxcbiAgICB7IHR5cGU6IFwiYmF0dGxlc2hpcFwiLCBzaXplOiA0IH0sXG4gICAgeyB0eXBlOiBcImNydWlzZXJcIiwgc2l6ZTogMyB9LFxuICAgIHsgdHlwZTogXCJzdWJtYXJpbmVcIiwgc2l6ZTogMyB9LFxuICAgIHsgdHlwZTogXCJkZXN0cm95ZXJcIiwgc2l6ZTogMiB9LFxuICBdO1xuXG4gIHNoaXBUeXBlcy5mb3JFYWNoKChzaGlwKSA9PiB7XG4gICAgbGV0IHBsYWNlZCA9IGZhbHNlO1xuICAgIHdoaWxlICghcGxhY2VkKSB7XG4gICAgICBjb25zdCBkaXJlY3Rpb24gPSBNYXRoLnJhbmRvbSgpIDwgMC41ID8gXCJoXCIgOiBcInZcIjtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gZ2VuZXJhdGVSYW5kb21TdGFydChzaGlwLnNpemUsIGRpcmVjdGlvbiwgZ2FtZWJvYXJkLmdyaWQpO1xuXG4gICAgICB0cnkge1xuICAgICAgICBnYW1lYm9hcmQucGxhY2VTaGlwKHNoaXAudHlwZSwgc3RhcnQsIGRpcmVjdGlvbik7XG4gICAgICAgIHBsYWNlZCA9IHRydWU7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgIShlcnJvciBpbnN0YW5jZW9mIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yKSAmJlxuICAgICAgICAgICEoZXJyb3IgaW5zdGFuY2VvZiBPdmVybGFwcGluZ1NoaXBzRXJyb3IpXG4gICAgICAgICkge1xuICAgICAgICAgIHRocm93IGVycm9yOyAvLyBSZXRocm93IG5vbi1wbGFjZW1lbnQgZXJyb3JzXG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgcGxhY2VtZW50IGZhaWxzLCBjYXRjaCB0aGUgZXJyb3IgYW5kIHRyeSBhZ2FpblxuICAgICAgfVxuICAgIH1cbiAgfSk7XG59O1xuXG5jb25zdCBQbGF5ZXIgPSAoZ2FtZWJvYXJkLCB0eXBlKSA9PiB7XG4gIGNvbnN0IG1vdmVMb2cgPSBbXTtcblxuICBjb25zdCBwbGFjZVNoaXBzID0gKHNoaXBUeXBlLCBzdGFydCwgZGlyZWN0aW9uKSA9PiB7XG4gICAgaWYgKHR5cGUgPT09IFwiaHVtYW5cIikge1xuICAgICAgZ2FtZWJvYXJkLnBsYWNlU2hpcChzaGlwVHlwZSwgc3RhcnQsIGRpcmVjdGlvbik7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImNvbXB1dGVyXCIpIHtcbiAgICAgIGF1dG9QbGFjZW1lbnQoZ2FtZWJvYXJkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQbGF5ZXJUeXBlRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIHBsYXllciB0eXBlLiBWYWxpZCBwbGF5ZXIgdHlwZXM6IFwiaHVtYW5cIiAmIFwiY29tcHV0ZXJcIi4gRW50ZXJlZDogJHt0eXBlfS5gLFxuICAgICAgKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgbWFrZU1vdmUgPSAob3BwR2FtZWJvYXJkLCBpbnB1dCkgPT4ge1xuICAgIGxldCBtb3ZlO1xuXG4gICAgLy8gQ2hlY2sgZm9yIHRoZSB0eXBlIG9mIHBsYXllclxuICAgIGlmICh0eXBlID09PSBcImh1bWFuXCIpIHtcbiAgICAgIC8vIEZvcm1hdCB0aGUgaW5wdXRcbiAgICAgIG1vdmUgPSBgJHtpbnB1dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKX0ke2lucHV0LnN1YnN0cmluZygxKX1gO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJjb21wdXRlclwiKSB7XG4gICAgICBtb3ZlID0gcmFuZE1vdmUob3BwR2FtZWJvYXJkLmdyaWQsIG1vdmVMb2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBsYXllclR5cGVFcnJvcihcbiAgICAgICAgYEludmFsaWQgcGxheWVyIHR5cGUuIFZhbGlkIHBsYXllciB0eXBlczogXCJodW1hblwiICYgXCJjb21wdXRlclwiLiBFbnRlcmVkOiAke3R5cGV9LmAsXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHRoZSBpbnB1dCBhZ2FpbnN0IHRoZSBwb3NzaWJsZSBtb3ZlcyBvbiB0aGUgZ2FtZWJvYXJkJ3MgZ3JpZFxuICAgIGlmICghY2hlY2tNb3ZlKG1vdmUsIG9wcEdhbWVib2FyZC5ncmlkKSkge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRNb3ZlRW50cnlFcnJvcihgSW52YWxpZCBtb3ZlIGVudHJ5ISBNb3ZlOiAke21vdmV9LmApO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBtb3ZlIGV4aXN0cyBpbiB0aGUgbW92ZUxvZyBhcnJheSwgdGhyb3cgYW4gZXJyb3JcbiAgICBpZiAobW92ZUxvZy5maW5kKChlbCkgPT4gZWwgPT09IG1vdmUpKSB7XG4gICAgICB0aHJvdyBuZXcgUmVwZWF0QXR0YWNrZWRFcnJvcigpO1xuICAgIH1cblxuICAgIC8vIEVsc2UsIGNhbGwgYXR0YWNrIG1ldGhvZCBvbiBnYW1lYm9hcmQgYW5kIGxvZyBtb3ZlIGluIG1vdmVMb2dcbiAgICBjb25zdCByZXNwb25zZSA9IG9wcEdhbWVib2FyZC5hdHRhY2sobW92ZSk7XG4gICAgbW92ZUxvZy5wdXNoKG1vdmUpO1xuICAgIC8vIFJldHVybiB0aGUgcmVzcG9uc2Ugb2YgdGhlIGF0dGFjayAob2JqZWN0OiB7IGhpdDogZmFsc2UgfSBmb3IgbWlzczsgeyBoaXQ6IHRydWUsIHNoaXBUeXBlOiBzdHJpbmcgfSBmb3IgaGl0KS5cbiAgICByZXR1cm4geyBwbGF5ZXI6IHR5cGUsIC4uLnJlc3BvbnNlIH07XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBnZXQgdHlwZSgpIHtcbiAgICAgIHJldHVybiB0eXBlO1xuICAgIH0sXG4gICAgZ2V0IGdhbWVib2FyZCgpIHtcbiAgICAgIHJldHVybiBnYW1lYm9hcmQ7XG4gICAgfSxcbiAgICBnZXQgbW92ZUxvZygpIHtcbiAgICAgIHJldHVybiBtb3ZlTG9nO1xuICAgIH0sXG4gICAgbWFrZU1vdmUsXG4gICAgcGxhY2VTaGlwcyxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXllcjtcbiIsImltcG9ydCB7IEludmFsaWRTaGlwVHlwZUVycm9yIH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5cbmNvbnN0IFNoaXAgPSAodHlwZSkgPT4ge1xuICBjb25zdCBzZXRMZW5ndGggPSAoKSA9PiB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIFwiY2FycmllclwiOlxuICAgICAgICByZXR1cm4gNTtcbiAgICAgIGNhc2UgXCJiYXR0bGVzaGlwXCI6XG4gICAgICAgIHJldHVybiA0O1xuICAgICAgY2FzZSBcImNydWlzZXJcIjpcbiAgICAgIGNhc2UgXCJzdWJtYXJpbmVcIjpcbiAgICAgICAgcmV0dXJuIDM7XG4gICAgICBjYXNlIFwiZGVzdHJveWVyXCI6XG4gICAgICAgIHJldHVybiAyO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEludmFsaWRTaGlwVHlwZUVycm9yKCk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHNoaXBMZW5ndGggPSBzZXRMZW5ndGgoKTtcblxuICBsZXQgaGl0cyA9IDA7XG5cbiAgY29uc3QgaGl0ID0gKCkgPT4ge1xuICAgIGlmIChoaXRzIDwgc2hpcExlbmd0aCkge1xuICAgICAgaGl0cyArPSAxO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldCB0eXBlKCkge1xuICAgICAgcmV0dXJuIHR5cGU7XG4gICAgfSxcbiAgICBnZXQgc2hpcExlbmd0aCgpIHtcbiAgICAgIHJldHVybiBzaGlwTGVuZ3RoO1xuICAgIH0sXG4gICAgZ2V0IGhpdHMoKSB7XG4gICAgICByZXR1cm4gaGl0cztcbiAgICB9LFxuICAgIGdldCBpc1N1bmsoKSB7XG4gICAgICByZXR1cm4gaGl0cyA9PT0gc2hpcExlbmd0aDtcbiAgICB9LFxuICAgIGhpdCxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFNoaXA7XG4iLCJpbXBvcnQgR2FtZWJvYXJkIGZyb20gXCIuL2dhbWVib2FyZFwiO1xuXG4vKlxuLy8vLy8vLy8vUFNFVURPQ09ERS8vLy8vLy8vXG5cbkJVSUxESU5HIFRIRSBESVNQTEFZIERPTSBFTEVNRU5UUyBGT1IgRUFDSCBTSElQXG4tIFRha2UgdGhlIHNoaXAgb2JqZWN0IHRvIGJ1aWxkIGEgZGlzcGxheSBmb3IgYXMgYW4gYXJndW1lbnQuXG4tIEV4dHJhY3QgdGhlIHR5cGUgYW5kL29yIHNoaXBMZW5ndGggb2YgdGhlIHNoaXAgYXMgY29uc3RhbnRzLlxuLSBVc2UgdGhlIHNoaXAncyBsZW5ndGggYW5kL29yIHR5cGUgdG8gY3JlYXRlIGEgdmlzdWFsIGRpc3BsYXkgZWxlbWVudCBvZiB0aGVcbiAgY29ycmVjdCBzaXplLlxuICAtIEdpdmUgZWFjaCBzZWN0aW9uIG9mIHRoZSBzaGlwIGEgdW5pcXVlIGlkLlxuICAtIFNldCB0aGUgVGFpbHdpbmRDU1MgY2xhc3NlcyBmb3IgZWFjaCBzZWN0aW9uIG9mIHRoZSBzaGlwLiAgXG4tIFJldHVybiB0aGUgZGlzcGxheSBlbGVtZW50IHJlYWR5IGZvciBwdXNoaW5nIHRvIHRoZSBET00uXG4gIC0gRWl0aGVyIHJldHVybiBhbiBhcnJheSBvZiB0aGVzZSBlbGVtZW50cyBvciBhIGZ1bGwgZGl2L2NvbnRhaW5lciB3aXRoIHRoZVxuICAgIHNlY3Rpb25zIGxhaWQgb3V0LlxuICBcblJFTkRFUiBUSEUgU0hJUFMgVE8gVEhFIFNISVAgU1RBVFVTIERJU1BMQVlcbi0gVGFrZSB0aGUgcGxheWVyIG9iamVjdCBpbiBhcyBhbiBhcmd1bWVudC5cbi0gRnJvbSB0aGUgdHlwZSBvZiBwbGF5ZXIsIHNldCB0aGUgaWQgc2VsZWN0b3IgZm9yIHRoZSBET00gZWxlbWVudC5cbi0gVXNlIHRoZSBpZCBzZWxlY3RvciBhbmQgY2xhc3Mgc2VsZWN0b3Igb2YgdGhlIFwic2hpcHMtY29udGFpbmVyXCIgdG8gZ2V0IHRoZVxuICBjb3JyZWN0IERPTSBjb250YWluZXIuXG4tIEZvciBlYWNoIHNoaXAgaW4gdGhlIHBsYXllcidzIGFycmF5LCByZW5kZXIgYSBjb250YWluZXIgd2l0aCB0aGUgdHlwZSBvZiBzaGlwXG4gIGFuZCBhbm90aGVyIGNvbnRhaW5lciB3aXRoIGVhY2ggc2VjdGlvbiBvZiB0aGUgc2hpcCBsYWlkIG91dC5cbiovXG5cbi8vIEFycmF5IG9mIGRpZmZlcmVudCBzaGlwIHR5cGVzIGFuZCB0aGVpciBsZW5ndGhzXG5jb25zdCBzaGlwVHlwZXMgPSBbXG4gIHsgdHlwZTogXCJjYXJyaWVyXCIsIHNoaXBMZW5ndGg6IDUgfSxcbiAgeyB0eXBlOiBcImJhdHRsZXNoaXBcIiwgc2hpcExlbmd0aDogNCB9LFxuICB7IHR5cGU6IFwiY3J1aXNlclwiLCBzaGlwTGVuZ3RoOiAzIH0sXG4gIHsgdHlwZTogXCJzdWJtYXJpbmVcIiwgc2hpcExlbmd0aDogMyB9LFxuICB7IHR5cGU6IFwiZGVzdHJveWVyXCIsIHNoaXBMZW5ndGg6IDIgfSxcbl07XG5cbi8vIEZ1bmN0aW9uIGZvciBidWlsZGluZyBhIHNoaXAsIGRlcGVuZGluZyBvbiB0aGUgc2hpcCB0eXBlXG5jb25zdCBidWlsZFNoaXAgPSAob2JqLCBkb21TZWwpID0+IHtcbiAgLy8gRXh0cmFjdCB0aGUgc2hpcCdzIHR5cGUgYW5kIGxlbmd0aCBmcm9tIHRoZSBvYmplY3RcbiAgY29uc3QgeyB0eXBlLCBzaGlwTGVuZ3RoOiBsZW5ndGggfSA9IG9iajtcbiAgLy8gQ3JlYXRlIGFuZCBhcnJheSBmb3IgdGhlIHNoaXAncyBzZWN0aW9uc1xuICBjb25zdCBzaGlwU2VjdHMgPSBbXTtcblxuICAvLyBVc2UgdGhlIGxlbmd0aCBvZiB0aGUgc2hpcCB0byBjcmVhdGUgdGhlIGNvcnJlY3QgbnVtYmVyIG9mIHNlY3Rpb25zXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgbGVuZ3RoICsgMTsgaSsrKSB7XG4gICAgLy8gQ3JlYXRlIGFuIGVsZW1lbnQgZm9yIHRoZSBzZWN0aW9uXG4gICAgY29uc3Qgc2VjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgc2VjdC5jbGFzc05hbWUgPSBcInctNCBoLTQgcm91bmRlZC1mdWxsIGJnLWdyYXktODAwXCI7IC8vIFNldCB0aGUgZGVmYXVsdCBzdHlsaW5nIGZvciB0aGUgc2VjdGlvbiBlbGVtZW50XG4gICAgc2VjdC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgRE9NLSR7ZG9tU2VsfS1zaGlwLSR7dHlwZX0tc2VjdC0ke2l9YCk7IC8vIFNldCBhIHVuaXF1ZSBpZCBmb3IgdGhlIHNoaXAgc2VjdGlvblxuICAgIHNoaXBTZWN0cy5wdXNoKHNlY3QpOyAvLyBBZGQgdGhlIHNlY3Rpb24gdG8gdGhlIGFycmF5XG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIGFycmF5IG9mIHNoaXAgc2VjdGlvbnNcbiAgcmV0dXJuIHNoaXBTZWN0cztcbn07XG5cbi8vIFRoZSBmdW5jdGlvbiBmb3IgdXBkYXRpbmcgdGhlIG91dHB1dCBkaXYgZWxlbWVudFxuY29uc3QgdXBkYXRlT3V0cHV0ID0gKG1lc3NhZ2UsIG91dHB1dCkgPT4ge1xuICAvLyBBcHBlbmQgbmV3IG1lc3NhZ2VcbiAgY29uc3QgbWVzc2FnZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpOyAvLyBDcmVhdGUgYSBuZXcgZGl2IGZvciB0aGUgbWVzc2FnZVxuICBtZXNzYWdlRWxlbWVudC50ZXh0Q29udGVudCA9IG1lc3NhZ2U7IC8vIFNldCB0aGUgdGV4dCBjb250ZW50IHRvIHRoZSBtZXNzYWdlXG4gIG91dHB1dC5hcHBlbmRDaGlsZChtZXNzYWdlRWxlbWVudCk7IC8vIEFkZCB0aGUgZWxlbWVudCB0byB0aGUgb3V0cHV0XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIG91dHB1dC5zY3JvbGxUb3AgPSBvdXRwdXQuc2Nyb2xsSGVpZ2h0OyAvLyBTY3JvbGwgdG8gdGhlIGJvdHRvbSBvZiB0aGUgb3V0cHV0IGNvbnRhaW5lclxufTtcblxuLy8gVGhlIGZ1bmN0aW9uIGZvciBleGVjdXRpbmcgY29tbWFuZHMgZnJvbSB0aGUgY29uc29sZSBpbnB1dFxuY29uc3QgZXhlY3V0ZUNvbW1hbmQgPSAoY29tbWFuZCwgb3V0cHV0KSA9PiB7XG4gIC8vIFByb2Nlc3MgdGhlIGNvbW1hbmRcbiAgLy8gRm9yIGV4YW1wbGUsIGlmIGNvbW1hbmQgaXMgXCJtb3ZlIEExXCIsIGNhbGwgdGhlIHJlbGV2YW50IGdhbWUgZnVuY3Rpb25cbiAgY29uc29sZS5sb2coYEV4ZWN1dGluZyBjb21tYW5kOiAke2NvbW1hbmR9YCk7IC8vIFBsYWNlaG9sZGVyIGZvciBhY3R1YWwgY29tbWFuZCBwcm9jZXNzaW5nXG5cbiAgLy8gVXBkYXRlIHRoZSBjb25zb2xlIG91dHB1dFxuICB1cGRhdGVPdXRwdXQoYD4gJHtjb21tYW5kfWAsIG91dHB1dCk7XG5cbiAgLy8gQ2xlYXIgdGhlIGlucHV0XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1pbnB1dFwiKS52YWx1ZSA9IFwiXCI7XG59O1xuXG4vLyBGdW5jdGlvbiBjYWxsZWQgd2hlbiBhIGNlbGwgb24gdGhlIGdhbWJvYXJkIGlzIGNsaWNrZWRcbmNvbnN0IGdhbWVib2FyZENsaWNrID0gKGV2ZW50KSA9PiB7XG4gIC8vIEdldCB0aGUgdGFyZ2V0IGVsZW1lbnRcbiAgY29uc3QgeyBpZCB9ID0gZXZlbnQudGFyZ2V0O1xuICAvLyBHZXQgdGhlIHRhcmdldCBwbGF5ZXIgYW5kIHBvc2l0aW9uIGRhdGFzZXQgYXR0cmlidXRlc1xuICBjb25zdCB7IHBsYXllciwgcG9zaXRpb24gfSA9IGV2ZW50LnRhcmdldC5kYXRhc2V0O1xuICBjb25zb2xlLmxvZyhcbiAgICBgQ2xpY2tlZCBjZWxsIElEOiAke2lkfS4gUGxheWVyICYgcG9zaXRpb246ICR7cGxheWVyfSwgJHtwb3NpdGlvbn0uYCxcbiAgKTtcbn07XG5cbmNvbnN0IFVpTWFuYWdlciA9ICgpID0+IHtcbiAgY29uc3QgeyBncmlkIH0gPSBHYW1lYm9hcmQoKTtcblxuICBjb25zdCBjcmVhdGVHYW1lYm9hcmQgPSAoY29udGFpbmVySUQpID0+IHtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXJJRCk7XG5cbiAgICAvLyBTZXQgcGxheWVyIHR5cGUgZGVwZW5kaW5nIG9uIHRoZSBjb250YWluZXJJRFxuICAgIGNvbnN0IHsgcGxheWVyIH0gPSBjb250YWluZXIuZGF0YXNldDtcblxuICAgIC8vIENyZWF0ZSB0aGUgZ3JpZCBjb250YWluZXJcbiAgICBjb25zdCBncmlkRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBncmlkRGl2LmNsYXNzTmFtZSA9IFwiZ3JpZCBncmlkLWNvbHMtMTEgYXV0by1yb3dzLW1pbiBnYXAtMSBwLTZcIjtcblxuICAgIC8vIEFkZCB0aGUgdG9wLWxlZnQgY29ybmVyIGVtcHR5IGNlbGxcbiAgICBncmlkRGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikpO1xuXG4gICAgLy8gQWRkIGNvbHVtbiBoZWFkZXJzIEEtSlxuICAgIGNvbnN0IGNvbHVtbnMgPSBcIkFCQ0RFRkdISUpcIjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbHVtbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBoZWFkZXIuY2xhc3NOYW1lID0gXCJ0ZXh0LWNlbnRlclwiO1xuICAgICAgaGVhZGVyLnRleHRDb250ZW50ID0gY29sdW1uc1tpXTtcbiAgICAgIGdyaWREaXYuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcbiAgICB9XG5cbiAgICAvLyBBZGQgcm93IGxhYmVscyBhbmQgY2VsbHNcbiAgICBmb3IgKGxldCByb3cgPSAxOyByb3cgPD0gMTA7IHJvdysrKSB7XG4gICAgICAvLyBSb3cgbGFiZWxcbiAgICAgIGNvbnN0IHJvd0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIHJvd0xhYmVsLmNsYXNzTmFtZSA9IFwidGV4dC1jZW50ZXJcIjtcbiAgICAgIHJvd0xhYmVsLnRleHRDb250ZW50ID0gcm93O1xuICAgICAgZ3JpZERpdi5hcHBlbmRDaGlsZChyb3dMYWJlbCk7XG5cbiAgICAgIC8vIENlbGxzIGZvciBlYWNoIHJvd1xuICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgMTA7IGNvbCsrKSB7XG4gICAgICAgIGNvbnN0IGNlbGxJZCA9IGAke2NvbHVtbnNbY29sXX0ke3Jvd31gOyAvLyBTZXQgdGhlIGNlbGxJZFxuICAgICAgICBjb25zdCBjZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY2VsbC5pZCA9IGAke3BsYXllcn0tJHtjZWxsSWR9YDsgLy8gU2V0IHRoZSBlbGVtZW50IGlkXG4gICAgICAgIGNlbGwuY2xhc3NOYW1lID1cbiAgICAgICAgICBcInctNiBoLTYgYmctZ3JheS0yMDAgY3Vyc29yLXBvaW50ZXIgaG92ZXI6Ymctb3JhbmdlLTUwMFwiOyAvLyBBZGQgbW9yZSBjbGFzc2VzIGFzIG5lZWRlZCBmb3Igc3R5bGluZ1xuICAgICAgICBjZWxsLmRhdGFzZXQucG9zaXRpb24gPSBjZWxsSWQ7IC8vIEFzc2lnbiBwb3NpdGlvbiBkYXRhIGF0dHJpYnV0ZSBmb3IgaWRlbnRpZmljYXRpb25cbiAgICAgICAgY2VsbC5kYXRhc2V0LnBsYXllciA9IHBsYXllcjsgLy8gQXNzaWduIHBsYXllciBkYXRhIGF0dHJpYnV0ZSBmb3IgaWRlbnRpZmljYXRpb25cblxuICAgICAgICAvLyBBZGQgYW4gZXZlbnQgbGlzdGVuZXIgdG8gdGhlIGNlbGxcbiAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZ2FtZWJvYXJkQ2xpY2spO1xuXG4gICAgICAgIGdyaWREaXYuYXBwZW5kQ2hpbGQoY2VsbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQXBwZW5kIHRoZSBncmlkIHRvIHRoZSBjb250YWluZXJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZ3JpZERpdik7XG4gIH07XG5cbiAgY29uc3QgaW5pdENvbnNvbGVVSSA9ICgpID0+IHtcbiAgICBjb25zdCBjb25zb2xlQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlXCIpOyAvLyBHZXQgdGhlIGNvbnNvbGUgY29udGFpbmVyIGZyb20gdGhlIERPTVxuICAgIGNvbnNvbGVDb250YWluZXIuY2xhc3NMaXN0LmFkZChcbiAgICAgIFwiZmxleFwiLFxuICAgICAgXCJmbGV4LWNvbFwiLFxuICAgICAgXCJqdXN0aWZ5LWJldHdlZW5cIixcbiAgICAgIFwidGV4dC1zbVwiLFxuICAgICk7IC8vIFNldCBmbGV4Ym94IHJ1bGVzIGZvciBjb250YWluZXJcblxuICAgIC8vIENyZWF0ZSBhIGNvbnRhaW5lciBmb3IgdGhlIGlucHV0IGFuZCBidXR0b24gZWxlbWVudHNcbiAgICBjb25zdCBpbnB1dERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgaW5wdXREaXYuY2xhc3NOYW1lID0gXCJmbGV4IGZsZXgtcm93IHctZnVsbCBoLTEvNSBqdXN0aWZ5LWJldHdlZW5cIjsgLy8gU2V0IHRoZSBmbGV4Ym94IHJ1bGVzIGZvciB0aGUgY29udGFpbmVyXG5cbiAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTsgLy8gQ3JlYXRlIGFuIGlucHV0IGVsZW1lbnQgZm9yIHRoZSBjb25zb2xlXG4gICAgaW5wdXQudHlwZSA9IFwidGV4dFwiOyAvLyBTZXQgdGhlIGlucHV0IHR5cGUgb2YgdGhpcyBlbGVtZW50IHRvIHRleHRcbiAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNvbnNvbGUtaW5wdXRcIik7IC8vIFNldCB0aGUgaWQgZm9yIHRoaXMgZWxlbWVudCB0byBcImNvbnNvbGUtaW5wdXRcIlxuICAgIGlucHV0LmNsYXNzTmFtZSA9IFwicC0xIGJnLWdyYXktNDAwIGZsZXgtMVwiOyAvLyBBZGQgVGFpbHdpbmRDU1MgY2xhc3Nlc1xuICAgIGNvbnN0IHN1Ym1pdEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7IC8vIENyZWF0ZSBhIGJ1dHRvbiBlbGVtZW50IGZvciB0aGUgY29uc29sZSBzdWJtaXRcbiAgICBzdWJtaXRCdXR0b24udGV4dENvbnRlbnQgPSBcIlN1Ym1pdFwiOyAvLyBBZGQgdGhlIHRleHQgXCJTdWJtaXRcIiB0byB0aGUgYnV0dG9uXG4gICAgc3VibWl0QnV0dG9uLnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY29uc29sZS1zdWJtaXRcIik7IC8vIFNldCB0aGUgaWQgZm9yIHRoZSBidXR0b25cbiAgICBzdWJtaXRCdXR0b24uY2xhc3NOYW1lID0gXCJweC0zIHB5LTEgYmctZ3JheS04MDAgdGV4dC1jZW50ZXIgdGV4dC1zbVwiOyAvLyBBZGQgVGFpbHdpbmRDU1MgY2xhc3Nlc1xuICAgIGNvbnN0IG91dHB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7IC8vIENyZWF0ZSBhbiBkaXYgZWxlbWVudCBmb3IgdGhlIG91dHB1dCBvZiB0aGUgY29uc29sZVxuICAgIG91dHB1dC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNvbnNvbGUtb3V0cHV0XCIpOyAvLyBTZXQgdGhlIGlkIGZvciB0aGUgb3V0cHV0IGVsZW1lbnRcbiAgICBvdXRwdXQuY2xhc3NOYW1lID0gXCJwLTEgYmctZ3JheS0yMDAgZmxleC0xIGgtNC81IG92ZXJmbG93LWF1dG9cIjsgLy8gQWRkIFRhaWx3aW5kQ1NTIGNsYXNzZXNcblxuICAgIC8vIEFkZCB0aGUgaW5wdXQgZWxlbWVudHMgdG8gdGhlIGlucHV0IGNvbnRhaW5lclxuICAgIGlucHV0RGl2LmFwcGVuZENoaWxkKGlucHV0KTtcbiAgICBpbnB1dERpdi5hcHBlbmRDaGlsZChzdWJtaXRCdXR0b24pO1xuXG4gICAgLy8gQXBwZW5kIGVsZW1lbnRzIHRvIHRoZSBjb25zb2xlIGNvbnRhaW5lclxuICAgIGNvbnNvbGVDb250YWluZXIuYXBwZW5kQ2hpbGQob3V0cHV0KTtcbiAgICBjb25zb2xlQ29udGFpbmVyLmFwcGVuZENoaWxkKGlucHV0RGl2KTtcblxuICAgIC8vIFNldHVwIGV2ZW50IGxpc3RlbmVyc1xuICAgIHN1Ym1pdEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT5cbiAgICAgIGV4ZWN1dGVDb21tYW5kKGlucHV0LnZhbHVlLCBvdXRwdXQpLFxuICAgICk7XG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09IFwiRW50ZXJcIikge1xuICAgICAgICBleGVjdXRlQ29tbWFuZChpbnB1dC52YWx1ZSwgb3V0cHV0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBjb25zdCBkaXNwbGF5UHJvbXB0ID0gKHByb21wdE9ianMpID0+IHtcbiAgICAvLyBHZXQgdGhlIHByb21wdCBkaXNwbGF5XG4gICAgY29uc3QgZGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJvbXB0LWRpc3BsYXlcIik7XG5cbiAgICAvLyBDbGVhciB0aGUgZGlzcGxheSBvZiBhbGwgY2hpbGRyZW5cbiAgICB3aGlsZSAoZGlzcGxheS5maXJzdENoaWxkKSB7XG4gICAgICBkaXNwbGF5LnJlbW92ZUNoaWxkKGRpc3BsYXkuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgLy8gSXRlcmF0ZSBvdmVyIGVhY2ggcHJvbXB0IGluIHRoZSBwcm9tcHRzIG9iamVjdFxuICAgIE9iamVjdC5lbnRyaWVzKHByb21wdE9ianMpLmZvckVhY2goKFtrZXksIHsgcHJvbXB0LCBwcm9tcHRUeXBlIH1dKSA9PiB7XG4gICAgICAvLyBDcmVhdGUgYSBuZXcgZGl2IGZvciBlYWNoIHByb21wdFxuICAgICAgY29uc3QgcHJvbXB0RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIHByb21wdERpdi50ZXh0Q29udGVudCA9IHByb21wdDtcblxuICAgICAgLy8gQXBwbHkgc3R5bGluZyBiYXNlZCBvbiBwcm9tcHRUeXBlXG4gICAgICBzd2l0Y2ggKHByb21wdFR5cGUpIHtcbiAgICAgICAgY2FzZSBcImluc3RydWN0aW9uXCI6XG4gICAgICAgICAgcHJvbXB0RGl2LmNsYXNzTGlzdC5hZGQoXCJ0ZXh0LW9yYW5nZS01MDBcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgICAgIHByb21wdERpdi5jbGFzc0xpc3QuYWRkKFwidGV4dC1yZWQtNTAwXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHByb21wdERpdi5jbGFzc0xpc3QuYWRkKFwidGV4dC1ncmF5LTgwMFwiKTsgLy8gRGVmYXVsdCB0ZXh0IGNvbG9yXG4gICAgICB9XG5cbiAgICAgIC8vIEFwcGVuZCB0aGUgbmV3IGRpdiB0byB0aGUgZGlzcGxheSBjb250YWluZXJcbiAgICAgIGRpc3BsYXkuYXBwZW5kQ2hpbGQocHJvbXB0RGl2KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiBmb3IgcmVuZGVyaW5nIHNoaXBzIHRvIHRoZSBTaGlwIFN0YXR1cyBkaXNwbGF5IHNlY3Rpb25cbiAgY29uc3QgcmVuZGVyU2hpcERpc3AgPSAocGxheWVyT2JqKSA9PiB7XG4gICAgbGV0IGlkU2VsO1xuXG4gICAgLy8gU2V0IHRoZSBjb3JyZWN0IGlkIHNlbGVjdG9yIGZvciB0aGUgdHlwZSBvZiBwbGF5ZXJcbiAgICBpZiAocGxheWVyT2JqLnR5cGUgPT09IFwiaHVtYW5cIikge1xuICAgICAgaWRTZWwgPSBcImh1bWFuLXNoaXBzXCI7XG4gICAgfSBlbHNlIGlmIChwbGF5ZXJPYmoudHlwZSA9PT0gXCJjb21wdXRlclwiKSB7XG4gICAgICBpZFNlbCA9IFwiY29tcC1zaGlwc1wiO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcjtcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIGNvcnJlY3QgRE9NIGVsZW1lbnRcbiAgICBjb25zdCBkaXNwRGl2ID0gZG9jdW1lbnRcbiAgICAgIC5nZXRFbGVtZW50QnlJZChpZFNlbClcbiAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLnNoaXBzLWNvbnRhaW5lclwiKTtcblxuICAgIC8vIEZvciBlYWNoIG9mIHRoZSBwbGF5ZXIncyBzaGlwcywgcmVuZGVyIHRoZSBzaGlwIHRvIHRoZSBjb250YWluZXJcbiAgICBPYmplY3QudmFsdWVzKHBsYXllck9iai5nYW1lYm9hcmQuc2hpcHMpLmZvckVhY2goKHNoaXApID0+IHtcbiAgICAgIC8vIENyZWF0ZSBhIGRpdiBmb3IgdGhlIHNoaXBcbiAgICAgIGNvbnN0IHNoaXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgc2hpcERpdi5jbGFzc05hbWUgPSBcInB4LTQgcHktMiBmbGV4IGZsZXgtY29sIGdhcC0xXCI7XG5cbiAgICAgIC8vIEFkZCBhIHRpdGxlIHRoZSB0aGUgZGl2XG4gICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoMlwiKTtcbiAgICAgIHRpdGxlLnRleHRDb250ZW50ID0gc2hpcC50eXBlOyAvLyBTZXQgdGhlIHRpdGxlIHRvIHRoZSBzaGlwIHR5cGVcbiAgICAgIHNoaXBEaXYuYXBwZW5kQ2hpbGQodGl0bGUpO1xuXG4gICAgICAvLyBCdWlsZCB0aGUgc2hpcCBzZWN0aW9uc1xuICAgICAgY29uc3Qgc2hpcFNlY3RzID0gYnVpbGRTaGlwKHNoaXAsIGlkU2VsKTtcblxuICAgICAgLy8gQWRkIHRoZSBzaGlwIHNlY3Rpb25zIHRvIHRoZSBkaXZcbiAgICAgIGNvbnN0IHNlY3RzRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIHNlY3RzRGl2LmNsYXNzTmFtZSA9IFwiZmxleCBmbGV4LXJvdyBnYXAtMVwiO1xuICAgICAgc2hpcFNlY3RzLmZvckVhY2goKHNlY3QpID0+IHtcbiAgICAgICAgc2VjdHNEaXYuYXBwZW5kQ2hpbGQoc2VjdCk7XG4gICAgICB9KTtcbiAgICAgIHNoaXBEaXYuYXBwZW5kQ2hpbGQoc2VjdHNEaXYpO1xuXG4gICAgICBkaXNwRGl2LmFwcGVuZENoaWxkKHNoaXBEaXYpO1xuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgY3JlYXRlR2FtZWJvYXJkLFxuICAgIGluaXRDb25zb2xlVUksXG4gICAgZGlzcGxheVByb21wdCxcbiAgICByZW5kZXJTaGlwRGlzcCxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFVpTWFuYWdlcjtcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIGAvKlxuISB0YWlsd2luZGNzcyB2My40LjEgfCBNSVQgTGljZW5zZSB8IGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tXG4qLy8qXG4xLiBQcmV2ZW50IHBhZGRpbmcgYW5kIGJvcmRlciBmcm9tIGFmZmVjdGluZyBlbGVtZW50IHdpZHRoLiAoaHR0cHM6Ly9naXRodWIuY29tL21vemRldnMvY3NzcmVtZWR5L2lzc3Vlcy80KVxuMi4gQWxsb3cgYWRkaW5nIGEgYm9yZGVyIHRvIGFuIGVsZW1lbnQgYnkganVzdCBhZGRpbmcgYSBib3JkZXItd2lkdGguIChodHRwczovL2dpdGh1Yi5jb20vdGFpbHdpbmRjc3MvdGFpbHdpbmRjc3MvcHVsbC8xMTYpXG4qL1xuXG4qLFxuOjpiZWZvcmUsXG46OmFmdGVyIHtcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDsgLyogMSAqL1xuICBib3JkZXItd2lkdGg6IDA7IC8qIDIgKi9cbiAgYm9yZGVyLXN0eWxlOiBzb2xpZDsgLyogMiAqL1xuICBib3JkZXItY29sb3I6ICNlNWU3ZWI7IC8qIDIgKi9cbn1cblxuOjpiZWZvcmUsXG46OmFmdGVyIHtcbiAgLS10dy1jb250ZW50OiAnJztcbn1cblxuLypcbjEuIFVzZSBhIGNvbnNpc3RlbnQgc2Vuc2libGUgbGluZS1oZWlnaHQgaW4gYWxsIGJyb3dzZXJzLlxuMi4gUHJldmVudCBhZGp1c3RtZW50cyBvZiBmb250IHNpemUgYWZ0ZXIgb3JpZW50YXRpb24gY2hhbmdlcyBpbiBpT1MuXG4zLiBVc2UgYSBtb3JlIHJlYWRhYmxlIHRhYiBzaXplLlxuNC4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBzYW5zXFxgIGZvbnQtZmFtaWx5IGJ5IGRlZmF1bHQuXG41LiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYHNhbnNcXGAgZm9udC1mZWF0dXJlLXNldHRpbmdzIGJ5IGRlZmF1bHQuXG42LiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYHNhbnNcXGAgZm9udC12YXJpYXRpb24tc2V0dGluZ3MgYnkgZGVmYXVsdC5cbjcuIERpc2FibGUgdGFwIGhpZ2hsaWdodHMgb24gaU9TXG4qL1xuXG5odG1sLFxuOmhvc3Qge1xuICBsaW5lLWhlaWdodDogMS41OyAvKiAxICovXG4gIC13ZWJraXQtdGV4dC1zaXplLWFkanVzdDogMTAwJTsgLyogMiAqL1xuICAtbW96LXRhYi1zaXplOiA0OyAvKiAzICovXG4gIC1vLXRhYi1zaXplOiA0O1xuICAgICB0YWItc2l6ZTogNDsgLyogMyAqL1xuICBmb250LWZhbWlseTogdWktc2Fucy1zZXJpZiwgc3lzdGVtLXVpLCBzYW5zLXNlcmlmLCBcIkFwcGxlIENvbG9yIEVtb2ppXCIsIFwiU2Vnb2UgVUkgRW1vamlcIiwgXCJTZWdvZSBVSSBTeW1ib2xcIiwgXCJOb3RvIENvbG9yIEVtb2ppXCI7IC8qIDQgKi9cbiAgZm9udC1mZWF0dXJlLXNldHRpbmdzOiBub3JtYWw7IC8qIDUgKi9cbiAgZm9udC12YXJpYXRpb24tc2V0dGluZ3M6IG5vcm1hbDsgLyogNiAqL1xuICAtd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6IHRyYW5zcGFyZW50OyAvKiA3ICovXG59XG5cbi8qXG4xLiBSZW1vdmUgdGhlIG1hcmdpbiBpbiBhbGwgYnJvd3NlcnMuXG4yLiBJbmhlcml0IGxpbmUtaGVpZ2h0IGZyb20gXFxgaHRtbFxcYCBzbyB1c2VycyBjYW4gc2V0IHRoZW0gYXMgYSBjbGFzcyBkaXJlY3RseSBvbiB0aGUgXFxgaHRtbFxcYCBlbGVtZW50LlxuKi9cblxuYm9keSB7XG4gIG1hcmdpbjogMDsgLyogMSAqL1xuICBsaW5lLWhlaWdodDogaW5oZXJpdDsgLyogMiAqL1xufVxuXG4vKlxuMS4gQWRkIHRoZSBjb3JyZWN0IGhlaWdodCBpbiBGaXJlZm94LlxuMi4gQ29ycmVjdCB0aGUgaW5oZXJpdGFuY2Ugb2YgYm9yZGVyIGNvbG9yIGluIEZpcmVmb3guIChodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD0xOTA2NTUpXG4zLiBFbnN1cmUgaG9yaXpvbnRhbCBydWxlcyBhcmUgdmlzaWJsZSBieSBkZWZhdWx0LlxuKi9cblxuaHIge1xuICBoZWlnaHQ6IDA7IC8qIDEgKi9cbiAgY29sb3I6IGluaGVyaXQ7IC8qIDIgKi9cbiAgYm9yZGVyLXRvcC13aWR0aDogMXB4OyAvKiAzICovXG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgdGV4dCBkZWNvcmF0aW9uIGluIENocm9tZSwgRWRnZSwgYW5kIFNhZmFyaS5cbiovXG5cbmFiYnI6d2hlcmUoW3RpdGxlXSkge1xuICAtd2Via2l0LXRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lIGRvdHRlZDtcbiAgICAgICAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZSBkb3R0ZWQ7XG59XG5cbi8qXG5SZW1vdmUgdGhlIGRlZmF1bHQgZm9udCBzaXplIGFuZCB3ZWlnaHQgZm9yIGhlYWRpbmdzLlxuKi9cblxuaDEsXG5oMixcbmgzLFxuaDQsXG5oNSxcbmg2IHtcbiAgZm9udC1zaXplOiBpbmhlcml0O1xuICBmb250LXdlaWdodDogaW5oZXJpdDtcbn1cblxuLypcblJlc2V0IGxpbmtzIHRvIG9wdGltaXplIGZvciBvcHQtaW4gc3R5bGluZyBpbnN0ZWFkIG9mIG9wdC1vdXQuXG4qL1xuXG5hIHtcbiAgY29sb3I6IGluaGVyaXQ7XG4gIHRleHQtZGVjb3JhdGlvbjogaW5oZXJpdDtcbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCBmb250IHdlaWdodCBpbiBFZGdlIGFuZCBTYWZhcmkuXG4qL1xuXG5iLFxuc3Ryb25nIHtcbiAgZm9udC13ZWlnaHQ6IGJvbGRlcjtcbn1cblxuLypcbjEuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgbW9ub1xcYCBmb250LWZhbWlseSBieSBkZWZhdWx0LlxuMi4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBtb25vXFxgIGZvbnQtZmVhdHVyZS1zZXR0aW5ncyBieSBkZWZhdWx0LlxuMy4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBtb25vXFxgIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzIGJ5IGRlZmF1bHQuXG40LiBDb3JyZWN0IHRoZSBvZGQgXFxgZW1cXGAgZm9udCBzaXppbmcgaW4gYWxsIGJyb3dzZXJzLlxuKi9cblxuY29kZSxcbmtiZCxcbnNhbXAsXG5wcmUge1xuICBmb250LWZhbWlseTogdWktbW9ub3NwYWNlLCBTRk1vbm8tUmVndWxhciwgTWVubG8sIE1vbmFjbywgQ29uc29sYXMsIFwiTGliZXJhdGlvbiBNb25vXCIsIFwiQ291cmllciBOZXdcIiwgbW9ub3NwYWNlOyAvKiAxICovXG4gIGZvbnQtZmVhdHVyZS1zZXR0aW5nczogbm9ybWFsOyAvKiAyICovXG4gIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzOiBub3JtYWw7IC8qIDMgKi9cbiAgZm9udC1zaXplOiAxZW07IC8qIDQgKi9cbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCBmb250IHNpemUgaW4gYWxsIGJyb3dzZXJzLlxuKi9cblxuc21hbGwge1xuICBmb250LXNpemU6IDgwJTtcbn1cblxuLypcblByZXZlbnQgXFxgc3ViXFxgIGFuZCBcXGBzdXBcXGAgZWxlbWVudHMgZnJvbSBhZmZlY3RpbmcgdGhlIGxpbmUgaGVpZ2h0IGluIGFsbCBicm93c2Vycy5cbiovXG5cbnN1YixcbnN1cCB7XG4gIGZvbnQtc2l6ZTogNzUlO1xuICBsaW5lLWhlaWdodDogMDtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XG59XG5cbnN1YiB7XG4gIGJvdHRvbTogLTAuMjVlbTtcbn1cblxuc3VwIHtcbiAgdG9wOiAtMC41ZW07XG59XG5cbi8qXG4xLiBSZW1vdmUgdGV4dCBpbmRlbnRhdGlvbiBmcm9tIHRhYmxlIGNvbnRlbnRzIGluIENocm9tZSBhbmQgU2FmYXJpLiAoaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9OTk5MDg4LCBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjAxMjk3KVxuMi4gQ29ycmVjdCB0YWJsZSBib3JkZXIgY29sb3IgaW5oZXJpdGFuY2UgaW4gYWxsIENocm9tZSBhbmQgU2FmYXJpLiAoaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9OTM1NzI5LCBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTk1MDE2KVxuMy4gUmVtb3ZlIGdhcHMgYmV0d2VlbiB0YWJsZSBib3JkZXJzIGJ5IGRlZmF1bHQuXG4qL1xuXG50YWJsZSB7XG4gIHRleHQtaW5kZW50OiAwOyAvKiAxICovXG4gIGJvcmRlci1jb2xvcjogaW5oZXJpdDsgLyogMiAqL1xuICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyAvKiAzICovXG59XG5cbi8qXG4xLiBDaGFuZ2UgdGhlIGZvbnQgc3R5bGVzIGluIGFsbCBicm93c2Vycy5cbjIuIFJlbW92ZSB0aGUgbWFyZ2luIGluIEZpcmVmb3ggYW5kIFNhZmFyaS5cbjMuIFJlbW92ZSBkZWZhdWx0IHBhZGRpbmcgaW4gYWxsIGJyb3dzZXJzLlxuKi9cblxuYnV0dG9uLFxuaW5wdXQsXG5vcHRncm91cCxcbnNlbGVjdCxcbnRleHRhcmVhIHtcbiAgZm9udC1mYW1pbHk6IGluaGVyaXQ7IC8qIDEgKi9cbiAgZm9udC1mZWF0dXJlLXNldHRpbmdzOiBpbmhlcml0OyAvKiAxICovXG4gIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzOiBpbmhlcml0OyAvKiAxICovXG4gIGZvbnQtc2l6ZTogMTAwJTsgLyogMSAqL1xuICBmb250LXdlaWdodDogaW5oZXJpdDsgLyogMSAqL1xuICBsaW5lLWhlaWdodDogaW5oZXJpdDsgLyogMSAqL1xuICBjb2xvcjogaW5oZXJpdDsgLyogMSAqL1xuICBtYXJnaW46IDA7IC8qIDIgKi9cbiAgcGFkZGluZzogMDsgLyogMyAqL1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBpbmhlcml0YW5jZSBvZiB0ZXh0IHRyYW5zZm9ybSBpbiBFZGdlIGFuZCBGaXJlZm94LlxuKi9cblxuYnV0dG9uLFxuc2VsZWN0IHtcbiAgdGV4dC10cmFuc2Zvcm06IG5vbmU7XG59XG5cbi8qXG4xLiBDb3JyZWN0IHRoZSBpbmFiaWxpdHkgdG8gc3R5bGUgY2xpY2thYmxlIHR5cGVzIGluIGlPUyBhbmQgU2FmYXJpLlxuMi4gUmVtb3ZlIGRlZmF1bHQgYnV0dG9uIHN0eWxlcy5cbiovXG5cbmJ1dHRvbixcblt0eXBlPSdidXR0b24nXSxcblt0eXBlPSdyZXNldCddLFxuW3R5cGU9J3N1Ym1pdCddIHtcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiBidXR0b247IC8qIDEgKi9cbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7IC8qIDIgKi9cbiAgYmFja2dyb3VuZC1pbWFnZTogbm9uZTsgLyogMiAqL1xufVxuXG4vKlxuVXNlIHRoZSBtb2Rlcm4gRmlyZWZveCBmb2N1cyBzdHlsZSBmb3IgYWxsIGZvY3VzYWJsZSBlbGVtZW50cy5cbiovXG5cbjotbW96LWZvY3VzcmluZyB7XG4gIG91dGxpbmU6IGF1dG87XG59XG5cbi8qXG5SZW1vdmUgdGhlIGFkZGl0aW9uYWwgXFxgOmludmFsaWRcXGAgc3R5bGVzIGluIEZpcmVmb3guIChodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9nZWNrby1kZXYvYmxvYi8yZjllYWNkOWQzZDk5NWM5MzdiNDI1MWE1NTU3ZDk1ZDQ5NGM5YmUxL2xheW91dC9zdHlsZS9yZXMvZm9ybXMuY3NzI0w3MjgtTDczNylcbiovXG5cbjotbW96LXVpLWludmFsaWQge1xuICBib3gtc2hhZG93OiBub25lO1xufVxuXG4vKlxuQWRkIHRoZSBjb3JyZWN0IHZlcnRpY2FsIGFsaWdubWVudCBpbiBDaHJvbWUgYW5kIEZpcmVmb3guXG4qL1xuXG5wcm9ncmVzcyB7XG4gIHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTtcbn1cblxuLypcbkNvcnJlY3QgdGhlIGN1cnNvciBzdHlsZSBvZiBpbmNyZW1lbnQgYW5kIGRlY3JlbWVudCBidXR0b25zIGluIFNhZmFyaS5cbiovXG5cbjo6LXdlYmtpdC1pbm5lci1zcGluLWJ1dHRvbixcbjo6LXdlYmtpdC1vdXRlci1zcGluLWJ1dHRvbiB7XG4gIGhlaWdodDogYXV0bztcbn1cblxuLypcbjEuIENvcnJlY3QgdGhlIG9kZCBhcHBlYXJhbmNlIGluIENocm9tZSBhbmQgU2FmYXJpLlxuMi4gQ29ycmVjdCB0aGUgb3V0bGluZSBzdHlsZSBpbiBTYWZhcmkuXG4qL1xuXG5bdHlwZT0nc2VhcmNoJ10ge1xuICAtd2Via2l0LWFwcGVhcmFuY2U6IHRleHRmaWVsZDsgLyogMSAqL1xuICBvdXRsaW5lLW9mZnNldDogLTJweDsgLyogMiAqL1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBpbm5lciBwYWRkaW5nIGluIENocm9tZSBhbmQgU2FmYXJpIG9uIG1hY09TLlxuKi9cblxuOjotd2Via2l0LXNlYXJjaC1kZWNvcmF0aW9uIHtcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xufVxuXG4vKlxuMS4gQ29ycmVjdCB0aGUgaW5hYmlsaXR5IHRvIHN0eWxlIGNsaWNrYWJsZSB0eXBlcyBpbiBpT1MgYW5kIFNhZmFyaS5cbjIuIENoYW5nZSBmb250IHByb3BlcnRpZXMgdG8gXFxgaW5oZXJpdFxcYCBpbiBTYWZhcmkuXG4qL1xuXG46Oi13ZWJraXQtZmlsZS11cGxvYWQtYnV0dG9uIHtcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiBidXR0b247IC8qIDEgKi9cbiAgZm9udDogaW5oZXJpdDsgLyogMiAqL1xufVxuXG4vKlxuQWRkIHRoZSBjb3JyZWN0IGRpc3BsYXkgaW4gQ2hyb21lIGFuZCBTYWZhcmkuXG4qL1xuXG5zdW1tYXJ5IHtcbiAgZGlzcGxheTogbGlzdC1pdGVtO1xufVxuXG4vKlxuUmVtb3ZlcyB0aGUgZGVmYXVsdCBzcGFjaW5nIGFuZCBib3JkZXIgZm9yIGFwcHJvcHJpYXRlIGVsZW1lbnRzLlxuKi9cblxuYmxvY2txdW90ZSxcbmRsLFxuZGQsXG5oMSxcbmgyLFxuaDMsXG5oNCxcbmg1LFxuaDYsXG5ocixcbmZpZ3VyZSxcbnAsXG5wcmUge1xuICBtYXJnaW46IDA7XG59XG5cbmZpZWxkc2V0IHtcbiAgbWFyZ2luOiAwO1xuICBwYWRkaW5nOiAwO1xufVxuXG5sZWdlbmQge1xuICBwYWRkaW5nOiAwO1xufVxuXG5vbCxcbnVsLFxubWVudSB7XG4gIGxpc3Qtc3R5bGU6IG5vbmU7XG4gIG1hcmdpbjogMDtcbiAgcGFkZGluZzogMDtcbn1cblxuLypcblJlc2V0IGRlZmF1bHQgc3R5bGluZyBmb3IgZGlhbG9ncy5cbiovXG5kaWFsb2cge1xuICBwYWRkaW5nOiAwO1xufVxuXG4vKlxuUHJldmVudCByZXNpemluZyB0ZXh0YXJlYXMgaG9yaXpvbnRhbGx5IGJ5IGRlZmF1bHQuXG4qL1xuXG50ZXh0YXJlYSB7XG4gIHJlc2l6ZTogdmVydGljYWw7XG59XG5cbi8qXG4xLiBSZXNldCB0aGUgZGVmYXVsdCBwbGFjZWhvbGRlciBvcGFjaXR5IGluIEZpcmVmb3guIChodHRwczovL2dpdGh1Yi5jb20vdGFpbHdpbmRsYWJzL3RhaWx3aW5kY3NzL2lzc3Vlcy8zMzAwKVxuMi4gU2V0IHRoZSBkZWZhdWx0IHBsYWNlaG9sZGVyIGNvbG9yIHRvIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBncmF5IDQwMCBjb2xvci5cbiovXG5cbmlucHV0OjotbW96LXBsYWNlaG9sZGVyLCB0ZXh0YXJlYTo6LW1vei1wbGFjZWhvbGRlciB7XG4gIG9wYWNpdHk6IDE7IC8qIDEgKi9cbiAgY29sb3I6ICM5Y2EzYWY7IC8qIDIgKi9cbn1cblxuaW5wdXQ6OnBsYWNlaG9sZGVyLFxudGV4dGFyZWE6OnBsYWNlaG9sZGVyIHtcbiAgb3BhY2l0eTogMTsgLyogMSAqL1xuICBjb2xvcjogIzljYTNhZjsgLyogMiAqL1xufVxuXG4vKlxuU2V0IHRoZSBkZWZhdWx0IGN1cnNvciBmb3IgYnV0dG9ucy5cbiovXG5cbmJ1dHRvbixcbltyb2xlPVwiYnV0dG9uXCJdIHtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuXG4vKlxuTWFrZSBzdXJlIGRpc2FibGVkIGJ1dHRvbnMgZG9uJ3QgZ2V0IHRoZSBwb2ludGVyIGN1cnNvci5cbiovXG46ZGlzYWJsZWQge1xuICBjdXJzb3I6IGRlZmF1bHQ7XG59XG5cbi8qXG4xLiBNYWtlIHJlcGxhY2VkIGVsZW1lbnRzIFxcYGRpc3BsYXk6IGJsb2NrXFxgIGJ5IGRlZmF1bHQuIChodHRwczovL2dpdGh1Yi5jb20vbW96ZGV2cy9jc3NyZW1lZHkvaXNzdWVzLzE0KVxuMi4gQWRkIFxcYHZlcnRpY2FsLWFsaWduOiBtaWRkbGVcXGAgdG8gYWxpZ24gcmVwbGFjZWQgZWxlbWVudHMgbW9yZSBzZW5zaWJseSBieSBkZWZhdWx0LiAoaHR0cHM6Ly9naXRodWIuY29tL2plbnNpbW1vbnMvY3NzcmVtZWR5L2lzc3Vlcy8xNCNpc3N1ZWNvbW1lbnQtNjM0OTM0MjEwKVxuICAgVGhpcyBjYW4gdHJpZ2dlciBhIHBvb3JseSBjb25zaWRlcmVkIGxpbnQgZXJyb3IgaW4gc29tZSB0b29scyBidXQgaXMgaW5jbHVkZWQgYnkgZGVzaWduLlxuKi9cblxuaW1nLFxuc3ZnLFxudmlkZW8sXG5jYW52YXMsXG5hdWRpbyxcbmlmcmFtZSxcbmVtYmVkLFxub2JqZWN0IHtcbiAgZGlzcGxheTogYmxvY2s7IC8qIDEgKi9cbiAgdmVydGljYWwtYWxpZ246IG1pZGRsZTsgLyogMiAqL1xufVxuXG4vKlxuQ29uc3RyYWluIGltYWdlcyBhbmQgdmlkZW9zIHRvIHRoZSBwYXJlbnQgd2lkdGggYW5kIHByZXNlcnZlIHRoZWlyIGludHJpbnNpYyBhc3BlY3QgcmF0aW8uIChodHRwczovL2dpdGh1Yi5jb20vbW96ZGV2cy9jc3NyZW1lZHkvaXNzdWVzLzE0KVxuKi9cblxuaW1nLFxudmlkZW8ge1xuICBtYXgtd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogYXV0bztcbn1cblxuLyogTWFrZSBlbGVtZW50cyB3aXRoIHRoZSBIVE1MIGhpZGRlbiBhdHRyaWJ1dGUgc3RheSBoaWRkZW4gYnkgZGVmYXVsdCAqL1xuW2hpZGRlbl0ge1xuICBkaXNwbGF5OiBub25lO1xufVxuXG4qLCA6OmJlZm9yZSwgOjphZnRlciB7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteDogMDtcbiAgLS10dy1ib3JkZXItc3BhY2luZy15OiAwO1xuICAtLXR3LXRyYW5zbGF0ZS14OiAwO1xuICAtLXR3LXRyYW5zbGF0ZS15OiAwO1xuICAtLXR3LXJvdGF0ZTogMDtcbiAgLS10dy1za2V3LXg6IDA7XG4gIC0tdHctc2tldy15OiAwO1xuICAtLXR3LXNjYWxlLXg6IDE7XG4gIC0tdHctc2NhbGUteTogMTtcbiAgLS10dy1wYW4teDogIDtcbiAgLS10dy1wYW4teTogIDtcbiAgLS10dy1waW5jaC16b29tOiAgO1xuICAtLXR3LXNjcm9sbC1zbmFwLXN0cmljdG5lc3M6IHByb3hpbWl0eTtcbiAgLS10dy1ncmFkaWVudC1mcm9tLXBvc2l0aW9uOiAgO1xuICAtLXR3LWdyYWRpZW50LXZpYS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC10by1wb3NpdGlvbjogIDtcbiAgLS10dy1vcmRpbmFsOiAgO1xuICAtLXR3LXNsYXNoZWQtemVybzogIDtcbiAgLS10dy1udW1lcmljLWZpZ3VyZTogIDtcbiAgLS10dy1udW1lcmljLXNwYWNpbmc6ICA7XG4gIC0tdHctbnVtZXJpYy1mcmFjdGlvbjogIDtcbiAgLS10dy1yaW5nLWluc2V0OiAgO1xuICAtLXR3LXJpbmctb2Zmc2V0LXdpZHRoOiAwcHg7XG4gIC0tdHctcmluZy1vZmZzZXQtY29sb3I6ICNmZmY7XG4gIC0tdHctcmluZy1jb2xvcjogcmdiKDU5IDEzMCAyNDYgLyAwLjUpO1xuICAtLXR3LXJpbmctb2Zmc2V0LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXJpbmctc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctc2hhZG93LWNvbG9yZWQ6IDAgMCAjMDAwMDtcbiAgLS10dy1ibHVyOiAgO1xuICAtLXR3LWJyaWdodG5lc3M6ICA7XG4gIC0tdHctY29udHJhc3Q6ICA7XG4gIC0tdHctZ3JheXNjYWxlOiAgO1xuICAtLXR3LWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctaW52ZXJ0OiAgO1xuICAtLXR3LXNhdHVyYXRlOiAgO1xuICAtLXR3LXNlcGlhOiAgO1xuICAtLXR3LWRyb3Atc2hhZG93OiAgO1xuICAtLXR3LWJhY2tkcm9wLWJsdXI6ICA7XG4gIC0tdHctYmFja2Ryb3AtYnJpZ2h0bmVzczogIDtcbiAgLS10dy1iYWNrZHJvcC1jb250cmFzdDogIDtcbiAgLS10dy1iYWNrZHJvcC1ncmF5c2NhbGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaHVlLXJvdGF0ZTogIDtcbiAgLS10dy1iYWNrZHJvcC1pbnZlcnQ6ICA7XG4gIC0tdHctYmFja2Ryb3Atb3BhY2l0eTogIDtcbiAgLS10dy1iYWNrZHJvcC1zYXR1cmF0ZTogIDtcbiAgLS10dy1iYWNrZHJvcC1zZXBpYTogIDtcbn1cblxuOjpiYWNrZHJvcCB7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteDogMDtcbiAgLS10dy1ib3JkZXItc3BhY2luZy15OiAwO1xuICAtLXR3LXRyYW5zbGF0ZS14OiAwO1xuICAtLXR3LXRyYW5zbGF0ZS15OiAwO1xuICAtLXR3LXJvdGF0ZTogMDtcbiAgLS10dy1za2V3LXg6IDA7XG4gIC0tdHctc2tldy15OiAwO1xuICAtLXR3LXNjYWxlLXg6IDE7XG4gIC0tdHctc2NhbGUteTogMTtcbiAgLS10dy1wYW4teDogIDtcbiAgLS10dy1wYW4teTogIDtcbiAgLS10dy1waW5jaC16b29tOiAgO1xuICAtLXR3LXNjcm9sbC1zbmFwLXN0cmljdG5lc3M6IHByb3hpbWl0eTtcbiAgLS10dy1ncmFkaWVudC1mcm9tLXBvc2l0aW9uOiAgO1xuICAtLXR3LWdyYWRpZW50LXZpYS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC10by1wb3NpdGlvbjogIDtcbiAgLS10dy1vcmRpbmFsOiAgO1xuICAtLXR3LXNsYXNoZWQtemVybzogIDtcbiAgLS10dy1udW1lcmljLWZpZ3VyZTogIDtcbiAgLS10dy1udW1lcmljLXNwYWNpbmc6ICA7XG4gIC0tdHctbnVtZXJpYy1mcmFjdGlvbjogIDtcbiAgLS10dy1yaW5nLWluc2V0OiAgO1xuICAtLXR3LXJpbmctb2Zmc2V0LXdpZHRoOiAwcHg7XG4gIC0tdHctcmluZy1vZmZzZXQtY29sb3I6ICNmZmY7XG4gIC0tdHctcmluZy1jb2xvcjogcmdiKDU5IDEzMCAyNDYgLyAwLjUpO1xuICAtLXR3LXJpbmctb2Zmc2V0LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXJpbmctc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctc2hhZG93LWNvbG9yZWQ6IDAgMCAjMDAwMDtcbiAgLS10dy1ibHVyOiAgO1xuICAtLXR3LWJyaWdodG5lc3M6ICA7XG4gIC0tdHctY29udHJhc3Q6ICA7XG4gIC0tdHctZ3JheXNjYWxlOiAgO1xuICAtLXR3LWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctaW52ZXJ0OiAgO1xuICAtLXR3LXNhdHVyYXRlOiAgO1xuICAtLXR3LXNlcGlhOiAgO1xuICAtLXR3LWRyb3Atc2hhZG93OiAgO1xuICAtLXR3LWJhY2tkcm9wLWJsdXI6ICA7XG4gIC0tdHctYmFja2Ryb3AtYnJpZ2h0bmVzczogIDtcbiAgLS10dy1iYWNrZHJvcC1jb250cmFzdDogIDtcbiAgLS10dy1iYWNrZHJvcC1ncmF5c2NhbGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaHVlLXJvdGF0ZTogIDtcbiAgLS10dy1iYWNrZHJvcC1pbnZlcnQ6ICA7XG4gIC0tdHctYmFja2Ryb3Atb3BhY2l0eTogIDtcbiAgLS10dy1iYWNrZHJvcC1zYXR1cmF0ZTogIDtcbiAgLS10dy1iYWNrZHJvcC1zZXBpYTogIDtcbn1cbi5jb250YWluZXIge1xuICB3aWR0aDogMTAwJTtcbn1cbkBtZWRpYSAobWluLXdpZHRoOiA2NDBweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogNjQwcHg7XG4gIH1cbn1cbkBtZWRpYSAobWluLXdpZHRoOiA3NjhweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogNzY4cHg7XG4gIH1cbn1cbkBtZWRpYSAobWluLXdpZHRoOiAxMDI0cHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDEwMjRweDtcbiAgfVxufVxuQG1lZGlhIChtaW4td2lkdGg6IDEyODBweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogMTI4MHB4O1xuICB9XG59XG5AbWVkaWEgKG1pbi13aWR0aDogMTUzNnB4KSB7XG5cbiAgLmNvbnRhaW5lciB7XG4gICAgbWF4LXdpZHRoOiAxNTM2cHg7XG4gIH1cbn1cbi52aXNpYmxlIHtcbiAgdmlzaWJpbGl0eTogdmlzaWJsZTtcbn1cbi5jb2xsYXBzZSB7XG4gIHZpc2liaWxpdHk6IGNvbGxhcHNlO1xufVxuLnJlbGF0aXZlIHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xufVxuLm0tNSB7XG4gIG1hcmdpbjogMS4yNXJlbTtcbn1cbi5tLTgge1xuICBtYXJnaW46IDJyZW07XG59XG4ubWwtMTAge1xuICBtYXJnaW4tbGVmdDogMi41cmVtO1xufVxuLm1sLTgge1xuICBtYXJnaW4tbGVmdDogMnJlbTtcbn1cbi5ibG9jayB7XG4gIGRpc3BsYXk6IGJsb2NrO1xufVxuLmZsZXgge1xuICBkaXNwbGF5OiBmbGV4O1xufVxuLnRhYmxlIHtcbiAgZGlzcGxheTogdGFibGU7XG59XG4uZ3JpZCB7XG4gIGRpc3BsYXk6IGdyaWQ7XG59XG4uY29udGVudHMge1xuICBkaXNwbGF5OiBjb250ZW50cztcbn1cbi5oaWRkZW4ge1xuICBkaXNwbGF5OiBub25lO1xufVxuLmgtMSB7XG4gIGhlaWdodDogMC4yNXJlbTtcbn1cbi5oLTFcXFxcLzUge1xuICBoZWlnaHQ6IDIwJTtcbn1cbi5oLTQge1xuICBoZWlnaHQ6IDFyZW07XG59XG4uaC00XFxcXC81IHtcbiAgaGVpZ2h0OiA4MCU7XG59XG4uaC00MCB7XG4gIGhlaWdodDogMTByZW07XG59XG4uaC02IHtcbiAgaGVpZ2h0OiAxLjVyZW07XG59XG4uaC1tYXgge1xuICBoZWlnaHQ6IC1tb3otbWF4LWNvbnRlbnQ7XG4gIGhlaWdodDogbWF4LWNvbnRlbnQ7XG59XG4udy0xIHtcbiAgd2lkdGg6IDAuMjVyZW07XG59XG4udy0xXFxcXC8yIHtcbiAgd2lkdGg6IDUwJTtcbn1cbi53LTQge1xuICB3aWR0aDogMXJlbTtcbn1cbi53LTRcXFxcLzEyIHtcbiAgd2lkdGg6IDMzLjMzMzMzMyU7XG59XG4udy02IHtcbiAgd2lkdGg6IDEuNXJlbTtcbn1cbi53LWF1dG8ge1xuICB3aWR0aDogYXV0bztcbn1cbi53LWZ1bGwge1xuICB3aWR0aDogMTAwJTtcbn1cbi5taW4tdy00NCB7XG4gIG1pbi13aWR0aDogMTFyZW07XG59XG4ubWluLXctbWF4IHtcbiAgbWluLXdpZHRoOiAtbW96LW1heC1jb250ZW50O1xuICBtaW4td2lkdGg6IG1heC1jb250ZW50O1xufVxuLm1pbi13LW1pbiB7XG4gIG1pbi13aWR0aDogLW1vei1taW4tY29udGVudDtcbiAgbWluLXdpZHRoOiBtaW4tY29udGVudDtcbn1cbi5mbGV4LTEge1xuICBmbGV4OiAxIDEgMCU7XG59XG4uZmxleC1ub25lIHtcbiAgZmxleDogbm9uZTtcbn1cbi5ib3JkZXItY29sbGFwc2Uge1xuICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlO1xufVxuLnRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKHZhcigtLXR3LXRyYW5zbGF0ZS14KSwgdmFyKC0tdHctdHJhbnNsYXRlLXkpKSByb3RhdGUodmFyKC0tdHctcm90YXRlKSkgc2tld1godmFyKC0tdHctc2tldy14KSkgc2tld1kodmFyKC0tdHctc2tldy15KSkgc2NhbGVYKHZhcigtLXR3LXNjYWxlLXgpKSBzY2FsZVkodmFyKC0tdHctc2NhbGUteSkpO1xufVxuLmN1cnNvci1oZWxwIHtcbiAgY3Vyc29yOiBoZWxwO1xufVxuLmN1cnNvci1wb2ludGVyIHtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmN1cnNvci10ZXh0IHtcbiAgY3Vyc29yOiB0ZXh0O1xufVxuLnJlc2l6ZSB7XG4gIHJlc2l6ZTogYm90aDtcbn1cbi5hdXRvLXJvd3MtbWluIHtcbiAgZ3JpZC1hdXRvLXJvd3M6IG1pbi1jb250ZW50O1xufVxuLmdyaWQtY29scy0xMSB7XG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDExLCBtaW5tYXgoMCwgMWZyKSk7XG59XG4uZmxleC1yb3cge1xuICBmbGV4LWRpcmVjdGlvbjogcm93O1xufVxuLmZsZXgtY29sIHtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbn1cbi5qdXN0aWZ5LXN0YXJ0IHtcbiAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0O1xufVxuLmp1c3RpZnktY2VudGVyIHtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG59XG4uanVzdGlmeS1iZXR3ZWVuIHtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xufVxuLmp1c3RpZnktYXJvdW5kIHtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1hcm91bmQ7XG59XG4uZ2FwLTEge1xuICBnYXA6IDAuMjVyZW07XG59XG4uZ2FwLTEwIHtcbiAgZ2FwOiAyLjVyZW07XG59XG4uZ2FwLTIge1xuICBnYXA6IDAuNXJlbTtcbn1cbi5nYXAtNiB7XG4gIGdhcDogMS41cmVtO1xufVxuLm92ZXJmbG93LWF1dG8ge1xuICBvdmVyZmxvdzogYXV0bztcbn1cbi5yb3VuZGVkLWZ1bGwge1xuICBib3JkZXItcmFkaXVzOiA5OTk5cHg7XG59XG4ucm91bmRlZC14bCB7XG4gIGJvcmRlci1yYWRpdXM6IDAuNzVyZW07XG59XG4uYm9yZGVyIHtcbiAgYm9yZGVyLXdpZHRoOiAxcHg7XG59XG4uYm9yZGVyLXNvbGlkIHtcbiAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcbn1cbi5ib3JkZXItYmx1ZS04MDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigzMCA2NCAxNzUgLyB2YXIoLS10dy1ib3JkZXItb3BhY2l0eSkpO1xufVxuLmJvcmRlci1ncmF5LTgwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDMxIDQxIDU1IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItZ3JlZW4tNjAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMjIgMTYzIDc0IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItb3JhbmdlLTQwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDI1MSAxNDYgNjAgLyB2YXIoLS10dy1ib3JkZXItb3BhY2l0eSkpO1xufVxuLmJvcmRlci1yZWQtNzAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMTg1IDI4IDI4IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5iZy1ncmF5LTIwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDIyOSAyMzEgMjM1IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWdyYXktNDAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTU2IDE2MyAxNzUgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS04MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigzMSA0MSA1NSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5wLTEge1xuICBwYWRkaW5nOiAwLjI1cmVtO1xufVxuLnAtMiB7XG4gIHBhZGRpbmc6IDAuNXJlbTtcbn1cbi5wLTQge1xuICBwYWRkaW5nOiAxcmVtO1xufVxuLnAtNiB7XG4gIHBhZGRpbmc6IDEuNXJlbTtcbn1cbi5weC0zIHtcbiAgcGFkZGluZy1sZWZ0OiAwLjc1cmVtO1xuICBwYWRkaW5nLXJpZ2h0OiAwLjc1cmVtO1xufVxuLnB4LTQge1xuICBwYWRkaW5nLWxlZnQ6IDFyZW07XG4gIHBhZGRpbmctcmlnaHQ6IDFyZW07XG59XG4ucHgtNiB7XG4gIHBhZGRpbmctbGVmdDogMS41cmVtO1xuICBwYWRkaW5nLXJpZ2h0OiAxLjVyZW07XG59XG4ucHktMSB7XG4gIHBhZGRpbmctdG9wOiAwLjI1cmVtO1xuICBwYWRkaW5nLWJvdHRvbTogMC4yNXJlbTtcbn1cbi5weS0yIHtcbiAgcGFkZGluZy10b3A6IDAuNXJlbTtcbiAgcGFkZGluZy1ib3R0b206IDAuNXJlbTtcbn1cbi5weS00IHtcbiAgcGFkZGluZy10b3A6IDFyZW07XG4gIHBhZGRpbmctYm90dG9tOiAxcmVtO1xufVxuLnBsLTIge1xuICBwYWRkaW5nLWxlZnQ6IDAuNXJlbTtcbn1cbi5wbC01IHtcbiAgcGFkZGluZy1sZWZ0OiAxLjI1cmVtO1xufVxuLnBsLTgge1xuICBwYWRkaW5nLWxlZnQ6IDJyZW07XG59XG4udGV4dC1jZW50ZXIge1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG59XG4udGV4dC1zbSB7XG4gIGZvbnQtc2l6ZTogMC44NzVyZW07XG4gIGxpbmUtaGVpZ2h0OiAxLjI1cmVtO1xufVxuLnRleHQtZ3JheS04MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigzMSA0MSA1NSAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtb3JhbmdlLTUwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDI0OSAxMTUgMjIgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXJlZC01MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigyMzkgNjggNjggLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXRlYWwtOTAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTkgNzggNzQgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi51bmRlcmxpbmUge1xuICB0ZXh0LWRlY29yYXRpb24tbGluZTogdW5kZXJsaW5lO1xufVxuLm91dGxpbmUge1xuICBvdXRsaW5lLXN0eWxlOiBzb2xpZDtcbn1cbi5maWx0ZXIge1xuICBmaWx0ZXI6IHZhcigtLXR3LWJsdXIpIHZhcigtLXR3LWJyaWdodG5lc3MpIHZhcigtLXR3LWNvbnRyYXN0KSB2YXIoLS10dy1ncmF5c2NhbGUpIHZhcigtLXR3LWh1ZS1yb3RhdGUpIHZhcigtLXR3LWludmVydCkgdmFyKC0tdHctc2F0dXJhdGUpIHZhcigtLXR3LXNlcGlhKSB2YXIoLS10dy1kcm9wLXNoYWRvdyk7XG59XG4uaG92ZXJcXFxcOmJnLW9yYW5nZS01MDA6aG92ZXIge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyNDkgMTE1IDIyIC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufWAsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL3N0eWxlcy5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUE7O0NBQWMsQ0FBZDs7O0NBQWM7O0FBQWQ7OztFQUFBLHNCQUFjLEVBQWQsTUFBYztFQUFkLGVBQWMsRUFBZCxNQUFjO0VBQWQsbUJBQWMsRUFBZCxNQUFjO0VBQWQscUJBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7O0VBQUEsZ0JBQWM7QUFBQTs7QUFBZDs7Ozs7Ozs7Q0FBYzs7QUFBZDs7RUFBQSxnQkFBYyxFQUFkLE1BQWM7RUFBZCw4QkFBYyxFQUFkLE1BQWM7RUFBZCxnQkFBYyxFQUFkLE1BQWM7RUFBZCxjQUFjO0tBQWQsV0FBYyxFQUFkLE1BQWM7RUFBZCwrSEFBYyxFQUFkLE1BQWM7RUFBZCw2QkFBYyxFQUFkLE1BQWM7RUFBZCwrQkFBYyxFQUFkLE1BQWM7RUFBZCx3Q0FBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7O0NBQWM7O0FBQWQ7RUFBQSxTQUFjLEVBQWQsTUFBYztFQUFkLG9CQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOzs7O0NBQWM7O0FBQWQ7RUFBQSxTQUFjLEVBQWQsTUFBYztFQUFkLGNBQWMsRUFBZCxNQUFjO0VBQWQscUJBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7RUFBQSx5Q0FBYztVQUFkLGlDQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7Ozs7OztFQUFBLGtCQUFjO0VBQWQsb0JBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLGNBQWM7RUFBZCx3QkFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkOztFQUFBLG1CQUFjO0FBQUE7O0FBQWQ7Ozs7O0NBQWM7O0FBQWQ7Ozs7RUFBQSwrR0FBYyxFQUFkLE1BQWM7RUFBZCw2QkFBYyxFQUFkLE1BQWM7RUFBZCwrQkFBYyxFQUFkLE1BQWM7RUFBZCxjQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEsY0FBYztBQUFBOztBQUFkOztDQUFjOztBQUFkOztFQUFBLGNBQWM7RUFBZCxjQUFjO0VBQWQsa0JBQWM7RUFBZCx3QkFBYztBQUFBOztBQUFkO0VBQUEsZUFBYztBQUFBOztBQUFkO0VBQUEsV0FBYztBQUFBOztBQUFkOzs7O0NBQWM7O0FBQWQ7RUFBQSxjQUFjLEVBQWQsTUFBYztFQUFkLHFCQUFjLEVBQWQsTUFBYztFQUFkLHlCQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOzs7O0NBQWM7O0FBQWQ7Ozs7O0VBQUEsb0JBQWMsRUFBZCxNQUFjO0VBQWQsOEJBQWMsRUFBZCxNQUFjO0VBQWQsZ0NBQWMsRUFBZCxNQUFjO0VBQWQsZUFBYyxFQUFkLE1BQWM7RUFBZCxvQkFBYyxFQUFkLE1BQWM7RUFBZCxvQkFBYyxFQUFkLE1BQWM7RUFBZCxjQUFjLEVBQWQsTUFBYztFQUFkLFNBQWMsRUFBZCxNQUFjO0VBQWQsVUFBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDs7RUFBQSxvQkFBYztBQUFBOztBQUFkOzs7Q0FBYzs7QUFBZDs7OztFQUFBLDBCQUFjLEVBQWQsTUFBYztFQUFkLDZCQUFjLEVBQWQsTUFBYztFQUFkLHNCQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEsYUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEsZ0JBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLHdCQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7O0VBQUEsWUFBYztBQUFBOztBQUFkOzs7Q0FBYzs7QUFBZDtFQUFBLDZCQUFjLEVBQWQsTUFBYztFQUFkLG9CQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEsd0JBQWM7QUFBQTs7QUFBZDs7O0NBQWM7O0FBQWQ7RUFBQSwwQkFBYyxFQUFkLE1BQWM7RUFBZCxhQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEsa0JBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDs7Ozs7Ozs7Ozs7OztFQUFBLFNBQWM7QUFBQTs7QUFBZDtFQUFBLFNBQWM7RUFBZCxVQUFjO0FBQUE7O0FBQWQ7RUFBQSxVQUFjO0FBQUE7O0FBQWQ7OztFQUFBLGdCQUFjO0VBQWQsU0FBYztFQUFkLFVBQWM7QUFBQTs7QUFBZDs7Q0FBYztBQUFkO0VBQUEsVUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEsZ0JBQWM7QUFBQTs7QUFBZDs7O0NBQWM7O0FBQWQ7RUFBQSxVQUFjLEVBQWQsTUFBYztFQUFkLGNBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7O0VBQUEsVUFBYyxFQUFkLE1BQWM7RUFBZCxjQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkOztFQUFBLGVBQWM7QUFBQTs7QUFBZDs7Q0FBYztBQUFkO0VBQUEsZUFBYztBQUFBOztBQUFkOzs7O0NBQWM7O0FBQWQ7Ozs7Ozs7O0VBQUEsY0FBYyxFQUFkLE1BQWM7RUFBZCxzQkFBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDs7RUFBQSxlQUFjO0VBQWQsWUFBYztBQUFBOztBQUFkLHdFQUFjO0FBQWQ7RUFBQSxhQUFjO0FBQUE7O0FBQWQ7RUFBQSx3QkFBYztFQUFkLHdCQUFjO0VBQWQsbUJBQWM7RUFBZCxtQkFBYztFQUFkLGNBQWM7RUFBZCxjQUFjO0VBQWQsY0FBYztFQUFkLGVBQWM7RUFBZCxlQUFjO0VBQWQsYUFBYztFQUFkLGFBQWM7RUFBZCxrQkFBYztFQUFkLHNDQUFjO0VBQWQsOEJBQWM7RUFBZCw2QkFBYztFQUFkLDRCQUFjO0VBQWQsZUFBYztFQUFkLG9CQUFjO0VBQWQsc0JBQWM7RUFBZCx1QkFBYztFQUFkLHdCQUFjO0VBQWQsa0JBQWM7RUFBZCwyQkFBYztFQUFkLDRCQUFjO0VBQWQsc0NBQWM7RUFBZCxrQ0FBYztFQUFkLDJCQUFjO0VBQWQsc0JBQWM7RUFBZCw4QkFBYztFQUFkLFlBQWM7RUFBZCxrQkFBYztFQUFkLGdCQUFjO0VBQWQsaUJBQWM7RUFBZCxrQkFBYztFQUFkLGNBQWM7RUFBZCxnQkFBYztFQUFkLGFBQWM7RUFBZCxtQkFBYztFQUFkLHFCQUFjO0VBQWQsMkJBQWM7RUFBZCx5QkFBYztFQUFkLDBCQUFjO0VBQWQsMkJBQWM7RUFBZCx1QkFBYztFQUFkLHdCQUFjO0VBQWQseUJBQWM7RUFBZDtBQUFjOztBQUFkO0VBQUEsd0JBQWM7RUFBZCx3QkFBYztFQUFkLG1CQUFjO0VBQWQsbUJBQWM7RUFBZCxjQUFjO0VBQWQsY0FBYztFQUFkLGNBQWM7RUFBZCxlQUFjO0VBQWQsZUFBYztFQUFkLGFBQWM7RUFBZCxhQUFjO0VBQWQsa0JBQWM7RUFBZCxzQ0FBYztFQUFkLDhCQUFjO0VBQWQsNkJBQWM7RUFBZCw0QkFBYztFQUFkLGVBQWM7RUFBZCxvQkFBYztFQUFkLHNCQUFjO0VBQWQsdUJBQWM7RUFBZCx3QkFBYztFQUFkLGtCQUFjO0VBQWQsMkJBQWM7RUFBZCw0QkFBYztFQUFkLHNDQUFjO0VBQWQsa0NBQWM7RUFBZCwyQkFBYztFQUFkLHNCQUFjO0VBQWQsOEJBQWM7RUFBZCxZQUFjO0VBQWQsa0JBQWM7RUFBZCxnQkFBYztFQUFkLGlCQUFjO0VBQWQsa0JBQWM7RUFBZCxjQUFjO0VBQWQsZ0JBQWM7RUFBZCxhQUFjO0VBQWQsbUJBQWM7RUFBZCxxQkFBYztFQUFkLDJCQUFjO0VBQWQseUJBQWM7RUFBZCwwQkFBYztFQUFkLDJCQUFjO0VBQWQsdUJBQWM7RUFBZCx3QkFBYztFQUFkLHlCQUFjO0VBQWQ7QUFBYztBQUNkO0VBQUE7QUFBb0I7QUFBcEI7O0VBQUE7SUFBQTtFQUFvQjtBQUFBO0FBQXBCOztFQUFBO0lBQUE7RUFBb0I7QUFBQTtBQUFwQjs7RUFBQTtJQUFBO0VBQW9CO0FBQUE7QUFBcEI7O0VBQUE7SUFBQTtFQUFvQjtBQUFBO0FBQXBCOztFQUFBO0lBQUE7RUFBb0I7QUFBQTtBQUNwQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsd0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLDJCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLDJCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSxxQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxrQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxtQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxpQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLG1CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUZuQjtFQUFBLGtCQUVvQjtFQUZwQjtBQUVvQlwiLFwic291cmNlc0NvbnRlbnRcIjpbXCJAdGFpbHdpbmQgYmFzZTtcXG5AdGFpbHdpbmQgY29tcG9uZW50cztcXG5AdGFpbHdpbmQgdXRpbGl0aWVzO1wiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTtcblxuICAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbihcIlwiKTtcbiAgfTtcblxuICAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCB0aGlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZhciBpZCA9IHRoaXNba11bMF07XG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3VwcG9ydHMpIHtcbiAgICAgICAgaWYgKCFpdGVtWzRdKSB7XG4gICAgICAgICAgaXRlbVs0XSA9IFwiXCIuY29uY2F0KHN1cHBvcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNF0gPSBzdXBwb3J0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuICBpZiAoIWNzc01hcHBpbmcpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi9ub2RlX21vZHVsZXMvcG9zdGNzcy1sb2FkZXIvZGlzdC9janMuanM/P3J1bGVTZXRbMV0ucnVsZXNbMV0udXNlWzJdIS4vc3R5bGVzLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4uL25vZGVfbW9kdWxlcy9wb3N0Y3NzLWxvYWRlci9kaXN0L2Nqcy5qcz8/cnVsZVNldFsxXS5ydWxlc1sxXS51c2VbMl0hLi9zdHlsZXMuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzdHlsZXNJbkRPTSA9IFtdO1xuZnVuY3Rpb24gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuICB2YXIgcmVzdWx0ID0gLTE7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGlkQ291bnRNYXAgPSB7fTtcbiAgdmFyIGlkZW50aWZpZXJzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuICAgIGlmIChpbmRleEJ5SWRlbnRpZmllciAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXBkYXRlciA9IGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5ieUluZGV4ID0gaTtcbiAgICAgIHN0eWxlc0luRE9NLnNwbGljZShpLCAwLCB7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IHVwZGF0ZXIsXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cbmZ1bmN0aW9uIGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIGFwaSA9IG9wdGlvbnMuZG9tQVBJKG9wdGlvbnMpO1xuICBhcGkudXBkYXRlKG9iaik7XG4gIHZhciB1cGRhdGVyID0gZnVuY3Rpb24gdXBkYXRlcihuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwICYmIG5ld09iai5zdXBwb3J0cyA9PT0gb2JqLnN1cHBvcnRzICYmIG5ld09iai5sYXllciA9PT0gb2JqLmxheWVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHVwZGF0ZXI7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXN0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgX2lkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbX2ldO1xuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcbiAgICAgIGlmIChzdHlsZXNJbkRPTVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5ET01bX2luZGV4XS51cGRhdGVyKCk7XG4gICAgICAgIHN0eWxlc0luRE9NLnNwbGljZShfaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7XG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG4gICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gc3R5bGVUYXJnZXQuY29udGVudERvY3VtZW50LmhlYWQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cbiAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRCeVNlbGVjdG9yKGluc2VydCwgc3R5bGUpIHtcbiAgdmFyIHRhcmdldCA9IGdldFRhcmdldChpbnNlcnQpO1xuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cbiAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0QnlTZWxlY3RvcjsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgb3B0aW9ucy5zZXRBdHRyaWJ1dGVzKGVsZW1lbnQsIG9wdGlvbnMuYXR0cmlidXRlcyk7XG4gIG9wdGlvbnMuaW5zZXJ0KGVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG4gIHJldHVybiBlbGVtZW50O1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG4gIGlmIChub25jZSkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBub25jZSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKSB7XG4gIHZhciBjc3MgPSBcIlwiO1xuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIik7XG4gIH1cbiAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBvYmoubGF5ZXIgIT09IFwidW5kZWZpbmVkXCI7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cbiAgY3NzICs9IG9iai5jc3M7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH1cblxuICAvLyBGb3Igb2xkIElFXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cbiAgb3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGRvbUFQSShvcHRpb25zKSB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoKSB7fSxcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICB9O1xuICB9XG4gIHZhciBzdHlsZUVsZW1lbnQgPSBvcHRpb25zLmluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgcmV0dXJuIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShvYmopIHtcbiAgICAgIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG4gICAgfVxuICB9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzdHlsZVRhZ1RyYW5zZm9ybTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5uYyA9IHVuZGVmaW5lZDsiLCJpbXBvcnQgXCIuL3N0eWxlcy5jc3NcIjtcbmltcG9ydCBHYW1lIGZyb20gXCIuL2dhbWVcIjtcbmltcG9ydCBVaU1hbmFnZXIgZnJvbSBcIi4vdWlNYW5hZ2VyXCI7XG5pbXBvcnQgQWN0aW9uQ29udHJvbGxlciBmcm9tIFwiLi9hY3Rpb25Db250cm9sbGVyXCI7XG5cbi8vIENyZWF0ZSBhIG5ldyBVSSBtYW5hZ2VyXG5jb25zdCBuZXdVaU1hbmFnZXIgPSBVaU1hbmFnZXIoKTtcblxuLy8gSW5zdGFudGlhdGUgYSBuZXcgZ2FtZVxuY29uc3QgbmV3R2FtZSA9IEdhbWUoKTtcblxuLy8gSW5pdGlhbGlzZSBjb25zb2xlXG5uZXdVaU1hbmFnZXIuaW5pdENvbnNvbGVVSSgpO1xuXG4vLyBTZXQgdXAgdGhlIGdhbWVib2FyZCBkaXNwbGF5cyB1c2luZyBVaU1hbmFnZXJcbm5ld1VpTWFuYWdlci5jcmVhdGVHYW1lYm9hcmQoXCJodW1hbi1nYlwiKTtcbm5ld1VpTWFuYWdlci5jcmVhdGVHYW1lYm9hcmQoXCJjb21wLWdiXCIpO1xuXG4vLyBDcmVhdGUgYSBuZXcgYWN0aW9uIGNvbnRyb2xsZXJcbmNvbnN0IGFjdENvbnRyb2xsZXIgPSBBY3Rpb25Db250cm9sbGVyKG5ld1VpTWFuYWdlciwgbmV3R2FtZSk7XG5cbmFjdENvbnRyb2xsZXIucHJvbXB0U2hpcFBsYWNlbWVudCgpO1xuXG4vLyBDcmVhdGUgYSBtb2NrIGFycmF5IG9mIGh1bWFuIHBsYXllciBlbnRyaWVzXG5jb25zdCBodW1hblNoaXBzID0gW1xuICB7IHNoaXBUeXBlOiBcImNhcnJpZXJcIiwgc3RhcnQ6IFwiSjZcIiwgZGlyZWN0aW9uOiBcInZcIiB9LFxuICB7IHNoaXBUeXBlOiBcImJhdHRsZXNoaXBcIiwgc3RhcnQ6IFwiRDdcIiwgZGlyZWN0aW9uOiBcInZcIiB9LFxuICB7IHNoaXBUeXBlOiBcInN1Ym1hcmluZVwiLCBzdGFydDogXCJBMVwiLCBkaXJlY3Rpb246IFwiaFwiIH0sXG4gIHsgc2hpcFR5cGU6IFwiY3J1aXNlclwiLCBzdGFydDogXCJHMVwiLCBkaXJlY3Rpb246IFwiaFwiIH0sXG4gIHsgc2hpcFR5cGU6IFwiZGVzdHJveWVyXCIsIHN0YXJ0OiBcIkY4XCIsIGRpcmVjdGlvbjogXCJoXCIgfSxcbl07XG5cbi8vIENhbGwgdGhlIHNldFVwIG1ldGhvZCBvbiB0aGUgZ2FtZVxubmV3R2FtZS5zZXRVcChodW1hblNoaXBzKTtcblxuLy8gUmVuZGVyIHRoZSB0d28gcGxheWVyJ3Mgc2hpcCBzdGF0dXMgZGlzcGxheXNcbm5ld1VpTWFuYWdlci5yZW5kZXJTaGlwRGlzcChuZXdHYW1lLnBsYXllcnMuaHVtYW4pO1xubmV3VWlNYW5hZ2VyLnJlbmRlclNoaXBEaXNwKG5ld0dhbWUucGxheWVycy5jb21wdXRlcik7XG5cbi8vIENvbnNvbGUgbG9nIHRoZSBwbGF5ZXJzXG5jb25zb2xlLmxvZyhcbiAgYFBsYXllcnM6IEZpcnN0IHBsYXllciBvZiB0eXBlICR7bmV3R2FtZS5wbGF5ZXJzLmh1bWFuLnR5cGV9LCBzZWNvbmQgcGxheWVyIG9mIHR5cGUgJHtuZXdHYW1lLnBsYXllcnMuY29tcHV0ZXIudHlwZX0hYCxcbik7XG4iXSwibmFtZXMiOlsicGxhY2VTaGlwUHJvbXB0IiwiQWN0aW9uQ29udHJvbGxlciIsInVpTWFuYWdlciIsImdhbWUiLCJwcm9tcHRTaGlwUGxhY2VtZW50IiwicHJvbXB0T2JqIiwicHJvbXB0IiwicHJvbXB0VHlwZSIsImRpc3BsYXlQcm9tcHQiLCJPdmVybGFwcGluZ1NoaXBzRXJyb3IiLCJFcnJvciIsImNvbnN0cnVjdG9yIiwibWVzc2FnZSIsIm5hbWUiLCJTaGlwQWxsb2NhdGlvblJlYWNoZWRFcnJvciIsIlNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvciIsIkludmFsaWRTaGlwTGVuZ3RoRXJyb3IiLCJJbnZhbGlkU2hpcFR5cGVFcnJvciIsIkludmFsaWRQbGF5ZXJUeXBlRXJyb3IiLCJTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvciIsIlJlcGVhdEF0dGFja2VkRXJyb3IiLCJJbnZhbGlkTW92ZUVudHJ5RXJyb3IiLCJQbGF5ZXIiLCJHYW1lYm9hcmQiLCJTaGlwIiwiR2FtZSIsImh1bWFuR2FtZWJvYXJkIiwiY29tcHV0ZXJHYW1lYm9hcmQiLCJodW1hblBsYXllciIsImNvbXB1dGVyUGxheWVyIiwiY3VycmVudFBsYXllciIsImdhbWVPdmVyU3RhdGUiLCJwbGF5ZXJzIiwiaHVtYW4iLCJjb21wdXRlciIsInNldFVwIiwiaHVtYW5TaGlwcyIsInBsYWNlU2hpcHMiLCJmb3JFYWNoIiwic2hpcCIsInNoaXBUeXBlIiwic3RhcnQiLCJkaXJlY3Rpb24iLCJlbmRHYW1lIiwidGFrZVR1cm4iLCJtb3ZlIiwiZmVlZGJhY2siLCJvcHBvbmVudCIsInJlc3VsdCIsIm1ha2VNb3ZlIiwiZ2FtZWJvYXJkIiwiaGl0IiwiaXNTaGlwU3VuayIsImdhbWVXb24iLCJjaGVja0FsbFNoaXBzU3VuayIsImdyaWQiLCJpbmRleENhbGNzIiwiY29sTGV0dGVyIiwidG9VcHBlckNhc2UiLCJyb3dOdW1iZXIiLCJwYXJzZUludCIsInNsaWNlIiwiY29sSW5kZXgiLCJjaGFyQ29kZUF0Iiwicm93SW5kZXgiLCJjaGVja1R5cGUiLCJzaGlwUG9zaXRpb25zIiwiT2JqZWN0Iiwia2V5cyIsImV4aXN0aW5nU2hpcFR5cGUiLCJjaGVja0JvdW5kYXJpZXMiLCJzaGlwTGVuZ3RoIiwiY29vcmRzIiwieExpbWl0IiwibGVuZ3RoIiwieUxpbWl0IiwieCIsInkiLCJjYWxjdWxhdGVTaGlwUG9zaXRpb25zIiwicG9zaXRpb25zIiwidG9Mb3dlckNhc2UiLCJpIiwicHVzaCIsImNoZWNrRm9yT3ZlcmxhcCIsImVudHJpZXMiLCJleGlzdGluZ1NoaXBQb3NpdGlvbnMiLCJzb21lIiwicG9zaXRpb24iLCJpbmNsdWRlcyIsImNoZWNrRm9ySGl0IiwiZm91bmRTaGlwIiwiZmluZCIsIl8iLCJzaGlwRmFjdG9yeSIsInNoaXBzIiwiaGl0UG9zaXRpb25zIiwiYXR0YWNrTG9nIiwicGxhY2VTaGlwIiwidHlwZSIsIm5ld1NoaXAiLCJhdHRhY2siLCJyZXNwb25zZSIsImNoZWNrUmVzdWx0cyIsImlzU3VuayIsImV2ZXJ5Iiwic2hpcFJlcG9ydCIsImZsb2F0aW5nU2hpcHMiLCJmaWx0ZXIiLCJtYXAiLCJnZXRTaGlwIiwiZ2V0U2hpcFBvc2l0aW9ucyIsImdldEhpdFBvc2l0aW9ucyIsImNoZWNrTW92ZSIsImdiR3JpZCIsInZhbGlkIiwiZWwiLCJwIiwicmFuZE1vdmUiLCJtb3ZlTG9nIiwiYWxsTW92ZXMiLCJmbGF0TWFwIiwicm93IiwicG9zc2libGVNb3ZlcyIsInJhbmRvbU1vdmUiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJnZW5lcmF0ZVJhbmRvbVN0YXJ0Iiwic2l6ZSIsInZhbGlkU3RhcnRzIiwiY29sIiwicmFuZG9tSW5kZXgiLCJhdXRvUGxhY2VtZW50Iiwic2hpcFR5cGVzIiwicGxhY2VkIiwiZXJyb3IiLCJvcHBHYW1lYm9hcmQiLCJpbnB1dCIsImNoYXJBdCIsInN1YnN0cmluZyIsInBsYXllciIsInNldExlbmd0aCIsImhpdHMiLCJidWlsZFNoaXAiLCJvYmoiLCJkb21TZWwiLCJzaGlwU2VjdHMiLCJzZWN0IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NOYW1lIiwic2V0QXR0cmlidXRlIiwidXBkYXRlT3V0cHV0Iiwib3V0cHV0IiwibWVzc2FnZUVsZW1lbnQiLCJ0ZXh0Q29udGVudCIsImFwcGVuZENoaWxkIiwic2Nyb2xsVG9wIiwic2Nyb2xsSGVpZ2h0IiwiZXhlY3V0ZUNvbW1hbmQiLCJjb21tYW5kIiwiY29uc29sZSIsImxvZyIsImdldEVsZW1lbnRCeUlkIiwidmFsdWUiLCJnYW1lYm9hcmRDbGljayIsImV2ZW50IiwiaWQiLCJ0YXJnZXQiLCJkYXRhc2V0IiwiVWlNYW5hZ2VyIiwiY3JlYXRlR2FtZWJvYXJkIiwiY29udGFpbmVySUQiLCJjb250YWluZXIiLCJncmlkRGl2IiwiY29sdW1ucyIsImhlYWRlciIsInJvd0xhYmVsIiwiY2VsbElkIiwiY2VsbCIsImFkZEV2ZW50TGlzdGVuZXIiLCJpbml0Q29uc29sZVVJIiwiY29uc29sZUNvbnRhaW5lciIsImNsYXNzTGlzdCIsImFkZCIsImlucHV0RGl2Iiwic3VibWl0QnV0dG9uIiwiZSIsImtleSIsInByb21wdE9ianMiLCJkaXNwbGF5IiwiZmlyc3RDaGlsZCIsInJlbW92ZUNoaWxkIiwicHJvbXB0RGl2IiwicmVuZGVyU2hpcERpc3AiLCJwbGF5ZXJPYmoiLCJpZFNlbCIsImRpc3BEaXYiLCJxdWVyeVNlbGVjdG9yIiwidmFsdWVzIiwic2hpcERpdiIsInRpdGxlIiwic2VjdHNEaXYiLCJuZXdVaU1hbmFnZXIiLCJuZXdHYW1lIiwiYWN0Q29udHJvbGxlciJdLCJzb3VyY2VSb290IjoiIn0=