// draw platforms
window.update = function(component){
    var ctx = myGameArea.context;

    var rgb = `0, 0, 0,`;
    ctx.fillStyle = `rgba(` + rgb + ((component.stability / 160) + 0.375) + `)`;

    ctx.fillRect(component.x, component.y, component.width, component.height);
}

// lib line function for broom handle
window.drawLine = function(begin, end, stroke = 'black', width = 1) {
    var ctx = myGameArea.context;

    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;

    ctx.beginPath();
    ctx.moveTo(...begin);
    ctx.lineTo(...end);
    ctx.stroke();
}

window.graphics = function() {

}

window.graphicsStart = function () {
    window.graphicsDone = true;
}

export default graphicsStart;