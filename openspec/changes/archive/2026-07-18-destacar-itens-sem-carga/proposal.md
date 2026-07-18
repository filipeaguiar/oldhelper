## Why

Itens que não acrescentam carga atualmente aparecem como itens comuns, e a indicação “0 carga/un.” fica misturada aos demais metadados. Uma distinção visual permitirá reconhecer rapidamente itens sem impacto na capacidade dos portadores e reduzirá dúvidas durante a organização do inventário.

## What Changes

- Identificar, na listagem do inventário, itens cuja carga efetiva por unidade seja zero.
- Aplicar um tratamento visual discreto e consistente às linhas desses itens, sem prejudicar legibilidade, seleção ou ações.
- Exibir um indicador textual explícito de “sem carga”, evitando depender somente de cor.
- Preservar o tratamento normal de itens que efetivamente adicionam carga, incluindo moedas, cuja carga segue a regra própria de 1 ponto por 100 peças.
- Garantir que a distinção continue adequada em telas pequenas e nos estados de item selecionado.

## Capabilities

### New Capabilities
- `item-load-visibility`: identificação e apresentação visual de itens que não adicionam carga ao portador.

### Modified Capabilities

Nenhuma.

## Impact

A mudança afeta a renderização das linhas de inventário em `public/app.js` e seus estilos em `public/styles.css`. Não altera o modelo de dados, cálculos de carga, regras do Firestore, APIs ou dependências externas.
