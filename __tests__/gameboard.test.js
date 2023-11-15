import Ship from "../src/ship";
import Gameboard from "../src/gameboard";
import {
  OverlappingShipsError,
  ShipAllocationReachedError,
  ShipTypeAllocationReachedError,
  InvalidShipLengthError,
  InvalidShipTypeError,
  ShipPlacementBoundaryError,
} from "../src/errors";

describe.skip("Gameboard Initialisation", () => {
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
    expect(emptyBoard.ships).toHaveLength(0);
  });
});

describe.skip("Basic Board & Ship Interactions", () => {
  // Test if ship can be placed horizontally on the game board
  test("Ship to be successfully placed horizontally on the game board", () => {
    const newGame = Gameboard(Ship);

    // Place ship horizontally at position A1
    newGame.placeShip("cruiser", "A1", "h");

    // Check to see whether ship was successfully added
    expect(newGame.ships).toHaveLength(1);
    expect(newGame.ships[0].type).toBe("cruiser");
    expect(newGame.ships[0].shipLength).toBe(3);
    expect(newGame.getShipPositions("cruiser")).toEqual(["A1", "B1", "C1"]);
  });

  // Test if ship can be placed vertically on the game board
  test("Ship to be successfully placed vertically on the game board", () => {
    const newGame = Gameboard(Ship);

    // Place ship vertically at position A1
    newGame.placeShip("submarine", "A1", "v");

    // Check to see whether ship was successfully added
    expect(newGame.ships).toHaveLength(1);
    expect(newGame.ships[0].type).toBe("submarine");
    expect(newGame.ships[0].shipLength).toBe(3);
    expect(newGame.getShipPositions("submarine")).toEqual(["A1", "A2", "A3"]);
  });

  // Test if ships can be placed with varying lengths
  test("Ships to be place with different lengths", () => {
    const newGame = Gameboard(Ship);

    // Place a ship of type "battleship" to have length 4 horizontally starting at position A1
    newGame.placeShip("battleship", "A1", "h");

    // Place a ship of type "destroyer" to have length 2 vertically starting at position A2
    newGame.placeShip("destroyer", "A2", "v");

    // Check to see whether ship were successfully added with the correct lengths
    expect(newGame.ships).toHaveLength(2);
    expect(newGame.ships[0].shipLength).toBe(4);
    expect(newGame.ships[1].shipLength).toBe(2);
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
      expect(newGame.ships).toHaveLength(0);
    });

    // Test the bottom boundary
    test("Ships should not overlap the bottom boundary", () => {
      const newGame = Gameboard(Ship);
      expect(() => {
        newGame.placeShip("battleship", "A10", "v");
      }).toThrow(ShipPlacementBoundaryError);
      expect(newGame.ships).toHaveLength(0);
    });

    // Test placing a ship completely outside the board
    test("Ships should not be placed outside of the board", () => {
      const newGame = Gameboard(Ship);
      expect(() => {
        newGame.placeShip("destroyer", "K11", "v");
      }).toThrow(ShipPlacementBoundaryError);
      expect(newGame.ships).toHaveLength(0);
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
    test.skip("Placing too many ships of a particular type throws an error", () => {
      const newGame = Gameboard(Ship);
      newGame.placeShip("battleship", "B1", "h");
      expect(() => {
        newGame.placeShip("battleship", "A1", "h");
      }).toThrow(ShipTypeAllocationReachedError);
    });

    // Test if adding a ship of an invalid type or size throws an error or is handled gracefully
    test.skip("Placing ship of invalid type should throw an error", () => {
      const newGame = Gameboard(Ship);
      expect(() => {
        newGame.placeShip("tugboat", "A1", "h");
      }).toThrow(InvalidShipTypeError);
    });
  });

  // Test a valid placement
  test.skip("Valid placements should be successful", () => {
    const newGame = Gameboard(Ship);
    newGame.placeShip("destroyer", "A1", "h");
    expect(newGame.ships).toHaveLength(1);
    expect(newGame.ships[0].shipPositions).toEqual(["A1", "B1"]);
  });
});

describe.skip("Valid Ship Set Functionality", () => {
  // Test that the gameboard allows the addition of the correct number and types of ships as per the game rules, without any errors
  test("Adding a complete set of ships according to game rules works without errors", () => {
    const newGame = Gameboard();

    // Place ships of varying lengths
    newGame.placeShip(2, "A1", "h");
    newGame.placeShip(3, "B1", "h");
    newGame.placeShip(3, "C1", "h");
    newGame.placeShip(4, "D1", "h");
    newGame.placeShip(5, "E1", "h");

    // Assert the correct number of ships
    expect(newGame.ships).toHaveLength(5);

    // Assert individual ship lengths
    expect(newGame.ships[0].shipLength).toBe(2);
    expect(newGame.ships[1].shipLength).toBe(3);
    expect(newGame.ships[2].shipLength).toBe(3);
    expect(newGame.ships[3].shipLength).toBe(4);
    expect(newGame.ships[4].shipLength).toBe(5);
  });

  // Test that the gameboard accurately reflects the placement of ships, verifying that each ship is in its designated position
  test("Verify gameboard state for correct placement of ships", () => {
    const newGame = Gameboard();

    // Place ships of varying lengths
    newGame.placeShip(4, "A1", "h");
    newGame.placeShip(2, "B1", "h");
    newGame.placeShip(5, "C1", "h");
    newGame.placeShip(3, "D1", "h");
    newGame.placeShip(3, "E1", "h");

    // Assert individual ship's positions
    expect(newGame.ships[0].shipPositions).toEqual(["A1", "A2", "A3", "A4"]);
    expect(newGame.ships[1].shipPositions).toEqual(["B1", "B2"]);
    expect(newGame.ships[2].shipPositions).toEqual([
      "C1",
      "C2",
      "C3",
      "C4",
      "C5",
    ]);
    expect(newGame.ships[3].shipPositions).toEqual(["D1", "D2", "D3"]);
    expect(newGame.ships[4].shipPositions).toEqual(["E1", "E2", "E3"]);
  });

  // Test that the gameboard accurately tracks all placed ships, ensuring that each ship's status are correctly maintained
  test("Verify accurate tracking of all placed ships", () => {
    const newGame = Gameboard();

    // Place ships of varying lengths
    newGame.placeShip(4, "D9", "v"); // Positions to be ["D9", "E9", "F9", "G9"]
    newGame.placeShip(3, "A1", "h"); // Positions to be ["A1", "A2", "A3"]
    newGame.placeShip(2, "C1", "h"); // Positions to be ["C1", "C2"]
    newGame.placeShip(3, "D1", "h"); // Positions to be ["D1", "D2", "D3"]
    newGame.placeShip(5, "B10", "v"); // Positions to be ["B10", "C10", "D10", "E10", "F10"]

    // Register hits for a few of the ships
    newGame.ships[0].hit("D9");
    newGame.ships[3].hit("D3");
    newGame.ships[4].hit("B10");
    newGame.ships[4].hit("D10");

    // Assert individual ships hit counts
    expect(newGame.ships[0].hits).toBe(1);
    expect(newGame.ships[1].hits).toBe(0);
    expect(newGame.ships[2].hits).toBe(0);
    expect(newGame.ships[3].hits).toBe(1);
    expect(newGame.ships[4].hits).toBe(2);

    // Assert individual ships hit positions
    expect(newGame.ships[0].hitPositions).toEqual(["D9"]);
    expect(newGame.ships[3].hitPositions).toEqual(["D3"]);
    expect(newGame.ships[4].hitPositions).toEqual(["B10", "D10"]);
  });
});

describe.skip("Basic Attack Mechanisms", () => {});

describe.skip("Complex Attack Scenarios", () => {});

describe.skip("Game State & Reporting", () => {});
