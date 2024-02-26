/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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
        cell.className = "w-6 h-6 bg-gray-200 cursor-pointer"; // Add more classes as needed for styling
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
.w-full {
  width: 100%;
}
.flex-1 {
  flex: 1 1 0%;
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
.justify-center {
  justify-content: center;
}
.justify-between {
  justify-content: space-between;
}
.gap-1 {
  gap: 0.25rem;
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
.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}
.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.text-center {
  text-align: center;
}
.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
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
}`, "",{"version":3,"sources":["webpack://./src/styles.css"],"names":[],"mappings":"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;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,qBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,mBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,mBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB","sourcesContent":["@tailwind base;\n@tailwind components;\n@tailwind utilities;"],"sourceRoot":""}]);
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




// Create a new UI manager
const newUiManager = (0,_uiManager__WEBPACK_IMPORTED_MODULE_2__["default"])();

// Initialise console
newUiManager.initConsoleUI();

// Set up the gameboard displays using UiManager
newUiManager.createGameboard("human-gb");
newUiManager.createGameboard("comp-gb");

// Instantiate a new game
const newGame = (0,_game__WEBPACK_IMPORTED_MODULE_1__["default"])();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQzlEO0FBRUQsTUFBTUMsVUFBVSxHQUFJZixLQUFLLElBQUs7RUFDNUIsTUFBTWdCLFNBQVMsR0FBR2hCLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQ2lCLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMxQyxNQUFNQyxTQUFTLEdBQUdDLFFBQVEsQ0FBQ25CLEtBQUssQ0FBQ29CLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDOztFQUVoRCxNQUFNQyxRQUFRLEdBQUdMLFNBQVMsQ0FBQ00sVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQ0EsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFD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QUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGNBQWM7QUFDZCxrQkFBa0I7QUFDbEI7O0FBRUE7QUFDQTtBQUNBLGNBQWM7QUFDZCxrQkFBa0I7QUFDbEI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEIsMEJBQTBCO0FBQzFCOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxPQUFPLGtGQUFrRixZQUFZLE1BQU0sT0FBTyxxQkFBcUIsb0JBQW9CLHFCQUFxQixxQkFBcUIsTUFBTSxNQUFNLFdBQVcsTUFBTSxZQUFZLE1BQU0sTUFBTSxxQkFBcUIscUJBQXFCLHFCQUFxQixVQUFVLG9CQUFvQixxQkFBcUIscUJBQXFCLHFCQUFxQixxQkFBcUIsTUFBTSxPQUFPLE1BQU0sS0FBSyxvQkFBb0IscUJBQXFCLE1BQU0sUUFBUSxNQUFNLEtBQUssb0JBQW9CLG9CQUFvQixxQkFBcUIsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLFdBQVcsTUFBTSxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsTUFBTSxNQUFNLE1BQU0sS0FBSyxVQUFVLFdBQVcsTUFBTSxNQUFNLE1BQU0sTUFBTSxXQUFXLE1BQU0sU0FBUyxNQUFNLFFBQVEscUJBQXFCLHFCQUFxQixxQkFBcUIsb0JBQW9CLE1BQU0sTUFBTSxNQUFNLEtBQUssVUFBVSxNQUFNLE1BQU0sTUFBTSxNQUFNLFVBQVUsVUFBVSxXQUFXLFdBQVcsTUFBTSxLQUFLLFVBQVUsTUFBTSxLQUFLLFVBQVUsTUFBTSxRQUFRLE1BQU0sS0FBSyxvQkFBb0IscUJBQXFCLHFCQUFxQixNQUFNLFFBQVEsTUFBTSxTQUFTLHFCQUFxQixxQkFBcUIscUJBQXFCLG9CQUFvQixxQkFBcUIscUJBQXFCLG9CQUFvQixvQkFBb0Isb0JBQW9CLE1BQU0sTUFBTSxNQUFNLE1BQU0sV0FBVyxNQUFNLE9BQU8sTUFBTSxRQUFRLHFCQUFxQixxQkFBcUIscUJBQXFCLE1BQU0sTUFBTSxNQUFNLEtBQUssVUFBVSxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxNQUFNLE1BQU0sVUFBVSxNQUFNLE9BQU8sTUFBTSxLQUFLLHFCQUFxQixxQkFBcUIsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sT0FBTyxNQUFNLEtBQUsscUJBQXFCLG9CQUFvQixNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLE1BQU0saUJBQWlCLFVBQVUsTUFBTSxLQUFLLFVBQVUsVUFBVSxNQUFNLEtBQUssVUFBVSxNQUFNLE9BQU8sV0FBVyxVQUFVLFVBQVUsTUFBTSxNQUFNLEtBQUssS0FBSyxVQUFVLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE9BQU8sTUFBTSxLQUFLLG9CQUFvQixvQkFBb0IsTUFBTSxNQUFNLG9CQUFvQixvQkFBb0IsTUFBTSxNQUFNLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxLQUFLLEtBQUssVUFBVSxNQUFNLFFBQVEsTUFBTSxZQUFZLG9CQUFvQixxQkFBcUIsTUFBTSxNQUFNLE1BQU0sTUFBTSxVQUFVLFVBQVUsTUFBTSxXQUFXLEtBQUssVUFBVSxNQUFNLEtBQUssV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxLQUFLLE1BQU0sS0FBSyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLEtBQUssS0FBSyxLQUFLLEtBQUssTUFBTSxPQUFPLEtBQUssS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZ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QUFFLElBQUk7RUFBRUMsU0FBUyxFQUFFO0FBQUksQ0FBQyxDQUN2RDs7QUFFRDtBQUNBNkosT0FBTyxDQUFDcEssS0FBSyxDQUFDQyxVQUFVLENBQUM7O0FBRXpCO0FBQ0FrSyxZQUFZLENBQUNULGNBQWMsQ0FBQ1UsT0FBTyxDQUFDdkssT0FBTyxDQUFDQyxLQUFLLENBQUM7QUFDbERxSyxZQUFZLENBQUNULGNBQWMsQ0FBQ1UsT0FBTyxDQUFDdkssT0FBTyxDQUFDRSxRQUFRLENBQUM7O0FBRXJEO0FBQ0ErSCxPQUFPLENBQUNDLEdBQUcsQ0FDUixpQ0FBZ0NxQyxPQUFPLENBQUN2SyxPQUFPLENBQUNDLEtBQUssQ0FBQ2lFLElBQUssMkJBQTBCcUcsT0FBTyxDQUFDdkssT0FBTyxDQUFDRSxRQUFRLENBQUNnRSxJQUFLLEdBQ3RILENBQUMsQyIsInNvdXJjZXMiOlsid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9lcnJvcnMuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2dhbWUuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2dhbWVib2FyZC5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvcGxheWVyLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9zaGlwLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy91aU1hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3N0eWxlcy5jc3MiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvc3R5bGVzLmNzcz8wYTI1Iiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvbm9uY2UiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG1heC1jbGFzc2VzLXBlci1maWxlICovXG5cbmNsYXNzIE92ZXJsYXBwaW5nU2hpcHNFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiU2hpcHMgYXJlIG92ZXJsYXBwaW5nLlwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJPdmVybGFwcGluZ1NoaXBzRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBTaGlwQWxsb2NhdGlvblJlYWNoZWRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiU2hpcCBhbGxvY2F0aW9uIGxpbWl0IHJlYWNoZWQuXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIlNoaXBBbGxvY2F0aW9uUmVhY2hlZEVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgU2hpcFR5cGVBbGxvY2F0aW9uUmVhY2hlZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJTaGlwIHR5cGUgYWxsb2NhdGlvbiBsaW1pdCByZWFjaGVkLlwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBJbnZhbGlkU2hpcExlbmd0aEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJJbnZhbGlkIHNoaXAgbGVuZ3RoLlwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJJbnZhbGlkU2hpcExlbmd0aEVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgSW52YWxpZFNoaXBUeXBlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIkludmFsaWQgc2hpcCB0eXBlLlwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJJbnZhbGlkU2hpcFR5cGVFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRQbGF5ZXJUeXBlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2UgPSBcIkludmFsaWQgcGxheWVyIHR5cGUuIFZhbGlkIHBsYXllciB0eXBlczogJ2h1bWFuJyAmICdjb21wdXRlcidcIixcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJJbnZhbGlkU2hpcFR5cGVFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJJbnZhbGlkIHNoaXAgcGxhY2VtZW50LiBCb3VuZGFyeSBlcnJvciFcIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBSZXBlYXRBdHRhY2tlZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJJbnZhbGlkIGF0dGFjayBlbnRyeS4gUG9zaXRpb24gYWxyZWFkeSBhdHRhY2tlZCFcIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiUmVwZWF0QXR0YWNrRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBJbnZhbGlkTW92ZUVudHJ5RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIkludmFsaWQgbW92ZSBlbnRyeSFcIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiSW52YWxpZE1vdmVFbnRyeUVycm9yXCI7XG4gIH1cbn1cblxuZXhwb3J0IHtcbiAgT3ZlcmxhcHBpbmdTaGlwc0Vycm9yLFxuICBTaGlwQWxsb2NhdGlvblJlYWNoZWRFcnJvcixcbiAgU2hpcFR5cGVBbGxvY2F0aW9uUmVhY2hlZEVycm9yLFxuICBJbnZhbGlkU2hpcExlbmd0aEVycm9yLFxuICBJbnZhbGlkU2hpcFR5cGVFcnJvcixcbiAgSW52YWxpZFBsYXllclR5cGVFcnJvcixcbiAgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IsXG4gIFJlcGVhdEF0dGFja2VkRXJyb3IsXG4gIEludmFsaWRNb3ZlRW50cnlFcnJvcixcbn07XG4iLCJpbXBvcnQgUGxheWVyIGZyb20gXCIuL3BsYXllclwiO1xuaW1wb3J0IEdhbWVib2FyZCBmcm9tIFwiLi9nYW1lYm9hcmRcIjtcbmltcG9ydCBTaGlwIGZyb20gXCIuL3NoaXBcIjtcbmltcG9ydCB7IEludmFsaWRQbGF5ZXJUeXBlRXJyb3IgfSBmcm9tIFwiLi9lcnJvcnNcIjtcblxuY29uc3QgR2FtZSA9ICgpID0+IHtcbiAgLy8gSW5pdGlhbGlzZSwgY3JlYXRlIGdhbWVib2FyZHMgZm9yIGJvdGggcGxheWVycyBhbmQgY3JlYXRlIHBsYXllcnMgb2YgdHlwZXMgaHVtYW4gYW5kIGNvbXB1dGVyXG4gIGNvbnN0IGh1bWFuR2FtZWJvYXJkID0gR2FtZWJvYXJkKFNoaXApO1xuICBjb25zdCBjb21wdXRlckdhbWVib2FyZCA9IEdhbWVib2FyZChTaGlwKTtcbiAgY29uc3QgaHVtYW5QbGF5ZXIgPSBQbGF5ZXIoaHVtYW5HYW1lYm9hcmQsIFwiaHVtYW5cIik7XG4gIGNvbnN0IGNvbXB1dGVyUGxheWVyID0gUGxheWVyKGNvbXB1dGVyR2FtZWJvYXJkLCBcImNvbXB1dGVyXCIpO1xuICBsZXQgY3VycmVudFBsYXllcjtcbiAgbGV0IGdhbWVPdmVyU3RhdGUgPSBmYWxzZTtcblxuICAvLyBTdG9yZSBwbGF5ZXJzIGluIGEgcGxheWVyIG9iamVjdFxuICBjb25zdCBwbGF5ZXJzID0geyBodW1hbjogaHVtYW5QbGF5ZXIsIGNvbXB1dGVyOiBjb21wdXRlclBsYXllciB9O1xuXG4gIC8vIFNldCB1cCBwaGFzZVxuICBjb25zdCBzZXRVcCA9IChodW1hblNoaXBzKSA9PiB7XG4gICAgLy8gQXV0b21hdGljIHBsYWNlbWVudCBmb3IgY29tcHV0ZXJcbiAgICBjb21wdXRlclBsYXllci5wbGFjZVNoaXBzKCk7XG5cbiAgICAvLyBQbGFjZSBzaGlwcyBmcm9tIHRoZSBodW1hbiBwbGF5ZXIncyBzZWxlY3Rpb24gb24gdGhlaXIgcmVzcGVjdGl2ZSBnYW1lYm9hcmRcbiAgICBodW1hblNoaXBzLmZvckVhY2goKHNoaXApID0+IHtcbiAgICAgIGh1bWFuUGxheWVyLnBsYWNlU2hpcHMoc2hpcC5zaGlwVHlwZSwgc2hpcC5zdGFydCwgc2hpcC5kaXJlY3Rpb24pO1xuICAgIH0pO1xuXG4gICAgLy8gU2V0IHRoZSBjdXJyZW50IHBsYXllciB0byBodW1hbiBwbGF5ZXJcbiAgICBjdXJyZW50UGxheWVyID0gaHVtYW5QbGF5ZXI7XG4gIH07XG5cbiAgLy8gR2FtZSBlbmRpbmcgZnVuY3Rpb25cbiAgY29uc3QgZW5kR2FtZSA9ICgpID0+IHtcbiAgICBnYW1lT3ZlclN0YXRlID0gdHJ1ZTtcbiAgfTtcblxuICAvLyBUYWtlIHR1cm4gbWV0aG9kXG4gIGNvbnN0IHRha2VUdXJuID0gKG1vdmUpID0+IHtcbiAgICBsZXQgZmVlZGJhY2s7XG5cbiAgICAvLyBEZXRlcm1pbmUgdGhlIG9wcG9uZW50IGJhc2VkIG9uIHRoZSBjdXJyZW50IHBsYXllclxuICAgIGNvbnN0IG9wcG9uZW50ID1cbiAgICAgIGN1cnJlbnRQbGF5ZXIgPT09IGh1bWFuUGxheWVyID8gY29tcHV0ZXJQbGF5ZXIgOiBodW1hblBsYXllcjtcblxuICAgIC8vIENhbGwgdGhlIG1ha2VNb3ZlIG1ldGhvZCBvbiB0aGUgY3VycmVudCBwbGF5ZXIgd2l0aCB0aGUgb3Bwb25lbnQncyBnYW1lYm9hcmQgYW5kIHN0b3JlIGFzIG1vdmUgZmVlZGJhY2tcbiAgICBjb25zdCByZXN1bHQgPSBjdXJyZW50UGxheWVyLm1ha2VNb3ZlKG9wcG9uZW50LmdhbWVib2FyZCwgbW92ZSk7XG5cbiAgICAvLyBJZiByZXN1bHQgaXMgYSBoaXQsIGNoZWNrIHdoZXRoZXIgdGhlIHNoaXAgaXMgc3Vua1xuICAgIGlmIChyZXN1bHQuaGl0KSB7XG4gICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSBzaGlwIGlzIHN1bmsgYW5kIGFkZCByZXN1bHQgYXMgdmFsdWUgdG8gZmVlZGJhY2sgb2JqZWN0IHdpdGgga2V5IFwiaXNTaGlwU3Vua1wiXG4gICAgICBpZiAob3Bwb25lbnQuZ2FtZWJvYXJkLmlzU2hpcFN1bmsocmVzdWx0LnNoaXBUeXBlKSkge1xuICAgICAgICBmZWVkYmFjayA9IHtcbiAgICAgICAgICAuLi5yZXN1bHQsXG4gICAgICAgICAgaXNTaGlwU3VuazogdHJ1ZSxcbiAgICAgICAgICBnYW1lV29uOiBvcHBvbmVudC5nYW1lYm9hcmQuY2hlY2tBbGxTaGlwc1N1bmsoKSxcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZlZWRiYWNrID0geyAuLi5yZXN1bHQsIGlzU2hpcFN1bms6IGZhbHNlIH07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghcmVzdWx0LmhpdCkge1xuICAgICAgLy8gU2V0IGZlZWRiYWNrIHRvIGp1c3QgdGhlIHJlc3VsdFxuICAgICAgZmVlZGJhY2sgPSByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gSWYgZ2FtZSBpcyB3b24sIGVuZCBnYW1lXG4gICAgaWYgKGZlZWRiYWNrLmdhbWVXb24pIHtcbiAgICAgIGVuZEdhbWUoKTtcbiAgICB9XG5cbiAgICAvLyBTd2l0Y2ggdGhlIGN1cnJlbnQgcGxheWVyXG4gICAgY3VycmVudFBsYXllciA9IG9wcG9uZW50O1xuXG4gICAgLy8gUmV0dXJuIHRoZSBmZWVkYmFjayBmb3IgdGhlIG1vdmVcbiAgICByZXR1cm4gZmVlZGJhY2s7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBnZXQgY3VycmVudFBsYXllcigpIHtcbiAgICAgIHJldHVybiBjdXJyZW50UGxheWVyO1xuICAgIH0sXG4gICAgZ2V0IGdhbWVPdmVyU3RhdGUoKSB7XG4gICAgICByZXR1cm4gZ2FtZU92ZXJTdGF0ZTtcbiAgICB9LFxuICAgIHBsYXllcnMsXG4gICAgc2V0VXAsXG4gICAgdGFrZVR1cm4sXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBHYW1lO1xuIiwiaW1wb3J0IHtcbiAgU2hpcFR5cGVBbGxvY2F0aW9uUmVhY2hlZEVycm9yLFxuICBPdmVybGFwcGluZ1NoaXBzRXJyb3IsXG4gIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yLFxuICBSZXBlYXRBdHRhY2tlZEVycm9yLFxufSBmcm9tIFwiLi9lcnJvcnNcIjtcblxuY29uc3QgZ3JpZCA9IFtcbiAgW1wiQTFcIiwgXCJBMlwiLCBcIkEzXCIsIFwiQTRcIiwgXCJBNVwiLCBcIkE2XCIsIFwiQTdcIiwgXCJBOFwiLCBcIkE5XCIsIFwiQTEwXCJdLFxuICBbXCJCMVwiLCBcIkIyXCIsIFwiQjNcIiwgXCJCNFwiLCBcIkI1XCIsIFwiQjZcIiwgXCJCN1wiLCBcIkI4XCIsIFwiQjlcIiwgXCJCMTBcIl0sXG4gIFtcIkMxXCIsIFwiQzJcIiwgXCJDM1wiLCBcIkM0XCIsIFwiQzVcIiwgXCJDNlwiLCBcIkM3XCIsIFwiQzhcIiwgXCJDOVwiLCBcIkMxMFwiXSxcbiAgW1wiRDFcIiwgXCJEMlwiLCBcIkQzXCIsIFwiRDRcIiwgXCJENVwiLCBcIkQ2XCIsIFwiRDdcIiwgXCJEOFwiLCBcIkQ5XCIsIFwiRDEwXCJdLFxuICBbXCJFMVwiLCBcIkUyXCIsIFwiRTNcIiwgXCJFNFwiLCBcIkU1XCIsIFwiRTZcIiwgXCJFN1wiLCBcIkU4XCIsIFwiRTlcIiwgXCJFMTBcIl0sXG4gIFtcIkYxXCIsIFwiRjJcIiwgXCJGM1wiLCBcIkY0XCIsIFwiRjVcIiwgXCJGNlwiLCBcIkY3XCIsIFwiRjhcIiwgXCJGOVwiLCBcIkYxMFwiXSxcbiAgW1wiRzFcIiwgXCJHMlwiLCBcIkczXCIsIFwiRzRcIiwgXCJHNVwiLCBcIkc2XCIsIFwiRzdcIiwgXCJHOFwiLCBcIkc5XCIsIFwiRzEwXCJdLFxuICBbXCJIMVwiLCBcIkgyXCIsIFwiSDNcIiwgXCJINFwiLCBcIkg1XCIsIFwiSDZcIiwgXCJIN1wiLCBcIkg4XCIsIFwiSDlcIiwgXCJIMTBcIl0sXG4gIFtcIkkxXCIsIFwiSTJcIiwgXCJJM1wiLCBcIkk0XCIsIFwiSTVcIiwgXCJJNlwiLCBcIkk3XCIsIFwiSThcIiwgXCJJOVwiLCBcIkkxMFwiXSxcbiAgW1wiSjFcIiwgXCJKMlwiLCBcIkozXCIsIFwiSjRcIiwgXCJKNVwiLCBcIko2XCIsIFwiSjdcIiwgXCJKOFwiLCBcIko5XCIsIFwiSjEwXCJdLFxuXTtcblxuY29uc3QgaW5kZXhDYWxjcyA9IChzdGFydCkgPT4ge1xuICBjb25zdCBjb2xMZXR0ZXIgPSBzdGFydFswXS50b1VwcGVyQ2FzZSgpOyAvLyBUaGlzIGlzIHRoZSBjb2x1bW5cbiAgY29uc3Qgcm93TnVtYmVyID0gcGFyc2VJbnQoc3RhcnQuc2xpY2UoMSksIDEwKTsgLy8gVGhpcyBpcyB0aGUgcm93XG5cbiAgY29uc3QgY29sSW5kZXggPSBjb2xMZXR0ZXIuY2hhckNvZGVBdCgwKSAtIFwiQVwiLmNoYXJDb2RlQXQoMCk7IC8vIENvbHVtbiBpbmRleCBiYXNlZCBvbiBsZXR0ZXJcbiAgY29uc3Qgcm93SW5kZXggPSByb3dOdW1iZXIgLSAxOyAvLyBSb3cgaW5kZXggYmFzZWQgb24gbnVtYmVyXG5cbiAgcmV0dXJuIFtjb2xJbmRleCwgcm93SW5kZXhdOyAvLyBSZXR1cm4gW3JvdywgY29sdW1uXVxufTtcblxuY29uc3QgY2hlY2tUeXBlID0gKHNoaXAsIHNoaXBQb3NpdGlvbnMpID0+IHtcbiAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBzaGlwUG9zaXRpb25zIG9iamVjdFxuICBPYmplY3Qua2V5cyhzaGlwUG9zaXRpb25zKS5mb3JFYWNoKChleGlzdGluZ1NoaXBUeXBlKSA9PiB7XG4gICAgaWYgKGV4aXN0aW5nU2hpcFR5cGUgPT09IHNoaXApIHtcbiAgICAgIHRocm93IG5ldyBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IoKTtcbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgY2hlY2tCb3VuZGFyaWVzID0gKHNoaXBMZW5ndGgsIGNvb3JkcywgZGlyZWN0aW9uKSA9PiB7XG4gIC8vIFNldCByb3cgYW5kIGNvbCBsaW1pdHNcbiAgY29uc3QgeExpbWl0ID0gZ3JpZC5sZW5ndGg7IC8vIFRoaXMgaXMgdGhlIHRvdGFsIG51bWJlciBvZiBjb2x1bW5zICh4KVxuICBjb25zdCB5TGltaXQgPSBncmlkWzBdLmxlbmd0aDsgLy8gVGhpcyBpcyB0aGUgdG90YWwgbnVtYmVyIG9mIHJvd3MgKHkpXG5cbiAgY29uc3QgeCA9IGNvb3Jkc1swXTtcbiAgY29uc3QgeSA9IGNvb3Jkc1sxXTtcblxuICAvLyBDaGVjayBmb3IgdmFsaWQgc3RhcnQgcG9zaXRpb24gb24gYm9hcmRcbiAgaWYgKHggPCAwIHx8IHggPj0geExpbWl0IHx8IHkgPCAwIHx8IHkgPj0geUxpbWl0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gQ2hlY2sgcmlnaHQgYm91bmRhcnkgZm9yIGhvcml6b250YWwgcGxhY2VtZW50XG4gIGlmIChkaXJlY3Rpb24gPT09IFwiaFwiICYmIHggKyBzaGlwTGVuZ3RoID4geExpbWl0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIENoZWNrIGJvdHRvbSBib3VuZGFyeSBmb3IgdmVydGljYWwgcGxhY2VtZW50XG4gIGlmIChkaXJlY3Rpb24gPT09IFwidlwiICYmIHkgKyBzaGlwTGVuZ3RoID4geUxpbWl0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gSWYgbm9uZSBvZiB0aGUgaW52YWxpZCBjb25kaXRpb25zIGFyZSBtZXQsIHJldHVybiB0cnVlXG4gIHJldHVybiB0cnVlO1xufTtcblxuY29uc3QgY2FsY3VsYXRlU2hpcFBvc2l0aW9ucyA9IChzaGlwTGVuZ3RoLCBjb29yZHMsIGRpcmVjdGlvbikgPT4ge1xuICBjb25zdCBjb2xJbmRleCA9IGNvb3Jkc1swXTsgLy8gVGhpcyBpcyB0aGUgY29sdW1uIGluZGV4XG4gIGNvbnN0IHJvd0luZGV4ID0gY29vcmRzWzFdOyAvLyBUaGlzIGlzIHRoZSByb3cgaW5kZXhcblxuICBjb25zdCBwb3NpdGlvbnMgPSBbXTtcblxuICBpZiAoZGlyZWN0aW9uLnRvTG93ZXJDYXNlKCkgPT09IFwiaFwiKSB7XG4gICAgLy8gSG9yaXpvbnRhbCBwbGFjZW1lbnQ6IGluY3JlbWVudCB0aGUgY29sdW1uIGluZGV4XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKGdyaWRbY29sSW5kZXggKyBpXVtyb3dJbmRleF0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBWZXJ0aWNhbCBwbGFjZW1lbnQ6IGluY3JlbWVudCB0aGUgcm93IGluZGV4XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKGdyaWRbY29sSW5kZXhdW3Jvd0luZGV4ICsgaV0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwb3NpdGlvbnM7XG59O1xuXG5jb25zdCBjaGVja0Zvck92ZXJsYXAgPSAocG9zaXRpb25zLCBzaGlwUG9zaXRpb25zKSA9PiB7XG4gIE9iamVjdC5lbnRyaWVzKHNoaXBQb3NpdGlvbnMpLmZvckVhY2goKFtzaGlwVHlwZSwgZXhpc3RpbmdTaGlwUG9zaXRpb25zXSkgPT4ge1xuICAgIGlmIChcbiAgICAgIHBvc2l0aW9ucy5zb21lKChwb3NpdGlvbikgPT4gZXhpc3RpbmdTaGlwUG9zaXRpb25zLmluY2x1ZGVzKHBvc2l0aW9uKSlcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBPdmVybGFwcGluZ1NoaXBzRXJyb3IoXG4gICAgICAgIGBPdmVybGFwIGRldGVjdGVkIHdpdGggc2hpcCB0eXBlICR7c2hpcFR5cGV9YCxcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IGNoZWNrRm9ySGl0ID0gKHBvc2l0aW9uLCBzaGlwUG9zaXRpb25zKSA9PiB7XG4gIGNvbnN0IGZvdW5kU2hpcCA9IE9iamVjdC5lbnRyaWVzKHNoaXBQb3NpdGlvbnMpLmZpbmQoXG4gICAgKFtfLCBleGlzdGluZ1NoaXBQb3NpdGlvbnNdKSA9PiBleGlzdGluZ1NoaXBQb3NpdGlvbnMuaW5jbHVkZXMocG9zaXRpb24pLFxuICApO1xuXG4gIHJldHVybiBmb3VuZFNoaXAgPyB7IGhpdDogdHJ1ZSwgc2hpcFR5cGU6IGZvdW5kU2hpcFswXSB9IDogeyBoaXQ6IGZhbHNlIH07XG59O1xuXG5jb25zdCBHYW1lYm9hcmQgPSAoc2hpcEZhY3RvcnkpID0+IHtcbiAgY29uc3Qgc2hpcHMgPSB7fTtcbiAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IHt9O1xuICBjb25zdCBoaXRQb3NpdGlvbnMgPSB7fTtcbiAgY29uc3QgYXR0YWNrTG9nID0gW1tdLCBbXV07XG5cbiAgY29uc3QgcGxhY2VTaGlwID0gKHR5cGUsIHN0YXJ0LCBkaXJlY3Rpb24pID0+IHtcbiAgICBjb25zdCBuZXdTaGlwID0gc2hpcEZhY3RvcnkodHlwZSk7XG5cbiAgICAvLyBDaGVjayB0aGUgc2hpcCB0eXBlIGFnYWluc3QgZXhpc3RpbmcgdHlwZXNcbiAgICBjaGVja1R5cGUodHlwZSwgc2hpcFBvc2l0aW9ucyk7XG5cbiAgICAvLyBDYWxjdWxhdGUgc3RhcnQgcG9pbnQgY29vcmRpbmF0ZXMgYmFzZWQgb24gc3RhcnQgcG9pbnQgZ3JpZCBrZXlcbiAgICBjb25zdCBjb29yZHMgPSBpbmRleENhbGNzKHN0YXJ0KTtcblxuICAgIC8vIENoZWNrIGJvdW5kYXJpZXMsIGlmIG9rIGNvbnRpbnVlIHRvIG5leHQgc3RlcFxuICAgIGlmIChjaGVja0JvdW5kYXJpZXMobmV3U2hpcC5zaGlwTGVuZ3RoLCBjb29yZHMsIGRpcmVjdGlvbikpIHtcbiAgICAgIC8vIENhbGN1bGF0ZSBhbmQgc3RvcmUgcG9zaXRpb25zIGZvciBhIG5ldyBzaGlwXG4gICAgICBjb25zdCBwb3NpdGlvbnMgPSBjYWxjdWxhdGVTaGlwUG9zaXRpb25zKFxuICAgICAgICBuZXdTaGlwLnNoaXBMZW5ndGgsXG4gICAgICAgIGNvb3JkcyxcbiAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgKTtcblxuICAgICAgLy8gQ2hlY2sgZm9yIG92ZXJsYXAgYmVmb3JlIHBsYWNpbmcgdGhlIHNoaXBcbiAgICAgIGNoZWNrRm9yT3ZlcmxhcChwb3NpdGlvbnMsIHNoaXBQb3NpdGlvbnMpO1xuXG4gICAgICAvLyBJZiBubyBvdmVybGFwLCBwcm9jZWVkIHRvIHBsYWNlIHNoaXBcbiAgICAgIHNoaXBQb3NpdGlvbnNbdHlwZV0gPSBwb3NpdGlvbnM7XG4gICAgICAvLyBBZGQgc2hpcCB0byBzaGlwcyBvYmplY3RcbiAgICAgIHNoaXBzW3R5cGVdID0gbmV3U2hpcDtcblxuICAgICAgLy8gSW5pdGlhbGlzZSBoaXRQb3NpdGlvbnMgZm9yIHRoaXMgc2hpcCB0eXBlIGFzIGFuIGVtcHR5IGFycmF5XG4gICAgICBoaXRQb3NpdGlvbnNbdHlwZV0gPSBbXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yKFxuICAgICAgICBgSW52YWxpZCBzaGlwIHBsYWNlbWVudC4gQm91bmRhcnkgZXJyb3IhIFNoaXAgdHlwZTogJHt0eXBlfWAsXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZWdpc3RlciBhbiBhdHRhY2sgYW5kIHRlc3QgZm9yIHZhbGlkIGhpdFxuICBjb25zdCBhdHRhY2sgPSAocG9zaXRpb24pID0+IHtcbiAgICBsZXQgcmVzcG9uc2U7XG5cbiAgICAvLyBDaGVjayBmb3IgdmFsaWQgYXR0YWNrXG4gICAgaWYgKGF0dGFja0xvZ1swXS5pbmNsdWRlcyhwb3NpdGlvbikgfHwgYXR0YWNrTG9nWzFdLmluY2x1ZGVzKHBvc2l0aW9uKSkge1xuICAgICAgLy8gY29uc29sZS5sb2coYFJlcGVhdCBhdHRhY2s6ICR7cG9zaXRpb259YCk7XG4gICAgICB0aHJvdyBuZXcgUmVwZWF0QXR0YWNrZWRFcnJvcigpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciB2YWxpZCBoaXRcbiAgICBjb25zdCBjaGVja1Jlc3VsdHMgPSBjaGVja0ZvckhpdChwb3NpdGlvbiwgc2hpcFBvc2l0aW9ucyk7XG4gICAgaWYgKGNoZWNrUmVzdWx0cy5oaXQpIHtcbiAgICAgIC8vIFJlZ2lzdGVyIHZhbGlkIGhpdFxuICAgICAgaGl0UG9zaXRpb25zW2NoZWNrUmVzdWx0cy5zaGlwVHlwZV0ucHVzaChwb3NpdGlvbik7XG4gICAgICBzaGlwc1tjaGVja1Jlc3VsdHMuc2hpcFR5cGVdLmhpdCgpO1xuXG4gICAgICAvLyBMb2cgdGhlIGF0dGFjayBhcyBhIHZhbGlkIGhpdFxuICAgICAgYXR0YWNrTG9nWzBdLnB1c2gocG9zaXRpb24pO1xuICAgICAgcmVzcG9uc2UgPSB7IC4uLmNoZWNrUmVzdWx0cyB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhgTUlTUyE6ICR7cG9zaXRpb259YCk7XG4gICAgICAvLyBMb2cgdGhlIGF0dGFjayBhcyBhIG1pc3NcbiAgICAgIGF0dGFja0xvZ1sxXS5wdXNoKHBvc2l0aW9uKTtcbiAgICAgIHJlc3BvbnNlID0geyAuLi5jaGVja1Jlc3VsdHMgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH07XG5cbiAgY29uc3QgaXNTaGlwU3VuayA9ICh0eXBlKSA9PiBzaGlwc1t0eXBlXS5pc1N1bms7XG5cbiAgY29uc3QgY2hlY2tBbGxTaGlwc1N1bmsgPSAoKSA9PlxuICAgIE9iamVjdC5lbnRyaWVzKHNoaXBzKS5ldmVyeSgoW3NoaXBUeXBlLCBzaGlwXSkgPT4gc2hpcC5pc1N1bmspO1xuXG4gIC8vIEZ1bmN0aW9uIGZvciByZXBvcnRpbmcgdGhlIG51bWJlciBvZiBzaGlwcyBsZWZ0IGFmbG9hdFxuICBjb25zdCBzaGlwUmVwb3J0ID0gKCkgPT4ge1xuICAgIGNvbnN0IGZsb2F0aW5nU2hpcHMgPSBPYmplY3QuZW50cmllcyhzaGlwcylcbiAgICAgIC5maWx0ZXIoKFtzaGlwVHlwZSwgc2hpcF0pID0+ICFzaGlwLmlzU3VuaylcbiAgICAgIC5tYXAoKFtzaGlwVHlwZSwgX10pID0+IHNoaXBUeXBlKTtcblxuICAgIHJldHVybiBbZmxvYXRpbmdTaGlwcy5sZW5ndGgsIGZsb2F0aW5nU2hpcHNdO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgZ2V0IGdyaWQoKSB7XG4gICAgICByZXR1cm4gZ3JpZDtcbiAgICB9LFxuICAgIGdldCBzaGlwcygpIHtcbiAgICAgIHJldHVybiBzaGlwcztcbiAgICB9LFxuICAgIGdldCBhdHRhY2tMb2coKSB7XG4gICAgICByZXR1cm4gYXR0YWNrTG9nO1xuICAgIH0sXG4gICAgZ2V0U2hpcDogKHNoaXBUeXBlKSA9PiBzaGlwc1tzaGlwVHlwZV0sXG4gICAgZ2V0U2hpcFBvc2l0aW9uczogKHNoaXBUeXBlKSA9PiBzaGlwUG9zaXRpb25zW3NoaXBUeXBlXSxcbiAgICBnZXRIaXRQb3NpdGlvbnM6IChzaGlwVHlwZSkgPT4gaGl0UG9zaXRpb25zW3NoaXBUeXBlXSxcbiAgICBwbGFjZVNoaXAsXG4gICAgYXR0YWNrLFxuICAgIGlzU2hpcFN1bmssXG4gICAgY2hlY2tBbGxTaGlwc1N1bmssXG4gICAgc2hpcFJlcG9ydCxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVib2FyZDtcbiIsImltcG9ydCB7XG4gIEludmFsaWRQbGF5ZXJUeXBlRXJyb3IsXG4gIEludmFsaWRNb3ZlRW50cnlFcnJvcixcbiAgUmVwZWF0QXR0YWNrZWRFcnJvcixcbiAgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IsXG4gIE92ZXJsYXBwaW5nU2hpcHNFcnJvcixcbn0gZnJvbSBcIi4vZXJyb3JzXCI7XG5cbmNvbnN0IGNoZWNrTW92ZSA9IChtb3ZlLCBnYkdyaWQpID0+IHtcbiAgbGV0IHZhbGlkID0gZmFsc2U7XG5cbiAgZ2JHcmlkLmZvckVhY2goKGVsKSA9PiB7XG4gICAgaWYgKGVsLmZpbmQoKHApID0+IHAgPT09IG1vdmUpKSB7XG4gICAgICB2YWxpZCA9IHRydWU7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gdmFsaWQ7XG59O1xuXG5jb25zdCByYW5kTW92ZSA9IChncmlkLCBtb3ZlTG9nKSA9PiB7XG4gIC8vIEZsYXR0ZW4gdGhlIGdyaWQgaW50byBhIHNpbmdsZSBhcnJheSBvZiBtb3Zlc1xuICBjb25zdCBhbGxNb3ZlcyA9IGdyaWQuZmxhdE1hcCgocm93KSA9PiByb3cpO1xuXG4gIC8vIEZpbHRlciBvdXQgdGhlIG1vdmVzIHRoYXQgYXJlIGFscmVhZHkgaW4gdGhlIG1vdmVMb2dcbiAgY29uc3QgcG9zc2libGVNb3ZlcyA9IGFsbE1vdmVzLmZpbHRlcigobW92ZSkgPT4gIW1vdmVMb2cuaW5jbHVkZXMobW92ZSkpO1xuXG4gIC8vIFNlbGVjdCBhIHJhbmRvbSBtb3ZlIGZyb20gdGhlIHBvc3NpYmxlIG1vdmVzXG4gIGNvbnN0IHJhbmRvbU1vdmUgPVxuICAgIHBvc3NpYmxlTW92ZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcG9zc2libGVNb3Zlcy5sZW5ndGgpXTtcblxuICByZXR1cm4gcmFuZG9tTW92ZTtcbn07XG5cbmNvbnN0IGdlbmVyYXRlUmFuZG9tU3RhcnQgPSAoc2l6ZSwgZGlyZWN0aW9uLCBncmlkKSA9PiB7XG4gIGNvbnN0IHZhbGlkU3RhcnRzID0gW107XG5cbiAgaWYgKGRpcmVjdGlvbiA9PT0gXCJoXCIpIHtcbiAgICAvLyBGb3IgaG9yaXpvbnRhbCBvcmllbnRhdGlvbiwgbGltaXQgdGhlIGNvbHVtbnNcbiAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCBncmlkLmxlbmd0aCAtIHNpemUgKyAxOyBjb2wrKykge1xuICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgZ3JpZFtjb2xdLmxlbmd0aDsgcm93KyspIHtcbiAgICAgICAgdmFsaWRTdGFydHMucHVzaChncmlkW2NvbF1bcm93XSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEZvciB2ZXJ0aWNhbCBvcmllbnRhdGlvbiwgbGltaXQgdGhlIHJvd3NcbiAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBncmlkWzBdLmxlbmd0aCAtIHNpemUgKyAxOyByb3crKykge1xuICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgZ3JpZC5sZW5ndGg7IGNvbCsrKSB7XG4gICAgICAgIHZhbGlkU3RhcnRzLnB1c2goZ3JpZFtjb2xdW3Jvd10pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFJhbmRvbWx5IHNlbGVjdCBhIHN0YXJ0aW5nIHBvc2l0aW9uXG4gIGNvbnN0IHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdmFsaWRTdGFydHMubGVuZ3RoKTtcbiAgcmV0dXJuIHZhbGlkU3RhcnRzW3JhbmRvbUluZGV4XTtcbn07XG5cbmNvbnN0IGF1dG9QbGFjZW1lbnQgPSAoZ2FtZWJvYXJkKSA9PiB7XG4gIGNvbnN0IHNoaXBUeXBlcyA9IFtcbiAgICB7IHR5cGU6IFwiY2FycmllclwiLCBzaXplOiA1IH0sXG4gICAgeyB0eXBlOiBcImJhdHRsZXNoaXBcIiwgc2l6ZTogNCB9LFxuICAgIHsgdHlwZTogXCJjcnVpc2VyXCIsIHNpemU6IDMgfSxcbiAgICB7IHR5cGU6IFwic3VibWFyaW5lXCIsIHNpemU6IDMgfSxcbiAgICB7IHR5cGU6IFwiZGVzdHJveWVyXCIsIHNpemU6IDIgfSxcbiAgXTtcblxuICBzaGlwVHlwZXMuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgIGxldCBwbGFjZWQgPSBmYWxzZTtcbiAgICB3aGlsZSAoIXBsYWNlZCkge1xuICAgICAgY29uc3QgZGlyZWN0aW9uID0gTWF0aC5yYW5kb20oKSA8IDAuNSA/IFwiaFwiIDogXCJ2XCI7XG4gICAgICBjb25zdCBzdGFydCA9IGdlbmVyYXRlUmFuZG9tU3RhcnQoc2hpcC5zaXplLCBkaXJlY3Rpb24sIGdhbWVib2FyZC5ncmlkKTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZ2FtZWJvYXJkLnBsYWNlU2hpcChzaGlwLnR5cGUsIHN0YXJ0LCBkaXJlY3Rpb24pO1xuICAgICAgICBwbGFjZWQgPSB0cnVlO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICEoZXJyb3IgaW5zdGFuY2VvZiBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvcikgJiZcbiAgICAgICAgICAhKGVycm9yIGluc3RhbmNlb2YgT3ZlcmxhcHBpbmdTaGlwc0Vycm9yKVxuICAgICAgICApIHtcbiAgICAgICAgICB0aHJvdyBlcnJvcjsgLy8gUmV0aHJvdyBub24tcGxhY2VtZW50IGVycm9yc1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHBsYWNlbWVudCBmYWlscywgY2F0Y2ggdGhlIGVycm9yIGFuZCB0cnkgYWdhaW5cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgUGxheWVyID0gKGdhbWVib2FyZCwgdHlwZSkgPT4ge1xuICBjb25zdCBtb3ZlTG9nID0gW107XG5cbiAgY29uc3QgcGxhY2VTaGlwcyA9IChzaGlwVHlwZSwgc3RhcnQsIGRpcmVjdGlvbikgPT4ge1xuICAgIGlmICh0eXBlID09PSBcImh1bWFuXCIpIHtcbiAgICAgIGdhbWVib2FyZC5wbGFjZVNoaXAoc2hpcFR5cGUsIHN0YXJ0LCBkaXJlY3Rpb24pO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJjb21wdXRlclwiKSB7XG4gICAgICBhdXRvUGxhY2VtZW50KGdhbWVib2FyZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGxheWVyVHlwZUVycm9yKFxuICAgICAgICBgSW52YWxpZCBwbGF5ZXIgdHlwZS4gVmFsaWQgcGxheWVyIHR5cGVzOiBcImh1bWFuXCIgJiBcImNvbXB1dGVyXCIuIEVudGVyZWQ6ICR7dHlwZX0uYCxcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IG1ha2VNb3ZlID0gKG9wcEdhbWVib2FyZCwgaW5wdXQpID0+IHtcbiAgICBsZXQgbW92ZTtcblxuICAgIC8vIENoZWNrIGZvciB0aGUgdHlwZSBvZiBwbGF5ZXJcbiAgICBpZiAodHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICAvLyBGb3JtYXQgdGhlIGlucHV0XG4gICAgICBtb3ZlID0gYCR7aW5wdXQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCl9JHtpbnB1dC5zdWJzdHJpbmcoMSl9YDtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgbW92ZSA9IHJhbmRNb3ZlKG9wcEdhbWVib2FyZC5ncmlkLCBtb3ZlTG9nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQbGF5ZXJUeXBlRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIHBsYXllciB0eXBlLiBWYWxpZCBwbGF5ZXIgdHlwZXM6IFwiaHVtYW5cIiAmIFwiY29tcHV0ZXJcIi4gRW50ZXJlZDogJHt0eXBlfS5gLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayB0aGUgaW5wdXQgYWdhaW5zdCB0aGUgcG9zc2libGUgbW92ZXMgb24gdGhlIGdhbWVib2FyZCdzIGdyaWRcbiAgICBpZiAoIWNoZWNrTW92ZShtb3ZlLCBvcHBHYW1lYm9hcmQuZ3JpZCkpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkTW92ZUVudHJ5RXJyb3IoYEludmFsaWQgbW92ZSBlbnRyeSEgTW92ZTogJHttb3ZlfS5gKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgbW92ZSBleGlzdHMgaW4gdGhlIG1vdmVMb2cgYXJyYXksIHRocm93IGFuIGVycm9yXG4gICAgaWYgKG1vdmVMb2cuZmluZCgoZWwpID0+IGVsID09PSBtb3ZlKSkge1xuICAgICAgdGhyb3cgbmV3IFJlcGVhdEF0dGFja2VkRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBFbHNlLCBjYWxsIGF0dGFjayBtZXRob2Qgb24gZ2FtZWJvYXJkIGFuZCBsb2cgbW92ZSBpbiBtb3ZlTG9nXG4gICAgY29uc3QgcmVzcG9uc2UgPSBvcHBHYW1lYm9hcmQuYXR0YWNrKG1vdmUpO1xuICAgIG1vdmVMb2cucHVzaChtb3ZlKTtcbiAgICAvLyBSZXR1cm4gdGhlIHJlc3BvbnNlIG9mIHRoZSBhdHRhY2sgKG9iamVjdDogeyBoaXQ6IGZhbHNlIH0gZm9yIG1pc3M7IHsgaGl0OiB0cnVlLCBzaGlwVHlwZTogc3RyaW5nIH0gZm9yIGhpdCkuXG4gICAgcmV0dXJuIHsgcGxheWVyOiB0eXBlLCAuLi5yZXNwb25zZSB9O1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgZ2V0IHR5cGUoKSB7XG4gICAgICByZXR1cm4gdHlwZTtcbiAgICB9LFxuICAgIGdldCBnYW1lYm9hcmQoKSB7XG4gICAgICByZXR1cm4gZ2FtZWJvYXJkO1xuICAgIH0sXG4gICAgZ2V0IG1vdmVMb2coKSB7XG4gICAgICByZXR1cm4gbW92ZUxvZztcbiAgICB9LFxuICAgIG1ha2VNb3ZlLFxuICAgIHBsYWNlU2hpcHMsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBQbGF5ZXI7XG4iLCJpbXBvcnQgeyBJbnZhbGlkU2hpcFR5cGVFcnJvciB9IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBTaGlwID0gKHR5cGUpID0+IHtcbiAgY29uc3Qgc2V0TGVuZ3RoID0gKCkgPT4ge1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSBcImNhcnJpZXJcIjpcbiAgICAgICAgcmV0dXJuIDU7XG4gICAgICBjYXNlIFwiYmF0dGxlc2hpcFwiOlxuICAgICAgICByZXR1cm4gNDtcbiAgICAgIGNhc2UgXCJjcnVpc2VyXCI6XG4gICAgICBjYXNlIFwic3VibWFyaW5lXCI6XG4gICAgICAgIHJldHVybiAzO1xuICAgICAgY2FzZSBcImRlc3Ryb3llclwiOlxuICAgICAgICByZXR1cm4gMjtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBJbnZhbGlkU2hpcFR5cGVFcnJvcigpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBzaGlwTGVuZ3RoID0gc2V0TGVuZ3RoKCk7XG5cbiAgbGV0IGhpdHMgPSAwO1xuXG4gIGNvbnN0IGhpdCA9ICgpID0+IHtcbiAgICBpZiAoaGl0cyA8IHNoaXBMZW5ndGgpIHtcbiAgICAgIGhpdHMgKz0gMTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBnZXQgdHlwZSgpIHtcbiAgICAgIHJldHVybiB0eXBlO1xuICAgIH0sXG4gICAgZ2V0IHNoaXBMZW5ndGgoKSB7XG4gICAgICByZXR1cm4gc2hpcExlbmd0aDtcbiAgICB9LFxuICAgIGdldCBoaXRzKCkge1xuICAgICAgcmV0dXJuIGhpdHM7XG4gICAgfSxcbiAgICBnZXQgaXNTdW5rKCkge1xuICAgICAgcmV0dXJuIGhpdHMgPT09IHNoaXBMZW5ndGg7XG4gICAgfSxcbiAgICBoaXQsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTaGlwO1xuIiwiaW1wb3J0IEdhbWVib2FyZCBmcm9tIFwiLi9nYW1lYm9hcmRcIjtcblxuLypcbi8vLy8vLy8vL1BTRVVET0NPREUvLy8vLy8vL1xuXG5CVUlMRElORyBUSEUgRElTUExBWSBET00gRUxFTUVOVFMgRk9SIEVBQ0ggU0hJUFxuLSBUYWtlIHRoZSBzaGlwIG9iamVjdCB0byBidWlsZCBhIGRpc3BsYXkgZm9yIGFzIGFuIGFyZ3VtZW50LlxuLSBFeHRyYWN0IHRoZSB0eXBlIGFuZC9vciBzaGlwTGVuZ3RoIG9mIHRoZSBzaGlwIGFzIGNvbnN0YW50cy5cbi0gVXNlIHRoZSBzaGlwJ3MgbGVuZ3RoIGFuZC9vciB0eXBlIHRvIGNyZWF0ZSBhIHZpc3VhbCBkaXNwbGF5IGVsZW1lbnQgb2YgdGhlXG4gIGNvcnJlY3Qgc2l6ZS5cbiAgLSBHaXZlIGVhY2ggc2VjdGlvbiBvZiB0aGUgc2hpcCBhIHVuaXF1ZSBpZC5cbiAgLSBTZXQgdGhlIFRhaWx3aW5kQ1NTIGNsYXNzZXMgZm9yIGVhY2ggc2VjdGlvbiBvZiB0aGUgc2hpcC4gIFxuLSBSZXR1cm4gdGhlIGRpc3BsYXkgZWxlbWVudCByZWFkeSBmb3IgcHVzaGluZyB0byB0aGUgRE9NLlxuICAtIEVpdGhlciByZXR1cm4gYW4gYXJyYXkgb2YgdGhlc2UgZWxlbWVudHMgb3IgYSBmdWxsIGRpdi9jb250YWluZXIgd2l0aCB0aGVcbiAgICBzZWN0aW9ucyBsYWlkIG91dC5cbiAgXG5SRU5ERVIgVEhFIFNISVBTIFRPIFRIRSBTSElQIFNUQVRVUyBESVNQTEFZXG4tIFRha2UgdGhlIHBsYXllciBvYmplY3QgaW4gYXMgYW4gYXJndW1lbnQuXG4tIEZyb20gdGhlIHR5cGUgb2YgcGxheWVyLCBzZXQgdGhlIGlkIHNlbGVjdG9yIGZvciB0aGUgRE9NIGVsZW1lbnQuXG4tIFVzZSB0aGUgaWQgc2VsZWN0b3IgYW5kIGNsYXNzIHNlbGVjdG9yIG9mIHRoZSBcInNoaXBzLWNvbnRhaW5lclwiIHRvIGdldCB0aGVcbiAgY29ycmVjdCBET00gY29udGFpbmVyLlxuLSBGb3IgZWFjaCBzaGlwIGluIHRoZSBwbGF5ZXIncyBhcnJheSwgcmVuZGVyIGEgY29udGFpbmVyIHdpdGggdGhlIHR5cGUgb2Ygc2hpcFxuICBhbmQgYW5vdGhlciBjb250YWluZXIgd2l0aCBlYWNoIHNlY3Rpb24gb2YgdGhlIHNoaXAgbGFpZCBvdXQuXG4qL1xuXG4vLyBBcnJheSBvZiBkaWZmZXJlbnQgc2hpcCB0eXBlcyBhbmQgdGhlaXIgbGVuZ3Roc1xuY29uc3Qgc2hpcFR5cGVzID0gW1xuICB7IHR5cGU6IFwiY2FycmllclwiLCBzaGlwTGVuZ3RoOiA1IH0sXG4gIHsgdHlwZTogXCJiYXR0bGVzaGlwXCIsIHNoaXBMZW5ndGg6IDQgfSxcbiAgeyB0eXBlOiBcImNydWlzZXJcIiwgc2hpcExlbmd0aDogMyB9LFxuICB7IHR5cGU6IFwic3VibWFyaW5lXCIsIHNoaXBMZW5ndGg6IDMgfSxcbiAgeyB0eXBlOiBcImRlc3Ryb3llclwiLCBzaGlwTGVuZ3RoOiAyIH0sXG5dO1xuXG4vLyBGdW5jdGlvbiBmb3IgYnVpbGRpbmcgYSBzaGlwLCBkZXBlbmRpbmcgb24gdGhlIHNoaXAgdHlwZVxuY29uc3QgYnVpbGRTaGlwID0gKG9iaiwgZG9tU2VsKSA9PiB7XG4gIC8vIEV4dHJhY3QgdGhlIHNoaXAncyB0eXBlIGFuZCBsZW5ndGggZnJvbSB0aGUgb2JqZWN0XG4gIGNvbnN0IHsgdHlwZSwgc2hpcExlbmd0aDogbGVuZ3RoIH0gPSBvYmo7XG4gIC8vIENyZWF0ZSBhbmQgYXJyYXkgZm9yIHRoZSBzaGlwJ3Mgc2VjdGlvbnNcbiAgY29uc3Qgc2hpcFNlY3RzID0gW107XG5cbiAgLy8gVXNlIHRoZSBsZW5ndGggb2YgdGhlIHNoaXAgdG8gY3JlYXRlIHRoZSBjb3JyZWN0IG51bWJlciBvZiBzZWN0aW9uc1xuICBmb3IgKGxldCBpID0gMTsgaSA8IGxlbmd0aCArIDE7IGkrKykge1xuICAgIC8vIENyZWF0ZSBhbiBlbGVtZW50IGZvciB0aGUgc2VjdGlvblxuICAgIGNvbnN0IHNlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHNlY3QuY2xhc3NOYW1lID0gXCJ3LTQgaC00IHJvdW5kZWQtZnVsbCBiZy1ncmF5LTgwMFwiOyAvLyBTZXQgdGhlIGRlZmF1bHQgc3R5bGluZyBmb3IgdGhlIHNlY3Rpb24gZWxlbWVudFxuICAgIHNlY3Quc2V0QXR0cmlidXRlKFwiaWRcIiwgYERPTS0ke2RvbVNlbH0tc2hpcC0ke3R5cGV9LXNlY3QtJHtpfWApOyAvLyBTZXQgYSB1bmlxdWUgaWQgZm9yIHRoZSBzaGlwIHNlY3Rpb25cbiAgICBzaGlwU2VjdHMucHVzaChzZWN0KTsgLy8gQWRkIHRoZSBzZWN0aW9uIHRvIHRoZSBhcnJheVxuICB9XG5cbiAgLy8gUmV0dXJuIHRoZSBhcnJheSBvZiBzaGlwIHNlY3Rpb25zXG4gIHJldHVybiBzaGlwU2VjdHM7XG59O1xuXG4vLyBUaGUgZnVuY3Rpb24gZm9yIHVwZGF0aW5nIHRoZSBvdXRwdXQgZGl2IGVsZW1lbnRcbmNvbnN0IHVwZGF0ZU91dHB1dCA9IChtZXNzYWdlLCBvdXRwdXQpID0+IHtcbiAgLy8gQXBwZW5kIG5ldyBtZXNzYWdlXG4gIGNvbnN0IG1lc3NhZ2VFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTsgLy8gQ3JlYXRlIGEgbmV3IGRpdiBmb3IgdGhlIG1lc3NhZ2VcbiAgbWVzc2FnZUVsZW1lbnQudGV4dENvbnRlbnQgPSBtZXNzYWdlOyAvLyBTZXQgdGhlIHRleHQgY29udGVudCB0byB0aGUgbWVzc2FnZVxuICBvdXRwdXQuYXBwZW5kQ2hpbGQobWVzc2FnZUVsZW1lbnQpOyAvLyBBZGQgdGhlIGVsZW1lbnQgdG8gdGhlIG91dHB1dFxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBvdXRwdXQuc2Nyb2xsVG9wID0gb3V0cHV0LnNjcm9sbEhlaWdodDsgLy8gU2Nyb2xsIHRvIHRoZSBib3R0b20gb2YgdGhlIG91dHB1dCBjb250YWluZXJcbn07XG5cbi8vIFRoZSBmdW5jdGlvbiBmb3IgZXhlY3V0aW5nIGNvbW1hbmRzIGZyb20gdGhlIGNvbnNvbGUgaW5wdXRcbmNvbnN0IGV4ZWN1dGVDb21tYW5kID0gKGNvbW1hbmQsIG91dHB1dCkgPT4ge1xuICAvLyBQcm9jZXNzIHRoZSBjb21tYW5kXG4gIC8vIEZvciBleGFtcGxlLCBpZiBjb21tYW5kIGlzIFwibW92ZSBBMVwiLCBjYWxsIHRoZSByZWxldmFudCBnYW1lIGZ1bmN0aW9uXG4gIGNvbnNvbGUubG9nKGBFeGVjdXRpbmcgY29tbWFuZDogJHtjb21tYW5kfWApOyAvLyBQbGFjZWhvbGRlciBmb3IgYWN0dWFsIGNvbW1hbmQgcHJvY2Vzc2luZ1xuXG4gIC8vIFVwZGF0ZSB0aGUgY29uc29sZSBvdXRwdXRcbiAgdXBkYXRlT3V0cHV0KGA+ICR7Y29tbWFuZH1gLCBvdXRwdXQpO1xuXG4gIC8vIENsZWFyIHRoZSBpbnB1dFxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtaW5wdXRcIikudmFsdWUgPSBcIlwiO1xufTtcblxuLy8gRnVuY3Rpb24gY2FsbGVkIHdoZW4gYSBjZWxsIG9uIHRoZSBnYW1ib2FyZCBpcyBjbGlja2VkXG5jb25zdCBnYW1lYm9hcmRDbGljayA9IChldmVudCkgPT4ge1xuICAvLyBHZXQgdGhlIHRhcmdldCBlbGVtZW50XG4gIGNvbnN0IHsgaWQgfSA9IGV2ZW50LnRhcmdldDtcbiAgLy8gR2V0IHRoZSB0YXJnZXQgcGxheWVyIGFuZCBwb3NpdGlvbiBkYXRhc2V0IGF0dHJpYnV0ZXNcbiAgY29uc3QgeyBwbGF5ZXIsIHBvc2l0aW9uIH0gPSBldmVudC50YXJnZXQuZGF0YXNldDtcbiAgY29uc29sZS5sb2coXG4gICAgYENsaWNrZWQgY2VsbCBJRDogJHtpZH0uIFBsYXllciAmIHBvc2l0aW9uOiAke3BsYXllcn0sICR7cG9zaXRpb259LmAsXG4gICk7XG59O1xuXG5jb25zdCBVaU1hbmFnZXIgPSAoKSA9PiB7XG4gIGNvbnN0IHsgZ3JpZCB9ID0gR2FtZWJvYXJkKCk7XG5cbiAgY29uc3QgY3JlYXRlR2FtZWJvYXJkID0gKGNvbnRhaW5lcklEKSA9PiB7XG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVySUQpO1xuXG4gICAgLy8gU2V0IHBsYXllciB0eXBlIGRlcGVuZGluZyBvbiB0aGUgY29udGFpbmVySURcbiAgICBjb25zdCB7IHBsYXllciB9ID0gY29udGFpbmVyLmRhdGFzZXQ7XG5cbiAgICAvLyBDcmVhdGUgdGhlIGdyaWQgY29udGFpbmVyXG4gICAgY29uc3QgZ3JpZERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZ3JpZERpdi5jbGFzc05hbWUgPSBcImdyaWQgZ3JpZC1jb2xzLTExIGF1dG8tcm93cy1taW4gZ2FwLTEgcC02XCI7XG5cbiAgICAvLyBBZGQgdGhlIHRvcC1sZWZ0IGNvcm5lciBlbXB0eSBjZWxsXG4gICAgZ3JpZERpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpKTtcblxuICAgIC8vIEFkZCBjb2x1bW4gaGVhZGVycyBBLUpcbiAgICBjb25zdCBjb2x1bW5zID0gXCJBQkNERUZHSElKXCI7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2x1bW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgaGVhZGVyLmNsYXNzTmFtZSA9IFwidGV4dC1jZW50ZXJcIjtcbiAgICAgIGhlYWRlci50ZXh0Q29udGVudCA9IGNvbHVtbnNbaV07XG4gICAgICBncmlkRGl2LmFwcGVuZENoaWxkKGhlYWRlcik7XG4gICAgfVxuXG4gICAgLy8gQWRkIHJvdyBsYWJlbHMgYW5kIGNlbGxzXG4gICAgZm9yIChsZXQgcm93ID0gMTsgcm93IDw9IDEwOyByb3crKykge1xuICAgICAgLy8gUm93IGxhYmVsXG4gICAgICBjb25zdCByb3dMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICByb3dMYWJlbC5jbGFzc05hbWUgPSBcInRleHQtY2VudGVyXCI7XG4gICAgICByb3dMYWJlbC50ZXh0Q29udGVudCA9IHJvdztcbiAgICAgIGdyaWREaXYuYXBwZW5kQ2hpbGQocm93TGFiZWwpO1xuXG4gICAgICAvLyBDZWxscyBmb3IgZWFjaCByb3dcbiAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IDEwOyBjb2wrKykge1xuICAgICAgICBjb25zdCBjZWxsSWQgPSBgJHtjb2x1bW5zW2NvbF19JHtyb3d9YDsgLy8gU2V0IHRoZSBjZWxsSWRcbiAgICAgICAgY29uc3QgY2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNlbGwuaWQgPSBgJHtwbGF5ZXJ9LSR7Y2VsbElkfWA7IC8vIFNldCB0aGUgZWxlbWVudCBpZFxuICAgICAgICBjZWxsLmNsYXNzTmFtZSA9IFwidy02IGgtNiBiZy1ncmF5LTIwMCBjdXJzb3ItcG9pbnRlclwiOyAvLyBBZGQgbW9yZSBjbGFzc2VzIGFzIG5lZWRlZCBmb3Igc3R5bGluZ1xuICAgICAgICBjZWxsLmRhdGFzZXQucG9zaXRpb24gPSBjZWxsSWQ7IC8vIEFzc2lnbiBwb3NpdGlvbiBkYXRhIGF0dHJpYnV0ZSBmb3IgaWRlbnRpZmljYXRpb25cbiAgICAgICAgY2VsbC5kYXRhc2V0LnBsYXllciA9IHBsYXllcjsgLy8gQXNzaWduIHBsYXllciBkYXRhIGF0dHJpYnV0ZSBmb3IgaWRlbnRpZmljYXRpb25cblxuICAgICAgICAvLyBBZGQgYW4gZXZlbnQgbGlzdGVuZXIgdG8gdGhlIGNlbGxcbiAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZ2FtZWJvYXJkQ2xpY2spO1xuXG4gICAgICAgIGdyaWREaXYuYXBwZW5kQ2hpbGQoY2VsbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQXBwZW5kIHRoZSBncmlkIHRvIHRoZSBjb250YWluZXJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZ3JpZERpdik7XG4gIH07XG5cbiAgY29uc3QgaW5pdENvbnNvbGVVSSA9ICgpID0+IHtcbiAgICBjb25zdCBjb25zb2xlQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlXCIpOyAvLyBHZXQgdGhlIGNvbnNvbGUgY29udGFpbmVyIGZyb20gdGhlIERPTVxuICAgIGNvbnNvbGVDb250YWluZXIuY2xhc3NMaXN0LmFkZChcbiAgICAgIFwiZmxleFwiLFxuICAgICAgXCJmbGV4LWNvbFwiLFxuICAgICAgXCJqdXN0aWZ5LWJldHdlZW5cIixcbiAgICAgIFwidGV4dC1zbVwiLFxuICAgICk7IC8vIFNldCBmbGV4Ym94IHJ1bGVzIGZvciBjb250YWluZXJcblxuICAgIC8vIENyZWF0ZSBhIGNvbnRhaW5lciBmb3IgdGhlIGlucHV0IGFuZCBidXR0b24gZWxlbWVudHNcbiAgICBjb25zdCBpbnB1dERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgaW5wdXREaXYuY2xhc3NOYW1lID0gXCJmbGV4IGZsZXgtcm93IHctZnVsbCBoLTEvNSBqdXN0aWZ5LWJldHdlZW5cIjsgLy8gU2V0IHRoZSBmbGV4Ym94IHJ1bGVzIGZvciB0aGUgY29udGFpbmVyXG5cbiAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTsgLy8gQ3JlYXRlIGFuIGlucHV0IGVsZW1lbnQgZm9yIHRoZSBjb25zb2xlXG4gICAgaW5wdXQudHlwZSA9IFwidGV4dFwiOyAvLyBTZXQgdGhlIGlucHV0IHR5cGUgb2YgdGhpcyBlbGVtZW50IHRvIHRleHRcbiAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNvbnNvbGUtaW5wdXRcIik7IC8vIFNldCB0aGUgaWQgZm9yIHRoaXMgZWxlbWVudCB0byBcImNvbnNvbGUtaW5wdXRcIlxuICAgIGlucHV0LmNsYXNzTmFtZSA9IFwicC0xIGJnLWdyYXktNDAwIGZsZXgtMVwiOyAvLyBBZGQgVGFpbHdpbmRDU1MgY2xhc3Nlc1xuICAgIGNvbnN0IHN1Ym1pdEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7IC8vIENyZWF0ZSBhIGJ1dHRvbiBlbGVtZW50IGZvciB0aGUgY29uc29sZSBzdWJtaXRcbiAgICBzdWJtaXRCdXR0b24udGV4dENvbnRlbnQgPSBcIlN1Ym1pdFwiOyAvLyBBZGQgdGhlIHRleHQgXCJTdWJtaXRcIiB0byB0aGUgYnV0dG9uXG4gICAgc3VibWl0QnV0dG9uLnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY29uc29sZS1zdWJtaXRcIik7IC8vIFNldCB0aGUgaWQgZm9yIHRoZSBidXR0b25cbiAgICBzdWJtaXRCdXR0b24uY2xhc3NOYW1lID0gXCJweC0zIHB5LTEgYmctZ3JheS04MDAgdGV4dC1jZW50ZXIgdGV4dC1zbVwiOyAvLyBBZGQgVGFpbHdpbmRDU1MgY2xhc3Nlc1xuICAgIGNvbnN0IG91dHB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7IC8vIENyZWF0ZSBhbiBkaXYgZWxlbWVudCBmb3IgdGhlIG91dHB1dCBvZiB0aGUgY29uc29sZVxuICAgIG91dHB1dC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNvbnNvbGUtb3V0cHV0XCIpOyAvLyBTZXQgdGhlIGlkIGZvciB0aGUgb3V0cHV0IGVsZW1lbnRcbiAgICBvdXRwdXQuY2xhc3NOYW1lID0gXCJwLTEgYmctZ3JheS0yMDAgZmxleC0xIGgtNC81IG92ZXJmbG93LWF1dG9cIjsgLy8gQWRkIFRhaWx3aW5kQ1NTIGNsYXNzZXNcblxuICAgIC8vIEFkZCB0aGUgaW5wdXQgZWxlbWVudHMgdG8gdGhlIGlucHV0IGNvbnRhaW5lclxuICAgIGlucHV0RGl2LmFwcGVuZENoaWxkKGlucHV0KTtcbiAgICBpbnB1dERpdi5hcHBlbmRDaGlsZChzdWJtaXRCdXR0b24pO1xuXG4gICAgLy8gQXBwZW5kIGVsZW1lbnRzIHRvIHRoZSBjb25zb2xlIGNvbnRhaW5lclxuICAgIGNvbnNvbGVDb250YWluZXIuYXBwZW5kQ2hpbGQob3V0cHV0KTtcbiAgICBjb25zb2xlQ29udGFpbmVyLmFwcGVuZENoaWxkKGlucHV0RGl2KTtcblxuICAgIC8vIFNldHVwIGV2ZW50IGxpc3RlbmVyc1xuICAgIHN1Ym1pdEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT5cbiAgICAgIGV4ZWN1dGVDb21tYW5kKGlucHV0LnZhbHVlLCBvdXRwdXQpLFxuICAgICk7XG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09IFwiRW50ZXJcIikge1xuICAgICAgICBleGVjdXRlQ29tbWFuZChpbnB1dC52YWx1ZSwgb3V0cHV0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiBmb3IgcmVuZGVyaW5nIHNoaXBzIHRvIHRoZSBTaGlwIFN0YXR1cyBkaXNwbGF5IHNlY3Rpb25cbiAgY29uc3QgcmVuZGVyU2hpcERpc3AgPSAocGxheWVyT2JqKSA9PiB7XG4gICAgbGV0IGlkU2VsO1xuXG4gICAgLy8gU2V0IHRoZSBjb3JyZWN0IGlkIHNlbGVjdG9yIGZvciB0aGUgdHlwZSBvZiBwbGF5ZXJcbiAgICBpZiAocGxheWVyT2JqLnR5cGUgPT09IFwiaHVtYW5cIikge1xuICAgICAgaWRTZWwgPSBcImh1bWFuLXNoaXBzXCI7XG4gICAgfSBlbHNlIGlmIChwbGF5ZXJPYmoudHlwZSA9PT0gXCJjb21wdXRlclwiKSB7XG4gICAgICBpZFNlbCA9IFwiY29tcC1zaGlwc1wiO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcjtcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIGNvcnJlY3QgRE9NIGVsZW1lbnRcbiAgICBjb25zdCBkaXNwRGl2ID0gZG9jdW1lbnRcbiAgICAgIC5nZXRFbGVtZW50QnlJZChpZFNlbClcbiAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLnNoaXBzLWNvbnRhaW5lclwiKTtcblxuICAgIC8vIEZvciBlYWNoIG9mIHRoZSBwbGF5ZXIncyBzaGlwcywgcmVuZGVyIHRoZSBzaGlwIHRvIHRoZSBjb250YWluZXJcbiAgICBPYmplY3QudmFsdWVzKHBsYXllck9iai5nYW1lYm9hcmQuc2hpcHMpLmZvckVhY2goKHNoaXApID0+IHtcbiAgICAgIC8vIENyZWF0ZSBhIGRpdiBmb3IgdGhlIHNoaXBcbiAgICAgIGNvbnN0IHNoaXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgc2hpcERpdi5jbGFzc05hbWUgPSBcInB4LTQgcHktMiBmbGV4IGZsZXgtY29sIGdhcC0xXCI7XG5cbiAgICAgIC8vIEFkZCBhIHRpdGxlIHRoZSB0aGUgZGl2XG4gICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoMlwiKTtcbiAgICAgIHRpdGxlLnRleHRDb250ZW50ID0gc2hpcC50eXBlOyAvLyBTZXQgdGhlIHRpdGxlIHRvIHRoZSBzaGlwIHR5cGVcbiAgICAgIHNoaXBEaXYuYXBwZW5kQ2hpbGQodGl0bGUpO1xuXG4gICAgICAvLyBCdWlsZCB0aGUgc2hpcCBzZWN0aW9uc1xuICAgICAgY29uc3Qgc2hpcFNlY3RzID0gYnVpbGRTaGlwKHNoaXAsIGlkU2VsKTtcblxuICAgICAgLy8gQWRkIHRoZSBzaGlwIHNlY3Rpb25zIHRvIHRoZSBkaXZcbiAgICAgIGNvbnN0IHNlY3RzRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIHNlY3RzRGl2LmNsYXNzTmFtZSA9IFwiZmxleCBmbGV4LXJvdyBnYXAtMVwiO1xuICAgICAgc2hpcFNlY3RzLmZvckVhY2goKHNlY3QpID0+IHtcbiAgICAgICAgc2VjdHNEaXYuYXBwZW5kQ2hpbGQoc2VjdCk7XG4gICAgICB9KTtcbiAgICAgIHNoaXBEaXYuYXBwZW5kQ2hpbGQoc2VjdHNEaXYpO1xuXG4gICAgICBkaXNwRGl2LmFwcGVuZENoaWxkKHNoaXBEaXYpO1xuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgY3JlYXRlR2FtZWJvYXJkLFxuICAgIGluaXRDb25zb2xlVUksXG4gICAgcmVuZGVyU2hpcERpc3AsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBVaU1hbmFnZXI7XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBgLypcbiEgdGFpbHdpbmRjc3MgdjMuNC4xIHwgTUlUIExpY2Vuc2UgfCBodHRwczovL3RhaWx3aW5kY3NzLmNvbVxuKi8vKlxuMS4gUHJldmVudCBwYWRkaW5nIGFuZCBib3JkZXIgZnJvbSBhZmZlY3RpbmcgZWxlbWVudCB3aWR0aC4gKGh0dHBzOi8vZ2l0aHViLmNvbS9tb3pkZXZzL2Nzc3JlbWVkeS9pc3N1ZXMvNClcbjIuIEFsbG93IGFkZGluZyBhIGJvcmRlciB0byBhbiBlbGVtZW50IGJ5IGp1c3QgYWRkaW5nIGEgYm9yZGVyLXdpZHRoLiAoaHR0cHM6Ly9naXRodWIuY29tL3RhaWx3aW5kY3NzL3RhaWx3aW5kY3NzL3B1bGwvMTE2KVxuKi9cblxuKixcbjo6YmVmb3JlLFxuOjphZnRlciB7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7IC8qIDEgKi9cbiAgYm9yZGVyLXdpZHRoOiAwOyAvKiAyICovXG4gIGJvcmRlci1zdHlsZTogc29saWQ7IC8qIDIgKi9cbiAgYm9yZGVyLWNvbG9yOiAjZTVlN2ViOyAvKiAyICovXG59XG5cbjo6YmVmb3JlLFxuOjphZnRlciB7XG4gIC0tdHctY29udGVudDogJyc7XG59XG5cbi8qXG4xLiBVc2UgYSBjb25zaXN0ZW50IHNlbnNpYmxlIGxpbmUtaGVpZ2h0IGluIGFsbCBicm93c2Vycy5cbjIuIFByZXZlbnQgYWRqdXN0bWVudHMgb2YgZm9udCBzaXplIGFmdGVyIG9yaWVudGF0aW9uIGNoYW5nZXMgaW4gaU9TLlxuMy4gVXNlIGEgbW9yZSByZWFkYWJsZSB0YWIgc2l6ZS5cbjQuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgc2Fuc1xcYCBmb250LWZhbWlseSBieSBkZWZhdWx0LlxuNS4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBzYW5zXFxgIGZvbnQtZmVhdHVyZS1zZXR0aW5ncyBieSBkZWZhdWx0LlxuNi4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBzYW5zXFxgIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzIGJ5IGRlZmF1bHQuXG43LiBEaXNhYmxlIHRhcCBoaWdobGlnaHRzIG9uIGlPU1xuKi9cblxuaHRtbCxcbjpob3N0IHtcbiAgbGluZS1oZWlnaHQ6IDEuNTsgLyogMSAqL1xuICAtd2Via2l0LXRleHQtc2l6ZS1hZGp1c3Q6IDEwMCU7IC8qIDIgKi9cbiAgLW1vei10YWItc2l6ZTogNDsgLyogMyAqL1xuICAtby10YWItc2l6ZTogNDtcbiAgICAgdGFiLXNpemU6IDQ7IC8qIDMgKi9cbiAgZm9udC1mYW1pbHk6IHVpLXNhbnMtc2VyaWYsIHN5c3RlbS11aSwgc2Fucy1zZXJpZiwgXCJBcHBsZSBDb2xvciBFbW9qaVwiLCBcIlNlZ29lIFVJIEVtb2ppXCIsIFwiU2Vnb2UgVUkgU3ltYm9sXCIsIFwiTm90byBDb2xvciBFbW9qaVwiOyAvKiA0ICovXG4gIGZvbnQtZmVhdHVyZS1zZXR0aW5nczogbm9ybWFsOyAvKiA1ICovXG4gIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzOiBub3JtYWw7IC8qIDYgKi9cbiAgLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOiB0cmFuc3BhcmVudDsgLyogNyAqL1xufVxuXG4vKlxuMS4gUmVtb3ZlIHRoZSBtYXJnaW4gaW4gYWxsIGJyb3dzZXJzLlxuMi4gSW5oZXJpdCBsaW5lLWhlaWdodCBmcm9tIFxcYGh0bWxcXGAgc28gdXNlcnMgY2FuIHNldCB0aGVtIGFzIGEgY2xhc3MgZGlyZWN0bHkgb24gdGhlIFxcYGh0bWxcXGAgZWxlbWVudC5cbiovXG5cbmJvZHkge1xuICBtYXJnaW46IDA7IC8qIDEgKi9cbiAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7IC8qIDIgKi9cbn1cblxuLypcbjEuIEFkZCB0aGUgY29ycmVjdCBoZWlnaHQgaW4gRmlyZWZveC5cbjIuIENvcnJlY3QgdGhlIGluaGVyaXRhbmNlIG9mIGJvcmRlciBjb2xvciBpbiBGaXJlZm94LiAoaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTkwNjU1KVxuMy4gRW5zdXJlIGhvcml6b250YWwgcnVsZXMgYXJlIHZpc2libGUgYnkgZGVmYXVsdC5cbiovXG5cbmhyIHtcbiAgaGVpZ2h0OiAwOyAvKiAxICovXG4gIGNvbG9yOiBpbmhlcml0OyAvKiAyICovXG4gIGJvcmRlci10b3Atd2lkdGg6IDFweDsgLyogMyAqL1xufVxuXG4vKlxuQWRkIHRoZSBjb3JyZWN0IHRleHQgZGVjb3JhdGlvbiBpbiBDaHJvbWUsIEVkZ2UsIGFuZCBTYWZhcmkuXG4qL1xuXG5hYmJyOndoZXJlKFt0aXRsZV0pIHtcbiAgLXdlYmtpdC10ZXh0LWRlY29yYXRpb246IHVuZGVybGluZSBkb3R0ZWQ7XG4gICAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmUgZG90dGVkO1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBkZWZhdWx0IGZvbnQgc2l6ZSBhbmQgd2VpZ2h0IGZvciBoZWFkaW5ncy5cbiovXG5cbmgxLFxuaDIsXG5oMyxcbmg0LFxuaDUsXG5oNiB7XG4gIGZvbnQtc2l6ZTogaW5oZXJpdDtcbiAgZm9udC13ZWlnaHQ6IGluaGVyaXQ7XG59XG5cbi8qXG5SZXNldCBsaW5rcyB0byBvcHRpbWl6ZSBmb3Igb3B0LWluIHN0eWxpbmcgaW5zdGVhZCBvZiBvcHQtb3V0LlxuKi9cblxuYSB7XG4gIGNvbG9yOiBpbmhlcml0O1xuICB0ZXh0LWRlY29yYXRpb246IGluaGVyaXQ7XG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgZm9udCB3ZWlnaHQgaW4gRWRnZSBhbmQgU2FmYXJpLlxuKi9cblxuYixcbnN0cm9uZyB7XG4gIGZvbnQtd2VpZ2h0OiBib2xkZXI7XG59XG5cbi8qXG4xLiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYG1vbm9cXGAgZm9udC1mYW1pbHkgYnkgZGVmYXVsdC5cbjIuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgbW9ub1xcYCBmb250LWZlYXR1cmUtc2V0dGluZ3MgYnkgZGVmYXVsdC5cbjMuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgbW9ub1xcYCBmb250LXZhcmlhdGlvbi1zZXR0aW5ncyBieSBkZWZhdWx0LlxuNC4gQ29ycmVjdCB0aGUgb2RkIFxcYGVtXFxgIGZvbnQgc2l6aW5nIGluIGFsbCBicm93c2Vycy5cbiovXG5cbmNvZGUsXG5rYmQsXG5zYW1wLFxucHJlIHtcbiAgZm9udC1mYW1pbHk6IHVpLW1vbm9zcGFjZSwgU0ZNb25vLVJlZ3VsYXIsIE1lbmxvLCBNb25hY28sIENvbnNvbGFzLCBcIkxpYmVyYXRpb24gTW9ub1wiLCBcIkNvdXJpZXIgTmV3XCIsIG1vbm9zcGFjZTsgLyogMSAqL1xuICBmb250LWZlYXR1cmUtc2V0dGluZ3M6IG5vcm1hbDsgLyogMiAqL1xuICBmb250LXZhcmlhdGlvbi1zZXR0aW5nczogbm9ybWFsOyAvKiAzICovXG4gIGZvbnQtc2l6ZTogMWVtOyAvKiA0ICovXG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgZm9udCBzaXplIGluIGFsbCBicm93c2Vycy5cbiovXG5cbnNtYWxsIHtcbiAgZm9udC1zaXplOiA4MCU7XG59XG5cbi8qXG5QcmV2ZW50IFxcYHN1YlxcYCBhbmQgXFxgc3VwXFxgIGVsZW1lbnRzIGZyb20gYWZmZWN0aW5nIHRoZSBsaW5lIGhlaWdodCBpbiBhbGwgYnJvd3NlcnMuXG4qL1xuXG5zdWIsXG5zdXAge1xuICBmb250LXNpemU6IDc1JTtcbiAgbGluZS1oZWlnaHQ6IDA7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xufVxuXG5zdWIge1xuICBib3R0b206IC0wLjI1ZW07XG59XG5cbnN1cCB7XG4gIHRvcDogLTAuNWVtO1xufVxuXG4vKlxuMS4gUmVtb3ZlIHRleHQgaW5kZW50YXRpb24gZnJvbSB0YWJsZSBjb250ZW50cyBpbiBDaHJvbWUgYW5kIFNhZmFyaS4gKGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTk5OTA4OCwgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTIwMTI5NylcbjIuIENvcnJlY3QgdGFibGUgYm9yZGVyIGNvbG9yIGluaGVyaXRhbmNlIGluIGFsbCBDaHJvbWUgYW5kIFNhZmFyaS4gKGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTkzNTcyOSwgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE5NTAxNilcbjMuIFJlbW92ZSBnYXBzIGJldHdlZW4gdGFibGUgYm9yZGVycyBieSBkZWZhdWx0LlxuKi9cblxudGFibGUge1xuICB0ZXh0LWluZGVudDogMDsgLyogMSAqL1xuICBib3JkZXItY29sb3I6IGluaGVyaXQ7IC8qIDIgKi9cbiAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsgLyogMyAqL1xufVxuXG4vKlxuMS4gQ2hhbmdlIHRoZSBmb250IHN0eWxlcyBpbiBhbGwgYnJvd3NlcnMuXG4yLiBSZW1vdmUgdGhlIG1hcmdpbiBpbiBGaXJlZm94IGFuZCBTYWZhcmkuXG4zLiBSZW1vdmUgZGVmYXVsdCBwYWRkaW5nIGluIGFsbCBicm93c2Vycy5cbiovXG5cbmJ1dHRvbixcbmlucHV0LFxub3B0Z3JvdXAsXG5zZWxlY3QsXG50ZXh0YXJlYSB7XG4gIGZvbnQtZmFtaWx5OiBpbmhlcml0OyAvKiAxICovXG4gIGZvbnQtZmVhdHVyZS1zZXR0aW5nczogaW5oZXJpdDsgLyogMSAqL1xuICBmb250LXZhcmlhdGlvbi1zZXR0aW5nczogaW5oZXJpdDsgLyogMSAqL1xuICBmb250LXNpemU6IDEwMCU7IC8qIDEgKi9cbiAgZm9udC13ZWlnaHQ6IGluaGVyaXQ7IC8qIDEgKi9cbiAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7IC8qIDEgKi9cbiAgY29sb3I6IGluaGVyaXQ7IC8qIDEgKi9cbiAgbWFyZ2luOiAwOyAvKiAyICovXG4gIHBhZGRpbmc6IDA7IC8qIDMgKi9cbn1cblxuLypcblJlbW92ZSB0aGUgaW5oZXJpdGFuY2Ugb2YgdGV4dCB0cmFuc2Zvcm0gaW4gRWRnZSBhbmQgRmlyZWZveC5cbiovXG5cbmJ1dHRvbixcbnNlbGVjdCB7XG4gIHRleHQtdHJhbnNmb3JtOiBub25lO1xufVxuXG4vKlxuMS4gQ29ycmVjdCB0aGUgaW5hYmlsaXR5IHRvIHN0eWxlIGNsaWNrYWJsZSB0eXBlcyBpbiBpT1MgYW5kIFNhZmFyaS5cbjIuIFJlbW92ZSBkZWZhdWx0IGJ1dHRvbiBzdHlsZXMuXG4qL1xuXG5idXR0b24sXG5bdHlwZT0nYnV0dG9uJ10sXG5bdHlwZT0ncmVzZXQnXSxcblt0eXBlPSdzdWJtaXQnXSB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogYnV0dG9uOyAvKiAxICovXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50OyAvKiAyICovXG4gIGJhY2tncm91bmQtaW1hZ2U6IG5vbmU7IC8qIDIgKi9cbn1cblxuLypcblVzZSB0aGUgbW9kZXJuIEZpcmVmb3ggZm9jdXMgc3R5bGUgZm9yIGFsbCBmb2N1c2FibGUgZWxlbWVudHMuXG4qL1xuXG46LW1vei1mb2N1c3Jpbmcge1xuICBvdXRsaW5lOiBhdXRvO1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBhZGRpdGlvbmFsIFxcYDppbnZhbGlkXFxgIHN0eWxlcyBpbiBGaXJlZm94LiAoaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvZ2Vja28tZGV2L2Jsb2IvMmY5ZWFjZDlkM2Q5OTVjOTM3YjQyNTFhNTU1N2Q5NWQ0OTRjOWJlMS9sYXlvdXQvc3R5bGUvcmVzL2Zvcm1zLmNzcyNMNzI4LUw3MzcpXG4qL1xuXG46LW1vei11aS1pbnZhbGlkIHtcbiAgYm94LXNoYWRvdzogbm9uZTtcbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCB2ZXJ0aWNhbCBhbGlnbm1lbnQgaW4gQ2hyb21lIGFuZCBGaXJlZm94LlxuKi9cblxucHJvZ3Jlc3Mge1xuICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XG59XG5cbi8qXG5Db3JyZWN0IHRoZSBjdXJzb3Igc3R5bGUgb2YgaW5jcmVtZW50IGFuZCBkZWNyZW1lbnQgYnV0dG9ucyBpbiBTYWZhcmkuXG4qL1xuXG46Oi13ZWJraXQtaW5uZXItc3Bpbi1idXR0b24sXG46Oi13ZWJraXQtb3V0ZXItc3Bpbi1idXR0b24ge1xuICBoZWlnaHQ6IGF1dG87XG59XG5cbi8qXG4xLiBDb3JyZWN0IHRoZSBvZGQgYXBwZWFyYW5jZSBpbiBDaHJvbWUgYW5kIFNhZmFyaS5cbjIuIENvcnJlY3QgdGhlIG91dGxpbmUgc3R5bGUgaW4gU2FmYXJpLlxuKi9cblxuW3R5cGU9J3NlYXJjaCddIHtcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiB0ZXh0ZmllbGQ7IC8qIDEgKi9cbiAgb3V0bGluZS1vZmZzZXQ6IC0ycHg7IC8qIDIgKi9cbn1cblxuLypcblJlbW92ZSB0aGUgaW5uZXIgcGFkZGluZyBpbiBDaHJvbWUgYW5kIFNhZmFyaSBvbiBtYWNPUy5cbiovXG5cbjo6LXdlYmtpdC1zZWFyY2gtZGVjb3JhdGlvbiB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcbn1cblxuLypcbjEuIENvcnJlY3QgdGhlIGluYWJpbGl0eSB0byBzdHlsZSBjbGlja2FibGUgdHlwZXMgaW4gaU9TIGFuZCBTYWZhcmkuXG4yLiBDaGFuZ2UgZm9udCBwcm9wZXJ0aWVzIHRvIFxcYGluaGVyaXRcXGAgaW4gU2FmYXJpLlxuKi9cblxuOjotd2Via2l0LWZpbGUtdXBsb2FkLWJ1dHRvbiB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogYnV0dG9uOyAvKiAxICovXG4gIGZvbnQ6IGluaGVyaXQ7IC8qIDIgKi9cbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCBkaXNwbGF5IGluIENocm9tZSBhbmQgU2FmYXJpLlxuKi9cblxuc3VtbWFyeSB7XG4gIGRpc3BsYXk6IGxpc3QtaXRlbTtcbn1cblxuLypcblJlbW92ZXMgdGhlIGRlZmF1bHQgc3BhY2luZyBhbmQgYm9yZGVyIGZvciBhcHByb3ByaWF0ZSBlbGVtZW50cy5cbiovXG5cbmJsb2NrcXVvdGUsXG5kbCxcbmRkLFxuaDEsXG5oMixcbmgzLFxuaDQsXG5oNSxcbmg2LFxuaHIsXG5maWd1cmUsXG5wLFxucHJlIHtcbiAgbWFyZ2luOiAwO1xufVxuXG5maWVsZHNldCB7XG4gIG1hcmdpbjogMDtcbiAgcGFkZGluZzogMDtcbn1cblxubGVnZW5kIHtcbiAgcGFkZGluZzogMDtcbn1cblxub2wsXG51bCxcbm1lbnUge1xuICBsaXN0LXN0eWxlOiBub25lO1xuICBtYXJnaW46IDA7XG4gIHBhZGRpbmc6IDA7XG59XG5cbi8qXG5SZXNldCBkZWZhdWx0IHN0eWxpbmcgZm9yIGRpYWxvZ3MuXG4qL1xuZGlhbG9nIHtcbiAgcGFkZGluZzogMDtcbn1cblxuLypcblByZXZlbnQgcmVzaXppbmcgdGV4dGFyZWFzIGhvcml6b250YWxseSBieSBkZWZhdWx0LlxuKi9cblxudGV4dGFyZWEge1xuICByZXNpemU6IHZlcnRpY2FsO1xufVxuXG4vKlxuMS4gUmVzZXQgdGhlIGRlZmF1bHQgcGxhY2Vob2xkZXIgb3BhY2l0eSBpbiBGaXJlZm94LiAoaHR0cHM6Ly9naXRodWIuY29tL3RhaWx3aW5kbGFicy90YWlsd2luZGNzcy9pc3N1ZXMvMzMwMClcbjIuIFNldCB0aGUgZGVmYXVsdCBwbGFjZWhvbGRlciBjb2xvciB0byB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgZ3JheSA0MDAgY29sb3IuXG4qL1xuXG5pbnB1dDo6LW1vei1wbGFjZWhvbGRlciwgdGV4dGFyZWE6Oi1tb3otcGxhY2Vob2xkZXIge1xuICBvcGFjaXR5OiAxOyAvKiAxICovXG4gIGNvbG9yOiAjOWNhM2FmOyAvKiAyICovXG59XG5cbmlucHV0OjpwbGFjZWhvbGRlcixcbnRleHRhcmVhOjpwbGFjZWhvbGRlciB7XG4gIG9wYWNpdHk6IDE7IC8qIDEgKi9cbiAgY29sb3I6ICM5Y2EzYWY7IC8qIDIgKi9cbn1cblxuLypcblNldCB0aGUgZGVmYXVsdCBjdXJzb3IgZm9yIGJ1dHRvbnMuXG4qL1xuXG5idXR0b24sXG5bcm9sZT1cImJ1dHRvblwiXSB7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cblxuLypcbk1ha2Ugc3VyZSBkaXNhYmxlZCBidXR0b25zIGRvbid0IGdldCB0aGUgcG9pbnRlciBjdXJzb3IuXG4qL1xuOmRpc2FibGVkIHtcbiAgY3Vyc29yOiBkZWZhdWx0O1xufVxuXG4vKlxuMS4gTWFrZSByZXBsYWNlZCBlbGVtZW50cyBcXGBkaXNwbGF5OiBibG9ja1xcYCBieSBkZWZhdWx0LiAoaHR0cHM6Ly9naXRodWIuY29tL21vemRldnMvY3NzcmVtZWR5L2lzc3Vlcy8xNClcbjIuIEFkZCBcXGB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlXFxgIHRvIGFsaWduIHJlcGxhY2VkIGVsZW1lbnRzIG1vcmUgc2Vuc2libHkgYnkgZGVmYXVsdC4gKGh0dHBzOi8vZ2l0aHViLmNvbS9qZW5zaW1tb25zL2Nzc3JlbWVkeS9pc3N1ZXMvMTQjaXNzdWVjb21tZW50LTYzNDkzNDIxMClcbiAgIFRoaXMgY2FuIHRyaWdnZXIgYSBwb29ybHkgY29uc2lkZXJlZCBsaW50IGVycm9yIGluIHNvbWUgdG9vbHMgYnV0IGlzIGluY2x1ZGVkIGJ5IGRlc2lnbi5cbiovXG5cbmltZyxcbnN2ZyxcbnZpZGVvLFxuY2FudmFzLFxuYXVkaW8sXG5pZnJhbWUsXG5lbWJlZCxcbm9iamVjdCB7XG4gIGRpc3BsYXk6IGJsb2NrOyAvKiAxICovXG4gIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7IC8qIDIgKi9cbn1cblxuLypcbkNvbnN0cmFpbiBpbWFnZXMgYW5kIHZpZGVvcyB0byB0aGUgcGFyZW50IHdpZHRoIGFuZCBwcmVzZXJ2ZSB0aGVpciBpbnRyaW5zaWMgYXNwZWN0IHJhdGlvLiAoaHR0cHM6Ly9naXRodWIuY29tL21vemRldnMvY3NzcmVtZWR5L2lzc3Vlcy8xNClcbiovXG5cbmltZyxcbnZpZGVvIHtcbiAgbWF4LXdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IGF1dG87XG59XG5cbi8qIE1ha2UgZWxlbWVudHMgd2l0aCB0aGUgSFRNTCBoaWRkZW4gYXR0cmlidXRlIHN0YXkgaGlkZGVuIGJ5IGRlZmF1bHQgKi9cbltoaWRkZW5dIHtcbiAgZGlzcGxheTogbm9uZTtcbn1cblxuKiwgOjpiZWZvcmUsIDo6YWZ0ZXIge1xuICAtLXR3LWJvcmRlci1zcGFjaW5nLXg6IDA7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteTogMDtcbiAgLS10dy10cmFuc2xhdGUteDogMDtcbiAgLS10dy10cmFuc2xhdGUteTogMDtcbiAgLS10dy1yb3RhdGU6IDA7XG4gIC0tdHctc2tldy14OiAwO1xuICAtLXR3LXNrZXcteTogMDtcbiAgLS10dy1zY2FsZS14OiAxO1xuICAtLXR3LXNjYWxlLXk6IDE7XG4gIC0tdHctcGFuLXg6ICA7XG4gIC0tdHctcGFuLXk6ICA7XG4gIC0tdHctcGluY2gtem9vbTogIDtcbiAgLS10dy1zY3JvbGwtc25hcC1zdHJpY3RuZXNzOiBwcm94aW1pdHk7XG4gIC0tdHctZ3JhZGllbnQtZnJvbS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC12aWEtcG9zaXRpb246ICA7XG4gIC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb246ICA7XG4gIC0tdHctb3JkaW5hbDogIDtcbiAgLS10dy1zbGFzaGVkLXplcm86ICA7XG4gIC0tdHctbnVtZXJpYy1maWd1cmU6ICA7XG4gIC0tdHctbnVtZXJpYy1zcGFjaW5nOiAgO1xuICAtLXR3LW51bWVyaWMtZnJhY3Rpb246ICA7XG4gIC0tdHctcmluZy1pbnNldDogIDtcbiAgLS10dy1yaW5nLW9mZnNldC13aWR0aDogMHB4O1xuICAtLXR3LXJpbmctb2Zmc2V0LWNvbG9yOiAjZmZmO1xuICAtLXR3LXJpbmctY29sb3I6IHJnYig1OSAxMzAgMjQ2IC8gMC41KTtcbiAgLS10dy1yaW5nLW9mZnNldC1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1yaW5nLXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdy1jb2xvcmVkOiAwIDAgIzAwMDA7XG4gIC0tdHctYmx1cjogIDtcbiAgLS10dy1icmlnaHRuZXNzOiAgO1xuICAtLXR3LWNvbnRyYXN0OiAgO1xuICAtLXR3LWdyYXlzY2FsZTogIDtcbiAgLS10dy1odWUtcm90YXRlOiAgO1xuICAtLXR3LWludmVydDogIDtcbiAgLS10dy1zYXR1cmF0ZTogIDtcbiAgLS10dy1zZXBpYTogIDtcbiAgLS10dy1kcm9wLXNoYWRvdzogIDtcbiAgLS10dy1iYWNrZHJvcC1ibHVyOiAgO1xuICAtLXR3LWJhY2tkcm9wLWJyaWdodG5lc3M6ICA7XG4gIC0tdHctYmFja2Ryb3AtY29udHJhc3Q6ICA7XG4gIC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlOiAgO1xuICAtLXR3LWJhY2tkcm9wLWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaW52ZXJ0OiAgO1xuICAtLXR3LWJhY2tkcm9wLW9wYWNpdHk6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2F0dXJhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2VwaWE6ICA7XG59XG5cbjo6YmFja2Ryb3Age1xuICAtLXR3LWJvcmRlci1zcGFjaW5nLXg6IDA7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteTogMDtcbiAgLS10dy10cmFuc2xhdGUteDogMDtcbiAgLS10dy10cmFuc2xhdGUteTogMDtcbiAgLS10dy1yb3RhdGU6IDA7XG4gIC0tdHctc2tldy14OiAwO1xuICAtLXR3LXNrZXcteTogMDtcbiAgLS10dy1zY2FsZS14OiAxO1xuICAtLXR3LXNjYWxlLXk6IDE7XG4gIC0tdHctcGFuLXg6ICA7XG4gIC0tdHctcGFuLXk6ICA7XG4gIC0tdHctcGluY2gtem9vbTogIDtcbiAgLS10dy1zY3JvbGwtc25hcC1zdHJpY3RuZXNzOiBwcm94aW1pdHk7XG4gIC0tdHctZ3JhZGllbnQtZnJvbS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC12aWEtcG9zaXRpb246ICA7XG4gIC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb246ICA7XG4gIC0tdHctb3JkaW5hbDogIDtcbiAgLS10dy1zbGFzaGVkLXplcm86ICA7XG4gIC0tdHctbnVtZXJpYy1maWd1cmU6ICA7XG4gIC0tdHctbnVtZXJpYy1zcGFjaW5nOiAgO1xuICAtLXR3LW51bWVyaWMtZnJhY3Rpb246ICA7XG4gIC0tdHctcmluZy1pbnNldDogIDtcbiAgLS10dy1yaW5nLW9mZnNldC13aWR0aDogMHB4O1xuICAtLXR3LXJpbmctb2Zmc2V0LWNvbG9yOiAjZmZmO1xuICAtLXR3LXJpbmctY29sb3I6IHJnYig1OSAxMzAgMjQ2IC8gMC41KTtcbiAgLS10dy1yaW5nLW9mZnNldC1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1yaW5nLXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdy1jb2xvcmVkOiAwIDAgIzAwMDA7XG4gIC0tdHctYmx1cjogIDtcbiAgLS10dy1icmlnaHRuZXNzOiAgO1xuICAtLXR3LWNvbnRyYXN0OiAgO1xuICAtLXR3LWdyYXlzY2FsZTogIDtcbiAgLS10dy1odWUtcm90YXRlOiAgO1xuICAtLXR3LWludmVydDogIDtcbiAgLS10dy1zYXR1cmF0ZTogIDtcbiAgLS10dy1zZXBpYTogIDtcbiAgLS10dy1kcm9wLXNoYWRvdzogIDtcbiAgLS10dy1iYWNrZHJvcC1ibHVyOiAgO1xuICAtLXR3LWJhY2tkcm9wLWJyaWdodG5lc3M6ICA7XG4gIC0tdHctYmFja2Ryb3AtY29udHJhc3Q6ICA7XG4gIC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlOiAgO1xuICAtLXR3LWJhY2tkcm9wLWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaW52ZXJ0OiAgO1xuICAtLXR3LWJhY2tkcm9wLW9wYWNpdHk6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2F0dXJhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2VwaWE6ICA7XG59XG4uY29udGFpbmVyIHtcbiAgd2lkdGg6IDEwMCU7XG59XG5AbWVkaWEgKG1pbi13aWR0aDogNjQwcHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDY0MHB4O1xuICB9XG59XG5AbWVkaWEgKG1pbi13aWR0aDogNzY4cHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDc2OHB4O1xuICB9XG59XG5AbWVkaWEgKG1pbi13aWR0aDogMTAyNHB4KSB7XG5cbiAgLmNvbnRhaW5lciB7XG4gICAgbWF4LXdpZHRoOiAxMDI0cHg7XG4gIH1cbn1cbkBtZWRpYSAobWluLXdpZHRoOiAxMjgwcHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDEyODBweDtcbiAgfVxufVxuQG1lZGlhIChtaW4td2lkdGg6IDE1MzZweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogMTUzNnB4O1xuICB9XG59XG4udmlzaWJsZSB7XG4gIHZpc2liaWxpdHk6IHZpc2libGU7XG59XG4uY29sbGFwc2Uge1xuICB2aXNpYmlsaXR5OiBjb2xsYXBzZTtcbn1cbi5yZWxhdGl2ZSB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbn1cbi5tLTUge1xuICBtYXJnaW46IDEuMjVyZW07XG59XG4uYmxvY2sge1xuICBkaXNwbGF5OiBibG9jaztcbn1cbi5mbGV4IHtcbiAgZGlzcGxheTogZmxleDtcbn1cbi50YWJsZSB7XG4gIGRpc3BsYXk6IHRhYmxlO1xufVxuLmdyaWQge1xuICBkaXNwbGF5OiBncmlkO1xufVxuLmNvbnRlbnRzIHtcbiAgZGlzcGxheTogY29udGVudHM7XG59XG4uaGlkZGVuIHtcbiAgZGlzcGxheTogbm9uZTtcbn1cbi5oLTEge1xuICBoZWlnaHQ6IDAuMjVyZW07XG59XG4uaC0xXFxcXC81IHtcbiAgaGVpZ2h0OiAyMCU7XG59XG4uaC00IHtcbiAgaGVpZ2h0OiAxcmVtO1xufVxuLmgtNFxcXFwvNSB7XG4gIGhlaWdodDogODAlO1xufVxuLmgtNDAge1xuICBoZWlnaHQ6IDEwcmVtO1xufVxuLmgtNiB7XG4gIGhlaWdodDogMS41cmVtO1xufVxuLnctMSB7XG4gIHdpZHRoOiAwLjI1cmVtO1xufVxuLnctMVxcXFwvMiB7XG4gIHdpZHRoOiA1MCU7XG59XG4udy00IHtcbiAgd2lkdGg6IDFyZW07XG59XG4udy00XFxcXC8xMiB7XG4gIHdpZHRoOiAzMy4zMzMzMzMlO1xufVxuLnctNiB7XG4gIHdpZHRoOiAxLjVyZW07XG59XG4udy1mdWxsIHtcbiAgd2lkdGg6IDEwMCU7XG59XG4uZmxleC0xIHtcbiAgZmxleDogMSAxIDAlO1xufVxuLmJvcmRlci1jb2xsYXBzZSB7XG4gIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XG59XG4udHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUodmFyKC0tdHctdHJhbnNsYXRlLXgpLCB2YXIoLS10dy10cmFuc2xhdGUteSkpIHJvdGF0ZSh2YXIoLS10dy1yb3RhdGUpKSBza2V3WCh2YXIoLS10dy1za2V3LXgpKSBza2V3WSh2YXIoLS10dy1za2V3LXkpKSBzY2FsZVgodmFyKC0tdHctc2NhbGUteCkpIHNjYWxlWSh2YXIoLS10dy1zY2FsZS15KSk7XG59XG4uY3Vyc29yLWhlbHAge1xuICBjdXJzb3I6IGhlbHA7XG59XG4uY3Vyc29yLXBvaW50ZXIge1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uY3Vyc29yLXRleHQge1xuICBjdXJzb3I6IHRleHQ7XG59XG4ucmVzaXplIHtcbiAgcmVzaXplOiBib3RoO1xufVxuLmF1dG8tcm93cy1taW4ge1xuICBncmlkLWF1dG8tcm93czogbWluLWNvbnRlbnQ7XG59XG4uZ3JpZC1jb2xzLTExIHtcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMTEsIG1pbm1heCgwLCAxZnIpKTtcbn1cbi5mbGV4LXJvdyB7XG4gIGZsZXgtZGlyZWN0aW9uOiByb3c7XG59XG4uZmxleC1jb2wge1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xufVxuLmp1c3RpZnktY2VudGVyIHtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG59XG4uanVzdGlmeS1iZXR3ZWVuIHtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xufVxuLmdhcC0xIHtcbiAgZ2FwOiAwLjI1cmVtO1xufVxuLm92ZXJmbG93LWF1dG8ge1xuICBvdmVyZmxvdzogYXV0bztcbn1cbi5yb3VuZGVkLWZ1bGwge1xuICBib3JkZXItcmFkaXVzOiA5OTk5cHg7XG59XG4ucm91bmRlZC14bCB7XG4gIGJvcmRlci1yYWRpdXM6IDAuNzVyZW07XG59XG4uYm9yZGVyIHtcbiAgYm9yZGVyLXdpZHRoOiAxcHg7XG59XG4uYm9yZGVyLXNvbGlkIHtcbiAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcbn1cbi5ib3JkZXItYmx1ZS04MDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigzMCA2NCAxNzUgLyB2YXIoLS10dy1ib3JkZXItb3BhY2l0eSkpO1xufVxuLmJvcmRlci1ncmF5LTgwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDMxIDQxIDU1IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItZ3JlZW4tNjAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMjIgMTYzIDc0IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItb3JhbmdlLTQwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDI1MSAxNDYgNjAgLyB2YXIoLS10dy1ib3JkZXItb3BhY2l0eSkpO1xufVxuLmJvcmRlci1yZWQtNzAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMTg1IDI4IDI4IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5iZy1ncmF5LTIwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDIyOSAyMzEgMjM1IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWdyYXktNDAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTU2IDE2MyAxNzUgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS04MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigzMSA0MSA1NSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5wLTEge1xuICBwYWRkaW5nOiAwLjI1cmVtO1xufVxuLnAtMiB7XG4gIHBhZGRpbmc6IDAuNXJlbTtcbn1cbi5wLTQge1xuICBwYWRkaW5nOiAxcmVtO1xufVxuLnAtNiB7XG4gIHBhZGRpbmc6IDEuNXJlbTtcbn1cbi5weC0zIHtcbiAgcGFkZGluZy1sZWZ0OiAwLjc1cmVtO1xuICBwYWRkaW5nLXJpZ2h0OiAwLjc1cmVtO1xufVxuLnB4LTQge1xuICBwYWRkaW5nLWxlZnQ6IDFyZW07XG4gIHBhZGRpbmctcmlnaHQ6IDFyZW07XG59XG4ucHktMSB7XG4gIHBhZGRpbmctdG9wOiAwLjI1cmVtO1xuICBwYWRkaW5nLWJvdHRvbTogMC4yNXJlbTtcbn1cbi5weS0yIHtcbiAgcGFkZGluZy10b3A6IDAuNXJlbTtcbiAgcGFkZGluZy1ib3R0b206IDAuNXJlbTtcbn1cbi50ZXh0LWNlbnRlciB7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbn1cbi50ZXh0LXNtIHtcbiAgZm9udC1zaXplOiAwLjg3NXJlbTtcbiAgbGluZS1oZWlnaHQ6IDEuMjVyZW07XG59XG4udGV4dC10ZWFsLTkwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDE5IDc4IDc0IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udW5kZXJsaW5lIHtcbiAgdGV4dC1kZWNvcmF0aW9uLWxpbmU6IHVuZGVybGluZTtcbn1cbi5vdXRsaW5lIHtcbiAgb3V0bGluZS1zdHlsZTogc29saWQ7XG59XG4uZmlsdGVyIHtcbiAgZmlsdGVyOiB2YXIoLS10dy1ibHVyKSB2YXIoLS10dy1icmlnaHRuZXNzKSB2YXIoLS10dy1jb250cmFzdCkgdmFyKC0tdHctZ3JheXNjYWxlKSB2YXIoLS10dy1odWUtcm90YXRlKSB2YXIoLS10dy1pbnZlcnQpIHZhcigtLXR3LXNhdHVyYXRlKSB2YXIoLS10dy1zZXBpYSkgdmFyKC0tdHctZHJvcC1zaGFkb3cpO1xufWAsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL3N0eWxlcy5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUE7O0NBQWMsQ0FBZDs7O0NBQWM7O0FBQWQ7OztFQUFBLHNCQUFjLEVBQWQsTUFBYztFQUFkLGVBQWMsRUFBZCxNQUFjO0VBQWQsbUJBQWMsRUFBZCxNQUFjO0VBQWQscUJBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7O0VBQUEsZ0JBQWM7QUFBQTs7QUFBZDs7Ozs7Ozs7Q0FBYzs7QUFBZDs7RUFBQSxnQkFBYyxFQUFkLE1BQWM7RUFBZCw4QkFBYyxFQUFkLE1BQWM7RUFBZCxnQkFBYyxFQUFkLE1BQWM7RUFBZCxjQUFjO0tBQWQsV0FBYyxFQUFkLE1BQWM7RUFBZCwrSEFBYyxFQUFkLE1BQWM7RUFBZCw2QkFBYyxFQUFkLE1BQWM7RUFBZCwrQkFBYyxFQUFkLE1BQWM7RUFBZCx3Q0FBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7O0NBQWM7O0FBQWQ7RUFBQSxTQUFjLEVBQWQsTUFBYztFQUFkLG9CQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOzs7O0NBQWM7O0FBQWQ7RUFBQSxTQUFjLEVBQWQsTUFBYztFQUFkLGNBQWMsRUFBZCxNQUFjO0VBQWQscUJBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7RUFBQSx5Q0FBYztVQUFkLGlDQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7Ozs7OztFQUFBLGtCQUFjO0VBQWQs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QjtBQUFBO0FBQXBCOztFQUFBO0lBQUE7RUFBb0I7QUFBQTtBQUFwQjs7RUFBQTtJQUFBO0VBQW9CO0FBQUE7QUFBcEI7O0VBQUE7SUFBQTtFQUFvQjtBQUFBO0FBQXBCOztFQUFBO0lBQUE7RUFBb0I7QUFBQTtBQUNwQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSxzQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxzQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxzQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxzQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxzQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxrQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxrQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxrQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLHFCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG1CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsbUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIkB0YWlsd2luZCBiYXNlO1xcbkB0YWlsd2luZCBjb21wb25lbnRzO1xcbkB0YWlsd2luZCB1dGlsaXRpZXM7XCJdLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICBBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzV2l0aE1hcHBpbmdUb1N0cmluZykge1xuICB2YXIgbGlzdCA9IFtdO1xuXG4gIC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcbiAgbGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIGNvbnRlbnQgPSBcIlwiO1xuICAgICAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBpdGVtWzVdICE9PSBcInVuZGVmaW5lZFwiO1xuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpO1xuICAgICAgfVxuICAgICAgY29udGVudCArPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pO1xuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKFwiXCIpO1xuICB9O1xuXG4gIC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG4gIGxpc3QuaSA9IGZ1bmN0aW9uIGkobW9kdWxlcywgbWVkaWEsIGRlZHVwZSwgc3VwcG9ydHMsIGxheWVyKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGVzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCB1bmRlZmluZWRdXTtcbiAgICB9XG4gICAgdmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHRoaXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdmFyIGlkID0gdGhpc1trXVswXTtcbiAgICAgICAgaWYgKGlkICE9IG51bGwpIHtcbiAgICAgICAgICBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgX2sgPSAwOyBfayA8IG1vZHVsZXMubGVuZ3RoOyBfaysrKSB7XG4gICAgICB2YXIgaXRlbSA9IFtdLmNvbmNhdChtb2R1bGVzW19rXSk7XG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGxheWVyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbVs1XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG1lZGlhKSB7XG4gICAgICAgIGlmICghaXRlbVsyXSkge1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzdXBwb3J0cykge1xuICAgICAgICBpZiAoIWl0ZW1bNF0pIHtcbiAgICAgICAgICBpdGVtWzRdID0gXCJcIi5jb25jYXQoc3VwcG9ydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs0XSA9IHN1cHBvcnRzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsaXN0LnB1c2goaXRlbSk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gbGlzdDtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgdmFyIGNvbnRlbnQgPSBpdGVtWzFdO1xuICB2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG4gIGlmICghY3NzTWFwcGluZykge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG4gIGlmICh0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KGNzc01hcHBpbmcpKSkpO1xuICAgIHZhciBkYXRhID0gXCJzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxcIi5jb25jYXQoYmFzZTY0KTtcbiAgICB2YXIgc291cmNlTWFwcGluZyA9IFwiLyojIFwiLmNvbmNhdChkYXRhLCBcIiAqL1wiKTtcbiAgICByZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oXCJcXG5cIik7XG4gIH1cbiAgcmV0dXJuIFtjb250ZW50XS5qb2luKFwiXFxuXCIpO1xufTsiLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydEZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanNcIjtcbiAgICAgIGltcG9ydCBzdHlsZVRhZ1RyYW5zZm9ybUZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4uL25vZGVfbW9kdWxlcy9wb3N0Y3NzLWxvYWRlci9kaXN0L2Nqcy5qcz8/cnVsZVNldFsxXS5ydWxlc1sxXS51c2VbMl0hLi9zdHlsZXMuY3NzXCI7XG4gICAgICBcbiAgICAgIFxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtID0gc3R5bGVUYWdUcmFuc2Zvcm1Gbjtcbm9wdGlvbnMuc2V0QXR0cmlidXRlcyA9IHNldEF0dHJpYnV0ZXM7XG5cbiAgICAgIG9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG4gICAgXG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi4vbm9kZV9tb2R1bGVzL3Bvc3Rjc3MtbG9hZGVyL2Rpc3QvY2pzLmpzPz9ydWxlU2V0WzFdLnJ1bGVzWzFdLnVzZVsyXSEuL3N0eWxlcy5jc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXNJbkRPTS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzdHlsZXNJbkRPTVtpXS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICByZXN1bHQgPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldO1xuICAgIHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuICAgIHZhciBjb3VudCA9IGlkQ291bnRNYXBbaWRdIHx8IDA7XG4gICAgdmFyIGlkZW50aWZpZXIgPSBcIlwiLmNvbmNhdChpZCwgXCIgXCIpLmNvbmNhdChjb3VudCk7XG4gICAgaWRDb3VudE1hcFtpZF0gPSBjb3VudCArIDE7XG4gICAgdmFyIGluZGV4QnlJZGVudGlmaWVyID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIGNzczogaXRlbVsxXSxcbiAgICAgIG1lZGlhOiBpdGVtWzJdLFxuICAgICAgc291cmNlTWFwOiBpdGVtWzNdLFxuICAgICAgc3VwcG9ydHM6IGl0ZW1bNF0sXG4gICAgICBsYXllcjogaXRlbVs1XVxuICAgIH07XG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcbiAgdmFyIHVwZGF0ZXIgPSBmdW5jdGlvbiB1cGRhdGVyKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXAgJiYgbmV3T2JqLnN1cHBvcnRzID09PSBvYmouc3VwcG9ydHMgJiYgbmV3T2JqLmxheWVyID09PSBvYmoubGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXBpLnVwZGF0ZShvYmogPSBuZXdPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcGkucmVtb3ZlKCk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gdXBkYXRlcjtcbn1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGlkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbaV07XG4gICAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4XS5yZWZlcmVuY2VzLS07XG4gICAgfVxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG4gICAgICB2YXIgX2luZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoX2lkZW50aWZpZXIpO1xuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcbiAgICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxhc3RJZGVudGlmaWVycyA9IG5ld0xhc3RJZGVudGlmaWVycztcbiAgfTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBtZW1vID0ge307XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZ2V0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAodHlwZW9mIG1lbW9bdGFyZ2V0XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHZhciBzdHlsZVRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTtcblxuICAgIC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG4gICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBtZW1vW3RhcmdldF0gPSBzdHlsZVRhcmdldDtcbiAgfVxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydEJ5U2VsZWN0b3IoaW5zZXJ0LCBzdHlsZSkge1xuICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGluc2VydCk7XG4gIGlmICghdGFyZ2V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnQnIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcbiAgfVxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRCeVNlbGVjdG9yOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBvcHRpb25zLnNldEF0dHJpYnV0ZXMoZWxlbWVudCwgb3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgb3B0aW9ucy5pbnNlcnQoZWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydFN0eWxlRWxlbWVudDsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMoc3R5bGVFbGVtZW50KSB7XG4gIHZhciBub25jZSA9IHR5cGVvZiBfX3dlYnBhY2tfbm9uY2VfXyAhPT0gXCJ1bmRlZmluZWRcIiA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IFwiXCI7XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChvYmouc3VwcG9ydHMsIFwiKSB7XCIpO1xuICB9XG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuICB2YXIgbmVlZExheWVyID0gdHlwZW9mIG9iai5sYXllciAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIkBsYXllclwiLmNvbmNhdChvYmoubGF5ZXIubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChvYmoubGF5ZXIpIDogXCJcIiwgXCIge1wiKTtcbiAgfVxuICBjc3MgKz0gb2JqLmNzcztcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG4gIGlmIChzb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiLmNvbmNhdChidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpLCBcIiAqL1wiKTtcbiAgfVxuXG4gIC8vIEZvciBvbGQgSUVcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuICBvcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xufVxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCkge1xuICAvLyBpc3RhbmJ1bCBpZ25vcmUgaWZcbiAgaWYgKHN0eWxlRWxlbWVudC5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZG9tQVBJKG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHJldHVybiB7XG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHt9LFxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgIH07XG4gIH1cbiAgdmFyIHN0eWxlRWxlbWVudCA9IG9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKG9iaikge1xuICAgICAgYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gIH07XG59XG5tb2R1bGUuZXhwb3J0cyA9IGRvbUFQSTsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCkge1xuICBpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICB9XG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlVGFnVHJhbnNmb3JtOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm5jID0gdW5kZWZpbmVkOyIsImltcG9ydCBcIi4vc3R5bGVzLmNzc1wiO1xuaW1wb3J0IEdhbWUgZnJvbSBcIi4vZ2FtZVwiO1xuaW1wb3J0IFVpTWFuYWdlciBmcm9tIFwiLi91aU1hbmFnZXJcIjtcblxuLy8gQ3JlYXRlIGEgbmV3IFVJIG1hbmFnZXJcbmNvbnN0IG5ld1VpTWFuYWdlciA9IFVpTWFuYWdlcigpO1xuXG4vLyBJbml0aWFsaXNlIGNvbnNvbGVcbm5ld1VpTWFuYWdlci5pbml0Q29uc29sZVVJKCk7XG5cbi8vIFNldCB1cCB0aGUgZ2FtZWJvYXJkIGRpc3BsYXlzIHVzaW5nIFVpTWFuYWdlclxubmV3VWlNYW5hZ2VyLmNyZWF0ZUdhbWVib2FyZChcImh1bWFuLWdiXCIpO1xubmV3VWlNYW5hZ2VyLmNyZWF0ZUdhbWVib2FyZChcImNvbXAtZ2JcIik7XG5cbi8vIEluc3RhbnRpYXRlIGEgbmV3IGdhbWVcbmNvbnN0IG5ld0dhbWUgPSBHYW1lKCk7XG5cbi8vIENyZWF0ZSBhIG1vY2sgYXJyYXkgb2YgaHVtYW4gcGxheWVyIGVudHJpZXNcbmNvbnN0IGh1bWFuU2hpcHMgPSBbXG4gIHsgc2hpcFR5cGU6IFwiY2FycmllclwiLCBzdGFydDogXCJKNlwiLCBkaXJlY3Rpb246IFwidlwiIH0sXG4gIHsgc2hpcFR5cGU6IFwiYmF0dGxlc2hpcFwiLCBzdGFydDogXCJEN1wiLCBkaXJlY3Rpb246IFwidlwiIH0sXG4gIHsgc2hpcFR5cGU6IFwic3VibWFyaW5lXCIsIHN0YXJ0OiBcIkExXCIsIGRpcmVjdGlvbjogXCJoXCIgfSxcbiAgeyBzaGlwVHlwZTogXCJjcnVpc2VyXCIsIHN0YXJ0OiBcIkcxXCIsIGRpcmVjdGlvbjogXCJoXCIgfSxcbiAgeyBzaGlwVHlwZTogXCJkZXN0cm95ZXJcIiwgc3RhcnQ6IFwiRjhcIiwgZGlyZWN0aW9uOiBcImhcIiB9LFxuXTtcblxuLy8gQ2FsbCB0aGUgc2V0VXAgbWV0aG9kIG9uIHRoZSBnYW1lXG5uZXdHYW1lLnNldFVwKGh1bWFuU2hpcHMpO1xuXG4vLyBSZW5kZXIgdGhlIHR3byBwbGF5ZXIncyBzaGlwIHN0YXR1cyBkaXNwbGF5c1xubmV3VWlNYW5hZ2VyLnJlbmRlclNoaXBEaXNwKG5ld0dhbWUucGxheWVycy5odW1hbik7XG5uZXdVaU1hbmFnZXIucmVuZGVyU2hpcERpc3AobmV3R2FtZS5wbGF5ZXJzLmNvbXB1dGVyKTtcblxuLy8gQ29uc29sZSBsb2cgdGhlIHBsYXllcnNcbmNvbnNvbGUubG9nKFxuICBgUGxheWVyczogRmlyc3QgcGxheWVyIG9mIHR5cGUgJHtuZXdHYW1lLnBsYXllcnMuaHVtYW4udHlwZX0sIHNlY29uZCBwbGF5ZXIgb2YgdHlwZSAke25ld0dhbWUucGxheWVycy5jb21wdXRlci50eXBlfSFgLFxuKTtcbiJdLCJuYW1lcyI6WyJPdmVybGFwcGluZ1NoaXBzRXJyb3IiLCJFcnJvciIsImNvbnN0cnVjdG9yIiwibWVzc2FnZSIsIm5hbWUiLCJTaGlwQWxsb2NhdGlvblJlYWNoZWRFcnJvciIsIlNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvciIsIkludmFsaWRTaGlwTGVuZ3RoRXJyb3IiLCJJbnZhbGlkU2hpcFR5cGVFcnJvciIsIkludmFsaWRQbGF5ZXJUeXBlRXJyb3IiLCJTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvciIsIlJlcGVhdEF0dGFja2VkRXJyb3IiLCJJbnZhbGlkTW92ZUVudHJ5RXJyb3IiLCJQbGF5ZXIiLCJHYW1lYm9hcmQiLCJTaGlwIiwiR2FtZSIsImh1bWFuR2FtZWJvYXJkIiwiY29tcHV0ZXJHYW1lYm9hcmQiLCJodW1hblBsYXllciIsImNvbXB1dGVyUGxheWVyIiwiY3VycmVudFBsYXllciIsImdhbWVPdmVyU3RhdGUiLCJwbGF5ZXJzIiwiaHVtYW4iLCJjb21wdXRlciIsInNldFVwIiwiaHVtYW5TaGlwcyIsInBsYWNlU2hpcHMiLCJmb3JFYWNoIiwic2hpcCIsInNoaXBUeXBlIiwic3RhcnQiLCJkaXJlY3Rpb24iLCJlbmRHYW1lIiwidGFrZVR1cm4iLCJtb3ZlIiwiZmVlZGJhY2siLCJvcHBvbmVudCIsInJlc3VsdCIsIm1ha2VNb3ZlIiwiZ2FtZWJvYXJkIiwiaGl0IiwiaXNTaGlwU3VuayIsImdhbWVXb24iLCJjaGVja0FsbFNoaXBzU3VuayIsImdyaWQiLCJpbmRleENhbGNzIiwiY29sTGV0dGVyIiwidG9VcHBlckNhc2UiLCJyb3dOdW1iZXIiLCJwYXJzZUludCIsInNsaWNlIiwiY29sSW5kZXgiLCJjaGFyQ29kZUF0Iiwicm93SW5kZXgiLCJjaGVja1R5cGUiLCJzaGlwUG9zaXRpb25zIiwiT2JqZWN0Iiwia2V5cyIsImV4aXN0aW5nU2hpcFR5cGUiLCJjaGVja0JvdW5kYXJpZXMiLCJzaGlwTGVuZ3RoIiwiY29vcmRzIiwieExpbWl0IiwibGVuZ3RoIiwieUxpbWl0IiwieCIsInkiLCJjYWxjdWxhdGVTaGlwUG9zaXRpb25zIiwicG9zaXRpb25zIiwidG9Mb3dlckNhc2UiLCJpIiwicHVzaCIsImNoZWNrRm9yT3ZlcmxhcCIsImVudHJpZXMiLCJleGlzdGluZ1NoaXBQb3NpdGlvbnMiLCJzb21lIiwicG9zaXRpb24iLCJpbmNsdWRlcyIsImNoZWNrRm9ySGl0IiwiZm91bmRTaGlwIiwiZmluZCIsIl8iLCJzaGlwRmFjdG9yeSIsInNoaXBzIiwiaGl0UG9zaXRpb25zIiwiYXR0YWNrTG9nIiwicGxhY2VTaGlwIiwidHlwZSIsIm5ld1NoaXAiLCJhdHRhY2siLCJyZXNwb25zZSIsImNoZWNrUmVzdWx0cyIsImlzU3VuayIsImV2ZXJ5Iiwic2hpcFJlcG9ydCIsImZsb2F0aW5nU2hpcHMiLCJmaWx0ZXIiLCJtYXAiLCJnZXRTaGlwIiwiZ2V0U2hpcFBvc2l0aW9ucyIsImdldEhpdFBvc2l0aW9ucyIsImNoZWNrTW92ZSIsImdiR3JpZCIsInZhbGlkIiwiZWwiLCJwIiwicmFuZE1vdmUiLCJtb3ZlTG9nIiwiYWxsTW92ZXMiLCJmbGF0TWFwIiwicm93IiwicG9zc2libGVNb3ZlcyIsInJhbmRvbU1vdmUiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJnZW5lcmF0ZVJhbmRvbVN0YXJ0Iiwic2l6ZSIsInZhbGlkU3RhcnRzIiwiY29sIiwicmFuZG9tSW5kZXgiLCJhdXRvUGxhY2VtZW50Iiwic2hpcFR5cGVzIiwicGxhY2VkIiwiZXJyb3IiLCJvcHBHYW1lYm9hcmQiLCJpbnB1dCIsImNoYXJBdCIsInN1YnN0cmluZyIsInBsYXllciIsInNldExlbmd0aCIsImhpdHMiLCJidWlsZFNoaXAiLCJvYmoiLCJkb21TZWwiLCJzaGlwU2VjdHMiLCJzZWN0IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NOYW1lIiwic2V0QXR0cmlidXRlIiwidXBkYXRlT3V0cHV0Iiwib3V0cHV0IiwibWVzc2FnZUVsZW1lbnQiLCJ0ZXh0Q29udGVudCIsImFwcGVuZENoaWxkIiwic2Nyb2xsVG9wIiwic2Nyb2xsSGVpZ2h0IiwiZXhlY3V0ZUNvbW1hbmQiLCJjb21tYW5kIiwiY29uc29sZSIsImxvZyIsImdldEVsZW1lbnRCeUlkIiwidmFsdWUiLCJnYW1lYm9hcmRDbGljayIsImV2ZW50IiwiaWQiLCJ0YXJnZXQiLCJkYXRhc2V0IiwiVWlNYW5hZ2VyIiwiY3JlYXRlR2FtZWJvYXJkIiwiY29udGFpbmVySUQiLCJjb250YWluZXIiLCJncmlkRGl2IiwiY29sdW1ucyIsImhlYWRlciIsInJvd0xhYmVsIiwiY2VsbElkIiwiY2VsbCIsImFkZEV2ZW50TGlzdGVuZXIiLCJpbml0Q29uc29sZVVJIiwiY29uc29sZUNvbnRhaW5lciIsImNsYXNzTGlzdCIsImFkZCIsImlucHV0RGl2Iiwic3VibWl0QnV0dG9uIiwiZSIsImtleSIsInJlbmRlclNoaXBEaXNwIiwicGxheWVyT2JqIiwiaWRTZWwiLCJkaXNwRGl2IiwicXVlcnlTZWxlY3RvciIsInZhbHVlcyIsInNoaXBEaXYiLCJ0aXRsZSIsInNlY3RzRGl2IiwibmV3VWlNYW5hZ2VyIiwibmV3R2FtZSJdLCJzb3VyY2VSb290IjoiIn0=