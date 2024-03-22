import "./styles.css";
import Game from "./game";
import UiManager from "./uiManager";
import ActionController from "./actionController";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("main-container").style.visibility = "visible";
});

// Create a new UI manager
const newUiManager = UiManager();

// Instantiate a new game
const newGame = Game();

// Create a new action controller
const actController = ActionController(newUiManager, newGame);

// Wait for the game to be setup with ship placements etc.
await actController.handleSetup();

// Once ready, call the playGame method
await actController.playGame();
