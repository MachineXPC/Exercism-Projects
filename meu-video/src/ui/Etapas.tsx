import { Fragment } from "react";
import { interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { COR, FONTE } from "../estilo";

// Faixa horizontal em que a etapa atual acende conforme a narração avança.
export const Etapas: React.FC<{ etapas: { texto: string; inicio: number }[] }> = ({ etapas }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26, fontFamily: FONTE }}>
      {etapas.map((etapa, i) => {
        const proxima = etapas[i + 1]?.inicio;
        const ativa = interpolate(frame, [etapa.inicio, etapa.inicio + 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const passou =
          proxima === undefined
            ? 0
            : interpolate(frame, [proxima, proxima + 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
        const destaque = ativa * (1 - passou * 0.6);
        return (
          <Fragment key={etapa.texto}>
            {i > 0 ? (
              <div style={{ width: 50, height: 3, borderRadius: 2, backgroundColor: COR.ciano, opacity: 0.2 + 0.6 * ativa }} />
            ) : null}
            <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: 0.35 + 0.65 * ativa }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  fontWeight: 800,
                  color: interpolateColors(destaque, [0, 1], [COR.textoSuave, "#04111d"]),
                  backgroundColor: interpolateColors(destaque, [0, 1], ["rgba(148,163,184,0.18)", COR.ciano]),
                  boxShadow: `0 0 ${34 * destaque}px rgba(56,189,248,${0.7 * destaque})`,
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontSize: 34, fontWeight: 700, color: COR.texto, whiteSpace: "nowrap" }}>{etapa.texto}</div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
};
