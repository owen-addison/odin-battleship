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
const hitBgClr = "bg-lime-600";
const hitTextClr = "text-lime-600";
const missBgClr = "bg-red-700";
const missTextClr = "text-orange-600";
const errorTextClr = "text-red-700";
const defaultTextClr = "text-gray-600";
const primaryHoverClr = "hover:bg-orange-500";
const highlightClr = "bg-orange-300";
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
      messageElement.classList.add(hitTextClr);
      break;
    case "miss":
      messageElement.classList.add(missTextClr);
      break;
    case "error":
      messageElement.classList.add(errorTextClr);
      break;
    default:
      messageElement.classList.add(defaultTextClr);
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
      cellElement.classList.add(highlightClr);
    }
  });
}

// Function to clear highlight from cells
function clearHighlight(cellIds) {
  cellIds.forEach(cellId => {
    const cellElement = document.querySelector(`[data-position="${cellId}"]`);
    if (cellElement) {
      cellElement.classList.remove(highlightClr);
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
  e.preventDefault(); // Prevent the default spacebar action
  if (e.key === " " && lastHoveredCell) {
    // Ensure spacebar is pressed and there's a last hovered cell

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
    cell.classList.remove(primaryHoverClr);
    cell.classList.add(primaryHoverClr);
  });
}
function disableComputerGameboardHover(cellsArray) {
  cellsArray.forEach(cell => {
    cell.classList.add("pointer-events-none", "cursor-default");
    cell.classList.remove(primaryHoverClr);
  });
}
function disableHumanGameboardHover() {
  document.querySelectorAll('.gameboard-cell[data-player="human"]').forEach(cell => {
    cell.classList.add("pointer-events-none", "cursor-default");
    cell.classList.remove(primaryHoverClr);
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
    // Get the DOM element for the cell
    const cell = document.querySelector(`.gameboard-cell[data-player=${playerSelector}][data-position=${humanMoveResult.move}]`);

    // Disable the cell from future clicks
    disableComputerGameboardHover([cell]);

    // Handle miss and hit
    if (!humanMoveResult.hit) {
      // Update the cells styling to reflect miss
      cell.classList.add(missBgClr);
    } else {
      // Update the cells styling to reflect hit
      cell.classList.add(hitBgClr);
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
      // Player makes a move
      // eslint-disable-next-line no-await-in-loop
      lastHumanMoveResult = await promptPlayerMove(lastCompMoveResult);
      // Check for win condition
      // eslint-disable-next-line no-await-in-loop
      gameOver = await checkWinCondition();
      if (gameOver) break;

      // Computer makes a move
      // eslint-disable-next-line no-await-in-loop
      lastCompMoveResult = await computerMove(humanPlayerGameboard, compPlayer);
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
const primaryHoverClr = "hover:bg-orange-500";

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
        cell.className = `w-6 h-6 flex justify-center items-center cursor-pointer`; // Add more classes as needed for styling
        cell.classList.add(primaryHoverClr);
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
    input.className = `p-1 flex-1`; // Add TailwindCSS classes
    input.classList.add(inputClr);
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
.bg-orange-300 {
  --tw-bg-opacity: 1;
  background-color: rgb(253 186 116 / var(--tw-bg-opacity));
}
.bg-orange-400 {
  --tw-bg-opacity: 1;
  background-color: rgb(251 146 60 / var(--tw-bg-opacity));
}
.bg-orange-600 {
  --tw-bg-opacity: 1;
  background-color: rgb(234 88 12 / var(--tw-bg-opacity));
}
.bg-red-700 {
  --tw-bg-opacity: 1;
  background-color: rgb(185 28 28 / var(--tw-bg-opacity));
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
.text-gray-600 {
  --tw-text-opacity: 1;
  color: rgb(75 85 99 / var(--tw-text-opacity));
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
}`, "",{"version":3,"sources":["webpack://./src/styles.css"],"names":[],"mappings":"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;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,wBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,2BAAmB;EAAnB;AAAmB;AAAnB;EAAA,2BAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,qBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,mBAAmB;EAAnB;AAAmB;AAAnB;EAAA,iBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,mBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAFnB;EAAA,kBAEoB;EAFpB;AAEoB","sourcesContent":["@tailwind base;\n@tailwind components;\n@tailwind utilities;"],"sourceRoot":""}]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUM3RCxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUM3RCxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUM3RCxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUM3RCxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUM3RCxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUM3RCxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUM3RCxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUM3RCxDQUFDLElBQUksRUFB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Q0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOEJBQThCO0FBQzlCLGlCQUFpQjtBQUNqQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsY0FBYztBQUNkLGtCQUFrQjtBQUNsQjs7QUFFQTtBQUNBO0FBQ0EsY0FBYztBQUNkLGtCQUFrQjtBQUNsQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQiwwQkFBMEI7QUFDMUI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsT0FBTyxrRkFBa0YsWUFBWSxNQUFNLE9BQU8scUJBQXFCLG9CQUFvQixxQkFBcUIscUJBQXFCLE1BQU0sTUFBTSxXQUFXLE1BQU0sWUFBWSxNQUFNLE1BQU0scUJBQXFCLHFCQUFxQixxQkFBcUIsVUFBVSxvQkFBb0IscUJBQXFCLHFCQUFxQixxQkFBcUIscUJBQXFCLE1BQU0sT0FBTyxNQUFNLEtBQUssb0JBQW9CLHFCQUFxQixNQUFNLFFBQVEsTUFBTSxLQUFLLG9CQUFvQixvQkFBb0IscUJBQXFCLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxXQUFXLE1BQU0sTUFBTSxNQUFNLFVBQVUsV0FBVyxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssVUFBVSxXQUFXLE1BQU0sTUFBTSxNQUFNLE1BQU0sV0FBVyxNQUFNLFNBQVMsTUFBTSxRQUFRLHFCQUFxQixxQkFBcUIscUJBQXFCLG9CQUFvQixNQUFNLE1BQU0sTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLE1BQU0sTUFBTSxVQUFVLFVBQVUsV0FBVyxXQUFXLE1BQU0sS0FBSyxVQUFVLE1BQU0sS0FBSyxVQUFVLE1BQU0sUUFBUSxNQUFNLEtBQUssb0JBQW9CLHFCQUFxQixxQkFBcUIsTUFBTSxRQUFRLE1BQU0sU0FBUyxxQkFBcUIscUJBQXFCLHFCQUFxQixvQkFBb0IscUJBQXFCLHFCQUFxQixvQkFBb0Isb0JBQW9CLG9CQUFvQixNQUFNLE1BQU0sTUFBTSxNQUFNLFdBQVcsTUFBTSxPQUFPLE1BQU0sUUFBUSxxQkFBcUIscUJBQXFCLHFCQUFxQixNQUFNLE1BQU0sTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sTUFBTSxNQUFNLFVBQVUsTUFBTSxPQUFPLE1BQU0sS0FBSyxxQkFBcUIscUJBQXFCLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE9BQU8sTUFBTSxLQUFLLHFCQUFxQixvQkFBb0IsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxNQUFNLGlCQUFpQixVQUFVLE1BQU0sS0FBSyxVQUFVLFVBQVUsTUFBTSxLQUFLLFVBQVUsTUFBTSxPQUFPLFdBQVcsVUFBVSxVQUFVLE1BQU0sTUFBTSxLQUFLLEtBQUssVUFBVSxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxPQUFPLE1BQU0sS0FBSyxvQkFBb0Isb0JBQW9CLE1BQU0sTUFBTSxvQkFBb0Isb0JBQW9CLE1BQU0sTUFBTSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sS0FBSyxLQUFLLFVBQVUsTUFBTSxRQUFRLE1BQU0sWUFBWSxvQkFBb0IscUJBQXFCLE1BQU0sTUFBTSxNQUFNLE1BQU0sVUFBVSxVQUFVLE1BQU0sV0FBVyxLQUFLLFVBQVUsTUFBTSxLQUFLLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsS0FBSyxNQUFNLEtBQUssV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxLQUFLLEtBQUssS0FBSyxLQUFLLE1BQU0sT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFN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Q0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLElBQUk7V0FDSjtXQUNBO1dBQ0EsSUFBSTtXQUNKO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLENBQUM7V0FDRDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsRUFBRTtXQUNGO1dBQ0Esc0dBQXNHO1dBQ3RHO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQSxFQUFFO1dBQ0Y7V0FDQTs7Ozs7V0NoRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1dDTkE7Ozs7O1VFQUE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvYWN0aW9uQ29udHJvbGxlci5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvZXJyb3JzLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9nYW1lLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9nYW1lYm9hcmQuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9wbGF5ZXIuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3NoaXAuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3VpTWFuYWdlci5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvc3R5bGVzLmNzcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9zdHlsZXMuY3NzPzBhMjUiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9hc3luYyBtb2R1bGUiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9ub25jZSIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEdhbWVib2FyZCBmcm9tIFwiLi9nYW1lYm9hcmRcIjtcblxuY29uc3QgeyBncmlkIH0gPSBHYW1lYm9hcmQoKTtcblxuY29uc3Qgc2hpcHNUb1BsYWNlID0gW1xuICB7IHNoaXBUeXBlOiBcImNhcnJpZXJcIiwgc2hpcExlbmd0aDogNSB9LFxuICB7IHNoaXBUeXBlOiBcImJhdHRsZXNoaXBcIiwgc2hpcExlbmd0aDogNCB9LFxuICB7IHNoaXBUeXBlOiBcInN1Ym1hcmluZVwiLCBzaGlwTGVuZ3RoOiAzIH0sXG4gIHsgc2hpcFR5cGU6IFwiY3J1aXNlclwiLCBzaGlwTGVuZ3RoOiAzIH0sXG4gIHsgc2hpcFR5cGU6IFwiZGVzdHJveWVyXCIsIHNoaXBMZW5ndGg6IDIgfSxcbl07XG5cbmNvbnN0IGhpdEJnQ2xyID0gXCJiZy1saW1lLTYwMFwiO1xuY29uc3QgaGl0VGV4dENsciA9IFwidGV4dC1saW1lLTYwMFwiO1xuY29uc3QgbWlzc0JnQ2xyID0gXCJiZy1yZWQtNzAwXCI7XG5jb25zdCBtaXNzVGV4dENsciA9IFwidGV4dC1vcmFuZ2UtNjAwXCI7XG5jb25zdCBlcnJvclRleHRDbHIgPSBcInRleHQtcmVkLTcwMFwiO1xuY29uc3QgZGVmYXVsdFRleHRDbHIgPSBcInRleHQtZ3JheS02MDBcIjtcblxuY29uc3QgcHJpbWFyeUhvdmVyQ2xyID0gXCJob3ZlcjpiZy1vcmFuZ2UtNTAwXCI7XG5jb25zdCBoaWdobGlnaHRDbHIgPSBcImJnLW9yYW5nZS0zMDBcIjtcblxubGV0IGN1cnJlbnRPcmllbnRhdGlvbiA9IFwiaFwiOyAvLyBEZWZhdWx0IG9yaWVudGF0aW9uXG5sZXQgY3VycmVudFNoaXA7XG5sZXQgbGFzdEhvdmVyZWRDZWxsID0gbnVsbDsgLy8gU3RvcmUgdGhlIGxhc3QgaG92ZXJlZCBjZWxsJ3MgSURcblxuY29uc3QgcGxhY2VTaGlwR3VpZGUgPSB7XG4gIHByb21wdDpcbiAgICBcIkVudGVyIHRoZSBncmlkIHBvc2l0aW9uIChpLmUuICdBMScpIGFuZCBvcmllbnRhdGlvbiAoJ2gnIGZvciBob3Jpem9udGFsIGFuZCAndicgZm9yIHZlcnRpY2FsKSwgc2VwYXJhdGVkIHdpdGggYSBzcGFjZS4gRm9yIGV4YW1wbGUgJ0EyIHYnLiBBbHRlcm5hdGl2ZWx5LCBvbiB5b3UgZ2FtZWJvYXJkIGNsaWNrIHRoZSBjZWxsIHlvdSB3YW50IHRvIHNldCBhdCB0aGUgc3RhcnRpbmcgcG9pbnQsIHVzZSBzcGFjZWJhciB0byB0b2dnbGUgdGhlIG9yaWVudGF0aW9uLlwiLFxuICBwcm9tcHRUeXBlOiBcImd1aWRlXCIsXG59O1xuXG5jb25zdCBnYW1lcGxheUd1aWRlID0ge1xuICBwcm9tcHQ6XG4gICAgXCJFbnRlciBncmlkIHBvc2l0aW9uIChpLmUuICdBMScpIHlvdSB3YW50IHRvIGF0dGFjay4gQWx0ZXJuYXRpdmVseSwgY2xpY2sgdGhlIGNlbGwgeW91IHdhbnQgdG8gYXR0YWNrIG9uIHRoZSBvcHBvbmVudCdzIGdhbWVib2FyZFwiLFxuICBwcm9tcHRUeXBlOiBcImd1aWRlXCIsXG59O1xuXG5jb25zdCB0dXJuUHJvbXB0ID0ge1xuICBwcm9tcHQ6IFwiTWFrZSB5b3VyIG1vdmUuXCIsXG4gIHByb21wdFR5cGU6IFwiaW5zdHJ1Y3Rpb25cIixcbn07XG5cbmNvbnN0IHByb2Nlc3NDb21tYW5kID0gKGNvbW1hbmQsIGlzTW92ZSkgPT4ge1xuICAvLyBJZiBpc01vdmUgaXMgdHJ1dGh5LCBhc3NpZ24gYXMgc2luZ2xlIGl0ZW0gYXJyYXksIG90aGVyd2lzZSBzcGxpdCB0aGUgY29tbWFuZCBieSBzcGFjZVxuICBjb25zdCBwYXJ0cyA9IGlzTW92ZSA/IFtjb21tYW5kXSA6IGNvbW1hbmQuc3BsaXQoXCIgXCIpO1xuICBpZiAoIWlzTW92ZSAmJiBwYXJ0cy5sZW5ndGggIT09IDIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIkludmFsaWQgY29tbWFuZCBmb3JtYXQuIFBsZWFzZSB1c2UgdGhlIGZvcm1hdCAnR3JpZFBvc2l0aW9uIE9yaWVudGF0aW9uJy5cIixcbiAgICApO1xuICB9XG5cbiAgLy8gUHJvY2VzcyBhbmQgdmFsaWRhdGUgdGhlIGdyaWQgcG9zaXRpb25cbiAgY29uc3QgZ3JpZFBvc2l0aW9uID0gcGFydHNbMF0udG9VcHBlckNhc2UoKTtcbiAgaWYgKGdyaWRQb3NpdGlvbi5sZW5ndGggPCAyIHx8IGdyaWRQb3NpdGlvbi5sZW5ndGggPiAzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBncmlkIHBvc2l0aW9uLiBNdXN0IGJlIDIgdG8gMyBjaGFyYWN0ZXJzIGxvbmcuXCIpO1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgZ3JpZCBwb3NpdGlvbiBhZ2FpbnN0IHRoZSBncmlkIG1hdHJpeFxuICBjb25zdCB2YWxpZEdyaWRQb3NpdGlvbnMgPSBncmlkLmZsYXQoKTsgLy8gRmxhdHRlbiB0aGUgZ3JpZCBmb3IgZWFzaWVyIHNlYXJjaGluZ1xuICBpZiAoIXZhbGlkR3JpZFBvc2l0aW9ucy5pbmNsdWRlcyhncmlkUG9zaXRpb24pKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgXCJJbnZhbGlkIGdyaWQgcG9zaXRpb24uIERvZXMgbm90IG1hdGNoIGFueSB2YWxpZCBncmlkIHZhbHVlcy5cIixcbiAgICApO1xuICB9XG5cbiAgY29uc3QgcmVzdWx0ID0geyBncmlkUG9zaXRpb24gfTtcblxuICBpZiAoIWlzTW92ZSkge1xuICAgIC8vIFByb2Nlc3MgYW5kIHZhbGlkYXRlIHRoZSBvcmllbnRhdGlvblxuICAgIGNvbnN0IG9yaWVudGF0aW9uID0gcGFydHNbMV0udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAob3JpZW50YXRpb24gIT09IFwiaFwiICYmIG9yaWVudGF0aW9uICE9PSBcInZcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBcIkludmFsaWQgb3JpZW50YXRpb24uIE11c3QgYmUgZWl0aGVyICdoJyBmb3IgaG9yaXpvbnRhbCBvciAndicgZm9yIHZlcnRpY2FsLlwiLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXN1bHQub3JpZW50YXRpb24gPSBvcmllbnRhdGlvbjtcbiAgfVxuXG4gIC8vIFJldHVybiB0aGUgcHJvY2Vzc2VkIGFuZCB2YWxpZGF0ZWQgY29tbWFuZCBwYXJ0c1xuICByZXR1cm4gcmVzdWx0O1xufTtcblxuLy8gVGhlIGZ1bmN0aW9uIGZvciB1cGRhdGluZyB0aGUgb3V0cHV0IGRpdiBlbGVtZW50XG5jb25zdCB1cGRhdGVPdXRwdXQgPSAobWVzc2FnZSwgdHlwZSkgPT4ge1xuICAvLyBHZXQgdGhlIG91cHV0IGVsZW1lbnRcbiAgY29uc3Qgb3V0cHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLW91dHB1dFwiKTtcblxuICAvLyBBcHBlbmQgbmV3IG1lc3NhZ2VcbiAgY29uc3QgbWVzc2FnZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpOyAvLyBDcmVhdGUgYSBuZXcgZGl2IGZvciB0aGUgbWVzc2FnZVxuICBtZXNzYWdlRWxlbWVudC50ZXh0Q29udGVudCA9IG1lc3NhZ2U7IC8vIFNldCB0aGUgdGV4dCBjb250ZW50IHRvIHRoZSBtZXNzYWdlXG5cbiAgLy8gQXBwbHkgc3R5bGluZyBiYXNlZCBvbiBwcm9tcHRUeXBlXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgXCJ2YWxpZFwiOlxuICAgICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZChoaXRUZXh0Q2xyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJtaXNzXCI6XG4gICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKG1pc3NUZXh0Q2xyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZChlcnJvclRleHRDbHIpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIG1lc3NhZ2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoZGVmYXVsdFRleHRDbHIpOyAvLyBEZWZhdWx0IHRleHQgY29sb3JcbiAgfVxuXG4gIG91dHB1dC5hcHBlbmRDaGlsZChtZXNzYWdlRWxlbWVudCk7IC8vIEFkZCB0aGUgZWxlbWVudCB0byB0aGUgb3V0cHV0XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIG91dHB1dC5zY3JvbGxUb3AgPSBvdXRwdXQuc2Nyb2xsSGVpZ2h0OyAvLyBTY3JvbGwgdG8gdGhlIGJvdHRvbSBvZiB0aGUgb3V0cHV0IGNvbnRhaW5lclxufTtcblxuLy8gVGhlIGZ1bmN0aW9uIGZvciBleGVjdXRpbmcgY29tbWFuZHMgZnJvbSB0aGUgY29uc29sZSBpbnB1dFxuY29uc3QgY29uc29sZUxvZ1BsYWNlbWVudENvbW1hbmQgPSAoc2hpcFR5cGUsIGdyaWRQb3NpdGlvbiwgb3JpZW50YXRpb24pID0+IHtcbiAgLy8gU2V0IHRoZSBvcmllbnRhdGlvbiBmZWVkYmFja1xuICBjb25zdCBkaXJGZWViYWNrID0gb3JpZW50YXRpb24gPT09IFwiaFwiID8gXCJob3Jpem9udGFsbHlcIiA6IFwidmVydGljYWxseVwiO1xuICAvLyBTZXQgdGhlIGNvbnNvbGUgbWVzc2FnZVxuICBjb25zdCBtZXNzYWdlID0gYCR7c2hpcFR5cGUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzaGlwVHlwZS5zbGljZSgxKX0gcGxhY2VkIGF0ICR7Z3JpZFBvc2l0aW9ufSBmYWNpbmcgJHtkaXJGZWViYWNrfWA7XG5cbiAgY29uc29sZS5sb2coYCR7bWVzc2FnZX1gKTtcblxuICB1cGRhdGVPdXRwdXQoYD4gJHttZXNzYWdlfWAsIFwidmFsaWRcIik7XG5cbiAgLy8gQ2xlYXIgdGhlIGlucHV0XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1pbnB1dFwiKS52YWx1ZSA9IFwiXCI7XG59O1xuXG4vLyBUaGUgZnVuY3Rpb24gZm9yIGV4ZWN1dGluZyBjb21tYW5kcyBmcm9tIHRoZSBjb25zb2xlIGlucHV0XG5jb25zdCBjb25zb2xlTG9nTW92ZUNvbW1hbmQgPSAocmVzdWx0c09iamVjdCkgPT4ge1xuICAvLyBTZXQgdGhlIGNvbnNvbGUgbWVzc2FnZVxuICBjb25zdCBtZXNzYWdlID0gYFRoZSAke3Jlc3VsdHNPYmplY3QucGxheWVyfSdzIG1vdmUgb24gJHtyZXN1bHRzT2JqZWN0Lm1vdmV9IHJlc3VsdGVkIGluIGEgJHtyZXN1bHRzT2JqZWN0LmhpdCA/IFwiSElUXCIgOiBcIk1JU1NcIn0hYDtcblxuICBjb25zb2xlLmxvZyhgJHttZXNzYWdlfWApO1xuXG4gIHVwZGF0ZU91dHB1dChgPiAke21lc3NhZ2V9YCwgcmVzdWx0c09iamVjdC5oaXQgPyBcInZhbGlkXCIgOiBcIm1pc3NcIik7XG5cbiAgLy8gQ2xlYXIgdGhlIGlucHV0XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1pbnB1dFwiKS52YWx1ZSA9IFwiXCI7XG59O1xuXG5jb25zdCBjb25zb2xlTG9nRXJyb3IgPSAoZXJyb3IsIHNoaXBUeXBlKSA9PiB7XG4gIGlmIChzaGlwVHlwZSkge1xuICAgIC8vIElmIHNoaXBUeXBlIGlzIHBhc3NlZCB0aGVuIHByb2Nlc3MgZXJyb3IgYXMgcGxhY2VtZW50IGVycm9yXG4gICAgY29uc29sZS5lcnJvcihgRXJyb3IgcGxhY2luZyAke3NoaXBUeXBlfTogbWVzc2FnZSA9ICR7ZXJyb3IubWVzc2FnZX0uYCk7XG5cbiAgICB1cGRhdGVPdXRwdXQoYD4gRXJyb3IgcGxhY2luZyAke3NoaXBUeXBlfTogJHtlcnJvci5tZXNzYWdlfWAsIFwiZXJyb3JcIik7XG4gIH0gZWxzZSB7XG4gICAgLy8gZWxzZSBpZiBzaGlwVHlwZSBpcyB1bmRlZmluZWQsIHByb2Nlc3MgZXJyb3IgYXMgbW92ZSBlcnJvclxuICAgIGNvbnNvbGUubG9nKGBFcnJvciBtYWtpbmcgbW92ZTogbWVzc2FnZSA9ICR7ZXJyb3IubWVzc2FnZX0uYCk7XG5cbiAgICB1cGRhdGVPdXRwdXQoYD4gRXJyb3IgbWFraW5nIG1vdmU6IG1lc3NhZ2UgPSAke2Vycm9yLm1lc3NhZ2V9LmAsIFwiZXJyb3JcIik7XG4gIH1cblxuICAvLyBDbGVhciB0aGUgaW5wdXRcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLWlucHV0XCIpLnZhbHVlID0gXCJcIjtcbn07XG5cbi8vIEZ1bmN0aW9uIGluaXRpYWxpc2UgdWlNYW5hZ2VyXG5jb25zdCBpbml0VWlNYW5hZ2VyID0gKHVpTWFuYWdlcikgPT4ge1xuICAvLyBJbml0aWFsaXNlIGNvbnNvbGVcbiAgdWlNYW5hZ2VyLmluaXRDb25zb2xlVUkoKTtcblxuICAvLyBJbml0aWFsaXNlIGdhbWVib2FyZCB3aXRoIGNhbGxiYWNrIGZvciBjZWxsIGNsaWNrc1xuICB1aU1hbmFnZXIuY3JlYXRlR2FtZWJvYXJkKFwiaHVtYW4tZ2JcIik7XG4gIHVpTWFuYWdlci5jcmVhdGVHYW1lYm9hcmQoXCJjb21wLWdiXCIpO1xufTtcblxuLy8gRnVuY3Rpb24gdG8gY2FsY3VsYXRlIGNlbGwgSURzIGJhc2VkIG9uIHN0YXJ0IHBvc2l0aW9uLCBsZW5ndGgsIGFuZCBvcmllbnRhdGlvblxuZnVuY3Rpb24gY2FsY3VsYXRlU2hpcENlbGxzKHN0YXJ0Q2VsbCwgc2hpcExlbmd0aCwgb3JpZW50YXRpb24pIHtcbiAgY29uc3QgY2VsbElkcyA9IFtdO1xuICBjb25zdCByb3dJbmRleCA9IHN0YXJ0Q2VsbC5jaGFyQ29kZUF0KDApIC0gXCJBXCIuY2hhckNvZGVBdCgwKTtcbiAgY29uc3QgY29sSW5kZXggPSBwYXJzZUludChzdGFydENlbGwuc3Vic3RyaW5nKDEpLCAxMCkgLSAxO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgaWYgKG9yaWVudGF0aW9uID09PSBcInZcIikge1xuICAgICAgaWYgKGNvbEluZGV4ICsgaSA+PSBncmlkWzBdLmxlbmd0aCkgYnJlYWs7IC8vIENoZWNrIGdyaWQgYm91bmRzXG4gICAgICBjZWxsSWRzLnB1c2goXG4gICAgICAgIGAke1N0cmluZy5mcm9tQ2hhckNvZGUocm93SW5kZXggKyBcIkFcIi5jaGFyQ29kZUF0KDApKX0ke2NvbEluZGV4ICsgaSArIDF9YCxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChyb3dJbmRleCArIGkgPj0gZ3JpZC5sZW5ndGgpIGJyZWFrOyAvLyBDaGVjayBncmlkIGJvdW5kc1xuICAgICAgY2VsbElkcy5wdXNoKFxuICAgICAgICBgJHtTdHJpbmcuZnJvbUNoYXJDb2RlKHJvd0luZGV4ICsgaSArIFwiQVwiLmNoYXJDb2RlQXQoMCkpfSR7Y29sSW5kZXggKyAxfWAsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjZWxsSWRzO1xufVxuXG4vLyBGdW5jdGlvbiB0byBoaWdobGlnaHQgY2VsbHNcbmZ1bmN0aW9uIGhpZ2hsaWdodENlbGxzKGNlbGxJZHMpIHtcbiAgY2VsbElkcy5mb3JFYWNoKChjZWxsSWQpID0+IHtcbiAgICBjb25zdCBjZWxsRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiJHtjZWxsSWR9XCJdYCk7XG4gICAgaWYgKGNlbGxFbGVtZW50KSB7XG4gICAgICBjZWxsRWxlbWVudC5jbGFzc0xpc3QuYWRkKGhpZ2hsaWdodENscik7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gRnVuY3Rpb24gdG8gY2xlYXIgaGlnaGxpZ2h0IGZyb20gY2VsbHNcbmZ1bmN0aW9uIGNsZWFySGlnaGxpZ2h0KGNlbGxJZHMpIHtcbiAgY2VsbElkcy5mb3JFYWNoKChjZWxsSWQpID0+IHtcbiAgICBjb25zdCBjZWxsRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiJHtjZWxsSWR9XCJdYCk7XG4gICAgaWYgKGNlbGxFbGVtZW50KSB7XG4gICAgICBjZWxsRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGhpZ2hsaWdodENscik7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gRnVuY3Rpb24gdG8gdG9nZ2xlIG9yaWVudGF0aW9uXG5mdW5jdGlvbiB0b2dnbGVPcmllbnRhdGlvbigpIHtcbiAgY3VycmVudE9yaWVudGF0aW9uID0gY3VycmVudE9yaWVudGF0aW9uID09PSBcImhcIiA/IFwidlwiIDogXCJoXCI7XG4gIC8vIFVwZGF0ZSB0aGUgdmlzdWFsIHByb21wdCBoZXJlIGlmIG5lY2Vzc2FyeVxufVxuXG5jb25zdCBoYW5kbGVQbGFjZW1lbnRIb3ZlciA9IChlKSA9PiB7XG4gIGNvbnN0IGNlbGwgPSBlLnRhcmdldDtcbiAgaWYgKFxuICAgIGNlbGwuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZ2FtZWJvYXJkLWNlbGxcIikgJiZcbiAgICBjZWxsLmRhdGFzZXQucGxheWVyID09PSBcImh1bWFuXCJcbiAgKSB7XG4gICAgLy8gTG9naWMgdG8gaGFuZGxlIGhvdmVyIGVmZmVjdFxuICAgIGNvbnN0IGNlbGxQb3MgPSBjZWxsLmRhdGFzZXQucG9zaXRpb247XG4gICAgbGFzdEhvdmVyZWRDZWxsID0gY2VsbFBvcztcbiAgICBjb25zdCBjZWxsc1RvSGlnaGxpZ2h0ID0gY2FsY3VsYXRlU2hpcENlbGxzKFxuICAgICAgY2VsbFBvcyxcbiAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICBjdXJyZW50T3JpZW50YXRpb24sXG4gICAgKTtcbiAgICBoaWdobGlnaHRDZWxscyhjZWxsc1RvSGlnaGxpZ2h0KTtcbiAgfVxufTtcblxuY29uc3QgaGFuZGxlTW91c2VMZWF2ZSA9IChlKSA9PiB7XG4gIGNvbnN0IGNlbGwgPSBlLnRhcmdldDtcbiAgaWYgKGNlbGwuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZ2FtZWJvYXJkLWNlbGxcIikpIHtcbiAgICAvLyBMb2dpYyBmb3IgaGFuZGxpbmcgd2hlbiB0aGUgY3Vyc29yIGxlYXZlcyBhIGNlbGxcbiAgICBjb25zdCBjZWxsUG9zID0gY2VsbC5kYXRhc2V0LnBvc2l0aW9uO1xuICAgIGlmIChjZWxsUG9zID09PSBsYXN0SG92ZXJlZENlbGwpIHtcbiAgICAgIGNvbnN0IGNlbGxzVG9DbGVhciA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgICAgY2VsbFBvcyxcbiAgICAgICAgY3VycmVudFNoaXAuc2hpcExlbmd0aCxcbiAgICAgICAgY3VycmVudE9yaWVudGF0aW9uLFxuICAgICAgKTtcbiAgICAgIGNsZWFySGlnaGxpZ2h0KGNlbGxzVG9DbGVhcik7XG4gICAgICBsYXN0SG92ZXJlZENlbGwgPSBudWxsOyAvLyBSZXNldCBsYXN0SG92ZXJlZENlbGwgc2luY2UgdGhlIG1vdXNlIGhhcyBsZWZ0XG4gICAgfVxuICAgIGxhc3RIb3ZlcmVkQ2VsbCA9IG51bGw7XG4gIH1cbn07XG5cbmNvbnN0IGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlID0gKGUpID0+IHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpOyAvLyBQcmV2ZW50IHRoZSBkZWZhdWx0IHNwYWNlYmFyIGFjdGlvblxuICBpZiAoZS5rZXkgPT09IFwiIFwiICYmIGxhc3RIb3ZlcmVkQ2VsbCkge1xuICAgIC8vIEVuc3VyZSBzcGFjZWJhciBpcyBwcmVzc2VkIGFuZCB0aGVyZSdzIGEgbGFzdCBob3ZlcmVkIGNlbGxcblxuICAgIC8vIFRvZ2dsZSB0aGUgb3JpZW50YXRpb25cbiAgICB0b2dnbGVPcmllbnRhdGlvbigpO1xuXG4gICAgLy8gQ2xlYXIgcHJldmlvdXNseSBoaWdobGlnaHRlZCBjZWxsc1xuICAgIC8vIEFzc3VtaW5nIGNhbGN1bGF0ZVNoaXBDZWxscyBhbmQgY2xlYXJIaWdobGlnaHQgd29yayBjb3JyZWN0bHlcbiAgICBjb25zdCBvbGRDZWxsc1RvQ2xlYXIgPSBjYWxjdWxhdGVTaGlwQ2VsbHMoXG4gICAgICBsYXN0SG92ZXJlZENlbGwsXG4gICAgICBjdXJyZW50U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgY3VycmVudE9yaWVudGF0aW9uID09PSBcImhcIiA/IFwidlwiIDogXCJoXCIsXG4gICAgKTtcbiAgICBjbGVhckhpZ2hsaWdodChvbGRDZWxsc1RvQ2xlYXIpO1xuXG4gICAgLy8gSGlnaGxpZ2h0IG5ldyBjZWxscyBiYXNlZCBvbiB0aGUgbmV3IG9yaWVudGF0aW9uXG4gICAgY29uc3QgbmV3Q2VsbHNUb0hpZ2hsaWdodCA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgIGxhc3RIb3ZlcmVkQ2VsbCxcbiAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICBjdXJyZW50T3JpZW50YXRpb24sXG4gICAgKTtcbiAgICBoaWdobGlnaHRDZWxscyhuZXdDZWxsc1RvSGlnaGxpZ2h0KTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZW5hYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlcigpIHtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvckFsbCgnLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPVwiY29tcHV0ZXJcIl0nKVxuICAgIC5mb3JFYWNoKChjZWxsKSA9PiB7XG4gICAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUoXCJwb2ludGVyLWV2ZW50cy1ub25lXCIsIFwiY3Vyc29yLWRlZmF1bHRcIik7XG4gICAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUocHJpbWFyeUhvdmVyQ2xyKTtcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChwcmltYXJ5SG92ZXJDbHIpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBkaXNhYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlcihjZWxsc0FycmF5KSB7XG4gIGNlbGxzQXJyYXkuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgIGNlbGwuY2xhc3NMaXN0LmFkZChcInBvaW50ZXItZXZlbnRzLW5vbmVcIiwgXCJjdXJzb3ItZGVmYXVsdFwiKTtcbiAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUocHJpbWFyeUhvdmVyQ2xyKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRpc2FibGVIdW1hbkdhbWVib2FyZEhvdmVyKCkge1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9XCJodW1hblwiXScpXG4gICAgLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChcInBvaW50ZXItZXZlbnRzLW5vbmVcIiwgXCJjdXJzb3ItZGVmYXVsdFwiKTtcbiAgICAgIGNlbGwuY2xhc3NMaXN0LnJlbW92ZShwcmltYXJ5SG92ZXJDbHIpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzd2l0Y2hHYW1lYm9hcmRIb3ZlclN0YXRlcygpIHtcbiAgLy8gRGlzYWJsZSBob3ZlciBvbiB0aGUgaHVtYW4ncyBnYW1lYm9hcmRcbiAgZGlzYWJsZUh1bWFuR2FtZWJvYXJkSG92ZXIoKTtcblxuICAvLyBFbmFibGUgaG92ZXIgb24gdGhlIGNvbXB1dGVyJ3MgZ2FtZWJvYXJkXG4gIGVuYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoKTtcbn1cblxuLy8gRnVuY3Rpb24gdG8gc2V0dXAgZ2FtZWJvYXJkIGZvciBzaGlwIHBsYWNlbWVudFxuY29uc3Qgc2V0dXBHYW1lYm9hcmRGb3JQbGFjZW1lbnQgPSAoKSA9PiB7XG4gIGNvbnN0IGNvbXBHYW1lYm9hcmRDZWxscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImNvbXB1dGVyXCJdJyxcbiAgKTtcbiAgZGlzYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoY29tcEdhbWVib2FyZENlbGxzKTtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvckFsbCgnLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPVwiaHVtYW5cIl0nKVxuICAgIC5mb3JFYWNoKChjZWxsKSA9PiB7XG4gICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIGhhbmRsZVBsYWNlbWVudEhvdmVyKTtcbiAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgaGFuZGxlTW91c2VMZWF2ZSk7XG4gICAgfSk7XG4gIC8vIEdldCBnYW1lYm9hcmQgYXJlYSBkaXYgZWxlbWVudFxuICBjb25zdCBnYW1lYm9hcmRBcmVhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICBcIi5nYW1lYm9hcmQtYXJlYSwgW2RhdGEtcGxheWVyPSdodW1hbiddXCIsXG4gICk7XG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgdG8gZ2FtZWJvYXJkIGFyZWEgdG8gYWRkIGFuZCByZW1vdmUgdGhlXG4gIC8vIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlIGV2ZW50IGxpc3RlbmVyIHdoZW4gZW50ZXJpbmcgYW5kIGV4aXRpbmcgdGhlIGFyZWFcbiAgZ2FtZWJvYXJkQXJlYS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xuICB9KTtcbiAgZ2FtZWJvYXJkQXJlYS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xuICB9KTtcbn07XG5cbi8vIEZ1bmN0aW9uIHRvIGNsZWFuIHVwIGFmdGVyIHNoaXAgcGxhY2VtZW50IGlzIGNvbXBsZXRlXG5jb25zdCBjbGVhbnVwQWZ0ZXJQbGFjZW1lbnQgPSAoKSA9PiB7XG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImh1bWFuXCJdJylcbiAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgY2VsbC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBoYW5kbGVQbGFjZW1lbnRIb3Zlcik7XG4gICAgICBjZWxsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIGhhbmRsZU1vdXNlTGVhdmUpO1xuICAgIH0pO1xuICAvLyBHZXQgZ2FtZWJvYXJkIGFyZWEgZGl2IGVsZW1lbnRcbiAgY29uc3QgZ2FtZWJvYXJkQXJlYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgXCIuZ2FtZWJvYXJkLWFyZWEsIFtkYXRhLXBsYXllcj0naHVtYW4nXVwiLFxuICApO1xuICAvLyBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzIHRvIGdhbWVib2FyZCBhcmVhIHRvIGFkZCBhbmQgcmVtb3ZlIHRoZVxuICAvLyBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSBldmVudCBsaXN0ZW5lciB3aGVuIGVudGVyaW5nIGFuZCBleGl0aW5nIHRoZSBhcmVhXG4gIGdhbWVib2FyZEFyZWEucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlKTtcbiAgfSk7XG4gIGdhbWVib2FyZEFyZWEucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlKTtcbiAgfSk7XG4gIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lciBmb3Iga2V5ZG93biBldmVudHNcbiAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xufTtcblxuLy8gRnVuY3Rpb24gZm9yIHN0YXJ0aW5nIHRoZSBnYW1lXG5jb25zdCBzdGFydEdhbWUgPSBhc3luYyAodWlNYW5hZ2VyLCBnYW1lKSA9PiB7XG4gIC8vIFNldCB1cCB0aGUgZ2FtZSBieSBhdXRvIHBsYWNpbmcgY29tcHV0ZXIncyBzaGlwcyBhbmQgc2V0dGluZyB0aGVcbiAgLy8gY3VycmVudCBwbGF5ZXIgdG8gdGhlIGh1bWFuIHBsYXllclxuICBhd2FpdCBnYW1lLnNldFVwKCk7XG5cbiAgLy8gUmVuZGVyIHRoZSBzaGlwIGRpc3BsYXkgZm9yIHRoZSBjb21wdXRlciBwbGF5ZXJcbiAgc2hpcHNUb1BsYWNlLmZvckVhY2goKHNoaXApID0+IHtcbiAgICB1aU1hbmFnZXIucmVuZGVyU2hpcERpc3AoZ2FtZS5wbGF5ZXJzLmNvbXB1dGVyLCBzaGlwLnNoaXBUeXBlKTtcbiAgfSk7XG5cbiAgLy8gRGlzcGxheSBwcm9tcHQgb2JqZWN0IGZvciB0YWtpbmcgYSB0dXJuIGFuZCBzdGFydGluZyB0aGUgZ2FtZVxuICB1aU1hbmFnZXIuZGlzcGxheVByb21wdCh7IHR1cm5Qcm9tcHQsIGdhbWVwbGF5R3VpZGUgfSk7XG59O1xuXG5jb25zdCBoYW5kbGVIdW1hbk1vdmUgPSAoZSkgPT4ge1xuICAvLyBHZXQgdGhlIHBvc2l0aW9uIG9uIHRoZSBib2FyZCB0byBtYWtlIGEgbW92ZVxuICBjb25zdCB7IHBvc2l0aW9uIH0gPSBlLnRhcmdldC5kYXRhO1xufTtcblxuLy8gU2V0dXAgZ2FtZWJvYXJkIGZvciBmb3IgcGxheWVyIG1vdmVcbmNvbnN0IHNldHVwR2FtZWJvYXJkRm9yUGxheWVyTW92ZSA9ICgpID0+IHtcbiAgLy8gRW5hYmxlIHRoZSBob3ZlciBzdGF0ZSBmb3IgdGhlIGNvbXB1dGVyIGdhbWVib2FyZFxuICBlbmFibGVDb21wdXRlckdhbWVib2FyZEhvdmVyKCk7XG5cbiAgLy8gU2V0IHVwIGV2ZW50IGxpc3RlbmVycyBvbiB0aGUgY29tcHV0ZXIgZ2FtZWJvYXJkIGZvciB0aGUgcGxheWVyXG4gIC8vIG1ha2luZyBtb3Zlc1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9XCJjb21wdXRlclwiXScpXG4gICAgLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGhhbmRsZUh1bWFuTW92ZSk7XG4gICAgfSk7XG59O1xuXG5hc3luYyBmdW5jdGlvbiBwbGF5ZXJNb3ZlKCkge1xuICAvLyBXYWl0IGZvciBwbGF5ZXIncyBtb3ZlIChjbGljayBvciBjb25zb2xlIGlucHV0KVxuICAvLyBVcGRhdGUgVUkgYmFzZWQgb24gbW92ZVxufVxuXG5hc3luYyBmdW5jdGlvbiBjb21wdXRlck1vdmUoaHVtYW5QbGF5ZXJHYW1lYm9hcmQsIGNvbXBQbGF5ZXIpIHtcbiAgbGV0IGNvbXBNb3ZlUmVzdWx0O1xuICB0cnkge1xuICAgIC8vIENvbXB1dGVyIGxvZ2ljIHRvIGNob29zZSBhIG1vdmVcbiAgICAvLyBVcGRhdGUgVUkgYmFzZWQgb24gbW92ZVxuICAgIGNvbXBNb3ZlUmVzdWx0ID0gY29tcFBsYXllci5tYWtlTW92ZShodW1hblBsYXllckdhbWVib2FyZCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZUxvZ0Vycm9yKGVycm9yKTtcbiAgfVxuICByZXR1cm4gY29tcE1vdmVSZXN1bHQ7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNoZWNrV2luQ29uZGl0aW9uKCkge1xuICAvLyBDaGVjayBpZiBhbGwgc2hpcHMgYXJlIHN1bmtcbiAgLy8gUmV0dXJuIHRydWUgaWYgZ2FtZSBpcyBvdmVyLCBmYWxzZSBvdGhlcndpc2Vcbn1cblxuZnVuY3Rpb24gY29uY2x1ZGVHYW1lKCkge1xuICAvLyBEaXNwbGF5IHdpbm5lciwgdXBkYXRlIFVJLCBldGMuXG59XG5cbmNvbnN0IEFjdGlvbkNvbnRyb2xsZXIgPSAodWlNYW5hZ2VyLCBnYW1lKSA9PiB7XG4gIGNvbnN0IGh1bWFuUGxheWVyID0gZ2FtZS5wbGF5ZXJzLmh1bWFuO1xuICBjb25zdCBodW1hblBsYXllckdhbWVib2FyZCA9IGh1bWFuUGxheWVyLmdhbWVib2FyZDtcbiAgY29uc3QgY29tcFBsYXllciA9IGdhbWUucGxheWVycy5jb21wdXRlcjtcbiAgY29uc3QgY29tcFBsYXllckdhbWVib2FyZCA9IGNvbXBQbGF5ZXIuZ2FtZWJvYXJkO1xuXG4gIC8vIEZ1bmN0aW9uIHRvIHNldHVwIGV2ZW50IGxpc3RlbmVycyBmb3IgY29uc29sZSBhbmQgZ2FtZWJvYXJkIGNsaWNrc1xuICBmdW5jdGlvbiBzZXR1cEV2ZW50TGlzdGVuZXJzKGhhbmRsZXJGdW5jdGlvbiwgcGxheWVyVHlwZSkge1xuICAgIC8vIERlZmluZSBjbGVhbnVwIGZ1bmN0aW9ucyBpbnNpZGUgdG8gZW5zdXJlIHRoZXkgYXJlIGFjY2Vzc2libGUgZm9yIHJlbW92YWxcbiAgICBjb25zdCBjbGVhbnVwRnVuY3Rpb25zID0gW107XG5cbiAgICBjb25zdCBjb25zb2xlU3VibWl0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLXN1Ym1pdFwiKTtcbiAgICBjb25zdCBjb25zb2xlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtaW5wdXRcIik7XG5cbiAgICBjb25zdCBzdWJtaXRIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgY29uc3QgaW5wdXQgPSBjb25zb2xlSW5wdXQudmFsdWU7XG4gICAgICBoYW5kbGVyRnVuY3Rpb24oaW5wdXQpO1xuICAgICAgY29uc29sZUlucHV0LnZhbHVlID0gXCJcIjsgLy8gQ2xlYXIgaW5wdXQgYWZ0ZXIgc3VibWlzc2lvblxuICAgIH07XG5cbiAgICBjb25zdCBrZXlwcmVzc0hhbmRsZXIgPSAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSBcIkVudGVyXCIpIHtcbiAgICAgICAgc3VibWl0SGFuZGxlcigpOyAvLyBSZXVzZSBzdWJtaXQgbG9naWMgZm9yIEVudGVyIGtleSBwcmVzc1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zb2xlU3VibWl0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzdWJtaXRIYW5kbGVyKTtcbiAgICBjb25zb2xlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGtleXByZXNzSGFuZGxlcik7XG5cbiAgICAvLyBBZGQgY2xlYW51cCBmdW5jdGlvbiBmb3IgY29uc29sZSBsaXN0ZW5lcnNcbiAgICBjbGVhbnVwRnVuY3Rpb25zLnB1c2goKCkgPT4ge1xuICAgICAgY29uc29sZVN1Ym1pdEJ1dHRvbi5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgc3VibWl0SGFuZGxlcik7XG4gICAgICBjb25zb2xlSW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGtleXByZXNzSGFuZGxlcik7XG4gICAgfSk7XG5cbiAgICAvLyBTZXR1cCBmb3IgZ2FtZWJvYXJkIGNlbGwgY2xpY2tzXG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKGAuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9JHtwbGF5ZXJUeXBlfV1gKVxuICAgICAgLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAgICAgY29uc3QgY2xpY2tIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHsgcG9zaXRpb24gfSA9IGNlbGwuZGF0YXNldDtcbiAgICAgICAgICBsZXQgaW5wdXQ7XG4gICAgICAgICAgaWYgKHBsYXllclR5cGUgPT09IFwiaHVtYW5cIikge1xuICAgICAgICAgICAgaW5wdXQgPSBgJHtwb3NpdGlvbn0gJHtjdXJyZW50T3JpZW50YXRpb259YDtcbiAgICAgICAgICB9IGVsc2UgaWYgKHBsYXllclR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgICAgICAgaW5wdXQgPSBwb3NpdGlvbjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBcIkVycm9yISBJbnZhbGlkIHBsYXllciB0eXBlIHBhc3NlZCB0byBjbGlja0hhbmRsZXIhXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBoYW5kbGVyRnVuY3Rpb24oaW5wdXQpO1xuICAgICAgICB9O1xuICAgICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbGlja0hhbmRsZXIpO1xuXG4gICAgICAgIC8vIEFkZCBjbGVhbnVwIGZ1bmN0aW9uIGZvciBlYWNoIGNlbGwgbGlzdGVuZXJcbiAgICAgICAgY2xlYW51cEZ1bmN0aW9ucy5wdXNoKCgpID0+XG4gICAgICAgICAgY2VsbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xpY2tIYW5kbGVyKSxcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgLy8gUmV0dXJuIGEgc2luZ2xlIGNsZWFudXAgZnVuY3Rpb24gdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnNcbiAgICByZXR1cm4gKCkgPT4gY2xlYW51cEZ1bmN0aW9ucy5mb3JFYWNoKChjbGVhbnVwKSA9PiBjbGVhbnVwKCkpO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gcHJvbXB0QW5kUGxhY2VTaGlwKHNoaXBUeXBlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIC8vIFNldCB0aGUgY3VycmVudCBzaGlwXG4gICAgICBjdXJyZW50U2hpcCA9IHNoaXBzVG9QbGFjZS5maW5kKChzaGlwKSA9PiBzaGlwLnNoaXBUeXBlID09PSBzaGlwVHlwZSk7XG5cbiAgICAgIC8vIERpc3BsYXkgcHJvbXB0IGZvciB0aGUgc3BlY2lmaWMgc2hpcCB0eXBlIGFzIHdlbGwgYXMgdGhlIGd1aWRlIHRvIHBsYWNpbmcgc2hpcHNcbiAgICAgIGNvbnN0IHBsYWNlU2hpcFByb21wdCA9IHtcbiAgICAgICAgcHJvbXB0OiBgUGxhY2UgeW91ciAke3NoaXBUeXBlfS5gLFxuICAgICAgICBwcm9tcHRUeXBlOiBcImluc3RydWN0aW9uXCIsXG4gICAgICB9O1xuICAgICAgdWlNYW5hZ2VyLmRpc3BsYXlQcm9tcHQoeyBwbGFjZVNoaXBQcm9tcHQsIHBsYWNlU2hpcEd1aWRlIH0pO1xuXG4gICAgICBjb25zdCBoYW5kbGVWYWxpZElucHV0ID0gYXN5bmMgKGlucHV0KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgeyBncmlkUG9zaXRpb24sIG9yaWVudGF0aW9uIH0gPSBwcm9jZXNzQ29tbWFuZChpbnB1dCwgZmFsc2UpO1xuICAgICAgICAgIGF3YWl0IGh1bWFuUGxheWVyR2FtZWJvYXJkLnBsYWNlU2hpcChcbiAgICAgICAgICAgIHNoaXBUeXBlLFxuICAgICAgICAgICAgZ3JpZFBvc2l0aW9uLFxuICAgICAgICAgICAgb3JpZW50YXRpb24sXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zb2xlTG9nUGxhY2VtZW50Q29tbWFuZChzaGlwVHlwZSwgZ3JpZFBvc2l0aW9uLCBvcmllbnRhdGlvbik7XG4gICAgICAgICAgLy8gUmVtb3ZlIGNlbGwgaGlnaGxpZ2h0c1xuICAgICAgICAgIGNvbnN0IGNlbGxzVG9DbGVhciA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgICAgICAgIGdyaWRQb3NpdGlvbixcbiAgICAgICAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICAgICAgICBvcmllbnRhdGlvbixcbiAgICAgICAgICApO1xuICAgICAgICAgIGNsZWFySGlnaGxpZ2h0KGNlbGxzVG9DbGVhcik7XG5cbiAgICAgICAgICAvLyBEaXNwbGF5IHRoZSBzaGlwIG9uIHRoZSBnYW1lIGJvYXJkIGFuZCBzaGlwIHN0YXR1cyBkaXNwbGF5XG4gICAgICAgICAgdWlNYW5hZ2VyLnJlbmRlclNoaXBCb2FyZChodW1hblBsYXllciwgc2hpcFR5cGUpO1xuICAgICAgICAgIHVpTWFuYWdlci5yZW5kZXJTaGlwRGlzcChodW1hblBsYXllciwgc2hpcFR5cGUpO1xuXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZS1iZWZvcmUtZGVmaW5lXG4gICAgICAgICAgcmVzb2x2ZVNoaXBQbGFjZW1lbnQoKTsgLy8gU2hpcCBwbGFjZWQgc3VjY2Vzc2Z1bGx5LCByZXNvbHZlIHRoZSBwcm9taXNlXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZUxvZ0Vycm9yKGVycm9yLCBzaGlwVHlwZSk7XG4gICAgICAgICAgLy8gRG8gbm90IHJlamVjdCB0byBhbGxvdyBmb3IgcmV0cnksIGp1c3QgbG9nIHRoZSBlcnJvclxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAvLyBTZXR1cCBldmVudCBsaXN0ZW5lcnMgYW5kIGVuc3VyZSB3ZSBjYW4gY2xlYW4gdGhlbSB1cCBhZnRlciBwbGFjZW1lbnRcbiAgICAgIGNvbnN0IGNsZWFudXAgPSBzZXR1cEV2ZW50TGlzdGVuZXJzKGhhbmRsZVZhbGlkSW5wdXQsIFwiaHVtYW5cIik7XG5cbiAgICAgIC8vIEF0dGFjaCBjbGVhbnVwIHRvIHJlc29sdmUgdG8gZW5zdXJlIGl0J3MgY2FsbGVkIHdoZW4gdGhlIHByb21pc2UgcmVzb2x2ZXNcbiAgICAgIGNvbnN0IHJlc29sdmVTaGlwUGxhY2VtZW50ID0gKCkgPT4ge1xuICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvLyBTZXF1ZW50aWFsbHkgcHJvbXB0IGZvciBhbmQgcGxhY2UgZWFjaCBzaGlwXG4gIGFzeW5jIGZ1bmN0aW9uIHNldHVwU2hpcHNTZXF1ZW50aWFsbHkoKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwc1RvUGxhY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wXG4gICAgICBhd2FpdCBwcm9tcHRBbmRQbGFjZVNoaXAoc2hpcHNUb1BsYWNlW2ldLnNoaXBUeXBlKTsgLy8gV2FpdCBmb3IgZWFjaCBzaGlwIHRvIGJlIHBsYWNlZCBiZWZvcmUgY29udGludWluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIEZ1bmN0aW9uIGZvciBoYW5kbGluZyB0aGUgZ2FtZSBzZXR1cCBhbmQgc2hpcCBwbGFjZW1lbnRcbiAgY29uc3QgaGFuZGxlU2V0dXAgPSBhc3luYyAoKSA9PiB7XG4gICAgLy8gSW5pdCB0aGUgVUlcbiAgICBpbml0VWlNYW5hZ2VyKHVpTWFuYWdlcik7XG4gICAgc2V0dXBHYW1lYm9hcmRGb3JQbGFjZW1lbnQoKTtcbiAgICBhd2FpdCBzZXR1cFNoaXBzU2VxdWVudGlhbGx5KCk7XG4gICAgLy8gUHJvY2VlZCB3aXRoIHRoZSByZXN0IG9mIHRoZSBnYW1lIHNldHVwIGFmdGVyIGFsbCBzaGlwcyBhcmUgcGxhY2VkXG4gICAgY2xlYW51cEFmdGVyUGxhY2VtZW50KCk7XG5cbiAgICAvLyBTdGFydCB0aGUgZ2FtZVxuICAgIGF3YWl0IHN0YXJ0R2FtZSh1aU1hbmFnZXIsIGdhbWUpO1xuXG4gICAgY29uc3Qgb3V0cHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLW91dHB1dFwiKTtcbiAgICB1cGRhdGVPdXRwdXQoXCI+IEFsbCBzaGlwcyBwbGFjZWQsIGdhbWUgc2V0dXAgY29tcGxldGUhXCIpO1xuICAgIGNvbnNvbGUubG9nKFwiQWxsIHNoaXBzIHBsYWNlZCwgZ2FtZSBzZXR1cCBjb21wbGV0ZSFcIik7XG4gICAgc3dpdGNoR2FtZWJvYXJkSG92ZXJTdGF0ZXMoKTtcbiAgfTtcblxuICBjb25zdCB1cGRhdGVDb21wdXRlckRpc3BsYXlzID0gKGh1bWFuTW92ZVJlc3VsdCkgPT4ge1xuICAgIC8vIFNldCB0aGUgcGxheWVyIHNlbGVjdG9yIG9mIHRoZSBvcHBvbmVudCBkZXBlbmRpbmcgb24gdGhlIHBsYXllclxuICAgIC8vIHdobyBtYWRlIHRoZSBtb3ZlXG4gICAgY29uc3QgcGxheWVyU2VsZWN0b3IgPVxuICAgICAgaHVtYW5Nb3ZlUmVzdWx0LnBsYXllciA9PT0gXCJodW1hblwiID8gXCJjb21wdXRlclwiIDogXCJodW1hblwiO1xuICAgIC8vIEdldCB0aGUgRE9NIGVsZW1lbnQgZm9yIHRoZSBjZWxsXG4gICAgY29uc3QgY2VsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBgLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPSR7cGxheWVyU2VsZWN0b3J9XVtkYXRhLXBvc2l0aW9uPSR7aHVtYW5Nb3ZlUmVzdWx0Lm1vdmV9XWAsXG4gICAgKTtcblxuICAgIC8vIERpc2FibGUgdGhlIGNlbGwgZnJvbSBmdXR1cmUgY2xpY2tzXG4gICAgZGlzYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoW2NlbGxdKTtcblxuICAgIC8vIEhhbmRsZSBtaXNzIGFuZCBoaXRcbiAgICBpZiAoIWh1bWFuTW92ZVJlc3VsdC5oaXQpIHtcbiAgICAgIC8vIFVwZGF0ZSB0aGUgY2VsbHMgc3R5bGluZyB0byByZWZsZWN0IG1pc3NcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChtaXNzQmdDbHIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBVcGRhdGUgdGhlIGNlbGxzIHN0eWxpbmcgdG8gcmVmbGVjdCBoaXRcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChoaXRCZ0Nscik7XG4gICAgfVxuICB9O1xuXG4gIGFzeW5jIGZ1bmN0aW9uIHByb21wdFBsYXllck1vdmUoY29tcE1vdmVSZXN1bHQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbGV0IGh1bWFuTW92ZVJlc3VsdDtcbiAgICAgIC8vIFVwZGF0ZSB0aGUgcGxheWVyIHdpdGggdGhlIHJlc3VsdCBvZiB0aGUgY29tcHV0ZXIncyBsYXN0IG1vcmVcbiAgICAgIC8vIChpZiB0aGVyZSBpcyBvbmUpXG4gICAgICBpZiAoY29tcE1vdmVSZXN1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBMb2cgdGhlIHJlc3VsdCBvZiB0aGUgY29tcHV0ZXIncyBtb3ZlIHRvIHRoZSBjb25zb2xlXG4gICAgICAgIGNvbnNvbGVMb2dNb3ZlQ29tbWFuZChjb21wTW92ZVJlc3VsdCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnNvbGUubG9nKGBNYWtlIGEgbW92ZSFgKTtcblxuICAgICAgY29uc3QgaGFuZGxlVmFsaWRNb3ZlID0gYXN5bmMgKG1vdmUpID0+IHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYGhhbmRsZVZhbGlkSW5wdXQ6IG1vdmUgPSAke21vdmV9YCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgeyBncmlkUG9zaXRpb24gfSA9IHByb2Nlc3NDb21tYW5kKG1vdmUsIHRydWUpO1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGBoYW5kbGVWYWxpZElucHV0OiBncmlkUG9zaXRpb24gPSAke2dyaWRQb3NpdGlvbn1gKTtcbiAgICAgICAgICBodW1hbk1vdmVSZXN1bHQgPSBhd2FpdCBodW1hblBsYXllci5tYWtlTW92ZShcbiAgICAgICAgICAgIGNvbXBQbGF5ZXJHYW1lYm9hcmQsXG4gICAgICAgICAgICBncmlkUG9zaXRpb24sXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgY29tcHV0ZXIgcGxheWVyJ3Mgc2hpcHMgZGlzcGxheSBhbmQgZ2FtZWJvYXJkXG4gICAgICAgICAgLy8gZGVwZW5kaW5nIG9uIG91dGNvbWUgb2YgbW92ZVxuICAgICAgICAgIHVwZGF0ZUNvbXB1dGVyRGlzcGxheXMoaHVtYW5Nb3ZlUmVzdWx0KTtcblxuICAgICAgICAgIC8vIENvbW11bmljYXRlIHRoZSByZXN1bHQgb2YgdGhlIG1vdmUgdG8gdGhlIHVzZXJcbiAgICAgICAgICBjb25zb2xlTG9nTW92ZUNvbW1hbmQoaHVtYW5Nb3ZlUmVzdWx0KTtcblxuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11c2UtYmVmb3JlLWRlZmluZVxuICAgICAgICAgIHJlc29sdmVNb3ZlKCk7IC8vIE1vdmUgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5LCByZXNvbHZlIHRoZSBwcm9taXNlXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZUxvZ0Vycm9yKGVycm9yKTtcbiAgICAgICAgICAvLyBEbyBub3QgcmVqZWN0IHRvIGFsbG93IGZvciByZXRyeSwganVzdCBsb2cgdGhlIGVycm9yXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIFNldHVwIGV2ZW50IGxpc3RlbmVycyBhbmQgZW5zdXJlIHdlIGNhbiBjbGVhbiB0aGVtIHVwIGFmdGVyIHBsYWNlbWVudFxuICAgICAgY29uc3QgY2xlYW51cCA9IHNldHVwRXZlbnRMaXN0ZW5lcnMoaGFuZGxlVmFsaWRNb3ZlLCBcImNvbXB1dGVyXCIpO1xuXG4gICAgICAvLyBBdHRhY2ggY2xlYW51cCB0byByZXNvbHZlIHRvIGVuc3VyZSBpdCdzIGNhbGxlZCB3aGVuIHRoZSBwcm9taXNlIHJlc29sdmVzXG4gICAgICBjb25zdCByZXNvbHZlTW92ZSA9ICgpID0+IHtcbiAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICByZXNvbHZlKGh1bWFuTW92ZVJlc3VsdCk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgLy8gRnVuY3Rpb24gZm9yIGhhbmRsaW5nIHRoZSBwbGF5aW5nIG9mIHRoZSBnYW1lXG4gIGNvbnN0IHBsYXlHYW1lID0gYXN5bmMgKCkgPT4ge1xuICAgIGxldCBnYW1lT3ZlciA9IGZhbHNlO1xuICAgIGxldCBsYXN0Q29tcE1vdmVSZXN1bHQ7XG4gICAgbGV0IGxhc3RIdW1hbk1vdmVSZXN1bHQ7XG5cbiAgICB3aGlsZSAoIWdhbWVPdmVyKSB7XG4gICAgICAvLyBQbGF5ZXIgbWFrZXMgYSBtb3ZlXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgbGFzdEh1bWFuTW92ZVJlc3VsdCA9IGF3YWl0IHByb21wdFBsYXllck1vdmUobGFzdENvbXBNb3ZlUmVzdWx0KTtcbiAgICAgIC8vIENoZWNrIGZvciB3aW4gY29uZGl0aW9uXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgZ2FtZU92ZXIgPSBhd2FpdCBjaGVja1dpbkNvbmRpdGlvbigpO1xuICAgICAgaWYgKGdhbWVPdmVyKSBicmVhaztcblxuICAgICAgLy8gQ29tcHV0ZXIgbWFrZXMgYSBtb3ZlXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgbGFzdENvbXBNb3ZlUmVzdWx0ID0gYXdhaXQgY29tcHV0ZXJNb3ZlKGh1bWFuUGxheWVyR2FtZWJvYXJkLCBjb21wUGxheWVyKTtcbiAgICAgIC8vIENoZWNrIGZvciB3aW4gY29uZGl0aW9uXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgZ2FtZU92ZXIgPSBhd2FpdCBjaGVja1dpbkNvbmRpdGlvbigpO1xuICAgIH1cblxuICAgIC8vIEdhbWUgb3ZlciBsb2dpY1xuICAgIGNvbmNsdWRlR2FtZSgpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgaGFuZGxlU2V0dXAsXG4gICAgcGxheUdhbWUsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBBY3Rpb25Db250cm9sbGVyO1xuIiwiLyogZXNsaW50LWRpc2FibGUgbWF4LWNsYXNzZXMtcGVyLWZpbGUgKi9cblxuY2xhc3MgT3ZlcmxhcHBpbmdTaGlwc0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJTaGlwcyBhcmUgb3ZlcmxhcHBpbmcuXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIk92ZXJsYXBwaW5nU2hpcHNFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIFNoaXBBbGxvY2F0aW9uUmVhY2hlZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihzaGlwVHlwZSkge1xuICAgIHN1cGVyKGBTaGlwIGFsbG9jYXRpb24gbGltaXQgcmVhY2hlZC4gU2hpcCB0eXBlID0gJHtzaGlwVHlwZX0uYCk7XG4gICAgdGhpcy5uYW1lID0gXCJTaGlwQWxsb2NhdGlvblJlYWNoZWRFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIFNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiU2hpcCB0eXBlIGFsbG9jYXRpb24gbGltaXQgcmVhY2hlZC5cIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiU2hpcFR5cGVBbGxvY2F0aW9uUmVhY2hlZEVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgSW52YWxpZFNoaXBMZW5ndGhFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBzaGlwIGxlbmd0aC5cIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiSW52YWxpZFNoaXBMZW5ndGhFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRTaGlwVHlwZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJJbnZhbGlkIHNoaXAgdHlwZS5cIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiSW52YWxpZFNoaXBUeXBlRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBJbnZhbGlkUGxheWVyVHlwZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlID0gXCJJbnZhbGlkIHBsYXllciB0eXBlLiBWYWxpZCBwbGF5ZXIgdHlwZXM6ICdodW1hbicgJiAnY29tcHV0ZXInXCIsXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiSW52YWxpZFNoaXBUeXBlRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBzaGlwIHBsYWNlbWVudC4gQm91bmRhcnkgZXJyb3IhXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIlNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgUmVwZWF0QXR0YWNrZWRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBhdHRhY2sgZW50cnkuIFBvc2l0aW9uIGFscmVhZHkgYXR0YWNrZWQhXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIlJlcGVhdEF0dGFja0Vycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgSW52YWxpZE1vdmVFbnRyeUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJJbnZhbGlkIG1vdmUgZW50cnkhXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRNb3ZlRW50cnlFcnJvclwiO1xuICB9XG59XG5cbmV4cG9ydCB7XG4gIE92ZXJsYXBwaW5nU2hpcHNFcnJvcixcbiAgU2hpcEFsbG9jYXRpb25SZWFjaGVkRXJyb3IsXG4gIFNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvcixcbiAgSW52YWxpZFNoaXBMZW5ndGhFcnJvcixcbiAgSW52YWxpZFNoaXBUeXBlRXJyb3IsXG4gIEludmFsaWRQbGF5ZXJUeXBlRXJyb3IsXG4gIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yLFxuICBSZXBlYXRBdHRhY2tlZEVycm9yLFxuICBJbnZhbGlkTW92ZUVudHJ5RXJyb3IsXG59O1xuIiwiaW1wb3J0IFBsYXllciBmcm9tIFwiLi9wbGF5ZXJcIjtcbmltcG9ydCBHYW1lYm9hcmQgZnJvbSBcIi4vZ2FtZWJvYXJkXCI7XG5pbXBvcnQgU2hpcCBmcm9tIFwiLi9zaGlwXCI7XG5pbXBvcnQgeyBJbnZhbGlkUGxheWVyVHlwZUVycm9yIH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5cbmNvbnN0IEdhbWUgPSAoKSA9PiB7XG4gIC8vIEluaXRpYWxpc2UsIGNyZWF0ZSBnYW1lYm9hcmRzIGZvciBib3RoIHBsYXllcnMgYW5kIGNyZWF0ZSBwbGF5ZXJzIG9mIHR5cGVzIGh1bWFuIGFuZCBjb21wdXRlclxuICBjb25zdCBodW1hbkdhbWVib2FyZCA9IEdhbWVib2FyZChTaGlwKTtcbiAgY29uc3QgY29tcHV0ZXJHYW1lYm9hcmQgPSBHYW1lYm9hcmQoU2hpcCk7XG4gIGNvbnN0IGh1bWFuUGxheWVyID0gUGxheWVyKGh1bWFuR2FtZWJvYXJkLCBcImh1bWFuXCIpO1xuICBjb25zdCBjb21wdXRlclBsYXllciA9IFBsYXllcihjb21wdXRlckdhbWVib2FyZCwgXCJjb21wdXRlclwiKTtcbiAgbGV0IGN1cnJlbnRQbGF5ZXI7XG4gIGxldCBnYW1lT3ZlclN0YXRlID0gZmFsc2U7XG5cbiAgLy8gU3RvcmUgcGxheWVycyBpbiBhIHBsYXllciBvYmplY3RcbiAgY29uc3QgcGxheWVycyA9IHsgaHVtYW46IGh1bWFuUGxheWVyLCBjb21wdXRlcjogY29tcHV0ZXJQbGF5ZXIgfTtcblxuICAvLyBTZXQgdXAgcGhhc2VcbiAgY29uc3Qgc2V0VXAgPSAoKSA9PiB7XG4gICAgLy8gQXV0b21hdGljIHBsYWNlbWVudCBmb3IgY29tcHV0ZXJcbiAgICBjb21wdXRlclBsYXllci5wbGFjZVNoaXBzKCk7XG5cbiAgICAvLyBTZXQgdGhlIGN1cnJlbnQgcGxheWVyIHRvIGh1bWFuIHBsYXllclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBodW1hblBsYXllcjtcbiAgfTtcblxuICAvLyBHYW1lIGVuZGluZyBmdW5jdGlvblxuICBjb25zdCBlbmRHYW1lID0gKCkgPT4ge1xuICAgIGdhbWVPdmVyU3RhdGUgPSB0cnVlO1xuICB9O1xuXG4gIC8vIFRha2UgdHVybiBtZXRob2RcbiAgY29uc3QgdGFrZVR1cm4gPSAobW92ZSkgPT4ge1xuICAgIGxldCBmZWVkYmFjaztcblxuICAgIC8vIERldGVybWluZSB0aGUgb3Bwb25lbnQgYmFzZWQgb24gdGhlIGN1cnJlbnQgcGxheWVyXG4gICAgY29uc3Qgb3Bwb25lbnQgPVxuICAgICAgY3VycmVudFBsYXllciA9PT0gaHVtYW5QbGF5ZXIgPyBjb21wdXRlclBsYXllciA6IGh1bWFuUGxheWVyO1xuXG4gICAgLy8gQ2FsbCB0aGUgbWFrZU1vdmUgbWV0aG9kIG9uIHRoZSBjdXJyZW50IHBsYXllciB3aXRoIHRoZSBvcHBvbmVudCdzIGdhbWVib2FyZCBhbmQgc3RvcmUgYXMgbW92ZSBmZWVkYmFja1xuICAgIGNvbnN0IHJlc3VsdCA9IGN1cnJlbnRQbGF5ZXIubWFrZU1vdmUob3Bwb25lbnQuZ2FtZWJvYXJkLCBtb3ZlKTtcblxuICAgIC8vIElmIHJlc3VsdCBpcyBhIGhpdCwgY2hlY2sgd2hldGhlciB0aGUgc2hpcCBpcyBzdW5rXG4gICAgaWYgKHJlc3VsdC5oaXQpIHtcbiAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIHNoaXAgaXMgc3VuayBhbmQgYWRkIHJlc3VsdCBhcyB2YWx1ZSB0byBmZWVkYmFjayBvYmplY3Qgd2l0aCBrZXkgXCJpc1NoaXBTdW5rXCJcbiAgICAgIGlmIChvcHBvbmVudC5nYW1lYm9hcmQuaXNTaGlwU3VuayhyZXN1bHQuc2hpcFR5cGUpKSB7XG4gICAgICAgIGZlZWRiYWNrID0ge1xuICAgICAgICAgIC4uLnJlc3VsdCxcbiAgICAgICAgICBpc1NoaXBTdW5rOiB0cnVlLFxuICAgICAgICAgIGdhbWVXb246IG9wcG9uZW50LmdhbWVib2FyZC5jaGVja0FsbFNoaXBzU3VuaygpLFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmVlZGJhY2sgPSB7IC4uLnJlc3VsdCwgaXNTaGlwU3VuazogZmFsc2UgfTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFyZXN1bHQuaGl0KSB7XG4gICAgICAvLyBTZXQgZmVlZGJhY2sgdG8ganVzdCB0aGUgcmVzdWx0XG4gICAgICBmZWVkYmFjayA9IHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBJZiBnYW1lIGlzIHdvbiwgZW5kIGdhbWVcbiAgICBpZiAoZmVlZGJhY2suZ2FtZVdvbikge1xuICAgICAgZW5kR2FtZSgpO1xuICAgIH1cblxuICAgIC8vIFN3aXRjaCB0aGUgY3VycmVudCBwbGF5ZXJcbiAgICBjdXJyZW50UGxheWVyID0gb3Bwb25lbnQ7XG5cbiAgICAvLyBSZXR1cm4gdGhlIGZlZWRiYWNrIGZvciB0aGUgbW92ZVxuICAgIHJldHVybiBmZWVkYmFjaztcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldCBjdXJyZW50UGxheWVyKCkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRQbGF5ZXI7XG4gICAgfSxcbiAgICBnZXQgZ2FtZU92ZXJTdGF0ZSgpIHtcbiAgICAgIHJldHVybiBnYW1lT3ZlclN0YXRlO1xuICAgIH0sXG4gICAgcGxheWVycyxcbiAgICBzZXRVcCxcbiAgICB0YWtlVHVybixcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWU7XG4iLCJpbXBvcnQge1xuICBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IsXG4gIE92ZXJsYXBwaW5nU2hpcHNFcnJvcixcbiAgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IsXG4gIFJlcGVhdEF0dGFja2VkRXJyb3IsXG59IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBncmlkID0gW1xuICBbXCJBMVwiLCBcIkEyXCIsIFwiQTNcIiwgXCJBNFwiLCBcIkE1XCIsIFwiQTZcIiwgXCJBN1wiLCBcIkE4XCIsIFwiQTlcIiwgXCJBMTBcIl0sXG4gIFtcIkIxXCIsIFwiQjJcIiwgXCJCM1wiLCBcIkI0XCIsIFwiQjVcIiwgXCJCNlwiLCBcIkI3XCIsIFwiQjhcIiwgXCJCOVwiLCBcIkIxMFwiXSxcbiAgW1wiQzFcIiwgXCJDMlwiLCBcIkMzXCIsIFwiQzRcIiwgXCJDNVwiLCBcIkM2XCIsIFwiQzdcIiwgXCJDOFwiLCBcIkM5XCIsIFwiQzEwXCJdLFxuICBbXCJEMVwiLCBcIkQyXCIsIFwiRDNcIiwgXCJENFwiLCBcIkQ1XCIsIFwiRDZcIiwgXCJEN1wiLCBcIkQ4XCIsIFwiRDlcIiwgXCJEMTBcIl0sXG4gIFtcIkUxXCIsIFwiRTJcIiwgXCJFM1wiLCBcIkU0XCIsIFwiRTVcIiwgXCJFNlwiLCBcIkU3XCIsIFwiRThcIiwgXCJFOVwiLCBcIkUxMFwiXSxcbiAgW1wiRjFcIiwgXCJGMlwiLCBcIkYzXCIsIFwiRjRcIiwgXCJGNVwiLCBcIkY2XCIsIFwiRjdcIiwgXCJGOFwiLCBcIkY5XCIsIFwiRjEwXCJdLFxuICBbXCJHMVwiLCBcIkcyXCIsIFwiRzNcIiwgXCJHNFwiLCBcIkc1XCIsIFwiRzZcIiwgXCJHN1wiLCBcIkc4XCIsIFwiRzlcIiwgXCJHMTBcIl0sXG4gIFtcIkgxXCIsIFwiSDJcIiwgXCJIM1wiLCBcIkg0XCIsIFwiSDVcIiwgXCJINlwiLCBcIkg3XCIsIFwiSDhcIiwgXCJIOVwiLCBcIkgxMFwiXSxcbiAgW1wiSTFcIiwgXCJJMlwiLCBcIkkzXCIsIFwiSTRcIiwgXCJJNVwiLCBcIkk2XCIsIFwiSTdcIiwgXCJJOFwiLCBcIkk5XCIsIFwiSTEwXCJdLFxuICBbXCJKMVwiLCBcIkoyXCIsIFwiSjNcIiwgXCJKNFwiLCBcIko1XCIsIFwiSjZcIiwgXCJKN1wiLCBcIko4XCIsIFwiSjlcIiwgXCJKMTBcIl0sXG5dO1xuXG5jb25zdCBpbmRleENhbGNzID0gKHN0YXJ0KSA9PiB7XG4gIGNvbnN0IGNvbExldHRlciA9IHN0YXJ0WzBdLnRvVXBwZXJDYXNlKCk7IC8vIFRoaXMgaXMgdGhlIGNvbHVtblxuICBjb25zdCByb3dOdW1iZXIgPSBwYXJzZUludChzdGFydC5zbGljZSgxKSwgMTApOyAvLyBUaGlzIGlzIHRoZSByb3dcblxuICBjb25zdCBjb2xJbmRleCA9IGNvbExldHRlci5jaGFyQ29kZUF0KDApIC0gXCJBXCIuY2hhckNvZGVBdCgwKTsgLy8gQ29sdW1uIGluZGV4IGJhc2VkIG9uIGxldHRlclxuICBjb25zdCByb3dJbmRleCA9IHJvd051bWJlciAtIDE7IC8vIFJvdyBpbmRleCBiYXNlZCBvbiBudW1iZXJcblxuICByZXR1cm4gW2NvbEluZGV4LCByb3dJbmRleF07IC8vIFJldHVybiBbcm93LCBjb2x1bW5dXG59O1xuXG5jb25zdCBjaGVja1R5cGUgPSAoc2hpcCwgc2hpcFBvc2l0aW9ucykgPT4ge1xuICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIHNoaXBQb3NpdGlvbnMgb2JqZWN0XG4gIE9iamVjdC5rZXlzKHNoaXBQb3NpdGlvbnMpLmZvckVhY2goKGV4aXN0aW5nU2hpcFR5cGUpID0+IHtcbiAgICBpZiAoZXhpc3RpbmdTaGlwVHlwZSA9PT0gc2hpcCkge1xuICAgICAgdGhyb3cgbmV3IFNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvcihzaGlwKTtcbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgY2hlY2tCb3VuZGFyaWVzID0gKHNoaXBMZW5ndGgsIGNvb3JkcywgZGlyZWN0aW9uKSA9PiB7XG4gIC8vIFNldCByb3cgYW5kIGNvbCBsaW1pdHNcbiAgY29uc3QgeExpbWl0ID0gZ3JpZC5sZW5ndGg7IC8vIFRoaXMgaXMgdGhlIHRvdGFsIG51bWJlciBvZiBjb2x1bW5zICh4KVxuICBjb25zdCB5TGltaXQgPSBncmlkWzBdLmxlbmd0aDsgLy8gVGhpcyBpcyB0aGUgdG90YWwgbnVtYmVyIG9mIHJvd3MgKHkpXG5cbiAgY29uc3QgeCA9IGNvb3Jkc1swXTtcbiAgY29uc3QgeSA9IGNvb3Jkc1sxXTtcblxuICAvLyBDaGVjayBmb3IgdmFsaWQgc3RhcnQgcG9zaXRpb24gb24gYm9hcmRcbiAgaWYgKHggPCAwIHx8IHggPj0geExpbWl0IHx8IHkgPCAwIHx8IHkgPj0geUxpbWl0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gQ2hlY2sgcmlnaHQgYm91bmRhcnkgZm9yIGhvcml6b250YWwgcGxhY2VtZW50XG4gIGlmIChkaXJlY3Rpb24gPT09IFwiaFwiICYmIHggKyBzaGlwTGVuZ3RoID4geExpbWl0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIENoZWNrIGJvdHRvbSBib3VuZGFyeSBmb3IgdmVydGljYWwgcGxhY2VtZW50XG4gIGlmIChkaXJlY3Rpb24gPT09IFwidlwiICYmIHkgKyBzaGlwTGVuZ3RoID4geUxpbWl0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gSWYgbm9uZSBvZiB0aGUgaW52YWxpZCBjb25kaXRpb25zIGFyZSBtZXQsIHJldHVybiB0cnVlXG4gIHJldHVybiB0cnVlO1xufTtcblxuY29uc3QgY2FsY3VsYXRlU2hpcFBvc2l0aW9ucyA9IChzaGlwTGVuZ3RoLCBjb29yZHMsIGRpcmVjdGlvbikgPT4ge1xuICBjb25zdCBjb2xJbmRleCA9IGNvb3Jkc1swXTsgLy8gVGhpcyBpcyB0aGUgY29sdW1uIGluZGV4XG4gIGNvbnN0IHJvd0luZGV4ID0gY29vcmRzWzFdOyAvLyBUaGlzIGlzIHRoZSByb3cgaW5kZXhcblxuICBjb25zdCBwb3NpdGlvbnMgPSBbXTtcblxuICBpZiAoZGlyZWN0aW9uLnRvTG93ZXJDYXNlKCkgPT09IFwiaFwiKSB7XG4gICAgLy8gSG9yaXpvbnRhbCBwbGFjZW1lbnQ6IGluY3JlbWVudCB0aGUgY29sdW1uIGluZGV4XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKGdyaWRbY29sSW5kZXggKyBpXVtyb3dJbmRleF0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBWZXJ0aWNhbCBwbGFjZW1lbnQ6IGluY3JlbWVudCB0aGUgcm93IGluZGV4XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKGdyaWRbY29sSW5kZXhdW3Jvd0luZGV4ICsgaV0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwb3NpdGlvbnM7XG59O1xuXG5jb25zdCBjaGVja0Zvck92ZXJsYXAgPSAocG9zaXRpb25zLCBzaGlwUG9zaXRpb25zKSA9PiB7XG4gIE9iamVjdC5lbnRyaWVzKHNoaXBQb3NpdGlvbnMpLmZvckVhY2goKFtzaGlwVHlwZSwgZXhpc3RpbmdTaGlwUG9zaXRpb25zXSkgPT4ge1xuICAgIGlmIChcbiAgICAgIHBvc2l0aW9ucy5zb21lKChwb3NpdGlvbikgPT4gZXhpc3RpbmdTaGlwUG9zaXRpb25zLmluY2x1ZGVzKHBvc2l0aW9uKSlcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBPdmVybGFwcGluZ1NoaXBzRXJyb3IoXG4gICAgICAgIGBPdmVybGFwIGRldGVjdGVkIHdpdGggc2hpcCB0eXBlICR7c2hpcFR5cGV9YCxcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IGNoZWNrRm9ySGl0ID0gKHBvc2l0aW9uLCBzaGlwUG9zaXRpb25zKSA9PiB7XG4gIGNvbnN0IGZvdW5kU2hpcCA9IE9iamVjdC5lbnRyaWVzKHNoaXBQb3NpdGlvbnMpLmZpbmQoXG4gICAgKFtfLCBleGlzdGluZ1NoaXBQb3NpdGlvbnNdKSA9PiBleGlzdGluZ1NoaXBQb3NpdGlvbnMuaW5jbHVkZXMocG9zaXRpb24pLFxuICApO1xuXG4gIHJldHVybiBmb3VuZFNoaXAgPyB7IGhpdDogdHJ1ZSwgc2hpcFR5cGU6IGZvdW5kU2hpcFswXSB9IDogeyBoaXQ6IGZhbHNlIH07XG59O1xuXG5jb25zdCBHYW1lYm9hcmQgPSAoc2hpcEZhY3RvcnkpID0+IHtcbiAgY29uc3Qgc2hpcHMgPSB7fTtcbiAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IHt9O1xuICBjb25zdCBoaXRQb3NpdGlvbnMgPSB7fTtcbiAgY29uc3QgYXR0YWNrTG9nID0gW1tdLCBbXV07XG5cbiAgY29uc3QgcGxhY2VTaGlwID0gKHR5cGUsIHN0YXJ0LCBkaXJlY3Rpb24pID0+IHtcbiAgICBjb25zdCBuZXdTaGlwID0gc2hpcEZhY3RvcnkodHlwZSk7XG5cbiAgICAvLyBDaGVjayB0aGUgc2hpcCB0eXBlIGFnYWluc3QgZXhpc3RpbmcgdHlwZXNcbiAgICBjaGVja1R5cGUodHlwZSwgc2hpcFBvc2l0aW9ucyk7XG5cbiAgICAvLyBDYWxjdWxhdGUgc3RhcnQgcG9pbnQgY29vcmRpbmF0ZXMgYmFzZWQgb24gc3RhcnQgcG9pbnQgZ3JpZCBrZXlcbiAgICBjb25zdCBjb29yZHMgPSBpbmRleENhbGNzKHN0YXJ0KTtcblxuICAgIC8vIENoZWNrIGJvdW5kYXJpZXMsIGlmIG9rIGNvbnRpbnVlIHRvIG5leHQgc3RlcFxuICAgIGlmIChjaGVja0JvdW5kYXJpZXMobmV3U2hpcC5zaGlwTGVuZ3RoLCBjb29yZHMsIGRpcmVjdGlvbikpIHtcbiAgICAgIC8vIENhbGN1bGF0ZSBhbmQgc3RvcmUgcG9zaXRpb25zIGZvciBhIG5ldyBzaGlwXG4gICAgICBjb25zdCBwb3NpdGlvbnMgPSBjYWxjdWxhdGVTaGlwUG9zaXRpb25zKFxuICAgICAgICBuZXdTaGlwLnNoaXBMZW5ndGgsXG4gICAgICAgIGNvb3JkcyxcbiAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgKTtcblxuICAgICAgLy8gQ2hlY2sgZm9yIG92ZXJsYXAgYmVmb3JlIHBsYWNpbmcgdGhlIHNoaXBcbiAgICAgIGNoZWNrRm9yT3ZlcmxhcChwb3NpdGlvbnMsIHNoaXBQb3NpdGlvbnMpO1xuXG4gICAgICAvLyBJZiBubyBvdmVybGFwLCBwcm9jZWVkIHRvIHBsYWNlIHNoaXBcbiAgICAgIHNoaXBQb3NpdGlvbnNbdHlwZV0gPSBwb3NpdGlvbnM7XG4gICAgICAvLyBBZGQgc2hpcCB0byBzaGlwcyBvYmplY3RcbiAgICAgIHNoaXBzW3R5cGVdID0gbmV3U2hpcDtcblxuICAgICAgLy8gSW5pdGlhbGlzZSBoaXRQb3NpdGlvbnMgZm9yIHRoaXMgc2hpcCB0eXBlIGFzIGFuIGVtcHR5IGFycmF5XG4gICAgICBoaXRQb3NpdGlvbnNbdHlwZV0gPSBbXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yKFxuICAgICAgICBgSW52YWxpZCBzaGlwIHBsYWNlbWVudC4gQm91bmRhcnkgZXJyb3IhIFNoaXAgdHlwZTogJHt0eXBlfWAsXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZWdpc3RlciBhbiBhdHRhY2sgYW5kIHRlc3QgZm9yIHZhbGlkIGhpdFxuICBjb25zdCBhdHRhY2sgPSAocG9zaXRpb24pID0+IHtcbiAgICBsZXQgcmVzcG9uc2U7XG5cbiAgICAvLyBDaGVjayBmb3IgdmFsaWQgYXR0YWNrXG4gICAgaWYgKGF0dGFja0xvZ1swXS5pbmNsdWRlcyhwb3NpdGlvbikgfHwgYXR0YWNrTG9nWzFdLmluY2x1ZGVzKHBvc2l0aW9uKSkge1xuICAgICAgLy8gY29uc29sZS5sb2coYFJlcGVhdCBhdHRhY2s6ICR7cG9zaXRpb259YCk7XG4gICAgICB0aHJvdyBuZXcgUmVwZWF0QXR0YWNrZWRFcnJvcigpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciB2YWxpZCBoaXRcbiAgICBjb25zdCBjaGVja1Jlc3VsdHMgPSBjaGVja0ZvckhpdChwb3NpdGlvbiwgc2hpcFBvc2l0aW9ucyk7XG4gICAgaWYgKGNoZWNrUmVzdWx0cy5oaXQpIHtcbiAgICAgIC8vIFJlZ2lzdGVyIHZhbGlkIGhpdFxuICAgICAgaGl0UG9zaXRpb25zW2NoZWNrUmVzdWx0cy5zaGlwVHlwZV0ucHVzaChwb3NpdGlvbik7XG4gICAgICBzaGlwc1tjaGVja1Jlc3VsdHMuc2hpcFR5cGVdLmhpdCgpO1xuXG4gICAgICAvLyBMb2cgdGhlIGF0dGFjayBhcyBhIHZhbGlkIGhpdFxuICAgICAgYXR0YWNrTG9nWzBdLnB1c2gocG9zaXRpb24pO1xuICAgICAgcmVzcG9uc2UgPSB7IC4uLmNoZWNrUmVzdWx0cyB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhgTUlTUyE6ICR7cG9zaXRpb259YCk7XG4gICAgICAvLyBMb2cgdGhlIGF0dGFjayBhcyBhIG1pc3NcbiAgICAgIGF0dGFja0xvZ1sxXS5wdXNoKHBvc2l0aW9uKTtcbiAgICAgIHJlc3BvbnNlID0geyAuLi5jaGVja1Jlc3VsdHMgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH07XG5cbiAgY29uc3QgaXNTaGlwU3VuayA9ICh0eXBlKSA9PiBzaGlwc1t0eXBlXS5pc1N1bms7XG5cbiAgY29uc3QgY2hlY2tBbGxTaGlwc1N1bmsgPSAoKSA9PlxuICAgIE9iamVjdC5lbnRyaWVzKHNoaXBzKS5ldmVyeSgoW3NoaXBUeXBlLCBzaGlwXSkgPT4gc2hpcC5pc1N1bmspO1xuXG4gIC8vIEZ1bmN0aW9uIGZvciByZXBvcnRpbmcgdGhlIG51bWJlciBvZiBzaGlwcyBsZWZ0IGFmbG9hdFxuICBjb25zdCBzaGlwUmVwb3J0ID0gKCkgPT4ge1xuICAgIGNvbnN0IGZsb2F0aW5nU2hpcHMgPSBPYmplY3QuZW50cmllcyhzaGlwcylcbiAgICAgIC5maWx0ZXIoKFtzaGlwVHlwZSwgc2hpcF0pID0+ICFzaGlwLmlzU3VuaylcbiAgICAgIC5tYXAoKFtzaGlwVHlwZSwgX10pID0+IHNoaXBUeXBlKTtcblxuICAgIHJldHVybiBbZmxvYXRpbmdTaGlwcy5sZW5ndGgsIGZsb2F0aW5nU2hpcHNdO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgZ2V0IGdyaWQoKSB7XG4gICAgICByZXR1cm4gZ3JpZDtcbiAgICB9LFxuICAgIGdldCBzaGlwcygpIHtcbiAgICAgIHJldHVybiBzaGlwcztcbiAgICB9LFxuICAgIGdldCBhdHRhY2tMb2coKSB7XG4gICAgICByZXR1cm4gYXR0YWNrTG9nO1xuICAgIH0sXG4gICAgZ2V0U2hpcDogKHNoaXBUeXBlKSA9PiBzaGlwc1tzaGlwVHlwZV0sXG4gICAgZ2V0U2hpcFBvc2l0aW9uczogKHNoaXBUeXBlKSA9PiBzaGlwUG9zaXRpb25zW3NoaXBUeXBlXSxcbiAgICBnZXRIaXRQb3NpdGlvbnM6IChzaGlwVHlwZSkgPT4gaGl0UG9zaXRpb25zW3NoaXBUeXBlXSxcbiAgICBwbGFjZVNoaXAsXG4gICAgYXR0YWNrLFxuICAgIGlzU2hpcFN1bmssXG4gICAgY2hlY2tBbGxTaGlwc1N1bmssXG4gICAgc2hpcFJlcG9ydCxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVib2FyZDtcbiIsImltcG9ydCBcIi4vc3R5bGVzLmNzc1wiO1xuaW1wb3J0IEdhbWUgZnJvbSBcIi4vZ2FtZVwiO1xuaW1wb3J0IFVpTWFuYWdlciBmcm9tIFwiLi91aU1hbmFnZXJcIjtcbmltcG9ydCBBY3Rpb25Db250cm9sbGVyIGZyb20gXCIuL2FjdGlvbkNvbnRyb2xsZXJcIjtcblxuLy8gQ3JlYXRlIGEgbmV3IFVJIG1hbmFnZXJcbmNvbnN0IG5ld1VpTWFuYWdlciA9IFVpTWFuYWdlcigpO1xuXG4vLyBJbnN0YW50aWF0ZSBhIG5ldyBnYW1lXG5jb25zdCBuZXdHYW1lID0gR2FtZSgpO1xuXG4vLyBDcmVhdGUgYSBuZXcgYWN0aW9uIGNvbnRyb2xsZXJcbmNvbnN0IGFjdENvbnRyb2xsZXIgPSBBY3Rpb25Db250cm9sbGVyKG5ld1VpTWFuYWdlciwgbmV3R2FtZSk7XG5cbi8vIFdhaXQgZm9yIHRoZSBnYW1lIHRvIGJlIHNldHVwIHdpdGggc2hpcCBwbGFjZW1lbnRzIGV0Yy5cbmF3YWl0IGFjdENvbnRyb2xsZXIuaGFuZGxlU2V0dXAoKTtcblxuLy8gT25jZSByZWFkeSwgY2FsbCB0aGUgcGxheUdhbWUgbWV0aG9kXG5hd2FpdCBhY3RDb250cm9sbGVyLnBsYXlHYW1lKCk7XG5cbi8vIENvbnNvbGUgbG9nIHRoZSBwbGF5ZXJzXG5jb25zb2xlLmxvZyhcbiAgYFBsYXllcnM6IEZpcnN0IHBsYXllciBvZiB0eXBlICR7bmV3R2FtZS5wbGF5ZXJzLmh1bWFuLnR5cGV9LCBzZWNvbmQgcGxheWVyIG9mIHR5cGUgJHtuZXdHYW1lLnBsYXllcnMuY29tcHV0ZXIudHlwZX0hYCxcbik7XG4iLCJpbXBvcnQge1xuICBJbnZhbGlkUGxheWVyVHlwZUVycm9yLFxuICBJbnZhbGlkTW92ZUVudHJ5RXJyb3IsXG4gIFJlcGVhdEF0dGFja2VkRXJyb3IsXG4gIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yLFxuICBPdmVybGFwcGluZ1NoaXBzRXJyb3IsXG59IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBjaGVja01vdmUgPSAobW92ZSwgZ2JHcmlkKSA9PiB7XG4gIGxldCB2YWxpZCA9IGZhbHNlO1xuXG4gIGdiR3JpZC5mb3JFYWNoKChlbCkgPT4ge1xuICAgIGlmIChlbC5maW5kKChwKSA9PiBwID09PSBtb3ZlKSkge1xuICAgICAgdmFsaWQgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHZhbGlkO1xufTtcblxuY29uc3QgcmFuZE1vdmUgPSAoZ3JpZCwgbW92ZUxvZykgPT4ge1xuICAvLyBGbGF0dGVuIHRoZSBncmlkIGludG8gYSBzaW5nbGUgYXJyYXkgb2YgbW92ZXNcbiAgY29uc3QgYWxsTW92ZXMgPSBncmlkLmZsYXRNYXAoKHJvdykgPT4gcm93KTtcblxuICAvLyBGaWx0ZXIgb3V0IHRoZSBtb3ZlcyB0aGF0IGFyZSBhbHJlYWR5IGluIHRoZSBtb3ZlTG9nXG4gIGNvbnN0IHBvc3NpYmxlTW92ZXMgPSBhbGxNb3Zlcy5maWx0ZXIoKG1vdmUpID0+ICFtb3ZlTG9nLmluY2x1ZGVzKG1vdmUpKTtcblxuICAvLyBTZWxlY3QgYSByYW5kb20gbW92ZSBmcm9tIHRoZSBwb3NzaWJsZSBtb3Zlc1xuICBjb25zdCByYW5kb21Nb3ZlID1cbiAgICBwb3NzaWJsZU1vdmVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlTW92ZXMubGVuZ3RoKV07XG5cbiAgcmV0dXJuIHJhbmRvbU1vdmU7XG59O1xuXG5jb25zdCBnZW5lcmF0ZVJhbmRvbVN0YXJ0ID0gKHNpemUsIGRpcmVjdGlvbiwgZ3JpZCkgPT4ge1xuICBjb25zdCB2YWxpZFN0YXJ0cyA9IFtdO1xuXG4gIGlmIChkaXJlY3Rpb24gPT09IFwiaFwiKSB7XG4gICAgLy8gRm9yIGhvcml6b250YWwgb3JpZW50YXRpb24sIGxpbWl0IHRoZSBjb2x1bW5zXG4gICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgZ3JpZC5sZW5ndGggLSBzaXplICsgMTsgY29sKyspIHtcbiAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IGdyaWRbY29sXS5sZW5ndGg7IHJvdysrKSB7XG4gICAgICAgIHZhbGlkU3RhcnRzLnB1c2goZ3JpZFtjb2xdW3Jvd10pO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBGb3IgdmVydGljYWwgb3JpZW50YXRpb24sIGxpbWl0IHRoZSByb3dzXG4gICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgZ3JpZFswXS5sZW5ndGggLSBzaXplICsgMTsgcm93KyspIHtcbiAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IGdyaWQubGVuZ3RoOyBjb2wrKykge1xuICAgICAgICB2YWxpZFN0YXJ0cy5wdXNoKGdyaWRbY29sXVtyb3ddKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBSYW5kb21seSBzZWxlY3QgYSBzdGFydGluZyBwb3NpdGlvblxuICBjb25zdCByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHZhbGlkU3RhcnRzLmxlbmd0aCk7XG4gIHJldHVybiB2YWxpZFN0YXJ0c1tyYW5kb21JbmRleF07XG59O1xuXG5jb25zdCBhdXRvUGxhY2VtZW50ID0gKGdhbWVib2FyZCkgPT4ge1xuICBjb25zdCBzaGlwVHlwZXMgPSBbXG4gICAgeyB0eXBlOiBcImNhcnJpZXJcIiwgc2l6ZTogNSB9LFxuICAgIHsgdHlwZTogXCJiYXR0bGVzaGlwXCIsIHNpemU6IDQgfSxcbiAgICB7IHR5cGU6IFwiY3J1aXNlclwiLCBzaXplOiAzIH0sXG4gICAgeyB0eXBlOiBcInN1Ym1hcmluZVwiLCBzaXplOiAzIH0sXG4gICAgeyB0eXBlOiBcImRlc3Ryb3llclwiLCBzaXplOiAyIH0sXG4gIF07XG5cbiAgc2hpcFR5cGVzLmZvckVhY2goKHNoaXApID0+IHtcbiAgICBsZXQgcGxhY2VkID0gZmFsc2U7XG4gICAgd2hpbGUgKCFwbGFjZWQpIHtcbiAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IE1hdGgucmFuZG9tKCkgPCAwLjUgPyBcImhcIiA6IFwidlwiO1xuICAgICAgY29uc3Qgc3RhcnQgPSBnZW5lcmF0ZVJhbmRvbVN0YXJ0KHNoaXAuc2l6ZSwgZGlyZWN0aW9uLCBnYW1lYm9hcmQuZ3JpZCk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGdhbWVib2FyZC5wbGFjZVNoaXAoc2hpcC50eXBlLCBzdGFydCwgZGlyZWN0aW9uKTtcbiAgICAgICAgcGxhY2VkID0gdHJ1ZTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAhKGVycm9yIGluc3RhbmNlb2YgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IpICYmXG4gICAgICAgICAgIShlcnJvciBpbnN0YW5jZW9mIE92ZXJsYXBwaW5nU2hpcHNFcnJvcilcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7IC8vIFJldGhyb3cgbm9uLXBsYWNlbWVudCBlcnJvcnNcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiBwbGFjZW1lbnQgZmFpbHMsIGNhdGNoIHRoZSBlcnJvciBhbmQgdHJ5IGFnYWluXG4gICAgICB9XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IFBsYXllciA9IChnYW1lYm9hcmQsIHR5cGUpID0+IHtcbiAgY29uc3QgbW92ZUxvZyA9IFtdO1xuXG4gIGNvbnN0IHBsYWNlU2hpcHMgPSAoc2hpcFR5cGUsIHN0YXJ0LCBkaXJlY3Rpb24pID0+IHtcbiAgICBpZiAodHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICBnYW1lYm9hcmQucGxhY2VTaGlwKHNoaXBUeXBlLCBzdGFydCwgZGlyZWN0aW9uKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgYXV0b1BsYWNlbWVudChnYW1lYm9hcmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBsYXllclR5cGVFcnJvcihcbiAgICAgICAgYEludmFsaWQgcGxheWVyIHR5cGUuIFZhbGlkIHBsYXllciB0eXBlczogXCJodW1hblwiICYgXCJjb21wdXRlclwiLiBFbnRlcmVkOiAke3R5cGV9LmAsXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBtYWtlTW92ZSA9IChvcHBHYW1lYm9hcmQsIGlucHV0KSA9PiB7XG4gICAgbGV0IG1vdmU7XG5cbiAgICAvLyBDaGVjayBmb3IgdGhlIHR5cGUgb2YgcGxheWVyXG4gICAgaWYgKHR5cGUgPT09IFwiaHVtYW5cIikge1xuICAgICAgLy8gRm9ybWF0IHRoZSBpbnB1dFxuICAgICAgbW92ZSA9IGAke2lucHV0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpfSR7aW5wdXQuc3Vic3RyaW5nKDEpfWA7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImNvbXB1dGVyXCIpIHtcbiAgICAgIG1vdmUgPSByYW5kTW92ZShvcHBHYW1lYm9hcmQuZ3JpZCwgbW92ZUxvZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGxheWVyVHlwZUVycm9yKFxuICAgICAgICBgSW52YWxpZCBwbGF5ZXIgdHlwZS4gVmFsaWQgcGxheWVyIHR5cGVzOiBcImh1bWFuXCIgJiBcImNvbXB1dGVyXCIuIEVudGVyZWQ6ICR7dHlwZX0uYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhlIGlucHV0IGFnYWluc3QgdGhlIHBvc3NpYmxlIG1vdmVzIG9uIHRoZSBnYW1lYm9hcmQncyBncmlkXG4gICAgaWYgKCFjaGVja01vdmUobW92ZSwgb3BwR2FtZWJvYXJkLmdyaWQpKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZE1vdmVFbnRyeUVycm9yKGBJbnZhbGlkIG1vdmUgZW50cnkhIE1vdmU6ICR7bW92ZX0uYCk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIG1vdmUgZXhpc3RzIGluIHRoZSBtb3ZlTG9nIGFycmF5LCB0aHJvdyBhbiBlcnJvclxuICAgIGlmIChtb3ZlTG9nLmZpbmQoKGVsKSA9PiBlbCA9PT0gbW92ZSkpIHtcbiAgICAgIHRocm93IG5ldyBSZXBlYXRBdHRhY2tlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gRWxzZSwgY2FsbCBhdHRhY2sgbWV0aG9kIG9uIGdhbWVib2FyZCBhbmQgbG9nIG1vdmUgaW4gbW92ZUxvZ1xuICAgIGNvbnN0IHJlc3BvbnNlID0gb3BwR2FtZWJvYXJkLmF0dGFjayhtb3ZlKTtcbiAgICBtb3ZlTG9nLnB1c2gobW92ZSk7XG4gICAgLy8gUmV0dXJuIHRoZSByZXNwb25zZSBvZiB0aGUgYXR0YWNrIChvYmplY3Q6IHsgaGl0OiBmYWxzZSB9IGZvciBtaXNzOyB7IGhpdDogdHJ1ZSwgc2hpcFR5cGU6IHN0cmluZyB9IGZvciBoaXQpLlxuICAgIHJldHVybiB7IHBsYXllcjogdHlwZSwgbW92ZSwgLi4ucmVzcG9uc2UgfTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldCB0eXBlKCkge1xuICAgICAgcmV0dXJuIHR5cGU7XG4gICAgfSxcbiAgICBnZXQgZ2FtZWJvYXJkKCkge1xuICAgICAgcmV0dXJuIGdhbWVib2FyZDtcbiAgICB9LFxuICAgIGdldCBtb3ZlTG9nKCkge1xuICAgICAgcmV0dXJuIG1vdmVMb2c7XG4gICAgfSxcbiAgICBtYWtlTW92ZSxcbiAgICBwbGFjZVNoaXBzLFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgUGxheWVyO1xuIiwiaW1wb3J0IHsgSW52YWxpZFNoaXBUeXBlRXJyb3IgfSBmcm9tIFwiLi9lcnJvcnNcIjtcblxuY29uc3QgU2hpcCA9ICh0eXBlKSA9PiB7XG4gIGNvbnN0IHNldExlbmd0aCA9ICgpID0+IHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgXCJjYXJyaWVyXCI6XG4gICAgICAgIHJldHVybiA1O1xuICAgICAgY2FzZSBcImJhdHRsZXNoaXBcIjpcbiAgICAgICAgcmV0dXJuIDQ7XG4gICAgICBjYXNlIFwiY3J1aXNlclwiOlxuICAgICAgY2FzZSBcInN1Ym1hcmluZVwiOlxuICAgICAgICByZXR1cm4gMztcbiAgICAgIGNhc2UgXCJkZXN0cm95ZXJcIjpcbiAgICAgICAgcmV0dXJuIDI7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFNoaXBUeXBlRXJyb3IoKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgc2hpcExlbmd0aCA9IHNldExlbmd0aCgpO1xuXG4gIGxldCBoaXRzID0gMDtcblxuICBjb25zdCBoaXQgPSAoKSA9PiB7XG4gICAgaWYgKGhpdHMgPCBzaGlwTGVuZ3RoKSB7XG4gICAgICBoaXRzICs9IDE7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB7XG4gICAgZ2V0IHR5cGUoKSB7XG4gICAgICByZXR1cm4gdHlwZTtcbiAgICB9LFxuICAgIGdldCBzaGlwTGVuZ3RoKCkge1xuICAgICAgcmV0dXJuIHNoaXBMZW5ndGg7XG4gICAgfSxcbiAgICBnZXQgaGl0cygpIHtcbiAgICAgIHJldHVybiBoaXRzO1xuICAgIH0sXG4gICAgZ2V0IGlzU3VuaygpIHtcbiAgICAgIHJldHVybiBoaXRzID09PSBzaGlwTGVuZ3RoO1xuICAgIH0sXG4gICAgaGl0LFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU2hpcDtcbiIsImNvbnN0IGluc3RydWN0aW9uQ2xyID0gXCJ0ZXh0LWxpbWUtNjAwXCI7XG5jb25zdCBndWlkZUNsciA9IFwidGV4dC1za3ktNjAwXCI7XG5jb25zdCBlcnJvckNsciA9IFwidGV4dC1yZWQtNzAwXCI7XG5jb25zdCBkZWZhdWx0Q2xyID0gXCJ0ZXh0LWdyYXktNzAwXCI7XG5cbmNvbnN0IGNlbGxDbHIgPSBcImJnLWdyYXktMjAwXCI7XG5jb25zdCBpbnB1dENsciA9IFwiYmctZ3JheS00MDBcIjtcbmNvbnN0IG91cHV0Q2xyID0gY2VsbENscjtcbmNvbnN0IGJ1dHRvbkNsciA9IFwiYmctZ3JheS04MDBcIjtcbmNvbnN0IGJ1dHRvblRleHRDbHIgPSBcImJnLWdyYXktMTAwXCI7XG5cbmNvbnN0IHNoaXBTZWN0Q2xyID0gXCJiZy1za3ktNzAwXCI7XG5jb25zdCBwcmltYXJ5SG92ZXJDbHIgPSBcImhvdmVyOmJnLW9yYW5nZS01MDBcIjtcblxuLy8gRnVuY3Rpb24gZm9yIGJ1aWxkaW5nIGEgc2hpcCwgZGVwZW5kaW5nIG9uIHRoZSBzaGlwIHR5cGVcbmNvbnN0IGJ1aWxkU2hpcCA9IChvYmosIGRvbVNlbCwgc2hpcFBvc2l0aW9ucykgPT4ge1xuICAvLyBFeHRyYWN0IHRoZSBzaGlwJ3MgdHlwZSBhbmQgbGVuZ3RoIGZyb20gdGhlIG9iamVjdFxuICBjb25zdCB7IHR5cGUsIHNoaXBMZW5ndGg6IGxlbmd0aCB9ID0gb2JqO1xuICAvLyBDcmVhdGUgYW5kIGFycmF5IGZvciB0aGUgc2hpcCdzIHNlY3Rpb25zXG4gIGNvbnN0IHNoaXBTZWN0cyA9IFtdO1xuXG4gIC8vIFVzZSB0aGUgbGVuZ3RoIG9mIHRoZSBzaGlwIHRvIGNyZWF0ZSB0aGUgY29ycmVjdCBudW1iZXIgb2Ygc2VjdGlvbnNcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIC8vIEdldCBhIHBvc2l0aW9uIGZyb20gdGhlIGFycmF5XG4gICAgY29uc3QgcG9zaXRpb24gPSBzaGlwUG9zaXRpb25zW2ldO1xuICAgIC8vIENyZWF0ZSBhbiBlbGVtZW50IGZvciB0aGUgc2VjdGlvblxuICAgIGNvbnN0IHNlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHNlY3QuY2xhc3NOYW1lID0gYHctNCBoLTQgcm91bmRlZC1mdWxsYDsgLy8gU2V0IHRoZSBkZWZhdWx0IHN0eWxpbmcgZm9yIHRoZSBzZWN0aW9uIGVsZW1lbnRcbiAgICBzZWN0LmNsYXNzTGlzdC5hZGQoc2hpcFNlY3RDbHIpO1xuICAgIC8vIFNldCBhIHVuaXF1ZSBpZCBmb3IgdGhlIHNoaXAgc2VjdGlvblxuICAgIHNlY3Quc2V0QXR0cmlidXRlKFwiaWRcIiwgYERPTS0ke2RvbVNlbH0tc2hpcFR5cGUtJHt0eXBlfS1wb3MtJHtwb3NpdGlvbn1gKTtcbiAgICAvLyBTZXQgYSBkYXRhc2V0IHByb3BlcnR5IG9mIFwicG9zaXRpb25cIiBmb3IgdGhlIHNlY3Rpb25cbiAgICBzZWN0LmRhdGFzZXQucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICBzaGlwU2VjdHMucHVzaChzZWN0KTsgLy8gQWRkIHRoZSBzZWN0aW9uIHRvIHRoZSBhcnJheVxuICB9XG5cbiAgLy8gUmV0dXJuIHRoZSBhcnJheSBvZiBzaGlwIHNlY3Rpb25zXG4gIHJldHVybiBzaGlwU2VjdHM7XG59O1xuXG5jb25zdCBVaU1hbmFnZXIgPSAoKSA9PiB7XG4gIGNvbnN0IGNyZWF0ZUdhbWVib2FyZCA9IChjb250YWluZXJJRCkgPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcklEKTtcblxuICAgIC8vIFNldCBwbGF5ZXIgdHlwZSBkZXBlbmRpbmcgb24gdGhlIGNvbnRhaW5lcklEXG4gICAgY29uc3QgeyBwbGF5ZXIgfSA9IGNvbnRhaW5lci5kYXRhc2V0O1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBncmlkIGNvbnRhaW5lclxuICAgIGNvbnN0IGdyaWREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGdyaWREaXYuY2xhc3NOYW1lID1cbiAgICAgIFwiZ2FtZWJvYXJkLWFyZWEgZ3JpZCBncmlkLWNvbHMtMTEgYXV0by1yb3dzLW1pbiBnYXAtMSBwLTZcIjtcbiAgICBncmlkRGl2LmRhdGFzZXQucGxheWVyID0gcGxheWVyO1xuXG4gICAgLy8gQWRkIHRoZSB0b3AtbGVmdCBjb3JuZXIgZW1wdHkgY2VsbFxuICAgIGdyaWREaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSk7XG5cbiAgICAvLyBBZGQgY29sdW1uIGhlYWRlcnMgQS1KXG4gICAgY29uc3QgY29sdW1ucyA9IFwiQUJDREVGR0hJSlwiO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sdW1ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIGhlYWRlci5jbGFzc05hbWUgPSBcInRleHQtY2VudGVyXCI7XG4gICAgICBoZWFkZXIudGV4dENvbnRlbnQgPSBjb2x1bW5zW2ldO1xuICAgICAgZ3JpZERpdi5hcHBlbmRDaGlsZChoZWFkZXIpO1xuICAgIH1cblxuICAgIC8vIEFkZCByb3cgbGFiZWxzIGFuZCBjZWxsc1xuICAgIGZvciAobGV0IHJvdyA9IDE7IHJvdyA8PSAxMDsgcm93KyspIHtcbiAgICAgIC8vIFJvdyBsYWJlbFxuICAgICAgY29uc3Qgcm93TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgcm93TGFiZWwuY2xhc3NOYW1lID0gXCJ0ZXh0LWNlbnRlclwiO1xuICAgICAgcm93TGFiZWwudGV4dENvbnRlbnQgPSByb3c7XG4gICAgICBncmlkRGl2LmFwcGVuZENoaWxkKHJvd0xhYmVsKTtcblxuICAgICAgLy8gQ2VsbHMgZm9yIGVhY2ggcm93XG4gICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCAxMDsgY29sKyspIHtcbiAgICAgICAgY29uc3QgY2VsbElkID0gYCR7Y29sdW1uc1tjb2xdfSR7cm93fWA7IC8vIFNldCB0aGUgY2VsbElkXG4gICAgICAgIGNvbnN0IGNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjZWxsLmlkID0gYCR7cGxheWVyfS0ke2NlbGxJZH1gOyAvLyBTZXQgdGhlIGVsZW1lbnQgaWRcbiAgICAgICAgY2VsbC5jbGFzc05hbWUgPSBgdy02IGgtNiBmbGV4IGp1c3RpZnktY2VudGVyIGl0ZW1zLWNlbnRlciBjdXJzb3ItcG9pbnRlcmA7IC8vIEFkZCBtb3JlIGNsYXNzZXMgYXMgbmVlZGVkIGZvciBzdHlsaW5nXG4gICAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChwcmltYXJ5SG92ZXJDbHIpO1xuICAgICAgICBjZWxsLmNsYXNzTGlzdC5hZGQoY2VsbENscik7XG4gICAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChcImdhbWVib2FyZC1jZWxsXCIpOyAvLyBBZGQgYSBjbGFzcyBuYW1lIHRvIGVhY2ggY2VsbCB0byBhY3QgYXMgYSBzZWxlY3RvclxuICAgICAgICBjZWxsLmRhdGFzZXQucG9zaXRpb24gPSBjZWxsSWQ7IC8vIEFzc2lnbiBwb3NpdGlvbiBkYXRhIGF0dHJpYnV0ZSBmb3IgaWRlbnRpZmljYXRpb25cbiAgICAgICAgY2VsbC5kYXRhc2V0LnBsYXllciA9IHBsYXllcjsgLy8gQXNzaWduIHBsYXllciBkYXRhIGF0dHJpYnV0ZSBmb3IgaWRlbnRpZmljYXRpb25cblxuICAgICAgICBncmlkRGl2LmFwcGVuZENoaWxkKGNlbGwpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFwcGVuZCB0aGUgZ3JpZCB0byB0aGUgY29udGFpbmVyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGdyaWREaXYpO1xuICB9O1xuXG4gIGNvbnN0IGluaXRDb25zb2xlVUkgPSAoKSA9PiB7XG4gICAgY29uc3QgY29uc29sZUNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZVwiKTsgLy8gR2V0IHRoZSBjb25zb2xlIGNvbnRhaW5lciBmcm9tIHRoZSBET01cbiAgICBjb25zb2xlQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXG4gICAgICBcImZsZXhcIixcbiAgICAgIFwiZmxleC1jb2xcIixcbiAgICAgIFwianVzdGlmeS1iZXR3ZWVuXCIsXG4gICAgICBcInRleHQtc21cIixcbiAgICApOyAvLyBTZXQgZmxleGJveCBydWxlcyBmb3IgY29udGFpbmVyXG5cbiAgICAvLyBDcmVhdGUgYSBjb250YWluZXIgZm9yIHRoZSBpbnB1dCBhbmQgYnV0dG9uIGVsZW1lbnRzXG4gICAgY29uc3QgaW5wdXREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGlucHV0RGl2LmNsYXNzTmFtZSA9IFwiZmxleCBmbGV4LXJvdyB3LWZ1bGwgaC0xLzUganVzdGlmeS1iZXR3ZWVuXCI7IC8vIFNldCB0aGUgZmxleGJveCBydWxlcyBmb3IgdGhlIGNvbnRhaW5lclxuXG4gICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7IC8vIENyZWF0ZSBhbiBpbnB1dCBlbGVtZW50IGZvciB0aGUgY29uc29sZVxuICAgIGlucHV0LnR5cGUgPSBcInRleHRcIjsgLy8gU2V0IHRoZSBpbnB1dCB0eXBlIG9mIHRoaXMgZWxlbWVudCB0byB0ZXh0XG4gICAgaW5wdXQuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJjb25zb2xlLWlucHV0XCIpOyAvLyBTZXQgdGhlIGlkIGZvciB0aGlzIGVsZW1lbnQgdG8gXCJjb25zb2xlLWlucHV0XCJcbiAgICBpbnB1dC5jbGFzc05hbWUgPSBgcC0xIGZsZXgtMWA7IC8vIEFkZCBUYWlsd2luZENTUyBjbGFzc2VzXG4gICAgaW5wdXQuY2xhc3NMaXN0LmFkZChpbnB1dENscik7XG4gICAgY29uc3Qgc3VibWl0QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTsgLy8gQ3JlYXRlIGEgYnV0dG9uIGVsZW1lbnQgZm9yIHRoZSBjb25zb2xlIHN1Ym1pdFxuICAgIHN1Ym1pdEJ1dHRvbi50ZXh0Q29udGVudCA9IFwiU3VibWl0XCI7IC8vIEFkZCB0aGUgdGV4dCBcIlN1Ym1pdFwiIHRvIHRoZSBidXR0b25cbiAgICBzdWJtaXRCdXR0b24uc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJjb25zb2xlLXN1Ym1pdFwiKTsgLy8gU2V0IHRoZSBpZCBmb3IgdGhlIGJ1dHRvblxuICAgIHN1Ym1pdEJ1dHRvbi5jbGFzc05hbWUgPSBgcHgtMyBweS0xIHRleHQtY2VudGVyIHRleHQtc21gOyAvLyBBZGQgVGFpbHdpbmRDU1MgY2xhc3Nlc1xuICAgIHN1Ym1pdEJ1dHRvbi5jbGFzc0xpc3QuYWRkKGJ1dHRvbkNscik7XG4gICAgc3VibWl0QnV0dG9uLmNsYXNzTGlzdC5hZGQoYnV0dG9uVGV4dENscik7XG4gICAgY29uc3Qgb3V0cHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTsgLy8gQ3JlYXRlIGFuIGRpdiBlbGVtZW50IGZvciB0aGUgb3V0cHV0IG9mIHRoZSBjb25zb2xlXG4gICAgb3V0cHV0LnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY29uc29sZS1vdXRwdXRcIik7IC8vIFNldCB0aGUgaWQgZm9yIHRoZSBvdXRwdXQgZWxlbWVudFxuICAgIG91dHB1dC5jbGFzc05hbWUgPSBgcC0xIGZsZXgtMSBoLTQvNSBvdmVyZmxvdy1hdXRvYDsgLy8gQWRkIFRhaWx3aW5kQ1NTIGNsYXNzZXNcbiAgICBvdXRwdXQuY2xhc3NMaXN0LmFkZChvdXB1dENscik7XG5cbiAgICAvLyBBZGQgdGhlIGlucHV0IGVsZW1lbnRzIHRvIHRoZSBpbnB1dCBjb250YWluZXJcbiAgICBpbnB1dERpdi5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgaW5wdXREaXYuYXBwZW5kQ2hpbGQoc3VibWl0QnV0dG9uKTtcblxuICAgIC8vIEFwcGVuZCBlbGVtZW50cyB0byB0aGUgY29uc29sZSBjb250YWluZXJcbiAgICBjb25zb2xlQ29udGFpbmVyLmFwcGVuZENoaWxkKG91dHB1dCk7XG4gICAgY29uc29sZUNvbnRhaW5lci5hcHBlbmRDaGlsZChpbnB1dERpdik7XG4gIH07XG5cbiAgY29uc3QgZGlzcGxheVByb21wdCA9IChwcm9tcHRPYmpzKSA9PiB7XG4gICAgLy8gR2V0IHRoZSBwcm9tcHQgZGlzcGxheVxuICAgIGNvbnN0IGRpc3BsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByb21wdC1kaXNwbGF5XCIpO1xuXG4gICAgLy8gQ2xlYXIgdGhlIGRpc3BsYXkgb2YgYWxsIGNoaWxkcmVuXG4gICAgd2hpbGUgKGRpc3BsYXkuZmlyc3RDaGlsZCkge1xuICAgICAgZGlzcGxheS5yZW1vdmVDaGlsZChkaXNwbGF5LmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIC8vIEl0ZXJhdGUgb3ZlciBlYWNoIHByb21wdCBpbiB0aGUgcHJvbXB0cyBvYmplY3RcbiAgICBPYmplY3QuZW50cmllcyhwcm9tcHRPYmpzKS5mb3JFYWNoKChba2V5LCB7IHByb21wdCwgcHJvbXB0VHlwZSB9XSkgPT4ge1xuICAgICAgLy8gQ3JlYXRlIGEgbmV3IGRpdiBmb3IgZWFjaCBwcm9tcHRcbiAgICAgIGNvbnN0IHByb21wdERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBwcm9tcHREaXYudGV4dENvbnRlbnQgPSBwcm9tcHQ7XG5cbiAgICAgIC8vIEFwcGx5IHN0eWxpbmcgYmFzZWQgb24gcHJvbXB0VHlwZVxuICAgICAgc3dpdGNoIChwcm9tcHRUeXBlKSB7XG4gICAgICAgIGNhc2UgXCJpbnN0cnVjdGlvblwiOlxuICAgICAgICAgIHByb21wdERpdi5jbGFzc0xpc3QuYWRkKGluc3RydWN0aW9uQ2xyKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImd1aWRlXCI6XG4gICAgICAgICAgcHJvbXB0RGl2LmNsYXNzTGlzdC5hZGQoZ3VpZGVDbHIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICBwcm9tcHREaXYuY2xhc3NMaXN0LmFkZChlcnJvckNscik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcHJvbXB0RGl2LmNsYXNzTGlzdC5hZGQoZGVmYXVsdENscik7IC8vIERlZmF1bHQgdGV4dCBjb2xvclxuICAgICAgfVxuXG4gICAgICAvLyBBcHBlbmQgdGhlIG5ldyBkaXYgdG8gdGhlIGRpc3BsYXkgY29udGFpbmVyXG4gICAgICBkaXNwbGF5LmFwcGVuZENoaWxkKHByb21wdERpdik7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gZm9yIHJlbmRlcmluZyBzaGlwcyB0byB0aGUgU2hpcCBTdGF0dXMgZGlzcGxheSBzZWN0aW9uXG4gIGNvbnN0IHJlbmRlclNoaXBEaXNwID0gKHBsYXllck9iaiwgc2hpcFR5cGUpID0+IHtcbiAgICBsZXQgaWRTZWw7XG5cbiAgICAvLyBTZXQgdGhlIGNvcnJlY3QgaWQgc2VsZWN0b3IgZm9yIHRoZSB0eXBlIG9mIHBsYXllclxuICAgIGlmIChwbGF5ZXJPYmoudHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICBpZFNlbCA9IFwiaHVtYW4tZGlzcGxheVwiO1xuICAgIH0gZWxzZSBpZiAocGxheWVyT2JqLnR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgaWRTZWwgPSBcImNvbXAtZGlzcGxheVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcjtcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIGNvcnJlY3QgRE9NIGVsZW1lbnRcbiAgICBjb25zdCBkaXNwRGl2ID0gZG9jdW1lbnRcbiAgICAgIC5nZXRFbGVtZW50QnlJZChpZFNlbClcbiAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLnNoaXBzLWNvbnRhaW5lclwiKTtcblxuICAgIC8vIEdldCB0aGUgc2hpcCBmcm9tIHRoZSBwbGF5ZXJcbiAgICBjb25zdCBzaGlwID0gcGxheWVyT2JqLmdhbWVib2FyZC5nZXRTaGlwKHNoaXBUeXBlKTtcblxuICAgIC8vIENyZWF0ZSBhIGRpdiBmb3IgdGhlIHNoaXBcbiAgICBjb25zdCBzaGlwRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBzaGlwRGl2LmNsYXNzTmFtZSA9IFwicHgtNCBweS0yIGZsZXggZmxleC1jb2wgZ2FwLTFcIjtcblxuICAgIC8vIEFkZCBhIHRpdGxlIHRoZSB0aGUgZGl2XG4gICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaDJcIik7XG4gICAgdGl0bGUudGV4dENvbnRlbnQgPSBzaGlwVHlwZTsgLy8gU2V0IHRoZSB0aXRsZSB0byB0aGUgc2hpcCB0eXBlXG4gICAgc2hpcERpdi5hcHBlbmRDaGlsZCh0aXRsZSk7XG5cbiAgICAvLyBHZXQgdGhlIHNoaXAgcG9zaXRpb25zIGFycmF5XG4gICAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IHBsYXllck9iai5nYW1lYm9hcmQuZ2V0U2hpcFBvc2l0aW9ucyhzaGlwVHlwZSk7XG5cbiAgICAvLyBCdWlsZCB0aGUgc2hpcCBzZWN0aW9uc1xuICAgIGNvbnN0IHNoaXBTZWN0cyA9IGJ1aWxkU2hpcChzaGlwLCBpZFNlbCwgc2hpcFBvc2l0aW9ucyk7XG5cbiAgICAvLyBBZGQgdGhlIHNoaXAgc2VjdGlvbnMgdG8gdGhlIGRpdlxuICAgIGNvbnN0IHNlY3RzRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBzZWN0c0Rpdi5jbGFzc05hbWUgPSBcImZsZXggZmxleC1yb3cgZ2FwLTFcIjtcbiAgICBzaGlwU2VjdHMuZm9yRWFjaCgoc2VjdCkgPT4ge1xuICAgICAgc2VjdHNEaXYuYXBwZW5kQ2hpbGQoc2VjdCk7XG4gICAgfSk7XG4gICAgc2hpcERpdi5hcHBlbmRDaGlsZChzZWN0c0Rpdik7XG5cbiAgICBkaXNwRGl2LmFwcGVuZENoaWxkKHNoaXBEaXYpO1xuICB9O1xuXG4gIC8vIEZ1bmN0aW9uIGZvciByIHNoaXBzIG9uIHRoZSBnYW1lYm9hcmRcbiAgY29uc3QgcmVuZGVyU2hpcEJvYXJkID0gKHBsYXllck9iaiwgc2hpcFR5cGUpID0+IHtcbiAgICBsZXQgaWRTZWw7XG5cbiAgICAvLyBTZXQgdGhlIGNvcnJlY3QgaWQgc2VsZWN0b3IgZm9yIHRoZSB0eXBlIG9mIHBsYXllclxuICAgIGlmIChwbGF5ZXJPYmoudHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICBpZFNlbCA9IFwiaHVtYW4tYm9hcmRcIjtcbiAgICB9IGVsc2UgaWYgKHBsYXllck9iai50eXBlID09PSBcImNvbXB1dGVyXCIpIHtcbiAgICAgIGlkU2VsID0gXCJjb21wLWJvYXJkXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yKFwiTm8gbWF0Y2hpbmcgcGxheWVyIHR5cGUgaW4gJ3JlbmRlclNoaXBCb2FyZCcgZnVuY3Rpb25cIik7XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSBwbGF5ZXIncyB0eXBlIGFuZCBnYW1lYm9hcmRcbiAgICBjb25zdCB7IHR5cGU6IHBsYXllclR5cGUsIGdhbWVib2FyZCB9ID0gcGxheWVyT2JqO1xuXG4gICAgLy8gR2V0IHRoZSBzaGlwIGFuZCB0aGUgc2hpcCBwb3NpdGlvbnNcbiAgICBjb25zdCBzaGlwT2JqID0gZ2FtZWJvYXJkLmdldFNoaXAoc2hpcFR5cGUpO1xuICAgIGNvbnN0IHNoaXBQb3NpdGlvbnMgPSBnYW1lYm9hcmQuZ2V0U2hpcFBvc2l0aW9ucyhzaGlwVHlwZSk7XG5cbiAgICAvLyBCdWlsZCB0aGUgc2hpcCBzZWN0aW9uc1xuICAgIGNvbnN0IHNoaXBTZWN0cyA9IGJ1aWxkU2hpcChzaGlwT2JqLCBpZFNlbCwgc2hpcFBvc2l0aW9ucyk7XG5cbiAgICAvLyBNYXRjaCB0aGUgY2VsbCBwb3NpdGlvbnMgd2l0aCB0aGUgc2hpcCBzZWN0aW9ucyBhbmQgcGxhY2UgZWFjaFxuICAgIC8vIHNoaXAgc2VjdGlvbiBpbiB0aGUgY29ycmVzcG9uZGluZyBjZWxsIGVsZW1lbnRcbiAgICBzaGlwUG9zaXRpb25zLmZvckVhY2goKHBvc2l0aW9uKSA9PiB7XG4gICAgICBjb25zdCBjZWxsRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke3BsYXllclR5cGV9LSR7cG9zaXRpb259YCk7XG4gICAgICAvLyBGaW5kIHRoZSBzaGlwIHNlY3Rpb24gZWxlbWVudCB0aGF0IG1hdGNoZXMgdGhlIGN1cnJlbnQgcG9zaXRpb25cbiAgICAgIGNvbnN0IHNoaXBTZWN0ID0gc2hpcFNlY3RzLmZpbmQoXG4gICAgICAgIChzZWN0aW9uKSA9PiBzZWN0aW9uLmRhdGFzZXQucG9zaXRpb24gPT09IHBvc2l0aW9uLFxuICAgICAgKTtcblxuICAgICAgaWYgKGNlbGxFbGVtZW50ICYmIHNoaXBTZWN0KSB7XG4gICAgICAgIC8vIFBsYWNlIHRoZSBzaGlwIHNlY3Rpb24gaW4gdGhlIGNlbGxcbiAgICAgICAgY2VsbEVsZW1lbnQuYXBwZW5kQ2hpbGQoc2hpcFNlY3QpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgY3JlYXRlR2FtZWJvYXJkLFxuICAgIGluaXRDb25zb2xlVUksXG4gICAgZGlzcGxheVByb21wdCxcbiAgICByZW5kZXJTaGlwRGlzcCxcbiAgICByZW5kZXJTaGlwQm9hcmQsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBVaU1hbmFnZXI7XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBgLypcbiEgdGFpbHdpbmRjc3MgdjMuNC4xIHwgTUlUIExpY2Vuc2UgfCBodHRwczovL3RhaWx3aW5kY3NzLmNvbVxuKi8vKlxuMS4gUHJldmVudCBwYWRkaW5nIGFuZCBib3JkZXIgZnJvbSBhZmZlY3RpbmcgZWxlbWVudCB3aWR0aC4gKGh0dHBzOi8vZ2l0aHViLmNvbS9tb3pkZXZzL2Nzc3JlbWVkeS9pc3N1ZXMvNClcbjIuIEFsbG93IGFkZGluZyBhIGJvcmRlciB0byBhbiBlbGVtZW50IGJ5IGp1c3QgYWRkaW5nIGEgYm9yZGVyLXdpZHRoLiAoaHR0cHM6Ly9naXRodWIuY29tL3RhaWx3aW5kY3NzL3RhaWx3aW5kY3NzL3B1bGwvMTE2KVxuKi9cblxuKixcbjo6YmVmb3JlLFxuOjphZnRlciB7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7IC8qIDEgKi9cbiAgYm9yZGVyLXdpZHRoOiAwOyAvKiAyICovXG4gIGJvcmRlci1zdHlsZTogc29saWQ7IC8qIDIgKi9cbiAgYm9yZGVyLWNvbG9yOiAjZTVlN2ViOyAvKiAyICovXG59XG5cbjo6YmVmb3JlLFxuOjphZnRlciB7XG4gIC0tdHctY29udGVudDogJyc7XG59XG5cbi8qXG4xLiBVc2UgYSBjb25zaXN0ZW50IHNlbnNpYmxlIGxpbmUtaGVpZ2h0IGluIGFsbCBicm93c2Vycy5cbjIuIFByZXZlbnQgYWRqdXN0bWVudHMgb2YgZm9udCBzaXplIGFmdGVyIG9yaWVudGF0aW9uIGNoYW5nZXMgaW4gaU9TLlxuMy4gVXNlIGEgbW9yZSByZWFkYWJsZSB0YWIgc2l6ZS5cbjQuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgc2Fuc1xcYCBmb250LWZhbWlseSBieSBkZWZhdWx0LlxuNS4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBzYW5zXFxgIGZvbnQtZmVhdHVyZS1zZXR0aW5ncyBieSBkZWZhdWx0LlxuNi4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBzYW5zXFxgIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzIGJ5IGRlZmF1bHQuXG43LiBEaXNhYmxlIHRhcCBoaWdobGlnaHRzIG9uIGlPU1xuKi9cblxuaHRtbCxcbjpob3N0IHtcbiAgbGluZS1oZWlnaHQ6IDEuNTsgLyogMSAqL1xuICAtd2Via2l0LXRleHQtc2l6ZS1hZGp1c3Q6IDEwMCU7IC8qIDIgKi9cbiAgLW1vei10YWItc2l6ZTogNDsgLyogMyAqL1xuICAtby10YWItc2l6ZTogNDtcbiAgICAgdGFiLXNpemU6IDQ7IC8qIDMgKi9cbiAgZm9udC1mYW1pbHk6IHVpLXNhbnMtc2VyaWYsIHN5c3RlbS11aSwgc2Fucy1zZXJpZiwgXCJBcHBsZSBDb2xvciBFbW9qaVwiLCBcIlNlZ29lIFVJIEVtb2ppXCIsIFwiU2Vnb2UgVUkgU3ltYm9sXCIsIFwiTm90byBDb2xvciBFbW9qaVwiOyAvKiA0ICovXG4gIGZvbnQtZmVhdHVyZS1zZXR0aW5nczogbm9ybWFsOyAvKiA1ICovXG4gIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzOiBub3JtYWw7IC8qIDYgKi9cbiAgLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOiB0cmFuc3BhcmVudDsgLyogNyAqL1xufVxuXG4vKlxuMS4gUmVtb3ZlIHRoZSBtYXJnaW4gaW4gYWxsIGJyb3dzZXJzLlxuMi4gSW5oZXJpdCBsaW5lLWhlaWdodCBmcm9tIFxcYGh0bWxcXGAgc28gdXNlcnMgY2FuIHNldCB0aGVtIGFzIGEgY2xhc3MgZGlyZWN0bHkgb24gdGhlIFxcYGh0bWxcXGAgZWxlbWVudC5cbiovXG5cbmJvZHkge1xuICBtYXJnaW46IDA7IC8qIDEgKi9cbiAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7IC8qIDIgKi9cbn1cblxuLypcbjEuIEFkZCB0aGUgY29ycmVjdCBoZWlnaHQgaW4gRmlyZWZveC5cbjIuIENvcnJlY3QgdGhlIGluaGVyaXRhbmNlIG9mIGJvcmRlciBjb2xvciBpbiBGaXJlZm94LiAoaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTkwNjU1KVxuMy4gRW5zdXJlIGhvcml6b250YWwgcnVsZXMgYXJlIHZpc2libGUgYnkgZGVmYXVsdC5cbiovXG5cbmhyIHtcbiAgaGVpZ2h0OiAwOyAvKiAxICovXG4gIGNvbG9yOiBpbmhlcml0OyAvKiAyICovXG4gIGJvcmRlci10b3Atd2lkdGg6IDFweDsgLyogMyAqL1xufVxuXG4vKlxuQWRkIHRoZSBjb3JyZWN0IHRleHQgZGVjb3JhdGlvbiBpbiBDaHJvbWUsIEVkZ2UsIGFuZCBTYWZhcmkuXG4qL1xuXG5hYmJyOndoZXJlKFt0aXRsZV0pIHtcbiAgLXdlYmtpdC10ZXh0LWRlY29yYXRpb246IHVuZGVybGluZSBkb3R0ZWQ7XG4gICAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmUgZG90dGVkO1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBkZWZhdWx0IGZvbnQgc2l6ZSBhbmQgd2VpZ2h0IGZvciBoZWFkaW5ncy5cbiovXG5cbmgxLFxuaDIsXG5oMyxcbmg0LFxuaDUsXG5oNiB7XG4gIGZvbnQtc2l6ZTogaW5oZXJpdDtcbiAgZm9udC13ZWlnaHQ6IGluaGVyaXQ7XG59XG5cbi8qXG5SZXNldCBsaW5rcyB0byBvcHRpbWl6ZSBmb3Igb3B0LWluIHN0eWxpbmcgaW5zdGVhZCBvZiBvcHQtb3V0LlxuKi9cblxuYSB7XG4gIGNvbG9yOiBpbmhlcml0O1xuICB0ZXh0LWRlY29yYXRpb246IGluaGVyaXQ7XG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgZm9udCB3ZWlnaHQgaW4gRWRnZSBhbmQgU2FmYXJpLlxuKi9cblxuYixcbnN0cm9uZyB7XG4gIGZvbnQtd2VpZ2h0OiBib2xkZXI7XG59XG5cbi8qXG4xLiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYG1vbm9cXGAgZm9udC1mYW1pbHkgYnkgZGVmYXVsdC5cbjIuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgbW9ub1xcYCBmb250LWZlYXR1cmUtc2V0dGluZ3MgYnkgZGVmYXVsdC5cbjMuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgbW9ub1xcYCBmb250LXZhcmlhdGlvbi1zZXR0aW5ncyBieSBkZWZhdWx0LlxuNC4gQ29ycmVjdCB0aGUgb2RkIFxcYGVtXFxgIGZvbnQgc2l6aW5nIGluIGFsbCBicm93c2Vycy5cbiovXG5cbmNvZGUsXG5rYmQsXG5zYW1wLFxucHJlIHtcbiAgZm9udC1mYW1pbHk6IHVpLW1vbm9zcGFjZSwgU0ZNb25vLVJlZ3VsYXIsIE1lbmxvLCBNb25hY28sIENvbnNvbGFzLCBcIkxpYmVyYXRpb24gTW9ub1wiLCBcIkNvdXJpZXIgTmV3XCIsIG1vbm9zcGFjZTsgLyogMSAqL1xuICBmb250LWZlYXR1cmUtc2V0dGluZ3M6IG5vcm1hbDsgLyogMiAqL1xuICBmb250LXZhcmlhdGlvbi1zZXR0aW5nczogbm9ybWFsOyAvKiAzICovXG4gIGZvbnQtc2l6ZTogMWVtOyAvKiA0ICovXG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgZm9udCBzaXplIGluIGFsbCBicm93c2Vycy5cbiovXG5cbnNtYWxsIHtcbiAgZm9udC1zaXplOiA4MCU7XG59XG5cbi8qXG5QcmV2ZW50IFxcYHN1YlxcYCBhbmQgXFxgc3VwXFxgIGVsZW1lbnRzIGZyb20gYWZmZWN0aW5nIHRoZSBsaW5lIGhlaWdodCBpbiBhbGwgYnJvd3NlcnMuXG4qL1xuXG5zdWIsXG5zdXAge1xuICBmb250LXNpemU6IDc1JTtcbiAgbGluZS1oZWlnaHQ6IDA7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xufVxuXG5zdWIge1xuICBib3R0b206IC0wLjI1ZW07XG59XG5cbnN1cCB7XG4gIHRvcDogLTAuNWVtO1xufVxuXG4vKlxuMS4gUmVtb3ZlIHRleHQgaW5kZW50YXRpb24gZnJvbSB0YWJsZSBjb250ZW50cyBpbiBDaHJvbWUgYW5kIFNhZmFyaS4gKGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTk5OTA4OCwgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTIwMTI5NylcbjIuIENvcnJlY3QgdGFibGUgYm9yZGVyIGNvbG9yIGluaGVyaXRhbmNlIGluIGFsbCBDaHJvbWUgYW5kIFNhZmFyaS4gKGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTkzNTcyOSwgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE5NTAxNilcbjMuIFJlbW92ZSBnYXBzIGJldHdlZW4gdGFibGUgYm9yZGVycyBieSBkZWZhdWx0LlxuKi9cblxudGFibGUge1xuICB0ZXh0LWluZGVudDogMDsgLyogMSAqL1xuICBib3JkZXItY29sb3I6IGluaGVyaXQ7IC8qIDIgKi9cbiAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsgLyogMyAqL1xufVxuXG4vKlxuMS4gQ2hhbmdlIHRoZSBmb250IHN0eWxlcyBpbiBhbGwgYnJvd3NlcnMuXG4yLiBSZW1vdmUgdGhlIG1hcmdpbiBpbiBGaXJlZm94IGFuZCBTYWZhcmkuXG4zLiBSZW1vdmUgZGVmYXVsdCBwYWRkaW5nIGluIGFsbCBicm93c2Vycy5cbiovXG5cbmJ1dHRvbixcbmlucHV0LFxub3B0Z3JvdXAsXG5zZWxlY3QsXG50ZXh0YXJlYSB7XG4gIGZvbnQtZmFtaWx5OiBpbmhlcml0OyAvKiAxICovXG4gIGZvbnQtZmVhdHVyZS1zZXR0aW5nczogaW5oZXJpdDsgLyogMSAqL1xuICBmb250LXZhcmlhdGlvbi1zZXR0aW5nczogaW5oZXJpdDsgLyogMSAqL1xuICBmb250LXNpemU6IDEwMCU7IC8qIDEgKi9cbiAgZm9udC13ZWlnaHQ6IGluaGVyaXQ7IC8qIDEgKi9cbiAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7IC8qIDEgKi9cbiAgY29sb3I6IGluaGVyaXQ7IC8qIDEgKi9cbiAgbWFyZ2luOiAwOyAvKiAyICovXG4gIHBhZGRpbmc6IDA7IC8qIDMgKi9cbn1cblxuLypcblJlbW92ZSB0aGUgaW5oZXJpdGFuY2Ugb2YgdGV4dCB0cmFuc2Zvcm0gaW4gRWRnZSBhbmQgRmlyZWZveC5cbiovXG5cbmJ1dHRvbixcbnNlbGVjdCB7XG4gIHRleHQtdHJhbnNmb3JtOiBub25lO1xufVxuXG4vKlxuMS4gQ29ycmVjdCB0aGUgaW5hYmlsaXR5IHRvIHN0eWxlIGNsaWNrYWJsZSB0eXBlcyBpbiBpT1MgYW5kIFNhZmFyaS5cbjIuIFJlbW92ZSBkZWZhdWx0IGJ1dHRvbiBzdHlsZXMuXG4qL1xuXG5idXR0b24sXG5bdHlwZT0nYnV0dG9uJ10sXG5bdHlwZT0ncmVzZXQnXSxcblt0eXBlPSdzdWJtaXQnXSB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogYnV0dG9uOyAvKiAxICovXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50OyAvKiAyICovXG4gIGJhY2tncm91bmQtaW1hZ2U6IG5vbmU7IC8qIDIgKi9cbn1cblxuLypcblVzZSB0aGUgbW9kZXJuIEZpcmVmb3ggZm9jdXMgc3R5bGUgZm9yIGFsbCBmb2N1c2FibGUgZWxlbWVudHMuXG4qL1xuXG46LW1vei1mb2N1c3Jpbmcge1xuICBvdXRsaW5lOiBhdXRvO1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBhZGRpdGlvbmFsIFxcYDppbnZhbGlkXFxgIHN0eWxlcyBpbiBGaXJlZm94LiAoaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvZ2Vja28tZGV2L2Jsb2IvMmY5ZWFjZDlkM2Q5OTVjOTM3YjQyNTFhNTU1N2Q5NWQ0OTRjOWJlMS9sYXlvdXQvc3R5bGUvcmVzL2Zvcm1zLmNzcyNMNzI4LUw3MzcpXG4qL1xuXG46LW1vei11aS1pbnZhbGlkIHtcbiAgYm94LXNoYWRvdzogbm9uZTtcbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCB2ZXJ0aWNhbCBhbGlnbm1lbnQgaW4gQ2hyb21lIGFuZCBGaXJlZm94LlxuKi9cblxucHJvZ3Jlc3Mge1xuICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XG59XG5cbi8qXG5Db3JyZWN0IHRoZSBjdXJzb3Igc3R5bGUgb2YgaW5jcmVtZW50IGFuZCBkZWNyZW1lbnQgYnV0dG9ucyBpbiBTYWZhcmkuXG4qL1xuXG46Oi13ZWJraXQtaW5uZXItc3Bpbi1idXR0b24sXG46Oi13ZWJraXQtb3V0ZXItc3Bpbi1idXR0b24ge1xuICBoZWlnaHQ6IGF1dG87XG59XG5cbi8qXG4xLiBDb3JyZWN0IHRoZSBvZGQgYXBwZWFyYW5jZSBpbiBDaHJvbWUgYW5kIFNhZmFyaS5cbjIuIENvcnJlY3QgdGhlIG91dGxpbmUgc3R5bGUgaW4gU2FmYXJpLlxuKi9cblxuW3R5cGU9J3NlYXJjaCddIHtcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiB0ZXh0ZmllbGQ7IC8qIDEgKi9cbiAgb3V0bGluZS1vZmZzZXQ6IC0ycHg7IC8qIDIgKi9cbn1cblxuLypcblJlbW92ZSB0aGUgaW5uZXIgcGFkZGluZyBpbiBDaHJvbWUgYW5kIFNhZmFyaSBvbiBtYWNPUy5cbiovXG5cbjo6LXdlYmtpdC1zZWFyY2gtZGVjb3JhdGlvbiB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcbn1cblxuLypcbjEuIENvcnJlY3QgdGhlIGluYWJpbGl0eSB0byBzdHlsZSBjbGlja2FibGUgdHlwZXMgaW4gaU9TIGFuZCBTYWZhcmkuXG4yLiBDaGFuZ2UgZm9udCBwcm9wZXJ0aWVzIHRvIFxcYGluaGVyaXRcXGAgaW4gU2FmYXJpLlxuKi9cblxuOjotd2Via2l0LWZpbGUtdXBsb2FkLWJ1dHRvbiB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogYnV0dG9uOyAvKiAxICovXG4gIGZvbnQ6IGluaGVyaXQ7IC8qIDIgKi9cbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCBkaXNwbGF5IGluIENocm9tZSBhbmQgU2FmYXJpLlxuKi9cblxuc3VtbWFyeSB7XG4gIGRpc3BsYXk6IGxpc3QtaXRlbTtcbn1cblxuLypcblJlbW92ZXMgdGhlIGRlZmF1bHQgc3BhY2luZyBhbmQgYm9yZGVyIGZvciBhcHByb3ByaWF0ZSBlbGVtZW50cy5cbiovXG5cbmJsb2NrcXVvdGUsXG5kbCxcbmRkLFxuaDEsXG5oMixcbmgzLFxuaDQsXG5oNSxcbmg2LFxuaHIsXG5maWd1cmUsXG5wLFxucHJlIHtcbiAgbWFyZ2luOiAwO1xufVxuXG5maWVsZHNldCB7XG4gIG1hcmdpbjogMDtcbiAgcGFkZGluZzogMDtcbn1cblxubGVnZW5kIHtcbiAgcGFkZGluZzogMDtcbn1cblxub2wsXG51bCxcbm1lbnUge1xuICBsaXN0LXN0eWxlOiBub25lO1xuICBtYXJnaW46IDA7XG4gIHBhZGRpbmc6IDA7XG59XG5cbi8qXG5SZXNldCBkZWZhdWx0IHN0eWxpbmcgZm9yIGRpYWxvZ3MuXG4qL1xuZGlhbG9nIHtcbiAgcGFkZGluZzogMDtcbn1cblxuLypcblByZXZlbnQgcmVzaXppbmcgdGV4dGFyZWFzIGhvcml6b250YWxseSBieSBkZWZhdWx0LlxuKi9cblxudGV4dGFyZWEge1xuICByZXNpemU6IHZlcnRpY2FsO1xufVxuXG4vKlxuMS4gUmVzZXQgdGhlIGRlZmF1bHQgcGxhY2Vob2xkZXIgb3BhY2l0eSBpbiBGaXJlZm94LiAoaHR0cHM6Ly9naXRodWIuY29tL3RhaWx3aW5kbGFicy90YWlsd2luZGNzcy9pc3N1ZXMvMzMwMClcbjIuIFNldCB0aGUgZGVmYXVsdCBwbGFjZWhvbGRlciBjb2xvciB0byB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgZ3JheSA0MDAgY29sb3IuXG4qL1xuXG5pbnB1dDo6LW1vei1wbGFjZWhvbGRlciwgdGV4dGFyZWE6Oi1tb3otcGxhY2Vob2xkZXIge1xuICBvcGFjaXR5OiAxOyAvKiAxICovXG4gIGNvbG9yOiAjOWNhM2FmOyAvKiAyICovXG59XG5cbmlucHV0OjpwbGFjZWhvbGRlcixcbnRleHRhcmVhOjpwbGFjZWhvbGRlciB7XG4gIG9wYWNpdHk6IDE7IC8qIDEgKi9cbiAgY29sb3I6ICM5Y2EzYWY7IC8qIDIgKi9cbn1cblxuLypcblNldCB0aGUgZGVmYXVsdCBjdXJzb3IgZm9yIGJ1dHRvbnMuXG4qL1xuXG5idXR0b24sXG5bcm9sZT1cImJ1dHRvblwiXSB7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cblxuLypcbk1ha2Ugc3VyZSBkaXNhYmxlZCBidXR0b25zIGRvbid0IGdldCB0aGUgcG9pbnRlciBjdXJzb3IuXG4qL1xuOmRpc2FibGVkIHtcbiAgY3Vyc29yOiBkZWZhdWx0O1xufVxuXG4vKlxuMS4gTWFrZSByZXBsYWNlZCBlbGVtZW50cyBcXGBkaXNwbGF5OiBibG9ja1xcYCBieSBkZWZhdWx0LiAoaHR0cHM6Ly9naXRodWIuY29tL21vemRldnMvY3NzcmVtZWR5L2lzc3Vlcy8xNClcbjIuIEFkZCBcXGB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlXFxgIHRvIGFsaWduIHJlcGxhY2VkIGVsZW1lbnRzIG1vcmUgc2Vuc2libHkgYnkgZGVmYXVsdC4gKGh0dHBzOi8vZ2l0aHViLmNvbS9qZW5zaW1tb25zL2Nzc3JlbWVkeS9pc3N1ZXMvMTQjaXNzdWVjb21tZW50LTYzNDkzNDIxMClcbiAgIFRoaXMgY2FuIHRyaWdnZXIgYSBwb29ybHkgY29uc2lkZXJlZCBsaW50IGVycm9yIGluIHNvbWUgdG9vbHMgYnV0IGlzIGluY2x1ZGVkIGJ5IGRlc2lnbi5cbiovXG5cbmltZyxcbnN2ZyxcbnZpZGVvLFxuY2FudmFzLFxuYXVkaW8sXG5pZnJhbWUsXG5lbWJlZCxcbm9iamVjdCB7XG4gIGRpc3BsYXk6IGJsb2NrOyAvKiAxICovXG4gIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7IC8qIDIgKi9cbn1cblxuLypcbkNvbnN0cmFpbiBpbWFnZXMgYW5kIHZpZGVvcyB0byB0aGUgcGFyZW50IHdpZHRoIGFuZCBwcmVzZXJ2ZSB0aGVpciBpbnRyaW5zaWMgYXNwZWN0IHJhdGlvLiAoaHR0cHM6Ly9naXRodWIuY29tL21vemRldnMvY3NzcmVtZWR5L2lzc3Vlcy8xNClcbiovXG5cbmltZyxcbnZpZGVvIHtcbiAgbWF4LXdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IGF1dG87XG59XG5cbi8qIE1ha2UgZWxlbWVudHMgd2l0aCB0aGUgSFRNTCBoaWRkZW4gYXR0cmlidXRlIHN0YXkgaGlkZGVuIGJ5IGRlZmF1bHQgKi9cbltoaWRkZW5dIHtcbiAgZGlzcGxheTogbm9uZTtcbn1cblxuKiwgOjpiZWZvcmUsIDo6YWZ0ZXIge1xuICAtLXR3LWJvcmRlci1zcGFjaW5nLXg6IDA7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteTogMDtcbiAgLS10dy10cmFuc2xhdGUteDogMDtcbiAgLS10dy10cmFuc2xhdGUteTogMDtcbiAgLS10dy1yb3RhdGU6IDA7XG4gIC0tdHctc2tldy14OiAwO1xuICAtLXR3LXNrZXcteTogMDtcbiAgLS10dy1zY2FsZS14OiAxO1xuICAtLXR3LXNjYWxlLXk6IDE7XG4gIC0tdHctcGFuLXg6ICA7XG4gIC0tdHctcGFuLXk6ICA7XG4gIC0tdHctcGluY2gtem9vbTogIDtcbiAgLS10dy1zY3JvbGwtc25hcC1zdHJpY3RuZXNzOiBwcm94aW1pdHk7XG4gIC0tdHctZ3JhZGllbnQtZnJvbS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC12aWEtcG9zaXRpb246ICA7XG4gIC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb246ICA7XG4gIC0tdHctb3JkaW5hbDogIDtcbiAgLS10dy1zbGFzaGVkLXplcm86ICA7XG4gIC0tdHctbnVtZXJpYy1maWd1cmU6ICA7XG4gIC0tdHctbnVtZXJpYy1zcGFjaW5nOiAgO1xuICAtLXR3LW51bWVyaWMtZnJhY3Rpb246ICA7XG4gIC0tdHctcmluZy1pbnNldDogIDtcbiAgLS10dy1yaW5nLW9mZnNldC13aWR0aDogMHB4O1xuICAtLXR3LXJpbmctb2Zmc2V0LWNvbG9yOiAjZmZmO1xuICAtLXR3LXJpbmctY29sb3I6IHJnYig1OSAxMzAgMjQ2IC8gMC41KTtcbiAgLS10dy1yaW5nLW9mZnNldC1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1yaW5nLXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdy1jb2xvcmVkOiAwIDAgIzAwMDA7XG4gIC0tdHctYmx1cjogIDtcbiAgLS10dy1icmlnaHRuZXNzOiAgO1xuICAtLXR3LWNvbnRyYXN0OiAgO1xuICAtLXR3LWdyYXlzY2FsZTogIDtcbiAgLS10dy1odWUtcm90YXRlOiAgO1xuICAtLXR3LWludmVydDogIDtcbiAgLS10dy1zYXR1cmF0ZTogIDtcbiAgLS10dy1zZXBpYTogIDtcbiAgLS10dy1kcm9wLXNoYWRvdzogIDtcbiAgLS10dy1iYWNrZHJvcC1ibHVyOiAgO1xuICAtLXR3LWJhY2tkcm9wLWJyaWdodG5lc3M6ICA7XG4gIC0tdHctYmFja2Ryb3AtY29udHJhc3Q6ICA7XG4gIC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlOiAgO1xuICAtLXR3LWJhY2tkcm9wLWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaW52ZXJ0OiAgO1xuICAtLXR3LWJhY2tkcm9wLW9wYWNpdHk6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2F0dXJhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2VwaWE6ICA7XG59XG5cbjo6YmFja2Ryb3Age1xuICAtLXR3LWJvcmRlci1zcGFjaW5nLXg6IDA7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteTogMDtcbiAgLS10dy10cmFuc2xhdGUteDogMDtcbiAgLS10dy10cmFuc2xhdGUteTogMDtcbiAgLS10dy1yb3RhdGU6IDA7XG4gIC0tdHctc2tldy14OiAwO1xuICAtLXR3LXNrZXcteTogMDtcbiAgLS10dy1zY2FsZS14OiAxO1xuICAtLXR3LXNjYWxlLXk6IDE7XG4gIC0tdHctcGFuLXg6ICA7XG4gIC0tdHctcGFuLXk6ICA7XG4gIC0tdHctcGluY2gtem9vbTogIDtcbiAgLS10dy1zY3JvbGwtc25hcC1zdHJpY3RuZXNzOiBwcm94aW1pdHk7XG4gIC0tdHctZ3JhZGllbnQtZnJvbS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC12aWEtcG9zaXRpb246ICA7XG4gIC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb246ICA7XG4gIC0tdHctb3JkaW5hbDogIDtcbiAgLS10dy1zbGFzaGVkLXplcm86ICA7XG4gIC0tdHctbnVtZXJpYy1maWd1cmU6ICA7XG4gIC0tdHctbnVtZXJpYy1zcGFjaW5nOiAgO1xuICAtLXR3LW51bWVyaWMtZnJhY3Rpb246ICA7XG4gIC0tdHctcmluZy1pbnNldDogIDtcbiAgLS10dy1yaW5nLW9mZnNldC13aWR0aDogMHB4O1xuICAtLXR3LXJpbmctb2Zmc2V0LWNvbG9yOiAjZmZmO1xuICAtLXR3LXJpbmctY29sb3I6IHJnYig1OSAxMzAgMjQ2IC8gMC41KTtcbiAgLS10dy1yaW5nLW9mZnNldC1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1yaW5nLXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdy1jb2xvcmVkOiAwIDAgIzAwMDA7XG4gIC0tdHctYmx1cjogIDtcbiAgLS10dy1icmlnaHRuZXNzOiAgO1xuICAtLXR3LWNvbnRyYXN0OiAgO1xuICAtLXR3LWdyYXlzY2FsZTogIDtcbiAgLS10dy1odWUtcm90YXRlOiAgO1xuICAtLXR3LWludmVydDogIDtcbiAgLS10dy1zYXR1cmF0ZTogIDtcbiAgLS10dy1zZXBpYTogIDtcbiAgLS10dy1kcm9wLXNoYWRvdzogIDtcbiAgLS10dy1iYWNrZHJvcC1ibHVyOiAgO1xuICAtLXR3LWJhY2tkcm9wLWJyaWdodG5lc3M6ICA7XG4gIC0tdHctYmFja2Ryb3AtY29udHJhc3Q6ICA7XG4gIC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlOiAgO1xuICAtLXR3LWJhY2tkcm9wLWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaW52ZXJ0OiAgO1xuICAtLXR3LWJhY2tkcm9wLW9wYWNpdHk6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2F0dXJhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2VwaWE6ICA7XG59XG4uY29udGFpbmVyIHtcbiAgd2lkdGg6IDEwMCU7XG59XG5AbWVkaWEgKG1pbi13aWR0aDogNjQwcHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDY0MHB4O1xuICB9XG59XG5AbWVkaWEgKG1pbi13aWR0aDogNzY4cHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDc2OHB4O1xuICB9XG59XG5AbWVkaWEgKG1pbi13aWR0aDogMTAyNHB4KSB7XG5cbiAgLmNvbnRhaW5lciB7XG4gICAgbWF4LXdpZHRoOiAxMDI0cHg7XG4gIH1cbn1cbkBtZWRpYSAobWluLXdpZHRoOiAxMjgwcHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDEyODBweDtcbiAgfVxufVxuQG1lZGlhIChtaW4td2lkdGg6IDE1MzZweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogMTUzNnB4O1xuICB9XG59XG4ucG9pbnRlci1ldmVudHMtbm9uZSB7XG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuLnZpc2libGUge1xuICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xufVxuLmNvbGxhcHNlIHtcbiAgdmlzaWJpbGl0eTogY29sbGFwc2U7XG59XG4ucmVsYXRpdmUge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG59XG4ubS01IHtcbiAgbWFyZ2luOiAxLjI1cmVtO1xufVxuLm0tOCB7XG4gIG1hcmdpbjogMnJlbTtcbn1cbi5tbC0xMCB7XG4gIG1hcmdpbi1sZWZ0OiAyLjVyZW07XG59XG4ubWwtOCB7XG4gIG1hcmdpbi1sZWZ0OiAycmVtO1xufVxuLmJsb2NrIHtcbiAgZGlzcGxheTogYmxvY2s7XG59XG4uZmxleCB7XG4gIGRpc3BsYXk6IGZsZXg7XG59XG4udGFibGUge1xuICBkaXNwbGF5OiB0YWJsZTtcbn1cbi5ncmlkIHtcbiAgZGlzcGxheTogZ3JpZDtcbn1cbi5jb250ZW50cyB7XG4gIGRpc3BsYXk6IGNvbnRlbnRzO1xufVxuLmhpZGRlbiB7XG4gIGRpc3BsYXk6IG5vbmU7XG59XG4uaC0xIHtcbiAgaGVpZ2h0OiAwLjI1cmVtO1xufVxuLmgtMVxcXFwvNSB7XG4gIGhlaWdodDogMjAlO1xufVxuLmgtNCB7XG4gIGhlaWdodDogMXJlbTtcbn1cbi5oLTRcXFxcLzUge1xuICBoZWlnaHQ6IDgwJTtcbn1cbi5oLTQwIHtcbiAgaGVpZ2h0OiAxMHJlbTtcbn1cbi5oLTYge1xuICBoZWlnaHQ6IDEuNXJlbTtcbn1cbi5oLW1heCB7XG4gIGhlaWdodDogLW1vei1tYXgtY29udGVudDtcbiAgaGVpZ2h0OiBtYXgtY29udGVudDtcbn1cbi53LTEge1xuICB3aWR0aDogMC4yNXJlbTtcbn1cbi53LTFcXFxcLzIge1xuICB3aWR0aDogNTAlO1xufVxuLnctNCB7XG4gIHdpZHRoOiAxcmVtO1xufVxuLnctNFxcXFwvMTIge1xuICB3aWR0aDogMzMuMzMzMzMzJTtcbn1cbi53LTYge1xuICB3aWR0aDogMS41cmVtO1xufVxuLnctYXV0byB7XG4gIHdpZHRoOiBhdXRvO1xufVxuLnctZnVsbCB7XG4gIHdpZHRoOiAxMDAlO1xufVxuLm1pbi13LTQ0IHtcbiAgbWluLXdpZHRoOiAxMXJlbTtcbn1cbi5taW4tdy1tYXgge1xuICBtaW4td2lkdGg6IC1tb3otbWF4LWNvbnRlbnQ7XG4gIG1pbi13aWR0aDogbWF4LWNvbnRlbnQ7XG59XG4ubWluLXctbWluIHtcbiAgbWluLXdpZHRoOiAtbW96LW1pbi1jb250ZW50O1xuICBtaW4td2lkdGg6IG1pbi1jb250ZW50O1xufVxuLmZsZXgtMSB7XG4gIGZsZXg6IDEgMSAwJTtcbn1cbi5mbGV4LW5vbmUge1xuICBmbGV4OiBub25lO1xufVxuLmJvcmRlci1jb2xsYXBzZSB7XG4gIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XG59XG4udHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUodmFyKC0tdHctdHJhbnNsYXRlLXgpLCB2YXIoLS10dy10cmFuc2xhdGUteSkpIHJvdGF0ZSh2YXIoLS10dy1yb3RhdGUpKSBza2V3WCh2YXIoLS10dy1za2V3LXgpKSBza2V3WSh2YXIoLS10dy1za2V3LXkpKSBzY2FsZVgodmFyKC0tdHctc2NhbGUteCkpIHNjYWxlWSh2YXIoLS10dy1zY2FsZS15KSk7XG59XG4uY3Vyc29yLWRlZmF1bHQge1xuICBjdXJzb3I6IGRlZmF1bHQ7XG59XG4uY3Vyc29yLWhlbHAge1xuICBjdXJzb3I6IGhlbHA7XG59XG4uY3Vyc29yLXBvaW50ZXIge1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uY3Vyc29yLXRleHQge1xuICBjdXJzb3I6IHRleHQ7XG59XG4ucmVzaXplIHtcbiAgcmVzaXplOiBib3RoO1xufVxuLmF1dG8tcm93cy1taW4ge1xuICBncmlkLWF1dG8tcm93czogbWluLWNvbnRlbnQ7XG59XG4uZ3JpZC1jb2xzLTExIHtcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMTEsIG1pbm1heCgwLCAxZnIpKTtcbn1cbi5mbGV4LXJvdyB7XG4gIGZsZXgtZGlyZWN0aW9uOiByb3c7XG59XG4uZmxleC1jb2wge1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xufVxuLml0ZW1zLWNlbnRlciB7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG4uanVzdGlmeS1zdGFydCB7XG4gIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcbn1cbi5qdXN0aWZ5LWNlbnRlciB7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xufVxuLmp1c3RpZnktYmV0d2VlbiB7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2Vlbjtcbn1cbi5qdXN0aWZ5LWFyb3VuZCB7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYXJvdW5kO1xufVxuLmdhcC0xIHtcbiAgZ2FwOiAwLjI1cmVtO1xufVxuLmdhcC0xMCB7XG4gIGdhcDogMi41cmVtO1xufVxuLmdhcC0yIHtcbiAgZ2FwOiAwLjVyZW07XG59XG4uZ2FwLTYge1xuICBnYXA6IDEuNXJlbTtcbn1cbi5vdmVyZmxvdy1hdXRvIHtcbiAgb3ZlcmZsb3c6IGF1dG87XG59XG4ucm91bmRlZC1mdWxsIHtcbiAgYm9yZGVyLXJhZGl1czogOTk5OXB4O1xufVxuLnJvdW5kZWQteGwge1xuICBib3JkZXItcmFkaXVzOiAwLjc1cmVtO1xufVxuLmJvcmRlciB7XG4gIGJvcmRlci13aWR0aDogMXB4O1xufVxuLmJvcmRlci1zb2xpZCB7XG4gIGJvcmRlci1zdHlsZTogc29saWQ7XG59XG4uYm9yZGVyLWJsdWUtODAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMzAgNjQgMTc1IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItZ3JheS04MDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigzMSA0MSA1NSAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYm9yZGVyLWdyZWVuLTYwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDIyIDE2MyA3NCAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYm9yZGVyLW9yYW5nZS00MDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigyNTEgMTQ2IDYwIC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItcmVkLTcwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDE4NSAyOCAyOCAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS0xMDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyNDMgMjQ0IDI0NiAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1ncmF5LTIwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDIyOSAyMzEgMjM1IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWdyYXktNDAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTU2IDE2MyAxNzUgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS02MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYig3NSA4NSA5OSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1ncmF5LTcwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDU1IDY1IDgxIC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWdyYXktODAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMzEgNDEgNTUgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctbGltZS02MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigxMDEgMTYzIDEzIC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLW9yYW5nZS0zMDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyNTMgMTg2IDExNiAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1vcmFuZ2UtNDAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjUxIDE0NiA2MCAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1vcmFuZ2UtNjAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjM0IDg4IDEyIC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLXJlZC03MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigxODUgMjggMjggLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctc2t5LTcwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDMgMTA1IDE2MSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5wLTEge1xuICBwYWRkaW5nOiAwLjI1cmVtO1xufVxuLnAtMiB7XG4gIHBhZGRpbmc6IDAuNXJlbTtcbn1cbi5wLTQge1xuICBwYWRkaW5nOiAxcmVtO1xufVxuLnAtNiB7XG4gIHBhZGRpbmc6IDEuNXJlbTtcbn1cbi5weC0zIHtcbiAgcGFkZGluZy1sZWZ0OiAwLjc1cmVtO1xuICBwYWRkaW5nLXJpZ2h0OiAwLjc1cmVtO1xufVxuLnB4LTQge1xuICBwYWRkaW5nLWxlZnQ6IDFyZW07XG4gIHBhZGRpbmctcmlnaHQ6IDFyZW07XG59XG4ucHgtNiB7XG4gIHBhZGRpbmctbGVmdDogMS41cmVtO1xuICBwYWRkaW5nLXJpZ2h0OiAxLjVyZW07XG59XG4ucHktMSB7XG4gIHBhZGRpbmctdG9wOiAwLjI1cmVtO1xuICBwYWRkaW5nLWJvdHRvbTogMC4yNXJlbTtcbn1cbi5weS0yIHtcbiAgcGFkZGluZy10b3A6IDAuNXJlbTtcbiAgcGFkZGluZy1ib3R0b206IDAuNXJlbTtcbn1cbi5weS00IHtcbiAgcGFkZGluZy10b3A6IDFyZW07XG4gIHBhZGRpbmctYm90dG9tOiAxcmVtO1xufVxuLnBsLTIge1xuICBwYWRkaW5nLWxlZnQ6IDAuNXJlbTtcbn1cbi5wbC01IHtcbiAgcGFkZGluZy1sZWZ0OiAxLjI1cmVtO1xufVxuLnBsLTgge1xuICBwYWRkaW5nLWxlZnQ6IDJyZW07XG59XG4udGV4dC1jZW50ZXIge1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG59XG4udGV4dC1zbSB7XG4gIGZvbnQtc2l6ZTogMC44NzVyZW07XG4gIGxpbmUtaGVpZ2h0OiAxLjI1cmVtO1xufVxuLnRleHQtZ3JheS02MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYig3NSA4NSA5OSAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtZ3JheS03MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYig1NSA2NSA4MSAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtZ3JheS04MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigzMSA0MSA1NSAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtbGltZS02MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigxMDEgMTYzIDEzIC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1vcmFuZ2UtNTAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMjQ5IDExNSAyMiAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtb3JhbmdlLTYwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDIzNCA4OCAxMiAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtcmVkLTUwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDIzOSA2OCA2OCAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtcmVkLTcwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDE4NSAyOCAyOCAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtcm9zZS03MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigxOTAgMTggNjAgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXNreS02MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigyIDEzMiAxOTkgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXRlYWwtOTAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTkgNzggNzQgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi51bmRlcmxpbmUge1xuICB0ZXh0LWRlY29yYXRpb24tbGluZTogdW5kZXJsaW5lO1xufVxuLm91dGxpbmUge1xuICBvdXRsaW5lLXN0eWxlOiBzb2xpZDtcbn1cbi5maWx0ZXIge1xuICBmaWx0ZXI6IHZhcigtLXR3LWJsdXIpIHZhcigtLXR3LWJyaWdodG5lc3MpIHZhcigtLXR3LWNvbnRyYXN0KSB2YXIoLS10dy1ncmF5c2NhbGUpIHZhcigtLXR3LWh1ZS1yb3RhdGUpIHZhcigtLXR3LWludmVydCkgdmFyKC0tdHctc2F0dXJhdGUpIHZhcigtLXR3LXNlcGlhKSB2YXIoLS10dy1kcm9wLXNoYWRvdyk7XG59XG4uaG92ZXJcXFxcOmJnLW9yYW5nZS01MDA6aG92ZXIge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyNDkgMTE1IDIyIC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufWAsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL3N0eWxlcy5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUE7O0NBQWMsQ0FBZDs7O0NBQWM7O0FBQWQ7OztFQUFBLHNCQUFjLEVBQWQsTUFBYztFQUFkLGVBQWMsRUFBZCxNQUFjO0VBQWQsbUJBQWMsRUFBZCxNQUFjO0VBQWQscUJBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7O0VBQUEsZ0JBQWM7QUFBQTs7QUFBZDs7Ozs7Ozs7Q0FBYzs7QUFBZDs7RUFBQSxnQkFBYyxFQUFkLE1BQWM7RUFBZCw4QkFBYyxFQUFkLE1BQWM7RUFBZCxnQkFBYyxFQUFkLE1BQWM7RUFBZCxjQUFjO0tBQWQsV0FBYyxFQUFkLE1BQWM7RUFBZCwrSEFBYyxFQUFkLE1BQWM7RUFBZCw2QkFBYyxFQUFkLE1BQWM7RUFBZCwrQkFBYyxFQUFkLE1BQWM7RUFBZCx3Q0FBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7O0NBQWM7O0FBQWQ7RUFBQSxTQUFjLEVBQWQsTUFBYztFQUFkLG9CQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOzs7O0NBQWM7O0FBQWQ7RUFBQSxTQUFjLEVBQWQsTUFBYztFQUFkLGNBQWMsRUFBZCxNQUFjO0VBQWQscUJBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7RUFBQSx5Q0FBYztVQUFkLGlDQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7Ozs7OztFQUFBLGtCQUFjO0VBQWQsb0JBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLGNBQWM7RUFBZCx3QkFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkOztFQUFBLG1CQUFjO0FBQUE7O0FBQWQ7Ozs7O0NBQWM7O0FBQWQ7Ozs7RUFBQSwrR0FBYyxFQUFkLE1BQWM7RUFBZCw2QkFBYyxFQUFkLE1BQWM7RUFBZCwrQkFBYyxFQUFkLE1BQWM7RUFBZCxjQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEsY0FBYztBQUFBOztBQUFkOztDQUFjOztBQUFkOztFQUFBLGNBQWM7RUFBZCxjQUFjO0VBQWQsa0JBQWM7RUFBZCx3QkFBYztBQUFBOztBQUFkO0VBQUEsZUFBYztBQUFBOztBQUFkO0VBQUEsV0FBYztBQUFBOztBQUFkOzs7O0NBQWM7O0FBQWQ7RUFBQSxjQUFjLEVBQWQsTUFBYztFQUFkLHFCQUFjLEVBQWQsTUFBYztFQUFkLHlCQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOzs7O0NBQWM7O0FBQWQ7Ozs7O0VBQUEsb0JBQWMsRUFBZCxNQUFjO0VBQWQsOEJBQWMsRUFBZCxNQUFjO0VBQWQsZ0NBQWMsRUFBZCxNQUFjO0VBQWQsZUFBYyxFQUFkLE1BQWM7RUFBZCxvQkFBYyxFQUFkLE1BQWM7RUFBZCxvQkFBYyxFQUFkLE1BQWM7RUFBZCxjQUFjLEVBQWQsTUFBYztFQUFkLFNBQWMsRUFBZCxNQUFjO0VBQWQsVUFBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDs7RUFBQSxvQkFBYztBQUFBOztBQUFkOzs7Q0FBYzs7QUFBZDs7OztFQUFBLDBCQUFjLEVBQWQsTUFBYztFQUFkLDZCQUFjLEVBQWQsTUFBYztFQUFkLHNCQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEsYUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEsZ0JBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLHdCQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7O0VBQUEsWUFBYztBQUFBOztBQUFkOzs7Q0FBYzs7QUFBZDtFQUFBLDZCQUFjLEVBQWQsTUFBYztFQUFkLG9CQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEsd0JBQWM7QUFBQTs7QUFBZDs7O0NBQWM7O0FBQWQ7RUFBQSwwQkFBYyxFQUFkLE1BQWM7RUFBZCxhQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEsa0JBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDs7Ozs7Ozs7Ozs7OztFQUFBLFNBQWM7QUFBQTs7QUFBZDtFQUFBLFNBQWM7RUFBZCxVQUFjO0FBQUE7O0FBQWQ7RUFBQSxVQUFjO0FBQUE7O0FBQWQ7OztFQUFBLGdCQUFjO0VBQWQsU0FBYztFQUFkLFVBQWM7QUFBQTs7QUFBZDs7Q0FBYztBQUFk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bkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSx3QkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsMkJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsMkJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsc0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSxxQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxrQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxtQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxpQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLG1CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUZuQjtFQUFBLGtCQUVvQjtFQUZwQjtBQUVvQlwiLFwic291cmNlc0NvbnRlbnRcIjpbXCJAdGFpbHdpbmQgYmFzZTtcXG5AdGFpbHdpbmQgY29tcG9uZW50cztcXG5AdGFpbHdpbmQgdXRpbGl0aWVzO1wiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTtcblxuICAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbihcIlwiKTtcbiAgfTtcblxuICAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCB0aGlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZhciBpZCA9IHRoaXNba11bMF07XG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3VwcG9ydHMpIHtcbiAgICAgICAgaWYgKCFpdGVtWzRdKSB7XG4gICAgICAgICAgaXRlbVs0XSA9IFwiXCIuY29uY2F0KHN1cHBvcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNF0gPSBzdXBwb3J0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuICBpZiAoIWNzc01hcHBpbmcpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi9ub2RlX21vZHVsZXMvcG9zdGNzcy1sb2FkZXIvZGlzdC9janMuanM/P3J1bGVTZXRbMV0ucnVsZXNbMV0udXNlWzJdIS4vc3R5bGVzLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4uL25vZGVfbW9kdWxlcy9wb3N0Y3NzLWxvYWRlci9kaXN0L2Nqcy5qcz8/cnVsZVNldFsxXS5ydWxlc1sxXS51c2VbMl0hLi9zdHlsZXMuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzdHlsZXNJbkRPTSA9IFtdO1xuZnVuY3Rpb24gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuICB2YXIgcmVzdWx0ID0gLTE7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGlkQ291bnRNYXAgPSB7fTtcbiAgdmFyIGlkZW50aWZpZXJzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuICAgIGlmIChpbmRleEJ5SWRlbnRpZmllciAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXBkYXRlciA9IGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5ieUluZGV4ID0gaTtcbiAgICAgIHN0eWxlc0luRE9NLnNwbGljZShpLCAwLCB7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IHVwZGF0ZXIsXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cbmZ1bmN0aW9uIGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIGFwaSA9IG9wdGlvbnMuZG9tQVBJKG9wdGlvbnMpO1xuICBhcGkudXBkYXRlKG9iaik7XG4gIHZhciB1cGRhdGVyID0gZnVuY3Rpb24gdXBkYXRlcihuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwICYmIG5ld09iai5zdXBwb3J0cyA9PT0gb2JqLnN1cHBvcnRzICYmIG5ld09iai5sYXllciA9PT0gb2JqLmxheWVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHVwZGF0ZXI7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXN0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgX2lkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbX2ldO1xuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcbiAgICAgIGlmIChzdHlsZXNJbkRPTVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5ET01bX2luZGV4XS51cGRhdGVyKCk7XG4gICAgICAgIHN0eWxlc0luRE9NLnNwbGljZShfaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7XG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG4gICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gc3R5bGVUYXJnZXQuY29udGVudERvY3VtZW50LmhlYWQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cbiAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRCeVNlbGVjdG9yKGluc2VydCwgc3R5bGUpIHtcbiAgdmFyIHRhcmdldCA9IGdldFRhcmdldChpbnNlcnQpO1xuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cbiAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0QnlTZWxlY3RvcjsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgb3B0aW9ucy5zZXRBdHRyaWJ1dGVzKGVsZW1lbnQsIG9wdGlvbnMuYXR0cmlidXRlcyk7XG4gIG9wdGlvbnMuaW5zZXJ0KGVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG4gIHJldHVybiBlbGVtZW50O1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG4gIGlmIChub25jZSkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBub25jZSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKSB7XG4gIHZhciBjc3MgPSBcIlwiO1xuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIik7XG4gIH1cbiAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBvYmoubGF5ZXIgIT09IFwidW5kZWZpbmVkXCI7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cbiAgY3NzICs9IG9iai5jc3M7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH1cblxuICAvLyBGb3Igb2xkIElFXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cbiAgb3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGRvbUFQSShvcHRpb25zKSB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoKSB7fSxcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICB9O1xuICB9XG4gIHZhciBzdHlsZUVsZW1lbnQgPSBvcHRpb25zLmluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgcmV0dXJuIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShvYmopIHtcbiAgICAgIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG4gICAgfVxuICB9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzdHlsZVRhZ1RyYW5zZm9ybTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwidmFyIHdlYnBhY2tRdWV1ZXMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2woXCJ3ZWJwYWNrIHF1ZXVlc1wiKSA6IFwiX193ZWJwYWNrX3F1ZXVlc19fXCI7XG52YXIgd2VicGFja0V4cG9ydHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2woXCJ3ZWJwYWNrIGV4cG9ydHNcIikgOiBcIl9fd2VicGFja19leHBvcnRzX19cIjtcbnZhciB3ZWJwYWNrRXJyb3IgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2woXCJ3ZWJwYWNrIGVycm9yXCIpIDogXCJfX3dlYnBhY2tfZXJyb3JfX1wiO1xudmFyIHJlc29sdmVRdWV1ZSA9IChxdWV1ZSkgPT4ge1xuXHRpZihxdWV1ZSAmJiBxdWV1ZS5kIDwgMSkge1xuXHRcdHF1ZXVlLmQgPSAxO1xuXHRcdHF1ZXVlLmZvckVhY2goKGZuKSA9PiAoZm4uci0tKSk7XG5cdFx0cXVldWUuZm9yRWFjaCgoZm4pID0+IChmbi5yLS0gPyBmbi5yKysgOiBmbigpKSk7XG5cdH1cbn1cbnZhciB3cmFwRGVwcyA9IChkZXBzKSA9PiAoZGVwcy5tYXAoKGRlcCkgPT4ge1xuXHRpZihkZXAgIT09IG51bGwgJiYgdHlwZW9mIGRlcCA9PT0gXCJvYmplY3RcIikge1xuXHRcdGlmKGRlcFt3ZWJwYWNrUXVldWVzXSkgcmV0dXJuIGRlcDtcblx0XHRpZihkZXAudGhlbikge1xuXHRcdFx0dmFyIHF1ZXVlID0gW107XG5cdFx0XHRxdWV1ZS5kID0gMDtcblx0XHRcdGRlcC50aGVuKChyKSA9PiB7XG5cdFx0XHRcdG9ialt3ZWJwYWNrRXhwb3J0c10gPSByO1xuXHRcdFx0XHRyZXNvbHZlUXVldWUocXVldWUpO1xuXHRcdFx0fSwgKGUpID0+IHtcblx0XHRcdFx0b2JqW3dlYnBhY2tFcnJvcl0gPSBlO1xuXHRcdFx0XHRyZXNvbHZlUXVldWUocXVldWUpO1xuXHRcdFx0fSk7XG5cdFx0XHR2YXIgb2JqID0ge307XG5cdFx0XHRvYmpbd2VicGFja1F1ZXVlc10gPSAoZm4pID0+IChmbihxdWV1ZSkpO1xuXHRcdFx0cmV0dXJuIG9iajtcblx0XHR9XG5cdH1cblx0dmFyIHJldCA9IHt9O1xuXHRyZXRbd2VicGFja1F1ZXVlc10gPSB4ID0+IHt9O1xuXHRyZXRbd2VicGFja0V4cG9ydHNdID0gZGVwO1xuXHRyZXR1cm4gcmV0O1xufSkpO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5hID0gKG1vZHVsZSwgYm9keSwgaGFzQXdhaXQpID0+IHtcblx0dmFyIHF1ZXVlO1xuXHRoYXNBd2FpdCAmJiAoKHF1ZXVlID0gW10pLmQgPSAtMSk7XG5cdHZhciBkZXBRdWV1ZXMgPSBuZXcgU2V0KCk7XG5cdHZhciBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHM7XG5cdHZhciBjdXJyZW50RGVwcztcblx0dmFyIG91dGVyUmVzb2x2ZTtcblx0dmFyIHJlamVjdDtcblx0dmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqKSA9PiB7XG5cdFx0cmVqZWN0ID0gcmVqO1xuXHRcdG91dGVyUmVzb2x2ZSA9IHJlc29sdmU7XG5cdH0pO1xuXHRwcm9taXNlW3dlYnBhY2tFeHBvcnRzXSA9IGV4cG9ydHM7XG5cdHByb21pc2Vbd2VicGFja1F1ZXVlc10gPSAoZm4pID0+IChxdWV1ZSAmJiBmbihxdWV1ZSksIGRlcFF1ZXVlcy5mb3JFYWNoKGZuKSwgcHJvbWlzZVtcImNhdGNoXCJdKHggPT4ge30pKTtcblx0bW9kdWxlLmV4cG9ydHMgPSBwcm9taXNlO1xuXHRib2R5KChkZXBzKSA9PiB7XG5cdFx0Y3VycmVudERlcHMgPSB3cmFwRGVwcyhkZXBzKTtcblx0XHR2YXIgZm47XG5cdFx0dmFyIGdldFJlc3VsdCA9ICgpID0+IChjdXJyZW50RGVwcy5tYXAoKGQpID0+IHtcblx0XHRcdGlmKGRbd2VicGFja0Vycm9yXSkgdGhyb3cgZFt3ZWJwYWNrRXJyb3JdO1xuXHRcdFx0cmV0dXJuIGRbd2VicGFja0V4cG9ydHNdO1xuXHRcdH0pKVxuXHRcdHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdGZuID0gKCkgPT4gKHJlc29sdmUoZ2V0UmVzdWx0KSk7XG5cdFx0XHRmbi5yID0gMDtcblx0XHRcdHZhciBmblF1ZXVlID0gKHEpID0+IChxICE9PSBxdWV1ZSAmJiAhZGVwUXVldWVzLmhhcyhxKSAmJiAoZGVwUXVldWVzLmFkZChxKSwgcSAmJiAhcS5kICYmIChmbi5yKyssIHEucHVzaChmbikpKSk7XG5cdFx0XHRjdXJyZW50RGVwcy5tYXAoKGRlcCkgPT4gKGRlcFt3ZWJwYWNrUXVldWVzXShmblF1ZXVlKSkpO1xuXHRcdH0pO1xuXHRcdHJldHVybiBmbi5yID8gcHJvbWlzZSA6IGdldFJlc3VsdCgpO1xuXHR9LCAoZXJyKSA9PiAoKGVyciA/IHJlamVjdChwcm9taXNlW3dlYnBhY2tFcnJvcl0gPSBlcnIpIDogb3V0ZXJSZXNvbHZlKGV4cG9ydHMpKSwgcmVzb2x2ZVF1ZXVlKHF1ZXVlKSkpO1xuXHRxdWV1ZSAmJiBxdWV1ZS5kIDwgMCAmJiAocXVldWUuZCA9IDApO1xufTsiLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm5jID0gdW5kZWZpbmVkOyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgdXNlZCAnbW9kdWxlJyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9pbmRleC5qc1wiKTtcbiIsIiJdLCJuYW1lcyI6WyJHYW1lYm9hcmQiLCJncmlkIiwic2hpcHNUb1BsYWNlIiwic2hpcFR5cGUiLCJzaGlwTGVuZ3RoIiwiaGl0QmdDbHIiLCJoaXRUZXh0Q2xyIiwibWlzc0JnQ2xyIiwibWlzc1RleHRDbHIiLCJlcnJvclRleHRDbHIiLCJkZWZhdWx0VGV4dENsciIsInByaW1hcnlIb3ZlckNsciIsImhpZ2hsaWdodENsciIsImN1cnJlbnRPcmllbnRhdGlvbiIsImN1cnJlbnRTaGlwIiwibGFzdEhvdmVyZWRDZWxsIiwicGxhY2VTaGlwR3VpZGUiLCJwcm9tcHQiLCJwcm9tcHRUeXBlIiwiZ2FtZXBsYXlHdWlkZSIsInR1cm5Qcm9tcHQiLCJwcm9jZXNzQ29tbWFuZCIsImNvbW1hbmQiLCJpc01vdmUiLCJwYXJ0cyIsInNwbGl0IiwibGVuZ3RoIiwiRXJyb3IiLCJncmlkUG9zaXRpb24iLCJ0b1VwcGVyQ2FzZSIsInZhbGlkR3JpZFBvc2l0aW9ucyIsImZsYXQiLCJpbmNsdWRlcyIsInJlc3VsdCIsIm9yaWVudGF0aW9uIiwidG9Mb3dlckNhc2UiLCJ1cGRhdGVPdXRwdXQiLCJtZXNzYWdlIiwidHlwZSIsIm91dHB1dCIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJtZXNzYWdlRWxlbWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ0ZXh0Q29udGVudCIsImNsYXNzTGlzdCIsImFkZCIsImFwcGVuZENoaWxkIiwic2Nyb2xsVG9wIiwic2Nyb2xsSGVpZ2h0IiwiY29uc29sZUxvZ1BsYWNlbWVudENvbW1hbmQiLCJkaXJGZWViYWNrIiwiY2hhckF0Iiwic2xpY2UiLCJjb25zb2xlIiwibG9nIiwidmFsdWUiLCJjb25zb2xlTG9nTW92ZUNvbW1hbmQiLCJyZXN1bHRzT2JqZWN0IiwicGxheWVyIiwibW92ZSIsImhpdCIsImNvbnNvbGVMb2dFcnJvciIsImVycm9yIiwiaW5pdFVpTWFuYWdlciIsInVpTWFuYWdlciIsImluaXRDb25zb2xlVUkiLCJjcmVhdGVHYW1lYm9hcmQiLCJjYWxjdWxhdGVTaGlwQ2VsbHMiLCJzdGFydENlbGwiLCJjZWxsSWRzIiwicm93SW5kZXgiLCJjaGFyQ29kZUF0IiwiY29sSW5kZXgiLCJwYXJzZUludCIsInN1YnN0cmluZyIsImkiLCJwdXNoIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwiaGlnaGxpZ2h0Q2VsbHMiLCJmb3JFYWNoIiwiY2VsbElkIiwiY2VsbEVsZW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiY2xlYXJIaWdobGlnaHQiLCJyZW1vdmUiLCJ0b2dnbGVPcmllbnRhdGlvbiIsImhhbmRsZVBsYWNlbWVudEhvdmVyIiwiZSIsImNlbGwiLCJ0YXJnZXQiLCJjb250YWlucyIsImRhdGFzZXQiLCJjZWxsUG9zIiwicG9zaXRpb24iLCJjZWxsc1RvSGlnaGxpZ2h0IiwiaGFuZGxlTW91c2VMZWF2ZSIsImNlbGxzVG9DbGVhciIsImhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlIiwicHJldmVudERlZmF1bHQiLCJrZXkiLCJvbGRDZWxsc1RvQ2xlYXIiLCJuZXdDZWxsc1RvSGlnaGxpZ2h0IiwiZW5hYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlciIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJkaXNhYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlciIsImNlbGxzQXJyYXkiLCJkaXNhYmxlSHVtYW5HYW1lYm9hcmRIb3ZlciIsInN3aXRjaEdhbWVib2FyZEhvdmVyU3RhdGVzIiwic2V0dXBHYW1lYm9hcmRGb3JQbGFjZW1lbnQiLCJjb21wR2FtZWJvYXJkQ2VsbHMiLCJhZGRFdmVudExpc3RlbmVyIiwiZ2FtZWJvYXJkQXJlYSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJjbGVhbnVwQWZ0ZXJQbGFjZW1lbnQiLCJzdGFydEdhbWUiLCJnYW1lIiwic2V0VXAiLCJzaGlwIiwicmVuZGVyU2hpcERpc3AiLCJwbGF5ZXJzIiwiY29tcHV0ZXIiLCJkaXNwbGF5UHJvbXB0IiwiaGFuZGxlSHVtYW5Nb3ZlIiwiZGF0YSIsInNldHVwR2FtZWJvYXJkRm9yUGxheWVyTW92ZSIsInBsYXllck1vdmUiLCJjb21wdXRlck1vdmUiLCJodW1hblBsYXllckdhbWVib2FyZCIsImNvbXBQbGF5ZXIiLCJjb21wTW92ZVJlc3VsdCIsIm1ha2VNb3ZlIiwiY2hlY2tXaW5Db25kaXRpb24iLCJjb25jbHVkZUdhbWUiLCJBY3Rpb25Db250cm9sbGVyIiwiaHVtYW5QbGF5ZXIiLCJodW1hbiIsImdhbWVib2FyZCIsImNvbXBQbGF5ZXJHYW1lYm9hcmQiLCJzZXR1cEV2ZW50TGlzdGVuZXJzIiwiaGFuZGxlckZ1bmN0aW9uIiwicGxheWVyVHlwZSIsImNsZWFudXBGdW5jdGlvbnMiLCJjb25zb2xlU3VibWl0QnV0dG9uIiwiY29uc29sZUlucHV0Iiwic3VibWl0SGFuZGxlciIsImlucHV0Iiwia2V5cHJlc3NIYW5kbGVyIiwiY2xpY2tIYW5kbGVyIiwiY2xlYW51cCIsInByb21wdEFuZFBsYWNlU2hpcCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZmluZCIsInBsYWNlU2hpcFByb21wdCIsImhhbmRsZVZhbGlkSW5wdXQiLCJwbGFjZVNoaXAiLCJyZW5kZXJTaGlwQm9hcmQiLCJyZXNvbHZlU2hpcFBsYWNlbWVudCIsInNldHVwU2hpcHNTZXF1ZW50aWFsbHkiLCJoYW5kbGVTZXR1cCIsInVwZGF0ZUNvbXB1dGVyRGlzcGxheXMiLCJodW1hbk1vdmVSZXN1bHQiLCJwbGF5ZXJTZWxlY3RvciIsInByb21wdFBsYXllck1vdmUiLCJ1bmRlZmluZWQiLCJoYW5kbGVWYWxpZE1vdmUiLCJyZXNvbHZlTW92ZSIsInBsYXlHYW1lIiwiZ2FtZU92ZXIiLCJsYXN0Q29tcE1vdmVSZXN1bHQiLCJsYXN0SHVtYW5Nb3ZlUmVzdWx0IiwiT3ZlcmxhcHBpbmdTaGlwc0Vycm9yIiwiY29uc3RydWN0b3IiLCJuYW1lIiwiU2hpcEFsbG9jYXRpb25SZWFjaGVkRXJyb3IiLCJTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IiLCJJbnZhbGlkU2hpcExlbmd0aEVycm9yIiwiSW52YWxpZFNoaXBUeXBlRXJyb3IiLCJJbnZhbGlkUGxheWVyVHlwZUVycm9yIiwiU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IiLCJSZXBlYXRBdHRhY2tlZEVycm9yIiwiSW52YWxpZE1vdmVFbnRyeUVycm9yIiwiUGxheWVyIiwiU2hpcCIsIkdhbWUiLCJodW1hbkdhbWVib2FyZCIsImNvbXB1dGVyR2FtZWJvYXJkIiwiY29tcHV0ZXJQbGF5ZXIiLCJjdXJyZW50UGxheWVyIiwiZ2FtZU92ZXJTdGF0ZSIsInBsYWNlU2hpcHMiLCJlbmRHYW1lIiwidGFrZVR1cm4iLCJmZWVkYmFjayIsIm9wcG9uZW50IiwiaXNTaGlwU3VuayIsImdhbWVXb24iLCJjaGVja0FsbFNoaXBzU3VuayIsImluZGV4Q2FsY3MiLCJzdGFydCIsImNvbExldHRlciIsInJvd051bWJlciIsImNoZWNrVHlwZSIsInNoaXBQb3NpdGlvbnMiLCJPYmplY3QiLCJrZXlzIiwiZXhpc3RpbmdTaGlwVHlwZSIsImNoZWNrQm91bmRhcmllcyIsImNvb3JkcyIsImRpcmVjdGlvbiIsInhMaW1pdCIsInlMaW1pdCIsIngiLCJ5IiwiY2FsY3VsYXRlU2hpcFBvc2l0aW9ucyIsInBvc2l0aW9ucyIsImNoZWNrRm9yT3ZlcmxhcCIsImVudHJpZXMiLCJleGlzdGluZ1NoaXBQb3NpdGlvbnMiLCJzb21lIiwiY2hlY2tGb3JIaXQiLCJmb3VuZFNoaXAiLCJfIiwic2hpcEZhY3RvcnkiLCJzaGlwcyIsImhpdFBvc2l0aW9ucyIsImF0dGFja0xvZyIsIm5ld1NoaXAiLCJhdHRhY2siLCJyZXNwb25zZSIsImNoZWNrUmVzdWx0cyIsImlzU3VuayIsImV2ZXJ5Iiwic2hpcFJlcG9ydCIsImZsb2F0aW5nU2hpcHMiLCJmaWx0ZXIiLCJtYXAiLCJnZXRTaGlwIiwiZ2V0U2hpcFBvc2l0aW9ucyIsImdldEhpdFBvc2l0aW9ucyIsIlVpTWFuYWdlciIsIm5ld1VpTWFuYWdlciIsIm5ld0dhbWUiLCJhY3RDb250cm9sbGVyIiwiY2hlY2tNb3ZlIiwiZ2JHcmlkIiwidmFsaWQiLCJlbCIsInAiLCJyYW5kTW92ZSIsIm1vdmVMb2ciLCJhbGxNb3ZlcyIsImZsYXRNYXAiLCJyb3ciLCJwb3NzaWJsZU1vdmVzIiwicmFuZG9tTW92ZSIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImdlbmVyYXRlUmFuZG9tU3RhcnQiLCJzaXplIiwidmFsaWRTdGFydHMiLCJjb2wiLCJyYW5kb21JbmRleCIsImF1dG9QbGFjZW1lbnQiLCJzaGlwVHlwZXMiLCJwbGFjZWQiLCJvcHBHYW1lYm9hcmQiLCJzZXRMZW5ndGgiLCJoaXRzIiwiaW5zdHJ1Y3Rpb25DbHIiLCJndWlkZUNsciIsImVycm9yQ2xyIiwiZGVmYXVsdENsciIsImNlbGxDbHIiLCJpbnB1dENsciIsIm91cHV0Q2xyIiwiYnV0dG9uQ2xyIiwiYnV0dG9uVGV4dENsciIsInNoaXBTZWN0Q2xyIiwiYnVpbGRTaGlwIiwib2JqIiwiZG9tU2VsIiwic2hpcFNlY3RzIiwic2VjdCIsImNsYXNzTmFtZSIsInNldEF0dHJpYnV0ZSIsImNvbnRhaW5lcklEIiwiY29udGFpbmVyIiwiZ3JpZERpdiIsImNvbHVtbnMiLCJoZWFkZXIiLCJyb3dMYWJlbCIsImlkIiwiY29uc29sZUNvbnRhaW5lciIsImlucHV0RGl2Iiwic3VibWl0QnV0dG9uIiwicHJvbXB0T2JqcyIsImRpc3BsYXkiLCJmaXJzdENoaWxkIiwicmVtb3ZlQ2hpbGQiLCJwcm9tcHREaXYiLCJwbGF5ZXJPYmoiLCJpZFNlbCIsImRpc3BEaXYiLCJzaGlwRGl2IiwidGl0bGUiLCJzZWN0c0RpdiIsInNoaXBPYmoiLCJzaGlwU2VjdCIsInNlY3Rpb24iXSwic291cmNlUm9vdCI6IiJ9