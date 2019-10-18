const Diagnostics = require('Diagnostics');
const Scene = require('Scene');
const Shaders = require('Shaders');
const Materials = require("Materials");
const R = require("Reactive");
const CameraInfo = require('CameraInfo');
const Textures = require('Textures');
const Time = require('Time');
const mat = Materials.get("material0");
const cameraTexture = Textures.get("cameraTexture0");
const cameraColor = cameraTexture.signal;

// get the texture coordinates in fragment stage
const texcoords = Shaders.fragmentStage(Shaders.vertexAttribute({'variableName': Shaders.VertexAttribute.TEX_COORDS}));


var sampled = Shaders.textureSampler(cameraColor, 
    greaterThenSignal(texcoords.y,0.5, texcoords, mirrorSignal(0.5, sampled, texcoords, Time.ms)));

// set texture to sampled
const textureSlot = Shaders.DefaultMaterialTextures.DIFFUSE
mat.setTexture(sampled, {textureSlotName: textureSlot});

function greaterThenSignal(shadersignal, value, leftSignal, rightSignal) {
    var step = R.step(shadersignal, value);
    return R.mix(leftSignal, rightSignal, step);
}

function mirrorSignal(mirrorPosition, textureColor, uvs, time) {
 
    const pixelSizeX  = R.div(1,CameraInfo.previewSize.width);
    const pixelSizeY = R.div(1,CameraInfo.previewSize.height);
   
    var distanceFromMirror = R.mod(uvs.y,mirrorPosition);

    // make sure you give the log function a value greater than 0
    // because it will crash on mobile, it works in the editor though :|
    distanceFromMirror = R.clamp(distanceFromMirror, 0.01,1.0);

    var sine = R.sin(R.add(R.mul(time,0.01),R.mul(R.log(distanceFromMirror),20)));

    var dy = R.mul(30, sine);
    var dx = R.val(0);
    
    dy = R.mul(dy, distanceFromMirror);
    var offsetX = R.mul(pixelSizeX, dx);
    var offsetY = R.mul(pixelSizeY, dy);

    const newUV = R.pack2(
        R.add(texcoords.x, offsetX),
        R.add(R.sub(1, texcoords.y), offsetY)
    );   
    return newUV;

}