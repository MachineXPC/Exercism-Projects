#!/usr/bin/env python3
"""Gera a narração com a voz Letícia (RHVoice) e calcula a linha do tempo do vídeo.

Saídas:
  public/narracao/cenaN-<id>.wav  áudio de cada cena, já tratado e normalizado
  src/narracao.json               duração das cenas e tempos das legendas (em frames)

Requisitos (Ubuntu/Debian):
  sudo apt install rhvoice rhvoice-brazilian-portuguese ffmpeg
"""
import json
import math
import re
import subprocess
import tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PASTA_AUDIO = RAIZ / "public" / "narracao"
ARQ_JSON = RAIZ / "src" / "narracao.json"

VOZ = "Leticia-F123"
VELOCIDADE = 115  # 100 = normal; 115 dá ritmo de comercial sem atropelar

FPS = 30
TRANSICAO = 15  # frames de sobreposição entre cenas
ENTRADA = 10  # respiro antes da fala começar
ENTRADA_PRIMEIRA = 18
SAIDA = 20  # respiro depois da fala
SAIDA_ULTIMA = 75  # tempo extra para segurar a tela final

# Cada trecho vira uma legenda: (texto exibido, texto falado).
# O texto falado usa grafia fonética para a voz acertar marca, sigla e números.
CENAS = [
    {
        "id": "problema",
        "trechos": [
            ("Quem passa horas no computador", "Quem passa horas no computador"),
            ("conhece o problema:", "conhece o problema:"),
            ("as mãos suam e o teclado fica desconfortável.",
             "as mãos suam e o teclado fica desconfortável."),
        ],
    },
    {
        "id": "produto",
        "trechos": [
            ("Apresentamos o FrescoKey:", "Apresentamos o Fresco Quí:"),
            ("um teclado com dois ventiladores silenciosos embutidos",
             "um teclado com dois ventiladores silenciosos embutidos"),
            ("e um mouse com ventilador integrado.", "e um máuse com ventilador integrado."),
        ],
    },
    {
        "id": "funcionamento",
        "trechos": [
            ("Os ventiladores puxam ar pelas frestas da carcaça",
             "Os ventiladores puxam ar pelas frestas da carcaça"),
            ("e ajudam a dissipar o calor das mãos,", "e ajudam a dissipar o calor das mãos,"),
            ("mantendo a região mais seca durante o uso.",
             "mantendo a região mais seca durante o uso."),
        ],
    },
    {
        "id": "diferenciais",
        "trechos": [
            ("Com 3 níveis de velocidade,", "Com três níveis de velocidade,"),
            ("operação abaixo de 30 decibéis", "operação abaixo de trinta decibéis,"),
            ("e bateria recarregável por USB-C", "e bateria recarregável por u ésse bê cê,"),
            ("com cerca de 8 horas de uso,", "com cerca de oito horas de uso,"),
            ("você trabalha ou joga com mais conforto.",
             "você trabalha ou joga com mais conforto."),
        ],
    },
    {
        "id": "encerramento",
        "trechos": [
            ("FrescoKey.", "Fresco Quí."),
            ("Mais conforto para suas longas horas no computador.",
             "Mais conforto para suas longas horas no computador."),
        ],
    },
]

FILTRO = ",".join([
    "silenceremove=start_periods=1:start_threshold=-50dB",
    "areverse",
    "silenceremove=start_periods=1:start_threshold=-50dB",
    "areverse",
    "highpass=f=70",
    "equalizer=f=3200:t=q:w=1.2:g=2",
    "acompressor=threshold=-20dB:ratio=3:attack=5:release=90",
    "loudnorm=I=-16:TP=-1.5:LRA=7",
])


def rodar(cmd, entrada=None):
    return subprocess.run(cmd, input=entrada, check=True, capture_output=True)


def duracao(arquivo):
    saida = rodar(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                   "-of", "csv=p=0", str(arquivo)])
    return float(saida.stdout.decode().strip())


def pausas(arquivo):
    saida = rodar(["ffmpeg", "-hide_banner", "-i", str(arquivo), "-af",
                   "silencedetect=noise=-40dB:d=0.06", "-f", "null", "-"])
    log = saida.stderr.decode()
    inicios = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]
    fins = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
    return [(a + b) / 2 for a, b in zip(inicios, fins)]


def alinhar(trechos, total, meios_pausa):
    """Estima onde cada trecho começa pelo nº de letras e ajusta para a pausa mais próxima."""
    letras = [len(falado) for _, falado in trechos]
    soma = sum(letras)
    fronteiras = [0.0]
    acumulado = 0
    usadas = set()
    for n in letras[:-1]:
        acumulado += n
        estimada = total * acumulado / soma
        candidatas = [(abs(m - estimada), m) for m in meios_pausa
                      if m not in usadas and m > fronteiras[-1] + 0.3 and abs(m - estimada) < 0.5]
        if candidatas:
            _, escolhida = min(candidatas)
            usadas.add(escolhida)
            fronteiras.append(escolhida)
        else:
            fronteiras.append(max(estimada, fronteiras[-1] + 0.3))
    fronteiras.append(total)
    return list(zip(fronteiras[:-1], fronteiras[1:]))


def main():
    PASTA_AUDIO.mkdir(parents=True, exist_ok=True)
    cenas_json = []
    inicio = 0

    with tempfile.TemporaryDirectory() as tmp:
        for i, cena in enumerate(CENAS):
            nome = f"cena{i + 1}-{cena['id']}.wav"
            bruto = Path(tmp) / f"bruto{i}.wav"
            final = PASTA_AUDIO / nome
            texto = " ".join(falado for _, falado in cena["trechos"])

            rodar(["RHVoice-test", "-p", VOZ, "-r", str(VELOCIDADE), "-o", str(bruto)],
                  entrada=texto.encode())
            rodar(["ffmpeg", "-y", "-hide_banner", "-i", str(bruto), "-af", FILTRO,
                   "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", str(final)])

            fala = duracao(final)
            entrada = ENTRADA_PRIMEIRA if i == 0 else ENTRADA
            saida = SAIDA_ULTIMA if i == len(CENAS) - 1 else SAIDA
            fala_frames = math.ceil(fala * FPS)
            dur_cena = entrada + fala_frames + saida

            legendas = []
            for (exibido, _), (a, b) in zip(cena["trechos"], alinhar(cena["trechos"], fala, pausas(final))):
                legendas.append({
                    "texto": exibido,
                    "inicioFrame": entrada + round(a * FPS),
                    "fimFrame": entrada + round(b * FPS),
                })

            cenas_json.append({
                "id": cena["id"],
                "audio": f"narracao/{nome}",
                "inicioFrame": inicio,
                "duracaoFrames": dur_cena,
                "falaInicioFrame": entrada,
                "falaDuracaoFrames": fala_frames,
                "legendas": legendas,
            })
            print(f"{nome}: fala {fala:.2f}s, cena {dur_cena / FPS:.2f}s")
            inicio += dur_cena - TRANSICAO

    total = cenas_json[-1]["inicioFrame"] + cenas_json[-1]["duracaoFrames"]
    dados = {"fps": FPS, "transicaoFrames": TRANSICAO, "totalFrames": total, "cenas": cenas_json}
    ARQ_JSON.write_text(json.dumps(dados, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Total: {total} frames ({total / FPS:.2f}s) -> {ARQ_JSON.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
