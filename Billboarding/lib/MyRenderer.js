// app.ts
/// <reference path="../Scripts/typings/threejs/three.d.ts" />
var MyRenderer = (function () {
    function MyRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        if (this.renderer == null) {
            alert('WebGL is not available on this browser. sorry.');
            return;
        }
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(new THREE.Color(0.2, 0.2, 0.2));
        this.renderer.shadowMapEnabled = true;
        document.getElementById('viewport').appendChild(this.renderer.domElement);
    }
    MyRenderer.prototype.isAvailable = function () {
        return this.renderer != null;
    };
    MyRenderer.prototype.render = function (scene, camera) {
        this.renderer.render(scene, camera);
    };
    return MyRenderer;
})();
//# sourceMappingURL=MyRenderer.js.map