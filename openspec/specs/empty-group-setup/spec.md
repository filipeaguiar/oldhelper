# empty-group-setup Specification

## Purpose
TBD - created by archiving change campaign-code-access. Update Purpose after archive.
## Requirements
### Requirement: Campanha inicia com grupo vazio
O sistema SHALL criar campanhas sem personagens, animais de carga, depósitos ou itens predefinidos.

#### Scenario: Criar nova campanha
- **WHEN** o usuário cria uma campanha
- **THEN** o sistema inicia a campanha com zero portadores e zero itens

#### Scenario: Abrir campanha existente
- **WHEN** o usuário abre uma campanha criada antes desta mudança
- **THEN** o sistema preserva todos os portadores e itens já cadastrados

### Requirement: Estado vazio orienta a configuração
O sistema SHALL exibir um estado vazio útil quando a campanha não possuir portadores e SHALL orientar o usuário a adicionar um personagem ou animal antes de cadastrar itens ou planejar operações que dependam de portadores.

#### Scenario: Visualizar grupo vazio
- **WHEN** uma campanha sem portadores é aberta
- **THEN** a tela Grupo informa que não há integrantes e oferece ações para adicionar personagem ou animal de carga

#### Scenario: Tentar adicionar item sem portador
- **WHEN** o usuário tenta adicionar um item antes de cadastrar um portador
- **THEN** o sistema bloqueia a ação e orienta a adicionar um personagem ou animal

#### Scenario: Visualizar rações sem portadores
- **WHEN** a campanha não possui portadores
- **THEN** a área de rações informa que o grupo deve ser configurado antes do planejamento ou compra

### Requirement: Cadastro de personagem
O sistema SHALL permitir adicionar e editar personagens com nome e consumo diário de rações configurável como número maior ou igual a zero.

#### Scenario: Adicionar personagem
- **WHEN** o usuário cadastra um personagem com nome e consumo diário válidos
- **THEN** o sistema adiciona o personagem ao grupo e o disponibiliza como portador de itens

#### Scenario: Personagem que não consome rações
- **WHEN** o usuário configura o consumo diário do personagem como zero ou desativa seu consumo
- **THEN** o sistema exclui esse personagem do consumo diário usado no planejamento de rações

#### Scenario: Editar consumo diário
- **WHEN** o usuário altera o consumo diário de rações de um personagem
- **THEN** o sistema persiste o novo valor e o utiliza nos próximos cálculos

### Requirement: Cadastro de animal de carga
O sistema SHALL permitir adicionar e editar animais de carga com nome, subtipo e capacidade de carga maior ou igual a zero.

#### Scenario: Adicionar animal
- **WHEN** o usuário cadastra um animal com nome e capacidade válidos
- **THEN** o sistema adiciona o animal ao grupo e utiliza a capacidade informada no cálculo de carga

#### Scenario: Editar capacidade
- **WHEN** o usuário altera a capacidade de carga de um animal
- **THEN** o sistema persiste o novo valor e recalcula seu estado de carga e sobrecarga

### Requirement: Persistência consistente dos integrantes
O sistema SHALL persistir personagens e animais adicionados ou editados no armazenamento ativo e SHALL sincronizá-los entre clientes quando o Firebase estiver ativo.

#### Scenario: Persistir no modo local
- **WHEN** o usuário adiciona ou edita um integrante no modo local
- **THEN** o integrante permanece disponível após recarregar a aplicação no mesmo navegador

#### Scenario: Sincronizar no Firebase
- **WHEN** o usuário adiciona ou edita um integrante em uma campanha Firebase
- **THEN** os demais clientes conectados à mesma campanha recebem os dados atualizados

