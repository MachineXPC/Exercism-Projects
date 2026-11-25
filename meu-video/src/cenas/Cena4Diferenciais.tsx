import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { CanvasTexture } from "three";
import { Camera, Reflexos } from "../3d/ambiente";
import { giroAcumulado, Produto } from "../3d/Produto";
import { cena } from "../dados";
import { CardEspec, IconeBateria, IconeNiveis, IconeSilencio } from "../ui/CardEspec";
import { Legendas } from "../ui/Legendas";

const dados = cena("diferenciais");

// Tela do monitor: um editor de código desenhado por código.
const useTela = () =>
  useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D indisponível");
    }
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, 1024, 600);
    ctx.fillStyle = "#161b22";
    ctx.fillRect(0, 0, 200, 600);
    ctx.fillRect(0, 0, 1024, 36);
    const cores = ["#7dd3fc", "#f472b6", "#a5d6ff", "#7ee787", "#d2a8ff", "#ffa657"];
    for (let l = 0; l < 26; l++) {
      let x = 230 + Math.floor(random(`recuo-${l}`) * 4) * 28;
      const palavras = 1 + Math.floor(random(`pal-${l}`) * 5);
      for (let p = 0; p < palavras; p++) {
        const w = 30 + random(`w-${l}-${p}`) * 110;
        ctx.fillStyle = cores[Math.floor(random(`c-${l}-${p}`) * cores.length)];
        ctx.fillRect(x, 54 + l * 21, w, 10);
        x += w + 14;
      }
    }
    for (let l = 0; l < 14; l++) {
      ctx.fillStyle = "#30363d";
      ctx.fillRect(24, 60 + l * 30, 60 + random(`arq-${l}`) * 90, 10);
    }
    return new CanvasTexture(canvas);
  }, []);

export const Cena4Diferenciais: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const [niveis, decibeis, usb, horas] = dados.legendas.map((l) => l.inicioFrame);
  const tela = useTela();
  const deriva = interpolate(frame, [0, durationInFrames], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#090c11" }}>
      <ThreeCanvas width={width} height={height} shadows>
        <color attach="background" args={["#090c11"]} />
        <fog attach="fog" args={["#090c11", 7, 15]} />
        <Camera
          posicao={[-2.3 + 0.7 * deriva, 3.2 - 0.2 * deriva, 4.9 - 0.3 * deriva]}
          alvo={[2.1, 0.35, -0.5]}
          fov={36}
        />
        <Reflexos intensidade={0.3} />
        <ambientLight intensity={0.22} color="#c7d7ff" />
        <directionalLight
          castShadow
          position={[-3, 5, 2.5]}
          intensity={1.6}
          color="#e6eeff"
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={4}
          shadow-camera-bottom={-4}
          shadow-bias={-0.0005}
        />
        <pointLight position={[0.4, 1.6, -1.2]} intensity={6} color="#7aa7ff" distance={6} decay={2} />
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#1c1f25" roughness={0.55} metalness={0.15} />
        </mesh>
        <group position={[0.4, 0, -2.3]}>
          <mesh position={[0, 1.65, 0]} castShadow>
            <boxGeometry args={[4.2, 2.45, 0.1]} />
            <meshStandardMaterial color="#0b0d11" roughness={0.4} metalness={0.5} />
          </mesh>
          <mesh position={[0, 1.67, 0.052]}>
            <planeGeometry args={[4.0, 2.28]} />
            <meshBasicMaterial map={tela} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.25, -0.1]}>
            <boxGeometry args={[0.25, 0.5, 0.12]} />
            <meshStandardMaterial color="#15181d" metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.02, -0.05]}>
            <boxGeometry args={[1.2, 0.04, 0.7]} />
            <meshStandardMaterial color="#15181d" metalness={0.6} roughness={0.35} />
          </mesh>
        </group>
        <Produto brilho={0.85} giro={giroAcumulado(frame, -60, 1, 0.3)} luzTeclas={0.55} />
      </ThreeCanvas>
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "flex-end", paddingRight: 90, paddingBottom: 110, gap: 26 }}
      >
        <CardEspec
          aparece={niveis}
          titulo="3 níveis"
          subtitulo="de velocidade"
          icone={
            <IconeNiveis
              nivel={interpolate(frame, [niveis + 6, niveis + 40], [0, 3], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}
            />
          }
        />
        <CardEspec
          aparece={decibeis}
          titulo="< 30 dB"
          subtitulo="operação silenciosa"
          icone={<IconeSilencio onda={frame * 0.18} />}
        />
        <CardEspec
          aparece={usb}
          titulo="USB-C · ~8 h"
          subtitulo="bateria recarregável"
          icone={
            <IconeBateria
              carga={interpolate(frame, [usb + 6, horas + 24], [0.12, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}
            />
          }
        />
      </AbsoluteFill>
      <Legendas legendas={dados.legendas} />
    </AbsoluteFill>
  );
};
