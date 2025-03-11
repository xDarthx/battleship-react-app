import React from 'react';

const GameBoard = ({ size, playerBoard, gameState, onCellClick }) => {
  // Get the numerical size of the board
  const getBoardSize = () => {
    const sizes = {
      small: 8,
      medium: 10,
      large: 12
    };
    return sizes[size] || sizes.medium;
  };

  const boardSize = getBoardSize();
  
  // Generate CSS classes for each cell based on its state
  const getCellClass = (cellState, isPlayerBoard) => {
    let baseClass = "w-8 h-8 border border-gray-400 flex items-center justify-center ";
    
    if (cellState === null) {
      baseClass += "bg-blue-100 hover:bg-blue-200";
    } else if (cellState === "ship" && isPlayerBoard) {
      baseClass += "bg-gray-600";
    } else if (cellState === "hit") {
      baseClass += "bg-red-500";
    } else if (cellState === "miss") {
      baseClass += "bg-blue-300";
    } else {
      // For opponent's ships that haven't been hit yet - show as empty
      baseClass += "bg-blue-100 hover:bg-blue-200";
    }
    
    if (!isPlayerBoard && (cellState === null || cellState === "ship")) {
      baseClass += " cursor-pointer";
    }
    
    return baseClass;
  };
  
  // Generate cell content based on its state
  const getCellContent = (cellState, isPlayerBoard) => {
    if (cellState === "hit") {
      return "✗";
    } else if (cellState === "miss") {
      return "○";
    } else if (cellState === "ship" && isPlayerBoard) {
      return "■";
    }
    return "";
  };
  
  // Handle cell click and call the parent's onCellClick if defined
  const handleCellClick = (x, y) => {
    if (!playerBoard && onCellClick && (gameState[y][x] === null || gameState[y][x] === "ship")) {
      onCellClick(x, y);
    }
  };
  
  // Generate column headers (A, B, C, etc.)
  const renderColumnHeaders = () => {
    const headers = [];
    for (let i = 0; i < boardSize; i++) {
      headers.push(
        <div key={`col-${i}`} className="w-8 h-8 flex items-center justify-center font-bold">
          {String.fromCharCode(65 + i)}
        </div>
      );
    }
    return headers;
  };

  // Safety check for gameState dimensions
  if (!gameState || gameState.length !== boardSize) {
    console.error(`Invalid game state: Expected ${boardSize} rows but got ${gameState?.length}`);
    return <div>Loading board...</div>;
  }
  
  // Check that each row has the correct length
  for (let i = 0; i < gameState.length; i++) {
    if (gameState[i].length !== boardSize) {
      console.error(`Invalid game state: Row ${i} has ${gameState[i].length} cells instead of ${boardSize}`);
      return <div>Loading board...</div>;
    }
  }
  
  return (
    <div className="flex flex-col items-center mb-8">
      <h2 className="text-xl font-bold mb-2">
        {playerBoard ? "Your Fleet" : "Enemy Waters"}
      </h2>
      
      <div className="flex">
        <div className="w-8 h-8"></div> {/* Empty corner cell */}
        <div className="flex">{renderColumnHeaders()}</div>
      </div>
      
      {Array(boardSize).fill().map((_, y) => (
        <div key={`row-${y}`} className="flex">
          <div className="w-8 h-8 flex items-center justify-center font-bold">
            {y + 1}
          </div>
          
          <div className="flex">
            {Array(boardSize).fill().map((_, x) => (
              <div
                key={`cell-${x}-${y}`}
                className={getCellClass(gameState[y][x], playerBoard)}
                onClick={() => handleCellClick(x, y)}
              >
                {getCellContent(gameState[y][x], playerBoard)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GameBoard;