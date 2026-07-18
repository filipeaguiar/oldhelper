# Item Transfer Dialog Specification

## Purpose

Definir a experiência de transferência individual de itens, incluindo seleção visual de destino, divisão de pilhas, proteção da hierarquia e persistência consistente.

## Requirements

### Requirement: Diálogo de transferência individual
O sistema SHALL abrir um diálogo integrado à aplicação ao solicitar a transferência individual de um item e SHALL apresentar somente destinos válidos diferentes do destino atual.

#### Scenario: Abrir transferência com destinos disponíveis
- **WHEN** o usuário aciona a transferência individual de um item que possui outro destino válido
- **THEN** o sistema abre o diálogo com a identificação do item, as opções de destino e ações para confirmar ou cancelar

#### Scenario: Item sem outro destino válido
- **WHEN** o usuário aciona a transferência individual de um item sem outro destino válido
- **THEN** o sistema não abre o diálogo e informa que não há destino disponível

#### Scenario: Cancelar transferência
- **WHEN** o usuário cancela ou fecha o diálogo de transferência
- **THEN** o sistema mantém o item, sua quantidade e sua localização inalterados

### Requirement: Seleção visual e acessível de destino
O sistema SHALL representar cada destino válido por um radio button nativo com apresentação visual personalizada e SHALL comunicar o nome e o tipo do destino.

#### Scenario: Navegar pelos destinos
- **WHEN** o foco está na lista de destinos
- **THEN** o usuário consegue percorrer e selecionar uma única opção usando teclado ou toque

#### Scenario: Destino é item contêiner
- **WHEN** uma opção representa um item contêiner
- **THEN** o diálogo identifica visualmente o item e o portador principal ao qual ele pertence

### Requirement: Animal de carga pré-selecionado
O sistema SHALL pré-selecionar o primeiro animal de carga disponível como destino direto e, se não houver animal válido, SHALL pré-selecionar o primeiro destino válido.

#### Scenario: Animal válido disponível
- **WHEN** o diálogo abre e existe ao menos um animal de carga entre os destinos diretos válidos
- **THEN** o primeiro animal de carga disponível aparece selecionado

#### Scenario: Nenhum animal válido disponível
- **WHEN** o diálogo abre sem animal de carga entre os destinos diretos válidos
- **THEN** a primeira opção de destino válido aparece selecionada

### Requirement: Seleção de quantidade
O sistema SHALL permitir escolher uma quantidade inteira entre um e o total disponível quando um item divisível possuir mais de uma unidade e SHALL iniciar o campo com a quantidade total.

#### Scenario: Transferir parte de uma pilha
- **WHEN** um item divisível possui mais de uma unidade e o usuário informa uma quantidade válida menor que o total
- **THEN** o sistema mantém a quantidade restante na origem e cria uma nova pilha equivalente no destino com a quantidade informada

#### Scenario: Transferir a quantidade total
- **WHEN** o usuário confirma uma quantidade igual ao total disponível
- **THEN** o sistema move o item integralmente para o destino sem criar uma pilha adicional

#### Scenario: Quantidade inválida
- **WHEN** o usuário tenta confirmar zero, valor fracionário ou valor maior que a quantidade disponível
- **THEN** o sistema rejeita a transferência e orienta o usuário a informar uma quantidade válida

#### Scenario: Item com uma unidade
- **WHEN** o item possui somente uma unidade
- **THEN** o diálogo não exige escolha de quantidade e transfere a unidade integralmente

### Requirement: Proteção da hierarquia na transferência parcial
O sistema MUST impedir a divisão parcial de um item que possua descendentes e SHALL preservar a transferência integral de sua subárvore.

#### Scenario: Contêiner com conteúdo e múltiplas unidades
- **WHEN** um item com descendentes possui mais de uma unidade e o diálogo é aberto
- **THEN** o sistema fixa a transferência na quantidade total e informa que o conteúdo será transferido junto

#### Scenario: Confirmar item com descendentes
- **WHEN** o usuário confirma a transferência de um item que possui descendentes
- **THEN** o sistema move o item e toda a sua subárvore para o destino, preservando as relações internas

### Requirement: Persistência e histórico da transferência
O sistema SHALL aplicar transferências integrais e parciais de modo consistente nos modos local e Firebase e SHALL registrar item, quantidade, origem e destino no histórico.

#### Scenario: Persistir transferência parcial local
- **WHEN** uma transferência parcial é confirmada no modo local
- **THEN** a redução da pilha original e a criação da nova pilha são salvas antes da atualização da interface

#### Scenario: Persistir transferência parcial no Firebase
- **WHEN** uma transferência parcial é confirmada no modo Firebase
- **THEN** o sistema atualiza a pilha original e cria a nova pilha em um único batch

#### Scenario: Registrar transferência
- **WHEN** uma transferência é concluída
- **THEN** o histórico informa a quantidade transferida, o nome do item, a origem e o destino
