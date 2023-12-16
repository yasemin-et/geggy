// HANDLES PHYSICS FOR ALL COMPONENTS IN THE GAME //

// Functions //
// Handles collision detection between two components
window.collide = function (component1, component2) {
    // if two components collide
    if ((component1.x + component1.width > component2.x && component1.x < component2.x + component2.width) &&
        (component1.y + component1.height > component2.y && component1.y < component2.y + component2.height)) {

        // if player has collided with the end platform, raise flag to end the game
        if (((component1.id == "end_platform" && component2.id == "player") || (component2.id == "end_platform" && component1.id == "player")) && !window.reachedEndingPlatform) {
            window.reachedEndingPlatform = true;
            window.gameEnded = true; 
            console.log("Reached end");
        }

        // 4-way collision (biases towards y-snapping on top for corner correction and
        //                  towards x-snapping on sides to prevent bonking)
        if (component1.lastpos.y + component1.height <= component2.y) {
            component1.y = component2.y - component1.height;
            // bounce or snap depending on whether stomp key is held
            if (keys[83]) {
                player.velocity.y *= -0.8;
            } else { 
                snap_y(player, "top"); 
            }

            return true;
        }
        else if (component1.lastpos.x + component1.width <= component2.x) {
            component1.x = component2.x - component1.width;
            snap_x(player);
            return true;
        }  
        else if (component1.lastpos.x >= component2.x + component2.width ) {
            component1.x = component2.x + component2.width;
            snap_x(player);
            return true;
        }
        else if (component1.lastpos.y >= component2.y + component2.height ) {
            component1.y = component2.y + component2.height;
            snap_y(player, "bottom");
            return true;
        }
    }
    return false;
}

// Aligns the component and stops it along a given axis
function snap_y(component, side) {
    component.velocity.y = 0;
    component.acceleration.y = 0;
    
    // differentiate for top and bottom for jumping physics
    if (side == "top") {
        player.snapped_y_top = true;
    }
    if (side == "bottom") {
        player.snapped_y_bottom = true;
    }
}

// Aligns the component and stops it along the x axis
function snap_x(component) {
    component.velocity.x = 0;
    component.acceleration.x = 0;
    player.snapped_x = true;
}

// Returns true two components have collidied with another
function componentsCollided(component1, component2) {
    return ((component1.x + component1.width > component2.x && component1.x < component2.x + component2.width) && // x collides
        (component1.y + component1.height > component2.y && component1.y < component2.y + component2.height)); // y collides
}

// Deals damage to platforms
window.updatePlatforms = function (platform) {
    // define the hitbox of the broom
    // change the width and height as you see fit
    let hitbox = new component(broom.width + 30, broom.height + 30, "yellow", broom.x, broom.y, "broom_hitbox");

    // check for cursor collision
    if ((wind) && platform.id != "end_platform" && componentsCollided(hitbox, platform)) {
        
        // distance between mouse and player
        let dx = Math.abs((player.x + player.width / 2.0) - (mouse.x));
        let dy = Math.abs((player.y + player.height / 2.0) - (mouse.y));

        // based on distance formula but scaled slightly to increase player damage
        let distScaled = Math.pow(dx * dx + dy * dy, 0.4);

        // this formula feels good for damage
        // very high damage up close and a low constant far away
        let damage = (130.0 / distScaled) + 1;

        // don't heal platforms
        if (damage > 0.0) {
            platform.stability -= damage;
        }
    }
    
    // destroy platform (remove from platforms and components lists)
    if (platform.stability <= 0.5) {
        var index = platforms.indexOf(platform);

        // give points for destruction
        var platformScore = Math.round(Math.log(platform.height * platform.width / 10.0 ));
        if (platformScore >= 0) { 
            score += platformScore; 
        }

        // remove from lists
        if (index > -1) {
            platforms.splice(index, 1);
        }
        var index = components.indexOf(platform);
        if (index > -1) {
            components.splice(index, 1);
        }
    } else {
        // draw platforms
        update(platform);
    }
}

window.physics = function() {

}

window.physicsStart = function () {
    window.physicsDone = true;
}

export default physicsStart;