## Context

O aplicativo é uma SPA estática sem etapa de build, hospedada no Firebase Hosting. Ele já registra um service worker e declara um manifesto com modo `standalone`, mas oferece somente um ícone SVG e não captura o evento de instalação do navegador. A interface mistura texto, emojis e símbolos Unicode em controles. A solução deve continuar simples, funcionar offline e não depender de uma CDN em tempo de execução.

## Goals / Non-Goals

**Goals:**
- Satisfazer os critérios práticos de instalação dos navegadores com manifesto, ícones rasterizados adequados e service worker.
- Oferecer uma chamada de instalação contextual, acessível e que respeite os estados do navegador.
- Padronizar a iconografia com RPG Awesome, incluindo uma navegação principal compacta e compreensível por tecnologias assistivas.
- Preservar a execução offline ao hospedar e armazenar todos os novos recursos localmente.

**Non-Goals:**
- Implementar instruções manuais específicas para instalação no iOS quando não houver prompt programático.
- Criar uma loja de aplicativos ou empacotar o site como aplicativo nativo.
- Alterar fluxos de campanha, persistência, Firebase ou permissões.
- Introduzir um bundler ou framework de componentes.

## Decisions

### Banner próprio baseado em `beforeinstallprompt`

`app.js` capturará `beforeinstallprompt`, impedirá a promoção automática e guardará o evento enquanto ele for válido. O banner ficará oculto por padrão e aparecerá somente quando esse evento existir, a aplicação não estiver em modo `standalone` e o usuário não o tiver dispensado durante a sessão. O botão principal chamará `prompt()`, aguardará `userChoice` e descartará a referência; o evento `appinstalled` também ocultará e limpará o estado. A dispensa será mantida em `sessionStorage`, permitindo uma nova oportunidade em uma visita futura sem importunar o usuário na mesma sessão.

Alternativa considerada: mostrar sempre um botão com instruções por navegador. Isso criaria estados sem ação confiável e exigiria manutenção específica por plataforma; por isso, o banner será orientado pela capacidade nativa.

### Manifesto com ícones PNG explícitos

Serão fornecidos ícones PNG de 192×192 e 512×512, incluindo finalidade `any` e uma variante 512×512 `maskable`, mantendo o SVG como favicon quando conveniente. O manifesto também declarará um `id` estável. Recursos rasterizados evitam incompatibilidades de navegadores que não consideram somente SVG suficiente para instalação.

Alternativa considerada: continuar usando apenas `sizes: any` em SVG. Apesar de suportado em alguns navegadores, isso não oferece compatibilidade tão previsível quanto os tamanhos rasterizados recomendados.

### RPG Awesome hospedado localmente

O CSS e os arquivos de fonte necessários do RPG Awesome serão adicionados sob `public/vendor/rpg-awesome/`, referenciados pelo HTML e incluídos no precache. Isso mantém a aplicação funcional offline e evita dependência operacional ou de privacidade de uma CDN. Os caracteres usados como decoração ou representação de ações serão trocados por elementos `<i>`/`span` com classes `ra`, escolhendo o glifo semanticamente mais próximo. Operadores que constituem conteúdo textual ou matemático, e não iconografia, podem permanecer como texto.

Alternativa considerada: carregar RPG Awesome por CDN. Foi rejeitada porque o primeiro uso offline poderia perder todos os ícones e porque a aplicação atual é autocontida.

### Navegação somente visual, mas semanticamente nomeada

Cada aba principal conterá apenas o ícone visual e terá `aria-label` e `title` com o nome atual da seção. O estado ativo continuará expresso pela classe existente e será complementado por `aria-current="page"`, atualizado junto com a troca de painel. Áreas clicáveis manterão dimensões adequadas para toque.

Alternativa considerada: esconder o texto apenas em telas pequenas. A solicitação pede a substituição do texto nas abas; nomes acessíveis preservam a compreensão sem reintroduzir rótulos visuais.

### Atualização do cache do service worker

A versão nominal do cache será incrementada e todos os novos ícones, CSS e fontes serão adicionados à lista de recursos. A estratégia de rede existente será preservada, com cache como fallback offline, para que um deploy continue priorizando arquivos atuais quando houver conexão.

## Risks / Trade-offs

- [O evento `beforeinstallprompt` não existe em todos os navegadores, especialmente Safari/iOS] → Não mostrar um botão inoperante; manter a instalação pelo menu nativo fora do escopo deste incremento.
- [A fonte de ícones aumenta o tamanho do primeiro carregamento] → Hospedar apenas os arquivos necessários, usar formato de fonte compacto disponível e aproveitar o cache offline.
- [Um ícone RPG Awesome pode não corresponder exatamente a cada símbolo atual] → Priorizar significado, adicionar nome acessível aos controles e manter texto quando o símbolo não for apenas decorativo.
- [Usuários com uma aba já aberta não recebem instantaneamente o novo HTML] → O próximo carregamento online usa a estratégia network-first; a mudança não força recarga durante uma operação ativa.

## Migration Plan

1. Adicionar os recursos locais do RPG Awesome e os ícones PNG do aplicativo.
2. Atualizar HTML, estilos, manifesto e comportamento de instalação.
3. Atualizar a lista e a versão do cache do service worker.
4. Validar navegação, acessibilidade, instalação e fallback offline antes do deploy normal no Firebase Hosting.
5. Em caso de regressão, reverter o commit e publicar novamente; não há migração de dados.

## Open Questions

Nenhuma decisão bloqueante. A disponibilidade real do prompt será validada em um navegador Chromium servido por HTTPS, pois ambientes locais ou navegadores sem suporte não emitem o evento.
