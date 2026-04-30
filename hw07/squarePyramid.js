/*-------------------------------------------------------------------------
squarePyramid.js
- Bottom face: xz plane (y=0), center (0,0), size dx=1, dz=1
- Height: 1 (Apex at (0, 1, 0))
- One texture image is wrapped across the four side faces.
---------------------------------------------------------------------------*/

export class squarePyramid {
    constructor(gl) {
        this.gl = gl;
        this.initBuffers();
    }

    initBuffers() {
        const gl = this.gl;

        // Layout per vertex: [x, y, z, u, v]
        const vertices = new Float32Array([
            // Side 1: front, uses horizontal texture range 0.00 - 0.25
             0.0, 1.0,  0.0,   0.125, 1.0,
            -0.5, 0.0,  0.5,   0.000, 0.0,
             0.5, 0.0,  0.5,   0.250, 0.0,

            // Side 2: right, uses horizontal texture range 0.25 - 0.50
             0.0, 1.0,  0.0,   0.375, 1.0,
             0.5, 0.0,  0.5,   0.250, 0.0,
             0.5, 0.0, -0.5,   0.500, 0.0,

            // Side 3: back, uses horizontal texture range 0.50 - 0.75
             0.0, 1.0,  0.0,   0.625, 1.0,
             0.5, 0.0, -0.5,   0.500, 0.0,
            -0.5, 0.0, -0.5,   0.750, 0.0,

            // Side 4: left, uses horizontal texture range 0.75 - 1.00
             0.0, 1.0,  0.0,   0.875, 1.0,
            -0.5, 0.0, -0.5,   0.750, 0.0,
            -0.5, 0.0,  0.5,   1.000, 0.0,

            // Bottom: uses the whole texture image
            -0.5, 0.0,  0.5,   0.0, 0.0,
             0.5, 0.0,  0.5,   1.0, 0.0,
             0.5, 0.0, -0.5,   1.0, 1.0,
            -0.5, 0.0, -0.5,   0.0, 1.0
        ]);

        const indices = new Uint16Array([
            0, 1, 2,
            3, 4, 5,
            6, 7, 8,
            9, 10, 11,
            12, 13, 14,
            12, 14, 15
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
        shader.use();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 20, 0);
        gl.enableVertexAttribArray(0);

        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 20, 12);
        gl.enableVertexAttribArray(3);

        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    }
}
