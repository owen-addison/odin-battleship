import { InvalidMoveEntryError, RepeatAttackedError } from "../src/errors";
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

  // Test is the move method prevents repeating the same move
  test("The makeMove method prevents repeating the same move", () => {
    // Create a new gameboard
    const gb = Gameboard(Ship);

    // Create a player
    const p1 = Player("human", gb);

    // Call the makeMove method
    p1.makeMove("A1");

    // Assert that repeating the same move returns an error
    expect(() => {
      p1.makeMove("A1");
    }).toThrow(RepeatAttackedError);
  });

  // For human players, test if the makeMove method correctly handles input coordinates
  test("The makeMove method correctly handles input coordinates from human players", () => {
    // Create a new gameboard
    const gb = Gameboard(Ship);

    // Create a player with type "human"
    const p = Player("human", gb);

    // Call the make move method with lowercase attack coordinates
    p.makeMove("b1");
    // Call the make move method with uppercase attack coordinates
    p.makeMove("E2");

    // Assert that the move has been recorded correctly
    expect(p.moveLog).toEqual(["B1", "E2"]);

    // Assert that making a move with invalid input returns an error
    expect(() => {
      p.makeMove("L11");
    }).toThrow(InvalidMoveEntryError);
  });

  // For computer players, test if the attack method generates a random, legal move
  test("The makeMove method correctly generates a random, legal move for computer players", () => {
    // Create a new gameboard
    const gb = Gameboard(Ship);

    // Create a player with type "computer"
    const p = Player("computer", gb);

    // Call the make move method multiple times
    const moves = new Set();
    for (let i = 0; i < 20; i++) {
      p.makeMove();
      moves.add(p.moveLog[p.moveLog.length - 1]);
    }

    // Assert that a move has been recorded correctly
    expect(moves.size).toBeGreaterThan(1); // Check for randomness

    // Assert that the moveLog length matches the number of moves made
    expect(moves.size).toBe(p.moveLog.length);
  });
});
