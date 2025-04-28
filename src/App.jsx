import { useState, useEffect } from 'react'
import './App.css'
import GameBoard from './GameBoard';

// Things to do 1. Create a smarter AI, 2. Drag and drop ships, 3. Create a way to pre-move

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

// Map size preview component
const MapSizePreview = ({ size, label, isSelected, onClick }) => {
  const gridSize = BOARD_SIZES[size];
  
  return (
    <div className={`preview-button ${isSelected ? 'bg-blue-100' : ''}`} onClick={onClick}>
      <div className={`map-preview ${size}`}>
        {Array(gridSize).fill().map((_, i) => (
          Array(gridSize).fill().map((_, j) => (
            <div key={`${i}-${j}`} className="map-preview-item"></div>
          ))
        ))}
      </div>
      <div className="map-preview-label">{label}</div>
    </div>
  );
};

function App() {
  const [gamePhase, setGamePhase] = useState('start'); //All phases 'start', 'selectSize', 'playing', 'changePlayer', 'winLoss'
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
    } else {
      setWhosTurn('player2');
    }
  };

  const handlePlayerTwoShot = (x, y) => {
    if(whosTurn !== "player2" || gamePhase !== 'playing2'){
      return;
    }

    const newState = [...playerBoardState.map(row => [...row])];

    if (newState[y][x]?.status === 'hit' || newState[y][x]?.status === 'miss') {
      return;
    }

    if (newState[y][x]?.status === 'ship') {
      const shipId = newState[y][x].shipId;
      const shipIndex = playerShips.findIndex(ship => ship.id === shipId);

      if (shipIndex !== -1) {
        const updatedShips = [...playerShips];

        const sunk = updatedShips[shipIndex].hit();

        newState[y][x] = { status: 'hit', shipId};

        setPlayerShips(updatedShips);

        if (sunk) {
          setPlayerShipsSunk(prev => prev + 1);
        }
      }
    } else {
      newState[y][x] = { status: 'miss'};
    }

    setPlayerBoardState(newState);

    setWhosTurn('player1');
  };

  const aiLogic = () => {
    if (gamePhase !== 'playing') return;
    
    const boardSize = BOARD_SIZES[selectedSize];
    let attempts = 0;
    const maxAttempts = boardSize * boardSize;
    
    const newState = [...playerBoardState.map(row => [...row])];
    
    while (attempts < maxAttempts) {
      const x = Math.floor(Math.random() * boardSize);
      const y = Math.floor(Math.random() * boardSize);
      
      if (newState[y][x]?.status !== "hit" && newState[y][x]?.status !== "miss") {
        if (newState[y][x]?.status === "ship") {
          const shipId = newState[y][x].shipId;
          const shipIndex = playerShips.findIndex(ship => ship.id === shipId);
          
          if (shipIndex !== -1) {
            const updatedShips = [...playerShips];
            
            const sunk = updatedShips[shipIndex].hit();
            
            newState[y][x] = { status: "hit", shipId };
            
            setPlayerShips(updatedShips);
            
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
    
    setTimeout(() => placeRandomShips(size), 100);

    if(playingAgainstAI){
      setGamePhase('playing');
    } else {
      setGamePhase('changePlayer')
    }
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

          if (posX >= boardSize || posY >= boardSize) {
            valid = false;
            break;
          }

          if (newPlayerBoard[posY][posX]?.status === 'ship') {
            valid = false;
            break;
          }

          /*
          I had to ask Claude how I would go about making sure that none of the ships were next to eachother

          Prompt -
          Is it possible that you could run through how I would go about making sure when the 
          randomShips placer is placing the ships it doesnt allow the ships to be next to each other. 
          If it is possible please run through how I would do it. 

          */

          for (let dy = -1; dy <= 1; dy++){
            for (let dx = -1; dx <= 1; dx++){
              const checkX = posX + dx;
              const checkY = posY + dy;

              if (checkX < 0 || checkY < 0 || checkX >= boardSize || checkY >= boardSize) {
                continue;
              }

              if (newPlayerBoard[checkY][checkX]?.status === 'ship') {
                valid = false;
                break;
              }
            }
            if (!valid) break;
          }
          if (!valid) break;
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

          for (let dy = -1; dy <= 1; dy++){
            for (let dx = -1; dx <= 1; dx++){
              const checkX = posX + dx;
              const checkY = posY + dy;

              if (checkX < 0 || checkY < 0 || checkX >= boardSize || checkY >= boardSize) {
                continue;
              }

              if (newOpponentBoard[checkY][checkX]?.status === 'ship') {
                valid = false;
                break;
              }
            }
            if (!valid) break;
          }
          if (!valid) break;
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
    <div className="container mx-auto flex flex-col items-center p-4">
      {gamePhase === 'start' && (
        <div className="startingDiv">
          <h1 className="text-4xl font-bold mb-8">BATTLESHIPS!</h1>
          <div className="flex flex-col gap-4 md:flex-row md:space-x-4">
            <button
              className="button button-primary"
              onClick={playAI}
            >
              Play AI
            </button>
            <button
              className="button button-success"
              onClick={playFriend}
            >
              Play A Friend
            </button>
          </div>
        </div>
      )}

      {gamePhase === 'selectSize' && (
        <div className="pickMapSizeDiv">
          <h1 className="text-3xl font-bold mb-6">Choose Your Map Size</h1>
          
          <div className="map-preview-container">
            <MapSizePreview 
              size="small" 
              label="Small (8×8)" 
              isSelected={selectedSize === 'small'}
              onClick={() => {
                setSelectedSize('small');
                setOpponentShipsSunk(0);
                setPlayerShipsSunk(0);
              }}
            />
            <MapSizePreview 
              size="medium" 
              label="Medium (10×10)" 
              isSelected={selectedSize === 'medium'}
              onClick={() => {
                setSelectedSize('medium');
                setOpponentShipsSunk(0);
                setPlayerShipsSunk(0);
              }}
            />
            <MapSizePreview 
              size="large" 
              label="Large (12×12)" 
              isSelected={selectedSize === 'large'}
              onClick={() => {
                setSelectedSize('large');
                setOpponentShipsSunk(0);
                setPlayerShipsSunk(0);
              }}
            />
          </div>
          
          <div className="flex justify-center mt-4">
            <button 
              className="button button-primary px-6 py-3"
              onClick={() => mapSize(selectedSize)}
            >
              Start Game
            </button>
          </div>
        </div>
      )}
      
      {gamePhase === 'playing' && (
        <div className="game-boards-container">
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2">Your Board</h2>
            <p className="mb-4">Ships Sunk: {playerShipsSunk}/{SHIP_AMOUNTS[selectedSize]}</p>
            <GameBoard 
              size={selectedSize}
              playerBoard={true}
              gameState={playerBoardState}
            />
          </div>

          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2">Opponent's Board</h2>
            <p className="mb-4">Ships Sunk: {opponentShipsSunk}/{SHIP_AMOUNTS[selectedSize]}</p>
            <GameBoard 
              size={selectedSize}
              playerBoard={false}
              onCellClick={(x, y) => handlePlayerShot(x, y)}
              gameState={opponentBoardState}
            />
          </div>
          {whosTurn === "player2" && (
            <div className="flex justify-center mt-4">
              <button 
                className="button button-primary"
                onClick={() => setGamePhase('changePlayer')}
              >
                End Turn
              </button>
            </div>
          )}
        </div>
      )}

      {gamePhase === 'changePlayer' && (
        <div className="flex flex-col items-center gap-8 mt-4 text-center">
          <h1 className="text-4xl font-bold">
            {whosTurn === "player2" ? "Player 2's Turn!" : "Player 1's Turn"}
          </h1>
          <button 
            className="button button-primary"
            onClick={whosTurn === "player2" ? () => setGamePhase('playing2') : () => setGamePhase('playing')}
          >
            Start Turn
          </button>
        </div>
      )}

      {gamePhase === 'playing2' && (
        <div className="game-boards-container">
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2">Opponent's Board</h2>
            <p className="mb-4">Ships Sunk: {playerShipsSunk}/{SHIP_AMOUNTS[selectedSize]}</p>
            <GameBoard 
              size={selectedSize}
              playerBoard={false}
              onCellClick={(x, y) => handlePlayerTwoShot(x, y)}
              gameState={playerBoardState}
            />
          </div>

          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2">Your Board</h2>
            <p className="mb-4">Ships Sunk: {opponentShipsSunk}/{SHIP_AMOUNTS[selectedSize]}</p>
            <GameBoard 
              size={selectedSize}
              playerBoard={true}
              gameState={opponentBoardState}
            />
          </div>
          {whosTurn === "player1" && (
            <div className="flex justify-center mt-4">
              <button 
                className="button button-primary"
                onClick={() => setGamePhase('changePlayer')}
              >
                End Turn
              </button>
            </div>
          )}
        </div>
      )}

      {gamePhase === 'winLoss' && (
        <div className="win-loss-screen">
          {playingAgainstAI === true && (
            <h1 className="text-4xl font-bold">
              {opponentShipsSunk >= SHIP_AMOUNTS[selectedSize] ? "YOU WIN!" : "YOU LOSE!"}
            </h1>
          )} 
          {playingAgainstAI === false && (
            <h1 className="text-4xl font-bold">
              {opponentShipsSunk >= SHIP_AMOUNTS[selectedSize] ? "Player 1 Wins!" : "Player 2 Wins!"}
            </h1>
          )}
          <button 
            className="button button-primary"
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