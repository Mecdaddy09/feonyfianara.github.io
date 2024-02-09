import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Création de la scène
const scene = new THREE.Scene();

// Création de la caméra
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Création du renderer avec antialiasing
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Définition de la taille du renderer en fonction de la fenêtre
const width = window.innerWidth;
const height = window.innerHeight;
renderer.setSize(width, height);

// Ajout du renderer au conteneur dans le DOM
document.getElementById("container").appendChild(renderer.domElement);

// Création d'une boîte
const loader = new GLTFLoader();
let cube;

// Chargement du modèle GLB
loader.load(
  "./assets/arendrinatsymirehatra.glb",
  (gltf) => {
    cube = gltf.scene;

    // Positionnement initial de la caméra
    camera.position.set(0, 0, 2);

    // Ajout de la boîte à la scène
    scene.add(cube);

    // Ajout d'une lumière à la scène
    const light = new THREE.PointLight(0xeeeeee);
    light.position.set(0, 0, 2);
    scene.add(light);
  },
  undefined,
  (error) => {
    console.error("Erreur lors du chargement du modèle GLB", error);
  }
);

// Fonction pour animer la scène
function animate() {
  // Appel récursif pour la mise à jour continue de l'animation
  requestAnimationFrame(animate);

  // Rotation de la boîte sur les axes x et y
  if (cube) {
    cube.rotation.y += 0.01;
  }

  // Rendu de la scène avec la caméra
  renderer.render(scene, camera);
}

// Appel de la fonction animate pour démarrer l'animation
animate();
