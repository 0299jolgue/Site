# Site — Boost Studio · V3

## V3: arranque e deploy mais robustos

A V3 mantém o Match-End Composer da V2 e corrige a camada de arranque para evitar 502 causados por porta/processo.

### O que foi corrigido

- HOST mantém 0.0.0.0;
- a porta vem de PORT quando o ambiente fornece essa variável;
- a porta padrão continua a ser 80;
- a porta é validada antes do arranque;
- foi adicionado Gunicorn para execução de produção;
- foi adicionado um Procfile com comando web explícito;
- /health continua público para verificações de saúde;
- login, compositor, PNG e WebM continuam iguais à V2.

A Shard Cloud confirma suporte a aplicações Python, deploy por GitHub e monitorização de logs/saúde da aplicação.

## Login

Utilizador: admin

Password: admin123

## Porta

A aplicação usa PORT quando fornecida pelo ambiente. Sem essa variável, usa porta 80.

Isto permite funcionar tanto no requisito de porta 80 do projeto como em ambientes que atribuem uma porta interna dinamicamente.

## Arranque local

pip install -r requirements.txt
python app.py

## Arranque de produção

O Procfile usa:

web: gunicorn --bind 0.0.0.0:${PORT:-80} app:app

## Health check

GET /health devolve a versão e a porta efetivamente usada.

## Produto

O produto continua a ser um Match-End Composer estático:

- frame-base local;
- quatro slots de ícones/overlays;
- valores editáveis;
- exportação PNG;
- exportação WebM estática de 4 segundos;
- sem API externa para os assets.

Os assets devem ser do utilizador ou ter licença/permissão adequada.

## Versão

V3 — ACTIVE
