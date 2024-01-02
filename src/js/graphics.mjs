// HANDLES MOST GRAPHICS BY DRAWING MOST COMPONENTS //
// ** player component is drawn in player.js

// Variables //
window.phaseTimer = 5; // 1 = 20ms (based on game loop timer) aka every 500 = 10000ms

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
    this.lastpos = new vector2(0, 0);
    this.velocity = new vector2(0, 0);
    this.acceleration = new vector2(0, 0);
    this.snapped_y = false;
    this.snapped_x = false;
    this.stability = 100;
    this.element = element;
    this.lockTimer = -1; // will be greater than 0 if currently phasing in, or state cant change
}

// Functions //
// Draws platforms
window.update = function(component){
    var ctx = myGameArea.context;

    if (component.id == "end_platform") {
        ctx.fillStyle = "green";
    }
    else if (component.lockTimer > 0) {
        ctx.fillStyle = "grey"; 
    }
    else {
        var rgb = `0, 0, 0,`;
        ctx.fillStyle = `rgba(` + rgb + ((component.stability / 160) + 0.375) + `)`;
    }

    ctx.fillRect(component.x, component.y, component.width, component.height);
}

// Draws lib line function for broom handle
window.drawLine = function(begin, end, stroke = 'black', width = 1) {
    var ctx = myGameArea.context;

    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;

    ctx.beginPath();
    ctx.moveTo(...begin);
    ctx.lineTo(...end);
    ctx.stroke();
}

// Phases in platforms
window.phasePlatforms = function (platforms) {
    if (platforms.length == 0) return;

    phaseTimer -= 1;
    if (phaseTimer <= 0) {
        // start phasing the top platform
        platforms[0].lockTimer = 20; 
        window.activePlatforms.push(platforms[0]);
        platforms.splice(0, 1); // remove top

        phaseTimer = 5; 
    }
}

window.graphics = function() {

}

window.graphicsStart = function () {
    window.graphicsDone = true;
}

export default graphicsStart;