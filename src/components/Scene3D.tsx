
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

// Simple animated cube
function AnimatedCube({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ff6b6b" />
    </mesh>
  );
}

// Simple animated sphere
function AnimatedSphere({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.4;
      meshRef.current.rotation.z += delta * 0.2;
      meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * 0.5) * 0.8;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshStandardMaterial color="#4ecdc4" />
    </mesh>
  );
}

// Basic lighting
function BasicLights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[3, 3, 3]}
        intensity={1.5}
        castShadow
      />
      <pointLight position={[-3, -3, -3]} color="#ff6b6b" intensity={0.8} />
      <pointLight position={[3, -3, 3]} color="#4ecdc4" intensity={0.8} />
    </>
  );
}

// Main scene component
export default function Scene3D() {
  return (
    <>
      <BasicLights />
      
      {/* Simple animated objects */}
      <AnimatedCube position={[-2, 0, 0]} />
      <AnimatedSphere position={[2, 1, -2]} />
      <AnimatedCube position={[3, 2, 1]} />
      <AnimatedSphere position={[-3, -2, -1]} />
      
      {/* Simple 3D Text */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Text
          position={[0, 3, 0]}
          fontSize={1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          3D WEB
        </Text>
      </Float>
      
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
        <Text
          position={[0, 2, 0]}
          fontSize={0.5}
          color="#a8e6cf"
          anchorX="center"
          anchorY="middle"
        >
          EXPERIENCE
        </Text>
      </Float>
    </>
  );
}
