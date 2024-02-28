const placeShipPrompt = "Place your ships on the board using the console.";

const ActionController = (uiManager, game) => {
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
