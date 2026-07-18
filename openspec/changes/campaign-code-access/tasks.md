## 1. Código e ciclo de vida da campanha

- [x] 1.1 Reforçar a geração e normalização de códigos alfanuméricos, mantendo compatibilidade com códigos existentes
- [x] 1.2 Implementar criação com verificação de colisão e novas tentativas no modo local
- [x] 1.3 Implementar criação atômica sem sobrescrita de campanha existente no modo Firebase
- [x] 1.4 Remover a criação automática de personagens e animal, inicializando `containers` e `items` vazios

## 2. Acesso sem login

- [x] 2.1 Ajustar a tela inicial para apresentar apelido e perfil como identificação local, sem linguagem ou controles de login
- [x] 2.2 Tornar a identificação local não bloqueante e fornecer um apelido padrão quando necessário
- [x] 2.3 Preservar a autenticação anônima automática e invisível quando o Firebase estiver configurado
- [x] 2.4 Manter entrada manual por código com normalização, mensagens de erro e reutilização do apelido local

## 3. URL e compartilhamento

- [x] 3.1 Implementar leitura e validação do parâmetro `campaign` com prioridade sobre a campanha salva na sessão
- [x] 3.2 Abrir automaticamente a campanha indicada na URL após inicializar o modo de dados, preservando a tela do fragmento
- [x] 3.3 Atualizar o parâmetro `campaign` ao criar ou entrar e removê-lo ao sair sem recarregar a página
- [x] 3.4 Alterar a ação de cópia para compartilhar uma URL canônica da campanha e oferecer fallback quando a Clipboard API falhar
- [x] 3.5 Informar ao usuário que links do modo local somente acessam dados da mesma origem e navegador

## 4. Grupo vazio e configuração

- [x] 4.1 Ajustar os estados vazios de Resumo, Inventário, Rações e Grupo para orientar o cadastro do primeiro integrante
- [x] 4.2 Garantir que ações dependentes de portadores permaneçam bloqueadas com mensagens específicas enquanto o grupo estiver vazio
- [x] 4.3 Verificar o cadastro e a edição de personagens com consumo diário de rações maior ou igual a zero
- [x] 4.4 Verificar o cadastro e a edição de animais com capacidade de carga maior ou igual a zero
- [x] 4.5 Confirmar que campanhas existentes preservam seus portadores, itens e configurações sem migração

## 5. Documentação e cache

- [x] 5.1 Atualizar o `README.md` com acesso por código/link, ausência de login visível e papel técnico da autenticação anônima
- [x] 5.2 Documentar a diferença entre compartilhamento local e sincronização Firebase e o modelo de acesso por posse do código
- [x] 5.3 Atualizar a versão do cache do service worker para distribuir os novos arquivos da interface

## 6. Verificação

- [x] 6.1 Testar criação local com grupo vazio, código único e URL atualizada
- [x] 6.2 Testar entrada manual, entrada automática por URL, prioridade sobre sessão, fragmento de tela, erro de código e saída
- [x] 6.3 Testar cópia de link, fallback de clipboard e aviso específico do modo local
- [x] 6.4 Testar em navegador novo o acesso por URL sem apelido salvo e confirmar ausência de solicitação de conta ou senha
- [x] 6.5 Testar cadastro, edição e persistência local de personagem com rações e animal com capacidade de carga
- [ ] 6.6 Testar no Firebase criação sem colisão, autenticação anônima invisível e sincronização do grupo entre dois clientes
