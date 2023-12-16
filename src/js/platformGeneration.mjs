// GENERATES PLATFORMS FOR THE CURRENT WEBSITE TAB AS BLACK BARS COVERING THE SUPPORTED ELEMENT TYPES //

// Variables //
const supported_text_types = ["p", "span", "a"]; 
const other_types = ["img", "button"];

// Functions //

// Platform Generation //
// Creates platforms for individual words in an element.
// O(1)
function generateWordPlatforms2(element) {
    var range = document.createRange(); // returns a range object, which stores a position and size, initalized to the size of the entire document
    var words;

    // ensure element contains visible text
    if (element.visibility !== "hidden") {
        words = element.textContent.split(" ");
    }
    else {
        return new Array();
    }

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
        platforms = platforms.concat(generateWordPlatforms2(element.childNodes[j])); 
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

    // return true;

    // an element is "visible" if it is none of the following:
    return !(
        style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0 || // styles set to an invisible state
        style.backgroundColor === 'transparent' || (style.backgroundColor === 'rgba(0, 0, 0, 0)' && style.color === 'transparent') || // color set to an invisible state
        (element.offsetWidth === 0 && element.offsetHeight === 0) // dimensions both set to zero
    ); 
}

// Platform Sorting //

// Sorts a list of platlforms by smallest y position using merge sort algorithm
// O(NlogN)
function sort(platforms) {
    // base case: platforms array of size 1 or smaller is already sorted
    if (platforms.length <= 1) {
        return platforms;
    }
    // split the platforms array into two halves
    const middle = Math.floor(platforms.length / 2);
    const left = platforms.slice(0, middle);
    const right = platforms.slice(middle);

    // recursively sort both halves
    const sortedLeft = sort(left);
    const sortedRight = sort(right);

    // merge the sorted halves
    return merge(sortedLeft, sortedRight);
}

// Helper function for merge sort
// Merges two sorted lists of platforms by smallest y position
// O(N)
function merge(leftPlatforms, rightPlatforms) {
    var mergedPlatforms = [];
    var leftPos = 0;
    var rightPos = 0;
    var leftY;
    var rightY;
    var leftSize = leftPlatforms.length;
    var rightSize = rightPlatforms.length;
    var left;
    var right; 

    // compare each platform
    while (leftPos < leftSize && rightPos < rightSize) {
        left = leftPlatforms[leftPos];
        right = rightPlatforms[rightPos];
        // make sure platforms aren't undefined
        if (left === undefined) {
            leftPos++;
        }
        else if (right === undefined) {
            rightPos++;
        }
        // otherwise, compare them
        else {
            leftY = left.y;
            rightY = right.y;
            if (leftY < rightY) {
                // the left platform has a smaller y position, so add it, O(1) amortized
                mergedPlatforms.push(leftPlatforms[leftPos]);
                leftPos++;
            } else {
                // the right platform has a smaller y position, so add it, O(1) amortized
                mergedPlatforms.push(rightPlatforms[rightPos]);
                rightPos++;
            }
        }
    }

    // add the rest of each uncompared platform to the end of the list
    while (leftPos < leftSize) {
        mergedPlatforms.push(leftPlatforms[leftPos]);
        leftPos++; 
    } 
    
    while (rightPos < rightSize) {
        mergedPlatforms.push(rightPlatforms[rightPos]);
        rightPos++; 
    }

    // return the merged array
    return mergedPlatforms; 
}

// Gets the longest playable area, aka the section of the website with the greatest height of playable platforms.
// "Playable" indicates that the next platform isn't too far below the current platform so that it's not visible to the player.
// O(N)
function getLongestPlayableArea(platforms) {
    // make sure platforms has at least two platforms in it
    if (platforms.length < 2) {
        return platforms; 
    }

    var longestPlayableArea = platforms; 
    var maxHeight = window.innerHeight; // the height of the currently visible area in the browser
    var currentHeight = 0; // the height of the current longest playable area
    // the indexes corresponding to the longest playable area in the array of all platforms
    var firstPlatformIndex = 0;
    var endPlatformIndex = 0; 

    // the platforms corresponding to the first and last platform in the longest playable area
    var firstPlatform = platforms[0];
    var endPlatform = platforms[0];

    // discount the platforms at the very top of the webpage, usually headers
    while (firstPlatform.y < 100 && firstPlatformIndex < platforms.length) {
        firstPlatform = platforms[firstPlatformIndex];
        endPlatform = platforms[endPlatformIndex]; 
        firstPlatformIndex++; 
        endPlatformIndex++;
    }

    for (var i = firstPlatformIndex; i < platforms.length; i++) {
        var currentPlatform = platforms[i];
        if (currentPlatform.y - endPlatform.y >= maxHeight) {
            // we have found the end of a new playable area
            // if this playable area has a greater height than the last one, set it to be the greatest playable area
            if (endPlatform.y - firstPlatform.y > currentHeight) {
                currentHeight = endPlatform.y - firstPlatform.y;
            }

            // set this platform to be the start of the next playable area
            firstPlatformIndex = i;
            firstPlatform = currentPlatform; 
            endPlatformIndex = i;
            endPlatform = currentPlatform; 
        } else {
            // add this platform to the current playable area
            endPlatform = currentPlatform;
            endPlatformIndex = i; 
        }
    }

    longestPlayableArea = platforms.slice(firstPlatformIndex, endPlatformIndex + 1); 
    return longestPlayableArea; 
}

// Main function //

// Recursively generates a platform for each element and its children in the body, then sorts and accounts for edge cases
window.generatePlatforms = function () {
    // O(N)
    // get all valid, visible platforms
    platforms = getVisiblePlatforms(document.body); 
    console.log(platforms);

    // O(NlogN)
    // sort and remove gaps from platforms
    platforms = sort(platforms);
    platforms = getLongestPlayableArea(platforms);

    // O(1)
    // create ending platform at the very bottom of the playable game area
    var game_height = myGameArea.canvas.height; // the total height of the game area, default to entire canvas size
    var endY = platforms[platforms.length - 1].y + 120;
    if (endY > game_height) {
        endY = game_height - 10;
    }
    platforms.push(new component(myGameArea.canvas.width, 10, "green", 0, endY, "end_platform", true));
    myGameArea.canvas.height = endY + 10;

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


// Second version


// Generates platforms for the current website
// Total runtime: O(NlogN)
window.generatePlatforms2 = function() {
    var platforms = [];    
    var body = document.body;
    var game_height = myGameArea.canvas.height; // the total height of the game area, default to entire canvas size

    // O(N)
    // create platforms for elements on website
    if (body != null) {
        // turns all words inside of elements of these types into individual platforms:
        for (var n = 0; n < supported_text_types.length; n++) {
            // get all elements of this type as a NodeList
            var elementsList = document.body.querySelectorAll(supported_text_types[n]);
            // add platforms for each element
            for (var i = 0; i < elementsList.length; i++) {
                for (var j = 0; j < elementsList[i].childNodes.length; j++) {
                    platforms = platforms.concat(generateWordPlatforms2(elementsList[i].childNodes[j]));
                }
            }
        }
       
        // turns all elements of these other types into platforms:
        for (var i = 0; i < other_types.length; i++) { 
            var elements = document.body.querySelectorAll(other_types[i]);
            for (var j = 0; j < elements.length; j++) {
                platforms.push(generateElementPlatform(elements[j]));
            }
        }
    }

    // O(NlogN)
    // sort and remove gaps from platforms
    platforms = sort(platforms);
    platforms = getLongestPlayableArea(platforms); 

    // O(N)
    // create ending platform at the very bottom of the playable game area
    var endY = platforms[platforms.length - 1].y + 120;
    if (endY > game_height) {
        endY = game_height - 10; 
    }
    platforms.push(new component(myGameArea.canvas.width, 10, "green", 0, endY, "end_platform", true));
    myGameArea.canvas.height = endY + 10; 

    return platforms;
}

window.platformStart = function () {
    window.platformDone = true;
}

export default platformStart;