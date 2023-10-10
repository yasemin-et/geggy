// HANDLES ANIMATIONS FOR ALL GAME COMPONENTS //

// Animator class that handles animations for a given spritmap, takes a string src to the spritemap, and other important variables
window.AnimatorClass = class 
{
    // Variables
    isFlipped = false;

    // Constructor takes filepath to src, frame width, frame height, frames per row, frames per second, blink frames, chance of blinking, and ctx to draw (given as a canvas object)
    constructor(src, sWidth, sHeight, framesPerRow, fps, blinkFrames, blinkPercent, ctx = myGameArea.canvas.getContext("2d")) {
        this.currentAnimId = -1;
        this.image = document.createElement("img");
        this.image.src = src;
        this.sWidth = sWidth;
        this.sHeight = sHeight;
        this.ctx = ctx;
        this.fpr = framesPerRow;
        this.fps = fps;
        this.updateRunner = null;
        this.blinkFrames = blinkFrames;
        this.blinkPercent = blinkPercent;
    }

    // Gets the current animation ID
    getId() {
        return this.currentAnimId;
    }

    // Sets the animation ID
    setId(id) {
        this.currentAnimId = id;
    }

    // Plays animation between the given frames
    // Important: cannot slow down on specific frames, cannot skip frames, can't shift to another animation
    play(lowFrames, highFrames) {
        this.currentFrame = lowFrames;
        this.innerPlay(lowFrames, highFrames);
    }

    // Sets the interval to change the frame based on fps
    innerPlay(lowFrames, highFrames) {
        clearInterval(this.updateRunner);
        this.updateRunner = setInterval(() => this.update(lowFrames, highFrames), 1000 / this.fps);
    }

    // Stops animating
    stop() {
        clearInterval(this.updateRunner);
    }
    
    // Plays animation between the first given frames, then once finished, instead animates between the second given frames
    playTransition2(lowFrames, highFrames, nextLowFrames, nextHighFrames)
    {
        this.currentFrame = lowFrames;
        clearInterval(this.updateRunner);
        this.updateRunner = setInterval(() => this.updateTransition2(highFrames, nextLowFrames, nextHighFrames), 1000 / this.fps);
    }

    // Starts at first frame then plays animation between the given frames
    // Important: it can be below the bounds to head up to where it needs to go
    playTransition(lowFrames, highFrames, next) {
        this.currentFrame = lowFrames;
        clearInterval(this.updateRunner);
        this.updateRunner = setInterval(() => this.updateTransition(highFrames, next), 1000 / this.fps);
    }    

    // Draws the current frame at the given (x, y) rotated by the given radians
    drawRotated(x, y, radians) {
        this.ctx.save();

        this.ctx.setTransform(1, 0, 0, 1, x + this.sWidth / 2, y + this.sHeight / 2);
        this.ctx.rotate(radians);
        // -sLength / 2 is the x and y, x and y are defined up in transform
        this.ctx.drawImage(this.image, this.sWidth * (this.currentFrame % this.fpr), this.sHeight * Math.floor(this.currentFrame / this.fpr), this.sWidth, this.sHeight, -this.sWidth / 2, -this.sHeight / 2, this.sWidth, this.sHeight);

        this.ctx.restore();
    }

    // Draws the current frame at the given (x, y)
    // Important: must be called in the universal.
    draw(x, y) {
        let drawFrame = this.currentFrame;

        // increments the frames if it is blinking
        if (Math.random() <= this.blinkPercent) {
            console.log("blinking");
            drawFrame += this.blinkFrames;
        }

        // draw a flipped image if flipped
        if(this.isFlipped) {
            this.ctx.save();  // save the current canvas state
            this.ctx.setTransform(
                -1, 0, // set the direction of x axis
                0, 1,   // set the direction of y axis
                this.image.width / this.fpr, // set the x origin
                0  // set the y origin
            );
            this.ctx.drawImage(this.image, this.sWidth * (drawFrame % this.fpr), this.sHeight * Math.floor(drawFrame / this.fpr), this.sWidth, this.sHeight, -x, y, this.sWidth, this.sHeight);
            this.ctx.restore(); // restore the state as it was when this function was called
        } else { // else, draw normally
            this.ctx.drawImage(this.image, this.sWidth * (drawFrame % this.fpr), this.sHeight * Math.floor(drawFrame / this.fpr), this.sWidth, this.sHeight, x, y, this.sWidth, this.sHeight);
        }

        //console.log(drawFrame % this.fpr + ", " + Math.floor(drawFrame / this.fpr));
    }

    // HELPER FUNCTIONS //
    // not meant to be called outside of animator class

    // Updates the current frame to iterate between the given boundaries
    update(lowFrames, highFrames) {
        this.currentFrame++;
        if(this.currentFrame > highFrames)
        {
            this.currentFrame = lowFrames;
        }
    }

    // Updates the current frame until past highest frame, then switches to next animation
    updateTransition(highFrames, next) {
        this.currentFrame++;
        if(this.currentFrame > highFrames)
        {
            this.play(next[0], next[1]);
        }
    }

    // Updates 
    updateTransition2(highFrames, next, next2) {
        //draws the animation, WHY CAN WE GET CTX HERE
        this.currentFrame++;
        if(this.currentFrame > highFrames)
        {
            playerAnimationID = next; //temporary solution
            this.setId(playerAnimationID);
            this.playTransition(next[0], next[1], next2);
        }
    }    
}

// Defines the frames corresponding to the animation ID
window.animations = {
    //10 frames per row
    player: {
        idle: [0, 9],    //idle animation, when on the ground
        run:  [10, 19],    //run animation, when [idle] and moving
        jump: [20, 23],   //jump animation, play when jump
        rise: [30, 30], //hangs on this frame for rising
        fall: [40, 43],  //fall animation, default
        falling: [50, 50], //hangs on this frame for falling
        land: [60, 61],  //land animation, when touching the ground in the air, segways to idle
        land2: [62, 63], //other part of land animation that can be switched out
        win:  [70, 70]   //win animation, when win
    },
    broom: {
        idle: [0, 0], //when mouse isn't being pressed
        active: [6, 11] //when mouse is being pressed
    }
}

window.animate = function () {
    // create player animator
    window.playerAnimator = new AnimatorClass(chrome.runtime.getURL("assets/geggy-spritemap-small.png"), 30, 30, 10, 15, 1);
    window.playerAnimationID = animations.player.idle;
    // create broom animator
    window.broomAnimator = new AnimatorClass(chrome.runtime.getURL("assets/broom.png"), 30, 30, 6, 12);
    window.broomAnimationID = animations.broom.idle;
};

window.animatorStart = function () {
    window.animatorDone = true;
}

export default animatorStart;

