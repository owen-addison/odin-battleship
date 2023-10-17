import Ship from "../src/ship";

// Test for ship length
test("Ship to have correct length", () => {
  const ship = Ship(3);

  expect(ship.shipLength).toBe(3);
});

// Test for initial hit count
test("Newly created ship to have zero hits", () => {
  const ship = Ship(2);

  expect(ship.hits).toBe(0);
});

// Test for hit count not exceeding ship length
test("Number of hits does not exceed ship's length", () => {
  const ship = Ship(2);

  for (let i = 0; i < ship.shipLength + 2; i++) {
    ship.hit();
    console.log(`hit number ${i + 1}`);
  }

  expect(ship.hits).toBe(ship.shipLength);
});

// Test for hit positions
test("Specific positions of ship are recorded correctly", () => {
  // Create a ship of length 3, starting from position A1 and running horizontally
  const ship = Ship(3, "A1", "h");

  expect(ship.positions).toBe(["A1", "B1", "C1"]); // Assuming that columns and rows are denoted letters and number respectively
});

// Test for isSunk with partial hits
test("Ship with partial hit DOES NOT register as sunk", () => {
  const ship = Ship(2);

  ship.hit();

  expect(ship.isSunk()).toBe(false);
});

// Test for isSunk with full hits
test("Ship with full hits DOES register as sunk", () => {
  const ship = Ship(3);

  for (let i = 0; i < ship.shipLength; i++) {
    ship.hit();
    console.log(`hit number ${i + 1}`);
  }

  expect(ship.isSunk()).toBe(true);
});
