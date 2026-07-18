## ADDED Requirements

### Requirement: Manifesto instalável com identidade completa
A aplicação SHALL fornecer um manifesto associado ao documento com identidade estável, modo de exibição independente, cores e ícones PNG nos tamanhos 192×192 e 512×512, incluindo um ícone apropriado para máscara.

#### Scenario: Navegador avalia a instalação
- **WHEN** um navegador compatível carrega a aplicação por HTTPS
- **THEN** ele encontra no manifesto os metadados e recursos necessários para reconhecer a aplicação como instalável

### Requirement: Banner contextual de instalação
A aplicação SHALL exibir um banner próprio de instalação somente quando o navegador disponibilizar um prompt programático e a aplicação ainda não estiver sendo executada em modo instalado.

#### Scenario: Instalação está disponível
- **WHEN** o navegador dispara `beforeinstallprompt` para uma aplicação não instalada
- **THEN** a aplicação apresenta um banner com ações acessíveis para instalar ou dispensar

#### Scenario: Instalação não está disponível
- **WHEN** não existe um prompt programático ou a aplicação está em modo `standalone`
- **THEN** a aplicação não apresenta o banner de instalação

### Requirement: Execução da instalação
A aplicação SHALL acionar o prompt preservado ao usuário escolher instalar e SHALL ocultar o banner após a resposta ou após receber a confirmação de instalação.

#### Scenario: Usuário aceita instalar
- **WHEN** o usuário ativa a ação de instalação e aceita o prompt do navegador
- **THEN** o prompt é consumido e o banner deixa de ser exibido

#### Scenario: Usuário recusa o prompt nativo
- **WHEN** o usuário ativa a ação de instalação e recusa o prompt do navegador
- **THEN** o prompt consumido é descartado e o banner deixa de ser exibido até que o navegador ofereça uma nova oportunidade

### Requirement: Dispensa não intrusiva
A aplicação SHALL permitir dispensar o banner e SHALL manter essa escolha durante a sessão atual.

#### Scenario: Usuário dispensa o banner
- **WHEN** o usuário ativa a ação de dispensar
- **THEN** o banner permanece oculto pelo restante da sessão sem impedir uma oferta em sessão futura

### Requirement: Recursos PWA disponíveis offline
O service worker SHALL armazenar os arquivos necessários à interface instalável, incluindo manifesto, ícones da aplicação e recursos da biblioteca de ícones, para reutilização sem rede após um carregamento bem-sucedido.

#### Scenario: Aplicação instalada fica sem conexão
- **WHEN** o usuário abre novamente a aplicação depois que os recursos foram armazenados e a rede está indisponível
- **THEN** a estrutura da aplicação e seus ícones continuam disponíveis pelo cache
