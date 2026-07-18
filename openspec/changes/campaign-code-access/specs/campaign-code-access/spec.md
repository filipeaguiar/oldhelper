## ADDED Requirements

### Requirement: Acesso sem login visível
O sistema SHALL permitir criar e acessar campanhas sem cadastro de conta, e-mail ou senha. Quando o Firebase estiver ativo, o sistema SHALL realizar autenticação anônima automaticamente sem apresentar esse processo como login ao usuário.

#### Scenario: Acessar no modo local
- **WHEN** o usuário cria ou abre uma campanha no modo local
- **THEN** o sistema não solicita conta, e-mail nem senha

#### Scenario: Acessar com Firebase
- **WHEN** o usuário abre a aplicação com Firebase configurado
- **THEN** o sistema autentica anonimamente em segundo plano e não exibe uma tela de login

### Requirement: Identificação local não bloqueante
O sistema SHALL permitir registrar um apelido local para atribuição do histórico, mas MUST NOT tratar esse apelido ou o perfil escolhido como credencial ou permissão. A ausência de apelido salvo MUST NOT impedir a abertura automática de uma campanha válida por URL.

#### Scenario: Acessar sem apelido salvo
- **WHEN** um usuário sem identificação local abre um link válido de campanha
- **THEN** o sistema entra na campanha usando uma identificação local padrão

#### Scenario: Reutilizar apelido
- **WHEN** um usuário que já definiu um apelido retorna à aplicação
- **THEN** o sistema reutiliza esse apelido para novas entradas de histórico

### Requirement: Código alfanumérico de campanha
O sistema SHALL atribuir a cada campanha nova um código alfanumérico normalizado em maiúsculas e SHALL evitar substituir uma campanha existente em caso de colisão.

#### Scenario: Criar campanha
- **WHEN** o usuário informa o nome de uma nova campanha e confirma a criação
- **THEN** o sistema cria a campanha com um código alfanumérico único e entra nela

#### Scenario: Colisão de código
- **WHEN** um código gerado já identifica outra campanha
- **THEN** o sistema gera outro código e não altera a campanha existente

### Requirement: Entrada manual pelo código
O sistema SHALL permitir que o usuário informe manualmente um código de campanha e SHALL normalizar letras minúsculas e caracteres inválidos antes de consultar a campanha.

#### Scenario: Código manual válido
- **WHEN** o usuário informa um código existente e confirma a entrada
- **THEN** o sistema abre a campanha correspondente

#### Scenario: Código manual inexistente
- **WHEN** o usuário informa um código que não identifica uma campanha
- **THEN** o sistema permanece na tela inicial e informa que a campanha não foi encontrada

### Requirement: Entrada por parâmetro de URL
O sistema SHALL reconhecer o parâmetro `campaign` da URL e tentar abrir automaticamente a campanha correspondente após inicializar o armazenamento local ou Firebase.

#### Scenario: Abrir link válido
- **WHEN** a aplicação é carregada com `?campaign=ABC123` e o código existe
- **THEN** o sistema entra automaticamente na campanha `ABC123` sem exigir confirmação

#### Scenario: Preservar tela indicada no fragmento
- **WHEN** a aplicação é carregada com um código válido e um fragmento de tela válido, como `?campaign=ABC123#inventario`
- **THEN** o sistema abre a campanha e seleciona a tela indicada

#### Scenario: Abrir link inválido
- **WHEN** a aplicação é carregada com um parâmetro de campanha inexistente ou malformado
- **THEN** o sistema exibe a tela inicial, mantém o código disponível para correção e informa o problema

### Requirement: URL acompanha a campanha ativa
O sistema SHALL atualizar o parâmetro `campaign` da URL ao criar ou entrar em uma campanha e SHALL removê-lo ao sair dela.

#### Scenario: Entrar manualmente
- **WHEN** o usuário entra em uma campanha digitando o código
- **THEN** a URL passa a conter o código normalizado no parâmetro `campaign`

#### Scenario: Sair da campanha
- **WHEN** o usuário aciona a saída da campanha
- **THEN** o sistema remove o parâmetro `campaign` da URL sem recarregar a página

### Requirement: Compartilhamento por link
O sistema SHALL oferecer uma ação que copie uma URL contendo o código da campanha ativa e SHALL comunicar a limitação de compartilhamento entre dispositivos quando estiver no modo local.

#### Scenario: Copiar link com Firebase
- **WHEN** o usuário copia o acesso de uma campanha no modo Firebase
- **THEN** o sistema coloca na área de transferência uma URL com o parâmetro `campaign` e confirma a ação

#### Scenario: Copiar link no modo local
- **WHEN** o usuário copia o acesso de uma campanha no modo local
- **THEN** o sistema fornece a URL e informa que ela só acessará dados existentes na mesma origem e navegador

#### Scenario: Área de transferência indisponível
- **WHEN** o navegador não permite escrita na área de transferência
- **THEN** o sistema apresenta o link para que o usuário possa copiá-lo manualmente

### Requirement: Compatibilidade de retomada
O sistema SHALL continuar aceitando a retomada da última campanha pela sessão quando não houver parâmetro de campanha na URL e SHALL dar prioridade ao código explicitamente fornecido na URL.

#### Scenario: URL e sessão diferentes
- **WHEN** existe uma campanha salva na sessão e a URL contém outro código
- **THEN** o sistema tenta abrir a campanha indicada pela URL

#### Scenario: Somente sessão
- **WHEN** não há parâmetro de campanha e existe uma campanha válida salva na sessão
- **THEN** o sistema retoma a campanha salva
