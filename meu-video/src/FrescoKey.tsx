import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, interpolate, staticFile } from "remotion";
import { Cena1Problema } from "./cenas/Cena1Problema";
import { Cena2Produto } from "./cenas/Cena2Produto";
import { Cena3Funcionamento } from "./cenas/Cena3Funcionamento";
import { Cena4Diferenciais } from "./cenas/Cena4Diferenciais";
import { Cena5Encerramento } from "./cenas/Cena5Encerramento";
import { linhaDoTempo } from "./dados";

const { cenas, totalFrames, transicaoFrames } = linhaDoTempo;
const [problema, produto, funcionamento, diferenciais, encerramento] = cenas;

const falas = cenas.map((c) => [c.inicioFrame + c.falaInicioFrame, c.inicioFrame + c.falaInicioFrame + c.falaDuracaoFrames]);

// Abaixa a música enquanto a narração fala.
const volumeTrilha = (f: number) => {
  const entradaSaida = interpolate(f, [0, 20, totalFrames - 40, totalFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fala = Math.max(
    ...falas.map(([a, b]) =>
      interpolate(f, [a - 8, a, b, b + 12], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    ),
  );
  return entradaSaida * (0.34 - 0.16 * fala);
};

const transicao = () => (
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: transicaoFrames })} />
);

export const FrescoKey: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="1 · O problema" durationInFrames={problema.duracaoFrames}>
          <Cena1Problema />
        </TransitionSeries.Sequence>
        {transicao()}
        <TransitionSeries.Sequence name="2 · O produto" durationInFrames={produto.duracaoFrames}>
          <Cena2Produto />
        </TransitionSeries.Sequence>
        {transicao()}
        <TransitionSeries.Sequence name="3 · Como funciona" durationInFrames={funcionamento.duracaoFrames}>
          <Cena3Funcionamento />
        </TransitionSeries.Sequence>
        {transicao()}
        <TransitionSeries.Sequence name="4 · Diferenciais" durationInFrames={diferenciais.duracaoFrames}>
          <Cena4Diferenciais />
        </TransitionSeries.Sequence>
        {transicao()}
        <TransitionSeries.Sequence name="5 · Encerramento" durationInFrames={encerramento.duracaoFrames}>
          <Cena5Encerramento />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Audio name="Trilha" src={staticFile("audio/trilha.wav")} volume={volumeTrilha} />
      {cenas.map((c) => (
        <Audio key={c.id} name={`Narração · ${c.id}`} src={staticFile(c.audio)} from={c.inicioFrame + c.falaInicioFrame} />
      ))}
      {cenas.slice(1).map((c) => (
        <Audio key={c.id} name={`Whoosh · ${c.id}`} src={staticFile("audio/whoosh.wav")} from={c.inicioFrame - 10} volume={0.45} />
      ))}
      <Audio
        name="Ventiladores ligando"
        src={staticFile("audio/liga.wav")}
        from={produto.inicioFrame + produto.legendas[1].inicioFrame - 6}
        volume={0.5}
      />
      <Audio name="Brilho final" src={staticFile("audio/liga.wav")} from={encerramento.inicioFrame + 8} volume={0.4} />
    </AbsoluteFill>
  );
};
