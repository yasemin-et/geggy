// GENERATES PLATFORMS FOR THE CURRENT WEBSITE TAB AS BLACK BARS COVERING THE SUPPORTED ELEMENT TYPES //

// Variables //
const supported_text_types = ["p", "span", "a"]; 
const other_types = ["img", "button"];
var platforms;

// Functions //

// Platform Generation //
// Creates platforms for individual words in an element.
// O(1)
function splitWordsToPlatforms(element) {
    var range = document.createRange(); // returns a range object, which stores a position and size, initalized to the size of the entire document
    var words = element.textContent.split(" "); 
    var platforms = new Array(words.length);
    var start = 0;
    var end;

    // create a platform for each word in the element
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        try {
            // find the bounds of the word and update the range
            end = start + word.length;
            range.setStart(element, start);
            range.setEnd(element, end);

            // get a rect representation of the range
            // not getBoundingClientRect as word could wrap
            var rects = range.getClientRects();
            var rect = rects[0]; // just get the first client rect that shows up

            // create a component based on the rect and add it to platforms
            platforms[i] = new component(rect.width, rect.height, "black", rect.x, rect.y, "platform", true, element);
            // console.log(word);
            // console.log("Returning: " + platforms); 

        } catch(exception){ 
            //console.log("Failed for " + word);
        }
        start = end + 1;
    }
    return platforms;
}

// Creates platforms for individual words in an element.
// O(1)
function generateWordPlatforms(element) {
    platforms = []; 
    for (var j = 0; j < element.childNodes.length; j++) {
        platforms = platforms.concat(splitWordsToPlatforms(element.childNodes[j])); 
    }
    return platforms; 
}

// Creates a non-word platform object
function generateElementPlatform(element){
    var bounds = element.getBoundingClientRect();
    return new component(bounds.width, bounds.height, "black", bounds.x, bounds.y, "platform", true);
}

// Returns true if an element is visible
function isElementVisible(element) {
    let style = window.getComputedStyle(element);

    // an element is "visible" if it is none of the following:
    return !(
        style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0 || // styles set to an invisible state
        style.position === 'sticky' || // sticky elements are hard to track, so don't
        style.backgroundColor === 'transparent' || (style.backgroundColor === 'rgba(0, 0, 0, 0)' && style.color === 'transparent') // color set to an invisible state
    ); 
}

// Compares two platforms and returns true if the first appears before the second
function comparePlatforms(firstPlatform, secondPlatform) {
    return firstPlatform.y - secondPlatform.y; 
}


// Gets the longest playable area, aka the section of the website with the greatest height of playable platforms.
// "Playable" indicates that the next platform isn't too far below the current platform so that it's not visible to the player.
// O(N)
function getLongestPlayableArea(platforms) {
    platforms = platforms.filter(element => element !== undefined);  // remove all undefined elements

    // make sure platforms has at least three platforms in it
    if (platforms.length < 2) {
        return platforms; 
    }

    // the indexes corresponding to the longest playable area in the array of all platforms
    var firstPlatformIndex = 0;
    var endPlatformIndex = 0; 
    // discount the platforms at the very top of the webpage, usually headers
    while (platforms[firstPlatformIndex].y < 150 && firstPlatformIndex < platforms.length) {
        firstPlatformIndex++; 
        endPlatformIndex++;
    }

    endPlatformIndex = platforms.length - 1; 

    platforms = platforms.slice(firstPlatformIndex, endPlatformIndex + 1); 
    return platforms; 
}

// Main function //

// Recursively generates a platform for each element and its children in the body, then sorts and accounts for edge cases
window.generatePlatforms = function () {
    // scroll to top to ensure platforms generated correspond to starting camera position
    window.scrollTo(0, 0);

    // O(N)
    // get all valid, visible platforms
    platforms = getVisiblePlatforms(document.body); 
    platforms = platforms.filter(element => element !== undefined);  // remove all undefined elements

    // O(NlogN)
    // sort and remove gaps from platforms
    platforms.sort(comparePlatforms);
    platforms = getLongestPlayableArea(platforms);

    // O(1)
    // create ending platform at the very bottom of the playable game area
    var game_height = myGameArea.canvas.height; // the total height of the game area, default to entire canvas size
    // console.log(platforms[platforms.length - 1])
    var endY = platforms[platforms.length - 1].y + 120;
    if (endY > game_height) {
        endY = game_height - 10;
    }
    platforms.push(new component(myGameArea.canvas.width, 10, "green", 0, endY, "end_platform", true));
    myGameArea.canvas.height = endY + 30;

    return platforms;
}

// Recursively generates a platform for the given element and its children
function getVisiblePlatforms(element) {
    // console.log(element); 
    var platforms = []; 

    if (isElementVisible(element)) {
        // if it's of a valid type, generate platforms for it
        if (supported_text_types.includes(element.tagName.toLowerCase())) {
            platforms = platforms.concat(generateWordPlatforms(element)); 
        }
        else if (other_types.includes(element.tagName.toLowerCase())) {
            platforms = platforms.concat(generateElementPlatform(element)); 
        }

        // Iterate through children as well
        var children = element.children;  
        for (let i = 0; i < children.length; i++) { 
            platforms = platforms.concat(getVisiblePlatforms(children[i]));
        }
    }

    return platforms;
}

window.platformStart = function () {
    window.platformDone = true;
}

export default platformStart;