const tw = (strings, ...values) => String.raw({ raw: strings }, ...values);

const instructionClr = "text-lime-700";
const guideClr = "text-gray-700";
const errorClr = "text-red-800";
const defaultClr = "text-gray-700";

const cellClr = "bg-gray-200";
const inputClr = "bg-gray-600";
const inputTextClr = "text-gray-200";
const buttonClr = "bg-gray-800";
const buttonTextClr = "text-gray-200";

const shipSectClr = "bg-slate-800";
const shipHitClr = "bg-red-800";
const shipSunkClr = shipHitClr;
const shipSunkOpacity = "bg-opacity-30";
const primaryHoverClr = "hover:bg-orange-500";

// Function for build a ship section
const buildSection = (domSel, type, pos) => {
  // Create an element for the section
  const sect = document.createElement("div");
  sect.className = tw`w-4 h-4 rounded-full`; // Set the default styling for the section element
  sect.classList.add(shipSectClr);
  // Set a unique id for the ship section
  sect.setAttribute("id", `DOM-${domSel}-shipType-${type}-pos-${pos}`);
  // Set a dataset property of "position" for the section
  sect.dataset.position = pos;

  return sect;
};

// Function for building a ship, depending on the ship type
const buildShip = (obj, domSel, shipPositions) => {
  // Extract the ship's type and length from the object
  const { type, shipLength: length } = obj;
  // Create and array for the ship's sections
  const shipSects = [];

  // Use the length of the ship to create the correct number of sections
  for (let i = 0; i < length; i++) {
    // Get a position from the array
    const position = shipPositions[i];
    // Create an element for the section
    const sect = buildSection(domSel, type, position);
    shipSects.push(sect); // Add the section to the array
  }

  // Return the array of ship sections
  return shipSects;
};

// Function for creating and displaying the pop-up menu at the end of
// the game
const endGameInterface = (winner) => {
  // Get the main container
  const mainContainer = document.getElementById("main-container");

  // Create container for end of game interface
  const endGameContainer = document.createElement("div");
  endGameContainer.setAttribute("id", "end-game-container");
  endGameContainer.className = tw`fixed inset-0 flex justify-center items-center min-w-full min-h-screen bg-gray-900 bg-opacity-40 backdrop-blur-sm z-50`;

  // Create the div for holding the prompt and button
  const promptContainer = document.createElement("div");
  promptContainer.className = tw`w-90 h-60 p-10 bg-gray-200 shadow-lg rounded-md bg-opacity-60 backdrop-blur-sm flex flex-col content-center justify-center`;

  // Create the prompts
  const winnerPrompt = document.createElement("p");
  winnerPrompt.className = tw`font-mono text-center text-md text-gray-800`;
  winnerPrompt.textContent = winner === "human" ? "You win!" : "You lose!";
  const restartPrompt = document.createElement("p");
  restartPrompt.className = tw`font-mono text-center text-md text-gray-800`;
  restartPrompt.textContent = "Click the button to restart the game!";

  // Create the restart button
  const restartButton = document.createElement("button");
  restartButton.setAttribute("id", "restart-button");
  restartButton.className = tw`nanum-gothic-coding-bold mt-4 self-center text-lg w-min tracking-widest px-3 py-1 text-center text-sm rounded-md border-solid text-gray-200 bg-gray-800 border-2 border-gray-200 hover:bg-gray-200 hover:text-gray-800 hover:border-gray-800`;
  restartButton.textContent = "Restart";

  // Add the elements to the relevant containers
  promptContainer.appendChild(winnerPrompt);
  promptContainer.appendChild(restartPrompt);
  promptContainer.appendChild(restartButton);

  endGameContainer.appendChild(promptContainer);

  mainContainer.appendChild(endGameContainer);
};

const UiManager = () => {
  const createGameboard = (containerID) => {
    const container = document.getElementById(containerID);

    // Set player type depending on the containerID
    const { player } = container.dataset;

    // Create the grid container
    const gridDiv = document.createElement("div");
    gridDiv.className = tw`gameboard-area grid grid-cols-11 auto-rows-min gap-1 p-6`;
    gridDiv.dataset.player = player;

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
        const cellId = `${columns[col]}${row}`; // Set the cellId
        const cell = document.createElement("div");
        cell.id = `${player}-${cellId}`; // Set the element id
        cell.className = tw`w-6 h-6 flex justify-center items-center cursor-pointer`; // Add more classes as needed for styling
        cell.classList.add(primaryHoverClr);
        cell.classList.add(cellClr);
        cell.classList.add("gameboard-cell"); // Add a class name to each cell to act as a selector
        cell.dataset.position = cellId; // Assign position data attribute for identification
        cell.dataset.player = player; // Assign player data attribute for identification

        gridDiv.appendChild(cell);
      }
    }

    // Append the grid to the container
    container.appendChild(gridDiv);
  };

  const initConsoleUI = () => {
    const consoleContainer = document.getElementById("console"); // Get the console container from the DOM
    consoleContainer.classList.add(
      "flex",
      "flex-col",
      "justify-between",
      "text-sm",
    ); // Set flexbox rules for container

    // Create a container for the input and button elements
    const inputDiv = document.createElement("div");
    inputDiv.className = "flex flex-row w-full h-1/5 justify-between"; // Set the flexbox rules for the container

    const input = document.createElement("input"); // Create an input element for the console
    input.type = "text"; // Set the input type of this element to text
    input.setAttribute("id", "console-input"); // Set the id for this element to "console-input"
    input.className = tw`pl-3 flex-1 rounded-bl-md border-transparent outline-none focus:outline-solid focus:border-2 focus:border-gray-200 focus:ring-0`; // Add TailwindCSS classes
    input.classList.add(inputClr);
    input.classList.add(inputTextClr);
    const submitButton = document.createElement("button"); // Create a button element for the console submit
    submitButton.textContent = "Submit"; // Add the text "Submit" to the button
    submitButton.setAttribute("id", "console-submit"); // Set the id for the button
    submitButton.className = tw`nanum-gothic-coding-bold text-lg tracking-widest px-3 py-1 text-center text-sm rounded-br-md border-solid border-2 border-gray-200 hover:bg-gray-200 hover:text-gray-800 hover:border-gray-800`; // Add TailwindCSS classes
    submitButton.classList.add(buttonClr);
    submitButton.classList.add(buttonTextClr);
    const output = document.createElement("div"); // Create an div element for the output of the console
    output.setAttribute("id", "console-output"); // Set the id for the output element
    output.className = tw`flex-1 p-2 h-4/5 overflow-auto rounded-t-md bg-gray-200 bg-opacity-30 backdrop-blur-md`; // Add TailwindCSS classes (bg-gradient-to-tr, from-gray-400, to-gray-100)

    // Add the input elements to the input container
    inputDiv.appendChild(input);
    inputDiv.appendChild(submitButton);

    // Append elements to the console container
    consoleContainer.appendChild(output);
    consoleContainer.appendChild(inputDiv);
  };

  const displayPrompt = (promptObjs) => {
    // Get the prompt display
    const display = document.getElementById("prompt-display");

    // Clear the display of all children
    while (display.firstChild) {
      display.removeChild(display.firstChild);
    }

    // Iterate over each prompt in the prompts object
    Object.entries(promptObjs).forEach(([key, { prompt, promptType }]) => {
      // Create a new div for each prompt
      const promptDiv = document.createElement("div");
      promptDiv.textContent = prompt;

      // Apply styling based on promptType
      switch (promptType) {
        case "instruction":
          promptDiv.classList.add(instructionClr);
          promptDiv.classList.add("nanum-gothic-coding-bold");
          break;
        case "guide":
          promptDiv.classList.add(guideClr);
          break;
        case "error":
          promptDiv.classList.add(errorClr);
          break;
        default:
          promptDiv.classList.add(defaultClr); // Default text color
      }

      // Append the new div to the display container
      display.appendChild(promptDiv);
    });
  };

  // Function for rendering ships to the Ship Status display section
  const renderShipDisp = (playerObj, shipType) => {
    let idSel;

    // Set the correct id selector for the type of player
    if (playerObj.type === "human") {
      idSel = "human-display";
    } else if (playerObj.type === "computer") {
      idSel = "comp-display";
    } else {
      throw Error;
    }

    // Get the correct DOM element
    const dispDiv = document
      .getElementById(idSel)
      .querySelector(".ships-container");

    // Get the ship from the player
    const ship = playerObj.gameboard.getShip(shipType);

    // Create a div for the ship
    const shipDiv = document.createElement("div");
    shipDiv.className = "px-4 py-2 flex flex-col gap-1";

    // Add a title the the div
    const title = document.createElement("h2");
    title.textContent = shipType; // Set the title to the ship type
    shipDiv.appendChild(title);

    // Get the ship positions array
    const shipPositions = playerObj.gameboard.getShipPositions(shipType);

    // Build the ship sections
    const shipSects = buildShip(ship, idSel, shipPositions);

    // Add the ship sections to the div
    const sectsDiv = document.createElement("div");
    sectsDiv.className = "flex flex-row gap-1";
    shipSects.forEach((sect) => {
      sectsDiv.appendChild(sect);
    });
    shipDiv.appendChild(sectsDiv);

    dispDiv.appendChild(shipDiv);
  };

  // Function for r ships on the gameboard
  const renderShipBoard = (playerObj, shipType) => {
    let idSel;

    // Set the correct id selector for the type of player
    if (playerObj.type === "human") {
      idSel = "human-board";
    } else if (playerObj.type === "computer") {
      idSel = "comp-board";
    } else {
      throw Error("No matching player type in 'renderShipBoard' function");
    }

    // Get the player's type and gameboard
    const { type: playerType, gameboard } = playerObj;

    // Get the ship and the ship positions
    const shipObj = gameboard.getShip(shipType);
    const shipPositions = gameboard.getShipPositions(shipType);

    // Build the ship sections
    const shipSects = buildShip(shipObj, idSel, shipPositions);

    // Match the cell positions with the ship sections and place each
    // ship section in the corresponding cell element
    shipPositions.forEach((position) => {
      const cellElement = document.getElementById(`${playerType}-${position}`);
      // Find the ship section element that matches the current position
      const shipSect = shipSects.find(
        (section) => section.dataset.position === position,
      );

      if (cellElement && shipSect) {
        // Place the ship section in the cell
        cellElement.appendChild(shipSect);
      }
    });
  };

  const renderShipSect = (shipType, pos) => {
    // Build a section with the id DOM selector of "comp-board"
    const sect = buildSection("comp-board", shipType, pos);

    // Get the correct cell element
    const cellElement = document.getElementById(`computer-${pos}`);

    if (cellElement && sect) {
      // Place the ship section in the cell
      cellElement.appendChild(sect);
    } else {
      throw new Error(
        `Missing ship section and/or cell element. Ship section = ${sect}. Cell element = ${cellElement}.`,
      );
    }
  };

  const updateShipSection = (pos, shipType, playerType, isShipSunk = false) => {
    let newClr;

    switch (isShipSunk) {
      case true:
        newClr = shipSunkClr;
        break;
      default:
        newClr = shipHitClr;
    }

    // Set the selector value depending on the player type
    const playerId = playerType === "human" ? "human" : "comp";

    // If the player type is computer and the ship isn't sunk then
    // render the single ship section on the board
    if (playerId === "comp" && !isShipSunk) {
      renderShipSect(shipType, pos);
    }

    // If player type is human then also update the ship section on the board
    if (playerId === "human" || isShipSunk) {
      // Get the correct ship section element from the DOM for the
      // status display
      const shipSectDisplayEl = document.getElementById(
        `DOM-${playerId}-display-shipType-${shipType}-pos-${pos}`,
      );

      // If the element was found successfully, change its colour, otherwise
      // throw error
      if (!shipSectDisplayEl) {
        throw new Error(
          "Error! Ship section element not found in status display! (updateShipSection)",
        );
      } else {
        shipSectDisplayEl.classList.remove(shipSectClr);
        shipSectDisplayEl.classList.remove(shipHitClr);
        shipSectDisplayEl.classList.add(newClr);
        // If isShipSunk is true then also add opacity
        if (isShipSunk) {
          shipSectDisplayEl.classList.add(shipSunkOpacity);
        }
      }

      // Get the correct ship section element from the DOM for the
      // gameboard display
      const shipSectBoardEl = document.getElementById(
        `DOM-${playerId}-board-shipType-${shipType}-pos-${pos}`,
      );

      // If the element was found successfully, change its colour, otherwise
      // throw error
      if (!shipSectBoardEl) {
        throw new Error(
          "Error! Ship section element not found on gameboard! (updateShipSection)",
        );
      } else {
        shipSectBoardEl.classList.remove(shipSectClr);
        shipSectBoardEl.classList.remove(shipHitClr);
        shipSectBoardEl.classList.add(newClr);
        // If isShipSunk is true then also add opacity
        if (isShipSunk) {
          shipSectBoardEl.classList.add(shipSunkOpacity);
        }
      }
    }
  };

  const renderSunkenShip = (playerObj, shipType) => {
    // Get the player type
    const { type } = playerObj;

    // Get the ship positions for the ship
    const shipPositions = playerObj.gameboard.getShipPositions(shipType);

    shipPositions.forEach((pos) => {
      updateShipSection(pos, shipType, type, true);
    });
  };

  const promptEndGame = (winner) => {
    // Create and display pop-up
    endGameInterface(winner);
  };

  return {
    createGameboard,
    initConsoleUI,
    displayPrompt,
    renderShipDisp,
    renderShipBoard,
    updateShipSection,
    renderSunkenShip,
    promptEndGame,
  };
};

export default UiManager;
