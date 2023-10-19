import Gameboard from "../src/gameboard";
import {
  OverlappingShipsError,
  ShipAllocationReachedError,
  ShipTypeAllocationReachedError,
  InvalidShipLengthError,
} from "../src/errors";

describe("Gameboard Initialisation", () => {
  // Test if the game board is initialised with the correct dimensions
  test("Gameboard to be created with correct dimensions of 10x10", () => {
    const newGame = Gameboard();

    // Check the number of rows
    expect(newGame.grid).toHaveLength(10);

    // Check the number of columns for each row
    newGame.grid.forEach((row) => {
      expect(row).toHaveLength(10);
    });
  });

  // Test if the game board is empty (no ships) on initialisation
  test("Gameboard to be created empty without any ships", () => {
    const emptyBoard = Gameboard();

    // Check if the ships array is empty
    expect(emptyBoard.ships).toHaveLength(0);
  });
});

describe("Basic Board & Ship Interactions", () => {
  // Test if ship can be placed horizontally on the game board
  test("Ship to be successfully placed horizontally on the game board", () => {
    const newGame = Gameboard();

    // Place ship horizontally at position A1
    newGame.placeShip(3, "A1", "h");

    // Check to see whether ship was successfully added
    expect(newGame.ships).toHaveLength(1);
    expect(newGame.ships[0].shipPositions).toEqual(["A1", "B1", "C1"]);
  });

  // Test if ship can be placed vertically on the game board
  test("Ship to be successfully placed vertically on the game board", () => {
    const newGame = Gameboard();

    // Place ship vertically at position A1
    newGame.placeShip(3, "A1", "v");

    // Check to see whether ship was successfully added
    expect(newGame.ships).toHaveLength(1);
    expect(newGame.ships[0].shipPositions).toEqual(["A1", "A2", "A3"]);
  });

  // Test if ships can be placed with varying lengths
  test("Ships to be place with different lengths", () => {
    const newGame = Gameboard();

    // Place a ship of length 4 horizontally starting at position A1
    newGame.placeShip(4, "A1", "h");

    // Place a ship of length 2 vertically starting at position A2
    newGame.placeShip(2, "A2", "v");

    // Check to see whether ship were successfully added with the correct lengths
    expect(newGame.ships).toHaveLength(2);
    expect(newGame.ships[0].shipLength).toBe(4);
    expect(newGame.ships[1].shipLength).toBe(2);
  });
});

describe("Boundary & Error Cases for Ship Placement", () => {
  // Test the boundaries: try to place a ship or make an attack just inside and just
  // outside the board boundaries to ensure the game board doesn't accept invalid inputs
  describe("Test the boundaries", () => {
    // Test the right boundary
    test("Ships should not overlap the right boundary", () => {
      const newGame = Gameboard();
      newGame.placeShip(3, "K1", "h");
      expect(newGame.ships).toHaveLength(0);
    });

    // Test the bottom boundary
    test("Ships should not overlap the bottom boundary", () => {
      const newGame = Gameboard();
      newGame.placeShip(4, "A10", "v");
      expect(newGame.ships).toHaveLength(0);
    });

    // Test placing a ship completely outside the board
    test("Ships should not be placed outside of the board", () => {
      const newGame = Gameboard();
      newGame.placeShip(2, "B11", "h");
      expect(newGame.ships).toHaveLength(0);
    });

    // Test a valid placement
    test("Valid placements should be successful", () => {
      const newGame = Gameboard();
      newGame.placeShip(2, "A1", "h");
      expect(newGame.ships).toHaveLength(1);
      expect(newGame.ships[0].shipPositions).toEqual(["A1", "B1"]);
    });
  });

  // Test error handling
  describe("Test errors are handling correctly", () => {
    // Test if overlapping ships (placing one ship on top of another) throws an error
    test("Placing a ship on top of another throws an error", () => {
      const newGame = Gameboard();
      newGame.placeShip(2, "A1", "h");
      expect(() => {
        newGame.placeShip(3, "A1", "v");
      }).toThrow(OverlappingShipsError);
    });

    // Test if adding more ships than allowed (e.g., sixth ship) throws an error or is handled gracefully
    test("Placing more ships than allowed throws an error", () => {
      const newGame = Gameboard();
      newGame.placeShip(2, "A1", "h");
      newGame.placeShip(3, "B1", "h");
      newGame.placeShip(3, "C1", "h");
      newGame.placeShip(4, "D1", "h");
      newGame.placeShip(5, "E1", "h");
      expect(newGame.placeShip(2, "A1", "h")).toThrow(
        ShipAllocationReachedError,
      );
    });

    // Test if adding duplicates of a ship type when it's not allowed (e.g., two battleships when only one is allowed) throws an error or is handled gracefully
    test("Placing too many ships of a particular length throws an error", () => {
      const newGame = Gameboard();
      newGame.placeShip(3, "B1", "h");
      newGame.placeShip(3, "C1", "h");
      expect(newGame.placeShip(3, "A1", "h")).toThrow(
        ShipTypeAllocationReachedError,
      );
    });

    // Test if adding a ship of an invalid type or size throws an error or is handled gracefully
    test("Placing ship of invalid length should throw an error", () => {
      const newGame = Gameboard();
      expect(newGame.placeShip(6, "A1", "h")).toThrow(InvalidShipLengthError);
    });
  });
});

describe("Valid Ship Set Functionality", () => {});

describe("Basic Attack Mechanisms", () => {});

describe("Complex Attack Scenarios", () => {});

describe("Game State & Reporting", () => {});
