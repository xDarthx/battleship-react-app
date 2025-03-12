import { useState, useEffect } from 'react'
import './App.css'
import GameBoard from './GameBoard';

const BOARD_SIZES = {
  small: 8,
  medium: 10,
  large: 12
};

const SHIP_AMOUNTS = {
  small: 4,
  medium: 5,
  large: 6
}

class Ship {
  constructor(type, length) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.type = type;
    this.length = length;
    this.hits = 0;
    this.sunk = false;
  }
  
  hit() {
    this.hits++;
    if (this.hits >= this.length) {
      this.sunk = true;
    }
    return this.sunk;
  }
  
  isSunk() {
    return this.sunk;
  }
}

function App() {
  const [gamePhase, setGamePhase] = useState('start'); //All phases 'start', 'selectSize', 'placeShips', 'playing', 'winLoss'
  const [selectedSize, setSelectedSize] = useState('medium');
  const [playingAgainstAI, setPlayingAgainstAI] = useState(true);
  const [whosTurn, setWhosTurn] = useState('player1');

  const [playerShips, setPlayerShips] = useState([]);
  const [opponentShips, setOpponentShips] = useState([]);

  const [playerShipsSunk, setPlayerShipsSunk] = useState(0);
  const [opponentShipsSunk, setOpponentShipsSunk] = useState(0);

  const createInitialBoard = (size) => {
    const boardSize = BOARD_SIZES[size] || BOARD_SIZES.medium;
    return Array(boardSize).fill().map(() => Array(boardSize).fill(null));
  };

  const [playerBoardState, setPlayerBoardState] = useState(createInitialBoard('medium'));
  const [opponentBoardState, setOpponentBoardState] = useState(createInitialBoard('medium'));



  useEffect(() => {
    const newPlayerBoard = createInitialBoard(selectedSize);
    const newOpponentBoard = createInitialBoard(selectedSize);
    
    setPlayerBoardState(newPlayerBoard);
    setOpponentBoardState(newOpponentBoard);
  }, [selectedSize]);

  useEffect(() => {
    if (opponentShipsSunk >= SHIP_AMOUNTS[selectedSize]) {
      setGamePhase('winLoss');
    }
  }, [opponentShipsSunk, selectedSize]);

  useEffect(() => {
    if (playerShipsSunk >= SHIP_AMOUNTS[selectedSize]) {
      setGamePhase('winLoss');
    }
  }, [playerShipsSunk, selectedSize]);

  const handlePlayerShot = (x, y) => {
    if(whosTurn !== "player1" || gamePhase !== 'playing'){
      return;
    }

    const newState = [...opponentBoardState.map(row => [...row])];

    if (newState[y][x]?.status === 'hit' || newState[y][x]?.status === 'miss') {
      return;
    }

    if (newState[y][x]?.status === 'ship') {
      const shipId = newState[y][x].shipId;
      const shipIndex = opponentShips.findIndex(ship => ship.id === shipId);

      if (shipIndex !== -1) {
        const updatedShips = [...opponentShips];

        const sunk = updatedShips[shipIndex].hit();

        newState[y][x] = { status: 'hit', shipId};

        setOpponentShips(updatedShips);

        //I was running some code through an AI chat bot and found out you could do prev
        if (sunk) {
          setOpponentShipsSunk(prev => prev + 1);
        }
      }
    } else {
      newState[y][x] = { status: 'miss'};
    }

    setOpponentBoardState(newState);

    if(playingAgainstAI){
      setWhosTurn('ai');
      setTimeout(aiLogic, 1000);
    }
  };

  const aiLogic = () => {
    if (gamePhase !== 'playing') return;
    
    const boardSize = BOARD_SIZES[selectedSize];
    let attempts = 0;
    const maxAttempts = boardSize * boardSize;
    
    // Copy the state to avoid direct mutation
    const newState = [...playerBoardState.map(row => [...row])];
    
    while (attempts < maxAttempts) {
      const x = Math.floor(Math.random() * boardSize);
      const y = Math.floor(Math.random() * boardSize);
      
      // Check if this cell has already been hit
      if (newState[y][x]?.status !== "hit" && newState[y][x]?.status !== "miss") {
        if (newState[y][x]?.status === "ship") {
          // Find the ship that was hit
          const shipId = newState[y][x].shipId;
          const shipIndex = playerShips.findIndex(ship => ship.id === shipId);
          
          if (shipIndex !== -1) {
            // Create a copy of the ships array
            const updatedShips = [...playerShips];
            
            // Update the ship's hit status
            const sunk = updatedShips[shipIndex].hit();
            
            // Mark the cell as hit
            newState[y][x] = { status: "hit", shipId };
            
            // Update the ships array
            setPlayerShips(updatedShips);
            
            // Check if this ship was sunk
            if (sunk) {
              setPlayerShipsSunk(prev => prev + 1);
            }
          }
        } else {
          newState[y][x] = { status: "miss" };
        }
        
        setPlayerBoardState(newState);
        setWhosTurn('player1');
        return;
      }
      
      attempts++;
    }
    
    console.warn("AI couldn't find a valid move");
    setWhosTurn('player1');
  };

  const playAI = () => {
    setPlayingAgainstAI(true);
    setGamePhase('selectSize');
  };

  const playFriend = () => {
    setPlayingAgainstAI(false);
    setGamePhase('selectSize');
  };

  const mapSize = (size) => {
    setSelectedSize(size);

    setGamePhase('playing');

    setPlayerShipsSunk(0);
    setOpponentShipsSunk(0);
    
    setTimeout(() => placeRandomShips(size), 10);
  };

  const placeRandomShips = (size = selectedSize) => {

    let ships = [];

    if(size === 'small') {
      ships = [
        new Ship('battleship', 4),
        new Ship('cruiser', 3),
        new Ship('submarine', 3),
        new Ship('destroyer', 2)
      ];
    } else if(size  === 'medium') {
      ships = [
        new Ship('carrier', 5),
        new Ship('battleship', 4),
        new Ship('cruiser', 3),
        new Ship('submarine', 3),
        new Ship('destroyer', 2)
      ];
    } else {
      ships = [
        new Ship('mothership', 6),
        new Ship('carrier', 5),
        new Ship('battleship', 4),
        new Ship('cruiser', 3),
        new Ship('submarine', 3),
        new Ship('destroyer', 2)
      ];
    }

    const boardSize = BOARD_SIZES[size];

    const playerShipsArray = ships.map(ship => new Ship(ship.type, ship.length));
    const opponentShipsArray = ships.map(ship => new Ship(ship.type, ship.length));
    
    let newPlayerBoard = Array(boardSize).fill().map(() => Array(boardSize).fill(null));
    let newOpponentBoard = Array(boardSize).fill().map(() => Array(boardSize).fill(null));

    playerShipsArray.forEach(ship => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100; 

      while (!placed && attempts < maxAttempts) {
        attempts++;
        const x = Math.floor(Math.random() * boardSize);
        const y = Math.floor(Math.random() * boardSize);
        const isVertical = Math.random() > 0.5;

        let valid = true;

        for (let i = 0; i < ship.length; i++) {
          const posX = isVertical ? x : x + i;
          const posY = isVertical ? y + i : y;
          // const posXadd = isVertical ? x : x + i + 1;
          // const posYadd = isVertical ? y + i + 1 : y;
          // const posXsub = isVertical ? x : x + i + 1;
          // const posYsub = isVertical ? y + i + 1 : y;

          if (posX >= boardSize || posY >= boardSize) {
            valid = false;
            break;
          }

          if (newPlayerBoard[posY][posX]?.status === 'ship') {
            valid = false;
            break;
          }

          //Need to come back to this, couldnt figure out why it wasnt working

          // if (posX.isVertical == true && newPlayerBoard[posY][posXadd] && posXadd <= boardSize) {
          //   valid = false;
          //   break;
          // } else if (newPlayerBoard[posYadd][posX] === 'ship' && posYadd <= boardSize){
          //   valid = false;
          //   break;
          // }

          // if (posX.isVertical == true && newPlayerBoard[posY][posXsub] && posXsub <= boardSize) {
          //   valid = false;
          //   break;
          // }  else if (newPlayerBoard[posYsub][posX] === 'ship' && posYsub <= boardSize){
          //   valid = false;
          //   break;
          // }
        }

        if (valid) {
          for (let i = 0; i < ship.length; i++) {
            const posX = isVertical ? x : x + i;
            const posY = isVertical ? y + i : y;
            newPlayerBoard[posY][posX] = { status: 'ship', shipId: ship.id };
          }
          placed = true;
        }
      }
      
      if (!placed) {
        console.warn(`Failed to place ${ship.type} on player board`);
      }
    });

    opponentShipsArray.forEach(ship => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!placed && attempts < maxAttempts) {
        attempts++;
        const x = Math.floor(Math.random() * boardSize);
        const y = Math.floor(Math.random() * boardSize);
        const isVertical = Math.random() > 0.5;

        let valid = true;

        for (let i = 0; i < ship.length; i++) {
          const posX = isVertical ? x : x + i;
          const posY = isVertical ? y + i : y;

          if (posX >= boardSize || posY >= boardSize) {
            valid = false;
            break;
          }

          if (newOpponentBoard[posY][posX]?.status === 'ship') {
            valid = false;
            break;
          }
        }

        if (valid) {
          for (let i = 0; i < ship.length; i++) {
            const posX = isVertical ? x : x + i;
            const posY = isVertical ? y + i : y;
            newOpponentBoard[posY][posX] = { status: 'ship', shipId: ship.id};
          }
          placed = true;
        }
      }
      
      if (!placed) {
        console.warn(`Failed to place ${ship.type} on opponent board`);
      }
    });

    setPlayerShips(playerShipsArray);
    setOpponentShips(opponentShipsArray);
    setPlayerBoardState(newPlayerBoard);
    setOpponentBoardState(newOpponentBoard);
  }

  return (
    <div className="flex flex-col items-center p-4">
      {gamePhase === 'start' && (
        <div className="startingDiv">
          <h1>BATTLESHIPS!</h1>
          <div className="space-x-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={playAI}
            >
              Play AI
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={playFriend}
            >
              Play A Friend
            </button>
          </div>
        </div>
      )}

      {gamePhase === 'selectSize' && (
        <div className="pickMapSizeDiv">
          <h1 className="text-2xl font-bold mb-6">Choose Your Map Size</h1>
          <div className="space-x-4">
            <button 
              className="bg-blue-300 px-4 py-2 rounded" 
              onClick={() => mapSize('small')}
            >
              Small
            </button>
            <button 
              className="bg-blue-400 px-4 py-2 rounded" 
              onClick={() => mapSize('medium')}
            >
              Medium
            </button>
            <button 
              className="bg-blue-500 px-4 py-2 rounded" 
              onClick={() => mapSize('large')}
            >
              Large
            </button>
          </div>
        </div>
      )}
      
      {gamePhase === 'playing' && (
        <div className="flex flex-col md:flex-row gap-8 mt-4">
          <div>
            <h2 className="text-xl font-bold mb-2">Your Board</h2>
            <p className="mb-4">Ships Sunk: {playerShipsSunk}/{SHIP_AMOUNTS[selectedSize]}</p>
            <GameBoard 
              size={selectedSize}
              playerBoard={true}
              gameState={playerBoardState}
            />
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">Opponent's Board</h2>
            <p className="mb-4">Ships Sunk: {opponentShipsSunk}/{SHIP_AMOUNTS[selectedSize]}</p>
            <GameBoard 
              size={selectedSize}
              playerBoard={false}
              onCellClick={(x, y) => handlePlayerShot(x, y)}
              gameState={opponentBoardState}
            />
          </div>
        </div>
      )}

      {gamePhase === 'winLoss' && (
        <div className="flex flex-col items-center gap-8 mt-4">
          <h1 className="text-4xl font-bold">
            {opponentShipsSunk >= SHIP_AMOUNTS[selectedSize] ? "YOU WIN!" : "YOU LOSE!"}
          </h1>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => setGamePhase('start')}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default App;