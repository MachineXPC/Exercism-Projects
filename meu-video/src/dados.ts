import narracao from "./narracao.json";

export type Legenda = {
  texto: string;
  inicioFrame: number;
  fimFrame: number;
};

export type DadosCena = {
  id: string;
  audio: string;
  inicioFrame: number;
  duracaoFrames: number;
  falaInicioFrame: number;
  falaDuracaoFrames: number;
  legendas: Legenda[];
};

// Gerado por scripts/gerar_narracao.py: mudou o texto, rode o script de novo.
export const linhaDoTempo: {
  fps: number;
  transicaoFrames: number;
  totalFrames: number;
  cenas: DadosCena[];
} = narracao;

export const cena = (id: string): DadosCena => {
  const encontrada = linhaDoTempo.cenas.find((c) => c.id === id);
  if (!encontrada) {
    throw new Error(`Cena "${id}" não existe em narracao.json`);
  }
  return encontrada;
};
