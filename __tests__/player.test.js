import Gameboard from "../src/gameboard";
import Player from "../src/player";

describe("Initialisation Tests", () => {
  // Test if the Player factory correctly creates a player with a given type (human or computer)
  test("Player factory correctly creates a player with a given type", () => {
    const p1 = Player("human");
    const p2 = Player("computer");

    // Assert that the types have been successfully set
    expect(p1.type).toBe("human");
    expect(p2.type).toBe("computer");
  });

  // Test if the Player has an empty move log upon creation
  test("Player to have empty move log upon creation", () => {
    const p = Player("human");

    // Assert that the move log is returned empty
    expect(p.moveLog).toHaveLength(0);
  });
});
