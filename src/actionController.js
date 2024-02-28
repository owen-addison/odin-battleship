const placeShipPrompt = {
  prompt: "Place your ships on the board using the console.",
  promptType: "instruction",
};
const placeShipGuide = {
  prompt:
    'Enter the cell number (i.e. "A1") and orientation ("h" for horizontal and "v" for vertical), separated with a space. For example "A2 v".',
  promptType: "guide",
};

// Function called when a cell on the gamboard is clicked
const gameboardClick = (event) => {
  // Get the target element
  const { id } = event.target;
  // Get the target player and position dataset attributes
  const { player, position } = event.target.dataset;
  console.log(
    `Clicked cell ID: ${id}. Player & position: ${player}, ${position}.`,
  );
};

// The function for updating the output div element
const updateOutput = (message, output) => {
  // Append new message
  const messageElement = document.createElement("div"); // Create a new div for the message
  messageElement.textContent = message; // Set the text content to the message
  output.appendChild(messageElement); // Add the element to the output

  // eslint-disable-next-line no-param-reassign
  output.scrollTop = output.scrollHeight; // Scroll to the bottom of the output container
};

// The function for executing commands from the console input
const executeCommand = (command, output) => {
  // Process the command
  // For example, if command is "move A1", call the relevant game function
  console.log(`Executing command: ${command}`); // Placeholder for actual command processing

  // Update the console output
  updateOutput(`> ${command}`, output);

  // Clear the input
  document.getElementById("console-input").value = "";
};

const ActionController = (uiManager, game) => {
  // Initialise console
  uiManager.initConsoleUI(executeCommand);

  // Initialise gameboard with callback for cell clicks
  uiManager.createGameboard("human-gb", gameboardClick);
  uiManager.createGameboard("comp-gb", gameboardClick);

  const promptShipPlacement = () => {
    // Create a prompt object with the prompt and prompt type
    const promptObj = { placeShipPrompt, placeShipGuide };

    // Call the displayPrompt method on the UiManager
    uiManager.displayPrompt(promptObj);
  };

  // Function for handling the game setup and ship placement
  const handleSetup = () => {
    // Prompt player for ships
    promptShipPlacement();
  };

  return {
    promptShipPlacement,
  };
};

export default ActionController;
