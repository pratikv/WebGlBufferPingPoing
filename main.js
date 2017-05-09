var vs1 = `
attribute vec2 aPos;
void main(){
    gl_Position = vec4(aPos, 0. , 1.);
}
`

var fs1 = `
precision mediump float;
void main(){
    gl_FragColor = vec4(1., 0., 0., 1. );
}
`

var vs2 = `
attribute vec2 aPos;
attribute vec2 aUV;

varying vec2 vUV;
void main(){
    vUV= aUV;
    gl_Position = vec4(aPos, 0. , 1.);
}
`

var fs2 = `
precision mediump float;

varying vec2 vUV;

uniform sampler2D texture;
void main(){
    float s = 4.0;
    float d = 1.0 / 256.0;
    float x = vUV.x;
    float y = vUV.y;
    gl_FragColor = (    texture2D(texture, vec2(x+d,y))
                    +   texture2D(texture, vec2(x,y+d))
                    +   texture2D(texture, vec2(x-d,y))
                    +   texture2D(texture, vec2(x,y-d))
                    ) / s;
}
`;

var gl = document.getElementById("c").getContext("webgl");
var programInfo1 = twgl.createProgramInfo(gl, [vs1, fs1]);
var programInfo2 = twgl.createProgramInfo(gl, [vs2, fs2]);

var arrays1 = {
    aPos: { numComponents: 2, data: [-0.8, -0.8, 0.8, -0.8, 0.8, 0.8, -0.8, 0.8] },
    indices: [0, 1, 2, 2, 3, 0]
};

var arrays2 = {
    aPos: { numComponents: 2, data: [-1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1] },
    aUV: { numComponents: 2, data: [0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0] },
};


var fbi = twgl.createFramebufferInfo(gl, [{}], 256, 256);
console.log(fbi);

var bufferInfo1 = twgl.createBufferInfoFromArrays(gl, arrays1);
var bufferInfo2 = twgl.createBufferInfoFromArrays(gl, arrays2);

gl.useProgram(programInfo1.program);
gl.clearColor(0, 1, 0, 1);
gl.viewport(0, 0, 256, 256);

gl.clear(gl.COLOR_BUFFER_BIT);
twgl.setBuffersAndAttributes(gl, programInfo1, bufferInfo1);
twgl.drawBufferInfo(gl, bufferInfo1);

gl.bindFramebuffer(gl.FRAMEBUFFER, null);

gl.useProgram(programInfo2.program);

var tex1 = fbi.attachments[0];

var tex2 = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex2);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

var uniforms = {
    texture: tex1
}
twgl.setUniforms(programInfo2, uniforms);
twgl.setBuffersAndAttributes(gl, programInfo2, bufferInfo2);

var flag = true;
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbi.framebuffer);
    if (flag) {
        gl.bindTexture(gl.TEXTURE_2D, tex1);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex2, 0);
    }
    else {
        gl.bindTexture(gl.TEXTURE_2D, tex2);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex1, 0);
    }
    twgl.drawBufferInfo(gl, bufferInfo2);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    if (flag)
        gl.bindTexture(gl.TEXTURE_2D, tex2);
    else
        gl.bindTexture(gl.TEXTURE_2D, tex1);

    gl.clear(gl.COLOR_BUFFER_BIT);
    twgl.setBuffersAndAttributes(gl, programInfo2, bufferInfo2);
    twgl.drawBufferInfo(gl, bufferInfo2);
    flag = !flag;
    requestAnimationFrame(render);
}
render();