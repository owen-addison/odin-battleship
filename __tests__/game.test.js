import Game from "../src/game";
import { InvalidMoveEntryError } from "../src/errors";

// Create a mock array of human player entries
const humanShips = [
  { shipType: "battleship", start: "D7", direction: "v" },
  { shipType: "submarine", start: "A1", direction: "h" },
  { shipType: "destroyer", start: "F8", direction: "h" },
  { shipType: "cruiser", start: "G1", direction: "h" },
  { shipType: "carrier", start: "J6", direction: "v" },
];

describe("Game Initialisation Tests", () => {
  // Test Game Setup: Ensure that the game initialises correctly with two players (human and computer) and two gameboards.
  test("Game to initialise correctly with a human and computer player and their respective gameboards", () => {
    // Create a new game
    const newGame = Game();

    // Assert that the game has two players: one human and one computer
    expect(newGame.players.human).toBeDefined();
    expect(newGame.players.computer).toBeDefined();

    // Optionally, you can also check if each player has a gameboard
    expect(newGame.players.human.gameboard).toBeDefined();
    expect(newGame.players.computer.gameboard).toBeDefined();
  });

  // Test Ship Placement: Verify that ships can be placed correctly on both gameboards during the setup phase.
  test("Ships to be correctly placed on both gameboards", () => {
    // Create a new game
    const game = Game();

    // Call the setUp method
    game.setUp(humanShips);

    // Verify that ships are placed for both players
    expect(game.players.human.gameboard.ships).toBeDefined();
    expect(game.players.computer.gameboard.ships).toBeDefined();

    // Assert that ships of all types have been placed
    const expectedShipTypes = [
      "battleship",
      "cruiser",
      "submarine",
      "destroyer",
      "carrier",
    ];
    expectedShipTypes.forEach((type) => {
      expect(game.players.human.gameboard.getShipPositions(type)).toBeDefined();
      expect(
        game.players.human.gameboard.getShipPositions(type).length,
      ).toBeGreaterThan(0);
      expect(
        game.players.computer.gameboard.getShipPositions(type),
      ).toBeDefined();
      expect(
        game.players.computer.gameboard.getShipPositions(type).length,
      ).toBeGreaterThan(0);
    });
  });
});

describe("Gameplay Tests", () => {
  // Test Turn Alternation: Check that turns alternate correctly between the human and computer players.
  test("Turns alternate correctly between the human and computer players", () => {
    // Create a new game
    const game = Game();

    // Call the setUp method
    game.setUp(humanShips);

    // Assert that starting player is human player
    expect(game.currentPlayer.type).toBe("human");

    // Take turn of current player
    game.takeTurn("A7");

    // Assert that current player is computer
    expect(game.currentPlayer.type).toBe("computer");

    // Take turn
    game.takeTurn("E8");

    // Assert that current player is now human
    expect(game.currentPlayer.type).toBe("human");
  });

  // Test Valid Moves: Ensure that players can make valid moves and that these moves are correctly recorded.
  test("Players to make valid moves and these moves to be correctly recorded", () => {
    // Create a new game
    const game = Game();

    // Call the setUp method
    game.setUp(humanShips);

    // Take a few turns of current player
    game.takeTurn("A7"); // This should be the human player
    game.takeTurn(); // This should be the computer player
    game.takeTurn("B4"); // This should be the human player
    game.takeTurn(); // This should be the computer player

    // Assert that the moves for each player were recorded correctly
    expect(game.players.human.moveLog).toHaveLength(2);
    expect(game.players.computer.moveLog).toHaveLength(2);
    expect(game.players.human.moveLog).toEqual(["A7", "B4"]);
  });

  // Test Invalid Moves: Verify that the game handles invalid moves appropriately (e.g., out-of-bounds attacks, attacking the same position twice).
  test("Invalid moves to be handled appropriately", () => {
    // Create a new game
    const game = Game();

    // Call the setUp method
    game.setUp(humanShips);

    // Assert that an invalid move throws the correct error
    expect(() => {
      game.takeTurn("M1");
    }).toThrow(InvalidMoveEntryError);
  });

  // Test Hit and Miss Feedback: Confirm that players receive accurate feedback for hits and misses.
  test("Players to receive accurate feedback for hits and misses", () => {
    // Create a new game
    const game = Game();

    // Call the setUp method
    game.setUp(humanShips);

    // Take a turn for human player
    game.takeTurn("A1");

    // Assert that a verified hit returns true
    expect(() => {
      game.takeTurn("A1");
    }).toBe(true);
    // Assert that a verified miss returns false
    expect(() => {
      game.takeTurn("A4");
    }).toBe(true);
  });
});
