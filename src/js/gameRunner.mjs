// RUNS THE GAME BY CREATING THE GAME LOOP AND UPDATING ALL COMPONENTS ON EACH FRAME

// Variable Arrays //
window.platforms = [];
window.components = [];
window.keys = [];

// Helper Classes //
// Holds an (x, y) pair representing a vector
window.vector2 = function(x, y) {
    this.x = x;
    this.y = y;
}

// A simple object holding width, height, color, x, y, id, and whether its a platform
// Ex: player, platforms
window.component = function (width, height, color, x, y, id, platform = false, element = undefined) {
    // initialize variables
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.id = id;
    this.color = color;
    this.lastpos = new vector2(0,0);
    this.velocity = new vector2(0,0);
    this.acceleration = new vector2(0,0);
    this.snapped_y = false;
    this.snapped_x = false;
    this.stability = 100;
    this.element = element; 
}

// Variables //
window.player = new component(30, 30, "red", 230, 400, "player");
window.broom = new component(30, 30, "blue", 0, 0, "broom");
window.playerDies = false; // whether the player dies or not
player.theta = 0;

window.myGameArea = document;

window.mouse = new vector2(0, 0);
window.hand = document.createElement("img");
hand.src = chrome.runtime.getURL("../assets/hand.png");
window.wind = false;

window.playerAnimator;
window.playerAnimationID;

window.broomAnimator;
window.broomAnimationID;

window.score = 0;
window.gameEnded = false; // ends when website scrolls to the bottom
window.reachedEndingPlatform = false; // used to end the game for websites that scroll infinitely 
window.scoreSent = false; // make sure score is only sent once per game

// Functions //
// Starts running the game, call when exporting function
function gameRunner() {
    // create a new canvas with id "geggy_canvas"
    myGameArea.canvas = document.createElement("canvas");
    myGameArea.canvas.setAttribute("id", "geggy_canvas");
    myGameArea.canvas.style.position = 'relative';
    myGameArea.canvas.style.zIndex = '9999';
    myGameArea.canvas.style.cursor = 'none';

    // start the game and start listening for player input
    startInput();


    // create platforms
    window.platforms = generatePlatforms();

    // load other scripts
    startOthers();

    // scroll so that the first platform is visible
    if (window.platforms.length > 0) {
        var firstPlatform = window.platforms[0];
        if (firstPlatform.y > window.currentY) {
            window.scrollTo(window.currentX, firstPlatform.y);
        }
    } 

    // spawn player to fall onto first platform
    player.x = firstPlatform.x;
    player.y = 0; 
    updateHandle(); 

    // start game loop
    myGameArea.interval = setInterval(updateGameArea, 20);
}

// Create canvas and player input
function startInput() {
    // Modify the canvas
    myGameArea.canvas.width = document.body.scrollWidth;
    myGameArea.canvas.height = document.body.scrollHeight;
    myGameArea.canvas.style.display = "block";
    myGameArea.canvas.style.position = "absolute";
    myGameArea.canvas.style.top = "0px"; 
    myGameArea.canvas.style.left = "0px";
    myGameArea.canvas.style.position = "absolute";
    //myGameArea.canvas.style.border = "5px solid #FF0000"; // uncomment this to see canvas borders

    myGameArea.context = myGameArea.canvas.getContext("2d");
    myGameArea.context.imageSmoothingEnabled = false; // removes pixel blur
    document.body.insertBefore(myGameArea.canvas, document.body.childNodes[0]);
    
    // Add key press listeners for player movement
    window.addEventListener("keydown",
        function(e){
            keys[e.keyCode] = true;
        },
    false);
    window.addEventListener('keyup',
        function(e){
            keys[e.keyCode] = false;
        },
    false);

    // Add mouse listeners for brush
    window.addEventListener("mousedown", (e) => {
        wind = true;
        broomAnimationID = animations.broom.active;
    });
    window.addEventListener("mouseup", (e) => {
        wind = false;
        broomAnimationID = animations.broom.idle;
    });
    window.addEventListener("mousemove", (e) => {
        mouse.x = e.pageX;
        mouse.y = e.pageY;
    });

    // Clear the canvas
    clear(); 
}

// Clears the current game canvas
function clear() {
    myGameArea.context.clearRect(0, 0, myGameArea.canvas.width, myGameArea.canvas.height);
}

// Resets the previous game, by resetting important variables such as camera location, player location
window.reset = function () {
    // get the previous game area
    var prevGameArea = document.getElementById("geggy_canvas");
    // stop game loop
    clearInterval(myGameArea.interval);
    prevGameArea.remove();

    // reset variables
    resetGameRunnerVariables(); 
    window.resetPlayerVariables(); 
    window.resetCameraVariables(); 
}

// Runs other start functions in order
function startOthers() {
    animate();
    camera();
    playerLoad();
    graphics();
    physics();
}

// Resets the game area when player dies
window.die = function() {
    playerDies = true;
    player.velocity.y = 0;
    player.acceleration.y = 0;
    player.velocity.x = 0;
    player.acceleration.x = 0;
    player.snapped_x = false;
    player.snapped_y = false;
}

// Displays end screen messages
function endScreen() {
    myGameArea.context.textAlign = "center";
    let w = window.innerWidth;
    let h = window.innerHeight;
    let ctx = myGameArea.context;

    // boxes
    ctx.fillStyle = "white";
    ctx.fillRect(w / 2 - 100, window.scrollY + h / 2 - 50, 200, 100);

    ctx.fillStyle = "black";
    ctx.strokeRect(w / 2 - 100, window.scrollY + h / 2 - 50, 200, 100);
    ctx.fillText("Game Over", w / 2, window.scrollY + h / 2);

    // text depends on win/loss
    if(scrollEnd || reachedEndingPlatform){
        ctx.fillText("You Win", w / 2, window.scrollY + h / 2 + 25);
    } else {
        ctx.fillText("You Lose", w / 2, window.scrollY + h / 2 + 25);
    }
    myGameArea.canvas.style.cursor = "pointer";
}

// Prints the score on the canvas
function printScore() {
    // print score
    let ctx = myGameArea.context;
    ctx.font = "30px Arial";
    
    // draw text
    ctx.fillStyle = "black";
    ctx.textAlign = "right";
    ctx.fillText("Score: " + score, myGameArea.canvas.width - 30, currentY + 30);
}

// Universal update on every frame
// Important: call your update functions here
function updateGameArea() {
    // reset canvas
    clear();

    // check to see if player died
    if (playerDies) {
        // Display lose screen
        endScreen();
        printScore();
        clearInterval(myGameArea.interval); //stops the game from running 
    }

    // check to see if player won game
    else if (scrollEnd || reachedEndingPlatform) {
        if (!scoreSent) {
            sendScore(score);
            scoreSent = true;
        }
        // display win box
        endScreen();

        // remove everything but the final platform
        platforms.splice(0, platforms.length - 1);

        // keep the game running so player can run around, just for fun
        // clearInterval(myGameArea.interval); // if you don't like that, you can uncomment this
    } else {
        // display score
        printScore();
    }

    // update and draw each platform
    platforms.forEach(updatePlatforms);

    // update player animations and physics based on user input
    if (playerAnimator.getId() != playerAnimationID) {
        playerAnimator.setId(playerAnimationID); // playerAnimator changes current animation for player
        /*
        if (scrollEnd || reachedEndingPlatform) {
            playerAnimationID = animations.player.win;
        }*/
        if (playerAnimationID == animations.player.jump || playerAnimationID == animations.player.land || playerAnimationID == animations.player.fall) { //transitions
            if (playerAnimationID == animations.player.jump) { //is it jump?
                playerAnimator.playTransition(playerAnimationID[0], playerAnimationID[1], animations.player.rise);
            } else if (playerAnimationID == animations.player.fall) {
                playerAnimator.playTransition(playerAnimationID[0], playerAnimationID[1], animations.player.falling);
            } else { //is it land?
                playerAnimator.playTransition2(playerAnimationID[0], playerAnimationID[1], animations.player.land2, animations.player.idle);
            }
        } else { //default
            playerAnimator.play(playerAnimationID[0], playerAnimationID[1]);
        }
    }
    updatePlayer();
    playerAnimator.draw(player.x, player.y);

    // draw broom handle and player hands
    updateHandle();

    // update broom animations
    if (broomAnimator.getId() != broomAnimationID) {
        broomAnimator.setId(broomAnimationID);
        broomAnimator.play(broomAnimationID[0], broomAnimationID[1]);
    }

    // calculate broom rotation
    let thetaCalc = player.theta;
    if (player.x >= broom.x) {
        thetaCalc -= Math.PI / 2;
    } else {
        thetaCalc += Math.PI / 2;
    }
    broomAnimator.drawRotated(broom.x, broom.y, thetaCalc);
    //console.log(player.theta);
}


// Resets all variables used by this file
function resetGameRunnerVariables() {
    window.player = new component(30, 30, "red", 230, 400, "player");
    window.broom = new component(30, 30, "blue", 0, 0, "broom");
    window.playerDies = false; // whether the player dies or not
    player.theta = 0;

    window.myGameArea = document;

    window.mouse = new vector2(0, 0);
    window.hand = document.createElement("img");
    hand.src = chrome.runtime.getURL("../assets/hand.png");
    window.wind = false;

    window.score = 0;
    window.gameEnded = false; // ends when website scrolls to the bottom
    window.reachedEndingPlatform = false; // used to end the game for websites that scroll infinitely 
    window.scoreSent = false; // make sure score is only sent once per game
}

// Sends score to background.js
async function sendScore(score) {
    console.log("Sending game score to background.js");

    chrome.runtime.sendMessage({
        type: "score",
        score: score,
    });   
}

export default gameRunner;
