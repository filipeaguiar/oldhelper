## Why

Os jogadores devem acessar uma campanha compartilhada sem criar conta ou informar senha, usando apenas um código alfanumérico que também possa ser distribuído em um link. Além disso, campanhas novas precisam começar sem integrantes predefinidos para que cada grupo cadastre somente seus personagens e animais reais.

## What Changes

- Remover qualquer expectativa de login visível, cadastro de conta ou senha para jogadores e Mestre.
- Manter, quando o Firebase estiver ativo, autenticação anônima automática e transparente apenas como mecanismo técnico de acesso ao Firestore.
- Criar cada campanha com um código alfanumérico compartilhável.
- Permitir abrir e entrar automaticamente em uma campanha por parâmetro de URL, além da entrada manual pelo código.
- Disponibilizar uma ação para copiar um link da campanha, sem expor credenciais.
- Inicializar campanhas novas com o grupo vazio, sem personagens ou animais predefinidos.
- Permitir adicionar e editar personagens e animais de carga após a criação da campanha.
- Permitir configurar a capacidade de carga de cada animal.
- Permitir configurar o consumo diário de rações de cada personagem.
- Manter uma identificação local simples para atribuir entradas de histórico, sem transformá-la em autenticação ou conta.

## Capabilities

### New Capabilities
- `campaign-code-access`: Criação e acesso a campanhas por código alfanumérico, entrada por parâmetro de URL e compartilhamento por link sem login visível.
- `empty-group-setup`: Inicialização de grupos vazios e cadastro configurável de personagens e animais de carga.

### Modified Capabilities

Nenhuma.

## Impact

- Fluxos de entrada, criação, retomada e saída em `public/index.html` e `public/app.js`.
- Geração, normalização e leitura do código da campanha na URL e no armazenamento de sessão.
- Ação de compartilhamento da campanha e documentação de acesso.
- Criação de campanhas e estado vazio das telas Resumo, Inventário, Rações e Grupo.
- Formulários e modelo existentes de personagens e animais, incluindo carga e consumo de rações.
- Documentação e testes nos modos local e Firebase.
- As regras atuais do Firestore podem continuar exigindo autenticação anônima; tornar o banco público sem autenticação permanece fora do escopo por segurança.
