# FrescoKey: comercial em vídeo (Remotion)

Comercial de ~38 s do FrescoKey (teclado + mouse com ventiladores), feito 100% em código:
cenas 3D (Three.js), narração em português, legendas sincronizadas, trilha e efeitos sonoros.

O vídeo pronto fica em `entrega/FrescoKey.mp4`.

## Rodar na sua máquina

```bash
npm install          # instala as dependências (só na primeira vez)
npm run dev          # abre o Remotion Studio no navegador, com preview e timeline
npx remotion render FrescoKey out/FrescoKey.mp4   # exporta o MP4
```

## Como o projeto está organizado

| Pasta / arquivo | O que tem |
| --- | --- |
| `src/FrescoKey.tsx` | Composição principal: ordem das cenas, transições, narração, trilha e efeitos |
| `src/cenas/` | Uma cena por arquivo (problema, produto, funcionamento, diferenciais, encerramento) |
| `src/3d/` | Modelos 3D feitos em código: teclado, ventilador, mouse, mãos, câmera e luzes |
| `src/ui/` | Elementos 2D sobre o vídeo: legendas, logo, cartões de especificação, etapas |
| `src/narracao.json` | Linha do tempo gerada: duração de cada cena e tempo de cada legenda |
| `public/narracao/` | Áudio da narração de cada cena |
| `public/audio/` | Trilha de fundo e efeitos sonoros |
| `scripts/` | Scripts Python que geram narração, linha do tempo, trilha e efeitos |

## Mudar o texto da narração

A duração de cada cena acompanha o tamanho da fala, então basta editar o texto e gerar de novo.

1. Edite os trechos em `scripts/gerar_narracao.py` (lista `CENAS`). Cada trecho tem o texto
   da legenda e o texto falado, que pode ter grafia fonética (ex.: "Fresco Quí").
2. Gere a narração e a linha do tempo de novo:
   ```bash
   sudo apt install rhvoice rhvoice-brazilian-portuguese ffmpeg   # só na primeira vez (Ubuntu/Debian)
   python3 scripts/gerar_narracao.py
   python3 scripts/gerar_trilha.py   # refaz a trilha para a nova duração (precisa de numpy)
   ```

A voz é a Letícia, do RHVoice (gratuita e offline), e soa sintética. Para uma voz mais
natural, grave a sua ou use um serviço de voz neural, salve os arquivos com os mesmos nomes
em `public/narracao/` e ajuste em `src/narracao.json` as durações e os tempos das legendas.

## Usar clipes do Kling no lugar do 3D

Os prompts originais do roteiro continuam válidos. Gere os clipes no Kling, salve em
`public/clipes/cena1.mp4` etc., e dentro da cena troque o `<ThreeCanvas>` por:

```tsx
import { Video } from "@remotion/media";
<Video src={staticFile("clipes/cena1.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
```

Legendas, logo, cartões, narração e trilha continuam funcionando por cima.
