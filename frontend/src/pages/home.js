import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// Custom Starfield component for parallax movement (Unchanged)
function ParallaxStars({ count = 5000, speed = 0.0001, factor = 5, color = '#f8f8f8', zDepth = 0 }) {
  const meshRef = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2000; pos[i * 3 + 1] = (Math.random() - 0.5) * 2000; pos[i * 3 + 2] = (Math.random() - 0.5) * 50 - 50 + zDepth;
    }
    return pos;
  }, [count, zDepth]);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.x += speed * delta * 60; meshRef.current.position.y += speed * delta * 60 * 0.5;
      if (meshRef.current.position.x > 1000) meshRef.current.position.x = -1000; if (meshRef.current.position.y > 1000) meshRef.current.position.y = -1000;
    }
  });
  return (
    <points ref={meshRef}>
      <bufferGeometry><bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} /></bufferGeometry>
      <pointsMaterial size={factor} color={color} sizeAttenuation={false} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </points>
  );
}

// This component represents a single celestial object. (Unchanged)
function CelestialObject({ object }) {
  return (
    <mesh position={[object.x, object.y, 0]}>
      <circleGeometry args={[object.radius, 32]} />
      <meshStandardMaterial color={object.color} emissive={object.locked ? 'orange' : object.color} emissiveIntensity={object.locked ? 2.5 : 1.5} toneMapped={false}/>
    </mesh>
  );
}

// A performant component to render all particles. (Unchanged)
function Particles({ particles }) {
  const meshRef = useRef();
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const maxParticles = 5000;
  useFrame(() => {
    if (!meshRef.current || !particles || particles.length === 0) return;
    const instanceCount = Math.min(particles.length, maxParticles);
    for (let i = 0; i < instanceCount; i++) {
      const p = particles[i];
      tempObject.position.set(p.x, p.y, 0); const scale = p.radius * (p.life / 60); tempObject.scale.set(scale, scale, scale); tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    for (let i = instanceCount; i < maxParticles; i++) {
      tempObject.scale.set(0, 0, 0); tempObject.updateMatrix(); meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={meshRef} args={[null, null, maxParticles]}>
      <circleGeometry args={[5, 16]} />
      <meshBasicMaterial color="#f8f8f8" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false}/>
    </instancedMesh>
  );
}

// This component contains the main simulation logic.
function Scene({ isPaused, objects, setObjects, particles, setParticles }) {
  const distPower = 2; const radiusPower = 3; const gravityLimiter = 4;

  useFrame((state, delta) => {
    if (isPaused || !objects) return;

    const timeScale = delta * 60;

    setObjects(currentObjects => {
      // Get a list of all objects that can exert gravity.
      const activeGravitationalObjects = currentObjects.filter(o => o.active);

      // Map over the current state to produce the next state.
      const updatedObjects = currentObjects.map(obj => {
        // If the object is inactive, locked, or held, it shouldn't move. Return it as is.
        if (!obj.active || obj.locked || obj.held) {
          return obj;
        }

        // This object is active and can move. Calculate forces on it.
        let nextStep = { x: 0, y: 0 };
        activeGravitationalObjects.forEach(otherObj => {
          if (obj === otherObj) return;
          const dist = Math.hypot(otherObj.x - obj.x, otherObj.y - obj.y);
          const forceX = (otherObj.x - obj.x) / Math.pow(Math.max((obj.radius + otherObj.radius) / 4, dist), distPower) * Math.pow(otherObj.radius, radiusPower) / Math.pow(10, gravityLimiter);
          const forceY = (otherObj.y - obj.y) / Math.pow(Math.max((obj.radius + otherObj.radius) / 4, dist), distPower) * Math.pow(otherObj.radius, radiusPower) / Math.pow(10, gravityLimiter);
          nextStep.x += forceX;
          nextStep.y += forceY;
        });

        // Return a new object with updated physics.
        const newXv = obj.xv + nextStep.x * timeScale;
        const newYv = obj.yv + nextStep.y * timeScale;
        const newX = obj.x + newXv * timeScale;
        const newY = obj.y + newYv * timeScale;

        return { ...obj, xv: newXv, yv: newYv, x: newX, y: newY };
      });
      return updatedObjects;
    });

    setParticles(currentParticles => {
      const updatedParticles = currentParticles.filter(p => p.life > 0);
      updatedParticles.forEach(p => { p.x += p.xv * timeScale; p.y += p.yv * timeScale; p.life--; });
      if (objects) {
        objects.forEach(obj => {
          if (obj.active && !obj.locked && !obj.held && Math.hypot(obj.xv, obj.yv) > 0.5) {
            for (let i = 0; i < 4; i++) {
              const angle = Math.random() * Math.PI * 2; const offsetRadius = Math.random() * obj.radius;
              updatedParticles.push({ id: Math.random(), x: obj.x + Math.cos(angle) * offsetRadius, y: obj.y + Math.sin(angle) * offsetRadius, xv: -obj.xv * 0.2 + (Math.random() - 0.5) * 0.5, yv: -obj.yv * 0.2 + (Math.random() - 0.5) * 0.5, life: 60, radius: Math.random() * 4 + 3, });
            }
          }
        });
      }
      return updatedParticles;
    });
  });

  return (
    <>
      {objects && objects.map((obj) => (<CelestialObject key={obj.id} object={obj} />))}
      {particles.length > 0 && <Particles particles={particles} />}
      {isPaused && objects && objects.map(obj =>
          !obj.locked && (obj.xv !== 0 || obj.yv !== 0) && (
            <Line key={`line-${obj.id}`} points={[[obj.x, obj.y, 1], [obj.x + obj.xv * 10, obj.y + obj.yv * 10, 1]]} color="red" lineWidth={2} />
          )
      )}
    </>
  );
}

// This is the main component that holds the UI and the Canvas.
export default function Home() {
  const [isPaused, setPaused] = useState(false);
  const [objects, setObjects] = useState(null);
  const [particles, setParticles] = useState([]);
  const containerRef = useRef(null);
  const creatingInfo = useRef({});

  useEffect(() => {
    if (containerRef.current && objects === null) {
      setObjects([
        { id: 1, x: 0, y: 0, xv: 0, yv: 0, radius: 100, color: "#f8f8f8", locked: true, active: true },
        { id: 2, x: -300, y: 0, xv: 0, yv: -10, radius: 25, color: "#f8f8f8", locked: false, active: true },
        { id: 3, x: 300, y: 0, xv: 0, yv: 10, radius: 25, color: "#f8f8f8", locked: false, active: true },
      ]);
    }
  }, []);

  const getMouseWorldPos = (event) => {
    const { top, left, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - left) / width) * 2 - 1; const y = -((event.clientY - top) / height) * 2 + 1; const vec = new THREE.Vector3(x, y, 0); vec.x *= width / 2; vec.y *= height / 2; return { x: vec.x, y: vec.y };
  };

  const clearScene = () => { setObjects([]); setParticles([]); };

  const handleMouseDown = (event) => {
    event.preventDefault(); if (!objects) return;
    const pos = getMouseWorldPos(event);
    const clickedObject = [...objects].reverse().find(obj => Math.hypot(obj.x - pos.x, obj.y - pos.y) < obj.radius);

    if (event.button === 0) {
      if (clickedObject) {
        creatingInfo.current = { isHolding: true, heldObject: clickedObject, moved: false };
        setObjects(prev => prev.map(o => o.id === clickedObject.id ? { ...o, held: true } : o));
      } else {
        // FIX: Create new objects as inactive
        const newObject = { id: Date.now(), x: pos.x, y: pos.y, xv: 0, yv: 0, radius: 0, color: "#f8f8f8", locked: false, active: false };
        creatingInfo.current = { isCreating: true, startPos: pos, newObject };
        setObjects(prev => [...prev, newObject]);
      }
    } else if (event.button === 2) {
      if (clickedObject) {
        creatingInfo.current = { isRightClickAction: true, heldObject: clickedObject, moved: false };
      }
    }
  };

  const handleMouseMove = (event) => {
    if (!objects) return; const pos = getMouseWorldPos(event);
    if (creatingInfo.current.isHolding) {
      creatingInfo.current.moved = true;
      setObjects(prev => prev.map(o => o.id === creatingInfo.current.heldObject.id ? { ...o, x: pos.x, y: pos.y } : o));
    } else if (creatingInfo.current.isCreating) {
      creatingInfo.current.moved = true;
      const newRadius = Math.hypot(pos.x - creatingInfo.current.startPos.x, pos.y - creatingInfo.current.startPos.y);
      setObjects(prev => prev.map(o => o.id === creatingInfo.current.newObject.id ? { ...o, radius: newRadius } : o));
    } else if (creatingInfo.current.isRightClickAction) {
      creatingInfo.current.moved = true;
      if (isPaused) {
        const { heldObject } = creatingInfo.current;
        const newVelX = (pos.x - heldObject.x) / 10;
        const newVelY = (pos.y - heldObject.y) / 10;
        setObjects(prev => prev.map(o => o.id === heldObject.id ? { ...o, xv: newVelX, yv: newVelY } : o));
      }
    }
  };

  const handleMouseUp = (event) => {
    if (event.button === 0) {
      if (creatingInfo.current.isHolding) {
        const { heldObject, moved } = creatingInfo.current;
        if (!moved) { setObjects(prev => prev.filter(o => o.id !== heldObject.id)); }
        else { setObjects(prev => prev.map(o => o.id === heldObject.id ? { ...o, held: false } : o)); }
      } else if (creatingInfo.current.isCreating) {
        const { newObject } = creatingInfo.current;
        // FIX: Activate the object on mouse up if it's valid
        setObjects(prev => {
          const finalObject = prev.find(o => o.id === newObject.id);
          if (finalObject && finalObject.radius < 5) {
            return prev.filter(o => o.id !== newObject.id);
          }
          return prev.map(o => o.id === newObject.id ? { ...o, active: true } : o);
        });
      }
    } else if (event.button === 2) {
      if (creatingInfo.current.isRightClickAction && !creatingInfo.current.moved) {
        const { heldObject } = creatingInfo.current;
        setObjects(prev => prev.map(o => o.id === heldObject.id ? { ...o, locked: !o.locked } : o));
      }
    }
    creatingInfo.current = {};
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: "flex", flexWrap: 'wrap', gap: "10px", margin: "5px", padding: '5px', background: 'rgba(0,0,0,0.5)', color: 'white' }}>
        <button onClick={clearScene}>Clear</button>
        <button onClick={() => setPaused(!isPaused)}>{isPaused ? "Unfreeze" : "Freeze"}</button>
        <button onClick={() => { if (objects) { setObjects(prev => prev.map(obj => ({ ...obj, xv: obj.xv / 10, yv: obj.yv / 10 }))); } }}>Slow /10</button>
      </div>
      <div ref={containerRef} style={{ width: "100%", height: "100%", backgroundColor: "#282828", touchAction: 'none' }} onPointerDown={handleMouseDown} onPointerMove={handleMouseMove} onPointerUp={handleMouseUp} onContextMenu={(e) => e.preventDefault()}>
        <Canvas orthographic camera={{ zoom: 1 }}>
          <color attach="background" args={['#282828']} />
          <Suspense fallback={null}>
            {objects && <Scene isPaused={isPaused} objects={objects} setObjects={setObjects} particles={particles} setParticles={setParticles} />}
            <ParallaxStars count={3000} speed={0.01} factor={1.5} zDepth={-20} />
            <ParallaxStars count={2000} speed={0.03} factor={2.5} zDepth={-10} />
            <ParallaxStars count={1000} speed={0.05} factor={3.5} zDepth={-0} />
            <EffectComposer>
              <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.025} height={400} intensity={2.5} mipmapBlur={true} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}