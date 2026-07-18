## Context

Os itens armazenam apenas `containerId`, que representa o portador atual. Depois que um item vai para um animal, não existe informação suficiente para distinguir quem o entregou. A transferência individual recém-implementada escolhe um animal por padrão, e a transferência em massa também move itens para animais, inclusive subárvores e itens de origens diferentes.

## Goals / Non-Goals

**Goals:**
- Registrar o último portador não animal que entregou cada item a um animal.
- Preservar essa referência enquanto o item circular entre animais.
- Exibir o dono no inventário do animal e priorizá-lo ao devolver o item.
- Cobrir transferências integrais, parciais, em massa e hierárquicas nos modos local e Firebase.
- Manter compatibilidade com dados antigos e referências obsoletas.

**Non-Goals:**
- Criar um cadastro separado de propriedade ou histórico completo de donos.
- Impedir que um item seja entregue a uma pessoa diferente do dono indicado.
- Recuperar automaticamente o dono de itens transferidos antes desta mudança.
- Alterar permissões, regras de acesso ou cálculos de carga.

## Decisions

1. **Adicionar `originalOwnerId` ao item.** O campo opcional guardará o ID de um portador. A normalização usará string vazia como padrão, permitindo carregar documentos e exportações anteriores. Armazenar apenas o nome foi descartado porque nomes podem mudar ou se repetir; um histórico separado foi descartado por ser desnecessário para a devolução rápida.

2. **Interpretar “dono original” como o último portador não animal antes da ida ao animal.** Ao transferir de personagem ou depósito para animal, o portador de origem será registrado. Ao transferir entre animais, a referência existente será preservada. Ao sair de animal para qualquer portador não animal, ela será removida, pois a entrega foi concluída; uma ida futura ao animal registrará o novo portador de origem.

3. **Calcular a referência por item movido.** Uma função central determinará o valor após a transferência com base no portador atual, no destino e em `originalOwnerId`. Ela será usada por transferências individuais e em massa. Isso é necessário porque uma transferência em massa pode reunir itens de diferentes donos, enquanto uma única referência por operação seria incorreta.

4. **Tratar pilhas parciais de modo independente.** Em uma transferência parcial para animal, somente a nova pilha receberá o dono da origem; a quantidade que permanece com o portador mantém seu estado atual. Em uma devolução parcial, a nova pilha entregue terá a referência removida, enquanto o restante no animal continuará referenciado ao dono.

5. **Atualizar toda a subárvore.** Transferências integrais de itens com descendentes aplicarão a regra a cada registro movido, junto da atualização de `containerId`. Assim, um descendente retirado posteriormente do contêiner ainda poderá ser devolvido ao dono correto.

6. **Dar precedência ao dono no diálogo.** Se o item está em um animal, `originalOwnerId` existe e o destino direto desse portador está entre as opções válidas, ele será pré-selecionado. Na ausência de referência válida, permanece a ordem atual: primeiro animal direto e depois primeira opção. Destinos contêineres pertencentes ao dono não substituem a opção direta, mantendo a devolução previsível.

7. **Mostrar o dono somente quando resolvível e pertinente.** A linha do item mostrará uma tag “Dono: <nome>” quando o portador atual for animal e o ID corresponder a um portador existente. IDs obsoletos não quebram a renderização nem a transferência e não recebem destaque enganoso.

8. **Preservar a referência durante edição e persistência.** `normalizeItem` incluirá o campo, e o fluxo de edição manterá o valor existente mesmo que o formulário não o exponha. Exportação, importação, `localStorage` e Firestore já persistem os objetos completos e não precisam de um formato paralelo.

## Risks / Trade-offs

- **[Portador original removido]** → Considerar a referência indisponível, ocultar a tag e usar o fallback normal do diálogo.
- **[Nome do dono alterado]** → Resolver o nome dinamicamente pelo ID para sempre mostrar o valor atual.
- **[Fluxos de transferência divergirem]** → Centralizar o cálculo da referência e reutilizá-lo nos patches individual, parcial, em massa e de descendentes.
- **[Edição apagar o novo campo]** → Copiar explicitamente `originalOwnerId` do registro existente ao montar o item do formulário.
- **[Mudança ativa anterior ainda não arquivada]** → Implementar sobre o diálogo já presente no código e arquivar/sincronizar `melhorar-transferencia-itens` antes desta mudança.
