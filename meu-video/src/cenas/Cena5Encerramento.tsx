import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Camera, Reflexos, SombraSuave } from "../3d/ambiente";
import { giroAcumulado, Produto, X_MOUSE } from "../3d/Produto";
import { cena } from "../dados";
import { COR, FONTE } from "../estilo";
import { Logo } from "../ui/Logo";

const dados = cena("encerramento");

export const Cena5Encerramento: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const [marca, slogan] = dados.legendas.map((l) => l.inicioFrame);
  const brilho = interpolate(frame, [8, 22, 50, 95], [0, 1, 1, 0.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const giro = giroAcumulado(frame, -40, 1, 0.3);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070b" }}>
      <ThreeCanvas width={width} height={height}>
        <color attach="background" args={["#05070b"]} />
        <fog attach="fog" args={["#05070b", 7, 14]} />
        <Camera posicao={[0.5, 3.1, 6.6]} alvo={[0.5, -0.85, 0]} fov={30} />
        <Reflexos intensidade={0.22} />
        <ambientLight intensity={0.06} />
        <directionalLight position={[-6, 2.5, 1.5]} intensity={3.2} color="#f1f5ff" />
        <directionalLight position={[5, 2.2, -3]} intensity={2.2} color={COR.gelo} />
        <mesh rotation-x={-Math.PI / 2}>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#07090d" roughness={0.4} metalness={0.3} />
        </mesh>
        <group
          position={[0.5, 0, 0]}
          rotation-y={interpolate(frame, [0, durationInFrames], [0.5, -0.12], {
            easing: Easing.inOut(Easing.sin),
          })}
        >
          <group position={[-(X_MOUSE - 1.6) / 2, 0, 0]}>
            <SombraSuave largura={4.4} profundidade={3.2} opacidade={0.8} posicao={[0, 0.003, 0]} />
            <Produto brilho={brilho} giro={giro} luzTeclas={brilho * 0.6} />
          </group>
        </group>
      </ThreeCanvas>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 120 }}>
        <Logo
          tamanho={112}
          corTexto="#ffffff"
          giro={giro * 20}
          style={{
            opacity: interpolate(frame, [marca, marca + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [marca, marca + 18], ["0px 30px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            }),
          }}
        />
        <div
          style={{
            marginTop: 26,
            fontFamily: FONTE,
            fontWeight: 500,
            fontSize: 42,
            color: COR.texto,
            opacity: interpolate(frame, [slogan, slogan + 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Mais conforto para suas longas horas no computador.
        </div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundColor: "#000000",
          opacity: interpolate(frame, [durationInFrames - 16, durationInFrames], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </AbsoluteFill>
  );
};
