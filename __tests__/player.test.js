import { InvalidMoveEntryError, RepeatAttackedError } from "../src/errors";
import Game from "../src/game";
import Gameboard from "../src/gameboard";
import Player from "../src/player";
import Ship from "../src/ship";

describe("Initialisation Tests", () => {
  // Test if the Player factory correctly creates a player with a given type (human or computer)
  test("Player factory correctly creates a player with a given type", () => {
    // Create gameboards
    const gb1 = Gameboard(Ship);
    const gb2 = Gameboard(Ship);

    // Create players
    const p1 = Player(gb1, "human");
    const p2 = Player(gb2, "computer");

    // Assert that the types have been successfully set
    expect(p1.type).toBe("human");
    expect(p2.type).toBe("computer");
  });

  // Test if the Player has an empty move log upon creation
  test("Player to have empty move log upon creation", () => {
    // Create gameboard
    const gb = Gameboard(Ship);

    const p = Player(gb, "human");

    // Assert that the move log is returned empty
    expect(p.moveLog).toHaveLength(0);
  });
});

describe("Attack Method Tests", () => {
  // Test if the attack/move method correctly logs a move for both human and computer players
  test("The makeMove method correctly logs a move for both human and computer players", () => {
    // Create a new gameboards
    const gb1 = Gameboard(Ship);
    const gb2 = Gameboard(Ship);

    // Create two players, one human and one computer
    const p1 = Player(gb1, "human");
    const p2 = Player(gb2, "computer");

    // Call the makeMove methods on both players
    p1.makeMove(gb2, "A1");
    p2.makeMove(gb1);

    // Assert that the moveLog for the human player is correct
    expect(p1.moveLog).toEqual(["A1"]);
    // Assert that a move has been made by the computer player
    expect(p2.moveLog).toHaveLength(1);
  });

  // Test is the move method prevents repeating the same move
  test("The makeMove method prevents repeating the same move", () => {
    // Create gameboards for player and opponent
    const gb = Gameboard(Ship);
    const gbOpp = Gameboard(Ship);

    // Create a player
    const p1 = Player(gb, "human");

    // Call the makeMove method
    p1.makeMove(gbOpp, "A1");

    // Assert that repeating the same move returns an error
    expect(() => {
      p1.makeMove(gbOpp, "A1");
    }).toThrow(RepeatAttackedError);
  });

  // For human players, test if the makeMove method correctly handles input coordinates
  test("The makeMove method correctly handles input coordinates from human players", () => {
    // Create gameboards for player and opponent
    const gb = Gameboard(Ship);
    const gbOpp = Gameboard(Ship);

    // Create a player with type "human"
    const p = Player(gb, "human");

    // Call the make move method with lowercase attack coordinates
    p.makeMove(gbOpp, "b1");
    // Call the make move method with uppercase attack coordinates
    p.makeMove(gbOpp, "E2");

    // Assert that the move has been recorded correctly
    expect(p.moveLog).toEqual(["B1", "E2"]);

    // Assert that making a move with invalid input returns an error
    expect(() => {
      p.makeMove(gbOpp, "L11");
    }).toThrow(InvalidMoveEntryError);
  });

  // For computer players, test if the attack method generates a random, legal move
  test("The makeMove method correctly generates a random, legal move for computer players", () => {
    // Create gameboards for player and opponent
    const gb = Gameboard(Ship);
    const gbOpp = Gameboard(Ship);

    // Create a player with type "computer"
    const p = Player(gb, "computer");

    // Call the make move method multiple times
    const moves = new Set();
    for (let i = 0; i < 20; i++) {
      p.makeMove(gbOpp);
      moves.add(p.moveLog[p.moveLog.length - 1]);
    }

    // Assert that a move has been recorded correctly
    expect(moves.size).toBeGreaterThan(1); // Check for randomness

    // Assert that the moveLog length matches the number of moves made
    expect(moves.size).toBe(p.moveLog.length);
  });
});

const initShips = (player) => {
  // Place ships on board
  player.placeShips("battleship", "D7", "v"); // Positions to be ["D7", "D8", "D9", "D10"]
  player.placeShips("submarine", "A1", "h"); // Positions to be ["A1", "B1", "C1"]
  player.placeShips("destroyer", "F8", "h"); // Positions to be ["F8", "G8"]
  player.placeShips("cruiser", "G1", "h"); // Positions to be ["G1", "H1", "I1"]
  player.placeShips("carrier", "J6", "v"); // Positions to be ["J6", "J7", "J8", "J9", "J10"]
};

describe("Integration with Gameboard", () => {
  // Test if attacks from the Player are correctly reflected on the Gameboard
  test("Moves made by Player to be correctly reflected on the Gameboard", () => {
    // Create gameboards for human and computer
    const gbHuman = Gameboard(Ship);
    const gbComp = Gameboard(Ship);

    // Create a player of type human and parse the computer's Gameboard
    const pHuman = Player(gbHuman, "human");
    // Create a player of type computer and parse the human's Gameboard
    const pComp = Player(gbComp, "computer");

    // Call an attack from the human player on the computer's gameboard
    pHuman.makeMove(gbComp, "A3");
    // Call an attack from the computer player on the computer's gameboard
    pComp.makeMove(gbHuman);

    // Assert that the contents of the gameboards' attackLog arrays align with the moveLog arrays of the corresponding players
    expect(pHuman.moveLog).toEqual(gbComp.attackLog.flatMap((row) => row));
    expect(pComp.moveLog).toEqual(gbHuman.attackLog.flatMap((row) => row));
  });

  // Test if the Player receives accurate feedback from the Gameboard after an attack (hit, miss, sunk ship, etc.)
  test("Player to receive accurate feedback after attacks", () => {
    // Create gameboards for two human players
    const gbHuman = Gameboard(Ship);
    const gbHuman2 = Gameboard(Ship);

    // Create a player of type human and parse the other player's Gameboard
    const pHuman = Player(gbHuman, "human");
    // Create a second player of type human and parse the other player's Gameboard
    const pHuman2 = Player(gbHuman2, "human");

    // Place ships on boards
    initShips(pHuman);
    initShips(pHuman2);

    // Assert that an attack on empty positions returns a value of false
    expect(pHuman.makeMove(gbHuman2, "A2").hit).toBe(false);
    // Assert that a successful attack, resulting in a hit, returns a value of true
    expect(pHuman.makeMove(gbHuman2, "A1").hit).toBe(true);

    // Sink the submarine by attack its two remaining positions
    pHuman.makeMove(gbHuman2, "B1");
    pHuman.makeMove(gbHuman2, "C1");

    // Assert that the submarine is sunk
    expect(gbHuman2.isShipSunk("submarine")).toBe(true);
  });
});

describe("Computer Player AI Tests", () => {
  // Test if the computer player does not repeat moves
  test("Computer player to not repeat moves", () => {
    // Create gameboards for human and computer
    const gbHuman = Gameboard(Ship);
    const gbComp = Gameboard(Ship);

    // Create a player of time computer and parse the gameboard
    const pComp = Player(gbComp, "computer");

    // Get a flattened version of the grid array
    const array = gbHuman.grid.flatMap((row) => row);

    // Called the makeMove method on the computer player as many times as there are positions on the gameboard's grid
    for (let i = 0; i < array.length; i++) {
      pComp.makeMove(gbHuman);
    }

    // Assert that all the positions in the computer player's moveLog are unique
    expect(pComp.moveLog.length === new Set(pComp.moveLog).size).toBe(true);
  });

  // Test if the computer player covers all possible moves over an extended series of turns
  test("Computer player to make all possible moves over an extended series of turns", () => {
    // Create gameboards for human and computer
    const gbHuman = Gameboard(Ship);
    const gbComp = Gameboard(Ship);

    // Create a player of time computer and parse the gameboard
    const pComp = Player(gbComp, "computer");

    // Get a flattened version of the grid array
    const array = gbHuman.grid.flatMap((row) => row);

    // Called the makeMove method on the computer player as many times as there are positions on the gameboard's grid
    for (let i = 0; i < array.length; i++) {
      pComp.makeMove(gbHuman);
    }

    // Assert that both the sorted arrays of the gameboard grid and player's moveLog are equal
    expect(pComp.moveLog.sort()).toEqual(array.sort());
  });

  const mockGrid = [
    ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10"],
    ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10"],
    ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10"],
    ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"],
    ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10"],
    ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10"],
    ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10"],
    ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10"],
    ["I1", "I2", "I3", "I4", "I5", "I6", "I7", "I8", "I9", "I10"],
    ["J1", "J2", "J3", "J4", "J5", "J6", "J7", "J8", "J9", "J10"],
  ];

  // Test if the Player factory correctly integrates with external dependencies (like the Gameboard) provided during initialisation
  test("Player factory correctly integrates with Gameboard", () => {
    // Mock the Gameboard factory
    const mockGameboard1 = {
      grid: mockGrid,
      attack: jest.fn(),
    };

    const mockGameboard2 = {
      grid: mockGrid,
      attack: jest.fn(),
    };

    // Create a Player with the mocked Gameboard
    const player = Player(mockGameboard1, "human");

    // Simulate a player action that should interact with the Gameboard and assert that it's been handled correctly
    player.makeMove(mockGameboard2, "A1");
    expect(mockGameboard2.attack).toHaveBeenCalledWith("A1");
  });
});

describe("Ship Placement Tests", () => {
  // Test that placeShips correctly places ships for human players
  test("Human type, placeShips to correctly place ships using user input", () => {
    // Create gameboard for human player
    const humanGb = Gameboard(Ship);

    // Create a human type player
    const pHuman = Player(humanGb, "human");

    // Place a ship on human player's gameboard
    pHuman.placeShips("battleship", "A1", "h");

    // Assert that the ship has been placed correctly
    expect(humanGb.getShipPositions("battleship")).toEqual([
      "A1",
      "B1",
      "C1",
      "D1",
    ]);
  });

  // Test that placeShips correctly places all ships without rule violations for computer players
  test("Computer type, placeShips function to correctly place all ships without rule violations", () => {
    // Create a gameboard for computer player
    const gb = Gameboard(Ship);

    // Create a computer type player
    const pComp = Player(gb, "computer");

    // Assert that no errors are thrown in the automatic placement of ships
    expect(() => {
      pComp.placeShips();
    }).not.toThrow();

    // Assert that ships of all types have been placed
    const expectedShipTypes = [
      "battleship",
      "cruiser",
      "submarine",
      "destroyer",
      "carrier",
    ];
    expectedShipTypes.forEach((type) => {
      expect(gb.getShipPositions(type)).toBeDefined();
      expect(gb.getShipPositions(type).length).toBeGreaterThan(0);
    });

    // Check the total number of ships placed
    expect(Object.keys(gb.ships)).toHaveLength(expectedShipTypes.length);
  });
});
