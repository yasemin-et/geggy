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

  (async () => {
    const src = chrome.runtime.getURL("src/js/animator.js");
    const contentMain = await import(src);
    console.log(contentMain);
    contentMain.default();
  })();

  (async () => {
    const src = chrome.runtime.getURL("src/js/platformGeneration.js");
    const contentMain = await import(src);
    console.log(contentMain);
    contentMain.default();
  })();

  (async () => {
    const src = chrome.runtime.getURL("src/js/camera.js");
    const contentMain = await import(src);
    console.log(contentMain);
    contentMain.default();
  })();

  (async () => {
    const src = chrome.runtime.getURL("src/js/score.js");
    const contentMain = await import(src);
    console.log(contentMain);
    contentMain.default();
  })();

  (async () => {
    const src = chrome.runtime.getURL("src/js/graphics.js");
    const contentMain = await import(src);
    console.log(contentMain);
    contentMain.default();
  })();

  (async () => {
    const src = chrome.runtime.getURL("src/js/physics.js");
    const contentMain = await import(src);
    console.log(contentMain);
    contentMain.default();
  })();

  (async () => {
    const src = chrome.runtime.getURL("src/js/player.js");
    const contentMain = await import(src);
    console.log(contentMain);
    contentMain.default();
  })();

  (async () => {
    const src = chrome.runtime.getURL("src/js/popup.js");
    const contentMain = await import(src);
    console.log(contentMain);
    contentMain.default();
  })();
  
  (async () => {
    const src = chrome.runtime.getURL("src/js/game_runner.js");
    const contentMain = await import(src);
    console.log(contentMain);
    contentMain.default();
  })();

  console.log("Starting...");

}

async function sendScore() {
  
}