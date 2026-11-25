import { LARGURA, Teclado } from "./Teclado";
import { Mouse } from "./Mouse";

export const X_MOUSE = LARGURA / 2 + 0.75;

export const Produto: React.FC<{
  brilho: number;
  brilhoMouse?: number;
  giro: number;
  luzTeclas: number;
}> = ({ brilho, brilhoMouse = brilho, giro, luzTeclas }) => (
  <group>
    <Teclado ventiladores brilho={brilho} giro={giro} luzTeclas={luzTeclas} />
    <group position={[X_MOUSE, 0, 0.35]} rotation-y={-0.12}>
      <Mouse brilho={brilhoMouse} giro={giro * 1.3} />
    </group>
  </group>
);

// Ângulo acumulado de um ventilador que acelera de 0 até "velocidade" (rad/frame).
export const giroAcumulado = (frame: number, inicio: number, rampa: number, velocidade: number) => {
  const t = frame - inicio;
  if (t <= 0) {
    return 0;
  }
  if (t < rampa) {
    return (velocidade * t * t) / (2 * rampa);
  }
  return (velocidade * rampa) / 2 + velocidade * (t - rampa);
};
