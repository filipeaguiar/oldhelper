## Why

Quando equipamentos são entregues a um animal de carga, a aplicação perde a indicação de quem os carregava antes, tornando a devolução manual e sujeita a enganos. Registrar essa origem permitirá identificar o dono e devolvê-lo rapidamente com o destino correto já selecionado.

## What Changes

- Registrar no item uma referência ao portador de origem quando ele for transferido para um animal de carga.
- Preservar a referência ao mover o item entre animais e removê-la quando o item sair de um animal para um portador não animal.
- Aplicar a referência tanto em transferências individuais, inclusive parciais, quanto em transferências em massa e subárvores de contêineres.
- Exibir no inventário do animal uma indicação textual do dono original enquanto a referência for válida.
- Ao abrir a transferência de um item que está com um animal, pré-selecionar o dono original quando ele for um destino válido; caso contrário, manter a regra atual de seleção automática.
- Manter compatibilidade com itens e arquivos exportados anteriormente, que não possuem a nova referência.
- Tratar referências a portadores removidos como indisponíveis, sem impedir transferências.

## Capabilities

### New Capabilities
- `item-original-owner`: rastreamento, exibição e uso do portador de origem para devolver itens carregados por animais.

### Modified Capabilities

Nenhuma.

## Impact

A mudança afeta a normalização e renderização de itens, as transferências individual e em massa e a seleção padrão no diálogo em `public/app.js`, além do estilo do indicador em `public/styles.css`. O item ganha o campo opcional `originalOwnerId`, persistido pelos mecanismos existentes no modo local e no Firestore. A implementação depende do diálogo criado pela mudança ativa `melhorar-transferencia-itens`, mas não adiciona dependências externas nem exige migração obrigatória.
