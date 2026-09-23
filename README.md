# Site — Boost Studio

Prototype funcional de um gerador de vídeos verticais com animações originais.

## Funcionalidades da V1

- Login protegido por sessão.
- Utilizador predefinido: @@BT@@admin@@BT@@
- Password predefinida: @@BT@@admin 123@@BT@@
- Editor com brawler, modo, pontos inicial/final, template e duração.
- Preview em tempo real num canvas 1080x1920.
- Motor de animação com vários templates.
- Geração de um plano de render via Flask.
- Exportação real no browser para @@BT@@.webm@@BT@@ através de @@BT@@MediaRecorder@@BT@@.
- Backend Python/Flask iniciado diretamente em **porta 80**.

## Arranque

@@BT@@@@BT@@@@BT@@bash
pip install -r requirements.txt
python app.py
@@BT@@@@BT@@@@BT@@

O servidor fica em:

@@BT@@http://0.0.0.0:80@@BT@@

Para alojamento, garante que a plataforma permite ao processo abrir a porta 80. Não uses 8080 para este projeto.

## Variáveis de ambiente

Podes substituir as credenciais de demonstração:

@@BT@@@@BT@@@@BT@@bash
ADMIN_USER=admin
ADMIN_PASSWORD=admin 123
SECRET_KEY=uma-chave-grande-e-aleatoria
@@BT@@@@BT@@@@BT@@

## Estrutura

@@BT@@@@BT@@@@BT@@text
.
├── app.py
├── requirements.txt
├── README.md
├── templates/
│   ├── login.html
│   └── index.html
└── static/
    ├── styles.css
    └── app.js
@@BT@@@@BT@@@@BT@@

## Nota sobre assets

A V1 usa gráficos e personagens desenhados no próprio canvas. Não depende de downloads de vídeos de terceiros nem de assets externos para funcionar. Isto deixa a base preparada para substituirmos os desenhos por assets próprios/licenciados numa fase seguinte.
