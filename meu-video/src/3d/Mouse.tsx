import { useMemo } from "react";
import { SphereGeometry } from "three";
import { COR } from "../estilo";
import { Ventilador } from "./Ventilador";

const ESCALA: [number, number, number] = [0.32, 0.34, 0.6];

// Mouse de ~12 cm com um ventilador no dorso, perto da palma.
export const Mouse: React.FC<{ brilho: number; giro: number }> = ({ brilho, giro }) => {
  const casco = useMemo(() => new SphereGeometry(1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), []);
  return (
    <group>
      <mesh geometry={casco} scale={ESCALA} position-y={0.03} castShadow receiveShadow>
        <meshStandardMaterial color="#17191d" roughness={0.32} metalness={0.35} />
      </mesh>
      <mesh scale={[ESCALA[0], 1, ESCALA[2]]} position-y={0.016}>
        <cylinderGeometry args={[1, 1, 0.032, 64]} />
        <meshStandardMaterial color="#0b0c0e" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.3, -0.33]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.045, 0.045, 0.035, 24]} />
        <meshStandardMaterial color="#1b1f26" emissive={COR.ciano} emissiveIntensity={brilho * 1.5} />
      </mesh>
      <group position={[0, 0.31, 0.2]} rotation-x={0.2}>
        <mesh>
          <cylinderGeometry args={[0.165, 0.165, 0.05, 48]} />
          <meshStandardMaterial color="#121418" roughness={0.4} metalness={0.5} />
        </mesh>
        <group position-y={0.022}>
          <Ventilador raio={0.14} giro={giro} brilho={brilho} />
        </group>
      </group>
    </group>
  );
};
