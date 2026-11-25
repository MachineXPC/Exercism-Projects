import { useMemo } from "react";
import { MeshStandardMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { COR } from "../estilo";
import { Ventilador } from "./Ventilador";

// Escala da cena: 1 unidade = 10 cm. Teclado compacto (sem teclado numérico).
export const U = 0.19;
const FOLGA = 0.028;
export const ALTURA_BASE = 0.22;
const ALTURA_TECLA = 0.085;
const MARGEM = 0.15;
const MARGEM_TRAS = 0.14;
const PROF_TECLAS = 6 * U + 0.05;
const VAO_APOIO = 0.1;
const PROF_APOIO = 0.85;
export const LARGURA = 15 * U + 2 * MARGEM;
export const TOPO_TECLAS = ALTURA_BASE + ALTURA_TECLA - 0.012;
export const RAIO_VENTILADOR = 0.3;
export const X_VENTILADORES = [-0.62, 0.62];

// Larguras das teclas em cada fileira (em "U"): F1..F12, números, QWERTY, ASDF, ZXCV, espaço.
const LINHAS = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
  [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
  [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75],
  [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25],
];

export const profundidade = (ventiladores: boolean) =>
  MARGEM_TRAS + PROF_TECLAS + (ventiladores ? VAO_APOIO + PROF_APOIO : MARGEM_TRAS);

export const zLinha = (ventiladores: boolean, linha: number) =>
  -profundidade(ventiladores) / 2 + MARGEM_TRAS + U / 2 + linha * U + (linha > 0 ? 0.05 : 0);

export const xTecla = (linha: number, coluna: number) => {
  let x = (-15 * U) / 2;
  for (let k = 0; k < coluna; k++) {
    x += LINHAS[linha][k] * U;
  }
  return x + (LINHAS[linha][coluna] * U) / 2;
};

export const zVentiladores = () => profundidade(true) / 2 - PROF_APOIO / 2;

export const Teclado: React.FC<{
  ventiladores: boolean;
  brilho?: number;
  giro?: number;
  luzTeclas?: number;
}> = ({ ventiladores, brilho = 0, giro = 0, luzTeclas = 0 }) => {
  const P = profundidade(ventiladores);
  const base = useMemo(() => new RoundedBoxGeometry(LARGURA, ALTURA_BASE, P, 4, 0.07), [P]);
  const materialBase = useMemo(
    () => new MeshStandardMaterial({ color: "#16181c", roughness: 0.42, metalness: 0.45 }),
    [],
  );
  const materialTecla = useMemo(
    () => new MeshStandardMaterial({ color: "#202329", roughness: 0.66, metalness: 0.12 }),
    [],
  );
  const materialFresta = useMemo(
    () => new MeshStandardMaterial({ color: "#020304", roughness: 1 }),
    [],
  );

  const teclas = useMemo(() => {
    const geometrias = new Map<number, RoundedBoxGeometry>();
    const lista: { geometria: RoundedBoxGeometry; x: number; z: number }[] = [];
    LINHAS.forEach((linha, l) => {
      linha.forEach((largura, c) => {
        let geometria = geometrias.get(largura);
        if (!geometria) {
          geometria = new RoundedBoxGeometry(largura * U - FOLGA, ALTURA_TECLA, U - FOLGA, 2, 0.02);
          geometrias.set(largura, geometria);
        }
        lista.push({ geometria, x: xTecla(l, c), z: zLinha(ventiladores, l) });
      });
    });
    return lista;
  }, [ventiladores]);

  const zCentroTeclas = -P / 2 + MARGEM_TRAS + PROF_TECLAS / 2;
  const zApoio = zVentiladores();

  return (
    <group>
      <mesh geometry={base} material={materialBase} position-y={ALTURA_BASE / 2} castShadow receiveShadow />
      <mesh rotation-x={-Math.PI / 2} position={[0, ALTURA_BASE + 0.002, zCentroTeclas]}>
        <planeGeometry args={[15 * U, PROF_TECLAS]} />
        <meshStandardMaterial
          color="#07090c"
          emissive={COR.ciano}
          emissiveIntensity={luzTeclas * 1.4}
          roughness={0.7}
        />
      </mesh>
      {teclas.map((t, i) => (
        <mesh
          key={i}
          geometry={t.geometria}
          material={materialTecla}
          position={[t.x, ALTURA_BASE + ALTURA_TECLA / 2 - 0.012, t.z]}
          castShadow
          receiveShadow
        />
      ))}
      {ventiladores ? (
        <>
          {X_VENTILADORES.map((x) => (
            <group key={x} position={[x, ALTURA_BASE, zApoio]}>
              <Ventilador raio={RAIO_VENTILADOR} giro={giro} brilho={brilho} />
            </group>
          ))}
          {Array.from({ length: 21 }, (_, i) => (
            <mesh
              key={i}
              material={materialFresta}
              position={[-1.2 + i * 0.12, ALTURA_BASE * 0.5, P / 2 + 0.002]}
            >
              <boxGeometry args={[0.07, 0.026, 0.006]} />
            </mesh>
          ))}
          <mesh rotation-x={-Math.PI / 2} position={[0, ALTURA_BASE + 0.0015, P / 2 - 0.07]}>
            <planeGeometry args={[2.4, 0.014]} />
            <meshStandardMaterial color="#0a1018" emissive={COR.ciano} emissiveIntensity={brilho * 5} />
          </mesh>
        </>
      ) : null}
    </group>
  );
};
