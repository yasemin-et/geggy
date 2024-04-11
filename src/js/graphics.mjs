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

// A dust particle that starts at an (x, y) moving along path with slope m with horizontal speed s, disappearing in t game loops
window.dust = function (x, y, m, s, t) {
    this.x = x;
    // ensure initial y = slope * initial x + c
    this.c = y - (m * x)
    this.y = y;
    this.m = m;
    this.t = t;
    this.s = s;

    this.update = function () {
        // using y = mx + c
        this.x += this.s; // move at speed s
        this.y = this.m * this.x + this.c;
        this.t--;
    }
}

// Functions //
// Draws platforms
window.update = function(component){
    var ctx = myGameArea.context;

    if (component.id == "end_platform") {
        // ctx.fillStyle = "green";
        drawWood(window.innerHeight - 80); 
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
                platforms[i].lockTimer = 20 + 3 * i;
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
            let slope = Math.random() * 4 - 2; // generates random angle from 0 to 2pi, converts to a slope 
            let speed = 1; // generate a random speed from 5 to 15 pixels
            let time = 30; // generate a random time from 200 to 500 game loops 
            console.log(broom.x + " " + broom.y + " " + slope + " " + speed + " " + time);
            let newParticle = new dust(broom.x, broom.y, slope, speed, time);
            particles.push(newParticle);

            dustTimer = Math.random() * 10 + 2; 
        }
    }

    var ctx = myGameArea.context;
    // draw each current particle
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        if (particles[i].t < 0) {
            // remove 
            particles.splice(i, 1);
            i--;
            console.log("poof")
        }
        else {
            // draw particle
            let alpha = particles[i].t / 30;
            ctx.fillStyle = "rgba(0, 0, 0, " + alpha + ")";
            ctx.fillRect(particles[i].x, particles[i].y, 12, 12);
            console.log(particles[i].t)
        }
    }
}

window.movePanel = function (y) {
    panel.forEach((component) => {
        component.y -= y;
    })
}

// Draws top panel
window.drawPanel = function () {
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
    var background = new component(window.innerWidth, 100, "white", 0, -50, "panel_background");
    panel.push(background);

    // wood paneling
    // generate image
    wood_img = new Image();
    wood_img.src = chrome.runtime.getURL("../assets/wood.png");

    // generate appropriate number of panels based on window width
    let x = 0; // represents x coordinate where wood panel ends
    // IF YOU CHANGE THE IMAGE, YOU NEED TO CHANGE THESE
    let width = 640;
    let height = 30; 

    for (x = width; x <= window.innerWidth + width; x += width) {
        let wood = new component(width, height, "brown", x - width, 50, "wood");
        panel.push(wood);
    } 
    let remaining = window.innerHeight - (x - 2 * width);
    let final_wood = new component(remaining, height, "brown", x, 50, "wood");
    panel.push(final_wood);

    console.log(panel);
}

window.graphics = function() {

}

window.graphicsStart = function () {
    window.graphicsDone = true;
}

export default graphicsStart;