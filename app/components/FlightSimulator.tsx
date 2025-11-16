'use client';

import { useEffect, useRef } from 'react';

export default function FlightSimulator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;

    // Load Three.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;

    script.onload = () => {
      if (!containerRef.current) return;
      initFlightSimulator();
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup will be handled in the init function
    };
  }, []);

  const initFlightSimulator = () => {
    const THREE = (window as any).THREE;
    if (!THREE || !containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    scene.fog = new THREE.Fog(0x87CEEB, 100, 1000);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    scene.add(directionalLight);

    // Aircraft object (blocky/Minecraft style)
    const aircraft = new THREE.Group();

    // Fuselage (main body)
    const fuselageGeometry = new THREE.BoxGeometry(2, 1.5, 6);
    const fuselageMaterial = new THREE.MeshLambertMaterial({ color: 0xFF4444 });
    const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
    fuselage.castShadow = true;
    aircraft.add(fuselage);

    // Cockpit
    const cockpitGeometry = new THREE.BoxGeometry(1.8, 1, 2);
    const cockpitMaterial = new THREE.MeshLambertMaterial({ color: 0x4444FF });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(0, 0.8, 1);
    cockpit.castShadow = true;
    aircraft.add(cockpit);

    // Wings
    const wingGeometry = new THREE.BoxGeometry(12, 0.3, 3);
    const wingMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6666 });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.set(0, 0, 0);
    wings.castShadow = true;
    aircraft.add(wings);

    // Tail wing
    const tailWingGeometry = new THREE.BoxGeometry(4, 0.2, 1.5);
    const tailWing = new THREE.Mesh(tailWingGeometry, wingMaterial);
    tailWing.position.set(0, 0, -3);
    tailWing.castShadow = true;
    aircraft.add(tailWing);

    // Vertical stabilizer
    const stabilizerGeometry = new THREE.BoxGeometry(0.3, 3, 1.5);
    const stabilizer = new THREE.Mesh(stabilizerGeometry, wingMaterial);
    stabilizer.position.set(0, 1.5, -3);
    stabilizer.castShadow = true;
    aircraft.add(stabilizer);

    // Propeller
    const propellerGroup = new THREE.Group();
    const propellerBladeGeometry = new THREE.BoxGeometry(0.3, 3, 0.3);
    const propellerMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });

    const blade1 = new THREE.Mesh(propellerBladeGeometry, propellerMaterial);
    const blade2 = new THREE.Mesh(propellerBladeGeometry, propellerMaterial);
    blade2.rotation.z = Math.PI / 2;

    propellerGroup.add(blade1);
    propellerGroup.add(blade2);
    propellerGroup.position.set(0, 0, 3.5);
    aircraft.add(propellerGroup);

    aircraft.position.set(0, 50, 0);
    scene.add(aircraft);

    // Minecraft-style terrain
    const createMinecraftTerrain = () => {
      const terrainGroup = new THREE.Group();
      const blockSize = 5;
      const gridSize = 60;

      // Create different colored blocks for terrain variety
      const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
      const dirtMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      const stoneMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });

      for (let x = -gridSize; x < gridSize; x++) {
        for (let z = -gridSize; z < gridSize; z++) {
          const height = Math.floor(Math.sin(x * 0.1) * Math.cos(z * 0.1) * 3);
          const material = height > 1 ? stoneMaterial : height > 0 ? dirtMaterial : grassMaterial;

          const blockGeometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
          const block = new THREE.Mesh(blockGeometry, material);

          block.position.set(
            x * blockSize,
            height * blockSize - blockSize,
            z * blockSize
          );
          block.receiveShadow = true;
          block.castShadow = true;
          terrainGroup.add(block);

          // Add some random trees
          if (Math.random() > 0.98 && height === 0) {
            // Tree trunk
            const trunkGeometry = new THREE.BoxGeometry(blockSize * 0.4, blockSize * 3, blockSize * 0.4);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(x * blockSize, blockSize * 2, z * blockSize);
            trunk.castShadow = true;
            terrainGroup.add(trunk);

            // Tree leaves
            const leavesGeometry = new THREE.BoxGeometry(blockSize * 2, blockSize * 2, blockSize * 2);
            const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.set(x * blockSize, blockSize * 4, z * blockSize);
            leaves.castShadow = true;
            terrainGroup.add(leaves);
          }
        }
      }

      return terrainGroup;
    };

    const terrain = createMinecraftTerrain();
    scene.add(terrain);

    // Add some clouds
    const createClouds = () => {
      const cloudGroup = new THREE.Group();
      const cloudMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.8 });

      for (let i = 0; i < 30; i++) {
        const cloudPart = new THREE.BoxGeometry(
          Math.random() * 15 + 10,
          Math.random() * 5 + 3,
          Math.random() * 15 + 10
        );
        const cloud = new THREE.Mesh(cloudPart, cloudMaterial);
        cloud.position.set(
          Math.random() * 800 - 400,
          Math.random() * 50 + 80,
          Math.random() * 800 - 400
        );
        cloudGroup.add(cloud);
      }

      return cloudGroup;
    };

    const clouds = createClouds();
    scene.add(clouds);

    // Flight physics variables
    const flightState = {
      velocity: new THREE.Vector3(0, 0, 0),
      pitch: 0,
      roll: 0,
      yaw: 0,
      throttle: 0.5,
      pitchRate: 0,
      rollRate: 0,
      yawRate: 0,
    };

    // Controls
    const keys: { [key: string]: boolean } = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Camera positioning (third-person view)
    const updateCamera = () => {
      const cameraDistance = 25;
      const cameraHeight = 8;

      const offset = new THREE.Vector3(0, cameraHeight, -cameraDistance);
      offset.applyQuaternion(aircraft.quaternion);

      camera.position.copy(aircraft.position).add(offset);
      camera.lookAt(aircraft.position);
    };

    // Physics and controls update
    const updateFlightPhysics = (delta: number) => {
      const maxPitchRate = 1.5;
      const maxRollRate = 2.0;
      const maxYawRate = 1.0;
      const throttleSpeed = 0.5;

      // Throttle control (Shift/Ctrl)
      if (keys['shift']) {
        flightState.throttle = Math.min(1, flightState.throttle + throttleSpeed * delta);
      }
      if (keys['control']) {
        flightState.throttle = Math.max(0, flightState.throttle - throttleSpeed * delta);
      }

      // Pitch control (W/S)
      if (keys['w']) {
        flightState.pitchRate = maxPitchRate;
      } else if (keys['s']) {
        flightState.pitchRate = -maxPitchRate;
      } else {
        flightState.pitchRate *= 0.9; // Damping
      }

      // Roll control (A/D)
      if (keys['a']) {
        flightState.rollRate = maxRollRate;
      } else if (keys['d']) {
        flightState.rollRate = -maxRollRate;
      } else {
        flightState.rollRate *= 0.9; // Damping
      }

      // Yaw control (Q/E)
      if (keys['q']) {
        flightState.yawRate = maxYawRate;
      } else if (keys['e']) {
        flightState.yawRate = -maxYawRate;
      } else {
        flightState.yawRate *= 0.9; // Damping
      }

      // Apply rotations
      flightState.pitch += flightState.pitchRate * delta;
      flightState.roll += flightState.rollRate * delta;
      flightState.yaw += flightState.yawRate * delta;

      // Keep pitch and roll within reasonable limits
      flightState.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, flightState.pitch));
      flightState.roll = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, flightState.roll));

      // Auto-level tendency (realistic flight behavior)
      flightState.pitch *= 0.98;
      flightState.roll *= 0.98;

      // Set aircraft rotation
      aircraft.rotation.set(flightState.pitch, flightState.yaw, flightState.roll);

      // Calculate forward velocity based on throttle and pitch
      const baseSpeed = 50;
      const speed = baseSpeed * flightState.throttle;

      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(aircraft.quaternion);
      forward.multiplyScalar(speed * delta);

      aircraft.position.add(forward);

      // Gravity effect
      const gravity = -15;
      const lift = speed * 0.3 * Math.cos(flightState.pitch);
      const verticalAcceleration = gravity + lift;

      flightState.velocity.y += verticalAcceleration * delta;
      aircraft.position.y += flightState.velocity.y * delta;

      // Ground collision
      if (aircraft.position.y < 5) {
        aircraft.position.y = 5;
        flightState.velocity.y = Math.max(0, flightState.velocity.y);
      }

      // Spin propeller
      propellerGroup.rotation.z += (20 + flightState.throttle * 30) * delta;

      // Keep aircraft within bounds (world wrap)
      const worldBound = 250;
      if (Math.abs(aircraft.position.x) > worldBound) {
        aircraft.position.x = -Math.sign(aircraft.position.x) * worldBound;
      }
      if (Math.abs(aircraft.position.z) > worldBound) {
        aircraft.position.z = -Math.sign(aircraft.position.z) * worldBound;
      }
    };

    // HUD
    const hudElement = document.createElement('div');
    hudElement.style.position = 'absolute';
    hudElement.style.top = '20px';
    hudElement.style.left = '20px';
    hudElement.style.color = 'white';
    hudElement.style.fontFamily = 'monospace';
    hudElement.style.fontSize = '14px';
    hudElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    hudElement.style.padding = '15px';
    hudElement.style.borderRadius = '5px';
    hudElement.style.zIndex = '1000';
    containerRef.current?.appendChild(hudElement);

    const updateHUD = () => {
      const speed = Math.sqrt(
        flightState.velocity.x ** 2 +
        flightState.velocity.y ** 2 +
        flightState.velocity.z ** 2
      );

      hudElement.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px;">FLIGHT DATA</div>
        <div>Altitude: ${Math.floor(aircraft.position.y)}m</div>
        <div>Throttle: ${Math.floor(flightState.throttle * 100)}%</div>
        <div>Pitch: ${(flightState.pitch * 57.3).toFixed(1)}°</div>
        <div>Roll: ${(flightState.roll * 57.3).toFixed(1)}°</div>
        <div>Heading: ${((flightState.yaw * 57.3) % 360).toFixed(1)}°</div>
        <div style="margin-top: 10px; border-top: 1px solid white; padding-top: 10px;">
          <div style="font-weight: bold;">CONTROLS</div>
          <div>W/S - Pitch Up/Down</div>
          <div>A/D - Roll Left/Right</div>
          <div>Q/E - Yaw Left/Right</div>
          <div>Shift/Ctrl - Throttle Up/Down</div>
        </div>
      `;
    };

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();

      updateFlightPhysics(delta);
      updateCamera();
      updateHUD();

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      if (hudElement.parentNode) {
        hudElement.parentNode.removeChild(hudElement);
      }
    };
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative'
      }}
    />
  );
}
