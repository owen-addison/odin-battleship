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
  updateOutput(`> ${message}`, "valid");

  // Clear the input
  document.getElementById("console-input").value = "";
};

// The function for executing commands from the console input
const consoleLogMoveCommand = resultsObject => {
  // Set the console message
  const message = `The ${resultsObject.player}'s move on ${resultsObject.move} resulted in a ${resultsObject.hit ? "HIT" : "MISS"}!`;
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
    switchGameboardHoverStates();
  };
  const updateDisplays = moveResult => {
    // Set the player selector of the opponent depending on the player
    // who made the move
    const playerSelector = moveResult.player === "human" ? "computer" : "human";
    // Get the DOM element for the cell
    const cell = document.querySelector(`.gameboard-cell[data-player=${playerSelector}][data-position=${moveResult.move}]`);

    // Disable the cell from future clicks
    disableComputerGameboardHover([cell]);

    // Handle miss and hit
    if (!moveResult.hit) {
      // Update the cells styling to reflect miss
      cell.classList.add(missBgClr);
    } else {
      // Update the ship section in the ship status display
      uiManager.updateShipSection(moveResult.move, moveResult.shipType, playerSelector);
    }
  };
  async function promptPlayerMove() {
    return new Promise((resolve, reject) => {
      let humanMoveResult;
      const handleValidMove = async move => {
        try {
          const {
            gridPosition
          } = processCommand(move, true);
          humanMoveResult = await humanPlayer.makeMove(compPlayerGameboard, gridPosition);

          // Update the computer player's ships display and gameboard
          // depending on outcome of move
          updateDisplays(humanMoveResult);

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

      // Update the human player's ships display and gameboard
      // depending on outcome of move
      updateDisplays(compMoveResult);

      // Log the result of the computer's move to the console
      consoleLogMoveCommand(compMoveResult);
    } catch (error) {
      consoleLogError(error);
    }
    return compMoveResult;
  }
  const checkShipIsSunk = (gameboard, shipType) => gameboard.isShipSunk(shipType);
  const checkWinCondition = gameboard => gameboard.checkAllShipsSunk();
  const restartGame = () => {
    window.location.reload();
  };
  function concludeGame(winner) {
    // Display winner, update UI, etc.
    const message = `Game Over! The ${winner} player wins!`;
    updateOutput(`> ${message}`, winner === "human" ? "valid" : "error");

    // Restart the game
    uiManager.promptEndGame(winner);

    // Attach event listener to the button
    const restartButton = document.getElementById("restart-button");
    restartButton.addEventListener("click", restartGame);
  }

  // Function for handling the playing of the game
  const playGame = async () => {
    let gameOver = false;
    let lastCompMoveResult;
    let lastHumanMoveResult;
    let winner;
    while (!gameOver) {
      // Player makes a move
      // eslint-disable-next-line no-await-in-loop
      lastHumanMoveResult = await promptPlayerMove();

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
const buttonClr = "bg-gray-800";
const buttonTextClr = "text-gray-200";
const shipSectClr = "bg-slate-800";
const shipHitClr = "bg-red-800";
const shipSunkClr = "bg-gray-400";
const primaryHoverClr = "hover:bg-orange-500";

// Function for build a ship section
const buildSection = (domSel, type, pos) => {
  // Create an element for the section
  const sect = document.createElement("div");
  sect.className = tw`w-4 h-4 rounded-full`; // Set the default styling for the section element
  sect.classList.add(shipSectClr);
  // Set a unique id for the ship section
  sect.setAttribute("id", `DOM-${domSel}-shipType-${type}-pos-${pos}`);
  // Set a dataset property of "position" for the section
  sect.dataset.position = pos;
  return sect;
};

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
    const sect = buildSection(domSel, type, position);
    shipSects.push(sect); // Add the section to the array
  }

  // Return the array of ship sections
  return shipSects;
};

// Function for creating and displaying the pop-up menu at the end of
// the game
const endGameInterface = winner => {
  // Get the main container
  const mainContainer = document.getElementById("main-container");

  // Create container for end of game interface
  const endGameContainer = document.createElement("div");
  endGameContainer.setAttribute("id", "end-game-container");
  endGameContainer.className = tw`fixed inset-0 flex justify-center items-center min-w-full min-h-screen bg-gray-900 bg-opacity-40 backdrop-blur-sm z-50`;

  // Create the div for holding the prompt and button
  const promptContainer = document.createElement("div");
  promptContainer.className = tw`w-90 h-60 p-10 bg-gray-200 shadow-lg rounded-md bg-opacity-60 backdrop-blur-sm flex flex-col content-center justify-center`;

  // Create the prompts
  const winnerPrompt = document.createElement("p");
  winnerPrompt.className = tw`font-mono text-center text-md text-gray-800`;
  winnerPrompt.textContent = winner === "human" ? "You win!" : "You lose!";
  const restartPrompt = document.createElement("p");
  restartPrompt.className = tw`font-mono text-center text-md text-gray-800`;
  restartPrompt.textContent = "Click the button to restart the game!";

  // Create the restart button
  const restartButton = document.createElement("button");
  restartButton.setAttribute("id", "restart-button");
  restartButton.className = tw`nanum-gothic-coding-bold mt-4 self-center text-lg w-min tracking-widest px-3 py-1 text-center text-sm rounded-md border-solid text-gray-200 bg-gray-800 border-2 border-gray-200 hover:bg-gray-200 hover:text-gray-800 hover:border-gray-800`;
  restartButton.textContent = "Restart";

  // Add the elements to the relevant containers
  promptContainer.appendChild(winnerPrompt);
  promptContainer.appendChild(restartPrompt);
  promptContainer.appendChild(restartButton);
  endGameContainer.appendChild(promptContainer);
  mainContainer.appendChild(endGameContainer);
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
    output.className = tw`flex-1 p-2 h-4/5 overflow-auto rounded-t-md bg-gray-200 bg-opacity-30 backdrop-blur-md`; // Add TailwindCSS classes (bg-gradient-to-tr, from-gray-400, to-gray-100)

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
  const renderShipSect = (shipType, pos) => {
    // Build a section with the id DOM selector of "comp-board"
    const sect = buildSection("comp-board", shipType, pos);

    // Get the correct cell element
    const cellElement = document.getElementById(`computer-${pos}`);
    if (cellElement && sect) {
      // Place the ship section in the cell
      cellElement.appendChild(sect);
    } else {
      throw new Error(`Missing ship section and/or cell element. Ship section = ${sect}. Cell element = ${cellElement}.`);
    }
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

    // If the player type is computer and the ship isn't sunk then
    // render the single ship section on the board
    if (playerId === "comp" && !isShipSunk) {
      renderShipSect(shipType, pos);
    }

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
      if (playerId === "human" || playerId === "comp") {
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
  const promptEndGame = winner => {
    // Create and display pop-up
    endGameInterface(winner);
  };
  return {
    createGameboard,
    initConsoleUI,
    displayPrompt,
    renderShipDisp,
    renderShipBoard,
    updateShipSection,
    renderSunkenShip,
    promptEndGame
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
.fixed {
  position: fixed;
}
.absolute {
  position: absolute;
}
.relative {
  position: relative;
}
.inset-0 {
  inset: 0px;
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
.z-50 {
  z-index: 50;
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
.mt-4 {
  margin-top: 1rem;
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
.w-80 {
  width: 20rem;
}
.w-auto {
  width: auto;
}
.w-full {
  width: 100%;
}
.w-min {
  width: -moz-min-content;
  width: min-content;
}
.w-screen {
  width: 100vw;
}
.min-w-44 {
  min-width: 11rem;
}
.min-w-full {
  min-width: 100%;
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
.flex-grow {
  flex-grow: 1;
}
.flex-grow-0 {
  flex-grow: 0;
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
.content-center {
  align-content: center;
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
.self-center {
  align-self: center;
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
.bg-gray-900 {
  --tw-bg-opacity: 1;
  background-color: rgb(17 24 39 / var(--tw-bg-opacity));
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
.bg-opacity-10 {
  --tw-bg-opacity: 0.1;
}
.bg-opacity-20 {
  --tw-bg-opacity: 0.2;
}
.bg-opacity-25 {
  --tw-bg-opacity: 0.25;
}
.bg-opacity-30 {
  --tw-bg-opacity: 0.3;
}
.bg-opacity-40 {
  --tw-bg-opacity: 0.4;
}
.bg-opacity-50 {
  --tw-bg-opacity: 0.5;
}
.bg-opacity-60 {
  --tw-bg-opacity: 0.6;
}
.bg-opacity-70 {
  --tw-bg-opacity: 0.7;
}
.bg-opacity-75 {
  --tw-bg-opacity: 0.75;
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
.p-10 {
  padding: 2.5rem;
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
.opacity-100 {
  opacity: 1;
}
.shadow-lg {
  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
.shadow-sm {
  --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
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
`, "",{"version":3,"sources":["webpack://./src/styles.css"],"names":[],"mappings":"AAAA;;CAAc,CAAd;;;CAAc;;AAAd;;;EAAA,sBAAc,EAAd,MAAc;EAAd,eAAc,EAAd,MAAc;EAAd,mBAAc,EAAd,MAAc;EAAd,qBAAc,EAAd,MAAc;AAAA;;AAAd;;EAAA,gBAAc;AAAA;;AAAd;;;;;;;;CAAc;;AAAd;;EAAA,gBAAc,EAAd,MAAc;EAAd,8BAAc,EAAd,MAAc;EAAd,gBAAc,EAAd,MAAc;EAAd,cAAc;KAAd,WAAc,EAAd,MAAc;EAAd,+HAAc,EAAd,MAAc;EAAd,6BAAc,EAAd,MAAc;EAAd,+BAAc,EAAd,MAAc;EAAd,wCAAc,EAAd,MAAc;AAAA;;AAAd;;;CAAc;;AAAd;EAAA,SAAc,EAAd,MAAc;EAAd,oBAAc,EAAd,MAAc;AAAA;;AAAd;;;;CAAc;;AAAd;EAAA,SAAc,EAAd,MAAc;EAAd,cAAc,EAAd,MAAc;EAAd,qBAAc,EAAd,MAAc;AAAA;;AAAd;;CAAc;;AAAd;EAAA,yCAAc;UAAd,iCAAc;AAAA;;AAAd;;CAAc;;AAAd;;;;;;EAAA,kBAAc;EAAd,oBAAc;AAAA;;AAAd;;CAAc;;AAAd;EAAA,cAAc;EAAd,wBAAc;AAAA;;AAAd;;CAAc;;AAAd;;EAAA,mBAAc;AAAA;;AAAd;;;;;CAAc;;AAAd;;;;EAAA,+GAAc,EAAd,MAAc;EAAd,6BAAc,EAAd,MAAc;EAAd,+BAAc,EAAd,MAAc;EAAd,cAAc,EAAd,MAAc;AAAA;;AAAd;;CAAc;;AAAd;EAAA,cAAc;AAAA;;AAAd;;CAAc;;AAAd;;EAAA,cAAc;EAAd,cAAc;EAAd,kBAAc;EAAd,wBAAc;AAAA;;AAAd;EAAA,eAAc;AAAA;;AAAd;EAAA,WAAc;AAAA;;AAAd;;;;CAAc;;AAAd;EAAA,cAAc,EAAd,MAAc;EAAd,qBAAc,EAAd,MAAc;EAAd,yBAAc,EAAd,MAAc;AAAA;;AAAd;;;;CAAc;;AAAd;;;;;EAAA,oBAAc,EAAd,MAAc;EAAd,8BAAc,EAAd,MAAc;EAAd,gCAAc,EAAd,MAAc;EAAd,eAAc,EAAd,MAAc;EAAd,oBAAc,EAAd,MAAc;EAAd,oBAAc,EAAd,MAAc;EAAd,cAAc,EAAd,MAAc;EAAd,SAAc,EAAd,MAAc;EAAd,UAAc,EAAd,MAAc;AAAA;;AAAd;;CAAc;;AAAd;;EAAA,oBAAc;AAAA;;AAAd;;;CAAc;;AAAd;;;;EAAA,0BAAc,EAAd,MAAc;EAAd,6BAAc,EAAd,MAAc;EAAd,sBAAc,EAAd,MAAc;AAAA;;AAAd;;CAAc;;AAAd;EAAA,aAAc;AAAA;;AAAd;;CAAc;;AAAd;EAAA,gBAAc;AAAA;;AAAd;;CAAc;;AAAd;EAAA,wBAAc;AAAA;;AAAd;;CAAc;;AAAd;;EAAA,YAAc;AAAA;;AAAd;;;CAAc;;AAAd;EAAA,6BAAc,EAAd,MAAc;EAAd,oBAAc,EAAd,MAAc;AAAA;;AAAd;;CAAc;;AAAd;EAAA,wBAAc;AAAA;;AAAd;;;CAAc;;AAAd;EAAA,0BAAc,EAAd,MAAc;EAAd,aAAc,EAAd,MAAc;AAAA;;AAAd;;CAAc;;AAAd;EAAA,kBAAc;AAAA;;AAAd;;CAAc;;AAAd;;;;;;;;;;;;;EAAA,SAAc;AAAA;;AAAd;EAAA,SAAc;EAAd,UAAc;AAAA;;AAAd;EAAA,UAAc;AAAA;;AAAd;;;EAAA,gBAAc;EAAd,SAAc;EAAd,UAAc;AAAA;;AAAd;;CAAc;AAAd;EAAA,UAAc;AAAA;;AAAd;;CAAc;;AAAd;EAAA,gBAAc;AAAA;;AAAd;;;CAAc;;AAAd;EAAA,UAAc,EAAd,MAAc;EAAd,cAAc,EAAd,MAAc;AAAA;;AAAd;;EAAA,UAAc,EAAd,MAAc;EAAd,cAAc,EAAd,MAAc;AAAA;;AAAd;;CAAc;;AAAd;;EAAA,eAAc;AAAA;;AAAd;;CAAc;AAAd;EAAA,eAAc;AAAA;;AAAd;;;;CAAc;;AAAd;;;;;;;;EAAA,cAAc,EAAd,MAAc;EAAd,sBAAc,EAAd,MAAc;AAAA;;AAAd;;CAAc;;AAAd;;EAAA,eAAc;EAAd,YAAc;AAAA;;AAAd,wEAAc;AAAd;EAAA,aAAc;AAAA;;AAAd;EAAA,wBAAc;EAAd,wBAAc;EAAd,mBAAc;EAAd,mBAAc;EAAd,cAAc;EAAd,cAAc;EAAd,cAAc;EAAd,eAAc;EAAd,eAAc;EAAd,aAAc;EAAd,aAAc;EAAd,kBAAc;EAAd,sCAAc;EAAd,8BAAc;EAAd,6BAAc;EAAd,4BAAc;EAAd,eAAc;EAAd,oBAAc;EAAd,sBAAc;EAAd,uBAAc;EAAd,wBAAc;EAAd,kBAAc;EAAd,2BAAc;EAAd,4BAAc;EAAd,sCAAc;EAAd,kCAAc;EAAd,2BAAc;EAAd,sBAAc;EAAd,8BAAc;EAAd,YAAc;EAAd,kBAAc;EAAd,gBAAc;EAAd,iBAAc;EAAd,kBAAc;EAAd,cAAc;EAAd,gBAAc;EAAd,aAAc;EAAd,mBAAc;EAAd,qBAAc;EAAd,2BAAc;EAAd,yBAAc;EAAd,0BAAc;EAAd,2BAAc;EAAd,uBAAc;EAAd,wBAAc;EAAd,yBAAc;EAAd;AAAc;;AAAd;EAAA,wBAAc;EAAd,wBAAc;EAAd,mBAAc;EAAd,mBAAc;EAAd,cAAc;EAAd,cAAc;EAAd,cAAc;EAAd,eAAc;EAAd,eAAc;EAAd,aAAc;EAAd,aAAc;EAAd,kBAAc;EAAd,sCAAc;EAAd,8BAAc;EAAd,6BAAc;EAAd,4BAAc;EAAd,eAAc;EAAd,oBAAc;EAAd,sBAAc;EAAd,uBAAc;EAAd,wBAAc;EAAd,kBAAc;EAAd,2BAAc;EAAd,4BAAc;EAAd,sCAAc;EAAd,kCAAc;EAAd,2BAAc;EAAd,sBAAc;EAAd,8BAAc;EAAd,YAAc;EAAd,kBAAc;EAAd,gBAAc;EAAd,iBAAc;EAAd,kBAAc;EAAd,cAAc;EAAd,gBAAc;EAAd,aAAc;EAAd,mBAAc;EAAd,qBAAc;EAAd,2BAAc;EAAd,yBAAc;EAAd,0BAAc;EAAd,2BAAc;EAAd,uBAAc;EAAd,wBAAc;EAAd,yBAAc;EAAd;AAAc;AACd;EAAA;AAAoB;AAApB;;EAAA;IAAA;EAAoB;AAAA;AAApB;;EAAA;IAAA;EAAoB;AAAA;AAApB;;EAAA;IAAA;EAAoB;AAAA;AAApB;;EAAA;IAAA;EAAoB;AAAA;AAApB;;EAAA;IAAA;EAAoB;AAAA;AACpB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,wBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,uBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,2BAAmB;EAAnB;AAAmB;AAAnB;EAAA,2BAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,gCAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,4DAAmB;EAAnB,qEAAmB;EAAnB;AAAmB;AAAnB;EAAA,4DAAmB;EAAnB,qEAAmB;EAAnB;AAAmB;AAAnB;EAAA,4DAAmB;EAAnB,qEAAmB;EAAnB;AAAmB;AAAnB;EAAA,4DAAmB;EAAnB,qEAAmB;EAAnB;AAAmB;AAAnB;EAAA,4DAAmB;EAAnB,qEAAmB;EAAnB;AAAmB;AAAnB;EAAA,4DAAmB;EAAnB,kEAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,qBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,mBAAmB;EAAnB;AAAmB;AAAnB;EAAA,iBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,iBAAmB;EAAnB;AAAmB;AAAnB;EAAA,mBAAmB;EAAnB;AAAmB;AAAnB;EAAA,mBAAmB;EAAnB;AAAmB;AAAnB;EAAA,mBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,+EAAmB;EAAnB,mGAAmB;EAAnB;AAAmB;AAAnB;EAAA,0CAAmB;EAAnB,uDAAmB;EAAnB;AAAmB;AAAnB;EAAA,8BAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,8BAAmB;EAAnB,+QAAmB;UAAnB;AAAmB;AAAnB;EAAA,6BAAmB;EAAnB,+QAAmB;UAAnB;AAAmB;AAAnB;EAAA,+QAAmB;UAAnB;AAAmB;;AAEnB;EACE,6CAA6C;EAC7C,gBAAgB;EAChB,kBAAkB;AACpB;;AAEA;EACE,6CAA6C;EAC7C,gBAAgB;EAChB,kBAAkB;AACpB;;AAdA;EAAA,sBAeA;EAfA;AAeA;;AAfA;EAAA,kBAeA;EAfA;AAeA;;AAfA;EAAA,kBAeA;EAfA;AAeA;;AAfA;EAAA,oBAeA;EAfA;AAeA;;AAfA;EAAA;AAeA;;AAfA;EAAA,sBAeA;EAfA;AAeA;;AAfA;EAAA,2GAeA;EAfA,yGAeA;EAfA;AAeA","sourcesContent":["@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n.nanum-gothic-coding-regular {\n  font-family: \"Nanum Gothic Coding\", monospace;\n  font-weight: 400;\n  font-style: normal;\n}\n\n.nanum-gothic-coding-bold {\n  font-family: \"Nanum Gothic Coding\", monospace;\n  font-weight: 700;\n  font-style: normal;\n}\n"],"sourceRoot":""}]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFF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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxjQUFjO0FBQ2Qsa0JBQWtCO0FBQ2xCOztBQUVBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Qsa0JBQWtCO0FBQ2xCOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCLDBCQUEwQjtBQUMxQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLGtGQUFrRixZQUFZLE1BQU0sT0FBTyxxQkFBcUIsb0JBQW9CLHFCQUFxQixxQkFBcUIsTUFBTSxNQUFNLFdBQVcsTUFBTSxZQUFZLE1BQU0sTUFBTSxxQkFBcUIscUJBQXFCLHFCQUFxQixVQUFVLG9CQUFvQixxQkFBcUIscUJBQXFCLHFCQUFxQixxQkFBcUIsTUFBTSxPQUFPLE1BQU0sS0FBSyxvQkFBb0IscUJBQXFCLE1BQU0sUUFBUSxNQUFNLEtBQUssb0JBQW9CLG9CQUFvQixxQkFBcUIsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLFdBQVcsTUFBTSxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsTUFBTSxNQUFNLE1BQU0sS0FBSyxVQUFVLFdBQVcsTUFBTSxNQUFNLE1BQU0sTUFBTSxXQUFXLE1BQU0sU0FBUyxNQUFNLFFBQVEscUJBQXFCLHFCQUFxQixxQkFBcUIsb0JBQW9CLE1BQU0sTUFBTSxNQUFNLEtBQUssVUFBVSxNQUFNLE1BQU0sTUFBTSxNQUFNLFVBQVUsVUFBVSxXQUFXLFdBQVcsTUFBTSxLQUFLLFVBQVUsTUFBTSxLQUFLLFVBQVUsTUFBTSxRQUFRLE1BQU0sS0FBSyxvQkFBb0IscUJBQXFCLHFCQUFxQixNQUFNLFFBQVEsTUFBTSxTQUFTLHFCQUFxQixxQkFBcUIscUJBQXFCLG9CQUFvQixxQkFBcUIscUJBQXFCLG9CQUFvQixvQkFBb0Isb0JBQW9CLE1BQU0sTUFBTSxNQUFNLE1BQU0sV0FBVyxNQUFNLE9BQU8sTUFBTSxRQUFRLHFCQUFxQixxQkFBcUIscUJBQXFCLE1BQU0sTUFBTSxNQUFNLEtBQUssVUFBVSxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxNQUFNLE1BQU0sVUFBVSxNQUFNLE9BQU8sTUFBTSxLQUFLLHFCQUFxQixxQkFBcUIsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sT0FBTyxNQUFNLEtBQUsscUJBQXFCLG9CQUFvQixNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLE1BQU0saUJBQWlCLFVBQVUsTUFBTSxLQUFLLFVBQVUsVUFBVSxNQUFNLEtBQUssVUFBVSxNQUFNLE9BQU8sV0FBVyxVQUFVLFVBQVUsTUFBTSxNQUFNLEtBQUssS0FBSyxVQUFVLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE9BQU8sTUFBTSxLQUFLLG9CQUFvQixvQkFBb0IsTUFBTSxNQUFNLG9CQUFvQixvQkFBb0IsTUFBTSxNQUFNLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxLQUFLLEtBQUssVUFBVSxNQUFNLFFBQVEsTUFBTSxZQUFZLG9CQUFvQixxQkFBcUIsTUFBTSxNQUFNLE1BQU0sTUFBTSxVQUFVLFVBQVUsTUFBTSxXQUFXLEtBQUssVUFBVSxNQUFNLEtBQUssV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxLQUFLLE1BQU0sS0FBSyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLEtBQUssS0FBSyxLQUFLLEtBQUssTUFBTSxPQUFPLEtBQUssS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxhQUFhLE1BQU0sTUFBTSxNQUFNLFlBQVksYUFBYSxNQUFNLE1BQU0sTUFBTSxZQUFZLGFBQWEsTUFBTSxNQUFNLE1BQU0sWUFBWSxhQUFhLE1BQU0sTUFBTSxNQUFNLFlBQVksYUFBYSxNQUFNLE1BQU0sTUFBTSxZQUFZLGFBQWEsTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxZQUFZLGFBQWEsTUFBTSxNQUFNLE1BQU0sWUFBWSxhQUFhLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFN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QUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsSUFBSTtXQUNKO1dBQ0E7V0FDQSxJQUFJO1dBQ0o7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsQ0FBQztXQUNEO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxFQUFFO1dBQ0Y7V0FDQSxzR0FBc0c7V0FDdEc7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEdBQUc7V0FDSDtXQUNBLEVBQUU7V0FDRjtXQUNBOzs7OztXQ2hFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7V0NOQTs7Ozs7VUVBQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9hY3Rpb25Db250cm9sbGVyLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9lcnJvcnMuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2dhbWUuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2dhbWVib2FyZC5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3BsYXllci5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvc2hpcC5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvdWlNYW5hZ2VyLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9zdHlsZXMuY3NzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3N0eWxlcy5jc3M/MGEyNSIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2FzeW5jIG1vZHVsZSIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL25vbmNlIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgR2FtZWJvYXJkIGZyb20gXCIuL2dhbWVib2FyZFwiO1xuXG5jb25zdCB7IGdyaWQgfSA9IEdhbWVib2FyZCgpO1xuXG5jb25zdCBzaGlwc1RvUGxhY2UgPSBbXG4gIHsgc2hpcFR5cGU6IFwiY2FycmllclwiLCBzaGlwTGVuZ3RoOiA1IH0sXG4gIHsgc2hpcFR5cGU6IFwiYmF0dGxlc2hpcFwiLCBzaGlwTGVuZ3RoOiA0IH0sXG4gIHsgc2hpcFR5cGU6IFwic3VibWFyaW5lXCIsIHNoaXBMZW5ndGg6IDMgfSxcbiAgeyBzaGlwVHlwZTogXCJjcnVpc2VyXCIsIHNoaXBMZW5ndGg6IDMgfSxcbiAgeyBzaGlwVHlwZTogXCJkZXN0cm95ZXJcIiwgc2hpcExlbmd0aDogMiB9LFxuXTtcblxuY29uc3QgaGl0QmdDbHIgPSBcImJnLWxpbWUtNzAwXCI7XG5jb25zdCBoaXRUZXh0Q2xyID0gXCJ0ZXh0LWxpbWUtNzAwXCI7XG5jb25zdCBtaXNzQmdDbHIgPSBcImJnLWdyYXktNDAwXCI7XG5jb25zdCBtaXNzVGV4dENsciA9IFwidGV4dC1vcmFuZ2UtODAwXCI7XG5jb25zdCBlcnJvclRleHRDbHIgPSBcInRleHQtcmVkLTgwMFwiO1xuY29uc3QgZGVmYXVsdFRleHRDbHIgPSBcInRleHQtZ3JheS02MDBcIjtcblxuY29uc3QgcHJpbWFyeUhvdmVyQ2xyID0gXCJob3ZlcjpiZy1vcmFuZ2UtNTAwXCI7XG5jb25zdCBoaWdobGlnaHRDbHIgPSBcImJnLW9yYW5nZS0zMDBcIjtcblxubGV0IGN1cnJlbnRPcmllbnRhdGlvbiA9IFwiaFwiOyAvLyBEZWZhdWx0IG9yaWVudGF0aW9uXG5sZXQgY3VycmVudFNoaXA7XG5sZXQgbGFzdEhvdmVyZWRDZWxsID0gbnVsbDsgLy8gU3RvcmUgdGhlIGxhc3QgaG92ZXJlZCBjZWxsJ3MgSURcblxuY29uc3QgcGxhY2VTaGlwR3VpZGUgPSB7XG4gIHByb21wdDpcbiAgICBcIkVudGVyIHRoZSBncmlkIHBvc2l0aW9uIChpLmUuICdBMScpIGFuZCBvcmllbnRhdGlvbiAoJ2gnIGZvciBob3Jpem9udGFsIGFuZCAndicgZm9yIHZlcnRpY2FsKSwgc2VwYXJhdGVkIHdpdGggYSBzcGFjZS4gRm9yIGV4YW1wbGUgJ0EyIHYnLiBBbHRlcm5hdGl2ZWx5LCBvbiB5b3UgZ2FtZWJvYXJkIGNsaWNrIHRoZSBjZWxsIHlvdSB3YW50IHRvIHNldCBhdCB0aGUgc3RhcnRpbmcgcG9pbnQsIHVzZSBzcGFjZWJhciB0byB0b2dnbGUgdGhlIG9yaWVudGF0aW9uLlwiLFxuICBwcm9tcHRUeXBlOiBcImd1aWRlXCIsXG59O1xuXG5jb25zdCBnYW1lcGxheUd1aWRlID0ge1xuICBwcm9tcHQ6XG4gICAgXCJFbnRlciBncmlkIHBvc2l0aW9uIChpLmUuICdBMScpIHlvdSB3YW50IHRvIGF0dGFjay4gQWx0ZXJuYXRpdmVseSwgY2xpY2sgdGhlIGNlbGwgeW91IHdhbnQgdG8gYXR0YWNrIG9uIHRoZSBvcHBvbmVudCdzIGdhbWVib2FyZFwiLFxuICBwcm9tcHRUeXBlOiBcImd1aWRlXCIsXG59O1xuXG5jb25zdCB0dXJuUHJvbXB0ID0ge1xuICBwcm9tcHQ6IFwiTWFrZSB5b3VyIG1vdmUuXCIsXG4gIHByb21wdFR5cGU6IFwiaW5zdHJ1Y3Rpb25cIixcbn07XG5cbmNvbnN0IHByb2Nlc3NDb21tYW5kID0gKGNvbW1hbmQsIGlzTW92ZSkgPT4ge1xuICAvLyBJZiBpc01vdmUgaXMgdHJ1dGh5LCBhc3NpZ24gYXMgc2luZ2xlIGl0ZW0gYXJyYXksIG90aGVyd2lzZSBzcGxpdCB0aGUgY29tbWFuZCBieSBzcGFjZVxuICBjb25zdCBwYXJ0cyA9IGlzTW92ZSA/IFtjb21tYW5kXSA6IGNvbW1hbmQuc3BsaXQoXCIgXCIpO1xuICBpZiAoIWlzTW92ZSAmJiBwYXJ0cy5sZW5ndGggIT09IDIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIkludmFsaWQgY29tbWFuZCBmb3JtYXQuIFBsZWFzZSB1c2UgdGhlIGZvcm1hdCAnR3JpZFBvc2l0aW9uIE9yaWVudGF0aW9uJy5cIixcbiAgICApO1xuICB9XG5cbiAgLy8gUHJvY2VzcyBhbmQgdmFsaWRhdGUgdGhlIGdyaWQgcG9zaXRpb25cbiAgY29uc3QgZ3JpZFBvc2l0aW9uID0gcGFydHNbMF0udG9VcHBlckNhc2UoKTtcbiAgaWYgKGdyaWRQb3NpdGlvbi5sZW5ndGggPCAyIHx8IGdyaWRQb3NpdGlvbi5sZW5ndGggPiAzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBncmlkIHBvc2l0aW9uLiBNdXN0IGJlIDIgdG8gMyBjaGFyYWN0ZXJzIGxvbmcuXCIpO1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgZ3JpZCBwb3NpdGlvbiBhZ2FpbnN0IHRoZSBncmlkIG1hdHJpeFxuICBjb25zdCB2YWxpZEdyaWRQb3NpdGlvbnMgPSBncmlkLmZsYXQoKTsgLy8gRmxhdHRlbiB0aGUgZ3JpZCBmb3IgZWFzaWVyIHNlYXJjaGluZ1xuICBpZiAoIXZhbGlkR3JpZFBvc2l0aW9ucy5pbmNsdWRlcyhncmlkUG9zaXRpb24pKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgXCJJbnZhbGlkIGdyaWQgcG9zaXRpb24uIERvZXMgbm90IG1hdGNoIGFueSB2YWxpZCBncmlkIHZhbHVlcy5cIixcbiAgICApO1xuICB9XG5cbiAgY29uc3QgcmVzdWx0ID0geyBncmlkUG9zaXRpb24gfTtcblxuICBpZiAoIWlzTW92ZSkge1xuICAgIC8vIFByb2Nlc3MgYW5kIHZhbGlkYXRlIHRoZSBvcmllbnRhdGlvblxuICAgIGNvbnN0IG9yaWVudGF0aW9uID0gcGFydHNbMV0udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAob3JpZW50YXRpb24gIT09IFwiaFwiICYmIG9yaWVudGF0aW9uICE9PSBcInZcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBcIkludmFsaWQgb3JpZW50YXRpb24uIE11c3QgYmUgZWl0aGVyICdoJyBmb3IgaG9yaXpvbnRhbCBvciAndicgZm9yIHZlcnRpY2FsLlwiLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXN1bHQub3JpZW50YXRpb24gPSBvcmllbnRhdGlvbjtcbiAgfVxuXG4gIC8vIFJldHVybiB0aGUgcHJvY2Vzc2VkIGFuZCB2YWxpZGF0ZWQgY29tbWFuZCBwYXJ0c1xuICByZXR1cm4gcmVzdWx0O1xufTtcblxuLy8gVGhlIGZ1bmN0aW9uIGZvciB1cGRhdGluZyB0aGUgb3V0cHV0IGRpdiBlbGVtZW50XG5jb25zdCB1cGRhdGVPdXRwdXQgPSAobWVzc2FnZSwgdHlwZSkgPT4ge1xuICAvLyBHZXQgdGhlIG91cHV0IGVsZW1lbnRcbiAgY29uc3Qgb3V0cHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLW91dHB1dFwiKTtcblxuICAvLyBBcHBlbmQgbmV3IG1lc3NhZ2VcbiAgY29uc3QgbWVzc2FnZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpOyAvLyBDcmVhdGUgYSBuZXcgZGl2IGZvciB0aGUgbWVzc2FnZVxuICBtZXNzYWdlRWxlbWVudC50ZXh0Q29udGVudCA9IG1lc3NhZ2U7IC8vIFNldCB0aGUgdGV4dCBjb250ZW50IHRvIHRoZSBtZXNzYWdlXG5cbiAgLy8gQXBwbHkgc3R5bGluZyBiYXNlZCBvbiBwcm9tcHRUeXBlXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgXCJ2YWxpZFwiOlxuICAgICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZChoaXRUZXh0Q2xyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJtaXNzXCI6XG4gICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKG1pc3NUZXh0Q2xyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZChlcnJvclRleHRDbHIpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIG1lc3NhZ2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoZGVmYXVsdFRleHRDbHIpOyAvLyBEZWZhdWx0IHRleHQgY29sb3JcbiAgfVxuXG4gIG91dHB1dC5hcHBlbmRDaGlsZChtZXNzYWdlRWxlbWVudCk7IC8vIEFkZCB0aGUgZWxlbWVudCB0byB0aGUgb3V0cHV0XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIG91dHB1dC5zY3JvbGxUb3AgPSBvdXRwdXQuc2Nyb2xsSGVpZ2h0OyAvLyBTY3JvbGwgdG8gdGhlIGJvdHRvbSBvZiB0aGUgb3V0cHV0IGNvbnRhaW5lclxufTtcblxuLy8gVGhlIGZ1bmN0aW9uIGZvciBleGVjdXRpbmcgY29tbWFuZHMgZnJvbSB0aGUgY29uc29sZSBpbnB1dFxuY29uc3QgY29uc29sZUxvZ1BsYWNlbWVudENvbW1hbmQgPSAoc2hpcFR5cGUsIGdyaWRQb3NpdGlvbiwgb3JpZW50YXRpb24pID0+IHtcbiAgLy8gU2V0IHRoZSBvcmllbnRhdGlvbiBmZWVkYmFja1xuICBjb25zdCBkaXJGZWViYWNrID0gb3JpZW50YXRpb24gPT09IFwiaFwiID8gXCJob3Jpem9udGFsbHlcIiA6IFwidmVydGljYWxseVwiO1xuICAvLyBTZXQgdGhlIGNvbnNvbGUgbWVzc2FnZVxuICBjb25zdCBtZXNzYWdlID0gYCR7c2hpcFR5cGUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzaGlwVHlwZS5zbGljZSgxKX0gcGxhY2VkIGF0ICR7Z3JpZFBvc2l0aW9ufSBmYWNpbmcgJHtkaXJGZWViYWNrfWA7XG5cbiAgdXBkYXRlT3V0cHV0KGA+ICR7bWVzc2FnZX1gLCBcInZhbGlkXCIpO1xuXG4gIC8vIENsZWFyIHRoZSBpbnB1dFxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtaW5wdXRcIikudmFsdWUgPSBcIlwiO1xufTtcblxuLy8gVGhlIGZ1bmN0aW9uIGZvciBleGVjdXRpbmcgY29tbWFuZHMgZnJvbSB0aGUgY29uc29sZSBpbnB1dFxuY29uc3QgY29uc29sZUxvZ01vdmVDb21tYW5kID0gKHJlc3VsdHNPYmplY3QpID0+IHtcbiAgLy8gU2V0IHRoZSBjb25zb2xlIG1lc3NhZ2VcbiAgY29uc3QgbWVzc2FnZSA9IGBUaGUgJHtyZXN1bHRzT2JqZWN0LnBsYXllcn0ncyBtb3ZlIG9uICR7cmVzdWx0c09iamVjdC5tb3ZlfSByZXN1bHRlZCBpbiBhICR7cmVzdWx0c09iamVjdC5oaXQgPyBcIkhJVFwiIDogXCJNSVNTXCJ9IWA7XG5cbiAgdXBkYXRlT3V0cHV0KGA+ICR7bWVzc2FnZX1gLCByZXN1bHRzT2JqZWN0LmhpdCA/IFwidmFsaWRcIiA6IFwibWlzc1wiKTtcblxuICAvLyBDbGVhciB0aGUgaW5wdXRcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLWlucHV0XCIpLnZhbHVlID0gXCJcIjtcbn07XG5cbmNvbnN0IGNvbnNvbGVMb2dTaGlwU2luayA9IChyZXN1bHRzT2JqZWN0KSA9PiB7XG4gIGNvbnN0IHsgcGxheWVyLCBzaGlwVHlwZSB9ID0gcmVzdWx0c09iamVjdDtcbiAgLy8gU2V0IHRoZSBjb25zb2xlIG1lc3NhZ2VcbiAgY29uc3QgbWVzc2FnZSA9XG4gICAgcGxheWVyID09PSBcImh1bWFuXCJcbiAgICAgID8gYFlvdSBzdW5rIHRoZWlyICR7c2hpcFR5cGV9IWBcbiAgICAgIDogYFRoZXkgc3VuayB5b3VyICR7c2hpcFR5cGV9IWA7XG5cbiAgdXBkYXRlT3V0cHV0KGA+ICR7bWVzc2FnZX1gLCBcImVycm9yXCIpO1xuXG4gIC8vIENsZWFyIHRoZSBpbnB1dFxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtaW5wdXRcIikudmFsdWUgPSBcIlwiO1xufTtcblxuY29uc3QgY29uc29sZUxvZ0Vycm9yID0gKGVycm9yLCBzaGlwVHlwZSkgPT4ge1xuICBpZiAoc2hpcFR5cGUpIHtcbiAgICAvLyBJZiBzaGlwVHlwZSBpcyBwYXNzZWQgdGhlbiBwcm9jZXNzIGVycm9yIGFzIHBsYWNlbWVudCBlcnJvclxuICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIHBsYWNpbmcgJHtzaGlwVHlwZX06IG1lc3NhZ2UgPSAke2Vycm9yLm1lc3NhZ2V9LmApO1xuXG4gICAgdXBkYXRlT3V0cHV0KGA+IEVycm9yIHBsYWNpbmcgJHtzaGlwVHlwZX06ICR7ZXJyb3IubWVzc2FnZX1gLCBcImVycm9yXCIpO1xuICB9IGVsc2Uge1xuICAgIC8vIGVsc2UgaWYgc2hpcFR5cGUgaXMgdW5kZWZpbmVkLCBwcm9jZXNzIGVycm9yIGFzIG1vdmUgZXJyb3JcbiAgICB1cGRhdGVPdXRwdXQoYD4gRXJyb3IgbWFraW5nIG1vdmU6IG1lc3NhZ2UgPSAke2Vycm9yLm1lc3NhZ2V9LmAsIFwiZXJyb3JcIik7XG4gIH1cblxuICAvLyBDbGVhciB0aGUgaW5wdXRcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLWlucHV0XCIpLnZhbHVlID0gXCJcIjtcbn07XG5cbi8vIEZ1bmN0aW9uIGluaXRpYWxpc2UgdWlNYW5hZ2VyXG5jb25zdCBpbml0VWlNYW5hZ2VyID0gKHVpTWFuYWdlcikgPT4ge1xuICAvLyBJbml0aWFsaXNlIGNvbnNvbGVcbiAgdWlNYW5hZ2VyLmluaXRDb25zb2xlVUkoKTtcblxuICAvLyBJbml0aWFsaXNlIGdhbWVib2FyZCB3aXRoIGNhbGxiYWNrIGZvciBjZWxsIGNsaWNrc1xuICB1aU1hbmFnZXIuY3JlYXRlR2FtZWJvYXJkKFwiaHVtYW4tZ2JcIik7XG4gIHVpTWFuYWdlci5jcmVhdGVHYW1lYm9hcmQoXCJjb21wLWdiXCIpO1xufTtcblxuLy8gRnVuY3Rpb24gdG8gY2FsY3VsYXRlIGNlbGwgSURzIGJhc2VkIG9uIHN0YXJ0IHBvc2l0aW9uLCBsZW5ndGgsIGFuZCBvcmllbnRhdGlvblxuZnVuY3Rpb24gY2FsY3VsYXRlU2hpcENlbGxzKHN0YXJ0Q2VsbCwgc2hpcExlbmd0aCwgb3JpZW50YXRpb24pIHtcbiAgY29uc3QgY2VsbElkcyA9IFtdO1xuICBjb25zdCByb3dJbmRleCA9IHN0YXJ0Q2VsbC5jaGFyQ29kZUF0KDApIC0gXCJBXCIuY2hhckNvZGVBdCgwKTtcbiAgY29uc3QgY29sSW5kZXggPSBwYXJzZUludChzdGFydENlbGwuc3Vic3RyaW5nKDEpLCAxMCkgLSAxO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgaWYgKG9yaWVudGF0aW9uID09PSBcInZcIikge1xuICAgICAgaWYgKGNvbEluZGV4ICsgaSA+PSBncmlkWzBdLmxlbmd0aCkgYnJlYWs7IC8vIENoZWNrIGdyaWQgYm91bmRzXG4gICAgICBjZWxsSWRzLnB1c2goXG4gICAgICAgIGAke1N0cmluZy5mcm9tQ2hhckNvZGUocm93SW5kZXggKyBcIkFcIi5jaGFyQ29kZUF0KDApKX0ke2NvbEluZGV4ICsgaSArIDF9YCxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChyb3dJbmRleCArIGkgPj0gZ3JpZC5sZW5ndGgpIGJyZWFrOyAvLyBDaGVjayBncmlkIGJvdW5kc1xuICAgICAgY2VsbElkcy5wdXNoKFxuICAgICAgICBgJHtTdHJpbmcuZnJvbUNoYXJDb2RlKHJvd0luZGV4ICsgaSArIFwiQVwiLmNoYXJDb2RlQXQoMCkpfSR7Y29sSW5kZXggKyAxfWAsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjZWxsSWRzO1xufVxuXG4vLyBGdW5jdGlvbiB0byBoaWdobGlnaHQgY2VsbHNcbmZ1bmN0aW9uIGhpZ2hsaWdodENlbGxzKGNlbGxJZHMpIHtcbiAgY2VsbElkcy5mb3JFYWNoKChjZWxsSWQpID0+IHtcbiAgICBjb25zdCBjZWxsRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiJHtjZWxsSWR9XCJdYCk7XG4gICAgaWYgKGNlbGxFbGVtZW50KSB7XG4gICAgICBjZWxsRWxlbWVudC5jbGFzc0xpc3QuYWRkKGhpZ2hsaWdodENscik7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gRnVuY3Rpb24gdG8gY2xlYXIgaGlnaGxpZ2h0IGZyb20gY2VsbHNcbmZ1bmN0aW9uIGNsZWFySGlnaGxpZ2h0KGNlbGxJZHMpIHtcbiAgY2VsbElkcy5mb3JFYWNoKChjZWxsSWQpID0+IHtcbiAgICBjb25zdCBjZWxsRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiJHtjZWxsSWR9XCJdYCk7XG4gICAgaWYgKGNlbGxFbGVtZW50KSB7XG4gICAgICBjZWxsRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGhpZ2hsaWdodENscik7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gRnVuY3Rpb24gdG8gdG9nZ2xlIG9yaWVudGF0aW9uXG5mdW5jdGlvbiB0b2dnbGVPcmllbnRhdGlvbigpIHtcbiAgY3VycmVudE9yaWVudGF0aW9uID0gY3VycmVudE9yaWVudGF0aW9uID09PSBcImhcIiA/IFwidlwiIDogXCJoXCI7XG4gIC8vIFVwZGF0ZSB0aGUgdmlzdWFsIHByb21wdCBoZXJlIGlmIG5lY2Vzc2FyeVxufVxuXG5jb25zdCBoYW5kbGVQbGFjZW1lbnRIb3ZlciA9IChlKSA9PiB7XG4gIGNvbnN0IGNlbGwgPSBlLnRhcmdldDtcbiAgaWYgKFxuICAgIGNlbGwuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZ2FtZWJvYXJkLWNlbGxcIikgJiZcbiAgICBjZWxsLmRhdGFzZXQucGxheWVyID09PSBcImh1bWFuXCJcbiAgKSB7XG4gICAgLy8gTG9naWMgdG8gaGFuZGxlIGhvdmVyIGVmZmVjdFxuICAgIGNvbnN0IGNlbGxQb3MgPSBjZWxsLmRhdGFzZXQucG9zaXRpb247XG4gICAgbGFzdEhvdmVyZWRDZWxsID0gY2VsbFBvcztcbiAgICBjb25zdCBjZWxsc1RvSGlnaGxpZ2h0ID0gY2FsY3VsYXRlU2hpcENlbGxzKFxuICAgICAgY2VsbFBvcyxcbiAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICBjdXJyZW50T3JpZW50YXRpb24sXG4gICAgKTtcbiAgICBoaWdobGlnaHRDZWxscyhjZWxsc1RvSGlnaGxpZ2h0KTtcbiAgfVxufTtcblxuY29uc3QgaGFuZGxlTW91c2VMZWF2ZSA9IChlKSA9PiB7XG4gIGNvbnN0IGNlbGwgPSBlLnRhcmdldDtcbiAgaWYgKGNlbGwuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZ2FtZWJvYXJkLWNlbGxcIikpIHtcbiAgICAvLyBMb2dpYyBmb3IgaGFuZGxpbmcgd2hlbiB0aGUgY3Vyc29yIGxlYXZlcyBhIGNlbGxcbiAgICBjb25zdCBjZWxsUG9zID0gY2VsbC5kYXRhc2V0LnBvc2l0aW9uO1xuICAgIGlmIChjZWxsUG9zID09PSBsYXN0SG92ZXJlZENlbGwpIHtcbiAgICAgIGNvbnN0IGNlbGxzVG9DbGVhciA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgICAgY2VsbFBvcyxcbiAgICAgICAgY3VycmVudFNoaXAuc2hpcExlbmd0aCxcbiAgICAgICAgY3VycmVudE9yaWVudGF0aW9uLFxuICAgICAgKTtcbiAgICAgIGNsZWFySGlnaGxpZ2h0KGNlbGxzVG9DbGVhcik7XG4gICAgICBsYXN0SG92ZXJlZENlbGwgPSBudWxsOyAvLyBSZXNldCBsYXN0SG92ZXJlZENlbGwgc2luY2UgdGhlIG1vdXNlIGhhcyBsZWZ0XG4gICAgfVxuICAgIGxhc3RIb3ZlcmVkQ2VsbCA9IG51bGw7XG4gIH1cbn07XG5cbmNvbnN0IGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlID0gKGUpID0+IHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpOyAvLyBQcmV2ZW50IHRoZSBkZWZhdWx0IHNwYWNlYmFyIGFjdGlvblxuICBpZiAoZS5rZXkgPT09IFwiIFwiICYmIGxhc3RIb3ZlcmVkQ2VsbCkge1xuICAgIC8vIEVuc3VyZSBzcGFjZWJhciBpcyBwcmVzc2VkIGFuZCB0aGVyZSdzIGEgbGFzdCBob3ZlcmVkIGNlbGxcblxuICAgIC8vIFRvZ2dsZSB0aGUgb3JpZW50YXRpb25cbiAgICB0b2dnbGVPcmllbnRhdGlvbigpO1xuXG4gICAgLy8gQ2xlYXIgcHJldmlvdXNseSBoaWdobGlnaHRlZCBjZWxsc1xuICAgIC8vIEFzc3VtaW5nIGNhbGN1bGF0ZVNoaXBDZWxscyBhbmQgY2xlYXJIaWdobGlnaHQgd29yayBjb3JyZWN0bHlcbiAgICBjb25zdCBvbGRDZWxsc1RvQ2xlYXIgPSBjYWxjdWxhdGVTaGlwQ2VsbHMoXG4gICAgICBsYXN0SG92ZXJlZENlbGwsXG4gICAgICBjdXJyZW50U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgY3VycmVudE9yaWVudGF0aW9uID09PSBcImhcIiA/IFwidlwiIDogXCJoXCIsXG4gICAgKTtcbiAgICBjbGVhckhpZ2hsaWdodChvbGRDZWxsc1RvQ2xlYXIpO1xuXG4gICAgLy8gSGlnaGxpZ2h0IG5ldyBjZWxscyBiYXNlZCBvbiB0aGUgbmV3IG9yaWVudGF0aW9uXG4gICAgY29uc3QgbmV3Q2VsbHNUb0hpZ2hsaWdodCA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgIGxhc3RIb3ZlcmVkQ2VsbCxcbiAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICBjdXJyZW50T3JpZW50YXRpb24sXG4gICAgKTtcbiAgICBoaWdobGlnaHRDZWxscyhuZXdDZWxsc1RvSGlnaGxpZ2h0KTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZW5hYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlcigpIHtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvckFsbCgnLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPVwiY29tcHV0ZXJcIl0nKVxuICAgIC5mb3JFYWNoKChjZWxsKSA9PiB7XG4gICAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUoXCJwb2ludGVyLWV2ZW50cy1ub25lXCIsIFwiY3Vyc29yLWRlZmF1bHRcIik7XG4gICAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUocHJpbWFyeUhvdmVyQ2xyKTtcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChwcmltYXJ5SG92ZXJDbHIpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBkaXNhYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlcihjZWxsc0FycmF5KSB7XG4gIGNlbGxzQXJyYXkuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgIGNlbGwuY2xhc3NMaXN0LmFkZChcInBvaW50ZXItZXZlbnRzLW5vbmVcIiwgXCJjdXJzb3ItZGVmYXVsdFwiKTtcbiAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUocHJpbWFyeUhvdmVyQ2xyKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRpc2FibGVIdW1hbkdhbWVib2FyZEhvdmVyKCkge1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9XCJodW1hblwiXScpXG4gICAgLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChcInBvaW50ZXItZXZlbnRzLW5vbmVcIiwgXCJjdXJzb3ItZGVmYXVsdFwiKTtcbiAgICAgIGNlbGwuY2xhc3NMaXN0LnJlbW92ZShwcmltYXJ5SG92ZXJDbHIpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzd2l0Y2hHYW1lYm9hcmRIb3ZlclN0YXRlcygpIHtcbiAgLy8gRGlzYWJsZSBob3ZlciBvbiB0aGUgaHVtYW4ncyBnYW1lYm9hcmRcbiAgZGlzYWJsZUh1bWFuR2FtZWJvYXJkSG92ZXIoKTtcblxuICAvLyBFbmFibGUgaG92ZXIgb24gdGhlIGNvbXB1dGVyJ3MgZ2FtZWJvYXJkXG4gIGVuYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoKTtcbn1cblxuLy8gRnVuY3Rpb24gdG8gc2V0dXAgZ2FtZWJvYXJkIGZvciBzaGlwIHBsYWNlbWVudFxuY29uc3Qgc2V0dXBHYW1lYm9hcmRGb3JQbGFjZW1lbnQgPSAoKSA9PiB7XG4gIGNvbnN0IGNvbXBHYW1lYm9hcmRDZWxscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImNvbXB1dGVyXCJdJyxcbiAgKTtcbiAgZGlzYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoY29tcEdhbWVib2FyZENlbGxzKTtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvckFsbCgnLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPVwiaHVtYW5cIl0nKVxuICAgIC5mb3JFYWNoKChjZWxsKSA9PiB7XG4gICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIGhhbmRsZVBsYWNlbWVudEhvdmVyKTtcbiAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgaGFuZGxlTW91c2VMZWF2ZSk7XG4gICAgfSk7XG4gIC8vIEdldCBnYW1lYm9hcmQgYXJlYSBkaXYgZWxlbWVudFxuICBjb25zdCBnYW1lYm9hcmRBcmVhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICBcIi5nYW1lYm9hcmQtYXJlYSwgW2RhdGEtcGxheWVyPSdodW1hbiddXCIsXG4gICk7XG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgdG8gZ2FtZWJvYXJkIGFyZWEgdG8gYWRkIGFuZCByZW1vdmUgdGhlXG4gIC8vIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlIGV2ZW50IGxpc3RlbmVyIHdoZW4gZW50ZXJpbmcgYW5kIGV4aXRpbmcgdGhlIGFyZWFcbiAgZ2FtZWJvYXJkQXJlYS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xuICB9KTtcbiAgZ2FtZWJvYXJkQXJlYS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xuICB9KTtcbn07XG5cbi8vIEZ1bmN0aW9uIHRvIGNsZWFuIHVwIGFmdGVyIHNoaXAgcGxhY2VtZW50IGlzIGNvbXBsZXRlXG5jb25zdCBjbGVhbnVwQWZ0ZXJQbGFjZW1lbnQgPSAoKSA9PiB7XG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImh1bWFuXCJdJylcbiAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgY2VsbC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBoYW5kbGVQbGFjZW1lbnRIb3Zlcik7XG4gICAgICBjZWxsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIGhhbmRsZU1vdXNlTGVhdmUpO1xuICAgIH0pO1xuICAvLyBHZXQgZ2FtZWJvYXJkIGFyZWEgZGl2IGVsZW1lbnRcbiAgY29uc3QgZ2FtZWJvYXJkQXJlYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgXCIuZ2FtZWJvYXJkLWFyZWEsIFtkYXRhLXBsYXllcj0naHVtYW4nXVwiLFxuICApO1xuICAvLyBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzIHRvIGdhbWVib2FyZCBhcmVhIHRvIGFkZCBhbmQgcmVtb3ZlIHRoZVxuICAvLyBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSBldmVudCBsaXN0ZW5lciB3aGVuIGVudGVyaW5nIGFuZCBleGl0aW5nIHRoZSBhcmVhXG4gIGdhbWVib2FyZEFyZWEucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlKTtcbiAgfSk7XG4gIGdhbWVib2FyZEFyZWEucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlKTtcbiAgfSk7XG4gIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lciBmb3Iga2V5ZG93biBldmVudHNcbiAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUpO1xufTtcblxuLy8gRnVuY3Rpb24gZm9yIHN0YXJ0aW5nIHRoZSBnYW1lXG5jb25zdCBzdGFydEdhbWUgPSBhc3luYyAodWlNYW5hZ2VyLCBnYW1lKSA9PiB7XG4gIC8vIFNldCB1cCB0aGUgZ2FtZSBieSBhdXRvIHBsYWNpbmcgY29tcHV0ZXIncyBzaGlwcyBhbmQgc2V0dGluZyB0aGVcbiAgLy8gY3VycmVudCBwbGF5ZXIgdG8gdGhlIGh1bWFuIHBsYXllclxuICBhd2FpdCBnYW1lLnNldFVwKCk7XG5cbiAgLy8gUmVuZGVyIHRoZSBzaGlwIGRpc3BsYXkgZm9yIHRoZSBjb21wdXRlciBwbGF5ZXJcbiAgc2hpcHNUb1BsYWNlLmZvckVhY2goKHNoaXApID0+IHtcbiAgICB1aU1hbmFnZXIucmVuZGVyU2hpcERpc3AoZ2FtZS5wbGF5ZXJzLmNvbXB1dGVyLCBzaGlwLnNoaXBUeXBlKTtcbiAgfSk7XG5cbiAgLy8gRGlzcGxheSBwcm9tcHQgb2JqZWN0IGZvciB0YWtpbmcgYSB0dXJuIGFuZCBzdGFydGluZyB0aGUgZ2FtZVxuICB1aU1hbmFnZXIuZGlzcGxheVByb21wdCh7IHR1cm5Qcm9tcHQsIGdhbWVwbGF5R3VpZGUgfSk7XG59O1xuXG5jb25zdCBBY3Rpb25Db250cm9sbGVyID0gKHVpTWFuYWdlciwgZ2FtZSkgPT4ge1xuICBjb25zdCBodW1hblBsYXllciA9IGdhbWUucGxheWVycy5odW1hbjtcbiAgY29uc3QgaHVtYW5QbGF5ZXJHYW1lYm9hcmQgPSBodW1hblBsYXllci5nYW1lYm9hcmQ7XG4gIGNvbnN0IGNvbXBQbGF5ZXIgPSBnYW1lLnBsYXllcnMuY29tcHV0ZXI7XG4gIGNvbnN0IGNvbXBQbGF5ZXJHYW1lYm9hcmQgPSBjb21wUGxheWVyLmdhbWVib2FyZDtcblxuICAvLyBGdW5jdGlvbiB0byBzZXR1cCBldmVudCBsaXN0ZW5lcnMgZm9yIGNvbnNvbGUgYW5kIGdhbWVib2FyZCBjbGlja3NcbiAgZnVuY3Rpb24gc2V0dXBFdmVudExpc3RlbmVycyhoYW5kbGVyRnVuY3Rpb24sIHBsYXllclR5cGUpIHtcbiAgICAvLyBEZWZpbmUgY2xlYW51cCBmdW5jdGlvbnMgaW5zaWRlIHRvIGVuc3VyZSB0aGV5IGFyZSBhY2Nlc3NpYmxlIGZvciByZW1vdmFsXG4gICAgY29uc3QgY2xlYW51cEZ1bmN0aW9ucyA9IFtdO1xuXG4gICAgY29uc3QgY29uc29sZVN1Ym1pdEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1zdWJtaXRcIik7XG4gICAgY29uc3QgY29uc29sZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLWlucHV0XCIpO1xuXG4gICAgY29uc3Qgc3VibWl0SGFuZGxlciA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGlucHV0ID0gY29uc29sZUlucHV0LnZhbHVlO1xuICAgICAgaGFuZGxlckZ1bmN0aW9uKGlucHV0KTtcbiAgICAgIGNvbnNvbGVJbnB1dC52YWx1ZSA9IFwiXCI7IC8vIENsZWFyIGlucHV0IGFmdGVyIHN1Ym1pc3Npb25cbiAgICB9O1xuXG4gICAgY29uc3Qga2V5cHJlc3NIYW5kbGVyID0gKGUpID0+IHtcbiAgICAgIGlmIChlLmtleSA9PT0gXCJFbnRlclwiKSB7XG4gICAgICAgIHN1Ym1pdEhhbmRsZXIoKTsgLy8gUmV1c2Ugc3VibWl0IGxvZ2ljIGZvciBFbnRlciBrZXkgcHJlc3NcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc29sZVN1Ym1pdEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgc3VibWl0SGFuZGxlcik7XG4gICAgY29uc29sZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBrZXlwcmVzc0hhbmRsZXIpO1xuXG4gICAgLy8gQWRkIGNsZWFudXAgZnVuY3Rpb24gZm9yIGNvbnNvbGUgbGlzdGVuZXJzXG4gICAgY2xlYW51cEZ1bmN0aW9ucy5wdXNoKCgpID0+IHtcbiAgICAgIGNvbnNvbGVTdWJtaXRCdXR0b24ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHN1Ym1pdEhhbmRsZXIpO1xuICAgICAgY29uc29sZUlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBrZXlwcmVzc0hhbmRsZXIpO1xuICAgIH0pO1xuXG4gICAgLy8gU2V0dXAgZm9yIGdhbWVib2FyZCBjZWxsIGNsaWNrc1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvckFsbChgLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPSR7cGxheWVyVHlwZX1dYClcbiAgICAgIC5mb3JFYWNoKChjZWxsKSA9PiB7XG4gICAgICAgIGNvbnN0IGNsaWNrSGFuZGxlciA9ICgpID0+IHtcbiAgICAgICAgICBjb25zdCB7IHBvc2l0aW9uIH0gPSBjZWxsLmRhdGFzZXQ7XG4gICAgICAgICAgbGV0IGlucHV0O1xuICAgICAgICAgIGlmIChwbGF5ZXJUeXBlID09PSBcImh1bWFuXCIpIHtcbiAgICAgICAgICAgIGlucHV0ID0gYCR7cG9zaXRpb259ICR7Y3VycmVudE9yaWVudGF0aW9ufWA7XG4gICAgICAgICAgfSBlbHNlIGlmIChwbGF5ZXJUeXBlID09PSBcImNvbXB1dGVyXCIpIHtcbiAgICAgICAgICAgIGlucHV0ID0gcG9zaXRpb247XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgXCJFcnJvciEgSW52YWxpZCBwbGF5ZXIgdHlwZSBwYXNzZWQgdG8gY2xpY2tIYW5kbGVyIVwiLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaGFuZGxlckZ1bmN0aW9uKGlucHV0KTtcbiAgICAgICAgfTtcbiAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xpY2tIYW5kbGVyKTtcblxuICAgICAgICAvLyBBZGQgY2xlYW51cCBmdW5jdGlvbiBmb3IgZWFjaCBjZWxsIGxpc3RlbmVyXG4gICAgICAgIGNsZWFudXBGdW5jdGlvbnMucHVzaCgoKSA9PlxuICAgICAgICAgIGNlbGwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsaWNrSGFuZGxlciksXG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgIC8vIFJldHVybiBhIHNpbmdsZSBjbGVhbnVwIGZ1bmN0aW9uIHRvIHJlbW92ZSBhbGwgbGlzdGVuZXJzXG4gICAgcmV0dXJuICgpID0+IGNsZWFudXBGdW5jdGlvbnMuZm9yRWFjaCgoY2xlYW51cCkgPT4gY2xlYW51cCgpKTtcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIHByb21wdEFuZFBsYWNlU2hpcChzaGlwVHlwZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAvLyBTZXQgdGhlIGN1cnJlbnQgc2hpcFxuICAgICAgY3VycmVudFNoaXAgPSBzaGlwc1RvUGxhY2UuZmluZCgoc2hpcCkgPT4gc2hpcC5zaGlwVHlwZSA9PT0gc2hpcFR5cGUpO1xuXG4gICAgICAvLyBEaXNwbGF5IHByb21wdCBmb3IgdGhlIHNwZWNpZmljIHNoaXAgdHlwZSBhcyB3ZWxsIGFzIHRoZSBndWlkZSB0byBwbGFjaW5nIHNoaXBzXG4gICAgICBjb25zdCBwbGFjZVNoaXBQcm9tcHQgPSB7XG4gICAgICAgIHByb21wdDogYFBsYWNlIHlvdXIgJHtzaGlwVHlwZX0uYCxcbiAgICAgICAgcHJvbXB0VHlwZTogXCJpbnN0cnVjdGlvblwiLFxuICAgICAgfTtcbiAgICAgIHVpTWFuYWdlci5kaXNwbGF5UHJvbXB0KHsgcGxhY2VTaGlwUHJvbXB0LCBwbGFjZVNoaXBHdWlkZSB9KTtcblxuICAgICAgY29uc3QgaGFuZGxlVmFsaWRJbnB1dCA9IGFzeW5jIChpbnB1dCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHsgZ3JpZFBvc2l0aW9uLCBvcmllbnRhdGlvbiB9ID0gcHJvY2Vzc0NvbW1hbmQoaW5wdXQsIGZhbHNlKTtcbiAgICAgICAgICBhd2FpdCBodW1hblBsYXllckdhbWVib2FyZC5wbGFjZVNoaXAoXG4gICAgICAgICAgICBzaGlwVHlwZSxcbiAgICAgICAgICAgIGdyaWRQb3NpdGlvbixcbiAgICAgICAgICAgIG9yaWVudGF0aW9uLFxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc29sZUxvZ1BsYWNlbWVudENvbW1hbmQoc2hpcFR5cGUsIGdyaWRQb3NpdGlvbiwgb3JpZW50YXRpb24pO1xuICAgICAgICAgIC8vIFJlbW92ZSBjZWxsIGhpZ2hsaWdodHNcbiAgICAgICAgICBjb25zdCBjZWxsc1RvQ2xlYXIgPSBjYWxjdWxhdGVTaGlwQ2VsbHMoXG4gICAgICAgICAgICBncmlkUG9zaXRpb24sXG4gICAgICAgICAgICBjdXJyZW50U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgICAgICAgb3JpZW50YXRpb24sXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjbGVhckhpZ2hsaWdodChjZWxsc1RvQ2xlYXIpO1xuXG4gICAgICAgICAgLy8gRGlzcGxheSB0aGUgc2hpcCBvbiB0aGUgZ2FtZSBib2FyZCBhbmQgc2hpcCBzdGF0dXMgZGlzcGxheVxuICAgICAgICAgIHVpTWFuYWdlci5yZW5kZXJTaGlwQm9hcmQoaHVtYW5QbGF5ZXIsIHNoaXBUeXBlKTtcbiAgICAgICAgICB1aU1hbmFnZXIucmVuZGVyU2hpcERpc3AoaHVtYW5QbGF5ZXIsIHNoaXBUeXBlKTtcblxuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11c2UtYmVmb3JlLWRlZmluZVxuICAgICAgICAgIHJlc29sdmVTaGlwUGxhY2VtZW50KCk7IC8vIFNoaXAgcGxhY2VkIHN1Y2Nlc3NmdWxseSwgcmVzb2x2ZSB0aGUgcHJvbWlzZVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGVMb2dFcnJvcihlcnJvciwgc2hpcFR5cGUpO1xuICAgICAgICAgIC8vIERvIG5vdCByZWplY3QgdG8gYWxsb3cgZm9yIHJldHJ5LCBqdXN0IGxvZyB0aGUgZXJyb3JcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gU2V0dXAgZXZlbnQgbGlzdGVuZXJzIGFuZCBlbnN1cmUgd2UgY2FuIGNsZWFuIHRoZW0gdXAgYWZ0ZXIgcGxhY2VtZW50XG4gICAgICBjb25zdCBjbGVhbnVwID0gc2V0dXBFdmVudExpc3RlbmVycyhoYW5kbGVWYWxpZElucHV0LCBcImh1bWFuXCIpO1xuXG4gICAgICAvLyBBdHRhY2ggY2xlYW51cCB0byByZXNvbHZlIHRvIGVuc3VyZSBpdCdzIGNhbGxlZCB3aGVuIHRoZSBwcm9taXNlIHJlc29sdmVzXG4gICAgICBjb25zdCByZXNvbHZlU2hpcFBsYWNlbWVudCA9ICgpID0+IHtcbiAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgLy8gU2VxdWVudGlhbGx5IHByb21wdCBmb3IgYW5kIHBsYWNlIGVhY2ggc2hpcFxuICBhc3luYyBmdW5jdGlvbiBzZXR1cFNoaXBzU2VxdWVudGlhbGx5KCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcHNUb1BsYWNlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgYXdhaXQgcHJvbXB0QW5kUGxhY2VTaGlwKHNoaXBzVG9QbGFjZVtpXS5zaGlwVHlwZSk7IC8vIFdhaXQgZm9yIGVhY2ggc2hpcCB0byBiZSBwbGFjZWQgYmVmb3JlIGNvbnRpbnVpbmdcbiAgICB9XG4gIH1cblxuICAvLyBGdW5jdGlvbiBmb3IgaGFuZGxpbmcgdGhlIGdhbWUgc2V0dXAgYW5kIHNoaXAgcGxhY2VtZW50XG4gIGNvbnN0IGhhbmRsZVNldHVwID0gYXN5bmMgKCkgPT4ge1xuICAgIC8vIEluaXQgdGhlIFVJXG4gICAgaW5pdFVpTWFuYWdlcih1aU1hbmFnZXIpO1xuICAgIHNldHVwR2FtZWJvYXJkRm9yUGxhY2VtZW50KCk7XG4gICAgYXdhaXQgc2V0dXBTaGlwc1NlcXVlbnRpYWxseSgpO1xuICAgIC8vIFByb2NlZWQgd2l0aCB0aGUgcmVzdCBvZiB0aGUgZ2FtZSBzZXR1cCBhZnRlciBhbGwgc2hpcHMgYXJlIHBsYWNlZFxuICAgIGNsZWFudXBBZnRlclBsYWNlbWVudCgpO1xuXG4gICAgLy8gU3RhcnQgdGhlIGdhbWVcbiAgICBhd2FpdCBzdGFydEdhbWUodWlNYW5hZ2VyLCBnYW1lKTtcblxuICAgIGNvbnN0IG91dHB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1vdXRwdXRcIik7XG4gICAgdXBkYXRlT3V0cHV0KFwiPiBBbGwgc2hpcHMgcGxhY2VkLCBnYW1lIHNldHVwIGNvbXBsZXRlIVwiKTtcbiAgICBzd2l0Y2hHYW1lYm9hcmRIb3ZlclN0YXRlcygpO1xuICB9O1xuXG4gIGNvbnN0IHVwZGF0ZURpc3BsYXlzID0gKG1vdmVSZXN1bHQpID0+IHtcbiAgICAvLyBTZXQgdGhlIHBsYXllciBzZWxlY3RvciBvZiB0aGUgb3Bwb25lbnQgZGVwZW5kaW5nIG9uIHRoZSBwbGF5ZXJcbiAgICAvLyB3aG8gbWFkZSB0aGUgbW92ZVxuICAgIGNvbnN0IHBsYXllclNlbGVjdG9yID0gbW92ZVJlc3VsdC5wbGF5ZXIgPT09IFwiaHVtYW5cIiA/IFwiY29tcHV0ZXJcIiA6IFwiaHVtYW5cIjtcbiAgICAvLyBHZXQgdGhlIERPTSBlbGVtZW50IGZvciB0aGUgY2VsbFxuICAgIGNvbnN0IGNlbGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgYC5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj0ke3BsYXllclNlbGVjdG9yfV1bZGF0YS1wb3NpdGlvbj0ke21vdmVSZXN1bHQubW92ZX1dYCxcbiAgICApO1xuXG4gICAgLy8gRGlzYWJsZSB0aGUgY2VsbCBmcm9tIGZ1dHVyZSBjbGlja3NcbiAgICBkaXNhYmxlQ29tcHV0ZXJHYW1lYm9hcmRIb3ZlcihbY2VsbF0pO1xuXG4gICAgLy8gSGFuZGxlIG1pc3MgYW5kIGhpdFxuICAgIGlmICghbW92ZVJlc3VsdC5oaXQpIHtcbiAgICAgIC8vIFVwZGF0ZSB0aGUgY2VsbHMgc3R5bGluZyB0byByZWZsZWN0IG1pc3NcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChtaXNzQmdDbHIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBVcGRhdGUgdGhlIHNoaXAgc2VjdGlvbiBpbiB0aGUgc2hpcCBzdGF0dXMgZGlzcGxheVxuICAgICAgdWlNYW5hZ2VyLnVwZGF0ZVNoaXBTZWN0aW9uKFxuICAgICAgICBtb3ZlUmVzdWx0Lm1vdmUsXG4gICAgICAgIG1vdmVSZXN1bHQuc2hpcFR5cGUsXG4gICAgICAgIHBsYXllclNlbGVjdG9yLFxuICAgICAgKTtcbiAgICB9XG4gIH07XG5cbiAgYXN5bmMgZnVuY3Rpb24gcHJvbXB0UGxheWVyTW92ZSgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbGV0IGh1bWFuTW92ZVJlc3VsdDtcblxuICAgICAgY29uc3QgaGFuZGxlVmFsaWRNb3ZlID0gYXN5bmMgKG1vdmUpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB7IGdyaWRQb3NpdGlvbiB9ID0gcHJvY2Vzc0NvbW1hbmQobW92ZSwgdHJ1ZSk7XG4gICAgICAgICAgaHVtYW5Nb3ZlUmVzdWx0ID0gYXdhaXQgaHVtYW5QbGF5ZXIubWFrZU1vdmUoXG4gICAgICAgICAgICBjb21wUGxheWVyR2FtZWJvYXJkLFxuICAgICAgICAgICAgZ3JpZFBvc2l0aW9uLFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICAvLyBVcGRhdGUgdGhlIGNvbXB1dGVyIHBsYXllcidzIHNoaXBzIGRpc3BsYXkgYW5kIGdhbWVib2FyZFxuICAgICAgICAgIC8vIGRlcGVuZGluZyBvbiBvdXRjb21lIG9mIG1vdmVcbiAgICAgICAgICB1cGRhdGVEaXNwbGF5cyhodW1hbk1vdmVSZXN1bHQpO1xuXG4gICAgICAgICAgLy8gQ29tbXVuaWNhdGUgdGhlIHJlc3VsdCBvZiB0aGUgbW92ZSB0byB0aGUgdXNlclxuICAgICAgICAgIGNvbnNvbGVMb2dNb3ZlQ29tbWFuZChodW1hbk1vdmVSZXN1bHQpO1xuXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZS1iZWZvcmUtZGVmaW5lXG4gICAgICAgICAgcmVzb2x2ZU1vdmUoKTsgLy8gTW92ZSBleGVjdXRlZCBzdWNjZXNzZnVsbHksIHJlc29sdmUgdGhlIHByb21pc2VcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlTG9nRXJyb3IoZXJyb3IpO1xuICAgICAgICAgIC8vIERvIG5vdCByZWplY3QgdG8gYWxsb3cgZm9yIHJldHJ5LCBqdXN0IGxvZyB0aGUgZXJyb3JcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gU2V0dXAgZXZlbnQgbGlzdGVuZXJzIGFuZCBlbnN1cmUgd2UgY2FuIGNsZWFuIHRoZW0gdXAgYWZ0ZXIgcGxhY2VtZW50XG4gICAgICBjb25zdCBjbGVhbnVwID0gc2V0dXBFdmVudExpc3RlbmVycyhoYW5kbGVWYWxpZE1vdmUsIFwiY29tcHV0ZXJcIik7XG5cbiAgICAgIC8vIEF0dGFjaCBjbGVhbnVwIHRvIHJlc29sdmUgdG8gZW5zdXJlIGl0J3MgY2FsbGVkIHdoZW4gdGhlIHByb21pc2UgcmVzb2x2ZXNcbiAgICAgIGNvbnN0IHJlc29sdmVNb3ZlID0gKCkgPT4ge1xuICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgIHJlc29sdmUoaHVtYW5Nb3ZlUmVzdWx0KTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBjb21wdXRlck1vdmUoKSB7XG4gICAgbGV0IGNvbXBNb3ZlUmVzdWx0O1xuICAgIHRyeSB7XG4gICAgICAvLyBDb21wdXRlciBsb2dpYyB0byBjaG9vc2UgYSBtb3ZlXG4gICAgICAvLyBVcGRhdGUgVUkgYmFzZWQgb24gbW92ZVxuICAgICAgY29tcE1vdmVSZXN1bHQgPSBjb21wUGxheWVyLm1ha2VNb3ZlKGh1bWFuUGxheWVyR2FtZWJvYXJkKTtcblxuICAgICAgLy8gVXBkYXRlIHRoZSBodW1hbiBwbGF5ZXIncyBzaGlwcyBkaXNwbGF5IGFuZCBnYW1lYm9hcmRcbiAgICAgIC8vIGRlcGVuZGluZyBvbiBvdXRjb21lIG9mIG1vdmVcbiAgICAgIHVwZGF0ZURpc3BsYXlzKGNvbXBNb3ZlUmVzdWx0KTtcblxuICAgICAgLy8gTG9nIHRoZSByZXN1bHQgb2YgdGhlIGNvbXB1dGVyJ3MgbW92ZSB0byB0aGUgY29uc29sZVxuICAgICAgY29uc29sZUxvZ01vdmVDb21tYW5kKGNvbXBNb3ZlUmVzdWx0KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZUxvZ0Vycm9yKGVycm9yKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBNb3ZlUmVzdWx0O1xuICB9XG5cbiAgY29uc3QgY2hlY2tTaGlwSXNTdW5rID0gKGdhbWVib2FyZCwgc2hpcFR5cGUpID0+XG4gICAgZ2FtZWJvYXJkLmlzU2hpcFN1bmsoc2hpcFR5cGUpO1xuXG4gIGNvbnN0IGNoZWNrV2luQ29uZGl0aW9uID0gKGdhbWVib2FyZCkgPT4gZ2FtZWJvYXJkLmNoZWNrQWxsU2hpcHNTdW5rKCk7XG5cbiAgY29uc3QgcmVzdGFydEdhbWUgPSAoKSA9PiB7XG4gICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGNvbmNsdWRlR2FtZSh3aW5uZXIpIHtcbiAgICAvLyBEaXNwbGF5IHdpbm5lciwgdXBkYXRlIFVJLCBldGMuXG4gICAgY29uc3QgbWVzc2FnZSA9IGBHYW1lIE92ZXIhIFRoZSAke3dpbm5lcn0gcGxheWVyIHdpbnMhYDtcbiAgICB1cGRhdGVPdXRwdXQoYD4gJHttZXNzYWdlfWAsIHdpbm5lciA9PT0gXCJodW1hblwiID8gXCJ2YWxpZFwiIDogXCJlcnJvclwiKTtcblxuICAgIC8vIFJlc3RhcnQgdGhlIGdhbWVcbiAgICB1aU1hbmFnZXIucHJvbXB0RW5kR2FtZSh3aW5uZXIpO1xuXG4gICAgLy8gQXR0YWNoIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSBidXR0b25cbiAgICBjb25zdCByZXN0YXJ0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN0YXJ0LWJ1dHRvblwiKTtcbiAgICByZXN0YXJ0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCByZXN0YXJ0R2FtZSk7XG4gIH1cblxuICAvLyBGdW5jdGlvbiBmb3IgaGFuZGxpbmcgdGhlIHBsYXlpbmcgb2YgdGhlIGdhbWVcbiAgY29uc3QgcGxheUdhbWUgPSBhc3luYyAoKSA9PiB7XG4gICAgbGV0IGdhbWVPdmVyID0gZmFsc2U7XG4gICAgbGV0IGxhc3RDb21wTW92ZVJlc3VsdDtcbiAgICBsZXQgbGFzdEh1bWFuTW92ZVJlc3VsdDtcbiAgICBsZXQgd2lubmVyO1xuXG4gICAgd2hpbGUgKCFnYW1lT3Zlcikge1xuICAgICAgLy8gUGxheWVyIG1ha2VzIGEgbW92ZVxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWF3YWl0LWluLWxvb3BcbiAgICAgIGxhc3RIdW1hbk1vdmVSZXN1bHQgPSBhd2FpdCBwcm9tcHRQbGF5ZXJNb3ZlKCk7XG5cbiAgICAgIC8vIENoZWNrIGZvciBoaXRcbiAgICAgIGlmIChsYXN0SHVtYW5Nb3ZlUmVzdWx0LmhpdCkge1xuICAgICAgICBjb25zdCB7IHNoaXBUeXBlIH0gPSBsYXN0SHVtYW5Nb3ZlUmVzdWx0O1xuICAgICAgICAvLyBDaGVjayBmb3Igc2hpcCBzaW5rXG4gICAgICAgIGNvbnN0IGlzU3VuayA9IGNoZWNrU2hpcElzU3Vuayhjb21wUGxheWVyR2FtZWJvYXJkLCBzaGlwVHlwZSk7XG4gICAgICAgIGlmIChpc1N1bmspIHtcbiAgICAgICAgICBjb25zb2xlTG9nU2hpcFNpbmsobGFzdEh1bWFuTW92ZVJlc3VsdCk7XG4gICAgICAgICAgdWlNYW5hZ2VyLnJlbmRlclN1bmtlblNoaXAoY29tcFBsYXllciwgc2hpcFR5cGUpO1xuXG4gICAgICAgICAgLy8gQ2hlY2sgZm9yIHdpbiBjb25kaXRpb25cbiAgICAgICAgICBnYW1lT3ZlciA9IGNoZWNrV2luQ29uZGl0aW9uKGNvbXBQbGF5ZXJHYW1lYm9hcmQpO1xuICAgICAgICAgIGlmIChnYW1lT3Zlcikge1xuICAgICAgICAgICAgd2lubmVyID0gXCJodW1hblwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIENvbXB1dGVyIG1ha2VzIGEgbW92ZVxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWF3YWl0LWluLWxvb3BcbiAgICAgIGxhc3RDb21wTW92ZVJlc3VsdCA9IGF3YWl0IGNvbXB1dGVyTW92ZSgpO1xuXG4gICAgICAvLyBDaGVjayBmb3IgaGl0XG4gICAgICBpZiAobGFzdENvbXBNb3ZlUmVzdWx0LmhpdCkge1xuICAgICAgICBjb25zdCB7IHNoaXBUeXBlIH0gPSBsYXN0Q29tcE1vdmVSZXN1bHQ7XG4gICAgICAgIC8vIENoZWNrIGZvciBzaGlwIHNpbmtcbiAgICAgICAgY29uc3QgaXNTdW5rID0gY2hlY2tTaGlwSXNTdW5rKGh1bWFuUGxheWVyR2FtZWJvYXJkLCBzaGlwVHlwZSk7XG4gICAgICAgIGlmIChpc1N1bmspIHtcbiAgICAgICAgICBjb25zb2xlTG9nU2hpcFNpbmsobGFzdENvbXBNb3ZlUmVzdWx0KTtcbiAgICAgICAgICB1aU1hbmFnZXIucmVuZGVyU3Vua2VuU2hpcChodW1hblBsYXllciwgc2hpcFR5cGUpO1xuXG4gICAgICAgICAgLy8gQ2hlY2sgZm9yIHdpbiBjb25kaXRpb25cbiAgICAgICAgICBnYW1lT3ZlciA9IGNoZWNrV2luQ29uZGl0aW9uKGh1bWFuUGxheWVyR2FtZWJvYXJkKTtcbiAgICAgICAgICBpZiAoZ2FtZU92ZXIpIHtcbiAgICAgICAgICAgIHdpbm5lciA9IFwiY29tcHV0ZXJcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEdhbWUgb3ZlciBsb2dpY1xuICAgIGNvbmNsdWRlR2FtZSh3aW5uZXIpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgaGFuZGxlU2V0dXAsXG4gICAgcGxheUdhbWUsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBBY3Rpb25Db250cm9sbGVyO1xuIiwiLyogZXNsaW50LWRpc2FibGUgbWF4LWNsYXNzZXMtcGVyLWZpbGUgKi9cblxuY2xhc3MgT3ZlcmxhcHBpbmdTaGlwc0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJTaGlwcyBhcmUgb3ZlcmxhcHBpbmcuXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIk92ZXJsYXBwaW5nU2hpcHNFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIFNoaXBBbGxvY2F0aW9uUmVhY2hlZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihzaGlwVHlwZSkge1xuICAgIHN1cGVyKGBTaGlwIGFsbG9jYXRpb24gbGltaXQgcmVhY2hlZC4gU2hpcCB0eXBlID0gJHtzaGlwVHlwZX0uYCk7XG4gICAgdGhpcy5uYW1lID0gXCJTaGlwQWxsb2NhdGlvblJlYWNoZWRFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIFNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiU2hpcCB0eXBlIGFsbG9jYXRpb24gbGltaXQgcmVhY2hlZC5cIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiU2hpcFR5cGVBbGxvY2F0aW9uUmVhY2hlZEVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgSW52YWxpZFNoaXBMZW5ndGhFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBzaGlwIGxlbmd0aC5cIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiSW52YWxpZFNoaXBMZW5ndGhFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRTaGlwVHlwZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJJbnZhbGlkIHNoaXAgdHlwZS5cIikge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiSW52YWxpZFNoaXBUeXBlRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBJbnZhbGlkUGxheWVyVHlwZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlID0gXCJJbnZhbGlkIHBsYXllciB0eXBlLiBWYWxpZCBwbGF5ZXIgdHlwZXM6ICdodW1hbicgJiAnY29tcHV0ZXInXCIsXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiSW52YWxpZFNoaXBUeXBlRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBzaGlwIHBsYWNlbWVudC4gQm91bmRhcnkgZXJyb3IhXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIlNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgUmVwZWF0QXR0YWNrZWRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBhdHRhY2sgZW50cnkuIFBvc2l0aW9uIGFscmVhZHkgYXR0YWNrZWQhXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIlJlcGVhdEF0dGFja0Vycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgSW52YWxpZE1vdmVFbnRyeUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gXCJJbnZhbGlkIG1vdmUgZW50cnkhXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRNb3ZlRW50cnlFcnJvclwiO1xuICB9XG59XG5cbmV4cG9ydCB7XG4gIE92ZXJsYXBwaW5nU2hpcHNFcnJvcixcbiAgU2hpcEFsbG9jYXRpb25SZWFjaGVkRXJyb3IsXG4gIFNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvcixcbiAgSW52YWxpZFNoaXBMZW5ndGhFcnJvcixcbiAgSW52YWxpZFNoaXBUeXBlRXJyb3IsXG4gIEludmFsaWRQbGF5ZXJUeXBlRXJyb3IsXG4gIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yLFxuICBSZXBlYXRBdHRhY2tlZEVycm9yLFxuICBJbnZhbGlkTW92ZUVudHJ5RXJyb3IsXG59O1xuIiwiaW1wb3J0IFBsYXllciBmcm9tIFwiLi9wbGF5ZXJcIjtcbmltcG9ydCBHYW1lYm9hcmQgZnJvbSBcIi4vZ2FtZWJvYXJkXCI7XG5pbXBvcnQgU2hpcCBmcm9tIFwiLi9zaGlwXCI7XG5pbXBvcnQgeyBJbnZhbGlkUGxheWVyVHlwZUVycm9yIH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5cbmNvbnN0IEdhbWUgPSAoKSA9PiB7XG4gIC8vIEluaXRpYWxpc2UsIGNyZWF0ZSBnYW1lYm9hcmRzIGZvciBib3RoIHBsYXllcnMgYW5kIGNyZWF0ZSBwbGF5ZXJzIG9mIHR5cGVzIGh1bWFuIGFuZCBjb21wdXRlclxuICBjb25zdCBodW1hbkdhbWVib2FyZCA9IEdhbWVib2FyZChTaGlwKTtcbiAgY29uc3QgY29tcHV0ZXJHYW1lYm9hcmQgPSBHYW1lYm9hcmQoU2hpcCk7XG4gIGNvbnN0IGh1bWFuUGxheWVyID0gUGxheWVyKGh1bWFuR2FtZWJvYXJkLCBcImh1bWFuXCIpO1xuICBjb25zdCBjb21wdXRlclBsYXllciA9IFBsYXllcihjb21wdXRlckdhbWVib2FyZCwgXCJjb21wdXRlclwiKTtcbiAgbGV0IGN1cnJlbnRQbGF5ZXI7XG4gIGxldCBnYW1lT3ZlclN0YXRlID0gZmFsc2U7XG5cbiAgLy8gU3RvcmUgcGxheWVycyBpbiBhIHBsYXllciBvYmplY3RcbiAgY29uc3QgcGxheWVycyA9IHsgaHVtYW46IGh1bWFuUGxheWVyLCBjb21wdXRlcjogY29tcHV0ZXJQbGF5ZXIgfTtcblxuICAvLyBTZXQgdXAgcGhhc2VcbiAgY29uc3Qgc2V0VXAgPSAoKSA9PiB7XG4gICAgLy8gQXV0b21hdGljIHBsYWNlbWVudCBmb3IgY29tcHV0ZXJcbiAgICBjb21wdXRlclBsYXllci5wbGFjZVNoaXBzKCk7XG5cbiAgICAvLyBTZXQgdGhlIGN1cnJlbnQgcGxheWVyIHRvIGh1bWFuIHBsYXllclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBodW1hblBsYXllcjtcbiAgfTtcblxuICAvLyBHYW1lIGVuZGluZyBmdW5jdGlvblxuICBjb25zdCBlbmRHYW1lID0gKCkgPT4ge1xuICAgIGdhbWVPdmVyU3RhdGUgPSB0cnVlO1xuICB9O1xuXG4gIC8vIFRha2UgdHVybiBtZXRob2RcbiAgY29uc3QgdGFrZVR1cm4gPSAobW92ZSkgPT4ge1xuICAgIGxldCBmZWVkYmFjaztcblxuICAgIC8vIERldGVybWluZSB0aGUgb3Bwb25lbnQgYmFzZWQgb24gdGhlIGN1cnJlbnQgcGxheWVyXG4gICAgY29uc3Qgb3Bwb25lbnQgPVxuICAgICAgY3VycmVudFBsYXllciA9PT0gaHVtYW5QbGF5ZXIgPyBjb21wdXRlclBsYXllciA6IGh1bWFuUGxheWVyO1xuXG4gICAgLy8gQ2FsbCB0aGUgbWFrZU1vdmUgbWV0aG9kIG9uIHRoZSBjdXJyZW50IHBsYXllciB3aXRoIHRoZSBvcHBvbmVudCdzIGdhbWVib2FyZCBhbmQgc3RvcmUgYXMgbW92ZSBmZWVkYmFja1xuICAgIGNvbnN0IHJlc3VsdCA9IGN1cnJlbnRQbGF5ZXIubWFrZU1vdmUob3Bwb25lbnQuZ2FtZWJvYXJkLCBtb3ZlKTtcblxuICAgIC8vIElmIHJlc3VsdCBpcyBhIGhpdCwgY2hlY2sgd2hldGhlciB0aGUgc2hpcCBpcyBzdW5rXG4gICAgaWYgKHJlc3VsdC5oaXQpIHtcbiAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIHNoaXAgaXMgc3VuayBhbmQgYWRkIHJlc3VsdCBhcyB2YWx1ZSB0byBmZWVkYmFjayBvYmplY3Qgd2l0aCBrZXkgXCJpc1NoaXBTdW5rXCJcbiAgICAgIGlmIChvcHBvbmVudC5nYW1lYm9hcmQuaXNTaGlwU3VuayhyZXN1bHQuc2hpcFR5cGUpKSB7XG4gICAgICAgIGZlZWRiYWNrID0ge1xuICAgICAgICAgIC4uLnJlc3VsdCxcbiAgICAgICAgICBpc1NoaXBTdW5rOiB0cnVlLFxuICAgICAgICAgIGdhbWVXb246IG9wcG9uZW50LmdhbWVib2FyZC5jaGVja0FsbFNoaXBzU3VuaygpLFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmVlZGJhY2sgPSB7IC4uLnJlc3VsdCwgaXNTaGlwU3VuazogZmFsc2UgfTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFyZXN1bHQuaGl0KSB7XG4gICAgICAvLyBTZXQgZmVlZGJhY2sgdG8ganVzdCB0aGUgcmVzdWx0XG4gICAgICBmZWVkYmFjayA9IHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBJZiBnYW1lIGlzIHdvbiwgZW5kIGdhbWVcbiAgICBpZiAoZmVlZGJhY2suZ2FtZVdvbikge1xuICAgICAgZW5kR2FtZSgpO1xuICAgIH1cblxuICAgIC8vIFN3aXRjaCB0aGUgY3VycmVudCBwbGF5ZXJcbiAgICBjdXJyZW50UGxheWVyID0gb3Bwb25lbnQ7XG5cbiAgICAvLyBSZXR1cm4gdGhlIGZlZWRiYWNrIGZvciB0aGUgbW92ZVxuICAgIHJldHVybiBmZWVkYmFjaztcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldCBjdXJyZW50UGxheWVyKCkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRQbGF5ZXI7XG4gICAgfSxcbiAgICBnZXQgZ2FtZU92ZXJTdGF0ZSgpIHtcbiAgICAgIHJldHVybiBnYW1lT3ZlclN0YXRlO1xuICAgIH0sXG4gICAgcGxheWVycyxcbiAgICBzZXRVcCxcbiAgICB0YWtlVHVybixcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWU7XG4iLCJpbXBvcnQge1xuICBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IsXG4gIE92ZXJsYXBwaW5nU2hpcHNFcnJvcixcbiAgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IsXG4gIFJlcGVhdEF0dGFja2VkRXJyb3IsXG59IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBncmlkID0gW1xuICBbXCJBMVwiLCBcIkEyXCIsIFwiQTNcIiwgXCJBNFwiLCBcIkE1XCIsIFwiQTZcIiwgXCJBN1wiLCBcIkE4XCIsIFwiQTlcIiwgXCJBMTBcIl0sXG4gIFtcIkIxXCIsIFwiQjJcIiwgXCJCM1wiLCBcIkI0XCIsIFwiQjVcIiwgXCJCNlwiLCBcIkI3XCIsIFwiQjhcIiwgXCJCOVwiLCBcIkIxMFwiXSxcbiAgW1wiQzFcIiwgXCJDMlwiLCBcIkMzXCIsIFwiQzRcIiwgXCJDNVwiLCBcIkM2XCIsIFwiQzdcIiwgXCJDOFwiLCBcIkM5XCIsIFwiQzEwXCJdLFxuICBbXCJEMVwiLCBcIkQyXCIsIFwiRDNcIiwgXCJENFwiLCBcIkQ1XCIsIFwiRDZcIiwgXCJEN1wiLCBcIkQ4XCIsIFwiRDlcIiwgXCJEMTBcIl0sXG4gIFtcIkUxXCIsIFwiRTJcIiwgXCJFM1wiLCBcIkU0XCIsIFwiRTVcIiwgXCJFNlwiLCBcIkU3XCIsIFwiRThcIiwgXCJFOVwiLCBcIkUxMFwiXSxcbiAgW1wiRjFcIiwgXCJGMlwiLCBcIkYzXCIsIFwiRjRcIiwgXCJGNVwiLCBcIkY2XCIsIFwiRjdcIiwgXCJGOFwiLCBcIkY5XCIsIFwiRjEwXCJdLFxuICBbXCJHMVwiLCBcIkcyXCIsIFwiRzNcIiwgXCJHNFwiLCBcIkc1XCIsIFwiRzZcIiwgXCJHN1wiLCBcIkc4XCIsIFwiRzlcIiwgXCJHMTBcIl0sXG4gIFtcIkgxXCIsIFwiSDJcIiwgXCJIM1wiLCBcIkg0XCIsIFwiSDVcIiwgXCJINlwiLCBcIkg3XCIsIFwiSDhcIiwgXCJIOVwiLCBcIkgxMFwiXSxcbiAgW1wiSTFcIiwgXCJJMlwiLCBcIkkzXCIsIFwiSTRcIiwgXCJJNVwiLCBcIkk2XCIsIFwiSTdcIiwgXCJJOFwiLCBcIkk5XCIsIFwiSTEwXCJdLFxuICBbXCJKMVwiLCBcIkoyXCIsIFwiSjNcIiwgXCJKNFwiLCBcIko1XCIsIFwiSjZcIiwgXCJKN1wiLCBcIko4XCIsIFwiSjlcIiwgXCJKMTBcIl0sXG5dO1xuXG5jb25zdCBpbmRleENhbGNzID0gKHN0YXJ0KSA9PiB7XG4gIGNvbnN0IGNvbExldHRlciA9IHN0YXJ0WzBdLnRvVXBwZXJDYXNlKCk7IC8vIFRoaXMgaXMgdGhlIGNvbHVtblxuICBjb25zdCByb3dOdW1iZXIgPSBwYXJzZUludChzdGFydC5zbGljZSgxKSwgMTApOyAvLyBUaGlzIGlzIHRoZSByb3dcblxuICBjb25zdCBjb2xJbmRleCA9IGNvbExldHRlci5jaGFyQ29kZUF0KDApIC0gXCJBXCIuY2hhckNvZGVBdCgwKTsgLy8gQ29sdW1uIGluZGV4IGJhc2VkIG9uIGxldHRlclxuICBjb25zdCByb3dJbmRleCA9IHJvd051bWJlciAtIDE7IC8vIFJvdyBpbmRleCBiYXNlZCBvbiBudW1iZXJcblxuICByZXR1cm4gW2NvbEluZGV4LCByb3dJbmRleF07IC8vIFJldHVybiBbcm93LCBjb2x1bW5dXG59O1xuXG5jb25zdCBjaGVja1R5cGUgPSAoc2hpcCwgc2hpcFBvc2l0aW9ucykgPT4ge1xuICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIHNoaXBQb3NpdGlvbnMgb2JqZWN0XG4gIE9iamVjdC5rZXlzKHNoaXBQb3NpdGlvbnMpLmZvckVhY2goKGV4aXN0aW5nU2hpcFR5cGUpID0+IHtcbiAgICBpZiAoZXhpc3RpbmdTaGlwVHlwZSA9PT0gc2hpcCkge1xuICAgICAgdGhyb3cgbmV3IFNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvcihzaGlwKTtcbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgY2hlY2tCb3VuZGFyaWVzID0gKHNoaXBMZW5ndGgsIGNvb3JkcywgZGlyZWN0aW9uKSA9PiB7XG4gIC8vIFNldCByb3cgYW5kIGNvbCBsaW1pdHNcbiAgY29uc3QgeExpbWl0ID0gZ3JpZC5sZW5ndGg7IC8vIFRoaXMgaXMgdGhlIHRvdGFsIG51bWJlciBvZiBjb2x1bW5zICh4KVxuICBjb25zdCB5TGltaXQgPSBncmlkWzBdLmxlbmd0aDsgLy8gVGhpcyBpcyB0aGUgdG90YWwgbnVtYmVyIG9mIHJvd3MgKHkpXG5cbiAgY29uc3QgeCA9IGNvb3Jkc1swXTtcbiAgY29uc3QgeSA9IGNvb3Jkc1sxXTtcblxuICAvLyBDaGVjayBmb3IgdmFsaWQgc3RhcnQgcG9zaXRpb24gb24gYm9hcmRcbiAgaWYgKHggPCAwIHx8IHggPj0geExpbWl0IHx8IHkgPCAwIHx8IHkgPj0geUxpbWl0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gQ2hlY2sgcmlnaHQgYm91bmRhcnkgZm9yIGhvcml6b250YWwgcGxhY2VtZW50XG4gIGlmIChkaXJlY3Rpb24gPT09IFwiaFwiICYmIHggKyBzaGlwTGVuZ3RoID4geExpbWl0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIENoZWNrIGJvdHRvbSBib3VuZGFyeSBmb3IgdmVydGljYWwgcGxhY2VtZW50XG4gIGlmIChkaXJlY3Rpb24gPT09IFwidlwiICYmIHkgKyBzaGlwTGVuZ3RoID4geUxpbWl0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gSWYgbm9uZSBvZiB0aGUgaW52YWxpZCBjb25kaXRpb25zIGFyZSBtZXQsIHJldHVybiB0cnVlXG4gIHJldHVybiB0cnVlO1xufTtcblxuY29uc3QgY2FsY3VsYXRlU2hpcFBvc2l0aW9ucyA9IChzaGlwTGVuZ3RoLCBjb29yZHMsIGRpcmVjdGlvbikgPT4ge1xuICBjb25zdCBjb2xJbmRleCA9IGNvb3Jkc1swXTsgLy8gVGhpcyBpcyB0aGUgY29sdW1uIGluZGV4XG4gIGNvbnN0IHJvd0luZGV4ID0gY29vcmRzWzFdOyAvLyBUaGlzIGlzIHRoZSByb3cgaW5kZXhcblxuICBjb25zdCBwb3NpdGlvbnMgPSBbXTtcblxuICBpZiAoZGlyZWN0aW9uLnRvTG93ZXJDYXNlKCkgPT09IFwiaFwiKSB7XG4gICAgLy8gSG9yaXpvbnRhbCBwbGFjZW1lbnQ6IGluY3JlbWVudCB0aGUgY29sdW1uIGluZGV4XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKGdyaWRbY29sSW5kZXggKyBpXVtyb3dJbmRleF0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBWZXJ0aWNhbCBwbGFjZW1lbnQ6IGluY3JlbWVudCB0aGUgcm93IGluZGV4XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKGdyaWRbY29sSW5kZXhdW3Jvd0luZGV4ICsgaV0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwb3NpdGlvbnM7XG59O1xuXG5jb25zdCBjaGVja0Zvck92ZXJsYXAgPSAocG9zaXRpb25zLCBzaGlwUG9zaXRpb25zKSA9PiB7XG4gIE9iamVjdC5lbnRyaWVzKHNoaXBQb3NpdGlvbnMpLmZvckVhY2goKFtzaGlwVHlwZSwgZXhpc3RpbmdTaGlwUG9zaXRpb25zXSkgPT4ge1xuICAgIGlmIChcbiAgICAgIHBvc2l0aW9ucy5zb21lKChwb3NpdGlvbikgPT4gZXhpc3RpbmdTaGlwUG9zaXRpb25zLmluY2x1ZGVzKHBvc2l0aW9uKSlcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBPdmVybGFwcGluZ1NoaXBzRXJyb3IoXG4gICAgICAgIGBPdmVybGFwIGRldGVjdGVkIHdpdGggc2hpcCB0eXBlICR7c2hpcFR5cGV9YCxcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IGNoZWNrRm9ySGl0ID0gKHBvc2l0aW9uLCBzaGlwUG9zaXRpb25zKSA9PiB7XG4gIGNvbnN0IGZvdW5kU2hpcCA9IE9iamVjdC5lbnRyaWVzKHNoaXBQb3NpdGlvbnMpLmZpbmQoXG4gICAgKFtfLCBleGlzdGluZ1NoaXBQb3NpdGlvbnNdKSA9PiBleGlzdGluZ1NoaXBQb3NpdGlvbnMuaW5jbHVkZXMocG9zaXRpb24pLFxuICApO1xuXG4gIHJldHVybiBmb3VuZFNoaXAgPyB7IGhpdDogdHJ1ZSwgc2hpcFR5cGU6IGZvdW5kU2hpcFswXSB9IDogeyBoaXQ6IGZhbHNlIH07XG59O1xuXG5jb25zdCBHYW1lYm9hcmQgPSAoc2hpcEZhY3RvcnkpID0+IHtcbiAgY29uc3Qgc2hpcHMgPSB7fTtcbiAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IHt9O1xuICBjb25zdCBoaXRQb3NpdGlvbnMgPSB7fTtcbiAgY29uc3QgYXR0YWNrTG9nID0gW1tdLCBbXV07XG5cbiAgY29uc3QgcGxhY2VTaGlwID0gKHR5cGUsIHN0YXJ0LCBkaXJlY3Rpb24pID0+IHtcbiAgICBjb25zdCBuZXdTaGlwID0gc2hpcEZhY3RvcnkodHlwZSk7XG5cbiAgICAvLyBDaGVjayB0aGUgc2hpcCB0eXBlIGFnYWluc3QgZXhpc3RpbmcgdHlwZXNcbiAgICBjaGVja1R5cGUodHlwZSwgc2hpcFBvc2l0aW9ucyk7XG5cbiAgICAvLyBDYWxjdWxhdGUgc3RhcnQgcG9pbnQgY29vcmRpbmF0ZXMgYmFzZWQgb24gc3RhcnQgcG9pbnQgZ3JpZCBrZXlcbiAgICBjb25zdCBjb29yZHMgPSBpbmRleENhbGNzKHN0YXJ0KTtcblxuICAgIC8vIENoZWNrIGJvdW5kYXJpZXMsIGlmIG9rIGNvbnRpbnVlIHRvIG5leHQgc3RlcFxuICAgIGlmIChjaGVja0JvdW5kYXJpZXMobmV3U2hpcC5zaGlwTGVuZ3RoLCBjb29yZHMsIGRpcmVjdGlvbikpIHtcbiAgICAgIC8vIENhbGN1bGF0ZSBhbmQgc3RvcmUgcG9zaXRpb25zIGZvciBhIG5ldyBzaGlwXG4gICAgICBjb25zdCBwb3NpdGlvbnMgPSBjYWxjdWxhdGVTaGlwUG9zaXRpb25zKFxuICAgICAgICBuZXdTaGlwLnNoaXBMZW5ndGgsXG4gICAgICAgIGNvb3JkcyxcbiAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgKTtcblxuICAgICAgLy8gQ2hlY2sgZm9yIG92ZXJsYXAgYmVmb3JlIHBsYWNpbmcgdGhlIHNoaXBcbiAgICAgIGNoZWNrRm9yT3ZlcmxhcChwb3NpdGlvbnMsIHNoaXBQb3NpdGlvbnMpO1xuXG4gICAgICAvLyBJZiBubyBvdmVybGFwLCBwcm9jZWVkIHRvIHBsYWNlIHNoaXBcbiAgICAgIHNoaXBQb3NpdGlvbnNbdHlwZV0gPSBwb3NpdGlvbnM7XG4gICAgICAvLyBBZGQgc2hpcCB0byBzaGlwcyBvYmplY3RcbiAgICAgIHNoaXBzW3R5cGVdID0gbmV3U2hpcDtcblxuICAgICAgLy8gSW5pdGlhbGlzZSBoaXRQb3NpdGlvbnMgZm9yIHRoaXMgc2hpcCB0eXBlIGFzIGFuIGVtcHR5IGFycmF5XG4gICAgICBoaXRQb3NpdGlvbnNbdHlwZV0gPSBbXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yKFxuICAgICAgICBgSW52YWxpZCBzaGlwIHBsYWNlbWVudC4gQm91bmRhcnkgZXJyb3IhIFNoaXAgdHlwZTogJHt0eXBlfWAsXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZWdpc3RlciBhbiBhdHRhY2sgYW5kIHRlc3QgZm9yIHZhbGlkIGhpdFxuICBjb25zdCBhdHRhY2sgPSAocG9zaXRpb24pID0+IHtcbiAgICBsZXQgcmVzcG9uc2U7XG5cbiAgICAvLyBDaGVjayBmb3IgdmFsaWQgYXR0YWNrXG4gICAgaWYgKGF0dGFja0xvZ1swXS5pbmNsdWRlcyhwb3NpdGlvbikgfHwgYXR0YWNrTG9nWzFdLmluY2x1ZGVzKHBvc2l0aW9uKSkge1xuICAgICAgLy8gY29uc29sZS5sb2coYFJlcGVhdCBhdHRhY2s6ICR7cG9zaXRpb259YCk7XG4gICAgICB0aHJvdyBuZXcgUmVwZWF0QXR0YWNrZWRFcnJvcigpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciB2YWxpZCBoaXRcbiAgICBjb25zdCBjaGVja1Jlc3VsdHMgPSBjaGVja0ZvckhpdChwb3NpdGlvbiwgc2hpcFBvc2l0aW9ucyk7XG4gICAgaWYgKGNoZWNrUmVzdWx0cy5oaXQpIHtcbiAgICAgIC8vIFJlZ2lzdGVyIHZhbGlkIGhpdFxuICAgICAgaGl0UG9zaXRpb25zW2NoZWNrUmVzdWx0cy5zaGlwVHlwZV0ucHVzaChwb3NpdGlvbik7XG4gICAgICBzaGlwc1tjaGVja1Jlc3VsdHMuc2hpcFR5cGVdLmhpdCgpO1xuXG4gICAgICAvLyBMb2cgdGhlIGF0dGFjayBhcyBhIHZhbGlkIGhpdFxuICAgICAgYXR0YWNrTG9nWzBdLnB1c2gocG9zaXRpb24pO1xuICAgICAgcmVzcG9uc2UgPSB7IC4uLmNoZWNrUmVzdWx0cyB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhgTUlTUyE6ICR7cG9zaXRpb259YCk7XG4gICAgICAvLyBMb2cgdGhlIGF0dGFjayBhcyBhIG1pc3NcbiAgICAgIGF0dGFja0xvZ1sxXS5wdXNoKHBvc2l0aW9uKTtcbiAgICAgIHJlc3BvbnNlID0geyAuLi5jaGVja1Jlc3VsdHMgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH07XG5cbiAgY29uc3QgaXNTaGlwU3VuayA9ICh0eXBlKSA9PiBzaGlwc1t0eXBlXS5pc1N1bms7XG5cbiAgY29uc3QgY2hlY2tBbGxTaGlwc1N1bmsgPSAoKSA9PlxuICAgIE9iamVjdC5lbnRyaWVzKHNoaXBzKS5ldmVyeSgoW3NoaXBUeXBlLCBzaGlwXSkgPT4gc2hpcC5pc1N1bmspO1xuXG4gIC8vIEZ1bmN0aW9uIGZvciByZXBvcnRpbmcgdGhlIG51bWJlciBvZiBzaGlwcyBsZWZ0IGFmbG9hdFxuICBjb25zdCBzaGlwUmVwb3J0ID0gKCkgPT4ge1xuICAgIGNvbnN0IGZsb2F0aW5nU2hpcHMgPSBPYmplY3QuZW50cmllcyhzaGlwcylcbiAgICAgIC5maWx0ZXIoKFtzaGlwVHlwZSwgc2hpcF0pID0+ICFzaGlwLmlzU3VuaylcbiAgICAgIC5tYXAoKFtzaGlwVHlwZSwgX10pID0+IHNoaXBUeXBlKTtcblxuICAgIHJldHVybiBbZmxvYXRpbmdTaGlwcy5sZW5ndGgsIGZsb2F0aW5nU2hpcHNdO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgZ2V0IGdyaWQoKSB7XG4gICAgICByZXR1cm4gZ3JpZDtcbiAgICB9LFxuICAgIGdldCBzaGlwcygpIHtcbiAgICAgIHJldHVybiBzaGlwcztcbiAgICB9LFxuICAgIGdldCBhdHRhY2tMb2coKSB7XG4gICAgICByZXR1cm4gYXR0YWNrTG9nO1xuICAgIH0sXG4gICAgZ2V0U2hpcDogKHNoaXBUeXBlKSA9PiBzaGlwc1tzaGlwVHlwZV0sXG4gICAgZ2V0U2hpcFBvc2l0aW9uczogKHNoaXBUeXBlKSA9PiBzaGlwUG9zaXRpb25zW3NoaXBUeXBlXSxcbiAgICBnZXRIaXRQb3NpdGlvbnM6IChzaGlwVHlwZSkgPT4gaGl0UG9zaXRpb25zW3NoaXBUeXBlXSxcbiAgICBwbGFjZVNoaXAsXG4gICAgYXR0YWNrLFxuICAgIGlzU2hpcFN1bmssXG4gICAgY2hlY2tBbGxTaGlwc1N1bmssXG4gICAgc2hpcFJlcG9ydCxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVib2FyZDtcbiIsImltcG9ydCBcIi4vc3R5bGVzLmNzc1wiO1xuaW1wb3J0IEdhbWUgZnJvbSBcIi4vZ2FtZVwiO1xuaW1wb3J0IFVpTWFuYWdlciBmcm9tIFwiLi91aU1hbmFnZXJcIjtcbmltcG9ydCBBY3Rpb25Db250cm9sbGVyIGZyb20gXCIuL2FjdGlvbkNvbnRyb2xsZXJcIjtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW4tY29udGFpbmVyXCIpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbn0pO1xuXG4vLyBDcmVhdGUgYSBuZXcgVUkgbWFuYWdlclxuY29uc3QgbmV3VWlNYW5hZ2VyID0gVWlNYW5hZ2VyKCk7XG5cbi8vIEluc3RhbnRpYXRlIGEgbmV3IGdhbWVcbmNvbnN0IG5ld0dhbWUgPSBHYW1lKCk7XG5cbi8vIENyZWF0ZSBhIG5ldyBhY3Rpb24gY29udHJvbGxlclxuY29uc3QgYWN0Q29udHJvbGxlciA9IEFjdGlvbkNvbnRyb2xsZXIobmV3VWlNYW5hZ2VyLCBuZXdHYW1lKTtcblxuLy8gV2FpdCBmb3IgdGhlIGdhbWUgdG8gYmUgc2V0dXAgd2l0aCBzaGlwIHBsYWNlbWVudHMgZXRjLlxuYXdhaXQgYWN0Q29udHJvbGxlci5oYW5kbGVTZXR1cCgpO1xuXG4vLyBPbmNlIHJlYWR5LCBjYWxsIHRoZSBwbGF5R2FtZSBtZXRob2RcbmF3YWl0IGFjdENvbnRyb2xsZXIucGxheUdhbWUoKTtcbiIsImltcG9ydCB7XG4gIEludmFsaWRQbGF5ZXJUeXBlRXJyb3IsXG4gIEludmFsaWRNb3ZlRW50cnlFcnJvcixcbiAgUmVwZWF0QXR0YWNrZWRFcnJvcixcbiAgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IsXG4gIE92ZXJsYXBwaW5nU2hpcHNFcnJvcixcbn0gZnJvbSBcIi4vZXJyb3JzXCI7XG5cbmNvbnN0IGNoZWNrTW92ZSA9IChtb3ZlLCBnYkdyaWQpID0+IHtcbiAgbGV0IHZhbGlkID0gZmFsc2U7XG5cbiAgZ2JHcmlkLmZvckVhY2goKGVsKSA9PiB7XG4gICAgaWYgKGVsLmZpbmQoKHApID0+IHAgPT09IG1vdmUpKSB7XG4gICAgICB2YWxpZCA9IHRydWU7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gdmFsaWQ7XG59O1xuXG5jb25zdCByYW5kTW92ZSA9IChncmlkLCBtb3ZlTG9nKSA9PiB7XG4gIC8vIEZsYXR0ZW4gdGhlIGdyaWQgaW50byBhIHNpbmdsZSBhcnJheSBvZiBtb3Zlc1xuICBjb25zdCBhbGxNb3ZlcyA9IGdyaWQuZmxhdE1hcCgocm93KSA9PiByb3cpO1xuXG4gIC8vIEZpbHRlciBvdXQgdGhlIG1vdmVzIHRoYXQgYXJlIGFscmVhZHkgaW4gdGhlIG1vdmVMb2dcbiAgY29uc3QgcG9zc2libGVNb3ZlcyA9IGFsbE1vdmVzLmZpbHRlcigobW92ZSkgPT4gIW1vdmVMb2cuaW5jbHVkZXMobW92ZSkpO1xuXG4gIC8vIFNlbGVjdCBhIHJhbmRvbSBtb3ZlIGZyb20gdGhlIHBvc3NpYmxlIG1vdmVzXG4gIGNvbnN0IHJhbmRvbU1vdmUgPVxuICAgIHBvc3NpYmxlTW92ZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcG9zc2libGVNb3Zlcy5sZW5ndGgpXTtcblxuICByZXR1cm4gcmFuZG9tTW92ZTtcbn07XG5cbmNvbnN0IGdlbmVyYXRlUmFuZG9tU3RhcnQgPSAoc2l6ZSwgZGlyZWN0aW9uLCBncmlkKSA9PiB7XG4gIGNvbnN0IHZhbGlkU3RhcnRzID0gW107XG5cbiAgaWYgKGRpcmVjdGlvbiA9PT0gXCJoXCIpIHtcbiAgICAvLyBGb3IgaG9yaXpvbnRhbCBvcmllbnRhdGlvbiwgbGltaXQgdGhlIGNvbHVtbnNcbiAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCBncmlkLmxlbmd0aCAtIHNpemUgKyAxOyBjb2wrKykge1xuICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgZ3JpZFtjb2xdLmxlbmd0aDsgcm93KyspIHtcbiAgICAgICAgdmFsaWRTdGFydHMucHVzaChncmlkW2NvbF1bcm93XSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEZvciB2ZXJ0aWNhbCBvcmllbnRhdGlvbiwgbGltaXQgdGhlIHJvd3NcbiAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBncmlkWzBdLmxlbmd0aCAtIHNpemUgKyAxOyByb3crKykge1xuICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgZ3JpZC5sZW5ndGg7IGNvbCsrKSB7XG4gICAgICAgIHZhbGlkU3RhcnRzLnB1c2goZ3JpZFtjb2xdW3Jvd10pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFJhbmRvbWx5IHNlbGVjdCBhIHN0YXJ0aW5nIHBvc2l0aW9uXG4gIGNvbnN0IHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdmFsaWRTdGFydHMubGVuZ3RoKTtcbiAgcmV0dXJuIHZhbGlkU3RhcnRzW3JhbmRvbUluZGV4XTtcbn07XG5cbmNvbnN0IGF1dG9QbGFjZW1lbnQgPSAoZ2FtZWJvYXJkKSA9PiB7XG4gIGNvbnN0IHNoaXBUeXBlcyA9IFtcbiAgICB7IHR5cGU6IFwiY2FycmllclwiLCBzaXplOiA1IH0sXG4gICAgeyB0eXBlOiBcImJhdHRsZXNoaXBcIiwgc2l6ZTogNCB9LFxuICAgIHsgdHlwZTogXCJjcnVpc2VyXCIsIHNpemU6IDMgfSxcbiAgICB7IHR5cGU6IFwic3VibWFyaW5lXCIsIHNpemU6IDMgfSxcbiAgICB7IHR5cGU6IFwiZGVzdHJveWVyXCIsIHNpemU6IDIgfSxcbiAgXTtcblxuICBzaGlwVHlwZXMuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgIGxldCBwbGFjZWQgPSBmYWxzZTtcbiAgICB3aGlsZSAoIXBsYWNlZCkge1xuICAgICAgY29uc3QgZGlyZWN0aW9uID0gTWF0aC5yYW5kb20oKSA8IDAuNSA/IFwiaFwiIDogXCJ2XCI7XG4gICAgICBjb25zdCBzdGFydCA9IGdlbmVyYXRlUmFuZG9tU3RhcnQoc2hpcC5zaXplLCBkaXJlY3Rpb24sIGdhbWVib2FyZC5ncmlkKTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZ2FtZWJvYXJkLnBsYWNlU2hpcChzaGlwLnR5cGUsIHN0YXJ0LCBkaXJlY3Rpb24pO1xuICAgICAgICBwbGFjZWQgPSB0cnVlO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICEoZXJyb3IgaW5zdGFuY2VvZiBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvcikgJiZcbiAgICAgICAgICAhKGVycm9yIGluc3RhbmNlb2YgT3ZlcmxhcHBpbmdTaGlwc0Vycm9yKVxuICAgICAgICApIHtcbiAgICAgICAgICB0aHJvdyBlcnJvcjsgLy8gUmV0aHJvdyBub24tcGxhY2VtZW50IGVycm9yc1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHBsYWNlbWVudCBmYWlscywgY2F0Y2ggdGhlIGVycm9yIGFuZCB0cnkgYWdhaW5cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgUGxheWVyID0gKGdhbWVib2FyZCwgdHlwZSkgPT4ge1xuICBjb25zdCBtb3ZlTG9nID0gW107XG5cbiAgY29uc3QgcGxhY2VTaGlwcyA9IChzaGlwVHlwZSwgc3RhcnQsIGRpcmVjdGlvbikgPT4ge1xuICAgIGlmICh0eXBlID09PSBcImh1bWFuXCIpIHtcbiAgICAgIGdhbWVib2FyZC5wbGFjZVNoaXAoc2hpcFR5cGUsIHN0YXJ0LCBkaXJlY3Rpb24pO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJjb21wdXRlclwiKSB7XG4gICAgICBhdXRvUGxhY2VtZW50KGdhbWVib2FyZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGxheWVyVHlwZUVycm9yKFxuICAgICAgICBgSW52YWxpZCBwbGF5ZXIgdHlwZS4gVmFsaWQgcGxheWVyIHR5cGVzOiBcImh1bWFuXCIgJiBcImNvbXB1dGVyXCIuIEVudGVyZWQ6ICR7dHlwZX0uYCxcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IG1ha2VNb3ZlID0gKG9wcEdhbWVib2FyZCwgaW5wdXQpID0+IHtcbiAgICBsZXQgbW92ZTtcblxuICAgIC8vIENoZWNrIGZvciB0aGUgdHlwZSBvZiBwbGF5ZXJcbiAgICBpZiAodHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICAvLyBGb3JtYXQgdGhlIGlucHV0XG4gICAgICBtb3ZlID0gYCR7aW5wdXQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCl9JHtpbnB1dC5zdWJzdHJpbmcoMSl9YDtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgbW92ZSA9IHJhbmRNb3ZlKG9wcEdhbWVib2FyZC5ncmlkLCBtb3ZlTG9nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQbGF5ZXJUeXBlRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIHBsYXllciB0eXBlLiBWYWxpZCBwbGF5ZXIgdHlwZXM6IFwiaHVtYW5cIiAmIFwiY29tcHV0ZXJcIi4gRW50ZXJlZDogJHt0eXBlfS5gLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayB0aGUgaW5wdXQgYWdhaW5zdCB0aGUgcG9zc2libGUgbW92ZXMgb24gdGhlIGdhbWVib2FyZCdzIGdyaWRcbiAgICBpZiAoIWNoZWNrTW92ZShtb3ZlLCBvcHBHYW1lYm9hcmQuZ3JpZCkpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkTW92ZUVudHJ5RXJyb3IoYEludmFsaWQgbW92ZSBlbnRyeSEgTW92ZTogJHttb3ZlfS5gKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgbW92ZSBleGlzdHMgaW4gdGhlIG1vdmVMb2cgYXJyYXksIHRocm93IGFuIGVycm9yXG4gICAgaWYgKG1vdmVMb2cuZmluZCgoZWwpID0+IGVsID09PSBtb3ZlKSkge1xuICAgICAgdGhyb3cgbmV3IFJlcGVhdEF0dGFja2VkRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBFbHNlLCBjYWxsIGF0dGFjayBtZXRob2Qgb24gZ2FtZWJvYXJkIGFuZCBsb2cgbW92ZSBpbiBtb3ZlTG9nXG4gICAgY29uc3QgcmVzcG9uc2UgPSBvcHBHYW1lYm9hcmQuYXR0YWNrKG1vdmUpO1xuICAgIG1vdmVMb2cucHVzaChtb3ZlKTtcbiAgICAvLyBSZXR1cm4gdGhlIHJlc3BvbnNlIG9mIHRoZSBhdHRhY2sgKG9iamVjdDogeyBoaXQ6IGZhbHNlIH0gZm9yIG1pc3M7IHsgaGl0OiB0cnVlLCBzaGlwVHlwZTogc3RyaW5nIH0gZm9yIGhpdCkuXG4gICAgcmV0dXJuIHsgcGxheWVyOiB0eXBlLCBtb3ZlLCAuLi5yZXNwb25zZSB9O1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgZ2V0IHR5cGUoKSB7XG4gICAgICByZXR1cm4gdHlwZTtcbiAgICB9LFxuICAgIGdldCBnYW1lYm9hcmQoKSB7XG4gICAgICByZXR1cm4gZ2FtZWJvYXJkO1xuICAgIH0sXG4gICAgZ2V0IG1vdmVMb2coKSB7XG4gICAgICByZXR1cm4gbW92ZUxvZztcbiAgICB9LFxuICAgIG1ha2VNb3ZlLFxuICAgIHBsYWNlU2hpcHMsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBQbGF5ZXI7XG4iLCJpbXBvcnQgeyBJbnZhbGlkU2hpcFR5cGVFcnJvciB9IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBTaGlwID0gKHR5cGUpID0+IHtcbiAgY29uc3Qgc2V0TGVuZ3RoID0gKCkgPT4ge1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSBcImNhcnJpZXJcIjpcbiAgICAgICAgcmV0dXJuIDU7XG4gICAgICBjYXNlIFwiYmF0dGxlc2hpcFwiOlxuICAgICAgICByZXR1cm4gNDtcbiAgICAgIGNhc2UgXCJjcnVpc2VyXCI6XG4gICAgICBjYXNlIFwic3VibWFyaW5lXCI6XG4gICAgICAgIHJldHVybiAzO1xuICAgICAgY2FzZSBcImRlc3Ryb3llclwiOlxuICAgICAgICByZXR1cm4gMjtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBJbnZhbGlkU2hpcFR5cGVFcnJvcigpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBzaGlwTGVuZ3RoID0gc2V0TGVuZ3RoKCk7XG5cbiAgbGV0IGhpdHMgPSAwO1xuXG4gIGNvbnN0IGhpdCA9ICgpID0+IHtcbiAgICBpZiAoaGl0cyA8IHNoaXBMZW5ndGgpIHtcbiAgICAgIGhpdHMgKz0gMTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBnZXQgdHlwZSgpIHtcbiAgICAgIHJldHVybiB0eXBlO1xuICAgIH0sXG4gICAgZ2V0IHNoaXBMZW5ndGgoKSB7XG4gICAgICByZXR1cm4gc2hpcExlbmd0aDtcbiAgICB9LFxuICAgIGdldCBoaXRzKCkge1xuICAgICAgcmV0dXJuIGhpdHM7XG4gICAgfSxcbiAgICBnZXQgaXNTdW5rKCkge1xuICAgICAgcmV0dXJuIGhpdHMgPT09IHNoaXBMZW5ndGg7XG4gICAgfSxcbiAgICBoaXQsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTaGlwO1xuIiwiY29uc3QgdHcgPSAoc3RyaW5ncywgLi4udmFsdWVzKSA9PiBTdHJpbmcucmF3KHsgcmF3OiBzdHJpbmdzIH0sIC4uLnZhbHVlcyk7XG5cbmNvbnN0IGluc3RydWN0aW9uQ2xyID0gXCJ0ZXh0LWxpbWUtNzAwXCI7XG5jb25zdCBndWlkZUNsciA9IFwidGV4dC1ncmF5LTcwMFwiO1xuY29uc3QgZXJyb3JDbHIgPSBcInRleHQtcmVkLTgwMFwiO1xuY29uc3QgZGVmYXVsdENsciA9IFwidGV4dC1ncmF5LTcwMFwiO1xuXG5jb25zdCBjZWxsQ2xyID0gXCJiZy1ncmF5LTIwMFwiO1xuY29uc3QgaW5wdXRDbHIgPSBcImJnLWdyYXktNjAwXCI7XG5jb25zdCBpbnB1dFRleHRDbHIgPSBcInRleHQtZ3JheS0yMDBcIjtcbmNvbnN0IGJ1dHRvbkNsciA9IFwiYmctZ3JheS04MDBcIjtcbmNvbnN0IGJ1dHRvblRleHRDbHIgPSBcInRleHQtZ3JheS0yMDBcIjtcblxuY29uc3Qgc2hpcFNlY3RDbHIgPSBcImJnLXNsYXRlLTgwMFwiO1xuY29uc3Qgc2hpcEhpdENsciA9IFwiYmctcmVkLTgwMFwiO1xuY29uc3Qgc2hpcFN1bmtDbHIgPSBcImJnLWdyYXktNDAwXCI7XG5jb25zdCBwcmltYXJ5SG92ZXJDbHIgPSBcImhvdmVyOmJnLW9yYW5nZS01MDBcIjtcblxuLy8gRnVuY3Rpb24gZm9yIGJ1aWxkIGEgc2hpcCBzZWN0aW9uXG5jb25zdCBidWlsZFNlY3Rpb24gPSAoZG9tU2VsLCB0eXBlLCBwb3MpID0+IHtcbiAgLy8gQ3JlYXRlIGFuIGVsZW1lbnQgZm9yIHRoZSBzZWN0aW9uXG4gIGNvbnN0IHNlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBzZWN0LmNsYXNzTmFtZSA9IHR3YHctNCBoLTQgcm91bmRlZC1mdWxsYDsgLy8gU2V0IHRoZSBkZWZhdWx0IHN0eWxpbmcgZm9yIHRoZSBzZWN0aW9uIGVsZW1lbnRcbiAgc2VjdC5jbGFzc0xpc3QuYWRkKHNoaXBTZWN0Q2xyKTtcbiAgLy8gU2V0IGEgdW5pcXVlIGlkIGZvciB0aGUgc2hpcCBzZWN0aW9uXG4gIHNlY3Quc2V0QXR0cmlidXRlKFwiaWRcIiwgYERPTS0ke2RvbVNlbH0tc2hpcFR5cGUtJHt0eXBlfS1wb3MtJHtwb3N9YCk7XG4gIC8vIFNldCBhIGRhdGFzZXQgcHJvcGVydHkgb2YgXCJwb3NpdGlvblwiIGZvciB0aGUgc2VjdGlvblxuICBzZWN0LmRhdGFzZXQucG9zaXRpb24gPSBwb3M7XG5cbiAgcmV0dXJuIHNlY3Q7XG59O1xuXG4vLyBGdW5jdGlvbiBmb3IgYnVpbGRpbmcgYSBzaGlwLCBkZXBlbmRpbmcgb24gdGhlIHNoaXAgdHlwZVxuY29uc3QgYnVpbGRTaGlwID0gKG9iaiwgZG9tU2VsLCBzaGlwUG9zaXRpb25zKSA9PiB7XG4gIC8vIEV4dHJhY3QgdGhlIHNoaXAncyB0eXBlIGFuZCBsZW5ndGggZnJvbSB0aGUgb2JqZWN0XG4gIGNvbnN0IHsgdHlwZSwgc2hpcExlbmd0aDogbGVuZ3RoIH0gPSBvYmo7XG4gIC8vIENyZWF0ZSBhbmQgYXJyYXkgZm9yIHRoZSBzaGlwJ3Mgc2VjdGlvbnNcbiAgY29uc3Qgc2hpcFNlY3RzID0gW107XG5cbiAgLy8gVXNlIHRoZSBsZW5ndGggb2YgdGhlIHNoaXAgdG8gY3JlYXRlIHRoZSBjb3JyZWN0IG51bWJlciBvZiBzZWN0aW9uc1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgLy8gR2V0IGEgcG9zaXRpb24gZnJvbSB0aGUgYXJyYXlcbiAgICBjb25zdCBwb3NpdGlvbiA9IHNoaXBQb3NpdGlvbnNbaV07XG4gICAgLy8gQ3JlYXRlIGFuIGVsZW1lbnQgZm9yIHRoZSBzZWN0aW9uXG4gICAgY29uc3Qgc2VjdCA9IGJ1aWxkU2VjdGlvbihkb21TZWwsIHR5cGUsIHBvc2l0aW9uKTtcbiAgICBzaGlwU2VjdHMucHVzaChzZWN0KTsgLy8gQWRkIHRoZSBzZWN0aW9uIHRvIHRoZSBhcnJheVxuICB9XG5cbiAgLy8gUmV0dXJuIHRoZSBhcnJheSBvZiBzaGlwIHNlY3Rpb25zXG4gIHJldHVybiBzaGlwU2VjdHM7XG59O1xuXG4vLyBGdW5jdGlvbiBmb3IgY3JlYXRpbmcgYW5kIGRpc3BsYXlpbmcgdGhlIHBvcC11cCBtZW51IGF0IHRoZSBlbmQgb2Zcbi8vIHRoZSBnYW1lXG5jb25zdCBlbmRHYW1lSW50ZXJmYWNlID0gKHdpbm5lcikgPT4ge1xuICAvLyBHZXQgdGhlIG1haW4gY29udGFpbmVyXG4gIGNvbnN0IG1haW5Db250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW4tY29udGFpbmVyXCIpO1xuXG4gIC8vIENyZWF0ZSBjb250YWluZXIgZm9yIGVuZCBvZiBnYW1lIGludGVyZmFjZVxuICBjb25zdCBlbmRHYW1lQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgZW5kR2FtZUNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImVuZC1nYW1lLWNvbnRhaW5lclwiKTtcbiAgZW5kR2FtZUNvbnRhaW5lci5jbGFzc05hbWUgPSB0d2BmaXhlZCBpbnNldC0wIGZsZXgganVzdGlmeS1jZW50ZXIgaXRlbXMtY2VudGVyIG1pbi13LWZ1bGwgbWluLWgtc2NyZWVuIGJnLWdyYXktOTAwIGJnLW9wYWNpdHktNDAgYmFja2Ryb3AtYmx1ci1zbSB6LTUwYDtcblxuICAvLyBDcmVhdGUgdGhlIGRpdiBmb3IgaG9sZGluZyB0aGUgcHJvbXB0IGFuZCBidXR0b25cbiAgY29uc3QgcHJvbXB0Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgcHJvbXB0Q29udGFpbmVyLmNsYXNzTmFtZSA9IHR3YHctOTAgaC02MCBwLTEwIGJnLWdyYXktMjAwIHNoYWRvdy1sZyByb3VuZGVkLW1kIGJnLW9wYWNpdHktNjAgYmFja2Ryb3AtYmx1ci1zbSBmbGV4IGZsZXgtY29sIGNvbnRlbnQtY2VudGVyIGp1c3RpZnktY2VudGVyYDtcblxuICAvLyBDcmVhdGUgdGhlIHByb21wdHNcbiAgY29uc3Qgd2lubmVyUHJvbXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gIHdpbm5lclByb21wdC5jbGFzc05hbWUgPSB0d2Bmb250LW1vbm8gdGV4dC1jZW50ZXIgdGV4dC1tZCB0ZXh0LWdyYXktODAwYDtcbiAgd2lubmVyUHJvbXB0LnRleHRDb250ZW50ID0gd2lubmVyID09PSBcImh1bWFuXCIgPyBcIllvdSB3aW4hXCIgOiBcIllvdSBsb3NlIVwiO1xuICBjb25zdCByZXN0YXJ0UHJvbXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gIHJlc3RhcnRQcm9tcHQuY2xhc3NOYW1lID0gdHdgZm9udC1tb25vIHRleHQtY2VudGVyIHRleHQtbWQgdGV4dC1ncmF5LTgwMGA7XG4gIHJlc3RhcnRQcm9tcHQudGV4dENvbnRlbnQgPSBcIkNsaWNrIHRoZSBidXR0b24gdG8gcmVzdGFydCB0aGUgZ2FtZSFcIjtcblxuICAvLyBDcmVhdGUgdGhlIHJlc3RhcnQgYnV0dG9uXG4gIGNvbnN0IHJlc3RhcnRCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICByZXN0YXJ0QnV0dG9uLnNldEF0dHJpYnV0ZShcImlkXCIsIFwicmVzdGFydC1idXR0b25cIik7XG4gIHJlc3RhcnRCdXR0b24uY2xhc3NOYW1lID0gdHdgbmFudW0tZ290aGljLWNvZGluZy1ib2xkIG10LTQgc2VsZi1jZW50ZXIgdGV4dC1sZyB3LW1pbiB0cmFja2luZy13aWRlc3QgcHgtMyBweS0xIHRleHQtY2VudGVyIHRleHQtc20gcm91bmRlZC1tZCBib3JkZXItc29saWQgdGV4dC1ncmF5LTIwMCBiZy1ncmF5LTgwMCBib3JkZXItMiBib3JkZXItZ3JheS0yMDAgaG92ZXI6YmctZ3JheS0yMDAgaG92ZXI6dGV4dC1ncmF5LTgwMCBob3Zlcjpib3JkZXItZ3JheS04MDBgO1xuICByZXN0YXJ0QnV0dG9uLnRleHRDb250ZW50ID0gXCJSZXN0YXJ0XCI7XG5cbiAgLy8gQWRkIHRoZSBlbGVtZW50cyB0byB0aGUgcmVsZXZhbnQgY29udGFpbmVyc1xuICBwcm9tcHRDb250YWluZXIuYXBwZW5kQ2hpbGQod2lubmVyUHJvbXB0KTtcbiAgcHJvbXB0Q29udGFpbmVyLmFwcGVuZENoaWxkKHJlc3RhcnRQcm9tcHQpO1xuICBwcm9tcHRDb250YWluZXIuYXBwZW5kQ2hpbGQocmVzdGFydEJ1dHRvbik7XG5cbiAgZW5kR2FtZUNvbnRhaW5lci5hcHBlbmRDaGlsZChwcm9tcHRDb250YWluZXIpO1xuXG4gIG1haW5Db250YWluZXIuYXBwZW5kQ2hpbGQoZW5kR2FtZUNvbnRhaW5lcik7XG59O1xuXG5jb25zdCBVaU1hbmFnZXIgPSAoKSA9PiB7XG4gIGNvbnN0IGNyZWF0ZUdhbWVib2FyZCA9IChjb250YWluZXJJRCkgPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcklEKTtcblxuICAgIC8vIFNldCBwbGF5ZXIgdHlwZSBkZXBlbmRpbmcgb24gdGhlIGNvbnRhaW5lcklEXG4gICAgY29uc3QgeyBwbGF5ZXIgfSA9IGNvbnRhaW5lci5kYXRhc2V0O1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBncmlkIGNvbnRhaW5lclxuICAgIGNvbnN0IGdyaWREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGdyaWREaXYuY2xhc3NOYW1lID0gdHdgZ2FtZWJvYXJkLWFyZWEgZ3JpZCBncmlkLWNvbHMtMTEgYXV0by1yb3dzLW1pbiBnYXAtMSBwLTZgO1xuICAgIGdyaWREaXYuZGF0YXNldC5wbGF5ZXIgPSBwbGF5ZXI7XG5cbiAgICAvLyBBZGQgdGhlIHRvcC1sZWZ0IGNvcm5lciBlbXB0eSBjZWxsXG4gICAgZ3JpZERpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpKTtcblxuICAgIC8vIEFkZCBjb2x1bW4gaGVhZGVycyBBLUpcbiAgICBjb25zdCBjb2x1bW5zID0gXCJBQkNERUZHSElKXCI7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2x1bW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgaGVhZGVyLmNsYXNzTmFtZSA9IFwidGV4dC1jZW50ZXJcIjtcbiAgICAgIGhlYWRlci50ZXh0Q29udGVudCA9IGNvbHVtbnNbaV07XG4gICAgICBncmlkRGl2LmFwcGVuZENoaWxkKGhlYWRlcik7XG4gICAgfVxuXG4gICAgLy8gQWRkIHJvdyBsYWJlbHMgYW5kIGNlbGxzXG4gICAgZm9yIChsZXQgcm93ID0gMTsgcm93IDw9IDEwOyByb3crKykge1xuICAgICAgLy8gUm93IGxhYmVsXG4gICAgICBjb25zdCByb3dMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICByb3dMYWJlbC5jbGFzc05hbWUgPSBcInRleHQtY2VudGVyXCI7XG4gICAgICByb3dMYWJlbC50ZXh0Q29udGVudCA9IHJvdztcbiAgICAgIGdyaWREaXYuYXBwZW5kQ2hpbGQocm93TGFiZWwpO1xuXG4gICAgICAvLyBDZWxscyBmb3IgZWFjaCByb3dcbiAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IDEwOyBjb2wrKykge1xuICAgICAgICBjb25zdCBjZWxsSWQgPSBgJHtjb2x1bW5zW2NvbF19JHtyb3d9YDsgLy8gU2V0IHRoZSBjZWxsSWRcbiAgICAgICAgY29uc3QgY2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNlbGwuaWQgPSBgJHtwbGF5ZXJ9LSR7Y2VsbElkfWA7IC8vIFNldCB0aGUgZWxlbWVudCBpZFxuICAgICAgICBjZWxsLmNsYXNzTmFtZSA9IHR3YHctNiBoLTYgZmxleCBqdXN0aWZ5LWNlbnRlciBpdGVtcy1jZW50ZXIgY3Vyc29yLXBvaW50ZXJgOyAvLyBBZGQgbW9yZSBjbGFzc2VzIGFzIG5lZWRlZCBmb3Igc3R5bGluZ1xuICAgICAgICBjZWxsLmNsYXNzTGlzdC5hZGQocHJpbWFyeUhvdmVyQ2xyKTtcbiAgICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKGNlbGxDbHIpO1xuICAgICAgICBjZWxsLmNsYXNzTGlzdC5hZGQoXCJnYW1lYm9hcmQtY2VsbFwiKTsgLy8gQWRkIGEgY2xhc3MgbmFtZSB0byBlYWNoIGNlbGwgdG8gYWN0IGFzIGEgc2VsZWN0b3JcbiAgICAgICAgY2VsbC5kYXRhc2V0LnBvc2l0aW9uID0gY2VsbElkOyAvLyBBc3NpZ24gcG9zaXRpb24gZGF0YSBhdHRyaWJ1dGUgZm9yIGlkZW50aWZpY2F0aW9uXG4gICAgICAgIGNlbGwuZGF0YXNldC5wbGF5ZXIgPSBwbGF5ZXI7IC8vIEFzc2lnbiBwbGF5ZXIgZGF0YSBhdHRyaWJ1dGUgZm9yIGlkZW50aWZpY2F0aW9uXG5cbiAgICAgICAgZ3JpZERpdi5hcHBlbmRDaGlsZChjZWxsKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBcHBlbmQgdGhlIGdyaWQgdG8gdGhlIGNvbnRhaW5lclxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChncmlkRGl2KTtcbiAgfTtcblxuICBjb25zdCBpbml0Q29uc29sZVVJID0gKCkgPT4ge1xuICAgIGNvbnN0IGNvbnNvbGVDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGVcIik7IC8vIEdldCB0aGUgY29uc29sZSBjb250YWluZXIgZnJvbSB0aGUgRE9NXG4gICAgY29uc29sZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFxuICAgICAgXCJmbGV4XCIsXG4gICAgICBcImZsZXgtY29sXCIsXG4gICAgICBcImp1c3RpZnktYmV0d2VlblwiLFxuICAgICAgXCJ0ZXh0LXNtXCIsXG4gICAgKTsgLy8gU2V0IGZsZXhib3ggcnVsZXMgZm9yIGNvbnRhaW5lclxuXG4gICAgLy8gQ3JlYXRlIGEgY29udGFpbmVyIGZvciB0aGUgaW5wdXQgYW5kIGJ1dHRvbiBlbGVtZW50c1xuICAgIGNvbnN0IGlucHV0RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBpbnB1dERpdi5jbGFzc05hbWUgPSBcImZsZXggZmxleC1yb3cgdy1mdWxsIGgtMS81IGp1c3RpZnktYmV0d2VlblwiOyAvLyBTZXQgdGhlIGZsZXhib3ggcnVsZXMgZm9yIHRoZSBjb250YWluZXJcblxuICAgIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpOyAvLyBDcmVhdGUgYW4gaW5wdXQgZWxlbWVudCBmb3IgdGhlIGNvbnNvbGVcbiAgICBpbnB1dC50eXBlID0gXCJ0ZXh0XCI7IC8vIFNldCB0aGUgaW5wdXQgdHlwZSBvZiB0aGlzIGVsZW1lbnQgdG8gdGV4dFxuICAgIGlucHV0LnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY29uc29sZS1pbnB1dFwiKTsgLy8gU2V0IHRoZSBpZCBmb3IgdGhpcyBlbGVtZW50IHRvIFwiY29uc29sZS1pbnB1dFwiXG4gICAgaW5wdXQuY2xhc3NOYW1lID0gdHdgcGwtMyBmbGV4LTEgcm91bmRlZC1ibC1tZCBib3JkZXItdHJhbnNwYXJlbnQgb3V0bGluZS1ub25lIGZvY3VzOm91dGxpbmUtc29saWQgZm9jdXM6Ym9yZGVyLTIgZm9jdXM6Ym9yZGVyLWdyYXktMjAwIGZvY3VzOnJpbmctMGA7IC8vIEFkZCBUYWlsd2luZENTUyBjbGFzc2VzXG4gICAgaW5wdXQuY2xhc3NMaXN0LmFkZChpbnB1dENscik7XG4gICAgaW5wdXQuY2xhc3NMaXN0LmFkZChpbnB1dFRleHRDbHIpO1xuICAgIGNvbnN0IHN1Ym1pdEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7IC8vIENyZWF0ZSBhIGJ1dHRvbiBlbGVtZW50IGZvciB0aGUgY29uc29sZSBzdWJtaXRcbiAgICBzdWJtaXRCdXR0b24udGV4dENvbnRlbnQgPSBcIlN1Ym1pdFwiOyAvLyBBZGQgdGhlIHRleHQgXCJTdWJtaXRcIiB0byB0aGUgYnV0dG9uXG4gICAgc3VibWl0QnV0dG9uLnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY29uc29sZS1zdWJtaXRcIik7IC8vIFNldCB0aGUgaWQgZm9yIHRoZSBidXR0b25cbiAgICBzdWJtaXRCdXR0b24uY2xhc3NOYW1lID0gdHdgbmFudW0tZ290aGljLWNvZGluZy1ib2xkIHRleHQtbGcgdHJhY2tpbmctd2lkZXN0IHB4LTMgcHktMSB0ZXh0LWNlbnRlciB0ZXh0LXNtIHJvdW5kZWQtYnItbWQgYm9yZGVyLXNvbGlkIGJvcmRlci0yIGJvcmRlci1ncmF5LTIwMCBob3ZlcjpiZy1ncmF5LTIwMCBob3Zlcjp0ZXh0LWdyYXktODAwIGhvdmVyOmJvcmRlci1ncmF5LTgwMGA7IC8vIEFkZCBUYWlsd2luZENTUyBjbGFzc2VzXG4gICAgc3VibWl0QnV0dG9uLmNsYXNzTGlzdC5hZGQoYnV0dG9uQ2xyKTtcbiAgICBzdWJtaXRCdXR0b24uY2xhc3NMaXN0LmFkZChidXR0b25UZXh0Q2xyKTtcbiAgICBjb25zdCBvdXRwdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpOyAvLyBDcmVhdGUgYW4gZGl2IGVsZW1lbnQgZm9yIHRoZSBvdXRwdXQgb2YgdGhlIGNvbnNvbGVcbiAgICBvdXRwdXQuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJjb25zb2xlLW91dHB1dFwiKTsgLy8gU2V0IHRoZSBpZCBmb3IgdGhlIG91dHB1dCBlbGVtZW50XG4gICAgb3V0cHV0LmNsYXNzTmFtZSA9IHR3YGZsZXgtMSBwLTIgaC00LzUgb3ZlcmZsb3ctYXV0byByb3VuZGVkLXQtbWQgYmctZ3JheS0yMDAgYmctb3BhY2l0eS0zMCBiYWNrZHJvcC1ibHVyLW1kYDsgLy8gQWRkIFRhaWx3aW5kQ1NTIGNsYXNzZXMgKGJnLWdyYWRpZW50LXRvLXRyLCBmcm9tLWdyYXktNDAwLCB0by1ncmF5LTEwMClcblxuICAgIC8vIEFkZCB0aGUgaW5wdXQgZWxlbWVudHMgdG8gdGhlIGlucHV0IGNvbnRhaW5lclxuICAgIGlucHV0RGl2LmFwcGVuZENoaWxkKGlucHV0KTtcbiAgICBpbnB1dERpdi5hcHBlbmRDaGlsZChzdWJtaXRCdXR0b24pO1xuXG4gICAgLy8gQXBwZW5kIGVsZW1lbnRzIHRvIHRoZSBjb25zb2xlIGNvbnRhaW5lclxuICAgIGNvbnNvbGVDb250YWluZXIuYXBwZW5kQ2hpbGQob3V0cHV0KTtcbiAgICBjb25zb2xlQ29udGFpbmVyLmFwcGVuZENoaWxkKGlucHV0RGl2KTtcbiAgfTtcblxuICBjb25zdCBkaXNwbGF5UHJvbXB0ID0gKHByb21wdE9ianMpID0+IHtcbiAgICAvLyBHZXQgdGhlIHByb21wdCBkaXNwbGF5XG4gICAgY29uc3QgZGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJvbXB0LWRpc3BsYXlcIik7XG5cbiAgICAvLyBDbGVhciB0aGUgZGlzcGxheSBvZiBhbGwgY2hpbGRyZW5cbiAgICB3aGlsZSAoZGlzcGxheS5maXJzdENoaWxkKSB7XG4gICAgICBkaXNwbGF5LnJlbW92ZUNoaWxkKGRpc3BsYXkuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgLy8gSXRlcmF0ZSBvdmVyIGVhY2ggcHJvbXB0IGluIHRoZSBwcm9tcHRzIG9iamVjdFxuICAgIE9iamVjdC5lbnRyaWVzKHByb21wdE9ianMpLmZvckVhY2goKFtrZXksIHsgcHJvbXB0LCBwcm9tcHRUeXBlIH1dKSA9PiB7XG4gICAgICAvLyBDcmVhdGUgYSBuZXcgZGl2IGZvciBlYWNoIHByb21wdFxuICAgICAgY29uc3QgcHJvbXB0RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIHByb21wdERpdi50ZXh0Q29udGVudCA9IHByb21wdDtcblxuICAgICAgLy8gQXBwbHkgc3R5bGluZyBiYXNlZCBvbiBwcm9tcHRUeXBlXG4gICAgICBzd2l0Y2ggKHByb21wdFR5cGUpIHtcbiAgICAgICAgY2FzZSBcImluc3RydWN0aW9uXCI6XG4gICAgICAgICAgcHJvbXB0RGl2LmNsYXNzTGlzdC5hZGQoaW5zdHJ1Y3Rpb25DbHIpO1xuICAgICAgICAgIHByb21wdERpdi5jbGFzc0xpc3QuYWRkKFwibmFudW0tZ290aGljLWNvZGluZy1ib2xkXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZ3VpZGVcIjpcbiAgICAgICAgICBwcm9tcHREaXYuY2xhc3NMaXN0LmFkZChndWlkZUNscik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgICAgIHByb21wdERpdi5jbGFzc0xpc3QuYWRkKGVycm9yQ2xyKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBwcm9tcHREaXYuY2xhc3NMaXN0LmFkZChkZWZhdWx0Q2xyKTsgLy8gRGVmYXVsdCB0ZXh0IGNvbG9yXG4gICAgICB9XG5cbiAgICAgIC8vIEFwcGVuZCB0aGUgbmV3IGRpdiB0byB0aGUgZGlzcGxheSBjb250YWluZXJcbiAgICAgIGRpc3BsYXkuYXBwZW5kQ2hpbGQocHJvbXB0RGl2KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiBmb3IgcmVuZGVyaW5nIHNoaXBzIHRvIHRoZSBTaGlwIFN0YXR1cyBkaXNwbGF5IHNlY3Rpb25cbiAgY29uc3QgcmVuZGVyU2hpcERpc3AgPSAocGxheWVyT2JqLCBzaGlwVHlwZSkgPT4ge1xuICAgIGxldCBpZFNlbDtcblxuICAgIC8vIFNldCB0aGUgY29ycmVjdCBpZCBzZWxlY3RvciBmb3IgdGhlIHR5cGUgb2YgcGxheWVyXG4gICAgaWYgKHBsYXllck9iai50eXBlID09PSBcImh1bWFuXCIpIHtcbiAgICAgIGlkU2VsID0gXCJodW1hbi1kaXNwbGF5XCI7XG4gICAgfSBlbHNlIGlmIChwbGF5ZXJPYmoudHlwZSA9PT0gXCJjb21wdXRlclwiKSB7XG4gICAgICBpZFNlbCA9IFwiY29tcC1kaXNwbGF5XCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yO1xuICAgIH1cblxuICAgIC8vIEdldCB0aGUgY29ycmVjdCBET00gZWxlbWVudFxuICAgIGNvbnN0IGRpc3BEaXYgPSBkb2N1bWVudFxuICAgICAgLmdldEVsZW1lbnRCeUlkKGlkU2VsKVxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCIuc2hpcHMtY29udGFpbmVyXCIpO1xuXG4gICAgLy8gR2V0IHRoZSBzaGlwIGZyb20gdGhlIHBsYXllclxuICAgIGNvbnN0IHNoaXAgPSBwbGF5ZXJPYmouZ2FtZWJvYXJkLmdldFNoaXAoc2hpcFR5cGUpO1xuXG4gICAgLy8gQ3JlYXRlIGEgZGl2IGZvciB0aGUgc2hpcFxuICAgIGNvbnN0IHNoaXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHNoaXBEaXYuY2xhc3NOYW1lID0gXCJweC00IHB5LTIgZmxleCBmbGV4LWNvbCBnYXAtMVwiO1xuXG4gICAgLy8gQWRkIGEgdGl0bGUgdGhlIHRoZSBkaXZcbiAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoMlwiKTtcbiAgICB0aXRsZS50ZXh0Q29udGVudCA9IHNoaXBUeXBlOyAvLyBTZXQgdGhlIHRpdGxlIHRvIHRoZSBzaGlwIHR5cGVcbiAgICBzaGlwRGl2LmFwcGVuZENoaWxkKHRpdGxlKTtcblxuICAgIC8vIEdldCB0aGUgc2hpcCBwb3NpdGlvbnMgYXJyYXlcbiAgICBjb25zdCBzaGlwUG9zaXRpb25zID0gcGxheWVyT2JqLmdhbWVib2FyZC5nZXRTaGlwUG9zaXRpb25zKHNoaXBUeXBlKTtcblxuICAgIC8vIEJ1aWxkIHRoZSBzaGlwIHNlY3Rpb25zXG4gICAgY29uc3Qgc2hpcFNlY3RzID0gYnVpbGRTaGlwKHNoaXAsIGlkU2VsLCBzaGlwUG9zaXRpb25zKTtcblxuICAgIC8vIEFkZCB0aGUgc2hpcCBzZWN0aW9ucyB0byB0aGUgZGl2XG4gICAgY29uc3Qgc2VjdHNEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHNlY3RzRGl2LmNsYXNzTmFtZSA9IFwiZmxleCBmbGV4LXJvdyBnYXAtMVwiO1xuICAgIHNoaXBTZWN0cy5mb3JFYWNoKChzZWN0KSA9PiB7XG4gICAgICBzZWN0c0Rpdi5hcHBlbmRDaGlsZChzZWN0KTtcbiAgICB9KTtcbiAgICBzaGlwRGl2LmFwcGVuZENoaWxkKHNlY3RzRGl2KTtcblxuICAgIGRpc3BEaXYuYXBwZW5kQ2hpbGQoc2hpcERpdik7XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gZm9yIHIgc2hpcHMgb24gdGhlIGdhbWVib2FyZFxuICBjb25zdCByZW5kZXJTaGlwQm9hcmQgPSAocGxheWVyT2JqLCBzaGlwVHlwZSkgPT4ge1xuICAgIGxldCBpZFNlbDtcblxuICAgIC8vIFNldCB0aGUgY29ycmVjdCBpZCBzZWxlY3RvciBmb3IgdGhlIHR5cGUgb2YgcGxheWVyXG4gICAgaWYgKHBsYXllck9iai50eXBlID09PSBcImh1bWFuXCIpIHtcbiAgICAgIGlkU2VsID0gXCJodW1hbi1ib2FyZFwiO1xuICAgIH0gZWxzZSBpZiAocGxheWVyT2JqLnR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgaWRTZWwgPSBcImNvbXAtYm9hcmRcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgRXJyb3IoXCJObyBtYXRjaGluZyBwbGF5ZXIgdHlwZSBpbiAncmVuZGVyU2hpcEJvYXJkJyBmdW5jdGlvblwiKTtcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIHBsYXllcidzIHR5cGUgYW5kIGdhbWVib2FyZFxuICAgIGNvbnN0IHsgdHlwZTogcGxheWVyVHlwZSwgZ2FtZWJvYXJkIH0gPSBwbGF5ZXJPYmo7XG5cbiAgICAvLyBHZXQgdGhlIHNoaXAgYW5kIHRoZSBzaGlwIHBvc2l0aW9uc1xuICAgIGNvbnN0IHNoaXBPYmogPSBnYW1lYm9hcmQuZ2V0U2hpcChzaGlwVHlwZSk7XG4gICAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IGdhbWVib2FyZC5nZXRTaGlwUG9zaXRpb25zKHNoaXBUeXBlKTtcblxuICAgIC8vIEJ1aWxkIHRoZSBzaGlwIHNlY3Rpb25zXG4gICAgY29uc3Qgc2hpcFNlY3RzID0gYnVpbGRTaGlwKHNoaXBPYmosIGlkU2VsLCBzaGlwUG9zaXRpb25zKTtcblxuICAgIC8vIE1hdGNoIHRoZSBjZWxsIHBvc2l0aW9ucyB3aXRoIHRoZSBzaGlwIHNlY3Rpb25zIGFuZCBwbGFjZSBlYWNoXG4gICAgLy8gc2hpcCBzZWN0aW9uIGluIHRoZSBjb3JyZXNwb25kaW5nIGNlbGwgZWxlbWVudFxuICAgIHNoaXBQb3NpdGlvbnMuZm9yRWFjaCgocG9zaXRpb24pID0+IHtcbiAgICAgIGNvbnN0IGNlbGxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7cGxheWVyVHlwZX0tJHtwb3NpdGlvbn1gKTtcbiAgICAgIC8vIEZpbmQgdGhlIHNoaXAgc2VjdGlvbiBlbGVtZW50IHRoYXQgbWF0Y2hlcyB0aGUgY3VycmVudCBwb3NpdGlvblxuICAgICAgY29uc3Qgc2hpcFNlY3QgPSBzaGlwU2VjdHMuZmluZChcbiAgICAgICAgKHNlY3Rpb24pID0+IHNlY3Rpb24uZGF0YXNldC5wb3NpdGlvbiA9PT0gcG9zaXRpb24sXG4gICAgICApO1xuXG4gICAgICBpZiAoY2VsbEVsZW1lbnQgJiYgc2hpcFNlY3QpIHtcbiAgICAgICAgLy8gUGxhY2UgdGhlIHNoaXAgc2VjdGlvbiBpbiB0aGUgY2VsbFxuICAgICAgICBjZWxsRWxlbWVudC5hcHBlbmRDaGlsZChzaGlwU2VjdCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgY29uc3QgcmVuZGVyU2hpcFNlY3QgPSAoc2hpcFR5cGUsIHBvcykgPT4ge1xuICAgIC8vIEJ1aWxkIGEgc2VjdGlvbiB3aXRoIHRoZSBpZCBET00gc2VsZWN0b3Igb2YgXCJjb21wLWJvYXJkXCJcbiAgICBjb25zdCBzZWN0ID0gYnVpbGRTZWN0aW9uKFwiY29tcC1ib2FyZFwiLCBzaGlwVHlwZSwgcG9zKTtcblxuICAgIC8vIEdldCB0aGUgY29ycmVjdCBjZWxsIGVsZW1lbnRcbiAgICBjb25zdCBjZWxsRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBjb21wdXRlci0ke3Bvc31gKTtcblxuICAgIGlmIChjZWxsRWxlbWVudCAmJiBzZWN0KSB7XG4gICAgICAvLyBQbGFjZSB0aGUgc2hpcCBzZWN0aW9uIGluIHRoZSBjZWxsXG4gICAgICBjZWxsRWxlbWVudC5hcHBlbmRDaGlsZChzZWN0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgTWlzc2luZyBzaGlwIHNlY3Rpb24gYW5kL29yIGNlbGwgZWxlbWVudC4gU2hpcCBzZWN0aW9uID0gJHtzZWN0fS4gQ2VsbCBlbGVtZW50ID0gJHtjZWxsRWxlbWVudH0uYCxcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHVwZGF0ZVNoaXBTZWN0aW9uID0gKHBvcywgc2hpcFR5cGUsIHBsYXllclR5cGUsIGlzU2hpcFN1bmsgPSBmYWxzZSkgPT4ge1xuICAgIGxldCBuZXdDbHI7XG5cbiAgICBzd2l0Y2ggKGlzU2hpcFN1bmspIHtcbiAgICAgIGNhc2UgdHJ1ZTpcbiAgICAgICAgbmV3Q2xyID0gc2hpcFN1bmtDbHI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbmV3Q2xyID0gc2hpcEhpdENscjtcbiAgICB9XG5cbiAgICAvLyBTZXQgdGhlIHNlbGVjdG9yIHZhbHVlIGRlcGVuZGluZyBvbiB0aGUgcGxheWVyIHR5cGVcbiAgICBjb25zdCBwbGF5ZXJJZCA9IHBsYXllclR5cGUgPT09IFwiaHVtYW5cIiA/IFwiaHVtYW5cIiA6IFwiY29tcFwiO1xuXG4gICAgLy8gSWYgdGhlIHBsYXllciB0eXBlIGlzIGNvbXB1dGVyIGFuZCB0aGUgc2hpcCBpc24ndCBzdW5rIHRoZW5cbiAgICAvLyByZW5kZXIgdGhlIHNpbmdsZSBzaGlwIHNlY3Rpb24gb24gdGhlIGJvYXJkXG4gICAgaWYgKHBsYXllcklkID09PSBcImNvbXBcIiAmJiAhaXNTaGlwU3Vuaykge1xuICAgICAgcmVuZGVyU2hpcFNlY3Qoc2hpcFR5cGUsIHBvcyk7XG4gICAgfVxuXG4gICAgLy8gSWYgcGxheWVyIHR5cGUgaXMgaHVtYW4gdGhlbiBhbHNvIHVwZGF0ZSB0aGUgc2hpcCBzZWN0aW9uIG9uIHRoZSBib2FyZFxuICAgIGlmIChwbGF5ZXJJZCA9PT0gXCJodW1hblwiIHx8IGlzU2hpcFN1bmspIHtcbiAgICAgIC8vIEdldCB0aGUgY29ycmVjdCBzaGlwIHNlY3Rpb24gZWxlbWVudCBmcm9tIHRoZSBET00gZm9yIHRoZVxuICAgICAgLy8gc3RhdHVzIGRpc3BsYXlcbiAgICAgIGNvbnN0IHNoaXBTZWN0RGlzcGxheUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICAgIGBET00tJHtwbGF5ZXJJZH0tZGlzcGxheS1zaGlwVHlwZS0ke3NoaXBUeXBlfS1wb3MtJHtwb3N9YCxcbiAgICAgICk7XG5cbiAgICAgIC8vIElmIHRoZSBlbGVtZW50IHdhcyBmb3VuZCBzdWNjZXNzZnVsbHksIGNoYW5nZSBpdHMgY29sb3VyLCBvdGhlcndpc2VcbiAgICAgIC8vIHRocm93IGVycm9yXG4gICAgICBpZiAoIXNoaXBTZWN0RGlzcGxheUVsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBcIkVycm9yISBTaGlwIHNlY3Rpb24gZWxlbWVudCBub3QgZm91bmQgaW4gc3RhdHVzIGRpc3BsYXkhICh1cGRhdGVTaGlwU2VjdGlvbilcIixcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNoaXBTZWN0RGlzcGxheUVsLmNsYXNzTGlzdC5yZW1vdmUoc2hpcFNlY3RDbHIpO1xuICAgICAgICBzaGlwU2VjdERpc3BsYXlFbC5jbGFzc0xpc3QucmVtb3ZlKHNoaXBIaXRDbHIpO1xuICAgICAgICBzaGlwU2VjdERpc3BsYXlFbC5jbGFzc0xpc3QuYWRkKG5ld0Nscik7XG4gICAgICB9XG5cbiAgICAgIGlmIChwbGF5ZXJJZCA9PT0gXCJodW1hblwiIHx8IHBsYXllcklkID09PSBcImNvbXBcIikge1xuICAgICAgICAvLyBHZXQgdGhlIGNvcnJlY3Qgc2hpcCBzZWN0aW9uIGVsZW1lbnQgZnJvbSB0aGUgRE9NIGZvciB0aGVcbiAgICAgICAgLy8gZ2FtZWJvYXJkIGRpc3BsYXlcbiAgICAgICAgY29uc3Qgc2hpcFNlY3RCb2FyZEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICAgICAgYERPTS0ke3BsYXllcklkfS1ib2FyZC1zaGlwVHlwZS0ke3NoaXBUeXBlfS1wb3MtJHtwb3N9YCxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBJZiB0aGUgZWxlbWVudCB3YXMgZm91bmQgc3VjY2Vzc2Z1bGx5LCBjaGFuZ2UgaXRzIGNvbG91ciwgb3RoZXJ3aXNlXG4gICAgICAgIC8vIHRocm93IGVycm9yXG4gICAgICAgIGlmICghc2hpcFNlY3RCb2FyZEVsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgXCJFcnJvciEgU2hpcCBzZWN0aW9uIGVsZW1lbnQgbm90IGZvdW5kIG9uIGdhbWVib2FyZCEgKHVwZGF0ZVNoaXBTZWN0aW9uKVwiLFxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2hpcFNlY3RCb2FyZEVsLmNsYXNzTGlzdC5yZW1vdmUoc2hpcFNlY3RDbHIpO1xuICAgICAgICAgIHNoaXBTZWN0Qm9hcmRFbC5jbGFzc0xpc3QucmVtb3ZlKHNoaXBIaXRDbHIpO1xuICAgICAgICAgIHNoaXBTZWN0Qm9hcmRFbC5jbGFzc0xpc3QuYWRkKG5ld0Nscik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgY29uc3QgcmVuZGVyU3Vua2VuU2hpcCA9IChwbGF5ZXJPYmosIHNoaXBUeXBlKSA9PiB7XG4gICAgLy8gR2V0IHRoZSBwbGF5ZXIgdHlwZVxuICAgIGNvbnN0IHsgdHlwZSB9ID0gcGxheWVyT2JqO1xuXG4gICAgLy8gR2V0IHRoZSBzaGlwIHBvc2l0aW9ucyBmb3IgdGhlIHNoaXBcbiAgICBjb25zdCBzaGlwUG9zaXRpb25zID0gcGxheWVyT2JqLmdhbWVib2FyZC5nZXRTaGlwUG9zaXRpb25zKHNoaXBUeXBlKTtcblxuICAgIHNoaXBQb3NpdGlvbnMuZm9yRWFjaCgocG9zKSA9PiB7XG4gICAgICB1cGRhdGVTaGlwU2VjdGlvbihwb3MsIHNoaXBUeXBlLCB0eXBlLCB0cnVlKTtcbiAgICB9KTtcbiAgfTtcblxuICBjb25zdCBwcm9tcHRFbmRHYW1lID0gKHdpbm5lcikgPT4ge1xuICAgIC8vIENyZWF0ZSBhbmQgZGlzcGxheSBwb3AtdXBcbiAgICBlbmRHYW1lSW50ZXJmYWNlKHdpbm5lcik7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBjcmVhdGVHYW1lYm9hcmQsXG4gICAgaW5pdENvbnNvbGVVSSxcbiAgICBkaXNwbGF5UHJvbXB0LFxuICAgIHJlbmRlclNoaXBEaXNwLFxuICAgIHJlbmRlclNoaXBCb2FyZCxcbiAgICB1cGRhdGVTaGlwU2VjdGlvbixcbiAgICByZW5kZXJTdW5rZW5TaGlwLFxuICAgIHByb21wdEVuZEdhbWUsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBVaU1hbmFnZXI7XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBgLypcbiEgdGFpbHdpbmRjc3MgdjMuNC4xIHwgTUlUIExpY2Vuc2UgfCBodHRwczovL3RhaWx3aW5kY3NzLmNvbVxuKi8vKlxuMS4gUHJldmVudCBwYWRkaW5nIGFuZCBib3JkZXIgZnJvbSBhZmZlY3RpbmcgZWxlbWVudCB3aWR0aC4gKGh0dHBzOi8vZ2l0aHViLmNvbS9tb3pkZXZzL2Nzc3JlbWVkeS9pc3N1ZXMvNClcbjIuIEFsbG93IGFkZGluZyBhIGJvcmRlciB0byBhbiBlbGVtZW50IGJ5IGp1c3QgYWRkaW5nIGEgYm9yZGVyLXdpZHRoLiAoaHR0cHM6Ly9naXRodWIuY29tL3RhaWx3aW5kY3NzL3RhaWx3aW5kY3NzL3B1bGwvMTE2KVxuKi9cblxuKixcbjo6YmVmb3JlLFxuOjphZnRlciB7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7IC8qIDEgKi9cbiAgYm9yZGVyLXdpZHRoOiAwOyAvKiAyICovXG4gIGJvcmRlci1zdHlsZTogc29saWQ7IC8qIDIgKi9cbiAgYm9yZGVyLWNvbG9yOiAjZTVlN2ViOyAvKiAyICovXG59XG5cbjo6YmVmb3JlLFxuOjphZnRlciB7XG4gIC0tdHctY29udGVudDogJyc7XG59XG5cbi8qXG4xLiBVc2UgYSBjb25zaXN0ZW50IHNlbnNpYmxlIGxpbmUtaGVpZ2h0IGluIGFsbCBicm93c2Vycy5cbjIuIFByZXZlbnQgYWRqdXN0bWVudHMgb2YgZm9udCBzaXplIGFmdGVyIG9yaWVudGF0aW9uIGNoYW5nZXMgaW4gaU9TLlxuMy4gVXNlIGEgbW9yZSByZWFkYWJsZSB0YWIgc2l6ZS5cbjQuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgc2Fuc1xcYCBmb250LWZhbWlseSBieSBkZWZhdWx0LlxuNS4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBzYW5zXFxgIGZvbnQtZmVhdHVyZS1zZXR0aW5ncyBieSBkZWZhdWx0LlxuNi4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBzYW5zXFxgIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzIGJ5IGRlZmF1bHQuXG43LiBEaXNhYmxlIHRhcCBoaWdobGlnaHRzIG9uIGlPU1xuKi9cblxuaHRtbCxcbjpob3N0IHtcbiAgbGluZS1oZWlnaHQ6IDEuNTsgLyogMSAqL1xuICAtd2Via2l0LXRleHQtc2l6ZS1hZGp1c3Q6IDEwMCU7IC8qIDIgKi9cbiAgLW1vei10YWItc2l6ZTogNDsgLyogMyAqL1xuICAtby10YWItc2l6ZTogNDtcbiAgICAgdGFiLXNpemU6IDQ7IC8qIDMgKi9cbiAgZm9udC1mYW1pbHk6IHVpLXNhbnMtc2VyaWYsIHN5c3RlbS11aSwgc2Fucy1zZXJpZiwgXCJBcHBsZSBDb2xvciBFbW9qaVwiLCBcIlNlZ29lIFVJIEVtb2ppXCIsIFwiU2Vnb2UgVUkgU3ltYm9sXCIsIFwiTm90byBDb2xvciBFbW9qaVwiOyAvKiA0ICovXG4gIGZvbnQtZmVhdHVyZS1zZXR0aW5nczogbm9ybWFsOyAvKiA1ICovXG4gIGZvbnQtdmFyaWF0aW9uLXNldHRpbmdzOiBub3JtYWw7IC8qIDYgKi9cbiAgLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOiB0cmFuc3BhcmVudDsgLyogNyAqL1xufVxuXG4vKlxuMS4gUmVtb3ZlIHRoZSBtYXJnaW4gaW4gYWxsIGJyb3dzZXJzLlxuMi4gSW5oZXJpdCBsaW5lLWhlaWdodCBmcm9tIFxcYGh0bWxcXGAgc28gdXNlcnMgY2FuIHNldCB0aGVtIGFzIGEgY2xhc3MgZGlyZWN0bHkgb24gdGhlIFxcYGh0bWxcXGAgZWxlbWVudC5cbiovXG5cbmJvZHkge1xuICBtYXJnaW46IDA7IC8qIDEgKi9cbiAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7IC8qIDIgKi9cbn1cblxuLypcbjEuIEFkZCB0aGUgY29ycmVjdCBoZWlnaHQgaW4gRmlyZWZveC5cbjIuIENvcnJlY3QgdGhlIGluaGVyaXRhbmNlIG9mIGJvcmRlciBjb2xvciBpbiBGaXJlZm94LiAoaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTkwNjU1KVxuMy4gRW5zdXJlIGhvcml6b250YWwgcnVsZXMgYXJlIHZpc2libGUgYnkgZGVmYXVsdC5cbiovXG5cbmhyIHtcbiAgaGVpZ2h0OiAwOyAvKiAxICovXG4gIGNvbG9yOiBpbmhlcml0OyAvKiAyICovXG4gIGJvcmRlci10b3Atd2lkdGg6IDFweDsgLyogMyAqL1xufVxuXG4vKlxuQWRkIHRoZSBjb3JyZWN0IHRleHQgZGVjb3JhdGlvbiBpbiBDaHJvbWUsIEVkZ2UsIGFuZCBTYWZhcmkuXG4qL1xuXG5hYmJyOndoZXJlKFt0aXRsZV0pIHtcbiAgLXdlYmtpdC10ZXh0LWRlY29yYXRpb246IHVuZGVybGluZSBkb3R0ZWQ7XG4gICAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmUgZG90dGVkO1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBkZWZhdWx0IGZvbnQgc2l6ZSBhbmQgd2VpZ2h0IGZvciBoZWFkaW5ncy5cbiovXG5cbmgxLFxuaDIsXG5oMyxcbmg0LFxuaDUsXG5oNiB7XG4gIGZvbnQtc2l6ZTogaW5oZXJpdDtcbiAgZm9udC13ZWlnaHQ6IGluaGVyaXQ7XG59XG5cbi8qXG5SZXNldCBsaW5rcyB0byBvcHRpbWl6ZSBmb3Igb3B0LWluIHN0eWxpbmcgaW5zdGVhZCBvZiBvcHQtb3V0LlxuKi9cblxuYSB7XG4gIGNvbG9yOiBpbmhlcml0O1xuICB0ZXh0LWRlY29yYXRpb246IGluaGVyaXQ7XG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgZm9udCB3ZWlnaHQgaW4gRWRnZSBhbmQgU2FmYXJpLlxuKi9cblxuYixcbnN0cm9uZyB7XG4gIGZvbnQtd2VpZ2h0OiBib2xkZXI7XG59XG5cbi8qXG4xLiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYG1vbm9cXGAgZm9udC1mYW1pbHkgYnkgZGVmYXVsdC5cbjIuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgbW9ub1xcYCBmb250LWZlYXR1cmUtc2V0dGluZ3MgYnkgZGVmYXVsdC5cbjMuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgbW9ub1xcYCBmb250LXZhcmlhdGlvbi1zZXR0aW5ncyBieSBkZWZhdWx0LlxuNC4gQ29ycmVjdCB0aGUgb2RkIFxcYGVtXFxgIGZvbnQgc2l6aW5nIGluIGFsbCBicm93c2Vycy5cbiovXG5cbmNvZGUsXG5rYmQsXG5zYW1wLFxucHJlIHtcbiAgZm9udC1mYW1pbHk6IHVpLW1vbm9zcGFjZSwgU0ZNb25vLVJlZ3VsYXIsIE1lbmxvLCBNb25hY28sIENvbnNvbGFzLCBcIkxpYmVyYXRpb24gTW9ub1wiLCBcIkNvdXJpZXIgTmV3XCIsIG1vbm9zcGFjZTsgLyogMSAqL1xuICBmb250LWZlYXR1cmUtc2V0dGluZ3M6IG5vcm1hbDsgLyogMiAqL1xuICBmb250LXZhcmlhdGlvbi1zZXR0aW5nczogbm9ybWFsOyAvKiAzICovXG4gIGZvbnQtc2l6ZTogMWVtOyAvKiA0ICovXG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgZm9udCBzaXplIGluIGFsbCBicm93c2Vycy5cbiovXG5cbnNtYWxsIHtcbiAgZm9udC1zaXplOiA4MCU7XG59XG5cbi8qXG5QcmV2ZW50IFxcYHN1YlxcYCBhbmQgXFxgc3VwXFxgIGVsZW1lbnRzIGZyb20gYWZmZWN0aW5nIHRoZSBsaW5lIGhlaWdodCBpbiBhbGwgYnJvd3NlcnMuXG4qL1xuXG5zdWIsXG5zdXAge1xuICBmb250LXNpemU6IDc1JTtcbiAgbGluZS1oZWlnaHQ6IDA7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xufVxuXG5zdWIge1xuICBib3R0b206IC0wLjI1ZW07XG59XG5cbnN1cCB7XG4gIHRvcDogLTAuNWVtO1xufVxuXG4vKlxuMS4gUmVtb3ZlIHRleHQgaW5kZW50YXRpb24gZnJvbSB0YWJsZSBjb250ZW50cyBpbiBDaHJvbWUgYW5kIFNhZmFyaS4gKGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTk5OTA4OCwgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTIwMTI5NylcbjIuIENvcnJlY3QgdGFibGUgYm9yZGVyIGNvbG9yIGluaGVyaXRhbmNlIGluIGFsbCBDaHJvbWUgYW5kIFNhZmFyaS4gKGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTkzNTcyOSwgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE5NTAxNilcbjMuIFJlbW92ZSBnYXBzIGJldHdlZW4gdGFibGUgYm9yZGVycyBieSBkZWZhdWx0LlxuKi9cblxudGFibGUge1xuICB0ZXh0LWluZGVudDogMDsgLyogMSAqL1xuICBib3JkZXItY29sb3I6IGluaGVyaXQ7IC8qIDIgKi9cbiAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsgLyogMyAqL1xufVxuXG4vKlxuMS4gQ2hhbmdlIHRoZSBmb250IHN0eWxlcyBpbiBhbGwgYnJvd3NlcnMuXG4yLiBSZW1vdmUgdGhlIG1hcmdpbiBpbiBGaXJlZm94IGFuZCBTYWZhcmkuXG4zLiBSZW1vdmUgZGVmYXVsdCBwYWRkaW5nIGluIGFsbCBicm93c2Vycy5cbiovXG5cbmJ1dHRvbixcbmlucHV0LFxub3B0Z3JvdXAsXG5zZWxlY3QsXG50ZXh0YXJlYSB7XG4gIGZvbnQtZmFtaWx5OiBpbmhlcml0OyAvKiAxICovXG4gIGZvbnQtZmVhdHVyZS1zZXR0aW5nczogaW5oZXJpdDsgLyogMSAqL1xuICBmb250LXZhcmlhdGlvbi1zZXR0aW5nczogaW5oZXJpdDsgLyogMSAqL1xuICBmb250LXNpemU6IDEwMCU7IC8qIDEgKi9cbiAgZm9udC13ZWlnaHQ6IGluaGVyaXQ7IC8qIDEgKi9cbiAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7IC8qIDEgKi9cbiAgY29sb3I6IGluaGVyaXQ7IC8qIDEgKi9cbiAgbWFyZ2luOiAwOyAvKiAyICovXG4gIHBhZGRpbmc6IDA7IC8qIDMgKi9cbn1cblxuLypcblJlbW92ZSB0aGUgaW5oZXJpdGFuY2Ugb2YgdGV4dCB0cmFuc2Zvcm0gaW4gRWRnZSBhbmQgRmlyZWZveC5cbiovXG5cbmJ1dHRvbixcbnNlbGVjdCB7XG4gIHRleHQtdHJhbnNmb3JtOiBub25lO1xufVxuXG4vKlxuMS4gQ29ycmVjdCB0aGUgaW5hYmlsaXR5IHRvIHN0eWxlIGNsaWNrYWJsZSB0eXBlcyBpbiBpT1MgYW5kIFNhZmFyaS5cbjIuIFJlbW92ZSBkZWZhdWx0IGJ1dHRvbiBzdHlsZXMuXG4qL1xuXG5idXR0b24sXG5bdHlwZT0nYnV0dG9uJ10sXG5bdHlwZT0ncmVzZXQnXSxcblt0eXBlPSdzdWJtaXQnXSB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogYnV0dG9uOyAvKiAxICovXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50OyAvKiAyICovXG4gIGJhY2tncm91bmQtaW1hZ2U6IG5vbmU7IC8qIDIgKi9cbn1cblxuLypcblVzZSB0aGUgbW9kZXJuIEZpcmVmb3ggZm9jdXMgc3R5bGUgZm9yIGFsbCBmb2N1c2FibGUgZWxlbWVudHMuXG4qL1xuXG46LW1vei1mb2N1c3Jpbmcge1xuICBvdXRsaW5lOiBhdXRvO1xufVxuXG4vKlxuUmVtb3ZlIHRoZSBhZGRpdGlvbmFsIFxcYDppbnZhbGlkXFxgIHN0eWxlcyBpbiBGaXJlZm94LiAoaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvZ2Vja28tZGV2L2Jsb2IvMmY5ZWFjZDlkM2Q5OTVjOTM3YjQyNTFhNTU1N2Q5NWQ0OTRjOWJlMS9sYXlvdXQvc3R5bGUvcmVzL2Zvcm1zLmNzcyNMNzI4LUw3MzcpXG4qL1xuXG46LW1vei11aS1pbnZhbGlkIHtcbiAgYm94LXNoYWRvdzogbm9uZTtcbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCB2ZXJ0aWNhbCBhbGlnbm1lbnQgaW4gQ2hyb21lIGFuZCBGaXJlZm94LlxuKi9cblxucHJvZ3Jlc3Mge1xuICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XG59XG5cbi8qXG5Db3JyZWN0IHRoZSBjdXJzb3Igc3R5bGUgb2YgaW5jcmVtZW50IGFuZCBkZWNyZW1lbnQgYnV0dG9ucyBpbiBTYWZhcmkuXG4qL1xuXG46Oi13ZWJraXQtaW5uZXItc3Bpbi1idXR0b24sXG46Oi13ZWJraXQtb3V0ZXItc3Bpbi1idXR0b24ge1xuICBoZWlnaHQ6IGF1dG87XG59XG5cbi8qXG4xLiBDb3JyZWN0IHRoZSBvZGQgYXBwZWFyYW5jZSBpbiBDaHJvbWUgYW5kIFNhZmFyaS5cbjIuIENvcnJlY3QgdGhlIG91dGxpbmUgc3R5bGUgaW4gU2FmYXJpLlxuKi9cblxuW3R5cGU9J3NlYXJjaCddIHtcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiB0ZXh0ZmllbGQ7IC8qIDEgKi9cbiAgb3V0bGluZS1vZmZzZXQ6IC0ycHg7IC8qIDIgKi9cbn1cblxuLypcblJlbW92ZSB0aGUgaW5uZXIgcGFkZGluZyBpbiBDaHJvbWUgYW5kIFNhZmFyaSBvbiBtYWNPUy5cbiovXG5cbjo6LXdlYmtpdC1zZWFyY2gtZGVjb3JhdGlvbiB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcbn1cblxuLypcbjEuIENvcnJlY3QgdGhlIGluYWJpbGl0eSB0byBzdHlsZSBjbGlja2FibGUgdHlwZXMgaW4gaU9TIGFuZCBTYWZhcmkuXG4yLiBDaGFuZ2UgZm9udCBwcm9wZXJ0aWVzIHRvIFxcYGluaGVyaXRcXGAgaW4gU2FmYXJpLlxuKi9cblxuOjotd2Via2l0LWZpbGUtdXBsb2FkLWJ1dHRvbiB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogYnV0dG9uOyAvKiAxICovXG4gIGZvbnQ6IGluaGVyaXQ7IC8qIDIgKi9cbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCBkaXNwbGF5IGluIENocm9tZSBhbmQgU2FmYXJpLlxuKi9cblxuc3VtbWFyeSB7XG4gIGRpc3BsYXk6IGxpc3QtaXRlbTtcbn1cblxuLypcblJlbW92ZXMgdGhlIGRlZmF1bHQgc3BhY2luZyBhbmQgYm9yZGVyIGZvciBhcHByb3ByaWF0ZSBlbGVtZW50cy5cbiovXG5cbmJsb2NrcXVvdGUsXG5kbCxcbmRkLFxuaDEsXG5oMixcbmgzLFxuaDQsXG5oNSxcbmg2LFxuaHIsXG5maWd1cmUsXG5wLFxucHJlIHtcbiAgbWFyZ2luOiAwO1xufVxuXG5maWVsZHNldCB7XG4gIG1hcmdpbjogMDtcbiAgcGFkZGluZzogMDtcbn1cblxubGVnZW5kIHtcbiAgcGFkZGluZzogMDtcbn1cblxub2wsXG51bCxcbm1lbnUge1xuICBsaXN0LXN0eWxlOiBub25lO1xuICBtYXJnaW46IDA7XG4gIHBhZGRpbmc6IDA7XG59XG5cbi8qXG5SZXNldCBkZWZhdWx0IHN0eWxpbmcgZm9yIGRpYWxvZ3MuXG4qL1xuZGlhbG9nIHtcbiAgcGFkZGluZzogMDtcbn1cblxuLypcblByZXZlbnQgcmVzaXppbmcgdGV4dGFyZWFzIGhvcml6b250YWxseSBieSBkZWZhdWx0LlxuKi9cblxudGV4dGFyZWEge1xuICByZXNpemU6IHZlcnRpY2FsO1xufVxuXG4vKlxuMS4gUmVzZXQgdGhlIGRlZmF1bHQgcGxhY2Vob2xkZXIgb3BhY2l0eSBpbiBGaXJlZm94LiAoaHR0cHM6Ly9naXRodWIuY29tL3RhaWx3aW5kbGFicy90YWlsd2luZGNzcy9pc3N1ZXMvMzMwMClcbjIuIFNldCB0aGUgZGVmYXVsdCBwbGFjZWhvbGRlciBjb2xvciB0byB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgZ3JheSA0MDAgY29sb3IuXG4qL1xuXG5pbnB1dDo6LW1vei1wbGFjZWhvbGRlciwgdGV4dGFyZWE6Oi1tb3otcGxhY2Vob2xkZXIge1xuICBvcGFjaXR5OiAxOyAvKiAxICovXG4gIGNvbG9yOiAjOWNhM2FmOyAvKiAyICovXG59XG5cbmlucHV0OjpwbGFjZWhvbGRlcixcbnRleHRhcmVhOjpwbGFjZWhvbGRlciB7XG4gIG9wYWNpdHk6IDE7IC8qIDEgKi9cbiAgY29sb3I6ICM5Y2EzYWY7IC8qIDIgKi9cbn1cblxuLypcblNldCB0aGUgZGVmYXVsdCBjdXJzb3IgZm9yIGJ1dHRvbnMuXG4qL1xuXG5idXR0b24sXG5bcm9sZT1cImJ1dHRvblwiXSB7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cblxuLypcbk1ha2Ugc3VyZSBkaXNhYmxlZCBidXR0b25zIGRvbid0IGdldCB0aGUgcG9pbnRlciBjdXJzb3IuXG4qL1xuOmRpc2FibGVkIHtcbiAgY3Vyc29yOiBkZWZhdWx0O1xufVxuXG4vKlxuMS4gTWFrZSByZXBsYWNlZCBlbGVtZW50cyBcXGBkaXNwbGF5OiBibG9ja1xcYCBieSBkZWZhdWx0LiAoaHR0cHM6Ly9naXRodWIuY29tL21vemRldnMvY3NzcmVtZWR5L2lzc3Vlcy8xNClcbjIuIEFkZCBcXGB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlXFxgIHRvIGFsaWduIHJlcGxhY2VkIGVsZW1lbnRzIG1vcmUgc2Vuc2libHkgYnkgZGVmYXVsdC4gKGh0dHBzOi8vZ2l0aHViLmNvbS9qZW5zaW1tb25zL2Nzc3JlbWVkeS9pc3N1ZXMvMTQjaXNzdWVjb21tZW50LTYzNDkzNDIxMClcbiAgIFRoaXMgY2FuIHRyaWdnZXIgYSBwb29ybHkgY29uc2lkZXJlZCBsaW50IGVycm9yIGluIHNvbWUgdG9vbHMgYnV0IGlzIGluY2x1ZGVkIGJ5IGRlc2lnbi5cbiovXG5cbmltZyxcbnN2ZyxcbnZpZGVvLFxuY2FudmFzLFxuYXVkaW8sXG5pZnJhbWUsXG5lbWJlZCxcbm9iamVjdCB7XG4gIGRpc3BsYXk6IGJsb2NrOyAvKiAxICovXG4gIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7IC8qIDIgKi9cbn1cblxuLypcbkNvbnN0cmFpbiBpbWFnZXMgYW5kIHZpZGVvcyB0byB0aGUgcGFyZW50IHdpZHRoIGFuZCBwcmVzZXJ2ZSB0aGVpciBpbnRyaW5zaWMgYXNwZWN0IHJhdGlvLiAoaHR0cHM6Ly9naXRodWIuY29tL21vemRldnMvY3NzcmVtZWR5L2lzc3Vlcy8xNClcbiovXG5cbmltZyxcbnZpZGVvIHtcbiAgbWF4LXdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IGF1dG87XG59XG5cbi8qIE1ha2UgZWxlbWVudHMgd2l0aCB0aGUgSFRNTCBoaWRkZW4gYXR0cmlidXRlIHN0YXkgaGlkZGVuIGJ5IGRlZmF1bHQgKi9cbltoaWRkZW5dIHtcbiAgZGlzcGxheTogbm9uZTtcbn1cblxuKiwgOjpiZWZvcmUsIDo6YWZ0ZXIge1xuICAtLXR3LWJvcmRlci1zcGFjaW5nLXg6IDA7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteTogMDtcbiAgLS10dy10cmFuc2xhdGUteDogMDtcbiAgLS10dy10cmFuc2xhdGUteTogMDtcbiAgLS10dy1yb3RhdGU6IDA7XG4gIC0tdHctc2tldy14OiAwO1xuICAtLXR3LXNrZXcteTogMDtcbiAgLS10dy1zY2FsZS14OiAxO1xuICAtLXR3LXNjYWxlLXk6IDE7XG4gIC0tdHctcGFuLXg6ICA7XG4gIC0tdHctcGFuLXk6ICA7XG4gIC0tdHctcGluY2gtem9vbTogIDtcbiAgLS10dy1zY3JvbGwtc25hcC1zdHJpY3RuZXNzOiBwcm94aW1pdHk7XG4gIC0tdHctZ3JhZGllbnQtZnJvbS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC12aWEtcG9zaXRpb246ICA7XG4gIC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb246ICA7XG4gIC0tdHctb3JkaW5hbDogIDtcbiAgLS10dy1zbGFzaGVkLXplcm86ICA7XG4gIC0tdHctbnVtZXJpYy1maWd1cmU6ICA7XG4gIC0tdHctbnVtZXJpYy1zcGFjaW5nOiAgO1xuICAtLXR3LW51bWVyaWMtZnJhY3Rpb246ICA7XG4gIC0tdHctcmluZy1pbnNldDogIDtcbiAgLS10dy1yaW5nLW9mZnNldC13aWR0aDogMHB4O1xuICAtLXR3LXJpbmctb2Zmc2V0LWNvbG9yOiAjZmZmO1xuICAtLXR3LXJpbmctY29sb3I6IHJnYig1OSAxMzAgMjQ2IC8gMC41KTtcbiAgLS10dy1yaW5nLW9mZnNldC1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1yaW5nLXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdy1jb2xvcmVkOiAwIDAgIzAwMDA7XG4gIC0tdHctYmx1cjogIDtcbiAgLS10dy1icmlnaHRuZXNzOiAgO1xuICAtLXR3LWNvbnRyYXN0OiAgO1xuICAtLXR3LWdyYXlzY2FsZTogIDtcbiAgLS10dy1odWUtcm90YXRlOiAgO1xuICAtLXR3LWludmVydDogIDtcbiAgLS10dy1zYXR1cmF0ZTogIDtcbiAgLS10dy1zZXBpYTogIDtcbiAgLS10dy1kcm9wLXNoYWRvdzogIDtcbiAgLS10dy1iYWNrZHJvcC1ibHVyOiAgO1xuICAtLXR3LWJhY2tkcm9wLWJyaWdodG5lc3M6ICA7XG4gIC0tdHctYmFja2Ryb3AtY29udHJhc3Q6ICA7XG4gIC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlOiAgO1xuICAtLXR3LWJhY2tkcm9wLWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaW52ZXJ0OiAgO1xuICAtLXR3LWJhY2tkcm9wLW9wYWNpdHk6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2F0dXJhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2VwaWE6ICA7XG59XG5cbjo6YmFja2Ryb3Age1xuICAtLXR3LWJvcmRlci1zcGFjaW5nLXg6IDA7XG4gIC0tdHctYm9yZGVyLXNwYWNpbmcteTogMDtcbiAgLS10dy10cmFuc2xhdGUteDogMDtcbiAgLS10dy10cmFuc2xhdGUteTogMDtcbiAgLS10dy1yb3RhdGU6IDA7XG4gIC0tdHctc2tldy14OiAwO1xuICAtLXR3LXNrZXcteTogMDtcbiAgLS10dy1zY2FsZS14OiAxO1xuICAtLXR3LXNjYWxlLXk6IDE7XG4gIC0tdHctcGFuLXg6ICA7XG4gIC0tdHctcGFuLXk6ICA7XG4gIC0tdHctcGluY2gtem9vbTogIDtcbiAgLS10dy1zY3JvbGwtc25hcC1zdHJpY3RuZXNzOiBwcm94aW1pdHk7XG4gIC0tdHctZ3JhZGllbnQtZnJvbS1wb3NpdGlvbjogIDtcbiAgLS10dy1ncmFkaWVudC12aWEtcG9zaXRpb246ICA7XG4gIC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb246ICA7XG4gIC0tdHctb3JkaW5hbDogIDtcbiAgLS10dy1zbGFzaGVkLXplcm86ICA7XG4gIC0tdHctbnVtZXJpYy1maWd1cmU6ICA7XG4gIC0tdHctbnVtZXJpYy1zcGFjaW5nOiAgO1xuICAtLXR3LW51bWVyaWMtZnJhY3Rpb246ICA7XG4gIC0tdHctcmluZy1pbnNldDogIDtcbiAgLS10dy1yaW5nLW9mZnNldC13aWR0aDogMHB4O1xuICAtLXR3LXJpbmctb2Zmc2V0LWNvbG9yOiAjZmZmO1xuICAtLXR3LXJpbmctY29sb3I6IHJnYig1OSAxMzAgMjQ2IC8gMC41KTtcbiAgLS10dy1yaW5nLW9mZnNldC1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1yaW5nLXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdzogMCAwICMwMDAwO1xuICAtLXR3LXNoYWRvdy1jb2xvcmVkOiAwIDAgIzAwMDA7XG4gIC0tdHctYmx1cjogIDtcbiAgLS10dy1icmlnaHRuZXNzOiAgO1xuICAtLXR3LWNvbnRyYXN0OiAgO1xuICAtLXR3LWdyYXlzY2FsZTogIDtcbiAgLS10dy1odWUtcm90YXRlOiAgO1xuICAtLXR3LWludmVydDogIDtcbiAgLS10dy1zYXR1cmF0ZTogIDtcbiAgLS10dy1zZXBpYTogIDtcbiAgLS10dy1kcm9wLXNoYWRvdzogIDtcbiAgLS10dy1iYWNrZHJvcC1ibHVyOiAgO1xuICAtLXR3LWJhY2tkcm9wLWJyaWdodG5lc3M6ICA7XG4gIC0tdHctYmFja2Ryb3AtY29udHJhc3Q6ICA7XG4gIC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlOiAgO1xuICAtLXR3LWJhY2tkcm9wLWh1ZS1yb3RhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3AtaW52ZXJ0OiAgO1xuICAtLXR3LWJhY2tkcm9wLW9wYWNpdHk6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2F0dXJhdGU6ICA7XG4gIC0tdHctYmFja2Ryb3Atc2VwaWE6ICA7XG59XG4uY29udGFpbmVyIHtcbiAgd2lkdGg6IDEwMCU7XG59XG5AbWVkaWEgKG1pbi13aWR0aDogNjQwcHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDY0MHB4O1xuICB9XG59XG5AbWVkaWEgKG1pbi13aWR0aDogNzY4cHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDc2OHB4O1xuICB9XG59XG5AbWVkaWEgKG1pbi13aWR0aDogMTAyNHB4KSB7XG5cbiAgLmNvbnRhaW5lciB7XG4gICAgbWF4LXdpZHRoOiAxMDI0cHg7XG4gIH1cbn1cbkBtZWRpYSAobWluLXdpZHRoOiAxMjgwcHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDEyODBweDtcbiAgfVxufVxuQG1lZGlhIChtaW4td2lkdGg6IDE1MzZweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogMTUzNnB4O1xuICB9XG59XG4ucG9pbnRlci1ldmVudHMtbm9uZSB7XG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuLnZpc2libGUge1xuICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xufVxuLmNvbGxhcHNlIHtcbiAgdmlzaWJpbGl0eTogY29sbGFwc2U7XG59XG4uZml4ZWQge1xuICBwb3NpdGlvbjogZml4ZWQ7XG59XG4uYWJzb2x1dGUge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG59XG4ucmVsYXRpdmUge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG59XG4uaW5zZXQtMCB7XG4gIGluc2V0OiAwcHg7XG59XG4ubGVmdC0wIHtcbiAgbGVmdDogMHB4O1xufVxuLnJpZ2h0LTAge1xuICByaWdodDogMHB4O1xufVxuLnRvcC0wIHtcbiAgdG9wOiAwcHg7XG59XG4uei0wIHtcbiAgei1pbmRleDogMDtcbn1cbi56LTEwIHtcbiAgei1pbmRleDogMTA7XG59XG4uei01MCB7XG4gIHotaW5kZXg6IDUwO1xufVxuLm0tNSB7XG4gIG1hcmdpbjogMS4yNXJlbTtcbn1cbi5tLTgge1xuICBtYXJnaW46IDJyZW07XG59XG4ubWwtMTAge1xuICBtYXJnaW4tbGVmdDogMi41cmVtO1xufVxuLm1sLTgge1xuICBtYXJnaW4tbGVmdDogMnJlbTtcbn1cbi5tdC00IHtcbiAgbWFyZ2luLXRvcDogMXJlbTtcbn1cbi5ibG9jayB7XG4gIGRpc3BsYXk6IGJsb2NrO1xufVxuLmZsZXgge1xuICBkaXNwbGF5OiBmbGV4O1xufVxuLnRhYmxlIHtcbiAgZGlzcGxheTogdGFibGU7XG59XG4uZ3JpZCB7XG4gIGRpc3BsYXk6IGdyaWQ7XG59XG4uY29udGVudHMge1xuICBkaXNwbGF5OiBjb250ZW50cztcbn1cbi5oaWRkZW4ge1xuICBkaXNwbGF5OiBub25lO1xufVxuLmgtMSB7XG4gIGhlaWdodDogMC4yNXJlbTtcbn1cbi5oLTFcXFxcLzUge1xuICBoZWlnaHQ6IDIwJTtcbn1cbi5oLTQge1xuICBoZWlnaHQ6IDFyZW07XG59XG4uaC00XFxcXC81IHtcbiAgaGVpZ2h0OiA4MCU7XG59XG4uaC00MCB7XG4gIGhlaWdodDogMTByZW07XG59XG4uaC02IHtcbiAgaGVpZ2h0OiAxLjVyZW07XG59XG4uaC02MCB7XG4gIGhlaWdodDogMTVyZW07XG59XG4uaC1tYXgge1xuICBoZWlnaHQ6IC1tb3otbWF4LWNvbnRlbnQ7XG4gIGhlaWdodDogbWF4LWNvbnRlbnQ7XG59XG4uaC1zY3JlZW4ge1xuICBoZWlnaHQ6IDEwMHZoO1xufVxuLm1pbi1oLXNjcmVlbiB7XG4gIG1pbi1oZWlnaHQ6IDEwMHZoO1xufVxuLnctMSB7XG4gIHdpZHRoOiAwLjI1cmVtO1xufVxuLnctMVxcXFwvMiB7XG4gIHdpZHRoOiA1MCU7XG59XG4udy00IHtcbiAgd2lkdGg6IDFyZW07XG59XG4udy00XFxcXC8xMiB7XG4gIHdpZHRoOiAzMy4zMzMzMzMlO1xufVxuLnctNiB7XG4gIHdpZHRoOiAxLjVyZW07XG59XG4udy04MCB7XG4gIHdpZHRoOiAyMHJlbTtcbn1cbi53LWF1dG8ge1xuICB3aWR0aDogYXV0bztcbn1cbi53LWZ1bGwge1xuICB3aWR0aDogMTAwJTtcbn1cbi53LW1pbiB7XG4gIHdpZHRoOiAtbW96LW1pbi1jb250ZW50O1xuICB3aWR0aDogbWluLWNvbnRlbnQ7XG59XG4udy1zY3JlZW4ge1xuICB3aWR0aDogMTAwdnc7XG59XG4ubWluLXctNDQge1xuICBtaW4td2lkdGg6IDExcmVtO1xufVxuLm1pbi13LWZ1bGwge1xuICBtaW4td2lkdGg6IDEwMCU7XG59XG4ubWluLXctbWF4IHtcbiAgbWluLXdpZHRoOiAtbW96LW1heC1jb250ZW50O1xuICBtaW4td2lkdGg6IG1heC1jb250ZW50O1xufVxuLm1pbi13LW1pbiB7XG4gIG1pbi13aWR0aDogLW1vei1taW4tY29udGVudDtcbiAgbWluLXdpZHRoOiBtaW4tY29udGVudDtcbn1cbi5mbGV4LTEge1xuICBmbGV4OiAxIDEgMCU7XG59XG4uZmxleC1ub25lIHtcbiAgZmxleDogbm9uZTtcbn1cbi5mbGV4LWdyb3cge1xuICBmbGV4LWdyb3c6IDE7XG59XG4uZmxleC1ncm93LTAge1xuICBmbGV4LWdyb3c6IDA7XG59XG4uYm9yZGVyLWNvbGxhcHNlIHtcbiAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTtcbn1cbi50cmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSh2YXIoLS10dy10cmFuc2xhdGUteCksIHZhcigtLXR3LXRyYW5zbGF0ZS15KSkgcm90YXRlKHZhcigtLXR3LXJvdGF0ZSkpIHNrZXdYKHZhcigtLXR3LXNrZXcteCkpIHNrZXdZKHZhcigtLXR3LXNrZXcteSkpIHNjYWxlWCh2YXIoLS10dy1zY2FsZS14KSkgc2NhbGVZKHZhcigtLXR3LXNjYWxlLXkpKTtcbn1cbi5jdXJzb3ItZGVmYXVsdCB7XG4gIGN1cnNvcjogZGVmYXVsdDtcbn1cbi5jdXJzb3ItaGVscCB7XG4gIGN1cnNvcjogaGVscDtcbn1cbi5jdXJzb3ItcG9pbnRlciB7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5jdXJzb3ItdGV4dCB7XG4gIGN1cnNvcjogdGV4dDtcbn1cbi5yZXNpemUge1xuICByZXNpemU6IGJvdGg7XG59XG4uYXV0by1yb3dzLW1pbiB7XG4gIGdyaWQtYXV0by1yb3dzOiBtaW4tY29udGVudDtcbn1cbi5ncmlkLWNvbHMtMTEge1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgxMSwgbWlubWF4KDAsIDFmcikpO1xufVxuLmZsZXgtcm93IHtcbiAgZmxleC1kaXJlY3Rpb246IHJvdztcbn1cbi5mbGV4LWNvbCB7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG59XG4uY29udGVudC1jZW50ZXIge1xuICBhbGlnbi1jb250ZW50OiBjZW50ZXI7XG59XG4uaXRlbXMtY2VudGVyIHtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cbi5qdXN0aWZ5LXN0YXJ0IHtcbiAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0O1xufVxuLmp1c3RpZnktY2VudGVyIHtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG59XG4uanVzdGlmeS1iZXR3ZWVuIHtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xufVxuLmp1c3RpZnktYXJvdW5kIHtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1hcm91bmQ7XG59XG4uZ2FwLTEge1xuICBnYXA6IDAuMjVyZW07XG59XG4uZ2FwLTEwIHtcbiAgZ2FwOiAyLjVyZW07XG59XG4uZ2FwLTIge1xuICBnYXA6IDAuNXJlbTtcbn1cbi5nYXAtNiB7XG4gIGdhcDogMS41cmVtO1xufVxuLnNlbGYtY2VudGVyIHtcbiAgYWxpZ24tc2VsZjogY2VudGVyO1xufVxuLm92ZXJmbG93LWF1dG8ge1xuICBvdmVyZmxvdzogYXV0bztcbn1cbi5vdmVyc2Nyb2xsLW5vbmUge1xuICBvdmVyc2Nyb2xsLWJlaGF2aW9yOiBub25lO1xufVxuLnJvdW5kZWQtZnVsbCB7XG4gIGJvcmRlci1yYWRpdXM6IDk5OTlweDtcbn1cbi5yb3VuZGVkLW1kIHtcbiAgYm9yZGVyLXJhZGl1czogMC4zNzVyZW07XG59XG4ucm91bmRlZC14bCB7XG4gIGJvcmRlci1yYWRpdXM6IDAuNzVyZW07XG59XG4ucm91bmRlZC10LW1kIHtcbiAgYm9yZGVyLXRvcC1sZWZ0LXJhZGl1czogMC4zNzVyZW07XG4gIGJvcmRlci10b3AtcmlnaHQtcmFkaXVzOiAwLjM3NXJlbTtcbn1cbi5yb3VuZGVkLWJsLW1kIHtcbiAgYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1czogMC4zNzVyZW07XG59XG4ucm91bmRlZC1ici1tZCB7XG4gIGJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzOiAwLjM3NXJlbTtcbn1cbi5ib3JkZXIge1xuICBib3JkZXItd2lkdGg6IDFweDtcbn1cbi5ib3JkZXItMiB7XG4gIGJvcmRlci13aWR0aDogMnB4O1xufVxuLmJvcmRlci1zb2xpZCB7XG4gIGJvcmRlci1zdHlsZTogc29saWQ7XG59XG4uYm9yZGVyLWJsdWUtODAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMzAgNjQgMTc1IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItZ3JheS0yMDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigyMjkgMjMxIDIzNSAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYm9yZGVyLWdyYXktNjAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoNzUgODUgOTkgLyB2YXIoLS10dy1ib3JkZXItb3BhY2l0eSkpO1xufVxuLmJvcmRlci1ncmF5LTgwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDMxIDQxIDU1IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItZ3JlZW4tNjAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMjIgMTYzIDc0IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItb3JhbmdlLTQwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDI1MSAxNDYgNjAgLyB2YXIoLS10dy1ib3JkZXItb3BhY2l0eSkpO1xufVxuLmJvcmRlci1yZWQtNzAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMTg1IDI4IDI4IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItdHJhbnNwYXJlbnQge1xuICBib3JkZXItY29sb3I6IHRyYW5zcGFyZW50O1xufVxuLmJnLWdyYXktMTAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjQzIDI0NCAyNDYgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS0yMDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyMjkgMjMxIDIzNSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1ncmF5LTQwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDE1NiAxNjMgMTc1IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWdyYXktNTAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTA3IDExNCAxMjggLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS02MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYig3NSA4NSA5OSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1ncmF5LTcwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDU1IDY1IDgxIC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWdyYXktODAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMzEgNDEgNTUgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS05MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigxNyAyNCAzOSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1saW1lLTUwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDEzMiAyMDQgMjIgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctbGltZS02MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigxMDEgMTYzIDEzIC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWxpbWUtNzAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoNzcgMTI0IDE1IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLW9yYW5nZS0zMDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyNTMgMTg2IDExNiAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1vcmFuZ2UtNDAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjUxIDE0NiA2MCAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1vcmFuZ2UtNjAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjM0IDg4IDEyIC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLXJlZC02MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyMjAgMzggMzggLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctcmVkLTcwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDE4NSAyOCAyOCAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1yZWQtODAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTUzIDI3IDI3IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLXNreS03MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigzIDEwNSAxNjEgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctc2xhdGUtNzAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoNTEgNjUgODUgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctc2xhdGUtODAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMzAgNDEgNTkgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctc2xhdGUtOTAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTUgMjMgNDIgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctdHJhbnNwYXJlbnQge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbn1cbi5iZy1vcGFjaXR5LTAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDA7XG59XG4uYmctb3BhY2l0eS0xMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMC4xO1xufVxuLmJnLW9wYWNpdHktMjAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDAuMjtcbn1cbi5iZy1vcGFjaXR5LTI1IHtcbiAgLS10dy1iZy1vcGFjaXR5OiAwLjI1O1xufVxuLmJnLW9wYWNpdHktMzAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDAuMztcbn1cbi5iZy1vcGFjaXR5LTQwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAwLjQ7XG59XG4uYmctb3BhY2l0eS01MCB7XG4gIC0tdHctYmctb3BhY2l0eTogMC41O1xufVxuLmJnLW9wYWNpdHktNjAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDAuNjtcbn1cbi5iZy1vcGFjaXR5LTcwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAwLjc7XG59XG4uYmctb3BhY2l0eS03NSB7XG4gIC0tdHctYmctb3BhY2l0eTogMC43NTtcbn1cbi5iZy1vcGFjaXR5LTgwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAwLjg7XG59XG4uYmctZ3JhZGllbnQtdG8tYmwge1xuICBiYWNrZ3JvdW5kLWltYWdlOiBsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tIGxlZnQsIHZhcigtLXR3LWdyYWRpZW50LXN0b3BzKSk7XG59XG4uYmctZ3JhZGllbnQtdG8tYnIge1xuICBiYWNrZ3JvdW5kLWltYWdlOiBsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tIHJpZ2h0LCB2YXIoLS10dy1ncmFkaWVudC1zdG9wcykpO1xufVxuLmJnLWdyYWRpZW50LXRvLXRyIHtcbiAgYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KHRvIHRvcCByaWdodCwgdmFyKC0tdHctZ3JhZGllbnQtc3RvcHMpKTtcbn1cbi5mcm9tLWdyYXktMzAwIHtcbiAgLS10dy1ncmFkaWVudC1mcm9tOiAjZDFkNWRiIHZhcigtLXR3LWdyYWRpZW50LWZyb20tcG9zaXRpb24pO1xuICAtLXR3LWdyYWRpZW50LXRvOiByZ2IoMjA5IDIxMyAyMTkgLyAwKSB2YXIoLS10dy1ncmFkaWVudC10by1wb3NpdGlvbik7XG4gIC0tdHctZ3JhZGllbnQtc3RvcHM6IHZhcigtLXR3LWdyYWRpZW50LWZyb20pLCB2YXIoLS10dy1ncmFkaWVudC10byk7XG59XG4uZnJvbS1ncmF5LTQwMCB7XG4gIC0tdHctZ3JhZGllbnQtZnJvbTogIzljYTNhZiB2YXIoLS10dy1ncmFkaWVudC1mcm9tLXBvc2l0aW9uKTtcbiAgLS10dy1ncmFkaWVudC10bzogcmdiKDE1NiAxNjMgMTc1IC8gMCkgdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xuICAtLXR3LWdyYWRpZW50LXN0b3BzOiB2YXIoLS10dy1ncmFkaWVudC1mcm9tKSwgdmFyKC0tdHctZ3JhZGllbnQtdG8pO1xufVxuLmZyb20tc2xhdGUtMjAwIHtcbiAgLS10dy1ncmFkaWVudC1mcm9tOiAjZTJlOGYwIHZhcigtLXR3LWdyYWRpZW50LWZyb20tcG9zaXRpb24pO1xuICAtLXR3LWdyYWRpZW50LXRvOiByZ2IoMjI2IDIzMiAyNDAgLyAwKSB2YXIoLS10dy1ncmFkaWVudC10by1wb3NpdGlvbik7XG4gIC0tdHctZ3JhZGllbnQtc3RvcHM6IHZhcigtLXR3LWdyYWRpZW50LWZyb20pLCB2YXIoLS10dy1ncmFkaWVudC10byk7XG59XG4uZnJvbS1zbGF0ZS00MDAge1xuICAtLXR3LWdyYWRpZW50LWZyb206ICM5NGEzYjggdmFyKC0tdHctZ3JhZGllbnQtZnJvbS1wb3NpdGlvbik7XG4gIC0tdHctZ3JhZGllbnQtdG86IHJnYigxNDggMTYzIDE4NCAvIDApIHZhcigtLXR3LWdyYWRpZW50LXRvLXBvc2l0aW9uKTtcbiAgLS10dy1ncmFkaWVudC1zdG9wczogdmFyKC0tdHctZ3JhZGllbnQtZnJvbSksIHZhcigtLXR3LWdyYWRpZW50LXRvKTtcbn1cbi5mcm9tLXNsYXRlLTUwMCB7XG4gIC0tdHctZ3JhZGllbnQtZnJvbTogIzY0NzQ4YiB2YXIoLS10dy1ncmFkaWVudC1mcm9tLXBvc2l0aW9uKTtcbiAgLS10dy1ncmFkaWVudC10bzogcmdiKDEwMCAxMTYgMTM5IC8gMCkgdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xuICAtLXR3LWdyYWRpZW50LXN0b3BzOiB2YXIoLS10dy1ncmFkaWVudC1mcm9tKSwgdmFyKC0tdHctZ3JhZGllbnQtdG8pO1xufVxuLmZyb20tc2xhdGUtNzAwIHtcbiAgLS10dy1ncmFkaWVudC1mcm9tOiAjMzM0MTU1IHZhcigtLXR3LWdyYWRpZW50LWZyb20tcG9zaXRpb24pO1xuICAtLXR3LWdyYWRpZW50LXRvOiByZ2IoNTEgNjUgODUgLyAwKSB2YXIoLS10dy1ncmFkaWVudC10by1wb3NpdGlvbik7XG4gIC0tdHctZ3JhZGllbnQtc3RvcHM6IHZhcigtLXR3LWdyYWRpZW50LWZyb20pLCB2YXIoLS10dy1ncmFkaWVudC10byk7XG59XG4udG8tZ3JheS0xMDAge1xuICAtLXR3LWdyYWRpZW50LXRvOiAjZjNmNGY2IHZhcigtLXR3LWdyYWRpZW50LXRvLXBvc2l0aW9uKTtcbn1cbi50by1ncmF5LTIwMCB7XG4gIC0tdHctZ3JhZGllbnQtdG86ICNlNWU3ZWIgdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xufVxuLnRvLXNsYXRlLTIwMCB7XG4gIC0tdHctZ3JhZGllbnQtdG86ICNlMmU4ZjAgdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xufVxuLnRvLXNsYXRlLTQwMCB7XG4gIC0tdHctZ3JhZGllbnQtdG86ICM5NGEzYjggdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xufVxuLnRvLXNsYXRlLTUwMCB7XG4gIC0tdHctZ3JhZGllbnQtdG86ICM2NDc0OGIgdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xufVxuLnAtMSB7XG4gIHBhZGRpbmc6IDAuMjVyZW07XG59XG4ucC0xMCB7XG4gIHBhZGRpbmc6IDIuNXJlbTtcbn1cbi5wLTIge1xuICBwYWRkaW5nOiAwLjVyZW07XG59XG4ucC00IHtcbiAgcGFkZGluZzogMXJlbTtcbn1cbi5wLTYge1xuICBwYWRkaW5nOiAxLjVyZW07XG59XG4ucHgtMyB7XG4gIHBhZGRpbmctbGVmdDogMC43NXJlbTtcbiAgcGFkZGluZy1yaWdodDogMC43NXJlbTtcbn1cbi5weC00IHtcbiAgcGFkZGluZy1sZWZ0OiAxcmVtO1xuICBwYWRkaW5nLXJpZ2h0OiAxcmVtO1xufVxuLnB4LTYge1xuICBwYWRkaW5nLWxlZnQ6IDEuNXJlbTtcbiAgcGFkZGluZy1yaWdodDogMS41cmVtO1xufVxuLnB5LTEge1xuICBwYWRkaW5nLXRvcDogMC4yNXJlbTtcbiAgcGFkZGluZy1ib3R0b206IDAuMjVyZW07XG59XG4ucHktMiB7XG4gIHBhZGRpbmctdG9wOiAwLjVyZW07XG4gIHBhZGRpbmctYm90dG9tOiAwLjVyZW07XG59XG4ucHktNCB7XG4gIHBhZGRpbmctdG9wOiAxcmVtO1xuICBwYWRkaW5nLWJvdHRvbTogMXJlbTtcbn1cbi5wbC0yIHtcbiAgcGFkZGluZy1sZWZ0OiAwLjVyZW07XG59XG4ucGwtMyB7XG4gIHBhZGRpbmctbGVmdDogMC43NXJlbTtcbn1cbi5wbC01IHtcbiAgcGFkZGluZy1sZWZ0OiAxLjI1cmVtO1xufVxuLnBsLTgge1xuICBwYWRkaW5nLWxlZnQ6IDJyZW07XG59XG4udGV4dC1jZW50ZXIge1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG59XG4uZm9udC1tb25vIHtcbiAgZm9udC1mYW1pbHk6IHVpLW1vbm9zcGFjZSwgU0ZNb25vLVJlZ3VsYXIsIE1lbmxvLCBNb25hY28sIENvbnNvbGFzLCBcIkxpYmVyYXRpb24gTW9ub1wiLCBcIkNvdXJpZXIgTmV3XCIsIG1vbm9zcGFjZTtcbn1cbi50ZXh0LTJ4bCB7XG4gIGZvbnQtc2l6ZTogMS41cmVtO1xuICBsaW5lLWhlaWdodDogMnJlbTtcbn1cbi50ZXh0LTN4bCB7XG4gIGZvbnQtc2l6ZTogMS44NzVyZW07XG4gIGxpbmUtaGVpZ2h0OiAyLjI1cmVtO1xufVxuLnRleHQtbGcge1xuICBmb250LXNpemU6IDEuMTI1cmVtO1xuICBsaW5lLWhlaWdodDogMS43NXJlbTtcbn1cbi50ZXh0LXNtIHtcbiAgZm9udC1zaXplOiAwLjg3NXJlbTtcbiAgbGluZS1oZWlnaHQ6IDEuMjVyZW07XG59XG4uZm9udC1ibGFjayB7XG4gIGZvbnQtd2VpZ2h0OiA5MDA7XG59XG4uZm9udC1ib2xkIHtcbiAgZm9udC13ZWlnaHQ6IDcwMDtcbn1cbi5mb250LXNlbWlib2xkIHtcbiAgZm9udC13ZWlnaHQ6IDYwMDtcbn1cbi50cmFja2luZy13aWRlIHtcbiAgbGV0dGVyLXNwYWNpbmc6IDAuMDI1ZW07XG59XG4udHJhY2tpbmctd2lkZXIge1xuICBsZXR0ZXItc3BhY2luZzogMC4wNWVtO1xufVxuLnRyYWNraW5nLXdpZGVzdCB7XG4gIGxldHRlci1zcGFjaW5nOiAwLjFlbTtcbn1cbi50ZXh0LWdyYXktMTAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMjQzIDI0NCAyNDYgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LWdyYXktMjAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMjI5IDIzMSAyMzUgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LWdyYXktNjAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoNzUgODUgOTkgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LWdyYXktNzAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoNTUgNjUgODEgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LWdyYXktODAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMzEgNDEgNTUgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LWxpbWUtNjAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTAxIDE2MyAxMyAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtbGltZS03MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYig3NyAxMjQgMTUgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LWxpbWUtODAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoNjMgOTggMTggLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LW9yYW5nZS01MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigyNDkgMTE1IDIyIC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1vcmFuZ2UtNjAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMjM0IDg4IDEyIC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1vcmFuZ2UtODAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTU0IDUyIDE4IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1yZWQtNTAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMjM5IDY4IDY4IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1yZWQtNzAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTg1IDI4IDI4IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1yZWQtODAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTUzIDI3IDI3IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1yb3NlLTcwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDE5MCAxOCA2MCAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtc2t5LTYwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDIgMTMyIDE5OSAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtc2xhdGUtNzAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoNTEgNjUgODUgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXRlYWwtOTAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTkgNzggNzQgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi51bmRlcmxpbmUge1xuICB0ZXh0LWRlY29yYXRpb24tbGluZTogdW5kZXJsaW5lO1xufVxuLm9wYWNpdHktMTAwIHtcbiAgb3BhY2l0eTogMTtcbn1cbi5zaGFkb3ctbGcge1xuICAtLXR3LXNoYWRvdzogMCAxMHB4IDE1cHggLTNweCByZ2IoMCAwIDAgLyAwLjEpLCAwIDRweCA2cHggLTRweCByZ2IoMCAwIDAgLyAwLjEpO1xuICAtLXR3LXNoYWRvdy1jb2xvcmVkOiAwIDEwcHggMTVweCAtM3B4IHZhcigtLXR3LXNoYWRvdy1jb2xvciksIDAgNHB4IDZweCAtNHB4IHZhcigtLXR3LXNoYWRvdy1jb2xvcik7XG4gIGJveC1zaGFkb3c6IHZhcigtLXR3LXJpbmctb2Zmc2V0LXNoYWRvdywgMCAwICMwMDAwKSwgdmFyKC0tdHctcmluZy1zaGFkb3csIDAgMCAjMDAwMCksIHZhcigtLXR3LXNoYWRvdyk7XG59XG4uc2hhZG93LXNtIHtcbiAgLS10dy1zaGFkb3c6IDAgMXB4IDJweCAwIHJnYigwIDAgMCAvIDAuMDUpO1xuICAtLXR3LXNoYWRvdy1jb2xvcmVkOiAwIDFweCAycHggMCB2YXIoLS10dy1zaGFkb3ctY29sb3IpO1xuICBib3gtc2hhZG93OiB2YXIoLS10dy1yaW5nLW9mZnNldC1zaGFkb3csIDAgMCAjMDAwMCksIHZhcigtLXR3LXJpbmctc2hhZG93LCAwIDAgIzAwMDApLCB2YXIoLS10dy1zaGFkb3cpO1xufVxuLm91dGxpbmUtbm9uZSB7XG4gIG91dGxpbmU6IDJweCBzb2xpZCB0cmFuc3BhcmVudDtcbiAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbn1cbi5vdXRsaW5lIHtcbiAgb3V0bGluZS1zdHlsZTogc29saWQ7XG59XG4uYmx1ciB7XG4gIC0tdHctYmx1cjogYmx1cig4cHgpO1xuICBmaWx0ZXI6IHZhcigtLXR3LWJsdXIpIHZhcigtLXR3LWJyaWdodG5lc3MpIHZhcigtLXR3LWNvbnRyYXN0KSB2YXIoLS10dy1ncmF5c2NhbGUpIHZhcigtLXR3LWh1ZS1yb3RhdGUpIHZhcigtLXR3LWludmVydCkgdmFyKC0tdHctc2F0dXJhdGUpIHZhcigtLXR3LXNlcGlhKSB2YXIoLS10dy1kcm9wLXNoYWRvdyk7XG59XG4uYmx1ci1zbSB7XG4gIC0tdHctYmx1cjogYmx1cig0cHgpO1xuICBmaWx0ZXI6IHZhcigtLXR3LWJsdXIpIHZhcigtLXR3LWJyaWdodG5lc3MpIHZhcigtLXR3LWNvbnRyYXN0KSB2YXIoLS10dy1ncmF5c2NhbGUpIHZhcigtLXR3LWh1ZS1yb3RhdGUpIHZhcigtLXR3LWludmVydCkgdmFyKC0tdHctc2F0dXJhdGUpIHZhcigtLXR3LXNlcGlhKSB2YXIoLS10dy1kcm9wLXNoYWRvdyk7XG59XG4uZmlsdGVyIHtcbiAgZmlsdGVyOiB2YXIoLS10dy1ibHVyKSB2YXIoLS10dy1icmlnaHRuZXNzKSB2YXIoLS10dy1jb250cmFzdCkgdmFyKC0tdHctZ3JheXNjYWxlKSB2YXIoLS10dy1odWUtcm90YXRlKSB2YXIoLS10dy1pbnZlcnQpIHZhcigtLXR3LXNhdHVyYXRlKSB2YXIoLS10dy1zZXBpYSkgdmFyKC0tdHctZHJvcC1zaGFkb3cpO1xufVxuLmJhY2tkcm9wLWJsdXItbWQge1xuICAtLXR3LWJhY2tkcm9wLWJsdXI6IGJsdXIoMTJweCk7XG4gIC13ZWJraXQtYmFja2Ryb3AtZmlsdGVyOiB2YXIoLS10dy1iYWNrZHJvcC1ibHVyKSB2YXIoLS10dy1iYWNrZHJvcC1icmlnaHRuZXNzKSB2YXIoLS10dy1iYWNrZHJvcC1jb250cmFzdCkgdmFyKC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlKSB2YXIoLS10dy1iYWNrZHJvcC1odWUtcm90YXRlKSB2YXIoLS10dy1iYWNrZHJvcC1pbnZlcnQpIHZhcigtLXR3LWJhY2tkcm9wLW9wYWNpdHkpIHZhcigtLXR3LWJhY2tkcm9wLXNhdHVyYXRlKSB2YXIoLS10dy1iYWNrZHJvcC1zZXBpYSk7XG4gICAgICAgICAgYmFja2Ryb3AtZmlsdGVyOiB2YXIoLS10dy1iYWNrZHJvcC1ibHVyKSB2YXIoLS10dy1iYWNrZHJvcC1icmlnaHRuZXNzKSB2YXIoLS10dy1iYWNrZHJvcC1jb250cmFzdCkgdmFyKC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlKSB2YXIoLS10dy1iYWNrZHJvcC1odWUtcm90YXRlKSB2YXIoLS10dy1iYWNrZHJvcC1pbnZlcnQpIHZhcigtLXR3LWJhY2tkcm9wLW9wYWNpdHkpIHZhcigtLXR3LWJhY2tkcm9wLXNhdHVyYXRlKSB2YXIoLS10dy1iYWNrZHJvcC1zZXBpYSk7XG59XG4uYmFja2Ryb3AtYmx1ci1zbSB7XG4gIC0tdHctYmFja2Ryb3AtYmx1cjogYmx1cig0cHgpO1xuICAtd2Via2l0LWJhY2tkcm9wLWZpbHRlcjogdmFyKC0tdHctYmFja2Ryb3AtYmx1cikgdmFyKC0tdHctYmFja2Ryb3AtYnJpZ2h0bmVzcykgdmFyKC0tdHctYmFja2Ryb3AtY29udHJhc3QpIHZhcigtLXR3LWJhY2tkcm9wLWdyYXlzY2FsZSkgdmFyKC0tdHctYmFja2Ryb3AtaHVlLXJvdGF0ZSkgdmFyKC0tdHctYmFja2Ryb3AtaW52ZXJ0KSB2YXIoLS10dy1iYWNrZHJvcC1vcGFjaXR5KSB2YXIoLS10dy1iYWNrZHJvcC1zYXR1cmF0ZSkgdmFyKC0tdHctYmFja2Ryb3Atc2VwaWEpO1xuICAgICAgICAgIGJhY2tkcm9wLWZpbHRlcjogdmFyKC0tdHctYmFja2Ryb3AtYmx1cikgdmFyKC0tdHctYmFja2Ryb3AtYnJpZ2h0bmVzcykgdmFyKC0tdHctYmFja2Ryb3AtY29udHJhc3QpIHZhcigtLXR3LWJhY2tkcm9wLWdyYXlzY2FsZSkgdmFyKC0tdHctYmFja2Ryb3AtaHVlLXJvdGF0ZSkgdmFyKC0tdHctYmFja2Ryb3AtaW52ZXJ0KSB2YXIoLS10dy1iYWNrZHJvcC1vcGFjaXR5KSB2YXIoLS10dy1iYWNrZHJvcC1zYXR1cmF0ZSkgdmFyKC0tdHctYmFja2Ryb3Atc2VwaWEpO1xufVxuLmJhY2tkcm9wLWZpbHRlciB7XG4gIC13ZWJraXQtYmFja2Ryb3AtZmlsdGVyOiB2YXIoLS10dy1iYWNrZHJvcC1ibHVyKSB2YXIoLS10dy1iYWNrZHJvcC1icmlnaHRuZXNzKSB2YXIoLS10dy1iYWNrZHJvcC1jb250cmFzdCkgdmFyKC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlKSB2YXIoLS10dy1iYWNrZHJvcC1odWUtcm90YXRlKSB2YXIoLS10dy1iYWNrZHJvcC1pbnZlcnQpIHZhcigtLXR3LWJhY2tkcm9wLW9wYWNpdHkpIHZhcigtLXR3LWJhY2tkcm9wLXNhdHVyYXRlKSB2YXIoLS10dy1iYWNrZHJvcC1zZXBpYSk7XG4gICAgICAgICAgYmFja2Ryb3AtZmlsdGVyOiB2YXIoLS10dy1iYWNrZHJvcC1ibHVyKSB2YXIoLS10dy1iYWNrZHJvcC1icmlnaHRuZXNzKSB2YXIoLS10dy1iYWNrZHJvcC1jb250cmFzdCkgdmFyKC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlKSB2YXIoLS10dy1iYWNrZHJvcC1odWUtcm90YXRlKSB2YXIoLS10dy1iYWNrZHJvcC1pbnZlcnQpIHZhcigtLXR3LWJhY2tkcm9wLW9wYWNpdHkpIHZhcigtLXR3LWJhY2tkcm9wLXNhdHVyYXRlKSB2YXIoLS10dy1iYWNrZHJvcC1zZXBpYSk7XG59XG5cbi5uYW51bS1nb3RoaWMtY29kaW5nLXJlZ3VsYXIge1xuICBmb250LWZhbWlseTogXCJOYW51bSBHb3RoaWMgQ29kaW5nXCIsIG1vbm9zcGFjZTtcbiAgZm9udC13ZWlnaHQ6IDQwMDtcbiAgZm9udC1zdHlsZTogbm9ybWFsO1xufVxuXG4ubmFudW0tZ290aGljLWNvZGluZy1ib2xkIHtcbiAgZm9udC1mYW1pbHk6IFwiTmFudW0gR290aGljIENvZGluZ1wiLCBtb25vc3BhY2U7XG4gIGZvbnQtd2VpZ2h0OiA3MDA7XG4gIGZvbnQtc3R5bGU6IG5vcm1hbDtcbn1cblxuLmhvdmVyXFxcXDpib3JkZXItZ3JheS04MDA6aG92ZXIge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigzMSA0MSA1NSAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG5cbi5ob3ZlclxcXFw6YmctZ3JheS0yMDA6aG92ZXIge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyMjkgMjMxIDIzNSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cblxuLmhvdmVyXFxcXDpiZy1vcmFuZ2UtNTAwOmhvdmVyIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjQ5IDExNSAyMiAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cblxuLmhvdmVyXFxcXDp0ZXh0LWdyYXktODAwOmhvdmVyIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMzEgNDEgNTUgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cblxuLmZvY3VzXFxcXDpib3JkZXItMjpmb2N1cyB7XG4gIGJvcmRlci13aWR0aDogMnB4O1xufVxuXG4uZm9jdXNcXFxcOmJvcmRlci1ncmF5LTIwMDpmb2N1cyB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDIyOSAyMzEgMjM1IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cblxuLmZvY3VzXFxcXDpyaW5nLTA6Zm9jdXMge1xuICAtLXR3LXJpbmctb2Zmc2V0LXNoYWRvdzogdmFyKC0tdHctcmluZy1pbnNldCkgMCAwIDAgdmFyKC0tdHctcmluZy1vZmZzZXQtd2lkdGgpIHZhcigtLXR3LXJpbmctb2Zmc2V0LWNvbG9yKTtcbiAgLS10dy1yaW5nLXNoYWRvdzogdmFyKC0tdHctcmluZy1pbnNldCkgMCAwIDAgY2FsYygwcHggKyB2YXIoLS10dy1yaW5nLW9mZnNldC13aWR0aCkpIHZhcigtLXR3LXJpbmctY29sb3IpO1xuICBib3gtc2hhZG93OiB2YXIoLS10dy1yaW5nLW9mZnNldC1zaGFkb3cpLCB2YXIoLS10dy1yaW5nLXNoYWRvdyksIHZhcigtLXR3LXNoYWRvdywgMCAwICMwMDAwKTtcbn1cbmAsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL3N0eWxlcy5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUE7O0NBQWMsQ0FBZDs7O0NBQWM7O0FBQWQ7OztFQUFBLHNCQUFjLEVBQWQsTUFBYztFQUFkLGVBQWMsRUFBZCxNQUFjO0VBQWQsbUJBQWMsRUFBZCxNQUFjO0VBQWQscUJBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7O0VBQUEsZ0JBQWM7QUFBQTs7QUFBZDs7Ozs7Ozs7Q0FBYzs7QUFBZDs7RUFBQSxnQkFBYyxFQUFkLE1BQWM7RUFBZCw4QkFBYyxFQUFkLE1BQWM7RUFBZCxnQkFBYyxFQUFkLE1BQWM7RUFBZCxjQUFjO0tBQWQsV0FBYyxFQUFkLE1BQWM7RUFBZCwrSEFBYyxFQUFkLE1BQWM7RUFBZCw2QkFBYyxFQUFkLE1BQWM7RUFBZCwrQkFBYyxFQUFkLE1BQWM7RUFBZCx3Q0FBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7O0NBQWM7O0FBQWQ7RUFBQSxTQUFjLEVBQWQsTUFBYztFQUFkLG9CQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOzs7O0NBQWM7O0FBQWQ7RUFBQSxTQUFjLEVBQWQsTUFBYztFQUFkLGNBQWMsRUFBZCxNQUFjO0VBQWQscUJBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7RUFBQSx5Q0FBYztVQUFkLGlDQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7Ozs7OztFQUFBLGtCQUFjO0VBQWQsb0JBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLGNBQWM7RUFBZCx3QkFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkOztFQUFBLG1CQUFjO0FBQUE7O0FBQWQ7Ozs7O0NBQWM7O0FBQWQ7Ozs7RUFBQSwrR0FBYyxFQUFkLE1BQWM7RUFBZCw2QkFBYyxFQUFkLE1BQWM7RUFBZCwrQkFBYyxFQUFkLE1BQWM7RUFBZCxjQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEsY0FBYztBQUFBOztBQUFkOztDQUFjOztBQUFkOztFQUFBLGNBQWM7RUFBZCxjQUFjO0VBQWQsa0JBQWM7RUFBZCx3QkFBYztBQUFBOztBQUFkO0VBQUEsZUFBYztBQUFBOztBQUFkO0VBQUEsV0FBYztBQUFBOztBQUFkOzs7O0NBQWM7O0FBQWQ7RUFBQSxjQUFjLEVBQWQsTUFBYztFQUFkLHFCQUFjLEVBQWQsTUFBYztFQUFkLHlCQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOzs7O0NBQWM7O0FBQWQ7Ozs7O0VBQUEsb0JBQWMsRUFBZCxNQUFjO0VBQWQsOEJBQWMsRUFBZCxNQUFjO0VBQWQsZ0NBQWMsRUFBZCxNQUFjO0VBQWQsZUFBYyxFQUFkLE1BQWM7RUFBZCxvQkFBYyxFQUFkLE1BQWM7RUFBZCxvQkFBYyxFQUFkLE1BQWM7RUFBZCxjQUFjLEVBQWQsTUFBYztFQUFkLFNBQWMsRUFBZCxNQUFjO0VBQWQsVUFBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDs7RUFBQSxvQkFBYztBQUFBOztBQUFkOzs7Q0FBYzs7QUFBZDs7OztFQUFBLDBCQUFjLEVBQWQsTUFBYztFQUFkLDZCQUFjLEVBQWQsTUFBYztFQUFkLHNCQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEsYUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEsZ0JBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLHdCQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7O0VBQUEsWUFBYztBQUFBOztBQUFkOzs7Q0FBYzs7QUFBZDtFQUFBLDZCQUFjLEVBQWQsTUFBYztFQUFkLG9CQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEsd0JBQWM7QUFBQTs7QUFBZDs7O0NBQWM7O0FBQWQ7RUFBQSwwQkFBYyxFQUFkLE1BQWM7RUFBZCxhQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkO0VBQUEsa0JBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDs7Ozs7Ozs7Ozs7OztFQUFBLFNBQWM7QUFBQTs7QUFBZDtFQUFBLFNBQWM7RUFBZCxVQUFjO0FBQUE7O0FBQWQ7RUFBQSxVQUFjO0FBQUE7O0FBQWQ7OztFQUFBLGdCQUFjO0VBQWQsU0FBYztFQUFkLFVBQWM7QUFB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QW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsd0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSx1QkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSwyQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSwyQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLGdDQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSxzQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxzQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxzQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxzQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxzQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxzQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxzQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLDREQUFtQjtFQUFuQixxRUFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSw0REFBbUI7RUFBbkIscUVBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsNERBQW1CO0VBQW5CLHFFQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLDREQUFtQjtFQUFuQixxRUFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSw0REFBbUI7RUFBbkIscUVBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsNERBQW1CO0VBQW5CLGtFQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEscUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsbUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsaUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsaUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsbUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsbUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsbUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLCtFQUFtQjtFQUFuQixtR0FBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSwwQ0FBbUI7RUFBbkIsdURBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsOEJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLDhCQUFtQjtFQUFuQiwrUUFBbUI7VUFBbkI7QUFBbUI7QUFBbkI7RUFBQSw2QkFBbUI7RUFBbkIsK1FBQW1CO1VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsK1FBQW1CO1VBQW5CO0FBQW1COztBQUVuQjtFQUNFLDZDQUE2QztFQUM3QyxnQkFBZ0I7RUFDaEIsa0JBQWtCO0FBQ3BCOztBQUVBO0VBQ0UsNkNBQTZDO0VBQzdDLGdCQUFnQjtFQUNoQixrQkFBa0I7QUFDcEI7O0FBZEE7RUFBQSxzQkFlQTtFQWZBO0FBZUE7O0FBZkE7RUFBQSxrQkFlQTtFQWZBO0FBZUE7O0FBZkE7RUFBQSxrQkFlQTtFQWZBO0FBZUE7O0FBZkE7RUFBQSxvQkFlQTtFQWZBO0FBZUE7O0FBZkE7RUFBQTtBQWVBOztBQWZBO0VBQUEsc0JBZUE7RUFmQTtBQWVBOztBQWZBO0VBQUEsMkdBZUE7RUFmQSx5R0FlQTtFQWZBO0FBZUFcIixcInNvdXJjZXNDb250ZW50XCI6W1wiQHRhaWx3aW5kIGJhc2U7XFxuQHRhaWx3aW5kIGNvbXBvbmVudHM7XFxuQHRhaWx3aW5kIHV0aWxpdGllcztcXG5cXG4ubmFudW0tZ290aGljLWNvZGluZy1yZWd1bGFyIHtcXG4gIGZvbnQtZmFtaWx5OiBcXFwiTmFudW0gR290aGljIENvZGluZ1xcXCIsIG1vbm9zcGFjZTtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICBmb250LXN0eWxlOiBub3JtYWw7XFxufVxcblxcbi5uYW51bS1nb3RoaWMtY29kaW5nLWJvbGQge1xcbiAgZm9udC1mYW1pbHk6IFxcXCJOYW51bSBHb3RoaWMgQ29kaW5nXFxcIiwgbW9ub3NwYWNlO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gIGZvbnQtc3R5bGU6IG5vcm1hbDtcXG59XFxuXCJdLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICBBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzV2l0aE1hcHBpbmdUb1N0cmluZykge1xuICB2YXIgbGlzdCA9IFtdO1xuXG4gIC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcbiAgbGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIGNvbnRlbnQgPSBcIlwiO1xuICAgICAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBpdGVtWzVdICE9PSBcInVuZGVmaW5lZFwiO1xuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpO1xuICAgICAgfVxuICAgICAgY29udGVudCArPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pO1xuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKFwiXCIpO1xuICB9O1xuXG4gIC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG4gIGxpc3QuaSA9IGZ1bmN0aW9uIGkobW9kdWxlcywgbWVkaWEsIGRlZHVwZSwgc3VwcG9ydHMsIGxheWVyKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGVzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCB1bmRlZmluZWRdXTtcbiAgICB9XG4gICAgdmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHRoaXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdmFyIGlkID0gdGhpc1trXVswXTtcbiAgICAgICAgaWYgKGlkICE9IG51bGwpIHtcbiAgICAgICAgICBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgX2sgPSAwOyBfayA8IG1vZHVsZXMubGVuZ3RoOyBfaysrKSB7XG4gICAgICB2YXIgaXRlbSA9IFtdLmNvbmNhdChtb2R1bGVzW19rXSk7XG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGxheWVyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbVs1XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG1lZGlhKSB7XG4gICAgICAgIGlmICghaXRlbVsyXSkge1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzdXBwb3J0cykge1xuICAgICAgICBpZiAoIWl0ZW1bNF0pIHtcbiAgICAgICAgICBpdGVtWzRdID0gXCJcIi5jb25jYXQoc3VwcG9ydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs0XSA9IHN1cHBvcnRzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsaXN0LnB1c2goaXRlbSk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gbGlzdDtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgdmFyIGNvbnRlbnQgPSBpdGVtWzFdO1xuICB2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG4gIGlmICghY3NzTWFwcGluZykge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG4gIGlmICh0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KGNzc01hcHBpbmcpKSkpO1xuICAgIHZhciBkYXRhID0gXCJzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxcIi5jb25jYXQoYmFzZTY0KTtcbiAgICB2YXIgc291cmNlTWFwcGluZyA9IFwiLyojIFwiLmNvbmNhdChkYXRhLCBcIiAqL1wiKTtcbiAgICByZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oXCJcXG5cIik7XG4gIH1cbiAgcmV0dXJuIFtjb250ZW50XS5qb2luKFwiXFxuXCIpO1xufTsiLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydEZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanNcIjtcbiAgICAgIGltcG9ydCBzdHlsZVRhZ1RyYW5zZm9ybUZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4uL25vZGVfbW9kdWxlcy9wb3N0Y3NzLWxvYWRlci9kaXN0L2Nqcy5qcz8/cnVsZVNldFsxXS5ydWxlc1sxXS51c2VbMl0hLi9zdHlsZXMuY3NzXCI7XG4gICAgICBcbiAgICAgIFxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtID0gc3R5bGVUYWdUcmFuc2Zvcm1Gbjtcbm9wdGlvbnMuc2V0QXR0cmlidXRlcyA9IHNldEF0dHJpYnV0ZXM7XG5cbiAgICAgIG9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG4gICAgXG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi4vbm9kZV9tb2R1bGVzL3Bvc3Rjc3MtbG9hZGVyL2Rpc3QvY2pzLmpzPz9ydWxlU2V0WzFdLnJ1bGVzWzFdLnVzZVsyXSEuL3N0eWxlcy5jc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXNJbkRPTS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzdHlsZXNJbkRPTVtpXS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICByZXN1bHQgPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldO1xuICAgIHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuICAgIHZhciBjb3VudCA9IGlkQ291bnRNYXBbaWRdIHx8IDA7XG4gICAgdmFyIGlkZW50aWZpZXIgPSBcIlwiLmNvbmNhdChpZCwgXCIgXCIpLmNvbmNhdChjb3VudCk7XG4gICAgaWRDb3VudE1hcFtpZF0gPSBjb3VudCArIDE7XG4gICAgdmFyIGluZGV4QnlJZGVudGlmaWVyID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIGNzczogaXRlbVsxXSxcbiAgICAgIG1lZGlhOiBpdGVtWzJdLFxuICAgICAgc291cmNlTWFwOiBpdGVtWzNdLFxuICAgICAgc3VwcG9ydHM6IGl0ZW1bNF0sXG4gICAgICBsYXllcjogaXRlbVs1XVxuICAgIH07XG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcbiAgdmFyIHVwZGF0ZXIgPSBmdW5jdGlvbiB1cGRhdGVyKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXAgJiYgbmV3T2JqLnN1cHBvcnRzID09PSBvYmouc3VwcG9ydHMgJiYgbmV3T2JqLmxheWVyID09PSBvYmoubGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXBpLnVwZGF0ZShvYmogPSBuZXdPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcGkucmVtb3ZlKCk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gdXBkYXRlcjtcbn1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGlkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbaV07XG4gICAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4XS5yZWZlcmVuY2VzLS07XG4gICAgfVxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG4gICAgICB2YXIgX2luZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoX2lkZW50aWZpZXIpO1xuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcbiAgICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxhc3RJZGVudGlmaWVycyA9IG5ld0xhc3RJZGVudGlmaWVycztcbiAgfTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBtZW1vID0ge307XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZ2V0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAodHlwZW9mIG1lbW9bdGFyZ2V0XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHZhciBzdHlsZVRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTtcblxuICAgIC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG4gICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBtZW1vW3RhcmdldF0gPSBzdHlsZVRhcmdldDtcbiAgfVxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydEJ5U2VsZWN0b3IoaW5zZXJ0LCBzdHlsZSkge1xuICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGluc2VydCk7XG4gIGlmICghdGFyZ2V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnQnIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcbiAgfVxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRCeVNlbGVjdG9yOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBvcHRpb25zLnNldEF0dHJpYnV0ZXMoZWxlbWVudCwgb3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgb3B0aW9ucy5pbnNlcnQoZWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydFN0eWxlRWxlbWVudDsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMoc3R5bGVFbGVtZW50KSB7XG4gIHZhciBub25jZSA9IHR5cGVvZiBfX3dlYnBhY2tfbm9uY2VfXyAhPT0gXCJ1bmRlZmluZWRcIiA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IFwiXCI7XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChvYmouc3VwcG9ydHMsIFwiKSB7XCIpO1xuICB9XG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuICB2YXIgbmVlZExheWVyID0gdHlwZW9mIG9iai5sYXllciAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIkBsYXllclwiLmNvbmNhdChvYmoubGF5ZXIubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChvYmoubGF5ZXIpIDogXCJcIiwgXCIge1wiKTtcbiAgfVxuICBjc3MgKz0gb2JqLmNzcztcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG4gIGlmIChzb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiLmNvbmNhdChidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpLCBcIiAqL1wiKTtcbiAgfVxuXG4gIC8vIEZvciBvbGQgSUVcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuICBvcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xufVxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCkge1xuICAvLyBpc3RhbmJ1bCBpZ25vcmUgaWZcbiAgaWYgKHN0eWxlRWxlbWVudC5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZG9tQVBJKG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHJldHVybiB7XG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHt9LFxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgIH07XG4gIH1cbiAgdmFyIHN0eWxlRWxlbWVudCA9IG9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKG9iaikge1xuICAgICAgYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gIH07XG59XG5tb2R1bGUuZXhwb3J0cyA9IGRvbUFQSTsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCkge1xuICBpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICB9XG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlVGFnVHJhbnNmb3JtOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJ2YXIgd2VicGFja1F1ZXVlcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiA/IFN5bWJvbChcIndlYnBhY2sgcXVldWVzXCIpIDogXCJfX3dlYnBhY2tfcXVldWVzX19cIjtcbnZhciB3ZWJwYWNrRXhwb3J0cyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiA/IFN5bWJvbChcIndlYnBhY2sgZXhwb3J0c1wiKSA6IFwiX193ZWJwYWNrX2V4cG9ydHNfX1wiO1xudmFyIHdlYnBhY2tFcnJvciA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiA/IFN5bWJvbChcIndlYnBhY2sgZXJyb3JcIikgOiBcIl9fd2VicGFja19lcnJvcl9fXCI7XG52YXIgcmVzb2x2ZVF1ZXVlID0gKHF1ZXVlKSA9PiB7XG5cdGlmKHF1ZXVlICYmIHF1ZXVlLmQgPCAxKSB7XG5cdFx0cXVldWUuZCA9IDE7XG5cdFx0cXVldWUuZm9yRWFjaCgoZm4pID0+IChmbi5yLS0pKTtcblx0XHRxdWV1ZS5mb3JFYWNoKChmbikgPT4gKGZuLnItLSA/IGZuLnIrKyA6IGZuKCkpKTtcblx0fVxufVxudmFyIHdyYXBEZXBzID0gKGRlcHMpID0+IChkZXBzLm1hcCgoZGVwKSA9PiB7XG5cdGlmKGRlcCAhPT0gbnVsbCAmJiB0eXBlb2YgZGVwID09PSBcIm9iamVjdFwiKSB7XG5cdFx0aWYoZGVwW3dlYnBhY2tRdWV1ZXNdKSByZXR1cm4gZGVwO1xuXHRcdGlmKGRlcC50aGVuKSB7XG5cdFx0XHR2YXIgcXVldWUgPSBbXTtcblx0XHRcdHF1ZXVlLmQgPSAwO1xuXHRcdFx0ZGVwLnRoZW4oKHIpID0+IHtcblx0XHRcdFx0b2JqW3dlYnBhY2tFeHBvcnRzXSA9IHI7XG5cdFx0XHRcdHJlc29sdmVRdWV1ZShxdWV1ZSk7XG5cdFx0XHR9LCAoZSkgPT4ge1xuXHRcdFx0XHRvYmpbd2VicGFja0Vycm9yXSA9IGU7XG5cdFx0XHRcdHJlc29sdmVRdWV1ZShxdWV1ZSk7XG5cdFx0XHR9KTtcblx0XHRcdHZhciBvYmogPSB7fTtcblx0XHRcdG9ialt3ZWJwYWNrUXVldWVzXSA9IChmbikgPT4gKGZuKHF1ZXVlKSk7XG5cdFx0XHRyZXR1cm4gb2JqO1xuXHRcdH1cblx0fVxuXHR2YXIgcmV0ID0ge307XG5cdHJldFt3ZWJwYWNrUXVldWVzXSA9IHggPT4ge307XG5cdHJldFt3ZWJwYWNrRXhwb3J0c10gPSBkZXA7XG5cdHJldHVybiByZXQ7XG59KSk7XG5fX3dlYnBhY2tfcmVxdWlyZV9fLmEgPSAobW9kdWxlLCBib2R5LCBoYXNBd2FpdCkgPT4ge1xuXHR2YXIgcXVldWU7XG5cdGhhc0F3YWl0ICYmICgocXVldWUgPSBbXSkuZCA9IC0xKTtcblx0dmFyIGRlcFF1ZXVlcyA9IG5ldyBTZXQoKTtcblx0dmFyIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cztcblx0dmFyIGN1cnJlbnREZXBzO1xuXHR2YXIgb3V0ZXJSZXNvbHZlO1xuXHR2YXIgcmVqZWN0O1xuXHR2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWopID0+IHtcblx0XHRyZWplY3QgPSByZWo7XG5cdFx0b3V0ZXJSZXNvbHZlID0gcmVzb2x2ZTtcblx0fSk7XG5cdHByb21pc2Vbd2VicGFja0V4cG9ydHNdID0gZXhwb3J0cztcblx0cHJvbWlzZVt3ZWJwYWNrUXVldWVzXSA9IChmbikgPT4gKHF1ZXVlICYmIGZuKHF1ZXVlKSwgZGVwUXVldWVzLmZvckVhY2goZm4pLCBwcm9taXNlW1wiY2F0Y2hcIl0oeCA9PiB7fSkpO1xuXHRtb2R1bGUuZXhwb3J0cyA9IHByb21pc2U7XG5cdGJvZHkoKGRlcHMpID0+IHtcblx0XHRjdXJyZW50RGVwcyA9IHdyYXBEZXBzKGRlcHMpO1xuXHRcdHZhciBmbjtcblx0XHR2YXIgZ2V0UmVzdWx0ID0gKCkgPT4gKGN1cnJlbnREZXBzLm1hcCgoZCkgPT4ge1xuXHRcdFx0aWYoZFt3ZWJwYWNrRXJyb3JdKSB0aHJvdyBkW3dlYnBhY2tFcnJvcl07XG5cdFx0XHRyZXR1cm4gZFt3ZWJwYWNrRXhwb3J0c107XG5cdFx0fSkpXG5cdFx0dmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0Zm4gPSAoKSA9PiAocmVzb2x2ZShnZXRSZXN1bHQpKTtcblx0XHRcdGZuLnIgPSAwO1xuXHRcdFx0dmFyIGZuUXVldWUgPSAocSkgPT4gKHEgIT09IHF1ZXVlICYmICFkZXBRdWV1ZXMuaGFzKHEpICYmIChkZXBRdWV1ZXMuYWRkKHEpLCBxICYmICFxLmQgJiYgKGZuLnIrKywgcS5wdXNoKGZuKSkpKTtcblx0XHRcdGN1cnJlbnREZXBzLm1hcCgoZGVwKSA9PiAoZGVwW3dlYnBhY2tRdWV1ZXNdKGZuUXVldWUpKSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGZuLnIgPyBwcm9taXNlIDogZ2V0UmVzdWx0KCk7XG5cdH0sIChlcnIpID0+ICgoZXJyID8gcmVqZWN0KHByb21pc2Vbd2VicGFja0Vycm9yXSA9IGVycikgOiBvdXRlclJlc29sdmUoZXhwb3J0cykpLCByZXNvbHZlUXVldWUocXVldWUpKSk7XG5cdHF1ZXVlICYmIHF1ZXVlLmQgPCAwICYmIChxdWV1ZS5kID0gMCk7XG59OyIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubmMgPSB1bmRlZmluZWQ7IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSB1c2VkICdtb2R1bGUnIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2luZGV4LmpzXCIpO1xuIiwiIl0sIm5hbWVzIjpbIkdhbWVib2FyZCIsImdyaWQiLCJzaGlwc1RvUGxhY2UiLCJzaGlwVHlwZSIsInNoaXBMZW5ndGgiLCJoaXRCZ0NsciIsImhpdFRleHRDbHIiLCJtaXNzQmdDbHIiLCJtaXNzVGV4dENsciIsImVycm9yVGV4dENsciIsImRlZmF1bHRUZXh0Q2xyIiwicHJpbWFyeUhvdmVyQ2xyIiwiaGlnaGxpZ2h0Q2xyIiwiY3VycmVudE9yaWVudGF0aW9uIiwiY3VycmVudFNoaXAiLCJsYXN0SG92ZXJlZENlbGwiLCJwbGFjZVNoaXBHdWlkZSIsInByb21wdCIsInByb21wdFR5cGUiLCJnYW1lcGxheUd1aWRlIiwidHVyblByb21wdCIsInByb2Nlc3NDb21tYW5kIiwiY29tbWFuZCIsImlzTW92ZSIsInBhcnRzIiwic3BsaXQiLCJsZW5ndGgiLCJFcnJvciIsImdyaWRQb3NpdGlvbiIsInRvVXBwZXJDYXNlIiwidmFsaWRHcmlkUG9zaXRpb25zIiwiZmxhdCIsImluY2x1ZGVzIiwicmVzdWx0Iiwib3JpZW50YXRpb24iLCJ0b0xvd2VyQ2FzZSIsInVwZGF0ZU91dHB1dCIsIm1lc3NhZ2UiLCJ0eXBlIiwib3V0cHV0IiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsIm1lc3NhZ2VFbGVtZW50IiwiY3JlYXRlRWxlbWVudCIsInRleHRDb250ZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwiYXBwZW5kQ2hpbGQiLCJzY3JvbGxUb3AiLCJzY3JvbGxIZWlnaHQiLCJjb25zb2xlTG9nUGxhY2VtZW50Q29tbWFuZCIsImRpckZlZWJhY2siLCJjaGFyQXQiLCJzbGljZSIsInZhbHVlIiwiY29uc29sZUxvZ01vdmVDb21tYW5kIiwicmVzdWx0c09iamVjdCIsInBsYXllciIsIm1vdmUiLCJoaXQiLCJjb25zb2xlTG9nU2hpcFNpbmsiLCJjb25zb2xlTG9nRXJyb3IiLCJlcnJvciIsImNvbnNvbGUiLCJpbml0VWlNYW5hZ2VyIiwidWlNYW5hZ2VyIiwiaW5pdENvbnNvbGVVSSIsImNyZWF0ZUdhbWVib2FyZCIsImNhbGN1bGF0ZVNoaXBDZWxscyIsInN0YXJ0Q2VsbCIsImNlbGxJZHMiLCJyb3dJbmRleCIsImNoYXJDb2RlQXQiLCJjb2xJbmRleCIsInBhcnNlSW50Iiwic3Vic3RyaW5nIiwiaSIsInB1c2giLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJoaWdobGlnaHRDZWxscyIsImZvckVhY2giLCJjZWxsSWQiLCJjZWxsRWxlbWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJjbGVhckhpZ2hsaWdodCIsInJlbW92ZSIsInRvZ2dsZU9yaWVudGF0aW9uIiwiaGFuZGxlUGxhY2VtZW50SG92ZXIiLCJlIiwiY2VsbCIsInRhcmdldCIsImNvbnRhaW5zIiwiZGF0YXNldCIsImNlbGxQb3MiLCJwb3NpdGlvbiIsImNlbGxzVG9IaWdobGlnaHQiLCJoYW5kbGVNb3VzZUxlYXZlIiwiY2VsbHNUb0NsZWFyIiwiaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUiLCJwcmV2ZW50RGVmYXVsdCIsImtleSIsIm9sZENlbGxzVG9DbGVhciIsIm5ld0NlbGxzVG9IaWdobGlnaHQiLCJlbmFibGVDb21wdXRlckdhbWVib2FyZEhvdmVyIiwicXVlcnlTZWxlY3RvckFsbCIsImRpc2FibGVDb21wdXRlckdhbWVib2FyZEhvdmVyIiwiY2VsbHNBcnJheSIsImRpc2FibGVIdW1hbkdhbWVib2FyZEhvdmVyIiwic3dpdGNoR2FtZWJvYXJkSG92ZXJTdGF0ZXMiLCJzZXR1cEdhbWVib2FyZEZvclBsYWNlbWVudCIsImNvbXBHYW1lYm9hcmRDZWxscyIsImFkZEV2ZW50TGlzdGVuZXIiLCJnYW1lYm9hcmRBcmVhIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImNsZWFudXBBZnRlclBsYWNlbWVudCIsInN0YXJ0R2FtZSIsImdhbWUiLCJzZXRVcCIsInNoaXAiLCJyZW5kZXJTaGlwRGlzcCIsInBsYXllcnMiLCJjb21wdXRlciIsImRpc3BsYXlQcm9tcHQiLCJBY3Rpb25Db250cm9sbGVyIiwiaHVtYW5QbGF5ZXIiLCJodW1hbiIsImh1bWFuUGxheWVyR2FtZWJvYXJkIiwiZ2FtZWJvYXJkIiwiY29tcFBsYXllciIsImNvbXBQbGF5ZXJHYW1lYm9hcmQiLCJzZXR1cEV2ZW50TGlzdGVuZXJzIiwiaGFuZGxlckZ1bmN0aW9uIiwicGxheWVyVHlwZSIsImNsZWFudXBGdW5jdGlvbnMiLCJjb25zb2xlU3VibWl0QnV0dG9uIiwiY29uc29sZUlucHV0Iiwic3VibWl0SGFuZGxlciIsImlucHV0Iiwia2V5cHJlc3NIYW5kbGVyIiwiY2xpY2tIYW5kbGVyIiwiY2xlYW51cCIsInByb21wdEFuZFBsYWNlU2hpcCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZmluZCIsInBsYWNlU2hpcFByb21wdCIsImhhbmRsZVZhbGlkSW5wdXQiLCJwbGFjZVNoaXAiLCJyZW5kZXJTaGlwQm9hcmQiLCJyZXNvbHZlU2hpcFBsYWNlbWVudCIsInNldHVwU2hpcHNTZXF1ZW50aWFsbHkiLCJoYW5kbGVTZXR1cCIsInVwZGF0ZURpc3BsYXlzIiwibW92ZVJlc3VsdCIsInBsYXllclNlbGVjdG9yIiwidXBkYXRlU2hpcFNlY3Rpb24iLCJwcm9tcHRQbGF5ZXJNb3ZlIiwiaHVtYW5Nb3ZlUmVzdWx0IiwiaGFuZGxlVmFsaWRNb3ZlIiwibWFrZU1vdmUiLCJyZXNvbHZlTW92ZSIsImNvbXB1dGVyTW92ZSIsImNvbXBNb3ZlUmVzdWx0IiwiY2hlY2tTaGlwSXNTdW5rIiwiaXNTaGlwU3VuayIsImNoZWNrV2luQ29uZGl0aW9uIiwiY2hlY2tBbGxTaGlwc1N1bmsiLCJyZXN0YXJ0R2FtZSIsIndpbmRvdyIsImxvY2F0aW9uIiwicmVsb2FkIiwiY29uY2x1ZGVHYW1lIiwid2lubmVyIiwicHJvbXB0RW5kR2FtZSIsInJlc3RhcnRCdXR0b24iLCJwbGF5R2FtZSIsImdhbWVPdmVyIiwibGFzdENvbXBNb3ZlUmVzdWx0IiwibGFzdEh1bWFuTW92ZVJlc3VsdCIsImlzU3VuayIsInJlbmRlclN1bmtlblNoaXAiLCJPdmVybGFwcGluZ1NoaXBzRXJyb3IiLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJTaGlwQWxsb2NhdGlvblJlYWNoZWRFcnJvciIsIlNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvciIsIkludmFsaWRTaGlwTGVuZ3RoRXJyb3IiLCJJbnZhbGlkU2hpcFR5cGVFcnJvciIsIkludmFsaWRQbGF5ZXJUeXBlRXJyb3IiLCJTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvciIsIlJlcGVhdEF0dGFja2VkRXJyb3IiLCJJbnZhbGlkTW92ZUVudHJ5RXJyb3IiLCJQbGF5ZXIiLCJTaGlwIiwiR2FtZSIsImh1bWFuR2FtZWJvYXJkIiwiY29tcHV0ZXJHYW1lYm9hcmQiLCJjb21wdXRlclBsYXllciIsImN1cnJlbnRQbGF5ZXIiLCJnYW1lT3ZlclN0YXRlIiwicGxhY2VTaGlwcyIsImVuZEdhbWUiLCJ0YWtlVHVybiIsImZlZWRiYWNrIiwib3Bwb25lbnQiLCJnYW1lV29uIiwiaW5kZXhDYWxjcyIsInN0YXJ0IiwiY29sTGV0dGVyIiwicm93TnVtYmVyIiwiY2hlY2tUeXBlIiwic2hpcFBvc2l0aW9ucyIsIk9iamVjdCIsImtleXMiLCJleGlzdGluZ1NoaXBUeXBlIiwiY2hlY2tCb3VuZGFyaWVzIiwiY29vcmRzIiwiZGlyZWN0aW9uIiwieExpbWl0IiwieUxpbWl0IiwieCIsInkiLCJjYWxjdWxhdGVTaGlwUG9zaXRpb25zIiwicG9zaXRpb25zIiwiY2hlY2tGb3JPdmVybGFwIiwiZW50cmllcyIsImV4aXN0aW5nU2hpcFBvc2l0aW9ucyIsInNvbWUiLCJjaGVja0ZvckhpdCIsImZvdW5kU2hpcCIsIl8iLCJzaGlwRmFjdG9yeSIsInNoaXBzIiwiaGl0UG9zaXRpb25zIiwiYXR0YWNrTG9nIiwibmV3U2hpcCIsImF0dGFjayIsInJlc3BvbnNlIiwiY2hlY2tSZXN1bHRzIiwiZXZlcnkiLCJzaGlwUmVwb3J0IiwiZmxvYXRpbmdTaGlwcyIsImZpbHRlciIsIm1hcCIsImdldFNoaXAiLCJnZXRTaGlwUG9zaXRpb25zIiwiZ2V0SGl0UG9zaXRpb25zIiwiVWlNYW5hZ2VyIiwic3R5bGUiLCJ2aXNpYmlsaXR5IiwibmV3VWlNYW5hZ2VyIiwibmV3R2FtZSIsImFjdENvbnRyb2xsZXIiLCJjaGVja01vdmUiLCJnYkdyaWQiLCJ2YWxpZCIsImVsIiwicCIsInJhbmRNb3ZlIiwibW92ZUxvZyIsImFsbE1vdmVzIiwiZmxhdE1hcCIsInJvdyIsInBvc3NpYmxlTW92ZXMiLCJyYW5kb21Nb3ZlIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiZ2VuZXJhdGVSYW5kb21TdGFydCIsInNpemUiLCJ2YWxpZFN0YXJ0cyIsImNvbCIsInJhbmRvbUluZGV4IiwiYXV0b1BsYWNlbWVudCIsInNoaXBUeXBlcyIsInBsYWNlZCIsIm9wcEdhbWVib2FyZCIsInNldExlbmd0aCIsImhpdHMiLCJ0dyIsInN0cmluZ3MiLCJ2YWx1ZXMiLCJyYXciLCJpbnN0cnVjdGlvbkNsciIsImd1aWRlQ2xyIiwiZXJyb3JDbHIiLCJkZWZhdWx0Q2xyIiwiY2VsbENsciIsImlucHV0Q2xyIiwiaW5wdXRUZXh0Q2xyIiwiYnV0dG9uQ2xyIiwiYnV0dG9uVGV4dENsciIsInNoaXBTZWN0Q2xyIiwic2hpcEhpdENsciIsInNoaXBTdW5rQ2xyIiwiYnVpbGRTZWN0aW9uIiwiZG9tU2VsIiwicG9zIiwic2VjdCIsImNsYXNzTmFtZSIsInNldEF0dHJpYnV0ZSIsImJ1aWxkU2hpcCIsIm9iaiIsInNoaXBTZWN0cyIsImVuZEdhbWVJbnRlcmZhY2UiLCJtYWluQ29udGFpbmVyIiwiZW5kR2FtZUNvbnRhaW5lciIsInByb21wdENvbnRhaW5lciIsIndpbm5lclByb21wdCIsInJlc3RhcnRQcm9tcHQiLCJjb250YWluZXJJRCIsImNvbnRhaW5lciIsImdyaWREaXYiLCJjb2x1bW5zIiwiaGVhZGVyIiwicm93TGFiZWwiLCJpZCIsImNvbnNvbGVDb250YWluZXIiLCJpbnB1dERpdiIsInN1Ym1pdEJ1dHRvbiIsInByb21wdE9ianMiLCJkaXNwbGF5IiwiZmlyc3RDaGlsZCIsInJlbW92ZUNoaWxkIiwicHJvbXB0RGl2IiwicGxheWVyT2JqIiwiaWRTZWwiLCJkaXNwRGl2Iiwic2hpcERpdiIsInRpdGxlIiwic2VjdHNEaXYiLCJzaGlwT2JqIiwic2hpcFNlY3QiLCJzZWN0aW9uIiwicmVuZGVyU2hpcFNlY3QiLCJuZXdDbHIiLCJwbGF5ZXJJZCIsInNoaXBTZWN0RGlzcGxheUVsIiwic2hpcFNlY3RCb2FyZEVsIl0sInNvdXJjZVJvb3QiOiIifQ==