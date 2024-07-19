// HANDLES CAMERA MOVEMENT AND SCROLLS THE WEBPAGE DOWN //

// Variables //
window.currentY = 0; // current camera position
window.currentX = 0;

window.maxSpeed = 1.00; // max scroll speed
window.speed = 0.30; // scroll speed, accelerates
window.accel = 0.0001;

var nextPlatform = 1; // next platform to render

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
    moveCamera(); 
    phasePlatforms(); 
}

function moveCamera() {
    // stop moving camera if player died or if finished scrolling
    if (playerDies || scrollEnd) {
        speed = 0;
    }
    currentY += speed;
    // scroll panel
    window.movePanel(-speed);

    speed += accel;
    if (speed > maxSpeed) {
        speed = maxSpeed;
    }

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

        if (!playerDies) //if the player survived
        {
            scrollEnd = true; //so the gameover screen shows up
        }
    }
}

function phasePlatforms() {
    // add new platforms
    let middle = scrollY + (window.visualViewport.height / 1.5);
    let i = nextPlatform;
    while (nextPlatform < window.generatedPlatforms.length - 1 && window.generatedPlatforms[i].y < middle) {
        window.phasingPlatforms.push(window.generatedPlatforms[i]);
        i++;
    }
    nextPlatform = i;

    // remove missed platforms
    let platforms_to_remove = 0;
    while (platforms_to_remove < window.activePlatforms.length) {
        let p = activePlatforms[platforms_to_remove];
        if (p.y + p.height < currentY) {
            platforms_to_remove++;
        } else {
            break;
        }
    }
    window.activePlatforms.splice(0, platforms_to_remove);
}

// Overload the scroll function so the player can't scroll
window.moveX = function(newX) 
{

}

// Stop player from scrolling and hide the scrollbar
function disableScroll() {
    // hide horizontal scrollbar
    document.body.style.overflowX = "hidden";
    document.body.style.overflowY = "hidden";
}

// Necessary to include if you're leaving the original spacebar visible
/*
document.addEventListener('keydown', function (event) {
    if (event.code === 'Space') {
        event.preventDefault();
    }
});*/

// Resets all variables used by this file
window.resetCameraVariables = function () {
    disableCamera();
    window.scrollTo(0, 0);
    window.currentY = 0;
    window.currentX = 0;
    stuckTime = 0;
    nextPlatform = 1;
    window.maxSpeed = 1.00; // max scroll speed
    window.speed = 0.30; // scroll speed, accelerates
    window.accel = 0.0001;
    window.scrollEnd = false; 
    clearInterval(interval); 
}

// Called when module is imported
window.cameraStart = function () {
    disableScroll(); 
    window.cameraDone = true;
}

export default cameraStart;

