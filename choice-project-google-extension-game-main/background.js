chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.type === "request") {
        findScores(request.table, "All").then(scores => {
            console.log("Sending response " + scores);
            sendResponse({scores});
        });
      } 
      else if (request.type === "score") {
        saveScore(request.website, request.score, request.tab);
        sendResponse("Finished adding score " + request.score);
      }
      return true;
    }
);

/** Returns an array of stored scores corresponding to the given table
 *  NOTE: Use website key "All" to get scores for all websites
 *  
 *  @param {String} table The id of the html table to find corresponding scores for
 *  @param {String} website The website key to lookup
 *  @returns {Array} The array of scores stored for given website
 */
async function findScores(table, website) {
    const categories = table.split("-");
    if (categories.includes("personal")) {
        const response = await chrome.storage.sync.get([website]);
        if (response[website] !== undefined) {
            console.log("Found " + response[website]);
            return response[website];
        }
    } else if (categories.includes("global")){
        // TODO: Add global leaderboards
        return ["-"];
    }
    console.log("Didn't find any score");
    return true; // keep messaging channel open for sendResponse
}

/** Saves a score to chrome storage using website as the key.
 *  Scores saved under "All" have conventions "scoresValue-WebsiteURL"
 * 
 *  @param {String} website The website key to save from score.js
 *  @param {String} score The score value to save from score.js
 */
function saveScore(website, score, url) {
    chrome.storage.sync.get(website, function(response){
        scores = response[website] || [];
        var i = 0;
        var scoreToCompare = scores[i];
        var scoreToAdd = score;
        if (website === "All") {
            scoreToAdd = score + "-" + url;
            if (!(scores[i] === undefined)) {
                scoreToCompare = scores[i].split("-")[0];
            }
        }
        while (score < scoreToCompare && i < scores.length()) {
            i++;
            scoreToCompare = scores[i];
            if (website === "All") {
                scoreToCompare = scores[i].split("-")[0];
            }
        }
        if (i < 10) {
            scores.splice(i, 0, scoreToAdd);
            if(scores.length>10){
                scores.pop();
            }
            console.log("Adding new score " + scoreToAdd + " to key " + website);
        }
        if (!(website === "All")) {
            saveScore("All", score, url);
        }

        chrome.storage.sync.set({ [website]: scores });
        });
}

/**
 *  Alerts console when storage is updated.
 */
chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      console.log(
        `Storage key "${key}" in namespace "${namespace}" changed.`,
        `Old value was "${oldValue}", new value is "${newValue}".`
      );
    }
  });


/**
 * 
 * @returns 
 */
async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab.url;
}

/**
 * 
 * @param {*} key 
 * @returns 
 */
const readLocalStorage = async (key) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], function (result) {
        if (result[key] === undefined) {
          reject();
        } else {
          resolve(result[key]);
        }
      });
    });
};