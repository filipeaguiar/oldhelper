## 1. Estrutura do diálogo

- [x] 1.1 Adicionar em `public/index.html` o diálogo de transferência com identificação do item, lista de destinos, campo de quantidade, aviso de conteúdo e ações
- [x] 1.2 Mapear os novos elementos no objeto DOM e conectar abertura, cancelamento e submit em `public/app.js`

## 2. Destinos e quantidade

- [x] 2.1 Renderizar os destinos válidos como radio buttons acessíveis com nome, tipo e portador principal
- [x] 2.2 Pré-selecionar o primeiro animal de carga direto válido ou usar o primeiro destino como fallback
- [x] 2.3 Configurar a quantidade entre 1 e o total para pilhas divisíveis e bloquear divisão de itens com descendentes

## 3. Execução da transferência

- [x] 3.1 Adaptar a transferência integral ao submit do diálogo, preservando validações e movimentação de descendentes
- [x] 3.2 Implementar transferência parcial local reduzindo a origem e criando uma nova pilha no destino em uma única atualização lógica
- [x] 3.3 Implementar transferência parcial no Firebase com atualização e criação no mesmo batch
- [x] 3.4 Atualizar histórico e mensagens de sucesso para incluir quantidade, item, origem e destino

## 4. Apresentação

- [x] 4.1 Estilizar os radio buttons como cartões de destino, incluindo estados selecionado, foco e identificação de tipo
- [x] 4.2 Ajustar lista, quantidade, avisos e ações do diálogo para telas pequenas e listas longas

## 5. Verificação

- [x] 5.1 Verificar seleção automática de animal, fallback, cancelamento e ausência de destinos
- [x] 5.2 Verificar transferências integral, parcial e com descendentes nos modos local e Firebase, incluindo validações e histórico
- [x] 5.3 Executar validações de sintaxe, estrutura e regressão do fluxo de transferência em massa
