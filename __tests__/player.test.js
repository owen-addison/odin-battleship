import Gameboard from "../src/gameboard";
import Player from "../src/player";
import Ship from "../src/ship";

describe("Initialisation Tests", () => {
  // Test if the Player factory correctly creates a player with a given type (human or computer)
  test("Player factory correctly creates a player with a given type", () => {
    const p1 = Player("human");
    const p2 = Player("computer");

    // Assert that the types have been successfully set
    expect(p1.type).toBe("human");
    expect(p2.type).toBe("computer");
  });

  // Test if the Player has an empty move log upon creation
  test("Player to have empty move log upon creation", () => {
    const p = Player("human");

    // Assert that the move log is returned empty
    expect(p.moveLog).toHaveLength(0);
  });
});

describe("Attack Method Tests", () => {
  // Test if the attack/move method correctly logs a move for both human and computer players
  test("The makeMove method correctly logs a move for both human and computer players", () => {
    // Create a new gameboard
    const gb = Gameboard(Ship);

    // Create two players, one human and one computer
    const p1 = Player("human", gb);
    const p2 = Player("computer", gb);

    // Call the makeMove methods on both players
    p1.makeMove("A1");
    p2.makeMove("A2");

    // Assert that the moveLog for both players is correct
    expect(p1.moveLog).toEqual(["A1"]);
    expect(p2.moveLog).toEqual(["A2"]);
  });
});
