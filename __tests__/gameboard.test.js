import Gameboard from "../src/gameboard";

// Test if the game board is initialised with the correct dimensions
test("Gameboard to be created with correct dimensions of 10x10", () => {
  const newGame = Gameboard();

  // Check the number of rows
  expect(newGame.grid).toHaveLength(10);

  // Check the number of columns for each row
  newGame.gird.forEach((row) => {
    expect(row).toHaveLength(10);
  });
});
