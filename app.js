// Code modified from ColoredPoints.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
	'attribute vec4 a_Position;\n' +
	'void main() {\n' +
	'  gl_Position = a_Position;\n' +
	'  gl_PointSize = 50.0;\n' +
	'}\n';

// Fragment shader program
var FSHADER_SOURCE =
	'precision mediump float;\n' +
	'uniform vec4 u_FragColor;\n' +
	'void main() {\n' +
	'  gl_FragColor = u_FragColor;\n' +
	'}\n';

function main() {
	// Retrieve <canvas> element
	var canvas = document.getElementById('webgl');
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;

	// Get the rendering context for WebGL
	var gl = getWebGLContext(canvas);
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to intialize shaders.');
		return;
	}

	// Get WebGL storage location of a_Position
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return;
	}

	// Get WebGL storage location of u_FragColor
	var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	if (!u_FragColor) {
		console.log('Failed to get the storage location of u_FragColor');
		return;
	}

	// Register function (event handler) to be called on a mouse press
	canvas.onmousedown = function(ev){ click(ev, gl, canvas, a_Position, u_FragColor) };

	// Specify the color for clearing <canvas>
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var mine_points = []; //The array to store the position of Mines
var total_mines = 25;
var mine_radius = 0.1;


// fill in mine locations
for(var i = 0; i < total_mines; i++) {
    var mine_x = Math.random()*2 - 1;
    var mine_y = Math.random()*2 - 1;
    mine_points.push([mine_x, mine_y]);
}


// Function to evaluate whether mouse press was near mine
function withinRange(x, y, target_points) {
    for(var i = 0; i < target_points.length; i++) {
        var x_diff = Math.abs(x-target_points[i][0]);
        var y_diff = Math.abs(y-target_points[i][1]);
        if(x_diff <= mine_radius && y_diff <= mine_radius) {
            return true;
        }
    }
}

function click(ev, gl, canvas, a_Position, u_FragColor) {
	var x = ev.clientX; // x coordinate of a mouse pointer
	var y = ev.clientY; // y coordinate of a mouse pointer
	var rect = ev.target.getBoundingClientRect();

	// Convert from <canvas> coordinate system to WebGL coordinate system
	x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
	y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

	// Store the coordinates to g_points
	g_points.push([x, y]);

	if (withinRange(x, y, mine_points)) {
		g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Go red
	} else {                         
		g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Go green
	}

	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);

	var len = g_points.length;
	for(var i = 0; i < len; i++) {
		var xy = g_points[i];
		var rgba = g_colors[i];

		// Pass the position of a point to a_Position variable
		gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
		// Pass the color of a point to u_FragColor variable
		gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
		// Draw
		gl.drawArrays(gl.POINTS, 0, 1);
	}
}