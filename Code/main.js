function main()
{
	// TODO: User Set Board Size
	let cellsX = 10, cellsY = 10;
	let noOfMines = 10;

	let gameState = 
	{
		cellsX: 10,
		cellsY: 10,
		noOfMines: 10,
		mineLocations: new Set(),
		cells: new Array(cellsX * cellsY)
	}

	document.documentElement.style.setProperty("--game-rows", gameState.cellsX);
	document.documentElement.style.setProperty("--game-columns", gameState.cellsY);

	// Generate grid
	let gameBoard = document.querySelector(".game-board");
	
	for(let i = 0; i < gameState.cells.length; i++)
	{
		let child = document.createElement("div");
		child.setAttribute("class", "cell");
		child.dataset.cellid = i;
		gameBoard.appendChild(child);
		gameState.cells[i] = child;
	}

	for(let i = 0; i < noOfMines; i++)
	{	
		let loop = true;		
		while (loop)
		{
			let rand = Math.floor(Math.random() * gameState.cells.length);
			if (!gameState.mineLocations.has(rand))
			{
				gameState.mineLocations.add(rand);
				loop = false;
			}
		}
	}

	// Calculate adjacency hints
	for(let i = 0; i < gameState.cells.length; i++)
	{
		let count = 0;
		for (let a of calculateAdjacents(i, gameState)) 
		{
			for (let b of gameState.mineLocations.values())
			{
				if (a == b) {count++;}
			}
		}
		gameState.cells[i].dataset.adjMines = count;
	}

	//Register click handlers

	gameBoard.addEventListener("contextmenu", cellRightClicked.bind(gameState));
	gameBoard.addEventListener("click", cellClicked.bind(gameState));
}


function cellRightClicked(event) {

	switch (event.target.className)
	{
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
	if (cell % gameState.cellsX == gameState.cellsX) {
		adj.delete("E");
		adj.delete("NE");
		adj.delete("SE");
	}
	// Bottom Edge
	if (cell > (gameState.cells.length - gameState.cellsX)) {
		adj.delete("S");
		adj.delete("SW");
		adj.delete("SE");		
	}
	return adj.values();
}


function cellClicked(event) {

	switch (event.target.className) 
	{
		case "cell": 
		{
			if (this.mineLocations.has(parseInt(event.target.dataset.cellid)))
			{
				//DO FAILURE STUFF
				event.target.className = "cell-clicked-mine";
				for(let mines of this.mineLocations)
				{
					if (!(event.target.dataset.cellid == mines))
						{
							this.cells[mines].className = "cell-mine"
						}
				}
			}
			else 
			{
				//UNCOVER SQUARE
				event.target.className = "cell-clicked";
				if (event.target.dataset.adjMines != 0)
				{
					event.target.textContent = event.target.dataset.adjMines;
				}
				else
				{
					let cellsToCheck = [event.target.dataset.cellid];

					while (cellsToCheck.length > 0) 
					{
						let currentCell = cellsToCheck.pop();					
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

document.addEventListener("DOMContentLoaded", evt => main());
