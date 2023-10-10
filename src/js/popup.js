// HANDLES TITLE SCREEN DISPLAY

// Display correct screen on click
document.getElementById("start-button").addEventListener("click", startGame);
document.getElementById("leaderboard-button").addEventListener("click", toggleTitle);
document.getElementById("lb-c-back").addEventListener("click", toggleTitle);
document.getElementById("lb-a-back").addEventListener("click", toggleTitle);
document.getElementById("current-web-button").addEventListener("click", toggleCurrentLeaderboard);
document.getElementById("all-web-button").addEventListener("click", toggleAllLeaderboard);
document.getElementById("dev-panel-button").addEventListener("click", toggleDevPanel);
document.getElementById("dev-panel-back").addEventListener("click", toggleDevPanel);
document.getElementById("add-score-button").addEventListener("click", addTestScore);
document.getElementById("reset-score-button").addEventListener("click", resetAllTestScores);
title_screen = document.getElementById("title-screen");
selection = document.getElementById("selection");
current_leaderboard = document.getElementById("current-web-leaderboard");
all_leaderboard = document.getElementById("all-web-leaderboard");
dev_panel = document.getElementById("dev-panel");
dev_panel_button = document.getElementById("dev-panel-button");

// Display dev panel button if Shift key is pressed
document.addEventListener('keydown', (event) => {
  var key_pressed = event.key;
  if (key_pressed == "Shift") {
    dev_panel_button.style.visibility = "visible";
  }
}, false);

// Send message to start game to contentscript.js
async function startGame() {
  console.log("Sending message to start game.");
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true
  });
  const tab = tabs[0];
  chrome.tabs.sendMessage(tab.id, {
    command: "START"
  });

  window.close();
}

// Send message to load scores in leaderboards to background.js
async function requestScores(tableID) {
  var url = "All"
  if (tableID.includes("current")) {
    var url = await getCurrentTab();
  }
  console.log("Sending message to load scores to " + url);
  (async () => {
    const response = await chrome.runtime.sendMessage({type: "request", request: "load scores", table: tableID, tab: url});
    console.log("Received: " + response);
    if (!(response === undefined)) {
      var scores = response.scores;
      var i = 1;
      var table = document.getElementById(tableID);

      // removing content of table
      var rows = table.rows.length;
      console.log("Deleting " + (rows-1) + " rows.");
      for (n=1; n<rows; n++) {
        table.deleteRow(1);
      }
      
      console.log(scores);
      scores.forEach(function(score) {
        var row = table.insertRow(i);
        row.insertCell(0).innerHTML = i;
        if (tableID.includes("all")) {
          var data = score.split("-");
          row.insertCell(1).innerHTML = data[0]

          // shorten long URLs
          if (data[1].includes("https://")) {
            data[1] = data[1].substring(8);
          }
          if (data[1].length >= 27) {
            row.insertCell(2).innerHTML = data[1].substring(0, 27) + "...";
          } else {
            row.insertCell(2).innerHTML = data[1];
          }
        } else {
          row.insertCell(1).innerHTML = score;
        }
        i++;
      });
    }
  })();
}

// Send message to add a personal test score (score = 0, website = "test score") to background.js
function addTestScore() {
  console.log("Sending message to add fake score.");
  (async () => {
    var url = await getCurrentTab();
    chrome.runtime.sendMessage({type: "score", tab: url, score: "0"});
  })();
}

// Deletes all test scores PERMANENTLY
function resetAllTestScores() {
  if (window.confirm("WARNING: This will PERMANENTLY DELETE your scores. Are you sure?")) {
    chrome.storage.sync.clear();
    window.alert("All data deleted. :( Bye bye data!");
    console.log("Deleted all personal data from chrome storage.");
  }
}

// Shows the dev panel
function showDevButtons() {
  document.getElementById("dev-panel-button").visibility = 'visible';
}

// PAGE TOGGLE FUNCTIONS //
// Toggles the default title screen
function toggleTitle() {
  if (title_screen.style.visibility === 'hidden') { // opening
    title_screen.style.visibility = 'visible';
    dev_panel_button.style.visibility = 'hidden';
    selection.style.visibility = 'hidden';
    current_leaderboard.style.visibility = 'hidden';
    all_leaderboard.style.visibility = 'hidden';
  } else { // closing
    title_screen.style.visibility = 'hidden';
    dev_panel_button.style.visibility = 'hidden';
    selection.style.visibility = 'visible';
    current_leaderboard.style.visibility = 'hidden';
    all_leaderboard.style.visibility = 'hidden';
  }
}

// Toggles the current website leaderboard
function toggleCurrentLeaderboard() {
  if (current_leaderboard.style.visibility === 'hidden') { // opening
    title_screen.style.visibility = 'hidden';
    dev_panel_button.style.visibility = 'hidden';
    selection.style.visibility = 'hidden';
    current_leaderboard.style.visibility = 'visible';
    all_leaderboard.style.visibility = 'hidden';
    requestScores("current-personal");
    //requestScores("current-global");
  } else { // closing
    title_screen.style.visibility = 'hidden';
    dev_panel_button.style.visibility = 'hidden';
    selection.style.visibility = 'visible';
    current_leaderboard.style.visibility = 'hidden';
    all_leaderboard.style.visibility = 'hidden';
  }
}

// Toggles the all websites leaderboard
function toggleAllLeaderboard() {
  if (all_leaderboard.style.visibility === 'hidden') { // opening
    title_screen.style.visibility = 'hidden';
    dev_panel_button.style.visibility = 'hidden';
    selection.style.visibility = 'hidden';
    current_leaderboard.style.visibility = 'hidden';
    all_leaderboard.style.visibility = 'visible';
    requestScores("all-personal");
    //requestScores("all-global");
  } else { // closing
    title_screen.style.visibility = 'hidden';
    dev_panel_button.style.visibility = 'hidden';
    selection.style.visibility = 'visible';
    current_leaderboard.style.visibility = 'hidden';
    all_leaderboard.style.visibility = 'hidden';
  }
}

// Toggles the developer panel
function toggleDevPanel() {
  if (dev_panel.style.visibility === 'hidden') { // opening
    dev_panel.style.visibility = 'visible';
  }
  else { // closing
    dev_panel.style.visibility = 'hidden';
  }
}

// Gets the current tab url
async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab.url; 
}