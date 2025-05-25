
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Effects } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import Scene3D from './Scene3D';

export default function Canvas3D() {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
      >
        {/* Environment and effects */}
        <Environment preset="night" />
        
        {/* Scene content */}
        <Scene3D />
        
        {/* Camera controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          autoRotate
          autoRotateSpeed={0.5}
          minDistance={5}
          maxDistance={15}
        />
        
        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.025}
          />
        </EffectComposer>
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-8 left-8 text-white z-10">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          3D Web Experience
        </h1>
        <p className="text-lg opacity-80">Drag to rotate • Scroll to zoom</p>
      </div>
      
      {/* Controls info */}
      <div className="absolute bottom-8 right-8 text-white text-sm opacity-60 z-10">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
          <p>🖱️ Mouse: Rotate view</p>
          <p>🔄 Auto-rotation enabled</p>
          <p>⚡ Real-time 3D animations</p>
        </div>
      </div>
    </div>
  );
}
