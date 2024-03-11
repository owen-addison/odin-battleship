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
      messageElement.classList.add("text-orange-600");
      break;
    case "error":
      messageElement.classList.add("text-red-700");
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
  const message = `The ${resultsObject.player}'s move on ${resultsObject.move} resulted in a ${resultsObject.hit ? "HIT" : "MISS"}!`;
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
      let humanMoveResult;
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
          humanMoveResult = await humanPlayer.makeMove(compPlayerGameboard, gridPosition);

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
        resolve(humanMoveResult);
      };
    });
  }

  // Function for handling the playing of the game
  const playGame = async () => {
    let gameOver = false;
    let lastCompMoveResult;
    let lastHumanMoveResult;
    while (!gameOver) {
      console.dir(game.currentPlayer);
      // Player makes a move
      // eslint-disable-next-line no-await-in-loop
      lastHumanMoveResult = await promptPlayerMove(lastCompMoveResult);
      console.log("promptPlayerMove.then() ->");
      console.dir(lastHumanMoveResult);
      // Check for win condition
      // eslint-disable-next-line no-await-in-loop
      gameOver = await checkWinCondition();
      if (gameOver) break;

      // Computer makes a move
      // eslint-disable-next-line no-await-in-loop
      lastCompMoveResult = await computerMove(humanPlayerGameboard, compPlayer);
      console.log("Computer's move ->");
      console.dir(lastCompMoveResult);
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
      move,
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
          promptDiv.classList.add("text-sky-600");
          break;
        case "error":
          promptDiv.classList.add("text-red-700");
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
.text-orange-600 {
  --tw-text-opacity: 1;
  color: rgb(234 88 12 / var(--tw-text-opacity));
}
.text-red-500 {
  --tw-text-opacity: 1;
  color: rgb(239 68 68 / var(--tw-text-opacity));
}
.text-red-700 {
  --tw-text-opacity: 1;
  color: rgb(185 28 28 / var(--tw-text-opacity));
}
.text-rose-700 {
  --tw-text-opacity: 1;
  color: rgb(190 18 60 / var(--tw-text-opacity));
}
.text-sky-600 {
  --tw-text-opacity: 1;
  color: rgb(2 132 199 / var(--tw-text-opacity));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCLDBCQUEwQjtBQUMxQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsT0FBTyxrRkFBa0YsWUFBWSxNQUFNLE9BQU8scUJBQXFCLG9CQUFvQixxQkFBcUIscUJBQXFCLE1BQU0sTUFBTSxXQUFXLE1BQU0sWUFBWSxNQUFNLE1BQU0scUJBQXFCLHFCQUFxQixxQkFBcUIsVUFBVSxvQkFBb0IscUJBQXFCLHFCQUFxQixxQkFBcUIscUJBQXFCLE1BQU0sT0FBTyxNQUFNLEtBQUssb0JBQW9CLHFCQUFxQixNQUFNLFFBQVEsTUFBTSxLQUFLLG9CQUFvQixvQkFBb0IscUJBQXFCLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxXQUFXLE1BQU0sTUFBTSxNQUFNLFVBQVUsV0FBVyxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssVUFBVSxXQUFXLE1BQU0sTUFBTSxNQUFNLE1BQU0sV0FBVyxNQUFNLFNBQVMsTUFBTSxRQUFRLHFCQUFxQixxQkFBcUIscUJBQXFCLG9CQUFvQixNQUFNLE1BQU0sTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLE1BQU0sTUFBTSxVQUFVLFVBQVUsV0FBVyxXQUFXLE1BQU0sS0FBSyxVQUFVLE1BQU0sS0FBSyxVQUFVLE1BQU0sUUFBUSxNQUFNLEtBQUssb0JBQW9CLHFCQUFxQixxQkFBcUIsTUFBTSxRQUFRLE1BQU0sU0FBUyxxQkFBcUIscUJBQXFCLHFCQUFxQixvQkFBb0IscUJBQXFCLHFCQUFxQixvQkFBb0Isb0JBQW9CLG9CQUFvQixNQUFNLE1BQU0sTUFBTSxNQUFNLFdBQVcsTUFBTSxPQUFPLE1BQU0sUUFBUSxxQkFBcUIscUJBQXFCLHFCQUFxQixNQUFNLE1BQU0sTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sTUFBTSxNQUFNLFVBQVUsTUFBTSxPQUFPLE1BQU0sS0FBSyxxQkFBcUIscUJBQXFCLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE9BQU8sTUFBTSxLQUFLLHFCQUFxQixvQkFBb0IsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxNQUFNLGlCQUFpQixVQUFVLE1BQU0sS0FBSyxVQUFVLFVBQVUsTUFBTSxLQUFLLFVBQVUsTUFBTSxPQUFPLFdBQVcsVUFBVSxVQUFVLE1BQU0sTUFBTSxLQUFLLEtBQUssVUFBVSxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxPQUFPLE1BQU0sS0FBSyxvQkFBb0Isb0JBQW9CLE1BQU0sTUFBTSxvQkFBb0Isb0JBQW9CLE1BQU0sTUFBTSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sS0FBSyxLQUFLLFVBQVUsTUFBTSxRQUFRLE1BQU0sWUFBWSxvQkFBb0IscUJBQXFCLE1BQU0sTUFBTSxNQUFNLE1BQU0sVUFBVSxVQUFVLE1BQU0sV0FBVyxLQUFLLFVBQVUsTUFBTSxLQUFLLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsS0FBSyxNQUFNLEtBQUssV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxLQUFLLEtBQUssS0FBSyxLQUFLLE1BQU0sT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxN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QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O1VDYkE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxJQUFJO1dBQ0o7V0FDQTtXQUNBLElBQUk7V0FDSjtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxDQUFDO1dBQ0Q7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEVBQUU7V0FDRjtXQUNBLHNHQUFzRztXQUN0RztXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEdBQUc7V0FDSDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0EsRUFBRTtXQUNGO1dBQ0E7Ozs7O1dDaEVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BOzs7OztVRUFBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2FjdGlvbkNvbnRyb2xsZXIuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2Vycm9ycy5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvZ2FtZS5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvZ2FtZWJvYXJkLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvcGxheWVyLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9zaGlwLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy91aU1hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3N0eWxlcy5jc3MiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvc3R5bGVzLmNzcz8wYTI1Iiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvYXN5bmMgbW9kdWxlIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvbm9uY2UiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBHYW1lYm9hcmQgZnJvbSBcIi4vZ2FtZWJvYXJkXCI7XG5cbmNvbnN0IHsgZ3JpZCB9ID0gR2FtZWJvYXJkKCk7XG5cbmNvbnN0IHNoaXBzVG9QbGFjZSA9IFtcbiAgeyBzaGlwVHlwZTogXCJjYXJyaWVyXCIsIHNoaXBMZW5ndGg6IDUgfSxcbiAgeyBzaGlwVHlwZTogXCJiYXR0bGVzaGlwXCIsIHNoaXBMZW5ndGg6IDQgfSxcbiAgeyBzaGlwVHlwZTogXCJzdWJtYXJpbmVcIiwgc2hpcExlbmd0aDogMyB9LFxuICB7IHNoaXBUeXBlOiBcImNydWlzZXJcIiwgc2hpcExlbmd0aDogMyB9LFxuICB7IHNoaXBUeXBlOiBcImRlc3Ryb3llclwiLCBzaGlwTGVuZ3RoOiAyIH0sXG5dO1xuXG5sZXQgY3VycmVudE9yaWVudGF0aW9uID0gXCJoXCI7IC8vIERlZmF1bHQgb3JpZW50YXRpb25cbmxldCBjdXJyZW50U2hpcDtcbmxldCBsYXN0SG92ZXJlZENlbGwgPSBudWxsOyAvLyBTdG9yZSB0aGUgbGFzdCBob3ZlcmVkIGNlbGwncyBJRFxuXG5jb25zdCBwbGFjZVNoaXBHdWlkZSA9IHtcbiAgcHJvbXB0OlxuICAgIFwiRW50ZXIgdGhlIGdyaWQgcG9zaXRpb24gKGkuZS4gJ0ExJykgYW5kIG9yaWVudGF0aW9uICgnaCcgZm9yIGhvcml6b250YWwgYW5kICd2JyBmb3IgdmVydGljYWwpLCBzZXBhcmF0ZWQgd2l0aCBhIHNwYWNlLiBGb3IgZXhhbXBsZSAnQTIgdicuIEFsdGVybmF0aXZlbHksIG9uIHlvdSBnYW1lYm9hcmQgY2xpY2sgdGhlIGNlbGwgeW91IHdhbnQgdG8gc2V0IGF0IHRoZSBzdGFydGluZyBwb2ludCwgdXNlIHNwYWNlYmFyIHRvIHRvZ2dsZSB0aGUgb3JpZW50YXRpb24uXCIsXG4gIHByb21wdFR5cGU6IFwiZ3VpZGVcIixcbn07XG5cbmNvbnN0IGdhbWVwbGF5R3VpZGUgPSB7XG4gIHByb21wdDpcbiAgICBcIkVudGVyIGdyaWQgcG9zaXRpb24gKGkuZS4gJ0ExJykgeW91IHdhbnQgdG8gYXR0YWNrLiBBbHRlcm5hdGl2ZWx5LCBjbGljayB0aGUgY2VsbCB5b3Ugd2FudCB0byBhdHRhY2sgb24gdGhlIG9wcG9uZW50J3MgZ2FtZWJvYXJkXCIsXG4gIHByb21wdFR5cGU6IFwiZ3VpZGVcIixcbn07XG5cbmNvbnN0IHR1cm5Qcm9tcHQgPSB7XG4gIHByb21wdDogXCJNYWtlIHlvdXIgbW92ZS5cIixcbiAgcHJvbXB0VHlwZTogXCJpbnN0cnVjdGlvblwiLFxufTtcblxuY29uc3QgcHJvY2Vzc0NvbW1hbmQgPSAoY29tbWFuZCwgaXNNb3ZlKSA9PiB7XG4gIC8vIElmIGlzTW92ZSBpcyB0cnV0aHksIGFzc2lnbiBhcyBzaW5nbGUgaXRlbSBhcnJheSwgb3RoZXJ3aXNlIHNwbGl0IHRoZSBjb21tYW5kIGJ5IHNwYWNlXG4gIGNvbnN0IHBhcnRzID0gaXNNb3ZlID8gW2NvbW1hbmRdIDogY29tbWFuZC5zcGxpdChcIiBcIik7XG4gIGlmICghaXNNb3ZlICYmIHBhcnRzLmxlbmd0aCAhPT0gMikge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIFwiSW52YWxpZCBjb21tYW5kIGZvcm1hdC4gUGxlYXNlIHVzZSB0aGUgZm9ybWF0ICdHcmlkUG9zaXRpb24gT3JpZW50YXRpb24nLlwiLFxuICAgICk7XG4gIH1cblxuICAvLyBQcm9jZXNzIGFuZCB2YWxpZGF0ZSB0aGUgZ3JpZCBwb3NpdGlvblxuICBjb25zdCBncmlkUG9zaXRpb24gPSBwYXJ0c1swXS50b1VwcGVyQ2FzZSgpO1xuICBpZiAoZ3JpZFBvc2l0aW9uLmxlbmd0aCA8IDIgfHwgZ3JpZFBvc2l0aW9uLmxlbmd0aCA+IDMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGdyaWQgcG9zaXRpb24uIE11c3QgYmUgMiB0byAzIGNoYXJhY3RlcnMgbG9uZy5cIik7XG4gIH1cblxuICAvLyBWYWxpZGF0ZSBncmlkIHBvc2l0aW9uIGFnYWluc3QgdGhlIGdyaWQgbWF0cml4XG4gIGNvbnN0IHZhbGlkR3JpZFBvc2l0aW9ucyA9IGdyaWQuZmxhdCgpOyAvLyBGbGF0dGVuIHRoZSBncmlkIGZvciBlYXNpZXIgc2VhcmNoaW5nXG4gIGlmICghdmFsaWRHcmlkUG9zaXRpb25zLmluY2x1ZGVzKGdyaWRQb3NpdGlvbikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIkludmFsaWQgZ3JpZCBwb3NpdGlvbi4gRG9lcyBub3QgbWF0Y2ggYW55IHZhbGlkIGdyaWQgdmFsdWVzLlwiLFxuICAgICk7XG4gIH1cblxuICBjb25zdCByZXN1bHQgPSB7IGdyaWRQb3NpdGlvbiB9O1xuXG4gIGlmICghaXNNb3ZlKSB7XG4gICAgLy8gUHJvY2VzcyBhbmQgdmFsaWRhdGUgdGhlIG9yaWVudGF0aW9uXG4gICAgY29uc3Qgb3JpZW50YXRpb24gPSBwYXJ0c1sxXS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChvcmllbnRhdGlvbiAhPT0gXCJoXCIgJiYgb3JpZW50YXRpb24gIT09IFwidlwiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiSW52YWxpZCBvcmllbnRhdGlvbi4gTXVzdCBiZSBlaXRoZXIgJ2gnIGZvciBob3Jpem9udGFsIG9yICd2JyBmb3IgdmVydGljYWwuXCIsXG4gICAgICApO1xuICAgIH1cblxuICAgIHJlc3VsdC5vcmllbnRhdGlvbiA9IG9yaWVudGF0aW9uO1xuICB9XG5cbiAgLy8gUmV0dXJuIHRoZSBwcm9jZXNzZWQgYW5kIHZhbGlkYXRlZCBjb21tYW5kIHBhcnRzXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vLyBUaGUgZnVuY3Rpb24gZm9yIHVwZGF0aW5nIHRoZSBvdXRwdXQgZGl2IGVsZW1lbnRcbmNvbnN0IHVwZGF0ZU91dHB1dCA9IChtZXNzYWdlLCB0eXBlKSA9PiB7XG4gIC8vIEdldCB0aGUgb3VwdXQgZWxlbWVudFxuICBjb25zdCBvdXRwdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtb3V0cHV0XCIpO1xuXG4gIC8vIEFwcGVuZCBuZXcgbWVzc2FnZVxuICBjb25zdCBtZXNzYWdlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7IC8vIENyZWF0ZSBhIG5ldyBkaXYgZm9yIHRoZSBtZXNzYWdlXG4gIG1lc3NhZ2VFbGVtZW50LnRleHRDb250ZW50ID0gbWVzc2FnZTsgLy8gU2V0IHRoZSB0ZXh0IGNvbnRlbnQgdG8gdGhlIG1lc3NhZ2VcblxuICAvLyBBcHBseSBzdHlsaW5nIGJhc2VkIG9uIHByb21wdFR5cGVcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSBcInZhbGlkXCI6XG4gICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwidGV4dC1saW1lLTYwMFwiKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJtaXNzXCI6XG4gICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwidGV4dC1vcmFuZ2UtNjAwXCIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImVycm9yXCI6XG4gICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwidGV4dC1yZWQtNzAwXCIpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIG1lc3NhZ2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJ0ZXh0LWdyYXktODAwXCIpOyAvLyBEZWZhdWx0IHRleHQgY29sb3JcbiAgfVxuXG4gIG91dHB1dC5hcHBlbmRDaGlsZChtZXNzYWdlRWxlbWVudCk7IC8vIEFkZCB0aGUgZWxlbWVudCB0byB0aGUgb3V0cHV0XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIG91dHB1dC5zY3JvbGxUb3AgPSBvdXRwdXQuc2Nyb2xsSGVpZ2h0OyAvLyBTY3JvbGwgdG8gdGhlIGJvdHRvbSBvZiB0aGUgb3V0cHV0IGNvbnRhaW5lclxufTtcblxuLy8gVGhlIGZ1bmN0aW9uIGZvciBleGVjdXRpbmcgY29tbWFuZHMgZnJvbSB0aGUgY29uc29sZSBpbnB1dFxuY29uc3QgY29uc29sZUxvZ1BsYWNlbWVudENvbW1hbmQgPSAoc2hpcFR5cGUsIGdyaWRQb3NpdGlvbiwgb3JpZW50YXRpb24pID0+IHtcbiAgLy8gU2V0IHRoZSBvcmllbnRhdGlvbiBmZWVkYmFja1xuICBjb25zdCBkaXJGZWViYWNrID0gb3JpZW50YXRpb24gPT09IFwiaFwiID8gXCJob3Jpem9udGFsbHlcIiA6IFwidmVydGljYWxseVwiO1xuICAvLyBTZXQgdGhlIGNvbnNvbGUgbWVzc2FnZVxuICBjb25zdCBtZXNzYWdlID0gYCR7c2hpcFR5cGUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzaGlwVHlwZS5zbGljZSgxKX0gcGxhY2VkIGF0ICR7Z3JpZFBvc2l0aW9ufSBmYWNpbmcgJHtkaXJGZWViYWNrfWA7XG5cbiAgY29uc29sZS5sb2coYCR7bWVzc2FnZX1gKTtcblxuICB1cGRhdGVPdXRwdXQoYD4gJHttZXNzYWdlfWAsIFwidmFsaWRcIik7XG5cbiAgLy8gQ2xlYXIgdGhlIGlucHV0XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1pbnB1dFwiKS52YWx1ZSA9IFwiXCI7XG59O1xuXG4vLyBUaGUgZnVuY3Rpb24gZm9yIGV4ZWN1dGluZyBjb21tYW5kcyBmcm9tIHRoZSBjb25zb2xlIGlucHV0XG5jb25zdCBjb25zb2xlTG9nTW92ZUNvbW1hbmQgPSAocmVzdWx0c09iamVjdCkgPT4ge1xuICAvLyBTZXQgdGhlIGNvbnNvbGUgbWVzc2FnZVxuICBjb25zdCBtZXNzYWdlID0gYFRoZSAke3Jlc3VsdHNPYmplY3QucGxheWVyfSdzIG1vdmUgb24gJHtyZXN1bHRzT2JqZWN0Lm1vdmV9IHJlc3VsdGVkIGluIGEgJHtyZXN1bHRzT2JqZWN0LmhpdCA/IFwiSElUXCIgOiBcIk1JU1NcIn0hYDtcblxuICBjb25zb2xlLmxvZyhgJHttZXNzYWdlfWApO1xuXG4gIHVwZGF0ZU91dHB1dChgPiAke21lc3NhZ2V9YCwgcmVzdWx0c09iamVjdC5oaXQgPyBcInZhbGlkXCIgOiBcIm1pc3NcIik7XG5cbiAgLy8gQ2xlYXIgdGhlIGlucHV0XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1pbnB1dFwiKS52YWx1ZSA9IFwiXCI7XG59O1xuXG5jb25zdCBjb25zb2xlTG9nRXJyb3IgPSAoZXJyb3IsIHNoaXBUeXBlKSA9PiB7XG4gIGlmIChzaGlwVHlwZSkge1xuICAgIC8vIElmIHNoaXBUeXBlIGlzIHBhc3NlZCB0aGVuIHByb2Nlc3MgZXJyb3IgYXMgcGxhY2VtZW50IGVycm9yXG4gICAgY29uc29sZS5lcnJvcihgRXJyb3IgcGxhY2luZyAke3NoaXBUeXBlfTogbWVzc2FnZSA9ICR7ZXJyb3IubWVzc2FnZX0uYCk7XG5cbiAgICB1cGRhdGVPdXRwdXQoYD4gRXJyb3IgcGxhY2luZyAke3NoaXBUeXBlfTogJHtlcnJvci5tZXNzYWdlfWAsIFwiZXJyb3JcIik7XG4gIH0gZWxzZSB7XG4gICAgLy8gZWxzZSBpZiBzaGlwVHlwZSBpcyB1bmRlZmluZWQsIHByb2Nlc3MgZXJyb3IgYXMgbW92ZSBlcnJvclxuICAgIGNvbnNvbGUubG9nKGBFcnJvciBtYWtpbmcgbW92ZTogbWVzc2FnZSA9ICR7ZXJyb3IubWVzc2FnZX0uYCk7XG5cbiAgICB1cGRhdGVPdXRwdXQoYD4gRXJyb3IgbWFraW5nIG1vdmU6IG1lc3NhZ2UgPSAke2Vycm9yLm1lc3NhZ2V9LmAsIFwiZXJyb3JcIik7XG4gIH1cblxuICAvLyBDbGVhciB0aGUgaW5wdXRcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLWlucHV0XCIpLnZhbHVlID0gXCJcIjtcbn07XG5cbi8vIEZ1bmN0aW9uIGluaXRpYWxpc2UgdWlNYW5hZ2VyXG5jb25zdCBpbml0VWlNYW5hZ2VyID0gKHVpTWFuYWdlcikgPT4ge1xuICAvLyBJbml0aWFsaXNlIGNvbnNvbGVcbiAgdWlNYW5hZ2VyLmluaXRDb25zb2xlVUkoKTtcblxuICAvLyBJbml0aWFsaXNlIGdhbWVib2FyZCB3aXRoIGNhbGxiYWNrIGZvciBjZWxsIGNsaWNrc1xuICB1aU1hbmFnZXIuY3JlYXRlR2FtZWJvYXJkKFwiaHVtYW4tZ2JcIik7XG4gIHVpTWFuYWdlci5jcmVhdGVHYW1lYm9hcmQoXCJjb21wLWdiXCIpO1xufTtcblxuLy8gRnVuY3Rpb24gdG8gY2FsY3VsYXRlIGNlbGwgSURzIGJhc2VkIG9uIHN0YXJ0IHBvc2l0aW9uLCBsZW5ndGgsIGFuZCBvcmllbnRhdGlvblxuZnVuY3Rpb24gY2FsY3VsYXRlU2hpcENlbGxzKHN0YXJ0Q2VsbCwgc2hpcExlbmd0aCwgb3JpZW50YXRpb24pIHtcbiAgY29uc3QgY2VsbElkcyA9IFtdO1xuICBjb25zdCByb3dJbmRleCA9IHN0YXJ0Q2VsbC5jaGFyQ29kZUF0KDApIC0gXCJBXCIuY2hhckNvZGVBdCgwKTtcbiAgY29uc3QgY29sSW5kZXggPSBwYXJzZUludChzdGFydENlbGwuc3Vic3RyaW5nKDEpLCAxMCkgLSAxO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgaWYgKG9yaWVudGF0aW9uID09PSBcInZcIikge1xuICAgICAgaWYgKGNvbEluZGV4ICsgaSA+PSBncmlkWzBdLmxlbmd0aCkgYnJlYWs7IC8vIENoZWNrIGdyaWQgYm91bmRzXG4gICAgICBjZWxsSWRzLnB1c2goXG4gICAgICAgIGAke1N0cmluZy5mcm9tQ2hhckNvZGUocm93SW5kZXggKyBcIkFcIi5jaGFyQ29kZUF0KDApKX0ke2NvbEluZGV4ICsgaSArIDF9YCxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChyb3dJbmRleCArIGkgPj0gZ3JpZC5sZW5ndGgpIGJyZWFrOyAvLyBDaGVjayBncmlkIGJvdW5kc1xuICAgICAgY2VsbElkcy5wdXNoKFxuICAgICAgICBgJHtTdHJpbmcuZnJvbUNoYXJDb2RlKHJvd0luZGV4ICsgaSArIFwiQVwiLmNoYXJDb2RlQXQoMCkpfSR7Y29sSW5kZXggKyAxfWAsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjZWxsSWRzO1xufVxuXG4vLyBGdW5jdGlvbiB0byBoaWdobGlnaHQgY2VsbHNcbmZ1bmN0aW9uIGhpZ2hsaWdodENlbGxzKGNlbGxJZHMpIHtcbiAgY2VsbElkcy5mb3JFYWNoKChjZWxsSWQpID0+IHtcbiAgICBjb25zdCBjZWxsRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiJHtjZWxsSWR9XCJdYCk7XG4gICAgaWYgKGNlbGxFbGVtZW50KSB7XG4gICAgICBjZWxsRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiYmctb3JhbmdlLTQwMFwiKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBGdW5jdGlvbiB0byBjbGVhciBoaWdobGlnaHQgZnJvbSBjZWxsc1xuZnVuY3Rpb24gY2xlYXJIaWdobGlnaHQoY2VsbElkcykge1xuICBjZWxsSWRzLmZvckVhY2goKGNlbGxJZCkgPT4ge1xuICAgIGNvbnN0IGNlbGxFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcG9zaXRpb249XCIke2NlbGxJZH1cIl1gKTtcbiAgICBpZiAoY2VsbEVsZW1lbnQpIHtcbiAgICAgIGNlbGxFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJiZy1vcmFuZ2UtNDAwXCIpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIEZ1bmN0aW9uIHRvIHRvZ2dsZSBvcmllbnRhdGlvblxuZnVuY3Rpb24gdG9nZ2xlT3JpZW50YXRpb24oKSB7XG4gIGN1cnJlbnRPcmllbnRhdGlvbiA9IGN1cnJlbnRPcmllbnRhdGlvbiA9PT0gXCJoXCIgPyBcInZcIiA6IFwiaFwiO1xuICAvLyBVcGRhdGUgdGhlIHZpc3VhbCBwcm9tcHQgaGVyZSBpZiBuZWNlc3Nhcnlcbn1cblxuY29uc3QgaGFuZGxlUGxhY2VtZW50SG92ZXIgPSAoZSkgPT4ge1xuICBjb25zdCBjZWxsID0gZS50YXJnZXQ7XG4gIGlmIChcbiAgICBjZWxsLmNsYXNzTGlzdC5jb250YWlucyhcImdhbWVib2FyZC1jZWxsXCIpICYmXG4gICAgY2VsbC5kYXRhc2V0LnBsYXllciA9PT0gXCJodW1hblwiXG4gICkge1xuICAgIC8vIExvZ2ljIHRvIGhhbmRsZSBob3ZlciBlZmZlY3RcbiAgICBjb25zdCBjZWxsUG9zID0gY2VsbC5kYXRhc2V0LnBvc2l0aW9uO1xuICAgIGxhc3RIb3ZlcmVkQ2VsbCA9IGNlbGxQb3M7XG4gICAgY29uc3QgY2VsbHNUb0hpZ2hsaWdodCA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgIGNlbGxQb3MsXG4gICAgICBjdXJyZW50U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgY3VycmVudE9yaWVudGF0aW9uLFxuICAgICk7XG4gICAgaGlnaGxpZ2h0Q2VsbHMoY2VsbHNUb0hpZ2hsaWdodCk7XG4gIH1cbn07XG5cbmNvbnN0IGhhbmRsZU1vdXNlTGVhdmUgPSAoZSkgPT4ge1xuICBjb25zdCBjZWxsID0gZS50YXJnZXQ7XG4gIGlmIChjZWxsLmNsYXNzTGlzdC5jb250YWlucyhcImdhbWVib2FyZC1jZWxsXCIpKSB7XG4gICAgLy8gTG9naWMgZm9yIGhhbmRsaW5nIHdoZW4gdGhlIGN1cnNvciBsZWF2ZXMgYSBjZWxsXG4gICAgY29uc3QgY2VsbFBvcyA9IGNlbGwuZGF0YXNldC5wb3NpdGlvbjtcbiAgICBpZiAoY2VsbFBvcyA9PT0gbGFzdEhvdmVyZWRDZWxsKSB7XG4gICAgICBjb25zdCBjZWxsc1RvQ2xlYXIgPSBjYWxjdWxhdGVTaGlwQ2VsbHMoXG4gICAgICAgIGNlbGxQb3MsXG4gICAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICAgIGN1cnJlbnRPcmllbnRhdGlvbixcbiAgICAgICk7XG4gICAgICBjbGVhckhpZ2hsaWdodChjZWxsc1RvQ2xlYXIpO1xuICAgICAgbGFzdEhvdmVyZWRDZWxsID0gbnVsbDsgLy8gUmVzZXQgbGFzdEhvdmVyZWRDZWxsIHNpbmNlIHRoZSBtb3VzZSBoYXMgbGVmdFxuICAgIH1cbiAgICBsYXN0SG92ZXJlZENlbGwgPSBudWxsO1xuICB9XG59O1xuXG5jb25zdCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSA9IChlKSA9PiB7XG4gIGlmIChlLmtleSA9PT0gXCIgXCIgJiYgbGFzdEhvdmVyZWRDZWxsKSB7XG4gICAgLy8gRW5zdXJlIHNwYWNlYmFyIGlzIHByZXNzZWQgYW5kIHRoZXJlJ3MgYSBsYXN0IGhvdmVyZWQgY2VsbFxuICAgIGUucHJldmVudERlZmF1bHQoKTsgLy8gUHJldmVudCB0aGUgZGVmYXVsdCBzcGFjZWJhciBhY3Rpb25cblxuICAgIC8vIFRvZ2dsZSB0aGUgb3JpZW50YXRpb25cbiAgICB0b2dnbGVPcmllbnRhdGlvbigpO1xuXG4gICAgLy8gQ2xlYXIgcHJldmlvdXNseSBoaWdobGlnaHRlZCBjZWxsc1xuICAgIC8vIEFzc3VtaW5nIGNhbGN1bGF0ZVNoaXBDZWxscyBhbmQgY2xlYXJIaWdobGlnaHQgd29yayBjb3JyZWN0bHlcbiAgICBjb25zdCBvbGRDZWxsc1RvQ2xlYXIgPSBjYWxjdWxhdGVTaGlwQ2VsbHMoXG4gICAgICBsYXN0SG92ZXJlZENlbGwsXG4gICAgICBjdXJyZW50U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgY3VycmVudE9yaWVudGF0aW9uID09PSBcImhcIiA/IFwidlwiIDogXCJoXCIsXG4gICAgKTtcbiAgICBjbGVhckhpZ2hsaWdodChvbGRDZWxsc1RvQ2xlYXIpO1xuXG4gICAgLy8gSGlnaGxpZ2h0IG5ldyBjZWxscyBiYXNlZCBvbiB0aGUgbmV3IG9yaWVudGF0aW9uXG4gICAgY29uc3QgbmV3Q2VsbHNUb0hpZ2hsaWdodCA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgIGxhc3RIb3ZlcmVkQ2VsbCxcbiAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICBjdXJyZW50T3JpZW50YXRpb24sXG4gICAgKTtcbiAgICBoaWdobGlnaHRDZWxscyhuZXdDZWxsc1RvSGlnaGxpZ2h0KTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZW5hYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlcigpIHtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvckFsbCgnLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPVwiY29tcHV0ZXJcIl0nKVxuICAgIC5mb3JFYWNoKChjZWxsKSA9PiB7XG4gICAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUoXCJwb2ludGVyLWV2ZW50cy1ub25lXCIsIFwiY3Vyc29yLWRlZmF1bHRcIik7XG4gICAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUoXCJob3ZlcjpiZy1vcmFuZ2UtNTAwXCIpO1xuICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKFwiaG92ZXI6Ymctb3JhbmdlLTUwMFwiKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZGlzYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoKSB7XG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImNvbXB1dGVyXCJdJylcbiAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKFwicG9pbnRlci1ldmVudHMtbm9uZVwiLCBcImN1cnNvci1kZWZhdWx0XCIpO1xuICAgICAgY2VsbC5jbGFzc0xpc3QucmVtb3ZlKFwiaG92ZXI6Ymctb3JhbmdlLTUwMFwiKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZGlzYWJsZUh1bWFuR2FtZWJvYXJkSG92ZXIoKSB7XG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImh1bWFuXCJdJylcbiAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKFwicG9pbnRlci1ldmVudHMtbm9uZVwiLCBcImN1cnNvci1kZWZhdWx0XCIpO1xuICAgICAgY2VsbC5jbGFzc0xpc3QucmVtb3ZlKFwiaG92ZXI6Ymctb3JhbmdlLTUwMFwiKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc3dpdGNoR2FtZWJvYXJkSG92ZXJTdGF0ZXMoKSB7XG4gIC8vIERpc2FibGUgaG92ZXIgb24gdGhlIGh1bWFuJ3MgZ2FtZWJvYXJkXG4gIGRpc2FibGVIdW1hbkdhbWVib2FyZEhvdmVyKCk7XG5cbiAgLy8gRW5hYmxlIGhvdmVyIG9uIHRoZSBjb21wdXRlcidzIGdhbWVib2FyZFxuICBlbmFibGVDb21wdXRlckdhbWVib2FyZEhvdmVyKCk7XG59XG5cbi8vIEZ1bmN0aW9uIHRvIHNldHVwIGdhbWVib2FyZCBmb3Igc2hpcCBwbGFjZW1lbnRcbmNvbnN0IHNldHVwR2FtZWJvYXJkRm9yUGxhY2VtZW50ID0gKCkgPT4ge1xuICBkaXNhYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlcigpO1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9XCJodW1hblwiXScpXG4gICAgLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgaGFuZGxlUGxhY2VtZW50SG92ZXIpO1xuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCBoYW5kbGVNb3VzZUxlYXZlKTtcbiAgICB9KTtcbiAgLy8gR2V0IGdhbWVib2FyZCBhcmVhIGRpdiBlbGVtZW50XG4gIGNvbnN0IGdhbWVib2FyZEFyZWEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgIFwiLmdhbWVib2FyZC1hcmVhLCBbZGF0YS1wbGF5ZXI9J2h1bWFuJ11cIixcbiAgKTtcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyB0byBnYW1lYm9hcmQgYXJlYSB0byBhZGQgYW5kIHJlbW92ZSB0aGVcbiAgLy8gaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUgZXZlbnQgbGlzdGVuZXIgd2hlbiBlbnRlcmluZyBhbmQgZXhpdGluZyB0aGUgYXJlYVxuICBnYW1lYm9hcmRBcmVhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSk7XG4gIH0pO1xuICBnYW1lYm9hcmRBcmVhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSk7XG4gIH0pO1xufTtcblxuLy8gRnVuY3Rpb24gdG8gY2xlYW4gdXAgYWZ0ZXIgc2hpcCBwbGFjZW1lbnQgaXMgY29tcGxldGVcbmNvbnN0IGNsZWFudXBBZnRlclBsYWNlbWVudCA9ICgpID0+IHtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvckFsbCgnLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPVwiaHVtYW5cIl0nKVxuICAgIC5mb3JFYWNoKChjZWxsKSA9PiB7XG4gICAgICBjZWxsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIGhhbmRsZVBsYWNlbWVudEhvdmVyKTtcbiAgICAgIGNlbGwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgaGFuZGxlTW91c2VMZWF2ZSk7XG4gICAgfSk7XG4gIC8vIEdldCBnYW1lYm9hcmQgYXJlYSBkaXYgZWxlbWVudFxuICBjb25zdCBnYW1lYm9hcmRBcmVhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICBcIi5nYW1lYm9hcmQtYXJlYSwgW2RhdGEtcGxheWVyPSdodW1hbiddXCIsXG4gICk7XG4gIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMgdG8gZ2FtZWJvYXJkIGFyZWEgdG8gYWRkIGFuZCByZW1vdmUgdGhlXG4gIC8vIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlIGV2ZW50IGxpc3RlbmVyIHdoZW4gZW50ZXJpbmcgYW5kIGV4aXRpbmcgdGhlIGFyZWFcbiAgZ2FtZWJvYXJkQXJlYS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xuICB9KTtcbiAgZ2FtZWJvYXJkQXJlYS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xuICB9KTtcbiAgLy8gUmVtb3ZlIGV2ZW50IGxpc3RlbmVyIGZvciBrZXlkb3duIGV2ZW50c1xuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSk7XG59O1xuXG4vLyBGdW5jdGlvbiBmb3Igc3RhcnRpbmcgdGhlIGdhbWVcbmNvbnN0IHN0YXJ0R2FtZSA9ICh1aU1hbmFnZXIsIGdhbWUpID0+IHtcbiAgLy8gU2V0IHVwIHRoZSBnYW1lIGJ5IGF1dG8gcGxhY2luZyBjb21wdXRlcidzIHNoaXBzIGFuZCBzZXR0aW5nIHRoZVxuICAvLyBjdXJyZW50IHBsYXllciB0byB0aGUgaHVtYW4gcGxheWVyXG4gIGdhbWUuc2V0VXAoKTtcblxuICAvLyBEaXNwbGF5IHByb21wdCBvYmplY3QgZm9yIHRha2luZyBhIHR1cm4gYW5kIHN0YXJ0aW5nIHRoZSBnYW1lXG4gIHVpTWFuYWdlci5kaXNwbGF5UHJvbXB0KHsgdHVyblByb21wdCwgZ2FtZXBsYXlHdWlkZSB9KTtcbn07XG5cbmNvbnN0IGhhbmRsZUh1bWFuTW92ZSA9IChlKSA9PiB7XG4gIC8vIEdldCB0aGUgcG9zaXRpb24gb24gdGhlIGJvYXJkIHRvIG1ha2UgYSBtb3ZlXG4gIGNvbnN0IHsgcG9zaXRpb24gfSA9IGUudGFyZ2V0LmRhdGE7XG59O1xuXG4vLyBTZXR1cCBnYW1lYm9hcmQgZm9yIGZvciBwbGF5ZXIgbW92ZVxuY29uc3Qgc2V0dXBHYW1lYm9hcmRGb3JQbGF5ZXJNb3ZlID0gKCkgPT4ge1xuICAvLyBFbmFibGUgdGhlIGhvdmVyIHN0YXRlIGZvciB0aGUgY29tcHV0ZXIgZ2FtZWJvYXJkXG4gIGVuYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoKTtcblxuICAvLyBTZXQgdXAgZXZlbnQgbGlzdGVuZXJzIG9uIHRoZSBjb21wdXRlciBnYW1lYm9hcmQgZm9yIHRoZSBwbGF5ZXJcbiAgLy8gbWFraW5nIG1vdmVzXG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImNvbXB1dGVyXCJdJylcbiAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgaGFuZGxlSHVtYW5Nb3ZlKTtcbiAgICB9KTtcbn07XG5cbmFzeW5jIGZ1bmN0aW9uIHBsYXllck1vdmUoKSB7XG4gIC8vIFdhaXQgZm9yIHBsYXllcidzIG1vdmUgKGNsaWNrIG9yIGNvbnNvbGUgaW5wdXQpXG4gIC8vIFVwZGF0ZSBVSSBiYXNlZCBvbiBtb3ZlXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvbXB1dGVyTW92ZShodW1hblBsYXllckdhbWVib2FyZCwgY29tcFBsYXllcikge1xuICBsZXQgY29tcE1vdmVSZXN1bHQ7XG4gIHRyeSB7XG4gICAgLy8gQ29tcHV0ZXIgbG9naWMgdG8gY2hvb3NlIGEgbW92ZVxuICAgIC8vIFVwZGF0ZSBVSSBiYXNlZCBvbiBtb3ZlXG4gICAgY29tcE1vdmVSZXN1bHQgPSBjb21wUGxheWVyLm1ha2VNb3ZlKGh1bWFuUGxheWVyR2FtZWJvYXJkKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlTG9nRXJyb3IoZXJyb3IpO1xuICB9XG4gIHJldHVybiBjb21wTW92ZVJlc3VsdDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY2hlY2tXaW5Db25kaXRpb24oKSB7XG4gIC8vIENoZWNrIGlmIGFsbCBzaGlwcyBhcmUgc3Vua1xuICAvLyBSZXR1cm4gdHJ1ZSBpZiBnYW1lIGlzIG92ZXIsIGZhbHNlIG90aGVyd2lzZVxufVxuXG5mdW5jdGlvbiBjb25jbHVkZUdhbWUoKSB7XG4gIC8vIERpc3BsYXkgd2lubmVyLCB1cGRhdGUgVUksIGV0Yy5cbn1cblxuY29uc3QgQWN0aW9uQ29udHJvbGxlciA9ICh1aU1hbmFnZXIsIGdhbWUpID0+IHtcbiAgY29uc3QgaHVtYW5QbGF5ZXIgPSBnYW1lLnBsYXllcnMuaHVtYW47XG4gIGNvbnN0IGh1bWFuUGxheWVyR2FtZWJvYXJkID0gaHVtYW5QbGF5ZXIuZ2FtZWJvYXJkO1xuICBjb25zdCBjb21wUGxheWVyID0gZ2FtZS5wbGF5ZXJzLmNvbXB1dGVyO1xuICBjb25zdCBjb21wUGxheWVyR2FtZWJvYXJkID0gY29tcFBsYXllci5nYW1lYm9hcmQ7XG5cbiAgLy8gRnVuY3Rpb24gdG8gc2V0dXAgZXZlbnQgbGlzdGVuZXJzIGZvciBjb25zb2xlIGFuZCBnYW1lYm9hcmQgY2xpY2tzXG4gIGZ1bmN0aW9uIHNldHVwRXZlbnRMaXN0ZW5lcnMoaGFuZGxlckZ1bmN0aW9uLCBwbGF5ZXJUeXBlKSB7XG4gICAgLy8gRGVmaW5lIGNsZWFudXAgZnVuY3Rpb25zIGluc2lkZSB0byBlbnN1cmUgdGhleSBhcmUgYWNjZXNzaWJsZSBmb3IgcmVtb3ZhbFxuICAgIGNvbnN0IGNsZWFudXBGdW5jdGlvbnMgPSBbXTtcblxuICAgIGNvbnN0IGNvbnNvbGVTdWJtaXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtc3VibWl0XCIpO1xuICAgIGNvbnN0IGNvbnNvbGVJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1pbnB1dFwiKTtcblxuICAgIGNvbnN0IHN1Ym1pdEhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICBjb25zdCBpbnB1dCA9IGNvbnNvbGVJbnB1dC52YWx1ZTtcbiAgICAgIGhhbmRsZXJGdW5jdGlvbihpbnB1dCk7XG4gICAgICBjb25zb2xlSW5wdXQudmFsdWUgPSBcIlwiOyAvLyBDbGVhciBpbnB1dCBhZnRlciBzdWJtaXNzaW9uXG4gICAgfTtcblxuICAgIGNvbnN0IGtleXByZXNzSGFuZGxlciA9IChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09IFwiRW50ZXJcIikge1xuICAgICAgICBzdWJtaXRIYW5kbGVyKCk7IC8vIFJldXNlIHN1Ym1pdCBsb2dpYyBmb3IgRW50ZXIga2V5IHByZXNzXG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnNvbGVTdWJtaXRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHN1Ym1pdEhhbmRsZXIpO1xuICAgIGNvbnNvbGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwga2V5cHJlc3NIYW5kbGVyKTtcblxuICAgIC8vIEFkZCBjbGVhbnVwIGZ1bmN0aW9uIGZvciBjb25zb2xlIGxpc3RlbmVyc1xuICAgIGNsZWFudXBGdW5jdGlvbnMucHVzaCgoKSA9PiB7XG4gICAgICBjb25zb2xlU3VibWl0QnV0dG9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzdWJtaXRIYW5kbGVyKTtcbiAgICAgIGNvbnNvbGVJbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwga2V5cHJlc3NIYW5kbGVyKTtcbiAgICB9KTtcblxuICAgIC8vIFNldHVwIGZvciBnYW1lYm9hcmQgY2VsbCBjbGlja3NcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoYC5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj0ke3BsYXllclR5cGV9XWApXG4gICAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgICBjb25zdCBjbGlja0hhbmRsZXIgPSAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgeyBwb3NpdGlvbiB9ID0gY2VsbC5kYXRhc2V0O1xuICAgICAgICAgIGxldCBpbnB1dDtcbiAgICAgICAgICBpZiAocGxheWVyVHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICAgICAgICBpbnB1dCA9IGAke3Bvc2l0aW9ufSAke2N1cnJlbnRPcmllbnRhdGlvbn1gO1xuICAgICAgICAgIH0gZWxzZSBpZiAocGxheWVyVHlwZSA9PT0gXCJjb21wdXRlclwiKSB7XG4gICAgICAgICAgICBpbnB1dCA9IHBvc2l0aW9uO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIFwiRXJyb3IhIEludmFsaWQgcGxheWVyIHR5cGUgcGFzc2VkIHRvIGNsaWNrSGFuZGxlciFcIixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnNvbGUubG9nKGBjbGlja0hhbmRsZXIgaW5wdXQgPSAke2lucHV0fWApO1xuICAgICAgICAgIGhhbmRsZXJGdW5jdGlvbihpbnB1dCk7XG4gICAgICAgIH07XG4gICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsaWNrSGFuZGxlcik7XG5cbiAgICAgICAgLy8gQWRkIGNsZWFudXAgZnVuY3Rpb24gZm9yIGVhY2ggY2VsbCBsaXN0ZW5lclxuICAgICAgICBjbGVhbnVwRnVuY3Rpb25zLnB1c2goKCkgPT5cbiAgICAgICAgICBjZWxsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbGlja0hhbmRsZXIpLFxuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICAvLyBSZXR1cm4gYSBzaW5nbGUgY2xlYW51cCBmdW5jdGlvbiB0byByZW1vdmUgYWxsIGxpc3RlbmVyc1xuICAgIHJldHVybiAoKSA9PiBjbGVhbnVwRnVuY3Rpb25zLmZvckVhY2goKGNsZWFudXApID0+IGNsZWFudXAoKSk7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBwcm9tcHRBbmRQbGFjZVNoaXAoc2hpcFR5cGUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgLy8gU2V0IHRoZSBjdXJyZW50IHNoaXBcbiAgICAgIGN1cnJlbnRTaGlwID0gc2hpcHNUb1BsYWNlLmZpbmQoKHNoaXApID0+IHNoaXAuc2hpcFR5cGUgPT09IHNoaXBUeXBlKTtcblxuICAgICAgLy8gRGlzcGxheSBwcm9tcHQgZm9yIHRoZSBzcGVjaWZpYyBzaGlwIHR5cGUgYXMgd2VsbCBhcyB0aGUgZ3VpZGUgdG8gcGxhY2luZyBzaGlwc1xuICAgICAgY29uc3QgcGxhY2VTaGlwUHJvbXB0ID0ge1xuICAgICAgICBwcm9tcHQ6IGBQbGFjZSB5b3VyICR7c2hpcFR5cGV9LmAsXG4gICAgICAgIHByb21wdFR5cGU6IFwiaW5zdHJ1Y3Rpb25cIixcbiAgICAgIH07XG4gICAgICB1aU1hbmFnZXIuZGlzcGxheVByb21wdCh7IHBsYWNlU2hpcFByb21wdCwgcGxhY2VTaGlwR3VpZGUgfSk7XG5cbiAgICAgIGNvbnN0IGhhbmRsZVZhbGlkSW5wdXQgPSBhc3luYyAoaW5wdXQpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB7IGdyaWRQb3NpdGlvbiwgb3JpZW50YXRpb24gfSA9IHByb2Nlc3NDb21tYW5kKGlucHV0LCBmYWxzZSk7XG4gICAgICAgICAgYXdhaXQgaHVtYW5QbGF5ZXJHYW1lYm9hcmQucGxhY2VTaGlwKFxuICAgICAgICAgICAgc2hpcFR5cGUsXG4gICAgICAgICAgICBncmlkUG9zaXRpb24sXG4gICAgICAgICAgICBvcmllbnRhdGlvbixcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnNvbGVMb2dQbGFjZW1lbnRDb21tYW5kKHNoaXBUeXBlLCBncmlkUG9zaXRpb24sIG9yaWVudGF0aW9uKTtcbiAgICAgICAgICAvLyBSZW1vdmUgY2VsbCBoaWdobGlnaHRzXG4gICAgICAgICAgY29uc3QgY2VsbHNUb0NsZWFyID0gY2FsY3VsYXRlU2hpcENlbGxzKFxuICAgICAgICAgICAgZ3JpZFBvc2l0aW9uLFxuICAgICAgICAgICAgY3VycmVudFNoaXAuc2hpcExlbmd0aCxcbiAgICAgICAgICAgIG9yaWVudGF0aW9uLFxuICAgICAgICAgICk7XG4gICAgICAgICAgY2xlYXJIaWdobGlnaHQoY2VsbHNUb0NsZWFyKTtcblxuICAgICAgICAgIC8vIERpc3BsYXkgdGhlIHNoaXAgb24gdGhlIGdhbWUgYm9hcmQgYW5kIHNoaXAgc3RhdHVzIGRpc3BsYXlcbiAgICAgICAgICB1aU1hbmFnZXIucmVuZGVyU2hpcEJvYXJkKGh1bWFuUGxheWVyLCBzaGlwVHlwZSk7XG4gICAgICAgICAgdWlNYW5hZ2VyLnJlbmRlclNoaXBEaXNwKGh1bWFuUGxheWVyLCBzaGlwVHlwZSk7XG5cbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlLWJlZm9yZS1kZWZpbmVcbiAgICAgICAgICByZXNvbHZlU2hpcFBsYWNlbWVudCgpOyAvLyBTaGlwIHBsYWNlZCBzdWNjZXNzZnVsbHksIHJlc29sdmUgdGhlIHByb21pc2VcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlTG9nRXJyb3IoZXJyb3IsIHNoaXBUeXBlKTtcbiAgICAgICAgICAvLyBEbyBub3QgcmVqZWN0IHRvIGFsbG93IGZvciByZXRyeSwganVzdCBsb2cgdGhlIGVycm9yXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIFNldHVwIGV2ZW50IGxpc3RlbmVycyBhbmQgZW5zdXJlIHdlIGNhbiBjbGVhbiB0aGVtIHVwIGFmdGVyIHBsYWNlbWVudFxuICAgICAgY29uc3QgY2xlYW51cCA9IHNldHVwRXZlbnRMaXN0ZW5lcnMoaGFuZGxlVmFsaWRJbnB1dCwgXCJodW1hblwiKTtcblxuICAgICAgLy8gQXR0YWNoIGNsZWFudXAgdG8gcmVzb2x2ZSB0byBlbnN1cmUgaXQncyBjYWxsZWQgd2hlbiB0aGUgcHJvbWlzZSByZXNvbHZlc1xuICAgICAgY29uc3QgcmVzb2x2ZVNoaXBQbGFjZW1lbnQgPSAoKSA9PiB7XG4gICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFNlcXVlbnRpYWxseSBwcm9tcHQgZm9yIGFuZCBwbGFjZSBlYWNoIHNoaXBcbiAgYXN5bmMgZnVuY3Rpb24gc2V0dXBTaGlwc1NlcXVlbnRpYWxseSgpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoaXBzVG9QbGFjZS5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWF3YWl0LWluLWxvb3BcbiAgICAgIGF3YWl0IHByb21wdEFuZFBsYWNlU2hpcChzaGlwc1RvUGxhY2VbaV0uc2hpcFR5cGUpOyAvLyBXYWl0IGZvciBlYWNoIHNoaXAgdG8gYmUgcGxhY2VkIGJlZm9yZSBjb250aW51aW5nXG4gICAgfVxuICB9XG5cbiAgLy8gRnVuY3Rpb24gZm9yIGhhbmRsaW5nIHRoZSBnYW1lIHNldHVwIGFuZCBzaGlwIHBsYWNlbWVudFxuICBjb25zdCBoYW5kbGVTZXR1cCA9IGFzeW5jICgpID0+IHtcbiAgICAvLyBJbml0IHRoZSBVSVxuICAgIGluaXRVaU1hbmFnZXIodWlNYW5hZ2VyKTtcbiAgICBzZXR1cEdhbWVib2FyZEZvclBsYWNlbWVudCgpO1xuICAgIGF3YWl0IHNldHVwU2hpcHNTZXF1ZW50aWFsbHkoKTtcbiAgICAvLyBQcm9jZWVkIHdpdGggdGhlIHJlc3Qgb2YgdGhlIGdhbWUgc2V0dXAgYWZ0ZXIgYWxsIHNoaXBzIGFyZSBwbGFjZWRcbiAgICBjbGVhbnVwQWZ0ZXJQbGFjZW1lbnQoKTtcbiAgICBjb25zdCBvdXRwdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtb3V0cHV0XCIpO1xuICAgIHVwZGF0ZU91dHB1dChcIj4gQWxsIHNoaXBzIHBsYWNlZCwgZ2FtZSBzZXR1cCBjb21wbGV0ZSFcIik7XG4gICAgY29uc29sZS5sb2coXCJBbGwgc2hpcHMgcGxhY2VkLCBnYW1lIHNldHVwIGNvbXBsZXRlIVwiKTtcbiAgICBzd2l0Y2hHYW1lYm9hcmRIb3ZlclN0YXRlcygpO1xuICAgIC8vIFN0YXJ0IHRoZSBnYW1lXG4gICAgc3RhcnRHYW1lKHVpTWFuYWdlciwgZ2FtZSk7XG4gIH07XG5cbiAgYXN5bmMgZnVuY3Rpb24gcHJvbXB0UGxheWVyTW92ZShjb21wTW92ZVJlc3VsdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgaHVtYW5Nb3ZlUmVzdWx0O1xuICAgICAgLy8gVXBkYXRlIHRoZSBwbGF5ZXIgd2l0aCB0aGUgcmVzdWx0IG9mIHRoZSBjb21wdXRlcidzIGxhc3QgbW9yZVxuICAgICAgLy8gKGlmIHRoZXJlIGlzIG9uZSlcbiAgICAgIGlmIChjb21wTW92ZVJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIExvZyB0aGUgcmVzdWx0IG9mIHRoZSBjb21wdXRlcidzIG1vdmUgdG8gdGhlIGNvbnNvbGVcbiAgICAgICAgY29uc29sZUxvZ01vdmVDb21tYW5kKGNvbXBNb3ZlUmVzdWx0KTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coYE1ha2UgYSBtb3ZlIWApO1xuXG4gICAgICBjb25zdCBoYW5kbGVWYWxpZE1vdmUgPSBhc3luYyAobW92ZSkgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhgaGFuZGxlVmFsaWRJbnB1dDogbW92ZSA9ICR7bW92ZX1gKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB7IGdyaWRQb3NpdGlvbiB9ID0gcHJvY2Vzc0NvbW1hbmQobW92ZSwgdHJ1ZSk7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coYGhhbmRsZVZhbGlkSW5wdXQ6IGdyaWRQb3NpdGlvbiA9ICR7Z3JpZFBvc2l0aW9ufWApO1xuICAgICAgICAgIGh1bWFuTW92ZVJlc3VsdCA9IGF3YWl0IGh1bWFuUGxheWVyLm1ha2VNb3ZlKFxuICAgICAgICAgICAgY29tcFBsYXllckdhbWVib2FyZCxcbiAgICAgICAgICAgIGdyaWRQb3NpdGlvbixcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgLy8gQ29tbXVuaWNhdGUgdGhlIHJlc3VsdCBvZiB0aGUgbW92ZSB0byB0aGUgdXNlclxuICAgICAgICAgIGNvbnNvbGVMb2dNb3ZlQ29tbWFuZChodW1hbk1vdmVSZXN1bHQpO1xuXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZS1iZWZvcmUtZGVmaW5lXG4gICAgICAgICAgcmVzb2x2ZU1vdmUoKTsgLy8gTW92ZSBleGVjdXRlZCBzdWNjZXNzZnVsbHksIHJlc29sdmUgdGhlIHByb21pc2VcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlTG9nRXJyb3IoZXJyb3IpO1xuICAgICAgICAgIC8vIERvIG5vdCByZWplY3QgdG8gYWxsb3cgZm9yIHJldHJ5LCBqdXN0IGxvZyB0aGUgZXJyb3JcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gU2V0dXAgZXZlbnQgbGlzdGVuZXJzIGFuZCBlbnN1cmUgd2UgY2FuIGNsZWFuIHRoZW0gdXAgYWZ0ZXIgcGxhY2VtZW50XG4gICAgICBjb25zdCBjbGVhbnVwID0gc2V0dXBFdmVudExpc3RlbmVycyhoYW5kbGVWYWxpZE1vdmUsIFwiY29tcHV0ZXJcIik7XG5cbiAgICAgIC8vIEF0dGFjaCBjbGVhbnVwIHRvIHJlc29sdmUgdG8gZW5zdXJlIGl0J3MgY2FsbGVkIHdoZW4gdGhlIHByb21pc2UgcmVzb2x2ZXNcbiAgICAgIGNvbnN0IHJlc29sdmVNb3ZlID0gKCkgPT4ge1xuICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgIHJlc29sdmUoaHVtYW5Nb3ZlUmVzdWx0KTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvLyBGdW5jdGlvbiBmb3IgaGFuZGxpbmcgdGhlIHBsYXlpbmcgb2YgdGhlIGdhbWVcbiAgY29uc3QgcGxheUdhbWUgPSBhc3luYyAoKSA9PiB7XG4gICAgbGV0IGdhbWVPdmVyID0gZmFsc2U7XG4gICAgbGV0IGxhc3RDb21wTW92ZVJlc3VsdDtcbiAgICBsZXQgbGFzdEh1bWFuTW92ZVJlc3VsdDtcblxuICAgIHdoaWxlICghZ2FtZU92ZXIpIHtcbiAgICAgIGNvbnNvbGUuZGlyKGdhbWUuY3VycmVudFBsYXllcik7XG4gICAgICAvLyBQbGF5ZXIgbWFrZXMgYSBtb3ZlXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgbGFzdEh1bWFuTW92ZVJlc3VsdCA9IGF3YWl0IHByb21wdFBsYXllck1vdmUobGFzdENvbXBNb3ZlUmVzdWx0KTtcbiAgICAgIGNvbnNvbGUubG9nKFwicHJvbXB0UGxheWVyTW92ZS50aGVuKCkgLT5cIik7XG4gICAgICBjb25zb2xlLmRpcihsYXN0SHVtYW5Nb3ZlUmVzdWx0KTtcbiAgICAgIC8vIENoZWNrIGZvciB3aW4gY29uZGl0aW9uXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgZ2FtZU92ZXIgPSBhd2FpdCBjaGVja1dpbkNvbmRpdGlvbigpO1xuICAgICAgaWYgKGdhbWVPdmVyKSBicmVhaztcblxuICAgICAgLy8gQ29tcHV0ZXIgbWFrZXMgYSBtb3ZlXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgbGFzdENvbXBNb3ZlUmVzdWx0ID0gYXdhaXQgY29tcHV0ZXJNb3ZlKGh1bWFuUGxheWVyR2FtZWJvYXJkLCBjb21wUGxheWVyKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiQ29tcHV0ZXIncyBtb3ZlIC0+XCIpO1xuICAgICAgY29uc29sZS5kaXIobGFzdENvbXBNb3ZlUmVzdWx0KTtcbiAgICAgIC8vIENoZWNrIGZvciB3aW4gY29uZGl0aW9uXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgZ2FtZU92ZXIgPSBhd2FpdCBjaGVja1dpbkNvbmRpdGlvbigpO1xuICAgIH1cblxuICAgIC8vIEdhbWUgb3ZlciBsb2dpY1xuICAgIGNvbmNsdWRlR2FtZSgpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgaGFuZGxlU2V0dXAsXG4gICAgcGxheUdhbWUsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBBY3Rpb25Db250cm9sbGVyO1xuIiwiLyogZXNsaW50LWRpc2FibGUgbWF4LWNsYXNzZXMtcGVyLWZpbGUgKi9cblxuY2xhc3MgT3ZlcmxhcHBpbmdTaGlwc0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJTaGlwcyBhcmUgb3ZlcmxhcHBpbmcuXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIk92ZXJsYXBwaW5nU2hpcHNFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIFNoaXBBbGxvY2F0aW9uUmVhY2hlZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihzaGlwVHlwZSkge1xuICAgIHN1cGVyKGBTaGlwIGFsbG9jYXRpb24gbGltaXQgcmVhY2hlZC4gU2hpcCB0eXBlID0gJHtzaGlwVHlwZX0uYCk7XG4gICAgdGhpcy5uYW1lID0gXCJTaGlwQWxsb2NhdGlvblJlYWNoZWRFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIFNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiU2hpcCB0eXBlIGFsbG9jYXRpb24gbGltaXQgcmVhY2hlZC5cIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiU2hpcFR5cGVBbGxvY2F0aW9uUmVhY2hlZEVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgSW52YWxpZFNoaXBMZW5ndGhFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBzaGlwIGxlbmd0aC5cIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiSW52YWxpZFNoaXBMZW5ndGhFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRTaGlwVHlwZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJJbnZhbGlkIHNoaXAgdHlwZS5cIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiSW52YWxpZFNoaXBUeXBlRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBJbnZhbGlkUGxheWVyVHlwZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlID0gXCJJbnZhbGlkIHBsYXllciB0eXBlLiBWYWxpZCBwbGF5ZXIgdHlwZXM6ICdodW1hbicgJiAnY29tcHV0ZXInXCIsXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiSW52YWxpZFNoaXBUeXBlRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBzaGlwIHBsYWNlbWVudC4gQm91bmRhcnkgZXJyb3IhXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIlNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgUmVwZWF0QXR0YWNrZWRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBhdHRhY2sgZW50cnkuIFBvc2l0aW9uIGFscmVhZHkgYXR0YWNrZWQhXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIlJlcGVhdEF0dGFja0Vycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgSW52YWxpZE1vdmVFbnRyeUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJJbnZhbGlkIG1vdmUgZW50cnkhXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRNb3ZlRW50cnlFcnJvclwiO1xuICB9XG59XG5cbmV4cG9ydCB7XG4gIE92ZXJsYXBwaW5nU2hpcHNFcnJvcixcbiAgU2hpcEFsbG9jYXRpb25SZWFjaGVkRXJyb3IsXG4gIFNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvcixcbiAgSW52YWxpZFNoaXBMZW5ndGhFcnJvcixcbiAgSW52YWxpZFNoaXBUeXBlRXJyb3IsXG4gIEludmFsaWRQbGF5ZXJUeXBlRXJyb3IsXG4gIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yLFxuICBSZXBlYXRBdHRhY2tlZEVycm9yLFxuICBJbnZhbGlkTW92ZUVudHJ5RXJyb3IsXG59O1xuIiwiaW1wb3J0IFBsYXllciBmcm9tIFwiLi9wbGF5ZXJcIjtcbmltcG9ydCBHYW1lYm9hcmQgZnJvbSBcIi4vZ2FtZWJvYXJkXCI7XG5pbXBvcnQgU2hpcCBmcm9tIFwiLi9zaGlwXCI7XG5pbXBvcnQgeyBJbnZhbGlkUGxheWVyVHlwZUVycm9yIH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5cbmNvbnN0IEdhbWUgPSAoKSA9PiB7XG4gIC8vIEluaXRpYWxpc2UsIGNyZWF0ZSBnYW1lYm9hcmRzIGZvciBib3RoIHBsYXllcnMgYW5kIGNyZWF0ZSBwbGF5ZXJzIG9mIHR5cGVzIGh1bWFuIGFuZCBjb21wdXRlclxuICBjb25zdCBodW1hbkdhbWVib2FyZCA9IEdhbWVib2FyZChTaGlwKTtcbiAgY29uc3QgY29tcHV0ZXJHYW1lYm9hcmQgPSBHYW1lYm9hcmQoU2hpcCk7XG4gIGNvbnN0IGh1bWFuUGxheWVyID0gUGxheWVyKGh1bWFuR2FtZWJvYXJkLCBcImh1bWFuXCIpO1xuICBjb25zdCBjb21wdXRlclBsYXllciA9IFBsYXllcihjb21wdXRlckdhbWVib2FyZCwgXCJjb21wdXRlclwiKTtcbiAgbGV0IGN1cnJlbnRQbGF5ZXI7XG4gIGxldCBnYW1lT3ZlclN0YXRlID0gZmFsc2U7XG5cbiAgLy8gU3RvcmUgcGxheWVycyBpbiBhIHBsYXllciBvYmplY3RcbiAgY29uc3QgcGxheWVycyA9IHsgaHVtYW46IGh1bWFuUGxheWVyLCBjb21wdXRlcjogY29tcHV0ZXJQbGF5ZXIgfTtcblxuICAvLyBTZXQgdXAgcGhhc2VcbiAgY29uc3Qgc2V0VXAgPSAoKSA9PiB7XG4gICAgLy8gQXV0b21hdGljIHBsYWNlbWVudCBmb3IgY29tcHV0ZXJcbiAgICBjb21wdXRlclBsYXllci5wbGFjZVNoaXBzKCk7XG5cbiAgICAvLyBTZXQgdGhlIGN1cnJlbnQgcGxheWVyIHRvIGh1bWFuIHBsYXllclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBodW1hblBsYXllcjtcbiAgfTtcblxuICAvLyBHYW1lIGVuZGluZyBmdW5jdGlvblxuICBjb25zdCBlbmRHYW1lID0gKCkgPT4ge1xuICAgIGdhbWVPdmVyU3RhdGUgPSB0cnVlO1xuICB9O1xuXG4gIC8vIFRha2UgdHVybiBtZXRob2RcbiAgY29uc3QgdGFrZVR1cm4gPSAobW92ZSkgPT4ge1xuICAgIGxldCBmZWVkYmFjaztcblxuICAgIC8vIERldGVybWluZSB0aGUgb3Bwb25lbnQgYmFzZWQgb24gdGhlIGN1cnJlbnQgcGxheWVyXG4gICAgY29uc3Qgb3Bwb25lbnQgPVxuICAgICAgY3VycmVudFBsYXllciA9PT0gaHVtYW5QbGF5ZXIgPyBjb21wdXRlclBsYXllciA6IGh1bWFuUGxheWVyO1xuXG4gICAgLy8gQ2FsbCB0aGUgbWFrZU1vdmUgbWV0aG9kIG9uIHRoZSBjdXJyZW50IHBsYXllciB3aXRoIHRoZSBvcHBvbmVudCdzIGdhbWVib2FyZCBhbmQgc3RvcmUgYXMgbW92ZSBmZWVkYmFja1xuICAgIGNvbnN0IHJlc3VsdCA9IGN1cnJlbnRQbGF5ZXIubWFrZU1vdmUob3Bwb25lbnQuZ2FtZWJvYXJkLCBtb3ZlKTtcblxuICAgIC8vIElmIHJlc3VsdCBpcyBhIGhpdCwgY2hlY2sgd2hldGhlciB0aGUgc2hpcCBpcyBzdW5rXG4gICAgaWYgKHJlc3VsdC5oaXQpIHtcbiAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIHNoaXAgaXMgc3VuayBhbmQgYWRkIHJlc3VsdCBhcyB2YWx1ZSB0byBmZWVkYmFjayBvYmplY3Qgd2l0aCBrZXkgXCJpc1NoaXBTdW5rXCJcbiAgICAgIGlmIChvcHBvbmVudC5nYW1lYm9hcmQuaXNTaGlwU3VuayhyZXN1bHQuc2hpcFR5cGUpKSB7XG4gICAgICAgIGZlZWRiYWNrID0ge1xuICAgICAgICAgIC4uLnJlc3VsdCxcbiAgICAgICAgICBpc1NoaXBTdW5rOiB0cnVlLFxuICAgICAgICAgIGdhbWVXb246IG9wcG9uZW50LmdhbWVib2FyZC5jaGVja0FsbFNoaXBzU3VuaygpLFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmVlZGJhY2sgPSB7IC4uLnJlc3VsdCwgaXNTaGlwU3VuazogZmFsc2UgfTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFyZXN1bHQuaGl0KSB7XG4gICAgICAvLyBTZXQgZmVlZGJhY2sgdG8ganVzdCB0aGUgcmVzdWx0XG4gICAgICBmZWVkYmFjayA9IHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBJZiBnYW1lIGlzIHdvbiwgZW5kIGdhbWVcbiAgICBpZiAoZmVlZGJhY2suZ2FtZVdvbikge1xuICAgICAgZW5kR2FtZSgpO1xuICAgIH1cblxuICAgIC8vIFN3aXRjaCB0aGUgY3VycmVudCBwbGF5ZXJcbiAgICBjdXJyZW50UGxheWVyID0gb3Bwb25lbnQ7XG5cbiAgICAvLyBSZXR1cm4gdGhlIGZlZWRiYWNrIGZvciB0aGUgbW92ZVxuICAgIHJldHVybiBmZWVkYmFjaztcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldCBjdXJyZW50UGxheWVyKCkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRQbGF5ZXI7XG4gICAgfSxcbiAgICBnZXQgZ2FtZU92ZXJTdGF0ZSgpIHtcbiAgICAgIHJldHVybiBnYW1lT3ZlclN0YXRlO1xuICAgIH0sXG4gICAgcGxheWVycyxcbiAgICBzZXRVcCxcbiAgICB0YWtlVHVybixcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWU7XG4iLCJpbXBvcnQge1xuICBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IsXG4gIE92ZXJsYXBwaW5nU2hpcHNFcnJvcixcbiAgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IsXG4gIFJlcGVhdEF0dGFja2VkRXJyb3IsXG59IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBncmlkID0gW1xuICBbXCJBMVwiLCBcIkEyXCIsIFwiQTNcIiwgXCJBNFwiLCBcIkE1XCIsIFwiQTZcIiwgXCJBN1wiLCBcIkE4XCIsIFwiQTlcIiwgXCJBMTBcIl0sXG4gIFtcIkIxXCIsIFwiQjJcIiwgXCJCM1wiLCBcIkI0XCIsIFwiQjVcIiwgXCJCNlwiLCBcIkI3XCIsIFwiQjhcIiwgXCJCOVwiLCBcIkIxMFwiXSxcbiAgW1wiQzFcIiwgXCJDMlwiLCBcIkMzXCIsIFwiQzRcIiwgXCJDNVwiLCBcIkM2XCIsIFwiQzdcIiwgXCJDOFwiLCBcIkM5XCIsIFwiQzEwXCJdLFxuICBbXCJEMVwiLCBcIkQyXCIsIFwiRDNcIiwgXCJENFwiLCBcIkQ1XCIsIFwiRDZcIiwgXCJEN1wiLCBcIkQ4XCIsIFwiRDlcIiwgXCJEMTBcIl0sXG4gIFtcIkUxXCIsIFwiRTJcIiwgXCJFM1wiLCBcIkU0XCIsIFwiRTVcIiwgXCJFNlwiLCBcIkU3XCIsIFwiRThcIiwgXCJFOVwiLCBcIkUxMFwiXSxcbiAgW1wiRjFcIiwgXCJGMlwiLCBcIkYzXCIsIFwiRjRcIiwgXCJGNVwiLCBcIkY2XCIsIFwiRjdcIiwgXCJGOFwiLCBcIkY5XCIsIFwiRjEwXCJdLFxuICBbXCJHMVwiLCBcIkcyXCIsIFwiRzNcIiwgXCJHNFwiLCBcIkc1XCIsIFwiRzZcIiwgXCJHN1wiLCBcIkc4XCIsIFwiRzlcIiwgXCJHMTBcIl0sXG4gIFtcIkgxXCIsIFwiSDJcIiwgXCJIM1wiLCBcIkg0XCIsIFwiSDVcIiwgXCJINlwiLCBcIkg3XCIsIFwiSDhcIiwgXCJIOVwiLCBcIkgxMFwiXSxcbiAgW1wiSTFcIiwgXCJJMlwiLCBcIkkzXCIsIFwiSTRcIiwgXCJJNVwiLCBcIkk2XCIsIFwiSTdcIiwgXCJJOFwiLCBcIkk5XCIsIFwiSTEwXCJdLFxuICBbXCJKMVwiLCBcIkoyXCIsIFwiSjNcIiwgXCJKNFwiLCBcIko1XCIsIFwiSjZcIiwgXCJKN1wiLCBcIko4XCIsIFwiSjlcIiwgXCJKMTBcIl0sXG5dO1xuXG5jb25zdCBpbmRleENhbGNzID0gKHN0YXJ0KSA9PiB7XG4gIGNvbnN0IGNvbExldHRlciA9IHN0YXJ0WzBdLnRvVXBwZXJDYXNlKCk7IC8vIFRoaXMgaXMgdGhlIGNvbHVtblxuICBjb25zdCByb3dOdW1iZXIgPSBwYXJzZUludChzdGFydC5zbGljZSgxKSwgMTApOyAvLyBUaGlzIGlzIHRoZSByb3dcblxuICBjb25zdCBjb2xJbmRleCA9IGNvbExldHRlci5jaGFyQ29kZUF0KDApIC0gXCJBXCIuY2hhckNvZGVBdCgwKTsgLy8gQ29sdW1uIGluZGV4IGJhc2VkIG9uIGxldHRlclxuICBjb25zdCByb3dJbmRleCA9IHJvd051bWJlciAtIDE7IC8vIFJvdyBpbmRleCBiYXNlZCBvbiBudW1iZXJcblxuICByZXR1cm4gW2NvbEluZGV4LCByb3dJbmRleF07IC8vIFJldHVybiBbcm93LCBjb2x1bW5dXG59O1xuXG5jb25zdCBjaGVja1R5cGUgPSAoc2hpcCwgc2hpcFBvc2l0aW9ucykgPT4ge1xuICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIHNoaXBQb3NpdGlvbnMgb2JqZWN0XG4gIE9iamVjdC5rZXlzKHNoaXBQb3NpdGlvbnMpLmZvckVhY2goKGV4aXN0aW5nU2hpcFR5cGUpID0+IHtcbiAgICBpZiAoZXhpc3RpbmdTaGlwVHlwZSA9PT0gc2hpcCkge1xuICAgICAgdGhyb3cgbmV3IFNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvcihzaGlwKTtcbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgY2hlY2tCb3VuZGFyaWVzID0gKHNoaXBMZW5ndGgsIGNvb3JkcywgZGlyZWN0aW9uKSA9PiB7XG4gIC8vIFNldCByb3cgYW5kIGNvbCBsaW1pdHNcbiAgY29uc3QgeExpbWl0ID0gZ3JpZC5sZW5ndGg7IC8vIFRoaXMgaXMgdGhlIHRvdGFsIG51bWJlciBvZiBjb2x1bW5zICh4KVxuICBjb25zdCB5TGltaXQgPSBncmlkWzBdLmxlbmd0aDsgLy8gVGhpcyBpcyB0aGUgdG90YWwgbnVtYmVyIG9mIHJvd3MgKHkpXG5cbiAgY29uc3QgeCA9IGNvb3Jkc1swXTtcbiAgY29uc3QgeSA9IGNvb3Jkc1sxXTtcblxuICAvLyBDaGVjayBmb3IgdmFsaWQgc3RhcnQgcG9zaXRpb24gb24gYm9hcmRcbiAgaWYgKHggPCAwIHx8IHggPj0geExpbWl0IHx8IHkgPCAwIHx8IHkgPj0geUxpbWl0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gQ2hlY2sgcmlnaHQgYm91bmRhcnkgZm9yIGhvcml6b250YWwgcGxhY2VtZW50XG4gIGlmIChkaXJlY3Rpb24gPT09IFwiaFwiICYmIHggKyBzaGlwTGVuZ3RoID4geExpbWl0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIENoZWNrIGJvdHRvbSBib3VuZGFyeSBmb3IgdmVydGljYWwgcGxhY2VtZW50XG4gIGlmIChkaXJlY3Rpb24gPT09IFwidlwiICYmIHkgKyBzaGlwTGVuZ3RoID4geUxpbWl0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gSWYgbm9uZSBvZiB0aGUgaW52YWxpZCBjb25kaXRpb25zIGFyZSBtZXQsIHJldHVybiB0cnVlXG4gIHJldHVybiB0cnVlO1xufTtcblxuY29uc3QgY2FsY3VsYXRlU2hpcFBvc2l0aW9ucyA9IChzaGlwTGVuZ3RoLCBjb29yZHMsIGRpcmVjdGlvbikgPT4ge1xuICBjb25zdCBjb2xJbmRleCA9IGNvb3Jkc1swXTsgLy8gVGhpcyBpcyB0aGUgY29sdW1uIGluZGV4XG4gIGNvbnN0IHJvd0luZGV4ID0gY29vcmRzWzFdOyAvLyBUaGlzIGlzIHRoZSByb3cgaW5kZXhcblxuICBjb25zdCBwb3NpdGlvbnMgPSBbXTtcblxuICBpZiAoZGlyZWN0aW9uLnRvTG93ZXJDYXNlKCkgPT09IFwiaFwiKSB7XG4gICAgLy8gSG9yaXpvbnRhbCBwbGFjZW1lbnQ6IGluY3JlbWVudCB0aGUgY29sdW1uIGluZGV4XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKGdyaWRbY29sSW5kZXggKyBpXVtyb3dJbmRleF0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBWZXJ0aWNhbCBwbGFjZW1lbnQ6IGluY3JlbWVudCB0aGUgcm93IGluZGV4XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKGdyaWRbY29sSW5kZXhdW3Jvd0luZGV4ICsgaV0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwb3NpdGlvbnM7XG59O1xuXG5jb25zdCBjaGVja0Zvck92ZXJsYXAgPSAocG9zaXRpb25zLCBzaGlwUG9zaXRpb25zKSA9PiB7XG4gIE9iamVjdC5lbnRyaWVzKHNoaXBQb3NpdGlvbnMpLmZvckVhY2goKFtzaGlwVHlwZSwgZXhpc3RpbmdTaGlwUG9zaXRpb25zXSkgPT4ge1xuICAgIGlmIChcbiAgICAgIHBvc2l0aW9ucy5zb21lKChwb3NpdGlvbikgPT4gZXhpc3RpbmdTaGlwUG9zaXRpb25zLmluY2x1ZGVzKHBvc2l0aW9uKSlcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBPdmVybGFwcGluZ1NoaXBzRXJyb3IoXG4gICAgICAgIGBPdmVybGFwIGRldGVjdGVkIHdpdGggc2hpcCB0eXBlICR7c2hpcFR5cGV9YCxcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IGNoZWNrRm9ySGl0ID0gKHBvc2l0aW9uLCBzaGlwUG9zaXRpb25zKSA9PiB7XG4gIGNvbnN0IGZvdW5kU2hpcCA9IE9iamVjdC5lbnRyaWVzKHNoaXBQb3NpdGlvbnMpLmZpbmQoXG4gICAgKFtfLCBleGlzdGluZ1NoaXBQb3NpdGlvbnNdKSA9PiBleGlzdGluZ1NoaXBQb3NpdGlvbnMuaW5jbHVkZXMocG9zaXRpb24pLFxuICApO1xuXG4gIHJldHVybiBmb3VuZFNoaXAgPyB7IGhpdDogdHJ1ZSwgc2hpcFR5cGU6IGZvdW5kU2hpcFswXSB9IDogeyBoaXQ6IGZhbHNlIH07XG59O1xuXG5jb25zdCBHYW1lYm9hcmQgPSAoc2hpcEZhY3RvcnkpID0+IHtcbiAgY29uc3Qgc2hpcHMgPSB7fTtcbiAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IHt9O1xuICBjb25zdCBoaXRQb3NpdGlvbnMgPSB7fTtcbiAgY29uc3QgYXR0YWNrTG9nID0gW1tdLCBbXV07XG5cbiAgY29uc3QgcGxhY2VTaGlwID0gKHR5cGUsIHN0YXJ0LCBkaXJlY3Rpb24pID0+IHtcbiAgICBjb25zdCBuZXdTaGlwID0gc2hpcEZhY3RvcnkodHlwZSk7XG5cbiAgICAvLyBDaGVjayB0aGUgc2hpcCB0eXBlIGFnYWluc3QgZXhpc3RpbmcgdHlwZXNcbiAgICBjaGVja1R5cGUodHlwZSwgc2hpcFBvc2l0aW9ucyk7XG5cbiAgICAvLyBDYWxjdWxhdGUgc3RhcnQgcG9pbnQgY29vcmRpbmF0ZXMgYmFzZWQgb24gc3RhcnQgcG9pbnQgZ3JpZCBrZXlcbiAgICBjb25zdCBjb29yZHMgPSBpbmRleENhbGNzKHN0YXJ0KTtcblxuICAgIC8vIENoZWNrIGJvdW5kYXJpZXMsIGlmIG9rIGNvbnRpbnVlIHRvIG5leHQgc3RlcFxuICAgIGlmIChjaGVja0JvdW5kYXJpZXMobmV3U2hpcC5zaGlwTGVuZ3RoLCBjb29yZHMsIGRpcmVjdGlvbikpIHtcbiAgICAgIC8vIENhbGN1bGF0ZSBhbmQgc3RvcmUgcG9zaXRpb25zIGZvciBhIG5ldyBzaGlwXG4gICAgICBjb25zdCBwb3NpdGlvbnMgPSBjYWxjdWxhdGVTaGlwUG9zaXRpb25zKFxuICAgICAgICBuZXdTaGlwLnNoaXBMZW5ndGgsXG4gICAgICAgIGNvb3JkcyxcbiAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgKTtcblxuICAgICAgLy8gQ2hlY2sgZm9yIG92ZXJsYXAgYmVmb3JlIHBsYWNpbmcgdGhlIHNoaXBcbiAgICAgIGNoZWNrRm9yT3ZlcmxhcChwb3NpdGlvbnMsIHNoaXBQb3NpdGlvbnMpO1xuXG4gICAgICAvLyBJZiBubyBvdmVybGFwLCBwcm9jZWVkIHRvIHBsYWNlIHNoaXBcbiAgICAgIHNoaXBQb3NpdGlvbnNbdHlwZV0gPSBwb3NpdGlvbnM7XG4gICAgICAvLyBBZGQgc2hpcCB0byBzaGlwcyBvYmplY3RcbiAgICAgIHNoaXBzW3R5cGVdID0gbmV3U2hpcDtcblxuICAgICAgLy8gSW5pdGlhbGlzZSBoaXRQb3NpdGlvbnMgZm9yIHRoaXMgc2hpcCB0eXBlIGFzIGFuIGVtcHR5IGFycmF5XG4gICAgICBoaXRQb3NpdGlvbnNbdHlwZV0gPSBbXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yKFxuICAgICAgICBgSW52YWxpZCBzaGlwIHBsYWNlbWVudC4gQm91bmRhcnkgZXJyb3IhIFNoaXAgdHlwZTogJHt0eXBlfWAsXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZWdpc3RlciBhbiBhdHRhY2sgYW5kIHRlc3QgZm9yIHZhbGlkIGhpdFxuICBjb25zdCBhdHRhY2sgPSAocG9zaXRpb24pID0+IHtcbiAgICBsZXQgcmVzcG9uc2U7XG5cbiAgICAvLyBDaGVjayBmb3IgdmFsaWQgYXR0YWNrXG4gICAgaWYgKGF0dGFja0xvZ1swXS5pbmNsdWRlcyhwb3NpdGlvbikgfHwgYXR0YWNrTG9nWzFdLmluY2x1ZGVzKHBvc2l0aW9uKSkge1xuICAgICAgLy8gY29uc29sZS5sb2coYFJlcGVhdCBhdHRhY2s6ICR7cG9zaXRpb259YCk7XG4gICAgICB0aHJvdyBuZXcgUmVwZWF0QXR0YWNrZWRFcnJvcigpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciB2YWxpZCBoaXRcbiAgICBjb25zdCBjaGVja1Jlc3VsdHMgPSBjaGVja0ZvckhpdChwb3NpdGlvbiwgc2hpcFBvc2l0aW9ucyk7XG4gICAgaWYgKGNoZWNrUmVzdWx0cy5oaXQpIHtcbiAgICAgIC8vIFJlZ2lzdGVyIHZhbGlkIGhpdFxuICAgICAgaGl0UG9zaXRpb25zW2NoZWNrUmVzdWx0cy5zaGlwVHlwZV0ucHVzaChwb3NpdGlvbik7XG4gICAgICBzaGlwc1tjaGVja1Jlc3VsdHMuc2hpcFR5cGVdLmhpdCgpO1xuXG4gICAgICAvLyBMb2cgdGhlIGF0dGFjayBhcyBhIHZhbGlkIGhpdFxuICAgICAgYXR0YWNrTG9nWzBdLnB1c2gocG9zaXRpb24pO1xuICAgICAgcmVzcG9uc2UgPSB7IC4uLmNoZWNrUmVzdWx0cyB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhgTUlTUyE6ICR7cG9zaXRpb259YCk7XG4gICAgICAvLyBMb2cgdGhlIGF0dGFjayBhcyBhIG1pc3NcbiAgICAgIGF0dGFja0xvZ1sxXS5wdXNoKHBvc2l0aW9uKTtcbiAgICAgIHJlc3BvbnNlID0geyAuLi5jaGVja1Jlc3VsdHMgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH07XG5cbiAgY29uc3QgaXNTaGlwU3VuayA9ICh0eXBlKSA9PiBzaGlwc1t0eXBlXS5pc1N1bms7XG5cbiAgY29uc3QgY2hlY2tBbGxTaGlwc1N1bmsgPSAoKSA9PlxuICAgIE9iamVjdC5lbnRyaWVzKHNoaXBzKS5ldmVyeSgoW3NoaXBUeXBlLCBzaGlwXSkgPT4gc2hpcC5pc1N1bmspO1xuXG4gIC8vIEZ1bmN0aW9uIGZvciByZXBvcnRpbmcgdGhlIG51bWJlciBvZiBzaGlwcyBsZWZ0IGFmbG9hdFxuICBjb25zdCBzaGlwUmVwb3J0ID0gKCkgPT4ge1xuICAgIGNvbnN0IGZsb2F0aW5nU2hpcHMgPSBPYmplY3QuZW50cmllcyhzaGlwcylcbiAgICAgIC5maWx0ZXIoKFtzaGlwVHlwZSwgc2hpcF0pID0+ICFzaGlwLmlzU3VuaylcbiAgICAgIC5tYXAoKFtzaGlwVHlwZSwgX10pID0+IHNoaXBUeXBlKTtcblxuICAgIHJldHVybiBbZmxvYXRpbmdTaGlwcy5sZW5ndGgsIGZsb2F0aW5nU2hpcHNdO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgZ2V0IGdyaWQoKSB7XG4gICAgICByZXR1cm4gZ3JpZDtcbiAgICB9LFxuICAgIGdldCBzaGlwcygpIHtcbiAgICAgIHJldHVybiBzaGlwcztcbiAgICB9LFxuICAgIGdldCBhdHRhY2tMb2coKSB7XG4gICAgICByZXR1cm4gYXR0YWNrTG9nO1xuICAgIH0sXG4gICAgZ2V0U2hpcDogKHNoaXBUeXBlKSA9PiBzaGlwc1tzaGlwVHlwZV0sXG4gICAgZ2V0U2hpcFBvc2l0aW9uczogKHNoaXBUeXBlKSA9PiBzaGlwUG9zaXRpb25zW3NoaXBUeXBlXSxcbiAgICBnZXRIaXRQb3NpdGlvbnM6IChzaGlwVHlwZSkgPT4gaGl0UG9zaXRpb25zW3NoaXBUeXBlXSxcbiAgICBwbGFjZVNoaXAsXG4gICAgYXR0YWNrLFxuICAgIGlzU2hpcFN1bmssXG4gICAgY2hlY2tBbGxTaGlwc1N1bmssXG4gICAgc2hpcFJlcG9ydCxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVib2FyZDtcbiIsImltcG9ydCBcIi4vc3R5bGVzLmNzc1wiO1xuaW1wb3J0IEdhbWUgZnJvbSBcIi4vZ2FtZVwiO1xuaW1wb3J0IFVpTWFuYWdlciBmcm9tIFwiLi91aU1hbmFnZXJcIjtcbmltcG9ydCBBY3Rpb25Db250cm9sbGVyIGZyb20gXCIuL2FjdGlvbkNvbnRyb2xsZXJcIjtcblxuLy8gQ3JlYXRlIGEgbmV3IFVJIG1hbmFnZXJcbmNvbnN0IG5ld1VpTWFuYWdlciA9IFVpTWFuYWdlcigpO1xuXG4vLyBJbnN0YW50aWF0ZSBhIG5ldyBnYW1lXG5jb25zdCBuZXdHYW1lID0gR2FtZSgpO1xuXG4vLyBDcmVhdGUgYSBuZXcgYWN0aW9uIGNvbnRyb2xsZXJcbmNvbnN0IGFjdENvbnRyb2xsZXIgPSBBY3Rpb25Db250cm9sbGVyKG5ld1VpTWFuYWdlciwgbmV3R2FtZSk7XG5cbi8vIFdhaXQgZm9yIHRoZSBnYW1lIHRvIGJlIHNldHVwIHdpdGggc2hpcCBwbGFjZW1lbnRzIGV0Yy5cbmF3YWl0IGFjdENvbnRyb2xsZXIuaGFuZGxlU2V0dXAoKTtcblxuLy8gT25jZSByZWFkeSwgY2FsbCB0aGUgcGxheUdhbWUgbWV0aG9kXG5hd2FpdCBhY3RDb250cm9sbGVyLnBsYXlHYW1lKCk7XG5cbi8vIENvbnNvbGUgbG9nIHRoZSBwbGF5ZXJzXG5jb25zb2xlLmxvZyhcbiAgYFBsYXllcnM6IEZpcnN0IHBsYXllciBvZiB0eXBlICR7bmV3R2FtZS5wbGF5ZXJzLmh1bWFuLnR5cGV9LCBzZWNvbmQgcGxheWVyIG9mIHR5cGUgJHtuZXdHYW1lLnBsYXllcnMuY29tcHV0ZXIudHlwZX0hYCxcbik7XG4iLCJpbXBvcnQge1xuICBJbnZhbGlkUGxheWVyVHlwZUVycm9yLFxuICBJbnZhbGlkTW92ZUVudHJ5RXJyb3IsXG4gIFJlcGVhdEF0dGFja2VkRXJyb3IsXG4gIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yLFxuICBPdmVybGFwcGluZ1NoaXBzRXJyb3IsXG59IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBjaGVja01vdmUgPSAobW92ZSwgZ2JHcmlkKSA9PiB7XG4gIGxldCB2YWxpZCA9IGZhbHNlO1xuXG4gIGdiR3JpZC5mb3JFYWNoKChlbCkgPT4ge1xuICAgIGlmIChlbC5maW5kKChwKSA9PiBwID09PSBtb3ZlKSkge1xuICAgICAgdmFsaWQgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHZhbGlkO1xufTtcblxuY29uc3QgcmFuZE1vdmUgPSAoZ3JpZCwgbW92ZUxvZykgPT4ge1xuICAvLyBGbGF0dGVuIHRoZSBncmlkIGludG8gYSBzaW5nbGUgYXJyYXkgb2YgbW92ZXNcbiAgY29uc3QgYWxsTW92ZXMgPSBncmlkLmZsYXRNYXAoKHJvdykgPT4gcm93KTtcblxuICAvLyBGaWx0ZXIgb3V0IHRoZSBtb3ZlcyB0aGF0IGFyZSBhbHJlYWR5IGluIHRoZSBtb3ZlTG9nXG4gIGNvbnN0IHBvc3NpYmxlTW92ZXMgPSBhbGxNb3Zlcy5maWx0ZXIoKG1vdmUpID0+ICFtb3ZlTG9nLmluY2x1ZGVzKG1vdmUpKTtcblxuICAvLyBTZWxlY3QgYSByYW5kb20gbW92ZSBmcm9tIHRoZSBwb3NzaWJsZSBtb3Zlc1xuICBjb25zdCByYW5kb21Nb3ZlID1cbiAgICBwb3NzaWJsZU1vdmVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlTW92ZXMubGVuZ3RoKV07XG5cbiAgcmV0dXJuIHJhbmRvbU1vdmU7XG59O1xuXG5jb25zdCBnZW5lcmF0ZVJhbmRvbVN0YXJ0ID0gKHNpemUsIGRpcmVjdGlvbiwgZ3JpZCkgPT4ge1xuICBjb25zdCB2YWxpZFN0YXJ0cyA9IFtdO1xuXG4gIGlmIChkaXJlY3Rpb24gPT09IFwiaFwiKSB7XG4gICAgLy8gRm9yIGhvcml6b250YWwgb3JpZW50YXRpb24sIGxpbWl0IHRoZSBjb2x1bW5zXG4gICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgZ3JpZC5sZW5ndGggLSBzaXplICsgMTsgY29sKyspIHtcbiAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IGdyaWRbY29sXS5sZW5ndGg7IHJvdysrKSB7XG4gICAgICAgIHZhbGlkU3RhcnRzLnB1c2goZ3JpZFtjb2xdW3Jvd10pO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBGb3IgdmVydGljYWwgb3JpZW50YXRpb24sIGxpbWl0IHRoZSByb3dzXG4gICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgZ3JpZFswXS5sZW5ndGggLSBzaXplICsgMTsgcm93KyspIHtcbiAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IGdyaWQubGVuZ3RoOyBjb2wrKykge1xuICAgICAgICB2YWxpZFN0YXJ0cy5wdXNoKGdyaWRbY29sXVtyb3ddKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBSYW5kb21seSBzZWxlY3QgYSBzdGFydGluZyBwb3NpdGlvblxuICBjb25zdCByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHZhbGlkU3RhcnRzLmxlbmd0aCk7XG4gIHJldHVybiB2YWxpZFN0YXJ0c1tyYW5kb21JbmRleF07XG59O1xuXG5jb25zdCBhdXRvUGxhY2VtZW50ID0gKGdhbWVib2FyZCkgPT4ge1xuICBjb25zdCBzaGlwVHlwZXMgPSBbXG4gICAgeyB0eXBlOiBcImNhcnJpZXJcIiwgc2l6ZTogNSB9LFxuICAgIHsgdHlwZTogXCJiYXR0bGVzaGlwXCIsIHNpemU6IDQgfSxcbiAgICB7IHR5cGU6IFwiY3J1aXNlclwiLCBzaXplOiAzIH0sXG4gICAgeyB0eXBlOiBcInN1Ym1hcmluZVwiLCBzaXplOiAzIH0sXG4gICAgeyB0eXBlOiBcImRlc3Ryb3llclwiLCBzaXplOiAyIH0sXG4gIF07XG5cbiAgc2hpcFR5cGVzLmZvckVhY2goKHNoaXApID0+IHtcbiAgICBsZXQgcGxhY2VkID0gZmFsc2U7XG4gICAgd2hpbGUgKCFwbGFjZWQpIHtcbiAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IE1hdGgucmFuZG9tKCkgPCAwLjUgPyBcImhcIiA6IFwidlwiO1xuICAgICAgY29uc3Qgc3RhcnQgPSBnZW5lcmF0ZVJhbmRvbVN0YXJ0KHNoaXAuc2l6ZSwgZGlyZWN0aW9uLCBnYW1lYm9hcmQuZ3JpZCk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGdhbWVib2FyZC5wbGFjZVNoaXAoc2hpcC50eXBlLCBzdGFydCwgZGlyZWN0aW9uKTtcbiAgICAgICAgcGxhY2VkID0gdHJ1ZTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAhKGVycm9yIGluc3RhbmNlb2YgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IpICYmXG4gICAgICAgICAgIShlcnJvciBpbnN0YW5jZW9mIE92ZXJsYXBwaW5nU2hpcHNFcnJvcilcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7IC8vIFJldGhyb3cgbm9uLXBsYWNlbWVudCBlcnJvcnNcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiBwbGFjZW1lbnQgZmFpbHMsIGNhdGNoIHRoZSBlcnJvciBhbmQgdHJ5IGFnYWluXG4gICAgICB9XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IFBsYXllciA9IChnYW1lYm9hcmQsIHR5cGUpID0+IHtcbiAgY29uc3QgbW92ZUxvZyA9IFtdO1xuXG4gIGNvbnN0IHBsYWNlU2hpcHMgPSAoc2hpcFR5cGUsIHN0YXJ0LCBkaXJlY3Rpb24pID0+IHtcbiAgICBpZiAodHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICBnYW1lYm9hcmQucGxhY2VTaGlwKHNoaXBUeXBlLCBzdGFydCwgZGlyZWN0aW9uKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgYXV0b1BsYWNlbWVudChnYW1lYm9hcmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBsYXllclR5cGVFcnJvcihcbiAgICAgICAgYEludmFsaWQgcGxheWVyIHR5cGUuIFZhbGlkIHBsYXllciB0eXBlczogXCJodW1hblwiICYgXCJjb21wdXRlclwiLiBFbnRlcmVkOiAke3R5cGV9LmAsXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBtYWtlTW92ZSA9IChvcHBHYW1lYm9hcmQsIGlucHV0KSA9PiB7XG4gICAgbGV0IG1vdmU7XG5cbiAgICAvLyBDaGVjayBmb3IgdGhlIHR5cGUgb2YgcGxheWVyXG4gICAgaWYgKHR5cGUgPT09IFwiaHVtYW5cIikge1xuICAgICAgLy8gRm9ybWF0IHRoZSBpbnB1dFxuICAgICAgbW92ZSA9IGAke2lucHV0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpfSR7aW5wdXQuc3Vic3RyaW5nKDEpfWA7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImNvbXB1dGVyXCIpIHtcbiAgICAgIG1vdmUgPSByYW5kTW92ZShvcHBHYW1lYm9hcmQuZ3JpZCwgbW92ZUxvZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGxheWVyVHlwZUVycm9yKFxuICAgICAgICBgSW52YWxpZCBwbGF5ZXIgdHlwZS4gVmFsaWQgcGxheWVyIHR5cGVzOiBcImh1bWFuXCIgJiBcImNvbXB1dGVyXCIuIEVudGVyZWQ6ICR7dHlwZX0uYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhlIGlucHV0IGFnYWluc3QgdGhlIHBvc3NpYmxlIG1vdmVzIG9uIHRoZSBnYW1lYm9hcmQncyBncmlkXG4gICAgaWYgKCFjaGVja01vdmUobW92ZSwgb3BwR2FtZWJvYXJkLmdyaWQpKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZE1vdmVFbnRyeUVycm9yKGBJbnZhbGlkIG1vdmUgZW50cnkhIE1vdmU6ICR7bW92ZX0uYCk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIG1vdmUgZXhpc3RzIGluIHRoZSBtb3ZlTG9nIGFycmF5LCB0aHJvdyBhbiBlcnJvclxuICAgIGlmIChtb3ZlTG9nLmZpbmQoKGVsKSA9PiBlbCA9PT0gbW92ZSkpIHtcbiAgICAgIHRocm93IG5ldyBSZXBlYXRBdHRhY2tlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gRWxzZSwgY2FsbCBhdHRhY2sgbWV0aG9kIG9uIGdhbWVib2FyZCBhbmQgbG9nIG1vdmUgaW4gbW92ZUxvZ1xuICAgIGNvbnN0IHJlc3BvbnNlID0gb3BwR2FtZWJvYXJkLmF0dGFjayhtb3ZlKTtcbiAgICBtb3ZlTG9nLnB1c2gobW92ZSk7XG4gICAgLy8gUmV0dXJuIHRoZSByZXNwb25zZSBvZiB0aGUgYXR0YWNrIChvYmplY3Q6IHsgaGl0OiBmYWxzZSB9IGZvciBtaXNzOyB7IGhpdDogdHJ1ZSwgc2hpcFR5cGU6IHN0cmluZyB9IGZvciBoaXQpLlxuICAgIHJldHVybiB7IHBsYXllcjogdHlwZSwgbW92ZSwgLi4ucmVzcG9uc2UgfTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldCB0eXBlKCkge1xuICAgICAgcmV0dXJuIHR5cGU7XG4gICAgfSxcbiAgICBnZXQgZ2FtZWJvYXJkKCkge1xuICAgICAgcmV0dXJuIGdhbWVib2FyZDtcbiAgICB9LFxuICAgIGdldCBtb3ZlTG9nKCkge1xuICAgICAgcmV0dXJuIG1vdmVMb2c7XG4gICAgfSxcbiAgICBtYWtlTW92ZSxcbiAgICBwbGFjZVNoaXBzLFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgUGxheWVyO1xuIiwiaW1wb3J0IHsgSW52YWxpZFNoaXBUeXBlRXJyb3IgfSBmcm9tIFwiLi9lcnJvcnNcIjtcblxuY29uc3QgU2hpcCA9ICh0eXBlKSA9PiB7XG4gIGNvbnN0IHNldExlbmd0aCA9ICgpID0+IHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgXCJjYXJyaWVyXCI6XG4gICAgICAgIHJldHVybiA1O1xuICAgICAgY2FzZSBcImJhdHRsZXNoaXBcIjpcbiAgICAgICAgcmV0dXJuIDQ7XG4gICAgICBjYXNlIFwiY3J1aXNlclwiOlxuICAgICAgY2FzZSBcInN1Ym1hcmluZVwiOlxuICAgICAgICByZXR1cm4gMztcbiAgICAgIGNhc2UgXCJkZXN0cm95ZXJcIjpcbiAgICAgICAgcmV0dXJuIDI7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFNoaXBUeXBlRXJyb3IoKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgc2hpcExlbmd0aCA9IHNldExlbmd0aCgpO1xuXG4gIGxldCBoaXRzID0gMDtcblxuICBjb25zdCBoaXQgPSAoKSA9PiB7XG4gICAgaWYgKGhpdHMgPCBzaGlwTGVuZ3RoKSB7XG4gICAgICBoaXRzICs9IDE7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB7XG4gICAgZ2V0IHR5cGUoKSB7XG4gICAgICByZXR1cm4gdHlwZTtcbiAgICB9LFxuICAgIGdldCBzaGlwTGVuZ3RoKCkge1xuICAgICAgcmV0dXJuIHNoaXBMZW5ndGg7XG4gICAgfSxcbiAgICBnZXQgaGl0cygpIHtcbiAgICAgIHJldHVybiBoaXRzO1xuICAgIH0sXG4gICAgZ2V0IGlzU3VuaygpIHtcbiAgICAgIHJldHVybiBoaXRzID09PSBzaGlwTGVuZ3RoO1xuICAgIH0sXG4gICAgaGl0LFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU2hpcDtcbiIsIi8vIEZ1bmN0aW9uIGZvciBidWlsZGluZyBhIHNoaXAsIGRlcGVuZGluZyBvbiB0aGUgc2hpcCB0eXBlXG5jb25zdCBidWlsZFNoaXAgPSAob2JqLCBkb21TZWwsIHNoaXBQb3NpdGlvbnMpID0+IHtcbiAgLy8gRXh0cmFjdCB0aGUgc2hpcCdzIHR5cGUgYW5kIGxlbmd0aCBmcm9tIHRoZSBvYmplY3RcbiAgY29uc3QgeyB0eXBlLCBzaGlwTGVuZ3RoOiBsZW5ndGggfSA9IG9iajtcbiAgLy8gQ3JlYXRlIGFuZCBhcnJheSBmb3IgdGhlIHNoaXAncyBzZWN0aW9uc1xuICBjb25zdCBzaGlwU2VjdHMgPSBbXTtcblxuICAvLyBVc2UgdGhlIGxlbmd0aCBvZiB0aGUgc2hpcCB0byBjcmVhdGUgdGhlIGNvcnJlY3QgbnVtYmVyIG9mIHNlY3Rpb25zXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAvLyBHZXQgYSBwb3NpdGlvbiBmcm9tIHRoZSBhcnJheVxuICAgIGNvbnN0IHBvc2l0aW9uID0gc2hpcFBvc2l0aW9uc1tpXTtcbiAgICAvLyBDcmVhdGUgYW4gZWxlbWVudCBmb3IgdGhlIHNlY3Rpb25cbiAgICBjb25zdCBzZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBzZWN0LmNsYXNzTmFtZSA9IFwidy00IGgtNCByb3VuZGVkLWZ1bGwgYmctZ3JheS04MDBcIjsgLy8gU2V0IHRoZSBkZWZhdWx0IHN0eWxpbmcgZm9yIHRoZSBzZWN0aW9uIGVsZW1lbnRcbiAgICAvLyBTZXQgYSB1bmlxdWUgaWQgZm9yIHRoZSBzaGlwIHNlY3Rpb25cbiAgICBzZWN0LnNldEF0dHJpYnV0ZShcImlkXCIsIGBET00tJHtkb21TZWx9LXNoaXBUeXBlLSR7dHlwZX0tcG9zLSR7cG9zaXRpb259YCk7XG4gICAgLy8gU2V0IGEgZGF0YXNldCBwcm9wZXJ0eSBvZiBcInBvc2l0aW9uXCIgZm9yIHRoZSBzZWN0aW9uXG4gICAgc2VjdC5kYXRhc2V0LnBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgc2hpcFNlY3RzLnB1c2goc2VjdCk7IC8vIEFkZCB0aGUgc2VjdGlvbiB0byB0aGUgYXJyYXlcbiAgfVxuXG4gIC8vIFJldHVybiB0aGUgYXJyYXkgb2Ygc2hpcCBzZWN0aW9uc1xuICByZXR1cm4gc2hpcFNlY3RzO1xufTtcblxuY29uc3QgVWlNYW5hZ2VyID0gKCkgPT4ge1xuICBjb25zdCBjcmVhdGVHYW1lYm9hcmQgPSAoY29udGFpbmVySUQpID0+IHtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXJJRCk7XG5cbiAgICAvLyBTZXQgcGxheWVyIHR5cGUgZGVwZW5kaW5nIG9uIHRoZSBjb250YWluZXJJRFxuICAgIGNvbnN0IHsgcGxheWVyIH0gPSBjb250YWluZXIuZGF0YXNldDtcblxuICAgIC8vIENyZWF0ZSB0aGUgZ3JpZCBjb250YWluZXJcbiAgICBjb25zdCBncmlkRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBncmlkRGl2LmNsYXNzTmFtZSA9XG4gICAgICBcImdhbWVib2FyZC1hcmVhIGdyaWQgZ3JpZC1jb2xzLTExIGF1dG8tcm93cy1taW4gZ2FwLTEgcC02XCI7XG4gICAgZ3JpZERpdi5kYXRhc2V0LnBsYXllciA9IHBsYXllcjtcblxuICAgIC8vIEFkZCB0aGUgdG9wLWxlZnQgY29ybmVyIGVtcHR5IGNlbGxcbiAgICBncmlkRGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikpO1xuXG4gICAgLy8gQWRkIGNvbHVtbiBoZWFkZXJzIEEtSlxuICAgIGNvbnN0IGNvbHVtbnMgPSBcIkFCQ0RFRkdISUpcIjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbHVtbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBoZWFkZXIuY2xhc3NOYW1lID0gXCJ0ZXh0LWNlbnRlclwiO1xuICAgICAgaGVhZGVyLnRleHRDb250ZW50ID0gY29sdW1uc1tpXTtcbiAgICAgIGdyaWREaXYuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcbiAgICB9XG5cbiAgICAvLyBBZGQgcm93IGxhYmVscyBhbmQgY2VsbHNcbiAgICBmb3IgKGxldCByb3cgPSAxOyByb3cgPD0gMTA7IHJvdysrKSB7XG4gICAgICAvLyBSb3cgbGFiZWxcbiAgICAgIGNvbnN0IHJvd0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIHJvd0xhYmVsLmNsYXNzTmFtZSA9IFwidGV4dC1jZW50ZXJcIjtcbiAgICAgIHJvd0xhYmVsLnRleHRDb250ZW50ID0gcm93O1xuICAgICAgZ3JpZERpdi5hcHBlbmRDaGlsZChyb3dMYWJlbCk7XG5cbiAgICAgIC8vIENlbGxzIGZvciBlYWNoIHJvd1xuICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgMTA7IGNvbCsrKSB7XG4gICAgICAgIGNvbnN0IGNlbGxJZCA9IGAke2NvbHVtbnNbY29sXX0ke3Jvd31gOyAvLyBTZXQgdGhlIGNlbGxJZFxuICAgICAgICBjb25zdCBjZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY2VsbC5pZCA9IGAke3BsYXllcn0tJHtjZWxsSWR9YDsgLy8gU2V0IHRoZSBlbGVtZW50IGlkXG4gICAgICAgIGNlbGwuY2xhc3NOYW1lID1cbiAgICAgICAgICBcInctNiBoLTYgYmctZ3JheS0yMDAgZmxleCBqdXN0aWZ5LWNlbnRlciBpdGVtcy1jZW50ZXIgY3Vyc29yLXBvaW50ZXIgaG92ZXI6Ymctb3JhbmdlLTUwMFwiOyAvLyBBZGQgbW9yZSBjbGFzc2VzIGFzIG5lZWRlZCBmb3Igc3R5bGluZ1xuICAgICAgICBjZWxsLmNsYXNzTGlzdC5hZGQoXCJnYW1lYm9hcmQtY2VsbFwiKTsgLy8gQWRkIGEgY2xhc3MgbmFtZSB0byBlYWNoIGNlbGwgdG8gYWN0IGFzIGEgc2VsZWN0b3JcbiAgICAgICAgY2VsbC5kYXRhc2V0LnBvc2l0aW9uID0gY2VsbElkOyAvLyBBc3NpZ24gcG9zaXRpb24gZGF0YSBhdHRyaWJ1dGUgZm9yIGlkZW50aWZpY2F0aW9uXG4gICAgICAgIGNlbGwuZGF0YXNldC5wbGF5ZXIgPSBwbGF5ZXI7IC8vIEFzc2lnbiBwbGF5ZXIgZGF0YSBhdHRyaWJ1dGUgZm9yIGlkZW50aWZpY2F0aW9uXG5cbiAgICAgICAgZ3JpZERpdi5hcHBlbmRDaGlsZChjZWxsKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBcHBlbmQgdGhlIGdyaWQgdG8gdGhlIGNvbnRhaW5lclxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChncmlkRGl2KTtcbiAgfTtcblxuICBjb25zdCBpbml0Q29uc29sZVVJID0gKCkgPT4ge1xuICAgIGNvbnN0IGNvbnNvbGVDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGVcIik7IC8vIEdldCB0aGUgY29uc29sZSBjb250YWluZXIgZnJvbSB0aGUgRE9NXG4gICAgY29uc29sZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFxuICAgICAgXCJmbGV4XCIsXG4gICAgICBcImZsZXgtY29sXCIsXG4gICAgICBcImp1c3RpZnktYmV0d2VlblwiLFxuICAgICAgXCJ0ZXh0LXNtXCIsXG4gICAgKTsgLy8gU2V0IGZsZXhib3ggcnVsZXMgZm9yIGNvbnRhaW5lclxuXG4gICAgLy8gQ3JlYXRlIGEgY29udGFpbmVyIGZvciB0aGUgaW5wdXQgYW5kIGJ1dHRvbiBlbGVtZW50c1xuICAgIGNvbnN0IGlucHV0RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBpbnB1dERpdi5jbGFzc05hbWUgPSBcImZsZXggZmxleC1yb3cgdy1mdWxsIGgtMS81IGp1c3RpZnktYmV0d2VlblwiOyAvLyBTZXQgdGhlIGZsZXhib3ggcnVsZXMgZm9yIHRoZSBjb250YWluZXJcblxuICAgIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpOyAvLyBDcmVhdGUgYW4gaW5wdXQgZWxlbWVudCBmb3IgdGhlIGNvbnNvbGVcbiAgICBpbnB1dC50eXBlID0gXCJ0ZXh0XCI7IC8vIFNldCB0aGUgaW5wdXQgdHlwZSBvZiB0aGlzIGVsZW1lbnQgdG8gdGV4dFxuICAgIGlucHV0LnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY29uc29sZS1pbnB1dFwiKTsgLy8gU2V0IHRoZSBpZCBmb3IgdGhpcyBlbGVtZW50IHRvIFwiY29uc29sZS1pbnB1dFwiXG4gICAgaW5wdXQuY2xhc3NOYW1lID0gXCJwLTEgYmctZ3JheS00MDAgZmxleC0xXCI7IC8vIEFkZCBUYWlsd2luZENTUyBjbGFzc2VzXG4gICAgY29uc3Qgc3VibWl0QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTsgLy8gQ3JlYXRlIGEgYnV0dG9uIGVsZW1lbnQgZm9yIHRoZSBjb25zb2xlIHN1Ym1pdFxuICAgIHN1Ym1pdEJ1dHRvbi50ZXh0Q29udGVudCA9IFwiU3VibWl0XCI7IC8vIEFkZCB0aGUgdGV4dCBcIlN1Ym1pdFwiIHRvIHRoZSBidXR0b25cbiAgICBzdWJtaXRCdXR0b24uc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJjb25zb2xlLXN1Ym1pdFwiKTsgLy8gU2V0IHRoZSBpZCBmb3IgdGhlIGJ1dHRvblxuICAgIHN1Ym1pdEJ1dHRvbi5jbGFzc05hbWUgPSBcInB4LTMgcHktMSBiZy1ncmF5LTgwMCB0ZXh0LWNlbnRlciB0ZXh0LXNtXCI7IC8vIEFkZCBUYWlsd2luZENTUyBjbGFzc2VzXG4gICAgY29uc3Qgb3V0cHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTsgLy8gQ3JlYXRlIGFuIGRpdiBlbGVtZW50IGZvciB0aGUgb3V0cHV0IG9mIHRoZSBjb25zb2xlXG4gICAgb3V0cHV0LnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY29uc29sZS1vdXRwdXRcIik7IC8vIFNldCB0aGUgaWQgZm9yIHRoZSBvdXRwdXQgZWxlbWVudFxuICAgIG91dHB1dC5jbGFzc05hbWUgPSBcInAtMSBiZy1ncmF5LTIwMCBmbGV4LTEgaC00LzUgb3ZlcmZsb3ctYXV0b1wiOyAvLyBBZGQgVGFpbHdpbmRDU1MgY2xhc3Nlc1xuXG4gICAgLy8gQWRkIHRoZSBpbnB1dCBlbGVtZW50cyB0byB0aGUgaW5wdXQgY29udGFpbmVyXG4gICAgaW5wdXREaXYuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgIGlucHV0RGl2LmFwcGVuZENoaWxkKHN1Ym1pdEJ1dHRvbik7XG5cbiAgICAvLyBBcHBlbmQgZWxlbWVudHMgdG8gdGhlIGNvbnNvbGUgY29udGFpbmVyXG4gICAgY29uc29sZUNvbnRhaW5lci5hcHBlbmRDaGlsZChvdXRwdXQpO1xuICAgIGNvbnNvbGVDb250YWluZXIuYXBwZW5kQ2hpbGQoaW5wdXREaXYpO1xuICB9O1xuXG4gIGNvbnN0IGRpc3BsYXlQcm9tcHQgPSAocHJvbXB0T2JqcykgPT4ge1xuICAgIC8vIEdldCB0aGUgcHJvbXB0IGRpc3BsYXlcbiAgICBjb25zdCBkaXNwbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcm9tcHQtZGlzcGxheVwiKTtcblxuICAgIC8vIENsZWFyIHRoZSBkaXNwbGF5IG9mIGFsbCBjaGlsZHJlblxuICAgIHdoaWxlIChkaXNwbGF5LmZpcnN0Q2hpbGQpIHtcbiAgICAgIGRpc3BsYXkucmVtb3ZlQ2hpbGQoZGlzcGxheS5maXJzdENoaWxkKTtcbiAgICB9XG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgZWFjaCBwcm9tcHQgaW4gdGhlIHByb21wdHMgb2JqZWN0XG4gICAgT2JqZWN0LmVudHJpZXMocHJvbXB0T2JqcykuZm9yRWFjaCgoW2tleSwgeyBwcm9tcHQsIHByb21wdFR5cGUgfV0pID0+IHtcbiAgICAgIC8vIENyZWF0ZSBhIG5ldyBkaXYgZm9yIGVhY2ggcHJvbXB0XG4gICAgICBjb25zdCBwcm9tcHREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgcHJvbXB0RGl2LnRleHRDb250ZW50ID0gcHJvbXB0O1xuXG4gICAgICAvLyBBcHBseSBzdHlsaW5nIGJhc2VkIG9uIHByb21wdFR5cGVcbiAgICAgIHN3aXRjaCAocHJvbXB0VHlwZSkge1xuICAgICAgICBjYXNlIFwiaW5zdHJ1Y3Rpb25cIjpcbiAgICAgICAgICBwcm9tcHREaXYuY2xhc3NMaXN0LmFkZChcInRleHQtbGltZS02MDBcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJndWlkZVwiOlxuICAgICAgICAgIHByb21wdERpdi5jbGFzc0xpc3QuYWRkKFwidGV4dC1za3ktNjAwXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICBwcm9tcHREaXYuY2xhc3NMaXN0LmFkZChcInRleHQtcmVkLTcwMFwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBwcm9tcHREaXYuY2xhc3NMaXN0LmFkZChcInRleHQtZ3JheS04MDBcIik7IC8vIERlZmF1bHQgdGV4dCBjb2xvclxuICAgICAgfVxuXG4gICAgICAvLyBBcHBlbmQgdGhlIG5ldyBkaXYgdG8gdGhlIGRpc3BsYXkgY29udGFpbmVyXG4gICAgICBkaXNwbGF5LmFwcGVuZENoaWxkKHByb21wdERpdik7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gZm9yIHJlbmRlcmluZyBzaGlwcyB0byB0aGUgU2hpcCBTdGF0dXMgZGlzcGxheSBzZWN0aW9uXG4gIGNvbnN0IHJlbmRlclNoaXBEaXNwID0gKHBsYXllck9iaiwgc2hpcFR5cGUpID0+IHtcbiAgICBsZXQgaWRTZWw7XG5cbiAgICAvLyBTZXQgdGhlIGNvcnJlY3QgaWQgc2VsZWN0b3IgZm9yIHRoZSB0eXBlIG9mIHBsYXllclxuICAgIGlmIChwbGF5ZXJPYmoudHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICBpZFNlbCA9IFwiaHVtYW4tZGlzcGxheVwiO1xuICAgIH0gZWxzZSBpZiAocGxheWVyT2JqLnR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgaWRTZWwgPSBcImNvbXAtZGlzcGxheVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcjtcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIGNvcnJlY3QgRE9NIGVsZW1lbnRcbiAgICBjb25zdCBkaXNwRGl2ID0gZG9jdW1lbnRcbiAgICAgIC5nZXRFbGVtZW50QnlJZChpZFNlbClcbiAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLnNoaXBzLWNvbnRhaW5lclwiKTtcblxuICAgIC8vIEdldCB0aGUgc2hpcCBmcm9tIHRoZSBwbGF5ZXJcbiAgICBjb25zdCBzaGlwID0gcGxheWVyT2JqLmdhbWVib2FyZC5nZXRTaGlwKHNoaXBUeXBlKTtcblxuICAgIC8vIENyZWF0ZSBhIGRpdiBmb3IgdGhlIHNoaXBcbiAgICBjb25zdCBzaGlwRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBzaGlwRGl2LmNsYXNzTmFtZSA9IFwicHgtNCBweS0yIGZsZXggZmxleC1jb2wgZ2FwLTFcIjtcblxuICAgIC8vIEFkZCBhIHRpdGxlIHRoZSB0aGUgZGl2XG4gICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaDJcIik7XG4gICAgdGl0bGUudGV4dENvbnRlbnQgPSBzaGlwVHlwZTsgLy8gU2V0IHRoZSB0aXRsZSB0byB0aGUgc2hpcCB0eXBlXG4gICAgc2hpcERpdi5hcHBlbmRDaGlsZCh0aXRsZSk7XG5cbiAgICAvLyBHZXQgdGhlIHNoaXAgcG9zaXRpb25zIGFycmF5XG4gICAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IHBsYXllck9iai5nYW1lYm9hcmQuZ2V0U2hpcFBvc2l0aW9ucyhzaGlwVHlwZSk7XG5cbiAgICAvLyBCdWlsZCB0aGUgc2hpcCBzZWN0aW9uc1xuICAgIGNvbnN0IHNoaXBTZWN0cyA9IGJ1aWxkU2hpcChzaGlwLCBpZFNlbCwgc2hpcFBvc2l0aW9ucyk7XG5cbiAgICAvLyBBZGQgdGhlIHNoaXAgc2VjdGlvbnMgdG8gdGhlIGRpdlxuICAgIGNvbnN0IHNlY3RzRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBzZWN0c0Rpdi5jbGFzc05hbWUgPSBcImZsZXggZmxleC1yb3cgZ2FwLTFcIjtcbiAgICBzaGlwU2VjdHMuZm9yRWFjaCgoc2VjdCkgPT4ge1xuICAgICAgc2VjdHNEaXYuYXBwZW5kQ2hpbGQoc2VjdCk7XG4gICAgfSk7XG4gICAgc2hpcERpdi5hcHBlbmRDaGlsZChzZWN0c0Rpdik7XG5cbiAgICBkaXNwRGl2LmFwcGVuZENoaWxkKHNoaXBEaXYpO1xuICB9O1xuXG4gIC8vIEZ1bmN0aW9uIGZvciByIHNoaXBzIG9uIHRoZSBnYW1lYm9hcmRcbiAgY29uc3QgcmVuZGVyU2hpcEJvYXJkID0gKHBsYXllck9iaiwgc2hpcFR5cGUpID0+IHtcbiAgICBsZXQgaWRTZWw7XG5cbiAgICAvLyBTZXQgdGhlIGNvcnJlY3QgaWQgc2VsZWN0b3IgZm9yIHRoZSB0eXBlIG9mIHBsYXllclxuICAgIGlmIChwbGF5ZXJPYmoudHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICBpZFNlbCA9IFwiaHVtYW4tYm9hcmRcIjtcbiAgICB9IGVsc2UgaWYgKHBsYXllck9iai50eXBlID09PSBcImNvbXB1dGVyXCIpIHtcbiAgICAgIGlkU2VsID0gXCJjb21wLWJvYXJkXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yKFwiTm8gbWF0Y2hpbmcgcGxheWVyIHR5cGUgaW4gJ3JlbmRlclNoaXBCb2FyZCcgZnVuY3Rpb25cIik7XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSBwbGF5ZXIncyB0eXBlIGFuZCBnYW1lYm9hcmRcbiAgICBjb25zdCB7IHR5cGU6IHBsYXllclR5cGUsIGdhbWVib2FyZCB9ID0gcGxheWVyT2JqO1xuXG4gICAgLy8gR2V0IHRoZSBzaGlwIGFuZCB0aGUgc2hpcCBwb3NpdGlvbnNcbiAgICBjb25zdCBzaGlwT2JqID0gZ2FtZWJvYXJkLmdldFNoaXAoc2hpcFR5cGUpO1xuICAgIGNvbnN0IHNoaXBQb3NpdGlvbnMgPSBnYW1lYm9hcmQuZ2V0U2hpcFBvc2l0aW9ucyhzaGlwVHlwZSk7XG5cbiAgICAvLyBCdWlsZCB0aGUgc2hpcCBzZWN0aW9uc1xuICAgIGNvbnN0IHNoaXBTZWN0cyA9IGJ1aWxkU2hpcChzaGlwT2JqLCBpZFNlbCwgc2hpcFBvc2l0aW9ucyk7XG5cbiAgICAvLyBNYXRjaCB0aGUgY2VsbCBwb3NpdGlvbnMgd2l0aCB0aGUgc2hpcCBzZWN0aW9ucyBhbmQgcGxhY2UgZWFjaFxuICAgIC8vIHNoaXAgc2VjdGlvbiBpbiB0aGUgY29ycmVzcG9uZGluZyBjZWxsIGVsZW1lbnRcbiAgICBzaGlwUG9zaXRpb25zLmZvckVhY2goKHBvc2l0aW9uKSA9PiB7XG4gICAgICBjb25zdCBjZWxsRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke3BsYXllclR5cGV9LSR7cG9zaXRpb259YCk7XG4gICAgICAvLyBGaW5kIHRoZSBzaGlwIHNlY3Rpb24gZWxlbWVudCB0aGF0IG1hdGNoZXMgdGhlIGN1cnJlbnQgcG9zaXRpb25cbiAgICAgIGNvbnN0IHNoaXBTZWN0ID0gc2hpcFNlY3RzLmZpbmQoXG4gICAgICAgIChzZWN0aW9uKSA9PiBzZWN0aW9uLmRhdGFzZXQucG9zaXRpb24gPT09IHBvc2l0aW9uLFxuICAgICAgKTtcblxuICAgICAgaWYgKGNlbGxFbGVtZW50ICYmIHNoaXBTZWN0KSB7XG4gICAgICAgIC8vIFBsYWNlIHRoZSBzaGlwIHNlY3Rpb24gaW4gdGhlIGNlbGxcbiAgICAgICAgY2VsbEVsZW1lbnQuYXBwZW5kQ2hpbGQoc2hpcFNlY3QpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgY3JlYXRlR2FtZWJvYXJkLFxuICAgIGluaXRDb25zb2xlVUksXG4gICAgZGlzcGxheVByb21wdCxcbiAgICByZW5kZXJTaGlwRGlzcCxcbiAgICByZW5kZXJTaGlwQm9hcmQsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBVaU1hbmFnZXI7XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBgLypcbiEgdGFpbHdpbmRjc3MgdjMuNC4xIHwgTUlUIExpY2Vuc2UgfCBodHRwczovL3RhaWx3aW5kY3NzLmNvbVxuKi8vKlxuMS4gUHJldmVudCBwYWRkaW5nIGFuZCBib3JkZXIgZnJvbSBhZmZlY3RpbmcgZWxlbWVudCB3aWR0aC4gKGh0dHBzOi8vZ2l0aHViLmNvbS9tb3pkZXZzL2Nzc3JlbWVkeS9pc3N1ZXMvNClcbjIuIEFsbG93IGFkZGluZyBhIGJvcmRlciB0byBhbiBlbGVtZW50IGJ5IGp1c3QgYWRkaW5nIGEgYm9yZGVyLXdpZHRoLiAoaHR0cHM6Ly9naXRodWIuY29tL3RhaWx3aW5kY3NzL3RhaWx3aW5kY3NzL3B1bGwvMTE2KVxuKi9cblxuKixcbjo6YmVmb3JlLFxuOjphZnRlciB7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7IC8qIDEgKi9cbiAgYm9yZGVyLXdpZHRoOiAwOyAvKiAyICovXG4gIGJvcmRlci1zdHlsZTogc29saWQ7IC8qIDIgKi9cbiAgYm9yZGVyLWNvbG9yOiAjZTVlN2ViOyAvKiAyICovXG59XG5cbjo6YmVmb3JlLFxuOjphZnRlciB7XG4gIC0tdHctY29udGVudDogJyc7XG59XG5cbi8qXG4xLiBVc2UgYSBjb25zaXN0ZW50IHNlbnNpYmxlIGxpbmUtaGVpZ2h0IGluIGFsbCBicm93c2Vycy5cbjIuIFByZXZlbnQgYWRqdXN0bWVudHMgb2YgZm9udCBzaXplIGFmdGVyIG9yaWVudGF0aW9uIGNoYW5nZXMgaW4gaU9TLlxuMy4gVXNlIGEgbW9yZSByZWFkYWJsZSB0YWIgc2l6ZS5cbjQuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgc2Fuc1xcYCBmb250LWZhbWlseSBieSBkZWZhdWx0LlxuNS4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBzYW5zXFxgIGZvbnQtZmVhdHVyZS1zZXR0aW5ncyBieSBkZWZhdWx0LlxuNi4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBzYW5zXFxgIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzIGJ5IGRlZmF1bHQuXG43LiBEaXNhYmxlIHRhcCBoaWdobGlnaHRzIG9uIGlPU1xuKi9cblxuaHRtbCxcbjpob3N0IHtcbiAgbGluZS1oZWlnaHQ6IDEuNTsgLyogMSAqL1xuICAtd2Via2l0LXRleHQtc2l6ZS1hZGp1c3Q6IDEwMCU7IC8qIDIgKi9cbiAgLW1vei10YWItc2l6ZTogNDsgLyogMyAqL1xuICAtby10YWItc2l6ZTogNDtcbiAgICAgdGFiLXNpemU6IDQ7IC8qIDMgKi9cbiAgZm9udC1mYW1pbHk6IHVpLXNhbnMtc2VyaWYsIHN5c3RlbS11aSwgc2Fucy1zZXJpZiwgXCJBcHBsZSBDb2xvciBFbW9qaVwiLCBcIlNlZ29lIFVJIEVtb2ppXCIsIFwiU2Vnb2UgVUkgU3ltYm9sXCIsIFwiTm90byBDb2xvciBFbW9qaVwiOyAvKiA0ICovXG4gIGZvbnQtZmVhdHVyZS1zZXR0aW5nczogbm9ybWFsOyAvKiA1ICovXG4gIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzOiBub3JtYWw7IC8qIDYgKi9cbiAgLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOiB0cmFuc3BhcmVudDsgLyogNyAqL1xufVxuXG4vKlxuMS4gUmVtb3ZlIHRoZSBtYXJnaW4gaW4gYWxsIGJyb3dzZXJzLlxuMi4gSW5oZXJpdCBsaW5lLWhlaWdodCBmcm9tIFxcYGh0bWxcXGAgc28gdXNlcnMgY2FuIHNldCB0aGVtIGFzIGEgY2xhc3MgZGlyZWN0bHkgb24gdGhlIFxcYGh0bWxcXGAgZWxlbWVudC5cbiovXG5cbmJvZHkge1xuICBtYXJnaW46IDA7IC8qIDEgKi9cbiAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7IC8qIDIgKi9cbn1cblxuLypcbjEuIEFkZCB0aGUgY29ycmVjdCBoZWlnaHQgaW4gRmlyZWZveC5cbjIuIENvcnJlY3QgdGhlIGluaGVyaXRhbmNlIG9mIGJvcmRlciBjb2xvciBpbiBGaXJlZm94LiAoaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTkwNjU1KVxuMy4gRW5zdXJlIGhvcml6b250YWwgcnVsZXMgYXJlIHZpc2libGUgYnkgZGVmYXVsdC5cbiovXG5cbmhyIHtcbiAgaGVpZ2h0OiAwOyAvKiAxICovXG4gIGNvbG9yOiBpbmhlcml0OyAvKiAyICovXG4gIGJvcmRlci10b3Atd2lkdGg6IDFweDsgLyogMyAqL1xufVxuXG4vKlxuQWRkIHRoZSBjb3JyZWN0IHRleHQgZGVjb3JhdGlvbiBpbiBDaHJvbWUsIEVkZ2UsIGFuZCBTYWZhcmkuXG4qL1xuXG5hYmJyOndoZXJlKFt0aXRsZV0pIHtcbiAgLXdlYmtpdC10ZXh0LWRlY29yYXRpb246IHVuZGVybGluZSBkb3R0ZWQ7XG4gICAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmUgZG90dGVkO1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBkZWZhdWx0IGZvbnQgc2l6ZSBhbmQgd2VpZ2h0IGZvciBoZWFkaW5ncy5cbiovXG5cbmgxLFxuaDIsXG5oMyxcbmg0LFxuaDUsXG5oNiB7XG4gIGZvbnQtc2l6ZTogaW5oZXJpdDtcbiAgZm9udC13ZWlnaHQ6IGluaGVyaXQ7XG59XG5cbi8qXG5SZXNldCBsaW5rcyB0byBvcHRpbWl6ZSBmb3Igb3B0LWluIHN0eWxpbmcgaW5zdGVhZCBvZiBvcHQtb3V0LlxuKi9cblxuYSB7XG4gIGNvbG9yOiBpbmhlcml0O1xuICB0ZXh0LWRlY29yYXRpb246IGluaGVyaXQ7XG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgZm9udCB3ZWlnaHQgaW4gRWRnZSBhbmQgU2FmYXJpLlxuKi9cblxuYixcbnN0cm9uZyB7XG4gIGZvbnQtd2VpZ2h0OiBib2xkZXI7XG59XG5cbi8qXG4xLiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYG1vbm9cXGAgZm9udC1mYW1pbHkgYnkgZGVmYXVsdC5cbjIuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgbW9ub1xcYCBmb250LWZlYXR1cmUtc2V0dGluZ3MgYnkgZGVmYXVsdC5cbjMuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgbW9ub1xcYCBmb250LXZhcmlhdGlvbi1zZXR0aW5ncyBieSBkZWZhdWx0LlxuNC4gQ29ycmVjdCB0aGUgb2RkIFxcYGVtXFxgIGZvbnQgc2l6aW5nIGluIGFsbCBicm93c2Vycy5cbiovXG5cbmNvZGUsXG5rYmQsXG5zYW1wLFxucHJlIHtcbiAgZm9udC1mYW1pbHk6IHVpLW1vbm9zcGFjZSwgU0ZNb25vLVJlZ3VsYXIsIE1lbmxvLCBNb25hY28sIENvbnNvbGFzLCBcIkxpYmVyYXRpb24gTW9ub1wiLCBcIkNvdXJpZXIgTmV3XCIsIG1vbm9zcGFjZTsgLyogMSAqL1xuICBmb250LWZlYXR1cmUtc2V0dGluZ3M6IG5vcm1hbDsgLyogMiAqL1xuICBmb250LXZhcmlhdGlvbi1zZXR0aW5nczogbm9ybWFsOyAvKiAzICovXG4gIGZvbnQtc2l6ZTogMWVtOyAvKiA0ICovXG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgZm9udCBzaXplIGluIGFsbCBicm93c2Vycy5cbiovXG5cbnNtYWxsIHtcbiAgZm9udC1zaXplOiA4MCU7XG59XG5cbi8qXG5QcmV2ZW50IFxcYHN1YlxcYCBhbmQgXFxgc3VwXFxgIGVsZW1lbnRzIGZyb20gYWZmZWN0aW5nIHRoZSBsaW5lIGhlaWdodCBpbiBhbGwgYnJvd3NlcnMuXG4qL1xuXG5zdWIsXG5zdXAge1xuICBmb250LXNpemU6IDc1JTtcbiAgbGluZS1oZWlnaHQ6IDA7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xufVxuXG5zdWIge1xuICBib3R0b206IC0wLjI1ZW07XG59XG5cbnN1cCB7XG4gIHRvcDogLTAuNWVtO1xufVxuXG4vKlxuMS4gUmVtb3ZlIHRleHQgaW5kZW50YXRpb24gZnJvbSB0YWJsZSBjb250ZW50cyBpbiBDaHJvbWUgYW5kIFNhZmFyaS4gKGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTk5OTA4OCwgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTIwMTI5NylcbjIuIENvcnJlY3QgdGFibGUgYm9yZGVyIGNvbG9yIGluaGVyaXRhbmNlIGluIGFsbCBDaHJvbWUgYW5kIFNhZmFyaS4gKGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTkzNTcyOSwgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE5NTAxNilcbjMuIFJlbW92ZSBnYXBzIGJldHdlZW4gdGFibGUgYm9yZGVycyBieSBkZWZhdWx0LlxuKi9cblxudGFibGUge1xuICB0ZXh0LWluZGVudDogMDsgLyogMSAqL1xuICBib3JkZXItY29sb3I6IGluaGVyaXQ7IC8qIDIgKi9cbiAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsgLyogMyAqL1xufVxuXG4vKlxuMS4gQ2hhbmdlIHRoZSBmb250IHN0eWxlcyBpbiBhbGwgYnJvd3NlcnMuXG4yLiBSZW1vdmUgdGhlIG1hcmdpbiBpbiBGaXJlZm94IGFuZCBTYWZhcmkuXG4zLiBSZW1vdmUgZGVmYXVsdCBwYWRkaW5nIGluIGFsbCBicm93c2Vycy5cbiovXG5cbmJ1dHRvbixcbmlucHV0LFxub3B0Z3JvdXAsXG5zZWxlY3QsXG50ZXh0YXJlYSB7XG4gIGZvbnQtZmFtaWx5OiBpbmhlcml0OyAvKiAxICovXG4gIGZvbnQtZmVhdHVyZS1zZXR0aW5nczogaW5oZXJpdDsgLyogMSAqL1xuICBmb250LXZhcmlhdGlvbi1zZXR0aW5nczogaW5oZXJpdDsgLyogMSAqL1xuICBmb250LXNpemU6IDEwMCU7IC8qIDEgKi9cbiAgZm9udC13ZWlnaHQ6IGluaGVyaXQ7IC8qIDEgKi9cbiAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7IC8qIDEgKi9cbiAgY29sb3I6IGluaGVyaXQ7IC8qIDEgKi9cbiAgbWFyZ2luOiAwOyAvKiAyICovXG4gIHBhZGRpbmc6IDA7IC8qIDMgKi9cbn1cblxuLypcblJlbW92ZSB0aGUgaW5oZXJpdGFuY2Ugb2YgdGV4dCB0cmFuc2Zvcm0gaW4gRWRnZSBhbmQgRmlyZWZveC5cbiovXG5cbmJ1dHRvbixcbnNlbGVjdCB7XG4gIHRleHQtdHJhbnNmb3JtOiBub25lO1xufVxuXG4vKlxuMS4gQ29ycmVjdCB0aGUgaW5hYmlsaXR5IHRvIHN0eWxlIGNsaWNrYWJsZSB0eXBlcyBpbiBpT1MgYW5kIFNhZmFyaS5cbjIuIFJlbW92ZSBkZWZhdWx0IGJ1dHRvbiBzdHlsZXMuXG4qL1xuXG5idXR0b24sXG5bdHlwZT0nYnV0dG9uJ10sXG5bdHlwZT0ncmVzZXQnXSxcblt0eXBlPSdzdWJtaXQnXSB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogYnV0dG9uOyAvKiAxICovXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50OyAvKiAyICovXG4gIGJhY2tncm91bmQtaW1hZ2U6IG5vbmU7IC8qIDIgKi9cbn1cblxuLypcblVzZSB0aGUgbW9kZXJuIEZpcmVmb3ggZm9jdXMgc3R5bGUgZm9yIGFsbCBmb2N1c2FibGUgZWxlbWVudHMuXG4qL1xuXG46LW1vei1mb2N1c3Jpbmcge1xuICBvdXRsaW5lOiBhdXRvO1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBhZGRpdGlvbmFsIFxcYDppbnZhbGlkXFxgIHN0eWxlcyBpbiBGaXJlZm94LiAoaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvZ2Vja28tZGV2L2Jsb2IvMmY5ZWFjZDlkM2Q5OTVjOTM3YjQyNTFhNTU1N2Q5NWQ0OTRjOWJlMS9sYXlvdXQvc3R5bGUvcmVzL2Zvcm1zLmNzcyNMNzI4LUw3MzcpXG4qL1xuXG46LW1vei11aS1pbnZhbGlkIHtcbiAgYm94LXNoYWRvdzogbm9uZTtcbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCB2ZXJ0aWNhbCBhbGlnbm1lbnQgaW4gQ2hyb21lIGFuZCBGaXJlZm94LlxuKi9cblxucHJvZ3Jlc3Mge1xuICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XG59XG5cbi8qXG5Db3JyZWN0IHRoZSBjdXJzb3Igc3R5bGUgb2YgaW5jcmVtZW50IGFuZCBkZWNyZW1lbnQgYnV0dG9ucyBpbiBTYWZhcmkuXG4qL1xuXG46Oi13ZWJraXQtaW5uZXItc3Bpbi1idXR0b24sXG46Oi13ZWJraXQtb3V0ZXItc3Bpbi1idXR0b24ge1xuICBoZWlnaHQ6IGF1dG87XG59XG5cbi8qXG4xLiBDb3JyZWN0IHRoZSBvZGQgYXBwZWFyYW5jZSBpbiBDaHJvbWUgYW5kIFNhZmFyaS5cbjIuIENvcnJlY3QgdGhlIG91dGxpbmUgc3R5bGUgaW4gU2FmYXJpLlxuKi9cblxuW3R5cGU9J3NlYXJjaCddIHtcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiB0ZXh0ZmllbGQ7IC8qIDEgKi9cbiAgb3V0bGluZS1vZmZzZXQ6IC0ycHg7IC8qIDIgKi9cbn1cblxuLypcblJlbW92ZSB0aGUgaW5uZXIgcGFkZGluZyBpbiBDaHJvbWUgYW5kIFNhZmFyaSBvbiBtYWNPUy5cbiovXG5cbjo6LXdlYmtpdC1zZWFyY2gtZGVjb3JhdGlvbiB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcbn1cblxuLypcbjEuIENvcnJlY3QgdGhlIGluYWJpbGl0eSB0byBzdHlsZSBjbGlja2FibGUgdHlwZXMgaW4gaU9TIGFuZCBTYWZhcmkuXG4yLiBDaGFuZ2UgZm9udCBwcm9wZXJ0aWVzIHRvIFxcYGluaGVyaXRcXGAgaW4gU2FmYXJpLlxuKi9cblxuOjotd2Via2l0LWZpbGUtdXBsb2FkLWJ1dHRvbiB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogYnV0dG9uOyAvKiAxICovXG4gIGZvbnQ6IGluaGVyaXQ7IC8qIDIgKi9cbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCBkaXNwbGF5IGluIENocm9tZSBhbmQgU2FmYXJpLlxuKi9cblxuc3VtbWFyeSB7XG4gIGRpc3BsYXk6IGxpc3QtaXRlbTtcbn1cblxuLypcblJlbW92ZXMgdGhlIGRlZmF1bHQgc3BhY2luZyBhbmQgYm9yZGVyIGZvciBhcHByb3ByaWF0ZSBlbGVtZW50cy5cbiovXG5cbmJsb2NrcXVvdGUsXG5kbCxcbmRkLFxuaDEsXG5oMixcbmgzLFxuaDQsXG5oNSxcbmg2LFxuaHIsXG5maWd1cmUsXG5wLFxucHJlIHtcbiAgbWFyZ2luOiAwO1xufVxuXG5maWVsZHNldCB7XG4gIG1hcmdpbjogMDtcbiAgcGFkZGluZzogMDtcbn1cblxubGVnZW5kIHtcbiAgcGFkZGluZzogMDtcbn1cblxub2wsXG51bCxcbm1lbnUge1xuICBsaXN0LXN0eWxlOiBub25lO1xuICBtYXJnaW46IDA7XG4gIHBhZGRpbmc6IDA7XG59XG5cbi8qXG5SZXNldCBkZWZhdWx0IHN0eWxpbmcgZm9yIGRpYWxvZ3MuXG4qL1xuZGlhbG9nIHtcbiAgcGFkZGluZzogMDtcbn1cblxuLypcblByZXZlbnQgcmVzaXppbmcgdGV4dGFyZWFzIGhvcml6b250YWxseSBieSBkZWZhdWx0LlxuKi9cblxudGV4dGFyZWEge1xuICByZXNpemU6IHZlcnRpY2FsO1xufVxuXG4vKlxuMS4gUmVzZXQgdGhlIGRlZmF1bHQgcGxhY2Vob2xkZXIgb3BhY2l0eSBpbiBGaXJlZm94LiAoaHR0cHM6Ly9naXRodWIuY29tL3RhaWx3aW5kbGFicy90YWlsd2luZGNzcy9pc3N1ZXMvMzMwMClcbjIuIFNldCB0aGUgZGVmYXVsdCBwbGFjZWhvbGRlciBjb2xvciB0byB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgZ3JheSA0MDAgY29sb3IuXG4qL1xuXG5pbnB1dDo6LW1vei1wbGFjZWhvbGRlciwgdGV4dGFyZWE6Oi1tb3otcGxhY2Vob2xkZXIge1xuICBvcGFjaXR5OiAxOyAvKiAxICovXG4gIGNvbG9yOiAjOWNhM2FmOyAvKiAyICovXG59XG5cbmlucHV0OjpwbGFjZWhvbGRlcixcbnRleHRhcmVhOjpwbGFjZWhvbGRlciB7XG4gIG9wYWNpdHk6IDE7IC8qIDEgKi9cbiAgY29sb3I6ICM5Y2EzYWY7IC8qIDIgKi9cbn1cblxuLypcblNldCB0aGUgZGVmYXVsdCBjdXJzb3IgZm9yIGJ1dHRvbnMuXG4qL1xuXG5idXR0b24sXG5bcm9sZT1cImJ1dHRvblwiXSB7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cblxuLypcbk1ha2Ugc3VyZSBkaXNhYmxlZCBidXR0b25zIGRvbid0IGdldCB0aGUgcG9pbnRlciBjdXJzb3IuXG4qL1xuOmRpc2FibGVkIHtcbiAgY3Vyc29yOiBkZWZhdWx0O1xufVxuXG4vKlxuMS4gTWFrZSByZXBsYWNlZCBlbGVtZW50cyBcXGBkaXNwbGF5OiBibG9ja1xcYCBieSBkZWZhdWx0LiAoaHR0cHM6Ly9naXRodWIuY29tL21vemRldnMvY3NzcmVtZWR5L2lzc3Vlcy8xNClcbjIuIEFkZCBcXGB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlXFxgIHRvIGFsaWduIHJlcGxhY2VkIGVsZW1lbnRzIG1vcmUgc2Vuc2libHkgYnkgZGVmYXVsdC4gKGh0dHBzOi8vZ2l0aHViLmNvbS9qZW5zaW1tb25zL2Nzc3JlbWVkeS9pc3N1ZXMvMTQjaXNzdWVjb21tZW50LTYzNDkzNDIxMClcbiAgIFRoaXMgY2FuIHRyaWdnZXIgYSBwb29ybHkgY29uc2lkZXJlZCBsaW50IGVycm9yIGluIHNvbWUgdG9vbHMgYnV0IGlzIGluY2x1ZGVkIGJ5IGRlc2lnbi5cbiovXG5cbmltZyxcbnN2ZyxcbnZpZGVvLFxuY2FudmFzLFxuYXVkaW8sXG5pZnJhbWUsXG5lbWJlZCxcbm9iamVjdCB7XG4gIGRpc3BsYXk6IGJsb2NrOyAvKiAxICovXG4gIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7IC8qIDIgKi9cbn1cblxuLypcbkNvbnN0cmFpbiBpbWFnZXMgYW5kIHZpZGVvcyB0byB0aGUgcGFyZW50IHdpZHRoIGFuZCBwcmVzZXJ2ZSB0aGVpciBpbnRyaW5zaWMgYXNwZWN0IHJhdGlvLiAoaHR0cHM6Ly9naXRodWIuY29tL21vemRldnMvY3NzcmVtZWR5L2lzc3Vlcy8xNClcbiovXG5cbmltZyxcbnZpZGVvIHtcbiAgbWF4LXdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IGF1dG87XG59XG5cbi8qIE1ha2UgZWxlbWVudHMgd2l0aCB0aGUgSFRNTCBoaWRkZW4gYXR0cmlidXRlIHN0YXkgaGlkZGVuIGJ5IGRlZmF1bHQgKi9cbltoaWRkZW5dIHtcbiAgZGlzcGxheTogbm9uZTtcbn1cblxuKiwgOjpiZWZvcmUsIDo6YWZ0ZXIge1xuICAtLXR3LWJvcmRlci1zcGFjaW5nLXg6IDA7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteTogMDtcbiAgLS10dy10cmFuc2xhdGUteDogMDtcbiAgLS10dy10cmFuc2xhdGUteTogMDtcbiAgLS10dy1yb3RhdGU6IDA7XG4gIC0tdHctc2tldy14OiAwO1xuICAtLXR3LXNrZXcteTogMDtcbiAgLS10dy1zY2FsZS14OiAxO1xuICAtLXR3LXNjYWxlLXk6IDE7XG4gIC0tdHctcGFuLXg6ICA7XG4gIC0tdHctcGFuLXk6ICA7XG4gIC0tdHctcGluY2gtem9vbTogIDtcbiAgLS10dy1zY3JvbGwtc25hcC1zdHJpY3RuZXNzOiBwcm94aW1pdHk7XG4gIC0tdHctZ3JhZGllbnQtZnJvbS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC12aWEtcG9zaXRpb246ICA7XG4gIC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb246ICA7XG4gIC0tdHctb3JkaW5hbDogIDtcbiAgLS10dy1zbGFzaGVkLXplcm86ICA7XG4gIC0tdHctbnVtZXJpYy1maWd1cmU6ICA7XG4gIC0tdHctbnVtZXJpYy1zcGFjaW5nOiAgO1xuICAtLXR3LW51bWVyaWMtZnJhY3Rpb246ICA7XG4gIC0tdHctcmluZy1pbnNldDogIDtcbiAgLS10dy1yaW5nLW9mZnNldC13aWR0aDogMHB4O1xuICAtLXR3LXJpbmctb2Zmc2V0LWNvbG9yOiAjZmZmO1xuICAtLXR3LXJpbmctY29sb3I6IHJnYig1OSAxMzAgMjQ2IC8gMC41KTtcbiAgLS10dy1yaW5nLW9mZnNldC1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1yaW5nLXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdy1jb2xvcmVkOiAwIDAgIzAwMDA7XG4gIC0tdHctYmx1cjogIDtcbiAgLS10dy1icmlnaHRuZXNzOiAgO1xuICAtLXR3LWNvbnRyYXN0OiAgO1xuICAtLXR3LWdyYXlzY2FsZTogIDtcbiAgLS10dy1odWUtcm90YXRlOiAgO1xuICAtLXR3LWludmVydDogIDtcbiAgLS10dy1zYXR1cmF0ZTogIDtcbiAgLS10dy1zZXBpYTogIDtcbiAgLS10dy1kcm9wLXNoYWRvdzogIDtcbiAgLS10dy1iYWNrZHJvcC1ibHVyOiAgO1xuICAtLXR3LWJhY2tkcm9wLWJyaWdodG5lc3M6ICA7XG4gIC0tdHctYmFja2Ryb3AtY29udHJhc3Q6ICA7XG4gIC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlOiAgO1xuICAtLXR3LWJhY2tkcm9wLWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaW52ZXJ0OiAgO1xuICAtLXR3LWJhY2tkcm9wLW9wYWNpdHk6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2F0dXJhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2VwaWE6ICA7XG59XG5cbjo6YmFja2Ryb3Age1xuICAtLXR3LWJvcmRlci1zcGFjaW5nLXg6IDA7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteTogMDtcbiAgLS10dy10cmFuc2xhdGUteDogMDtcbiAgLS10dy10cmFuc2xhdGUteTogMDtcbiAgLS10dy1yb3RhdGU6IDA7XG4gIC0tdHctc2tldy14OiAwO1xuICAtLXR3LXNrZXcteTogMDtcbiAgLS10dy1zY2FsZS14OiAxO1xuICAtLXR3LXNjYWxlLXk6IDE7XG4gIC0tdHctcGFuLXg6ICA7XG4gIC0tdHctcGFuLXk6ICA7XG4gIC0tdHctcGluY2gtem9vbTogIDtcbiAgLS10dy1zY3JvbGwtc25hcC1zdHJpY3RuZXNzOiBwcm94aW1pdHk7XG4gIC0tdHctZ3JhZGllbnQtZnJvbS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC12aWEtcG9zaXRpb246ICA7XG4gIC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb246ICA7XG4gIC0tdHctb3JkaW5hbDogIDtcbiAgLS10dy1zbGFzaGVkLXplcm86ICA7XG4gIC0tdHctbnVtZXJpYy1maWd1cmU6ICA7XG4gIC0tdHctbnVtZXJpYy1zcGFjaW5nOiAgO1xuICAtLXR3LW51bWVyaWMtZnJhY3Rpb246ICA7XG4gIC0tdHctcmluZy1pbnNldDogIDtcbiAgLS10dy1yaW5nLW9mZnNldC13aWR0aDogMHB4O1xuICAtLXR3LXJpbmctb2Zmc2V0LWNvbG9yOiAjZmZmO1xuICAtLXR3LXJpbmctY29sb3I6IHJnYig1OSAxMzAgMjQ2IC8gMC41KTtcbiAgLS10dy1yaW5nLW9mZnNldC1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1yaW5nLXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdy1jb2xvcmVkOiAwIDAgIzAwMDA7XG4gIC0tdHctYmx1cjogIDtcbiAgLS10dy1icmlnaHRuZXNzOiAgO1xuICAtLXR3LWNvbnRyYXN0OiAgO1xuICAtLXR3LWdyYXlzY2FsZTogIDtcbiAgLS10dy1odWUtcm90YXRlOiAgO1xuICAtLXR3LWludmVydDogIDtcbiAgLS10dy1zYXR1cmF0ZTogIDtcbiAgLS10dy1zZXBpYTogIDtcbiAgLS10dy1kcm9wLXNoYWRvdzogIDtcbiAgLS10dy1iYWNrZHJvcC1ibHVyOiAgO1xuICAtLXR3LWJhY2tkcm9wLWJyaWdodG5lc3M6ICA7XG4gIC0tdHctYmFja2Ryb3AtY29udHJhc3Q6ICA7XG4gIC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlOiAgO1xuICAtLXR3LWJhY2tkcm9wLWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaW52ZXJ0OiAgO1xuICAtLXR3LWJhY2tkcm9wLW9wYWNpdHk6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2F0dXJhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2VwaWE6ICA7XG59XG4uY29udGFpbmVyIHtcbiAgd2lkdGg6IDEwMCU7XG59XG5AbWVkaWEgKG1pbi13aWR0aDogNjQwcHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDY0MHB4O1xuICB9XG59XG5AbWVkaWEgKG1pbi13aWR0aDogNzY4cHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDc2OHB4O1xuICB9XG59XG5AbWVkaWEgKG1pbi13aWR0aDogMTAyNHB4KSB7XG5cbiAgLmNvbnRhaW5lciB7XG4gICAgbWF4LXdpZHRoOiAxMDI0cHg7XG4gIH1cbn1cbkBtZWRpYSAobWluLXdpZHRoOiAxMjgwcHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDEyODBweDtcbiAgfVxufVxuQG1lZGlhIChtaW4td2lkdGg6IDE1MzZweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogMTUzNnB4O1xuICB9XG59XG4ucG9pbnRlci1ldmVudHMtbm9uZSB7XG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuLnZpc2libGUge1xuICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xufVxuLmNvbGxhcHNlIHtcbiAgdmlzaWJpbGl0eTogY29sbGFwc2U7XG59XG4ucmVsYXRpdmUge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG59XG4ubS01IHtcbiAgbWFyZ2luOiAxLjI1cmVtO1xufVxuLm0tOCB7XG4gIG1hcmdpbjogMnJlbTtcbn1cbi5tbC0xMCB7XG4gIG1hcmdpbi1sZWZ0OiAyLjVyZW07XG59XG4ubWwtOCB7XG4gIG1hcmdpbi1sZWZ0OiAycmVtO1xufVxuLmJsb2NrIHtcbiAgZGlzcGxheTogYmxvY2s7XG59XG4uZmxleCB7XG4gIGRpc3BsYXk6IGZsZXg7XG59XG4udGFibGUge1xuICBkaXNwbGF5OiB0YWJsZTtcbn1cbi5ncmlkIHtcbiAgZGlzcGxheTogZ3JpZDtcbn1cbi5jb250ZW50cyB7XG4gIGRpc3BsYXk6IGNvbnRlbnRzO1xufVxuLmhpZGRlbiB7XG4gIGRpc3BsYXk6IG5vbmU7XG59XG4uaC0xIHtcbiAgaGVpZ2h0OiAwLjI1cmVtO1xufVxuLmgtMVxcXFwvNSB7XG4gIGhlaWdodDogMjAlO1xufVxuLmgtNCB7XG4gIGhlaWdodDogMXJlbTtcbn1cbi5oLTRcXFxcLzUge1xuICBoZWlnaHQ6IDgwJTtcbn1cbi5oLTQwIHtcbiAgaGVpZ2h0OiAxMHJlbTtcbn1cbi5oLTYge1xuICBoZWlnaHQ6IDEuNXJlbTtcbn1cbi5oLW1heCB7XG4gIGhlaWdodDogLW1vei1tYXgtY29udGVudDtcbiAgaGVpZ2h0OiBtYXgtY29udGVudDtcbn1cbi53LTEge1xuICB3aWR0aDogMC4yNXJlbTtcbn1cbi53LTFcXFxcLzIge1xuICB3aWR0aDogNTAlO1xufVxuLnctNCB7XG4gIHdpZHRoOiAxcmVtO1xufVxuLnctNFxcXFwvMTIge1xuICB3aWR0aDogMzMuMzMzMzMzJTtcbn1cbi53LTYge1xuICB3aWR0aDogMS41cmVtO1xufVxuLnctYXV0byB7XG4gIHdpZHRoOiBhdXRvO1xufVxuLnctZnVsbCB7XG4gIHdpZHRoOiAxMDAlO1xufVxuLm1pbi13LTQ0IHtcbiAgbWluLXdpZHRoOiAxMXJlbTtcbn1cbi5taW4tdy1tYXgge1xuICBtaW4td2lkdGg6IC1tb3otbWF4LWNvbnRlbnQ7XG4gIG1pbi13aWR0aDogbWF4LWNvbnRlbnQ7XG59XG4ubWluLXctbWluIHtcbiAgbWluLXdpZHRoOiAtbW96LW1pbi1jb250ZW50O1xuICBtaW4td2lkdGg6IG1pbi1jb250ZW50O1xufVxuLmZsZXgtMSB7XG4gIGZsZXg6IDEgMSAwJTtcbn1cbi5mbGV4LW5vbmUge1xuICBmbGV4OiBub25lO1xufVxuLmJvcmRlci1jb2xsYXBzZSB7XG4gIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XG59XG4udHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUodmFyKC0tdHctdHJhbnNsYXRlLXgpLCB2YXIoLS10dy10cmFuc2xhdGUteSkpIHJvdGF0ZSh2YXIoLS10dy1yb3RhdGUpKSBza2V3WCh2YXIoLS10dy1za2V3LXgpKSBza2V3WSh2YXIoLS10dy1za2V3LXkpKSBzY2FsZVgodmFyKC0tdHctc2NhbGUteCkpIHNjYWxlWSh2YXIoLS10dy1zY2FsZS15KSk7XG59XG4uY3Vyc29yLWRlZmF1bHQge1xuICBjdXJzb3I6IGRlZmF1bHQ7XG59XG4uY3Vyc29yLWhlbHAge1xuICBjdXJzb3I6IGhlbHA7XG59XG4uY3Vyc29yLXBvaW50ZXIge1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uY3Vyc29yLXRleHQge1xuICBjdXJzb3I6IHRleHQ7XG59XG4ucmVzaXplIHtcbiAgcmVzaXplOiBib3RoO1xufVxuLmF1dG8tcm93cy1taW4ge1xuICBncmlkLWF1dG8tcm93czogbWluLWNvbnRlbnQ7XG59XG4uZ3JpZC1jb2xzLTExIHtcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMTEsIG1pbm1heCgwLCAxZnIpKTtcbn1cbi5mbGV4LXJvdyB7XG4gIGZsZXgtZGlyZWN0aW9uOiByb3c7XG59XG4uZmxleC1jb2wge1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xufVxuLml0ZW1zLWNlbnRlciB7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG4uanVzdGlmeS1zdGFydCB7XG4gIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcbn1cbi5qdXN0aWZ5LWNlbnRlciB7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xufVxuLmp1c3RpZnktYmV0d2VlbiB7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2Vlbjtcbn1cbi5qdXN0aWZ5LWFyb3VuZCB7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYXJvdW5kO1xufVxuLmdhcC0xIHtcbiAgZ2FwOiAwLjI1cmVtO1xufVxuLmdhcC0xMCB7XG4gIGdhcDogMi41cmVtO1xufVxuLmdhcC0yIHtcbiAgZ2FwOiAwLjVyZW07XG59XG4uZ2FwLTYge1xuICBnYXA6IDEuNXJlbTtcbn1cbi5vdmVyZmxvdy1hdXRvIHtcbiAgb3ZlcmZsb3c6IGF1dG87XG59XG4ucm91bmRlZC1mdWxsIHtcbiAgYm9yZGVyLXJhZGl1czogOTk5OXB4O1xufVxuLnJvdW5kZWQteGwge1xuICBib3JkZXItcmFkaXVzOiAwLjc1cmVtO1xufVxuLmJvcmRlciB7XG4gIGJvcmRlci13aWR0aDogMXB4O1xufVxuLmJvcmRlci1zb2xpZCB7XG4gIGJvcmRlci1zdHlsZTogc29saWQ7XG59XG4uYm9yZGVyLWJsdWUtODAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMzAgNjQgMTc1IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItZ3JheS04MDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigzMSA0MSA1NSAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYm9yZGVyLWdyZWVuLTYwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDIyIDE2MyA3NCAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYm9yZGVyLW9yYW5nZS00MDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigyNTEgMTQ2IDYwIC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItcmVkLTcwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDE4NSAyOCAyOCAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS0yMDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyMjkgMjMxIDIzNSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1ncmF5LTQwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDE1NiAxNjMgMTc1IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWdyYXktODAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMzEgNDEgNTUgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctb3JhbmdlLTQwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDI1MSAxNDYgNjAgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4ucC0xIHtcbiAgcGFkZGluZzogMC4yNXJlbTtcbn1cbi5wLTIge1xuICBwYWRkaW5nOiAwLjVyZW07XG59XG4ucC00IHtcbiAgcGFkZGluZzogMXJlbTtcbn1cbi5wLTYge1xuICBwYWRkaW5nOiAxLjVyZW07XG59XG4ucHgtMyB7XG4gIHBhZGRpbmctbGVmdDogMC43NXJlbTtcbiAgcGFkZGluZy1yaWdodDogMC43NXJlbTtcbn1cbi5weC00IHtcbiAgcGFkZGluZy1sZWZ0OiAxcmVtO1xuICBwYWRkaW5nLXJpZ2h0OiAxcmVtO1xufVxuLnB4LTYge1xuICBwYWRkaW5nLWxlZnQ6IDEuNXJlbTtcbiAgcGFkZGluZy1yaWdodDogMS41cmVtO1xufVxuLnB5LTEge1xuICBwYWRkaW5nLXRvcDogMC4yNXJlbTtcbiAgcGFkZGluZy1ib3R0b206IDAuMjVyZW07XG59XG4ucHktMiB7XG4gIHBhZGRpbmctdG9wOiAwLjVyZW07XG4gIHBhZGRpbmctYm90dG9tOiAwLjVyZW07XG59XG4ucHktNCB7XG4gIHBhZGRpbmctdG9wOiAxcmVtO1xuICBwYWRkaW5nLWJvdHRvbTogMXJlbTtcbn1cbi5wbC0yIHtcbiAgcGFkZGluZy1sZWZ0OiAwLjVyZW07XG59XG4ucGwtNSB7XG4gIHBhZGRpbmctbGVmdDogMS4yNXJlbTtcbn1cbi5wbC04IHtcbiAgcGFkZGluZy1sZWZ0OiAycmVtO1xufVxuLnRleHQtY2VudGVyIHtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xufVxuLnRleHQtc20ge1xuICBmb250LXNpemU6IDAuODc1cmVtO1xuICBsaW5lLWhlaWdodDogMS4yNXJlbTtcbn1cbi50ZXh0LWdyYXktODAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMzEgNDEgNTUgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LWxpbWUtNjAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTAxIDE2MyAxMyAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtb3JhbmdlLTUwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDI0OSAxMTUgMjIgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LW9yYW5nZS02MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigyMzQgODggMTIgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXJlZC01MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigyMzkgNjggNjggLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXJlZC03MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigxODUgMjggMjggLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXJvc2UtNzAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTkwIDE4IDYwIC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1za3ktNjAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMiAxMzIgMTk5IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC10ZWFsLTkwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDE5IDc4IDc0IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udW5kZXJsaW5lIHtcbiAgdGV4dC1kZWNvcmF0aW9uLWxpbmU6IHVuZGVybGluZTtcbn1cbi5vdXRsaW5lIHtcbiAgb3V0bGluZS1zdHlsZTogc29saWQ7XG59XG4uZmlsdGVyIHtcbiAgZmlsdGVyOiB2YXIoLS10dy1ibHVyKSB2YXIoLS10dy1icmlnaHRuZXNzKSB2YXIoLS10dy1jb250cmFzdCkgdmFyKC0tdHctZ3JheXNjYWxlKSB2YXIoLS10dy1odWUtcm90YXRlKSB2YXIoLS10dy1pbnZlcnQpIHZhcigtLXR3LXNhdHVyYXRlKSB2YXIoLS10dy1zZXBpYSkgdmFyKC0tdHctZHJvcC1zaGFkb3cpO1xufVxuLmhvdmVyXFxcXDpiZy1vcmFuZ2UtNTAwOmhvdmVyIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjQ5IDExNSAyMiAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1gLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9zdHlsZXMuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBOztDQUFjLENBQWQ7OztDQUFjOztBQUFkOzs7RUFBQSxzQkFBYyxFQUFkLE1BQWM7RUFBZCxlQUFjLEVBQWQsTUFBYztFQUFkLG1CQUFjLEVBQWQsTUFBYztFQUFkLHFCQUFj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QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsd0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLDJCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLDJCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEscUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsbUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsaUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSxtQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFGbkI7RUFBQSxrQkFFb0I7RUFGcEI7QUFFb0JcIixcInNvdXJjZXNDb250ZW50XCI6W1wiQHRhaWx3aW5kIGJhc2U7XFxuQHRhaWx3aW5kIGNvbXBvbmVudHM7XFxuQHRhaWx3aW5kIHV0aWxpdGllcztcIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107XG5cbiAgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpO1xuICAgICAgfVxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBjb250ZW50ICs9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSk7XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oXCJcIik7XG4gIH07XG5cbiAgLy8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3RcbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cbiAgICB2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGhpcy5sZW5ndGg7IGsrKykge1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2tdWzBdO1xuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBfayA9IDA7IF9rIDwgbW9kdWxlcy5sZW5ndGg7IF9rKyspIHtcbiAgICAgIHZhciBpdGVtID0gW10uY29uY2F0KG1vZHVsZXNbX2tdKTtcbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobWVkaWEpIHtcbiAgICAgICAgaWYgKCFpdGVtWzJdKSB7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHN1cHBvcnRzKSB7XG4gICAgICAgIGlmICghaXRlbVs0XSkge1xuICAgICAgICAgIGl0ZW1bNF0gPSBcIlwiLmNvbmNhdChzdXBwb3J0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzRdID0gc3VwcG9ydHM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBsaXN0O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlbSkge1xuICB2YXIgY29udGVudCA9IGl0ZW1bMV07XG4gIHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcbiAgaWYgKCFjc3NNYXBwaW5nKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHJldHVybiBbY29udGVudF0uY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuICByZXR1cm4gW2NvbnRlbnRdLmpvaW4oXCJcXG5cIik7XG59OyIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi4vbm9kZV9tb2R1bGVzL3Bvc3Rjc3MtbG9hZGVyL2Rpc3QvY2pzLmpzPz9ydWxlU2V0WzFdLnJ1bGVzWzFdLnVzZVsyXSEuL3N0eWxlcy5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi9ub2RlX21vZHVsZXMvcG9zdGNzcy1sb2FkZXIvZGlzdC9janMuanM/P3J1bGVTZXRbMV0ucnVsZXNbMV0udXNlWzJdIS4vc3R5bGVzLmNzc1wiO1xuICAgICAgIGV4cG9ydCBkZWZhdWx0IGNvbnRlbnQgJiYgY29udGVudC5sb2NhbHMgPyBjb250ZW50LmxvY2FscyA6IHVuZGVmaW5lZDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgc3R5bGVzSW5ET00gPSBbXTtcbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRE9NLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRE9NW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXhCeUlkZW50aWZpZXIgPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM10sXG4gICAgICBzdXBwb3J0czogaXRlbVs0XSxcbiAgICAgIGxheWVyOiBpdGVtWzVdXG4gICAgfTtcbiAgICBpZiAoaW5kZXhCeUlkZW50aWZpZXIgIT09IC0xKSB7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0ucmVmZXJlbmNlcysrO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnVwZGF0ZXIob2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHVwZGF0ZXIgPSBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKTtcbiAgICAgIG9wdGlvbnMuYnlJbmRleCA9IGk7XG4gICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoaSwgMCwge1xuICAgICAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuICAgICAgICB1cGRhdGVyOiB1cGRhdGVyLFxuICAgICAgICByZWZlcmVuY2VzOiAxXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuICByZXR1cm4gaWRlbnRpZmllcnM7XG59XG5mdW5jdGlvbiBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKSB7XG4gIHZhciBhcGkgPSBvcHRpb25zLmRvbUFQSShvcHRpb25zKTtcbiAgYXBpLnVwZGF0ZShvYmopO1xuICB2YXIgdXBkYXRlciA9IGZ1bmN0aW9uIHVwZGF0ZXIobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCAmJiBuZXdPYmouc3VwcG9ydHMgPT09IG9iai5zdXBwb3J0cyAmJiBuZXdPYmoubGF5ZXIgPT09IG9iai5sYXllcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhcGkudXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwaS5yZW1vdmUoKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiB1cGRhdGVyO1xufVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG4gICAgdmFyIG5ld0xhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShuZXdMaXN0LCBvcHRpb25zKTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG4gICAgICBpZiAoc3R5bGVzSW5ET01bX2luZGV4XS5yZWZlcmVuY2VzID09PSAwKSB7XG4gICAgICAgIHN0eWxlc0luRE9NW19pbmRleF0udXBkYXRlcigpO1xuICAgICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIG1lbW8gPSB7fTtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBnZXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgdmFyIHN0eWxlVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpO1xuXG4gICAgLy8gU3BlY2lhbCBjYXNlIHRvIHJldHVybiBoZWFkIG9mIGlmcmFtZSBpbnN0ZWFkIG9mIGlmcmFtZSBpdHNlbGZcbiAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICB9XG4gIHJldHVybiBtZW1vW3RhcmdldF07XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0QnlTZWxlY3RvcihpbnNlcnQsIHN0eWxlKSB7XG4gIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQoaW5zZXJ0KTtcbiAgaWYgKCF0YXJnZXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydCcgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuICB9XG4gIHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEJ5U2VsZWN0b3I7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIG9wdGlvbnMuc2V0QXR0cmlidXRlcyhlbGVtZW50LCBvcHRpb25zLmF0dHJpYnV0ZXMpO1xuICBvcHRpb25zLmluc2VydChlbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xuICByZXR1cm4gZWxlbWVudDtcbn1cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0U3R5bGVFbGVtZW50OyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcyhzdHlsZUVsZW1lbnQpIHtcbiAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSBcInVuZGVmaW5lZFwiID8gX193ZWJwYWNrX25vbmNlX18gOiBudWxsO1xuICBpZiAobm9uY2UpIHtcbiAgICBzdHlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibm9uY2VcIiwgbm9uY2UpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlczsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gXCJcIjtcbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KG9iai5zdXBwb3J0cywgXCIpIHtcIik7XG4gIH1cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIkBtZWRpYSBcIi5jb25jYXQob2JqLm1lZGlhLCBcIiB7XCIpO1xuICB9XG4gIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2Ygb2JqLmxheWVyICE9PSBcInVuZGVmaW5lZFwiO1xuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwiQGxheWVyXCIuY29uY2F0KG9iai5sYXllci5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KG9iai5sYXllcikgOiBcIlwiLCBcIiB7XCIpO1xuICB9XG4gIGNzcyArPSBvYmouY3NzO1xuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcbiAgaWYgKHNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9XG5cbiAgLy8gRm9yIG9sZCBJRVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG4gIG9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG59XG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGVFbGVtZW50LnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgc3R5bGVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50KTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBkb21BUEkob3B0aW9ucykge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKCkge30sXG4gICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgfTtcbiAgfVxuICB2YXIgc3R5bGVFbGVtZW50ID0gb3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gIHJldHVybiB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUob2JqKSB7XG4gICAgICBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaik7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuICAgIH1cbiAgfTtcbn1cbm1vZHVsZS5leHBvcnRzID0gZG9tQVBJOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50KSB7XG4gIGlmIChzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICBzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgIH1cbiAgICBzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gc3R5bGVUYWdUcmFuc2Zvcm07IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHRpZDogbW9kdWxlSWQsXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsInZhciB3ZWJwYWNrUXVldWVzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiID8gU3ltYm9sKFwid2VicGFjayBxdWV1ZXNcIikgOiBcIl9fd2VicGFja19xdWV1ZXNfX1wiO1xudmFyIHdlYnBhY2tFeHBvcnRzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiID8gU3ltYm9sKFwid2VicGFjayBleHBvcnRzXCIpIDogXCJfX3dlYnBhY2tfZXhwb3J0c19fXCI7XG52YXIgd2VicGFja0Vycm9yID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiID8gU3ltYm9sKFwid2VicGFjayBlcnJvclwiKSA6IFwiX193ZWJwYWNrX2Vycm9yX19cIjtcbnZhciByZXNvbHZlUXVldWUgPSAocXVldWUpID0+IHtcblx0aWYocXVldWUgJiYgcXVldWUuZCA8IDEpIHtcblx0XHRxdWV1ZS5kID0gMTtcblx0XHRxdWV1ZS5mb3JFYWNoKChmbikgPT4gKGZuLnItLSkpO1xuXHRcdHF1ZXVlLmZvckVhY2goKGZuKSA9PiAoZm4uci0tID8gZm4ucisrIDogZm4oKSkpO1xuXHR9XG59XG52YXIgd3JhcERlcHMgPSAoZGVwcykgPT4gKGRlcHMubWFwKChkZXApID0+IHtcblx0aWYoZGVwICE9PSBudWxsICYmIHR5cGVvZiBkZXAgPT09IFwib2JqZWN0XCIpIHtcblx0XHRpZihkZXBbd2VicGFja1F1ZXVlc10pIHJldHVybiBkZXA7XG5cdFx0aWYoZGVwLnRoZW4pIHtcblx0XHRcdHZhciBxdWV1ZSA9IFtdO1xuXHRcdFx0cXVldWUuZCA9IDA7XG5cdFx0XHRkZXAudGhlbigocikgPT4ge1xuXHRcdFx0XHRvYmpbd2VicGFja0V4cG9ydHNdID0gcjtcblx0XHRcdFx0cmVzb2x2ZVF1ZXVlKHF1ZXVlKTtcblx0XHRcdH0sIChlKSA9PiB7XG5cdFx0XHRcdG9ialt3ZWJwYWNrRXJyb3JdID0gZTtcblx0XHRcdFx0cmVzb2x2ZVF1ZXVlKHF1ZXVlKTtcblx0XHRcdH0pO1xuXHRcdFx0dmFyIG9iaiA9IHt9O1xuXHRcdFx0b2JqW3dlYnBhY2tRdWV1ZXNdID0gKGZuKSA9PiAoZm4ocXVldWUpKTtcblx0XHRcdHJldHVybiBvYmo7XG5cdFx0fVxuXHR9XG5cdHZhciByZXQgPSB7fTtcblx0cmV0W3dlYnBhY2tRdWV1ZXNdID0geCA9PiB7fTtcblx0cmV0W3dlYnBhY2tFeHBvcnRzXSA9IGRlcDtcblx0cmV0dXJuIHJldDtcbn0pKTtcbl9fd2VicGFja19yZXF1aXJlX18uYSA9IChtb2R1bGUsIGJvZHksIGhhc0F3YWl0KSA9PiB7XG5cdHZhciBxdWV1ZTtcblx0aGFzQXdhaXQgJiYgKChxdWV1ZSA9IFtdKS5kID0gLTEpO1xuXHR2YXIgZGVwUXVldWVzID0gbmV3IFNldCgpO1xuXHR2YXIgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzO1xuXHR2YXIgY3VycmVudERlcHM7XG5cdHZhciBvdXRlclJlc29sdmU7XG5cdHZhciByZWplY3Q7XG5cdHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlaikgPT4ge1xuXHRcdHJlamVjdCA9IHJlajtcblx0XHRvdXRlclJlc29sdmUgPSByZXNvbHZlO1xuXHR9KTtcblx0cHJvbWlzZVt3ZWJwYWNrRXhwb3J0c10gPSBleHBvcnRzO1xuXHRwcm9taXNlW3dlYnBhY2tRdWV1ZXNdID0gKGZuKSA9PiAocXVldWUgJiYgZm4ocXVldWUpLCBkZXBRdWV1ZXMuZm9yRWFjaChmbiksIHByb21pc2VbXCJjYXRjaFwiXSh4ID0+IHt9KSk7XG5cdG1vZHVsZS5leHBvcnRzID0gcHJvbWlzZTtcblx0Ym9keSgoZGVwcykgPT4ge1xuXHRcdGN1cnJlbnREZXBzID0gd3JhcERlcHMoZGVwcyk7XG5cdFx0dmFyIGZuO1xuXHRcdHZhciBnZXRSZXN1bHQgPSAoKSA9PiAoY3VycmVudERlcHMubWFwKChkKSA9PiB7XG5cdFx0XHRpZihkW3dlYnBhY2tFcnJvcl0pIHRocm93IGRbd2VicGFja0Vycm9yXTtcblx0XHRcdHJldHVybiBkW3dlYnBhY2tFeHBvcnRzXTtcblx0XHR9KSlcblx0XHR2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cdFx0XHRmbiA9ICgpID0+IChyZXNvbHZlKGdldFJlc3VsdCkpO1xuXHRcdFx0Zm4uciA9IDA7XG5cdFx0XHR2YXIgZm5RdWV1ZSA9IChxKSA9PiAocSAhPT0gcXVldWUgJiYgIWRlcFF1ZXVlcy5oYXMocSkgJiYgKGRlcFF1ZXVlcy5hZGQocSksIHEgJiYgIXEuZCAmJiAoZm4ucisrLCBxLnB1c2goZm4pKSkpO1xuXHRcdFx0Y3VycmVudERlcHMubWFwKChkZXApID0+IChkZXBbd2VicGFja1F1ZXVlc10oZm5RdWV1ZSkpKTtcblx0XHR9KTtcblx0XHRyZXR1cm4gZm4uciA/IHByb21pc2UgOiBnZXRSZXN1bHQoKTtcblx0fSwgKGVycikgPT4gKChlcnIgPyByZWplY3QocHJvbWlzZVt3ZWJwYWNrRXJyb3JdID0gZXJyKSA6IG91dGVyUmVzb2x2ZShleHBvcnRzKSksIHJlc29sdmVRdWV1ZShxdWV1ZSkpKTtcblx0cXVldWUgJiYgcXVldWUuZCA8IDAgJiYgKHF1ZXVlLmQgPSAwKTtcbn07IiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5uYyA9IHVuZGVmaW5lZDsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIHVzZWQgJ21vZHVsZScgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvaW5kZXguanNcIik7XG4iLCIiXSwibmFtZXMiOlsiR2FtZWJvYXJkIiwiZ3JpZCIsInNoaXBzVG9QbGFjZSIsInNoaXBUeXBlIiwic2hpcExlbmd0aCIsImN1cnJlbnRPcmllbnRhdGlvbiIsImN1cnJlbnRTaGlwIiwibGFzdEhvdmVyZWRDZWxsIiwicGxhY2VTaGlwR3VpZGUiLCJwcm9tcHQiLCJwcm9tcHRUeXBlIiwiZ2FtZXBsYXlHdWlkZSIsInR1cm5Qcm9tcHQiLCJwcm9jZXNzQ29tbWFuZCIsImNvbW1hbmQiLCJpc01vdmUiLCJwYXJ0cyIsInNwbGl0IiwibGVuZ3RoIiwiRXJyb3IiLCJncmlkUG9zaXRpb24iLCJ0b1VwcGVyQ2FzZSIsInZhbGlkR3JpZFBvc2l0aW9ucyIsImZsYXQiLCJpbmNsdWRlcyIsInJlc3VsdCIsIm9yaWVudGF0aW9uIiwidG9Mb3dlckNhc2UiLCJ1cGRhdGVPdXRwdXQiLCJtZXNzYWdlIiwidHlwZSIsIm91dHB1dCIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJtZXNzYWdlRWxlbWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ0ZXh0Q29udGVudCIsImNsYXNzTGlzdCIsImFkZCIsImFwcGVuZENoaWxkIiwic2Nyb2xsVG9wIiwic2Nyb2xsSGVpZ2h0IiwiY29uc29sZUxvZ1BsYWNlbWVudENvbW1hbmQiLCJkaXJGZWViYWNrIiwiY2hhckF0Iiwic2xpY2UiLCJjb25zb2xlIiwibG9nIiwidmFsdWUiLCJjb25zb2xlTG9nTW92ZUNvbW1hbmQiLCJyZXN1bHRzT2JqZWN0IiwicGxheWVyIiwibW92ZSIsImhpdCIsImNvbnNvbGVMb2dFcnJvciIsImVycm9yIiwiaW5pdFVpTWFuYWdlciIsInVpTWFuYWdlciIsImluaXRDb25zb2xlVUkiLCJjcmVhdGVHYW1lYm9hcmQiLCJjYWxjdWxhdGVTaGlwQ2VsbHMiLCJzdGFydENlbGwiLCJjZWxsSWRzIiwicm93SW5kZXgiLCJjaGFyQ29kZUF0IiwiY29sSW5kZXgiLCJwYXJzZUludCIsInN1YnN0cmluZyIsImkiLCJwdXNoIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwiaGlnaGxpZ2h0Q2VsbHMiLCJmb3JFYWNoIiwiY2VsbElkIiwiY2VsbEVsZW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiY2xlYXJIaWdobGlnaHQiLCJyZW1vdmUiLCJ0b2dnbGVPcmllbnRhdGlvbiIsImhhbmRsZVBsYWNlbWVudEhvdmVyIiwiZSIsImNlbGwiLCJ0YXJnZXQiLCJjb250YWlucyIsImRhdGFzZXQiLCJjZWxsUG9zIiwicG9zaXRpb24iLCJjZWxsc1RvSGlnaGxpZ2h0IiwiaGFuZGxlTW91c2VMZWF2ZSIsImNlbGxzVG9DbGVhciIsImhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlIiwia2V5IiwicHJldmVudERlZmF1bHQiLCJvbGRDZWxsc1RvQ2xlYXIiLCJuZXdDZWxsc1RvSGlnaGxpZ2h0IiwiZW5hYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlciIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJkaXNhYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlciIsImRpc2FibGVIdW1hbkdhbWVib2FyZEhvdmVyIiwic3dpdGNoR2FtZWJvYXJkSG92ZXJTdGF0ZXMiLCJzZXR1cEdhbWVib2FyZEZvclBsYWNlbWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJnYW1lYm9hcmRBcmVhIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImNsZWFudXBBZnRlclBsYWNlbWVudCIsInN0YXJ0R2FtZSIsImdhbWUiLCJzZXRVcCIsImRpc3BsYXlQcm9tcHQiLCJoYW5kbGVIdW1hbk1vdmUiLCJkYXRhIiwic2V0dXBHYW1lYm9hcmRGb3JQbGF5ZXJNb3ZlIiwicGxheWVyTW92ZSIsImNvbXB1dGVyTW92ZSIsImh1bWFuUGxheWVyR2FtZWJvYXJkIiwiY29tcFBsYXllciIsImNvbXBNb3ZlUmVzdWx0IiwibWFrZU1vdmUiLCJjaGVja1dpbkNvbmRpdGlvbiIsImNvbmNsdWRlR2FtZSIsIkFjdGlvbkNvbnRyb2xsZXIiLCJodW1hblBsYXllciIsInBsYXllcnMiLCJodW1hbiIsImdhbWVib2FyZCIsImNvbXB1dGVyIiwiY29tcFBsYXllckdhbWVib2FyZCIsInNldHVwRXZlbnRMaXN0ZW5lcnMiLCJoYW5kbGVyRnVuY3Rpb24iLCJwbGF5ZXJUeXBlIiwiY2xlYW51cEZ1bmN0aW9ucyIsImNvbnNvbGVTdWJtaXRCdXR0b24iLCJjb25zb2xlSW5wdXQiLCJzdWJtaXRIYW5kbGVyIiwiaW5wdXQiLCJrZXlwcmVzc0hhbmRsZXIiLCJjbGlja0hhbmRsZXIiLCJjbGVhbnVwIiwicHJvbXB0QW5kUGxhY2VTaGlwIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJmaW5kIiwic2hpcCIsInBsYWNlU2hpcFByb21wdCIsImhhbmRsZVZhbGlkSW5wdXQiLCJwbGFjZVNoaXAiLCJyZW5kZXJTaGlwQm9hcmQiLCJyZW5kZXJTaGlwRGlzcCIsInJlc29sdmVTaGlwUGxhY2VtZW50Iiwic2V0dXBTaGlwc1NlcXVlbnRpYWxseSIsImhhbmRsZVNldHVwIiwicHJvbXB0UGxheWVyTW92ZSIsImh1bWFuTW92ZVJlc3VsdCIsInVuZGVmaW5lZCIsImhhbmRsZVZhbGlkTW92ZSIsInJlc29sdmVNb3ZlIiwicGxheUdhbWUiLCJnYW1lT3ZlciIsImxhc3RDb21wTW92ZVJlc3VsdCIsImxhc3RIdW1hbk1vdmVSZXN1bHQiLCJkaXIiLCJjdXJyZW50UGxheWVyIiwiT3ZlcmxhcHBpbmdTaGlwc0Vycm9yIiwiY29uc3RydWN0b3IiLCJuYW1lIiwiU2hpcEFsbG9jYXRpb25SZWFjaGVkRXJyb3IiLCJTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IiLCJJbnZhbGlkU2hpcExlbmd0aEVycm9yIiwiSW52YWxpZFNoaXBUeXBlRXJyb3IiLCJJbnZhbGlkUGxheWVyVHlwZUVycm9yIiwiU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IiLCJSZXBlYXRBdHRhY2tlZEVycm9yIiwiSW52YWxpZE1vdmVFbnRyeUVycm9yIiwiUGxheWVyIiwiU2hpcCIsIkdhbWUiLCJodW1hbkdhbWVib2FyZCIsImNvbXB1dGVyR2FtZWJvYXJkIiwiY29tcHV0ZXJQbGF5ZXIiLCJnYW1lT3ZlclN0YXRlIiwicGxhY2VTaGlwcyIsImVuZEdhbWUiLCJ0YWtlVHVybiIsImZlZWRiYWNrIiwib3Bwb25lbnQiLCJpc1NoaXBTdW5rIiwiZ2FtZVdvbiIsImNoZWNrQWxsU2hpcHNTdW5rIiwiaW5kZXhDYWxjcyIsInN0YXJ0IiwiY29sTGV0dGVyIiwicm93TnVtYmVyIiwiY2hlY2tUeXBlIiwic2hpcFBvc2l0aW9ucyIsIk9iamVjdCIsImtleXMiLCJleGlzdGluZ1NoaXBUeXBlIiwiY2hlY2tCb3VuZGFyaWVzIiwiY29vcmRzIiwiZGlyZWN0aW9uIiwieExpbWl0IiwieUxpbWl0IiwieCIsInkiLCJjYWxjdWxhdGVTaGlwUG9zaXRpb25zIiwicG9zaXRpb25zIiwiY2hlY2tGb3JPdmVybGFwIiwiZW50cmllcyIsImV4aXN0aW5nU2hpcFBvc2l0aW9ucyIsInNvbWUiLCJjaGVja0ZvckhpdCIsImZvdW5kU2hpcCIsIl8iLCJzaGlwRmFjdG9yeSIsInNoaXBzIiwiaGl0UG9zaXRpb25zIiwiYXR0YWNrTG9nIiwibmV3U2hpcCIsImF0dGFjayIsInJlc3BvbnNlIiwiY2hlY2tSZXN1bHRzIiwiaXNTdW5rIiwiZXZlcnkiLCJzaGlwUmVwb3J0IiwiZmxvYXRpbmdTaGlwcyIsImZpbHRlciIsIm1hcCIsImdldFNoaXAiLCJnZXRTaGlwUG9zaXRpb25zIiwiZ2V0SGl0UG9zaXRpb25zIiwiVWlNYW5hZ2VyIiwibmV3VWlNYW5hZ2VyIiwibmV3R2FtZSIsImFjdENvbnRyb2xsZXIiLCJjaGVja01vdmUiLCJnYkdyaWQiLCJ2YWxpZCIsImVsIiwicCIsInJhbmRNb3ZlIiwibW92ZUxvZyIsImFsbE1vdmVzIiwiZmxhdE1hcCIsInJvdyIsInBvc3NpYmxlTW92ZXMiLCJyYW5kb21Nb3ZlIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiZ2VuZXJhdGVSYW5kb21TdGFydCIsInNpemUiLCJ2YWxpZFN0YXJ0cyIsImNvbCIsInJhbmRvbUluZGV4IiwiYXV0b1BsYWNlbWVudCIsInNoaXBUeXBlcyIsInBsYWNlZCIsIm9wcEdhbWVib2FyZCIsInNldExlbmd0aCIsImhpdHMiLCJidWlsZFNoaXAiLCJvYmoiLCJkb21TZWwiLCJzaGlwU2VjdHMiLCJzZWN0IiwiY2xhc3NOYW1lIiwic2V0QXR0cmlidXRlIiwiY29udGFpbmVySUQiLCJjb250YWluZXIiLCJncmlkRGl2IiwiY29sdW1ucyIsImhlYWRlciIsInJvd0xhYmVsIiwiaWQiLCJjb25zb2xlQ29udGFpbmVyIiwiaW5wdXREaXYiLCJzdWJtaXRCdXR0b24iLCJwcm9tcHRPYmpzIiwiZGlzcGxheSIsImZpcnN0Q2hpbGQiLCJyZW1vdmVDaGlsZCIsInByb21wdERpdiIsInBsYXllck9iaiIsImlkU2VsIiwiZGlzcERpdiIsInNoaXBEaXYiLCJ0aXRsZSIsInNlY3RzRGl2Iiwic2hpcE9iaiIsInNoaXBTZWN0Iiwic2VjdGlvbiJdLCJzb3VyY2VSb290IjoiIn0=