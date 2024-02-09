import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const fragment = `

  varying vec2 vCoordinates;

  void main() {
    
    
    gl_FragColor = vec4(vCoordinates.x/512.,vCoordinates.y/512.,0.,1.);
         
  }
`;

const vertex = `
  varying vec2 vUv;
  varying vec2 vCoordinates;
  attribute vec3 aCoordinates;
 
  void main() {
    vUv = uv;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.);
    gl_PointSize = 4000. * (1. / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    vCoordinates = aCoordinates.xy;
  }
`;

export default class Sketch {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("container").appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    this.camera.position.z = 2000;

    this.scene = new THREE.Scene();

    this.time = 0;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.addMesh();

    this.render();
  }
  addMesh() {
    this.material = new THREE.ShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      uniforms: {
        progress: { type: "f", value: 0 },
      },
      side: THREE.DoubleSide,
    });

    const number = 512 * 521;
    this.geometry = new THREE.BufferGeometry();

    this.positions = new THREE.BufferAttribute(new Float32Array(number * 3), 3);
    this.coordinates = new THREE.BufferAttribute(
      new Float32Array(number * 3),
      3
    );
    let index = 0;
    for (let i = 0; i < 512; i++) {
      let posX = i - 256;
      for (let j = 0; j < 512; j++) {
        this.positions.setXYZ(index, posX * 2, (j - 256) * 2, 0);
        this.coordinates.setXYZ(index, i, j, 0);

        index++;
      }
    }

    this.geometry.setAttribute("position", this.positions);
    this.geometry.setAttribute("aCoordinates", this.coordinates);

    this.mesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  render() {
    this.time++;
    // this.mesh.rotation.x += 0.01;
    // this.mesh.rotation.y += 0.02;
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch();
