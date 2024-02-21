import Gameboard from "./gameboard";

const updateOutput = (message, output) => {
  // Append new message
  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  output.appendChild(messageElement);

  // Scroll to the bottom of the output container
  // eslint-disable-next-line no-param-reassign
  output.scrollTop = output.scrollHeight;
};

const executeCommand = (command, output) => {
  // Process the command
  // For example, if command is "move A1", call the relevant game function
  console.log(`Executing command: ${command}`); // Placeholder for actual command processing

  // Update the console output
  updateOutput(`> ${command}`, output);

  // Clear the input
  document.querySelector(".console-input").value = "";
};

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

  const initConsoleUI = () => {
    const consoleContainer = document.getElementById("console");
    const input = document.createElement("input");
    input.type = "text";
    input.setAttribute("id", "console-input");
    input.className = "p-1 bg-gray-400"; // TailwindCSS classes
    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    submitButton.setAttribute("id", "console-submit");
    submitButton.className = "p-2 bg-gray-800"; // TailwindCSS classes
    const output = document.createElement("div");
    output.setAttribute("id", "console-output");
    output.className = "p-1 bg-gray-200"; // TailwindCSS classes

    // Append elements to the console container
    consoleContainer.appendChild(input);
    consoleContainer.appendChild(submitButton);
    consoleContainer.appendChild(output);

    // Setup event listeners
    submitButton.addEventListener("click", () =>
      executeCommand(input.value, output),
    );
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        executeCommand(input.value, output);
      }
    });
  };

  return {
    createGameboard,
    initConsoleUI,
  };
};

export default UiManager;
