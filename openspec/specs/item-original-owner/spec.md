# Item Original Owner Specification

## Purpose

Definir como itens carregados por animais preservam a referência ao portador de origem, permitindo identificação e devolução rápida ao dono.

## Requirements

### Requirement: Registro do dono anterior ao animal
O sistema SHALL registrar em cada item o portador não animal de origem quando o item for transferido para um animal de carga e SHALL preservar essa referência enquanto o item permanecer sob portadores animais.

#### Scenario: Transferir de personagem para animal
- **WHEN** um item é transferido de um personagem para um animal de carga
- **THEN** o sistema registra o personagem de origem como dono original do item

#### Scenario: Transferir de depósito para animal
- **WHEN** um item é transferido de um depósito para um animal de carga
- **THEN** o sistema registra o depósito de origem como referência de dono original

#### Scenario: Transferir entre animais
- **WHEN** um item com dono original registrado é transferido de um animal para outro
- **THEN** o sistema preserva a referência existente

#### Scenario: Item sai do animal
- **WHEN** um item é transferido de um animal para um portador não animal
- **THEN** o sistema remove a referência de dono original da parte transferida

### Requirement: Referência por item em todos os fluxos
O sistema SHALL aplicar a regra de dono original às transferências individuais integrais e parciais, às transferências em massa e a cada item de uma subárvore transferida.

#### Scenario: Transferência parcial para animal
- **WHEN** parte de uma pilha é transferida de um portador não animal para um animal
- **THEN** a nova pilha no animal referencia o portador de origem e a pilha restante na origem permanece sem alteração de propriedade

#### Scenario: Devolução parcial ao dono
- **WHEN** parte de uma pilha em um animal é transferida para um portador não animal
- **THEN** a nova pilha entregue não mantém a referência e o restante no animal continua associado ao dono original

#### Scenario: Transferência em massa com origens diferentes
- **WHEN** itens de diferentes portadores são transferidos em massa para um animal
- **THEN** cada item registra seu próprio portador de origem

#### Scenario: Transferir contêiner com conteúdo
- **WHEN** um item contêiner e seus descendentes são transferidos integralmente para ou a partir de um animal
- **THEN** o sistema atualiza a referência de dono original de cada item movido segundo sua origem e destino

### Requirement: Identificação visual do dono
O sistema SHALL exibir uma indicação textual com o nome atual do dono original para itens que estejam com um animal e possuam uma referência válida.

#### Scenario: Exibir item com dono válido
- **WHEN** o inventário renderiza um item em um animal e seu dono original ainda existe
- **THEN** os metadados do item mostram “Dono: ” seguido do nome atual do portador referenciado

#### Scenario: Referência ausente ou inválida
- **WHEN** o item não possui dono original ou o portador referenciado não existe
- **THEN** o sistema não mostra a indicação de dono e mantém as demais informações e ações utilizáveis

### Requirement: Dono pré-selecionado para devolução
O sistema SHALL pré-selecionar o dono original como destino direto ao abrir a transferência de um item que está com um animal, desde que esse destino seja válido. Se não for válido, o sistema SHALL aplicar a seleção padrão existente.

#### Scenario: Devolver ao dono disponível
- **WHEN** o diálogo abre para um item em um animal e o dono original aparece entre os destinos diretos válidos
- **THEN** o radio button desse dono aparece selecionado

#### Scenario: Dono indisponível
- **WHEN** o diálogo abre para um item cuja referência aponta para um portador ausente ou para um destino inválido
- **THEN** o sistema pré-seleciona o primeiro animal direto válido ou, na ausência dele, o primeiro destino válido

### Requirement: Compatibilidade e persistência
O sistema SHALL persistir a referência de dono original nos modos local e Firebase, SHALL incluí-la em exportações e importações e SHALL aceitar itens anteriores sem esse campo.

#### Scenario: Carregar item legado
- **WHEN** o sistema carrega um item criado antes da referência de dono original
- **THEN** o item recebe uma referência vazia e continua utilizável

#### Scenario: Editar item referenciado
- **WHEN** o usuário edita e salva um item que possui dono original sem alterar seu portador pelo fluxo de transferência
- **THEN** o sistema preserva a referência existente

#### Scenario: Exportar e importar referência
- **WHEN** uma campanha com itens referenciados é exportada e posteriormente importada
- **THEN** as associações com donos existentes são restauradas
