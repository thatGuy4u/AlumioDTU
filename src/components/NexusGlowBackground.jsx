import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Ascending Particles Background — React & Modern Three.js
 */
export default function FloatingParticlesBackground({ 
  visible = true, 
  particleOpacity = 0.035 // <-- Added this prop so you can easily tweak the brightness
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let animId = 0;
    let W = mount.clientWidth || window.innerWidth;
    let H = mount.clientHeight || window.innerHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    scene.fog = new THREE.Fog(0x000000, 800, 1600);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(35, W / H, 1, 10000);
    const camRange = 700;
    const camRad1 = 60 * (Math.PI / 180); 
    let camRad2 = 30 * (Math.PI / 180);   

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    mount.appendChild(renderer.domElement);

    // 4. Lighting
    const light = new THREE.HemisphereLight(0x77ffaa, 0x77ffaa, 1);
    light.position.set(
      Math.cos(camRad1) * Math.cos(camRad2) * 1000,
      Math.sin(camRad1) * 1000,
      Math.cos(camRad1) * Math.sin(camRad2) * 1000
    );
    scene.add(light);

    // 5. Particle System Setup
    const particleCount = 50000;
    const halfCount = particleCount / 2;

    const pos1 = new Float32Array(halfCount * 3);
    const pos2 = new Float32Array(halfCount * 3);
    const velocities1 = new Float32Array(halfCount);
    const velocities2 = new Float32Array(halfCount);

    const resetParticle = (positions, velocities, index, initialSpawn = false) => {
      const range = (1 - Math.log(THREE.MathUtils.randInt(2, 256)) / Math.log(256)) * 500;
      const rad = THREE.MathUtils.degToRad(THREE.MathUtils.randInt(0, 360));
      
      const x = Math.cos(rad) * range;
      const z = Math.sin(rad) * range;
      const y = initialSpawn ? THREE.MathUtils.randFloat(-300, 500) : -300;

      positions[index * 3] = x;
      positions[index * 3 + 1] = y;
      positions[index * 3 + 2] = z;

      const mass = THREE.MathUtils.randInt(300, 500) / 100;
      velocities[index] = 5 / mass; 
    };

    for (let i = 0; i < halfCount; i++) {
      resetParticle(pos1, velocities1, i, true);
      resetParticle(pos2, velocities2, i, true);
    }

    // Cyan Particles
    const geo1 = new THREE.BufferGeometry();
    geo1.setAttribute('position', new THREE.BufferAttribute(pos1, 3));
    const mat1 = new THREE.PointsMaterial({
      color: 0x77ffaa,
      size: 6,
      transparent: true,
      opacity: particleOpacity, // <-- Using the new prop here
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const points1 = new THREE.Points(geo1, mat1);
    scene.add(points1);

    // Blue Particles
    const geo2 = new THREE.BufferGeometry();
    geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
    const mat2 = new THREE.PointsMaterial({
      color: 0x77aaff,
      size: 6,
      transparent: true,
      opacity: particleOpacity, // <-- Using the new prop here
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const points2 = new THREE.Points(geo2, mat2);
    scene.add(points2);

    // 6. Resize Handler
    const onResize = () => {
      W = mount.clientWidth || window.innerWidth;
      H = mount.clientHeight || window.innerHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener('resize', onResize);

    // 7. Update Loop Logic
    const updateParticles = (pointsMesh, velocities) => {
      const positions = pointsMesh.geometry.attributes.position.array;
      for (let i = 0; i < halfCount; i++) {
        positions[i * 3 + 1] += velocities[i];
        if (positions[i * 3 + 1] > 500) {
          resetParticle(positions, velocities, i, false);
        }
      }
      pointsMesh.geometry.attributes.position.needsUpdate = true;
    };

    // 8. Animation Loop
    const animate = () => {
      animId = requestAnimationFrame(animate);

      camRad2 += 0.2 * (Math.PI / 180);
      camera.position.set(
        Math.cos(camRad1) * Math.cos(camRad2) * camRange,
        Math.sin(camRad1) * camRange,
        Math.cos(camRad1) * Math.sin(camRad2) * camRange
      );
      camera.lookAt(0, 0, 0);

      updateParticles(points1, velocities1);
      updateParticles(points2, velocities2);

      renderer.render(scene, camera);
    };
    
    animate();

    // 9. Cleanup Phase
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      
      geo1.dispose();
      mat1.dispose();
      geo2.dispose();
      mat2.dispose();
      renderer.dispose();
      
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [particleOpacity]); // <-- Added dependency here so it updates if you change the prop

  return (
    <div
      ref={mountRef}
      className="floating-particles-bg"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: visible ? 1 : 0,
        pointerEvents: 'none', 
        zIndex: -1,
        transition: 'opacity 0.5s ease',
      }}
    />
  );
}