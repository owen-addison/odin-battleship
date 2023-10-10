import Ship from "../src/ship";

// Test for ship length
test("Ship to have correct length", () => {
  const ship = Ship(3);

  expect(ship.length).toBe(1);
});

// Test for initial hit count

// Test for hit positions

// Test for isSunk with partial hits

// Test for isSunk with full hits
