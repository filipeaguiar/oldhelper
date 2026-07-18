## 1. Recursos estáticos e manifesto

- [x] 1.1 Adicionar o CSS e os arquivos de fonte do RPG Awesome em `public/vendor/rpg-awesome/`, sem dependência de CDN
- [x] 1.2 Gerar e adicionar ícones PWA PNG de 192×192, 512×512 e 512×512 maskable a partir da identidade visual do aplicativo
- [x] 1.3 Atualizar `public/manifest.webmanifest` com `id`, metadados de exibição e referências explícitas aos ícones `any` e `maskable`
- [x] 1.4 Referenciar o RPG Awesome local e os metadados PWA necessários em `public/index.html`

## 2. Experiência de instalação

- [x] 2.1 Adicionar ao HTML um banner de instalação inicialmente oculto, com mensagem e botões acessíveis para instalar e dispensar
- [x] 2.2 Estilizar o banner responsivo, seus estados oculto/visível, foco por teclado e integração com o tema existente
- [x] 2.3 Implementar em `public/app.js` a captura de `beforeinstallprompt`, a detecção de modo instalado e a apresentação condicional do banner
- [x] 2.4 Implementar as ações de instalar e dispensar, persistindo a dispensa na sessão e tratando `userChoice` e `appinstalled`

## 3. Interface com RPG Awesome

- [x] 3.1 Mapear e substituir ícones decorativos e de ação em Unicode presentes no HTML por glifos RPG Awesome semanticamente adequados
- [x] 3.2 Atualizar os templates dinâmicos de `public/app.js` para renderizar RPG Awesome no lugar de caracteres usados como ícones, preservando operadores e conteúdo textual
- [x] 3.3 Substituir os textos visíveis das cinco abas principais por ícones distintos, mantendo `title`, `aria-label` e áreas de toque adequadas
- [x] 3.4 Atualizar a troca de abas para manter `aria-current="page"` exclusivamente no destino ativo
- [x] 3.5 Revisar todos os controles somente com ícone para garantir nome acessível, foco visível e ausência de caracteres Unicode decorativos remanescentes

## 4. Offline, atualização e validação

- [x] 4.1 Incrementar a versão do cache e adicionar manifesto, ícones PNG, CSS e fontes do RPG Awesome ao precache em `public/service-worker.js`
- [x] 4.2 Validar sintaxe JavaScript, caminhos dos recursos e integridade do manifesto após as alterações
- [x] 4.3 Testar em navegador Chromium por HTTPS os cenários de banner disponível, dispensa, aceitação/recusa, instalação concluída e execução standalone
- [x] 4.4 Testar por teclado e tecnologia assistiva os nomes, foco e estado ativo dos controles iconográficos e das abas
- [x] 4.5 Testar um novo carregamento sem rede após o precache e confirmar que a estrutura, a fonte RPG Awesome e os ícones PWA continuam disponíveis
