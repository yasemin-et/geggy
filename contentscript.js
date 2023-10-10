// STARTS THE GAME AFTER RECEIVING MESSAGE FROM POPUP.JS //

// Listen for message to start game, from popup
chrome.runtime.onMessage.addListener(readMessage);
function readMessage(message) {
  console.log("contentscript.js received message");
  if (message.command === "START") {
    startGame();
  }
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