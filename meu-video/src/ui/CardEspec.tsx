import { Easing, interpolate, useCurrentFrame } from "remotion";
import { COR, FONTE } from "../estilo";

export const CardEspec: React.FC<{
  aparece: number;
  titulo: string;
  subtitulo: string;
  icone: React.ReactNode;
}> = ({ aparece, titulo, subtitulo, icone }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28,
        width: 600,
        padding: "26px 32px",
        borderRadius: 26,
        backgroundColor: "rgba(8, 15, 28, 0.78)",
        border: "1.5px solid rgba(125, 211, 252, 0.35)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        fontFamily: FONTE,
        opacity: interpolate(frame, [aparece, aparece + 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame, [aparece, aparece + 14], ["90px 0px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        }),
      }}
    >
      <div style={{ width: 96, height: 96, flexShrink: 0 }}>{icone}</div>
      <div>
        <div style={{ fontSize: 46, fontWeight: 800, color: COR.gelo, lineHeight: 1.1 }}>{titulo}</div>
        <div style={{ fontSize: 26, fontWeight: 500, color: COR.texto, opacity: 0.85, marginTop: 6 }}>
          {subtitulo}
        </div>
      </div>
    </div>
  );
};

export const IconeNiveis: React.FC<{ nivel: number }> = ({ nivel }) => (
  <svg viewBox="0 0 96 96" width={96} height={96}>
    {[0, 1, 2].map((i) => (
      <rect
        key={i}
        x={14 + i * 26}
        y={62 - i * 20}
        width={18}
        height={22 + i * 20}
        rx={5}
        fill={COR.ciano}
        opacity={Math.min(1, Math.max(0.2, nivel - i))}
      />
    ))}
  </svg>
);

export const IconeSilencio: React.FC<{ onda: number }> = ({ onda }) => (
  <svg viewBox="0 0 96 96" width={96} height={96}>
    <path d="M 14 38 L 30 38 L 48 22 L 48 74 L 30 58 L 14 58 Z" fill={COR.ciano} />
    {[0, 1].map((i) => (
      <path
        key={i}
        d={`M ${60 + i * 12} ${34 - i * 8} Q ${70 + i * 16} 48 ${60 + i * 12} ${62 + i * 8}`}
        stroke={COR.gelo}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
        opacity={0.25 + 0.6 * Math.max(0, Math.sin(onda - i * 0.9))}
      />
    ))}
  </svg>
);

export const IconeBateria: React.FC<{ carga: number }> = ({ carga }) => (
  <svg viewBox="0 0 96 96" width={96} height={96}>
    <rect x={10} y={28} width={68} height={40} rx={8} stroke={COR.gelo} strokeWidth={5} fill="none" />
    <rect x={80} y={40} width={8} height={16} rx={3} fill={COR.gelo} />
    <rect x={17} y={35} width={54 * carga} height={26} rx={4} fill={COR.ciano} />
    <path d="M 46 30 L 34 50 L 46 50 L 40 66 L 56 44 L 44 44 L 50 30 Z" fill="#0b1220" opacity={0.85} />
  </svg>
);
