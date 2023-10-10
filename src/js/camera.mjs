// HANDLES CAMERA MOVEMENT AND SCROLLS THE WEBPAGE DOWN //

// Variables //
window.currentY = 0; // current camera position
window.currentX = 0;
window.speed = 0.35; // scroll speed, constant
window.scrollEnd = false; // if the game has finished scrolling, set to true at end of scroll
var stuckTime = 0; // check if camera can't scroll anymore, to deal with integer rounding
var interval; // current loop

// Functions //
// Stops camera from scrolling
window.disableCamera = function()
{
    clearInterval(interval);
}

// Defines camera movement
window.camera = function() {
    window.scrollTo(0, 0);
    interval = setInterval(onUpdate, 20);
}

// Updates camera and checks for end condition
//when the player is ready, on Update will also WHILE check the players location and move accordingly
function onUpdate() //moving down
{
    // stop moving camera if player died or if finished scrolling
    if(playerDies || scrollEnd){
        speed = 0;
    }
    currentY += speed;

    // scroll camera
    var prev_height = window.innerHeight + window.scrollY;  // keep track of previous height
    window.scrollTo(currentX, currentY); //comment this if you want free scrolling for debug
    var scroll_height = window.innerHeight + window.scrollY; 

    // make sure camera is still able to move
    if (scroll_height == prev_height) {
        stuckTime++; // sometimes rounding makes it hard to tell if the camera is moving, so wait until its stuck for at least 10 frames
        // we can't test every edge case since the game should work for literally all websites ever, so this just prevents faulty game end condition
    } else {
        stuckTime = 0; 
    }

    // end game if we've finished scrolling, can't scroll anymore, or player died
    if (scroll_height >= myGameArea.canvas.height || stuckTime >= 10 || playerDies) {
        gameEnded = true;
        disableCamera();
        console.log("disabled");

        if (!playerDies) //if the player survived
        {
            scrollEnd = true; //so the gameover screen shows up
        }
    }
}

// Overload the scroll function so the player can't scroll
window.moveX = function(newX) 
{
    currentX += newX;
    window.scrollTo(currentX, currentY); //so that I can check the 2nd edge case, I hope there is a better way

    //edge cases
    if(currentX < 0) 
    {
        currentX = 0;
    } 
    else if(currentX > window.scrollX) //not a very good solution
    {
        currentX = window.scrollX;
    }
}

// Stop player from horizontally scrolling and hide the scrollbar
function disableScroll() {
    // hide horizontal scrollbar
    document.body.style.overflowX = "hidden";
}

// Called when module is imported
window.cameraStart = function () {
    disableScroll(); 
    window.cameraDone = true;
}

export default cameraStart;

