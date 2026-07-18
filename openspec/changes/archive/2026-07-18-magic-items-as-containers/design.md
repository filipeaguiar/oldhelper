## Context

O modelo atual usa `item.containerId` para apontar diretamente para um personagem, animal ou depósito. Essa referência é usada em toda a aplicação para agrupamento visual, filtros, carga, carteiras, compras, persistência e histórico. A mudança precisa adicionar hierarquia sem quebrar campanhas existentes nem tornar essas rotinas dependentes de percorrer uma árvore a cada cálculo.

A aplicação é um cliente web sem etapa de build e pode operar tanto em `localStorage` quanto com documentos independentes no Firestore. Portanto, validação e consistência da árvore devem ser implementadas no cliente, e operações que alterem vários documentos devem usar batch no modo Firebase.

## Goals / Non-Goals

**Goals:**

- Permitir que qualquer item explicitamente marcado como contêiner receba outros itens, inclusive em múltiplos níveis.
- Preservar um portador principal para cada item, permitindo que totais, carga, compras e filtros continuem eficientes.
- Tornar criação, transferência, edição, importação e remoção resistentes a referências inválidas e ciclos.
- Manter compatibilidade retroativa com dados que não possuam os novos campos.
- Exibir a relação entre contêiner e conteúdo com clareza no inventário.

**Non-Goals:**

- Implementar redução de peso, capacidade máxima ou regras especiais para recipientes mundanos ou mágicos.
- Controlar espaços, dimensões ou restrições por categoria de item.
- Alterar permissões ou regras de acesso do Firestore.
- Sincronizar uma alteração de árvore concorrente como uma transação distribuída entre vários usuários além das garantias de batch já disponíveis.

## Decisions

### Manter `containerId` como portador principal e adicionar `parentItemId`

Cada item continuará armazenando `containerId`, sempre referenciando um portador de `state.containers`. Os novos campos serão `isContainer` (booleano) e `parentItemId` (ID de outro item ou string vazia). Um filho terá o mesmo `containerId` de todos os seus ancestrais e do item raiz.

Isso preserva as consultas e somas atuais e oferece compatibilidade automática para registros antigos, normalizados com `isContainer: false` e `parentItemId: ''`. A alternativa de tornar `containerId` polimórfico, apontando ora para portadores ora para itens, exigiria reescrever praticamente todas as rotinas e criaria ambiguidade entre coleções.

### Permitir hierarquia de profundidade arbitrária com validação centralizada

Funções auxiliares resolverão ancestrais, descendentes e portador principal usando IDs e um conjunto de visitados. Um destino será válido somente se existir, estiver marcado como contêiner, não for o próprio item e não pertencer à subárvore do item movido. Dados importados com pai ausente, pai não contêiner ou ciclo terão a relação inválida removida, mantendo o item no seu `containerId` válido ou no primeiro portador disponível.

Limitar a árvore a um único nível seria mais simples, mas impediria casos naturais como um estojo dentro de uma mochila. A detecção por conjunto visitado evita loops mesmo diante de dados corrompidos.

### Tratar a transferência de um item contêiner como transferência da subárvore

Ao mover um item para outro portador, seu `parentItemId` será limpo e o `containerId` do item e de todos os descendentes será atualizado. Ao mover para outro item contêiner, o item receberá o novo `parentItemId`, e toda a subárvore receberá o portador principal do destino. No Firestore, essas alterações serão persistidas em um único batch; no modo local, serão aplicadas ao estado antes de uma única persistência e renderização.

Mover somente o nó raiz deixaria descendentes associados ao portador antigo e quebraria filtros e cálculos baseados em `containerId`.

### Bloquear desativação e exclusão de contêiner não vazio

A aplicação não permitirá remover a marca de contêiner nem excluir um item enquanto ele tiver filhos diretos ou indiretos. A interface informará que o conteúdo deve ser transferido ou removido primeiro. Essa escolha evita perda silenciosa e não exige um novo diálogo complexo de destino. A transferência do contêiner permanece permitida e leva todo o conteúdo junto.

A alternativa de promover automaticamente os filhos para o pai poderia surpreender o usuário e alterar a organização sem confirmação explícita.

### Renderizar uma árvore dentro de cada portador

O inventário continuará agrupado por portador. Dentro de cada grupo, itens sem `parentItemId` serão raízes e seus filhos serão renderizados recursivamente, com recuo e indicação visual de contêiner. As opções de destino nos formulários e na transferência combinarão portadores e itens contêineres válidos, com rótulos que indiquem a hierarquia.

Busca e categoria determinarão os itens correspondentes, mas a renderização incluirá seus ancestrais como contexto. O filtro de portador continuará usando `containerId`, portanto incluirá automaticamente todo o conteúdo aninhado.

### Preservar semântica atual de carga e quantidade

Cada registro continuará contribuindo uma vez para a carga do portador por meio de `containerId`; aninhamento não reduz nem duplica carga. Um item com quantidade maior que um continua sendo um único registro lógico, e a relação de conteúdo pertence ao registro inteiro. Capacidade e redução de carga ficam fora do escopo.

## Risks / Trade-offs

- [Edições concorrentes podem escolher destinos incompatíveis antes da atualização remota] → Revalidar a árvore imediatamente antes de persistir e normalizar referências ao receber snapshots.
- [Árvores muito profundas aumentam o custo de renderização e validação] → Usar mapas por ID e conjuntos de visitados, evitando buscas recursivas repetidas; o tamanho esperado do inventário é pequeno.
- [Redundância entre `containerId` e `parentItemId` pode ficar inconsistente] → Centralizar transferências, atualizar a subárvore em batch e reparar relações durante normalização/importação.
- [Bloquear exclusão exige etapas extras do usuário] → Exibir mensagem objetiva e manter disponível a transferência do contêiner inteiro.
- [Itens antigos chamados de mochila não se tornam automaticamente contêineres] → Exigir ativação explícita para não alterar comportamento existente sem consentimento.

## Migration Plan

1. Publicar o cliente com normalização compatível, adicionando valores padrão em memória sem exigir migração prévia do Firestore.
2. Novos campos serão gravados quando itens forem criados ou editados; documentos antigos continuarão válidos.
3. Manter a importação das versões anteriores e incluir os novos campos nas próximas exportações, incrementando a versão do formato se necessário.
4. Validar no modo local e Firebase operações de criação, aninhamento, transferência de subárvore, filtros e remoção.
5. Em caso de rollback, versões anteriores ignorarão `isContainer` e `parentItemId`; como todo item mantém `containerId`, o conteúdo continuará visível diretamente sob o portador, embora sem hierarquia.

## Open Questions

Nenhuma questão bloqueante. Regras de capacidade ou redução de carga para recipientes específicos poderão ser propostas separadamente.
