## Why

Atualmente, todo item só pode ser associado diretamente a um personagem, animal ou depósito, o que impede representar objetos que guardam outros objetos, como uma varinha com componentes, uma mochila com seu conteúdo ou um recipiente mágico. Permitir itens contêineres torna o inventário mais fiel e facilita organizar e transferir conjuntos de itens.

## What Changes

- Permitir marcar um item como contêiner de outros itens.
- Permitir escolher outro item contêiner como destino ao criar, editar ou transferir um item.
- Exibir itens contidos de forma hierárquica no inventário, preservando a identificação do portador principal.
- Impedir relações inválidas, incluindo um item conter a si próprio e ciclos entre contêineres.
- Manter o conteúdo associado ao portador principal para filtros, totais e cálculo de carga.
- Tratar com segurança a edição, transferência e remoção de itens contêineres que possuam conteúdo.
- Preservar compatibilidade com campanhas e arquivos JSON existentes, nos quais todos os itens pertencem diretamente a portadores.

## Capabilities

### New Capabilities
- `item-containers`: Definição, organização hierárquica, transferência, validação e remoção segura de itens que contêm outros itens.

### Modified Capabilities

Nenhuma.

## Impact

- Modelo de dados dos itens no estado local, `localStorage`, exportação/importação JSON e documentos da coleção `items` no Firestore.
- Formulário de cadastro e edição, ação de transferência e visualização hierárquica do inventário em `public/index.html` e `public/app.js`.
- Estilos da árvore de itens em `public/styles.css`.
- Lógica de filtros, busca, totais, carga, compras e remoção segura, que deverá resolver o portador principal de itens aninhados.
- Não são previstas novas dependências nem alterações incompatíveis nas regras do Firestore.
