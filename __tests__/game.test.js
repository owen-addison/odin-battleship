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

    // Mock the human player's ship placement
    jest.spyOn(game.players.human, "placeShips").mockImplementation(() => {
      // Simulate placing ships on the human's gameboard
      game.players.human.gameboard.placeShip("battleship", "D7", "v");
      game.players.human.gameboard.placeShip("submarine", "A1", "h");
      game.players.human.gameboard.placeShip("destroyer", "F8", "h");
      game.players.human.gameboard.placeShip("cruiser", "G1", "h");
      game.players.human.gameboard.placeShip("carrier", "J6", "v");
    });

    // Call the setUp method
    game.setUp();

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

    // Restore the original placeShips method
    jest.restoreAllMocks();
  });
});
