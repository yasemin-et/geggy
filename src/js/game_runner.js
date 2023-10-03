// vars
window.platforms = [];
window.components = [];
window.keys = [];

// helper 
window.vector2 = function(x, y) {
    this.x = x;
    this.y = y;
}

// objects like the player and platforms
window.component = function(width, height, color, x, y, id, platform = false) {
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

    //console.log(this);

    components.push(this);
    if (platform) {
        platforms.push(this);
        
    }
}

window.player = new component(30, 30, "red", 230, 400, "player");
window.vacc = new component(30, 30, "blue", 0, 0, "vacc");
window.playerDies = false; // whether the player dies or not
//var win = false; // whether the player wins or not
player.theta = 0;

window.myGameArea = document;

window.mouse = new vector2(0, 0);
window.hand = document.createElement("img");
hand.src = chrome.runtime.getURL("../assets/hand.png");
window.wind = false;

window.playerAnimator;
window.playerAnimationID;

window.vaccAnimator;
window.vaccAnimationID;

window.score = 0;
window.gameEnded = false; // ends when website scrolls to the bottom
window.reachedEndingPlatform = false; // used to end the game for websites that scroll infinitely 
window.scoreSent = false; // make sure score is only sent once per game

// functions
function game_runner() {
    //console.log("game_runner");
    myGameArea.canvas = document.createElement("canvas");
    myGameArea.canvas.style.position = 'relative';
    myGameArea.canvas.style.zIndex = '9999';
    myGameArea.canvas.style.cursor = 'none';
 
    start();
    

    // spawn platform
    new component(100, 20, "black", 220, 570, "platform", true);
    
    // load other scripts
    startOthers();
    myGameArea.interval = setInterval(updateGameArea, 20);
}

// play area context
function start() {
    myGameArea.canvas.width = document.body.scrollWidth;
    myGameArea.canvas.height = document.body.scrollHeight;
    myGameArea.canvas.style.display = "block";
    myGameArea.canvas.style.position = "absolute";
    myGameArea.canvas.style.top = "0px"; 
    myGameArea.canvas.style.left = "0px";
    //myGameArea.canvas.style.border = "5px solid #FF0000"; // uncomment this to see canvas

    //static: default
    //fixed: "relative to window?"
    myGameArea.canvas.style.position = "absolute";

    myGameArea.context = myGameArea.canvas.getContext("2d");
    document.body.insertBefore(myGameArea.canvas, document.body.childNodes[0]);
    
    // key press listeners
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

    // vaccuum updates
    window.addEventListener("mousedown", (e) => {
        wind = true;
        vaccAnimationID = animations.vacc.active;
    });
    window.addEventListener("mouseup", (e) => {
        wind = false;
        vaccAnimationID = animations.vacc.idle;
    });
    window.addEventListener("mousemove", (e) => {
        mouse.x = e.pageX;
        mouse.y = e.pageY;
    });

    clear(); 
}

// update function
function clear() {
    myGameArea.context.clearRect(0, 0, myGameArea.canvas.width, myGameArea.canvas.height);
}

// runs other start functions in order
function startOthers() {
    animate();
    camera();
    generatePlatforms();
    playerLoad();
    graphics();
    physics();
}

// resets the stage
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

function printScore() {
    // print score
    let ctx = myGameArea.context;
    ctx.font = "30px Arial";
    
    // draw text
    ctx.fillStyle = "black";
    ctx.textAlign = "right";
    ctx.fillText("Score: " + score, myGameArea.canvas.width - 30, currentY + 30);
}

// universal update
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

    // check if player is sweeping, aka if space bar is being held
    /*
    if (keys[32]) { 
        wind = true;
        vaccAnimationID = animations.vacc.active;
    }
    else {
        wind = false;
        vaccAnimationID = animations.vacc.idle;
    } */

    // draw broom handle and player hands
    updateHandle();

    // update broom animations
    if (vaccAnimator.getId() != vaccAnimationID) {
        vaccAnimator.setId(vaccAnimationID);
        vaccAnimator.play(vaccAnimationID[0], vaccAnimationID[1]);
    }

    // calculate broom rotation
    let thetaCalc = player.theta;
    if (player.x >= vacc.x) {
        thetaCalc -= Math.PI / 2;
    } else {
        thetaCalc += Math.PI / 2;
    }
    vaccAnimator.drawRotated(vacc.x, vacc.y, thetaCalc);
    //console.log(player.theta);
}

async function sendScore(score) {
    console.log("Sending game score to background.js");

    chrome.runtime.sendMessage({
        type: "score",
        score: score,
    });   
}

//the 2 run versions, use the top for extension, use the bottom for website testing/
export default game_runner;
//game_runner();
