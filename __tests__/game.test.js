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
});
