window.AnimatorClass = class 
{
    //images
    //runner
    isFlipped = false;

    //current animation
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

    //gets the ID so it knows if it needs to change
    getId() {
        return this.currentAnimId;
    }

    setId(id) {
        this.currentAnimId = id;
    }

    //cannot slow down on specific frames, cannot skip frames, can't travel between picture
    play(lowFrames, highFrames) {
        this.currentFrame = lowFrames;
        this.innerPlay(lowFrames, highFrames);
    }

    innerPlay(lowFrames, highFrames) {
        clearInterval(this.updateRunner);

        this.updateRunner = setInterval(() => this.update(lowFrames, highFrames), 1000 / this.fps);
    }

    stop() {
        clearInterval(this.updateRunner);
    }
    
    //this plays a transition after a transition, good for forcing in parts of an animation
    playTransition2(lowFrames, highFrames, next, next2)
    {
        this.currentFrame = lowFrames;
        clearInterval(this.updateRunner);

        this.updateRunner = setInterval(() => this.updateTransition2(highFrames, next, next2), 1000 / this.fps);
    }

    //the same thing as play but starts on a specific frame
    //it can be below the bounds to head up to where it needs to go
    playTransition(lowFrames, highFrames, next) {
        this.currentFrame = lowFrames;
        clearInterval(this.updateRunner);
        this.updateRunner = setInterval(() => this.updateTransition(highFrames, next), 1000 / this.fps);
    }    

    drawRotated(x, y, radians) {
        this.ctx.save();

        this.ctx.setTransform(1, 0, 0, 1, x + this.sWidth / 2, y + this.sHeight / 2);
        this.ctx.rotate(radians);
        // -sLength / 2 is the x and y, x and y are defined up in transform
        this.ctx.drawImage(this.image, this.sWidth * (this.currentFrame % this.fpr), this.sHeight * Math.floor(this.currentFrame / this.fpr), this.sWidth, this.sHeight, -this.sWidth / 2, -this.sHeight / 2, this.sWidth, this.sHeight);

        this.ctx.restore();
    }

    //must be called in the universal.
    draw(x, y) {
        let drawFrame = this.currentFrame;

        //increments the frames if it is bliked
        if (Math.random() <= this.blinkPercent) {
            console.log("blinking");
            drawFrame += this.blinkFrames;
        }

        if(this.isFlipped) { //if it's flipped
            this.ctx.save();  // save the current canvas state
            this.ctx.setTransform(
                -1, 0, // set the direction of x axis
                0, 1,   // set the direction of y axis
                this.image.width / this.fpr, // set the x origin
                0  // set the y origin
            );
            this.ctx.drawImage(this.image, this.sWidth * (drawFrame % this.fpr), this.sHeight * Math.floor(drawFrame / this.fpr), this.sWidth, this.sHeight, -x, y, this.sWidth, this.sHeight);
            this.ctx.restore(); // restore the state as it was when this function was called
        } else { //if it's not flipped
            this.ctx.drawImage(this.image, this.sWidth * (drawFrame % this.fpr), this.sHeight * Math.floor(drawFrame / this.fpr), this.sWidth, this.sHeight, x, y, this.sWidth, this.sHeight);
        }
        //console.log(drawFrame % this.fpr + ", " + Math.floor(drawFrame / this.fpr));
    }

    //not meant to be called, don't know how to make a function private here
    update(lowFrames, highFrames) {
        //draws the animation, WHY CAN WE GET CTX HERE
        this.currentFrame++;
        if(this.currentFrame > highFrames)
        {
            this.currentFrame = lowFrames;
        }
    }

    //not meant to be called, don't know how to make a function private here
    updateTransition(highFrames, next) {
        //draws the animation, WHY CAN WE GET CTX HERE
        this.currentFrame++;
        if(this.currentFrame > highFrames)
        {
            //playerAnimationID = next; //temporary solution
            //this.setId(playerAnimationID);
            this.play(next[0], next[1]);
        }
    }

    //not meant to be called, don't know how to make a function private here
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

//all the animations for everything
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
    vacc: {
        idle: [0, 0], //when mouse isn't being pressed
        active: [6, 11] //when mouse is being pressed
    }
}

window.animate = function() {
    window.playerAnimator = new AnimatorClass(chrome.runtime.getURL("assets/geggy-spritemap-small.png"), 30, 30, 10, 15, 1);
    window.playerAnimationID = animations.player.idle;

    window.vaccAnimator = new AnimatorClass(chrome.runtime.getURL("assets/brush.png"), 30, 30, 6, 12);
    window.vaccAnimationID = animations.vacc.idle;
    //console.log("animator loads");
};

window.animatorStart = function () {
    window.animatorDone = true;
}

export default animatorStart;

