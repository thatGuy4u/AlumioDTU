import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function DashboardBackground({ visible = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0d1540, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 100);

    const gridHelper = new THREE.GridHelper(400, 30, 0x00d4c8, 0x334466);
    gridHelper.position.y = -30;
    scene.add(gridHelper);

    const ambientDash = new THREE.AmbientLight(0x335588);
    scene.add(ambientDash);

    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      camera.position.z = 100 + Math.sin(Date.now() * 0.0003) * 2;
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
      id="bg-canvas-dashboard"
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none',
        transition: 'opacity 0.8s ease',
        opacity: visible ? 1 : 0,
      }}
    />
  );
}
