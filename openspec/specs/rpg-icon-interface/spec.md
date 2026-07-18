# rpg-icon-interface Specification

## Purpose
Definir uma iconografia RPG consistente, autocontida e acessível para controles, estados e navegação do Old Helper.

## Requirements

### Requirement: Iconografia RPG Awesome autocontida
A aplicação SHALL usar RPG Awesome hospedado nos próprios recursos estáticos para representar elementos decorativos e ações que atualmente são representados por caracteres Unicode, sempre que houver um ícone semanticamente adequado.

#### Scenario: Interface é carregada online
- **WHEN** qualquer tela da aplicação é renderizada
- **THEN** os elementos iconográficos usam glifos RPG Awesome com aparência consistente sem solicitar a biblioteca a uma CDN

#### Scenario: Interface é carregada offline
- **WHEN** a aplicação é reaberta sem rede após os recursos terem sido armazenados
- **THEN** os glifos RPG Awesome continuam sendo renderizados

### Requirement: Navegação principal baseada em ícones
A aplicação SHALL representar cada aba da navegação principal somente com um ícone RPG Awesome visível, sem o texto visível anterior, preservando um nome acessível equivalente para cada destino.

#### Scenario: Usuário visualiza a navegação
- **WHEN** a tela principal da campanha é exibida
- **THEN** cada destino de Resumo, Inventário, Rações e compras, Grupo e Histórico aparece como um controle iconográfico distinto

#### Scenario: Tecnologia assistiva percorre a navegação
- **WHEN** um leitor de tela ou outra tecnologia assistiva focaliza uma aba
- **THEN** o nome completo da seção e o estado da aba atual podem ser determinados

### Requirement: Controles iconográficos acessíveis
A aplicação SHALL fornecer nome acessível e indicação visual de foco para todo controle cuja identificação visível seja apenas um ícone.

#### Scenario: Usuário navega por teclado
- **WHEN** o foco alcança um botão somente com ícone
- **THEN** o botão apresenta foco perceptível e sua ação pode ser determinada pelo nome acessível

### Requirement: Semântica prevalece sobre substituição visual
A aplicação MUST preservar como texto os caracteres que expressem dados, operadores ou conteúdo necessário, substituindo apenas os caracteres usados como iconografia quando houver equivalente apropriado.

#### Scenario: Caractere Unicode faz parte do conteúdo
- **WHEN** um símbolo comunica um valor ou operação textual e não é mera representação visual de uma ação
- **THEN** ele permanece legível como conteúdo ou recebe uma alternativa textual semanticamente equivalente
