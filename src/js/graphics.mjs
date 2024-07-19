// HANDLES MOST GRAPHICS BY DRAWING MOST COMPONENTS //
// ** player component is drawn in player.js

// Variables //
window.phaseTimer = 10; // 1 = 20ms (based on game loop timer) aka every 500 = 10000ms
window.particles = []; // all particles, being dust clouds or confetti
window.dustTimer = Math.random() * 20 + 10; // number of game loops
window.panel = []; // an array of components
var wood_img;
var chain_img;


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

// A more complex object that is animated using a spritesheet image
// Meant to be used with ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
// Ex: mama geggy, machine
window.animatedComponent = function (x, y, image, imageWidth, imageHeight, frameWidth, frameHeight, frame = 0, minFrame = 0, maxFrame = (imageWidth / frameWidth) - 1, frameSpeed = 3, ctx = myGameArea.context) {
    this.x = x;
    this.y = y;
    this.frame = frame;
    this.image = image;
    this.imageWidth = imageWidth;
    this.imageHeight = imageHeight;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.minFrame = minFrame;
    this.maxFrame = maxFrame;
    this.ctx = ctx;
    this.frameSpeed = frameSpeed;
    this.t = frameSpeed;

    this.draw = function () {
        this.ctx.drawImage(this.image, this.frame * this.frameWidth, 0 * this.frameHeight, this.frameWidth, this.frameHeight, this.x, this.y, this.frameWidth, this.frameHeight);
    }

    this.updateFrame = function () {
        this.t--; 
        if (this.t <= 0) {
            this.t = this.frameSpeed;
            this.frame++;
            if (this.frame > this.maxFrame) {
                this.frame = this.minFrame;
            }
        }
    }
}

// A dust particle that starts at an (x, y) moving along path with slope m with horizontal speed s, disappearing in t game loops
window.dust = function (x, y, m, s, t, color) {
    this.x = x;
    // ensure initial y = slope * initial x + c
    this.c = y - (m * x)
    this.y = y;
    this.m = m;
    this.t = t;
    this.s = s;
    this.color = color;

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
        ctx.fillStyle = "green";
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
            let newParticle = new dust(broom.x, broom.y, slope, speed, time, "rgba(0, 0, 0, ");
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
        }
        else {
            // draw particle
            let alpha = particles[i].t / 30;
            ctx.fillStyle = particles[i].color + alpha + ")";
            ctx.fillRect(particles[i].x, particles[i].y, 12, 12);
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
    /*
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(background.x, background.y, background.width, background.height); 
    */

    // draw grey platform
    /*
    ctx.strokeStyle = "rgb(86, 89, 102)";
    ctx.lineWidth = 5;
    ctx.beginPath(); 
    ctx.moveTo(0, window.currentY + 50); 
    ctx.lineTo(background.width, window.currentY + 50);
    ctx.stroke(); // render the path
    */

    // draw sign
    //ctx.beginPath();
    //ctx.moveTo(window.innerWidth - (window.innerWidth / 10), window.currentY + 80);
    //ctx.lineTo(window.innerWidth, window.currentY + 80);
    //ctx.stroke(); // render the path
   // ctx.fillRect(window.innerWidth - (window.innerWidth / 10) - 5, 75, 5, 5);

    // draw gradient fade out
    let gradient = ctx.createLinearGradient(0, window.currentY, 0, window.currentY + 100); // Gradient white fade out for top of window
    let backgroundColor = window.getComputedStyle(document.body, null).getPropertyValue('background-color');
    //console.log(backgroundColor);
    gradient.addColorStop(0, backgroundColor);     // At the top
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)'); // 50 pixels down
    ctx.fillStyle = gradient;
    ctx.fillRect(0, window.currentY - 10, window.innerWidth, 200);

    // draw and animate chains
    //panel[1].draw();
    //panel[2].draw();
    panel[3].draw();
    panel[3].updateFrame();
    console.log(panel[3].frame);
    panel[4].draw();
    panel[4].updateFrame();
    console.log(panel[4].frame);
    // draw metal sign
    ctx.fillStyle = "rgb(86, 89, 102)";
    ctx.fillRect(panel[3].x - 20, panel[3].y + 50, panel[4].x - panel[3].x + 88, 60); 

    ctx.beginPath();
    ctx.lineWidth = "1";
    ctx.strokeStyle = "black"
    ctx.rect(panel[3].x - 20, panel[3].y + 50, panel[4].x - panel[3].x + 88, 60);
    ctx.stroke();

    // draw text
    ctx.font = "25px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("Score: " + score, panel[3].x + 85, panel[3].y + 85);

    //panel[5].draw(); 

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
// function (x, y, image, imageWidth, imageHeight, frameWidth, frameHeight, frame = 0, minFrame = 0, maxFrame = (imageWidth / frameWidth) - 1, frameSpeed = 20, ctx = myGameArea.context)
window.generatePanel = function () {
    // white background
    var background = new component(window.innerWidth, 100, "white", 0, -50, "panel_background");
    panel.push(background);

    // chains
    // holding glass window
    chain_img = new Image();
    chain_img.src = chrome.runtime.getURL("../assets/chain.png");
    let left_chain = new animatedComponent(20, 0, chain_img, 600, 51, 50, 51, 0, 11, 11); // set at 11th frame for still
    panel.push(left_chain);
    let rchain_x = window.innerWidth - 80;
    let right_chain = new animatedComponent(rchain_x, 0, chain_img, 600, 51, 50, 51, 0, 11, 11);
    panel.push(right_chain);
    // holding sign
    let l_sign_chain = new animatedComponent(window.innerWidth - (window.innerWidth / 10) - 150, 0, chain_img, 600, 51, 50, 51, 0, 11, 11);
    let r_sign_chain = new animatedComponent(window.innerWidth - (window.innerWidth / 10), 0, chain_img, 600, 51, 50, 51, 0, 11, 11); 
    panel.push(l_sign_chain);
    panel.push(r_sign_chain); 

    // wood panels
    wood_img = new Image();
    wood_img.src = chrome.runtime.getURL("../assets/wood.png");
    let wood_sign = new animatedComponent(window.innerWidth - (window.innerWidth / 10), 100, wood_img, 640, 30, 180, 30, 0, 0, 0); 
    panel.push(wood_sign); 
}

window.graphics = function() {

}

window.graphicsStart = function () {
    window.graphicsDone = true;
}

export default graphicsStart;