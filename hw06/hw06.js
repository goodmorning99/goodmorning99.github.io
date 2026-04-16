import { setupText, updateText, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';
import { Cube } from '../util/cube.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let lastFrameTime; 
let isInitialized = false; 

let modelMatrix = mat4.create(); 
let viewMatrixLeft = mat4.create(); 
let projMatrixLeft = mat4.create(); 
let viewMatrixRight = mat4.create();
let projMatrixRight = mat4.create();

let cube;
let axes;
let cameraTextOverlay;


const cubePositions = [
    vec3.fromValues(0.0, 0.0, 0.0),
    vec3.fromValues(2.0, 0.5, -3.0),
    vec3.fromValues(-1.5, -0.5, -2.5),
    vec3.fromValues(3.0, 0.0, -4.0),
    vec3.fromValues(-3.0, 0.0, 1.0)
];


let cameraPos = vec3.fromValues(0, 0, 5);  
let cameraFront = vec3.fromValues(0, 0, -1); 
let cameraUp = vec3.fromValues(0, 1, 0); 
let yaw = -90;  
let pitch = 0;  
const mouseSensitivity = 0.1;  
const cameraSpeed = 2.5;  

const keys = { 'w': false, 'a': false, 's': false, 'd': false };
const topDownCameraPos = vec3.fromValues(0.0, 15.0, 0.0);
const topDownTarget = vec3.fromValues(0.0, 0.0, 0.0);
const topDownUp = vec3.fromValues(0.0, 0.0, -1.0);

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) return;
    main().then(success => {
        if (success) isInitialized = true;
    });
});


document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = true;
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = false;
});


canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
        document.addEventListener("mousemove", updateCamera);
    } else {
        document.removeEventListener("mousemove", updateCamera);
    }
});

function updateCamera(e) {
    const xoffset = e.movementX * mouseSensitivity;  
    const yoffset = -e.movementY * mouseSensitivity; 

    yaw += xoffset;
    pitch += yoffset;

    if (pitch > 89.0) pitch = 89.0;
    if (pitch < -89.0) pitch = -89.0;

    const direction = vec3.create();
    direction[0] = Math.cos(glMatrix.toRadian(yaw)) * Math.cos(glMatrix.toRadian(pitch));
    direction[1] = Math.sin(glMatrix.toRadian(pitch));
    direction[2] = Math.sin(glMatrix.toRadian(yaw)) * Math.cos(glMatrix.toRadian(pitch));
    vec3.normalize(cameraFront, direction);
}

function initWebGL() {
    if (!gl) return false;

    canvas.width = 1400;
    canvas.height = 700;
    
    gl.enable(gl.SCISSOR_TEST);
    gl.enable(gl.DEPTH_TEST);
    return true;
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

function render() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastFrameTime) / 1000.0;
    lastFrameTime = currentTime;

    const cameraSpeedWithDelta = cameraSpeed * deltaTime;
    
    if (keys['w']) vec3.scaleAndAdd(cameraPos, cameraPos, cameraFront, cameraSpeedWithDelta);
    if (keys['s']) vec3.scaleAndAdd(cameraPos, cameraPos, cameraFront, -cameraSpeedWithDelta);
    if (keys['a']) {
        const cameraRight = vec3.create();
        vec3.cross(cameraRight, cameraFront, cameraUp);
        vec3.normalize(cameraRight, cameraRight);
        vec3.scaleAndAdd(cameraPos, cameraPos, cameraRight, -cameraSpeedWithDelta);
    }
    if (keys['d']) {
        const cameraRight = vec3.create();
        vec3.cross(cameraRight, cameraFront, cameraUp);
        vec3.normalize(cameraRight, cameraRight);
        vec3.scaleAndAdd(cameraPos, cameraPos, cameraRight, cameraSpeedWithDelta);
    }

    gl.viewport(0, 0, 700, 700);
    gl.scissor(0, 0, 700, 700);
    gl.clearColor(0.1, 0.2, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.lookAt(viewMatrixLeft, cameraPos, vec3.add(vec3.create(), cameraPos, cameraFront), cameraUp);

    shader.use();
    shader.setMat4('u_view', viewMatrixLeft);
    shader.setMat4('u_projection', projMatrixLeft);
    
    for(let pos of cubePositions) {
        mat4.identity(modelMatrix);
        mat4.translate(modelMatrix, modelMatrix, pos);
        shader.setMat4('u_model', modelMatrix);
        cube.draw(shader);
    }
    axes.draw(viewMatrixLeft, projMatrixLeft);

    gl.viewport(700, 0, 700, 700);
    gl.scissor(700, 0, 700, 700);
    gl.clearColor(0.05, 0.15, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.lookAt(viewMatrixRight, topDownCameraPos, topDownTarget, topDownUp);

    shader.use();
    shader.setMat4('u_view', viewMatrixRight);
    shader.setMat4('u_projection', projMatrixRight);
    
    for(let pos of cubePositions) {
        mat4.identity(modelMatrix);
        mat4.translate(modelMatrix, modelMatrix, pos);
        shader.setMat4('u_model', modelMatrix);
        cube.draw(shader);
    }
    axes.draw(viewMatrixRight, projMatrixRight);

    const cx = cameraPos[0].toFixed(1);
    const cy = cameraPos[1].toFixed(1);
    const cz = cameraPos[2].toFixed(1);
    const yStr = yaw.toFixed(1);
    const pStr = pitch.toFixed(1);
    updateText(cameraTextOverlay, `Camera pos: (${cx}, ${cy}, ${cz}) | Yaw: ${yStr}° | Pitch: ${pStr}°`);

    requestAnimationFrame(render);
}

async function main() {
    try {
        if (!initWebGL()) throw new Error('Failed to initialize WebGL');
        await initShader();

        cube = new Cube(gl);
        axes = new Axes(gl, 2.0);

        mat4.perspective(projMatrixLeft, glMatrix.toRadian(60), 1.0, 0.1, 100.0);

        mat4.ortho(projMatrixRight, -10.0, 10.0, -10.0, 10.0, 0.1, 100.0);

        lastFrameTime = Date.now();

        cameraTextOverlay = setupText(canvas, "Camera pos: (0.0, 0.0, 5.0) | Yaw: -90.0° | Pitch: 0.0°", 1);
        setupText(canvas, "WASD: move camera | Mouse: look (click to lock) | ESC: unlock", 2);
        setupText(canvas, "Left: Perspective | Right: Orthographic (Top-Down)", 3);

        requestAnimationFrame(render);
        return true;
    } catch (error) {
        console.error('Failed to initialize program:', error);
        return false;
    }
}
