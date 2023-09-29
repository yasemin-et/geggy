// listen for message to start game, from popup
chrome.runtime.onMessage.addListener(readMessage);
function readMessage(message) {
  console.log("contentscript.js received message");
  if (message.command === "START") {
    startGame();
  }
}


window.animatorDone = false;
window.cameraDone = false;
window.platformDone = false;
window.playerDone = false;
window.scoreDone = false;
window.graphicsDone = false;
window.physicsDone = false;

function startGame() {
    // Add new scripts here to be injected on game start
    const scripts = ["src/js/animator.mjs", "src/js/platformGeneration.js", "src/js/camera.js", "src/js/score.js", "src/js/graphics.js", "src/js/physics.js", "src/js/player.js"];
    scripts.forEach(loadFile);  

    // wait for all scripts to be loaded
    // yes this is a bad way to do it but i dont have time to learn webpack
    delay(100).then(() => loadFile("src/js/game_runner.js"));
}

async function loadFile(filepath) {
    const src = chrome.runtime.getURL(filepath);
    const contentMain = await import(src);
    console.log(contentMain);
    contentMain.default();
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}