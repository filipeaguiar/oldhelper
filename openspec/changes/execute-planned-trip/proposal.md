## Why

A calculadora atualmente ajuda a planejar e comprar rações, mas não permite registrar que a viagem planejada aconteceu nem descontar automaticamente o consumo do estoque. Isso obriga o grupo a ajustar manualmente diversas pilhas de rações, aumentando o risco de erros.

## What Changes

- Adicionar à aba da calculadora de viagens uma ação para realizar a viagem conforme os participantes e dias selecionados.
- Exibir um diálogo de confirmação com os personagens participantes, os dias de viagem e o consumo total previsto.
- Consumir primeiro as rações armazenadas nos animais de carga e, depois, as rações de cada personagem participante.
- Impedir a realização quando o estoque elegível não for suficiente, sem aplicar débitos parciais.
- Persistir todos os débitos como uma única operação lógica nos modos local e Firebase.
- Registrar no histórico a realização da viagem, sua duração, participantes e quantidade de rações consumida.
- Manter a margem de segurança e a compra de rações fora do consumo efetivo: realizar a viagem desconta somente o consumo base dos dias informados.

## Capabilities

### New Capabilities
- `planned-trip-execution`: confirmação e realização de uma viagem planejada com consumo ordenado e consistente das rações do grupo.

### Modified Capabilities

Nenhuma.

## Impact

A mudança afeta a interface da calculadora e o novo diálogo em `public/index.html`, a lógica de cálculo, consumo, persistência e histórico em `public/app.js` e a apresentação responsiva em `public/styles.css`. Não são necessárias alterações no formato dos documentos, nas regras do Firestore, em APIs ou em dependências externas.
