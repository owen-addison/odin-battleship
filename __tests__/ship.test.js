import Ship from "../src/ship";

// Test for ship length
test("Ship to have correct length", () => {
  const ship = Ship(3);

  expect(ship.length).toHaveLength(1);
});

// Test for initial hit count
test("Newly created ship to have zero hits", () => {
  const ship = Ship(2);

  expect(ship.hits).toBe(0);
});

// Test for hit positions

// Test for isSunk with partial hits

// Test for isSunk with full hits
