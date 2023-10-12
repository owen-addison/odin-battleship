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

// Test for hit count not exceeding ship length
test("Number of hits does not exceed ship's length", () => {
  const ship = Ship(2);

  for (let i = 0; i < ship.length + 2; i++) {
    ship.hit();
    console.log(`hit number ${i + 1}`);
  }

  expect(ship.hits).toBe(ship.length);
});

// Test for hit positions

// Test for isSunk with partial hits

// Test for isSunk with full hits
