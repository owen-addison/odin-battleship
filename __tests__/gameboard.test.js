import Gameboard from "../src/gameboard";

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

describe("Boundary & Error Cases for Ship Placement", () => {});

describe("Valid Ship Set Functionality", () => {});

describe("Basic Attack Mechanisms", () => {});

describe("Complex Attack Scenarios", () => {});

describe("Game State & Reporting", () => {});
