import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import {
  AdditiveBlending,
  CanvasTexture,
  PerspectiveCamera,
  PMREMGenerator,
  type Texture,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type Vec3 = [number, number, number];

// Reflexos de estúdio gerados por código (sem baixar HDRI).
export const Reflexos: React.FC<{ intensidade: number }> = ({ intensidade }) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useLayoutEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const textura = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = textura;
    return () => {
      scene.environment = null;
      textura.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  useLayoutEffect(() => {
    scene.environmentIntensity = intensidade;
  }, [scene, intensidade]);

  return null;
};

// Posiciona a câmera a cada frame (o ThreeCanvas renderiza logo depois).
export const Camera: React.FC<{ posicao: Vec3; alvo: Vec3; fov: number }> = ({
  posicao,
  alvo,
  fov,
}) => {
  const camera = useThree((s) => s.camera);

  useLayoutEffect(() => {
    if (camera instanceof PerspectiveCamera) {
      camera.fov = fov;
      camera.near = 0.05;
      camera.far = 60;
      camera.updateProjectionMatrix();
    }
    camera.position.set(...posicao);
    camera.lookAt(...alvo);
    camera.updateMatrixWorld();
  });

  return null;
};

const texturaRadial = (paradas: [number, string][]) => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D indisponível");
  }
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  for (const [pos, cor] of paradas) {
    grad.addColorStop(pos, cor);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return new CanvasTexture(canvas);
};

export const useTexturaBrilho = (): Texture =>
  useMemo(
    () =>
      texturaRadial([
        [0, "rgba(255,255,255,1)"],
        [0.25, "rgba(255,255,255,0.65)"],
        [1, "rgba(255,255,255,0)"],
      ]),
    [],
  );

// Sombra de contato barata: um gradiente escuro deitado sob o produto.
export const SombraSuave: React.FC<{
  largura: number;
  profundidade: number;
  opacidade: number;
  posicao: Vec3;
}> = ({ largura, profundidade, opacidade, posicao }) => {
  const textura = useMemo(
    () =>
      texturaRadial([
        [0, "rgba(0,0,0,1)"],
        [0.55, "rgba(0,0,0,0.55)"],
        [1, "rgba(0,0,0,0)"],
      ]),
    [],
  );
  return (
    <mesh rotation-x={-Math.PI / 2} position={posicao}>
      <planeGeometry args={[largura, profundidade]} />
      <meshBasicMaterial map={textura} transparent opacity={opacidade} depthWrite={false} />
    </mesh>
  );
};

export type Particula = { posicao: Vec3; opacidade: number; escala: number };

export const Particulas: React.FC<{
  quantidade: number;
  cor: string;
  calcular: (indice: number) => Particula;
}> = ({ quantidade, cor, calcular }) => {
  const textura = useTexturaBrilho();
  return (
    <>
      {Array.from({ length: quantidade }, (_, i) => {
        const p = calcular(i);
        return (
          <sprite key={i} position={p.posicao} scale={[p.escala, p.escala, p.escala]}>
            <spriteMaterial
              map={textura}
              color={cor}
              transparent
              opacity={Math.max(0, p.opacidade)}
              depthWrite={false}
              blending={AdditiveBlending}
            />
          </sprite>
        );
      })}
    </>
  );
};
