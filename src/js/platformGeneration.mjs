// GENERATES PLATFORMS FOR THE CURRENT WEBSITE TAB AS BLACK BARS COVERING THE SUPPORTED ELEMENT TYPES //

// Functions //

// Platform Generation //
// Creates platforms for individual words in an element.
// O(1)
function generateWordPlatforms(element) {
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
            platforms[i] = new component(rect.width, rect.height, "black", rect.x, rect.y, "platform", true);

        } catch(exception){ 
            //console.log("Failed for " + word);
        }
        start = end + 1;
    }
    return platforms;
}

// Creates a non-word platform object
function generateElementPlatform(element){
    var bounds = element.getBoundingClientRect();
    return new component(bounds.width, bounds.height, "black", bounds.x, bounds.y, "platform", true);
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

    for (var i = 1; i < platforms.length; i++) {
        var currentPlatform = platforms[i];
        if (currentPlatform.y - endPlatform.y >= maxHeight) {
            // we have found the end of a new playable area
            // if this playable area has a greater height than the last one, set it to be the greatest playable area
            if (endPlatform.y - firstPlatform.y > currentHeight) {
                currentHeight = endPlatform.y - firstPlatform.y;
                longestPlayableArea = platforms.slice(firstPlatformIndex, endPlatformIndex + 1); 
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

    return longestPlayableArea; 
}


// Main function //
// Generates platforms for the current website
// Total runtime: O(NlogN)
window.generatePlatforms = function() {
    var platforms = [];    
    var body = document.body;
    var game_height = myGameArea.canvas.height; // the total height of the game area, default to entire canvas size

    // O(N)
    // create platforms for elements on website
    if (body != null) {
        // turns all words inside of elements of these types into individual platforms:
        var supported_text_types = ["p", "span", "a"];
        for (var n = 0; n < supported_text_types.length; n++) {
            // get all elements of this type as a NodeList
            var elementsList = document.querySelectorAll(supported_text_types[n]);
            // add platforms for each element
            for (var i = 0; i < elementsList.length; i++) {
                for (var j = 0; j < elementsList[i].childNodes.length; j++) {
                    platforms = platforms.concat(generateWordPlatforms(elementsList[i].childNodes[j]));
                }
            }
        }
       
        // turns all elements of these other types into platforms:
        var other_types = ["img", "button"];
        for (var i = 0; i < other_types.length; i++) {
            var elements = document.querySelectorAll(other_types[i]);
            for (var j = 0; j < elements.length; j++) {
                platforms.push(generateElementPlatform(elements[j]));
            }
        }
    }

    // O(NlogN + N)
    // sort and remove gaps from platforms
    platforms = sort(platforms);
    platforms = getLongestPlayableArea(platforms); 


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