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
	if (document.documentElement.INTERVALREFERENCE != null)
	{
		window.clearInterval(document.documentElement.INTERVALREFERENCE);
	}

	// TODO: Win Styling
	document.body.style.backgroundColor = "White";

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
		cellsRemaining: (iptRows * iptColumns) - iptMines,
		minesRemaining: iptMines,
		time: 0,
		timerHandler: 0,
		uiMines: document.querySelector("#ui-mines"),
		uiTimer: document.querySelector("#ui-timer")
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

	// Setup UI	
	document.querySelector("#ui").style.visibility = "visible";
	gameState.uiMines.innerHTML = gameState.minesRemaining;
	gameState.uiTimer.innerHTML = gameState.time;

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
						gameState.cellsRemaining--;
						//UNCOVER SQUARE
						gameState.cells[cell].className = "cell-clicked";
						if (gameState.cells[cell].dataset.adjMines != 0) {
							gameState.cells[cell].textContent = gameState.cells[cell].dataset.adjMines;							
							let colour = "";
							switch (parseInt(gameState.cells[cell].dataset.adjMines)) {
								case 1: colour = "#0000ff"; break;
								case 2: colour = "#008100"; break; 
								case 3: colour = "#ff1300"; break;
								case 4: colour = "#000083"; break;
								case 5: colour = "#810500"; break;
								case 6: colour = "#2a9494"; break;
								case 7: colour = "#000000"; break;
								case 8: colour = "#808080"; break;
								default: break;
							}
							gameState.cells[cell].style.color = colour;
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

	if (gameState.cellsRemaining == 0)
	{
		// VICTORY CONDITION
		document.body.style.backgroundColor = "Green";
		gameState.status = gameCondition.COMPLETED;
	}

	if (gameState.status == gameCondition.COMPLETED)
	{
		window.clearInterval(gameState.timerHandler);
	}
}

function setGameDifficulty(row, col, mines) {
	document.querySelector("#txtRows").value = row;
	document.querySelector("#txtColumns").value = col;
	document.querySelector("#txtMines").value = mines;
	startGame();
}

function cellClicked(event) {
	let targetCell = (parseInt(event.target.dataset.cellid));
	switch (this.status) {
		case gameCondition.FRESH_GAME: {
			mineSetup(targetCell, this);
			this.status = gameCondition.IN_PROGRESS;
			this.timerHandler = window.setInterval(updateClock.bind(this), 1000);
			document.documentElement.INTERVALREFERENCE = this.timerHandler;
		}
		case gameCondition.IN_PROGRESS: {
			processCell(targetCell, this);
		}
		default:
			break;
	}
}

function cellRightClicked(event) {
	if (this.status != gameCondition.COMPLETED)
	{
		switch (event.target.className) {
			case "cell":
				{
					event.target.className = "cell-flagged";
					this.minesRemaining--;
					break;
				}
			case "cell-flagged":
				{
					event.target.className = "cell";
					this.minesRemaining++;
					break;
				}
			default: break;
		}
	}
	this.uiMines.innerHTML = this.minesRemaining;
	event.preventDefault();
}

function updateClock() {
	this.time++;
	this.uiTimer.innerHTML = this.time;
}

document.addEventListener("DOMContentLoaded", evt => pageLoaded());
