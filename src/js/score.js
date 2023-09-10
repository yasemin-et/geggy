
window.defaultSend = function() {
    sendScore(100);
}

async function sendScore(score) {
    console.log("Sending game score to background.js");
  
    chrome.runtime.sendMessage({
      command: "score",
      score: score,
    });
}

window.scoreStart = function () {
  window.scoreDone = true;
}

export default scoreStart;