function webgl(glDrawMode,animacija,height,distance,cullDirection)
{
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `
    precision mediump float;

    const vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0));
    const float ambient = 0.2;

    attribute vec3 position;
    attribute vec3 normal;
    attribute vec3 color;
    varying vec3 vColor;
    varying float vBrightness;

    uniform mat4 matrix;
    uniform mat4 normalMatrix;

    void main(){
        vec3 worldNormal = (normalMatrix * vec4(normal, 1)).xyz;
        float diffuse = max(0.0, dot(worldNormal, lightDirection));
        vBrightness = ambient + diffuse;
        vColor = color*vBrightness;

        gl_Position = matrix * vec4(position, 1);
    }
    `);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader,`
    precision mediump float;

    varying float vBrightness;
    varying vec3 vColor;

    void main(){
        gl_FragColor = vec4(vColor, 1.0);
    }
    `);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        throw new Error (`Could not compile WebGL program. \n\n${info}`);
    }

    const positionLocation = gl.getAttribLocation(program, `position`);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    const normalLocation = gl.getAttribLocation(program, `normal`);
    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

    const colorLocation = gl.getAttribLocation(program, `color`);
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(cullDirection);

    const uniformLocations = {
        matrix: gl.getUniformLocation(program,`matrix`),
        normalMatrix: gl.getUniformLocation(program, `normalMatrix`),
    };

    const modelMatrix = mat4.create();
    const viewMatrix = mat4.create();
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix,
        75*Math.PI/180,
        canvas.clientWidth/canvas.clientHeight,
        1e-4,
        1e2);

    const mvMatrix =mat4.create();
    const mvpMatrix = mat4.create();


    
    mat4.translate(viewMatrix,viewMatrix,[0.0,1.0+height,8.0+distance]);
    mat4.invert(viewMatrix,viewMatrix);

    const normalMatrix = mat4.create();

    function animate() {

        mat4.rotateY(modelMatrix, modelMatrix, Math.PI/200);
        mat4.multiply(mvMatrix,viewMatrix,modelMatrix);
        mat4.multiply(mvpMatrix,projectionMatrix,mvMatrix);
        
        mat4.invert(normalMatrix, mvMatrix);
        mat4.transpose(normalMatrix, normalMatrix);
        gl.uniformMatrix4fv(uniformLocations.normalMatrix, false, normalMatrix);
        gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
        
        gl.drawArrays(glDrawMode, 0, vertexData.length/3);
        
        requestAnimationFrame(animate);
    }

    // mat4.rotateX(modelMatrix, modelMatrix, Math.PI/2);
    if(!animacija)
    {
        //pravi probleme
        // if(clearBuffer)
        // {
        //     gl.clearColor(0.612, 0.929, 1.0, 1.0);
        //     gl.clear(gl.COLOR_BUFFER_BIT);
        // }

        mat4.multiply(mvMatrix,viewMatrix,modelMatrix);
        mat4.multiply(mvpMatrix,projectionMatrix,mvMatrix);

        mat4.invert(normalMatrix, mvMatrix);
        mat4.transpose(normalMatrix, normalMatrix);

        gl.uniformMatrix4fv(uniformLocations.normalMatrix, false, normalMatrix);
        gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);

        gl.drawArrays(glDrawMode, 0, vertexData.length/3);
    }
    else
    {
        animate();
    }
}