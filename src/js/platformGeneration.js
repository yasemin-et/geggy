// Creates platforms for individual words in an element. 
function generateTextPlatforms(element) {
    var range = document.createRange(); // returns a range object, which stores a position and size, initalized to the size of the entire document
    var words;
    console.log(element);

    // ensure element contains text
    if (element.textContent != null) {
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
        //console.log("word: " + word);
        try {
            // find the bounds of the word and update the range
            end = start + word.length;
            range.setStart(element, start);
            range.setEnd(element, end);

            // get a rect representation of the range
            // not getBoundingClientRect as word could wrap
            var rects = range.getClientRects();
            var rect = rects[0]; // just get the first client rect that shows up

            // create a platform based on the rect
            platforms[i] = new component(rect.width, rect.height, "black", rect.x, rect.y, "platform", true);
            //console.log("score: " + platforms[i].score);
            //console.log(platforms[i]);

        } catch(exception){ 
            console.log("Failed for " + word);
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

// Generates platforms for the current website
window.generatePlatforms = function() {
    var platforms = [];    
    var body = document.body;

    if (body != null) {
        // turns all words inside of elements of these types into individual platforms:
        var supported_text_types = ["p", "span", "a"];
        for (var n = 0; n < supported_text_types.length; n++) {
            // get all elements of this type as a NodeList
            var elementsList = document.querySelectorAll(supported_text_types[n]);
            // add platforms for each element
            for (var i = 0; i < elementsList.length; i++) {
                for (var j = 0; j < elementsList[i].childNodes.length; j++) {
                    platforms = platforms.concat(generateTextPlatforms(elementsList[i].childNodes[j]));
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

    return platforms;
}

window.platformStart = function () {
    window.platformDone = true;
}

export default platformStart;