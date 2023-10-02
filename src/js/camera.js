//when the player is ready, on Update will also WHILE check the players location and move accordingly
window.currentY = 0;
window.speed = 0.35;
window.currentX = 0;
window.interval;
window.scrollEnd = false;
var stuckTime = 0; 
var interval;

//start and update
//camera();

window.disableCamera = function()
{
    clearInterval(interval);
}

window.camera = function() {
    //console.log("e");
    //scrolls to
    window.scrollTo(0, 0);
    interval = setInterval(onUpdate, 20);
}

function onUpdate() //moving down
{
    //console.log("speed: " + speed);
    if(playerDies || scrollEnd){
        speed = 0;
    }
    //moves
    currentY += speed;

    //window.scrollTo(currentX, currentY); //comment this if you want free scrolling for debug

    // scroll camera
    var prev_height = window.innerHeight + window.scrollY; 
    window.scrollTo(currentX, currentY); //comment this if you want free scrolling for debug
    var scroll_height = window.innerHeight + window.scrollY; 

    // check if we can't scroll anymore
    if (scroll_height == prev_height) {
        stuckTime++; // sometimes rounding makes it hard to tell if the camera is moving, so wait until its stuck for at least 10 frames
    } else {
        stuckTime = 0; 
    }

    console.log(scroll_height + " >= " + myGameArea.canvas.height + ", or " + scroll_height + "==" + prev_height + ", speed " + speed + ", stucktime " + stuckTime);  

    // end game if we've finished scrolling, can't scroll anymore, or player died
    if (scroll_height >= myGameArea.canvas.height || playerDies) {
        gameEnded = true;
        disableCamera();
        console.log("disabled");

        if (!playerDies) //if the player survived
        {
            scrollEnd = true; //so the gameover screen shows up
        }
    }
}

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

window.cameraStart = function () {
    disableScroll(); 
    window.cameraDone = true;
}

function disableScroll() {
    // hide horizontal scrollbar
    document.body.style.overflowX = "hidden";
}

export default cameraStart;

