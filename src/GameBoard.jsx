/*
This is the prompt I started with and I used Claude as my choice of AI chatbot.
Also I will be putting all the other prompts I used 
because I had to teach Claude how to fix his mess of code but we got through it :insert crying emoji:

1#
Hi Claude, I have a scenario for you:
You are a junior developer and I am your senior, we are currently working on a battleship project using react. 
I have given you the task to create the game board function that can be customized to be 3 different sizes 
and your allowed to decide what those sizes are. 
The main thing with the game board function though is it needs to be able to have ships placed on it 
and clicked on from the opposing AI. 
Can you please do this for me?

2#
Hi Claude, you are a junior developer and I am the senior developer. 
We are currently working on a battleship game and I have tasked you with creating the gameboard side. 
This currently what you have and what the html is outputting. Also known issues is that the board doesnt work if you select large,
 and if you select small then it doesnt properly load the ships. 
Please fix the game board and if you find any errors please fix those as well.

(This is me finally realizing he was using tailwind and that I infact do not want to implement tailwind)
3#
Can you turn all of those className styles into a css, 
because those classname's do not exist and are throwing errors

(I changed some things so I asked him to rework his code around it and I wanted to see if he would ask any questions... he didnt)
4#
I have changed the way that ships are loaded in as and they are now objects.
Claude I am going to need you to fix your gameboard code to properly load the ships,
and this proberly means your going to need to swap out certain sections that see if something has
'ship' and make sure it has ?.status on it before checking to see if it has 'ship'. If you have any
other questions please ask, I dont want you to try and do all of this unless you fully know what 
I am talking about.

*/

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
    let baseClass = "board-cell ";
    
    if (cellState === null) {
      baseClass += "bg-blue-100 hover:bg-blue-200";
    } else if (cellState?.status === "ship" && isPlayerBoard) {
      baseClass += "bg-gray-600";
    } else if (cellState?.status === "hit") {
      baseClass += "bg-red-500";
    } else if (cellState?.status === "miss") {
      baseClass += "bg-blue-300";
    } else {
      // For opponent's ships that haven't been hit yet - show as empty
      baseClass += "bg-blue-100 hover:bg-blue-200";
    }
    
    if (!isPlayerBoard && (cellState === null || cellState?.status === "ship")) {
      baseClass += " cursor-pointer";
    }
    
    return baseClass;
  };
  
  // Generate cell content based on its state
  const getCellContent = (cellState, isPlayerBoard) => {
    if (cellState?.status === "hit") {
      return "✗";
    } else if (cellState?.status === "miss") {
      return "○";
    } else if (cellState?.status === "ship" && isPlayerBoard) {
      return "■";
    }
    return "";
  };
  
  // Handle cell click and call the parent's onCellClick if defined
  const handleCellClick = (x, y) => {
    if (!playerBoard && onCellClick && (gameState[y][x] === null || gameState[y][x]?.status === "ship")) {
      onCellClick(x, y);
    }
  };
  
  // Generate column headers (A, B, C, etc.)
  const renderColumnHeaders = () => {
    const headers = [];
    for (let i = 0; i < boardSize; i++) {
      headers.push(
        <div key={`col-${i}`} className="board-cell flex items-center justify-center font-bold">
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
  
  // Determine the board container class based on size
  const getBoardContainerClass = () => {
    let baseClass = "flex flex-col items-center mb-8 ";
    
    switch (size) {
      case 'small':
        baseClass += "board-small";
        break;
      case 'large':
        baseClass += "board-large";
        break;
      default:
        baseClass += "board-medium";
    }
    
    return baseClass;
  };
  
  return (
    <div className={getBoardContainerClass()}>
      <div className="board-inner-container">
        <div className="flex">
          <div className="board-cell"></div> {/* Empty corner cell */}
          <div className="flex">{renderColumnHeaders()}</div>
        </div>
        
        {Array(boardSize).fill().map((_, y) => (
          <div key={`row-${y}`} className="flex">
            <div className="board-cell flex items-center justify-center font-bold">
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
      
      <div className="ships-status mt-4">
        {playerBoard && (
          <div className="legend text-center mb-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-600 mr-2"></div>
                <span>Your Ship</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 mr-2"></div>
                <span>Hit</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-300 mr-2"></div>
                <span>Miss</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;