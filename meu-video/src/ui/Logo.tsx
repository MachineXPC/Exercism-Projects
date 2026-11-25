import { COR, FONTE } from "../estilo";

// Ícone de ventoinha + nome da marca. "giro" em graus.
export const Logo: React.FC<{
  tamanho: number;
  corTexto: string;
  giro: number;
  style?: React.CSSProperties;
}> = ({ tamanho, corTexto, giro, style }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: tamanho * 0.28,
        fontFamily: FONTE,
        fontWeight: 800,
        fontSize: tamanho,
        letterSpacing: -tamanho * 0.02,
        ...style,
      }}
    >
      <svg width={tamanho * 1.05} height={tamanho * 1.05} viewBox="-50 -50 100 100">
        <circle r={46} fill="none" stroke={COR.ciano} strokeWidth={6} />
        <g style={{ rotate: `${giro}deg` }}>
          {[0, 72, 144, 216, 288].map((a) => (
            <path
              key={a}
              d="M 0 -6 C 8 -22, 26 -30, 34 -20 C 24 -18, 14 -10, 6 0 Z"
              fill={COR.gelo}
              style={{ rotate: `${a}deg` }}
            />
          ))}
          <circle r={8} fill={COR.ciano} />
        </g>
      </svg>
      <span style={{ color: corTexto }}>
        Fresco<span style={{ color: COR.ciano }}>Key</span>
      </span>
    </div>
  );
};
