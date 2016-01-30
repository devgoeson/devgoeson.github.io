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
        this.spherical = false;
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
        // Create lines
        var whiteMat = new THREE.LineBasicMaterial({ color: 0xffffff });
        var gridSize = 8;
        var gridDiv = 8;
        var lineNum = gridDiv + 1;
        // Z axis
        for (var lineIndex = 0; lineIndex < lineNum; ++lineIndex) {
            var z1 = gridSize / 2;
            var z0 = -z1;
            var x = (-gridSize / 2) + (gridSize / gridDiv) * lineIndex;
            var geo = new THREE.Geometry();
            geo.vertices.push(new THREE.Vector3(x, 0.0, z0));
            geo.vertices.push(new THREE.Vector3(x, 0.0, z1));
            var line = new THREE.Line(geo, whiteMat);
            this.scene.add(line);
        }
        // X axis
        for (var lineIndex = 0; lineIndex < lineNum; ++lineIndex) {
            var x1 = gridSize / 2;
            var x0 = -x1;
            var z = (-gridSize / 2) + (gridSize / gridDiv) * lineIndex;
            var geo = new THREE.Geometry();
            geo.vertices.push(new THREE.Vector3(x0, 0.0, z));
            geo.vertices.push(new THREE.Vector3(x1, 0.0, z));
            var line = new THREE.Line(geo, whiteMat);
            this.scene.add(line);
        }
        // Create billboarding planes
        this.billMat = new THREE.ShaderMaterial({
            uniforms: {
                spherical: {
                    type: 'f',
                    value: 0.0
                }
            },
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent
        });
        var plane0 = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), this.billMat);
        this.scene.add(plane0);
        var plane1 = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), this.billMat);
        plane1.position.x = 2.0;
        plane1.position.z = -1.0;
        this.scene.add(plane1);
        var plane2 = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), this.billMat);
        plane2.position.x = -3.0;
        plane2.position.z = 2.0;
        this.scene.add(plane2);
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
    Linear.prototype.animate = function (deltaTimeMSec) {
        var deltaTimeSec = deltaTimeMSec / 1000;
        this.billMat.uniforms.spherical.value = this.spherical ? 1.0 : 0.0;
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
    gui.add(app, 'spherical');
    //gui.add( app, 'sigma2', 1, 15.0 );
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