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
/* harmony import */ var _gameboard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gameboard */ "./src/gameboard.js");

const {
  grid
} = (0,_gameboard__WEBPACK_IMPORTED_MODULE_0__["default"])();
const shipsToPlace = [{
  shipType: "carrier",
  shipLength: 5
}, {
  shipType: "battleship",
  shipLength: 4
}, {
  shipType: "submarine",
  shipLength: 3
}, {
  shipType: "cruiser",
  shipLength: 3
}, {
  shipType: "destroyer",
  shipLength: 2
}];
let currentOrientation = "h"; // Default orientation
let currentShip;
let lastHoveredCell = null; // Store the last hovered cell's ID

const placeShipGuide = {
  prompt: 'Enter the cell number (i.e. "A1") and orientation ("h" for horizontal and "v" for vertical), separated with a space. For example "A2 v".',
  promptType: "guide"
};
const processPlacementCommand = command => {
  // Split the command by space
  const parts = command.split(" ");
  if (parts.length !== 2) {
    throw new Error("Invalid command format. Please use the format 'GridPosition Orientation'.");
  }

  // Process and validate the grid position
  const gridPosition = parts[0].toUpperCase();
  if (gridPosition.length < 2 || gridPosition.length > 3) {
    throw new Error("Invalid grid position. Must be 2 to 3 characters long.");
  }

  // Validate grid position against the grid matrix
  const validGridPositions = grid.flat(); // Flatten the grid for easier searching
  if (!validGridPositions.includes(gridPosition)) {
    throw new Error("Invalid grid position. Does not match any valid grid values.");
  }

  // Process and validate the orientation
  const orientation = parts[1].toLowerCase();
  if (orientation !== "h" && orientation !== "v") {
    throw new Error("Invalid orientation. Must be either 'h' for horizontal or 'v' for vertical.");
  }

  // Return the processed and validated command parts
  return {
    gridPosition,
    orientation
  };
};

// The function for updating the output div element
const updateOutput = (message, type) => {
  // Get the ouput element
  const output = document.getElementById("console-output");

  // Append new message
  const messageElement = document.createElement("div"); // Create a new div for the message
  messageElement.textContent = message; // Set the text content to the message

  // Apply styling based on promptType
  switch (type) {
    case "valid":
      messageElement.classList.add("text-lime-600");
      break;
    case "miss":
      messageElement.classList.add("text-orange-500");
      break;
    case "error":
      messageElement.classList.add("text-red-500");
      break;
    default:
      messageElement.classList.add("text-gray-800");
    // Default text color
  }
  output.appendChild(messageElement); // Add the element to the output

  // eslint-disable-next-line no-param-reassign
  output.scrollTop = output.scrollHeight; // Scroll to the bottom of the output container
};

// The function for executing commands from the console input
const consoleLogCommand = (shipType, gridPosition, orientation) => {
  // Set the orientation feedback
  const dirFeeback = orientation === "h" ? "horizontally" : "vertically";
  // Set the console message
  const message = `${shipType.charAt(0).toUpperCase() + shipType.slice(1)} placed at ${gridPosition} facing ${dirFeeback}`;
  console.log(`${message}`);
  updateOutput(`> ${message}`, "valid");

  // Clear the input
  document.getElementById("console-input").value = "";
};
const consoleLogError = (shipType, error) => {
  console.error(`Error placing ${shipType}: message = ${error.message}.`);
  updateOutput(`> Error placing ${shipType}: ${error.message}`, "error");

  // Clear the input
  document.getElementById("console-input").value = "";
};

// Function initialise uiManager
const initUiManager = uiManager => {
  // Initialise console
  uiManager.initConsoleUI();

  // Initialise gameboard with callback for cell clicks
  uiManager.createGameboard("human-gb");
  uiManager.createGameboard("comp-gb");
};

// Function to calculate cell IDs based on start position, length, and orientation
function calculateShipCells(startCell, shipLength, orientation) {
  const cellIds = [];
  const rowIndex = startCell.charCodeAt(0) - "A".charCodeAt(0);
  const colIndex = parseInt(startCell.substring(1), 10) - 1;
  for (let i = 0; i < shipLength; i++) {
    if (orientation === "v") {
      if (colIndex + i >= grid[0].length) break; // Check grid bounds
      cellIds.push(`${String.fromCharCode(rowIndex + "A".charCodeAt(0))}${colIndex + i + 1}`);
    } else {
      if (rowIndex + i >= grid.length) break; // Check grid bounds
      cellIds.push(`${String.fromCharCode(rowIndex + i + "A".charCodeAt(0))}${colIndex + 1}`);
    }
  }
  return cellIds;
}

// Function to highlight cells
function highlightCells(cellIds) {
  cellIds.forEach(cellId => {
    const cellElement = document.querySelector(`[data-position="${cellId}"]`);
    if (cellElement) {
      cellElement.classList.add("bg-orange-400");
    }
  });
}

// Function to clear highlight from cells
function clearHighlight(cellIds) {
  cellIds.forEach(cellId => {
    const cellElement = document.querySelector(`[data-position="${cellId}"]`);
    if (cellElement) {
      cellElement.classList.remove("bg-orange-400");
    }
  });
}

// Function to toggle orientation
function toggleOrientation() {
  currentOrientation = currentOrientation === "h" ? "v" : "h";
  // Update the visual prompt here if necessary
}
const handlePlacementHover = e => {
  const cell = e.target;
  if (cell.classList.contains("gameboard-cell") && cell.dataset.player === "human") {
    // Logic to handle hover effect
    const cellPos = cell.dataset.position;
    lastHoveredCell = cellPos;
    const cellsToHighlight = calculateShipCells(cellPos, currentShip.shipLength, currentOrientation);
    highlightCells(cellsToHighlight);
  }
};
const handleMouseLeave = e => {
  const cell = e.target;
  if (cell.classList.contains("gameboard-cell")) {
    // Logic for handling when the cursor leaves a cell
    const cellPos = cell.dataset.position;
    if (cellPos === lastHoveredCell) {
      const cellsToClear = calculateShipCells(cellPos, currentShip.shipLength, currentOrientation);
      clearHighlight(cellsToClear);
      lastHoveredCell = null; // Reset lastHoveredCell since the mouse has left
    }
    lastHoveredCell = null;
  }
};
const handleOrientationToggle = e => {
  if (e.key === " " && lastHoveredCell) {
    // Ensure spacebar is pressed and there's a last hovered cell
    e.preventDefault(); // Prevent the default spacebar action

    // Toggle the orientation
    toggleOrientation();

    // Clear previously highlighted cells
    // Assuming calculateShipCells and clearHighlight work correctly
    const oldCellsToClear = calculateShipCells(lastHoveredCell, currentShip.shipLength, currentOrientation === "h" ? "v" : "h");
    clearHighlight(oldCellsToClear);

    // Highlight new cells based on the new orientation
    const newCellsToHighlight = calculateShipCells(lastHoveredCell, currentShip.shipLength, currentOrientation);
    highlightCells(newCellsToHighlight);
  }
};
function disableComputerGameboardHover() {
  document.querySelectorAll('.gameboard-cell[data-player="computer"]').forEach(cell => {
    cell.classList.add("pointer-events-none", "cursor-default");
    cell.classList.remove("hover:bg-orange-500");
  });
}
function switchGameboardHoverStates() {
  // Disable hover on the human's gameboard
  document.querySelectorAll('.gameboard-cell[data-player="human"]').forEach(cell => {
    cell.classList.add("pointer-events-none", "cursor-default");
  });

  // Enable hover on the computer's gameboard
  document.querySelectorAll('.gameboard-cell[data-player="computer"]').forEach(cell => {
    cell.classList.remove("pointer-events-none", "cursor-default");
    cell.classList.remove("hover:bg-orange-500");
    cell.classList.add("hover:bg-orange-500");
  });
}

// Function to setup gameboard for ship placement
const setupGameboardForPlacement = () => {
  disableComputerGameboardHover();
  document.querySelectorAll('.gameboard-cell[data-player="human"]').forEach(cell => {
    cell.addEventListener("mouseenter", handlePlacementHover);
    cell.addEventListener("mouseleave", handleMouseLeave);
  });
  // Get gameboard area div element
  const gameboardArea = document.querySelector(".gameboard-area, [data-player='human']");
  // Add event listeners to gameboard area to add and remove the
  // handleOrientationToggle event listener when entering and exiting the area
  gameboardArea.addEventListener("mouseenter", () => {
    document.addEventListener("keydown", handleOrientationToggle);
  });
  gameboardArea.addEventListener("mouseleave", () => {
    document.removeEventListener("keydown", handleOrientationToggle);
  });
};

// Function to clean up after ship placement is complete
const cleanupAfterPlacement = () => {
  document.querySelectorAll('.gameboard-cell[data-player="human"]').forEach(cell => {
    cell.removeEventListener("mouseenter", handlePlacementHover);
    cell.removeEventListener("mouseleave", handleMouseLeave);
  });
  // Get gameboard area div element
  const gameboardArea = document.querySelector(".gameboard-area, [data-player='human']");
  // Remove event listeners to gameboard area to add and remove the
  // handleOrientationToggle event listener when entering and exiting the area
  gameboardArea.removeEventListener("mouseenter", () => {
    document.addEventListener("keydown", handleOrientationToggle);
  });
  gameboardArea.removeEventListener("mouseleave", () => {
    document.removeEventListener("keydown", handleOrientationToggle);
  });
  // Remove event listener for keydown events
  document.removeEventListener("keydown", handleOrientationToggle);
};
const ActionController = (uiManager, game) => {
  const humanPlayer = game.players.human;
  const humanPlayerGameboard = humanPlayer.gameboard;

  // Function to setup event listeners for console and gameboard clicks
  function setupEventListeners(handleValidInput) {
    // Define cleanup functions inside to ensure they are accessible for removal
    const cleanupFunctions = [];
    const consoleSubmitButton = document.getElementById("console-submit");
    const consoleInput = document.getElementById("console-input");
    const submitHandler = () => {
      const input = consoleInput.value;
      handleValidInput(input);
      consoleInput.value = ""; // Clear input after submission
    };
    const keypressHandler = e => {
      if (e.key === "Enter") {
        submitHandler(); // Reuse submit logic for Enter key press
      }
    };
    consoleSubmitButton.addEventListener("click", submitHandler);
    consoleInput.addEventListener("keypress", keypressHandler);

    // Add cleanup function for console listeners
    cleanupFunctions.push(() => {
      consoleSubmitButton.removeEventListener("click", submitHandler);
      consoleInput.removeEventListener("keypress", keypressHandler);
    });

    // Setup for gameboard cell clicks
    document.querySelectorAll('.gameboard-cell[data-player="human"]').forEach(cell => {
      const clickHandler = () => {
        const {
          position
        } = cell.dataset;
        const input = `${position} ${currentOrientation}`;
        console.log(`clickHandler input = ${input}`);
        handleValidInput(input);
      };
      cell.addEventListener("click", clickHandler);

      // Add cleanup function for each cell listener
      cleanupFunctions.push(() => cell.removeEventListener("click", clickHandler));
    });

    // Return a single cleanup function to remove all listeners
    return () => cleanupFunctions.forEach(cleanup => cleanup());
  }
  async function promptAndPlaceShip(shipType) {
    return new Promise((resolve, reject) => {
      // Set the current ship
      currentShip = shipsToPlace.find(ship => ship.shipType === shipType);

      // Display prompt for the specific ship type as well as the guide to placing ships
      const placeShipPrompt = {
        prompt: `Place your ${shipType}.`,
        promptType: "instruction"
      };
      uiManager.displayPrompt({
        placeShipPrompt,
        placeShipGuide
      });
      const handleValidInput = async input => {
        try {
          const {
            gridPosition,
            orientation
          } = processPlacementCommand(input);
          await humanPlayerGameboard.placeShip(shipType, gridPosition, orientation);
          consoleLogCommand(shipType, gridPosition, orientation);
          // Remove cell highlights
          const cellsToClear = calculateShipCells(gridPosition, currentShip.shipLength, orientation);
          clearHighlight(cellsToClear);

          // Display the ship on the game board and ship status display
          uiManager.renderShipBoard(humanPlayer, shipType);
          uiManager.renderShipDisp(humanPlayer, shipType);

          // eslint-disable-next-line no-use-before-define
          resolveShipPlacement(); // Ship placed successfully, resolve the promise
        } catch (error) {
          consoleLogError(shipType, error);
          // Do not reject to allow for retry, just log the error
        }
      };

      // Setup event listeners and ensure we can clean them up after placement
      const cleanup = setupEventListeners(handleValidInput);

      // Attach cleanup to resolve to ensure it's called when the promise resolves
      const resolveShipPlacement = () => {
        cleanup();
        resolve();
      };
    });
  }

  // Sequentially prompt for and place each ship
  async function setupShipsSequentially() {
    for (let i = 0; i < shipsToPlace.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      await promptAndPlaceShip(shipsToPlace[i].shipType); // Wait for each ship to be placed before continuing
    }
  }

  // Function for handling the game setup and ship placement
  const handleSetup = async () => {
    // Init the UI
    initUiManager(uiManager);
    setupGameboardForPlacement();
    await setupShipsSequentially();
    // Proceed with the rest of the game setup after all ships are placed
    cleanupAfterPlacement();
    const output = document.getElementById("console-output");
    updateOutput("> All ships placed, game setup complete!");
    console.log("All ships placed, game setup complete!");
    switchGameboardHoverStates();
  };
  return {
    handleSetup
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
// Function for building a ship, depending on the ship type
const buildShip = (obj, domSel, shipPositions) => {
  // Extract the ship's type and length from the object
  const {
    type,
    shipLength: length
  } = obj;
  // Create and array for the ship's sections
  const shipSects = [];

  // Use the length of the ship to create the correct number of sections
  for (let i = 0; i < length; i++) {
    // Get a position from the array
    const position = shipPositions[i];
    // Create an element for the section
    const sect = document.createElement("div");
    sect.className = "w-4 h-4 rounded-full bg-gray-800"; // Set the default styling for the section element
    // Set a unique id for the ship section
    sect.setAttribute("id", `DOM-${domSel}-shipType-${type}-pos-${position}`);
    // Set a dataset property of "position" for the section
    sect.dataset.position = position;
    shipSects.push(sect); // Add the section to the array
  }

  // Return the array of ship sections
  return shipSects;
};
const UiManager = () => {
  const createGameboard = containerID => {
    const container = document.getElementById(containerID);

    // Set player type depending on the containerID
    const {
      player
    } = container.dataset;

    // Create the grid container
    const gridDiv = document.createElement("div");
    gridDiv.className = "gameboard-area grid grid-cols-11 auto-rows-min gap-1 p-6";
    gridDiv.dataset.player = player;

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
        cell.className = "w-6 h-6 bg-gray-200 flex justify-center items-center cursor-pointer hover:bg-orange-500"; // Add more classes as needed for styling
        cell.classList.add("gameboard-cell"); // Add a class name to each cell to act as a selector
        cell.dataset.position = cellId; // Assign position data attribute for identification
        cell.dataset.player = player; // Assign player data attribute for identification

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
          promptDiv.classList.add("text-lime-600");
          break;
        case "guide":
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
  const renderShipDisp = (playerObj, shipType) => {
    let idSel;

    // Set the correct id selector for the type of player
    if (playerObj.type === "human") {
      idSel = "human-display";
    } else if (playerObj.type === "computer") {
      idSel = "comp-display";
    } else {
      throw Error;
    }

    // Get the correct DOM element
    const dispDiv = document.getElementById(idSel).querySelector(".ships-container");

    // Get the ship from the player
    const ship = playerObj.gameboard.getShip(shipType);

    // Create a div for the ship
    const shipDiv = document.createElement("div");
    shipDiv.className = "px-4 py-2 flex flex-col gap-1";

    // Add a title the the div
    const title = document.createElement("h2");
    title.textContent = shipType; // Set the title to the ship type
    shipDiv.appendChild(title);

    // Get the ship positions array
    const shipPositions = playerObj.gameboard.getShipPositions(shipType);

    // Build the ship sections
    const shipSects = buildShip(ship, idSel, shipPositions);

    // Add the ship sections to the div
    const sectsDiv = document.createElement("div");
    sectsDiv.className = "flex flex-row gap-1";
    shipSects.forEach(sect => {
      sectsDiv.appendChild(sect);
    });
    shipDiv.appendChild(sectsDiv);
    dispDiv.appendChild(shipDiv);
  };

  // Function for r ships on the gameboard
  const renderShipBoard = (playerObj, shipType) => {
    let idSel;

    // Set the correct id selector for the type of player
    if (playerObj.type === "human") {
      idSel = "human-board";
    } else if (playerObj.type === "computer") {
      idSel = "comp-board";
    } else {
      throw Error("No matching player type in 'renderShipBoard' function");
    }

    // Get the player's type and gameboard
    const {
      type: playerType,
      gameboard
    } = playerObj;

    // Get the ship and the ship positions
    const shipObj = gameboard.getShip(shipType);
    const shipPositions = gameboard.getShipPositions(shipType);

    // Build the ship sections
    const shipSects = buildShip(shipObj, idSel, shipPositions);

    // Match the cell positions with the ship sections and place each
    // ship section in the corresponding cell element
    shipPositions.forEach(position => {
      const cellElement = document.getElementById(`${playerType}-${position}`);
      // Find the ship section element that matches the current position
      const shipSect = shipSects.find(section => section.dataset.position === position);
      if (cellElement && shipSect) {
        // Place the ship section in the cell
        cellElement.appendChild(shipSect);
      }
    });
  };
  return {
    createGameboard,
    initConsoleUI,
    displayPrompt,
    renderShipDisp,
    renderShipBoard
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
.pointer-events-none {
  pointer-events: none;
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
.cursor-default {
  cursor: default;
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
.items-center {
  align-items: center;
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
.bg-orange-400 {
  --tw-bg-opacity: 1;
  background-color: rgb(251 146 60 / var(--tw-bg-opacity));
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
.text-lime-600 {
  --tw-text-opacity: 1;
  color: rgb(101 163 13 / var(--tw-text-opacity));
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

// Create a new action controller
const actController = (0,_actionController__WEBPACK_IMPORTED_MODULE_3__["default"])(newUiManager, newGame);
actController.handleSetup();

// Console log the players
console.log(`Players: First player of type ${newGame.players.human.type}, second player of type ${newGame.players.computer.type}!`);
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LHdCQUF3QjtBQUN4Qjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOEJBQThCO0FBQzlCLGlCQUFpQjtBQUNqQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsY0FBYztBQUNkLGtCQUFrQjtBQUNsQjs7QUFFQTtBQUNBO0FBQ0EsY0FBYztBQUNkLGtCQUFrQjtBQUNsQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQiwwQkFBMEI7QUFDMUI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxPQUFPLGtGQUFrRixZQUFZLE1BQU0sT0FBTyxxQkFBcUIsb0JBQW9CLHFCQUFxQixxQkFBcUIsTUFBTSxNQUFNLFdBQVcsTUFBTSxZQUFZLE1BQU0sTUFBTSxxQkFBcUIscUJBQXFCLHFCQUFxQixVQUFVLG9CQUFvQixxQkFBcUIscUJBQXFCLHFCQUFxQixxQkFBcUIsTUFBTSxPQUFPLE1BQU0sS0FBSyxvQkFBb0IscUJBQXFCLE1BQU0sUUFBUSxNQUFNLEtBQUssb0JBQW9CLG9CQUFvQixxQkFBcUIsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLFdBQVcsTUFBTSxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsTUFBTSxNQUFNLE1BQU0sS0FBSyxVQUFVLFdBQVcsTUFBTSxNQUFNLE1BQU0sTUFBTSxXQUFXLE1BQU0sU0FBUyxNQUFNLFFBQVEscUJBQXFCLHFCQUFxQixxQkFBcUIsb0JBQW9CLE1BQU0sTUFBTSxNQUFNLEtBQUssVUFBVSxNQUFNLE1BQU0sTUFBTSxNQUFNLFVBQVUsVUFBVSxXQUFXLFdBQVcsTUFBTSxLQUFLLFVBQVUsTUFBTSxLQUFLLFVBQVUsTUFBTSxRQUFRLE1BQU0sS0FBSyxvQkFBb0IscUJBQXFCLHFCQUFxQixNQUFNLFFBQVEsTUFBTSxTQUFTLHFCQUFxQixxQkFBcUIscUJBQXFCLG9CQUFvQixxQkFBcUIscUJBQXFCLG9CQUFvQixvQkFBb0Isb0JBQW9CLE1BQU0sTUFBTSxNQUFNLE1BQU0sV0FBVyxNQUFNLE9BQU8sTUFBTSxRQUFRLHFCQUFxQixxQkFBcUIscUJBQXFCLE1BQU0sTUFBTSxNQUFNLEtBQUssVUFBVSxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxNQUFNLE1BQU0sVUFBVSxNQUFNLE9BQU8sTUFBTSxLQUFLLHFCQUFxQixxQkFBcUIsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sT0FBTyxNQUFNLEtBQUsscUJBQXFCLG9CQUFvQixNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLE1BQU0saUJBQWlCLFVBQVUsTUFBTSxLQUFLLFVBQVUsVUFBVSxNQUFNLEtBQUssVUFBVSxNQUFNLE9BQU8sV0FBVyxVQUFVLFVBQVUsTUFBTSxNQUFNLEtBQUssS0FBSyxVQUFVLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE9BQU8sTUFBTSxLQUFLLG9CQUFvQixvQkFBb0IsTUFBTSxNQUFNLG9CQUFvQixvQkFBb0IsTUFBTSxNQUFNLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxLQUFLLEtBQUssVUFBVSxNQUFNLFFBQVEsTUFBTSxZQUFZLG9CQUFvQixxQkFBcUIsTUFBTSxNQUFNLE1BQU0sTUFBTSxVQUFVLFVBQVUsTUFBTSxXQUFXLEtBQUssVUFBVSxNQUFNLEtBQUssV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxLQUFLLE1BQU0sS0FBSyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLEtBQUssS0FBSyxLQUFLLEtBQUssTUFBTSxPQUFPLEtBQUssS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0s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Q0FBQyxDQUFDOztBQUUzQjtBQUNBcEYsT0FBTyxDQUFDQyxHQUFHLENBQ1IsaUNBQWdDNE4sT0FBTyxDQUFDcEssT0FBTyxDQUFDQyxLQUFLLENBQUMxRSxJQUFLLDJCQUEwQjZPLE9BQU8sQ0FBQ3BLLE9BQU8sQ0FBQytDLFFBQVEsQ0FBQ3hILElBQUssR0FDdEgsQ0FBQyxDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2FjdGlvbkNvbnRyb2xsZXIuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2Vycm9ycy5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvZ2FtZS5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvZ2FtZWJvYXJkLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9wbGF5ZXIuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3NoaXAuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3VpTWFuYWdlci5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvc3R5bGVzLmNzcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9zdHlsZXMuY3NzPzBhMjUiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9ub25jZSIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEdhbWVib2FyZCBmcm9tIFwiLi9nYW1lYm9hcmRcIjtcblxuY29uc3QgeyBncmlkIH0gPSBHYW1lYm9hcmQoKTtcblxuY29uc3Qgc2hpcHNUb1BsYWNlID0gW1xuICB7IHNoaXBUeXBlOiBcImNhcnJpZXJcIiwgc2hpcExlbmd0aDogNSB9LFxuICB7IHNoaXBUeXBlOiBcImJhdHRsZXNoaXBcIiwgc2hpcExlbmd0aDogNCB9LFxuICB7IHNoaXBUeXBlOiBcInN1Ym1hcmluZVwiLCBzaGlwTGVuZ3RoOiAzIH0sXG4gIHsgc2hpcFR5cGU6IFwiY3J1aXNlclwiLCBzaGlwTGVuZ3RoOiAzIH0sXG4gIHsgc2hpcFR5cGU6IFwiZGVzdHJveWVyXCIsIHNoaXBMZW5ndGg6IDIgfSxcbl07XG5cbmxldCBjdXJyZW50T3JpZW50YXRpb24gPSBcImhcIjsgLy8gRGVmYXVsdCBvcmllbnRhdGlvblxubGV0IGN1cnJlbnRTaGlwO1xubGV0IGxhc3RIb3ZlcmVkQ2VsbCA9IG51bGw7IC8vIFN0b3JlIHRoZSBsYXN0IGhvdmVyZWQgY2VsbCdzIElEXG5cbmNvbnN0IHBsYWNlU2hpcEd1aWRlID0ge1xuICBwcm9tcHQ6XG4gICAgJ0VudGVyIHRoZSBjZWxsIG51bWJlciAoaS5lLiBcIkExXCIpIGFuZCBvcmllbnRhdGlvbiAoXCJoXCIgZm9yIGhvcml6b250YWwgYW5kIFwidlwiIGZvciB2ZXJ0aWNhbCksIHNlcGFyYXRlZCB3aXRoIGEgc3BhY2UuIEZvciBleGFtcGxlIFwiQTIgdlwiLicsXG4gIHByb21wdFR5cGU6IFwiZ3VpZGVcIixcbn07XG5cbmNvbnN0IHByb2Nlc3NQbGFjZW1lbnRDb21tYW5kID0gKGNvbW1hbmQpID0+IHtcbiAgLy8gU3BsaXQgdGhlIGNvbW1hbmQgYnkgc3BhY2VcbiAgY29uc3QgcGFydHMgPSBjb21tYW5kLnNwbGl0KFwiIFwiKTtcbiAgaWYgKHBhcnRzLmxlbmd0aCAhPT0gMikge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIFwiSW52YWxpZCBjb21tYW5kIGZvcm1hdC4gUGxlYXNlIHVzZSB0aGUgZm9ybWF0ICdHcmlkUG9zaXRpb24gT3JpZW50YXRpb24nLlwiLFxuICAgICk7XG4gIH1cblxuICAvLyBQcm9jZXNzIGFuZCB2YWxpZGF0ZSB0aGUgZ3JpZCBwb3NpdGlvblxuICBjb25zdCBncmlkUG9zaXRpb24gPSBwYXJ0c1swXS50b1VwcGVyQ2FzZSgpO1xuICBpZiAoZ3JpZFBvc2l0aW9uLmxlbmd0aCA8IDIgfHwgZ3JpZFBvc2l0aW9uLmxlbmd0aCA+IDMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGdyaWQgcG9zaXRpb24uIE11c3QgYmUgMiB0byAzIGNoYXJhY3RlcnMgbG9uZy5cIik7XG4gIH1cblxuICAvLyBWYWxpZGF0ZSBncmlkIHBvc2l0aW9uIGFnYWluc3QgdGhlIGdyaWQgbWF0cml4XG4gIGNvbnN0IHZhbGlkR3JpZFBvc2l0aW9ucyA9IGdyaWQuZmxhdCgpOyAvLyBGbGF0dGVuIHRoZSBncmlkIGZvciBlYXNpZXIgc2VhcmNoaW5nXG4gIGlmICghdmFsaWRHcmlkUG9zaXRpb25zLmluY2x1ZGVzKGdyaWRQb3NpdGlvbikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIkludmFsaWQgZ3JpZCBwb3NpdGlvbi4gRG9lcyBub3QgbWF0Y2ggYW55IHZhbGlkIGdyaWQgdmFsdWVzLlwiLFxuICAgICk7XG4gIH1cblxuICAvLyBQcm9jZXNzIGFuZCB2YWxpZGF0ZSB0aGUgb3JpZW50YXRpb25cbiAgY29uc3Qgb3JpZW50YXRpb24gPSBwYXJ0c1sxXS50b0xvd2VyQ2FzZSgpO1xuICBpZiAob3JpZW50YXRpb24gIT09IFwiaFwiICYmIG9yaWVudGF0aW9uICE9PSBcInZcIikge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIFwiSW52YWxpZCBvcmllbnRhdGlvbi4gTXVzdCBiZSBlaXRoZXIgJ2gnIGZvciBob3Jpem9udGFsIG9yICd2JyBmb3IgdmVydGljYWwuXCIsXG4gICAgKTtcbiAgfVxuXG4gIC8vIFJldHVybiB0aGUgcHJvY2Vzc2VkIGFuZCB2YWxpZGF0ZWQgY29tbWFuZCBwYXJ0c1xuICByZXR1cm4geyBncmlkUG9zaXRpb24sIG9yaWVudGF0aW9uIH07XG59O1xuXG4vLyBUaGUgZnVuY3Rpb24gZm9yIHVwZGF0aW5nIHRoZSBvdXRwdXQgZGl2IGVsZW1lbnRcbmNvbnN0IHVwZGF0ZU91dHB1dCA9IChtZXNzYWdlLCB0eXBlKSA9PiB7XG4gIC8vIEdldCB0aGUgb3VwdXQgZWxlbWVudFxuICBjb25zdCBvdXRwdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtb3V0cHV0XCIpO1xuXG4gIC8vIEFwcGVuZCBuZXcgbWVzc2FnZVxuICBjb25zdCBtZXNzYWdlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7IC8vIENyZWF0ZSBhIG5ldyBkaXYgZm9yIHRoZSBtZXNzYWdlXG4gIG1lc3NhZ2VFbGVtZW50LnRleHRDb250ZW50ID0gbWVzc2FnZTsgLy8gU2V0IHRoZSB0ZXh0IGNvbnRlbnQgdG8gdGhlIG1lc3NhZ2VcblxuICAvLyBBcHBseSBzdHlsaW5nIGJhc2VkIG9uIHByb21wdFR5cGVcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSBcInZhbGlkXCI6XG4gICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwidGV4dC1saW1lLTYwMFwiKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJtaXNzXCI6XG4gICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwidGV4dC1vcmFuZ2UtNTAwXCIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImVycm9yXCI6XG4gICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwidGV4dC1yZWQtNTAwXCIpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIG1lc3NhZ2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJ0ZXh0LWdyYXktODAwXCIpOyAvLyBEZWZhdWx0IHRleHQgY29sb3JcbiAgfVxuXG4gIG91dHB1dC5hcHBlbmRDaGlsZChtZXNzYWdlRWxlbWVudCk7IC8vIEFkZCB0aGUgZWxlbWVudCB0byB0aGUgb3V0cHV0XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIG91dHB1dC5zY3JvbGxUb3AgPSBvdXRwdXQuc2Nyb2xsSGVpZ2h0OyAvLyBTY3JvbGwgdG8gdGhlIGJvdHRvbSBvZiB0aGUgb3V0cHV0IGNvbnRhaW5lclxufTtcblxuLy8gVGhlIGZ1bmN0aW9uIGZvciBleGVjdXRpbmcgY29tbWFuZHMgZnJvbSB0aGUgY29uc29sZSBpbnB1dFxuY29uc3QgY29uc29sZUxvZ0NvbW1hbmQgPSAoc2hpcFR5cGUsIGdyaWRQb3NpdGlvbiwgb3JpZW50YXRpb24pID0+IHtcbiAgLy8gU2V0IHRoZSBvcmllbnRhdGlvbiBmZWVkYmFja1xuICBjb25zdCBkaXJGZWViYWNrID0gb3JpZW50YXRpb24gPT09IFwiaFwiID8gXCJob3Jpem9udGFsbHlcIiA6IFwidmVydGljYWxseVwiO1xuICAvLyBTZXQgdGhlIGNvbnNvbGUgbWVzc2FnZVxuICBjb25zdCBtZXNzYWdlID0gYCR7c2hpcFR5cGUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzaGlwVHlwZS5zbGljZSgxKX0gcGxhY2VkIGF0ICR7Z3JpZFBvc2l0aW9ufSBmYWNpbmcgJHtkaXJGZWViYWNrfWA7XG5cbiAgY29uc29sZS5sb2coYCR7bWVzc2FnZX1gKTtcblxuICB1cGRhdGVPdXRwdXQoYD4gJHttZXNzYWdlfWAsIFwidmFsaWRcIik7XG5cbiAgLy8gQ2xlYXIgdGhlIGlucHV0XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1pbnB1dFwiKS52YWx1ZSA9IFwiXCI7XG59O1xuXG5jb25zdCBjb25zb2xlTG9nRXJyb3IgPSAoc2hpcFR5cGUsIGVycm9yKSA9PiB7XG4gIGNvbnNvbGUuZXJyb3IoYEVycm9yIHBsYWNpbmcgJHtzaGlwVHlwZX06IG1lc3NhZ2UgPSAke2Vycm9yLm1lc3NhZ2V9LmApO1xuXG4gIHVwZGF0ZU91dHB1dChgPiBFcnJvciBwbGFjaW5nICR7c2hpcFR5cGV9OiAke2Vycm9yLm1lc3NhZ2V9YCwgXCJlcnJvclwiKTtcblxuICAvLyBDbGVhciB0aGUgaW5wdXRcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLWlucHV0XCIpLnZhbHVlID0gXCJcIjtcbn07XG5cbi8vIEZ1bmN0aW9uIGluaXRpYWxpc2UgdWlNYW5hZ2VyXG5jb25zdCBpbml0VWlNYW5hZ2VyID0gKHVpTWFuYWdlcikgPT4ge1xuICAvLyBJbml0aWFsaXNlIGNvbnNvbGVcbiAgdWlNYW5hZ2VyLmluaXRDb25zb2xlVUkoKTtcblxuICAvLyBJbml0aWFsaXNlIGdhbWVib2FyZCB3aXRoIGNhbGxiYWNrIGZvciBjZWxsIGNsaWNrc1xuICB1aU1hbmFnZXIuY3JlYXRlR2FtZWJvYXJkKFwiaHVtYW4tZ2JcIik7XG4gIHVpTWFuYWdlci5jcmVhdGVHYW1lYm9hcmQoXCJjb21wLWdiXCIpO1xufTtcblxuLy8gRnVuY3Rpb24gdG8gY2FsY3VsYXRlIGNlbGwgSURzIGJhc2VkIG9uIHN0YXJ0IHBvc2l0aW9uLCBsZW5ndGgsIGFuZCBvcmllbnRhdGlvblxuZnVuY3Rpb24gY2FsY3VsYXRlU2hpcENlbGxzKHN0YXJ0Q2VsbCwgc2hpcExlbmd0aCwgb3JpZW50YXRpb24pIHtcbiAgY29uc3QgY2VsbElkcyA9IFtdO1xuICBjb25zdCByb3dJbmRleCA9IHN0YXJ0Q2VsbC5jaGFyQ29kZUF0KDApIC0gXCJBXCIuY2hhckNvZGVBdCgwKTtcbiAgY29uc3QgY29sSW5kZXggPSBwYXJzZUludChzdGFydENlbGwuc3Vic3RyaW5nKDEpLCAxMCkgLSAxO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgaWYgKG9yaWVudGF0aW9uID09PSBcInZcIikge1xuICAgICAgaWYgKGNvbEluZGV4ICsgaSA+PSBncmlkWzBdLmxlbmd0aCkgYnJlYWs7IC8vIENoZWNrIGdyaWQgYm91bmRzXG4gICAgICBjZWxsSWRzLnB1c2goXG4gICAgICAgIGAke1N0cmluZy5mcm9tQ2hhckNvZGUocm93SW5kZXggKyBcIkFcIi5jaGFyQ29kZUF0KDApKX0ke2NvbEluZGV4ICsgaSArIDF9YCxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChyb3dJbmRleCArIGkgPj0gZ3JpZC5sZW5ndGgpIGJyZWFrOyAvLyBDaGVjayBncmlkIGJvdW5kc1xuICAgICAgY2VsbElkcy5wdXNoKFxuICAgICAgICBgJHtTdHJpbmcuZnJvbUNoYXJDb2RlKHJvd0luZGV4ICsgaSArIFwiQVwiLmNoYXJDb2RlQXQoMCkpfSR7Y29sSW5kZXggKyAxfWAsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjZWxsSWRzO1xufVxuXG4vLyBGdW5jdGlvbiB0byBoaWdobGlnaHQgY2VsbHNcbmZ1bmN0aW9uIGhpZ2hsaWdodENlbGxzKGNlbGxJZHMpIHtcbiAgY2VsbElkcy5mb3JFYWNoKChjZWxsSWQpID0+IHtcbiAgICBjb25zdCBjZWxsRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiJHtjZWxsSWR9XCJdYCk7XG4gICAgaWYgKGNlbGxFbGVtZW50KSB7XG4gICAgICBjZWxsRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiYmctb3JhbmdlLTQwMFwiKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBGdW5jdGlvbiB0byBjbGVhciBoaWdobGlnaHQgZnJvbSBjZWxsc1xuZnVuY3Rpb24gY2xlYXJIaWdobGlnaHQoY2VsbElkcykge1xuICBjZWxsSWRzLmZvckVhY2goKGNlbGxJZCkgPT4ge1xuICAgIGNvbnN0IGNlbGxFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcG9zaXRpb249XCIke2NlbGxJZH1cIl1gKTtcbiAgICBpZiAoY2VsbEVsZW1lbnQpIHtcbiAgICAgIGNlbGxFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJiZy1vcmFuZ2UtNDAwXCIpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIEZ1bmN0aW9uIHRvIHRvZ2dsZSBvcmllbnRhdGlvblxuZnVuY3Rpb24gdG9nZ2xlT3JpZW50YXRpb24oKSB7XG4gIGN1cnJlbnRPcmllbnRhdGlvbiA9IGN1cnJlbnRPcmllbnRhdGlvbiA9PT0gXCJoXCIgPyBcInZcIiA6IFwiaFwiO1xuICAvLyBVcGRhdGUgdGhlIHZpc3VhbCBwcm9tcHQgaGVyZSBpZiBuZWNlc3Nhcnlcbn1cblxuY29uc3QgaGFuZGxlUGxhY2VtZW50SG92ZXIgPSAoZSkgPT4ge1xuICBjb25zdCBjZWxsID0gZS50YXJnZXQ7XG4gIGlmIChcbiAgICBjZWxsLmNsYXNzTGlzdC5jb250YWlucyhcImdhbWVib2FyZC1jZWxsXCIpICYmXG4gICAgY2VsbC5kYXRhc2V0LnBsYXllciA9PT0gXCJodW1hblwiXG4gICkge1xuICAgIC8vIExvZ2ljIHRvIGhhbmRsZSBob3ZlciBlZmZlY3RcbiAgICBjb25zdCBjZWxsUG9zID0gY2VsbC5kYXRhc2V0LnBvc2l0aW9uO1xuICAgIGxhc3RIb3ZlcmVkQ2VsbCA9IGNlbGxQb3M7XG4gICAgY29uc3QgY2VsbHNUb0hpZ2hsaWdodCA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgIGNlbGxQb3MsXG4gICAgICBjdXJyZW50U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgY3VycmVudE9yaWVudGF0aW9uLFxuICAgICk7XG4gICAgaGlnaGxpZ2h0Q2VsbHMoY2VsbHNUb0hpZ2hsaWdodCk7XG4gIH1cbn07XG5cbmNvbnN0IGhhbmRsZU1vdXNlTGVhdmUgPSAoZSkgPT4ge1xuICBjb25zdCBjZWxsID0gZS50YXJnZXQ7XG4gIGlmIChjZWxsLmNsYXNzTGlzdC5jb250YWlucyhcImdhbWVib2FyZC1jZWxsXCIpKSB7XG4gICAgLy8gTG9naWMgZm9yIGhhbmRsaW5nIHdoZW4gdGhlIGN1cnNvciBsZWF2ZXMgYSBjZWxsXG4gICAgY29uc3QgY2VsbFBvcyA9IGNlbGwuZGF0YXNldC5wb3NpdGlvbjtcbiAgICBpZiAoY2VsbFBvcyA9PT0gbGFzdEhvdmVyZWRDZWxsKSB7XG4gICAgICBjb25zdCBjZWxsc1RvQ2xlYXIgPSBjYWxjdWxhdGVTaGlwQ2VsbHMoXG4gICAgICAgIGNlbGxQb3MsXG4gICAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICAgIGN1cnJlbnRPcmllbnRhdGlvbixcbiAgICAgICk7XG4gICAgICBjbGVhckhpZ2hsaWdodChjZWxsc1RvQ2xlYXIpO1xuICAgICAgbGFzdEhvdmVyZWRDZWxsID0gbnVsbDsgLy8gUmVzZXQgbGFzdEhvdmVyZWRDZWxsIHNpbmNlIHRoZSBtb3VzZSBoYXMgbGVmdFxuICAgIH1cbiAgICBsYXN0SG92ZXJlZENlbGwgPSBudWxsO1xuICB9XG59O1xuXG5jb25zdCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSA9IChlKSA9PiB7XG4gIGlmIChlLmtleSA9PT0gXCIgXCIgJiYgbGFzdEhvdmVyZWRDZWxsKSB7XG4gICAgLy8gRW5zdXJlIHNwYWNlYmFyIGlzIHByZXNzZWQgYW5kIHRoZXJlJ3MgYSBsYXN0IGhvdmVyZWQgY2VsbFxuICAgIGUucHJldmVudERlZmF1bHQoKTsgLy8gUHJldmVudCB0aGUgZGVmYXVsdCBzcGFjZWJhciBhY3Rpb25cblxuICAgIC8vIFRvZ2dsZSB0aGUgb3JpZW50YXRpb25cbiAgICB0b2dnbGVPcmllbnRhdGlvbigpO1xuXG4gICAgLy8gQ2xlYXIgcHJldmlvdXNseSBoaWdobGlnaHRlZCBjZWxsc1xuICAgIC8vIEFzc3VtaW5nIGNhbGN1bGF0ZVNoaXBDZWxscyBhbmQgY2xlYXJIaWdobGlnaHQgd29yayBjb3JyZWN0bHlcbiAgICBjb25zdCBvbGRDZWxsc1RvQ2xlYXIgPSBjYWxjdWxhdGVTaGlwQ2VsbHMoXG4gICAgICBsYXN0SG92ZXJlZENlbGwsXG4gICAgICBjdXJyZW50U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgY3VycmVudE9yaWVudGF0aW9uID09PSBcImhcIiA/IFwidlwiIDogXCJoXCIsXG4gICAgKTtcbiAgICBjbGVhckhpZ2hsaWdodChvbGRDZWxsc1RvQ2xlYXIpO1xuXG4gICAgLy8gSGlnaGxpZ2h0IG5ldyBjZWxscyBiYXNlZCBvbiB0aGUgbmV3IG9yaWVudGF0aW9uXG4gICAgY29uc3QgbmV3Q2VsbHNUb0hpZ2hsaWdodCA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgIGxhc3RIb3ZlcmVkQ2VsbCxcbiAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICBjdXJyZW50T3JpZW50YXRpb24sXG4gICAgKTtcbiAgICBoaWdobGlnaHRDZWxscyhuZXdDZWxsc1RvSGlnaGxpZ2h0KTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZGlzYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoKSB7XG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImNvbXB1dGVyXCJdJylcbiAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKFwicG9pbnRlci1ldmVudHMtbm9uZVwiLCBcImN1cnNvci1kZWZhdWx0XCIpO1xuICAgICAgY2VsbC5jbGFzc0xpc3QucmVtb3ZlKFwiaG92ZXI6Ymctb3JhbmdlLTUwMFwiKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc3dpdGNoR2FtZWJvYXJkSG92ZXJTdGF0ZXMoKSB7XG4gIC8vIERpc2FibGUgaG92ZXIgb24gdGhlIGh1bWFuJ3MgZ2FtZWJvYXJkXG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImh1bWFuXCJdJylcbiAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKFwicG9pbnRlci1ldmVudHMtbm9uZVwiLCBcImN1cnNvci1kZWZhdWx0XCIpO1xuICAgIH0pO1xuXG4gIC8vIEVuYWJsZSBob3ZlciBvbiB0aGUgY29tcHV0ZXIncyBnYW1lYm9hcmRcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvckFsbCgnLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPVwiY29tcHV0ZXJcIl0nKVxuICAgIC5mb3JFYWNoKChjZWxsKSA9PiB7XG4gICAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUoXCJwb2ludGVyLWV2ZW50cy1ub25lXCIsIFwiY3Vyc29yLWRlZmF1bHRcIik7XG4gICAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUoXCJob3ZlcjpiZy1vcmFuZ2UtNTAwXCIpO1xuICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKFwiaG92ZXI6Ymctb3JhbmdlLTUwMFwiKTtcbiAgICB9KTtcbn1cblxuLy8gRnVuY3Rpb24gdG8gc2V0dXAgZ2FtZWJvYXJkIGZvciBzaGlwIHBsYWNlbWVudFxuY29uc3Qgc2V0dXBHYW1lYm9hcmRGb3JQbGFjZW1lbnQgPSAoKSA9PiB7XG4gIGRpc2FibGVDb21wdXRlckdhbWVib2FyZEhvdmVyKCk7XG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImh1bWFuXCJdJylcbiAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBoYW5kbGVQbGFjZW1lbnRIb3Zlcik7XG4gICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIGhhbmRsZU1vdXNlTGVhdmUpO1xuICAgIH0pO1xuICAvLyBHZXQgZ2FtZWJvYXJkIGFyZWEgZGl2IGVsZW1lbnRcbiAgY29uc3QgZ2FtZWJvYXJkQXJlYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgXCIuZ2FtZWJvYXJkLWFyZWEsIFtkYXRhLXBsYXllcj0naHVtYW4nXVwiLFxuICApO1xuICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIHRvIGdhbWVib2FyZCBhcmVhIHRvIGFkZCBhbmQgcmVtb3ZlIHRoZVxuICAvLyBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSBldmVudCBsaXN0ZW5lciB3aGVuIGVudGVyaW5nIGFuZCBleGl0aW5nIHRoZSBhcmVhXG4gIGdhbWVib2FyZEFyZWEuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlKTtcbiAgfSk7XG4gIGdhbWVib2FyZEFyZWEuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlKTtcbiAgfSk7XG59O1xuXG4vLyBGdW5jdGlvbiB0byBjbGVhbiB1cCBhZnRlciBzaGlwIHBsYWNlbWVudCBpcyBjb21wbGV0ZVxuY29uc3QgY2xlYW51cEFmdGVyUGxhY2VtZW50ID0gKCkgPT4ge1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9XCJodW1hblwiXScpXG4gICAgLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAgIGNlbGwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgaGFuZGxlUGxhY2VtZW50SG92ZXIpO1xuICAgICAgY2VsbC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCBoYW5kbGVNb3VzZUxlYXZlKTtcbiAgICB9KTtcbiAgLy8gR2V0IGdhbWVib2FyZCBhcmVhIGRpdiBlbGVtZW50XG4gIGNvbnN0IGdhbWVib2FyZEFyZWEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgIFwiLmdhbWVib2FyZC1hcmVhLCBbZGF0YS1wbGF5ZXI9J2h1bWFuJ11cIixcbiAgKTtcbiAgLy8gUmVtb3ZlIGV2ZW50IGxpc3RlbmVycyB0byBnYW1lYm9hcmQgYXJlYSB0byBhZGQgYW5kIHJlbW92ZSB0aGVcbiAgLy8gaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUgZXZlbnQgbGlzdGVuZXIgd2hlbiBlbnRlcmluZyBhbmQgZXhpdGluZyB0aGUgYXJlYVxuICBnYW1lYm9hcmRBcmVhLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSk7XG4gIH0pO1xuICBnYW1lYm9hcmRBcmVhLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSk7XG4gIH0pO1xuICAvLyBSZW1vdmUgZXZlbnQgbGlzdGVuZXIgZm9yIGtleWRvd24gZXZlbnRzXG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlKTtcbn07XG5cbmNvbnN0IEFjdGlvbkNvbnRyb2xsZXIgPSAodWlNYW5hZ2VyLCBnYW1lKSA9PiB7XG4gIGNvbnN0IGh1bWFuUGxheWVyID0gZ2FtZS5wbGF5ZXJzLmh1bWFuO1xuICBjb25zdCBodW1hblBsYXllckdhbWVib2FyZCA9IGh1bWFuUGxheWVyLmdhbWVib2FyZDtcblxuICAvLyBGdW5jdGlvbiB0byBzZXR1cCBldmVudCBsaXN0ZW5lcnMgZm9yIGNvbnNvbGUgYW5kIGdhbWVib2FyZCBjbGlja3NcbiAgZnVuY3Rpb24gc2V0dXBFdmVudExpc3RlbmVycyhoYW5kbGVWYWxpZElucHV0KSB7XG4gICAgLy8gRGVmaW5lIGNsZWFudXAgZnVuY3Rpb25zIGluc2lkZSB0byBlbnN1cmUgdGhleSBhcmUgYWNjZXNzaWJsZSBmb3IgcmVtb3ZhbFxuICAgIGNvbnN0IGNsZWFudXBGdW5jdGlvbnMgPSBbXTtcblxuICAgIGNvbnN0IGNvbnNvbGVTdWJtaXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtc3VibWl0XCIpO1xuICAgIGNvbnN0IGNvbnNvbGVJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1pbnB1dFwiKTtcblxuICAgIGNvbnN0IHN1Ym1pdEhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICBjb25zdCBpbnB1dCA9IGNvbnNvbGVJbnB1dC52YWx1ZTtcbiAgICAgIGhhbmRsZVZhbGlkSW5wdXQoaW5wdXQpO1xuICAgICAgY29uc29sZUlucHV0LnZhbHVlID0gXCJcIjsgLy8gQ2xlYXIgaW5wdXQgYWZ0ZXIgc3VibWlzc2lvblxuICAgIH07XG5cbiAgICBjb25zdCBrZXlwcmVzc0hhbmRsZXIgPSAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSBcIkVudGVyXCIpIHtcbiAgICAgICAgc3VibWl0SGFuZGxlcigpOyAvLyBSZXVzZSBzdWJtaXQgbG9naWMgZm9yIEVudGVyIGtleSBwcmVzc1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zb2xlU3VibWl0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzdWJtaXRIYW5kbGVyKTtcbiAgICBjb25zb2xlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGtleXByZXNzSGFuZGxlcik7XG5cbiAgICAvLyBBZGQgY2xlYW51cCBmdW5jdGlvbiBmb3IgY29uc29sZSBsaXN0ZW5lcnNcbiAgICBjbGVhbnVwRnVuY3Rpb25zLnB1c2goKCkgPT4ge1xuICAgICAgY29uc29sZVN1Ym1pdEJ1dHRvbi5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgc3VibWl0SGFuZGxlcik7XG4gICAgICBjb25zb2xlSW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGtleXByZXNzSGFuZGxlcik7XG4gICAgfSk7XG5cbiAgICAvLyBTZXR1cCBmb3IgZ2FtZWJvYXJkIGNlbGwgY2xpY2tzXG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9XCJodW1hblwiXScpXG4gICAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgICBjb25zdCBjbGlja0hhbmRsZXIgPSAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgeyBwb3NpdGlvbiB9ID0gY2VsbC5kYXRhc2V0O1xuICAgICAgICAgIGNvbnN0IGlucHV0ID0gYCR7cG9zaXRpb259ICR7Y3VycmVudE9yaWVudGF0aW9ufWA7XG4gICAgICAgICAgY29uc29sZS5sb2coYGNsaWNrSGFuZGxlciBpbnB1dCA9ICR7aW5wdXR9YCk7XG4gICAgICAgICAgaGFuZGxlVmFsaWRJbnB1dChpbnB1dCk7XG4gICAgICAgIH07XG4gICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsaWNrSGFuZGxlcik7XG5cbiAgICAgICAgLy8gQWRkIGNsZWFudXAgZnVuY3Rpb24gZm9yIGVhY2ggY2VsbCBsaXN0ZW5lclxuICAgICAgICBjbGVhbnVwRnVuY3Rpb25zLnB1c2goKCkgPT5cbiAgICAgICAgICBjZWxsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbGlja0hhbmRsZXIpLFxuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICAvLyBSZXR1cm4gYSBzaW5nbGUgY2xlYW51cCBmdW5jdGlvbiB0byByZW1vdmUgYWxsIGxpc3RlbmVyc1xuICAgIHJldHVybiAoKSA9PiBjbGVhbnVwRnVuY3Rpb25zLmZvckVhY2goKGNsZWFudXApID0+IGNsZWFudXAoKSk7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBwcm9tcHRBbmRQbGFjZVNoaXAoc2hpcFR5cGUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgLy8gU2V0IHRoZSBjdXJyZW50IHNoaXBcbiAgICAgIGN1cnJlbnRTaGlwID0gc2hpcHNUb1BsYWNlLmZpbmQoKHNoaXApID0+IHNoaXAuc2hpcFR5cGUgPT09IHNoaXBUeXBlKTtcblxuICAgICAgLy8gRGlzcGxheSBwcm9tcHQgZm9yIHRoZSBzcGVjaWZpYyBzaGlwIHR5cGUgYXMgd2VsbCBhcyB0aGUgZ3VpZGUgdG8gcGxhY2luZyBzaGlwc1xuICAgICAgY29uc3QgcGxhY2VTaGlwUHJvbXB0ID0ge1xuICAgICAgICBwcm9tcHQ6IGBQbGFjZSB5b3VyICR7c2hpcFR5cGV9LmAsXG4gICAgICAgIHByb21wdFR5cGU6IFwiaW5zdHJ1Y3Rpb25cIixcbiAgICAgIH07XG4gICAgICB1aU1hbmFnZXIuZGlzcGxheVByb21wdCh7IHBsYWNlU2hpcFByb21wdCwgcGxhY2VTaGlwR3VpZGUgfSk7XG5cbiAgICAgIGNvbnN0IGhhbmRsZVZhbGlkSW5wdXQgPSBhc3luYyAoaW5wdXQpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB7IGdyaWRQb3NpdGlvbiwgb3JpZW50YXRpb24gfSA9IHByb2Nlc3NQbGFjZW1lbnRDb21tYW5kKGlucHV0KTtcbiAgICAgICAgICBhd2FpdCBodW1hblBsYXllckdhbWVib2FyZC5wbGFjZVNoaXAoXG4gICAgICAgICAgICBzaGlwVHlwZSxcbiAgICAgICAgICAgIGdyaWRQb3NpdGlvbixcbiAgICAgICAgICAgIG9yaWVudGF0aW9uLFxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc29sZUxvZ0NvbW1hbmQoc2hpcFR5cGUsIGdyaWRQb3NpdGlvbiwgb3JpZW50YXRpb24pO1xuICAgICAgICAgIC8vIFJlbW92ZSBjZWxsIGhpZ2hsaWdodHNcbiAgICAgICAgICBjb25zdCBjZWxsc1RvQ2xlYXIgPSBjYWxjdWxhdGVTaGlwQ2VsbHMoXG4gICAgICAgICAgICBncmlkUG9zaXRpb24sXG4gICAgICAgICAgICBjdXJyZW50U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgICAgICAgb3JpZW50YXRpb24sXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjbGVhckhpZ2hsaWdodChjZWxsc1RvQ2xlYXIpO1xuXG4gICAgICAgICAgLy8gRGlzcGxheSB0aGUgc2hpcCBvbiB0aGUgZ2FtZSBib2FyZCBhbmQgc2hpcCBzdGF0dXMgZGlzcGxheVxuICAgICAgICAgIHVpTWFuYWdlci5yZW5kZXJTaGlwQm9hcmQoaHVtYW5QbGF5ZXIsIHNoaXBUeXBlKTtcbiAgICAgICAgICB1aU1hbmFnZXIucmVuZGVyU2hpcERpc3AoaHVtYW5QbGF5ZXIsIHNoaXBUeXBlKTtcblxuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11c2UtYmVmb3JlLWRlZmluZVxuICAgICAgICAgIHJlc29sdmVTaGlwUGxhY2VtZW50KCk7IC8vIFNoaXAgcGxhY2VkIHN1Y2Nlc3NmdWxseSwgcmVzb2x2ZSB0aGUgcHJvbWlzZVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGVMb2dFcnJvcihzaGlwVHlwZSwgZXJyb3IpO1xuICAgICAgICAgIC8vIERvIG5vdCByZWplY3QgdG8gYWxsb3cgZm9yIHJldHJ5LCBqdXN0IGxvZyB0aGUgZXJyb3JcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gU2V0dXAgZXZlbnQgbGlzdGVuZXJzIGFuZCBlbnN1cmUgd2UgY2FuIGNsZWFuIHRoZW0gdXAgYWZ0ZXIgcGxhY2VtZW50XG4gICAgICBjb25zdCBjbGVhbnVwID0gc2V0dXBFdmVudExpc3RlbmVycyhoYW5kbGVWYWxpZElucHV0KTtcblxuICAgICAgLy8gQXR0YWNoIGNsZWFudXAgdG8gcmVzb2x2ZSB0byBlbnN1cmUgaXQncyBjYWxsZWQgd2hlbiB0aGUgcHJvbWlzZSByZXNvbHZlc1xuICAgICAgY29uc3QgcmVzb2x2ZVNoaXBQbGFjZW1lbnQgPSAoKSA9PiB7XG4gICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFNlcXVlbnRpYWxseSBwcm9tcHQgZm9yIGFuZCBwbGFjZSBlYWNoIHNoaXBcbiAgYXN5bmMgZnVuY3Rpb24gc2V0dXBTaGlwc1NlcXVlbnRpYWxseSgpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoaXBzVG9QbGFjZS5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWF3YWl0LWluLWxvb3BcbiAgICAgIGF3YWl0IHByb21wdEFuZFBsYWNlU2hpcChzaGlwc1RvUGxhY2VbaV0uc2hpcFR5cGUpOyAvLyBXYWl0IGZvciBlYWNoIHNoaXAgdG8gYmUgcGxhY2VkIGJlZm9yZSBjb250aW51aW5nXG4gICAgfVxuICB9XG5cbiAgLy8gRnVuY3Rpb24gZm9yIGhhbmRsaW5nIHRoZSBnYW1lIHNldHVwIGFuZCBzaGlwIHBsYWNlbWVudFxuICBjb25zdCBoYW5kbGVTZXR1cCA9IGFzeW5jICgpID0+IHtcbiAgICAvLyBJbml0IHRoZSBVSVxuICAgIGluaXRVaU1hbmFnZXIodWlNYW5hZ2VyKTtcbiAgICBzZXR1cEdhbWVib2FyZEZvclBsYWNlbWVudCgpO1xuICAgIGF3YWl0IHNldHVwU2hpcHNTZXF1ZW50aWFsbHkoKTtcbiAgICAvLyBQcm9jZWVkIHdpdGggdGhlIHJlc3Qgb2YgdGhlIGdhbWUgc2V0dXAgYWZ0ZXIgYWxsIHNoaXBzIGFyZSBwbGFjZWRcbiAgICBjbGVhbnVwQWZ0ZXJQbGFjZW1lbnQoKTtcbiAgICBjb25zdCBvdXRwdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtb3V0cHV0XCIpO1xuICAgIHVwZGF0ZU91dHB1dChcIj4gQWxsIHNoaXBzIHBsYWNlZCwgZ2FtZSBzZXR1cCBjb21wbGV0ZSFcIik7XG4gICAgY29uc29sZS5sb2coXCJBbGwgc2hpcHMgcGxhY2VkLCBnYW1lIHNldHVwIGNvbXBsZXRlIVwiKTtcbiAgICBzd2l0Y2hHYW1lYm9hcmRIb3ZlclN0YXRlcygpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgaGFuZGxlU2V0dXAsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBBY3Rpb25Db250cm9sbGVyO1xuIiwiLyogZXNsaW50LWRpc2FibGUgbWF4LWNsYXNzZXMtcGVyLWZpbGUgKi9cblxuY2xhc3MgT3ZlcmxhcHBpbmdTaGlwc0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJTaGlwcyBhcmUgb3ZlcmxhcHBpbmcuXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIk92ZXJsYXBwaW5nU2hpcHNFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIFNoaXBBbGxvY2F0aW9uUmVhY2hlZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJTaGlwIGFsbG9jYXRpb24gbGltaXQgcmVhY2hlZC5cIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiU2hpcEFsbG9jYXRpb25SZWFjaGVkRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIlNoaXAgdHlwZSBhbGxvY2F0aW9uIGxpbWl0IHJlYWNoZWQuXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIlNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRTaGlwTGVuZ3RoRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIkludmFsaWQgc2hpcCBsZW5ndGguXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRTaGlwTGVuZ3RoRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBJbnZhbGlkU2hpcFR5cGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBzaGlwIHR5cGUuXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRTaGlwVHlwZUVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgSW52YWxpZFBsYXllclR5cGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZSA9IFwiSW52YWxpZCBwbGF5ZXIgdHlwZS4gVmFsaWQgcGxheWVyIHR5cGVzOiAnaHVtYW4nICYgJ2NvbXB1dGVyJ1wiLFxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRTaGlwVHlwZUVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIkludmFsaWQgc2hpcCBwbGFjZW1lbnQuIEJvdW5kYXJ5IGVycm9yIVwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIFJlcGVhdEF0dGFja2VkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIkludmFsaWQgYXR0YWNrIGVudHJ5LiBQb3NpdGlvbiBhbHJlYWR5IGF0dGFja2VkIVwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJSZXBlYXRBdHRhY2tFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRNb3ZlRW50cnlFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBtb3ZlIGVudHJ5IVwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJJbnZhbGlkTW92ZUVudHJ5RXJyb3JcIjtcbiAgfVxufVxuXG5leHBvcnQge1xuICBPdmVybGFwcGluZ1NoaXBzRXJyb3IsXG4gIFNoaXBBbGxvY2F0aW9uUmVhY2hlZEVycm9yLFxuICBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IsXG4gIEludmFsaWRTaGlwTGVuZ3RoRXJyb3IsXG4gIEludmFsaWRTaGlwVHlwZUVycm9yLFxuICBJbnZhbGlkUGxheWVyVHlwZUVycm9yLFxuICBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvcixcbiAgUmVwZWF0QXR0YWNrZWRFcnJvcixcbiAgSW52YWxpZE1vdmVFbnRyeUVycm9yLFxufTtcbiIsImltcG9ydCBQbGF5ZXIgZnJvbSBcIi4vcGxheWVyXCI7XG5pbXBvcnQgR2FtZWJvYXJkIGZyb20gXCIuL2dhbWVib2FyZFwiO1xuaW1wb3J0IFNoaXAgZnJvbSBcIi4vc2hpcFwiO1xuaW1wb3J0IHsgSW52YWxpZFBsYXllclR5cGVFcnJvciB9IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBHYW1lID0gKCkgPT4ge1xuICAvLyBJbml0aWFsaXNlLCBjcmVhdGUgZ2FtZWJvYXJkcyBmb3IgYm90aCBwbGF5ZXJzIGFuZCBjcmVhdGUgcGxheWVycyBvZiB0eXBlcyBodW1hbiBhbmQgY29tcHV0ZXJcbiAgY29uc3QgaHVtYW5HYW1lYm9hcmQgPSBHYW1lYm9hcmQoU2hpcCk7XG4gIGNvbnN0IGNvbXB1dGVyR2FtZWJvYXJkID0gR2FtZWJvYXJkKFNoaXApO1xuICBjb25zdCBodW1hblBsYXllciA9IFBsYXllcihodW1hbkdhbWVib2FyZCwgXCJodW1hblwiKTtcbiAgY29uc3QgY29tcHV0ZXJQbGF5ZXIgPSBQbGF5ZXIoY29tcHV0ZXJHYW1lYm9hcmQsIFwiY29tcHV0ZXJcIik7XG4gIGxldCBjdXJyZW50UGxheWVyO1xuICBsZXQgZ2FtZU92ZXJTdGF0ZSA9IGZhbHNlO1xuXG4gIC8vIFN0b3JlIHBsYXllcnMgaW4gYSBwbGF5ZXIgb2JqZWN0XG4gIGNvbnN0IHBsYXllcnMgPSB7IGh1bWFuOiBodW1hblBsYXllciwgY29tcHV0ZXI6IGNvbXB1dGVyUGxheWVyIH07XG5cbiAgLy8gU2V0IHVwIHBoYXNlXG4gIGNvbnN0IHNldFVwID0gKGh1bWFuU2hpcHMpID0+IHtcbiAgICAvLyBBdXRvbWF0aWMgcGxhY2VtZW50IGZvciBjb21wdXRlclxuICAgIGNvbXB1dGVyUGxheWVyLnBsYWNlU2hpcHMoKTtcblxuICAgIC8vIFBsYWNlIHNoaXBzIGZyb20gdGhlIGh1bWFuIHBsYXllcidzIHNlbGVjdGlvbiBvbiB0aGVpciByZXNwZWN0aXZlIGdhbWVib2FyZFxuICAgIGh1bWFuU2hpcHMuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgICAgaHVtYW5QbGF5ZXIucGxhY2VTaGlwcyhzaGlwLnNoaXBUeXBlLCBzaGlwLnN0YXJ0LCBzaGlwLmRpcmVjdGlvbik7XG4gICAgfSk7XG5cbiAgICAvLyBTZXQgdGhlIGN1cnJlbnQgcGxheWVyIHRvIGh1bWFuIHBsYXllclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBodW1hblBsYXllcjtcbiAgfTtcblxuICAvLyBHYW1lIGVuZGluZyBmdW5jdGlvblxuICBjb25zdCBlbmRHYW1lID0gKCkgPT4ge1xuICAgIGdhbWVPdmVyU3RhdGUgPSB0cnVlO1xuICB9O1xuXG4gIC8vIFRha2UgdHVybiBtZXRob2RcbiAgY29uc3QgdGFrZVR1cm4gPSAobW92ZSkgPT4ge1xuICAgIGxldCBmZWVkYmFjaztcblxuICAgIC8vIERldGVybWluZSB0aGUgb3Bwb25lbnQgYmFzZWQgb24gdGhlIGN1cnJlbnQgcGxheWVyXG4gICAgY29uc3Qgb3Bwb25lbnQgPVxuICAgICAgY3VycmVudFBsYXllciA9PT0gaHVtYW5QbGF5ZXIgPyBjb21wdXRlclBsYXllciA6IGh1bWFuUGxheWVyO1xuXG4gICAgLy8gQ2FsbCB0aGUgbWFrZU1vdmUgbWV0aG9kIG9uIHRoZSBjdXJyZW50IHBsYXllciB3aXRoIHRoZSBvcHBvbmVudCdzIGdhbWVib2FyZCBhbmQgc3RvcmUgYXMgbW92ZSBmZWVkYmFja1xuICAgIGNvbnN0IHJlc3VsdCA9IGN1cnJlbnRQbGF5ZXIubWFrZU1vdmUob3Bwb25lbnQuZ2FtZWJvYXJkLCBtb3ZlKTtcblxuICAgIC8vIElmIHJlc3VsdCBpcyBhIGhpdCwgY2hlY2sgd2hldGhlciB0aGUgc2hpcCBpcyBzdW5rXG4gICAgaWYgKHJlc3VsdC5oaXQpIHtcbiAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIHNoaXAgaXMgc3VuayBhbmQgYWRkIHJlc3VsdCBhcyB2YWx1ZSB0byBmZWVkYmFjayBvYmplY3Qgd2l0aCBrZXkgXCJpc1NoaXBTdW5rXCJcbiAgICAgIGlmIChvcHBvbmVudC5nYW1lYm9hcmQuaXNTaGlwU3VuayhyZXN1bHQuc2hpcFR5cGUpKSB7XG4gICAgICAgIGZlZWRiYWNrID0ge1xuICAgICAgICAgIC4uLnJlc3VsdCxcbiAgICAgICAgICBpc1NoaXBTdW5rOiB0cnVlLFxuICAgICAgICAgIGdhbWVXb246IG9wcG9uZW50LmdhbWVib2FyZC5jaGVja0FsbFNoaXBzU3VuaygpLFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmVlZGJhY2sgPSB7IC4uLnJlc3VsdCwgaXNTaGlwU3VuazogZmFsc2UgfTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFyZXN1bHQuaGl0KSB7XG4gICAgICAvLyBTZXQgZmVlZGJhY2sgdG8ganVzdCB0aGUgcmVzdWx0XG4gICAgICBmZWVkYmFjayA9IHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBJZiBnYW1lIGlzIHdvbiwgZW5kIGdhbWVcbiAgICBpZiAoZmVlZGJhY2suZ2FtZVdvbikge1xuICAgICAgZW5kR2FtZSgpO1xuICAgIH1cblxuICAgIC8vIFN3aXRjaCB0aGUgY3VycmVudCBwbGF5ZXJcbiAgICBjdXJyZW50UGxheWVyID0gb3Bwb25lbnQ7XG5cbiAgICAvLyBSZXR1cm4gdGhlIGZlZWRiYWNrIGZvciB0aGUgbW92ZVxuICAgIHJldHVybiBmZWVkYmFjaztcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldCBjdXJyZW50UGxheWVyKCkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRQbGF5ZXI7XG4gICAgfSxcbiAgICBnZXQgZ2FtZU92ZXJTdGF0ZSgpIHtcbiAgICAgIHJldHVybiBnYW1lT3ZlclN0YXRlO1xuICAgIH0sXG4gICAgcGxheWVycyxcbiAgICBzZXRVcCxcbiAgICB0YWtlVHVybixcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWU7XG4iLCJpbXBvcnQge1xuICBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IsXG4gIE92ZXJsYXBwaW5nU2hpcHNFcnJvcixcbiAgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IsXG4gIFJlcGVhdEF0dGFja2VkRXJyb3IsXG59IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBncmlkID0gW1xuICBbXCJBMVwiLCBcIkEyXCIsIFwiQTNcIiwgXCJBNFwiLCBcIkE1XCIsIFwiQTZcIiwgXCJBN1wiLCBcIkE4XCIsIFwiQTlcIiwgXCJBMTBcIl0sXG4gIFtcIkIxXCIsIFwiQjJcIiwgXCJCM1wiLCBcIkI0XCIsIFwiQjVcIiwgXCJCNlwiLCBcIkI3XCIsIFwiQjhcIiwgXCJCOVwiLCBcIkIxMFwiXSxcbiAgW1wiQzFcIiwgXCJDMlwiLCBcIkMzXCIsIFwiQzRcIiwgXCJDNVwiLCBcIkM2XCIsIFwiQzdcIiwgXCJDOFwiLCBcIkM5XCIsIFwiQzEwXCJdLFxuICBbXCJEMVwiLCBcIkQyXCIsIFwiRDNcIiwgXCJENFwiLCBcIkQ1XCIsIFwiRDZcIiwgXCJEN1wiLCBcIkQ4XCIsIFwiRDlcIiwgXCJEMTBcIl0sXG4gIFtcIkUxXCIsIFwiRTJcIiwgXCJFM1wiLCBcIkU0XCIsIFwiRTVcIiwgXCJFNlwiLCBcIkU3XCIsIFwiRThcIiwgXCJFOVwiLCBcIkUxMFwiXSxcbiAgW1wiRjFcIiwgXCJGMlwiLCBcIkYzXCIsIFwiRjRcIiwgXCJGNVwiLCBcIkY2XCIsIFwiRjdcIiwgXCJGOFwiLCBcIkY5XCIsIFwiRjEwXCJdLFxuICBbXCJHMVwiLCBcIkcyXCIsIFwiRzNcIiwgXCJHNFwiLCBcIkc1XCIsIFwiRzZcIiwgXCJHN1wiLCBcIkc4XCIsIFwiRzlcIiwgXCJHMTBcIl0sXG4gIFtcIkgxXCIsIFwiSDJcIiwgXCJIM1wiLCBcIkg0XCIsIFwiSDVcIiwgXCJINlwiLCBcIkg3XCIsIFwiSDhcIiwgXCJIOVwiLCBcIkgxMFwiXSxcbiAgW1wiSTFcIiwgXCJJMlwiLCBcIkkzXCIsIFwiSTRcIiwgXCJJNVwiLCBcIkk2XCIsIFwiSTdcIiwgXCJJOFwiLCBcIkk5XCIsIFwiSTEwXCJdLFxuICBbXCJKMVwiLCBcIkoyXCIsIFwiSjNcIiwgXCJKNFwiLCBcIko1XCIsIFwiSjZcIiwgXCJKN1wiLCBcIko4XCIsIFwiSjlcIiwgXCJKMTBcIl0sXG5dO1xuXG5jb25zdCBpbmRleENhbGNzID0gKHN0YXJ0KSA9PiB7XG4gIGNvbnN0IGNvbExldHRlciA9IHN0YXJ0WzBdLnRvVXBwZXJDYXNlKCk7IC8vIFRoaXMgaXMgdGhlIGNvbHVtblxuICBjb25zdCByb3dOdW1iZXIgPSBwYXJzZUludChzdGFydC5zbGljZSgxKSwgMTApOyAvLyBUaGlzIGlzIHRoZSByb3dcblxuICBjb25zdCBjb2xJbmRleCA9IGNvbExldHRlci5jaGFyQ29kZUF0KDApIC0gXCJBXCIuY2hhckNvZGVBdCgwKTsgLy8gQ29sdW1uIGluZGV4IGJhc2VkIG9uIGxldHRlclxuICBjb25zdCByb3dJbmRleCA9IHJvd051bWJlciAtIDE7IC8vIFJvdyBpbmRleCBiYXNlZCBvbiBudW1iZXJcblxuICByZXR1cm4gW2NvbEluZGV4LCByb3dJbmRleF07IC8vIFJldHVybiBbcm93LCBjb2x1bW5dXG59O1xuXG5jb25zdCBjaGVja1R5cGUgPSAoc2hpcCwgc2hpcFBvc2l0aW9ucykgPT4ge1xuICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIHNoaXBQb3NpdGlvbnMgb2JqZWN0XG4gIE9iamVjdC5rZXlzKHNoaXBQb3NpdGlvbnMpLmZvckVhY2goKGV4aXN0aW5nU2hpcFR5cGUpID0+IHtcbiAgICBpZiAoZXhpc3RpbmdTaGlwVHlwZSA9PT0gc2hpcCkge1xuICAgICAgdGhyb3cgbmV3IFNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvcigpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5jb25zdCBjaGVja0JvdW5kYXJpZXMgPSAoc2hpcExlbmd0aCwgY29vcmRzLCBkaXJlY3Rpb24pID0+IHtcbiAgLy8gU2V0IHJvdyBhbmQgY29sIGxpbWl0c1xuICBjb25zdCB4TGltaXQgPSBncmlkLmxlbmd0aDsgLy8gVGhpcyBpcyB0aGUgdG90YWwgbnVtYmVyIG9mIGNvbHVtbnMgKHgpXG4gIGNvbnN0IHlMaW1pdCA9IGdyaWRbMF0ubGVuZ3RoOyAvLyBUaGlzIGlzIHRoZSB0b3RhbCBudW1iZXIgb2Ygcm93cyAoeSlcblxuICBjb25zdCB4ID0gY29vcmRzWzBdO1xuICBjb25zdCB5ID0gY29vcmRzWzFdO1xuXG4gIC8vIENoZWNrIGZvciB2YWxpZCBzdGFydCBwb3NpdGlvbiBvbiBib2FyZFxuICBpZiAoeCA8IDAgfHwgeCA+PSB4TGltaXQgfHwgeSA8IDAgfHwgeSA+PSB5TGltaXQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBDaGVjayByaWdodCBib3VuZGFyeSBmb3IgaG9yaXpvbnRhbCBwbGFjZW1lbnRcbiAgaWYgKGRpcmVjdGlvbiA9PT0gXCJoXCIgJiYgeCArIHNoaXBMZW5ndGggPiB4TGltaXQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gQ2hlY2sgYm90dG9tIGJvdW5kYXJ5IGZvciB2ZXJ0aWNhbCBwbGFjZW1lbnRcbiAgaWYgKGRpcmVjdGlvbiA9PT0gXCJ2XCIgJiYgeSArIHNoaXBMZW5ndGggPiB5TGltaXQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBJZiBub25lIG9mIHRoZSBpbnZhbGlkIGNvbmRpdGlvbnMgYXJlIG1ldCwgcmV0dXJuIHRydWVcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5jb25zdCBjYWxjdWxhdGVTaGlwUG9zaXRpb25zID0gKHNoaXBMZW5ndGgsIGNvb3JkcywgZGlyZWN0aW9uKSA9PiB7XG4gIGNvbnN0IGNvbEluZGV4ID0gY29vcmRzWzBdOyAvLyBUaGlzIGlzIHRoZSBjb2x1bW4gaW5kZXhcbiAgY29uc3Qgcm93SW5kZXggPSBjb29yZHNbMV07IC8vIFRoaXMgaXMgdGhlIHJvdyBpbmRleFxuXG4gIGNvbnN0IHBvc2l0aW9ucyA9IFtdO1xuXG4gIGlmIChkaXJlY3Rpb24udG9Mb3dlckNhc2UoKSA9PT0gXCJoXCIpIHtcbiAgICAvLyBIb3Jpem9udGFsIHBsYWNlbWVudDogaW5jcmVtZW50IHRoZSBjb2x1bW4gaW5kZXhcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoaXBMZW5ndGg7IGkrKykge1xuICAgICAgcG9zaXRpb25zLnB1c2goZ3JpZFtjb2xJbmRleCArIGldW3Jvd0luZGV4XSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIFZlcnRpY2FsIHBsYWNlbWVudDogaW5jcmVtZW50IHRoZSByb3cgaW5kZXhcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoaXBMZW5ndGg7IGkrKykge1xuICAgICAgcG9zaXRpb25zLnB1c2goZ3JpZFtjb2xJbmRleF1bcm93SW5kZXggKyBpXSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBvc2l0aW9ucztcbn07XG5cbmNvbnN0IGNoZWNrRm9yT3ZlcmxhcCA9IChwb3NpdGlvbnMsIHNoaXBQb3NpdGlvbnMpID0+IHtcbiAgT2JqZWN0LmVudHJpZXMoc2hpcFBvc2l0aW9ucykuZm9yRWFjaCgoW3NoaXBUeXBlLCBleGlzdGluZ1NoaXBQb3NpdGlvbnNdKSA9PiB7XG4gICAgaWYgKFxuICAgICAgcG9zaXRpb25zLnNvbWUoKHBvc2l0aW9uKSA9PiBleGlzdGluZ1NoaXBQb3NpdGlvbnMuaW5jbHVkZXMocG9zaXRpb24pKVxuICAgICkge1xuICAgICAgdGhyb3cgbmV3IE92ZXJsYXBwaW5nU2hpcHNFcnJvcihcbiAgICAgICAgYE92ZXJsYXAgZGV0ZWN0ZWQgd2l0aCBzaGlwIHR5cGUgJHtzaGlwVHlwZX1gLFxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgY2hlY2tGb3JIaXQgPSAocG9zaXRpb24sIHNoaXBQb3NpdGlvbnMpID0+IHtcbiAgY29uc3QgZm91bmRTaGlwID0gT2JqZWN0LmVudHJpZXMoc2hpcFBvc2l0aW9ucykuZmluZChcbiAgICAoW18sIGV4aXN0aW5nU2hpcFBvc2l0aW9uc10pID0+IGV4aXN0aW5nU2hpcFBvc2l0aW9ucy5pbmNsdWRlcyhwb3NpdGlvbiksXG4gICk7XG5cbiAgcmV0dXJuIGZvdW5kU2hpcCA/IHsgaGl0OiB0cnVlLCBzaGlwVHlwZTogZm91bmRTaGlwWzBdIH0gOiB7IGhpdDogZmFsc2UgfTtcbn07XG5cbmNvbnN0IEdhbWVib2FyZCA9IChzaGlwRmFjdG9yeSkgPT4ge1xuICBjb25zdCBzaGlwcyA9IHt9O1xuICBjb25zdCBzaGlwUG9zaXRpb25zID0ge307XG4gIGNvbnN0IGhpdFBvc2l0aW9ucyA9IHt9O1xuICBjb25zdCBhdHRhY2tMb2cgPSBbW10sIFtdXTtcblxuICBjb25zdCBwbGFjZVNoaXAgPSAodHlwZSwgc3RhcnQsIGRpcmVjdGlvbikgPT4ge1xuICAgIGNvbnN0IG5ld1NoaXAgPSBzaGlwRmFjdG9yeSh0eXBlKTtcblxuICAgIC8vIENoZWNrIHRoZSBzaGlwIHR5cGUgYWdhaW5zdCBleGlzdGluZyB0eXBlc1xuICAgIGNoZWNrVHlwZSh0eXBlLCBzaGlwUG9zaXRpb25zKTtcblxuICAgIC8vIENhbGN1bGF0ZSBzdGFydCBwb2ludCBjb29yZGluYXRlcyBiYXNlZCBvbiBzdGFydCBwb2ludCBncmlkIGtleVxuICAgIGNvbnN0IGNvb3JkcyA9IGluZGV4Q2FsY3Moc3RhcnQpO1xuXG4gICAgLy8gQ2hlY2sgYm91bmRhcmllcywgaWYgb2sgY29udGludWUgdG8gbmV4dCBzdGVwXG4gICAgaWYgKGNoZWNrQm91bmRhcmllcyhuZXdTaGlwLnNoaXBMZW5ndGgsIGNvb3JkcywgZGlyZWN0aW9uKSkge1xuICAgICAgLy8gQ2FsY3VsYXRlIGFuZCBzdG9yZSBwb3NpdGlvbnMgZm9yIGEgbmV3IHNoaXBcbiAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IGNhbGN1bGF0ZVNoaXBQb3NpdGlvbnMoXG4gICAgICAgIG5ld1NoaXAuc2hpcExlbmd0aCxcbiAgICAgICAgY29vcmRzLFxuICAgICAgICBkaXJlY3Rpb24sXG4gICAgICApO1xuXG4gICAgICAvLyBDaGVjayBmb3Igb3ZlcmxhcCBiZWZvcmUgcGxhY2luZyB0aGUgc2hpcFxuICAgICAgY2hlY2tGb3JPdmVybGFwKHBvc2l0aW9ucywgc2hpcFBvc2l0aW9ucyk7XG5cbiAgICAgIC8vIElmIG5vIG92ZXJsYXAsIHByb2NlZWQgdG8gcGxhY2Ugc2hpcFxuICAgICAgc2hpcFBvc2l0aW9uc1t0eXBlXSA9IHBvc2l0aW9ucztcbiAgICAgIC8vIEFkZCBzaGlwIHRvIHNoaXBzIG9iamVjdFxuICAgICAgc2hpcHNbdHlwZV0gPSBuZXdTaGlwO1xuXG4gICAgICAvLyBJbml0aWFsaXNlIGhpdFBvc2l0aW9ucyBmb3IgdGhpcyBzaGlwIHR5cGUgYXMgYW4gZW1wdHkgYXJyYXlcbiAgICAgIGhpdFBvc2l0aW9uc1t0eXBlXSA9IFtdO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIHNoaXAgcGxhY2VtZW50LiBCb3VuZGFyeSBlcnJvciEgU2hpcCB0eXBlOiAke3R5cGV9YCxcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJlZ2lzdGVyIGFuIGF0dGFjayBhbmQgdGVzdCBmb3IgdmFsaWQgaGl0XG4gIGNvbnN0IGF0dGFjayA9IChwb3NpdGlvbikgPT4ge1xuICAgIGxldCByZXNwb25zZTtcblxuICAgIC8vIENoZWNrIGZvciB2YWxpZCBhdHRhY2tcbiAgICBpZiAoYXR0YWNrTG9nWzBdLmluY2x1ZGVzKHBvc2l0aW9uKSB8fCBhdHRhY2tMb2dbMV0uaW5jbHVkZXMocG9zaXRpb24pKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhgUmVwZWF0IGF0dGFjazogJHtwb3NpdGlvbn1gKTtcbiAgICAgIHRocm93IG5ldyBSZXBlYXRBdHRhY2tlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGhpdFxuICAgIGNvbnN0IGNoZWNrUmVzdWx0cyA9IGNoZWNrRm9ySGl0KHBvc2l0aW9uLCBzaGlwUG9zaXRpb25zKTtcbiAgICBpZiAoY2hlY2tSZXN1bHRzLmhpdCkge1xuICAgICAgLy8gUmVnaXN0ZXIgdmFsaWQgaGl0XG4gICAgICBoaXRQb3NpdGlvbnNbY2hlY2tSZXN1bHRzLnNoaXBUeXBlXS5wdXNoKHBvc2l0aW9uKTtcbiAgICAgIHNoaXBzW2NoZWNrUmVzdWx0cy5zaGlwVHlwZV0uaGl0KCk7XG5cbiAgICAgIC8vIExvZyB0aGUgYXR0YWNrIGFzIGEgdmFsaWQgaGl0XG4gICAgICBhdHRhY2tMb2dbMF0ucHVzaChwb3NpdGlvbik7XG4gICAgICByZXNwb25zZSA9IHsgLi4uY2hlY2tSZXN1bHRzIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGBNSVNTITogJHtwb3NpdGlvbn1gKTtcbiAgICAgIC8vIExvZyB0aGUgYXR0YWNrIGFzIGEgbWlzc1xuICAgICAgYXR0YWNrTG9nWzFdLnB1c2gocG9zaXRpb24pO1xuICAgICAgcmVzcG9uc2UgPSB7IC4uLmNoZWNrUmVzdWx0cyB9O1xuICAgIH1cblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfTtcblxuICBjb25zdCBpc1NoaXBTdW5rID0gKHR5cGUpID0+IHNoaXBzW3R5cGVdLmlzU3VuaztcblxuICBjb25zdCBjaGVja0FsbFNoaXBzU3VuayA9ICgpID0+XG4gICAgT2JqZWN0LmVudHJpZXMoc2hpcHMpLmV2ZXJ5KChbc2hpcFR5cGUsIHNoaXBdKSA9PiBzaGlwLmlzU3Vuayk7XG5cbiAgLy8gRnVuY3Rpb24gZm9yIHJlcG9ydGluZyB0aGUgbnVtYmVyIG9mIHNoaXBzIGxlZnQgYWZsb2F0XG4gIGNvbnN0IHNoaXBSZXBvcnQgPSAoKSA9PiB7XG4gICAgY29uc3QgZmxvYXRpbmdTaGlwcyA9IE9iamVjdC5lbnRyaWVzKHNoaXBzKVxuICAgICAgLmZpbHRlcigoW3NoaXBUeXBlLCBzaGlwXSkgPT4gIXNoaXAuaXNTdW5rKVxuICAgICAgLm1hcCgoW3NoaXBUeXBlLCBfXSkgPT4gc2hpcFR5cGUpO1xuXG4gICAgcmV0dXJuIFtmbG9hdGluZ1NoaXBzLmxlbmd0aCwgZmxvYXRpbmdTaGlwc107XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBnZXQgZ3JpZCgpIHtcbiAgICAgIHJldHVybiBncmlkO1xuICAgIH0sXG4gICAgZ2V0IHNoaXBzKCkge1xuICAgICAgcmV0dXJuIHNoaXBzO1xuICAgIH0sXG4gICAgZ2V0IGF0dGFja0xvZygpIHtcbiAgICAgIHJldHVybiBhdHRhY2tMb2c7XG4gICAgfSxcbiAgICBnZXRTaGlwOiAoc2hpcFR5cGUpID0+IHNoaXBzW3NoaXBUeXBlXSxcbiAgICBnZXRTaGlwUG9zaXRpb25zOiAoc2hpcFR5cGUpID0+IHNoaXBQb3NpdGlvbnNbc2hpcFR5cGVdLFxuICAgIGdldEhpdFBvc2l0aW9uczogKHNoaXBUeXBlKSA9PiBoaXRQb3NpdGlvbnNbc2hpcFR5cGVdLFxuICAgIHBsYWNlU2hpcCxcbiAgICBhdHRhY2ssXG4gICAgaXNTaGlwU3VuayxcbiAgICBjaGVja0FsbFNoaXBzU3VuayxcbiAgICBzaGlwUmVwb3J0LFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgR2FtZWJvYXJkO1xuIiwiaW1wb3J0IHtcbiAgSW52YWxpZFBsYXllclR5cGVFcnJvcixcbiAgSW52YWxpZE1vdmVFbnRyeUVycm9yLFxuICBSZXBlYXRBdHRhY2tlZEVycm9yLFxuICBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvcixcbiAgT3ZlcmxhcHBpbmdTaGlwc0Vycm9yLFxufSBmcm9tIFwiLi9lcnJvcnNcIjtcblxuY29uc3QgY2hlY2tNb3ZlID0gKG1vdmUsIGdiR3JpZCkgPT4ge1xuICBsZXQgdmFsaWQgPSBmYWxzZTtcblxuICBnYkdyaWQuZm9yRWFjaCgoZWwpID0+IHtcbiAgICBpZiAoZWwuZmluZCgocCkgPT4gcCA9PT0gbW92ZSkpIHtcbiAgICAgIHZhbGlkID0gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB2YWxpZDtcbn07XG5cbmNvbnN0IHJhbmRNb3ZlID0gKGdyaWQsIG1vdmVMb2cpID0+IHtcbiAgLy8gRmxhdHRlbiB0aGUgZ3JpZCBpbnRvIGEgc2luZ2xlIGFycmF5IG9mIG1vdmVzXG4gIGNvbnN0IGFsbE1vdmVzID0gZ3JpZC5mbGF0TWFwKChyb3cpID0+IHJvdyk7XG5cbiAgLy8gRmlsdGVyIG91dCB0aGUgbW92ZXMgdGhhdCBhcmUgYWxyZWFkeSBpbiB0aGUgbW92ZUxvZ1xuICBjb25zdCBwb3NzaWJsZU1vdmVzID0gYWxsTW92ZXMuZmlsdGVyKChtb3ZlKSA9PiAhbW92ZUxvZy5pbmNsdWRlcyhtb3ZlKSk7XG5cbiAgLy8gU2VsZWN0IGEgcmFuZG9tIG1vdmUgZnJvbSB0aGUgcG9zc2libGUgbW92ZXNcbiAgY29uc3QgcmFuZG9tTW92ZSA9XG4gICAgcG9zc2libGVNb3Zlc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwb3NzaWJsZU1vdmVzLmxlbmd0aCldO1xuXG4gIHJldHVybiByYW5kb21Nb3ZlO1xufTtcblxuY29uc3QgZ2VuZXJhdGVSYW5kb21TdGFydCA9IChzaXplLCBkaXJlY3Rpb24sIGdyaWQpID0+IHtcbiAgY29uc3QgdmFsaWRTdGFydHMgPSBbXTtcblxuICBpZiAoZGlyZWN0aW9uID09PSBcImhcIikge1xuICAgIC8vIEZvciBob3Jpem9udGFsIG9yaWVudGF0aW9uLCBsaW1pdCB0aGUgY29sdW1uc1xuICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IGdyaWQubGVuZ3RoIC0gc2l6ZSArIDE7IGNvbCsrKSB7XG4gICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBncmlkW2NvbF0ubGVuZ3RoOyByb3crKykge1xuICAgICAgICB2YWxpZFN0YXJ0cy5wdXNoKGdyaWRbY29sXVtyb3ddKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gRm9yIHZlcnRpY2FsIG9yaWVudGF0aW9uLCBsaW1pdCB0aGUgcm93c1xuICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IGdyaWRbMF0ubGVuZ3RoIC0gc2l6ZSArIDE7IHJvdysrKSB7XG4gICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCBncmlkLmxlbmd0aDsgY29sKyspIHtcbiAgICAgICAgdmFsaWRTdGFydHMucHVzaChncmlkW2NvbF1bcm93XSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gUmFuZG9tbHkgc2VsZWN0IGEgc3RhcnRpbmcgcG9zaXRpb25cbiAgY29uc3QgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB2YWxpZFN0YXJ0cy5sZW5ndGgpO1xuICByZXR1cm4gdmFsaWRTdGFydHNbcmFuZG9tSW5kZXhdO1xufTtcblxuY29uc3QgYXV0b1BsYWNlbWVudCA9IChnYW1lYm9hcmQpID0+IHtcbiAgY29uc3Qgc2hpcFR5cGVzID0gW1xuICAgIHsgdHlwZTogXCJjYXJyaWVyXCIsIHNpemU6IDUgfSxcbiAgICB7IHR5cGU6IFwiYmF0dGxlc2hpcFwiLCBzaXplOiA0IH0sXG4gICAgeyB0eXBlOiBcImNydWlzZXJcIiwgc2l6ZTogMyB9LFxuICAgIHsgdHlwZTogXCJzdWJtYXJpbmVcIiwgc2l6ZTogMyB9LFxuICAgIHsgdHlwZTogXCJkZXN0cm95ZXJcIiwgc2l6ZTogMiB9LFxuICBdO1xuXG4gIHNoaXBUeXBlcy5mb3JFYWNoKChzaGlwKSA9PiB7XG4gICAgbGV0IHBsYWNlZCA9IGZhbHNlO1xuICAgIHdoaWxlICghcGxhY2VkKSB7XG4gICAgICBjb25zdCBkaXJlY3Rpb24gPSBNYXRoLnJhbmRvbSgpIDwgMC41ID8gXCJoXCIgOiBcInZcIjtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gZ2VuZXJhdGVSYW5kb21TdGFydChzaGlwLnNpemUsIGRpcmVjdGlvbiwgZ2FtZWJvYXJkLmdyaWQpO1xuXG4gICAgICB0cnkge1xuICAgICAgICBnYW1lYm9hcmQucGxhY2VTaGlwKHNoaXAudHlwZSwgc3RhcnQsIGRpcmVjdGlvbik7XG4gICAgICAgIHBsYWNlZCA9IHRydWU7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgIShlcnJvciBpbnN0YW5jZW9mIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yKSAmJlxuICAgICAgICAgICEoZXJyb3IgaW5zdGFuY2VvZiBPdmVybGFwcGluZ1NoaXBzRXJyb3IpXG4gICAgICAgICkge1xuICAgICAgICAgIHRocm93IGVycm9yOyAvLyBSZXRocm93IG5vbi1wbGFjZW1lbnQgZXJyb3JzXG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgcGxhY2VtZW50IGZhaWxzLCBjYXRjaCB0aGUgZXJyb3IgYW5kIHRyeSBhZ2FpblxuICAgICAgfVxuICAgIH1cbiAgfSk7XG59O1xuXG5jb25zdCBQbGF5ZXIgPSAoZ2FtZWJvYXJkLCB0eXBlKSA9PiB7XG4gIGNvbnN0IG1vdmVMb2cgPSBbXTtcblxuICBjb25zdCBwbGFjZVNoaXBzID0gKHNoaXBUeXBlLCBzdGFydCwgZGlyZWN0aW9uKSA9PiB7XG4gICAgaWYgKHR5cGUgPT09IFwiaHVtYW5cIikge1xuICAgICAgZ2FtZWJvYXJkLnBsYWNlU2hpcChzaGlwVHlwZSwgc3RhcnQsIGRpcmVjdGlvbik7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImNvbXB1dGVyXCIpIHtcbiAgICAgIGF1dG9QbGFjZW1lbnQoZ2FtZWJvYXJkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQbGF5ZXJUeXBlRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIHBsYXllciB0eXBlLiBWYWxpZCBwbGF5ZXIgdHlwZXM6IFwiaHVtYW5cIiAmIFwiY29tcHV0ZXJcIi4gRW50ZXJlZDogJHt0eXBlfS5gLFxuICAgICAgKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgbWFrZU1vdmUgPSAob3BwR2FtZWJvYXJkLCBpbnB1dCkgPT4ge1xuICAgIGxldCBtb3ZlO1xuXG4gICAgLy8gQ2hlY2sgZm9yIHRoZSB0eXBlIG9mIHBsYXllclxuICAgIGlmICh0eXBlID09PSBcImh1bWFuXCIpIHtcbiAgICAgIC8vIEZvcm1hdCB0aGUgaW5wdXRcbiAgICAgIG1vdmUgPSBgJHtpbnB1dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKX0ke2lucHV0LnN1YnN0cmluZygxKX1gO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJjb21wdXRlclwiKSB7XG4gICAgICBtb3ZlID0gcmFuZE1vdmUob3BwR2FtZWJvYXJkLmdyaWQsIG1vdmVMb2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBsYXllclR5cGVFcnJvcihcbiAgICAgICAgYEludmFsaWQgcGxheWVyIHR5cGUuIFZhbGlkIHBsYXllciB0eXBlczogXCJodW1hblwiICYgXCJjb21wdXRlclwiLiBFbnRlcmVkOiAke3R5cGV9LmAsXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHRoZSBpbnB1dCBhZ2FpbnN0IHRoZSBwb3NzaWJsZSBtb3ZlcyBvbiB0aGUgZ2FtZWJvYXJkJ3MgZ3JpZFxuICAgIGlmICghY2hlY2tNb3ZlKG1vdmUsIG9wcEdhbWVib2FyZC5ncmlkKSkge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRNb3ZlRW50cnlFcnJvcihgSW52YWxpZCBtb3ZlIGVudHJ5ISBNb3ZlOiAke21vdmV9LmApO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBtb3ZlIGV4aXN0cyBpbiB0aGUgbW92ZUxvZyBhcnJheSwgdGhyb3cgYW4gZXJyb3JcbiAgICBpZiAobW92ZUxvZy5maW5kKChlbCkgPT4gZWwgPT09IG1vdmUpKSB7XG4gICAgICB0aHJvdyBuZXcgUmVwZWF0QXR0YWNrZWRFcnJvcigpO1xuICAgIH1cblxuICAgIC8vIEVsc2UsIGNhbGwgYXR0YWNrIG1ldGhvZCBvbiBnYW1lYm9hcmQgYW5kIGxvZyBtb3ZlIGluIG1vdmVMb2dcbiAgICBjb25zdCByZXNwb25zZSA9IG9wcEdhbWVib2FyZC5hdHRhY2sobW92ZSk7XG4gICAgbW92ZUxvZy5wdXNoKG1vdmUpO1xuICAgIC8vIFJldHVybiB0aGUgcmVzcG9uc2Ugb2YgdGhlIGF0dGFjayAob2JqZWN0OiB7IGhpdDogZmFsc2UgfSBmb3IgbWlzczsgeyBoaXQ6IHRydWUsIHNoaXBUeXBlOiBzdHJpbmcgfSBmb3IgaGl0KS5cbiAgICByZXR1cm4geyBwbGF5ZXI6IHR5cGUsIC4uLnJlc3BvbnNlIH07XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBnZXQgdHlwZSgpIHtcbiAgICAgIHJldHVybiB0eXBlO1xuICAgIH0sXG4gICAgZ2V0IGdhbWVib2FyZCgpIHtcbiAgICAgIHJldHVybiBnYW1lYm9hcmQ7XG4gICAgfSxcbiAgICBnZXQgbW92ZUxvZygpIHtcbiAgICAgIHJldHVybiBtb3ZlTG9nO1xuICAgIH0sXG4gICAgbWFrZU1vdmUsXG4gICAgcGxhY2VTaGlwcyxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXllcjtcbiIsImltcG9ydCB7IEludmFsaWRTaGlwVHlwZUVycm9yIH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5cbmNvbnN0IFNoaXAgPSAodHlwZSkgPT4ge1xuICBjb25zdCBzZXRMZW5ndGggPSAoKSA9PiB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIFwiY2FycmllclwiOlxuICAgICAgICByZXR1cm4gNTtcbiAgICAgIGNhc2UgXCJiYXR0bGVzaGlwXCI6XG4gICAgICAgIHJldHVybiA0O1xuICAgICAgY2FzZSBcImNydWlzZXJcIjpcbiAgICAgIGNhc2UgXCJzdWJtYXJpbmVcIjpcbiAgICAgICAgcmV0dXJuIDM7XG4gICAgICBjYXNlIFwiZGVzdHJveWVyXCI6XG4gICAgICAgIHJldHVybiAyO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEludmFsaWRTaGlwVHlwZUVycm9yKCk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHNoaXBMZW5ndGggPSBzZXRMZW5ndGgoKTtcblxuICBsZXQgaGl0cyA9IDA7XG5cbiAgY29uc3QgaGl0ID0gKCkgPT4ge1xuICAgIGlmIChoaXRzIDwgc2hpcExlbmd0aCkge1xuICAgICAgaGl0cyArPSAxO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldCB0eXBlKCkge1xuICAgICAgcmV0dXJuIHR5cGU7XG4gICAgfSxcbiAgICBnZXQgc2hpcExlbmd0aCgpIHtcbiAgICAgIHJldHVybiBzaGlwTGVuZ3RoO1xuICAgIH0sXG4gICAgZ2V0IGhpdHMoKSB7XG4gICAgICByZXR1cm4gaGl0cztcbiAgICB9LFxuICAgIGdldCBpc1N1bmsoKSB7XG4gICAgICByZXR1cm4gaGl0cyA9PT0gc2hpcExlbmd0aDtcbiAgICB9LFxuICAgIGhpdCxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFNoaXA7XG4iLCIvLyBGdW5jdGlvbiBmb3IgYnVpbGRpbmcgYSBzaGlwLCBkZXBlbmRpbmcgb24gdGhlIHNoaXAgdHlwZVxuY29uc3QgYnVpbGRTaGlwID0gKG9iaiwgZG9tU2VsLCBzaGlwUG9zaXRpb25zKSA9PiB7XG4gIC8vIEV4dHJhY3QgdGhlIHNoaXAncyB0eXBlIGFuZCBsZW5ndGggZnJvbSB0aGUgb2JqZWN0XG4gIGNvbnN0IHsgdHlwZSwgc2hpcExlbmd0aDogbGVuZ3RoIH0gPSBvYmo7XG4gIC8vIENyZWF0ZSBhbmQgYXJyYXkgZm9yIHRoZSBzaGlwJ3Mgc2VjdGlvbnNcbiAgY29uc3Qgc2hpcFNlY3RzID0gW107XG5cbiAgLy8gVXNlIHRoZSBsZW5ndGggb2YgdGhlIHNoaXAgdG8gY3JlYXRlIHRoZSBjb3JyZWN0IG51bWJlciBvZiBzZWN0aW9uc1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgLy8gR2V0IGEgcG9zaXRpb24gZnJvbSB0aGUgYXJyYXlcbiAgICBjb25zdCBwb3NpdGlvbiA9IHNoaXBQb3NpdGlvbnNbaV07XG4gICAgLy8gQ3JlYXRlIGFuIGVsZW1lbnQgZm9yIHRoZSBzZWN0aW9uXG4gICAgY29uc3Qgc2VjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgc2VjdC5jbGFzc05hbWUgPSBcInctNCBoLTQgcm91bmRlZC1mdWxsIGJnLWdyYXktODAwXCI7IC8vIFNldCB0aGUgZGVmYXVsdCBzdHlsaW5nIGZvciB0aGUgc2VjdGlvbiBlbGVtZW50XG4gICAgLy8gU2V0IGEgdW5pcXVlIGlkIGZvciB0aGUgc2hpcCBzZWN0aW9uXG4gICAgc2VjdC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgRE9NLSR7ZG9tU2VsfS1zaGlwVHlwZS0ke3R5cGV9LXBvcy0ke3Bvc2l0aW9ufWApO1xuICAgIC8vIFNldCBhIGRhdGFzZXQgcHJvcGVydHkgb2YgXCJwb3NpdGlvblwiIGZvciB0aGUgc2VjdGlvblxuICAgIHNlY3QuZGF0YXNldC5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHNoaXBTZWN0cy5wdXNoKHNlY3QpOyAvLyBBZGQgdGhlIHNlY3Rpb24gdG8gdGhlIGFycmF5XG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIGFycmF5IG9mIHNoaXAgc2VjdGlvbnNcbiAgcmV0dXJuIHNoaXBTZWN0cztcbn07XG5cbmNvbnN0IFVpTWFuYWdlciA9ICgpID0+IHtcbiAgY29uc3QgY3JlYXRlR2FtZWJvYXJkID0gKGNvbnRhaW5lcklEKSA9PiB7XG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVySUQpO1xuXG4gICAgLy8gU2V0IHBsYXllciB0eXBlIGRlcGVuZGluZyBvbiB0aGUgY29udGFpbmVySURcbiAgICBjb25zdCB7IHBsYXllciB9ID0gY29udGFpbmVyLmRhdGFzZXQ7XG5cbiAgICAvLyBDcmVhdGUgdGhlIGdyaWQgY29udGFpbmVyXG4gICAgY29uc3QgZ3JpZERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZ3JpZERpdi5jbGFzc05hbWUgPVxuICAgICAgXCJnYW1lYm9hcmQtYXJlYSBncmlkIGdyaWQtY29scy0xMSBhdXRvLXJvd3MtbWluIGdhcC0xIHAtNlwiO1xuICAgIGdyaWREaXYuZGF0YXNldC5wbGF5ZXIgPSBwbGF5ZXI7XG5cbiAgICAvLyBBZGQgdGhlIHRvcC1sZWZ0IGNvcm5lciBlbXB0eSBjZWxsXG4gICAgZ3JpZERpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpKTtcblxuICAgIC8vIEFkZCBjb2x1bW4gaGVhZGVycyBBLUpcbiAgICBjb25zdCBjb2x1bW5zID0gXCJBQkNERUZHSElKXCI7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2x1bW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgaGVhZGVyLmNsYXNzTmFtZSA9IFwidGV4dC1jZW50ZXJcIjtcbiAgICAgIGhlYWRlci50ZXh0Q29udGVudCA9IGNvbHVtbnNbaV07XG4gICAgICBncmlkRGl2LmFwcGVuZENoaWxkKGhlYWRlcik7XG4gICAgfVxuXG4gICAgLy8gQWRkIHJvdyBsYWJlbHMgYW5kIGNlbGxzXG4gICAgZm9yIChsZXQgcm93ID0gMTsgcm93IDw9IDEwOyByb3crKykge1xuICAgICAgLy8gUm93IGxhYmVsXG4gICAgICBjb25zdCByb3dMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICByb3dMYWJlbC5jbGFzc05hbWUgPSBcInRleHQtY2VudGVyXCI7XG4gICAgICByb3dMYWJlbC50ZXh0Q29udGVudCA9IHJvdztcbiAgICAgIGdyaWREaXYuYXBwZW5kQ2hpbGQocm93TGFiZWwpO1xuXG4gICAgICAvLyBDZWxscyBmb3IgZWFjaCByb3dcbiAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IDEwOyBjb2wrKykge1xuICAgICAgICBjb25zdCBjZWxsSWQgPSBgJHtjb2x1bW5zW2NvbF19JHtyb3d9YDsgLy8gU2V0IHRoZSBjZWxsSWRcbiAgICAgICAgY29uc3QgY2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNlbGwuaWQgPSBgJHtwbGF5ZXJ9LSR7Y2VsbElkfWA7IC8vIFNldCB0aGUgZWxlbWVudCBpZFxuICAgICAgICBjZWxsLmNsYXNzTmFtZSA9XG4gICAgICAgICAgXCJ3LTYgaC02IGJnLWdyYXktMjAwIGZsZXgganVzdGlmeS1jZW50ZXIgaXRlbXMtY2VudGVyIGN1cnNvci1wb2ludGVyIGhvdmVyOmJnLW9yYW5nZS01MDBcIjsgLy8gQWRkIG1vcmUgY2xhc3NlcyBhcyBuZWVkZWQgZm9yIHN0eWxpbmdcbiAgICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKFwiZ2FtZWJvYXJkLWNlbGxcIik7IC8vIEFkZCBhIGNsYXNzIG5hbWUgdG8gZWFjaCBjZWxsIHRvIGFjdCBhcyBhIHNlbGVjdG9yXG4gICAgICAgIGNlbGwuZGF0YXNldC5wb3NpdGlvbiA9IGNlbGxJZDsgLy8gQXNzaWduIHBvc2l0aW9uIGRhdGEgYXR0cmlidXRlIGZvciBpZGVudGlmaWNhdGlvblxuICAgICAgICBjZWxsLmRhdGFzZXQucGxheWVyID0gcGxheWVyOyAvLyBBc3NpZ24gcGxheWVyIGRhdGEgYXR0cmlidXRlIGZvciBpZGVudGlmaWNhdGlvblxuXG4gICAgICAgIGdyaWREaXYuYXBwZW5kQ2hpbGQoY2VsbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQXBwZW5kIHRoZSBncmlkIHRvIHRoZSBjb250YWluZXJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZ3JpZERpdik7XG4gIH07XG5cbiAgY29uc3QgaW5pdENvbnNvbGVVSSA9ICgpID0+IHtcbiAgICBjb25zdCBjb25zb2xlQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlXCIpOyAvLyBHZXQgdGhlIGNvbnNvbGUgY29udGFpbmVyIGZyb20gdGhlIERPTVxuICAgIGNvbnNvbGVDb250YWluZXIuY2xhc3NMaXN0LmFkZChcbiAgICAgIFwiZmxleFwiLFxuICAgICAgXCJmbGV4LWNvbFwiLFxuICAgICAgXCJqdXN0aWZ5LWJldHdlZW5cIixcbiAgICAgIFwidGV4dC1zbVwiLFxuICAgICk7IC8vIFNldCBmbGV4Ym94IHJ1bGVzIGZvciBjb250YWluZXJcblxuICAgIC8vIENyZWF0ZSBhIGNvbnRhaW5lciBmb3IgdGhlIGlucHV0IGFuZCBidXR0b24gZWxlbWVudHNcbiAgICBjb25zdCBpbnB1dERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgaW5wdXREaXYuY2xhc3NOYW1lID0gXCJmbGV4IGZsZXgtcm93IHctZnVsbCBoLTEvNSBqdXN0aWZ5LWJldHdlZW5cIjsgLy8gU2V0IHRoZSBmbGV4Ym94IHJ1bGVzIGZvciB0aGUgY29udGFpbmVyXG5cbiAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTsgLy8gQ3JlYXRlIGFuIGlucHV0IGVsZW1lbnQgZm9yIHRoZSBjb25zb2xlXG4gICAgaW5wdXQudHlwZSA9IFwidGV4dFwiOyAvLyBTZXQgdGhlIGlucHV0IHR5cGUgb2YgdGhpcyBlbGVtZW50IHRvIHRleHRcbiAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNvbnNvbGUtaW5wdXRcIik7IC8vIFNldCB0aGUgaWQgZm9yIHRoaXMgZWxlbWVudCB0byBcImNvbnNvbGUtaW5wdXRcIlxuICAgIGlucHV0LmNsYXNzTmFtZSA9IFwicC0xIGJnLWdyYXktNDAwIGZsZXgtMVwiOyAvLyBBZGQgVGFpbHdpbmRDU1MgY2xhc3Nlc1xuICAgIGNvbnN0IHN1Ym1pdEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7IC8vIENyZWF0ZSBhIGJ1dHRvbiBlbGVtZW50IGZvciB0aGUgY29uc29sZSBzdWJtaXRcbiAgICBzdWJtaXRCdXR0b24udGV4dENvbnRlbnQgPSBcIlN1Ym1pdFwiOyAvLyBBZGQgdGhlIHRleHQgXCJTdWJtaXRcIiB0byB0aGUgYnV0dG9uXG4gICAgc3VibWl0QnV0dG9uLnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY29uc29sZS1zdWJtaXRcIik7IC8vIFNldCB0aGUgaWQgZm9yIHRoZSBidXR0b25cbiAgICBzdWJtaXRCdXR0b24uY2xhc3NOYW1lID0gXCJweC0zIHB5LTEgYmctZ3JheS04MDAgdGV4dC1jZW50ZXIgdGV4dC1zbVwiOyAvLyBBZGQgVGFpbHdpbmRDU1MgY2xhc3Nlc1xuICAgIGNvbnN0IG91dHB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7IC8vIENyZWF0ZSBhbiBkaXYgZWxlbWVudCBmb3IgdGhlIG91dHB1dCBvZiB0aGUgY29uc29sZVxuICAgIG91dHB1dC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNvbnNvbGUtb3V0cHV0XCIpOyAvLyBTZXQgdGhlIGlkIGZvciB0aGUgb3V0cHV0IGVsZW1lbnRcbiAgICBvdXRwdXQuY2xhc3NOYW1lID0gXCJwLTEgYmctZ3JheS0yMDAgZmxleC0xIGgtNC81IG92ZXJmbG93LWF1dG9cIjsgLy8gQWRkIFRhaWx3aW5kQ1NTIGNsYXNzZXNcblxuICAgIC8vIEFkZCB0aGUgaW5wdXQgZWxlbWVudHMgdG8gdGhlIGlucHV0IGNvbnRhaW5lclxuICAgIGlucHV0RGl2LmFwcGVuZENoaWxkKGlucHV0KTtcbiAgICBpbnB1dERpdi5hcHBlbmRDaGlsZChzdWJtaXRCdXR0b24pO1xuXG4gICAgLy8gQXBwZW5kIGVsZW1lbnRzIHRvIHRoZSBjb25zb2xlIGNvbnRhaW5lclxuICAgIGNvbnNvbGVDb250YWluZXIuYXBwZW5kQ2hpbGQob3V0cHV0KTtcbiAgICBjb25zb2xlQ29udGFpbmVyLmFwcGVuZENoaWxkKGlucHV0RGl2KTtcbiAgfTtcblxuICBjb25zdCBkaXNwbGF5UHJvbXB0ID0gKHByb21wdE9ianMpID0+IHtcbiAgICAvLyBHZXQgdGhlIHByb21wdCBkaXNwbGF5XG4gICAgY29uc3QgZGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJvbXB0LWRpc3BsYXlcIik7XG5cbiAgICAvLyBDbGVhciB0aGUgZGlzcGxheSBvZiBhbGwgY2hpbGRyZW5cbiAgICB3aGlsZSAoZGlzcGxheS5maXJzdENoaWxkKSB7XG4gICAgICBkaXNwbGF5LnJlbW92ZUNoaWxkKGRpc3BsYXkuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgLy8gSXRlcmF0ZSBvdmVyIGVhY2ggcHJvbXB0IGluIHRoZSBwcm9tcHRzIG9iamVjdFxuICAgIE9iamVjdC5lbnRyaWVzKHByb21wdE9ianMpLmZvckVhY2goKFtrZXksIHsgcHJvbXB0LCBwcm9tcHRUeXBlIH1dKSA9PiB7XG4gICAgICAvLyBDcmVhdGUgYSBuZXcgZGl2IGZvciBlYWNoIHByb21wdFxuICAgICAgY29uc3QgcHJvbXB0RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIHByb21wdERpdi50ZXh0Q29udGVudCA9IHByb21wdDtcblxuICAgICAgLy8gQXBwbHkgc3R5bGluZyBiYXNlZCBvbiBwcm9tcHRUeXBlXG4gICAgICBzd2l0Y2ggKHByb21wdFR5cGUpIHtcbiAgICAgICAgY2FzZSBcImluc3RydWN0aW9uXCI6XG4gICAgICAgICAgcHJvbXB0RGl2LmNsYXNzTGlzdC5hZGQoXCJ0ZXh0LWxpbWUtNjAwXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZ3VpZGVcIjpcbiAgICAgICAgICBwcm9tcHREaXYuY2xhc3NMaXN0LmFkZChcInRleHQtb3JhbmdlLTUwMFwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImVycm9yXCI6XG4gICAgICAgICAgcHJvbXB0RGl2LmNsYXNzTGlzdC5hZGQoXCJ0ZXh0LXJlZC01MDBcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcHJvbXB0RGl2LmNsYXNzTGlzdC5hZGQoXCJ0ZXh0LWdyYXktODAwXCIpOyAvLyBEZWZhdWx0IHRleHQgY29sb3JcbiAgICAgIH1cblxuICAgICAgLy8gQXBwZW5kIHRoZSBuZXcgZGl2IHRvIHRoZSBkaXNwbGF5IGNvbnRhaW5lclxuICAgICAgZGlzcGxheS5hcHBlbmRDaGlsZChwcm9tcHREaXYpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEZ1bmN0aW9uIGZvciByZW5kZXJpbmcgc2hpcHMgdG8gdGhlIFNoaXAgU3RhdHVzIGRpc3BsYXkgc2VjdGlvblxuICBjb25zdCByZW5kZXJTaGlwRGlzcCA9IChwbGF5ZXJPYmosIHNoaXBUeXBlKSA9PiB7XG4gICAgbGV0IGlkU2VsO1xuXG4gICAgLy8gU2V0IHRoZSBjb3JyZWN0IGlkIHNlbGVjdG9yIGZvciB0aGUgdHlwZSBvZiBwbGF5ZXJcbiAgICBpZiAocGxheWVyT2JqLnR5cGUgPT09IFwiaHVtYW5cIikge1xuICAgICAgaWRTZWwgPSBcImh1bWFuLWRpc3BsYXlcIjtcbiAgICB9IGVsc2UgaWYgKHBsYXllck9iai50eXBlID09PSBcImNvbXB1dGVyXCIpIHtcbiAgICAgIGlkU2VsID0gXCJjb21wLWRpc3BsYXlcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgRXJyb3I7XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSBjb3JyZWN0IERPTSBlbGVtZW50XG4gICAgY29uc3QgZGlzcERpdiA9IGRvY3VtZW50XG4gICAgICAuZ2V0RWxlbWVudEJ5SWQoaWRTZWwpXG4gICAgICAucXVlcnlTZWxlY3RvcihcIi5zaGlwcy1jb250YWluZXJcIik7XG5cbiAgICAvLyBHZXQgdGhlIHNoaXAgZnJvbSB0aGUgcGxheWVyXG4gICAgY29uc3Qgc2hpcCA9IHBsYXllck9iai5nYW1lYm9hcmQuZ2V0U2hpcChzaGlwVHlwZSk7XG5cbiAgICAvLyBDcmVhdGUgYSBkaXYgZm9yIHRoZSBzaGlwXG4gICAgY29uc3Qgc2hpcERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgc2hpcERpdi5jbGFzc05hbWUgPSBcInB4LTQgcHktMiBmbGV4IGZsZXgtY29sIGdhcC0xXCI7XG5cbiAgICAvLyBBZGQgYSB0aXRsZSB0aGUgdGhlIGRpdlxuICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImgyXCIpO1xuICAgIHRpdGxlLnRleHRDb250ZW50ID0gc2hpcFR5cGU7IC8vIFNldCB0aGUgdGl0bGUgdG8gdGhlIHNoaXAgdHlwZVxuICAgIHNoaXBEaXYuYXBwZW5kQ2hpbGQodGl0bGUpO1xuXG4gICAgLy8gR2V0IHRoZSBzaGlwIHBvc2l0aW9ucyBhcnJheVxuICAgIGNvbnN0IHNoaXBQb3NpdGlvbnMgPSBwbGF5ZXJPYmouZ2FtZWJvYXJkLmdldFNoaXBQb3NpdGlvbnMoc2hpcFR5cGUpO1xuXG4gICAgLy8gQnVpbGQgdGhlIHNoaXAgc2VjdGlvbnNcbiAgICBjb25zdCBzaGlwU2VjdHMgPSBidWlsZFNoaXAoc2hpcCwgaWRTZWwsIHNoaXBQb3NpdGlvbnMpO1xuXG4gICAgLy8gQWRkIHRoZSBzaGlwIHNlY3Rpb25zIHRvIHRoZSBkaXZcbiAgICBjb25zdCBzZWN0c0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgc2VjdHNEaXYuY2xhc3NOYW1lID0gXCJmbGV4IGZsZXgtcm93IGdhcC0xXCI7XG4gICAgc2hpcFNlY3RzLmZvckVhY2goKHNlY3QpID0+IHtcbiAgICAgIHNlY3RzRGl2LmFwcGVuZENoaWxkKHNlY3QpO1xuICAgIH0pO1xuICAgIHNoaXBEaXYuYXBwZW5kQ2hpbGQoc2VjdHNEaXYpO1xuXG4gICAgZGlzcERpdi5hcHBlbmRDaGlsZChzaGlwRGl2KTtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiBmb3IgciBzaGlwcyBvbiB0aGUgZ2FtZWJvYXJkXG4gIGNvbnN0IHJlbmRlclNoaXBCb2FyZCA9IChwbGF5ZXJPYmosIHNoaXBUeXBlKSA9PiB7XG4gICAgbGV0IGlkU2VsO1xuXG4gICAgLy8gU2V0IHRoZSBjb3JyZWN0IGlkIHNlbGVjdG9yIGZvciB0aGUgdHlwZSBvZiBwbGF5ZXJcbiAgICBpZiAocGxheWVyT2JqLnR5cGUgPT09IFwiaHVtYW5cIikge1xuICAgICAgaWRTZWwgPSBcImh1bWFuLWJvYXJkXCI7XG4gICAgfSBlbHNlIGlmIChwbGF5ZXJPYmoudHlwZSA9PT0gXCJjb21wdXRlclwiKSB7XG4gICAgICBpZFNlbCA9IFwiY29tcC1ib2FyZFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcihcIk5vIG1hdGNoaW5nIHBsYXllciB0eXBlIGluICdyZW5kZXJTaGlwQm9hcmQnIGZ1bmN0aW9uXCIpO1xuICAgIH1cblxuICAgIC8vIEdldCB0aGUgcGxheWVyJ3MgdHlwZSBhbmQgZ2FtZWJvYXJkXG4gICAgY29uc3QgeyB0eXBlOiBwbGF5ZXJUeXBlLCBnYW1lYm9hcmQgfSA9IHBsYXllck9iajtcblxuICAgIC8vIEdldCB0aGUgc2hpcCBhbmQgdGhlIHNoaXAgcG9zaXRpb25zXG4gICAgY29uc3Qgc2hpcE9iaiA9IGdhbWVib2FyZC5nZXRTaGlwKHNoaXBUeXBlKTtcbiAgICBjb25zdCBzaGlwUG9zaXRpb25zID0gZ2FtZWJvYXJkLmdldFNoaXBQb3NpdGlvbnMoc2hpcFR5cGUpO1xuXG4gICAgLy8gQnVpbGQgdGhlIHNoaXAgc2VjdGlvbnNcbiAgICBjb25zdCBzaGlwU2VjdHMgPSBidWlsZFNoaXAoc2hpcE9iaiwgaWRTZWwsIHNoaXBQb3NpdGlvbnMpO1xuXG4gICAgLy8gTWF0Y2ggdGhlIGNlbGwgcG9zaXRpb25zIHdpdGggdGhlIHNoaXAgc2VjdGlvbnMgYW5kIHBsYWNlIGVhY2hcbiAgICAvLyBzaGlwIHNlY3Rpb24gaW4gdGhlIGNvcnJlc3BvbmRpbmcgY2VsbCBlbGVtZW50XG4gICAgc2hpcFBvc2l0aW9ucy5mb3JFYWNoKChwb3NpdGlvbikgPT4ge1xuICAgICAgY29uc3QgY2VsbEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtwbGF5ZXJUeXBlfS0ke3Bvc2l0aW9ufWApO1xuICAgICAgLy8gRmluZCB0aGUgc2hpcCBzZWN0aW9uIGVsZW1lbnQgdGhhdCBtYXRjaGVzIHRoZSBjdXJyZW50IHBvc2l0aW9uXG4gICAgICBjb25zdCBzaGlwU2VjdCA9IHNoaXBTZWN0cy5maW5kKFxuICAgICAgICAoc2VjdGlvbikgPT4gc2VjdGlvbi5kYXRhc2V0LnBvc2l0aW9uID09PSBwb3NpdGlvbixcbiAgICAgICk7XG5cbiAgICAgIGlmIChjZWxsRWxlbWVudCAmJiBzaGlwU2VjdCkge1xuICAgICAgICAvLyBQbGFjZSB0aGUgc2hpcCBzZWN0aW9uIGluIHRoZSBjZWxsXG4gICAgICAgIGNlbGxFbGVtZW50LmFwcGVuZENoaWxkKHNoaXBTZWN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGNyZWF0ZUdhbWVib2FyZCxcbiAgICBpbml0Q29uc29sZVVJLFxuICAgIGRpc3BsYXlQcm9tcHQsXG4gICAgcmVuZGVyU2hpcERpc3AsXG4gICAgcmVuZGVyU2hpcEJvYXJkLFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgVWlNYW5hZ2VyO1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgYC8qXG4hIHRhaWx3aW5kY3NzIHYzLjQuMSB8IE1JVCBMaWNlbnNlIHwgaHR0cHM6Ly90YWlsd2luZGNzcy5jb21cbiovLypcbjEuIFByZXZlbnQgcGFkZGluZyBhbmQgYm9yZGVyIGZyb20gYWZmZWN0aW5nIGVsZW1lbnQgd2lkdGguIChodHRwczovL2dpdGh1Yi5jb20vbW96ZGV2cy9jc3NyZW1lZHkvaXNzdWVzLzQpXG4yLiBBbGxvdyBhZGRpbmcgYSBib3JkZXIgdG8gYW4gZWxlbWVudCBieSBqdXN0IGFkZGluZyBhIGJvcmRlci13aWR0aC4gKGh0dHBzOi8vZ2l0aHViLmNvbS90YWlsd2luZGNzcy90YWlsd2luZGNzcy9wdWxsLzExNilcbiovXG5cbiosXG46OmJlZm9yZSxcbjo6YWZ0ZXIge1xuICBib3gtc2l6aW5nOiBib3JkZXItYm94OyAvKiAxICovXG4gIGJvcmRlci13aWR0aDogMDsgLyogMiAqL1xuICBib3JkZXItc3R5bGU6IHNvbGlkOyAvKiAyICovXG4gIGJvcmRlci1jb2xvcjogI2U1ZTdlYjsgLyogMiAqL1xufVxuXG46OmJlZm9yZSxcbjo6YWZ0ZXIge1xuICAtLXR3LWNvbnRlbnQ6ICcnO1xufVxuXG4vKlxuMS4gVXNlIGEgY29uc2lzdGVudCBzZW5zaWJsZSBsaW5lLWhlaWdodCBpbiBhbGwgYnJvd3NlcnMuXG4yLiBQcmV2ZW50IGFkanVzdG1lbnRzIG9mIGZvbnQgc2l6ZSBhZnRlciBvcmllbnRhdGlvbiBjaGFuZ2VzIGluIGlPUy5cbjMuIFVzZSBhIG1vcmUgcmVhZGFibGUgdGFiIHNpemUuXG40LiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYHNhbnNcXGAgZm9udC1mYW1pbHkgYnkgZGVmYXVsdC5cbjUuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgc2Fuc1xcYCBmb250LWZlYXR1cmUtc2V0dGluZ3MgYnkgZGVmYXVsdC5cbjYuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgc2Fuc1xcYCBmb250LXZhcmlhdGlvbi1zZXR0aW5ncyBieSBkZWZhdWx0LlxuNy4gRGlzYWJsZSB0YXAgaGlnaGxpZ2h0cyBvbiBpT1NcbiovXG5cbmh0bWwsXG46aG9zdCB7XG4gIGxpbmUtaGVpZ2h0OiAxLjU7IC8qIDEgKi9cbiAgLXdlYmtpdC10ZXh0LXNpemUtYWRqdXN0OiAxMDAlOyAvKiAyICovXG4gIC1tb3otdGFiLXNpemU6IDQ7IC8qIDMgKi9cbiAgLW8tdGFiLXNpemU6IDQ7XG4gICAgIHRhYi1zaXplOiA0OyAvKiAzICovXG4gIGZvbnQtZmFtaWx5OiB1aS1zYW5zLXNlcmlmLCBzeXN0ZW0tdWksIHNhbnMtc2VyaWYsIFwiQXBwbGUgQ29sb3IgRW1vamlcIiwgXCJTZWdvZSBVSSBFbW9qaVwiLCBcIlNlZ29lIFVJIFN5bWJvbFwiLCBcIk5vdG8gQ29sb3IgRW1vamlcIjsgLyogNCAqL1xuICBmb250LWZlYXR1cmUtc2V0dGluZ3M6IG5vcm1hbDsgLyogNSAqL1xuICBmb250LXZhcmlhdGlvbi1zZXR0aW5nczogbm9ybWFsOyAvKiA2ICovXG4gIC13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7IC8qIDcgKi9cbn1cblxuLypcbjEuIFJlbW92ZSB0aGUgbWFyZ2luIGluIGFsbCBicm93c2Vycy5cbjIuIEluaGVyaXQgbGluZS1oZWlnaHQgZnJvbSBcXGBodG1sXFxgIHNvIHVzZXJzIGNhbiBzZXQgdGhlbSBhcyBhIGNsYXNzIGRpcmVjdGx5IG9uIHRoZSBcXGBodG1sXFxgIGVsZW1lbnQuXG4qL1xuXG5ib2R5IHtcbiAgbWFyZ2luOiAwOyAvKiAxICovXG4gIGxpbmUtaGVpZ2h0OiBpbmhlcml0OyAvKiAyICovXG59XG5cbi8qXG4xLiBBZGQgdGhlIGNvcnJlY3QgaGVpZ2h0IGluIEZpcmVmb3guXG4yLiBDb3JyZWN0IHRoZSBpbmhlcml0YW5jZSBvZiBib3JkZXIgY29sb3IgaW4gRmlyZWZveC4gKGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTE5MDY1NSlcbjMuIEVuc3VyZSBob3Jpem9udGFsIHJ1bGVzIGFyZSB2aXNpYmxlIGJ5IGRlZmF1bHQuXG4qL1xuXG5ociB7XG4gIGhlaWdodDogMDsgLyogMSAqL1xuICBjb2xvcjogaW5oZXJpdDsgLyogMiAqL1xuICBib3JkZXItdG9wLXdpZHRoOiAxcHg7IC8qIDMgKi9cbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCB0ZXh0IGRlY29yYXRpb24gaW4gQ2hyb21lLCBFZGdlLCBhbmQgU2FmYXJpLlxuKi9cblxuYWJicjp3aGVyZShbdGl0bGVdKSB7XG4gIC13ZWJraXQtdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmUgZG90dGVkO1xuICAgICAgICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lIGRvdHRlZDtcbn1cblxuLypcblJlbW92ZSB0aGUgZGVmYXVsdCBmb250IHNpemUgYW5kIHdlaWdodCBmb3IgaGVhZGluZ3MuXG4qL1xuXG5oMSxcbmgyLFxuaDMsXG5oNCxcbmg1LFxuaDYge1xuICBmb250LXNpemU6IGluaGVyaXQ7XG4gIGZvbnQtd2VpZ2h0OiBpbmhlcml0O1xufVxuXG4vKlxuUmVzZXQgbGlua3MgdG8gb3B0aW1pemUgZm9yIG9wdC1pbiBzdHlsaW5nIGluc3RlYWQgb2Ygb3B0LW91dC5cbiovXG5cbmEge1xuICBjb2xvcjogaW5oZXJpdDtcbiAgdGV4dC1kZWNvcmF0aW9uOiBpbmhlcml0O1xufVxuXG4vKlxuQWRkIHRoZSBjb3JyZWN0IGZvbnQgd2VpZ2h0IGluIEVkZ2UgYW5kIFNhZmFyaS5cbiovXG5cbmIsXG5zdHJvbmcge1xuICBmb250LXdlaWdodDogYm9sZGVyO1xufVxuXG4vKlxuMS4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBtb25vXFxgIGZvbnQtZmFtaWx5IGJ5IGRlZmF1bHQuXG4yLiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYG1vbm9cXGAgZm9udC1mZWF0dXJlLXNldHRpbmdzIGJ5IGRlZmF1bHQuXG4zLiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYG1vbm9cXGAgZm9udC12YXJpYXRpb24tc2V0dGluZ3MgYnkgZGVmYXVsdC5cbjQuIENvcnJlY3QgdGhlIG9kZCBcXGBlbVxcYCBmb250IHNpemluZyBpbiBhbGwgYnJvd3NlcnMuXG4qL1xuXG5jb2RlLFxua2JkLFxuc2FtcCxcbnByZSB7XG4gIGZvbnQtZmFtaWx5OiB1aS1tb25vc3BhY2UsIFNGTW9uby1SZWd1bGFyLCBNZW5sbywgTW9uYWNvLCBDb25zb2xhcywgXCJMaWJlcmF0aW9uIE1vbm9cIiwgXCJDb3VyaWVyIE5ld1wiLCBtb25vc3BhY2U7IC8qIDEgKi9cbiAgZm9udC1mZWF0dXJlLXNldHRpbmdzOiBub3JtYWw7IC8qIDIgKi9cbiAgZm9udC12YXJpYXRpb24tc2V0dGluZ3M6IG5vcm1hbDsgLyogMyAqL1xuICBmb250LXNpemU6IDFlbTsgLyogNCAqL1xufVxuXG4vKlxuQWRkIHRoZSBjb3JyZWN0IGZvbnQgc2l6ZSBpbiBhbGwgYnJvd3NlcnMuXG4qL1xuXG5zbWFsbCB7XG4gIGZvbnQtc2l6ZTogODAlO1xufVxuXG4vKlxuUHJldmVudCBcXGBzdWJcXGAgYW5kIFxcYHN1cFxcYCBlbGVtZW50cyBmcm9tIGFmZmVjdGluZyB0aGUgbGluZSBoZWlnaHQgaW4gYWxsIGJyb3dzZXJzLlxuKi9cblxuc3ViLFxuc3VwIHtcbiAgZm9udC1zaXplOiA3NSU7XG4gIGxpbmUtaGVpZ2h0OiAwO1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTtcbn1cblxuc3ViIHtcbiAgYm90dG9tOiAtMC4yNWVtO1xufVxuXG5zdXAge1xuICB0b3A6IC0wLjVlbTtcbn1cblxuLypcbjEuIFJlbW92ZSB0ZXh0IGluZGVudGF0aW9uIGZyb20gdGFibGUgY29udGVudHMgaW4gQ2hyb21lIGFuZCBTYWZhcmkuIChodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD05OTkwODgsIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0yMDEyOTcpXG4yLiBDb3JyZWN0IHRhYmxlIGJvcmRlciBjb2xvciBpbmhlcml0YW5jZSBpbiBhbGwgQ2hyb21lIGFuZCBTYWZhcmkuIChodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD05MzU3MjksIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0xOTUwMTYpXG4zLiBSZW1vdmUgZ2FwcyBiZXR3ZWVuIHRhYmxlIGJvcmRlcnMgYnkgZGVmYXVsdC5cbiovXG5cbnRhYmxlIHtcbiAgdGV4dC1pbmRlbnQ6IDA7IC8qIDEgKi9cbiAgYm9yZGVyLWNvbG9yOiBpbmhlcml0OyAvKiAyICovXG4gIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7IC8qIDMgKi9cbn1cblxuLypcbjEuIENoYW5nZSB0aGUgZm9udCBzdHlsZXMgaW4gYWxsIGJyb3dzZXJzLlxuMi4gUmVtb3ZlIHRoZSBtYXJnaW4gaW4gRmlyZWZveCBhbmQgU2FmYXJpLlxuMy4gUmVtb3ZlIGRlZmF1bHQgcGFkZGluZyBpbiBhbGwgYnJvd3NlcnMuXG4qL1xuXG5idXR0b24sXG5pbnB1dCxcbm9wdGdyb3VwLFxuc2VsZWN0LFxudGV4dGFyZWEge1xuICBmb250LWZhbWlseTogaW5oZXJpdDsgLyogMSAqL1xuICBmb250LWZlYXR1cmUtc2V0dGluZ3M6IGluaGVyaXQ7IC8qIDEgKi9cbiAgZm9udC12YXJpYXRpb24tc2V0dGluZ3M6IGluaGVyaXQ7IC8qIDEgKi9cbiAgZm9udC1zaXplOiAxMDAlOyAvKiAxICovXG4gIGZvbnQtd2VpZ2h0OiBpbmhlcml0OyAvKiAxICovXG4gIGxpbmUtaGVpZ2h0OiBpbmhlcml0OyAvKiAxICovXG4gIGNvbG9yOiBpbmhlcml0OyAvKiAxICovXG4gIG1hcmdpbjogMDsgLyogMiAqL1xuICBwYWRkaW5nOiAwOyAvKiAzICovXG59XG5cbi8qXG5SZW1vdmUgdGhlIGluaGVyaXRhbmNlIG9mIHRleHQgdHJhbnNmb3JtIGluIEVkZ2UgYW5kIEZpcmVmb3guXG4qL1xuXG5idXR0b24sXG5zZWxlY3Qge1xuICB0ZXh0LXRyYW5zZm9ybTogbm9uZTtcbn1cblxuLypcbjEuIENvcnJlY3QgdGhlIGluYWJpbGl0eSB0byBzdHlsZSBjbGlja2FibGUgdHlwZXMgaW4gaU9TIGFuZCBTYWZhcmkuXG4yLiBSZW1vdmUgZGVmYXVsdCBidXR0b24gc3R5bGVzLlxuKi9cblxuYnV0dG9uLFxuW3R5cGU9J2J1dHRvbiddLFxuW3R5cGU9J3Jlc2V0J10sXG5bdHlwZT0nc3VibWl0J10ge1xuICAtd2Via2l0LWFwcGVhcmFuY2U6IGJ1dHRvbjsgLyogMSAqL1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDsgLyogMiAqL1xuICBiYWNrZ3JvdW5kLWltYWdlOiBub25lOyAvKiAyICovXG59XG5cbi8qXG5Vc2UgdGhlIG1vZGVybiBGaXJlZm94IGZvY3VzIHN0eWxlIGZvciBhbGwgZm9jdXNhYmxlIGVsZW1lbnRzLlxuKi9cblxuOi1tb3otZm9jdXNyaW5nIHtcbiAgb3V0bGluZTogYXV0bztcbn1cblxuLypcblJlbW92ZSB0aGUgYWRkaXRpb25hbCBcXGA6aW52YWxpZFxcYCBzdHlsZXMgaW4gRmlyZWZveC4gKGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL2dlY2tvLWRldi9ibG9iLzJmOWVhY2Q5ZDNkOTk1YzkzN2I0MjUxYTU1NTdkOTVkNDk0YzliZTEvbGF5b3V0L3N0eWxlL3Jlcy9mb3Jtcy5jc3MjTDcyOC1MNzM3KVxuKi9cblxuOi1tb3otdWktaW52YWxpZCB7XG4gIGJveC1zaGFkb3c6IG5vbmU7XG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgdmVydGljYWwgYWxpZ25tZW50IGluIENocm9tZSBhbmQgRmlyZWZveC5cbiovXG5cbnByb2dyZXNzIHtcbiAgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xufVxuXG4vKlxuQ29ycmVjdCB0aGUgY3Vyc29yIHN0eWxlIG9mIGluY3JlbWVudCBhbmQgZGVjcmVtZW50IGJ1dHRvbnMgaW4gU2FmYXJpLlxuKi9cblxuOjotd2Via2l0LWlubmVyLXNwaW4tYnV0dG9uLFxuOjotd2Via2l0LW91dGVyLXNwaW4tYnV0dG9uIHtcbiAgaGVpZ2h0OiBhdXRvO1xufVxuXG4vKlxuMS4gQ29ycmVjdCB0aGUgb2RkIGFwcGVhcmFuY2UgaW4gQ2hyb21lIGFuZCBTYWZhcmkuXG4yLiBDb3JyZWN0IHRoZSBvdXRsaW5lIHN0eWxlIGluIFNhZmFyaS5cbiovXG5cblt0eXBlPSdzZWFyY2gnXSB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogdGV4dGZpZWxkOyAvKiAxICovXG4gIG91dGxpbmUtb2Zmc2V0OiAtMnB4OyAvKiAyICovXG59XG5cbi8qXG5SZW1vdmUgdGhlIGlubmVyIHBhZGRpbmcgaW4gQ2hyb21lIGFuZCBTYWZhcmkgb24gbWFjT1MuXG4qL1xuXG46Oi13ZWJraXQtc2VhcmNoLWRlY29yYXRpb24ge1xuICAtd2Via2l0LWFwcGVhcmFuY2U6IG5vbmU7XG59XG5cbi8qXG4xLiBDb3JyZWN0IHRoZSBpbmFiaWxpdHkgdG8gc3R5bGUgY2xpY2thYmxlIHR5cGVzIGluIGlPUyBhbmQgU2FmYXJpLlxuMi4gQ2hhbmdlIGZvbnQgcHJvcGVydGllcyB0byBcXGBpbmhlcml0XFxgIGluIFNhZmFyaS5cbiovXG5cbjo6LXdlYmtpdC1maWxlLXVwbG9hZC1idXR0b24ge1xuICAtd2Via2l0LWFwcGVhcmFuY2U6IGJ1dHRvbjsgLyogMSAqL1xuICBmb250OiBpbmhlcml0OyAvKiAyICovXG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgZGlzcGxheSBpbiBDaHJvbWUgYW5kIFNhZmFyaS5cbiovXG5cbnN1bW1hcnkge1xuICBkaXNwbGF5OiBsaXN0LWl0ZW07XG59XG5cbi8qXG5SZW1vdmVzIHRoZSBkZWZhdWx0IHNwYWNpbmcgYW5kIGJvcmRlciBmb3IgYXBwcm9wcmlhdGUgZWxlbWVudHMuXG4qL1xuXG5ibG9ja3F1b3RlLFxuZGwsXG5kZCxcbmgxLFxuaDIsXG5oMyxcbmg0LFxuaDUsXG5oNixcbmhyLFxuZmlndXJlLFxucCxcbnByZSB7XG4gIG1hcmdpbjogMDtcbn1cblxuZmllbGRzZXQge1xuICBtYXJnaW46IDA7XG4gIHBhZGRpbmc6IDA7XG59XG5cbmxlZ2VuZCB7XG4gIHBhZGRpbmc6IDA7XG59XG5cbm9sLFxudWwsXG5tZW51IHtcbiAgbGlzdC1zdHlsZTogbm9uZTtcbiAgbWFyZ2luOiAwO1xuICBwYWRkaW5nOiAwO1xufVxuXG4vKlxuUmVzZXQgZGVmYXVsdCBzdHlsaW5nIGZvciBkaWFsb2dzLlxuKi9cbmRpYWxvZyB7XG4gIHBhZGRpbmc6IDA7XG59XG5cbi8qXG5QcmV2ZW50IHJlc2l6aW5nIHRleHRhcmVhcyBob3Jpem9udGFsbHkgYnkgZGVmYXVsdC5cbiovXG5cbnRleHRhcmVhIHtcbiAgcmVzaXplOiB2ZXJ0aWNhbDtcbn1cblxuLypcbjEuIFJlc2V0IHRoZSBkZWZhdWx0IHBsYWNlaG9sZGVyIG9wYWNpdHkgaW4gRmlyZWZveC4gKGh0dHBzOi8vZ2l0aHViLmNvbS90YWlsd2luZGxhYnMvdGFpbHdpbmRjc3MvaXNzdWVzLzMzMDApXG4yLiBTZXQgdGhlIGRlZmF1bHQgcGxhY2Vob2xkZXIgY29sb3IgdG8gdGhlIHVzZXIncyBjb25maWd1cmVkIGdyYXkgNDAwIGNvbG9yLlxuKi9cblxuaW5wdXQ6Oi1tb3otcGxhY2Vob2xkZXIsIHRleHRhcmVhOjotbW96LXBsYWNlaG9sZGVyIHtcbiAgb3BhY2l0eTogMTsgLyogMSAqL1xuICBjb2xvcjogIzljYTNhZjsgLyogMiAqL1xufVxuXG5pbnB1dDo6cGxhY2Vob2xkZXIsXG50ZXh0YXJlYTo6cGxhY2Vob2xkZXIge1xuICBvcGFjaXR5OiAxOyAvKiAxICovXG4gIGNvbG9yOiAjOWNhM2FmOyAvKiAyICovXG59XG5cbi8qXG5TZXQgdGhlIGRlZmF1bHQgY3Vyc29yIGZvciBidXR0b25zLlxuKi9cblxuYnV0dG9uLFxuW3JvbGU9XCJidXR0b25cIl0ge1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG5cbi8qXG5NYWtlIHN1cmUgZGlzYWJsZWQgYnV0dG9ucyBkb24ndCBnZXQgdGhlIHBvaW50ZXIgY3Vyc29yLlxuKi9cbjpkaXNhYmxlZCB7XG4gIGN1cnNvcjogZGVmYXVsdDtcbn1cblxuLypcbjEuIE1ha2UgcmVwbGFjZWQgZWxlbWVudHMgXFxgZGlzcGxheTogYmxvY2tcXGAgYnkgZGVmYXVsdC4gKGh0dHBzOi8vZ2l0aHViLmNvbS9tb3pkZXZzL2Nzc3JlbWVkeS9pc3N1ZXMvMTQpXG4yLiBBZGQgXFxgdmVydGljYWwtYWxpZ246IG1pZGRsZVxcYCB0byBhbGlnbiByZXBsYWNlZCBlbGVtZW50cyBtb3JlIHNlbnNpYmx5IGJ5IGRlZmF1bHQuIChodHRwczovL2dpdGh1Yi5jb20vamVuc2ltbW9ucy9jc3NyZW1lZHkvaXNzdWVzLzE0I2lzc3VlY29tbWVudC02MzQ5MzQyMTApXG4gICBUaGlzIGNhbiB0cmlnZ2VyIGEgcG9vcmx5IGNvbnNpZGVyZWQgbGludCBlcnJvciBpbiBzb21lIHRvb2xzIGJ1dCBpcyBpbmNsdWRlZCBieSBkZXNpZ24uXG4qL1xuXG5pbWcsXG5zdmcsXG52aWRlbyxcbmNhbnZhcyxcbmF1ZGlvLFxuaWZyYW1lLFxuZW1iZWQsXG5vYmplY3Qge1xuICBkaXNwbGF5OiBibG9jazsgLyogMSAqL1xuICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOyAvKiAyICovXG59XG5cbi8qXG5Db25zdHJhaW4gaW1hZ2VzIGFuZCB2aWRlb3MgdG8gdGhlIHBhcmVudCB3aWR0aCBhbmQgcHJlc2VydmUgdGhlaXIgaW50cmluc2ljIGFzcGVjdCByYXRpby4gKGh0dHBzOi8vZ2l0aHViLmNvbS9tb3pkZXZzL2Nzc3JlbWVkeS9pc3N1ZXMvMTQpXG4qL1xuXG5pbWcsXG52aWRlbyB7XG4gIG1heC13aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiBhdXRvO1xufVxuXG4vKiBNYWtlIGVsZW1lbnRzIHdpdGggdGhlIEhUTUwgaGlkZGVuIGF0dHJpYnV0ZSBzdGF5IGhpZGRlbiBieSBkZWZhdWx0ICovXG5baGlkZGVuXSB7XG4gIGRpc3BsYXk6IG5vbmU7XG59XG5cbiosIDo6YmVmb3JlLCA6OmFmdGVyIHtcbiAgLS10dy1ib3JkZXItc3BhY2luZy14OiAwO1xuICAtLXR3LWJvcmRlci1zcGFjaW5nLXk6IDA7XG4gIC0tdHctdHJhbnNsYXRlLXg6IDA7XG4gIC0tdHctdHJhbnNsYXRlLXk6IDA7XG4gIC0tdHctcm90YXRlOiAwO1xuICAtLXR3LXNrZXcteDogMDtcbiAgLS10dy1za2V3LXk6IDA7XG4gIC0tdHctc2NhbGUteDogMTtcbiAgLS10dy1zY2FsZS15OiAxO1xuICAtLXR3LXBhbi14OiAgO1xuICAtLXR3LXBhbi15OiAgO1xuICAtLXR3LXBpbmNoLXpvb206ICA7XG4gIC0tdHctc2Nyb2xsLXNuYXAtc3RyaWN0bmVzczogcHJveGltaXR5O1xuICAtLXR3LWdyYWRpZW50LWZyb20tcG9zaXRpb246ICA7XG4gIC0tdHctZ3JhZGllbnQtdmlhLXBvc2l0aW9uOiAgO1xuICAtLXR3LWdyYWRpZW50LXRvLXBvc2l0aW9uOiAgO1xuICAtLXR3LW9yZGluYWw6ICA7XG4gIC0tdHctc2xhc2hlZC16ZXJvOiAgO1xuICAtLXR3LW51bWVyaWMtZmlndXJlOiAgO1xuICAtLXR3LW51bWVyaWMtc3BhY2luZzogIDtcbiAgLS10dy1udW1lcmljLWZyYWN0aW9uOiAgO1xuICAtLXR3LXJpbmctaW5zZXQ6ICA7XG4gIC0tdHctcmluZy1vZmZzZXQtd2lkdGg6IDBweDtcbiAgLS10dy1yaW5nLW9mZnNldC1jb2xvcjogI2ZmZjtcbiAgLS10dy1yaW5nLWNvbG9yOiByZ2IoNTkgMTMwIDI0NiAvIDAuNSk7XG4gIC0tdHctcmluZy1vZmZzZXQtc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctcmluZy1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1zaGFkb3ctY29sb3JlZDogMCAwICMwMDAwO1xuICAtLXR3LWJsdXI6ICA7XG4gIC0tdHctYnJpZ2h0bmVzczogIDtcbiAgLS10dy1jb250cmFzdDogIDtcbiAgLS10dy1ncmF5c2NhbGU6ICA7XG4gIC0tdHctaHVlLXJvdGF0ZTogIDtcbiAgLS10dy1pbnZlcnQ6ICA7XG4gIC0tdHctc2F0dXJhdGU6ICA7XG4gIC0tdHctc2VwaWE6ICA7XG4gIC0tdHctZHJvcC1zaGFkb3c6ICA7XG4gIC0tdHctYmFja2Ryb3AtYmx1cjogIDtcbiAgLS10dy1iYWNrZHJvcC1icmlnaHRuZXNzOiAgO1xuICAtLXR3LWJhY2tkcm9wLWNvbnRyYXN0OiAgO1xuICAtLXR3LWJhY2tkcm9wLWdyYXlzY2FsZTogIDtcbiAgLS10dy1iYWNrZHJvcC1odWUtcm90YXRlOiAgO1xuICAtLXR3LWJhY2tkcm9wLWludmVydDogIDtcbiAgLS10dy1iYWNrZHJvcC1vcGFjaXR5OiAgO1xuICAtLXR3LWJhY2tkcm9wLXNhdHVyYXRlOiAgO1xuICAtLXR3LWJhY2tkcm9wLXNlcGlhOiAgO1xufVxuXG46OmJhY2tkcm9wIHtcbiAgLS10dy1ib3JkZXItc3BhY2luZy14OiAwO1xuICAtLXR3LWJvcmRlci1zcGFjaW5nLXk6IDA7XG4gIC0tdHctdHJhbnNsYXRlLXg6IDA7XG4gIC0tdHctdHJhbnNsYXRlLXk6IDA7XG4gIC0tdHctcm90YXRlOiAwO1xuICAtLXR3LXNrZXcteDogMDtcbiAgLS10dy1za2V3LXk6IDA7XG4gIC0tdHctc2NhbGUteDogMTtcbiAgLS10dy1zY2FsZS15OiAxO1xuICAtLXR3LXBhbi14OiAgO1xuICAtLXR3LXBhbi15OiAgO1xuICAtLXR3LXBpbmNoLXpvb206ICA7XG4gIC0tdHctc2Nyb2xsLXNuYXAtc3RyaWN0bmVzczogcHJveGltaXR5O1xuICAtLXR3LWdyYWRpZW50LWZyb20tcG9zaXRpb246ICA7XG4gIC0tdHctZ3JhZGllbnQtdmlhLXBvc2l0aW9uOiAgO1xuICAtLXR3LWdyYWRpZW50LXRvLXBvc2l0aW9uOiAgO1xuICAtLXR3LW9yZGluYWw6ICA7XG4gIC0tdHctc2xhc2hlZC16ZXJvOiAgO1xuICAtLXR3LW51bWVyaWMtZmlndXJlOiAgO1xuICAtLXR3LW51bWVyaWMtc3BhY2luZzogIDtcbiAgLS10dy1udW1lcmljLWZyYWN0aW9uOiAgO1xuICAtLXR3LXJpbmctaW5zZXQ6ICA7XG4gIC0tdHctcmluZy1vZmZzZXQtd2lkdGg6IDBweDtcbiAgLS10dy1yaW5nLW9mZnNldC1jb2xvcjogI2ZmZjtcbiAgLS10dy1yaW5nLWNvbG9yOiByZ2IoNTkgMTMwIDI0NiAvIDAuNSk7XG4gIC0tdHctcmluZy1vZmZzZXQtc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctcmluZy1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1zaGFkb3ctY29sb3JlZDogMCAwICMwMDAwO1xuICAtLXR3LWJsdXI6ICA7XG4gIC0tdHctYnJpZ2h0bmVzczogIDtcbiAgLS10dy1jb250cmFzdDogIDtcbiAgLS10dy1ncmF5c2NhbGU6ICA7XG4gIC0tdHctaHVlLXJvdGF0ZTogIDtcbiAgLS10dy1pbnZlcnQ6ICA7XG4gIC0tdHctc2F0dXJhdGU6ICA7XG4gIC0tdHctc2VwaWE6ICA7XG4gIC0tdHctZHJvcC1zaGFkb3c6ICA7XG4gIC0tdHctYmFja2Ryb3AtYmx1cjogIDtcbiAgLS10dy1iYWNrZHJvcC1icmlnaHRuZXNzOiAgO1xuICAtLXR3LWJhY2tkcm9wLWNvbnRyYXN0OiAgO1xuICAtLXR3LWJhY2tkcm9wLWdyYXlzY2FsZTogIDtcbiAgLS10dy1iYWNrZHJvcC1odWUtcm90YXRlOiAgO1xuICAtLXR3LWJhY2tkcm9wLWludmVydDogIDtcbiAgLS10dy1iYWNrZHJvcC1vcGFjaXR5OiAgO1xuICAtLXR3LWJhY2tkcm9wLXNhdHVyYXRlOiAgO1xuICAtLXR3LWJhY2tkcm9wLXNlcGlhOiAgO1xufVxuLmNvbnRhaW5lciB7XG4gIHdpZHRoOiAxMDAlO1xufVxuQG1lZGlhIChtaW4td2lkdGg6IDY0MHB4KSB7XG5cbiAgLmNvbnRhaW5lciB7XG4gICAgbWF4LXdpZHRoOiA2NDBweDtcbiAgfVxufVxuQG1lZGlhIChtaW4td2lkdGg6IDc2OHB4KSB7XG5cbiAgLmNvbnRhaW5lciB7XG4gICAgbWF4LXdpZHRoOiA3NjhweDtcbiAgfVxufVxuQG1lZGlhIChtaW4td2lkdGg6IDEwMjRweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogMTAyNHB4O1xuICB9XG59XG5AbWVkaWEgKG1pbi13aWR0aDogMTI4MHB4KSB7XG5cbiAgLmNvbnRhaW5lciB7XG4gICAgbWF4LXdpZHRoOiAxMjgwcHg7XG4gIH1cbn1cbkBtZWRpYSAobWluLXdpZHRoOiAxNTM2cHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDE1MzZweDtcbiAgfVxufVxuLnBvaW50ZXItZXZlbnRzLW5vbmUge1xuICBwb2ludGVyLWV2ZW50czogbm9uZTtcbn1cbi52aXNpYmxlIHtcbiAgdmlzaWJpbGl0eTogdmlzaWJsZTtcbn1cbi5jb2xsYXBzZSB7XG4gIHZpc2liaWxpdHk6IGNvbGxhcHNlO1xufVxuLnJlbGF0aXZlIHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xufVxuLm0tNSB7XG4gIG1hcmdpbjogMS4yNXJlbTtcbn1cbi5tLTgge1xuICBtYXJnaW46IDJyZW07XG59XG4ubWwtMTAge1xuICBtYXJnaW4tbGVmdDogMi41cmVtO1xufVxuLm1sLTgge1xuICBtYXJnaW4tbGVmdDogMnJlbTtcbn1cbi5ibG9jayB7XG4gIGRpc3BsYXk6IGJsb2NrO1xufVxuLmZsZXgge1xuICBkaXNwbGF5OiBmbGV4O1xufVxuLnRhYmxlIHtcbiAgZGlzcGxheTogdGFibGU7XG59XG4uZ3JpZCB7XG4gIGRpc3BsYXk6IGdyaWQ7XG59XG4uY29udGVudHMge1xuICBkaXNwbGF5OiBjb250ZW50cztcbn1cbi5oaWRkZW4ge1xuICBkaXNwbGF5OiBub25lO1xufVxuLmgtMSB7XG4gIGhlaWdodDogMC4yNXJlbTtcbn1cbi5oLTFcXFxcLzUge1xuICBoZWlnaHQ6IDIwJTtcbn1cbi5oLTQge1xuICBoZWlnaHQ6IDFyZW07XG59XG4uaC00XFxcXC81IHtcbiAgaGVpZ2h0OiA4MCU7XG59XG4uaC00MCB7XG4gIGhlaWdodDogMTByZW07XG59XG4uaC02IHtcbiAgaGVpZ2h0OiAxLjVyZW07XG59XG4uaC1tYXgge1xuICBoZWlnaHQ6IC1tb3otbWF4LWNvbnRlbnQ7XG4gIGhlaWdodDogbWF4LWNvbnRlbnQ7XG59XG4udy0xIHtcbiAgd2lkdGg6IDAuMjVyZW07XG59XG4udy0xXFxcXC8yIHtcbiAgd2lkdGg6IDUwJTtcbn1cbi53LTQge1xuICB3aWR0aDogMXJlbTtcbn1cbi53LTRcXFxcLzEyIHtcbiAgd2lkdGg6IDMzLjMzMzMzMyU7XG59XG4udy02IHtcbiAgd2lkdGg6IDEuNXJlbTtcbn1cbi53LWF1dG8ge1xuICB3aWR0aDogYXV0bztcbn1cbi53LWZ1bGwge1xuICB3aWR0aDogMTAwJTtcbn1cbi5taW4tdy00NCB7XG4gIG1pbi13aWR0aDogMTFyZW07XG59XG4ubWluLXctbWF4IHtcbiAgbWluLXdpZHRoOiAtbW96LW1heC1jb250ZW50O1xuICBtaW4td2lkdGg6IG1heC1jb250ZW50O1xufVxuLm1pbi13LW1pbiB7XG4gIG1pbi13aWR0aDogLW1vei1taW4tY29udGVudDtcbiAgbWluLXdpZHRoOiBtaW4tY29udGVudDtcbn1cbi5mbGV4LTEge1xuICBmbGV4OiAxIDEgMCU7XG59XG4uZmxleC1ub25lIHtcbiAgZmxleDogbm9uZTtcbn1cbi5ib3JkZXItY29sbGFwc2Uge1xuICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlO1xufVxuLnRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKHZhcigtLXR3LXRyYW5zbGF0ZS14KSwgdmFyKC0tdHctdHJhbnNsYXRlLXkpKSByb3RhdGUodmFyKC0tdHctcm90YXRlKSkgc2tld1godmFyKC0tdHctc2tldy14KSkgc2tld1kodmFyKC0tdHctc2tldy15KSkgc2NhbGVYKHZhcigtLXR3LXNjYWxlLXgpKSBzY2FsZVkodmFyKC0tdHctc2NhbGUteSkpO1xufVxuLmN1cnNvci1kZWZhdWx0IHtcbiAgY3Vyc29yOiBkZWZhdWx0O1xufVxuLmN1cnNvci1oZWxwIHtcbiAgY3Vyc29yOiBoZWxwO1xufVxuLmN1cnNvci1wb2ludGVyIHtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmN1cnNvci10ZXh0IHtcbiAgY3Vyc29yOiB0ZXh0O1xufVxuLnJlc2l6ZSB7XG4gIHJlc2l6ZTogYm90aDtcbn1cbi5hdXRvLXJvd3MtbWluIHtcbiAgZ3JpZC1hdXRvLXJvd3M6IG1pbi1jb250ZW50O1xufVxuLmdyaWQtY29scy0xMSB7XG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDExLCBtaW5tYXgoMCwgMWZyKSk7XG59XG4uZmxleC1yb3cge1xuICBmbGV4LWRpcmVjdGlvbjogcm93O1xufVxuLmZsZXgtY29sIHtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbn1cbi5pdGVtcy1jZW50ZXIge1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xufVxuLmp1c3RpZnktc3RhcnQge1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7XG59XG4uanVzdGlmeS1jZW50ZXIge1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbn1cbi5qdXN0aWZ5LWJldHdlZW4ge1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG59XG4uanVzdGlmeS1hcm91bmQge1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWFyb3VuZDtcbn1cbi5nYXAtMSB7XG4gIGdhcDogMC4yNXJlbTtcbn1cbi5nYXAtMTAge1xuICBnYXA6IDIuNXJlbTtcbn1cbi5nYXAtMiB7XG4gIGdhcDogMC41cmVtO1xufVxuLmdhcC02IHtcbiAgZ2FwOiAxLjVyZW07XG59XG4ub3ZlcmZsb3ctYXV0byB7XG4gIG92ZXJmbG93OiBhdXRvO1xufVxuLnJvdW5kZWQtZnVsbCB7XG4gIGJvcmRlci1yYWRpdXM6IDk5OTlweDtcbn1cbi5yb3VuZGVkLXhsIHtcbiAgYm9yZGVyLXJhZGl1czogMC43NXJlbTtcbn1cbi5ib3JkZXIge1xuICBib3JkZXItd2lkdGg6IDFweDtcbn1cbi5ib3JkZXItc29saWQge1xuICBib3JkZXItc3R5bGU6IHNvbGlkO1xufVxuLmJvcmRlci1ibHVlLTgwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDMwIDY0IDE3NSAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYm9yZGVyLWdyYXktODAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMzEgNDEgNTUgLyB2YXIoLS10dy1ib3JkZXItb3BhY2l0eSkpO1xufVxuLmJvcmRlci1ncmVlbi02MDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigyMiAxNjMgNzQgLyB2YXIoLS10dy1ib3JkZXItb3BhY2l0eSkpO1xufVxuLmJvcmRlci1vcmFuZ2UtNDAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMjUxIDE0NiA2MCAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYm9yZGVyLXJlZC03MDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigxODUgMjggMjggLyB2YXIoLS10dy1ib3JkZXItb3BhY2l0eSkpO1xufVxuLmJnLWdyYXktMjAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjI5IDIzMSAyMzUgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS00MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigxNTYgMTYzIDE3NSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1ncmF5LTgwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDMxIDQxIDU1IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLW9yYW5nZS00MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyNTEgMTQ2IDYwIC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLnAtMSB7XG4gIHBhZGRpbmc6IDAuMjVyZW07XG59XG4ucC0yIHtcbiAgcGFkZGluZzogMC41cmVtO1xufVxuLnAtNCB7XG4gIHBhZGRpbmc6IDFyZW07XG59XG4ucC02IHtcbiAgcGFkZGluZzogMS41cmVtO1xufVxuLnB4LTMge1xuICBwYWRkaW5nLWxlZnQ6IDAuNzVyZW07XG4gIHBhZGRpbmctcmlnaHQ6IDAuNzVyZW07XG59XG4ucHgtNCB7XG4gIHBhZGRpbmctbGVmdDogMXJlbTtcbiAgcGFkZGluZy1yaWdodDogMXJlbTtcbn1cbi5weC02IHtcbiAgcGFkZGluZy1sZWZ0OiAxLjVyZW07XG4gIHBhZGRpbmctcmlnaHQ6IDEuNXJlbTtcbn1cbi5weS0xIHtcbiAgcGFkZGluZy10b3A6IDAuMjVyZW07XG4gIHBhZGRpbmctYm90dG9tOiAwLjI1cmVtO1xufVxuLnB5LTIge1xuICBwYWRkaW5nLXRvcDogMC41cmVtO1xuICBwYWRkaW5nLWJvdHRvbTogMC41cmVtO1xufVxuLnB5LTQge1xuICBwYWRkaW5nLXRvcDogMXJlbTtcbiAgcGFkZGluZy1ib3R0b206IDFyZW07XG59XG4ucGwtMiB7XG4gIHBhZGRpbmctbGVmdDogMC41cmVtO1xufVxuLnBsLTUge1xuICBwYWRkaW5nLWxlZnQ6IDEuMjVyZW07XG59XG4ucGwtOCB7XG4gIHBhZGRpbmctbGVmdDogMnJlbTtcbn1cbi50ZXh0LWNlbnRlciB7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbn1cbi50ZXh0LXNtIHtcbiAgZm9udC1zaXplOiAwLjg3NXJlbTtcbiAgbGluZS1oZWlnaHQ6IDEuMjVyZW07XG59XG4udGV4dC1ncmF5LTgwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDMxIDQxIDU1IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1saW1lLTYwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDEwMSAxNjMgMTMgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LW9yYW5nZS01MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigyNDkgMTE1IDIyIC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1yZWQtNTAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMjM5IDY4IDY4IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC10ZWFsLTkwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDE5IDc4IDc0IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udW5kZXJsaW5lIHtcbiAgdGV4dC1kZWNvcmF0aW9uLWxpbmU6IHVuZGVybGluZTtcbn1cbi5vdXRsaW5lIHtcbiAgb3V0bGluZS1zdHlsZTogc29saWQ7XG59XG4uZmlsdGVyIHtcbiAgZmlsdGVyOiB2YXIoLS10dy1ibHVyKSB2YXIoLS10dy1icmlnaHRuZXNzKSB2YXIoLS10dy1jb250cmFzdCkgdmFyKC0tdHctZ3JheXNjYWxlKSB2YXIoLS10dy1odWUtcm90YXRlKSB2YXIoLS10dy1pbnZlcnQpIHZhcigtLXR3LXNhdHVyYXRlKSB2YXIoLS10dy1zZXBpYSkgdmFyKC0tdHctZHJvcC1zaGFkb3cpO1xufVxuLmhvdmVyXFxcXDpiZy1vcmFuZ2UtNTAwOmhvdmVyIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjQ5IDExNSAyMiAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1gLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9zdHlsZXMuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBOztDQUFjLENBQWQ7OztDQUFjOztBQUFkOzs7RUFBQSxzQkFBYyxFQUFkLE1BQWM7RUFBZCxlQUFjLEVBQWQsTUFBYztFQUFkLG1CQUFjLEVBQWQsTUFBYztFQUFkLHFCQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztFQUFBLGdCQUFjO0FBQUE7O0FBQWQ7Ozs7Ozs7O0NBQWM7O0FBQWQ7O0VBQUEsZ0JBQWMsRUFBZCxNQUFjO0VBQWQsOEJBQWMsRUFBZCxNQUFjO0VBQWQsZ0JBQWMsRUFBZCxNQUFjO0VBQWQsY0FBYztLQUFkLFdBQWMsRUFBZCxNQUFjO0VBQWQsK0hBQWMsRUFBZCxNQUFjO0VBQWQsNkJBQWMsRUFBZCxNQUFjO0VBQWQsK0JBQWMsRUFBZCxNQUFjO0VBQWQsd0NBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7OztDQUFjOztBQUFkO0VBQUEsU0FBYyxFQUFkLE1BQWM7RUFBZCxvQkFBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7OztDQUFjOztBQUFkO0VBQUEsU0FBYyxFQUFkLE1BQWM7RUFBZCxjQUFjLEVBQWQsTUFBYztFQUFkLHFCQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEseUNBQWM7VUFBZCxpQ0FBYztBQUFBOztBQUFkOztDQUFjOztBQUFkOzs7Ozs7RUFBQSxrQkFBYztFQUFkLG9CQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7RUFBQSxjQUFjO0VBQWQsd0JBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDs7RUFBQSxtQkFBYztBQUFBOztBQUFkOzs7OztDQUFjOztBQUFkOzs7O0VBQUEsK0dBQWMsRUFBZCxNQUFjO0VBQWQsNkJBQWMsRUFBZCxNQUFjO0VBQWQsK0JBQWMsRUFBZCxNQUFjO0VBQWQsY0FBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLGNBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDs7RUFBQSxjQUFjO0VBQWQsY0FBYztFQUFkLGtCQUFjO0VBQWQsd0JBQWM7QUFBQTs7QUFBZDtFQUFBLGVBQWM7QUFBQTs7QUFBZDtFQUFBLFdBQWM7QUFBQTs7QUFBZDs7OztDQUFjOztBQUFkO0VBQUEsY0FBYyxFQUFkLE1BQWM7RUFBZCxxQkFBYyxFQUFkLE1BQWM7RUFBZCx5QkFBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7OztDQUFjOztBQUFkOzs7OztFQUFBLG9CQUFjLEVBQWQsTUFBYztFQUFkLDhCQUFjLEVBQWQsTUFBYztFQUFkLGdDQUFjLEVBQWQsTUFBYztFQUFkLGVBQWMsRUFBZCxNQUFjO0VBQWQsb0JBQWMsRUFBZCxNQUFjO0VBQWQsb0JBQWMsRUFBZCxNQUFjO0VBQWQsY0FBYyxFQUFkLE1BQWM7RUFBZCxTQUFjLEVBQWQsTUFBYztFQUFkLFVBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7O0VBQUEsb0JBQWM7QUFBQTs7QUFBZDs7O0NBQWM7O0FBQWQ7Ozs7RUFBQSwwQkFBYyxFQUFkLE1BQWM7RUFBZCw2QkFBYyxFQUFkLE1BQWM7RUFBZCxzQkFBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLGFBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLGdCQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7RUFBQSx3QkFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkOztFQUFBLFlBQWM7QUFBQTs7QUFBZDs7O0NBQWM7O0FBQWQ7RUFBQSw2QkFBYyxFQUFkLE1BQWM7RUFBZCxvQkFBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLHdCQUFjO0FBQUE7O0FBQWQ7OztDQUFjOztBQUFkO0VBQUEsMEJBQWMsRUFBZCxNQUFjO0VBQWQsYUFBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLGtCQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7Ozs7Ozs7Ozs7Ozs7RUFBQSxTQUFjO0FBQUE7O0FBQWQ7RUFBQSxTQUFjO0VBQWQsVUFBYztBQUFBOztBQUFkO0VBQUEsVUFBYztBQUFBOztBQUFkOzs7RUFBQSxnQkFBYztFQUFkLFNBQWM7RUFBZCxVQUFjO0FBQUE7O0FBQWQ7O0NBQWM7QUFBZDtFQUFBLFVBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLGdCQUFjO0FBQUE7O0FBQWQ7OztDQUFjOztBQUFkO0VBQUEsVUFBYyxFQUFkLE1BQWM7RUFBZCxjQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztFQUFBLFVBQWMsRUFBZCxNQUFjO0VBQWQsY0FBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDs7RUFBQSxlQUFjO0FBQUE7O0FBQWQ7O0NBQWM7QUFBZDtFQUFBLGVBQWM7QUFBQTs7QUFBZDs7OztDQUFjOztBQUFkOzs7Ozs7OztFQUFBLGNBQWMsRUFBZCxNQUFjO0VBQWQsc0JBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7O0VBQUEsZUFBYztFQUFkLFlBQWM7QUFBQTs7QUFBZCx3RUFBYztBQUFkO0VBQUEsYUFBYztBQUFBOztBQUFkO0VBQUEsd0JBQWM7RUFBZCx3QkFBYztFQUFkLG1CQUFjO0VBQWQsbUJBQWM7RUFBZCxjQUFjO0VBQWQsY0FBYztFQUFkLGNBQWM7RUFBZCxlQUFjO0VBQWQsZUFBYztFQUFkLGFBQWM7RUFBZCxhQUFjO0VBQWQsa0JBQWM7RUFBZCxzQ0FBYztFQUFkLDhCQUFjO0VBQWQsNkJBQWM7RUFBZCw0QkFBYztFQUFkLGVBQWM7RUFBZCxvQkFBYztFQUFkLHNCQUFjO0VBQWQsdUJBQWM7RUFBZCx3QkFBYztFQUFkLGtCQUFjO0VBQWQsMkJBQWM7RUFBZCw0QkFBYztFQUFkLHNDQUFjO0VBQWQsa0NBQWM7RUFBZCwyQkFBYztFQUFkLHNCQUFjO0VBQWQsOEJBQWM7RUFBZCxZQUFjO0VBQWQsa0JBQWM7RUFBZCxnQkFBYztFQUFkLGlCQUFjO0VBQWQsa0JBQWM7RUFBZCxjQUFjO0VBQWQsZ0JBQWM7RUFBZCxhQUFjO0VBQWQsbUJBQWM7RUFBZCxxQkFBYztFQUFkLDJCQUFjO0VBQWQseUJBQWM7RUFBZCwwQkFBYztFQUFkLDJCQUFjO0VBQWQsdUJBQWM7RUFBZCx3QkFBYztFQUFkLHlCQUFjO0VBQWQ7QUFBYzs7QUFBZDtFQUFBLHdCQUFjO0VBQWQsd0JBQWM7RUFBZCxtQkFBYztFQUFkLG1CQUFjO0VBQWQsY0FBYztFQUFkLGNBQWM7RUFBZCxjQUFjO0VBQWQsZUFBYztFQUFkLGVBQWM7RUFBZCxhQUFjO0VBQWQsYUFBYztFQUFkLGtCQUFjO0VBQWQsc0NBQWM7RUFBZCw4QkFBYztFQUFkLDZCQUFjO0VBQWQsNEJBQWM7RUFBZCxlQUFjO0VBQWQsb0JBQWM7RUFBZCxzQkFBYztFQUFkLHVCQUFjO0VBQWQsd0JBQWM7RUFBZCxrQkFBYztFQUFkLDJCQUFjO0VBQWQsNEJBQWM7RUFBZCxzQ0FBYztFQUFkLGtDQUFjO0VBQWQsMkJBQWM7RUFBZCxzQkFBYztFQUFkLDhCQUFjO0VBQWQsWUFBYztFQUFkLGtCQUFjO0VBQWQsZ0JBQWM7RUFBZCxpQkFBYztFQUFkLGtCQUFjO0VBQWQsY0FBYztFQUFkLGdCQUFjO0VBQWQsYUFBYztFQUFkLG1CQUFjO0VBQWQscUJBQWM7RUFBZCwyQkFBYztFQUFkLHlCQUFjO0VBQWQsMEJBQWM7RUFBZCwyQkFBYztFQUFkLHVCQUFjO0VBQWQsd0JBQWM7RUFBZCx5QkFBYztFQUFkO0FBQWM7QUFDZDtFQUFBO0FBQW9CO0FBQXBCOztFQUFBO0lBQUE7RUFBb0I7QUFBQTtBQUFwQjs7RUFBQTtJQUFBO0VBQW9CO0FBQUE7QUFBcEI7O0VBQUE7SUFBQTtFQUFvQjtBQUFBO0FBQXBCOztFQUFBO0lBQUE7RUFBb0I7QUFBQTtBQUFwQjs7RUFBQTtJQUFBO0VBQW9CO0FBQUE7QUFDcEI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsd0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLDJCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLDJCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEscUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsbUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsaUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSxtQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFGbkI7RUFBQSxrQkFFb0I7RUFGcEI7QUFFb0JcIixcInNvdXJjZXNDb250ZW50XCI6W1wiQHRhaWx3aW5kIGJhc2U7XFxuQHRhaWx3aW5kIGNvbXBvbmVudHM7XFxuQHRhaWx3aW5kIHV0aWxpdGllcztcIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107XG5cbiAgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpO1xuICAgICAgfVxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBjb250ZW50ICs9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSk7XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oXCJcIik7XG4gIH07XG5cbiAgLy8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3RcbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cbiAgICB2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGhpcy5sZW5ndGg7IGsrKykge1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2tdWzBdO1xuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBfayA9IDA7IF9rIDwgbW9kdWxlcy5sZW5ndGg7IF9rKyspIHtcbiAgICAgIHZhciBpdGVtID0gW10uY29uY2F0KG1vZHVsZXNbX2tdKTtcbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobWVkaWEpIHtcbiAgICAgICAgaWYgKCFpdGVtWzJdKSB7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHN1cHBvcnRzKSB7XG4gICAgICAgIGlmICghaXRlbVs0XSkge1xuICAgICAgICAgIGl0ZW1bNF0gPSBcIlwiLmNvbmNhdChzdXBwb3J0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzRdID0gc3VwcG9ydHM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBsaXN0O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlbSkge1xuICB2YXIgY29udGVudCA9IGl0ZW1bMV07XG4gIHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcbiAgaWYgKCFjc3NNYXBwaW5nKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHJldHVybiBbY29udGVudF0uY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuICByZXR1cm4gW2NvbnRlbnRdLmpvaW4oXCJcXG5cIik7XG59OyIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi4vbm9kZV9tb2R1bGVzL3Bvc3Rjc3MtbG9hZGVyL2Rpc3QvY2pzLmpzPz9ydWxlU2V0WzFdLnJ1bGVzWzFdLnVzZVsyXSEuL3N0eWxlcy5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi9ub2RlX21vZHVsZXMvcG9zdGNzcy1sb2FkZXIvZGlzdC9janMuanM/P3J1bGVTZXRbMV0ucnVsZXNbMV0udXNlWzJdIS4vc3R5bGVzLmNzc1wiO1xuICAgICAgIGV4cG9ydCBkZWZhdWx0IGNvbnRlbnQgJiYgY29udGVudC5sb2NhbHMgPyBjb250ZW50LmxvY2FscyA6IHVuZGVmaW5lZDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgc3R5bGVzSW5ET00gPSBbXTtcbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRE9NLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRE9NW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXhCeUlkZW50aWZpZXIgPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM10sXG4gICAgICBzdXBwb3J0czogaXRlbVs0XSxcbiAgICAgIGxheWVyOiBpdGVtWzVdXG4gICAgfTtcbiAgICBpZiAoaW5kZXhCeUlkZW50aWZpZXIgIT09IC0xKSB7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0ucmVmZXJlbmNlcysrO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnVwZGF0ZXIob2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHVwZGF0ZXIgPSBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKTtcbiAgICAgIG9wdGlvbnMuYnlJbmRleCA9IGk7XG4gICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoaSwgMCwge1xuICAgICAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuICAgICAgICB1cGRhdGVyOiB1cGRhdGVyLFxuICAgICAgICByZWZlcmVuY2VzOiAxXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuICByZXR1cm4gaWRlbnRpZmllcnM7XG59XG5mdW5jdGlvbiBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKSB7XG4gIHZhciBhcGkgPSBvcHRpb25zLmRvbUFQSShvcHRpb25zKTtcbiAgYXBpLnVwZGF0ZShvYmopO1xuICB2YXIgdXBkYXRlciA9IGZ1bmN0aW9uIHVwZGF0ZXIobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCAmJiBuZXdPYmouc3VwcG9ydHMgPT09IG9iai5zdXBwb3J0cyAmJiBuZXdPYmoubGF5ZXIgPT09IG9iai5sYXllcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhcGkudXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwaS5yZW1vdmUoKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiB1cGRhdGVyO1xufVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG4gICAgdmFyIG5ld0xhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShuZXdMaXN0LCBvcHRpb25zKTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG4gICAgICBpZiAoc3R5bGVzSW5ET01bX2luZGV4XS5yZWZlcmVuY2VzID09PSAwKSB7XG4gICAgICAgIHN0eWxlc0luRE9NW19pbmRleF0udXBkYXRlcigpO1xuICAgICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIG1lbW8gPSB7fTtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBnZXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgdmFyIHN0eWxlVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpO1xuXG4gICAgLy8gU3BlY2lhbCBjYXNlIHRvIHJldHVybiBoZWFkIG9mIGlmcmFtZSBpbnN0ZWFkIG9mIGlmcmFtZSBpdHNlbGZcbiAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICB9XG4gIHJldHVybiBtZW1vW3RhcmdldF07XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0QnlTZWxlY3RvcihpbnNlcnQsIHN0eWxlKSB7XG4gIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQoaW5zZXJ0KTtcbiAgaWYgKCF0YXJnZXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydCcgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuICB9XG4gIHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEJ5U2VsZWN0b3I7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIG9wdGlvbnMuc2V0QXR0cmlidXRlcyhlbGVtZW50LCBvcHRpb25zLmF0dHJpYnV0ZXMpO1xuICBvcHRpb25zLmluc2VydChlbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xuICByZXR1cm4gZWxlbWVudDtcbn1cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0U3R5bGVFbGVtZW50OyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcyhzdHlsZUVsZW1lbnQpIHtcbiAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSBcInVuZGVmaW5lZFwiID8gX193ZWJwYWNrX25vbmNlX18gOiBudWxsO1xuICBpZiAobm9uY2UpIHtcbiAgICBzdHlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibm9uY2VcIiwgbm9uY2UpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlczsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gXCJcIjtcbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KG9iai5zdXBwb3J0cywgXCIpIHtcIik7XG4gIH1cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIkBtZWRpYSBcIi5jb25jYXQob2JqLm1lZGlhLCBcIiB7XCIpO1xuICB9XG4gIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2Ygb2JqLmxheWVyICE9PSBcInVuZGVmaW5lZFwiO1xuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwiQGxheWVyXCIuY29uY2F0KG9iai5sYXllci5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KG9iai5sYXllcikgOiBcIlwiLCBcIiB7XCIpO1xuICB9XG4gIGNzcyArPSBvYmouY3NzO1xuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcbiAgaWYgKHNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9XG5cbiAgLy8gRm9yIG9sZCBJRVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG4gIG9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG59XG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGVFbGVtZW50LnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgc3R5bGVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50KTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBkb21BUEkob3B0aW9ucykge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKCkge30sXG4gICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgfTtcbiAgfVxuICB2YXIgc3R5bGVFbGVtZW50ID0gb3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gIHJldHVybiB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUob2JqKSB7XG4gICAgICBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaik7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuICAgIH1cbiAgfTtcbn1cbm1vZHVsZS5leHBvcnRzID0gZG9tQVBJOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50KSB7XG4gIGlmIChzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICBzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgIH1cbiAgICBzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gc3R5bGVUYWdUcmFuc2Zvcm07IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHRpZDogbW9kdWxlSWQsXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubmMgPSB1bmRlZmluZWQ7IiwiaW1wb3J0IFwiLi9zdHlsZXMuY3NzXCI7XG5pbXBvcnQgR2FtZSBmcm9tIFwiLi9nYW1lXCI7XG5pbXBvcnQgVWlNYW5hZ2VyIGZyb20gXCIuL3VpTWFuYWdlclwiO1xuaW1wb3J0IEFjdGlvbkNvbnRyb2xsZXIgZnJvbSBcIi4vYWN0aW9uQ29udHJvbGxlclwiO1xuXG4vLyBDcmVhdGUgYSBuZXcgVUkgbWFuYWdlclxuY29uc3QgbmV3VWlNYW5hZ2VyID0gVWlNYW5hZ2VyKCk7XG5cbi8vIEluc3RhbnRpYXRlIGEgbmV3IGdhbWVcbmNvbnN0IG5ld0dhbWUgPSBHYW1lKCk7XG5cbi8vIENyZWF0ZSBhIG5ldyBhY3Rpb24gY29udHJvbGxlclxuY29uc3QgYWN0Q29udHJvbGxlciA9IEFjdGlvbkNvbnRyb2xsZXIobmV3VWlNYW5hZ2VyLCBuZXdHYW1lKTtcblxuYWN0Q29udHJvbGxlci5oYW5kbGVTZXR1cCgpO1xuXG4vLyBDb25zb2xlIGxvZyB0aGUgcGxheWVyc1xuY29uc29sZS5sb2coXG4gIGBQbGF5ZXJzOiBGaXJzdCBwbGF5ZXIgb2YgdHlwZSAke25ld0dhbWUucGxheWVycy5odW1hbi50eXBlfSwgc2Vjb25kIHBsYXllciBvZiB0eXBlICR7bmV3R2FtZS5wbGF5ZXJzLmNvbXB1dGVyLnR5cGV9IWAsXG4pO1xuIl0sIm5hbWVzIjpbIkdhbWVib2FyZCIsImdyaWQiLCJzaGlwc1RvUGxhY2UiLCJzaGlwVHlwZSIsInNoaXBMZW5ndGgiLCJjdXJyZW50T3JpZW50YXRpb24iLCJjdXJyZW50U2hpcCIsImxhc3RIb3ZlcmVkQ2VsbCIsInBsYWNlU2hpcEd1aWRlIiwicHJvbXB0IiwicHJvbXB0VHlwZSIsInByb2Nlc3NQbGFjZW1lbnRDb21tYW5kIiwiY29tbWFuZCIsInBhcnRzIiwic3BsaXQiLCJsZW5ndGgiLCJFcnJvciIsImdyaWRQb3NpdGlvbiIsInRvVXBwZXJDYXNlIiwidmFsaWRHcmlkUG9zaXRpb25zIiwiZmxhdCIsImluY2x1ZGVzIiwib3JpZW50YXRpb24iLCJ0b0xvd2VyQ2FzZSIsInVwZGF0ZU91dHB1dCIsIm1lc3NhZ2UiLCJ0eXBlIiwib3V0cHV0IiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsIm1lc3NhZ2VFbGVtZW50IiwiY3JlYXRlRWxlbWVudCIsInRleHRDb250ZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwiYXBwZW5kQ2hpbGQiLCJzY3JvbGxUb3AiLCJzY3JvbGxIZWlnaHQiLCJjb25zb2xlTG9nQ29tbWFuZCIsImRpckZlZWJhY2siLCJjaGFyQXQiLCJzbGljZSIsImNvbnNvbGUiLCJsb2ciLCJ2YWx1ZSIsImNvbnNvbGVMb2dFcnJvciIsImVycm9yIiwiaW5pdFVpTWFuYWdlciIsInVpTWFuYWdlciIsImluaXRDb25zb2xlVUkiLCJjcmVhdGVHYW1lYm9hcmQiLCJjYWxjdWxhdGVTaGlwQ2VsbHMiLCJzdGFydENlbGwiLCJjZWxsSWRzIiwicm93SW5kZXgiLCJjaGFyQ29kZUF0IiwiY29sSW5kZXgiLCJwYXJzZUludCIsInN1YnN0cmluZyIsImkiLCJwdXNoIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwiaGlnaGxpZ2h0Q2VsbHMiLCJmb3JFYWNoIiwiY2VsbElkIiwiY2VsbEVsZW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiY2xlYXJIaWdobGlnaHQiLCJyZW1vdmUiLCJ0b2dnbGVPcmllbnRhdGlvbiIsImhhbmRsZVBsYWNlbWVudEhvdmVyIiwiZSIsImNlbGwiLCJ0YXJnZXQiLCJjb250YWlucyIsImRhdGFzZXQiLCJwbGF5ZXIiLCJjZWxsUG9zIiwicG9zaXRpb24iLCJjZWxsc1RvSGlnaGxpZ2h0IiwiaGFuZGxlTW91c2VMZWF2ZSIsImNlbGxzVG9DbGVhciIsImhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlIiwia2V5IiwicHJldmVudERlZmF1bHQiLCJvbGRDZWxsc1RvQ2xlYXIiLCJuZXdDZWxsc1RvSGlnaGxpZ2h0IiwiZGlzYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIiLCJxdWVyeVNlbGVjdG9yQWxsIiwic3dpdGNoR2FtZWJvYXJkSG92ZXJTdGF0ZXMiLCJzZXR1cEdhbWVib2FyZEZvclBsYWNlbWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJnYW1lYm9hcmRBcmVhIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImNsZWFudXBBZnRlclBsYWNlbWVudCIsIkFjdGlvbkNvbnRyb2xsZXIiLCJnYW1lIiwiaHVtYW5QbGF5ZXIiLCJwbGF5ZXJzIiwiaHVtYW4iLCJodW1hblBsYXllckdhbWVib2FyZCIsImdhbWVib2FyZCIsInNldHVwRXZlbnRMaXN0ZW5lcnMiLCJoYW5kbGVWYWxpZElucHV0IiwiY2xlYW51cEZ1bmN0aW9ucyIsImNvbnNvbGVTdWJtaXRCdXR0b24iLCJjb25zb2xlSW5wdXQiLCJzdWJtaXRIYW5kbGVyIiwiaW5wdXQiLCJrZXlwcmVzc0hhbmRsZXIiLCJjbGlja0hhbmRsZXIiLCJjbGVhbnVwIiwicHJvbXB0QW5kUGxhY2VTaGlwIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJmaW5kIiwic2hpcCIsInBsYWNlU2hpcFByb21wdCIsImRpc3BsYXlQcm9tcHQiLCJwbGFjZVNoaXAiLCJyZW5kZXJTaGlwQm9hcmQiLCJyZW5kZXJTaGlwRGlzcCIsInJlc29sdmVTaGlwUGxhY2VtZW50Iiwic2V0dXBTaGlwc1NlcXVlbnRpYWxseSIsImhhbmRsZVNldHVwIiwiT3ZlcmxhcHBpbmdTaGlwc0Vycm9yIiwiY29uc3RydWN0b3IiLCJuYW1lIiwiU2hpcEFsbG9jYXRpb25SZWFjaGVkRXJyb3IiLCJTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IiLCJJbnZhbGlkU2hpcExlbmd0aEVycm9yIiwiSW52YWxpZFNoaXBUeXBlRXJyb3IiLCJJbnZhbGlkUGxheWVyVHlwZUVycm9yIiwiU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IiLCJSZXBlYXRBdHRhY2tlZEVycm9yIiwiSW52YWxpZE1vdmVFbnRyeUVycm9yIiwiUGxheWVyIiwiU2hpcCIsIkdhbWUiLCJodW1hbkdhbWVib2FyZCIsImNvbXB1dGVyR2FtZWJvYXJkIiwiY29tcHV0ZXJQbGF5ZXIiLCJjdXJyZW50UGxheWVyIiwiZ2FtZU92ZXJTdGF0ZSIsImNvbXB1dGVyIiwic2V0VXAiLCJodW1hblNoaXBzIiwicGxhY2VTaGlwcyIsInN0YXJ0IiwiZGlyZWN0aW9uIiwiZW5kR2FtZSIsInRha2VUdXJuIiwibW92ZSIsImZlZWRiYWNrIiwib3Bwb25lbnQiLCJyZXN1bHQiLCJtYWtlTW92ZSIsImhpdCIsImlzU2hpcFN1bmsiLCJnYW1lV29uIiwiY2hlY2tBbGxTaGlwc1N1bmsiLCJpbmRleENhbGNzIiwiY29sTGV0dGVyIiwicm93TnVtYmVyIiwiY2hlY2tUeXBlIiwic2hpcFBvc2l0aW9ucyIsIk9iamVjdCIsImtleXMiLCJleGlzdGluZ1NoaXBUeXBlIiwiY2hlY2tCb3VuZGFyaWVzIiwiY29vcmRzIiwieExpbWl0IiwieUxpbWl0IiwieCIsInkiLCJjYWxjdWxhdGVTaGlwUG9zaXRpb25zIiwicG9zaXRpb25zIiwiY2hlY2tGb3JPdmVybGFwIiwiZW50cmllcyIsImV4aXN0aW5nU2hpcFBvc2l0aW9ucyIsInNvbWUiLCJjaGVja0ZvckhpdCIsImZvdW5kU2hpcCIsIl8iLCJzaGlwRmFjdG9yeSIsInNoaXBzIiwiaGl0UG9zaXRpb25zIiwiYXR0YWNrTG9nIiwibmV3U2hpcCIsImF0dGFjayIsInJlc3BvbnNlIiwiY2hlY2tSZXN1bHRzIiwiaXNTdW5rIiwiZXZlcnkiLCJzaGlwUmVwb3J0IiwiZmxvYXRpbmdTaGlwcyIsImZpbHRlciIsIm1hcCIsImdldFNoaXAiLCJnZXRTaGlwUG9zaXRpb25zIiwiZ2V0SGl0UG9zaXRpb25zIiwiY2hlY2tNb3ZlIiwiZ2JHcmlkIiwidmFsaWQiLCJlbCIsInAiLCJyYW5kTW92ZSIsIm1vdmVMb2ciLCJhbGxNb3ZlcyIsImZsYXRNYXAiLCJyb3ciLCJwb3NzaWJsZU1vdmVzIiwicmFuZG9tTW92ZSIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImdlbmVyYXRlUmFuZG9tU3RhcnQiLCJzaXplIiwidmFsaWRTdGFydHMiLCJjb2wiLCJyYW5kb21JbmRleCIsImF1dG9QbGFjZW1lbnQiLCJzaGlwVHlwZXMiLCJwbGFjZWQiLCJvcHBHYW1lYm9hcmQiLCJzZXRMZW5ndGgiLCJoaXRzIiwiYnVpbGRTaGlwIiwib2JqIiwiZG9tU2VsIiwic2hpcFNlY3RzIiwic2VjdCIsImNsYXNzTmFtZSIsInNldEF0dHJpYnV0ZSIsIlVpTWFuYWdlciIsImNvbnRhaW5lcklEIiwiY29udGFpbmVyIiwiZ3JpZERpdiIsImNvbHVtbnMiLCJoZWFkZXIiLCJyb3dMYWJlbCIsImlkIiwiY29uc29sZUNvbnRhaW5lciIsImlucHV0RGl2Iiwic3VibWl0QnV0dG9uIiwicHJvbXB0T2JqcyIsImRpc3BsYXkiLCJmaXJzdENoaWxkIiwicmVtb3ZlQ2hpbGQiLCJwcm9tcHREaXYiLCJwbGF5ZXJPYmoiLCJpZFNlbCIsImRpc3BEaXYiLCJzaGlwRGl2IiwidGl0bGUiLCJzZWN0c0RpdiIsInBsYXllclR5cGUiLCJzaGlwT2JqIiwic2hpcFNlY3QiLCJzZWN0aW9uIiwibmV3VWlNYW5hZ2VyIiwibmV3R2FtZSIsImFjdENvbnRyb2xsZXIiXSwic291cmNlUm9vdCI6IiJ9