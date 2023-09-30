// listen for message to start game, from popup
chrome.runtime.onMessage.addListener(readMessage);
function readMessage(message) {
  console.log("contentscript.js received message");
  if (message.command === "START") {
    startGame();
  }
}

function startGame() {
    // Add new scripts here to be injected on game start
    // IMPORTANT: Make sure game_runner.js is the last script
    const scripts = ["src/js/animator.mjs", "src/js/platformGeneration.js", "src/js/camera.js", "src/js/score.js", "src/js/graphics.js", "src/js/physics.js", "src/js/player.js", "src/js/game_runner.js"];
    loadAll(scripts); 
}

async function loadFile(filepath) {
    const src = chrome.runtime.getURL(filepath);
    const contentMain = await import(src);
    console.log(contentMain);
    contentMain.default();
}

async function loadAll(scripts) {
    console.log("Loading...");
    for (const script of scripts) {
        await loadFile(script); 
    }
    console.log("Finished loading"); 
}