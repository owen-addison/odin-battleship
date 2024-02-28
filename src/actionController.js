const placeShipPrompt = "Place your ships on the board using the console.";

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

const ActionController = (uiManager, game) => {
  // Initialise console
  uiManager.initConsoleUI();

  // Initialise gameboard with callback for cell clicks
  uiManager.createGameboard("human-gb", gameboardClick);
  uiManager.createGameboard("comp-gb", gameboardClick);

  const promptShipPlacement = () => {
    // Create a prompt object with the prompt and prompt type
    const promptObj = { prompt: placeShipPrompt, promptType: "instruction" };

    // Call the displayPrompt method on the UiManager
    uiManager.displayPrompt({ promptObj });
  };

  return {
    promptShipPlacement,
  };
};

export default ActionController;
