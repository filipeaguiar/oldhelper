## Context

A listagem do inventário é gerada por `renderItem` em `public/app.js`. Hoje, todos os itens compartilham a mesma estrutura visual; itens comuns mostram a carga por unidade e moedas mostram sua regra específica. Como o projeto usa HTML, CSS e JavaScript sem etapa de build, a solução deve permanecer declarativa, leve e compatível com a renderização atual, inclusive em itens aninhados.

## Goals / Non-Goals

**Goals:**
- Tornar imediatamente reconhecíveis os itens configurados para não adicionar carga.
- Combinar estilo visual e texto para que a informação não dependa apenas de cor.
- Preservar ações, hierarquia, seleção e responsividade da linha de item.
- Manter moedas fora dessa classificação, pois possuem regra própria de carga.

**Non-Goals:**
- Alterar cálculos de carga ou capacidade.
- Criar ou migrar campos no modelo de dados.
- Adicionar filtros ou ordenação por carga.
- Redesenhar toda a listagem do inventário.

## Decisions

1. **Classificar pela regra de carga do item, não pela quantidade atual.** Um item será considerado sem carga quando não for da categoria `Moeda` e seu `loadPerUnit` normalizado for zero. Assim, um item com quantidade temporariamente igual a zero não muda de aparência, e moedas continuam representando sua regra de 1 carga por 100 peças. A alternativa de usar `qty * loadPerUnit` foi descartada porque confundiria estoque zerado com item intrinsecamente sem carga.

2. **Adicionar uma classe semântica à linha renderizada.** `renderItem` incluirá uma classe específica quando o item for sem carga. Essa abordagem mantém a decisão de domínio no JavaScript e a apresentação no CSS, sem duplicar a estrutura HTML. Usar estilos inline foi descartado por dificultar manutenção e estados combinados.

3. **Substituir “0 carga/un.” por um indicador explícito.** O metadado será apresentado como uma tag “sem carga”, oferecendo pista textual e visual. Apenas mudar cor ou opacidade foi descartado por acessibilidade e por não explicar o significado.

4. **Usar realce discreto que componha com seleção e aninhamento.** O estilo poderá usar fundo, borda lateral ou tag em tons já compatíveis com a paleta, mas o estado `selected` continuará visualmente prioritário e os controles manterão contraste. A distinção não reduzirá a opacidade da linha inteira, pois isso poderia sugerir item desabilitado.

## Risks / Trade-offs

- **[Conflito visual com o estado selecionado]** → Definir seletores CSS específicos e verificar a combinação das classes, mantendo a seleção prioritária.
- **[Usuário interpretar “sem carga” como item sem quantidade]** → Manter quantidade visível e aplicar o rótulo somente à propriedade de carga por unidade.
- **[Moedas com `loadPerUnit` zero serem classificadas incorretamente]** → Centralizar a condição com exclusão explícita da categoria `Moeda`.
- **[Excesso de destaque em inventários com muitos itens leves]** → Usar tratamento discreto, sem animação nem redução global de contraste.
