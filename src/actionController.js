import Gameboard from "./gameboard";

const { grid } = Gameboard();

const shipsToPlace = [
  { shipType: "carrier", shipLength: 5 },
  { shipType: "battleship", shipLength: 4 },
  { shipType: "submarine", shipLength: 3 },
  { shipType: "cruiser", shipLength: 3 },
  { shipType: "destroyer", shipLength: 2 },
];

let currentOrientation = "h"; // Default orientation
let currentShip;
let lastHoveredCell = null; // Store the last hovered cell's ID

const placeShipGuide = {
  prompt:
    "Enter the grid position (i.e. 'A1') and orientation ('h' for horizontal and 'v' for vertical), separated with a space. For example 'A2 v'. Alternatively, on you gameboard click the cell you want to set at the starting point, use spacebar to toggle the orientation.",
  promptType: "guide",
};

const gameplayGuide = {
  prompt:
    "Enter grid position (i.e. 'A1') you want to attack. Alternatively, click the cell you want to attack on the opponent's gameboard",
  promptType: "guide",
};

const turnPrompt = {
  prompt: "Make your move.",
  promptType: "instruction",
};

const processCommand = (command, isMove) => {
  // If isMove is truthy, assign as single item array, otherwise split the command by space
  const parts = isMove ? [command] : command.split(" ");
  if (!isMove && parts.length !== 2) {
    throw new Error(
      "Invalid command format. Please use the format 'GridPosition Orientation'.",
    );
  }

  // Process and validate the grid position
  const gridPosition = parts[0].toUpperCase();
  if (gridPosition.length < 2 || gridPosition.length > 3) {
    throw new Error("Invalid grid position. Must be 2 to 3 characters long.");
  }

  // Validate grid position against the grid matrix
  const validGridPositions = grid.flat(); // Flatten the grid for easier searching
  if (!validGridPositions.includes(gridPosition)) {
    throw new Error(
      "Invalid grid position. Does not match any valid grid values.",
    );
  }

  const result = { gridPosition };

  if (!isMove) {
    // Process and validate the orientation
    const orientation = parts[1].toLowerCase();
    if (orientation !== "h" && orientation !== "v") {
      throw new Error(
        "Invalid orientation. Must be either 'h' for horizontal or 'v' for vertical.",
      );
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
      messageElement.classList.add("text-gray-800"); // Default text color
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
const consoleLogMoveCommand = (resultsObject) => {
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
const initUiManager = (uiManager) => {
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
      cellIds.push(
        `${String.fromCharCode(rowIndex + "A".charCodeAt(0))}${colIndex + i + 1}`,
      );
    } else {
      if (rowIndex + i >= grid.length) break; // Check grid bounds
      cellIds.push(
        `${String.fromCharCode(rowIndex + i + "A".charCodeAt(0))}${colIndex + 1}`,
      );
    }
  }

  return cellIds;
}

// Function to highlight cells
function highlightCells(cellIds) {
  cellIds.forEach((cellId) => {
    const cellElement = document.querySelector(`[data-position="${cellId}"]`);
    if (cellElement) {
      cellElement.classList.add("bg-orange-400");
    }
  });
}

// Function to clear highlight from cells
function clearHighlight(cellIds) {
  cellIds.forEach((cellId) => {
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

const handlePlacementHover = (e) => {
  const cell = e.target;
  if (
    cell.classList.contains("gameboard-cell") &&
    cell.dataset.player === "human"
  ) {
    // Logic to handle hover effect
    const cellPos = cell.dataset.position;
    lastHoveredCell = cellPos;
    const cellsToHighlight = calculateShipCells(
      cellPos,
      currentShip.shipLength,
      currentOrientation,
    );
    highlightCells(cellsToHighlight);
  }
};

const handleMouseLeave = (e) => {
  const cell = e.target;
  if (cell.classList.contains("gameboard-cell")) {
    // Logic for handling when the cursor leaves a cell
    const cellPos = cell.dataset.position;
    if (cellPos === lastHoveredCell) {
      const cellsToClear = calculateShipCells(
        cellPos,
        currentShip.shipLength,
        currentOrientation,
      );
      clearHighlight(cellsToClear);
      lastHoveredCell = null; // Reset lastHoveredCell since the mouse has left
    }
    lastHoveredCell = null;
  }
};

const handleOrientationToggle = (e) => {
  if (e.key === " " && lastHoveredCell) {
    // Ensure spacebar is pressed and there's a last hovered cell
    e.preventDefault(); // Prevent the default spacebar action

    // Toggle the orientation
    toggleOrientation();

    // Clear previously highlighted cells
    // Assuming calculateShipCells and clearHighlight work correctly
    const oldCellsToClear = calculateShipCells(
      lastHoveredCell,
      currentShip.shipLength,
      currentOrientation === "h" ? "v" : "h",
    );
    clearHighlight(oldCellsToClear);

    // Highlight new cells based on the new orientation
    const newCellsToHighlight = calculateShipCells(
      lastHoveredCell,
      currentShip.shipLength,
      currentOrientation,
    );
    highlightCells(newCellsToHighlight);
  }
};

function enableComputerGameboardHover() {
  document
    .querySelectorAll('.gameboard-cell[data-player="computer"]')
    .forEach((cell) => {
      cell.classList.remove("pointer-events-none", "cursor-default");
      cell.classList.remove("hover:bg-orange-500");
      cell.classList.add("hover:bg-orange-500");
    });
}

function disableComputerGameboardHover(cellsArray) {
  cellsArray.forEach((cell) => {
    cell.classList.add("pointer-events-none", "cursor-default");
    cell.classList.remove("hover:bg-orange-500");
  });
}

function disableHumanGameboardHover() {
  document
    .querySelectorAll('.gameboard-cell[data-player="human"]')
    .forEach((cell) => {
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
  const compGameboardCells = document.querySelectorAll(
    '.gameboard-cell[data-player="computer"]',
  );
  disableComputerGameboardHover(compGameboardCells);
  document
    .querySelectorAll('.gameboard-cell[data-player="human"]')
    .forEach((cell) => {
      cell.addEventListener("mouseenter", handlePlacementHover);
      cell.addEventListener("mouseleave", handleMouseLeave);
    });
  // Get gameboard area div element
  const gameboardArea = document.querySelector(
    ".gameboard-area, [data-player='human']",
  );
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
  document
    .querySelectorAll('.gameboard-cell[data-player="human"]')
    .forEach((cell) => {
      cell.removeEventListener("mouseenter", handlePlacementHover);
      cell.removeEventListener("mouseleave", handleMouseLeave);
    });
  // Get gameboard area div element
  const gameboardArea = document.querySelector(
    ".gameboard-area, [data-player='human']",
  );
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
  shipsToPlace.forEach((ship) => {
    uiManager.renderShipDisp(game.players.computer, ship.shipType);
  });

  // Display prompt object for taking a turn and starting the game
  uiManager.displayPrompt({ turnPrompt, gameplayGuide });
};

const handleHumanMove = (e) => {
  // Get the position on the board to make a move
  const { position } = e.target.data;
};

// Setup gameboard for for player move
const setupGameboardForPlayerMove = () => {
  // Enable the hover state for the computer gameboard
  enableComputerGameboardHover();

  // Set up event listeners on the computer gameboard for the player
  // making moves
  document
    .querySelectorAll('.gameboard-cell[data-player="computer"]')
    .forEach((cell) => {
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

    const keypressHandler = (e) => {
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
    document
      .querySelectorAll(`.gameboard-cell[data-player=${playerType}]`)
      .forEach((cell) => {
        const clickHandler = () => {
          const { position } = cell.dataset;
          let input;
          if (playerType === "human") {
            input = `${position} ${currentOrientation}`;
          } else if (playerType === "computer") {
            input = position;
          } else {
            throw new Error(
              "Error! Invalid player type passed to clickHandler!",
            );
          }
          console.log(`clickHandler input = ${input}`);
          handlerFunction(input);
        };
        cell.addEventListener("click", clickHandler);

        // Add cleanup function for each cell listener
        cleanupFunctions.push(() =>
          cell.removeEventListener("click", clickHandler),
        );
      });

    // Return a single cleanup function to remove all listeners
    return () => cleanupFunctions.forEach((cleanup) => cleanup());
  }

  async function promptAndPlaceShip(shipType) {
    return new Promise((resolve, reject) => {
      // Set the current ship
      currentShip = shipsToPlace.find((ship) => ship.shipType === shipType);

      // Display prompt for the specific ship type as well as the guide to placing ships
      const placeShipPrompt = {
        prompt: `Place your ${shipType}.`,
        promptType: "instruction",
      };
      uiManager.displayPrompt({ placeShipPrompt, placeShipGuide });

      const handleValidInput = async (input) => {
        try {
          const { gridPosition, orientation } = processCommand(input, false);
          await humanPlayerGameboard.placeShip(
            shipType,
            gridPosition,
            orientation,
          );
          consoleLogPlacementCommand(shipType, gridPosition, orientation);
          // Remove cell highlights
          const cellsToClear = calculateShipCells(
            gridPosition,
            currentShip.shipLength,
            orientation,
          );
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

  const updateComputerDisplays = (humanMoveResult) => {
    // Set the player selector of the opponent depending on the player
    // who made the move
    const playerSelector =
      humanMoveResult.player === "human" ? "computer" : "human";
    console.log("updateComputerDisplays func -->");
    console.dir(humanMoveResult);
    // Get the DOM element for the cell
    const cell = document.querySelector(
      `.gameboard-cell[data-player=${playerSelector}][data-position=${humanMoveResult.move}]`,
    );
    console.log(cell);

    // Disable the cell from future clicks
    disableComputerGameboardHover([cell]);

    // Handle miss and hit
    if (!humanMoveResult.hit) {
      // Update the cells styling to reflect miss
      cell.classList.add("bg-gray-800");
    } else {
      // Update the cells styling to reflect hit
      cell.classList.add("bg-lime-600");
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

      const handleValidMove = async (move) => {
        // console.log(`handleValidInput: move = ${move}`);
        try {
          const { gridPosition } = processCommand(move, true);
          // console.log(`handleValidInput: gridPosition = ${gridPosition}`);
          humanMoveResult = await humanPlayer.makeMove(
            compPlayerGameboard,
            gridPosition,
          );

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
    playGame,
  };
};

export default ActionController;
