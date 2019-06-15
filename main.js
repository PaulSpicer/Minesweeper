const gameCondition = {
	FRESH_GAME: 0,
	IN_PROGRESS: 1,
	COMPLETED: 2
}


function pageLoaded() {

}

function startGame() {

	// Cleanup any existing/previous game/grid
	let gameContainer = document.querySelector("#game-board-container");
	while (gameContainer.firstChild) {
		gameContainer.removeChild(gameContainer.firstChild);
	}

	// Setup Game
	let iptRows = document.querySelector("#txtRows").value;
	let iptColumns = document.querySelector("#txtColumns").value;
	let iptMines = document.querySelector("#txtMines").value;

	if (!(iptRows.match(/^\d+$/) && iptColumns.match(/^\d+$/) && iptMines.match(/^\d+$/))) {
		alert("Invalid Input Detected");
		return;
	}

	iptRows = parseInt(iptRows);
	iptColumns = parseInt(iptColumns);
	iptMines = parseInt(iptMines);

	let gameState = {
		cellsX: iptColumns,
		cellsY: iptRows,
		noOfMines: iptMines,
		mineLocations: new Set(),
		status: gameCondition.FRESH_GAME,
		cells: new Array(iptRows * iptColumns),
		cellsRemaining: (iptRows * iptColumns) - iptMines
	}

	document.documentElement.style.setProperty("--game-rows", gameState.cellsY);
	document.documentElement.style.setProperty("--game-columns", gameState.cellsX);

	// Generate grid
	let gameBoard = document.createElement("div");
	gameBoard.className = ("game-board");
	gameContainer.appendChild(gameBoard);

	for (let i = 0; i < gameState.cells.length; i++) {
		let child = document.createElement("div");
		child.setAttribute("class", "cell");
		child.dataset.cellid = i;
		gameBoard.appendChild(child);
		gameState.cells[i] = child;
	}

	//Register click handlers
	gameBoard.addEventListener("contextmenu", cellRightClicked.bind(gameState));
	gameBoard.addEventListener("click", cellClicked.bind(gameState));
}


function mineSetup(immuneCell, gameState) {
	// Seed Mines
	for (let i = 0; i < gameState.noOfMines; i++) {
		let loop = true;
		while (loop) {
			let rand = Math.floor(Math.random() * gameState.cells.length);
			if (!gameState.mineLocations.has(rand) && rand != immuneCell) {
				gameState.mineLocations.add(rand);
				loop = false;
			}
		}
	}

	// Calculate and set adjacency hints
	for (let i = 0; i < gameState.cells.length; i++) {
		let count = 0;
		for (let a of calculateAdjacents(i, gameState)) {
			for (let b of gameState.mineLocations.values()) {
				if (a == b) { count++; }
			}
		}
		gameState.cells[i].dataset.adjMines = count;
	}
}

function calculateAdjacents(cell, gameState) {
	let adj = new Map();
	adj.set("W", cell - 1);
	adj.set("E", cell + 1);
	adj.set("N", cell - gameState.cellsX);
	adj.set("S", cell + gameState.cellsX);
	adj.set("NW", cell - gameState.cellsX - 1);
	adj.set("NE", cell - gameState.cellsX + 1);
	adj.set("SW", cell + gameState.cellsX - 1);
	adj.set("SE", cell + gameState.cellsX + 1);

	//Top Edge
	if (cell < gameState.cellsX) {
		adj.delete("NW");
		adj.delete("NE");
		adj.delete("N");
	}
	// Left Edge
	if (cell % gameState.cellsX == 0) {
		adj.delete("W");
		adj.delete("SW");
		adj.delete("NW");
	}
	// Right Edge
	if ((cell) % gameState.cellsX == gameState.cellsX - 1) {
		adj.delete("E");
		adj.delete("NE");
		adj.delete("SE");
	}
	// Bottom Edge
	if (cell >= (gameState.cells.length - gameState.cellsX)) {
		adj.delete("S");
		adj.delete("SW");
		adj.delete("SE");
	}
	return adj.values();
}

function processCell(cell, gameState) {
	switch (gameState.cells[cell].className) {
		case "cell":
			{
				if (gameState.mineLocations.has(parseInt(gameState.cells[cell].dataset.cellid))) {
					for (let mines of gameState.mineLocations) {
						gameState.cells[mines].className = "cell-mine"
					}
					gameState.cells[cell].className = "cell-clicked-mine";
					gameState.status = gameCondition.COMPLETED;
				}
				else {
					let cellsToCheck = [cell];
					while (cellsToCheck.length > 0) {
						cell = cellsToCheck.pop();
						//UNCOVER SQUARE
						gameState.cells[cell].className = "cell-clicked";
						if (gameState.cells[cell].dataset.adjMines != 0) {
							gameState.cells[cell].textContent = gameState.cells[cell].dataset.adjMines;
						}
						else {
							for (let adj of calculateAdjacents(cell, gameState)) {
								if (gameState.cells[adj].className == "cell" && !cellsToCheck.includes(adj)) {
									cellsToCheck.push(adj);
								}
							}
						}
					}
				}
				break;
			}
		case "cell-click":
		case "cell-flagged":
		default: break;
	}
}

function setGameDifficulty(row, col, mines) {
	document.querySelector("#txtRows").value = row;
	document.querySelector("#txtColumns").value = col;
	document.querySelector("#txtMines").value = mines;
}

function cellClicked(event) {
	let targetCell = (parseInt(event.target.dataset.cellid));
	switch (this.status) {
		case gameCondition.FRESH_GAME: {
			mineSetup(targetCell, this);
			this.status = gameCondition.IN_PROGRESS;
		}
		case gameCondition.IN_PROGRESS: {
			processCell(targetCell, this);
		}
		default:
			break;
	}

}

function cellRightClicked(event) {
	switch (event.target.className) {
		case "cell":
			{
				event.target.className = "cell-flagged";
				break;
			}
		case "cell-flagged":
			{
				event.target.className = "cell";
				break;
			}
		default: break;
	}
	event.preventDefault();
}

document.addEventListener("DOMContentLoaded", evt => pageLoaded());
