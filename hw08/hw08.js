import { resizeAspectRatio, setupText, updateText } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

import { Cube } from '../util/cube.js';
import { Arcball } from '../util/arcball.js';
import { Cone } from './cone.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');

let gouraudShader;
let phongShader;
let lampShader;

let textOverlay2;
let textOverlay3;

let isInitialized = false;

let viewMatrix = mat4.create();
let projMatrix = mat4.create();
let modelMatrix = mat4.create();
let lampModelMatrix = mat4.create();

let arcBallMode = 'CAMERA';
let shadingMode = 'FLAT';
let renderingMode = 'GOURAUD';

const cone = new Cone(gl, 32);
const lamp = new Cube(gl);

const cameraPos = vec3.fromValues(0, 0, 3);
const lightPos = vec3.fromValues(1.0, 0.7, 1.0);
const lightSize = vec3.fromValues(0.1, 0.1, 0.1);

const arcball = new Arcball(canvas, 5.0, {
    rotation: 2.0,
    zoom: 0.0005
});

document.addEventListener('DOMContentLoaded', () => {

    if (isInitialized) return;

    main().then(success => {

        if (!success) return;

        isInitialized = true;

    }).catch(error => {

        console.error(error);
    });
});

function setupKeyboardEvents() {

    document.addEventListener('keydown', (event) => {

        if (event.key === 'a') {

            arcBallMode =
                arcBallMode === 'CAMERA'
                ? 'MODEL'
                : 'CAMERA';

            updateOverlay();
        }

        else if (event.key === 'r') {

            arcball.reset();

            modelMatrix = mat4.create();

            arcBallMode = 'CAMERA';

            updateOverlay();
        }

        else if (event.key === 's') {

            cone.copyVertexNormalsToNormals();
            cone.updateNormals();

            shadingMode = 'SMOOTH';

            updateOverlay();
        }

        else if (event.key === 'f') {

            cone.copyFaceNormalsToNormals();
            cone.updateNormals();

            shadingMode = 'FLAT';

            updateOverlay();
        }

        else if (event.key === 'g') {

            renderingMode = 'GOURAUD';

            updateOverlay();
        }

        else if (event.key === 'p') {

            renderingMode = 'PHONG';

            updateOverlay();
        }
    });
}

function updateOverlay() {

    updateText(
        textOverlay2,
        "arcball mode: " + arcBallMode
    );

    updateText(
        textOverlay3,
        "shading mode: " +
        shadingMode +
        " (" + renderingMode + ")"
    );
}

function initWebGL() {

    if (!gl) {

        console.error('WebGL2 not supported');
        return false;
    }

    canvas.width = 700;
    canvas.height = 700;

    resizeAspectRatio(gl, canvas);

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0.1, 0.1, 0.1, 1.0);

    return true;
}

async function initShaders() {

    gouraudShader = new Shader(
        gl,
        await readShaderFile('shGouraudVert.glsl'),
        await readShaderFile('shGouraudFrag.glsl')
    );

    phongShader = new Shader(
        gl,
        await readShaderFile('shPhongVert.glsl'),
        await readShaderFile('shPhongFrag.glsl')
    );

    lampShader = new Shader(
        gl,
        await readShaderFile('shLampVert.glsl'),
        await readShaderFile('shLampFrag.glsl')
    );
}

function setCommonUniforms(shader) {

    shader.use();

    shader.setMat4("u_projection", projMatrix);

    shader.setVec3(
        "material.diffuse",
        vec3.fromValues(1.0, 0.5, 0.31)
    );

    shader.setVec3(
        "material.specular",
        vec3.fromValues(0.5, 0.5, 0.5)
    );

    shader.setFloat("material.shininess", 32);

    shader.setVec3("light.position", lightPos);

    shader.setVec3(
        "light.ambient",
        vec3.fromValues(0.2, 0.2, 0.2)
    );

    shader.setVec3(
        "light.diffuse",
        vec3.fromValues(0.7, 0.7, 0.7)
    );

    shader.setVec3(
        "light.specular",
        vec3.fromValues(1.0, 1.0, 1.0)
    );

    shader.setVec3("u_viewPos", cameraPos);
}

function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);

    if (arcBallMode === 'CAMERA') {

        viewMatrix = arcball.getViewMatrix();
    }
    else {

        modelMatrix = arcball.getModelRotMatrix();

        viewMatrix = arcball.getViewCamDistanceMatrix();
    }

    let currentShader =
        renderingMode === 'GOURAUD'
        ? gouraudShader
        : phongShader;

    currentShader.use();

    currentShader.setMat4('u_model', modelMatrix);
    currentShader.setMat4('u_view', viewMatrix);

    currentShader.setVec3('u_viewPos', cameraPos);

    cone.draw(currentShader);

    lampShader.use();

    lampShader.setMat4('u_view', viewMatrix);

    lamp.draw(lampShader);

    requestAnimationFrame(render);
}

async function main() {

    try {

        if (!initWebGL()) {
            throw new Error("WebGL init failed");
        }

        mat4.lookAt(
            viewMatrix,
            cameraPos,
            vec3.fromValues(0, 0, 0),
            vec3.fromValues(0, 1, 0)
        );

        mat4.perspective(
            projMatrix,
            glMatrix.toRadian(60),
            canvas.width / canvas.height,
            0.1,
            100.0
        );

        await initShaders();

        setCommonUniforms(gouraudShader);
        setCommonUniforms(phongShader);

        lampShader.use();

        lampShader.setMat4("u_projection", projMatrix);

        mat4.translate(
            lampModelMatrix,
            lampModelMatrix,
            lightPos
        );

        mat4.scale(
            lampModelMatrix,
            lampModelMatrix,
            lightSize
        );

        lampShader.setMat4(
            'u_model',
            lampModelMatrix
        );

        setupText(canvas, "Cone with Lighting", 1);

        textOverlay2 =
            setupText(
                canvas,
                "arcball mode: " + arcBallMode,
                2
            );

        textOverlay3 =
            setupText(
                canvas,
                "shading mode: " +
                shadingMode +
                " (" + renderingMode + ")",
                3
            );

        setupText(canvas, "press 'a' to change arcball mode", 4);
        setupText(canvas, "press 'r' to reset arcball", 5);
        setupText(canvas, "press 's' to switch to smooth shading", 6);
        setupText(canvas, "press 'f' to switch to flat shading", 7);
        setupText(canvas, "press 'g' to switch to Gouraud shading", 8);
        setupText(canvas, "press 'p' to switch to Phong shading", 9);

        setupKeyboardEvents();

        requestAnimationFrame(render);

        return true;

    } catch (error) {

        console.error(error);

        alert("Initialization failed");

        return false;
    }
}