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
  updateOutput(message, winner === "human" ? "valid" : "error");

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
const shipHitClr = "bg-red-600";
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
    input.className = `p-1 flex-1 rounded-bl-md`; // Add TailwindCSS classes
    input.classList.add(inputClr);
    const submitButton = document.createElement("button"); // Create a button element for the console submit
    submitButton.textContent = "Submit"; // Add the text "Submit" to the button
    submitButton.setAttribute("id", "console-submit"); // Set the id for the button
    submitButton.className = `px-3 py-1 text-center text-sm rounded-br-md`; // Add TailwindCSS classes
    submitButton.classList.add(buttonClr);
    submitButton.classList.add(buttonTextClr);
    const output = document.createElement("div"); // Create an div element for the output of the console
    output.setAttribute("id", "console-output"); // Set the id for the output element
    output.className = `p-1 flex-1 h-4/5 overflow-auto rounded-t-md bg-gradient-to-tr from-gray-300 to-gray-100`; // Add TailwindCSS classes
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
.border-solid {
  border-style: solid;
}
.border-blue-800 {
  --tw-border-opacity: 1;
  border-color: rgb(30 64 175 / var(--tw-border-opacity));
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
.bg-red-600 {
  --tw-bg-opacity: 1;
  background-color: rgb(220 38 38 / var(--tw-bg-opacity));
}
.bg-red-700 {
  --tw-bg-opacity: 1;
  background-color: rgb(185 28 28 / var(--tw-bg-opacity));
}
.bg-sky-700 {
  --tw-bg-opacity: 1;
  background-color: rgb(3 105 161 / var(--tw-bg-opacity));
}
.bg-slate-700 {
  --tw-bg-opacity: 1;
  background-color: rgb(51 65 85 / var(--tw-bg-opacity));
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
.to-gray-100 {
  --tw-gradient-to: #f3f4f6 var(--tw-gradient-to-position);
}
.to-gray-200 {
  --tw-gradient-to: #e5e7eb var(--tw-gradient-to-position);
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
}`, "",{"version":3,"sources":["webpack://./src/styles.css"],"names":[],"mappings":"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;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,wBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,2BAAmB;EAAnB;AAAmB;AAAnB;EAAA,2BAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,gCAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,4DAAmB;EAAnB,qEAAmB;EAAnB;AAAmB;AAAnB;EAAA,4DAAmB;EAAnB,qEAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,qBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,mBAAmB;EAAnB;AAAmB;AAAnB;EAAA,iBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,mBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAFnB;EAAA,kBAEoB;EAFpB;AAEoB","sourcesContent":["@tailwind base;\n@tailwind components;\n@tailwind utilities;"],"sourceRoot":""}]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQzdELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQzlEO0FBRUQsTUFBTTBNLFVBQVUsR0FBSUMsS0FBSyxJQUFLO0VBQzVCLE1BQU1DLFNBQVMsR0FBR0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDL0ssV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQzFDLE1BQU1pTCxTQUFTLEdBQUduSSxRQUFRLENBQUNpSSxLQUFLLENBQUN2SixLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzs7RUFFaEQsTUFBTXFCLFFBQVEsR0FBR21JLFNBQVMsQ0FBQ3BJLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUNBLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQzlELE1BQU1ELFFBQVEsR0FBR3NJLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7RUFFaEMsT0FBTyxDQUFDcEksUUFBUSxFQUFFRixRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQy9C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O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsY0FBYztBQUNkLGtCQUFrQjtBQUNsQjs7QUFFQTtBQUNBO0FBQ0EsY0FBYztBQUNkLGtCQUFrQjtBQUNsQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQiwwQkFBMEI7QUFDMUI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLE9BQU8sa0ZBQWtGLFlBQVksTUFBTSxPQUFPLHFCQUFxQixvQkFBb0IscUJBQXFCLHFCQUFxQixNQUFNLE1BQU0sV0FBVyxNQUFNLFlBQVksTUFBTSxNQUFNLHFCQUFxQixxQkFBcUIscUJBQXFCLFVBQVUsb0JBQW9CLHFCQUFxQixxQkFBcUIscUJBQXFCLHFCQUFxQixNQUFNLE9BQU8sTUFBTSxLQUFLLG9CQUFvQixxQkFBcUIsTUFBTSxRQUFRLE1BQU0sS0FBSyxvQkFBb0Isb0JBQW9CLHFCQUFxQixNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsV0FBVyxNQUFNLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxNQUFNLE1BQU0sTUFBTSxLQUFLLFVBQVUsV0FBVyxNQUFNLE1BQU0sTUFBTSxNQUFNLFdBQVcsTUFBTSxTQUFTLE1BQU0sUUFBUSxxQkFBcUIscUJBQXFCLHFCQUFxQixvQkFBb0IsTUFBTSxNQUFNLE1BQU0sS0FBSyxVQUFVLE1BQU0sTUFBTSxNQUFNLE1BQU0sVUFBVSxVQUFVLFdBQVcsV0FBVyxNQUFNLEtBQUssVUFBVSxNQUFNLEtBQUssVUFBVSxNQUFNLFFBQVEsTUFBTSxLQUFLLG9CQUFvQixxQkFBcUIscUJBQXFCLE1BQU0sUUFBUSxNQUFNLFNBQVMscUJBQXFCLHFCQUFxQixxQkFBcUIsb0JBQW9CLHFCQUFxQixxQkFBcUIsb0JBQW9CLG9CQUFvQixvQkFBb0IsTUFBTSxNQUFNLE1BQU0sTUFBTSxXQUFXLE1BQU0sT0FBTyxNQUFNLFFBQVEscUJBQXFCLHFCQUFxQixxQkFBcUIsTUFBTSxNQUFNLE1BQU0sS0FBSyxVQUFVLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLE1BQU0sTUFBTSxVQUFVLE1BQU0sT0FBTyxNQUFNLEtBQUsscUJBQXFCLHFCQUFxQixNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxPQUFPLE1BQU0sS0FBSyxxQkFBcUIsb0JBQW9CLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sTUFBTSxpQkFBaUIsVUFBVSxNQUFNLEtBQUssVUFBVSxVQUFVLE1BQU0sS0FBSyxVQUFVLE1BQU0sT0FBTyxXQUFXLFVBQVUsVUFBVSxNQUFNLE1BQU0sS0FBSyxLQUFLLFVBQVUsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sT0FBTyxNQUFNLEtBQUssb0JBQW9CLG9CQUFvQixNQUFNLE1BQU0sb0JBQW9CLG9CQUFvQixNQUFNLE1BQU0sTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLEtBQUssS0FBSyxVQUFVLE1BQU0sUUFBUSxNQUFNLFlBQVksb0JBQW9CLHFCQUFxQixNQUFNLE1BQU0sTUFBTSxNQUFNLFVBQVUsVUFBVSxNQUFNLFdBQVcsS0FBSyxVQUFVLE1BQU0sS0FBSyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLEtBQUssTUFBTSxLQUFLLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsS0FBSyxLQUFLLEtBQUssS0FBSyxNQUFNLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0s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QUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7V0NOQTs7Ozs7VUVBQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9hY3Rpb25Db250cm9sbGVyLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9lcnJvcnMuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2dhbWUuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2dhbWVib2FyZC5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3BsYXllci5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvc2hpcC5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvdWlNYW5hZ2VyLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9zdHlsZXMuY3NzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3N0eWxlcy5jc3M/MGEyNSIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2FzeW5jIG1vZHVsZSIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL25vbmNlIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgR2FtZWJvYXJkIGZyb20gXCIuL2dhbWVib2FyZFwiO1xuXG5jb25zdCB7IGdyaWQgfSA9IEdhbWVib2FyZCgpO1xuXG5jb25zdCBzaGlwc1RvUGxhY2UgPSBbXG4gIHsgc2hpcFR5cGU6IFwiY2FycmllclwiLCBzaGlwTGVuZ3RoOiA1IH0sXG4gIHsgc2hpcFR5cGU6IFwiYmF0dGxlc2hpcFwiLCBzaGlwTGVuZ3RoOiA0IH0sXG4gIHsgc2hpcFR5cGU6IFwic3VibWFyaW5lXCIsIHNoaXBMZW5ndGg6IDMgfSxcbiAgeyBzaGlwVHlwZTogXCJjcnVpc2VyXCIsIHNoaXBMZW5ndGg6IDMgfSxcbiAgeyBzaGlwVHlwZTogXCJkZXN0cm95ZXJcIiwgc2hpcExlbmd0aDogMiB9LFxuXTtcblxuY29uc3QgaGl0QmdDbHIgPSBcImJnLWxpbWUtNjAwXCI7XG5jb25zdCBoaXRUZXh0Q2xyID0gXCJ0ZXh0LWxpbWUtNjAwXCI7XG5jb25zdCBtaXNzQmdDbHIgPSBcImJnLXJlZC03MDBcIjtcbmNvbnN0IG1pc3NUZXh0Q2xyID0gXCJ0ZXh0LW9yYW5nZS02MDBcIjtcbmNvbnN0IGVycm9yVGV4dENsciA9IFwidGV4dC1yZWQtNzAwXCI7XG5jb25zdCBkZWZhdWx0VGV4dENsciA9IFwidGV4dC1ncmF5LTYwMFwiO1xuXG5jb25zdCBwcmltYXJ5SG92ZXJDbHIgPSBcImhvdmVyOmJnLW9yYW5nZS01MDBcIjtcbmNvbnN0IGhpZ2hsaWdodENsciA9IFwiYmctb3JhbmdlLTMwMFwiO1xuXG5sZXQgY3VycmVudE9yaWVudGF0aW9uID0gXCJoXCI7IC8vIERlZmF1bHQgb3JpZW50YXRpb25cbmxldCBjdXJyZW50U2hpcDtcbmxldCBsYXN0SG92ZXJlZENlbGwgPSBudWxsOyAvLyBTdG9yZSB0aGUgbGFzdCBob3ZlcmVkIGNlbGwncyBJRFxuXG5jb25zdCBwbGFjZVNoaXBHdWlkZSA9IHtcbiAgcHJvbXB0OlxuICAgIFwiRW50ZXIgdGhlIGdyaWQgcG9zaXRpb24gKGkuZS4gJ0ExJykgYW5kIG9yaWVudGF0aW9uICgnaCcgZm9yIGhvcml6b250YWwgYW5kICd2JyBmb3IgdmVydGljYWwpLCBzZXBhcmF0ZWQgd2l0aCBhIHNwYWNlLiBGb3IgZXhhbXBsZSAnQTIgdicuIEFsdGVybmF0aXZlbHksIG9uIHlvdSBnYW1lYm9hcmQgY2xpY2sgdGhlIGNlbGwgeW91IHdhbnQgdG8gc2V0IGF0IHRoZSBzdGFydGluZyBwb2ludCwgdXNlIHNwYWNlYmFyIHRvIHRvZ2dsZSB0aGUgb3JpZW50YXRpb24uXCIsXG4gIHByb21wdFR5cGU6IFwiZ3VpZGVcIixcbn07XG5cbmNvbnN0IGdhbWVwbGF5R3VpZGUgPSB7XG4gIHByb21wdDpcbiAgICBcIkVudGVyIGdyaWQgcG9zaXRpb24gKGkuZS4gJ0ExJykgeW91IHdhbnQgdG8gYXR0YWNrLiBBbHRlcm5hdGl2ZWx5LCBjbGljayB0aGUgY2VsbCB5b3Ugd2FudCB0byBhdHRhY2sgb24gdGhlIG9wcG9uZW50J3MgZ2FtZWJvYXJkXCIsXG4gIHByb21wdFR5cGU6IFwiZ3VpZGVcIixcbn07XG5cbmNvbnN0IHR1cm5Qcm9tcHQgPSB7XG4gIHByb21wdDogXCJNYWtlIHlvdXIgbW92ZS5cIixcbiAgcHJvbXB0VHlwZTogXCJpbnN0cnVjdGlvblwiLFxufTtcblxuY29uc3QgcHJvY2Vzc0NvbW1hbmQgPSAoY29tbWFuZCwgaXNNb3ZlKSA9PiB7XG4gIC8vIElmIGlzTW92ZSBpcyB0cnV0aHksIGFzc2lnbiBhcyBzaW5nbGUgaXRlbSBhcnJheSwgb3RoZXJ3aXNlIHNwbGl0IHRoZSBjb21tYW5kIGJ5IHNwYWNlXG4gIGNvbnN0IHBhcnRzID0gaXNNb3ZlID8gW2NvbW1hbmRdIDogY29tbWFuZC5zcGxpdChcIiBcIik7XG4gIGlmICghaXNNb3ZlICYmIHBhcnRzLmxlbmd0aCAhPT0gMikge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIFwiSW52YWxpZCBjb21tYW5kIGZvcm1hdC4gUGxlYXNlIHVzZSB0aGUgZm9ybWF0ICdHcmlkUG9zaXRpb24gT3JpZW50YXRpb24nLlwiLFxuICAgICk7XG4gIH1cblxuICAvLyBQcm9jZXNzIGFuZCB2YWxpZGF0ZSB0aGUgZ3JpZCBwb3NpdGlvblxuICBjb25zdCBncmlkUG9zaXRpb24gPSBwYXJ0c1swXS50b1VwcGVyQ2FzZSgpO1xuICBpZiAoZ3JpZFBvc2l0aW9uLmxlbmd0aCA8IDIgfHwgZ3JpZFBvc2l0aW9uLmxlbmd0aCA+IDMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGdyaWQgcG9zaXRpb24uIE11c3QgYmUgMiB0byAzIGNoYXJhY3RlcnMgbG9uZy5cIik7XG4gIH1cblxuICAvLyBWYWxpZGF0ZSBncmlkIHBvc2l0aW9uIGFnYWluc3QgdGhlIGdyaWQgbWF0cml4XG4gIGNvbnN0IHZhbGlkR3JpZFBvc2l0aW9ucyA9IGdyaWQuZmxhdCgpOyAvLyBGbGF0dGVuIHRoZSBncmlkIGZvciBlYXNpZXIgc2VhcmNoaW5nXG4gIGlmICghdmFsaWRHcmlkUG9zaXRpb25zLmluY2x1ZGVzKGdyaWRQb3NpdGlvbikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIkludmFsaWQgZ3JpZCBwb3NpdGlvbi4gRG9lcyBub3QgbWF0Y2ggYW55IHZhbGlkIGdyaWQgdmFsdWVzLlwiLFxuICAgICk7XG4gIH1cblxuICBjb25zdCByZXN1bHQgPSB7IGdyaWRQb3NpdGlvbiB9O1xuXG4gIGlmICghaXNNb3ZlKSB7XG4gICAgLy8gUHJvY2VzcyBhbmQgdmFsaWRhdGUgdGhlIG9yaWVudGF0aW9uXG4gICAgY29uc3Qgb3JpZW50YXRpb24gPSBwYXJ0c1sxXS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChvcmllbnRhdGlvbiAhPT0gXCJoXCIgJiYgb3JpZW50YXRpb24gIT09IFwidlwiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiSW52YWxpZCBvcmllbnRhdGlvbi4gTXVzdCBiZSBlaXRoZXIgJ2gnIGZvciBob3Jpem9udGFsIG9yICd2JyBmb3IgdmVydGljYWwuXCIsXG4gICAgICApO1xuICAgIH1cblxuICAgIHJlc3VsdC5vcmllbnRhdGlvbiA9IG9yaWVudGF0aW9uO1xuICB9XG5cbiAgLy8gUmV0dXJuIHRoZSBwcm9jZXNzZWQgYW5kIHZhbGlkYXRlZCBjb21tYW5kIHBhcnRzXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vLyBUaGUgZnVuY3Rpb24gZm9yIHVwZGF0aW5nIHRoZSBvdXRwdXQgZGl2IGVsZW1lbnRcbmNvbnN0IHVwZGF0ZU91dHB1dCA9IChtZXNzYWdlLCB0eXBlKSA9PiB7XG4gIC8vIEdldCB0aGUgb3VwdXQgZWxlbWVudFxuICBjb25zdCBvdXRwdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtb3V0cHV0XCIpO1xuXG4gIC8vIEFwcGVuZCBuZXcgbWVzc2FnZVxuICBjb25zdCBtZXNzYWdlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7IC8vIENyZWF0ZSBhIG5ldyBkaXYgZm9yIHRoZSBtZXNzYWdlXG4gIG1lc3NhZ2VFbGVtZW50LnRleHRDb250ZW50ID0gbWVzc2FnZTsgLy8gU2V0IHRoZSB0ZXh0IGNvbnRlbnQgdG8gdGhlIG1lc3NhZ2VcblxuICAvLyBBcHBseSBzdHlsaW5nIGJhc2VkIG9uIHByb21wdFR5cGVcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSBcInZhbGlkXCI6XG4gICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKGhpdFRleHRDbHIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIm1pc3NcIjpcbiAgICAgIG1lc3NhZ2VFbGVtZW50LmNsYXNzTGlzdC5hZGQobWlzc1RleHRDbHIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImVycm9yXCI6XG4gICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKGVycm9yVGV4dENscik7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZChkZWZhdWx0VGV4dENscik7IC8vIERlZmF1bHQgdGV4dCBjb2xvclxuICB9XG5cbiAgb3V0cHV0LmFwcGVuZENoaWxkKG1lc3NhZ2VFbGVtZW50KTsgLy8gQWRkIHRoZSBlbGVtZW50IHRvIHRoZSBvdXRwdXRcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgb3V0cHV0LnNjcm9sbFRvcCA9IG91dHB1dC5zY3JvbGxIZWlnaHQ7IC8vIFNjcm9sbCB0byB0aGUgYm90dG9tIG9mIHRoZSBvdXRwdXQgY29udGFpbmVyXG59O1xuXG4vLyBUaGUgZnVuY3Rpb24gZm9yIGV4ZWN1dGluZyBjb21tYW5kcyBmcm9tIHRoZSBjb25zb2xlIGlucHV0XG5jb25zdCBjb25zb2xlTG9nUGxhY2VtZW50Q29tbWFuZCA9IChzaGlwVHlwZSwgZ3JpZFBvc2l0aW9uLCBvcmllbnRhdGlvbikgPT4ge1xuICAvLyBTZXQgdGhlIG9yaWVudGF0aW9uIGZlZWRiYWNrXG4gIGNvbnN0IGRpckZlZWJhY2sgPSBvcmllbnRhdGlvbiA9PT0gXCJoXCIgPyBcImhvcml6b250YWxseVwiIDogXCJ2ZXJ0aWNhbGx5XCI7XG4gIC8vIFNldCB0aGUgY29uc29sZSBtZXNzYWdlXG4gIGNvbnN0IG1lc3NhZ2UgPSBgJHtzaGlwVHlwZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHNoaXBUeXBlLnNsaWNlKDEpfSBwbGFjZWQgYXQgJHtncmlkUG9zaXRpb259IGZhY2luZyAke2RpckZlZWJhY2t9YDtcblxuICBjb25zb2xlLmxvZyhgJHttZXNzYWdlfWApO1xuXG4gIHVwZGF0ZU91dHB1dChgPiAke21lc3NhZ2V9YCwgXCJ2YWxpZFwiKTtcblxuICAvLyBDbGVhciB0aGUgaW5wdXRcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLWlucHV0XCIpLnZhbHVlID0gXCJcIjtcbn07XG5cbi8vIFRoZSBmdW5jdGlvbiBmb3IgZXhlY3V0aW5nIGNvbW1hbmRzIGZyb20gdGhlIGNvbnNvbGUgaW5wdXRcbmNvbnN0IGNvbnNvbGVMb2dNb3ZlQ29tbWFuZCA9IChyZXN1bHRzT2JqZWN0KSA9PiB7XG4gIC8vIFNldCB0aGUgY29uc29sZSBtZXNzYWdlXG4gIGNvbnN0IG1lc3NhZ2UgPSBgVGhlICR7cmVzdWx0c09iamVjdC5wbGF5ZXJ9J3MgbW92ZSBvbiAke3Jlc3VsdHNPYmplY3QubW92ZX0gcmVzdWx0ZWQgaW4gYSAke3Jlc3VsdHNPYmplY3QuaGl0ID8gXCJISVRcIiA6IFwiTUlTU1wifSFgO1xuXG4gIGNvbnNvbGUubG9nKGAke21lc3NhZ2V9YCk7XG5cbiAgdXBkYXRlT3V0cHV0KGA+ICR7bWVzc2FnZX1gLCByZXN1bHRzT2JqZWN0LmhpdCA/IFwidmFsaWRcIiA6IFwibWlzc1wiKTtcblxuICAvLyBDbGVhciB0aGUgaW5wdXRcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLWlucHV0XCIpLnZhbHVlID0gXCJcIjtcbn07XG5cbmNvbnN0IGNvbnNvbGVMb2dTaGlwU2luayA9IChyZXN1bHRzT2JqZWN0KSA9PiB7XG4gIGNvbnN0IHsgcGxheWVyLCBzaGlwVHlwZSB9ID0gcmVzdWx0c09iamVjdDtcbiAgLy8gU2V0IHRoZSBjb25zb2xlIG1lc3NhZ2VcbiAgY29uc3QgbWVzc2FnZSA9XG4gICAgcGxheWVyID09PSBcImh1bWFuXCJcbiAgICAgID8gYFlvdSBzdW5rIHRoZWlyICR7c2hpcFR5cGV9IWBcbiAgICAgIDogYFRoZXkgc3VuayB5b3VyICR7c2hpcFR5cGV9IWA7XG5cbiAgY29uc29sZS5sb2coYCR7bWVzc2FnZX1gKTtcblxuICB1cGRhdGVPdXRwdXQoYD4gJHttZXNzYWdlfWAsIFwiZXJyb3JcIik7XG5cbiAgLy8gQ2xlYXIgdGhlIGlucHV0XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1pbnB1dFwiKS52YWx1ZSA9IFwiXCI7XG59O1xuXG5jb25zdCBjb25zb2xlTG9nRXJyb3IgPSAoZXJyb3IsIHNoaXBUeXBlKSA9PiB7XG4gIGlmIChzaGlwVHlwZSkge1xuICAgIC8vIElmIHNoaXBUeXBlIGlzIHBhc3NlZCB0aGVuIHByb2Nlc3MgZXJyb3IgYXMgcGxhY2VtZW50IGVycm9yXG4gICAgY29uc29sZS5lcnJvcihgRXJyb3IgcGxhY2luZyAke3NoaXBUeXBlfTogbWVzc2FnZSA9ICR7ZXJyb3IubWVzc2FnZX0uYCk7XG5cbiAgICB1cGRhdGVPdXRwdXQoYD4gRXJyb3IgcGxhY2luZyAke3NoaXBUeXBlfTogJHtlcnJvci5tZXNzYWdlfWAsIFwiZXJyb3JcIik7XG4gIH0gZWxzZSB7XG4gICAgLy8gZWxzZSBpZiBzaGlwVHlwZSBpcyB1bmRlZmluZWQsIHByb2Nlc3MgZXJyb3IgYXMgbW92ZSBlcnJvclxuICAgIGNvbnNvbGUubG9nKGBFcnJvciBtYWtpbmcgbW92ZTogbWVzc2FnZSA9ICR7ZXJyb3IubWVzc2FnZX0uYCk7XG5cbiAgICB1cGRhdGVPdXRwdXQoYD4gRXJyb3IgbWFraW5nIG1vdmU6IG1lc3NhZ2UgPSAke2Vycm9yLm1lc3NhZ2V9LmAsIFwiZXJyb3JcIik7XG4gIH1cblxuICAvLyBDbGVhciB0aGUgaW5wdXRcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLWlucHV0XCIpLnZhbHVlID0gXCJcIjtcbn07XG5cbi8vIEZ1bmN0aW9uIGluaXRpYWxpc2UgdWlNYW5hZ2VyXG5jb25zdCBpbml0VWlNYW5hZ2VyID0gKHVpTWFuYWdlcikgPT4ge1xuICAvLyBJbml0aWFsaXNlIGNvbnNvbGVcbiAgdWlNYW5hZ2VyLmluaXRDb25zb2xlVUkoKTtcblxuICAvLyBJbml0aWFsaXNlIGdhbWVib2FyZCB3aXRoIGNhbGxiYWNrIGZvciBjZWxsIGNsaWNrc1xuICB1aU1hbmFnZXIuY3JlYXRlR2FtZWJvYXJkKFwiaHVtYW4tZ2JcIik7XG4gIHVpTWFuYWdlci5jcmVhdGVHYW1lYm9hcmQoXCJjb21wLWdiXCIpO1xufTtcblxuLy8gRnVuY3Rpb24gdG8gY2FsY3VsYXRlIGNlbGwgSURzIGJhc2VkIG9uIHN0YXJ0IHBvc2l0aW9uLCBsZW5ndGgsIGFuZCBvcmllbnRhdGlvblxuZnVuY3Rpb24gY2FsY3VsYXRlU2hpcENlbGxzKHN0YXJ0Q2VsbCwgc2hpcExlbmd0aCwgb3JpZW50YXRpb24pIHtcbiAgY29uc3QgY2VsbElkcyA9IFtdO1xuICBjb25zdCByb3dJbmRleCA9IHN0YXJ0Q2VsbC5jaGFyQ29kZUF0KDApIC0gXCJBXCIuY2hhckNvZGVBdCgwKTtcbiAgY29uc3QgY29sSW5kZXggPSBwYXJzZUludChzdGFydENlbGwuc3Vic3RyaW5nKDEpLCAxMCkgLSAxO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgaWYgKG9yaWVudGF0aW9uID09PSBcInZcIikge1xuICAgICAgaWYgKGNvbEluZGV4ICsgaSA+PSBncmlkWzBdLmxlbmd0aCkgYnJlYWs7IC8vIENoZWNrIGdyaWQgYm91bmRzXG4gICAgICBjZWxsSWRzLnB1c2goXG4gICAgICAgIGAke1N0cmluZy5mcm9tQ2hhckNvZGUocm93SW5kZXggKyBcIkFcIi5jaGFyQ29kZUF0KDApKX0ke2NvbEluZGV4ICsgaSArIDF9YCxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChyb3dJbmRleCArIGkgPj0gZ3JpZC5sZW5ndGgpIGJyZWFrOyAvLyBDaGVjayBncmlkIGJvdW5kc1xuICAgICAgY2VsbElkcy5wdXNoKFxuICAgICAgICBgJHtTdHJpbmcuZnJvbUNoYXJDb2RlKHJvd0luZGV4ICsgaSArIFwiQVwiLmNoYXJDb2RlQXQoMCkpfSR7Y29sSW5kZXggKyAxfWAsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjZWxsSWRzO1xufVxuXG4vLyBGdW5jdGlvbiB0byBoaWdobGlnaHQgY2VsbHNcbmZ1bmN0aW9uIGhpZ2hsaWdodENlbGxzKGNlbGxJZHMpIHtcbiAgY2VsbElkcy5mb3JFYWNoKChjZWxsSWQpID0+IHtcbiAgICBjb25zdCBjZWxsRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiJHtjZWxsSWR9XCJdYCk7XG4gICAgaWYgKGNlbGxFbGVtZW50KSB7XG4gICAgICBjZWxsRWxlbWVudC5jbGFzc0xpc3QuYWRkKGhpZ2hsaWdodENscik7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gRnVuY3Rpb24gdG8gY2xlYXIgaGlnaGxpZ2h0IGZyb20gY2VsbHNcbmZ1bmN0aW9uIGNsZWFySGlnaGxpZ2h0KGNlbGxJZHMpIHtcbiAgY2VsbElkcy5mb3JFYWNoKChjZWxsSWQpID0+IHtcbiAgICBjb25zdCBjZWxsRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiJHtjZWxsSWR9XCJdYCk7XG4gICAgaWYgKGNlbGxFbGVtZW50KSB7XG4gICAgICBjZWxsRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGhpZ2hsaWdodENscik7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gRnVuY3Rpb24gdG8gdG9nZ2xlIG9yaWVudGF0aW9uXG5mdW5jdGlvbiB0b2dnbGVPcmllbnRhdGlvbigpIHtcbiAgY3VycmVudE9yaWVudGF0aW9uID0gY3VycmVudE9yaWVudGF0aW9uID09PSBcImhcIiA/IFwidlwiIDogXCJoXCI7XG4gIC8vIFVwZGF0ZSB0aGUgdmlzdWFsIHByb21wdCBoZXJlIGlmIG5lY2Vzc2FyeVxufVxuXG5jb25zdCBoYW5kbGVQbGFjZW1lbnRIb3ZlciA9IChlKSA9PiB7XG4gIGNvbnN0IGNlbGwgPSBlLnRhcmdldDtcbiAgaWYgKFxuICAgIGNlbGwuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZ2FtZWJvYXJkLWNlbGxcIikgJiZcbiAgICBjZWxsLmRhdGFzZXQucGxheWVyID09PSBcImh1bWFuXCJcbiAgKSB7XG4gICAgLy8gTG9naWMgdG8gaGFuZGxlIGhvdmVyIGVmZmVjdFxuICAgIGNvbnN0IGNlbGxQb3MgPSBjZWxsLmRhdGFzZXQucG9zaXRpb247XG4gICAgbGFzdEhvdmVyZWRDZWxsID0gY2VsbFBvcztcbiAgICBjb25zdCBjZWxsc1RvSGlnaGxpZ2h0ID0gY2FsY3VsYXRlU2hpcENlbGxzKFxuICAgICAgY2VsbFBvcyxcbiAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICBjdXJyZW50T3JpZW50YXRpb24sXG4gICAgKTtcbiAgICBoaWdobGlnaHRDZWxscyhjZWxsc1RvSGlnaGxpZ2h0KTtcbiAgfVxufTtcblxuY29uc3QgaGFuZGxlTW91c2VMZWF2ZSA9IChlKSA9PiB7XG4gIGNvbnN0IGNlbGwgPSBlLnRhcmdldDtcbiAgaWYgKGNlbGwuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZ2FtZWJvYXJkLWNlbGxcIikpIHtcbiAgICAvLyBMb2dpYyBmb3IgaGFuZGxpbmcgd2hlbiB0aGUgY3Vyc29yIGxlYXZlcyBhIGNlbGxcbiAgICBjb25zdCBjZWxsUG9zID0gY2VsbC5kYXRhc2V0LnBvc2l0aW9uO1xuICAgIGlmIChjZWxsUG9zID09PSBsYXN0SG92ZXJlZENlbGwpIHtcbiAgICAgIGNvbnN0IGNlbGxzVG9DbGVhciA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgICAgY2VsbFBvcyxcbiAgICAgICAgY3VycmVudFNoaXAuc2hpcExlbmd0aCxcbiAgICAgICAgY3VycmVudE9yaWVudGF0aW9uLFxuICAgICAgKTtcbiAgICAgIGNsZWFySGlnaGxpZ2h0KGNlbGxzVG9DbGVhcik7XG4gICAgICBsYXN0SG92ZXJlZENlbGwgPSBudWxsOyAvLyBSZXNldCBsYXN0SG92ZXJlZENlbGwgc2luY2UgdGhlIG1vdXNlIGhhcyBsZWZ0XG4gICAgfVxuICAgIGxhc3RIb3ZlcmVkQ2VsbCA9IG51bGw7XG4gIH1cbn07XG5cbmNvbnN0IGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlID0gKGUpID0+IHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpOyAvLyBQcmV2ZW50IHRoZSBkZWZhdWx0IHNwYWNlYmFyIGFjdGlvblxuICBpZiAoZS5rZXkgPT09IFwiIFwiICYmIGxhc3RIb3ZlcmVkQ2VsbCkge1xuICAgIC8vIEVuc3VyZSBzcGFjZWJhciBpcyBwcmVzc2VkIGFuZCB0aGVyZSdzIGEgbGFzdCBob3ZlcmVkIGNlbGxcblxuICAgIC8vIFRvZ2dsZSB0aGUgb3JpZW50YXRpb25cbiAgICB0b2dnbGVPcmllbnRhdGlvbigpO1xuXG4gICAgLy8gQ2xlYXIgcHJldmlvdXNseSBoaWdobGlnaHRlZCBjZWxsc1xuICAgIC8vIEFzc3VtaW5nIGNhbGN1bGF0ZVNoaXBDZWxscyBhbmQgY2xlYXJIaWdobGlnaHQgd29yayBjb3JyZWN0bHlcbiAgICBjb25zdCBvbGRDZWxsc1RvQ2xlYXIgPSBjYWxjdWxhdGVTaGlwQ2VsbHMoXG4gICAgICBsYXN0SG92ZXJlZENlbGwsXG4gICAgICBjdXJyZW50U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgY3VycmVudE9yaWVudGF0aW9uID09PSBcImhcIiA/IFwidlwiIDogXCJoXCIsXG4gICAgKTtcbiAgICBjbGVhckhpZ2hsaWdodChvbGRDZWxsc1RvQ2xlYXIpO1xuXG4gICAgLy8gSGlnaGxpZ2h0IG5ldyBjZWxscyBiYXNlZCBvbiB0aGUgbmV3IG9yaWVudGF0aW9uXG4gICAgY29uc3QgbmV3Q2VsbHNUb0hpZ2hsaWdodCA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgIGxhc3RIb3ZlcmVkQ2VsbCxcbiAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICBjdXJyZW50T3JpZW50YXRpb24sXG4gICAgKTtcbiAgICBoaWdobGlnaHRDZWxscyhuZXdDZWxsc1RvSGlnaGxpZ2h0KTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZW5hYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlcigpIHtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvckFsbCgnLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPVwiY29tcHV0ZXJcIl0nKVxuICAgIC5mb3JFYWNoKChjZWxsKSA9PiB7XG4gICAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUoXCJwb2ludGVyLWV2ZW50cy1ub25lXCIsIFwiY3Vyc29yLWRlZmF1bHRcIik7XG4gICAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUocHJpbWFyeUhvdmVyQ2xyKTtcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChwcmltYXJ5SG92ZXJDbHIpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBkaXNhYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlcihjZWxsc0FycmF5KSB7XG4gIGNlbGxzQXJyYXkuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgIGNlbGwuY2xhc3NMaXN0LmFkZChcInBvaW50ZXItZXZlbnRzLW5vbmVcIiwgXCJjdXJzb3ItZGVmYXVsdFwiKTtcbiAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUocHJpbWFyeUhvdmVyQ2xyKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRpc2FibGVIdW1hbkdhbWVib2FyZEhvdmVyKCkge1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9XCJodW1hblwiXScpXG4gICAgLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChcInBvaW50ZXItZXZlbnRzLW5vbmVcIiwgXCJjdXJzb3ItZGVmYXVsdFwiKTtcbiAgICAgIGNlbGwuY2xhc3NMaXN0LnJlbW92ZShwcmltYXJ5SG92ZXJDbHIpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzd2l0Y2hHYW1lYm9hcmRIb3ZlclN0YXRlcygpIHtcbiAgLy8gRGlzYWJsZSBob3ZlciBvbiB0aGUgaHVtYW4ncyBnYW1lYm9hcmRcbiAgZGlzYWJsZUh1bWFuR2FtZWJvYXJkSG92ZXIoKTtcblxuICAvLyBFbmFibGUgaG92ZXIgb24gdGhlIGNvbXB1dGVyJ3MgZ2FtZWJvYXJkXG4gIGVuYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoKTtcbn1cblxuLy8gRnVuY3Rpb24gdG8gc2V0dXAgZ2FtZWJvYXJkIGZvciBzaGlwIHBsYWNlbWVudFxuY29uc3Qgc2V0dXBHYW1lYm9hcmRGb3JQbGFjZW1lbnQgPSAoKSA9PiB7XG4gIGNvbnN0IGNvbXBHYW1lYm9hcmRDZWxscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImNvbXB1dGVyXCJdJyxcbiAgKTtcbiAgZGlzYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoY29tcEdhbWVib2FyZENlbGxzKTtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvckFsbCgnLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPVwiaHVtYW5cIl0nKVxuICAgIC5mb3JFYWNoKChjZWxsKSA9PiB7XG4gICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIGhhbmRsZVBsYWNlbWVudEhvdmVyKTtcbiAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgaGFuZGxlTW91c2VMZWF2ZSk7XG4gICAgfSk7XG4gIC8vIEdldCBnYW1lYm9hcmQgYXJlYSBkaXYgZWxlbWVudFxuICBjb25zdCBnYW1lYm9hcmRBcmVhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICBcIi5nYW1lYm9hcmQtYXJlYSwgW2RhdGEtcGxheWVyPSdodW1hbiddXCIsXG4gICk7XG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgdG8gZ2FtZWJvYXJkIGFyZWEgdG8gYWRkIGFuZCByZW1vdmUgdGhlXG4gIC8vIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlIGV2ZW50IGxpc3RlbmVyIHdoZW4gZW50ZXJpbmcgYW5kIGV4aXRpbmcgdGhlIGFyZWFcbiAgZ2FtZWJvYXJkQXJlYS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xuICB9KTtcbiAgZ2FtZWJvYXJkQXJlYS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xuICB9KTtcbn07XG5cbi8vIEZ1bmN0aW9uIHRvIGNsZWFuIHVwIGFmdGVyIHNoaXAgcGxhY2VtZW50IGlzIGNvbXBsZXRlXG5jb25zdCBjbGVhbnVwQWZ0ZXJQbGFjZW1lbnQgPSAoKSA9PiB7XG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImh1bWFuXCJdJylcbiAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgY2VsbC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBoYW5kbGVQbGFjZW1lbnRIb3Zlcik7XG4gICAgICBjZWxsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIGhhbmRsZU1vdXNlTGVhdmUpO1xuICAgIH0pO1xuICAvLyBHZXQgZ2FtZWJvYXJkIGFyZWEgZGl2IGVsZW1lbnRcbiAgY29uc3QgZ2FtZWJvYXJkQXJlYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgXCIuZ2FtZWJvYXJkLWFyZWEsIFtkYXRhLXBsYXllcj0naHVtYW4nXVwiLFxuICApO1xuICAvLyBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzIHRvIGdhbWVib2FyZCBhcmVhIHRvIGFkZCBhbmQgcmVtb3ZlIHRoZVxuICAvLyBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSBldmVudCBsaXN0ZW5lciB3aGVuIGVudGVyaW5nIGFuZCBleGl0aW5nIHRoZSBhcmVhXG4gIGdhbWVib2FyZEFyZWEucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlKTtcbiAgfSk7XG4gIGdhbWVib2FyZEFyZWEucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlKTtcbiAgfSk7XG4gIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lciBmb3Iga2V5ZG93biBldmVudHNcbiAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xufTtcblxuLy8gRnVuY3Rpb24gZm9yIHN0YXJ0aW5nIHRoZSBnYW1lXG5jb25zdCBzdGFydEdhbWUgPSBhc3luYyAodWlNYW5hZ2VyLCBnYW1lKSA9PiB7XG4gIC8vIFNldCB1cCB0aGUgZ2FtZSBieSBhdXRvIHBsYWNpbmcgY29tcHV0ZXIncyBzaGlwcyBhbmQgc2V0dGluZyB0aGVcbiAgLy8gY3VycmVudCBwbGF5ZXIgdG8gdGhlIGh1bWFuIHBsYXllclxuICBhd2FpdCBnYW1lLnNldFVwKCk7XG5cbiAgLy8gUmVuZGVyIHRoZSBzaGlwIGRpc3BsYXkgZm9yIHRoZSBjb21wdXRlciBwbGF5ZXJcbiAgc2hpcHNUb1BsYWNlLmZvckVhY2goKHNoaXApID0+IHtcbiAgICB1aU1hbmFnZXIucmVuZGVyU2hpcERpc3AoZ2FtZS5wbGF5ZXJzLmNvbXB1dGVyLCBzaGlwLnNoaXBUeXBlKTtcbiAgfSk7XG5cbiAgLy8gRGlzcGxheSBwcm9tcHQgb2JqZWN0IGZvciB0YWtpbmcgYSB0dXJuIGFuZCBzdGFydGluZyB0aGUgZ2FtZVxuICB1aU1hbmFnZXIuZGlzcGxheVByb21wdCh7IHR1cm5Qcm9tcHQsIGdhbWVwbGF5R3VpZGUgfSk7XG59O1xuXG5mdW5jdGlvbiBjb25jbHVkZUdhbWUod2lubmVyKSB7XG4gIC8vIERpc3BsYXkgd2lubmVyLCB1cGRhdGUgVUksIGV0Yy5cbiAgY29uc3QgbWVzc2FnZSA9IGBHYW1lIE92ZXIhIFRoZSAke3dpbm5lcn0gcGxheWVyIHdpbnMhYDtcbiAgY29uc29sZS5sb2coYEdhbWUgT3ZlciEgVGhlICR7d2lubmVyfSBwbGF5ZXIgd2lucyFgKTtcbiAgdXBkYXRlT3V0cHV0KG1lc3NhZ2UsIHdpbm5lciA9PT0gXCJodW1hblwiID8gXCJ2YWxpZFwiIDogXCJlcnJvclwiKTtcblxuICAvLyBSZXN0YXJ0IHRoZSBnYW1lXG59XG5cbmNvbnN0IEFjdGlvbkNvbnRyb2xsZXIgPSAodWlNYW5hZ2VyLCBnYW1lKSA9PiB7XG4gIGNvbnN0IGh1bWFuUGxheWVyID0gZ2FtZS5wbGF5ZXJzLmh1bWFuO1xuICBjb25zdCBodW1hblBsYXllckdhbWVib2FyZCA9IGh1bWFuUGxheWVyLmdhbWVib2FyZDtcbiAgY29uc3QgY29tcFBsYXllciA9IGdhbWUucGxheWVycy5jb21wdXRlcjtcbiAgY29uc3QgY29tcFBsYXllckdhbWVib2FyZCA9IGNvbXBQbGF5ZXIuZ2FtZWJvYXJkO1xuXG4gIC8vIEZ1bmN0aW9uIHRvIHNldHVwIGV2ZW50IGxpc3RlbmVycyBmb3IgY29uc29sZSBhbmQgZ2FtZWJvYXJkIGNsaWNrc1xuICBmdW5jdGlvbiBzZXR1cEV2ZW50TGlzdGVuZXJzKGhhbmRsZXJGdW5jdGlvbiwgcGxheWVyVHlwZSkge1xuICAgIC8vIERlZmluZSBjbGVhbnVwIGZ1bmN0aW9ucyBpbnNpZGUgdG8gZW5zdXJlIHRoZXkgYXJlIGFjY2Vzc2libGUgZm9yIHJlbW92YWxcbiAgICBjb25zdCBjbGVhbnVwRnVuY3Rpb25zID0gW107XG5cbiAgICBjb25zdCBjb25zb2xlU3VibWl0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLXN1Ym1pdFwiKTtcbiAgICBjb25zdCBjb25zb2xlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtaW5wdXRcIik7XG5cbiAgICBjb25zdCBzdWJtaXRIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgY29uc3QgaW5wdXQgPSBjb25zb2xlSW5wdXQudmFsdWU7XG4gICAgICBoYW5kbGVyRnVuY3Rpb24oaW5wdXQpO1xuICAgICAgY29uc29sZUlucHV0LnZhbHVlID0gXCJcIjsgLy8gQ2xlYXIgaW5wdXQgYWZ0ZXIgc3VibWlzc2lvblxuICAgIH07XG5cbiAgICBjb25zdCBrZXlwcmVzc0hhbmRsZXIgPSAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSBcIkVudGVyXCIpIHtcbiAgICAgICAgc3VibWl0SGFuZGxlcigpOyAvLyBSZXVzZSBzdWJtaXQgbG9naWMgZm9yIEVudGVyIGtleSBwcmVzc1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zb2xlU3VibWl0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzdWJtaXRIYW5kbGVyKTtcbiAgICBjb25zb2xlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGtleXByZXNzSGFuZGxlcik7XG5cbiAgICAvLyBBZGQgY2xlYW51cCBmdW5jdGlvbiBmb3IgY29uc29sZSBsaXN0ZW5lcnNcbiAgICBjbGVhbnVwRnVuY3Rpb25zLnB1c2goKCkgPT4ge1xuICAgICAgY29uc29sZVN1Ym1pdEJ1dHRvbi5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgc3VibWl0SGFuZGxlcik7XG4gICAgICBjb25zb2xlSW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGtleXByZXNzSGFuZGxlcik7XG4gICAgfSk7XG5cbiAgICAvLyBTZXR1cCBmb3IgZ2FtZWJvYXJkIGNlbGwgY2xpY2tzXG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKGAuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9JHtwbGF5ZXJUeXBlfV1gKVxuICAgICAgLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAgICAgY29uc3QgY2xpY2tIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHsgcG9zaXRpb24gfSA9IGNlbGwuZGF0YXNldDtcbiAgICAgICAgICBsZXQgaW5wdXQ7XG4gICAgICAgICAgaWYgKHBsYXllclR5cGUgPT09IFwiaHVtYW5cIikge1xuICAgICAgICAgICAgaW5wdXQgPSBgJHtwb3NpdGlvbn0gJHtjdXJyZW50T3JpZW50YXRpb259YDtcbiAgICAgICAgICB9IGVsc2UgaWYgKHBsYXllclR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgICAgICAgaW5wdXQgPSBwb3NpdGlvbjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBcIkVycm9yISBJbnZhbGlkIHBsYXllciB0eXBlIHBhc3NlZCB0byBjbGlja0hhbmRsZXIhXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBoYW5kbGVyRnVuY3Rpb24oaW5wdXQpO1xuICAgICAgICB9O1xuICAgICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbGlja0hhbmRsZXIpO1xuXG4gICAgICAgIC8vIEFkZCBjbGVhbnVwIGZ1bmN0aW9uIGZvciBlYWNoIGNlbGwgbGlzdGVuZXJcbiAgICAgICAgY2xlYW51cEZ1bmN0aW9ucy5wdXNoKCgpID0+XG4gICAgICAgICAgY2VsbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xpY2tIYW5kbGVyKSxcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgLy8gUmV0dXJuIGEgc2luZ2xlIGNsZWFudXAgZnVuY3Rpb24gdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnNcbiAgICByZXR1cm4gKCkgPT4gY2xlYW51cEZ1bmN0aW9ucy5mb3JFYWNoKChjbGVhbnVwKSA9PiBjbGVhbnVwKCkpO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gcHJvbXB0QW5kUGxhY2VTaGlwKHNoaXBUeXBlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIC8vIFNldCB0aGUgY3VycmVudCBzaGlwXG4gICAgICBjdXJyZW50U2hpcCA9IHNoaXBzVG9QbGFjZS5maW5kKChzaGlwKSA9PiBzaGlwLnNoaXBUeXBlID09PSBzaGlwVHlwZSk7XG5cbiAgICAgIC8vIERpc3BsYXkgcHJvbXB0IGZvciB0aGUgc3BlY2lmaWMgc2hpcCB0eXBlIGFzIHdlbGwgYXMgdGhlIGd1aWRlIHRvIHBsYWNpbmcgc2hpcHNcbiAgICAgIGNvbnN0IHBsYWNlU2hpcFByb21wdCA9IHtcbiAgICAgICAgcHJvbXB0OiBgUGxhY2UgeW91ciAke3NoaXBUeXBlfS5gLFxuICAgICAgICBwcm9tcHRUeXBlOiBcImluc3RydWN0aW9uXCIsXG4gICAgICB9O1xuICAgICAgdWlNYW5hZ2VyLmRpc3BsYXlQcm9tcHQoeyBwbGFjZVNoaXBQcm9tcHQsIHBsYWNlU2hpcEd1aWRlIH0pO1xuXG4gICAgICBjb25zdCBoYW5kbGVWYWxpZElucHV0ID0gYXN5bmMgKGlucHV0KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgeyBncmlkUG9zaXRpb24sIG9yaWVudGF0aW9uIH0gPSBwcm9jZXNzQ29tbWFuZChpbnB1dCwgZmFsc2UpO1xuICAgICAgICAgIGF3YWl0IGh1bWFuUGxheWVyR2FtZWJvYXJkLnBsYWNlU2hpcChcbiAgICAgICAgICAgIHNoaXBUeXBlLFxuICAgICAgICAgICAgZ3JpZFBvc2l0aW9uLFxuICAgICAgICAgICAgb3JpZW50YXRpb24sXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zb2xlTG9nUGxhY2VtZW50Q29tbWFuZChzaGlwVHlwZSwgZ3JpZFBvc2l0aW9uLCBvcmllbnRhdGlvbik7XG4gICAgICAgICAgLy8gUmVtb3ZlIGNlbGwgaGlnaGxpZ2h0c1xuICAgICAgICAgIGNvbnN0IGNlbGxzVG9DbGVhciA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgICAgICAgIGdyaWRQb3NpdGlvbixcbiAgICAgICAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICAgICAgICBvcmllbnRhdGlvbixcbiAgICAgICAgICApO1xuICAgICAgICAgIGNsZWFySGlnaGxpZ2h0KGNlbGxzVG9DbGVhcik7XG5cbiAgICAgICAgICAvLyBEaXNwbGF5IHRoZSBzaGlwIG9uIHRoZSBnYW1lIGJvYXJkIGFuZCBzaGlwIHN0YXR1cyBkaXNwbGF5XG4gICAgICAgICAgdWlNYW5hZ2VyLnJlbmRlclNoaXBCb2FyZChodW1hblBsYXllciwgc2hpcFR5cGUpO1xuICAgICAgICAgIHVpTWFuYWdlci5yZW5kZXJTaGlwRGlzcChodW1hblBsYXllciwgc2hpcFR5cGUpO1xuXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZS1iZWZvcmUtZGVmaW5lXG4gICAgICAgICAgcmVzb2x2ZVNoaXBQbGFjZW1lbnQoKTsgLy8gU2hpcCBwbGFjZWQgc3VjY2Vzc2Z1bGx5LCByZXNvbHZlIHRoZSBwcm9taXNlXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZUxvZ0Vycm9yKGVycm9yLCBzaGlwVHlwZSk7XG4gICAgICAgICAgLy8gRG8gbm90IHJlamVjdCB0byBhbGxvdyBmb3IgcmV0cnksIGp1c3QgbG9nIHRoZSBlcnJvclxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAvLyBTZXR1cCBldmVudCBsaXN0ZW5lcnMgYW5kIGVuc3VyZSB3ZSBjYW4gY2xlYW4gdGhlbSB1cCBhZnRlciBwbGFjZW1lbnRcbiAgICAgIGNvbnN0IGNsZWFudXAgPSBzZXR1cEV2ZW50TGlzdGVuZXJzKGhhbmRsZVZhbGlkSW5wdXQsIFwiaHVtYW5cIik7XG5cbiAgICAgIC8vIEF0dGFjaCBjbGVhbnVwIHRvIHJlc29sdmUgdG8gZW5zdXJlIGl0J3MgY2FsbGVkIHdoZW4gdGhlIHByb21pc2UgcmVzb2x2ZXNcbiAgICAgIGNvbnN0IHJlc29sdmVTaGlwUGxhY2VtZW50ID0gKCkgPT4ge1xuICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvLyBTZXF1ZW50aWFsbHkgcHJvbXB0IGZvciBhbmQgcGxhY2UgZWFjaCBzaGlwXG4gIGFzeW5jIGZ1bmN0aW9uIHNldHVwU2hpcHNTZXF1ZW50aWFsbHkoKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwc1RvUGxhY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wXG4gICAgICBhd2FpdCBwcm9tcHRBbmRQbGFjZVNoaXAoc2hpcHNUb1BsYWNlW2ldLnNoaXBUeXBlKTsgLy8gV2FpdCBmb3IgZWFjaCBzaGlwIHRvIGJlIHBsYWNlZCBiZWZvcmUgY29udGludWluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIEZ1bmN0aW9uIGZvciBoYW5kbGluZyB0aGUgZ2FtZSBzZXR1cCBhbmQgc2hpcCBwbGFjZW1lbnRcbiAgY29uc3QgaGFuZGxlU2V0dXAgPSBhc3luYyAoKSA9PiB7XG4gICAgLy8gSW5pdCB0aGUgVUlcbiAgICBpbml0VWlNYW5hZ2VyKHVpTWFuYWdlcik7XG4gICAgc2V0dXBHYW1lYm9hcmRGb3JQbGFjZW1lbnQoKTtcbiAgICBhd2FpdCBzZXR1cFNoaXBzU2VxdWVudGlhbGx5KCk7XG4gICAgLy8gUHJvY2VlZCB3aXRoIHRoZSByZXN0IG9mIHRoZSBnYW1lIHNldHVwIGFmdGVyIGFsbCBzaGlwcyBhcmUgcGxhY2VkXG4gICAgY2xlYW51cEFmdGVyUGxhY2VtZW50KCk7XG5cbiAgICAvLyBTdGFydCB0aGUgZ2FtZVxuICAgIGF3YWl0IHN0YXJ0R2FtZSh1aU1hbmFnZXIsIGdhbWUpO1xuXG4gICAgY29uc3Qgb3V0cHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLW91dHB1dFwiKTtcbiAgICB1cGRhdGVPdXRwdXQoXCI+IEFsbCBzaGlwcyBwbGFjZWQsIGdhbWUgc2V0dXAgY29tcGxldGUhXCIpO1xuICAgIGNvbnNvbGUubG9nKFwiQWxsIHNoaXBzIHBsYWNlZCwgZ2FtZSBzZXR1cCBjb21wbGV0ZSFcIik7XG4gICAgc3dpdGNoR2FtZWJvYXJkSG92ZXJTdGF0ZXMoKTtcbiAgfTtcblxuICBjb25zdCB1cGRhdGVDb21wdXRlckRpc3BsYXlzID0gKGh1bWFuTW92ZVJlc3VsdCkgPT4ge1xuICAgIC8vIFNldCB0aGUgcGxheWVyIHNlbGVjdG9yIG9mIHRoZSBvcHBvbmVudCBkZXBlbmRpbmcgb24gdGhlIHBsYXllclxuICAgIC8vIHdobyBtYWRlIHRoZSBtb3ZlXG4gICAgY29uc3QgcGxheWVyU2VsZWN0b3IgPVxuICAgICAgaHVtYW5Nb3ZlUmVzdWx0LnBsYXllciA9PT0gXCJodW1hblwiID8gXCJjb21wdXRlclwiIDogXCJodW1hblwiO1xuICAgIC8vIEdldCB0aGUgRE9NIGVsZW1lbnQgZm9yIHRoZSBjZWxsXG4gICAgY29uc3QgY2VsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBgLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPSR7cGxheWVyU2VsZWN0b3J9XVtkYXRhLXBvc2l0aW9uPSR7aHVtYW5Nb3ZlUmVzdWx0Lm1vdmV9XWAsXG4gICAgKTtcblxuICAgIC8vIERpc2FibGUgdGhlIGNlbGwgZnJvbSBmdXR1cmUgY2xpY2tzXG4gICAgZGlzYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoW2NlbGxdKTtcblxuICAgIC8vIEhhbmRsZSBtaXNzIGFuZCBoaXRcbiAgICBpZiAoIWh1bWFuTW92ZVJlc3VsdC5oaXQpIHtcbiAgICAgIC8vIFVwZGF0ZSB0aGUgY2VsbHMgc3R5bGluZyB0byByZWZsZWN0IG1pc3NcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChtaXNzQmdDbHIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBVcGRhdGUgdGhlIGNlbGxzIHN0eWxpbmcgdG8gcmVmbGVjdCBoaXRcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChoaXRCZ0Nscik7XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgc2hpcCBzZWN0aW9uIGluIHRoZSBzaGlwIHN0YXR1cyBkaXNwbGF5XG4gICAgICB1aU1hbmFnZXIudXBkYXRlU2hpcFNlY3Rpb24oXG4gICAgICAgIGh1bWFuTW92ZVJlc3VsdC5tb3ZlLFxuICAgICAgICBodW1hbk1vdmVSZXN1bHQuc2hpcFR5cGUsXG4gICAgICAgIHBsYXllclNlbGVjdG9yLFxuICAgICAgKTtcbiAgICB9XG4gIH07XG5cbiAgYXN5bmMgZnVuY3Rpb24gcHJvbXB0UGxheWVyTW92ZShjb21wTW92ZVJlc3VsdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgaHVtYW5Nb3ZlUmVzdWx0O1xuICAgICAgLy8gVXBkYXRlIHRoZSBwbGF5ZXIgd2l0aCB0aGUgcmVzdWx0IG9mIHRoZSBjb21wdXRlcidzIGxhc3QgbW9yZVxuICAgICAgLy8gKGlmIHRoZXJlIGlzIG9uZSlcbiAgICAgIGlmIChjb21wTW92ZVJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIExvZyB0aGUgcmVzdWx0IG9mIHRoZSBjb21wdXRlcidzIG1vdmUgdG8gdGhlIGNvbnNvbGVcbiAgICAgICAgY29uc29sZUxvZ01vdmVDb21tYW5kKGNvbXBNb3ZlUmVzdWx0KTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coYE1ha2UgYSBtb3ZlIWApO1xuXG4gICAgICBjb25zdCBoYW5kbGVWYWxpZE1vdmUgPSBhc3luYyAobW92ZSkgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhgaGFuZGxlVmFsaWRJbnB1dDogbW92ZSA9ICR7bW92ZX1gKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB7IGdyaWRQb3NpdGlvbiB9ID0gcHJvY2Vzc0NvbW1hbmQobW92ZSwgdHJ1ZSk7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coYGhhbmRsZVZhbGlkSW5wdXQ6IGdyaWRQb3NpdGlvbiA9ICR7Z3JpZFBvc2l0aW9ufWApO1xuICAgICAgICAgIGh1bWFuTW92ZVJlc3VsdCA9IGF3YWl0IGh1bWFuUGxheWVyLm1ha2VNb3ZlKFxuICAgICAgICAgICAgY29tcFBsYXllckdhbWVib2FyZCxcbiAgICAgICAgICAgIGdyaWRQb3NpdGlvbixcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSBjb21wdXRlciBwbGF5ZXIncyBzaGlwcyBkaXNwbGF5IGFuZCBnYW1lYm9hcmRcbiAgICAgICAgICAvLyBkZXBlbmRpbmcgb24gb3V0Y29tZSBvZiBtb3ZlXG4gICAgICAgICAgdXBkYXRlQ29tcHV0ZXJEaXNwbGF5cyhodW1hbk1vdmVSZXN1bHQpO1xuXG4gICAgICAgICAgLy8gQ29tbXVuaWNhdGUgdGhlIHJlc3VsdCBvZiB0aGUgbW92ZSB0byB0aGUgdXNlclxuICAgICAgICAgIGNvbnNvbGVMb2dNb3ZlQ29tbWFuZChodW1hbk1vdmVSZXN1bHQpO1xuXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZS1iZWZvcmUtZGVmaW5lXG4gICAgICAgICAgcmVzb2x2ZU1vdmUoKTsgLy8gTW92ZSBleGVjdXRlZCBzdWNjZXNzZnVsbHksIHJlc29sdmUgdGhlIHByb21pc2VcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlTG9nRXJyb3IoZXJyb3IpO1xuICAgICAgICAgIC8vIERvIG5vdCByZWplY3QgdG8gYWxsb3cgZm9yIHJldHJ5LCBqdXN0IGxvZyB0aGUgZXJyb3JcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gU2V0dXAgZXZlbnQgbGlzdGVuZXJzIGFuZCBlbnN1cmUgd2UgY2FuIGNsZWFuIHRoZW0gdXAgYWZ0ZXIgcGxhY2VtZW50XG4gICAgICBjb25zdCBjbGVhbnVwID0gc2V0dXBFdmVudExpc3RlbmVycyhoYW5kbGVWYWxpZE1vdmUsIFwiY29tcHV0ZXJcIik7XG5cbiAgICAgIC8vIEF0dGFjaCBjbGVhbnVwIHRvIHJlc29sdmUgdG8gZW5zdXJlIGl0J3MgY2FsbGVkIHdoZW4gdGhlIHByb21pc2UgcmVzb2x2ZXNcbiAgICAgIGNvbnN0IHJlc29sdmVNb3ZlID0gKCkgPT4ge1xuICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgIHJlc29sdmUoaHVtYW5Nb3ZlUmVzdWx0KTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBjb21wdXRlck1vdmUoKSB7XG4gICAgbGV0IGNvbXBNb3ZlUmVzdWx0O1xuICAgIHRyeSB7XG4gICAgICAvLyBDb21wdXRlciBsb2dpYyB0byBjaG9vc2UgYSBtb3ZlXG4gICAgICAvLyBVcGRhdGUgVUkgYmFzZWQgb24gbW92ZVxuICAgICAgY29tcE1vdmVSZXN1bHQgPSBjb21wUGxheWVyLm1ha2VNb3ZlKGh1bWFuUGxheWVyR2FtZWJvYXJkKTtcblxuICAgICAgLy8gU2V0IHRoZSBwbGF5ZXIgc2VsZWN0b3Igb2YgdGhlIG9wcG9uZW50IGRlcGVuZGluZyBvbiB0aGUgcGxheWVyXG4gICAgICAvLyB3aG8gbWFkZSB0aGUgbW92ZVxuICAgICAgY29uc3QgcGxheWVyU2VsZWN0b3IgPVxuICAgICAgICBjb21wTW92ZVJlc3VsdC5wbGF5ZXIgPT09IFwiaHVtYW5cIiA/IFwiY29tcHV0ZXJcIiA6IFwiaHVtYW5cIjtcblxuICAgICAgaWYgKGNvbXBNb3ZlUmVzdWx0LmhpdCkge1xuICAgICAgICB1aU1hbmFnZXIudXBkYXRlU2hpcFNlY3Rpb24oXG4gICAgICAgICAgY29tcE1vdmVSZXN1bHQubW92ZSxcbiAgICAgICAgICBjb21wTW92ZVJlc3VsdC5zaGlwVHlwZSxcbiAgICAgICAgICBwbGF5ZXJTZWxlY3RvcixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZUxvZ0Vycm9yKGVycm9yKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBNb3ZlUmVzdWx0O1xuICB9XG5cbiAgY29uc3QgY2hlY2tTaGlwSXNTdW5rID0gKGdhbWVib2FyZCwgc2hpcFR5cGUpID0+XG4gICAgZ2FtZWJvYXJkLmlzU2hpcFN1bmsoc2hpcFR5cGUpO1xuXG4gIGNvbnN0IGNoZWNrV2luQ29uZGl0aW9uID0gKGdhbWVib2FyZCkgPT4gZ2FtZWJvYXJkLmNoZWNrQWxsU2hpcHNTdW5rKCk7XG5cbiAgLy8gRnVuY3Rpb24gZm9yIGhhbmRsaW5nIHRoZSBwbGF5aW5nIG9mIHRoZSBnYW1lXG4gIGNvbnN0IHBsYXlHYW1lID0gYXN5bmMgKCkgPT4ge1xuICAgIGxldCBnYW1lT3ZlciA9IGZhbHNlO1xuICAgIGxldCBsYXN0Q29tcE1vdmVSZXN1bHQ7XG4gICAgbGV0IGxhc3RIdW1hbk1vdmVSZXN1bHQ7XG4gICAgbGV0IHdpbm5lcjtcblxuICAgIHdoaWxlICghZ2FtZU92ZXIpIHtcbiAgICAgIC8vIFBsYXllciBtYWtlcyBhIG1vdmVcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wXG4gICAgICBsYXN0SHVtYW5Nb3ZlUmVzdWx0ID0gYXdhaXQgcHJvbXB0UGxheWVyTW92ZShsYXN0Q29tcE1vdmVSZXN1bHQpO1xuXG4gICAgICAvLyBDaGVjayBmb3IgaGl0XG4gICAgICBpZiAobGFzdEh1bWFuTW92ZVJlc3VsdC5oaXQpIHtcbiAgICAgICAgY29uc3QgeyBzaGlwVHlwZSB9ID0gbGFzdEh1bWFuTW92ZVJlc3VsdDtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIHNoaXAgc2lua1xuICAgICAgICBjb25zdCBpc1N1bmsgPSBjaGVja1NoaXBJc1N1bmsoY29tcFBsYXllckdhbWVib2FyZCwgc2hpcFR5cGUpO1xuICAgICAgICBpZiAoaXNTdW5rKSB7XG4gICAgICAgICAgY29uc29sZUxvZ1NoaXBTaW5rKGxhc3RIdW1hbk1vdmVSZXN1bHQpO1xuICAgICAgICAgIHVpTWFuYWdlci5yZW5kZXJTdW5rZW5TaGlwKGNvbXBQbGF5ZXIsIHNoaXBUeXBlKTtcblxuICAgICAgICAgIC8vIENoZWNrIGZvciB3aW4gY29uZGl0aW9uXG4gICAgICAgICAgZ2FtZU92ZXIgPSBjaGVja1dpbkNvbmRpdGlvbihjb21wUGxheWVyR2FtZWJvYXJkKTtcbiAgICAgICAgICBpZiAoZ2FtZU92ZXIpIHtcbiAgICAgICAgICAgIHdpbm5lciA9IFwiaHVtYW5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBDb21wdXRlciBtYWtlcyBhIG1vdmVcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wXG4gICAgICBsYXN0Q29tcE1vdmVSZXN1bHQgPSBhd2FpdCBjb21wdXRlck1vdmUoKTtcblxuICAgICAgLy8gQ2hlY2sgZm9yIGhpdFxuICAgICAgaWYgKGxhc3RDb21wTW92ZVJlc3VsdC5oaXQpIHtcbiAgICAgICAgY29uc3QgeyBzaGlwVHlwZSB9ID0gbGFzdENvbXBNb3ZlUmVzdWx0O1xuICAgICAgICAvLyBDaGVjayBmb3Igc2hpcCBzaW5rXG4gICAgICAgIGNvbnN0IGlzU3VuayA9IGNoZWNrU2hpcElzU3VuayhodW1hblBsYXllckdhbWVib2FyZCwgc2hpcFR5cGUpO1xuICAgICAgICBpZiAoaXNTdW5rKSB7XG4gICAgICAgICAgY29uc29sZUxvZ1NoaXBTaW5rKGxhc3RDb21wTW92ZVJlc3VsdCk7XG4gICAgICAgICAgdWlNYW5hZ2VyLnJlbmRlclN1bmtlblNoaXAoaHVtYW5QbGF5ZXIsIHNoaXBUeXBlKTtcblxuICAgICAgICAgIC8vIENoZWNrIGZvciB3aW4gY29uZGl0aW9uXG4gICAgICAgICAgZ2FtZU92ZXIgPSBjaGVja1dpbkNvbmRpdGlvbihodW1hblBsYXllckdhbWVib2FyZCk7XG4gICAgICAgICAgaWYgKGdhbWVPdmVyKSB7XG4gICAgICAgICAgICB3aW5uZXIgPSBcImNvbXB1dGVyXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBHYW1lIG92ZXIgbG9naWNcbiAgICBjb25jbHVkZUdhbWUod2lubmVyKTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGhhbmRsZVNldHVwLFxuICAgIHBsYXlHYW1lLFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQWN0aW9uQ29udHJvbGxlcjtcbiIsIi8qIGVzbGludC1kaXNhYmxlIG1heC1jbGFzc2VzLXBlci1maWxlICovXG5cbmNsYXNzIE92ZXJsYXBwaW5nU2hpcHNFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiU2hpcHMgYXJlIG92ZXJsYXBwaW5nLlwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJPdmVybGFwcGluZ1NoaXBzRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBTaGlwQWxsb2NhdGlvblJlYWNoZWRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3Ioc2hpcFR5cGUpIHtcbiAgICBzdXBlcihgU2hpcCBhbGxvY2F0aW9uIGxpbWl0IHJlYWNoZWQuIFNoaXAgdHlwZSA9ICR7c2hpcFR5cGV9LmApO1xuICAgIHRoaXMubmFtZSA9IFwiU2hpcEFsbG9jYXRpb25SZWFjaGVkRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIlNoaXAgdHlwZSBhbGxvY2F0aW9uIGxpbWl0IHJlYWNoZWQuXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIlNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRTaGlwTGVuZ3RoRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIkludmFsaWQgc2hpcCBsZW5ndGguXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRTaGlwTGVuZ3RoRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBJbnZhbGlkU2hpcFR5cGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBzaGlwIHR5cGUuXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRTaGlwVHlwZUVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgSW52YWxpZFBsYXllclR5cGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZSA9IFwiSW52YWxpZCBwbGF5ZXIgdHlwZS4gVmFsaWQgcGxheWVyIHR5cGVzOiAnaHVtYW4nICYgJ2NvbXB1dGVyJ1wiLFxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRTaGlwVHlwZUVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIkludmFsaWQgc2hpcCBwbGFjZW1lbnQuIEJvdW5kYXJ5IGVycm9yIVwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIFJlcGVhdEF0dGFja2VkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIkludmFsaWQgYXR0YWNrIGVudHJ5LiBQb3NpdGlvbiBhbHJlYWR5IGF0dGFja2VkIVwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJSZXBlYXRBdHRhY2tFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRNb3ZlRW50cnlFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBtb3ZlIGVudHJ5IVwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJJbnZhbGlkTW92ZUVudHJ5RXJyb3JcIjtcbiAgfVxufVxuXG5leHBvcnQge1xuICBPdmVybGFwcGluZ1NoaXBzRXJyb3IsXG4gIFNoaXBBbGxvY2F0aW9uUmVhY2hlZEVycm9yLFxuICBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IsXG4gIEludmFsaWRTaGlwTGVuZ3RoRXJyb3IsXG4gIEludmFsaWRTaGlwVHlwZUVycm9yLFxuICBJbnZhbGlkUGxheWVyVHlwZUVycm9yLFxuICBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvcixcbiAgUmVwZWF0QXR0YWNrZWRFcnJvcixcbiAgSW52YWxpZE1vdmVFbnRyeUVycm9yLFxufTtcbiIsImltcG9ydCBQbGF5ZXIgZnJvbSBcIi4vcGxheWVyXCI7XG5pbXBvcnQgR2FtZWJvYXJkIGZyb20gXCIuL2dhbWVib2FyZFwiO1xuaW1wb3J0IFNoaXAgZnJvbSBcIi4vc2hpcFwiO1xuaW1wb3J0IHsgSW52YWxpZFBsYXllclR5cGVFcnJvciB9IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBHYW1lID0gKCkgPT4ge1xuICAvLyBJbml0aWFsaXNlLCBjcmVhdGUgZ2FtZWJvYXJkcyBmb3IgYm90aCBwbGF5ZXJzIGFuZCBjcmVhdGUgcGxheWVycyBvZiB0eXBlcyBodW1hbiBhbmQgY29tcHV0ZXJcbiAgY29uc3QgaHVtYW5HYW1lYm9hcmQgPSBHYW1lYm9hcmQoU2hpcCk7XG4gIGNvbnN0IGNvbXB1dGVyR2FtZWJvYXJkID0gR2FtZWJvYXJkKFNoaXApO1xuICBjb25zdCBodW1hblBsYXllciA9IFBsYXllcihodW1hbkdhbWVib2FyZCwgXCJodW1hblwiKTtcbiAgY29uc3QgY29tcHV0ZXJQbGF5ZXIgPSBQbGF5ZXIoY29tcHV0ZXJHYW1lYm9hcmQsIFwiY29tcHV0ZXJcIik7XG4gIGxldCBjdXJyZW50UGxheWVyO1xuICBsZXQgZ2FtZU92ZXJTdGF0ZSA9IGZhbHNlO1xuXG4gIC8vIFN0b3JlIHBsYXllcnMgaW4gYSBwbGF5ZXIgb2JqZWN0XG4gIGNvbnN0IHBsYXllcnMgPSB7IGh1bWFuOiBodW1hblBsYXllciwgY29tcHV0ZXI6IGNvbXB1dGVyUGxheWVyIH07XG5cbiAgLy8gU2V0IHVwIHBoYXNlXG4gIGNvbnN0IHNldFVwID0gKCkgPT4ge1xuICAgIC8vIEF1dG9tYXRpYyBwbGFjZW1lbnQgZm9yIGNvbXB1dGVyXG4gICAgY29tcHV0ZXJQbGF5ZXIucGxhY2VTaGlwcygpO1xuXG4gICAgLy8gU2V0IHRoZSBjdXJyZW50IHBsYXllciB0byBodW1hbiBwbGF5ZXJcbiAgICBjdXJyZW50UGxheWVyID0gaHVtYW5QbGF5ZXI7XG4gIH07XG5cbiAgLy8gR2FtZSBlbmRpbmcgZnVuY3Rpb25cbiAgY29uc3QgZW5kR2FtZSA9ICgpID0+IHtcbiAgICBnYW1lT3ZlclN0YXRlID0gdHJ1ZTtcbiAgfTtcblxuICAvLyBUYWtlIHR1cm4gbWV0aG9kXG4gIGNvbnN0IHRha2VUdXJuID0gKG1vdmUpID0+IHtcbiAgICBsZXQgZmVlZGJhY2s7XG5cbiAgICAvLyBEZXRlcm1pbmUgdGhlIG9wcG9uZW50IGJhc2VkIG9uIHRoZSBjdXJyZW50IHBsYXllclxuICAgIGNvbnN0IG9wcG9uZW50ID1cbiAgICAgIGN1cnJlbnRQbGF5ZXIgPT09IGh1bWFuUGxheWVyID8gY29tcHV0ZXJQbGF5ZXIgOiBodW1hblBsYXllcjtcblxuICAgIC8vIENhbGwgdGhlIG1ha2VNb3ZlIG1ldGhvZCBvbiB0aGUgY3VycmVudCBwbGF5ZXIgd2l0aCB0aGUgb3Bwb25lbnQncyBnYW1lYm9hcmQgYW5kIHN0b3JlIGFzIG1vdmUgZmVlZGJhY2tcbiAgICBjb25zdCByZXN1bHQgPSBjdXJyZW50UGxheWVyLm1ha2VNb3ZlKG9wcG9uZW50LmdhbWVib2FyZCwgbW92ZSk7XG5cbiAgICAvLyBJZiByZXN1bHQgaXMgYSBoaXQsIGNoZWNrIHdoZXRoZXIgdGhlIHNoaXAgaXMgc3Vua1xuICAgIGlmIChyZXN1bHQuaGl0KSB7XG4gICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSBzaGlwIGlzIHN1bmsgYW5kIGFkZCByZXN1bHQgYXMgdmFsdWUgdG8gZmVlZGJhY2sgb2JqZWN0IHdpdGgga2V5IFwiaXNTaGlwU3Vua1wiXG4gICAgICBpZiAob3Bwb25lbnQuZ2FtZWJvYXJkLmlzU2hpcFN1bmsocmVzdWx0LnNoaXBUeXBlKSkge1xuICAgICAgICBmZWVkYmFjayA9IHtcbiAgICAgICAgICAuLi5yZXN1bHQsXG4gICAgICAgICAgaXNTaGlwU3VuazogdHJ1ZSxcbiAgICAgICAgICBnYW1lV29uOiBvcHBvbmVudC5nYW1lYm9hcmQuY2hlY2tBbGxTaGlwc1N1bmsoKSxcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZlZWRiYWNrID0geyAuLi5yZXN1bHQsIGlzU2hpcFN1bms6IGZhbHNlIH07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghcmVzdWx0LmhpdCkge1xuICAgICAgLy8gU2V0IGZlZWRiYWNrIHRvIGp1c3QgdGhlIHJlc3VsdFxuICAgICAgZmVlZGJhY2sgPSByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gSWYgZ2FtZSBpcyB3b24sIGVuZCBnYW1lXG4gICAgaWYgKGZlZWRiYWNrLmdhbWVXb24pIHtcbiAgICAgIGVuZEdhbWUoKTtcbiAgICB9XG5cbiAgICAvLyBTd2l0Y2ggdGhlIGN1cnJlbnQgcGxheWVyXG4gICAgY3VycmVudFBsYXllciA9IG9wcG9uZW50O1xuXG4gICAgLy8gUmV0dXJuIHRoZSBmZWVkYmFjayBmb3IgdGhlIG1vdmVcbiAgICByZXR1cm4gZmVlZGJhY2s7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBnZXQgY3VycmVudFBsYXllcigpIHtcbiAgICAgIHJldHVybiBjdXJyZW50UGxheWVyO1xuICAgIH0sXG4gICAgZ2V0IGdhbWVPdmVyU3RhdGUoKSB7XG4gICAgICByZXR1cm4gZ2FtZU92ZXJTdGF0ZTtcbiAgICB9LFxuICAgIHBsYXllcnMsXG4gICAgc2V0VXAsXG4gICAgdGFrZVR1cm4sXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBHYW1lO1xuIiwiaW1wb3J0IHtcbiAgU2hpcFR5cGVBbGxvY2F0aW9uUmVhY2hlZEVycm9yLFxuICBPdmVybGFwcGluZ1NoaXBzRXJyb3IsXG4gIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yLFxuICBSZXBlYXRBdHRhY2tlZEVycm9yLFxufSBmcm9tIFwiLi9lcnJvcnNcIjtcblxuY29uc3QgZ3JpZCA9IFtcbiAgW1wiQTFcIiwgXCJBMlwiLCBcIkEzXCIsIFwiQTRcIiwgXCJBNVwiLCBcIkE2XCIsIFwiQTdcIiwgXCJBOFwiLCBcIkE5XCIsIFwiQTEwXCJdLFxuICBbXCJCMVwiLCBcIkIyXCIsIFwiQjNcIiwgXCJCNFwiLCBcIkI1XCIsIFwiQjZcIiwgXCJCN1wiLCBcIkI4XCIsIFwiQjlcIiwgXCJCMTBcIl0sXG4gIFtcIkMxXCIsIFwiQzJcIiwgXCJDM1wiLCBcIkM0XCIsIFwiQzVcIiwgXCJDNlwiLCBcIkM3XCIsIFwiQzhcIiwgXCJDOVwiLCBcIkMxMFwiXSxcbiAgW1wiRDFcIiwgXCJEMlwiLCBcIkQzXCIsIFwiRDRcIiwgXCJENVwiLCBcIkQ2XCIsIFwiRDdcIiwgXCJEOFwiLCBcIkQ5XCIsIFwiRDEwXCJdLFxuICBbXCJFMVwiLCBcIkUyXCIsIFwiRTNcIiwgXCJFNFwiLCBcIkU1XCIsIFwiRTZcIiwgXCJFN1wiLCBcIkU4XCIsIFwiRTlcIiwgXCJFMTBcIl0sXG4gIFtcIkYxXCIsIFwiRjJcIiwgXCJGM1wiLCBcIkY0XCIsIFwiRjVcIiwgXCJGNlwiLCBcIkY3XCIsIFwiRjhcIiwgXCJGOVwiLCBcIkYxMFwiXSxcbiAgW1wiRzFcIiwgXCJHMlwiLCBcIkczXCIsIFwiRzRcIiwgXCJHNVwiLCBcIkc2XCIsIFwiRzdcIiwgXCJHOFwiLCBcIkc5XCIsIFwiRzEwXCJdLFxuICBbXCJIMVwiLCBcIkgyXCIsIFwiSDNcIiwgXCJINFwiLCBcIkg1XCIsIFwiSDZcIiwgXCJIN1wiLCBcIkg4XCIsIFwiSDlcIiwgXCJIMTBcIl0sXG4gIFtcIkkxXCIsIFwiSTJcIiwgXCJJM1wiLCBcIkk0XCIsIFwiSTVcIiwgXCJJNlwiLCBcIkk3XCIsIFwiSThcIiwgXCJJOVwiLCBcIkkxMFwiXSxcbiAgW1wiSjFcIiwgXCJKMlwiLCBcIkozXCIsIFwiSjRcIiwgXCJKNVwiLCBcIko2XCIsIFwiSjdcIiwgXCJKOFwiLCBcIko5XCIsIFwiSjEwXCJdLFxuXTtcblxuY29uc3QgaW5kZXhDYWxjcyA9IChzdGFydCkgPT4ge1xuICBjb25zdCBjb2xMZXR0ZXIgPSBzdGFydFswXS50b1VwcGVyQ2FzZSgpOyAvLyBUaGlzIGlzIHRoZSBjb2x1bW5cbiAgY29uc3Qgcm93TnVtYmVyID0gcGFyc2VJbnQoc3RhcnQuc2xpY2UoMSksIDEwKTsgLy8gVGhpcyBpcyB0aGUgcm93XG5cbiAgY29uc3QgY29sSW5kZXggPSBjb2xMZXR0ZXIuY2hhckNvZGVBdCgwKSAtIFwiQVwiLmNoYXJDb2RlQXQoMCk7IC8vIENvbHVtbiBpbmRleCBiYXNlZCBvbiBsZXR0ZXJcbiAgY29uc3Qgcm93SW5kZXggPSByb3dOdW1iZXIgLSAxOyAvLyBSb3cgaW5kZXggYmFzZWQgb24gbnVtYmVyXG5cbiAgcmV0dXJuIFtjb2xJbmRleCwgcm93SW5kZXhdOyAvLyBSZXR1cm4gW3JvdywgY29sdW1uXVxufTtcblxuY29uc3QgY2hlY2tUeXBlID0gKHNoaXAsIHNoaXBQb3NpdGlvbnMpID0+IHtcbiAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBzaGlwUG9zaXRpb25zIG9iamVjdFxuICBPYmplY3Qua2V5cyhzaGlwUG9zaXRpb25zKS5mb3JFYWNoKChleGlzdGluZ1NoaXBUeXBlKSA9PiB7XG4gICAgaWYgKGV4aXN0aW5nU2hpcFR5cGUgPT09IHNoaXApIHtcbiAgICAgIHRocm93IG5ldyBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3Ioc2hpcCk7XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IGNoZWNrQm91bmRhcmllcyA9IChzaGlwTGVuZ3RoLCBjb29yZHMsIGRpcmVjdGlvbikgPT4ge1xuICAvLyBTZXQgcm93IGFuZCBjb2wgbGltaXRzXG4gIGNvbnN0IHhMaW1pdCA9IGdyaWQubGVuZ3RoOyAvLyBUaGlzIGlzIHRoZSB0b3RhbCBudW1iZXIgb2YgY29sdW1ucyAoeClcbiAgY29uc3QgeUxpbWl0ID0gZ3JpZFswXS5sZW5ndGg7IC8vIFRoaXMgaXMgdGhlIHRvdGFsIG51bWJlciBvZiByb3dzICh5KVxuXG4gIGNvbnN0IHggPSBjb29yZHNbMF07XG4gIGNvbnN0IHkgPSBjb29yZHNbMV07XG5cbiAgLy8gQ2hlY2sgZm9yIHZhbGlkIHN0YXJ0IHBvc2l0aW9uIG9uIGJvYXJkXG4gIGlmICh4IDwgMCB8fCB4ID49IHhMaW1pdCB8fCB5IDwgMCB8fCB5ID49IHlMaW1pdCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENoZWNrIHJpZ2h0IGJvdW5kYXJ5IGZvciBob3Jpem9udGFsIHBsYWNlbWVudFxuICBpZiAoZGlyZWN0aW9uID09PSBcImhcIiAmJiB4ICsgc2hpcExlbmd0aCA+IHhMaW1pdCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBDaGVjayBib3R0b20gYm91bmRhcnkgZm9yIHZlcnRpY2FsIHBsYWNlbWVudFxuICBpZiAoZGlyZWN0aW9uID09PSBcInZcIiAmJiB5ICsgc2hpcExlbmd0aCA+IHlMaW1pdCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIElmIG5vbmUgb2YgdGhlIGludmFsaWQgY29uZGl0aW9ucyBhcmUgbWV0LCByZXR1cm4gdHJ1ZVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmNvbnN0IGNhbGN1bGF0ZVNoaXBQb3NpdGlvbnMgPSAoc2hpcExlbmd0aCwgY29vcmRzLCBkaXJlY3Rpb24pID0+IHtcbiAgY29uc3QgY29sSW5kZXggPSBjb29yZHNbMF07IC8vIFRoaXMgaXMgdGhlIGNvbHVtbiBpbmRleFxuICBjb25zdCByb3dJbmRleCA9IGNvb3Jkc1sxXTsgLy8gVGhpcyBpcyB0aGUgcm93IGluZGV4XG5cbiAgY29uc3QgcG9zaXRpb25zID0gW107XG5cbiAgaWYgKGRpcmVjdGlvbi50b0xvd2VyQ2FzZSgpID09PSBcImhcIikge1xuICAgIC8vIEhvcml6b250YWwgcGxhY2VtZW50OiBpbmNyZW1lbnQgdGhlIGNvbHVtbiBpbmRleFxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChncmlkW2NvbEluZGV4ICsgaV1bcm93SW5kZXhdKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gVmVydGljYWwgcGxhY2VtZW50OiBpbmNyZW1lbnQgdGhlIHJvdyBpbmRleFxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChncmlkW2NvbEluZGV4XVtyb3dJbmRleCArIGldKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcG9zaXRpb25zO1xufTtcblxuY29uc3QgY2hlY2tGb3JPdmVybGFwID0gKHBvc2l0aW9ucywgc2hpcFBvc2l0aW9ucykgPT4ge1xuICBPYmplY3QuZW50cmllcyhzaGlwUG9zaXRpb25zKS5mb3JFYWNoKChbc2hpcFR5cGUsIGV4aXN0aW5nU2hpcFBvc2l0aW9uc10pID0+IHtcbiAgICBpZiAoXG4gICAgICBwb3NpdGlvbnMuc29tZSgocG9zaXRpb24pID0+IGV4aXN0aW5nU2hpcFBvc2l0aW9ucy5pbmNsdWRlcyhwb3NpdGlvbikpXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgT3ZlcmxhcHBpbmdTaGlwc0Vycm9yKFxuICAgICAgICBgT3ZlcmxhcCBkZXRlY3RlZCB3aXRoIHNoaXAgdHlwZSAke3NoaXBUeXBlfWAsXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG5jb25zdCBjaGVja0ZvckhpdCA9IChwb3NpdGlvbiwgc2hpcFBvc2l0aW9ucykgPT4ge1xuICBjb25zdCBmb3VuZFNoaXAgPSBPYmplY3QuZW50cmllcyhzaGlwUG9zaXRpb25zKS5maW5kKFxuICAgIChbXywgZXhpc3RpbmdTaGlwUG9zaXRpb25zXSkgPT4gZXhpc3RpbmdTaGlwUG9zaXRpb25zLmluY2x1ZGVzKHBvc2l0aW9uKSxcbiAgKTtcblxuICByZXR1cm4gZm91bmRTaGlwID8geyBoaXQ6IHRydWUsIHNoaXBUeXBlOiBmb3VuZFNoaXBbMF0gfSA6IHsgaGl0OiBmYWxzZSB9O1xufTtcblxuY29uc3QgR2FtZWJvYXJkID0gKHNoaXBGYWN0b3J5KSA9PiB7XG4gIGNvbnN0IHNoaXBzID0ge307XG4gIGNvbnN0IHNoaXBQb3NpdGlvbnMgPSB7fTtcbiAgY29uc3QgaGl0UG9zaXRpb25zID0ge307XG4gIGNvbnN0IGF0dGFja0xvZyA9IFtbXSwgW11dO1xuXG4gIGNvbnN0IHBsYWNlU2hpcCA9ICh0eXBlLCBzdGFydCwgZGlyZWN0aW9uKSA9PiB7XG4gICAgY29uc3QgbmV3U2hpcCA9IHNoaXBGYWN0b3J5KHR5cGUpO1xuXG4gICAgLy8gQ2hlY2sgdGhlIHNoaXAgdHlwZSBhZ2FpbnN0IGV4aXN0aW5nIHR5cGVzXG4gICAgY2hlY2tUeXBlKHR5cGUsIHNoaXBQb3NpdGlvbnMpO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHN0YXJ0IHBvaW50IGNvb3JkaW5hdGVzIGJhc2VkIG9uIHN0YXJ0IHBvaW50IGdyaWQga2V5XG4gICAgY29uc3QgY29vcmRzID0gaW5kZXhDYWxjcyhzdGFydCk7XG5cbiAgICAvLyBDaGVjayBib3VuZGFyaWVzLCBpZiBvayBjb250aW51ZSB0byBuZXh0IHN0ZXBcbiAgICBpZiAoY2hlY2tCb3VuZGFyaWVzKG5ld1NoaXAuc2hpcExlbmd0aCwgY29vcmRzLCBkaXJlY3Rpb24pKSB7XG4gICAgICAvLyBDYWxjdWxhdGUgYW5kIHN0b3JlIHBvc2l0aW9ucyBmb3IgYSBuZXcgc2hpcFxuICAgICAgY29uc3QgcG9zaXRpb25zID0gY2FsY3VsYXRlU2hpcFBvc2l0aW9ucyhcbiAgICAgICAgbmV3U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgICBjb29yZHMsXG4gICAgICAgIGRpcmVjdGlvbixcbiAgICAgICk7XG5cbiAgICAgIC8vIENoZWNrIGZvciBvdmVybGFwIGJlZm9yZSBwbGFjaW5nIHRoZSBzaGlwXG4gICAgICBjaGVja0Zvck92ZXJsYXAocG9zaXRpb25zLCBzaGlwUG9zaXRpb25zKTtcblxuICAgICAgLy8gSWYgbm8gb3ZlcmxhcCwgcHJvY2VlZCB0byBwbGFjZSBzaGlwXG4gICAgICBzaGlwUG9zaXRpb25zW3R5cGVdID0gcG9zaXRpb25zO1xuICAgICAgLy8gQWRkIHNoaXAgdG8gc2hpcHMgb2JqZWN0XG4gICAgICBzaGlwc1t0eXBlXSA9IG5ld1NoaXA7XG5cbiAgICAgIC8vIEluaXRpYWxpc2UgaGl0UG9zaXRpb25zIGZvciB0aGlzIHNoaXAgdHlwZSBhcyBhbiBlbXB0eSBhcnJheVxuICAgICAgaGl0UG9zaXRpb25zW3R5cGVdID0gW107XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvcihcbiAgICAgICAgYEludmFsaWQgc2hpcCBwbGFjZW1lbnQuIEJvdW5kYXJ5IGVycm9yISBTaGlwIHR5cGU6ICR7dHlwZX1gLFxuICAgICAgKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmVnaXN0ZXIgYW4gYXR0YWNrIGFuZCB0ZXN0IGZvciB2YWxpZCBoaXRcbiAgY29uc3QgYXR0YWNrID0gKHBvc2l0aW9uKSA9PiB7XG4gICAgbGV0IHJlc3BvbnNlO1xuXG4gICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGF0dGFja1xuICAgIGlmIChhdHRhY2tMb2dbMF0uaW5jbHVkZXMocG9zaXRpb24pIHx8IGF0dGFja0xvZ1sxXS5pbmNsdWRlcyhwb3NpdGlvbikpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGBSZXBlYXQgYXR0YWNrOiAke3Bvc2l0aW9ufWApO1xuICAgICAgdGhyb3cgbmV3IFJlcGVhdEF0dGFja2VkRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgdmFsaWQgaGl0XG4gICAgY29uc3QgY2hlY2tSZXN1bHRzID0gY2hlY2tGb3JIaXQocG9zaXRpb24sIHNoaXBQb3NpdGlvbnMpO1xuICAgIGlmIChjaGVja1Jlc3VsdHMuaGl0KSB7XG4gICAgICAvLyBSZWdpc3RlciB2YWxpZCBoaXRcbiAgICAgIGhpdFBvc2l0aW9uc1tjaGVja1Jlc3VsdHMuc2hpcFR5cGVdLnB1c2gocG9zaXRpb24pO1xuICAgICAgc2hpcHNbY2hlY2tSZXN1bHRzLnNoaXBUeXBlXS5oaXQoKTtcblxuICAgICAgLy8gTG9nIHRoZSBhdHRhY2sgYXMgYSB2YWxpZCBoaXRcbiAgICAgIGF0dGFja0xvZ1swXS5wdXNoKHBvc2l0aW9uKTtcbiAgICAgIHJlc3BvbnNlID0geyAuLi5jaGVja1Jlc3VsdHMgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY29uc29sZS5sb2coYE1JU1MhOiAke3Bvc2l0aW9ufWApO1xuICAgICAgLy8gTG9nIHRoZSBhdHRhY2sgYXMgYSBtaXNzXG4gICAgICBhdHRhY2tMb2dbMV0ucHVzaChwb3NpdGlvbik7XG4gICAgICByZXNwb25zZSA9IHsgLi4uY2hlY2tSZXN1bHRzIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9O1xuXG4gIGNvbnN0IGlzU2hpcFN1bmsgPSAodHlwZSkgPT4gc2hpcHNbdHlwZV0uaXNTdW5rO1xuXG4gIGNvbnN0IGNoZWNrQWxsU2hpcHNTdW5rID0gKCkgPT5cbiAgICBPYmplY3QuZW50cmllcyhzaGlwcykuZXZlcnkoKFtzaGlwVHlwZSwgc2hpcF0pID0+IHNoaXAuaXNTdW5rKTtcblxuICAvLyBGdW5jdGlvbiBmb3IgcmVwb3J0aW5nIHRoZSBudW1iZXIgb2Ygc2hpcHMgbGVmdCBhZmxvYXRcbiAgY29uc3Qgc2hpcFJlcG9ydCA9ICgpID0+IHtcbiAgICBjb25zdCBmbG9hdGluZ1NoaXBzID0gT2JqZWN0LmVudHJpZXMoc2hpcHMpXG4gICAgICAuZmlsdGVyKChbc2hpcFR5cGUsIHNoaXBdKSA9PiAhc2hpcC5pc1N1bmspXG4gICAgICAubWFwKChbc2hpcFR5cGUsIF9dKSA9PiBzaGlwVHlwZSk7XG5cbiAgICByZXR1cm4gW2Zsb2F0aW5nU2hpcHMubGVuZ3RoLCBmbG9hdGluZ1NoaXBzXTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldCBncmlkKCkge1xuICAgICAgcmV0dXJuIGdyaWQ7XG4gICAgfSxcbiAgICBnZXQgc2hpcHMoKSB7XG4gICAgICByZXR1cm4gc2hpcHM7XG4gICAgfSxcbiAgICBnZXQgYXR0YWNrTG9nKCkge1xuICAgICAgcmV0dXJuIGF0dGFja0xvZztcbiAgICB9LFxuICAgIGdldFNoaXA6IChzaGlwVHlwZSkgPT4gc2hpcHNbc2hpcFR5cGVdLFxuICAgIGdldFNoaXBQb3NpdGlvbnM6IChzaGlwVHlwZSkgPT4gc2hpcFBvc2l0aW9uc1tzaGlwVHlwZV0sXG4gICAgZ2V0SGl0UG9zaXRpb25zOiAoc2hpcFR5cGUpID0+IGhpdFBvc2l0aW9uc1tzaGlwVHlwZV0sXG4gICAgcGxhY2VTaGlwLFxuICAgIGF0dGFjayxcbiAgICBpc1NoaXBTdW5rLFxuICAgIGNoZWNrQWxsU2hpcHNTdW5rLFxuICAgIHNoaXBSZXBvcnQsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBHYW1lYm9hcmQ7XG4iLCJpbXBvcnQgXCIuL3N0eWxlcy5jc3NcIjtcbmltcG9ydCBHYW1lIGZyb20gXCIuL2dhbWVcIjtcbmltcG9ydCBVaU1hbmFnZXIgZnJvbSBcIi4vdWlNYW5hZ2VyXCI7XG5pbXBvcnQgQWN0aW9uQ29udHJvbGxlciBmcm9tIFwiLi9hY3Rpb25Db250cm9sbGVyXCI7XG5cbi8vIENyZWF0ZSBhIG5ldyBVSSBtYW5hZ2VyXG5jb25zdCBuZXdVaU1hbmFnZXIgPSBVaU1hbmFnZXIoKTtcblxuLy8gSW5zdGFudGlhdGUgYSBuZXcgZ2FtZVxuY29uc3QgbmV3R2FtZSA9IEdhbWUoKTtcblxuLy8gQ3JlYXRlIGEgbmV3IGFjdGlvbiBjb250cm9sbGVyXG5jb25zdCBhY3RDb250cm9sbGVyID0gQWN0aW9uQ29udHJvbGxlcihuZXdVaU1hbmFnZXIsIG5ld0dhbWUpO1xuXG4vLyBXYWl0IGZvciB0aGUgZ2FtZSB0byBiZSBzZXR1cCB3aXRoIHNoaXAgcGxhY2VtZW50cyBldGMuXG5hd2FpdCBhY3RDb250cm9sbGVyLmhhbmRsZVNldHVwKCk7XG5cbi8vIE9uY2UgcmVhZHksIGNhbGwgdGhlIHBsYXlHYW1lIG1ldGhvZFxuYXdhaXQgYWN0Q29udHJvbGxlci5wbGF5R2FtZSgpO1xuXG4vLyBDb25zb2xlIGxvZyB0aGUgcGxheWVyc1xuY29uc29sZS5sb2coXG4gIGBQbGF5ZXJzOiBGaXJzdCBwbGF5ZXIgb2YgdHlwZSAke25ld0dhbWUucGxheWVycy5odW1hbi50eXBlfSwgc2Vjb25kIHBsYXllciBvZiB0eXBlICR7bmV3R2FtZS5wbGF5ZXJzLmNvbXB1dGVyLnR5cGV9IWAsXG4pO1xuIiwiaW1wb3J0IHtcbiAgSW52YWxpZFBsYXllclR5cGVFcnJvcixcbiAgSW52YWxpZE1vdmVFbnRyeUVycm9yLFxuICBSZXBlYXRBdHRhY2tlZEVycm9yLFxuICBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvcixcbiAgT3ZlcmxhcHBpbmdTaGlwc0Vycm9yLFxufSBmcm9tIFwiLi9lcnJvcnNcIjtcblxuY29uc3QgY2hlY2tNb3ZlID0gKG1vdmUsIGdiR3JpZCkgPT4ge1xuICBsZXQgdmFsaWQgPSBmYWxzZTtcblxuICBnYkdyaWQuZm9yRWFjaCgoZWwpID0+IHtcbiAgICBpZiAoZWwuZmluZCgocCkgPT4gcCA9PT0gbW92ZSkpIHtcbiAgICAgIHZhbGlkID0gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB2YWxpZDtcbn07XG5cbmNvbnN0IHJhbmRNb3ZlID0gKGdyaWQsIG1vdmVMb2cpID0+IHtcbiAgLy8gRmxhdHRlbiB0aGUgZ3JpZCBpbnRvIGEgc2luZ2xlIGFycmF5IG9mIG1vdmVzXG4gIGNvbnN0IGFsbE1vdmVzID0gZ3JpZC5mbGF0TWFwKChyb3cpID0+IHJvdyk7XG5cbiAgLy8gRmlsdGVyIG91dCB0aGUgbW92ZXMgdGhhdCBhcmUgYWxyZWFkeSBpbiB0aGUgbW92ZUxvZ1xuICBjb25zdCBwb3NzaWJsZU1vdmVzID0gYWxsTW92ZXMuZmlsdGVyKChtb3ZlKSA9PiAhbW92ZUxvZy5pbmNsdWRlcyhtb3ZlKSk7XG5cbiAgLy8gU2VsZWN0IGEgcmFuZG9tIG1vdmUgZnJvbSB0aGUgcG9zc2libGUgbW92ZXNcbiAgY29uc3QgcmFuZG9tTW92ZSA9XG4gICAgcG9zc2libGVNb3Zlc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwb3NzaWJsZU1vdmVzLmxlbmd0aCldO1xuXG4gIHJldHVybiByYW5kb21Nb3ZlO1xufTtcblxuY29uc3QgZ2VuZXJhdGVSYW5kb21TdGFydCA9IChzaXplLCBkaXJlY3Rpb24sIGdyaWQpID0+IHtcbiAgY29uc3QgdmFsaWRTdGFydHMgPSBbXTtcblxuICBpZiAoZGlyZWN0aW9uID09PSBcImhcIikge1xuICAgIC8vIEZvciBob3Jpem9udGFsIG9yaWVudGF0aW9uLCBsaW1pdCB0aGUgY29sdW1uc1xuICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IGdyaWQubGVuZ3RoIC0gc2l6ZSArIDE7IGNvbCsrKSB7XG4gICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBncmlkW2NvbF0ubGVuZ3RoOyByb3crKykge1xuICAgICAgICB2YWxpZFN0YXJ0cy5wdXNoKGdyaWRbY29sXVtyb3ddKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gRm9yIHZlcnRpY2FsIG9yaWVudGF0aW9uLCBsaW1pdCB0aGUgcm93c1xuICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IGdyaWRbMF0ubGVuZ3RoIC0gc2l6ZSArIDE7IHJvdysrKSB7XG4gICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCBncmlkLmxlbmd0aDsgY29sKyspIHtcbiAgICAgICAgdmFsaWRTdGFydHMucHVzaChncmlkW2NvbF1bcm93XSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gUmFuZG9tbHkgc2VsZWN0IGEgc3RhcnRpbmcgcG9zaXRpb25cbiAgY29uc3QgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB2YWxpZFN0YXJ0cy5sZW5ndGgpO1xuICByZXR1cm4gdmFsaWRTdGFydHNbcmFuZG9tSW5kZXhdO1xufTtcblxuY29uc3QgYXV0b1BsYWNlbWVudCA9IChnYW1lYm9hcmQpID0+IHtcbiAgY29uc3Qgc2hpcFR5cGVzID0gW1xuICAgIHsgdHlwZTogXCJjYXJyaWVyXCIsIHNpemU6IDUgfSxcbiAgICB7IHR5cGU6IFwiYmF0dGxlc2hpcFwiLCBzaXplOiA0IH0sXG4gICAgeyB0eXBlOiBcImNydWlzZXJcIiwgc2l6ZTogMyB9LFxuICAgIHsgdHlwZTogXCJzdWJtYXJpbmVcIiwgc2l6ZTogMyB9LFxuICAgIHsgdHlwZTogXCJkZXN0cm95ZXJcIiwgc2l6ZTogMiB9LFxuICBdO1xuXG4gIHNoaXBUeXBlcy5mb3JFYWNoKChzaGlwKSA9PiB7XG4gICAgbGV0IHBsYWNlZCA9IGZhbHNlO1xuICAgIHdoaWxlICghcGxhY2VkKSB7XG4gICAgICBjb25zdCBkaXJlY3Rpb24gPSBNYXRoLnJhbmRvbSgpIDwgMC41ID8gXCJoXCIgOiBcInZcIjtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gZ2VuZXJhdGVSYW5kb21TdGFydChzaGlwLnNpemUsIGRpcmVjdGlvbiwgZ2FtZWJvYXJkLmdyaWQpO1xuXG4gICAgICB0cnkge1xuICAgICAgICBnYW1lYm9hcmQucGxhY2VTaGlwKHNoaXAudHlwZSwgc3RhcnQsIGRpcmVjdGlvbik7XG4gICAgICAgIHBsYWNlZCA9IHRydWU7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgIShlcnJvciBpbnN0YW5jZW9mIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yKSAmJlxuICAgICAgICAgICEoZXJyb3IgaW5zdGFuY2VvZiBPdmVybGFwcGluZ1NoaXBzRXJyb3IpXG4gICAgICAgICkge1xuICAgICAgICAgIHRocm93IGVycm9yOyAvLyBSZXRocm93IG5vbi1wbGFjZW1lbnQgZXJyb3JzXG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgcGxhY2VtZW50IGZhaWxzLCBjYXRjaCB0aGUgZXJyb3IgYW5kIHRyeSBhZ2FpblxuICAgICAgfVxuICAgIH1cbiAgfSk7XG59O1xuXG5jb25zdCBQbGF5ZXIgPSAoZ2FtZWJvYXJkLCB0eXBlKSA9PiB7XG4gIGNvbnN0IG1vdmVMb2cgPSBbXTtcblxuICBjb25zdCBwbGFjZVNoaXBzID0gKHNoaXBUeXBlLCBzdGFydCwgZGlyZWN0aW9uKSA9PiB7XG4gICAgaWYgKHR5cGUgPT09IFwiaHVtYW5cIikge1xuICAgICAgZ2FtZWJvYXJkLnBsYWNlU2hpcChzaGlwVHlwZSwgc3RhcnQsIGRpcmVjdGlvbik7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImNvbXB1dGVyXCIpIHtcbiAgICAgIGF1dG9QbGFjZW1lbnQoZ2FtZWJvYXJkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQbGF5ZXJUeXBlRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIHBsYXllciB0eXBlLiBWYWxpZCBwbGF5ZXIgdHlwZXM6IFwiaHVtYW5cIiAmIFwiY29tcHV0ZXJcIi4gRW50ZXJlZDogJHt0eXBlfS5gLFxuICAgICAgKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgbWFrZU1vdmUgPSAob3BwR2FtZWJvYXJkLCBpbnB1dCkgPT4ge1xuICAgIGxldCBtb3ZlO1xuXG4gICAgLy8gQ2hlY2sgZm9yIHRoZSB0eXBlIG9mIHBsYXllclxuICAgIGlmICh0eXBlID09PSBcImh1bWFuXCIpIHtcbiAgICAgIC8vIEZvcm1hdCB0aGUgaW5wdXRcbiAgICAgIG1vdmUgPSBgJHtpbnB1dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKX0ke2lucHV0LnN1YnN0cmluZygxKX1gO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJjb21wdXRlclwiKSB7XG4gICAgICBtb3ZlID0gcmFuZE1vdmUob3BwR2FtZWJvYXJkLmdyaWQsIG1vdmVMb2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBsYXllclR5cGVFcnJvcihcbiAgICAgICAgYEludmFsaWQgcGxheWVyIHR5cGUuIFZhbGlkIHBsYXllciB0eXBlczogXCJodW1hblwiICYgXCJjb21wdXRlclwiLiBFbnRlcmVkOiAke3R5cGV9LmAsXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHRoZSBpbnB1dCBhZ2FpbnN0IHRoZSBwb3NzaWJsZSBtb3ZlcyBvbiB0aGUgZ2FtZWJvYXJkJ3MgZ3JpZFxuICAgIGlmICghY2hlY2tNb3ZlKG1vdmUsIG9wcEdhbWVib2FyZC5ncmlkKSkge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRNb3ZlRW50cnlFcnJvcihgSW52YWxpZCBtb3ZlIGVudHJ5ISBNb3ZlOiAke21vdmV9LmApO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBtb3ZlIGV4aXN0cyBpbiB0aGUgbW92ZUxvZyBhcnJheSwgdGhyb3cgYW4gZXJyb3JcbiAgICBpZiAobW92ZUxvZy5maW5kKChlbCkgPT4gZWwgPT09IG1vdmUpKSB7XG4gICAgICB0aHJvdyBuZXcgUmVwZWF0QXR0YWNrZWRFcnJvcigpO1xuICAgIH1cblxuICAgIC8vIEVsc2UsIGNhbGwgYXR0YWNrIG1ldGhvZCBvbiBnYW1lYm9hcmQgYW5kIGxvZyBtb3ZlIGluIG1vdmVMb2dcbiAgICBjb25zdCByZXNwb25zZSA9IG9wcEdhbWVib2FyZC5hdHRhY2sobW92ZSk7XG4gICAgbW92ZUxvZy5wdXNoKG1vdmUpO1xuICAgIC8vIFJldHVybiB0aGUgcmVzcG9uc2Ugb2YgdGhlIGF0dGFjayAob2JqZWN0OiB7IGhpdDogZmFsc2UgfSBmb3IgbWlzczsgeyBoaXQ6IHRydWUsIHNoaXBUeXBlOiBzdHJpbmcgfSBmb3IgaGl0KS5cbiAgICByZXR1cm4geyBwbGF5ZXI6IHR5cGUsIG1vdmUsIC4uLnJlc3BvbnNlIH07XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBnZXQgdHlwZSgpIHtcbiAgICAgIHJldHVybiB0eXBlO1xuICAgIH0sXG4gICAgZ2V0IGdhbWVib2FyZCgpIHtcbiAgICAgIHJldHVybiBnYW1lYm9hcmQ7XG4gICAgfSxcbiAgICBnZXQgbW92ZUxvZygpIHtcbiAgICAgIHJldHVybiBtb3ZlTG9nO1xuICAgIH0sXG4gICAgbWFrZU1vdmUsXG4gICAgcGxhY2VTaGlwcyxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXllcjtcbiIsImltcG9ydCB7IEludmFsaWRTaGlwVHlwZUVycm9yIH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5cbmNvbnN0IFNoaXAgPSAodHlwZSkgPT4ge1xuICBjb25zdCBzZXRMZW5ndGggPSAoKSA9PiB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIFwiY2FycmllclwiOlxuICAgICAgICByZXR1cm4gNTtcbiAgICAgIGNhc2UgXCJiYXR0bGVzaGlwXCI6XG4gICAgICAgIHJldHVybiA0O1xuICAgICAgY2FzZSBcImNydWlzZXJcIjpcbiAgICAgIGNhc2UgXCJzdWJtYXJpbmVcIjpcbiAgICAgICAgcmV0dXJuIDM7XG4gICAgICBjYXNlIFwiZGVzdHJveWVyXCI6XG4gICAgICAgIHJldHVybiAyO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEludmFsaWRTaGlwVHlwZUVycm9yKCk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHNoaXBMZW5ndGggPSBzZXRMZW5ndGgoKTtcblxuICBsZXQgaGl0cyA9IDA7XG5cbiAgY29uc3QgaGl0ID0gKCkgPT4ge1xuICAgIGlmIChoaXRzIDwgc2hpcExlbmd0aCkge1xuICAgICAgaGl0cyArPSAxO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldCB0eXBlKCkge1xuICAgICAgcmV0dXJuIHR5cGU7XG4gICAgfSxcbiAgICBnZXQgc2hpcExlbmd0aCgpIHtcbiAgICAgIHJldHVybiBzaGlwTGVuZ3RoO1xuICAgIH0sXG4gICAgZ2V0IGhpdHMoKSB7XG4gICAgICByZXR1cm4gaGl0cztcbiAgICB9LFxuICAgIGdldCBpc1N1bmsoKSB7XG4gICAgICByZXR1cm4gaGl0cyA9PT0gc2hpcExlbmd0aDtcbiAgICB9LFxuICAgIGhpdCxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFNoaXA7XG4iLCJjb25zdCBpbnN0cnVjdGlvbkNsciA9IFwidGV4dC1saW1lLTYwMFwiO1xuY29uc3QgZ3VpZGVDbHIgPSBcInRleHQtc2t5LTYwMFwiO1xuY29uc3QgZXJyb3JDbHIgPSBcInRleHQtcmVkLTcwMFwiO1xuY29uc3QgZGVmYXVsdENsciA9IFwidGV4dC1ncmF5LTcwMFwiO1xuXG5jb25zdCBjZWxsQ2xyID0gXCJiZy1ncmF5LTIwMFwiO1xuY29uc3QgaW5wdXRDbHIgPSBcImJnLWdyYXktNDAwXCI7XG5jb25zdCBvdXB1dENsciA9IGNlbGxDbHI7XG5jb25zdCBidXR0b25DbHIgPSBcImJnLWdyYXktODAwXCI7XG5jb25zdCBidXR0b25UZXh0Q2xyID0gXCJiZy1ncmF5LTEwMFwiO1xuXG5jb25zdCBzaGlwU2VjdENsciA9IFwiYmctc2t5LTcwMFwiO1xuY29uc3Qgc2hpcEhpdENsciA9IFwiYmctcmVkLTYwMFwiO1xuY29uc3Qgc2hpcFN1bmtDbHIgPSBcImJnLWdyYXktNDAwXCI7XG5jb25zdCBwcmltYXJ5SG92ZXJDbHIgPSBcImhvdmVyOmJnLW9yYW5nZS01MDBcIjtcblxuLy8gRnVuY3Rpb24gZm9yIGJ1aWxkaW5nIGEgc2hpcCwgZGVwZW5kaW5nIG9uIHRoZSBzaGlwIHR5cGVcbmNvbnN0IGJ1aWxkU2hpcCA9IChvYmosIGRvbVNlbCwgc2hpcFBvc2l0aW9ucykgPT4ge1xuICAvLyBFeHRyYWN0IHRoZSBzaGlwJ3MgdHlwZSBhbmQgbGVuZ3RoIGZyb20gdGhlIG9iamVjdFxuICBjb25zdCB7IHR5cGUsIHNoaXBMZW5ndGg6IGxlbmd0aCB9ID0gb2JqO1xuICAvLyBDcmVhdGUgYW5kIGFycmF5IGZvciB0aGUgc2hpcCdzIHNlY3Rpb25zXG4gIGNvbnN0IHNoaXBTZWN0cyA9IFtdO1xuXG4gIC8vIFVzZSB0aGUgbGVuZ3RoIG9mIHRoZSBzaGlwIHRvIGNyZWF0ZSB0aGUgY29ycmVjdCBudW1iZXIgb2Ygc2VjdGlvbnNcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIC8vIEdldCBhIHBvc2l0aW9uIGZyb20gdGhlIGFycmF5XG4gICAgY29uc3QgcG9zaXRpb24gPSBzaGlwUG9zaXRpb25zW2ldO1xuICAgIC8vIENyZWF0ZSBhbiBlbGVtZW50IGZvciB0aGUgc2VjdGlvblxuICAgIGNvbnN0IHNlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHNlY3QuY2xhc3NOYW1lID0gYHctNCBoLTQgcm91bmRlZC1mdWxsYDsgLy8gU2V0IHRoZSBkZWZhdWx0IHN0eWxpbmcgZm9yIHRoZSBzZWN0aW9uIGVsZW1lbnRcbiAgICBzZWN0LmNsYXNzTGlzdC5hZGQoc2hpcFNlY3RDbHIpO1xuICAgIC8vIFNldCBhIHVuaXF1ZSBpZCBmb3IgdGhlIHNoaXAgc2VjdGlvblxuICAgIHNlY3Quc2V0QXR0cmlidXRlKFwiaWRcIiwgYERPTS0ke2RvbVNlbH0tc2hpcFR5cGUtJHt0eXBlfS1wb3MtJHtwb3NpdGlvbn1gKTtcbiAgICAvLyBTZXQgYSBkYXRhc2V0IHByb3BlcnR5IG9mIFwicG9zaXRpb25cIiBmb3IgdGhlIHNlY3Rpb25cbiAgICBzZWN0LmRhdGFzZXQucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICBzaGlwU2VjdHMucHVzaChzZWN0KTsgLy8gQWRkIHRoZSBzZWN0aW9uIHRvIHRoZSBhcnJheVxuICB9XG5cbiAgLy8gUmV0dXJuIHRoZSBhcnJheSBvZiBzaGlwIHNlY3Rpb25zXG4gIHJldHVybiBzaGlwU2VjdHM7XG59O1xuXG5jb25zdCBVaU1hbmFnZXIgPSAoKSA9PiB7XG4gIGNvbnN0IGNyZWF0ZUdhbWVib2FyZCA9IChjb250YWluZXJJRCkgPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcklEKTtcblxuICAgIC8vIFNldCBwbGF5ZXIgdHlwZSBkZXBlbmRpbmcgb24gdGhlIGNvbnRhaW5lcklEXG4gICAgY29uc3QgeyBwbGF5ZXIgfSA9IGNvbnRhaW5lci5kYXRhc2V0O1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBncmlkIGNvbnRhaW5lclxuICAgIGNvbnN0IGdyaWREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGdyaWREaXYuY2xhc3NOYW1lID1cbiAgICAgIFwiZ2FtZWJvYXJkLWFyZWEgZ3JpZCBncmlkLWNvbHMtMTEgYXV0by1yb3dzLW1pbiBnYXAtMSBwLTZcIjtcbiAgICBncmlkRGl2LmRhdGFzZXQucGxheWVyID0gcGxheWVyO1xuXG4gICAgLy8gQWRkIHRoZSB0b3AtbGVmdCBjb3JuZXIgZW1wdHkgY2VsbFxuICAgIGdyaWREaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSk7XG5cbiAgICAvLyBBZGQgY29sdW1uIGhlYWRlcnMgQS1KXG4gICAgY29uc3QgY29sdW1ucyA9IFwiQUJDREVGR0hJSlwiO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sdW1ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIGhlYWRlci5jbGFzc05hbWUgPSBcInRleHQtY2VudGVyXCI7XG4gICAgICBoZWFkZXIudGV4dENvbnRlbnQgPSBjb2x1bW5zW2ldO1xuICAgICAgZ3JpZERpdi5hcHBlbmRDaGlsZChoZWFkZXIpO1xuICAgIH1cblxuICAgIC8vIEFkZCByb3cgbGFiZWxzIGFuZCBjZWxsc1xuICAgIGZvciAobGV0IHJvdyA9IDE7IHJvdyA8PSAxMDsgcm93KyspIHtcbiAgICAgIC8vIFJvdyBsYWJlbFxuICAgICAgY29uc3Qgcm93TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgcm93TGFiZWwuY2xhc3NOYW1lID0gXCJ0ZXh0LWNlbnRlclwiO1xuICAgICAgcm93TGFiZWwudGV4dENvbnRlbnQgPSByb3c7XG4gICAgICBncmlkRGl2LmFwcGVuZENoaWxkKHJvd0xhYmVsKTtcblxuICAgICAgLy8gQ2VsbHMgZm9yIGVhY2ggcm93XG4gICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCAxMDsgY29sKyspIHtcbiAgICAgICAgY29uc3QgY2VsbElkID0gYCR7Y29sdW1uc1tjb2xdfSR7cm93fWA7IC8vIFNldCB0aGUgY2VsbElkXG4gICAgICAgIGNvbnN0IGNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjZWxsLmlkID0gYCR7cGxheWVyfS0ke2NlbGxJZH1gOyAvLyBTZXQgdGhlIGVsZW1lbnQgaWRcbiAgICAgICAgY2VsbC5jbGFzc05hbWUgPSBgdy02IGgtNiBmbGV4IGp1c3RpZnktY2VudGVyIGl0ZW1zLWNlbnRlciBjdXJzb3ItcG9pbnRlcmA7IC8vIEFkZCBtb3JlIGNsYXNzZXMgYXMgbmVlZGVkIGZvciBzdHlsaW5nXG4gICAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChwcmltYXJ5SG92ZXJDbHIpO1xuICAgICAgICBjZWxsLmNsYXNzTGlzdC5hZGQoY2VsbENscik7XG4gICAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChcImdhbWVib2FyZC1jZWxsXCIpOyAvLyBBZGQgYSBjbGFzcyBuYW1lIHRvIGVhY2ggY2VsbCB0byBhY3QgYXMgYSBzZWxlY3RvclxuICAgICAgICBjZWxsLmRhdGFzZXQucG9zaXRpb24gPSBjZWxsSWQ7IC8vIEFzc2lnbiBwb3NpdGlvbiBkYXRhIGF0dHJpYnV0ZSBmb3IgaWRlbnRpZmljYXRpb25cbiAgICAgICAgY2VsbC5kYXRhc2V0LnBsYXllciA9IHBsYXllcjsgLy8gQXNzaWduIHBsYXllciBkYXRhIGF0dHJpYnV0ZSBmb3IgaWRlbnRpZmljYXRpb25cblxuICAgICAgICBncmlkRGl2LmFwcGVuZENoaWxkKGNlbGwpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFwcGVuZCB0aGUgZ3JpZCB0byB0aGUgY29udGFpbmVyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGdyaWREaXYpO1xuICB9O1xuXG4gIGNvbnN0IGluaXRDb25zb2xlVUkgPSAoKSA9PiB7XG4gICAgY29uc3QgY29uc29sZUNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZVwiKTsgLy8gR2V0IHRoZSBjb25zb2xlIGNvbnRhaW5lciBmcm9tIHRoZSBET01cbiAgICBjb25zb2xlQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXG4gICAgICBcImZsZXhcIixcbiAgICAgIFwiZmxleC1jb2xcIixcbiAgICAgIFwianVzdGlmeS1iZXR3ZWVuXCIsXG4gICAgICBcInRleHQtc21cIixcbiAgICApOyAvLyBTZXQgZmxleGJveCBydWxlcyBmb3IgY29udGFpbmVyXG5cbiAgICAvLyBDcmVhdGUgYSBjb250YWluZXIgZm9yIHRoZSBpbnB1dCBhbmQgYnV0dG9uIGVsZW1lbnRzXG4gICAgY29uc3QgaW5wdXREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGlucHV0RGl2LmNsYXNzTmFtZSA9IFwiZmxleCBmbGV4LXJvdyB3LWZ1bGwgaC0xLzUganVzdGlmeS1iZXR3ZWVuXCI7IC8vIFNldCB0aGUgZmxleGJveCBydWxlcyBmb3IgdGhlIGNvbnRhaW5lclxuXG4gICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7IC8vIENyZWF0ZSBhbiBpbnB1dCBlbGVtZW50IGZvciB0aGUgY29uc29sZVxuICAgIGlucHV0LnR5cGUgPSBcInRleHRcIjsgLy8gU2V0IHRoZSBpbnB1dCB0eXBlIG9mIHRoaXMgZWxlbWVudCB0byB0ZXh0XG4gICAgaW5wdXQuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJjb25zb2xlLWlucHV0XCIpOyAvLyBTZXQgdGhlIGlkIGZvciB0aGlzIGVsZW1lbnQgdG8gXCJjb25zb2xlLWlucHV0XCJcbiAgICBpbnB1dC5jbGFzc05hbWUgPSBgcC0xIGZsZXgtMSByb3VuZGVkLWJsLW1kYDsgLy8gQWRkIFRhaWx3aW5kQ1NTIGNsYXNzZXNcbiAgICBpbnB1dC5jbGFzc0xpc3QuYWRkKGlucHV0Q2xyKTtcbiAgICBjb25zdCBzdWJtaXRCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpOyAvLyBDcmVhdGUgYSBidXR0b24gZWxlbWVudCBmb3IgdGhlIGNvbnNvbGUgc3VibWl0XG4gICAgc3VibWl0QnV0dG9uLnRleHRDb250ZW50ID0gXCJTdWJtaXRcIjsgLy8gQWRkIHRoZSB0ZXh0IFwiU3VibWl0XCIgdG8gdGhlIGJ1dHRvblxuICAgIHN1Ym1pdEJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNvbnNvbGUtc3VibWl0XCIpOyAvLyBTZXQgdGhlIGlkIGZvciB0aGUgYnV0dG9uXG4gICAgc3VibWl0QnV0dG9uLmNsYXNzTmFtZSA9IGBweC0zIHB5LTEgdGV4dC1jZW50ZXIgdGV4dC1zbSByb3VuZGVkLWJyLW1kYDsgLy8gQWRkIFRhaWx3aW5kQ1NTIGNsYXNzZXNcbiAgICBzdWJtaXRCdXR0b24uY2xhc3NMaXN0LmFkZChidXR0b25DbHIpO1xuICAgIHN1Ym1pdEJ1dHRvbi5jbGFzc0xpc3QuYWRkKGJ1dHRvblRleHRDbHIpO1xuICAgIGNvbnN0IG91dHB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7IC8vIENyZWF0ZSBhbiBkaXYgZWxlbWVudCBmb3IgdGhlIG91dHB1dCBvZiB0aGUgY29uc29sZVxuICAgIG91dHB1dC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNvbnNvbGUtb3V0cHV0XCIpOyAvLyBTZXQgdGhlIGlkIGZvciB0aGUgb3V0cHV0IGVsZW1lbnRcbiAgICBvdXRwdXQuY2xhc3NOYW1lID0gYHAtMSBmbGV4LTEgaC00LzUgb3ZlcmZsb3ctYXV0byByb3VuZGVkLXQtbWQgYmctZ3JhZGllbnQtdG8tdHIgZnJvbS1ncmF5LTMwMCB0by1ncmF5LTEwMGA7IC8vIEFkZCBUYWlsd2luZENTUyBjbGFzc2VzXG4gICAgLy8gb3V0cHV0LmNsYXNzTGlzdC5hZGQob3VwdXRDbHIpO1xuXG4gICAgLy8gQWRkIHRoZSBpbnB1dCBlbGVtZW50cyB0byB0aGUgaW5wdXQgY29udGFpbmVyXG4gICAgaW5wdXREaXYuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgIGlucHV0RGl2LmFwcGVuZENoaWxkKHN1Ym1pdEJ1dHRvbik7XG5cbiAgICAvLyBBcHBlbmQgZWxlbWVudHMgdG8gdGhlIGNvbnNvbGUgY29udGFpbmVyXG4gICAgY29uc29sZUNvbnRhaW5lci5hcHBlbmRDaGlsZChvdXRwdXQpO1xuICAgIGNvbnNvbGVDb250YWluZXIuYXBwZW5kQ2hpbGQoaW5wdXREaXYpO1xuICB9O1xuXG4gIGNvbnN0IGRpc3BsYXlQcm9tcHQgPSAocHJvbXB0T2JqcykgPT4ge1xuICAgIC8vIEdldCB0aGUgcHJvbXB0IGRpc3BsYXlcbiAgICBjb25zdCBkaXNwbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcm9tcHQtZGlzcGxheVwiKTtcblxuICAgIC8vIENsZWFyIHRoZSBkaXNwbGF5IG9mIGFsbCBjaGlsZHJlblxuICAgIHdoaWxlIChkaXNwbGF5LmZpcnN0Q2hpbGQpIHtcbiAgICAgIGRpc3BsYXkucmVtb3ZlQ2hpbGQoZGlzcGxheS5maXJzdENoaWxkKTtcbiAgICB9XG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgZWFjaCBwcm9tcHQgaW4gdGhlIHByb21wdHMgb2JqZWN0XG4gICAgT2JqZWN0LmVudHJpZXMocHJvbXB0T2JqcykuZm9yRWFjaCgoW2tleSwgeyBwcm9tcHQsIHByb21wdFR5cGUgfV0pID0+IHtcbiAgICAgIC8vIENyZWF0ZSBhIG5ldyBkaXYgZm9yIGVhY2ggcHJvbXB0XG4gICAgICBjb25zdCBwcm9tcHREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgcHJvbXB0RGl2LnRleHRDb250ZW50ID0gcHJvbXB0O1xuXG4gICAgICAvLyBBcHBseSBzdHlsaW5nIGJhc2VkIG9uIHByb21wdFR5cGVcbiAgICAgIHN3aXRjaCAocHJvbXB0VHlwZSkge1xuICAgICAgICBjYXNlIFwiaW5zdHJ1Y3Rpb25cIjpcbiAgICAgICAgICBwcm9tcHREaXYuY2xhc3NMaXN0LmFkZChpbnN0cnVjdGlvbkNscik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJndWlkZVwiOlxuICAgICAgICAgIHByb21wdERpdi5jbGFzc0xpc3QuYWRkKGd1aWRlQ2xyKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImVycm9yXCI6XG4gICAgICAgICAgcHJvbXB0RGl2LmNsYXNzTGlzdC5hZGQoZXJyb3JDbHIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHByb21wdERpdi5jbGFzc0xpc3QuYWRkKGRlZmF1bHRDbHIpOyAvLyBEZWZhdWx0IHRleHQgY29sb3JcbiAgICAgIH1cblxuICAgICAgLy8gQXBwZW5kIHRoZSBuZXcgZGl2IHRvIHRoZSBkaXNwbGF5IGNvbnRhaW5lclxuICAgICAgZGlzcGxheS5hcHBlbmRDaGlsZChwcm9tcHREaXYpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEZ1bmN0aW9uIGZvciByZW5kZXJpbmcgc2hpcHMgdG8gdGhlIFNoaXAgU3RhdHVzIGRpc3BsYXkgc2VjdGlvblxuICBjb25zdCByZW5kZXJTaGlwRGlzcCA9IChwbGF5ZXJPYmosIHNoaXBUeXBlKSA9PiB7XG4gICAgbGV0IGlkU2VsO1xuXG4gICAgLy8gU2V0IHRoZSBjb3JyZWN0IGlkIHNlbGVjdG9yIGZvciB0aGUgdHlwZSBvZiBwbGF5ZXJcbiAgICBpZiAocGxheWVyT2JqLnR5cGUgPT09IFwiaHVtYW5cIikge1xuICAgICAgaWRTZWwgPSBcImh1bWFuLWRpc3BsYXlcIjtcbiAgICB9IGVsc2UgaWYgKHBsYXllck9iai50eXBlID09PSBcImNvbXB1dGVyXCIpIHtcbiAgICAgIGlkU2VsID0gXCJjb21wLWRpc3BsYXlcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgRXJyb3I7XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSBjb3JyZWN0IERPTSBlbGVtZW50XG4gICAgY29uc3QgZGlzcERpdiA9IGRvY3VtZW50XG4gICAgICAuZ2V0RWxlbWVudEJ5SWQoaWRTZWwpXG4gICAgICAucXVlcnlTZWxlY3RvcihcIi5zaGlwcy1jb250YWluZXJcIik7XG5cbiAgICAvLyBHZXQgdGhlIHNoaXAgZnJvbSB0aGUgcGxheWVyXG4gICAgY29uc3Qgc2hpcCA9IHBsYXllck9iai5nYW1lYm9hcmQuZ2V0U2hpcChzaGlwVHlwZSk7XG5cbiAgICAvLyBDcmVhdGUgYSBkaXYgZm9yIHRoZSBzaGlwXG4gICAgY29uc3Qgc2hpcERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgc2hpcERpdi5jbGFzc05hbWUgPSBcInB4LTQgcHktMiBmbGV4IGZsZXgtY29sIGdhcC0xXCI7XG5cbiAgICAvLyBBZGQgYSB0aXRsZSB0aGUgdGhlIGRpdlxuICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImgyXCIpO1xuICAgIHRpdGxlLnRleHRDb250ZW50ID0gc2hpcFR5cGU7IC8vIFNldCB0aGUgdGl0bGUgdG8gdGhlIHNoaXAgdHlwZVxuICAgIHNoaXBEaXYuYXBwZW5kQ2hpbGQodGl0bGUpO1xuXG4gICAgLy8gR2V0IHRoZSBzaGlwIHBvc2l0aW9ucyBhcnJheVxuICAgIGNvbnN0IHNoaXBQb3NpdGlvbnMgPSBwbGF5ZXJPYmouZ2FtZWJvYXJkLmdldFNoaXBQb3NpdGlvbnMoc2hpcFR5cGUpO1xuXG4gICAgLy8gQnVpbGQgdGhlIHNoaXAgc2VjdGlvbnNcbiAgICBjb25zdCBzaGlwU2VjdHMgPSBidWlsZFNoaXAoc2hpcCwgaWRTZWwsIHNoaXBQb3NpdGlvbnMpO1xuXG4gICAgLy8gQWRkIHRoZSBzaGlwIHNlY3Rpb25zIHRvIHRoZSBkaXZcbiAgICBjb25zdCBzZWN0c0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgc2VjdHNEaXYuY2xhc3NOYW1lID0gXCJmbGV4IGZsZXgtcm93IGdhcC0xXCI7XG4gICAgc2hpcFNlY3RzLmZvckVhY2goKHNlY3QpID0+IHtcbiAgICAgIHNlY3RzRGl2LmFwcGVuZENoaWxkKHNlY3QpO1xuICAgIH0pO1xuICAgIHNoaXBEaXYuYXBwZW5kQ2hpbGQoc2VjdHNEaXYpO1xuXG4gICAgZGlzcERpdi5hcHBlbmRDaGlsZChzaGlwRGl2KTtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiBmb3IgciBzaGlwcyBvbiB0aGUgZ2FtZWJvYXJkXG4gIGNvbnN0IHJlbmRlclNoaXBCb2FyZCA9IChwbGF5ZXJPYmosIHNoaXBUeXBlKSA9PiB7XG4gICAgbGV0IGlkU2VsO1xuXG4gICAgLy8gU2V0IHRoZSBjb3JyZWN0IGlkIHNlbGVjdG9yIGZvciB0aGUgdHlwZSBvZiBwbGF5ZXJcbiAgICBpZiAocGxheWVyT2JqLnR5cGUgPT09IFwiaHVtYW5cIikge1xuICAgICAgaWRTZWwgPSBcImh1bWFuLWJvYXJkXCI7XG4gICAgfSBlbHNlIGlmIChwbGF5ZXJPYmoudHlwZSA9PT0gXCJjb21wdXRlclwiKSB7XG4gICAgICBpZFNlbCA9IFwiY29tcC1ib2FyZFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcihcIk5vIG1hdGNoaW5nIHBsYXllciB0eXBlIGluICdyZW5kZXJTaGlwQm9hcmQnIGZ1bmN0aW9uXCIpO1xuICAgIH1cblxuICAgIC8vIEdldCB0aGUgcGxheWVyJ3MgdHlwZSBhbmQgZ2FtZWJvYXJkXG4gICAgY29uc3QgeyB0eXBlOiBwbGF5ZXJUeXBlLCBnYW1lYm9hcmQgfSA9IHBsYXllck9iajtcblxuICAgIC8vIEdldCB0aGUgc2hpcCBhbmQgdGhlIHNoaXAgcG9zaXRpb25zXG4gICAgY29uc3Qgc2hpcE9iaiA9IGdhbWVib2FyZC5nZXRTaGlwKHNoaXBUeXBlKTtcbiAgICBjb25zdCBzaGlwUG9zaXRpb25zID0gZ2FtZWJvYXJkLmdldFNoaXBQb3NpdGlvbnMoc2hpcFR5cGUpO1xuXG4gICAgLy8gQnVpbGQgdGhlIHNoaXAgc2VjdGlvbnNcbiAgICBjb25zdCBzaGlwU2VjdHMgPSBidWlsZFNoaXAoc2hpcE9iaiwgaWRTZWwsIHNoaXBQb3NpdGlvbnMpO1xuXG4gICAgLy8gTWF0Y2ggdGhlIGNlbGwgcG9zaXRpb25zIHdpdGggdGhlIHNoaXAgc2VjdGlvbnMgYW5kIHBsYWNlIGVhY2hcbiAgICAvLyBzaGlwIHNlY3Rpb24gaW4gdGhlIGNvcnJlc3BvbmRpbmcgY2VsbCBlbGVtZW50XG4gICAgc2hpcFBvc2l0aW9ucy5mb3JFYWNoKChwb3NpdGlvbikgPT4ge1xuICAgICAgY29uc3QgY2VsbEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtwbGF5ZXJUeXBlfS0ke3Bvc2l0aW9ufWApO1xuICAgICAgLy8gRmluZCB0aGUgc2hpcCBzZWN0aW9uIGVsZW1lbnQgdGhhdCBtYXRjaGVzIHRoZSBjdXJyZW50IHBvc2l0aW9uXG4gICAgICBjb25zdCBzaGlwU2VjdCA9IHNoaXBTZWN0cy5maW5kKFxuICAgICAgICAoc2VjdGlvbikgPT4gc2VjdGlvbi5kYXRhc2V0LnBvc2l0aW9uID09PSBwb3NpdGlvbixcbiAgICAgICk7XG5cbiAgICAgIGlmIChjZWxsRWxlbWVudCAmJiBzaGlwU2VjdCkge1xuICAgICAgICAvLyBQbGFjZSB0aGUgc2hpcCBzZWN0aW9uIGluIHRoZSBjZWxsXG4gICAgICAgIGNlbGxFbGVtZW50LmFwcGVuZENoaWxkKHNoaXBTZWN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBjb25zdCB1cGRhdGVTaGlwU2VjdGlvbiA9IChwb3MsIHNoaXBUeXBlLCBwbGF5ZXJUeXBlLCBpc1NoaXBTdW5rID0gZmFsc2UpID0+IHtcbiAgICBsZXQgbmV3Q2xyO1xuXG4gICAgc3dpdGNoIChpc1NoaXBTdW5rKSB7XG4gICAgICBjYXNlIHRydWU6XG4gICAgICAgIG5ld0NsciA9IHNoaXBTdW5rQ2xyO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIG5ld0NsciA9IHNoaXBIaXRDbHI7XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBzZWxlY3RvciB2YWx1ZSBkZXBlbmRpbmcgb24gdGhlIHBsYXllciB0eXBlXG4gICAgY29uc3QgcGxheWVySWQgPSBwbGF5ZXJUeXBlID09PSBcImh1bWFuXCIgPyBcImh1bWFuXCIgOiBcImNvbXBcIjtcblxuICAgIC8vIElmIHBsYXllciB0eXBlIGlzIGh1bWFuIHRoZW4gYWxzbyB1cGRhdGUgdGhlIHNoaXAgc2VjdGlvbiBvbiB0aGUgYm9hcmRcbiAgICBpZiAocGxheWVySWQgPT09IFwiaHVtYW5cIiB8fCBpc1NoaXBTdW5rKSB7XG4gICAgICAvLyBHZXQgdGhlIGNvcnJlY3Qgc2hpcCBzZWN0aW9uIGVsZW1lbnQgZnJvbSB0aGUgRE9NIGZvciB0aGVcbiAgICAgIC8vIHN0YXR1cyBkaXNwbGF5XG4gICAgICBjb25zdCBzaGlwU2VjdERpc3BsYXlFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgICBgRE9NLSR7cGxheWVySWR9LWRpc3BsYXktc2hpcFR5cGUtJHtzaGlwVHlwZX0tcG9zLSR7cG9zfWAsXG4gICAgICApO1xuXG4gICAgICAvLyBJZiB0aGUgZWxlbWVudCB3YXMgZm91bmQgc3VjY2Vzc2Z1bGx5LCBjaGFuZ2UgaXRzIGNvbG91ciwgb3RoZXJ3aXNlXG4gICAgICAvLyB0aHJvdyBlcnJvclxuICAgICAgaWYgKCFzaGlwU2VjdERpc3BsYXlFbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgXCJFcnJvciEgU2hpcCBzZWN0aW9uIGVsZW1lbnQgbm90IGZvdW5kIGluIHN0YXR1cyBkaXNwbGF5ISAodXBkYXRlU2hpcFNlY3Rpb24pXCIsXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaGlwU2VjdERpc3BsYXlFbC5jbGFzc0xpc3QucmVtb3ZlKHNoaXBTZWN0Q2xyKTtcbiAgICAgICAgc2hpcFNlY3REaXNwbGF5RWwuY2xhc3NMaXN0LnJlbW92ZShzaGlwSGl0Q2xyKTtcbiAgICAgICAgc2hpcFNlY3REaXNwbGF5RWwuY2xhc3NMaXN0LmFkZChuZXdDbHIpO1xuICAgICAgfVxuXG4gICAgICBpZiAocGxheWVySWQgPT09IFwiaHVtYW5cIikge1xuICAgICAgICAvLyBHZXQgdGhlIGNvcnJlY3Qgc2hpcCBzZWN0aW9uIGVsZW1lbnQgZnJvbSB0aGUgRE9NIGZvciB0aGVcbiAgICAgICAgLy8gZ2FtZWJvYXJkIGRpc3BsYXlcbiAgICAgICAgY29uc3Qgc2hpcFNlY3RCb2FyZEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICAgICAgYERPTS0ke3BsYXllcklkfS1ib2FyZC1zaGlwVHlwZS0ke3NoaXBUeXBlfS1wb3MtJHtwb3N9YCxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBJZiB0aGUgZWxlbWVudCB3YXMgZm91bmQgc3VjY2Vzc2Z1bGx5LCBjaGFuZ2UgaXRzIGNvbG91ciwgb3RoZXJ3aXNlXG4gICAgICAgIC8vIHRocm93IGVycm9yXG4gICAgICAgIGlmICghc2hpcFNlY3RCb2FyZEVsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgXCJFcnJvciEgU2hpcCBzZWN0aW9uIGVsZW1lbnQgbm90IGZvdW5kIG9uIGdhbWVib2FyZCEgKHVwZGF0ZVNoaXBTZWN0aW9uKVwiLFxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2hpcFNlY3RCb2FyZEVsLmNsYXNzTGlzdC5yZW1vdmUoc2hpcFNlY3RDbHIpO1xuICAgICAgICAgIHNoaXBTZWN0Qm9hcmRFbC5jbGFzc0xpc3QucmVtb3ZlKHNoaXBIaXRDbHIpO1xuICAgICAgICAgIHNoaXBTZWN0Qm9hcmRFbC5jbGFzc0xpc3QuYWRkKG5ld0Nscik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgY29uc3QgcmVuZGVyU3Vua2VuU2hpcCA9IChwbGF5ZXJPYmosIHNoaXBUeXBlKSA9PiB7XG4gICAgLy8gR2V0IHRoZSBwbGF5ZXIgdHlwZVxuICAgIGNvbnN0IHsgdHlwZSB9ID0gcGxheWVyT2JqO1xuXG4gICAgLy8gR2V0IHRoZSBzaGlwIHBvc2l0aW9ucyBmb3IgdGhlIHNoaXBcbiAgICBjb25zdCBzaGlwUG9zaXRpb25zID0gcGxheWVyT2JqLmdhbWVib2FyZC5nZXRTaGlwUG9zaXRpb25zKHNoaXBUeXBlKTtcblxuICAgIHNoaXBQb3NpdGlvbnMuZm9yRWFjaCgocG9zKSA9PiB7XG4gICAgICB1cGRhdGVTaGlwU2VjdGlvbihwb3MsIHNoaXBUeXBlLCB0eXBlLCB0cnVlKTtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGNyZWF0ZUdhbWVib2FyZCxcbiAgICBpbml0Q29uc29sZVVJLFxuICAgIGRpc3BsYXlQcm9tcHQsXG4gICAgcmVuZGVyU2hpcERpc3AsXG4gICAgcmVuZGVyU2hpcEJvYXJkLFxuICAgIHVwZGF0ZVNoaXBTZWN0aW9uLFxuICAgIHJlbmRlclN1bmtlblNoaXAsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBVaU1hbmFnZXI7XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBgLypcbiEgdGFpbHdpbmRjc3MgdjMuNC4xIHwgTUlUIExpY2Vuc2UgfCBodHRwczovL3RhaWx3aW5kY3NzLmNvbVxuKi8vKlxuMS4gUHJldmVudCBwYWRkaW5nIGFuZCBib3JkZXIgZnJvbSBhZmZlY3RpbmcgZWxlbWVudCB3aWR0aC4gKGh0dHBzOi8vZ2l0aHViLmNvbS9tb3pkZXZzL2Nzc3JlbWVkeS9pc3N1ZXMvNClcbjIuIEFsbG93IGFkZGluZyBhIGJvcmRlciB0byBhbiBlbGVtZW50IGJ5IGp1c3QgYWRkaW5nIGEgYm9yZGVyLXdpZHRoLiAoaHR0cHM6Ly9naXRodWIuY29tL3RhaWx3aW5kY3NzL3RhaWx3aW5kY3NzL3B1bGwvMTE2KVxuKi9cblxuKixcbjo6YmVmb3JlLFxuOjphZnRlciB7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7IC8qIDEgKi9cbiAgYm9yZGVyLXdpZHRoOiAwOyAvKiAyICovXG4gIGJvcmRlci1zdHlsZTogc29saWQ7IC8qIDIgKi9cbiAgYm9yZGVyLWNvbG9yOiAjZTVlN2ViOyAvKiAyICovXG59XG5cbjo6YmVmb3JlLFxuOjphZnRlciB7XG4gIC0tdHctY29udGVudDogJyc7XG59XG5cbi8qXG4xLiBVc2UgYSBjb25zaXN0ZW50IHNlbnNpYmxlIGxpbmUtaGVpZ2h0IGluIGFsbCBicm93c2Vycy5cbjIuIFByZXZlbnQgYWRqdXN0bWVudHMgb2YgZm9udCBzaXplIGFmdGVyIG9yaWVudGF0aW9uIGNoYW5nZXMgaW4gaU9TLlxuMy4gVXNlIGEgbW9yZSByZWFkYWJsZSB0YWIgc2l6ZS5cbjQuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgc2Fuc1xcYCBmb250LWZhbWlseSBieSBkZWZhdWx0LlxuNS4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBzYW5zXFxgIGZvbnQtZmVhdHVyZS1zZXR0aW5ncyBieSBkZWZhdWx0LlxuNi4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBzYW5zXFxgIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzIGJ5IGRlZmF1bHQuXG43LiBEaXNhYmxlIHRhcCBoaWdobGlnaHRzIG9uIGlPU1xuKi9cblxuaHRtbCxcbjpob3N0IHtcbiAgbGluZS1oZWlnaHQ6IDEuNTsgLyogMSAqL1xuICAtd2Via2l0LXRleHQtc2l6ZS1hZGp1c3Q6IDEwMCU7IC8qIDIgKi9cbiAgLW1vei10YWItc2l6ZTogNDsgLyogMyAqL1xuICAtby10YWItc2l6ZTogNDtcbiAgICAgdGFiLXNpemU6IDQ7IC8qIDMgKi9cbiAgZm9udC1mYW1pbHk6IHVpLXNhbnMtc2VyaWYsIHN5c3RlbS11aSwgc2Fucy1zZXJpZiwgXCJBcHBsZSBDb2xvciBFbW9qaVwiLCBcIlNlZ29lIFVJIEVtb2ppXCIsIFwiU2Vnb2UgVUkgU3ltYm9sXCIsIFwiTm90byBDb2xvciBFbW9qaVwiOyAvKiA0ICovXG4gIGZvbnQtZmVhdHVyZS1zZXR0aW5nczogbm9ybWFsOyAvKiA1ICovXG4gIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzOiBub3JtYWw7IC8qIDYgKi9cbiAgLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOiB0cmFuc3BhcmVudDsgLyogNyAqL1xufVxuXG4vKlxuMS4gUmVtb3ZlIHRoZSBtYXJnaW4gaW4gYWxsIGJyb3dzZXJzLlxuMi4gSW5oZXJpdCBsaW5lLWhlaWdodCBmcm9tIFxcYGh0bWxcXGAgc28gdXNlcnMgY2FuIHNldCB0aGVtIGFzIGEgY2xhc3MgZGlyZWN0bHkgb24gdGhlIFxcYGh0bWxcXGAgZWxlbWVudC5cbiovXG5cbmJvZHkge1xuICBtYXJnaW46IDA7IC8qIDEgKi9cbiAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7IC8qIDIgKi9cbn1cblxuLypcbjEuIEFkZCB0aGUgY29ycmVjdCBoZWlnaHQgaW4gRmlyZWZveC5cbjIuIENvcnJlY3QgdGhlIGluaGVyaXRhbmNlIG9mIGJvcmRlciBjb2xvciBpbiBGaXJlZm94LiAoaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTkwNjU1KVxuMy4gRW5zdXJlIGhvcml6b250YWwgcnVsZXMgYXJlIHZpc2libGUgYnkgZGVmYXVsdC5cbiovXG5cbmhyIHtcbiAgaGVpZ2h0OiAwOyAvKiAxICovXG4gIGNvbG9yOiBpbmhlcml0OyAvKiAyICovXG4gIGJvcmRlci10b3Atd2lkdGg6IDFweDsgLyogMyAqL1xufVxuXG4vKlxuQWRkIHRoZSBjb3JyZWN0IHRleHQgZGVjb3JhdGlvbiBpbiBDaHJvbWUsIEVkZ2UsIGFuZCBTYWZhcmkuXG4qL1xuXG5hYmJyOndoZXJlKFt0aXRsZV0pIHtcbiAgLXdlYmtpdC10ZXh0LWRlY29yYXRpb246IHVuZGVybGluZSBkb3R0ZWQ7XG4gICAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmUgZG90dGVkO1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBkZWZhdWx0IGZvbnQgc2l6ZSBhbmQgd2VpZ2h0IGZvciBoZWFkaW5ncy5cbiovXG5cbmgxLFxuaDIsXG5oMyxcbmg0LFxuaDUsXG5oNiB7XG4gIGZvbnQtc2l6ZTogaW5oZXJpdDtcbiAgZm9udC13ZWlnaHQ6IGluaGVyaXQ7XG59XG5cbi8qXG5SZXNldCBsaW5rcyB0byBvcHRpbWl6ZSBmb3Igb3B0LWluIHN0eWxpbmcgaW5zdGVhZCBvZiBvcHQtb3V0LlxuKi9cblxuYSB7XG4gIGNvbG9yOiBpbmhlcml0O1xuICB0ZXh0LWRlY29yYXRpb246IGluaGVyaXQ7XG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgZm9udCB3ZWlnaHQgaW4gRWRnZSBhbmQgU2FmYXJpLlxuKi9cblxuYixcbnN0cm9uZyB7XG4gIGZvbnQtd2VpZ2h0OiBib2xkZXI7XG59XG5cbi8qXG4xLiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYG1vbm9cXGAgZm9udC1mYW1pbHkgYnkgZGVmYXVsdC5cbjIuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgbW9ub1xcYCBmb250LWZlYXR1cmUtc2V0dGluZ3MgYnkgZGVmYXVsdC5cbjMuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgbW9ub1xcYCBmb250LXZhcmlhdGlvbi1zZXR0aW5ncyBieSBkZWZhdWx0LlxuNC4gQ29ycmVjdCB0aGUgb2RkIFxcYGVtXFxgIGZvbnQgc2l6aW5nIGluIGFsbCBicm93c2Vycy5cbiovXG5cbmNvZGUsXG5rYmQsXG5zYW1wLFxucHJlIHtcbiAgZm9udC1mYW1pbHk6IHVpLW1vbm9zcGFjZSwgU0ZNb25vLVJlZ3VsYXIsIE1lbmxvLCBNb25hY28sIENvbnNvbGFzLCBcIkxpYmVyYXRpb24gTW9ub1wiLCBcIkNvdXJpZXIgTmV3XCIsIG1vbm9zcGFjZTsgLyogMSAqL1xuICBmb250LWZlYXR1cmUtc2V0dGluZ3M6IG5vcm1hbDsgLyogMiAqL1xuICBmb250LXZhcmlhdGlvbi1zZXR0aW5nczogbm9ybWFsOyAvKiAzICovXG4gIGZvbnQtc2l6ZTogMWVtOyAvKiA0ICovXG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgZm9udCBzaXplIGluIGFsbCBicm93c2Vycy5cbiovXG5cbnNtYWxsIHtcbiAgZm9udC1zaXplOiA4MCU7XG59XG5cbi8qXG5QcmV2ZW50IFxcYHN1YlxcYCBhbmQgXFxgc3VwXFxgIGVsZW1lbnRzIGZyb20gYWZmZWN0aW5nIHRoZSBsaW5lIGhlaWdodCBpbiBhbGwgYnJvd3NlcnMuXG4qL1xuXG5zdWIsXG5zdXAge1xuICBmb250LXNpemU6IDc1JTtcbiAgbGluZS1oZWlnaHQ6IDA7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xufVxuXG5zdWIge1xuICBib3R0b206IC0wLjI1ZW07XG59XG5cbnN1cCB7XG4gIHRvcDogLTAuNWVtO1xufVxuXG4vKlxuMS4gUmVtb3ZlIHRleHQgaW5kZW50YXRpb24gZnJvbSB0YWJsZSBjb250ZW50cyBpbiBDaHJvbWUgYW5kIFNhZmFyaS4gKGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTk5OTA4OCwgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTIwMTI5NylcbjIuIENvcnJlY3QgdGFibGUgYm9yZGVyIGNvbG9yIGluaGVyaXRhbmNlIGluIGFsbCBDaHJvbWUgYW5kIFNhZmFyaS4gKGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTkzNTcyOSwgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE5NTAxNilcbjMuIFJlbW92ZSBnYXBzIGJldHdlZW4gdGFibGUgYm9yZGVycyBieSBkZWZhdWx0LlxuKi9cblxudGFibGUge1xuICB0ZXh0LWluZGVudDogMDsgLyogMSAqL1xuICBib3JkZXItY29sb3I6IGluaGVyaXQ7IC8qIDIgKi9cbiAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsgLyogMyAqL1xufVxuXG4vKlxuMS4gQ2hhbmdlIHRoZSBmb250IHN0eWxlcyBpbiBhbGwgYnJvd3NlcnMuXG4yLiBSZW1vdmUgdGhlIG1hcmdpbiBpbiBGaXJlZm94IGFuZCBTYWZhcmkuXG4zLiBSZW1vdmUgZGVmYXVsdCBwYWRkaW5nIGluIGFsbCBicm93c2Vycy5cbiovXG5cbmJ1dHRvbixcbmlucHV0LFxub3B0Z3JvdXAsXG5zZWxlY3QsXG50ZXh0YXJlYSB7XG4gIGZvbnQtZmFtaWx5OiBpbmhlcml0OyAvKiAxICovXG4gIGZvbnQtZmVhdHVyZS1zZXR0aW5nczogaW5oZXJpdDsgLyogMSAqL1xuICBmb250LXZhcmlhdGlvbi1zZXR0aW5nczogaW5oZXJpdDsgLyogMSAqL1xuICBmb250LXNpemU6IDEwMCU7IC8qIDEgKi9cbiAgZm9udC13ZWlnaHQ6IGluaGVyaXQ7IC8qIDEgKi9cbiAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7IC8qIDEgKi9cbiAgY29sb3I6IGluaGVyaXQ7IC8qIDEgKi9cbiAgbWFyZ2luOiAwOyAvKiAyICovXG4gIHBhZGRpbmc6IDA7IC8qIDMgKi9cbn1cblxuLypcblJlbW92ZSB0aGUgaW5oZXJpdGFuY2Ugb2YgdGV4dCB0cmFuc2Zvcm0gaW4gRWRnZSBhbmQgRmlyZWZveC5cbiovXG5cbmJ1dHRvbixcbnNlbGVjdCB7XG4gIHRleHQtdHJhbnNmb3JtOiBub25lO1xufVxuXG4vKlxuMS4gQ29ycmVjdCB0aGUgaW5hYmlsaXR5IHRvIHN0eWxlIGNsaWNrYWJsZSB0eXBlcyBpbiBpT1MgYW5kIFNhZmFyaS5cbjIuIFJlbW92ZSBkZWZhdWx0IGJ1dHRvbiBzdHlsZXMuXG4qL1xuXG5idXR0b24sXG5bdHlwZT0nYnV0dG9uJ10sXG5bdHlwZT0ncmVzZXQnXSxcblt0eXBlPSdzdWJtaXQnXSB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogYnV0dG9uOyAvKiAxICovXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50OyAvKiAyICovXG4gIGJhY2tncm91bmQtaW1hZ2U6IG5vbmU7IC8qIDIgKi9cbn1cblxuLypcblVzZSB0aGUgbW9kZXJuIEZpcmVmb3ggZm9jdXMgc3R5bGUgZm9yIGFsbCBmb2N1c2FibGUgZWxlbWVudHMuXG4qL1xuXG46LW1vei1mb2N1c3Jpbmcge1xuICBvdXRsaW5lOiBhdXRvO1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBhZGRpdGlvbmFsIFxcYDppbnZhbGlkXFxgIHN0eWxlcyBpbiBGaXJlZm94LiAoaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvZ2Vja28tZGV2L2Jsb2IvMmY5ZWFjZDlkM2Q5OTVjOTM3YjQyNTFhNTU1N2Q5NWQ0OTRjOWJlMS9sYXlvdXQvc3R5bGUvcmVzL2Zvcm1zLmNzcyNMNzI4LUw3MzcpXG4qL1xuXG46LW1vei11aS1pbnZhbGlkIHtcbiAgYm94LXNoYWRvdzogbm9uZTtcbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCB2ZXJ0aWNhbCBhbGlnbm1lbnQgaW4gQ2hyb21lIGFuZCBGaXJlZm94LlxuKi9cblxucHJvZ3Jlc3Mge1xuICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XG59XG5cbi8qXG5Db3JyZWN0IHRoZSBjdXJzb3Igc3R5bGUgb2YgaW5jcmVtZW50IGFuZCBkZWNyZW1lbnQgYnV0dG9ucyBpbiBTYWZhcmkuXG4qL1xuXG46Oi13ZWJraXQtaW5uZXItc3Bpbi1idXR0b24sXG46Oi13ZWJraXQtb3V0ZXItc3Bpbi1idXR0b24ge1xuICBoZWlnaHQ6IGF1dG87XG59XG5cbi8qXG4xLiBDb3JyZWN0IHRoZSBvZGQgYXBwZWFyYW5jZSBpbiBDaHJvbWUgYW5kIFNhZmFyaS5cbjIuIENvcnJlY3QgdGhlIG91dGxpbmUgc3R5bGUgaW4gU2FmYXJpLlxuKi9cblxuW3R5cGU9J3NlYXJjaCddIHtcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiB0ZXh0ZmllbGQ7IC8qIDEgKi9cbiAgb3V0bGluZS1vZmZzZXQ6IC0ycHg7IC8qIDIgKi9cbn1cblxuLypcblJlbW92ZSB0aGUgaW5uZXIgcGFkZGluZyBpbiBDaHJvbWUgYW5kIFNhZmFyaSBvbiBtYWNPUy5cbiovXG5cbjo6LXdlYmtpdC1zZWFyY2gtZGVjb3JhdGlvbiB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcbn1cblxuLypcbjEuIENvcnJlY3QgdGhlIGluYWJpbGl0eSB0byBzdHlsZSBjbGlja2FibGUgdHlwZXMgaW4gaU9TIGFuZCBTYWZhcmkuXG4yLiBDaGFuZ2UgZm9udCBwcm9wZXJ0aWVzIHRvIFxcYGluaGVyaXRcXGAgaW4gU2FmYXJpLlxuKi9cblxuOjotd2Via2l0LWZpbGUtdXBsb2FkLWJ1dHRvbiB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogYnV0dG9uOyAvKiAxICovXG4gIGZvbnQ6IGluaGVyaXQ7IC8qIDIgKi9cbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCBkaXNwbGF5IGluIENocm9tZSBhbmQgU2FmYXJpLlxuKi9cblxuc3VtbWFyeSB7XG4gIGRpc3BsYXk6IGxpc3QtaXRlbTtcbn1cblxuLypcblJlbW92ZXMgdGhlIGRlZmF1bHQgc3BhY2luZyBhbmQgYm9yZGVyIGZvciBhcHByb3ByaWF0ZSBlbGVtZW50cy5cbiovXG5cbmJsb2NrcXVvdGUsXG5kbCxcbmRkLFxuaDEsXG5oMixcbmgzLFxuaDQsXG5oNSxcbmg2LFxuaHIsXG5maWd1cmUsXG5wLFxucHJlIHtcbiAgbWFyZ2luOiAwO1xufVxuXG5maWVsZHNldCB7XG4gIG1hcmdpbjogMDtcbiAgcGFkZGluZzogMDtcbn1cblxubGVnZW5kIHtcbiAgcGFkZGluZzogMDtcbn1cblxub2wsXG51bCxcbm1lbnUge1xuICBsaXN0LXN0eWxlOiBub25lO1xuICBtYXJnaW46IDA7XG4gIHBhZGRpbmc6IDA7XG59XG5cbi8qXG5SZXNldCBkZWZhdWx0IHN0eWxpbmcgZm9yIGRpYWxvZ3MuXG4qL1xuZGlhbG9nIHtcbiAgcGFkZGluZzogMDtcbn1cblxuLypcblByZXZlbnQgcmVzaXppbmcgdGV4dGFyZWFzIGhvcml6b250YWxseSBieSBkZWZhdWx0LlxuKi9cblxudGV4dGFyZWEge1xuICByZXNpemU6IHZlcnRpY2FsO1xufVxuXG4vKlxuMS4gUmVzZXQgdGhlIGRlZmF1bHQgcGxhY2Vob2xkZXIgb3BhY2l0eSBpbiBGaXJlZm94LiAoaHR0cHM6Ly9naXRodWIuY29tL3RhaWx3aW5kbGFicy90YWlsd2luZGNzcy9pc3N1ZXMvMzMwMClcbjIuIFNldCB0aGUgZGVmYXVsdCBwbGFjZWhvbGRlciBjb2xvciB0byB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgZ3JheSA0MDAgY29sb3IuXG4qL1xuXG5pbnB1dDo6LW1vei1wbGFjZWhvbGRlciwgdGV4dGFyZWE6Oi1tb3otcGxhY2Vob2xkZXIge1xuICBvcGFjaXR5OiAxOyAvKiAxICovXG4gIGNvbG9yOiAjOWNhM2FmOyAvKiAyICovXG59XG5cbmlucHV0OjpwbGFjZWhvbGRlcixcbnRleHRhcmVhOjpwbGFjZWhvbGRlciB7XG4gIG9wYWNpdHk6IDE7IC8qIDEgKi9cbiAgY29sb3I6ICM5Y2EzYWY7IC8qIDIgKi9cbn1cblxuLypcblNldCB0aGUgZGVmYXVsdCBjdXJzb3IgZm9yIGJ1dHRvbnMuXG4qL1xuXG5idXR0b24sXG5bcm9sZT1cImJ1dHRvblwiXSB7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cblxuLypcbk1ha2Ugc3VyZSBkaXNhYmxlZCBidXR0b25zIGRvbid0IGdldCB0aGUgcG9pbnRlciBjdXJzb3IuXG4qL1xuOmRpc2FibGVkIHtcbiAgY3Vyc29yOiBkZWZhdWx0O1xufVxuXG4vKlxuMS4gTWFrZSByZXBsYWNlZCBlbGVtZW50cyBcXGBkaXNwbGF5OiBibG9ja1xcYCBieSBkZWZhdWx0LiAoaHR0cHM6Ly9naXRodWIuY29tL21vemRldnMvY3NzcmVtZWR5L2lzc3Vlcy8xNClcbjIuIEFkZCBcXGB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlXFxgIHRvIGFsaWduIHJlcGxhY2VkIGVsZW1lbnRzIG1vcmUgc2Vuc2libHkgYnkgZGVmYXVsdC4gKGh0dHBzOi8vZ2l0aHViLmNvbS9qZW5zaW1tb25zL2Nzc3JlbWVkeS9pc3N1ZXMvMTQjaXNzdWVjb21tZW50LTYzNDkzNDIxMClcbiAgIFRoaXMgY2FuIHRyaWdnZXIgYSBwb29ybHkgY29uc2lkZXJlZCBsaW50IGVycm9yIGluIHNvbWUgdG9vbHMgYnV0IGlzIGluY2x1ZGVkIGJ5IGRlc2lnbi5cbiovXG5cbmltZyxcbnN2ZyxcbnZpZGVvLFxuY2FudmFzLFxuYXVkaW8sXG5pZnJhbWUsXG5lbWJlZCxcbm9iamVjdCB7XG4gIGRpc3BsYXk6IGJsb2NrOyAvKiAxICovXG4gIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7IC8qIDIgKi9cbn1cblxuLypcbkNvbnN0cmFpbiBpbWFnZXMgYW5kIHZpZGVvcyB0byB0aGUgcGFyZW50IHdpZHRoIGFuZCBwcmVzZXJ2ZSB0aGVpciBpbnRyaW5zaWMgYXNwZWN0IHJhdGlvLiAoaHR0cHM6Ly9naXRodWIuY29tL21vemRldnMvY3NzcmVtZWR5L2lzc3Vlcy8xNClcbiovXG5cbmltZyxcbnZpZGVvIHtcbiAgbWF4LXdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IGF1dG87XG59XG5cbi8qIE1ha2UgZWxlbWVudHMgd2l0aCB0aGUgSFRNTCBoaWRkZW4gYXR0cmlidXRlIHN0YXkgaGlkZGVuIGJ5IGRlZmF1bHQgKi9cbltoaWRkZW5dIHtcbiAgZGlzcGxheTogbm9uZTtcbn1cblxuKiwgOjpiZWZvcmUsIDo6YWZ0ZXIge1xuICAtLXR3LWJvcmRlci1zcGFjaW5nLXg6IDA7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteTogMDtcbiAgLS10dy10cmFuc2xhdGUteDogMDtcbiAgLS10dy10cmFuc2xhdGUteTogMDtcbiAgLS10dy1yb3RhdGU6IDA7XG4gIC0tdHctc2tldy14OiAwO1xuICAtLXR3LXNrZXcteTogMDtcbiAgLS10dy1zY2FsZS14OiAxO1xuICAtLXR3LXNjYWxlLXk6IDE7XG4gIC0tdHctcGFuLXg6ICA7XG4gIC0tdHctcGFuLXk6ICA7XG4gIC0tdHctcGluY2gtem9vbTogIDtcbiAgLS10dy1zY3JvbGwtc25hcC1zdHJpY3RuZXNzOiBwcm94aW1pdHk7XG4gIC0tdHctZ3JhZGllbnQtZnJvbS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC12aWEtcG9zaXRpb246ICA7XG4gIC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb246ICA7XG4gIC0tdHctb3JkaW5hbDogIDtcbiAgLS10dy1zbGFzaGVkLXplcm86ICA7XG4gIC0tdHctbnVtZXJpYy1maWd1cmU6ICA7XG4gIC0tdHctbnVtZXJpYy1zcGFjaW5nOiAgO1xuICAtLXR3LW51bWVyaWMtZnJhY3Rpb246ICA7XG4gIC0tdHctcmluZy1pbnNldDogIDtcbiAgLS10dy1yaW5nLW9mZnNldC13aWR0aDogMHB4O1xuICAtLXR3LXJpbmctb2Zmc2V0LWNvbG9yOiAjZmZmO1xuICAtLXR3LXJpbmctY29sb3I6IHJnYig1OSAxMzAgMjQ2IC8gMC41KTtcbiAgLS10dy1yaW5nLW9mZnNldC1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1yaW5nLXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdy1jb2xvcmVkOiAwIDAgIzAwMDA7XG4gIC0tdHctYmx1cjogIDtcbiAgLS10dy1icmlnaHRuZXNzOiAgO1xuICAtLXR3LWNvbnRyYXN0OiAgO1xuICAtLXR3LWdyYXlzY2FsZTogIDtcbiAgLS10dy1odWUtcm90YXRlOiAgO1xuICAtLXR3LWludmVydDogIDtcbiAgLS10dy1zYXR1cmF0ZTogIDtcbiAgLS10dy1zZXBpYTogIDtcbiAgLS10dy1kcm9wLXNoYWRvdzogIDtcbiAgLS10dy1iYWNrZHJvcC1ibHVyOiAgO1xuICAtLXR3LWJhY2tkcm9wLWJyaWdodG5lc3M6ICA7XG4gIC0tdHctYmFja2Ryb3AtY29udHJhc3Q6ICA7XG4gIC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlOiAgO1xuICAtLXR3LWJhY2tkcm9wLWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaW52ZXJ0OiAgO1xuICAtLXR3LWJhY2tkcm9wLW9wYWNpdHk6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2F0dXJhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2VwaWE6ICA7XG59XG5cbjo6YmFja2Ryb3Age1xuICAtLXR3LWJvcmRlci1zcGFjaW5nLXg6IDA7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteTogMDtcbiAgLS10dy10cmFuc2xhdGUteDogMDtcbiAgLS10dy10cmFuc2xhdGUteTogMDtcbiAgLS10dy1yb3RhdGU6IDA7XG4gIC0tdHctc2tldy14OiAwO1xuICAtLXR3LXNrZXcteTogMDtcbiAgLS10dy1zY2FsZS14OiAxO1xuICAtLXR3LXNjYWxlLXk6IDE7XG4gIC0tdHctcGFuLXg6ICA7XG4gIC0tdHctcGFuLXk6ICA7XG4gIC0tdHctcGluY2gtem9vbTogIDtcbiAgLS10dy1zY3JvbGwtc25hcC1zdHJpY3RuZXNzOiBwcm94aW1pdHk7XG4gIC0tdHctZ3JhZGllbnQtZnJvbS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC12aWEtcG9zaXRpb246ICA7XG4gIC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb246ICA7XG4gIC0tdHctb3JkaW5hbDogIDtcbiAgLS10dy1zbGFzaGVkLXplcm86ICA7XG4gIC0tdHctbnVtZXJpYy1maWd1cmU6ICA7XG4gIC0tdHctbnVtZXJpYy1zcGFjaW5nOiAgO1xuICAtLXR3LW51bWVyaWMtZnJhY3Rpb246ICA7XG4gIC0tdHctcmluZy1pbnNldDogIDtcbiAgLS10dy1yaW5nLW9mZnNldC13aWR0aDogMHB4O1xuICAtLXR3LXJpbmctb2Zmc2V0LWNvbG9yOiAjZmZmO1xuICAtLXR3LXJpbmctY29sb3I6IHJnYig1OSAxMzAgMjQ2IC8gMC41KTtcbiAgLS10dy1yaW5nLW9mZnNldC1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1yaW5nLXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdy1jb2xvcmVkOiAwIDAgIzAwMDA7XG4gIC0tdHctYmx1cjogIDtcbiAgLS10dy1icmlnaHRuZXNzOiAgO1xuICAtLXR3LWNvbnRyYXN0OiAgO1xuICAtLXR3LWdyYXlzY2FsZTogIDtcbiAgLS10dy1odWUtcm90YXRlOiAgO1xuICAtLXR3LWludmVydDogIDtcbiAgLS10dy1zYXR1cmF0ZTogIDtcbiAgLS10dy1zZXBpYTogIDtcbiAgLS10dy1kcm9wLXNoYWRvdzogIDtcbiAgLS10dy1iYWNrZHJvcC1ibHVyOiAgO1xuICAtLXR3LWJhY2tkcm9wLWJyaWdodG5lc3M6ICA7XG4gIC0tdHctYmFja2Ryb3AtY29udHJhc3Q6ICA7XG4gIC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlOiAgO1xuICAtLXR3LWJhY2tkcm9wLWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaW52ZXJ0OiAgO1xuICAtLXR3LWJhY2tkcm9wLW9wYWNpdHk6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2F0dXJhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2VwaWE6ICA7XG59XG4uY29udGFpbmVyIHtcbiAgd2lkdGg6IDEwMCU7XG59XG5AbWVkaWEgKG1pbi13aWR0aDogNjQwcHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDY0MHB4O1xuICB9XG59XG5AbWVkaWEgKG1pbi13aWR0aDogNzY4cHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDc2OHB4O1xuICB9XG59XG5AbWVkaWEgKG1pbi13aWR0aDogMTAyNHB4KSB7XG5cbiAgLmNvbnRhaW5lciB7XG4gICAgbWF4LXdpZHRoOiAxMDI0cHg7XG4gIH1cbn1cbkBtZWRpYSAobWluLXdpZHRoOiAxMjgwcHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDEyODBweDtcbiAgfVxufVxuQG1lZGlhIChtaW4td2lkdGg6IDE1MzZweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogMTUzNnB4O1xuICB9XG59XG4ucG9pbnRlci1ldmVudHMtbm9uZSB7XG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuLnZpc2libGUge1xuICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xufVxuLmNvbGxhcHNlIHtcbiAgdmlzaWJpbGl0eTogY29sbGFwc2U7XG59XG4ucmVsYXRpdmUge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG59XG4ubS01IHtcbiAgbWFyZ2luOiAxLjI1cmVtO1xufVxuLm0tOCB7XG4gIG1hcmdpbjogMnJlbTtcbn1cbi5tbC0xMCB7XG4gIG1hcmdpbi1sZWZ0OiAyLjVyZW07XG59XG4ubWwtOCB7XG4gIG1hcmdpbi1sZWZ0OiAycmVtO1xufVxuLmJsb2NrIHtcbiAgZGlzcGxheTogYmxvY2s7XG59XG4uZmxleCB7XG4gIGRpc3BsYXk6IGZsZXg7XG59XG4udGFibGUge1xuICBkaXNwbGF5OiB0YWJsZTtcbn1cbi5ncmlkIHtcbiAgZGlzcGxheTogZ3JpZDtcbn1cbi5jb250ZW50cyB7XG4gIGRpc3BsYXk6IGNvbnRlbnRzO1xufVxuLmhpZGRlbiB7XG4gIGRpc3BsYXk6IG5vbmU7XG59XG4uaC0xIHtcbiAgaGVpZ2h0OiAwLjI1cmVtO1xufVxuLmgtMVxcXFwvNSB7XG4gIGhlaWdodDogMjAlO1xufVxuLmgtNCB7XG4gIGhlaWdodDogMXJlbTtcbn1cbi5oLTRcXFxcLzUge1xuICBoZWlnaHQ6IDgwJTtcbn1cbi5oLTQwIHtcbiAgaGVpZ2h0OiAxMHJlbTtcbn1cbi5oLTYge1xuICBoZWlnaHQ6IDEuNXJlbTtcbn1cbi5oLW1heCB7XG4gIGhlaWdodDogLW1vei1tYXgtY29udGVudDtcbiAgaGVpZ2h0OiBtYXgtY29udGVudDtcbn1cbi53LTEge1xuICB3aWR0aDogMC4yNXJlbTtcbn1cbi53LTFcXFxcLzIge1xuICB3aWR0aDogNTAlO1xufVxuLnctNCB7XG4gIHdpZHRoOiAxcmVtO1xufVxuLnctNFxcXFwvMTIge1xuICB3aWR0aDogMzMuMzMzMzMzJTtcbn1cbi53LTYge1xuICB3aWR0aDogMS41cmVtO1xufVxuLnctYXV0byB7XG4gIHdpZHRoOiBhdXRvO1xufVxuLnctZnVsbCB7XG4gIHdpZHRoOiAxMDAlO1xufVxuLm1pbi13LTQ0IHtcbiAgbWluLXdpZHRoOiAxMXJlbTtcbn1cbi5taW4tdy1tYXgge1xuICBtaW4td2lkdGg6IC1tb3otbWF4LWNvbnRlbnQ7XG4gIG1pbi13aWR0aDogbWF4LWNvbnRlbnQ7XG59XG4ubWluLXctbWluIHtcbiAgbWluLXdpZHRoOiAtbW96LW1pbi1jb250ZW50O1xuICBtaW4td2lkdGg6IG1pbi1jb250ZW50O1xufVxuLmZsZXgtMSB7XG4gIGZsZXg6IDEgMSAwJTtcbn1cbi5mbGV4LW5vbmUge1xuICBmbGV4OiBub25lO1xufVxuLmJvcmRlci1jb2xsYXBzZSB7XG4gIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XG59XG4udHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUodmFyKC0tdHctdHJhbnNsYXRlLXgpLCB2YXIoLS10dy10cmFuc2xhdGUteSkpIHJvdGF0ZSh2YXIoLS10dy1yb3RhdGUpKSBza2V3WCh2YXIoLS10dy1za2V3LXgpKSBza2V3WSh2YXIoLS10dy1za2V3LXkpKSBzY2FsZVgodmFyKC0tdHctc2NhbGUteCkpIHNjYWxlWSh2YXIoLS10dy1zY2FsZS15KSk7XG59XG4uY3Vyc29yLWRlZmF1bHQge1xuICBjdXJzb3I6IGRlZmF1bHQ7XG59XG4uY3Vyc29yLWhlbHAge1xuICBjdXJzb3I6IGhlbHA7XG59XG4uY3Vyc29yLXBvaW50ZXIge1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uY3Vyc29yLXRleHQge1xuICBjdXJzb3I6IHRleHQ7XG59XG4ucmVzaXplIHtcbiAgcmVzaXplOiBib3RoO1xufVxuLmF1dG8tcm93cy1taW4ge1xuICBncmlkLWF1dG8tcm93czogbWluLWNvbnRlbnQ7XG59XG4uZ3JpZC1jb2xzLTExIHtcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMTEsIG1pbm1heCgwLCAxZnIpKTtcbn1cbi5mbGV4LXJvdyB7XG4gIGZsZXgtZGlyZWN0aW9uOiByb3c7XG59XG4uZmxleC1jb2wge1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xufVxuLml0ZW1zLWNlbnRlciB7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG4uanVzdGlmeS1zdGFydCB7XG4gIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcbn1cbi5qdXN0aWZ5LWNlbnRlciB7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xufVxuLmp1c3RpZnktYmV0d2VlbiB7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2Vlbjtcbn1cbi5qdXN0aWZ5LWFyb3VuZCB7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYXJvdW5kO1xufVxuLmdhcC0xIHtcbiAgZ2FwOiAwLjI1cmVtO1xufVxuLmdhcC0xMCB7XG4gIGdhcDogMi41cmVtO1xufVxuLmdhcC0yIHtcbiAgZ2FwOiAwLjVyZW07XG59XG4uZ2FwLTYge1xuICBnYXA6IDEuNXJlbTtcbn1cbi5vdmVyZmxvdy1hdXRvIHtcbiAgb3ZlcmZsb3c6IGF1dG87XG59XG4ucm91bmRlZC1mdWxsIHtcbiAgYm9yZGVyLXJhZGl1czogOTk5OXB4O1xufVxuLnJvdW5kZWQtbWQge1xuICBib3JkZXItcmFkaXVzOiAwLjM3NXJlbTtcbn1cbi5yb3VuZGVkLXhsIHtcbiAgYm9yZGVyLXJhZGl1czogMC43NXJlbTtcbn1cbi5yb3VuZGVkLXQtbWQge1xuICBib3JkZXItdG9wLWxlZnQtcmFkaXVzOiAwLjM3NXJlbTtcbiAgYm9yZGVyLXRvcC1yaWdodC1yYWRpdXM6IDAuMzc1cmVtO1xufVxuLnJvdW5kZWQtYmwtbWQge1xuICBib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOiAwLjM3NXJlbTtcbn1cbi5yb3VuZGVkLWJyLW1kIHtcbiAgYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXM6IDAuMzc1cmVtO1xufVxuLmJvcmRlciB7XG4gIGJvcmRlci13aWR0aDogMXB4O1xufVxuLmJvcmRlci1zb2xpZCB7XG4gIGJvcmRlci1zdHlsZTogc29saWQ7XG59XG4uYm9yZGVyLWJsdWUtODAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMzAgNjQgMTc1IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItZ3JheS02MDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYig3NSA4NSA5OSAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYm9yZGVyLWdyYXktODAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMzEgNDEgNTUgLyB2YXIoLS10dy1ib3JkZXItb3BhY2l0eSkpO1xufVxuLmJvcmRlci1ncmVlbi02MDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigyMiAxNjMgNzQgLyB2YXIoLS10dy1ib3JkZXItb3BhY2l0eSkpO1xufVxuLmJvcmRlci1vcmFuZ2UtNDAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMjUxIDE0NiA2MCAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYm9yZGVyLXJlZC03MDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigxODUgMjggMjggLyB2YXIoLS10dy1ib3JkZXItb3BhY2l0eSkpO1xufVxuLmJnLWdyYXktMTAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjQzIDI0NCAyNDYgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS0yMDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyMjkgMjMxIDIzNSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1ncmF5LTQwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDE1NiAxNjMgMTc1IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWdyYXktNjAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoNzUgODUgOTkgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS03MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYig1NSA2NSA4MSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1ncmF5LTgwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDMxIDQxIDU1IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWxpbWUtNjAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTAxIDE2MyAxMyAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1vcmFuZ2UtMzAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjUzIDE4NiAxMTYgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctb3JhbmdlLTQwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDI1MSAxNDYgNjAgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctb3JhbmdlLTYwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDIzNCA4OCAxMiAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1yZWQtNjAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjIwIDM4IDM4IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLXJlZC03MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigxODUgMjggMjggLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctc2t5LTcwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDMgMTA1IDE2MSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1zbGF0ZS03MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYig1MSA2NSA4NSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1ncmFkaWVudC10by10ciB7XG4gIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudCh0byB0b3AgcmlnaHQsIHZhcigtLXR3LWdyYWRpZW50LXN0b3BzKSk7XG59XG4uZnJvbS1ncmF5LTMwMCB7XG4gIC0tdHctZ3JhZGllbnQtZnJvbTogI2QxZDVkYiB2YXIoLS10dy1ncmFkaWVudC1mcm9tLXBvc2l0aW9uKTtcbiAgLS10dy1ncmFkaWVudC10bzogcmdiKDIwOSAyMTMgMjE5IC8gMCkgdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xuICAtLXR3LWdyYWRpZW50LXN0b3BzOiB2YXIoLS10dy1ncmFkaWVudC1mcm9tKSwgdmFyKC0tdHctZ3JhZGllbnQtdG8pO1xufVxuLmZyb20tZ3JheS00MDAge1xuICAtLXR3LWdyYWRpZW50LWZyb206ICM5Y2EzYWYgdmFyKC0tdHctZ3JhZGllbnQtZnJvbS1wb3NpdGlvbik7XG4gIC0tdHctZ3JhZGllbnQtdG86IHJnYigxNTYgMTYzIDE3NSAvIDApIHZhcigtLXR3LWdyYWRpZW50LXRvLXBvc2l0aW9uKTtcbiAgLS10dy1ncmFkaWVudC1zdG9wczogdmFyKC0tdHctZ3JhZGllbnQtZnJvbSksIHZhcigtLXR3LWdyYWRpZW50LXRvKTtcbn1cbi50by1ncmF5LTEwMCB7XG4gIC0tdHctZ3JhZGllbnQtdG86ICNmM2Y0ZjYgdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xufVxuLnRvLWdyYXktMjAwIHtcbiAgLS10dy1ncmFkaWVudC10bzogI2U1ZTdlYiB2YXIoLS10dy1ncmFkaWVudC10by1wb3NpdGlvbik7XG59XG4ucC0xIHtcbiAgcGFkZGluZzogMC4yNXJlbTtcbn1cbi5wLTIge1xuICBwYWRkaW5nOiAwLjVyZW07XG59XG4ucC00IHtcbiAgcGFkZGluZzogMXJlbTtcbn1cbi5wLTYge1xuICBwYWRkaW5nOiAxLjVyZW07XG59XG4ucHgtMyB7XG4gIHBhZGRpbmctbGVmdDogMC43NXJlbTtcbiAgcGFkZGluZy1yaWdodDogMC43NXJlbTtcbn1cbi5weC00IHtcbiAgcGFkZGluZy1sZWZ0OiAxcmVtO1xuICBwYWRkaW5nLXJpZ2h0OiAxcmVtO1xufVxuLnB4LTYge1xuICBwYWRkaW5nLWxlZnQ6IDEuNXJlbTtcbiAgcGFkZGluZy1yaWdodDogMS41cmVtO1xufVxuLnB5LTEge1xuICBwYWRkaW5nLXRvcDogMC4yNXJlbTtcbiAgcGFkZGluZy1ib3R0b206IDAuMjVyZW07XG59XG4ucHktMiB7XG4gIHBhZGRpbmctdG9wOiAwLjVyZW07XG4gIHBhZGRpbmctYm90dG9tOiAwLjVyZW07XG59XG4ucHktNCB7XG4gIHBhZGRpbmctdG9wOiAxcmVtO1xuICBwYWRkaW5nLWJvdHRvbTogMXJlbTtcbn1cbi5wbC0yIHtcbiAgcGFkZGluZy1sZWZ0OiAwLjVyZW07XG59XG4ucGwtNSB7XG4gIHBhZGRpbmctbGVmdDogMS4yNXJlbTtcbn1cbi5wbC04IHtcbiAgcGFkZGluZy1sZWZ0OiAycmVtO1xufVxuLnRleHQtY2VudGVyIHtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xufVxuLnRleHQtc20ge1xuICBmb250LXNpemU6IDAuODc1cmVtO1xuICBsaW5lLWhlaWdodDogMS4yNXJlbTtcbn1cbi50ZXh0LWdyYXktNjAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoNzUgODUgOTkgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LWdyYXktNzAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoNTUgNjUgODEgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LWdyYXktODAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMzEgNDEgNTUgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LWxpbWUtNjAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTAxIDE2MyAxMyAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtb3JhbmdlLTUwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDI0OSAxMTUgMjIgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LW9yYW5nZS02MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigyMzQgODggMTIgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXJlZC01MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigyMzkgNjggNjggLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXJlZC03MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigxODUgMjggMjggLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXJvc2UtNzAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTkwIDE4IDYwIC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1za3ktNjAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMiAxMzIgMTk5IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC10ZWFsLTkwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDE5IDc4IDc0IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udW5kZXJsaW5lIHtcbiAgdGV4dC1kZWNvcmF0aW9uLWxpbmU6IHVuZGVybGluZTtcbn1cbi5vdXRsaW5lIHtcbiAgb3V0bGluZS1zdHlsZTogc29saWQ7XG59XG4uZmlsdGVyIHtcbiAgZmlsdGVyOiB2YXIoLS10dy1ibHVyKSB2YXIoLS10dy1icmlnaHRuZXNzKSB2YXIoLS10dy1jb250cmFzdCkgdmFyKC0tdHctZ3JheXNjYWxlKSB2YXIoLS10dy1odWUtcm90YXRlKSB2YXIoLS10dy1pbnZlcnQpIHZhcigtLXR3LXNhdHVyYXRlKSB2YXIoLS10dy1zZXBpYSkgdmFyKC0tdHctZHJvcC1zaGFkb3cpO1xufVxuLmhvdmVyXFxcXDpiZy1vcmFuZ2UtNTAwOmhvdmVyIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjQ5IDExNSAyMiAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1gLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9zdHlsZXMuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBOztDQUFjLENBQWQ7OztDQUFjOztBQUFkOzs7RUFBQSxzQkFBYyxFQUFkLE1BQWM7RUFBZCxlQUFjLEVBQWQsTUFBYztFQUFkLG1CQUFjLEVBQWQsTUFBYztFQUFkLHFCQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztFQUFBLGdCQUFjO0FBQUE7O0FBQWQ7Ozs7Ozs7O0NBQWM7O0FBQWQ7O0VBQUEsZ0JBQWMsRUFBZCxNQUFjO0VBQWQsOEJBQWMsRUFBZCxNQUFjO0VBQWQsZ0JBQWMsRUFBZCxNQUFjO0VBQWQsY0FBYztLQUFkLFdBQWMsRUFBZCxNQUFjO0VBQWQsK0hBQWMsRUFBZCxNQUFjO0VBQWQsNkJBQWMsRUFBZCxNQUFjO0VBQWQsK0JBQWMsRUFBZCxNQUFjO0VBQWQsd0NBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7OztDQUFjOztBQUFkO0VBQUEsU0FBYyxFQUFkLE1BQWM7RUFBZCxvQkFBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7OztDQUFjOztBQUFkO0VBQUEsU0FBYyxFQUFkLE1BQWM7RUFBZCxjQUFjLEVBQWQsTUFBYztFQUFkLHFCQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEseUNBQWM7VUFBZCxpQ0FBYztBQUFBOztBQUFkOztDQUFjOztBQUFkOzs7Ozs7RUFBQSxrQkFBYztFQUFkLG9CQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7RUFBQSxjQUFjO0VBQWQsd0JBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDs7RUFBQSxtQkFBYztBQUFBOztBQUFkOzs7OztDQUFjOztBQUFkOzs7O0VBQUEsK0dBQWMsRUFBZCxNQUFjO0VBQWQsNkJBQWMsRUFBZCxNQUFj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QW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsd0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLDJCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLDJCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSxnQ0FBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLHNCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsNERBQW1CO0VBQW5CLHFFQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLDREQUFtQjtFQUFuQixxRUFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSxxQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxrQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxtQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxpQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLG1CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLG9CQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUZuQjtFQUFBLGtCQUVvQjtFQUZwQjtBQUVvQlwiLFwic291cmNlc0NvbnRlbnRcIjpbXCJAdGFpbHdpbmQgYmFzZTtcXG5AdGFpbHdpbmQgY29tcG9uZW50cztcXG5AdGFpbHdpbmQgdXRpbGl0aWVzO1wiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTtcblxuICAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbihcIlwiKTtcbiAgfTtcblxuICAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCB0aGlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZhciBpZCA9IHRoaXNba11bMF07XG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3VwcG9ydHMpIHtcbiAgICAgICAgaWYgKCFpdGVtWzRdKSB7XG4gICAgICAgICAgaXRlbVs0XSA9IFwiXCIuY29uY2F0KHN1cHBvcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNF0gPSBzdXBwb3J0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuICBpZiAoIWNzc01hcHBpbmcpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi9ub2RlX21vZHVsZXMvcG9zdGNzcy1sb2FkZXIvZGlzdC9janMuanM/P3J1bGVTZXRbMV0ucnVsZXNbMV0udXNlWzJdIS4vc3R5bGVzLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4uL25vZGVfbW9kdWxlcy9wb3N0Y3NzLWxvYWRlci9kaXN0L2Nqcy5qcz8/cnVsZVNldFsxXS5ydWxlc1sxXS51c2VbMl0hLi9zdHlsZXMuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzdHlsZXNJbkRPTSA9IFtdO1xuZnVuY3Rpb24gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuICB2YXIgcmVzdWx0ID0gLTE7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGlkQ291bnRNYXAgPSB7fTtcbiAgdmFyIGlkZW50aWZpZXJzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuICAgIGlmIChpbmRleEJ5SWRlbnRpZmllciAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXBkYXRlciA9IGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5ieUluZGV4ID0gaTtcbiAgICAgIHN0eWxlc0luRE9NLnNwbGljZShpLCAwLCB7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IHVwZGF0ZXIsXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cbmZ1bmN0aW9uIGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIGFwaSA9IG9wdGlvbnMuZG9tQVBJKG9wdGlvbnMpO1xuICBhcGkudXBkYXRlKG9iaik7XG4gIHZhciB1cGRhdGVyID0gZnVuY3Rpb24gdXBkYXRlcihuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwICYmIG5ld09iai5zdXBwb3J0cyA9PT0gb2JqLnN1cHBvcnRzICYmIG5ld09iai5sYXllciA9PT0gb2JqLmxheWVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHVwZGF0ZXI7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXN0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgX2lkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbX2ldO1xuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcbiAgICAgIGlmIChzdHlsZXNJbkRPTVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5ET01bX2luZGV4XS51cGRhdGVyKCk7XG4gICAgICAgIHN0eWxlc0luRE9NLnNwbGljZShfaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7XG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG4gICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gc3R5bGVUYXJnZXQuY29udGVudERvY3VtZW50LmhlYWQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cbiAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRCeVNlbGVjdG9yKGluc2VydCwgc3R5bGUpIHtcbiAgdmFyIHRhcmdldCA9IGdldFRhcmdldChpbnNlcnQpO1xuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cbiAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0QnlTZWxlY3RvcjsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgb3B0aW9ucy5zZXRBdHRyaWJ1dGVzKGVsZW1lbnQsIG9wdGlvbnMuYXR0cmlidXRlcyk7XG4gIG9wdGlvbnMuaW5zZXJ0KGVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG4gIHJldHVybiBlbGVtZW50O1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG4gIGlmIChub25jZSkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBub25jZSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKSB7XG4gIHZhciBjc3MgPSBcIlwiO1xuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIik7XG4gIH1cbiAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBvYmoubGF5ZXIgIT09IFwidW5kZWZpbmVkXCI7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cbiAgY3NzICs9IG9iai5jc3M7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH1cblxuICAvLyBGb3Igb2xkIElFXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cbiAgb3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGRvbUFQSShvcHRpb25zKSB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoKSB7fSxcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICB9O1xuICB9XG4gIHZhciBzdHlsZUVsZW1lbnQgPSBvcHRpb25zLmluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgcmV0dXJuIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShvYmopIHtcbiAgICAgIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG4gICAgfVxuICB9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzdHlsZVRhZ1RyYW5zZm9ybTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwidmFyIHdlYnBhY2tRdWV1ZXMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2woXCJ3ZWJwYWNrIHF1ZXVlc1wiKSA6IFwiX193ZWJwYWNrX3F1ZXVlc19fXCI7XG52YXIgd2VicGFja0V4cG9ydHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2woXCJ3ZWJwYWNrIGV4cG9ydHNcIikgOiBcIl9fd2VicGFja19leHBvcnRzX19cIjtcbnZhciB3ZWJwYWNrRXJyb3IgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2woXCJ3ZWJwYWNrIGVycm9yXCIpIDogXCJfX3dlYnBhY2tfZXJyb3JfX1wiO1xudmFyIHJlc29sdmVRdWV1ZSA9IChxdWV1ZSkgPT4ge1xuXHRpZihxdWV1ZSAmJiBxdWV1ZS5kIDwgMSkge1xuXHRcdHF1ZXVlLmQgPSAxO1xuXHRcdHF1ZXVlLmZvckVhY2goKGZuKSA9PiAoZm4uci0tKSk7XG5cdFx0cXVldWUuZm9yRWFjaCgoZm4pID0+IChmbi5yLS0gPyBmbi5yKysgOiBmbigpKSk7XG5cdH1cbn1cbnZhciB3cmFwRGVwcyA9IChkZXBzKSA9PiAoZGVwcy5tYXAoKGRlcCkgPT4ge1xuXHRpZihkZXAgIT09IG51bGwgJiYgdHlwZW9mIGRlcCA9PT0gXCJvYmplY3RcIikge1xuXHRcdGlmKGRlcFt3ZWJwYWNrUXVldWVzXSkgcmV0dXJuIGRlcDtcblx0XHRpZihkZXAudGhlbikge1xuXHRcdFx0dmFyIHF1ZXVlID0gW107XG5cdFx0XHRxdWV1ZS5kID0gMDtcblx0XHRcdGRlcC50aGVuKChyKSA9PiB7XG5cdFx0XHRcdG9ialt3ZWJwYWNrRXhwb3J0c10gPSByO1xuXHRcdFx0XHRyZXNvbHZlUXVldWUocXVldWUpO1xuXHRcdFx0fSwgKGUpID0+IHtcblx0XHRcdFx0b2JqW3dlYnBhY2tFcnJvcl0gPSBlO1xuXHRcdFx0XHRyZXNvbHZlUXVldWUocXVldWUpO1xuXHRcdFx0fSk7XG5cdFx0XHR2YXIgb2JqID0ge307XG5cdFx0XHRvYmpbd2VicGFja1F1ZXVlc10gPSAoZm4pID0+IChmbihxdWV1ZSkpO1xuXHRcdFx0cmV0dXJuIG9iajtcblx0XHR9XG5cdH1cblx0dmFyIHJldCA9IHt9O1xuXHRyZXRbd2VicGFja1F1ZXVlc10gPSB4ID0+IHt9O1xuXHRyZXRbd2VicGFja0V4cG9ydHNdID0gZGVwO1xuXHRyZXR1cm4gcmV0O1xufSkpO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5hID0gKG1vZHVsZSwgYm9keSwgaGFzQXdhaXQpID0+IHtcblx0dmFyIHF1ZXVlO1xuXHRoYXNBd2FpdCAmJiAoKHF1ZXVlID0gW10pLmQgPSAtMSk7XG5cdHZhciBkZXBRdWV1ZXMgPSBuZXcgU2V0KCk7XG5cdHZhciBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHM7XG5cdHZhciBjdXJyZW50RGVwcztcblx0dmFyIG91dGVyUmVzb2x2ZTtcblx0dmFyIHJlamVjdDtcblx0dmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqKSA9PiB7XG5cdFx0cmVqZWN0ID0gcmVqO1xuXHRcdG91dGVyUmVzb2x2ZSA9IHJlc29sdmU7XG5cdH0pO1xuXHRwcm9taXNlW3dlYnBhY2tFeHBvcnRzXSA9IGV4cG9ydHM7XG5cdHByb21pc2Vbd2VicGFja1F1ZXVlc10gPSAoZm4pID0+IChxdWV1ZSAmJiBmbihxdWV1ZSksIGRlcFF1ZXVlcy5mb3JFYWNoKGZuKSwgcHJvbWlzZVtcImNhdGNoXCJdKHggPT4ge30pKTtcblx0bW9kdWxlLmV4cG9ydHMgPSBwcm9taXNlO1xuXHRib2R5KChkZXBzKSA9PiB7XG5cdFx0Y3VycmVudERlcHMgPSB3cmFwRGVwcyhkZXBzKTtcblx0XHR2YXIgZm47XG5cdFx0dmFyIGdldFJlc3VsdCA9ICgpID0+IChjdXJyZW50RGVwcy5tYXAoKGQpID0+IHtcblx0XHRcdGlmKGRbd2VicGFja0Vycm9yXSkgdGhyb3cgZFt3ZWJwYWNrRXJyb3JdO1xuXHRcdFx0cmV0dXJuIGRbd2VicGFja0V4cG9ydHNdO1xuXHRcdH0pKVxuXHRcdHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdGZuID0gKCkgPT4gKHJlc29sdmUoZ2V0UmVzdWx0KSk7XG5cdFx0XHRmbi5yID0gMDtcblx0XHRcdHZhciBmblF1ZXVlID0gKHEpID0+IChxICE9PSBxdWV1ZSAmJiAhZGVwUXVldWVzLmhhcyhxKSAmJiAoZGVwUXVldWVzLmFkZChxKSwgcSAmJiAhcS5kICYmIChmbi5yKyssIHEucHVzaChmbikpKSk7XG5cdFx0XHRjdXJyZW50RGVwcy5tYXAoKGRlcCkgPT4gKGRlcFt3ZWJwYWNrUXVldWVzXShmblF1ZXVlKSkpO1xuXHRcdH0pO1xuXHRcdHJldHVybiBmbi5yID8gcHJvbWlzZSA6IGdldFJlc3VsdCgpO1xuXHR9LCAoZXJyKSA9PiAoKGVyciA/IHJlamVjdChwcm9taXNlW3dlYnBhY2tFcnJvcl0gPSBlcnIpIDogb3V0ZXJSZXNvbHZlKGV4cG9ydHMpKSwgcmVzb2x2ZVF1ZXVlKHF1ZXVlKSkpO1xuXHRxdWV1ZSAmJiBxdWV1ZS5kIDwgMCAmJiAocXVldWUuZCA9IDApO1xufTsiLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm5jID0gdW5kZWZpbmVkOyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgdXNlZCAnbW9kdWxlJyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9pbmRleC5qc1wiKTtcbiIsIiJdLCJuYW1lcyI6WyJHYW1lYm9hcmQiLCJncmlkIiwic2hpcHNUb1BsYWNlIiwic2hpcFR5cGUiLCJzaGlwTGVuZ3RoIiwiaGl0QmdDbHIiLCJoaXRUZXh0Q2xyIiwibWlzc0JnQ2xyIiwibWlzc1RleHRDbHIiLCJlcnJvclRleHRDbHIiLCJkZWZhdWx0VGV4dENsciIsInByaW1hcnlIb3ZlckNsciIsImhpZ2hsaWdodENsciIsImN1cnJlbnRPcmllbnRhdGlvbiIsImN1cnJlbnRTaGlwIiwibGFzdEhvdmVyZWRDZWxsIiwicGxhY2VTaGlwR3VpZGUiLCJwcm9tcHQiLCJwcm9tcHRUeXBlIiwiZ2FtZXBsYXlHdWlkZSIsInR1cm5Qcm9tcHQiLCJwcm9jZXNzQ29tbWFuZCIsImNvbW1hbmQiLCJpc01vdmUiLCJwYXJ0cyIsInNwbGl0IiwibGVuZ3RoIiwiRXJyb3IiLCJncmlkUG9zaXRpb24iLCJ0b1VwcGVyQ2FzZSIsInZhbGlkR3JpZFBvc2l0aW9ucyIsImZsYXQiLCJpbmNsdWRlcyIsInJlc3VsdCIsIm9yaWVudGF0aW9uIiwidG9Mb3dlckNhc2UiLCJ1cGRhdGVPdXRwdXQiLCJtZXNzYWdlIiwidHlwZSIsIm91dHB1dCIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJtZXNzYWdlRWxlbWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ0ZXh0Q29udGVudCIsImNsYXNzTGlzdCIsImFkZCIsImFwcGVuZENoaWxkIiwic2Nyb2xsVG9wIiwic2Nyb2xsSGVpZ2h0IiwiY29uc29sZUxvZ1BsYWNlbWVudENvbW1hbmQiLCJkaXJGZWViYWNrIiwiY2hhckF0Iiwic2xpY2UiLCJjb25zb2xlIiwibG9nIiwidmFsdWUiLCJjb25zb2xlTG9nTW92ZUNvbW1hbmQiLCJyZXN1bHRzT2JqZWN0IiwicGxheWVyIiwibW92ZSIsImhpdCIsImNvbnNvbGVMb2dTaGlwU2luayIsImNvbnNvbGVMb2dFcnJvciIsImVycm9yIiwiaW5pdFVpTWFuYWdlciIsInVpTWFuYWdlciIsImluaXRDb25zb2xlVUkiLCJjcmVhdGVHYW1lYm9hcmQiLCJjYWxjdWxhdGVTaGlwQ2VsbHMiLCJzdGFydENlbGwiLCJjZWxsSWRzIiwicm93SW5kZXgiLCJjaGFyQ29kZUF0IiwiY29sSW5kZXgiLCJwYXJzZUludCIsInN1YnN0cmluZyIsImkiLCJwdXNoIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwiaGlnaGxpZ2h0Q2VsbHMiLCJmb3JFYWNoIiwiY2VsbElkIiwiY2VsbEVsZW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiY2xlYXJIaWdobGlnaHQiLCJyZW1vdmUiLCJ0b2dnbGVPcmllbnRhdGlvbiIsImhhbmRsZVBsYWNlbWVudEhvdmVyIiwiZSIsImNlbGwiLCJ0YXJnZXQiLCJjb250YWlucyIsImRhdGFzZXQiLCJjZWxsUG9zIiwicG9zaXRpb24iLCJjZWxsc1RvSGlnaGxpZ2h0IiwiaGFuZGxlTW91c2VMZWF2ZSIsImNlbGxzVG9DbGVhciIsImhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlIiwicHJldmVudERlZmF1bHQiLCJrZXkiLCJvbGRDZWxsc1RvQ2xlYXIiLCJuZXdDZWxsc1RvSGlnaGxpZ2h0IiwiZW5hYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlciIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJkaXNhYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlciIsImNlbGxzQXJyYXkiLCJkaXNhYmxlSHVtYW5HYW1lYm9hcmRIb3ZlciIsInN3aXRjaEdhbWVib2FyZEhvdmVyU3RhdGVzIiwic2V0dXBHYW1lYm9hcmRGb3JQbGFjZW1lbnQiLCJjb21wR2FtZWJvYXJkQ2VsbHMiLCJhZGRFdmVudExpc3RlbmVyIiwiZ2FtZWJvYXJkQXJlYSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJjbGVhbnVwQWZ0ZXJQbGFjZW1lbnQiLCJzdGFydEdhbWUiLCJnYW1lIiwic2V0VXAiLCJzaGlwIiwicmVuZGVyU2hpcERpc3AiLCJwbGF5ZXJzIiwiY29tcHV0ZXIiLCJkaXNwbGF5UHJvbXB0IiwiY29uY2x1ZGVHYW1lIiwid2lubmVyIiwiQWN0aW9uQ29udHJvbGxlciIsImh1bWFuUGxheWVyIiwiaHVtYW4iLCJodW1hblBsYXllckdhbWVib2FyZCIsImdhbWVib2FyZCIsImNvbXBQbGF5ZXIiLCJjb21wUGxheWVyR2FtZWJvYXJkIiwic2V0dXBFdmVudExpc3RlbmVycyIsImhhbmRsZXJGdW5jdGlvbiIsInBsYXllclR5cGUiLCJjbGVhbnVwRnVuY3Rpb25zIiwiY29uc29sZVN1Ym1pdEJ1dHRvbiIsImNvbnNvbGVJbnB1dCIsInN1Ym1pdEhhbmRsZXIiLCJpbnB1dCIsImtleXByZXNzSGFuZGxlciIsImNsaWNrSGFuZGxlciIsImNsZWFudXAiLCJwcm9tcHRBbmRQbGFjZVNoaXAiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImZpbmQiLCJwbGFjZVNoaXBQcm9tcHQiLCJoYW5kbGVWYWxpZElucHV0IiwicGxhY2VTaGlwIiwicmVuZGVyU2hpcEJvYXJkIiwicmVzb2x2ZVNoaXBQbGFjZW1lbnQiLCJzZXR1cFNoaXBzU2VxdWVudGlhbGx5IiwiaGFuZGxlU2V0dXAiLCJ1cGRhdGVDb21wdXRlckRpc3BsYXlzIiwiaHVtYW5Nb3ZlUmVzdWx0IiwicGxheWVyU2VsZWN0b3IiLCJ1cGRhdGVTaGlwU2VjdGlvbiIsInByb21wdFBsYXllck1vdmUiLCJjb21wTW92ZVJlc3VsdCIsInVuZGVmaW5lZCIsImhhbmRsZVZhbGlkTW92ZSIsIm1ha2VNb3ZlIiwicmVzb2x2ZU1vdmUiLCJjb21wdXRlck1vdmUiLCJjaGVja1NoaXBJc1N1bmsiLCJpc1NoaXBTdW5rIiwiY2hlY2tXaW5Db25kaXRpb24iLCJjaGVja0FsbFNoaXBzU3VuayIsInBsYXlHYW1lIiwiZ2FtZU92ZXIiLCJsYXN0Q29tcE1vdmVSZXN1bHQiLCJsYXN0SHVtYW5Nb3ZlUmVzdWx0IiwiaXNTdW5rIiwicmVuZGVyU3Vua2VuU2hpcCIsIk92ZXJsYXBwaW5nU2hpcHNFcnJvciIsImNvbnN0cnVjdG9yIiwibmFtZSIsIlNoaXBBbGxvY2F0aW9uUmVhY2hlZEVycm9yIiwiU2hpcFR5cGVBbGxvY2F0aW9uUmVhY2hlZEVycm9yIiwiSW52YWxpZFNoaXBMZW5ndGhFcnJvciIsIkludmFsaWRTaGlwVHlwZUVycm9yIiwiSW52YWxpZFBsYXllclR5cGVFcnJvciIsIlNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yIiwiUmVwZWF0QXR0YWNrZWRFcnJvciIsIkludmFsaWRNb3ZlRW50cnlFcnJvciIsIlBsYXllciIsIlNoaXAiLCJHYW1lIiwiaHVtYW5HYW1lYm9hcmQiLCJjb21wdXRlckdhbWVib2FyZCIsImNvbXB1dGVyUGxheWVyIiwiY3VycmVudFBsYXllciIsImdhbWVPdmVyU3RhdGUiLCJwbGFjZVNoaXBzIiwiZW5kR2FtZSIsInRha2VUdXJuIiwiZmVlZGJhY2siLCJvcHBvbmVudCIsImdhbWVXb24iLCJpbmRleENhbGNzIiwic3RhcnQiLCJjb2xMZXR0ZXIiLCJyb3dOdW1iZXIiLCJjaGVja1R5cGUiLCJzaGlwUG9zaXRpb25zIiwiT2JqZWN0Iiwia2V5cyIsImV4aXN0aW5nU2hpcFR5cGUiLCJjaGVja0JvdW5kYXJpZXMiLCJjb29yZHMiLCJkaXJlY3Rpb24iLCJ4TGltaXQiLCJ5TGltaXQiLCJ4IiwieSIsImNhbGN1bGF0ZVNoaXBQb3NpdGlvbnMiLCJwb3NpdGlvbnMiLCJjaGVja0Zvck92ZXJsYXAiLCJlbnRyaWVzIiwiZXhpc3RpbmdTaGlwUG9zaXRpb25zIiwic29tZSIsImNoZWNrRm9ySGl0IiwiZm91bmRTaGlwIiwiXyIsInNoaXBGYWN0b3J5Iiwic2hpcHMiLCJoaXRQb3NpdGlvbnMiLCJhdHRhY2tMb2ciLCJuZXdTaGlwIiwiYXR0YWNrIiwicmVzcG9uc2UiLCJjaGVja1Jlc3VsdHMiLCJldmVyeSIsInNoaXBSZXBvcnQiLCJmbG9hdGluZ1NoaXBzIiwiZmlsdGVyIiwibWFwIiwiZ2V0U2hpcCIsImdldFNoaXBQb3NpdGlvbnMiLCJnZXRIaXRQb3NpdGlvbnMiLCJVaU1hbmFnZXIiLCJuZXdVaU1hbmFnZXIiLCJuZXdHYW1lIiwiYWN0Q29udHJvbGxlciIsImNoZWNrTW92ZSIsImdiR3JpZCIsInZhbGlkIiwiZWwiLCJwIiwicmFuZE1vdmUiLCJtb3ZlTG9nIiwiYWxsTW92ZXMiLCJmbGF0TWFwIiwicm93IiwicG9zc2libGVNb3ZlcyIsInJhbmRvbU1vdmUiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJnZW5lcmF0ZVJhbmRvbVN0YXJ0Iiwic2l6ZSIsInZhbGlkU3RhcnRzIiwiY29sIiwicmFuZG9tSW5kZXgiLCJhdXRvUGxhY2VtZW50Iiwic2hpcFR5cGVzIiwicGxhY2VkIiwib3BwR2FtZWJvYXJkIiwic2V0TGVuZ3RoIiwiaGl0cyIsImluc3RydWN0aW9uQ2xyIiwiZ3VpZGVDbHIiLCJlcnJvckNsciIsImRlZmF1bHRDbHIiLCJjZWxsQ2xyIiwiaW5wdXRDbHIiLCJvdXB1dENsciIsImJ1dHRvbkNsciIsImJ1dHRvblRleHRDbHIiLCJzaGlwU2VjdENsciIsInNoaXBIaXRDbHIiLCJzaGlwU3Vua0NsciIsImJ1aWxkU2hpcCIsIm9iaiIsImRvbVNlbCIsInNoaXBTZWN0cyIsInNlY3QiLCJjbGFzc05hbWUiLCJzZXRBdHRyaWJ1dGUiLCJjb250YWluZXJJRCIsImNvbnRhaW5lciIsImdyaWREaXYiLCJjb2x1bW5zIiwiaGVhZGVyIiwicm93TGFiZWwiLCJpZCIsImNvbnNvbGVDb250YWluZXIiLCJpbnB1dERpdiIsInN1Ym1pdEJ1dHRvbiIsInByb21wdE9ianMiLCJkaXNwbGF5IiwiZmlyc3RDaGlsZCIsInJlbW92ZUNoaWxkIiwicHJvbXB0RGl2IiwicGxheWVyT2JqIiwiaWRTZWwiLCJkaXNwRGl2Iiwic2hpcERpdiIsInRpdGxlIiwic2VjdHNEaXYiLCJzaGlwT2JqIiwic2hpcFNlY3QiLCJzZWN0aW9uIiwicG9zIiwibmV3Q2xyIiwicGxheWVySWQiLCJzaGlwU2VjdERpc3BsYXlFbCIsInNoaXBTZWN0Qm9hcmRFbCJdLCJzb3VyY2VSb290IjoiIn0=