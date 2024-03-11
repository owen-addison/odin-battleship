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
  prompt: "Enter the grid position (i.e. 'A1') and orientation ('h' for horizontal and 'v' for vertical), separated with a space. For example 'A2 v'. Alternatively, on you gameboard click the cell you want to set at the starting point, use spacebar to toggle the orientation.",
  promptType: "guide"
};
const gameplayGuide = {
  prompt: "Enter grid position (i.e. 'A1') you want to attack. Alternatively, click the cell you want to attack on the opponent's gameboard",
  promptType: "guide"
};
const turnPrompt = {
  prompt: "Make your move.",
  promptType: "instruction"
};
const processCommand = (command, isMove) => {
  // If isMove is truthy, assign as single item array, otherwise split the command by space
  const parts = isMove ? [command] : command.split(" ");
  if (!isMove && parts.length !== 2) {
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
  const result = {
    gridPosition
  };
  if (!isMove) {
    // Process and validate the orientation
    const orientation = parts[1].toLowerCase();
    if (orientation !== "h" && orientation !== "v") {
      throw new Error("Invalid orientation. Must be either 'h' for horizontal or 'v' for vertical.");
    }
    result.orientation = orientation;
  }

  // Return the processed and validated command parts
  return result;
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
const consoleLogPlacementCommand = (shipType, gridPosition, orientation) => {
  // Set the orientation feedback
  const dirFeeback = orientation === "h" ? "horizontally" : "vertically";
  // Set the console message
  const message = `${shipType.charAt(0).toUpperCase() + shipType.slice(1)} placed at ${gridPosition} facing ${dirFeeback}`;
  console.log(`${message}`);
  updateOutput(`> ${message}`, "valid");

  // Clear the input
  document.getElementById("console-input").value = "";
};

// The function for executing commands from the console input
const consoleLogMoveCommand = resultsObject => {
  // Set the console message
  const message = `The ${resultsObject.player}'s move resulted in a ${resultsObject.hit ? "HIT" : "MISS"}!`;
  console.log(`${message}`);
  updateOutput(`> ${message}`, resultsObject.hit ? "valid" : "miss");

  // Clear the input
  document.getElementById("console-input").value = "";
};
const consoleLogError = (error, shipType) => {
  if (shipType) {
    // If shipType is passed then process error as placement error
    console.error(`Error placing ${shipType}: message = ${error.message}.`);
    updateOutput(`> Error placing ${shipType}: ${error.message}`, "error");
  } else {
    // else if shipType is undefined, process error as move error
    console.log(`Error making move: message = ${error.message}.`);
    updateOutput(`> Error making move: message = ${error.message}.`, "error");
  }

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
function enableComputerGameboardHover() {
  document.querySelectorAll('.gameboard-cell[data-player="computer"]').forEach(cell => {
    cell.classList.remove("pointer-events-none", "cursor-default");
    cell.classList.remove("hover:bg-orange-500");
    cell.classList.add("hover:bg-orange-500");
  });
}
function disableComputerGameboardHover() {
  document.querySelectorAll('.gameboard-cell[data-player="computer"]').forEach(cell => {
    cell.classList.add("pointer-events-none", "cursor-default");
    cell.classList.remove("hover:bg-orange-500");
  });
}
function disableHumanGameboardHover() {
  document.querySelectorAll('.gameboard-cell[data-player="human"]').forEach(cell => {
    cell.classList.add("pointer-events-none", "cursor-default");
    cell.classList.remove("hover:bg-orange-500");
  });
}
function switchGameboardHoverStates() {
  // Disable hover on the human's gameboard
  disableHumanGameboardHover();

  // Enable hover on the computer's gameboard
  enableComputerGameboardHover();
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

// Function for starting the game
const startGame = (uiManager, game) => {
  // Set up the game by auto placing computer's ships and setting the
  // current player to the human player
  game.setUp();

  // Display prompt object for taking a turn and starting the game
  uiManager.displayPrompt({
    turnPrompt,
    gameplayGuide
  });
};
const handleHumanMove = e => {
  // Get the position on the board to make a move
  const {
    position
  } = e.target.data;
};

// Setup gameboard for for player move
const setupGameboardForPlayerMove = () => {
  // Enable the hover state for the computer gameboard
  enableComputerGameboardHover();

  // Set up event listeners on the computer gameboard for the player
  // making moves
  document.querySelectorAll('.gameboard-cell[data-player="computer"]').forEach(cell => {
    cell.addEventListener("click", handleHumanMove);
  });
};
async function playerMove() {
  // Wait for player's move (click or console input)
  // Update UI based on move
}
async function computerMove(humanPlayerGameboard, compPlayer) {
  let compMoveResult;
  try {
    // Computer logic to choose a move
    // Update UI based on move
    compMoveResult = compPlayer.makeMove(humanPlayerGameboard);
  } catch (error) {
    consoleLogError(error);
  }
  return compMoveResult;
}
async function checkWinCondition() {
  // Check if all ships are sunk
  // Return true if game is over, false otherwise
}
function concludeGame() {
  // Display winner, update UI, etc.
}
const ActionController = (uiManager, game) => {
  const humanPlayer = game.players.human;
  const humanPlayerGameboard = humanPlayer.gameboard;
  const compPlayer = game.players.computer;
  const compPlayerGameboard = compPlayer.gameboard;

  // Function to setup event listeners for console and gameboard clicks
  function setupEventListeners(handlerFunction, playerType) {
    // Define cleanup functions inside to ensure they are accessible for removal
    const cleanupFunctions = [];
    const consoleSubmitButton = document.getElementById("console-submit");
    const consoleInput = document.getElementById("console-input");
    const submitHandler = () => {
      const input = consoleInput.value;
      handlerFunction(input);
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
    document.querySelectorAll(`.gameboard-cell[data-player=${playerType}]`).forEach(cell => {
      const clickHandler = () => {
        const {
          position
        } = cell.dataset;
        let input;
        if (playerType === "human") {
          input = `${position} ${currentOrientation}`;
        } else if (playerType === "computer") {
          input = position;
        } else {
          throw new Error("Error! Invalid player type passed to clickHandler!");
        }
        console.log(`clickHandler input = ${input}`);
        handlerFunction(input);
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
          } = processCommand(input, false);
          await humanPlayerGameboard.placeShip(shipType, gridPosition, orientation);
          consoleLogPlacementCommand(shipType, gridPosition, orientation);
          // Remove cell highlights
          const cellsToClear = calculateShipCells(gridPosition, currentShip.shipLength, orientation);
          clearHighlight(cellsToClear);

          // Display the ship on the game board and ship status display
          uiManager.renderShipBoard(humanPlayer, shipType);
          uiManager.renderShipDisp(humanPlayer, shipType);

          // eslint-disable-next-line no-use-before-define
          resolveShipPlacement(); // Ship placed successfully, resolve the promise
        } catch (error) {
          consoleLogError(error, shipType);
          // Do not reject to allow for retry, just log the error
        }
      };

      // Setup event listeners and ensure we can clean them up after placement
      const cleanup = setupEventListeners(handleValidInput, "human");

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
    // Start the game
    startGame(uiManager, game);
  };
  async function promptPlayerMove(compMoveResult) {
    return new Promise((resolve, reject) => {
      // Update the player with the result of the computer's last more
      // (if there is one)
      if (compMoveResult !== undefined) {
        // Log the result of the computer's move to the console
        consoleLogMoveCommand(compMoveResult);
      }
      console.log(`Make a move!`);
      const handleValidMove = async move => {
        // console.log(`handleValidInput: move = ${move}`);
        try {
          const {
            gridPosition
          } = processCommand(move, true);
          // console.log(`handleValidInput: gridPosition = ${gridPosition}`);
          const humanMoveResult = await humanPlayer.makeMove(compPlayerGameboard, gridPosition);
          console.log(`handleValidInput: humanMoveResult = ${humanMoveResult}`);
          console.dir(humanMoveResult);

          // Communicate the result of the move to the user
          consoleLogMoveCommand(humanMoveResult);

          // eslint-disable-next-line no-use-before-define
          resolveMove(); // Move executed successfully, resolve the promise
        } catch (error) {
          consoleLogError(error);
          // Do not reject to allow for retry, just log the error
        }
      };

      // Setup event listeners and ensure we can clean them up after placement
      const cleanup = setupEventListeners(handleValidMove, "computer");

      // Attach cleanup to resolve to ensure it's called when the promise resolves
      const resolveMove = () => {
        cleanup();
        resolve();
      };
    });
  }

  // Function for handling the playing of the game
  const playGame = async () => {
    let gameOver = false;
    let compMoveResult;
    while (!gameOver) {
      console.dir(game.currentPlayer);
      // Player makes a move
      // eslint-disable-next-line no-await-in-loop
      await promptPlayerMove(compMoveResult);
      // Check for win condition
      // eslint-disable-next-line no-await-in-loop
      gameOver = await checkWinCondition();
      if (gameOver) break;

      // Computer makes a move
      // eslint-disable-next-line no-await-in-loop
      compMoveResult = await computerMove(humanPlayerGameboard, compPlayer);
      console.log("Computer's move ->");
      console.dir(compMoveResult);
      // Check for win condition
      // eslint-disable-next-line no-await-in-loop
      gameOver = await checkWinCondition();
    }

    // Game over logic
    concludeGame();
  };
  return {
    handleSetup,
    playGame
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
  constructor(shipType) {
    super(`Ship allocation limit reached. Ship type = ${shipType}.`);
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
  const setUp = () => {
    // Automatic placement for computer
    computerPlayer.placeShips();

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
      throw new _errors__WEBPACK_IMPORTED_MODULE_0__.ShipTypeAllocationReachedError(ship);
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

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
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

// Wait for the game to be setup with ship placements etc.
await actController.handleSetup();

// Once ready, call the playGame method
await actController.playGame();

// Console log the players
console.log(`Players: First player of type ${newGame.players.human.type}, second player of type ${newGame.players.computer.type}!`);
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } }, 1);

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
/******/ 	/* webpack/runtime/async module */
/******/ 	(() => {
/******/ 		var webpackQueues = typeof Symbol === "function" ? Symbol("webpack queues") : "__webpack_queues__";
/******/ 		var webpackExports = typeof Symbol === "function" ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 		var webpackError = typeof Symbol === "function" ? Symbol("webpack error") : "__webpack_error__";
/******/ 		var resolveQueue = (queue) => {
/******/ 			if(queue && queue.d < 1) {
/******/ 				queue.d = 1;
/******/ 				queue.forEach((fn) => (fn.r--));
/******/ 				queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 			}
/******/ 		}
/******/ 		var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 			if(dep !== null && typeof dep === "object") {
/******/ 				if(dep[webpackQueues]) return dep;
/******/ 				if(dep.then) {
/******/ 					var queue = [];
/******/ 					queue.d = 0;
/******/ 					dep.then((r) => {
/******/ 						obj[webpackExports] = r;
/******/ 						resolveQueue(queue);
/******/ 					}, (e) => {
/******/ 						obj[webpackError] = e;
/******/ 						resolveQueue(queue);
/******/ 					});
/******/ 					var obj = {};
/******/ 					obj[webpackQueues] = (fn) => (fn(queue));
/******/ 					return obj;
/******/ 				}
/******/ 			}
/******/ 			var ret = {};
/******/ 			ret[webpackQueues] = x => {};
/******/ 			ret[webpackExports] = dep;
/******/ 			return ret;
/******/ 		}));
/******/ 		__webpack_require__.a = (module, body, hasAwait) => {
/******/ 			var queue;
/******/ 			hasAwait && ((queue = []).d = -1);
/******/ 			var depQueues = new Set();
/******/ 			var exports = module.exports;
/******/ 			var currentDeps;
/******/ 			var outerResolve;
/******/ 			var reject;
/******/ 			var promise = new Promise((resolve, rej) => {
/******/ 				reject = rej;
/******/ 				outerResolve = resolve;
/******/ 			});
/******/ 			promise[webpackExports] = exports;
/******/ 			promise[webpackQueues] = (fn) => (queue && fn(queue), depQueues.forEach(fn), promise["catch"](x => {}));
/******/ 			module.exports = promise;
/******/ 			body((deps) => {
/******/ 				currentDeps = wrapDeps(deps);
/******/ 				var fn;
/******/ 				var getResult = () => (currentDeps.map((d) => {
/******/ 					if(d[webpackError]) throw d[webpackError];
/******/ 					return d[webpackExports];
/******/ 				}))
/******/ 				var promise = new Promise((resolve) => {
/******/ 					fn = () => (resolve(getResult));
/******/ 					fn.r = 0;
/******/ 					var fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
/******/ 					currentDeps.map((dep) => (dep[webpackQueues](fnQueue)));
/******/ 				});
/******/ 				return fn.r ? promise : getResult();
/******/ 			}, (err) => ((err ? reject(promise[webpackError] = err) : outerResolve(exports)), resolveQueue(queue)));
/******/ 			queue && queue.d < 0 && (queue.d = 0);
/******/ 		};
/******/ 	})();
/******/ 	
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
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBb0M7QUFFcEMsTUFBTTtFQUFFQztBQUFLLENBQUMsR0FBR0Qsc0RBQVMsQ0FBQyxDQUFDO0FBRTVCLE1BQU1FLFlBQVksR0FBRyxDQUNuQjtFQUFFQyxRQUFRLEVBQUUsU0FBUztFQUFFQyxVQUFVLEVBQUU7QUFBRSxDQUFDLEVBQ3RDO0VBQUVELFFBQVEsRUFBRSxZQUFZO0VBQUVDLFVBQVUsRUFBRTtBQUFFLENBQUMsRUFDekM7RUFBRUQsUUFBUSxFQUFFLFdBQVc7RUFBRUMsVUFBVSxFQUFFO0FBQUUsQ0FBQyxFQUN4QztFQUFFRCxRQUFRLEVBQUUsU0FBUztFQUFFQyxVQUFVLEVBQUU7QUFBRSxDQUFDLEVBQ3RDO0VBQUVELFFBQVEsRUFBRSxXQUFXO0VBQUVDLFVBQVUsRUFBRTtBQUFFLENBQUMsQ0FDekM7QUFFRCxJQUFJQyxrQkFBa0IsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUM5QixJQUFJQyxXQUFXO0FBQ2YsSUFBSUMsZUFBZSxHQUFHLElBQUksQ0FBQyxDQUFDOztBQUU1QixNQUFNQyxjQUFjLEdBQUc7RUFDckJDLE1BQU0sRUFDSiwwUUFBMFE7RUFDNVFDLFVBQVUsRUFBRTtBQUNkLENBQUM7QUFFRCxNQUFNQyxhQUFhLEdBQUc7RUFDcEJGLE1BQU0sRUFDSixrSUFBa0k7RUFDcElDLFVBQVUsRUFBRTtBQUNkLENBQUM7QUFFRCxNQUFNRSxVQUFVLEdBQUc7RUFDakJILE1BQU0sRUFBRSxpQkFBaUI7RUFDekJDLFVBQVUsRUFBRTtBQUNkLENBQUM7QUFFRCxNQUFNRyxjQUFjLEdBQUdBLENBQUNDLE9BQU8sRUFBRUMsTUFBTSxLQUFLO0VBQzFDO0VBQ0EsTUFBTUMsS0FBSyxHQUFHRCxNQUFNLEdBQUcsQ0FBQ0QsT0FBTyxDQUFDLEdBQUdBLE9BQU8sQ0FBQ0csS0FBSyxDQUFDLEdBQUcsQ0FBQztFQUNyRCxJQUFJLENBQUNGLE1BQU0sSUFBSUMsS0FBSyxDQUFDRSxNQUFNLEtBQUssQ0FBQyxFQUFFO0lBQ2pDLE1BQU0sSUFBSUMsS0FBSyxDQUNiLDJFQUNGLENBQUM7RUFDSDs7RUFFQTtFQUNBLE1BQU1DLFlBQVksR0FBR0osS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDSyxXQUFXLENBQUMsQ0FBQztFQUMzQyxJQUFJRCxZQUFZLENBQUNGLE1BQU0sR0FBRyxDQUFDLElBQUlFLFlBQVksQ0FBQ0YsTUFBTSxHQUFHLENBQUMsRUFBRTtJQUN0RCxNQUFNLElBQUlDLEtBQUssQ0FBQyx3REFBd0QsQ0FBQztFQUMzRTs7RUFFQTtFQUNBLE1BQU1HLGtCQUFrQixHQUFHckIsSUFBSSxDQUFDc0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3hDLElBQUksQ0FBQ0Qsa0JBQWtCLENBQUNFLFFBQVEsQ0FBQ0osWUFBWSxDQUFDLEVBQUU7SUFDOUMsTUFBTSxJQUFJRCxLQUFLLENBQ2IsOERBQ0YsQ0FBQztFQUNIO0VBRUEsTUFBTU0sTUFBTSxHQUFHO0lBQUVMO0VBQWEsQ0FBQztFQUUvQixJQUFJLENBQUNMLE1BQU0sRUFBRTtJQUNYO0lBQ0EsTUFBTVcsV0FBVyxHQUFHVixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUNXLFdBQVcsQ0FBQyxDQUFDO0lBQzFDLElBQUlELFdBQVcsS0FBSyxHQUFHLElBQUlBLFdBQVcsS0FBSyxHQUFHLEVBQUU7TUFDOUMsTUFBTSxJQUFJUCxLQUFLLENBQ2IsNkVBQ0YsQ0FBQztJQUNIO0lBRUFNLE1BQU0sQ0FBQ0MsV0FBVyxHQUFHQSxXQUFXO0VBQ2xDOztFQUVBO0VBQ0EsT0FBT0QsTUFBTTtBQUNmLENBQUM7O0FBRUQ7QUFDQSxNQUFNRyxZQUFZLEdBQUdBLENBQUNDLE9BQU8sRUFBRUMsSUFBSSxLQUFLO0VBQ3RDO0VBQ0EsTUFBTUMsTUFBTSxHQUFHQyxRQUFRLENBQUNDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQzs7RUFFeEQ7RUFDQSxNQUFNQyxjQUFjLEdBQUdGLFFBQVEsQ0FBQ0csYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7RUFDdERELGNBQWMsQ0FBQ0UsV0FBVyxHQUFHUCxPQUFPLENBQUMsQ0FBQzs7RUFFdEM7RUFDQSxRQUFRQyxJQUFJO0lBQ1YsS0FBSyxPQUFPO01BQ1ZJLGNBQWMsQ0FBQ0csU0FBUyxDQUFDQyxHQUFHLENBQUMsZUFBZSxDQUFDO01BQzdDO0lBQ0YsS0FBSyxNQUFNO01BQ1RKLGNBQWMsQ0FBQ0csU0FBUyxDQUFDQyxHQUFHLENBQUMsaUJBQWlCLENBQUM7TUFDL0M7SUFDRixLQUFLLE9BQU87TUFDVkosY0FBYyxDQUFDRyxTQUFTLENBQUNDLEdBQUcsQ0FBQyxjQUFjLENBQUM7TUFDNUM7SUFDRjtNQUNFSixjQUFjLENBQUNHLFNBQVMsQ0FBQ0MsR0FBRyxDQUFDLGVBQWUsQ0FBQztJQUFFO0VBQ25EO0VBRUFQLE1BQU0sQ0FBQ1EsV0FBVyxDQUFDTCxjQUFjLENBQUMsQ0FBQyxDQUFDOztFQUVwQztFQUNBSCxNQUFNLENBQUNTLFNBQVMsR0FBR1QsTUFBTSxDQUFDVSxZQUFZLENBQUMsQ0FBQztBQUMxQyxDQUFDOztBQUVEO0FBQ0EsTUFBTUMsMEJBQTBCLEdBQUdBLENBQUN2QyxRQUFRLEVBQUVpQixZQUFZLEVBQUVNLFdBQVcsS0FBSztFQUMxRTtFQUNBLE1BQU1pQixVQUFVLEdBQUdqQixXQUFXLEtBQUssR0FBRyxHQUFHLGNBQWMsR0FBRyxZQUFZO0VBQ3RFO0VBQ0EsTUFBTUcsT0FBTyxHQUFJLEdBQUUxQixRQUFRLENBQUN5QyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUN2QixXQUFXLENBQUMsQ0FBQyxHQUFHbEIsUUFBUSxDQUFDMEMsS0FBSyxDQUFDLENBQUMsQ0FBRSxjQUFhekIsWUFBYSxXQUFVdUIsVUFBVyxFQUFDO0VBRXhIRyxPQUFPLENBQUNDLEdBQUcsQ0FBRSxHQUFFbEIsT0FBUSxFQUFDLENBQUM7RUFFekJELFlBQVksQ0FBRSxLQUFJQyxPQUFRLEVBQUMsRUFBRSxPQUFPLENBQUM7O0VBRXJDO0VBQ0FHLFFBQVEsQ0FBQ0MsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDZSxLQUFLLEdBQUcsRUFBRTtBQUNyRCxDQUFDOztBQUVEO0FBQ0EsTUFBTUMscUJBQXFCLEdBQUlDLGFBQWEsSUFBSztFQUMvQztFQUNBLE1BQU1yQixPQUFPLEdBQUksT0FBTXFCLGFBQWEsQ0FBQ0MsTUFBTyx5QkFBd0JELGFBQWEsQ0FBQ0UsR0FBRyxHQUFHLEtBQUssR0FBRyxNQUFPLEdBQUU7RUFFekdOLE9BQU8sQ0FBQ0MsR0FBRyxDQUFFLEdBQUVsQixPQUFRLEVBQUMsQ0FBQztFQUV6QkQsWUFBWSxDQUFFLEtBQUlDLE9BQVEsRUFBQyxFQUFFcUIsYUFBYSxDQUFDRSxHQUFHLEdBQUcsT0FBTyxHQUFHLE1BQU0sQ0FBQzs7RUFFbEU7RUFDQXBCLFFBQVEsQ0FBQ0MsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDZSxLQUFLLEdBQUcsRUFBRTtBQUNyRCxDQUFDO0FBRUQsTUFBTUssZUFBZSxHQUFHQSxDQUFDQyxLQUFLLEVBQUVuRCxRQUFRLEtBQUs7RUFDM0MsSUFBSUEsUUFBUSxFQUFFO0lBQ1o7SUFDQTJDLE9BQU8sQ0FBQ1EsS0FBSyxDQUFFLGlCQUFnQm5ELFFBQVMsZUFBY21ELEtBQUssQ0FBQ3pCLE9BQVEsR0FBRSxDQUFDO0lBRXZFRCxZQUFZLENBQUUsbUJBQWtCekIsUUFBUyxLQUFJbUQsS0FBSyxDQUFDekIsT0FBUSxFQUFDLEVBQUUsT0FBTyxDQUFDO0VBQ3hFLENBQUMsTUFBTTtJQUNMO0lBQ0FpQixPQUFPLENBQUNDLEdBQUcsQ0FBRSxnQ0FBK0JPLEtBQUssQ0FBQ3pCLE9BQVEsR0FBRSxDQUFDO0lBRTdERCxZQUFZLENBQUUsa0NBQWlDMEIsS0FBSyxDQUFDekIsT0FBUSxHQUFFLEVBQUUsT0FBTyxDQUFDO0VBQzNFOztFQUVBO0VBQ0FHLFFBQVEsQ0FBQ0MsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDZSxLQUFLLEdBQUcsRUFBRTtBQUNyRCxDQUFDOztBQUVEO0FBQ0EsTUFBTU8sYUFBYSxHQUFJQyxTQUFTLElBQUs7RUFDbkM7RUFDQUEsU0FBUyxDQUFDQyxhQUFhLENBQUMsQ0FBQzs7RUFFekI7RUFDQUQsU0FBUyxDQUFDRSxlQUFlLENBQUMsVUFBVSxDQUFDO0VBQ3JDRixTQUFTLENBQUNFLGVBQWUsQ0FBQyxTQUFTLENBQUM7QUFDdEMsQ0FBQzs7QUFFRDtBQUNBLFNBQVNDLGtCQUFrQkEsQ0FBQ0MsU0FBUyxFQUFFeEQsVUFBVSxFQUFFc0IsV0FBVyxFQUFFO0VBQzlELE1BQU1tQyxPQUFPLEdBQUcsRUFBRTtFQUNsQixNQUFNQyxRQUFRLEdBQUdGLFNBQVMsQ0FBQ0csVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQ0EsVUFBVSxDQUFDLENBQUMsQ0FBQztFQUM1RCxNQUFNQyxRQUFRLEdBQUdDLFFBQVEsQ0FBQ0wsU0FBUyxDQUFDTSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztFQUV6RCxLQUFLLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRy9ELFVBQVUsRUFBRStELENBQUMsRUFBRSxFQUFFO0lBQ25DLElBQUl6QyxXQUFXLEtBQUssR0FBRyxFQUFFO01BQ3ZCLElBQUlzQyxRQUFRLEdBQUdHLENBQUMsSUFBSWxFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQ2lCLE1BQU0sRUFBRSxNQUFNLENBQUM7TUFDM0MyQyxPQUFPLENBQUNPLElBQUksQ0FDVCxHQUFFQyxNQUFNLENBQUNDLFlBQVksQ0FBQ1IsUUFBUSxHQUFHLEdBQUcsQ0FBQ0MsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFFLEdBQUVDLFFBQVEsR0FBR0csQ0FBQyxHQUFHLENBQUUsRUFDMUUsQ0FBQztJQUNILENBQUMsTUFBTTtNQUNMLElBQUlMLFFBQVEsR0FBR0ssQ0FBQyxJQUFJbEUsSUFBSSxDQUFDaUIsTUFBTSxFQUFFLE1BQU0sQ0FBQztNQUN4QzJDLE9BQU8sQ0FBQ08sSUFBSSxDQUNULEdBQUVDLE1BQU0sQ0FBQ0MsWUFBWSxDQUFDUixRQUFRLEdBQUdLLENBQUMsR0FBRyxHQUFHLENBQUNKLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBRSxHQUFFQyxRQUFRLEdBQUcsQ0FBRSxFQUMxRSxDQUFDO0lBQ0g7RUFDRjtFQUVBLE9BQU9ILE9BQU87QUFDaEI7O0FBRUE7QUFDQSxTQUFTVSxjQUFjQSxDQUFDVixPQUFPLEVBQUU7RUFDL0JBLE9BQU8sQ0FBQ1csT0FBTyxDQUFFQyxNQUFNLElBQUs7SUFDMUIsTUFBTUMsV0FBVyxHQUFHMUMsUUFBUSxDQUFDMkMsYUFBYSxDQUFFLG1CQUFrQkYsTUFBTyxJQUFHLENBQUM7SUFDekUsSUFBSUMsV0FBVyxFQUFFO01BQ2ZBLFdBQVcsQ0FBQ3JDLFNBQVMsQ0FBQ0MsR0FBRyxDQUFDLGVBQWUsQ0FBQztJQUM1QztFQUNGLENBQUMsQ0FBQztBQUNKOztBQUVBO0FBQ0EsU0FBU3NDLGNBQWNBLENBQUNmLE9BQU8sRUFBRTtFQUMvQkEsT0FBTyxDQUFDVyxPQUFPLENBQUVDLE1BQU0sSUFBSztJQUMxQixNQUFNQyxXQUFXLEdBQUcxQyxRQUFRLENBQUMyQyxhQUFhLENBQUUsbUJBQWtCRixNQUFPLElBQUcsQ0FBQztJQUN6RSxJQUFJQyxXQUFXLEVBQUU7TUFDZkEsV0FBVyxDQUFDckMsU0FBUyxDQUFDd0MsTUFBTSxDQUFDLGVBQWUsQ0FBQztJQUMvQztFQUNGLENBQUMsQ0FBQztBQUNKOztBQUVBO0FBQ0EsU0FBU0MsaUJBQWlCQSxDQUFBLEVBQUc7RUFDM0J6RSxrQkFBa0IsR0FBR0Esa0JBQWtCLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO0VBQzNEO0FBQ0Y7QUFFQSxNQUFNMEUsb0JBQW9CLEdBQUlDLENBQUMsSUFBSztFQUNsQyxNQUFNQyxJQUFJLEdBQUdELENBQUMsQ0FBQ0UsTUFBTTtFQUNyQixJQUNFRCxJQUFJLENBQUM1QyxTQUFTLENBQUM4QyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsSUFDekNGLElBQUksQ0FBQ0csT0FBTyxDQUFDakMsTUFBTSxLQUFLLE9BQU8sRUFDL0I7SUFDQTtJQUNBLE1BQU1rQyxPQUFPLEdBQUdKLElBQUksQ0FBQ0csT0FBTyxDQUFDRSxRQUFRO0lBQ3JDL0UsZUFBZSxHQUFHOEUsT0FBTztJQUN6QixNQUFNRSxnQkFBZ0IsR0FBRzVCLGtCQUFrQixDQUN6QzBCLE9BQU8sRUFDUC9FLFdBQVcsQ0FBQ0YsVUFBVSxFQUN0QkMsa0JBQ0YsQ0FBQztJQUNEa0UsY0FBYyxDQUFDZ0IsZ0JBQWdCLENBQUM7RUFDbEM7QUFDRixDQUFDO0FBRUQsTUFBTUMsZ0JBQWdCLEdBQUlSLENBQUMsSUFBSztFQUM5QixNQUFNQyxJQUFJLEdBQUdELENBQUMsQ0FBQ0UsTUFBTTtFQUNyQixJQUFJRCxJQUFJLENBQUM1QyxTQUFTLENBQUM4QyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtJQUM3QztJQUNBLE1BQU1FLE9BQU8sR0FBR0osSUFBSSxDQUFDRyxPQUFPLENBQUNFLFFBQVE7SUFDckMsSUFBSUQsT0FBTyxLQUFLOUUsZUFBZSxFQUFFO01BQy9CLE1BQU1rRixZQUFZLEdBQUc5QixrQkFBa0IsQ0FDckMwQixPQUFPLEVBQ1AvRSxXQUFXLENBQUNGLFVBQVUsRUFDdEJDLGtCQUNGLENBQUM7TUFDRHVFLGNBQWMsQ0FBQ2EsWUFBWSxDQUFDO01BQzVCbEYsZUFBZSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzFCO0lBQ0FBLGVBQWUsR0FBRyxJQUFJO0VBQ3hCO0FBQ0YsQ0FBQztBQUVELE1BQU1tRix1QkFBdUIsR0FBSVYsQ0FBQyxJQUFLO0VBQ3JDLElBQUlBLENBQUMsQ0FBQ1csR0FBRyxLQUFLLEdBQUcsSUFBSXBGLGVBQWUsRUFBRTtJQUNwQztJQUNBeUUsQ0FBQyxDQUFDWSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7O0lBRXBCO0lBQ0FkLGlCQUFpQixDQUFDLENBQUM7O0lBRW5CO0lBQ0E7SUFDQSxNQUFNZSxlQUFlLEdBQUdsQyxrQkFBa0IsQ0FDeENwRCxlQUFlLEVBQ2ZELFdBQVcsQ0FBQ0YsVUFBVSxFQUN0QkMsa0JBQWtCLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUNyQyxDQUFDO0lBQ0R1RSxjQUFjLENBQUNpQixlQUFlLENBQUM7O0lBRS9CO0lBQ0EsTUFBTUMsbUJBQW1CLEdBQUduQyxrQkFBa0IsQ0FDNUNwRCxlQUFlLEVBQ2ZELFdBQVcsQ0FBQ0YsVUFBVSxFQUN0QkMsa0JBQ0YsQ0FBQztJQUNEa0UsY0FBYyxDQUFDdUIsbUJBQW1CLENBQUM7RUFDckM7QUFDRixDQUFDO0FBRUQsU0FBU0MsNEJBQTRCQSxDQUFBLEVBQUc7RUFDdEMvRCxRQUFRLENBQ0xnRSxnQkFBZ0IsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUMzRHhCLE9BQU8sQ0FBRVMsSUFBSSxJQUFLO0lBQ2pCQSxJQUFJLENBQUM1QyxTQUFTLENBQUN3QyxNQUFNLENBQUMscUJBQXFCLEVBQUUsZ0JBQWdCLENBQUM7SUFDOURJLElBQUksQ0FBQzVDLFNBQVMsQ0FBQ3dDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQztJQUM1Q0ksSUFBSSxDQUFDNUMsU0FBUyxDQUFDQyxHQUFHLENBQUMscUJBQXFCLENBQUM7RUFDM0MsQ0FBQyxDQUFDO0FBQ047QUFFQSxTQUFTMkQsNkJBQTZCQSxDQUFBLEVBQUc7RUFDdkNqRSxRQUFRLENBQ0xnRSxnQkFBZ0IsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUMzRHhCLE9BQU8sQ0FBRVMsSUFBSSxJQUFLO0lBQ2pCQSxJQUFJLENBQUM1QyxTQUFTLENBQUNDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxnQkFBZ0IsQ0FBQztJQUMzRDJDLElBQUksQ0FBQzVDLFNBQVMsQ0FBQ3dDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQztFQUM5QyxDQUFDLENBQUM7QUFDTjtBQUVBLFNBQVNxQiwwQkFBMEJBLENBQUEsRUFBRztFQUNwQ2xFLFFBQVEsQ0FDTGdFLGdCQUFnQixDQUFDLHNDQUFzQyxDQUFDLENBQ3hEeEIsT0FBTyxDQUFFUyxJQUFJLElBQUs7SUFDakJBLElBQUksQ0FBQzVDLFNBQVMsQ0FBQ0MsR0FBRyxDQUFDLHFCQUFxQixFQUFFLGdCQUFnQixDQUFDO0lBQzNEMkMsSUFBSSxDQUFDNUMsU0FBUyxDQUFDd0MsTUFBTSxDQUFDLHFCQUFxQixDQUFDO0VBQzlDLENBQUMsQ0FBQztBQUNOO0FBRUEsU0FBU3NCLDBCQUEwQkEsQ0FBQSxFQUFHO0VBQ3BDO0VBQ0FELDBCQUEwQixDQUFDLENBQUM7O0VBRTVCO0VBQ0FILDRCQUE0QixDQUFDLENBQUM7QUFDaEM7O0FBRUE7QUFDQSxNQUFNSywwQkFBMEIsR0FBR0EsQ0FBQSxLQUFNO0VBQ3ZDSCw2QkFBNkIsQ0FBQyxDQUFDO0VBQy9CakUsUUFBUSxDQUNMZ0UsZ0JBQWdCLENBQUMsc0NBQXNDLENBQUMsQ0FDeER4QixPQUFPLENBQUVTLElBQUksSUFBSztJQUNqQkEsSUFBSSxDQUFDb0IsZ0JBQWdCLENBQUMsWUFBWSxFQUFFdEIsb0JBQW9CLENBQUM7SUFDekRFLElBQUksQ0FBQ29CLGdCQUFnQixDQUFDLFlBQVksRUFBRWIsZ0JBQWdCLENBQUM7RUFDdkQsQ0FBQyxDQUFDO0VBQ0o7RUFDQSxNQUFNYyxhQUFhLEdBQUd0RSxRQUFRLENBQUMyQyxhQUFhLENBQzFDLHdDQUNGLENBQUM7RUFDRDtFQUNBO0VBQ0EyQixhQUFhLENBQUNELGdCQUFnQixDQUFDLFlBQVksRUFBRSxNQUFNO0lBQ2pEckUsUUFBUSxDQUFDcUUsZ0JBQWdCLENBQUMsU0FBUyxFQUFFWCx1QkFBdUIsQ0FBQztFQUMvRCxDQUFDLENBQUM7RUFDRlksYUFBYSxDQUFDRCxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsTUFBTTtJQUNqRHJFLFFBQVEsQ0FBQ3VFLG1CQUFtQixDQUFDLFNBQVMsRUFBRWIsdUJBQXVCLENBQUM7RUFDbEUsQ0FBQyxDQUFDO0FBQ0osQ0FBQzs7QUFFRDtBQUNBLE1BQU1jLHFCQUFxQixHQUFHQSxDQUFBLEtBQU07RUFDbEN4RSxRQUFRLENBQ0xnRSxnQkFBZ0IsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUN4RHhCLE9BQU8sQ0FBRVMsSUFBSSxJQUFLO0lBQ2pCQSxJQUFJLENBQUNzQixtQkFBbUIsQ0FBQyxZQUFZLEVBQUV4QixvQkFBb0IsQ0FBQztJQUM1REUsSUFBSSxDQUFDc0IsbUJBQW1CLENBQUMsWUFBWSxFQUFFZixnQkFBZ0IsQ0FBQztFQUMxRCxDQUFDLENBQUM7RUFDSjtFQUNBLE1BQU1jLGFBQWEsR0FBR3RFLFFBQVEsQ0FBQzJDLGFBQWEsQ0FDMUMsd0NBQ0YsQ0FBQztFQUNEO0VBQ0E7RUFDQTJCLGFBQWEsQ0FBQ0MsbUJBQW1CLENBQUMsWUFBWSxFQUFFLE1BQU07SUFDcER2RSxRQUFRLENBQUNxRSxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUVYLHVCQUF1QixDQUFDO0VBQy9ELENBQUMsQ0FBQztFQUNGWSxhQUFhLENBQUNDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxNQUFNO0lBQ3BEdkUsUUFBUSxDQUFDdUUsbUJBQW1CLENBQUMsU0FBUyxFQUFFYix1QkFBdUIsQ0FBQztFQUNsRSxDQUFDLENBQUM7RUFDRjtFQUNBMUQsUUFBUSxDQUFDdUUsbUJBQW1CLENBQUMsU0FBUyxFQUFFYix1QkFBdUIsQ0FBQztBQUNsRSxDQUFDOztBQUVEO0FBQ0EsTUFBTWUsU0FBUyxHQUFHQSxDQUFDakQsU0FBUyxFQUFFa0QsSUFBSSxLQUFLO0VBQ3JDO0VBQ0E7RUFDQUEsSUFBSSxDQUFDQyxLQUFLLENBQUMsQ0FBQzs7RUFFWjtFQUNBbkQsU0FBUyxDQUFDb0QsYUFBYSxDQUFDO0lBQUVoRyxVQUFVO0lBQUVEO0VBQWMsQ0FBQyxDQUFDO0FBQ3hELENBQUM7QUFFRCxNQUFNa0csZUFBZSxHQUFJN0IsQ0FBQyxJQUFLO0VBQzdCO0VBQ0EsTUFBTTtJQUFFTTtFQUFTLENBQUMsR0FBR04sQ0FBQyxDQUFDRSxNQUFNLENBQUM0QixJQUFJO0FBQ3BDLENBQUM7O0FBRUQ7QUFDQSxNQUFNQywyQkFBMkIsR0FBR0EsQ0FBQSxLQUFNO0VBQ3hDO0VBQ0FoQiw0QkFBNEIsQ0FBQyxDQUFDOztFQUU5QjtFQUNBO0VBQ0EvRCxRQUFRLENBQ0xnRSxnQkFBZ0IsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUMzRHhCLE9BQU8sQ0FBRVMsSUFBSSxJQUFLO0lBQ2pCQSxJQUFJLENBQUNvQixnQkFBZ0IsQ0FBQyxPQUFPLEVBQUVRLGVBQWUsQ0FBQztFQUNqRCxDQUFDLENBQUM7QUFDTixDQUFDO0FBRUQsZUFBZUcsVUFBVUEsQ0FBQSxFQUFHO0VBQzFCO0VBQ0E7QUFBQTtBQUdGLGVBQWVDLFlBQVlBLENBQUNDLG9CQUFvQixFQUFFQyxVQUFVLEVBQUU7RUFDNUQsSUFBSUMsY0FBYztFQUNsQixJQUFJO0lBQ0Y7SUFDQTtJQUNBQSxjQUFjLEdBQUdELFVBQVUsQ0FBQ0UsUUFBUSxDQUFDSCxvQkFBb0IsQ0FBQztFQUM1RCxDQUFDLENBQUMsT0FBTzVELEtBQUssRUFBRTtJQUNkRCxlQUFlLENBQUNDLEtBQUssQ0FBQztFQUN4QjtFQUNBLE9BQU84RCxjQUFjO0FBQ3ZCO0FBRUEsZUFBZUUsaUJBQWlCQSxDQUFBLEVBQUc7RUFDakM7RUFDQTtBQUFBO0FBR0YsU0FBU0MsWUFBWUEsQ0FBQSxFQUFHO0VBQ3RCO0FBQUE7QUFHRixNQUFNQyxnQkFBZ0IsR0FBR0EsQ0FBQ2hFLFNBQVMsRUFBRWtELElBQUksS0FBSztFQUM1QyxNQUFNZSxXQUFXLEdBQUdmLElBQUksQ0FBQ2dCLE9BQU8sQ0FBQ0MsS0FBSztFQUN0QyxNQUFNVCxvQkFBb0IsR0FBR08sV0FBVyxDQUFDRyxTQUFTO0VBQ2xELE1BQU1ULFVBQVUsR0FBR1QsSUFBSSxDQUFDZ0IsT0FBTyxDQUFDRyxRQUFRO0VBQ3hDLE1BQU1DLG1CQUFtQixHQUFHWCxVQUFVLENBQUNTLFNBQVM7O0VBRWhEO0VBQ0EsU0FBU0csbUJBQW1CQSxDQUFDQyxlQUFlLEVBQUVDLFVBQVUsRUFBRTtJQUN4RDtJQUNBLE1BQU1DLGdCQUFnQixHQUFHLEVBQUU7SUFFM0IsTUFBTUMsbUJBQW1CLEdBQUduRyxRQUFRLENBQUNDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQztJQUNyRSxNQUFNbUcsWUFBWSxHQUFHcEcsUUFBUSxDQUFDQyxjQUFjLENBQUMsZUFBZSxDQUFDO0lBRTdELE1BQU1vRyxhQUFhLEdBQUdBLENBQUEsS0FBTTtNQUMxQixNQUFNQyxLQUFLLEdBQUdGLFlBQVksQ0FBQ3BGLEtBQUs7TUFDaENnRixlQUFlLENBQUNNLEtBQUssQ0FBQztNQUN0QkYsWUFBWSxDQUFDcEYsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRCxNQUFNdUYsZUFBZSxHQUFJdkQsQ0FBQyxJQUFLO01BQzdCLElBQUlBLENBQUMsQ0FBQ1csR0FBRyxLQUFLLE9BQU8sRUFBRTtRQUNyQjBDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUNuQjtJQUNGLENBQUM7SUFFREYsbUJBQW1CLENBQUM5QixnQkFBZ0IsQ0FBQyxPQUFPLEVBQUVnQyxhQUFhLENBQUM7SUFDNURELFlBQVksQ0FBQy9CLGdCQUFnQixDQUFDLFVBQVUsRUFBRWtDLGVBQWUsQ0FBQzs7SUFFMUQ7SUFDQUwsZ0JBQWdCLENBQUM5RCxJQUFJLENBQUMsTUFBTTtNQUMxQitELG1CQUFtQixDQUFDNUIsbUJBQW1CLENBQUMsT0FBTyxFQUFFOEIsYUFBYSxDQUFDO01BQy9ERCxZQUFZLENBQUM3QixtQkFBbUIsQ0FBQyxVQUFVLEVBQUVnQyxlQUFlLENBQUM7SUFDL0QsQ0FBQyxDQUFDOztJQUVGO0lBQ0F2RyxRQUFRLENBQ0xnRSxnQkFBZ0IsQ0FBRSwrQkFBOEJpQyxVQUFXLEdBQUUsQ0FBQyxDQUM5RHpELE9BQU8sQ0FBRVMsSUFBSSxJQUFLO01BQ2pCLE1BQU11RCxZQUFZLEdBQUdBLENBQUEsS0FBTTtRQUN6QixNQUFNO1VBQUVsRDtRQUFTLENBQUMsR0FBR0wsSUFBSSxDQUFDRyxPQUFPO1FBQ2pDLElBQUlrRCxLQUFLO1FBQ1QsSUFBSUwsVUFBVSxLQUFLLE9BQU8sRUFBRTtVQUMxQkssS0FBSyxHQUFJLEdBQUVoRCxRQUFTLElBQUdqRixrQkFBbUIsRUFBQztRQUM3QyxDQUFDLE1BQU0sSUFBSTRILFVBQVUsS0FBSyxVQUFVLEVBQUU7VUFDcENLLEtBQUssR0FBR2hELFFBQVE7UUFDbEIsQ0FBQyxNQUFNO1VBQ0wsTUFBTSxJQUFJbkUsS0FBSyxDQUNiLG9EQUNGLENBQUM7UUFDSDtRQUNBMkIsT0FBTyxDQUFDQyxHQUFHLENBQUUsd0JBQXVCdUYsS0FBTSxFQUFDLENBQUM7UUFDNUNOLGVBQWUsQ0FBQ00sS0FBSyxDQUFDO01BQ3hCLENBQUM7TUFDRHJELElBQUksQ0FBQ29CLGdCQUFnQixDQUFDLE9BQU8sRUFBRW1DLFlBQVksQ0FBQzs7TUFFNUM7TUFDQU4sZ0JBQWdCLENBQUM5RCxJQUFJLENBQUMsTUFDcEJhLElBQUksQ0FBQ3NCLG1CQUFtQixDQUFDLE9BQU8sRUFBRWlDLFlBQVksQ0FDaEQsQ0FBQztJQUNILENBQUMsQ0FBQzs7SUFFSjtJQUNBLE9BQU8sTUFBTU4sZ0JBQWdCLENBQUMxRCxPQUFPLENBQUVpRSxPQUFPLElBQUtBLE9BQU8sQ0FBQyxDQUFDLENBQUM7RUFDL0Q7RUFFQSxlQUFlQyxrQkFBa0JBLENBQUN2SSxRQUFRLEVBQUU7SUFDMUMsT0FBTyxJQUFJd0ksT0FBTyxDQUFDLENBQUNDLE9BQU8sRUFBRUMsTUFBTSxLQUFLO01BQ3RDO01BQ0F2SSxXQUFXLEdBQUdKLFlBQVksQ0FBQzRJLElBQUksQ0FBRUMsSUFBSSxJQUFLQSxJQUFJLENBQUM1SSxRQUFRLEtBQUtBLFFBQVEsQ0FBQzs7TUFFckU7TUFDQSxNQUFNNkksZUFBZSxHQUFHO1FBQ3RCdkksTUFBTSxFQUFHLGNBQWFOLFFBQVMsR0FBRTtRQUNqQ08sVUFBVSxFQUFFO01BQ2QsQ0FBQztNQUNEOEMsU0FBUyxDQUFDb0QsYUFBYSxDQUFDO1FBQUVvQyxlQUFlO1FBQUV4STtNQUFlLENBQUMsQ0FBQztNQUU1RCxNQUFNeUksZ0JBQWdCLEdBQUcsTUFBT1gsS0FBSyxJQUFLO1FBQ3hDLElBQUk7VUFDRixNQUFNO1lBQUVsSCxZQUFZO1lBQUVNO1VBQVksQ0FBQyxHQUFHYixjQUFjLENBQUN5SCxLQUFLLEVBQUUsS0FBSyxDQUFDO1VBQ2xFLE1BQU1wQixvQkFBb0IsQ0FBQ2dDLFNBQVMsQ0FDbEMvSSxRQUFRLEVBQ1JpQixZQUFZLEVBQ1pNLFdBQ0YsQ0FBQztVQUNEZ0IsMEJBQTBCLENBQUN2QyxRQUFRLEVBQUVpQixZQUFZLEVBQUVNLFdBQVcsQ0FBQztVQUMvRDtVQUNBLE1BQU0rRCxZQUFZLEdBQUc5QixrQkFBa0IsQ0FDckN2QyxZQUFZLEVBQ1pkLFdBQVcsQ0FBQ0YsVUFBVSxFQUN0QnNCLFdBQ0YsQ0FBQztVQUNEa0QsY0FBYyxDQUFDYSxZQUFZLENBQUM7O1VBRTVCO1VBQ0FqQyxTQUFTLENBQUMyRixlQUFlLENBQUMxQixXQUFXLEVBQUV0SCxRQUFRLENBQUM7VUFDaERxRCxTQUFTLENBQUM0RixjQUFjLENBQUMzQixXQUFXLEVBQUV0SCxRQUFRLENBQUM7O1VBRS9DO1VBQ0FrSixvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsT0FBTy9GLEtBQUssRUFBRTtVQUNkRCxlQUFlLENBQUNDLEtBQUssRUFBRW5ELFFBQVEsQ0FBQztVQUNoQztRQUNGO01BQ0YsQ0FBQzs7TUFFRDtNQUNBLE1BQU1zSSxPQUFPLEdBQUdWLG1CQUFtQixDQUFDa0IsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDOztNQUU5RDtNQUNBLE1BQU1JLG9CQUFvQixHQUFHQSxDQUFBLEtBQU07UUFDakNaLE9BQU8sQ0FBQyxDQUFDO1FBQ1RHLE9BQU8sQ0FBQyxDQUFDO01BQ1gsQ0FBQztJQUNILENBQUMsQ0FBQztFQUNKOztFQUVBO0VBQ0EsZUFBZVUsc0JBQXNCQSxDQUFBLEVBQUc7SUFDdEMsS0FBSyxJQUFJbkYsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHakUsWUFBWSxDQUFDZ0IsTUFBTSxFQUFFaUQsQ0FBQyxFQUFFLEVBQUU7TUFDNUM7TUFDQSxNQUFNdUUsa0JBQWtCLENBQUN4SSxZQUFZLENBQUNpRSxDQUFDLENBQUMsQ0FBQ2hFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDdEQ7RUFDRjs7RUFFQTtFQUNBLE1BQU1vSixXQUFXLEdBQUcsTUFBQUEsQ0FBQSxLQUFZO0lBQzlCO0lBQ0FoRyxhQUFhLENBQUNDLFNBQVMsQ0FBQztJQUN4QjRDLDBCQUEwQixDQUFDLENBQUM7SUFDNUIsTUFBTWtELHNCQUFzQixDQUFDLENBQUM7SUFDOUI7SUFDQTlDLHFCQUFxQixDQUFDLENBQUM7SUFDdkIsTUFBTXpFLE1BQU0sR0FBR0MsUUFBUSxDQUFDQyxjQUFjLENBQUMsZ0JBQWdCLENBQUM7SUFDeERMLFlBQVksQ0FBQywwQ0FBMEMsQ0FBQztJQUN4RGtCLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDLHdDQUF3QyxDQUFDO0lBQ3JEb0QsMEJBQTBCLENBQUMsQ0FBQztJQUM1QjtJQUNBTSxTQUFTLENBQUNqRCxTQUFTLEVBQUVrRCxJQUFJLENBQUM7RUFDNUIsQ0FBQztFQUVELGVBQWU4QyxnQkFBZ0JBLENBQUNwQyxjQUFjLEVBQUU7SUFDOUMsT0FBTyxJQUFJdUIsT0FBTyxDQUFDLENBQUNDLE9BQU8sRUFBRUMsTUFBTSxLQUFLO01BQ3RDO01BQ0E7TUFDQSxJQUFJekIsY0FBYyxLQUFLcUMsU0FBUyxFQUFFO1FBQ2hDO1FBQ0F4RyxxQkFBcUIsQ0FBQ21FLGNBQWMsQ0FBQztNQUN2QztNQUVBdEUsT0FBTyxDQUFDQyxHQUFHLENBQUUsY0FBYSxDQUFDO01BRTNCLE1BQU0yRyxlQUFlLEdBQUcsTUFBT0MsSUFBSSxJQUFLO1FBQ3RDO1FBQ0EsSUFBSTtVQUNGLE1BQU07WUFBRXZJO1VBQWEsQ0FBQyxHQUFHUCxjQUFjLENBQUM4SSxJQUFJLEVBQUUsSUFBSSxDQUFDO1VBQ25EO1VBQ0EsTUFBTUMsZUFBZSxHQUFHLE1BQU1uQyxXQUFXLENBQUNKLFFBQVEsQ0FDaERTLG1CQUFtQixFQUNuQjFHLFlBQ0YsQ0FBQztVQUNEMEIsT0FBTyxDQUFDQyxHQUFHLENBQUUsdUNBQXNDNkcsZUFBZ0IsRUFBQyxDQUFDO1VBQ3JFOUcsT0FBTyxDQUFDK0csR0FBRyxDQUFDRCxlQUFlLENBQUM7O1VBRTVCO1VBQ0EzRyxxQkFBcUIsQ0FBQzJHLGVBQWUsQ0FBQzs7VUFFdEM7VUFDQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxPQUFPeEcsS0FBSyxFQUFFO1VBQ2RELGVBQWUsQ0FBQ0MsS0FBSyxDQUFDO1VBQ3RCO1FBQ0Y7TUFDRixDQUFDOztNQUVEO01BQ0EsTUFBTW1GLE9BQU8sR0FBR1YsbUJBQW1CLENBQUMyQixlQUFlLEVBQUUsVUFBVSxDQUFDOztNQUVoRTtNQUNBLE1BQU1JLFdBQVcsR0FBR0EsQ0FBQSxLQUFNO1FBQ3hCckIsT0FBTyxDQUFDLENBQUM7UUFDVEcsT0FBTyxDQUFDLENBQUM7TUFDWCxDQUFDO0lBQ0gsQ0FBQyxDQUFDO0VBQ0o7O0VBRUE7RUFDQSxNQUFNbUIsUUFBUSxHQUFHLE1BQUFBLENBQUEsS0FBWTtJQUMzQixJQUFJQyxRQUFRLEdBQUcsS0FBSztJQUNwQixJQUFJNUMsY0FBYztJQUVsQixPQUFPLENBQUM0QyxRQUFRLEVBQUU7TUFDaEJsSCxPQUFPLENBQUMrRyxHQUFHLENBQUNuRCxJQUFJLENBQUN1RCxhQUFhLENBQUM7TUFDL0I7TUFDQTtNQUNBLE1BQU1ULGdCQUFnQixDQUFDcEMsY0FBYyxDQUFDO01BQ3RDO01BQ0E7TUFDQTRDLFFBQVEsR0FBRyxNQUFNMUMsaUJBQWlCLENBQUMsQ0FBQztNQUNwQyxJQUFJMEMsUUFBUSxFQUFFOztNQUVkO01BQ0E7TUFDQTVDLGNBQWMsR0FBRyxNQUFNSCxZQUFZLENBQUNDLG9CQUFvQixFQUFFQyxVQUFVLENBQUM7TUFDckVyRSxPQUFPLENBQUNDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQztNQUNqQ0QsT0FBTyxDQUFDK0csR0FBRyxDQUFDekMsY0FBYyxDQUFDO01BQzNCO01BQ0E7TUFDQTRDLFFBQVEsR0FBRyxNQUFNMUMsaUJBQWlCLENBQUMsQ0FBQztJQUN0Qzs7SUFFQTtJQUNBQyxZQUFZLENBQUMsQ0FBQztFQUNoQixDQUFDO0VBRUQsT0FBTztJQUNMZ0MsV0FBVztJQUNYUTtFQUNGLENBQUM7QUFDSCxDQUFDO0FBRUQsaUVBQWV2QyxnQkFBZ0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN2bkIvQjs7QUFFQSxNQUFNMEMscUJBQXFCLFNBQVMvSSxLQUFLLENBQUM7RUFDeENnSixXQUFXQSxDQUFDdEksT0FBTyxHQUFHLHdCQUF3QixFQUFFO0lBQzlDLEtBQUssQ0FBQ0EsT0FBTyxDQUFDO0lBQ2QsSUFBSSxDQUFDdUksSUFBSSxHQUFHLHVCQUF1QjtFQUNyQztBQUNGO0FBRUEsTUFBTUMsMEJBQTBCLFNBQVNsSixLQUFLLENBQUM7RUFDN0NnSixXQUFXQSxDQUFDaEssUUFBUSxFQUFFO0lBQ3BCLEtBQUssQ0FBRSw4Q0FBNkNBLFFBQVMsR0FBRSxDQUFDO0lBQ2hFLElBQUksQ0FBQ2lLLElBQUksR0FBRyw0QkFBNEI7RUFDMUM7QUFDRjtBQUVBLE1BQU1FLDhCQUE4QixTQUFTbkosS0FBSyxDQUFDO0VBQ2pEZ0osV0FBV0EsQ0FBQ3RJLE9BQU8sR0FBRyxxQ0FBcUMsRUFBRTtJQUMzRCxLQUFLLENBQUNBLE9BQU8sQ0FBQztJQUNkLElBQUksQ0FBQ3VJLElBQUksR0FBRyxnQ0FBZ0M7RUFDOUM7QUFDRjtBQUVBLE1BQU1HLHNCQUFzQixTQUFTcEosS0FBSyxDQUFDO0VBQ3pDZ0osV0FBV0EsQ0FBQ3RJLE9BQU8sR0FBRyxzQkFBc0IsRUFBRTtJQUM1QyxLQUFLLENBQUNBLE9BQU8sQ0FBQztJQUNkLElBQUksQ0FBQ3VJLElBQUksR0FBRyx3QkFBd0I7RUFDdEM7QUFDRjtBQUVBLE1BQU1JLG9CQUFvQixTQUFTckosS0FBSyxDQUFDO0VBQ3ZDZ0osV0FBV0EsQ0FBQ3RJLE9BQU8sR0FBRyxvQkFBb0IsRUFBRTtJQUMxQyxLQUFLLENBQUNBLE9BQU8sQ0FBQztJQUNkLElBQUksQ0FBQ3VJLElBQUksR0FBRyxzQkFBc0I7RUFDcEM7QUFDRjtBQUVBLE1BQU1LLHNCQUFzQixTQUFTdEosS0FBSyxDQUFDO0VBQ3pDZ0osV0FBV0EsQ0FDVHRJLE9BQU8sR0FBRywrREFBK0QsRUFDekU7SUFDQSxLQUFLLENBQUNBLE9BQU8sQ0FBQztJQUNkLElBQUksQ0FBQ3VJLElBQUksR0FBRyxzQkFBc0I7RUFDcEM7QUFDRjtBQUVBLE1BQU1NLDBCQUEwQixTQUFTdkosS0FBSyxDQUFDO0VBQzdDZ0osV0FBV0EsQ0FBQ3RJLE9BQU8sR0FBRyx5Q0FBeUMsRUFBRTtJQUMvRCxLQUFLLENBQUNBLE9BQU8sQ0FBQztJQUNkLElBQUksQ0FBQ3VJLElBQUksR0FBRyw0QkFBNEI7RUFDMUM7QUFDRjtBQUVBLE1BQU1PLG1CQUFtQixTQUFTeEosS0FBSyxDQUFDO0VBQ3RDZ0osV0FBV0EsQ0FBQ3RJLE9BQU8sR0FBRyxrREFBa0QsRUFBRTtJQUN4RSxLQUFLLENBQUNBLE9BQU8sQ0FBQztJQUNkLElBQUksQ0FBQ3VJLElBQUksR0FBRyxtQkFBbUI7RUFDakM7QUFDRjtBQUVBLE1BQU1RLHFCQUFxQixTQUFTekosS0FBSyxDQUFDO0VBQ3hDZ0osV0FBV0EsQ0FBQ3RJLE9BQU8sR0FBRyxxQkFBcUIsRUFBRTtJQUMzQyxLQUFLLENBQUNBLE9BQU8sQ0FBQztJQUNkLElBQUksQ0FBQ3VJLElBQUksR0FBRyx1QkFBdUI7RUFDckM7QUFDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2pFOEI7QUFDTTtBQUNWO0FBQ3dCO0FBRWxELE1BQU1XLElBQUksR0FBR0EsQ0FBQSxLQUFNO0VBQ2pCO0VBQ0EsTUFBTUMsY0FBYyxHQUFHaEwsc0RBQVMsQ0FBQzhLLDZDQUFJLENBQUM7RUFDdEMsTUFBTUcsaUJBQWlCLEdBQUdqTCxzREFBUyxDQUFDOEssNkNBQUksQ0FBQztFQUN6QyxNQUFNckQsV0FBVyxHQUFHb0QsbURBQU0sQ0FBQ0csY0FBYyxFQUFFLE9BQU8sQ0FBQztFQUNuRCxNQUFNRSxjQUFjLEdBQUdMLG1EQUFNLENBQUNJLGlCQUFpQixFQUFFLFVBQVUsQ0FBQztFQUM1RCxJQUFJaEIsYUFBYTtFQUNqQixJQUFJa0IsYUFBYSxHQUFHLEtBQUs7O0VBRXpCO0VBQ0EsTUFBTXpELE9BQU8sR0FBRztJQUFFQyxLQUFLLEVBQUVGLFdBQVc7SUFBRUksUUFBUSxFQUFFcUQ7RUFBZSxDQUFDOztFQUVoRTtFQUNBLE1BQU12RSxLQUFLLEdBQUdBLENBQUEsS0FBTTtJQUNsQjtJQUNBdUUsY0FBYyxDQUFDRSxVQUFVLENBQUMsQ0FBQzs7SUFFM0I7SUFDQW5CLGFBQWEsR0FBR3hDLFdBQVc7RUFDN0IsQ0FBQzs7RUFFRDtFQUNBLE1BQU00RCxPQUFPLEdBQUdBLENBQUEsS0FBTTtJQUNwQkYsYUFBYSxHQUFHLElBQUk7RUFDdEIsQ0FBQzs7RUFFRDtFQUNBLE1BQU1HLFFBQVEsR0FBSTNCLElBQUksSUFBSztJQUN6QixJQUFJNEIsUUFBUTs7SUFFWjtJQUNBLE1BQU1DLFFBQVEsR0FDWnZCLGFBQWEsS0FBS3hDLFdBQVcsR0FBR3lELGNBQWMsR0FBR3pELFdBQVc7O0lBRTlEO0lBQ0EsTUFBTWhHLE1BQU0sR0FBR3dJLGFBQWEsQ0FBQzVDLFFBQVEsQ0FBQ21FLFFBQVEsQ0FBQzVELFNBQVMsRUFBRStCLElBQUksQ0FBQzs7SUFFL0Q7SUFDQSxJQUFJbEksTUFBTSxDQUFDMkIsR0FBRyxFQUFFO01BQ2Q7TUFDQSxJQUFJb0ksUUFBUSxDQUFDNUQsU0FBUyxDQUFDNkQsVUFBVSxDQUFDaEssTUFBTSxDQUFDdEIsUUFBUSxDQUFDLEVBQUU7UUFDbERvTCxRQUFRLEdBQUc7VUFDVCxHQUFHOUosTUFBTTtVQUNUZ0ssVUFBVSxFQUFFLElBQUk7VUFDaEJDLE9BQU8sRUFBRUYsUUFBUSxDQUFDNUQsU0FBUyxDQUFDK0QsaUJBQWlCLENBQUM7UUFDaEQsQ0FBQztNQUNILENBQUMsTUFBTTtRQUNMSixRQUFRLEdBQUc7VUFBRSxHQUFHOUosTUFBTTtVQUFFZ0ssVUFBVSxFQUFFO1FBQU0sQ0FBQztNQUM3QztJQUNGLENBQUMsTUFBTSxJQUFJLENBQUNoSyxNQUFNLENBQUMyQixHQUFHLEVBQUU7TUFDdEI7TUFDQW1JLFFBQVEsR0FBRzlKLE1BQU07SUFDbkI7O0lBRUE7SUFDQSxJQUFJOEosUUFBUSxDQUFDRyxPQUFPLEVBQUU7TUFDcEJMLE9BQU8sQ0FBQyxDQUFDO0lBQ1g7O0lBRUE7SUFDQXBCLGFBQWEsR0FBR3VCLFFBQVE7O0lBRXhCO0lBQ0EsT0FBT0QsUUFBUTtFQUNqQixDQUFDO0VBRUQsT0FBTztJQUNMLElBQUl0QixhQUFhQSxDQUFBLEVBQUc7TUFDbEIsT0FBT0EsYUFBYTtJQUN0QixDQUFDO0lBQ0QsSUFBSWtCLGFBQWFBLENBQUEsRUFBRztNQUNsQixPQUFPQSxhQUFhO0lBQ3RCLENBQUM7SUFDRHpELE9BQU87SUFDUGYsS0FBSztJQUNMMkU7RUFDRixDQUFDO0FBQ0gsQ0FBQztBQUVELGlFQUFlUCxJQUFJOzs7Ozs7Ozs7Ozs7Ozs7QUMvRUQ7QUFFbEIsTUFBTTlLLElBQUksR0FBRyxDQUNYLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQzlEO0FBRUQsTUFBTTJMLFVBQVUsR0FBSUMsS0FBSyxJQUFLO0VBQzVCLE1BQU1DLFNBQVMsR0FBR0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDeEssV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQzFDLE1BQU0wSyxTQUFTLEdBQUc5SCxRQUFRLENBQUM0SCxLQUFLLENBQUNoSixLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzs7RUFFaEQsTUFBTW1CLFFBQVEsR0FBRzhILFNBQVMsQ0FBQy9ILFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUNBLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQzlELE1BQU1ELFFBQVEsR0FBR2lJLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7RUFFaEMsT0FBTyxDQUFDL0gsUUFBUSxFQUFFRixRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFFRCxNQUFNa0ksU0FBUyxHQUFHQSxDQUFDakQsSUFBSSxFQUFFa0QsYUFBYSxLQUFLO0VBQ3pDO0VBQ0FDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDRixhQUFhLENBQUMsQ0FBQ3pILE9BQU8sQ0FBRTRILGdCQUFnQixJQUFLO0lBQ3ZELElBQUlBLGdCQUFnQixLQUFLckQsSUFBSSxFQUFFO01BQzdCLE1BQU0sSUFBSXVCLG1FQUE4QixDQUFDdkIsSUFBSSxDQUFDO0lBQ2hEO0VBQ0YsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELE1BQU1zRCxlQUFlLEdBQUdBLENBQUNqTSxVQUFVLEVBQUVrTSxNQUFNLEVBQUVDLFNBQVMsS0FBSztFQUN6RDtFQUNBLE1BQU1DLE1BQU0sR0FBR3ZNLElBQUksQ0FBQ2lCLE1BQU0sQ0FBQyxDQUFDO0VBQzVCLE1BQU11TCxNQUFNLEdBQUd4TSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUNpQixNQUFNLENBQUMsQ0FBQzs7RUFFL0IsTUFBTXdMLENBQUMsR0FBR0osTUFBTSxDQUFDLENBQUMsQ0FBQztFQUNuQixNQUFNSyxDQUFDLEdBQUdMLE1BQU0sQ0FBQyxDQUFDLENBQUM7O0VBRW5CO0VBQ0EsSUFBSUksQ0FBQyxHQUFHLENBQUMsSUFBSUEsQ0FBQyxJQUFJRixNQUFNLElBQUlHLENBQUMsR0FBRyxDQUFDLElBQUlBLENBQUMsSUFBSUYsTUFBTSxFQUFFO0lBQ2hELE9BQU8sS0FBSztFQUNkOztFQUVBO0VBQ0EsSUFBSUYsU0FBUyxLQUFLLEdBQUcsSUFBSUcsQ0FBQyxHQUFHdE0sVUFBVSxHQUFHb00sTUFBTSxFQUFFO0lBQ2hELE9BQU8sS0FBSztFQUNkO0VBQ0E7RUFDQSxJQUFJRCxTQUFTLEtBQUssR0FBRyxJQUFJSSxDQUFDLEdBQUd2TSxVQUFVLEdBQUdxTSxNQUFNLEVBQUU7SUFDaEQsT0FBTyxLQUFLO0VBQ2Q7O0VBRUE7RUFDQSxPQUFPLElBQUk7QUFDYixDQUFDO0FBRUQsTUFBTUcsc0JBQXNCLEdBQUdBLENBQUN4TSxVQUFVLEVBQUVrTSxNQUFNLEVBQUVDLFNBQVMsS0FBSztFQUNoRSxNQUFNdkksUUFBUSxHQUFHc0ksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDNUIsTUFBTXhJLFFBQVEsR0FBR3dJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztFQUU1QixNQUFNTyxTQUFTLEdBQUcsRUFBRTtFQUVwQixJQUFJTixTQUFTLENBQUM1SyxXQUFXLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtJQUNuQztJQUNBLEtBQUssSUFBSXdDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRy9ELFVBQVUsRUFBRStELENBQUMsRUFBRSxFQUFFO01BQ25DMEksU0FBUyxDQUFDekksSUFBSSxDQUFDbkUsSUFBSSxDQUFDK0QsUUFBUSxHQUFHRyxDQUFDLENBQUMsQ0FBQ0wsUUFBUSxDQUFDLENBQUM7SUFDOUM7RUFDRixDQUFDLE1BQU07SUFDTDtJQUNBLEtBQUssSUFBSUssQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHL0QsVUFBVSxFQUFFK0QsQ0FBQyxFQUFFLEVBQUU7TUFDbkMwSSxTQUFTLENBQUN6SSxJQUFJLENBQUNuRSxJQUFJLENBQUMrRCxRQUFRLENBQUMsQ0FBQ0YsUUFBUSxHQUFHSyxDQUFDLENBQUMsQ0FBQztJQUM5QztFQUNGO0VBRUEsT0FBTzBJLFNBQVM7QUFDbEIsQ0FBQztBQUVELE1BQU1DLGVBQWUsR0FBR0EsQ0FBQ0QsU0FBUyxFQUFFWixhQUFhLEtBQUs7RUFDcERDLE1BQU0sQ0FBQ2EsT0FBTyxDQUFDZCxhQUFhLENBQUMsQ0FBQ3pILE9BQU8sQ0FBQyxDQUFDLENBQUNyRSxRQUFRLEVBQUU2TSxxQkFBcUIsQ0FBQyxLQUFLO0lBQzNFLElBQ0VILFNBQVMsQ0FBQ0ksSUFBSSxDQUFFM0gsUUFBUSxJQUFLMEgscUJBQXFCLENBQUN4TCxRQUFRLENBQUM4RCxRQUFRLENBQUMsQ0FBQyxFQUN0RTtNQUNBLE1BQU0sSUFBSTRFLDBEQUFxQixDQUM1QixtQ0FBa0MvSixRQUFTLEVBQzlDLENBQUM7SUFDSDtFQUNGLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCxNQUFNK00sV0FBVyxHQUFHQSxDQUFDNUgsUUFBUSxFQUFFMkcsYUFBYSxLQUFLO0VBQy9DLE1BQU1rQixTQUFTLEdBQUdqQixNQUFNLENBQUNhLE9BQU8sQ0FBQ2QsYUFBYSxDQUFDLENBQUNuRCxJQUFJLENBQ2xELENBQUMsQ0FBQ3NFLENBQUMsRUFBRUoscUJBQXFCLENBQUMsS0FBS0EscUJBQXFCLENBQUN4TCxRQUFRLENBQUM4RCxRQUFRLENBQ3pFLENBQUM7RUFFRCxPQUFPNkgsU0FBUyxHQUFHO0lBQUUvSixHQUFHLEVBQUUsSUFBSTtJQUFFakQsUUFBUSxFQUFFZ04sU0FBUyxDQUFDLENBQUM7RUFBRSxDQUFDLEdBQUc7SUFBRS9KLEdBQUcsRUFBRTtFQUFNLENBQUM7QUFDM0UsQ0FBQztBQUVELE1BQU1wRCxTQUFTLEdBQUlxTixXQUFXLElBQUs7RUFDakMsTUFBTUMsS0FBSyxHQUFHLENBQUMsQ0FBQztFQUNoQixNQUFNckIsYUFBYSxHQUFHLENBQUMsQ0FBQztFQUN4QixNQUFNc0IsWUFBWSxHQUFHLENBQUMsQ0FBQztFQUN2QixNQUFNQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO0VBRTFCLE1BQU10RSxTQUFTLEdBQUdBLENBQUNwSCxJQUFJLEVBQUUrSixLQUFLLEVBQUVVLFNBQVMsS0FBSztJQUM1QyxNQUFNa0IsT0FBTyxHQUFHSixXQUFXLENBQUN2TCxJQUFJLENBQUM7O0lBRWpDO0lBQ0FrSyxTQUFTLENBQUNsSyxJQUFJLEVBQUVtSyxhQUFhLENBQUM7O0lBRTlCO0lBQ0EsTUFBTUssTUFBTSxHQUFHVixVQUFVLENBQUNDLEtBQUssQ0FBQzs7SUFFaEM7SUFDQSxJQUFJUSxlQUFlLENBQUNvQixPQUFPLENBQUNyTixVQUFVLEVBQUVrTSxNQUFNLEVBQUVDLFNBQVMsQ0FBQyxFQUFFO01BQzFEO01BQ0EsTUFBTU0sU0FBUyxHQUFHRCxzQkFBc0IsQ0FDdENhLE9BQU8sQ0FBQ3JOLFVBQVUsRUFDbEJrTSxNQUFNLEVBQ05DLFNBQ0YsQ0FBQzs7TUFFRDtNQUNBTyxlQUFlLENBQUNELFNBQVMsRUFBRVosYUFBYSxDQUFDOztNQUV6QztNQUNBQSxhQUFhLENBQUNuSyxJQUFJLENBQUMsR0FBRytLLFNBQVM7TUFDL0I7TUFDQVMsS0FBSyxDQUFDeEwsSUFBSSxDQUFDLEdBQUcyTCxPQUFPOztNQUVyQjtNQUNBRixZQUFZLENBQUN6TCxJQUFJLENBQUMsR0FBRyxFQUFFO0lBQ3pCLENBQUMsTUFBTTtNQUNMLE1BQU0sSUFBSTRJLCtEQUEwQixDQUNqQyxzREFBcUQ1SSxJQUFLLEVBQzdELENBQUM7SUFDSDtFQUNGLENBQUM7O0VBRUQ7RUFDQSxNQUFNNEwsTUFBTSxHQUFJcEksUUFBUSxJQUFLO0lBQzNCLElBQUlxSSxRQUFROztJQUVaO0lBQ0EsSUFBSUgsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDaE0sUUFBUSxDQUFDOEQsUUFBUSxDQUFDLElBQUlrSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUNoTSxRQUFRLENBQUM4RCxRQUFRLENBQUMsRUFBRTtNQUN0RTtNQUNBLE1BQU0sSUFBSXFGLHdEQUFtQixDQUFDLENBQUM7SUFDakM7O0lBRUE7SUFDQSxNQUFNaUQsWUFBWSxHQUFHVixXQUFXLENBQUM1SCxRQUFRLEVBQUUyRyxhQUFhLENBQUM7SUFDekQsSUFBSTJCLFlBQVksQ0FBQ3hLLEdBQUcsRUFBRTtNQUNwQjtNQUNBbUssWUFBWSxDQUFDSyxZQUFZLENBQUN6TixRQUFRLENBQUMsQ0FBQ2lFLElBQUksQ0FBQ2tCLFFBQVEsQ0FBQztNQUNsRGdJLEtBQUssQ0FBQ00sWUFBWSxDQUFDek4sUUFBUSxDQUFDLENBQUNpRCxHQUFHLENBQUMsQ0FBQzs7TUFFbEM7TUFDQW9LLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQ3BKLElBQUksQ0FBQ2tCLFFBQVEsQ0FBQztNQUMzQnFJLFFBQVEsR0FBRztRQUFFLEdBQUdDO01BQWEsQ0FBQztJQUNoQyxDQUFDLE1BQU07TUFDTDtNQUNBO01BQ0FKLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQ3BKLElBQUksQ0FBQ2tCLFFBQVEsQ0FBQztNQUMzQnFJLFFBQVEsR0FBRztRQUFFLEdBQUdDO01BQWEsQ0FBQztJQUNoQztJQUVBLE9BQU9ELFFBQVE7RUFDakIsQ0FBQztFQUVELE1BQU1sQyxVQUFVLEdBQUkzSixJQUFJLElBQUt3TCxLQUFLLENBQUN4TCxJQUFJLENBQUMsQ0FBQytMLE1BQU07RUFFL0MsTUFBTWxDLGlCQUFpQixHQUFHQSxDQUFBLEtBQ3hCTyxNQUFNLENBQUNhLE9BQU8sQ0FBQ08sS0FBSyxDQUFDLENBQUNRLEtBQUssQ0FBQyxDQUFDLENBQUMzTixRQUFRLEVBQUU0SSxJQUFJLENBQUMsS0FBS0EsSUFBSSxDQUFDOEUsTUFBTSxDQUFDOztFQUVoRTtFQUNBLE1BQU1FLFVBQVUsR0FBR0EsQ0FBQSxLQUFNO0lBQ3ZCLE1BQU1DLGFBQWEsR0FBRzlCLE1BQU0sQ0FBQ2EsT0FBTyxDQUFDTyxLQUFLLENBQUMsQ0FDeENXLE1BQU0sQ0FBQyxDQUFDLENBQUM5TixRQUFRLEVBQUU0SSxJQUFJLENBQUMsS0FBSyxDQUFDQSxJQUFJLENBQUM4RSxNQUFNLENBQUMsQ0FDMUNLLEdBQUcsQ0FBQyxDQUFDLENBQUMvTixRQUFRLEVBQUVpTixDQUFDLENBQUMsS0FBS2pOLFFBQVEsQ0FBQztJQUVuQyxPQUFPLENBQUM2TixhQUFhLENBQUM5TSxNQUFNLEVBQUU4TSxhQUFhLENBQUM7RUFDOUMsQ0FBQztFQUVELE9BQU87SUFDTCxJQUFJL04sSUFBSUEsQ0FBQSxFQUFHO01BQ1QsT0FBT0EsSUFBSTtJQUNiLENBQUM7SUFDRCxJQUFJcU4sS0FBS0EsQ0FBQSxFQUFHO01BQ1YsT0FBT0EsS0FBSztJQUNkLENBQUM7SUFDRCxJQUFJRSxTQUFTQSxDQUFBLEVBQUc7TUFDZCxPQUFPQSxTQUFTO0lBQ2xCLENBQUM7SUFDRFcsT0FBTyxFQUFHaE8sUUFBUSxJQUFLbU4sS0FBSyxDQUFDbk4sUUFBUSxDQUFDO0lBQ3RDaU8sZ0JBQWdCLEVBQUdqTyxRQUFRLElBQUs4TCxhQUFhLENBQUM5TCxRQUFRLENBQUM7SUFDdkRrTyxlQUFlLEVBQUdsTyxRQUFRLElBQUtvTixZQUFZLENBQUNwTixRQUFRLENBQUM7SUFDckQrSSxTQUFTO0lBQ1R3RSxNQUFNO0lBQ05qQyxVQUFVO0lBQ1ZFLGlCQUFpQjtJQUNqQm9DO0VBQ0YsQ0FBQztBQUNILENBQUM7QUFFRCxpRUFBZS9OLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNwTkY7QUFDSTtBQUNVO0FBQ2M7O0FBRWxEO0FBQ0EsTUFBTXVPLFlBQVksR0FBR0Qsc0RBQVMsQ0FBQyxDQUFDOztBQUVoQztBQUNBLE1BQU1FLE9BQU8sR0FBR3pELGlEQUFJLENBQUMsQ0FBQzs7QUFFdEI7QUFDQSxNQUFNMEQsYUFBYSxHQUFHakgsNkRBQWdCLENBQUMrRyxZQUFZLEVBQUVDLE9BQU8sQ0FBQzs7QUFFN0Q7QUFDQSxNQUFNQyxhQUFhLENBQUNsRixXQUFXLENBQUMsQ0FBQzs7QUFFakM7QUFDQSxNQUFNa0YsYUFBYSxDQUFDMUUsUUFBUSxDQUFDLENBQUM7O0FBRTlCO0FBQ0FqSCxPQUFPLENBQUNDLEdBQUcsQ0FDUixpQ0FBZ0N5TCxPQUFPLENBQUM5RyxPQUFPLENBQUNDLEtBQUssQ0FBQzdGLElBQUssMkJBQTBCME0sT0FBTyxDQUFDOUcsT0FBTyxDQUFDRyxRQUFRLENBQUMvRixJQUFLLEdBQ3RILENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDakJpQjtBQUVsQixNQUFNNE0sU0FBUyxHQUFHQSxDQUFDL0UsSUFBSSxFQUFFZ0YsTUFBTSxLQUFLO0VBQ2xDLElBQUlDLEtBQUssR0FBRyxLQUFLO0VBRWpCRCxNQUFNLENBQUNuSyxPQUFPLENBQUVxSyxFQUFFLElBQUs7SUFDckIsSUFBSUEsRUFBRSxDQUFDL0YsSUFBSSxDQUFFZ0csQ0FBQyxJQUFLQSxDQUFDLEtBQUtuRixJQUFJLENBQUMsRUFBRTtNQUM5QmlGLEtBQUssR0FBRyxJQUFJO0lBQ2Q7RUFDRixDQUFDLENBQUM7RUFFRixPQUFPQSxLQUFLO0FBQ2QsQ0FBQztBQUVELE1BQU1HLFFBQVEsR0FBR0EsQ0FBQzlPLElBQUksRUFBRStPLE9BQU8sS0FBSztFQUNsQztFQUNBLE1BQU1DLFFBQVEsR0FBR2hQLElBQUksQ0FBQ2lQLE9BQU8sQ0FBRUMsR0FBRyxJQUFLQSxHQUFHLENBQUM7O0VBRTNDO0VBQ0EsTUFBTUMsYUFBYSxHQUFHSCxRQUFRLENBQUNoQixNQUFNLENBQUV0RSxJQUFJLElBQUssQ0FBQ3FGLE9BQU8sQ0FBQ3hOLFFBQVEsQ0FBQ21JLElBQUksQ0FBQyxDQUFDOztFQUV4RTtFQUNBLE1BQU0wRixVQUFVLEdBQ2RELGFBQWEsQ0FBQ0UsSUFBSSxDQUFDQyxLQUFLLENBQUNELElBQUksQ0FBQ0UsTUFBTSxDQUFDLENBQUMsR0FBR0osYUFBYSxDQUFDbE8sTUFBTSxDQUFDLENBQUM7RUFFakUsT0FBT21PLFVBQVU7QUFDbkIsQ0FBQztBQUVELE1BQU1JLG1CQUFtQixHQUFHQSxDQUFDQyxJQUFJLEVBQUVuRCxTQUFTLEVBQUV0TSxJQUFJLEtBQUs7RUFDckQsTUFBTTBQLFdBQVcsR0FBRyxFQUFFO0VBRXRCLElBQUlwRCxTQUFTLEtBQUssR0FBRyxFQUFFO0lBQ3JCO0lBQ0EsS0FBSyxJQUFJcUQsR0FBRyxHQUFHLENBQUMsRUFBRUEsR0FBRyxHQUFHM1AsSUFBSSxDQUFDaUIsTUFBTSxHQUFHd08sSUFBSSxHQUFHLENBQUMsRUFBRUUsR0FBRyxFQUFFLEVBQUU7TUFDckQsS0FBSyxJQUFJVCxHQUFHLEdBQUcsQ0FBQyxFQUFFQSxHQUFHLEdBQUdsUCxJQUFJLENBQUMyUCxHQUFHLENBQUMsQ0FBQzFPLE1BQU0sRUFBRWlPLEdBQUcsRUFBRSxFQUFFO1FBQy9DUSxXQUFXLENBQUN2TCxJQUFJLENBQUNuRSxJQUFJLENBQUMyUCxHQUFHLENBQUMsQ0FBQ1QsR0FBRyxDQUFDLENBQUM7TUFDbEM7SUFDRjtFQUNGLENBQUMsTUFBTTtJQUNMO0lBQ0EsS0FBSyxJQUFJQSxHQUFHLEdBQUcsQ0FBQyxFQUFFQSxHQUFHLEdBQUdsUCxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUNpQixNQUFNLEdBQUd3TyxJQUFJLEdBQUcsQ0FBQyxFQUFFUCxHQUFHLEVBQUUsRUFBRTtNQUN4RCxLQUFLLElBQUlTLEdBQUcsR0FBRyxDQUFDLEVBQUVBLEdBQUcsR0FBRzNQLElBQUksQ0FBQ2lCLE1BQU0sRUFBRTBPLEdBQUcsRUFBRSxFQUFFO1FBQzFDRCxXQUFXLENBQUN2TCxJQUFJLENBQUNuRSxJQUFJLENBQUMyUCxHQUFHLENBQUMsQ0FBQ1QsR0FBRyxDQUFDLENBQUM7TUFDbEM7SUFDRjtFQUNGOztFQUVBO0VBQ0EsTUFBTVUsV0FBVyxHQUFHUCxJQUFJLENBQUNDLEtBQUssQ0FBQ0QsSUFBSSxDQUFDRSxNQUFNLENBQUMsQ0FBQyxHQUFHRyxXQUFXLENBQUN6TyxNQUFNLENBQUM7RUFDbEUsT0FBT3lPLFdBQVcsQ0FBQ0UsV0FBVyxDQUFDO0FBQ2pDLENBQUM7QUFFRCxNQUFNQyxhQUFhLEdBQUlsSSxTQUFTLElBQUs7RUFDbkMsTUFBTW1JLFNBQVMsR0FBRyxDQUNoQjtJQUFFak8sSUFBSSxFQUFFLFNBQVM7SUFBRTROLElBQUksRUFBRTtFQUFFLENBQUMsRUFDNUI7SUFBRTVOLElBQUksRUFBRSxZQUFZO0lBQUU0TixJQUFJLEVBQUU7RUFBRSxDQUFDLEVBQy9CO0lBQUU1TixJQUFJLEVBQUUsU0FBUztJQUFFNE4sSUFBSSxFQUFFO0VBQUUsQ0FBQyxFQUM1QjtJQUFFNU4sSUFBSSxFQUFFLFdBQVc7SUFBRTROLElBQUksRUFBRTtFQUFFLENBQUMsRUFDOUI7SUFBRTVOLElBQUksRUFBRSxXQUFXO0lBQUU0TixJQUFJLEVBQUU7RUFBRSxDQUFDLENBQy9CO0VBRURLLFNBQVMsQ0FBQ3ZMLE9BQU8sQ0FBRXVFLElBQUksSUFBSztJQUMxQixJQUFJaUgsTUFBTSxHQUFHLEtBQUs7SUFDbEIsT0FBTyxDQUFDQSxNQUFNLEVBQUU7TUFDZCxNQUFNekQsU0FBUyxHQUFHK0MsSUFBSSxDQUFDRSxNQUFNLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztNQUNqRCxNQUFNM0QsS0FBSyxHQUFHNEQsbUJBQW1CLENBQUMxRyxJQUFJLENBQUMyRyxJQUFJLEVBQUVuRCxTQUFTLEVBQUUzRSxTQUFTLENBQUMzSCxJQUFJLENBQUM7TUFFdkUsSUFBSTtRQUNGMkgsU0FBUyxDQUFDc0IsU0FBUyxDQUFDSCxJQUFJLENBQUNqSCxJQUFJLEVBQUUrSixLQUFLLEVBQUVVLFNBQVMsQ0FBQztRQUNoRHlELE1BQU0sR0FBRyxJQUFJO01BQ2YsQ0FBQyxDQUFDLE9BQU8xTSxLQUFLLEVBQUU7UUFDZCxJQUNFLEVBQUVBLEtBQUssWUFBWW9ILCtEQUEwQixDQUFDLElBQzlDLEVBQUVwSCxLQUFLLFlBQVk0RywwREFBcUIsQ0FBQyxFQUN6QztVQUNBLE1BQU01RyxLQUFLLENBQUMsQ0FBQztRQUNmO1FBQ0E7TUFDRjtJQUNGO0VBQ0YsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELE1BQU11SCxNQUFNLEdBQUdBLENBQUNqRCxTQUFTLEVBQUU5RixJQUFJLEtBQUs7RUFDbEMsTUFBTWtOLE9BQU8sR0FBRyxFQUFFO0VBRWxCLE1BQU01RCxVQUFVLEdBQUdBLENBQUNqTCxRQUFRLEVBQUUwTCxLQUFLLEVBQUVVLFNBQVMsS0FBSztJQUNqRCxJQUFJekssSUFBSSxLQUFLLE9BQU8sRUFBRTtNQUNwQjhGLFNBQVMsQ0FBQ3NCLFNBQVMsQ0FBQy9JLFFBQVEsRUFBRTBMLEtBQUssRUFBRVUsU0FBUyxDQUFDO0lBQ2pELENBQUMsTUFBTSxJQUFJekssSUFBSSxLQUFLLFVBQVUsRUFBRTtNQUM5QmdPLGFBQWEsQ0FBQ2xJLFNBQVMsQ0FBQztJQUMxQixDQUFDLE1BQU07TUFDTCxNQUFNLElBQUk2QywyREFBc0IsQ0FDN0IsMkVBQTBFM0ksSUFBSyxHQUNsRixDQUFDO0lBQ0g7RUFDRixDQUFDO0VBRUQsTUFBTXVGLFFBQVEsR0FBR0EsQ0FBQzRJLFlBQVksRUFBRTNILEtBQUssS0FBSztJQUN4QyxJQUFJcUIsSUFBSTs7SUFFUjtJQUNBLElBQUk3SCxJQUFJLEtBQUssT0FBTyxFQUFFO01BQ3BCO01BQ0E2SCxJQUFJLEdBQUksR0FBRXJCLEtBQUssQ0FBQzFGLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQ3ZCLFdBQVcsQ0FBQyxDQUFFLEdBQUVpSCxLQUFLLENBQUNwRSxTQUFTLENBQUMsQ0FBQyxDQUFFLEVBQUM7SUFDaEUsQ0FBQyxNQUFNLElBQUlwQyxJQUFJLEtBQUssVUFBVSxFQUFFO01BQzlCNkgsSUFBSSxHQUFHb0YsUUFBUSxDQUFDa0IsWUFBWSxDQUFDaFEsSUFBSSxFQUFFK08sT0FBTyxDQUFDO0lBQzdDLENBQUMsTUFBTTtNQUNMLE1BQU0sSUFBSXZFLDJEQUFzQixDQUM3QiwyRUFBMEUzSSxJQUFLLEdBQ2xGLENBQUM7SUFDSDs7SUFFQTtJQUNBLElBQUksQ0FBQzRNLFNBQVMsQ0FBQy9FLElBQUksRUFBRXNHLFlBQVksQ0FBQ2hRLElBQUksQ0FBQyxFQUFFO01BQ3ZDLE1BQU0sSUFBSTJLLDBEQUFxQixDQUFFLDZCQUE0QmpCLElBQUssR0FBRSxDQUFDO0lBQ3ZFOztJQUVBO0lBQ0EsSUFBSXFGLE9BQU8sQ0FBQ2xHLElBQUksQ0FBRStGLEVBQUUsSUFBS0EsRUFBRSxLQUFLbEYsSUFBSSxDQUFDLEVBQUU7TUFDckMsTUFBTSxJQUFJZ0Isd0RBQW1CLENBQUMsQ0FBQztJQUNqQzs7SUFFQTtJQUNBLE1BQU1nRCxRQUFRLEdBQUdzQyxZQUFZLENBQUN2QyxNQUFNLENBQUMvRCxJQUFJLENBQUM7SUFDMUNxRixPQUFPLENBQUM1SyxJQUFJLENBQUN1RixJQUFJLENBQUM7SUFDbEI7SUFDQSxPQUFPO01BQUV4RyxNQUFNLEVBQUVyQixJQUFJO01BQUUsR0FBRzZMO0lBQVMsQ0FBQztFQUN0QyxDQUFDO0VBRUQsT0FBTztJQUNMLElBQUk3TCxJQUFJQSxDQUFBLEVBQUc7TUFDVCxPQUFPQSxJQUFJO0lBQ2IsQ0FBQztJQUNELElBQUk4RixTQUFTQSxDQUFBLEVBQUc7TUFDZCxPQUFPQSxTQUFTO0lBQ2xCLENBQUM7SUFDRCxJQUFJb0gsT0FBT0EsQ0FBQSxFQUFHO01BQ1osT0FBT0EsT0FBTztJQUNoQixDQUFDO0lBQ0QzSCxRQUFRO0lBQ1IrRDtFQUNGLENBQUM7QUFDSCxDQUFDO0FBRUQsaUVBQWVQLE1BQU07Ozs7Ozs7Ozs7Ozs7OztBQ3ZKMkI7QUFFaEQsTUFBTUMsSUFBSSxHQUFJaEosSUFBSSxJQUFLO0VBQ3JCLE1BQU1vTyxTQUFTLEdBQUdBLENBQUEsS0FBTTtJQUN0QixRQUFRcE8sSUFBSTtNQUNWLEtBQUssU0FBUztRQUNaLE9BQU8sQ0FBQztNQUNWLEtBQUssWUFBWTtRQUNmLE9BQU8sQ0FBQztNQUNWLEtBQUssU0FBUztNQUNkLEtBQUssV0FBVztRQUNkLE9BQU8sQ0FBQztNQUNWLEtBQUssV0FBVztRQUNkLE9BQU8sQ0FBQztNQUNWO1FBQ0UsTUFBTSxJQUFJMEkseURBQW9CLENBQUMsQ0FBQztJQUNwQztFQUNGLENBQUM7RUFFRCxNQUFNcEssVUFBVSxHQUFHOFAsU0FBUyxDQUFDLENBQUM7RUFFOUIsSUFBSUMsSUFBSSxHQUFHLENBQUM7RUFFWixNQUFNL00sR0FBRyxHQUFHQSxDQUFBLEtBQU07SUFDaEIsSUFBSStNLElBQUksR0FBRy9QLFVBQVUsRUFBRTtNQUNyQitQLElBQUksSUFBSSxDQUFDO0lBQ1g7RUFDRixDQUFDO0VBRUQsT0FBTztJQUNMLElBQUlyTyxJQUFJQSxDQUFBLEVBQUc7TUFDVCxPQUFPQSxJQUFJO0lBQ2IsQ0FBQztJQUNELElBQUkxQixVQUFVQSxDQUFBLEVBQUc7TUFDZixPQUFPQSxVQUFVO0lBQ25CLENBQUM7SUFDRCxJQUFJK1AsSUFBSUEsQ0FBQSxFQUFHO01BQ1QsT0FBT0EsSUFBSTtJQUNiLENBQUM7SUFDRCxJQUFJdEMsTUFBTUEsQ0FBQSxFQUFHO01BQ1gsT0FBT3NDLElBQUksS0FBSy9QLFVBQVU7SUFDNUIsQ0FBQztJQUNEZ0Q7RUFDRixDQUFDO0FBQ0gsQ0FBQztBQUVELGlFQUFlMEgsSUFBSTs7Ozs7Ozs7Ozs7Ozs7QUM5Q25CO0FBQ0EsTUFBTXNGLFNBQVMsR0FBR0EsQ0FBQ0MsR0FBRyxFQUFFQyxNQUFNLEVBQUVyRSxhQUFhLEtBQUs7RUFDaEQ7RUFDQSxNQUFNO0lBQUVuSyxJQUFJO0lBQUUxQixVQUFVLEVBQUVjO0VBQU8sQ0FBQyxHQUFHbVAsR0FBRztFQUN4QztFQUNBLE1BQU1FLFNBQVMsR0FBRyxFQUFFOztFQUVwQjtFQUNBLEtBQUssSUFBSXBNLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2pELE1BQU0sRUFBRWlELENBQUMsRUFBRSxFQUFFO0lBQy9CO0lBQ0EsTUFBTW1CLFFBQVEsR0FBRzJHLGFBQWEsQ0FBQzlILENBQUMsQ0FBQztJQUNqQztJQUNBLE1BQU1xTSxJQUFJLEdBQUd4TyxRQUFRLENBQUNHLGFBQWEsQ0FBQyxLQUFLLENBQUM7SUFDMUNxTyxJQUFJLENBQUNDLFNBQVMsR0FBRyxrQ0FBa0MsQ0FBQyxDQUFDO0lBQ3JEO0lBQ0FELElBQUksQ0FBQ0UsWUFBWSxDQUFDLElBQUksRUFBRyxPQUFNSixNQUFPLGFBQVl4TyxJQUFLLFFBQU93RCxRQUFTLEVBQUMsQ0FBQztJQUN6RTtJQUNBa0wsSUFBSSxDQUFDcEwsT0FBTyxDQUFDRSxRQUFRLEdBQUdBLFFBQVE7SUFDaENpTCxTQUFTLENBQUNuTSxJQUFJLENBQUNvTSxJQUFJLENBQUMsQ0FBQyxDQUFDO0VBQ3hCOztFQUVBO0VBQ0EsT0FBT0QsU0FBUztBQUNsQixDQUFDO0FBRUQsTUFBTWpDLFNBQVMsR0FBR0EsQ0FBQSxLQUFNO0VBQ3RCLE1BQU01SyxlQUFlLEdBQUlpTixXQUFXLElBQUs7SUFDdkMsTUFBTUMsU0FBUyxHQUFHNU8sUUFBUSxDQUFDQyxjQUFjLENBQUMwTyxXQUFXLENBQUM7O0lBRXREO0lBQ0EsTUFBTTtNQUFFeE47SUFBTyxDQUFDLEdBQUd5TixTQUFTLENBQUN4TCxPQUFPOztJQUVwQztJQUNBLE1BQU15TCxPQUFPLEdBQUc3TyxRQUFRLENBQUNHLGFBQWEsQ0FBQyxLQUFLLENBQUM7SUFDN0MwTyxPQUFPLENBQUNKLFNBQVMsR0FDZiwwREFBMEQ7SUFDNURJLE9BQU8sQ0FBQ3pMLE9BQU8sQ0FBQ2pDLE1BQU0sR0FBR0EsTUFBTTs7SUFFL0I7SUFDQTBOLE9BQU8sQ0FBQ3RPLFdBQVcsQ0FBQ1AsUUFBUSxDQUFDRyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7O0lBRWxEO0lBQ0EsTUFBTTJPLE9BQU8sR0FBRyxZQUFZO0lBQzVCLEtBQUssSUFBSTNNLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRzJNLE9BQU8sQ0FBQzVQLE1BQU0sRUFBRWlELENBQUMsRUFBRSxFQUFFO01BQ3ZDLE1BQU00TSxNQUFNLEdBQUcvTyxRQUFRLENBQUNHLGFBQWEsQ0FBQyxLQUFLLENBQUM7TUFDNUM0TyxNQUFNLENBQUNOLFNBQVMsR0FBRyxhQUFhO01BQ2hDTSxNQUFNLENBQUMzTyxXQUFXLEdBQUcwTyxPQUFPLENBQUMzTSxDQUFDLENBQUM7TUFDL0IwTSxPQUFPLENBQUN0TyxXQUFXLENBQUN3TyxNQUFNLENBQUM7SUFDN0I7O0lBRUE7SUFDQSxLQUFLLElBQUk1QixHQUFHLEdBQUcsQ0FBQyxFQUFFQSxHQUFHLElBQUksRUFBRSxFQUFFQSxHQUFHLEVBQUUsRUFBRTtNQUNsQztNQUNBLE1BQU02QixRQUFRLEdBQUdoUCxRQUFRLENBQUNHLGFBQWEsQ0FBQyxLQUFLLENBQUM7TUFDOUM2TyxRQUFRLENBQUNQLFNBQVMsR0FBRyxhQUFhO01BQ2xDTyxRQUFRLENBQUM1TyxXQUFXLEdBQUcrTSxHQUFHO01BQzFCMEIsT0FBTyxDQUFDdE8sV0FBVyxDQUFDeU8sUUFBUSxDQUFDOztNQUU3QjtNQUNBLEtBQUssSUFBSXBCLEdBQUcsR0FBRyxDQUFDLEVBQUVBLEdBQUcsR0FBRyxFQUFFLEVBQUVBLEdBQUcsRUFBRSxFQUFFO1FBQ2pDLE1BQU1uTCxNQUFNLEdBQUksR0FBRXFNLE9BQU8sQ0FBQ2xCLEdBQUcsQ0FBRSxHQUFFVCxHQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQ3hDLE1BQU1sSyxJQUFJLEdBQUdqRCxRQUFRLENBQUNHLGFBQWEsQ0FBQyxLQUFLLENBQUM7UUFDMUM4QyxJQUFJLENBQUNnTSxFQUFFLEdBQUksR0FBRTlOLE1BQU8sSUFBR3NCLE1BQU8sRUFBQyxDQUFDLENBQUM7UUFDakNRLElBQUksQ0FBQ3dMLFNBQVMsR0FDWix5RkFBeUYsQ0FBQyxDQUFDO1FBQzdGeEwsSUFBSSxDQUFDNUMsU0FBUyxDQUFDQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBQ3RDMkMsSUFBSSxDQUFDRyxPQUFPLENBQUNFLFFBQVEsR0FBR2IsTUFBTSxDQUFDLENBQUM7UUFDaENRLElBQUksQ0FBQ0csT0FBTyxDQUFDakMsTUFBTSxHQUFHQSxNQUFNLENBQUMsQ0FBQzs7UUFFOUIwTixPQUFPLENBQUN0TyxXQUFXLENBQUMwQyxJQUFJLENBQUM7TUFDM0I7SUFDRjs7SUFFQTtJQUNBMkwsU0FBUyxDQUFDck8sV0FBVyxDQUFDc08sT0FBTyxDQUFDO0VBQ2hDLENBQUM7RUFFRCxNQUFNcE4sYUFBYSxHQUFHQSxDQUFBLEtBQU07SUFDMUIsTUFBTXlOLGdCQUFnQixHQUFHbFAsUUFBUSxDQUFDQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUM3RGlQLGdCQUFnQixDQUFDN08sU0FBUyxDQUFDQyxHQUFHLENBQzVCLE1BQU0sRUFDTixVQUFVLEVBQ1YsaUJBQWlCLEVBQ2pCLFNBQ0YsQ0FBQyxDQUFDLENBQUM7O0lBRUg7SUFDQSxNQUFNNk8sUUFBUSxHQUFHblAsUUFBUSxDQUFDRyxhQUFhLENBQUMsS0FBSyxDQUFDO0lBQzlDZ1AsUUFBUSxDQUFDVixTQUFTLEdBQUcsNENBQTRDLENBQUMsQ0FBQzs7SUFFbkUsTUFBTW5JLEtBQUssR0FBR3RHLFFBQVEsQ0FBQ0csYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDL0NtRyxLQUFLLENBQUN4RyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUM7SUFDckJ3RyxLQUFLLENBQUNvSSxZQUFZLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUM7SUFDM0NwSSxLQUFLLENBQUNtSSxTQUFTLEdBQUcsd0JBQXdCLENBQUMsQ0FBQztJQUM1QyxNQUFNVyxZQUFZLEdBQUdwUCxRQUFRLENBQUNHLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3ZEaVAsWUFBWSxDQUFDaFAsV0FBVyxHQUFHLFFBQVEsQ0FBQyxDQUFDO0lBQ3JDZ1AsWUFBWSxDQUFDVixZQUFZLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQztJQUNuRFUsWUFBWSxDQUFDWCxTQUFTLEdBQUcsMkNBQTJDLENBQUMsQ0FBQztJQUN0RSxNQUFNMU8sTUFBTSxHQUFHQyxRQUFRLENBQUNHLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzlDSixNQUFNLENBQUMyTyxZQUFZLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQztJQUM3QzNPLE1BQU0sQ0FBQzBPLFNBQVMsR0FBRyw0Q0FBNEMsQ0FBQyxDQUFDOztJQUVqRTtJQUNBVSxRQUFRLENBQUM1TyxXQUFXLENBQUMrRixLQUFLLENBQUM7SUFDM0I2SSxRQUFRLENBQUM1TyxXQUFXLENBQUM2TyxZQUFZLENBQUM7O0lBRWxDO0lBQ0FGLGdCQUFnQixDQUFDM08sV0FBVyxDQUFDUixNQUFNLENBQUM7SUFDcENtUCxnQkFBZ0IsQ0FBQzNPLFdBQVcsQ0FBQzRPLFFBQVEsQ0FBQztFQUN4QyxDQUFDO0VBRUQsTUFBTXZLLGFBQWEsR0FBSXlLLFVBQVUsSUFBSztJQUNwQztJQUNBLE1BQU1DLE9BQU8sR0FBR3RQLFFBQVEsQ0FBQ0MsY0FBYyxDQUFDLGdCQUFnQixDQUFDOztJQUV6RDtJQUNBLE9BQU9xUCxPQUFPLENBQUNDLFVBQVUsRUFBRTtNQUN6QkQsT0FBTyxDQUFDRSxXQUFXLENBQUNGLE9BQU8sQ0FBQ0MsVUFBVSxDQUFDO0lBQ3pDOztJQUVBO0lBQ0FyRixNQUFNLENBQUNhLE9BQU8sQ0FBQ3NFLFVBQVUsQ0FBQyxDQUFDN00sT0FBTyxDQUFDLENBQUMsQ0FBQ21CLEdBQUcsRUFBRTtNQUFFbEYsTUFBTTtNQUFFQztJQUFXLENBQUMsQ0FBQyxLQUFLO01BQ3BFO01BQ0EsTUFBTStRLFNBQVMsR0FBR3pQLFFBQVEsQ0FBQ0csYUFBYSxDQUFDLEtBQUssQ0FBQztNQUMvQ3NQLFNBQVMsQ0FBQ3JQLFdBQVcsR0FBRzNCLE1BQU07O01BRTlCO01BQ0EsUUFBUUMsVUFBVTtRQUNoQixLQUFLLGFBQWE7VUFDaEIrUSxTQUFTLENBQUNwUCxTQUFTLENBQUNDLEdBQUcsQ0FBQyxlQUFlLENBQUM7VUFDeEM7UUFDRixLQUFLLE9BQU87VUFDVm1QLFNBQVMsQ0FBQ3BQLFNBQVMsQ0FBQ0MsR0FBRyxDQUFDLGlCQUFpQixDQUFDO1VBQzFDO1FBQ0YsS0FBSyxPQUFPO1VBQ1ZtUCxTQUFTLENBQUNwUCxTQUFTLENBQUNDLEdBQUcsQ0FBQyxjQUFjLENBQUM7VUFDdkM7UUFDRjtVQUNFbVAsU0FBUyxDQUFDcFAsU0FBUyxDQUFDQyxHQUFHLENBQUMsZUFBZSxDQUFDO1FBQUU7TUFDOUM7O01BRUE7TUFDQWdQLE9BQU8sQ0FBQy9PLFdBQVcsQ0FBQ2tQLFNBQVMsQ0FBQztJQUNoQyxDQUFDLENBQUM7RUFDSixDQUFDOztFQUVEO0VBQ0EsTUFBTXJJLGNBQWMsR0FBR0EsQ0FBQ3NJLFNBQVMsRUFBRXZSLFFBQVEsS0FBSztJQUM5QyxJQUFJd1IsS0FBSzs7SUFFVDtJQUNBLElBQUlELFNBQVMsQ0FBQzVQLElBQUksS0FBSyxPQUFPLEVBQUU7TUFDOUI2UCxLQUFLLEdBQUcsZUFBZTtJQUN6QixDQUFDLE1BQU0sSUFBSUQsU0FBUyxDQUFDNVAsSUFBSSxLQUFLLFVBQVUsRUFBRTtNQUN4QzZQLEtBQUssR0FBRyxjQUFjO0lBQ3hCLENBQUMsTUFBTTtNQUNMLE1BQU14USxLQUFLO0lBQ2I7O0lBRUE7SUFDQSxNQUFNeVEsT0FBTyxHQUFHNVAsUUFBUSxDQUNyQkMsY0FBYyxDQUFDMFAsS0FBSyxDQUFDLENBQ3JCaE4sYUFBYSxDQUFDLGtCQUFrQixDQUFDOztJQUVwQztJQUNBLE1BQU1vRSxJQUFJLEdBQUcySSxTQUFTLENBQUM5SixTQUFTLENBQUN1RyxPQUFPLENBQUNoTyxRQUFRLENBQUM7O0lBRWxEO0lBQ0EsTUFBTTBSLE9BQU8sR0FBRzdQLFFBQVEsQ0FBQ0csYUFBYSxDQUFDLEtBQUssQ0FBQztJQUM3QzBQLE9BQU8sQ0FBQ3BCLFNBQVMsR0FBRywrQkFBK0I7O0lBRW5EO0lBQ0EsTUFBTXFCLEtBQUssR0FBRzlQLFFBQVEsQ0FBQ0csYUFBYSxDQUFDLElBQUksQ0FBQztJQUMxQzJQLEtBQUssQ0FBQzFQLFdBQVcsR0FBR2pDLFFBQVEsQ0FBQyxDQUFDO0lBQzlCMFIsT0FBTyxDQUFDdFAsV0FBVyxDQUFDdVAsS0FBSyxDQUFDOztJQUUxQjtJQUNBLE1BQU03RixhQUFhLEdBQUd5RixTQUFTLENBQUM5SixTQUFTLENBQUN3RyxnQkFBZ0IsQ0FBQ2pPLFFBQVEsQ0FBQzs7SUFFcEU7SUFDQSxNQUFNb1EsU0FBUyxHQUFHSCxTQUFTLENBQUNySCxJQUFJLEVBQUU0SSxLQUFLLEVBQUUxRixhQUFhLENBQUM7O0lBRXZEO0lBQ0EsTUFBTThGLFFBQVEsR0FBRy9QLFFBQVEsQ0FBQ0csYUFBYSxDQUFDLEtBQUssQ0FBQztJQUM5QzRQLFFBQVEsQ0FBQ3RCLFNBQVMsR0FBRyxxQkFBcUI7SUFDMUNGLFNBQVMsQ0FBQy9MLE9BQU8sQ0FBRWdNLElBQUksSUFBSztNQUMxQnVCLFFBQVEsQ0FBQ3hQLFdBQVcsQ0FBQ2lPLElBQUksQ0FBQztJQUM1QixDQUFDLENBQUM7SUFDRnFCLE9BQU8sQ0FBQ3RQLFdBQVcsQ0FBQ3dQLFFBQVEsQ0FBQztJQUU3QkgsT0FBTyxDQUFDclAsV0FBVyxDQUFDc1AsT0FBTyxDQUFDO0VBQzlCLENBQUM7O0VBRUQ7RUFDQSxNQUFNMUksZUFBZSxHQUFHQSxDQUFDdUksU0FBUyxFQUFFdlIsUUFBUSxLQUFLO0lBQy9DLElBQUl3UixLQUFLOztJQUVUO0lBQ0EsSUFBSUQsU0FBUyxDQUFDNVAsSUFBSSxLQUFLLE9BQU8sRUFBRTtNQUM5QjZQLEtBQUssR0FBRyxhQUFhO0lBQ3ZCLENBQUMsTUFBTSxJQUFJRCxTQUFTLENBQUM1UCxJQUFJLEtBQUssVUFBVSxFQUFFO01BQ3hDNlAsS0FBSyxHQUFHLFlBQVk7SUFDdEIsQ0FBQyxNQUFNO01BQ0wsTUFBTXhRLEtBQUssQ0FBQyx1REFBdUQsQ0FBQztJQUN0RTs7SUFFQTtJQUNBLE1BQU07TUFBRVcsSUFBSSxFQUFFbUcsVUFBVTtNQUFFTDtJQUFVLENBQUMsR0FBRzhKLFNBQVM7O0lBRWpEO0lBQ0EsTUFBTU0sT0FBTyxHQUFHcEssU0FBUyxDQUFDdUcsT0FBTyxDQUFDaE8sUUFBUSxDQUFDO0lBQzNDLE1BQU04TCxhQUFhLEdBQUdyRSxTQUFTLENBQUN3RyxnQkFBZ0IsQ0FBQ2pPLFFBQVEsQ0FBQzs7SUFFMUQ7SUFDQSxNQUFNb1EsU0FBUyxHQUFHSCxTQUFTLENBQUM0QixPQUFPLEVBQUVMLEtBQUssRUFBRTFGLGFBQWEsQ0FBQzs7SUFFMUQ7SUFDQTtJQUNBQSxhQUFhLENBQUN6SCxPQUFPLENBQUVjLFFBQVEsSUFBSztNQUNsQyxNQUFNWixXQUFXLEdBQUcxQyxRQUFRLENBQUNDLGNBQWMsQ0FBRSxHQUFFZ0csVUFBVyxJQUFHM0MsUUFBUyxFQUFDLENBQUM7TUFDeEU7TUFDQSxNQUFNMk0sUUFBUSxHQUFHMUIsU0FBUyxDQUFDekgsSUFBSSxDQUM1Qm9KLE9BQU8sSUFBS0EsT0FBTyxDQUFDOU0sT0FBTyxDQUFDRSxRQUFRLEtBQUtBLFFBQzVDLENBQUM7TUFFRCxJQUFJWixXQUFXLElBQUl1TixRQUFRLEVBQUU7UUFDM0I7UUFDQXZOLFdBQVcsQ0FBQ25DLFdBQVcsQ0FBQzBQLFFBQVEsQ0FBQztNQUNuQztJQUNGLENBQUMsQ0FBQztFQUNKLENBQUM7RUFFRCxPQUFPO0lBQ0x2TyxlQUFlO0lBQ2ZELGFBQWE7SUFDYm1ELGFBQWE7SUFDYndDLGNBQWM7SUFDZEQ7RUFDRixDQUFDO0FBQ0gsQ0FBQztBQUVELGlFQUFlbUYsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDalB4QjtBQUMwRztBQUNqQjtBQUN6Riw4QkFBOEIsbUZBQTJCLENBQUMsNEZBQXFDO0FBQy9GO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQjtBQUMxQixtQkFBbUI7QUFDbkIsdUJBQXVCO0FBQ3ZCLHlCQUF5QjtBQUN6Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG9CQUFvQjtBQUNwQixrQ0FBa0M7QUFDbEMsb0JBQW9CO0FBQ3BCO0FBQ0Esa0JBQWtCO0FBQ2xCLG1JQUFtSTtBQUNuSSxpQ0FBaUM7QUFDakMsbUNBQW1DO0FBQ25DLDRDQUE0QztBQUM1Qzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGFBQWE7QUFDYix3QkFBd0I7QUFDeEI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGFBQWE7QUFDYixrQkFBa0I7QUFDbEIseUJBQXlCO0FBQ3pCOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUhBQW1IO0FBQ25ILGlDQUFpQztBQUNqQyxtQ0FBbUM7QUFDbkMsa0JBQWtCO0FBQ2xCOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGtCQUFrQjtBQUNsQix5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QjtBQUN4QixrQ0FBa0M7QUFDbEMsb0NBQW9DO0FBQ3BDLG1CQUFtQjtBQUNuQix3QkFBd0I7QUFDeEIsd0JBQXdCO0FBQ3hCLGtCQUFrQjtBQUNsQixhQUFhO0FBQ2IsY0FBYztBQUNkOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QjtBQUM5QixpQ0FBaUM7QUFDakMsMEJBQTBCO0FBQzFCOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGlDQUFpQztBQUNqQyx3QkFBd0I7QUFDeEI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhCQUE4QjtBQUM5QixpQkFBaUI7QUFDakI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGNBQWM7QUFDZCxrQkFBa0I7QUFDbEI7O0FBRUE7QUFDQTtBQUNBLGNBQWM7QUFDZCxrQkFBa0I7QUFDbEI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEIsMEJBQTBCO0FBQzFCOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsT0FBTyxrRkFBa0YsWUFBWSxNQUFNLE9BQU8scUJBQXFCLG9CQUFvQixxQkFBcUIscUJBQXFCLE1BQU0sTUFBTSxXQUFXLE1BQU0sWUFBWSxNQUFNLE1BQU0scUJBQXFCLHFCQUFxQixxQkFBcUIsVUFBVSxvQkFBb0IscUJBQXFCLHFCQUFxQixxQkFBcUIscUJBQXFCLE1BQU0sT0FBTyxNQUFNLEtBQUssb0JBQW9CLHFCQUFxQixNQUFNLFFBQVEsTUFBTSxLQUFLLG9CQUFvQixvQkFBb0IscUJBQXFCLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxXQUFXLE1BQU0sTUFBTSxNQUFNLFVBQVUsV0FBVyxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssVUFBVSxXQUFXLE1BQU0sTUFBTSxNQUFNLE1BQU0sV0FBVyxNQUFNLFNBQVMsTUFBTSxRQUFRLHFCQUFxQixxQkFBcUIscUJBQXFCLG9CQUFvQixNQUFNLE1BQU0sTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLE1BQU0sTUFBTSxVQUFVLFVBQVUsV0FBVyxXQUFXLE1BQU0sS0FBSyxVQUFVLE1BQU0sS0FBSyxVQUFVLE1BQU0sUUFBUSxNQUFNLEtBQUssb0JBQW9CLHFCQUFxQixxQkFBcUIsTUFBTSxRQUFRLE1BQU0sU0FBUyxxQkFBcUIscUJBQXFCLHFCQUFxQixvQkFBb0IscUJBQXFCLHFCQUFxQixvQkFBb0Isb0JBQW9CLG9CQUFvQixNQUFNLE1BQU0sTUFBTSxNQUFNLFdBQVcsTUFBTSxPQUFPLE1BQU0sUUFBUSxxQkFBcUIscUJBQXFCLHFCQUFxQixNQUFNLE1BQU0sTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sTUFBTSxNQUFNLFVBQVUsTUFBTSxPQUFPLE1BQU0sS0FBSyxxQkFBcUIscUJBQXFCLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE9BQU8sTUFBTSxLQUFLLHFCQUFxQixvQkFBb0IsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxNQUFNLGlCQUFpQixVQUFVLE1BQU0sS0FBSyxVQUFVLFVBQVUsTUFBTSxLQUFLLFVBQVUsTUFBTSxPQUFPLFdBQVcsVUFBVSxVQUFVLE1BQU0sTUFBTSxLQUFLLEtBQUssVUFBVSxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxPQUFPLE1BQU0sS0FBSyxvQkFBb0Isb0JBQW9CLE1BQU0sTUFBTSxvQkFBb0Isb0JBQW9CLE1BQU0sTUFBTSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sS0FBSyxLQUFLLFVBQVUsTUFBTSxRQUFRLE1BQU0sWUFBWSxvQkFBb0IscUJBQXFCLE1BQU0sTUFBTSxNQUFNLE1BQU0sVUFBVSxVQUFVLE1BQU0sV0FBVyxLQUFLLFVBQVUsTUFBTSxLQUFLLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsS0FBSyxNQUFNLEtBQUssV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxLQUFLLEtBQUssS0FBSyxLQUFLLE1BQU0sT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFN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SUFBSTtXQUNKO1dBQ0E7V0FDQSxJQUFJO1dBQ0o7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsQ0FBQztXQUNEO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxFQUFFO1dBQ0Y7V0FDQSxzR0FBc0c7V0FDdEc7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEdBQUc7V0FDSDtXQUNBLEVBQUU7V0FDRjtXQUNBOzs7OztXQ2hFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7V0NOQTs7Ozs7VUVBQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9hY3Rpb25Db250cm9sbGVyLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9lcnJvcnMuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2dhbWUuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2dhbWVib2FyZC5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3BsYXllci5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvc2hpcC5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvdWlNYW5hZ2VyLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9zdHlsZXMuY3NzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3N0eWxlcy5jc3M/MGEyNSIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2FzeW5jIG1vZHVsZSIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL25vbmNlIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgR2FtZWJvYXJkIGZyb20gXCIuL2dhbWVib2FyZFwiO1xuXG5jb25zdCB7IGdyaWQgfSA9IEdhbWVib2FyZCgpO1xuXG5jb25zdCBzaGlwc1RvUGxhY2UgPSBbXG4gIHsgc2hpcFR5cGU6IFwiY2FycmllclwiLCBzaGlwTGVuZ3RoOiA1IH0sXG4gIHsgc2hpcFR5cGU6IFwiYmF0dGxlc2hpcFwiLCBzaGlwTGVuZ3RoOiA0IH0sXG4gIHsgc2hpcFR5cGU6IFwic3VibWFyaW5lXCIsIHNoaXBMZW5ndGg6IDMgfSxcbiAgeyBzaGlwVHlwZTogXCJjcnVpc2VyXCIsIHNoaXBMZW5ndGg6IDMgfSxcbiAgeyBzaGlwVHlwZTogXCJkZXN0cm95ZXJcIiwgc2hpcExlbmd0aDogMiB9LFxuXTtcblxubGV0IGN1cnJlbnRPcmllbnRhdGlvbiA9IFwiaFwiOyAvLyBEZWZhdWx0IG9yaWVudGF0aW9uXG5sZXQgY3VycmVudFNoaXA7XG5sZXQgbGFzdEhvdmVyZWRDZWxsID0gbnVsbDsgLy8gU3RvcmUgdGhlIGxhc3QgaG92ZXJlZCBjZWxsJ3MgSURcblxuY29uc3QgcGxhY2VTaGlwR3VpZGUgPSB7XG4gIHByb21wdDpcbiAgICBcIkVudGVyIHRoZSBncmlkIHBvc2l0aW9uIChpLmUuICdBMScpIGFuZCBvcmllbnRhdGlvbiAoJ2gnIGZvciBob3Jpem9udGFsIGFuZCAndicgZm9yIHZlcnRpY2FsKSwgc2VwYXJhdGVkIHdpdGggYSBzcGFjZS4gRm9yIGV4YW1wbGUgJ0EyIHYnLiBBbHRlcm5hdGl2ZWx5LCBvbiB5b3UgZ2FtZWJvYXJkIGNsaWNrIHRoZSBjZWxsIHlvdSB3YW50IHRvIHNldCBhdCB0aGUgc3RhcnRpbmcgcG9pbnQsIHVzZSBzcGFjZWJhciB0byB0b2dnbGUgdGhlIG9yaWVudGF0aW9uLlwiLFxuICBwcm9tcHRUeXBlOiBcImd1aWRlXCIsXG59O1xuXG5jb25zdCBnYW1lcGxheUd1aWRlID0ge1xuICBwcm9tcHQ6XG4gICAgXCJFbnRlciBncmlkIHBvc2l0aW9uIChpLmUuICdBMScpIHlvdSB3YW50IHRvIGF0dGFjay4gQWx0ZXJuYXRpdmVseSwgY2xpY2sgdGhlIGNlbGwgeW91IHdhbnQgdG8gYXR0YWNrIG9uIHRoZSBvcHBvbmVudCdzIGdhbWVib2FyZFwiLFxuICBwcm9tcHRUeXBlOiBcImd1aWRlXCIsXG59O1xuXG5jb25zdCB0dXJuUHJvbXB0ID0ge1xuICBwcm9tcHQ6IFwiTWFrZSB5b3VyIG1vdmUuXCIsXG4gIHByb21wdFR5cGU6IFwiaW5zdHJ1Y3Rpb25cIixcbn07XG5cbmNvbnN0IHByb2Nlc3NDb21tYW5kID0gKGNvbW1hbmQsIGlzTW92ZSkgPT4ge1xuICAvLyBJZiBpc01vdmUgaXMgdHJ1dGh5LCBhc3NpZ24gYXMgc2luZ2xlIGl0ZW0gYXJyYXksIG90aGVyd2lzZSBzcGxpdCB0aGUgY29tbWFuZCBieSBzcGFjZVxuICBjb25zdCBwYXJ0cyA9IGlzTW92ZSA/IFtjb21tYW5kXSA6IGNvbW1hbmQuc3BsaXQoXCIgXCIpO1xuICBpZiAoIWlzTW92ZSAmJiBwYXJ0cy5sZW5ndGggIT09IDIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIkludmFsaWQgY29tbWFuZCBmb3JtYXQuIFBsZWFzZSB1c2UgdGhlIGZvcm1hdCAnR3JpZFBvc2l0aW9uIE9yaWVudGF0aW9uJy5cIixcbiAgICApO1xuICB9XG5cbiAgLy8gUHJvY2VzcyBhbmQgdmFsaWRhdGUgdGhlIGdyaWQgcG9zaXRpb25cbiAgY29uc3QgZ3JpZFBvc2l0aW9uID0gcGFydHNbMF0udG9VcHBlckNhc2UoKTtcbiAgaWYgKGdyaWRQb3NpdGlvbi5sZW5ndGggPCAyIHx8IGdyaWRQb3NpdGlvbi5sZW5ndGggPiAzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBncmlkIHBvc2l0aW9uLiBNdXN0IGJlIDIgdG8gMyBjaGFyYWN0ZXJzIGxvbmcuXCIpO1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgZ3JpZCBwb3NpdGlvbiBhZ2FpbnN0IHRoZSBncmlkIG1hdHJpeFxuICBjb25zdCB2YWxpZEdyaWRQb3NpdGlvbnMgPSBncmlkLmZsYXQoKTsgLy8gRmxhdHRlbiB0aGUgZ3JpZCBmb3IgZWFzaWVyIHNlYXJjaGluZ1xuICBpZiAoIXZhbGlkR3JpZFBvc2l0aW9ucy5pbmNsdWRlcyhncmlkUG9zaXRpb24pKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgXCJJbnZhbGlkIGdyaWQgcG9zaXRpb24uIERvZXMgbm90IG1hdGNoIGFueSB2YWxpZCBncmlkIHZhbHVlcy5cIixcbiAgICApO1xuICB9XG5cbiAgY29uc3QgcmVzdWx0ID0geyBncmlkUG9zaXRpb24gfTtcblxuICBpZiAoIWlzTW92ZSkge1xuICAgIC8vIFByb2Nlc3MgYW5kIHZhbGlkYXRlIHRoZSBvcmllbnRhdGlvblxuICAgIGNvbnN0IG9yaWVudGF0aW9uID0gcGFydHNbMV0udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAob3JpZW50YXRpb24gIT09IFwiaFwiICYmIG9yaWVudGF0aW9uICE9PSBcInZcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBcIkludmFsaWQgb3JpZW50YXRpb24uIE11c3QgYmUgZWl0aGVyICdoJyBmb3IgaG9yaXpvbnRhbCBvciAndicgZm9yIHZlcnRpY2FsLlwiLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXN1bHQub3JpZW50YXRpb24gPSBvcmllbnRhdGlvbjtcbiAgfVxuXG4gIC8vIFJldHVybiB0aGUgcHJvY2Vzc2VkIGFuZCB2YWxpZGF0ZWQgY29tbWFuZCBwYXJ0c1xuICByZXR1cm4gcmVzdWx0O1xufTtcblxuLy8gVGhlIGZ1bmN0aW9uIGZvciB1cGRhdGluZyB0aGUgb3V0cHV0IGRpdiBlbGVtZW50XG5jb25zdCB1cGRhdGVPdXRwdXQgPSAobWVzc2FnZSwgdHlwZSkgPT4ge1xuICAvLyBHZXQgdGhlIG91cHV0IGVsZW1lbnRcbiAgY29uc3Qgb3V0cHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLW91dHB1dFwiKTtcblxuICAvLyBBcHBlbmQgbmV3IG1lc3NhZ2VcbiAgY29uc3QgbWVzc2FnZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpOyAvLyBDcmVhdGUgYSBuZXcgZGl2IGZvciB0aGUgbWVzc2FnZVxuICBtZXNzYWdlRWxlbWVudC50ZXh0Q29udGVudCA9IG1lc3NhZ2U7IC8vIFNldCB0aGUgdGV4dCBjb250ZW50IHRvIHRoZSBtZXNzYWdlXG5cbiAgLy8gQXBwbHkgc3R5bGluZyBiYXNlZCBvbiBwcm9tcHRUeXBlXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgXCJ2YWxpZFwiOlxuICAgICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcInRleHQtbGltZS02MDBcIik7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwibWlzc1wiOlxuICAgICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcInRleHQtb3JhbmdlLTUwMFwiKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcInRleHQtcmVkLTUwMFwiKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwidGV4dC1ncmF5LTgwMFwiKTsgLy8gRGVmYXVsdCB0ZXh0IGNvbG9yXG4gIH1cblxuICBvdXRwdXQuYXBwZW5kQ2hpbGQobWVzc2FnZUVsZW1lbnQpOyAvLyBBZGQgdGhlIGVsZW1lbnQgdG8gdGhlIG91dHB1dFxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBvdXRwdXQuc2Nyb2xsVG9wID0gb3V0cHV0LnNjcm9sbEhlaWdodDsgLy8gU2Nyb2xsIHRvIHRoZSBib3R0b20gb2YgdGhlIG91dHB1dCBjb250YWluZXJcbn07XG5cbi8vIFRoZSBmdW5jdGlvbiBmb3IgZXhlY3V0aW5nIGNvbW1hbmRzIGZyb20gdGhlIGNvbnNvbGUgaW5wdXRcbmNvbnN0IGNvbnNvbGVMb2dQbGFjZW1lbnRDb21tYW5kID0gKHNoaXBUeXBlLCBncmlkUG9zaXRpb24sIG9yaWVudGF0aW9uKSA9PiB7XG4gIC8vIFNldCB0aGUgb3JpZW50YXRpb24gZmVlZGJhY2tcbiAgY29uc3QgZGlyRmVlYmFjayA9IG9yaWVudGF0aW9uID09PSBcImhcIiA/IFwiaG9yaXpvbnRhbGx5XCIgOiBcInZlcnRpY2FsbHlcIjtcbiAgLy8gU2V0IHRoZSBjb25zb2xlIG1lc3NhZ2VcbiAgY29uc3QgbWVzc2FnZSA9IGAke3NoaXBUeXBlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc2hpcFR5cGUuc2xpY2UoMSl9IHBsYWNlZCBhdCAke2dyaWRQb3NpdGlvbn0gZmFjaW5nICR7ZGlyRmVlYmFja31gO1xuXG4gIGNvbnNvbGUubG9nKGAke21lc3NhZ2V9YCk7XG5cbiAgdXBkYXRlT3V0cHV0KGA+ICR7bWVzc2FnZX1gLCBcInZhbGlkXCIpO1xuXG4gIC8vIENsZWFyIHRoZSBpbnB1dFxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtaW5wdXRcIikudmFsdWUgPSBcIlwiO1xufTtcblxuLy8gVGhlIGZ1bmN0aW9uIGZvciBleGVjdXRpbmcgY29tbWFuZHMgZnJvbSB0aGUgY29uc29sZSBpbnB1dFxuY29uc3QgY29uc29sZUxvZ01vdmVDb21tYW5kID0gKHJlc3VsdHNPYmplY3QpID0+IHtcbiAgLy8gU2V0IHRoZSBjb25zb2xlIG1lc3NhZ2VcbiAgY29uc3QgbWVzc2FnZSA9IGBUaGUgJHtyZXN1bHRzT2JqZWN0LnBsYXllcn0ncyBtb3ZlIHJlc3VsdGVkIGluIGEgJHtyZXN1bHRzT2JqZWN0LmhpdCA/IFwiSElUXCIgOiBcIk1JU1NcIn0hYDtcblxuICBjb25zb2xlLmxvZyhgJHttZXNzYWdlfWApO1xuXG4gIHVwZGF0ZU91dHB1dChgPiAke21lc3NhZ2V9YCwgcmVzdWx0c09iamVjdC5oaXQgPyBcInZhbGlkXCIgOiBcIm1pc3NcIik7XG5cbiAgLy8gQ2xlYXIgdGhlIGlucHV0XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1pbnB1dFwiKS52YWx1ZSA9IFwiXCI7XG59O1xuXG5jb25zdCBjb25zb2xlTG9nRXJyb3IgPSAoZXJyb3IsIHNoaXBUeXBlKSA9PiB7XG4gIGlmIChzaGlwVHlwZSkge1xuICAgIC8vIElmIHNoaXBUeXBlIGlzIHBhc3NlZCB0aGVuIHByb2Nlc3MgZXJyb3IgYXMgcGxhY2VtZW50IGVycm9yXG4gICAgY29uc29sZS5lcnJvcihgRXJyb3IgcGxhY2luZyAke3NoaXBUeXBlfTogbWVzc2FnZSA9ICR7ZXJyb3IubWVzc2FnZX0uYCk7XG5cbiAgICB1cGRhdGVPdXRwdXQoYD4gRXJyb3IgcGxhY2luZyAke3NoaXBUeXBlfTogJHtlcnJvci5tZXNzYWdlfWAsIFwiZXJyb3JcIik7XG4gIH0gZWxzZSB7XG4gICAgLy8gZWxzZSBpZiBzaGlwVHlwZSBpcyB1bmRlZmluZWQsIHByb2Nlc3MgZXJyb3IgYXMgbW92ZSBlcnJvclxuICAgIGNvbnNvbGUubG9nKGBFcnJvciBtYWtpbmcgbW92ZTogbWVzc2FnZSA9ICR7ZXJyb3IubWVzc2FnZX0uYCk7XG5cbiAgICB1cGRhdGVPdXRwdXQoYD4gRXJyb3IgbWFraW5nIG1vdmU6IG1lc3NhZ2UgPSAke2Vycm9yLm1lc3NhZ2V9LmAsIFwiZXJyb3JcIik7XG4gIH1cblxuICAvLyBDbGVhciB0aGUgaW5wdXRcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLWlucHV0XCIpLnZhbHVlID0gXCJcIjtcbn07XG5cbi8vIEZ1bmN0aW9uIGluaXRpYWxpc2UgdWlNYW5hZ2VyXG5jb25zdCBpbml0VWlNYW5hZ2VyID0gKHVpTWFuYWdlcikgPT4ge1xuICAvLyBJbml0aWFsaXNlIGNvbnNvbGVcbiAgdWlNYW5hZ2VyLmluaXRDb25zb2xlVUkoKTtcblxuICAvLyBJbml0aWFsaXNlIGdhbWVib2FyZCB3aXRoIGNhbGxiYWNrIGZvciBjZWxsIGNsaWNrc1xuICB1aU1hbmFnZXIuY3JlYXRlR2FtZWJvYXJkKFwiaHVtYW4tZ2JcIik7XG4gIHVpTWFuYWdlci5jcmVhdGVHYW1lYm9hcmQoXCJjb21wLWdiXCIpO1xufTtcblxuLy8gRnVuY3Rpb24gdG8gY2FsY3VsYXRlIGNlbGwgSURzIGJhc2VkIG9uIHN0YXJ0IHBvc2l0aW9uLCBsZW5ndGgsIGFuZCBvcmllbnRhdGlvblxuZnVuY3Rpb24gY2FsY3VsYXRlU2hpcENlbGxzKHN0YXJ0Q2VsbCwgc2hpcExlbmd0aCwgb3JpZW50YXRpb24pIHtcbiAgY29uc3QgY2VsbElkcyA9IFtdO1xuICBjb25zdCByb3dJbmRleCA9IHN0YXJ0Q2VsbC5jaGFyQ29kZUF0KDApIC0gXCJBXCIuY2hhckNvZGVBdCgwKTtcbiAgY29uc3QgY29sSW5kZXggPSBwYXJzZUludChzdGFydENlbGwuc3Vic3RyaW5nKDEpLCAxMCkgLSAxO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgaWYgKG9yaWVudGF0aW9uID09PSBcInZcIikge1xuICAgICAgaWYgKGNvbEluZGV4ICsgaSA+PSBncmlkWzBdLmxlbmd0aCkgYnJlYWs7IC8vIENoZWNrIGdyaWQgYm91bmRzXG4gICAgICBjZWxsSWRzLnB1c2goXG4gICAgICAgIGAke1N0cmluZy5mcm9tQ2hhckNvZGUocm93SW5kZXggKyBcIkFcIi5jaGFyQ29kZUF0KDApKX0ke2NvbEluZGV4ICsgaSArIDF9YCxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChyb3dJbmRleCArIGkgPj0gZ3JpZC5sZW5ndGgpIGJyZWFrOyAvLyBDaGVjayBncmlkIGJvdW5kc1xuICAgICAgY2VsbElkcy5wdXNoKFxuICAgICAgICBgJHtTdHJpbmcuZnJvbUNoYXJDb2RlKHJvd0luZGV4ICsgaSArIFwiQVwiLmNoYXJDb2RlQXQoMCkpfSR7Y29sSW5kZXggKyAxfWAsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjZWxsSWRzO1xufVxuXG4vLyBGdW5jdGlvbiB0byBoaWdobGlnaHQgY2VsbHNcbmZ1bmN0aW9uIGhpZ2hsaWdodENlbGxzKGNlbGxJZHMpIHtcbiAgY2VsbElkcy5mb3JFYWNoKChjZWxsSWQpID0+IHtcbiAgICBjb25zdCBjZWxsRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiJHtjZWxsSWR9XCJdYCk7XG4gICAgaWYgKGNlbGxFbGVtZW50KSB7XG4gICAgICBjZWxsRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiYmctb3JhbmdlLTQwMFwiKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBGdW5jdGlvbiB0byBjbGVhciBoaWdobGlnaHQgZnJvbSBjZWxsc1xuZnVuY3Rpb24gY2xlYXJIaWdobGlnaHQoY2VsbElkcykge1xuICBjZWxsSWRzLmZvckVhY2goKGNlbGxJZCkgPT4ge1xuICAgIGNvbnN0IGNlbGxFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcG9zaXRpb249XCIke2NlbGxJZH1cIl1gKTtcbiAgICBpZiAoY2VsbEVsZW1lbnQpIHtcbiAgICAgIGNlbGxFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJiZy1vcmFuZ2UtNDAwXCIpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIEZ1bmN0aW9uIHRvIHRvZ2dsZSBvcmllbnRhdGlvblxuZnVuY3Rpb24gdG9nZ2xlT3JpZW50YXRpb24oKSB7XG4gIGN1cnJlbnRPcmllbnRhdGlvbiA9IGN1cnJlbnRPcmllbnRhdGlvbiA9PT0gXCJoXCIgPyBcInZcIiA6IFwiaFwiO1xuICAvLyBVcGRhdGUgdGhlIHZpc3VhbCBwcm9tcHQgaGVyZSBpZiBuZWNlc3Nhcnlcbn1cblxuY29uc3QgaGFuZGxlUGxhY2VtZW50SG92ZXIgPSAoZSkgPT4ge1xuICBjb25zdCBjZWxsID0gZS50YXJnZXQ7XG4gIGlmIChcbiAgICBjZWxsLmNsYXNzTGlzdC5jb250YWlucyhcImdhbWVib2FyZC1jZWxsXCIpICYmXG4gICAgY2VsbC5kYXRhc2V0LnBsYXllciA9PT0gXCJodW1hblwiXG4gICkge1xuICAgIC8vIExvZ2ljIHRvIGhhbmRsZSBob3ZlciBlZmZlY3RcbiAgICBjb25zdCBjZWxsUG9zID0gY2VsbC5kYXRhc2V0LnBvc2l0aW9uO1xuICAgIGxhc3RIb3ZlcmVkQ2VsbCA9IGNlbGxQb3M7XG4gICAgY29uc3QgY2VsbHNUb0hpZ2hsaWdodCA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgIGNlbGxQb3MsXG4gICAgICBjdXJyZW50U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgY3VycmVudE9yaWVudGF0aW9uLFxuICAgICk7XG4gICAgaGlnaGxpZ2h0Q2VsbHMoY2VsbHNUb0hpZ2hsaWdodCk7XG4gIH1cbn07XG5cbmNvbnN0IGhhbmRsZU1vdXNlTGVhdmUgPSAoZSkgPT4ge1xuICBjb25zdCBjZWxsID0gZS50YXJnZXQ7XG4gIGlmIChjZWxsLmNsYXNzTGlzdC5jb250YWlucyhcImdhbWVib2FyZC1jZWxsXCIpKSB7XG4gICAgLy8gTG9naWMgZm9yIGhhbmRsaW5nIHdoZW4gdGhlIGN1cnNvciBsZWF2ZXMgYSBjZWxsXG4gICAgY29uc3QgY2VsbFBvcyA9IGNlbGwuZGF0YXNldC5wb3NpdGlvbjtcbiAgICBpZiAoY2VsbFBvcyA9PT0gbGFzdEhvdmVyZWRDZWxsKSB7XG4gICAgICBjb25zdCBjZWxsc1RvQ2xlYXIgPSBjYWxjdWxhdGVTaGlwQ2VsbHMoXG4gICAgICAgIGNlbGxQb3MsXG4gICAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICAgIGN1cnJlbnRPcmllbnRhdGlvbixcbiAgICAgICk7XG4gICAgICBjbGVhckhpZ2hsaWdodChjZWxsc1RvQ2xlYXIpO1xuICAgICAgbGFzdEhvdmVyZWRDZWxsID0gbnVsbDsgLy8gUmVzZXQgbGFzdEhvdmVyZWRDZWxsIHNpbmNlIHRoZSBtb3VzZSBoYXMgbGVmdFxuICAgIH1cbiAgICBsYXN0SG92ZXJlZENlbGwgPSBudWxsO1xuICB9XG59O1xuXG5jb25zdCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSA9IChlKSA9PiB7XG4gIGlmIChlLmtleSA9PT0gXCIgXCIgJiYgbGFzdEhvdmVyZWRDZWxsKSB7XG4gICAgLy8gRW5zdXJlIHNwYWNlYmFyIGlzIHByZXNzZWQgYW5kIHRoZXJlJ3MgYSBsYXN0IGhvdmVyZWQgY2VsbFxuICAgIGUucHJldmVudERlZmF1bHQoKTsgLy8gUHJldmVudCB0aGUgZGVmYXVsdCBzcGFjZWJhciBhY3Rpb25cblxuICAgIC8vIFRvZ2dsZSB0aGUgb3JpZW50YXRpb25cbiAgICB0b2dnbGVPcmllbnRhdGlvbigpO1xuXG4gICAgLy8gQ2xlYXIgcHJldmlvdXNseSBoaWdobGlnaHRlZCBjZWxsc1xuICAgIC8vIEFzc3VtaW5nIGNhbGN1bGF0ZVNoaXBDZWxscyBhbmQgY2xlYXJIaWdobGlnaHQgd29yayBjb3JyZWN0bHlcbiAgICBjb25zdCBvbGRDZWxsc1RvQ2xlYXIgPSBjYWxjdWxhdGVTaGlwQ2VsbHMoXG4gICAgICBsYXN0SG92ZXJlZENlbGwsXG4gICAgICBjdXJyZW50U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgY3VycmVudE9yaWVudGF0aW9uID09PSBcImhcIiA/IFwidlwiIDogXCJoXCIsXG4gICAgKTtcbiAgICBjbGVhckhpZ2hsaWdodChvbGRDZWxsc1RvQ2xlYXIpO1xuXG4gICAgLy8gSGlnaGxpZ2h0IG5ldyBjZWxscyBiYXNlZCBvbiB0aGUgbmV3IG9yaWVudGF0aW9uXG4gICAgY29uc3QgbmV3Q2VsbHNUb0hpZ2hsaWdodCA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgIGxhc3RIb3ZlcmVkQ2VsbCxcbiAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICBjdXJyZW50T3JpZW50YXRpb24sXG4gICAgKTtcbiAgICBoaWdobGlnaHRDZWxscyhuZXdDZWxsc1RvSGlnaGxpZ2h0KTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZW5hYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlcigpIHtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvckFsbCgnLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPVwiY29tcHV0ZXJcIl0nKVxuICAgIC5mb3JFYWNoKChjZWxsKSA9PiB7XG4gICAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUoXCJwb2ludGVyLWV2ZW50cy1ub25lXCIsIFwiY3Vyc29yLWRlZmF1bHRcIik7XG4gICAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUoXCJob3ZlcjpiZy1vcmFuZ2UtNTAwXCIpO1xuICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKFwiaG92ZXI6Ymctb3JhbmdlLTUwMFwiKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZGlzYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoKSB7XG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImNvbXB1dGVyXCJdJylcbiAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKFwicG9pbnRlci1ldmVudHMtbm9uZVwiLCBcImN1cnNvci1kZWZhdWx0XCIpO1xuICAgICAgY2VsbC5jbGFzc0xpc3QucmVtb3ZlKFwiaG92ZXI6Ymctb3JhbmdlLTUwMFwiKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZGlzYWJsZUh1bWFuR2FtZWJvYXJkSG92ZXIoKSB7XG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImh1bWFuXCJdJylcbiAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKFwicG9pbnRlci1ldmVudHMtbm9uZVwiLCBcImN1cnNvci1kZWZhdWx0XCIpO1xuICAgICAgY2VsbC5jbGFzc0xpc3QucmVtb3ZlKFwiaG92ZXI6Ymctb3JhbmdlLTUwMFwiKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc3dpdGNoR2FtZWJvYXJkSG92ZXJTdGF0ZXMoKSB7XG4gIC8vIERpc2FibGUgaG92ZXIgb24gdGhlIGh1bWFuJ3MgZ2FtZWJvYXJkXG4gIGRpc2FibGVIdW1hbkdhbWVib2FyZEhvdmVyKCk7XG5cbiAgLy8gRW5hYmxlIGhvdmVyIG9uIHRoZSBjb21wdXRlcidzIGdhbWVib2FyZFxuICBlbmFibGVDb21wdXRlckdhbWVib2FyZEhvdmVyKCk7XG59XG5cbi8vIEZ1bmN0aW9uIHRvIHNldHVwIGdhbWVib2FyZCBmb3Igc2hpcCBwbGFjZW1lbnRcbmNvbnN0IHNldHVwR2FtZWJvYXJkRm9yUGxhY2VtZW50ID0gKCkgPT4ge1xuICBkaXNhYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlcigpO1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9XCJodW1hblwiXScpXG4gICAgLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgaGFuZGxlUGxhY2VtZW50SG92ZXIpO1xuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCBoYW5kbGVNb3VzZUxlYXZlKTtcbiAgICB9KTtcbiAgLy8gR2V0IGdhbWVib2FyZCBhcmVhIGRpdiBlbGVtZW50XG4gIGNvbnN0IGdhbWVib2FyZEFyZWEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgIFwiLmdhbWVib2FyZC1hcmVhLCBbZGF0YS1wbGF5ZXI9J2h1bWFuJ11cIixcbiAgKTtcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyB0byBnYW1lYm9hcmQgYXJlYSB0byBhZGQgYW5kIHJlbW92ZSB0aGVcbiAgLy8gaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUgZXZlbnQgbGlzdGVuZXIgd2hlbiBlbnRlcmluZyBhbmQgZXhpdGluZyB0aGUgYXJlYVxuICBnYW1lYm9hcmRBcmVhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSk7XG4gIH0pO1xuICBnYW1lYm9hcmRBcmVhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSk7XG4gIH0pO1xufTtcblxuLy8gRnVuY3Rpb24gdG8gY2xlYW4gdXAgYWZ0ZXIgc2hpcCBwbGFjZW1lbnQgaXMgY29tcGxldGVcbmNvbnN0IGNsZWFudXBBZnRlclBsYWNlbWVudCA9ICgpID0+IHtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvckFsbCgnLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPVwiaHVtYW5cIl0nKVxuICAgIC5mb3JFYWNoKChjZWxsKSA9PiB7XG4gICAgICBjZWxsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIGhhbmRsZVBsYWNlbWVudEhvdmVyKTtcbiAgICAgIGNlbGwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgaGFuZGxlTW91c2VMZWF2ZSk7XG4gICAgfSk7XG4gIC8vIEdldCBnYW1lYm9hcmQgYXJlYSBkaXYgZWxlbWVudFxuICBjb25zdCBnYW1lYm9hcmRBcmVhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICBcIi5nYW1lYm9hcmQtYXJlYSwgW2RhdGEtcGxheWVyPSdodW1hbiddXCIsXG4gICk7XG4gIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMgdG8gZ2FtZWJvYXJkIGFyZWEgdG8gYWRkIGFuZCByZW1vdmUgdGhlXG4gIC8vIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlIGV2ZW50IGxpc3RlbmVyIHdoZW4gZW50ZXJpbmcgYW5kIGV4aXRpbmcgdGhlIGFyZWFcbiAgZ2FtZWJvYXJkQXJlYS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xuICB9KTtcbiAgZ2FtZWJvYXJkQXJlYS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xuICB9KTtcbiAgLy8gUmVtb3ZlIGV2ZW50IGxpc3RlbmVyIGZvciBrZXlkb3duIGV2ZW50c1xuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSk7XG59O1xuXG4vLyBGdW5jdGlvbiBmb3Igc3RhcnRpbmcgdGhlIGdhbWVcbmNvbnN0IHN0YXJ0R2FtZSA9ICh1aU1hbmFnZXIsIGdhbWUpID0+IHtcbiAgLy8gU2V0IHVwIHRoZSBnYW1lIGJ5IGF1dG8gcGxhY2luZyBjb21wdXRlcidzIHNoaXBzIGFuZCBzZXR0aW5nIHRoZVxuICAvLyBjdXJyZW50IHBsYXllciB0byB0aGUgaHVtYW4gcGxheWVyXG4gIGdhbWUuc2V0VXAoKTtcblxuICAvLyBEaXNwbGF5IHByb21wdCBvYmplY3QgZm9yIHRha2luZyBhIHR1cm4gYW5kIHN0YXJ0aW5nIHRoZSBnYW1lXG4gIHVpTWFuYWdlci5kaXNwbGF5UHJvbXB0KHsgdHVyblByb21wdCwgZ2FtZXBsYXlHdWlkZSB9KTtcbn07XG5cbmNvbnN0IGhhbmRsZUh1bWFuTW92ZSA9IChlKSA9PiB7XG4gIC8vIEdldCB0aGUgcG9zaXRpb24gb24gdGhlIGJvYXJkIHRvIG1ha2UgYSBtb3ZlXG4gIGNvbnN0IHsgcG9zaXRpb24gfSA9IGUudGFyZ2V0LmRhdGE7XG59O1xuXG4vLyBTZXR1cCBnYW1lYm9hcmQgZm9yIGZvciBwbGF5ZXIgbW92ZVxuY29uc3Qgc2V0dXBHYW1lYm9hcmRGb3JQbGF5ZXJNb3ZlID0gKCkgPT4ge1xuICAvLyBFbmFibGUgdGhlIGhvdmVyIHN0YXRlIGZvciB0aGUgY29tcHV0ZXIgZ2FtZWJvYXJkXG4gIGVuYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoKTtcblxuICAvLyBTZXQgdXAgZXZlbnQgbGlzdGVuZXJzIG9uIHRoZSBjb21wdXRlciBnYW1lYm9hcmQgZm9yIHRoZSBwbGF5ZXJcbiAgLy8gbWFraW5nIG1vdmVzXG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImNvbXB1dGVyXCJdJylcbiAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgaGFuZGxlSHVtYW5Nb3ZlKTtcbiAgICB9KTtcbn07XG5cbmFzeW5jIGZ1bmN0aW9uIHBsYXllck1vdmUoKSB7XG4gIC8vIFdhaXQgZm9yIHBsYXllcidzIG1vdmUgKGNsaWNrIG9yIGNvbnNvbGUgaW5wdXQpXG4gIC8vIFVwZGF0ZSBVSSBiYXNlZCBvbiBtb3ZlXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvbXB1dGVyTW92ZShodW1hblBsYXllckdhbWVib2FyZCwgY29tcFBsYXllcikge1xuICBsZXQgY29tcE1vdmVSZXN1bHQ7XG4gIHRyeSB7XG4gICAgLy8gQ29tcHV0ZXIgbG9naWMgdG8gY2hvb3NlIGEgbW92ZVxuICAgIC8vIFVwZGF0ZSBVSSBiYXNlZCBvbiBtb3ZlXG4gICAgY29tcE1vdmVSZXN1bHQgPSBjb21wUGxheWVyLm1ha2VNb3ZlKGh1bWFuUGxheWVyR2FtZWJvYXJkKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlTG9nRXJyb3IoZXJyb3IpO1xuICB9XG4gIHJldHVybiBjb21wTW92ZVJlc3VsdDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY2hlY2tXaW5Db25kaXRpb24oKSB7XG4gIC8vIENoZWNrIGlmIGFsbCBzaGlwcyBhcmUgc3Vua1xuICAvLyBSZXR1cm4gdHJ1ZSBpZiBnYW1lIGlzIG92ZXIsIGZhbHNlIG90aGVyd2lzZVxufVxuXG5mdW5jdGlvbiBjb25jbHVkZUdhbWUoKSB7XG4gIC8vIERpc3BsYXkgd2lubmVyLCB1cGRhdGUgVUksIGV0Yy5cbn1cblxuY29uc3QgQWN0aW9uQ29udHJvbGxlciA9ICh1aU1hbmFnZXIsIGdhbWUpID0+IHtcbiAgY29uc3QgaHVtYW5QbGF5ZXIgPSBnYW1lLnBsYXllcnMuaHVtYW47XG4gIGNvbnN0IGh1bWFuUGxheWVyR2FtZWJvYXJkID0gaHVtYW5QbGF5ZXIuZ2FtZWJvYXJkO1xuICBjb25zdCBjb21wUGxheWVyID0gZ2FtZS5wbGF5ZXJzLmNvbXB1dGVyO1xuICBjb25zdCBjb21wUGxheWVyR2FtZWJvYXJkID0gY29tcFBsYXllci5nYW1lYm9hcmQ7XG5cbiAgLy8gRnVuY3Rpb24gdG8gc2V0dXAgZXZlbnQgbGlzdGVuZXJzIGZvciBjb25zb2xlIGFuZCBnYW1lYm9hcmQgY2xpY2tzXG4gIGZ1bmN0aW9uIHNldHVwRXZlbnRMaXN0ZW5lcnMoaGFuZGxlckZ1bmN0aW9uLCBwbGF5ZXJUeXBlKSB7XG4gICAgLy8gRGVmaW5lIGNsZWFudXAgZnVuY3Rpb25zIGluc2lkZSB0byBlbnN1cmUgdGhleSBhcmUgYWNjZXNzaWJsZSBmb3IgcmVtb3ZhbFxuICAgIGNvbnN0IGNsZWFudXBGdW5jdGlvbnMgPSBbXTtcblxuICAgIGNvbnN0IGNvbnNvbGVTdWJtaXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtc3VibWl0XCIpO1xuICAgIGNvbnN0IGNvbnNvbGVJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1pbnB1dFwiKTtcblxuICAgIGNvbnN0IHN1Ym1pdEhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICBjb25zdCBpbnB1dCA9IGNvbnNvbGVJbnB1dC52YWx1ZTtcbiAgICAgIGhhbmRsZXJGdW5jdGlvbihpbnB1dCk7XG4gICAgICBjb25zb2xlSW5wdXQudmFsdWUgPSBcIlwiOyAvLyBDbGVhciBpbnB1dCBhZnRlciBzdWJtaXNzaW9uXG4gICAgfTtcblxuICAgIGNvbnN0IGtleXByZXNzSGFuZGxlciA9IChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09IFwiRW50ZXJcIikge1xuICAgICAgICBzdWJtaXRIYW5kbGVyKCk7IC8vIFJldXNlIHN1Ym1pdCBsb2dpYyBmb3IgRW50ZXIga2V5IHByZXNzXG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnNvbGVTdWJtaXRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHN1Ym1pdEhhbmRsZXIpO1xuICAgIGNvbnNvbGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwga2V5cHJlc3NIYW5kbGVyKTtcblxuICAgIC8vIEFkZCBjbGVhbnVwIGZ1bmN0aW9uIGZvciBjb25zb2xlIGxpc3RlbmVyc1xuICAgIGNsZWFudXBGdW5jdGlvbnMucHVzaCgoKSA9PiB7XG4gICAgICBjb25zb2xlU3VibWl0QnV0dG9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzdWJtaXRIYW5kbGVyKTtcbiAgICAgIGNvbnNvbGVJbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwga2V5cHJlc3NIYW5kbGVyKTtcbiAgICB9KTtcblxuICAgIC8vIFNldHVwIGZvciBnYW1lYm9hcmQgY2VsbCBjbGlja3NcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoYC5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj0ke3BsYXllclR5cGV9XWApXG4gICAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgICBjb25zdCBjbGlja0hhbmRsZXIgPSAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgeyBwb3NpdGlvbiB9ID0gY2VsbC5kYXRhc2V0O1xuICAgICAgICAgIGxldCBpbnB1dDtcbiAgICAgICAgICBpZiAocGxheWVyVHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICAgICAgICBpbnB1dCA9IGAke3Bvc2l0aW9ufSAke2N1cnJlbnRPcmllbnRhdGlvbn1gO1xuICAgICAgICAgIH0gZWxzZSBpZiAocGxheWVyVHlwZSA9PT0gXCJjb21wdXRlclwiKSB7XG4gICAgICAgICAgICBpbnB1dCA9IHBvc2l0aW9uO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIFwiRXJyb3IhIEludmFsaWQgcGxheWVyIHR5cGUgcGFzc2VkIHRvIGNsaWNrSGFuZGxlciFcIixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnNvbGUubG9nKGBjbGlja0hhbmRsZXIgaW5wdXQgPSAke2lucHV0fWApO1xuICAgICAgICAgIGhhbmRsZXJGdW5jdGlvbihpbnB1dCk7XG4gICAgICAgIH07XG4gICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsaWNrSGFuZGxlcik7XG5cbiAgICAgICAgLy8gQWRkIGNsZWFudXAgZnVuY3Rpb24gZm9yIGVhY2ggY2VsbCBsaXN0ZW5lclxuICAgICAgICBjbGVhbnVwRnVuY3Rpb25zLnB1c2goKCkgPT5cbiAgICAgICAgICBjZWxsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbGlja0hhbmRsZXIpLFxuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICAvLyBSZXR1cm4gYSBzaW5nbGUgY2xlYW51cCBmdW5jdGlvbiB0byByZW1vdmUgYWxsIGxpc3RlbmVyc1xuICAgIHJldHVybiAoKSA9PiBjbGVhbnVwRnVuY3Rpb25zLmZvckVhY2goKGNsZWFudXApID0+IGNsZWFudXAoKSk7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBwcm9tcHRBbmRQbGFjZVNoaXAoc2hpcFR5cGUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgLy8gU2V0IHRoZSBjdXJyZW50IHNoaXBcbiAgICAgIGN1cnJlbnRTaGlwID0gc2hpcHNUb1BsYWNlLmZpbmQoKHNoaXApID0+IHNoaXAuc2hpcFR5cGUgPT09IHNoaXBUeXBlKTtcblxuICAgICAgLy8gRGlzcGxheSBwcm9tcHQgZm9yIHRoZSBzcGVjaWZpYyBzaGlwIHR5cGUgYXMgd2VsbCBhcyB0aGUgZ3VpZGUgdG8gcGxhY2luZyBzaGlwc1xuICAgICAgY29uc3QgcGxhY2VTaGlwUHJvbXB0ID0ge1xuICAgICAgICBwcm9tcHQ6IGBQbGFjZSB5b3VyICR7c2hpcFR5cGV9LmAsXG4gICAgICAgIHByb21wdFR5cGU6IFwiaW5zdHJ1Y3Rpb25cIixcbiAgICAgIH07XG4gICAgICB1aU1hbmFnZXIuZGlzcGxheVByb21wdCh7IHBsYWNlU2hpcFByb21wdCwgcGxhY2VTaGlwR3VpZGUgfSk7XG5cbiAgICAgIGNvbnN0IGhhbmRsZVZhbGlkSW5wdXQgPSBhc3luYyAoaW5wdXQpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB7IGdyaWRQb3NpdGlvbiwgb3JpZW50YXRpb24gfSA9IHByb2Nlc3NDb21tYW5kKGlucHV0LCBmYWxzZSk7XG4gICAgICAgICAgYXdhaXQgaHVtYW5QbGF5ZXJHYW1lYm9hcmQucGxhY2VTaGlwKFxuICAgICAgICAgICAgc2hpcFR5cGUsXG4gICAgICAgICAgICBncmlkUG9zaXRpb24sXG4gICAgICAgICAgICBvcmllbnRhdGlvbixcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnNvbGVMb2dQbGFjZW1lbnRDb21tYW5kKHNoaXBUeXBlLCBncmlkUG9zaXRpb24sIG9yaWVudGF0aW9uKTtcbiAgICAgICAgICAvLyBSZW1vdmUgY2VsbCBoaWdobGlnaHRzXG4gICAgICAgICAgY29uc3QgY2VsbHNUb0NsZWFyID0gY2FsY3VsYXRlU2hpcENlbGxzKFxuICAgICAgICAgICAgZ3JpZFBvc2l0aW9uLFxuICAgICAgICAgICAgY3VycmVudFNoaXAuc2hpcExlbmd0aCxcbiAgICAgICAgICAgIG9yaWVudGF0aW9uLFxuICAgICAgICAgICk7XG4gICAgICAgICAgY2xlYXJIaWdobGlnaHQoY2VsbHNUb0NsZWFyKTtcblxuICAgICAgICAgIC8vIERpc3BsYXkgdGhlIHNoaXAgb24gdGhlIGdhbWUgYm9hcmQgYW5kIHNoaXAgc3RhdHVzIGRpc3BsYXlcbiAgICAgICAgICB1aU1hbmFnZXIucmVuZGVyU2hpcEJvYXJkKGh1bWFuUGxheWVyLCBzaGlwVHlwZSk7XG4gICAgICAgICAgdWlNYW5hZ2VyLnJlbmRlclNoaXBEaXNwKGh1bWFuUGxheWVyLCBzaGlwVHlwZSk7XG5cbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlLWJlZm9yZS1kZWZpbmVcbiAgICAgICAgICByZXNvbHZlU2hpcFBsYWNlbWVudCgpOyAvLyBTaGlwIHBsYWNlZCBzdWNjZXNzZnVsbHksIHJlc29sdmUgdGhlIHByb21pc2VcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlTG9nRXJyb3IoZXJyb3IsIHNoaXBUeXBlKTtcbiAgICAgICAgICAvLyBEbyBub3QgcmVqZWN0IHRvIGFsbG93IGZvciByZXRyeSwganVzdCBsb2cgdGhlIGVycm9yXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIFNldHVwIGV2ZW50IGxpc3RlbmVycyBhbmQgZW5zdXJlIHdlIGNhbiBjbGVhbiB0aGVtIHVwIGFmdGVyIHBsYWNlbWVudFxuICAgICAgY29uc3QgY2xlYW51cCA9IHNldHVwRXZlbnRMaXN0ZW5lcnMoaGFuZGxlVmFsaWRJbnB1dCwgXCJodW1hblwiKTtcblxuICAgICAgLy8gQXR0YWNoIGNsZWFudXAgdG8gcmVzb2x2ZSB0byBlbnN1cmUgaXQncyBjYWxsZWQgd2hlbiB0aGUgcHJvbWlzZSByZXNvbHZlc1xuICAgICAgY29uc3QgcmVzb2x2ZVNoaXBQbGFjZW1lbnQgPSAoKSA9PiB7XG4gICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFNlcXVlbnRpYWxseSBwcm9tcHQgZm9yIGFuZCBwbGFjZSBlYWNoIHNoaXBcbiAgYXN5bmMgZnVuY3Rpb24gc2V0dXBTaGlwc1NlcXVlbnRpYWxseSgpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoaXBzVG9QbGFjZS5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWF3YWl0LWluLWxvb3BcbiAgICAgIGF3YWl0IHByb21wdEFuZFBsYWNlU2hpcChzaGlwc1RvUGxhY2VbaV0uc2hpcFR5cGUpOyAvLyBXYWl0IGZvciBlYWNoIHNoaXAgdG8gYmUgcGxhY2VkIGJlZm9yZSBjb250aW51aW5nXG4gICAgfVxuICB9XG5cbiAgLy8gRnVuY3Rpb24gZm9yIGhhbmRsaW5nIHRoZSBnYW1lIHNldHVwIGFuZCBzaGlwIHBsYWNlbWVudFxuICBjb25zdCBoYW5kbGVTZXR1cCA9IGFzeW5jICgpID0+IHtcbiAgICAvLyBJbml0IHRoZSBVSVxuICAgIGluaXRVaU1hbmFnZXIodWlNYW5hZ2VyKTtcbiAgICBzZXR1cEdhbWVib2FyZEZvclBsYWNlbWVudCgpO1xuICAgIGF3YWl0IHNldHVwU2hpcHNTZXF1ZW50aWFsbHkoKTtcbiAgICAvLyBQcm9jZWVkIHdpdGggdGhlIHJlc3Qgb2YgdGhlIGdhbWUgc2V0dXAgYWZ0ZXIgYWxsIHNoaXBzIGFyZSBwbGFjZWRcbiAgICBjbGVhbnVwQWZ0ZXJQbGFjZW1lbnQoKTtcbiAgICBjb25zdCBvdXRwdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtb3V0cHV0XCIpO1xuICAgIHVwZGF0ZU91dHB1dChcIj4gQWxsIHNoaXBzIHBsYWNlZCwgZ2FtZSBzZXR1cCBjb21wbGV0ZSFcIik7XG4gICAgY29uc29sZS5sb2coXCJBbGwgc2hpcHMgcGxhY2VkLCBnYW1lIHNldHVwIGNvbXBsZXRlIVwiKTtcbiAgICBzd2l0Y2hHYW1lYm9hcmRIb3ZlclN0YXRlcygpO1xuICAgIC8vIFN0YXJ0IHRoZSBnYW1lXG4gICAgc3RhcnRHYW1lKHVpTWFuYWdlciwgZ2FtZSk7XG4gIH07XG5cbiAgYXN5bmMgZnVuY3Rpb24gcHJvbXB0UGxheWVyTW92ZShjb21wTW92ZVJlc3VsdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAvLyBVcGRhdGUgdGhlIHBsYXllciB3aXRoIHRoZSByZXN1bHQgb2YgdGhlIGNvbXB1dGVyJ3MgbGFzdCBtb3JlXG4gICAgICAvLyAoaWYgdGhlcmUgaXMgb25lKVxuICAgICAgaWYgKGNvbXBNb3ZlUmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gTG9nIHRoZSByZXN1bHQgb2YgdGhlIGNvbXB1dGVyJ3MgbW92ZSB0byB0aGUgY29uc29sZVxuICAgICAgICBjb25zb2xlTG9nTW92ZUNvbW1hbmQoY29tcE1vdmVSZXN1bHQpO1xuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZyhgTWFrZSBhIG1vdmUhYCk7XG5cbiAgICAgIGNvbnN0IGhhbmRsZVZhbGlkTW92ZSA9IGFzeW5jIChtb3ZlKSA9PiB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGBoYW5kbGVWYWxpZElucHV0OiBtb3ZlID0gJHttb3ZlfWApO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHsgZ3JpZFBvc2l0aW9uIH0gPSBwcm9jZXNzQ29tbWFuZChtb3ZlLCB0cnVlKTtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgaGFuZGxlVmFsaWRJbnB1dDogZ3JpZFBvc2l0aW9uID0gJHtncmlkUG9zaXRpb259YCk7XG4gICAgICAgICAgY29uc3QgaHVtYW5Nb3ZlUmVzdWx0ID0gYXdhaXQgaHVtYW5QbGF5ZXIubWFrZU1vdmUoXG4gICAgICAgICAgICBjb21wUGxheWVyR2FtZWJvYXJkLFxuICAgICAgICAgICAgZ3JpZFBvc2l0aW9uLFxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc29sZS5sb2coYGhhbmRsZVZhbGlkSW5wdXQ6IGh1bWFuTW92ZVJlc3VsdCA9ICR7aHVtYW5Nb3ZlUmVzdWx0fWApO1xuICAgICAgICAgIGNvbnNvbGUuZGlyKGh1bWFuTW92ZVJlc3VsdCk7XG5cbiAgICAgICAgICAvLyBDb21tdW5pY2F0ZSB0aGUgcmVzdWx0IG9mIHRoZSBtb3ZlIHRvIHRoZSB1c2VyXG4gICAgICAgICAgY29uc29sZUxvZ01vdmVDb21tYW5kKGh1bWFuTW92ZVJlc3VsdCk7XG5cbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlLWJlZm9yZS1kZWZpbmVcbiAgICAgICAgICByZXNvbHZlTW92ZSgpOyAvLyBNb3ZlIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseSwgcmVzb2x2ZSB0aGUgcHJvbWlzZVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGVMb2dFcnJvcihlcnJvcik7XG4gICAgICAgICAgLy8gRG8gbm90IHJlamVjdCB0byBhbGxvdyBmb3IgcmV0cnksIGp1c3QgbG9nIHRoZSBlcnJvclxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAvLyBTZXR1cCBldmVudCBsaXN0ZW5lcnMgYW5kIGVuc3VyZSB3ZSBjYW4gY2xlYW4gdGhlbSB1cCBhZnRlciBwbGFjZW1lbnRcbiAgICAgIGNvbnN0IGNsZWFudXAgPSBzZXR1cEV2ZW50TGlzdGVuZXJzKGhhbmRsZVZhbGlkTW92ZSwgXCJjb21wdXRlclwiKTtcblxuICAgICAgLy8gQXR0YWNoIGNsZWFudXAgdG8gcmVzb2x2ZSB0byBlbnN1cmUgaXQncyBjYWxsZWQgd2hlbiB0aGUgcHJvbWlzZSByZXNvbHZlc1xuICAgICAgY29uc3QgcmVzb2x2ZU1vdmUgPSAoKSA9PiB7XG4gICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIEZ1bmN0aW9uIGZvciBoYW5kbGluZyB0aGUgcGxheWluZyBvZiB0aGUgZ2FtZVxuICBjb25zdCBwbGF5R2FtZSA9IGFzeW5jICgpID0+IHtcbiAgICBsZXQgZ2FtZU92ZXIgPSBmYWxzZTtcbiAgICBsZXQgY29tcE1vdmVSZXN1bHQ7XG5cbiAgICB3aGlsZSAoIWdhbWVPdmVyKSB7XG4gICAgICBjb25zb2xlLmRpcihnYW1lLmN1cnJlbnRQbGF5ZXIpO1xuICAgICAgLy8gUGxheWVyIG1ha2VzIGEgbW92ZVxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWF3YWl0LWluLWxvb3BcbiAgICAgIGF3YWl0IHByb21wdFBsYXllck1vdmUoY29tcE1vdmVSZXN1bHQpO1xuICAgICAgLy8gQ2hlY2sgZm9yIHdpbiBjb25kaXRpb25cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wXG4gICAgICBnYW1lT3ZlciA9IGF3YWl0IGNoZWNrV2luQ29uZGl0aW9uKCk7XG4gICAgICBpZiAoZ2FtZU92ZXIpIGJyZWFrO1xuXG4gICAgICAvLyBDb21wdXRlciBtYWtlcyBhIG1vdmVcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wXG4gICAgICBjb21wTW92ZVJlc3VsdCA9IGF3YWl0IGNvbXB1dGVyTW92ZShodW1hblBsYXllckdhbWVib2FyZCwgY29tcFBsYXllcik7XG4gICAgICBjb25zb2xlLmxvZyhcIkNvbXB1dGVyJ3MgbW92ZSAtPlwiKTtcbiAgICAgIGNvbnNvbGUuZGlyKGNvbXBNb3ZlUmVzdWx0KTtcbiAgICAgIC8vIENoZWNrIGZvciB3aW4gY29uZGl0aW9uXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgZ2FtZU92ZXIgPSBhd2FpdCBjaGVja1dpbkNvbmRpdGlvbigpO1xuICAgIH1cblxuICAgIC8vIEdhbWUgb3ZlciBsb2dpY1xuICAgIGNvbmNsdWRlR2FtZSgpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgaGFuZGxlU2V0dXAsXG4gICAgcGxheUdhbWUsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBBY3Rpb25Db250cm9sbGVyO1xuIiwiLyogZXNsaW50LWRpc2FibGUgbWF4LWNsYXNzZXMtcGVyLWZpbGUgKi9cblxuY2xhc3MgT3ZlcmxhcHBpbmdTaGlwc0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJTaGlwcyBhcmUgb3ZlcmxhcHBpbmcuXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIk92ZXJsYXBwaW5nU2hpcHNFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIFNoaXBBbGxvY2F0aW9uUmVhY2hlZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihzaGlwVHlwZSkge1xuICAgIHN1cGVyKGBTaGlwIGFsbG9jYXRpb24gbGltaXQgcmVhY2hlZC4gU2hpcCB0eXBlID0gJHtzaGlwVHlwZX0uYCk7XG4gICAgdGhpcy5uYW1lID0gXCJTaGlwQWxsb2NhdGlvblJlYWNoZWRFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIFNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiU2hpcCB0eXBlIGFsbG9jYXRpb24gbGltaXQgcmVhY2hlZC5cIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiU2hpcFR5cGVBbGxvY2F0aW9uUmVhY2hlZEVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgSW52YWxpZFNoaXBMZW5ndGhFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBzaGlwIGxlbmd0aC5cIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiSW52YWxpZFNoaXBMZW5ndGhFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRTaGlwVHlwZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJJbnZhbGlkIHNoaXAgdHlwZS5cIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiSW52YWxpZFNoaXBUeXBlRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBJbnZhbGlkUGxheWVyVHlwZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlID0gXCJJbnZhbGlkIHBsYXllciB0eXBlLiBWYWxpZCBwbGF5ZXIgdHlwZXM6ICdodW1hbicgJiAnY29tcHV0ZXInXCIsXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiSW52YWxpZFNoaXBUeXBlRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBzaGlwIHBsYWNlbWVudC4gQm91bmRhcnkgZXJyb3IhXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIlNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgUmVwZWF0QXR0YWNrZWRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBhdHRhY2sgZW50cnkuIFBvc2l0aW9uIGFscmVhZHkgYXR0YWNrZWQhXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIlJlcGVhdEF0dGFja0Vycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgSW52YWxpZE1vdmVFbnRyeUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJJbnZhbGlkIG1vdmUgZW50cnkhXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRNb3ZlRW50cnlFcnJvclwiO1xuICB9XG59XG5cbmV4cG9ydCB7XG4gIE92ZXJsYXBwaW5nU2hpcHNFcnJvcixcbiAgU2hpcEFsbG9jYXRpb25SZWFjaGVkRXJyb3IsXG4gIFNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvcixcbiAgSW52YWxpZFNoaXBMZW5ndGhFcnJvcixcbiAgSW52YWxpZFNoaXBUeXBlRXJyb3IsXG4gIEludmFsaWRQbGF5ZXJUeXBlRXJyb3IsXG4gIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yLFxuICBSZXBlYXRBdHRhY2tlZEVycm9yLFxuICBJbnZhbGlkTW92ZUVudHJ5RXJyb3IsXG59O1xuIiwiaW1wb3J0IFBsYXllciBmcm9tIFwiLi9wbGF5ZXJcIjtcbmltcG9ydCBHYW1lYm9hcmQgZnJvbSBcIi4vZ2FtZWJvYXJkXCI7XG5pbXBvcnQgU2hpcCBmcm9tIFwiLi9zaGlwXCI7XG5pbXBvcnQgeyBJbnZhbGlkUGxheWVyVHlwZUVycm9yIH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5cbmNvbnN0IEdhbWUgPSAoKSA9PiB7XG4gIC8vIEluaXRpYWxpc2UsIGNyZWF0ZSBnYW1lYm9hcmRzIGZvciBib3RoIHBsYXllcnMgYW5kIGNyZWF0ZSBwbGF5ZXJzIG9mIHR5cGVzIGh1bWFuIGFuZCBjb21wdXRlclxuICBjb25zdCBodW1hbkdhbWVib2FyZCA9IEdhbWVib2FyZChTaGlwKTtcbiAgY29uc3QgY29tcHV0ZXJHYW1lYm9hcmQgPSBHYW1lYm9hcmQoU2hpcCk7XG4gIGNvbnN0IGh1bWFuUGxheWVyID0gUGxheWVyKGh1bWFuR2FtZWJvYXJkLCBcImh1bWFuXCIpO1xuICBjb25zdCBjb21wdXRlclBsYXllciA9IFBsYXllcihjb21wdXRlckdhbWVib2FyZCwgXCJjb21wdXRlclwiKTtcbiAgbGV0IGN1cnJlbnRQbGF5ZXI7XG4gIGxldCBnYW1lT3ZlclN0YXRlID0gZmFsc2U7XG5cbiAgLy8gU3RvcmUgcGxheWVycyBpbiBhIHBsYXllciBvYmplY3RcbiAgY29uc3QgcGxheWVycyA9IHsgaHVtYW46IGh1bWFuUGxheWVyLCBjb21wdXRlcjogY29tcHV0ZXJQbGF5ZXIgfTtcblxuICAvLyBTZXQgdXAgcGhhc2VcbiAgY29uc3Qgc2V0VXAgPSAoKSA9PiB7XG4gICAgLy8gQXV0b21hdGljIHBsYWNlbWVudCBmb3IgY29tcHV0ZXJcbiAgICBjb21wdXRlclBsYXllci5wbGFjZVNoaXBzKCk7XG5cbiAgICAvLyBTZXQgdGhlIGN1cnJlbnQgcGxheWVyIHRvIGh1bWFuIHBsYXllclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBodW1hblBsYXllcjtcbiAgfTtcblxuICAvLyBHYW1lIGVuZGluZyBmdW5jdGlvblxuICBjb25zdCBlbmRHYW1lID0gKCkgPT4ge1xuICAgIGdhbWVPdmVyU3RhdGUgPSB0cnVlO1xuICB9O1xuXG4gIC8vIFRha2UgdHVybiBtZXRob2RcbiAgY29uc3QgdGFrZVR1cm4gPSAobW92ZSkgPT4ge1xuICAgIGxldCBmZWVkYmFjaztcblxuICAgIC8vIERldGVybWluZSB0aGUgb3Bwb25lbnQgYmFzZWQgb24gdGhlIGN1cnJlbnQgcGxheWVyXG4gICAgY29uc3Qgb3Bwb25lbnQgPVxuICAgICAgY3VycmVudFBsYXllciA9PT0gaHVtYW5QbGF5ZXIgPyBjb21wdXRlclBsYXllciA6IGh1bWFuUGxheWVyO1xuXG4gICAgLy8gQ2FsbCB0aGUgbWFrZU1vdmUgbWV0aG9kIG9uIHRoZSBjdXJyZW50IHBsYXllciB3aXRoIHRoZSBvcHBvbmVudCdzIGdhbWVib2FyZCBhbmQgc3RvcmUgYXMgbW92ZSBmZWVkYmFja1xuICAgIGNvbnN0IHJlc3VsdCA9IGN1cnJlbnRQbGF5ZXIubWFrZU1vdmUob3Bwb25lbnQuZ2FtZWJvYXJkLCBtb3ZlKTtcblxuICAgIC8vIElmIHJlc3VsdCBpcyBhIGhpdCwgY2hlY2sgd2hldGhlciB0aGUgc2hpcCBpcyBzdW5rXG4gICAgaWYgKHJlc3VsdC5oaXQpIHtcbiAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIHNoaXAgaXMgc3VuayBhbmQgYWRkIHJlc3VsdCBhcyB2YWx1ZSB0byBmZWVkYmFjayBvYmplY3Qgd2l0aCBrZXkgXCJpc1NoaXBTdW5rXCJcbiAgICAgIGlmIChvcHBvbmVudC5nYW1lYm9hcmQuaXNTaGlwU3VuayhyZXN1bHQuc2hpcFR5cGUpKSB7XG4gICAgICAgIGZlZWRiYWNrID0ge1xuICAgICAgICAgIC4uLnJlc3VsdCxcbiAgICAgICAgICBpc1NoaXBTdW5rOiB0cnVlLFxuICAgICAgICAgIGdhbWVXb246IG9wcG9uZW50LmdhbWVib2FyZC5jaGVja0FsbFNoaXBzU3VuaygpLFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmVlZGJhY2sgPSB7IC4uLnJlc3VsdCwgaXNTaGlwU3VuazogZmFsc2UgfTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFyZXN1bHQuaGl0KSB7XG4gICAgICAvLyBTZXQgZmVlZGJhY2sgdG8ganVzdCB0aGUgcmVzdWx0XG4gICAgICBmZWVkYmFjayA9IHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBJZiBnYW1lIGlzIHdvbiwgZW5kIGdhbWVcbiAgICBpZiAoZmVlZGJhY2suZ2FtZVdvbikge1xuICAgICAgZW5kR2FtZSgpO1xuICAgIH1cblxuICAgIC8vIFN3aXRjaCB0aGUgY3VycmVudCBwbGF5ZXJcbiAgICBjdXJyZW50UGxheWVyID0gb3Bwb25lbnQ7XG5cbiAgICAvLyBSZXR1cm4gdGhlIGZlZWRiYWNrIGZvciB0aGUgbW92ZVxuICAgIHJldHVybiBmZWVkYmFjaztcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldCBjdXJyZW50UGxheWVyKCkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRQbGF5ZXI7XG4gICAgfSxcbiAgICBnZXQgZ2FtZU92ZXJTdGF0ZSgpIHtcbiAgICAgIHJldHVybiBnYW1lT3ZlclN0YXRlO1xuICAgIH0sXG4gICAgcGxheWVycyxcbiAgICBzZXRVcCxcbiAgICB0YWtlVHVybixcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWU7XG4iLCJpbXBvcnQge1xuICBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IsXG4gIE92ZXJsYXBwaW5nU2hpcHNFcnJvcixcbiAgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IsXG4gIFJlcGVhdEF0dGFja2VkRXJyb3IsXG59IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBncmlkID0gW1xuICBbXCJBMVwiLCBcIkEyXCIsIFwiQTNcIiwgXCJBNFwiLCBcIkE1XCIsIFwiQTZcIiwgXCJBN1wiLCBcIkE4XCIsIFwiQTlcIiwgXCJBMTBcIl0sXG4gIFtcIkIxXCIsIFwiQjJcIiwgXCJCM1wiLCBcIkI0XCIsIFwiQjVcIiwgXCJCNlwiLCBcIkI3XCIsIFwiQjhcIiwgXCJCOVwiLCBcIkIxMFwiXSxcbiAgW1wiQzFcIiwgXCJDMlwiLCBcIkMzXCIsIFwiQzRcIiwgXCJDNVwiLCBcIkM2XCIsIFwiQzdcIiwgXCJDOFwiLCBcIkM5XCIsIFwiQzEwXCJdLFxuICBbXCJEMVwiLCBcIkQyXCIsIFwiRDNcIiwgXCJENFwiLCBcIkQ1XCIsIFwiRDZcIiwgXCJEN1wiLCBcIkQ4XCIsIFwiRDlcIiwgXCJEMTBcIl0sXG4gIFtcIkUxXCIsIFwiRTJcIiwgXCJFM1wiLCBcIkU0XCIsIFwiRTVcIiwgXCJFNlwiLCBcIkU3XCIsIFwiRThcIiwgXCJFOVwiLCBcIkUxMFwiXSxcbiAgW1wiRjFcIiwgXCJGMlwiLCBcIkYzXCIsIFwiRjRcIiwgXCJGNVwiLCBcIkY2XCIsIFwiRjdcIiwgXCJGOFwiLCBcIkY5XCIsIFwiRjEwXCJdLFxuICBbXCJHMVwiLCBcIkcyXCIsIFwiRzNcIiwgXCJHNFwiLCBcIkc1XCIsIFwiRzZcIiwgXCJHN1wiLCBcIkc4XCIsIFwiRzlcIiwgXCJHMTBcIl0sXG4gIFtcIkgxXCIsIFwiSDJcIiwgXCJIM1wiLCBcIkg0XCIsIFwiSDVcIiwgXCJINlwiLCBcIkg3XCIsIFwiSDhcIiwgXCJIOVwiLCBcIkgxMFwiXSxcbiAgW1wiSTFcIiwgXCJJMlwiLCBcIkkzXCIsIFwiSTRcIiwgXCJJNVwiLCBcIkk2XCIsIFwiSTdcIiwgXCJJOFwiLCBcIkk5XCIsIFwiSTEwXCJdLFxuICBbXCJKMVwiLCBcIkoyXCIsIFwiSjNcIiwgXCJKNFwiLCBcIko1XCIsIFwiSjZcIiwgXCJKN1wiLCBcIko4XCIsIFwiSjlcIiwgXCJKMTBcIl0sXG5dO1xuXG5jb25zdCBpbmRleENhbGNzID0gKHN0YXJ0KSA9PiB7XG4gIGNvbnN0IGNvbExldHRlciA9IHN0YXJ0WzBdLnRvVXBwZXJDYXNlKCk7IC8vIFRoaXMgaXMgdGhlIGNvbHVtblxuICBjb25zdCByb3dOdW1iZXIgPSBwYXJzZUludChzdGFydC5zbGljZSgxKSwgMTApOyAvLyBUaGlzIGlzIHRoZSByb3dcblxuICBjb25zdCBjb2xJbmRleCA9IGNvbExldHRlci5jaGFyQ29kZUF0KDApIC0gXCJBXCIuY2hhckNvZGVBdCgwKTsgLy8gQ29sdW1uIGluZGV4IGJhc2VkIG9uIGxldHRlclxuICBjb25zdCByb3dJbmRleCA9IHJvd051bWJlciAtIDE7IC8vIFJvdyBpbmRleCBiYXNlZCBvbiBudW1iZXJcblxuICByZXR1cm4gW2NvbEluZGV4LCByb3dJbmRleF07IC8vIFJldHVybiBbcm93LCBjb2x1bW5dXG59O1xuXG5jb25zdCBjaGVja1R5cGUgPSAoc2hpcCwgc2hpcFBvc2l0aW9ucykgPT4ge1xuICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIHNoaXBQb3NpdGlvbnMgb2JqZWN0XG4gIE9iamVjdC5rZXlzKHNoaXBQb3NpdGlvbnMpLmZvckVhY2goKGV4aXN0aW5nU2hpcFR5cGUpID0+IHtcbiAgICBpZiAoZXhpc3RpbmdTaGlwVHlwZSA9PT0gc2hpcCkge1xuICAgICAgdGhyb3cgbmV3IFNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvcihzaGlwKTtcbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgY2hlY2tCb3VuZGFyaWVzID0gKHNoaXBMZW5ndGgsIGNvb3JkcywgZGlyZWN0aW9uKSA9PiB7XG4gIC8vIFNldCByb3cgYW5kIGNvbCBsaW1pdHNcbiAgY29uc3QgeExpbWl0ID0gZ3JpZC5sZW5ndGg7IC8vIFRoaXMgaXMgdGhlIHRvdGFsIG51bWJlciBvZiBjb2x1bW5zICh4KVxuICBjb25zdCB5TGltaXQgPSBncmlkWzBdLmxlbmd0aDsgLy8gVGhpcyBpcyB0aGUgdG90YWwgbnVtYmVyIG9mIHJvd3MgKHkpXG5cbiAgY29uc3QgeCA9IGNvb3Jkc1swXTtcbiAgY29uc3QgeSA9IGNvb3Jkc1sxXTtcblxuICAvLyBDaGVjayBmb3IgdmFsaWQgc3RhcnQgcG9zaXRpb24gb24gYm9hcmRcbiAgaWYgKHggPCAwIHx8IHggPj0geExpbWl0IHx8IHkgPCAwIHx8IHkgPj0geUxpbWl0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gQ2hlY2sgcmlnaHQgYm91bmRhcnkgZm9yIGhvcml6b250YWwgcGxhY2VtZW50XG4gIGlmIChkaXJlY3Rpb24gPT09IFwiaFwiICYmIHggKyBzaGlwTGVuZ3RoID4geExpbWl0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIENoZWNrIGJvdHRvbSBib3VuZGFyeSBmb3IgdmVydGljYWwgcGxhY2VtZW50XG4gIGlmIChkaXJlY3Rpb24gPT09IFwidlwiICYmIHkgKyBzaGlwTGVuZ3RoID4geUxpbWl0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gSWYgbm9uZSBvZiB0aGUgaW52YWxpZCBjb25kaXRpb25zIGFyZSBtZXQsIHJldHVybiB0cnVlXG4gIHJldHVybiB0cnVlO1xufTtcblxuY29uc3QgY2FsY3VsYXRlU2hpcFBvc2l0aW9ucyA9IChzaGlwTGVuZ3RoLCBjb29yZHMsIGRpcmVjdGlvbikgPT4ge1xuICBjb25zdCBjb2xJbmRleCA9IGNvb3Jkc1swXTsgLy8gVGhpcyBpcyB0aGUgY29sdW1uIGluZGV4XG4gIGNvbnN0IHJvd0luZGV4ID0gY29vcmRzWzFdOyAvLyBUaGlzIGlzIHRoZSByb3cgaW5kZXhcblxuICBjb25zdCBwb3NpdGlvbnMgPSBbXTtcblxuICBpZiAoZGlyZWN0aW9uLnRvTG93ZXJDYXNlKCkgPT09IFwiaFwiKSB7XG4gICAgLy8gSG9yaXpvbnRhbCBwbGFjZW1lbnQ6IGluY3JlbWVudCB0aGUgY29sdW1uIGluZGV4XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKGdyaWRbY29sSW5kZXggKyBpXVtyb3dJbmRleF0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBWZXJ0aWNhbCBwbGFjZW1lbnQ6IGluY3JlbWVudCB0aGUgcm93IGluZGV4XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKGdyaWRbY29sSW5kZXhdW3Jvd0luZGV4ICsgaV0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwb3NpdGlvbnM7XG59O1xuXG5jb25zdCBjaGVja0Zvck92ZXJsYXAgPSAocG9zaXRpb25zLCBzaGlwUG9zaXRpb25zKSA9PiB7XG4gIE9iamVjdC5lbnRyaWVzKHNoaXBQb3NpdGlvbnMpLmZvckVhY2goKFtzaGlwVHlwZSwgZXhpc3RpbmdTaGlwUG9zaXRpb25zXSkgPT4ge1xuICAgIGlmIChcbiAgICAgIHBvc2l0aW9ucy5zb21lKChwb3NpdGlvbikgPT4gZXhpc3RpbmdTaGlwUG9zaXRpb25zLmluY2x1ZGVzKHBvc2l0aW9uKSlcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBPdmVybGFwcGluZ1NoaXBzRXJyb3IoXG4gICAgICAgIGBPdmVybGFwIGRldGVjdGVkIHdpdGggc2hpcCB0eXBlICR7c2hpcFR5cGV9YCxcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IGNoZWNrRm9ySGl0ID0gKHBvc2l0aW9uLCBzaGlwUG9zaXRpb25zKSA9PiB7XG4gIGNvbnN0IGZvdW5kU2hpcCA9IE9iamVjdC5lbnRyaWVzKHNoaXBQb3NpdGlvbnMpLmZpbmQoXG4gICAgKFtfLCBleGlzdGluZ1NoaXBQb3NpdGlvbnNdKSA9PiBleGlzdGluZ1NoaXBQb3NpdGlvbnMuaW5jbHVkZXMocG9zaXRpb24pLFxuICApO1xuXG4gIHJldHVybiBmb3VuZFNoaXAgPyB7IGhpdDogdHJ1ZSwgc2hpcFR5cGU6IGZvdW5kU2hpcFswXSB9IDogeyBoaXQ6IGZhbHNlIH07XG59O1xuXG5jb25zdCBHYW1lYm9hcmQgPSAoc2hpcEZhY3RvcnkpID0+IHtcbiAgY29uc3Qgc2hpcHMgPSB7fTtcbiAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IHt9O1xuICBjb25zdCBoaXRQb3NpdGlvbnMgPSB7fTtcbiAgY29uc3QgYXR0YWNrTG9nID0gW1tdLCBbXV07XG5cbiAgY29uc3QgcGxhY2VTaGlwID0gKHR5cGUsIHN0YXJ0LCBkaXJlY3Rpb24pID0+IHtcbiAgICBjb25zdCBuZXdTaGlwID0gc2hpcEZhY3RvcnkodHlwZSk7XG5cbiAgICAvLyBDaGVjayB0aGUgc2hpcCB0eXBlIGFnYWluc3QgZXhpc3RpbmcgdHlwZXNcbiAgICBjaGVja1R5cGUodHlwZSwgc2hpcFBvc2l0aW9ucyk7XG5cbiAgICAvLyBDYWxjdWxhdGUgc3RhcnQgcG9pbnQgY29vcmRpbmF0ZXMgYmFzZWQgb24gc3RhcnQgcG9pbnQgZ3JpZCBrZXlcbiAgICBjb25zdCBjb29yZHMgPSBpbmRleENhbGNzKHN0YXJ0KTtcblxuICAgIC8vIENoZWNrIGJvdW5kYXJpZXMsIGlmIG9rIGNvbnRpbnVlIHRvIG5leHQgc3RlcFxuICAgIGlmIChjaGVja0JvdW5kYXJpZXMobmV3U2hpcC5zaGlwTGVuZ3RoLCBjb29yZHMsIGRpcmVjdGlvbikpIHtcbiAgICAgIC8vIENhbGN1bGF0ZSBhbmQgc3RvcmUgcG9zaXRpb25zIGZvciBhIG5ldyBzaGlwXG4gICAgICBjb25zdCBwb3NpdGlvbnMgPSBjYWxjdWxhdGVTaGlwUG9zaXRpb25zKFxuICAgICAgICBuZXdTaGlwLnNoaXBMZW5ndGgsXG4gICAgICAgIGNvb3JkcyxcbiAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgKTtcblxuICAgICAgLy8gQ2hlY2sgZm9yIG92ZXJsYXAgYmVmb3JlIHBsYWNpbmcgdGhlIHNoaXBcbiAgICAgIGNoZWNrRm9yT3ZlcmxhcChwb3NpdGlvbnMsIHNoaXBQb3NpdGlvbnMpO1xuXG4gICAgICAvLyBJZiBubyBvdmVybGFwLCBwcm9jZWVkIHRvIHBsYWNlIHNoaXBcbiAgICAgIHNoaXBQb3NpdGlvbnNbdHlwZV0gPSBwb3NpdGlvbnM7XG4gICAgICAvLyBBZGQgc2hpcCB0byBzaGlwcyBvYmplY3RcbiAgICAgIHNoaXBzW3R5cGVdID0gbmV3U2hpcDtcblxuICAgICAgLy8gSW5pdGlhbGlzZSBoaXRQb3NpdGlvbnMgZm9yIHRoaXMgc2hpcCB0eXBlIGFzIGFuIGVtcHR5IGFycmF5XG4gICAgICBoaXRQb3NpdGlvbnNbdHlwZV0gPSBbXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yKFxuICAgICAgICBgSW52YWxpZCBzaGlwIHBsYWNlbWVudC4gQm91bmRhcnkgZXJyb3IhIFNoaXAgdHlwZTogJHt0eXBlfWAsXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZWdpc3RlciBhbiBhdHRhY2sgYW5kIHRlc3QgZm9yIHZhbGlkIGhpdFxuICBjb25zdCBhdHRhY2sgPSAocG9zaXRpb24pID0+IHtcbiAgICBsZXQgcmVzcG9uc2U7XG5cbiAgICAvLyBDaGVjayBmb3IgdmFsaWQgYXR0YWNrXG4gICAgaWYgKGF0dGFja0xvZ1swXS5pbmNsdWRlcyhwb3NpdGlvbikgfHwgYXR0YWNrTG9nWzFdLmluY2x1ZGVzKHBvc2l0aW9uKSkge1xuICAgICAgLy8gY29uc29sZS5sb2coYFJlcGVhdCBhdHRhY2s6ICR7cG9zaXRpb259YCk7XG4gICAgICB0aHJvdyBuZXcgUmVwZWF0QXR0YWNrZWRFcnJvcigpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciB2YWxpZCBoaXRcbiAgICBjb25zdCBjaGVja1Jlc3VsdHMgPSBjaGVja0ZvckhpdChwb3NpdGlvbiwgc2hpcFBvc2l0aW9ucyk7XG4gICAgaWYgKGNoZWNrUmVzdWx0cy5oaXQpIHtcbiAgICAgIC8vIFJlZ2lzdGVyIHZhbGlkIGhpdFxuICAgICAgaGl0UG9zaXRpb25zW2NoZWNrUmVzdWx0cy5zaGlwVHlwZV0ucHVzaChwb3NpdGlvbik7XG4gICAgICBzaGlwc1tjaGVja1Jlc3VsdHMuc2hpcFR5cGVdLmhpdCgpO1xuXG4gICAgICAvLyBMb2cgdGhlIGF0dGFjayBhcyBhIHZhbGlkIGhpdFxuICAgICAgYXR0YWNrTG9nWzBdLnB1c2gocG9zaXRpb24pO1xuICAgICAgcmVzcG9uc2UgPSB7IC4uLmNoZWNrUmVzdWx0cyB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhgTUlTUyE6ICR7cG9zaXRpb259YCk7XG4gICAgICAvLyBMb2cgdGhlIGF0dGFjayBhcyBhIG1pc3NcbiAgICAgIGF0dGFja0xvZ1sxXS5wdXNoKHBvc2l0aW9uKTtcbiAgICAgIHJlc3BvbnNlID0geyAuLi5jaGVja1Jlc3VsdHMgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH07XG5cbiAgY29uc3QgaXNTaGlwU3VuayA9ICh0eXBlKSA9PiBzaGlwc1t0eXBlXS5pc1N1bms7XG5cbiAgY29uc3QgY2hlY2tBbGxTaGlwc1N1bmsgPSAoKSA9PlxuICAgIE9iamVjdC5lbnRyaWVzKHNoaXBzKS5ldmVyeSgoW3NoaXBUeXBlLCBzaGlwXSkgPT4gc2hpcC5pc1N1bmspO1xuXG4gIC8vIEZ1bmN0aW9uIGZvciByZXBvcnRpbmcgdGhlIG51bWJlciBvZiBzaGlwcyBsZWZ0IGFmbG9hdFxuICBjb25zdCBzaGlwUmVwb3J0ID0gKCkgPT4ge1xuICAgIGNvbnN0IGZsb2F0aW5nU2hpcHMgPSBPYmplY3QuZW50cmllcyhzaGlwcylcbiAgICAgIC5maWx0ZXIoKFtzaGlwVHlwZSwgc2hpcF0pID0+ICFzaGlwLmlzU3VuaylcbiAgICAgIC5tYXAoKFtzaGlwVHlwZSwgX10pID0+IHNoaXBUeXBlKTtcblxuICAgIHJldHVybiBbZmxvYXRpbmdTaGlwcy5sZW5ndGgsIGZsb2F0aW5nU2hpcHNdO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgZ2V0IGdyaWQoKSB7XG4gICAgICByZXR1cm4gZ3JpZDtcbiAgICB9LFxuICAgIGdldCBzaGlwcygpIHtcbiAgICAgIHJldHVybiBzaGlwcztcbiAgICB9LFxuICAgIGdldCBhdHRhY2tMb2coKSB7XG4gICAgICByZXR1cm4gYXR0YWNrTG9nO1xuICAgIH0sXG4gICAgZ2V0U2hpcDogKHNoaXBUeXBlKSA9PiBzaGlwc1tzaGlwVHlwZV0sXG4gICAgZ2V0U2hpcFBvc2l0aW9uczogKHNoaXBUeXBlKSA9PiBzaGlwUG9zaXRpb25zW3NoaXBUeXBlXSxcbiAgICBnZXRIaXRQb3NpdGlvbnM6IChzaGlwVHlwZSkgPT4gaGl0UG9zaXRpb25zW3NoaXBUeXBlXSxcbiAgICBwbGFjZVNoaXAsXG4gICAgYXR0YWNrLFxuICAgIGlzU2hpcFN1bmssXG4gICAgY2hlY2tBbGxTaGlwc1N1bmssXG4gICAgc2hpcFJlcG9ydCxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVib2FyZDtcbiIsImltcG9ydCBcIi4vc3R5bGVzLmNzc1wiO1xuaW1wb3J0IEdhbWUgZnJvbSBcIi4vZ2FtZVwiO1xuaW1wb3J0IFVpTWFuYWdlciBmcm9tIFwiLi91aU1hbmFnZXJcIjtcbmltcG9ydCBBY3Rpb25Db250cm9sbGVyIGZyb20gXCIuL2FjdGlvbkNvbnRyb2xsZXJcIjtcblxuLy8gQ3JlYXRlIGEgbmV3IFVJIG1hbmFnZXJcbmNvbnN0IG5ld1VpTWFuYWdlciA9IFVpTWFuYWdlcigpO1xuXG4vLyBJbnN0YW50aWF0ZSBhIG5ldyBnYW1lXG5jb25zdCBuZXdHYW1lID0gR2FtZSgpO1xuXG4vLyBDcmVhdGUgYSBuZXcgYWN0aW9uIGNvbnRyb2xsZXJcbmNvbnN0IGFjdENvbnRyb2xsZXIgPSBBY3Rpb25Db250cm9sbGVyKG5ld1VpTWFuYWdlciwgbmV3R2FtZSk7XG5cbi8vIFdhaXQgZm9yIHRoZSBnYW1lIHRvIGJlIHNldHVwIHdpdGggc2hpcCBwbGFjZW1lbnRzIGV0Yy5cbmF3YWl0IGFjdENvbnRyb2xsZXIuaGFuZGxlU2V0dXAoKTtcblxuLy8gT25jZSByZWFkeSwgY2FsbCB0aGUgcGxheUdhbWUgbWV0aG9kXG5hd2FpdCBhY3RDb250cm9sbGVyLnBsYXlHYW1lKCk7XG5cbi8vIENvbnNvbGUgbG9nIHRoZSBwbGF5ZXJzXG5jb25zb2xlLmxvZyhcbiAgYFBsYXllcnM6IEZpcnN0IHBsYXllciBvZiB0eXBlICR7bmV3R2FtZS5wbGF5ZXJzLmh1bWFuLnR5cGV9LCBzZWNvbmQgcGxheWVyIG9mIHR5cGUgJHtuZXdHYW1lLnBsYXllcnMuY29tcHV0ZXIudHlwZX0hYCxcbik7XG4iLCJpbXBvcnQge1xuICBJbnZhbGlkUGxheWVyVHlwZUVycm9yLFxuICBJbnZhbGlkTW92ZUVudHJ5RXJyb3IsXG4gIFJlcGVhdEF0dGFja2VkRXJyb3IsXG4gIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yLFxuICBPdmVybGFwcGluZ1NoaXBzRXJyb3IsXG59IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBjaGVja01vdmUgPSAobW92ZSwgZ2JHcmlkKSA9PiB7XG4gIGxldCB2YWxpZCA9IGZhbHNlO1xuXG4gIGdiR3JpZC5mb3JFYWNoKChlbCkgPT4ge1xuICAgIGlmIChlbC5maW5kKChwKSA9PiBwID09PSBtb3ZlKSkge1xuICAgICAgdmFsaWQgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHZhbGlkO1xufTtcblxuY29uc3QgcmFuZE1vdmUgPSAoZ3JpZCwgbW92ZUxvZykgPT4ge1xuICAvLyBGbGF0dGVuIHRoZSBncmlkIGludG8gYSBzaW5nbGUgYXJyYXkgb2YgbW92ZXNcbiAgY29uc3QgYWxsTW92ZXMgPSBncmlkLmZsYXRNYXAoKHJvdykgPT4gcm93KTtcblxuICAvLyBGaWx0ZXIgb3V0IHRoZSBtb3ZlcyB0aGF0IGFyZSBhbHJlYWR5IGluIHRoZSBtb3ZlTG9nXG4gIGNvbnN0IHBvc3NpYmxlTW92ZXMgPSBhbGxNb3Zlcy5maWx0ZXIoKG1vdmUpID0+ICFtb3ZlTG9nLmluY2x1ZGVzKG1vdmUpKTtcblxuICAvLyBTZWxlY3QgYSByYW5kb20gbW92ZSBmcm9tIHRoZSBwb3NzaWJsZSBtb3Zlc1xuICBjb25zdCByYW5kb21Nb3ZlID1cbiAgICBwb3NzaWJsZU1vdmVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlTW92ZXMubGVuZ3RoKV07XG5cbiAgcmV0dXJuIHJhbmRvbU1vdmU7XG59O1xuXG5jb25zdCBnZW5lcmF0ZVJhbmRvbVN0YXJ0ID0gKHNpemUsIGRpcmVjdGlvbiwgZ3JpZCkgPT4ge1xuICBjb25zdCB2YWxpZFN0YXJ0cyA9IFtdO1xuXG4gIGlmIChkaXJlY3Rpb24gPT09IFwiaFwiKSB7XG4gICAgLy8gRm9yIGhvcml6b250YWwgb3JpZW50YXRpb24sIGxpbWl0IHRoZSBjb2x1bW5zXG4gICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgZ3JpZC5sZW5ndGggLSBzaXplICsgMTsgY29sKyspIHtcbiAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IGdyaWRbY29sXS5sZW5ndGg7IHJvdysrKSB7XG4gICAgICAgIHZhbGlkU3RhcnRzLnB1c2goZ3JpZFtjb2xdW3Jvd10pO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBGb3IgdmVydGljYWwgb3JpZW50YXRpb24sIGxpbWl0IHRoZSByb3dzXG4gICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgZ3JpZFswXS5sZW5ndGggLSBzaXplICsgMTsgcm93KyspIHtcbiAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IGdyaWQubGVuZ3RoOyBjb2wrKykge1xuICAgICAgICB2YWxpZFN0YXJ0cy5wdXNoKGdyaWRbY29sXVtyb3ddKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBSYW5kb21seSBzZWxlY3QgYSBzdGFydGluZyBwb3NpdGlvblxuICBjb25zdCByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHZhbGlkU3RhcnRzLmxlbmd0aCk7XG4gIHJldHVybiB2YWxpZFN0YXJ0c1tyYW5kb21JbmRleF07XG59O1xuXG5jb25zdCBhdXRvUGxhY2VtZW50ID0gKGdhbWVib2FyZCkgPT4ge1xuICBjb25zdCBzaGlwVHlwZXMgPSBbXG4gICAgeyB0eXBlOiBcImNhcnJpZXJcIiwgc2l6ZTogNSB9LFxuICAgIHsgdHlwZTogXCJiYXR0bGVzaGlwXCIsIHNpemU6IDQgfSxcbiAgICB7IHR5cGU6IFwiY3J1aXNlclwiLCBzaXplOiAzIH0sXG4gICAgeyB0eXBlOiBcInN1Ym1hcmluZVwiLCBzaXplOiAzIH0sXG4gICAgeyB0eXBlOiBcImRlc3Ryb3llclwiLCBzaXplOiAyIH0sXG4gIF07XG5cbiAgc2hpcFR5cGVzLmZvckVhY2goKHNoaXApID0+IHtcbiAgICBsZXQgcGxhY2VkID0gZmFsc2U7XG4gICAgd2hpbGUgKCFwbGFjZWQpIHtcbiAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IE1hdGgucmFuZG9tKCkgPCAwLjUgPyBcImhcIiA6IFwidlwiO1xuICAgICAgY29uc3Qgc3RhcnQgPSBnZW5lcmF0ZVJhbmRvbVN0YXJ0KHNoaXAuc2l6ZSwgZGlyZWN0aW9uLCBnYW1lYm9hcmQuZ3JpZCk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGdhbWVib2FyZC5wbGFjZVNoaXAoc2hpcC50eXBlLCBzdGFydCwgZGlyZWN0aW9uKTtcbiAgICAgICAgcGxhY2VkID0gdHJ1ZTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAhKGVycm9yIGluc3RhbmNlb2YgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IpICYmXG4gICAgICAgICAgIShlcnJvciBpbnN0YW5jZW9mIE92ZXJsYXBwaW5nU2hpcHNFcnJvcilcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7IC8vIFJldGhyb3cgbm9uLXBsYWNlbWVudCBlcnJvcnNcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiBwbGFjZW1lbnQgZmFpbHMsIGNhdGNoIHRoZSBlcnJvciBhbmQgdHJ5IGFnYWluXG4gICAgICB9XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IFBsYXllciA9IChnYW1lYm9hcmQsIHR5cGUpID0+IHtcbiAgY29uc3QgbW92ZUxvZyA9IFtdO1xuXG4gIGNvbnN0IHBsYWNlU2hpcHMgPSAoc2hpcFR5cGUsIHN0YXJ0LCBkaXJlY3Rpb24pID0+IHtcbiAgICBpZiAodHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICBnYW1lYm9hcmQucGxhY2VTaGlwKHNoaXBUeXBlLCBzdGFydCwgZGlyZWN0aW9uKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgYXV0b1BsYWNlbWVudChnYW1lYm9hcmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBsYXllclR5cGVFcnJvcihcbiAgICAgICAgYEludmFsaWQgcGxheWVyIHR5cGUuIFZhbGlkIHBsYXllciB0eXBlczogXCJodW1hblwiICYgXCJjb21wdXRlclwiLiBFbnRlcmVkOiAke3R5cGV9LmAsXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBtYWtlTW92ZSA9IChvcHBHYW1lYm9hcmQsIGlucHV0KSA9PiB7XG4gICAgbGV0IG1vdmU7XG5cbiAgICAvLyBDaGVjayBmb3IgdGhlIHR5cGUgb2YgcGxheWVyXG4gICAgaWYgKHR5cGUgPT09IFwiaHVtYW5cIikge1xuICAgICAgLy8gRm9ybWF0IHRoZSBpbnB1dFxuICAgICAgbW92ZSA9IGAke2lucHV0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpfSR7aW5wdXQuc3Vic3RyaW5nKDEpfWA7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImNvbXB1dGVyXCIpIHtcbiAgICAgIG1vdmUgPSByYW5kTW92ZShvcHBHYW1lYm9hcmQuZ3JpZCwgbW92ZUxvZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGxheWVyVHlwZUVycm9yKFxuICAgICAgICBgSW52YWxpZCBwbGF5ZXIgdHlwZS4gVmFsaWQgcGxheWVyIHR5cGVzOiBcImh1bWFuXCIgJiBcImNvbXB1dGVyXCIuIEVudGVyZWQ6ICR7dHlwZX0uYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhlIGlucHV0IGFnYWluc3QgdGhlIHBvc3NpYmxlIG1vdmVzIG9uIHRoZSBnYW1lYm9hcmQncyBncmlkXG4gICAgaWYgKCFjaGVja01vdmUobW92ZSwgb3BwR2FtZWJvYXJkLmdyaWQpKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZE1vdmVFbnRyeUVycm9yKGBJbnZhbGlkIG1vdmUgZW50cnkhIE1vdmU6ICR7bW92ZX0uYCk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIG1vdmUgZXhpc3RzIGluIHRoZSBtb3ZlTG9nIGFycmF5LCB0aHJvdyBhbiBlcnJvclxuICAgIGlmIChtb3ZlTG9nLmZpbmQoKGVsKSA9PiBlbCA9PT0gbW92ZSkpIHtcbiAgICAgIHRocm93IG5ldyBSZXBlYXRBdHRhY2tlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gRWxzZSwgY2FsbCBhdHRhY2sgbWV0aG9kIG9uIGdhbWVib2FyZCBhbmQgbG9nIG1vdmUgaW4gbW92ZUxvZ1xuICAgIGNvbnN0IHJlc3BvbnNlID0gb3BwR2FtZWJvYXJkLmF0dGFjayhtb3ZlKTtcbiAgICBtb3ZlTG9nLnB1c2gobW92ZSk7XG4gICAgLy8gUmV0dXJuIHRoZSByZXNwb25zZSBvZiB0aGUgYXR0YWNrIChvYmplY3Q6IHsgaGl0OiBmYWxzZSB9IGZvciBtaXNzOyB7IGhpdDogdHJ1ZSwgc2hpcFR5cGU6IHN0cmluZyB9IGZvciBoaXQpLlxuICAgIHJldHVybiB7IHBsYXllcjogdHlwZSwgLi4ucmVzcG9uc2UgfTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldCB0eXBlKCkge1xuICAgICAgcmV0dXJuIHR5cGU7XG4gICAgfSxcbiAgICBnZXQgZ2FtZWJvYXJkKCkge1xuICAgICAgcmV0dXJuIGdhbWVib2FyZDtcbiAgICB9LFxuICAgIGdldCBtb3ZlTG9nKCkge1xuICAgICAgcmV0dXJuIG1vdmVMb2c7XG4gICAgfSxcbiAgICBtYWtlTW92ZSxcbiAgICBwbGFjZVNoaXBzLFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgUGxheWVyO1xuIiwiaW1wb3J0IHsgSW52YWxpZFNoaXBUeXBlRXJyb3IgfSBmcm9tIFwiLi9lcnJvcnNcIjtcblxuY29uc3QgU2hpcCA9ICh0eXBlKSA9PiB7XG4gIGNvbnN0IHNldExlbmd0aCA9ICgpID0+IHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgXCJjYXJyaWVyXCI6XG4gICAgICAgIHJldHVybiA1O1xuICAgICAgY2FzZSBcImJhdHRsZXNoaXBcIjpcbiAgICAgICAgcmV0dXJuIDQ7XG4gICAgICBjYXNlIFwiY3J1aXNlclwiOlxuICAgICAgY2FzZSBcInN1Ym1hcmluZVwiOlxuICAgICAgICByZXR1cm4gMztcbiAgICAgIGNhc2UgXCJkZXN0cm95ZXJcIjpcbiAgICAgICAgcmV0dXJuIDI7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFNoaXBUeXBlRXJyb3IoKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgc2hpcExlbmd0aCA9IHNldExlbmd0aCgpO1xuXG4gIGxldCBoaXRzID0gMDtcblxuICBjb25zdCBoaXQgPSAoKSA9PiB7XG4gICAgaWYgKGhpdHMgPCBzaGlwTGVuZ3RoKSB7XG4gICAgICBoaXRzICs9IDE7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB7XG4gICAgZ2V0IHR5cGUoKSB7XG4gICAgICByZXR1cm4gdHlwZTtcbiAgICB9LFxuICAgIGdldCBzaGlwTGVuZ3RoKCkge1xuICAgICAgcmV0dXJuIHNoaXBMZW5ndGg7XG4gICAgfSxcbiAgICBnZXQgaGl0cygpIHtcbiAgICAgIHJldHVybiBoaXRzO1xuICAgIH0sXG4gICAgZ2V0IGlzU3VuaygpIHtcbiAgICAgIHJldHVybiBoaXRzID09PSBzaGlwTGVuZ3RoO1xuICAgIH0sXG4gICAgaGl0LFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU2hpcDtcbiIsIi8vIEZ1bmN0aW9uIGZvciBidWlsZGluZyBhIHNoaXAsIGRlcGVuZGluZyBvbiB0aGUgc2hpcCB0eXBlXG5jb25zdCBidWlsZFNoaXAgPSAob2JqLCBkb21TZWwsIHNoaXBQb3NpdGlvbnMpID0+IHtcbiAgLy8gRXh0cmFjdCB0aGUgc2hpcCdzIHR5cGUgYW5kIGxlbmd0aCBmcm9tIHRoZSBvYmplY3RcbiAgY29uc3QgeyB0eXBlLCBzaGlwTGVuZ3RoOiBsZW5ndGggfSA9IG9iajtcbiAgLy8gQ3JlYXRlIGFuZCBhcnJheSBmb3IgdGhlIHNoaXAncyBzZWN0aW9uc1xuICBjb25zdCBzaGlwU2VjdHMgPSBbXTtcblxuICAvLyBVc2UgdGhlIGxlbmd0aCBvZiB0aGUgc2hpcCB0byBjcmVhdGUgdGhlIGNvcnJlY3QgbnVtYmVyIG9mIHNlY3Rpb25zXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAvLyBHZXQgYSBwb3NpdGlvbiBmcm9tIHRoZSBhcnJheVxuICAgIGNvbnN0IHBvc2l0aW9uID0gc2hpcFBvc2l0aW9uc1tpXTtcbiAgICAvLyBDcmVhdGUgYW4gZWxlbWVudCBmb3IgdGhlIHNlY3Rpb25cbiAgICBjb25zdCBzZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBzZWN0LmNsYXNzTmFtZSA9IFwidy00IGgtNCByb3VuZGVkLWZ1bGwgYmctZ3JheS04MDBcIjsgLy8gU2V0IHRoZSBkZWZhdWx0IHN0eWxpbmcgZm9yIHRoZSBzZWN0aW9uIGVsZW1lbnRcbiAgICAvLyBTZXQgYSB1bmlxdWUgaWQgZm9yIHRoZSBzaGlwIHNlY3Rpb25cbiAgICBzZWN0LnNldEF0dHJpYnV0ZShcImlkXCIsIGBET00tJHtkb21TZWx9LXNoaXBUeXBlLSR7dHlwZX0tcG9zLSR7cG9zaXRpb259YCk7XG4gICAgLy8gU2V0IGEgZGF0YXNldCBwcm9wZXJ0eSBvZiBcInBvc2l0aW9uXCIgZm9yIHRoZSBzZWN0aW9uXG4gICAgc2VjdC5kYXRhc2V0LnBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgc2hpcFNlY3RzLnB1c2goc2VjdCk7IC8vIEFkZCB0aGUgc2VjdGlvbiB0byB0aGUgYXJyYXlcbiAgfVxuXG4gIC8vIFJldHVybiB0aGUgYXJyYXkgb2Ygc2hpcCBzZWN0aW9uc1xuICByZXR1cm4gc2hpcFNlY3RzO1xufTtcblxuY29uc3QgVWlNYW5hZ2VyID0gKCkgPT4ge1xuICBjb25zdCBjcmVhdGVHYW1lYm9hcmQgPSAoY29udGFpbmVySUQpID0+IHtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXJJRCk7XG5cbiAgICAvLyBTZXQgcGxheWVyIHR5cGUgZGVwZW5kaW5nIG9uIHRoZSBjb250YWluZXJJRFxuICAgIGNvbnN0IHsgcGxheWVyIH0gPSBjb250YWluZXIuZGF0YXNldDtcblxuICAgIC8vIENyZWF0ZSB0aGUgZ3JpZCBjb250YWluZXJcbiAgICBjb25zdCBncmlkRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBncmlkRGl2LmNsYXNzTmFtZSA9XG4gICAgICBcImdhbWVib2FyZC1hcmVhIGdyaWQgZ3JpZC1jb2xzLTExIGF1dG8tcm93cy1taW4gZ2FwLTEgcC02XCI7XG4gICAgZ3JpZERpdi5kYXRhc2V0LnBsYXllciA9IHBsYXllcjtcblxuICAgIC8vIEFkZCB0aGUgdG9wLWxlZnQgY29ybmVyIGVtcHR5IGNlbGxcbiAgICBncmlkRGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikpO1xuXG4gICAgLy8gQWRkIGNvbHVtbiBoZWFkZXJzIEEtSlxuICAgIGNvbnN0IGNvbHVtbnMgPSBcIkFCQ0RFRkdISUpcIjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbHVtbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBoZWFkZXIuY2xhc3NOYW1lID0gXCJ0ZXh0LWNlbnRlclwiO1xuICAgICAgaGVhZGVyLnRleHRDb250ZW50ID0gY29sdW1uc1tpXTtcbiAgICAgIGdyaWREaXYuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcbiAgICB9XG5cbiAgICAvLyBBZGQgcm93IGxhYmVscyBhbmQgY2VsbHNcbiAgICBmb3IgKGxldCByb3cgPSAxOyByb3cgPD0gMTA7IHJvdysrKSB7XG4gICAgICAvLyBSb3cgbGFiZWxcbiAgICAgIGNvbnN0IHJvd0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIHJvd0xhYmVsLmNsYXNzTmFtZSA9IFwidGV4dC1jZW50ZXJcIjtcbiAgICAgIHJvd0xhYmVsLnRleHRDb250ZW50ID0gcm93O1xuICAgICAgZ3JpZERpdi5hcHBlbmRDaGlsZChyb3dMYWJlbCk7XG5cbiAgICAgIC8vIENlbGxzIGZvciBlYWNoIHJvd1xuICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgMTA7IGNvbCsrKSB7XG4gICAgICAgIGNvbnN0IGNlbGxJZCA9IGAke2NvbHVtbnNbY29sXX0ke3Jvd31gOyAvLyBTZXQgdGhlIGNlbGxJZFxuICAgICAgICBjb25zdCBjZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY2VsbC5pZCA9IGAke3BsYXllcn0tJHtjZWxsSWR9YDsgLy8gU2V0IHRoZSBlbGVtZW50IGlkXG4gICAgICAgIGNlbGwuY2xhc3NOYW1lID1cbiAgICAgICAgICBcInctNiBoLTYgYmctZ3JheS0yMDAgZmxleCBqdXN0aWZ5LWNlbnRlciBpdGVtcy1jZW50ZXIgY3Vyc29yLXBvaW50ZXIgaG92ZXI6Ymctb3JhbmdlLTUwMFwiOyAvLyBBZGQgbW9yZSBjbGFzc2VzIGFzIG5lZWRlZCBmb3Igc3R5bGluZ1xuICAgICAgICBjZWxsLmNsYXNzTGlzdC5hZGQoXCJnYW1lYm9hcmQtY2VsbFwiKTsgLy8gQWRkIGEgY2xhc3MgbmFtZSB0byBlYWNoIGNlbGwgdG8gYWN0IGFzIGEgc2VsZWN0b3JcbiAgICAgICAgY2VsbC5kYXRhc2V0LnBvc2l0aW9uID0gY2VsbElkOyAvLyBBc3NpZ24gcG9zaXRpb24gZGF0YSBhdHRyaWJ1dGUgZm9yIGlkZW50aWZpY2F0aW9uXG4gICAgICAgIGNlbGwuZGF0YXNldC5wbGF5ZXIgPSBwbGF5ZXI7IC8vIEFzc2lnbiBwbGF5ZXIgZGF0YSBhdHRyaWJ1dGUgZm9yIGlkZW50aWZpY2F0aW9uXG5cbiAgICAgICAgZ3JpZERpdi5hcHBlbmRDaGlsZChjZWxsKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBcHBlbmQgdGhlIGdyaWQgdG8gdGhlIGNvbnRhaW5lclxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChncmlkRGl2KTtcbiAgfTtcblxuICBjb25zdCBpbml0Q29uc29sZVVJID0gKCkgPT4ge1xuICAgIGNvbnN0IGNvbnNvbGVDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGVcIik7IC8vIEdldCB0aGUgY29uc29sZSBjb250YWluZXIgZnJvbSB0aGUgRE9NXG4gICAgY29uc29sZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFxuICAgICAgXCJmbGV4XCIsXG4gICAgICBcImZsZXgtY29sXCIsXG4gICAgICBcImp1c3RpZnktYmV0d2VlblwiLFxuICAgICAgXCJ0ZXh0LXNtXCIsXG4gICAgKTsgLy8gU2V0IGZsZXhib3ggcnVsZXMgZm9yIGNvbnRhaW5lclxuXG4gICAgLy8gQ3JlYXRlIGEgY29udGFpbmVyIGZvciB0aGUgaW5wdXQgYW5kIGJ1dHRvbiBlbGVtZW50c1xuICAgIGNvbnN0IGlucHV0RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBpbnB1dERpdi5jbGFzc05hbWUgPSBcImZsZXggZmxleC1yb3cgdy1mdWxsIGgtMS81IGp1c3RpZnktYmV0d2VlblwiOyAvLyBTZXQgdGhlIGZsZXhib3ggcnVsZXMgZm9yIHRoZSBjb250YWluZXJcblxuICAgIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpOyAvLyBDcmVhdGUgYW4gaW5wdXQgZWxlbWVudCBmb3IgdGhlIGNvbnNvbGVcbiAgICBpbnB1dC50eXBlID0gXCJ0ZXh0XCI7IC8vIFNldCB0aGUgaW5wdXQgdHlwZSBvZiB0aGlzIGVsZW1lbnQgdG8gdGV4dFxuICAgIGlucHV0LnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY29uc29sZS1pbnB1dFwiKTsgLy8gU2V0IHRoZSBpZCBmb3IgdGhpcyBlbGVtZW50IHRvIFwiY29uc29sZS1pbnB1dFwiXG4gICAgaW5wdXQuY2xhc3NOYW1lID0gXCJwLTEgYmctZ3JheS00MDAgZmxleC0xXCI7IC8vIEFkZCBUYWlsd2luZENTUyBjbGFzc2VzXG4gICAgY29uc3Qgc3VibWl0QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTsgLy8gQ3JlYXRlIGEgYnV0dG9uIGVsZW1lbnQgZm9yIHRoZSBjb25zb2xlIHN1Ym1pdFxuICAgIHN1Ym1pdEJ1dHRvbi50ZXh0Q29udGVudCA9IFwiU3VibWl0XCI7IC8vIEFkZCB0aGUgdGV4dCBcIlN1Ym1pdFwiIHRvIHRoZSBidXR0b25cbiAgICBzdWJtaXRCdXR0b24uc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJjb25zb2xlLXN1Ym1pdFwiKTsgLy8gU2V0IHRoZSBpZCBmb3IgdGhlIGJ1dHRvblxuICAgIHN1Ym1pdEJ1dHRvbi5jbGFzc05hbWUgPSBcInB4LTMgcHktMSBiZy1ncmF5LTgwMCB0ZXh0LWNlbnRlciB0ZXh0LXNtXCI7IC8vIEFkZCBUYWlsd2luZENTUyBjbGFzc2VzXG4gICAgY29uc3Qgb3V0cHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTsgLy8gQ3JlYXRlIGFuIGRpdiBlbGVtZW50IGZvciB0aGUgb3V0cHV0IG9mIHRoZSBjb25zb2xlXG4gICAgb3V0cHV0LnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY29uc29sZS1vdXRwdXRcIik7IC8vIFNldCB0aGUgaWQgZm9yIHRoZSBvdXRwdXQgZWxlbWVudFxuICAgIG91dHB1dC5jbGFzc05hbWUgPSBcInAtMSBiZy1ncmF5LTIwMCBmbGV4LTEgaC00LzUgb3ZlcmZsb3ctYXV0b1wiOyAvLyBBZGQgVGFpbHdpbmRDU1MgY2xhc3Nlc1xuXG4gICAgLy8gQWRkIHRoZSBpbnB1dCBlbGVtZW50cyB0byB0aGUgaW5wdXQgY29udGFpbmVyXG4gICAgaW5wdXREaXYuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgIGlucHV0RGl2LmFwcGVuZENoaWxkKHN1Ym1pdEJ1dHRvbik7XG5cbiAgICAvLyBBcHBlbmQgZWxlbWVudHMgdG8gdGhlIGNvbnNvbGUgY29udGFpbmVyXG4gICAgY29uc29sZUNvbnRhaW5lci5hcHBlbmRDaGlsZChvdXRwdXQpO1xuICAgIGNvbnNvbGVDb250YWluZXIuYXBwZW5kQ2hpbGQoaW5wdXREaXYpO1xuICB9O1xuXG4gIGNvbnN0IGRpc3BsYXlQcm9tcHQgPSAocHJvbXB0T2JqcykgPT4ge1xuICAgIC8vIEdldCB0aGUgcHJvbXB0IGRpc3BsYXlcbiAgICBjb25zdCBkaXNwbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcm9tcHQtZGlzcGxheVwiKTtcblxuICAgIC8vIENsZWFyIHRoZSBkaXNwbGF5IG9mIGFsbCBjaGlsZHJlblxuICAgIHdoaWxlIChkaXNwbGF5LmZpcnN0Q2hpbGQpIHtcbiAgICAgIGRpc3BsYXkucmVtb3ZlQ2hpbGQoZGlzcGxheS5maXJzdENoaWxkKTtcbiAgICB9XG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgZWFjaCBwcm9tcHQgaW4gdGhlIHByb21wdHMgb2JqZWN0XG4gICAgT2JqZWN0LmVudHJpZXMocHJvbXB0T2JqcykuZm9yRWFjaCgoW2tleSwgeyBwcm9tcHQsIHByb21wdFR5cGUgfV0pID0+IHtcbiAgICAgIC8vIENyZWF0ZSBhIG5ldyBkaXYgZm9yIGVhY2ggcHJvbXB0XG4gICAgICBjb25zdCBwcm9tcHREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgcHJvbXB0RGl2LnRleHRDb250ZW50ID0gcHJvbXB0O1xuXG4gICAgICAvLyBBcHBseSBzdHlsaW5nIGJhc2VkIG9uIHByb21wdFR5cGVcbiAgICAgIHN3aXRjaCAocHJvbXB0VHlwZSkge1xuICAgICAgICBjYXNlIFwiaW5zdHJ1Y3Rpb25cIjpcbiAgICAgICAgICBwcm9tcHREaXYuY2xhc3NMaXN0LmFkZChcInRleHQtbGltZS02MDBcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJndWlkZVwiOlxuICAgICAgICAgIHByb21wdERpdi5jbGFzc0xpc3QuYWRkKFwidGV4dC1vcmFuZ2UtNTAwXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICBwcm9tcHREaXYuY2xhc3NMaXN0LmFkZChcInRleHQtcmVkLTUwMFwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBwcm9tcHREaXYuY2xhc3NMaXN0LmFkZChcInRleHQtZ3JheS04MDBcIik7IC8vIERlZmF1bHQgdGV4dCBjb2xvclxuICAgICAgfVxuXG4gICAgICAvLyBBcHBlbmQgdGhlIG5ldyBkaXYgdG8gdGhlIGRpc3BsYXkgY29udGFpbmVyXG4gICAgICBkaXNwbGF5LmFwcGVuZENoaWxkKHByb21wdERpdik7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gZm9yIHJlbmRlcmluZyBzaGlwcyB0byB0aGUgU2hpcCBTdGF0dXMgZGlzcGxheSBzZWN0aW9uXG4gIGNvbnN0IHJlbmRlclNoaXBEaXNwID0gKHBsYXllck9iaiwgc2hpcFR5cGUpID0+IHtcbiAgICBsZXQgaWRTZWw7XG5cbiAgICAvLyBTZXQgdGhlIGNvcnJlY3QgaWQgc2VsZWN0b3IgZm9yIHRoZSB0eXBlIG9mIHBsYXllclxuICAgIGlmIChwbGF5ZXJPYmoudHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICBpZFNlbCA9IFwiaHVtYW4tZGlzcGxheVwiO1xuICAgIH0gZWxzZSBpZiAocGxheWVyT2JqLnR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgaWRTZWwgPSBcImNvbXAtZGlzcGxheVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcjtcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIGNvcnJlY3QgRE9NIGVsZW1lbnRcbiAgICBjb25zdCBkaXNwRGl2ID0gZG9jdW1lbnRcbiAgICAgIC5nZXRFbGVtZW50QnlJZChpZFNlbClcbiAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLnNoaXBzLWNvbnRhaW5lclwiKTtcblxuICAgIC8vIEdldCB0aGUgc2hpcCBmcm9tIHRoZSBwbGF5ZXJcbiAgICBjb25zdCBzaGlwID0gcGxheWVyT2JqLmdhbWVib2FyZC5nZXRTaGlwKHNoaXBUeXBlKTtcblxuICAgIC8vIENyZWF0ZSBhIGRpdiBmb3IgdGhlIHNoaXBcbiAgICBjb25zdCBzaGlwRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBzaGlwRGl2LmNsYXNzTmFtZSA9IFwicHgtNCBweS0yIGZsZXggZmxleC1jb2wgZ2FwLTFcIjtcblxuICAgIC8vIEFkZCBhIHRpdGxlIHRoZSB0aGUgZGl2XG4gICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaDJcIik7XG4gICAgdGl0bGUudGV4dENvbnRlbnQgPSBzaGlwVHlwZTsgLy8gU2V0IHRoZSB0aXRsZSB0byB0aGUgc2hpcCB0eXBlXG4gICAgc2hpcERpdi5hcHBlbmRDaGlsZCh0aXRsZSk7XG5cbiAgICAvLyBHZXQgdGhlIHNoaXAgcG9zaXRpb25zIGFycmF5XG4gICAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IHBsYXllck9iai5nYW1lYm9hcmQuZ2V0U2hpcFBvc2l0aW9ucyhzaGlwVHlwZSk7XG5cbiAgICAvLyBCdWlsZCB0aGUgc2hpcCBzZWN0aW9uc1xuICAgIGNvbnN0IHNoaXBTZWN0cyA9IGJ1aWxkU2hpcChzaGlwLCBpZFNlbCwgc2hpcFBvc2l0aW9ucyk7XG5cbiAgICAvLyBBZGQgdGhlIHNoaXAgc2VjdGlvbnMgdG8gdGhlIGRpdlxuICAgIGNvbnN0IHNlY3RzRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBzZWN0c0Rpdi5jbGFzc05hbWUgPSBcImZsZXggZmxleC1yb3cgZ2FwLTFcIjtcbiAgICBzaGlwU2VjdHMuZm9yRWFjaCgoc2VjdCkgPT4ge1xuICAgICAgc2VjdHNEaXYuYXBwZW5kQ2hpbGQoc2VjdCk7XG4gICAgfSk7XG4gICAgc2hpcERpdi5hcHBlbmRDaGlsZChzZWN0c0Rpdik7XG5cbiAgICBkaXNwRGl2LmFwcGVuZENoaWxkKHNoaXBEaXYpO1xuICB9O1xuXG4gIC8vIEZ1bmN0aW9uIGZvciByIHNoaXBzIG9uIHRoZSBnYW1lYm9hcmRcbiAgY29uc3QgcmVuZGVyU2hpcEJvYXJkID0gKHBsYXllck9iaiwgc2hpcFR5cGUpID0+IHtcbiAgICBsZXQgaWRTZWw7XG5cbiAgICAvLyBTZXQgdGhlIGNvcnJlY3QgaWQgc2VsZWN0b3IgZm9yIHRoZSB0eXBlIG9mIHBsYXllclxuICAgIGlmIChwbGF5ZXJPYmoudHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICBpZFNlbCA9IFwiaHVtYW4tYm9hcmRcIjtcbiAgICB9IGVsc2UgaWYgKHBsYXllck9iai50eXBlID09PSBcImNvbXB1dGVyXCIpIHtcbiAgICAgIGlkU2VsID0gXCJjb21wLWJvYXJkXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yKFwiTm8gbWF0Y2hpbmcgcGxheWVyIHR5cGUgaW4gJ3JlbmRlclNoaXBCb2FyZCcgZnVuY3Rpb25cIik7XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSBwbGF5ZXIncyB0eXBlIGFuZCBnYW1lYm9hcmRcbiAgICBjb25zdCB7IHR5cGU6IHBsYXllclR5cGUsIGdhbWVib2FyZCB9ID0gcGxheWVyT2JqO1xuXG4gICAgLy8gR2V0IHRoZSBzaGlwIGFuZCB0aGUgc2hpcCBwb3NpdGlvbnNcbiAgICBjb25zdCBzaGlwT2JqID0gZ2FtZWJvYXJkLmdldFNoaXAoc2hpcFR5cGUpO1xuICAgIGNvbnN0IHNoaXBQb3NpdGlvbnMgPSBnYW1lYm9hcmQuZ2V0U2hpcFBvc2l0aW9ucyhzaGlwVHlwZSk7XG5cbiAgICAvLyBCdWlsZCB0aGUgc2hpcCBzZWN0aW9uc1xuICAgIGNvbnN0IHNoaXBTZWN0cyA9IGJ1aWxkU2hpcChzaGlwT2JqLCBpZFNlbCwgc2hpcFBvc2l0aW9ucyk7XG5cbiAgICAvLyBNYXRjaCB0aGUgY2VsbCBwb3NpdGlvbnMgd2l0aCB0aGUgc2hpcCBzZWN0aW9ucyBhbmQgcGxhY2UgZWFjaFxuICAgIC8vIHNoaXAgc2VjdGlvbiBpbiB0aGUgY29ycmVzcG9uZGluZyBjZWxsIGVsZW1lbnRcbiAgICBzaGlwUG9zaXRpb25zLmZvckVhY2goKHBvc2l0aW9uKSA9PiB7XG4gICAgICBjb25zdCBjZWxsRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke3BsYXllclR5cGV9LSR7cG9zaXRpb259YCk7XG4gICAgICAvLyBGaW5kIHRoZSBzaGlwIHNlY3Rpb24gZWxlbWVudCB0aGF0IG1hdGNoZXMgdGhlIGN1cnJlbnQgcG9zaXRpb25cbiAgICAgIGNvbnN0IHNoaXBTZWN0ID0gc2hpcFNlY3RzLmZpbmQoXG4gICAgICAgIChzZWN0aW9uKSA9PiBzZWN0aW9uLmRhdGFzZXQucG9zaXRpb24gPT09IHBvc2l0aW9uLFxuICAgICAgKTtcblxuICAgICAgaWYgKGNlbGxFbGVtZW50ICYmIHNoaXBTZWN0KSB7XG4gICAgICAgIC8vIFBsYWNlIHRoZSBzaGlwIHNlY3Rpb24gaW4gdGhlIGNlbGxcbiAgICAgICAgY2VsbEVsZW1lbnQuYXBwZW5kQ2hpbGQoc2hpcFNlY3QpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgY3JlYXRlR2FtZWJvYXJkLFxuICAgIGluaXRDb25zb2xlVUksXG4gICAgZGlzcGxheVByb21wdCxcbiAgICByZW5kZXJTaGlwRGlzcCxcbiAgICByZW5kZXJTaGlwQm9hcmQsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBVaU1hbmFnZXI7XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBgLypcbiEgdGFpbHdpbmRjc3MgdjMuNC4xIHwgTUlUIExpY2Vuc2UgfCBodHRwczovL3RhaWx3aW5kY3NzLmNvbVxuKi8vKlxuMS4gUHJldmVudCBwYWRkaW5nIGFuZCBib3JkZXIgZnJvbSBhZmZlY3RpbmcgZWxlbWVudCB3aWR0aC4gKGh0dHBzOi8vZ2l0aHViLmNvbS9tb3pkZXZzL2Nzc3JlbWVkeS9pc3N1ZXMvNClcbjIuIEFsbG93IGFkZGluZyBhIGJvcmRlciB0byBhbiBlbGVtZW50IGJ5IGp1c3QgYWRkaW5nIGEgYm9yZGVyLXdpZHRoLiAoaHR0cHM6Ly9naXRodWIuY29tL3RhaWx3aW5kY3NzL3RhaWx3aW5kY3NzL3B1bGwvMTE2KVxuKi9cblxuKixcbjo6YmVmb3JlLFxuOjphZnRlciB7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7IC8qIDEgKi9cbiAgYm9yZGVyLXdpZHRoOiAwOyAvKiAyICovXG4gIGJvcmRlci1zdHlsZTogc29saWQ7IC8qIDIgKi9cbiAgYm9yZGVyLWNvbG9yOiAjZTVlN2ViOyAvKiAyICovXG59XG5cbjo6YmVmb3JlLFxuOjphZnRlciB7XG4gIC0tdHctY29udGVudDogJyc7XG59XG5cbi8qXG4xLiBVc2UgYSBjb25zaXN0ZW50IHNlbnNpYmxlIGxpbmUtaGVpZ2h0IGluIGFsbCBicm93c2Vycy5cbjIuIFByZXZlbnQgYWRqdXN0bWVudHMgb2YgZm9udCBzaXplIGFmdGVyIG9yaWVudGF0aW9uIGNoYW5nZXMgaW4gaU9TLlxuMy4gVXNlIGEgbW9yZSByZWFkYWJsZSB0YWIgc2l6ZS5cbjQuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgc2Fuc1xcYCBmb250LWZhbWlseSBieSBkZWZhdWx0LlxuNS4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBzYW5zXFxgIGZvbnQtZmVhdHVyZS1zZXR0aW5ncyBieSBkZWZhdWx0LlxuNi4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBzYW5zXFxgIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzIGJ5IGRlZmF1bHQuXG43LiBEaXNhYmxlIHRhcCBoaWdobGlnaHRzIG9uIGlPU1xuKi9cblxuaHRtbCxcbjpob3N0IHtcbiAgbGluZS1oZWlnaHQ6IDEuNTsgLyogMSAqL1xuICAtd2Via2l0LXRleHQtc2l6ZS1hZGp1c3Q6IDEwMCU7IC8qIDIgKi9cbiAgLW1vei10YWItc2l6ZTogNDsgLyogMyAqL1xuICAtby10YWItc2l6ZTogNDtcbiAgICAgdGFiLXNpemU6IDQ7IC8qIDMgKi9cbiAgZm9udC1mYW1pbHk6IHVpLXNhbnMtc2VyaWYsIHN5c3RlbS11aSwgc2Fucy1zZXJpZiwgXCJBcHBsZSBDb2xvciBFbW9qaVwiLCBcIlNlZ29lIFVJIEVtb2ppXCIsIFwiU2Vnb2UgVUkgU3ltYm9sXCIsIFwiTm90byBDb2xvciBFbW9qaVwiOyAvKiA0ICovXG4gIGZvbnQtZmVhdHVyZS1zZXR0aW5nczogbm9ybWFsOyAvKiA1ICovXG4gIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzOiBub3JtYWw7IC8qIDYgKi9cbiAgLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOiB0cmFuc3BhcmVudDsgLyogNyAqL1xufVxuXG4vKlxuMS4gUmVtb3ZlIHRoZSBtYXJnaW4gaW4gYWxsIGJyb3dzZXJzLlxuMi4gSW5oZXJpdCBsaW5lLWhlaWdodCBmcm9tIFxcYGh0bWxcXGAgc28gdXNlcnMgY2FuIHNldCB0aGVtIGFzIGEgY2xhc3MgZGlyZWN0bHkgb24gdGhlIFxcYGh0bWxcXGAgZWxlbWVudC5cbiovXG5cbmJvZHkge1xuICBtYXJnaW46IDA7IC8qIDEgKi9cbiAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7IC8qIDIgKi9cbn1cblxuLypcbjEuIEFkZCB0aGUgY29ycmVjdCBoZWlnaHQgaW4gRmlyZWZveC5cbjIuIENvcnJlY3QgdGhlIGluaGVyaXRhbmNlIG9mIGJvcmRlciBjb2xvciBpbiBGaXJlZm94LiAoaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTkwNjU1KVxuMy4gRW5zdXJlIGhvcml6b250YWwgcnVsZXMgYXJlIHZpc2libGUgYnkgZGVmYXVsdC5cbiovXG5cbmhyIHtcbiAgaGVpZ2h0OiAwOyAvKiAxICovXG4gIGNvbG9yOiBpbmhlcml0OyAvKiAyICovXG4gIGJvcmRlci10b3Atd2lkdGg6IDFweDsgLyogMyAqL1xufVxuXG4vKlxuQWRkIHRoZSBjb3JyZWN0IHRleHQgZGVjb3JhdGlvbiBpbiBDaHJvbWUsIEVkZ2UsIGFuZCBTYWZhcmkuXG4qL1xuXG5hYmJyOndoZXJlKFt0aXRsZV0pIHtcbiAgLXdlYmtpdC10ZXh0LWRlY29yYXRpb246IHVuZGVybGluZSBkb3R0ZWQ7XG4gICAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmUgZG90dGVkO1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBkZWZhdWx0IGZvbnQgc2l6ZSBhbmQgd2VpZ2h0IGZvciBoZWFkaW5ncy5cbiovXG5cbmgxLFxuaDIsXG5oMyxcbmg0LFxuaDUsXG5oNiB7XG4gIGZvbnQtc2l6ZTogaW5oZXJpdDtcbiAgZm9udC13ZWlnaHQ6IGluaGVyaXQ7XG59XG5cbi8qXG5SZXNldCBsaW5rcyB0byBvcHRpbWl6ZSBmb3Igb3B0LWluIHN0eWxpbmcgaW5zdGVhZCBvZiBvcHQtb3V0LlxuKi9cblxuYSB7XG4gIGNvbG9yOiBpbmhlcml0O1xuICB0ZXh0LWRlY29yYXRpb246IGluaGVyaXQ7XG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgZm9udCB3ZWlnaHQgaW4gRWRnZSBhbmQgU2FmYXJpLlxuKi9cblxuYixcbnN0cm9uZyB7XG4gIGZvbnQtd2VpZ2h0OiBib2xkZXI7XG59XG5cbi8qXG4xLiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYG1vbm9cXGAgZm9udC1mYW1pbHkgYnkgZGVmYXVsdC5cbjIuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgbW9ub1xcYCBmb250LWZlYXR1cmUtc2V0dGluZ3MgYnkgZGVmYXVsdC5cbjMuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgbW9ub1xcYCBmb250LXZhcmlhdGlvbi1zZXR0aW5ncyBieSBkZWZhdWx0LlxuNC4gQ29ycmVjdCB0aGUgb2RkIFxcYGVtXFxgIGZvbnQgc2l6aW5nIGluIGFsbCBicm93c2Vycy5cbiovXG5cbmNvZGUsXG5rYmQsXG5zYW1wLFxucHJlIHtcbiAgZm9udC1mYW1pbHk6IHVpLW1vbm9zcGFjZSwgU0ZNb25vLVJlZ3VsYXIsIE1lbmxvLCBNb25hY28sIENvbnNvbGFzLCBcIkxpYmVyYXRpb24gTW9ub1wiLCBcIkNvdXJpZXIgTmV3XCIsIG1vbm9zcGFjZTsgLyogMSAqL1xuICBmb250LWZlYXR1cmUtc2V0dGluZ3M6IG5vcm1hbDsgLyogMiAqL1xuICBmb250LXZhcmlhdGlvbi1zZXR0aW5nczogbm9ybWFsOyAvKiAzICovXG4gIGZvbnQtc2l6ZTogMWVtOyAvKiA0ICovXG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgZm9udCBzaXplIGluIGFsbCBicm93c2Vycy5cbiovXG5cbnNtYWxsIHtcbiAgZm9udC1zaXplOiA4MCU7XG59XG5cbi8qXG5QcmV2ZW50IFxcYHN1YlxcYCBhbmQgXFxgc3VwXFxgIGVsZW1lbnRzIGZyb20gYWZmZWN0aW5nIHRoZSBsaW5lIGhlaWdodCBpbiBhbGwgYnJvd3NlcnMuXG4qL1xuXG5zdWIsXG5zdXAge1xuICBmb250LXNpemU6IDc1JTtcbiAgbGluZS1oZWlnaHQ6IDA7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xufVxuXG5zdWIge1xuICBib3R0b206IC0wLjI1ZW07XG59XG5cbnN1cCB7XG4gIHRvcDogLTAuNWVtO1xufVxuXG4vKlxuMS4gUmVtb3ZlIHRleHQgaW5kZW50YXRpb24gZnJvbSB0YWJsZSBjb250ZW50cyBpbiBDaHJvbWUgYW5kIFNhZmFyaS4gKGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTk5OTA4OCwgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTIwMTI5NylcbjIuIENvcnJlY3QgdGFibGUgYm9yZGVyIGNvbG9yIGluaGVyaXRhbmNlIGluIGFsbCBDaHJvbWUgYW5kIFNhZmFyaS4gKGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTkzNTcyOSwgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE5NTAxNilcbjMuIFJlbW92ZSBnYXBzIGJldHdlZW4gdGFibGUgYm9yZGVycyBieSBkZWZhdWx0LlxuKi9cblxudGFibGUge1xuICB0ZXh0LWluZGVudDogMDsgLyogMSAqL1xuICBib3JkZXItY29sb3I6IGluaGVyaXQ7IC8qIDIgKi9cbiAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsgLyogMyAqL1xufVxuXG4vKlxuMS4gQ2hhbmdlIHRoZSBmb250IHN0eWxlcyBpbiBhbGwgYnJvd3NlcnMuXG4yLiBSZW1vdmUgdGhlIG1hcmdpbiBpbiBGaXJlZm94IGFuZCBTYWZhcmkuXG4zLiBSZW1vdmUgZGVmYXVsdCBwYWRkaW5nIGluIGFsbCBicm93c2Vycy5cbiovXG5cbmJ1dHRvbixcbmlucHV0LFxub3B0Z3JvdXAsXG5zZWxlY3QsXG50ZXh0YXJlYSB7XG4gIGZvbnQtZmFtaWx5OiBpbmhlcml0OyAvKiAxICovXG4gIGZvbnQtZmVhdHVyZS1zZXR0aW5nczogaW5oZXJpdDsgLyogMSAqL1xuICBmb250LXZhcmlhdGlvbi1zZXR0aW5nczogaW5oZXJpdDsgLyogMSAqL1xuICBmb250LXNpemU6IDEwMCU7IC8qIDEgKi9cbiAgZm9udC13ZWlnaHQ6IGluaGVyaXQ7IC8qIDEgKi9cbiAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7IC8qIDEgKi9cbiAgY29sb3I6IGluaGVyaXQ7IC8qIDEgKi9cbiAgbWFyZ2luOiAwOyAvKiAyICovXG4gIHBhZGRpbmc6IDA7IC8qIDMgKi9cbn1cblxuLypcblJlbW92ZSB0aGUgaW5oZXJpdGFuY2Ugb2YgdGV4dCB0cmFuc2Zvcm0gaW4gRWRnZSBhbmQgRmlyZWZveC5cbiovXG5cbmJ1dHRvbixcbnNlbGVjdCB7XG4gIHRleHQtdHJhbnNmb3JtOiBub25lO1xufVxuXG4vKlxuMS4gQ29ycmVjdCB0aGUgaW5hYmlsaXR5IHRvIHN0eWxlIGNsaWNrYWJsZSB0eXBlcyBpbiBpT1MgYW5kIFNhZmFyaS5cbjIuIFJlbW92ZSBkZWZhdWx0IGJ1dHRvbiBzdHlsZXMuXG4qL1xuXG5idXR0b24sXG5bdHlwZT0nYnV0dG9uJ10sXG5bdHlwZT0ncmVzZXQnXSxcblt0eXBlPSdzdWJtaXQnXSB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogYnV0dG9uOyAvKiAxICovXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50OyAvKiAyICovXG4gIGJhY2tncm91bmQtaW1hZ2U6IG5vbmU7IC8qIDIgKi9cbn1cblxuLypcblVzZSB0aGUgbW9kZXJuIEZpcmVmb3ggZm9jdXMgc3R5bGUgZm9yIGFsbCBmb2N1c2FibGUgZWxlbWVudHMuXG4qL1xuXG46LW1vei1mb2N1c3Jpbmcge1xuICBvdXRsaW5lOiBhdXRvO1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBhZGRpdGlvbmFsIFxcYDppbnZhbGlkXFxgIHN0eWxlcyBpbiBGaXJlZm94LiAoaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvZ2Vja28tZGV2L2Jsb2IvMmY5ZWFjZDlkM2Q5OTVjOTM3YjQyNTFhNTU1N2Q5NWQ0OTRjOWJlMS9sYXlvdXQvc3R5bGUvcmVzL2Zvcm1zLmNzcyNMNzI4LUw3MzcpXG4qL1xuXG46LW1vei11aS1pbnZhbGlkIHtcbiAgYm94LXNoYWRvdzogbm9uZTtcbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCB2ZXJ0aWNhbCBhbGlnbm1lbnQgaW4gQ2hyb21lIGFuZCBGaXJlZm94LlxuKi9cblxucHJvZ3Jlc3Mge1xuICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XG59XG5cbi8qXG5Db3JyZWN0IHRoZSBjdXJzb3Igc3R5bGUgb2YgaW5jcmVtZW50IGFuZCBkZWNyZW1lbnQgYnV0dG9ucyBpbiBTYWZhcmkuXG4qL1xuXG46Oi13ZWJraXQtaW5uZXItc3Bpbi1idXR0b24sXG46Oi13ZWJraXQtb3V0ZXItc3Bpbi1idXR0b24ge1xuICBoZWlnaHQ6IGF1dG87XG59XG5cbi8qXG4xLiBDb3JyZWN0IHRoZSBvZGQgYXBwZWFyYW5jZSBpbiBDaHJvbWUgYW5kIFNhZmFyaS5cbjIuIENvcnJlY3QgdGhlIG91dGxpbmUgc3R5bGUgaW4gU2FmYXJpLlxuKi9cblxuW3R5cGU9J3NlYXJjaCddIHtcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiB0ZXh0ZmllbGQ7IC8qIDEgKi9cbiAgb3V0bGluZS1vZmZzZXQ6IC0ycHg7IC8qIDIgKi9cbn1cblxuLypcblJlbW92ZSB0aGUgaW5uZXIgcGFkZGluZyBpbiBDaHJvbWUgYW5kIFNhZmFyaSBvbiBtYWNPUy5cbiovXG5cbjo6LXdlYmtpdC1zZWFyY2gtZGVjb3JhdGlvbiB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcbn1cblxuLypcbjEuIENvcnJlY3QgdGhlIGluYWJpbGl0eSB0byBzdHlsZSBjbGlja2FibGUgdHlwZXMgaW4gaU9TIGFuZCBTYWZhcmkuXG4yLiBDaGFuZ2UgZm9udCBwcm9wZXJ0aWVzIHRvIFxcYGluaGVyaXRcXGAgaW4gU2FmYXJpLlxuKi9cblxuOjotd2Via2l0LWZpbGUtdXBsb2FkLWJ1dHRvbiB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogYnV0dG9uOyAvKiAxICovXG4gIGZvbnQ6IGluaGVyaXQ7IC8qIDIgKi9cbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCBkaXNwbGF5IGluIENocm9tZSBhbmQgU2FmYXJpLlxuKi9cblxuc3VtbWFyeSB7XG4gIGRpc3BsYXk6IGxpc3QtaXRlbTtcbn1cblxuLypcblJlbW92ZXMgdGhlIGRlZmF1bHQgc3BhY2luZyBhbmQgYm9yZGVyIGZvciBhcHByb3ByaWF0ZSBlbGVtZW50cy5cbiovXG5cbmJsb2NrcXVvdGUsXG5kbCxcbmRkLFxuaDEsXG5oMixcbmgzLFxuaDQsXG5oNSxcbmg2LFxuaHIsXG5maWd1cmUsXG5wLFxucHJlIHtcbiAgbWFyZ2luOiAwO1xufVxuXG5maWVsZHNldCB7XG4gIG1hcmdpbjogMDtcbiAgcGFkZGluZzogMDtcbn1cblxubGVnZW5kIHtcbiAgcGFkZGluZzogMDtcbn1cblxub2wsXG51bCxcbm1lbnUge1xuICBsaXN0LXN0eWxlOiBub25lO1xuICBtYXJnaW46IDA7XG4gIHBhZGRpbmc6IDA7XG59XG5cbi8qXG5SZXNldCBkZWZhdWx0IHN0eWxpbmcgZm9yIGRpYWxvZ3MuXG4qL1xuZGlhbG9nIHtcbiAgcGFkZGluZzogMDtcbn1cblxuLypcblByZXZlbnQgcmVzaXppbmcgdGV4dGFyZWFzIGhvcml6b250YWxseSBieSBkZWZhdWx0LlxuKi9cblxudGV4dGFyZWEge1xuICByZXNpemU6IHZlcnRpY2FsO1xufVxuXG4vKlxuMS4gUmVzZXQgdGhlIGRlZmF1bHQgcGxhY2Vob2xkZXIgb3BhY2l0eSBpbiBGaXJlZm94LiAoaHR0cHM6Ly9naXRodWIuY29tL3RhaWx3aW5kbGFicy90YWlsd2luZGNzcy9pc3N1ZXMvMzMwMClcbjIuIFNldCB0aGUgZGVmYXVsdCBwbGFjZWhvbGRlciBjb2xvciB0byB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgZ3JheSA0MDAgY29sb3IuXG4qL1xuXG5pbnB1dDo6LW1vei1wbGFjZWhvbGRlciwgdGV4dGFyZWE6Oi1tb3otcGxhY2Vob2xkZXIge1xuICBvcGFjaXR5OiAxOyAvKiAxICovXG4gIGNvbG9yOiAjOWNhM2FmOyAvKiAyICovXG59XG5cbmlucHV0OjpwbGFjZWhvbGRlcixcbnRleHRhcmVhOjpwbGFjZWhvbGRlciB7XG4gIG9wYWNpdHk6IDE7IC8qIDEgKi9cbiAgY29sb3I6ICM5Y2EzYWY7IC8qIDIgKi9cbn1cblxuLypcblNldCB0aGUgZGVmYXVsdCBjdXJzb3IgZm9yIGJ1dHRvbnMuXG4qL1xuXG5idXR0b24sXG5bcm9sZT1cImJ1dHRvblwiXSB7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cblxuLypcbk1ha2Ugc3VyZSBkaXNhYmxlZCBidXR0b25zIGRvbid0IGdldCB0aGUgcG9pbnRlciBjdXJzb3IuXG4qL1xuOmRpc2FibGVkIHtcbiAgY3Vyc29yOiBkZWZhdWx0O1xufVxuXG4vKlxuMS4gTWFrZSByZXBsYWNlZCBlbGVtZW50cyBcXGBkaXNwbGF5OiBibG9ja1xcYCBieSBkZWZhdWx0LiAoaHR0cHM6Ly9naXRodWIuY29tL21vemRldnMvY3NzcmVtZWR5L2lzc3Vlcy8xNClcbjIuIEFkZCBcXGB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlXFxgIHRvIGFsaWduIHJlcGxhY2VkIGVsZW1lbnRzIG1vcmUgc2Vuc2libHkgYnkgZGVmYXVsdC4gKGh0dHBzOi8vZ2l0aHViLmNvbS9qZW5zaW1tb25zL2Nzc3JlbWVkeS9pc3N1ZXMvMTQjaXNzdWVjb21tZW50LTYzNDkzNDIxMClcbiAgIFRoaXMgY2FuIHRyaWdnZXIgYSBwb29ybHkgY29uc2lkZXJlZCBsaW50IGVycm9yIGluIHNvbWUgdG9vbHMgYnV0IGlzIGluY2x1ZGVkIGJ5IGRlc2lnbi5cbiovXG5cbmltZyxcbnN2ZyxcbnZpZGVvLFxuY2FudmFzLFxuYXVkaW8sXG5pZnJhbWUsXG5lbWJlZCxcbm9iamVjdCB7XG4gIGRpc3BsYXk6IGJsb2NrOyAvKiAxICovXG4gIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7IC8qIDIgKi9cbn1cblxuLypcbkNvbnN0cmFpbiBpbWFnZXMgYW5kIHZpZGVvcyB0byB0aGUgcGFyZW50IHdpZHRoIGFuZCBwcmVzZXJ2ZSB0aGVpciBpbnRyaW5zaWMgYXNwZWN0IHJhdGlvLiAoaHR0cHM6Ly9naXRodWIuY29tL21vemRldnMvY3NzcmVtZWR5L2lzc3Vlcy8xNClcbiovXG5cbmltZyxcbnZpZGVvIHtcbiAgbWF4LXdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IGF1dG87XG59XG5cbi8qIE1ha2UgZWxlbWVudHMgd2l0aCB0aGUgSFRNTCBoaWRkZW4gYXR0cmlidXRlIHN0YXkgaGlkZGVuIGJ5IGRlZmF1bHQgKi9cbltoaWRkZW5dIHtcbiAgZGlzcGxheTogbm9uZTtcbn1cblxuKiwgOjpiZWZvcmUsIDo6YWZ0ZXIge1xuICAtLXR3LWJvcmRlci1zcGFjaW5nLXg6IDA7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteTogMDtcbiAgLS10dy10cmFuc2xhdGUteDogMDtcbiAgLS10dy10cmFuc2xhdGUteTogMDtcbiAgLS10dy1yb3RhdGU6IDA7XG4gIC0tdHctc2tldy14OiAwO1xuICAtLXR3LXNrZXcteTogMDtcbiAgLS10dy1zY2FsZS14OiAxO1xuICAtLXR3LXNjYWxlLXk6IDE7XG4gIC0tdHctcGFuLXg6ICA7XG4gIC0tdHctcGFuLXk6ICA7XG4gIC0tdHctcGluY2gtem9vbTogIDtcbiAgLS10dy1zY3JvbGwtc25hcC1zdHJpY3RuZXNzOiBwcm94aW1pdHk7XG4gIC0tdHctZ3JhZGllbnQtZnJvbS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC12aWEtcG9zaXRpb246ICA7XG4gIC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb246ICA7XG4gIC0tdHctb3JkaW5hbDogIDtcbiAgLS10dy1zbGFzaGVkLXplcm86ICA7XG4gIC0tdHctbnVtZXJpYy1maWd1cmU6ICA7XG4gIC0tdHctbnVtZXJpYy1zcGFjaW5nOiAgO1xuICAtLXR3LW51bWVyaWMtZnJhY3Rpb246ICA7XG4gIC0tdHctcmluZy1pbnNldDogIDtcbiAgLS10dy1yaW5nLW9mZnNldC13aWR0aDogMHB4O1xuICAtLXR3LXJpbmctb2Zmc2V0LWNvbG9yOiAjZmZmO1xuICAtLXR3LXJpbmctY29sb3I6IHJnYig1OSAxMzAgMjQ2IC8gMC41KTtcbiAgLS10dy1yaW5nLW9mZnNldC1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1yaW5nLXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdy1jb2xvcmVkOiAwIDAgIzAwMDA7XG4gIC0tdHctYmx1cjogIDtcbiAgLS10dy1icmlnaHRuZXNzOiAgO1xuICAtLXR3LWNvbnRyYXN0OiAgO1xuICAtLXR3LWdyYXlzY2FsZTogIDtcbiAgLS10dy1odWUtcm90YXRlOiAgO1xuICAtLXR3LWludmVydDogIDtcbiAgLS10dy1zYXR1cmF0ZTogIDtcbiAgLS10dy1zZXBpYTogIDtcbiAgLS10dy1kcm9wLXNoYWRvdzogIDtcbiAgLS10dy1iYWNrZHJvcC1ibHVyOiAgO1xuICAtLXR3LWJhY2tkcm9wLWJyaWdodG5lc3M6ICA7XG4gIC0tdHctYmFja2Ryb3AtY29udHJhc3Q6ICA7XG4gIC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlOiAgO1xuICAtLXR3LWJhY2tkcm9wLWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaW52ZXJ0OiAgO1xuICAtLXR3LWJhY2tkcm9wLW9wYWNpdHk6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2F0dXJhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2VwaWE6ICA7XG59XG5cbjo6YmFja2Ryb3Age1xuICAtLXR3LWJvcmRlci1zcGFjaW5nLXg6IDA7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteTogMDtcbiAgLS10dy10cmFuc2xhdGUteDogMDtcbiAgLS10dy10cmFuc2xhdGUteTogMDtcbiAgLS10dy1yb3RhdGU6IDA7XG4gIC0tdHctc2tldy14OiAwO1xuICAtLXR3LXNrZXcteTogMDtcbiAgLS10dy1zY2FsZS14OiAxO1xuICAtLXR3LXNjYWxlLXk6IDE7XG4gIC0tdHctcGFuLXg6ICA7XG4gIC0tdHctcGFuLXk6ICA7XG4gIC0tdHctcGluY2gtem9vbTogIDtcbiAgLS10dy1zY3JvbGwtc25hcC1zdHJpY3RuZXNzOiBwcm94aW1pdHk7XG4gIC0tdHctZ3JhZGllbnQtZnJvbS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC12aWEtcG9zaXRpb246ICA7XG4gIC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb246ICA7XG4gIC0tdHctb3JkaW5hbDogIDtcbiAgLS10dy1zbGFzaGVkLXplcm86ICA7XG4gIC0tdHctbnVtZXJpYy1maWd1cmU6ICA7XG4gIC0tdHctbnVtZXJpYy1zcGFjaW5nOiAgO1xuICAtLXR3LW51bWVyaWMtZnJhY3Rpb246ICA7XG4gIC0tdHctcmluZy1pbnNldDogIDtcbiAgLS10dy1yaW5nLW9mZnNldC13aWR0aDogMHB4O1xuICAtLXR3LXJpbmctb2Zmc2V0LWNvbG9yOiAjZmZmO1xuICAtLXR3LXJpbmctY29sb3I6IHJnYig1OSAxMzAgMjQ2IC8gMC41KTtcbiAgLS10dy1yaW5nLW9mZnNldC1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1yaW5nLXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdy1jb2xvcmVkOiAwIDAgIzAwMDA7XG4gIC0tdHctYmx1cjogIDtcbiAgLS10dy1icmlnaHRuZXNzOiAgO1xuICAtLXR3LWNvbnRyYXN0OiAgO1xuICAtLXR3LWdyYXlzY2FsZTogIDtcbiAgLS10dy1odWUtcm90YXRlOiAgO1xuICAtLXR3LWludmVydDogIDtcbiAgLS10dy1zYXR1cmF0ZTogIDtcbiAgLS10dy1zZXBpYTogIDtcbiAgLS10dy1kcm9wLXNoYWRvdzogIDtcbiAgLS10dy1iYWNrZHJvcC1ibHVyOiAgO1xuICAtLXR3LWJhY2tkcm9wLWJyaWdodG5lc3M6ICA7XG4gIC0tdHctYmFja2Ryb3AtY29udHJhc3Q6ICA7XG4gIC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlOiAgO1xuICAtLXR3LWJhY2tkcm9wLWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaW52ZXJ0OiAgO1xuICAtLXR3LWJhY2tkcm9wLW9wYWNpdHk6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2F0dXJhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2VwaWE6ICA7XG59XG4uY29udGFpbmVyIHtcbiAgd2lkdGg6IDEwMCU7XG59XG5AbWVkaWEgKG1pbi13aWR0aDogNjQwcHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDY0MHB4O1xuICB9XG59XG5AbWVkaWEgKG1pbi13aWR0aDogNzY4cHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDc2OHB4O1xuICB9XG59XG5AbWVkaWEgKG1pbi13aWR0aDogMTAyNHB4KSB7XG5cbiAgLmNvbnRhaW5lciB7XG4gICAgbWF4LXdpZHRoOiAxMDI0cHg7XG4gIH1cbn1cbkBtZWRpYSAobWluLXdpZHRoOiAxMjgwcHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDEyODBweDtcbiAgfVxufVxuQG1lZGlhIChtaW4td2lkdGg6IDE1MzZweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogMTUzNnB4O1xuICB9XG59XG4ucG9pbnRlci1ldmVudHMtbm9uZSB7XG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuLnZpc2libGUge1xuICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xufVxuLmNvbGxhcHNlIHtcbiAgdmlzaWJpbGl0eTogY29sbGFwc2U7XG59XG4ucmVsYXRpdmUge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG59XG4ubS01IHtcbiAgbWFyZ2luOiAxLjI1cmVtO1xufVxuLm0tOCB7XG4gIG1hcmdpbjogMnJlbTtcbn1cbi5tbC0xMCB7XG4gIG1hcmdpbi1sZWZ0OiAyLjVyZW07XG59XG4ubWwtOCB7XG4gIG1hcmdpbi1sZWZ0OiAycmVtO1xufVxuLmJsb2NrIHtcbiAgZGlzcGxheTogYmxvY2s7XG59XG4uZmxleCB7XG4gIGRpc3BsYXk6IGZsZXg7XG59XG4udGFibGUge1xuICBkaXNwbGF5OiB0YWJsZTtcbn1cbi5ncmlkIHtcbiAgZGlzcGxheTogZ3JpZDtcbn1cbi5jb250ZW50cyB7XG4gIGRpc3BsYXk6IGNvbnRlbnRzO1xufVxuLmhpZGRlbiB7XG4gIGRpc3BsYXk6IG5vbmU7XG59XG4uaC0xIHtcbiAgaGVpZ2h0OiAwLjI1cmVtO1xufVxuLmgtMVxcXFwvNSB7XG4gIGhlaWdodDogMjAlO1xufVxuLmgtNCB7XG4gIGhlaWdodDogMXJlbTtcbn1cbi5oLTRcXFxcLzUge1xuICBoZWlnaHQ6IDgwJTtcbn1cbi5oLTQwIHtcbiAgaGVpZ2h0OiAxMHJlbTtcbn1cbi5oLTYge1xuICBoZWlnaHQ6IDEuNXJlbTtcbn1cbi5oLW1heCB7XG4gIGhlaWdodDogLW1vei1tYXgtY29udGVudDtcbiAgaGVpZ2h0OiBtYXgtY29udGVudDtcbn1cbi53LTEge1xuICB3aWR0aDogMC4yNXJlbTtcbn1cbi53LTFcXFxcLzIge1xuICB3aWR0aDogNTAlO1xufVxuLnctNCB7XG4gIHdpZHRoOiAxcmVtO1xufVxuLnctNFxcXFwvMTIge1xuICB3aWR0aDogMzMuMzMzMzMzJTtcbn1cbi53LTYge1xuICB3aWR0aDogMS41cmVtO1xufVxuLnctYXV0byB7XG4gIHdpZHRoOiBhdXRvO1xufVxuLnctZnVsbCB7XG4gIHdpZHRoOiAxMDAlO1xufVxuLm1pbi13LTQ0IHtcbiAgbWluLXdpZHRoOiAxMXJlbTtcbn1cbi5taW4tdy1tYXgge1xuICBtaW4td2lkdGg6IC1tb3otbWF4LWNvbnRlbnQ7XG4gIG1pbi13aWR0aDogbWF4LWNvbnRlbnQ7XG59XG4ubWluLXctbWluIHtcbiAgbWluLXdpZHRoOiAtbW96LW1pbi1jb250ZW50O1xuICBtaW4td2lkdGg6IG1pbi1jb250ZW50O1xufVxuLmZsZXgtMSB7XG4gIGZsZXg6IDEgMSAwJTtcbn1cbi5mbGV4LW5vbmUge1xuICBmbGV4OiBub25lO1xufVxuLmJvcmRlci1jb2xsYXBzZSB7XG4gIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XG59XG4udHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUodmFyKC0tdHctdHJhbnNsYXRlLXgpLCB2YXIoLS10dy10cmFuc2xhdGUteSkpIHJvdGF0ZSh2YXIoLS10dy1yb3RhdGUpKSBza2V3WCh2YXIoLS10dy1za2V3LXgpKSBza2V3WSh2YXIoLS10dy1za2V3LXkpKSBzY2FsZVgodmFyKC0tdHctc2NhbGUteCkpIHNjYWxlWSh2YXIoLS10dy1zY2FsZS15KSk7XG59XG4uY3Vyc29yLWRlZmF1bHQge1xuICBjdXJzb3I6IGRlZmF1bHQ7XG59XG4uY3Vyc29yLWhlbHAge1xuICBjdXJzb3I6IGhlbHA7XG59XG4uY3Vyc29yLXBvaW50ZXIge1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uY3Vyc29yLXRleHQge1xuICBjdXJzb3I6IHRleHQ7XG59XG4ucmVzaXplIHtcbiAgcmVzaXplOiBib3RoO1xufVxuLmF1dG8tcm93cy1taW4ge1xuICBncmlkLWF1dG8tcm93czogbWluLWNvbnRlbnQ7XG59XG4uZ3JpZC1jb2xzLTExIHtcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMTEsIG1pbm1heCgwLCAxZnIpKTtcbn1cbi5mbGV4LXJvdyB7XG4gIGZsZXgtZGlyZWN0aW9uOiByb3c7XG59XG4uZmxleC1jb2wge1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xufVxuLml0ZW1zLWNlbnRlciB7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG4uanVzdGlmeS1zdGFydCB7XG4gIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcbn1cbi5qdXN0aWZ5LWNlbnRlciB7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xufVxuLmp1c3RpZnktYmV0d2VlbiB7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2Vlbjtcbn1cbi5qdXN0aWZ5LWFyb3VuZCB7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYXJvdW5kO1xufVxuLmdhcC0xIHtcbiAgZ2FwOiAwLjI1cmVtO1xufVxuLmdhcC0xMCB7XG4gIGdhcDogMi41cmVtO1xufVxuLmdhcC0yIHtcbiAgZ2FwOiAwLjVyZW07XG59XG4uZ2FwLTYge1xuICBnYXA6IDEuNXJlbTtcbn1cbi5vdmVyZmxvdy1hdXRvIHtcbiAgb3ZlcmZsb3c6IGF1dG87XG59XG4ucm91bmRlZC1mdWxsIHtcbiAgYm9yZGVyLXJhZGl1czogOTk5OXB4O1xufVxuLnJvdW5kZWQteGwge1xuICBib3JkZXItcmFkaXVzOiAwLjc1cmVtO1xufVxuLmJvcmRlciB7XG4gIGJvcmRlci13aWR0aDogMXB4O1xufVxuLmJvcmRlci1zb2xpZCB7XG4gIGJvcmRlci1zdHlsZTogc29saWQ7XG59XG4uYm9yZGVyLWJsdWUtODAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMzAgNjQgMTc1IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItZ3JheS04MDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigzMSA0MSA1NSAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYm9yZGVyLWdyZWVuLTYwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDIyIDE2MyA3NCAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYm9yZGVyLW9yYW5nZS00MDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigyNTEgMTQ2IDYwIC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItcmVkLTcwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDE4NSAyOCAyOCAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS0yMDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyMjkgMjMxIDIzNSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1ncmF5LTQwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDE1NiAxNjMgMTc1IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWdyYXktODAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMzEgNDEgNTUgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctb3JhbmdlLTQwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDI1MSAxNDYgNjAgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4ucC0xIHtcbiAgcGFkZGluZzogMC4yNXJlbTtcbn1cbi5wLTIge1xuICBwYWRkaW5nOiAwLjVyZW07XG59XG4ucC00IHtcbiAgcGFkZGluZzogMXJlbTtcbn1cbi5wLTYge1xuICBwYWRkaW5nOiAxLjVyZW07XG59XG4ucHgtMyB7XG4gIHBhZGRpbmctbGVmdDogMC43NXJlbTtcbiAgcGFkZGluZy1yaWdodDogMC43NXJlbTtcbn1cbi5weC00IHtcbiAgcGFkZGluZy1sZWZ0OiAxcmVtO1xuICBwYWRkaW5nLXJpZ2h0OiAxcmVtO1xufVxuLnB4LTYge1xuICBwYWRkaW5nLWxlZnQ6IDEuNXJlbTtcbiAgcGFkZGluZy1yaWdodDogMS41cmVtO1xufVxuLnB5LTEge1xuICBwYWRkaW5nLXRvcDogMC4yNXJlbTtcbiAgcGFkZGluZy1ib3R0b206IDAuMjVyZW07XG59XG4ucHktMiB7XG4gIHBhZGRpbmctdG9wOiAwLjVyZW07XG4gIHBhZGRpbmctYm90dG9tOiAwLjVyZW07XG59XG4ucHktNCB7XG4gIHBhZGRpbmctdG9wOiAxcmVtO1xuICBwYWRkaW5nLWJvdHRvbTogMXJlbTtcbn1cbi5wbC0yIHtcbiAgcGFkZGluZy1sZWZ0OiAwLjVyZW07XG59XG4ucGwtNSB7XG4gIHBhZGRpbmctbGVmdDogMS4yNXJlbTtcbn1cbi5wbC04IHtcbiAgcGFkZGluZy1sZWZ0OiAycmVtO1xufVxuLnRleHQtY2VudGVyIHtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xufVxuLnRleHQtc20ge1xuICBmb250LXNpemU6IDAuODc1cmVtO1xuICBsaW5lLWhlaWdodDogMS4yNXJlbTtcbn1cbi50ZXh0LWdyYXktODAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMzEgNDEgNTUgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LWxpbWUtNjAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTAxIDE2MyAxMyAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtb3JhbmdlLTUwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDI0OSAxMTUgMjIgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXJlZC01MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigyMzkgNjggNjggLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXRlYWwtOTAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTkgNzggNzQgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi51bmRlcmxpbmUge1xuICB0ZXh0LWRlY29yYXRpb24tbGluZTogdW5kZXJsaW5lO1xufVxuLm91dGxpbmUge1xuICBvdXRsaW5lLXN0eWxlOiBzb2xpZDtcbn1cbi5maWx0ZXIge1xuICBmaWx0ZXI6IHZhcigtLXR3LWJsdXIpIHZhcigtLXR3LWJyaWdodG5lc3MpIHZhcigtLXR3LWNvbnRyYXN0KSB2YXIoLS10dy1ncmF5c2NhbGUpIHZhcigtLXR3LWh1ZS1yb3RhdGUpIHZhcigtLXR3LWludmVydCkgdmFyKC0tdHctc2F0dXJhdGUpIHZhcigtLXR3LXNlcGlhKSB2YXIoLS10dy1kcm9wLXNoYWRvdyk7XG59XG4uaG92ZXJcXFxcOmJnLW9yYW5nZS01MDA6aG92ZXIge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyNDkgMTE1IDIyIC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufWAsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL3N0eWxlcy5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUE7O0NBQWMsQ0FBZDs7O0NBQWM7O0FBQWQ7OztFQUFBLHNCQUFjLEVBQWQsTUFBYztFQUFkLGVBQWMsRUFBZCxNQUFjO0VBQWQsbUJBQWMsRUFBZCxNQUFjO0VBQWQscUJBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7O0VBQUEsZ0JBQWM7QUFBQTs7QUFBZDs7Ozs7Ozs7Q0FBYzs7QUFBZDs7RUFBQSxnQkFBYyxFQUFkLE1BQWM7RUFBZCw4QkFBYyxFQUFkLE1BQWM7RUFBZCxnQkFBYyxFQUFkLE1BQWM7RUFBZCxjQUFjO0tBQWQsV0FBYyxFQUFkLE1BQWM7RUFBZCwrSEFBYyxFQUFkLE1BQWM7RUFBZCw2QkFBYyxFQUFkLE1BQWM7RUFBZCwrQkFBYyxFQUFkLE1BQWM7RUFBZCx3Q0FBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7O0NBQWM7O0FBQWQ7RUFBQSxTQUFjLEVBQWQsTUFBYztFQUFkLG9CQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOzs7O0NBQWM7O0FBQWQ7RUFBQSxTQUFjLEVBQWQsTUFBYztFQUFkLGNBQWMsRUFBZCxNQUFjO0VBQWQscUJBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7RUFBQSx5Q0FBYztVQUFkLGlDQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7Ozs7OztFQUFBLGtCQUFjO0VBQWQsb0JBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLGNBQWM7RUFBZCx3QkFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkOztFQUFBLG1CQUFjO0FBQUE7O0FBQWQ7Ozs7O0NBQWM7O0FBQWQ7Ozs7RUFBQSwrR0FBYyxFQUFkLE1BQWM7RUFBZCw2QkFBYyxFQUFkLE1BQWM7RUFBZCwrQkFBYyxFQUFkLE1BQWM7RUFBZCxjQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEsY0FBYztBQUFBOztBQUFkOztD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O0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSx3QkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsMkJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsMkJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSxxQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxrQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxtQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxpQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLG1CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUZuQjtFQUFBLGtCQUVvQjtFQUZwQjtBQUVvQlwiLFwic291cmNlc0NvbnRlbnRcIjpbXCJAdGFpbHdpbmQgYmFzZTtcXG5AdGFpbHdpbmQgY29tcG9uZW50cztcXG5AdGFpbHdpbmQgdXRpbGl0aWVzO1wiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTtcblxuICAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbihcIlwiKTtcbiAgfTtcblxuICAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCB0aGlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZhciBpZCA9IHRoaXNba11bMF07XG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3VwcG9ydHMpIHtcbiAgICAgICAgaWYgKCFpdGVtWzRdKSB7XG4gICAgICAgICAgaXRlbVs0XSA9IFwiXCIuY29uY2F0KHN1cHBvcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNF0gPSBzdXBwb3J0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuICBpZiAoIWNzc01hcHBpbmcpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi9ub2RlX21vZHVsZXMvcG9zdGNzcy1sb2FkZXIvZGlzdC9janMuanM/P3J1bGVTZXRbMV0ucnVsZXNbMV0udXNlWzJdIS4vc3R5bGVzLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4uL25vZGVfbW9kdWxlcy9wb3N0Y3NzLWxvYWRlci9kaXN0L2Nqcy5qcz8/cnVsZVNldFsxXS5ydWxlc1sxXS51c2VbMl0hLi9zdHlsZXMuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzdHlsZXNJbkRPTSA9IFtdO1xuZnVuY3Rpb24gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuICB2YXIgcmVzdWx0ID0gLTE7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGlkQ291bnRNYXAgPSB7fTtcbiAgdmFyIGlkZW50aWZpZXJzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuICAgIGlmIChpbmRleEJ5SWRlbnRpZmllciAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXBkYXRlciA9IGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5ieUluZGV4ID0gaTtcbiAgICAgIHN0eWxlc0luRE9NLnNwbGljZShpLCAwLCB7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IHVwZGF0ZXIsXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cbmZ1bmN0aW9uIGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIGFwaSA9IG9wdGlvbnMuZG9tQVBJKG9wdGlvbnMpO1xuICBhcGkudXBkYXRlKG9iaik7XG4gIHZhciB1cGRhdGVyID0gZnVuY3Rpb24gdXBkYXRlcihuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwICYmIG5ld09iai5zdXBwb3J0cyA9PT0gb2JqLnN1cHBvcnRzICYmIG5ld09iai5sYXllciA9PT0gb2JqLmxheWVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHVwZGF0ZXI7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXN0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgX2lkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbX2ldO1xuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcbiAgICAgIGlmIChzdHlsZXNJbkRPTVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5ET01bX2luZGV4XS51cGRhdGVyKCk7XG4gICAgICAgIHN0eWxlc0luRE9NLnNwbGljZShfaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7XG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG4gICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gc3R5bGVUYXJnZXQuY29udGVudERvY3VtZW50LmhlYWQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cbiAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRCeVNlbGVjdG9yKGluc2VydCwgc3R5bGUpIHtcbiAgdmFyIHRhcmdldCA9IGdldFRhcmdldChpbnNlcnQpO1xuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cbiAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0QnlTZWxlY3RvcjsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgb3B0aW9ucy5zZXRBdHRyaWJ1dGVzKGVsZW1lbnQsIG9wdGlvbnMuYXR0cmlidXRlcyk7XG4gIG9wdGlvbnMuaW5zZXJ0KGVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG4gIHJldHVybiBlbGVtZW50O1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG4gIGlmIChub25jZSkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBub25jZSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKSB7XG4gIHZhciBjc3MgPSBcIlwiO1xuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIik7XG4gIH1cbiAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBvYmoubGF5ZXIgIT09IFwidW5kZWZpbmVkXCI7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cbiAgY3NzICs9IG9iai5jc3M7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH1cblxuICAvLyBGb3Igb2xkIElFXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cbiAgb3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGRvbUFQSShvcHRpb25zKSB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoKSB7fSxcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICB9O1xuICB9XG4gIHZhciBzdHlsZUVsZW1lbnQgPSBvcHRpb25zLmluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgcmV0dXJuIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShvYmopIHtcbiAgICAgIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG4gICAgfVxuICB9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzdHlsZVRhZ1RyYW5zZm9ybTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwidmFyIHdlYnBhY2tRdWV1ZXMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2woXCJ3ZWJwYWNrIHF1ZXVlc1wiKSA6IFwiX193ZWJwYWNrX3F1ZXVlc19fXCI7XG52YXIgd2VicGFja0V4cG9ydHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2woXCJ3ZWJwYWNrIGV4cG9ydHNcIikgOiBcIl9fd2VicGFja19leHBvcnRzX19cIjtcbnZhciB3ZWJwYWNrRXJyb3IgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2woXCJ3ZWJwYWNrIGVycm9yXCIpIDogXCJfX3dlYnBhY2tfZXJyb3JfX1wiO1xudmFyIHJlc29sdmVRdWV1ZSA9IChxdWV1ZSkgPT4ge1xuXHRpZihxdWV1ZSAmJiBxdWV1ZS5kIDwgMSkge1xuXHRcdHF1ZXVlLmQgPSAxO1xuXHRcdHF1ZXVlLmZvckVhY2goKGZuKSA9PiAoZm4uci0tKSk7XG5cdFx0cXVldWUuZm9yRWFjaCgoZm4pID0+IChmbi5yLS0gPyBmbi5yKysgOiBmbigpKSk7XG5cdH1cbn1cbnZhciB3cmFwRGVwcyA9IChkZXBzKSA9PiAoZGVwcy5tYXAoKGRlcCkgPT4ge1xuXHRpZihkZXAgIT09IG51bGwgJiYgdHlwZW9mIGRlcCA9PT0gXCJvYmplY3RcIikge1xuXHRcdGlmKGRlcFt3ZWJwYWNrUXVldWVzXSkgcmV0dXJuIGRlcDtcblx0XHRpZihkZXAudGhlbikge1xuXHRcdFx0dmFyIHF1ZXVlID0gW107XG5cdFx0XHRxdWV1ZS5kID0gMDtcblx0XHRcdGRlcC50aGVuKChyKSA9PiB7XG5cdFx0XHRcdG9ialt3ZWJwYWNrRXhwb3J0c10gPSByO1xuXHRcdFx0XHRyZXNvbHZlUXVldWUocXVldWUpO1xuXHRcdFx0fSwgKGUpID0+IHtcblx0XHRcdFx0b2JqW3dlYnBhY2tFcnJvcl0gPSBlO1xuXHRcdFx0XHRyZXNvbHZlUXVldWUocXVldWUpO1xuXHRcdFx0fSk7XG5cdFx0XHR2YXIgb2JqID0ge307XG5cdFx0XHRvYmpbd2VicGFja1F1ZXVlc10gPSAoZm4pID0+IChmbihxdWV1ZSkpO1xuXHRcdFx0cmV0dXJuIG9iajtcblx0XHR9XG5cdH1cblx0dmFyIHJldCA9IHt9O1xuXHRyZXRbd2VicGFja1F1ZXVlc10gPSB4ID0+IHt9O1xuXHRyZXRbd2VicGFja0V4cG9ydHNdID0gZGVwO1xuXHRyZXR1cm4gcmV0O1xufSkpO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5hID0gKG1vZHVsZSwgYm9keSwgaGFzQXdhaXQpID0+IHtcblx0dmFyIHF1ZXVlO1xuXHRoYXNBd2FpdCAmJiAoKHF1ZXVlID0gW10pLmQgPSAtMSk7XG5cdHZhciBkZXBRdWV1ZXMgPSBuZXcgU2V0KCk7XG5cdHZhciBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHM7XG5cdHZhciBjdXJyZW50RGVwcztcblx0dmFyIG91dGVyUmVzb2x2ZTtcblx0dmFyIHJlamVjdDtcblx0dmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqKSA9PiB7XG5cdFx0cmVqZWN0ID0gcmVqO1xuXHRcdG91dGVyUmVzb2x2ZSA9IHJlc29sdmU7XG5cdH0pO1xuXHRwcm9taXNlW3dlYnBhY2tFeHBvcnRzXSA9IGV4cG9ydHM7XG5cdHByb21pc2Vbd2VicGFja1F1ZXVlc10gPSAoZm4pID0+IChxdWV1ZSAmJiBmbihxdWV1ZSksIGRlcFF1ZXVlcy5mb3JFYWNoKGZuKSwgcHJvbWlzZVtcImNhdGNoXCJdKHggPT4ge30pKTtcblx0bW9kdWxlLmV4cG9ydHMgPSBwcm9taXNlO1xuXHRib2R5KChkZXBzKSA9PiB7XG5cdFx0Y3VycmVudERlcHMgPSB3cmFwRGVwcyhkZXBzKTtcblx0XHR2YXIgZm47XG5cdFx0dmFyIGdldFJlc3VsdCA9ICgpID0+IChjdXJyZW50RGVwcy5tYXAoKGQpID0+IHtcblx0XHRcdGlmKGRbd2VicGFja0Vycm9yXSkgdGhyb3cgZFt3ZWJwYWNrRXJyb3JdO1xuXHRcdFx0cmV0dXJuIGRbd2VicGFja0V4cG9ydHNdO1xuXHRcdH0pKVxuXHRcdHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdGZuID0gKCkgPT4gKHJlc29sdmUoZ2V0UmVzdWx0KSk7XG5cdFx0XHRmbi5yID0gMDtcblx0XHRcdHZhciBmblF1ZXVlID0gKHEpID0+IChxICE9PSBxdWV1ZSAmJiAhZGVwUXVldWVzLmhhcyhxKSAmJiAoZGVwUXVldWVzLmFkZChxKSwgcSAmJiAhcS5kICYmIChmbi5yKyssIHEucHVzaChmbikpKSk7XG5cdFx0XHRjdXJyZW50RGVwcy5tYXAoKGRlcCkgPT4gKGRlcFt3ZWJwYWNrUXVldWVzXShmblF1ZXVlKSkpO1xuXHRcdH0pO1xuXHRcdHJldHVybiBmbi5yID8gcHJvbWlzZSA6IGdldFJlc3VsdCgpO1xuXHR9LCAoZXJyKSA9PiAoKGVyciA/IHJlamVjdChwcm9taXNlW3dlYnBhY2tFcnJvcl0gPSBlcnIpIDogb3V0ZXJSZXNvbHZlKGV4cG9ydHMpKSwgcmVzb2x2ZVF1ZXVlKHF1ZXVlKSkpO1xuXHRxdWV1ZSAmJiBxdWV1ZS5kIDwgMCAmJiAocXVldWUuZCA9IDApO1xufTsiLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm5jID0gdW5kZWZpbmVkOyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgdXNlZCAnbW9kdWxlJyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9pbmRleC5qc1wiKTtcbiIsIiJdLCJuYW1lcyI6WyJHYW1lYm9hcmQiLCJncmlkIiwic2hpcHNUb1BsYWNlIiwic2hpcFR5cGUiLCJzaGlwTGVuZ3RoIiwiY3VycmVudE9yaWVudGF0aW9uIiwiY3VycmVudFNoaXAiLCJsYXN0SG92ZXJlZENlbGwiLCJwbGFjZVNoaXBHdWlkZSIsInByb21wdCIsInByb21wdFR5cGUiLCJnYW1lcGxheUd1aWRlIiwidHVyblByb21wdCIsInByb2Nlc3NDb21tYW5kIiwiY29tbWFuZCIsImlzTW92ZSIsInBhcnRzIiwic3BsaXQiLCJsZW5ndGgiLCJFcnJvciIsImdyaWRQb3NpdGlvbiIsInRvVXBwZXJDYXNlIiwidmFsaWRHcmlkUG9zaXRpb25zIiwiZmxhdCIsImluY2x1ZGVzIiwicmVzdWx0Iiwib3JpZW50YXRpb24iLCJ0b0xvd2VyQ2FzZSIsInVwZGF0ZU91dHB1dCIsIm1lc3NhZ2UiLCJ0eXBlIiwib3V0cHV0IiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsIm1lc3NhZ2VFbGVtZW50IiwiY3JlYXRlRWxlbWVudCIsInRleHRDb250ZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwiYXBwZW5kQ2hpbGQiLCJzY3JvbGxUb3AiLCJzY3JvbGxIZWlnaHQiLCJjb25zb2xlTG9nUGxhY2VtZW50Q29tbWFuZCIsImRpckZlZWJhY2siLCJjaGFyQXQiLCJzbGljZSIsImNvbnNvbGUiLCJsb2ciLCJ2YWx1ZSIsImNvbnNvbGVMb2dNb3ZlQ29tbWFuZCIsInJlc3VsdHNPYmplY3QiLCJwbGF5ZXIiLCJoaXQiLCJjb25zb2xlTG9nRXJyb3IiLCJlcnJvciIsImluaXRVaU1hbmFnZXIiLCJ1aU1hbmFnZXIiLCJpbml0Q29uc29sZVVJIiwiY3JlYXRlR2FtZWJvYXJkIiwiY2FsY3VsYXRlU2hpcENlbGxzIiwic3RhcnRDZWxsIiwiY2VsbElkcyIsInJvd0luZGV4IiwiY2hhckNvZGVBdCIsImNvbEluZGV4IiwicGFyc2VJbnQiLCJzdWJzdHJpbmciLCJpIiwicHVzaCIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsImhpZ2hsaWdodENlbGxzIiwiZm9yRWFjaCIsImNlbGxJZCIsImNlbGxFbGVtZW50IiwicXVlcnlTZWxlY3RvciIsImNsZWFySGlnaGxpZ2h0IiwicmVtb3ZlIiwidG9nZ2xlT3JpZW50YXRpb24iLCJoYW5kbGVQbGFjZW1lbnRIb3ZlciIsImUiLCJjZWxsIiwidGFyZ2V0IiwiY29udGFpbnMiLCJkYXRhc2V0IiwiY2VsbFBvcyIsInBvc2l0aW9uIiwiY2VsbHNUb0hpZ2hsaWdodCIsImhhbmRsZU1vdXNlTGVhdmUiLCJjZWxsc1RvQ2xlYXIiLCJoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSIsImtleSIsInByZXZlbnREZWZhdWx0Iiwib2xkQ2VsbHNUb0NsZWFyIiwibmV3Q2VsbHNUb0hpZ2hsaWdodCIsImVuYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIiLCJxdWVyeVNlbGVjdG9yQWxsIiwiZGlzYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIiLCJkaXNhYmxlSHVtYW5HYW1lYm9hcmRIb3ZlciIsInN3aXRjaEdhbWVib2FyZEhvdmVyU3RhdGVzIiwic2V0dXBHYW1lYm9hcmRGb3JQbGFjZW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwiZ2FtZWJvYXJkQXJlYSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJjbGVhbnVwQWZ0ZXJQbGFjZW1lbnQiLCJzdGFydEdhbWUiLCJnYW1lIiwic2V0VXAiLCJkaXNwbGF5UHJvbXB0IiwiaGFuZGxlSHVtYW5Nb3ZlIiwiZGF0YSIsInNldHVwR2FtZWJvYXJkRm9yUGxheWVyTW92ZSIsInBsYXllck1vdmUiLCJjb21wdXRlck1vdmUiLCJodW1hblBsYXllckdhbWVib2FyZCIsImNvbXBQbGF5ZXIiLCJjb21wTW92ZVJlc3VsdCIsIm1ha2VNb3ZlIiwiY2hlY2tXaW5Db25kaXRpb24iLCJjb25jbHVkZUdhbWUiLCJBY3Rpb25Db250cm9sbGVyIiwiaHVtYW5QbGF5ZXIiLCJwbGF5ZXJzIiwiaHVtYW4iLCJnYW1lYm9hcmQiLCJjb21wdXRlciIsImNvbXBQbGF5ZXJHYW1lYm9hcmQiLCJzZXR1cEV2ZW50TGlzdGVuZXJzIiwiaGFuZGxlckZ1bmN0aW9uIiwicGxheWVyVHlwZSIsImNsZWFudXBGdW5jdGlvbnMiLCJjb25zb2xlU3VibWl0QnV0dG9uIiwiY29uc29sZUlucHV0Iiwic3VibWl0SGFuZGxlciIsImlucHV0Iiwia2V5cHJlc3NIYW5kbGVyIiwiY2xpY2tIYW5kbGVyIiwiY2xlYW51cCIsInByb21wdEFuZFBsYWNlU2hpcCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZmluZCIsInNoaXAiLCJwbGFjZVNoaXBQcm9tcHQiLCJoYW5kbGVWYWxpZElucHV0IiwicGxhY2VTaGlwIiwicmVuZGVyU2hpcEJvYXJkIiwicmVuZGVyU2hpcERpc3AiLCJyZXNvbHZlU2hpcFBsYWNlbWVudCIsInNldHVwU2hpcHNTZXF1ZW50aWFsbHkiLCJoYW5kbGVTZXR1cCIsInByb21wdFBsYXllck1vdmUiLCJ1bmRlZmluZWQiLCJoYW5kbGVWYWxpZE1vdmUiLCJtb3ZlIiwiaHVtYW5Nb3ZlUmVzdWx0IiwiZGlyIiwicmVzb2x2ZU1vdmUiLCJwbGF5R2FtZSIsImdhbWVPdmVyIiwiY3VycmVudFBsYXllciIsIk92ZXJsYXBwaW5nU2hpcHNFcnJvciIsImNvbnN0cnVjdG9yIiwibmFtZSIsIlNoaXBBbGxvY2F0aW9uUmVhY2hlZEVycm9yIiwiU2hpcFR5cGVBbGxvY2F0aW9uUmVhY2hlZEVycm9yIiwiSW52YWxpZFNoaXBMZW5ndGhFcnJvciIsIkludmFsaWRTaGlwVHlwZUVycm9yIiwiSW52YWxpZFBsYXllclR5cGVFcnJvciIsIlNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yIiwiUmVwZWF0QXR0YWNrZWRFcnJvciIsIkludmFsaWRNb3ZlRW50cnlFcnJvciIsIlBsYXllciIsIlNoaXAiLCJHYW1lIiwiaHVtYW5HYW1lYm9hcmQiLCJjb21wdXRlckdhbWVib2FyZCIsImNvbXB1dGVyUGxheWVyIiwiZ2FtZU92ZXJTdGF0ZSIsInBsYWNlU2hpcHMiLCJlbmRHYW1lIiwidGFrZVR1cm4iLCJmZWVkYmFjayIsIm9wcG9uZW50IiwiaXNTaGlwU3VuayIsImdhbWVXb24iLCJjaGVja0FsbFNoaXBzU3VuayIsImluZGV4Q2FsY3MiLCJzdGFydCIsImNvbExldHRlciIsInJvd051bWJlciIsImNoZWNrVHlwZSIsInNoaXBQb3NpdGlvbnMiLCJPYmplY3QiLCJrZXlzIiwiZXhpc3RpbmdTaGlwVHlwZSIsImNoZWNrQm91bmRhcmllcyIsImNvb3JkcyIsImRpcmVjdGlvbiIsInhMaW1pdCIsInlMaW1pdCIsIngiLCJ5IiwiY2FsY3VsYXRlU2hpcFBvc2l0aW9ucyIsInBvc2l0aW9ucyIsImNoZWNrRm9yT3ZlcmxhcCIsImVudHJpZXMiLCJleGlzdGluZ1NoaXBQb3NpdGlvbnMiLCJzb21lIiwiY2hlY2tGb3JIaXQiLCJmb3VuZFNoaXAiLCJfIiwic2hpcEZhY3RvcnkiLCJzaGlwcyIsImhpdFBvc2l0aW9ucyIsImF0dGFja0xvZyIsIm5ld1NoaXAiLCJhdHRhY2siLCJyZXNwb25zZSIsImNoZWNrUmVzdWx0cyIsImlzU3VuayIsImV2ZXJ5Iiwic2hpcFJlcG9ydCIsImZsb2F0aW5nU2hpcHMiLCJmaWx0ZXIiLCJtYXAiLCJnZXRTaGlwIiwiZ2V0U2hpcFBvc2l0aW9ucyIsImdldEhpdFBvc2l0aW9ucyIsIlVpTWFuYWdlciIsIm5ld1VpTWFuYWdlciIsIm5ld0dhbWUiLCJhY3RDb250cm9sbGVyIiwiY2hlY2tNb3ZlIiwiZ2JHcmlkIiwidmFsaWQiLCJlbCIsInAiLCJyYW5kTW92ZSIsIm1vdmVMb2ciLCJhbGxNb3ZlcyIsImZsYXRNYXAiLCJyb3ciLCJwb3NzaWJsZU1vdmVzIiwicmFuZG9tTW92ZSIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImdlbmVyYXRlUmFuZG9tU3RhcnQiLCJzaXplIiwidmFsaWRTdGFydHMiLCJjb2wiLCJyYW5kb21JbmRleCIsImF1dG9QbGFjZW1lbnQiLCJzaGlwVHlwZXMiLCJwbGFjZWQiLCJvcHBHYW1lYm9hcmQiLCJzZXRMZW5ndGgiLCJoaXRzIiwiYnVpbGRTaGlwIiwib2JqIiwiZG9tU2VsIiwic2hpcFNlY3RzIiwic2VjdCIsImNsYXNzTmFtZSIsInNldEF0dHJpYnV0ZSIsImNvbnRhaW5lcklEIiwiY29udGFpbmVyIiwiZ3JpZERpdiIsImNvbHVtbnMiLCJoZWFkZXIiLCJyb3dMYWJlbCIsImlkIiwiY29uc29sZUNvbnRhaW5lciIsImlucHV0RGl2Iiwic3VibWl0QnV0dG9uIiwicHJvbXB0T2JqcyIsImRpc3BsYXkiLCJmaXJzdENoaWxkIiwicmVtb3ZlQ2hpbGQiLCJwcm9tcHREaXYiLCJwbGF5ZXJPYmoiLCJpZFNlbCIsImRpc3BEaXYiLCJzaGlwRGl2IiwidGl0bGUiLCJzZWN0c0RpdiIsInNoaXBPYmoiLCJzaGlwU2VjdCIsInNlY3Rpb24iXSwic291cmNlUm9vdCI6IiJ9