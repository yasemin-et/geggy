window.defaultSend = function() {
    sendScore(100, "Test-Default");
}

async function sendScore(score, player) {
    console.log("Sending score to background.js");
  
    chrome.runtime.sendMessage({
      command: "SCORE",
      score: score,
      player: player
    });
}

window.scoreStart = function () {
  window.scoreDone = true;
}

export default scoreStart;