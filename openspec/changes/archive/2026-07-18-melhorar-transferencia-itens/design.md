## Context

A transferência individual é iniciada pelo botão da linha do item e atualmente executada por `transferItem`, que monta `destinationChoices`, abre um `prompt` numérico e sempre move o registro inteiro. Os destinos podem ser portadores ou itens contêineres, e itens contêineres transferem toda a subárvore. A aplicação não possui etapa de build e precisa manter paridade entre `localStorage` e Firestore.

## Goals / Non-Goals

**Goals:**
- Oferecer um diálogo acessível e responsivo para transferência individual.
- Tornar os destinos compreensíveis e selecionáveis por radio buttons personalizados.
- Priorizar automaticamente um animal de carga válido.
- Permitir dividir pilhas comuns por quantidade sem perder dados.
- Preservar validações de mochila, hierarquia, histórico e atomicidade lógica.

**Non-Goals:**
- Alterar o fluxo de transferência em massa.
- Mesclar automaticamente pilhas equivalentes no destino.
- Alterar o modelo de item ou as regras de cálculo de carga.
- Permitir divisão parcial de uma subárvore de item contêiner.

## Decisions

1. **Usar um elemento `dialog` com formulário próprio.** O HTML terá campos para o ID do item, lista de destinos e quantidade. Os destinos serão labels em formato de cartão contendo inputs `radio` nativos, preservando navegação por teclado e semântica enquanto o CSS personaliza a aparência. Um seletor estilizado foi descartado por ocultar detalhes dos destinos, e controles customizados sem input nativo foram descartados por acessibilidade.

2. **Gerar as opções a partir de `destinationChoices`.** A tela reutilizará a mesma fonte que já exclui o destino atual, o próprio item e seus descendentes. Cada opção mostrará nome e natureza do destino. Isso evita duplicar regras de validade e mantém suporte a portadores e itens contêineres.

3. **Escolher um padrão determinístico.** Ao abrir o diálogo, será marcado o primeiro destino direto cujo portador seja do tipo `animal`; na ausência dele, será marcada a primeira opção válida. A preferência considera somente destinos disponíveis, portanto nunca seleciona a origem excluída nem um descendente inválido.

4. **Exibir quantidade apenas quando houver escolha real.** Para pilhas comuns com quantidade inteira maior que um, o campo aceitará valores inteiros de 1 até a quantidade disponível e começará com a quantidade total. Para quantidade igual ou inferior a um, o campo será ocultado e a transferência será integral.

5. **Dividir a pilha sem tentar mesclá-la.** Quando a quantidade escolhida for menor que o total, o registro original terá sua quantidade reduzida e um clone com novo ID, quantidade escolhida e novo destino será criado. Os demais metadados serão preservados. Criar uma pilha separada é previsível e evita critérios ambíguos de equivalência entre nome, descrição, observações, cargas e propriedades especiais.

6. **Itens com descendentes não podem ser divididos.** Se o item possui conteúdo, a quantidade fica bloqueada no total e a operação segue o fluxo integral existente, levando a subárvore junto. Clonar descendentes ou decidir a qual unidade eles pertencem foi descartado porque o modelo associa conteúdo ao registro, não a uma unidade específica da pilha.

7. **Persistir a transferência parcial como uma operação lógica única.** No Firestore, um batch atualizará a quantidade original e criará o novo documento; no modo local, ambas as alterações serão aplicadas antes de uma única gravação e renderização. A transferência integral continuará usando batch quando houver descendentes. O histórico registrará quantidade, item, origem e destino.

## Risks / Trade-offs

- **[Muitas opções ocuparem espaço no celular]** → Limitar a altura da lista, permitir rolagem interna e manter as ações do diálogo acessíveis.
- **[Valor de quantidade inválido ou alterado manualmente]** → Validar novamente no submit como inteiro dentro de 1 até o total disponível.
- **[Mudança concorrente na quantidade no modo Firebase]** → Validar contra o estado mais recente disponível e gravar atualização e criação no mesmo batch; a solução mantém o modelo de concorrência atual, sem introduzir transação remota adicional.
- **[Duplicação de metadados em pilhas parciais]** → Clonar intencionalmente todos os metadados do item, substituindo apenas ID, quantidade, destino e campos de atualização.
- **[Confusão entre animal e contêiner dentro de animal]** → Priorizar apenas o destino direto do animal e mostrar o tipo em cada cartão.
