import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import type { Legenda } from "../dados";
import { FONTE } from "../estilo";

export const Legendas: React.FC<{ legendas: Legenda[] }> = ({ legendas }) => {
  const frame = useCurrentFrame();
  const atual = [...legendas].reverse().find((l) => frame >= l.inicioFrame);
  if (!atual || frame > atual.fimFrame + 10) {
    return null;
  }

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 70 }}>
      <div
        key={atual.texto}
        style={{
          fontFamily: FONTE,
          fontWeight: 600,
          fontSize: 46,
          lineHeight: 1.3,
          color: "#ffffff",
          textAlign: "center",
          maxWidth: 1500,
          padding: "14px 34px",
          borderRadius: 18,
          backgroundColor: "rgba(4, 8, 16, 0.62)",
          textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          opacity:
            interpolate(frame, [atual.inicioFrame, atual.inicioFrame + 5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }) *
            interpolate(frame, [atual.fimFrame + 3, atual.fimFrame + 10], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          translate: interpolate(frame, [atual.inicioFrame, atual.inicioFrame + 8], ["0px 14px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          }),
        }}
      >
        {atual.texto}
      </div>
    </AbsoluteFill>
  );
};
