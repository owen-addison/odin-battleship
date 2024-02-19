import Gameboard from "./gameboard";

const UiManager = () => {
  const { grid } = Gameboard();

  const createGameboard = (containerID) => {
    const container = document.getElementById(containerID);
    // Create the grid container
    const gridDiv = document.createElement("div");
    gridDiv.className = "grid grid-cols-11 auto-rows-min gap-1 p-6";

    // Add the top-left corner empty cell
    gridDiv.appendChild(document.createElement("div"));

    // Add column headers A-J
    const columns = "ABCDEFGHIJ";
    for (let i = 0; i < columns.length; i++) {
      const header = document.createElement("div");
      header.className = "text-center";
      header.textContent = columns[i];
      gridDiv.appendChild(header);
    }

    // Add row labels and cells
    for (let row = 1; row <= 10; row++) {
      // Row label
      const rowLabel = document.createElement("div");
      rowLabel.className = "text-center";
      rowLabel.textContent = row;
      gridDiv.appendChild(rowLabel);

      // Cells for each row
      for (let col = 0; col < 10; col++) {
        const cell = document.createElement("div");
        cell.className = "w-6 h-6 bg-gray-200"; // Add more classes as needed for styling
        cell.dataset.position = `${columns[col]}${row}`; // Assign position data attribute for identification
        gridDiv.appendChild(cell);
      }
    }

    // Append the grid to the container
    container.appendChild(gridDiv);
  };

  return {
    createGameboard,
  };
};

export default UiManager;
