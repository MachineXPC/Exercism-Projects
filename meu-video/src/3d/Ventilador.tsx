import { COR } from "../estilo";

const PAS = 7;

// Ventilador deitado (soprando para cima, eixo +Y). Unidade da cena: 1 = 10 cm.
export const Ventilador: React.FC<{
  raio: number;
  giro: number;
  brilho: number;
}> = ({ raio, giro, brilho }) => {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={0.002}>
        <circleGeometry args={[raio, 48]} />
        <meshStandardMaterial color="#020305" roughness={0.9} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.004}>
        <ringGeometry args={[raio * 0.84, raio * 0.97, 64]} />
        <meshStandardMaterial
          color="#0a1018"
          emissive={COR.ciano}
          emissiveIntensity={brilho * 4}
        />
      </mesh>
      <group rotation-y={giro} position-y={0.014}>
        {Array.from({ length: PAS }, (_, i) => (
          <group key={i} rotation-y={(i * Math.PI * 2) / PAS}>
            <mesh position={[raio * 0.5, 0, 0]} rotation-x={0.4}>
              <boxGeometry args={[raio * 0.64, 0.006, raio * 0.32]} />
              <meshStandardMaterial
                color="#262b33"
                emissive={COR.ciano}
                emissiveIntensity={brilho * 0.25}
                metalness={0.4}
                roughness={0.45}
              />
            </mesh>
          </group>
        ))}
        <mesh>
          <cylinderGeometry args={[raio * 0.22, raio * 0.22, 0.02, 32]} />
          <meshStandardMaterial color="#14181e" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position-y={0.0105} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[raio * 0.12, 32]} />
          <meshStandardMaterial color="#0d1a26" emissive={COR.gelo} emissiveIntensity={brilho * 3} />
        </mesh>
      </group>
      {[0.42, 0.7, 0.985].map((f) => (
        <mesh key={f} rotation-x={-Math.PI / 2} position-y={0.03}>
          <torusGeometry args={[raio * f, 0.008, 8, 64]} />
          <meshStandardMaterial color="#3a414d" metalness={0.85} roughness={0.3} />
        </mesh>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation-y={(i * Math.PI) / 4} position-y={0.03}>
          <boxGeometry args={[raio * 1.96, 0.008, 0.012]} />
          <meshStandardMaterial color="#3a414d" metalness={0.85} roughness={0.3} />
        </mesh>
      ))}
      <pointLight
        position-y={0.45}
        color={COR.ciano}
        intensity={brilho * 1.2}
        distance={2}
        decay={2}
      />
    </group>
  );
};
