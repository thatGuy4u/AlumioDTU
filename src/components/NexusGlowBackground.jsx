import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Ascending Particles Background — Sky-Blue / Midnight Black Theme
 * Fixed-position so it covers the entire landing page behind all sections.
 */
export default function FloatingParticlesBackground({ 
  visible = true, 
  particleOpacity = 0.055
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let animId = 0;
    let W = mount.clientWidth || window.innerWidth;
    let H = mount.clientHeight || window.innerHeight;

    // 1. Scene Setup — Deep midnight blue-black
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020a18);
    scene.fog = new THREE.Fog(0x020a18, 500, 1800);

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

    // 4. Lighting — cool sky-blue hemisphere
    const light = new THREE.HemisphereLight(0x38bdf8, 0x0c2d4a, 1.2);
    light.position.set(
      Math.cos(camRad1) * Math.cos(camRad2) * 1000,
      Math.sin(camRad1) * 1000,
      Math.cos(camRad1) * Math.sin(camRad2) * 1000
    );
    scene.add(light);

    // 5. Particle System Setup — 3 layers for depth
    const layerCount = 20000;

    const createLayer = (count) => {
      const positions = new Float32Array(count * 3);
      const velocities = new Float32Array(count);
      return { positions, velocities, count };
    };

    const layer1 = createLayer(layerCount);       // Sky blue — primary
    const layer2 = createLayer(layerCount);       // Ice blue — secondary  
    const layer3 = createLayer(layerCount / 2);   // Warm white — accent sparkles

    const resetParticle = (positions, velocities, index, initialSpawn = false) => {
      const range = (1 - Math.log(THREE.MathUtils.randInt(2, 256)) / Math.log(256)) * 550;
      const rad = THREE.MathUtils.degToRad(THREE.MathUtils.randInt(0, 360));
      
      const x = Math.cos(rad) * range;
      const z = Math.sin(rad) * range;
      const y = initialSpawn ? THREE.MathUtils.randFloat(-350, 550) : -350;

      positions[index * 3] = x;
      positions[index * 3 + 1] = y;
      positions[index * 3 + 2] = z;

      const mass = THREE.MathUtils.randInt(300, 500) / 100;
      velocities[index] = 5 / mass; 
    };

    // Initialize all layers
    const initLayer = (layer) => {
      for (let i = 0; i < layer.count; i++) {
        resetParticle(layer.positions, layer.velocities, i, true);
      }
    };
    initLayer(layer1);
    initLayer(layer2);
    initLayer(layer3);

    // Layer 1 — Sky Blue particles
    const geo1 = new THREE.BufferGeometry();
    geo1.setAttribute('position', new THREE.BufferAttribute(layer1.positions, 3));
    const mat1 = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 5,
      transparent: true,
      opacity: particleOpacity,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const points1 = new THREE.Points(geo1, mat1);
    scene.add(points1);

    // Layer 2 — Ice Blue particles
    const geo2 = new THREE.BufferGeometry();
    geo2.setAttribute('position', new THREE.BufferAttribute(layer2.positions, 3));
    const mat2 = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 4,
      transparent: true,
      opacity: particleOpacity * 0.8,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const points2 = new THREE.Points(geo2, mat2);
    scene.add(points2);

    // Layer 3 — Warm White accent sparkles (smaller, dimmer, adds depth)
    const geo3 = new THREE.BufferGeometry();
    geo3.setAttribute('position', new THREE.BufferAttribute(layer3.positions, 3));
    const mat3 = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 3,
      transparent: true,
      opacity: particleOpacity * 0.5,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const points3 = new THREE.Points(geo3, mat3);
    scene.add(points3);

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
    const updateParticles = (pointsMesh, layer) => {
      const positions = pointsMesh.geometry.attributes.position.array;
      for (let i = 0; i < layer.count; i++) {
        positions[i * 3 + 1] += layer.velocities[i];
        if (positions[i * 3 + 1] > 550) {
          resetParticle(positions, layer.velocities, i, false);
        }
      }
      pointsMesh.geometry.attributes.position.needsUpdate = true;
    };

    // 8. Animation Loop
    const animate = () => {
      animId = requestAnimationFrame(animate);

      camRad2 += 0.15 * (Math.PI / 180);
      camera.position.set(
        Math.cos(camRad1) * Math.cos(camRad2) * camRange,
        Math.sin(camRad1) * camRange,
        Math.cos(camRad1) * Math.sin(camRad2) * camRange
      );
      camera.lookAt(0, 0, 0);

      updateParticles(points1, layer1);
      updateParticles(points2, layer2);
      updateParticles(points3, layer3);

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
      geo3.dispose();
      mat3.dispose();
      renderer.dispose();
      
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [particleOpacity]);

  return (
    <div
      ref={mountRef}
      className="floating-particles-bg"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: visible ? 1 : 0,
        pointerEvents: 'none', 
        zIndex: 0,
        transition: 'opacity 0.5s ease',
      }}
    />
  );
}