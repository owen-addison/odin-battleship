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
    p2.makeMove();

    // Assert that the moveLog for the human player is correct
    expect(p1.moveLog).toEqual(["A1"]);
    // Assert that a move has been made by the computer player
    expect(p2.moveLog).toHaveLength(1);
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

const initShips = (gameboard) => {
  // Place ships on board
  gameboard.placeShip("battleship", "D7", "v"); // Positions to be ["D7", "D8", "D9", "D10"]
  gameboard.placeShip("submarine", "A1", "h"); // Positions to be ["A1", "B1", "C1"]
  gameboard.placeShip("destroyer", "F8", "h"); // Positions to be ["F8", "G8"]
  gameboard.placeShip("cruiser", "G1", "h"); // Positions to be ["G1", "H1", "I1"]
  gameboard.placeShip("carrier", "J6", "v"); // Positions to be ["J6", "J7", "J8", "J9", "J10"]
};

describe("Integration with Gameboard", () => {
  // Test if attacks from the Player are correctly reflected on the Gameboard
  test("Moves made by Player to be correctly reflected on the Gameboard", () => {
    // Create gameboards for human and computer
    const gbHuman = Gameboard(Ship);
    const gbComp = Gameboard(Ship);

    // Create a player of type human and parse the computer's Gameboard
    const pHuman = Player("human", gbComp);
    // Create a player of type computer and parse the human's Gameboard
    const pComp = Player("computer", gbHuman);

    // Call an attack from the human player on the computer's gameboard
    pHuman.makeMove("A3");
    // Call an attack from the computer player on the computer's gameboard
    pComp.makeMove();

    // Assert that the contents of the gameboards' attackLog arrays align with the moveLog arrays of the corresponding players
    expect(pHuman.moveLog).toEqual(gbComp.attackLog.flatMap((row) => row));
    expect(pComp.moveLog).toEqual(gbHuman.attackLog.flatMap((row) => row));
  });

  // Test if the Player receives accurate feedback from the Gameboard after an attack (hit, miss, sunk ship, etc.)
  test("Player to receive accurate feedback after attacks", () => {
    // Create gameboards for human and computer
    const gbHuman = Gameboard(Ship);
    const gbComp = Gameboard(Ship);

    // Create a player of type human and parse the computer's Gameboard
    const pHuman = Player("human", gbComp);
    // Create a player of type computer and parse the human's Gameboard
    const pComp = Player("computer", gbHuman);

    // Place ships on boards
    initShips(gbHuman);
    initShips(gbComp);

    // Assert that an attack on empty positions returns a value of false
    expect(pHuman.makeMove("A2")).toBe(false);
    // Assert that a successful attack, resulting in a hit, returns a value of true
    expect(pHuman.makeMove("A1")).toBe(true);

    // Sink the submarine by attack its two remaining positions
    pHuman.makeMove("B1");
    pHuman.makeMove("C1");

    // Assert that the submarine is sunk
    expect(gbComp.isShipSunk("submarine")).toBe(true);
  });
});

describe("Computer Player AI Tests", () => {
  // Test if the computer player does not repeat moves
  test("Computer player to not repeat moves", () => {
    // Create gameboard
    const gb = Gameboard(Ship);

    // Create a player of time computer and parse the gameboard
    const pComp = Player("comp", gb);

    // Called the makeMove method on the computer player as many times as there are positions on the gameboard's grid
    for (let i = 0; i < gb.grid.length; i++) {
      pComp.makeMove();
    }

    // Assert that all the positions in the computer player's moveLog are unique
    expect(pComp.moveLog.length === new Set(pComp.moveLog).size).toBe(true);
  });
});
