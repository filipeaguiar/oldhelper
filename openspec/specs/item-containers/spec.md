# Item Containers Specification

## Purpose

Definir como itens podem guardar outros itens em uma hierarquia segura, preservando portador, carga, totais e compatibilidade dos dados.

## Requirements

### Requirement: Item configurável como contêiner
O sistema SHALL permitir que o usuário marque um item como contêiner ao criá-lo ou editá-lo e SHALL persistir essa propriedade nos modos local e Firebase.

#### Scenario: Criar item contêiner
- **WHEN** o usuário cria um item com a opção de contêiner ativada
- **THEN** o sistema salva o item como um destino apto a receber outros itens

#### Scenario: Carregar campanha anterior
- **WHEN** o sistema carrega um item criado antes da existência da propriedade de contêiner
- **THEN** o sistema trata o item como não contêiner e mantém seus demais dados inalterados

### Requirement: Item pode ser armazenado em outro item
O sistema SHALL permitir que um item seja criado, editado ou transferido para dentro de um item marcado como contêiner. O item armazenado SHALL continuar associado ao mesmo portador principal do item contêiner.

#### Scenario: Adicionar item dentro de contêiner
- **WHEN** o usuário escolhe um item contêiner como destino ao cadastrar um novo item
- **THEN** o sistema registra o contêiner como pai e associa o novo item ao portador principal desse contêiner

#### Scenario: Transferir item para contêiner
- **WHEN** o usuário transfere um item para um item contêiner válido
- **THEN** o sistema move o item para esse contêiner e atualiza seu portador principal para o portador do destino

#### Scenario: Transferir item de contêiner para portador
- **WHEN** o usuário transfere um item aninhado diretamente para um personagem, animal ou depósito
- **THEN** o sistema remove sua relação com o item pai e o associa diretamente ao portador escolhido

### Requirement: Hierarquia aninhada
O sistema SHALL aceitar itens contêineres dentro de outros itens contêineres sem limitar a profundidade e SHALL preservar a relação completa de ancestralidade.

#### Scenario: Contêiner em outro contêiner
- **WHEN** o usuário coloca um item contêiner dentro de outro item contêiner
- **THEN** o sistema mantém o contêiner movido, seu conteúdo e o contêiner de destino na mesma hierarquia e sob o mesmo portador principal

### Requirement: Prevenção de relações inválidas
O sistema MUST impedir que um item contenha a si próprio, que seja movido para qualquer descendente seu ou que tenha como pai um item inexistente ou não marcado como contêiner.

#### Scenario: Seleção do próprio item
- **WHEN** o usuário tenta escolher o próprio item como destino
- **THEN** o sistema rejeita a operação e mantém a organização anterior

#### Scenario: Seleção de descendente
- **WHEN** o usuário tenta mover um item contêiner para um de seus descendentes
- **THEN** o sistema rejeita a operação para evitar um ciclo

#### Scenario: Destino não contêiner
- **WHEN** o usuário tenta armazenar um item dentro de outro item que não está marcado como contêiner
- **THEN** o sistema rejeita a operação e informa que o destino não pode receber itens

#### Scenario: Referência inválida importada
- **WHEN** uma importação contém pai ausente, pai não contêiner ou ciclo
- **THEN** o sistema remove a relação inválida e mantém o item associado a um portador válido

### Requirement: Transferência atômica da subárvore
O sistema SHALL mover todo o conteúdo de um item contêiner junto com ele e SHALL atualizar o portador principal de todos os seus descendentes como uma única operação lógica.

#### Scenario: Mover contêiner entre portadores
- **WHEN** o usuário transfere um item contêiner com conteúdo para outro portador
- **THEN** o sistema move o contêiner e todos os descendentes para o novo portador sem alterar suas relações internas

#### Scenario: Mover contêiner entre itens
- **WHEN** o usuário transfere um item contêiner com conteúdo para outro item contêiner válido
- **THEN** o sistema preserva sua subárvore e associa todos os seus membros ao portador principal do destino

#### Scenario: Persistir transferência no Firebase
- **WHEN** uma transferência de subárvore é realizada no modo Firebase
- **THEN** o sistema grava as alterações do item e de seus descendentes em um único batch

### Requirement: Exibição hierárquica do inventário
O sistema SHALL exibir itens contidos abaixo de seu item contêiner, com indicação visual de nível, sem deixar de agrupar a árvore pelo portador principal.

#### Scenario: Visualizar conteúdo
- **WHEN** um portador possui itens aninhados
- **THEN** o inventário mostra cada filho abaixo de seu contêiner e mantém ações de quantidade, cargas, transferência, edição e exclusão acessíveis

#### Scenario: Buscar item aninhado
- **WHEN** um item aninhado corresponde ao texto ou à categoria pesquisada
- **THEN** o sistema exibe o item correspondente e seus ancestrais necessários para identificar onde ele está guardado

#### Scenario: Filtrar por portador
- **WHEN** o usuário seleciona um portador no filtro
- **THEN** o sistema inclui todos os itens associados a ele, independentemente da profundidade na hierarquia

### Requirement: Totais e carga consideram conteúdo aninhado
O sistema SHALL contabilizar cada item aninhado uma única vez nos totais, estoques, moedas e carga de seu portador principal. O aninhamento SHALL NOT aplicar redução de carga nem contabilizar novamente o conteúdo por causa de seus ancestrais.

#### Scenario: Calcular carga com itens aninhados
- **WHEN** um portador possui um contêiner com itens dentro dele
- **THEN** a carga do portador inclui a carga própria do contêiner e a carga de cada item contido exatamente uma vez

#### Scenario: Usar moeda ou ração aninhada
- **WHEN** moedas ou rações estão dentro de um item contêiner
- **THEN** os totais e as operações existentes as associam ao portador principal do contêiner

### Requirement: Proteção de contêiner não vazio
O sistema MUST impedir que um item com conteúdo deixe de ser contêiner ou seja excluído enquanto possuir descendentes.

#### Scenario: Desmarcar contêiner com conteúdo
- **WHEN** o usuário tenta desativar a propriedade de contêiner de um item que contém outros itens
- **THEN** o sistema rejeita a alteração e orienta o usuário a transferir ou remover o conteúdo primeiro

#### Scenario: Excluir contêiner com conteúdo
- **WHEN** o usuário tenta excluir um item contêiner que possui conteúdo
- **THEN** o sistema preserva o item e seus descendentes e orienta o usuário a esvaziá-lo primeiro

#### Scenario: Excluir contêiner vazio
- **WHEN** o usuário exclui um item contêiner sem conteúdo
- **THEN** o sistema executa a exclusão pelo fluxo normal

### Requirement: Compatibilidade de exportação e importação
O sistema SHALL incluir as propriedades de contêiner e parentesco na exportação JSON e SHALL importar tanto o novo formato quanto arquivos anteriores sem essas propriedades.

#### Scenario: Exportar hierarquia
- **WHEN** o usuário exporta uma campanha com itens aninhados
- **THEN** o arquivo contém dados suficientes para reconstruir os contêineres, seus filhos e os portadores principais

#### Scenario: Reimportar hierarquia válida
- **WHEN** o usuário importa um arquivo exportado com uma hierarquia válida
- **THEN** o sistema restaura a mesma organização entre portadores, contêineres e conteúdo

#### Scenario: Importar arquivo legado
- **WHEN** o usuário importa um arquivo válido de uma versão anterior
- **THEN** todos os itens são restaurados diretamente sob seus portadores e continuam utilizáveis
