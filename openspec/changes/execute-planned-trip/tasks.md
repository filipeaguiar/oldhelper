## 1. Interface de confirmação

- [x] 1.1 Adicionar o botão “Realizar viagem” à aba da calculadora e mapear o novo controle em `public/app.js`
- [x] 1.2 Adicionar em `public/index.html` um diálogo acessível com dias, participantes, consumo individual, total necessário, estoque elegível e ações de cancelar e confirmar
- [x] 1.3 Conectar abertura, fechamento e submit do diálogo, garantindo que cancelar não altere o estado

## 2. Cálculo e plano de consumo

- [x] 2.1 Separar o consumo base da recomendação com margem e reutilizar os participantes e dias atuais da calculadora
- [x] 2.2 Implementar a coleta das pilhas elegíveis, excluindo depósitos e personagens não selecionados
- [x] 2.3 Implementar o plano determinístico que debita primeiro animais de carga e depois personagens selecionados
- [x] 2.4 Renderizar o resumo do diálogo e bloquear a confirmação sem participantes ou com estoque elegível insuficiente, informando a falta

## 3. Persistência e histórico

- [x] 3.1 Implementar a realização local com revalidação, aplicação integral do plano e uma única chamada de persistência antes da renderização
- [x] 3.2 Implementar a realização no Firebase com releitura das pilhas, validação de suficiência, débitos e histórico em uma única transação
- [x] 3.3 Registrar autor, dias, participantes e total consumido e atualizar diálogo, calculadora, estoque e mensagem de sucesso após o commit
- [x] 3.4 Tratar falhas e concorrência sem deixar débitos ou registros de histórico parciais

## 4. Apresentação responsiva

- [x] 4.1 Estilizar o botão e o resumo do diálogo com estados normal, insuficiente, desabilitado e foco visível
- [x] 4.2 Ajustar a lista de participantes e as ações do diálogo para telas pequenas e conteúdo longo

## 5. Verificação

- [x] 5.1 Verificar cálculo com consumos fracionários, margem ignorada no débito, múltiplos dias e seleção vazia
- [x] 5.2 Verificar prioridade completa e parcial dos animais, fallback para personagens e exclusão de depósitos e não participantes
- [x] 5.3 Verificar cancelamento, estoque insuficiente, pilhas zeradas, histórico e ausência de alterações parciais nos modos local e Firebase
- [x] 5.4 Executar validações de sintaxe e regressão dos fluxos existentes de planejamento e compra de rações
