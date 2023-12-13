import Player from "./player";
import Gameboard from "./gameboard";

const getStartPositionFromUI = () => {};

const getDirectionFromUI = () => {};

const updateUIAfterPlacement = () => {};

const handlePlacementError = () => {};

const triggerHumanShipPlacement = (humanPlayer) => {
  // Example: Add event listeners to UI elements for ship placement
  document.querySelectorAll(".ship-placement-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      const { shipType } = event.target.dataset;
      const startPosition = getStartPositionFromUI();
      const direction = getDirectionFromUI();

      try {
        humanPlayer.gameboard.placeShip(shipType, startPosition, direction);
        updateUIAfterPlacement();
      } catch (error) {
        handlePlacementError(error); // Handle any errors (e.g., overlapping ships)
      }
    });
  });
};

const Game = () => {
  // Initialise, create gameboards for both players and create players of types human and computer
  const humanGameboard = Gameboard();
  const computerGameboard = Gameboard();
  const humanPlayer = Player(humanGameboard, "human");
  const computerPlayer = Player(computerGameboard, "computer");

  // Store players in a player object
  const players = { human: humanPlayer, computer: computerPlayer };

  // Set up phase
  const setUp = () => {
    // Automatic placement for computer
    computerPlayer.placeShips();

    // Trigger or prompt for human player's ship placement
    // This could be an event or callback that integrates with the UI
    triggerHumanShipPlacement(humanPlayer);
  };

  return {
    players,
    setUp,
  };
};

export default Game;
