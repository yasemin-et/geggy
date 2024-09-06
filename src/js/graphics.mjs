// HANDLES MOST GRAPHICS BY DRAWING MOST COMPONENTS //
// ** player component is drawn in player.js

// Variables //
window.phaseTimer = 10; // 1 = 20ms (based on game loop timer) aka every 500 = 10000ms
window.particles = []; // all particles, being dust clouds or confetti
window.dustTimer = Math.random() * 20 + 10; // number of game loops
window.mama_geggy;
window.sign; 
var sign_img;
var mama_img;


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

// Draws all components in correct animation frame
window.drawComponents = function () {
    let ctx = myGameArea.context;

    // draw gradient fade out
    let gradient = ctx.createLinearGradient(0, window.currentY, 0, window.currentY + 100); // Gradient white fade out for top of window
    let backgroundColor = window.getComputedStyle(document.body, null).getPropertyValue('background-color');
    //console.log(backgroundColor);
    gradient.addColorStop(0, backgroundColor);     // At the top
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)'); // 50 pixels down
    ctx.fillStyle = gradient;
    ctx.fillRect(0, window.currentY - 10, window.innerWidth, 200);

    // draw sign
    window.sign.updateFrame(); 
    window.sign.y = window.currentY;
    window.sign.draw();

    // draw text
    ctx.imageSmoothingEnabled = true; 
    if (window.sign.frame == 17) {
        ctx.font = "15px CHNO Hinted Regular";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText("Score: " + score, 205, window.currentY + 85);    
    }
    ctx.imageSmoothingEnabled = false; 

    // draw a fake scrollbar
    ctx.fillStyle = "#F1F1F1";
    // scrollbar background
    ctx.fillRect(window.innerWidth - 18, window.currentY - 10, 18, window.innerHeight + 10); 
    if (window.mama_geggy.frame < 3) {
        ctx.fillStyle = "#787878";
    }
    else {
        ctx.fillStyle = "#C1C1C1";
    }
    // calculate bar heights
    let outerBarHeight = window.innerHeight - 30;
    let innerBarHeight = outerBarHeight/ (document.body.scrollHeight / outerBarHeight); 
    let scrollHeight = outerBarHeight * window.currentY / document.body.scrollHeight; 
    // draw the bars
    ctx.fillRect(window.innerWidth - 16, window.currentY + scrollHeight + 15, 15, innerBarHeight);
    // draw the small rectangles
    ctx.fillStyle = "#C1C1C1";
    let path = new Path2D();
    path.moveTo(window.innerWidth - 13, window.currentY + 10);
    path.lineTo(window.innerWidth - 9, window.currentY + 6);
    path.lineTo(window.innerWidth - 5, window.currentY + 10);
    ctx.fill(path);
    path = new Path2D();
    path.moveTo(window.innerWidth - 13, window.innerHeight - 10 + window.currentY);
    path.lineTo(window.innerWidth - 9, window.innerHeight - 6 + window.currentY);
    path.lineTo(window.innerWidth - 5, window.innerHeight - 10 + window.currentY);
    ctx.fill(path);

    // animate mama geggy
    window.mama_geggy.updateFrame();
    // move mama geggy if applicable
    if (window.mama_geggy.frame < 4) {
        window.mama_geggy.y = window.currentY + scrollHeight + 15 - window.mama_geggy.frameHeight;
    }
    window.mama_geggy.draw();
}

// Generates components to be animated in this file
// Component function (x, y, image, imageWidth, imageHeight, frameWidth, frameHeight, frame = 0, minFrame = 0, maxFrame = (imageWidth / frameWidth) - 1, frameSpeed = 3, ctx = myGameArea.context)
window.generateComponents = function () {
    // sign
    sign_img = new Image();
    sign_img.src = chrome.runtime.getURL("../assets/sign.png"); 
    window.sign = new animatedComponent(100, 0, sign_img, 3600, 150, 200, 150, 0, 17, 17, 5);

    // mama geggy
    mama_img = new Image();
    mama_img.src = chrome.runtime.getURL("../assets/mama-geggy.png");
    window.mama_geggy = new animatedComponent(window.innerWidth - 35, -50, mama_img, 550, 70, 50, 70, 0, 0, 10);

    // append font to website css
    const font = document.createElement('style');
    font.textContent = `
    @font-face {
        font-family: 'CHNO Hinted Regular';
        src: url("chrome-extension://khhnoplblfafeocpcipgddknonahkica/assets/CHNOPixelCodePro-Regular.ttf") format('truetype');
    }
    `;
    document.head.appendChild(font);
    console.log(font); 
    console.log(document.head);
}

window.graphics = function() {

}

window.graphicsStart = function () {
    window.graphicsDone = true;
}

export default graphicsStart;