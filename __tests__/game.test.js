import Game from "../src/game";

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

    // Create a mock array of human player entries
    const humanShips = [
      { shipType: "battleship", start: "D7", direction: "v" },
      { shipType: "submarine", start: "A1", direction: "h" },
      { shipType: "destroyer", start: "F8", direction: "h" },
      { shipType: "cruiser", start: "G1", direction: "h" },
      { shipType: "carrier", start: "J6", direction: "v" },
    ];

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

    // Create a mock array of human player entries
    const humanShips = [
      { shipType: "battleship", start: "D7", direction: "v" },
      { shipType: "submarine", start: "A1", direction: "h" },
      { shipType: "destroyer", start: "F8", direction: "h" },
      { shipType: "cruiser", start: "G1", direction: "h" },
      { shipType: "carrier", start: "J6", direction: "v" },
    ];

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
});
