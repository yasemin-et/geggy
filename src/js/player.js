var theta;

// player physics
window.updatePlayer = function() {

    // update animation ID
    let airAnimation = (playerAnimationID == animations.player.fall || playerAnimationID == animations.player.jump || playerAnimationID == animations.player.rise || playerAnimationID == animations.player.falling);
    if (playerAnimationID == animations.player.win) { } // skip if player is in win state
    else if (player.velocity.y < 0 && !keys[40]/*&& !(airAnimation)*/) //if it's jumping
    {
        playerAnimationID = animations.player.jump;
    }
    else if(player.velocity.y > 0) //if it's falling
    {
        playerAnimationID = animations.player.fall;
    }
    else if(player.velocity.y == 0 && airAnimation) //if it's neither
    {
        playerAnimationID = animations.player.land;
    }

    // last position for collision detection
    player.lastpos.x = player.x;
    player.lastpos.y = player.y;

    // gravity
    if (!(player.snapped_y_top || player.snapped_y_bottom)) {
        player.acceleration.y = 0.65;
    }

    // horizontal acceleration
    if (playerAnimationID == animations.player.win) { } // skip if win
    else if (keys[65] || keys[68])
    {
        //movement
        if(keys[65])
        {
            //going left so flip sprite left
            player.acceleration.x = -1.1;
            playerAnimator.isFlipped = false;
        }
        else
        {
            //going right so flip sprite right
            player.acceleration.x = 1.1;
            playerAnimator.isFlipped = true;
        }

        //animation
        if(playerAnimationID == animations.player.idle || playerAnimationID == animations.player.land2) //not jumping, not running
        {
            playerAnimationID = animations.player.run;
        }
    }
    else
    {
        //drop acceleration
        player.acceleration.x = 0;
        
        //animation
        if(playerAnimationID == animations.player.run) //not idle, not jumping
        {
            playerAnimationID = animations.player.idle;
        }
    }

    // jumping, only when snapped to surface
    if (player.snapped_y_top && keys[87]) {
        player.velocity.y = -10;
    }

    // stomping, only when player is falling
    if (keys[83] && player.velocity.y > 0) {
        player.acceleration.y = 0.8;
    }

    // air resitance as a horizontal speed cap
    player.acceleration.x -= (player.velocity.x * 0.115);

    // unsnap the player
    player.snapped_y_top = false;
    player.snapped_y_bottom = false;
    player.snapped_x = false;

    // update the velocity and position
    player.velocity.x += player.acceleration.x;
    player.velocity.y += player.acceleration.y;

    player.x += player.velocity.x;
    player.y += player.velocity.y;

    // collision with platforms
    // repeat checks to clip out of all platforms
    var hit = true;
    while (hit) {
        hit = false;
        platforms.forEach(platform => {
            if(collide(player, platform)) {hit = true;}
        });
    }
    
    // death handling when off screen
    let playerLocation = player.y - window.scrollY;
    if (playerLocation + player.height < 0 || playerLocation - player.height > window.innerHeight) {
        die();
    }

    //moves the camera from the left and right
    playerLocation = player.x - window.scrollX;
    //This is a muliplier, goes from 0-0.5
    const bounds = 0.25;
    const onLeft = (playerLocation < window.innerWidth * bounds);
    //this could be a while loop but I don't feel like I can easily check edge cases
    if (onLeft || playerLocation > window.innerWidth * (1 - bounds)) {
        if(onLeft) {
            moveX(-((window.innerWidth - playerLocation) - (window.innerWidth * (1 - bounds))));
        } else {
            moveX((playerLocation - (window.innerWidth * (1 - bounds))));
        }
    }

    updateVaccuumPos();
}

// updates where the broom handle renders
function updateVaccuumPos() {
    vacc.x = mouse.x - vacc.width / 2;
    vacc.y = mouse.y - vacc.height / 2;
}

// draw the broom handle and player hands
window.updateHandle = function() {
    // player center
    let px = (player.x + player.width * 0.5);
    let py = (player.y + player.height * 0.66);

    // distance
    let dx = px - mouse.x;
    let dy = py - mouse.y;

    // slope 
    let slope = dy/dx;
    player.theta = Math.atan(slope);

    // adjust for hands using trig
    let xscale = 30 * Math.cos(player.theta) * (dx / Math.abs(dx));
    let yscale = 30 * Math.sin(player.theta) * (dx / Math.abs(dx));

    dx += xscale;
    dy += yscale;

    // formula to scale broom width
    let broomWidth = (16 * Math.pow(dx * dx + dy * dy, -0.15) + 0.35);

    // draw broom handle
    drawLine([mouse.x, mouse.y], [mouse.x + dx, mouse.y + dy], 'brown', broomWidth);

    // put hands on the broom around the center of the player
    myGameArea.context.drawImage(hand, 0, 0, 6, 6, px + (xscale * 0.3), py + (yscale * 0.3), 6, 6);
    myGameArea.context.drawImage(hand, 0, 0, 6, 6, px - (xscale * 0.3), py - (yscale * 0.3), 6, 6);
    
}

window.playerLoad = function() {

}

window.playerStart = function () {
    window.playerDone = true;
}

export default playerStart;
