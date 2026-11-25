import { useMemo } from "react";
import { MeshStandardMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { random } from "remotion";
import type { Vec3 } from "./ambiente";

// Indicador, médio, anelar e mínimo. x positivo = lado do mínimo na mão direita.
const DEDOS = [
  { x: -0.27, comprimento: 0.75, raio: 0.082 },
  { x: -0.09, comprimento: 0.82, raio: 0.084 },
  { x: 0.09, comprimento: 0.77, raio: 0.08 },
  { x: 0.26, comprimento: 0.6, raio: 0.07 },
];

// Altura e recuo do punho em relação à ponta dos dedos na pose de digitação.
export const POSE_DIGITANDO = { acimaDasTeclas: 0.42, atrasDaFileira: 1.42 };

const toque = (tempo: number, velocidade: number, semente: string) => {
  if (velocidade <= 0) {
    return 0;
  }
  const periodo = 10 + random(semente) * 9;
  const fase = random(`${semente}-fase`) * periodo;
  const p = ((((tempo * velocidade + fase) % periodo) + periodo) % periodo) / periodo;
  return p < 0.28 ? Math.sin((p / 0.28) * Math.PI) : 0;
};

// Mão estilizada, palma para baixo, dedos apontando para -Z, punho na origem.
export const Mao: React.FC<{
  lado: 1 | -1;
  posicao: Vec3;
  rotacao?: Vec3;
  tempo: number;
  velocidade: number;
  curvatura?: number;
}> = ({ lado, posicao, rotacao = [0.12, 0, 0], tempo, velocidade, curvatura = 0.35 }) => {
  const pele = useMemo(
    () => new MeshStandardMaterial({ color: "#d39b78", roughness: 0.58, metalness: 0 }),
    [],
  );
  const manga = useMemo(() => new MeshStandardMaterial({ color: "#2f3846", roughness: 0.85 }), []);
  const palma = useMemo(() => new RoundedBoxGeometry(0.78, 0.24, 0.9, 5, 0.115), []);

  return (
    <group position={posicao} rotation={rotacao}>
      <mesh geometry={palma} material={pele} position={[0, 0, -0.45]} castShadow />
      <mesh material={pele} position={[0, 0.06, -0.47]} scale={[0.37, 0.1, 0.42]} castShadow>
        <sphereGeometry args={[1, 32, 16]} />
      </mesh>
      {DEDOS.map((d, i) => {
        const t = toque(tempo, velocidade, `dedo-${lado}-${i}`);
        const proximal = d.comprimento * 0.55;
        const distal = d.comprimento * 0.45;
        return (
          <group key={i} position={[d.x * lado, -0.02, -0.86]} rotation-x={-(curvatura + t * 0.14)}>
            <mesh material={pele} rotation-x={Math.PI / 2} position-z={-proximal / 2} castShadow>
              <capsuleGeometry args={[d.raio, proximal, 6, 12]} />
            </mesh>
            <group position-z={-proximal} rotation-x={-(curvatura * 2.4 + t * 0.1)}>
              <mesh material={pele} rotation-x={Math.PI / 2} position-z={-distal / 2} castShadow>
                <capsuleGeometry args={[d.raio * 0.93, distal, 6, 12]} />
              </mesh>
            </group>
          </group>
        );
      })}
      <group position={[-0.38 * lado, -0.06, -0.34]} rotation={[-0.45, 0.6 * lado, 0]}>
        <mesh material={pele} rotation-x={Math.PI / 2} position-z={-0.22} castShadow>
          <capsuleGeometry args={[0.095, 0.4, 6, 12]} />
        </mesh>
      </group>
      <mesh material={pele} rotation-x={Math.PI / 2} position={[0, -0.01, 0.95]} scale={[1.15, 1, 0.72]} castShadow>
        <capsuleGeometry args={[0.24, 1.8, 6, 16]} />
      </mesh>
      <mesh material={manga} rotation-x={Math.PI / 2} position={[0, 0.01, 3.4]} scale={[1.1, 1, 0.82]} castShadow>
        <cylinderGeometry args={[0.34, 0.31, 3.6, 24]} />
      </mesh>
    </group>
  );
};
