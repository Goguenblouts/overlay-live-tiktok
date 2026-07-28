# Central de Overlays — Desktop

App desktop (Electron) que conecta direto na sua live do TikTok — sem
precisar do TikFinity nem de nenhum outro programa intermediário — usando
a biblioteca [`tiktok-live-connector`](https://github.com/zerodytrash/TikTok-Live-Connector)
(só o `@` do perfil, sem senha) e repassa os eventos — mensagem, like,
presente, seguidor, compartilhamento — pra um servidor WebSocket local
na porta `21213`, exatamente o formato que a Central de Overlays
(`index.html`, na pasta de cima) já espera por padrão no campo
"Endereço da conexão" da Config. **O `index.html` não precisa de
nenhuma alteração** para funcionar com este app.

**Como isso funciona por baixo dos panos:** o TikTok não tem uma API
oficial pra isso. O `tiktok-live-connector` é um projeto de engenharia
reversa (o próprio README dele deixa isso bem claro: *"This is not a
production-ready API. It is a reverse engineering project."*) — ele
conversa direto com o serviço interno "Webcast" que o TikTok usa pra
alimentar o chat da live, do mesmo jeito que o TikFinity e outros
programas parecidos fazem. Não precisa de login nem senha, só do `@`
público do perfil que está ao vivo. Como não é oficial, o TikTok pode
mudar esse serviço interno a qualquer momento e quebrar a conexão —
nesse caso, normalmente uma atualização da biblioteca (`npm update`)
resolve. A licença dela é AGPL-3.0.

## Como rodar

```bash
cd central-overlays-desktop
npm install
npm start
```

Duas janelas abrem:
- **Central de Overlays** — o painel de sempre (`index.html`), pra
  configurar overlays, copiar links pro OBS/TikTok Studio, etc.
- **Conexão com a live** — janela pequena pra digitar o `@` do perfil
  que está ao vivo e clicar em Conectar.

Depois de conectar, os overlays (Browser Source no OBS/TikTok Studio)
continuam funcionando exatamente como antes — eles só recebem os
eventos de uma fonte diferente (este app, em vez do TikFinity).

**Importante:** feche o TikFinity antes de abrir este app — os dois
tentam usar a porta `21213` ao mesmo tempo, e só um consegue.

## Gerando um instalador (`npm run dist`)

O `package.json` já vem com `electron-builder` configurado. Antes de
gerar o instalador, **copie** `index.html`, `styles.css` e os arquivos
`js-*.js` (da pasta de cima) pra dentro desta pasta (`central-overlays-desktop/`) —
o electron-builder empacota só o que está dentro da própria pasta do
projeto, não arquivos fora dela. Depois disso:

```bash
npm run dist
```

O instalador sai em `central-overlays-desktop/dist/`.

## Sobre o import do `tiktok-live-connector` (importante se você atualizar a lib)

A partir da v2, o pacote raiz `tiktok-live-connector` passou a exportar só
a classe nova `TikTokLiveConnection` (payload aninhado, ex:
`data.user.uniqueId`). A classe antiga `WebcastPushConnection` (payload
"achatado", ex: `data.uniqueId` — o formato que este `main.js` usa) só
existe no subcaminho `tiktok-live-connector/legacy`, mantido pela própria
lib pra compatibilidade. Por isso o import aqui é:

```js
const { WebcastPushConnection } = await import("tiktok-live-connector/legacy");
```

Se um dia quiser migrar pra API nova (`TikTokLiveConnection` +
`WebcastEvent`), os campos mudam de nome/formato (ex: `data.user.uniqueId`
em vez de `data.uniqueId`, `data.giftDetails.giftType` em vez de
`data.giftType`, eventos `follow`/`share` separados em vez de um único
`social` com `displayType`) — dá pra fazer, mas exige reescrever os
handlers de `chat`/`like`/`gift`/`social` deste arquivo.

## Ponto em aberto: campo de diamantes do presente

O nome exato do campo com a quantidade de diamantes de um presente
pode variar um pouco conforme a versão da biblioteca. Em `main.js`,
o handler do evento `gift` já imprime o payload cru no console
(`[tiktok-live] evento de presente (cru, pra debug):`) — na primeira
live de teste, receba um presente, olhe esse log e confirme que
`data.diamondCount` está vindo com o valor certo. Se não estiver, o
campo real vai aparecer no mesmo log; é só ajustar a linha:

```js
const diamantes = data.diamondCount ?? data?.gift?.diamond_count ?? data?.giftDetails?.diamondCount ?? 1;
```

## Estrutura

```
central-overlays-desktop/
├── main.js              → processo principal do Electron (servidor WS + conexão TikTok)
├── control.html          → janela "Conexão com a live" (digitar @ e conectar)
├── control-preload.js    → ponte seguro entre control.html e main.js
├── package.json
└── build/                → ícones do instalador (opcional — veja build/README.md)
```

## Dependências

- `electron` / `electron-builder` — app desktop + gerador de instalador
- `ws` — servidor WebSocket local (porta 21213)
- `tiktok-live-connector` — conexão direta com a live do TikTok
