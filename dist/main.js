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
const startGame = async (uiManager, game) => {
  // Set up the game by auto placing computer's ships and setting the
  // current player to the human player
  await game.setUp();

  // Render the ship display for the computer player
  shipsToPlace.forEach(ship => {
    uiManager.renderShipDisp(game.players.computer, ship.shipType);
  });

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

    // Start the game
    await startGame(uiManager, game);
    const output = document.getElementById("console-output");
    updateOutput("> All ships placed, game setup complete!");
    console.log("All ships placed, game setup complete!");
    switchGameboardHoverStates();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQzlEO0FBRUQsTUFBTTZMLFVBQVUsR0FBSUMsS0FBSyxJQUFLO0VBQzVCLE1BQU1DLFNBQVMsR0FBR0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDMUssV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQzFDLE1BQU00SyxTQUFTLEdBQUcvSCxRQUFRLENBQUM2SCxLQUFLLENBQUNsSixLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzs7RUFFaEQsTUFBTW9CLFFBQVEsR0FBRytILFNBQVMsQ0FBQ2hJLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUNBLFVBQVUsQ0FBQyxDQUFDLENBQUMs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QUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsY0FBYztBQUNkLGtCQUFrQjtBQUNsQjs7QUFFQTtBQUNBO0FBQ0EsY0FBYztBQUNkLGtCQUFrQjtBQUNsQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQiwwQkFBMEI7QUFDMUI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLE9BQU8sa0ZBQWtGLFlBQVksTUFBTSxPQUFPLHFCQUFxQixvQkFBb0IscUJBQXFCLHFCQUFxQixNQUFNLE1BQU0sV0FBVyxNQUFNLFlBQVksTUFBTSxNQUFNLHFCQUFxQixxQkFBcUIscUJBQXFCLFVBQVUsb0JBQW9CLHFCQUFxQixxQkFBcUIscUJBQXFCLHFCQUFxQixNQUFNLE9BQU8sTUFBTSxLQUFLLG9CQUFvQixxQkFBcUIsTUFBTSxRQUFRLE1BQU0sS0FBSyxvQkFBb0Isb0JBQW9CLHFCQUFxQixNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsV0FBVyxNQUFNLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxNQUFNLE1BQU0sTUFBTSxLQUFLLFVBQVUsV0FBVyxNQUFNLE1BQU0sTUFBTSxNQUFNLFdBQVcsTUFBTSxTQUFTLE1BQU0sUUFBUSxxQkFBcUIscUJBQXFCLHFCQUFxQixvQkFBb0IsTUFBTSxNQUFNLE1BQU0sS0FBSyxVQUFVLE1BQU0sTUFBTSxNQUFNLE1BQU0sVUFBVSxVQUFVLFdBQVcsV0FBVyxNQUFNLEtBQUssVUFBVSxNQUFNLEtBQUssVUFBVSxNQUFNLFFBQVEsTUFBTSxLQUFLLG9CQUFvQixxQkFBcUIscUJBQXFCLE1BQU0sUUFBUSxNQUFNLFNBQVMscUJBQXFCLHFCQUFxQixxQkFBcUIsb0JBQW9CLHFCQUFxQixxQkFBcUIsb0JBQW9CLG9CQUFvQixvQkFBb0IsTUFBTSxNQUFNLE1BQU0sTUFBTSxXQUFXLE1BQU0sT0FBTyxNQUFNLFFBQVEscUJBQXFCLHFCQUFxQixxQkFBcUIsTUFBTSxNQUFNLE1BQU0sS0FBSyxVQUFVLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLE1BQU0sTUFBTSxVQUFVLE1BQU0sT0FBTyxNQUFNLEtBQUsscUJBQXFCLHFCQUFxQixNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxPQUFPLE1BQU0sS0FBSyxxQkFBcUIsb0JBQW9CLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sTUFBTSxpQkFBaUIsVUFBVSxNQUFNLEtBQUssVUFBVSxVQUFVLE1BQU0sS0FBSyxVQUFVLE1BQU0sT0FBTyxXQUFXLFVBQVUsVUFBVSxNQUFNLE1BQU0sS0FBSyxLQUFLLFVBQVUsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sT0FBTyxNQUFNLEtBQUssb0JBQW9CLG9CQUFvQixNQUFNLE1BQU0sb0JBQW9CLG9CQUFvQixNQUFNLE1BQU0sTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLEtBQUssS0FBSyxVQUFVLE1BQU0sUUFBUSxNQUFNLFlBQVksb0JBQW9CLHFCQUFxQixNQUFNLE1BQU0sTUFBTSxNQUFNLFVBQVUsVUFBVSxNQUFNLFdBQVcsS0FBSyxVQUFVLE1BQU0sS0FBSyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLEtBQUssTUFBTSxLQUFLLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsS0FBSyxLQUFLLEtBQUssS0FBSyxNQUFNLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFN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InNvdXJjZXMiOlsid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9hY3Rpb25Db250cm9sbGVyLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9lcnJvcnMuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2dhbWUuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2dhbWVib2FyZC5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3BsYXllci5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvc2hpcC5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvdWlNYW5hZ2VyLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9zdHlsZXMuY3NzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3N0eWxlcy5jc3M/MGEyNSIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2FzeW5jIG1vZHVsZSIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL25vbmNlIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgR2FtZWJvYXJkIGZyb20gXCIuL2dhbWVib2FyZFwiO1xuXG5jb25zdCB7IGdyaWQgfSA9IEdhbWVib2FyZCgpO1xuXG5jb25zdCBzaGlwc1RvUGxhY2UgPSBbXG4gIHsgc2hpcFR5cGU6IFwiY2FycmllclwiLCBzaGlwTGVuZ3RoOiA1IH0sXG4gIHsgc2hpcFR5cGU6IFwiYmF0dGxlc2hpcFwiLCBzaGlwTGVuZ3RoOiA0IH0sXG4gIHsgc2hpcFR5cGU6IFwic3VibWFyaW5lXCIsIHNoaXBMZW5ndGg6IDMgfSxcbiAgeyBzaGlwVHlwZTogXCJjcnVpc2VyXCIsIHNoaXBMZW5ndGg6IDMgfSxcbiAgeyBzaGlwVHlwZTogXCJkZXN0cm95ZXJcIiwgc2hpcExlbmd0aDogMiB9LFxuXTtcblxubGV0IGN1cnJlbnRPcmllbnRhdGlvbiA9IFwiaFwiOyAvLyBEZWZhdWx0IG9yaWVudGF0aW9uXG5sZXQgY3VycmVudFNoaXA7XG5sZXQgbGFzdEhvdmVyZWRDZWxsID0gbnVsbDsgLy8gU3RvcmUgdGhlIGxhc3QgaG92ZXJlZCBjZWxsJ3MgSURcblxuY29uc3QgcGxhY2VTaGlwR3VpZGUgPSB7XG4gIHByb21wdDpcbiAgICBcIkVudGVyIHRoZSBncmlkIHBvc2l0aW9uIChpLmUuICdBMScpIGFuZCBvcmllbnRhdGlvbiAoJ2gnIGZvciBob3Jpem9udGFsIGFuZCAndicgZm9yIHZlcnRpY2FsKSwgc2VwYXJhdGVkIHdpdGggYSBzcGFjZS4gRm9yIGV4YW1wbGUgJ0EyIHYnLiBBbHRlcm5hdGl2ZWx5LCBvbiB5b3UgZ2FtZWJvYXJkIGNsaWNrIHRoZSBjZWxsIHlvdSB3YW50IHRvIHNldCBhdCB0aGUgc3RhcnRpbmcgcG9pbnQsIHVzZSBzcGFjZWJhciB0byB0b2dnbGUgdGhlIG9yaWVudGF0aW9uLlwiLFxuICBwcm9tcHRUeXBlOiBcImd1aWRlXCIsXG59O1xuXG5jb25zdCBnYW1lcGxheUd1aWRlID0ge1xuICBwcm9tcHQ6XG4gICAgXCJFbnRlciBncmlkIHBvc2l0aW9uIChpLmUuICdBMScpIHlvdSB3YW50IHRvIGF0dGFjay4gQWx0ZXJuYXRpdmVseSwgY2xpY2sgdGhlIGNlbGwgeW91IHdhbnQgdG8gYXR0YWNrIG9uIHRoZSBvcHBvbmVudCdzIGdhbWVib2FyZFwiLFxuICBwcm9tcHRUeXBlOiBcImd1aWRlXCIsXG59O1xuXG5jb25zdCB0dXJuUHJvbXB0ID0ge1xuICBwcm9tcHQ6IFwiTWFrZSB5b3VyIG1vdmUuXCIsXG4gIHByb21wdFR5cGU6IFwiaW5zdHJ1Y3Rpb25cIixcbn07XG5cbmNvbnN0IHByb2Nlc3NDb21tYW5kID0gKGNvbW1hbmQsIGlzTW92ZSkgPT4ge1xuICAvLyBJZiBpc01vdmUgaXMgdHJ1dGh5LCBhc3NpZ24gYXMgc2luZ2xlIGl0ZW0gYXJyYXksIG90aGVyd2lzZSBzcGxpdCB0aGUgY29tbWFuZCBieSBzcGFjZVxuICBjb25zdCBwYXJ0cyA9IGlzTW92ZSA/IFtjb21tYW5kXSA6IGNvbW1hbmQuc3BsaXQoXCIgXCIpO1xuICBpZiAoIWlzTW92ZSAmJiBwYXJ0cy5sZW5ndGggIT09IDIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIkludmFsaWQgY29tbWFuZCBmb3JtYXQuIFBsZWFzZSB1c2UgdGhlIGZvcm1hdCAnR3JpZFBvc2l0aW9uIE9yaWVudGF0aW9uJy5cIixcbiAgICApO1xuICB9XG5cbiAgLy8gUHJvY2VzcyBhbmQgdmFsaWRhdGUgdGhlIGdyaWQgcG9zaXRpb25cbiAgY29uc3QgZ3JpZFBvc2l0aW9uID0gcGFydHNbMF0udG9VcHBlckNhc2UoKTtcbiAgaWYgKGdyaWRQb3NpdGlvbi5sZW5ndGggPCAyIHx8IGdyaWRQb3NpdGlvbi5sZW5ndGggPiAzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBncmlkIHBvc2l0aW9uLiBNdXN0IGJlIDIgdG8gMyBjaGFyYWN0ZXJzIGxvbmcuXCIpO1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgZ3JpZCBwb3NpdGlvbiBhZ2FpbnN0IHRoZSBncmlkIG1hdHJpeFxuICBjb25zdCB2YWxpZEdyaWRQb3NpdGlvbnMgPSBncmlkLmZsYXQoKTsgLy8gRmxhdHRlbiB0aGUgZ3JpZCBmb3IgZWFzaWVyIHNlYXJjaGluZ1xuICBpZiAoIXZhbGlkR3JpZFBvc2l0aW9ucy5pbmNsdWRlcyhncmlkUG9zaXRpb24pKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgXCJJbnZhbGlkIGdyaWQgcG9zaXRpb24uIERvZXMgbm90IG1hdGNoIGFueSB2YWxpZCBncmlkIHZhbHVlcy5cIixcbiAgICApO1xuICB9XG5cbiAgY29uc3QgcmVzdWx0ID0geyBncmlkUG9zaXRpb24gfTtcblxuICBpZiAoIWlzTW92ZSkge1xuICAgIC8vIFByb2Nlc3MgYW5kIHZhbGlkYXRlIHRoZSBvcmllbnRhdGlvblxuICAgIGNvbnN0IG9yaWVudGF0aW9uID0gcGFydHNbMV0udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAob3JpZW50YXRpb24gIT09IFwiaFwiICYmIG9yaWVudGF0aW9uICE9PSBcInZcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBcIkludmFsaWQgb3JpZW50YXRpb24uIE11c3QgYmUgZWl0aGVyICdoJyBmb3IgaG9yaXpvbnRhbCBvciAndicgZm9yIHZlcnRpY2FsLlwiLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXN1bHQub3JpZW50YXRpb24gPSBvcmllbnRhdGlvbjtcbiAgfVxuXG4gIC8vIFJldHVybiB0aGUgcHJvY2Vzc2VkIGFuZCB2YWxpZGF0ZWQgY29tbWFuZCBwYXJ0c1xuICByZXR1cm4gcmVzdWx0O1xufTtcblxuLy8gVGhlIGZ1bmN0aW9uIGZvciB1cGRhdGluZyB0aGUgb3V0cHV0IGRpdiBlbGVtZW50XG5jb25zdCB1cGRhdGVPdXRwdXQgPSAobWVzc2FnZSwgdHlwZSkgPT4ge1xuICAvLyBHZXQgdGhlIG91cHV0IGVsZW1lbnRcbiAgY29uc3Qgb3V0cHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLW91dHB1dFwiKTtcblxuICAvLyBBcHBlbmQgbmV3IG1lc3NhZ2VcbiAgY29uc3QgbWVzc2FnZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpOyAvLyBDcmVhdGUgYSBuZXcgZGl2IGZvciB0aGUgbWVzc2FnZVxuICBtZXNzYWdlRWxlbWVudC50ZXh0Q29udGVudCA9IG1lc3NhZ2U7IC8vIFNldCB0aGUgdGV4dCBjb250ZW50IHRvIHRoZSBtZXNzYWdlXG5cbiAgLy8gQXBwbHkgc3R5bGluZyBiYXNlZCBvbiBwcm9tcHRUeXBlXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgXCJ2YWxpZFwiOlxuICAgICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcInRleHQtbGltZS02MDBcIik7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwibWlzc1wiOlxuICAgICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcInRleHQtb3JhbmdlLTYwMFwiKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcInRleHQtcmVkLTcwMFwiKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwidGV4dC1ncmF5LTgwMFwiKTsgLy8gRGVmYXVsdCB0ZXh0IGNvbG9yXG4gIH1cblxuICBvdXRwdXQuYXBwZW5kQ2hpbGQobWVzc2FnZUVsZW1lbnQpOyAvLyBBZGQgdGhlIGVsZW1lbnQgdG8gdGhlIG91dHB1dFxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBvdXRwdXQuc2Nyb2xsVG9wID0gb3V0cHV0LnNjcm9sbEhlaWdodDsgLy8gU2Nyb2xsIHRvIHRoZSBib3R0b20gb2YgdGhlIG91dHB1dCBjb250YWluZXJcbn07XG5cbi8vIFRoZSBmdW5jdGlvbiBmb3IgZXhlY3V0aW5nIGNvbW1hbmRzIGZyb20gdGhlIGNvbnNvbGUgaW5wdXRcbmNvbnN0IGNvbnNvbGVMb2dQbGFjZW1lbnRDb21tYW5kID0gKHNoaXBUeXBlLCBncmlkUG9zaXRpb24sIG9yaWVudGF0aW9uKSA9PiB7XG4gIC8vIFNldCB0aGUgb3JpZW50YXRpb24gZmVlZGJhY2tcbiAgY29uc3QgZGlyRmVlYmFjayA9IG9yaWVudGF0aW9uID09PSBcImhcIiA/IFwiaG9yaXpvbnRhbGx5XCIgOiBcInZlcnRpY2FsbHlcIjtcbiAgLy8gU2V0IHRoZSBjb25zb2xlIG1lc3NhZ2VcbiAgY29uc3QgbWVzc2FnZSA9IGAke3NoaXBUeXBlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc2hpcFR5cGUuc2xpY2UoMSl9IHBsYWNlZCBhdCAke2dyaWRQb3NpdGlvbn0gZmFjaW5nICR7ZGlyRmVlYmFja31gO1xuXG4gIGNvbnNvbGUubG9nKGAke21lc3NhZ2V9YCk7XG5cbiAgdXBkYXRlT3V0cHV0KGA+ICR7bWVzc2FnZX1gLCBcInZhbGlkXCIpO1xuXG4gIC8vIENsZWFyIHRoZSBpbnB1dFxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtaW5wdXRcIikudmFsdWUgPSBcIlwiO1xufTtcblxuLy8gVGhlIGZ1bmN0aW9uIGZvciBleGVjdXRpbmcgY29tbWFuZHMgZnJvbSB0aGUgY29uc29sZSBpbnB1dFxuY29uc3QgY29uc29sZUxvZ01vdmVDb21tYW5kID0gKHJlc3VsdHNPYmplY3QpID0+IHtcbiAgLy8gU2V0IHRoZSBjb25zb2xlIG1lc3NhZ2VcbiAgY29uc3QgbWVzc2FnZSA9IGBUaGUgJHtyZXN1bHRzT2JqZWN0LnBsYXllcn0ncyBtb3ZlIG9uICR7cmVzdWx0c09iamVjdC5tb3ZlfSByZXN1bHRlZCBpbiBhICR7cmVzdWx0c09iamVjdC5oaXQgPyBcIkhJVFwiIDogXCJNSVNTXCJ9IWA7XG5cbiAgY29uc29sZS5sb2coYCR7bWVzc2FnZX1gKTtcblxuICB1cGRhdGVPdXRwdXQoYD4gJHttZXNzYWdlfWAsIHJlc3VsdHNPYmplY3QuaGl0ID8gXCJ2YWxpZFwiIDogXCJtaXNzXCIpO1xuXG4gIC8vIENsZWFyIHRoZSBpbnB1dFxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtaW5wdXRcIikudmFsdWUgPSBcIlwiO1xufTtcblxuY29uc3QgY29uc29sZUxvZ0Vycm9yID0gKGVycm9yLCBzaGlwVHlwZSkgPT4ge1xuICBpZiAoc2hpcFR5cGUpIHtcbiAgICAvLyBJZiBzaGlwVHlwZSBpcyBwYXNzZWQgdGhlbiBwcm9jZXNzIGVycm9yIGFzIHBsYWNlbWVudCBlcnJvclxuICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIHBsYWNpbmcgJHtzaGlwVHlwZX06IG1lc3NhZ2UgPSAke2Vycm9yLm1lc3NhZ2V9LmApO1xuXG4gICAgdXBkYXRlT3V0cHV0KGA+IEVycm9yIHBsYWNpbmcgJHtzaGlwVHlwZX06ICR7ZXJyb3IubWVzc2FnZX1gLCBcImVycm9yXCIpO1xuICB9IGVsc2Uge1xuICAgIC8vIGVsc2UgaWYgc2hpcFR5cGUgaXMgdW5kZWZpbmVkLCBwcm9jZXNzIGVycm9yIGFzIG1vdmUgZXJyb3JcbiAgICBjb25zb2xlLmxvZyhgRXJyb3IgbWFraW5nIG1vdmU6IG1lc3NhZ2UgPSAke2Vycm9yLm1lc3NhZ2V9LmApO1xuXG4gICAgdXBkYXRlT3V0cHV0KGA+IEVycm9yIG1ha2luZyBtb3ZlOiBtZXNzYWdlID0gJHtlcnJvci5tZXNzYWdlfS5gLCBcImVycm9yXCIpO1xuICB9XG5cbiAgLy8gQ2xlYXIgdGhlIGlucHV0XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1pbnB1dFwiKS52YWx1ZSA9IFwiXCI7XG59O1xuXG4vLyBGdW5jdGlvbiBpbml0aWFsaXNlIHVpTWFuYWdlclxuY29uc3QgaW5pdFVpTWFuYWdlciA9ICh1aU1hbmFnZXIpID0+IHtcbiAgLy8gSW5pdGlhbGlzZSBjb25zb2xlXG4gIHVpTWFuYWdlci5pbml0Q29uc29sZVVJKCk7XG5cbiAgLy8gSW5pdGlhbGlzZSBnYW1lYm9hcmQgd2l0aCBjYWxsYmFjayBmb3IgY2VsbCBjbGlja3NcbiAgdWlNYW5hZ2VyLmNyZWF0ZUdhbWVib2FyZChcImh1bWFuLWdiXCIpO1xuICB1aU1hbmFnZXIuY3JlYXRlR2FtZWJvYXJkKFwiY29tcC1nYlwiKTtcbn07XG5cbi8vIEZ1bmN0aW9uIHRvIGNhbGN1bGF0ZSBjZWxsIElEcyBiYXNlZCBvbiBzdGFydCBwb3NpdGlvbiwgbGVuZ3RoLCBhbmQgb3JpZW50YXRpb25cbmZ1bmN0aW9uIGNhbGN1bGF0ZVNoaXBDZWxscyhzdGFydENlbGwsIHNoaXBMZW5ndGgsIG9yaWVudGF0aW9uKSB7XG4gIGNvbnN0IGNlbGxJZHMgPSBbXTtcbiAgY29uc3Qgcm93SW5kZXggPSBzdGFydENlbGwuY2hhckNvZGVBdCgwKSAtIFwiQVwiLmNoYXJDb2RlQXQoMCk7XG4gIGNvbnN0IGNvbEluZGV4ID0gcGFyc2VJbnQoc3RhcnRDZWxsLnN1YnN0cmluZygxKSwgMTApIC0gMTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHNoaXBMZW5ndGg7IGkrKykge1xuICAgIGlmIChvcmllbnRhdGlvbiA9PT0gXCJ2XCIpIHtcbiAgICAgIGlmIChjb2xJbmRleCArIGkgPj0gZ3JpZFswXS5sZW5ndGgpIGJyZWFrOyAvLyBDaGVjayBncmlkIGJvdW5kc1xuICAgICAgY2VsbElkcy5wdXNoKFxuICAgICAgICBgJHtTdHJpbmcuZnJvbUNoYXJDb2RlKHJvd0luZGV4ICsgXCJBXCIuY2hhckNvZGVBdCgwKSl9JHtjb2xJbmRleCArIGkgKyAxfWAsXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocm93SW5kZXggKyBpID49IGdyaWQubGVuZ3RoKSBicmVhazsgLy8gQ2hlY2sgZ3JpZCBib3VuZHNcbiAgICAgIGNlbGxJZHMucHVzaChcbiAgICAgICAgYCR7U3RyaW5nLmZyb21DaGFyQ29kZShyb3dJbmRleCArIGkgKyBcIkFcIi5jaGFyQ29kZUF0KDApKX0ke2NvbEluZGV4ICsgMX1gLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY2VsbElkcztcbn1cblxuLy8gRnVuY3Rpb24gdG8gaGlnaGxpZ2h0IGNlbGxzXG5mdW5jdGlvbiBoaWdobGlnaHRDZWxscyhjZWxsSWRzKSB7XG4gIGNlbGxJZHMuZm9yRWFjaCgoY2VsbElkKSA9PiB7XG4gICAgY29uc3QgY2VsbEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1wb3NpdGlvbj1cIiR7Y2VsbElkfVwiXWApO1xuICAgIGlmIChjZWxsRWxlbWVudCkge1xuICAgICAgY2VsbEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImJnLW9yYW5nZS00MDBcIik7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gRnVuY3Rpb24gdG8gY2xlYXIgaGlnaGxpZ2h0IGZyb20gY2VsbHNcbmZ1bmN0aW9uIGNsZWFySGlnaGxpZ2h0KGNlbGxJZHMpIHtcbiAgY2VsbElkcy5mb3JFYWNoKChjZWxsSWQpID0+IHtcbiAgICBjb25zdCBjZWxsRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiJHtjZWxsSWR9XCJdYCk7XG4gICAgaWYgKGNlbGxFbGVtZW50KSB7XG4gICAgICBjZWxsRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiYmctb3JhbmdlLTQwMFwiKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBGdW5jdGlvbiB0byB0b2dnbGUgb3JpZW50YXRpb25cbmZ1bmN0aW9uIHRvZ2dsZU9yaWVudGF0aW9uKCkge1xuICBjdXJyZW50T3JpZW50YXRpb24gPSBjdXJyZW50T3JpZW50YXRpb24gPT09IFwiaFwiID8gXCJ2XCIgOiBcImhcIjtcbiAgLy8gVXBkYXRlIHRoZSB2aXN1YWwgcHJvbXB0IGhlcmUgaWYgbmVjZXNzYXJ5XG59XG5cbmNvbnN0IGhhbmRsZVBsYWNlbWVudEhvdmVyID0gKGUpID0+IHtcbiAgY29uc3QgY2VsbCA9IGUudGFyZ2V0O1xuICBpZiAoXG4gICAgY2VsbC5jbGFzc0xpc3QuY29udGFpbnMoXCJnYW1lYm9hcmQtY2VsbFwiKSAmJlxuICAgIGNlbGwuZGF0YXNldC5wbGF5ZXIgPT09IFwiaHVtYW5cIlxuICApIHtcbiAgICAvLyBMb2dpYyB0byBoYW5kbGUgaG92ZXIgZWZmZWN0XG4gICAgY29uc3QgY2VsbFBvcyA9IGNlbGwuZGF0YXNldC5wb3NpdGlvbjtcbiAgICBsYXN0SG92ZXJlZENlbGwgPSBjZWxsUG9zO1xuICAgIGNvbnN0IGNlbGxzVG9IaWdobGlnaHQgPSBjYWxjdWxhdGVTaGlwQ2VsbHMoXG4gICAgICBjZWxsUG9zLFxuICAgICAgY3VycmVudFNoaXAuc2hpcExlbmd0aCxcbiAgICAgIGN1cnJlbnRPcmllbnRhdGlvbixcbiAgICApO1xuICAgIGhpZ2hsaWdodENlbGxzKGNlbGxzVG9IaWdobGlnaHQpO1xuICB9XG59O1xuXG5jb25zdCBoYW5kbGVNb3VzZUxlYXZlID0gKGUpID0+IHtcbiAgY29uc3QgY2VsbCA9IGUudGFyZ2V0O1xuICBpZiAoY2VsbC5jbGFzc0xpc3QuY29udGFpbnMoXCJnYW1lYm9hcmQtY2VsbFwiKSkge1xuICAgIC8vIExvZ2ljIGZvciBoYW5kbGluZyB3aGVuIHRoZSBjdXJzb3IgbGVhdmVzIGEgY2VsbFxuICAgIGNvbnN0IGNlbGxQb3MgPSBjZWxsLmRhdGFzZXQucG9zaXRpb247XG4gICAgaWYgKGNlbGxQb3MgPT09IGxhc3RIb3ZlcmVkQ2VsbCkge1xuICAgICAgY29uc3QgY2VsbHNUb0NsZWFyID0gY2FsY3VsYXRlU2hpcENlbGxzKFxuICAgICAgICBjZWxsUG9zLFxuICAgICAgICBjdXJyZW50U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgICBjdXJyZW50T3JpZW50YXRpb24sXG4gICAgICApO1xuICAgICAgY2xlYXJIaWdobGlnaHQoY2VsbHNUb0NsZWFyKTtcbiAgICAgIGxhc3RIb3ZlcmVkQ2VsbCA9IG51bGw7IC8vIFJlc2V0IGxhc3RIb3ZlcmVkQ2VsbCBzaW5jZSB0aGUgbW91c2UgaGFzIGxlZnRcbiAgICB9XG4gICAgbGFzdEhvdmVyZWRDZWxsID0gbnVsbDtcbiAgfVxufTtcblxuY29uc3QgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUgPSAoZSkgPT4ge1xuICBpZiAoZS5rZXkgPT09IFwiIFwiICYmIGxhc3RIb3ZlcmVkQ2VsbCkge1xuICAgIC8vIEVuc3VyZSBzcGFjZWJhciBpcyBwcmVzc2VkIGFuZCB0aGVyZSdzIGEgbGFzdCBob3ZlcmVkIGNlbGxcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7IC8vIFByZXZlbnQgdGhlIGRlZmF1bHQgc3BhY2ViYXIgYWN0aW9uXG5cbiAgICAvLyBUb2dnbGUgdGhlIG9yaWVudGF0aW9uXG4gICAgdG9nZ2xlT3JpZW50YXRpb24oKTtcblxuICAgIC8vIENsZWFyIHByZXZpb3VzbHkgaGlnaGxpZ2h0ZWQgY2VsbHNcbiAgICAvLyBBc3N1bWluZyBjYWxjdWxhdGVTaGlwQ2VsbHMgYW5kIGNsZWFySGlnaGxpZ2h0IHdvcmsgY29ycmVjdGx5XG4gICAgY29uc3Qgb2xkQ2VsbHNUb0NsZWFyID0gY2FsY3VsYXRlU2hpcENlbGxzKFxuICAgICAgbGFzdEhvdmVyZWRDZWxsLFxuICAgICAgY3VycmVudFNoaXAuc2hpcExlbmd0aCxcbiAgICAgIGN1cnJlbnRPcmllbnRhdGlvbiA9PT0gXCJoXCIgPyBcInZcIiA6IFwiaFwiLFxuICAgICk7XG4gICAgY2xlYXJIaWdobGlnaHQob2xkQ2VsbHNUb0NsZWFyKTtcblxuICAgIC8vIEhpZ2hsaWdodCBuZXcgY2VsbHMgYmFzZWQgb24gdGhlIG5ldyBvcmllbnRhdGlvblxuICAgIGNvbnN0IG5ld0NlbGxzVG9IaWdobGlnaHQgPSBjYWxjdWxhdGVTaGlwQ2VsbHMoXG4gICAgICBsYXN0SG92ZXJlZENlbGwsXG4gICAgICBjdXJyZW50U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgY3VycmVudE9yaWVudGF0aW9uLFxuICAgICk7XG4gICAgaGlnaGxpZ2h0Q2VsbHMobmV3Q2VsbHNUb0hpZ2hsaWdodCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGVuYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoKSB7XG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImNvbXB1dGVyXCJdJylcbiAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgY2VsbC5jbGFzc0xpc3QucmVtb3ZlKFwicG9pbnRlci1ldmVudHMtbm9uZVwiLCBcImN1cnNvci1kZWZhdWx0XCIpO1xuICAgICAgY2VsbC5jbGFzc0xpc3QucmVtb3ZlKFwiaG92ZXI6Ymctb3JhbmdlLTUwMFwiKTtcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChcImhvdmVyOmJnLW9yYW5nZS01MDBcIik7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGRpc2FibGVDb21wdXRlckdhbWVib2FyZEhvdmVyKCkge1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9XCJjb21wdXRlclwiXScpXG4gICAgLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChcInBvaW50ZXItZXZlbnRzLW5vbmVcIiwgXCJjdXJzb3ItZGVmYXVsdFwiKTtcbiAgICAgIGNlbGwuY2xhc3NMaXN0LnJlbW92ZShcImhvdmVyOmJnLW9yYW5nZS01MDBcIik7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGRpc2FibGVIdW1hbkdhbWVib2FyZEhvdmVyKCkge1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9XCJodW1hblwiXScpXG4gICAgLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChcInBvaW50ZXItZXZlbnRzLW5vbmVcIiwgXCJjdXJzb3ItZGVmYXVsdFwiKTtcbiAgICAgIGNlbGwuY2xhc3NMaXN0LnJlbW92ZShcImhvdmVyOmJnLW9yYW5nZS01MDBcIik7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHN3aXRjaEdhbWVib2FyZEhvdmVyU3RhdGVzKCkge1xuICAvLyBEaXNhYmxlIGhvdmVyIG9uIHRoZSBodW1hbidzIGdhbWVib2FyZFxuICBkaXNhYmxlSHVtYW5HYW1lYm9hcmRIb3ZlcigpO1xuXG4gIC8vIEVuYWJsZSBob3ZlciBvbiB0aGUgY29tcHV0ZXIncyBnYW1lYm9hcmRcbiAgZW5hYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlcigpO1xufVxuXG4vLyBGdW5jdGlvbiB0byBzZXR1cCBnYW1lYm9hcmQgZm9yIHNoaXAgcGxhY2VtZW50XG5jb25zdCBzZXR1cEdhbWVib2FyZEZvclBsYWNlbWVudCA9ICgpID0+IHtcbiAgZGlzYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoKTtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvckFsbCgnLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPVwiaHVtYW5cIl0nKVxuICAgIC5mb3JFYWNoKChjZWxsKSA9PiB7XG4gICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIGhhbmRsZVBsYWNlbWVudEhvdmVyKTtcbiAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgaGFuZGxlTW91c2VMZWF2ZSk7XG4gICAgfSk7XG4gIC8vIEdldCBnYW1lYm9hcmQgYXJlYSBkaXYgZWxlbWVudFxuICBjb25zdCBnYW1lYm9hcmRBcmVhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICBcIi5nYW1lYm9hcmQtYXJlYSwgW2RhdGEtcGxheWVyPSdodW1hbiddXCIsXG4gICk7XG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgdG8gZ2FtZWJvYXJkIGFyZWEgdG8gYWRkIGFuZCByZW1vdmUgdGhlXG4gIC8vIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlIGV2ZW50IGxpc3RlbmVyIHdoZW4gZW50ZXJpbmcgYW5kIGV4aXRpbmcgdGhlIGFyZWFcbiAgZ2FtZWJvYXJkQXJlYS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xuICB9KTtcbiAgZ2FtZWJvYXJkQXJlYS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xuICB9KTtcbn07XG5cbi8vIEZ1bmN0aW9uIHRvIGNsZWFuIHVwIGFmdGVyIHNoaXAgcGxhY2VtZW50IGlzIGNvbXBsZXRlXG5jb25zdCBjbGVhbnVwQWZ0ZXJQbGFjZW1lbnQgPSAoKSA9PiB7XG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImh1bWFuXCJdJylcbiAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgY2VsbC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBoYW5kbGVQbGFjZW1lbnRIb3Zlcik7XG4gICAgICBjZWxsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIGhhbmRsZU1vdXNlTGVhdmUpO1xuICAgIH0pO1xuICAvLyBHZXQgZ2FtZWJvYXJkIGFyZWEgZGl2IGVsZW1lbnRcbiAgY29uc3QgZ2FtZWJvYXJkQXJlYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgXCIuZ2FtZWJvYXJkLWFyZWEsIFtkYXRhLXBsYXllcj0naHVtYW4nXVwiLFxuICApO1xuICAvLyBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzIHRvIGdhbWVib2FyZCBhcmVhIHRvIGFkZCBhbmQgcmVtb3ZlIHRoZVxuICAvLyBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSBldmVudCBsaXN0ZW5lciB3aGVuIGVudGVyaW5nIGFuZCBleGl0aW5nIHRoZSBhcmVhXG4gIGdhbWVib2FyZEFyZWEucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlKTtcbiAgfSk7XG4gIGdhbWVib2FyZEFyZWEucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlKTtcbiAgfSk7XG4gIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lciBmb3Iga2V5ZG93biBldmVudHNcbiAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xufTtcblxuLy8gRnVuY3Rpb24gZm9yIHN0YXJ0aW5nIHRoZSBnYW1lXG5jb25zdCBzdGFydEdhbWUgPSBhc3luYyAodWlNYW5hZ2VyLCBnYW1lKSA9PiB7XG4gIC8vIFNldCB1cCB0aGUgZ2FtZSBieSBhdXRvIHBsYWNpbmcgY29tcHV0ZXIncyBzaGlwcyBhbmQgc2V0dGluZyB0aGVcbiAgLy8gY3VycmVudCBwbGF5ZXIgdG8gdGhlIGh1bWFuIHBsYXllclxuICBhd2FpdCBnYW1lLnNldFVwKCk7XG5cbiAgLy8gUmVuZGVyIHRoZSBzaGlwIGRpc3BsYXkgZm9yIHRoZSBjb21wdXRlciBwbGF5ZXJcbiAgc2hpcHNUb1BsYWNlLmZvckVhY2goKHNoaXApID0+IHtcbiAgICB1aU1hbmFnZXIucmVuZGVyU2hpcERpc3AoZ2FtZS5wbGF5ZXJzLmNvbXB1dGVyLCBzaGlwLnNoaXBUeXBlKTtcbiAgfSk7XG5cbiAgLy8gRGlzcGxheSBwcm9tcHQgb2JqZWN0IGZvciB0YWtpbmcgYSB0dXJuIGFuZCBzdGFydGluZyB0aGUgZ2FtZVxuICB1aU1hbmFnZXIuZGlzcGxheVByb21wdCh7IHR1cm5Qcm9tcHQsIGdhbWVwbGF5R3VpZGUgfSk7XG59O1xuXG5jb25zdCBoYW5kbGVIdW1hbk1vdmUgPSAoZSkgPT4ge1xuICAvLyBHZXQgdGhlIHBvc2l0aW9uIG9uIHRoZSBib2FyZCB0byBtYWtlIGEgbW92ZVxuICBjb25zdCB7IHBvc2l0aW9uIH0gPSBlLnRhcmdldC5kYXRhO1xufTtcblxuLy8gU2V0dXAgZ2FtZWJvYXJkIGZvciBmb3IgcGxheWVyIG1vdmVcbmNvbnN0IHNldHVwR2FtZWJvYXJkRm9yUGxheWVyTW92ZSA9ICgpID0+IHtcbiAgLy8gRW5hYmxlIHRoZSBob3ZlciBzdGF0ZSBmb3IgdGhlIGNvbXB1dGVyIGdhbWVib2FyZFxuICBlbmFibGVDb21wdXRlckdhbWVib2FyZEhvdmVyKCk7XG5cbiAgLy8gU2V0IHVwIGV2ZW50IGxpc3RlbmVycyBvbiB0aGUgY29tcHV0ZXIgZ2FtZWJvYXJkIGZvciB0aGUgcGxheWVyXG4gIC8vIG1ha2luZyBtb3Zlc1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9XCJjb21wdXRlclwiXScpXG4gICAgLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGhhbmRsZUh1bWFuTW92ZSk7XG4gICAgfSk7XG59O1xuXG5hc3luYyBmdW5jdGlvbiBwbGF5ZXJNb3ZlKCkge1xuICAvLyBXYWl0IGZvciBwbGF5ZXIncyBtb3ZlIChjbGljayBvciBjb25zb2xlIGlucHV0KVxuICAvLyBVcGRhdGUgVUkgYmFzZWQgb24gbW92ZVxufVxuXG5hc3luYyBmdW5jdGlvbiBjb21wdXRlck1vdmUoaHVtYW5QbGF5ZXJHYW1lYm9hcmQsIGNvbXBQbGF5ZXIpIHtcbiAgbGV0IGNvbXBNb3ZlUmVzdWx0O1xuICB0cnkge1xuICAgIC8vIENvbXB1dGVyIGxvZ2ljIHRvIGNob29zZSBhIG1vdmVcbiAgICAvLyBVcGRhdGUgVUkgYmFzZWQgb24gbW92ZVxuICAgIGNvbXBNb3ZlUmVzdWx0ID0gY29tcFBsYXllci5tYWtlTW92ZShodW1hblBsYXllckdhbWVib2FyZCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZUxvZ0Vycm9yKGVycm9yKTtcbiAgfVxuICByZXR1cm4gY29tcE1vdmVSZXN1bHQ7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNoZWNrV2luQ29uZGl0aW9uKCkge1xuICAvLyBDaGVjayBpZiBhbGwgc2hpcHMgYXJlIHN1bmtcbiAgLy8gUmV0dXJuIHRydWUgaWYgZ2FtZSBpcyBvdmVyLCBmYWxzZSBvdGhlcndpc2Vcbn1cblxuZnVuY3Rpb24gY29uY2x1ZGVHYW1lKCkge1xuICAvLyBEaXNwbGF5IHdpbm5lciwgdXBkYXRlIFVJLCBldGMuXG59XG5cbmNvbnN0IEFjdGlvbkNvbnRyb2xsZXIgPSAodWlNYW5hZ2VyLCBnYW1lKSA9PiB7XG4gIGNvbnN0IGh1bWFuUGxheWVyID0gZ2FtZS5wbGF5ZXJzLmh1bWFuO1xuICBjb25zdCBodW1hblBsYXllckdhbWVib2FyZCA9IGh1bWFuUGxheWVyLmdhbWVib2FyZDtcbiAgY29uc3QgY29tcFBsYXllciA9IGdhbWUucGxheWVycy5jb21wdXRlcjtcbiAgY29uc3QgY29tcFBsYXllckdhbWVib2FyZCA9IGNvbXBQbGF5ZXIuZ2FtZWJvYXJkO1xuXG4gIC8vIEZ1bmN0aW9uIHRvIHNldHVwIGV2ZW50IGxpc3RlbmVycyBmb3IgY29uc29sZSBhbmQgZ2FtZWJvYXJkIGNsaWNrc1xuICBmdW5jdGlvbiBzZXR1cEV2ZW50TGlzdGVuZXJzKGhhbmRsZXJGdW5jdGlvbiwgcGxheWVyVHlwZSkge1xuICAgIC8vIERlZmluZSBjbGVhbnVwIGZ1bmN0aW9ucyBpbnNpZGUgdG8gZW5zdXJlIHRoZXkgYXJlIGFjY2Vzc2libGUgZm9yIHJlbW92YWxcbiAgICBjb25zdCBjbGVhbnVwRnVuY3Rpb25zID0gW107XG5cbiAgICBjb25zdCBjb25zb2xlU3VibWl0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLXN1Ym1pdFwiKTtcbiAgICBjb25zdCBjb25zb2xlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtaW5wdXRcIik7XG5cbiAgICBjb25zdCBzdWJtaXRIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgY29uc3QgaW5wdXQgPSBjb25zb2xlSW5wdXQudmFsdWU7XG4gICAgICBoYW5kbGVyRnVuY3Rpb24oaW5wdXQpO1xuICAgICAgY29uc29sZUlucHV0LnZhbHVlID0gXCJcIjsgLy8gQ2xlYXIgaW5wdXQgYWZ0ZXIgc3VibWlzc2lvblxuICAgIH07XG5cbiAgICBjb25zdCBrZXlwcmVzc0hhbmRsZXIgPSAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSBcIkVudGVyXCIpIHtcbiAgICAgICAgc3VibWl0SGFuZGxlcigpOyAvLyBSZXVzZSBzdWJtaXQgbG9naWMgZm9yIEVudGVyIGtleSBwcmVzc1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zb2xlU3VibWl0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzdWJtaXRIYW5kbGVyKTtcbiAgICBjb25zb2xlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGtleXByZXNzSGFuZGxlcik7XG5cbiAgICAvLyBBZGQgY2xlYW51cCBmdW5jdGlvbiBmb3IgY29uc29sZSBsaXN0ZW5lcnNcbiAgICBjbGVhbnVwRnVuY3Rpb25zLnB1c2goKCkgPT4ge1xuICAgICAgY29uc29sZVN1Ym1pdEJ1dHRvbi5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgc3VibWl0SGFuZGxlcik7XG4gICAgICBjb25zb2xlSW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGtleXByZXNzSGFuZGxlcik7XG4gICAgfSk7XG5cbiAgICAvLyBTZXR1cCBmb3IgZ2FtZWJvYXJkIGNlbGwgY2xpY2tzXG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKGAuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9JHtwbGF5ZXJUeXBlfV1gKVxuICAgICAgLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAgICAgY29uc3QgY2xpY2tIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHsgcG9zaXRpb24gfSA9IGNlbGwuZGF0YXNldDtcbiAgICAgICAgICBsZXQgaW5wdXQ7XG4gICAgICAgICAgaWYgKHBsYXllclR5cGUgPT09IFwiaHVtYW5cIikge1xuICAgICAgICAgICAgaW5wdXQgPSBgJHtwb3NpdGlvbn0gJHtjdXJyZW50T3JpZW50YXRpb259YDtcbiAgICAgICAgICB9IGVsc2UgaWYgKHBsYXllclR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgICAgICAgaW5wdXQgPSBwb3NpdGlvbjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBcIkVycm9yISBJbnZhbGlkIHBsYXllciB0eXBlIHBhc3NlZCB0byBjbGlja0hhbmRsZXIhXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zb2xlLmxvZyhgY2xpY2tIYW5kbGVyIGlucHV0ID0gJHtpbnB1dH1gKTtcbiAgICAgICAgICBoYW5kbGVyRnVuY3Rpb24oaW5wdXQpO1xuICAgICAgICB9O1xuICAgICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbGlja0hhbmRsZXIpO1xuXG4gICAgICAgIC8vIEFkZCBjbGVhbnVwIGZ1bmN0aW9uIGZvciBlYWNoIGNlbGwgbGlzdGVuZXJcbiAgICAgICAgY2xlYW51cEZ1bmN0aW9ucy5wdXNoKCgpID0+XG4gICAgICAgICAgY2VsbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xpY2tIYW5kbGVyKSxcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgLy8gUmV0dXJuIGEgc2luZ2xlIGNsZWFudXAgZnVuY3Rpb24gdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnNcbiAgICByZXR1cm4gKCkgPT4gY2xlYW51cEZ1bmN0aW9ucy5mb3JFYWNoKChjbGVhbnVwKSA9PiBjbGVhbnVwKCkpO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gcHJvbXB0QW5kUGxhY2VTaGlwKHNoaXBUeXBlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIC8vIFNldCB0aGUgY3VycmVudCBzaGlwXG4gICAgICBjdXJyZW50U2hpcCA9IHNoaXBzVG9QbGFjZS5maW5kKChzaGlwKSA9PiBzaGlwLnNoaXBUeXBlID09PSBzaGlwVHlwZSk7XG5cbiAgICAgIC8vIERpc3BsYXkgcHJvbXB0IGZvciB0aGUgc3BlY2lmaWMgc2hpcCB0eXBlIGFzIHdlbGwgYXMgdGhlIGd1aWRlIHRvIHBsYWNpbmcgc2hpcHNcbiAgICAgIGNvbnN0IHBsYWNlU2hpcFByb21wdCA9IHtcbiAgICAgICAgcHJvbXB0OiBgUGxhY2UgeW91ciAke3NoaXBUeXBlfS5gLFxuICAgICAgICBwcm9tcHRUeXBlOiBcImluc3RydWN0aW9uXCIsXG4gICAgICB9O1xuICAgICAgdWlNYW5hZ2VyLmRpc3BsYXlQcm9tcHQoeyBwbGFjZVNoaXBQcm9tcHQsIHBsYWNlU2hpcEd1aWRlIH0pO1xuXG4gICAgICBjb25zdCBoYW5kbGVWYWxpZElucHV0ID0gYXN5bmMgKGlucHV0KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgeyBncmlkUG9zaXRpb24sIG9yaWVudGF0aW9uIH0gPSBwcm9jZXNzQ29tbWFuZChpbnB1dCwgZmFsc2UpO1xuICAgICAgICAgIGF3YWl0IGh1bWFuUGxheWVyR2FtZWJvYXJkLnBsYWNlU2hpcChcbiAgICAgICAgICAgIHNoaXBUeXBlLFxuICAgICAgICAgICAgZ3JpZFBvc2l0aW9uLFxuICAgICAgICAgICAgb3JpZW50YXRpb24sXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zb2xlTG9nUGxhY2VtZW50Q29tbWFuZChzaGlwVHlwZSwgZ3JpZFBvc2l0aW9uLCBvcmllbnRhdGlvbik7XG4gICAgICAgICAgLy8gUmVtb3ZlIGNlbGwgaGlnaGxpZ2h0c1xuICAgICAgICAgIGNvbnN0IGNlbGxzVG9DbGVhciA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgICAgICAgIGdyaWRQb3NpdGlvbixcbiAgICAgICAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICAgICAgICBvcmllbnRhdGlvbixcbiAgICAgICAgICApO1xuICAgICAgICAgIGNsZWFySGlnaGxpZ2h0KGNlbGxzVG9DbGVhcik7XG5cbiAgICAgICAgICAvLyBEaXNwbGF5IHRoZSBzaGlwIG9uIHRoZSBnYW1lIGJvYXJkIGFuZCBzaGlwIHN0YXR1cyBkaXNwbGF5XG4gICAgICAgICAgdWlNYW5hZ2VyLnJlbmRlclNoaXBCb2FyZChodW1hblBsYXllciwgc2hpcFR5cGUpO1xuICAgICAgICAgIHVpTWFuYWdlci5yZW5kZXJTaGlwRGlzcChodW1hblBsYXllciwgc2hpcFR5cGUpO1xuXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZS1iZWZvcmUtZGVmaW5lXG4gICAgICAgICAgcmVzb2x2ZVNoaXBQbGFjZW1lbnQoKTsgLy8gU2hpcCBwbGFjZWQgc3VjY2Vzc2Z1bGx5LCByZXNvbHZlIHRoZSBwcm9taXNlXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZUxvZ0Vycm9yKGVycm9yLCBzaGlwVHlwZSk7XG4gICAgICAgICAgLy8gRG8gbm90IHJlamVjdCB0byBhbGxvdyBmb3IgcmV0cnksIGp1c3QgbG9nIHRoZSBlcnJvclxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAvLyBTZXR1cCBldmVudCBsaXN0ZW5lcnMgYW5kIGVuc3VyZSB3ZSBjYW4gY2xlYW4gdGhlbSB1cCBhZnRlciBwbGFjZW1lbnRcbiAgICAgIGNvbnN0IGNsZWFudXAgPSBzZXR1cEV2ZW50TGlzdGVuZXJzKGhhbmRsZVZhbGlkSW5wdXQsIFwiaHVtYW5cIik7XG5cbiAgICAgIC8vIEF0dGFjaCBjbGVhbnVwIHRvIHJlc29sdmUgdG8gZW5zdXJlIGl0J3MgY2FsbGVkIHdoZW4gdGhlIHByb21pc2UgcmVzb2x2ZXNcbiAgICAgIGNvbnN0IHJlc29sdmVTaGlwUGxhY2VtZW50ID0gKCkgPT4ge1xuICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvLyBTZXF1ZW50aWFsbHkgcHJvbXB0IGZvciBhbmQgcGxhY2UgZWFjaCBzaGlwXG4gIGFzeW5jIGZ1bmN0aW9uIHNldHVwU2hpcHNTZXF1ZW50aWFsbHkoKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwc1RvUGxhY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wXG4gICAgICBhd2FpdCBwcm9tcHRBbmRQbGFjZVNoaXAoc2hpcHNUb1BsYWNlW2ldLnNoaXBUeXBlKTsgLy8gV2FpdCBmb3IgZWFjaCBzaGlwIHRvIGJlIHBsYWNlZCBiZWZvcmUgY29udGludWluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIEZ1bmN0aW9uIGZvciBoYW5kbGluZyB0aGUgZ2FtZSBzZXR1cCBhbmQgc2hpcCBwbGFjZW1lbnRcbiAgY29uc3QgaGFuZGxlU2V0dXAgPSBhc3luYyAoKSA9PiB7XG4gICAgLy8gSW5pdCB0aGUgVUlcbiAgICBpbml0VWlNYW5hZ2VyKHVpTWFuYWdlcik7XG4gICAgc2V0dXBHYW1lYm9hcmRGb3JQbGFjZW1lbnQoKTtcbiAgICBhd2FpdCBzZXR1cFNoaXBzU2VxdWVudGlhbGx5KCk7XG4gICAgLy8gUHJvY2VlZCB3aXRoIHRoZSByZXN0IG9mIHRoZSBnYW1lIHNldHVwIGFmdGVyIGFsbCBzaGlwcyBhcmUgcGxhY2VkXG4gICAgY2xlYW51cEFmdGVyUGxhY2VtZW50KCk7XG5cbiAgICAvLyBTdGFydCB0aGUgZ2FtZVxuICAgIGF3YWl0IHN0YXJ0R2FtZSh1aU1hbmFnZXIsIGdhbWUpO1xuXG4gICAgY29uc3Qgb3V0cHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLW91dHB1dFwiKTtcbiAgICB1cGRhdGVPdXRwdXQoXCI+IEFsbCBzaGlwcyBwbGFjZWQsIGdhbWUgc2V0dXAgY29tcGxldGUhXCIpO1xuICAgIGNvbnNvbGUubG9nKFwiQWxsIHNoaXBzIHBsYWNlZCwgZ2FtZSBzZXR1cCBjb21wbGV0ZSFcIik7XG4gICAgc3dpdGNoR2FtZWJvYXJkSG92ZXJTdGF0ZXMoKTtcbiAgfTtcblxuICBhc3luYyBmdW5jdGlvbiBwcm9tcHRQbGF5ZXJNb3ZlKGNvbXBNb3ZlUmVzdWx0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCBodW1hbk1vdmVSZXN1bHQ7XG4gICAgICAvLyBVcGRhdGUgdGhlIHBsYXllciB3aXRoIHRoZSByZXN1bHQgb2YgdGhlIGNvbXB1dGVyJ3MgbGFzdCBtb3JlXG4gICAgICAvLyAoaWYgdGhlcmUgaXMgb25lKVxuICAgICAgaWYgKGNvbXBNb3ZlUmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gTG9nIHRoZSByZXN1bHQgb2YgdGhlIGNvbXB1dGVyJ3MgbW92ZSB0byB0aGUgY29uc29sZVxuICAgICAgICBjb25zb2xlTG9nTW92ZUNvbW1hbmQoY29tcE1vdmVSZXN1bHQpO1xuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZyhgTWFrZSBhIG1vdmUhYCk7XG5cbiAgICAgIGNvbnN0IGhhbmRsZVZhbGlkTW92ZSA9IGFzeW5jIChtb3ZlKSA9PiB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGBoYW5kbGVWYWxpZElucHV0OiBtb3ZlID0gJHttb3ZlfWApO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHsgZ3JpZFBvc2l0aW9uIH0gPSBwcm9jZXNzQ29tbWFuZChtb3ZlLCB0cnVlKTtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgaGFuZGxlVmFsaWRJbnB1dDogZ3JpZFBvc2l0aW9uID0gJHtncmlkUG9zaXRpb259YCk7XG4gICAgICAgICAgaHVtYW5Nb3ZlUmVzdWx0ID0gYXdhaXQgaHVtYW5QbGF5ZXIubWFrZU1vdmUoXG4gICAgICAgICAgICBjb21wUGxheWVyR2FtZWJvYXJkLFxuICAgICAgICAgICAgZ3JpZFBvc2l0aW9uLFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICAvLyBDb21tdW5pY2F0ZSB0aGUgcmVzdWx0IG9mIHRoZSBtb3ZlIHRvIHRoZSB1c2VyXG4gICAgICAgICAgY29uc29sZUxvZ01vdmVDb21tYW5kKGh1bWFuTW92ZVJlc3VsdCk7XG5cbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlLWJlZm9yZS1kZWZpbmVcbiAgICAgICAgICByZXNvbHZlTW92ZSgpOyAvLyBNb3ZlIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseSwgcmVzb2x2ZSB0aGUgcHJvbWlzZVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGVMb2dFcnJvcihlcnJvcik7XG4gICAgICAgICAgLy8gRG8gbm90IHJlamVjdCB0byBhbGxvdyBmb3IgcmV0cnksIGp1c3QgbG9nIHRoZSBlcnJvclxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAvLyBTZXR1cCBldmVudCBsaXN0ZW5lcnMgYW5kIGVuc3VyZSB3ZSBjYW4gY2xlYW4gdGhlbSB1cCBhZnRlciBwbGFjZW1lbnRcbiAgICAgIGNvbnN0IGNsZWFudXAgPSBzZXR1cEV2ZW50TGlzdGVuZXJzKGhhbmRsZVZhbGlkTW92ZSwgXCJjb21wdXRlclwiKTtcblxuICAgICAgLy8gQXR0YWNoIGNsZWFudXAgdG8gcmVzb2x2ZSB0byBlbnN1cmUgaXQncyBjYWxsZWQgd2hlbiB0aGUgcHJvbWlzZSByZXNvbHZlc1xuICAgICAgY29uc3QgcmVzb2x2ZU1vdmUgPSAoKSA9PiB7XG4gICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgcmVzb2x2ZShodW1hbk1vdmVSZXN1bHQpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIEZ1bmN0aW9uIGZvciBoYW5kbGluZyB0aGUgcGxheWluZyBvZiB0aGUgZ2FtZVxuICBjb25zdCBwbGF5R2FtZSA9IGFzeW5jICgpID0+IHtcbiAgICBsZXQgZ2FtZU92ZXIgPSBmYWxzZTtcbiAgICBsZXQgbGFzdENvbXBNb3ZlUmVzdWx0O1xuICAgIGxldCBsYXN0SHVtYW5Nb3ZlUmVzdWx0O1xuXG4gICAgd2hpbGUgKCFnYW1lT3Zlcikge1xuICAgICAgY29uc29sZS5kaXIoZ2FtZS5jdXJyZW50UGxheWVyKTtcbiAgICAgIC8vIFBsYXllciBtYWtlcyBhIG1vdmVcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wXG4gICAgICBsYXN0SHVtYW5Nb3ZlUmVzdWx0ID0gYXdhaXQgcHJvbXB0UGxheWVyTW92ZShsYXN0Q29tcE1vdmVSZXN1bHQpO1xuICAgICAgY29uc29sZS5sb2coXCJwcm9tcHRQbGF5ZXJNb3ZlLnRoZW4oKSAtPlwiKTtcbiAgICAgIGNvbnNvbGUuZGlyKGxhc3RIdW1hbk1vdmVSZXN1bHQpO1xuICAgICAgLy8gQ2hlY2sgZm9yIHdpbiBjb25kaXRpb25cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wXG4gICAgICBnYW1lT3ZlciA9IGF3YWl0IGNoZWNrV2luQ29uZGl0aW9uKCk7XG4gICAgICBpZiAoZ2FtZU92ZXIpIGJyZWFrO1xuXG4gICAgICAvLyBDb21wdXRlciBtYWtlcyBhIG1vdmVcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wXG4gICAgICBsYXN0Q29tcE1vdmVSZXN1bHQgPSBhd2FpdCBjb21wdXRlck1vdmUoaHVtYW5QbGF5ZXJHYW1lYm9hcmQsIGNvbXBQbGF5ZXIpO1xuICAgICAgY29uc29sZS5sb2coXCJDb21wdXRlcidzIG1vdmUgLT5cIik7XG4gICAgICBjb25zb2xlLmRpcihsYXN0Q29tcE1vdmVSZXN1bHQpO1xuICAgICAgLy8gQ2hlY2sgZm9yIHdpbiBjb25kaXRpb25cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wXG4gICAgICBnYW1lT3ZlciA9IGF3YWl0IGNoZWNrV2luQ29uZGl0aW9uKCk7XG4gICAgfVxuXG4gICAgLy8gR2FtZSBvdmVyIGxvZ2ljXG4gICAgY29uY2x1ZGVHYW1lKCk7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBoYW5kbGVTZXR1cCxcbiAgICBwbGF5R2FtZSxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEFjdGlvbkNvbnRyb2xsZXI7XG4iLCIvKiBlc2xpbnQtZGlzYWJsZSBtYXgtY2xhc3Nlcy1wZXItZmlsZSAqL1xuXG5jbGFzcyBPdmVybGFwcGluZ1NoaXBzRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIlNoaXBzIGFyZSBvdmVybGFwcGluZy5cIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiT3ZlcmxhcHBpbmdTaGlwc0Vycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgU2hpcEFsbG9jYXRpb25SZWFjaGVkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHNoaXBUeXBlKSB7XG4gICAgc3VwZXIoYFNoaXAgYWxsb2NhdGlvbiBsaW1pdCByZWFjaGVkLiBTaGlwIHR5cGUgPSAke3NoaXBUeXBlfS5gKTtcbiAgICB0aGlzLm5hbWUgPSBcIlNoaXBBbGxvY2F0aW9uUmVhY2hlZEVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgU2hpcFR5cGVBbGxvY2F0aW9uUmVhY2hlZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJTaGlwIHR5cGUgYWxsb2NhdGlvbiBsaW1pdCByZWFjaGVkLlwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBJbnZhbGlkU2hpcExlbmd0aEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJJbnZhbGlkIHNoaXAgbGVuZ3RoLlwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJJbnZhbGlkU2hpcExlbmd0aEVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgSW52YWxpZFNoaXBUeXBlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIkludmFsaWQgc2hpcCB0eXBlLlwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJJbnZhbGlkU2hpcFR5cGVFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRQbGF5ZXJUeXBlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2UgPSBcIkludmFsaWQgcGxheWVyIHR5cGUuIFZhbGlkIHBsYXllciB0eXBlczogJ2h1bWFuJyAmICdjb21wdXRlcidcIixcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJJbnZhbGlkU2hpcFR5cGVFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJJbnZhbGlkIHNoaXAgcGxhY2VtZW50LiBCb3VuZGFyeSBlcnJvciFcIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBSZXBlYXRBdHRhY2tlZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJJbnZhbGlkIGF0dGFjayBlbnRyeS4gUG9zaXRpb24gYWxyZWFkeSBhdHRhY2tlZCFcIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiUmVwZWF0QXR0YWNrRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBJbnZhbGlkTW92ZUVudHJ5RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIkludmFsaWQgbW92ZSBlbnRyeSFcIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiSW52YWxpZE1vdmVFbnRyeUVycm9yXCI7XG4gIH1cbn1cblxuZXhwb3J0IHtcbiAgT3ZlcmxhcHBpbmdTaGlwc0Vycm9yLFxuICBTaGlwQWxsb2NhdGlvblJlYWNoZWRFcnJvcixcbiAgU2hpcFR5cGVBbGxvY2F0aW9uUmVhY2hlZEVycm9yLFxuICBJbnZhbGlkU2hpcExlbmd0aEVycm9yLFxuICBJbnZhbGlkU2hpcFR5cGVFcnJvcixcbiAgSW52YWxpZFBsYXllclR5cGVFcnJvcixcbiAgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IsXG4gIFJlcGVhdEF0dGFja2VkRXJyb3IsXG4gIEludmFsaWRNb3ZlRW50cnlFcnJvcixcbn07XG4iLCJpbXBvcnQgUGxheWVyIGZyb20gXCIuL3BsYXllclwiO1xuaW1wb3J0IEdhbWVib2FyZCBmcm9tIFwiLi9nYW1lYm9hcmRcIjtcbmltcG9ydCBTaGlwIGZyb20gXCIuL3NoaXBcIjtcbmltcG9ydCB7IEludmFsaWRQbGF5ZXJUeXBlRXJyb3IgfSBmcm9tIFwiLi9lcnJvcnNcIjtcblxuY29uc3QgR2FtZSA9ICgpID0+IHtcbiAgLy8gSW5pdGlhbGlzZSwgY3JlYXRlIGdhbWVib2FyZHMgZm9yIGJvdGggcGxheWVycyBhbmQgY3JlYXRlIHBsYXllcnMgb2YgdHlwZXMgaHVtYW4gYW5kIGNvbXB1dGVyXG4gIGNvbnN0IGh1bWFuR2FtZWJvYXJkID0gR2FtZWJvYXJkKFNoaXApO1xuICBjb25zdCBjb21wdXRlckdhbWVib2FyZCA9IEdhbWVib2FyZChTaGlwKTtcbiAgY29uc3QgaHVtYW5QbGF5ZXIgPSBQbGF5ZXIoaHVtYW5HYW1lYm9hcmQsIFwiaHVtYW5cIik7XG4gIGNvbnN0IGNvbXB1dGVyUGxheWVyID0gUGxheWVyKGNvbXB1dGVyR2FtZWJvYXJkLCBcImNvbXB1dGVyXCIpO1xuICBsZXQgY3VycmVudFBsYXllcjtcbiAgbGV0IGdhbWVPdmVyU3RhdGUgPSBmYWxzZTtcblxuICAvLyBTdG9yZSBwbGF5ZXJzIGluIGEgcGxheWVyIG9iamVjdFxuICBjb25zdCBwbGF5ZXJzID0geyBodW1hbjogaHVtYW5QbGF5ZXIsIGNvbXB1dGVyOiBjb21wdXRlclBsYXllciB9O1xuXG4gIC8vIFNldCB1cCBwaGFzZVxuICBjb25zdCBzZXRVcCA9ICgpID0+IHtcbiAgICAvLyBBdXRvbWF0aWMgcGxhY2VtZW50IGZvciBjb21wdXRlclxuICAgIGNvbXB1dGVyUGxheWVyLnBsYWNlU2hpcHMoKTtcblxuICAgIC8vIFNldCB0aGUgY3VycmVudCBwbGF5ZXIgdG8gaHVtYW4gcGxheWVyXG4gICAgY3VycmVudFBsYXllciA9IGh1bWFuUGxheWVyO1xuICB9O1xuXG4gIC8vIEdhbWUgZW5kaW5nIGZ1bmN0aW9uXG4gIGNvbnN0IGVuZEdhbWUgPSAoKSA9PiB7XG4gICAgZ2FtZU92ZXJTdGF0ZSA9IHRydWU7XG4gIH07XG5cbiAgLy8gVGFrZSB0dXJuIG1ldGhvZFxuICBjb25zdCB0YWtlVHVybiA9IChtb3ZlKSA9PiB7XG4gICAgbGV0IGZlZWRiYWNrO1xuXG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBvcHBvbmVudCBiYXNlZCBvbiB0aGUgY3VycmVudCBwbGF5ZXJcbiAgICBjb25zdCBvcHBvbmVudCA9XG4gICAgICBjdXJyZW50UGxheWVyID09PSBodW1hblBsYXllciA/IGNvbXB1dGVyUGxheWVyIDogaHVtYW5QbGF5ZXI7XG5cbiAgICAvLyBDYWxsIHRoZSBtYWtlTW92ZSBtZXRob2Qgb24gdGhlIGN1cnJlbnQgcGxheWVyIHdpdGggdGhlIG9wcG9uZW50J3MgZ2FtZWJvYXJkIGFuZCBzdG9yZSBhcyBtb3ZlIGZlZWRiYWNrXG4gICAgY29uc3QgcmVzdWx0ID0gY3VycmVudFBsYXllci5tYWtlTW92ZShvcHBvbmVudC5nYW1lYm9hcmQsIG1vdmUpO1xuXG4gICAgLy8gSWYgcmVzdWx0IGlzIGEgaGl0LCBjaGVjayB3aGV0aGVyIHRoZSBzaGlwIGlzIHN1bmtcbiAgICBpZiAocmVzdWx0LmhpdCkge1xuICAgICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgc2hpcCBpcyBzdW5rIGFuZCBhZGQgcmVzdWx0IGFzIHZhbHVlIHRvIGZlZWRiYWNrIG9iamVjdCB3aXRoIGtleSBcImlzU2hpcFN1bmtcIlxuICAgICAgaWYgKG9wcG9uZW50LmdhbWVib2FyZC5pc1NoaXBTdW5rKHJlc3VsdC5zaGlwVHlwZSkpIHtcbiAgICAgICAgZmVlZGJhY2sgPSB7XG4gICAgICAgICAgLi4ucmVzdWx0LFxuICAgICAgICAgIGlzU2hpcFN1bms6IHRydWUsXG4gICAgICAgICAgZ2FtZVdvbjogb3Bwb25lbnQuZ2FtZWJvYXJkLmNoZWNrQWxsU2hpcHNTdW5rKCksXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmZWVkYmFjayA9IHsgLi4ucmVzdWx0LCBpc1NoaXBTdW5rOiBmYWxzZSB9O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXJlc3VsdC5oaXQpIHtcbiAgICAgIC8vIFNldCBmZWVkYmFjayB0byBqdXN0IHRoZSByZXN1bHRcbiAgICAgIGZlZWRiYWNrID0gcmVzdWx0O1xuICAgIH1cblxuICAgIC8vIElmIGdhbWUgaXMgd29uLCBlbmQgZ2FtZVxuICAgIGlmIChmZWVkYmFjay5nYW1lV29uKSB7XG4gICAgICBlbmRHYW1lKCk7XG4gICAgfVxuXG4gICAgLy8gU3dpdGNoIHRoZSBjdXJyZW50IHBsYXllclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBvcHBvbmVudDtcblxuICAgIC8vIFJldHVybiB0aGUgZmVlZGJhY2sgZm9yIHRoZSBtb3ZlXG4gICAgcmV0dXJuIGZlZWRiYWNrO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgZ2V0IGN1cnJlbnRQbGF5ZXIoKSB7XG4gICAgICByZXR1cm4gY3VycmVudFBsYXllcjtcbiAgICB9LFxuICAgIGdldCBnYW1lT3ZlclN0YXRlKCkge1xuICAgICAgcmV0dXJuIGdhbWVPdmVyU3RhdGU7XG4gICAgfSxcbiAgICBwbGF5ZXJzLFxuICAgIHNldFVwLFxuICAgIHRha2VUdXJuLFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgR2FtZTtcbiIsImltcG9ydCB7XG4gIFNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvcixcbiAgT3ZlcmxhcHBpbmdTaGlwc0Vycm9yLFxuICBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvcixcbiAgUmVwZWF0QXR0YWNrZWRFcnJvcixcbn0gZnJvbSBcIi4vZXJyb3JzXCI7XG5cbmNvbnN0IGdyaWQgPSBbXG4gIFtcIkExXCIsIFwiQTJcIiwgXCJBM1wiLCBcIkE0XCIsIFwiQTVcIiwgXCJBNlwiLCBcIkE3XCIsIFwiQThcIiwgXCJBOVwiLCBcIkExMFwiXSxcbiAgW1wiQjFcIiwgXCJCMlwiLCBcIkIzXCIsIFwiQjRcIiwgXCJCNVwiLCBcIkI2XCIsIFwiQjdcIiwgXCJCOFwiLCBcIkI5XCIsIFwiQjEwXCJdLFxuICBbXCJDMVwiLCBcIkMyXCIsIFwiQzNcIiwgXCJDNFwiLCBcIkM1XCIsIFwiQzZcIiwgXCJDN1wiLCBcIkM4XCIsIFwiQzlcIiwgXCJDMTBcIl0sXG4gIFtcIkQxXCIsIFwiRDJcIiwgXCJEM1wiLCBcIkQ0XCIsIFwiRDVcIiwgXCJENlwiLCBcIkQ3XCIsIFwiRDhcIiwgXCJEOVwiLCBcIkQxMFwiXSxcbiAgW1wiRTFcIiwgXCJFMlwiLCBcIkUzXCIsIFwiRTRcIiwgXCJFNVwiLCBcIkU2XCIsIFwiRTdcIiwgXCJFOFwiLCBcIkU5XCIsIFwiRTEwXCJdLFxuICBbXCJGMVwiLCBcIkYyXCIsIFwiRjNcIiwgXCJGNFwiLCBcIkY1XCIsIFwiRjZcIiwgXCJGN1wiLCBcIkY4XCIsIFwiRjlcIiwgXCJGMTBcIl0sXG4gIFtcIkcxXCIsIFwiRzJcIiwgXCJHM1wiLCBcIkc0XCIsIFwiRzVcIiwgXCJHNlwiLCBcIkc3XCIsIFwiRzhcIiwgXCJHOVwiLCBcIkcxMFwiXSxcbiAgW1wiSDFcIiwgXCJIMlwiLCBcIkgzXCIsIFwiSDRcIiwgXCJINVwiLCBcIkg2XCIsIFwiSDdcIiwgXCJIOFwiLCBcIkg5XCIsIFwiSDEwXCJdLFxuICBbXCJJMVwiLCBcIkkyXCIsIFwiSTNcIiwgXCJJNFwiLCBcIkk1XCIsIFwiSTZcIiwgXCJJN1wiLCBcIkk4XCIsIFwiSTlcIiwgXCJJMTBcIl0sXG4gIFtcIkoxXCIsIFwiSjJcIiwgXCJKM1wiLCBcIko0XCIsIFwiSjVcIiwgXCJKNlwiLCBcIko3XCIsIFwiSjhcIiwgXCJKOVwiLCBcIkoxMFwiXSxcbl07XG5cbmNvbnN0IGluZGV4Q2FsY3MgPSAoc3RhcnQpID0+IHtcbiAgY29uc3QgY29sTGV0dGVyID0gc3RhcnRbMF0udG9VcHBlckNhc2UoKTsgLy8gVGhpcyBpcyB0aGUgY29sdW1uXG4gIGNvbnN0IHJvd051bWJlciA9IHBhcnNlSW50KHN0YXJ0LnNsaWNlKDEpLCAxMCk7IC8vIFRoaXMgaXMgdGhlIHJvd1xuXG4gIGNvbnN0IGNvbEluZGV4ID0gY29sTGV0dGVyLmNoYXJDb2RlQXQoMCkgLSBcIkFcIi5jaGFyQ29kZUF0KDApOyAvLyBDb2x1bW4gaW5kZXggYmFzZWQgb24gbGV0dGVyXG4gIGNvbnN0IHJvd0luZGV4ID0gcm93TnVtYmVyIC0gMTsgLy8gUm93IGluZGV4IGJhc2VkIG9uIG51bWJlclxuXG4gIHJldHVybiBbY29sSW5kZXgsIHJvd0luZGV4XTsgLy8gUmV0dXJuIFtyb3csIGNvbHVtbl1cbn07XG5cbmNvbnN0IGNoZWNrVHlwZSA9IChzaGlwLCBzaGlwUG9zaXRpb25zKSA9PiB7XG4gIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgc2hpcFBvc2l0aW9ucyBvYmplY3RcbiAgT2JqZWN0LmtleXMoc2hpcFBvc2l0aW9ucykuZm9yRWFjaCgoZXhpc3RpbmdTaGlwVHlwZSkgPT4ge1xuICAgIGlmIChleGlzdGluZ1NoaXBUeXBlID09PSBzaGlwKSB7XG4gICAgICB0aHJvdyBuZXcgU2hpcFR5cGVBbGxvY2F0aW9uUmVhY2hlZEVycm9yKHNoaXApO1xuICAgIH1cbiAgfSk7XG59O1xuXG5jb25zdCBjaGVja0JvdW5kYXJpZXMgPSAoc2hpcExlbmd0aCwgY29vcmRzLCBkaXJlY3Rpb24pID0+IHtcbiAgLy8gU2V0IHJvdyBhbmQgY29sIGxpbWl0c1xuICBjb25zdCB4TGltaXQgPSBncmlkLmxlbmd0aDsgLy8gVGhpcyBpcyB0aGUgdG90YWwgbnVtYmVyIG9mIGNvbHVtbnMgKHgpXG4gIGNvbnN0IHlMaW1pdCA9IGdyaWRbMF0ubGVuZ3RoOyAvLyBUaGlzIGlzIHRoZSB0b3RhbCBudW1iZXIgb2Ygcm93cyAoeSlcblxuICBjb25zdCB4ID0gY29vcmRzWzBdO1xuICBjb25zdCB5ID0gY29vcmRzWzFdO1xuXG4gIC8vIENoZWNrIGZvciB2YWxpZCBzdGFydCBwb3NpdGlvbiBvbiBib2FyZFxuICBpZiAoeCA8IDAgfHwgeCA+PSB4TGltaXQgfHwgeSA8IDAgfHwgeSA+PSB5TGltaXQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBDaGVjayByaWdodCBib3VuZGFyeSBmb3IgaG9yaXpvbnRhbCBwbGFjZW1lbnRcbiAgaWYgKGRpcmVjdGlvbiA9PT0gXCJoXCIgJiYgeCArIHNoaXBMZW5ndGggPiB4TGltaXQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gQ2hlY2sgYm90dG9tIGJvdW5kYXJ5IGZvciB2ZXJ0aWNhbCBwbGFjZW1lbnRcbiAgaWYgKGRpcmVjdGlvbiA9PT0gXCJ2XCIgJiYgeSArIHNoaXBMZW5ndGggPiB5TGltaXQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBJZiBub25lIG9mIHRoZSBpbnZhbGlkIGNvbmRpdGlvbnMgYXJlIG1ldCwgcmV0dXJuIHRydWVcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5jb25zdCBjYWxjdWxhdGVTaGlwUG9zaXRpb25zID0gKHNoaXBMZW5ndGgsIGNvb3JkcywgZGlyZWN0aW9uKSA9PiB7XG4gIGNvbnN0IGNvbEluZGV4ID0gY29vcmRzWzBdOyAvLyBUaGlzIGlzIHRoZSBjb2x1bW4gaW5kZXhcbiAgY29uc3Qgcm93SW5kZXggPSBjb29yZHNbMV07IC8vIFRoaXMgaXMgdGhlIHJvdyBpbmRleFxuXG4gIGNvbnN0IHBvc2l0aW9ucyA9IFtdO1xuXG4gIGlmIChkaXJlY3Rpb24udG9Mb3dlckNhc2UoKSA9PT0gXCJoXCIpIHtcbiAgICAvLyBIb3Jpem9udGFsIHBsYWNlbWVudDogaW5jcmVtZW50IHRoZSBjb2x1bW4gaW5kZXhcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoaXBMZW5ndGg7IGkrKykge1xuICAgICAgcG9zaXRpb25zLnB1c2goZ3JpZFtjb2xJbmRleCArIGldW3Jvd0luZGV4XSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIFZlcnRpY2FsIHBsYWNlbWVudDogaW5jcmVtZW50IHRoZSByb3cgaW5kZXhcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoaXBMZW5ndGg7IGkrKykge1xuICAgICAgcG9zaXRpb25zLnB1c2goZ3JpZFtjb2xJbmRleF1bcm93SW5kZXggKyBpXSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBvc2l0aW9ucztcbn07XG5cbmNvbnN0IGNoZWNrRm9yT3ZlcmxhcCA9IChwb3NpdGlvbnMsIHNoaXBQb3NpdGlvbnMpID0+IHtcbiAgT2JqZWN0LmVudHJpZXMoc2hpcFBvc2l0aW9ucykuZm9yRWFjaCgoW3NoaXBUeXBlLCBleGlzdGluZ1NoaXBQb3NpdGlvbnNdKSA9PiB7XG4gICAgaWYgKFxuICAgICAgcG9zaXRpb25zLnNvbWUoKHBvc2l0aW9uKSA9PiBleGlzdGluZ1NoaXBQb3NpdGlvbnMuaW5jbHVkZXMocG9zaXRpb24pKVxuICAgICkge1xuICAgICAgdGhyb3cgbmV3IE92ZXJsYXBwaW5nU2hpcHNFcnJvcihcbiAgICAgICAgYE92ZXJsYXAgZGV0ZWN0ZWQgd2l0aCBzaGlwIHR5cGUgJHtzaGlwVHlwZX1gLFxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgY2hlY2tGb3JIaXQgPSAocG9zaXRpb24sIHNoaXBQb3NpdGlvbnMpID0+IHtcbiAgY29uc3QgZm91bmRTaGlwID0gT2JqZWN0LmVudHJpZXMoc2hpcFBvc2l0aW9ucykuZmluZChcbiAgICAoW18sIGV4aXN0aW5nU2hpcFBvc2l0aW9uc10pID0+IGV4aXN0aW5nU2hpcFBvc2l0aW9ucy5pbmNsdWRlcyhwb3NpdGlvbiksXG4gICk7XG5cbiAgcmV0dXJuIGZvdW5kU2hpcCA/IHsgaGl0OiB0cnVlLCBzaGlwVHlwZTogZm91bmRTaGlwWzBdIH0gOiB7IGhpdDogZmFsc2UgfTtcbn07XG5cbmNvbnN0IEdhbWVib2FyZCA9IChzaGlwRmFjdG9yeSkgPT4ge1xuICBjb25zdCBzaGlwcyA9IHt9O1xuICBjb25zdCBzaGlwUG9zaXRpb25zID0ge307XG4gIGNvbnN0IGhpdFBvc2l0aW9ucyA9IHt9O1xuICBjb25zdCBhdHRhY2tMb2cgPSBbW10sIFtdXTtcblxuICBjb25zdCBwbGFjZVNoaXAgPSAodHlwZSwgc3RhcnQsIGRpcmVjdGlvbikgPT4ge1xuICAgIGNvbnN0IG5ld1NoaXAgPSBzaGlwRmFjdG9yeSh0eXBlKTtcblxuICAgIC8vIENoZWNrIHRoZSBzaGlwIHR5cGUgYWdhaW5zdCBleGlzdGluZyB0eXBlc1xuICAgIGNoZWNrVHlwZSh0eXBlLCBzaGlwUG9zaXRpb25zKTtcblxuICAgIC8vIENhbGN1bGF0ZSBzdGFydCBwb2ludCBjb29yZGluYXRlcyBiYXNlZCBvbiBzdGFydCBwb2ludCBncmlkIGtleVxuICAgIGNvbnN0IGNvb3JkcyA9IGluZGV4Q2FsY3Moc3RhcnQpO1xuXG4gICAgLy8gQ2hlY2sgYm91bmRhcmllcywgaWYgb2sgY29udGludWUgdG8gbmV4dCBzdGVwXG4gICAgaWYgKGNoZWNrQm91bmRhcmllcyhuZXdTaGlwLnNoaXBMZW5ndGgsIGNvb3JkcywgZGlyZWN0aW9uKSkge1xuICAgICAgLy8gQ2FsY3VsYXRlIGFuZCBzdG9yZSBwb3NpdGlvbnMgZm9yIGEgbmV3IHNoaXBcbiAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IGNhbGN1bGF0ZVNoaXBQb3NpdGlvbnMoXG4gICAgICAgIG5ld1NoaXAuc2hpcExlbmd0aCxcbiAgICAgICAgY29vcmRzLFxuICAgICAgICBkaXJlY3Rpb24sXG4gICAgICApO1xuXG4gICAgICAvLyBDaGVjayBmb3Igb3ZlcmxhcCBiZWZvcmUgcGxhY2luZyB0aGUgc2hpcFxuICAgICAgY2hlY2tGb3JPdmVybGFwKHBvc2l0aW9ucywgc2hpcFBvc2l0aW9ucyk7XG5cbiAgICAgIC8vIElmIG5vIG92ZXJsYXAsIHByb2NlZWQgdG8gcGxhY2Ugc2hpcFxuICAgICAgc2hpcFBvc2l0aW9uc1t0eXBlXSA9IHBvc2l0aW9ucztcbiAgICAgIC8vIEFkZCBzaGlwIHRvIHNoaXBzIG9iamVjdFxuICAgICAgc2hpcHNbdHlwZV0gPSBuZXdTaGlwO1xuXG4gICAgICAvLyBJbml0aWFsaXNlIGhpdFBvc2l0aW9ucyBmb3IgdGhpcyBzaGlwIHR5cGUgYXMgYW4gZW1wdHkgYXJyYXlcbiAgICAgIGhpdFBvc2l0aW9uc1t0eXBlXSA9IFtdO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIHNoaXAgcGxhY2VtZW50LiBCb3VuZGFyeSBlcnJvciEgU2hpcCB0eXBlOiAke3R5cGV9YCxcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJlZ2lzdGVyIGFuIGF0dGFjayBhbmQgdGVzdCBmb3IgdmFsaWQgaGl0XG4gIGNvbnN0IGF0dGFjayA9IChwb3NpdGlvbikgPT4ge1xuICAgIGxldCByZXNwb25zZTtcblxuICAgIC8vIENoZWNrIGZvciB2YWxpZCBhdHRhY2tcbiAgICBpZiAoYXR0YWNrTG9nWzBdLmluY2x1ZGVzKHBvc2l0aW9uKSB8fCBhdHRhY2tMb2dbMV0uaW5jbHVkZXMocG9zaXRpb24pKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhgUmVwZWF0IGF0dGFjazogJHtwb3NpdGlvbn1gKTtcbiAgICAgIHRocm93IG5ldyBSZXBlYXRBdHRhY2tlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGhpdFxuICAgIGNvbnN0IGNoZWNrUmVzdWx0cyA9IGNoZWNrRm9ySGl0KHBvc2l0aW9uLCBzaGlwUG9zaXRpb25zKTtcbiAgICBpZiAoY2hlY2tSZXN1bHRzLmhpdCkge1xuICAgICAgLy8gUmVnaXN0ZXIgdmFsaWQgaGl0XG4gICAgICBoaXRQb3NpdGlvbnNbY2hlY2tSZXN1bHRzLnNoaXBUeXBlXS5wdXNoKHBvc2l0aW9uKTtcbiAgICAgIHNoaXBzW2NoZWNrUmVzdWx0cy5zaGlwVHlwZV0uaGl0KCk7XG5cbiAgICAgIC8vIExvZyB0aGUgYXR0YWNrIGFzIGEgdmFsaWQgaGl0XG4gICAgICBhdHRhY2tMb2dbMF0ucHVzaChwb3NpdGlvbik7XG4gICAgICByZXNwb25zZSA9IHsgLi4uY2hlY2tSZXN1bHRzIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGBNSVNTITogJHtwb3NpdGlvbn1gKTtcbiAgICAgIC8vIExvZyB0aGUgYXR0YWNrIGFzIGEgbWlzc1xuICAgICAgYXR0YWNrTG9nWzFdLnB1c2gocG9zaXRpb24pO1xuICAgICAgcmVzcG9uc2UgPSB7IC4uLmNoZWNrUmVzdWx0cyB9O1xuICAgIH1cblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfTtcblxuICBjb25zdCBpc1NoaXBTdW5rID0gKHR5cGUpID0+IHNoaXBzW3R5cGVdLmlzU3VuaztcblxuICBjb25zdCBjaGVja0FsbFNoaXBzU3VuayA9ICgpID0+XG4gICAgT2JqZWN0LmVudHJpZXMoc2hpcHMpLmV2ZXJ5KChbc2hpcFR5cGUsIHNoaXBdKSA9PiBzaGlwLmlzU3Vuayk7XG5cbiAgLy8gRnVuY3Rpb24gZm9yIHJlcG9ydGluZyB0aGUgbnVtYmVyIG9mIHNoaXBzIGxlZnQgYWZsb2F0XG4gIGNvbnN0IHNoaXBSZXBvcnQgPSAoKSA9PiB7XG4gICAgY29uc3QgZmxvYXRpbmdTaGlwcyA9IE9iamVjdC5lbnRyaWVzKHNoaXBzKVxuICAgICAgLmZpbHRlcigoW3NoaXBUeXBlLCBzaGlwXSkgPT4gIXNoaXAuaXNTdW5rKVxuICAgICAgLm1hcCgoW3NoaXBUeXBlLCBfXSkgPT4gc2hpcFR5cGUpO1xuXG4gICAgcmV0dXJuIFtmbG9hdGluZ1NoaXBzLmxlbmd0aCwgZmxvYXRpbmdTaGlwc107XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBnZXQgZ3JpZCgpIHtcbiAgICAgIHJldHVybiBncmlkO1xuICAgIH0sXG4gICAgZ2V0IHNoaXBzKCkge1xuICAgICAgcmV0dXJuIHNoaXBzO1xuICAgIH0sXG4gICAgZ2V0IGF0dGFja0xvZygpIHtcbiAgICAgIHJldHVybiBhdHRhY2tMb2c7XG4gICAgfSxcbiAgICBnZXRTaGlwOiAoc2hpcFR5cGUpID0+IHNoaXBzW3NoaXBUeXBlXSxcbiAgICBnZXRTaGlwUG9zaXRpb25zOiAoc2hpcFR5cGUpID0+IHNoaXBQb3NpdGlvbnNbc2hpcFR5cGVdLFxuICAgIGdldEhpdFBvc2l0aW9uczogKHNoaXBUeXBlKSA9PiBoaXRQb3NpdGlvbnNbc2hpcFR5cGVdLFxuICAgIHBsYWNlU2hpcCxcbiAgICBhdHRhY2ssXG4gICAgaXNTaGlwU3VuayxcbiAgICBjaGVja0FsbFNoaXBzU3VuayxcbiAgICBzaGlwUmVwb3J0LFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgR2FtZWJvYXJkO1xuIiwiaW1wb3J0IFwiLi9zdHlsZXMuY3NzXCI7XG5pbXBvcnQgR2FtZSBmcm9tIFwiLi9nYW1lXCI7XG5pbXBvcnQgVWlNYW5hZ2VyIGZyb20gXCIuL3VpTWFuYWdlclwiO1xuaW1wb3J0IEFjdGlvbkNvbnRyb2xsZXIgZnJvbSBcIi4vYWN0aW9uQ29udHJvbGxlclwiO1xuXG4vLyBDcmVhdGUgYSBuZXcgVUkgbWFuYWdlclxuY29uc3QgbmV3VWlNYW5hZ2VyID0gVWlNYW5hZ2VyKCk7XG5cbi8vIEluc3RhbnRpYXRlIGEgbmV3IGdhbWVcbmNvbnN0IG5ld0dhbWUgPSBHYW1lKCk7XG5cbi8vIENyZWF0ZSBhIG5ldyBhY3Rpb24gY29udHJvbGxlclxuY29uc3QgYWN0Q29udHJvbGxlciA9IEFjdGlvbkNvbnRyb2xsZXIobmV3VWlNYW5hZ2VyLCBuZXdHYW1lKTtcblxuLy8gV2FpdCBmb3IgdGhlIGdhbWUgdG8gYmUgc2V0dXAgd2l0aCBzaGlwIHBsYWNlbWVudHMgZXRjLlxuYXdhaXQgYWN0Q29udHJvbGxlci5oYW5kbGVTZXR1cCgpO1xuXG4vLyBPbmNlIHJlYWR5LCBjYWxsIHRoZSBwbGF5R2FtZSBtZXRob2RcbmF3YWl0IGFjdENvbnRyb2xsZXIucGxheUdhbWUoKTtcblxuLy8gQ29uc29sZSBsb2cgdGhlIHBsYXllcnNcbmNvbnNvbGUubG9nKFxuICBgUGxheWVyczogRmlyc3QgcGxheWVyIG9mIHR5cGUgJHtuZXdHYW1lLnBsYXllcnMuaHVtYW4udHlwZX0sIHNlY29uZCBwbGF5ZXIgb2YgdHlwZSAke25ld0dhbWUucGxheWVycy5jb21wdXRlci50eXBlfSFgLFxuKTtcbiIsImltcG9ydCB7XG4gIEludmFsaWRQbGF5ZXJUeXBlRXJyb3IsXG4gIEludmFsaWRNb3ZlRW50cnlFcnJvcixcbiAgUmVwZWF0QXR0YWNrZWRFcnJvcixcbiAgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IsXG4gIE92ZXJsYXBwaW5nU2hpcHNFcnJvcixcbn0gZnJvbSBcIi4vZXJyb3JzXCI7XG5cbmNvbnN0IGNoZWNrTW92ZSA9IChtb3ZlLCBnYkdyaWQpID0+IHtcbiAgbGV0IHZhbGlkID0gZmFsc2U7XG5cbiAgZ2JHcmlkLmZvckVhY2goKGVsKSA9PiB7XG4gICAgaWYgKGVsLmZpbmQoKHApID0+IHAgPT09IG1vdmUpKSB7XG4gICAgICB2YWxpZCA9IHRydWU7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gdmFsaWQ7XG59O1xuXG5jb25zdCByYW5kTW92ZSA9IChncmlkLCBtb3ZlTG9nKSA9PiB7XG4gIC8vIEZsYXR0ZW4gdGhlIGdyaWQgaW50byBhIHNpbmdsZSBhcnJheSBvZiBtb3Zlc1xuICBjb25zdCBhbGxNb3ZlcyA9IGdyaWQuZmxhdE1hcCgocm93KSA9PiByb3cpO1xuXG4gIC8vIEZpbHRlciBvdXQgdGhlIG1vdmVzIHRoYXQgYXJlIGFscmVhZHkgaW4gdGhlIG1vdmVMb2dcbiAgY29uc3QgcG9zc2libGVNb3ZlcyA9IGFsbE1vdmVzLmZpbHRlcigobW92ZSkgPT4gIW1vdmVMb2cuaW5jbHVkZXMobW92ZSkpO1xuXG4gIC8vIFNlbGVjdCBhIHJhbmRvbSBtb3ZlIGZyb20gdGhlIHBvc3NpYmxlIG1vdmVzXG4gIGNvbnN0IHJhbmRvbU1vdmUgPVxuICAgIHBvc3NpYmxlTW92ZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcG9zc2libGVNb3Zlcy5sZW5ndGgpXTtcblxuICByZXR1cm4gcmFuZG9tTW92ZTtcbn07XG5cbmNvbnN0IGdlbmVyYXRlUmFuZG9tU3RhcnQgPSAoc2l6ZSwgZGlyZWN0aW9uLCBncmlkKSA9PiB7XG4gIGNvbnN0IHZhbGlkU3RhcnRzID0gW107XG5cbiAgaWYgKGRpcmVjdGlvbiA9PT0gXCJoXCIpIHtcbiAgICAvLyBGb3IgaG9yaXpvbnRhbCBvcmllbnRhdGlvbiwgbGltaXQgdGhlIGNvbHVtbnNcbiAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCBncmlkLmxlbmd0aCAtIHNpemUgKyAxOyBjb2wrKykge1xuICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgZ3JpZFtjb2xdLmxlbmd0aDsgcm93KyspIHtcbiAgICAgICAgdmFsaWRTdGFydHMucHVzaChncmlkW2NvbF1bcm93XSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEZvciB2ZXJ0aWNhbCBvcmllbnRhdGlvbiwgbGltaXQgdGhlIHJvd3NcbiAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBncmlkWzBdLmxlbmd0aCAtIHNpemUgKyAxOyByb3crKykge1xuICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgZ3JpZC5sZW5ndGg7IGNvbCsrKSB7XG4gICAgICAgIHZhbGlkU3RhcnRzLnB1c2goZ3JpZFtjb2xdW3Jvd10pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFJhbmRvbWx5IHNlbGVjdCBhIHN0YXJ0aW5nIHBvc2l0aW9uXG4gIGNvbnN0IHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdmFsaWRTdGFydHMubGVuZ3RoKTtcbiAgcmV0dXJuIHZhbGlkU3RhcnRzW3JhbmRvbUluZGV4XTtcbn07XG5cbmNvbnN0IGF1dG9QbGFjZW1lbnQgPSAoZ2FtZWJvYXJkKSA9PiB7XG4gIGNvbnN0IHNoaXBUeXBlcyA9IFtcbiAgICB7IHR5cGU6IFwiY2FycmllclwiLCBzaXplOiA1IH0sXG4gICAgeyB0eXBlOiBcImJhdHRsZXNoaXBcIiwgc2l6ZTogNCB9LFxuICAgIHsgdHlwZTogXCJjcnVpc2VyXCIsIHNpemU6IDMgfSxcbiAgICB7IHR5cGU6IFwic3VibWFyaW5lXCIsIHNpemU6IDMgfSxcbiAgICB7IHR5cGU6IFwiZGVzdHJveWVyXCIsIHNpemU6IDIgfSxcbiAgXTtcblxuICBzaGlwVHlwZXMuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgIGxldCBwbGFjZWQgPSBmYWxzZTtcbiAgICB3aGlsZSAoIXBsYWNlZCkge1xuICAgICAgY29uc3QgZGlyZWN0aW9uID0gTWF0aC5yYW5kb20oKSA8IDAuNSA/IFwiaFwiIDogXCJ2XCI7XG4gICAgICBjb25zdCBzdGFydCA9IGdlbmVyYXRlUmFuZG9tU3RhcnQoc2hpcC5zaXplLCBkaXJlY3Rpb24sIGdhbWVib2FyZC5ncmlkKTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZ2FtZWJvYXJkLnBsYWNlU2hpcChzaGlwLnR5cGUsIHN0YXJ0LCBkaXJlY3Rpb24pO1xuICAgICAgICBwbGFjZWQgPSB0cnVlO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICEoZXJyb3IgaW5zdGFuY2VvZiBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvcikgJiZcbiAgICAgICAgICAhKGVycm9yIGluc3RhbmNlb2YgT3ZlcmxhcHBpbmdTaGlwc0Vycm9yKVxuICAgICAgICApIHtcbiAgICAgICAgICB0aHJvdyBlcnJvcjsgLy8gUmV0aHJvdyBub24tcGxhY2VtZW50IGVycm9yc1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHBsYWNlbWVudCBmYWlscywgY2F0Y2ggdGhlIGVycm9yIGFuZCB0cnkgYWdhaW5cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgUGxheWVyID0gKGdhbWVib2FyZCwgdHlwZSkgPT4ge1xuICBjb25zdCBtb3ZlTG9nID0gW107XG5cbiAgY29uc3QgcGxhY2VTaGlwcyA9IChzaGlwVHlwZSwgc3RhcnQsIGRpcmVjdGlvbikgPT4ge1xuICAgIGlmICh0eXBlID09PSBcImh1bWFuXCIpIHtcbiAgICAgIGdhbWVib2FyZC5wbGFjZVNoaXAoc2hpcFR5cGUsIHN0YXJ0LCBkaXJlY3Rpb24pO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJjb21wdXRlclwiKSB7XG4gICAgICBhdXRvUGxhY2VtZW50KGdhbWVib2FyZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGxheWVyVHlwZUVycm9yKFxuICAgICAgICBgSW52YWxpZCBwbGF5ZXIgdHlwZS4gVmFsaWQgcGxheWVyIHR5cGVzOiBcImh1bWFuXCIgJiBcImNvbXB1dGVyXCIuIEVudGVyZWQ6ICR7dHlwZX0uYCxcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IG1ha2VNb3ZlID0gKG9wcEdhbWVib2FyZCwgaW5wdXQpID0+IHtcbiAgICBsZXQgbW92ZTtcblxuICAgIC8vIENoZWNrIGZvciB0aGUgdHlwZSBvZiBwbGF5ZXJcbiAgICBpZiAodHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICAvLyBGb3JtYXQgdGhlIGlucHV0XG4gICAgICBtb3ZlID0gYCR7aW5wdXQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCl9JHtpbnB1dC5zdWJzdHJpbmcoMSl9YDtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgbW92ZSA9IHJhbmRNb3ZlKG9wcEdhbWVib2FyZC5ncmlkLCBtb3ZlTG9nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQbGF5ZXJUeXBlRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIHBsYXllciB0eXBlLiBWYWxpZCBwbGF5ZXIgdHlwZXM6IFwiaHVtYW5cIiAmIFwiY29tcHV0ZXJcIi4gRW50ZXJlZDogJHt0eXBlfS5gLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayB0aGUgaW5wdXQgYWdhaW5zdCB0aGUgcG9zc2libGUgbW92ZXMgb24gdGhlIGdhbWVib2FyZCdzIGdyaWRcbiAgICBpZiAoIWNoZWNrTW92ZShtb3ZlLCBvcHBHYW1lYm9hcmQuZ3JpZCkpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkTW92ZUVudHJ5RXJyb3IoYEludmFsaWQgbW92ZSBlbnRyeSEgTW92ZTogJHttb3ZlfS5gKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgbW92ZSBleGlzdHMgaW4gdGhlIG1vdmVMb2cgYXJyYXksIHRocm93IGFuIGVycm9yXG4gICAgaWYgKG1vdmVMb2cuZmluZCgoZWwpID0+IGVsID09PSBtb3ZlKSkge1xuICAgICAgdGhyb3cgbmV3IFJlcGVhdEF0dGFja2VkRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBFbHNlLCBjYWxsIGF0dGFjayBtZXRob2Qgb24gZ2FtZWJvYXJkIGFuZCBsb2cgbW92ZSBpbiBtb3ZlTG9nXG4gICAgY29uc3QgcmVzcG9uc2UgPSBvcHBHYW1lYm9hcmQuYXR0YWNrKG1vdmUpO1xuICAgIG1vdmVMb2cucHVzaChtb3ZlKTtcbiAgICAvLyBSZXR1cm4gdGhlIHJlc3BvbnNlIG9mIHRoZSBhdHRhY2sgKG9iamVjdDogeyBoaXQ6IGZhbHNlIH0gZm9yIG1pc3M7IHsgaGl0OiB0cnVlLCBzaGlwVHlwZTogc3RyaW5nIH0gZm9yIGhpdCkuXG4gICAgcmV0dXJuIHsgcGxheWVyOiB0eXBlLCBtb3ZlLCAuLi5yZXNwb25zZSB9O1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgZ2V0IHR5cGUoKSB7XG4gICAgICByZXR1cm4gdHlwZTtcbiAgICB9LFxuICAgIGdldCBnYW1lYm9hcmQoKSB7XG4gICAgICByZXR1cm4gZ2FtZWJvYXJkO1xuICAgIH0sXG4gICAgZ2V0IG1vdmVMb2coKSB7XG4gICAgICByZXR1cm4gbW92ZUxvZztcbiAgICB9LFxuICAgIG1ha2VNb3ZlLFxuICAgIHBsYWNlU2hpcHMsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBQbGF5ZXI7XG4iLCJpbXBvcnQgeyBJbnZhbGlkU2hpcFR5cGVFcnJvciB9IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBTaGlwID0gKHR5cGUpID0+IHtcbiAgY29uc3Qgc2V0TGVuZ3RoID0gKCkgPT4ge1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSBcImNhcnJpZXJcIjpcbiAgICAgICAgcmV0dXJuIDU7XG4gICAgICBjYXNlIFwiYmF0dGxlc2hpcFwiOlxuICAgICAgICByZXR1cm4gNDtcbiAgICAgIGNhc2UgXCJjcnVpc2VyXCI6XG4gICAgICBjYXNlIFwic3VibWFyaW5lXCI6XG4gICAgICAgIHJldHVybiAzO1xuICAgICAgY2FzZSBcImRlc3Ryb3llclwiOlxuICAgICAgICByZXR1cm4gMjtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBJbnZhbGlkU2hpcFR5cGVFcnJvcigpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBzaGlwTGVuZ3RoID0gc2V0TGVuZ3RoKCk7XG5cbiAgbGV0IGhpdHMgPSAwO1xuXG4gIGNvbnN0IGhpdCA9ICgpID0+IHtcbiAgICBpZiAoaGl0cyA8IHNoaXBMZW5ndGgpIHtcbiAgICAgIGhpdHMgKz0gMTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBnZXQgdHlwZSgpIHtcbiAgICAgIHJldHVybiB0eXBlO1xuICAgIH0sXG4gICAgZ2V0IHNoaXBMZW5ndGgoKSB7XG4gICAgICByZXR1cm4gc2hpcExlbmd0aDtcbiAgICB9LFxuICAgIGdldCBoaXRzKCkge1xuICAgICAgcmV0dXJuIGhpdHM7XG4gICAgfSxcbiAgICBnZXQgaXNTdW5rKCkge1xuICAgICAgcmV0dXJuIGhpdHMgPT09IHNoaXBMZW5ndGg7XG4gICAgfSxcbiAgICBoaXQsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTaGlwO1xuIiwiLy8gRnVuY3Rpb24gZm9yIGJ1aWxkaW5nIGEgc2hpcCwgZGVwZW5kaW5nIG9uIHRoZSBzaGlwIHR5cGVcbmNvbnN0IGJ1aWxkU2hpcCA9IChvYmosIGRvbVNlbCwgc2hpcFBvc2l0aW9ucykgPT4ge1xuICAvLyBFeHRyYWN0IHRoZSBzaGlwJ3MgdHlwZSBhbmQgbGVuZ3RoIGZyb20gdGhlIG9iamVjdFxuICBjb25zdCB7IHR5cGUsIHNoaXBMZW5ndGg6IGxlbmd0aCB9ID0gb2JqO1xuICAvLyBDcmVhdGUgYW5kIGFycmF5IGZvciB0aGUgc2hpcCdzIHNlY3Rpb25zXG4gIGNvbnN0IHNoaXBTZWN0cyA9IFtdO1xuXG4gIC8vIFVzZSB0aGUgbGVuZ3RoIG9mIHRoZSBzaGlwIHRvIGNyZWF0ZSB0aGUgY29ycmVjdCBudW1iZXIgb2Ygc2VjdGlvbnNcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIC8vIEdldCBhIHBvc2l0aW9uIGZyb20gdGhlIGFycmF5XG4gICAgY29uc3QgcG9zaXRpb24gPSBzaGlwUG9zaXRpb25zW2ldO1xuICAgIC8vIENyZWF0ZSBhbiBlbGVtZW50IGZvciB0aGUgc2VjdGlvblxuICAgIGNvbnN0IHNlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHNlY3QuY2xhc3NOYW1lID0gXCJ3LTQgaC00IHJvdW5kZWQtZnVsbCBiZy1ncmF5LTgwMFwiOyAvLyBTZXQgdGhlIGRlZmF1bHQgc3R5bGluZyBmb3IgdGhlIHNlY3Rpb24gZWxlbWVudFxuICAgIC8vIFNldCBhIHVuaXF1ZSBpZCBmb3IgdGhlIHNoaXAgc2VjdGlvblxuICAgIHNlY3Quc2V0QXR0cmlidXRlKFwiaWRcIiwgYERPTS0ke2RvbVNlbH0tc2hpcFR5cGUtJHt0eXBlfS1wb3MtJHtwb3NpdGlvbn1gKTtcbiAgICAvLyBTZXQgYSBkYXRhc2V0IHByb3BlcnR5IG9mIFwicG9zaXRpb25cIiBmb3IgdGhlIHNlY3Rpb25cbiAgICBzZWN0LmRhdGFzZXQucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICBzaGlwU2VjdHMucHVzaChzZWN0KTsgLy8gQWRkIHRoZSBzZWN0aW9uIHRvIHRoZSBhcnJheVxuICB9XG5cbiAgLy8gUmV0dXJuIHRoZSBhcnJheSBvZiBzaGlwIHNlY3Rpb25zXG4gIHJldHVybiBzaGlwU2VjdHM7XG59O1xuXG5jb25zdCBVaU1hbmFnZXIgPSAoKSA9PiB7XG4gIGNvbnN0IGNyZWF0ZUdhbWVib2FyZCA9IChjb250YWluZXJJRCkgPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcklEKTtcblxuICAgIC8vIFNldCBwbGF5ZXIgdHlwZSBkZXBlbmRpbmcgb24gdGhlIGNvbnRhaW5lcklEXG4gICAgY29uc3QgeyBwbGF5ZXIgfSA9IGNvbnRhaW5lci5kYXRhc2V0O1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBncmlkIGNvbnRhaW5lclxuICAgIGNvbnN0IGdyaWREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGdyaWREaXYuY2xhc3NOYW1lID1cbiAgICAgIFwiZ2FtZWJvYXJkLWFyZWEgZ3JpZCBncmlkLWNvbHMtMTEgYXV0by1yb3dzLW1pbiBnYXAtMSBwLTZcIjtcbiAgICBncmlkRGl2LmRhdGFzZXQucGxheWVyID0gcGxheWVyO1xuXG4gICAgLy8gQWRkIHRoZSB0b3AtbGVmdCBjb3JuZXIgZW1wdHkgY2VsbFxuICAgIGdyaWREaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSk7XG5cbiAgICAvLyBBZGQgY29sdW1uIGhlYWRlcnMgQS1KXG4gICAgY29uc3QgY29sdW1ucyA9IFwiQUJDREVGR0hJSlwiO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sdW1ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIGhlYWRlci5jbGFzc05hbWUgPSBcInRleHQtY2VudGVyXCI7XG4gICAgICBoZWFkZXIudGV4dENvbnRlbnQgPSBjb2x1bW5zW2ldO1xuICAgICAgZ3JpZERpdi5hcHBlbmRDaGlsZChoZWFkZXIpO1xuICAgIH1cblxuICAgIC8vIEFkZCByb3cgbGFiZWxzIGFuZCBjZWxsc1xuICAgIGZvciAobGV0IHJvdyA9IDE7IHJvdyA8PSAxMDsgcm93KyspIHtcbiAgICAgIC8vIFJvdyBsYWJlbFxuICAgICAgY29uc3Qgcm93TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgcm93TGFiZWwuY2xhc3NOYW1lID0gXCJ0ZXh0LWNlbnRlclwiO1xuICAgICAgcm93TGFiZWwudGV4dENvbnRlbnQgPSByb3c7XG4gICAgICBncmlkRGl2LmFwcGVuZENoaWxkKHJvd0xhYmVsKTtcblxuICAgICAgLy8gQ2VsbHMgZm9yIGVhY2ggcm93XG4gICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCAxMDsgY29sKyspIHtcbiAgICAgICAgY29uc3QgY2VsbElkID0gYCR7Y29sdW1uc1tjb2xdfSR7cm93fWA7IC8vIFNldCB0aGUgY2VsbElkXG4gICAgICAgIGNvbnN0IGNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjZWxsLmlkID0gYCR7cGxheWVyfS0ke2NlbGxJZH1gOyAvLyBTZXQgdGhlIGVsZW1lbnQgaWRcbiAgICAgICAgY2VsbC5jbGFzc05hbWUgPVxuICAgICAgICAgIFwidy02IGgtNiBiZy1ncmF5LTIwMCBmbGV4IGp1c3RpZnktY2VudGVyIGl0ZW1zLWNlbnRlciBjdXJzb3ItcG9pbnRlciBob3ZlcjpiZy1vcmFuZ2UtNTAwXCI7IC8vIEFkZCBtb3JlIGNsYXNzZXMgYXMgbmVlZGVkIGZvciBzdHlsaW5nXG4gICAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChcImdhbWVib2FyZC1jZWxsXCIpOyAvLyBBZGQgYSBjbGFzcyBuYW1lIHRvIGVhY2ggY2VsbCB0byBhY3QgYXMgYSBzZWxlY3RvclxuICAgICAgICBjZWxsLmRhdGFzZXQucG9zaXRpb24gPSBjZWxsSWQ7IC8vIEFzc2lnbiBwb3NpdGlvbiBkYXRhIGF0dHJpYnV0ZSBmb3IgaWRlbnRpZmljYXRpb25cbiAgICAgICAgY2VsbC5kYXRhc2V0LnBsYXllciA9IHBsYXllcjsgLy8gQXNzaWduIHBsYXllciBkYXRhIGF0dHJpYnV0ZSBmb3IgaWRlbnRpZmljYXRpb25cblxuICAgICAgICBncmlkRGl2LmFwcGVuZENoaWxkKGNlbGwpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFwcGVuZCB0aGUgZ3JpZCB0byB0aGUgY29udGFpbmVyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGdyaWREaXYpO1xuICB9O1xuXG4gIGNvbnN0IGluaXRDb25zb2xlVUkgPSAoKSA9PiB7XG4gICAgY29uc3QgY29uc29sZUNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZVwiKTsgLy8gR2V0IHRoZSBjb25zb2xlIGNvbnRhaW5lciBmcm9tIHRoZSBET01cbiAgICBjb25zb2xlQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXG4gICAgICBcImZsZXhcIixcbiAgICAgIFwiZmxleC1jb2xcIixcbiAgICAgIFwianVzdGlmeS1iZXR3ZWVuXCIsXG4gICAgICBcInRleHQtc21cIixcbiAgICApOyAvLyBTZXQgZmxleGJveCBydWxlcyBmb3IgY29udGFpbmVyXG5cbiAgICAvLyBDcmVhdGUgYSBjb250YWluZXIgZm9yIHRoZSBpbnB1dCBhbmQgYnV0dG9uIGVsZW1lbnRzXG4gICAgY29uc3QgaW5wdXREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGlucHV0RGl2LmNsYXNzTmFtZSA9IFwiZmxleCBmbGV4LXJvdyB3LWZ1bGwgaC0xLzUganVzdGlmeS1iZXR3ZWVuXCI7IC8vIFNldCB0aGUgZmxleGJveCBydWxlcyBmb3IgdGhlIGNvbnRhaW5lclxuXG4gICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7IC8vIENyZWF0ZSBhbiBpbnB1dCBlbGVtZW50IGZvciB0aGUgY29uc29sZVxuICAgIGlucHV0LnR5cGUgPSBcInRleHRcIjsgLy8gU2V0IHRoZSBpbnB1dCB0eXBlIG9mIHRoaXMgZWxlbWVudCB0byB0ZXh0XG4gICAgaW5wdXQuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJjb25zb2xlLWlucHV0XCIpOyAvLyBTZXQgdGhlIGlkIGZvciB0aGlzIGVsZW1lbnQgdG8gXCJjb25zb2xlLWlucHV0XCJcbiAgICBpbnB1dC5jbGFzc05hbWUgPSBcInAtMSBiZy1ncmF5LTQwMCBmbGV4LTFcIjsgLy8gQWRkIFRhaWx3aW5kQ1NTIGNsYXNzZXNcbiAgICBjb25zdCBzdWJtaXRCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpOyAvLyBDcmVhdGUgYSBidXR0b24gZWxlbWVudCBmb3IgdGhlIGNvbnNvbGUgc3VibWl0XG4gICAgc3VibWl0QnV0dG9uLnRleHRDb250ZW50ID0gXCJTdWJtaXRcIjsgLy8gQWRkIHRoZSB0ZXh0IFwiU3VibWl0XCIgdG8gdGhlIGJ1dHRvblxuICAgIHN1Ym1pdEJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNvbnNvbGUtc3VibWl0XCIpOyAvLyBTZXQgdGhlIGlkIGZvciB0aGUgYnV0dG9uXG4gICAgc3VibWl0QnV0dG9uLmNsYXNzTmFtZSA9IFwicHgtMyBweS0xIGJnLWdyYXktODAwIHRleHQtY2VudGVyIHRleHQtc21cIjsgLy8gQWRkIFRhaWx3aW5kQ1NTIGNsYXNzZXNcbiAgICBjb25zdCBvdXRwdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpOyAvLyBDcmVhdGUgYW4gZGl2IGVsZW1lbnQgZm9yIHRoZSBvdXRwdXQgb2YgdGhlIGNvbnNvbGVcbiAgICBvdXRwdXQuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJjb25zb2xlLW91dHB1dFwiKTsgLy8gU2V0IHRoZSBpZCBmb3IgdGhlIG91dHB1dCBlbGVtZW50XG4gICAgb3V0cHV0LmNsYXNzTmFtZSA9IFwicC0xIGJnLWdyYXktMjAwIGZsZXgtMSBoLTQvNSBvdmVyZmxvdy1hdXRvXCI7IC8vIEFkZCBUYWlsd2luZENTUyBjbGFzc2VzXG5cbiAgICAvLyBBZGQgdGhlIGlucHV0IGVsZW1lbnRzIHRvIHRoZSBpbnB1dCBjb250YWluZXJcbiAgICBpbnB1dERpdi5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgaW5wdXREaXYuYXBwZW5kQ2hpbGQoc3VibWl0QnV0dG9uKTtcblxuICAgIC8vIEFwcGVuZCBlbGVtZW50cyB0byB0aGUgY29uc29sZSBjb250YWluZXJcbiAgICBjb25zb2xlQ29udGFpbmVyLmFwcGVuZENoaWxkKG91dHB1dCk7XG4gICAgY29uc29sZUNvbnRhaW5lci5hcHBlbmRDaGlsZChpbnB1dERpdik7XG4gIH07XG5cbiAgY29uc3QgZGlzcGxheVByb21wdCA9IChwcm9tcHRPYmpzKSA9PiB7XG4gICAgLy8gR2V0IHRoZSBwcm9tcHQgZGlzcGxheVxuICAgIGNvbnN0IGRpc3BsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByb21wdC1kaXNwbGF5XCIpO1xuXG4gICAgLy8gQ2xlYXIgdGhlIGRpc3BsYXkgb2YgYWxsIGNoaWxkcmVuXG4gICAgd2hpbGUgKGRpc3BsYXkuZmlyc3RDaGlsZCkge1xuICAgICAgZGlzcGxheS5yZW1vdmVDaGlsZChkaXNwbGF5LmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIC8vIEl0ZXJhdGUgb3ZlciBlYWNoIHByb21wdCBpbiB0aGUgcHJvbXB0cyBvYmplY3RcbiAgICBPYmplY3QuZW50cmllcyhwcm9tcHRPYmpzKS5mb3JFYWNoKChba2V5LCB7IHByb21wdCwgcHJvbXB0VHlwZSB9XSkgPT4ge1xuICAgICAgLy8gQ3JlYXRlIGEgbmV3IGRpdiBmb3IgZWFjaCBwcm9tcHRcbiAgICAgIGNvbnN0IHByb21wdERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBwcm9tcHREaXYudGV4dENvbnRlbnQgPSBwcm9tcHQ7XG5cbiAgICAgIC8vIEFwcGx5IHN0eWxpbmcgYmFzZWQgb24gcHJvbXB0VHlwZVxuICAgICAgc3dpdGNoIChwcm9tcHRUeXBlKSB7XG4gICAgICAgIGNhc2UgXCJpbnN0cnVjdGlvblwiOlxuICAgICAgICAgIHByb21wdERpdi5jbGFzc0xpc3QuYWRkKFwidGV4dC1saW1lLTYwMFwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImd1aWRlXCI6XG4gICAgICAgICAgcHJvbXB0RGl2LmNsYXNzTGlzdC5hZGQoXCJ0ZXh0LXNreS02MDBcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgICAgIHByb21wdERpdi5jbGFzc0xpc3QuYWRkKFwidGV4dC1yZWQtNzAwXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHByb21wdERpdi5jbGFzc0xpc3QuYWRkKFwidGV4dC1ncmF5LTgwMFwiKTsgLy8gRGVmYXVsdCB0ZXh0IGNvbG9yXG4gICAgICB9XG5cbiAgICAgIC8vIEFwcGVuZCB0aGUgbmV3IGRpdiB0byB0aGUgZGlzcGxheSBjb250YWluZXJcbiAgICAgIGRpc3BsYXkuYXBwZW5kQ2hpbGQocHJvbXB0RGl2KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiBmb3IgcmVuZGVyaW5nIHNoaXBzIHRvIHRoZSBTaGlwIFN0YXR1cyBkaXNwbGF5IHNlY3Rpb25cbiAgY29uc3QgcmVuZGVyU2hpcERpc3AgPSAocGxheWVyT2JqLCBzaGlwVHlwZSkgPT4ge1xuICAgIGxldCBpZFNlbDtcblxuICAgIC8vIFNldCB0aGUgY29ycmVjdCBpZCBzZWxlY3RvciBmb3IgdGhlIHR5cGUgb2YgcGxheWVyXG4gICAgaWYgKHBsYXllck9iai50eXBlID09PSBcImh1bWFuXCIpIHtcbiAgICAgIGlkU2VsID0gXCJodW1hbi1kaXNwbGF5XCI7XG4gICAgfSBlbHNlIGlmIChwbGF5ZXJPYmoudHlwZSA9PT0gXCJjb21wdXRlclwiKSB7XG4gICAgICBpZFNlbCA9IFwiY29tcC1kaXNwbGF5XCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yO1xuICAgIH1cblxuICAgIC8vIEdldCB0aGUgY29ycmVjdCBET00gZWxlbWVudFxuICAgIGNvbnN0IGRpc3BEaXYgPSBkb2N1bWVudFxuICAgICAgLmdldEVsZW1lbnRCeUlkKGlkU2VsKVxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCIuc2hpcHMtY29udGFpbmVyXCIpO1xuXG4gICAgLy8gR2V0IHRoZSBzaGlwIGZyb20gdGhlIHBsYXllclxuICAgIGNvbnN0IHNoaXAgPSBwbGF5ZXJPYmouZ2FtZWJvYXJkLmdldFNoaXAoc2hpcFR5cGUpO1xuXG4gICAgLy8gQ3JlYXRlIGEgZGl2IGZvciB0aGUgc2hpcFxuICAgIGNvbnN0IHNoaXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHNoaXBEaXYuY2xhc3NOYW1lID0gXCJweC00IHB5LTIgZmxleCBmbGV4LWNvbCBnYXAtMVwiO1xuXG4gICAgLy8gQWRkIGEgdGl0bGUgdGhlIHRoZSBkaXZcbiAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoMlwiKTtcbiAgICB0aXRsZS50ZXh0Q29udGVudCA9IHNoaXBUeXBlOyAvLyBTZXQgdGhlIHRpdGxlIHRvIHRoZSBzaGlwIHR5cGVcbiAgICBzaGlwRGl2LmFwcGVuZENoaWxkKHRpdGxlKTtcblxuICAgIC8vIEdldCB0aGUgc2hpcCBwb3NpdGlvbnMgYXJyYXlcbiAgICBjb25zdCBzaGlwUG9zaXRpb25zID0gcGxheWVyT2JqLmdhbWVib2FyZC5nZXRTaGlwUG9zaXRpb25zKHNoaXBUeXBlKTtcblxuICAgIC8vIEJ1aWxkIHRoZSBzaGlwIHNlY3Rpb25zXG4gICAgY29uc3Qgc2hpcFNlY3RzID0gYnVpbGRTaGlwKHNoaXAsIGlkU2VsLCBzaGlwUG9zaXRpb25zKTtcblxuICAgIC8vIEFkZCB0aGUgc2hpcCBzZWN0aW9ucyB0byB0aGUgZGl2XG4gICAgY29uc3Qgc2VjdHNEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHNlY3RzRGl2LmNsYXNzTmFtZSA9IFwiZmxleCBmbGV4LXJvdyBnYXAtMVwiO1xuICAgIHNoaXBTZWN0cy5mb3JFYWNoKChzZWN0KSA9PiB7XG4gICAgICBzZWN0c0Rpdi5hcHBlbmRDaGlsZChzZWN0KTtcbiAgICB9KTtcbiAgICBzaGlwRGl2LmFwcGVuZENoaWxkKHNlY3RzRGl2KTtcblxuICAgIGRpc3BEaXYuYXBwZW5kQ2hpbGQoc2hpcERpdik7XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gZm9yIHIgc2hpcHMgb24gdGhlIGdhbWVib2FyZFxuICBjb25zdCByZW5kZXJTaGlwQm9hcmQgPSAocGxheWVyT2JqLCBzaGlwVHlwZSkgPT4ge1xuICAgIGxldCBpZFNlbDtcblxuICAgIC8vIFNldCB0aGUgY29ycmVjdCBpZCBzZWxlY3RvciBmb3IgdGhlIHR5cGUgb2YgcGxheWVyXG4gICAgaWYgKHBsYXllck9iai50eXBlID09PSBcImh1bWFuXCIpIHtcbiAgICAgIGlkU2VsID0gXCJodW1hbi1ib2FyZFwiO1xuICAgIH0gZWxzZSBpZiAocGxheWVyT2JqLnR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgaWRTZWwgPSBcImNvbXAtYm9hcmRcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgRXJyb3IoXCJObyBtYXRjaGluZyBwbGF5ZXIgdHlwZSBpbiAncmVuZGVyU2hpcEJvYXJkJyBmdW5jdGlvblwiKTtcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIHBsYXllcidzIHR5cGUgYW5kIGdhbWVib2FyZFxuICAgIGNvbnN0IHsgdHlwZTogcGxheWVyVHlwZSwgZ2FtZWJvYXJkIH0gPSBwbGF5ZXJPYmo7XG5cbiAgICAvLyBHZXQgdGhlIHNoaXAgYW5kIHRoZSBzaGlwIHBvc2l0aW9uc1xuICAgIGNvbnN0IHNoaXBPYmogPSBnYW1lYm9hcmQuZ2V0U2hpcChzaGlwVHlwZSk7XG4gICAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IGdhbWVib2FyZC5nZXRTaGlwUG9zaXRpb25zKHNoaXBUeXBlKTtcblxuICAgIC8vIEJ1aWxkIHRoZSBzaGlwIHNlY3Rpb25zXG4gICAgY29uc3Qgc2hpcFNlY3RzID0gYnVpbGRTaGlwKHNoaXBPYmosIGlkU2VsLCBzaGlwUG9zaXRpb25zKTtcblxuICAgIC8vIE1hdGNoIHRoZSBjZWxsIHBvc2l0aW9ucyB3aXRoIHRoZSBzaGlwIHNlY3Rpb25zIGFuZCBwbGFjZSBlYWNoXG4gICAgLy8gc2hpcCBzZWN0aW9uIGluIHRoZSBjb3JyZXNwb25kaW5nIGNlbGwgZWxlbWVudFxuICAgIHNoaXBQb3NpdGlvbnMuZm9yRWFjaCgocG9zaXRpb24pID0+IHtcbiAgICAgIGNvbnN0IGNlbGxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7cGxheWVyVHlwZX0tJHtwb3NpdGlvbn1gKTtcbiAgICAgIC8vIEZpbmQgdGhlIHNoaXAgc2VjdGlvbiBlbGVtZW50IHRoYXQgbWF0Y2hlcyB0aGUgY3VycmVudCBwb3NpdGlvblxuICAgICAgY29uc3Qgc2hpcFNlY3QgPSBzaGlwU2VjdHMuZmluZChcbiAgICAgICAgKHNlY3Rpb24pID0+IHNlY3Rpb24uZGF0YXNldC5wb3NpdGlvbiA9PT0gcG9zaXRpb24sXG4gICAgICApO1xuXG4gICAgICBpZiAoY2VsbEVsZW1lbnQgJiYgc2hpcFNlY3QpIHtcbiAgICAgICAgLy8gUGxhY2UgdGhlIHNoaXAgc2VjdGlvbiBpbiB0aGUgY2VsbFxuICAgICAgICBjZWxsRWxlbWVudC5hcHBlbmRDaGlsZChzaGlwU2VjdCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBjcmVhdGVHYW1lYm9hcmQsXG4gICAgaW5pdENvbnNvbGVVSSxcbiAgICBkaXNwbGF5UHJvbXB0LFxuICAgIHJlbmRlclNoaXBEaXNwLFxuICAgIHJlbmRlclNoaXBCb2FyZCxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFVpTWFuYWdlcjtcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIGAvKlxuISB0YWlsd2luZGNzcyB2My40LjEgfCBNSVQgTGljZW5zZSB8IGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tXG4qLy8qXG4xLiBQcmV2ZW50IHBhZGRpbmcgYW5kIGJvcmRlciBmcm9tIGFmZmVjdGluZyBlbGVtZW50IHdpZHRoLiAoaHR0cHM6Ly9naXRodWIuY29tL21vemRldnMvY3NzcmVtZWR5L2lzc3Vlcy80KVxuMi4gQWxsb3cgYWRkaW5nIGEgYm9yZGVyIHRvIGFuIGVsZW1lbnQgYnkganVzdCBhZGRpbmcgYSBib3JkZXItd2lkdGguIChodHRwczovL2dpdGh1Yi5jb20vdGFpbHdpbmRjc3MvdGFpbHdpbmRjc3MvcHVsbC8xMTYpXG4qL1xuXG4qLFxuOjpiZWZvcmUsXG46OmFmdGVyIHtcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDsgLyogMSAqL1xuICBib3JkZXItd2lkdGg6IDA7IC8qIDIgKi9cbiAgYm9yZGVyLXN0eWxlOiBzb2xpZDsgLyogMiAqL1xuICBib3JkZXItY29sb3I6ICNlNWU3ZWI7IC8qIDIgKi9cbn1cblxuOjpiZWZvcmUsXG46OmFmdGVyIHtcbiAgLS10dy1jb250ZW50OiAnJztcbn1cblxuLypcbjEuIFVzZSBhIGNvbnNpc3RlbnQgc2Vuc2libGUgbGluZS1oZWlnaHQgaW4gYWxsIGJyb3dzZXJzLlxuMi4gUHJldmVudCBhZGp1c3RtZW50cyBvZiBmb250IHNpemUgYWZ0ZXIgb3JpZW50YXRpb24gY2hhbmdlcyBpbiBpT1MuXG4zLiBVc2UgYSBtb3JlIHJlYWRhYmxlIHRhYiBzaXplLlxuNC4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBzYW5zXFxgIGZvbnQtZmFtaWx5IGJ5IGRlZmF1bHQuXG41LiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYHNhbnNcXGAgZm9udC1mZWF0dXJlLXNldHRpbmdzIGJ5IGRlZmF1bHQuXG42LiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYHNhbnNcXGAgZm9udC12YXJpYXRpb24tc2V0dGluZ3MgYnkgZGVmYXVsdC5cbjcuIERpc2FibGUgdGFwIGhpZ2hsaWdodHMgb24gaU9TXG4qL1xuXG5odG1sLFxuOmhvc3Qge1xuICBsaW5lLWhlaWdodDogMS41OyAvKiAxICovXG4gIC13ZWJraXQtdGV4dC1zaXplLWFkanVzdDogMTAwJTsgLyogMiAqL1xuICAtbW96LXRhYi1zaXplOiA0OyAvKiAzICovXG4gIC1vLXRhYi1zaXplOiA0O1xuICAgICB0YWItc2l6ZTogNDsgLyogMyAqL1xuICBmb250LWZhbWlseTogdWktc2Fucy1zZXJpZiwgc3lzdGVtLXVpLCBzYW5zLXNlcmlmLCBcIkFwcGxlIENvbG9yIEVtb2ppXCIsIFwiU2Vnb2UgVUkgRW1vamlcIiwgXCJTZWdvZSBVSSBTeW1ib2xcIiwgXCJOb3RvIENvbG9yIEVtb2ppXCI7IC8qIDQgKi9cbiAgZm9udC1mZWF0dXJlLXNldHRpbmdzOiBub3JtYWw7IC8qIDUgKi9cbiAgZm9udC12YXJpYXRpb24tc2V0dGluZ3M6IG5vcm1hbDsgLyogNiAqL1xuICAtd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6IHRyYW5zcGFyZW50OyAvKiA3ICovXG59XG5cbi8qXG4xLiBSZW1vdmUgdGhlIG1hcmdpbiBpbiBhbGwgYnJvd3NlcnMuXG4yLiBJbmhlcml0IGxpbmUtaGVpZ2h0IGZyb20gXFxgaHRtbFxcYCBzbyB1c2VycyBjYW4gc2V0IHRoZW0gYXMgYSBjbGFzcyBkaXJlY3RseSBvbiB0aGUgXFxgaHRtbFxcYCBlbGVtZW50LlxuKi9cblxuYm9keSB7XG4gIG1hcmdpbjogMDsgLyogMSAqL1xuICBsaW5lLWhlaWdodDogaW5oZXJpdDsgLyogMiAqL1xufVxuXG4vKlxuMS4gQWRkIHRoZSBjb3JyZWN0IGhlaWdodCBpbiBGaXJlZm94LlxuMi4gQ29ycmVjdCB0aGUgaW5oZXJpdGFuY2Ugb2YgYm9yZGVyIGNvbG9yIGluIEZpcmVmb3guIChodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD0xOTA2NTUpXG4zLiBFbnN1cmUgaG9yaXpvbnRhbCBydWxlcyBhcmUgdmlzaWJsZSBieSBkZWZhdWx0LlxuKi9cblxuaHIge1xuICBoZWlnaHQ6IDA7IC8qIDEgKi9cbiAgY29sb3I6IGluaGVyaXQ7IC8qIDIgKi9cbiAgYm9yZGVyLXRvcC13aWR0aDogMXB4OyAvKiAzICovXG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgdGV4dCBkZWNvcmF0aW9uIGluIENocm9tZSwgRWRnZSwgYW5kIFNhZmFyaS5cbiovXG5cbmFiYnI6d2hlcmUoW3RpdGxlXSkge1xuICAtd2Via2l0LXRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lIGRvdHRlZDtcbiAgICAgICAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZSBkb3R0ZWQ7XG59XG5cbi8qXG5SZW1vdmUgdGhlIGRlZmF1bHQgZm9udCBzaXplIGFuZCB3ZWlnaHQgZm9yIGhlYWRpbmdzLlxuKi9cblxuaDEsXG5oMixcbmgzLFxuaDQsXG5oNSxcbmg2IHtcbiAgZm9udC1zaXplOiBpbmhlcml0O1xuICBmb250LXdlaWdodDogaW5oZXJpdDtcbn1cblxuLypcblJlc2V0IGxpbmtzIHRvIG9wdGltaXplIGZvciBvcHQtaW4gc3R5bGluZyBpbnN0ZWFkIG9mIG9wdC1vdXQuXG4qL1xuXG5hIHtcbiAgY29sb3I6IGluaGVyaXQ7XG4gIHRleHQtZGVjb3JhdGlvbjogaW5oZXJpdDtcbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCBmb250IHdlaWdodCBpbiBFZGdlIGFuZCBTYWZhcmkuXG4qL1xuXG5iLFxuc3Ryb25nIHtcbiAgZm9udC13ZWlnaHQ6IGJvbGRlcjtcbn1cblxuLypcbjEuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgbW9ub1xcYCBmb250LWZhbWlseSBieSBkZWZhdWx0LlxuMi4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBtb25vXFxgIGZvbnQtZmVhdHVyZS1zZXR0aW5ncyBieSBkZWZhdWx0LlxuMy4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBtb25vXFxgIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzIGJ5IGRlZmF1bHQuXG40LiBDb3JyZWN0IHRoZSBvZGQgXFxgZW1cXGAgZm9udCBzaXppbmcgaW4gYWxsIGJyb3dzZXJzLlxuKi9cblxuY29kZSxcbmtiZCxcbnNhbXAsXG5wcmUge1xuICBmb250LWZhbWlseTogdWktbW9ub3NwYWNlLCBTRk1vbm8tUmVndWxhciwgTWVubG8sIE1vbmFjbywgQ29uc29sYXMsIFwiTGliZXJhdGlvbiBNb25vXCIsIFwiQ291cmllciBOZXdcIiwgbW9ub3NwYWNlOyAvKiAxICovXG4gIGZvbnQtZmVhdHVyZS1zZXR0aW5nczogbm9ybWFsOyAvKiAyICovXG4gIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzOiBub3JtYWw7IC8qIDMgKi9cbiAgZm9udC1zaXplOiAxZW07IC8qIDQgKi9cbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCBmb250IHNpemUgaW4gYWxsIGJyb3dzZXJzLlxuKi9cblxuc21hbGwge1xuICBmb250LXNpemU6IDgwJTtcbn1cblxuLypcblByZXZlbnQgXFxgc3ViXFxgIGFuZCBcXGBzdXBcXGAgZWxlbWVudHMgZnJvbSBhZmZlY3RpbmcgdGhlIGxpbmUgaGVpZ2h0IGluIGFsbCBicm93c2Vycy5cbiovXG5cbnN1YixcbnN1cCB7XG4gIGZvbnQtc2l6ZTogNzUlO1xuICBsaW5lLWhlaWdodDogMDtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XG59XG5cbnN1YiB7XG4gIGJvdHRvbTogLTAuMjVlbTtcbn1cblxuc3VwIHtcbiAgdG9wOiAtMC41ZW07XG59XG5cbi8qXG4xLiBSZW1vdmUgdGV4dCBpbmRlbnRhdGlvbiBmcm9tIHRhYmxlIGNvbnRlbnRzIGluIENocm9tZSBhbmQgU2FmYXJpLiAoaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9OTk5MDg4LCBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjAxMjk3KVxuMi4gQ29ycmVjdCB0YWJsZSBib3JkZXIgY29sb3IgaW5oZXJpdGFuY2UgaW4gYWxsIENocm9tZSBhbmQgU2FmYXJpLiAoaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9OTM1NzI5LCBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTk1MDE2KVxuMy4gUmVtb3ZlIGdhcHMgYmV0d2VlbiB0YWJsZSBib3JkZXJzIGJ5IGRlZmF1bHQuXG4qL1xuXG50YWJsZSB7XG4gIHRleHQtaW5kZW50OiAwOyAvKiAxICovXG4gIGJvcmRlci1jb2xvcjogaW5oZXJpdDsgLyogMiAqL1xuICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyAvKiAzICovXG59XG5cbi8qXG4xLiBDaGFuZ2UgdGhlIGZvbnQgc3R5bGVzIGluIGFsbCBicm93c2Vycy5cbjIuIFJlbW92ZSB0aGUgbWFyZ2luIGluIEZpcmVmb3ggYW5kIFNhZmFyaS5cbjMuIFJlbW92ZSBkZWZhdWx0IHBhZGRpbmcgaW4gYWxsIGJyb3dzZXJzLlxuKi9cblxuYnV0dG9uLFxuaW5wdXQsXG5vcHRncm91cCxcbnNlbGVjdCxcbnRleHRhcmVhIHtcbiAgZm9udC1mYW1pbHk6IGluaGVyaXQ7IC8qIDEgKi9cbiAgZm9udC1mZWF0dXJlLXNldHRpbmdzOiBpbmhlcml0OyAvKiAxICovXG4gIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzOiBpbmhlcml0OyAvKiAxICovXG4gIGZvbnQtc2l6ZTogMTAwJTsgLyogMSAqL1xuICBmb250LXdlaWdodDogaW5oZXJpdDsgLyogMSAqL1xuICBsaW5lLWhlaWdodDogaW5oZXJpdDsgLyogMSAqL1xuICBjb2xvcjogaW5oZXJpdDsgLyogMSAqL1xuICBtYXJnaW46IDA7IC8qIDIgKi9cbiAgcGFkZGluZzogMDsgLyogMyAqL1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBpbmhlcml0YW5jZSBvZiB0ZXh0IHRyYW5zZm9ybSBpbiBFZGdlIGFuZCBGaXJlZm94LlxuKi9cblxuYnV0dG9uLFxuc2VsZWN0IHtcbiAgdGV4dC10cmFuc2Zvcm06IG5vbmU7XG59XG5cbi8qXG4xLiBDb3JyZWN0IHRoZSBpbmFiaWxpdHkgdG8gc3R5bGUgY2xpY2thYmxlIHR5cGVzIGluIGlPUyBhbmQgU2FmYXJpLlxuMi4gUmVtb3ZlIGRlZmF1bHQgYnV0dG9uIHN0eWxlcy5cbiovXG5cbmJ1dHRvbixcblt0eXBlPSdidXR0b24nXSxcblt0eXBlPSdyZXNldCddLFxuW3R5cGU9J3N1Ym1pdCddIHtcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiBidXR0b247IC8qIDEgKi9cbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7IC8qIDIgKi9cbiAgYmFja2dyb3VuZC1pbWFnZTogbm9uZTsgLyogMiAqL1xufVxuXG4vKlxuVXNlIHRoZSBtb2Rlcm4gRmlyZWZveCBmb2N1cyBzdHlsZSBmb3IgYWxsIGZvY3VzYWJsZSBlbGVtZW50cy5cbiovXG5cbjotbW96LWZvY3VzcmluZyB7XG4gIG91dGxpbmU6IGF1dG87XG59XG5cbi8qXG5SZW1vdmUgdGhlIGFkZGl0aW9uYWwgXFxgOmludmFsaWRcXGAgc3R5bGVzIGluIEZpcmVmb3guIChodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9nZWNrby1kZXYvYmxvYi8yZjllYWNkOWQzZDk5NWM5MzdiNDI1MWE1NTU3ZDk1ZDQ5NGM5YmUxL2xheW91dC9zdHlsZS9yZXMvZm9ybXMuY3NzI0w3MjgtTDczNylcbiovXG5cbjotbW96LXVpLWludmFsaWQge1xuICBib3gtc2hhZG93OiBub25lO1xufVxuXG4vKlxuQWRkIHRoZSBjb3JyZWN0IHZlcnRpY2FsIGFsaWdubWVudCBpbiBDaHJvbWUgYW5kIEZpcmVmb3guXG4qL1xuXG5wcm9ncmVzcyB7XG4gIHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTtcbn1cblxuLypcbkNvcnJlY3QgdGhlIGN1cnNvciBzdHlsZSBvZiBpbmNyZW1lbnQgYW5kIGRlY3JlbWVudCBidXR0b25zIGluIFNhZmFyaS5cbiovXG5cbjo6LXdlYmtpdC1pbm5lci1zcGluLWJ1dHRvbixcbjo6LXdlYmtpdC1vdXRlci1zcGluLWJ1dHRvbiB7XG4gIGhlaWdodDogYXV0bztcbn1cblxuLypcbjEuIENvcnJlY3QgdGhlIG9kZCBhcHBlYXJhbmNlIGluIENocm9tZSBhbmQgU2FmYXJpLlxuMi4gQ29ycmVjdCB0aGUgb3V0bGluZSBzdHlsZSBpbiBTYWZhcmkuXG4qL1xuXG5bdHlwZT0nc2VhcmNoJ10ge1xuICAtd2Via2l0LWFwcGVhcmFuY2U6IHRleHRmaWVsZDsgLyogMSAqL1xuICBvdXRsaW5lLW9mZnNldDogLTJweDsgLyogMiAqL1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBpbm5lciBwYWRkaW5nIGluIENocm9tZSBhbmQgU2FmYXJpIG9uIG1hY09TLlxuKi9cblxuOjotd2Via2l0LXNlYXJjaC1kZWNvcmF0aW9uIHtcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xufVxuXG4vKlxuMS4gQ29ycmVjdCB0aGUgaW5hYmlsaXR5IHRvIHN0eWxlIGNsaWNrYWJsZSB0eXBlcyBpbiBpT1MgYW5kIFNhZmFyaS5cbjIuIENoYW5nZSBmb250IHByb3BlcnRpZXMgdG8gXFxgaW5oZXJpdFxcYCBpbiBTYWZhcmkuXG4qL1xuXG46Oi13ZWJraXQtZmlsZS11cGxvYWQtYnV0dG9uIHtcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiBidXR0b247IC8qIDEgKi9cbiAgZm9udDogaW5oZXJpdDsgLyogMiAqL1xufVxuXG4vKlxuQWRkIHRoZSBjb3JyZWN0IGRpc3BsYXkgaW4gQ2hyb21lIGFuZCBTYWZhcmkuXG4qL1xuXG5zdW1tYXJ5IHtcbiAgZGlzcGxheTogbGlzdC1pdGVtO1xufVxuXG4vKlxuUmVtb3ZlcyB0aGUgZGVmYXVsdCBzcGFjaW5nIGFuZCBib3JkZXIgZm9yIGFwcHJvcHJpYXRlIGVsZW1lbnRzLlxuKi9cblxuYmxvY2txdW90ZSxcbmRsLFxuZGQsXG5oMSxcbmgyLFxuaDMsXG5oNCxcbmg1LFxuaDYsXG5ocixcbmZpZ3VyZSxcbnAsXG5wcmUge1xuICBtYXJnaW46IDA7XG59XG5cbmZpZWxkc2V0IHtcbiAgbWFyZ2luOiAwO1xuICBwYWRkaW5nOiAwO1xufVxuXG5sZWdlbmQge1xuICBwYWRkaW5nOiAwO1xufVxuXG5vbCxcbnVsLFxubWVudSB7XG4gIGxpc3Qtc3R5bGU6IG5vbmU7XG4gIG1hcmdpbjogMDtcbiAgcGFkZGluZzogMDtcbn1cblxuLypcblJlc2V0IGRlZmF1bHQgc3R5bGluZyBmb3IgZGlhbG9ncy5cbiovXG5kaWFsb2cge1xuICBwYWRkaW5nOiAwO1xufVxuXG4vKlxuUHJldmVudCByZXNpemluZyB0ZXh0YXJlYXMgaG9yaXpvbnRhbGx5IGJ5IGRlZmF1bHQuXG4qL1xuXG50ZXh0YXJlYSB7XG4gIHJlc2l6ZTogdmVydGljYWw7XG59XG5cbi8qXG4xLiBSZXNldCB0aGUgZGVmYXVsdCBwbGFjZWhvbGRlciBvcGFjaXR5IGluIEZpcmVmb3guIChodHRwczovL2dpdGh1Yi5jb20vdGFpbHdpbmRsYWJzL3RhaWx3aW5kY3NzL2lzc3Vlcy8zMzAwKVxuMi4gU2V0IHRoZSBkZWZhdWx0IHBsYWNlaG9sZGVyIGNvbG9yIHRvIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBncmF5IDQwMCBjb2xvci5cbiovXG5cbmlucHV0OjotbW96LXBsYWNlaG9sZGVyLCB0ZXh0YXJlYTo6LW1vei1wbGFjZWhvbGRlciB7XG4gIG9wYWNpdHk6IDE7IC8qIDEgKi9cbiAgY29sb3I6ICM5Y2EzYWY7IC8qIDIgKi9cbn1cblxuaW5wdXQ6OnBsYWNlaG9sZGVyLFxudGV4dGFyZWE6OnBsYWNlaG9sZGVyIHtcbiAgb3BhY2l0eTogMTsgLyogMSAqL1xuICBjb2xvcjogIzljYTNhZjsgLyogMiAqL1xufVxuXG4vKlxuU2V0IHRoZSBkZWZhdWx0IGN1cnNvciBmb3IgYnV0dG9ucy5cbiovXG5cbmJ1dHRvbixcbltyb2xlPVwiYnV0dG9uXCJdIHtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuXG4vKlxuTWFrZSBzdXJlIGRpc2FibGVkIGJ1dHRvbnMgZG9uJ3QgZ2V0IHRoZSBwb2ludGVyIGN1cnNvci5cbiovXG46ZGlzYWJsZWQge1xuICBjdXJzb3I6IGRlZmF1bHQ7XG59XG5cbi8qXG4xLiBNYWtlIHJlcGxhY2VkIGVsZW1lbnRzIFxcYGRpc3BsYXk6IGJsb2NrXFxgIGJ5IGRlZmF1bHQuIChodHRwczovL2dpdGh1Yi5jb20vbW96ZGV2cy9jc3NyZW1lZHkvaXNzdWVzLzE0KVxuMi4gQWRkIFxcYHZlcnRpY2FsLWFsaWduOiBtaWRkbGVcXGAgdG8gYWxpZ24gcmVwbGFjZWQgZWxlbWVudHMgbW9yZSBzZW5zaWJseSBieSBkZWZhdWx0LiAoaHR0cHM6Ly9naXRodWIuY29tL2plbnNpbW1vbnMvY3NzcmVtZWR5L2lzc3Vlcy8xNCNpc3N1ZWNvbW1lbnQtNjM0OTM0MjEwKVxuICAgVGhpcyBjYW4gdHJpZ2dlciBhIHBvb3JseSBjb25zaWRlcmVkIGxpbnQgZXJyb3IgaW4gc29tZSB0b29scyBidXQgaXMgaW5jbHVkZWQgYnkgZGVzaWduLlxuKi9cblxuaW1nLFxuc3ZnLFxudmlkZW8sXG5jYW52YXMsXG5hdWRpbyxcbmlmcmFtZSxcbmVtYmVkLFxub2JqZWN0IHtcbiAgZGlzcGxheTogYmxvY2s7IC8qIDEgKi9cbiAgdmVydGljYWwtYWxpZ246IG1pZGRsZTsgLyogMiAqL1xufVxuXG4vKlxuQ29uc3RyYWluIGltYWdlcyBhbmQgdmlkZW9zIHRvIHRoZSBwYXJlbnQgd2lkdGggYW5kIHByZXNlcnZlIHRoZWlyIGludHJpbnNpYyBhc3BlY3QgcmF0aW8uIChodHRwczovL2dpdGh1Yi5jb20vbW96ZGV2cy9jc3NyZW1lZHkvaXNzdWVzLzE0KVxuKi9cblxuaW1nLFxudmlkZW8ge1xuICBtYXgtd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogYXV0bztcbn1cblxuLyogTWFrZSBlbGVtZW50cyB3aXRoIHRoZSBIVE1MIGhpZGRlbiBhdHRyaWJ1dGUgc3RheSBoaWRkZW4gYnkgZGVmYXVsdCAqL1xuW2hpZGRlbl0ge1xuICBkaXNwbGF5OiBub25lO1xufVxuXG4qLCA6OmJlZm9yZSwgOjphZnRlciB7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteDogMDtcbiAgLS10dy1ib3JkZXItc3BhY2luZy15OiAwO1xuICAtLXR3LXRyYW5zbGF0ZS14OiAwO1xuICAtLXR3LXRyYW5zbGF0ZS15OiAwO1xuICAtLXR3LXJvdGF0ZTogMDtcbiAgLS10dy1za2V3LXg6IDA7XG4gIC0tdHctc2tldy15OiAwO1xuICAtLXR3LXNjYWxlLXg6IDE7XG4gIC0tdHctc2NhbGUteTogMTtcbiAgLS10dy1wYW4teDogIDtcbiAgLS10dy1wYW4teTogIDtcbiAgLS10dy1waW5jaC16b29tOiAgO1xuICAtLXR3LXNjcm9sbC1zbmFwLXN0cmljdG5lc3M6IHByb3hpbWl0eTtcbiAgLS10dy1ncmFkaWVudC1mcm9tLXBvc2l0aW9uOiAgO1xuICAtLXR3LWdyYWRpZW50LXZpYS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC10by1wb3NpdGlvbjogIDtcbiAgLS10dy1vcmRpbmFsOiAgO1xuICAtLXR3LXNsYXNoZWQtemVybzogIDtcbiAgLS10dy1udW1lcmljLWZpZ3VyZTogIDtcbiAgLS10dy1udW1lcmljLXNwYWNpbmc6ICA7XG4gIC0tdHctbnVtZXJpYy1mcmFjdGlvbjogIDtcbiAgLS10dy1yaW5nLWluc2V0OiAgO1xuICAtLXR3LXJpbmctb2Zmc2V0LXdpZHRoOiAwcHg7XG4gIC0tdHctcmluZy1vZmZzZXQtY29sb3I6ICNmZmY7XG4gIC0tdHctcmluZy1jb2xvcjogcmdiKDU5IDEzMCAyNDYgLyAwLjUpO1xuICAtLXR3LXJpbmctb2Zmc2V0LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXJpbmctc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctc2hhZG93LWNvbG9yZWQ6IDAgMCAjMDAwMDtcbiAgLS10dy1ibHVyOiAgO1xuICAtLXR3LWJyaWdodG5lc3M6ICA7XG4gIC0tdHctY29udHJhc3Q6ICA7XG4gIC0tdHctZ3JheXNjYWxlOiAgO1xuICAtLXR3LWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctaW52ZXJ0OiAgO1xuICAtLXR3LXNhdHVyYXRlOiAgO1xuICAtLXR3LXNlcGlhOiAgO1xuICAtLXR3LWRyb3Atc2hhZG93OiAgO1xuICAtLXR3LWJhY2tkcm9wLWJsdXI6ICA7XG4gIC0tdHctYmFja2Ryb3AtYnJpZ2h0bmVzczogIDtcbiAgLS10dy1iYWNrZHJvcC1jb250cmFzdDogIDtcbiAgLS10dy1iYWNrZHJvcC1ncmF5c2NhbGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaHVlLXJvdGF0ZTogIDtcbiAgLS10dy1iYWNrZHJvcC1pbnZlcnQ6ICA7XG4gIC0tdHctYmFja2Ryb3Atb3BhY2l0eTogIDtcbiAgLS10dy1iYWNrZHJvcC1zYXR1cmF0ZTogIDtcbiAgLS10dy1iYWNrZHJvcC1zZXBpYTogIDtcbn1cblxuOjpiYWNrZHJvcCB7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteDogMDtcbiAgLS10dy1ib3JkZXItc3BhY2luZy15OiAwO1xuICAtLXR3LXRyYW5zbGF0ZS14OiAwO1xuICAtLXR3LXRyYW5zbGF0ZS15OiAwO1xuICAtLXR3LXJvdGF0ZTogMDtcbiAgLS10dy1za2V3LXg6IDA7XG4gIC0tdHctc2tldy15OiAwO1xuICAtLXR3LXNjYWxlLXg6IDE7XG4gIC0tdHctc2NhbGUteTogMTtcbiAgLS10dy1wYW4teDogIDtcbiAgLS10dy1wYW4teTogIDtcbiAgLS10dy1waW5jaC16b29tOiAgO1xuICAtLXR3LXNjcm9sbC1zbmFwLXN0cmljdG5lc3M6IHByb3hpbWl0eTtcbiAgLS10dy1ncmFkaWVudC1mcm9tLXBvc2l0aW9uOiAgO1xuICAtLXR3LWdyYWRpZW50LXZpYS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC10by1wb3NpdGlvbjogIDtcbiAgLS10dy1vcmRpbmFsOiAgO1xuICAtLXR3LXNsYXNoZWQtemVybzogIDtcbiAgLS10dy1udW1lcmljLWZpZ3VyZTogIDtcbiAgLS10dy1udW1lcmljLXNwYWNpbmc6ICA7XG4gIC0tdHctbnVtZXJpYy1mcmFjdGlvbjogIDtcbiAgLS10dy1yaW5nLWluc2V0OiAgO1xuICAtLXR3LXJpbmctb2Zmc2V0LXdpZHRoOiAwcHg7XG4gIC0tdHctcmluZy1vZmZzZXQtY29sb3I6ICNmZmY7XG4gIC0tdHctcmluZy1jb2xvcjogcmdiKDU5IDEzMCAyNDYgLyAwLjUpO1xuICAtLXR3LXJpbmctb2Zmc2V0LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXJpbmctc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctc2hhZG93LWNvbG9yZWQ6IDAgMCAjMDAwMDtcbiAgLS10dy1ibHVyOiAgO1xuICAtLXR3LWJyaWdodG5lc3M6ICA7XG4gIC0tdHctY29udHJhc3Q6ICA7XG4gIC0tdHctZ3JheXNjYWxlOiAgO1xuICAtLXR3LWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctaW52ZXJ0OiAgO1xuICAtLXR3LXNhdHVyYXRlOiAgO1xuICAtLXR3LXNlcGlhOiAgO1xuICAtLXR3LWRyb3Atc2hhZG93OiAgO1xuICAtLXR3LWJhY2tkcm9wLWJsdXI6ICA7XG4gIC0tdHctYmFja2Ryb3AtYnJpZ2h0bmVzczogIDtcbiAgLS10dy1iYWNrZHJvcC1jb250cmFzdDogIDtcbiAgLS10dy1iYWNrZHJvcC1ncmF5c2NhbGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaHVlLXJvdGF0ZTogIDtcbiAgLS10dy1iYWNrZHJvcC1pbnZlcnQ6ICA7XG4gIC0tdHctYmFja2Ryb3Atb3BhY2l0eTogIDtcbiAgLS10dy1iYWNrZHJvcC1zYXR1cmF0ZTogIDtcbiAgLS10dy1iYWNrZHJvcC1zZXBpYTogIDtcbn1cbi5jb250YWluZXIge1xuICB3aWR0aDogMTAwJTtcbn1cbkBtZWRpYSAobWluLXdpZHRoOiA2NDBweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogNjQwcHg7XG4gIH1cbn1cbkBtZWRpYSAobWluLXdpZHRoOiA3NjhweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogNzY4cHg7XG4gIH1cbn1cbkBtZWRpYSAobWluLXdpZHRoOiAxMDI0cHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDEwMjRweDtcbiAgfVxufVxuQG1lZGlhIChtaW4td2lkdGg6IDEyODBweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogMTI4MHB4O1xuICB9XG59XG5AbWVkaWEgKG1pbi13aWR0aDogMTUzNnB4KSB7XG5cbiAgLmNvbnRhaW5lciB7XG4gICAgbWF4LXdpZHRoOiAxNTM2cHg7XG4gIH1cbn1cbi5wb2ludGVyLWV2ZW50cy1ub25lIHtcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG4udmlzaWJsZSB7XG4gIHZpc2liaWxpdHk6IHZpc2libGU7XG59XG4uY29sbGFwc2Uge1xuICB2aXNpYmlsaXR5OiBjb2xsYXBzZTtcbn1cbi5yZWxhdGl2ZSB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbn1cbi5tLTUge1xuICBtYXJnaW46IDEuMjVyZW07XG59XG4ubS04IHtcbiAgbWFyZ2luOiAycmVtO1xufVxuLm1sLTEwIHtcbiAgbWFyZ2luLWxlZnQ6IDIuNXJlbTtcbn1cbi5tbC04IHtcbiAgbWFyZ2luLWxlZnQ6IDJyZW07XG59XG4uYmxvY2sge1xuICBkaXNwbGF5OiBibG9jaztcbn1cbi5mbGV4IHtcbiAgZGlzcGxheTogZmxleDtcbn1cbi50YWJsZSB7XG4gIGRpc3BsYXk6IHRhYmxlO1xufVxuLmdyaWQge1xuICBkaXNwbGF5OiBncmlkO1xufVxuLmNvbnRlbnRzIHtcbiAgZGlzcGxheTogY29udGVudHM7XG59XG4uaGlkZGVuIHtcbiAgZGlzcGxheTogbm9uZTtcbn1cbi5oLTEge1xuICBoZWlnaHQ6IDAuMjVyZW07XG59XG4uaC0xXFxcXC81IHtcbiAgaGVpZ2h0OiAyMCU7XG59XG4uaC00IHtcbiAgaGVpZ2h0OiAxcmVtO1xufVxuLmgtNFxcXFwvNSB7XG4gIGhlaWdodDogODAlO1xufVxuLmgtNDAge1xuICBoZWlnaHQ6IDEwcmVtO1xufVxuLmgtNiB7XG4gIGhlaWdodDogMS41cmVtO1xufVxuLmgtbWF4IHtcbiAgaGVpZ2h0OiAtbW96LW1heC1jb250ZW50O1xuICBoZWlnaHQ6IG1heC1jb250ZW50O1xufVxuLnctMSB7XG4gIHdpZHRoOiAwLjI1cmVtO1xufVxuLnctMVxcXFwvMiB7XG4gIHdpZHRoOiA1MCU7XG59XG4udy00IHtcbiAgd2lkdGg6IDFyZW07XG59XG4udy00XFxcXC8xMiB7XG4gIHdpZHRoOiAzMy4zMzMzMzMlO1xufVxuLnctNiB7XG4gIHdpZHRoOiAxLjVyZW07XG59XG4udy1hdXRvIHtcbiAgd2lkdGg6IGF1dG87XG59XG4udy1mdWxsIHtcbiAgd2lkdGg6IDEwMCU7XG59XG4ubWluLXctNDQge1xuICBtaW4td2lkdGg6IDExcmVtO1xufVxuLm1pbi13LW1heCB7XG4gIG1pbi13aWR0aDogLW1vei1tYXgtY29udGVudDtcbiAgbWluLXdpZHRoOiBtYXgtY29udGVudDtcbn1cbi5taW4tdy1taW4ge1xuICBtaW4td2lkdGg6IC1tb3otbWluLWNvbnRlbnQ7XG4gIG1pbi13aWR0aDogbWluLWNvbnRlbnQ7XG59XG4uZmxleC0xIHtcbiAgZmxleDogMSAxIDAlO1xufVxuLmZsZXgtbm9uZSB7XG4gIGZsZXg6IG5vbmU7XG59XG4uYm9yZGVyLWNvbGxhcHNlIHtcbiAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTtcbn1cbi50cmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSh2YXIoLS10dy10cmFuc2xhdGUteCksIHZhcigtLXR3LXRyYW5zbGF0ZS15KSkgcm90YXRlKHZhcigtLXR3LXJvdGF0ZSkpIHNrZXdYKHZhcigtLXR3LXNrZXcteCkpIHNrZXdZKHZhcigtLXR3LXNrZXcteSkpIHNjYWxlWCh2YXIoLS10dy1zY2FsZS14KSkgc2NhbGVZKHZhcigtLXR3LXNjYWxlLXkpKTtcbn1cbi5jdXJzb3ItZGVmYXVsdCB7XG4gIGN1cnNvcjogZGVmYXVsdDtcbn1cbi5jdXJzb3ItaGVscCB7XG4gIGN1cnNvcjogaGVscDtcbn1cbi5jdXJzb3ItcG9pbnRlciB7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5jdXJzb3ItdGV4dCB7XG4gIGN1cnNvcjogdGV4dDtcbn1cbi5yZXNpemUge1xuICByZXNpemU6IGJvdGg7XG59XG4uYXV0by1yb3dzLW1pbiB7XG4gIGdyaWQtYXV0by1yb3dzOiBtaW4tY29udGVudDtcbn1cbi5ncmlkLWNvbHMtMTEge1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgxMSwgbWlubWF4KDAsIDFmcikpO1xufVxuLmZsZXgtcm93IHtcbiAgZmxleC1kaXJlY3Rpb246IHJvdztcbn1cbi5mbGV4LWNvbCB7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG59XG4uaXRlbXMtY2VudGVyIHtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cbi5qdXN0aWZ5LXN0YXJ0IHtcbiAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0O1xufVxuLmp1c3RpZnktY2VudGVyIHtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG59XG4uanVzdGlmeS1iZXR3ZWVuIHtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xufVxuLmp1c3RpZnktYXJvdW5kIHtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1hcm91bmQ7XG59XG4uZ2FwLTEge1xuICBnYXA6IDAuMjVyZW07XG59XG4uZ2FwLTEwIHtcbiAgZ2FwOiAyLjVyZW07XG59XG4uZ2FwLTIge1xuICBnYXA6IDAuNXJlbTtcbn1cbi5nYXAtNiB7XG4gIGdhcDogMS41cmVtO1xufVxuLm92ZXJmbG93LWF1dG8ge1xuICBvdmVyZmxvdzogYXV0bztcbn1cbi5yb3VuZGVkLWZ1bGwge1xuICBib3JkZXItcmFkaXVzOiA5OTk5cHg7XG59XG4ucm91bmRlZC14bCB7XG4gIGJvcmRlci1yYWRpdXM6IDAuNzVyZW07XG59XG4uYm9yZGVyIHtcbiAgYm9yZGVyLXdpZHRoOiAxcHg7XG59XG4uYm9yZGVyLXNvbGlkIHtcbiAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcbn1cbi5ib3JkZXItYmx1ZS04MDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigzMCA2NCAxNzUgLyB2YXIoLS10dy1ib3JkZXItb3BhY2l0eSkpO1xufVxuLmJvcmRlci1ncmF5LTgwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDMxIDQxIDU1IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItZ3JlZW4tNjAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMjIgMTYzIDc0IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItb3JhbmdlLTQwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDI1MSAxNDYgNjAgLyB2YXIoLS10dy1ib3JkZXItb3BhY2l0eSkpO1xufVxuLmJvcmRlci1yZWQtNzAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMTg1IDI4IDI4IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5iZy1ncmF5LTIwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDIyOSAyMzEgMjM1IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWdyYXktNDAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTU2IDE2MyAxNzUgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS04MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigzMSA0MSA1NSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1vcmFuZ2UtNDAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjUxIDE0NiA2MCAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5wLTEge1xuICBwYWRkaW5nOiAwLjI1cmVtO1xufVxuLnAtMiB7XG4gIHBhZGRpbmc6IDAuNXJlbTtcbn1cbi5wLTQge1xuICBwYWRkaW5nOiAxcmVtO1xufVxuLnAtNiB7XG4gIHBhZGRpbmc6IDEuNXJlbTtcbn1cbi5weC0zIHtcbiAgcGFkZGluZy1sZWZ0OiAwLjc1cmVtO1xuICBwYWRkaW5nLXJpZ2h0OiAwLjc1cmVtO1xufVxuLnB4LTQge1xuICBwYWRkaW5nLWxlZnQ6IDFyZW07XG4gIHBhZGRpbmctcmlnaHQ6IDFyZW07XG59XG4ucHgtNiB7XG4gIHBhZGRpbmctbGVmdDogMS41cmVtO1xuICBwYWRkaW5nLXJpZ2h0OiAxLjVyZW07XG59XG4ucHktMSB7XG4gIHBhZGRpbmctdG9wOiAwLjI1cmVtO1xuICBwYWRkaW5nLWJvdHRvbTogMC4yNXJlbTtcbn1cbi5weS0yIHtcbiAgcGFkZGluZy10b3A6IDAuNXJlbTtcbiAgcGFkZGluZy1ib3R0b206IDAuNXJlbTtcbn1cbi5weS00IHtcbiAgcGFkZGluZy10b3A6IDFyZW07XG4gIHBhZGRpbmctYm90dG9tOiAxcmVtO1xufVxuLnBsLTIge1xuICBwYWRkaW5nLWxlZnQ6IDAuNXJlbTtcbn1cbi5wbC01IHtcbiAgcGFkZGluZy1sZWZ0OiAxLjI1cmVtO1xufVxuLnBsLTgge1xuICBwYWRkaW5nLWxlZnQ6IDJyZW07XG59XG4udGV4dC1jZW50ZXIge1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG59XG4udGV4dC1zbSB7XG4gIGZvbnQtc2l6ZTogMC44NzVyZW07XG4gIGxpbmUtaGVpZ2h0OiAxLjI1cmVtO1xufVxuLnRleHQtZ3JheS04MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigzMSA0MSA1NSAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtbGltZS02MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigxMDEgMTYzIDEzIC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1vcmFuZ2UtNTAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMjQ5IDExNSAyMiAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtb3JhbmdlLTYwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDIzNCA4OCAxMiAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtcmVkLTUwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDIzOSA2OCA2OCAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtcmVkLTcwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDE4NSAyOCAyOCAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtcm9zZS03MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigxOTAgMTggNjAgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXNreS02MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigyIDEzMiAxOTkgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXRlYWwtOTAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTkgNzggNzQgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi51bmRlcmxpbmUge1xuICB0ZXh0LWRlY29yYXRpb24tbGluZTogdW5kZXJsaW5lO1xufVxuLm91dGxpbmUge1xuICBvdXRsaW5lLXN0eWxlOiBzb2xpZDtcbn1cbi5maWx0ZXIge1xuICBmaWx0ZXI6IHZhcigtLXR3LWJsdXIpIHZhcigtLXR3LWJyaWdodG5lc3MpIHZhcigtLXR3LWNvbnRyYXN0KSB2YXIoLS10dy1ncmF5c2NhbGUpIHZhcigtLXR3LWh1ZS1yb3RhdGUpIHZhcigtLXR3LWludmVydCkgdmFyKC0tdHctc2F0dXJhdGUpIHZhcigtLXR3LXNlcGlhKSB2YXIoLS10dy1kcm9wLXNoYWRvdyk7XG59XG4uaG92ZXJcXFxcOmJnLW9yYW5nZS01MDA6aG92ZXIge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyNDkgMTE1IDIyIC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufWAsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL3N0eWxlcy5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUE7O0NBQWMsQ0FBZDs7O0NBQWM7O0FBQWQ7OztFQUFBLHNCQUFjLEVBQWQsTUFBYztFQUFkLGVBQWMsRUFBZCxNQUFjO0VBQWQsbUJBQWMsRUFBZCxNQUFjO0VBQWQscUJBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7O0VBQUEsZ0JBQWM7QUFBQTs7QUFBZDs7Ozs7Ozs7Q0FBYzs7QUFBZDs7RUFBQSxnQkFBYyxFQUFkLE1BQWM7RUFBZCw4QkFBYyxFQUFkLE1BQWM7RUFBZCxnQkFBYyxFQUFkLE1BQWM7RUFBZCxjQUFjO0tBQWQsV0FBYyxFQUFkLE1BQWM7RUFBZCwrSEFBYyxFQUFkLE1BQWM7RUFBZCw2QkFBYyxFQUFkLE1BQWM7RUFBZCwrQkFBYyxFQUFkLE1BQWM7RUFBZCx3Q0FBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7O0NBQWM7O0FBQWQ7RUFBQSxTQUFjLEVBQWQsTUFBYztFQUFkLG9CQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOzs7O0NBQWM7O0FBQWQ7RUFBQSxTQUFjLEVBQWQsTUFBYztFQUFkLGNBQWMsRUFBZCxNQUFjO0VBQWQscUJBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7RUFBQSx5Q0FBYztVQUFkLGlDQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7Ozs7OztFQUFBLGtCQUFjO0VBQWQsb0JBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLGNBQWM7RUFBZCx3QkFBYztBQUFBOztB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O0FBQUE7QUFBcEI7O0VBQUE7SUFBQTtFQUFvQjtBQUFBO0FBQXBCOztFQUFBO0lBQUE7RUFBb0I7QUFBQTtBQUNwQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSx3QkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsMkJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsMkJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSxxQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxrQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxtQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxpQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLG1CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUZuQjtFQUFBLGtCQUVvQjtFQUZwQjtBQUVvQlwiLFwic291cmNlc0NvbnRlbnRcIjpbXCJAdGFpbHdpbmQgYmFzZTtcXG5AdGFpbHdpbmQgY29tcG9uZW50cztcXG5AdGFpbHdpbmQgdXRpbGl0aWVzO1wiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTtcblxuICAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbihcIlwiKTtcbiAgfTtcblxuICAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCB0aGlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZhciBpZCA9IHRoaXNba11bMF07XG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3VwcG9ydHMpIHtcbiAgICAgICAgaWYgKCFpdGVtWzRdKSB7XG4gICAgICAgICAgaXRlbVs0XSA9IFwiXCIuY29uY2F0KHN1cHBvcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNF0gPSBzdXBwb3J0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuICBpZiAoIWNzc01hcHBpbmcpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi9ub2RlX21vZHVsZXMvcG9zdGNzcy1sb2FkZXIvZGlzdC9janMuanM/P3J1bGVTZXRbMV0ucnVsZXNbMV0udXNlWzJdIS4vc3R5bGVzLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4uL25vZGVfbW9kdWxlcy9wb3N0Y3NzLWxvYWRlci9kaXN0L2Nqcy5qcz8/cnVsZVNldFsxXS5ydWxlc1sxXS51c2VbMl0hLi9zdHlsZXMuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzdHlsZXNJbkRPTSA9IFtdO1xuZnVuY3Rpb24gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuICB2YXIgcmVzdWx0ID0gLTE7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGlkQ291bnRNYXAgPSB7fTtcbiAgdmFyIGlkZW50aWZpZXJzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuICAgIGlmIChpbmRleEJ5SWRlbnRpZmllciAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXBkYXRlciA9IGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5ieUluZGV4ID0gaTtcbiAgICAgIHN0eWxlc0luRE9NLnNwbGljZShpLCAwLCB7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IHVwZGF0ZXIsXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cbmZ1bmN0aW9uIGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIGFwaSA9IG9wdGlvbnMuZG9tQVBJKG9wdGlvbnMpO1xuICBhcGkudXBkYXRlKG9iaik7XG4gIHZhciB1cGRhdGVyID0gZnVuY3Rpb24gdXBkYXRlcihuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwICYmIG5ld09iai5zdXBwb3J0cyA9PT0gb2JqLnN1cHBvcnRzICYmIG5ld09iai5sYXllciA9PT0gb2JqLmxheWVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHVwZGF0ZXI7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXN0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgX2lkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbX2ldO1xuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcbiAgICAgIGlmIChzdHlsZXNJbkRPTVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5ET01bX2luZGV4XS51cGRhdGVyKCk7XG4gICAgICAgIHN0eWxlc0luRE9NLnNwbGljZShfaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7XG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG4gICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gc3R5bGVUYXJnZXQuY29udGVudERvY3VtZW50LmhlYWQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cbiAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRCeVNlbGVjdG9yKGluc2VydCwgc3R5bGUpIHtcbiAgdmFyIHRhcmdldCA9IGdldFRhcmdldChpbnNlcnQpO1xuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cbiAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0QnlTZWxlY3RvcjsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgb3B0aW9ucy5zZXRBdHRyaWJ1dGVzKGVsZW1lbnQsIG9wdGlvbnMuYXR0cmlidXRlcyk7XG4gIG9wdGlvbnMuaW5zZXJ0KGVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG4gIHJldHVybiBlbGVtZW50O1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG4gIGlmIChub25jZSkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBub25jZSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKSB7XG4gIHZhciBjc3MgPSBcIlwiO1xuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIik7XG4gIH1cbiAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBvYmoubGF5ZXIgIT09IFwidW5kZWZpbmVkXCI7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cbiAgY3NzICs9IG9iai5jc3M7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH1cblxuICAvLyBGb3Igb2xkIElFXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cbiAgb3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGRvbUFQSShvcHRpb25zKSB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoKSB7fSxcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICB9O1xuICB9XG4gIHZhciBzdHlsZUVsZW1lbnQgPSBvcHRpb25zLmluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgcmV0dXJuIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShvYmopIHtcbiAgICAgIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG4gICAgfVxuICB9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzdHlsZVRhZ1RyYW5zZm9ybTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwidmFyIHdlYnBhY2tRdWV1ZXMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2woXCJ3ZWJwYWNrIHF1ZXVlc1wiKSA6IFwiX193ZWJwYWNrX3F1ZXVlc19fXCI7XG52YXIgd2VicGFja0V4cG9ydHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2woXCJ3ZWJwYWNrIGV4cG9ydHNcIikgOiBcIl9fd2VicGFja19leHBvcnRzX19cIjtcbnZhciB3ZWJwYWNrRXJyb3IgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2woXCJ3ZWJwYWNrIGVycm9yXCIpIDogXCJfX3dlYnBhY2tfZXJyb3JfX1wiO1xudmFyIHJlc29sdmVRdWV1ZSA9IChxdWV1ZSkgPT4ge1xuXHRpZihxdWV1ZSAmJiBxdWV1ZS5kIDwgMSkge1xuXHRcdHF1ZXVlLmQgPSAxO1xuXHRcdHF1ZXVlLmZvckVhY2goKGZuKSA9PiAoZm4uci0tKSk7XG5cdFx0cXVldWUuZm9yRWFjaCgoZm4pID0+IChmbi5yLS0gPyBmbi5yKysgOiBmbigpKSk7XG5cdH1cbn1cbnZhciB3cmFwRGVwcyA9IChkZXBzKSA9PiAoZGVwcy5tYXAoKGRlcCkgPT4ge1xuXHRpZihkZXAgIT09IG51bGwgJiYgdHlwZW9mIGRlcCA9PT0gXCJvYmplY3RcIikge1xuXHRcdGlmKGRlcFt3ZWJwYWNrUXVldWVzXSkgcmV0dXJuIGRlcDtcblx0XHRpZihkZXAudGhlbikge1xuXHRcdFx0dmFyIHF1ZXVlID0gW107XG5cdFx0XHRxdWV1ZS5kID0gMDtcblx0XHRcdGRlcC50aGVuKChyKSA9PiB7XG5cdFx0XHRcdG9ialt3ZWJwYWNrRXhwb3J0c10gPSByO1xuXHRcdFx0XHRyZXNvbHZlUXVldWUocXVldWUpO1xuXHRcdFx0fSwgKGUpID0+IHtcblx0XHRcdFx0b2JqW3dlYnBhY2tFcnJvcl0gPSBlO1xuXHRcdFx0XHRyZXNvbHZlUXVldWUocXVldWUpO1xuXHRcdFx0fSk7XG5cdFx0XHR2YXIgb2JqID0ge307XG5cdFx0XHRvYmpbd2VicGFja1F1ZXVlc10gPSAoZm4pID0+IChmbihxdWV1ZSkpO1xuXHRcdFx0cmV0dXJuIG9iajtcblx0XHR9XG5cdH1cblx0dmFyIHJldCA9IHt9O1xuXHRyZXRbd2VicGFja1F1ZXVlc10gPSB4ID0+IHt9O1xuXHRyZXRbd2VicGFja0V4cG9ydHNdID0gZGVwO1xuXHRyZXR1cm4gcmV0O1xufSkpO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5hID0gKG1vZHVsZSwgYm9keSwgaGFzQXdhaXQpID0+IHtcblx0dmFyIHF1ZXVlO1xuXHRoYXNBd2FpdCAmJiAoKHF1ZXVlID0gW10pLmQgPSAtMSk7XG5cdHZhciBkZXBRdWV1ZXMgPSBuZXcgU2V0KCk7XG5cdHZhciBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHM7XG5cdHZhciBjdXJyZW50RGVwcztcblx0dmFyIG91dGVyUmVzb2x2ZTtcblx0dmFyIHJlamVjdDtcblx0dmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqKSA9PiB7XG5cdFx0cmVqZWN0ID0gcmVqO1xuXHRcdG91dGVyUmVzb2x2ZSA9IHJlc29sdmU7XG5cdH0pO1xuXHRwcm9taXNlW3dlYnBhY2tFeHBvcnRzXSA9IGV4cG9ydHM7XG5cdHByb21pc2Vbd2VicGFja1F1ZXVlc10gPSAoZm4pID0+IChxdWV1ZSAmJiBmbihxdWV1ZSksIGRlcFF1ZXVlcy5mb3JFYWNoKGZuKSwgcHJvbWlzZVtcImNhdGNoXCJdKHggPT4ge30pKTtcblx0bW9kdWxlLmV4cG9ydHMgPSBwcm9taXNlO1xuXHRib2R5KChkZXBzKSA9PiB7XG5cdFx0Y3VycmVudERlcHMgPSB3cmFwRGVwcyhkZXBzKTtcblx0XHR2YXIgZm47XG5cdFx0dmFyIGdldFJlc3VsdCA9ICgpID0+IChjdXJyZW50RGVwcy5tYXAoKGQpID0+IHtcblx0XHRcdGlmKGRbd2VicGFja0Vycm9yXSkgdGhyb3cgZFt3ZWJwYWNrRXJyb3JdO1xuXHRcdFx0cmV0dXJuIGRbd2VicGFja0V4cG9ydHNdO1xuXHRcdH0pKVxuXHRcdHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdGZuID0gKCkgPT4gKHJlc29sdmUoZ2V0UmVzdWx0KSk7XG5cdFx0XHRmbi5yID0gMDtcblx0XHRcdHZhciBmblF1ZXVlID0gKHEpID0+IChxICE9PSBxdWV1ZSAmJiAhZGVwUXVldWVzLmhhcyhxKSAmJiAoZGVwUXVldWVzLmFkZChxKSwgcSAmJiAhcS5kICYmIChmbi5yKyssIHEucHVzaChmbikpKSk7XG5cdFx0XHRjdXJyZW50RGVwcy5tYXAoKGRlcCkgPT4gKGRlcFt3ZWJwYWNrUXVldWVzXShmblF1ZXVlKSkpO1xuXHRcdH0pO1xuXHRcdHJldHVybiBmbi5yID8gcHJvbWlzZSA6IGdldFJlc3VsdCgpO1xuXHR9LCAoZXJyKSA9PiAoKGVyciA/IHJlamVjdChwcm9taXNlW3dlYnBhY2tFcnJvcl0gPSBlcnIpIDogb3V0ZXJSZXNvbHZlKGV4cG9ydHMpKSwgcmVzb2x2ZVF1ZXVlKHF1ZXVlKSkpO1xuXHRxdWV1ZSAmJiBxdWV1ZS5kIDwgMCAmJiAocXVldWUuZCA9IDApO1xufTsiLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm5jID0gdW5kZWZpbmVkOyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgdXNlZCAnbW9kdWxlJyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9pbmRleC5qc1wiKTtcbiIsIiJdLCJuYW1lcyI6WyJHYW1lYm9hcmQiLCJncmlkIiwic2hpcHNUb1BsYWNlIiwic2hpcFR5cGUiLCJzaGlwTGVuZ3RoIiwiY3VycmVudE9yaWVudGF0aW9uIiwiY3VycmVudFNoaXAiLCJsYXN0SG92ZXJlZENlbGwiLCJwbGFjZVNoaXBHdWlkZSIsInByb21wdCIsInByb21wdFR5cGUiLCJnYW1lcGxheUd1aWRlIiwidHVyblByb21wdCIsInByb2Nlc3NDb21tYW5kIiwiY29tbWFuZCIsImlzTW92ZSIsInBhcnRzIiwic3BsaXQiLCJsZW5ndGgiLCJFcnJvciIsImdyaWRQb3NpdGlvbiIsInRvVXBwZXJDYXNlIiwidmFsaWRHcmlkUG9zaXRpb25zIiwiZmxhdCIsImluY2x1ZGVzIiwicmVzdWx0Iiwib3JpZW50YXRpb24iLCJ0b0xvd2VyQ2FzZSIsInVwZGF0ZU91dHB1dCIsIm1lc3NhZ2UiLCJ0eXBlIiwib3V0cHV0IiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsIm1lc3NhZ2VFbGVtZW50IiwiY3JlYXRlRWxlbWVudCIsInRleHRDb250ZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwiYXBwZW5kQ2hpbGQiLCJzY3JvbGxUb3AiLCJzY3JvbGxIZWlnaHQiLCJjb25zb2xlTG9nUGxhY2VtZW50Q29tbWFuZCIsImRpckZlZWJhY2siLCJjaGFyQXQiLCJzbGljZSIsImNvbnNvbGUiLCJsb2ciLCJ2YWx1ZSIsImNvbnNvbGVMb2dNb3ZlQ29tbWFuZCIsInJlc3VsdHNPYmplY3QiLCJwbGF5ZXIiLCJtb3ZlIiwiaGl0IiwiY29uc29sZUxvZ0Vycm9yIiwiZXJyb3IiLCJpbml0VWlNYW5hZ2VyIiwidWlNYW5hZ2VyIiwiaW5pdENvbnNvbGVVSSIsImNyZWF0ZUdhbWVib2FyZCIsImNhbGN1bGF0ZVNoaXBDZWxscyIsInN0YXJ0Q2VsbCIsImNlbGxJZHMiLCJyb3dJbmRleCIsImNoYXJDb2RlQXQiLCJjb2xJbmRleCIsInBhcnNlSW50Iiwic3Vic3RyaW5nIiwiaSIsInB1c2giLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJoaWdobGlnaHRDZWxscyIsImZvckVhY2giLCJjZWxsSWQiLCJjZWxsRWxlbWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJjbGVhckhpZ2hsaWdodCIsInJlbW92ZSIsInRvZ2dsZU9yaWVudGF0aW9uIiwiaGFuZGxlUGxhY2VtZW50SG92ZXIiLCJlIiwiY2VsbCIsInRhcmdldCIsImNvbnRhaW5zIiwiZGF0YXNldCIsImNlbGxQb3MiLCJwb3NpdGlvbiIsImNlbGxzVG9IaWdobGlnaHQiLCJoYW5kbGVNb3VzZUxlYXZlIiwiY2VsbHNUb0NsZWFyIiwiaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUiLCJrZXkiLCJwcmV2ZW50RGVmYXVsdCIsIm9sZENlbGxzVG9DbGVhciIsIm5ld0NlbGxzVG9IaWdobGlnaHQiLCJlbmFibGVDb21wdXRlckdhbWVib2FyZEhvdmVyIiwicXVlcnlTZWxlY3RvckFsbCIsImRpc2FibGVDb21wdXRlckdhbWVib2FyZEhvdmVyIiwiZGlzYWJsZUh1bWFuR2FtZWJvYXJkSG92ZXIiLCJzd2l0Y2hHYW1lYm9hcmRIb3ZlclN0YXRlcyIsInNldHVwR2FtZWJvYXJkRm9yUGxhY2VtZW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsImdhbWVib2FyZEFyZWEiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiY2xlYW51cEFmdGVyUGxhY2VtZW50Iiwic3RhcnRHYW1lIiwiZ2FtZSIsInNldFVwIiwic2hpcCIsInJlbmRlclNoaXBEaXNwIiwicGxheWVycyIsImNvbXB1dGVyIiwiZGlzcGxheVByb21wdCIsImhhbmRsZUh1bWFuTW92ZSIsImRhdGEiLCJzZXR1cEdhbWVib2FyZEZvclBsYXllck1vdmUiLCJwbGF5ZXJNb3ZlIiwiY29tcHV0ZXJNb3ZlIiwiaHVtYW5QbGF5ZXJHYW1lYm9hcmQiLCJjb21wUGxheWVyIiwiY29tcE1vdmVSZXN1bHQiLCJtYWtlTW92ZSIsImNoZWNrV2luQ29uZGl0aW9uIiwiY29uY2x1ZGVHYW1lIiwiQWN0aW9uQ29udHJvbGxlciIsImh1bWFuUGxheWVyIiwiaHVtYW4iLCJnYW1lYm9hcmQiLCJjb21wUGxheWVyR2FtZWJvYXJkIiwic2V0dXBFdmVudExpc3RlbmVycyIsImhhbmRsZXJGdW5jdGlvbiIsInBsYXllclR5cGUiLCJjbGVhbnVwRnVuY3Rpb25zIiwiY29uc29sZVN1Ym1pdEJ1dHRvbiIsImNvbnNvbGVJbnB1dCIsInN1Ym1pdEhhbmRsZXIiLCJpbnB1dCIsImtleXByZXNzSGFuZGxlciIsImNsaWNrSGFuZGxlciIsImNsZWFudXAiLCJwcm9tcHRBbmRQbGFjZVNoaXAiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImZpbmQiLCJwbGFjZVNoaXBQcm9tcHQiLCJoYW5kbGVWYWxpZElucHV0IiwicGxhY2VTaGlwIiwicmVuZGVyU2hpcEJvYXJkIiwicmVzb2x2ZVNoaXBQbGFjZW1lbnQiLCJzZXR1cFNoaXBzU2VxdWVudGlhbGx5IiwiaGFuZGxlU2V0dXAiLCJwcm9tcHRQbGF5ZXJNb3ZlIiwiaHVtYW5Nb3ZlUmVzdWx0IiwidW5kZWZpbmVkIiwiaGFuZGxlVmFsaWRNb3ZlIiwicmVzb2x2ZU1vdmUiLCJwbGF5R2FtZSIsImdhbWVPdmVyIiwibGFzdENvbXBNb3ZlUmVzdWx0IiwibGFzdEh1bWFuTW92ZVJlc3VsdCIsImRpciIsImN1cnJlbnRQbGF5ZXIiLCJPdmVybGFwcGluZ1NoaXBzRXJyb3IiLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJTaGlwQWxsb2NhdGlvblJlYWNoZWRFcnJvciIsIlNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvciIsIkludmFsaWRTaGlwTGVuZ3RoRXJyb3IiLCJJbnZhbGlkU2hpcFR5cGVFcnJvciIsIkludmFsaWRQbGF5ZXJUeXBlRXJyb3IiLCJTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvciIsIlJlcGVhdEF0dGFja2VkRXJyb3IiLCJJbnZhbGlkTW92ZUVudHJ5RXJyb3IiLCJQbGF5ZXIiLCJTaGlwIiwiR2FtZSIsImh1bWFuR2FtZWJvYXJkIiwiY29tcHV0ZXJHYW1lYm9hcmQiLCJjb21wdXRlclBsYXllciIsImdhbWVPdmVyU3RhdGUiLCJwbGFjZVNoaXBzIiwiZW5kR2FtZSIsInRha2VUdXJuIiwiZmVlZGJhY2siLCJvcHBvbmVudCIsImlzU2hpcFN1bmsiLCJnYW1lV29uIiwiY2hlY2tBbGxTaGlwc1N1bmsiLCJpbmRleENhbGNzIiwic3RhcnQiLCJjb2xMZXR0ZXIiLCJyb3dOdW1iZXIiLCJjaGVja1R5cGUiLCJzaGlwUG9zaXRpb25zIiwiT2JqZWN0Iiwia2V5cyIsImV4aXN0aW5nU2hpcFR5cGUiLCJjaGVja0JvdW5kYXJpZXMiLCJjb29yZHMiLCJkaXJlY3Rpb24iLCJ4TGltaXQiLCJ5TGltaXQiLCJ4IiwieSIsImNhbGN1bGF0ZVNoaXBQb3NpdGlvbnMiLCJwb3NpdGlvbnMiLCJjaGVja0Zvck92ZXJsYXAiLCJlbnRyaWVzIiwiZXhpc3RpbmdTaGlwUG9zaXRpb25zIiwic29tZSIsImNoZWNrRm9ySGl0IiwiZm91bmRTaGlwIiwiXyIsInNoaXBGYWN0b3J5Iiwic2hpcHMiLCJoaXRQb3NpdGlvbnMiLCJhdHRhY2tMb2ciLCJuZXdTaGlwIiwiYXR0YWNrIiwicmVzcG9uc2UiLCJjaGVja1Jlc3VsdHMiLCJpc1N1bmsiLCJldmVyeSIsInNoaXBSZXBvcnQiLCJmbG9hdGluZ1NoaXBzIiwiZmlsdGVyIiwibWFwIiwiZ2V0U2hpcCIsImdldFNoaXBQb3NpdGlvbnMiLCJnZXRIaXRQb3NpdGlvbnMiLCJVaU1hbmFnZXIiLCJuZXdVaU1hbmFnZXIiLCJuZXdHYW1lIiwiYWN0Q29udHJvbGxlciIsImNoZWNrTW92ZSIsImdiR3JpZCIsInZhbGlkIiwiZWwiLCJwIiwicmFuZE1vdmUiLCJtb3ZlTG9nIiwiYWxsTW92ZXMiLCJmbGF0TWFwIiwicm93IiwicG9zc2libGVNb3ZlcyIsInJhbmRvbU1vdmUiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJnZW5lcmF0ZVJhbmRvbVN0YXJ0Iiwic2l6ZSIsInZhbGlkU3RhcnRzIiwiY29sIiwicmFuZG9tSW5kZXgiLCJhdXRvUGxhY2VtZW50Iiwic2hpcFR5cGVzIiwicGxhY2VkIiwib3BwR2FtZWJvYXJkIiwic2V0TGVuZ3RoIiwiaGl0cyIsImJ1aWxkU2hpcCIsIm9iaiIsImRvbVNlbCIsInNoaXBTZWN0cyIsInNlY3QiLCJjbGFzc05hbWUiLCJzZXRBdHRyaWJ1dGUiLCJjb250YWluZXJJRCIsImNvbnRhaW5lciIsImdyaWREaXYiLCJjb2x1bW5zIiwiaGVhZGVyIiwicm93TGFiZWwiLCJpZCIsImNvbnNvbGVDb250YWluZXIiLCJpbnB1dERpdiIsInN1Ym1pdEJ1dHRvbiIsInByb21wdE9ianMiLCJkaXNwbGF5IiwiZmlyc3RDaGlsZCIsInJlbW92ZUNoaWxkIiwicHJvbXB0RGl2IiwicGxheWVyT2JqIiwiaWRTZWwiLCJkaXNwRGl2Iiwic2hpcERpdiIsInRpdGxlIiwic2VjdHNEaXYiLCJzaGlwT2JqIiwic2hpcFNlY3QiLCJzZWN0aW9uIl0sInNvdXJjZVJvb3QiOiIifQ==