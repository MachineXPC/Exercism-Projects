import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Camera, Particulas, Reflexos } from "../3d/ambiente";
import { Mao, POSE_DIGITANDO } from "../3d/Mao";
import { Teclado, TOPO_TECLAS, xTecla, zLinha } from "../3d/Teclado";
import { cena } from "../dados";
import { COR } from "../estilo";
import { Legendas } from "../ui/Legendas";

const dados = cena("problema");
const Y_MAO = TOPO_TECLAS + POSE_DIGITANDO.acimaDasTeclas;
const Z_MAO = zLinha(false, 3) + POSE_DIGITANDO.atrasDaFileira;
const X_ESQ = xTecla(3, 4) - 0.285;
const X_DIR = xTecla(3, 7) + 0.285;

export const Cena1Problema: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const suor = dados.legendas[2].inicioFrame;
  const calor = interpolate(frame, [0, 50], [0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const aproximacao = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#1c130e" }}>
      <ThreeCanvas width={width} height={height} shadows>
        <color attach="background" args={["#1c130e"]} />
        <fog attach="fog" args={["#1c130e", 6, 13]} />
        <Camera
          posicao={[-1.5 + 0.45 * aproximacao, 1.9 - 0.3 * aproximacao, -3.1 + 0.75 * aproximacao]}
          alvo={[-0.2, 0.5, 0.55]}
          fov={34}
        />
        <Reflexos intensidade={0.25} />
        <ambientLight intensity={0.4} color="#ffd9b8" />
        <directionalLight position={[1, 3, -4]} intensity={0.9} color="#ffd2a8" />
        <directionalLight
          castShadow
          position={[-2.5, 5, 3]}
          intensity={2.6}
          color="#ffc08a"
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={4}
          shadow-camera-bottom={-4}
          shadow-bias={-0.0005}
        />
        <pointLight position={[-0.15, 1.6, 1.4]} intensity={2.5 * calor} color="#ff8a3d" distance={5} decay={2} />
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#4a3426" roughness={0.75} />
        </mesh>
        <Teclado ventiladores={false} />
        <Mao lado={-1} posicao={[X_ESQ, Y_MAO, Z_MAO]} tempo={frame} velocidade={1.4} />
        <Mao lado={1} posicao={[X_DIR, Y_MAO, Z_MAO]} tempo={frame + 7} velocidade={1.4} />
        <Particulas
          quantidade={44}
          cor={COR.calor}
          calcular={(i) => {
            const vida = 55;
            const u = ((frame + random(`calor-${i}`) * vida) % vida) / vida;
            const x = (i % 2 === 0 ? X_ESQ : X_DIR) + (random(`calor-x-${i}`) - 0.5) * 0.8;
            const z = Z_MAO - 0.45 + (random(`calor-z-${i}`) - 0.5) * 0.8;
            return {
              posicao: [x + Math.sin(u * 6 + i) * 0.05, Y_MAO + 0.15 + u * 0.9, z],
              opacidade: Math.sin(u * Math.PI) * 0.32 * calor,
              escala: 0.22 + u * 0.3,
            };
          }}
        />
        {Array.from({ length: 16 }, (_, i) => {
          const vida = 24;
          const inicio = suor + random(`gota-${i}`) * 30;
          const t = frame - inicio;
          if (t < 0) {
            return null;
          }
          const u = (t % vida) / vida;
          const x = (i % 2 === 0 ? X_ESQ : X_DIR) + (random(`gota-x-${i}`) - 0.5) * 0.7;
          const z = Z_MAO - 0.35 - random(`gota-z-${i}`) * 0.7;
          return (
            <mesh key={i} position={[x, Y_MAO - 0.12 - u * u * 0.3, z]} scale={[0.042, 0.058, 0.042]}>
              <sphereGeometry args={[1, 16, 12]} />
              <meshStandardMaterial
                color="#cfe9ff"
                emissive="#9fd3ff"
                emissiveIntensity={0.35}
                roughness={0.05}
                metalness={0.2}
                transparent
                opacity={0.9 * (1 - u * 0.5)}
              />
            </mesh>
          );
        })}
      </ThreeCanvas>
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(70,18,0,0.55) 100%)",
          opacity: calor,
        }}
      />
      <Legendas legendas={dados.legendas} />
    </AbsoluteFill>
  );
};
