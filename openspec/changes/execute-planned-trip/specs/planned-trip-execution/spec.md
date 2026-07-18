## ADDED Requirements

### Requirement: Ação para realizar a viagem planejada
O sistema SHALL oferecer na aba da calculadora uma ação para realizar a viagem usando os participantes selecionados e a quantidade de dias informada, e SHALL calcular o consumo efetivo como o teto da soma dos consumos diários multiplicada pelos dias.

#### Scenario: Abrir confirmação de viagem válida
- **WHEN** o usuário aciona “Realizar viagem” com ao menos um participante e um número válido de dias
- **THEN** o sistema abre o diálogo de confirmação com os dados atuais do planejamento

#### Scenario: Planejamento sem participante
- **WHEN** o usuário tenta realizar uma viagem sem participante selecionado
- **THEN** o sistema não permite a confirmação e orienta a selecionar ao menos um participante

#### Scenario: Margem não é consumida
- **WHEN** o planejamento possui margem de segurança maior que zero
- **THEN** o consumo da viagem considera somente o consumo base dos participantes durante os dias informados

### Requirement: Diálogo de confirmação da viagem
O sistema SHALL apresentar no diálogo os participantes selecionados, os dias da viagem, o consumo de cada participante, o total de rações necessário e o estoque elegível disponível, além de ações para confirmar ou cancelar.

#### Scenario: Revisar participantes e dias
- **WHEN** o diálogo de confirmação é aberto
- **THEN** ele lista os participantes selecionados e mostra a quantidade de dias que será realizada

#### Scenario: Cancelar realização
- **WHEN** o usuário cancela ou fecha o diálogo
- **THEN** o sistema mantém todas as quantidades de rações e o histórico inalterados

#### Scenario: Dados mudam antes da confirmação
- **WHEN** participantes, dias ou estoque mudam entre a abertura e a confirmação
- **THEN** o sistema recalcula e valida os dados atuais antes de aplicar qualquer débito

### Requirement: Prioridade das fontes de ração
O sistema SHALL consumir primeiro as pilhas de ração armazenadas em animais de carga e SHALL consumir depois as pilhas armazenadas nos personagens selecionados, usando ordem determinística dentro de cada grupo.

#### Scenario: Animal possui estoque suficiente
- **WHEN** as rações dos animais de carga cobrem todo o consumo da viagem
- **THEN** o sistema debita somente pilhas dos animais e não altera as rações dos personagens

#### Scenario: Estoque dos animais é parcial
- **WHEN** as rações dos animais cobrem apenas parte do consumo
- **THEN** o sistema esgota o valor necessário disponível nos animais e debita o restante das pilhas dos personagens selecionados

#### Scenario: Fontes não elegíveis possuem rações
- **WHEN** existem rações em depósitos ou em personagens não selecionados
- **THEN** o sistema não inclui essas pilhas no estoque disponível nem no plano de débitos da viagem

### Requirement: Suficiência e atomicidade do consumo
O sistema MUST aplicar a realização da viagem somente quando as fontes elegíveis possuírem rações suficientes e MUST persistir todos os débitos e o histórico como uma única operação lógica nos modos local e Firebase.

#### Scenario: Estoque elegível insuficiente
- **WHEN** o total das rações nos animais e personagens selecionados é menor que o consumo necessário
- **THEN** o sistema bloqueia a realização, informa a quantidade faltante e não altera nenhuma pilha

#### Scenario: Realização no modo local
- **WHEN** o usuário confirma uma viagem com estoque suficiente no modo local
- **THEN** o sistema aplica todos os débitos, grava o estado uma única vez e atualiza a interface após a persistência

#### Scenario: Realização no Firebase
- **WHEN** o usuário confirma uma viagem com estoque suficiente no modo Firebase
- **THEN** o sistema relê, valida e atualiza as pilhas elegíveis e cria o histórico em uma única transação

#### Scenario: Estoque fica insuficiente por concorrência
- **WHEN** outra operação reduz as rações antes do commit da viagem
- **THEN** o sistema rejeita a transação sem aplicar débitos parciais

### Requirement: Histórico da viagem realizada
O sistema SHALL registrar cada viagem concluída com o responsável pela operação, a duração, os participantes e o total de rações consumido.

#### Scenario: Viagem concluída
- **WHEN** todos os débitos de uma viagem são persistidos com sucesso
- **THEN** o histórico recebe um registro com autor, dias, nomes dos participantes e quantidade total consumida

#### Scenario: Viagem não concluída
- **WHEN** a realização é cancelada ou rejeitada por validação ou erro de persistência
- **THEN** o sistema não cria registro de viagem no histórico
