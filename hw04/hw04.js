import { resizeAspectRatio } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let isInitialized = false;
let shader;
let vao;
let positionBuffer;
let startTime = 0;

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) return;

    main().then(success => {
        if (success) isInitialized = true;
    }).catch(error => {
        console.error('프로그램 실행 중 오류 발생:', error);
    });
});

function initWebGL() {
    if (!gl) return false;

    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.2, 0.3, 1.0);

    return true;
}

function setupBuffers() {
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vertices = new Float32Array([
        -0.5, -0.5,
         0.5, -0.5,
        -0.5,  0.5,
         0.5,  0.5
    ]);

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    shader.setAttribPointer('a_position', 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
}

function drawRectWithMatrix(baseMatrix, width, height, color) {
    let finalMatrix = mat4.create();
    mat4.copy(finalMatrix, baseMatrix);
    mat4.scale(finalMatrix, finalMatrix, [width, height, 1.0]);

    let transformLoc = gl.getUniformLocation(shader.program, "u_transform");
    gl.uniformMatrix4fv(transformLoc, false, finalMatrix);

    shader.setVec4("u_color", color);

    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
}

function render(time) {
    if (!startTime) startTime = time;
    let elapsedTime = (time - startTime) / 1000.0;

    gl.clear(gl.COLOR_BUFFER_BIT);
    shader.use();

    let bigAngle = Math.sin(elapsedTime) * Math.PI * 2.0;
    let smallAngle = Math.sin(elapsedTime) * Math.PI * -10.0;

    let pillarMatrix = mat4.create();
    mat4.translate(pillarMatrix, pillarMatrix, [0.0, -0.4, 0.0]);
    drawRectWithMatrix(pillarMatrix, 0.15, 0.8, [0.6, 0.4, 0.2, 1.0]);

    let bigWingMatrix = mat4.create();
    mat4.translate(bigWingMatrix, bigWingMatrix, [0.0, 0.0, 0.0]);
    mat4.rotateZ(bigWingMatrix, bigWingMatrix, bigAngle);
    drawRectWithMatrix(bigWingMatrix, 0.6, 0.1, [0.9, 0.9, 0.9, 1.0]);

    let leftSmallMatrix = mat4.create();
    mat4.copy(leftSmallMatrix, bigWingMatrix);
    mat4.translate(leftSmallMatrix, leftSmallMatrix, [-0.3, 0.0, 0.0]);
    mat4.rotateZ(leftSmallMatrix, leftSmallMatrix, smallAngle);
    drawRectWithMatrix(leftSmallMatrix, 0.05, 0.2, [0.6, 0.6, 0.6, 1.0]);

    let rightSmallMatrix = mat4.create();
    mat4.copy(rightSmallMatrix, bigWingMatrix);
    mat4.translate(rightSmallMatrix, rightSmallMatrix, [0.3, 0.0, 0.0]);
    mat4.rotateZ(rightSmallMatrix, rightSmallMatrix, smallAngle);
    drawRectWithMatrix(rightSmallMatrix, 0.05, 0.2, [0.6, 0.6, 0.6, 1.0]);

    requestAnimationFrame(render);
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

async function main() {
    try {
        if (!initWebGL()) throw new Error('WebGL 초기화 실패');
        
        await initShader();
        setupBuffers();
        requestAnimationFrame(render);
        
        return true;
    } catch (error) {
        console.error('Failed to initialize program:', error);
        return false;
    }
}