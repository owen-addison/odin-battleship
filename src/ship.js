import { InvalidShipTypeError } from "./errors";

const Ship = (type) => {
  const setLength = () => {
    switch (type) {
      case "carrier":
        return 5;
      case "battleship":
        return 4;
      case "cruiser":
      case "submarine":
        return 3;
      case "destroyer":
        return 2;
      default:
        throw new InvalidShipTypeError();
    }
  };

  const shipLength = setLength();

  let hits = 0;

  const hit = () => {
    if (hits < shipLength) {
      hits += 1;
    }
  };

  return {
    get type() {
      return type;
    },
    get shipLength() {
      return shipLength;
    },
    get hits() {
      return hits;
    },
    get isSunk() {
      return hits === shipLength;
    },
    hit,
  };
};

export default Ship;
