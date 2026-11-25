import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Camera, Particulas, Reflexos } from "../3d/ambiente";
import { Mao } from "../3d/Mao";
import { giroAcumulado } from "../3d/Produto";
import { ALTURA_BASE, profundidade, Teclado, X_VENTILADORES, zVentiladores } from "../3d/Teclado";
import { cena } from "../dados";
import { COR, FONTE } from "../estilo";
import { Etapas } from "../ui/Etapas";
import { Legendas } from "../ui/Legendas";

const dados = cena("funcionamento");
const XV = X_VENTILADORES[0];
const ZV = zVentiladores();
const FRENTE = profundidade(true) / 2;
const Y_PALMA = ALTURA_BASE + 0.14;

export const Cena3Funcionamento: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const [entrada, calor, seco] = dados.legendas.map((l) => l.inicioFrame);
  const deriva = interpolate(frame, [0, durationInFrames], [0, 1]);
  const fluxo = interpolate(frame, [entrada, entrada + 20], [0.25, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dissipa = interpolate(frame, [calor, calor + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const restoCalor = interpolate(frame, [seco, seco + 40], [1, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#07101c" }}>
      <ThreeCanvas width={width} height={height} shadows>
        <color attach="background" args={["#07101c"]} />
        <fog attach="fog" args={["#07101c", 5, 11]} />
        <Camera
          posicao={[-3.4 + 0.3 * deriva, 1.2 - 0.1 * deriva, 2.3 - 0.3 * deriva]}
          alvo={[-0.3, 0.42, 0.45]}
          fov={34}
        />
        <Reflexos intensidade={0.35} />
        <ambientLight intensity={0.25} color="#cfe3ff" />
        <directionalLight
          castShadow
          position={[-2, 5, 3]}
          intensity={1.9}
          color="#eef6ff"
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-3}
          shadow-camera-right={3}
          shadow-camera-top={3}
          shadow-camera-bottom={-3}
          shadow-bias={-0.0005}
        />
        <directionalLight position={[3, 2, -2.5]} intensity={1.3} color={COR.gelo} />
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#0c1828" roughness={0.6} />
        </mesh>
        <Teclado ventiladores brilho={0.9} giro={giroAcumulado(frame, -60, 1, 0.32)} luzTeclas={0.45} />
        <Mao
          lado={-1}
          posicao={[XV, ALTURA_BASE + 0.205, ZV + 0.58]}
          tempo={frame}
          velocidade={0}
          curvatura={0.15}
        />
        <Particulas
          quantidade={70}
          cor={COR.gelo}
          calcular={(i) => {
            const vida = 42;
            const u = ((frame + random(`ar-${i}`) * vida) % vida) / vida;
            const y = ALTURA_BASE + 0.04 + u * 1.05;
            const raio = 0.04 + random(`ar-r-${i}`) * 0.24 + u * 0.2 + Math.max(0, y - Y_PALMA + 0.05) * 1.3;
            const ang = random(`ar-a-${i}`) * Math.PI * 2 + u * 2.4;
            return {
              posicao: [XV + Math.cos(ang) * raio, y, ZV + Math.sin(ang) * raio * 0.8],
              opacidade: Math.sin(u * Math.PI) * 0.85 * fluxo,
              escala: 0.07 + u * 0.05,
            };
          }}
        />
        <Particulas
          quantidade={36}
          cor={COR.ciano}
          calcular={(i) => {
            const vida = 34;
            const u = ((frame + random(`entra-${i}`) * vida) % vida) / vida;
            const x = -1.2 + random(`entra-x-${i}`) * 2.4;
            return {
              posicao: [x, ALTURA_BASE * 0.5 + Math.sin(u * 5 + i) * 0.02, FRENTE + 0.9 * (1 - u)],
              opacidade: Math.sin(u * Math.PI) * 0.8 * fluxo,
              escala: 0.06,
            };
          }}
        />
        <Particulas
          quantidade={30}
          cor={COR.calor}
          calcular={(i) => {
            const vida = 46;
            const u = ((frame + random(`quente-${i}`) * vida) % vida) / vida;
            const x = XV + (random(`quente-x-${i}`) - 0.5) * 0.7;
            const z = ZV + (random(`quente-z-${i}`) - 0.5) * 0.7;
            return {
              posicao: [x - u * 0.4 * dissipa, Y_PALMA + 0.32 + u * 0.8, z - u * 0.2 * dissipa],
              opacidade: Math.sin(u * Math.PI) * 0.45 * restoCalor * (1 - u * dissipa * 0.7),
              escala: 0.16 + u * 0.22,
            };
          }}
        />
      </ThreeCanvas>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 56 }}>
        <div
          style={{
            fontFamily: FONTE,
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: COR.ciano,
            marginBottom: 22,
          }}
        >
          Como funciona
        </div>
        <Etapas
          etapas={[
            { texto: "Ar entra pelas frestas", inicio: entrada },
            { texto: "Calor das mãos é dissipado", inicio: calor },
            { texto: "Mãos mais secas", inicio: seco },
          ]}
        />
      </AbsoluteFill>
      <Legendas legendas={dados.legendas} />
    </AbsoluteFill>
  );
};
