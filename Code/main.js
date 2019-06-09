function main()
{
	let cellsX = 10, cellsY = 10;
	let noOfMines = 10;

	let GameState = 
	{
		mineLocations: new Set(),
		cells: new Array(cellsX * cellsY)
	}

	// TODO: Set Board Size
	document.documentElement.style.setProperty("--game-rows", cellsX);
	document.documentElement.style.setProperty("--game-columns", cellsY);

	// Generate grid
	let gameBoard = document.querySelector(".game-board");
	
	for(let i = 0; i < GameState.cells.length; i++)
	{
		let child = document.createElement("div");
		child.setAttribute("class", "cell");
		child.dataset.cellid = i;
		gameBoard.appendChild(child);
		GameState.cells[i] = child;
	}

	for(let i = 0; i < noOfMines; i++)
	{	
		let loop = true;		
		while (loop)
		{
			let rand = Math.floor(Math.random() * GameState.cells.length);
			if (!GameState.mineLocations.has(rand))
			{
				GameState.mineLocations.add(rand);
				loop = false;
			}
		}
	}

	// Calculate adjacency hints
	for(let i = 0; i < GameState.cells.length; i++)
	{
		let adj = new Map();
		adj.set("W", i - 1);
		adj.set("E", i + 1);
		adj.set("N", i - cellsX);
		adj.set("S", i + cellsX);
		adj.set("NW", i - cellsX - 1);
		adj.set("NE", i - cellsX + 1);
		adj.set("SW", i + cellsX - 1);
		adj.set("SE", i + cellsX + 1);

		let count = 0;
		//Top Edge
		if (i < cellsX) { 
			adj.delete("NW");
			adj.delete("NE");
			adj.delete("N");
		}
		// Left Edge
		if (i % cellsX == 0) { 
			adj.delete("W");
			adj.delete("SW");
			adj.delete("NW");
		}
		// Right Edge
		if (i % cellsX == cellsX) {
			adj.delete("E");
			adj.delete("NE");
			adj.delete("SE");
		}
		// Bottom Edge
		if (i > (i.length - cellsX)) {
			adj.delete("S");
			adj.delete("SW");
			adj.delete("SE");
		}

		for (let a of adj.values()) 
		{
			for (let b of GameState.mineLocations.values())
			{
				if (a == b) {count++;}
			}
		}
		GameState.cells[i].dataset.adjMines = count;
	}

	//Register click handlers

	gameBoard.addEventListener("contextmenu", cellRightClicked.bind(GameState));
	gameBoard.addEventListener("click", cellClicked.bind(GameState));
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
			}
			break;
		}
		case "cell-click":
		case "cell-flagged":
		default: break;
	}
}

document.addEventListener("DOMContentLoaded", evt => main());
