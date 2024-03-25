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
const missBgClr = "bg-gray-300";
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
.bg-gray-300 {
  --tw-bg-opacity: 1;
  background-color: rgb(209 213 219 / var(--tw-bg-opacity));
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
`, "",{"version":3,"sources":["webpack://./src/styles.css"],"names":[],"mappings":"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;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,wBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,uBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,2BAAmB;EAAnB;AAAmB;AAAnB;EAAA,2BAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,gCAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AA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","sourcesContent":["@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n.nanum-gothic-coding-regular {\n  font-family: \"Nanum Gothic Coding\", monospace;\n  font-weight: 400;\n  font-style: normal;\n}\n\n.nanum-gothic-coding-bold {\n  font-family: \"Nanum Gothic Coding\", monospace;\n  font-weight: 700;\n  font-style: normal;\n}\n"],"sourceRoot":""}]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFDN0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFF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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxjQUFjO0FBQ2Qsa0JBQWtCO0FBQ2xCOztBQUVBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Qsa0JBQWtCO0FBQ2xCOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCLDBCQUEwQjtBQUMxQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sa0ZBQWtGLFlBQVksTUFBTSxPQUFPLHFCQUFxQixvQkFBb0IscUJBQXFCLHFCQUFxQixNQUFNLE1BQU0sV0FBVyxNQUFNLFlBQVksTUFBTSxNQUFNLHFCQUFxQixxQkFBcUIscUJBQXFCLFVBQVUsb0JBQW9CLHFCQUFxQixxQkFBcUIscUJBQXFCLHFCQUFxQixNQUFNLE9BQU8sTUFBTSxLQUFLLG9CQUFvQixxQkFBcUIsTUFBTSxRQUFRLE1BQU0sS0FBSyxvQkFBb0Isb0JBQW9CLHFCQUFxQixNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsV0FBVyxNQUFNLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxNQUFNLE1BQU0sTUFBTSxLQUFLLFVBQVUsV0FBVyxNQUFNLE1BQU0sTUFBTSxNQUFNLFdBQVcsTUFBTSxTQUFTLE1BQU0sUUFBUSxxQkFBcUIscUJBQXFCLHFCQUFxQixvQkFBb0IsTUFBTSxNQUFNLE1BQU0sS0FBSyxVQUFVLE1BQU0sTUFBTSxNQUFNLE1BQU0sVUFBVSxVQUFVLFdBQVcsV0FBVyxNQUFNLEtBQUssVUFBVSxNQUFNLEtBQUssVUFBVSxNQUFNLFFBQVEsTUFBTSxLQUFLLG9CQUFvQixxQkFBcUIscUJBQXFCLE1BQU0sUUFBUSxNQUFNLFNBQVMscUJBQXFCLHFCQUFxQixxQkFBcUIsb0JBQW9CLHFCQUFxQixxQkFBcUIsb0JBQW9CLG9CQUFvQixvQkFBb0IsTUFBTSxNQUFNLE1BQU0sTUFBTSxXQUFXLE1BQU0sT0FBTyxNQUFNLFFBQVEscUJBQXFCLHFCQUFxQixxQkFBcUIsTUFBTSxNQUFNLE1BQU0sS0FBSyxVQUFVLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLE1BQU0sTUFBTSxVQUFVLE1BQU0sT0FBTyxNQUFNLEtBQUsscUJBQXFCLHFCQUFxQixNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxPQUFPLE1BQU0sS0FBSyxxQkFBcUIsb0JBQW9CLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sTUFBTSxpQkFBaUIsVUFBVSxNQUFNLEtBQUssVUFBVSxVQUFVLE1BQU0sS0FBSyxVQUFVLE1BQU0sT0FBTyxXQUFXLFVBQVUsVUFBVSxNQUFNLE1BQU0sS0FBSyxLQUFLLFVBQVUsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sT0FBTyxNQUFNLEtBQUssb0JBQW9CLG9CQUFvQixNQUFNLE1BQU0sb0JBQW9CLG9CQUFvQixNQUFNLE1BQU0sTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLEtBQUssS0FBSyxVQUFVLE1BQU0sUUFBUSxNQUFNLFlBQVksb0JBQW9CLHFCQUFxQixNQUFNLE1BQU0sTUFBTSxNQUFNLFVBQVUsVUFBVSxNQUFNLFdBQVcsS0FBSyxVQUFVLE1BQU0sS0FBSyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLEtBQUssTUFBTSxLQUFLLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsS0FBSyxLQUFLLEtBQUssS0FBSyxNQUFNLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksYUFBYSxNQUFNLE1BQU0sTUFBTSxZQUFZLGFBQWEsTUFBTSxNQUFNLE1BQU0sWUFBWSxhQUFhLE1BQU0sTUFBTSxNQUFNLFlBQVksYUFBYSxNQUFNLE1BQU0sTUFBTSxZQUFZLGFBQWEsTUFBTSxNQUFNLE1BQU0sWUFBWSxhQUFhLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sWUFBWSxhQUFhLE1BQU0sTUFBTSxNQUFNLFlBQVksYUFBYSxNQUFNLE1BQU0sTUFBTSxZQUFZLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLE1BQU0sWUFBWSxNQUFNLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxZQUFZLGFBQWEsTUFBTSxNQUFNLE1BQU0sWUFBWSxhQUFhLE1BQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxPQUFPLE1BQU0sWUFBWSxhQUFhLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxhQUFhLE9BQU8sS0FBSyxXQUFXLEtBQUssTUFBTSxLQUFLLFdBQVcsS0FBSyxNQUFNLEtBQUssV0FBVyxLQUFLLE1BQU0sS0FBSyxXQUFXLEtBQUssTUFBTSxLQUFLLEtBQUssTUFBTSxLQUFLLFdBQVcsS0FBSyxNQUFNLEtBQUssV0FBVyxXQUFXLEtBQUssd0NBQXdDLHVCQUF1QixzQkFBc0Isa0NBQWtDLG9EQUFvRCxxQkFBcUIsdUJBQXVCLEdBQUcsK0JBQStCLG9EQUFvRCxxQkFBcUIsdUJBQXVCLEdBQUcscUJBQXFCO0FBQ2g3UTtBQUNBLGlFQUFlLHVCQUF1QixFQUFDOzs7Ozs7Ozs7OztBQzd1QzFCOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxREFBcUQ7QUFDckQ7QUFDQTtBQUNBLGdEQUFnRDtBQUNoRDtBQUNBO0FBQ0EscUZBQXFGO0FBQ3JGO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixpQkFBaUI7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLHFCQUFxQjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVixzRkFBc0YscUJBQXFCO0FBQzNHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVixpREFBaUQscUJBQXFCO0FBQ3RFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVixzREFBc0QscUJBQXFCO0FBQzNFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUNwRmE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVEQUF1RCxjQUFjO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNkQSxNQUErRjtBQUMvRixNQUFxRjtBQUNyRixNQUE0RjtBQUM1RixNQUErRztBQUMvRyxNQUF3RztBQUN4RyxNQUF3RztBQUN4RyxNQUEySztBQUMzSztBQUNBOztBQUVBOztBQUVBLDRCQUE0QixxR0FBbUI7QUFDL0Msd0JBQXdCLGtIQUFhOztBQUVyQyx1QkFBdUIsdUdBQWE7QUFDcEM7QUFDQSxpQkFBaUIsK0ZBQU07QUFDdkIsNkJBQTZCLHNHQUFrQjs7QUFFL0MsYUFBYSwwR0FBRyxDQUFDLHVKQUFPOzs7O0FBSXFIO0FBQzdJLE9BQU8saUVBQWUsdUpBQU8sSUFBSSx1SkFBTyxVQUFVLHVKQUFPLG1CQUFtQixFQUFDOzs7Ozs7Ozs7OztBQzFCaEU7O0FBRWI7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLHdCQUF3QjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixpQkFBaUI7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQiw0QkFBNEI7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQiw2QkFBNkI7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUNuRmE7O0FBRWI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7O0FDakNhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUNUYTs7QUFFYjtBQUNBO0FBQ0EsY0FBYyxLQUF3QyxHQUFHLHNCQUFpQixHQUFHLENBQUk7QUFDakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7OztBQ1RhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0RBQWtEO0FBQ2xEO0FBQ0E7QUFDQSwwQ0FBMEM7QUFDMUM7QUFDQTtBQUNBO0FBQ0EsaUZBQWlGO0FBQ2pGO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EseURBQXlEO0FBQ3pEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0M7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7O0FDNURhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7VUNiQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLElBQUk7V0FDSjtXQUNBO1dBQ0EsSUFBSTtXQUNKO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLENBQUM7V0FDRDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsRUFBRTtXQUNGO1dBQ0Esc0dBQXNHO1dBQ3RHO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQSxFQUFFO1dBQ0Y7V0FDQTs7Ozs7V0NoRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1dDTkE7Ozs7O1VFQUE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvYWN0aW9uQ29udHJvbGxlci5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvZXJyb3JzLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9nYW1lLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9nYW1lYm9hcmQuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9wbGF5ZXIuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3NoaXAuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vc3JjL3VpTWFuYWdlci5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9zcmMvc3R5bGVzLmNzcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL3NyYy9zdHlsZXMuY3NzPzBhMjUiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qcyIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9hc3luYyBtb2R1bGUiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vb2Rpbi1iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9ub25jZSIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9vZGluLWJhdHRsZXNoaXAvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL29kaW4tYmF0dGxlc2hpcC93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEdhbWVib2FyZCBmcm9tIFwiLi9nYW1lYm9hcmRcIjtcblxuY29uc3QgeyBncmlkIH0gPSBHYW1lYm9hcmQoKTtcblxuY29uc3Qgc2hpcHNUb1BsYWNlID0gW1xuICB7IHNoaXBUeXBlOiBcImNhcnJpZXJcIiwgc2hpcExlbmd0aDogNSB9LFxuICB7IHNoaXBUeXBlOiBcImJhdHRsZXNoaXBcIiwgc2hpcExlbmd0aDogNCB9LFxuICB7IHNoaXBUeXBlOiBcInN1Ym1hcmluZVwiLCBzaGlwTGVuZ3RoOiAzIH0sXG4gIHsgc2hpcFR5cGU6IFwiY3J1aXNlclwiLCBzaGlwTGVuZ3RoOiAzIH0sXG4gIHsgc2hpcFR5cGU6IFwiZGVzdHJveWVyXCIsIHNoaXBMZW5ndGg6IDIgfSxcbl07XG5cbmNvbnN0IGhpdEJnQ2xyID0gXCJiZy1saW1lLTcwMFwiO1xuY29uc3QgaGl0VGV4dENsciA9IFwidGV4dC1saW1lLTcwMFwiO1xuY29uc3QgbWlzc0JnQ2xyID0gXCJiZy1ncmF5LTMwMFwiO1xuY29uc3QgbWlzc1RleHRDbHIgPSBcInRleHQtb3JhbmdlLTgwMFwiO1xuY29uc3QgZXJyb3JUZXh0Q2xyID0gXCJ0ZXh0LXJlZC04MDBcIjtcbmNvbnN0IGRlZmF1bHRUZXh0Q2xyID0gXCJ0ZXh0LWdyYXktNjAwXCI7XG5cbmNvbnN0IHByaW1hcnlIb3ZlckNsciA9IFwiaG92ZXI6Ymctb3JhbmdlLTUwMFwiO1xuY29uc3QgaGlnaGxpZ2h0Q2xyID0gXCJiZy1vcmFuZ2UtMzAwXCI7XG5cbmxldCBjdXJyZW50T3JpZW50YXRpb24gPSBcImhcIjsgLy8gRGVmYXVsdCBvcmllbnRhdGlvblxubGV0IGN1cnJlbnRTaGlwO1xubGV0IGxhc3RIb3ZlcmVkQ2VsbCA9IG51bGw7IC8vIFN0b3JlIHRoZSBsYXN0IGhvdmVyZWQgY2VsbCdzIElEXG5cbmNvbnN0IHBsYWNlU2hpcEd1aWRlID0ge1xuICBwcm9tcHQ6XG4gICAgXCJFbnRlciB0aGUgZ3JpZCBwb3NpdGlvbiAoaS5lLiAnQTEnKSBhbmQgb3JpZW50YXRpb24gKCdoJyBmb3IgaG9yaXpvbnRhbCBhbmQgJ3YnIGZvciB2ZXJ0aWNhbCksIHNlcGFyYXRlZCB3aXRoIGEgc3BhY2UuIEZvciBleGFtcGxlICdBMiB2Jy4gQWx0ZXJuYXRpdmVseSwgb24geW91IGdhbWVib2FyZCBjbGljayB0aGUgY2VsbCB5b3Ugd2FudCB0byBzZXQgYXQgdGhlIHN0YXJ0aW5nIHBvaW50LCB1c2Ugc3BhY2ViYXIgdG8gdG9nZ2xlIHRoZSBvcmllbnRhdGlvbi5cIixcbiAgcHJvbXB0VHlwZTogXCJndWlkZVwiLFxufTtcblxuY29uc3QgZ2FtZXBsYXlHdWlkZSA9IHtcbiAgcHJvbXB0OlxuICAgIFwiRW50ZXIgZ3JpZCBwb3NpdGlvbiAoaS5lLiAnQTEnKSB5b3Ugd2FudCB0byBhdHRhY2suIEFsdGVybmF0aXZlbHksIGNsaWNrIHRoZSBjZWxsIHlvdSB3YW50IHRvIGF0dGFjayBvbiB0aGUgb3Bwb25lbnQncyBnYW1lYm9hcmRcIixcbiAgcHJvbXB0VHlwZTogXCJndWlkZVwiLFxufTtcblxuY29uc3QgdHVyblByb21wdCA9IHtcbiAgcHJvbXB0OiBcIk1ha2UgeW91ciBtb3ZlLlwiLFxuICBwcm9tcHRUeXBlOiBcImluc3RydWN0aW9uXCIsXG59O1xuXG5jb25zdCBwcm9jZXNzQ29tbWFuZCA9IChjb21tYW5kLCBpc01vdmUpID0+IHtcbiAgLy8gSWYgaXNNb3ZlIGlzIHRydXRoeSwgYXNzaWduIGFzIHNpbmdsZSBpdGVtIGFycmF5LCBvdGhlcndpc2Ugc3BsaXQgdGhlIGNvbW1hbmQgYnkgc3BhY2VcbiAgY29uc3QgcGFydHMgPSBpc01vdmUgPyBbY29tbWFuZF0gOiBjb21tYW5kLnNwbGl0KFwiIFwiKTtcbiAgaWYgKCFpc01vdmUgJiYgcGFydHMubGVuZ3RoICE9PSAyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgXCJJbnZhbGlkIGNvbW1hbmQgZm9ybWF0LiBQbGVhc2UgdXNlIHRoZSBmb3JtYXQgJ0dyaWRQb3NpdGlvbiBPcmllbnRhdGlvbicuXCIsXG4gICAgKTtcbiAgfVxuXG4gIC8vIFByb2Nlc3MgYW5kIHZhbGlkYXRlIHRoZSBncmlkIHBvc2l0aW9uXG4gIGNvbnN0IGdyaWRQb3NpdGlvbiA9IHBhcnRzWzBdLnRvVXBwZXJDYXNlKCk7XG4gIGlmIChncmlkUG9zaXRpb24ubGVuZ3RoIDwgMiB8fCBncmlkUG9zaXRpb24ubGVuZ3RoID4gMykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgZ3JpZCBwb3NpdGlvbi4gTXVzdCBiZSAyIHRvIDMgY2hhcmFjdGVycyBsb25nLlwiKTtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIGdyaWQgcG9zaXRpb24gYWdhaW5zdCB0aGUgZ3JpZCBtYXRyaXhcbiAgY29uc3QgdmFsaWRHcmlkUG9zaXRpb25zID0gZ3JpZC5mbGF0KCk7IC8vIEZsYXR0ZW4gdGhlIGdyaWQgZm9yIGVhc2llciBzZWFyY2hpbmdcbiAgaWYgKCF2YWxpZEdyaWRQb3NpdGlvbnMuaW5jbHVkZXMoZ3JpZFBvc2l0aW9uKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIFwiSW52YWxpZCBncmlkIHBvc2l0aW9uLiBEb2VzIG5vdCBtYXRjaCBhbnkgdmFsaWQgZ3JpZCB2YWx1ZXMuXCIsXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0IHJlc3VsdCA9IHsgZ3JpZFBvc2l0aW9uIH07XG5cbiAgaWYgKCFpc01vdmUpIHtcbiAgICAvLyBQcm9jZXNzIGFuZCB2YWxpZGF0ZSB0aGUgb3JpZW50YXRpb25cbiAgICBjb25zdCBvcmllbnRhdGlvbiA9IHBhcnRzWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKG9yaWVudGF0aW9uICE9PSBcImhcIiAmJiBvcmllbnRhdGlvbiAhPT0gXCJ2XCIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgXCJJbnZhbGlkIG9yaWVudGF0aW9uLiBNdXN0IGJlIGVpdGhlciAnaCcgZm9yIGhvcml6b250YWwgb3IgJ3YnIGZvciB2ZXJ0aWNhbC5cIixcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmVzdWx0Lm9yaWVudGF0aW9uID0gb3JpZW50YXRpb247XG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIHByb2Nlc3NlZCBhbmQgdmFsaWRhdGVkIGNvbW1hbmQgcGFydHNcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8vIFRoZSBmdW5jdGlvbiBmb3IgdXBkYXRpbmcgdGhlIG91dHB1dCBkaXYgZWxlbWVudFxuY29uc3QgdXBkYXRlT3V0cHV0ID0gKG1lc3NhZ2UsIHR5cGUpID0+IHtcbiAgLy8gR2V0IHRoZSBvdXB1dCBlbGVtZW50XG4gIGNvbnN0IG91dHB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1vdXRwdXRcIik7XG5cbiAgLy8gQXBwZW5kIG5ldyBtZXNzYWdlXG4gIGNvbnN0IG1lc3NhZ2VFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTsgLy8gQ3JlYXRlIGEgbmV3IGRpdiBmb3IgdGhlIG1lc3NhZ2VcbiAgbWVzc2FnZUVsZW1lbnQudGV4dENvbnRlbnQgPSBtZXNzYWdlOyAvLyBTZXQgdGhlIHRleHQgY29udGVudCB0byB0aGUgbWVzc2FnZVxuXG4gIC8vIEFwcGx5IHN0eWxpbmcgYmFzZWQgb24gcHJvbXB0VHlwZVxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIFwidmFsaWRcIjpcbiAgICAgIG1lc3NhZ2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoaGl0VGV4dENscik7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwibWlzc1wiOlxuICAgICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZChtaXNzVGV4dENscik7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgIG1lc3NhZ2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoZXJyb3JUZXh0Q2xyKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKGRlZmF1bHRUZXh0Q2xyKTsgLy8gRGVmYXVsdCB0ZXh0IGNvbG9yXG4gIH1cblxuICBvdXRwdXQuYXBwZW5kQ2hpbGQobWVzc2FnZUVsZW1lbnQpOyAvLyBBZGQgdGhlIGVsZW1lbnQgdG8gdGhlIG91dHB1dFxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBvdXRwdXQuc2Nyb2xsVG9wID0gb3V0cHV0LnNjcm9sbEhlaWdodDsgLy8gU2Nyb2xsIHRvIHRoZSBib3R0b20gb2YgdGhlIG91dHB1dCBjb250YWluZXJcbn07XG5cbi8vIFRoZSBmdW5jdGlvbiBmb3IgZXhlY3V0aW5nIGNvbW1hbmRzIGZyb20gdGhlIGNvbnNvbGUgaW5wdXRcbmNvbnN0IGNvbnNvbGVMb2dQbGFjZW1lbnRDb21tYW5kID0gKHNoaXBUeXBlLCBncmlkUG9zaXRpb24sIG9yaWVudGF0aW9uKSA9PiB7XG4gIC8vIFNldCB0aGUgb3JpZW50YXRpb24gZmVlZGJhY2tcbiAgY29uc3QgZGlyRmVlYmFjayA9IG9yaWVudGF0aW9uID09PSBcImhcIiA/IFwiaG9yaXpvbnRhbGx5XCIgOiBcInZlcnRpY2FsbHlcIjtcbiAgLy8gU2V0IHRoZSBjb25zb2xlIG1lc3NhZ2VcbiAgY29uc3QgbWVzc2FnZSA9IGAke3NoaXBUeXBlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc2hpcFR5cGUuc2xpY2UoMSl9IHBsYWNlZCBhdCAke2dyaWRQb3NpdGlvbn0gZmFjaW5nICR7ZGlyRmVlYmFja31gO1xuXG4gIHVwZGF0ZU91dHB1dChgPiAke21lc3NhZ2V9YCwgXCJ2YWxpZFwiKTtcblxuICAvLyBDbGVhciB0aGUgaW5wdXRcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLWlucHV0XCIpLnZhbHVlID0gXCJcIjtcbn07XG5cbi8vIFRoZSBmdW5jdGlvbiBmb3IgZXhlY3V0aW5nIGNvbW1hbmRzIGZyb20gdGhlIGNvbnNvbGUgaW5wdXRcbmNvbnN0IGNvbnNvbGVMb2dNb3ZlQ29tbWFuZCA9IChyZXN1bHRzT2JqZWN0KSA9PiB7XG4gIC8vIFNldCB0aGUgY29uc29sZSBtZXNzYWdlXG4gIGNvbnN0IG1lc3NhZ2UgPSBgVGhlICR7cmVzdWx0c09iamVjdC5wbGF5ZXJ9J3MgbW92ZSBvbiAke3Jlc3VsdHNPYmplY3QubW92ZX0gcmVzdWx0ZWQgaW4gYSAke3Jlc3VsdHNPYmplY3QuaGl0ID8gXCJISVRcIiA6IFwiTUlTU1wifSFgO1xuXG4gIHVwZGF0ZU91dHB1dChgPiAke21lc3NhZ2V9YCwgcmVzdWx0c09iamVjdC5oaXQgPyBcInZhbGlkXCIgOiBcIm1pc3NcIik7XG5cbiAgLy8gQ2xlYXIgdGhlIGlucHV0XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1pbnB1dFwiKS52YWx1ZSA9IFwiXCI7XG59O1xuXG5jb25zdCBjb25zb2xlTG9nU2hpcFNpbmsgPSAocmVzdWx0c09iamVjdCkgPT4ge1xuICBjb25zdCB7IHBsYXllciwgc2hpcFR5cGUgfSA9IHJlc3VsdHNPYmplY3Q7XG4gIC8vIFNldCB0aGUgY29uc29sZSBtZXNzYWdlXG4gIGNvbnN0IG1lc3NhZ2UgPVxuICAgIHBsYXllciA9PT0gXCJodW1hblwiXG4gICAgICA/IGBZb3Ugc3VuayB0aGVpciAke3NoaXBUeXBlfSFgXG4gICAgICA6IGBUaGV5IHN1bmsgeW91ciAke3NoaXBUeXBlfSFgO1xuXG4gIHVwZGF0ZU91dHB1dChgPiAke21lc3NhZ2V9YCwgXCJlcnJvclwiKTtcblxuICAvLyBDbGVhciB0aGUgaW5wdXRcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlLWlucHV0XCIpLnZhbHVlID0gXCJcIjtcbn07XG5cbmNvbnN0IGNvbnNvbGVMb2dFcnJvciA9IChlcnJvciwgc2hpcFR5cGUpID0+IHtcbiAgaWYgKHNoaXBUeXBlKSB7XG4gICAgLy8gSWYgc2hpcFR5cGUgaXMgcGFzc2VkIHRoZW4gcHJvY2VzcyBlcnJvciBhcyBwbGFjZW1lbnQgZXJyb3JcbiAgICBjb25zb2xlLmVycm9yKGBFcnJvciBwbGFjaW5nICR7c2hpcFR5cGV9OiBtZXNzYWdlID0gJHtlcnJvci5tZXNzYWdlfS5gKTtcblxuICAgIHVwZGF0ZU91dHB1dChgPiBFcnJvciBwbGFjaW5nICR7c2hpcFR5cGV9OiAke2Vycm9yLm1lc3NhZ2V9YCwgXCJlcnJvclwiKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBlbHNlIGlmIHNoaXBUeXBlIGlzIHVuZGVmaW5lZCwgcHJvY2VzcyBlcnJvciBhcyBtb3ZlIGVycm9yXG4gICAgdXBkYXRlT3V0cHV0KGA+IEVycm9yIG1ha2luZyBtb3ZlOiBtZXNzYWdlID0gJHtlcnJvci5tZXNzYWdlfS5gLCBcImVycm9yXCIpO1xuICB9XG5cbiAgLy8gQ2xlYXIgdGhlIGlucHV0XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1pbnB1dFwiKS52YWx1ZSA9IFwiXCI7XG59O1xuXG4vLyBGdW5jdGlvbiBpbml0aWFsaXNlIHVpTWFuYWdlclxuY29uc3QgaW5pdFVpTWFuYWdlciA9ICh1aU1hbmFnZXIpID0+IHtcbiAgLy8gSW5pdGlhbGlzZSBjb25zb2xlXG4gIHVpTWFuYWdlci5pbml0Q29uc29sZVVJKCk7XG5cbiAgLy8gSW5pdGlhbGlzZSBnYW1lYm9hcmQgd2l0aCBjYWxsYmFjayBmb3IgY2VsbCBjbGlja3NcbiAgdWlNYW5hZ2VyLmNyZWF0ZUdhbWVib2FyZChcImh1bWFuLWdiXCIpO1xuICB1aU1hbmFnZXIuY3JlYXRlR2FtZWJvYXJkKFwiY29tcC1nYlwiKTtcbn07XG5cbi8vIEZ1bmN0aW9uIHRvIGNhbGN1bGF0ZSBjZWxsIElEcyBiYXNlZCBvbiBzdGFydCBwb3NpdGlvbiwgbGVuZ3RoLCBhbmQgb3JpZW50YXRpb25cbmZ1bmN0aW9uIGNhbGN1bGF0ZVNoaXBDZWxscyhzdGFydENlbGwsIHNoaXBMZW5ndGgsIG9yaWVudGF0aW9uKSB7XG4gIGNvbnN0IGNlbGxJZHMgPSBbXTtcbiAgY29uc3Qgcm93SW5kZXggPSBzdGFydENlbGwuY2hhckNvZGVBdCgwKSAtIFwiQVwiLmNoYXJDb2RlQXQoMCk7XG4gIGNvbnN0IGNvbEluZGV4ID0gcGFyc2VJbnQoc3RhcnRDZWxsLnN1YnN0cmluZygxKSwgMTApIC0gMTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHNoaXBMZW5ndGg7IGkrKykge1xuICAgIGlmIChvcmllbnRhdGlvbiA9PT0gXCJ2XCIpIHtcbiAgICAgIGlmIChjb2xJbmRleCArIGkgPj0gZ3JpZFswXS5sZW5ndGgpIGJyZWFrOyAvLyBDaGVjayBncmlkIGJvdW5kc1xuICAgICAgY2VsbElkcy5wdXNoKFxuICAgICAgICBgJHtTdHJpbmcuZnJvbUNoYXJDb2RlKHJvd0luZGV4ICsgXCJBXCIuY2hhckNvZGVBdCgwKSl9JHtjb2xJbmRleCArIGkgKyAxfWAsXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocm93SW5kZXggKyBpID49IGdyaWQubGVuZ3RoKSBicmVhazsgLy8gQ2hlY2sgZ3JpZCBib3VuZHNcbiAgICAgIGNlbGxJZHMucHVzaChcbiAgICAgICAgYCR7U3RyaW5nLmZyb21DaGFyQ29kZShyb3dJbmRleCArIGkgKyBcIkFcIi5jaGFyQ29kZUF0KDApKX0ke2NvbEluZGV4ICsgMX1gLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY2VsbElkcztcbn1cblxuLy8gRnVuY3Rpb24gdG8gaGlnaGxpZ2h0IGNlbGxzXG5mdW5jdGlvbiBoaWdobGlnaHRDZWxscyhjZWxsSWRzKSB7XG4gIGNlbGxJZHMuZm9yRWFjaCgoY2VsbElkKSA9PiB7XG4gICAgY29uc3QgY2VsbEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1wb3NpdGlvbj1cIiR7Y2VsbElkfVwiXWApO1xuICAgIGlmIChjZWxsRWxlbWVudCkge1xuICAgICAgY2VsbEVsZW1lbnQuY2xhc3NMaXN0LmFkZChoaWdobGlnaHRDbHIpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIEZ1bmN0aW9uIHRvIGNsZWFyIGhpZ2hsaWdodCBmcm9tIGNlbGxzXG5mdW5jdGlvbiBjbGVhckhpZ2hsaWdodChjZWxsSWRzKSB7XG4gIGNlbGxJZHMuZm9yRWFjaCgoY2VsbElkKSA9PiB7XG4gICAgY29uc3QgY2VsbEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1wb3NpdGlvbj1cIiR7Y2VsbElkfVwiXWApO1xuICAgIGlmIChjZWxsRWxlbWVudCkge1xuICAgICAgY2VsbEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShoaWdobGlnaHRDbHIpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIEZ1bmN0aW9uIHRvIHRvZ2dsZSBvcmllbnRhdGlvblxuZnVuY3Rpb24gdG9nZ2xlT3JpZW50YXRpb24oKSB7XG4gIGN1cnJlbnRPcmllbnRhdGlvbiA9IGN1cnJlbnRPcmllbnRhdGlvbiA9PT0gXCJoXCIgPyBcInZcIiA6IFwiaFwiO1xuICAvLyBVcGRhdGUgdGhlIHZpc3VhbCBwcm9tcHQgaGVyZSBpZiBuZWNlc3Nhcnlcbn1cblxuY29uc3QgaGFuZGxlUGxhY2VtZW50SG92ZXIgPSAoZSkgPT4ge1xuICBjb25zdCBjZWxsID0gZS50YXJnZXQ7XG4gIGlmIChcbiAgICBjZWxsLmNsYXNzTGlzdC5jb250YWlucyhcImdhbWVib2FyZC1jZWxsXCIpICYmXG4gICAgY2VsbC5kYXRhc2V0LnBsYXllciA9PT0gXCJodW1hblwiXG4gICkge1xuICAgIC8vIExvZ2ljIHRvIGhhbmRsZSBob3ZlciBlZmZlY3RcbiAgICBjb25zdCBjZWxsUG9zID0gY2VsbC5kYXRhc2V0LnBvc2l0aW9uO1xuICAgIGxhc3RIb3ZlcmVkQ2VsbCA9IGNlbGxQb3M7XG4gICAgY29uc3QgY2VsbHNUb0hpZ2hsaWdodCA9IGNhbGN1bGF0ZVNoaXBDZWxscyhcbiAgICAgIGNlbGxQb3MsXG4gICAgICBjdXJyZW50U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgY3VycmVudE9yaWVudGF0aW9uLFxuICAgICk7XG4gICAgaGlnaGxpZ2h0Q2VsbHMoY2VsbHNUb0hpZ2hsaWdodCk7XG4gIH1cbn07XG5cbmNvbnN0IGhhbmRsZU1vdXNlTGVhdmUgPSAoZSkgPT4ge1xuICBjb25zdCBjZWxsID0gZS50YXJnZXQ7XG4gIGlmIChjZWxsLmNsYXNzTGlzdC5jb250YWlucyhcImdhbWVib2FyZC1jZWxsXCIpKSB7XG4gICAgLy8gTG9naWMgZm9yIGhhbmRsaW5nIHdoZW4gdGhlIGN1cnNvciBsZWF2ZXMgYSBjZWxsXG4gICAgY29uc3QgY2VsbFBvcyA9IGNlbGwuZGF0YXNldC5wb3NpdGlvbjtcbiAgICBpZiAoY2VsbFBvcyA9PT0gbGFzdEhvdmVyZWRDZWxsKSB7XG4gICAgICBjb25zdCBjZWxsc1RvQ2xlYXIgPSBjYWxjdWxhdGVTaGlwQ2VsbHMoXG4gICAgICAgIGNlbGxQb3MsXG4gICAgICAgIGN1cnJlbnRTaGlwLnNoaXBMZW5ndGgsXG4gICAgICAgIGN1cnJlbnRPcmllbnRhdGlvbixcbiAgICAgICk7XG4gICAgICBjbGVhckhpZ2hsaWdodChjZWxsc1RvQ2xlYXIpO1xuICAgICAgbGFzdEhvdmVyZWRDZWxsID0gbnVsbDsgLy8gUmVzZXQgbGFzdEhvdmVyZWRDZWxsIHNpbmNlIHRoZSBtb3VzZSBoYXMgbGVmdFxuICAgIH1cbiAgICBsYXN0SG92ZXJlZENlbGwgPSBudWxsO1xuICB9XG59O1xuXG5jb25zdCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSA9IChlKSA9PiB7XG4gIGUucHJldmVudERlZmF1bHQoKTsgLy8gUHJldmVudCB0aGUgZGVmYXVsdCBzcGFjZWJhciBhY3Rpb25cbiAgaWYgKGUua2V5ID09PSBcIiBcIiAmJiBsYXN0SG92ZXJlZENlbGwpIHtcbiAgICAvLyBFbnN1cmUgc3BhY2ViYXIgaXMgcHJlc3NlZCBhbmQgdGhlcmUncyBhIGxhc3QgaG92ZXJlZCBjZWxsXG5cbiAgICAvLyBUb2dnbGUgdGhlIG9yaWVudGF0aW9uXG4gICAgdG9nZ2xlT3JpZW50YXRpb24oKTtcblxuICAgIC8vIENsZWFyIHByZXZpb3VzbHkgaGlnaGxpZ2h0ZWQgY2VsbHNcbiAgICAvLyBBc3N1bWluZyBjYWxjdWxhdGVTaGlwQ2VsbHMgYW5kIGNsZWFySGlnaGxpZ2h0IHdvcmsgY29ycmVjdGx5XG4gICAgY29uc3Qgb2xkQ2VsbHNUb0NsZWFyID0gY2FsY3VsYXRlU2hpcENlbGxzKFxuICAgICAgbGFzdEhvdmVyZWRDZWxsLFxuICAgICAgY3VycmVudFNoaXAuc2hpcExlbmd0aCxcbiAgICAgIGN1cnJlbnRPcmllbnRhdGlvbiA9PT0gXCJoXCIgPyBcInZcIiA6IFwiaFwiLFxuICAgICk7XG4gICAgY2xlYXJIaWdobGlnaHQob2xkQ2VsbHNUb0NsZWFyKTtcblxuICAgIC8vIEhpZ2hsaWdodCBuZXcgY2VsbHMgYmFzZWQgb24gdGhlIG5ldyBvcmllbnRhdGlvblxuICAgIGNvbnN0IG5ld0NlbGxzVG9IaWdobGlnaHQgPSBjYWxjdWxhdGVTaGlwQ2VsbHMoXG4gICAgICBsYXN0SG92ZXJlZENlbGwsXG4gICAgICBjdXJyZW50U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgY3VycmVudE9yaWVudGF0aW9uLFxuICAgICk7XG4gICAgaGlnaGxpZ2h0Q2VsbHMobmV3Q2VsbHNUb0hpZ2hsaWdodCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGVuYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoKSB7XG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImNvbXB1dGVyXCJdJylcbiAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgY2VsbC5jbGFzc0xpc3QucmVtb3ZlKFwicG9pbnRlci1ldmVudHMtbm9uZVwiLCBcImN1cnNvci1kZWZhdWx0XCIpO1xuICAgICAgY2VsbC5jbGFzc0xpc3QucmVtb3ZlKHByaW1hcnlIb3ZlckNscik7XG4gICAgICBjZWxsLmNsYXNzTGlzdC5hZGQocHJpbWFyeUhvdmVyQ2xyKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZGlzYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoY2VsbHNBcnJheSkge1xuICBjZWxsc0FycmF5LmZvckVhY2goKGNlbGwpID0+IHtcbiAgICBjZWxsLmNsYXNzTGlzdC5hZGQoXCJwb2ludGVyLWV2ZW50cy1ub25lXCIsIFwiY3Vyc29yLWRlZmF1bHRcIik7XG4gICAgY2VsbC5jbGFzc0xpc3QucmVtb3ZlKHByaW1hcnlIb3ZlckNscik7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkaXNhYmxlSHVtYW5HYW1lYm9hcmRIb3ZlcigpIHtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvckFsbCgnLmdhbWVib2FyZC1jZWxsW2RhdGEtcGxheWVyPVwiaHVtYW5cIl0nKVxuICAgIC5mb3JFYWNoKChjZWxsKSA9PiB7XG4gICAgICBjZWxsLmNsYXNzTGlzdC5hZGQoXCJwb2ludGVyLWV2ZW50cy1ub25lXCIsIFwiY3Vyc29yLWRlZmF1bHRcIik7XG4gICAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUocHJpbWFyeUhvdmVyQ2xyKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc3dpdGNoR2FtZWJvYXJkSG92ZXJTdGF0ZXMoKSB7XG4gIC8vIERpc2FibGUgaG92ZXIgb24gdGhlIGh1bWFuJ3MgZ2FtZWJvYXJkXG4gIGRpc2FibGVIdW1hbkdhbWVib2FyZEhvdmVyKCk7XG5cbiAgLy8gRW5hYmxlIGhvdmVyIG9uIHRoZSBjb21wdXRlcidzIGdhbWVib2FyZFxuICBlbmFibGVDb21wdXRlckdhbWVib2FyZEhvdmVyKCk7XG59XG5cbi8vIEZ1bmN0aW9uIHRvIHNldHVwIGdhbWVib2FyZCBmb3Igc2hpcCBwbGFjZW1lbnRcbmNvbnN0IHNldHVwR2FtZWJvYXJkRm9yUGxhY2VtZW50ID0gKCkgPT4ge1xuICBjb25zdCBjb21wR2FtZWJvYXJkQ2VsbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICcuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9XCJjb21wdXRlclwiXScsXG4gICk7XG4gIGRpc2FibGVDb21wdXRlckdhbWVib2FyZEhvdmVyKGNvbXBHYW1lYm9hcmRDZWxscyk7XG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj1cImh1bWFuXCJdJylcbiAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBoYW5kbGVQbGFjZW1lbnRIb3Zlcik7XG4gICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIGhhbmRsZU1vdXNlTGVhdmUpO1xuICAgIH0pO1xuICAvLyBHZXQgZ2FtZWJvYXJkIGFyZWEgZGl2IGVsZW1lbnRcbiAgY29uc3QgZ2FtZWJvYXJkQXJlYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgXCIuZ2FtZWJvYXJkLWFyZWEsIFtkYXRhLXBsYXllcj0naHVtYW4nXVwiLFxuICApO1xuICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIHRvIGdhbWVib2FyZCBhcmVhIHRvIGFkZCBhbmQgcmVtb3ZlIHRoZVxuICAvLyBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSBldmVudCBsaXN0ZW5lciB3aGVuIGVudGVyaW5nIGFuZCBleGl0aW5nIHRoZSBhcmVhXG4gIGdhbWVib2FyZEFyZWEuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlKTtcbiAgfSk7XG4gIGdhbWVib2FyZEFyZWEuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlKTtcbiAgfSk7XG59O1xuXG4vLyBGdW5jdGlvbiB0byBjbGVhbiB1cCBhZnRlciBzaGlwIHBsYWNlbWVudCBpcyBjb21wbGV0ZVxuY29uc3QgY2xlYW51cEFmdGVyUGxhY2VtZW50ID0gKCkgPT4ge1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9XCJodW1hblwiXScpXG4gICAgLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAgIGNlbGwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgaGFuZGxlUGxhY2VtZW50SG92ZXIpO1xuICAgICAgY2VsbC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCBoYW5kbGVNb3VzZUxlYXZlKTtcbiAgICB9KTtcbiAgLy8gR2V0IGdhbWVib2FyZCBhcmVhIGRpdiBlbGVtZW50XG4gIGNvbnN0IGdhbWVib2FyZEFyZWEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgIFwiLmdhbWVib2FyZC1hcmVhLCBbZGF0YS1wbGF5ZXI9J2h1bWFuJ11cIixcbiAgKTtcbiAgLy8gUmVtb3ZlIGV2ZW50IGxpc3RlbmVycyB0byBnYW1lYm9hcmQgYXJlYSB0byBhZGQgYW5kIHJlbW92ZSB0aGVcbiAgLy8gaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUgZXZlbnQgbGlzdGVuZXIgd2hlbiBlbnRlcmluZyBhbmQgZXhpdGluZyB0aGUgYXJlYVxuICBnYW1lYm9hcmRBcmVhLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSk7XG4gIH0pO1xuICBnYW1lYm9hcmRBcmVhLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpID0+IHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVPcmllbnRhdGlvblRvZ2dsZSk7XG4gIH0pO1xuICAvLyBSZW1vdmUgZXZlbnQgbGlzdGVuZXIgZm9yIGtleWRvd24gZXZlbnRzXG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRsZU9yaWVudGF0aW9uVG9nZ2xlKTtcbn07XG5cbi8vIEZ1bmN0aW9uIGZvciBzdGFydGluZyB0aGUgZ2FtZVxuY29uc3Qgc3RhcnRHYW1lID0gYXN5bmMgKHVpTWFuYWdlciwgZ2FtZSkgPT4ge1xuICAvLyBTZXQgdXAgdGhlIGdhbWUgYnkgYXV0byBwbGFjaW5nIGNvbXB1dGVyJ3Mgc2hpcHMgYW5kIHNldHRpbmcgdGhlXG4gIC8vIGN1cnJlbnQgcGxheWVyIHRvIHRoZSBodW1hbiBwbGF5ZXJcbiAgYXdhaXQgZ2FtZS5zZXRVcCgpO1xuXG4gIC8vIFJlbmRlciB0aGUgc2hpcCBkaXNwbGF5IGZvciB0aGUgY29tcHV0ZXIgcGxheWVyXG4gIHNoaXBzVG9QbGFjZS5mb3JFYWNoKChzaGlwKSA9PiB7XG4gICAgdWlNYW5hZ2VyLnJlbmRlclNoaXBEaXNwKGdhbWUucGxheWVycy5jb21wdXRlciwgc2hpcC5zaGlwVHlwZSk7XG4gIH0pO1xuXG4gIC8vIERpc3BsYXkgcHJvbXB0IG9iamVjdCBmb3IgdGFraW5nIGEgdHVybiBhbmQgc3RhcnRpbmcgdGhlIGdhbWVcbiAgdWlNYW5hZ2VyLmRpc3BsYXlQcm9tcHQoeyB0dXJuUHJvbXB0LCBnYW1lcGxheUd1aWRlIH0pO1xufTtcblxuY29uc3QgQWN0aW9uQ29udHJvbGxlciA9ICh1aU1hbmFnZXIsIGdhbWUpID0+IHtcbiAgY29uc3QgaHVtYW5QbGF5ZXIgPSBnYW1lLnBsYXllcnMuaHVtYW47XG4gIGNvbnN0IGh1bWFuUGxheWVyR2FtZWJvYXJkID0gaHVtYW5QbGF5ZXIuZ2FtZWJvYXJkO1xuICBjb25zdCBjb21wUGxheWVyID0gZ2FtZS5wbGF5ZXJzLmNvbXB1dGVyO1xuICBjb25zdCBjb21wUGxheWVyR2FtZWJvYXJkID0gY29tcFBsYXllci5nYW1lYm9hcmQ7XG5cbiAgLy8gRnVuY3Rpb24gdG8gc2V0dXAgZXZlbnQgbGlzdGVuZXJzIGZvciBjb25zb2xlIGFuZCBnYW1lYm9hcmQgY2xpY2tzXG4gIGZ1bmN0aW9uIHNldHVwRXZlbnRMaXN0ZW5lcnMoaGFuZGxlckZ1bmN0aW9uLCBwbGF5ZXJUeXBlKSB7XG4gICAgLy8gRGVmaW5lIGNsZWFudXAgZnVuY3Rpb25zIGluc2lkZSB0byBlbnN1cmUgdGhleSBhcmUgYWNjZXNzaWJsZSBmb3IgcmVtb3ZhbFxuICAgIGNvbnN0IGNsZWFudXBGdW5jdGlvbnMgPSBbXTtcblxuICAgIGNvbnN0IGNvbnNvbGVTdWJtaXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtc3VibWl0XCIpO1xuICAgIGNvbnN0IGNvbnNvbGVJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29uc29sZS1pbnB1dFwiKTtcblxuICAgIGNvbnN0IHN1Ym1pdEhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICBjb25zdCBpbnB1dCA9IGNvbnNvbGVJbnB1dC52YWx1ZTtcbiAgICAgIGhhbmRsZXJGdW5jdGlvbihpbnB1dCk7XG4gICAgICBjb25zb2xlSW5wdXQudmFsdWUgPSBcIlwiOyAvLyBDbGVhciBpbnB1dCBhZnRlciBzdWJtaXNzaW9uXG4gICAgfTtcblxuICAgIGNvbnN0IGtleXByZXNzSGFuZGxlciA9IChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09IFwiRW50ZXJcIikge1xuICAgICAgICBzdWJtaXRIYW5kbGVyKCk7IC8vIFJldXNlIHN1Ym1pdCBsb2dpYyBmb3IgRW50ZXIga2V5IHByZXNzXG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnNvbGVTdWJtaXRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHN1Ym1pdEhhbmRsZXIpO1xuICAgIGNvbnNvbGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwga2V5cHJlc3NIYW5kbGVyKTtcblxuICAgIC8vIEFkZCBjbGVhbnVwIGZ1bmN0aW9uIGZvciBjb25zb2xlIGxpc3RlbmVyc1xuICAgIGNsZWFudXBGdW5jdGlvbnMucHVzaCgoKSA9PiB7XG4gICAgICBjb25zb2xlU3VibWl0QnV0dG9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzdWJtaXRIYW5kbGVyKTtcbiAgICAgIGNvbnNvbGVJbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwga2V5cHJlc3NIYW5kbGVyKTtcbiAgICB9KTtcblxuICAgIC8vIFNldHVwIGZvciBnYW1lYm9hcmQgY2VsbCBjbGlja3NcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoYC5nYW1lYm9hcmQtY2VsbFtkYXRhLXBsYXllcj0ke3BsYXllclR5cGV9XWApXG4gICAgICAuZm9yRWFjaCgoY2VsbCkgPT4ge1xuICAgICAgICBjb25zdCBjbGlja0hhbmRsZXIgPSAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgeyBwb3NpdGlvbiB9ID0gY2VsbC5kYXRhc2V0O1xuICAgICAgICAgIGxldCBpbnB1dDtcbiAgICAgICAgICBpZiAocGxheWVyVHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICAgICAgICBpbnB1dCA9IGAke3Bvc2l0aW9ufSAke2N1cnJlbnRPcmllbnRhdGlvbn1gO1xuICAgICAgICAgIH0gZWxzZSBpZiAocGxheWVyVHlwZSA9PT0gXCJjb21wdXRlclwiKSB7XG4gICAgICAgICAgICBpbnB1dCA9IHBvc2l0aW9uO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIFwiRXJyb3IhIEludmFsaWQgcGxheWVyIHR5cGUgcGFzc2VkIHRvIGNsaWNrSGFuZGxlciFcIixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGhhbmRsZXJGdW5jdGlvbihpbnB1dCk7XG4gICAgICAgIH07XG4gICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsaWNrSGFuZGxlcik7XG5cbiAgICAgICAgLy8gQWRkIGNsZWFudXAgZnVuY3Rpb24gZm9yIGVhY2ggY2VsbCBsaXN0ZW5lclxuICAgICAgICBjbGVhbnVwRnVuY3Rpb25zLnB1c2goKCkgPT5cbiAgICAgICAgICBjZWxsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbGlja0hhbmRsZXIpLFxuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICAvLyBSZXR1cm4gYSBzaW5nbGUgY2xlYW51cCBmdW5jdGlvbiB0byByZW1vdmUgYWxsIGxpc3RlbmVyc1xuICAgIHJldHVybiAoKSA9PiBjbGVhbnVwRnVuY3Rpb25zLmZvckVhY2goKGNsZWFudXApID0+IGNsZWFudXAoKSk7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBwcm9tcHRBbmRQbGFjZVNoaXAoc2hpcFR5cGUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgLy8gU2V0IHRoZSBjdXJyZW50IHNoaXBcbiAgICAgIGN1cnJlbnRTaGlwID0gc2hpcHNUb1BsYWNlLmZpbmQoKHNoaXApID0+IHNoaXAuc2hpcFR5cGUgPT09IHNoaXBUeXBlKTtcblxuICAgICAgLy8gRGlzcGxheSBwcm9tcHQgZm9yIHRoZSBzcGVjaWZpYyBzaGlwIHR5cGUgYXMgd2VsbCBhcyB0aGUgZ3VpZGUgdG8gcGxhY2luZyBzaGlwc1xuICAgICAgY29uc3QgcGxhY2VTaGlwUHJvbXB0ID0ge1xuICAgICAgICBwcm9tcHQ6IGBQbGFjZSB5b3VyICR7c2hpcFR5cGV9LmAsXG4gICAgICAgIHByb21wdFR5cGU6IFwiaW5zdHJ1Y3Rpb25cIixcbiAgICAgIH07XG4gICAgICB1aU1hbmFnZXIuZGlzcGxheVByb21wdCh7IHBsYWNlU2hpcFByb21wdCwgcGxhY2VTaGlwR3VpZGUgfSk7XG5cbiAgICAgIGNvbnN0IGhhbmRsZVZhbGlkSW5wdXQgPSBhc3luYyAoaW5wdXQpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB7IGdyaWRQb3NpdGlvbiwgb3JpZW50YXRpb24gfSA9IHByb2Nlc3NDb21tYW5kKGlucHV0LCBmYWxzZSk7XG4gICAgICAgICAgYXdhaXQgaHVtYW5QbGF5ZXJHYW1lYm9hcmQucGxhY2VTaGlwKFxuICAgICAgICAgICAgc2hpcFR5cGUsXG4gICAgICAgICAgICBncmlkUG9zaXRpb24sXG4gICAgICAgICAgICBvcmllbnRhdGlvbixcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnNvbGVMb2dQbGFjZW1lbnRDb21tYW5kKHNoaXBUeXBlLCBncmlkUG9zaXRpb24sIG9yaWVudGF0aW9uKTtcbiAgICAgICAgICAvLyBSZW1vdmUgY2VsbCBoaWdobGlnaHRzXG4gICAgICAgICAgY29uc3QgY2VsbHNUb0NsZWFyID0gY2FsY3VsYXRlU2hpcENlbGxzKFxuICAgICAgICAgICAgZ3JpZFBvc2l0aW9uLFxuICAgICAgICAgICAgY3VycmVudFNoaXAuc2hpcExlbmd0aCxcbiAgICAgICAgICAgIG9yaWVudGF0aW9uLFxuICAgICAgICAgICk7XG4gICAgICAgICAgY2xlYXJIaWdobGlnaHQoY2VsbHNUb0NsZWFyKTtcblxuICAgICAgICAgIC8vIERpc3BsYXkgdGhlIHNoaXAgb24gdGhlIGdhbWUgYm9hcmQgYW5kIHNoaXAgc3RhdHVzIGRpc3BsYXlcbiAgICAgICAgICB1aU1hbmFnZXIucmVuZGVyU2hpcEJvYXJkKGh1bWFuUGxheWVyLCBzaGlwVHlwZSk7XG4gICAgICAgICAgdWlNYW5hZ2VyLnJlbmRlclNoaXBEaXNwKGh1bWFuUGxheWVyLCBzaGlwVHlwZSk7XG5cbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlLWJlZm9yZS1kZWZpbmVcbiAgICAgICAgICByZXNvbHZlU2hpcFBsYWNlbWVudCgpOyAvLyBTaGlwIHBsYWNlZCBzdWNjZXNzZnVsbHksIHJlc29sdmUgdGhlIHByb21pc2VcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlTG9nRXJyb3IoZXJyb3IsIHNoaXBUeXBlKTtcbiAgICAgICAgICAvLyBEbyBub3QgcmVqZWN0IHRvIGFsbG93IGZvciByZXRyeSwganVzdCBsb2cgdGhlIGVycm9yXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIFNldHVwIGV2ZW50IGxpc3RlbmVycyBhbmQgZW5zdXJlIHdlIGNhbiBjbGVhbiB0aGVtIHVwIGFmdGVyIHBsYWNlbWVudFxuICAgICAgY29uc3QgY2xlYW51cCA9IHNldHVwRXZlbnRMaXN0ZW5lcnMoaGFuZGxlVmFsaWRJbnB1dCwgXCJodW1hblwiKTtcblxuICAgICAgLy8gQXR0YWNoIGNsZWFudXAgdG8gcmVzb2x2ZSB0byBlbnN1cmUgaXQncyBjYWxsZWQgd2hlbiB0aGUgcHJvbWlzZSByZXNvbHZlc1xuICAgICAgY29uc3QgcmVzb2x2ZVNoaXBQbGFjZW1lbnQgPSAoKSA9PiB7XG4gICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFNlcXVlbnRpYWxseSBwcm9tcHQgZm9yIGFuZCBwbGFjZSBlYWNoIHNoaXBcbiAgYXN5bmMgZnVuY3Rpb24gc2V0dXBTaGlwc1NlcXVlbnRpYWxseSgpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNoaXBzVG9QbGFjZS5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWF3YWl0LWluLWxvb3BcbiAgICAgIGF3YWl0IHByb21wdEFuZFBsYWNlU2hpcChzaGlwc1RvUGxhY2VbaV0uc2hpcFR5cGUpOyAvLyBXYWl0IGZvciBlYWNoIHNoaXAgdG8gYmUgcGxhY2VkIGJlZm9yZSBjb250aW51aW5nXG4gICAgfVxuICB9XG5cbiAgLy8gRnVuY3Rpb24gZm9yIGhhbmRsaW5nIHRoZSBnYW1lIHNldHVwIGFuZCBzaGlwIHBsYWNlbWVudFxuICBjb25zdCBoYW5kbGVTZXR1cCA9IGFzeW5jICgpID0+IHtcbiAgICAvLyBJbml0IHRoZSBVSVxuICAgIGluaXRVaU1hbmFnZXIodWlNYW5hZ2VyKTtcbiAgICBzZXR1cEdhbWVib2FyZEZvclBsYWNlbWVudCgpO1xuICAgIGF3YWl0IHNldHVwU2hpcHNTZXF1ZW50aWFsbHkoKTtcbiAgICAvLyBQcm9jZWVkIHdpdGggdGhlIHJlc3Qgb2YgdGhlIGdhbWUgc2V0dXAgYWZ0ZXIgYWxsIHNoaXBzIGFyZSBwbGFjZWRcbiAgICBjbGVhbnVwQWZ0ZXJQbGFjZW1lbnQoKTtcblxuICAgIC8vIFN0YXJ0IHRoZSBnYW1lXG4gICAgYXdhaXQgc3RhcnRHYW1lKHVpTWFuYWdlciwgZ2FtZSk7XG5cbiAgICBjb25zdCBvdXRwdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnNvbGUtb3V0cHV0XCIpO1xuICAgIHVwZGF0ZU91dHB1dChcIj4gQWxsIHNoaXBzIHBsYWNlZCwgZ2FtZSBzZXR1cCBjb21wbGV0ZSFcIik7XG4gICAgc3dpdGNoR2FtZWJvYXJkSG92ZXJTdGF0ZXMoKTtcbiAgfTtcblxuICBjb25zdCB1cGRhdGVEaXNwbGF5cyA9IChtb3ZlUmVzdWx0KSA9PiB7XG4gICAgLy8gU2V0IHRoZSBwbGF5ZXIgc2VsZWN0b3Igb2YgdGhlIG9wcG9uZW50IGRlcGVuZGluZyBvbiB0aGUgcGxheWVyXG4gICAgLy8gd2hvIG1hZGUgdGhlIG1vdmVcbiAgICBjb25zdCBwbGF5ZXJTZWxlY3RvciA9IG1vdmVSZXN1bHQucGxheWVyID09PSBcImh1bWFuXCIgPyBcImNvbXB1dGVyXCIgOiBcImh1bWFuXCI7XG4gICAgLy8gR2V0IHRoZSBET00gZWxlbWVudCBmb3IgdGhlIGNlbGxcbiAgICBjb25zdCBjZWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgIGAuZ2FtZWJvYXJkLWNlbGxbZGF0YS1wbGF5ZXI9JHtwbGF5ZXJTZWxlY3Rvcn1dW2RhdGEtcG9zaXRpb249JHttb3ZlUmVzdWx0Lm1vdmV9XWAsXG4gICAgKTtcblxuICAgIC8vIERpc2FibGUgdGhlIGNlbGwgZnJvbSBmdXR1cmUgY2xpY2tzXG4gICAgZGlzYWJsZUNvbXB1dGVyR2FtZWJvYXJkSG92ZXIoW2NlbGxdKTtcblxuICAgIC8vIEhhbmRsZSBtaXNzIGFuZCBoaXRcbiAgICBpZiAoIW1vdmVSZXN1bHQuaGl0KSB7XG4gICAgICAvLyBVcGRhdGUgdGhlIGNlbGxzIHN0eWxpbmcgdG8gcmVmbGVjdCBtaXNzXG4gICAgICBjZWxsLmNsYXNzTGlzdC5hZGQobWlzc0JnQ2xyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVXBkYXRlIHRoZSBzaGlwIHNlY3Rpb24gaW4gdGhlIHNoaXAgc3RhdHVzIGRpc3BsYXlcbiAgICAgIHVpTWFuYWdlci51cGRhdGVTaGlwU2VjdGlvbihcbiAgICAgICAgbW92ZVJlc3VsdC5tb3ZlLFxuICAgICAgICBtb3ZlUmVzdWx0LnNoaXBUeXBlLFxuICAgICAgICBwbGF5ZXJTZWxlY3RvcixcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIGFzeW5jIGZ1bmN0aW9uIHByb21wdFBsYXllck1vdmUoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCBodW1hbk1vdmVSZXN1bHQ7XG5cbiAgICAgIGNvbnN0IGhhbmRsZVZhbGlkTW92ZSA9IGFzeW5jIChtb3ZlKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgeyBncmlkUG9zaXRpb24gfSA9IHByb2Nlc3NDb21tYW5kKG1vdmUsIHRydWUpO1xuICAgICAgICAgIGh1bWFuTW92ZVJlc3VsdCA9IGF3YWl0IGh1bWFuUGxheWVyLm1ha2VNb3ZlKFxuICAgICAgICAgICAgY29tcFBsYXllckdhbWVib2FyZCxcbiAgICAgICAgICAgIGdyaWRQb3NpdGlvbixcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSBjb21wdXRlciBwbGF5ZXIncyBzaGlwcyBkaXNwbGF5IGFuZCBnYW1lYm9hcmRcbiAgICAgICAgICAvLyBkZXBlbmRpbmcgb24gb3V0Y29tZSBvZiBtb3ZlXG4gICAgICAgICAgdXBkYXRlRGlzcGxheXMoaHVtYW5Nb3ZlUmVzdWx0KTtcblxuICAgICAgICAgIC8vIENvbW11bmljYXRlIHRoZSByZXN1bHQgb2YgdGhlIG1vdmUgdG8gdGhlIHVzZXJcbiAgICAgICAgICBjb25zb2xlTG9nTW92ZUNvbW1hbmQoaHVtYW5Nb3ZlUmVzdWx0KTtcblxuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11c2UtYmVmb3JlLWRlZmluZVxuICAgICAgICAgIHJlc29sdmVNb3ZlKCk7IC8vIE1vdmUgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5LCByZXNvbHZlIHRoZSBwcm9taXNlXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZUxvZ0Vycm9yKGVycm9yKTtcbiAgICAgICAgICAvLyBEbyBub3QgcmVqZWN0IHRvIGFsbG93IGZvciByZXRyeSwganVzdCBsb2cgdGhlIGVycm9yXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIFNldHVwIGV2ZW50IGxpc3RlbmVycyBhbmQgZW5zdXJlIHdlIGNhbiBjbGVhbiB0aGVtIHVwIGFmdGVyIHBsYWNlbWVudFxuICAgICAgY29uc3QgY2xlYW51cCA9IHNldHVwRXZlbnRMaXN0ZW5lcnMoaGFuZGxlVmFsaWRNb3ZlLCBcImNvbXB1dGVyXCIpO1xuXG4gICAgICAvLyBBdHRhY2ggY2xlYW51cCB0byByZXNvbHZlIHRvIGVuc3VyZSBpdCdzIGNhbGxlZCB3aGVuIHRoZSBwcm9taXNlIHJlc29sdmVzXG4gICAgICBjb25zdCByZXNvbHZlTW92ZSA9ICgpID0+IHtcbiAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICByZXNvbHZlKGh1bWFuTW92ZVJlc3VsdCk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gY29tcHV0ZXJNb3ZlKCkge1xuICAgIGxldCBjb21wTW92ZVJlc3VsdDtcbiAgICB0cnkge1xuICAgICAgLy8gQ29tcHV0ZXIgbG9naWMgdG8gY2hvb3NlIGEgbW92ZVxuICAgICAgLy8gVXBkYXRlIFVJIGJhc2VkIG9uIG1vdmVcbiAgICAgIGNvbXBNb3ZlUmVzdWx0ID0gY29tcFBsYXllci5tYWtlTW92ZShodW1hblBsYXllckdhbWVib2FyZCk7XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgaHVtYW4gcGxheWVyJ3Mgc2hpcHMgZGlzcGxheSBhbmQgZ2FtZWJvYXJkXG4gICAgICAvLyBkZXBlbmRpbmcgb24gb3V0Y29tZSBvZiBtb3ZlXG4gICAgICB1cGRhdGVEaXNwbGF5cyhjb21wTW92ZVJlc3VsdCk7XG5cbiAgICAgIC8vIExvZyB0aGUgcmVzdWx0IG9mIHRoZSBjb21wdXRlcidzIG1vdmUgdG8gdGhlIGNvbnNvbGVcbiAgICAgIGNvbnNvbGVMb2dNb3ZlQ29tbWFuZChjb21wTW92ZVJlc3VsdCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGVMb2dFcnJvcihlcnJvcik7XG4gICAgfVxuICAgIHJldHVybiBjb21wTW92ZVJlc3VsdDtcbiAgfVxuXG4gIGNvbnN0IGNoZWNrU2hpcElzU3VuayA9IChnYW1lYm9hcmQsIHNoaXBUeXBlKSA9PlxuICAgIGdhbWVib2FyZC5pc1NoaXBTdW5rKHNoaXBUeXBlKTtcblxuICBjb25zdCBjaGVja1dpbkNvbmRpdGlvbiA9IChnYW1lYm9hcmQpID0+IGdhbWVib2FyZC5jaGVja0FsbFNoaXBzU3VuaygpO1xuXG4gIGNvbnN0IHJlc3RhcnRHYW1lID0gKCkgPT4ge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgfTtcblxuICBmdW5jdGlvbiBjb25jbHVkZUdhbWUod2lubmVyKSB7XG4gICAgLy8gRGlzcGxheSB3aW5uZXIsIHVwZGF0ZSBVSSwgZXRjLlxuICAgIGNvbnN0IG1lc3NhZ2UgPSBgR2FtZSBPdmVyISBUaGUgJHt3aW5uZXJ9IHBsYXllciB3aW5zIWA7XG4gICAgdXBkYXRlT3V0cHV0KGA+ICR7bWVzc2FnZX1gLCB3aW5uZXIgPT09IFwiaHVtYW5cIiA/IFwidmFsaWRcIiA6IFwiZXJyb3JcIik7XG5cbiAgICAvLyBSZXN0YXJ0IHRoZSBnYW1lXG4gICAgdWlNYW5hZ2VyLnByb21wdEVuZEdhbWUod2lubmVyKTtcblxuICAgIC8vIEF0dGFjaCBldmVudCBsaXN0ZW5lciB0byB0aGUgYnV0dG9uXG4gICAgY29uc3QgcmVzdGFydEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdGFydC1idXR0b25cIik7XG4gICAgcmVzdGFydEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgcmVzdGFydEdhbWUpO1xuICB9XG5cbiAgLy8gRnVuY3Rpb24gZm9yIGhhbmRsaW5nIHRoZSBwbGF5aW5nIG9mIHRoZSBnYW1lXG4gIGNvbnN0IHBsYXlHYW1lID0gYXN5bmMgKCkgPT4ge1xuICAgIGxldCBnYW1lT3ZlciA9IGZhbHNlO1xuICAgIGxldCBsYXN0Q29tcE1vdmVSZXN1bHQ7XG4gICAgbGV0IGxhc3RIdW1hbk1vdmVSZXN1bHQ7XG4gICAgbGV0IHdpbm5lcjtcblxuICAgIHdoaWxlICghZ2FtZU92ZXIpIHtcbiAgICAgIC8vIFBsYXllciBtYWtlcyBhIG1vdmVcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wXG4gICAgICBsYXN0SHVtYW5Nb3ZlUmVzdWx0ID0gYXdhaXQgcHJvbXB0UGxheWVyTW92ZSgpO1xuXG4gICAgICAvLyBDaGVjayBmb3IgaGl0XG4gICAgICBpZiAobGFzdEh1bWFuTW92ZVJlc3VsdC5oaXQpIHtcbiAgICAgICAgY29uc3QgeyBzaGlwVHlwZSB9ID0gbGFzdEh1bWFuTW92ZVJlc3VsdDtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIHNoaXAgc2lua1xuICAgICAgICBjb25zdCBpc1N1bmsgPSBjaGVja1NoaXBJc1N1bmsoY29tcFBsYXllckdhbWVib2FyZCwgc2hpcFR5cGUpO1xuICAgICAgICBpZiAoaXNTdW5rKSB7XG4gICAgICAgICAgY29uc29sZUxvZ1NoaXBTaW5rKGxhc3RIdW1hbk1vdmVSZXN1bHQpO1xuICAgICAgICAgIHVpTWFuYWdlci5yZW5kZXJTdW5rZW5TaGlwKGNvbXBQbGF5ZXIsIHNoaXBUeXBlKTtcblxuICAgICAgICAgIC8vIENoZWNrIGZvciB3aW4gY29uZGl0aW9uXG4gICAgICAgICAgZ2FtZU92ZXIgPSBjaGVja1dpbkNvbmRpdGlvbihjb21wUGxheWVyR2FtZWJvYXJkKTtcbiAgICAgICAgICBpZiAoZ2FtZU92ZXIpIHtcbiAgICAgICAgICAgIHdpbm5lciA9IFwiaHVtYW5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBDb21wdXRlciBtYWtlcyBhIG1vdmVcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wXG4gICAgICBsYXN0Q29tcE1vdmVSZXN1bHQgPSBhd2FpdCBjb21wdXRlck1vdmUoKTtcblxuICAgICAgLy8gQ2hlY2sgZm9yIGhpdFxuICAgICAgaWYgKGxhc3RDb21wTW92ZVJlc3VsdC5oaXQpIHtcbiAgICAgICAgY29uc3QgeyBzaGlwVHlwZSB9ID0gbGFzdENvbXBNb3ZlUmVzdWx0O1xuICAgICAgICAvLyBDaGVjayBmb3Igc2hpcCBzaW5rXG4gICAgICAgIGNvbnN0IGlzU3VuayA9IGNoZWNrU2hpcElzU3VuayhodW1hblBsYXllckdhbWVib2FyZCwgc2hpcFR5cGUpO1xuICAgICAgICBpZiAoaXNTdW5rKSB7XG4gICAgICAgICAgY29uc29sZUxvZ1NoaXBTaW5rKGxhc3RDb21wTW92ZVJlc3VsdCk7XG4gICAgICAgICAgdWlNYW5hZ2VyLnJlbmRlclN1bmtlblNoaXAoaHVtYW5QbGF5ZXIsIHNoaXBUeXBlKTtcblxuICAgICAgICAgIC8vIENoZWNrIGZvciB3aW4gY29uZGl0aW9uXG4gICAgICAgICAgZ2FtZU92ZXIgPSBjaGVja1dpbkNvbmRpdGlvbihodW1hblBsYXllckdhbWVib2FyZCk7XG4gICAgICAgICAgaWYgKGdhbWVPdmVyKSB7XG4gICAgICAgICAgICB3aW5uZXIgPSBcImNvbXB1dGVyXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBHYW1lIG92ZXIgbG9naWNcbiAgICBjb25jbHVkZUdhbWUod2lubmVyKTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGhhbmRsZVNldHVwLFxuICAgIHBsYXlHYW1lLFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQWN0aW9uQ29udHJvbGxlcjtcbiIsIi8qIGVzbGludC1kaXNhYmxlIG1heC1jbGFzc2VzLXBlci1maWxlICovXG5cbmNsYXNzIE92ZXJsYXBwaW5nU2hpcHNFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiU2hpcHMgYXJlIG92ZXJsYXBwaW5nLlwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJPdmVybGFwcGluZ1NoaXBzRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBTaGlwQWxsb2NhdGlvblJlYWNoZWRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3Ioc2hpcFR5cGUpIHtcbiAgICBzdXBlcihgU2hpcCBhbGxvY2F0aW9uIGxpbWl0IHJlYWNoZWQuIFNoaXAgdHlwZSA9ICR7c2hpcFR5cGV9LmApO1xuICAgIHRoaXMubmFtZSA9IFwiU2hpcEFsbG9jYXRpb25SZWFjaGVkRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIlNoaXAgdHlwZSBhbGxvY2F0aW9uIGxpbWl0IHJlYWNoZWQuXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIlNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRTaGlwTGVuZ3RoRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIkludmFsaWQgc2hpcCBsZW5ndGguXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRTaGlwTGVuZ3RoRXJyb3JcIjtcbiAgfVxufVxuXG5jbGFzcyBJbnZhbGlkU2hpcFR5cGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBzaGlwIHR5cGUuXCIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRTaGlwVHlwZUVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgSW52YWxpZFBsYXllclR5cGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZSA9IFwiSW52YWxpZCBwbGF5ZXIgdHlwZS4gVmFsaWQgcGxheWVyIHR5cGVzOiAnaHVtYW4nICYgJ2NvbXB1dGVyJ1wiLFxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRTaGlwVHlwZUVycm9yXCI7XG4gIH1cbn1cblxuY2xhc3MgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIkludmFsaWQgc2hpcCBwbGFjZW1lbnQuIEJvdW5kYXJ5IGVycm9yIVwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIFJlcGVhdEF0dGFja2VkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSBcIkludmFsaWQgYXR0YWNrIGVudHJ5LiBQb3NpdGlvbiBhbHJlYWR5IGF0dGFja2VkIVwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJSZXBlYXRBdHRhY2tFcnJvclwiO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRNb3ZlRW50cnlFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9IFwiSW52YWxpZCBtb3ZlIGVudHJ5IVwiKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJJbnZhbGlkTW92ZUVudHJ5RXJyb3JcIjtcbiAgfVxufVxuXG5leHBvcnQge1xuICBPdmVybGFwcGluZ1NoaXBzRXJyb3IsXG4gIFNoaXBBbGxvY2F0aW9uUmVhY2hlZEVycm9yLFxuICBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3IsXG4gIEludmFsaWRTaGlwTGVuZ3RoRXJyb3IsXG4gIEludmFsaWRTaGlwVHlwZUVycm9yLFxuICBJbnZhbGlkUGxheWVyVHlwZUVycm9yLFxuICBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvcixcbiAgUmVwZWF0QXR0YWNrZWRFcnJvcixcbiAgSW52YWxpZE1vdmVFbnRyeUVycm9yLFxufTtcbiIsImltcG9ydCBQbGF5ZXIgZnJvbSBcIi4vcGxheWVyXCI7XG5pbXBvcnQgR2FtZWJvYXJkIGZyb20gXCIuL2dhbWVib2FyZFwiO1xuaW1wb3J0IFNoaXAgZnJvbSBcIi4vc2hpcFwiO1xuaW1wb3J0IHsgSW52YWxpZFBsYXllclR5cGVFcnJvciB9IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBHYW1lID0gKCkgPT4ge1xuICAvLyBJbml0aWFsaXNlLCBjcmVhdGUgZ2FtZWJvYXJkcyBmb3IgYm90aCBwbGF5ZXJzIGFuZCBjcmVhdGUgcGxheWVycyBvZiB0eXBlcyBodW1hbiBhbmQgY29tcHV0ZXJcbiAgY29uc3QgaHVtYW5HYW1lYm9hcmQgPSBHYW1lYm9hcmQoU2hpcCk7XG4gIGNvbnN0IGNvbXB1dGVyR2FtZWJvYXJkID0gR2FtZWJvYXJkKFNoaXApO1xuICBjb25zdCBodW1hblBsYXllciA9IFBsYXllcihodW1hbkdhbWVib2FyZCwgXCJodW1hblwiKTtcbiAgY29uc3QgY29tcHV0ZXJQbGF5ZXIgPSBQbGF5ZXIoY29tcHV0ZXJHYW1lYm9hcmQsIFwiY29tcHV0ZXJcIik7XG4gIGxldCBjdXJyZW50UGxheWVyO1xuICBsZXQgZ2FtZU92ZXJTdGF0ZSA9IGZhbHNlO1xuXG4gIC8vIFN0b3JlIHBsYXllcnMgaW4gYSBwbGF5ZXIgb2JqZWN0XG4gIGNvbnN0IHBsYXllcnMgPSB7IGh1bWFuOiBodW1hblBsYXllciwgY29tcHV0ZXI6IGNvbXB1dGVyUGxheWVyIH07XG5cbiAgLy8gU2V0IHVwIHBoYXNlXG4gIGNvbnN0IHNldFVwID0gKCkgPT4ge1xuICAgIC8vIEF1dG9tYXRpYyBwbGFjZW1lbnQgZm9yIGNvbXB1dGVyXG4gICAgY29tcHV0ZXJQbGF5ZXIucGxhY2VTaGlwcygpO1xuXG4gICAgLy8gU2V0IHRoZSBjdXJyZW50IHBsYXllciB0byBodW1hbiBwbGF5ZXJcbiAgICBjdXJyZW50UGxheWVyID0gaHVtYW5QbGF5ZXI7XG4gIH07XG5cbiAgLy8gR2FtZSBlbmRpbmcgZnVuY3Rpb25cbiAgY29uc3QgZW5kR2FtZSA9ICgpID0+IHtcbiAgICBnYW1lT3ZlclN0YXRlID0gdHJ1ZTtcbiAgfTtcblxuICAvLyBUYWtlIHR1cm4gbWV0aG9kXG4gIGNvbnN0IHRha2VUdXJuID0gKG1vdmUpID0+IHtcbiAgICBsZXQgZmVlZGJhY2s7XG5cbiAgICAvLyBEZXRlcm1pbmUgdGhlIG9wcG9uZW50IGJhc2VkIG9uIHRoZSBjdXJyZW50IHBsYXllclxuICAgIGNvbnN0IG9wcG9uZW50ID1cbiAgICAgIGN1cnJlbnRQbGF5ZXIgPT09IGh1bWFuUGxheWVyID8gY29tcHV0ZXJQbGF5ZXIgOiBodW1hblBsYXllcjtcblxuICAgIC8vIENhbGwgdGhlIG1ha2VNb3ZlIG1ldGhvZCBvbiB0aGUgY3VycmVudCBwbGF5ZXIgd2l0aCB0aGUgb3Bwb25lbnQncyBnYW1lYm9hcmQgYW5kIHN0b3JlIGFzIG1vdmUgZmVlZGJhY2tcbiAgICBjb25zdCByZXN1bHQgPSBjdXJyZW50UGxheWVyLm1ha2VNb3ZlKG9wcG9uZW50LmdhbWVib2FyZCwgbW92ZSk7XG5cbiAgICAvLyBJZiByZXN1bHQgaXMgYSBoaXQsIGNoZWNrIHdoZXRoZXIgdGhlIHNoaXAgaXMgc3Vua1xuICAgIGlmIChyZXN1bHQuaGl0KSB7XG4gICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSBzaGlwIGlzIHN1bmsgYW5kIGFkZCByZXN1bHQgYXMgdmFsdWUgdG8gZmVlZGJhY2sgb2JqZWN0IHdpdGgga2V5IFwiaXNTaGlwU3Vua1wiXG4gICAgICBpZiAob3Bwb25lbnQuZ2FtZWJvYXJkLmlzU2hpcFN1bmsocmVzdWx0LnNoaXBUeXBlKSkge1xuICAgICAgICBmZWVkYmFjayA9IHtcbiAgICAgICAgICAuLi5yZXN1bHQsXG4gICAgICAgICAgaXNTaGlwU3VuazogdHJ1ZSxcbiAgICAgICAgICBnYW1lV29uOiBvcHBvbmVudC5nYW1lYm9hcmQuY2hlY2tBbGxTaGlwc1N1bmsoKSxcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZlZWRiYWNrID0geyAuLi5yZXN1bHQsIGlzU2hpcFN1bms6IGZhbHNlIH07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghcmVzdWx0LmhpdCkge1xuICAgICAgLy8gU2V0IGZlZWRiYWNrIHRvIGp1c3QgdGhlIHJlc3VsdFxuICAgICAgZmVlZGJhY2sgPSByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gSWYgZ2FtZSBpcyB3b24sIGVuZCBnYW1lXG4gICAgaWYgKGZlZWRiYWNrLmdhbWVXb24pIHtcbiAgICAgIGVuZEdhbWUoKTtcbiAgICB9XG5cbiAgICAvLyBTd2l0Y2ggdGhlIGN1cnJlbnQgcGxheWVyXG4gICAgY3VycmVudFBsYXllciA9IG9wcG9uZW50O1xuXG4gICAgLy8gUmV0dXJuIHRoZSBmZWVkYmFjayBmb3IgdGhlIG1vdmVcbiAgICByZXR1cm4gZmVlZGJhY2s7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBnZXQgY3VycmVudFBsYXllcigpIHtcbiAgICAgIHJldHVybiBjdXJyZW50UGxheWVyO1xuICAgIH0sXG4gICAgZ2V0IGdhbWVPdmVyU3RhdGUoKSB7XG4gICAgICByZXR1cm4gZ2FtZU92ZXJTdGF0ZTtcbiAgICB9LFxuICAgIHBsYXllcnMsXG4gICAgc2V0VXAsXG4gICAgdGFrZVR1cm4sXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBHYW1lO1xuIiwiaW1wb3J0IHtcbiAgU2hpcFR5cGVBbGxvY2F0aW9uUmVhY2hlZEVycm9yLFxuICBPdmVybGFwcGluZ1NoaXBzRXJyb3IsXG4gIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yLFxuICBSZXBlYXRBdHRhY2tlZEVycm9yLFxufSBmcm9tIFwiLi9lcnJvcnNcIjtcblxuY29uc3QgZ3JpZCA9IFtcbiAgW1wiQTFcIiwgXCJBMlwiLCBcIkEzXCIsIFwiQTRcIiwgXCJBNVwiLCBcIkE2XCIsIFwiQTdcIiwgXCJBOFwiLCBcIkE5XCIsIFwiQTEwXCJdLFxuICBbXCJCMVwiLCBcIkIyXCIsIFwiQjNcIiwgXCJCNFwiLCBcIkI1XCIsIFwiQjZcIiwgXCJCN1wiLCBcIkI4XCIsIFwiQjlcIiwgXCJCMTBcIl0sXG4gIFtcIkMxXCIsIFwiQzJcIiwgXCJDM1wiLCBcIkM0XCIsIFwiQzVcIiwgXCJDNlwiLCBcIkM3XCIsIFwiQzhcIiwgXCJDOVwiLCBcIkMxMFwiXSxcbiAgW1wiRDFcIiwgXCJEMlwiLCBcIkQzXCIsIFwiRDRcIiwgXCJENVwiLCBcIkQ2XCIsIFwiRDdcIiwgXCJEOFwiLCBcIkQ5XCIsIFwiRDEwXCJdLFxuICBbXCJFMVwiLCBcIkUyXCIsIFwiRTNcIiwgXCJFNFwiLCBcIkU1XCIsIFwiRTZcIiwgXCJFN1wiLCBcIkU4XCIsIFwiRTlcIiwgXCJFMTBcIl0sXG4gIFtcIkYxXCIsIFwiRjJcIiwgXCJGM1wiLCBcIkY0XCIsIFwiRjVcIiwgXCJGNlwiLCBcIkY3XCIsIFwiRjhcIiwgXCJGOVwiLCBcIkYxMFwiXSxcbiAgW1wiRzFcIiwgXCJHMlwiLCBcIkczXCIsIFwiRzRcIiwgXCJHNVwiLCBcIkc2XCIsIFwiRzdcIiwgXCJHOFwiLCBcIkc5XCIsIFwiRzEwXCJdLFxuICBbXCJIMVwiLCBcIkgyXCIsIFwiSDNcIiwgXCJINFwiLCBcIkg1XCIsIFwiSDZcIiwgXCJIN1wiLCBcIkg4XCIsIFwiSDlcIiwgXCJIMTBcIl0sXG4gIFtcIkkxXCIsIFwiSTJcIiwgXCJJM1wiLCBcIkk0XCIsIFwiSTVcIiwgXCJJNlwiLCBcIkk3XCIsIFwiSThcIiwgXCJJOVwiLCBcIkkxMFwiXSxcbiAgW1wiSjFcIiwgXCJKMlwiLCBcIkozXCIsIFwiSjRcIiwgXCJKNVwiLCBcIko2XCIsIFwiSjdcIiwgXCJKOFwiLCBcIko5XCIsIFwiSjEwXCJdLFxuXTtcblxuY29uc3QgaW5kZXhDYWxjcyA9IChzdGFydCkgPT4ge1xuICBjb25zdCBjb2xMZXR0ZXIgPSBzdGFydFswXS50b1VwcGVyQ2FzZSgpOyAvLyBUaGlzIGlzIHRoZSBjb2x1bW5cbiAgY29uc3Qgcm93TnVtYmVyID0gcGFyc2VJbnQoc3RhcnQuc2xpY2UoMSksIDEwKTsgLy8gVGhpcyBpcyB0aGUgcm93XG5cbiAgY29uc3QgY29sSW5kZXggPSBjb2xMZXR0ZXIuY2hhckNvZGVBdCgwKSAtIFwiQVwiLmNoYXJDb2RlQXQoMCk7IC8vIENvbHVtbiBpbmRleCBiYXNlZCBvbiBsZXR0ZXJcbiAgY29uc3Qgcm93SW5kZXggPSByb3dOdW1iZXIgLSAxOyAvLyBSb3cgaW5kZXggYmFzZWQgb24gbnVtYmVyXG5cbiAgcmV0dXJuIFtjb2xJbmRleCwgcm93SW5kZXhdOyAvLyBSZXR1cm4gW3JvdywgY29sdW1uXVxufTtcblxuY29uc3QgY2hlY2tUeXBlID0gKHNoaXAsIHNoaXBQb3NpdGlvbnMpID0+IHtcbiAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBzaGlwUG9zaXRpb25zIG9iamVjdFxuICBPYmplY3Qua2V5cyhzaGlwUG9zaXRpb25zKS5mb3JFYWNoKChleGlzdGluZ1NoaXBUeXBlKSA9PiB7XG4gICAgaWYgKGV4aXN0aW5nU2hpcFR5cGUgPT09IHNoaXApIHtcbiAgICAgIHRocm93IG5ldyBTaGlwVHlwZUFsbG9jYXRpb25SZWFjaGVkRXJyb3Ioc2hpcCk7XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IGNoZWNrQm91bmRhcmllcyA9IChzaGlwTGVuZ3RoLCBjb29yZHMsIGRpcmVjdGlvbikgPT4ge1xuICAvLyBTZXQgcm93IGFuZCBjb2wgbGltaXRzXG4gIGNvbnN0IHhMaW1pdCA9IGdyaWQubGVuZ3RoOyAvLyBUaGlzIGlzIHRoZSB0b3RhbCBudW1iZXIgb2YgY29sdW1ucyAoeClcbiAgY29uc3QgeUxpbWl0ID0gZ3JpZFswXS5sZW5ndGg7IC8vIFRoaXMgaXMgdGhlIHRvdGFsIG51bWJlciBvZiByb3dzICh5KVxuXG4gIGNvbnN0IHggPSBjb29yZHNbMF07XG4gIGNvbnN0IHkgPSBjb29yZHNbMV07XG5cbiAgLy8gQ2hlY2sgZm9yIHZhbGlkIHN0YXJ0IHBvc2l0aW9uIG9uIGJvYXJkXG4gIGlmICh4IDwgMCB8fCB4ID49IHhMaW1pdCB8fCB5IDwgMCB8fCB5ID49IHlMaW1pdCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENoZWNrIHJpZ2h0IGJvdW5kYXJ5IGZvciBob3Jpem9udGFsIHBsYWNlbWVudFxuICBpZiAoZGlyZWN0aW9uID09PSBcImhcIiAmJiB4ICsgc2hpcExlbmd0aCA+IHhMaW1pdCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBDaGVjayBib3R0b20gYm91bmRhcnkgZm9yIHZlcnRpY2FsIHBsYWNlbWVudFxuICBpZiAoZGlyZWN0aW9uID09PSBcInZcIiAmJiB5ICsgc2hpcExlbmd0aCA+IHlMaW1pdCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIElmIG5vbmUgb2YgdGhlIGludmFsaWQgY29uZGl0aW9ucyBhcmUgbWV0LCByZXR1cm4gdHJ1ZVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmNvbnN0IGNhbGN1bGF0ZVNoaXBQb3NpdGlvbnMgPSAoc2hpcExlbmd0aCwgY29vcmRzLCBkaXJlY3Rpb24pID0+IHtcbiAgY29uc3QgY29sSW5kZXggPSBjb29yZHNbMF07IC8vIFRoaXMgaXMgdGhlIGNvbHVtbiBpbmRleFxuICBjb25zdCByb3dJbmRleCA9IGNvb3Jkc1sxXTsgLy8gVGhpcyBpcyB0aGUgcm93IGluZGV4XG5cbiAgY29uc3QgcG9zaXRpb25zID0gW107XG5cbiAgaWYgKGRpcmVjdGlvbi50b0xvd2VyQ2FzZSgpID09PSBcImhcIikge1xuICAgIC8vIEhvcml6b250YWwgcGxhY2VtZW50OiBpbmNyZW1lbnQgdGhlIGNvbHVtbiBpbmRleFxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChncmlkW2NvbEluZGV4ICsgaV1bcm93SW5kZXhdKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gVmVydGljYWwgcGxhY2VtZW50OiBpbmNyZW1lbnQgdGhlIHJvdyBpbmRleFxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChncmlkW2NvbEluZGV4XVtyb3dJbmRleCArIGldKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcG9zaXRpb25zO1xufTtcblxuY29uc3QgY2hlY2tGb3JPdmVybGFwID0gKHBvc2l0aW9ucywgc2hpcFBvc2l0aW9ucykgPT4ge1xuICBPYmplY3QuZW50cmllcyhzaGlwUG9zaXRpb25zKS5mb3JFYWNoKChbc2hpcFR5cGUsIGV4aXN0aW5nU2hpcFBvc2l0aW9uc10pID0+IHtcbiAgICBpZiAoXG4gICAgICBwb3NpdGlvbnMuc29tZSgocG9zaXRpb24pID0+IGV4aXN0aW5nU2hpcFBvc2l0aW9ucy5pbmNsdWRlcyhwb3NpdGlvbikpXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgT3ZlcmxhcHBpbmdTaGlwc0Vycm9yKFxuICAgICAgICBgT3ZlcmxhcCBkZXRlY3RlZCB3aXRoIHNoaXAgdHlwZSAke3NoaXBUeXBlfWAsXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG5jb25zdCBjaGVja0ZvckhpdCA9IChwb3NpdGlvbiwgc2hpcFBvc2l0aW9ucykgPT4ge1xuICBjb25zdCBmb3VuZFNoaXAgPSBPYmplY3QuZW50cmllcyhzaGlwUG9zaXRpb25zKS5maW5kKFxuICAgIChbXywgZXhpc3RpbmdTaGlwUG9zaXRpb25zXSkgPT4gZXhpc3RpbmdTaGlwUG9zaXRpb25zLmluY2x1ZGVzKHBvc2l0aW9uKSxcbiAgKTtcblxuICByZXR1cm4gZm91bmRTaGlwID8geyBoaXQ6IHRydWUsIHNoaXBUeXBlOiBmb3VuZFNoaXBbMF0gfSA6IHsgaGl0OiBmYWxzZSB9O1xufTtcblxuY29uc3QgR2FtZWJvYXJkID0gKHNoaXBGYWN0b3J5KSA9PiB7XG4gIGNvbnN0IHNoaXBzID0ge307XG4gIGNvbnN0IHNoaXBQb3NpdGlvbnMgPSB7fTtcbiAgY29uc3QgaGl0UG9zaXRpb25zID0ge307XG4gIGNvbnN0IGF0dGFja0xvZyA9IFtbXSwgW11dO1xuXG4gIGNvbnN0IHBsYWNlU2hpcCA9ICh0eXBlLCBzdGFydCwgZGlyZWN0aW9uKSA9PiB7XG4gICAgY29uc3QgbmV3U2hpcCA9IHNoaXBGYWN0b3J5KHR5cGUpO1xuXG4gICAgLy8gQ2hlY2sgdGhlIHNoaXAgdHlwZSBhZ2FpbnN0IGV4aXN0aW5nIHR5cGVzXG4gICAgY2hlY2tUeXBlKHR5cGUsIHNoaXBQb3NpdGlvbnMpO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHN0YXJ0IHBvaW50IGNvb3JkaW5hdGVzIGJhc2VkIG9uIHN0YXJ0IHBvaW50IGdyaWQga2V5XG4gICAgY29uc3QgY29vcmRzID0gaW5kZXhDYWxjcyhzdGFydCk7XG5cbiAgICAvLyBDaGVjayBib3VuZGFyaWVzLCBpZiBvayBjb250aW51ZSB0byBuZXh0IHN0ZXBcbiAgICBpZiAoY2hlY2tCb3VuZGFyaWVzKG5ld1NoaXAuc2hpcExlbmd0aCwgY29vcmRzLCBkaXJlY3Rpb24pKSB7XG4gICAgICAvLyBDYWxjdWxhdGUgYW5kIHN0b3JlIHBvc2l0aW9ucyBmb3IgYSBuZXcgc2hpcFxuICAgICAgY29uc3QgcG9zaXRpb25zID0gY2FsY3VsYXRlU2hpcFBvc2l0aW9ucyhcbiAgICAgICAgbmV3U2hpcC5zaGlwTGVuZ3RoLFxuICAgICAgICBjb29yZHMsXG4gICAgICAgIGRpcmVjdGlvbixcbiAgICAgICk7XG5cbiAgICAgIC8vIENoZWNrIGZvciBvdmVybGFwIGJlZm9yZSBwbGFjaW5nIHRoZSBzaGlwXG4gICAgICBjaGVja0Zvck92ZXJsYXAocG9zaXRpb25zLCBzaGlwUG9zaXRpb25zKTtcblxuICAgICAgLy8gSWYgbm8gb3ZlcmxhcCwgcHJvY2VlZCB0byBwbGFjZSBzaGlwXG4gICAgICBzaGlwUG9zaXRpb25zW3R5cGVdID0gcG9zaXRpb25zO1xuICAgICAgLy8gQWRkIHNoaXAgdG8gc2hpcHMgb2JqZWN0XG4gICAgICBzaGlwc1t0eXBlXSA9IG5ld1NoaXA7XG5cbiAgICAgIC8vIEluaXRpYWxpc2UgaGl0UG9zaXRpb25zIGZvciB0aGlzIHNoaXAgdHlwZSBhcyBhbiBlbXB0eSBhcnJheVxuICAgICAgaGl0UG9zaXRpb25zW3R5cGVdID0gW107XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvcihcbiAgICAgICAgYEludmFsaWQgc2hpcCBwbGFjZW1lbnQuIEJvdW5kYXJ5IGVycm9yISBTaGlwIHR5cGU6ICR7dHlwZX1gLFxuICAgICAgKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmVnaXN0ZXIgYW4gYXR0YWNrIGFuZCB0ZXN0IGZvciB2YWxpZCBoaXRcbiAgY29uc3QgYXR0YWNrID0gKHBvc2l0aW9uKSA9PiB7XG4gICAgbGV0IHJlc3BvbnNlO1xuXG4gICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGF0dGFja1xuICAgIGlmIChhdHRhY2tMb2dbMF0uaW5jbHVkZXMocG9zaXRpb24pIHx8IGF0dGFja0xvZ1sxXS5pbmNsdWRlcyhwb3NpdGlvbikpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGBSZXBlYXQgYXR0YWNrOiAke3Bvc2l0aW9ufWApO1xuICAgICAgdGhyb3cgbmV3IFJlcGVhdEF0dGFja2VkRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgdmFsaWQgaGl0XG4gICAgY29uc3QgY2hlY2tSZXN1bHRzID0gY2hlY2tGb3JIaXQocG9zaXRpb24sIHNoaXBQb3NpdGlvbnMpO1xuICAgIGlmIChjaGVja1Jlc3VsdHMuaGl0KSB7XG4gICAgICAvLyBSZWdpc3RlciB2YWxpZCBoaXRcbiAgICAgIGhpdFBvc2l0aW9uc1tjaGVja1Jlc3VsdHMuc2hpcFR5cGVdLnB1c2gocG9zaXRpb24pO1xuICAgICAgc2hpcHNbY2hlY2tSZXN1bHRzLnNoaXBUeXBlXS5oaXQoKTtcblxuICAgICAgLy8gTG9nIHRoZSBhdHRhY2sgYXMgYSB2YWxpZCBoaXRcbiAgICAgIGF0dGFja0xvZ1swXS5wdXNoKHBvc2l0aW9uKTtcbiAgICAgIHJlc3BvbnNlID0geyAuLi5jaGVja1Jlc3VsdHMgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY29uc29sZS5sb2coYE1JU1MhOiAke3Bvc2l0aW9ufWApO1xuICAgICAgLy8gTG9nIHRoZSBhdHRhY2sgYXMgYSBtaXNzXG4gICAgICBhdHRhY2tMb2dbMV0ucHVzaChwb3NpdGlvbik7XG4gICAgICByZXNwb25zZSA9IHsgLi4uY2hlY2tSZXN1bHRzIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9O1xuXG4gIGNvbnN0IGlzU2hpcFN1bmsgPSAodHlwZSkgPT4gc2hpcHNbdHlwZV0uaXNTdW5rO1xuXG4gIGNvbnN0IGNoZWNrQWxsU2hpcHNTdW5rID0gKCkgPT5cbiAgICBPYmplY3QuZW50cmllcyhzaGlwcykuZXZlcnkoKFtzaGlwVHlwZSwgc2hpcF0pID0+IHNoaXAuaXNTdW5rKTtcblxuICAvLyBGdW5jdGlvbiBmb3IgcmVwb3J0aW5nIHRoZSBudW1iZXIgb2Ygc2hpcHMgbGVmdCBhZmxvYXRcbiAgY29uc3Qgc2hpcFJlcG9ydCA9ICgpID0+IHtcbiAgICBjb25zdCBmbG9hdGluZ1NoaXBzID0gT2JqZWN0LmVudHJpZXMoc2hpcHMpXG4gICAgICAuZmlsdGVyKChbc2hpcFR5cGUsIHNoaXBdKSA9PiAhc2hpcC5pc1N1bmspXG4gICAgICAubWFwKChbc2hpcFR5cGUsIF9dKSA9PiBzaGlwVHlwZSk7XG5cbiAgICByZXR1cm4gW2Zsb2F0aW5nU2hpcHMubGVuZ3RoLCBmbG9hdGluZ1NoaXBzXTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldCBncmlkKCkge1xuICAgICAgcmV0dXJuIGdyaWQ7XG4gICAgfSxcbiAgICBnZXQgc2hpcHMoKSB7XG4gICAgICByZXR1cm4gc2hpcHM7XG4gICAgfSxcbiAgICBnZXQgYXR0YWNrTG9nKCkge1xuICAgICAgcmV0dXJuIGF0dGFja0xvZztcbiAgICB9LFxuICAgIGdldFNoaXA6IChzaGlwVHlwZSkgPT4gc2hpcHNbc2hpcFR5cGVdLFxuICAgIGdldFNoaXBQb3NpdGlvbnM6IChzaGlwVHlwZSkgPT4gc2hpcFBvc2l0aW9uc1tzaGlwVHlwZV0sXG4gICAgZ2V0SGl0UG9zaXRpb25zOiAoc2hpcFR5cGUpID0+IGhpdFBvc2l0aW9uc1tzaGlwVHlwZV0sXG4gICAgcGxhY2VTaGlwLFxuICAgIGF0dGFjayxcbiAgICBpc1NoaXBTdW5rLFxuICAgIGNoZWNrQWxsU2hpcHNTdW5rLFxuICAgIHNoaXBSZXBvcnQsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBHYW1lYm9hcmQ7XG4iLCJpbXBvcnQgXCIuL3N0eWxlcy5jc3NcIjtcbmltcG9ydCBHYW1lIGZyb20gXCIuL2dhbWVcIjtcbmltcG9ydCBVaU1hbmFnZXIgZnJvbSBcIi4vdWlNYW5hZ2VyXCI7XG5pbXBvcnQgQWN0aW9uQ29udHJvbGxlciBmcm9tIFwiLi9hY3Rpb25Db250cm9sbGVyXCI7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluLWNvbnRhaW5lclwiKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG59KTtcblxuLy8gQ3JlYXRlIGEgbmV3IFVJIG1hbmFnZXJcbmNvbnN0IG5ld1VpTWFuYWdlciA9IFVpTWFuYWdlcigpO1xuXG4vLyBJbnN0YW50aWF0ZSBhIG5ldyBnYW1lXG5jb25zdCBuZXdHYW1lID0gR2FtZSgpO1xuXG4vLyBDcmVhdGUgYSBuZXcgYWN0aW9uIGNvbnRyb2xsZXJcbmNvbnN0IGFjdENvbnRyb2xsZXIgPSBBY3Rpb25Db250cm9sbGVyKG5ld1VpTWFuYWdlciwgbmV3R2FtZSk7XG5cbi8vIFdhaXQgZm9yIHRoZSBnYW1lIHRvIGJlIHNldHVwIHdpdGggc2hpcCBwbGFjZW1lbnRzIGV0Yy5cbmF3YWl0IGFjdENvbnRyb2xsZXIuaGFuZGxlU2V0dXAoKTtcblxuLy8gT25jZSByZWFkeSwgY2FsbCB0aGUgcGxheUdhbWUgbWV0aG9kXG5hd2FpdCBhY3RDb250cm9sbGVyLnBsYXlHYW1lKCk7XG4iLCJpbXBvcnQge1xuICBJbnZhbGlkUGxheWVyVHlwZUVycm9yLFxuICBJbnZhbGlkTW92ZUVudHJ5RXJyb3IsXG4gIFJlcGVhdEF0dGFja2VkRXJyb3IsXG4gIFNoaXBQbGFjZW1lbnRCb3VuZGFyeUVycm9yLFxuICBPdmVybGFwcGluZ1NoaXBzRXJyb3IsXG59IGZyb20gXCIuL2Vycm9yc1wiO1xuXG5jb25zdCBjaGVja01vdmUgPSAobW92ZSwgZ2JHcmlkKSA9PiB7XG4gIGxldCB2YWxpZCA9IGZhbHNlO1xuXG4gIGdiR3JpZC5mb3JFYWNoKChlbCkgPT4ge1xuICAgIGlmIChlbC5maW5kKChwKSA9PiBwID09PSBtb3ZlKSkge1xuICAgICAgdmFsaWQgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHZhbGlkO1xufTtcblxuY29uc3QgcmFuZE1vdmUgPSAoZ3JpZCwgbW92ZUxvZykgPT4ge1xuICAvLyBGbGF0dGVuIHRoZSBncmlkIGludG8gYSBzaW5nbGUgYXJyYXkgb2YgbW92ZXNcbiAgY29uc3QgYWxsTW92ZXMgPSBncmlkLmZsYXRNYXAoKHJvdykgPT4gcm93KTtcblxuICAvLyBGaWx0ZXIgb3V0IHRoZSBtb3ZlcyB0aGF0IGFyZSBhbHJlYWR5IGluIHRoZSBtb3ZlTG9nXG4gIGNvbnN0IHBvc3NpYmxlTW92ZXMgPSBhbGxNb3Zlcy5maWx0ZXIoKG1vdmUpID0+ICFtb3ZlTG9nLmluY2x1ZGVzKG1vdmUpKTtcblxuICAvLyBTZWxlY3QgYSByYW5kb20gbW92ZSBmcm9tIHRoZSBwb3NzaWJsZSBtb3Zlc1xuICBjb25zdCByYW5kb21Nb3ZlID1cbiAgICBwb3NzaWJsZU1vdmVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlTW92ZXMubGVuZ3RoKV07XG5cbiAgcmV0dXJuIHJhbmRvbU1vdmU7XG59O1xuXG5jb25zdCBnZW5lcmF0ZVJhbmRvbVN0YXJ0ID0gKHNpemUsIGRpcmVjdGlvbiwgZ3JpZCkgPT4ge1xuICBjb25zdCB2YWxpZFN0YXJ0cyA9IFtdO1xuXG4gIGlmIChkaXJlY3Rpb24gPT09IFwiaFwiKSB7XG4gICAgLy8gRm9yIGhvcml6b250YWwgb3JpZW50YXRpb24sIGxpbWl0IHRoZSBjb2x1bW5zXG4gICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgZ3JpZC5sZW5ndGggLSBzaXplICsgMTsgY29sKyspIHtcbiAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IGdyaWRbY29sXS5sZW5ndGg7IHJvdysrKSB7XG4gICAgICAgIHZhbGlkU3RhcnRzLnB1c2goZ3JpZFtjb2xdW3Jvd10pO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBGb3IgdmVydGljYWwgb3JpZW50YXRpb24sIGxpbWl0IHRoZSByb3dzXG4gICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgZ3JpZFswXS5sZW5ndGggLSBzaXplICsgMTsgcm93KyspIHtcbiAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IGdyaWQubGVuZ3RoOyBjb2wrKykge1xuICAgICAgICB2YWxpZFN0YXJ0cy5wdXNoKGdyaWRbY29sXVtyb3ddKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBSYW5kb21seSBzZWxlY3QgYSBzdGFydGluZyBwb3NpdGlvblxuICBjb25zdCByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHZhbGlkU3RhcnRzLmxlbmd0aCk7XG4gIHJldHVybiB2YWxpZFN0YXJ0c1tyYW5kb21JbmRleF07XG59O1xuXG5jb25zdCBhdXRvUGxhY2VtZW50ID0gKGdhbWVib2FyZCkgPT4ge1xuICBjb25zdCBzaGlwVHlwZXMgPSBbXG4gICAgeyB0eXBlOiBcImNhcnJpZXJcIiwgc2l6ZTogNSB9LFxuICAgIHsgdHlwZTogXCJiYXR0bGVzaGlwXCIsIHNpemU6IDQgfSxcbiAgICB7IHR5cGU6IFwiY3J1aXNlclwiLCBzaXplOiAzIH0sXG4gICAgeyB0eXBlOiBcInN1Ym1hcmluZVwiLCBzaXplOiAzIH0sXG4gICAgeyB0eXBlOiBcImRlc3Ryb3llclwiLCBzaXplOiAyIH0sXG4gIF07XG5cbiAgc2hpcFR5cGVzLmZvckVhY2goKHNoaXApID0+IHtcbiAgICBsZXQgcGxhY2VkID0gZmFsc2U7XG4gICAgd2hpbGUgKCFwbGFjZWQpIHtcbiAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IE1hdGgucmFuZG9tKCkgPCAwLjUgPyBcImhcIiA6IFwidlwiO1xuICAgICAgY29uc3Qgc3RhcnQgPSBnZW5lcmF0ZVJhbmRvbVN0YXJ0KHNoaXAuc2l6ZSwgZGlyZWN0aW9uLCBnYW1lYm9hcmQuZ3JpZCk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGdhbWVib2FyZC5wbGFjZVNoaXAoc2hpcC50eXBlLCBzdGFydCwgZGlyZWN0aW9uKTtcbiAgICAgICAgcGxhY2VkID0gdHJ1ZTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAhKGVycm9yIGluc3RhbmNlb2YgU2hpcFBsYWNlbWVudEJvdW5kYXJ5RXJyb3IpICYmXG4gICAgICAgICAgIShlcnJvciBpbnN0YW5jZW9mIE92ZXJsYXBwaW5nU2hpcHNFcnJvcilcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7IC8vIFJldGhyb3cgbm9uLXBsYWNlbWVudCBlcnJvcnNcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiBwbGFjZW1lbnQgZmFpbHMsIGNhdGNoIHRoZSBlcnJvciBhbmQgdHJ5IGFnYWluXG4gICAgICB9XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IFBsYXllciA9IChnYW1lYm9hcmQsIHR5cGUpID0+IHtcbiAgY29uc3QgbW92ZUxvZyA9IFtdO1xuXG4gIGNvbnN0IHBsYWNlU2hpcHMgPSAoc2hpcFR5cGUsIHN0YXJ0LCBkaXJlY3Rpb24pID0+IHtcbiAgICBpZiAodHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICBnYW1lYm9hcmQucGxhY2VTaGlwKHNoaXBUeXBlLCBzdGFydCwgZGlyZWN0aW9uKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgYXV0b1BsYWNlbWVudChnYW1lYm9hcmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBsYXllclR5cGVFcnJvcihcbiAgICAgICAgYEludmFsaWQgcGxheWVyIHR5cGUuIFZhbGlkIHBsYXllciB0eXBlczogXCJodW1hblwiICYgXCJjb21wdXRlclwiLiBFbnRlcmVkOiAke3R5cGV9LmAsXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBtYWtlTW92ZSA9IChvcHBHYW1lYm9hcmQsIGlucHV0KSA9PiB7XG4gICAgbGV0IG1vdmU7XG5cbiAgICAvLyBDaGVjayBmb3IgdGhlIHR5cGUgb2YgcGxheWVyXG4gICAgaWYgKHR5cGUgPT09IFwiaHVtYW5cIikge1xuICAgICAgLy8gRm9ybWF0IHRoZSBpbnB1dFxuICAgICAgbW92ZSA9IGAke2lucHV0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpfSR7aW5wdXQuc3Vic3RyaW5nKDEpfWA7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImNvbXB1dGVyXCIpIHtcbiAgICAgIG1vdmUgPSByYW5kTW92ZShvcHBHYW1lYm9hcmQuZ3JpZCwgbW92ZUxvZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGxheWVyVHlwZUVycm9yKFxuICAgICAgICBgSW52YWxpZCBwbGF5ZXIgdHlwZS4gVmFsaWQgcGxheWVyIHR5cGVzOiBcImh1bWFuXCIgJiBcImNvbXB1dGVyXCIuIEVudGVyZWQ6ICR7dHlwZX0uYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhlIGlucHV0IGFnYWluc3QgdGhlIHBvc3NpYmxlIG1vdmVzIG9uIHRoZSBnYW1lYm9hcmQncyBncmlkXG4gICAgaWYgKCFjaGVja01vdmUobW92ZSwgb3BwR2FtZWJvYXJkLmdyaWQpKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZE1vdmVFbnRyeUVycm9yKGBJbnZhbGlkIG1vdmUgZW50cnkhIE1vdmU6ICR7bW92ZX0uYCk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIG1vdmUgZXhpc3RzIGluIHRoZSBtb3ZlTG9nIGFycmF5LCB0aHJvdyBhbiBlcnJvclxuICAgIGlmIChtb3ZlTG9nLmZpbmQoKGVsKSA9PiBlbCA9PT0gbW92ZSkpIHtcbiAgICAgIHRocm93IG5ldyBSZXBlYXRBdHRhY2tlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gRWxzZSwgY2FsbCBhdHRhY2sgbWV0aG9kIG9uIGdhbWVib2FyZCBhbmQgbG9nIG1vdmUgaW4gbW92ZUxvZ1xuICAgIGNvbnN0IHJlc3BvbnNlID0gb3BwR2FtZWJvYXJkLmF0dGFjayhtb3ZlKTtcbiAgICBtb3ZlTG9nLnB1c2gobW92ZSk7XG4gICAgLy8gUmV0dXJuIHRoZSByZXNwb25zZSBvZiB0aGUgYXR0YWNrIChvYmplY3Q6IHsgaGl0OiBmYWxzZSB9IGZvciBtaXNzOyB7IGhpdDogdHJ1ZSwgc2hpcFR5cGU6IHN0cmluZyB9IGZvciBoaXQpLlxuICAgIHJldHVybiB7IHBsYXllcjogdHlwZSwgbW92ZSwgLi4ucmVzcG9uc2UgfTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldCB0eXBlKCkge1xuICAgICAgcmV0dXJuIHR5cGU7XG4gICAgfSxcbiAgICBnZXQgZ2FtZWJvYXJkKCkge1xuICAgICAgcmV0dXJuIGdhbWVib2FyZDtcbiAgICB9LFxuICAgIGdldCBtb3ZlTG9nKCkge1xuICAgICAgcmV0dXJuIG1vdmVMb2c7XG4gICAgfSxcbiAgICBtYWtlTW92ZSxcbiAgICBwbGFjZVNoaXBzLFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgUGxheWVyO1xuIiwiaW1wb3J0IHsgSW52YWxpZFNoaXBUeXBlRXJyb3IgfSBmcm9tIFwiLi9lcnJvcnNcIjtcblxuY29uc3QgU2hpcCA9ICh0eXBlKSA9PiB7XG4gIGNvbnN0IHNldExlbmd0aCA9ICgpID0+IHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgXCJjYXJyaWVyXCI6XG4gICAgICAgIHJldHVybiA1O1xuICAgICAgY2FzZSBcImJhdHRsZXNoaXBcIjpcbiAgICAgICAgcmV0dXJuIDQ7XG4gICAgICBjYXNlIFwiY3J1aXNlclwiOlxuICAgICAgY2FzZSBcInN1Ym1hcmluZVwiOlxuICAgICAgICByZXR1cm4gMztcbiAgICAgIGNhc2UgXCJkZXN0cm95ZXJcIjpcbiAgICAgICAgcmV0dXJuIDI7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFNoaXBUeXBlRXJyb3IoKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgc2hpcExlbmd0aCA9IHNldExlbmd0aCgpO1xuXG4gIGxldCBoaXRzID0gMDtcblxuICBjb25zdCBoaXQgPSAoKSA9PiB7XG4gICAgaWYgKGhpdHMgPCBzaGlwTGVuZ3RoKSB7XG4gICAgICBoaXRzICs9IDE7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB7XG4gICAgZ2V0IHR5cGUoKSB7XG4gICAgICByZXR1cm4gdHlwZTtcbiAgICB9LFxuICAgIGdldCBzaGlwTGVuZ3RoKCkge1xuICAgICAgcmV0dXJuIHNoaXBMZW5ndGg7XG4gICAgfSxcbiAgICBnZXQgaGl0cygpIHtcbiAgICAgIHJldHVybiBoaXRzO1xuICAgIH0sXG4gICAgZ2V0IGlzU3VuaygpIHtcbiAgICAgIHJldHVybiBoaXRzID09PSBzaGlwTGVuZ3RoO1xuICAgIH0sXG4gICAgaGl0LFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU2hpcDtcbiIsImNvbnN0IHR3ID0gKHN0cmluZ3MsIC4uLnZhbHVlcykgPT4gU3RyaW5nLnJhdyh7IHJhdzogc3RyaW5ncyB9LCAuLi52YWx1ZXMpO1xuXG5jb25zdCBpbnN0cnVjdGlvbkNsciA9IFwidGV4dC1saW1lLTcwMFwiO1xuY29uc3QgZ3VpZGVDbHIgPSBcInRleHQtZ3JheS03MDBcIjtcbmNvbnN0IGVycm9yQ2xyID0gXCJ0ZXh0LXJlZC04MDBcIjtcbmNvbnN0IGRlZmF1bHRDbHIgPSBcInRleHQtZ3JheS03MDBcIjtcblxuY29uc3QgY2VsbENsciA9IFwiYmctZ3JheS0yMDBcIjtcbmNvbnN0IGlucHV0Q2xyID0gXCJiZy1ncmF5LTYwMFwiO1xuY29uc3QgaW5wdXRUZXh0Q2xyID0gXCJ0ZXh0LWdyYXktMjAwXCI7XG5jb25zdCBidXR0b25DbHIgPSBcImJnLWdyYXktODAwXCI7XG5jb25zdCBidXR0b25UZXh0Q2xyID0gXCJ0ZXh0LWdyYXktMjAwXCI7XG5cbmNvbnN0IHNoaXBTZWN0Q2xyID0gXCJiZy1zbGF0ZS04MDBcIjtcbmNvbnN0IHNoaXBIaXRDbHIgPSBcImJnLXJlZC04MDBcIjtcbmNvbnN0IHNoaXBTdW5rQ2xyID0gXCJiZy1ncmF5LTQwMFwiO1xuY29uc3QgcHJpbWFyeUhvdmVyQ2xyID0gXCJob3ZlcjpiZy1vcmFuZ2UtNTAwXCI7XG5cbi8vIEZ1bmN0aW9uIGZvciBidWlsZCBhIHNoaXAgc2VjdGlvblxuY29uc3QgYnVpbGRTZWN0aW9uID0gKGRvbVNlbCwgdHlwZSwgcG9zKSA9PiB7XG4gIC8vIENyZWF0ZSBhbiBlbGVtZW50IGZvciB0aGUgc2VjdGlvblxuICBjb25zdCBzZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgc2VjdC5jbGFzc05hbWUgPSB0d2B3LTQgaC00IHJvdW5kZWQtZnVsbGA7IC8vIFNldCB0aGUgZGVmYXVsdCBzdHlsaW5nIGZvciB0aGUgc2VjdGlvbiBlbGVtZW50XG4gIHNlY3QuY2xhc3NMaXN0LmFkZChzaGlwU2VjdENscik7XG4gIC8vIFNldCBhIHVuaXF1ZSBpZCBmb3IgdGhlIHNoaXAgc2VjdGlvblxuICBzZWN0LnNldEF0dHJpYnV0ZShcImlkXCIsIGBET00tJHtkb21TZWx9LXNoaXBUeXBlLSR7dHlwZX0tcG9zLSR7cG9zfWApO1xuICAvLyBTZXQgYSBkYXRhc2V0IHByb3BlcnR5IG9mIFwicG9zaXRpb25cIiBmb3IgdGhlIHNlY3Rpb25cbiAgc2VjdC5kYXRhc2V0LnBvc2l0aW9uID0gcG9zO1xuXG4gIHJldHVybiBzZWN0O1xufTtcblxuLy8gRnVuY3Rpb24gZm9yIGJ1aWxkaW5nIGEgc2hpcCwgZGVwZW5kaW5nIG9uIHRoZSBzaGlwIHR5cGVcbmNvbnN0IGJ1aWxkU2hpcCA9IChvYmosIGRvbVNlbCwgc2hpcFBvc2l0aW9ucykgPT4ge1xuICAvLyBFeHRyYWN0IHRoZSBzaGlwJ3MgdHlwZSBhbmQgbGVuZ3RoIGZyb20gdGhlIG9iamVjdFxuICBjb25zdCB7IHR5cGUsIHNoaXBMZW5ndGg6IGxlbmd0aCB9ID0gb2JqO1xuICAvLyBDcmVhdGUgYW5kIGFycmF5IGZvciB0aGUgc2hpcCdzIHNlY3Rpb25zXG4gIGNvbnN0IHNoaXBTZWN0cyA9IFtdO1xuXG4gIC8vIFVzZSB0aGUgbGVuZ3RoIG9mIHRoZSBzaGlwIHRvIGNyZWF0ZSB0aGUgY29ycmVjdCBudW1iZXIgb2Ygc2VjdGlvbnNcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIC8vIEdldCBhIHBvc2l0aW9uIGZyb20gdGhlIGFycmF5XG4gICAgY29uc3QgcG9zaXRpb24gPSBzaGlwUG9zaXRpb25zW2ldO1xuICAgIC8vIENyZWF0ZSBhbiBlbGVtZW50IGZvciB0aGUgc2VjdGlvblxuICAgIGNvbnN0IHNlY3QgPSBidWlsZFNlY3Rpb24oZG9tU2VsLCB0eXBlLCBwb3NpdGlvbik7XG4gICAgc2hpcFNlY3RzLnB1c2goc2VjdCk7IC8vIEFkZCB0aGUgc2VjdGlvbiB0byB0aGUgYXJyYXlcbiAgfVxuXG4gIC8vIFJldHVybiB0aGUgYXJyYXkgb2Ygc2hpcCBzZWN0aW9uc1xuICByZXR1cm4gc2hpcFNlY3RzO1xufTtcblxuLy8gRnVuY3Rpb24gZm9yIGNyZWF0aW5nIGFuZCBkaXNwbGF5aW5nIHRoZSBwb3AtdXAgbWVudSBhdCB0aGUgZW5kIG9mXG4vLyB0aGUgZ2FtZVxuY29uc3QgZW5kR2FtZUludGVyZmFjZSA9ICh3aW5uZXIpID0+IHtcbiAgLy8gR2V0IHRoZSBtYWluIGNvbnRhaW5lclxuICBjb25zdCBtYWluQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluLWNvbnRhaW5lclwiKTtcblxuICAvLyBDcmVhdGUgY29udGFpbmVyIGZvciBlbmQgb2YgZ2FtZSBpbnRlcmZhY2VcbiAgY29uc3QgZW5kR2FtZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIGVuZEdhbWVDb250YWluZXIuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJlbmQtZ2FtZS1jb250YWluZXJcIik7XG4gIGVuZEdhbWVDb250YWluZXIuY2xhc3NOYW1lID0gdHdgZml4ZWQgaW5zZXQtMCBmbGV4IGp1c3RpZnktY2VudGVyIGl0ZW1zLWNlbnRlciBtaW4tdy1mdWxsIG1pbi1oLXNjcmVlbiBiZy1ncmF5LTkwMCBiZy1vcGFjaXR5LTQwIGJhY2tkcm9wLWJsdXItc20gei01MGA7XG5cbiAgLy8gQ3JlYXRlIHRoZSBkaXYgZm9yIGhvbGRpbmcgdGhlIHByb21wdCBhbmQgYnV0dG9uXG4gIGNvbnN0IHByb21wdENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIHByb21wdENvbnRhaW5lci5jbGFzc05hbWUgPSB0d2B3LTkwIGgtNjAgcC0xMCBiZy1ncmF5LTIwMCBzaGFkb3ctbGcgcm91bmRlZC1tZCBiZy1vcGFjaXR5LTYwIGJhY2tkcm9wLWJsdXItc20gZmxleCBmbGV4LWNvbCBjb250ZW50LWNlbnRlciBqdXN0aWZ5LWNlbnRlcmA7XG5cbiAgLy8gQ3JlYXRlIHRoZSBwcm9tcHRzXG4gIGNvbnN0IHdpbm5lclByb21wdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICB3aW5uZXJQcm9tcHQuY2xhc3NOYW1lID0gdHdgZm9udC1tb25vIHRleHQtY2VudGVyIHRleHQtbWQgdGV4dC1ncmF5LTgwMGA7XG4gIHdpbm5lclByb21wdC50ZXh0Q29udGVudCA9IHdpbm5lciA9PT0gXCJodW1hblwiID8gXCJZb3Ugd2luIVwiIDogXCJZb3UgbG9zZSFcIjtcbiAgY29uc3QgcmVzdGFydFByb21wdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICByZXN0YXJ0UHJvbXB0LmNsYXNzTmFtZSA9IHR3YGZvbnQtbW9ubyB0ZXh0LWNlbnRlciB0ZXh0LW1kIHRleHQtZ3JheS04MDBgO1xuICByZXN0YXJ0UHJvbXB0LnRleHRDb250ZW50ID0gXCJDbGljayB0aGUgYnV0dG9uIHRvIHJlc3RhcnQgdGhlIGdhbWUhXCI7XG5cbiAgLy8gQ3JlYXRlIHRoZSByZXN0YXJ0IGJ1dHRvblxuICBjb25zdCByZXN0YXJ0QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgcmVzdGFydEJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcInJlc3RhcnQtYnV0dG9uXCIpO1xuICByZXN0YXJ0QnV0dG9uLmNsYXNzTmFtZSA9IHR3YG5hbnVtLWdvdGhpYy1jb2RpbmctYm9sZCBtdC00IHNlbGYtY2VudGVyIHRleHQtbGcgdy1taW4gdHJhY2tpbmctd2lkZXN0IHB4LTMgcHktMSB0ZXh0LWNlbnRlciB0ZXh0LXNtIHJvdW5kZWQtbWQgYm9yZGVyLXNvbGlkIHRleHQtZ3JheS0yMDAgYmctZ3JheS04MDAgYm9yZGVyLTIgYm9yZGVyLWdyYXktMjAwIGhvdmVyOmJnLWdyYXktMjAwIGhvdmVyOnRleHQtZ3JheS04MDAgaG92ZXI6Ym9yZGVyLWdyYXktODAwYDtcbiAgcmVzdGFydEJ1dHRvbi50ZXh0Q29udGVudCA9IFwiUmVzdGFydFwiO1xuXG4gIC8vIEFkZCB0aGUgZWxlbWVudHMgdG8gdGhlIHJlbGV2YW50IGNvbnRhaW5lcnNcbiAgcHJvbXB0Q29udGFpbmVyLmFwcGVuZENoaWxkKHdpbm5lclByb21wdCk7XG4gIHByb21wdENvbnRhaW5lci5hcHBlbmRDaGlsZChyZXN0YXJ0UHJvbXB0KTtcbiAgcHJvbXB0Q29udGFpbmVyLmFwcGVuZENoaWxkKHJlc3RhcnRCdXR0b24pO1xuXG4gIGVuZEdhbWVDb250YWluZXIuYXBwZW5kQ2hpbGQocHJvbXB0Q29udGFpbmVyKTtcblxuICBtYWluQ29udGFpbmVyLmFwcGVuZENoaWxkKGVuZEdhbWVDb250YWluZXIpO1xufTtcblxuY29uc3QgVWlNYW5hZ2VyID0gKCkgPT4ge1xuICBjb25zdCBjcmVhdGVHYW1lYm9hcmQgPSAoY29udGFpbmVySUQpID0+IHtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXJJRCk7XG5cbiAgICAvLyBTZXQgcGxheWVyIHR5cGUgZGVwZW5kaW5nIG9uIHRoZSBjb250YWluZXJJRFxuICAgIGNvbnN0IHsgcGxheWVyIH0gPSBjb250YWluZXIuZGF0YXNldDtcblxuICAgIC8vIENyZWF0ZSB0aGUgZ3JpZCBjb250YWluZXJcbiAgICBjb25zdCBncmlkRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBncmlkRGl2LmNsYXNzTmFtZSA9IHR3YGdhbWVib2FyZC1hcmVhIGdyaWQgZ3JpZC1jb2xzLTExIGF1dG8tcm93cy1taW4gZ2FwLTEgcC02YDtcbiAgICBncmlkRGl2LmRhdGFzZXQucGxheWVyID0gcGxheWVyO1xuXG4gICAgLy8gQWRkIHRoZSB0b3AtbGVmdCBjb3JuZXIgZW1wdHkgY2VsbFxuICAgIGdyaWREaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSk7XG5cbiAgICAvLyBBZGQgY29sdW1uIGhlYWRlcnMgQS1KXG4gICAgY29uc3QgY29sdW1ucyA9IFwiQUJDREVGR0hJSlwiO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sdW1ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIGhlYWRlci5jbGFzc05hbWUgPSBcInRleHQtY2VudGVyXCI7XG4gICAgICBoZWFkZXIudGV4dENvbnRlbnQgPSBjb2x1bW5zW2ldO1xuICAgICAgZ3JpZERpdi5hcHBlbmRDaGlsZChoZWFkZXIpO1xuICAgIH1cblxuICAgIC8vIEFkZCByb3cgbGFiZWxzIGFuZCBjZWxsc1xuICAgIGZvciAobGV0IHJvdyA9IDE7IHJvdyA8PSAxMDsgcm93KyspIHtcbiAgICAgIC8vIFJvdyBsYWJlbFxuICAgICAgY29uc3Qgcm93TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgcm93TGFiZWwuY2xhc3NOYW1lID0gXCJ0ZXh0LWNlbnRlclwiO1xuICAgICAgcm93TGFiZWwudGV4dENvbnRlbnQgPSByb3c7XG4gICAgICBncmlkRGl2LmFwcGVuZENoaWxkKHJvd0xhYmVsKTtcblxuICAgICAgLy8gQ2VsbHMgZm9yIGVhY2ggcm93XG4gICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCAxMDsgY29sKyspIHtcbiAgICAgICAgY29uc3QgY2VsbElkID0gYCR7Y29sdW1uc1tjb2xdfSR7cm93fWA7IC8vIFNldCB0aGUgY2VsbElkXG4gICAgICAgIGNvbnN0IGNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjZWxsLmlkID0gYCR7cGxheWVyfS0ke2NlbGxJZH1gOyAvLyBTZXQgdGhlIGVsZW1lbnQgaWRcbiAgICAgICAgY2VsbC5jbGFzc05hbWUgPSB0d2B3LTYgaC02IGZsZXgganVzdGlmeS1jZW50ZXIgaXRlbXMtY2VudGVyIGN1cnNvci1wb2ludGVyYDsgLy8gQWRkIG1vcmUgY2xhc3NlcyBhcyBuZWVkZWQgZm9yIHN0eWxpbmdcbiAgICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKHByaW1hcnlIb3ZlckNscik7XG4gICAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZChjZWxsQ2xyKTtcbiAgICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKFwiZ2FtZWJvYXJkLWNlbGxcIik7IC8vIEFkZCBhIGNsYXNzIG5hbWUgdG8gZWFjaCBjZWxsIHRvIGFjdCBhcyBhIHNlbGVjdG9yXG4gICAgICAgIGNlbGwuZGF0YXNldC5wb3NpdGlvbiA9IGNlbGxJZDsgLy8gQXNzaWduIHBvc2l0aW9uIGRhdGEgYXR0cmlidXRlIGZvciBpZGVudGlmaWNhdGlvblxuICAgICAgICBjZWxsLmRhdGFzZXQucGxheWVyID0gcGxheWVyOyAvLyBBc3NpZ24gcGxheWVyIGRhdGEgYXR0cmlidXRlIGZvciBpZGVudGlmaWNhdGlvblxuXG4gICAgICAgIGdyaWREaXYuYXBwZW5kQ2hpbGQoY2VsbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQXBwZW5kIHRoZSBncmlkIHRvIHRoZSBjb250YWluZXJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZ3JpZERpdik7XG4gIH07XG5cbiAgY29uc3QgaW5pdENvbnNvbGVVSSA9ICgpID0+IHtcbiAgICBjb25zdCBjb25zb2xlQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb25zb2xlXCIpOyAvLyBHZXQgdGhlIGNvbnNvbGUgY29udGFpbmVyIGZyb20gdGhlIERPTVxuICAgIGNvbnNvbGVDb250YWluZXIuY2xhc3NMaXN0LmFkZChcbiAgICAgIFwiZmxleFwiLFxuICAgICAgXCJmbGV4LWNvbFwiLFxuICAgICAgXCJqdXN0aWZ5LWJldHdlZW5cIixcbiAgICAgIFwidGV4dC1zbVwiLFxuICAgICk7IC8vIFNldCBmbGV4Ym94IHJ1bGVzIGZvciBjb250YWluZXJcblxuICAgIC8vIENyZWF0ZSBhIGNvbnRhaW5lciBmb3IgdGhlIGlucHV0IGFuZCBidXR0b24gZWxlbWVudHNcbiAgICBjb25zdCBpbnB1dERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgaW5wdXREaXYuY2xhc3NOYW1lID0gXCJmbGV4IGZsZXgtcm93IHctZnVsbCBoLTEvNSBqdXN0aWZ5LWJldHdlZW5cIjsgLy8gU2V0IHRoZSBmbGV4Ym94IHJ1bGVzIGZvciB0aGUgY29udGFpbmVyXG5cbiAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTsgLy8gQ3JlYXRlIGFuIGlucHV0IGVsZW1lbnQgZm9yIHRoZSBjb25zb2xlXG4gICAgaW5wdXQudHlwZSA9IFwidGV4dFwiOyAvLyBTZXQgdGhlIGlucHV0IHR5cGUgb2YgdGhpcyBlbGVtZW50IHRvIHRleHRcbiAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNvbnNvbGUtaW5wdXRcIik7IC8vIFNldCB0aGUgaWQgZm9yIHRoaXMgZWxlbWVudCB0byBcImNvbnNvbGUtaW5wdXRcIlxuICAgIGlucHV0LmNsYXNzTmFtZSA9IHR3YHBsLTMgZmxleC0xIHJvdW5kZWQtYmwtbWQgYm9yZGVyLXRyYW5zcGFyZW50IG91dGxpbmUtbm9uZSBmb2N1czpvdXRsaW5lLXNvbGlkIGZvY3VzOmJvcmRlci0yIGZvY3VzOmJvcmRlci1ncmF5LTIwMCBmb2N1czpyaW5nLTBgOyAvLyBBZGQgVGFpbHdpbmRDU1MgY2xhc3Nlc1xuICAgIGlucHV0LmNsYXNzTGlzdC5hZGQoaW5wdXRDbHIpO1xuICAgIGlucHV0LmNsYXNzTGlzdC5hZGQoaW5wdXRUZXh0Q2xyKTtcbiAgICBjb25zdCBzdWJtaXRCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpOyAvLyBDcmVhdGUgYSBidXR0b24gZWxlbWVudCBmb3IgdGhlIGNvbnNvbGUgc3VibWl0XG4gICAgc3VibWl0QnV0dG9uLnRleHRDb250ZW50ID0gXCJTdWJtaXRcIjsgLy8gQWRkIHRoZSB0ZXh0IFwiU3VibWl0XCIgdG8gdGhlIGJ1dHRvblxuICAgIHN1Ym1pdEJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNvbnNvbGUtc3VibWl0XCIpOyAvLyBTZXQgdGhlIGlkIGZvciB0aGUgYnV0dG9uXG4gICAgc3VibWl0QnV0dG9uLmNsYXNzTmFtZSA9IHR3YG5hbnVtLWdvdGhpYy1jb2RpbmctYm9sZCB0ZXh0LWxnIHRyYWNraW5nLXdpZGVzdCBweC0zIHB5LTEgdGV4dC1jZW50ZXIgdGV4dC1zbSByb3VuZGVkLWJyLW1kIGJvcmRlci1zb2xpZCBib3JkZXItMiBib3JkZXItZ3JheS0yMDAgaG92ZXI6YmctZ3JheS0yMDAgaG92ZXI6dGV4dC1ncmF5LTgwMCBob3Zlcjpib3JkZXItZ3JheS04MDBgOyAvLyBBZGQgVGFpbHdpbmRDU1MgY2xhc3Nlc1xuICAgIHN1Ym1pdEJ1dHRvbi5jbGFzc0xpc3QuYWRkKGJ1dHRvbkNscik7XG4gICAgc3VibWl0QnV0dG9uLmNsYXNzTGlzdC5hZGQoYnV0dG9uVGV4dENscik7XG4gICAgY29uc3Qgb3V0cHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTsgLy8gQ3JlYXRlIGFuIGRpdiBlbGVtZW50IGZvciB0aGUgb3V0cHV0IG9mIHRoZSBjb25zb2xlXG4gICAgb3V0cHV0LnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY29uc29sZS1vdXRwdXRcIik7IC8vIFNldCB0aGUgaWQgZm9yIHRoZSBvdXRwdXQgZWxlbWVudFxuICAgIG91dHB1dC5jbGFzc05hbWUgPSB0d2BmbGV4LTEgcC0yIGgtNC81IG92ZXJmbG93LWF1dG8gcm91bmRlZC10LW1kIGJnLWdyYXktMjAwIGJnLW9wYWNpdHktMzAgYmFja2Ryb3AtYmx1ci1tZGA7IC8vIEFkZCBUYWlsd2luZENTUyBjbGFzc2VzIChiZy1ncmFkaWVudC10by10ciwgZnJvbS1ncmF5LTQwMCwgdG8tZ3JheS0xMDApXG5cbiAgICAvLyBBZGQgdGhlIGlucHV0IGVsZW1lbnRzIHRvIHRoZSBpbnB1dCBjb250YWluZXJcbiAgICBpbnB1dERpdi5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgaW5wdXREaXYuYXBwZW5kQ2hpbGQoc3VibWl0QnV0dG9uKTtcblxuICAgIC8vIEFwcGVuZCBlbGVtZW50cyB0byB0aGUgY29uc29sZSBjb250YWluZXJcbiAgICBjb25zb2xlQ29udGFpbmVyLmFwcGVuZENoaWxkKG91dHB1dCk7XG4gICAgY29uc29sZUNvbnRhaW5lci5hcHBlbmRDaGlsZChpbnB1dERpdik7XG4gIH07XG5cbiAgY29uc3QgZGlzcGxheVByb21wdCA9IChwcm9tcHRPYmpzKSA9PiB7XG4gICAgLy8gR2V0IHRoZSBwcm9tcHQgZGlzcGxheVxuICAgIGNvbnN0IGRpc3BsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByb21wdC1kaXNwbGF5XCIpO1xuXG4gICAgLy8gQ2xlYXIgdGhlIGRpc3BsYXkgb2YgYWxsIGNoaWxkcmVuXG4gICAgd2hpbGUgKGRpc3BsYXkuZmlyc3RDaGlsZCkge1xuICAgICAgZGlzcGxheS5yZW1vdmVDaGlsZChkaXNwbGF5LmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIC8vIEl0ZXJhdGUgb3ZlciBlYWNoIHByb21wdCBpbiB0aGUgcHJvbXB0cyBvYmplY3RcbiAgICBPYmplY3QuZW50cmllcyhwcm9tcHRPYmpzKS5mb3JFYWNoKChba2V5LCB7IHByb21wdCwgcHJvbXB0VHlwZSB9XSkgPT4ge1xuICAgICAgLy8gQ3JlYXRlIGEgbmV3IGRpdiBmb3IgZWFjaCBwcm9tcHRcbiAgICAgIGNvbnN0IHByb21wdERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBwcm9tcHREaXYudGV4dENvbnRlbnQgPSBwcm9tcHQ7XG5cbiAgICAgIC8vIEFwcGx5IHN0eWxpbmcgYmFzZWQgb24gcHJvbXB0VHlwZVxuICAgICAgc3dpdGNoIChwcm9tcHRUeXBlKSB7XG4gICAgICAgIGNhc2UgXCJpbnN0cnVjdGlvblwiOlxuICAgICAgICAgIHByb21wdERpdi5jbGFzc0xpc3QuYWRkKGluc3RydWN0aW9uQ2xyKTtcbiAgICAgICAgICBwcm9tcHREaXYuY2xhc3NMaXN0LmFkZChcIm5hbnVtLWdvdGhpYy1jb2RpbmctYm9sZFwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImd1aWRlXCI6XG4gICAgICAgICAgcHJvbXB0RGl2LmNsYXNzTGlzdC5hZGQoZ3VpZGVDbHIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICBwcm9tcHREaXYuY2xhc3NMaXN0LmFkZChlcnJvckNscik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcHJvbXB0RGl2LmNsYXNzTGlzdC5hZGQoZGVmYXVsdENscik7IC8vIERlZmF1bHQgdGV4dCBjb2xvclxuICAgICAgfVxuXG4gICAgICAvLyBBcHBlbmQgdGhlIG5ldyBkaXYgdG8gdGhlIGRpc3BsYXkgY29udGFpbmVyXG4gICAgICBkaXNwbGF5LmFwcGVuZENoaWxkKHByb21wdERpdik7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gZm9yIHJlbmRlcmluZyBzaGlwcyB0byB0aGUgU2hpcCBTdGF0dXMgZGlzcGxheSBzZWN0aW9uXG4gIGNvbnN0IHJlbmRlclNoaXBEaXNwID0gKHBsYXllck9iaiwgc2hpcFR5cGUpID0+IHtcbiAgICBsZXQgaWRTZWw7XG5cbiAgICAvLyBTZXQgdGhlIGNvcnJlY3QgaWQgc2VsZWN0b3IgZm9yIHRoZSB0eXBlIG9mIHBsYXllclxuICAgIGlmIChwbGF5ZXJPYmoudHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICBpZFNlbCA9IFwiaHVtYW4tZGlzcGxheVwiO1xuICAgIH0gZWxzZSBpZiAocGxheWVyT2JqLnR5cGUgPT09IFwiY29tcHV0ZXJcIikge1xuICAgICAgaWRTZWwgPSBcImNvbXAtZGlzcGxheVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcjtcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIGNvcnJlY3QgRE9NIGVsZW1lbnRcbiAgICBjb25zdCBkaXNwRGl2ID0gZG9jdW1lbnRcbiAgICAgIC5nZXRFbGVtZW50QnlJZChpZFNlbClcbiAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLnNoaXBzLWNvbnRhaW5lclwiKTtcblxuICAgIC8vIEdldCB0aGUgc2hpcCBmcm9tIHRoZSBwbGF5ZXJcbiAgICBjb25zdCBzaGlwID0gcGxheWVyT2JqLmdhbWVib2FyZC5nZXRTaGlwKHNoaXBUeXBlKTtcblxuICAgIC8vIENyZWF0ZSBhIGRpdiBmb3IgdGhlIHNoaXBcbiAgICBjb25zdCBzaGlwRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBzaGlwRGl2LmNsYXNzTmFtZSA9IFwicHgtNCBweS0yIGZsZXggZmxleC1jb2wgZ2FwLTFcIjtcblxuICAgIC8vIEFkZCBhIHRpdGxlIHRoZSB0aGUgZGl2XG4gICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaDJcIik7XG4gICAgdGl0bGUudGV4dENvbnRlbnQgPSBzaGlwVHlwZTsgLy8gU2V0IHRoZSB0aXRsZSB0byB0aGUgc2hpcCB0eXBlXG4gICAgc2hpcERpdi5hcHBlbmRDaGlsZCh0aXRsZSk7XG5cbiAgICAvLyBHZXQgdGhlIHNoaXAgcG9zaXRpb25zIGFycmF5XG4gICAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IHBsYXllck9iai5nYW1lYm9hcmQuZ2V0U2hpcFBvc2l0aW9ucyhzaGlwVHlwZSk7XG5cbiAgICAvLyBCdWlsZCB0aGUgc2hpcCBzZWN0aW9uc1xuICAgIGNvbnN0IHNoaXBTZWN0cyA9IGJ1aWxkU2hpcChzaGlwLCBpZFNlbCwgc2hpcFBvc2l0aW9ucyk7XG5cbiAgICAvLyBBZGQgdGhlIHNoaXAgc2VjdGlvbnMgdG8gdGhlIGRpdlxuICAgIGNvbnN0IHNlY3RzRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBzZWN0c0Rpdi5jbGFzc05hbWUgPSBcImZsZXggZmxleC1yb3cgZ2FwLTFcIjtcbiAgICBzaGlwU2VjdHMuZm9yRWFjaCgoc2VjdCkgPT4ge1xuICAgICAgc2VjdHNEaXYuYXBwZW5kQ2hpbGQoc2VjdCk7XG4gICAgfSk7XG4gICAgc2hpcERpdi5hcHBlbmRDaGlsZChzZWN0c0Rpdik7XG5cbiAgICBkaXNwRGl2LmFwcGVuZENoaWxkKHNoaXBEaXYpO1xuICB9O1xuXG4gIC8vIEZ1bmN0aW9uIGZvciByIHNoaXBzIG9uIHRoZSBnYW1lYm9hcmRcbiAgY29uc3QgcmVuZGVyU2hpcEJvYXJkID0gKHBsYXllck9iaiwgc2hpcFR5cGUpID0+IHtcbiAgICBsZXQgaWRTZWw7XG5cbiAgICAvLyBTZXQgdGhlIGNvcnJlY3QgaWQgc2VsZWN0b3IgZm9yIHRoZSB0eXBlIG9mIHBsYXllclxuICAgIGlmIChwbGF5ZXJPYmoudHlwZSA9PT0gXCJodW1hblwiKSB7XG4gICAgICBpZFNlbCA9IFwiaHVtYW4tYm9hcmRcIjtcbiAgICB9IGVsc2UgaWYgKHBsYXllck9iai50eXBlID09PSBcImNvbXB1dGVyXCIpIHtcbiAgICAgIGlkU2VsID0gXCJjb21wLWJvYXJkXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yKFwiTm8gbWF0Y2hpbmcgcGxheWVyIHR5cGUgaW4gJ3JlbmRlclNoaXBCb2FyZCcgZnVuY3Rpb25cIik7XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSBwbGF5ZXIncyB0eXBlIGFuZCBnYW1lYm9hcmRcbiAgICBjb25zdCB7IHR5cGU6IHBsYXllclR5cGUsIGdhbWVib2FyZCB9ID0gcGxheWVyT2JqO1xuXG4gICAgLy8gR2V0IHRoZSBzaGlwIGFuZCB0aGUgc2hpcCBwb3NpdGlvbnNcbiAgICBjb25zdCBzaGlwT2JqID0gZ2FtZWJvYXJkLmdldFNoaXAoc2hpcFR5cGUpO1xuICAgIGNvbnN0IHNoaXBQb3NpdGlvbnMgPSBnYW1lYm9hcmQuZ2V0U2hpcFBvc2l0aW9ucyhzaGlwVHlwZSk7XG5cbiAgICAvLyBCdWlsZCB0aGUgc2hpcCBzZWN0aW9uc1xuICAgIGNvbnN0IHNoaXBTZWN0cyA9IGJ1aWxkU2hpcChzaGlwT2JqLCBpZFNlbCwgc2hpcFBvc2l0aW9ucyk7XG5cbiAgICAvLyBNYXRjaCB0aGUgY2VsbCBwb3NpdGlvbnMgd2l0aCB0aGUgc2hpcCBzZWN0aW9ucyBhbmQgcGxhY2UgZWFjaFxuICAgIC8vIHNoaXAgc2VjdGlvbiBpbiB0aGUgY29ycmVzcG9uZGluZyBjZWxsIGVsZW1lbnRcbiAgICBzaGlwUG9zaXRpb25zLmZvckVhY2goKHBvc2l0aW9uKSA9PiB7XG4gICAgICBjb25zdCBjZWxsRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke3BsYXllclR5cGV9LSR7cG9zaXRpb259YCk7XG4gICAgICAvLyBGaW5kIHRoZSBzaGlwIHNlY3Rpb24gZWxlbWVudCB0aGF0IG1hdGNoZXMgdGhlIGN1cnJlbnQgcG9zaXRpb25cbiAgICAgIGNvbnN0IHNoaXBTZWN0ID0gc2hpcFNlY3RzLmZpbmQoXG4gICAgICAgIChzZWN0aW9uKSA9PiBzZWN0aW9uLmRhdGFzZXQucG9zaXRpb24gPT09IHBvc2l0aW9uLFxuICAgICAgKTtcblxuICAgICAgaWYgKGNlbGxFbGVtZW50ICYmIHNoaXBTZWN0KSB7XG4gICAgICAgIC8vIFBsYWNlIHRoZSBzaGlwIHNlY3Rpb24gaW4gdGhlIGNlbGxcbiAgICAgICAgY2VsbEVsZW1lbnQuYXBwZW5kQ2hpbGQoc2hpcFNlY3QpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIGNvbnN0IHJlbmRlclNoaXBTZWN0ID0gKHNoaXBUeXBlLCBwb3MpID0+IHtcbiAgICAvLyBCdWlsZCBhIHNlY3Rpb24gd2l0aCB0aGUgaWQgRE9NIHNlbGVjdG9yIG9mIFwiY29tcC1ib2FyZFwiXG4gICAgY29uc3Qgc2VjdCA9IGJ1aWxkU2VjdGlvbihcImNvbXAtYm9hcmRcIiwgc2hpcFR5cGUsIHBvcyk7XG5cbiAgICAvLyBHZXQgdGhlIGNvcnJlY3QgY2VsbCBlbGVtZW50XG4gICAgY29uc3QgY2VsbEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgY29tcHV0ZXItJHtwb3N9YCk7XG5cbiAgICBpZiAoY2VsbEVsZW1lbnQgJiYgc2VjdCkge1xuICAgICAgLy8gUGxhY2UgdGhlIHNoaXAgc2VjdGlvbiBpbiB0aGUgY2VsbFxuICAgICAgY2VsbEVsZW1lbnQuYXBwZW5kQ2hpbGQoc2VjdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYE1pc3Npbmcgc2hpcCBzZWN0aW9uIGFuZC9vciBjZWxsIGVsZW1lbnQuIFNoaXAgc2VjdGlvbiA9ICR7c2VjdH0uIENlbGwgZWxlbWVudCA9ICR7Y2VsbEVsZW1lbnR9LmAsXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCB1cGRhdGVTaGlwU2VjdGlvbiA9IChwb3MsIHNoaXBUeXBlLCBwbGF5ZXJUeXBlLCBpc1NoaXBTdW5rID0gZmFsc2UpID0+IHtcbiAgICBsZXQgbmV3Q2xyO1xuXG4gICAgc3dpdGNoIChpc1NoaXBTdW5rKSB7XG4gICAgICBjYXNlIHRydWU6XG4gICAgICAgIG5ld0NsciA9IHNoaXBTdW5rQ2xyO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIG5ld0NsciA9IHNoaXBIaXRDbHI7XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBzZWxlY3RvciB2YWx1ZSBkZXBlbmRpbmcgb24gdGhlIHBsYXllciB0eXBlXG4gICAgY29uc3QgcGxheWVySWQgPSBwbGF5ZXJUeXBlID09PSBcImh1bWFuXCIgPyBcImh1bWFuXCIgOiBcImNvbXBcIjtcblxuICAgIC8vIElmIHRoZSBwbGF5ZXIgdHlwZSBpcyBjb21wdXRlciBhbmQgdGhlIHNoaXAgaXNuJ3Qgc3VuayB0aGVuXG4gICAgLy8gcmVuZGVyIHRoZSBzaW5nbGUgc2hpcCBzZWN0aW9uIG9uIHRoZSBib2FyZFxuICAgIGlmIChwbGF5ZXJJZCA9PT0gXCJjb21wXCIgJiYgIWlzU2hpcFN1bmspIHtcbiAgICAgIHJlbmRlclNoaXBTZWN0KHNoaXBUeXBlLCBwb3MpO1xuICAgIH1cblxuICAgIC8vIElmIHBsYXllciB0eXBlIGlzIGh1bWFuIHRoZW4gYWxzbyB1cGRhdGUgdGhlIHNoaXAgc2VjdGlvbiBvbiB0aGUgYm9hcmRcbiAgICBpZiAocGxheWVySWQgPT09IFwiaHVtYW5cIiB8fCBpc1NoaXBTdW5rKSB7XG4gICAgICAvLyBHZXQgdGhlIGNvcnJlY3Qgc2hpcCBzZWN0aW9uIGVsZW1lbnQgZnJvbSB0aGUgRE9NIGZvciB0aGVcbiAgICAgIC8vIHN0YXR1cyBkaXNwbGF5XG4gICAgICBjb25zdCBzaGlwU2VjdERpc3BsYXlFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgICBgRE9NLSR7cGxheWVySWR9LWRpc3BsYXktc2hpcFR5cGUtJHtzaGlwVHlwZX0tcG9zLSR7cG9zfWAsXG4gICAgICApO1xuXG4gICAgICAvLyBJZiB0aGUgZWxlbWVudCB3YXMgZm91bmQgc3VjY2Vzc2Z1bGx5LCBjaGFuZ2UgaXRzIGNvbG91ciwgb3RoZXJ3aXNlXG4gICAgICAvLyB0aHJvdyBlcnJvclxuICAgICAgaWYgKCFzaGlwU2VjdERpc3BsYXlFbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgXCJFcnJvciEgU2hpcCBzZWN0aW9uIGVsZW1lbnQgbm90IGZvdW5kIGluIHN0YXR1cyBkaXNwbGF5ISAodXBkYXRlU2hpcFNlY3Rpb24pXCIsXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaGlwU2VjdERpc3BsYXlFbC5jbGFzc0xpc3QucmVtb3ZlKHNoaXBTZWN0Q2xyKTtcbiAgICAgICAgc2hpcFNlY3REaXNwbGF5RWwuY2xhc3NMaXN0LnJlbW92ZShzaGlwSGl0Q2xyKTtcbiAgICAgICAgc2hpcFNlY3REaXNwbGF5RWwuY2xhc3NMaXN0LmFkZChuZXdDbHIpO1xuICAgICAgfVxuXG4gICAgICBpZiAocGxheWVySWQgPT09IFwiaHVtYW5cIiB8fCBwbGF5ZXJJZCA9PT0gXCJjb21wXCIpIHtcbiAgICAgICAgLy8gR2V0IHRoZSBjb3JyZWN0IHNoaXAgc2VjdGlvbiBlbGVtZW50IGZyb20gdGhlIERPTSBmb3IgdGhlXG4gICAgICAgIC8vIGdhbWVib2FyZCBkaXNwbGF5XG4gICAgICAgIGNvbnN0IHNoaXBTZWN0Qm9hcmRFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgICAgIGBET00tJHtwbGF5ZXJJZH0tYm9hcmQtc2hpcFR5cGUtJHtzaGlwVHlwZX0tcG9zLSR7cG9zfWAsXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gSWYgdGhlIGVsZW1lbnQgd2FzIGZvdW5kIHN1Y2Nlc3NmdWxseSwgY2hhbmdlIGl0cyBjb2xvdXIsIG90aGVyd2lzZVxuICAgICAgICAvLyB0aHJvdyBlcnJvclxuICAgICAgICBpZiAoIXNoaXBTZWN0Qm9hcmRFbCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIFwiRXJyb3IhIFNoaXAgc2VjdGlvbiBlbGVtZW50IG5vdCBmb3VuZCBvbiBnYW1lYm9hcmQhICh1cGRhdGVTaGlwU2VjdGlvbilcIixcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNoaXBTZWN0Qm9hcmRFbC5jbGFzc0xpc3QucmVtb3ZlKHNoaXBTZWN0Q2xyKTtcbiAgICAgICAgICBzaGlwU2VjdEJvYXJkRWwuY2xhc3NMaXN0LnJlbW92ZShzaGlwSGl0Q2xyKTtcbiAgICAgICAgICBzaGlwU2VjdEJvYXJkRWwuY2xhc3NMaXN0LmFkZChuZXdDbHIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHJlbmRlclN1bmtlblNoaXAgPSAocGxheWVyT2JqLCBzaGlwVHlwZSkgPT4ge1xuICAgIC8vIEdldCB0aGUgcGxheWVyIHR5cGVcbiAgICBjb25zdCB7IHR5cGUgfSA9IHBsYXllck9iajtcblxuICAgIC8vIEdldCB0aGUgc2hpcCBwb3NpdGlvbnMgZm9yIHRoZSBzaGlwXG4gICAgY29uc3Qgc2hpcFBvc2l0aW9ucyA9IHBsYXllck9iai5nYW1lYm9hcmQuZ2V0U2hpcFBvc2l0aW9ucyhzaGlwVHlwZSk7XG5cbiAgICBzaGlwUG9zaXRpb25zLmZvckVhY2goKHBvcykgPT4ge1xuICAgICAgdXBkYXRlU2hpcFNlY3Rpb24ocG9zLCBzaGlwVHlwZSwgdHlwZSwgdHJ1ZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgY29uc3QgcHJvbXB0RW5kR2FtZSA9ICh3aW5uZXIpID0+IHtcbiAgICAvLyBDcmVhdGUgYW5kIGRpc3BsYXkgcG9wLXVwXG4gICAgZW5kR2FtZUludGVyZmFjZSh3aW5uZXIpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgY3JlYXRlR2FtZWJvYXJkLFxuICAgIGluaXRDb25zb2xlVUksXG4gICAgZGlzcGxheVByb21wdCxcbiAgICByZW5kZXJTaGlwRGlzcCxcbiAgICByZW5kZXJTaGlwQm9hcmQsXG4gICAgdXBkYXRlU2hpcFNlY3Rpb24sXG4gICAgcmVuZGVyU3Vua2VuU2hpcCxcbiAgICBwcm9tcHRFbmRHYW1lLFxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgVWlNYW5hZ2VyO1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgYC8qXG4hIHRhaWx3aW5kY3NzIHYzLjQuMSB8IE1JVCBMaWNlbnNlIHwgaHR0cHM6Ly90YWlsd2luZGNzcy5jb21cbiovLypcbjEuIFByZXZlbnQgcGFkZGluZyBhbmQgYm9yZGVyIGZyb20gYWZmZWN0aW5nIGVsZW1lbnQgd2lkdGguIChodHRwczovL2dpdGh1Yi5jb20vbW96ZGV2cy9jc3NyZW1lZHkvaXNzdWVzLzQpXG4yLiBBbGxvdyBhZGRpbmcgYSBib3JkZXIgdG8gYW4gZWxlbWVudCBieSBqdXN0IGFkZGluZyBhIGJvcmRlci13aWR0aC4gKGh0dHBzOi8vZ2l0aHViLmNvbS90YWlsd2luZGNzcy90YWlsd2luZGNzcy9wdWxsLzExNilcbiovXG5cbiosXG46OmJlZm9yZSxcbjo6YWZ0ZXIge1xuICBib3gtc2l6aW5nOiBib3JkZXItYm94OyAvKiAxICovXG4gIGJvcmRlci13aWR0aDogMDsgLyogMiAqL1xuICBib3JkZXItc3R5bGU6IHNvbGlkOyAvKiAyICovXG4gIGJvcmRlci1jb2xvcjogI2U1ZTdlYjsgLyogMiAqL1xufVxuXG46OmJlZm9yZSxcbjo6YWZ0ZXIge1xuICAtLXR3LWNvbnRlbnQ6ICcnO1xufVxuXG4vKlxuMS4gVXNlIGEgY29uc2lzdGVudCBzZW5zaWJsZSBsaW5lLWhlaWdodCBpbiBhbGwgYnJvd3NlcnMuXG4yLiBQcmV2ZW50IGFkanVzdG1lbnRzIG9mIGZvbnQgc2l6ZSBhZnRlciBvcmllbnRhdGlvbiBjaGFuZ2VzIGluIGlPUy5cbjMuIFVzZSBhIG1vcmUgcmVhZGFibGUgdGFiIHNpemUuXG40LiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYHNhbnNcXGAgZm9udC1mYW1pbHkgYnkgZGVmYXVsdC5cbjUuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgc2Fuc1xcYCBmb250LWZlYXR1cmUtc2V0dGluZ3MgYnkgZGVmYXVsdC5cbjYuIFVzZSB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgXFxgc2Fuc1xcYCBmb250LXZhcmlhdGlvbi1zZXR0aW5ncyBieSBkZWZhdWx0LlxuNy4gRGlzYWJsZSB0YXAgaGlnaGxpZ2h0cyBvbiBpT1NcbiovXG5cbmh0bWwsXG46aG9zdCB7XG4gIGxpbmUtaGVpZ2h0OiAxLjU7IC8qIDEgKi9cbiAgLXdlYmtpdC10ZXh0LXNpemUtYWRqdXN0OiAxMDAlOyAvKiAyICovXG4gIC1tb3otdGFiLXNpemU6IDQ7IC8qIDMgKi9cbiAgLW8tdGFiLXNpemU6IDQ7XG4gICAgIHRhYi1zaXplOiA0OyAvKiAzICovXG4gIGZvbnQtZmFtaWx5OiB1aS1zYW5zLXNlcmlmLCBzeXN0ZW0tdWksIHNhbnMtc2VyaWYsIFwiQXBwbGUgQ29sb3IgRW1vamlcIiwgXCJTZWdvZSBVSSBFbW9qaVwiLCBcIlNlZ29lIFVJIFN5bWJvbFwiLCBcIk5vdG8gQ29sb3IgRW1vamlcIjsgLyogNCAqL1xuICBmb250LWZlYXR1cmUtc2V0dGluZ3M6IG5vcm1hbDsgLyogNSAqL1xuICBmb250LXZhcmlhdGlvbi1zZXR0aW5nczogbm9ybWFsOyAvKiA2ICovXG4gIC13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7IC8qIDcgKi9cbn1cblxuLypcbjEuIFJlbW92ZSB0aGUgbWFyZ2luIGluIGFsbCBicm93c2Vycy5cbjIuIEluaGVyaXQgbGluZS1oZWlnaHQgZnJvbSBcXGBodG1sXFxgIHNvIHVzZXJzIGNhbiBzZXQgdGhlbSBhcyBhIGNsYXNzIGRpcmVjdGx5IG9uIHRoZSBcXGBodG1sXFxgIGVsZW1lbnQuXG4qL1xuXG5ib2R5IHtcbiAgbWFyZ2luOiAwOyAvKiAxICovXG4gIGxpbmUtaGVpZ2h0OiBpbmhlcml0OyAvKiAyICovXG59XG5cbi8qXG4xLiBBZGQgdGhlIGNvcnJlY3QgaGVpZ2h0IGluIEZpcmVmb3guXG4yLiBDb3JyZWN0IHRoZSBpbmhlcml0YW5jZSBvZiBib3JkZXIgY29sb3IgaW4gRmlyZWZveC4gKGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTE5MDY1NSlcbjMuIEVuc3VyZSBob3Jpem9udGFsIHJ1bGVzIGFyZSB2aXNpYmxlIGJ5IGRlZmF1bHQuXG4qL1xuXG5ociB7XG4gIGhlaWdodDogMDsgLyogMSAqL1xuICBjb2xvcjogaW5oZXJpdDsgLyogMiAqL1xuICBib3JkZXItdG9wLXdpZHRoOiAxcHg7IC8qIDMgKi9cbn1cblxuLypcbkFkZCB0aGUgY29ycmVjdCB0ZXh0IGRlY29yYXRpb24gaW4gQ2hyb21lLCBFZGdlLCBhbmQgU2FmYXJpLlxuKi9cblxuYWJicjp3aGVyZShbdGl0bGVdKSB7XG4gIC13ZWJraXQtdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmUgZG90dGVkO1xuICAgICAgICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lIGRvdHRlZDtcbn1cblxuLypcblJlbW92ZSB0aGUgZGVmYXVsdCBmb250IHNpemUgYW5kIHdlaWdodCBmb3IgaGVhZGluZ3MuXG4qL1xuXG5oMSxcbmgyLFxuaDMsXG5oNCxcbmg1LFxuaDYge1xuICBmb250LXNpemU6IGluaGVyaXQ7XG4gIGZvbnQtd2VpZ2h0OiBpbmhlcml0O1xufVxuXG4vKlxuUmVzZXQgbGlua3MgdG8gb3B0aW1pemUgZm9yIG9wdC1pbiBzdHlsaW5nIGluc3RlYWQgb2Ygb3B0LW91dC5cbiovXG5cbmEge1xuICBjb2xvcjogaW5oZXJpdDtcbiAgdGV4dC1kZWNvcmF0aW9uOiBpbmhlcml0O1xufVxuXG4vKlxuQWRkIHRoZSBjb3JyZWN0IGZvbnQgd2VpZ2h0IGluIEVkZ2UgYW5kIFNhZmFyaS5cbiovXG5cbmIsXG5zdHJvbmcge1xuICBmb250LXdlaWdodDogYm9sZGVyO1xufVxuXG4vKlxuMS4gVXNlIHRoZSB1c2VyJ3MgY29uZmlndXJlZCBcXGBtb25vXFxgIGZvbnQtZmFtaWx5IGJ5IGRlZmF1bHQuXG4yLiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYG1vbm9cXGAgZm9udC1mZWF0dXJlLXNldHRpbmdzIGJ5IGRlZmF1bHQuXG4zLiBVc2UgdGhlIHVzZXIncyBjb25maWd1cmVkIFxcYG1vbm9cXGAgZm9udC12YXJpYXRpb24tc2V0dGluZ3MgYnkgZGVmYXVsdC5cbjQuIENvcnJlY3QgdGhlIG9kZCBcXGBlbVxcYCBmb250IHNpemluZyBpbiBhbGwgYnJvd3NlcnMuXG4qL1xuXG5jb2RlLFxua2JkLFxuc2FtcCxcbnByZSB7XG4gIGZvbnQtZmFtaWx5OiB1aS1tb25vc3BhY2UsIFNGTW9uby1SZWd1bGFyLCBNZW5sbywgTW9uYWNvLCBDb25zb2xhcywgXCJMaWJlcmF0aW9uIE1vbm9cIiwgXCJDb3VyaWVyIE5ld1wiLCBtb25vc3BhY2U7IC8qIDEgKi9cbiAgZm9udC1mZWF0dXJlLXNldHRpbmdzOiBub3JtYWw7IC8qIDIgKi9cbiAgZm9udC12YXJpYXRpb24tc2V0dGluZ3M6IG5vcm1hbDsgLyogMyAqL1xuICBmb250LXNpemU6IDFlbTsgLyogNCAqL1xufVxuXG4vKlxuQWRkIHRoZSBjb3JyZWN0IGZvbnQgc2l6ZSBpbiBhbGwgYnJvd3NlcnMuXG4qL1xuXG5zbWFsbCB7XG4gIGZvbnQtc2l6ZTogODAlO1xufVxuXG4vKlxuUHJldmVudCBcXGBzdWJcXGAgYW5kIFxcYHN1cFxcYCBlbGVtZW50cyBmcm9tIGFmZmVjdGluZyB0aGUgbGluZSBoZWlnaHQgaW4gYWxsIGJyb3dzZXJzLlxuKi9cblxuc3ViLFxuc3VwIHtcbiAgZm9udC1zaXplOiA3NSU7XG4gIGxpbmUtaGVpZ2h0OiAwO1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTtcbn1cblxuc3ViIHtcbiAgYm90dG9tOiAtMC4yNWVtO1xufVxuXG5zdXAge1xuICB0b3A6IC0wLjVlbTtcbn1cblxuLypcbjEuIFJlbW92ZSB0ZXh0IGluZGVudGF0aW9uIGZyb20gdGFibGUgY29udGVudHMgaW4gQ2hyb21lIGFuZCBTYWZhcmkuIChodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD05OTkwODgsIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0yMDEyOTcpXG4yLiBDb3JyZWN0IHRhYmxlIGJvcmRlciBjb2xvciBpbmhlcml0YW5jZSBpbiBhbGwgQ2hyb21lIGFuZCBTYWZhcmkuIChodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD05MzU3MjksIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0xOTUwMTYpXG4zLiBSZW1vdmUgZ2FwcyBiZXR3ZWVuIHRhYmxlIGJvcmRlcnMgYnkgZGVmYXVsdC5cbiovXG5cbnRhYmxlIHtcbiAgdGV4dC1pbmRlbnQ6IDA7IC8qIDEgKi9cbiAgYm9yZGVyLWNvbG9yOiBpbmhlcml0OyAvKiAyICovXG4gIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7IC8qIDMgKi9cbn1cblxuLypcbjEuIENoYW5nZSB0aGUgZm9udCBzdHlsZXMgaW4gYWxsIGJyb3dzZXJzLlxuMi4gUmVtb3ZlIHRoZSBtYXJnaW4gaW4gRmlyZWZveCBhbmQgU2FmYXJpLlxuMy4gUmVtb3ZlIGRlZmF1bHQgcGFkZGluZyBpbiBhbGwgYnJvd3NlcnMuXG4qL1xuXG5idXR0b24sXG5pbnB1dCxcbm9wdGdyb3VwLFxuc2VsZWN0LFxudGV4dGFyZWEge1xuICBmb250LWZhbWlseTogaW5oZXJpdDsgLyogMSAqL1xuICBmb250LWZlYXR1cmUtc2V0dGluZ3M6IGluaGVyaXQ7IC8qIDEgKi9cbiAgZm9udC12YXJpYXRpb24tc2V0dGluZ3M6IGluaGVyaXQ7IC8qIDEgKi9cbiAgZm9udC1zaXplOiAxMDAlOyAvKiAxICovXG4gIGZvbnQtd2VpZ2h0OiBpbmhlcml0OyAvKiAxICovXG4gIGxpbmUtaGVpZ2h0OiBpbmhlcml0OyAvKiAxICovXG4gIGNvbG9yOiBpbmhlcml0OyAvKiAxICovXG4gIG1hcmdpbjogMDsgLyogMiAqL1xuICBwYWRkaW5nOiAwOyAvKiAzICovXG59XG5cbi8qXG5SZW1vdmUgdGhlIGluaGVyaXRhbmNlIG9mIHRleHQgdHJhbnNmb3JtIGluIEVkZ2UgYW5kIEZpcmVmb3guXG4qL1xuXG5idXR0b24sXG5zZWxlY3Qge1xuICB0ZXh0LXRyYW5zZm9ybTogbm9uZTtcbn1cblxuLypcbjEuIENvcnJlY3QgdGhlIGluYWJpbGl0eSB0byBzdHlsZSBjbGlja2FibGUgdHlwZXMgaW4gaU9TIGFuZCBTYWZhcmkuXG4yLiBSZW1vdmUgZGVmYXVsdCBidXR0b24gc3R5bGVzLlxuKi9cblxuYnV0dG9uLFxuW3R5cGU9J2J1dHRvbiddLFxuW3R5cGU9J3Jlc2V0J10sXG5bdHlwZT0nc3VibWl0J10ge1xuICAtd2Via2l0LWFwcGVhcmFuY2U6IGJ1dHRvbjsgLyogMSAqL1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDsgLyogMiAqL1xuICBiYWNrZ3JvdW5kLWltYWdlOiBub25lOyAvKiAyICovXG59XG5cbi8qXG5Vc2UgdGhlIG1vZGVybiBGaXJlZm94IGZvY3VzIHN0eWxlIGZvciBhbGwgZm9jdXNhYmxlIGVsZW1lbnRzLlxuKi9cblxuOi1tb3otZm9jdXNyaW5nIHtcbiAgb3V0bGluZTogYXV0bztcbn1cblxuLypcblJlbW92ZSB0aGUgYWRkaXRpb25hbCBcXGA6aW52YWxpZFxcYCBzdHlsZXMgaW4gRmlyZWZveC4gKGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL2dlY2tvLWRldi9ibG9iLzJmOWVhY2Q5ZDNkOTk1YzkzN2I0MjUxYTU1NTdkOTVkNDk0YzliZTEvbGF5b3V0L3N0eWxlL3Jlcy9mb3Jtcy5jc3MjTDcyOC1MNzM3KVxuKi9cblxuOi1tb3otdWktaW52YWxpZCB7XG4gIGJveC1zaGFkb3c6IG5vbmU7XG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgdmVydGljYWwgYWxpZ25tZW50IGluIENocm9tZSBhbmQgRmlyZWZveC5cbiovXG5cbnByb2dyZXNzIHtcbiAgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xufVxuXG4vKlxuQ29ycmVjdCB0aGUgY3Vyc29yIHN0eWxlIG9mIGluY3JlbWVudCBhbmQgZGVjcmVtZW50IGJ1dHRvbnMgaW4gU2FmYXJpLlxuKi9cblxuOjotd2Via2l0LWlubmVyLXNwaW4tYnV0dG9uLFxuOjotd2Via2l0LW91dGVyLXNwaW4tYnV0dG9uIHtcbiAgaGVpZ2h0OiBhdXRvO1xufVxuXG4vKlxuMS4gQ29ycmVjdCB0aGUgb2RkIGFwcGVhcmFuY2UgaW4gQ2hyb21lIGFuZCBTYWZhcmkuXG4yLiBDb3JyZWN0IHRoZSBvdXRsaW5lIHN0eWxlIGluIFNhZmFyaS5cbiovXG5cblt0eXBlPSdzZWFyY2gnXSB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogdGV4dGZpZWxkOyAvKiAxICovXG4gIG91dGxpbmUtb2Zmc2V0OiAtMnB4OyAvKiAyICovXG59XG5cbi8qXG5SZW1vdmUgdGhlIGlubmVyIHBhZGRpbmcgaW4gQ2hyb21lIGFuZCBTYWZhcmkgb24gbWFjT1MuXG4qL1xuXG46Oi13ZWJraXQtc2VhcmNoLWRlY29yYXRpb24ge1xuICAtd2Via2l0LWFwcGVhcmFuY2U6IG5vbmU7XG59XG5cbi8qXG4xLiBDb3JyZWN0IHRoZSBpbmFiaWxpdHkgdG8gc3R5bGUgY2xpY2thYmxlIHR5cGVzIGluIGlPUyBhbmQgU2FmYXJpLlxuMi4gQ2hhbmdlIGZvbnQgcHJvcGVydGllcyB0byBcXGBpbmhlcml0XFxgIGluIFNhZmFyaS5cbiovXG5cbjo6LXdlYmtpdC1maWxlLXVwbG9hZC1idXR0b24ge1xuICAtd2Via2l0LWFwcGVhcmFuY2U6IGJ1dHRvbjsgLyogMSAqL1xuICBmb250OiBpbmhlcml0OyAvKiAyICovXG59XG5cbi8qXG5BZGQgdGhlIGNvcnJlY3QgZGlzcGxheSBpbiBDaHJvbWUgYW5kIFNhZmFyaS5cbiovXG5cbnN1bW1hcnkge1xuICBkaXNwbGF5OiBsaXN0LWl0ZW07XG59XG5cbi8qXG5SZW1vdmVzIHRoZSBkZWZhdWx0IHNwYWNpbmcgYW5kIGJvcmRlciBmb3IgYXBwcm9wcmlhdGUgZWxlbWVudHMuXG4qL1xuXG5ibG9ja3F1b3RlLFxuZGwsXG5kZCxcbmgxLFxuaDIsXG5oMyxcbmg0LFxuaDUsXG5oNixcbmhyLFxuZmlndXJlLFxucCxcbnByZSB7XG4gIG1hcmdpbjogMDtcbn1cblxuZmllbGRzZXQge1xuICBtYXJnaW46IDA7XG4gIHBhZGRpbmc6IDA7XG59XG5cbmxlZ2VuZCB7XG4gIHBhZGRpbmc6IDA7XG59XG5cbm9sLFxudWwsXG5tZW51IHtcbiAgbGlzdC1zdHlsZTogbm9uZTtcbiAgbWFyZ2luOiAwO1xuICBwYWRkaW5nOiAwO1xufVxuXG4vKlxuUmVzZXQgZGVmYXVsdCBzdHlsaW5nIGZvciBkaWFsb2dzLlxuKi9cbmRpYWxvZyB7XG4gIHBhZGRpbmc6IDA7XG59XG5cbi8qXG5QcmV2ZW50IHJlc2l6aW5nIHRleHRhcmVhcyBob3Jpem9udGFsbHkgYnkgZGVmYXVsdC5cbiovXG5cbnRleHRhcmVhIHtcbiAgcmVzaXplOiB2ZXJ0aWNhbDtcbn1cblxuLypcbjEuIFJlc2V0IHRoZSBkZWZhdWx0IHBsYWNlaG9sZGVyIG9wYWNpdHkgaW4gRmlyZWZveC4gKGh0dHBzOi8vZ2l0aHViLmNvbS90YWlsd2luZGxhYnMvdGFpbHdpbmRjc3MvaXNzdWVzLzMzMDApXG4yLiBTZXQgdGhlIGRlZmF1bHQgcGxhY2Vob2xkZXIgY29sb3IgdG8gdGhlIHVzZXIncyBjb25maWd1cmVkIGdyYXkgNDAwIGNvbG9yLlxuKi9cblxuaW5wdXQ6Oi1tb3otcGxhY2Vob2xkZXIsIHRleHRhcmVhOjotbW96LXBsYWNlaG9sZGVyIHtcbiAgb3BhY2l0eTogMTsgLyogMSAqL1xuICBjb2xvcjogIzljYTNhZjsgLyogMiAqL1xufVxuXG5pbnB1dDo6cGxhY2Vob2xkZXIsXG50ZXh0YXJlYTo6cGxhY2Vob2xkZXIge1xuICBvcGFjaXR5OiAxOyAvKiAxICovXG4gIGNvbG9yOiAjOWNhM2FmOyAvKiAyICovXG59XG5cbi8qXG5TZXQgdGhlIGRlZmF1bHQgY3Vyc29yIGZvciBidXR0b25zLlxuKi9cblxuYnV0dG9uLFxuW3JvbGU9XCJidXR0b25cIl0ge1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG5cbi8qXG5NYWtlIHN1cmUgZGlzYWJsZWQgYnV0dG9ucyBkb24ndCBnZXQgdGhlIHBvaW50ZXIgY3Vyc29yLlxuKi9cbjpkaXNhYmxlZCB7XG4gIGN1cnNvcjogZGVmYXVsdDtcbn1cblxuLypcbjEuIE1ha2UgcmVwbGFjZWQgZWxlbWVudHMgXFxgZGlzcGxheTogYmxvY2tcXGAgYnkgZGVmYXVsdC4gKGh0dHBzOi8vZ2l0aHViLmNvbS9tb3pkZXZzL2Nzc3JlbWVkeS9pc3N1ZXMvMTQpXG4yLiBBZGQgXFxgdmVydGljYWwtYWxpZ246IG1pZGRsZVxcYCB0byBhbGlnbiByZXBsYWNlZCBlbGVtZW50cyBtb3JlIHNlbnNpYmx5IGJ5IGRlZmF1bHQuIChodHRwczovL2dpdGh1Yi5jb20vamVuc2ltbW9ucy9jc3NyZW1lZHkvaXNzdWVzLzE0I2lzc3VlY29tbWVudC02MzQ5MzQyMTApXG4gICBUaGlzIGNhbiB0cmlnZ2VyIGEgcG9vcmx5IGNvbnNpZGVyZWQgbGludCBlcnJvciBpbiBzb21lIHRvb2xzIGJ1dCBpcyBpbmNsdWRlZCBieSBkZXNpZ24uXG4qL1xuXG5pbWcsXG5zdmcsXG52aWRlbyxcbmNhbnZhcyxcbmF1ZGlvLFxuaWZyYW1lLFxuZW1iZWQsXG5vYmplY3Qge1xuICBkaXNwbGF5OiBibG9jazsgLyogMSAqL1xuICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOyAvKiAyICovXG59XG5cbi8qXG5Db25zdHJhaW4gaW1hZ2VzIGFuZCB2aWRlb3MgdG8gdGhlIHBhcmVudCB3aWR0aCBhbmQgcHJlc2VydmUgdGhlaXIgaW50cmluc2ljIGFzcGVjdCByYXRpby4gKGh0dHBzOi8vZ2l0aHViLmNvbS9tb3pkZXZzL2Nzc3JlbWVkeS9pc3N1ZXMvMTQpXG4qL1xuXG5pbWcsXG52aWRlbyB7XG4gIG1heC13aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiBhdXRvO1xufVxuXG4vKiBNYWtlIGVsZW1lbnRzIHdpdGggdGhlIEhUTUwgaGlkZGVuIGF0dHJpYnV0ZSBzdGF5IGhpZGRlbiBieSBkZWZhdWx0ICovXG5baGlkZGVuXSB7XG4gIGRpc3BsYXk6IG5vbmU7XG59XG5cbiosIDo6YmVmb3JlLCA6OmFmdGVyIHtcbiAgLS10dy1ib3JkZXItc3BhY2luZy14OiAwO1xuICAtLXR3LWJvcmRlci1zcGFjaW5nLXk6IDA7XG4gIC0tdHctdHJhbnNsYXRlLXg6IDA7XG4gIC0tdHctdHJhbnNsYXRlLXk6IDA7XG4gIC0tdHctcm90YXRlOiAwO1xuICAtLXR3LXNrZXcteDogMDtcbiAgLS10dy1za2V3LXk6IDA7XG4gIC0tdHctc2NhbGUteDogMTtcbiAgLS10dy1zY2FsZS15OiAxO1xuICAtLXR3LXBhbi14OiAgO1xuICAtLXR3LXBhbi15OiAgO1xuICAtLXR3LXBpbmNoLXpvb206ICA7XG4gIC0tdHctc2Nyb2xsLXNuYXAtc3RyaWN0bmVzczogcHJveGltaXR5O1xuICAtLXR3LWdyYWRpZW50LWZyb20tcG9zaXRpb246ICA7XG4gIC0tdHctZ3JhZGllbnQtdmlhLXBvc2l0aW9uOiAgO1xuICAtLXR3LWdyYWRpZW50LXRvLXBvc2l0aW9uOiAgO1xuICAtLXR3LW9yZGluYWw6ICA7XG4gIC0tdHctc2xhc2hlZC16ZXJvOiAgO1xuICAtLXR3LW51bWVyaWMtZmlndXJlOiAgO1xuICAtLXR3LW51bWVyaWMtc3BhY2luZzogIDtcbiAgLS10dy1udW1lcmljLWZyYWN0aW9uOiAgO1xuICAtLXR3LXJpbmctaW5zZXQ6ICA7XG4gIC0tdHctcmluZy1vZmZzZXQtd2lkdGg6IDBweDtcbiAgLS10dy1yaW5nLW9mZnNldC1jb2xvcjogI2ZmZjtcbiAgLS10dy1yaW5nLWNvbG9yOiByZ2IoNTkgMTMwIDI0NiAvIDAuNSk7XG4gIC0tdHctcmluZy1vZmZzZXQtc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctcmluZy1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1zaGFkb3ctY29sb3JlZDogMCAwICMwMDAwO1xuICAtLXR3LWJsdXI6ICA7XG4gIC0tdHctYnJpZ2h0bmVzczogIDtcbiAgLS10dy1jb250cmFzdDogIDtcbiAgLS10dy1ncmF5c2NhbGU6ICA7XG4gIC0tdHctaHVlLXJvdGF0ZTogIDtcbiAgLS10dy1pbnZlcnQ6ICA7XG4gIC0tdHctc2F0dXJhdGU6ICA7XG4gIC0tdHctc2VwaWE6ICA7XG4gIC0tdHctZHJvcC1zaGFkb3c6ICA7XG4gIC0tdHctYmFja2Ryb3AtYmx1cjogIDtcbiAgLS10dy1iYWNrZHJvcC1icmlnaHRuZXNzOiAgO1xuICAtLXR3LWJhY2tkcm9wLWNvbnRyYXN0OiAgO1xuICAtLXR3LWJhY2tkcm9wLWdyYXlzY2FsZTogIDtcbiAgLS10dy1iYWNrZHJvcC1odWUtcm90YXRlOiAgO1xuICAtLXR3LWJhY2tkcm9wLWludmVydDogIDtcbiAgLS10dy1iYWNrZHJvcC1vcGFjaXR5OiAgO1xuICAtLXR3LWJhY2tkcm9wLXNhdHVyYXRlOiAgO1xuICAtLXR3LWJhY2tkcm9wLXNlcGlhOiAgO1xufVxuXG46OmJhY2tkcm9wIHtcbiAgLS10dy1ib3JkZXItc3BhY2luZy14OiAwO1xuICAtLXR3LWJvcmRlci1zcGFjaW5nLXk6IDA7XG4gIC0tdHctdHJhbnNsYXRlLXg6IDA7XG4gIC0tdHctdHJhbnNsYXRlLXk6IDA7XG4gIC0tdHctcm90YXRlOiAwO1xuICAtLXR3LXNrZXcteDogMDtcbiAgLS10dy1za2V3LXk6IDA7XG4gIC0tdHctc2NhbGUteDogMTtcbiAgLS10dy1zY2FsZS15OiAxO1xuICAtLXR3LXBhbi14OiAgO1xuICAtLXR3LXBhbi15OiAgO1xuICAtLXR3LXBpbmNoLXpvb206ICA7XG4gIC0tdHctc2Nyb2xsLXNuYXAtc3RyaWN0bmVzczogcHJveGltaXR5O1xuICAtLXR3LWdyYWRpZW50LWZyb20tcG9zaXRpb246ICA7XG4gIC0tdHctZ3JhZGllbnQtdmlhLXBvc2l0aW9uOiAgO1xuICAtLXR3LWdyYWRpZW50LXRvLXBvc2l0aW9uOiAgO1xuICAtLXR3LW9yZGluYWw6ICA7XG4gIC0tdHctc2xhc2hlZC16ZXJvOiAgO1xuICAtLXR3LW51bWVyaWMtZmlndXJlOiAgO1xuICAtLXR3LW51bWVyaWMtc3BhY2luZzogIDtcbiAgLS10dy1udW1lcmljLWZyYWN0aW9uOiAgO1xuICAtLXR3LXJpbmctaW5zZXQ6ICA7XG4gIC0tdHctcmluZy1vZmZzZXQtd2lkdGg6IDBweDtcbiAgLS10dy1yaW5nLW9mZnNldC1jb2xvcjogI2ZmZjtcbiAgLS10dy1yaW5nLWNvbG9yOiByZ2IoNTkgMTMwIDI0NiAvIDAuNSk7XG4gIC0tdHctcmluZy1vZmZzZXQtc2hhZG93OiAwIDAgIzAwMDA7XG4gIC0tdHctcmluZy1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1zaGFkb3c6IDAgMCAjMDAwMDtcbiAgLS10dy1zaGFkb3ctY29sb3JlZDogMCAwICMwMDAwO1xuICAtLXR3LWJsdXI6ICA7XG4gIC0tdHctYnJpZ2h0bmVzczogIDtcbiAgLS10dy1jb250cmFzdDogIDtcbiAgLS10dy1ncmF5c2NhbGU6ICA7XG4gIC0tdHctaHVlLXJvdGF0ZTogIDtcbiAgLS10dy1pbnZlcnQ6ICA7XG4gIC0tdHctc2F0dXJhdGU6ICA7XG4gIC0tdHctc2VwaWE6ICA7XG4gIC0tdHctZHJvcC1zaGFkb3c6ICA7XG4gIC0tdHctYmFja2Ryb3AtYmx1cjogIDtcbiAgLS10dy1iYWNrZHJvcC1icmlnaHRuZXNzOiAgO1xuICAtLXR3LWJhY2tkcm9wLWNvbnRyYXN0OiAgO1xuICAtLXR3LWJhY2tkcm9wLWdyYXlzY2FsZTogIDtcbiAgLS10dy1iYWNrZHJvcC1odWUtcm90YXRlOiAgO1xuICAtLXR3LWJhY2tkcm9wLWludmVydDogIDtcbiAgLS10dy1iYWNrZHJvcC1vcGFjaXR5OiAgO1xuICAtLXR3LWJhY2tkcm9wLXNhdHVyYXRlOiAgO1xuICAtLXR3LWJhY2tkcm9wLXNlcGlhOiAgO1xufVxuLmNvbnRhaW5lciB7XG4gIHdpZHRoOiAxMDAlO1xufVxuQG1lZGlhIChtaW4td2lkdGg6IDY0MHB4KSB7XG5cbiAgLmNvbnRhaW5lciB7XG4gICAgbWF4LXdpZHRoOiA2NDBweDtcbiAgfVxufVxuQG1lZGlhIChtaW4td2lkdGg6IDc2OHB4KSB7XG5cbiAgLmNvbnRhaW5lciB7XG4gICAgbWF4LXdpZHRoOiA3NjhweDtcbiAgfVxufVxuQG1lZGlhIChtaW4td2lkdGg6IDEwMjRweCkge1xuXG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogMTAyNHB4O1xuICB9XG59XG5AbWVkaWEgKG1pbi13aWR0aDogMTI4MHB4KSB7XG5cbiAgLmNvbnRhaW5lciB7XG4gICAgbWF4LXdpZHRoOiAxMjgwcHg7XG4gIH1cbn1cbkBtZWRpYSAobWluLXdpZHRoOiAxNTM2cHgpIHtcblxuICAuY29udGFpbmVyIHtcbiAgICBtYXgtd2lkdGg6IDE1MzZweDtcbiAgfVxufVxuLnBvaW50ZXItZXZlbnRzLW5vbmUge1xuICBwb2ludGVyLWV2ZW50czogbm9uZTtcbn1cbi52aXNpYmxlIHtcbiAgdmlzaWJpbGl0eTogdmlzaWJsZTtcbn1cbi5jb2xsYXBzZSB7XG4gIHZpc2liaWxpdHk6IGNvbGxhcHNlO1xufVxuLmZpeGVkIHtcbiAgcG9zaXRpb246IGZpeGVkO1xufVxuLmFic29sdXRlIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xufVxuLnJlbGF0aXZlIHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xufVxuLmluc2V0LTAge1xuICBpbnNldDogMHB4O1xufVxuLmxlZnQtMCB7XG4gIGxlZnQ6IDBweDtcbn1cbi5yaWdodC0wIHtcbiAgcmlnaHQ6IDBweDtcbn1cbi50b3AtMCB7XG4gIHRvcDogMHB4O1xufVxuLnotMCB7XG4gIHotaW5kZXg6IDA7XG59XG4uei0xMCB7XG4gIHotaW5kZXg6IDEwO1xufVxuLnotNTAge1xuICB6LWluZGV4OiA1MDtcbn1cbi5tLTUge1xuICBtYXJnaW46IDEuMjVyZW07XG59XG4ubS04IHtcbiAgbWFyZ2luOiAycmVtO1xufVxuLm1sLTEwIHtcbiAgbWFyZ2luLWxlZnQ6IDIuNXJlbTtcbn1cbi5tbC04IHtcbiAgbWFyZ2luLWxlZnQ6IDJyZW07XG59XG4ubXQtNCB7XG4gIG1hcmdpbi10b3A6IDFyZW07XG59XG4uYmxvY2sge1xuICBkaXNwbGF5OiBibG9jaztcbn1cbi5mbGV4IHtcbiAgZGlzcGxheTogZmxleDtcbn1cbi50YWJsZSB7XG4gIGRpc3BsYXk6IHRhYmxlO1xufVxuLmdyaWQge1xuICBkaXNwbGF5OiBncmlkO1xufVxuLmNvbnRlbnRzIHtcbiAgZGlzcGxheTogY29udGVudHM7XG59XG4uaGlkZGVuIHtcbiAgZGlzcGxheTogbm9uZTtcbn1cbi5oLTEge1xuICBoZWlnaHQ6IDAuMjVyZW07XG59XG4uaC0xXFxcXC81IHtcbiAgaGVpZ2h0OiAyMCU7XG59XG4uaC00IHtcbiAgaGVpZ2h0OiAxcmVtO1xufVxuLmgtNFxcXFwvNSB7XG4gIGhlaWdodDogODAlO1xufVxuLmgtNDAge1xuICBoZWlnaHQ6IDEwcmVtO1xufVxuLmgtNiB7XG4gIGhlaWdodDogMS41cmVtO1xufVxuLmgtNjAge1xuICBoZWlnaHQ6IDE1cmVtO1xufVxuLmgtbWF4IHtcbiAgaGVpZ2h0OiAtbW96LW1heC1jb250ZW50O1xuICBoZWlnaHQ6IG1heC1jb250ZW50O1xufVxuLmgtc2NyZWVuIHtcbiAgaGVpZ2h0OiAxMDB2aDtcbn1cbi5taW4taC1zY3JlZW4ge1xuICBtaW4taGVpZ2h0OiAxMDB2aDtcbn1cbi53LTEge1xuICB3aWR0aDogMC4yNXJlbTtcbn1cbi53LTFcXFxcLzIge1xuICB3aWR0aDogNTAlO1xufVxuLnctNCB7XG4gIHdpZHRoOiAxcmVtO1xufVxuLnctNFxcXFwvMTIge1xuICB3aWR0aDogMzMuMzMzMzMzJTtcbn1cbi53LTYge1xuICB3aWR0aDogMS41cmVtO1xufVxuLnctODAge1xuICB3aWR0aDogMjByZW07XG59XG4udy1hdXRvIHtcbiAgd2lkdGg6IGF1dG87XG59XG4udy1mdWxsIHtcbiAgd2lkdGg6IDEwMCU7XG59XG4udy1taW4ge1xuICB3aWR0aDogLW1vei1taW4tY29udGVudDtcbiAgd2lkdGg6IG1pbi1jb250ZW50O1xufVxuLnctc2NyZWVuIHtcbiAgd2lkdGg6IDEwMHZ3O1xufVxuLm1pbi13LTQ0IHtcbiAgbWluLXdpZHRoOiAxMXJlbTtcbn1cbi5taW4tdy1mdWxsIHtcbiAgbWluLXdpZHRoOiAxMDAlO1xufVxuLm1pbi13LW1heCB7XG4gIG1pbi13aWR0aDogLW1vei1tYXgtY29udGVudDtcbiAgbWluLXdpZHRoOiBtYXgtY29udGVudDtcbn1cbi5taW4tdy1taW4ge1xuICBtaW4td2lkdGg6IC1tb3otbWluLWNvbnRlbnQ7XG4gIG1pbi13aWR0aDogbWluLWNvbnRlbnQ7XG59XG4uZmxleC0xIHtcbiAgZmxleDogMSAxIDAlO1xufVxuLmZsZXgtbm9uZSB7XG4gIGZsZXg6IG5vbmU7XG59XG4uZmxleC1ncm93IHtcbiAgZmxleC1ncm93OiAxO1xufVxuLmZsZXgtZ3Jvdy0wIHtcbiAgZmxleC1ncm93OiAwO1xufVxuLmJvcmRlci1jb2xsYXBzZSB7XG4gIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XG59XG4udHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUodmFyKC0tdHctdHJhbnNsYXRlLXgpLCB2YXIoLS10dy10cmFuc2xhdGUteSkpIHJvdGF0ZSh2YXIoLS10dy1yb3RhdGUpKSBza2V3WCh2YXIoLS10dy1za2V3LXgpKSBza2V3WSh2YXIoLS10dy1za2V3LXkpKSBzY2FsZVgodmFyKC0tdHctc2NhbGUteCkpIHNjYWxlWSh2YXIoLS10dy1zY2FsZS15KSk7XG59XG4uY3Vyc29yLWRlZmF1bHQge1xuICBjdXJzb3I6IGRlZmF1bHQ7XG59XG4uY3Vyc29yLWhlbHAge1xuICBjdXJzb3I6IGhlbHA7XG59XG4uY3Vyc29yLXBvaW50ZXIge1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uY3Vyc29yLXRleHQge1xuICBjdXJzb3I6IHRleHQ7XG59XG4ucmVzaXplIHtcbiAgcmVzaXplOiBib3RoO1xufVxuLmF1dG8tcm93cy1taW4ge1xuICBncmlkLWF1dG8tcm93czogbWluLWNvbnRlbnQ7XG59XG4uZ3JpZC1jb2xzLTExIHtcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMTEsIG1pbm1heCgwLCAxZnIpKTtcbn1cbi5mbGV4LXJvdyB7XG4gIGZsZXgtZGlyZWN0aW9uOiByb3c7XG59XG4uZmxleC1jb2wge1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xufVxuLmNvbnRlbnQtY2VudGVyIHtcbiAgYWxpZ24tY29udGVudDogY2VudGVyO1xufVxuLml0ZW1zLWNlbnRlciB7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG4uanVzdGlmeS1zdGFydCB7XG4gIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcbn1cbi5qdXN0aWZ5LWNlbnRlciB7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xufVxuLmp1c3RpZnktYmV0d2VlbiB7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2Vlbjtcbn1cbi5qdXN0aWZ5LWFyb3VuZCB7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYXJvdW5kO1xufVxuLmdhcC0xIHtcbiAgZ2FwOiAwLjI1cmVtO1xufVxuLmdhcC0xMCB7XG4gIGdhcDogMi41cmVtO1xufVxuLmdhcC0yIHtcbiAgZ2FwOiAwLjVyZW07XG59XG4uZ2FwLTYge1xuICBnYXA6IDEuNXJlbTtcbn1cbi5zZWxmLWNlbnRlciB7XG4gIGFsaWduLXNlbGY6IGNlbnRlcjtcbn1cbi5vdmVyZmxvdy1hdXRvIHtcbiAgb3ZlcmZsb3c6IGF1dG87XG59XG4ub3ZlcnNjcm9sbC1ub25lIHtcbiAgb3ZlcnNjcm9sbC1iZWhhdmlvcjogbm9uZTtcbn1cbi5yb3VuZGVkLWZ1bGwge1xuICBib3JkZXItcmFkaXVzOiA5OTk5cHg7XG59XG4ucm91bmRlZC1tZCB7XG4gIGJvcmRlci1yYWRpdXM6IDAuMzc1cmVtO1xufVxuLnJvdW5kZWQteGwge1xuICBib3JkZXItcmFkaXVzOiAwLjc1cmVtO1xufVxuLnJvdW5kZWQtdC1tZCB7XG4gIGJvcmRlci10b3AtbGVmdC1yYWRpdXM6IDAuMzc1cmVtO1xuICBib3JkZXItdG9wLXJpZ2h0LXJhZGl1czogMC4zNzVyZW07XG59XG4ucm91bmRlZC1ibC1tZCB7XG4gIGJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXM6IDAuMzc1cmVtO1xufVxuLnJvdW5kZWQtYnItbWQge1xuICBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czogMC4zNzVyZW07XG59XG4uYm9yZGVyIHtcbiAgYm9yZGVyLXdpZHRoOiAxcHg7XG59XG4uYm9yZGVyLTIge1xuICBib3JkZXItd2lkdGg6IDJweDtcbn1cbi5ib3JkZXItc29saWQge1xuICBib3JkZXItc3R5bGU6IHNvbGlkO1xufVxuLmJvcmRlci1ibHVlLTgwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDMwIDY0IDE3NSAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYm9yZGVyLWdyYXktMjAwIHtcbiAgLS10dy1ib3JkZXItb3BhY2l0eTogMTtcbiAgYm9yZGVyLWNvbG9yOiByZ2IoMjI5IDIzMSAyMzUgLyB2YXIoLS10dy1ib3JkZXItb3BhY2l0eSkpO1xufVxuLmJvcmRlci1ncmF5LTYwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDc1IDg1IDk5IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItZ3JheS04MDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigzMSA0MSA1NSAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYm9yZGVyLWdyZWVuLTYwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDIyIDE2MyA3NCAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYm9yZGVyLW9yYW5nZS00MDAge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigyNTEgMTQ2IDYwIC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cbi5ib3JkZXItcmVkLTcwMCB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDE4NSAyOCAyOCAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG4uYm9yZGVyLXRyYW5zcGFyZW50IHtcbiAgYm9yZGVyLWNvbG9yOiB0cmFuc3BhcmVudDtcbn1cbi5iZy1ncmF5LTEwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDI0MyAyNDQgMjQ2IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWdyYXktMjAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjI5IDIzMSAyMzUgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS0zMDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyMDkgMjEzIDIxOSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1ncmF5LTQwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDE1NiAxNjMgMTc1IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWdyYXktNTAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTA3IDExNCAxMjggLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS02MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYig3NSA4NSA5OSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1ncmF5LTcwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDU1IDY1IDgxIC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWdyYXktODAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMzEgNDEgNTUgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctZ3JheS05MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigxNyAyNCAzOSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1saW1lLTUwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDEzMiAyMDQgMjIgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctbGltZS02MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigxMDEgMTYzIDEzIC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLWxpbWUtNzAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoNzcgMTI0IDE1IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLW9yYW5nZS0zMDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyNTMgMTg2IDExNiAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1vcmFuZ2UtNDAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjUxIDE0NiA2MCAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1vcmFuZ2UtNjAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjM0IDg4IDEyIC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLXJlZC02MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyMjAgMzggMzggLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctcmVkLTcwMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDE4NSAyOCAyOCAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cbi5iZy1yZWQtODAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTUzIDI3IDI3IC8gdmFyKC0tdHctYmctb3BhY2l0eSkpO1xufVxuLmJnLXNreS03MDAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigzIDEwNSAxNjEgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctc2xhdGUtNzAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoNTEgNjUgODUgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctc2xhdGUtODAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMzAgNDEgNTkgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctc2xhdGUtOTAwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTUgMjMgNDIgLyB2YXIoLS10dy1iZy1vcGFjaXR5KSk7XG59XG4uYmctdHJhbnNwYXJlbnQge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbn1cbi5iZy1vcGFjaXR5LTAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDA7XG59XG4uYmctb3BhY2l0eS0xMCB7XG4gIC0tdHctYmctb3BhY2l0eTogMC4xO1xufVxuLmJnLW9wYWNpdHktMjAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDAuMjtcbn1cbi5iZy1vcGFjaXR5LTI1IHtcbiAgLS10dy1iZy1vcGFjaXR5OiAwLjI1O1xufVxuLmJnLW9wYWNpdHktMzAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDAuMztcbn1cbi5iZy1vcGFjaXR5LTQwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAwLjQ7XG59XG4uYmctb3BhY2l0eS01MCB7XG4gIC0tdHctYmctb3BhY2l0eTogMC41O1xufVxuLmJnLW9wYWNpdHktNjAge1xuICAtLXR3LWJnLW9wYWNpdHk6IDAuNjtcbn1cbi5iZy1vcGFjaXR5LTcwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAwLjc7XG59XG4uYmctb3BhY2l0eS03NSB7XG4gIC0tdHctYmctb3BhY2l0eTogMC43NTtcbn1cbi5iZy1vcGFjaXR5LTgwIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAwLjg7XG59XG4uYmctZ3JhZGllbnQtdG8tYmwge1xuICBiYWNrZ3JvdW5kLWltYWdlOiBsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tIGxlZnQsIHZhcigtLXR3LWdyYWRpZW50LXN0b3BzKSk7XG59XG4uYmctZ3JhZGllbnQtdG8tYnIge1xuICBiYWNrZ3JvdW5kLWltYWdlOiBsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tIHJpZ2h0LCB2YXIoLS10dy1ncmFkaWVudC1zdG9wcykpO1xufVxuLmJnLWdyYWRpZW50LXRvLXRyIHtcbiAgYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KHRvIHRvcCByaWdodCwgdmFyKC0tdHctZ3JhZGllbnQtc3RvcHMpKTtcbn1cbi5mcm9tLWdyYXktMzAwIHtcbiAgLS10dy1ncmFkaWVudC1mcm9tOiAjZDFkNWRiIHZhcigtLXR3LWdyYWRpZW50LWZyb20tcG9zaXRpb24pO1xuICAtLXR3LWdyYWRpZW50LXRvOiByZ2IoMjA5IDIxMyAyMTkgLyAwKSB2YXIoLS10dy1ncmFkaWVudC10by1wb3NpdGlvbik7XG4gIC0tdHctZ3JhZGllbnQtc3RvcHM6IHZhcigtLXR3LWdyYWRpZW50LWZyb20pLCB2YXIoLS10dy1ncmFkaWVudC10byk7XG59XG4uZnJvbS1ncmF5LTQwMCB7XG4gIC0tdHctZ3JhZGllbnQtZnJvbTogIzljYTNhZiB2YXIoLS10dy1ncmFkaWVudC1mcm9tLXBvc2l0aW9uKTtcbiAgLS10dy1ncmFkaWVudC10bzogcmdiKDE1NiAxNjMgMTc1IC8gMCkgdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xuICAtLXR3LWdyYWRpZW50LXN0b3BzOiB2YXIoLS10dy1ncmFkaWVudC1mcm9tKSwgdmFyKC0tdHctZ3JhZGllbnQtdG8pO1xufVxuLmZyb20tc2xhdGUtMjAwIHtcbiAgLS10dy1ncmFkaWVudC1mcm9tOiAjZTJlOGYwIHZhcigtLXR3LWdyYWRpZW50LWZyb20tcG9zaXRpb24pO1xuICAtLXR3LWdyYWRpZW50LXRvOiByZ2IoMjI2IDIzMiAyNDAgLyAwKSB2YXIoLS10dy1ncmFkaWVudC10by1wb3NpdGlvbik7XG4gIC0tdHctZ3JhZGllbnQtc3RvcHM6IHZhcigtLXR3LWdyYWRpZW50LWZyb20pLCB2YXIoLS10dy1ncmFkaWVudC10byk7XG59XG4uZnJvbS1zbGF0ZS00MDAge1xuICAtLXR3LWdyYWRpZW50LWZyb206ICM5NGEzYjggdmFyKC0tdHctZ3JhZGllbnQtZnJvbS1wb3NpdGlvbik7XG4gIC0tdHctZ3JhZGllbnQtdG86IHJnYigxNDggMTYzIDE4NCAvIDApIHZhcigtLXR3LWdyYWRpZW50LXRvLXBvc2l0aW9uKTtcbiAgLS10dy1ncmFkaWVudC1zdG9wczogdmFyKC0tdHctZ3JhZGllbnQtZnJvbSksIHZhcigtLXR3LWdyYWRpZW50LXRvKTtcbn1cbi5mcm9tLXNsYXRlLTUwMCB7XG4gIC0tdHctZ3JhZGllbnQtZnJvbTogIzY0NzQ4YiB2YXIoLS10dy1ncmFkaWVudC1mcm9tLXBvc2l0aW9uKTtcbiAgLS10dy1ncmFkaWVudC10bzogcmdiKDEwMCAxMTYgMTM5IC8gMCkgdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xuICAtLXR3LWdyYWRpZW50LXN0b3BzOiB2YXIoLS10dy1ncmFkaWVudC1mcm9tKSwgdmFyKC0tdHctZ3JhZGllbnQtdG8pO1xufVxuLmZyb20tc2xhdGUtNzAwIHtcbiAgLS10dy1ncmFkaWVudC1mcm9tOiAjMzM0MTU1IHZhcigtLXR3LWdyYWRpZW50LWZyb20tcG9zaXRpb24pO1xuICAtLXR3LWdyYWRpZW50LXRvOiByZ2IoNTEgNjUgODUgLyAwKSB2YXIoLS10dy1ncmFkaWVudC10by1wb3NpdGlvbik7XG4gIC0tdHctZ3JhZGllbnQtc3RvcHM6IHZhcigtLXR3LWdyYWRpZW50LWZyb20pLCB2YXIoLS10dy1ncmFkaWVudC10byk7XG59XG4udG8tZ3JheS0xMDAge1xuICAtLXR3LWdyYWRpZW50LXRvOiAjZjNmNGY2IHZhcigtLXR3LWdyYWRpZW50LXRvLXBvc2l0aW9uKTtcbn1cbi50by1ncmF5LTIwMCB7XG4gIC0tdHctZ3JhZGllbnQtdG86ICNlNWU3ZWIgdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xufVxuLnRvLXNsYXRlLTIwMCB7XG4gIC0tdHctZ3JhZGllbnQtdG86ICNlMmU4ZjAgdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xufVxuLnRvLXNsYXRlLTQwMCB7XG4gIC0tdHctZ3JhZGllbnQtdG86ICM5NGEzYjggdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xufVxuLnRvLXNsYXRlLTUwMCB7XG4gIC0tdHctZ3JhZGllbnQtdG86ICM2NDc0OGIgdmFyKC0tdHctZ3JhZGllbnQtdG8tcG9zaXRpb24pO1xufVxuLnAtMSB7XG4gIHBhZGRpbmc6IDAuMjVyZW07XG59XG4ucC0xMCB7XG4gIHBhZGRpbmc6IDIuNXJlbTtcbn1cbi5wLTIge1xuICBwYWRkaW5nOiAwLjVyZW07XG59XG4ucC00IHtcbiAgcGFkZGluZzogMXJlbTtcbn1cbi5wLTYge1xuICBwYWRkaW5nOiAxLjVyZW07XG59XG4ucHgtMyB7XG4gIHBhZGRpbmctbGVmdDogMC43NXJlbTtcbiAgcGFkZGluZy1yaWdodDogMC43NXJlbTtcbn1cbi5weC00IHtcbiAgcGFkZGluZy1sZWZ0OiAxcmVtO1xuICBwYWRkaW5nLXJpZ2h0OiAxcmVtO1xufVxuLnB4LTYge1xuICBwYWRkaW5nLWxlZnQ6IDEuNXJlbTtcbiAgcGFkZGluZy1yaWdodDogMS41cmVtO1xufVxuLnB5LTEge1xuICBwYWRkaW5nLXRvcDogMC4yNXJlbTtcbiAgcGFkZGluZy1ib3R0b206IDAuMjVyZW07XG59XG4ucHktMiB7XG4gIHBhZGRpbmctdG9wOiAwLjVyZW07XG4gIHBhZGRpbmctYm90dG9tOiAwLjVyZW07XG59XG4ucHktNCB7XG4gIHBhZGRpbmctdG9wOiAxcmVtO1xuICBwYWRkaW5nLWJvdHRvbTogMXJlbTtcbn1cbi5wbC0yIHtcbiAgcGFkZGluZy1sZWZ0OiAwLjVyZW07XG59XG4ucGwtMyB7XG4gIHBhZGRpbmctbGVmdDogMC43NXJlbTtcbn1cbi5wbC01IHtcbiAgcGFkZGluZy1sZWZ0OiAxLjI1cmVtO1xufVxuLnBsLTgge1xuICBwYWRkaW5nLWxlZnQ6IDJyZW07XG59XG4udGV4dC1jZW50ZXIge1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG59XG4uZm9udC1tb25vIHtcbiAgZm9udC1mYW1pbHk6IHVpLW1vbm9zcGFjZSwgU0ZNb25vLVJlZ3VsYXIsIE1lbmxvLCBNb25hY28sIENvbnNvbGFzLCBcIkxpYmVyYXRpb24gTW9ub1wiLCBcIkNvdXJpZXIgTmV3XCIsIG1vbm9zcGFjZTtcbn1cbi50ZXh0LTJ4bCB7XG4gIGZvbnQtc2l6ZTogMS41cmVtO1xuICBsaW5lLWhlaWdodDogMnJlbTtcbn1cbi50ZXh0LTN4bCB7XG4gIGZvbnQtc2l6ZTogMS44NzVyZW07XG4gIGxpbmUtaGVpZ2h0OiAyLjI1cmVtO1xufVxuLnRleHQtbGcge1xuICBmb250LXNpemU6IDEuMTI1cmVtO1xuICBsaW5lLWhlaWdodDogMS43NXJlbTtcbn1cbi50ZXh0LXNtIHtcbiAgZm9udC1zaXplOiAwLjg3NXJlbTtcbiAgbGluZS1oZWlnaHQ6IDEuMjVyZW07XG59XG4uZm9udC1ibGFjayB7XG4gIGZvbnQtd2VpZ2h0OiA5MDA7XG59XG4uZm9udC1ib2xkIHtcbiAgZm9udC13ZWlnaHQ6IDcwMDtcbn1cbi5mb250LXNlbWlib2xkIHtcbiAgZm9udC13ZWlnaHQ6IDYwMDtcbn1cbi50cmFja2luZy13aWRlIHtcbiAgbGV0dGVyLXNwYWNpbmc6IDAuMDI1ZW07XG59XG4udHJhY2tpbmctd2lkZXIge1xuICBsZXR0ZXItc3BhY2luZzogMC4wNWVtO1xufVxuLnRyYWNraW5nLXdpZGVzdCB7XG4gIGxldHRlci1zcGFjaW5nOiAwLjFlbTtcbn1cbi50ZXh0LWdyYXktMTAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMjQzIDI0NCAyNDYgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LWdyYXktMjAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMjI5IDIzMSAyMzUgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LWdyYXktNjAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoNzUgODUgOTkgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LWdyYXktNzAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoNTUgNjUgODEgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LWdyYXktODAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMzEgNDEgNTUgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LWxpbWUtNjAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTAxIDE2MyAxMyAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtbGltZS03MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYig3NyAxMjQgMTUgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LWxpbWUtODAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoNjMgOTggMTggLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LW9yYW5nZS01MDAge1xuICAtLXR3LXRleHQtb3BhY2l0eTogMTtcbiAgY29sb3I6IHJnYigyNDkgMTE1IDIyIC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1vcmFuZ2UtNjAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMjM0IDg4IDEyIC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1vcmFuZ2UtODAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTU0IDUyIDE4IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1yZWQtNTAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMjM5IDY4IDY4IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1yZWQtNzAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTg1IDI4IDI4IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1yZWQtODAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTUzIDI3IDI3IC8gdmFyKC0tdHctdGV4dC1vcGFjaXR5KSk7XG59XG4udGV4dC1yb3NlLTcwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDE5MCAxOCA2MCAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtc2t5LTYwMCB7XG4gIC0tdHctdGV4dC1vcGFjaXR5OiAxO1xuICBjb2xvcjogcmdiKDIgMTMyIDE5OSAvIHZhcigtLXR3LXRleHQtb3BhY2l0eSkpO1xufVxuLnRleHQtc2xhdGUtNzAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoNTEgNjUgODUgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi50ZXh0LXRlYWwtOTAwIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMTkgNzggNzQgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cbi51bmRlcmxpbmUge1xuICB0ZXh0LWRlY29yYXRpb24tbGluZTogdW5kZXJsaW5lO1xufVxuLm9wYWNpdHktMTAwIHtcbiAgb3BhY2l0eTogMTtcbn1cbi5zaGFkb3ctbGcge1xuICAtLXR3LXNoYWRvdzogMCAxMHB4IDE1cHggLTNweCByZ2IoMCAwIDAgLyAwLjEpLCAwIDRweCA2cHggLTRweCByZ2IoMCAwIDAgLyAwLjEpO1xuICAtLXR3LXNoYWRvdy1jb2xvcmVkOiAwIDEwcHggMTVweCAtM3B4IHZhcigtLXR3LXNoYWRvdy1jb2xvciksIDAgNHB4IDZweCAtNHB4IHZhcigtLXR3LXNoYWRvdy1jb2xvcik7XG4gIGJveC1zaGFkb3c6IHZhcigtLXR3LXJpbmctb2Zmc2V0LXNoYWRvdywgMCAwICMwMDAwKSwgdmFyKC0tdHctcmluZy1zaGFkb3csIDAgMCAjMDAwMCksIHZhcigtLXR3LXNoYWRvdyk7XG59XG4uc2hhZG93LXNtIHtcbiAgLS10dy1zaGFkb3c6IDAgMXB4IDJweCAwIHJnYigwIDAgMCAvIDAuMDUpO1xuICAtLXR3LXNoYWRvdy1jb2xvcmVkOiAwIDFweCAycHggMCB2YXIoLS10dy1zaGFkb3ctY29sb3IpO1xuICBib3gtc2hhZG93OiB2YXIoLS10dy1yaW5nLW9mZnNldC1zaGFkb3csIDAgMCAjMDAwMCksIHZhcigtLXR3LXJpbmctc2hhZG93LCAwIDAgIzAwMDApLCB2YXIoLS10dy1zaGFkb3cpO1xufVxuLm91dGxpbmUtbm9uZSB7XG4gIG91dGxpbmU6IDJweCBzb2xpZCB0cmFuc3BhcmVudDtcbiAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbn1cbi5vdXRsaW5lIHtcbiAgb3V0bGluZS1zdHlsZTogc29saWQ7XG59XG4uYmx1ciB7XG4gIC0tdHctYmx1cjogYmx1cig4cHgpO1xuICBmaWx0ZXI6IHZhcigtLXR3LWJsdXIpIHZhcigtLXR3LWJyaWdodG5lc3MpIHZhcigtLXR3LWNvbnRyYXN0KSB2YXIoLS10dy1ncmF5c2NhbGUpIHZhcigtLXR3LWh1ZS1yb3RhdGUpIHZhcigtLXR3LWludmVydCkgdmFyKC0tdHctc2F0dXJhdGUpIHZhcigtLXR3LXNlcGlhKSB2YXIoLS10dy1kcm9wLXNoYWRvdyk7XG59XG4uYmx1ci1zbSB7XG4gIC0tdHctYmx1cjogYmx1cig0cHgpO1xuICBmaWx0ZXI6IHZhcigtLXR3LWJsdXIpIHZhcigtLXR3LWJyaWdodG5lc3MpIHZhcigtLXR3LWNvbnRyYXN0KSB2YXIoLS10dy1ncmF5c2NhbGUpIHZhcigtLXR3LWh1ZS1yb3RhdGUpIHZhcigtLXR3LWludmVydCkgdmFyKC0tdHctc2F0dXJhdGUpIHZhcigtLXR3LXNlcGlhKSB2YXIoLS10dy1kcm9wLXNoYWRvdyk7XG59XG4uZmlsdGVyIHtcbiAgZmlsdGVyOiB2YXIoLS10dy1ibHVyKSB2YXIoLS10dy1icmlnaHRuZXNzKSB2YXIoLS10dy1jb250cmFzdCkgdmFyKC0tdHctZ3JheXNjYWxlKSB2YXIoLS10dy1odWUtcm90YXRlKSB2YXIoLS10dy1pbnZlcnQpIHZhcigtLXR3LXNhdHVyYXRlKSB2YXIoLS10dy1zZXBpYSkgdmFyKC0tdHctZHJvcC1zaGFkb3cpO1xufVxuLmJhY2tkcm9wLWJsdXItbWQge1xuICAtLXR3LWJhY2tkcm9wLWJsdXI6IGJsdXIoMTJweCk7XG4gIC13ZWJraXQtYmFja2Ryb3AtZmlsdGVyOiB2YXIoLS10dy1iYWNrZHJvcC1ibHVyKSB2YXIoLS10dy1iYWNrZHJvcC1icmlnaHRuZXNzKSB2YXIoLS10dy1iYWNrZHJvcC1jb250cmFzdCkgdmFyKC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlKSB2YXIoLS10dy1iYWNrZHJvcC1odWUtcm90YXRlKSB2YXIoLS10dy1iYWNrZHJvcC1pbnZlcnQpIHZhcigtLXR3LWJhY2tkcm9wLW9wYWNpdHkpIHZhcigtLXR3LWJhY2tkcm9wLXNhdHVyYXRlKSB2YXIoLS10dy1iYWNrZHJvcC1zZXBpYSk7XG4gICAgICAgICAgYmFja2Ryb3AtZmlsdGVyOiB2YXIoLS10dy1iYWNrZHJvcC1ibHVyKSB2YXIoLS10dy1iYWNrZHJvcC1icmlnaHRuZXNzKSB2YXIoLS10dy1iYWNrZHJvcC1jb250cmFzdCkgdmFyKC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlKSB2YXIoLS10dy1iYWNrZHJvcC1odWUtcm90YXRlKSB2YXIoLS10dy1iYWNrZHJvcC1pbnZlcnQpIHZhcigtLXR3LWJhY2tkcm9wLW9wYWNpdHkpIHZhcigtLXR3LWJhY2tkcm9wLXNhdHVyYXRlKSB2YXIoLS10dy1iYWNrZHJvcC1zZXBpYSk7XG59XG4uYmFja2Ryb3AtYmx1ci1zbSB7XG4gIC0tdHctYmFja2Ryb3AtYmx1cjogYmx1cig0cHgpO1xuICAtd2Via2l0LWJhY2tkcm9wLWZpbHRlcjogdmFyKC0tdHctYmFja2Ryb3AtYmx1cikgdmFyKC0tdHctYmFja2Ryb3AtYnJpZ2h0bmVzcykgdmFyKC0tdHctYmFja2Ryb3AtY29udHJhc3QpIHZhcigtLXR3LWJhY2tkcm9wLWdyYXlzY2FsZSkgdmFyKC0tdHctYmFja2Ryb3AtaHVlLXJvdGF0ZSkgdmFyKC0tdHctYmFja2Ryb3AtaW52ZXJ0KSB2YXIoLS10dy1iYWNrZHJvcC1vcGFjaXR5KSB2YXIoLS10dy1iYWNrZHJvcC1zYXR1cmF0ZSkgdmFyKC0tdHctYmFja2Ryb3Atc2VwaWEpO1xuICAgICAgICAgIGJhY2tkcm9wLWZpbHRlcjogdmFyKC0tdHctYmFja2Ryb3AtYmx1cikgdmFyKC0tdHctYmFja2Ryb3AtYnJpZ2h0bmVzcykgdmFyKC0tdHctYmFja2Ryb3AtY29udHJhc3QpIHZhcigtLXR3LWJhY2tkcm9wLWdyYXlzY2FsZSkgdmFyKC0tdHctYmFja2Ryb3AtaHVlLXJvdGF0ZSkgdmFyKC0tdHctYmFja2Ryb3AtaW52ZXJ0KSB2YXIoLS10dy1iYWNrZHJvcC1vcGFjaXR5KSB2YXIoLS10dy1iYWNrZHJvcC1zYXR1cmF0ZSkgdmFyKC0tdHctYmFja2Ryb3Atc2VwaWEpO1xufVxuLmJhY2tkcm9wLWZpbHRlciB7XG4gIC13ZWJraXQtYmFja2Ryb3AtZmlsdGVyOiB2YXIoLS10dy1iYWNrZHJvcC1ibHVyKSB2YXIoLS10dy1iYWNrZHJvcC1icmlnaHRuZXNzKSB2YXIoLS10dy1iYWNrZHJvcC1jb250cmFzdCkgdmFyKC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlKSB2YXIoLS10dy1iYWNrZHJvcC1odWUtcm90YXRlKSB2YXIoLS10dy1iYWNrZHJvcC1pbnZlcnQpIHZhcigtLXR3LWJhY2tkcm9wLW9wYWNpdHkpIHZhcigtLXR3LWJhY2tkcm9wLXNhdHVyYXRlKSB2YXIoLS10dy1iYWNrZHJvcC1zZXBpYSk7XG4gICAgICAgICAgYmFja2Ryb3AtZmlsdGVyOiB2YXIoLS10dy1iYWNrZHJvcC1ibHVyKSB2YXIoLS10dy1iYWNrZHJvcC1icmlnaHRuZXNzKSB2YXIoLS10dy1iYWNrZHJvcC1jb250cmFzdCkgdmFyKC0tdHctYmFja2Ryb3AtZ3JheXNjYWxlKSB2YXIoLS10dy1iYWNrZHJvcC1odWUtcm90YXRlKSB2YXIoLS10dy1iYWNrZHJvcC1pbnZlcnQpIHZhcigtLXR3LWJhY2tkcm9wLW9wYWNpdHkpIHZhcigtLXR3LWJhY2tkcm9wLXNhdHVyYXRlKSB2YXIoLS10dy1iYWNrZHJvcC1zZXBpYSk7XG59XG5cbi5uYW51bS1nb3RoaWMtY29kaW5nLXJlZ3VsYXIge1xuICBmb250LWZhbWlseTogXCJOYW51bSBHb3RoaWMgQ29kaW5nXCIsIG1vbm9zcGFjZTtcbiAgZm9udC13ZWlnaHQ6IDQwMDtcbiAgZm9udC1zdHlsZTogbm9ybWFsO1xufVxuXG4ubmFudW0tZ290aGljLWNvZGluZy1ib2xkIHtcbiAgZm9udC1mYW1pbHk6IFwiTmFudW0gR290aGljIENvZGluZ1wiLCBtb25vc3BhY2U7XG4gIGZvbnQtd2VpZ2h0OiA3MDA7XG4gIGZvbnQtc3R5bGU6IG5vcm1hbDtcbn1cblxuLmhvdmVyXFxcXDpib3JkZXItZ3JheS04MDA6aG92ZXIge1xuICAtLXR3LWJvcmRlci1vcGFjaXR5OiAxO1xuICBib3JkZXItY29sb3I6IHJnYigzMSA0MSA1NSAvIHZhcigtLXR3LWJvcmRlci1vcGFjaXR5KSk7XG59XG5cbi5ob3ZlclxcXFw6YmctZ3JheS0yMDA6aG92ZXIge1xuICAtLXR3LWJnLW9wYWNpdHk6IDE7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyMjkgMjMxIDIzNSAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cblxuLmhvdmVyXFxcXDpiZy1vcmFuZ2UtNTAwOmhvdmVyIHtcbiAgLS10dy1iZy1vcGFjaXR5OiAxO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjQ5IDExNSAyMiAvIHZhcigtLXR3LWJnLW9wYWNpdHkpKTtcbn1cblxuLmhvdmVyXFxcXDp0ZXh0LWdyYXktODAwOmhvdmVyIHtcbiAgLS10dy10ZXh0LW9wYWNpdHk6IDE7XG4gIGNvbG9yOiByZ2IoMzEgNDEgNTUgLyB2YXIoLS10dy10ZXh0LW9wYWNpdHkpKTtcbn1cblxuLmZvY3VzXFxcXDpib3JkZXItMjpmb2N1cyB7XG4gIGJvcmRlci13aWR0aDogMnB4O1xufVxuXG4uZm9jdXNcXFxcOmJvcmRlci1ncmF5LTIwMDpmb2N1cyB7XG4gIC0tdHctYm9yZGVyLW9wYWNpdHk6IDE7XG4gIGJvcmRlci1jb2xvcjogcmdiKDIyOSAyMzEgMjM1IC8gdmFyKC0tdHctYm9yZGVyLW9wYWNpdHkpKTtcbn1cblxuLmZvY3VzXFxcXDpyaW5nLTA6Zm9jdXMge1xuICAtLXR3LXJpbmctb2Zmc2V0LXNoYWRvdzogdmFyKC0tdHctcmluZy1pbnNldCkgMCAwIDAgdmFyKC0tdHctcmluZy1vZmZzZXQtd2lkdGgpIHZhcigtLXR3LXJpbmctb2Zmc2V0LWNvbG9yKTtcbiAgLS10dy1yaW5nLXNoYWRvdzogdmFyKC0tdHctcmluZy1pbnNldCkgMCAwIDAgY2FsYygwcHggKyB2YXIoLS10dy1yaW5nLW9mZnNldC13aWR0aCkpIHZhcigtLXR3LXJpbmctY29sb3IpO1xuICBib3gtc2hhZG93OiB2YXIoLS10dy1yaW5nLW9mZnNldC1zaGFkb3cpLCB2YXIoLS10dy1yaW5nLXNoYWRvdyksIHZhcigtLXR3LXNoYWRvdywgMCAwICMwMDAwKTtcbn1cbmAsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL3N0eWxlcy5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUE7O0NBQWMsQ0FBZDs7O0NBQWM7O0FBQWQ7OztFQUFBLHNCQUFjLEVBQWQsTUFBYztFQUFkLGVBQWMsRUFBZCxNQUFjO0VBQWQsbUJBQWMsRUFBZCxNQUFjO0VBQWQscUJBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7O0VBQUEsZ0JBQWM7QUFBQTs7QUFBZDs7Ozs7Ozs7Q0FBYzs7QUFBZDs7RUFBQSxnQkFBYyxFQUFkLE1BQWM7RUFBZCw4QkFBYyxFQUFkLE1BQWM7RUFBZCxnQkFBYyxFQUFkLE1BQWM7RUFBZCxjQUFjO0tBQWQsV0FBYyxFQUFkLE1BQWM7RUFBZCwrSEFBYyxFQUFkLE1BQWM7RUFBZCw2QkFBYyxFQUFkLE1BQWM7RUFBZCwrQkFBYyxFQUFkLE1BQWM7RUFBZCx3Q0FBYyxFQUFkLE1BQWM7QUFBQTs7QUFBZDs7O0NBQWM7O0FBQWQ7RUFBQSxTQUFjLEVBQWQsTUFBYztFQUFkLG9CQUFjLEVBQWQsTUFBYztBQUFBOztBQUFkOzs7O0NBQWM7O0FBQWQ7RUFBQSxTQUFjLEVBQWQsTUFBYztFQUFkLGNBQWMsRUFBZCxNQUFjO0VBQWQscUJBQWMsRUFBZCxNQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7RUFBQSx5Q0FBYztVQUFkLGlDQUFjO0FBQUE7O0FBQWQ7O0NBQWM7O0FBQWQ7Ozs7OztFQUFBLGtCQUFjO0VBQWQsb0JBQWM7QUFBQTs7QUFBZDs7Q0FBYzs7QUFBZDtFQUFBLGNBQWM7RUFBZCx3QkFBYztBQUFBOztBQUFkOztDQUFjOztBQUFkOztFQUFBLG1CQUFjO0FBQUE7O0FBQWQ7Ozs7O0NBQWM7O0FBQWQ7Ozs7RUFBQSwrR0FBYyxFQUFkLE1BQWM7RUFBZCw2QkFBYyxFQUFkLE1BQWM7RUFBZCwrQkFBYyxFQUFkLE1BQWM7RUFBZCxjQUFjLEVBQWQsTUFBYztB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QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsd0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSx1QkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSwyQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSwyQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLGdDQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSxzQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxzQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxzQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxzQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxzQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxzQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxzQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLGtCQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLDREQUFtQjtFQUFuQixxRUFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSw0REFBbUI7RUFBbkIscUVBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsNERBQW1CO0VBQW5CLHFFQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBLDREQUFtQjtFQUFuQixxRUFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSw0REFBbUI7RUFBbkIscUVBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsNERBQW1CO0VBQW5CLGtFQUFtQjtFQUFuQjtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEscUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsa0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsbUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsaUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsaUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsbUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsbUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsbUJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsb0JBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLCtFQUFtQjtFQUFuQixtR0FBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSwwQ0FBbUI7RUFBbkIsdURBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsOEJBQW1CO0VBQW5CO0FBQW1CO0FBQW5CO0VBQUE7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQSxvQkFBbUI7RUFBbkI7QUFBbUI7QUFBbkI7RUFBQTtBQUFtQjtBQUFuQjtFQUFBLDhCQUFtQjtFQUFuQiwrUUFBbUI7VUFBbkI7QUFBbUI7QUFBbkI7RUFBQSw2QkFBbUI7RUFBbkIsK1FBQW1CO1VBQW5CO0FBQW1CO0FBQW5CO0VBQUEsK1FBQW1CO1VBQW5CO0FBQW1COztBQUVuQjtFQUNFLDZDQUE2QztFQUM3QyxnQkFBZ0I7RUFDaEIsa0JBQWtCO0FBQ3BCOztBQUVBO0VBQ0UsNkNBQTZDO0VBQzdDLGdCQUFnQjtFQUNoQixrQkFBa0I7QUFDcEI7O0FBZEE7RUFBQSxzQkFlQTtFQWZBO0FBZUE7O0FBZkE7RUFBQSxrQkFlQTtFQWZBO0FBZUE7O0FBZkE7RUFBQSxrQkFlQTtFQWZBO0FBZUE7O0FBZkE7RUFBQSxvQkFlQTtFQWZBO0FBZUE7O0FBZkE7RUFBQTtBQWVBOztBQWZBO0VBQUEsc0JBZUE7RUFmQTtBQWVBOztBQWZBO0VBQUEsMkdBZUE7RUFmQSx5R0FlQTtFQWZBO0FBZUFcIixcInNvdXJjZXNDb250ZW50XCI6W1wiQHRhaWx3aW5kIGJhc2U7XFxuQHRhaWx3aW5kIGNvbXBvbmVudHM7XFxuQHRhaWx3aW5kIHV0aWxpdGllcztcXG5cXG4ubmFudW0tZ290aGljLWNvZGluZy1yZWd1bGFyIHtcXG4gIGZvbnQtZmFtaWx5OiBcXFwiTmFudW0gR290aGljIENvZGluZ1xcXCIsIG1vbm9zcGFjZTtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICBmb250LXN0eWxlOiBub3JtYWw7XFxufVxcblxcbi5uYW51bS1nb3RoaWMtY29kaW5nLWJvbGQge1xcbiAgZm9udC1mYW1pbHk6IFxcXCJOYW51bSBHb3RoaWMgQ29kaW5nXFxcIiwgbW9ub3NwYWNlO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gIGZvbnQtc3R5bGU6IG5vcm1hbDtcXG59XFxuXCJdLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICBBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzV2l0aE1hcHBpbmdUb1N0cmluZykge1xuICB2YXIgbGlzdCA9IFtdO1xuXG4gIC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcbiAgbGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIGNvbnRlbnQgPSBcIlwiO1xuICAgICAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBpdGVtWzVdICE9PSBcInVuZGVmaW5lZFwiO1xuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpO1xuICAgICAgfVxuICAgICAgY29udGVudCArPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pO1xuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKFwiXCIpO1xuICB9O1xuXG4gIC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG4gIGxpc3QuaSA9IGZ1bmN0aW9uIGkobW9kdWxlcywgbWVkaWEsIGRlZHVwZSwgc3VwcG9ydHMsIGxheWVyKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGVzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCB1bmRlZmluZWRdXTtcbiAgICB9XG4gICAgdmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHRoaXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdmFyIGlkID0gdGhpc1trXVswXTtcbiAgICAgICAgaWYgKGlkICE9IG51bGwpIHtcbiAgICAgICAgICBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgX2sgPSAwOyBfayA8IG1vZHVsZXMubGVuZ3RoOyBfaysrKSB7XG4gICAgICB2YXIgaXRlbSA9IFtdLmNvbmNhdChtb2R1bGVzW19rXSk7XG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGxheWVyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbVs1XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG1lZGlhKSB7XG4gICAgICAgIGlmICghaXRlbVsyXSkge1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzdXBwb3J0cykge1xuICAgICAgICBpZiAoIWl0ZW1bNF0pIHtcbiAgICAgICAgICBpdGVtWzRdID0gXCJcIi5jb25jYXQoc3VwcG9ydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs0XSA9IHN1cHBvcnRzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsaXN0LnB1c2goaXRlbSk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gbGlzdDtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgdmFyIGNvbnRlbnQgPSBpdGVtWzFdO1xuICB2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG4gIGlmICghY3NzTWFwcGluZykge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG4gIGlmICh0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KGNzc01hcHBpbmcpKSkpO1xuICAgIHZhciBkYXRhID0gXCJzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxcIi5jb25jYXQoYmFzZTY0KTtcbiAgICB2YXIgc291cmNlTWFwcGluZyA9IFwiLyojIFwiLmNvbmNhdChkYXRhLCBcIiAqL1wiKTtcbiAgICByZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oXCJcXG5cIik7XG4gIH1cbiAgcmV0dXJuIFtjb250ZW50XS5qb2luKFwiXFxuXCIpO1xufTsiLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydEZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanNcIjtcbiAgICAgIGltcG9ydCBzdHlsZVRhZ1RyYW5zZm9ybUZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4uL25vZGVfbW9kdWxlcy9wb3N0Y3NzLWxvYWRlci9kaXN0L2Nqcy5qcz8/cnVsZVNldFsxXS5ydWxlc1sxXS51c2VbMl0hLi9zdHlsZXMuY3NzXCI7XG4gICAgICBcbiAgICAgIFxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtID0gc3R5bGVUYWdUcmFuc2Zvcm1Gbjtcbm9wdGlvbnMuc2V0QXR0cmlidXRlcyA9IHNldEF0dHJpYnV0ZXM7XG5cbiAgICAgIG9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG4gICAgXG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi4vbm9kZV9tb2R1bGVzL3Bvc3Rjc3MtbG9hZGVyL2Rpc3QvY2pzLmpzPz9ydWxlU2V0WzFdLnJ1bGVzWzFdLnVzZVsyXSEuL3N0eWxlcy5jc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXNJbkRPTS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzdHlsZXNJbkRPTVtpXS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICByZXN1bHQgPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldO1xuICAgIHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuICAgIHZhciBjb3VudCA9IGlkQ291bnRNYXBbaWRdIHx8IDA7XG4gICAgdmFyIGlkZW50aWZpZXIgPSBcIlwiLmNvbmNhdChpZCwgXCIgXCIpLmNvbmNhdChjb3VudCk7XG4gICAgaWRDb3VudE1hcFtpZF0gPSBjb3VudCArIDE7XG4gICAgdmFyIGluZGV4QnlJZGVudGlmaWVyID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIGNzczogaXRlbVsxXSxcbiAgICAgIG1lZGlhOiBpdGVtWzJdLFxuICAgICAgc291cmNlTWFwOiBpdGVtWzNdLFxuICAgICAgc3VwcG9ydHM6IGl0ZW1bNF0sXG4gICAgICBsYXllcjogaXRlbVs1XVxuICAgIH07XG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcbiAgdmFyIHVwZGF0ZXIgPSBmdW5jdGlvbiB1cGRhdGVyKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXAgJiYgbmV3T2JqLnN1cHBvcnRzID09PSBvYmouc3VwcG9ydHMgJiYgbmV3T2JqLmxheWVyID09PSBvYmoubGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXBpLnVwZGF0ZShvYmogPSBuZXdPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcGkucmVtb3ZlKCk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gdXBkYXRlcjtcbn1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGlkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbaV07XG4gICAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4XS5yZWZlcmVuY2VzLS07XG4gICAgfVxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG4gICAgICB2YXIgX2luZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoX2lkZW50aWZpZXIpO1xuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcbiAgICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxhc3RJZGVudGlmaWVycyA9IG5ld0xhc3RJZGVudGlmaWVycztcbiAgfTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBtZW1vID0ge307XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZ2V0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAodHlwZW9mIG1lbW9bdGFyZ2V0XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHZhciBzdHlsZVRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTtcblxuICAgIC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG4gICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBtZW1vW3RhcmdldF0gPSBzdHlsZVRhcmdldDtcbiAgfVxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydEJ5U2VsZWN0b3IoaW5zZXJ0LCBzdHlsZSkge1xuICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGluc2VydCk7XG4gIGlmICghdGFyZ2V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnQnIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcbiAgfVxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRCeVNlbGVjdG9yOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBvcHRpb25zLnNldEF0dHJpYnV0ZXMoZWxlbWVudCwgb3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgb3B0aW9ucy5pbnNlcnQoZWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydFN0eWxlRWxlbWVudDsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMoc3R5bGVFbGVtZW50KSB7XG4gIHZhciBub25jZSA9IHR5cGVvZiBfX3dlYnBhY2tfbm9uY2VfXyAhPT0gXCJ1bmRlZmluZWRcIiA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IFwiXCI7XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChvYmouc3VwcG9ydHMsIFwiKSB7XCIpO1xuICB9XG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuICB2YXIgbmVlZExheWVyID0gdHlwZW9mIG9iai5sYXllciAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIkBsYXllclwiLmNvbmNhdChvYmoubGF5ZXIubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChvYmoubGF5ZXIpIDogXCJcIiwgXCIge1wiKTtcbiAgfVxuICBjc3MgKz0gb2JqLmNzcztcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG4gIGlmIChzb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiLmNvbmNhdChidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpLCBcIiAqL1wiKTtcbiAgfVxuXG4gIC8vIEZvciBvbGQgSUVcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuICBvcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xufVxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCkge1xuICAvLyBpc3RhbmJ1bCBpZ25vcmUgaWZcbiAgaWYgKHN0eWxlRWxlbWVudC5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZG9tQVBJKG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHJldHVybiB7XG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHt9LFxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgIH07XG4gIH1cbiAgdmFyIHN0eWxlRWxlbWVudCA9IG9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKG9iaikge1xuICAgICAgYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gIH07XG59XG5tb2R1bGUuZXhwb3J0cyA9IGRvbUFQSTsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCkge1xuICBpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICB9XG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlVGFnVHJhbnNmb3JtOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJ2YXIgd2VicGFja1F1ZXVlcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiA/IFN5bWJvbChcIndlYnBhY2sgcXVldWVzXCIpIDogXCJfX3dlYnBhY2tfcXVldWVzX19cIjtcbnZhciB3ZWJwYWNrRXhwb3J0cyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiA/IFN5bWJvbChcIndlYnBhY2sgZXhwb3J0c1wiKSA6IFwiX193ZWJwYWNrX2V4cG9ydHNfX1wiO1xudmFyIHdlYnBhY2tFcnJvciA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiA/IFN5bWJvbChcIndlYnBhY2sgZXJyb3JcIikgOiBcIl9fd2VicGFja19lcnJvcl9fXCI7XG52YXIgcmVzb2x2ZVF1ZXVlID0gKHF1ZXVlKSA9PiB7XG5cdGlmKHF1ZXVlICYmIHF1ZXVlLmQgPCAxKSB7XG5cdFx0cXVldWUuZCA9IDE7XG5cdFx0cXVldWUuZm9yRWFjaCgoZm4pID0+IChmbi5yLS0pKTtcblx0XHRxdWV1ZS5mb3JFYWNoKChmbikgPT4gKGZuLnItLSA/IGZuLnIrKyA6IGZuKCkpKTtcblx0fVxufVxudmFyIHdyYXBEZXBzID0gKGRlcHMpID0+IChkZXBzLm1hcCgoZGVwKSA9PiB7XG5cdGlmKGRlcCAhPT0gbnVsbCAmJiB0eXBlb2YgZGVwID09PSBcIm9iamVjdFwiKSB7XG5cdFx0aWYoZGVwW3dlYnBhY2tRdWV1ZXNdKSByZXR1cm4gZGVwO1xuXHRcdGlmKGRlcC50aGVuKSB7XG5cdFx0XHR2YXIgcXVldWUgPSBbXTtcblx0XHRcdHF1ZXVlLmQgPSAwO1xuXHRcdFx0ZGVwLnRoZW4oKHIpID0+IHtcblx0XHRcdFx0b2JqW3dlYnBhY2tFeHBvcnRzXSA9IHI7XG5cdFx0XHRcdHJlc29sdmVRdWV1ZShxdWV1ZSk7XG5cdFx0XHR9LCAoZSkgPT4ge1xuXHRcdFx0XHRvYmpbd2VicGFja0Vycm9yXSA9IGU7XG5cdFx0XHRcdHJlc29sdmVRdWV1ZShxdWV1ZSk7XG5cdFx0XHR9KTtcblx0XHRcdHZhciBvYmogPSB7fTtcblx0XHRcdG9ialt3ZWJwYWNrUXVldWVzXSA9IChmbikgPT4gKGZuKHF1ZXVlKSk7XG5cdFx0XHRyZXR1cm4gb2JqO1xuXHRcdH1cblx0fVxuXHR2YXIgcmV0ID0ge307XG5cdHJldFt3ZWJwYWNrUXVldWVzXSA9IHggPT4ge307XG5cdHJldFt3ZWJwYWNrRXhwb3J0c10gPSBkZXA7XG5cdHJldHVybiByZXQ7XG59KSk7XG5fX3dlYnBhY2tfcmVxdWlyZV9fLmEgPSAobW9kdWxlLCBib2R5LCBoYXNBd2FpdCkgPT4ge1xuXHR2YXIgcXVldWU7XG5cdGhhc0F3YWl0ICYmICgocXVldWUgPSBbXSkuZCA9IC0xKTtcblx0dmFyIGRlcFF1ZXVlcyA9IG5ldyBTZXQoKTtcblx0dmFyIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cztcblx0dmFyIGN1cnJlbnREZXBzO1xuXHR2YXIgb3V0ZXJSZXNvbHZlO1xuXHR2YXIgcmVqZWN0O1xuXHR2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWopID0+IHtcblx0XHRyZWplY3QgPSByZWo7XG5cdFx0b3V0ZXJSZXNvbHZlID0gcmVzb2x2ZTtcblx0fSk7XG5cdHByb21pc2Vbd2VicGFja0V4cG9ydHNdID0gZXhwb3J0cztcblx0cHJvbWlzZVt3ZWJwYWNrUXVldWVzXSA9IChmbikgPT4gKHF1ZXVlICYmIGZuKHF1ZXVlKSwgZGVwUXVldWVzLmZvckVhY2goZm4pLCBwcm9taXNlW1wiY2F0Y2hcIl0oeCA9PiB7fSkpO1xuXHRtb2R1bGUuZXhwb3J0cyA9IHByb21pc2U7XG5cdGJvZHkoKGRlcHMpID0+IHtcblx0XHRjdXJyZW50RGVwcyA9IHdyYXBEZXBzKGRlcHMpO1xuXHRcdHZhciBmbjtcblx0XHR2YXIgZ2V0UmVzdWx0ID0gKCkgPT4gKGN1cnJlbnREZXBzLm1hcCgoZCkgPT4ge1xuXHRcdFx0aWYoZFt3ZWJwYWNrRXJyb3JdKSB0aHJvdyBkW3dlYnBhY2tFcnJvcl07XG5cdFx0XHRyZXR1cm4gZFt3ZWJwYWNrRXhwb3J0c107XG5cdFx0fSkpXG5cdFx0dmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0Zm4gPSAoKSA9PiAocmVzb2x2ZShnZXRSZXN1bHQpKTtcblx0XHRcdGZuLnIgPSAwO1xuXHRcdFx0dmFyIGZuUXVldWUgPSAocSkgPT4gKHEgIT09IHF1ZXVlICYmICFkZXBRdWV1ZXMuaGFzKHEpICYmIChkZXBRdWV1ZXMuYWRkKHEpLCBxICYmICFxLmQgJiYgKGZuLnIrKywgcS5wdXNoKGZuKSkpKTtcblx0XHRcdGN1cnJlbnREZXBzLm1hcCgoZGVwKSA9PiAoZGVwW3dlYnBhY2tRdWV1ZXNdKGZuUXVldWUpKSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGZuLnIgPyBwcm9taXNlIDogZ2V0UmVzdWx0KCk7XG5cdH0sIChlcnIpID0+ICgoZXJyID8gcmVqZWN0KHByb21pc2Vbd2VicGFja0Vycm9yXSA9IGVycikgOiBvdXRlclJlc29sdmUoZXhwb3J0cykpLCByZXNvbHZlUXVldWUocXVldWUpKSk7XG5cdHF1ZXVlICYmIHF1ZXVlLmQgPCAwICYmIChxdWV1ZS5kID0gMCk7XG59OyIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubmMgPSB1bmRlZmluZWQ7IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSB1c2VkICdtb2R1bGUnIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2luZGV4LmpzXCIpO1xuIiwiIl0sIm5hbWVzIjpbIkdhbWVib2FyZCIsImdyaWQiLCJzaGlwc1RvUGxhY2UiLCJzaGlwVHlwZSIsInNoaXBMZW5ndGgiLCJoaXRCZ0NsciIsImhpdFRleHRDbHIiLCJtaXNzQmdDbHIiLCJtaXNzVGV4dENsciIsImVycm9yVGV4dENsciIsImRlZmF1bHRUZXh0Q2xyIiwicHJpbWFyeUhvdmVyQ2xyIiwiaGlnaGxpZ2h0Q2xyIiwiY3VycmVudE9yaWVudGF0aW9uIiwiY3VycmVudFNoaXAiLCJsYXN0SG92ZXJlZENlbGwiLCJwbGFjZVNoaXBHdWlkZSIsInByb21wdCIsInByb21wdFR5cGUiLCJnYW1lcGxheUd1aWRlIiwidHVyblByb21wdCIsInByb2Nlc3NDb21tYW5kIiwiY29tbWFuZCIsImlzTW92ZSIsInBhcnRzIiwic3BsaXQiLCJsZW5ndGgiLCJFcnJvciIsImdyaWRQb3NpdGlvbiIsInRvVXBwZXJDYXNlIiwidmFsaWRHcmlkUG9zaXRpb25zIiwiZmxhdCIsImluY2x1ZGVzIiwicmVzdWx0Iiwib3JpZW50YXRpb24iLCJ0b0xvd2VyQ2FzZSIsInVwZGF0ZU91dHB1dCIsIm1lc3NhZ2UiLCJ0eXBlIiwib3V0cHV0IiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsIm1lc3NhZ2VFbGVtZW50IiwiY3JlYXRlRWxlbWVudCIsInRleHRDb250ZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwiYXBwZW5kQ2hpbGQiLCJzY3JvbGxUb3AiLCJzY3JvbGxIZWlnaHQiLCJjb25zb2xlTG9nUGxhY2VtZW50Q29tbWFuZCIsImRpckZlZWJhY2siLCJjaGFyQXQiLCJzbGljZSIsInZhbHVlIiwiY29uc29sZUxvZ01vdmVDb21tYW5kIiwicmVzdWx0c09iamVjdCIsInBsYXllciIsIm1vdmUiLCJoaXQiLCJjb25zb2xlTG9nU2hpcFNpbmsiLCJjb25zb2xlTG9nRXJyb3IiLCJlcnJvciIsImNvbnNvbGUiLCJpbml0VWlNYW5hZ2VyIiwidWlNYW5hZ2VyIiwiaW5pdENvbnNvbGVVSSIsImNyZWF0ZUdhbWVib2FyZCIsImNhbGN1bGF0ZVNoaXBDZWxscyIsInN0YXJ0Q2VsbCIsImNlbGxJZHMiLCJyb3dJbmRleCIsImNoYXJDb2RlQXQiLCJjb2xJbmRleCIsInBhcnNlSW50Iiwic3Vic3RyaW5nIiwiaSIsInB1c2giLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJoaWdobGlnaHRDZWxscyIsImZvckVhY2giLCJjZWxsSWQiLCJjZWxsRWxlbWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJjbGVhckhpZ2hsaWdodCIsInJlbW92ZSIsInRvZ2dsZU9yaWVudGF0aW9uIiwiaGFuZGxlUGxhY2VtZW50SG92ZXIiLCJlIiwiY2VsbCIsInRhcmdldCIsImNvbnRhaW5zIiwiZGF0YXNldCIsImNlbGxQb3MiLCJwb3NpdGlvbiIsImNlbGxzVG9IaWdobGlnaHQiLCJoYW5kbGVNb3VzZUxlYXZlIiwiY2VsbHNUb0NsZWFyIiwiaGFuZGxlT3JpZW50YXRpb25Ub2dnbGUiLCJwcmV2ZW50RGVmYXVsdCIsImtleSIsIm9sZENlbGxzVG9DbGVhciIsIm5ld0NlbGxzVG9IaWdobGlnaHQiLCJlbmFibGVDb21wdXRlckdhbWVib2FyZEhvdmVyIiwicXVlcnlTZWxlY3RvckFsbCIsImRpc2FibGVDb21wdXRlckdhbWVib2FyZEhvdmVyIiwiY2VsbHNBcnJheSIsImRpc2FibGVIdW1hbkdhbWVib2FyZEhvdmVyIiwic3dpdGNoR2FtZWJvYXJkSG92ZXJTdGF0ZXMiLCJzZXR1cEdhbWVib2FyZEZvclBsYWNlbWVudCIsImNvbXBHYW1lYm9hcmRDZWxscyIsImFkZEV2ZW50TGlzdGVuZXIiLCJnYW1lYm9hcmRBcmVhIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImNsZWFudXBBZnRlclBsYWNlbWVudCIsInN0YXJ0R2FtZSIsImdhbWUiLCJzZXRVcCIsInNoaXAiLCJyZW5kZXJTaGlwRGlzcCIsInBsYXllcnMiLCJjb21wdXRlciIsImRpc3BsYXlQcm9tcHQiLCJBY3Rpb25Db250cm9sbGVyIiwiaHVtYW5QbGF5ZXIiLCJodW1hbiIsImh1bWFuUGxheWVyR2FtZWJvYXJkIiwiZ2FtZWJvYXJkIiwiY29tcFBsYXllciIsImNvbXBQbGF5ZXJHYW1lYm9hcmQiLCJzZXR1cEV2ZW50TGlzdGVuZXJzIiwiaGFuZGxlckZ1bmN0aW9uIiwicGxheWVyVHlwZSIsImNsZWFudXBGdW5jdGlvbnMiLCJjb25zb2xlU3VibWl0QnV0dG9uIiwiY29uc29sZUlucHV0Iiwic3VibWl0SGFuZGxlciIsImlucHV0Iiwia2V5cHJlc3NIYW5kbGVyIiwiY2xpY2tIYW5kbGVyIiwiY2xlYW51cCIsInByb21wdEFuZFBsYWNlU2hpcCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZmluZCIsInBsYWNlU2hpcFByb21wdCIsImhhbmRsZVZhbGlkSW5wdXQiLCJwbGFjZVNoaXAiLCJyZW5kZXJTaGlwQm9hcmQiLCJyZXNvbHZlU2hpcFBsYWNlbWVudCIsInNldHVwU2hpcHNTZXF1ZW50aWFsbHkiLCJoYW5kbGVTZXR1cCIsInVwZGF0ZURpc3BsYXlzIiwibW92ZVJlc3VsdCIsInBsYXllclNlbGVjdG9yIiwidXBkYXRlU2hpcFNlY3Rpb24iLCJwcm9tcHRQbGF5ZXJNb3ZlIiwiaHVtYW5Nb3ZlUmVzdWx0IiwiaGFuZGxlVmFsaWRNb3ZlIiwibWFrZU1vdmUiLCJyZXNvbHZlTW92ZSIsImNvbXB1dGVyTW92ZSIsImNvbXBNb3ZlUmVzdWx0IiwiY2hlY2tTaGlwSXNTdW5rIiwiaXNTaGlwU3VuayIsImNoZWNrV2luQ29uZGl0aW9uIiwiY2hlY2tBbGxTaGlwc1N1bmsiLCJyZXN0YXJ0R2FtZSIsIndpbmRvdyIsImxvY2F0aW9uIiwicmVsb2FkIiwiY29uY2x1ZGVHYW1lIiwid2lubmVyIiwicHJvbXB0RW5kR2FtZSIsInJlc3RhcnRCdXR0b24iLCJwbGF5R2FtZSIsImdhbWVPdmVyIiwibGFzdENvbXBNb3ZlUmVzdWx0IiwibGFzdEh1bWFuTW92ZVJlc3VsdCIsImlzU3VuayIsInJlbmRlclN1bmtlblNoaXAiLCJPdmVybGFwcGluZ1NoaXBzRXJyb3IiLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJTaGlwQWxsb2NhdGlvblJlYWNoZWRFcnJvciIsIlNoaXBUeXBlQWxsb2NhdGlvblJlYWNoZWRFcnJvciIsIkludmFsaWRTaGlwTGVuZ3RoRXJyb3IiLCJJbnZhbGlkU2hpcFR5cGVFcnJvciIsIkludmFsaWRQbGF5ZXJUeXBlRXJyb3IiLCJTaGlwUGxhY2VtZW50Qm91bmRhcnlFcnJvciIsIlJlcGVhdEF0dGFja2VkRXJyb3IiLCJJbnZhbGlkTW92ZUVudHJ5RXJyb3IiLCJQbGF5ZXIiLCJTaGlwIiwiR2FtZSIsImh1bWFuR2FtZWJvYXJkIiwiY29tcHV0ZXJHYW1lYm9hcmQiLCJjb21wdXRlclBsYXllciIsImN1cnJlbnRQbGF5ZXIiLCJnYW1lT3ZlclN0YXRlIiwicGxhY2VTaGlwcyIsImVuZEdhbWUiLCJ0YWtlVHVybiIsImZlZWRiYWNrIiwib3Bwb25lbnQiLCJnYW1lV29uIiwiaW5kZXhDYWxjcyIsInN0YXJ0IiwiY29sTGV0dGVyIiwicm93TnVtYmVyIiwiY2hlY2tUeXBlIiwic2hpcFBvc2l0aW9ucyIsIk9iamVjdCIsImtleXMiLCJleGlzdGluZ1NoaXBUeXBlIiwiY2hlY2tCb3VuZGFyaWVzIiwiY29vcmRzIiwiZGlyZWN0aW9uIiwieExpbWl0IiwieUxpbWl0IiwieCIsInkiLCJjYWxjdWxhdGVTaGlwUG9zaXRpb25zIiwicG9zaXRpb25zIiwiY2hlY2tGb3JPdmVybGFwIiwiZW50cmllcyIsImV4aXN0aW5nU2hpcFBvc2l0aW9ucyIsInNvbWUiLCJjaGVja0ZvckhpdCIsImZvdW5kU2hpcCIsIl8iLCJzaGlwRmFjdG9yeSIsInNoaXBzIiwiaGl0UG9zaXRpb25zIiwiYXR0YWNrTG9nIiwibmV3U2hpcCIsImF0dGFjayIsInJlc3BvbnNlIiwiY2hlY2tSZXN1bHRzIiwiZXZlcnkiLCJzaGlwUmVwb3J0IiwiZmxvYXRpbmdTaGlwcyIsImZpbHRlciIsIm1hcCIsImdldFNoaXAiLCJnZXRTaGlwUG9zaXRpb25zIiwiZ2V0SGl0UG9zaXRpb25zIiwiVWlNYW5hZ2VyIiwic3R5bGUiLCJ2aXNpYmlsaXR5IiwibmV3VWlNYW5hZ2VyIiwibmV3R2FtZSIsImFjdENvbnRyb2xsZXIiLCJjaGVja01vdmUiLCJnYkdyaWQiLCJ2YWxpZCIsImVsIiwicCIsInJhbmRNb3ZlIiwibW92ZUxvZyIsImFsbE1vdmVzIiwiZmxhdE1hcCIsInJvdyIsInBvc3NpYmxlTW92ZXMiLCJyYW5kb21Nb3ZlIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiZ2VuZXJhdGVSYW5kb21TdGFydCIsInNpemUiLCJ2YWxpZFN0YXJ0cyIsImNvbCIsInJhbmRvbUluZGV4IiwiYXV0b1BsYWNlbWVudCIsInNoaXBUeXBlcyIsInBsYWNlZCIsIm9wcEdhbWVib2FyZCIsInNldExlbmd0aCIsImhpdHMiLCJ0dyIsInN0cmluZ3MiLCJ2YWx1ZXMiLCJyYXciLCJpbnN0cnVjdGlvbkNsciIsImd1aWRlQ2xyIiwiZXJyb3JDbHIiLCJkZWZhdWx0Q2xyIiwiY2VsbENsciIsImlucHV0Q2xyIiwiaW5wdXRUZXh0Q2xyIiwiYnV0dG9uQ2xyIiwiYnV0dG9uVGV4dENsciIsInNoaXBTZWN0Q2xyIiwic2hpcEhpdENsciIsInNoaXBTdW5rQ2xyIiwiYnVpbGRTZWN0aW9uIiwiZG9tU2VsIiwicG9zIiwic2VjdCIsImNsYXNzTmFtZSIsInNldEF0dHJpYnV0ZSIsImJ1aWxkU2hpcCIsIm9iaiIsInNoaXBTZWN0cyIsImVuZEdhbWVJbnRlcmZhY2UiLCJtYWluQ29udGFpbmVyIiwiZW5kR2FtZUNvbnRhaW5lciIsInByb21wdENvbnRhaW5lciIsIndpbm5lclByb21wdCIsInJlc3RhcnRQcm9tcHQiLCJjb250YWluZXJJRCIsImNvbnRhaW5lciIsImdyaWREaXYiLCJjb2x1bW5zIiwiaGVhZGVyIiwicm93TGFiZWwiLCJpZCIsImNvbnNvbGVDb250YWluZXIiLCJpbnB1dERpdiIsInN1Ym1pdEJ1dHRvbiIsInByb21wdE9ianMiLCJkaXNwbGF5IiwiZmlyc3RDaGlsZCIsInJlbW92ZUNoaWxkIiwicHJvbXB0RGl2IiwicGxheWVyT2JqIiwiaWRTZWwiLCJkaXNwRGl2Iiwic2hpcERpdiIsInRpdGxlIiwic2VjdHNEaXYiLCJzaGlwT2JqIiwic2hpcFNlY3QiLCJzZWN0aW9uIiwicmVuZGVyU2hpcFNlY3QiLCJuZXdDbHIiLCJwbGF5ZXJJZCIsInNoaXBTZWN0RGlzcGxheUVsIiwic2hpcFNlY3RCb2FyZEVsIl0sInNvdXJjZVJvb3QiOiIifQ==