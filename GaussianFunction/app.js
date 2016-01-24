// Linear.ts
/// <reference path="./Scripts/typings/threejs/three.d.ts" />
/// <reference path="./Scripts/typings/dat-gui/dat-gui.d.ts" />
/// <reference path="./lib/MyRenderer.ts" />
var Linear = (function () {
    function Linear() {
        this.frameAccum = 0;
        this.timeAccum = 0;
        this.fps = 0;
        this.timestep = 0;
        this.sigma2 = 4.0;
        this.sigma2_temp = this.sigma2;
        this.scale = 80.0;
        this.scale_temp = this.scale;
    }
    Linear.prototype.setup = function () {
        // Create an WebGL renderer
        this.myRenderer = new MyRenderer();
        // Create a camera
        var fov = 60;
        var aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(fov, aspect);
        this.camera.position.set(8, 8, 8);
        this.camera.up.set(0, 1, 0);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        // Create a scene
        this.scene = new THREE.Scene();
        // Create an ambient light
        this.ambientLight = new THREE.AmbientLight(0xffffff);
        // Add the light to the scene
        this.scene.add(this.ambientLight);
        // Create a line
        this.lineMat = new THREE.ShaderMaterial({
            uniforms: {
                sigma2: {
                    type: "f",
                    value: this.sigma2
                },
                amp: {
                    type: "f",
                    value: this.scale
                }
            },
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent
        });
        var gridSize = 16;
        var gridDiv = 48;
        var lineNum = gridDiv + 1;
        var vertices = new Float32Array(lineNum * lineNum * 3);
        for (var z = 0; z < lineNum; ++z) {
            for (var x = 0; x < lineNum; ++x) {
                var baseX = -gridSize / 2;
                var baseZ = baseX;
                var ofs = (x + lineNum * z);
                vertices[ofs * 3] = baseX + (gridSize / gridDiv) * x;
                vertices[ofs * 3 + 2] = baseZ + (gridSize / gridDiv) * z;
                vertices[ofs * 3 + 1] = 0;
            }
        }
        for (var lineIndex = 0; lineIndex < lineNum + lineNum; ++lineIndex) {
            // Generate index buffer
            var indices = new Uint16Array(lineNum);
            for (var i = 0; i < lineNum; ++i) {
                if (lineIndex < lineNum) {
                    indices[i] = lineIndex + (i * lineNum);
                }
                else {
                    indices[i] = (lineIndex - lineNum) * lineNum + i;
                }
            }
            // Add attributes
            var lineGeo = new THREE.BufferGeometry();
            lineGeo.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
            lineGeo.addAttribute('index', new THREE.BufferAttribute(indices, 1));
            var line = new THREE.Line(lineGeo, this.lineMat);
            this.scene.add(line);
        }
        // Setup OrbitControl
        this.controls = new THREE.OrbitControls(this.camera, this.myRenderer.renderer.domElement);
    };
    Linear.prototype.update = function (deltaTime) {
        // deltaTime is in milliseconds
        this.frameAccum++;
        this.timeAccum += deltaTime;
        if (this.timeAccum >= 1000) {
            this.fps = this.frameAccum;
            this.timestep = this.timeAccum / this.frameAccum;
            this.frameAccum = 0;
            this.timeAccum = 0;
        }
        this.controls.update();
        this.animate(deltaTime);
        this.myRenderer.render(this.scene, this.camera);
    };
    Linear.prototype.updateSize = function (width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.myRenderer.renderer.setSize(width, height);
    };
    Linear.prototype.smooth = function (target, current) {
        if (target != current) {
            var temp = target - current;
            temp /= 10.0;
            if (Math.abs(temp) < 0.0001) {
                current = target;
            }
            else {
                current += temp;
            }
        }
        return current;
    };
    Linear.prototype.animate = function (deltaTimeMSec) {
        var deltaTimeSec = deltaTimeMSec / 1000;
        this.sigma2_temp = this.smooth(this.sigma2, this.sigma2_temp);
        this.lineMat.uniforms.sigma2.value = this.sigma2_temp;
        this.scale_temp = this.smooth(this.scale, this.scale_temp);
        this.lineMat.uniforms.amp.value = this.scale_temp;
    };
    return Linear;
})();
var app = new Linear();
function onWindowResizeGaussian() {
    app.updateSize(window.innerWidth, window.innerHeight);
}
function main() {
    window.addEventListener('resize', onWindowResizeGaussian, false);
    var gui = new dat.GUI();
    gui.add(app, 'fps').listen();
    gui.add(app, 'sigma2', 1, 15.0);
    //gui.add( app, 'scale', 1, 100 );
    app.setup();
    var lastTime = 0;
    var loop = function () {
        var current = new Date().getTime();
        var delta = current - lastTime;
        app.update(delta);
        lastTime = current;
        requestAnimationFrame(loop);
    };
    loop();
}
window.onload = function () {
    main();
};
//# sourceMappingURL=app.js.map