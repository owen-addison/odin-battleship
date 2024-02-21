import "./styles.css";
import Game from "./game";
import UiManager from "./uiManager";

// Create a new UI manager
const newUiManager = UiManager();

// Initialise console
newUiManager.initConsoleUI();

// Set up the gameboard displays using UiManager
newUiManager.createGameboard("human-gb");
newUiManager.createGameboard("comp-gb");

// Instantiate a new game
const newGame = Game();

// Create a mock array of human player entries
const humanShips = [
  { shipType: "battleship", start: "D7", direction: "v" },
  { shipType: "submarine", start: "A1", direction: "h" },
  { shipType: "destroyer", start: "F8", direction: "h" },
  { shipType: "cruiser", start: "G1", direction: "h" },
  { shipType: "carrier", start: "J6", direction: "v" },
];

// Call the setUp method on the game
newGame.setUp(humanShips);

// Console log the players
console.log(
  `Players: First player of type ${newGame.players.human.type}, second player of type ${newGame.players.computer.type}!`,
);
