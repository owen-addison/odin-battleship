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

const shipTypes = [
  "carrier",
  "battleship",
  "submarine",
  "cruiser",
  "destroyer",
];

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

let shipsToPlace = [...shipTypes];

function addShipToCollection(shipType, gridPosition, direction) {
  return new Promise((resolve, reject) => {
    // Validate shipType, gridPosition, and direction here
    // If valid, add to humanShips and resolve the promise
    if (shipsToPlace.includes(shipType)) {
      humanShips.push({ shipType, start: gridPosition, direction });
      // Remove the placed ship type from shipsToPlace
      shipsToPlace = shipsToPlace.filter((type) => type !== shipType);
      resolve();
    } else {
      reject(new Error("Invalid ship placement"));
    }
  });
}

// Function called when a cell on the gamboard is clicked
const gameboardClick = (cell) => {
  // Get the target element
  const { id } = cell;
  // Get the target player and position dataset attributes
  const { player, position } = cell.dataset;
  console.log(
    `Clicked cell ID: ${id}. Player & position: ${player}, ${position}.`,
  );
};

// The function for updating the output div element
const updateOutput = (message, output, type) => {
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
const executeCommand = (command) => {
  const output = document.getElementById("console-output");
  // Try to process the command and catch any errors
  try {
    const { gridPosition, direction } = processPlacementCommand(command);
    // Assuming a function to validate and add ship to `humanShips`
    addShipToCollection(gridPosition, direction);
    updateOutput(
      `> Ship placed at ${gridPosition} facing ${direction}`,
      output,
      "valid",
    );
  } catch (error) {
    console.error(error.message);
    updateOutput(`> ERROR! ${error.message}`, output, "error");
  }

  // Clear the input
  document.getElementById("console-input").value = "";
};

const ActionController = (uiManager, game) => {
  const humanPlayer = game.players.human;

  // Initialise console
  uiManager.initConsoleUI();

  // Initialise gameboard with callback for cell clicks
  uiManager.createGameboard("human-gb");
  uiManager.createGameboard("comp-gb");

  let resolveShipPlacement;

  function onValidPlacement(input) {
    if (resolveShipPlacement) {
      resolveShipPlacement(input);
    }
  }

  // Set up a event listeners for console commands
  function setupConsoleListener() {
    // Setup listener for console submit button
    document.getElementById("console-submit").addEventListener("click", () => {
      const input = document.getElementById("console-input").value;
      executeCommand(input);
      onValidPlacement(input);
    });
    // Setup listener for console input
    document
      .getElementById("console-input")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const input = document.getElementById("console-input").value;
          executeCommand(input);
          onValidPlacement(input);
        }
      });
  }

  // Set up a event listeners for gameboard cell clicks
  function setupGameboardClickListener() {
    document.querySelectorAll(".gameboard-cell").forEach((cell) => {
      cell.addEventListener("click", () => {
        const cellPos = cell.dataset.position; // Get the cell position from the cell's dataset position attribute
        gameboardClick(cell);
        onValidPlacement(cellPos);
      });
    });
  }

  async function promptAndPlaceShip(shipType) {
    return new Promise((resolve, reject) => {
      resolveShipPlacement = resolve;

      // Create a prompt for the specific ship type
      const placeShipPrompt = {
        prompt: `Place your ${shipType}.`,
        promptType: "instruction",
      };

      // Display prompt for the specific ship type as well as the
      // guide to placing ships
      uiManager.displayPrompt({ placeShipPrompt, placeShipGuide });
    });
  }

  // Sequentially prompt for and place each ship
  async function setupShipsSequentially() {
    for (let i = 0; i < shipTypes.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      await promptAndPlaceShip(shipTypes[i]); // Wait for each ship to be placed before continuing
    }
  }

  // Function for handling the game setup and ship placement
  const handleSetup = async () => {
    setupConsoleListener();
    setupGameboardClickListener();
    await setupShipsSequentially();
    // Proceed with the rest of the game setup after all ships are placed
    console.log("All ships placed, game setup complete.");
  };

  return {
    handleSetup,
  };
};

export default ActionController;
