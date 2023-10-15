// STARTS THE GAME AFTER RECEIVING MESSAGE FROM POPUP.JS //

// Listen for message to start game, from popup
chrome.runtime.onMessage.addListener(readMessage);
function readMessage(message, sender, sendResponse) {
    console.log("contentscript.js received message");
    if (message.command === "START") {
        startGame();
    } else if (message.command === "RESTART") {
        window.reset();
        startGame();
    }
    else if (message.command === "GET_GAME_STATE") {
        sendResponse({ state: getGameState() });
    }
}

// Returns the current state of the game: if it hasn't been started, is in game, or has ended
function getGameState() {
    var prevGameArea = document.getElementById("geggy_canvas");
    if (typeof (prevGameArea) != 'undefined' && prevGameArea != null) {
        // game has been started
        if (window.gameEnded) {
            return "ended";
        } else {
            return "in_game";
        }
    } 
    // game hasn't been started
    return "not_started"; 
}

// Starts the game
function startGame() {
    // Add new scripts here to be injected on game start
    // IMPORTANT: Make sure gameRunner.js is the last script
    const scripts = ["src/js/animator.mjs", "src/js/camera.mjs", "src/js/graphics.mjs", "src/js/physics.mjs", "src/js/platformGeneration.mjs", "src/js/player.mjs", "src/js/gameRunner.mjs"];
    loadAll(scripts); 
}

// Asynchronously loads a file from a given string filepath
async function loadFile(filepath) {
    const src = chrome.runtime.getURL(filepath);
    const contentMain = await import(src);
    console.log(contentMain);
    contentMain.default();
}

// Loads every file in order
async function loadAll(scripts) {
    console.log("Loading...");
    for (const script of scripts) {
        await loadFile(script); 
    }
    console.log("Finished loading"); 
}