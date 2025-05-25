
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Text, Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, Box, Torus } from '@react-three/drei';
import * as THREE from 'three';

// Animated floating cube
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
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Box ref={meshRef} position={position} args={[1, 1, 1]}>
        <MeshWobbleMaterial factor={0.6} speed={2} color="#ff6b6b" />
      </Box>
    </Float>
  );
}

// Animated sphere with distortion
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
    <Float speed={1.5} rotationIntensity={2} floatIntensity={1}>
      <Sphere ref={meshRef} position={position} args={[0.8, 32, 32]}>
        <MeshDistortMaterial distort={0.3} speed={2} color="#4ecdc4" />
      </Sphere>
    </Float>
  );
}

// Animated torus
function AnimatedTorus({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.6;
      meshRef.current.rotation.z += delta * 0.4;
      meshRef.current.position.z = position[2] + Math.sin(state.clock.elapsedTime * 0.8) * 0.6;
    }
  });

  return (
    <Float speed={3} rotationIntensity={1.5} floatIntensity={3}>
      <Torus ref={meshRef} position={position} args={[1, 0.4, 16, 100]}>
        <MeshWobbleMaterial factor={0.8} speed={1.5} color="#a8e6cf" />
      </Torus>
    </Float>
  );
}

// Particle system
function Particles() {
  const points = useRef<THREE.Points>(null);
  const particlesCount = 500;
  
  const positions = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 20;
  }

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.x = state.clock.elapsedTime * 0.05;
      points.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.02} sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

// Dynamic lighting
function DynamicLights() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(state.clock.elapsedTime) * 3;
      lightRef.current.position.z = Math.cos(state.clock.elapsedTime) * 3;
      lightRef.current.color.setHSL((state.clock.elapsedTime * 0.1) % 1, 0.8, 0.6);
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        ref={lightRef}
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
      <DynamicLights />
      <Particles />
      
      {/* Animated objects */}
      <AnimatedCube position={[-2, 0, 0]} />
      <AnimatedSphere position={[2, 1, -2]} />
      <AnimatedTorus position={[0, -1, 2]} />
      <AnimatedCube position={[3, 2, 1]} />
      <AnimatedSphere position={[-3, -2, -1]} />
      
      {/* 3D Text */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Text
          position={[0, 3, 0]}
          fontSize={1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/helvetiker_regular.typeface.json"
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
          font="/fonts/helvetiker_regular.typeface.json"
        >
          EXPERIENCE
        </Text>
      </Float>
    </>
  );
}
