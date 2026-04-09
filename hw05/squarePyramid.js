/*-------------------------------------------------------------------------
SquarePyramid.js
- Bottom face: xz plane (y=0), center (0,0), size dx=1, dz=1
- Height: 1 (Apex at (0, 1, 0))
- Side faces: Light Blue, Red, Yellow, Pink
---------------------------------------------------------------------------*/

export class squarePyramid {
    constructor(gl) {
        this.gl = gl;
        this.initBuffers();
    }

    initBuffers() {
        const gl = this.gl;

        // 각 면의 정점을 분리하여 정의 (Flat Shading 효과를 위해 정점 중복 정의)
        // 구조: [x, y, z,  r, g, b, a]
        const vertices = new Float32Array([
            // --- 측면 1: Light Blue (연하늘색) ---
             0.0, 1.0,  0.0,   0.6, 0.8, 1.0, 1.0, // Apex
            -0.5, 0.0,  0.5,   0.6, 0.8, 1.0, 1.0, // Front-Left
             0.5, 0.0,  0.5,   0.6, 0.8, 1.0, 1.0, // Front-Right

            // --- 측면 2: Red (빨간색) ---
             0.0, 1.0,  0.0,   1.0, 0.0, 0.0, 1.0, // Apex
             0.5, 0.0,  0.5,   1.0, 0.0, 0.0, 1.0, // Front-Right
             0.5, 0.0, -0.5,   1.0, 0.0, 0.0, 1.0, // Back-Right

            // --- 측면 3: Yellow (노란색) ---
             0.0, 1.0,  0.0,   1.0, 1.0, 0.0, 1.0, // Apex
             0.5, 0.0, -0.5,   1.0, 1.0, 0.0, 1.0, // Back-Right
            -0.5, 0.0, -0.5,   1.0, 1.0, 0.0, 1.0, // Back-Left

            // --- 측면 4: Pink (분홍색) ---
             0.0, 1.0,  0.0,   1.0, 0.4, 0.7, 1.0, // Apex
            -0.5, 0.0, -0.5,   1.0, 0.4, 0.7, 1.0, // Back-Left
            -0.5, 0.0,  0.5,   1.0, 0.4, 0.7, 1.0, // Front-Left

            // --- 밑면 (Bottom - Gray) ---
            -0.5, 0.0,  0.5,   0.5, 0.5, 0.5, 1.0,
             0.5, 0.0,  0.5,   0.5, 0.5, 0.5, 1.0,
             0.5, 0.0, -0.5,   0.5, 0.5, 0.5, 1.0,
            -0.5, 0.0, -0.5,   0.5, 0.5, 0.5, 1.0
        ]);

        const indices = new Uint16Array([
            0, 1, 2,     // Side 1
            3, 4, 5,     // Side 2
            6, 7, 8,     // Side 3
            9, 10, 11,   // Side 4
            12, 13, 14,  12, 14, 15 // Bottom
        ]);

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        this.numIndices = indices.length;
    }

    draw(shader) {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        // a_position (location = 0)
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0);
        gl.enableVertexAttribArray(0);

        // a_color (location = 2)
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 28, 12);
        gl.enableVertexAttribArray(2);

        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    }
}