var worker = null;
var CUBE_SIZE = 40;

var GoL3D = {
  init: function() {
    this.size = 100;
    this.liveCubes = this.matrix(this.size, this.size);

    this.nextGenerations = [];

    // Initialize the worker first, so it starts calulating
    // the future generations of cells.
    this.initializeWorker();

    this.transitions = [];

    this.buildScene();
    this.initializeCubes(this.size, this.size);

    this.cubesLoop();
    this.animate();
  },

  buildScene: function() {
    var w = window.innerWidth;
    var h = window.innerHeight;

    // DOM Elements.
    this.container = document.createElement('div');
    document.body.appendChild(this.container);

    $(this.container).css({
      "position": "absolute",
      "z-index": 10,
      "top": 0,
      "left": 0,
      "background": "black"
    })

    // Scene.
    this.scene = new THREE.Scene();

    // Camera.
    this.camera = new THREE.CombinedCamera(w, h, 40, 1, 10000, -2000, 10000);
    this.theta = Math.cos(45 * Math.PI / 360);
    this.alpha = Math.sin(45 * Math.PI / 360);
    this.still_camera = { x: false, y: false, z: false };
    this.camera_x = 1400
    this.camera_y = 600
    this.camera_z = 1400
    this.cameraTarget = new THREE.Vector3(0,0,0);
    this.camera.position.y = this.camera_y;
    this.camera.position.z = this.camera_z * this.theta;
    this.camera.position.x = this.camera_x * this.alpha;
    this.camera.lookAt(this.cameraTarget);

    this.scene.add(this.camera);

    // Plane.
    this.plane = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000, 200, 200),
                                new THREE.MeshBasicMaterial({ color: 0x222222, wireframe: true }));

    this.plane.rotation.x = Math.PI / 2;

    this.scene.add(this.plane);

    // Renderer.
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(w, h);
    this.container.appendChild(this.renderer.domElement);
  },

  // Get a cube from the pool, and adjust it's position and visibility.
  // Also store it in the liveCubes matrix.
  drawCell: function(coords) {
    var cube = this.getCube();

    var size = this.size / 2;

    cube.position.x = (coords[0] - size) * CUBE_SIZE + 10;
    cube.position.y = (coords[1] - size) * CUBE_SIZE + 10;
    cube.position.z = 10;

    cube.visible  = true;

    this.liveCubes[coords[0]][coords[1]] = cube;
  },

  // Removes the cube form the liveCubes matrix,
  // and stores it back in the cubes pool.
  killCell: function(coords) {
    var cube = this.liveCubes[coords[0]][coords[1]];

    cube.visible = false;
    cube.age = 0;

    this.liveCubes[coords[0]][coords[1]] = undefined;
    this.cubesPool.push(cube);
  },

  animate: function() {
    requestAnimationFrame(GoL3D.animate)

    GoL3D.moveCamera();
    GoL3D.render();

    if(GoL3D.liveCubes) {
        for (var x = 0; x < GoL3D.size; x++) {
            for(var y = 0; y < GoL3D.size; y++) {
                var cube = GoL3D.liveCubes[x][y];
                if (cube) {
                    cube.age++;
                    var hue = (.1*Math.sqrt(cube.age)) % 1.0;
                    cube.material.color.setHSV(hue,1.0,1.0);
                }
            }
        }
    }

    GoL3D.moveCamera();
    GoL3D.render();
  },

  transition: function(x,y,z) {
    this.transitions.push({ x: x, y: y, z: z });
  },

  moveCamera: function() {
    var diff, tr = this.transitions[0];

    if (!tr)
      return;

    $.each(["x","y","z"], function(_,axis) {
      diff = GoL3D["camera_" + axis] - tr[axis]

      Math.abs(diff) > 30 ?
        GoL3D["camera_"+axis] += 30 * (diff > 0 ? -1 : 1) :
        GoL3D.still_camera[axis] = true;
    });

    if (this.still_camera.x && this.still_camera.y && this.still_camera.z) {
      this.transitions.shift();
      this.still_camera = { x: false, y: false, z: false };
    }

    this.camera.position.y = this.camera_y;
    this.camera.position.z = this.camera_z * this.theta;
    this.camera.position.x = this.camera_x * this.alpha;

    this.camera.lookAt(this.cameraTarget);
  },

  initializeWorker: function() {
    worker = new Worker("/js/gol_worker.js");

    worker.onmessage = function(e) {
      GoL3D.nextGenerations = GoL3D.nextGenerations.concat(e.data);
    };

    worker.postMessage({ size: GoL3D.size })
  },

  setRules: function(r) {
    console.log('passed message');
    console.log(r);
    worker.postMessage({ new_rule: r });
  },

  cubesLoop: function() {
    setTimeout(GoL3D.cubesLoop, 100);

    var gen = GoL3D.nextGenerations.shift();
    var i, l;

    if (! gen) return;

    for (i = 0, l = gen.born.length; i < l; i++)
      GoL3D.drawCell(gen.born[i]);

    for (i = 0, l = gen.dead.length; i < l; i++)
      GoL3D.killCell(gen.dead[i]);
  },

  render: function() {
    this.renderer.render(this.scene, this.camera);
  },

  matrix: function(rows, columns) {
    var grid = new Array(rows);

    for (i = 0; i < rows; i++)
      grid[i] = new Array(columns);

    return grid;
  },

  // Cubes might be used over and over again in the same position.
  // They are cached, so next time we don't need to build the same cube again.
  getCube: function(x,y) {
    return this.cubesPool.shift() || this.buildCube();
  },

  initializeCubes: function(rows, columns) {
    var i;

    this.cubeGeo = new THREE.CubeGeometry(CUBE_SIZE,CUBE_SIZE,CUBE_SIZE);

    // Build a pool of objects to avoid creating/deleting
    // them later, over and over.
    this.cubesPool = [];

    // This is the size used to generate the initial random position
    var pool_size = this.size * 35;

    for (i = 0; i < pool_size; i++) this.buildCube();
  },

  makeCubeMaterial: function() {
    var cubeMaterial = new THREE.MeshBasicMaterial({
      shading: THREE.FlatShading,
      map: THREE.ImageUtils.loadTexture("/images/square-outline.png")
    });

    cubeMaterial.color.setHSV(.7, 1.0, 1.0);
    cubeMaterial.ambient = cubeMaterial.color;

    return cubeMaterial;
  },

  buildCube: function() {
    var cube = new THREE.Mesh(this.cubeGeo, this.makeCubeMaterial());

    cube.age = 0;

    cube.visible = false;

    this.cubesPool.push(cube);

    this.scene.add(cube);

    return cube;
  }
};
