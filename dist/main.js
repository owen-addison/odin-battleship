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
const hitBgClr = "bg-lime-700";
const hitTextClr = "text-lime-700";
const missBgClr = "bg-gray-400";
const missTextClr = "text-orange-800";
const errorTextClr = "text-red-800";
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
const consoleLogShipSink = resultsObject => {
  const {
    player,
    shipType
  } = resultsObject;
  // Set the console message
  const message = player === "human" ? `You sunk their ${shipType}!` : `They sunk your ${shipType}!`;
  console.log(`${message}`);
  updateOutput(`> ${message}`, "error");

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
function concludeGame(winner) {
  // Display winner, update UI, etc.
  const message = `Game Over! The ${winner} player wins!`;
  console.log(`Game Over! The ${winner} player wins!`);
  updateOutput(`> ${message}`, winner === "human" ? "valid" : "error");

  // Restart the game
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

      // Update the ship section in the ship status display
      uiManager.updateShipSection(humanMoveResult.move, humanMoveResult.shipType, playerSelector);
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
  async function computerMove() {
    let compMoveResult;
    try {
      // Computer logic to choose a move
      // Update UI based on move
      compMoveResult = compPlayer.makeMove(humanPlayerGameboard);

      // Set the player selector of the opponent depending on the player
      // who made the move
      const playerSelector = compMoveResult.player === "human" ? "computer" : "human";
      if (compMoveResult.hit) {
        uiManager.updateShipSection(compMoveResult.move, compMoveResult.shipType, playerSelector);
      }
    } catch (error) {
      consoleLogError(error);
    }
    return compMoveResult;
  }
  const checkShipIsSunk = (gameboard, shipType) => gameboard.isShipSunk(shipType);
  const checkWinCondition = gameboard => gameboard.checkAllShipsSunk();

  // Function for handling the playing of the game
  const playGame = async () => {
    let gameOver = false;
    let lastCompMoveResult;
    let lastHumanMoveResult;
    let winner;
    while (!gameOver) {
      // Player makes a move
      // eslint-disable-next-line no-await-in-loop
      lastHumanMoveResult = await promptPlayerMove(lastCompMoveResult);

      // Check for hit
      if (lastHumanMoveResult.hit) {
        const {
          shipType
        } = lastHumanMoveResult;
        // Check for ship sink
        const isSunk = checkShipIsSunk(compPlayerGameboard, shipType);
        if (isSunk) {
          consoleLogShipSink(lastHumanMoveResult);
          uiManager.renderSunkenShip(compPlayer, shipType);

          // Check for win condition
          gameOver = checkWinCondition(compPlayerGameboard);
          if (gameOver) {
            winner = "human";
            break;
          }
        }
      }

      // Computer makes a move
      // eslint-disable-next-line no-await-in-loop
      lastCompMoveResult = await computerMove();

      // Check for hit
      if (lastCompMoveResult.hit) {
        const {
          shipType
        } = lastCompMoveResult;
        // Check for ship sink
        const isSunk = checkShipIsSunk(humanPlayerGameboard, shipType);
        if (isSunk) {
          consoleLogShipSink(lastCompMoveResult);
          uiManager.renderSunkenShip(humanPlayer, shipType);

          // Check for win condition
          gameOver = checkWinCondition(humanPlayerGameboard);
          if (gameOver) {
            winner = "computer";
            break;
          }
        }
      }
    }

    // Game over logic
    concludeGame(winner);
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




document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("main-container").style.visibility = "visible";
});

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
const tw = (strings, ...values) => String.raw({
  raw: strings
}, ...values);
const instructionClr = "text-lime-700";
const guideClr = "text-gray-700";
const errorClr = "text-red-800";
const defaultClr = "text-gray-700";
const cellClr = "bg-gray-200";
const inputClr = "bg-gray-600";
const inputTextClr = "text-gray-200";
const ouputClr = cellClr;
const buttonClr = "bg-gray-800";
const buttonTextClr = "text-gray-200";
const shipSectClr = "bg-slate-800";
const shipHitClr = "bg-red-800";
const shipSunkClr = "bg-gray-400";
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
    sect.className = tw`w-4 h-4 rounded-full`; // Set the default styling for the section element
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
    gridDiv.className = tw`gameboard-area grid grid-cols-11 auto-rows-min gap-1 p-6`;
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
        cell.className = tw`w-6 h-6 flex justify-center items-center cursor-pointer`; // Add more classes as needed for styling
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
    input.className = tw`pl-3 flex-1 rounded-bl-md border-transparent outline-none focus:outline-solid focus:border-2 focus:border-gray-200 focus:ring-0`; // Add TailwindCSS classes
    input.classList.add(inputClr);
    input.classList.add(inputTextClr);
    const submitButton = document.createElement("button"); // Create a button element for the console submit
    submitButton.textContent = "Submit"; // Add the text "Submit" to the button
    submitButton.setAttribute("id", "console-submit"); // Set the id for the button
    submitButton.className = tw`nanum-gothic-coding-bold text-lg tracking-widest px-3 py-1 text-center text-sm rounded-br-md border-solid border-2 border-gray-200 hover:bg-gray-200 hover:text-gray-800 hover:border-gray-800`; // Add TailwindCSS classes
    submitButton.classList.add(buttonClr);
    submitButton.classList.add(buttonTextClr);
    const output = document.createElement("div"); // Create an div element for the output of the console
    output.setAttribute("id", "console-output"); // Set the id for the output element
    output.className = tw`flex-1 p-2 h-4/5 overflow-auto rounded-t-md bg-gray-200 bg-opacity-30 backdrop-blur-sm`; // Add TailwindCSS classes (bg-gradient-to-tr, from-gray-400, to-gray-100)
    // output.classList.add(ouputClr);

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
          promptDiv.classList.add("nanum-gothic-coding-bold");
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
  const updateShipSection = (pos, shipType, playerType, isShipSunk = false) => {
    let newClr;
    switch (isShipSunk) {
      case true:
        newClr = shipSunkClr;
        break;
      default:
        newClr = shipHitClr;
    }

    // Set the selector value depending on the player type
    const playerId = playerType === "human" ? "human" : "comp";

    // If player type is human then also update the ship section on the board
    if (playerId === "human" || isShipSunk) {
      // Get the correct ship section element from the DOM for the
      // status display
      const shipSectDisplayEl = document.getElementById(`DOM-${playerId}-display-shipType-${shipType}-pos-${pos}`);

      // If the element was found successfully, change its colour, otherwise
      // throw error
      if (!shipSectDisplayEl) {
        throw new Error("Error! Ship section element not found in status display! (updateShipSection)");
      } else {
        shipSectDisplayEl.classList.remove(shipSectClr);
        shipSectDisplayEl.classList.remove(shipHitClr);
        shipSectDisplayEl.classList.add(newClr);
      }
      if (playerId === "human") {
        // Get the correct ship section element from the DOM for the
        // gameboard display
        const shipSectBoardEl = document.getElementById(`DOM-${playerId}-board-shipType-${shipType}-pos-${pos}`);

        // If the element was found successfully, change its colour, otherwise
        // throw error
        if (!shipSectBoardEl) {
          throw new Error("Error! Ship section element not found on gameboard! (updateShipSection)");
        } else {
          shipSectBoardEl.classList.remove(shipSectClr);
          shipSectBoardEl.classList.remove(shipHitClr);
          shipSectBoardEl.classList.add(newClr);
        }
      }
    }
  };
  const renderSunkenShip = (playerObj, shipType) => {
    // Get the player type
    const {
      type
    } = playerObj;

    // Get the ship positions for the ship
    const shipPositions = playerObj.gameboard.getShipPositions(shipType);
    shipPositions.forEach(pos => {
      updateShipSection(pos, shipType, type, true);
    });
  };
  return {
    createGameboard,
    initConsoleUI,
    displayPrompt,
    renderShipDisp,
    renderShipBoard,
    updateShipSection,
    renderSunkenShip
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
.absolute {
  position: absolute;
}
.relative {
  position: relative;
}
.left-0 {
  left: 0px;
}
.right-0 {
  right: 0px;
}
.top-0 {
  top: 0px;
}
.z-0 {
  z-index: 0;
}
.z-10 {
  z-index: 10;
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
.h-60 {
  height: 15rem;
}
.h-max {
  height: -moz-max-content;
  height: max-content;
}
.h-screen {
  height: 100vh;
}
.min-h-screen {
  min-height: 100vh;
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
.w-screen {
  width: 100vw;
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
.overscroll-none {
  overscroll-behavior: none;
}
.rounded-full {
  border-radius: 9999px;
}
.rounded-md {
  border-radius: 0.375rem;
}
.rounded-xl {
  border-radius: 0.75rem;
}
.rounded-t-md {
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
}
.rounded-bl-md {
  border-bottom-left-radius: 0.375rem;
}
.rounded-br-md {
  border-bottom-right-radius: 0.375rem;
}
.border {
  border-width: 1px;
}
.border-2 {
  border-width: 2px;
}
.border-solid {
  border-style: solid;
}
.border-blue-800 {
  --tw-border-opacity: 1;
  border-color: rgb(30 64 175 / var(--tw-border-opacity));
}
.border-gray-200 {
  --tw-border-opacity: 1;
  border-color: rgb(229 231 235 / var(--tw-border-opacity));
}
.border-gray-600 {
  --tw-border-opacity: 1;
  border-color: rgb(75 85 99 / var(--tw-border-opacity));
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
.border-transparent {
  border-color: transparent;
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
.bg-gray-500 {
  --tw-bg-opacity: 1;
  background-color: rgb(107 114 128 / var(--tw-bg-opacity));
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
.bg-lime-500 {
  --tw-bg-opacity: 1;
  background-color: rgb(132 204 22 / var(--tw-bg-opacity));
}
.bg-lime-600 {
  --tw-bg-opacity: 1;
  background-color: rgb(101 163 13 / var(--tw-bg-opacity));
}
.bg-lime-700 {
  --tw-bg-opacity: 1;
  background-color: rgb(77 124 15 / var(--tw-bg-opacity));
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
.bg-red-600 {
  --tw-bg-opacity: 1;
  background-color: rgb(220 38 38 / var(--tw-bg-opacity));
}
.bg-red-700 {
  --tw-bg-opacity: 1;
  background-color: rgb(185 28 28 / var(--tw-bg-opacity));
}
.bg-red-800 {
  --tw-bg-opacity: 1;
  background-color: rgb(153 27 27 / var(--tw-bg-opacity));
}
.bg-sky-700 {
  --tw-bg-opacity: 1;
  background-color: rgb(3 105 161 / var(--tw-bg-opacity));
}
.bg-slate-700 {
  --tw-bg-opacity: 1;
  background-color: rgb(51 65 85 / var(--tw-bg-opacity));
}
.bg-slate-800 {
  --tw-bg-opacity: 1;
  background-color: rgb(30 41 59 / var(--tw-bg-opacity));
}
.bg-slate-900 {
  --tw-bg-opacity: 1;
  background-color: rgb(15 23 42 / var(--tw-bg-opacity));
}
.bg-transparent {
  background-color: transparent;
}
.bg-opacity-0 {
  --tw-bg-opacity: 0;
}
.bg-opacity-20 {
  --tw-bg-opacity: 0.2;
}
.bg-opacity-30 {
  --tw-bg-opacity: 0.3;
}
.bg-opacity-70 {
  --tw-bg-opacity: 0.7;
}
.bg-opacity-80 {
  --tw-bg-opacity: 0.8;
}
.bg-gradient-to-bl {
  background-image: linear-gradient(to bottom left, var(--tw-gradient-stops));
}
.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}
.bg-gradient-to-tr {
  background-image: linear-gradient(to top right, var(--tw-gradient-stops));
}
.from-gray-300 {
  --tw-gradient-from: #d1d5db var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(209 213 219 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.from-gray-400 {
  --tw-gradient-from: #9ca3af var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(156 163 175 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.from-slate-200 {
  --tw-gradient-from: #e2e8f0 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(226 232 240 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.from-slate-400 {
  --tw-gradient-from: #94a3b8 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(148 163 184 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.from-slate-500 {
  --tw-gradient-from: #64748b var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(100 116 139 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.from-slate-700 {
  --tw-gradient-from: #334155 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(51 65 85 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.to-gray-100 {
  --tw-gradient-to: #f3f4f6 var(--tw-gradient-to-position);
}
.to-gray-200 {
  --tw-gradient-to: #e5e7eb var(--tw-gradient-to-position);
}
.to-slate-200 {
  --tw-gradient-to: #e2e8f0 var(--tw-gradient-to-position);
}
.to-slate-400 {
  --tw-gradient-to: #94a3b8 var(--tw-gradient-to-position);
}
.to-slate-500 {
  --tw-gradient-to: #64748b var(--tw-gradient-to-position);
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
.pl-3 {
  padding-left: 0.75rem;
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
.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}
.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}
.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}
.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
.font-black {
  font-weight: 900;
}
.font-bold {
  font-weight: 700;
}
.font-semibold {
  font-weight: 600;
}
.tracking-wide {
  letter-spacing: 0.025em;
}
.tracking-wider {
  letter-spacing: 0.05em;
}
.tracking-widest {
  letter-spacing: 0.1em;
}
.text-gray-100 {
  --tw-text-opacity: 1;
  color: rgb(243 244 246 / var(--tw-text-opacity));
}
.text-gray-200 {
  --tw-text-opacity: 1;
  color: rgb(229 231 235 / var(--tw-text-opacity));
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
.text-lime-700 {
  --tw-text-opacity: 1;
  color: rgb(77 124 15 / var(--tw-text-opacity));
}
.text-lime-800 {
  --tw-text-opacity: 1;
  color: rgb(63 98 18 / var(--tw-text-opacity));
}
.text-orange-500 {
  --tw-text-opacity: 1;
  color: rgb(249 115 22 / var(--tw-text-opacity));
}
.text-orange-600 {
  --tw-text-opacity: 1;
  color: rgb(234 88 12 / var(--tw-text-opacity));
}
.text-orange-800 {
  --tw-text-opacity: 1;
  color: rgb(154 52 18 / var(--tw-text-opacity));
}
.text-red-500 {
  --tw-text-opacity: 1;
  color: rgb(239 68 68 / var(--tw-text-opacity));
}
.text-red-700 {
  --tw-text-opacity: 1;
  color: rgb(185 28 28 / var(--tw-text-opacity));
}
.text-red-800 {
  --tw-text-opacity: 1;
  color: rgb(153 27 27 / var(--tw-text-opacity));
}
.text-rose-700 {
  --tw-text-opacity: 1;
  color: rgb(190 18 60 / var(--tw-text-opacity));
}
.text-sky-600 {
  --tw-text-opacity: 1;
  color: rgb(2 132 199 / var(--tw-text-opacity));
}
.text-slate-700 {
  --tw-text-opacity: 1;
  color: rgb(51 65 85 / var(--tw-text-opacity));
}
.text-teal-900 {
  --tw-text-opacity: 1;
  color: rgb(19 78 74 / var(--tw-text-opacity));
}
.underline {
  text-decoration-line: underline;
}
.outline-none {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.outline {
  outline-style: solid;
}
.blur {
  --tw-blur: blur(8px);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.blur-sm {
  --tw-blur: blur(4px);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.backdrop-blur-md {
  --tw-backdrop-blur: blur(12px);
  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
          backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}
.backdrop-blur-sm {
  --tw-backdrop-blur: blur(4px);
  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
          backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}
.backdrop-filter {
  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
          backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}

.nanum-gothic-coding-regular {
  font-family: "Nanum Gothic Coding", monospace;
  font-weight: 400;
  font-style: normal;
}

.nanum-gothic-coding-bold {
  font-family: "Nanum Gothic Coding", monospace;
  font-weight: 700;
  font-style: normal;
}

.hover\\:border-gray-800:hover {
  --tw-border-opacity: 1;
  border-color: rgb(31 41 55 / var(--tw-border-opacity));
}

.hover\\:bg-gray-200:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(229 231 235 / var(--tw-bg-opacity));
}

.hover\\:bg-orange-500:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(249 115 22 / var(--tw-bg-opacity));
}

.hover\\:text-gray-800:hover {
  --tw-text-opacity: 1;
  color: rgb(31 41 55 / var(--tw-text-opacity));
}

.focus\\:border-2:focus {
  border-width: 2px;
}

.focus\\:border-gray-200:focus {
  --tw-border-opacity: 1;
  border-color: rgb(229 231 235 / var(--tw-border-opacity));
}

.focus\\:ring-0:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}
`, "",{"version":3,"sources":["webpack://./src/styles.css"],"names":[],"mappings":"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;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,wBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,2BAAmB;EAAnB;AAAmB;AAAnB;EAAA,2BAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,gCAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,4DAAmB;EAAnB,qEAAmB;EAAnB;AAAmB;AAAnB;EAAA,4DAAmB;EAAnB,qEAAmB;EAAnB;AAAmB;AAAnB;EAAA,4DAAmB;EAAnB,qEAAmB;EAAnB;AAAmB;AAAnB;EAAA,4DAAmB;EAAnB,qEAAmB;EAAnB;AAAmB;AAAnB;EAAA,4DAAmB;EAAnB,qEAAmB;EAAnB;AAAmB;AAAnB;EAAA,4DAAmB;EAAnB,kEAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,qBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,mBAAmB;EAAnB;AAAmB;AAAnB;EAAA,iBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,iBAAmB;EAAnB;AAAmB;AAAnB;EAAA,mBAAmB;EAAnB;AAAmB;AAAnB;EAAA,mBAAmB;EAAnB;AAAmB;AAAnB;EAAA,mBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,8BAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,8BAAmB;EAAnB,+QAAmB;UAAnB;AAAmB;AAAnB;EAAA,6BAAmB;EAAnB,+QAAmB;UAAnB;AAAmB;AAAnB;EAAA,+QAAmB;UAAnB;AAAmB;;AAEnB;EACE,6CAA6C;EAC7C,gBAAgB;EAChB,kBAAkB;AACpB;;AAEA;EACE,6CAA6C;EAC7C,gBAAgB;EAChB,kBAAkB;AACpB;;AAdA;EAAA,sBAeA;EAfA;AAeA;;AAfA;EAAA,kBAeA;EAfA;AAeA;;AAfA;EAAA,kBAeA;EAfA;AAeA;;AAfA;EAAA,oBAeA;EAfA;AAeA;;AAfA;EAAA;AAeA;;AAfA;EAAA,sBAeA;EAfA;AAeA;;AAfA;EAAA,2GAeA;EAfA,yGAeA;EAfA;AAeA","sourcesContent":["@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n.nanum-gothic-coding-regular {\n  font-family: \"Nanum Gothic Coding\", monospace;\n  font-weight: 400;\n  font-style: normal;\n}\n\n.nanum-gothic-coding-bold {\n  font-family: \"Nanum Gothic Coding\", monospace;\n  font-weight: 700;\n  font-style: normal;\n}\n"],"sourceRoot":""}]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQiwwQkFBMEI7QUFDMUI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxrRkFBa0YsWUFBWSxNQUFNLE9BQU8scUJBQXFCLG9CQUFvQixxQkFBcUIscUJBQXFCLE1BQU0sTUFBTSxXQUFXLE1BQU0sWUFBWSxNQUFNLE1BQU0scUJBQXFCLHFCQUFxQixxQkFBcUIsVUFBVSxvQkFBb0IscUJBQXFCLHFCQUFxQixxQkFBcUIscUJBQXFCLE1BQU0sT0FBTyxNQUFNLEtBQUssb0JBQW9CLHFCQUFxQixNQUFNLFFBQVEsTUFBTSxLQUFLLG9CQUFvQixvQkFBb0IscUJBQXFCLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxXQUFXLE1BQU0sTUFBTSxNQUFNLFVBQVUsV0FBVyxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssVUFBVSxXQUFXLE1BQU0sTUFBTSxNQUFNLE1BQU0sV0FBVyxNQUFNLFNBQVMsTUFBTSxRQUFRLHFCQUFxQixxQkFBcUIscUJBQXFCLG9CQUFvQixNQUFNLE1BQU0sTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLE1BQU0sTUFBTSxVQUFVLFVBQVUsV0FBVyxXQUFXLE1BQU0sS0FBSyxVQUFVLE1BQU0sS0FBSyxVQUFVLE1BQU0sUUFBUSxNQUFNLEtBQUssb0JBQW9CLHFCQUFxQixxQkFBcUIsTUFBTSxRQUFRLE1BQU0sU0FBUyxxQkFBcUIscUJBQXFCLHFCQUFxQixvQkFBb0IscUJBQXFCLHFCQUFxQixvQkFBb0Isb0JBQW9CLG9CQUFvQixNQUFNLE1BQU0sTUFBTSxNQUFNLFdBQVcsTUFBTSxPQUFPLE1BQU0sUUFBUSxxQkFBcUIscUJBQXFCLHFCQUFxQixNQUFNLE1BQU0sTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sTUFBTSxNQUFNLFVBQVUsTUFBTSxPQUFPLE1BQU0sS0FBSyxxQkFBcUIscUJBQXFCLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE9BQU8sTUFBTSxLQUFLLHFCQUFxQixvQkFBb0IsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxNQUFNLGlCQUFpQixVQUFVLE1BQU0sS0FBSyxVQUFVLFVBQVUsTUFBTSxLQUFLLFVBQVUsTUFBTSxPQUFPLFdBQVcsVUFBVSxVQUFVLE1BQU0sTUFBTSxLQUFLLEtBQUssVUFBVSxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxPQUFPLE1BQU0sS0FBSyxvQkFBb0Isb0JBQW9CLE1BQU0sTUFBTSxvQkFBb0Isb0JBQW9CLE1BQU0sTUFBTSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sS0FBSyxLQUFLLFVBQVUsTUFBTSxRQUFRLE1BQU0sWUFBWSxvQkFBb0IscUJBQXFCLE1BQU0sTUFBTSxNQUFNLE1BQU0sVUFBVSxVQUFVLE1BQU0sV0FBVyxLQUFLLFVBQVUsTUFBTSxLQUFLLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsS0FBSyxNQUFNLEtBQUssV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxLQUFLLEtBQUssS0FBSyxLQUFLLE1BQU0sT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxhQUFhLE1BQU0sTUFBTSxNQUFNLFlBQVksYUFBYSxNQUFNLE1BQU0sTUFBTSxZQUFZLGFBQWEsTUFBTSxNQUFNLE1BQU0sWUFBWSxhQUFhLE1BQU0sTUFBTSxNQUFNLFlBQVksYUFBYSxNQUFNLE1BQU0sTUFBTSxZQUFZLGFBQWEsTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxZQUFZLGFBQWEsTUFBTSxNQUFNLE1BQU0sWUFBWSxhQUFhLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxPQUFPLE1BQU0sWUFBWSxhQUFhLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxhQUFhLE9BQU8sS0FBSyxXQUFXLEtBQUssTUFBTSxLQUFLLFdBQVcsS0FBSyxNQUFNLEtBQUssV0FBVyxLQUFLLE1BQU0sS0FBSyxXQUFXLEtBQUssTUFBTSxLQUFLLEtBQUssTUFBTSxLQUFLLFdBQVcsS0FBSyxNQUFNLEtBQUssV0FBVyxXQUFXLEtBQUssd0NBQXdDLHVCQUF1QixzQkFBc0Isa0NBQWtDLG9EQUFvRCxxQkFBcUIsdUJBQXVCLEdBQUcsK0JBQStCLG9EQUFvRCxxQkFBcUIsdUJBQXVCLEdBQUcscUJBQXFCO0FBQzk4UDtBQUNBLGlFQUFlLHVCQUF1QixFQUFDOzs7Ozs7Ozs7OztBQ2pxQzFCOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxREFBcUQ7QUFDckQ7QUFDQTtBQUNBLGdEQUFnRDtBQUNoRDtBQUNBO0FBQ0EscUZBQXFGO0FBQ3JGO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixpQkFBaUI7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLHFCQUFxQjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVixzRkFBc0YscUJBQXFCO0FBQzNHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVixpREFBaUQscUJBQXFCO0FBQ3RFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVixzREFBc0QscUJBQXFCO0FBQzNFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUNwRmE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVEQUF1RCxjQUFjO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNkQSxNQUErRjtBQUMvRixNQUFxRjtBQUNyRixNQUE0RjtBQUM1RixNQUErRztBQUMvRyxNQUF3RztBQUN4RyxNQUF3RztBQUN4RyxNQUEySztBQUMzSztBQUNBOztBQUVBOztBQUVBLDRCQUE0QixxR0FBbUI7QUFDL0Msd0JBQXdCLGtIQUFhOztBQUVyQyx1QkFBdUIsdUdBQWE7QUFDcEM7QUFDQSxpQkFBaUIsK0ZBQU07QUFDdkIsNkJBQTZCLHNHQUFrQjs7QUFFL0MsYUFBYSwwR0FBRyxDQUFDLHVKQUFPOzs7O0FBSXFIO0FBQzdJLE9BQU8saUVBQWUsdUpBQU8sSUFBSSx1SkFBTyxVQUFVLHVKQUFPLG1CQUFtQixFQUFDOzs7Ozs7Ozs7OztBQzFCaEU7O0FBRWI7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLHdCQUF3QjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixpQkFBaUI7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQiw0QkFBNEI7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQiw2QkFBNkI7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUNuRmE7O0FBRWI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7O0FDakNhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUNUYTs7QUFFYjtBQUNBO0FBQ0EsY0FBYyxLQUF3QyxHQUFHLHNCQUFpQixHQUFHLENBQUk7QUFDakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7OztBQ1RhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0RBQWtEO0FBQ2xEO0FBQ0E7QUFDQSwwQ0FBMEM7QUFDMUM7QUFDQTtBQUNBO0FBQ0EsaUZBQWlGO0FBQ2pGO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EseURBQXlEO0FBQ3pEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0M7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7O0FDNURhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7VUNiQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLElBQUk7V0FDSjtXQUNBO1dBQ0EsSUFBSTtXQUNKO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLENBQUM7V0FDRDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsRUFBRTtXQUNGO1dBQ0Esc0dBQXNHO1dBQ3RHO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQSxFQUFFO1dBQ0Y7V0FDQTs7Ozs7V0NoRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1dDTkE7Ozs7O1VFQUE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvYWN0aW9uQ29udHJvbGxlci5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvZXJyb3JzLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9nYW1lLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9nYW1lYm9hcmQuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9wbGF5ZXIuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3NoaXAuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3VpTWFuYWdlci5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvc3R5bGVzLmNzcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9zdHlsZXMuY3NzPzBhMjUiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9hc3luYyBtb2R1bGUiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9ub25jZSIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEdhbWVib2FyZCBmcm9tIFwiLi9nYW1lYm9hcmRcIjtcblxuY29uc3QgeyBncmlkIH0gPSBHYW1lYm9hcmQoKTtcblxuY29uc3Qgc2hpcHNUb1BsYWNlID0gW1xuICB7IHNoaXBUeXBlOiBcImNhcnJpZXJcIiwgc2hpcExlbmd0aDogNSB9LFxuICB7IHNoaXBUeXBlOiBcImJhdHRsZXNoaXBcIiwgc2hpcExlbmd0aDogNCB9LFxuICB7IHNoaXBUeXBlOiBcInN1Ym1hcmluZVwiLCBzaGlwTGVuZ3RoOiAzIH0sXG4gIHsgc2hpcFR5cGU6IFwiY3J1aXNlclwiLCBzaGlwTGVuZ3RoOiAzIH0sXG4gIHsgc2hpcFR5cGU6IFwiZGVzdHJveWVyXCIsIHNoaXBMZW5ndGg6IDIgfSxcbl07XG5cbmNvbnN0IGhpdEJnQ2xyID0gXCJiZy1saW1lLTcwMFwiO1xuY29uc3QgaGl0VGV4dENsciA9IFwidGV4dC1saW1lLTcwMFwiO1xuY29uc3QgbWlzc0JnQ2xyID0gXCJiZy1ncmF5LTQwMFwiO1xuY29uc3QgbWlzc1RleHRDbHIgPSBcInRleHQtb3JhbmdlLTgwMFwiO1xuY29uc3QgZXJyb3JUZXh0Q2xyID0gXCJ0ZXh0LXJlZC04MDBcIjtcbmNvbnN0IGRlZmF1bHRUZXh0Q2xyID0gXCJ0ZXh0LWdyYXktNjAwXCI7XG5cbmNvbnN0IHByaW1hcnlIb3ZlckNsciA9IFwiaG92ZXI6Ymctb3JhbmdlLTUwMFwiO1xuY29uc3QgaGlnaGxpZ2h0Q2xyID0gXCJiZy1vcmFuZ2UtMzAwXCI7XG5cbmxldCBjdXJyZW50T3JpZW50YXRpb24gPSBcImhcIjsgLy8gRGVmYXVsdCBvcmllbnRhdGlvblxubGV0IGN1cnJlbnRTaGlwO1xubGV0IGxhc3RIb3ZlcmVkQ2VsbCA9IG51bGw7IC8vIFN0b3JlIHRoZSBsYXN0IGhvdmVyZWQgY2VsbCdzIElEXG5cbmNvbnN0IHBsYWNlU2hpcEd1aWRlID0ge1xuICBwcm9tcHQ6XG4gICAgXCJFbnRlciB0aGUgZ3JpZCBwb3NpdGlvbiAoaS5lLiAnQTEnKSBhbmQgb3JpZW50YXRpb24gKCdoJyBmb3IgaG9yaXpvbnRhbCBhbmQgJ3YnIGZvciB2ZXJ0aWNhbCksIHNlcGFyYXRlZCB3aXRoIGEgc3BhY2UuIEZvciBleGFtcGxlICdBMiB2Jy4gQWx0ZXJuYXRpdmVseSwgb24geW91IGdhbWVib2FyZCBjbGljayB0aGUgY2VsbCB5b3Ugd2FudCB0byBzZXQgYXQgdGhlIHN0YXJ0aW5nIHBvaW50LCB1c2Ugc3BhY2ViYXIgdG8gdG9nZ2xlIHRoZSBvcmllbnRhdGlvbi5cIixcbiAgcHJvbXB0VHlwZTogXCJndWlkZVwiLFxufTtcblxuY29uc3QgZ2FtZXBsYXlHdWlkZSA9IHtcbiAgcHJvbXB0OlxuICAgIFwiRW50ZXIgZ3JpZCBwb3NpdGlvbiAoaS5lLiAnQTEnKSB5b3Ugd2FudCB0byBhdHRhY2suIEFsdGVybmF0aXZlbHksIGNsaWNrIHRoZSBjZWxsIHlvdSB3YW50IHRvIGF0dGFjayBvbiB0aGUgb3Bwb25lbnQncyBnYW1lYm9hcmRcIixcbiAgcHJvbXB0VHlwZTogXCJndWlkZVwiLFxufTtcblxuY29uc3QgdHVyblByb21wdCA9IHtcbiAgcHJvbXB0OiBcIk1ha2UgeW91ciBtb3ZlLlwiLFxuICBwcm9tcHRUeXBlOiBcImluc3RydWN0aW9uXCIsXG59O1xuXG5jb25zdCBwcm9jZXNzQ29tbWFuZCA9IChjb21tYW5kLCBpc01vdmUpID0+IHtcbiAgLy8gSWYgaXNNb3ZlIGlzIHRydXRoeSwgYXNzaWduIGFzIHNpbmdsZSBpdGVtIGFycmF5LCBvdGhlcndpc2Ugc3BsaXQgdGhlIGNvbW1hbmQgYnkgc3BhY2VcbiAgY29uc3QgcGFydHMgPSBpc01vdmUgPyBbY29tbWFuZF0gOiBjb21tYW5kLnNwbGl0KFwiIFwiKTtcbiAgaWYgKCFpc01vdmUgJiYgcGFydHMubGVuZ3RoICE9PSAyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgXCJJbnZhbGlkIGNvbW1hbmQgZm9ybWF0LiBQbGVhc2UgdXNlIHRoZSBmb3JtYXQgJ0dyaWRQb3NpdGlvbiBPcmllbnRhdGlvbicuXCIsXG4gICAgKTtcbiAgfVxuXG4gIC8vIFByb2Nlc3MgYW5kIHZhbGlkYXRlIHRoZSBncmlkIHBvc2l0aW9uXG4gIGNvbnN0IGdyaWRQb3NpdGlvbiA9IHBhcnRzWzBdLnRvVXBwZXJDYXNlKCk7XG4gIGlmIChncmlkUG9zaXRpb24ubGVuZ3RoIDwgMiB8fCBncmlkUG9zaXRpb24ubGVuZ3RoID4gMykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgZ3JpZCBwb3NpdGlvbi4gTXVzdCBiZSAyIHRvIDMgY2hhcmFjdGVycyBsb25nLlwiKTtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIGdyaWQgcG9zaXRpb24gYWdhaW5zdCB0aGUgZ3JpZCBtYXRyaXhcbiAgY29uc3QgdmFsaWRHcmlkUG9zaXRpb25zID0gZ3JpZC5mbGF0KCk7IC8vIEZsYXR0ZW4gdGhlIGdyaWQgZm9yIGVhc2llciBzZWFyY2hpbmdcbiAgaWYgKCF2YWxpZEdyaWRQb3NpdGlvbnMuaW5jbHVkZXMoZ3JpZFBvc2l0aW9uKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIFwiSW52YWxpZCBncmlkIHBvc2l0aW9uLiBEb2VzIG5vdCBtYXRjaCBhbnkgdmFsaWQgZ3JpZCB2YWx1ZXMuXCIsXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0IHJlc3VsdCA9IHsgZ3JpZFBvc2l0aW9uIH07XG5cbiAgaWYgKCFpc01vdmUpIHtcbiAgICAvLyBQcm9jZXNzIGFuZCB2YWxpZGF0ZSB0aGUgb3JpZW50YXRpb25cbiAgICBjb25zdCBvcmllbnRhdGlvbiA9IHBhcnRzWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKG9yaWVudGF0aW9uICE9PSBcImhcIiAmJiBvcmllbnRhdGlvbiAhPT0gXCJ2XCIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgXCJJbnZhbGlkIG9yaWVudGF0aW9uLiBNdXN0IGJlIGVpdGhlciAnaCcgZm9yIGhvcml6b250YWwgb3IgJ3YnIGZvciB2ZXJ0aWNhbC5cIixcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmVzdWx0Lm9yaWVudGF0aW9uID0gb3JpZW50YXRpb247XG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIHByb2Nlc3NlZCBhbmQgdmFsaWRhdGVkIGNvbW1hbmQgcGFydHNcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8vIFRoZSBmdW5jdGlvbiBmb3IgdXBkYXRpbmcgdGhlIG91dHB1dCBkaXYgZWxlbWVudFxuY29uc3QgdXBkYXRlT3V0cHV0ID0gKG1lc3NhZ2UsIHR5cGUpID0+IHtcbiAgLy8gR2V0IHRoZSBvdXB1dCBlbGVtZW50XG4gIGNvbnN0IG91dHB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1vdXRwdXRcIik7XG5cbiAgLy8gQXBwZW5kIG5ldyBtZXNzYWdlXG4gIGNvbnN0IG1lc3NhZ2VFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTsgLy8gQ3JlYXRlIGEgbmV3IGRpdiBmb3IgdGhlIG1lc3NhZ2VcbiAgbWVzc2FnZUVsZW1lbnQudGV4dENvbnRlbnQgPSBtZXNzYWdlOyAvLyBTZXQgdGhlIHRleHQgY29udGVudCB0byB0aGUgbWVzc2FnZVxuXG4gIC8vIEFwcGx5IHN0eWxpbmcgYmFzZWQgb24gcHJvbXB0VHlwZVxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIFwidmFsaWRcIjpcbiAgICAgIG1lc3NhZ2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoaGl0VGV4dENscik7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwibWlzc1wiOlxuICAgICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZChtaXNzVGV4dENscik7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgIG1lc3NhZ2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoZXJyb3JUZXh0Q2xyKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKGRlZmF1bHRUZXh0Q2xyKTsgLy8gRGVmYXVsdCB0ZXh0IGNvbG9yXG4gIH1cblxuICBvdXRwdXQuYXBwZW5kQ2hpbGQobWVzc2FnZUVsZW1lbnQpOyAvLyBBZGQgdGhlIGVsZW1lbnQgdG8gdGhlIG91dHB1dFxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBvdXRwdXQuc2Nyb2xsVG9wID0gb3V0cHV0LnNjcm9sbEhlaWdodDsgLy8gU2Nyb2xsIHRvIHRoZSBib3R0b20gb2YgdGhlIG91dHB1dCBjb250YWluZXJcbn07XG5cbi8vIFRoZSBmdW5jdGlvbiBmb3IgZXhlY3V0aW5nIGNvbW1hbmRzIGZyb20gdGhlIGNvbnNvbGUgaW5wdXRcbmNvbnN0IGNvbnNvbGVMb2dQbGFjZW1lbnRDb21tYW5kID0gKHNoaXBUeXBlLCBncmlkUG9zaXRpb24sIG9yaWVudGF0aW9uKSA9PiB7XG4gIC8vIFNldCB0aGUgb3JpZW50YXRpb24gZmVlZGJhY2tcbiAgY29uc3QgZGlyRmVlYmFjayA9IG9yaWVudGF0aW9uID09PSBcImhcIiA/IFwiaG9yaXpvbnRhbGx5XCIgOiBcInZlcnRpY2FsbHlcIjtcbiAgLy8gU2V0IHRoZSBjb25zb2xlIG1lc3NhZ2VcbiAgY29uc3QgbWVzc2FnZSA9IGAke3NoaXBUeXBlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc2hpcFR5cGUuc2xpY2UoMSl9IHBsYWNlZCBhdCAke2dyaWRQb3NpdGlvbn0gZmFjaW5nICR7ZGlyRmVlYmFja31gO1xuXG4gIGNvbnNvbGUubG9nKGAke21lc3NhZ2V9YCk7XG5cbiAgdXBkYXRlT3V0cHV0KGA+ICR7bWVzc2FnZX1gLCBcInZhbGlkXCIpO1xuXG4gIC8vIENsZWFyIHRoZSBpbnB1dFxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtaW5wdXRcIikudmFsdWUgPSBcIlwiO1xufTtcblxuLy8gVGhlIGZ1bmN0aW9uIGZvciBleGVjdXRpbmcgY29tbWFuZHMgZnJvbSB0aGUgY29uc29sZSBpbnB1dFxuY29uc3QgY29uc29sZUxvZ01vdmVDb21tYW5kID0gKHJlc3VsdHNPYmplY3QpID0+IHtcbiAgLy8gU2V0IHRoZSBjb25zb2xlIG1lc3NhZ2VcbiAgY29uc3QgbWVzc2FnZSA9IGBUaGUgJHtyZXN1bHRzT2JqZWN0LnBsYXllcn0ncyBtb3ZlIG9uICR7cmVzdWx0c09iamVjdC5tb3ZlfSByZXN1bHRlZCBpbiBhICR7cmVzdWx0c09iamVjdC5oaXQgPyBcIkhJVFwiIDogXCJNSVNTXCJ9IWA7XG5cbiAgY29uc29sZS5sb2coYCR7bWVzc2FnZX1gKTtcblxuICB1cGRhdGVPdXRwdXQoYD4gJHttZXNzYWdlfWAsIHJlc3VsdHNPYmplY3QuaGl0ID8gXCJ2YWxpZFwiIDogXCJtaXNzXCIpO1xuXG4gIC8vIENsZWFyIHRoZSBpbnB1dFxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtaW5wdXRcIikudmFsdWUgPSBcIlwiO1xufTtcblxuY29uc3QgY29uc29sZUxvZ1NoaXBTaW5rID0gKHJlc3VsdHNPYmplY3QpID0+IHtcbiAgY29uc3QgeyBwbGF5ZXIsIHNoaXBUeXBlIH0gPSByZXN1bHRzT2JqZWN0O1xuICAvLyBTZXQgdGhlIGNvbnNvbGUgbWVzc2FnZVxuICBjb25zdCBtZXNzYWdlID1cbiAgICBwbGF5ZXIgPT09IFwiaHVtYW5cIlxuICAgICAgPyBgWW91IHN1bmsgdGhlaXIgJHtzaGlwVHlwZX0hYFxuICAgICAgOiBgVGhleSBzdW5rIHlvdXIgJHtzaGlwVHlwZX0hYDtcblxuICBjb25zb2xlLmxvZyhgJHttZXNzYWdlfWApO1xuXG4gIHVwZGF0ZU91dHB1dChgPiAke21lc3NhZ2V9YCwgXCJlcnJvclwiKTtcblxuICAvLyBDbGVhciB0aGUgaW5wdXRcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLWlucHV0XCIpLnZhbHVlID0gXCJcIjtcbn07XG5cbmNvbnN0IGNvbnNvbGVMb2dFcnJvciA9IChlcnJvciwgc2hpcFR5cGUpID0+IHtcbiAgaWYgKHNoaXBUeXBlKSB7XG4gICAgLy8gSWYgc2hpcFR5cGUgaXMgcGFzc2VkIHRoZW4gcHJvY2VzcyBlcnJvciBhcyBwbGFjZW1lbnQgZXJyb3JcbiAgICBjb25zb2xlLmVycm9yKGBFcnJvciBwbGFjaW5nICR7c2hpcFR5cGV9OiBtZXNzYWdlID0gJHtlcnJvci5tZXNzYWdlfS5gKTtcblxuICAgIHVwZGF0ZU91dHB1dChgPiBFcnJvciBwbGFjaW5nICR7c2hpcFR5cGV9OiAke2Vycm9yLm1lc3NhZ2V9YCwgXCJlcnJvclwiKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBlbHNlIGlmIHNoaXBUeXBlIGlzIHVuZGVmaW5lZCwgcHJvY2VzcyBlcnJvciBhcyBtb3ZlIGVycm9yXG4gICAgY29uc29sZS5sb2coYEVycm9yIG1ha2luZyBtb3ZlOiBtZXNzYWdlID0gJHtlcnJvci5tZXNzYWdlfS5gKTtcblxuICAgIHVwZGF0ZU91dHB1dChgPiBFcnJvciBtYWtpbmcgbW92ZTogbWVzc2FnZSA9ICR7ZXJyb3IubWVzc2FnZX0uYCwgXCJlcnJvclwiKTtcbiAgfVxuXG4gIC8vIENsZWFyIHRoZSBpbnB1dFxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtaW5wdXRcIikudmFsdWUgPSBcIlwiO1xufTtcblxuLy8gRnVuY3Rpb24gaW5pdGlhbGlzZSB1aU1hbmFnZXJcbmNvbnN0IGluaXRVaU1hbmFnZXIgPSAodWlNYW5hZ2VyKSA9PiB7XG4gIC8vIEluaXRpYWxpc2UgY29uc29sZVxuICB1aU1hbmFnZXIuaW5pdENvbnNvbGVVSSgpO1xuXG4gIC8vIEluaXRpYWxpc2UgZ2FtZWJvYXJkIHdpdGggY2FsbGJhY2sgZm9yIGNlbGwgY2xpY2tzXG4gIHVpTWFuYWdlci5jcmVhdGVHYW1lYm9hcmQoXCJodW1hbi1nYlwiKTtcbiAgdWlNYW5hZ2VyLmNyZWF0ZUdhbWVib2FyZChcImNvbXAtZ2JcIik7XG59O1xuXG4vLyBGdW5jdGlvbiB0byBjYWxjdWxhdGUgY2VsbCBJRHMgYmFzZWQgb24gc3RhcnQgcG9zaXRpb24sIGxlbmd0aCwgYW5kIG9yaWVudGF0aW9uXG5mdW5jdGlvbiBjYWxjdWxhdGVTaGlwQ2VsbHMoc3RhcnRDZWxsLCBzaGlwTGVuZ3RoLCBvcmllbnRhdGlvbikge1xuICBjb25zdCBjZWxsSWRzID0gW107XG4gIGNvbnN0IHJvd0luZGV4ID0gc3RhcnRDZWxsLmNoYXJDb2RlQXQoMCkgLSBcIkFcIi5jaGFyQ29kZUF0KDApO1xuICBjb25zdCBjb2xJbmRleCA9IHBhcnNlSW50KHN0YXJ0Q2VsbC5zdWJzdHJpbmcoMSksIDEwKSAtIDE7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICBpZiAob3JpZW50YXRpb24gPT09IFwidlwiKSB7XG4gICAgICBpZiAoY29sSW5kZXggKyBpID49IGdyaWRbMF0ubGVuZ3RoKSBicmVhazsgLy8gQ2hlY2sgZ3JpZCBib3VuZHNcbiAgICAgIGNlbGxJZHMucHVzaChcbiAgICAgICAgYCR7U3RyaW5nLmZyb21DaGFyQ29kZShyb3dJbmRleCArIFwiQVwiLmNoYXJDb2RlQXQoMCkpfSR7Y29sSW5kZXggKyBpICsgMX1gLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHJvd0luZGV4ICsgaSA+PSBncmlkLmxlbmd0aCkgYnJlYWs7IC8vIENoZWNrIGdyaWQgYm91bmRzXG4gICAgICBjZWxsSWRzLnB1c2goXG4gICAgICAgIGAke1N0cmluZy5mcm9tQ2hhckNvZGUocm93SW5kZXggKyBpICsgXCJBXCIuY2hhckNvZGVBdCgwKSl9JHtjb2xJbmRleCArIDF9YCxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNlbGxJZHM7XG59XG5cbi8vIEZ1bmN0aW9uIHRvIGhpZ2hsaWdodCBjZWxsc1xuZnVuY3Rpb24gaGlnaGxpZ2h0Q2VsbHMoY2VsbElkcykge1xuICBjZWxsSWRzLmZvckVhY2goKGNlbGxJZCkgPT4ge1xuICAgIGNvbnN0IGNlbGxFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcG9zaXRpb249XCIke2NlbGxJZH1cIl1gKTtcbiAgICBpZiAoY2VsbEVsZW1lbnQpIHtcbiAgICAgIGNlbGxFbGVtZW50LmNsYXNzTGlzdC5hZGQoaGlnaGxpZ2h0Q2xyKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBGdW5jdGlvbiB0byBjbGVhciBoaWdobGlnaHQgZnJvbSBjZWxsc1xuZnVuY3Rpb24gY2xlYXJIaWdobGlnaHQoY2VsbElkcykge1xuICBjZWxsSWRzLmZvckVhY2goKGNlbGxJZCkgPT4ge1xuICAgIGNvbnN0IGNlbGxFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcG9zaXRpb249XCIke2NlbGxJZH1cIl1gKTtcbiAgICBpZiAoY2VsbEVsZW1lbnQpIHtcbiAgICAgIGNlbGxFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoaGlnaGxpZ2h0Q2xyKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBGdW5jdGlvbiB0byB0b2dnbGUgb3JpZW50YXRpb25cbmZ1bmN0aW9uIHRvZ2dsZU9yaWVudGF0aW9uKCkge1xuICBjdXJyZW50T3JpZW50YXRpb24gPSBjdXJyZW50T3JpZW50YXRpb24gPT09IFwiaFwiID8gXCJ2XCIgOiBcImhcIjtcbiAgLy8gVXBkYXRlIHRoZSB2aXN1YWwgcHJvbXB0IGhlcmUgaWYgbmVjZXNzYXJ5XG59XG5cbmNvbnN0IGhhbmRsZVBsYWNlbWVudEhvdmVyID0gKGUpID0+IHtcbiAgY29uc3QgY2VsbCA9IGUudGFyZ2V0O1xuICBpZiAoXG4gICAgY2VsbC5jbGFzc0xpc3QuY29udGFpbnMoXCJnYW1lYm9hcmQtY2VsbFwiKSAmJlxuICAgIGNlbGwuZGF0YXNldC5wbGF5ZXIgPT09IFwiaHVtYW5cIlxuICApIHtcbiAgICAvLyBMb2dpYyB0byBoYW5kbGUgaG92ZXIgZWZmZWN0XG4gICAgY29uc3QgY2VsbFBvcyA9IGNlbGwuZGF0YXNldC5wb3NpdGlvbjtcbiAgICBsYXN0SG92ZXJlZENlbGwgPSBjZWxsUG9zO1xuICAgIGNvbnN0IGNlbGxzVG9IaWdobGlnaHQgPSBjYWxjdWxhdGVTaGlwQ2VsbHMoXG4gICAgICBjZWxsUG9zLFxuICAgICAgY3VycmVudFNoaXAuc2hpcExlbmd0aCxcbiAgICAgIGN1cnJlbnRPcmllbnRhdGlvbixcbiAgICApO1xuICAgIGhpZ2hsaWdodENlbGxzKGNlbGxzVG9IaWdobGlnaHQpO1xuICB9XG59O1xuXG5jb25zdCBoYW5kbGVNb3VzZUxlYXZlID0gKGUpID0+IHtcbiAgY29uc3QgY2VsbCA9IGUudGFyZ2V0O1xuICBpZiAoY2VsbC5jbGFzc0xpc3QuY29udGFpbnMoXCJnYW1lYm9hcmQtY2VsbFwiKSkge1xuICAgIC8vIExvZ2ljIGZvciBoYW5kbGluZyB3aGVuIHRoZSBjdXJzb3IgbGVhdmVzIGEgY2VsbFxuICAgIGNvbnN0IGNlbGxQb3MgPSBjZWxsLmRhdGFzZXQucG9zaXRpb247XG4gICAgaWYgKGNlbGxQb3MgPT09IGxhc3RIb3ZlcmVkQ2VsbCkge1xuICAgICAgY29uc3QgY2VsbHNUb0NsZWFyID0gY2FsY3VsYXRlU2hpcENlbGxzKFxuICAgICAgICBjZWxsUG9zLFxuICAgICAgICBjdXJyZW50U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgICBjdXJyZW50T3JpZW50YXRpb24sXG4gICAgICApO1xuICAgICAgY2xlYXJIaWdobGlnaHQoY2VsbHNUb0NsZWFyKTtcbiAgICAgIGxhc3RIb3ZlcmVkQ2VsbCA9IG51bGw7IC8vIFJlc2V0IGxhc3RIb3ZlcmVkQ2VsbCBzaW5jZSB0aGUgbW91c2UgaGFzIGxlZnRcbiAgICB9XG4gICAgbGFzdEhvdmVyZWRDZWxsID0gbnVsbDtcbiAgfVxufTtcblxuY29uc3QgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUgPSAoZSkgPT4ge1xuICBlLnByZXZlbnREZWZhdWx0KCk7IC8vIFByZXZlbnQgdGhlIGRlZmF1bHQgc3BhY2ViYXIgYWN0aW9uXG4gIGlmIChlLmtleSA9PT0gXCIgXCIgJiYgbGFzdEhvdmVyZWRDZWxsKSB7XG4gICAgLy8gRW5zdXJlIHNwYWNlYmFyIGlzIHByZXNzZWQgYW5kIHRoZXJlJ3MgYSBsYXN0IGhvdmVyZWQgY2VsbFxuXG4gICAgLy8gVG9nZ2xlIHRoZSBvcmllbnRhdGlvblxuICAgIHRvZ2dsZU9yaWVudGF0aW9uKCk7XG5cbiAgICAvLyBDbGVhciBwcmV2aW91c2x5IGhpZ2hsaWdodGVkIGNlbGxzXG4gICAgLy8gQXNzdW1pbmcgY2FsY3VsYXRlU2hpcENlbGxzIGFuZCBjbGVhckhpZ2hsaWdodCB3b3JrIGNvcnJlY3RseVxuICAgIGNvbnN0IG9sZENlbGxzVG9DbGVhciA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgIGxhc3RIb3ZlcmVkQ2VsbCxcbiAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICBjdXJyZW50T3JpZW50YXRpb24gPT09IFwiaFwiID8gXCJ2XCIgOiBcImhcIixcbiAgICApO1xuICAgIGNsZWFySGlnaGxpZ2h0KG9sZENlbGxzVG9DbGVhcik7XG5cbiAgICAvLyBIaWdobGlnaHQgbmV3IGNlbGxzIGJhc2VkIG9uIHRoZSBuZXcgb3JpZW50YXRpb25cbiAgICBjb25zdCBuZXdDZWxsc1RvSGlnaGxpZ2h0ID0gY2FsY3VsYXRlU2hpcENlbGxzKFxuICAgICAgbGFzdEhvdmVyZWRDZWxsLFxuICAgICAgY3VycmVudFNoaXAuc2hpcExlbmd0aCxcbiAgICAgIGN1cnJlbnRPcmllbnRhdGlvbixcbiAgICApO1xuICAgIGhpZ2hsaWdodENlbGxzKG5ld0NlbGxzVG9IaWdobGlnaHQpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBlbmFibGVDb21wdXRlckdhbWVib2FyZEhvdmVyKCkge1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9XCJjb21wdXRlclwiXScpXG4gICAgLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAgIGNlbGwuY2xhc3NMaXN0LnJlbW92ZShcInBvaW50ZXItZXZlbnRzLW5vbmVcIiwgXCJjdXJzb3ItZGVmYXVsdFwiKTtcbiAgICAgIGNlbGwuY2xhc3NMaXN0LnJlbW92ZShwcmltYXJ5SG92ZXJDbHIpO1xuICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKHByaW1hcnlIb3ZlckNscik7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGRpc2FibGVDb21wdXRlckdhbWVib2FyZEhvdmVyKGNlbGxzQXJyYXkpIHtcbiAgY2VsbHNBcnJheS5mb3JFYWNoKChjZWxsKSA9PiB7XG4gICAgY2VsbC5jbGFzc0xpc3QuYWRkKFwicG9pbnRlci1ldmVudHMtbm9uZVwiLCBcImN1cnNvci1kZWZhdWx0XCIpO1xuICAgIGNlbGwuY2xhc3NMaXN0LnJlbW92ZShwcmltYXJ5SG92ZXJDbHIpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZGlzYWJsZUh1bWFuR2FtZWJvYXJkSG92ZXIoKSB7XG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImh1bWFuXCJdJylcbiAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKFwicG9pbnRlci1ldmVudHMtbm9uZVwiLCBcImN1cnNvci1kZWZhdWx0XCIpO1xuICAgICAgY2VsbC5jbGFzc0xpc3QucmVtb3ZlKHByaW1hcnlIb3ZlckNscik7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHN3aXRjaEdhbWVib2FyZEhvdmVyU3RhdGVzKCkge1xuICAvLyBEaXNhYmxlIGhvdmVyIG9uIHRoZSBodW1hbidzIGdhbWVib2FyZFxuICBkaXNhYmxlSHVtYW5HYW1lYm9hcmRIb3ZlcigpO1xuXG4gIC8vIEVuYWJsZSBob3ZlciBvbiB0aGUgY29tcHV0ZXIncyBnYW1lYm9hcmRcbiAgZW5hYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlcigpO1xufVxuXG4vLyBGdW5jdGlvbiB0byBzZXR1cCBnYW1lYm9hcmQgZm9yIHNoaXAgcGxhY2VtZW50XG5jb25zdCBzZXR1cEdhbWVib2FyZEZvclBsYWNlbWVudCA9ICgpID0+IHtcbiAgY29uc3QgY29tcEdhbWVib2FyZENlbGxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAnLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPVwiY29tcHV0ZXJcIl0nLFxuICApO1xuICBkaXNhYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3Zlcihjb21wR2FtZWJvYXJkQ2VsbHMpO1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9XCJodW1hblwiXScpXG4gICAgLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgaGFuZGxlUGxhY2VtZW50SG92ZXIpO1xuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCBoYW5kbGVNb3VzZUxlYXZlKTtcbiAgICB9KTtcbiAgLy8gR2V0IGdhbWVib2FyZCBhcmVhIGRpdiBlbGVtZW50XG4gIGNvbnN0IGdhbWVib2FyZEFyZWEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgIFwiLmdhbWVib2FyZC1hcmVhLCBbZGF0YS1wbGF5ZXI9J2h1bWFuJ11cIixcbiAgKTtcbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyB0byBnYW1lYm9hcmQgYXJlYSB0byBhZGQgYW5kIHJlbW92ZSB0aGVcbiAgLy8gaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUgZXZlbnQgbGlzdGVuZXIgd2hlbiBlbnRlcmluZyBhbmQgZXhpdGluZyB0aGUgYXJlYVxuICBnYW1lYm9hcmRBcmVhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSk7XG4gIH0pO1xuICBnYW1lYm9hcmRBcmVhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSk7XG4gIH0pO1xufTtcblxuLy8gRnVuY3Rpb24gdG8gY2xlYW4gdXAgYWZ0ZXIgc2hpcCBwbGFjZW1lbnQgaXMgY29tcGxldGVcbmNvbnN0IGNsZWFudXBBZnRlclBsYWNlbWVudCA9ICgpID0+IHtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvckFsbCgnLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPVwiaHVtYW5cIl0nKVxuICAgIC5mb3JFYWNoKChjZWxsKSA9PiB7XG4gICAgICBjZWxsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIGhhbmRsZVBsYWNlbWVudEhvdmVyKTtcbiAgICAgIGNlbGwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgaGFuZGxlTW91c2VMZWF2ZSk7XG4gICAgfSk7XG4gIC8vIEdldCBnYW1lYm9hcmQgYXJlYSBkaXYgZWxlbWVudFxuICBjb25zdCBnYW1lYm9hcmRBcmVhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICBcIi5nYW1lYm9hcmQtYXJlYSwgW2RhdGEtcGxheWVyPSdodW1hbiddXCIsXG4gICk7XG4gIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMgdG8gZ2FtZWJvYXJkIGFyZWEgdG8gYWRkIGFuZCByZW1vdmUgdGhlXG4gIC8vIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlIGV2ZW50IGxpc3RlbmVyIHdoZW4gZW50ZXJpbmcgYW5kIGV4aXRpbmcgdGhlIGFyZWFcbiAgZ2FtZWJvYXJkQXJlYS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xuICB9KTtcbiAgZ2FtZWJvYXJkQXJlYS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xuICB9KTtcbiAgLy8gUmVtb3ZlIGV2ZW50IGxpc3RlbmVyIGZvciBrZXlkb3duIGV2ZW50c1xuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSk7XG59O1xuXG4vLyBGdW5jdGlvbiBmb3Igc3RhcnRpbmcgdGhlIGdhbWVcbmNvbnN0IHN0YXJ0R2FtZSA9IGFzeW5jICh1aU1hbmFnZXIsIGdhbWUpID0+IHtcbiAgLy8gU2V0IHVwIHRoZSBnYW1lIGJ5IGF1dG8gcGxhY2luZyBjb21wdXRlcidzIHNoaXBzIGFuZCBzZXR0aW5nIHRoZVxuICAvLyBjdXJyZW50IHBsYXllciB0byB0aGUgaHVtYW4gcGxheWVyXG4gIGF3YWl0IGdhbWUuc2V0VXAoKTtcblxuICAvLyBSZW5kZXIgdGhlIHNoaXAgZGlzcGxheSBmb3IgdGhlIGNvbXB1dGVyIHBsYXllclxuICBzaGlwc1RvUGxhY2UuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgIHVpTWFuYWdlci5yZW5kZXJTaGlwRGlzcChnYW1lLnBsYXllcnMuY29tcHV0ZXIsIHNoaXAuc2hpcFR5cGUpO1xuICB9KTtcblxuICAvLyBEaXNwbGF5IHByb21wdCBvYmplY3QgZm9yIHRha2luZyBhIHR1cm4gYW5kIHN0YXJ0aW5nIHRoZSBnYW1lXG4gIHVpTWFuYWdlci5kaXNwbGF5UHJvbXB0KHsgdHVyblByb21wdCwgZ2FtZXBsYXlHdWlkZSB9KTtcbn07XG5cbmZ1bmN0aW9uIGNvbmNsdWRlR2FtZSh3aW5uZXIpIHtcbiAgLy8gRGlzcGxheSB3aW5uZXIsIHVwZGF0ZSBVSSwgZXRjLlxuICBjb25zdCBtZXNzYWdlID0gYEdhbWUgT3ZlciEgVGhlICR7d2lubmVyfSBwbGF5ZXIgd2lucyFgO1xuICBjb25zb2xlLmxvZyhgR2FtZSBPdmVyISBUaGUgJHt3aW5uZXJ9IHBsYXllciB3aW5zIWApO1xuICB1cGRhdGVPdXRwdXQoYD4gJHttZXNzYWdlfWAsIHdpbm5lciA9PT0gXCJodW1hblwiID8gXCJ2YWxpZFwiIDogXCJlcnJvclwiKTtcblxuICAvLyBSZXN0YXJ0IHRoZSBnYW1lXG59XG5cbmNvbnN0IEFjdGlvbkNvbnRyb2xsZXIgPSAodWlNYW5hZ2VyLCBnYW1lKSA9PiB7XG4gIGNvbnN0IGh1bWFuUGxheWVyID0gZ2FtZS5wbGF5ZXJzLmh1bWFuO1xuICBjb25zdCBodW1hblBsYXllckdhbWVib2FyZCA9IGh1bWFuUGxheWVyLmdhbWVib2FyZDtcbiAgY29uc3QgY29tcFBsYXllciA9IGdhbWUucGxheWVycy5jb21wdXRlcjtcbiAgY29uc3QgY29tcFBsYXllckdhbWVib2FyZCA9IGNvbXBQbGF5ZXIuZ2FtZWJvYXJkO1xuXG4gIC8vIEZ1bmN0aW9uIHRvIHNldHVwIGV2ZW50IGxpc3RlbmVycyBmb3IgY29uc29sZSBhbmQgZ2FtZWJvYXJkIGNsaWNrc1xuICBmdW5jdGlvbiBzZXR1cEV2ZW50TGlzdGVuZXJzKGhhbmRsZXJGdW5jdGlvbiwgcGxheWVyVHlwZSkge1xuICAgIC8vIERlZmluZSBjbGVhbnVwIGZ1bmN0aW9ucyBpbnNpZGUgdG8gZW5zdXJlIHRoZXkgYXJlIGFjY2Vzc2libGUgZm9yIHJlbW92YWxcbiAgICBjb25zdCBjbGVhbnVwRnVuY3Rpb25zID0gW107XG5cbiAgICBjb25zdCBjb25zb2xlU3VibWl0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLXN1Ym1pdFwiKTtcbiAgICBjb25zdCBjb25zb2xlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtaW5wdXRcIik7XG5cbiAgICBjb25zdCBzdWJtaXRIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgY29uc3QgaW5wdXQgPSBjb25zb2xlSW5wdXQudmFsdWU7XG4gICAgICBoYW5kbGVyRnVuY3Rpb24oaW5wdXQpO1xuICAgICAgY29uc29sZUlucHV0LnZhbHVlID0gXCJcIjsgLy8gQ2xlYXIgaW5wdXQgYWZ0ZXIgc3VibWlzc2lvblxuICAgIH07XG5cbiAgICBjb25zdCBrZXlwcmVzc0hhbmRsZXIgPSAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSBcIkVudGVyXCIpIHtcbiAgICAgICAgc3VibWl0SGFuZGxlcigpOyAvLyBSZXVzZSBzdWJtaXQgbG9naWMgZm9yIEVudGVyIGtleSBwcmVzc1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zb2xlU3VibWl0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzdWJtaXRIYW5kbGVyKTtcbiAgICBjb25zb2xlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGtleXByZXNzSGFuZGxlcik7XG5cbiAgICAvLyBBZGQgY2xlYW51cCBmdW5jdGlvbiBmb3IgY29uc29sZSBsaXN0ZW5lcnNcbiAgICBjbGVhbnVwRnVuY3Rpb25zLnB1c2goKCkgPT4ge1xuICAgICAgY29uc29sZVN1Ym1pdEJ1dHRvbi5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgc3VibWl0SGFuZGxlcik7XG4gICAgICBjb25zb2xlSW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGtleXByZXNzSGFuZGxlcik7XG4gICAgfSk7XG5cbiAgICAvLyBTZXR1cCBmb3IgZ2FtZWJvYXJkIGNlbGwgY2xpY2tzXG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKGAuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9JHtwbGF5ZXJUeXBlfV1gKVxuICAgICAgLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAgICAgY29uc3QgY2xpY2tIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHsgcG9zaXRpb24gfSA9IGNlbGwuZGF0YXNldDtcbiAgICAgICAgICBsZXQgaW5wdXQ7XG4gICAgICAgICAgaWYgKHBsYXllclR5cGUgPT09IFwiaHVtYW5cIikge1xuICAgICAgICAgICAgaW5wdXQgPSBgJHtwb3NpdGlvbn0gJHtjdXJyZW50T3JpZW50YXRpb259YDtcbiAgICAgICAgICB9IGVsc2UgaWYgKHBsYXllclR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgICAgICAgaW5wdXQgPSBwb3NpdGlvbjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBcIkVycm9yISBJbnZhbGlkIHBsYXllciB0eXBlIHBhc3NlZCB0byBjbGlja0hhbmRsZXIhXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBoYW5kbGVyRnVuY3Rpb24oaW5wdXQpO1xuICAgICAgICB9O1xuICAgICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbGlja0hhbmRsZXIpO1xuXG4gICAgICAgIC8vIEFkZCBjbGVhbnVwIGZ1bmN0aW9uIGZvciBlYWNoIGNlbGwgbGlzdGVuZXJcbiAgICAgICAgY2xlYW51cEZ1bmN0aW9ucy5wdXNoKCgpID0+XG4gICAgICAgICAgY2VsbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xpY2tIYW5kbGVyKSxcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgLy8gUmV0dXJuIGEgc2luZ2xlIGNsZWFudXAgZnVuY3Rpb24gdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnNcbiAgICByZXR1cm4gKCkgPT4gY2xlYW51cEZ1bmN0aW9ucy5mb3JFYWNoKChjbGVhbnVwKSA9PiBjbGVhbnVwKCkpO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gcHJvbXB0QW5kUGxhY2VTaGlwKHNoaXBUeXBlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIC8vIFNldCB0aGUgY3VycmVudCBzaGlwXG4gICAgICBjdXJyZW50U2hpcCA9IHNoaXBzVG9QbGFjZS5maW5kKChzaGlwKSA9PiBzaGlwLnNoaXBUeXBlID09PSBzaGlwVHlwZSk7XG5cbiAgICAgIC8vIERpc3BsYXkgcHJvbXB0IGZvciB0aGUgc3BlY2lmaWMgc2hpcCB0eXBlIGFzIHdlbGwgYXMgdGhlIGd1aWRlIHRvIHBsYWNpbmcgc2hpcHNcbiAgICAgIGNvbnN0IHBsYWNlU2hpcFByb21wdCA9IHtcbiAgICAgICAgcHJvbXB0OiBgUGxhY2UgeW91ciAke3NoaXBUeXBlfS5gLFxuICAgICAgICBwcm9tcHRUeXBlOiBcImluc3RydWN0aW9uXCIsXG4gICAgICB9O1xuICAgICAgdWlNYW5hZ2VyLmRpc3BsYXlQcm9tcHQoeyBwbGFjZVNoaXBQcm9tcHQsIHBsYWNlU2hpcEd1aWRlIH0pO1xuXG4gICAgICBjb25zdCBoYW5kbGVWYWxpZElucHV0ID0gYXN5bmMgKGlucHV0KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgeyBncmlkUG9zaXRpb24sIG9yaWVudGF0aW9uIH0gPSBwcm9jZXNzQ29tbWFuZChpbnB1dCwgZmFsc2UpO1xuICAgICAgICAgIGF3YWl0IGh1bWFuUGxheWVyR2FtZWJvYXJkLnBsYWNlU2hpcChcbiAgICAgICAgICAgIHNoaXBUeXBlLFxuICAgICAgICAgICAgZ3JpZFBvc2l0aW9uLFxuICAgICAgICAgICAgb3JpZW50YXRpb24sXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zb2xlTG9nUGxhY2VtZW50Q29tbWFuZChzaGlwVHlwZSwgZ3JpZFBvc2l0aW9uLCBvcmllbnRhdGlvbik7XG4gICAgICAgICAgLy8gUmVtb3ZlIGNlbGwgaGlnaGxpZ2h0c1xuICAgICAgICAgIGNvbnN0IGNlbGxzVG9DbGVhciA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgICAgICAgIGdyaWRQb3NpdGlvbixcbiAgICAgICAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICAgICAgICBvcmllbnRhdGlvbixcbiAgICAgICAgICApO1xuICAgICAgICAgIGNsZWFySGlnaGxpZ2h0KGNlbGxzVG9DbGVhcik7XG5cbiAgICAgICAgICAvLyBEaXNwbGF5IHRoZSBzaGlwIG9uIHRoZSBnYW1lIGJvYXJkIGFuZCBzaGlwIHN0YXR1cyBkaXNwbGF5XG4gICAgICAgICAgdWlNYW5hZ2VyLnJlbmRlclNoaXBCb2FyZChodW1hblBsYXllciwgc2hpcFR5cGUpO1xuICAgICAgICAgIHVpTWFuYWdlci5yZW5kZXJTaGlwRGlzcChodW1hblBsYXllciwgc2hpcFR5cGUpO1xuXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZS1iZWZvcmUtZGVmaW5lXG4gICAgICAgICAgcmVzb2x2ZVNoaXBQbGFjZW1lbnQoKTsgLy8gU2hpcCBwbGFjZWQgc3VjY2Vzc2Z1bGx5LCByZXNvbHZlIHRoZSBwcm9taXNlXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZUxvZ0Vycm9yKGVycm9yLCBzaGlwVHlwZSk7XG4gICAgICAgICAgLy8gRG8gbm90IHJlamVjdCB0byBhbGxvdyBmb3IgcmV0cnksIGp1c3QgbG9nIHRoZSBlcnJvclxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAvLyBTZXR1cCBldmVudCBsaXN0ZW5lcnMgYW5kIGVuc3VyZSB3ZSBjYW4gY2xlYW4gdGhlbSB1cCBhZnRlciBwbGFjZW1lbnRcbiAgICAgIGNvbnN0IGNsZWFudXAgPSBzZXR1cEV2ZW50TGlzdGVuZXJzKGhhbmRsZVZhbGlkSW5wdXQsIFwiaHVtYW5cIik7XG5cbiAgICAgIC8vIEF0dGFjaCBjbGVhbnVwIHRvIHJlc29sdmUgdG8gZW5zdXJlIGl0J3MgY2FsbGVkIHdoZW4gdGhlIHByb21pc2UgcmVzb2x2ZXNcbiAgICAgIGNvbnN0IHJlc29sdmVTaGlwUGxhY2VtZW50ID0gKCkgPT4ge1xuICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvLyBTZXF1ZW50aWFsbHkgcHJvbXB0IGZvciBhbmQgcGxhY2UgZWFjaCBzaGlwXG4gIGFzeW5jIGZ1bmN0aW9uIHNldHVwU2hpcHNTZXF1ZW50aWFsbHkoKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwc1RvUGxhY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wXG4gICAgICBhd2FpdCBwcm9tcHRBbmRQbGFjZVNoaXAoc2hpcHNUb1BsYWNlW2ldLnNoaXBUeXBlKTsgLy8gV2FpdCBmb3IgZWFjaCBzaGlwIHRvIGJlIHBsYWNlZCBiZWZvcmUgY29udGludWluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIEZ1bmN0aW9uIGZvciBoYW5kbGluZyB0aGUgZ2FtZSBzZXR1cCBhbmQgc2hpcCBwbGFjZW1lbnRcbiAgY29uc3QgaGFuZGxlU2V0dXAgPSBhc3luYyAoKSA9PiB7XG4gICAgLy8gSW5pdCB0aGUgVUlcbiAgICBpbml0VWlNYW5hZ2VyKHVpTWFuYWdlcik7XG4gICAgc2V0dXBHYW1lYm9hcmRGb3JQbGFjZW1lbnQoKTtcbiAgICBhd2FpdCBzZXR1cFNoaXBzU2VxdWVudGlhbGx5KCk7XG4gICAgLy8gUHJvY2VlZCB3aXRoIHRoZSByZXN0IG9mIHRoZSBnYW1lIHNldHVwIGFmdGVyIGFsbCBzaGlwcyBhcmUgcGxhY2VkXG4gICAgY2xlYW51cEFmdGVyUGxhY2VtZW50KCk7XG5cbiAgICAvLyBTdGFydCB0aGUgZ2FtZVxuICAgIGF3YWl0IHN0YXJ0R2FtZSh1aU1hbmFnZXIsIGdhbWUpO1xuXG4gICAgY29uc3Qgb3V0cHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLW91dHB1dFwiKTtcbiAgICB1cGRhdGVPdXRwdXQoXCI+IEFsbCBzaGlwcyBwbGFjZWQsIGdhbWUgc2V0dXAgY29tcGxldGUhXCIpO1xuICAgIGNvbnNvbGUubG9nKFwiQWxsIHNoaXBzIHBsYWNlZCwgZ2FtZSBzZXR1cCBjb21wbGV0ZSFcIik7XG4gICAgc3dpdGNoR2FtZWJvYXJkSG92ZXJTdGF0ZXMoKTtcbiAgfTtcblxuICBjb25zdCB1cGRhdGVDb21wdXRlckRpc3BsYXlzID0gKGh1bWFuTW92ZVJlc3VsdCkgPT4ge1xuICAgIC8vIFNldCB0aGUgcGxheWVyIHNlbGVjdG9yIG9mIHRoZSBvcHBvbmVudCBkZXBlbmRpbmcgb24gdGhlIHBsYXllclxuICAgIC8vIHdobyBtYWRlIHRoZSBtb3ZlXG4gICAgY29uc3QgcGxheWVyU2VsZWN0b3IgPVxuICAgICAgaHVtYW5Nb3ZlUmVzdWx0LnBsYXllciA9PT0gXCJodW1hblwiID8gXCJjb21wdXRlclwiIDogXCJodW1hblwiO1xuICAgIC8vIEdldCB0aGUgRE9NIGVsZW1lbnQgZm9yIHRoZSBjZWxsXG4gICAgY29uc3QgY2VsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBgLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPSR7cGxheWVyU2VsZWN0b3J9XVtkYXRhLXBvc2l0aW9uPSR7aHVtYW5Nb3ZlUmVzdWx0Lm1vdmV9XWAsXG4gICAgKTtcblxuICAgIC8vIERpc2FibGUgdGhlIGNlbGwgZnJvbSBmdXR1cmUgY2xpY2tzXG4gICAgZGlzYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoW2NlbGxdKTtcblxuICAgIC8vIEhhbmRsZSBtaXNzIGFuZCBoaXRcbiAgICBpZiAoIWh1bWFuTW92ZVJlc3VsdC5oaXQpIHtcbiAgICAgIC8vIFVwZGF0ZSB0aGUgY2VsbHMgc3R5bGluZyB0byByZWZsZWN0IG1pc3NcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChtaXNzQmdDbHIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBVcGRhdGUgdGhlIGNlbGxzIHN0eWxpbmcgdG8gcmVmbGVjdCBoaXRcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChoaXRCZ0Nscik7XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgc2hpcCBzZWN0aW9uIGluIHRoZSBzaGlwIHN0YXR1cyBkaXNwbGF5XG4gICAgICB1aU1hbmFnZXIudXBkYXRlU2hpcFNlY3Rpb24oXG4gICAgICAgIGh1bWFuTW92ZVJlc3VsdC5tb3ZlLFxuICAgICAgICBodW1hbk1vdmVSZXN1bHQuc2hpcFR5cGUsXG4gICAgICAgIHBsYXllclNlbGVjdG9yLFxuICAgICAgKTtcbiAgICB9XG4gIH07XG5cbiAgYXN5bmMgZnVuY3Rpb24gcHJvbXB0UGxheWVyTW92ZShjb21wTW92ZVJlc3VsdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgaHVtYW5Nb3ZlUmVzdWx0O1xuICAgICAgLy8gVXBkYXRlIHRoZSBwbGF5ZXIgd2l0aCB0aGUgcmVzdWx0IG9mIHRoZSBjb21wdXRlcidzIGxhc3QgbW9yZVxuICAgICAgLy8gKGlmIHRoZXJlIGlzIG9uZSlcbiAgICAgIGlmIChjb21wTW92ZVJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIExvZyB0aGUgcmVzdWx0IG9mIHRoZSBjb21wdXRlcidzIG1vdmUgdG8gdGhlIGNvbnNvbGVcbiAgICAgICAgY29uc29sZUxvZ01vdmVDb21tYW5kKGNvbXBNb3ZlUmVzdWx0KTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coYE1ha2UgYSBtb3ZlIWApO1xuXG4gICAgICBjb25zdCBoYW5kbGVWYWxpZE1vdmUgPSBhc3luYyAobW92ZSkgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhgaGFuZGxlVmFsaWRJbnB1dDogbW92ZSA9ICR7bW92ZX1gKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB7IGdyaWRQb3NpdGlvbiB9ID0gcHJvY2Vzc0NvbW1hbmQobW92ZSwgdHJ1ZSk7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coYGhhbmRsZVZhbGlkSW5wdXQ6IGdyaWRQb3NpdGlvbiA9ICR7Z3JpZFBvc2l0aW9ufWApO1xuICAgICAgICAgIGh1bWFuTW92ZVJlc3VsdCA9IGF3YWl0IGh1bWFuUGxheWVyLm1ha2VNb3ZlKFxuICAgICAgICAgICAgY29tcFBsYXllckdhbWVib2FyZCxcbiAgICAgICAgICAgIGdyaWRQb3NpdGlvbixcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSBjb21wdXRlciBwbGF5ZXIncyBzaGlwcyBkaXNwbGF5IGFuZCBnYW1lYm9hcmRcbiAgICAgICAgICAvLyBkZXBlbmRpbmcgb24gb3V0Y29tZSBvZiBtb3ZlXG4gICAgICAgICAgdXBkYXRlQ29tcHV0ZXJEaXNwbGF5cyhodW1hbk1vdmVSZXN1bHQpO1xuXG4gICAgICAgICAgLy8gQ29tbXVuaWNhdGUgdGhlIHJlc3VsdCBvZiB0aGUgbW92ZSB0byB0aGUgdXNlclxuICAgICAgICAgIGNvbnNvbGVMb2dNb3ZlQ29tbWFuZChodW1hbk1vdmVSZXN1bHQpO1xuXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZS1iZWZvcmUtZGVmaW5lXG4gICAgICAgICAgcmVzb2x2ZU1vdmUoKTsgLy8gTW92ZSBleGVjdXRlZCBzdWNjZXNzZnVsbHksIHJlc29sdmUgdGhlIHByb21pc2VcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlTG9nRXJyb3IoZXJyb3IpO1xuICAgICAgICAgIC8vIERvIG5vdCByZWplY3QgdG8gYWxsb3cgZm9yIHJldHJ5LCBqdXN0IGxvZyB0aGUgZXJyb3JcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gU2V0dXAgZXZlbnQgbGlzdGVuZXJzIGFuZCBlbnN1cmUgd2UgY2FuIGNsZWFuIHRoZW0gdXAgYWZ0ZXIgcGxhY2VtZW50XG4gICAgICBjb25zdCBjbGVhbnVwID0gc2V0dXBFdmVudExpc3RlbmVycyhoYW5kbGVWYWxpZE1vdmUsIFwiY29tcHV0ZXJcIik7XG5cbiAgICAgIC8vIEF0dGFjaCBjbGVhbnVwIHRvIHJlc29sdmUgdG8gZW5zdXJlIGl0J3MgY2FsbGVkIHdoZW4gdGhlIHByb21pc2UgcmVzb2x2ZXNcbiAgICAgIGNvbnN0IHJlc29sdmVNb3ZlID0gKCkgPT4ge1xuICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgIHJlc29sdmUoaHVtYW5Nb3ZlUmVzdWx0KTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBjb21wdXRlck1vdmUoKSB7XG4gICAgbGV0IGNvbXBNb3ZlUmVzdWx0O1xuICAgIHRyeSB7XG4gICAgICAvLyBDb21wdXRlciBsb2dpYyB0byBjaG9vc2UgYSBtb3ZlXG4gICAgICAvLyBVcGRhdGUgVUkgYmFzZWQgb24gbW92ZVxuICAgICAgY29tcE1vdmVSZXN1bHQgPSBjb21wUGxheWVyLm1ha2VNb3ZlKGh1bWFuUGxheWVyR2FtZWJvYXJkKTtcblxuICAgICAgLy8gU2V0IHRoZSBwbGF5ZXIgc2VsZWN0b3Igb2YgdGhlIG9wcG9uZW50IGRlcGVuZGluZyBvbiB0aGUgcGxheWVyXG4gICAgICAvLyB3aG8gbWFkZSB0aGUgbW92ZVxuICAgICAgY29uc3QgcGxheWVyU2VsZWN0b3IgPVxuICAgICAgICBjb21wTW92ZVJlc3VsdC5wbGF5ZXIgPT09IFwiaHVtYW5cIiA/IFwiY29tcHV0ZXJcIiA6IFwiaHVtYW5cIjtcblxuICAgICAgaWYgKGNvbXBNb3ZlUmVzdWx0LmhpdCkge1xuICAgICAgICB1aU1hbmFnZXIudXBkYXRlU2hpcFNlY3Rpb24oXG4gICAgICAgICAgY29tcE1vdmVSZXN1bHQubW92ZSxcbiAgICAgICAgICBjb21wTW92ZVJlc3VsdC5zaGlwVHlwZSxcbiAgICAgICAgICBwbGF5ZXJTZWxlY3RvcixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZUxvZ0Vycm9yKGVycm9yKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBNb3ZlUmVzdWx0O1xuICB9XG5cbiAgY29uc3QgY2hlY2tTaGlwSXNTdW5rID0gKGdhbWVib2FyZCwgc2hpcFR5cGUpID0+XG4gICAgZ2FtZWJvYXJkLmlzU2hpcFN1bmsoc2hpcFR5cGUpO1xuXG4gIGNvbnN0IGNoZWNrV2luQ29uZGl0aW9uID0gKGdhbWVib2FyZCkgPT4gZ2FtZWJvYXJkLmNoZWNrQWxsU2hpcHNTdW5rKCk7XG5cbiAgLy8gRnVuY3Rpb24gZm9yIGhhbmRsaW5nIHRoZSBwbGF5aW5nIG9mIHRoZSBnYW1lXG4gIGNvbnN0IHBsYXlHYW1lID0gYXN5bmMgKCkgPT4ge1xuICAgIGxldCBnYW1lT3ZlciA9IGZhbHNlO1xuICAgIGxldCBsYXN0Q29tcE1vdmVSZXN1bHQ7XG4gICAgbGV0IGxhc3RIdW1hbk1vdmVSZXN1bHQ7XG4gICAgbGV0IHdpbm5lcjtcblxuICAgIHdoaWxlICghZ2FtZU92ZXIpIHtcbiAgICAgIC8vIFBsYXllciBtYWtlcyBhIG1vdmVcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wXG4gICAgICBsYXN0SHVtYW5Nb3ZlUmVzdWx0ID0gYXdhaXQgcHJvbXB0UGxheWVyTW92ZShsYXN0Q29tcE1vdmVSZXN1bHQpO1xuXG4gICAgICAvLyBDaGVjayBmb3IgaGl0XG4gICAgICBpZiAobGFzdEh1bWFuTW92ZVJlc3VsdC5oaXQpIHtcbiAgICAgICAgY29uc3QgeyBzaGlwVHlwZSB9ID0gbGFzdEh1bWFuTW92ZVJlc3VsdDtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIHNoaXAgc2lua1xuICAgICAgICBjb25zdCBpc1N1bmsgPSBjaGVja1NoaXBJc1N1bmsoY29tcFBsYXllckdhbWVib2FyZCwgc2hpcFR5cGUpO1xuICAgICAgICBpZiAoaXNTdW5rKSB7XG4gICAgICAgICAgY29uc29sZUxvZ1NoaXBTaW5rKGxhc3RIdW1hbk1vdmVSZXN1bHQpO1xuICAgICAgICAgIHVpTWFuYWdlci5yZW5kZXJTdW5rZW5TaGlwKGNvbXBQbGF5ZXIsIHNoaXBUeXBlKTtcblxuICAgICAgICAgIC8vIENoZWNrIGZvciB3aW4gY29uZGl0aW9uXG4gICAgICAgICAgZ2FtZU92ZXIgPSBjaGVja1dpbkNvbmRpdGlvbihjb21wUGxheWVyR2FtZWJvYXJkKTtcbiAgICAgICAgICBpZiAoZ2FtZU92ZXIpIHtcbiAgICAgICAgICAgIHdpbm5lciA9IFwiaHVtYW5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBDb21wdXRlciBtYWtlcyBhIG1vdmVcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wXG4gICAgICBsYXN0Q29tcE1vdmVSZXN1bHQgPSBhd2FpdCBjb21wdXRlck1vdmUoKTtcblxuICAgICAgLy8gQ2hlY2sgZm9yIGhpdFxuICAgICAgaWYgKGxhc3RDb21wTW92ZVJlc3VsdC5oaXQpIHtcbiAgICAgICAgY29uc3QgeyBzaGlwVHlwZSB9ID0gbGFzdENvbXBNb3ZlUmVzdWx0O1xuICAgICAgICAvLyBDaGVjayBmb3Igc2hpcCBzaW5rXG4gICAgICAgIGNvbnN0IGlzU3VuayA9IGNoZWNrU2hpcElzU3VuayhodW1hblBsYXllckdhbWVib2FyZCwgc2hpcFR5cGUpO1xuICAgICAgICBpZiAoaXNTdW5rKSB7XG4gICAgICAgICAgY29uc29sZUxvZ1NoaXBTaW5rKGxhc3RDb21wTW92ZVJlc3VsdCk7XG4gICAgICAgICAgdWlNYW5hZ2VyLnJlbmRlclN1bmtlblNoaXAoaHVtYW5QbGF5ZXIsIHNoaXBUeXBlKTtcblxuICAgICAgICAgIC8vIENoZWNrIGZvciB3aW4gY29uZGl0aW9uXG4gICAgICAgICAgZ2FtZU92ZXIgPSBjaGVja1dpbkNvbmRpdGlvbihodW1hblBsYXllckdhbWVib2FyZCk7XG4gICAgICAgICAgaWYgKGdhbWVPdmVyKSB7XG4gICAgICAgICAgICB3aW5uZXIgPSBcImNvbXB1dGVyXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBHYW1lIG92ZXIgbG9naWNcbiAgICBjb25jbHVkZUdhbWUod2lubmVyKTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGhhbmRsZVNldHVwLFxuICAgIHBsYXlHYW1lLFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQWN0aW9uQ29udHJvbGxlcjtcbiIsIi8qIGVzbGludC1kaXNhYmxlIG1heC1jbGFzc2VzLXBlci1maWxlICovXG5cbmNsYXNzIE92ZXJsYXBwaW5nU2hpcHNFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiU2hpcHMgYXJlIG92ZXJsYXBwaW5nLlwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJPdmVybGFwcGluZ1NoaXBzRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBTaGlwQWxsb2NhdGlvblJlYWNoZWRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3Ioc2hpcFR5cGUpIHtcbiAgICBzdXBlcihgU2hpcCBhbGxvY2F0aW9uIGxpbWl0IHJlYWNoZWQuIFNoaXAgdHlwZSA9ICR7c2hpcFR5cGV9LmApO1xuICAgIHRoaXMubmFtZSA9IFwiU2hpcEFsbG9jYXRpb25SZWFjaGVkRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIlNoaXAgdHlwZSBhbGxvY2F0aW9uIGxpbWl0IHJlYWNoZWQuXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIlNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRTaGlwTGVuZ3RoRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIkludmFsaWQgc2hpcCBsZW5ndGguXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRTaGlwTGVuZ3RoRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBJbnZhbGlkU2hpcFR5cGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBzaGlwIHR5cGUuXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRTaGlwVHlwZUVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgSW52YWxpZFBsYXllclR5cGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZSA9IFwiSW52YWxpZCBwbGF5ZXIgdHlwZS4gVmFsaWQgcGxheWVyIHR5cGVzOiAnaHVtYW4nICYgJ2NvbXB1dGVyJ1wiLFxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRTaGlwVHlwZUVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIkludmFsaWQgc2hpcCBwbGFjZW1lbnQuIEJvdW5kYXJ5IGVycm9yIVwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIFJlcGVhdEF0dGFja2VkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIkludmFsaWQgYXR0YWNrIGVudHJ5LiBQb3NpdGlvbiBhbHJlYWR5IGF0dGFja2VkIVwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJSZXBlYXRBdHRhY2tFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRNb3ZlRW50cnlFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBtb3ZlIGVudHJ5IVwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJJbnZhbGlkTW92ZUVudHJ5RXJyb3JcIjtcbiAgfVxufVxuXG5leHBvcnQge1xuICBPdmVybGFwcGluZ1NoaXBzRXJyb3IsXG4gIFNoaXBBbGxvY2F0aW9uUmVhY2hlZEVycm9yLFxuICBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IsXG4gIEludmFsaWRTaGlwTGVuZ3RoRXJyb3IsXG4gIEludmFsaWRTaGlwVHlwZUVycm9yLFxuICBJbnZhbGlkUGxheWVyVHlwZUVycm9yLFxuICBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvcixcbiAgUmVwZWF0QXR0YWNrZWRFcnJvcixcbiAgSW52YWxpZE1vdmVFbnRyeUVycm9yLFxufTtcbiIsImltcG9ydCBQbGF5ZXIgZnJvbSBcIi4vcGxheWVyXCI7XG5pbXBvcnQgR2FtZWJvYXJkIGZyb20gXCIuL2dhbWVib2FyZFwiO1xuaW1wb3J0IFNoaXAgZnJvbSBcIi4vc2hpcFwiO1xuaW1wb3J0IHsgSW52YWxpZFBsYXllclR5cGVFcnJvciB9IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBHYW1lID0gKCkgPT4ge1xuICAvLyBJbml0aWFsaXNlLCBjcmVhdGUgZ2FtZWJvYXJkcyBmb3IgYm90aCBwbGF5ZXJzIGFuZCBjcmVhdGUgcGxheWVycyBvZiB0eXBlcyBodW1hbiBhbmQgY29tcHV0ZXJcbiAgY29uc3QgaHVtYW5HYW1lYm9hcmQgPSBHYW1lYm9hcmQoU2hpcCk7XG4gIGNvbnN0IGNvbXB1dGVyR2FtZWJvYXJkID0gR2FtZWJvYXJkKFNoaXApO1xuICBjb25zdCBodW1hblBsYXllciA9IFBsYXllcihodW1hbkdhbWVib2FyZCwgXCJodW1hblwiKTtcbiAgY29uc3QgY29tcHV0ZXJQbGF5ZXIgPSBQbGF5ZXIoY29tcHV0ZXJHYW1lYm9hcmQsIFwiY29tcHV0ZXJcIik7XG4gIGxldCBjdXJyZW50UGxheWVyO1xuICBsZXQgZ2FtZU92ZXJTdGF0ZSA9IGZhbHNlO1xuXG4gIC8vIFN0b3JlIHBsYXllcnMgaW4gYSBwbGF5ZXIgb2JqZWN0XG4gIGNvbnN0IHBsYXllcnMgPSB7IGh1bWFuOiBodW1hblBsYXllciwgY29tcHV0ZXI6IGNvbXB1dGVyUGxheWVyIH07XG5cbiAgLy8gU2V0IHVwIHBoYXNlXG4gIGNvbnN0IHNldFVwID0gKCkgPT4ge1xuICAgIC8vIEF1dG9tYXRpYyBwbGFjZW1lbnQgZm9yIGNvbXB1dGVyXG4gICAgY29tcHV0ZXJQbGF5ZXIucGxhY2VTaGlwcygpO1xuXG4gICAgLy8gU2V0IHRoZSBjdXJyZW50IHBsYXllciB0byBodW1hbiBwbGF5ZXJcbiAgICBjdXJyZW50UGxheWVyID0gaHVtYW5QbGF5ZXI7XG4gIH07XG5cbiAgLy8gR2FtZSBlbmRpbmcgZnVuY3Rpb25cbiAgY29uc3QgZW5kR2FtZSA9ICgpID0+IHtcbiAgICBnYW1lT3ZlclN0YXRlID0gdHJ1ZTtcbiAgfTtcblxuICAvLyBUYWtlIHR1cm4gbWV0aG9kXG4gIGNvbnN0IHRha2VUdXJuID0gKG1vdmUpID0+IHtcbiAgICBsZXQgZmVlZGJhY2s7XG5cbiAgICAvLyBEZXRlcm1pbmUgdGhlIG9wcG9uZW50IGJhc2VkIG9uIHRoZSBjdXJyZW50IHBsYXllclxuICAgIGNvbnN0IG9wcG9uZW50ID1cbiAgICAgIGN1cnJlbnRQbGF5ZXIgPT09IGh1bWFuUGxheWVyID8gY29tcHV0ZXJQbGF5ZXIgOiBodW1hblBsYXllcjtcblxuICAgIC8vIENhbGwgdGhlIG1ha2VNb3ZlIG1ldGhvZCBvbiB0aGUgY3VycmVudCBwbGF5ZXIgd2l0aCB0aGUgb3Bwb25lbnQncyBnYW1lYm9hcmQgYW5kIHN0b3JlIGFzIG1vdmUgZmVlZGJhY2tcbiAgICBjb25zdCByZXN1bHQgPSBjdXJyZW50UGxheWVyLm1ha2VNb3ZlKG9wcG9uZW50LmdhbWVib2FyZCwgbW92ZSk7XG5cbiAgICAvLyBJZiByZXN1bHQgaXMgYSBoaXQsIGNoZWNrIHdoZXRoZXIgdGhlIHNoaXAgaXMgc3Vua1xuICAgIGlmIChyZXN1bHQuaGl0KSB7XG4gICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSBzaGlwIGlzIHN1bmsgYW5kIGFkZCByZXN1bHQgYXMgdmFsdWUgdG8gZmVlZGJhY2sgb2JqZWN0IHdpdGgga2V5IFwiaXNTaGlwU3Vua1wiXG4gICAgICBpZiAob3Bwb25lbnQuZ2FtZWJvYXJkLmlzU2hpcFN1bmsocmVzdWx0LnNoaXBUeXBlKSkge1xuICAgICAgICBmZWVkYmFjayA9IHtcbiAgICAgICAgICAuLi5yZXN1bHQsXG4gICAgICAgICAgaXNTaGlwU3VuazogdHJ1ZSxcbiAgICAgICAgICBnYW1lV29uOiBvcHBvbmVudC5nYW1lYm9hcmQuY2hlY2tBbGxTaGlwc1N1bmsoKSxcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZlZWRiYWNrID0geyAuLi5yZXN1bHQsIGlzU2hpcFN1bms6IGZhbHNlIH07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghcmVzdWx0LmhpdCkge1xuICAgICAgLy8gU2V0IGZlZWRiYWNrIHRvIGp1c3QgdGhlIHJlc3VsdFxuICAgICAgZmVlZGJhY2sgPSByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gSWYgZ2FtZSBpcyB3b24sIGVuZCBnYW1lXG4gICAgaWYgKGZlZWRiYWNrLmdhbWVXb24pIHtcbiAgICAgIGVuZEdhbWUoKTtcbiAgICB9XG5cbiAgICAvLyBTd2l0Y2ggdGhlIGN1cnJlbnQgcGxheWVyXG4gICAgY3VycmVudFBsYXllciA9IG9wcG9uZW50O1xuXG4gICAgLy8gUmV0dXJuIHRoZSBmZWVkYmFjayBmb3IgdGhlIG1vdmVcbiAgICByZXR1cm4gZmVlZGJhY2s7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBnZXQgY3VycmVudFBsYXllcigpIHtcbiAgICAgIHJldHVybiBjdXJyZW50UGxheWVyO1xuICAgIH0sXG4gICAgZ2V0IGdhbWVPdmVyU3RhdGUoKSB7XG4gICAgICByZXR1cm4gZ2FtZU92ZXJTdGF0ZTtcbiAgICB9LFxuICAgIHBsYXllcnMsXG4gICAgc2V0VXAsXG4gICAgdGFrZVR1cm4sXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBHYW1lO1xuIiwiaW1wb3J0IHtcbiAgU2hpcFR5cGVBbGxvY2F0aW9uUmVhY2hlZEVycm9yLFxuICBPdmVybGFwcGluZ1NoaXBzRXJyb3IsXG4gIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yLFxuICBSZXBlYXRBdHRhY2tlZEVycm9yLFxufSBmcm9tIFwiLi9lcnJvcnNcIjtcblxuY29uc3QgZ3JpZCA9IFtcbiAgW1wiQTFcIiwgXCJBMlwiLCBcIkEzXCIsIFwiQTRcIiwgXCJBNVwiLCBcIkE2XCIsIFwiQTdcIiwgXCJBOFwiLCBcIkE5XCIsIFwiQTEwXCJdLFxuICBbXCJCMVwiLCBcIkIyXCIsIFwiQjNcIiwgXCJCNFwiLCBcIkI1XCIsIFwiQjZcIiwgXCJCN1wiLCBcIkI4XCIsIFwiQjlcIiwgXCJCMTBcIl0sXG4gIFtcIkMxXCIsIFwiQzJcIiwgXCJDM1wiLCBcIkM0XCIsIFwiQzVcIiwgXCJDNlwiLCBcIkM3XCIsIFwiQzhcIiwgXCJDOVwiLCBcIkMxMFwiXSxcbiAgW1wiRDFcIiwgXCJEMlwiLCBcIkQzXCIsIFwiRDRcIiwgXCJENVwiLCBcIkQ2XCIsIFwiRDdcIiwgXCJEOFwiLCBcIkQ5XCIsIFwiRDEwXCJdLFxuICBbXCJFMVwiLCBcIkUyXCIsIFwiRTNcIiwgXCJFNFwiLCBcIkU1XCIsIFwiRTZcIiwgXCJFN1wiLCBcIkU4XCIsIFwiRTlcIiwgXCJFMTBcIl0sXG4gIFtcIkYxXCIsIFwiRjJcIiwgXCJGM1wiLCBcIkY0XCIsIFwiRjVcIiwgXCJGNlwiLCBcIkY3XCIsIFwiRjhcIiwgXCJGOVwiLCBcIkYxMFwiXSxcbiAgW1wiRzFcIiwgXCJHMlwiLCBcIkczXCIsIFwiRzRcIiwgXCJHNVwiLCBcIkc2XCIsIFwiRzdcIiwgXCJHOFwiLCBcIkc5XCIsIFwiRzEwXCJdLFxuICBbXCJIMVwiLCBcIkgyXCIsIFwiSDNcIiwgXCJINFwiLCBcIkg1XCIsIFwiSDZcIiwgXCJIN1wiLCBcIkg4XCIsIFwiSDlcIiwgXCJIMTBcIl0sXG4gIFtcIkkxXCIsIFwiSTJcIiwgXCJJM1wiLCBcIkk0XCIsIFwiSTVcIiwgXCJJNlwiLCBcIkk3XCIsIFwiSThcIiwgXCJJOVwiLCBcIkkxMFwiXSxcbiAgW1wiSjFcIiwgXCJKMlwiLCBcIkozXCIsIFwiSjRcIiwgXCJKNVwiLCBcIko2XCIsIFwiSjdcIiwgXCJKOFwiLCBcIko5XCIsIFwiSjEwXCJdLFxuXTtcblxuY29uc3QgaW5kZXhDYWxjcyA9IChzdGFydCkgPT4ge1xuICBjb25zdCBjb2xMZXR0ZXIgPSBzdGFydFswXS50b1VwcGVyQ2FzZSgpOyAvLyBUaGlzIGlzIHRoZSBjb2x1bW5cbiAgY29uc3Qgcm93TnVtYmVyID0gcGFyc2VJbnQoc3RhcnQuc2xpY2UoMSksIDEwKTsgLy8gVGhpcyBpcyB0aGUgcm93XG5cbiAgY29uc3QgY29sSW5kZXggPSBjb2xMZXR0ZXIuY2hhckNvZGVBdCgwKSAtIFwiQVwiLmNoYXJDb2RlQXQoMCk7IC8vIENvbHVtbiBpbmRleCBiYXNlZCBvbiBsZXR0ZXJcbiAgY29uc3Qgcm93SW5kZXggPSByb3dOdW1iZXIgLSAxOyAvLyBSb3cgaW5kZXggYmFzZWQgb24gbnVtYmVyXG5cbiAgcmV0dXJuIFtjb2xJbmRleCwgcm93SW5kZXhdOyAvLyBSZXR1cm4gW3JvdywgY29sdW1uXVxufTtcblxuY29uc3QgY2hlY2tUeXBlID0gKHNoaXAsIHNoaXBQb3NpdGlvbnMpID0+IHtcbiAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBzaGlwUG9zaXRpb25zIG9iamVjdFxuICBPYmplY3Qua2V5cyhzaGlwUG9zaXRpb25zKS5mb3JFYWNoKChleGlzdGluZ1NoaXBUeXBlKSA9PiB7XG4gICAgaWYgKGV4aXN0aW5nU2hpcFR5cGUgPT09IHNoaXApIHtcbiAgICAgIHRocm93IG5ldyBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3Ioc2hpcCk7XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IGNoZWNrQm91bmRhcmllcyA9IChzaGlwTGVuZ3RoLCBjb29yZHMsIGRpcmVjdGlvbikgPT4ge1xuICAvLyBTZXQgcm93IGFuZCBjb2wgbGltaXRzXG4gIGNvbnN0IHhMaW1pdCA9IGdyaWQubGVuZ3RoOyAvLyBUaGlzIGlzIHRoZSB0b3RhbCBudW1iZXIgb2YgY29sdW1ucyAoeClcbiAgY29uc3QgeUxpbWl0ID0gZ3JpZFswXS5sZW5ndGg7IC8vIFRoaXMgaXMgdGhlIHRvdGFsIG51bWJlciBvZiByb3dzICh5KVxuXG4gIGNvbnN0IHggPSBjb29yZHNbMF07XG4gIGNvbnN0IHkgPSBjb29yZHNbMV07XG5cbiAgLy8gQ2hlY2sgZm9yIHZhbGlkIHN0YXJ0IHBvc2l0aW9uIG9uIGJvYXJkXG4gIGlmICh4IDwgMCB8fCB4ID49IHhMaW1pdCB8fCB5IDwgMCB8fCB5ID49IHlMaW1pdCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENoZWNrIHJpZ2h0IGJvdW5kYXJ5IGZvciBob3Jpem9udGFsIHBsYWNlbWVudFxuICBpZiAoZGlyZWN0aW9uID09PSBcImhcIiAmJiB4ICsgc2hpcExlbmd0aCA+IHhMaW1pdCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBDaGVjayBib3R0b20gYm91bmRhcnkgZm9yIHZlcnRpY2FsIHBsYWNlbWVudFxuICBpZiAoZGlyZWN0aW9uID09PSBcInZcIiAmJiB5ICsgc2hpcExlbmd0aCA+IHlMaW1pdCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIElmIG5vbmUgb2YgdGhlIGludmFsaWQgY29uZGl0aW9ucyBhcmUgbWV0LCByZXR1cm4gdHJ1ZVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmNvbnN0IGNhbGN1bGF0ZVNoaXBQb3NpdGlvbnMgPSAoc2hpcExlbmd0aCwgY29vcmRzLCBkaXJlY3Rpb24pID0+IHtcbiAgY29uc3QgY29sSW5kZXggPSBjb29yZHNbMF07IC8vIFRoaXMgaXMgdGhlIGNvbHVtbiBpbmRleFxuICBjb25zdCByb3dJbmRleCA9IGNvb3Jkc1sxXTsgLy8gVGhpcyBpcyB0aGUgcm93IGluZGV4XG5cbiAgY29uc3QgcG9zaXRpb25zID0gW107XG5cbiAgaWYgKGRpcmVjdGlvbi50b0xvd2VyQ2FzZSgpID09PSBcImhcIikge1xuICAgIC8vIEhvcml6b250YWwgcGxhY2VtZW50OiBpbmNyZW1lbnQgdGhlIGNvbHVtbiBpbmRleFxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChncmlkW2NvbEluZGV4ICsgaV1bcm93SW5kZXhdKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gVmVydGljYWwgcGxhY2VtZW50OiBpbmNyZW1lbnQgdGhlIHJvdyBpbmRleFxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChncmlkW2NvbEluZGV4XVtyb3dJbmRleCArIGldKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcG9zaXRpb25zO1xufTtcblxuY29uc3QgY2hlY2tGb3JPdmVybGFwID0gKHBvc2l0aW9ucywgc2hpcFBvc2l0aW9ucykgPT4ge1xuICBPYmplY3QuZW50cmllcyhzaGlwUG9zaXRpb25zKS5mb3JFYWNoKChbc2hpcFR5cGUsIGV4aXN0aW5nU2hpcFBvc2l0aW9uc10pID0+IHtcbiAgICBpZiAoXG4gICAgICBwb3NpdGlvbnMuc29tZSgocG9zaXRpb24pID0+IGV4aXN0aW5nU2hpcFBvc2l0aW9ucy5pbmNsdWRlcyhwb3NpdGlvbikpXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgT3ZlcmxhcHBpbmdTaGlwc0Vycm9yKFxuICAgICAgICBgT3ZlcmxhcCBkZXRlY3RlZCB3aXRoIHNoaXAgdHlwZSAke3NoaXBUeXBlfWAsXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG5jb25zdCBjaGVja0ZvckhpdCA9IChwb3NpdGlvbiwgc2hpcFBvc2l0aW9ucykgPT4ge1xuICBjb25zdCBmb3VuZFNoaXAgPSBPYmplY3QuZW50cmllcyhzaGlwUG9zaXRpb25zKS5maW5kKFxuICAgIChbXywgZXhpc3RpbmdTaGlwUG9zaXRpb25zXSkgPT4gZXhpc3RpbmdTaGlwUG9zaXRpb25zLmluY2x1ZGVzKHBvc2l0aW9uKSxcbiAgKTtcblxuICByZXR1cm4gZm91bmRTaGlwID8geyBoaXQ6IHRydWUsIHNoaXBUeXBlOiBmb3VuZFNoaXBbMF0gfSA6IHsgaGl0OiBmYWxzZSB9O1xufTtcblxuY29uc3QgR2FtZWJvYXJkID0gKHNoaXBGYWN0b3J5KSA9PiB7XG4gIGNvbnN0IHNoaXBzID0ge307XG4gIGNvbnN0IHNoaXBQb3NpdGlvbnMgPSB7fTtcbiAgY29uc3QgaGl0UG9zaXRpb25zID0ge307XG4gIGNvbnN0IGF0dGFja0xvZyA9IFtbXSwgW11dO1xuXG4gIGNvbnN0IHBsYWNlU2hpcCA9ICh0eXBlLCBzdGFydCwgZGlyZWN0aW9uKSA9PiB7XG4gICAgY29uc3QgbmV3U2hpcCA9IHNoaXBGYWN0b3J5KHR5cGUpO1xuXG4gICAgLy8gQ2hlY2sgdGhlIHNoaXAgdHlwZSBhZ2FpbnN0IGV4aXN0aW5nIHR5cGVzXG4gICAgY2hlY2tUeXBlKHR5cGUsIHNoaXBQb3NpdGlvbnMpO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHN0YXJ0IHBvaW50IGNvb3JkaW5hdGVzIGJhc2VkIG9uIHN0YXJ0IHBvaW50IGdyaWQga2V5XG4gICAgY29uc3QgY29vcmRzID0gaW5kZXhDYWxjcyhzdGFydCk7XG5cbiAgICAvLyBDaGVjayBib3VuZGFyaWVzLCBpZiBvayBjb250aW51ZSB0byBuZXh0IHN0ZXBcbiAgICBpZiAoY2hlY2tCb3VuZGFyaWVzKG5ld1NoaXAuc2hpcExlbmd0aCwgY29vcmRzLCBkaXJlY3Rpb24pKSB7XG4gICAgICAvLyBDYWxjdWxhdGUgYW5kIHN0b3JlIHBvc2l0aW9ucyBmb3IgYSBuZXcgc2hpcFxuICAgICAgY29uc3QgcG9zaXRpb25zID0gY2FsY3VsYXRlU2hpcFBvc2l0aW9ucyhcbiAgICAgICAgbmV3U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgICBjb29yZHMsXG4gICAgICAgIGRpcmVjdGlvbixcbiAgICAgICk7XG5cbiAgICAgIC8vIENoZWNrIGZvciBvdmVybGFwIGJlZm9yZSBwbGFjaW5nIHRoZSBzaGlwXG4gICAgICBjaGVja0Zvck92ZXJsYXAocG9zaXRpb25zLCBzaGlwUG9zaXRpb25zKTtcblxuICAgICAgLy8gSWYgbm8gb3ZlcmxhcCwgcHJvY2VlZCB0byBwbGFjZSBzaGlwXG4gICAgICBzaGlwUG9zaXRpb25zW3R5cGVdID0gcG9zaXRpb25zO1xuICAgICAgLy8gQWRkIHNoaXAgdG8gc2hpcHMgb2JqZWN0XG4gICAgICBzaGlwc1t0eXBlXSA9IG5ld1NoaXA7XG5cbiAgICAgIC8vIEluaXRpYWxpc2UgaGl0UG9zaXRpb25zIGZvciB0aGlzIHNoaXAgdHlwZSBhcyBhbiBlbXB0eSBhcnJheVxuICAgICAgaGl0UG9zaXRpb25zW3R5cGVdID0gW107XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvcihcbiAgICAgICAgYEludmFsaWQgc2hpcCBwbGFjZW1lbnQuIEJvdW5kYXJ5IGVycm9yISBTaGlwIHR5cGU6ICR7dHlwZX1gLFxuICAgICAgKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmVnaXN0ZXIgYW4gYXR0YWNrIGFuZCB0ZXN0IGZvciB2YWxpZCBoaXRcbiAgY29uc3QgYXR0YWNrID0gKHBvc2l0aW9uKSA9PiB7XG4gICAgbGV0IHJlc3BvbnNlO1xuXG4gICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGF0dGFja1xuICAgIGlmIChhdHRhY2tMb2dbMF0uaW5jbHVkZXMocG9zaXRpb24pIHx8IGF0dGFja0xvZ1sxXS5pbmNsdWRlcyhwb3NpdGlvbikpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGBSZXBlYXQgYXR0YWNrOiAke3Bvc2l0aW9ufWApO1xuICAgICAgdGhyb3cgbmV3IFJlcGVhdEF0dGFja2VkRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgdmFsaWQgaGl0XG4gICAgY29uc3QgY2hlY2tSZXN1bHRzID0gY2hlY2tGb3JIaXQocG9zaXRpb24sIHNoaXBQb3NpdGlvbnMpO1xuICAgIGlmIChjaGVja1Jlc3VsdHMuaGl0KSB7XG4gICAgICAvLyBSZWdpc3RlciB2YWxpZCBoaXRcbiAgICAgIGhpdFBvc2l0aW9uc1tjaGVja1Jlc3VsdHMuc2hpcFR5cGVdLnB1c2gocG9zaXRpb24pO1xuICAgICAgc2hpcHNbY2hlY2tSZXN1bHRzLnNoaXBUeXBlXS5oaXQoKTtcblxuICAgICAgLy8gTG9nIHRoZSBhdHRhY2sgYXMgYSB2YWxpZCBoaXRcbiAgICAgIGF0dGFja0xvZ1swXS5wdXNoKHBvc2l0aW9uKTtcbiAgICAgIHJlc3BvbnNlID0geyAuLi5jaGVja1Jlc3VsdHMgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY29uc29sZS5sb2coYE1JU1MhOiAke3Bvc2l0aW9ufWApO1xuICAgICAgLy8gTG9nIHRoZSBhdHRhY2sgYXMgYSBtaXNzXG4gICAgICBhdHRhY2tMb2dbMV0ucHVzaChwb3NpdGlvbik7XG4gICAgICByZXNwb25zZSA9IHsgLi4uY2hlY2tSZXN1bHRzIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9O1xuXG4gIGNvbnN0IGlzU2hpcFN1bmsgPSAodHlwZSkgPT4gc2hpcHNbdHlwZV0uaXNTdW5rO1xuXG4gIGNvbnN0IGNoZWNrQWxsU2hpcHNTdW5rID0gKCkgPT5cbiAgICBPYmplY3QuZW50cmllcyhzaGlwcykuZXZlcnkoKFtzaGlwVHlwZSwgc2hpcF0pID0+IHNoaXAuaXNTdW5rKTtcblxuICAvLyBGdW5jdGlvbiBmb3IgcmVwb3J0aW5nIHRoZSBudW1iZXIgb2Ygc2hpcHMgbGVmdCBhZmxvYXRcbiAgY29uc3Qgc2hpcFJlcG9ydCA9ICgpID0+IHtcbiAgICBjb25zdCBmbG9hdGluZ1NoaXBzID0gT2JqZWN0LmVudHJpZXMoc2hpcHMpXG4gICAgICAuZmlsdGVyKChbc2hpcFR5cGUsIHNoaXBdKSA9PiAhc2hpcC5pc1N1bmspXG4gICAgICAubWFwKChbc2hpcFR5cGUsIF9dKSA9PiBzaGlwVHlwZSk7XG5cbiAgICByZXR1cm4gW2Zsb2F0aW5nU2hpcHMubGVuZ3RoLCBmbG9hdGluZ1NoaXBzXTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldCBncmlkKCkge1xuICAgICAgcmV0dXJuIGdyaWQ7XG4gICAgfSxcbiAgICBnZXQgc2hpcHMoKSB7XG4gICAgICByZXR1cm4gc2hpcHM7XG4gICAgfSxcbiAgICBnZXQgYXR0YWNrTG9nKCkge1xuICAgICAgcmV0dXJuIGF0dGFja0xvZztcbiAgICB9LFxuICAgIGdldFNoaXA6IChzaGlwVHlwZSkgPT4gc2hpcHNbc2hpcFR5cGVdLFxuICAgIGdldFNoaXBQb3NpdGlvbnM6IChzaGlwVHlwZSkgPT4gc2hpcFBvc2l0aW9uc1tzaGlwVHlwZV0sXG4gICAgZ2V0SGl0UG9zaXRpb25zOiAoc2hpcFR5cGUpID0+IGhpdFBvc2l0aW9uc1tzaGlwVHlwZV0sXG4gICAgcGxhY2VTaGlwLFxuICAgIGF0dGFjayxcbiAgICBpc1NoaXBTdW5rLFxuICAgIGNoZWNrQWxsU2hpcHNTdW5rLFxuICAgIHNoaXBSZXBvcnQsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBHYW1lYm9hcmQ7XG4iLCJpbXBvcnQgXCIuL3N0eWxlcy5jc3NcIjtcbmltcG9ydCBHYW1lIGZyb20gXCIuL2dhbWVcIjtcbmltcG9ydCBVaU1hbmFnZXIgZnJvbSBcIi4vdWlNYW5hZ2VyXCI7XG5pbXBvcnQgQWN0aW9uQ29udHJvbGxlciBmcm9tIFwiLi9hY3Rpb25Db250cm9sbGVyXCI7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluLWNvbnRhaW5lclwiKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG59KTtcblxuLy8gQ3JlYXRlIGEgbmV3IFVJIG1hbmFnZXJcbmNvbnN0IG5ld1VpTWFuYWdlciA9IFVpTWFuYWdlcigpO1xuXG4vLyBJbnN0YW50aWF0ZSBhIG5ldyBnYW1lXG5jb25zdCBuZXdHYW1lID0gR2FtZSgpO1xuXG4vLyBDcmVhdGUgYSBuZXcgYWN0aW9uIGNvbnRyb2xsZXJcbmNvbnN0IGFjdENvbnRyb2xsZXIgPSBBY3Rpb25Db250cm9sbGVyKG5ld1VpTWFuYWdlciwgbmV3R2FtZSk7XG5cbi8vIFdhaXQgZm9yIHRoZSBnYW1lIHRvIGJlIHNldHVwIHdpdGggc2hpcCBwbGFjZW1lbnRzIGV0Yy5cbmF3YWl0IGFjdENvbnRyb2xsZXIuaGFuZGxlU2V0dXAoKTtcblxuLy8gT25jZSByZWFkeSwgY2FsbCB0aGUgcGxheUdhbWUgbWV0aG9kXG5hd2FpdCBhY3RDb250cm9sbGVyLnBsYXlHYW1lKCk7XG5cbi8vIENvbnNvbGUgbG9nIHRoZSBwbGF5ZXJzXG5jb25zb2xlLmxvZyhcbiAgYFBsYXllcnM6IEZpcnN0IHBsYXllciBvZiB0eXBlICR7bmV3R2FtZS5wbGF5ZXJzLmh1bWFuLnR5cGV9LCBzZWNvbmQgcGxheWVyIG9mIHR5cGUgJHtuZXdHYW1lLnBsYXllcnMuY29tcHV0ZXIudHlwZX0hYCxcbik7XG4iLCJpbXBvcnQge1xuICBJbnZhbGlkUGxheWVyVHlwZUVycm9yLFxuICBJbnZhbGlkTW92ZUVudHJ5RXJyb3IsXG4gIFJlcGVhdEF0dGFja2VkRXJyb3IsXG4gIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yLFxuICBPdmVybGFwcGluZ1NoaXBzRXJyb3IsXG59IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBjaGVja01vdmUgPSAobW92ZSwgZ2JHcmlkKSA9PiB7XG4gIGxldCB2YWxpZCA9IGZhbHNlO1xuXG4gIGdiR3JpZC5mb3JFYWNoKChlbCkgPT4ge1xuICAgIGlmIChlbC5maW5kKChwKSA9PiBwID09PSBtb3ZlKSkge1xuICAgICAgdmFsaWQgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHZhbGlkO1xufTtcblxuY29uc3QgcmFuZE1vdmUgPSAoZ3JpZCwgbW92ZUxvZykgPT4ge1xuICAvLyBGbGF0dGVuIHRoZSBncmlkIGludG8gYSBzaW5nbGUgYXJyYXkgb2YgbW92ZXNcbiAgY29uc3QgYWxsTW92ZXMgPSBncmlkLmZsYXRNYXAoKHJvdykgPT4gcm93KTtcblxuICAvLyBGaWx0ZXIgb3V0IHRoZSBtb3ZlcyB0aGF0IGFyZSBhbHJlYWR5IGluIHRoZSBtb3ZlTG9nXG4gIGNvbnN0IHBvc3NpYmxlTW92ZXMgPSBhbGxNb3Zlcy5maWx0ZXIoKG1vdmUpID0+ICFtb3ZlTG9nLmluY2x1ZGVzKG1vdmUpKTtcblxuICAvLyBTZWxlY3QgYSByYW5kb20gbW92ZSBmcm9tIHRoZSBwb3NzaWJsZSBtb3Zlc1xuICBjb25zdCByYW5kb21Nb3ZlID1cbiAgICBwb3NzaWJsZU1vdmVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlTW92ZXMubGVuZ3RoKV07XG5cbiAgcmV0dXJuIHJhbmRvbU1vdmU7XG59O1xuXG5jb25zdCBnZW5lcmF0ZVJhbmRvbVN0YXJ0ID0gKHNpemUsIGRpcmVjdGlvbiwgZ3JpZCkgPT4ge1xuICBjb25zdCB2YWxpZFN0YXJ0cyA9IFtdO1xuXG4gIGlmIChkaXJlY3Rpb24gPT09IFwiaFwiKSB7XG4gICAgLy8gRm9yIGhvcml6b250YWwgb3JpZW50YXRpb24sIGxpbWl0IHRoZSBjb2x1bW5zXG4gICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgZ3JpZC5sZW5ndGggLSBzaXplICsgMTsgY29sKyspIHtcbiAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IGdyaWRbY29sXS5sZW5ndGg7IHJvdysrKSB7XG4gICAgICAgIHZhbGlkU3RhcnRzLnB1c2goZ3JpZFtjb2xdW3Jvd10pO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBGb3IgdmVydGljYWwgb3JpZW50YXRpb24sIGxpbWl0IHRoZSByb3dzXG4gICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgZ3JpZFswXS5sZW5ndGggLSBzaXplICsgMTsgcm93KyspIHtcbiAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IGdyaWQubGVuZ3RoOyBjb2wrKykge1xuICAgICAgICB2YWxpZFN0YXJ0cy5wdXNoKGdyaWRbY29sXVtyb3ddKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBSYW5kb21seSBzZWxlY3QgYSBzdGFydGluZyBwb3NpdGlvblxuICBjb25zdCByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHZhbGlkU3RhcnRzLmxlbmd0aCk7XG4gIHJldHVybiB2YWxpZFN0YXJ0c1tyYW5kb21JbmRleF07XG59O1xuXG5jb25zdCBhdXRvUGxhY2VtZW50ID0gKGdhbWVib2FyZCkgPT4ge1xuICBjb25zdCBzaGlwVHlwZXMgPSBbXG4gICAgeyB0eXBlOiBcImNhcnJpZXJcIiwgc2l6ZTogNSB9LFxuICAgIHsgdHlwZTogXCJiYXR0bGVzaGlwXCIsIHNpemU6IDQgfSxcbiAgICB7IHR5cGU6IFwiY3J1aXNlclwiLCBzaXplOiAzIH0sXG4gICAgeyB0eXBlOiBcInN1Ym1hcmluZVwiLCBzaXplOiAzIH0sXG4gICAgeyB0eXBlOiBcImRlc3Ryb3llclwiLCBzaXplOiAyIH0sXG4gIF07XG5cbiAgc2hpcFR5cGVzLmZvckVhY2goKHNoaXApID0+IHtcbiAgICBsZXQgcGxhY2VkID0gZmFsc2U7XG4gICAgd2hpbGUgKCFwbGFjZWQpIHtcbiAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IE1hdGgucmFuZG9tKCkgPCAwLjUgPyBcImhcIiA6IFwidlwiO1xuICAgICAgY29uc3Qgc3RhcnQgPSBnZW5lcmF0ZVJhbmRvbVN0YXJ0KHNoaXAuc2l6ZSwgZGlyZWN0aW9uLCBnYW1lYm9hcmQuZ3JpZCk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGdhbWVib2FyZC5wbGFjZVNoaXAoc2hpcC50eXBlLCBzdGFydCwgZGlyZWN0aW9uKTtcbiAgICAgICAgcGxhY2VkID0gdHJ1ZTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAhKGVycm9yIGluc3RhbmNlb2YgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IpICYmXG4gICAgICAgICAgIShlcnJvciBpbnN0YW5jZW9mIE92ZXJsYXBwaW5nU2hpcHNFcnJvcilcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7IC8vIFJldGhyb3cgbm9uLXBsYWNlbWVudCBlcnJvcnNcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiBwbGFjZW1lbnQgZmFpbHMsIGNhdGNoIHRoZSBlcnJvciBhbmQgdHJ5IGFnYWluXG4gICAgICB9XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IFBsYXllciA9IChnYW1lYm9hcmQsIHR5cGUpID0+IHtcbiAgY29uc3QgbW92ZUxvZyA9IFtdO1xuXG4gIGNvbnN0IHBsYWNlU2hpcHMgPSAoc2hpcFR5cGUsIHN0YXJ0LCBkaXJlY3Rpb24pID0+IHtcbiAgICBpZiAodHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICBnYW1lYm9hcmQucGxhY2VTaGlwKHNoaXBUeXBlLCBzdGFydCwgZGlyZWN0aW9uKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgYXV0b1BsYWNlbWVudChnYW1lYm9hcmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBsYXllclR5cGVFcnJvcihcbiAgICAgICAgYEludmFsaWQgcGxheWVyIHR5cGUuIFZhbGlkIHBsYXllciB0eXBlczogXCJodW1hblwiICYgXCJjb21wdXRlclwiLiBFbnRlcmVkOiAke3R5cGV9LmAsXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBtYWtlTW92ZSA9IChvcHBHYW1lYm9hcmQsIGlucHV0KSA9PiB7XG4gICAgbGV0IG1vdmU7XG5cbiAgICAvLyBDaGVjayBmb3IgdGhlIHR5cGUgb2YgcGxheWVyXG4gICAgaWYgKHR5cGUgPT09IFwiaHVtYW5cIikge1xuICAgICAgLy8gRm9ybWF0IHRoZSBpbnB1dFxuICAgICAgbW92ZSA9IGAke2lucHV0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpfSR7aW5wdXQuc3Vic3RyaW5nKDEpfWA7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImNvbXB1dGVyXCIpIHtcbiAgICAgIG1vdmUgPSByYW5kTW92ZShvcHBHYW1lYm9hcmQuZ3JpZCwgbW92ZUxvZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGxheWVyVHlwZUVycm9yKFxuICAgICAgICBgSW52YWxpZCBwbGF5ZXIgdHlwZS4gVmFsaWQgcGxheWVyIHR5cGVzOiBcImh1bWFuXCIgJiBcImNvbXB1dGVyXCIuIEVudGVyZWQ6ICR7dHlwZX0uYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhlIGlucHV0IGFnYWluc3QgdGhlIHBvc3NpYmxlIG1vdmVzIG9uIHRoZSBnYW1lYm9hcmQncyBncmlkXG4gICAgaWYgKCFjaGVja01vdmUobW92ZSwgb3BwR2FtZWJvYXJkLmdyaWQpKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZE1vdmVFbnRyeUVycm9yKGBJbnZhbGlkIG1vdmUgZW50cnkhIE1vdmU6ICR7bW92ZX0uYCk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIG1vdmUgZXhpc3RzIGluIHRoZSBtb3ZlTG9nIGFycmF5LCB0aHJvdyBhbiBlcnJvclxuICAgIGlmIChtb3ZlTG9nLmZpbmQoKGVsKSA9PiBlbCA9PT0gbW92ZSkpIHtcbiAgICAgIHRocm93IG5ldyBSZXBlYXRBdHRhY2tlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gRWxzZSwgY2FsbCBhdHRhY2sgbWV0aG9kIG9uIGdhbWVib2FyZCBhbmQgbG9nIG1vdmUgaW4gbW92ZUxvZ1xuICAgIGNvbnN0IHJlc3BvbnNlID0gb3BwR2FtZWJvYXJkLmF0dGFjayhtb3ZlKTtcbiAgICBtb3ZlTG9nLnB1c2gobW92ZSk7XG4gICAgLy8gUmV0dXJuIHRoZSByZXNwb25zZSBvZiB0aGUgYXR0YWNrIChvYmplY3Q6IHsgaGl0OiBmYWxzZSB9IGZvciBtaXNzOyB7IGhpdDogdHJ1ZSwgc2hpcFR5cGU6IHN0cmluZyB9IGZvciBoaXQpLlxuICAgIHJldHVybiB7IHBsYXllcjogdHlwZSwgbW92ZSwgLi4ucmVzcG9uc2UgfTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldCB0eXBlKCkge1xuICAgICAgcmV0dXJuIHR5cGU7XG4gICAgfSxcbiAgICBnZXQgZ2FtZWJvYXJkKCkge1xuICAgICAgcmV0dXJuIGdhbWVib2FyZDtcbiAgICB9LFxuICAgIGdldCBtb3ZlTG9nKCkge1xuICAgICAgcmV0dXJuIG1vdmVMb2c7XG4gICAgfSxcbiAgICBtYWtlTW92ZSxcbiAgICBwbGFjZVNoaXBzLFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgUGxheWVyO1xuIiwiaW1wb3J0IHsgSW52YWxpZFNoaXBUeXBlRXJyb3IgfSBmcm9tIFwiLi9lcnJvcnNcIjtcblxuY29uc3QgU2hpcCA9ICh0eXBlKSA9PiB7XG4gIGNvbnN0IHNldExlbmd0aCA9ICgpID0+IHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgXCJjYXJyaWVyXCI6XG4gICAgICAgIHJldHVybiA1O1xuICAgICAgY2FzZSBcImJhdHRsZXNoaXBcIjpcbiAgICAgICAgcmV0dXJuIDQ7XG4gICAgICBjYXNlIFwiY3J1aXNlclwiOlxuICAgICAgY2FzZSBcInN1Ym1hcmluZVwiOlxuICAgICAgICByZXR1cm4gMztcbiAgICAgIGNhc2UgXCJkZXN0cm95ZXJcIjpcbiAgICAgICAgcmV0dXJuIDI7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFNoaXBUeXBlRXJyb3IoKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgc2hpcExlbmd0aCA9IHNldExlbmd0aCgpO1xuXG4gIGxldCBoaXRzID0gMDtcblxuICBjb25zdCBoaXQgPSAoKSA9PiB7XG4gICAgaWYgKGhpdHMgPCBzaGlwTGVuZ3RoKSB7XG4gICAgICBoaXRzICs9IDE7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB7XG4gICAgZ2V0IHR5cGUoKSB7XG4gICAgICByZXR1cm4gdHlwZTtcbiAgICB9LFxuICAgIGdldCBzaGlwTGVuZ3RoKCkge1xuICAgICAgcmV0dXJuIHNoaXBMZW5ndGg7XG4gICAgfSxcbiAgICBnZXQgaGl0cygpIHtcbiAgICAgIHJldHVybiBoaXRzO1xuICAgIH0sXG4gICAgZ2V0IGlzU3VuaygpIHtcbiAgICAgIHJldHVybiBoaXRzID09PSBzaGlwTGVuZ3RoO1xuICAgIH0sXG4gICAgaGl0LFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU2hpcDtcbiIsImNvbnN0IHR3ID0gKHN0cmluZ3MsIC4uLnZhbHVlcykgPT4gU3RyaW5nLnJhdyh7IHJhdzogc3RyaW5ncyB9LCAuLi52YWx1ZXMpO1xuXG5jb25zdCBpbnN0cnVjdGlvbkNsciA9IFwidGV4dC1saW1lLTcwMFwiO1xuY29uc3QgZ3VpZGVDbHIgPSBcInRleHQtZ3JheS03MDBcIjtcbmNvbnN0IGVycm9yQ2xyID0gXCJ0ZXh0LXJlZC04MDBcIjtcbmNvbnN0IGRlZmF1bHRDbHIgPSBcInRleHQtZ3JheS03MDBcIjtcblxuY29uc3QgY2VsbENsciA9IFwiYmctZ3JheS0yMDBcIjtcbmNvbnN0IGlucHV0Q2xyID0gXCJiZy1ncmF5LTYwMFwiO1xuY29uc3QgaW5wdXRUZXh0Q2xyID0gXCJ0ZXh0LWdyYXktMjAwXCI7XG5jb25zdCBvdXB1dENsciA9IGNlbGxDbHI7XG5jb25zdCBidXR0b25DbHIgPSBcImJnLWdyYXktODAwXCI7XG5jb25zdCBidXR0b25UZXh0Q2xyID0gXCJ0ZXh0LWdyYXktMjAwXCI7XG5cbmNvbnN0IHNoaXBTZWN0Q2xyID0gXCJiZy1zbGF0ZS04MDBcIjtcbmNvbnN0IHNoaXBIaXRDbHIgPSBcImJnLXJlZC04MDBcIjtcbmNvbnN0IHNoaXBTdW5rQ2xyID0gXCJiZy1ncmF5LTQwMFwiO1xuY29uc3QgcHJpbWFyeUhvdmVyQ2xyID0gXCJob3ZlcjpiZy1vcmFuZ2UtNTAwXCI7XG5cbi8vIEZ1bmN0aW9uIGZvciBidWlsZGluZyBhIHNoaXAsIGRlcGVuZGluZyBvbiB0aGUgc2hpcCB0eXBlXG5jb25zdCBidWlsZFNoaXAgPSAob2JqLCBkb21TZWwsIHNoaXBQb3NpdGlvbnMpID0+IHtcbiAgLy8gRXh0cmFjdCB0aGUgc2hpcCdzIHR5cGUgYW5kIGxlbmd0aCBmcm9tIHRoZSBvYmplY3RcbiAgY29uc3QgeyB0eXBlLCBzaGlwTGVuZ3RoOiBsZW5ndGggfSA9IG9iajtcbiAgLy8gQ3JlYXRlIGFuZCBhcnJheSBmb3IgdGhlIHNoaXAncyBzZWN0aW9uc1xuICBjb25zdCBzaGlwU2VjdHMgPSBbXTtcblxuICAvLyBVc2UgdGhlIGxlbmd0aCBvZiB0aGUgc2hpcCB0byBjcmVhdGUgdGhlIGNvcnJlY3QgbnVtYmVyIG9mIHNlY3Rpb25zXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAvLyBHZXQgYSBwb3NpdGlvbiBmcm9tIHRoZSBhcnJheVxuICAgIGNvbnN0IHBvc2l0aW9uID0gc2hpcFBvc2l0aW9uc1tpXTtcbiAgICAvLyBDcmVhdGUgYW4gZWxlbWVudCBmb3IgdGhlIHNlY3Rpb25cbiAgICBjb25zdCBzZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBzZWN0LmNsYXNzTmFtZSA9IHR3YHctNCBoLTQgcm91bmRlZC1mdWxsYDsgLy8gU2V0IHRoZSBkZWZhdWx0IHN0eWxpbmcgZm9yIHRoZSBzZWN0aW9uIGVsZW1lbnRcbiAgICBzZWN0LmNsYXNzTGlzdC5hZGQoc2hpcFNlY3RDbHIpO1xuICAgIC8vIFNldCBhIHVuaXF1ZSBpZCBmb3IgdGhlIHNoaXAgc2VjdGlvblxuICAgIHNlY3Quc2V0QXR0cmlidXRlKFwiaWRcIiwgYERPTS0ke2RvbVNlbH0tc2hpcFR5cGUtJHt0eXBlfS1wb3MtJHtwb3NpdGlvbn1gKTtcbiAgICAvLyBTZXQgYSBkYXRhc2V0IHByb3BlcnR5IG9mIFwicG9zaXRpb25cIiBmb3IgdGhlIHNlY3Rpb25cbiAgICBzZWN0LmRhdGFzZXQucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICBzaGlwU2VjdHMucHVzaChzZWN0KTsgLy8gQWRkIHRoZSBzZWN0aW9uIHRvIHRoZSBhcnJheVxuICB9XG5cbiAgLy8gUmV0dXJuIHRoZSBhcnJheSBvZiBzaGlwIHNlY3Rpb25zXG4gIHJldHVybiBzaGlwU2VjdHM7XG59O1xuXG5jb25zdCBVaU1hbmFnZXIgPSAoKSA9PiB7XG4gIGNvbnN0IGNyZWF0ZUdhbWVib2FyZCA9IChjb250YWluZXJJRCkgPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcklEKTtcblxuICAgIC8vIFNldCBwbGF5ZXIgdHlwZSBkZXBlbmRpbmcgb24gdGhlIGNvbnRhaW5lcklEXG4gICAgY29uc3QgeyBwbGF5ZXIgfSA9IGNvbnRhaW5lci5kYXRhc2V0O1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBncmlkIGNvbnRhaW5lclxuICAgIGNvbnN0IGdyaWREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGdyaWREaXYuY2xhc3NOYW1lID0gdHdgZ2FtZWJvYXJkLWFyZWEgZ3JpZCBncmlkLWNvbHMtMTEgYXV0by1yb3dzLW1pbiBnYXAtMSBwLTZgO1xuICAgIGdyaWREaXYuZGF0YXNldC5wbGF5ZXIgPSBwbGF5ZXI7XG5cbiAgICAvLyBBZGQgdGhlIHRvcC1sZWZ0IGNvcm5lciBlbXB0eSBjZWxsXG4gICAgZ3JpZERpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpKTtcblxuICAgIC8vIEFkZCBjb2x1bW4gaGVhZGVycyBBLUpcbiAgICBjb25zdCBjb2x1bW5zID0gXCJBQkNERUZHSElKXCI7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2x1bW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgaGVhZGVyLmNsYXNzTmFtZSA9IFwidGV4dC1jZW50ZXJcIjtcbiAgICAgIGhlYWRlci50ZXh0Q29udGVudCA9IGNvbHVtbnNbaV07XG4gICAgICBncmlkRGl2LmFwcGVuZENoaWxkKGhlYWRlcik7XG4gICAgfVxuXG4gICAgLy8gQWRkIHJvdyBsYWJlbHMgYW5kIGNlbGxzXG4gICAgZm9yIChsZXQgcm93ID0gMTsgcm93IDw9IDEwOyByb3crKykge1xuICAgICAgLy8gUm93IGxhYmVsXG4gICAgICBjb25zdCByb3dMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICByb3dMYWJlbC5jbGFzc05hbWUgPSBcInRleHQtY2VudGVyXCI7XG4gICAgICByb3dMYWJlbC50ZXh0Q29udGVudCA9IHJvdztcbiAgICAgIGdyaWREaXYuYXBwZW5kQ2hpbGQocm93TGFiZWwpO1xuXG4gICAgICAvLyBDZWxscyBmb3IgZWFjaCByb3dcbiAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IDEwOyBjb2wrKykge1xuICAgICAgICBjb25zdCBjZWxsSWQgPSBgJHtjb2x1bW5zW2NvbF19JHtyb3d9YDsgLy8gU2V0IHRoZSBjZWxsSWRcbiAgICAgICAgY29uc3QgY2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNlbGwuaWQgPSBgJHtwbGF5ZXJ9LSR7Y2VsbElkfWA7IC8vIFNldCB0aGUgZWxlbWVudCBpZFxuICAgICAgICBjZWxsLmNsYXNzTmFtZSA9IHR3YHctNiBoLTYgZmxleCBqdXN0aWZ5LWNlbnRlciBpdGVtcy1jZW50ZXIgY3Vyc29yLXBvaW50ZXJgOyAvLyBBZGQgbW9yZSBjbGFzc2VzIGFzIG5lZWRlZCBmb3Igc3R5bGluZ1xuICAgICAgICBjZWxsLmNsYXNzTGlzdC5hZGQocHJpbWFyeUhvdmVyQ2xyKTtcbiAgICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKGNlbGxDbHIpO1xuICAgICAgICBjZWxsLmNsYXNzTGlzdC5hZGQoXCJnYW1lYm9hcmQtY2VsbFwiKTsgLy8gQWRkIGEgY2xhc3MgbmFtZSB0byBlYWNoIGNlbGwgdG8gYWN0IGFzIGEgc2VsZWN0b3JcbiAgICAgICAgY2VsbC5kYXRhc2V0LnBvc2l0aW9uID0gY2VsbElkOyAvLyBBc3NpZ24gcG9zaXRpb24gZGF0YSBhdHRyaWJ1dGUgZm9yIGlkZW50aWZpY2F0aW9uXG4gICAgICAgIGNlbGwuZGF0YXNldC5wbGF5ZXIgPSBwbGF5ZXI7IC8vIEFzc2lnbiBwbGF5ZXIgZGF0YSBhdHRyaWJ1dGUgZm9yIGlkZW50aWZpY2F0aW9uXG5cbiAgICAgICAgZ3JpZERpdi5hcHBlbmRDaGlsZChjZWxsKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBcHBlbmQgdGhlIGdyaWQgdG8gdGhlIGNvbnRhaW5lclxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChncmlkRGl2KTtcbiAgfTtcblxuICBjb25zdCBpbml0Q29uc29sZVVJID0gKCkgPT4ge1xuICAgIGNvbnN0IGNvbnNvbGVDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGVcIik7IC8vIEdldCB0aGUgY29uc29sZSBjb250YWluZXIgZnJvbSB0aGUgRE9NXG4gICAgY29uc29sZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFxuICAgICAgXCJmbGV4XCIsXG4gICAgICBcImZsZXgtY29sXCIsXG4gICAgICBcImp1c3RpZnktYmV0d2VlblwiLFxuICAgICAgXCJ0ZXh0LXNtXCIsXG4gICAgKTsgLy8gU2V0IGZsZXhib3ggcnVsZXMgZm9yIGNvbnRhaW5lclxuXG4gICAgLy8gQ3JlYXRlIGEgY29udGFpbmVyIGZvciB0aGUgaW5wdXQgYW5kIGJ1dHRvbiBlbGVtZW50c1xuICAgIGNvbnN0IGlucHV0RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBpbnB1dERpdi5jbGFzc05hbWUgPSBcImZsZXggZmxleC1yb3cgdy1mdWxsIGgtMS81IGp1c3RpZnktYmV0d2VlblwiOyAvLyBTZXQgdGhlIGZsZXhib3ggcnVsZXMgZm9yIHRoZSBjb250YWluZXJcblxuICAgIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpOyAvLyBDcmVhdGUgYW4gaW5wdXQgZWxlbWVudCBmb3IgdGhlIGNvbnNvbGVcbiAgICBpbnB1dC50eXBlID0gXCJ0ZXh0XCI7IC8vIFNldCB0aGUgaW5wdXQgdHlwZSBvZiB0aGlzIGVsZW1lbnQgdG8gdGV4dFxuICAgIGlucHV0LnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY29uc29sZS1pbnB1dFwiKTsgLy8gU2V0IHRoZSBpZCBmb3IgdGhpcyBlbGVtZW50IHRvIFwiY29uc29sZS1pbnB1dFwiXG4gICAgaW5wdXQuY2xhc3NOYW1lID0gdHdgcGwtMyBmbGV4LTEgcm91bmRlZC1ibC1tZCBib3JkZXItdHJhbnNwYXJlbnQgb3V0bGluZS1ub25lIGZvY3VzOm91dGxpbmUtc29saWQgZm9jdXM6Ym9yZGVyLTIgZm9jdXM6Ym9yZGVyLWdyYXktMjAwIGZvY3VzOnJpbmctMGA7IC8vIEFkZCBUYWlsd2luZENTUyBjbGFzc2VzXG4gICAgaW5wdXQuY2xhc3NMaXN0LmFkZChpbnB1dENscik7XG4gICAgaW5wdXQuY2xhc3NMaXN0LmFkZChpbnB1dFRleHRDbHIpO1xuICAgIGNvbnN0IHN1Ym1pdEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7IC8vIENyZWF0ZSBhIGJ1dHRvbiBlbGVtZW50IGZvciB0aGUgY29uc29sZSBzdWJtaXRcbiAgICBzdWJtaXRCdXR0b24udGV4dENvbnRlbnQgPSBcIlN1Ym1pdFwiOyAvLyBBZGQgdGhlIHRleHQgXCJTdWJtaXRcIiB0byB0aGUgYnV0dG9uXG4gICAgc3VibWl0QnV0dG9uLnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY29uc29sZS1zdWJtaXRcIik7IC8vIFNldCB0aGUgaWQgZm9yIHRoZSBidXR0b25cbiAgICBzdWJtaXRCdXR0b24uY2xhc3NOYW1lID0gdHdgbmFudW0tZ290aGljLWNvZGluZy1ib2xkIHRleHQtbGcgdHJhY2tpbmctd2lkZXN0IHB4LTMgcHktMSB0ZXh0LWNlbnRlciB0ZXh0LXNtIHJvdW5kZWQtYnItbWQgYm9yZGVyLXNvbGlkIGJvcmRlci0yIGJvcmRlci1ncmF5LTIwMCBob3ZlcjpiZy1ncmF5LTIwMCBob3Zlcjp0ZXh0LWdyYXktODAwIGhvdmVyOmJvcmRlci1ncmF5LTgwMGA7IC8vIEFkZCBUYWlsd2luZENTUyBjbGFzc2VzXG4gICAgc3VibWl0QnV0dG9uLmNsYXNzTGlzdC5hZGQoYnV0dG9uQ2xyKTtcbiAgICBzdWJtaXRCdXR0b24uY2xhc3NMaXN0LmFkZChidXR0b25UZXh0Q2xyKTtcbiAgICBjb25zdCBvdXRwdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpOyAvLyBDcmVhdGUgYW4gZGl2IGVsZW1lbnQgZm9yIHRoZSBvdXRwdXQgb2YgdGhlIGNvbnNvbGVcbiAgICBvdXRwdXQuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJjb25zb2xlLW91dHB1dFwiKTsgLy8gU2V0IHRoZSBpZCBmb3IgdGhlIG91dHB1dCBlbGVtZW50XG4gICAgb3V0cHV0LmNsYXNzTmFtZSA9IHR3YGZsZXgtMSBwLTIgaC00LzUgb3ZlcmZsb3ctYXV0byByb3VuZGVkLXQtbWQgYmctZ3JheS0yMDAgYmctb3BhY2l0eS0zMCBiYWNrZHJvcC1ibHVyLXNtYDsgLy8gQWRkIFRhaWx3aW5kQ1NTIGNsYXNzZXMgKGJnLWdyYWRpZW50LXRvLXRyLCBmcm9tLWdyYXktNDAwLCB0by1ncmF5LTEwMClcbiAgICAvLyBvdXRwdXQuY2xhc3NMaXN0LmFkZChvdXB1dENscik7XG5cbiAgICAvLyBBZGQgdGhlIGlucHV0IGVsZW1lbnRzIHRvIHRoZSBpbnB1dCBjb250YWluZXJcbiAgICBpbnB1dERpdi5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgaW5wdXREaXYuYXBwZW5kQ2hpbGQoc3VibWl0QnV0dG9uKTtcblxuICAgIC8vIEFwcGVuZCBlbGVtZW50cyB0byB0aGUgY29uc29sZSBjb250YWluZXJcbiAgICBjb25zb2xlQ29udGFpbmVyLmFwcGVuZENoaWxkKG91dHB1dCk7XG4gICAgY29uc29sZUNvbnRhaW5lci5hcHBlbmRDaGlsZChpbnB1dERpdik7XG4gIH07XG5cbiAgY29uc3QgZGlzcGxheVByb21wdCA9IChwcm9tcHRPYmpzKSA9PiB7XG4gICAgLy8gR2V0IHRoZSBwcm9tcHQgZGlzcGxheVxuICAgIGNvbnN0IGRpc3BsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByb21wdC1kaXNwbGF5XCIpO1xuXG4gICAgLy8gQ2xlYXIgdGhlIGRpc3BsYXkgb2YgYWxsIGNoaWxkcmVuXG4gICAgd2hpbGUgKGRpc3BsYXkuZmlyc3RDaGlsZCkge1xuICAgICAgZGlzcGxheS5yZW1vdmVDaGlsZChkaXNwbGF5LmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIC8vIEl0ZXJhdGUgb3ZlciBlYWNoIHByb21wdCBpbiB0aGUgcHJvbXB0cyBvYmplY3RcbiAgICBPYmplY3QuZW50cmllcyhwcm9tcHRPYmpzKS5mb3JFYWNoKChba2V5LCB7IHByb21wdCwgcHJvbXB0VHlwZSB9XSkgPT4ge1xuICAgICAgLy8gQ3JlYXRlIGEgbmV3IGRpdiBmb3IgZWFjaCBwcm9tcHRcbiAgICAgIGNvbnN0IHByb21wdERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBwcm9tcHREaXYudGV4dENvbnRlbnQgPSBwcm9tcHQ7XG5cbiAgICAgIC8vIEFwcGx5IHN0eWxpbmcgYmFzZWQgb24gcHJvbXB0VHlwZVxuICAgICAgc3dpdGNoIChwcm9tcHRUeXBlKSB7XG4gICAgICAgIGNhc2UgXCJpbnN0cnVjdGlvblwiOlxuICAgICAgICAgIHByb21wdERpdi5jbGFzc0xpc3QuYWRkKGluc3RydWN0aW9uQ2xyKTtcbiAgICAgICAgICBwcm9tcHREaXYuY2xhc3NMaXN0LmFkZChcIm5hbnVtLWdvdGhpYy1jb2RpbmctYm9sZFwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImd1aWRlXCI6XG4gICAgICAgICAgcHJvbXB0RGl2LmNsYXNzTGlzdC5hZGQoZ3VpZGVDbHIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICBwcm9tcHREaXYuY2xhc3NMaXN0LmFkZChlcnJvckNscik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcHJvbXB0RGl2LmNsYXNzTGlzdC5hZGQoZGVmYXVsdENscik7IC8vIERlZmF1bHQgdGV4dCBjb2xvclxuICAgICAgfVxuXG4gICAgICAvLyBBcHBlbmQgdGhlIG5ldyBkaXYgdG8gdGhlIGRpc3BsYXkgY29udGFpbmVyXG4gICAgICBkaXNwbGF5LmFwcGVuZENoaWxkKHByb21wdERpdik7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gZm9yIHJlbmRlcmluZyBzaGlwcyB0byB0aGUgU2hpcCBTdGF0dXMgZGlzcGxheSBzZWN0aW9uXG4gIGNvbnN0IHJlbmRlclNoaXBEaXNwID0gKHBsYXllck9iaiwgc2hpcFR5cGUpID0+IHtcbiAgICBsZXQgaWRTZWw7XG5cbiAgICAvLyBTZXQgdGhlIGNvcnJlY3QgaWQgc2VsZWN0b3IgZm9yIHRoZSB0eXBlIG9mIHBsYXllclxuICAgIGlmIChwbGF5ZXJPYmoudHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICBpZFNlbCA9IFwiaHVtYW4tZGlzcGxheVwiO1xuICAgIH0gZWxzZSBpZiAocGxheWVyT2JqLnR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgaWRTZWwgPSBcImNvbXAtZGlzcGxheVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcjtcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIGNvcnJlY3QgRE9NIGVsZW1lbnRcbiAgICBjb25zdCBkaXNwRGl2ID0gZG9jdW1lbnRcbiAgICAgIC5nZXRFbGVtZW50QnlJZChpZFNlbClcbiAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLnNoaXBzLWNvbnRhaW5lclwiKTtcblxuICAgIC8vIEdldCB0aGUgc2hpcCBmcm9tIHRoZSBwbGF5ZXJcbiAgICBjb25zdCBzaGlwID0gcGxheWVyT2JqLmdhbWVib2FyZC5nZXRTaGlwKHNoaXBUeXBlKTtcblxuICAgIC8vIENyZWF0ZSBhIGRpdiBmb3IgdGhlIHNoaXBcbiAgICBjb25zdCBzaGlwRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBzaGlwRGl2LmNsYXNzTmFtZSA9IFwicHgtNCBweS0yIGZsZXggZmxleC1jb2wgZ2FwLTFcIjtcblxuICAgIC8vIEFkZCBhIHRpdGxlIHRoZSB0aGUgZGl2XG4gICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaDJcIik7XG4gICAgdGl0bGUudGV4dENvbnRlbnQgPSBzaGlwVHlwZTsgLy8gU2V0IHRoZSB0aXRsZSB0byB0aGUgc2hpcCB0eXBlXG4gICAgc2hpcERpdi5hcHBlbmRDaGlsZCh0aXRsZSk7XG5cbiAgICAvLyBHZXQgdGhlIHNoaXAgcG9zaXRpb25zIGFycmF5XG4gICAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IHBsYXllck9iai5nYW1lYm9hcmQuZ2V0U2hpcFBvc2l0aW9ucyhzaGlwVHlwZSk7XG5cbiAgICAvLyBCdWlsZCB0aGUgc2hpcCBzZWN0aW9uc1xuICAgIGNvbnN0IHNoaXBTZWN0cyA9IGJ1aWxkU2hpcChzaGlwLCBpZFNlbCwgc2hpcFBvc2l0aW9ucyk7XG5cbiAgICAvLyBBZGQgdGhlIHNoaXAgc2VjdGlvbnMgdG8gdGhlIGRpdlxuICAgIGNvbnN0IHNlY3RzRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBzZWN0c0Rpdi5jbGFzc05hbWUgPSBcImZsZXggZmxleC1yb3cgZ2FwLTFcIjtcbiAgICBzaGlwU2VjdHMuZm9yRWFjaCgoc2VjdCkgPT4ge1xuICAgICAgc2VjdHNEaXYuYXBwZW5kQ2hpbGQoc2VjdCk7XG4gICAgfSk7XG4gICAgc2hpcERpdi5hcHBlbmRDaGlsZChzZWN0c0Rpdik7XG5cbiAgICBkaXNwRGl2LmFwcGVuZENoaWxkKHNoaXBEaXYpO1xuICB9O1xuXG4gIC8vIEZ1bmN0aW9uIGZvciByIHNoaXBzIG9uIHRoZSBnYW1lYm9hcmRcbiAgY29uc3QgcmVuZGVyU2hpcEJvYXJkID0gKHBsYXllck9iaiwgc2hpcFR5cGUpID0+IHtcbiAgICBsZXQgaWRTZWw7XG5cbiAgICAvLyBTZXQgdGhlIGNvcnJlY3QgaWQgc2VsZWN0b3IgZm9yIHRoZSB0eXBlIG9mIHBsYXllclxuICAgIGlmIChwbGF5ZXJPYmoudHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICBpZFNlbCA9IFwiaHVtYW4tYm9hcmRcIjtcbiAgICB9IGVsc2UgaWYgKHBsYXllck9iai50eXBlID09PSBcImNvbXB1dGVyXCIpIHtcbiAgICAgIGlkU2VsID0gXCJjb21wLWJvYXJkXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yKFwiTm8gbWF0Y2hpbmcgcGxheWVyIHR5cGUgaW4gJ3JlbmRlclNoaXBCb2FyZCcgZnVuY3Rpb25cIik7XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSBwbGF5ZXIncyB0eXBlIGFuZCBnYW1lYm9hcmRcbiAgICBjb25zdCB7IHR5cGU6IHBsYXllclR5cGUsIGdhbWVib2FyZCB9ID0gcGxheWVyT2JqO1xuXG4gICAgLy8gR2V0IHRoZSBzaGlwIGFuZCB0aGUgc2hpcCBwb3NpdGlvbnNcbiAgICBjb25zdCBzaGlwT2JqID0gZ2FtZWJvYXJkLmdldFNoaXAoc2hpcFR5cGUpO1xuICAgIGNvbnN0IHNoaXBQb3NpdGlvbnMgPSBnYW1lYm9hcmQuZ2V0U2hpcFBvc2l0aW9ucyhzaGlwVHlwZSk7XG5cbiAgICAvLyBCdWlsZCB0aGUgc2hpcCBzZWN0aW9uc1xuICAgIGNvbnN0IHNoaXBTZWN0cyA9IGJ1aWxkU2hpcChzaGlwT2JqLCBpZFNlbCwgc2hpcFBvc2l0aW9ucyk7XG5cbiAgICAvLyBNYXRjaCB0aGUgY2VsbCBwb3NpdGlvbnMgd2l0aCB0aGUgc2hpcCBzZWN0aW9ucyBhbmQgcGxhY2UgZWFjaFxuICAgIC8vIHNoaXAgc2VjdGlvbiBpbiB0aGUgY29ycmVzcG9uZGluZyBjZWxsIGVsZW1lbnRcbiAgICBzaGlwUG9zaXRpb25zLmZvckVhY2goKHBvc2l0aW9uKSA9PiB7XG4gICAgICBjb25zdCBjZWxsRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke3BsYXllclR5cGV9LSR7cG9zaXRpb259YCk7XG4gICAgICAvLyBGaW5kIHRoZSBzaGlwIHNlY3Rpb24gZWxlbWVudCB0aGF0IG1hdGNoZXMgdGhlIGN1cnJlbnQgcG9zaXRpb25cbiAgICAgIGNvbnN0IHNoaXBTZWN0ID0gc2hpcFNlY3RzLmZpbmQoXG4gICAgICAgIChzZWN0aW9uKSA9PiBzZWN0aW9uLmRhdGFzZXQucG9zaXRpb24gPT09IHBvc2l0aW9uLFxuICAgICAgKTtcblxuICAgICAgaWYgKGNlbGxFbGVtZW50ICYmIHNoaXBTZWN0KSB7XG4gICAgICAgIC8vIFBsYWNlIHRoZSBzaGlwIHNlY3Rpb24gaW4gdGhlIGNlbGxcbiAgICAgICAgY2VsbEVsZW1lbnQuYXBwZW5kQ2hpbGQoc2hpcFNlY3QpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIGNvbnN0IHVwZGF0ZVNoaXBTZWN0aW9uID0gKHBvcywgc2hpcFR5cGUsIHBsYXllclR5cGUsIGlzU2hpcFN1bmsgPSBmYWxzZSkgPT4ge1xuICAgIGxldCBuZXdDbHI7XG5cbiAgICBzd2l0Y2ggKGlzU2hpcFN1bmspIHtcbiAgICAgIGNhc2UgdHJ1ZTpcbiAgICAgICAgbmV3Q2xyID0gc2hpcFN1bmtDbHI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbmV3Q2xyID0gc2hpcEhpdENscjtcbiAgICB9XG5cbiAgICAvLyBTZXQgdGhlIHNlbGVjdG9yIHZhbHVlIGRlcGVuZGluZyBvbiB0aGUgcGxheWVyIHR5cGVcbiAgICBjb25zdCBwbGF5ZXJJZCA9IHBsYXllclR5cGUgPT09IFwiaHVtYW5cIiA/IFwiaHVtYW5cIiA6IFwiY29tcFwiO1xuXG4gICAgLy8gSWYgcGxheWVyIHR5cGUgaXMgaHVtYW4gdGhlbiBhbHNvIHVwZGF0ZSB0aGUgc2hpcCBzZWN0aW9uIG9uIHRoZSBib2FyZFxuICAgIGlmIChwbGF5ZXJJZCA9PT0gXCJodW1hblwiIHx8IGlzU2hpcFN1bmspIHtcbiAgICAgIC8vIEdldCB0aGUgY29ycmVjdCBzaGlwIHNlY3Rpb24gZWxlbWVudCBmcm9tIHRoZSBET00gZm9yIHRoZVxuICAgICAgLy8gc3RhdHVzIGRpc3BsYXlcbiAgICAgIGNvbnN0IHNoaXBTZWN0RGlzcGxheUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICAgIGBET00tJHtwbGF5ZXJJZH0tZGlzcGxheS1zaGlwVHlwZS0ke3NoaXBUeXBlfS1wb3MtJHtwb3N9YCxcbiAgICAgICk7XG5cbiAgICAgIC8vIElmIHRoZSBlbGVtZW50IHdhcyBmb3VuZCBzdWNjZXNzZnVsbHksIGNoYW5nZSBpdHMgY29sb3VyLCBvdGhlcndpc2VcbiAgICAgIC8vIHRocm93IGVycm9yXG4gICAgICBpZiAoIXNoaXBTZWN0RGlzcGxheUVsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBcIkVycm9yISBTaGlwIHNlY3Rpb24gZWxlbWVudCBub3QgZm91bmQgaW4gc3RhdHVzIGRpc3BsYXkhICh1cGRhdGVTaGlwU2VjdGlvbilcIixcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNoaXBTZWN0RGlzcGxheUVsLmNsYXNzTGlzdC5yZW1vdmUoc2hpcFNlY3RDbHIpO1xuICAgICAgICBzaGlwU2VjdERpc3BsYXlFbC5jbGFzc0xpc3QucmVtb3ZlKHNoaXBIaXRDbHIpO1xuICAgICAgICBzaGlwU2VjdERpc3BsYXlFbC5jbGFzc0xpc3QuYWRkKG5ld0Nscik7XG4gICAgICB9XG5cbiAgICAgIGlmIChwbGF5ZXJJZCA9PT0gXCJodW1hblwiKSB7XG4gICAgICAgIC8vIEdldCB0aGUgY29ycmVjdCBzaGlwIHNlY3Rpb24gZWxlbWVudCBmcm9tIHRoZSBET00gZm9yIHRoZVxuICAgICAgICAvLyBnYW1lYm9hcmQgZGlzcGxheVxuICAgICAgICBjb25zdCBzaGlwU2VjdEJvYXJkRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAgICAgICBgRE9NLSR7cGxheWVySWR9LWJvYXJkLXNoaXBUeXBlLSR7c2hpcFR5cGV9LXBvcy0ke3Bvc31gLFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIElmIHRoZSBlbGVtZW50IHdhcyBmb3VuZCBzdWNjZXNzZnVsbHksIGNoYW5nZSBpdHMgY29sb3VyLCBvdGhlcndpc2VcbiAgICAgICAgLy8gdGhyb3cgZXJyb3JcbiAgICAgICAgaWYgKCFzaGlwU2VjdEJvYXJkRWwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBcIkVycm9yISBTaGlwIHNlY3Rpb24gZWxlbWVudCBub3QgZm91bmQgb24gZ2FtZWJvYXJkISAodXBkYXRlU2hpcFNlY3Rpb24pXCIsXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzaGlwU2VjdEJvYXJkRWwuY2xhc3NMaXN0LnJlbW92ZShzaGlwU2VjdENscik7XG4gICAgICAgICAgc2hpcFNlY3RCb2FyZEVsLmNsYXNzTGlzdC5yZW1vdmUoc2hpcEhpdENscik7XG4gICAgICAgICAgc2hpcFNlY3RCb2FyZEVsLmNsYXNzTGlzdC5hZGQobmV3Q2xyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBjb25zdCByZW5kZXJTdW5rZW5TaGlwID0gKHBsYXllck9iaiwgc2hpcFR5cGUpID0+IHtcbiAgICAvLyBHZXQgdGhlIHBsYXllciB0eXBlXG4gICAgY29uc3QgeyB0eXBlIH0gPSBwbGF5ZXJPYmo7XG5cbiAgICAvLyBHZXQgdGhlIHNoaXAgcG9zaXRpb25zIGZvciB0aGUgc2hpcFxuICAgIGNvbnN0IHNoaXBQb3NpdGlvbnMgPSBwbGF5ZXJPYmouZ2FtZWJvYXJkLmdldFNoaXBQb3NpdGlvbnMoc2hpcFR5cGUpO1xuXG4gICAgc2hpcFBvc2l0aW9ucy5mb3JFYWNoKChwb3MpID0+IHtcbiAgICAgIHVwZGF0ZVNoaXBTZWN0aW9uKHBvcywgc2hpcFR5cGUsIHR5cGUsIHRydWUpO1xuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgY3JlYXRlR2FtZWJvYXJkLFxuICAgIGluaXRDb25zb2xlVUksXG4gICAgZGlzcGxheVByb21wdCxcbiAgICByZW5kZXJTaGlwRGlzcCxcbiAgICByZW5kZXJTaGlwQm9hcmQsXG4gICAgdXBkYXRlU2hpcFNlY3Rpb24sXG4gICAgcmVuZGVyU3Vua2VuU2hpcCxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFVpTWFuYWdlcjtcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIGAvKlxuISB0YWlsd2luZGNzcyB2My40LjEgfCBNSVQgTGljZW5zZSB8IGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tXG4qLy8qXG4xLiBQcmV2ZW50IHBhZGRpbmcgYW5kIGJvcmRlciBmcm9tIGFmZmVjdGluZyBlbGVtZW50IHdpZHRoLiAoaHR0cHM6Ly9naXRodWIuY29tL21vemRldnMvY3NzcmVtZWR5L2lzc3Vlcy80KVxuMi4gQWxsb3cgYWRkaW5nIGEgYm9yZGVyIHRvIGFuIGVsZW1lbnQgYnkganVzdCBhZGRpbmcgYSBib3JkZXItd2lkdGguIChodHRwczovL2dpdGh1Yi5jb20vdGFpbHdpbmRjc3MvdGFpbHdpbmRjc3MvcHVsbC8xMTYpXG4qL1xuXG4qLFxuOjpiZWZvcmUsXG46OmFmdGVyIHtcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDsgLyogMSAqL1xuICBib3JkZXItd2lkdGg6IDA7IC8qIDIgKi9cbiAgYm9yZGVyLXN0eWxlOiBzb2xpZDsgLyogMiAqL1xuICBib3JkZXItY29sb3I6ICNlNWU3ZWI7IC8qIDIgKi9cbn1cblxuOjpiZWZvcmUsXG46OmFmdGVyIHtcbiAgLS10dy1jb250ZW50OiAnJztcbn1cblxuLypcbjEuIFVzZSBhIGNvbnNpc3RlbnQgc2Vuc2libGUgbGluZS1oZWlnaHQgaW4gYWxsIGJyb3dzZXJzLlxuMi4gUHJldmVudCBhZGp1c3RtZW50cyBvZiBmb250IHNpemUgYWZ0ZXIgb3JpZW50YXRpb24gY2hhbmdlcyBpbiBpT1MuXG4zLiBVc2UgYSBtb3JlIHJlYWRhYmxlIHRhYiBzaXplLlxuNC4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBzYW5zXFxgIGZvbnQtZmFtaWx5IGJ5IGRlZmF1bHQuXG41LiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYHNhbnNcXGAgZm9udC1mZWF0dXJlLXNldHRpbmdzIGJ5IGRlZmF1bHQuXG42LiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYHNhbnNcXGAgZm9udC12YXJpYXRpb24tc2V0dGluZ3MgYnkgZGVmYXVsdC5cbjcuIERpc2FibGUgdGFwIGhpZ2hsaWdodHMgb24gaU9TXG4qL1xuXG5odG1sLFxuOmhvc3Qge1xuICBsaW5lLWhlaWdodDogMS41OyAvKiAxICovXG4gIC13ZWJraXQtdGV4dC1zaXplLWFkanVzdDogMTAwJTsgLyogMiAqL1xuICAtbW96LXRhYi1zaXplOiA0OyAvKiAzICovXG4gIC1vLXRhYi1zaXplOiA0O1xuICAgICB0YWItc2l6ZTogNDsgLyogMyAqL1xuICBmb250LWZhbWlseTogdWktc2Fucy1zZXJpZiwgc3lzdGVtLXVpLCBzYW5zLXNlcmlmLCBcIkFwcGxlIENvbG9yIEVtb2ppXCIsIFwiU2Vnb2UgVUkgRW1vamlcIiwgXCJTZWdvZSBVSSBTeW1ib2xcIiwgXCJOb3RvIENvbG9yIEVtb2ppXCI7IC8qIDQgKi9cbiAgZm9udC1mZWF0dXJlLXNldHRpbmdzOiBub3JtYWw7IC8qIDUgKi9cbiAgZm9udC12YXJpYXRpb24tc2V0dGluZ3M6IG5vcm1hbDsgLyogNiAqL1xuICAtd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6IHRyYW5zcGFyZW50OyAvKiA3ICovXG59XG5cbi8qXG4xLiBSZW1vdmUgdGhlIG1hcmdpbiBpbiBhbGwgYnJvd3NlcnMuXG4yLiBJbmhlcml0IGxpbmUtaGVpZ2h0IGZyb20gXFxgaHRtbFxcYCBzbyB1c2VycyBjYW4gc2V0IHRoZW0gYXMgYSBjbGFzcyBkaXJlY3RseSBvbiB0aGUgXFxgaHRtbFxcYCBlbGVtZW50LlxuKi9cblxuYm9keSB7XG4gIG1hcmdpbjogMDsgLyogMSAqL1xuICBsaW5lLWhlaWdodDogaW5oZXJpdDsgLyogMiAqL1xufVxuXG4vKlxuMS4gQWRkIHRoZSBjb3JyZWN0IGhlaWdodCBpbiBGaXJlZm94LlxuMi4gQ29ycmVjdCB0aGUgaW5oZXJpdGFuY2Ugb2YgYm9yZGVyIGNvbG9yIGluIEZpcmVmb3guIChodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD0xOTA2NTUpXG4zLiBFbnN1cmUgaG9yaXpvbnRhbCBydWxlcyBhcmUgdmlzaWJsZSBieSBkZWZhdWx0LlxuKi9cblxuaHIge1xuICBoZWlnaHQ6IDA7IC8qIDEgKi9cbiAgY29sb3I6IGluaGVyaXQ7IC8qIDIgKi9cbiAgYm9yZGVyLXRvcC13aWR0aDogMXB4OyAvKiAzICovXG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgdGV4dCBkZWNvcmF0aW9uIGluIENocm9tZSwgRWRnZSwgYW5kIFNhZmFyaS5cbiovXG5cbmFiYnI6d2hlcmUoW3RpdGxlXSkge1xuICAtd2Via2l0LXRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lIGRvdHRlZDtcbiAgICAgICAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZSBkb3R0ZWQ7XG59XG5cbi8qXG5SZW1vdmUgdGhlIGRlZmF1bHQgZm9udCBzaXplIGFuZCB3ZWlnaHQgZm9yIGhlYWRpbmdzLlxuKi9cblxuaDEsXG5oMixcbmgzLFxuaDQsXG5oNSxcbmg2IHtcbiAgZm9udC1zaXplOiBpbmhlcml0O1xuICBmb250LXdlaWdodDogaW5oZXJpdDtcbn1cblxuLypcblJlc2V0IGxpbmtzIHRvIG9wdGltaXplIGZvciBvcHQtaW4gc3R5bGluZyBpbnN0ZWFkIG9mIG9wdC1vdXQuXG4qL1xuXG5hIHtcbiAgY29sb3I6IGluaGVyaXQ7XG4gIHRleHQtZGVjb3JhdGlvbjogaW5oZXJpdDtcbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCBmb250IHdlaWdodCBpbiBFZGdlIGFuZCBTYWZhcmkuXG4qL1xuXG5iLFxuc3Ryb25nIHtcbiAgZm9udC13ZWlnaHQ6IGJvbGRlcjtcbn1cblxuLypcbjEuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgbW9ub1xcYCBmb250LWZhbWlseSBieSBkZWZhdWx0LlxuMi4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBtb25vXFxgIGZvbnQtZmVhdHVyZS1zZXR0aW5ncyBieSBkZWZhdWx0LlxuMy4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBtb25vXFxgIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzIGJ5IGRlZmF1bHQuXG40LiBDb3JyZWN0IHRoZSBvZGQgXFxgZW1cXGAgZm9udCBzaXppbmcgaW4gYWxsIGJyb3dzZXJzLlxuKi9cblxuY29kZSxcbmtiZCxcbnNhbXAsXG5wcmUge1xuICBmb250LWZhbWlseTogdWktbW9ub3NwYWNlLCBTRk1vbm8tUmVndWxhciwgTWVubG8sIE1vbmFjbywgQ29uc29sYXMsIFwiTGliZXJhdGlvbiBNb25vXCIsIFwiQ291cmllciBOZXdcIiwgbW9ub3NwYWNlOyAvKiAxICovXG4gIGZvbnQtZmVhdHVyZS1zZXR0aW5nczogbm9ybWFsOyAvKiAyICovXG4gIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzOiBub3JtYWw7IC8qIDMgKi9cbiAgZm9udC1zaXplOiAxZW07IC8qIDQgKi9cbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCBmb250IHNpemUgaW4gYWxsIGJyb3dzZXJzLlxuKi9cblxuc21hbGwge1xuICBmb250LXNpemU6IDgwJTtcbn1cblxuLypcblByZXZlbnQgXFxgc3ViXFxgIGFuZCBcXGBzdXBcXGAgZWxlbWVudHMgZnJvbSBhZmZlY3RpbmcgdGhlIGxpbmUgaGVpZ2h0IGluIGFsbCBicm93c2Vycy5cbiovXG5cbnN1YixcbnN1cCB7XG4gIGZvbnQtc2l6ZTogNzUlO1xuICBsaW5lLWhlaWdodDogMDtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XG59XG5cbnN1YiB7XG4gIGJvdHRvbTogLTAuMjVlbTtcbn1cblxuc3VwIHtcbiAgdG9wOiAtMC41ZW07XG59XG5cbi8qXG4xLiBSZW1vdmUgdGV4dCBpbmRlbnRhdGlvbiBmcm9tIHRhYmxlIGNvbnRlbnRzIGluIENocm9tZSBhbmQgU2FmYXJpLiAoaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9OTk5MDg4LCBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjAxMjk3KVxuMi4gQ29ycmVjdCB0YWJsZSBib3JkZXIgY29sb3IgaW5oZXJpdGFuY2UgaW4gYWxsIENocm9tZSBhbmQgU2FmYXJpLiAoaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9OTM1NzI5LCBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTk1MDE2KVxuMy4gUmVtb3ZlIGdhcHMgYmV0d2VlbiB0YWJsZSBib3JkZXJzIGJ5IGRlZmF1bHQuXG4qL1xuXG50YWJsZSB7XG4gIHRleHQtaW5kZW50OiAwOyAvKiAxICovXG4gIGJvcmRlci1jb2xvcjogaW5oZXJpdDsgLyogMiAqL1xuICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyAvKiAzICovXG59XG5cbi8qXG4xLiBDaGFuZ2UgdGhlIGZvbnQgc3R5bGVzIGluIGFsbCBicm93c2Vycy5cbjIuIFJlbW92ZSB0aGUgbWFyZ2luIGluIEZpcmVmb3ggYW5kIFNhZmFyaS5cbjMuIFJlbW92ZSBkZWZhdWx0IHBhZGRpbmcgaW4gYWxsIGJyb3dzZXJzLlxuKi9cblxuYnV0dG9uLFxuaW5wdXQsXG5vcHRncm91cCxcbnNlbGVjdCxcbnRleHRhcmVhIHtcbiAgZm9udC1mYW1pbHk6IGluaGVyaXQ7IC8qIDEgKi9cbiAgZm9udC1mZWF0dXJlLXNldHRpbmdzOiBpbmhlcml0OyAvKiAxICovXG4gIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzOiBpbmhlcml0OyAvKiAxICovXG4gIGZvbnQtc2l6ZTogMTAwJTsgLyogMSAqL1xuICBmb250LXdlaWdodDogaW5oZXJpdDsgLyogMSAqL1xuICBsaW5lLWhlaWdodDogaW5oZXJpdDsgLyogMSAqL1xuICBjb2xvcjogaW5oZXJpdDsgLyogMSAqL1xuICBtYXJnaW46IDA7IC8qIDIgKi9cbiAgcGFkZGluZzogMDsgLyogMyAqL1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBpbmhlcml0YW5jZSBvZiB0ZXh0IHRyYW5zZm9ybSBpbiBFZGdlIGFuZCBGaXJlZm94LlxuKi9cblxuYnV0dG9uLFxuc2VsZWN0IHtcbiAgdGV4dC10cmFuc2Zvcm06IG5vbmU7XG59XG5cbi8qXG4xLiBDb3JyZWN0IHRoZSBpbmFiaWxpdHkgdG8gc3R5bGUgY2xpY2thYmxlIHR5cGVzIGluIGlPUyBhbmQgU2FmYXJpLlxuMi4gUmVtb3ZlIGRlZmF1bHQgYnV0dG9uIHN0eWxlcy5cbiovXG5cbmJ1dHRvbixcblt0eXBlPSdidXR0b24nXSxcblt0eXBlPSdyZXNldCddLFxuW3R5cGU9J3N1Ym1pdCddIHtcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiBidXR0b247IC8qIDEgKi9cbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7IC8qIDIgKi9cbiAgYmFja2dyb3VuZC1pbWFnZTogbm9uZTsgLyogMiAqL1xufVxuXG4vKlxuVXNlIHRoZSBtb2Rlcm4gRmlyZWZveCBmb2N1cyBzdHlsZSBmb3IgYWxsIGZvY3VzYWJsZSBlbGVtZW50cy5cbiovXG5cbjotbW96LWZvY3VzcmluZyB7XG4gIG91dGxpbmU6IGF1dG87XG59XG5cbi8qXG5SZW1vdmUgdGhlIGFkZGl0aW9uYWwgXFxgOmludmFsaWRcXGAgc3R5bGVzIGluIEZpcmVmb3guIChodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9nZWNrby1kZXYvYmxvYi8yZjllYWNkOWQzZDk5NWM5MzdiNDI1MWE1NTU3ZDk1ZDQ5NGM5YmUxL2xheW91dC9zdHlsZS9yZXMvZm9ybXMuY3NzI0w3MjgtTDczNylcbiovXG5cbjotbW96LXVpLWludmFsaWQge1xuICBib3gtc2hhZG93OiBub25lO1xufVxuXG4vKlxuQWRkIHRoZSBjb3JyZWN0IHZlcnRpY2FsIGFsaWdubWVudCBpbiBDaHJvbWUgYW5kIEZpcmVmb3guXG4qL1xuXG5wcm9ncmVzcyB7XG4gIHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTtcbn1cblxuLypcbkNvcnJlY3QgdGhlIGN1cnNvciBzdHlsZSBvZiBpbmNyZW1lbnQgYW5kIGRlY3JlbWVudCBidXR0b25zIGluIFNhZmFyaS5cbiovXG5cbjo6LXdlYmtpdC1pbm5lci1zcGluLWJ1dHRvbixcbjo6LXdlYmtpdC1vdXRlci1zcGluLWJ1dHRvbiB7XG4gIGhlaWdodDogYXV0bztcbn1cblxuLypcbjEuIENvcnJlY3QgdGhlIG9kZCBhcHBlYXJhbmNlIGluIENocm9tZSBhbmQgU2FmYXJpLlxuMi4gQ29ycmVjdCB0aGUgb3V0bGluZSBzdHlsZSBpbiBTYWZhcmkuXG4qL1xuXG5bdHlwZT0nc2VhcmNoJ10ge1xuICAtd2Via2l0LWFwcGVhcmFuY2U6IHRleHRmaWVsZDsgLyogMSAqL1xuICBvdXRsaW5lLW9mZnNldDogLTJweDsgLyogMiAqL1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBpbm5lciBwYWRkaW5nIGluIENocm9tZSBhbmQgU2FmYXJpIG9uIG1hY09TLlxuKi9cblxuOjotd2Via2l0LXNlYXJjaC1kZWNvcmF0aW9uIHtcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xufVxuXG4vKlxuMS4gQ29ycmVjdCB0aGUgaW5hYmlsaXR5IHRvIHN0eWxlIGNsaWNrYWJsZSB0eXBlcyBpbiBpT1MgYW5kIFNhZmFyaS5cbjIuIENoYW5nZSBmb250IHByb3BlcnRpZXMgdG8gXFxgaW5oZXJpdFxcYCBpbiBTYWZhcmkuXG4qL1xuXG46Oi13ZWJraXQtZmlsZS11cGxvYWQtYnV0dG9uIHtcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiBidXR0b247IC8qIDEgKi9cbiAgZm9udDogaW5oZXJpdDsgLyogMiAqL1xufVxuXG4vKlxuQWRkIHRoZSBjb3JyZWN0IGRpc3BsYXkgaW4gQ2hyb21lIGFuZCBTYWZhcmkuXG4qL1xuXG5zdW1tYXJ5IHtcbiAgZGlzcGxheTogbGlzdC1pdGVtO1xufVxuXG4vKlxuUmVtb3ZlcyB0aGUgZGVmYXVsdCBzcGFjaW5nIGFuZCBib3JkZXIgZm9yIGFwcHJvcHJpYXRlIGVsZW1lbnRzLlxuKi9cblxuYmxvY2txdW90ZSxcbmRsLFxuZGQsXG5oMSxcbmgyLFxuaDMsXG5oNCxcbmg1LFxuaDYsXG5ocixcbmZpZ3VyZSxcbnAsXG5wcmUge1xuICBtYXJnaW46IDA7XG59XG5cbmZpZWxkc2V0IHtcbiAgbWFyZ2luOiAwO1xuICBwYWRkaW5nOiAwO1xufVxuXG5sZWdlbmQge1xuICBwYWRkaW5nOiAwO1xufVxuXG5vbCxcbnVsLFxubWVudSB7XG4gIGxpc3Qtc3R5bGU6IG5vbmU7XG4gIG1hcmdpbjogMDtcbiAgcGFkZGluZzogMDtcbn1cblxuLypcblJlc2V0IGRlZmF1bHQgc3R5bGluZyBmb3IgZGlhbG9ncy5cbiovXG5kaWFsb2cge1xuICBwYWRkaW5nOiAwO1xufVxuXG4vKlxuUHJldmVudCByZXNpemluZyB0ZXh0YXJlYXMgaG9yaXpvbnRhbGx5IGJ5IGRlZmF1bHQuXG4qL1xuXG50ZXh0YXJlYSB7XG4gIHJlc2l6ZTogdmVydGljYWw7XG59XG5cbi8qXG4xLiBSZXNldCB0aGUgZGVmYXVsdCBwbGFjZWhvbGRlciBvcGFjaXR5IGluIEZpcmVmb3guIChodHRwczovL2dpdGh1Yi5jb20vdGFpbHdpbmRsYWJzL3RhaWx3aW5kY3NzL2lzc3Vlcy8zMzAwKVxuMi4gU2V0IHRoZSBkZWZhdWx0IHBsYWNlaG9sZGVyIGNvbG9yIHRvIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBncmF5IDQwMCBjb2xvci5cbiovXG5cbmlucHV0OjotbW96LXBsYWNlaG9sZGVyLCB0ZXh0YXJlYTo6LW1vei1wbGFjZWhvbGRlciB7XG4gIG9wYWNpdHk6IDE7IC8qIDEgKi9cbiAgY29sb3I6ICM5Y2EzYWY7IC8qIDIgKi9cbn1cblxuaW5wdXQ6OnBsYWNlaG9sZGVyLFxudGV4dGFyZWE6OnBsYWNlaG9sZGVyIHtcbiAgb3BhY2l0eTogMTsgLyogMSAqL1xuICBjb2xvcjogIzljYTNhZjsgLyogMiAqL1xufVxuXG4vKlxuU2V0IHRoZSBkZWZhdWx0IGN1cnNvciBmb3IgYnV0dG9ucy5cbiovXG5cbmJ1dHRvbixcbltyb2xlPVwiYnV0dG9uXCJdIHtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuXG4vKlxuTWFrZSBzdXJlIGRpc2FibGVkIGJ1dHRvbnMgZG9uJ3QgZ2V0IHRoZSBwb2ludGVyIGN1cnNvci5cbiovXG46ZGlzYWJsZWQge1xuICBjdXJzb3I6IGRlZmF1bHQ7XG59XG5cbi8qXG4xLiBNYWtlIHJlcGxhY2VkIGVsZW1lbnRzIFxcYGRpc3BsYXk6IGJsb2NrXFxgIGJ5IGRlZmF1bHQuIChodHRwczovL2dpdGh1Yi5jb20vbW96ZGV2cy9jc3NyZW1lZHkvaXNzdWVzLzE0KVxuMi4gQWRkIFxcYHZlcnRpY2FsLWFsaWduOiBtaWRkbGVcXGAgdG8gYWxpZ24gcmVwbGFjZWQgZWxlbWVudHMgbW9yZSBzZW5zaWJseSBieSBkZWZhdWx0LiAoaHR0cHM6Ly9naXRodWIuY29tL2plbnNpbW1vbnMvY3NzcmVtZWR5L2lzc3Vlcy8xNCNpc3N1ZWNvbW1lbnQtNjM0OTM0MjEwKVxuICAgVGhpcyBjYW4gdHJpZ2dlciBhIHBvb3JseSBjb25zaWRlcmVkIGxpbnQgZXJyb3IgaW4gc29tZSB0b29scyBidXQgaXMgaW5jbHVkZWQgYnkgZGVzaWduLlxuKi9cblxuaW1nLFxuc3ZnLFxudmlkZW8sXG5jYW52YXMsXG5hdWRpbyxcbmlmcmFtZSxcbmVtYmVkLFxub2JqZWN0IHtcbiAgZGlzcGxheTogYmxvY2s7IC8qIDEgKi9cbiAgdmVydGljYWwtYWxpZ246IG1pZGRsZTsgLyogMiAqL1xufVxuXG4vKlxuQ29uc3RyYWluIGltYWdlcyBhbmQgdmlkZW9zIHRvIHRoZSBwYXJlbnQgd2lkdGggYW5kIHByZXNlcnZlIHRoZWlyIGludHJpbnNpYyBhc3BlY3QgcmF0aW8uIChodHRwczovL2dpdGh1Yi5jb20vbW96ZGV2cy9jc3NyZW1lZHkvaXNzdWVzLzE0KVxuKi9cblxuaW1nLFxudmlkZW8ge1xuICBtYXgtd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogYXV0bztcbn1cblxuLyogTWFrZSBlbGVtZW50cyB3aXRoIHRoZSBIVE1MIGhpZGRlbiBhdHRyaWJ1dGUgc3RheSBoaWRkZW4gYnkgZGVmYXVsdCAqL1xuW2hpZGRlbl0ge1xuICBkaXNwbGF5OiBub25lO1xufVxuXG4qLCA6OmJlZm9yZSwgOjphZnRlciB7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteDogMDtcbiAgLS10dy1ib3JkZXItc3BhY2luZy15OiAwO1xuICAtLXR3LXRyYW5zbGF0ZS14OiAwO1xuICAtLXR3LXRyYW5zbGF0ZS15OiAwO1xuICAtLXR3LXJvdGF0ZTogMDtcbiAgLS10dy1za2V3LXg6IDA7XG4gIC0tdHctc2tldy15OiAwO1xuICAtLXR3LXNjYWxlLXg6IDE7XG4gIC0tdHctc2NhbGUteTogMTtcbiAgLS10dy1wYW4teDogIDtcbiAgLS10dy1wYW4teTogIDtcbiAgLS10dy1waW5jaC16b29tOiAgO1xuICAtLXR3LXNjcm9sbC1zbmFwLXN0cmljdG5lc3M6IHByb3hpbWl0eTtcbiAgLS10dy1ncmFkaWVudC1mcm9tLXBvc2l0aW9uOiAgO1xuICAtLXR3LWdyYWRpZW50LXZpYS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC10by1wb3NpdGlvbjogIDtcbiAgLS10dy1vcmRpbmFsOiAgO1xuICAtLXR3LXNsYXNoZWQtemVybzogIDtcbiAgLS10dy1udW1lcmljLWZpZ3VyZTogIDtcbiAgLS10dy1udW1lcmljLXNwYWNpbmc6ICA7XG4gIC0tdHctbnVtZXJpYy1mcmFjdGlvbjogIDtcbiAgLS10dy1yaW5nLWluc2V0OiAgO1xuICAtLXR3LXJpbmctb2Zmc2V0LXdpZHRoOiAwcHg7XG4gIC0tdHctcmluZy1vZmZzZXQtY29sb3I6ICNmZmY7XG4gIC0tdHctcmluZy1jb2xvcjogcmdiKDU5IDEzMCAyNDYgLyAwLjUpO1xuICAtLXR3LXJpbmctb2Zmc2V0LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXJpbmctc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctc2hhZG93LWNvbG9yZWQ6IDAgMCAjMDAwMDtcbiAgLS10dy1ibHVyOiAgO1xuICAtLXR3LWJyaWdodG5lc3M6ICA7XG4gIC0tdHctY29udHJhc3Q6ICA7XG4gIC0tdHctZ3JheXNjYWxlOiAgO1xuICAtLXR3LWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctaW52ZXJ0OiAgO1xuICAtLXR3LXNhdHVyYXRlOiAgO1xuICAtLXR3LXNlcGlhOiAgO1xuICAtLXR3LWRyb3Atc2hhZG93OiAgO1xuICAtLXR3LWJhY2tkcm9wLWJsdXI6ICA7XG4gIC0tdHctYmFja2Ryb3AtYnJpZ2h0bmVzczogIDtcbiAgLS10dy1iYWNrZHJvcC1jb250cmFzdDogIDtcbiAgLS10dy1iYWNrZHJvcC1ncmF5c2NhbGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaHVlLXJvdGF0ZTogIDtcbiAgLS10dy1iYWNrZHJvcC1pbnZlcnQ6ICA7XG4gIC0tdHctYmFja2Ryb3Atb3BhY2l0eTogIDtcbiAgLS10dy1iYWNrZHJvcC1zYXR1cmF0ZTogIDtcbiAgLS10dy1iYWNrZHJvcC1zZXBpYTogIDtcbn1cblxuOjpiYWNrZHJvcCB7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteDogMDtcbiAgLS10dy1ib3JkZXItc3BhY2luZy15OiAwO1xuICAtLXR3LXRyYW5zbGF0ZS14OiAwO1xuICAtLXR3LXRyYW5zbGF0ZS15OiAwO1xuICAtLXR3LXJvdGF0ZTogMDtcbiAgLS10dy1za2V3LXg6IDA7XG4gIC0tdHctc2tldy15OiAwO1xuICAtLXR3LXNjYWxlLXg6IDE7XG4gIC0tdHctc2NhbGUteTogMTtcbiAgLS10dy1wYW4teDogIDtcbiAgLS10dy1wYW4teTogIDtcbiAgLS10dy1waW5jaC16b29tOiAgO1xuICAtLXR3LXNjcm9sbC1zbmFwLXN0cmljdG5lc3M6IHByb3hpbWl0eTtcbiAgLS10dy1ncmFkaWVudC1mcm9tLXBvc2l0aW9uOiAgO1xuICAtLXR3LWdyYWRpZW50LXZpYS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC10by1wb3NpdGlvbjogIDtcbiAgLS10dy1vcmRpbmFsOiAgO1xuICAtLXR3LXNsYXNoZWQtemVybzogIDtcbiAgLS10dy1udW1lcmljLWZpZ3VyZTogIDtcbiAgLS10dy1udW1lcmljLXNwYWNpbmc6ICA7XG4gIC0tdHctbnVtZXJpYy1mcmFjdGlvbjogIDtcbiAgLS10dy1yaW5nLWluc2V0OiAgO1xuICAtLXR3LXJpbmctb2Zmc2V0LXdpZHRoOiAwcHg7XG4gIC0tdHctcmluZy1vZmZzZXQtY29sb3I6ICNmZmY7XG4gIC0tdHctcmluZy1jb2xvcjogcmdiKDU5IDEzMCAyNDYgLyAwLjUpO1xuICAtLXR3LXJpbmctb2Zmc2V0LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXJpbmctc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctc2hhZG93LWNvbG9yZWQ6IDAgMCAjMDAwMDtcbiAgLS10dy1ibHVyOiAgO1xuICAtLXR3LWJyaWdodG5lc3M6ICA7XG4gIC0tdHctY29udHJhc3Q6ICA7XG4gIC0tdHctZ3JheXNjYWxlOiAgO1xuICAtLXR3LWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctaW52ZXJ0OiAgO1xuICAtLXR3LXNhdHVyYXRlOiAgO1xuICAtLXR3LXNlcGlhOiAgO1xuICAtLXR3LWRyb3Atc2hhZG93OiAgO1xuICAtLXR3LWJhY2tkcm9wLWJsdXI6ICA7XG4gIC0tdHctYmFja2Ryb3AtYnJpZ2h0bmVzczogIDtcbiAgLS10dy1iYWNrZHJvcC1jb250cmFzdDogIDtcbiAgLS10dy1iYWNrZHJvcC1ncmF5c2NhbGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaHVlLXJvdGF0ZTogIDtcbiAgLS10dy1iYWNrZHJvcC1pbnZlcnQ6ICA7XG4gIC0tdHctYmFja2Ryb3Atb3BhY2l0eTogIDtcbiAgLS10dy1iYWNrZHJvcC1zYXR1cmF0ZTogIDtcbiAgLS10dy1iYWNrZHJvcC1zZXBpYTogIDtcbn1cbi5jb250YWluZXIge1xuICB3aWR0aDogMTAwJTtcbn1cbkBtZWRpYSAobWluLXdpZHRoOiA2NDBweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogNjQwcHg7XG4gIH1cbn1cbkBtZWRpYSAobWluLXdpZHRoOiA3NjhweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogNzY4cHg7XG4gIH1cbn1cbkBtZWRpYSAobWluLXdpZHRoOiAxMDI0cHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDEwMjRweDtcbiAgfVxufVxuQG1lZGlhIChtaW4td2lkdGg6IDEyODBweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogMTI4MHB4O1xuICB9XG59XG5AbWVkaWEgKG1pbi13aWR0aDogMTUzNnB4KSB7XG5cbiAgLmNvbnRhaW5lciB7XG4gICAgbWF4LXdpZHRoOiAxNTM2cHg7XG4gIH1cbn1cbi5wb2ludGVyLWV2ZW50cy1ub25lIHtcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG4udmlzaWJsZSB7XG4gIHZpc2liaWxpdHk6IHZpc2libGU7XG59XG4uY29sbGFwc2Uge1xuICB2aXNpYmlsaXR5OiBjb2xsYXBzZTtcbn1cbi5hYnNvbHV0ZSB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbn1cbi5yZWxhdGl2ZSB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbn1cbi5sZWZ0LTAge1xuICBsZWZ0OiAwcHg7XG59XG4ucmlnaHQtMCB7XG4gIHJpZ2h0OiAwcHg7XG59XG4udG9wLTAge1xuICB0b3A6IDBweDtcbn1cbi56LTAge1xuICB6LWluZGV4OiAwO1xufVxuLnotMTAge1xuICB6LWluZGV4OiAxMDtcbn1cbi5tLTUge1xuICBtYXJnaW46IDEuMjVyZW07XG59XG4ubS04IHtcbiAgbWFyZ2luOiAycmVtO1xufVxuLm1sLTEwIHtcbiAgbWFyZ2luLWxlZnQ6IDIuNXJlbTtcbn1cbi5tbC04IHtcbiAgbWFyZ2luLWxlZnQ6IDJyZW07XG59XG4uYmxvY2sge1xuICBkaXNwbGF5OiBibG9jaztcbn1cbi5mbGV4IHtcbiAgZGlzcGxheTogZmxleDtcbn1cbi50YWJsZSB7XG4gIGRpc3BsYXk6IHRhYmxlO1xufVxuLmdyaWQge1xuICBkaXNwbGF5OiBncmlkO1xufVxuLmNvbnRlbnRzIHtcbiAgZGlzcGxheTogY29udGVudHM7XG59XG4uaGlkZGVuIHtcbiAgZGlzcGxheTogbm9uZTtcbn1cbi5oLTEge1xuICBoZWlnaHQ6IDAuMjVyZW07XG59XG4uaC0xXFxcXC81IHtcbiAgaGVpZ2h0OiAyMCU7XG59XG4uaC00IHtcbiAgaGVpZ2h0OiAxcmVtO1xufVxuLmgtNFxcXFwvNSB7XG4gIGhlaWdodDogODAlO1xufVxuLmgtNDAge1xuICBoZWlnaHQ6IDEwcmVtO1xufVxuLmgtNiB7XG4gIGhlaWdodDogMS41cmVtO1xufVxuLmgtNjAge1xuICBoZWlnaHQ6IDE1cmVtO1xufVxuLmgtbWF4IHtcbiAgaGVpZ2h0OiAtbW96LW1heC1jb250ZW50O1xuICBoZWlnaHQ6IG1heC1jb250ZW50O1xufVxuLmgtc2NyZWVuIHtcbiAgaGVpZ2h0OiAxMDB2aDtcbn1cbi5taW4taC1zY3JlZW4ge1xuICBtaW4taGVpZ2h0OiAxMDB2aDtcbn1cbi53LTEge1xuICB3aWR0aDogMC4yNXJlbTtcbn1cbi53LTFcXFxcLzIge1xuICB3aWR0aDogNTAlO1xufVxuLnctNCB7XG4gIHdpZHRoOiAxcmVtO1xufVxuLnctNFxcXFwvMTIge1xuICB3aWR0aDogMzMuMzMzMzMzJTtcbn1cbi53LTYge1xuICB3aWR0aDogMS41cmVtO1xufVxuLnctYXV0byB7XG4gIHdpZHRoOiBhdXRvO1xufVxuLnctZnVsbCB7XG4gIHdpZHRoOiAxMDAlO1xufVxuLnctc2NyZWVuIHtcbiAgd2lkdGg6IDEwMHZ3O1xufVxuLm1pbi13LTQ0IHtcbiAgbWluLXdpZHRoOiAxMXJlbTtcbn1cbi5taW4tdy1tYXgge1xuICBtaW4td2lkdGg6IC1tb3otbWF4LWNvbnRlbnQ7XG4gIG1pbi13aWR0aDogbWF4LWNvbnRlbnQ7XG59XG4ubWluLXctbWluIHtcbiAgbWluLXdpZHRoOiAtbW96LW1pbi1jb250ZW50O1xuICBtaW4td2lkdGg6IG1pbi1jb250ZW50O1xufVxuLmZsZXgtMSB7XG4gIGZsZXg6IDEgMSAwJTtcbn1cbi5mbGV4LW5vbmUge1xuICBmbGV4OiBub25lO1xufVxuLmJvcmRlci1jb2xsYXBzZSB7XG4gIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XG59XG4udHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUodmFyKC0tdHctdHJhbnNsYXRlLXgpLCB2YXIoLS10dy10cmFuc2xhdGUteSkpIHJvdGF0ZSh2YXIoLS10dy1yb3RhdGUpKSBza2V3WCh2YXIoLS10dy1za2V3LXgpKSBza2V3WSh2YXIoLS10dy1za2V3LXkpKSBzY2FsZVgodmFyKC0tdHctc2NhbGUteCkpIHNjYWxlWSh2YXIoLS10dy1zY2FsZS15KSk7XG59XG4uY3Vyc29yLWRlZmF1bHQge1xuICBjdXJzb3I6IGRlZmF1bHQ7XG59XG4uY3Vyc29yLWhlbHAge1xuICBjdXJzb3I6IGhlbHA7XG59XG4uY3Vyc29yLXBvaW50ZXIge1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uY3Vyc29yLXRleHQge1xuICBjdXJzb3I6IHRleHQ7XG59XG4ucmVzaXplIHtcbiAgcmVzaXplOiBib3RoO1xufVxuLmF1dG8tcm93cy1taW4ge1xuICBncmlkLWF1dG8tcm93czogbWluLWNvbnRlbnQ7XG59XG4uZ3JpZC1jb2xzLTExIHtcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMTEsIG1pbm1heCgwLCAxZnIpKTtcbn1cbi5mbGV4LXJvdyB7XG4gIGZsZXgtZGlyZWN0aW9uOiByb3c7XG59XG4uZmxleC1jb2wge1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xufVxuLml0ZW1zLWNlbnRlciB7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG4uanVzdGlmeS1zdGFydCB7XG4gIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcbn1cbi5qdXN0aWZ5LWNlbnRlciB7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xufVxuLmp1c3RpZnktYmV0d2VlbiB7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2Vlbjtcbn1cbi5qdXN0aWZ5LWFyb3VuZCB7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYXJvdW5kO1xufVxuLmdhcC0xIHtcbiAgZ2FwOiAwLjI1cmVtO1xufVxuLmdhcC0xMCB7XG4gIGdhcDogMi41cmVtO1xufVxuLmdhcC0yIHtcbiAgZ2FwOiAwLjVyZW07XG59XG4uZ2FwLTYge1xuICBnYXA6IDEuNXJlbTtcbn1cbi5vdmVyZmxvdy1hdXRvIHtcbiAgb3ZlcmZsb3c6IGF1dG87XG59XG4ub3ZlcnNjcm9sbC1ub25lIHtcbiAgb3ZlcnNjcm9sbC1iZWhhdmlvcjogbm9uZTtcbn1cbi5yb3VuZGVkLWZ1bGwge1xuICBib3JkZXItcmFkaXVzOiA5OTk5cHg7XG59XG4ucm91bmRlZC1tZCB7XG4gIGJvcmRlci1yYWRpdXM6IDAuMzc1cmVtO1xufVxuLnJvdW5kZWQteGwge1xuICBib3JkZXItcmFkaXVzOiAwLjc1cmVtO1xufVxuLnJvdW5kZWQtdC1tZCB7XG4gIGJvcmRlci10b3AtbGVmdC1yYWRpdXM6IDAuMzc1cmVtO1xuICBib3JkZXItdG9wLXJpZ2h0LXJhZGl1czogMC4zNzVyZW07XG59XG4ucm91bmRlZC1ibC1tZCB7XG4gIGJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXM6IDAuMzc1cmVtO1xufVxuLnJvdW5kZWQtYnItbWQge1xuICBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czogMC4zNzVyZW07XG59XG4uYm9yZGVyIHtcbiAgYm9yZGVyLXdpZHRoOiAxcHg7XG59XG4uYm9yZGVyLTIge1xuICBib3JkZXItd2lkdGg6IDJweDtcbn1cbi5ib3JkZXItc29saWQge1xuICBib3JkZXItc3R5bGU6IHNvbGlkO1xufVxuLmJvcmRlci1ibHVlLTgwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDMwIDY0IDE3NSAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYm9yZGVyLWdyYXktMjAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMjI5IDIzMSAyMzUgLyB2YXIoLS10dy1ib3JkZXItb3BhY2l0eSkpO1xufVxuLmJvcmRlci1ncmF5LTYwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDc1IDg1IDk5IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItZ3JheS04MDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigzMSA0MSA1NSAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYm9yZGVyLWdyZWVuLTYwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDIyIDE2MyA3NCAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYm9yZGVyLW9yYW5nZS00MDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigyNTEgMTQ2IDYwIC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItcmVkLTcwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDE4NSAyOCAyOCAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYm9yZGVyLXRyYW5zcGFyZW50IHtcbiAgYm9yZGVyLWNvbG9yOiB0cmFuc3BhcmVudDtcbn1cbi5iZy1ncmF5LTEwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDI0MyAyNDQgMjQ2IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWdyYXktMjAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjI5IDIzMSAyMzUgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS00MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigxNTYgMTYzIDE3NSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1ncmF5LTUwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDEwNyAxMTQgMTI4IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWdyYXktNjAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoNzUgODUgOTkgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS03MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYig1NSA2NSA4MSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1ncmF5LTgwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDMxIDQxIDU1IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWxpbWUtNTAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTMyIDIwNCAyMiAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1saW1lLTYwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDEwMSAxNjMgMTMgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctbGltZS03MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYig3NyAxMjQgMTUgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctb3JhbmdlLTMwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDI1MyAxODYgMTE2IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLW9yYW5nZS00MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyNTEgMTQ2IDYwIC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLW9yYW5nZS02MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyMzQgODggMTIgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctcmVkLTYwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDIyMCAzOCAzOCAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1yZWQtNzAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTg1IDI4IDI4IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLXJlZC04MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigxNTMgMjcgMjcgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctc2t5LTcwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDMgMTA1IDE2MSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1zbGF0ZS03MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYig1MSA2NSA4NSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1zbGF0ZS04MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigzMCA0MSA1OSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1zbGF0ZS05MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigxNSAyMyA0MiAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy10cmFuc3BhcmVudCB7XG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xufVxuLmJnLW9wYWNpdHktMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMDtcbn1cbi5iZy1vcGFjaXR5LTIwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAwLjI7XG59XG4uYmctb3BhY2l0eS0zMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMC4zO1xufVxuLmJnLW9wYWNpdHktNzAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDAuNztcbn1cbi5iZy1vcGFjaXR5LTgwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAwLjg7XG59XG4uYmctZ3JhZGllbnQtdG8tYmwge1xuICBiYWNrZ3JvdW5kLWltYWdlOiBsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tIGxlZnQsIHZhcigtLXR3LWdyYWRpZW50LXN0b3BzKSk7XG59XG4uYmctZ3JhZGllbnQtdG8tYnIge1xuICBiYWNrZ3JvdW5kLWltYWdlOiBsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tIHJpZ2h0LCB2YXIoLS10dy1ncmFkaWVudC1zdG9wcykpO1xufVxuLmJnLWdyYWRpZW50LXRvLXRyIHtcbiAgYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KHRvIHRvcCByaWdodCwgdmFyKC0tdHctZ3JhZGllbnQtc3RvcHMpKTtcbn1cbi5mcm9tLWdyYXktMzAwIHtcbiAgLS10dy1ncmFkaWVudC1mcm9tOiAjZDFkNWRiIHZhcigtLXR3LWdyYWRpZW50LWZyb20tcG9zaXRpb24pO1xuICAtLXR3LWdyYWRpZW50LXRvOiByZ2IoMjA5IDIxMyAyMTkgLyAwKSB2YXIoLS10dy1ncmFkaWVudC10by1wb3NpdGlvbik7XG4gIC0tdHctZ3JhZGllbnQtc3RvcHM6IHZhcigtLXR3LWdyYWRpZW50LWZyb20pLCB2YXIoLS10dy1ncmFkaWVudC10byk7XG59XG4uZnJvbS1ncmF5LTQwMCB7XG4gIC0tdHctZ3JhZGllbnQtZnJvbTogIzljYTNhZiB2YXIoLS10dy1ncmFkaWVudC1mcm9tLXBvc2l0aW9uKTtcbiAgLS10dy1ncmFkaWVudC10bzogcmdiKDE1NiAxNjMgMTc1IC8gMCkgdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xuICAtLXR3LWdyYWRpZW50LXN0b3BzOiB2YXIoLS10dy1ncmFkaWVudC1mcm9tKSwgdmFyKC0tdHctZ3JhZGllbnQtdG8pO1xufVxuLmZyb20tc2xhdGUtMjAwIHtcbiAgLS10dy1ncmFkaWVudC1mcm9tOiAjZTJlOGYwIHZhcigtLXR3LWdyYWRpZW50LWZyb20tcG9zaXRpb24pO1xuICAtLXR3LWdyYWRpZW50LXRvOiByZ2IoMjI2IDIzMiAyNDAgLyAwKSB2YXIoLS10dy1ncmFkaWVudC10by1wb3NpdGlvbik7XG4gIC0tdHctZ3JhZGllbnQtc3RvcHM6IHZhcigtLXR3LWdyYWRpZW50LWZyb20pLCB2YXIoLS10dy1ncmFkaWVudC10byk7XG59XG4uZnJvbS1zbGF0ZS00MDAge1xuICAtLXR3LWdyYWRpZW50LWZyb206ICM5NGEzYjggdmFyKC0tdHctZ3JhZGllbnQtZnJvbS1wb3NpdGlvbik7XG4gIC0tdHctZ3JhZGllbnQtdG86IHJnYigxNDggMTYzIDE4NCAvIDApIHZhcigtLXR3LWdyYWRpZW50LXRvLXBvc2l0aW9uKTtcbiAgLS10dy1ncmFkaWVudC1zdG9wczogdmFyKC0tdHctZ3JhZGllbnQtZnJvbSksIHZhcigtLXR3LWdyYWRpZW50LXRvKTtcbn1cbi5mcm9tLXNsYXRlLTUwMCB7XG4gIC0tdHctZ3JhZGllbnQtZnJvbTogIzY0NzQ4YiB2YXIoLS10dy1ncmFkaWVudC1mcm9tLXBvc2l0aW9uKTtcbiAgLS10dy1ncmFkaWVudC10bzogcmdiKDEwMCAxMTYgMTM5IC8gMCkgdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xuICAtLXR3LWdyYWRpZW50LXN0b3BzOiB2YXIoLS10dy1ncmFkaWVudC1mcm9tKSwgdmFyKC0tdHctZ3JhZGllbnQtdG8pO1xufVxuLmZyb20tc2xhdGUtNzAwIHtcbiAgLS10dy1ncmFkaWVudC1mcm9tOiAjMzM0MTU1IHZhcigtLXR3LWdyYWRpZW50LWZyb20tcG9zaXRpb24pO1xuICAtLXR3LWdyYWRpZW50LXRvOiByZ2IoNTEgNjUgODUgLyAwKSB2YXIoLS10dy1ncmFkaWVudC10by1wb3NpdGlvbik7XG4gIC0tdHctZ3JhZGllbnQtc3RvcHM6IHZhcigtLXR3LWdyYWRpZW50LWZyb20pLCB2YXIoLS10dy1ncmFkaWVudC10byk7XG59XG4udG8tZ3JheS0xMDAge1xuICAtLXR3LWdyYWRpZW50LXRvOiAjZjNmNGY2IHZhcigtLXR3LWdyYWRpZW50LXRvLXBvc2l0aW9uKTtcbn1cbi50by1ncmF5LTIwMCB7XG4gIC0tdHctZ3JhZGllbnQtdG86ICNlNWU3ZWIgdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xufVxuLnRvLXNsYXRlLTIwMCB7XG4gIC0tdHctZ3JhZGllbnQtdG86ICNlMmU4ZjAgdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xufVxuLnRvLXNsYXRlLTQwMCB7XG4gIC0tdHctZ3JhZGllbnQtdG86ICM5NGEzYjggdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xufVxuLnRvLXNsYXRlLTUwMCB7XG4gIC0tdHctZ3JhZGllbnQtdG86ICM2NDc0OGIgdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xufVxuLnAtMSB7XG4gIHBhZGRpbmc6IDAuMjVyZW07XG59XG4ucC0yIHtcbiAgcGFkZGluZzogMC41cmVtO1xufVxuLnAtNCB7XG4gIHBhZGRpbmc6IDFyZW07XG59XG4ucC02IHtcbiAgcGFkZGluZzogMS41cmVtO1xufVxuLnB4LTMge1xuICBwYWRkaW5nLWxlZnQ6IDAuNzVyZW07XG4gIHBhZGRpbmctcmlnaHQ6IDAuNzVyZW07XG59XG4ucHgtNCB7XG4gIHBhZGRpbmctbGVmdDogMXJlbTtcbiAgcGFkZGluZy1yaWdodDogMXJlbTtcbn1cbi5weC02IHtcbiAgcGFkZGluZy1sZWZ0OiAxLjVyZW07XG4gIHBhZGRpbmctcmlnaHQ6IDEuNXJlbTtcbn1cbi5weS0xIHtcbiAgcGFkZGluZy10b3A6IDAuMjVyZW07XG4gIHBhZGRpbmctYm90dG9tOiAwLjI1cmVtO1xufVxuLnB5LTIge1xuICBwYWRkaW5nLXRvcDogMC41cmVtO1xuICBwYWRkaW5nLWJvdHRvbTogMC41cmVtO1xufVxuLnB5LTQge1xuICBwYWRkaW5nLXRvcDogMXJlbTtcbiAgcGFkZGluZy1ib3R0b206IDFyZW07XG59XG4ucGwtMiB7XG4gIHBhZGRpbmctbGVmdDogMC41cmVtO1xufVxuLnBsLTMge1xuICBwYWRkaW5nLWxlZnQ6IDAuNzVyZW07XG59XG4ucGwtNSB7XG4gIHBhZGRpbmctbGVmdDogMS4yNXJlbTtcbn1cbi5wbC04IHtcbiAgcGFkZGluZy1sZWZ0OiAycmVtO1xufVxuLnRleHQtY2VudGVyIHtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xufVxuLmZvbnQtbW9ubyB7XG4gIGZvbnQtZmFtaWx5OiB1aS1tb25vc3BhY2UsIFNGTW9uby1SZWd1bGFyLCBNZW5sbywgTW9uYWNvLCBDb25zb2xhcywgXCJMaWJlcmF0aW9uIE1vbm9cIiwgXCJDb3VyaWVyIE5ld1wiLCBtb25vc3BhY2U7XG59XG4udGV4dC0yeGwge1xuICBmb250LXNpemU6IDEuNXJlbTtcbiAgbGluZS1oZWlnaHQ6IDJyZW07XG59XG4udGV4dC0zeGwge1xuICBmb250LXNpemU6IDEuODc1cmVtO1xuICBsaW5lLWhlaWdodDogMi4yNXJlbTtcbn1cbi50ZXh0LWxnIHtcbiAgZm9udC1zaXplOiAxLjEyNXJlbTtcbiAgbGluZS1oZWlnaHQ6IDEuNzVyZW07XG59XG4udGV4dC1zbSB7XG4gIGZvbnQtc2l6ZTogMC44NzVyZW07XG4gIGxpbmUtaGVpZ2h0OiAxLjI1cmVtO1xufVxuLmZvbnQtYmxhY2sge1xuICBmb250LXdlaWdodDogOTAwO1xufVxuLmZvbnQtYm9sZCB7XG4gIGZvbnQtd2VpZ2h0OiA3MDA7XG59XG4uZm9udC1zZW1pYm9sZCB7XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG59XG4udHJhY2tpbmctd2lkZSB7XG4gIGxldHRlci1zcGFjaW5nOiAwLjAyNWVtO1xufVxuLnRyYWNraW5nLXdpZGVyIHtcbiAgbGV0dGVyLXNwYWNpbmc6IDAuMDVlbTtcbn1cbi50cmFja2luZy13aWRlc3Qge1xuICBsZXR0ZXItc3BhY2luZzogMC4xZW07XG59XG4udGV4dC1ncmF5LTEwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDI0MyAyNDQgMjQ2IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1ncmF5LTIwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDIyOSAyMzEgMjM1IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1ncmF5LTYwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDc1IDg1IDk5IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1ncmF5LTcwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDU1IDY1IDgxIC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1ncmF5LTgwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDMxIDQxIDU1IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1saW1lLTYwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDEwMSAxNjMgMTMgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LWxpbWUtNzAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoNzcgMTI0IDE1IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1saW1lLTgwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDYzIDk4IDE4IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1vcmFuZ2UtNTAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMjQ5IDExNSAyMiAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtb3JhbmdlLTYwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDIzNCA4OCAxMiAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtb3JhbmdlLTgwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDE1NCA1MiAxOCAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtcmVkLTUwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDIzOSA2OCA2OCAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtcmVkLTcwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDE4NSAyOCAyOCAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtcmVkLTgwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDE1MyAyNyAyNyAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtcm9zZS03MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigxOTAgMTggNjAgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXNreS02MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigyIDEzMiAxOTkgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXNsYXRlLTcwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDUxIDY1IDg1IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC10ZWFsLTkwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDE5IDc4IDc0IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udW5kZXJsaW5lIHtcbiAgdGV4dC1kZWNvcmF0aW9uLWxpbmU6IHVuZGVybGluZTtcbn1cbi5vdXRsaW5lLW5vbmUge1xuICBvdXRsaW5lOiAycHggc29saWQgdHJhbnNwYXJlbnQ7XG4gIG91dGxpbmUtb2Zmc2V0OiAycHg7XG59XG4ub3V0bGluZSB7XG4gIG91dGxpbmUtc3R5bGU6IHNvbGlkO1xufVxuLmJsdXIge1xuICAtLXR3LWJsdXI6IGJsdXIoOHB4KTtcbiAgZmlsdGVyOiB2YXIoLS10dy1ibHVyKSB2YXIoLS10dy1icmlnaHRuZXNzKSB2YXIoLS10dy1jb250cmFzdCkgdmFyKC0tdHctZ3JheXNjYWxlKSB2YXIoLS10dy1odWUtcm90YXRlKSB2YXIoLS10dy1pbnZlcnQpIHZhcigtLXR3LXNhdHVyYXRlKSB2YXIoLS10dy1zZXBpYSkgdmFyKC0tdHctZHJvcC1zaGFkb3cpO1xufVxuLmJsdXItc20ge1xuICAtLXR3LWJsdXI6IGJsdXIoNHB4KTtcbiAgZmlsdGVyOiB2YXIoLS10dy1ibHVyKSB2YXIoLS10dy1icmlnaHRuZXNzKSB2YXIoLS10dy1jb250cmFzdCkgdmFyKC0tdHctZ3JheXNjYWxlKSB2YXIoLS10dy1odWUtcm90YXRlKSB2YXIoLS10dy1pbnZlcnQpIHZhcigtLXR3LXNhdHVyYXRlKSB2YXIoLS10dy1zZXBpYSkgdmFyKC0tdHctZHJvcC1zaGFkb3cpO1xufVxuLmZpbHRlciB7XG4gIGZpbHRlcjogdmFyKC0tdHctYmx1cikgdmFyKC0tdHctYnJpZ2h0bmVzcykgdmFyKC0tdHctY29udHJhc3QpIHZhcigtLXR3LWdyYXlzY2FsZSkgdmFyKC0tdHctaHVlLXJvdGF0ZSkgdmFyKC0tdHctaW52ZXJ0KSB2YXIoLS10dy1zYXR1cmF0ZSkgdmFyKC0tdHctc2VwaWEpIHZhcigtLXR3LWRyb3Atc2hhZG93KTtcbn1cbi5iYWNrZHJvcC1ibHVyLW1kIHtcbiAgLS10dy1iYWNrZHJvcC1ibHVyOiBibHVyKDEycHgpO1xuICAtd2Via2l0LWJhY2tkcm9wLWZpbHRlcjogdmFyKC0tdHctYmFja2Ryb3AtYmx1cikgdmFyKC0tdHctYmFja2Ryb3AtYnJpZ2h0bmVzcykgdmFyKC0tdHctYmFja2Ryb3AtY29udHJhc3QpIHZhcigtLXR3LWJhY2tkcm9wLWdyYXlzY2FsZSkgdmFyKC0tdHctYmFja2Ryb3AtaHVlLXJvdGF0ZSkgdmFyKC0tdHctYmFja2Ryb3AtaW52ZXJ0KSB2YXIoLS10dy1iYWNrZHJvcC1vcGFjaXR5KSB2YXIoLS10dy1iYWNrZHJvcC1zYXR1cmF0ZSkgdmFyKC0tdHctYmFja2Ryb3Atc2VwaWEpO1xuICAgICAgICAgIGJhY2tkcm9wLWZpbHRlcjogdmFyKC0tdHctYmFja2Ryb3AtYmx1cikgdmFyKC0tdHctYmFja2Ryb3AtYnJpZ2h0bmVzcykgdmFyKC0tdHctYmFja2Ryb3AtY29udHJhc3QpIHZhcigtLXR3LWJhY2tkcm9wLWdyYXlzY2FsZSkgdmFyKC0tdHctYmFja2Ryb3AtaHVlLXJvdGF0ZSkgdmFyKC0tdHctYmFja2Ryb3AtaW52ZXJ0KSB2YXIoLS10dy1iYWNrZHJvcC1vcGFjaXR5KSB2YXIoLS10dy1iYWNrZHJvcC1zYXR1cmF0ZSkgdmFyKC0tdHctYmFja2Ryb3Atc2VwaWEpO1xufVxuLmJhY2tkcm9wLWJsdXItc20ge1xuICAtLXR3LWJhY2tkcm9wLWJsdXI6IGJsdXIoNHB4KTtcbiAgLXdlYmtpdC1iYWNrZHJvcC1maWx0ZXI6IHZhcigtLXR3LWJhY2tkcm9wLWJsdXIpIHZhcigtLXR3LWJhY2tkcm9wLWJyaWdodG5lc3MpIHZhcigtLXR3LWJhY2tkcm9wLWNvbnRyYXN0KSB2YXIoLS10dy1iYWNrZHJvcC1ncmF5c2NhbGUpIHZhcigtLXR3LWJhY2tkcm9wLWh1ZS1yb3RhdGUpIHZhcigtLXR3LWJhY2tkcm9wLWludmVydCkgdmFyKC0tdHctYmFja2Ryb3Atb3BhY2l0eSkgdmFyKC0tdHctYmFja2Ryb3Atc2F0dXJhdGUpIHZhcigtLXR3LWJhY2tkcm9wLXNlcGlhKTtcbiAgICAgICAgICBiYWNrZHJvcC1maWx0ZXI6IHZhcigtLXR3LWJhY2tkcm9wLWJsdXIpIHZhcigtLXR3LWJhY2tkcm9wLWJyaWdodG5lc3MpIHZhcigtLXR3LWJhY2tkcm9wLWNvbnRyYXN0KSB2YXIoLS10dy1iYWNrZHJvcC1ncmF5c2NhbGUpIHZhcigtLXR3LWJhY2tkcm9wLWh1ZS1yb3RhdGUpIHZhcigtLXR3LWJhY2tkcm9wLWludmVydCkgdmFyKC0tdHctYmFja2Ryb3Atb3BhY2l0eSkgdmFyKC0tdHctYmFja2Ryb3Atc2F0dXJhdGUpIHZhcigtLXR3LWJhY2tkcm9wLXNlcGlhKTtcbn1cbi5iYWNrZHJvcC1maWx0ZXIge1xuICAtd2Via2l0LWJhY2tkcm9wLWZpbHRlcjogdmFyKC0tdHctYmFja2Ryb3AtYmx1cikgdmFyKC0tdHctYmFja2Ryb3AtYnJpZ2h0bmVzcykgdmFyKC0tdHctYmFja2Ryb3AtY29udHJhc3QpIHZhcigtLXR3LWJhY2tkcm9wLWdyYXlzY2FsZSkgdmFyKC0tdHctYmFja2Ryb3AtaHVlLXJvdGF0ZSkgdmFyKC0tdHctYmFja2Ryb3AtaW52ZXJ0KSB2YXIoLS10dy1iYWNrZHJvcC1vcGFjaXR5KSB2YXIoLS10dy1iYWNrZHJvcC1zYXR1cmF0ZSkgdmFyKC0tdHctYmFja2Ryb3Atc2VwaWEpO1xuICAgICAgICAgIGJhY2tkcm9wLWZpbHRlcjogdmFyKC0tdHctYmFja2Ryb3AtYmx1cikgdmFyKC0tdHctYmFja2Ryb3AtYnJpZ2h0bmVzcykgdmFyKC0tdHctYmFja2Ryb3AtY29udHJhc3QpIHZhcigtLXR3LWJhY2tkcm9wLWdyYXlzY2FsZSkgdmFyKC0tdHctYmFja2Ryb3AtaHVlLXJvdGF0ZSkgdmFyKC0tdHctYmFja2Ryb3AtaW52ZXJ0KSB2YXIoLS10dy1iYWNrZHJvcC1vcGFjaXR5KSB2YXIoLS10dy1iYWNrZHJvcC1zYXR1cmF0ZSkgdmFyKC0tdHctYmFja2Ryb3Atc2VwaWEpO1xufVxuXG4ubmFudW0tZ290aGljLWNvZGluZy1yZWd1bGFyIHtcbiAgZm9udC1mYW1pbHk6IFwiTmFudW0gR290aGljIENvZGluZ1wiLCBtb25vc3BhY2U7XG4gIGZvbnQtd2VpZ2h0OiA0MDA7XG4gIGZvbnQtc3R5bGU6IG5vcm1hbDtcbn1cblxuLm5hbnVtLWdvdGhpYy1jb2RpbmctYm9sZCB7XG4gIGZvbnQtZmFtaWx5OiBcIk5hbnVtIEdvdGhpYyBDb2RpbmdcIiwgbW9ub3NwYWNlO1xuICBmb250LXdlaWdodDogNzAwO1xuICBmb250LXN0eWxlOiBub3JtYWw7XG59XG5cbi5ob3ZlclxcXFw6Ym9yZGVyLWdyYXktODAwOmhvdmVyIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMzEgNDEgNTUgLyB2YXIoLS10dy1ib3JkZXItb3BhY2l0eSkpO1xufVxuXG4uaG92ZXJcXFxcOmJnLWdyYXktMjAwOmhvdmVyIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjI5IDIzMSAyMzUgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG5cbi5ob3ZlclxcXFw6Ymctb3JhbmdlLTUwMDpob3ZlciB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDI0OSAxMTUgMjIgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG5cbi5ob3ZlclxcXFw6dGV4dC1ncmF5LTgwMDpob3ZlciB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDMxIDQxIDU1IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG5cbi5mb2N1c1xcXFw6Ym9yZGVyLTI6Zm9jdXMge1xuICBib3JkZXItd2lkdGg6IDJweDtcbn1cblxuLmZvY3VzXFxcXDpib3JkZXItZ3JheS0yMDA6Zm9jdXMge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigyMjkgMjMxIDIzNSAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG5cbi5mb2N1c1xcXFw6cmluZy0wOmZvY3VzIHtcbiAgLS10dy1yaW5nLW9mZnNldC1zaGFkb3c6IHZhcigtLXR3LXJpbmctaW5zZXQpIDAgMCAwIHZhcigtLXR3LXJpbmctb2Zmc2V0LXdpZHRoKSB2YXIoLS10dy1yaW5nLW9mZnNldC1jb2xvcik7XG4gIC0tdHctcmluZy1zaGFkb3c6IHZhcigtLXR3LXJpbmctaW5zZXQpIDAgMCAwIGNhbGMoMHB4ICsgdmFyKC0tdHctcmluZy1vZmZzZXQtd2lkdGgpKSB2YXIoLS10dy1yaW5nLWNvbG9yKTtcbiAgYm94LXNoYWRvdzogdmFyKC0tdHctcmluZy1vZmZzZXQtc2hhZG93KSwgdmFyKC0tdHctcmluZy1zaGFkb3cpLCB2YXIoLS10dy1zaGFkb3csIDAgMCAjMDAwMCk7XG59XG5gLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9zdHlsZXMuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBOztDQUFjLENBQWQ7OztDQUFjOztBQUFkOzs7RUFBQSxzQkFBYyxFQUFkLE1BQWM7RUFBZCxlQUFjLEVBQWQsTUFBYztFQUFkLG1CQUFjLEVBQWQsTUFBYztFQUFkLHFCQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztFQUFBLGdCQUFjO0FBQUE7O0FBQWQ7Ozs7Ozs7O0NBQWM7O0FBQWQ7O0VBQUEsZ0JBQWMsRUFBZCxNQUFjO0VBQWQsOEJBQWMsRUFBZCxNQUFjO0VBQWQsZ0JBQWMsRUFBZCxNQUFjO0VBQWQsY0FBYztLQUFkLFdBQWMsRUFBZCxNQUFjO0VBQWQsK0hBQWMsRUFBZCxNQUFjO0VBQWQsNkJBQWMsRUFBZCxNQUFjO0VBQWQsK0JBQWMsRUFBZCxNQUFjO0VBQWQsd0NBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7OztDQUFjOztBQUFkO0VBQUEsU0FBYyxFQUFkLE1BQWM7RUFBZCxvQkFBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7OztDQUFjOztBQUFkO0VBQUEsU0FBYyxFQUFkLE1BQWM7RUFBZCxjQUFjLEVBQWQsTUFBYztFQUFkLHFCQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEseUNBQWM7VUFBZCxpQ0FBYztBQUFBOztBQUFkOztDQUFjOztBQUFkOzs7Ozs7RUFBQSxrQkFBYztFQUFkLG9CQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7RUFBQSxjQUFjO0VBQWQsd0JBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDs7RUFBQSxtQkFBYztBQUFBOztBQUFkOzs7OztDQUFjOztBQUFkOzs7O0VBQUEsK0dBQWMsRUFBZCxNQUFjO0VBQWQsNkJBQWMsRUFBZCxNQUFjO0VBQWQsK0JBQWMsRUFBZCxNQUFjO0VBQWQsY0FBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLGNBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDs7RUFBQSxjQUFjO0VBQWQsY0FBYztFQUFkLGtCQUFjO0VBQWQsd0JBQWM7QUFBQTs7QUFBZDtFQUFBLGVBQWM7QUFBQTs7QUFBZDtFQUFBLFdBQWM7QUFBQTs7QUFBZDs7OztDQUFjOztBQUFkO0VBQUEsY0FBYyxFQUFkLE1BQWM7RUFBZCxxQkFBYyxFQUFkLE1BQWM7RUFBZCx5QkFBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7OztDQUFjOztBQUFkOzs7OztFQUFBLG9CQUFjLEVBQWQsTUFBYztFQUFkLDhCQUFjLEVBQWQsTUFBYztFQUFkLGdDQUFjLEVBQWQsTUFBYztFQUFkLGVBQWMsRUFBZCxNQUFjO0VBQWQsb0JBQWMsRUFBZCxNQUFjO0VBQWQsb0JBQWMsRUFBZCxNQUFjO0VBQWQsY0FBYyxFQUFkLE1BQWM7RUFBZCxTQUFjLEVBQWQsTUFBYztFQUFkLFVBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7O0VBQUEsb0JBQWM7QUFBQTs7QUFBZDs7O0NBQWM7O0FBQWQ7Ozs7RUFBQSwwQkFBYyxFQUFkLE1BQWM7RUFBZCw2QkFBYyxFQUFkLE1BQWM7RUFBZCxzQkFBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLGFBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLGdCQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7RUFBQSx3QkFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkOztFQUFBLFlBQWM7QUFBQTs7QUFBZDs7O0NBQWM7O0FBQWQ7RUFBQSw2QkFBYyxFQUFkLE1BQWM7RUFBZCxvQkFBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLHdCQUFjO0FBQUE7O0FBQWQ7OztDQUFjOztBQUFkO0VBQUEsMEJBQWMsRUFBZCxNQUFjO0VBQWQsYUFBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLGtCQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7Ozs7Ozs7Ozs7Ozs7RUFBQSxTQUFjO0FBQUE7O0FBQWQ7RUFBQSxTQUFjO0VBQWQsVUFBYztBQUFBOztBQUFkO0VBQUEsVUFBYztBQUFBOztBQUFkOzs7RUFBQSxnQkFBYztFQUFkLFNBQWM7RUFBZCxVQUFjO0FBQUE7O0FBQWQ7O0NBQWM7QUFBZDtFQUFBLFVBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLGdCQUFjO0FBQUE7O0FBQWQ7OztDQUFjOztBQUFkO0VBQUEsVUFBYyxFQUFkLE1BQWM7RUFBZCxjQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztFQUFBLFVBQWMsRUFBZCxNQUFjO0VBQWQsY0FBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDs7RUFBQSxlQUFj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O0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSx3QkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsMkJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsMkJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsZ0NBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsNERBQW1CO0VBQW5CLHFFQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLDREQUFtQjtFQUFuQixxRUFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSw0REFBbUI7RUFBbkIscUVBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsNERBQW1CO0VBQW5CLHFFQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLDREQUFtQjtFQUFuQixxRUFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSw0REFBbUI7RUFBbkIsa0VBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEscUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsbUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsaUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsaUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsbUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsbUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsbUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSw4QkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsOEJBQW1CO0VBQW5CLCtRQUFtQjtVQUFuQjtBQUFtQjtBQUFuQjtFQUFBLDZCQUFtQjtFQUFuQiwrUUFBbUI7VUFBbkI7QUFBbUI7QUFBbkI7RUFBQSwrUUFBbUI7VUFBbkI7QUFBbUI7O0FBRW5CO0VBQ0UsNkNBQTZDO0VBQzdDLGdCQUFnQjtFQUNoQixrQkFBa0I7QUFDcEI7O0FBRUE7RUFDRSw2Q0FBNkM7RUFDN0MsZ0JBQWdCO0VBQ2hCLGtCQUFrQjtBQUNwQjs7QUFkQTtFQUFBLHNCQWVBO0VBZkE7QUFlQTs7QUFmQTtFQUFBLGtCQWVBO0VBZkE7QUFlQTs7QUFmQTtFQUFBLGtCQWVBO0VBZkE7QUFlQTs7QUFmQTtFQUFBLG9CQWVBO0VBZkE7QUFlQTs7QUFmQTtFQUFBO0FBZUE7O0FBZkE7RUFBQSxzQkFlQTtFQWZBO0FBZUE7O0FBZkE7RUFBQSwyR0FlQTtFQWZBLHlHQWVBO0VBZkE7QUFlQVwiLFwic291cmNlc0NvbnRlbnRcIjpbXCJAdGFpbHdpbmQgYmFzZTtcXG5AdGFpbHdpbmQgY29tcG9uZW50cztcXG5AdGFpbHdpbmQgdXRpbGl0aWVzO1xcblxcbi5uYW51bS1nb3RoaWMtY29kaW5nLXJlZ3VsYXIge1xcbiAgZm9udC1mYW1pbHk6IFxcXCJOYW51bSBHb3RoaWMgQ29kaW5nXFxcIiwgbW9ub3NwYWNlO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gIGZvbnQtc3R5bGU6IG5vcm1hbDtcXG59XFxuXFxuLm5hbnVtLWdvdGhpYy1jb2RpbmctYm9sZCB7XFxuICBmb250LWZhbWlseTogXFxcIk5hbnVtIEdvdGhpYyBDb2RpbmdcXFwiLCBtb25vc3BhY2U7XFxuICBmb250LXdlaWdodDogNzAwO1xcbiAgZm9udC1zdHlsZTogbm9ybWFsO1xcbn1cXG5cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107XG5cbiAgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpO1xuICAgICAgfVxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBjb250ZW50ICs9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSk7XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oXCJcIik7XG4gIH07XG5cbiAgLy8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3RcbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cbiAgICB2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGhpcy5sZW5ndGg7IGsrKykge1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2tdWzBdO1xuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBfayA9IDA7IF9rIDwgbW9kdWxlcy5sZW5ndGg7IF9rKyspIHtcbiAgICAgIHZhciBpdGVtID0gW10uY29uY2F0KG1vZHVsZXNbX2tdKTtcbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobWVkaWEpIHtcbiAgICAgICAgaWYgKCFpdGVtWzJdKSB7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHN1cHBvcnRzKSB7XG4gICAgICAgIGlmICghaXRlbVs0XSkge1xuICAgICAgICAgIGl0ZW1bNF0gPSBcIlwiLmNvbmNhdChzdXBwb3J0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzRdID0gc3VwcG9ydHM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBsaXN0O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlbSkge1xuICB2YXIgY29udGVudCA9IGl0ZW1bMV07XG4gIHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcbiAgaWYgKCFjc3NNYXBwaW5nKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHJldHVybiBbY29udGVudF0uY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuICByZXR1cm4gW2NvbnRlbnRdLmpvaW4oXCJcXG5cIik7XG59OyIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi4vbm9kZV9tb2R1bGVzL3Bvc3Rjc3MtbG9hZGVyL2Rpc3QvY2pzLmpzPz9ydWxlU2V0WzFdLnJ1bGVzWzFdLnVzZVsyXSEuL3N0eWxlcy5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi9ub2RlX21vZHVsZXMvcG9zdGNzcy1sb2FkZXIvZGlzdC9janMuanM/P3J1bGVTZXRbMV0ucnVsZXNbMV0udXNlWzJdIS4vc3R5bGVzLmNzc1wiO1xuICAgICAgIGV4cG9ydCBkZWZhdWx0IGNvbnRlbnQgJiYgY29udGVudC5sb2NhbHMgPyBjb250ZW50LmxvY2FscyA6IHVuZGVmaW5lZDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgc3R5bGVzSW5ET00gPSBbXTtcbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRE9NLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRE9NW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXhCeUlkZW50aWZpZXIgPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM10sXG4gICAgICBzdXBwb3J0czogaXRlbVs0XSxcbiAgICAgIGxheWVyOiBpdGVtWzVdXG4gICAgfTtcbiAgICBpZiAoaW5kZXhCeUlkZW50aWZpZXIgIT09IC0xKSB7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0ucmVmZXJlbmNlcysrO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnVwZGF0ZXIob2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHVwZGF0ZXIgPSBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKTtcbiAgICAgIG9wdGlvbnMuYnlJbmRleCA9IGk7XG4gICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoaSwgMCwge1xuICAgICAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuICAgICAgICB1cGRhdGVyOiB1cGRhdGVyLFxuICAgICAgICByZWZlcmVuY2VzOiAxXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuICByZXR1cm4gaWRlbnRpZmllcnM7XG59XG5mdW5jdGlvbiBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKSB7XG4gIHZhciBhcGkgPSBvcHRpb25zLmRvbUFQSShvcHRpb25zKTtcbiAgYXBpLnVwZGF0ZShvYmopO1xuICB2YXIgdXBkYXRlciA9IGZ1bmN0aW9uIHVwZGF0ZXIobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCAmJiBuZXdPYmouc3VwcG9ydHMgPT09IG9iai5zdXBwb3J0cyAmJiBuZXdPYmoubGF5ZXIgPT09IG9iai5sYXllcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhcGkudXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwaS5yZW1vdmUoKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiB1cGRhdGVyO1xufVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG4gICAgdmFyIG5ld0xhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShuZXdMaXN0LCBvcHRpb25zKTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG4gICAgICBpZiAoc3R5bGVzSW5ET01bX2luZGV4XS5yZWZlcmVuY2VzID09PSAwKSB7XG4gICAgICAgIHN0eWxlc0luRE9NW19pbmRleF0udXBkYXRlcigpO1xuICAgICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIG1lbW8gPSB7fTtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBnZXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgdmFyIHN0eWxlVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpO1xuXG4gICAgLy8gU3BlY2lhbCBjYXNlIHRvIHJldHVybiBoZWFkIG9mIGlmcmFtZSBpbnN0ZWFkIG9mIGlmcmFtZSBpdHNlbGZcbiAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICB9XG4gIHJldHVybiBtZW1vW3RhcmdldF07XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0QnlTZWxlY3RvcihpbnNlcnQsIHN0eWxlKSB7XG4gIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQoaW5zZXJ0KTtcbiAgaWYgKCF0YXJnZXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydCcgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuICB9XG4gIHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEJ5U2VsZWN0b3I7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIG9wdGlvbnMuc2V0QXR0cmlidXRlcyhlbGVtZW50LCBvcHRpb25zLmF0dHJpYnV0ZXMpO1xuICBvcHRpb25zLmluc2VydChlbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xuICByZXR1cm4gZWxlbWVudDtcbn1cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0U3R5bGVFbGVtZW50OyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcyhzdHlsZUVsZW1lbnQpIHtcbiAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSBcInVuZGVmaW5lZFwiID8gX193ZWJwYWNrX25vbmNlX18gOiBudWxsO1xuICBpZiAobm9uY2UpIHtcbiAgICBzdHlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibm9uY2VcIiwgbm9uY2UpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlczsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gXCJcIjtcbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KG9iai5zdXBwb3J0cywgXCIpIHtcIik7XG4gIH1cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIkBtZWRpYSBcIi5jb25jYXQob2JqLm1lZGlhLCBcIiB7XCIpO1xuICB9XG4gIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2Ygb2JqLmxheWVyICE9PSBcInVuZGVmaW5lZFwiO1xuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwiQGxheWVyXCIuY29uY2F0KG9iai5sYXllci5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KG9iai5sYXllcikgOiBcIlwiLCBcIiB7XCIpO1xuICB9XG4gIGNzcyArPSBvYmouY3NzO1xuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcbiAgaWYgKHNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9XG5cbiAgLy8gRm9yIG9sZCBJRVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG4gIG9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG59XG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGVFbGVtZW50LnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgc3R5bGVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50KTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBkb21BUEkob3B0aW9ucykge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKCkge30sXG4gICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgfTtcbiAgfVxuICB2YXIgc3R5bGVFbGVtZW50ID0gb3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gIHJldHVybiB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUob2JqKSB7XG4gICAgICBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaik7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuICAgIH1cbiAgfTtcbn1cbm1vZHVsZS5leHBvcnRzID0gZG9tQVBJOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50KSB7XG4gIGlmIChzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICBzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgIH1cbiAgICBzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gc3R5bGVUYWdUcmFuc2Zvcm07IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHRpZDogbW9kdWxlSWQsXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsInZhciB3ZWJwYWNrUXVldWVzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiID8gU3ltYm9sKFwid2VicGFjayBxdWV1ZXNcIikgOiBcIl9fd2VicGFja19xdWV1ZXNfX1wiO1xudmFyIHdlYnBhY2tFeHBvcnRzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiID8gU3ltYm9sKFwid2VicGFjayBleHBvcnRzXCIpIDogXCJfX3dlYnBhY2tfZXhwb3J0c19fXCI7XG52YXIgd2VicGFja0Vycm9yID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiID8gU3ltYm9sKFwid2VicGFjayBlcnJvclwiKSA6IFwiX193ZWJwYWNrX2Vycm9yX19cIjtcbnZhciByZXNvbHZlUXVldWUgPSAocXVldWUpID0+IHtcblx0aWYocXVldWUgJiYgcXVldWUuZCA8IDEpIHtcblx0XHRxdWV1ZS5kID0gMTtcblx0XHRxdWV1ZS5mb3JFYWNoKChmbikgPT4gKGZuLnItLSkpO1xuXHRcdHF1ZXVlLmZvckVhY2goKGZuKSA9PiAoZm4uci0tID8gZm4ucisrIDogZm4oKSkpO1xuXHR9XG59XG52YXIgd3JhcERlcHMgPSAoZGVwcykgPT4gKGRlcHMubWFwKChkZXApID0+IHtcblx0aWYoZGVwICE9PSBudWxsICYmIHR5cGVvZiBkZXAgPT09IFwib2JqZWN0XCIpIHtcblx0XHRpZihkZXBbd2VicGFja1F1ZXVlc10pIHJldHVybiBkZXA7XG5cdFx0aWYoZGVwLnRoZW4pIHtcblx0XHRcdHZhciBxdWV1ZSA9IFtdO1xuXHRcdFx0cXVldWUuZCA9IDA7XG5cdFx0XHRkZXAudGhlbigocikgPT4ge1xuXHRcdFx0XHRvYmpbd2VicGFja0V4cG9ydHNdID0gcjtcblx0XHRcdFx0cmVzb2x2ZVF1ZXVlKHF1ZXVlKTtcblx0XHRcdH0sIChlKSA9PiB7XG5cdFx0XHRcdG9ialt3ZWJwYWNrRXJyb3JdID0gZTtcblx0XHRcdFx0cmVzb2x2ZVF1ZXVlKHF1ZXVlKTtcblx0XHRcdH0pO1xuXHRcdFx0dmFyIG9iaiA9IHt9O1xuXHRcdFx0b2JqW3dlYnBhY2tRdWV1ZXNdID0gKGZuKSA9PiAoZm4ocXVldWUpKTtcblx0XHRcdHJldHVybiBvYmo7XG5cdFx0fVxuXHR9XG5cdHZhciByZXQgPSB7fTtcblx0cmV0W3dlYnBhY2tRdWV1ZXNdID0geCA9PiB7fTtcblx0cmV0W3dlYnBhY2tFeHBvcnRzXSA9IGRlcDtcblx0cmV0dXJuIHJldDtcbn0pKTtcbl9fd2VicGFja19yZXF1aXJlX18uYSA9IChtb2R1bGUsIGJvZHksIGhhc0F3YWl0KSA9PiB7XG5cdHZhciBxdWV1ZTtcblx0aGFzQXdhaXQgJiYgKChxdWV1ZSA9IFtdKS5kID0gLTEpO1xuXHR2YXIgZGVwUXVldWVzID0gbmV3IFNldCgpO1xuXHR2YXIgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzO1xuXHR2YXIgY3VycmVudERlcHM7XG5cdHZhciBvdXRlclJlc29sdmU7XG5cdHZhciByZWplY3Q7XG5cdHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlaikgPT4ge1xuXHRcdHJlamVjdCA9IHJlajtcblx0XHRvdXRlclJlc29sdmUgPSByZXNvbHZlO1xuXHR9KTtcblx0cHJvbWlzZVt3ZWJwYWNrRXhwb3J0c10gPSBleHBvcnRzO1xuXHRwcm9taXNlW3dlYnBhY2tRdWV1ZXNdID0gKGZuKSA9PiAocXVldWUgJiYgZm4ocXVldWUpLCBkZXBRdWV1ZXMuZm9yRWFjaChmbiksIHByb21pc2VbXCJjYXRjaFwiXSh4ID0+IHt9KSk7XG5cdG1vZHVsZS5leHBvcnRzID0gcHJvbWlzZTtcblx0Ym9keSgoZGVwcykgPT4ge1xuXHRcdGN1cnJlbnREZXBzID0gd3JhcERlcHMoZGVwcyk7XG5cdFx0dmFyIGZuO1xuXHRcdHZhciBnZXRSZXN1bHQgPSAoKSA9PiAoY3VycmVudERlcHMubWFwKChkKSA9PiB7XG5cdFx0XHRpZihkW3dlYnBhY2tFcnJvcl0pIHRocm93IGRbd2VicGFja0Vycm9yXTtcblx0XHRcdHJldHVybiBkW3dlYnBhY2tFeHBvcnRzXTtcblx0XHR9KSlcblx0XHR2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cdFx0XHRmbiA9ICgpID0+IChyZXNvbHZlKGdldFJlc3VsdCkpO1xuXHRcdFx0Zm4uciA9IDA7XG5cdFx0XHR2YXIgZm5RdWV1ZSA9IChxKSA9PiAocSAhPT0gcXVldWUgJiYgIWRlcFF1ZXVlcy5oYXMocSkgJiYgKGRlcFF1ZXVlcy5hZGQocSksIHEgJiYgIXEuZCAmJiAoZm4ucisrLCBxLnB1c2goZm4pKSkpO1xuXHRcdFx0Y3VycmVudERlcHMubWFwKChkZXApID0+IChkZXBbd2VicGFja1F1ZXVlc10oZm5RdWV1ZSkpKTtcblx0XHR9KTtcblx0XHRyZXR1cm4gZm4uciA/IHByb21pc2UgOiBnZXRSZXN1bHQoKTtcblx0fSwgKGVycikgPT4gKChlcnIgPyByZWplY3QocHJvbWlzZVt3ZWJwYWNrRXJyb3JdID0gZXJyKSA6IG91dGVyUmVzb2x2ZShleHBvcnRzKSksIHJlc29sdmVRdWV1ZShxdWV1ZSkpKTtcblx0cXVldWUgJiYgcXVldWUuZCA8IDAgJiYgKHF1ZXVlLmQgPSAwKTtcbn07IiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5uYyA9IHVuZGVmaW5lZDsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIHVzZWQgJ21vZHVsZScgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvaW5kZXguanNcIik7XG4iLCIiXSwibmFtZXMiOlsiR2FtZWJvYXJkIiwiZ3JpZCIsInNoaXBzVG9QbGFjZSIsInNoaXBUeXBlIiwic2hpcExlbmd0aCIsImhpdEJnQ2xyIiwiaGl0VGV4dENsciIsIm1pc3NCZ0NsciIsIm1pc3NUZXh0Q2xyIiwiZXJyb3JUZXh0Q2xyIiwiZGVmYXVsdFRleHRDbHIiLCJwcmltYXJ5SG92ZXJDbHIiLCJoaWdobGlnaHRDbHIiLCJjdXJyZW50T3JpZW50YXRpb24iLCJjdXJyZW50U2hpcCIsImxhc3RIb3ZlcmVkQ2VsbCIsInBsYWNlU2hpcEd1aWRlIiwicHJvbXB0IiwicHJvbXB0VHlwZSIsImdhbWVwbGF5R3VpZGUiLCJ0dXJuUHJvbXB0IiwicHJvY2Vzc0NvbW1hbmQiLCJjb21tYW5kIiwiaXNNb3ZlIiwicGFydHMiLCJzcGxpdCIsImxlbmd0aCIsIkVycm9yIiwiZ3JpZFBvc2l0aW9uIiwidG9VcHBlckNhc2UiLCJ2YWxpZEdyaWRQb3NpdGlvbnMiLCJmbGF0IiwiaW5jbHVkZXMiLCJyZXN1bHQiLCJvcmllbnRhdGlvbiIsInRvTG93ZXJDYXNlIiwidXBkYXRlT3V0cHV0IiwibWVzc2FnZSIsInR5cGUiLCJvdXRwdXQiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwibWVzc2FnZUVsZW1lbnQiLCJjcmVhdGVFbGVtZW50IiwidGV4dENvbnRlbnQiLCJjbGFzc0xpc3QiLCJhZGQiLCJhcHBlbmRDaGlsZCIsInNjcm9sbFRvcCIsInNjcm9sbEhlaWdodCIsImNvbnNvbGVMb2dQbGFjZW1lbnRDb21tYW5kIiwiZGlyRmVlYmFjayIsImNoYXJBdCIsInNsaWNlIiwiY29uc29sZSIsImxvZyIsInZhbHVlIiwiY29uc29sZUxvZ01vdmVDb21tYW5kIiwicmVzdWx0c09iamVjdCIsInBsYXllciIsIm1vdmUiLCJoaXQiLCJjb25zb2xlTG9nU2hpcFNpbmsiLCJjb25zb2xlTG9nRXJyb3IiLCJlcnJvciIsImluaXRVaU1hbmFnZXIiLCJ1aU1hbmFnZXIiLCJpbml0Q29uc29sZVVJIiwiY3JlYXRlR2FtZWJvYXJkIiwiY2FsY3VsYXRlU2hpcENlbGxzIiwic3RhcnRDZWxsIiwiY2VsbElkcyIsInJvd0luZGV4IiwiY2hhckNvZGVBdCIsImNvbEluZGV4IiwicGFyc2VJbnQiLCJzdWJzdHJpbmciLCJpIiwicHVzaCIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsImhpZ2hsaWdodENlbGxzIiwiZm9yRWFjaCIsImNlbGxJZCIsImNlbGxFbGVtZW50IiwicXVlcnlTZWxlY3RvciIsImNsZWFySGlnaGxpZ2h0IiwicmVtb3ZlIiwidG9nZ2xlT3JpZW50YXRpb24iLCJoYW5kbGVQbGFjZW1lbnRIb3ZlciIsImUiLCJjZWxsIiwidGFyZ2V0IiwiY29udGFpbnMiLCJkYXRhc2V0IiwiY2VsbFBvcyIsInBvc2l0aW9uIiwiY2VsbHNUb0hpZ2hsaWdodCIsImhhbmRsZU1vdXNlTGVhdmUiLCJjZWxsc1RvQ2xlYXIiLCJoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSIsInByZXZlbnREZWZhdWx0Iiwia2V5Iiwib2xkQ2VsbHNUb0NsZWFyIiwibmV3Q2VsbHNUb0hpZ2hsaWdodCIsImVuYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIiLCJxdWVyeVNlbGVjdG9yQWxsIiwiZGlzYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIiLCJjZWxsc0FycmF5IiwiZGlzYWJsZUh1bWFuR2FtZWJvYXJkSG92ZXIiLCJzd2l0Y2hHYW1lYm9hcmRIb3ZlclN0YXRlcyIsInNldHVwR2FtZWJvYXJkRm9yUGxhY2VtZW50IiwiY29tcEdhbWVib2FyZENlbGxzIiwiYWRkRXZlbnRMaXN0ZW5lciIsImdhbWVib2FyZEFyZWEiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiY2xlYW51cEFmdGVyUGxhY2VtZW50Iiwic3RhcnRHYW1lIiwiZ2FtZSIsInNldFVwIiwic2hpcCIsInJlbmRlclNoaXBEaXNwIiwicGxheWVycyIsImNvbXB1dGVyIiwiZGlzcGxheVByb21wdCIsImNvbmNsdWRlR2FtZSIsIndpbm5lciIsIkFjdGlvbkNvbnRyb2xsZXIiLCJodW1hblBsYXllciIsImh1bWFuIiwiaHVtYW5QbGF5ZXJHYW1lYm9hcmQiLCJnYW1lYm9hcmQiLCJjb21wUGxheWVyIiwiY29tcFBsYXllckdhbWVib2FyZCIsInNldHVwRXZlbnRMaXN0ZW5lcnMiLCJoYW5kbGVyRnVuY3Rpb24iLCJwbGF5ZXJUeXBlIiwiY2xlYW51cEZ1bmN0aW9ucyIsImNvbnNvbGVTdWJtaXRCdXR0b24iLCJjb25zb2xlSW5wdXQiLCJzdWJtaXRIYW5kbGVyIiwiaW5wdXQiLCJrZXlwcmVzc0hhbmRsZXIiLCJjbGlja0hhbmRsZXIiLCJjbGVhbnVwIiwicHJvbXB0QW5kUGxhY2VTaGlwIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJmaW5kIiwicGxhY2VTaGlwUHJvbXB0IiwiaGFuZGxlVmFsaWRJbnB1dCIsInBsYWNlU2hpcCIsInJlbmRlclNoaXBCb2FyZCIsInJlc29sdmVTaGlwUGxhY2VtZW50Iiwic2V0dXBTaGlwc1NlcXVlbnRpYWxseSIsImhhbmRsZVNldHVwIiwidXBkYXRlQ29tcHV0ZXJEaXNwbGF5cyIsImh1bWFuTW92ZVJlc3VsdCIsInBsYXllclNlbGVjdG9yIiwidXBkYXRlU2hpcFNlY3Rpb24iLCJwcm9tcHRQbGF5ZXJNb3ZlIiwiY29tcE1vdmVSZXN1bHQiLCJ1bmRlZmluZWQiLCJoYW5kbGVWYWxpZE1vdmUiLCJtYWtlTW92ZSIsInJlc29sdmVNb3ZlIiwiY29tcHV0ZXJNb3ZlIiwiY2hlY2tTaGlwSXNTdW5rIiwiaXNTaGlwU3VuayIsImNoZWNrV2luQ29uZGl0aW9uIiwiY2hlY2tBbGxTaGlwc1N1bmsiLCJwbGF5R2FtZSIsImdhbWVPdmVyIiwibGFzdENvbXBNb3ZlUmVzdWx0IiwibGFzdEh1bWFuTW92ZVJlc3VsdCIsImlzU3VuayIsInJlbmRlclN1bmtlblNoaXAiLCJPdmVybGFwcGluZ1NoaXBzRXJyb3IiLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJTaGlwQWxsb2NhdGlvblJlYWNoZWRFcnJvciIsIlNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvciIsIkludmFsaWRTaGlwTGVuZ3RoRXJyb3IiLCJJbnZhbGlkU2hpcFR5cGVFcnJvciIsIkludmFsaWRQbGF5ZXJUeXBlRXJyb3IiLCJTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvciIsIlJlcGVhdEF0dGFja2VkRXJyb3IiLCJJbnZhbGlkTW92ZUVudHJ5RXJyb3IiLCJQbGF5ZXIiLCJTaGlwIiwiR2FtZSIsImh1bWFuR2FtZWJvYXJkIiwiY29tcHV0ZXJHYW1lYm9hcmQiLCJjb21wdXRlclBsYXllciIsImN1cnJlbnRQbGF5ZXIiLCJnYW1lT3ZlclN0YXRlIiwicGxhY2VTaGlwcyIsImVuZEdhbWUiLCJ0YWtlVHVybiIsImZlZWRiYWNrIiwib3Bwb25lbnQiLCJnYW1lV29uIiwiaW5kZXhDYWxjcyIsInN0YXJ0IiwiY29sTGV0dGVyIiwicm93TnVtYmVyIiwiY2hlY2tUeXBlIiwic2hpcFBvc2l0aW9ucyIsIk9iamVjdCIsImtleXMiLCJleGlzdGluZ1NoaXBUeXBlIiwiY2hlY2tCb3VuZGFyaWVzIiwiY29vcmRzIiwiZGlyZWN0aW9uIiwieExpbWl0IiwieUxpbWl0IiwieCIsInkiLCJjYWxjdWxhdGVTaGlwUG9zaXRpb25zIiwicG9zaXRpb25zIiwiY2hlY2tGb3JPdmVybGFwIiwiZW50cmllcyIsImV4aXN0aW5nU2hpcFBvc2l0aW9ucyIsInNvbWUiLCJjaGVja0ZvckhpdCIsImZvdW5kU2hpcCIsIl8iLCJzaGlwRmFjdG9yeSIsInNoaXBzIiwiaGl0UG9zaXRpb25zIiwiYXR0YWNrTG9nIiwibmV3U2hpcCIsImF0dGFjayIsInJlc3BvbnNlIiwiY2hlY2tSZXN1bHRzIiwiZXZlcnkiLCJzaGlwUmVwb3J0IiwiZmxvYXRpbmdTaGlwcyIsImZpbHRlciIsIm1hcCIsImdldFNoaXAiLCJnZXRTaGlwUG9zaXRpb25zIiwiZ2V0SGl0UG9zaXRpb25zIiwiVWlNYW5hZ2VyIiwic3R5bGUiLCJ2aXNpYmlsaXR5IiwibmV3VWlNYW5hZ2VyIiwibmV3R2FtZSIsImFjdENvbnRyb2xsZXIiLCJjaGVja01vdmUiLCJnYkdyaWQiLCJ2YWxpZCIsImVsIiwicCIsInJhbmRNb3ZlIiwibW92ZUxvZyIsImFsbE1vdmVzIiwiZmxhdE1hcCIsInJvdyIsInBvc3NpYmxlTW92ZXMiLCJyYW5kb21Nb3ZlIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiZ2VuZXJhdGVSYW5kb21TdGFydCIsInNpemUiLCJ2YWxpZFN0YXJ0cyIsImNvbCIsInJhbmRvbUluZGV4IiwiYXV0b1BsYWNlbWVudCIsInNoaXBUeXBlcyIsInBsYWNlZCIsIm9wcEdhbWVib2FyZCIsInNldExlbmd0aCIsImhpdHMiLCJ0dyIsInN0cmluZ3MiLCJ2YWx1ZXMiLCJyYXciLCJpbnN0cnVjdGlvbkNsciIsImd1aWRlQ2xyIiwiZXJyb3JDbHIiLCJkZWZhdWx0Q2xyIiwiY2VsbENsciIsImlucHV0Q2xyIiwiaW5wdXRUZXh0Q2xyIiwib3VwdXRDbHIiLCJidXR0b25DbHIiLCJidXR0b25UZXh0Q2xyIiwic2hpcFNlY3RDbHIiLCJzaGlwSGl0Q2xyIiwic2hpcFN1bmtDbHIiLCJidWlsZFNoaXAiLCJvYmoiLCJkb21TZWwiLCJzaGlwU2VjdHMiLCJzZWN0IiwiY2xhc3NOYW1lIiwic2V0QXR0cmlidXRlIiwiY29udGFpbmVySUQiLCJjb250YWluZXIiLCJncmlkRGl2IiwiY29sdW1ucyIsImhlYWRlciIsInJvd0xhYmVsIiwiaWQiLCJjb25zb2xlQ29udGFpbmVyIiwiaW5wdXREaXYiLCJzdWJtaXRCdXR0b24iLCJwcm9tcHRPYmpzIiwiZGlzcGxheSIsImZpcnN0Q2hpbGQiLCJyZW1vdmVDaGlsZCIsInByb21wdERpdiIsInBsYXllck9iaiIsImlkU2VsIiwiZGlzcERpdiIsInNoaXBEaXYiLCJ0aXRsZSIsInNlY3RzRGl2Iiwic2hpcE9iaiIsInNoaXBTZWN0Iiwic2VjdGlvbiIsInBvcyIsIm5ld0NsciIsInBsYXllcklkIiwic2hpcFNlY3REaXNwbGF5RWwiLCJzaGlwU2VjdEJvYXJkRWwiXSwic291cmNlUm9vdCI6IiJ9