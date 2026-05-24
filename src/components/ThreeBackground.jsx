import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground({ visible = true }) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: false });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a1a, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 20, 160);

    // Stars
    const starCount = 2500;
    const starGeo = new THREE.BufferGeometry();
    const starPos = [];
    for (let i = 0; i < starCount; i++) {
      starPos.push((Math.random() - 0.5) * 800);
      starPos.push((Math.random() - 0.5) * 500);
      starPos.push((Math.random() - 0.5) * 300 - 100);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starPos), 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.28, transparent: true, opacity: 0.7 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Orbs
    const orbCount = 600;
    const orbGeo = new THREE.BufferGeometry();
    const orbPositions = [];
    for (let i = 0; i < orbCount; i++) {
      orbPositions.push((Math.random() - 0.5) * 420, (Math.random() - 0.5) * 280, (Math.random() - 0.5) * 180);
    }
    orbGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(orbPositions), 3));
    const orbMat = new THREE.PointsMaterial({ color: 0xf5c842, size: 0.55, transparent: true, opacity: 0.45 });
    const orbs = new THREE.Points(orbGeo, orbMat);
    scene.add(orbs);

    // Fog & lights
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.0006);
    const ambientLight = new THREE.AmbientLight(0x224466);
    const pointLight1 = new THREE.PointLight(0x00d4c8, 0.9);
    pointLight1.position.set(40, 60, 50);
    const pointLight2 = new THREE.PointLight(0xf5c842, 0.7);
    pointLight2.position.set(-50, 30, 70);
    scene.add(ambientLight, pointLight1, pointLight2);

    let time = 0;
    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.008;
      stars.rotation.y += 0.0003;
      stars.rotation.x += 0.0002;
      orbs.rotation.y -= 0.0006;
      orbs.rotation.x += 0.0004;
      camera.position.z = 160 + Math.sin(time * 0.3) * 4;
      camera.lookAt(0, 15, 0);
      renderer.render(scene, camera);
    }
    animate();

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="bg-canvas"
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none',
        transition: 'opacity 0.6s ease',
        opacity: visible ? 1 : 0,
      }}
    />
  );
}
