import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import "./Farm3D.css";

interface Farm3DProps {
  fields: Array<{
    name: string;
    width: number;
    length: number;
    crop?: string;
    soilType?: string;
  }>;
}

export const Farm3D: React.FC<Farm3DProps> = ({ fields }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1a0a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x1a4d2e });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Add fields
    fields.forEach((field, index) => {
      const scale = 0.5;
      const fieldX = (index % 2 - 0.5) * 5;
      const fieldZ = Math.floor(index / 2) * 5 - 5;
      
      const fieldGeometry = new THREE.PlaneGeometry(
        field.width * scale,
        field.length * scale
      );
      const fieldMaterial = new THREE.MeshStandardMaterial({
        color: field.crop ? 0x228b22 : 0x8b7355,
        transparent: true,
        opacity: 0.8
      });
      const fieldMesh = new THREE.Mesh(fieldGeometry, fieldMaterial);
      fieldMesh.rotation.x = -Math.PI / 2;
      fieldMesh.position.set(fieldX, 0.01, fieldZ);
      scene.add(fieldMesh);

      // Add 3D crop models if crop is selected
      if (field.crop) {
        const cropName = field.crop.toLowerCase();
        
        if (cropName.includes("corn") || cropName.includes("maize")) {
          // Create corn plant model (simplified)
          const cornGroup = new THREE.Group();
          
          // Stalk (green cylinder)
          const stalkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 2, 8);
          const stalkMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5016 });
          const stalk = new THREE.Mesh(stalkGeometry, stalkMaterial);
          stalk.position.y = 1;
          cornGroup.add(stalk);
          
          // Leaves (green planes)
          for (let i = 0; i < 6; i++) {
            const leafGeometry = new THREE.PlaneGeometry(0.8, 0.3);
            const leafMaterial = new THREE.MeshStandardMaterial({ 
              color: 0x4a7c2a,
              side: THREE.DoubleSide
            });
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            leaf.position.y = 0.3 + i * 0.3;
            leaf.rotation.z = (Math.PI / 6) * (i % 2 === 0 ? 1 : -1);
            leaf.position.x = (i % 2 === 0 ? 0.2 : -0.2);
            cornGroup.add(leaf);
          }
          
          // Ear (yellow cylinder at top)
          const earGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8);
          const earMaterial = new THREE.MeshStandardMaterial({ color: 0xd4af37 });
          const ear = new THREE.Mesh(earGeometry, earMaterial);
          ear.position.y = 1.8;
          cornGroup.add(ear);
          
          cornGroup.position.set(fieldX, 0, fieldZ);
          scene.add(cornGroup);
        } else if (cropName.includes("wheat")) {
          // Create wheat plant model (simplified)
          const wheatGroup = new THREE.Group();
          
          // Stalk (thin green cylinder)
          const stalkGeometry = new THREE.CylinderGeometry(0.05, 0.08, 1.2, 6);
          const stalkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a7c2a });
          const stalk = new THREE.Mesh(stalkGeometry, stalkMaterial);
          stalk.position.y = 0.6;
          wheatGroup.add(stalk);
          
          // Wheat head (golden sphere with spikes)
          const headGeometry = new THREE.SphereGeometry(0.15, 8, 8);
          const headMaterial = new THREE.MeshStandardMaterial({ color: 0xd4af37 });
          const head = new THREE.Mesh(headGeometry, headMaterial);
          head.position.y = 1.3;
          wheatGroup.add(head);
          
          // Spikes (golden cylinders)
          for (let i = 0; i < 8; i++) {
            const spikeGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.2, 4);
            const spikeMaterial = new THREE.MeshStandardMaterial({ color: 0xc9a961 });
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.y = 1.4;
            spike.rotation.z = (Math.PI * 2 / 8) * i;
            spike.position.x = Math.cos((Math.PI * 2 / 8) * i) * 0.12;
            spike.position.z = Math.sin((Math.PI * 2 / 8) * i) * 0.12;
            wheatGroup.add(spike);
          }
          
          // Add multiple wheat plants in a grid pattern
          for (let x = -1; x <= 1; x++) {
            for (let z = -1; z <= 1; z++) {
              const plantClone = wheatGroup.clone();
              plantClone.position.set(
                fieldX + x * 0.5,
                0,
                fieldZ + z * 0.5
              );
              scene.add(plantClone);
            }
          }
        }
      }

      // Add label (simple text representation)
      const labelGeometry = new THREE.PlaneGeometry(2, 0.5);
      const labelMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7
      });
      const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
      labelMesh.rotation.x = -Math.PI / 2;
      labelMesh.position.set(fieldX, 0.02, fieldZ);
      scene.add(labelMesh);
    });

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Add camera controls (simple orbit)
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (cameraRef.current) {
        cameraRef.current.position.x = Math.sin(mouseX * Math.PI) * 15;
        cameraRef.current.position.z = Math.cos(mouseX * Math.PI) * 15;
        cameraRef.current.position.y = 10 + mouseY * 5;
        cameraRef.current.lookAt(0, 0, 0);
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      // Clean up scene
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [fields]);

  return <div ref={containerRef} className="farm-3d-container" />;
};
