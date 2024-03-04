const grid = [
  ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10"],
  ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10"],
  ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10"],
  ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"],
  ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10"],
  ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10"],
  ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10"],
  ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10"],
  ["I1", "I2", "I3", "I4", "I5", "I6", "I7", "I8", "I9", "I10"],
  ["J1", "J2", "J3", "J4", "J5", "J6", "J7", "J8", "J9", "J10"],
];

// Create an empty array for holding the human ships
const humanShips = [];

const shipsToPlace = [
  { shipType: "carrier", shipLength: 5 },
  { shipType: "battleship", shipLength: 4 },
  { shipType: "submarine", shipLength: 3 },
  { shipType: "cruiser", shipLength: 3 },
  { shipType: "destroyer", shipLength: 2 },
];

let currentOrientation = "h"; // Default orientation
let currentShip;

const placeShipGuide = {
  prompt:
    'Enter the cell number (i.e. "A1") and orientation ("h" for horizontal and "v" for vertical), separated with a space. For example "A2 v".',
  promptType: "guide",
};

const processPlacementCommand = (command) => {
  // Split the command by space
  const parts = command.split(" ");
  if (parts.length !== 2) {
    throw new Error(
      "Invalid command format. Please use the format 'GridPosition Direction'.",
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

  // Process and validate the direction
  const direction = parts[1].toLowerCase();
  if (direction !== "h" && direction !== "v") {
    throw new Error(
      "Invalid direction. Must be either 'h' for horizontal or 'v' for vertical.",
    );
  }

  // Return the processed and validated command parts
  return { gridPosition, direction };
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
      messageElement.classList.add("text-gray-800"); // Default text color
  }

  output.appendChild(messageElement); // Add the element to the output

  // eslint-disable-next-line no-param-reassign
  output.scrollTop = output.scrollHeight; // Scroll to the bottom of the output container
};

// The function for executing commands from the console input
const consoleLogCommand = (shipType, gridPosition, direction) => {
  // Set the direction feedback
  const dirFeeback = direction === "h" ? "horizontally" : "vertically";
  // Set the console message
  const message = `${shipType.charAt(0).toUpperCase() + shipType.slice(1)} placed at ${gridPosition} facing ${dirFeeback}`;

  console.log(`${message}`);

  updateOutput(`> ${message}`, "valid");

  // Clear the input
  document.getElementById("console-input").value = "";
};

const consoleLogError = (shipType, error) => {
  console.error(`Error placing ${shipType}: ${error.message}`);

  updateOutput(`> Error placing ${shipType}: ${error.message}`, "error");

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
function calculateShipCells(startCell, shipLength, direction) {
  const cellIds = [];
  const rowIndex = startCell.charCodeAt(0) - "A".charCodeAt(0);
  const colIndex = parseInt(startCell.substring(1), 10) - 1;

  for (let i = 0; i < shipLength; i++) {
    if (direction === "horizontal") {
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
  // Logic to handle hover effect
  const cellPos = e.target.dataset.position;
  const cellsToHighlight = calculateShipCells(
    cellPos,
    currentShip.shipLength,
    currentOrientation,
  );
  highlightCells(cellsToHighlight);
};

const handleMouseLeave = (e) => {
  // Logic for handling when the cursor leaves a cell
  const cellPos = e.target.dataset.position;
  const cellsToRemoveHighlight = calculateShipCells(
    cellPos,
    currentShip.shipLength,
    currentOrientation,
  );
  clearHighlight(cellsToRemoveHighlight);
};

const handleDirectionToggle = (e) => {
  if (e.key === " ") {
    // Spacebar
    e.preventDefault(); // Prevent the default spacebar action
    toggleOrientation();
    // Call function to update visual feedback based on new direction

    console.log(currentOrientation);
  }
};

// Function to setup gameboard for ship placement
const setupGameboardForPlacement = () => {
  document
    .querySelectorAll(".gameboard-cell, [data-player='human']")
    .forEach((cell) => {
      cell.addEventListener("mouseenter", handlePlacementHover);
      cell.addEventListener("mouseleave", handleMouseLeave);
    });
  // Get gameboard area div element
  const gameboardArea = document.querySelector(
    ".gameboard-area, [data-player='human']",
  );
  // Add event listeners to gameboard area to add and remove the
  // handleDirectionToggle event listener when entering and exiting the area
  gameboardArea.addEventListener("mouseenter", () => {
    document.addEventListener("keydown", handleDirectionToggle);
  });
  gameboardArea.addEventListener("mouseleave", () => {
    document.removeEventListener("keydown", handleDirectionToggle);
  });
};

// Function to clean up after ship placement is complete
const cleanupAfterPlacement = () => {
  document
    .querySelectorAll(".gameboard-cell, [data-player='human']")
    .forEach((cell) => {
      cell.removeEventListener("mouseenter", handlePlacementHover);
      cell.removeEventListener("mouseleave", handleMouseLeave);
    });
  // Get gameboard area div element
  const gameboardArea = document.querySelector(
    ".gameboard-area, [data-player='human']",
  );
  // Remove event listeners to gameboard area to add and remove the
  // handleDirectionToggle event listener when entering and exiting the area
  gameboardArea.removeEventListener("mouseenter", () => {
    document.addEventListener("keydown", handleDirectionToggle);
  });
  gameboardArea.removeEventListener("mouseleave", () => {
    document.removeEventListener("keydown", handleDirectionToggle);
  });
  // Remove event listener for keydown events
  document.removeEventListener("keydown", handleDirectionToggle);
};

const ActionController = (uiManager, game) => {
  const humanPlayer = game.players.human.gameboard;

  // Function to setup event listeners for console and gameboard clicks
  function setupEventListeners(handleValidInput) {
    // Define cleanup functions inside to ensure they are accessible for removal
    const cleanupFunctions = [];

    const consoleSubmitButton = document.getElementById("console-submit");
    const consoleInput = document.getElementById("console-input");

    const submitHandler = () => {
      const input = consoleInput.value;
      handleValidInput(input);
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
    document.querySelectorAll(".gameboard-cell").forEach((cell) => {
      const clickHandler = () => {
        const { position } = cell.dataset;
        const input = `${position} ${currentOrientation}`;
        console.log(input);
        handleValidInput(input);
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
          const { gridPosition, direction } = processPlacementCommand(input);
          await humanPlayer.placeShip(shipType, gridPosition, direction);
          consoleLogCommand(shipType, gridPosition, direction);
          // eslint-disable-next-line no-use-before-define
          resolveShipPlacement(); // Ship placed successfully, resolve the promise
        } catch (error) {
          consoleLogError(shipType, error);
          // Do not reject to allow for retry, just log the error
        }
      };

      // Setup event listeners and ensure we can clean them up after placement
      const cleanup = setupEventListeners(handleValidInput);

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
  };

  return {
    handleSetup,
  };
};

export default ActionController;
