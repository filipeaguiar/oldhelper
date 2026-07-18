# Item Load Visibility Specification

## Purpose

Definir como o inventário identifica e apresenta itens que não adicionam carga ao portador, preservando acessibilidade, hierarquia e estados da interface.

## Requirements

### Requirement: Identificação de item sem carga
O sistema SHALL classificar como sem carga todo item que não pertença à categoria `Moeda` e cuja carga configurada por unidade seja zero. A classificação SHALL ser independente da quantidade atual do item.

#### Scenario: Item comum com carga unitária zero
- **WHEN** o inventário exibe um item que não é moeda e possui carga por unidade igual a zero
- **THEN** o sistema classifica esse item como sem carga

#### Scenario: Item com quantidade zero e carga unitária positiva
- **WHEN** o inventário exibe um item com quantidade igual a zero e carga por unidade maior que zero
- **THEN** o sistema não classifica esse item como sem carga

#### Scenario: Moeda usa regra própria de carga
- **WHEN** o inventário exibe um item da categoria `Moeda`
- **THEN** o sistema não o classifica como sem carga e mantém a indicação da regra de 1 carga por 100 moedas

### Requirement: Distinção visual acessível
O sistema SHALL aplicar uma distinção visual à linha de cada item classificado como sem carga e SHALL exibir o indicador textual “sem carga”, sem depender exclusivamente de cor para comunicar essa condição.

#### Scenario: Exibir item sem carga
- **WHEN** uma linha de item classificado como sem carga é renderizada
- **THEN** a linha recebe o tratamento visual específico e seus metadados mostram o indicador “sem carga” no lugar de “0 carga/un.”

#### Scenario: Exibir item que adiciona carga
- **WHEN** uma linha de item que adiciona carga é renderizada
- **THEN** a linha mantém o tratamento visual normal e mostra sua regra de carga atual

### Requirement: Compatibilidade com estados e organização do inventário
A distinção de item sem carga MUST preservar a legibilidade, os controles, a hierarquia de contêineres e a percepção do estado de seleção em diferentes tamanhos de tela.

#### Scenario: Selecionar item sem carga
- **WHEN** o usuário seleciona um item sem carga para transferência em massa
- **THEN** o estado selecionado permanece claramente perceptível sem remover o indicador de item sem carga

#### Scenario: Item sem carga dentro de contêiner
- **WHEN** um item sem carga está aninhado dentro de um item contêiner
- **THEN** o sistema mantém simultaneamente a indicação de nível hierárquico e a distinção de item sem carga

#### Scenario: Exibir em tela pequena
- **WHEN** o inventário é visualizado em um layout móvel
- **THEN** o indicador e o tratamento visual não ocultam nem impedem o uso das ações do item
