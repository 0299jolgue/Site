# Site — Boost Studio · V2

## O que mudou

A V2 corrige o problema principal da V1: isto **não é uma animação genérica**.

O produto agora é um **Match-End Composer**. A saída é um ecrã final de partida composto por:

1. um **frame-base** (podes carregar PNG/JPG/WEBP do teu próprio ficheiro);
2. overlays de ícones;
3. brawler;
4. tipo de resultado;
5. pontos antes/depois;
6. elementos de vitória/rank.

Tudo é desenhado localmente no browser, sem API externa.

## Login

Utilizador: `admin`

Password: `admin123`

## Porta

`app.py` usa **porta 80**. Não usa 8080.

## Exportação

- PNG: frame final estático.
- WebM: vídeo estático de 4 segundos com o mesmo frame final.

O WebM existe para manter o fluxo de publicação em vídeo, mas a composição em si não introduz animações artificiais.

## Assets

A V2 não inventa um frame de partida real nem descarrega vídeos de terceiros. Para teres fidelidade visual, carrega na área "Frame base" um screenshot/frame que tenhas direito de utilizar.

Os quatro slots de ícones funcionam localmente:
- Brawler icon
- Victory icon
- Points icon
- Avatar / badge

## Arranque

```bash
pip install -r requirements.txt
python app.py
```

## Health check

`GET /health` devolve a versão e a porta configurada.

## Versão

**V2**
