#!/usr/bin/env python3
"""Sintetiza a trilha de fundo e os efeitos sonoros (sem samples, sem download).

Lê src/narracao.json para acompanhar a estrutura do vídeo:
  cena 1 (problema): pad escuro e contido
  cenas 2 a 4: entra o arpejo e o grave, mais claro e otimista
  cena 5: acorde final sustentado e fade-out

Saídas em public/audio/: trilha.wav, whoosh.wav, liga.wav
Requisitos: python3 com numpy, ffmpeg
"""
import json
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parent.parent
PASTA = RAIZ / "public" / "audio"
SR = 48000
BPM = 96
TEMPO = 60 / BPM
COMPASSO = 4 * TEMPO
rng = np.random.default_rng(7)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def salvar(nome, estereo, loudness):
    PASTA.mkdir(parents=True, exist_ok=True)
    estereo = estereo / (np.max(np.abs(estereo)) + 1e-9) * 0.9
    pcm = (estereo * 32767).astype("<i2")
    with tempfile.TemporaryDirectory() as tmp:
        bruto = Path(tmp) / "bruto.wav"
        with wave.open(str(bruto), "wb") as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes(pcm.tobytes())
        subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(bruto),
                        "-af", f"loudnorm=I={loudness}:TP=-2:LRA=11", "-ar", str(SR),
                        "-c:a", "pcm_s16le", str(PASTA / nome)], check=True)


def envelope(n, ataque, soltura):
    env = np.ones(n)
    a, s = int(ataque * SR), int(soltura * SR)
    if a:
        env[:a] = np.linspace(0, 1, a)
    if s:
        env[-s:] *= np.linspace(1, 0, s)
    return env


def nota_pad(freq, dur, brilho, detune):
    t = np.arange(int(dur * SR)) / SR
    som = np.zeros_like(t)
    for k in range(1, 2 + brilho):
        som += np.sin(2 * np.pi * freq * k * (1 + detune) * t) / k ** 1.6
    return som


def pluck(freq, dur=0.6):
    t = np.arange(int(dur * SR)) / SR
    env = np.exp(-t / 0.22) * np.minimum(1, t / 0.004)
    return (np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * 2 * freq * t)) * env


def somar(destino, sinal, inicio):
    i = int(inicio * SR)
    if i >= len(destino):
        return
    fim = min(len(destino), i + len(sinal))
    destino[i:fim] += sinal[: fim - i]


def trilha(dados):
    fps = dados["fps"]
    total = dados["totalFrames"] / fps + 0.3
    cenas = dados["cenas"]
    t_produto = cenas[1]["inicioFrame"] / fps
    t_final = cenas[-1]["inicioFrame"] / fps

    n = int(total * SR)
    esq, dir_ = np.zeros(n), np.zeros(n)

    # Am - F - C - G (um compasso cada), notas do pad e baixo
    acordes = [
        ([57, 60, 64, 69], 45),
        ([53, 57, 60, 65], 41),
        ([55, 60, 64, 67], 48),
        ([55, 59, 62, 67], 43),
    ]
    t = 0.0
    i = 0
    while t < t_final + 0.5:
        notas, baixo = acordes[i % 4]
        claro = t >= t_produto - 0.2
        brilho = 4 if claro else 2
        dur = COMPASSO + 0.9
        for m in notas:
            env = envelope(int(dur * SR), 0.7, 0.9)
            vol = 0.22 if claro else 0.17
            somar(esq, nota_pad(hz(m), dur, brilho, -0.0018) * env * vol, t)
            somar(dir_, nota_pad(hz(m), dur, brilho, 0.0018) * env * vol, t)
        if claro:
            g = nota_pad(hz(baixo - 12), COMPASSO, 1, 0) * envelope(int(COMPASSO * SR), 0.05, 0.3) * 0.35
            somar(esq, g, t)
            somar(dir_, g, t)
            padrao = [0, 1, 2, 3, 2, 1, 2, 3]
            for passo, idx in enumerate(padrao):
                tn = t + passo * TEMPO / 2
                if t_produto <= tn < t_final + 1.2:
                    p = pluck(hz(notas[idx] + 12)) * 0.28
                    pan = 0.35 if passo % 2 else -0.35
                    somar(esq, p * (1 - pan), tn)
                    somar(dir_, p * (1 + pan), tn)
        t += COMPASSO
        i += 1

    # acorde final (C maior com 9ª) sustentado até o fim
    dur_final = total - (t_final + 0.4)
    for m in [48, 55, 60, 64, 67, 74]:
        env = envelope(int(dur_final * SR), 0.5, 2.2)
        somar(esq, nota_pad(hz(m), dur_final, 3, -0.002) * env * 0.2, t_final + 0.4)
        somar(dir_, nota_pad(hz(m), dur_final, 3, 0.002) * env * 0.2, t_final + 0.4)

    # eco estéreo cruzado para dar ambiência
    atraso = int(TEMPO * 0.75 * SR)
    for _ in range(3):
        e2, d2 = esq.copy(), dir_.copy()
        esq[atraso:] += d2[:-atraso] * 0.28
        dir_[atraso:] += e2[:-atraso] * 0.28

    esq *= envelope(n, 1.5, 1.0)
    dir_ *= envelope(n, 1.5, 1.0)
    salvar("trilha.wav", np.stack([esq, dir_], axis=1), -18)


def filtro_passa_banda(sinal, centros, q=1.4):
    saida = np.zeros_like(sinal)
    x1 = x2 = y1 = y2 = 0.0
    for i, (x, fc) in enumerate(zip(sinal, centros)):
        w0 = 2 * np.pi * fc / SR
        alpha = np.sin(w0) / (2 * q)
        a0 = 1 + alpha
        b0, b2 = alpha / a0, -alpha / a0
        a1, a2 = -2 * np.cos(w0) / a0, (1 - alpha) / a0
        y = b0 * x + b2 * x2 - a1 * y1 - a2 * y2
        x2, x1, y2, y1 = x1, x, y1, y
        saida[i] = y
    return saida


def whoosh():
    dur = 0.75
    n = int(dur * SR)
    t = np.arange(n) / SR
    pico = 0.48
    centros = np.where(t < pico, 300 + (t / pico) ** 1.5 * 3200, 3500 - (t - pico) / (dur - pico) * 2600)
    som = filtro_passa_banda(rng.standard_normal(n), centros)
    env = np.where(t < pico, (t / pico) ** 2.2, np.exp(-(t - pico) / 0.09))
    som *= env
    pan = np.linspace(-0.7, 0.7, n)
    salvar("whoosh.wav", np.stack([som * (1 - pan), som * (1 + pan)], axis=1), -20)


def liga():
    dur = 1.6
    n = int(dur * SR)
    t = np.arange(n) / SR
    varredura = 520 + 520 * np.minimum(t / 0.35, 1) ** 0.6
    fase = 2 * np.pi * np.cumsum(varredura) / SR
    corpo = (np.sin(fase) + 0.3 * np.sin(2 * fase)) * np.exp(-t / 0.45) * np.minimum(1, t / 0.01)
    brilho = np.zeros(n)
    for k, f in enumerate([2093, 2637, 3136]):
        ini = 0.12 + k * 0.07
        tt = np.clip(t - ini, 0, None)
        brilho += np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.35) * (t >= ini) * 0.35
    som = corpo * 0.7 + brilho
    esq, dir_ = som.copy(), som.copy()
    atraso = int(0.11 * SR)
    for _ in range(4):
        e2 = esq.copy()
        esq[atraso:] += dir_[:-atraso] * 0.3
        dir_[atraso:] += e2[:-atraso] * 0.3
    salvar("liga.wav", np.stack([esq, dir_], axis=1), -20)


if __name__ == "__main__":
    dados = json.loads((RAIZ / "src" / "narracao.json").read_text(encoding="utf-8"))
    trilha(dados)
    whoosh()
    liga()
    for arq in sorted(PASTA.glob("*.wav")):
        print(arq.relative_to(RAIZ))
