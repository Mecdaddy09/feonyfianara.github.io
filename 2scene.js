<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Three.js Cube to Sphere Transition</title>
    <style>
      body {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <script type="module">
      import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js";

      let camera, scene, renderer;
      let cube, sphere, quitButton;
      let currentScene = "cube";

      init();
      animate();

      function init() {
        // Setup
        camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        scene = new THREE.Scene();
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Cube
        const geometryCube = new THREE.BoxGeometry();
        const materialCube = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        cube = new THREE.Mesh(geometryCube, materialCube);
        cube.userData.clickable = true; // Set clickable property to true initially
        scene.add(cube);

        // Sphere
        const geometrySphere = new THREE.SphereGeometry();
        const materialSphere = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        sphere = new THREE.Mesh(geometrySphere, materialSphere);
        sphere.visible = false; // Hide the sphere initially
        scene.add(sphere);

        // Event listener for clicks
        document.addEventListener("click", onClick, false);

        // Camera position
        camera.position.z = 5;

        // Add "Quitter" button
        quitButton = document.createElement("button");
        quitButton.textContent = "Quitter";
        quitButton.addEventListener("click", quitScene);
        document.body.appendChild(quitButton);
        quitButton.style.display = "none"; // Hide the button initially
      }

      function onClick(event) {
        // Check if the click intersects with the cube and the cube is clickable
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersectsCube = raycaster.intersectObject(cube);

        if (intersectsCube.length > 0 && cube.userData.clickable) {
          // Clicked on the clickable cube, switch to the sphere scene
          switchScene();
        }
      }

      function switchScene() {
        if (currentScene === "cube") {
          cube.visible = false;
          sphere.visible = true;
          cube.userData.clickable = false; // Make cube unclickable in sphere scene
          quitButton.style.display = "block"; // Show the "Quitter" button
          currentScene = "sphere";
        }
      }

      function quitScene() {
        // Return to the cube scene
        cube.visible = true;
        sphere.visible = false;
        cube.userData.clickable = true; // Make cube clickable when quitting from sphere scene
        quitButton.style.display = "none"; // Hide the "Quitter" button
        currentScene = "cube";
      }

      function animate() {
        requestAnimationFrame(animate);

        // Cube rotation
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        // Sphere rotation
        sphere.rotation.x += 0.01;
        sphere.rotation.y += 0.01;

        renderer.render(scene, camera);
      }
    </script>
  </body>
</html>
