import Ship from "../src/ship";
import {
  OverlappingShipsError,
  ShipAllocationReachedError,
  ShipTypeAllocationReachedError,
  InvalidShipLengthError,
  InvalidShipTypeError,
} from "../src/errors";

// Test for ship length
test("Ship to have correct length", () => {
  const ship1 = Ship("carrier");
  const ship2 = Ship("battleship");
  const ship3 = Ship("cruiser");
  const ship4 = Ship("submarine");
  const ship5 = Ship("destroyer");

  expect(ship1.shipLength).toBe(5);
  expect(ship2.shipLength).toBe(4);
  expect(ship3.shipLength).toBe(3);
  expect(ship4.shipLength).toBe(3);
  expect(ship5.shipLength).toBe(2);
});

// Test for incorrect ship type and proper error handling
test("Invalid ship type to throw error", () => {
  expect(() => {
    Ship("tugboat");
  }).toThrow(InvalidShipTypeError);
});

// Test for initial hit count
test("Newly created ship to have zero hits", () => {
  const ship = Ship("carrier");

  expect(ship.hits).toBe(0);
});

// Test for hit count not exceeding ship length
test("Number of hits does not exceed ship's length", () => {
  const ship = Ship("submarine");

  for (let i = 0; i < ship.shipLength + 2; i++) {
    ship.hit();
  }

  expect(ship.hits).toBe(ship.shipLength);
});

// Test for hit positions
test.skip("Specific positions of ship are recorded correctly", () => {
  // Create a ship of length 3, starting from position A1 and running horizontally
  const ship = Ship(3, "A1", "h");

  expect(ship.positions).toEqual(["A1", "B1", "C1"]); // Assuming that columns and rows are denoted letters and number respectively
});

// Test for isSunk with partial hits
test("Ship with partial hit DOES NOT register as sunk", () => {
  const ship = Ship("destroyer");

  ship.hit();

  expect(ship.hits).toBe(1);
  expect(ship.isSunk()).toBe(false);
});

// Test for isSunk with full hits
test("Ship with full hits DOES register as sunk", () => {
  const ship = Ship("cruiser");

  for (let i = 0; i < ship.shipLength; i++) {
    ship.hit();
  }

  expect(ship.isSunk()).toBe(true);
});
