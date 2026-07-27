# Central de Overlays — Desktop

App desktop (Electron) que substitui o TikFinity: conecta direto na sua
live do TikTok usando a biblioteca [`tiktok-live-connector`](https://github.com/zerodytrash/TikTok-Live-Connector)
(só o `@` do perfil, sem senha) e repassa os eventos — mensagem, like,
presente, seguidor, compartilhamento — pra um servidor WebSocket local
na porta `21213`, exatamente o formato que a Central de Overlays
(`index.html`, na pasta de cima) já espera por padrão no campo
"Endereço da conexão" da Config. **O `index.html` não precisa de
nenhuma alteração** para funcionar com este app.

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
