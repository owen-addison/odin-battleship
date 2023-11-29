import Ship from "../src/ship";
import Gameboard from "../src/gameboard";
import {
  OverlappingShipsError,
  ShipAllocationReachedError,
  ShipTypeAllocationReachedError,
  InvalidShipLengthError,
  InvalidShipTypeError,
  ShipPlacementBoundaryError,
  RepeatAttackedError,
} from "../src/errors";

describe("Gameboard Initialisation", () => {
  // Test if the game board is initialised with the correct dimensions
  test("Gameboard to be created with correct dimensions of 10x10", () => {
    const newGame = Gameboard(Ship);

    // Check the number of rows
    expect(newGame.grid).toHaveLength(10);

    // Check the number of columns for each row
    newGame.grid.forEach((row) => {
      expect(row).toHaveLength(10);
    });
  });

  // Test if the game board is empty (no ships) on initialisation
  test("Gameboard to be created empty without any ships", () => {
    const emptyBoard = Gameboard(Ship);

    // Check if the ships array is empty
    expect(Object.keys(emptyBoard.ships)).toHaveLength(0);
  });
});

describe("Basic Board & Ship Interactions", () => {
  // Test if ship can be placed horizontally on the game board
  test("Ship to be successfully placed horizontally on the game board", () => {
    const newGame = Gameboard(Ship);

    // Place ship horizontally at position A1
    newGame.placeShip("cruiser", "A1", "h");

    // Check to see whether ship was successfully added
    expect(Object.keys(newGame.ships)).toHaveLength(1);
    expect(newGame.getShip("cruiser").type).toBe("cruiser");
    expect(newGame.getShip("cruiser").shipLength).toBe(3);
    expect(newGame.getShipPositions("cruiser")).toEqual(["A1", "B1", "C1"]);
  });

  // Test if ship can be placed vertically on the game board
  test("Ship to be successfully placed vertically on the game board", () => {
    const newGame = Gameboard(Ship);

    // Place ship vertically at position A1
    newGame.placeShip("submarine", "A1", "v");

    // Check to see whether ship was successfully added
    expect(Object.keys(newGame.ships)).toHaveLength(1);
    expect(newGame.getShip("submarine").type).toBe("submarine");
    expect(newGame.getShip("submarine").shipLength).toBe(3);
    expect(newGame.getShipPositions("submarine")).toEqual(["A1", "A2", "A3"]);
  });

  // Test if ships can be placed with varying lengths
  test("Ships to be place with different lengths", () => {
    const newGame = Gameboard(Ship);

    // Place a ship of type "battleship" to have length 4 horizontally starting at position A1
    newGame.placeShip("battleship", "A1", "h");

    // Place a ship of type "destroyer" to have length 2 vertically starting at position A2
    newGame.placeShip("destroyer", "B2", "v");

    // Check to see whether ship were successfully added with the correct lengths
    expect(Object.keys(newGame.ships)).toHaveLength(2);
    expect(newGame.getShip("battleship").shipLength).toBe(4);
    expect(newGame.getShip("destroyer").shipLength).toBe(2);
    expect(newGame.getShipPositions("battleship").length).toBe(4);
    expect(newGame.getShipPositions("destroyer").length).toBe(2);
  });
});

describe("Ship Placement Validation", () => {
  // Test the boundaries and error handling in the ship placement
  describe("Boundary & Error Handling", () => {
    // Test the right boundary
    test("Ships should not overlap the right boundary", () => {
      const newGame = Gameboard(Ship);
      expect(() => {
        newGame.placeShip("cruiser", "J1", "h");
      }).toThrow(ShipPlacementBoundaryError);
      expect(Object.keys(newGame.ships)).toHaveLength(0);
    });

    // Test the bottom boundary
    test("Ships should not overlap the bottom boundary", () => {
      const newGame = Gameboard(Ship);
      expect(() => {
        newGame.placeShip("battleship", "A10", "v");
      }).toThrow(ShipPlacementBoundaryError);
      expect(Object.keys(newGame.ships)).toHaveLength(0);
    });

    // Test placing a ship completely outside the board
    test("Ships should not be placed outside of the board", () => {
      const newGame = Gameboard(Ship);
      expect(() => {
        newGame.placeShip("destroyer", "K11", "v");
      }).toThrow(ShipPlacementBoundaryError);
      expect(Object.keys(newGame.ships)).toHaveLength(0);
    });

    // Test if overlapping ships (placing one ship on top of another) throws an error
    test("Placing a ship on top of another throws an error", () => {
      const newGame = Gameboard(Ship);
      newGame.placeShip("destroyer", "A1", "h");
      expect(() => {
        newGame.placeShip("submarine", "A1", "v");
      }).toThrow(OverlappingShipsError);
    });

    // // Test if adding more ships than allowed (e.g., sixth ship) throws an error or is handled gracefully
    // test.skip("Placing more ships than allowed throws an error", () => {
    //   const newGame = Gameboard();
    //   newGame.placeShip(2, "A1", "h");
    //   newGame.placeShip(3, "B1", "h");
    //   newGame.placeShip(3, "C1", "h");
    //   newGame.placeShip(4, "D1", "h");
    //   newGame.placeShip(5, "E1", "h");
    //   expect(() => {
    //     newGame.placeShip(2, "A1", "h");
    //   }).toThrow(ShipAllocationReachedError);
    // });

    // Test if adding duplicates of a ship type when it's not allowed (e.g., two battleships when only one is allowed) throws an error or is handled gracefully
    test("Placing too many ships of a particular type throws an error", () => {
      const newGame = Gameboard(Ship);
      newGame.placeShip("battleship", "B1", "h");
      expect(() => {
        newGame.placeShip("battleship", "A1", "h");
      }).toThrow(ShipTypeAllocationReachedError);
    });

    // Test if adding a ship of an invalid type or size throws an error or is handled gracefully
    test("Placing ship of invalid type should throw an error", () => {
      const newGame = Gameboard(Ship);
      expect(() => {
        newGame.placeShip("tugboat", "A1", "h");
      }).toThrow(InvalidShipTypeError);
    });
  });

  // Test a valid placement
  test("Valid placements should be successful", () => {
    const newGame = Gameboard(Ship);
    newGame.placeShip("destroyer", "A1", "h");
    expect(Object.keys(newGame.ships)).toHaveLength(1);
    expect(newGame.getShipPositions("destroyer")).toEqual(["A1", "B1"]);
  });
});

describe("Valid Ship Set Functionality", () => {
  // Test that the gameboard allows the addition of the correct number and types of ships as per the game rules, without any errors
  test("Adding a complete set of ships according to game rules works without errors", () => {
    const newGame = Gameboard(Ship);

    // Place ships of varying lengths
    newGame.placeShip("destroyer", "A1", "h");
    newGame.placeShip("cruiser", "A2", "h");
    newGame.placeShip("submarine", "A3", "h");
    newGame.placeShip("battleship", "A4", "h");
    newGame.placeShip("carrier", "A5", "h");

    // Assert the correct number of ships
    expect(Object.keys(newGame.ships)).toHaveLength(5);

    // Assert individual ship lengths
    expect(newGame.getShip("destroyer").shipLength).toBe(2);
    expect(newGame.getShip("cruiser").shipLength).toBe(3);
    expect(newGame.getShip("submarine").shipLength).toBe(3);
    expect(newGame.getShip("battleship").shipLength).toBe(4);
    expect(newGame.getShip("carrier").shipLength).toBe(5);
    expect(newGame.getShipPositions("destroyer")).toHaveLength(2);
    expect(newGame.getShipPositions("cruiser")).toHaveLength(3);
    expect(newGame.getShipPositions("submarine")).toHaveLength(3);
    expect(newGame.getShipPositions("battleship")).toHaveLength(4);
    expect(newGame.getShipPositions("carrier")).toHaveLength(5);
  });

  // Test that the gameboard accurately reflects the placement of ships, verifying that each ship is in its designated position
  test("Verify gameboard state for correct placement of ships", () => {
    const newGame = Gameboard(Ship);

    // Place ships of varying lengths
    newGame.placeShip("battleship", "A1", "h");
    newGame.placeShip("destroyer", "B2", "h");
    newGame.placeShip("carrier", "C3", "h");
    newGame.placeShip("submarine", "H1", "h");
    newGame.placeShip("cruiser", "A6", "h");

    // Assert individual ship's positions
    expect(newGame.getShipPositions("battleship")).toEqual([
      "A1",
      "B1",
      "C1",
      "D1",
    ]);
    expect(newGame.getShipPositions("destroyer")).toEqual(["B2", "C2"]);
    expect(newGame.getShipPositions("carrier")).toEqual([
      "C3",
      "D3",
      "E3",
      "F3",
      "G3",
    ]);
    expect(newGame.getShipPositions("submarine")).toEqual(["H1", "I1", "J1"]);
    expect(newGame.getShipPositions("cruiser")).toEqual(["A6", "B6", "C6"]);
  });

  // Test that the gameboard accurately tracks all placed ships, ensuring that each ship's status are correctly maintained
  test("Verify accurate tracking of all placed ships", () => {
    const newGame = Gameboard(Ship);

    // Place ships of varying lengths
    newGame.placeShip("battleship", "D7", "v"); // Positions to be ["D7", "D8", "D9", "D10"]
    newGame.placeShip("submarine", "A1", "h"); // Positions to be ["A1", "B1", "C1"]
    newGame.placeShip("destroyer", "F8", "h"); // Positions to be ["F8", "G8"]
    newGame.placeShip("cruiser", "G1", "h"); // Positions to be ["G1", "H1", "I1"]
    newGame.placeShip("carrier", "J6", "v"); // Positions to be ["J6", "J7", "J8", "J9", "J10"]

    // Attack and register hits for a few of the ships
    newGame.attack("D9");
    newGame.attack("G1");
    newGame.attack("J7");
    newGame.attack("J8");

    // Assert individual ships hit counts
    expect(newGame.getShip("battleship").hits).toBe(1);
    expect(newGame.getShip("submarine").hits).toBe(0);
    expect(newGame.getShip("destroyer").hits).toBe(0);
    expect(newGame.getShip("cruiser").hits).toBe(1);
    expect(newGame.getShip("carrier").hits).toBe(2);

    // Assert individual ships hit positions
    expect(newGame.getHitPositions("battleship")).toEqual(["D9"]);
    expect(newGame.getHitPositions("cruiser")).toEqual(["G1"]);
    expect(newGame.getHitPositions("carrier")).toEqual(["J7", "J8"]);
  });
});

describe("Basic Attack Mechanisms", () => {
  // Test that an attack on an empty position correctly registers as a miss
  test("Attack on an empty position correctly registers as a miss", () => {
    const newGame = Gameboard(Ship);

    // Place ships on board
    newGame.placeShip("battleship", "D7", "v"); // Positions to be ["D7", "D8", "D9", "D10"]
    newGame.placeShip("submarine", "A1", "h"); // Positions to be ["A1", "B1", "C1"]
    newGame.placeShip("destroyer", "F8", "h"); // Positions to be ["F8", "G8"]
    newGame.placeShip("cruiser", "G1", "h"); // Positions to be ["G1", "H1", "I1"]
    newGame.placeShip("carrier", "J6", "v"); // Positions to be ["J6", "J7", "J8", "J9", "J10"]

    // Assert that an attack on an empty position registers as a miss
    expect(newGame.attack("A10")).toBe(false);
    Object.keys(newGame.ships).forEach((shipType) => {
      expect(newGame.getHitPositions(shipType)).toHaveLength(0);
    });
  });

  // Test that an attack on a populated position correctly registers as a hit
  test("Attack on a ship's position correctly registers as a hit", () => {
    const newGame = Gameboard(Ship);

    // Place ships on board
    newGame.placeShip("battleship", "D7", "v"); // Positions to be ["D7", "D8", "D9", "D10"]
    newGame.placeShip("submarine", "A1", "h"); // Positions to be ["A1", "B1", "C1"]
    newGame.placeShip("destroyer", "F8", "h"); // Positions to be ["F8", "G8"]
    newGame.placeShip("cruiser", "G1", "h"); // Positions to be ["G1", "H1", "I1"]
    newGame.placeShip("carrier", "J6", "v"); // Positions to be ["J6", "J7", "J8", "J9", "J10"]

    // Attack one of the ships and store the feedback
    const attackFeedback = newGame.attack("A1");

    // Assert that the hit has been correctly registered
    expect(attackFeedback).toBe(true);
    expect(newGame.getHitPositions("submarine")).toEqual(["A1"]);
  });
});

describe("Complex Attack Scenarios", () => {
  // Test that an attack on an already attacked position (hit or miss) throws an error or is handed gracefully
  test("Attack on an already attacked position throws an error", () => {
    const newGame = Gameboard(Ship);

    // Place ships on board
    newGame.placeShip("battleship", "D7", "v"); // Positions to be ["D7", "D8", "D9", "D10"]
    newGame.placeShip("submarine", "A1", "h"); // Positions to be ["A1", "B1", "C1"]
    newGame.placeShip("destroyer", "F8", "h"); // Positions to be ["F8", "G8"]
    newGame.placeShip("cruiser", "G1", "h"); // Positions to be ["G1", "H1", "I1"]
    newGame.placeShip("carrier", "J6", "v"); // Positions to be ["J6", "J7", "J8", "J9", "J10"]

    // Assert that attacking the same position throws an error
    expect(() => {
      // Attack and miss, twice
      newGame.attack("A2");
      newGame.attack("A2");
    }).toThrow(RepeatAttackedError);
    expect(() => {
      // Attack and hit, twice
      newGame.attack("A1");
      newGame.attack("A1");
    }).toThrow(RepeatAttackedError);
  });

  // Test if a ship is marked as "sunk" when all of its positions have been hit
  test("Ship to be marked as 'sunk' once all of its positions have been hit", () => {
    const newGame = Gameboard(Ship);

    // Place ships on board
    newGame.placeShip("battleship", "D7", "v"); // Positions to be ["D7", "D8", "D9", "D10"]
    newGame.placeShip("submarine", "A1", "h"); // Positions to be ["A1", "B1", "C1"]
    newGame.placeShip("destroyer", "F8", "h"); // Positions to be ["F8", "G8"]
    newGame.placeShip("cruiser", "G1", "h"); // Positions to be ["G1", "H1", "I1"]
    newGame.placeShip("carrier", "J6", "v"); // Positions to be ["J6", "J7", "J8", "J9", "J10"]

    // Assert that the destroyer is not yet sunk
    expect(newGame.getShip("destroyer").isSunk).toBe(false);

    // Attack the destroyer just once
    newGame.attack("F8");
    // Assert that the destroyer is not yet sunk
    expect(newGame.getShip("destroyer").isSunk).toBe(false);

    // Attack the destroyer again
    newGame.attack("G8");
    // Assert that the destroyer is sunk
    expect(newGame.getShip("destroyer").isSunk).toBe(true);
  });

  // Test that the gameboard correctly identifies when all ships have been sunk
  test("Gameboard to correctly identify when all ships have been sunk", () => {
    const newGame = Gameboard(Ship);

    // Place ships on board
    newGame.placeShip("battleship", "D7", "v"); // Positions to be ["D7", "D8", "D9", "D10"]
    newGame.placeShip("submarine", "A1", "h"); // Positions to be ["A1", "B1", "C1"]
    newGame.placeShip("destroyer", "F8", "h"); // Positions to be ["F8", "G8"]
    newGame.placeShip("cruiser", "G1", "h"); // Positions to be ["G1", "H1", "I1"]
    newGame.placeShip("carrier", "J6", "v"); // Positions to be ["J6", "J7", "J8", "J9", "J10"]

    // Assert that the initial state is that the ships are not all sunk
    expect(newGame.checkAllShipsSunk()).toBe(false);

    // Sink the fleet by iterating over all the ships on the gameboard
    Object.entries(newGame.ships).forEach(([shipType, ship]) => {
      newGame.getShipPositions(shipType).forEach((position) => {
        newGame.attack(position);
      });
    });

    // Assert that the gameboard now reports all the ships to be sunk
    expect(newGame.checkAllShipsSunk()).toBe(true);
  });
});

describe("Game State & Reporting", () => {
  // Test that the gameboard can report how many ships are afloat
  test("Gameboard to correctly report how many ships are afloat", () => {
    const newGame = Gameboard(Ship);

    // Place ships on board
    newGame.placeShip("battleship", "D7", "v"); // Positions to be ["D7", "D8", "D9", "D10"]
    newGame.placeShip("submarine", "A1", "h"); // Positions to be ["A1", "B1", "C1"]
    newGame.placeShip("destroyer", "F8", "h"); // Positions to be ["F8", "G8"]
    newGame.placeShip("cruiser", "G1", "h"); // Positions to be ["G1", "H1", "I1"]
    newGame.placeShip("carrier", "J6", "v"); // Positions to be ["J6", "J7", "J8", "J9", "J10"]

    // Assert that all ships are afloat
    // Should return an array whose first element is the number afloat and the second is an array of ships afloat
    expect(newGame.shipReport()).toEqual([
      5,
      ["battleship", "submarine", "destroyer", "cruiser", "carrier"],
    ]);

    // Sink one of the ships by getting its positions and attack each one
    const shipPositions = newGame.getShipPositions("battleship");
    shipPositions.forEach((position) => {
      newGame.attack(position);
    });

    // Assert that 4 ships are afloat
    // Should return an array whose first element is the number afloat and the second is an array of ships afloat
    expect(newGame.shipReport()).toEqual([
      4,
      ["submarine", "destroyer", "cruiser", "carrier"],
    ]);
  });

  // Test that the gameboard can provide a count of hits and missed attacks
  test("Gameboard to correctly provide a count of hits and missed attacks", () => {
    const newGame = Gameboard(Ship);

    // Place ships on board
    newGame.placeShip("battleship", "D7", "v"); // Positions to be ["D7", "D8", "D9", "D10"]
    newGame.placeShip("submarine", "A1", "h"); // Positions to be ["A1", "B1", "C1"]
    newGame.placeShip("destroyer", "F8", "h"); // Positions to be ["F8", "G8"]
    newGame.placeShip("cruiser", "G1", "h"); // Positions to be ["G1", "H1", "I1"]
    newGame.placeShip("carrier", "J6", "v"); // Positions to be ["J6", "J7", "J8", "J9", "J10"]

    // Register some hits
    newGame.attack("D7");
    newGame.attack("D10");
    newGame.attack("G8");
    newGame.attack("J6");
    newGame.attack("J7");

    // Register some misses
    newGame.attack("A3");
    newGame.attack("H4");
    newGame.attack("C8");
    newGame.attack("C9");

    // Assert that the array of hits is correct
    expect(newGame.attackLog[0]).toEqual(["D7", "D10", "G8", "J6", "J7"]);

    // Assert that that array of misses is correct
    expect(newGame.attackLog[1]).toEqual(["A3", "H4", "C8", "C9"]);
  });
});
