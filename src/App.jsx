import { useState, useEffect } from 'react'
import './App.css'
import GameBoard from './GameBoard';

const BOARD_SIZES = {
  small: 8,
  medium: 10,
  large: 12
};

function App() {
  const [gamePhase, setGamePhase] = useState('start'); //All phases 'start', 'selectSize', 'placeShips', 'playing', 'winLoss'
  const [selectedSize, setSelectedSize] = useState('medium');
  const [playingAgainstAI, setPlayingAgainstAI] = useState(true);
  const [whosTurn, setWhosTurn] = useState('player1');

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

  const handlePlayerShot = (x, y) => {
    if(whosTurn === "player1"){
      if (opponentBoardState[y][x] === "hit" || opponentBoardState[y][x] === "miss") {
        return;
      }

      const newState = JSON.parse(JSON.stringify(opponentBoardState));

      if (newState[y][x] === "ship") {
        newState[y][x] = "hit";
      } else if (newState[y][x] === null) {
        newState[y][x] = "miss";
      }

      setOpponentBoardState(newState);

      if (playingAgainstAI) {
        setWhosTurn('ai');
        setTimeout(aiLogic, 1000);
      }
    }
  };

  const aiLogic = () => {
    const boardSize = BOARD_SIZES[selectedSize];
    let attempts = 0;
    const maxAttempts = boardSize * boardSize; 
    
    while (attempts < maxAttempts) {
      const x = Math.floor(Math.random() * boardSize);
      const y = Math.floor(Math.random() * boardSize);
      
      const newState = JSON.parse(JSON.stringify(playerBoardState));
      
      if (newState[y][x] !== "hit" && newState[y][x] !== "miss") {
        if (newState[y][x] === "ship") {
          newState[y][x] = "hit";
        } else {
          newState[y][x] = "miss";
        }
        
        setPlayerBoardState(newState);
        setWhosTurn('player1');
        return; 
      }
      
      attempts++;
    }
    
    console.warn("AI couldn't find a valid move");
  };

  class Ship {
    constructor(type, length) {
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
    }
    
    isSunk() {
      return this.sunk;
    }
  }

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
    
    setTimeout(() => placeRandomShips(), 0);
  };

  const placeRandomShips = () => {
    const shipTypes = [
      {type: 'carrier', length: 5},
      {type: 'battleship', length: 4},
      {type: 'cruiser', length: 3},
      {type: 'submarine', length: 3},
      {type: 'destroyer', length: 2}
    ];

    const boardSize = BOARD_SIZES[selectedSize];
    
    let newPlayerBoard = Array(boardSize).fill().map(() => Array(boardSize).fill(null));
    let newOpponentBoard = Array(boardSize).fill().map(() => Array(boardSize).fill(null));

    shipTypes.forEach(ship => {
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

          if (newPlayerBoard[posY][posX] === 'ship') {
            valid = false;
            break;
          }
        }

        if (valid) {
          for (let i = 0; i < ship.length; i++) {
            const posX = isVertical ? x : x + i;
            const posY = isVertical ? y + i : y;
            newPlayerBoard[posY][posX] = "ship";
          }
          placed = true;
        }
      }
      
      if (!placed) {
        console.warn(`Failed to place ${ship.type} on player board`);
      }
    });

    shipTypes.forEach(ship => {
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

          if (newOpponentBoard[posY][posX] === 'ship') {
            valid = false;
            break;
          }
        }

        if (valid) {
          for (let i = 0; i < ship.length; i++) {
            const posX = isVertical ? x : x + i;
            const posY = isVertical ? y + i : y;
            newOpponentBoard[posY][posX] = "ship";
          }
          placed = true;
        }
      }
      
      if (!placed) {
        console.warn(`Failed to place ${ship.type} on opponent board`);
      }
    });

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
          <GameBoard 
            size={selectedSize}
            playerBoard={true}
            gameState={playerBoardState}
          />

          <GameBoard 
            size={selectedSize}
            playerBoard={false}
            onCellClick={(x, y) => handlePlayerShot(x, y)}
            gameState={opponentBoardState}
          />
        </div>
      )}

      {gamePhase === 'winLoss' && (
        <div className="flex flex-col md:flex-row gap-8 mt-4">
          <h1>YOU WIN!</h1>
        </div>
      )}
    </div>
  );
}

export default App;