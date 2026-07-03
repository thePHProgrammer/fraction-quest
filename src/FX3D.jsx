import { Component, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Sparkles, Float } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════
   WEBGL 3-D FX LAYER  (three.js / react-three-fiber)
   – Scene3D : themed animated space background
   – Hammy3D : real 3-D modeled hamster hero
═══════════════════════════════════════════════════ */

const THEMES = {
  cosmic:   { bg: "#0d0221", a: "#a78bfa", b: "#ff6b9d", c: "#ffd93d", planet: "#4c1d95", intensity: 1 },
  map:      { bg: "#0a0630", a: "#818cf8", b: "#22d3ee", c: "#ffd93d", planet: "#1e1b4b", intensity: 0.9 },
  proper:   { bg: "#01130d", a: "#34d399", b: "#a3e635", c: "#fbbf24", planet: "#064e3b", intensity: 0.9 },
  improper: { bg: "#170401", a: "#fb923c", b: "#ef4444", c: "#fde047", planet: "#7c2d12", intensity: 1.1 },
  mixed:    { bg: "#0e0323", a: "#a78bfa", b: "#e879f9", c: "#38bdf8", planet: "#4c1d95", intensity: 1 },
  add:      { bg: "#020d1c", a: "#38bdf8", b: "#818cf8", c: "#facc15", planet: "#0c4a6e", intensity: 1 },
  sub:      { bg: "#01141a", a: "#2dd4bf", b: "#22d3ee", c: "#60a5fa", planet: "#134e4a", intensity: 0.9 },
  boss:     { bg: "#160101", a: "#f87171", b: "#fbbf24", c: "#ff6b9d", planet: "#450a0a", intensity: 1.5 },
  win:      { bg: "#120a01", a: "#ffd93d", b: "#ff9f43", c: "#ff6b9d", planet: "#713f12", intensity: 1.3 },
  gameover: { bg: "#0e0103", a: "#7f1d1d", b: "#dc2626", c: "#f87171", planet: "#27060a", intensity: 0.6 },
};

let webglOk = null;
function supportsWebGL() {
  if (webglOk !== null) return webglOk;
  try {
    const c = document.createElement("canvas");
    webglOk = !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (_) { webglOk = false; }
  return webglOk;
}

class FXBoundary extends Component {
  constructor(p) { super(p); this.state = { dead: false }; }
  static getDerivedStateFromError() { return { dead: true }; }
  componentDidCatch() {}
  render() { return this.state.dead ? null : this.props.children; }
}

/* ─── camera drifts toward the pointer for parallax depth ─── */
function ParallaxRig({ strength = 1.4 }) {
  const { camera, pointer } = useThree();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    camera.position.x += (pointer.x * strength - camera.position.x) * 0.04;
    camera.position.y += (-pointer.y * strength * 0.7 + Math.sin(t * 0.28) * 0.35 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, -8);
  });
  return null;
}

const CRYSTAL_GEOS = [
  new THREE.OctahedronGeometry(1, 0),
  new THREE.IcosahedronGeometry(1, 0),
  new THREE.DodecahedronGeometry(1, 0),
  new THREE.TetrahedronGeometry(1, 0),
  new THREE.TorusKnotGeometry(0.7, 0.24, 64, 10, 2, 3),
];

function Crystal({ geoIdx, pos, scale, color, speed, emissive }) {
  const ref = useRef();
  const seed = useMemo(() => Math.random() * 100, []);
  useFrame((state) => {
    const t = state.clock.elapsedTime + seed;
    ref.current.rotation.x = t * 0.3 * speed;
    ref.current.rotation.y = t * 0.45 * speed;
  });
  return (
    <Float speed={speed * 1.6} rotationIntensity={0.4} floatIntensity={1.6}>
      <mesh ref={ref} position={pos} scale={scale} geometry={CRYSTAL_GEOS[geoIdx]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissive} roughness={0.15} metalness={0.7} flatShading />
      </mesh>
    </Float>
  );
}

function CrystalField({ theme, count }) {
  const items = useMemo(() => {
    const cols = [theme.a, theme.b, theme.c];
    return Array.from({ length: count }, (_, i) => ({
      geoIdx: Math.floor(Math.random() * CRYSTAL_GEOS.length),
      pos: [
        (Math.random() - 0.5) * 26,
        (Math.random() - 0.5) * 15,
        -7 - Math.random() * 19,
      ],
      scale: 0.35 + Math.random() * 0.95,
      color: cols[i % 3],
      speed: 0.4 + Math.random() * 1.1,
      emissive: 0.5 + Math.random() * 0.9,
    }));
  }, [theme, count]);
  return items.map((c, i) => <Crystal key={i} {...c} />);
}

/* ─── big glowing planet with orbiting ring + wireframe shell ─── */
function Planet({ theme }) {
  const grp = useRef();
  const wire = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    grp.current.rotation.y = t * 0.06;
    wire.current.rotation.y = -t * 0.1;
    wire.current.rotation.z = t * 0.05;
  });
  return (
    <group position={[7.5, 3.2, -20]}>
      <group ref={grp}>
        <mesh>
          <icosahedronGeometry args={[4, 1]} />
          <meshStandardMaterial color={theme.planet} emissive={theme.a} emissiveIntensity={0.22} roughness={0.4} metalness={0.5} flatShading />
        </mesh>
        <mesh rotation={[Math.PI / 2.6, 0.4, 0]}>
          <torusGeometry args={[6, 0.09, 8, 90]} />
          <meshStandardMaterial color={theme.c} emissive={theme.c} emissiveIntensity={1.4} roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh rotation={[Math.PI / 2.6, 0.4, 0]}>
          <torusGeometry args={[6.7, 0.045, 8, 90]} />
          <meshStandardMaterial color={theme.b} emissive={theme.b} emissiveIntensity={1.1} transparent opacity={0.8} />
        </mesh>
      </group>
      <mesh ref={wire}>
        <icosahedronGeometry args={[4.7, 1]} />
        <meshBasicMaterial color={theme.a} wireframe transparent opacity={0.14} />
      </mesh>
    </group>
  );
}

/* ─── floating neon "fraction" — two glowing cubes over a bar ─── */
function FractionMonolith({ theme, position, scale = 1 }) {
  const ref = useRef();
  const seed = useMemo(() => Math.random() * 10, []);
  useFrame((state) => {
    const t = state.clock.elapsedTime + seed;
    ref.current.rotation.y = Math.sin(t * 0.4) * 0.6;
    ref.current.position.y = position[1] + Math.sin(t * 0.9) * 0.5;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color={theme.c} emissive={theme.c} emissiveIntensity={1.2} roughness={0.2} metalness={0.6} />
      </mesh>
      <mesh>
        <boxGeometry args={[2.2, 0.18, 0.5]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.9} roughness={0.15} metalness={0.7} />
      </mesh>
      <mesh position={[0, -1.1, 0]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color={theme.a} emissive={theme.a} emissiveIntensity={1.2} roughness={0.2} metalness={0.6} />
      </mesh>
    </group>
  );
}

function SceneInner({ theme }) {
  return (
    <>
      <color attach="background" args={[theme.bg]} />
      <fog attach="fog" args={[theme.bg, 14, 42]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[8, 6, 4]} intensity={90} color={theme.a} />
      <pointLight position={[-9, -5, 2]} intensity={70} color={theme.b} />
      <directionalLight position={[0, 5, 6]} intensity={0.7} color="#ffffff" />
      <Stars radius={70} depth={45} count={2600} factor={4.2} saturation={0.6} fade speed={1.2} />
      <Sparkles count={90} scale={[24, 14, 18]} size={4} speed={0.5} color={theme.c} opacity={0.75} position={[0, 0, -8]} />
      <CrystalField theme={theme} count={Math.round(11 * theme.intensity)} />
      <Planet theme={theme} />
      <FractionMonolith theme={theme} position={[-8.5, -1.5, -14]} scale={0.9} />
      <FractionMonolith theme={theme} position={[9.5, -3.5, -17]} scale={0.7} />
      <ParallaxRig />
      <EffectComposer>
        <Bloom intensity={0.9 * theme.intensity} luminanceThreshold={0.25} luminanceSmoothing={0.8} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.85} />
      </EffectComposer>
    </>
  );
}

export function Scene3D({ theme = "cosmic", dim = 0 }) {
  if (!supportsWebGL()) return null;
  const t = THEMES[theme] || THEMES.cosmic;
  return (
    <FXBoundary>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} aria-hidden>
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, 9], fov: 55 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          eventSource={typeof document !== "undefined" ? document.body : undefined}
        >
          <SceneInner theme={t} />
        </Canvas>
        {dim > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,10,${dim})` }} />}
      </div>
    </FXBoundary>
  );
}

/* ═══════════════════════════════════════════════════
   HAMMY 3-D  — modeled hamster hero
═══════════════════════════════════════════════════ */
const FUR = "#e8a95c", FUR_DARK = "#c8864e", CREAM = "#fdf0dc", PINK = "#ff9bb0", EAR_PINK = "#ffb3c6";

function HammyModel() {
  const grp = useRef();
  const headGrp = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    grp.current.position.y = Math.sin(t * 1.6) * 0.12 - 0.15;
    grp.current.rotation.y = Math.sin(t * 0.55) * 0.5;
    grp.current.rotation.z = Math.sin(t * 1.6) * 0.04;
    headGrp.current.rotation.z = Math.sin(t * 1.1) * 0.07;
  });
  const furMat = <meshStandardMaterial color={FUR} roughness={0.85} metalness={0} />;
  return (
    <group ref={grp}>
      {/* body */}
      <mesh position={[0, -0.55, 0]} scale={[1.05, 0.92, 0.95]}>
        <sphereGeometry args={[0.95, 32, 32]} />
        {furMat}
      </mesh>
      {/* belly */}
      <mesh position={[0, -0.6, 0.62]} scale={[0.62, 0.55, 0.42]}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial color={CREAM} roughness={0.9} />
      </mesh>
      {/* head */}
      <group ref={headGrp} position={[0, 0.62, 0.1]}>
        <mesh scale={[1, 0.92, 0.95]}>
          <sphereGeometry args={[0.78, 32, 32]} />
          {furMat}
        </mesh>
        {/* ears */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.52, 0.62, -0.05]} rotation={[0, 0, s * -0.25]}>
            <mesh>
              <sphereGeometry args={[0.26, 24, 24]} />
              <meshStandardMaterial color={FUR_DARK} roughness={0.85} />
            </mesh>
            <mesh position={[0, 0.02, 0.1]} scale={[0.7, 0.7, 0.5]}>
              <sphereGeometry args={[0.22, 24, 24]} />
              <meshStandardMaterial color={EAR_PINK} roughness={0.7} />
            </mesh>
          </group>
        ))}
        {/* cheeks */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.42, -0.18, 0.52]} scale={[0.55, 0.45, 0.4]}>
            <sphereGeometry args={[0.5, 24, 24]} />
            <meshStandardMaterial color={CREAM} roughness={0.9} />
          </mesh>
        ))}
        {/* eyes */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.3, 0.12, 0.62]}>
            <mesh>
              <sphereGeometry args={[0.13, 24, 24]} />
              <meshStandardMaterial color="#1a0a00" roughness={0.1} metalness={0.2} />
            </mesh>
            <mesh position={[0.04, 0.05, 0.09]}>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
            </mesh>
          </group>
        ))}
        {/* nose */}
        <mesh position={[0, -0.08, 0.74]} scale={[1, 0.75, 0.8]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color={PINK} roughness={0.4} />
        </mesh>
        {/* buck teeth */}
        <mesh position={[0, -0.26, 0.66]}>
          <boxGeometry args={[0.12, 0.12, 0.05]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
      </group>
      {/* arms */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.78, -0.35, 0.3]} rotation={[0, 0, s * -0.7]} scale={[0.28, 0.42, 0.28]}>
          <sphereGeometry args={[0.5, 20, 20]} />
          {furMat}
        </mesh>
      ))}
      {/* feet */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.4, -1.38, 0.35]} scale={[0.32, 0.2, 0.42]}>
          <sphereGeometry args={[0.5, 20, 20]} />
          <meshStandardMaterial color={FUR_DARK} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function HammyStage({ glow }) {
  const ring = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ring.current.rotation.z = t * 0.8;
    ring.current.scale.setScalar(1 + Math.sin(t * 1.6) * 0.04);
  });
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} color="#fff6e0" />
      <pointLight position={[-3, 1, 3]} intensity={26} color={glow} />
      <pointLight position={[0, -2.5, 2]} intensity={14} color="#ffd93d" />
      <HammyModel />
      {/* glowing pedestal ring */}
      <mesh ref={ring} position={[0, -1.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.045, 12, 64]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={2.4} transparent opacity={0.9} />
      </mesh>
      <Sparkles count={26} scale={[3.4, 3.6, 3]} size={4.5} speed={0.55} color="#ffd93d" opacity={0.85} />
    </>
  );
}

export function Hammy3D({ size = 150, glow = "#ffb347", style = {} }) {
  if (!supportsWebGL()) return null;
  return (
    <FXBoundary>
      <div style={{ width: size, height: size * 1.15, ...style }} aria-hidden>
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0.15, 4.4], fov: 42 }} gl={{ antialias: true, alpha: true }}>
          <HammyStage glow={glow} />
        </Canvas>
      </div>
    </FXBoundary>
  );
}
