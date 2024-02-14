/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/errors.js":
/*!***********************!*\
  !*** ./src/errors.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   InvalidMoveEntryError: () => (/* binding */ InvalidMoveEntryError),\n/* harmony export */   InvalidPlayerTypeError: () => (/* binding */ InvalidPlayerTypeError),\n/* harmony export */   InvalidShipLengthError: () => (/* binding */ InvalidShipLengthError),\n/* harmony export */   InvalidShipTypeError: () => (/* binding */ InvalidShipTypeError),\n/* harmony export */   OverlappingShipsError: () => (/* binding */ OverlappingShipsError),\n/* harmony export */   RepeatAttackedError: () => (/* binding */ RepeatAttackedError),\n/* harmony export */   ShipAllocationReachedError: () => (/* binding */ ShipAllocationReachedError),\n/* harmony export */   ShipPlacementBoundaryError: () => (/* binding */ ShipPlacementBoundaryError),\n/* harmony export */   ShipTypeAllocationReachedError: () => (/* binding */ ShipTypeAllocationReachedError)\n/* harmony export */ });\n/* eslint-disable max-classes-per-file */\n\nclass OverlappingShipsError extends Error {\n  constructor(message = \"Ships are overlapping.\") {\n    super(message);\n    this.name = \"OverlappingShipsError\";\n  }\n}\nclass ShipAllocationReachedError extends Error {\n  constructor(message = \"Ship allocation limit reached.\") {\n    super(message);\n    this.name = \"ShipAllocationReachedError\";\n  }\n}\nclass ShipTypeAllocationReachedError extends Error {\n  constructor(message = \"Ship type allocation limit reached.\") {\n    super(message);\n    this.name = \"ShipTypeAllocationReachedError\";\n  }\n}\nclass InvalidShipLengthError extends Error {\n  constructor(message = \"Invalid ship length.\") {\n    super(message);\n    this.name = \"InvalidShipLengthError\";\n  }\n}\nclass InvalidShipTypeError extends Error {\n  constructor(message = \"Invalid ship type.\") {\n    super(message);\n    this.name = \"InvalidShipTypeError\";\n  }\n}\nclass InvalidPlayerTypeError extends Error {\n  constructor(message = \"Invalid player type. Valid player types: 'human' & 'computer'\") {\n    super(message);\n    this.name = \"InvalidShipTypeError\";\n  }\n}\nclass ShipPlacementBoundaryError extends Error {\n  constructor(message = \"Invalid ship placement. Boundary error!\") {\n    super(message);\n    this.name = \"ShipPlacementBoundaryError\";\n  }\n}\nclass RepeatAttackedError extends Error {\n  constructor(message = \"Invalid attack entry. Position already attacked!\") {\n    super(message);\n    this.name = \"RepeatAttackError\";\n  }\n}\nclass InvalidMoveEntryError extends Error {\n  constructor(message = \"Invalid move entry!\") {\n    super(message);\n    this.name = \"InvalidMoveEntryError\";\n  }\n}\n\n\n//# sourceURL=webpack://odin-battleship/./src/errors.js?");

/***/ }),

/***/ "./src/game.js":
/*!*********************!*\
  !*** ./src/game.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./player */ \"./src/player.js\");\n/* harmony import */ var _gameboard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./gameboard */ \"./src/gameboard.js\");\n/* harmony import */ var _ship__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ship */ \"./src/ship.js\");\n/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./errors */ \"./src/errors.js\");\n\n\n\n\nconst Game = () => {\n  // Initialise, create gameboards for both players and create players of types human and computer\n  const humanGameboard = (0,_gameboard__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(_ship__WEBPACK_IMPORTED_MODULE_2__[\"default\"]);\n  const computerGameboard = (0,_gameboard__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(_ship__WEBPACK_IMPORTED_MODULE_2__[\"default\"]);\n  const humanPlayer = (0,_player__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(humanGameboard, \"human\");\n  const computerPlayer = (0,_player__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(computerGameboard, \"computer\");\n  let currentPlayer;\n  let gameOverState = false;\n\n  // Store players in a player object\n  const players = {\n    human: humanPlayer,\n    computer: computerPlayer\n  };\n\n  // Set up phase\n  const setUp = humanShips => {\n    // Automatic placement for computer\n    computerPlayer.placeShips();\n\n    // Place ships from the human player's selection on their respective gameboard\n    humanShips.forEach(ship => {\n      humanPlayer.placeShips(ship.shipType, ship.start, ship.direction);\n    });\n\n    // Set the current player to human player\n    currentPlayer = humanPlayer;\n  };\n\n  // Game ending function\n  const endGame = () => {\n    gameOverState = true;\n  };\n\n  // Take turn method\n  const takeTurn = move => {\n    let feedback;\n\n    // Determine the opponent based on the current player\n    const opponent = currentPlayer === humanPlayer ? computerPlayer : humanPlayer;\n\n    // Call the makeMove method on the current player with the opponent's gameboard and store as move feedback\n    const result = currentPlayer.makeMove(opponent.gameboard, move);\n\n    // If result is a hit, check whether the ship is sunk\n    if (result.hit) {\n      // Check whether the ship is sunk and add result as value to feedback object with key \"isShipSunk\"\n      if (opponent.gameboard.isShipSunk(result.shipType)) {\n        feedback = {\n          ...result,\n          isShipSunk: true,\n          gameWon: opponent.gameboard.checkAllShipsSunk()\n        };\n      } else {\n        feedback = {\n          ...result,\n          isShipSunk: false\n        };\n      }\n    } else if (!result.hit) {\n      // Set feedback to just the result\n      feedback = result;\n    }\n\n    // If game is won, end game\n    if (feedback.gameWon) {\n      endGame();\n    }\n\n    // Switch the current player\n    currentPlayer = opponent;\n\n    // Return the feedback for the move\n    return feedback;\n  };\n  return {\n    get currentPlayer() {\n      return currentPlayer;\n    },\n    get gameOverState() {\n      return gameOverState;\n    },\n    players,\n    setUp,\n    takeTurn\n  };\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Game);\n\n//# sourceURL=webpack://odin-battleship/./src/game.js?");

/***/ }),

/***/ "./src/gameboard.js":
/*!**************************!*\
  !*** ./src/gameboard.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./errors */ \"./src/errors.js\");\n\nconst grid = [[\"A1\", \"A2\", \"A3\", \"A4\", \"A5\", \"A6\", \"A7\", \"A8\", \"A9\", \"A10\"], [\"B1\", \"B2\", \"B3\", \"B4\", \"B5\", \"B6\", \"B7\", \"B8\", \"B9\", \"B10\"], [\"C1\", \"C2\", \"C3\", \"C4\", \"C5\", \"C6\", \"C7\", \"C8\", \"C9\", \"C10\"], [\"D1\", \"D2\", \"D3\", \"D4\", \"D5\", \"D6\", \"D7\", \"D8\", \"D9\", \"D10\"], [\"E1\", \"E2\", \"E3\", \"E4\", \"E5\", \"E6\", \"E7\", \"E8\", \"E9\", \"E10\"], [\"F1\", \"F2\", \"F3\", \"F4\", \"F5\", \"F6\", \"F7\", \"F8\", \"F9\", \"F10\"], [\"G1\", \"G2\", \"G3\", \"G4\", \"G5\", \"G6\", \"G7\", \"G8\", \"G9\", \"G10\"], [\"H1\", \"H2\", \"H3\", \"H4\", \"H5\", \"H6\", \"H7\", \"H8\", \"H9\", \"H10\"], [\"I1\", \"I2\", \"I3\", \"I4\", \"I5\", \"I6\", \"I7\", \"I8\", \"I9\", \"I10\"], [\"J1\", \"J2\", \"J3\", \"J4\", \"J5\", \"J6\", \"J7\", \"J8\", \"J9\", \"J10\"]];\nconst indexCalcs = start => {\n  const colLetter = start[0].toUpperCase(); // This is the column\n  const rowNumber = parseInt(start.slice(1), 10); // This is the row\n\n  const colIndex = colLetter.charCodeAt(0) - \"A\".charCodeAt(0); // Column index based on letter\n  const rowIndex = rowNumber - 1; // Row index based on number\n\n  return [colIndex, rowIndex]; // Return [row, column]\n};\nconst checkType = (ship, shipPositions) => {\n  // Iterate through the shipPositions object\n  Object.keys(shipPositions).forEach(existingShipType => {\n    if (existingShipType === ship) {\n      throw new _errors__WEBPACK_IMPORTED_MODULE_0__.ShipTypeAllocationReachedError();\n    }\n  });\n};\nconst checkBoundaries = (shipLength, coords, direction) => {\n  // Set row and col limits\n  const xLimit = grid.length; // This is the total number of columns (x)\n  const yLimit = grid[0].length; // This is the total number of rows (y)\n\n  const x = coords[0];\n  const y = coords[1];\n\n  // Check for valid start position on board\n  if (x < 0 || x >= xLimit || y < 0 || y >= yLimit) {\n    return false;\n  }\n\n  // Check right boundary for horizontal placement\n  if (direction === \"h\" && x + shipLength > xLimit) {\n    return false;\n  }\n  // Check bottom boundary for vertical placement\n  if (direction === \"v\" && y + shipLength > yLimit) {\n    return false;\n  }\n\n  // If none of the invalid conditions are met, return true\n  return true;\n};\nconst calculateShipPositions = (shipLength, coords, direction) => {\n  const colIndex = coords[0]; // This is the column index\n  const rowIndex = coords[1]; // This is the row index\n\n  const positions = [];\n  if (direction.toLowerCase() === \"h\") {\n    // Horizontal placement: increment the column index\n    for (let i = 0; i < shipLength; i++) {\n      positions.push(grid[colIndex + i][rowIndex]);\n    }\n  } else {\n    // Vertical placement: increment the row index\n    for (let i = 0; i < shipLength; i++) {\n      positions.push(grid[colIndex][rowIndex + i]);\n    }\n  }\n  return positions;\n};\nconst checkForOverlap = (positions, shipPositions) => {\n  Object.entries(shipPositions).forEach(([shipType, existingShipPositions]) => {\n    if (positions.some(position => existingShipPositions.includes(position))) {\n      throw new _errors__WEBPACK_IMPORTED_MODULE_0__.OverlappingShipsError(`Overlap detected with ship type ${shipType}`);\n    }\n  });\n};\nconst checkForHit = (position, shipPositions) => {\n  const foundShip = Object.entries(shipPositions).find(([_, existingShipPositions]) => existingShipPositions.includes(position));\n  return foundShip ? {\n    hit: true,\n    shipType: foundShip[0]\n  } : {\n    hit: false\n  };\n};\nconst Gameboard = shipFactory => {\n  const ships = {};\n  const shipPositions = {};\n  const hitPositions = {};\n  const attackLog = [[], []];\n  const placeShip = (type, start, direction) => {\n    const newShip = shipFactory(type);\n\n    // Check the ship type against existing types\n    checkType(type, shipPositions);\n\n    // Calculate start point coordinates based on start point grid key\n    const coords = indexCalcs(start);\n\n    // Check boundaries, if ok continue to next step\n    if (checkBoundaries(newShip.shipLength, coords, direction)) {\n      // Calculate and store positions for a new ship\n      const positions = calculateShipPositions(newShip.shipLength, coords, direction);\n\n      // Check for overlap before placing the ship\n      checkForOverlap(positions, shipPositions);\n\n      // If no overlap, proceed to place ship\n      shipPositions[type] = positions;\n      // Add ship to ships object\n      ships[type] = newShip;\n\n      // Initialise hitPositions for this ship type as an empty array\n      hitPositions[type] = [];\n    } else {\n      throw new _errors__WEBPACK_IMPORTED_MODULE_0__.ShipPlacementBoundaryError(`Invalid ship placement. Boundary error! Ship type: ${type}`);\n    }\n  };\n\n  // Register an attack and test for valid hit\n  const attack = position => {\n    let response;\n\n    // Check for valid attack\n    if (attackLog[0].includes(position) || attackLog[1].includes(position)) {\n      // console.log(`Repeat attack: ${position}`);\n      throw new _errors__WEBPACK_IMPORTED_MODULE_0__.RepeatAttackedError();\n    }\n\n    // Check for valid hit\n    const checkResults = checkForHit(position, shipPositions);\n    if (checkResults.hit) {\n      // Register valid hit\n      hitPositions[checkResults.shipType].push(position);\n      ships[checkResults.shipType].hit();\n\n      // Log the attack as a valid hit\n      attackLog[0].push(position);\n      response = {\n        ...checkResults\n      };\n    } else {\n      // console.log(`MISS!: ${position}`);\n      // Log the attack as a miss\n      attackLog[1].push(position);\n      response = {\n        ...checkResults\n      };\n    }\n    return response;\n  };\n  const isShipSunk = type => ships[type].isSunk;\n  const checkAllShipsSunk = () => Object.entries(ships).every(([shipType, ship]) => ship.isSunk);\n\n  // Function for reporting the number of ships left afloat\n  const shipReport = () => {\n    const floatingShips = Object.entries(ships).filter(([shipType, ship]) => !ship.isSunk).map(([shipType, _]) => shipType);\n    return [floatingShips.length, floatingShips];\n  };\n  return {\n    get grid() {\n      return grid;\n    },\n    get ships() {\n      return ships;\n    },\n    get attackLog() {\n      return attackLog;\n    },\n    getShip: shipType => ships[shipType],\n    getShipPositions: shipType => shipPositions[shipType],\n    getHitPositions: shipType => hitPositions[shipType],\n    placeShip,\n    attack,\n    isShipSunk,\n    checkAllShipsSunk,\n    shipReport\n  };\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Gameboard);\n\n//# sourceURL=webpack://odin-battleship/./src/gameboard.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./game */ \"./src/game.js\");\n\n\n// Instantiate a new game\nconst newGame = (0,_game__WEBPACK_IMPORTED_MODULE_0__[\"default\"])();\n\n// Create a mock array of human player entries\nconst humanShips = [{\n  shipType: \"battleship\",\n  start: \"D7\",\n  direction: \"v\"\n}, {\n  shipType: \"submarine\",\n  start: \"A1\",\n  direction: \"h\"\n}, {\n  shipType: \"destroyer\",\n  start: \"F8\",\n  direction: \"h\"\n}, {\n  shipType: \"cruiser\",\n  start: \"G1\",\n  direction: \"h\"\n}, {\n  shipType: \"carrier\",\n  start: \"J6\",\n  direction: \"v\"\n}];\n\n// Call the setUp method on the game\nnewGame.setUp(humanShips);\n\n// Console log the players\nconsole.log(`Players: First player of type ${newGame.players.human.type}, second player of type ${newGame.players.computer.type}!`);\n\n//# sourceURL=webpack://odin-battleship/./src/index.js?");

/***/ }),

/***/ "./src/player.js":
/*!***********************!*\
  !*** ./src/player.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./errors */ \"./src/errors.js\");\n\nconst checkMove = (move, gbGrid) => {\n  let valid = false;\n  gbGrid.forEach(el => {\n    if (el.find(p => p === move)) {\n      valid = true;\n    }\n  });\n  return valid;\n};\nconst randMove = (grid, moveLog) => {\n  // Flatten the grid into a single array of moves\n  const allMoves = grid.flatMap(row => row);\n\n  // Filter out the moves that are already in the moveLog\n  const possibleMoves = allMoves.filter(move => !moveLog.includes(move));\n\n  // Select a random move from the possible moves\n  const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];\n  return randomMove;\n};\nconst generateRandomStart = (size, direction, grid) => {\n  const validStarts = [];\n  if (direction === \"h\") {\n    // For horizontal orientation, limit the columns\n    for (let col = 0; col < grid.length - size + 1; col++) {\n      for (let row = 0; row < grid[col].length; row++) {\n        validStarts.push(grid[col][row]);\n      }\n    }\n  } else {\n    // For vertical orientation, limit the rows\n    for (let row = 0; row < grid[0].length - size + 1; row++) {\n      for (let col = 0; col < grid.length; col++) {\n        validStarts.push(grid[col][row]);\n      }\n    }\n  }\n\n  // Randomly select a starting position\n  const randomIndex = Math.floor(Math.random() * validStarts.length);\n  return validStarts[randomIndex];\n};\nconst autoPlacement = gameboard => {\n  const shipTypes = [{\n    type: \"carrier\",\n    size: 5\n  }, {\n    type: \"battleship\",\n    size: 4\n  }, {\n    type: \"cruiser\",\n    size: 3\n  }, {\n    type: \"submarine\",\n    size: 3\n  }, {\n    type: \"destroyer\",\n    size: 2\n  }];\n  shipTypes.forEach(ship => {\n    let placed = false;\n    while (!placed) {\n      const direction = Math.random() < 0.5 ? \"h\" : \"v\";\n      const start = generateRandomStart(ship.size, direction, gameboard.grid);\n      try {\n        gameboard.placeShip(ship.type, start, direction);\n        placed = true;\n      } catch (error) {\n        if (!(error instanceof _errors__WEBPACK_IMPORTED_MODULE_0__.ShipPlacementBoundaryError) && !(error instanceof _errors__WEBPACK_IMPORTED_MODULE_0__.OverlappingShipsError)) {\n          throw error; // Rethrow non-placement errors\n        }\n        // If placement fails, catch the error and try again\n      }\n    }\n  });\n};\nconst Player = (gameboard, type) => {\n  const moveLog = [];\n  const placeShips = (shipType, start, direction) => {\n    if (type === \"human\") {\n      gameboard.placeShip(shipType, start, direction);\n    } else if (type === \"computer\") {\n      autoPlacement(gameboard);\n    } else {\n      throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidPlayerTypeError(`Invalid player type. Valid player types: \"human\" & \"computer\". Entered: ${type}.`);\n    }\n  };\n  const makeMove = (oppGameboard, input) => {\n    let move;\n\n    // Check for the type of player\n    if (type === \"human\") {\n      // Format the input\n      move = `${input.charAt(0).toUpperCase()}${input.substring(1)}`;\n    } else if (type === \"computer\") {\n      move = randMove(oppGameboard.grid, moveLog);\n    } else {\n      throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidPlayerTypeError(`Invalid player type. Valid player types: \"human\" & \"computer\". Entered: ${type}.`);\n    }\n\n    // Check the input against the possible moves on the gameboard's grid\n    if (!checkMove(move, oppGameboard.grid)) {\n      throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidMoveEntryError(`Invalid move entry! Move: ${move}.`);\n    }\n\n    // If the move exists in the moveLog array, throw an error\n    if (moveLog.find(el => el === move)) {\n      throw new _errors__WEBPACK_IMPORTED_MODULE_0__.RepeatAttackedError();\n    }\n\n    // Else, call attack method on gameboard and log move in moveLog\n    const response = oppGameboard.attack(move);\n    moveLog.push(move);\n    // Return the response of the attack (object: { hit: false } for miss; { hit: true, shipType: string } for hit).\n    return {\n      player: type,\n      ...response\n    };\n  };\n  return {\n    get type() {\n      return type;\n    },\n    get gameboard() {\n      return gameboard;\n    },\n    get moveLog() {\n      return moveLog;\n    },\n    makeMove,\n    placeShips\n  };\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Player);\n\n//# sourceURL=webpack://odin-battleship/./src/player.js?");

/***/ }),

/***/ "./src/ship.js":
/*!*********************!*\
  !*** ./src/ship.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./errors */ \"./src/errors.js\");\n\nconst Ship = type => {\n  const setLength = () => {\n    switch (type) {\n      case \"carrier\":\n        return 5;\n      case \"battleship\":\n        return 4;\n      case \"cruiser\":\n      case \"submarine\":\n        return 3;\n      case \"destroyer\":\n        return 2;\n      default:\n        throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidShipTypeError();\n    }\n  };\n  const shipLength = setLength();\n  let hits = 0;\n  const hit = () => {\n    if (hits < shipLength) {\n      hits += 1;\n    }\n  };\n  return {\n    get type() {\n      return type;\n    },\n    get shipLength() {\n      return shipLength;\n    },\n    get hits() {\n      return hits;\n    },\n    get isSunk() {\n      return hits === shipLength;\n    },\n    hit\n  };\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Ship);\n\n//# sourceURL=webpack://odin-battleship/./src/ship.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;