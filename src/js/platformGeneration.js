// finds individual words in a paragraph
function findClickedWord(parentElt) {
    var range = document.createRange();
    var words;
    if (parentElt.textContent != null) {
        words = parentElt.textContent.split(" ");
    }
    else {
        return new Array();
    }
    var platforms = new Array(words.length);
    var start = 0;
    var end;
    //console.log(words);
    for (var i = 0; i < words.length; i++) {

        var word = words[i];
        //console.log("word: " + word);
        try{
            end = start + word.length;
            range.setStart(parentElt, start);
            range.setEnd(parentElt, end);
            // not getBoundingClientRect as word could wrap
            // just get the first client rect that shows up
            var rects = range.getClientRects();
            var rect = rects[0];
            platforms[i] = new component(rect.width, rect.height, "black", rect.x, rect.y, "platform", true);
            //console.log("score: " + platforms[i].score);
            //console.log(platforms[i]);

        } catch(exception){ 

        }
        start = end + 1;
    }
    return platforms;
}

// create a non-word platform object
function generateElementPlatform(element){
    var bounds = element.getBoundingClientRect();
    console.log("component needed");
    return new component(bounds.width, bounds.height, "black", bounds.x, bounds.y, "platform", true);
}

// main function to generate every platform
window.generatePlatforms = function() {
    var platforms = [];
    var body = document.body;
    //console.log(body);
    //console.log(body != null)
    if (body != null) {
        // get all paragraphs
        var myNodeList = document.querySelectorAll("p");
        //console.log(myNodeList);
        for (var i = 0; i < myNodeList.length; i++) {
            for(var j=0; j<myNodeList[i].childNodes.length; j++){
                platforms = platforms.concat(findClickedWord(myNodeList[i].childNodes[j]));
            }
        }
        
        // get all images
        var images = document.querySelectorAll("img");
        //console.log("images: " + images.length);
        for (var i = 0; i < images.length; i++){
            platforms.push(generateElementPlatform(images[i]));
        }

        // get all buttons
        var buttons = document.querySelectorAll("button");
        for(var i=0; i<buttons.length; i++){
            platforms.push(generateElementPlatform(buttons[i]));
        }
        /*
        for (var i = 0; i < platforms.length; i++) {
            console.log(platforms[i]);
        }*/
    }
    return platforms;
}

window.platformStart = function () {
    window.platformDone = true;
}

export default platformStart;