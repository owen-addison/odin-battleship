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
const hitClr = "lime-600";
const missClr = "orange-600";
const errorClr = "red-700";
const defaultClr = "gray-600";
const primaryHoverClr = "orange-500";
const secondaryHoverClr = "orange-400";
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
      messageElement.classList.add(`text-${hitClr}`);
      break;
    case "miss":
      messageElement.classList.add(`text-${missClr}`);
      break;
    case "error":
      messageElement.classList.add(`text-${errorClr}`);
      break;
    default:
      messageElement.classList.add(`text-${defaultClr}`);
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
      cellElement.classList.add(`bg-${secondaryHoverClr}`);
    }
  });
}

// Function to clear highlight from cells
function clearHighlight(cellIds) {
  cellIds.forEach(cellId => {
    const cellElement = document.querySelector(`[data-position="${cellId}"]`);
    if (cellElement) {
      cellElement.classList.remove(`bg-${secondaryHoverClr}`);
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
    cell.classList.remove(`hover:bg-${primaryHoverClr}`);
    cell.classList.add(`hover:bg-${primaryHoverClr}`);
  });
}
function disableComputerGameboardHover(cellsArray) {
  cellsArray.forEach(cell => {
    cell.classList.add("pointer-events-none", "cursor-default");
    cell.classList.remove(`hover:bg-${primaryHoverClr}`);
  });
}
function disableHumanGameboardHover() {
  document.querySelectorAll('.gameboard-cell[data-player="human"]').forEach(cell => {
    cell.classList.add("pointer-events-none", "cursor-default");
    cell.classList.remove(`hover:bg-${primaryHoverClr}`);
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
  const compGameboardCells = document.querySelectorAll('.gameboard-cell[data-player="computer"]');
  disableComputerGameboardHover(compGameboardCells);
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
  const updateComputerDisplays = humanMoveResult => {
    // Set the player selector of the opponent depending on the player
    // who made the move
    const playerSelector = humanMoveResult.player === "human" ? "computer" : "human";
    console.log("updateComputerDisplays func -->");
    console.dir(humanMoveResult);
    // Get the DOM element for the cell
    const cell = document.querySelector(`.gameboard-cell[data-player=${playerSelector}][data-position=${humanMoveResult.move}]`);
    console.log(cell);

    // Disable the cell from future clicks
    disableComputerGameboardHover([cell]);

    // Handle miss and hit
    if (!humanMoveResult.hit) {
      // Update the cells styling to reflect miss
      cell.classList.add(`bg-${missClr}`);
    } else {
      // Update the cells styling to reflect hit
      cell.classList.add(`bg-${hitClr}`);
    }
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

          // Update the computer player's ships display and gameboard
          // depending on outcome of move
          updateComputerDisplays(humanMoveResult);

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
const instructionClr = "text-lime-600";
const guideClr = "text-sky-600";
const errorClr = "text-red-700";
const defaultClr = "text-gray-700";
const cellClr = "bg-gray-200";
const inputClr = "bg-gray-400";
const ouputClr = cellClr;
const buttonClr = "bg-gray-800";
const buttonTextClr = "bg-gray-100";
const shipSectClr = "bg-sky-700";

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
    sect.className = `w-4 h-4 rounded-full`; // Set the default styling for the section element
    sect.classList.add(shipSectClr);
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
        cell.className = `w-6 h-6 flex justify-center items-center cursor-pointer hover:bg-orange-500`; // Add more classes as needed for styling
        cell.classList.add(cellClr);
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
    input.className = `p-1 bg-${inputClr} flex-1`; // Add TailwindCSS classes
    const submitButton = document.createElement("button"); // Create a button element for the console submit
    submitButton.textContent = "Submit"; // Add the text "Submit" to the button
    submitButton.setAttribute("id", "console-submit"); // Set the id for the button
    submitButton.className = `px-3 py-1 text-center text-sm`; // Add TailwindCSS classes
    submitButton.classList.add(buttonClr);
    submitButton.classList.add(buttonTextClr);
    const output = document.createElement("div"); // Create an div element for the output of the console
    output.setAttribute("id", "console-output"); // Set the id for the output element
    output.className = `p-1 flex-1 h-4/5 overflow-auto`; // Add TailwindCSS classes
    output.classList.add(ouputClr);

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
          promptDiv.classList.add(instructionClr);
          break;
        case "guide":
          promptDiv.classList.add(guideClr);
          break;
        case "error":
          promptDiv.classList.add(errorClr);
          break;
        default:
          promptDiv.classList.add(defaultClr);
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
.bg-gray-100 {
  --tw-bg-opacity: 1;
  background-color: rgb(243 244 246 / var(--tw-bg-opacity));
}
.bg-gray-200 {
  --tw-bg-opacity: 1;
  background-color: rgb(229 231 235 / var(--tw-bg-opacity));
}
.bg-gray-400 {
  --tw-bg-opacity: 1;
  background-color: rgb(156 163 175 / var(--tw-bg-opacity));
}
.bg-gray-600 {
  --tw-bg-opacity: 1;
  background-color: rgb(75 85 99 / var(--tw-bg-opacity));
}
.bg-gray-700 {
  --tw-bg-opacity: 1;
  background-color: rgb(55 65 81 / var(--tw-bg-opacity));
}
.bg-gray-800 {
  --tw-bg-opacity: 1;
  background-color: rgb(31 41 55 / var(--tw-bg-opacity));
}
.bg-lime-600 {
  --tw-bg-opacity: 1;
  background-color: rgb(101 163 13 / var(--tw-bg-opacity));
}
.bg-orange-400 {
  --tw-bg-opacity: 1;
  background-color: rgb(251 146 60 / var(--tw-bg-opacity));
}
.bg-sky-700 {
  --tw-bg-opacity: 1;
  background-color: rgb(3 105 161 / var(--tw-bg-opacity));
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
.text-gray-700 {
  --tw-text-opacity: 1;
  color: rgb(55 65 81 / var(--tw-text-opacity));
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
}`, "",{"version":3,"sources":["webpack://./src/styles.css"],"names":[],"mappings":"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;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,wBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,2BAAmB;EAAnB;AAAmB;AAAnB;EAAA,2BAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,qBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,mBAAmB;EAAnB;AAAmB;AAAnB;EAAA,iBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,mBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAFnB;EAAA,kBAEoB;EAFpB;AAEoB","sourcesContent":["@tailwind base;\n@tailwind components;\n@tailwind utilities;"],"sourceRoot":""}]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEI7QUFDOUIsaUNBQWlDO0FBQ2pDLDBCQUEwQjtBQUMxQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxpQ0FBaUM7QUFDakMsd0JBQXdCO0FBQ3hCOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4QkFBOEI7QUFDOUIsaUJBQWlCO0FBQ2pCOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxjQUFjO0FBQ2Qsa0JBQWtCO0FBQ2xCOztBQUVBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Qsa0JBQWtCO0FBQ2xCOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCLDBCQUEwQjtBQUMxQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsT0FBTyxrRkFBa0YsWUFBWSxNQUFNLE9BQU8scUJBQXFCLG9CQUFvQixxQkFBcUIscUJBQXFCLE1BQU0sTUFBTSxXQUFXLE1BQU0sWUFBWSxNQUFNLE1BQU0scUJBQXFCLHFCQUFxQixxQkFBcUIsVUFBVSxvQkFBb0IscUJBQXFCLHFCQUFxQixxQkFBcUIscUJBQXFCLE1BQU0sT0FBTyxNQUFNLEtBQUssb0JBQW9CLHFCQUFxQixNQUFNLFFBQVEsTUFBTSxLQUFLLG9CQUFvQixvQkFBb0IscUJBQXFCLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxXQUFXLE1BQU0sTUFBTSxNQUFNLFVBQVUsV0FBVyxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssVUFBVSxXQUFXLE1BQU0sTUFBTSxNQUFNLE1BQU0sV0FBVyxNQUFNLFNBQVMsTUFBTSxRQUFRLHFCQUFxQixxQkFBcUIscUJBQXFCLG9CQUFvQixNQUFNLE1BQU0sTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLE1BQU0sTUFBTSxVQUFVLFVBQVUsV0FBVyxXQUFXLE1BQU0sS0FBSyxVQUFVLE1BQU0sS0FBSyxVQUFVLE1BQU0sUUFBUSxNQUFNLEtBQUssb0JBQW9CLHFCQUFxQixxQkFBcUIsTUFBTSxRQUFRLE1BQU0sU0FBUyxxQkFBcUIscUJBQXFCLHFCQUFxQixvQkFBb0IscUJBQXFCLHFCQUFxQixvQkFBb0Isb0JBQW9CLG9CQUFvQixNQUFNLE1BQU0sTUFBTSxNQUFNLFdBQVcsTUFBTSxPQUFPLE1BQU0sUUFBUSxxQkFBcUIscUJBQXFCLHFCQUFxQixNQUFNLE1BQU0sTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sTUFBTSxNQUFNLFVBQVUsTUFBTSxPQUFPLE1BQU0sS0FBSyxxQkFBcUIscUJBQXFCLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE9BQU8sTUFBTSxLQUFLLHFCQUFxQixvQkFBb0IsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxNQUFNLGlCQUFpQixVQUFVLE1BQU0sS0FBSyxVQUFVLFVBQVUsTUFBTSxLQUFLLFVBQVUsTUFBTSxPQUFPLFdBQVcsVUFBVSxVQUFVLE1BQU0sTUFBTSxLQUFLLEtBQUssVUFBVSxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxPQUFPLE1BQU0sS0FBSyxvQkFBb0Isb0JBQW9CLE1BQU0sTUFBTSxvQkFBb0Isb0JBQW9CLE1BQU0sTUFBTSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sS0FBSyxLQUFLLFVBQVUsTUFBTSxRQUFRLE1BQU0sWUFBWSxvQkFBb0IscUJBQXFCLE1BQU0sTUFBTSxNQUFNLE1BQU0sVUFBVSxVQUFVLE1BQU0sV0FBVyxLQUFLLFVBQVUsTUFBTSxLQUFLLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsS0FBSyxNQUFNLEtBQUssV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxLQUFLLEtBQUssS0FBSyxLQUFLLE1BQU0sT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlB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YXR0bGVzaGlwLy4vc3JjL2FjdGlvbkNvbnRyb2xsZXIuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2Vycm9ycy5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvZ2FtZS5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvZ2FtZWJvYXJkLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvcGxheWVyLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9zaGlwLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy91aU1hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3N0eWxlcy5jc3MiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvc3R5bGVzLmNzcz8wYTI1Iiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvYXN5bmMgbW9kdWxlIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvbm9uY2UiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBHYW1lYm9hcmQgZnJvbSBcIi4vZ2FtZWJvYXJkXCI7XG5cbmNvbnN0IHsgZ3JpZCB9ID0gR2FtZWJvYXJkKCk7XG5cbmNvbnN0IHNoaXBzVG9QbGFjZSA9IFtcbiAgeyBzaGlwVHlwZTogXCJjYXJyaWVyXCIsIHNoaXBMZW5ndGg6IDUgfSxcbiAgeyBzaGlwVHlwZTogXCJiYXR0bGVzaGlwXCIsIHNoaXBMZW5ndGg6IDQgfSxcbiAgeyBzaGlwVHlwZTogXCJzdWJtYXJpbmVcIiwgc2hpcExlbmd0aDogMyB9LFxuICB7IHNoaXBUeXBlOiBcImNydWlzZXJcIiwgc2hpcExlbmd0aDogMyB9LFxuICB7IHNoaXBUeXBlOiBcImRlc3Ryb3llclwiLCBzaGlwTGVuZ3RoOiAyIH0sXG5dO1xuXG5jb25zdCBoaXRDbHIgPSBcImxpbWUtNjAwXCI7XG5jb25zdCBtaXNzQ2xyID0gXCJvcmFuZ2UtNjAwXCI7XG5jb25zdCBlcnJvckNsciA9IFwicmVkLTcwMFwiO1xuY29uc3QgZGVmYXVsdENsciA9IFwiZ3JheS02MDBcIjtcblxuY29uc3QgcHJpbWFyeUhvdmVyQ2xyID0gXCJvcmFuZ2UtNTAwXCI7XG5jb25zdCBzZWNvbmRhcnlIb3ZlckNsciA9IFwib3JhbmdlLTQwMFwiO1xuXG5sZXQgY3VycmVudE9yaWVudGF0aW9uID0gXCJoXCI7IC8vIERlZmF1bHQgb3JpZW50YXRpb25cbmxldCBjdXJyZW50U2hpcDtcbmxldCBsYXN0SG92ZXJlZENlbGwgPSBudWxsOyAvLyBTdG9yZSB0aGUgbGFzdCBob3ZlcmVkIGNlbGwncyBJRFxuXG5jb25zdCBwbGFjZVNoaXBHdWlkZSA9IHtcbiAgcHJvbXB0OlxuICAgIFwiRW50ZXIgdGhlIGdyaWQgcG9zaXRpb24gKGkuZS4gJ0ExJykgYW5kIG9yaWVudGF0aW9uICgnaCcgZm9yIGhvcml6b250YWwgYW5kICd2JyBmb3IgdmVydGljYWwpLCBzZXBhcmF0ZWQgd2l0aCBhIHNwYWNlLiBGb3IgZXhhbXBsZSAnQTIgdicuIEFsdGVybmF0aXZlbHksIG9uIHlvdSBnYW1lYm9hcmQgY2xpY2sgdGhlIGNlbGwgeW91IHdhbnQgdG8gc2V0IGF0IHRoZSBzdGFydGluZyBwb2ludCwgdXNlIHNwYWNlYmFyIHRvIHRvZ2dsZSB0aGUgb3JpZW50YXRpb24uXCIsXG4gIHByb21wdFR5cGU6IFwiZ3VpZGVcIixcbn07XG5cbmNvbnN0IGdhbWVwbGF5R3VpZGUgPSB7XG4gIHByb21wdDpcbiAgICBcIkVudGVyIGdyaWQgcG9zaXRpb24gKGkuZS4gJ0ExJykgeW91IHdhbnQgdG8gYXR0YWNrLiBBbHRlcm5hdGl2ZWx5LCBjbGljayB0aGUgY2VsbCB5b3Ugd2FudCB0byBhdHRhY2sgb24gdGhlIG9wcG9uZW50J3MgZ2FtZWJvYXJkXCIsXG4gIHByb21wdFR5cGU6IFwiZ3VpZGVcIixcbn07XG5cbmNvbnN0IHR1cm5Qcm9tcHQgPSB7XG4gIHByb21wdDogXCJNYWtlIHlvdXIgbW92ZS5cIixcbiAgcHJvbXB0VHlwZTogXCJpbnN0cnVjdGlvblwiLFxufTtcblxuY29uc3QgcHJvY2Vzc0NvbW1hbmQgPSAoY29tbWFuZCwgaXNNb3ZlKSA9PiB7XG4gIC8vIElmIGlzTW92ZSBpcyB0cnV0aHksIGFzc2lnbiBhcyBzaW5nbGUgaXRlbSBhcnJheSwgb3RoZXJ3aXNlIHNwbGl0IHRoZSBjb21tYW5kIGJ5IHNwYWNlXG4gIGNvbnN0IHBhcnRzID0gaXNNb3ZlID8gW2NvbW1hbmRdIDogY29tbWFuZC5zcGxpdChcIiBcIik7XG4gIGlmICghaXNNb3ZlICYmIHBhcnRzLmxlbmd0aCAhPT0gMikge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIFwiSW52YWxpZCBjb21tYW5kIGZvcm1hdC4gUGxlYXNlIHVzZSB0aGUgZm9ybWF0ICdHcmlkUG9zaXRpb24gT3JpZW50YXRpb24nLlwiLFxuICAgICk7XG4gIH1cblxuICAvLyBQcm9jZXNzIGFuZCB2YWxpZGF0ZSB0aGUgZ3JpZCBwb3NpdGlvblxuICBjb25zdCBncmlkUG9zaXRpb24gPSBwYXJ0c1swXS50b1VwcGVyQ2FzZSgpO1xuICBpZiAoZ3JpZFBvc2l0aW9uLmxlbmd0aCA8IDIgfHwgZ3JpZFBvc2l0aW9uLmxlbmd0aCA+IDMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGdyaWQgcG9zaXRpb24uIE11c3QgYmUgMiB0byAzIGNoYXJhY3RlcnMgbG9uZy5cIik7XG4gIH1cblxuICAvLyBWYWxpZGF0ZSBncmlkIHBvc2l0aW9uIGFnYWluc3QgdGhlIGdyaWQgbWF0cml4XG4gIGNvbnN0IHZhbGlkR3JpZFBvc2l0aW9ucyA9IGdyaWQuZmxhdCgpOyAvLyBGbGF0dGVuIHRoZSBncmlkIGZvciBlYXNpZXIgc2VhcmNoaW5nXG4gIGlmICghdmFsaWRHcmlkUG9zaXRpb25zLmluY2x1ZGVzKGdyaWRQb3NpdGlvbikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIkludmFsaWQgZ3JpZCBwb3NpdGlvbi4gRG9lcyBub3QgbWF0Y2ggYW55IHZhbGlkIGdyaWQgdmFsdWVzLlwiLFxuICAgICk7XG4gIH1cblxuICBjb25zdCByZXN1bHQgPSB7IGdyaWRQb3NpdGlvbiB9O1xuXG4gIGlmICghaXNNb3ZlKSB7XG4gICAgLy8gUHJvY2VzcyBhbmQgdmFsaWRhdGUgdGhlIG9yaWVudGF0aW9uXG4gICAgY29uc3Qgb3JpZW50YXRpb24gPSBwYXJ0c1sxXS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChvcmllbnRhdGlvbiAhPT0gXCJoXCIgJiYgb3JpZW50YXRpb24gIT09IFwidlwiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiSW52YWxpZCBvcmllbnRhdGlvbi4gTXVzdCBiZSBlaXRoZXIgJ2gnIGZvciBob3Jpem9udGFsIG9yICd2JyBmb3IgdmVydGljYWwuXCIsXG4gICAgICApO1xuICAgIH1cblxuICAgIHJlc3VsdC5vcmllbnRhdGlvbiA9IG9yaWVudGF0aW9uO1xuICB9XG5cbiAgLy8gUmV0dXJuIHRoZSBwcm9jZXNzZWQgYW5kIHZhbGlkYXRlZCBjb21tYW5kIHBhcnRzXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vLyBUaGUgZnVuY3Rpb24gZm9yIHVwZGF0aW5nIHRoZSBvdXRwdXQgZGl2IGVsZW1lbnRcbmNvbnN0IHVwZGF0ZU91dHB1dCA9IChtZXNzYWdlLCB0eXBlKSA9PiB7XG4gIC8vIEdldCB0aGUgb3VwdXQgZWxlbWVudFxuICBjb25zdCBvdXRwdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtb3V0cHV0XCIpO1xuXG4gIC8vIEFwcGVuZCBuZXcgbWVzc2FnZVxuICBjb25zdCBtZXNzYWdlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7IC8vIENyZWF0ZSBhIG5ldyBkaXYgZm9yIHRoZSBtZXNzYWdlXG4gIG1lc3NhZ2VFbGVtZW50LnRleHRDb250ZW50ID0gbWVzc2FnZTsgLy8gU2V0IHRoZSB0ZXh0IGNvbnRlbnQgdG8gdGhlIG1lc3NhZ2VcblxuICAvLyBBcHBseSBzdHlsaW5nIGJhc2VkIG9uIHByb21wdFR5cGVcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSBcInZhbGlkXCI6XG4gICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKGB0ZXh0LSR7aGl0Q2xyfWApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIm1pc3NcIjpcbiAgICAgIG1lc3NhZ2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoYHRleHQtJHttaXNzQ2xyfWApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImVycm9yXCI6XG4gICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKGB0ZXh0LSR7ZXJyb3JDbHJ9YCk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZChgdGV4dC0ke2RlZmF1bHRDbHJ9YCk7IC8vIERlZmF1bHQgdGV4dCBjb2xvclxuICB9XG5cbiAgb3V0cHV0LmFwcGVuZENoaWxkKG1lc3NhZ2VFbGVtZW50KTsgLy8gQWRkIHRoZSBlbGVtZW50IHRvIHRoZSBvdXRwdXRcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgb3V0cHV0LnNjcm9sbFRvcCA9IG91dHB1dC5zY3JvbGxIZWlnaHQ7IC8vIFNjcm9sbCB0byB0aGUgYm90dG9tIG9mIHRoZSBvdXRwdXQgY29udGFpbmVyXG59O1xuXG4vLyBUaGUgZnVuY3Rpb24gZm9yIGV4ZWN1dGluZyBjb21tYW5kcyBmcm9tIHRoZSBjb25zb2xlIGlucHV0XG5jb25zdCBjb25zb2xlTG9nUGxhY2VtZW50Q29tbWFuZCA9IChzaGlwVHlwZSwgZ3JpZFBvc2l0aW9uLCBvcmllbnRhdGlvbikgPT4ge1xuICAvLyBTZXQgdGhlIG9yaWVudGF0aW9uIGZlZWRiYWNrXG4gIGNvbnN0IGRpckZlZWJhY2sgPSBvcmllbnRhdGlvbiA9PT0gXCJoXCIgPyBcImhvcml6b250YWxseVwiIDogXCJ2ZXJ0aWNhbGx5XCI7XG4gIC8vIFNldCB0aGUgY29uc29sZSBtZXNzYWdlXG4gIGNvbnN0IG1lc3NhZ2UgPSBgJHtzaGlwVHlwZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHNoaXBUeXBlLnNsaWNlKDEpfSBwbGFjZWQgYXQgJHtncmlkUG9zaXRpb259IGZhY2luZyAke2RpckZlZWJhY2t9YDtcblxuICBjb25zb2xlLmxvZyhgJHttZXNzYWdlfWApO1xuXG4gIHVwZGF0ZU91dHB1dChgPiAke21lc3NhZ2V9YCwgXCJ2YWxpZFwiKTtcblxuICAvLyBDbGVhciB0aGUgaW5wdXRcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLWlucHV0XCIpLnZhbHVlID0gXCJcIjtcbn07XG5cbi8vIFRoZSBmdW5jdGlvbiBmb3IgZXhlY3V0aW5nIGNvbW1hbmRzIGZyb20gdGhlIGNvbnNvbGUgaW5wdXRcbmNvbnN0IGNvbnNvbGVMb2dNb3ZlQ29tbWFuZCA9IChyZXN1bHRzT2JqZWN0KSA9PiB7XG4gIC8vIFNldCB0aGUgY29uc29sZSBtZXNzYWdlXG4gIGNvbnN0IG1lc3NhZ2UgPSBgVGhlICR7cmVzdWx0c09iamVjdC5wbGF5ZXJ9J3MgbW92ZSBvbiAke3Jlc3VsdHNPYmplY3QubW92ZX0gcmVzdWx0ZWQgaW4gYSAke3Jlc3VsdHNPYmplY3QuaGl0ID8gXCJISVRcIiA6IFwiTUlTU1wifSFgO1xuXG4gIGNvbnNvbGUubG9nKGAke21lc3NhZ2V9YCk7XG5cbiAgdXBkYXRlT3V0cHV0KGA+ICR7bWVzc2FnZX1gLCByZXN1bHRzT2JqZWN0LmhpdCA/IFwidmFsaWRcIiA6IFwibWlzc1wiKTtcblxuICAvLyBDbGVhciB0aGUgaW5wdXRcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLWlucHV0XCIpLnZhbHVlID0gXCJcIjtcbn07XG5cbmNvbnN0IGNvbnNvbGVMb2dFcnJvciA9IChlcnJvciwgc2hpcFR5cGUpID0+IHtcbiAgaWYgKHNoaXBUeXBlKSB7XG4gICAgLy8gSWYgc2hpcFR5cGUgaXMgcGFzc2VkIHRoZW4gcHJvY2VzcyBlcnJvciBhcyBwbGFjZW1lbnQgZXJyb3JcbiAgICBjb25zb2xlLmVycm9yKGBFcnJvciBwbGFjaW5nICR7c2hpcFR5cGV9OiBtZXNzYWdlID0gJHtlcnJvci5tZXNzYWdlfS5gKTtcblxuICAgIHVwZGF0ZU91dHB1dChgPiBFcnJvciBwbGFjaW5nICR7c2hpcFR5cGV9OiAke2Vycm9yLm1lc3NhZ2V9YCwgXCJlcnJvclwiKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBlbHNlIGlmIHNoaXBUeXBlIGlzIHVuZGVmaW5lZCwgcHJvY2VzcyBlcnJvciBhcyBtb3ZlIGVycm9yXG4gICAgY29uc29sZS5sb2coYEVycm9yIG1ha2luZyBtb3ZlOiBtZXNzYWdlID0gJHtlcnJvci5tZXNzYWdlfS5gKTtcblxuICAgIHVwZGF0ZU91dHB1dChgPiBFcnJvciBtYWtpbmcgbW92ZTogbWVzc2FnZSA9ICR7ZXJyb3IubWVzc2FnZX0uYCwgXCJlcnJvclwiKTtcbiAgfVxuXG4gIC8vIENsZWFyIHRoZSBpbnB1dFxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtaW5wdXRcIikudmFsdWUgPSBcIlwiO1xufTtcblxuLy8gRnVuY3Rpb24gaW5pdGlhbGlzZSB1aU1hbmFnZXJcbmNvbnN0IGluaXRVaU1hbmFnZXIgPSAodWlNYW5hZ2VyKSA9PiB7XG4gIC8vIEluaXRpYWxpc2UgY29uc29sZVxuICB1aU1hbmFnZXIuaW5pdENvbnNvbGVVSSgpO1xuXG4gIC8vIEluaXRpYWxpc2UgZ2FtZWJvYXJkIHdpdGggY2FsbGJhY2sgZm9yIGNlbGwgY2xpY2tzXG4gIHVpTWFuYWdlci5jcmVhdGVHYW1lYm9hcmQoXCJodW1hbi1nYlwiKTtcbiAgdWlNYW5hZ2VyLmNyZWF0ZUdhbWVib2FyZChcImNvbXAtZ2JcIik7XG59O1xuXG4vLyBGdW5jdGlvbiB0byBjYWxjdWxhdGUgY2VsbCBJRHMgYmFzZWQgb24gc3RhcnQgcG9zaXRpb24sIGxlbmd0aCwgYW5kIG9yaWVudGF0aW9uXG5mdW5jdGlvbiBjYWxjdWxhdGVTaGlwQ2VsbHMoc3RhcnRDZWxsLCBzaGlwTGVuZ3RoLCBvcmllbnRhdGlvbikge1xuICBjb25zdCBjZWxsSWRzID0gW107XG4gIGNvbnN0IHJvd0luZGV4ID0gc3RhcnRDZWxsLmNoYXJDb2RlQXQoMCkgLSBcIkFcIi5jaGFyQ29kZUF0KDApO1xuICBjb25zdCBjb2xJbmRleCA9IHBhcnNlSW50KHN0YXJ0Q2VsbC5zdWJzdHJpbmcoMSksIDEwKSAtIDE7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICBpZiAob3JpZW50YXRpb24gPT09IFwidlwiKSB7XG4gICAgICBpZiAoY29sSW5kZXggKyBpID49IGdyaWRbMF0ubGVuZ3RoKSBicmVhazsgLy8gQ2hlY2sgZ3JpZCBib3VuZHNcbiAgICAgIGNlbGxJZHMucHVzaChcbiAgICAgICAgYCR7U3RyaW5nLmZyb21DaGFyQ29kZShyb3dJbmRleCArIFwiQVwiLmNoYXJDb2RlQXQoMCkpfSR7Y29sSW5kZXggKyBpICsgMX1gLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHJvd0luZGV4ICsgaSA+PSBncmlkLmxlbmd0aCkgYnJlYWs7IC8vIENoZWNrIGdyaWQgYm91bmRzXG4gICAgICBjZWxsSWRzLnB1c2goXG4gICAgICAgIGAke1N0cmluZy5mcm9tQ2hhckNvZGUocm93SW5kZXggKyBpICsgXCJBXCIuY2hhckNvZGVBdCgwKSl9JHtjb2xJbmRleCArIDF9YCxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNlbGxJZHM7XG59XG5cbi8vIEZ1bmN0aW9uIHRvIGhpZ2hsaWdodCBjZWxsc1xuZnVuY3Rpb24gaGlnaGxpZ2h0Q2VsbHMoY2VsbElkcykge1xuICBjZWxsSWRzLmZvckVhY2goKGNlbGxJZCkgPT4ge1xuICAgIGNvbnN0IGNlbGxFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcG9zaXRpb249XCIke2NlbGxJZH1cIl1gKTtcbiAgICBpZiAoY2VsbEVsZW1lbnQpIHtcbiAgICAgIGNlbGxFbGVtZW50LmNsYXNzTGlzdC5hZGQoYGJnLSR7c2Vjb25kYXJ5SG92ZXJDbHJ9YCk7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gRnVuY3Rpb24gdG8gY2xlYXIgaGlnaGxpZ2h0IGZyb20gY2VsbHNcbmZ1bmN0aW9uIGNsZWFySGlnaGxpZ2h0KGNlbGxJZHMpIHtcbiAgY2VsbElkcy5mb3JFYWNoKChjZWxsSWQpID0+IHtcbiAgICBjb25zdCBjZWxsRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiJHtjZWxsSWR9XCJdYCk7XG4gICAgaWYgKGNlbGxFbGVtZW50KSB7XG4gICAgICBjZWxsRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGBiZy0ke3NlY29uZGFyeUhvdmVyQ2xyfWApO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIEZ1bmN0aW9uIHRvIHRvZ2dsZSBvcmllbnRhdGlvblxuZnVuY3Rpb24gdG9nZ2xlT3JpZW50YXRpb24oKSB7XG4gIGN1cnJlbnRPcmllbnRhdGlvbiA9IGN1cnJlbnRPcmllbnRhdGlvbiA9PT0gXCJoXCIgPyBcInZcIiA6IFwiaFwiO1xuICAvLyBVcGRhdGUgdGhlIHZpc3VhbCBwcm9tcHQgaGVyZSBpZiBuZWNlc3Nhcnlcbn1cblxuY29uc3QgaGFuZGxlUGxhY2VtZW50SG92ZXIgPSAoZSkgPT4ge1xuICBjb25zdCBjZWxsID0gZS50YXJnZXQ7XG4gIGlmIChcbiAgICBjZWxsLmNsYXNzTGlzdC5jb250YWlucyhcImdhbWVib2FyZC1jZWxsXCIpICYmXG4gICAgY2VsbC5kYXRhc2V0LnBsYXllciA9PT0gXCJodW1hblwiXG4gICkge1xuICAgIC8vIExvZ2ljIHRvIGhhbmRsZSBob3ZlciBlZmZlY3RcbiAgICBjb25zdCBjZWxsUG9zID0gY2VsbC5kYXRhc2V0LnBvc2l0aW9uO1xuICAgIGxhc3RIb3ZlcmVkQ2VsbCA9IGNlbGxQb3M7XG4gICAgY29uc3QgY2VsbHNUb0hpZ2hsaWdodCA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgIGNlbGxQb3MsXG4gICAgICBjdXJyZW50U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgY3VycmVudE9yaWVudGF0aW9uLFxuICAgICk7XG4gICAgaGlnaGxpZ2h0Q2VsbHMoY2VsbHNUb0hpZ2hsaWdodCk7XG4gIH1cbn07XG5cbmNvbnN0IGhhbmRsZU1vdXNlTGVhdmUgPSAoZSkgPT4ge1xuICBjb25zdCBjZWxsID0gZS50YXJnZXQ7XG4gIGlmIChjZWxsLmNsYXNzTGlzdC5jb250YWlucyhcImdhbWVib2FyZC1jZWxsXCIpKSB7XG4gICAgLy8gTG9naWMgZm9yIGhhbmRsaW5nIHdoZW4gdGhlIGN1cnNvciBsZWF2ZXMgYSBjZWxsXG4gICAgY29uc3QgY2VsbFBvcyA9IGNlbGwuZGF0YXNldC5wb3NpdGlvbjtcbiAgICBpZiAoY2VsbFBvcyA9PT0gbGFzdEhvdmVyZWRDZWxsKSB7XG4gICAgICBjb25zdCBjZWxsc1RvQ2xlYXIgPSBjYWxjdWxhdGVTaGlwQ2VsbHMoXG4gICAgICAgIGNlbGxQb3MsXG4gICAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICAgIGN1cnJlbnRPcmllbnRhdGlvbixcbiAgICAgICk7XG4gICAgICBjbGVhckhpZ2hsaWdodChjZWxsc1RvQ2xlYXIpO1xuICAgICAgbGFzdEhvdmVyZWRDZWxsID0gbnVsbDsgLy8gUmVzZXQgbGFzdEhvdmVyZWRDZWxsIHNpbmNlIHRoZSBtb3VzZSBoYXMgbGVmdFxuICAgIH1cbiAgICBsYXN0SG92ZXJlZENlbGwgPSBudWxsO1xuICB9XG59O1xuXG5jb25zdCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSA9IChlKSA9PiB7XG4gIGlmIChlLmtleSA9PT0gXCIgXCIgJiYgbGFzdEhvdmVyZWRDZWxsKSB7XG4gICAgLy8gRW5zdXJlIHNwYWNlYmFyIGlzIHByZXNzZWQgYW5kIHRoZXJlJ3MgYSBsYXN0IGhvdmVyZWQgY2VsbFxuICAgIGUucHJldmVudERlZmF1bHQoKTsgLy8gUHJldmVudCB0aGUgZGVmYXVsdCBzcGFjZWJhciBhY3Rpb25cblxuICAgIC8vIFRvZ2dsZSB0aGUgb3JpZW50YXRpb25cbiAgICB0b2dnbGVPcmllbnRhdGlvbigpO1xuXG4gICAgLy8gQ2xlYXIgcHJldmlvdXNseSBoaWdobGlnaHRlZCBjZWxsc1xuICAgIC8vIEFzc3VtaW5nIGNhbGN1bGF0ZVNoaXBDZWxscyBhbmQgY2xlYXJIaWdobGlnaHQgd29yayBjb3JyZWN0bHlcbiAgICBjb25zdCBvbGRDZWxsc1RvQ2xlYXIgPSBjYWxjdWxhdGVTaGlwQ2VsbHMoXG4gICAgICBsYXN0SG92ZXJlZENlbGwsXG4gICAgICBjdXJyZW50U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgY3VycmVudE9yaWVudGF0aW9uID09PSBcImhcIiA/IFwidlwiIDogXCJoXCIsXG4gICAgKTtcbiAgICBjbGVhckhpZ2hsaWdodChvbGRDZWxsc1RvQ2xlYXIpO1xuXG4gICAgLy8gSGlnaGxpZ2h0IG5ldyBjZWxscyBiYXNlZCBvbiB0aGUgbmV3IG9yaWVudGF0aW9uXG4gICAgY29uc3QgbmV3Q2VsbHNUb0hpZ2hsaWdodCA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgIGxhc3RIb3ZlcmVkQ2VsbCxcbiAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICBjdXJyZW50T3JpZW50YXRpb24sXG4gICAgKTtcbiAgICBoaWdobGlnaHRDZWxscyhuZXdDZWxsc1RvSGlnaGxpZ2h0KTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZW5hYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlcigpIHtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvckFsbCgnLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPVwiY29tcHV0ZXJcIl0nKVxuICAgIC5mb3JFYWNoKChjZWxsKSA9PiB7XG4gICAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUoXCJwb2ludGVyLWV2ZW50cy1ub25lXCIsIFwiY3Vyc29yLWRlZmF1bHRcIik7XG4gICAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUoYGhvdmVyOmJnLSR7cHJpbWFyeUhvdmVyQ2xyfWApO1xuICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKGBob3ZlcjpiZy0ke3ByaW1hcnlIb3ZlckNscn1gKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZGlzYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoY2VsbHNBcnJheSkge1xuICBjZWxsc0FycmF5LmZvckVhY2goKGNlbGwpID0+IHtcbiAgICBjZWxsLmNsYXNzTGlzdC5hZGQoXCJwb2ludGVyLWV2ZW50cy1ub25lXCIsIFwiY3Vyc29yLWRlZmF1bHRcIik7XG4gICAgY2VsbC5jbGFzc0xpc3QucmVtb3ZlKGBob3ZlcjpiZy0ke3ByaW1hcnlIb3ZlckNscn1gKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRpc2FibGVIdW1hbkdhbWVib2FyZEhvdmVyKCkge1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9XCJodW1hblwiXScpXG4gICAgLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChcInBvaW50ZXItZXZlbnRzLW5vbmVcIiwgXCJjdXJzb3ItZGVmYXVsdFwiKTtcbiAgICAgIGNlbGwuY2xhc3NMaXN0LnJlbW92ZShgaG92ZXI6YmctJHtwcmltYXJ5SG92ZXJDbHJ9YCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHN3aXRjaEdhbWVib2FyZEhvdmVyU3RhdGVzKCkge1xuICAvLyBEaXNhYmxlIGhvdmVyIG9uIHRoZSBodW1hbidzIGdhbWVib2FyZFxuICBkaXNhYmxlSHVtYW5HYW1lYm9hcmRIb3ZlcigpO1xuXG4gIC8vIEVuYWJsZSBob3ZlciBvbiB0aGUgY29tcHV0ZXIncyBnYW1lYm9hcmRcbiAgZW5hYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlcigpO1xufVxuXG4vLyBGdW5jdGlvbiB0byBzZXR1cCBnYW1lYm9hcmQgZm9yIHNoaXAgcGxhY2VtZW50XG5jb25zdCBzZXR1cEdhbWVib2FyZEZvclBsYWNlbWVudCA9ICgpID0+IHtcbiAgY29uc3QgY29tcEdhbWVib2FyZENlbGxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAnLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPVwiY29tcHV0ZXJcIl0nLFxuICApO1xuICBkaXNhYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3Zlcihjb21wR2FtZWJvYXJkQ2VsbHMpO1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9XCJodW1hblwiXScpXG4gICAgLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgaGFuZGxlUGxhY2VtZW50SG92ZXIpO1xuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCBoYW5kbGVNb3VzZUxlYXZlKTtcbiAgICB9KTtcbiAgLy8gR2V0IGdhbWVib2FyZCBhcmVhIGRpdiBlbGVtZW50XG4gIGNvbnN0IGdhbWVib2FyZEFyZWEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgIFwiLmdhbWVib2FyZC1hcmVhLCBbZGF0YS1wbGF5ZXI9J2h1bWFuJ11cIixcbiAgKTtcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyB0byBnYW1lYm9hcmQgYXJlYSB0byBhZGQgYW5kIHJlbW92ZSB0aGVcbiAgLy8gaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUgZXZlbnQgbGlzdGVuZXIgd2hlbiBlbnRlcmluZyBhbmQgZXhpdGluZyB0aGUgYXJlYVxuICBnYW1lYm9hcmRBcmVhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSk7XG4gIH0pO1xuICBnYW1lYm9hcmRBcmVhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSk7XG4gIH0pO1xufTtcblxuLy8gRnVuY3Rpb24gdG8gY2xlYW4gdXAgYWZ0ZXIgc2hpcCBwbGFjZW1lbnQgaXMgY29tcGxldGVcbmNvbnN0IGNsZWFudXBBZnRlclBsYWNlbWVudCA9ICgpID0+IHtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvckFsbCgnLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPVwiaHVtYW5cIl0nKVxuICAgIC5mb3JFYWNoKChjZWxsKSA9PiB7XG4gICAgICBjZWxsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIGhhbmRsZVBsYWNlbWVudEhvdmVyKTtcbiAgICAgIGNlbGwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgaGFuZGxlTW91c2VMZWF2ZSk7XG4gICAgfSk7XG4gIC8vIEdldCBnYW1lYm9hcmQgYXJlYSBkaXYgZWxlbWVudFxuICBjb25zdCBnYW1lYm9hcmRBcmVhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICBcIi5nYW1lYm9hcmQtYXJlYSwgW2RhdGEtcGxheWVyPSdodW1hbiddXCIsXG4gICk7XG4gIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMgdG8gZ2FtZWJvYXJkIGFyZWEgdG8gYWRkIGFuZCByZW1vdmUgdGhlXG4gIC8vIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlIGV2ZW50IGxpc3RlbmVyIHdoZW4gZW50ZXJpbmcgYW5kIGV4aXRpbmcgdGhlIGFyZWFcbiAgZ2FtZWJvYXJkQXJlYS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xuICB9KTtcbiAgZ2FtZWJvYXJkQXJlYS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xuICB9KTtcbiAgLy8gUmVtb3ZlIGV2ZW50IGxpc3RlbmVyIGZvciBrZXlkb3duIGV2ZW50c1xuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSk7XG59O1xuXG4vLyBGdW5jdGlvbiBmb3Igc3RhcnRpbmcgdGhlIGdhbWVcbmNvbnN0IHN0YXJ0R2FtZSA9IGFzeW5jICh1aU1hbmFnZXIsIGdhbWUpID0+IHtcbiAgLy8gU2V0IHVwIHRoZSBnYW1lIGJ5IGF1dG8gcGxhY2luZyBjb21wdXRlcidzIHNoaXBzIGFuZCBzZXR0aW5nIHRoZVxuICAvLyBjdXJyZW50IHBsYXllciB0byB0aGUgaHVtYW4gcGxheWVyXG4gIGF3YWl0IGdhbWUuc2V0VXAoKTtcblxuICAvLyBSZW5kZXIgdGhlIHNoaXAgZGlzcGxheSBmb3IgdGhlIGNvbXB1dGVyIHBsYXllclxuICBzaGlwc1RvUGxhY2UuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgIHVpTWFuYWdlci5yZW5kZXJTaGlwRGlzcChnYW1lLnBsYXllcnMuY29tcHV0ZXIsIHNoaXAuc2hpcFR5cGUpO1xuICB9KTtcblxuICAvLyBEaXNwbGF5IHByb21wdCBvYmplY3QgZm9yIHRha2luZyBhIHR1cm4gYW5kIHN0YXJ0aW5nIHRoZSBnYW1lXG4gIHVpTWFuYWdlci5kaXNwbGF5UHJvbXB0KHsgdHVyblByb21wdCwgZ2FtZXBsYXlHdWlkZSB9KTtcbn07XG5cbmNvbnN0IGhhbmRsZUh1bWFuTW92ZSA9IChlKSA9PiB7XG4gIC8vIEdldCB0aGUgcG9zaXRpb24gb24gdGhlIGJvYXJkIHRvIG1ha2UgYSBtb3ZlXG4gIGNvbnN0IHsgcG9zaXRpb24gfSA9IGUudGFyZ2V0LmRhdGE7XG59O1xuXG4vLyBTZXR1cCBnYW1lYm9hcmQgZm9yIGZvciBwbGF5ZXIgbW92ZVxuY29uc3Qgc2V0dXBHYW1lYm9hcmRGb3JQbGF5ZXJNb3ZlID0gKCkgPT4ge1xuICAvLyBFbmFibGUgdGhlIGhvdmVyIHN0YXRlIGZvciB0aGUgY29tcHV0ZXIgZ2FtZWJvYXJkXG4gIGVuYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoKTtcblxuICAvLyBTZXQgdXAgZXZlbnQgbGlzdGVuZXJzIG9uIHRoZSBjb21wdXRlciBnYW1lYm9hcmQgZm9yIHRoZSBwbGF5ZXJcbiAgLy8gbWFraW5nIG1vdmVzXG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImNvbXB1dGVyXCJdJylcbiAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgaGFuZGxlSHVtYW5Nb3ZlKTtcbiAgICB9KTtcbn07XG5cbmFzeW5jIGZ1bmN0aW9uIHBsYXllck1vdmUoKSB7XG4gIC8vIFdhaXQgZm9yIHBsYXllcidzIG1vdmUgKGNsaWNrIG9yIGNvbnNvbGUgaW5wdXQpXG4gIC8vIFVwZGF0ZSBVSSBiYXNlZCBvbiBtb3ZlXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvbXB1dGVyTW92ZShodW1hblBsYXllckdhbWVib2FyZCwgY29tcFBsYXllcikge1xuICBsZXQgY29tcE1vdmVSZXN1bHQ7XG4gIHRyeSB7XG4gICAgLy8gQ29tcHV0ZXIgbG9naWMgdG8gY2hvb3NlIGEgbW92ZVxuICAgIC8vIFVwZGF0ZSBVSSBiYXNlZCBvbiBtb3ZlXG4gICAgY29tcE1vdmVSZXN1bHQgPSBjb21wUGxheWVyLm1ha2VNb3ZlKGh1bWFuUGxheWVyR2FtZWJvYXJkKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlTG9nRXJyb3IoZXJyb3IpO1xuICB9XG4gIHJldHVybiBjb21wTW92ZVJlc3VsdDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY2hlY2tXaW5Db25kaXRpb24oKSB7XG4gIC8vIENoZWNrIGlmIGFsbCBzaGlwcyBhcmUgc3Vua1xuICAvLyBSZXR1cm4gdHJ1ZSBpZiBnYW1lIGlzIG92ZXIsIGZhbHNlIG90aGVyd2lzZVxufVxuXG5mdW5jdGlvbiBjb25jbHVkZUdhbWUoKSB7XG4gIC8vIERpc3BsYXkgd2lubmVyLCB1cGRhdGUgVUksIGV0Yy5cbn1cblxuY29uc3QgQWN0aW9uQ29udHJvbGxlciA9ICh1aU1hbmFnZXIsIGdhbWUpID0+IHtcbiAgY29uc3QgaHVtYW5QbGF5ZXIgPSBnYW1lLnBsYXllcnMuaHVtYW47XG4gIGNvbnN0IGh1bWFuUGxheWVyR2FtZWJvYXJkID0gaHVtYW5QbGF5ZXIuZ2FtZWJvYXJkO1xuICBjb25zdCBjb21wUGxheWVyID0gZ2FtZS5wbGF5ZXJzLmNvbXB1dGVyO1xuICBjb25zdCBjb21wUGxheWVyR2FtZWJvYXJkID0gY29tcFBsYXllci5nYW1lYm9hcmQ7XG5cbiAgLy8gRnVuY3Rpb24gdG8gc2V0dXAgZXZlbnQgbGlzdGVuZXJzIGZvciBjb25zb2xlIGFuZCBnYW1lYm9hcmQgY2xpY2tzXG4gIGZ1bmN0aW9uIHNldHVwRXZlbnRMaXN0ZW5lcnMoaGFuZGxlckZ1bmN0aW9uLCBwbGF5ZXJUeXBlKSB7XG4gICAgLy8gRGVmaW5lIGNsZWFudXAgZnVuY3Rpb25zIGluc2lkZSB0byBlbnN1cmUgdGhleSBhcmUgYWNjZXNzaWJsZSBmb3IgcmVtb3ZhbFxuICAgIGNvbnN0IGNsZWFudXBGdW5jdGlvbnMgPSBbXTtcblxuICAgIGNvbnN0IGNvbnNvbGVTdWJtaXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtc3VibWl0XCIpO1xuICAgIGNvbnN0IGNvbnNvbGVJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1pbnB1dFwiKTtcblxuICAgIGNvbnN0IHN1Ym1pdEhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICBjb25zdCBpbnB1dCA9IGNvbnNvbGVJbnB1dC52YWx1ZTtcbiAgICAgIGhhbmRsZXJGdW5jdGlvbihpbnB1dCk7XG4gICAgICBjb25zb2xlSW5wdXQudmFsdWUgPSBcIlwiOyAvLyBDbGVhciBpbnB1dCBhZnRlciBzdWJtaXNzaW9uXG4gICAgfTtcblxuICAgIGNvbnN0IGtleXByZXNzSGFuZGxlciA9IChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09IFwiRW50ZXJcIikge1xuICAgICAgICBzdWJtaXRIYW5kbGVyKCk7IC8vIFJldXNlIHN1Ym1pdCBsb2dpYyBmb3IgRW50ZXIga2V5IHByZXNzXG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnNvbGVTdWJtaXRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHN1Ym1pdEhhbmRsZXIpO1xuICAgIGNvbnNvbGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwga2V5cHJlc3NIYW5kbGVyKTtcblxuICAgIC8vIEFkZCBjbGVhbnVwIGZ1bmN0aW9uIGZvciBjb25zb2xlIGxpc3RlbmVyc1xuICAgIGNsZWFudXBGdW5jdGlvbnMucHVzaCgoKSA9PiB7XG4gICAgICBjb25zb2xlU3VibWl0QnV0dG9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzdWJtaXRIYW5kbGVyKTtcbiAgICAgIGNvbnNvbGVJbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwga2V5cHJlc3NIYW5kbGVyKTtcbiAgICB9KTtcblxuICAgIC8vIFNldHVwIGZvciBnYW1lYm9hcmQgY2VsbCBjbGlja3NcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoYC5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj0ke3BsYXllclR5cGV9XWApXG4gICAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgICBjb25zdCBjbGlja0hhbmRsZXIgPSAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgeyBwb3NpdGlvbiB9ID0gY2VsbC5kYXRhc2V0O1xuICAgICAgICAgIGxldCBpbnB1dDtcbiAgICAgICAgICBpZiAocGxheWVyVHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICAgICAgICBpbnB1dCA9IGAke3Bvc2l0aW9ufSAke2N1cnJlbnRPcmllbnRhdGlvbn1gO1xuICAgICAgICAgIH0gZWxzZSBpZiAocGxheWVyVHlwZSA9PT0gXCJjb21wdXRlclwiKSB7XG4gICAgICAgICAgICBpbnB1dCA9IHBvc2l0aW9uO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIFwiRXJyb3IhIEludmFsaWQgcGxheWVyIHR5cGUgcGFzc2VkIHRvIGNsaWNrSGFuZGxlciFcIixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnNvbGUubG9nKGBjbGlja0hhbmRsZXIgaW5wdXQgPSAke2lucHV0fWApO1xuICAgICAgICAgIGhhbmRsZXJGdW5jdGlvbihpbnB1dCk7XG4gICAgICAgIH07XG4gICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsaWNrSGFuZGxlcik7XG5cbiAgICAgICAgLy8gQWRkIGNsZWFudXAgZnVuY3Rpb24gZm9yIGVhY2ggY2VsbCBsaXN0ZW5lclxuICAgICAgICBjbGVhbnVwRnVuY3Rpb25zLnB1c2goKCkgPT5cbiAgICAgICAgICBjZWxsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbGlja0hhbmRsZXIpLFxuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICAvLyBSZXR1cm4gYSBzaW5nbGUgY2xlYW51cCBmdW5jdGlvbiB0byByZW1vdmUgYWxsIGxpc3RlbmVyc1xuICAgIHJldHVybiAoKSA9PiBjbGVhbnVwRnVuY3Rpb25zLmZvckVhY2goKGNsZWFudXApID0+IGNsZWFudXAoKSk7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBwcm9tcHRBbmRQbGFjZVNoaXAoc2hpcFR5cGUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgLy8gU2V0IHRoZSBjdXJyZW50IHNoaXBcbiAgICAgIGN1cnJlbnRTaGlwID0gc2hpcHNUb1BsYWNlLmZpbmQoKHNoaXApID0+IHNoaXAuc2hpcFR5cGUgPT09IHNoaXBUeXBlKTtcblxuICAgICAgLy8gRGlzcGxheSBwcm9tcHQgZm9yIHRoZSBzcGVjaWZpYyBzaGlwIHR5cGUgYXMgd2VsbCBhcyB0aGUgZ3VpZGUgdG8gcGxhY2luZyBzaGlwc1xuICAgICAgY29uc3QgcGxhY2VTaGlwUHJvbXB0ID0ge1xuICAgICAgICBwcm9tcHQ6IGBQbGFjZSB5b3VyICR7c2hpcFR5cGV9LmAsXG4gICAgICAgIHByb21wdFR5cGU6IFwiaW5zdHJ1Y3Rpb25cIixcbiAgICAgIH07XG4gICAgICB1aU1hbmFnZXIuZGlzcGxheVByb21wdCh7IHBsYWNlU2hpcFByb21wdCwgcGxhY2VTaGlwR3VpZGUgfSk7XG5cbiAgICAgIGNvbnN0IGhhbmRsZVZhbGlkSW5wdXQgPSBhc3luYyAoaW5wdXQpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB7IGdyaWRQb3NpdGlvbiwgb3JpZW50YXRpb24gfSA9IHByb2Nlc3NDb21tYW5kKGlucHV0LCBmYWxzZSk7XG4gICAgICAgICAgYXdhaXQgaHVtYW5QbGF5ZXJHYW1lYm9hcmQucGxhY2VTaGlwKFxuICAgICAgICAgICAgc2hpcFR5cGUsXG4gICAgICAgICAgICBncmlkUG9zaXRpb24sXG4gICAgICAgICAgICBvcmllbnRhdGlvbixcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnNvbGVMb2dQbGFjZW1lbnRDb21tYW5kKHNoaXBUeXBlLCBncmlkUG9zaXRpb24sIG9yaWVudGF0aW9uKTtcbiAgICAgICAgICAvLyBSZW1vdmUgY2VsbCBoaWdobGlnaHRzXG4gICAgICAgICAgY29uc3QgY2VsbHNUb0NsZWFyID0gY2FsY3VsYXRlU2hpcENlbGxzKFxuICAgICAgICAgICAgZ3JpZFBvc2l0aW9uLFxuICAgICAgICAgICAgY3VycmVudFNoaXAuc2hpcExlbmd0aCxcbiAgICAgICAgICAgIG9yaWVudGF0aW9uLFxuICAgICAgICAgICk7XG4gICAgICAgICAgY2xlYXJIaWdobGlnaHQoY2VsbHNUb0NsZWFyKTtcblxuICAgICAgICAgIC8vIERpc3BsYXkgdGhlIHNoaXAgb24gdGhlIGdhbWUgYm9hcmQgYW5kIHNoaXAgc3RhdHVzIGRpc3BsYXlcbiAgICAgICAgICB1aU1hbmFnZXIucmVuZGVyU2hpcEJvYXJkKGh1bWFuUGxheWVyLCBzaGlwVHlwZSk7XG4gICAgICAgICAgdWlNYW5hZ2VyLnJlbmRlclNoaXBEaXNwKGh1bWFuUGxheWVyLCBzaGlwVHlwZSk7XG5cbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlLWJlZm9yZS1kZWZpbmVcbiAgICAgICAgICByZXNvbHZlU2hpcFBsYWNlbWVudCgpOyAvLyBTaGlwIHBsYWNlZCBzdWNjZXNzZnVsbHksIHJlc29sdmUgdGhlIHByb21pc2VcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlTG9nRXJyb3IoZXJyb3IsIHNoaXBUeXBlKTtcbiAgICAgICAgICAvLyBEbyBub3QgcmVqZWN0IHRvIGFsbG93IGZvciByZXRyeSwganVzdCBsb2cgdGhlIGVycm9yXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIFNldHVwIGV2ZW50IGxpc3RlbmVycyBhbmQgZW5zdXJlIHdlIGNhbiBjbGVhbiB0aGVtIHVwIGFmdGVyIHBsYWNlbWVudFxuICAgICAgY29uc3QgY2xlYW51cCA9IHNldHVwRXZlbnRMaXN0ZW5lcnMoaGFuZGxlVmFsaWRJbnB1dCwgXCJodW1hblwiKTtcblxuICAgICAgLy8gQXR0YWNoIGNsZWFudXAgdG8gcmVzb2x2ZSB0byBlbnN1cmUgaXQncyBjYWxsZWQgd2hlbiB0aGUgcHJvbWlzZSByZXNvbHZlc1xuICAgICAgY29uc3QgcmVzb2x2ZVNoaXBQbGFjZW1lbnQgPSAoKSA9PiB7XG4gICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFNlcXVlbnRpYWxseSBwcm9tcHQgZm9yIGFuZCBwbGFjZSBlYWNoIHNoaXBcbiAgYXN5bmMgZnVuY3Rpb24gc2V0dXBTaGlwc1NlcXVlbnRpYWxseSgpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoaXBzVG9QbGFjZS5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWF3YWl0LWluLWxvb3BcbiAgICAgIGF3YWl0IHByb21wdEFuZFBsYWNlU2hpcChzaGlwc1RvUGxhY2VbaV0uc2hpcFR5cGUpOyAvLyBXYWl0IGZvciBlYWNoIHNoaXAgdG8gYmUgcGxhY2VkIGJlZm9yZSBjb250aW51aW5nXG4gICAgfVxuICB9XG5cbiAgLy8gRnVuY3Rpb24gZm9yIGhhbmRsaW5nIHRoZSBnYW1lIHNldHVwIGFuZCBzaGlwIHBsYWNlbWVudFxuICBjb25zdCBoYW5kbGVTZXR1cCA9IGFzeW5jICgpID0+IHtcbiAgICAvLyBJbml0IHRoZSBVSVxuICAgIGluaXRVaU1hbmFnZXIodWlNYW5hZ2VyKTtcbiAgICBzZXR1cEdhbWVib2FyZEZvclBsYWNlbWVudCgpO1xuICAgIGF3YWl0IHNldHVwU2hpcHNTZXF1ZW50aWFsbHkoKTtcbiAgICAvLyBQcm9jZWVkIHdpdGggdGhlIHJlc3Qgb2YgdGhlIGdhbWUgc2V0dXAgYWZ0ZXIgYWxsIHNoaXBzIGFyZSBwbGFjZWRcbiAgICBjbGVhbnVwQWZ0ZXJQbGFjZW1lbnQoKTtcblxuICAgIC8vIFN0YXJ0IHRoZSBnYW1lXG4gICAgYXdhaXQgc3RhcnRHYW1lKHVpTWFuYWdlciwgZ2FtZSk7XG5cbiAgICBjb25zdCBvdXRwdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtb3V0cHV0XCIpO1xuICAgIHVwZGF0ZU91dHB1dChcIj4gQWxsIHNoaXBzIHBsYWNlZCwgZ2FtZSBzZXR1cCBjb21wbGV0ZSFcIik7XG4gICAgY29uc29sZS5sb2coXCJBbGwgc2hpcHMgcGxhY2VkLCBnYW1lIHNldHVwIGNvbXBsZXRlIVwiKTtcbiAgICBzd2l0Y2hHYW1lYm9hcmRIb3ZlclN0YXRlcygpO1xuICB9O1xuXG4gIGNvbnN0IHVwZGF0ZUNvbXB1dGVyRGlzcGxheXMgPSAoaHVtYW5Nb3ZlUmVzdWx0KSA9PiB7XG4gICAgLy8gU2V0IHRoZSBwbGF5ZXIgc2VsZWN0b3Igb2YgdGhlIG9wcG9uZW50IGRlcGVuZGluZyBvbiB0aGUgcGxheWVyXG4gICAgLy8gd2hvIG1hZGUgdGhlIG1vdmVcbiAgICBjb25zdCBwbGF5ZXJTZWxlY3RvciA9XG4gICAgICBodW1hbk1vdmVSZXN1bHQucGxheWVyID09PSBcImh1bWFuXCIgPyBcImNvbXB1dGVyXCIgOiBcImh1bWFuXCI7XG4gICAgY29uc29sZS5sb2coXCJ1cGRhdGVDb21wdXRlckRpc3BsYXlzIGZ1bmMgLS0+XCIpO1xuICAgIGNvbnNvbGUuZGlyKGh1bWFuTW92ZVJlc3VsdCk7XG4gICAgLy8gR2V0IHRoZSBET00gZWxlbWVudCBmb3IgdGhlIGNlbGxcbiAgICBjb25zdCBjZWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgIGAuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9JHtwbGF5ZXJTZWxlY3Rvcn1dW2RhdGEtcG9zaXRpb249JHtodW1hbk1vdmVSZXN1bHQubW92ZX1dYCxcbiAgICApO1xuICAgIGNvbnNvbGUubG9nKGNlbGwpO1xuXG4gICAgLy8gRGlzYWJsZSB0aGUgY2VsbCBmcm9tIGZ1dHVyZSBjbGlja3NcbiAgICBkaXNhYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlcihbY2VsbF0pO1xuXG4gICAgLy8gSGFuZGxlIG1pc3MgYW5kIGhpdFxuICAgIGlmICghaHVtYW5Nb3ZlUmVzdWx0LmhpdCkge1xuICAgICAgLy8gVXBkYXRlIHRoZSBjZWxscyBzdHlsaW5nIHRvIHJlZmxlY3QgbWlzc1xuICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKGBiZy0ke21pc3NDbHJ9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFVwZGF0ZSB0aGUgY2VsbHMgc3R5bGluZyB0byByZWZsZWN0IGhpdFxuICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKGBiZy0ke2hpdENscn1gKTtcbiAgICB9XG4gIH07XG5cbiAgYXN5bmMgZnVuY3Rpb24gcHJvbXB0UGxheWVyTW92ZShjb21wTW92ZVJlc3VsdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgaHVtYW5Nb3ZlUmVzdWx0O1xuICAgICAgLy8gVXBkYXRlIHRoZSBwbGF5ZXIgd2l0aCB0aGUgcmVzdWx0IG9mIHRoZSBjb21wdXRlcidzIGxhc3QgbW9yZVxuICAgICAgLy8gKGlmIHRoZXJlIGlzIG9uZSlcbiAgICAgIGlmIChjb21wTW92ZVJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIExvZyB0aGUgcmVzdWx0IG9mIHRoZSBjb21wdXRlcidzIG1vdmUgdG8gdGhlIGNvbnNvbGVcbiAgICAgICAgY29uc29sZUxvZ01vdmVDb21tYW5kKGNvbXBNb3ZlUmVzdWx0KTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coYE1ha2UgYSBtb3ZlIWApO1xuXG4gICAgICBjb25zdCBoYW5kbGVWYWxpZE1vdmUgPSBhc3luYyAobW92ZSkgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhgaGFuZGxlVmFsaWRJbnB1dDogbW92ZSA9ICR7bW92ZX1gKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB7IGdyaWRQb3NpdGlvbiB9ID0gcHJvY2Vzc0NvbW1hbmQobW92ZSwgdHJ1ZSk7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coYGhhbmRsZVZhbGlkSW5wdXQ6IGdyaWRQb3NpdGlvbiA9ICR7Z3JpZFBvc2l0aW9ufWApO1xuICAgICAgICAgIGh1bWFuTW92ZVJlc3VsdCA9IGF3YWl0IGh1bWFuUGxheWVyLm1ha2VNb3ZlKFxuICAgICAgICAgICAgY29tcFBsYXllckdhbWVib2FyZCxcbiAgICAgICAgICAgIGdyaWRQb3NpdGlvbixcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSBjb21wdXRlciBwbGF5ZXIncyBzaGlwcyBkaXNwbGF5IGFuZCBnYW1lYm9hcmRcbiAgICAgICAgICAvLyBkZXBlbmRpbmcgb24gb3V0Y29tZSBvZiBtb3ZlXG4gICAgICAgICAgdXBkYXRlQ29tcHV0ZXJEaXNwbGF5cyhodW1hbk1vdmVSZXN1bHQpO1xuXG4gICAgICAgICAgLy8gQ29tbXVuaWNhdGUgdGhlIHJlc3VsdCBvZiB0aGUgbW92ZSB0byB0aGUgdXNlclxuICAgICAgICAgIGNvbnNvbGVMb2dNb3ZlQ29tbWFuZChodW1hbk1vdmVSZXN1bHQpO1xuXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZS1iZWZvcmUtZGVmaW5lXG4gICAgICAgICAgcmVzb2x2ZU1vdmUoKTsgLy8gTW92ZSBleGVjdXRlZCBzdWNjZXNzZnVsbHksIHJlc29sdmUgdGhlIHByb21pc2VcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlTG9nRXJyb3IoZXJyb3IpO1xuICAgICAgICAgIC8vIERvIG5vdCByZWplY3QgdG8gYWxsb3cgZm9yIHJldHJ5LCBqdXN0IGxvZyB0aGUgZXJyb3JcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gU2V0dXAgZXZlbnQgbGlzdGVuZXJzIGFuZCBlbnN1cmUgd2UgY2FuIGNsZWFuIHRoZW0gdXAgYWZ0ZXIgcGxhY2VtZW50XG4gICAgICBjb25zdCBjbGVhbnVwID0gc2V0dXBFdmVudExpc3RlbmVycyhoYW5kbGVWYWxpZE1vdmUsIFwiY29tcHV0ZXJcIik7XG5cbiAgICAgIC8vIEF0dGFjaCBjbGVhbnVwIHRvIHJlc29sdmUgdG8gZW5zdXJlIGl0J3MgY2FsbGVkIHdoZW4gdGhlIHByb21pc2UgcmVzb2x2ZXNcbiAgICAgIGNvbnN0IHJlc29sdmVNb3ZlID0gKCkgPT4ge1xuICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgIHJlc29sdmUoaHVtYW5Nb3ZlUmVzdWx0KTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvLyBGdW5jdGlvbiBmb3IgaGFuZGxpbmcgdGhlIHBsYXlpbmcgb2YgdGhlIGdhbWVcbiAgY29uc3QgcGxheUdhbWUgPSBhc3luYyAoKSA9PiB7XG4gICAgbGV0IGdhbWVPdmVyID0gZmFsc2U7XG4gICAgbGV0IGxhc3RDb21wTW92ZVJlc3VsdDtcbiAgICBsZXQgbGFzdEh1bWFuTW92ZVJlc3VsdDtcblxuICAgIHdoaWxlICghZ2FtZU92ZXIpIHtcbiAgICAgIGNvbnNvbGUuZGlyKGdhbWUuY3VycmVudFBsYXllcik7XG4gICAgICAvLyBQbGF5ZXIgbWFrZXMgYSBtb3ZlXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgbGFzdEh1bWFuTW92ZVJlc3VsdCA9IGF3YWl0IHByb21wdFBsYXllck1vdmUobGFzdENvbXBNb3ZlUmVzdWx0KTtcbiAgICAgIGNvbnNvbGUubG9nKFwicHJvbXB0UGxheWVyTW92ZS50aGVuKCkgLT5cIik7XG4gICAgICBjb25zb2xlLmRpcihsYXN0SHVtYW5Nb3ZlUmVzdWx0KTtcbiAgICAgIC8vIENoZWNrIGZvciB3aW4gY29uZGl0aW9uXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgZ2FtZU92ZXIgPSBhd2FpdCBjaGVja1dpbkNvbmRpdGlvbigpO1xuICAgICAgaWYgKGdhbWVPdmVyKSBicmVhaztcblxuICAgICAgLy8gQ29tcHV0ZXIgbWFrZXMgYSBtb3ZlXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgbGFzdENvbXBNb3ZlUmVzdWx0ID0gYXdhaXQgY29tcHV0ZXJNb3ZlKGh1bWFuUGxheWVyR2FtZWJvYXJkLCBjb21wUGxheWVyKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiQ29tcHV0ZXIncyBtb3ZlIC0+XCIpO1xuICAgICAgY29uc29sZS5kaXIobGFzdENvbXBNb3ZlUmVzdWx0KTtcbiAgICAgIC8vIENoZWNrIGZvciB3aW4gY29uZGl0aW9uXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgZ2FtZU92ZXIgPSBhd2FpdCBjaGVja1dpbkNvbmRpdGlvbigpO1xuICAgIH1cblxuICAgIC8vIEdhbWUgb3ZlciBsb2dpY1xuICAgIGNvbmNsdWRlR2FtZSgpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgaGFuZGxlU2V0dXAsXG4gICAgcGxheUdhbWUsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBBY3Rpb25Db250cm9sbGVyO1xuIiwiLyogZXNsaW50LWRpc2FibGUgbWF4LWNsYXNzZXMtcGVyLWZpbGUgKi9cblxuY2xhc3MgT3ZlcmxhcHBpbmdTaGlwc0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJTaGlwcyBhcmUgb3ZlcmxhcHBpbmcuXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIk92ZXJsYXBwaW5nU2hpcHNFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIFNoaXBBbGxvY2F0aW9uUmVhY2hlZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihzaGlwVHlwZSkge1xuICAgIHN1cGVyKGBTaGlwIGFsbG9jYXRpb24gbGltaXQgcmVhY2hlZC4gU2hpcCB0eXBlID0gJHtzaGlwVHlwZX0uYCk7XG4gICAgdGhpcy5uYW1lID0gXCJTaGlwQWxsb2NhdGlvblJlYWNoZWRFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIFNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiU2hpcCB0eXBlIGFsbG9jYXRpb24gbGltaXQgcmVhY2hlZC5cIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiU2hpcFR5cGVBbGxvY2F0aW9uUmVhY2hlZEVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgSW52YWxpZFNoaXBMZW5ndGhFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBzaGlwIGxlbmd0aC5cIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiSW52YWxpZFNoaXBMZW5ndGhFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRTaGlwVHlwZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJJbnZhbGlkIHNoaXAgdHlwZS5cIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiSW52YWxpZFNoaXBUeXBlRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBJbnZhbGlkUGxheWVyVHlwZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlID0gXCJJbnZhbGlkIHBsYXllciB0eXBlLiBWYWxpZCBwbGF5ZXIgdHlwZXM6ICdodW1hbicgJiAnY29tcHV0ZXInXCIsXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiSW52YWxpZFNoaXBUeXBlRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBzaGlwIHBsYWNlbWVudC4gQm91bmRhcnkgZXJyb3IhXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIlNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgUmVwZWF0QXR0YWNrZWRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBhdHRhY2sgZW50cnkuIFBvc2l0aW9uIGFscmVhZHkgYXR0YWNrZWQhXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIlJlcGVhdEF0dGFja0Vycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgSW52YWxpZE1vdmVFbnRyeUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJJbnZhbGlkIG1vdmUgZW50cnkhXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRNb3ZlRW50cnlFcnJvclwiO1xuICB9XG59XG5cbmV4cG9ydCB7XG4gIE92ZXJsYXBwaW5nU2hpcHNFcnJvcixcbiAgU2hpcEFsbG9jYXRpb25SZWFjaGVkRXJyb3IsXG4gIFNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvcixcbiAgSW52YWxpZFNoaXBMZW5ndGhFcnJvcixcbiAgSW52YWxpZFNoaXBUeXBlRXJyb3IsXG4gIEludmFsaWRQbGF5ZXJUeXBlRXJyb3IsXG4gIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yLFxuICBSZXBlYXRBdHRhY2tlZEVycm9yLFxuICBJbnZhbGlkTW92ZUVudHJ5RXJyb3IsXG59O1xuIiwiaW1wb3J0IFBsYXllciBmcm9tIFwiLi9wbGF5ZXJcIjtcbmltcG9ydCBHYW1lYm9hcmQgZnJvbSBcIi4vZ2FtZWJvYXJkXCI7XG5pbXBvcnQgU2hpcCBmcm9tIFwiLi9zaGlwXCI7XG5pbXBvcnQgeyBJbnZhbGlkUGxheWVyVHlwZUVycm9yIH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5cbmNvbnN0IEdhbWUgPSAoKSA9PiB7XG4gIC8vIEluaXRpYWxpc2UsIGNyZWF0ZSBnYW1lYm9hcmRzIGZvciBib3RoIHBsYXllcnMgYW5kIGNyZWF0ZSBwbGF5ZXJzIG9mIHR5cGVzIGh1bWFuIGFuZCBjb21wdXRlclxuICBjb25zdCBodW1hbkdhbWVib2FyZCA9IEdhbWVib2FyZChTaGlwKTtcbiAgY29uc3QgY29tcHV0ZXJHYW1lYm9hcmQgPSBHYW1lYm9hcmQoU2hpcCk7XG4gIGNvbnN0IGh1bWFuUGxheWVyID0gUGxheWVyKGh1bWFuR2FtZWJvYXJkLCBcImh1bWFuXCIpO1xuICBjb25zdCBjb21wdXRlclBsYXllciA9IFBsYXllcihjb21wdXRlckdhbWVib2FyZCwgXCJjb21wdXRlclwiKTtcbiAgbGV0IGN1cnJlbnRQbGF5ZXI7XG4gIGxldCBnYW1lT3ZlclN0YXRlID0gZmFsc2U7XG5cbiAgLy8gU3RvcmUgcGxheWVycyBpbiBhIHBsYXllciBvYmplY3RcbiAgY29uc3QgcGxheWVycyA9IHsgaHVtYW46IGh1bWFuUGxheWVyLCBjb21wdXRlcjogY29tcHV0ZXJQbGF5ZXIgfTtcblxuICAvLyBTZXQgdXAgcGhhc2VcbiAgY29uc3Qgc2V0VXAgPSAoKSA9PiB7XG4gICAgLy8gQXV0b21hdGljIHBsYWNlbWVudCBmb3IgY29tcHV0ZXJcbiAgICBjb21wdXRlclBsYXllci5wbGFjZVNoaXBzKCk7XG5cbiAgICAvLyBTZXQgdGhlIGN1cnJlbnQgcGxheWVyIHRvIGh1bWFuIHBsYXllclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBodW1hblBsYXllcjtcbiAgfTtcblxuICAvLyBHYW1lIGVuZGluZyBmdW5jdGlvblxuICBjb25zdCBlbmRHYW1lID0gKCkgPT4ge1xuICAgIGdhbWVPdmVyU3RhdGUgPSB0cnVlO1xuICB9O1xuXG4gIC8vIFRha2UgdHVybiBtZXRob2RcbiAgY29uc3QgdGFrZVR1cm4gPSAobW92ZSkgPT4ge1xuICAgIGxldCBmZWVkYmFjaztcblxuICAgIC8vIERldGVybWluZSB0aGUgb3Bwb25lbnQgYmFzZWQgb24gdGhlIGN1cnJlbnQgcGxheWVyXG4gICAgY29uc3Qgb3Bwb25lbnQgPVxuICAgICAgY3VycmVudFBsYXllciA9PT0gaHVtYW5QbGF5ZXIgPyBjb21wdXRlclBsYXllciA6IGh1bWFuUGxheWVyO1xuXG4gICAgLy8gQ2FsbCB0aGUgbWFrZU1vdmUgbWV0aG9kIG9uIHRoZSBjdXJyZW50IHBsYXllciB3aXRoIHRoZSBvcHBvbmVudCdzIGdhbWVib2FyZCBhbmQgc3RvcmUgYXMgbW92ZSBmZWVkYmFja1xuICAgIGNvbnN0IHJlc3VsdCA9IGN1cnJlbnRQbGF5ZXIubWFrZU1vdmUob3Bwb25lbnQuZ2FtZWJvYXJkLCBtb3ZlKTtcblxuICAgIC8vIElmIHJlc3VsdCBpcyBhIGhpdCwgY2hlY2sgd2hldGhlciB0aGUgc2hpcCBpcyBzdW5rXG4gICAgaWYgKHJlc3VsdC5oaXQpIHtcbiAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIHNoaXAgaXMgc3VuayBhbmQgYWRkIHJlc3VsdCBhcyB2YWx1ZSB0byBmZWVkYmFjayBvYmplY3Qgd2l0aCBrZXkgXCJpc1NoaXBTdW5rXCJcbiAgICAgIGlmIChvcHBvbmVudC5nYW1lYm9hcmQuaXNTaGlwU3VuayhyZXN1bHQuc2hpcFR5cGUpKSB7XG4gICAgICAgIGZlZWRiYWNrID0ge1xuICAgICAgICAgIC4uLnJlc3VsdCxcbiAgICAgICAgICBpc1NoaXBTdW5rOiB0cnVlLFxuICAgICAgICAgIGdhbWVXb246IG9wcG9uZW50LmdhbWVib2FyZC5jaGVja0FsbFNoaXBzU3VuaygpLFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmVlZGJhY2sgPSB7IC4uLnJlc3VsdCwgaXNTaGlwU3VuazogZmFsc2UgfTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFyZXN1bHQuaGl0KSB7XG4gICAgICAvLyBTZXQgZmVlZGJhY2sgdG8ganVzdCB0aGUgcmVzdWx0XG4gICAgICBmZWVkYmFjayA9IHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBJZiBnYW1lIGlzIHdvbiwgZW5kIGdhbWVcbiAgICBpZiAoZmVlZGJhY2suZ2FtZVdvbikge1xuICAgICAgZW5kR2FtZSgpO1xuICAgIH1cblxuICAgIC8vIFN3aXRjaCB0aGUgY3VycmVudCBwbGF5ZXJcbiAgICBjdXJyZW50UGxheWVyID0gb3Bwb25lbnQ7XG5cbiAgICAvLyBSZXR1cm4gdGhlIGZlZWRiYWNrIGZvciB0aGUgbW92ZVxuICAgIHJldHVybiBmZWVkYmFjaztcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldCBjdXJyZW50UGxheWVyKCkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRQbGF5ZXI7XG4gICAgfSxcbiAgICBnZXQgZ2FtZU92ZXJTdGF0ZSgpIHtcbiAgICAgIHJldHVybiBnYW1lT3ZlclN0YXRlO1xuICAgIH0sXG4gICAgcGxheWVycyxcbiAgICBzZXRVcCxcbiAgICB0YWtlVHVybixcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWU7XG4iLCJpbXBvcnQge1xuICBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IsXG4gIE92ZXJsYXBwaW5nU2hpcHNFcnJvcixcbiAgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IsXG4gIFJlcGVhdEF0dGFja2VkRXJyb3IsXG59IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBncmlkID0gW1xuICBbXCJBMVwiLCBcIkEyXCIsIFwiQTNcIiwgXCJBNFwiLCBcIkE1XCIsIFwiQTZcIiwgXCJBN1wiLCBcIkE4XCIsIFwiQTlcIiwgXCJBMTBcIl0sXG4gIFtcIkIxXCIsIFwiQjJcIiwgXCJCM1wiLCBcIkI0XCIsIFwiQjVcIiwgXCJCNlwiLCBcIkI3XCIsIFwiQjhcIiwgXCJCOVwiLCBcIkIxMFwiXSxcbiAgW1wiQzFcIiwgXCJDMlwiLCBcIkMzXCIsIFwiQzRcIiwgXCJDNVwiLCBcIkM2XCIsIFwiQzdcIiwgXCJDOFwiLCBcIkM5XCIsIFwiQzEwXCJdLFxuICBbXCJEMVwiLCBcIkQyXCIsIFwiRDNcIiwgXCJENFwiLCBcIkQ1XCIsIFwiRDZcIiwgXCJEN1wiLCBcIkQ4XCIsIFwiRDlcIiwgXCJEMTBcIl0sXG4gIFtcIkUxXCIsIFwiRTJcIiwgXCJFM1wiLCBcIkU0XCIsIFwiRTVcIiwgXCJFNlwiLCBcIkU3XCIsIFwiRThcIiwgXCJFOVwiLCBcIkUxMFwiXSxcbiAgW1wiRjFcIiwgXCJGMlwiLCBcIkYzXCIsIFwiRjRcIiwgXCJGNVwiLCBcIkY2XCIsIFwiRjdcIiwgXCJGOFwiLCBcIkY5XCIsIFwiRjEwXCJdLFxuICBbXCJHMVwiLCBcIkcyXCIsIFwiRzNcIiwgXCJHNFwiLCBcIkc1XCIsIFwiRzZcIiwgXCJHN1wiLCBcIkc4XCIsIFwiRzlcIiwgXCJHMTBcIl0sXG4gIFtcIkgxXCIsIFwiSDJcIiwgXCJIM1wiLCBcIkg0XCIsIFwiSDVcIiwgXCJINlwiLCBcIkg3XCIsIFwiSDhcIiwgXCJIOVwiLCBcIkgxMFwiXSxcbiAgW1wiSTFcIiwgXCJJMlwiLCBcIkkzXCIsIFwiSTRcIiwgXCJJNVwiLCBcIkk2XCIsIFwiSTdcIiwgXCJJOFwiLCBcIkk5XCIsIFwiSTEwXCJdLFxuICBbXCJKMVwiLCBcIkoyXCIsIFwiSjNcIiwgXCJKNFwiLCBcIko1XCIsIFwiSjZcIiwgXCJKN1wiLCBcIko4XCIsIFwiSjlcIiwgXCJKMTBcIl0sXG5dO1xuXG5jb25zdCBpbmRleENhbGNzID0gKHN0YXJ0KSA9PiB7XG4gIGNvbnN0IGNvbExldHRlciA9IHN0YXJ0WzBdLnRvVXBwZXJDYXNlKCk7IC8vIFRoaXMgaXMgdGhlIGNvbHVtblxuICBjb25zdCByb3dOdW1iZXIgPSBwYXJzZUludChzdGFydC5zbGljZSgxKSwgMTApOyAvLyBUaGlzIGlzIHRoZSByb3dcblxuICBjb25zdCBjb2xJbmRleCA9IGNvbExldHRlci5jaGFyQ29kZUF0KDApIC0gXCJBXCIuY2hhckNvZGVBdCgwKTsgLy8gQ29sdW1uIGluZGV4IGJhc2VkIG9uIGxldHRlclxuICBjb25zdCByb3dJbmRleCA9IHJvd051bWJlciAtIDE7IC8vIFJvdyBpbmRleCBiYXNlZCBvbiBudW1iZXJcblxuICByZXR1cm4gW2NvbEluZGV4LCByb3dJbmRleF07IC8vIFJldHVybiBbcm93LCBjb2x1bW5dXG59O1xuXG5jb25zdCBjaGVja1R5cGUgPSAoc2hpcCwgc2hpcFBvc2l0aW9ucykgPT4ge1xuICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIHNoaXBQb3NpdGlvbnMgb2JqZWN0XG4gIE9iamVjdC5rZXlzKHNoaXBQb3NpdGlvbnMpLmZvckVhY2goKGV4aXN0aW5nU2hpcFR5cGUpID0+IHtcbiAgICBpZiAoZXhpc3RpbmdTaGlwVHlwZSA9PT0gc2hpcCkge1xuICAgICAgdGhyb3cgbmV3IFNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvcihzaGlwKTtcbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgY2hlY2tCb3VuZGFyaWVzID0gKHNoaXBMZW5ndGgsIGNvb3JkcywgZGlyZWN0aW9uKSA9PiB7XG4gIC8vIFNldCByb3cgYW5kIGNvbCBsaW1pdHNcbiAgY29uc3QgeExpbWl0ID0gZ3JpZC5sZW5ndGg7IC8vIFRoaXMgaXMgdGhlIHRvdGFsIG51bWJlciBvZiBjb2x1bW5zICh4KVxuICBjb25zdCB5TGltaXQgPSBncmlkWzBdLmxlbmd0aDsgLy8gVGhpcyBpcyB0aGUgdG90YWwgbnVtYmVyIG9mIHJvd3MgKHkpXG5cbiAgY29uc3QgeCA9IGNvb3Jkc1swXTtcbiAgY29uc3QgeSA9IGNvb3Jkc1sxXTtcblxuICAvLyBDaGVjayBmb3IgdmFsaWQgc3RhcnQgcG9zaXRpb24gb24gYm9hcmRcbiAgaWYgKHggPCAwIHx8IHggPj0geExpbWl0IHx8IHkgPCAwIHx8IHkgPj0geUxpbWl0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gQ2hlY2sgcmlnaHQgYm91bmRhcnkgZm9yIGhvcml6b250YWwgcGxhY2VtZW50XG4gIGlmIChkaXJlY3Rpb24gPT09IFwiaFwiICYmIHggKyBzaGlwTGVuZ3RoID4geExpbWl0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIENoZWNrIGJvdHRvbSBib3VuZGFyeSBmb3IgdmVydGljYWwgcGxhY2VtZW50XG4gIGlmIChkaXJlY3Rpb24gPT09IFwidlwiICYmIHkgKyBzaGlwTGVuZ3RoID4geUxpbWl0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gSWYgbm9uZSBvZiB0aGUgaW52YWxpZCBjb25kaXRpb25zIGFyZSBtZXQsIHJldHVybiB0cnVlXG4gIHJldHVybiB0cnVlO1xufTtcblxuY29uc3QgY2FsY3VsYXRlU2hpcFBvc2l0aW9ucyA9IChzaGlwTGVuZ3RoLCBjb29yZHMsIGRpcmVjdGlvbikgPT4ge1xuICBjb25zdCBjb2xJbmRleCA9IGNvb3Jkc1swXTsgLy8gVGhpcyBpcyB0aGUgY29sdW1uIGluZGV4XG4gIGNvbnN0IHJvd0luZGV4ID0gY29vcmRzWzFdOyAvLyBUaGlzIGlzIHRoZSByb3cgaW5kZXhcblxuICBjb25zdCBwb3NpdGlvbnMgPSBbXTtcblxuICBpZiAoZGlyZWN0aW9uLnRvTG93ZXJDYXNlKCkgPT09IFwiaFwiKSB7XG4gICAgLy8gSG9yaXpvbnRhbCBwbGFjZW1lbnQ6IGluY3JlbWVudCB0aGUgY29sdW1uIGluZGV4XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKGdyaWRbY29sSW5kZXggKyBpXVtyb3dJbmRleF0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBWZXJ0aWNhbCBwbGFjZW1lbnQ6IGluY3JlbWVudCB0aGUgcm93IGluZGV4XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKGdyaWRbY29sSW5kZXhdW3Jvd0luZGV4ICsgaV0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwb3NpdGlvbnM7XG59O1xuXG5jb25zdCBjaGVja0Zvck92ZXJsYXAgPSAocG9zaXRpb25zLCBzaGlwUG9zaXRpb25zKSA9PiB7XG4gIE9iamVjdC5lbnRyaWVzKHNoaXBQb3NpdGlvbnMpLmZvckVhY2goKFtzaGlwVHlwZSwgZXhpc3RpbmdTaGlwUG9zaXRpb25zXSkgPT4ge1xuICAgIGlmIChcbiAgICAgIHBvc2l0aW9ucy5zb21lKChwb3NpdGlvbikgPT4gZXhpc3RpbmdTaGlwUG9zaXRpb25zLmluY2x1ZGVzKHBvc2l0aW9uKSlcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBPdmVybGFwcGluZ1NoaXBzRXJyb3IoXG4gICAgICAgIGBPdmVybGFwIGRldGVjdGVkIHdpdGggc2hpcCB0eXBlICR7c2hpcFR5cGV9YCxcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IGNoZWNrRm9ySGl0ID0gKHBvc2l0aW9uLCBzaGlwUG9zaXRpb25zKSA9PiB7XG4gIGNvbnN0IGZvdW5kU2hpcCA9IE9iamVjdC5lbnRyaWVzKHNoaXBQb3NpdGlvbnMpLmZpbmQoXG4gICAgKFtfLCBleGlzdGluZ1NoaXBQb3NpdGlvbnNdKSA9PiBleGlzdGluZ1NoaXBQb3NpdGlvbnMuaW5jbHVkZXMocG9zaXRpb24pLFxuICApO1xuXG4gIHJldHVybiBmb3VuZFNoaXAgPyB7IGhpdDogdHJ1ZSwgc2hpcFR5cGU6IGZvdW5kU2hpcFswXSB9IDogeyBoaXQ6IGZhbHNlIH07XG59O1xuXG5jb25zdCBHYW1lYm9hcmQgPSAoc2hpcEZhY3RvcnkpID0+IHtcbiAgY29uc3Qgc2hpcHMgPSB7fTtcbiAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IHt9O1xuICBjb25zdCBoaXRQb3NpdGlvbnMgPSB7fTtcbiAgY29uc3QgYXR0YWNrTG9nID0gW1tdLCBbXV07XG5cbiAgY29uc3QgcGxhY2VTaGlwID0gKHR5cGUsIHN0YXJ0LCBkaXJlY3Rpb24pID0+IHtcbiAgICBjb25zdCBuZXdTaGlwID0gc2hpcEZhY3RvcnkodHlwZSk7XG5cbiAgICAvLyBDaGVjayB0aGUgc2hpcCB0eXBlIGFnYWluc3QgZXhpc3RpbmcgdHlwZXNcbiAgICBjaGVja1R5cGUodHlwZSwgc2hpcFBvc2l0aW9ucyk7XG5cbiAgICAvLyBDYWxjdWxhdGUgc3RhcnQgcG9pbnQgY29vcmRpbmF0ZXMgYmFzZWQgb24gc3RhcnQgcG9pbnQgZ3JpZCBrZXlcbiAgICBjb25zdCBjb29yZHMgPSBpbmRleENhbGNzKHN0YXJ0KTtcblxuICAgIC8vIENoZWNrIGJvdW5kYXJpZXMsIGlmIG9rIGNvbnRpbnVlIHRvIG5leHQgc3RlcFxuICAgIGlmIChjaGVja0JvdW5kYXJpZXMobmV3U2hpcC5zaGlwTGVuZ3RoLCBjb29yZHMsIGRpcmVjdGlvbikpIHtcbiAgICAgIC8vIENhbGN1bGF0ZSBhbmQgc3RvcmUgcG9zaXRpb25zIGZvciBhIG5ldyBzaGlwXG4gICAgICBjb25zdCBwb3NpdGlvbnMgPSBjYWxjdWxhdGVTaGlwUG9zaXRpb25zKFxuICAgICAgICBuZXdTaGlwLnNoaXBMZW5ndGgsXG4gICAgICAgIGNvb3JkcyxcbiAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgKTtcblxuICAgICAgLy8gQ2hlY2sgZm9yIG92ZXJsYXAgYmVmb3JlIHBsYWNpbmcgdGhlIHNoaXBcbiAgICAgIGNoZWNrRm9yT3ZlcmxhcChwb3NpdGlvbnMsIHNoaXBQb3NpdGlvbnMpO1xuXG4gICAgICAvLyBJZiBubyBvdmVybGFwLCBwcm9jZWVkIHRvIHBsYWNlIHNoaXBcbiAgICAgIHNoaXBQb3NpdGlvbnNbdHlwZV0gPSBwb3NpdGlvbnM7XG4gICAgICAvLyBBZGQgc2hpcCB0byBzaGlwcyBvYmplY3RcbiAgICAgIHNoaXBzW3R5cGVdID0gbmV3U2hpcDtcblxuICAgICAgLy8gSW5pdGlhbGlzZSBoaXRQb3NpdGlvbnMgZm9yIHRoaXMgc2hpcCB0eXBlIGFzIGFuIGVtcHR5IGFycmF5XG4gICAgICBoaXRQb3NpdGlvbnNbdHlwZV0gPSBbXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yKFxuICAgICAgICBgSW52YWxpZCBzaGlwIHBsYWNlbWVudC4gQm91bmRhcnkgZXJyb3IhIFNoaXAgdHlwZTogJHt0eXBlfWAsXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZWdpc3RlciBhbiBhdHRhY2sgYW5kIHRlc3QgZm9yIHZhbGlkIGhpdFxuICBjb25zdCBhdHRhY2sgPSAocG9zaXRpb24pID0+IHtcbiAgICBsZXQgcmVzcG9uc2U7XG5cbiAgICAvLyBDaGVjayBmb3IgdmFsaWQgYXR0YWNrXG4gICAgaWYgKGF0dGFja0xvZ1swXS5pbmNsdWRlcyhwb3NpdGlvbikgfHwgYXR0YWNrTG9nWzFdLmluY2x1ZGVzKHBvc2l0aW9uKSkge1xuICAgICAgLy8gY29uc29sZS5sb2coYFJlcGVhdCBhdHRhY2s6ICR7cG9zaXRpb259YCk7XG4gICAgICB0aHJvdyBuZXcgUmVwZWF0QXR0YWNrZWRFcnJvcigpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciB2YWxpZCBoaXRcbiAgICBjb25zdCBjaGVja1Jlc3VsdHMgPSBjaGVja0ZvckhpdChwb3NpdGlvbiwgc2hpcFBvc2l0aW9ucyk7XG4gICAgaWYgKGNoZWNrUmVzdWx0cy5oaXQpIHtcbiAgICAgIC8vIFJlZ2lzdGVyIHZhbGlkIGhpdFxuICAgICAgaGl0UG9zaXRpb25zW2NoZWNrUmVzdWx0cy5zaGlwVHlwZV0ucHVzaChwb3NpdGlvbik7XG4gICAgICBzaGlwc1tjaGVja1Jlc3VsdHMuc2hpcFR5cGVdLmhpdCgpO1xuXG4gICAgICAvLyBMb2cgdGhlIGF0dGFjayBhcyBhIHZhbGlkIGhpdFxuICAgICAgYXR0YWNrTG9nWzBdLnB1c2gocG9zaXRpb24pO1xuICAgICAgcmVzcG9uc2UgPSB7IC4uLmNoZWNrUmVzdWx0cyB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhgTUlTUyE6ICR7cG9zaXRpb259YCk7XG4gICAgICAvLyBMb2cgdGhlIGF0dGFjayBhcyBhIG1pc3NcbiAgICAgIGF0dGFja0xvZ1sxXS5wdXNoKHBvc2l0aW9uKTtcbiAgICAgIHJlc3BvbnNlID0geyAuLi5jaGVja1Jlc3VsdHMgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH07XG5cbiAgY29uc3QgaXNTaGlwU3VuayA9ICh0eXBlKSA9PiBzaGlwc1t0eXBlXS5pc1N1bms7XG5cbiAgY29uc3QgY2hlY2tBbGxTaGlwc1N1bmsgPSAoKSA9PlxuICAgIE9iamVjdC5lbnRyaWVzKHNoaXBzKS5ldmVyeSgoW3NoaXBUeXBlLCBzaGlwXSkgPT4gc2hpcC5pc1N1bmspO1xuXG4gIC8vIEZ1bmN0aW9uIGZvciByZXBvcnRpbmcgdGhlIG51bWJlciBvZiBzaGlwcyBsZWZ0IGFmbG9hdFxuICBjb25zdCBzaGlwUmVwb3J0ID0gKCkgPT4ge1xuICAgIGNvbnN0IGZsb2F0aW5nU2hpcHMgPSBPYmplY3QuZW50cmllcyhzaGlwcylcbiAgICAgIC5maWx0ZXIoKFtzaGlwVHlwZSwgc2hpcF0pID0+ICFzaGlwLmlzU3VuaylcbiAgICAgIC5tYXAoKFtzaGlwVHlwZSwgX10pID0+IHNoaXBUeXBlKTtcblxuICAgIHJldHVybiBbZmxvYXRpbmdTaGlwcy5sZW5ndGgsIGZsb2F0aW5nU2hpcHNdO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgZ2V0IGdyaWQoKSB7XG4gICAgICByZXR1cm4gZ3JpZDtcbiAgICB9LFxuICAgIGdldCBzaGlwcygpIHtcbiAgICAgIHJldHVybiBzaGlwcztcbiAgICB9LFxuICAgIGdldCBhdHRhY2tMb2coKSB7XG4gICAgICByZXR1cm4gYXR0YWNrTG9nO1xuICAgIH0sXG4gICAgZ2V0U2hpcDogKHNoaXBUeXBlKSA9PiBzaGlwc1tzaGlwVHlwZV0sXG4gICAgZ2V0U2hpcFBvc2l0aW9uczogKHNoaXBUeXBlKSA9PiBzaGlwUG9zaXRpb25zW3NoaXBUeXBlXSxcbiAgICBnZXRIaXRQb3NpdGlvbnM6IChzaGlwVHlwZSkgPT4gaGl0UG9zaXRpb25zW3NoaXBUeXBlXSxcbiAgICBwbGFjZVNoaXAsXG4gICAgYXR0YWNrLFxuICAgIGlzU2hpcFN1bmssXG4gICAgY2hlY2tBbGxTaGlwc1N1bmssXG4gICAgc2hpcFJlcG9ydCxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVib2FyZDtcbiIsImltcG9ydCBcIi4vc3R5bGVzLmNzc1wiO1xuaW1wb3J0IEdhbWUgZnJvbSBcIi4vZ2FtZVwiO1xuaW1wb3J0IFVpTWFuYWdlciBmcm9tIFwiLi91aU1hbmFnZXJcIjtcbmltcG9ydCBBY3Rpb25Db250cm9sbGVyIGZyb20gXCIuL2FjdGlvbkNvbnRyb2xsZXJcIjtcblxuLy8gQ3JlYXRlIGEgbmV3IFVJIG1hbmFnZXJcbmNvbnN0IG5ld1VpTWFuYWdlciA9IFVpTWFuYWdlcigpO1xuXG4vLyBJbnN0YW50aWF0ZSBhIG5ldyBnYW1lXG5jb25zdCBuZXdHYW1lID0gR2FtZSgpO1xuXG4vLyBDcmVhdGUgYSBuZXcgYWN0aW9uIGNvbnRyb2xsZXJcbmNvbnN0IGFjdENvbnRyb2xsZXIgPSBBY3Rpb25Db250cm9sbGVyKG5ld1VpTWFuYWdlciwgbmV3R2FtZSk7XG5cbi8vIFdhaXQgZm9yIHRoZSBnYW1lIHRvIGJlIHNldHVwIHdpdGggc2hpcCBwbGFjZW1lbnRzIGV0Yy5cbmF3YWl0IGFjdENvbnRyb2xsZXIuaGFuZGxlU2V0dXAoKTtcblxuLy8gT25jZSByZWFkeSwgY2FsbCB0aGUgcGxheUdhbWUgbWV0aG9kXG5hd2FpdCBhY3RDb250cm9sbGVyLnBsYXlHYW1lKCk7XG5cbi8vIENvbnNvbGUgbG9nIHRoZSBwbGF5ZXJzXG5jb25zb2xlLmxvZyhcbiAgYFBsYXllcnM6IEZpcnN0IHBsYXllciBvZiB0eXBlICR7bmV3R2FtZS5wbGF5ZXJzLmh1bWFuLnR5cGV9LCBzZWNvbmQgcGxheWVyIG9mIHR5cGUgJHtuZXdHYW1lLnBsYXllcnMuY29tcHV0ZXIudHlwZX0hYCxcbik7XG4iLCJpbXBvcnQge1xuICBJbnZhbGlkUGxheWVyVHlwZUVycm9yLFxuICBJbnZhbGlkTW92ZUVudHJ5RXJyb3IsXG4gIFJlcGVhdEF0dGFja2VkRXJyb3IsXG4gIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yLFxuICBPdmVybGFwcGluZ1NoaXBzRXJyb3IsXG59IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBjaGVja01vdmUgPSAobW92ZSwgZ2JHcmlkKSA9PiB7XG4gIGxldCB2YWxpZCA9IGZhbHNlO1xuXG4gIGdiR3JpZC5mb3JFYWNoKChlbCkgPT4ge1xuICAgIGlmIChlbC5maW5kKChwKSA9PiBwID09PSBtb3ZlKSkge1xuICAgICAgdmFsaWQgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHZhbGlkO1xufTtcblxuY29uc3QgcmFuZE1vdmUgPSAoZ3JpZCwgbW92ZUxvZykgPT4ge1xuICAvLyBGbGF0dGVuIHRoZSBncmlkIGludG8gYSBzaW5nbGUgYXJyYXkgb2YgbW92ZXNcbiAgY29uc3QgYWxsTW92ZXMgPSBncmlkLmZsYXRNYXAoKHJvdykgPT4gcm93KTtcblxuICAvLyBGaWx0ZXIgb3V0IHRoZSBtb3ZlcyB0aGF0IGFyZSBhbHJlYWR5IGluIHRoZSBtb3ZlTG9nXG4gIGNvbnN0IHBvc3NpYmxlTW92ZXMgPSBhbGxNb3Zlcy5maWx0ZXIoKG1vdmUpID0+ICFtb3ZlTG9nLmluY2x1ZGVzKG1vdmUpKTtcblxuICAvLyBTZWxlY3QgYSByYW5kb20gbW92ZSBmcm9tIHRoZSBwb3NzaWJsZSBtb3Zlc1xuICBjb25zdCByYW5kb21Nb3ZlID1cbiAgICBwb3NzaWJsZU1vdmVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlTW92ZXMubGVuZ3RoKV07XG5cbiAgcmV0dXJuIHJhbmRvbU1vdmU7XG59O1xuXG5jb25zdCBnZW5lcmF0ZVJhbmRvbVN0YXJ0ID0gKHNpemUsIGRpcmVjdGlvbiwgZ3JpZCkgPT4ge1xuICBjb25zdCB2YWxpZFN0YXJ0cyA9IFtdO1xuXG4gIGlmIChkaXJlY3Rpb24gPT09IFwiaFwiKSB7XG4gICAgLy8gRm9yIGhvcml6b250YWwgb3JpZW50YXRpb24sIGxpbWl0IHRoZSBjb2x1bW5zXG4gICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgZ3JpZC5sZW5ndGggLSBzaXplICsgMTsgY29sKyspIHtcbiAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IGdyaWRbY29sXS5sZW5ndGg7IHJvdysrKSB7XG4gICAgICAgIHZhbGlkU3RhcnRzLnB1c2goZ3JpZFtjb2xdW3Jvd10pO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBGb3IgdmVydGljYWwgb3JpZW50YXRpb24sIGxpbWl0IHRoZSByb3dzXG4gICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgZ3JpZFswXS5sZW5ndGggLSBzaXplICsgMTsgcm93KyspIHtcbiAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IGdyaWQubGVuZ3RoOyBjb2wrKykge1xuICAgICAgICB2YWxpZFN0YXJ0cy5wdXNoKGdyaWRbY29sXVtyb3ddKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBSYW5kb21seSBzZWxlY3QgYSBzdGFydGluZyBwb3NpdGlvblxuICBjb25zdCByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHZhbGlkU3RhcnRzLmxlbmd0aCk7XG4gIHJldHVybiB2YWxpZFN0YXJ0c1tyYW5kb21JbmRleF07XG59O1xuXG5jb25zdCBhdXRvUGxhY2VtZW50ID0gKGdhbWVib2FyZCkgPT4ge1xuICBjb25zdCBzaGlwVHlwZXMgPSBbXG4gICAgeyB0eXBlOiBcImNhcnJpZXJcIiwgc2l6ZTogNSB9LFxuICAgIHsgdHlwZTogXCJiYXR0bGVzaGlwXCIsIHNpemU6IDQgfSxcbiAgICB7IHR5cGU6IFwiY3J1aXNlclwiLCBzaXplOiAzIH0sXG4gICAgeyB0eXBlOiBcInN1Ym1hcmluZVwiLCBzaXplOiAzIH0sXG4gICAgeyB0eXBlOiBcImRlc3Ryb3llclwiLCBzaXplOiAyIH0sXG4gIF07XG5cbiAgc2hpcFR5cGVzLmZvckVhY2goKHNoaXApID0+IHtcbiAgICBsZXQgcGxhY2VkID0gZmFsc2U7XG4gICAgd2hpbGUgKCFwbGFjZWQpIHtcbiAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IE1hdGgucmFuZG9tKCkgPCAwLjUgPyBcImhcIiA6IFwidlwiO1xuICAgICAgY29uc3Qgc3RhcnQgPSBnZW5lcmF0ZVJhbmRvbVN0YXJ0KHNoaXAuc2l6ZSwgZGlyZWN0aW9uLCBnYW1lYm9hcmQuZ3JpZCk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGdhbWVib2FyZC5wbGFjZVNoaXAoc2hpcC50eXBlLCBzdGFydCwgZGlyZWN0aW9uKTtcbiAgICAgICAgcGxhY2VkID0gdHJ1ZTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAhKGVycm9yIGluc3RhbmNlb2YgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IpICYmXG4gICAgICAgICAgIShlcnJvciBpbnN0YW5jZW9mIE92ZXJsYXBwaW5nU2hpcHNFcnJvcilcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7IC8vIFJldGhyb3cgbm9uLXBsYWNlbWVudCBlcnJvcnNcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiBwbGFjZW1lbnQgZmFpbHMsIGNhdGNoIHRoZSBlcnJvciBhbmQgdHJ5IGFnYWluXG4gICAgICB9XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IFBsYXllciA9IChnYW1lYm9hcmQsIHR5cGUpID0+IHtcbiAgY29uc3QgbW92ZUxvZyA9IFtdO1xuXG4gIGNvbnN0IHBsYWNlU2hpcHMgPSAoc2hpcFR5cGUsIHN0YXJ0LCBkaXJlY3Rpb24pID0+IHtcbiAgICBpZiAodHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICBnYW1lYm9hcmQucGxhY2VTaGlwKHNoaXBUeXBlLCBzdGFydCwgZGlyZWN0aW9uKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgYXV0b1BsYWNlbWVudChnYW1lYm9hcmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBsYXllclR5cGVFcnJvcihcbiAgICAgICAgYEludmFsaWQgcGxheWVyIHR5cGUuIFZhbGlkIHBsYXllciB0eXBlczogXCJodW1hblwiICYgXCJjb21wdXRlclwiLiBFbnRlcmVkOiAke3R5cGV9LmAsXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBtYWtlTW92ZSA9IChvcHBHYW1lYm9hcmQsIGlucHV0KSA9PiB7XG4gICAgbGV0IG1vdmU7XG5cbiAgICAvLyBDaGVjayBmb3IgdGhlIHR5cGUgb2YgcGxheWVyXG4gICAgaWYgKHR5cGUgPT09IFwiaHVtYW5cIikge1xuICAgICAgLy8gRm9ybWF0IHRoZSBpbnB1dFxuICAgICAgbW92ZSA9IGAke2lucHV0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpfSR7aW5wdXQuc3Vic3RyaW5nKDEpfWA7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImNvbXB1dGVyXCIpIHtcbiAgICAgIG1vdmUgPSByYW5kTW92ZShvcHBHYW1lYm9hcmQuZ3JpZCwgbW92ZUxvZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGxheWVyVHlwZUVycm9yKFxuICAgICAgICBgSW52YWxpZCBwbGF5ZXIgdHlwZS4gVmFsaWQgcGxheWVyIHR5cGVzOiBcImh1bWFuXCIgJiBcImNvbXB1dGVyXCIuIEVudGVyZWQ6ICR7dHlwZX0uYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhlIGlucHV0IGFnYWluc3QgdGhlIHBvc3NpYmxlIG1vdmVzIG9uIHRoZSBnYW1lYm9hcmQncyBncmlkXG4gICAgaWYgKCFjaGVja01vdmUobW92ZSwgb3BwR2FtZWJvYXJkLmdyaWQpKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZE1vdmVFbnRyeUVycm9yKGBJbnZhbGlkIG1vdmUgZW50cnkhIE1vdmU6ICR7bW92ZX0uYCk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIG1vdmUgZXhpc3RzIGluIHRoZSBtb3ZlTG9nIGFycmF5LCB0aHJvdyBhbiBlcnJvclxuICAgIGlmIChtb3ZlTG9nLmZpbmQoKGVsKSA9PiBlbCA9PT0gbW92ZSkpIHtcbiAgICAgIHRocm93IG5ldyBSZXBlYXRBdHRhY2tlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gRWxzZSwgY2FsbCBhdHRhY2sgbWV0aG9kIG9uIGdhbWVib2FyZCBhbmQgbG9nIG1vdmUgaW4gbW92ZUxvZ1xuICAgIGNvbnN0IHJlc3BvbnNlID0gb3BwR2FtZWJvYXJkLmF0dGFjayhtb3ZlKTtcbiAgICBtb3ZlTG9nLnB1c2gobW92ZSk7XG4gICAgLy8gUmV0dXJuIHRoZSByZXNwb25zZSBvZiB0aGUgYXR0YWNrIChvYmplY3Q6IHsgaGl0OiBmYWxzZSB9IGZvciBtaXNzOyB7IGhpdDogdHJ1ZSwgc2hpcFR5cGU6IHN0cmluZyB9IGZvciBoaXQpLlxuICAgIHJldHVybiB7IHBsYXllcjogdHlwZSwgbW92ZSwgLi4ucmVzcG9uc2UgfTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldCB0eXBlKCkge1xuICAgICAgcmV0dXJuIHR5cGU7XG4gICAgfSxcbiAgICBnZXQgZ2FtZWJvYXJkKCkge1xuICAgICAgcmV0dXJuIGdhbWVib2FyZDtcbiAgICB9LFxuICAgIGdldCBtb3ZlTG9nKCkge1xuICAgICAgcmV0dXJuIG1vdmVMb2c7XG4gICAgfSxcbiAgICBtYWtlTW92ZSxcbiAgICBwbGFjZVNoaXBzLFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgUGxheWVyO1xuIiwiaW1wb3J0IHsgSW52YWxpZFNoaXBUeXBlRXJyb3IgfSBmcm9tIFwiLi9lcnJvcnNcIjtcblxuY29uc3QgU2hpcCA9ICh0eXBlKSA9PiB7XG4gIGNvbnN0IHNldExlbmd0aCA9ICgpID0+IHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgXCJjYXJyaWVyXCI6XG4gICAgICAgIHJldHVybiA1O1xuICAgICAgY2FzZSBcImJhdHRsZXNoaXBcIjpcbiAgICAgICAgcmV0dXJuIDQ7XG4gICAgICBjYXNlIFwiY3J1aXNlclwiOlxuICAgICAgY2FzZSBcInN1Ym1hcmluZVwiOlxuICAgICAgICByZXR1cm4gMztcbiAgICAgIGNhc2UgXCJkZXN0cm95ZXJcIjpcbiAgICAgICAgcmV0dXJuIDI7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFNoaXBUeXBlRXJyb3IoKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgc2hpcExlbmd0aCA9IHNldExlbmd0aCgpO1xuXG4gIGxldCBoaXRzID0gMDtcblxuICBjb25zdCBoaXQgPSAoKSA9PiB7XG4gICAgaWYgKGhpdHMgPCBzaGlwTGVuZ3RoKSB7XG4gICAgICBoaXRzICs9IDE7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB7XG4gICAgZ2V0IHR5cGUoKSB7XG4gICAgICByZXR1cm4gdHlwZTtcbiAgICB9LFxuICAgIGdldCBzaGlwTGVuZ3RoKCkge1xuICAgICAgcmV0dXJuIHNoaXBMZW5ndGg7XG4gICAgfSxcbiAgICBnZXQgaGl0cygpIHtcbiAgICAgIHJldHVybiBoaXRzO1xuICAgIH0sXG4gICAgZ2V0IGlzU3VuaygpIHtcbiAgICAgIHJldHVybiBoaXRzID09PSBzaGlwTGVuZ3RoO1xuICAgIH0sXG4gICAgaGl0LFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU2hpcDtcbiIsImNvbnN0IGluc3RydWN0aW9uQ2xyID0gXCJ0ZXh0LWxpbWUtNjAwXCI7XG5jb25zdCBndWlkZUNsciA9IFwidGV4dC1za3ktNjAwXCI7XG5jb25zdCBlcnJvckNsciA9IFwidGV4dC1yZWQtNzAwXCI7XG5jb25zdCBkZWZhdWx0Q2xyID0gXCJ0ZXh0LWdyYXktNzAwXCI7XG5cbmNvbnN0IGNlbGxDbHIgPSBcImJnLWdyYXktMjAwXCI7XG5jb25zdCBpbnB1dENsciA9IFwiYmctZ3JheS00MDBcIjtcbmNvbnN0IG91cHV0Q2xyID0gY2VsbENscjtcbmNvbnN0IGJ1dHRvbkNsciA9IFwiYmctZ3JheS04MDBcIjtcbmNvbnN0IGJ1dHRvblRleHRDbHIgPSBcImJnLWdyYXktMTAwXCI7XG5cbmNvbnN0IHNoaXBTZWN0Q2xyID0gXCJiZy1za3ktNzAwXCI7XG5cbi8vIEZ1bmN0aW9uIGZvciBidWlsZGluZyBhIHNoaXAsIGRlcGVuZGluZyBvbiB0aGUgc2hpcCB0eXBlXG5jb25zdCBidWlsZFNoaXAgPSAob2JqLCBkb21TZWwsIHNoaXBQb3NpdGlvbnMpID0+IHtcbiAgLy8gRXh0cmFjdCB0aGUgc2hpcCdzIHR5cGUgYW5kIGxlbmd0aCBmcm9tIHRoZSBvYmplY3RcbiAgY29uc3QgeyB0eXBlLCBzaGlwTGVuZ3RoOiBsZW5ndGggfSA9IG9iajtcbiAgLy8gQ3JlYXRlIGFuZCBhcnJheSBmb3IgdGhlIHNoaXAncyBzZWN0aW9uc1xuICBjb25zdCBzaGlwU2VjdHMgPSBbXTtcblxuICAvLyBVc2UgdGhlIGxlbmd0aCBvZiB0aGUgc2hpcCB0byBjcmVhdGUgdGhlIGNvcnJlY3QgbnVtYmVyIG9mIHNlY3Rpb25zXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAvLyBHZXQgYSBwb3NpdGlvbiBmcm9tIHRoZSBhcnJheVxuICAgIGNvbnN0IHBvc2l0aW9uID0gc2hpcFBvc2l0aW9uc1tpXTtcbiAgICAvLyBDcmVhdGUgYW4gZWxlbWVudCBmb3IgdGhlIHNlY3Rpb25cbiAgICBjb25zdCBzZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBzZWN0LmNsYXNzTmFtZSA9IGB3LTQgaC00IHJvdW5kZWQtZnVsbGA7IC8vIFNldCB0aGUgZGVmYXVsdCBzdHlsaW5nIGZvciB0aGUgc2VjdGlvbiBlbGVtZW50XG4gICAgc2VjdC5jbGFzc0xpc3QuYWRkKHNoaXBTZWN0Q2xyKTtcbiAgICAvLyBTZXQgYSB1bmlxdWUgaWQgZm9yIHRoZSBzaGlwIHNlY3Rpb25cbiAgICBzZWN0LnNldEF0dHJpYnV0ZShcImlkXCIsIGBET00tJHtkb21TZWx9LXNoaXBUeXBlLSR7dHlwZX0tcG9zLSR7cG9zaXRpb259YCk7XG4gICAgLy8gU2V0IGEgZGF0YXNldCBwcm9wZXJ0eSBvZiBcInBvc2l0aW9uXCIgZm9yIHRoZSBzZWN0aW9uXG4gICAgc2VjdC5kYXRhc2V0LnBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgc2hpcFNlY3RzLnB1c2goc2VjdCk7IC8vIEFkZCB0aGUgc2VjdGlvbiB0byB0aGUgYXJyYXlcbiAgfVxuXG4gIC8vIFJldHVybiB0aGUgYXJyYXkgb2Ygc2hpcCBzZWN0aW9uc1xuICByZXR1cm4gc2hpcFNlY3RzO1xufTtcblxuY29uc3QgVWlNYW5hZ2VyID0gKCkgPT4ge1xuICBjb25zdCBjcmVhdGVHYW1lYm9hcmQgPSAoY29udGFpbmVySUQpID0+IHtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXJJRCk7XG5cbiAgICAvLyBTZXQgcGxheWVyIHR5cGUgZGVwZW5kaW5nIG9uIHRoZSBjb250YWluZXJJRFxuICAgIGNvbnN0IHsgcGxheWVyIH0gPSBjb250YWluZXIuZGF0YXNldDtcblxuICAgIC8vIENyZWF0ZSB0aGUgZ3JpZCBjb250YWluZXJcbiAgICBjb25zdCBncmlkRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBncmlkRGl2LmNsYXNzTmFtZSA9XG4gICAgICBcImdhbWVib2FyZC1hcmVhIGdyaWQgZ3JpZC1jb2xzLTExIGF1dG8tcm93cy1taW4gZ2FwLTEgcC02XCI7XG4gICAgZ3JpZERpdi5kYXRhc2V0LnBsYXllciA9IHBsYXllcjtcblxuICAgIC8vIEFkZCB0aGUgdG9wLWxlZnQgY29ybmVyIGVtcHR5IGNlbGxcbiAgICBncmlkRGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikpO1xuXG4gICAgLy8gQWRkIGNvbHVtbiBoZWFkZXJzIEEtSlxuICAgIGNvbnN0IGNvbHVtbnMgPSBcIkFCQ0RFRkdISUpcIjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbHVtbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBoZWFkZXIuY2xhc3NOYW1lID0gXCJ0ZXh0LWNlbnRlclwiO1xuICAgICAgaGVhZGVyLnRleHRDb250ZW50ID0gY29sdW1uc1tpXTtcbiAgICAgIGdyaWREaXYuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcbiAgICB9XG5cbiAgICAvLyBBZGQgcm93IGxhYmVscyBhbmQgY2VsbHNcbiAgICBmb3IgKGxldCByb3cgPSAxOyByb3cgPD0gMTA7IHJvdysrKSB7XG4gICAgICAvLyBSb3cgbGFiZWxcbiAgICAgIGNvbnN0IHJvd0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIHJvd0xhYmVsLmNsYXNzTmFtZSA9IFwidGV4dC1jZW50ZXJcIjtcbiAgICAgIHJvd0xhYmVsLnRleHRDb250ZW50ID0gcm93O1xuICAgICAgZ3JpZERpdi5hcHBlbmRDaGlsZChyb3dMYWJlbCk7XG5cbiAgICAgIC8vIENlbGxzIGZvciBlYWNoIHJvd1xuICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgMTA7IGNvbCsrKSB7XG4gICAgICAgIGNvbnN0IGNlbGxJZCA9IGAke2NvbHVtbnNbY29sXX0ke3Jvd31gOyAvLyBTZXQgdGhlIGNlbGxJZFxuICAgICAgICBjb25zdCBjZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY2VsbC5pZCA9IGAke3BsYXllcn0tJHtjZWxsSWR9YDsgLy8gU2V0IHRoZSBlbGVtZW50IGlkXG4gICAgICAgIGNlbGwuY2xhc3NOYW1lID0gYHctNiBoLTYgZmxleCBqdXN0aWZ5LWNlbnRlciBpdGVtcy1jZW50ZXIgY3Vyc29yLXBvaW50ZXIgaG92ZXI6Ymctb3JhbmdlLTUwMGA7IC8vIEFkZCBtb3JlIGNsYXNzZXMgYXMgbmVlZGVkIGZvciBzdHlsaW5nXG4gICAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChjZWxsQ2xyKTtcbiAgICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKFwiZ2FtZWJvYXJkLWNlbGxcIik7IC8vIEFkZCBhIGNsYXNzIG5hbWUgdG8gZWFjaCBjZWxsIHRvIGFjdCBhcyBhIHNlbGVjdG9yXG4gICAgICAgIGNlbGwuZGF0YXNldC5wb3NpdGlvbiA9IGNlbGxJZDsgLy8gQXNzaWduIHBvc2l0aW9uIGRhdGEgYXR0cmlidXRlIGZvciBpZGVudGlmaWNhdGlvblxuICAgICAgICBjZWxsLmRhdGFzZXQucGxheWVyID0gcGxheWVyOyAvLyBBc3NpZ24gcGxheWVyIGRhdGEgYXR0cmlidXRlIGZvciBpZGVudGlmaWNhdGlvblxuXG4gICAgICAgIGdyaWREaXYuYXBwZW5kQ2hpbGQoY2VsbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQXBwZW5kIHRoZSBncmlkIHRvIHRoZSBjb250YWluZXJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZ3JpZERpdik7XG4gIH07XG5cbiAgY29uc3QgaW5pdENvbnNvbGVVSSA9ICgpID0+IHtcbiAgICBjb25zdCBjb25zb2xlQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlXCIpOyAvLyBHZXQgdGhlIGNvbnNvbGUgY29udGFpbmVyIGZyb20gdGhlIERPTVxuICAgIGNvbnNvbGVDb250YWluZXIuY2xhc3NMaXN0LmFkZChcbiAgICAgIFwiZmxleFwiLFxuICAgICAgXCJmbGV4LWNvbFwiLFxuICAgICAgXCJqdXN0aWZ5LWJldHdlZW5cIixcbiAgICAgIFwidGV4dC1zbVwiLFxuICAgICk7IC8vIFNldCBmbGV4Ym94IHJ1bGVzIGZvciBjb250YWluZXJcblxuICAgIC8vIENyZWF0ZSBhIGNvbnRhaW5lciBmb3IgdGhlIGlucHV0IGFuZCBidXR0b24gZWxlbWVudHNcbiAgICBjb25zdCBpbnB1dERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgaW5wdXREaXYuY2xhc3NOYW1lID0gXCJmbGV4IGZsZXgtcm93IHctZnVsbCBoLTEvNSBqdXN0aWZ5LWJldHdlZW5cIjsgLy8gU2V0IHRoZSBmbGV4Ym94IHJ1bGVzIGZvciB0aGUgY29udGFpbmVyXG5cbiAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTsgLy8gQ3JlYXRlIGFuIGlucHV0IGVsZW1lbnQgZm9yIHRoZSBjb25zb2xlXG4gICAgaW5wdXQudHlwZSA9IFwidGV4dFwiOyAvLyBTZXQgdGhlIGlucHV0IHR5cGUgb2YgdGhpcyBlbGVtZW50IHRvIHRleHRcbiAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNvbnNvbGUtaW5wdXRcIik7IC8vIFNldCB0aGUgaWQgZm9yIHRoaXMgZWxlbWVudCB0byBcImNvbnNvbGUtaW5wdXRcIlxuICAgIGlucHV0LmNsYXNzTmFtZSA9IGBwLTEgYmctJHtpbnB1dENscn0gZmxleC0xYDsgLy8gQWRkIFRhaWx3aW5kQ1NTIGNsYXNzZXNcbiAgICBjb25zdCBzdWJtaXRCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpOyAvLyBDcmVhdGUgYSBidXR0b24gZWxlbWVudCBmb3IgdGhlIGNvbnNvbGUgc3VibWl0XG4gICAgc3VibWl0QnV0dG9uLnRleHRDb250ZW50ID0gXCJTdWJtaXRcIjsgLy8gQWRkIHRoZSB0ZXh0IFwiU3VibWl0XCIgdG8gdGhlIGJ1dHRvblxuICAgIHN1Ym1pdEJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNvbnNvbGUtc3VibWl0XCIpOyAvLyBTZXQgdGhlIGlkIGZvciB0aGUgYnV0dG9uXG4gICAgc3VibWl0QnV0dG9uLmNsYXNzTmFtZSA9IGBweC0zIHB5LTEgdGV4dC1jZW50ZXIgdGV4dC1zbWA7IC8vIEFkZCBUYWlsd2luZENTUyBjbGFzc2VzXG4gICAgc3VibWl0QnV0dG9uLmNsYXNzTGlzdC5hZGQoYnV0dG9uQ2xyKTtcbiAgICBzdWJtaXRCdXR0b24uY2xhc3NMaXN0LmFkZChidXR0b25UZXh0Q2xyKTtcbiAgICBjb25zdCBvdXRwdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpOyAvLyBDcmVhdGUgYW4gZGl2IGVsZW1lbnQgZm9yIHRoZSBvdXRwdXQgb2YgdGhlIGNvbnNvbGVcbiAgICBvdXRwdXQuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJjb25zb2xlLW91dHB1dFwiKTsgLy8gU2V0IHRoZSBpZCBmb3IgdGhlIG91dHB1dCBlbGVtZW50XG4gICAgb3V0cHV0LmNsYXNzTmFtZSA9IGBwLTEgZmxleC0xIGgtNC81IG92ZXJmbG93LWF1dG9gOyAvLyBBZGQgVGFpbHdpbmRDU1MgY2xhc3Nlc1xuICAgIG91dHB1dC5jbGFzc0xpc3QuYWRkKG91cHV0Q2xyKTtcblxuICAgIC8vIEFkZCB0aGUgaW5wdXQgZWxlbWVudHMgdG8gdGhlIGlucHV0IGNvbnRhaW5lclxuICAgIGlucHV0RGl2LmFwcGVuZENoaWxkKGlucHV0KTtcbiAgICBpbnB1dERpdi5hcHBlbmRDaGlsZChzdWJtaXRCdXR0b24pO1xuXG4gICAgLy8gQXBwZW5kIGVsZW1lbnRzIHRvIHRoZSBjb25zb2xlIGNvbnRhaW5lclxuICAgIGNvbnNvbGVDb250YWluZXIuYXBwZW5kQ2hpbGQob3V0cHV0KTtcbiAgICBjb25zb2xlQ29udGFpbmVyLmFwcGVuZENoaWxkKGlucHV0RGl2KTtcbiAgfTtcblxuICBjb25zdCBkaXNwbGF5UHJvbXB0ID0gKHByb21wdE9ianMpID0+IHtcbiAgICAvLyBHZXQgdGhlIHByb21wdCBkaXNwbGF5XG4gICAgY29uc3QgZGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJvbXB0LWRpc3BsYXlcIik7XG5cbiAgICAvLyBDbGVhciB0aGUgZGlzcGxheSBvZiBhbGwgY2hpbGRyZW5cbiAgICB3aGlsZSAoZGlzcGxheS5maXJzdENoaWxkKSB7XG4gICAgICBkaXNwbGF5LnJlbW92ZUNoaWxkKGRpc3BsYXkuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgLy8gSXRlcmF0ZSBvdmVyIGVhY2ggcHJvbXB0IGluIHRoZSBwcm9tcHRzIG9iamVjdFxuICAgIE9iamVjdC5lbnRyaWVzKHByb21wdE9ianMpLmZvckVhY2goKFtrZXksIHsgcHJvbXB0LCBwcm9tcHRUeXBlIH1dKSA9PiB7XG4gICAgICAvLyBDcmVhdGUgYSBuZXcgZGl2IGZvciBlYWNoIHByb21wdFxuICAgICAgY29uc3QgcHJvbXB0RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIHByb21wdERpdi50ZXh0Q29udGVudCA9IHByb21wdDtcblxuICAgICAgLy8gQXBwbHkgc3R5bGluZyBiYXNlZCBvbiBwcm9tcHRUeXBlXG4gICAgICBzd2l0Y2ggKHByb21wdFR5cGUpIHtcbiAgICAgICAgY2FzZSBcImluc3RydWN0aW9uXCI6XG4gICAgICAgICAgcHJvbXB0RGl2LmNsYXNzTGlzdC5hZGQoaW5zdHJ1Y3Rpb25DbHIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZ3VpZGVcIjpcbiAgICAgICAgICBwcm9tcHREaXYuY2xhc3NMaXN0LmFkZChndWlkZUNscik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgICAgIHByb21wdERpdi5jbGFzc0xpc3QuYWRkKGVycm9yQ2xyKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBwcm9tcHREaXYuY2xhc3NMaXN0LmFkZChkZWZhdWx0Q2xyKTsgLy8gRGVmYXVsdCB0ZXh0IGNvbG9yXG4gICAgICB9XG5cbiAgICAgIC8vIEFwcGVuZCB0aGUgbmV3IGRpdiB0byB0aGUgZGlzcGxheSBjb250YWluZXJcbiAgICAgIGRpc3BsYXkuYXBwZW5kQ2hpbGQocHJvbXB0RGl2KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiBmb3IgcmVuZGVyaW5nIHNoaXBzIHRvIHRoZSBTaGlwIFN0YXR1cyBkaXNwbGF5IHNlY3Rpb25cbiAgY29uc3QgcmVuZGVyU2hpcERpc3AgPSAocGxheWVyT2JqLCBzaGlwVHlwZSkgPT4ge1xuICAgIGxldCBpZFNlbDtcblxuICAgIC8vIFNldCB0aGUgY29ycmVjdCBpZCBzZWxlY3RvciBmb3IgdGhlIHR5cGUgb2YgcGxheWVyXG4gICAgaWYgKHBsYXllck9iai50eXBlID09PSBcImh1bWFuXCIpIHtcbiAgICAgIGlkU2VsID0gXCJodW1hbi1kaXNwbGF5XCI7XG4gICAgfSBlbHNlIGlmIChwbGF5ZXJPYmoudHlwZSA9PT0gXCJjb21wdXRlclwiKSB7XG4gICAgICBpZFNlbCA9IFwiY29tcC1kaXNwbGF5XCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yO1xuICAgIH1cblxuICAgIC8vIEdldCB0aGUgY29ycmVjdCBET00gZWxlbWVudFxuICAgIGNvbnN0IGRpc3BEaXYgPSBkb2N1bWVudFxuICAgICAgLmdldEVsZW1lbnRCeUlkKGlkU2VsKVxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCIuc2hpcHMtY29udGFpbmVyXCIpO1xuXG4gICAgLy8gR2V0IHRoZSBzaGlwIGZyb20gdGhlIHBsYXllclxuICAgIGNvbnN0IHNoaXAgPSBwbGF5ZXJPYmouZ2FtZWJvYXJkLmdldFNoaXAoc2hpcFR5cGUpO1xuXG4gICAgLy8gQ3JlYXRlIGEgZGl2IGZvciB0aGUgc2hpcFxuICAgIGNvbnN0IHNoaXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHNoaXBEaXYuY2xhc3NOYW1lID0gXCJweC00IHB5LTIgZmxleCBmbGV4LWNvbCBnYXAtMVwiO1xuXG4gICAgLy8gQWRkIGEgdGl0bGUgdGhlIHRoZSBkaXZcbiAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoMlwiKTtcbiAgICB0aXRsZS50ZXh0Q29udGVudCA9IHNoaXBUeXBlOyAvLyBTZXQgdGhlIHRpdGxlIHRvIHRoZSBzaGlwIHR5cGVcbiAgICBzaGlwRGl2LmFwcGVuZENoaWxkKHRpdGxlKTtcblxuICAgIC8vIEdldCB0aGUgc2hpcCBwb3NpdGlvbnMgYXJyYXlcbiAgICBjb25zdCBzaGlwUG9zaXRpb25zID0gcGxheWVyT2JqLmdhbWVib2FyZC5nZXRTaGlwUG9zaXRpb25zKHNoaXBUeXBlKTtcblxuICAgIC8vIEJ1aWxkIHRoZSBzaGlwIHNlY3Rpb25zXG4gICAgY29uc3Qgc2hpcFNlY3RzID0gYnVpbGRTaGlwKHNoaXAsIGlkU2VsLCBzaGlwUG9zaXRpb25zKTtcblxuICAgIC8vIEFkZCB0aGUgc2hpcCBzZWN0aW9ucyB0byB0aGUgZGl2XG4gICAgY29uc3Qgc2VjdHNEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHNlY3RzRGl2LmNsYXNzTmFtZSA9IFwiZmxleCBmbGV4LXJvdyBnYXAtMVwiO1xuICAgIHNoaXBTZWN0cy5mb3JFYWNoKChzZWN0KSA9PiB7XG4gICAgICBzZWN0c0Rpdi5hcHBlbmRDaGlsZChzZWN0KTtcbiAgICB9KTtcbiAgICBzaGlwRGl2LmFwcGVuZENoaWxkKHNlY3RzRGl2KTtcblxuICAgIGRpc3BEaXYuYXBwZW5kQ2hpbGQoc2hpcERpdik7XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gZm9yIHIgc2hpcHMgb24gdGhlIGdhbWVib2FyZFxuICBjb25zdCByZW5kZXJTaGlwQm9hcmQgPSAocGxheWVyT2JqLCBzaGlwVHlwZSkgPT4ge1xuICAgIGxldCBpZFNlbDtcblxuICAgIC8vIFNldCB0aGUgY29ycmVjdCBpZCBzZWxlY3RvciBmb3IgdGhlIHR5cGUgb2YgcGxheWVyXG4gICAgaWYgKHBsYXllck9iai50eXBlID09PSBcImh1bWFuXCIpIHtcbiAgICAgIGlkU2VsID0gXCJodW1hbi1ib2FyZFwiO1xuICAgIH0gZWxzZSBpZiAocGxheWVyT2JqLnR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgaWRTZWwgPSBcImNvbXAtYm9hcmRcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgRXJyb3IoXCJObyBtYXRjaGluZyBwbGF5ZXIgdHlwZSBpbiAncmVuZGVyU2hpcEJvYXJkJyBmdW5jdGlvblwiKTtcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIHBsYXllcidzIHR5cGUgYW5kIGdhbWVib2FyZFxuICAgIGNvbnN0IHsgdHlwZTogcGxheWVyVHlwZSwgZ2FtZWJvYXJkIH0gPSBwbGF5ZXJPYmo7XG5cbiAgICAvLyBHZXQgdGhlIHNoaXAgYW5kIHRoZSBzaGlwIHBvc2l0aW9uc1xuICAgIGNvbnN0IHNoaXBPYmogPSBnYW1lYm9hcmQuZ2V0U2hpcChzaGlwVHlwZSk7XG4gICAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IGdhbWVib2FyZC5nZXRTaGlwUG9zaXRpb25zKHNoaXBUeXBlKTtcblxuICAgIC8vIEJ1aWxkIHRoZSBzaGlwIHNlY3Rpb25zXG4gICAgY29uc3Qgc2hpcFNlY3RzID0gYnVpbGRTaGlwKHNoaXBPYmosIGlkU2VsLCBzaGlwUG9zaXRpb25zKTtcblxuICAgIC8vIE1hdGNoIHRoZSBjZWxsIHBvc2l0aW9ucyB3aXRoIHRoZSBzaGlwIHNlY3Rpb25zIGFuZCBwbGFjZSBlYWNoXG4gICAgLy8gc2hpcCBzZWN0aW9uIGluIHRoZSBjb3JyZXNwb25kaW5nIGNlbGwgZWxlbWVudFxuICAgIHNoaXBQb3NpdGlvbnMuZm9yRWFjaCgocG9zaXRpb24pID0+IHtcbiAgICAgIGNvbnN0IGNlbGxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7cGxheWVyVHlwZX0tJHtwb3NpdGlvbn1gKTtcbiAgICAgIC8vIEZpbmQgdGhlIHNoaXAgc2VjdGlvbiBlbGVtZW50IHRoYXQgbWF0Y2hlcyB0aGUgY3VycmVudCBwb3NpdGlvblxuICAgICAgY29uc3Qgc2hpcFNlY3QgPSBzaGlwU2VjdHMuZmluZChcbiAgICAgICAgKHNlY3Rpb24pID0+IHNlY3Rpb24uZGF0YXNldC5wb3NpdGlvbiA9PT0gcG9zaXRpb24sXG4gICAgICApO1xuXG4gICAgICBpZiAoY2VsbEVsZW1lbnQgJiYgc2hpcFNlY3QpIHtcbiAgICAgICAgLy8gUGxhY2UgdGhlIHNoaXAgc2VjdGlvbiBpbiB0aGUgY2VsbFxuICAgICAgICBjZWxsRWxlbWVudC5hcHBlbmRDaGlsZChzaGlwU2VjdCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBjcmVhdGVHYW1lYm9hcmQsXG4gICAgaW5pdENvbnNvbGVVSSxcbiAgICBkaXNwbGF5UHJvbXB0LFxuICAgIHJlbmRlclNoaXBEaXNwLFxuICAgIHJlbmRlclNoaXBCb2FyZCxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFVpTWFuYWdlcjtcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIGAvKlxuISB0YWlsd2luZGNzcyB2My40LjEgfCBNSVQgTGljZW5zZSB8IGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tXG4qLy8qXG4xLiBQcmV2ZW50IHBhZGRpbmcgYW5kIGJvcmRlciBmcm9tIGFmZmVjdGluZyBlbGVtZW50IHdpZHRoLiAoaHR0cHM6Ly9naXRodWIuY29tL21vemRldnMvY3NzcmVtZWR5L2lzc3Vlcy80KVxuMi4gQWxsb3cgYWRkaW5nIGEgYm9yZGVyIHRvIGFuIGVsZW1lbnQgYnkganVzdCBhZGRpbmcgYSBib3JkZXItd2lkdGguIChodHRwczovL2dpdGh1Yi5jb20vdGFpbHdpbmRjc3MvdGFpbHdpbmRjc3MvcHVsbC8xMTYpXG4qL1xuXG4qLFxuOjpiZWZvcmUsXG46OmFmdGVyIHtcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDsgLyogMSAqL1xuICBib3JkZXItd2lkdGg6IDA7IC8qIDIgKi9cbiAgYm9yZGVyLXN0eWxlOiBzb2xpZDsgLyogMiAqL1xuICBib3JkZXItY29sb3I6ICNlNWU3ZWI7IC8qIDIgKi9cbn1cblxuOjpiZWZvcmUsXG46OmFmdGVyIHtcbiAgLS10dy1jb250ZW50OiAnJztcbn1cblxuLypcbjEuIFVzZSBhIGNvbnNpc3RlbnQgc2Vuc2libGUgbGluZS1oZWlnaHQgaW4gYWxsIGJyb3dzZXJzLlxuMi4gUHJldmVudCBhZGp1c3RtZW50cyBvZiBmb250IHNpemUgYWZ0ZXIgb3JpZW50YXRpb24gY2hhbmdlcyBpbiBpT1MuXG4zLiBVc2UgYSBtb3JlIHJlYWRhYmxlIHRhYiBzaXplLlxuNC4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBzYW5zXFxgIGZvbnQtZmFtaWx5IGJ5IGRlZmF1bHQuXG41LiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYHNhbnNcXGAgZm9udC1mZWF0dXJlLXNldHRpbmdzIGJ5IGRlZmF1bHQuXG42LiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYHNhbnNcXGAgZm9udC12YXJpYXRpb24tc2V0dGluZ3MgYnkgZGVmYXVsdC5cbjcuIERpc2FibGUgdGFwIGhpZ2hsaWdodHMgb24gaU9TXG4qL1xuXG5odG1sLFxuOmhvc3Qge1xuICBsaW5lLWhlaWdodDogMS41OyAvKiAxICovXG4gIC13ZWJraXQtdGV4dC1zaXplLWFkanVzdDogMTAwJTsgLyogMiAqL1xuICAtbW96LXRhYi1zaXplOiA0OyAvKiAzICovXG4gIC1vLXRhYi1zaXplOiA0O1xuICAgICB0YWItc2l6ZTogNDsgLyogMyAqL1xuICBmb250LWZhbWlseTogdWktc2Fucy1zZXJpZiwgc3lzdGVtLXVpLCBzYW5zLXNlcmlmLCBcIkFwcGxlIENvbG9yIEVtb2ppXCIsIFwiU2Vnb2UgVUkgRW1vamlcIiwgXCJTZWdvZSBVSSBTeW1ib2xcIiwgXCJOb3RvIENvbG9yIEVtb2ppXCI7IC8qIDQgKi9cbiAgZm9udC1mZWF0dXJlLXNldHRpbmdzOiBub3JtYWw7IC8qIDUgKi9cbiAgZm9udC12YXJpYXRpb24tc2V0dGluZ3M6IG5vcm1hbDsgLyogNiAqL1xuICAtd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6IHRyYW5zcGFyZW50OyAvKiA3ICovXG59XG5cbi8qXG4xLiBSZW1vdmUgdGhlIG1hcmdpbiBpbiBhbGwgYnJvd3NlcnMuXG4yLiBJbmhlcml0IGxpbmUtaGVpZ2h0IGZyb20gXFxgaHRtbFxcYCBzbyB1c2VycyBjYW4gc2V0IHRoZW0gYXMgYSBjbGFzcyBkaXJlY3RseSBvbiB0aGUgXFxgaHRtbFxcYCBlbGVtZW50LlxuKi9cblxuYm9keSB7XG4gIG1hcmdpbjogMDsgLyogMSAqL1xuICBsaW5lLWhlaWdodDogaW5oZXJpdDsgLyogMiAqL1xufVxuXG4vKlxuMS4gQWRkIHRoZSBjb3JyZWN0IGhlaWdodCBpbiBGaXJlZm94LlxuMi4gQ29ycmVjdCB0aGUgaW5oZXJpdGFuY2Ugb2YgYm9yZGVyIGNvbG9yIGluIEZpcmVmb3guIChodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD0xOTA2NTUpXG4zLiBFbnN1cmUgaG9yaXpvbnRhbCBydWxlcyBhcmUgdmlzaWJsZSBieSBkZWZhdWx0LlxuKi9cblxuaHIge1xuICBoZWlnaHQ6IDA7IC8qIDEgKi9cbiAgY29sb3I6IGluaGVyaXQ7IC8qIDIgKi9cbiAgYm9yZGVyLXRvcC13aWR0aDogMXB4OyAvKiAzICovXG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgdGV4dCBkZWNvcmF0aW9uIGluIENocm9tZSwgRWRnZSwgYW5kIFNhZmFyaS5cbiovXG5cbmFiYnI6d2hlcmUoW3RpdGxlXSkge1xuICAtd2Via2l0LXRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lIGRvdHRlZDtcbiAgICAgICAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZSBkb3R0ZWQ7XG59XG5cbi8qXG5SZW1vdmUgdGhlIGRlZmF1bHQgZm9udCBzaXplIGFuZCB3ZWlnaHQgZm9yIGhlYWRpbmdzLlxuKi9cblxuaDEsXG5oMixcbmgzLFxuaDQsXG5oNSxcbmg2IHtcbiAgZm9udC1zaXplOiBpbmhlcml0O1xuICBmb250LXdlaWdodDogaW5oZXJpdDtcbn1cblxuLypcblJlc2V0IGxpbmtzIHRvIG9wdGltaXplIGZvciBvcHQtaW4gc3R5bGluZyBpbnN0ZWFkIG9mIG9wdC1vdXQuXG4qL1xuXG5hIHtcbiAgY29sb3I6IGluaGVyaXQ7XG4gIHRleHQtZGVjb3JhdGlvbjogaW5oZXJpdDtcbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCBmb250IHdlaWdodCBpbiBFZGdlIGFuZCBTYWZhcmkuXG4qL1xuXG5iLFxuc3Ryb25nIHtcbiAgZm9udC13ZWlnaHQ6IGJvbGRlcjtcbn1cblxuLypcbjEuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgbW9ub1xcYCBmb250LWZhbWlseSBieSBkZWZhdWx0LlxuMi4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBtb25vXFxgIGZvbnQtZmVhdHVyZS1zZXR0aW5ncyBieSBkZWZhdWx0LlxuMy4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBtb25vXFxgIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzIGJ5IGRlZmF1bHQuXG40LiBDb3JyZWN0IHRoZSBvZGQgXFxgZW1cXGAgZm9udCBzaXppbmcgaW4gYWxsIGJyb3dzZXJzLlxuKi9cblxuY29kZSxcbmtiZCxcbnNhbXAsXG5wcmUge1xuICBmb250LWZhbWlseTogdWktbW9ub3NwYWNlLCBTRk1vbm8tUmVndWxhciwgTWVubG8sIE1vbmFjbywgQ29uc29sYXMsIFwiTGliZXJhdGlvbiBNb25vXCIsIFwiQ291cmllciBOZXdcIiwgbW9ub3NwYWNlOyAvKiAxICovXG4gIGZvbnQtZmVhdHVyZS1zZXR0aW5nczogbm9ybWFsOyAvKiAyICovXG4gIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzOiBub3JtYWw7IC8qIDMgKi9cbiAgZm9udC1zaXplOiAxZW07IC8qIDQgKi9cbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCBmb250IHNpemUgaW4gYWxsIGJyb3dzZXJzLlxuKi9cblxuc21hbGwge1xuICBmb250LXNpemU6IDgwJTtcbn1cblxuLypcblByZXZlbnQgXFxgc3ViXFxgIGFuZCBcXGBzdXBcXGAgZWxlbWVudHMgZnJvbSBhZmZlY3RpbmcgdGhlIGxpbmUgaGVpZ2h0IGluIGFsbCBicm93c2Vycy5cbiovXG5cbnN1YixcbnN1cCB7XG4gIGZvbnQtc2l6ZTogNzUlO1xuICBsaW5lLWhlaWdodDogMDtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XG59XG5cbnN1YiB7XG4gIGJvdHRvbTogLTAuMjVlbTtcbn1cblxuc3VwIHtcbiAgdG9wOiAtMC41ZW07XG59XG5cbi8qXG4xLiBSZW1vdmUgdGV4dCBpbmRlbnRhdGlvbiBmcm9tIHRhYmxlIGNvbnRlbnRzIGluIENocm9tZSBhbmQgU2FmYXJpLiAoaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9OTk5MDg4LCBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjAxMjk3KVxuMi4gQ29ycmVjdCB0YWJsZSBib3JkZXIgY29sb3IgaW5oZXJpdGFuY2UgaW4gYWxsIENocm9tZSBhbmQgU2FmYXJpLiAoaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9OTM1NzI5LCBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTk1MDE2KVxuMy4gUmVtb3ZlIGdhcHMgYmV0d2VlbiB0YWJsZSBib3JkZXJzIGJ5IGRlZmF1bHQuXG4qL1xuXG50YWJsZSB7XG4gIHRleHQtaW5kZW50OiAwOyAvKiAxICovXG4gIGJvcmRlci1jb2xvcjogaW5oZXJpdDsgLyogMiAqL1xuICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyAvKiAzICovXG59XG5cbi8qXG4xLiBDaGFuZ2UgdGhlIGZvbnQgc3R5bGVzIGluIGFsbCBicm93c2Vycy5cbjIuIFJlbW92ZSB0aGUgbWFyZ2luIGluIEZpcmVmb3ggYW5kIFNhZmFyaS5cbjMuIFJlbW92ZSBkZWZhdWx0IHBhZGRpbmcgaW4gYWxsIGJyb3dzZXJzLlxuKi9cblxuYnV0dG9uLFxuaW5wdXQsXG5vcHRncm91cCxcbnNlbGVjdCxcbnRleHRhcmVhIHtcbiAgZm9udC1mYW1pbHk6IGluaGVyaXQ7IC8qIDEgKi9cbiAgZm9udC1mZWF0dXJlLXNldHRpbmdzOiBpbmhlcml0OyAvKiAxICovXG4gIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzOiBpbmhlcml0OyAvKiAxICovXG4gIGZvbnQtc2l6ZTogMTAwJTsgLyogMSAqL1xuICBmb250LXdlaWdodDogaW5oZXJpdDsgLyogMSAqL1xuICBsaW5lLWhlaWdodDogaW5oZXJpdDsgLyogMSAqL1xuICBjb2xvcjogaW5oZXJpdDsgLyogMSAqL1xuICBtYXJnaW46IDA7IC8qIDIgKi9cbiAgcGFkZGluZzogMDsgLyogMyAqL1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBpbmhlcml0YW5jZSBvZiB0ZXh0IHRyYW5zZm9ybSBpbiBFZGdlIGFuZCBGaXJlZm94LlxuKi9cblxuYnV0dG9uLFxuc2VsZWN0IHtcbiAgdGV4dC10cmFuc2Zvcm06IG5vbmU7XG59XG5cbi8qXG4xLiBDb3JyZWN0IHRoZSBpbmFiaWxpdHkgdG8gc3R5bGUgY2xpY2thYmxlIHR5cGVzIGluIGlPUyBhbmQgU2FmYXJpLlxuMi4gUmVtb3ZlIGRlZmF1bHQgYnV0dG9uIHN0eWxlcy5cbiovXG5cbmJ1dHRvbixcblt0eXBlPSdidXR0b24nXSxcblt0eXBlPSdyZXNldCddLFxuW3R5cGU9J3N1Ym1pdCddIHtcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiBidXR0b247IC8qIDEgKi9cbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7IC8qIDIgKi9cbiAgYmFja2dyb3VuZC1pbWFnZTogbm9uZTsgLyogMiAqL1xufVxuXG4vKlxuVXNlIHRoZSBtb2Rlcm4gRmlyZWZveCBmb2N1cyBzdHlsZSBmb3IgYWxsIGZvY3VzYWJsZSBlbGVtZW50cy5cbiovXG5cbjotbW96LWZvY3VzcmluZyB7XG4gIG91dGxpbmU6IGF1dG87XG59XG5cbi8qXG5SZW1vdmUgdGhlIGFkZGl0aW9uYWwgXFxgOmludmFsaWRcXGAgc3R5bGVzIGluIEZpcmVmb3guIChodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9nZWNrby1kZXYvYmxvYi8yZjllYWNkOWQzZDk5NWM5MzdiNDI1MWE1NTU3ZDk1ZDQ5NGM5YmUxL2xheW91dC9zdHlsZS9yZXMvZm9ybXMuY3NzI0w3MjgtTDczNylcbiovXG5cbjotbW96LXVpLWludmFsaWQge1xuICBib3gtc2hhZG93OiBub25lO1xufVxuXG4vKlxuQWRkIHRoZSBjb3JyZWN0IHZlcnRpY2FsIGFsaWdubWVudCBpbiBDaHJvbWUgYW5kIEZpcmVmb3guXG4qL1xuXG5wcm9ncmVzcyB7XG4gIHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTtcbn1cblxuLypcbkNvcnJlY3QgdGhlIGN1cnNvciBzdHlsZSBvZiBpbmNyZW1lbnQgYW5kIGRlY3JlbWVudCBidXR0b25zIGluIFNhZmFyaS5cbiovXG5cbjo6LXdlYmtpdC1pbm5lci1zcGluLWJ1dHRvbixcbjo6LXdlYmtpdC1vdXRlci1zcGluLWJ1dHRvbiB7XG4gIGhlaWdodDogYXV0bztcbn1cblxuLypcbjEuIENvcnJlY3QgdGhlIG9kZCBhcHBlYXJhbmNlIGluIENocm9tZSBhbmQgU2FmYXJpLlxuMi4gQ29ycmVjdCB0aGUgb3V0bGluZSBzdHlsZSBpbiBTYWZhcmkuXG4qL1xuXG5bdHlwZT0nc2VhcmNoJ10ge1xuICAtd2Via2l0LWFwcGVhcmFuY2U6IHRleHRmaWVsZDsgLyogMSAqL1xuICBvdXRsaW5lLW9mZnNldDogLTJweDsgLyogMiAqL1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBpbm5lciBwYWRkaW5nIGluIENocm9tZSBhbmQgU2FmYXJpIG9uIG1hY09TLlxuKi9cblxuOjotd2Via2l0LXNlYXJjaC1kZWNvcmF0aW9uIHtcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xufVxuXG4vKlxuMS4gQ29ycmVjdCB0aGUgaW5hYmlsaXR5IHRvIHN0eWxlIGNsaWNrYWJsZSB0eXBlcyBpbiBpT1MgYW5kIFNhZmFyaS5cbjIuIENoYW5nZSBmb250IHByb3BlcnRpZXMgdG8gXFxgaW5oZXJpdFxcYCBpbiBTYWZhcmkuXG4qL1xuXG46Oi13ZWJraXQtZmlsZS11cGxvYWQtYnV0dG9uIHtcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiBidXR0b247IC8qIDEgKi9cbiAgZm9udDogaW5oZXJpdDsgLyogMiAqL1xufVxuXG4vKlxuQWRkIHRoZSBjb3JyZWN0IGRpc3BsYXkgaW4gQ2hyb21lIGFuZCBTYWZhcmkuXG4qL1xuXG5zdW1tYXJ5IHtcbiAgZGlzcGxheTogbGlzdC1pdGVtO1xufVxuXG4vKlxuUmVtb3ZlcyB0aGUgZGVmYXVsdCBzcGFjaW5nIGFuZCBib3JkZXIgZm9yIGFwcHJvcHJpYXRlIGVsZW1lbnRzLlxuKi9cblxuYmxvY2txdW90ZSxcbmRsLFxuZGQsXG5oMSxcbmgyLFxuaDMsXG5oNCxcbmg1LFxuaDYsXG5ocixcbmZpZ3VyZSxcbnAsXG5wcmUge1xuICBtYXJnaW46IDA7XG59XG5cbmZpZWxkc2V0IHtcbiAgbWFyZ2luOiAwO1xuICBwYWRkaW5nOiAwO1xufVxuXG5sZWdlbmQge1xuICBwYWRkaW5nOiAwO1xufVxuXG5vbCxcbnVsLFxubWVudSB7XG4gIGxpc3Qtc3R5bGU6IG5vbmU7XG4gIG1hcmdpbjogMDtcbiAgcGFkZGluZzogMDtcbn1cblxuLypcblJlc2V0IGRlZmF1bHQgc3R5bGluZyBmb3IgZGlhbG9ncy5cbiovXG5kaWFsb2cge1xuICBwYWRkaW5nOiAwO1xufVxuXG4vKlxuUHJldmVudCByZXNpemluZyB0ZXh0YXJlYXMgaG9yaXpvbnRhbGx5IGJ5IGRlZmF1bHQuXG4qL1xuXG50ZXh0YXJlYSB7XG4gIHJlc2l6ZTogdmVydGljYWw7XG59XG5cbi8qXG4xLiBSZXNldCB0aGUgZGVmYXVsdCBwbGFjZWhvbGRlciBvcGFjaXR5IGluIEZpcmVmb3guIChodHRwczovL2dpdGh1Yi5jb20vdGFpbHdpbmRsYWJzL3RhaWx3aW5kY3NzL2lzc3Vlcy8zMzAwKVxuMi4gU2V0IHRoZSBkZWZhdWx0IHBsYWNlaG9sZGVyIGNvbG9yIHRvIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBncmF5IDQwMCBjb2xvci5cbiovXG5cbmlucHV0OjotbW96LXBsYWNlaG9sZGVyLCB0ZXh0YXJlYTo6LW1vei1wbGFjZWhvbGRlciB7XG4gIG9wYWNpdHk6IDE7IC8qIDEgKi9cbiAgY29sb3I6ICM5Y2EzYWY7IC8qIDIgKi9cbn1cblxuaW5wdXQ6OnBsYWNlaG9sZGVyLFxudGV4dGFyZWE6OnBsYWNlaG9sZGVyIHtcbiAgb3BhY2l0eTogMTsgLyogMSAqL1xuICBjb2xvcjogIzljYTNhZjsgLyogMiAqL1xufVxuXG4vKlxuU2V0IHRoZSBkZWZhdWx0IGN1cnNvciBmb3IgYnV0dG9ucy5cbiovXG5cbmJ1dHRvbixcbltyb2xlPVwiYnV0dG9uXCJdIHtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuXG4vKlxuTWFrZSBzdXJlIGRpc2FibGVkIGJ1dHRvbnMgZG9uJ3QgZ2V0IHRoZSBwb2ludGVyIGN1cnNvci5cbiovXG46ZGlzYWJsZWQge1xuICBjdXJzb3I6IGRlZmF1bHQ7XG59XG5cbi8qXG4xLiBNYWtlIHJlcGxhY2VkIGVsZW1lbnRzIFxcYGRpc3BsYXk6IGJsb2NrXFxgIGJ5IGRlZmF1bHQuIChodHRwczovL2dpdGh1Yi5jb20vbW96ZGV2cy9jc3NyZW1lZHkvaXNzdWVzLzE0KVxuMi4gQWRkIFxcYHZlcnRpY2FsLWFsaWduOiBtaWRkbGVcXGAgdG8gYWxpZ24gcmVwbGFjZWQgZWxlbWVudHMgbW9yZSBzZW5zaWJseSBieSBkZWZhdWx0LiAoaHR0cHM6Ly9naXRodWIuY29tL2plbnNpbW1vbnMvY3NzcmVtZWR5L2lzc3Vlcy8xNCNpc3N1ZWNvbW1lbnQtNjM0OTM0MjEwKVxuICAgVGhpcyBjYW4gdHJpZ2dlciBhIHBvb3JseSBjb25zaWRlcmVkIGxpbnQgZXJyb3IgaW4gc29tZSB0b29scyBidXQgaXMgaW5jbHVkZWQgYnkgZGVzaWduLlxuKi9cblxuaW1nLFxuc3ZnLFxudmlkZW8sXG5jYW52YXMsXG5hdWRpbyxcbmlmcmFtZSxcbmVtYmVkLFxub2JqZWN0IHtcbiAgZGlzcGxheTogYmxvY2s7IC8qIDEgKi9cbiAgdmVydGljYWwtYWxpZ246IG1pZGRsZTsgLyogMiAqL1xufVxuXG4vKlxuQ29uc3RyYWluIGltYWdlcyBhbmQgdmlkZW9zIHRvIHRoZSBwYXJlbnQgd2lkdGggYW5kIHByZXNlcnZlIHRoZWlyIGludHJpbnNpYyBhc3BlY3QgcmF0aW8uIChodHRwczovL2dpdGh1Yi5jb20vbW96ZGV2cy9jc3NyZW1lZHkvaXNzdWVzLzE0KVxuKi9cblxuaW1nLFxudmlkZW8ge1xuICBtYXgtd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogYXV0bztcbn1cblxuLyogTWFrZSBlbGVtZW50cyB3aXRoIHRoZSBIVE1MIGhpZGRlbiBhdHRyaWJ1dGUgc3RheSBoaWRkZW4gYnkgZGVmYXVsdCAqL1xuW2hpZGRlbl0ge1xuICBkaXNwbGF5OiBub25lO1xufVxuXG4qLCA6OmJlZm9yZSwgOjphZnRlciB7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteDogMDtcbiAgLS10dy1ib3JkZXItc3BhY2luZy15OiAwO1xuICAtLXR3LXRyYW5zbGF0ZS14OiAwO1xuICAtLXR3LXRyYW5zbGF0ZS15OiAwO1xuICAtLXR3LXJvdGF0ZTogMDtcbiAgLS10dy1za2V3LXg6IDA7XG4gIC0tdHctc2tldy15OiAwO1xuICAtLXR3LXNjYWxlLXg6IDE7XG4gIC0tdHctc2NhbGUteTogMTtcbiAgLS10dy1wYW4teDogIDtcbiAgLS10dy1wYW4teTogIDtcbiAgLS10dy1waW5jaC16b29tOiAgO1xuICAtLXR3LXNjcm9sbC1zbmFwLXN0cmljdG5lc3M6IHByb3hpbWl0eTtcbiAgLS10dy1ncmFkaWVudC1mcm9tLXBvc2l0aW9uOiAgO1xuICAtLXR3LWdyYWRpZW50LXZpYS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC10by1wb3NpdGlvbjogIDtcbiAgLS10dy1vcmRpbmFsOiAgO1xuICAtLXR3LXNsYXNoZWQtemVybzogIDtcbiAgLS10dy1udW1lcmljLWZpZ3VyZTogIDtcbiAgLS10dy1udW1lcmljLXNwYWNpbmc6ICA7XG4gIC0tdHctbnVtZXJpYy1mcmFjdGlvbjogIDtcbiAgLS10dy1yaW5nLWluc2V0OiAgO1xuICAtLXR3LXJpbmctb2Zmc2V0LXdpZHRoOiAwcHg7XG4gIC0tdHctcmluZy1vZmZzZXQtY29sb3I6ICNmZmY7XG4gIC0tdHctcmluZy1jb2xvcjogcmdiKDU5IDEzMCAyNDYgLyAwLjUpO1xuICAtLXR3LXJpbmctb2Zmc2V0LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXJpbmctc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctc2hhZG93LWNvbG9yZWQ6IDAgMCAjMDAwMDtcbiAgLS10dy1ibHVyOiAgO1xuICAtLXR3LWJyaWdodG5lc3M6ICA7XG4gIC0tdHctY29udHJhc3Q6ICA7XG4gIC0tdHctZ3JheXNjYWxlOiAgO1xuICAtLXR3LWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctaW52ZXJ0OiAgO1xuICAtLXR3LXNhdHVyYXRlOiAgO1xuICAtLXR3LXNlcGlhOiAgO1xuICAtLXR3LWRyb3Atc2hhZG93OiAgO1xuICAtLXR3LWJhY2tkcm9wLWJsdXI6ICA7XG4gIC0tdHctYmFja2Ryb3AtYnJpZ2h0bmVzczogIDtcbiAgLS10dy1iYWNrZHJvcC1jb250cmFzdDogIDtcbiAgLS10dy1iYWNrZHJvcC1ncmF5c2NhbGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaHVlLXJvdGF0ZTogIDtcbiAgLS10dy1iYWNrZHJvcC1pbnZlcnQ6ICA7XG4gIC0tdHctYmFja2Ryb3Atb3BhY2l0eTogIDtcbiAgLS10dy1iYWNrZHJvcC1zYXR1cmF0ZTogIDtcbiAgLS10dy1iYWNrZHJvcC1zZXBpYTogIDtcbn1cblxuOjpiYWNrZHJvcCB7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteDogMDtcbiAgLS10dy1ib3JkZXItc3BhY2luZy15OiAwO1xuICAtLXR3LXRyYW5zbGF0ZS14OiAwO1xuICAtLXR3LXRyYW5zbGF0ZS15OiAwO1xuICAtLXR3LXJvdGF0ZTogMDtcbiAgLS10dy1za2V3LXg6IDA7XG4gIC0tdHctc2tldy15OiAwO1xuICAtLXR3LXNjYWxlLXg6IDE7XG4gIC0tdHctc2NhbGUteTogMTtcbiAgLS10dy1wYW4teDogIDtcbiAgLS10dy1wYW4teTogIDtcbiAgLS10dy1waW5jaC16b29tOiAgO1xuICAtLXR3LXNjcm9sbC1zbmFwLXN0cmljdG5lc3M6IHByb3hpbWl0eTtcbiAgLS10dy1ncmFkaWVudC1mcm9tLXBvc2l0aW9uOiAgO1xuICAtLXR3LWdyYWRpZW50LXZpYS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC10by1wb3NpdGlvbjogIDtcbiAgLS10dy1vcmRpbmFsOiAgO1xuICAtLXR3LXNsYXNoZWQtemVybzogIDtcbiAgLS10dy1udW1lcmljLWZpZ3VyZTogIDtcbiAgLS10dy1udW1lcmljLXNwYWNpbmc6ICA7XG4gIC0tdHctbnVtZXJpYy1mcmFjdGlvbjogIDtcbiAgLS10dy1yaW5nLWluc2V0OiAgO1xuICAtLXR3LXJpbmctb2Zmc2V0LXdpZHRoOiAwcHg7XG4gIC0tdHctcmluZy1vZmZzZXQtY29sb3I6ICNmZmY7XG4gIC0tdHctcmluZy1jb2xvcjogcmdiKDU5IDEzMCAyNDYgLyAwLjUpO1xuICAtLXR3LXJpbmctb2Zmc2V0LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXJpbmctc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctc2hhZG93LWNvbG9yZWQ6IDAgMCAjMDAwMDtcbiAgLS10dy1ibHVyOiAgO1xuICAtLXR3LWJyaWdodG5lc3M6ICA7XG4gIC0tdHctY29udHJhc3Q6ICA7XG4gIC0tdHctZ3JheXNjYWxlOiAgO1xuICAtLXR3LWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctaW52ZXJ0OiAgO1xuICAtLXR3LXNhdHVyYXRlOiAgO1xuICAtLXR3LXNlcGlhOiAgO1xuICAtLXR3LWRyb3Atc2hhZG93OiAgO1xuICAtLXR3LWJhY2tkcm9wLWJsdXI6ICA7XG4gIC0tdHctYmFja2Ryb3AtYnJpZ2h0bmVzczogIDtcbiAgLS10dy1iYWNrZHJvcC1jb250cmFzdDogIDtcbiAgLS10dy1iYWNrZHJvcC1ncmF5c2NhbGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaHVlLXJvdGF0ZTogIDtcbiAgLS10dy1iYWNrZHJvcC1pbnZlcnQ6ICA7XG4gIC0tdHctYmFja2Ryb3Atb3BhY2l0eTogIDtcbiAgLS10dy1iYWNrZHJvcC1zYXR1cmF0ZTogIDtcbiAgLS10dy1iYWNrZHJvcC1zZXBpYTogIDtcbn1cbi5jb250YWluZXIge1xuICB3aWR0aDogMTAwJTtcbn1cbkBtZWRpYSAobWluLXdpZHRoOiA2NDBweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogNjQwcHg7XG4gIH1cbn1cbkBtZWRpYSAobWluLXdpZHRoOiA3NjhweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogNzY4cHg7XG4gIH1cbn1cbkBtZWRpYSAobWluLXdpZHRoOiAxMDI0cHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDEwMjRweDtcbiAgfVxufVxuQG1lZGlhIChtaW4td2lkdGg6IDEyODBweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogMTI4MHB4O1xuICB9XG59XG5AbWVkaWEgKG1pbi13aWR0aDogMTUzNnB4KSB7XG5cbiAgLmNvbnRhaW5lciB7XG4gICAgbWF4LXdpZHRoOiAxNTM2cHg7XG4gIH1cbn1cbi5wb2ludGVyLWV2ZW50cy1ub25lIHtcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG4udmlzaWJsZSB7XG4gIHZpc2liaWxpdHk6IHZpc2libGU7XG59XG4uY29sbGFwc2Uge1xuICB2aXNpYmlsaXR5OiBjb2xsYXBzZTtcbn1cbi5yZWxhdGl2ZSB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbn1cbi5tLTUge1xuICBtYXJnaW46IDEuMjVyZW07XG59XG4ubS04IHtcbiAgbWFyZ2luOiAycmVtO1xufVxuLm1sLTEwIHtcbiAgbWFyZ2luLWxlZnQ6IDIuNXJlbTtcbn1cbi5tbC04IHtcbiAgbWFyZ2luLWxlZnQ6IDJyZW07XG59XG4uYmxvY2sge1xuICBkaXNwbGF5OiBibG9jaztcbn1cbi5mbGV4IHtcbiAgZGlzcGxheTogZmxleDtcbn1cbi50YWJsZSB7XG4gIGRpc3BsYXk6IHRhYmxlO1xufVxuLmdyaWQge1xuICBkaXNwbGF5OiBncmlkO1xufVxuLmNvbnRlbnRzIHtcbiAgZGlzcGxheTogY29udGVudHM7XG59XG4uaGlkZGVuIHtcbiAgZGlzcGxheTogbm9uZTtcbn1cbi5oLTEge1xuICBoZWlnaHQ6IDAuMjVyZW07XG59XG4uaC0xXFxcXC81IHtcbiAgaGVpZ2h0OiAyMCU7XG59XG4uaC00IHtcbiAgaGVpZ2h0OiAxcmVtO1xufVxuLmgtNFxcXFwvNSB7XG4gIGhlaWdodDogODAlO1xufVxuLmgtNDAge1xuICBoZWlnaHQ6IDEwcmVtO1xufVxuLmgtNiB7XG4gIGhlaWdodDogMS41cmVtO1xufVxuLmgtbWF4IHtcbiAgaGVpZ2h0OiAtbW96LW1heC1jb250ZW50O1xuICBoZWlnaHQ6IG1heC1jb250ZW50O1xufVxuLnctMSB7XG4gIHdpZHRoOiAwLjI1cmVtO1xufVxuLnctMVxcXFwvMiB7XG4gIHdpZHRoOiA1MCU7XG59XG4udy00IHtcbiAgd2lkdGg6IDFyZW07XG59XG4udy00XFxcXC8xMiB7XG4gIHdpZHRoOiAzMy4zMzMzMzMlO1xufVxuLnctNiB7XG4gIHdpZHRoOiAxLjVyZW07XG59XG4udy1hdXRvIHtcbiAgd2lkdGg6IGF1dG87XG59XG4udy1mdWxsIHtcbiAgd2lkdGg6IDEwMCU7XG59XG4ubWluLXctNDQge1xuICBtaW4td2lkdGg6IDExcmVtO1xufVxuLm1pbi13LW1heCB7XG4gIG1pbi13aWR0aDogLW1vei1tYXgtY29udGVudDtcbiAgbWluLXdpZHRoOiBtYXgtY29udGVudDtcbn1cbi5taW4tdy1taW4ge1xuICBtaW4td2lkdGg6IC1tb3otbWluLWNvbnRlbnQ7XG4gIG1pbi13aWR0aDogbWluLWNvbnRlbnQ7XG59XG4uZmxleC0xIHtcbiAgZmxleDogMSAxIDAlO1xufVxuLmZsZXgtbm9uZSB7XG4gIGZsZXg6IG5vbmU7XG59XG4uYm9yZGVyLWNvbGxhcHNlIHtcbiAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTtcbn1cbi50cmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSh2YXIoLS10dy10cmFuc2xhdGUteCksIHZhcigtLXR3LXRyYW5zbGF0ZS15KSkgcm90YXRlKHZhcigtLXR3LXJvdGF0ZSkpIHNrZXdYKHZhcigtLXR3LXNrZXcteCkpIHNrZXdZKHZhcigtLXR3LXNrZXcteSkpIHNjYWxlWCh2YXIoLS10dy1zY2FsZS14KSkgc2NhbGVZKHZhcigtLXR3LXNjYWxlLXkpKTtcbn1cbi5jdXJzb3ItZGVmYXVsdCB7XG4gIGN1cnNvcjogZGVmYXVsdDtcbn1cbi5jdXJzb3ItaGVscCB7XG4gIGN1cnNvcjogaGVscDtcbn1cbi5jdXJzb3ItcG9pbnRlciB7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5jdXJzb3ItdGV4dCB7XG4gIGN1cnNvcjogdGV4dDtcbn1cbi5yZXNpemUge1xuICByZXNpemU6IGJvdGg7XG59XG4uYXV0by1yb3dzLW1pbiB7XG4gIGdyaWQtYXV0by1yb3dzOiBtaW4tY29udGVudDtcbn1cbi5ncmlkLWNvbHMtMTEge1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgxMSwgbWlubWF4KDAsIDFmcikpO1xufVxuLmZsZXgtcm93IHtcbiAgZmxleC1kaXJlY3Rpb246IHJvdztcbn1cbi5mbGV4LWNvbCB7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG59XG4uaXRlbXMtY2VudGVyIHtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cbi5qdXN0aWZ5LXN0YXJ0IHtcbiAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0O1xufVxuLmp1c3RpZnktY2VudGVyIHtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG59XG4uanVzdGlmeS1iZXR3ZWVuIHtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xufVxuLmp1c3RpZnktYXJvdW5kIHtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1hcm91bmQ7XG59XG4uZ2FwLTEge1xuICBnYXA6IDAuMjVyZW07XG59XG4uZ2FwLTEwIHtcbiAgZ2FwOiAyLjVyZW07XG59XG4uZ2FwLTIge1xuICBnYXA6IDAuNXJlbTtcbn1cbi5nYXAtNiB7XG4gIGdhcDogMS41cmVtO1xufVxuLm92ZXJmbG93LWF1dG8ge1xuICBvdmVyZmxvdzogYXV0bztcbn1cbi5yb3VuZGVkLWZ1bGwge1xuICBib3JkZXItcmFkaXVzOiA5OTk5cHg7XG59XG4ucm91bmRlZC14bCB7XG4gIGJvcmRlci1yYWRpdXM6IDAuNzVyZW07XG59XG4uYm9yZGVyIHtcbiAgYm9yZGVyLXdpZHRoOiAxcHg7XG59XG4uYm9yZGVyLXNvbGlkIHtcbiAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcbn1cbi5ib3JkZXItYmx1ZS04MDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigzMCA2NCAxNzUgLyB2YXIoLS10dy1ib3JkZXItb3BhY2l0eSkpO1xufVxuLmJvcmRlci1ncmF5LTgwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDMxIDQxIDU1IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItZ3JlZW4tNjAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMjIgMTYzIDc0IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItb3JhbmdlLTQwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDI1MSAxNDYgNjAgLyB2YXIoLS10dy1ib3JkZXItb3BhY2l0eSkpO1xufVxuLmJvcmRlci1yZWQtNzAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMTg1IDI4IDI4IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5iZy1ncmF5LTEwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDI0MyAyNDQgMjQ2IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWdyYXktMjAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjI5IDIzMSAyMzUgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS00MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigxNTYgMTYzIDE3NSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1ncmF5LTYwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDc1IDg1IDk5IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWdyYXktNzAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoNTUgNjUgODEgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS04MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigzMSA0MSA1NSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1saW1lLTYwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDEwMSAxNjMgMTMgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctb3JhbmdlLTQwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDI1MSAxNDYgNjAgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctc2t5LTcwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDMgMTA1IDE2MSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5wLTEge1xuICBwYWRkaW5nOiAwLjI1cmVtO1xufVxuLnAtMiB7XG4gIHBhZGRpbmc6IDAuNXJlbTtcbn1cbi5wLTQge1xuICBwYWRkaW5nOiAxcmVtO1xufVxuLnAtNiB7XG4gIHBhZGRpbmc6IDEuNXJlbTtcbn1cbi5weC0zIHtcbiAgcGFkZGluZy1sZWZ0OiAwLjc1cmVtO1xuICBwYWRkaW5nLXJpZ2h0OiAwLjc1cmVtO1xufVxuLnB4LTQge1xuICBwYWRkaW5nLWxlZnQ6IDFyZW07XG4gIHBhZGRpbmctcmlnaHQ6IDFyZW07XG59XG4ucHgtNiB7XG4gIHBhZGRpbmctbGVmdDogMS41cmVtO1xuICBwYWRkaW5nLXJpZ2h0OiAxLjVyZW07XG59XG4ucHktMSB7XG4gIHBhZGRpbmctdG9wOiAwLjI1cmVtO1xuICBwYWRkaW5nLWJvdHRvbTogMC4yNXJlbTtcbn1cbi5weS0yIHtcbiAgcGFkZGluZy10b3A6IDAuNXJlbTtcbiAgcGFkZGluZy1ib3R0b206IDAuNXJlbTtcbn1cbi5weS00IHtcbiAgcGFkZGluZy10b3A6IDFyZW07XG4gIHBhZGRpbmctYm90dG9tOiAxcmVtO1xufVxuLnBsLTIge1xuICBwYWRkaW5nLWxlZnQ6IDAuNXJlbTtcbn1cbi5wbC01IHtcbiAgcGFkZGluZy1sZWZ0OiAxLjI1cmVtO1xufVxuLnBsLTgge1xuICBwYWRkaW5nLWxlZnQ6IDJyZW07XG59XG4udGV4dC1jZW50ZXIge1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG59XG4udGV4dC1zbSB7XG4gIGZvbnQtc2l6ZTogMC44NzVyZW07XG4gIGxpbmUtaGVpZ2h0OiAxLjI1cmVtO1xufVxuLnRleHQtZ3JheS03MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYig1NSA2NSA4MSAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtZ3JheS04MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigzMSA0MSA1NSAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtbGltZS02MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigxMDEgMTYzIDEzIC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1vcmFuZ2UtNTAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMjQ5IDExNSAyMiAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtb3JhbmdlLTYwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDIzNCA4OCAxMiAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtcmVkLTUwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDIzOSA2OCA2OCAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtcmVkLTcwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDE4NSAyOCAyOCAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtcm9zZS03MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigxOTAgMTggNjAgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXNreS02MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigyIDEzMiAxOTkgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXRlYWwtOTAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTkgNzggNzQgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi51bmRlcmxpbmUge1xuICB0ZXh0LWRlY29yYXRpb24tbGluZTogdW5kZXJsaW5lO1xufVxuLm91dGxpbmUge1xuICBvdXRsaW5lLXN0eWxlOiBzb2xpZDtcbn1cbi5maWx0ZXIge1xuICBmaWx0ZXI6IHZhcigtLXR3LWJsdXIpIHZhcigtLXR3LWJyaWdodG5lc3MpIHZhcigtLXR3LWNvbnRyYXN0KSB2YXIoLS10dy1ncmF5c2NhbGUpIHZhcigtLXR3LWh1ZS1yb3RhdGUpIHZhcigtLXR3LWludmVydCkgdmFyKC0tdHctc2F0dXJhdGUpIHZhcigtLXR3LXNlcGlhKSB2YXIoLS10dy1kcm9wLXNoYWRvdyk7XG59XG4uaG92ZXJcXFxcOmJnLW9yYW5nZS01MDA6aG92ZXIge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyNDkgMTE1IDIyIC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufWAsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL3N0eWxlcy5j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O0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSx3QkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsMkJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsMkJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSxxQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxrQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxtQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxpQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLG1CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUZuQjtFQUFBLGtCQUVvQjtFQUZwQjtBQUVvQlwiLFwic291cmNlc0NvbnRlbnRcIjpbXCJAdGFpbHdpbmQgYmFzZTtcXG5AdGFpbHdpbmQgY29tcG9uZW50cztcXG5AdGFpbHdpbmQgdXRpbGl0aWVzO1wiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTtcblxuICAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbihcIlwiKTtcbiAgfTtcblxuICAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCB0aGlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZhciBpZCA9IHRoaXNba11bMF07XG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3VwcG9ydHMpIHtcbiAgICAgICAgaWYgKCFpdGVtWzRdKSB7XG4gICAgICAgICAgaXRlbVs0XSA9IFwiXCIuY29uY2F0KHN1cHBvcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNF0gPSBzdXBwb3J0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuICBpZiAoIWNzc01hcHBpbmcpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi9ub2RlX21vZHVsZXMvcG9zdGNzcy1sb2FkZXIvZGlzdC9janMuanM/P3J1bGVTZXRbMV0ucnVsZXNbMV0udXNlWzJdIS4vc3R5bGVzLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4uL25vZGVfbW9kdWxlcy9wb3N0Y3NzLWxvYWRlci9kaXN0L2Nqcy5qcz8/cnVsZVNldFsxXS5ydWxlc1sxXS51c2VbMl0hLi9zdHlsZXMuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzdHlsZXNJbkRPTSA9IFtdO1xuZnVuY3Rpb24gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuICB2YXIgcmVzdWx0ID0gLTE7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGlkQ291bnRNYXAgPSB7fTtcbiAgdmFyIGlkZW50aWZpZXJzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuICAgIGlmIChpbmRleEJ5SWRlbnRpZmllciAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXBkYXRlciA9IGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5ieUluZGV4ID0gaTtcbiAgICAgIHN0eWxlc0luRE9NLnNwbGljZShpLCAwLCB7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IHVwZGF0ZXIsXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cbmZ1bmN0aW9uIGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIGFwaSA9IG9wdGlvbnMuZG9tQVBJKG9wdGlvbnMpO1xuICBhcGkudXBkYXRlKG9iaik7XG4gIHZhciB1cGRhdGVyID0gZnVuY3Rpb24gdXBkYXRlcihuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwICYmIG5ld09iai5zdXBwb3J0cyA9PT0gb2JqLnN1cHBvcnRzICYmIG5ld09iai5sYXllciA9PT0gb2JqLmxheWVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHVwZGF0ZXI7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXN0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgX2lkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbX2ldO1xuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcbiAgICAgIGlmIChzdHlsZXNJbkRPTVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5ET01bX2luZGV4XS51cGRhdGVyKCk7XG4gICAgICAgIHN0eWxlc0luRE9NLnNwbGljZShfaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7XG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG4gICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gc3R5bGVUYXJnZXQuY29udGVudERvY3VtZW50LmhlYWQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cbiAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRCeVNlbGVjdG9yKGluc2VydCwgc3R5bGUpIHtcbiAgdmFyIHRhcmdldCA9IGdldFRhcmdldChpbnNlcnQpO1xuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cbiAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0QnlTZWxlY3RvcjsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgb3B0aW9ucy5zZXRBdHRyaWJ1dGVzKGVsZW1lbnQsIG9wdGlvbnMuYXR0cmlidXRlcyk7XG4gIG9wdGlvbnMuaW5zZXJ0KGVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG4gIHJldHVybiBlbGVtZW50O1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG4gIGlmIChub25jZSkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBub25jZSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKSB7XG4gIHZhciBjc3MgPSBcIlwiO1xuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIik7XG4gIH1cbiAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBvYmoubGF5ZXIgIT09IFwidW5kZWZpbmVkXCI7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cbiAgY3NzICs9IG9iai5jc3M7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH1cblxuICAvLyBGb3Igb2xkIElFXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cbiAgb3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGRvbUFQSShvcHRpb25zKSB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoKSB7fSxcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICB9O1xuICB9XG4gIHZhciBzdHlsZUVsZW1lbnQgPSBvcHRpb25zLmluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgcmV0dXJuIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShvYmopIHtcbiAgICAgIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG4gICAgfVxuICB9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzdHlsZVRhZ1RyYW5zZm9ybTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwidmFyIHdlYnBhY2tRdWV1ZXMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2woXCJ3ZWJwYWNrIHF1ZXVlc1wiKSA6IFwiX193ZWJwYWNrX3F1ZXVlc19fXCI7XG52YXIgd2VicGFja0V4cG9ydHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2woXCJ3ZWJwYWNrIGV4cG9ydHNcIikgOiBcIl9fd2VicGFja19leHBvcnRzX19cIjtcbnZhciB3ZWJwYWNrRXJyb3IgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2woXCJ3ZWJwYWNrIGVycm9yXCIpIDogXCJfX3dlYnBhY2tfZXJyb3JfX1wiO1xudmFyIHJlc29sdmVRdWV1ZSA9IChxdWV1ZSkgPT4ge1xuXHRpZihxdWV1ZSAmJiBxdWV1ZS5kIDwgMSkge1xuXHRcdHF1ZXVlLmQgPSAxO1xuXHRcdHF1ZXVlLmZvckVhY2goKGZuKSA9PiAoZm4uci0tKSk7XG5cdFx0cXVldWUuZm9yRWFjaCgoZm4pID0+IChmbi5yLS0gPyBmbi5yKysgOiBmbigpKSk7XG5cdH1cbn1cbnZhciB3cmFwRGVwcyA9IChkZXBzKSA9PiAoZGVwcy5tYXAoKGRlcCkgPT4ge1xuXHRpZihkZXAgIT09IG51bGwgJiYgdHlwZW9mIGRlcCA9PT0gXCJvYmplY3RcIikge1xuXHRcdGlmKGRlcFt3ZWJwYWNrUXVldWVzXSkgcmV0dXJuIGRlcDtcblx0XHRpZihkZXAudGhlbikge1xuXHRcdFx0dmFyIHF1ZXVlID0gW107XG5cdFx0XHRxdWV1ZS5kID0gMDtcblx0XHRcdGRlcC50aGVuKChyKSA9PiB7XG5cdFx0XHRcdG9ialt3ZWJwYWNrRXhwb3J0c10gPSByO1xuXHRcdFx0XHRyZXNvbHZlUXVldWUocXVldWUpO1xuXHRcdFx0fSwgKGUpID0+IHtcblx0XHRcdFx0b2JqW3dlYnBhY2tFcnJvcl0gPSBlO1xuXHRcdFx0XHRyZXNvbHZlUXVldWUocXVldWUpO1xuXHRcdFx0fSk7XG5cdFx0XHR2YXIgb2JqID0ge307XG5cdFx0XHRvYmpbd2VicGFja1F1ZXVlc10gPSAoZm4pID0+IChmbihxdWV1ZSkpO1xuXHRcdFx0cmV0dXJuIG9iajtcblx0XHR9XG5cdH1cblx0dmFyIHJldCA9IHt9O1xuXHRyZXRbd2VicGFja1F1ZXVlc10gPSB4ID0+IHt9O1xuXHRyZXRbd2VicGFja0V4cG9ydHNdID0gZGVwO1xuXHRyZXR1cm4gcmV0O1xufSkpO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5hID0gKG1vZHVsZSwgYm9keSwgaGFzQXdhaXQpID0+IHtcblx0dmFyIHF1ZXVlO1xuXHRoYXNBd2FpdCAmJiAoKHF1ZXVlID0gW10pLmQgPSAtMSk7XG5cdHZhciBkZXBRdWV1ZXMgPSBuZXcgU2V0KCk7XG5cdHZhciBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHM7XG5cdHZhciBjdXJyZW50RGVwcztcblx0dmFyIG91dGVyUmVzb2x2ZTtcblx0dmFyIHJlamVjdDtcblx0dmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqKSA9PiB7XG5cdFx0cmVqZWN0ID0gcmVqO1xuXHRcdG91dGVyUmVzb2x2ZSA9IHJlc29sdmU7XG5cdH0pO1xuXHRwcm9taXNlW3dlYnBhY2tFeHBvcnRzXSA9IGV4cG9ydHM7XG5cdHByb21pc2Vbd2VicGFja1F1ZXVlc10gPSAoZm4pID0+IChxdWV1ZSAmJiBmbihxdWV1ZSksIGRlcFF1ZXVlcy5mb3JFYWNoKGZuKSwgcHJvbWlzZVtcImNhdGNoXCJdKHggPT4ge30pKTtcblx0bW9kdWxlLmV4cG9ydHMgPSBwcm9taXNlO1xuXHRib2R5KChkZXBzKSA9PiB7XG5cdFx0Y3VycmVudERlcHMgPSB3cmFwRGVwcyhkZXBzKTtcblx0XHR2YXIgZm47XG5cdFx0dmFyIGdldFJlc3VsdCA9ICgpID0+IChjdXJyZW50RGVwcy5tYXAoKGQpID0+IHtcblx0XHRcdGlmKGRbd2VicGFja0Vycm9yXSkgdGhyb3cgZFt3ZWJwYWNrRXJyb3JdO1xuXHRcdFx0cmV0dXJuIGRbd2VicGFja0V4cG9ydHNdO1xuXHRcdH0pKVxuXHRcdHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdGZuID0gKCkgPT4gKHJlc29sdmUoZ2V0UmVzdWx0KSk7XG5cdFx0XHRmbi5yID0gMDtcblx0XHRcdHZhciBmblF1ZXVlID0gKHEpID0+IChxICE9PSBxdWV1ZSAmJiAhZGVwUXVldWVzLmhhcyhxKSAmJiAoZGVwUXVldWVzLmFkZChxKSwgcSAmJiAhcS5kICYmIChmbi5yKyssIHEucHVzaChmbikpKSk7XG5cdFx0XHRjdXJyZW50RGVwcy5tYXAoKGRlcCkgPT4gKGRlcFt3ZWJwYWNrUXVldWVzXShmblF1ZXVlKSkpO1xuXHRcdH0pO1xuXHRcdHJldHVybiBmbi5yID8gcHJvbWlzZSA6IGdldFJlc3VsdCgpO1xuXHR9LCAoZXJyKSA9PiAoKGVyciA/IHJlamVjdChwcm9taXNlW3dlYnBhY2tFcnJvcl0gPSBlcnIpIDogb3V0ZXJSZXNvbHZlKGV4cG9ydHMpKSwgcmVzb2x2ZVF1ZXVlKHF1ZXVlKSkpO1xuXHRxdWV1ZSAmJiBxdWV1ZS5kIDwgMCAmJiAocXVldWUuZCA9IDApO1xufTsiLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm5jID0gdW5kZWZpbmVkOyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgdXNlZCAnbW9kdWxlJyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9pbmRleC5qc1wiKTtcbiIsIiJdLCJuYW1lcyI6WyJHYW1lYm9hcmQiLCJncmlkIiwic2hpcHNUb1BsYWNlIiwic2hpcFR5cGUiLCJzaGlwTGVuZ3RoIiwiaGl0Q2xyIiwibWlzc0NsciIsImVycm9yQ2xyIiwiZGVmYXVsdENsciIsInByaW1hcnlIb3ZlckNsciIsInNlY29uZGFyeUhvdmVyQ2xyIiwiY3VycmVudE9yaWVudGF0aW9uIiwiY3VycmVudFNoaXAiLCJsYXN0SG92ZXJlZENlbGwiLCJwbGFjZVNoaXBHdWlkZSIsInByb21wdCIsInByb21wdFR5cGUiLCJnYW1lcGxheUd1aWRlIiwidHVyblByb21wdCIsInByb2Nlc3NDb21tYW5kIiwiY29tbWFuZCIsImlzTW92ZSIsInBhcnRzIiwic3BsaXQiLCJsZW5ndGgiLCJFcnJvciIsImdyaWRQb3NpdGlvbiIsInRvVXBwZXJDYXNlIiwidmFsaWRHcmlkUG9zaXRpb25zIiwiZmxhdCIsImluY2x1ZGVzIiwicmVzdWx0Iiwib3JpZW50YXRpb24iLCJ0b0xvd2VyQ2FzZSIsInVwZGF0ZU91dHB1dCIsIm1lc3NhZ2UiLCJ0eXBlIiwib3V0cHV0IiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsIm1lc3NhZ2VFbGVtZW50IiwiY3JlYXRlRWxlbWVudCIsInRleHRDb250ZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwiYXBwZW5kQ2hpbGQiLCJzY3JvbGxUb3AiLCJzY3JvbGxIZWlnaHQiLCJjb25zb2xlTG9nUGxhY2VtZW50Q29tbWFuZCIsImRpckZlZWJhY2siLCJjaGFyQXQiLCJzbGljZSIsImNvbnNvbGUiLCJsb2ciLCJ2YWx1ZSIsImNvbnNvbGVMb2dNb3ZlQ29tbWFuZCIsInJlc3VsdHNPYmplY3QiLCJwbGF5ZXIiLCJtb3ZlIiwiaGl0IiwiY29uc29sZUxvZ0Vycm9yIiwiZXJyb3IiLCJpbml0VWlNYW5hZ2VyIiwidWlNYW5hZ2VyIiwiaW5pdENvbnNvbGVVSSIsImNyZWF0ZUdhbWVib2FyZCIsImNhbGN1bGF0ZVNoaXBDZWxscyIsInN0YXJ0Q2VsbCIsImNlbGxJZHMiLCJyb3dJbmRleCIsImNoYXJDb2RlQXQiLCJjb2xJbmRleCIsInBhcnNlSW50Iiwic3Vic3RyaW5nIiwiaSIsInB1c2giLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJoaWdobGlnaHRDZWxscyIsImZvckVhY2giLCJjZWxsSWQiLCJjZWxsRWxlbWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJjbGVhckhpZ2hsaWdodCIsInJlbW92ZSIsInRvZ2dsZU9yaWVudGF0aW9uIiwiaGFuZGxlUGxhY2VtZW50SG92ZXIiLCJlIiwiY2VsbCIsInRhcmdldCIsImNvbnRhaW5zIiwiZGF0YXNldCIsImNlbGxQb3MiLCJwb3NpdGlvbiIsImNlbGxzVG9IaWdobGlnaHQiLCJoYW5kbGVNb3VzZUxlYXZlIiwiY2VsbHNUb0NsZWFyIiwiaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUiLCJrZXkiLCJwcmV2ZW50RGVmYXVsdCIsIm9sZENlbGxzVG9DbGVhciIsIm5ld0NlbGxzVG9IaWdobGlnaHQiLCJlbmFibGVDb21wdXRlckdhbWVib2FyZEhvdmVyIiwicXVlcnlTZWxlY3RvckFsbCIsImRpc2FibGVDb21wdXRlckdhbWVib2FyZEhvdmVyIiwiY2VsbHNBcnJheSIsImRpc2FibGVIdW1hbkdhbWVib2FyZEhvdmVyIiwic3dpdGNoR2FtZWJvYXJkSG92ZXJTdGF0ZXMiLCJzZXR1cEdhbWVib2FyZEZvclBsYWNlbWVudCIsImNvbXBHYW1lYm9hcmRDZWxscyIsImFkZEV2ZW50TGlzdGVuZXIiLCJnYW1lYm9hcmRBcmVhIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImNsZWFudXBBZnRlclBsYWNlbWVudCIsInN0YXJ0R2FtZSIsImdhbWUiLCJzZXRVcCIsInNoaXAiLCJyZW5kZXJTaGlwRGlzcCIsInBsYXllcnMiLCJjb21wdXRlciIsImRpc3BsYXlQcm9tcHQiLCJoYW5kbGVIdW1hbk1vdmUiLCJkYXRhIiwic2V0dXBHYW1lYm9hcmRGb3JQbGF5ZXJNb3ZlIiwicGxheWVyTW92ZSIsImNvbXB1dGVyTW92ZSIsImh1bWFuUGxheWVyR2FtZWJvYXJkIiwiY29tcFBsYXllciIsImNvbXBNb3ZlUmVzdWx0IiwibWFrZU1vdmUiLCJjaGVja1dpbkNvbmRpdGlvbiIsImNvbmNsdWRlR2FtZSIsIkFjdGlvbkNvbnRyb2xsZXIiLCJodW1hblBsYXllciIsImh1bWFuIiwiZ2FtZWJvYXJkIiwiY29tcFBsYXllckdhbWVib2FyZCIsInNldHVwRXZlbnRMaXN0ZW5lcnMiLCJoYW5kbGVyRnVuY3Rpb24iLCJwbGF5ZXJUeXBlIiwiY2xlYW51cEZ1bmN0aW9ucyIsImNvbnNvbGVTdWJtaXRCdXR0b24iLCJjb25zb2xlSW5wdXQiLCJzdWJtaXRIYW5kbGVyIiwiaW5wdXQiLCJrZXlwcmVzc0hhbmRsZXIiLCJjbGlja0hhbmRsZXIiLCJjbGVhbnVwIiwicHJvbXB0QW5kUGxhY2VTaGlwIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJmaW5kIiwicGxhY2VTaGlwUHJvbXB0IiwiaGFuZGxlVmFsaWRJbnB1dCIsInBsYWNlU2hpcCIsInJlbmRlclNoaXBCb2FyZCIsInJlc29sdmVTaGlwUGxhY2VtZW50Iiwic2V0dXBTaGlwc1NlcXVlbnRpYWxseSIsImhhbmRsZVNldHVwIiwidXBkYXRlQ29tcHV0ZXJEaXNwbGF5cyIsImh1bWFuTW92ZVJlc3VsdCIsInBsYXllclNlbGVjdG9yIiwiZGlyIiwicHJvbXB0UGxheWVyTW92ZSIsInVuZGVmaW5lZCIsImhhbmRsZVZhbGlkTW92ZSIsInJlc29sdmVNb3ZlIiwicGxheUdhbWUiLCJnYW1lT3ZlciIsImxhc3RDb21wTW92ZVJlc3VsdCIsImxhc3RIdW1hbk1vdmVSZXN1bHQiLCJjdXJyZW50UGxheWVyIiwiT3ZlcmxhcHBpbmdTaGlwc0Vycm9yIiwiY29uc3RydWN0b3IiLCJuYW1lIiwiU2hpcEFsbG9jYXRpb25SZWFjaGVkRXJyb3IiLCJTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IiLCJJbnZhbGlkU2hpcExlbmd0aEVycm9yIiwiSW52YWxpZFNoaXBUeXBlRXJyb3IiLCJJbnZhbGlkUGxheWVyVHlwZUVycm9yIiwiU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IiLCJSZXBlYXRBdHRhY2tlZEVycm9yIiwiSW52YWxpZE1vdmVFbnRyeUVycm9yIiwiUGxheWVyIiwiU2hpcCIsIkdhbWUiLCJodW1hbkdhbWVib2FyZCIsImNvbXB1dGVyR2FtZWJvYXJkIiwiY29tcHV0ZXJQbGF5ZXIiLCJnYW1lT3ZlclN0YXRlIiwicGxhY2VTaGlwcyIsImVuZEdhbWUiLCJ0YWtlVHVybiIsImZlZWRiYWNrIiwib3Bwb25lbnQiLCJpc1NoaXBTdW5rIiwiZ2FtZVdvbiIsImNoZWNrQWxsU2hpcHNTdW5rIiwiaW5kZXhDYWxjcyIsInN0YXJ0IiwiY29sTGV0dGVyIiwicm93TnVtYmVyIiwiY2hlY2tUeXBlIiwic2hpcFBvc2l0aW9ucyIsIk9iamVjdCIsImtleXMiLCJleGlzdGluZ1NoaXBUeXBlIiwiY2hlY2tCb3VuZGFyaWVzIiwiY29vcmRzIiwiZGlyZWN0aW9uIiwieExpbWl0IiwieUxpbWl0IiwieCIsInkiLCJjYWxjdWxhdGVTaGlwUG9zaXRpb25zIiwicG9zaXRpb25zIiwiY2hlY2tGb3JPdmVybGFwIiwiZW50cmllcyIsImV4aXN0aW5nU2hpcFBvc2l0aW9ucyIsInNvbWUiLCJjaGVja0ZvckhpdCIsImZvdW5kU2hpcCIsIl8iLCJzaGlwRmFjdG9yeSIsInNoaXBzIiwiaGl0UG9zaXRpb25zIiwiYXR0YWNrTG9nIiwibmV3U2hpcCIsImF0dGFjayIsInJlc3BvbnNlIiwiY2hlY2tSZXN1bHRzIiwiaXNTdW5rIiwiZXZlcnkiLCJzaGlwUmVwb3J0IiwiZmxvYXRpbmdTaGlwcyIsImZpbHRlciIsIm1hcCIsImdldFNoaXAiLCJnZXRTaGlwUG9zaXRpb25zIiwiZ2V0SGl0UG9zaXRpb25zIiwiVWlNYW5hZ2VyIiwibmV3VWlNYW5hZ2VyIiwibmV3R2FtZSIsImFjdENvbnRyb2xsZXIiLCJjaGVja01vdmUiLCJnYkdyaWQiLCJ2YWxpZCIsImVsIiwicCIsInJhbmRNb3ZlIiwibW92ZUxvZyIsImFsbE1vdmVzIiwiZmxhdE1hcCIsInJvdyIsInBvc3NpYmxlTW92ZXMiLCJyYW5kb21Nb3ZlIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiZ2VuZXJhdGVSYW5kb21TdGFydCIsInNpemUiLCJ2YWxpZFN0YXJ0cyIsImNvbCIsInJhbmRvbUluZGV4IiwiYXV0b1BsYWNlbWVudCIsInNoaXBUeXBlcyIsInBsYWNlZCIsIm9wcEdhbWVib2FyZCIsInNldExlbmd0aCIsImhpdHMiLCJpbnN0cnVjdGlvbkNsciIsImd1aWRlQ2xyIiwiY2VsbENsciIsImlucHV0Q2xyIiwib3VwdXRDbHIiLCJidXR0b25DbHIiLCJidXR0b25UZXh0Q2xyIiwic2hpcFNlY3RDbHIiLCJidWlsZFNoaXAiLCJvYmoiLCJkb21TZWwiLCJzaGlwU2VjdHMiLCJzZWN0IiwiY2xhc3NOYW1lIiwic2V0QXR0cmlidXRlIiwiY29udGFpbmVySUQiLCJjb250YWluZXIiLCJncmlkRGl2IiwiY29sdW1ucyIsImhlYWRlciIsInJvd0xhYmVsIiwiaWQiLCJjb25zb2xlQ29udGFpbmVyIiwiaW5wdXREaXYiLCJzdWJtaXRCdXR0b24iLCJwcm9tcHRPYmpzIiwiZGlzcGxheSIsImZpcnN0Q2hpbGQiLCJyZW1vdmVDaGlsZCIsInByb21wdERpdiIsInBsYXllck9iaiIsImlkU2VsIiwiZGlzcERpdiIsInNoaXBEaXYiLCJ0aXRsZSIsInNlY3RzRGl2Iiwic2hpcE9iaiIsInNoaXBTZWN0Iiwic2VjdGlvbiJdLCJzb3VyY2VSb290IjoiIn0=