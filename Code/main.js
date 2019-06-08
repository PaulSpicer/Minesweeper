function main()
{
	let cellsX = 10, cellsY = 10;
	let noOfMines = 10;

	// TODO: Set Board Size
	
	// Generate grid
	for(let i = 0; i < (cellsX * cellsY); i++)
	{
		let parent = document.querySelector('.game-board');
		let child = document.createElement('div');
		child.setAttribute('class', 'cell');
		child.data.cellid(i);
		parent.appendChild(child);
	}

	let mineLocations = new Set();

	for(let i = 0; i < noOfMines; i++)
	{	
		let loop = true;		
		while (loop)
		{
			let rand = Math.floor(Math.random() * 100);
			if (!mineLocations.has(rand))
			{
				mineLocations.add(rand);
				loop = false;
			}
		}
	}

	for (cell of document.querySelectorAll(".cell"))
	{
		cell.addEventListener("click", CellClick.bind(mineLocations));
	}
}

function GameState() {
	mineLocations;
	
}


function CellClick(event) {
	console.log(this);
	console.log(event);

	switch (event.target.className) {
		case "cell": 
		{
			if (this.has(event.target.data.cellid))
			{
				//DO FAILURE STUFF
				event.target.className = "cell-clicked-mine";
				for(let mines of this)
				{
					if (!(event.target.data.cellid == mines))
						{
							
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
