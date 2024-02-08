import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import GUI from "lil-gui";
import { Text } from "troika-three-text";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import sphere360 from "./img/vita360_stitch.jpg";
import earth from "./img/cartedemode360.jpg";

function calcPosFromLatLonRad(lat, lon) {
  var phi = lat * (Math.PI / 180);
  var theta = (lon + 180) * (Math.PI / 180);
  var theta1 = (270 - lon) * (Math.PI / 180);
  let x = Math.cos(phi) * Math.cos(theta);
  let z = Math.cos(phi) * Math.sin(theta);
  let y = Math.sin(phi);
  let vector = { x, y, z };
  let euler = new THREE.Euler(phi, theta1, 0, "XYZ");
  let quaternion = new THREE.Quaternion().setFromEuler(euler);
  return { vector, quaternion };
}

let points = [
  {
    title: "Madagascar",
    coords: {
      lat: -18.766947,
      lng: 46.869107,
    },
    texture: sphere360,
  },
  {
    title: "France",
    coords: {
      lat: 46.232192999999995,
      lng: 2.209666999999996,
    },
    texture: sphere360,
  },
  {
    title: "États-Unis",
    coords: {
      lat: 36.966428,
      lng: -95.844032,
    },
    texture: sphere360,
  },
];

const fragment = `
uniform float time;
uniform float progress;
uniform sampler2D scene360;
uniform sampler2D sceneplanet;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.141592653589793238;

vec2 distort(vec2 olduv, float pr, float expo){
  vec2 p0 = 2. * olduv - 1.;
  vec2 p1 = p0 / (1. - pr * length(p0) * expo);

  return (p1 + 1.) * 0.5;
}

void main() {
  float progress1 = smoothstep(0.75,1.,progress);


  vec2 uv1 = distort(vUv, 
    -10.*pow(0.5 + 0.5*progress,32.),
    progress*4.);
  vec2 uv2 = distort(vUv, 
    -10.*(1. - progress1)
    ,progress*4.);


  vec4 s360 = texture2D(scene360, uv2);
  vec4 sPlanet = texture2D(sceneplanet, uv1);
  float mixer = progress1;
  vec4 finalTexture = mix(sPlanet, s360, mixer);

  gl_FragColor = vec4(uv1, 0.0, 1.);
  gl_FragColor = finalTexture;
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
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById("container").appendChild(this.renderer.domElement);
    this.progressContainer = document.getElementById("progress-container");

    //scene1
    this.scene360 = new THREE.Scene();
    this.scene360.background = new THREE.Color(0xffffff);
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );
    this.camera.position.z = 3;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;

    //scene2
    this.sceneplanet = new THREE.Scene();
    this.sceneplanet.background = new THREE.Color(0xffffff);
    this.camera1 = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );
    this.camera1.position.z = 2.5;
    this.controls1 = new OrbitControls(this.camera1, this.renderer.domElement);

    // scenefinal
    this.sceneFinal = new THREE.Scene();
    this.cameraFinal = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    // Orthographic Camera
    var frustumSize = 1;
    var aspect = window.innerWidth / window.innerHeight;
    this.cameraFinal = new THREE.OrthographicCamera(
      frustumSize / -2,
      frustumSize / 2,
      frustumSize / 2,
      frustumSize / -2,
      -1000,
      1000
    );
    this.cameraFinal.position.z = 3;

    this.time = 0;

    this.create360();
    this.createplanet();
    this.createFinalScene();
    this.settings();

    this.render();
  }

  settings() {
    this.settings = {
      progress: 0,
    };

    // Ajoutez la barre de progression à votre GUI dat.GUI
    this.gui = new GUI({ autoPlace: false });
    const progressController = this.gui.add(
      this.settings,
      "progress",
      0,
      1,
      0.01
    );

    // Ajoutez le conteneur de la barre de progression à la position souhaitée
    this.progressContainer.appendChild(this.gui.domElement);

    // Ajoutez un style CSS pour ajuster la position du conteneur de la barre de progression
    this.progressContainer.style.position = "absolute";
    this.progressContainer.style.bottom = "30px";
    this.progressContainer.style.left = "10px";
  }

  create360() {
    const geometry = new THREE.SphereGeometry(10, 30, 30);
    let t = new THREE.TextureLoader().load(sphere360);
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.x = -1;
    const material = new THREE.MeshBasicMaterial({
      map: t,
      side: THREE.BackSide,
    });
    const sphere = new THREE.Mesh(geometry, material);
    this.scene360.add(sphere);

    // Create:
    const myText = new Text();
    this.scene360.add(myText);

    // Set properties to configure:
    myText.text = "Studio EMIT";
    myText.fontSize = 1;
    myText.anchorX = "center";
    myText.font = "./fonts/Montserrat-Regular.otf";
    myText.position.z = -4;
    myText.color = 0x9ec3e9;

    // Update the rendering:
    myText.sync();
  }

  createplanet() {
    this.group = new THREE.Group();

    // Création de la géométrie de la terre
    this.earth = new THREE.SphereGeometry(1, 30, 30);
    const material = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(earth),
    });
    const plane = new THREE.Mesh(this.earth, material);
    this.group.add(plane);
    this.sceneplanet.add(this.group);

    let list = document.getElementById("list");
    points.forEach((p) => {
      let coords = calcPosFromLatLonRad(p.coords.lat, p.coords.lng);

      let el = document.createElement("div");
      el.innerText = p.title;
      list.appendChild(el);

      // Ajouter une lumière ambiante à votre scène
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Lumière blanche à 50%
      this.sceneplanet.add(ambientLight);

      // Ajouter une lumière directionnelle à votre scène
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Lumière blanche à 100%
      directionalLight.position.set(1, 1, 1).normalize();
      this.sceneplanet.add(directionalLight);

      // Utilisez GLTFLoader pour charger le modèle GLTF
      const loader = new GLTFLoader();
      loader.load(
        "./assets/arendrinatsymirehatra.glb",
        (gltf) => {
          // Récupérez le modèle de la scène GLTF
          let model = gltf.scene;

          // Positionnement initial du modèle
          model.position.copy(coords.vector);

          // Redimensionnement du modèle (échelle)
          const scaleValue = 0.05; // Vous pouvez ajuster cette valeur selon vos besoins
          model.scale.set(scaleValue, scaleValue, scaleValue);

          // Ajoutez le modèle à la scène
          this.group.add(model);

          // Ajouter une animation de rotation continue sur l'axe Y
          this.animateRotation(model, 0.005); // Ajustez la vitesse de rotation selon vos besoins
        },
        undefined,
        (error) => {
          console.error("Erreur lors du chargement du modèle GLTF", error);
        }
      );

      let animatedQuaternion = new THREE.Quaternion();
      let currentQuaternion = new THREE.Quaternion();

      el.addEventListener("click", () => {
        let o = { p: 0 };

        currentQuaternion.copy(this.group.quaternion);
        gsap.to(o, {
          p: 1,
          duration: 1,
          onUpdate: () => {
            animatedQuaternion.slerpQuaternions(
              currentQuaternion,
              coords.quaternion,
              o.p
            );
            this.group.quaternion.copy(animatedQuaternion);
          },
        });
        gsap.to(this.settings, {
          duration: 1,
          delay: 0.5,
          progress: 1,
        });
      });
    });
  }

  // Fonction pour animer la rotation
  animateRotation(object, speed) {
    function animate() {
      object.rotation.y += speed;
      requestAnimationFrame(animate);
    }

    animate();
  }

  createFinalScene() {
    this.texture360 = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      }
    );
    this.textureplanet = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      }
    );

    this.material = new THREE.ShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      uniforms: {
        progress: { value: 0 },

        scene360: { value: null },
        sceneplanet: { value: null },
      },
      side: THREE.DoubleSide,
    });

    let geo = new THREE.PlaneGeometry(1, 1);
    let mesh = new THREE.Mesh(geo, this.material);
    this.sceneFinal.add(mesh);
  }

  render() {
    this.time++;

    requestAnimationFrame(this.render.bind(this));
    this.renderer.setRenderTarget(this.texture360);
    // Mise à jour des contrôles pour la première caméra
    this.controls.update();
    this.renderer.render(this.scene360, this.camera);
    this.renderer.setRenderTarget(this.textureplanet);
    // Mise à jour des contrôles pour la deuxième caméra
    this.controls1.update();
    this.renderer.render(this.sceneplanet, this.camera1);
    this.material.uniforms.scene360.value = this.texture360.texture;
    this.material.uniforms.sceneplanet.value = this.textureplanet.texture;
    this.material.uniforms.progress.value = this.settings.progress;
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.sceneFinal, this.cameraFinal);
  }
}

new Sketch();
