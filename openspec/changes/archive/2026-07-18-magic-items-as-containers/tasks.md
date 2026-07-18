## 1. Modelo de dados e validação

- [x] 1.1 Adicionar `isContainer` e `parentItemId` à normalização e persistência de itens, com valores padrão compatíveis com campanhas antigas
- [x] 1.2 Implementar utilitários indexados para obter pais, ancestrais, descendentes, profundidade e portador principal de um item
- [x] 1.3 Implementar validação e reparo de árvores para rejeitar autorreferência, ciclos, pais ausentes e pais que não sejam contêineres
- [x] 1.4 Aplicar a validação/reparação ao carregamento local, snapshots do Firestore e importação JSON

## 2. Interface de cadastro e destinos

- [x] 2.1 Adicionar ao formulário de item o controle para marcar o item como contêiner
- [x] 2.2 Substituir a seleção exclusiva de portadores por opções hierárquicas de portadores e itens contêineres válidos
- [x] 2.3 Atualizar criação e edição para resolver `containerId` e `parentItemId` a partir do destino selecionado
- [x] 2.4 Bloquear a desativação da propriedade de contêiner quando o item possuir conteúdo e exibir orientação ao usuário

## 3. Transferência e remoção segura

- [x] 3.1 Atualizar a ação de transferência para oferecer portadores e contêineres, excluindo o próprio item e seus descendentes
- [x] 3.2 Implementar transferência de subárvore, preservando relações internas e atualizando o portador principal de todos os descendentes
- [x] 3.3 Persistir transferências de subárvore em um único batch no Firebase e em uma única atualização no modo local
- [x] 3.4 Impedir a exclusão de contêineres não vazios e manter o fluxo existente para itens e contêineres vazios

## 4. Inventário hierárquico

- [x] 4.1 Renderizar recursivamente os itens de cada portador, com recuo por nível e indicação visual de itens contêineres
- [x] 4.2 Manter todas as ações atuais disponíveis para itens em qualquer profundidade da árvore
- [x] 4.3 Atualizar busca e filtro por categoria para incluir os ancestrais de itens correspondentes como contexto
- [x] 4.4 Adicionar estilos responsivos para a hierarquia e seus indicadores em `public/styles.css`

## 5. Integrações e compatibilidade

- [x] 5.1 Verificar e ajustar carga, moedas, rações, totais, alertas e compras para contabilizar itens aninhados uma única vez pelo portador principal
- [x] 5.2 Atualizar a versão e o fluxo de exportação/importação JSON para preservar hierarquias e aceitar arquivos legados
- [x] 5.3 Registrar no histórico transferências de contêineres com conteúdo de forma clara e sem gerar entradas inconsistentes por descendente
- [x] 5.4 Atualizar a documentação do inventário no `README.md` com criação, organização, transferência e limitações dos itens contêineres

## 6. Verificação

- [x] 6.1 Testar no modo local criação, edição, aninhamento em múltiplos níveis e transferência entre portadores e contêineres
- [x] 6.2 Testar bloqueios de autorreferência, ciclos, desativação e exclusão de contêiner não vazio, incluindo importação de dados inválidos
- [x] 6.3 Testar busca, filtros, totais e carga com itens aninhados e confirmar que nenhum item é omitido ou contado duas vezes
- [x] 6.4 Testar round-trip de exportação/importação para formato novo e importação de campanha legada
- [ ] 6.5 Testar no Firebase que uma transferência de subárvore sincroniza todos os documentos e aparece corretamente em outro cliente
