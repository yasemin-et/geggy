//when the player is ready, on Update will also WHILE check the players location and move accordingly
window.currentY = 0;
window.speed = 0.35;
window.currentX = 0;
window.interval;
window.scrollEnd = false;

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
    window.scrollTo(currentX, currentY); //comment this if you want free scrolling for debug

    //disables the camera if the game ends, has gameEnded in here as a placeholder
    if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.scrollHeight || playerDies) {
        gameEnded = true;
        disableCamera();

        if(!playerDies) //if the player survived
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
    document.body.style.overflow = "hidden";
}

export default cameraStart;

