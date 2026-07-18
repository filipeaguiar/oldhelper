## Context

A aplicação já gera um código de campanha e aceita entrada manual, mas a tela inicial exige uma identificação antes de criar ou entrar, não interpreta o código na URL e cria quatro personagens e uma mula por padrão. No modo Firebase, a autenticação anônima já acontece automaticamente e não representa uma conta visível; ela existe para que as regras do Firestore não precisem deixar o banco inteiramente público.

O fragmento da URL (`#resumo`, `#inventario` etc.) já controla a navegação interna. O código da campanha deve, portanto, usar um parâmetro de consulta independente. O modo local continua limitado ao navegador atual, enquanto o Firebase permite que o mesmo código sincronize dispositivos diferentes.

## Goals / Non-Goals

**Goals:**

- Oferecer acesso por código sem cadastro, senha ou tela de autenticação.
- Abrir automaticamente links de campanha e gerar links compartilháveis.
- Preservar autenticação anônima invisível no Firebase por segurança básica.
- Criar campanhas sem integrantes e oferecer estados vazios úteis.
- Permitir cadastrar personagens e animais com suas configurações de rações e carga.
- Manter o histórico atribuível por meio de um apelido local, sem identidade remota.

**Non-Goals:**

- Criar contas, convites, membros, papéis ou permissões por campanha.
- Considerar o código da campanha um segredo forte ou oferecer recuperação de acesso.
- Tornar dados do modo local compartilháveis entre dispositivos.
- Automatizar a criação do projeto Firebase, do Firestore ou a ativação do provedor anônimo no Console.
- Alterar as fórmulas existentes de capacidade de personagens, carga ou planejamento de rações.

## Decisions

### Usar `?campaign=<CODE>` para links de campanha

O parâmetro `campaign` será lido com `URLSearchParams`, normalizado pela função existente e validado antes da entrada. O fragmento continuará reservado para a tela ativa, permitindo links como `/?campaign=ABC123#inventario`. Ao entrar ou criar uma campanha, o parâmetro será atualizado com `history.replaceState`; ao sair, será removido.

Usar o fragmento para o código entraria em conflito com a navegação atual. Usar segmentos de caminho exigiria regras adicionais de rewrite no Hosting e no servidor local.

### Entrar automaticamente pelo link sem exigir credenciais

Depois de inicializar o modo de dados, a aplicação tentará entrar na campanha indicada pela URL. Um apelido salvo localmente será reutilizado; na ausência dele, será usado um rótulo local padrão, como `Jogador`, que poderá ser alterado na tela inicial. Perfil e apelido não concederão permissões.

A identificação local continua útil para o histórico, mas não bloqueará a abertura de um link nem será apresentada como login. A alternativa de exigir o nome antes da entrada contradiz o acesso direto solicitado.

### Manter autenticação anônima automática no Firebase

A aplicação continuará chamando `signInAnonymously` sem mostrar formulário, conta ou senha. As regras continuarão exigindo `request.auth != null`. Isso evita escrita totalmente pública por clientes não autenticados, embora qualquer usuário anônimo que conheça o código ainda possa alterar a campanha.

Remover toda autenticação exigiria regras públicas, aumentando abuso e custos sem melhorar a experiência do jogador, pois o fluxo anônimo já é invisível.

### Gerar códigos alfanuméricos e verificar colisões

Novas campanhas receberão códigos em alfabeto sem caracteres visualmente ambíguos, normalizados em maiúsculas. A criação verificará se o código já existe e tentará novamente; no Firebase, a gravação do documento principal deverá confirmar atomicamente que o código ainda não existe antes de criá-lo.

Aceitar códigos escolhidos livremente não é necessário para o compartilhamento e aumentaria colisões e enumeração previsível. Essa possibilidade pode ser proposta futuramente.

### Criar campanha com coleções de grupo vazias

A criação gravará somente o documento da campanha; `containers`, `items` e `history` começarão vazios, exceto pela entrada de histórico da própria criação. As telas existentes renderizarão estados vazios e direcionarão o usuário à área Grupo para adicionar o primeiro personagem ou animal. A adição de item permanecerá bloqueada até existir um portador.

Remover apenas os valores visuais, mas ainda criar portadores no banco, manteria dados indesejados e não atenderia ao requisito de grupo vazio.

### Reutilizar o modelo único de portadores

Personagens e animais continuarão usando a estrutura `containers`. O formulário mostrará atributos conforme o tipo: personagens configuram consumo diário de rações; animais configuram capacidade de carga. Os valores serão persistidos da mesma forma nos modos local e Firebase e permanecerão editáveis.

Reutilizar o modelo atual evita migração e mantém inventário, filtros, remoção segura e cálculos existentes compatíveis.

### Compartilhar URL canônica da campanha

A ação de cópia produzirá uma URL baseada em `location.origin` e `location.pathname`, com apenas o parâmetro `campaign` atualizado e, opcionalmente, a tela ativa no fragmento. Se a Clipboard API falhar, a interface exibirá o link para cópia manual. No modo local, a mensagem esclarecerá que o link só encontra dados existentes naquele navegador/origem.

## Risks / Trade-offs

- [Quem descobrir o código pode ler e alterar a campanha] → Manter códigos não ambíguos e suficientemente longos, documentar o modelo por posse e propor membros/permissões caso o app se torne público.
- [Autenticação anônima pode ser confundida com login] → Não exibir controles de autenticação e documentá-la somente como requisito técnico do Firebase.
- [Link de campanha local não funciona em outro dispositivo] → Informar claramente a limitação quando o Firebase não estiver configurado.
- [Dois criadores podem gerar o mesmo código] → Verificar existência e usar criação atômica no Firebase com novas tentativas.
- [Campanha vazia deixa inventário e rações sem destinos] → Exibir chamadas para adicionar integrantes e manter ações dependentes desabilitadas com mensagens específicas.
- [Apelidos padrão geram histórico pouco distinto] → Permitir apelido local editável sem bloquear o acesso.

## Migration Plan

1. Alterar a criação para não gerar portadores padrão; campanhas existentes não serão modificadas.
2. Adicionar leitura e escrita do parâmetro `campaign`, mantendo compatibilidade com entrada manual e retomada por `sessionStorage`.
3. Ajustar a tela inicial e estados vazios sem mudar o formato dos documentos existentes.
4. Atualizar compartilhamento, documentação e cache do service worker.
5. Testar URLs diretas, códigos inválidos, criação vazia e configuração de personagens/animais nos modos local e Firebase.
6. Em rollback, campanhas vazias continuam válidas para a versão anterior, e o parâmetro de URL apenas será ignorado.

## Open Questions

Nenhuma questão bloqueante. Controles de acesso por membros e códigos personalizados permanecem candidatos a mudanças futuras.
