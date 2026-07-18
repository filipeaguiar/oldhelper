## 1. Modelo e regra de propriedade

- [x] 1.1 Adicionar `originalOwnerId` à normalização de itens com valor padrão compatível com dados legados
- [x] 1.2 Implementar uma função central que determine a referência após transferências para animal, entre animais e para portadores não animais
- [x] 1.3 Preservar `originalOwnerId` ao editar e salvar itens existentes

## 2. Fluxos de transferência

- [x] 2.1 Aplicar a referência nas transferências individuais integrais, incluindo todos os descendentes movidos
- [x] 2.2 Aplicar a referência somente à parte correta nas transferências parciais locais e no Firebase
- [x] 2.3 Aplicar a regra por item na transferência em massa para animal, preservando origens diferentes e referências existentes

## 3. Devolução e apresentação

- [x] 3.1 Alterar a preferência do diálogo para selecionar primeiro o dono original direto válido e manter os fallbacks atuais
- [x] 3.2 Exibir uma tag com o nome atual do dono original nos itens que estejam com animais
- [x] 3.3 Estilizar o indicador de dono de forma legível e compatível com itens sem carga, seleção e layout móvel

## 4. Compatibilidade e verificação

- [x] 4.1 Verificar carga, edição, exportação e importação de itens legados, válidos e com referências a portadores removidos
- [x] 4.2 Verificar transferências integrais, parciais, hierárquicas e em massa entre personagens, depósitos e animais nos modos local e Firebase
- [x] 4.3 Executar validações de sintaxe, estrutura e regressão do diálogo de transferência
