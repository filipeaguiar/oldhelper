## Why

A transferência individual depende de um `prompt` textual, exigindo que o usuário associe números aos destinos e impedindo escolher apenas parte de uma pilha. Uma tela dedicada tornará a operação mais clara, rápida e adequada ao uso em celulares.

## What Changes

- Substituir o `prompt` da transferência individual por um diálogo integrado à interface.
- Apresentar os destinos válidos como opções de radio button personalizadas, com nome e tipo do destino claramente visíveis.
- Pré-selecionar automaticamente o primeiro animal de carga disponível entre os destinos válidos; quando não houver um animal válido, selecionar o primeiro destino disponível.
- Permitir informar a quantidade a transferir quando o item possuir mais de uma unidade.
- Em transferências parciais, manter a quantidade restante na origem e criar uma pilha equivalente no destino com a quantidade escolhida.
- Preservar a transferência integral de itens contêineres com conteúdo e impedir a divisão parcial desses itens, evitando separar a hierarquia do contêiner.
- Manter validações existentes, histórico, funcionamento local e persistência no Firebase.
- Manter o fluxo de transferência em massa para animais fora do escopo desta alteração.

## Capabilities

### New Capabilities
- `item-transfer-dialog`: diálogo visual para seleção de destino e quantidade em transferências individuais de itens.

### Modified Capabilities

Nenhuma.

## Impact

A mudança afeta o diálogo em `public/index.html`, a lógica de transferência e bindings em `public/app.js` e os componentes visuais em `public/styles.css`. Transferências parciais passam a criar um novo registro de item no destino, mas não exigem alteração no formato dos documentos, regras do Firestore, APIs ou dependências externas.
