const placeShipPrompt = "Place your ships on the board using the console.";

const ActionController = (uiManager, game) => {
  const promptShipPlacement = () => {
    // Call the displayPrompt method on the UiManager
    uiManager.displayPrompt(placeShipPrompt, "instruction");
  };

  return {
    promptShipPlacement,
  };
};

export default ActionController;
