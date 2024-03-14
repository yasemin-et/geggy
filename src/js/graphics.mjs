// HANDLES MOST GRAPHICS BY DRAWING MOST COMPONENTS //
// ** player component is drawn in player.js

// Variables //
window.phaseTimer = 10; // 1 = 20ms (based on game loop timer) aka every 500 = 10000ms
window.particles = []; // all particles, being dust clouds or confetti
window.dustTimer = Math.random() * 20 + 10; // number of game loops
window.panel = []; // an array of components
var wood_img;


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
        // ctx.fillStyle = "green";
        drawWood(window.innerHeight - 50); 
        return;
    }
    else if (component.lockTimer > 0) {
        var rgb = `0, 0, 0,`;
        // ctx.fillStyle = `rgba(` + rgb + ((component.lockTimer / 160) + 0.375) + `)`;
        ctx.fillStyle = `rgba(` + rgb + (((1 - 5 * component.lockTimer) / 160) + 0.375) + `)`;
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

        // also phase platforms at corresponding y 
        let remove_index = 1;
        for (let i = 1; i < platforms.length; i++) {
            if (remove_index > 10) {
                break; 
            }
            if (platforms[i].y == platforms[0].y) {
                platforms[i].lockTimer = 20 + 3* i;
                window.activePlatforms.push(platforms[i]);
                remove_index++;
            }
            else {
                break;
            }
        }

        platforms.splice(0, remove_index); // remove top

        phaseTimer = 10;
    }
}

// Draws and updates all particles
window.updateParticles = function () {
    if (window.sweeping) { // generate dust particles
        dustTimer--;
        if (dustTimer < 0) {
            // generate a new dust particle!
            

            dustTimer = Math.random() * 20 + 10; 
        }
    }

    // phase out all dust particles

}

window.movePanel = function (y) {
    panel.forEach((component) => {
        component.y -= y;
    })
}

// Draws top panel
window.drawPanel = function () {
    console.log(panel);
    let ctx = myGameArea.context;

    let background = panel[0];
    // draw background
    ctx.fillStyle = background.color;
    ctx.fillRect(background.x, background.y, background.width, background.height); 

    // draw wood paneling
    drawWood(0); 
}

// Draws wood paneling
window.drawWood = function (y) {
    let ctx = myGameArea.context;
    let i = 1;
    while (i < panel.length && panel[i].id == "wood") {
        ctx.drawImage(wood_img, 0, 0, panel[i].width, panel[i].height, panel[i].x, panel[i].y + y, panel[i].width, panel[i].height);
        i++;
    }
}

// Generates the top panel based on current browser size
window.generatePanel = function () {
    // white background
    var background = new component(window.innerWidth, 50, "white", 0, 0, "panel_background");
    panel.push(background);

    // wood paneling
    // generate image
    wood_img = new Image();
    wood_img.src = chrome.runtime.getURL("../assets/wood.png");

    // generate appropriate number of panels based on window width
    let x = 0; // represents x coordinate where wood panel ends
    // IF YOU CHANGE THE IMAGE, YOU NEED TO CHANGE THESE
    let width = 560;
    let height = 30; 

    for (x = width; x <= window.innerWidth; x += width) {
        let wood = new component(width, height, "brown", x - width, 50, "wood");
        panel.push(wood);
    } 
    let remaining = window.innerHeight - (x - 2 * width);
    let final_wood = new component(remaining, height, "brown", x - width, 50, "wood");
    panel.push(final_wood);

    console.log(panel);
}

window.graphics = function() {

}

window.graphicsStart = function () {
    window.graphicsDone = true;
}

export default graphicsStart;