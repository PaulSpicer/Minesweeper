function main()
{
	let cellsX = 10, cellsY = 10;
	let noOfMines = 10;

	let GameState = {
		mineLocations: new Set(),
		cells: new Array(cellsX * cellsY)
	}

	// TODO: Set Board Size
	
	// Generate grid

	let gameBoard = document.querySelector('.game-board');
	for(let i = 0; i < GameState.cells.length; i++)
	{
		let child = document.createElement('div');
		child.setAttribute('class', 'cell');
		child.dataset.cellid = i;
		gameBoard.appendChild(child);
		GameState.cells[i] = child;
	}

	for(let i = 0; i < noOfMines; i++)
	{	
		let loop = true;		
		while (loop)
		{
			let rand = Math.floor(Math.random() * 100);
			if (!GameState.mineLocations.has(rand))
			{
				GameState.mineLocations.add(rand);
				loop = false;
			}
		}
	}

	for (let cell of GameState.cells)
	{
		cell.addEventListener("click", cellClick.bind(GameState));
	}
}



function cellClick(event) {
	console.log(this);
	console.log(event);

	switch (event.target.className) {
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
			}
			break;
		}
		case "cell-click":
		case "cell-flagged":
		default: break;
	}
}

document.addEventListener('DOMContentLoaded', evt => main());
