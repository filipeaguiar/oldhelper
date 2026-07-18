# Old Helper — Carga do Grupo

Aplicativo web simples para inventário compartilhado em sessões de Old Dragon 2. O projeto usa apenas HTML, CSS e JavaScript no navegador. O Firebase é opcional: sem ele, o app funciona localmente; com ele, os celulares e computadores do grupo sincronizam a mesma campanha em tempo real.

## Recursos desta versão

- Interfaces separadas para Resumo, Inventário, Rações e compras, Grupo e Histórico.
- Quantidade dinâmica de personagens, animais de carga e depósitos.
- Adição, edição e remoção segura de portadores.
- Transferência automática de todos os itens antes de remover um portador ocupado.
- Seleção múltipla de itens para transferência em massa a um animal de carga.
- Itens com nome, descrição editável, observações, quantidade, carga e portador.
- Itens podem funcionar como contêineres de outros itens, com organização em vários níveis.
- Controle de flechas, virotes, rações, moedas e cargas de itens mágicos.
- Ouro/PO, PP e PC armazenados com qualquer personagem ou animal.
- Uma mochila equipada por personagem, aumentando sua capacidade de carga em 5.
- Calculadora de rações por participante, dias e margem de segurança.
- Compra direta de rações: debita as moedas do portador escolhido e adiciona o estoque ao destino.
- Transação atômica no Firestore para evitar compras parcialmente registradas.
- Acesso sem conta ou senha por código alfanumérico ou link de campanha.
- Campanhas novas com grupo vazio, pronto para cadastrar personagens e animais reais.
- Histórico de alterações atribuído a um apelido salvo somente no navegador.
- Exportação e importação de campanha em JSON.
- PWA instalável e hospedagem preparada para Firebase Hosting.

## Estrutura

```text
old-helper-app-atualizado/
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── README.md
└── public/
    ├── index.html
    ├── styles.css
    ├── app.js
    ├── firebase-config.js
    ├── manifest.webmanifest
    ├── service-worker.js
    └── icon.svg
```

## Testar sem Firebase

Na pasta do projeto, execute:

```bash
python3 -m http.server 8080 --directory public
```

Abra:

```text
http://localhost:8080
```

Nesse modo, os dados ficam no `localStorage` do navegador e são compartilhados apenas entre abas da mesma origem.

## Acessar e compartilhar campanhas

Ao criar uma campanha, o app gera um código alfanumérico e atualiza a URL com `?campaign=CODIGO`. Outros participantes podem digitar esse código na tela inicial ou abrir o link copiado ao clicar no código da campanha. A última campanha acessada fica salva no `localStorage` e é reaberta automaticamente nas próximas visitas; a ação **Sair** remove essa preferência.

Não há cadastro de conta, e-mail ou senha. O apelido e o perfil da tela inicial são apenas uma identificação local para o histórico; se o apelido estiver vazio, o app usa `Jogador` e não bloqueia a abertura de links.

- **Modo local:** o link só encontra a campanha na mesma origem e no mesmo navegador em que ela foi criada. Ele não transfere dados para outro dispositivo.
- **Modo Firebase:** o mesmo código ou link abre os dados sincronizados em navegadores e dispositivos diferentes.

Na edição de um personagem, a opção **Este personagem é meu neste dispositivo** o destaca e o mantém antes dos demais personagens nas listas. Essa preferência é local para que cada participante possa escolher seu próprio personagem sem alterar a escolha dos outros.

O acesso funciona por posse do código: qualquer pessoa que conheça o código pode abrir e alterar a campanha. O código não deve ser tratado como uma senha forte.

## Configurar Firebase Authentication e Firestore

### 1. Criar o projeto

1. Abra o Firebase Console.
2. Crie um projeto.
3. Dentro do projeto, crie um aplicativo do tipo **Web**.
4. Copie o objeto de configuração exibido pelo Firebase.

### 2. Configurar o aplicativo Web

Edite `public/firebase-config.js` e preencha:

```js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

A configuração Web pode ficar no site publicado. A segurança do banco é controlada pelas regras do Firestore, não pelo segredo desses valores.

### 3. Ativar autenticação anônima

No Firebase Console:

1. Abra **Authentication**.
2. Entre em **Sign-in method**.
3. Ative o provedor **Anonymous/Anônimo**.

O app realiza essa autenticação técnica automaticamente e em segundo plano para que as regras do Firestore não precisem tornar o banco público. Ela não é apresentada como login: jogadores e Mestre não criam conta nem informam senha.

### 4. Criar o Firestore

1. Abra **Firestore Database**.
2. Crie o banco.
3. Escolha a região apropriada para o grupo.

Não é necessário criar coleções manualmente. O app cria `campaigns` e, conforme o grupo for configurado, suas subcoleções `containers`, `items` e `history`. Campanhas novas não recebem personagens, animais ou itens predefinidos.

## Publicar regras e site no Firebase Hosting

### 1. Instalar a CLI

É necessário ter Node.js instalado na máquina. Depois:

```bash
npm install -g firebase-tools
firebase login
```

### 2. Associar esta pasta ao projeto

Entre na pasta descompactada:

```bash
cd old-helper-app-atualizado
firebase use --add
```

Selecione o projeto criado e defina o alias `default`.

### 3. Publicar

```bash
firebase deploy --only hosting,firestore:rules
```

Ao terminar, a CLI mostrará o endereço do site, normalmente no formato:

```text
https://seu-projeto.web.app
```

Para publicar apenas uma atualização do HTML/JavaScript:

```bash
firebase deploy --only hosting
```

Para publicar somente as regras:

```bash
firebase deploy --only firestore:rules
```

## Como organizar itens dentro de outros itens

1. No Inventário, adicione ou edite o item que servirá de recipiente.
2. Ative **Pode guardar outros itens** e salve.
3. Ao adicionar, editar ou transferir outro item, selecione o recipiente no campo **Guardado em**.
4. O conteúdo aparecerá recuado abaixo do item contêiner e continuará contando para a carga e os totais do portador principal.

Contêineres podem ser aninhados em vários níveis e são transferidos junto com todo o seu conteúdo. Para evitar perda acidental, um contêiner não pode ser desmarcado nem excluído enquanto possuir itens. Esta versão não aplica capacidade máxima, redução de carga ou regras dimensionais aos recipientes.

## Como registrar ouro no animal de carga

No Inventário:

1. Clique em **Adicionar item**.
2. Use a categoria **Moeda**.
3. Escolha a unidade `PO`, `PP` ou `PC`.
4. Escolha o animal como portador.
5. Informe a quantidade.

A tela **Rações e compras** poderá usar esse saldo diretamente.

## Calculadora de rações

1. Na tela **Grupo**, configure quem consome rações e quanto consome por dia.
2. Na tela **Rações e compras**, escolha os participantes da viagem.
3. Informe dias, margem e preço unitário.
4. Escolha de quem sairão as moedas e onde as rações serão guardadas.
5. Confirme a compra.

O estoque atual considera todos os itens da categoria `Ração` na campanha.

## Segurança do MVP

As regras incluídas exigem a autenticação anônima e invisível feita pelo app, mas qualquer pessoa que conheça o código da campanha pode alterar os dados. O modelo de acesso é por posse do código, adequado para um grupo privado pequeno; o código não é uma credencial forte. Para transformar o projeto em serviço público, implemente membros por campanha, convites e permissões de Mestre.

## Atualização de uma versão anterior

A importação JSON aceita a estrutura anterior. Campos novos de personagens e animais recebem valores padrão. Antes de atualizar um site já usado, exporte a campanha pelo menu de configurações como cópia de segurança.
