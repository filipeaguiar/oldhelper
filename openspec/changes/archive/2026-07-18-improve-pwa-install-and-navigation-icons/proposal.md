## Why

Embora o aplicativo já possua manifesto e service worker básicos, ele não orienta o usuário a instalá-lo e ainda depende de um ícone SVG que pode não atender aos critérios de instalação de todos os navegadores. Além disso, a interface usa caracteres Unicode inconsistentes como ícones e uma navegação textual que ocupa espaço excessivo, especialmente em telas móveis.

## What Changes

- Tornar a experiência PWA instalável de forma consistente, incluindo os recursos de ícone exigidos pelos navegadores.
- Exibir um banner próprio de instalação quando o navegador disponibilizar a instalação do PWA, com ações para instalar ou dispensar.
- Tratar instalação concluída, indisponibilidade do prompt e execução em modo instalado sem mostrar uma ação inválida.
- Incorporar RPG Awesome à aplicação e substituir ícones decorativos/de ação em Unicode por ícones dessa biblioteca.
- Substituir os textos visíveis das abas da navegação principal por ícones RPG Awesome, preservando nomes acessíveis e dicas de contexto.
- Manter a aplicação e seus ícones utilizáveis offline após o primeiro carregamento.

## Capabilities

### New Capabilities
- `pwa-install-experience`: Instalação do aplicativo por manifesto e banner contextual, incluindo estados de disponibilidade, dispensa e conclusão.
- `rpg-icon-interface`: Iconografia consistente com RPG Awesome e navegação principal compacta baseada em ícones acessíveis.

### Modified Capabilities

Nenhuma.

## Impact

Afeta `public/index.html`, `public/app.js`, `public/styles.css`, `public/manifest.webmanifest`, `public/service-worker.js` e os recursos estáticos de ícones/fontes em `public/`. A inclusão do RPG Awesome adiciona recursos CSS e de fonte que devem ser hospedados pela própria aplicação; não há alteração nas APIs ou no modelo de dados do Firebase.
