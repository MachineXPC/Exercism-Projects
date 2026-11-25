import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Camera, Reflexos, SombraSuave } from "../3d/ambiente";
import { giroAcumulado, Produto, X_MOUSE } from "../3d/Produto";
import { cena } from "../dados";
import { COR, FONTE } from "../estilo";
import { Legendas } from "../ui/Legendas";
import { Logo } from "../ui/Logo";

const dados = cena("produto");
const CENTRO_X = (X_MOUSE - 1.2) / 2;

export const Cena2Produto: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const [apresenta, ventiladores, mouse] = dados.legendas.map((l) => l.inicioFrame);
  const angulo = interpolate(frame, [0, durationInFrames], [-0.55, 0.3], { easing: Easing.inOut(Easing.sin) });
  const brilho = interpolate(frame, [ventiladores - 6, ventiladores + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const brilhoMouse = interpolate(frame, [mouse - 4, mouse + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const giro = giroAcumulado(frame, ventiladores - 6, 24, 0.32);

  return (
    <AbsoluteFill style={{ backgroundColor: "#e8edf2" }}>
      <ThreeCanvas width={width} height={height}>
        <color attach="background" args={["#e8edf2"]} />
        <fog attach="fog" args={["#e8edf2", 10, 22]} />
        <Camera
          posicao={[CENTRO_X + 6.4 * Math.sin(angulo), 3.5, 6.4 * Math.cos(angulo)]}
          alvo={[CENTRO_X, 0.0, 0.15]}
          fov={30}
        />
        <Reflexos intensidade={0.7} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[-3, 6, 4]} intensity={2.2} />
        <directionalLight position={[4, 3, 2]} intensity={0.7} color="#dbeafe" />
        <mesh rotation-x={-Math.PI / 2}>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color="#e8edf2" roughness={1} />
        </mesh>
        <SombraSuave largura={4.4} profundidade={3.2} opacidade={0.5} posicao={[0, 0.003, 0]} />
        <SombraSuave largura={1.2} profundidade={1.7} opacidade={0.45} posicao={[X_MOUSE, 0.004, 0.35]} />
        <Produto brilho={brilho} brilhoMouse={brilhoMouse} giro={giro} luzTeclas={brilho * 0.5} />
      </ThreeCanvas>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 80 }}>
        <Logo
          tamanho={96}
          corTexto="#0b1220"
          giro={giro * 20}
          style={{
            opacity: interpolate(frame, [apresenta, apresenta + 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [apresenta, apresenta + 18], [0.85, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.back(1.6)),
            }),
          }}
        />
        <div
          style={{
            marginTop: 18,
            fontFamily: FONTE,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#1e3a5f",
            opacity: interpolate(frame, [ventiladores, ventiladores + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Ventilação <span style={{ color: COR.ciano }}>integrada</span>
        </div>
      </AbsoluteFill>
      <Legendas legendas={dados.legendas} />
    </AbsoluteFill>
  );
};
