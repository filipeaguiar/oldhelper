## Context

A aba de rações já calcula participantes, dias, consumo base, margem, estoque e compra, mas o estoque é apenas somado globalmente e não existe uma operação para registrar o consumo da viagem. Itens de categoria `Ração` pertencem a um portador por `containerId`; a aplicação precisa manter o mesmo comportamento em `localStorage` e Firestore e registrar operações relevantes no histórico.

## Goals / Non-Goals

**Goals:**
- Confirmar em diálogo os participantes, os dias e o consumo efetivo antes de alterar o estoque.
- Descontar o consumo base da viagem em ordem previsível: animais de carga primeiro e personagens participantes depois.
- Validar suficiência e persistir todos os débitos sem deixar uma viagem parcialmente aplicada.
- Manter paridade entre os modos local e Firebase e registrar a operação no histórico.

**Non-Goals:**
- Descontar a margem de segurança ou modificar o planejamento de compras.
- Consumir rações de depósitos ou de personagens que não participam da viagem.
- Registrar calendário, destino, encontros ou um histórico estruturado de viagens.
- Criar um novo modelo de dados ou alterar as regras do Firestore.

## Decisions

1. **Reutilizar o cálculo atual, separando consumo efetivo de recomendação.** A ação usará os participantes selecionados e `base = ceil(consumo diário × dias)`. A margem continuará servindo apenas para recomendar compra e não será debitada. Reutilizar `rationCalculation` evita divergência visual; consumir o total recomendado foi descartado porque reserva não representa consumo realizado.

2. **Adicionar uma ação secundária e um `dialog` de confirmação.** O botão “Realizar viagem” ficará na aba da calculadora e abrirá um diálogo com duração, lista dos participantes e respectivos consumos, além do total a debitar. O diálogo recalculará os dados ao abrir e validará novamente no submit. Usar `confirm` foi descartado por não apresentar a composição da viagem de forma legível e acessível.

3. **Montar um plano determinístico de débitos.** Serão elegíveis primeiro todas as pilhas de `Ração` cujo `containerId` pertença a animais de carga e, em seguida, as pilhas dos personagens selecionados, na ordem de exibição dos portadores e na ordem estável dos itens. Cada pilha contribuirá até zerar o consumo restante. Depósitos, personagens não selecionados e itens de outras categorias não entram no plano. Uma distribuição proporcional foi descartada por ser menos previsível e contrariar a prioridade solicitada.

4. **Bloquear a operação antes de qualquer escrita se o estoque elegível for insuficiente.** A abertura do diálogo mostrará disponível e necessário; a confirmação ficará indisponível quando faltar estoque. O submit repetirá a validação para cobrir mudanças de seleção ou estado. Não haverá débito parcial nem compra automática, pois ambos tornariam ambíguo se a viagem foi efetivamente realizada.

5. **Usar transação no Firestore e uma única gravação local.** No modo Firebase, a transação lerá todas as pilhas elegíveis, recalculará a disponibilidade com os dados atuais, aplicará os débitos e criará o histórico no mesmo commit. No modo local, os valores serão validados, alterados em memória e persistidos por uma chamada a `writeLocal` antes de renderizar. Um batch sem releitura foi descartado por não proteger contra consumo concorrente do mesmo estoque.

6. **Manter pilhas zeradas.** Os débitos atualizarão `qty` até zero, preservando os registros e metadados existentes. Excluir documentos vazios exigiria tratamento adicional para itens aninhados e sincronização e não é necessário para representar o consumo.

7. **Registrar um resumo auditável.** O histórico informará quem realizou a operação, dias, participantes e total consumido. A interface será renderizada após o sucesso e exibirá uma mensagem; cancelar ou fechar o diálogo não altera dados.

## Risks / Trade-offs

- **[Seleção ou quantidade mudar enquanto o diálogo está aberto]** → Recalcular e validar imediatamente antes da persistência.
- **[Dois dispositivos consumirem o mesmo estoque]** → Ler e atualizar todas as pilhas elegíveis dentro de uma transação Firestore.
- **[Ordem de consumo surpreender o usuário]** → Explicar no diálogo que animais são consumidos antes dos personagens e usar ordenação determinística.
- **[Rações em depósitos ou personagens ausentes não cobrirem a viagem]** → Mostrar somente o estoque elegível e bloquear a confirmação, preservando a regra explícita de fontes.
- **[Muitas pilhas ampliarem a transação]** → Limitar a leitura às pilhas de ração dos animais e personagens selecionados; o tamanho esperado do grupo é pequeno.
