/* ============================================================
   CENTRAL DE OVERLAYS
   - sem parâmetro na URL: mostra o painel (lista + config + tema)
   - ?view=metas    : overlay das metas da live (Browser Source)
   - ?view=ranking  : overlay do ranking de seguidores (Browser Source)
   - ?view=alerta   : overlay que mostra um card quando chega um
                      presente grande (Browser Source à parte)
   - ?view=combo    : overlay com contador de combo/sequência
                      (Browser Source à parte)
   - acrescente &sim=1 no final de qualquer link acima pra testar
     sem live e sem o TikFinity ligado (gera eventos falsos sozinho).
   Pra criar um overlay novo no futuro: adiciona um item em
   OVERLAYS e uma função render<Nome>() seguindo o padrão dos que
   já existem. Toda a parte visual usa cfg.tema, então overlays
   novos herdam a mesma personalização de graça.
   ============================================================ */

const OVERLAYS = [
  { id: "metas",   nome: "Prêmios da live",       desc: "Avisa quando um espectador desbloqueia um prêmio" },
  { id: "ranking", nome: "Ranking de seguidores", desc: "Top espectadores por pontos" },
  { id: "alerta",  nome: "Alerta de presente",    desc: "Card temporário quando chega um presente grande" },
  { id: "combo",   nome: "Combo / sequência",     desc: "Contador ao vivo de likes e presentes em sequência" },
  { id: "vitrine", nome: "Vitrine de prêmios",    desc: "Lista dos prêmios passando em loop na tela, da direita pra esquerda" },
  { id: "eventos", nome: "Eventos personalizados", desc: "Dispara as regras (gatilho → ação) criadas na aba Eventos" },
  { id: "tts",     nome: "Texto-pra-voz",         desc: "Lê mensagens, presentes e mais em voz alta, com a voz sintética do navegador" },
  { id: "spinner", nome: "Roleta de presente",    desc: "Roleta que sorteia uma ação quando o presente configurado chega" },
];

const PRESETS_TEMA = {
  "Navy StreamToEarn": { corPrimaria: "#7C3AED", corFundo: "#0a0e27", corCard: "#141b42", corBorda: "#262c52", corTexto: "#ffffff", corTextoSec: "#9ca3c4", raio: 14, fonte: "padrao" },
  "Verde neon":       { corPrimaria: "#1D9E75", corFundo: "#0d1512", corCard: "#152420", corBorda: "#1f3a32", corTexto: "#ffffff", corTextoSec: "#8fb3a8", raio: 12, fonte: "padrao" },
  "Roxo gamer":        { corPrimaria: "#7F77DD", corFundo: "#120f1f", corCard: "#1c1830", corBorda: "#332c52", corTexto: "#ffffff", corTextoSec: "#b3aee0", raio: 14, fonte: "montserrat" },
  "Rosa vibrante":     { corPrimaria: "#D4537E", corFundo: "#1a0f14", corCard: "#2a1620", corBorda: "#4a2534", corTexto: "#ffffff", corTextoSec: "#e0a8bc", raio: 16, fonte: "poppins" },
  "Escuro minimalista": { corPrimaria: "#f5f5f0", corFundo: "#0a0a0a", corCard: "#161616", corBorda: "#2a2a2a", corTexto: "#ffffff", corTextoSec: "#8a8a85", raio: 6, fonte: "bebas" },
  "Ciano cyber":       { corPrimaria: "#22D3EE", corFundo: "#07161a", corCard: "#0f2429", corBorda: "#1b3d44", corTexto: "#ffffff", corTextoSec: "#8fd6e0", raio: 10, fonte: "montserrat" },
  "Dourado elegante":  { corPrimaria: "#F0C24B", corFundo: "#161208", corCard: "#241d0f", corBorda: "#44392a", corTexto: "#ffffff", corTextoSec: "#d9c093", raio: 8, fonte: "poppins" },
};

const FONTES = {
  padrao:     { nome: "Padrão", css: "Arial, sans-serif", googleFamily: null },
  poppins:    { nome: "Poppins", css: "'Poppins', sans-serif", googleFamily: "Poppins:wght@400;600;700" },
  montserrat: { nome: "Montserrat", css: "'Montserrat', sans-serif", googleFamily: "Montserrat:wght@400;600;700" },
  bebas:      { nome: "Bebas Neue (números grandes)", css: "'Bebas Neue', sans-serif", googleFamily: "Bebas+Neue" },
};

const CONFIG_PADRAO = {
  tikfinityWsUrl: "ws://127.0.0.1:21213/",
  valores: {
    mensagem: 1,
    likeACada: 100,
    likeValor: 5,
    // pontos de presente: por FAIXA de tamanho (parecido com os pacotes
    // de moeda que o próprio TikTok vende) — presente pequeno vale menos
    // por diamante, presente grande vale mais por diamante, pra quem
    // manda um presente caro sentir a diferença de verdade no placar.
    // "ate" é o teto de diamantes daquela faixa (null = sem teto, pega
    // tudo que sobrar); "pontos" é quantos pontos vale CADA diamante
    // dentro da faixa. presenteMinimo é um piso por presente, pra um
    // presente bem baratinho não valer 0. Ver pontosDoPresente() mais
    // abaixo no arquivo.
    faixasPresente: [
      { ate: 20, pontos: 10 },
      { ate: 100, pontos: 15 },
      { ate: 300, pontos: 20 },
      { ate: null, pontos: 25 },
    ],
    presenteMinimo: 10,
    seguidor: 3,
    compartilhamento: 5,
  },
  exigirSeguidor: true,
  tamanhoRanking: 5,
  // TODOS os pontos (mensagem/like/presente/seguidor/compartilhamento)
  // acumulam o mês inteiro sem perder nada — só zeram na virada do mês
  // (calendário) ou se a pessoa resetar manualmente em Config > Zona de
  // risco. Não existe mais reset automático por live parada.
  // cada tier é um prêmio que O ESPECTADOR ganha quando os pontos DELE
  // (somando as fontes escolhidas — pode misturar presente com
  // mensagem/like/seguidor/compartilhamento à vontade) baterem o valor.
  tiers: [
    { id: "baixo",  nome: "Jam track",       pontos: 315,  fontes: ["mensagem", "like", "compartilhamento"] },
    { id: "medio1", nome: "Emote",            pontos: 785,  fontes: ["presente"] },
    { id: "medio2", nome: "Battle pass",       pontos: 1375, fontes: ["presente"] },
    { id: "epico",  nome: "Bundle de skin",    pontos: 3410, fontes: ["presente"] },
  ],
  // tema padrão: navy + roxo + laranja, no estilo StreamToEarn — mais
  // simples e objetivo que o antigo verde. Pode ser trocado a qualquer
  // hora em Aparência (inclusive pelos outros presets, que continuam
  // disponíveis).
  tema: {
    corPrimaria: "#7C3AED",
    corFundo: "#0a0e27",
    corCard: "#141b42",
    corBorda: "#262c52",
    corTexto: "#ffffff",
    corTextoSec: "#9ca3c4",
    raio: 14,
    fonte: "padrao",
    animacaoEstilo: "slide",
  },
  animacoes: true,
  // sobrescritas de cor por overlay: cada chave (metas/ranking/alerta/
  // combo/vitrine/eventos) pode ter um objeto parcial (mesmos campos de
  // "tema") que substitui só naquele overlay — o resto continua vindo do
  // tema global da aba Aparência. {} = sem sobrescrita, usa o global.
  overlayTema: { metas: {}, ranking: {}, alerta: {}, combo: {}, vitrine: {}, eventos: {}, tts: {}, spinner: {} },
  alerta: { ativo: true, valorMinimo: 50, duracaoMs: 5000 },
  combo: { ativo: true, janelaMs: 2500, fontes: ["like", "presente"] },
  // layout de exibição do overlay de Prêmios da live: "lateral" (card no
  // canto, padrão), "barra" (faixa inferior) ou "popup" (card grande centralizado)
  metas: { layout: "lateral" },
  sons: {
    volume: 70,
    presente: { ativo: true, som: "moeda", url: "" },
    premio:   { ativo: true, som: "fanfarra", url: "" },
    seguidor: { ativo: true, som: "ding", url: "" },
    combo:    { ativo: true, som: "pop", url: "", aCada: 5 },
  },
  // automações estilo TikFinity: "ações" são reações reutilizáveis
  // (card + som), "eventos" são regras gatilho→ação (quando X acontecer,
  // dispare a ação Y). Roda na nova aba/overlay "Eventos".
  // variáveis globais: contadores/valores que as regras podem ler
  // (nas condições, comparando o valor atual) e escrever (nos efeitos,
  // incrementar/decrementar/definir quando a regra dispara). Usadas no
  // texto das ações com {var:nome}.
  automacoes: {
    acoes: [],
    eventos: [],
    variaveis: [],
    // Sistema de Fila (Fase 4): como o overlay de Eventos se comporta
    // quando vários eventos chegam rápido demais pra mostrar um por vez.
    filaConfig: { maximoItens: 20, agruparIguais: false, ignorarDuplicados: false },
  },
  // Texto-pra-voz: lê eventos em voz alta com a voz sintética do
  // navegador (Web Speech API) — sem serviço externo, sem chave. Cada
  // tipo de evento liga/desliga e tem seu próprio modelo de frase.
  tts: {
    ativo: false,
    volume: 80,
    taxa: 1,
    tom: 1,
    vozURI: "",
    ignorarComandos: true,
    tamanhoMaximo: 200,
    eventos: {
      mensagem: { ativo: true, template: "{nickname} disse: {mensagem}" },
      presente: { ativo: true, template: "{nickname} mandou {presente}!" },
      seguidor: { ativo: false, template: "{nickname} começou a seguir!" },
      like: { ativo: false, template: "{nickname} curtiu a live" },
      compartilhamento: { ativo: false, template: "{nickname} compartilhou a live!" },
    },
  },
  // Roleta de presente (Gift Spinner): quando o gatilho configurado
  // acontece, a roda gira e sorteia uma "fatia" (uma Ação já criada em
  // Eventos, com peso = chance de sair). "qualquer" olha o valor em
  // diamantes; "especifico" olha o nome exato do presente.
  spinner: {
    ativo: false,
    modoGatilho: "qualquer",
    nomePresenteEspecifico: "",
    valorMinimo: 100,
    duracaoGiroMs: 4000,
    fatias: [],
  },
};

// Identidade fixa do criador — aparece na barra superior (Doar/Meus links).
// De propósito NÃO faz parte do CONFIG_PADRAO/salvarConfig: não é editável
// em nenhuma tela e não sincroniza com a nuvem — é exclusiva e fica igual
// pra qualquer pessoa que abrir o painel.
const PERFIL_FIXO = {
  nomeExibicao: "Marcelio Venancio (@goguenblouts)",
  livepix: "https://livepix.gg/goguenblouts",
  links: [
    { label: "TikTok Live", url: "https://www.tiktok.com/@goguenblouts" },
    { label: "Twitch", url: "https://www.twitch.tv/goguenblouts" },
    { label: "Kick", url: "https://kick.com/goguenblouts" },
    { label: "Instagram", url: "https://www.instagram.com/marcelio_venancio/" },
    { label: "Discord", url: "https://discord.gg/bzN88hAq" },
    { label: "YouTube", url: "https://www.youtube.com/@MarcelioVenancioTopic" },
    { label: "Spotify", url: "https://open.spotify.com/artist/4ASKzkcV8oXC1lVFByJwYD" },
    { label: "Portfólio", url: "https://marceliovenancio.vercel.app/" },
    { label: "Troca de Sprites", url: "https://goguenblouts.github.io/troca-sprites-ttk/" },
  ],
};

// ------------------------------------------------------------
// MANUAIS DE USO: um guia curto por ferramenta, mostrado no botão
// "Manuais" da barra superior. Cada item é {h: "titulo"} (subtítulo),
// {p: "texto"} (parágrafo) ou {li: [...]} (lista) — usado tanto pro
// modal (HTML) quanto pro PDF gerado com jsPDF, por isso fica em texto
// puro, sem tags HTML dentro das strings.
// ------------------------------------------------------------
const MANUAIS = [
  {
    id: "primeiros-passos",
    titulo: "Primeiros passos",
    icone: "fa-solid fa-rocket",
    cor: "var(--ic-links)",
    resumo: "Como conectar tudo e colocar os overlays no ar pela primeira vez.",
    secoes: [
      { h: "O que você precisa" },
      { li: [
        "O app Central de Overlays — Desktop instalado e aberto no seu PC (conecta direto na sua live do TikTok, só com o @ do perfil — não precisa de TikFinity nem de mais nenhum programa intermediário).",
        "Um programa de transmissão com suporte a Browser Source (fonte de navegador) — OBS Studio, Streamlabs, TikTok LIVE Studio, XSplit, vMix, etc.",
      ] },
      { h: "Passo a passo" },
      { li: [
        "Abra o app Central de Overlays — Desktop, digite o @ do perfil que está ao vivo na janela \"Conexão com a live\" e clique em Conectar.",
        "O endereço da conexão (ws://127.0.0.1:21213/) já vem preenchido por padrão em Config > Conexão — não precisa mexer em nada aí, a menos que você troque de fonte.",
        "Vá na aba Overlays, escolha qual overlay quer usar (Prêmios da live, Ranking, Alerta, Combo, Vitrine ou Eventos) e copie o link dele.",
        "No seu programa de transmissão, crie uma fonte do tipo Browser Source (fonte de navegador), cole o link, e defina o tamanho como 1920x1080.",
        "Repita pra cada overlay que quiser usar — dá pra usar todos ao mesmo tempo, em fontes separadas.",
      ] },
      { h: "Testando antes de ir ao vivo" },
      { p: "Use a aba Simulador pra ver e ouvir a reação dos overlays sem precisar estar transmitindo de verdade — muito útil pra ajustar cores, sons e regras com calma antes da live." },
      { h: "Uma coisa importante" },
      { p: "Qualquer mudança que você salvar no painel atualiza sozinha em todo overlay que já estiver aberto no OBS — não precisa copiar o link de novo nem reiniciar a fonte de navegador." },
    ],
  },
  {
    id: "premios-da-live",
    titulo: "Prêmios da live (Metas)",
    icone: "fa-solid fa-trophy",
    cor: "var(--ic-links)",
    resumo: "Cada espectador junta pontos e desbloqueia prêmios conforme interage com a sua live.",
    secoes: [
      { h: "O que é" },
      { p: "Cada espectador acumula pontos por conta própria — mandando mensagem, curtindo, mandando presente, seguindo, compartilhando ou recebendo pontos na mão de você — e desbloqueia prêmios (chamados de \"tiers\") conforme os pontos dele batem os valores configurados. Quando alguém desbloqueia um prêmio, aparece um card avisando na tela. Todo ponto acumula o mês inteiro, sem resetar entre uma live e outra." },
      { h: "Escolhendo o que vale pra cada prêmio" },
      { p: "Cada prêmio tem sua própria lista de fontes (mensagem, like, presente, seguidor, compartilhamento, manual) — marque quantas quiser, inclusive misturando presente com engajamento (ou pontos manuais) no mesmo prêmio. Os pontos de todas as fontes marcadas somam juntos pra aquele prêmio." },
      { h: "Pontos de presente" },
      { p: "Cada presente vale pelo tamanho dele em diamantes: quanto maior o presente, maior a faixa em que ele cai, e cada faixa tem seu próprio \"pontos por diamante\" — presentes grandes valem proporcionalmente mais, não é só uma conta fixa. Tem também um piso mínimo (\"mínimo por presente\"), pra presente baratinho ainda somar alguma coisa. Ajuste as faixas e o piso em Config > Pontuação por ação (ou na aba de Config do próprio overlay)." },
      { h: "Pontos manuais" },
      { p: "Em Config > Pontos manuais dá pra somar (ou tirar, com número negativo) pontos na mão de um espectador pelo nome — cai na fonte \"manual\", que você escolhe se cada prêmio conta ou não. Funciona mesmo com o overlay já aberto no OBS, atualiza sozinho." },
      { h: "Como criar ou editar um prêmio" },
      { p: "Vá em Overlays, clique em Config no card \"Prêmios da live\", e mexa na lista de prêmios: nome, quantos pontos precisa pra ganhar, ícone, e as fontes que somam pra ele." },
      { h: "Modelo visual" },
      { p: "Escolha entre três layouts: lateral (card no canto, o padrão), barra (faixa na parte de baixo da tela) ou popup (card grande centralizado)." },
      { h: "Resetando os pontos" },
      { p: "Os pontos zeram sozinhos só na virada do mês (calendário). Se quiser começar do zero antes disso, use \"Zerar pontos de todos os espectadores\" em Config > Zona de risco — isso apaga tudo, sem volta. Os pontos também ficam salvos na nuvem, então não somem se você abrir o overlay num PC diferente ou o OBS limpar o cache." },
    ],
  },
  {
    id: "ranking",
    titulo: "Ranking (Top seguidores do mês)",
    icone: "fa-solid fa-ranking-star",
    cor: "var(--ic-links)",
    resumo: "Mostra o top de espectadores mais ativos no mês, atualizando sozinho.",
    secoes: [
      { h: "O que é" },
      { p: "Uma lista com os espectadores que mais pontuaram no mês atual, ordenada do maior pro menor, atualizando em tempo real conforme os eventos chegam (inclusive pontos adicionados na mão em Config > Pontos manuais). Usa a mesma pontuação configurada em Prêmios da live." },
      { h: "Exigir seguidor" },
      { p: "Em Config, você pode ligar a opção \"exigir seguidor\": só espectadores que já seguem (ou acabaram de seguir) você entram na contagem do ranking." },
      { h: "Tamanho do ranking" },
      { p: "Defina quantos espectadores aparecem na lista (top 5 é o padrão)." },
      { h: "Reset" },
      { p: "O ranking acumula o mês inteiro e zera sozinho só na virada do mês — ou na hora, se você usar \"Zerar pontos de todos os espectadores\" em Config > Zona de risco. Os dados ficam salvos na nuvem, então persistem entre lives e entre dispositivos diferentes." },
    ],
  },
  {
    id: "alerta-presente",
    titulo: "Alerta de presente",
    icone: "fa-solid fa-gift",
    cor: "var(--ic-links)",
    resumo: "Card chamativo que aparece quando chega um presente grande.",
    secoes: [
      { h: "O que é" },
      { p: "Um card temporário que aparece na tela sempre que chega um presente com valor igual ou acima do mínimo configurado — ótimo pra dar destaque pros presentes maiores da live." },
      { h: "Como configurar" },
      { p: "Em Config, no card \"Alerta de presente\": defina o valor mínimo de diamantes pra o alerta aparecer, e quanto tempo o card fica na tela antes de sumir." },
    ],
  },
  {
    id: "combo",
    titulo: "Combo",
    icone: "fa-solid fa-fire",
    cor: "var(--ic-links)",
    resumo: "Agrupa presentes ou likes seguidos da mesma pessoa num contador só.",
    secoes: [
      { h: "O que é" },
      { p: "Quando o mesmo espectador manda vários presentes ou likes rapidinho, o Combo agrupa tudo num contador só (tipo \"x5\") em vez de empilhar um card atrás do outro — deixa a tela mais limpa em momentos de muita interação." },
      { h: "Como configurar" },
      { p: "Em Config, no card \"Combo\": escolha quais fontes contam pro combo (like, presente, ou os dois) e a janela de tempo — quanto tempo pode passar entre um evento e outro pra ainda contar como o mesmo combo." },
    ],
  },
  {
    id: "vitrine",
    titulo: "Vitrine de prêmios",
    icone: "fa-solid fa-store",
    cor: "var(--ic-links)",
    resumo: "Lista todos os prêmios disponíveis passando em loop na tela.",
    secoes: [
      { h: "O que é" },
      { p: "Uma vitrine que mostra, em loop contínuo, todos os prêmios que os espectadores podem ganhar (tanto os da live quanto os do mês) — pensada pra quem tá assistindo saber o que dá pra desbloquear interagindo com a sua live." },
      { h: "Diferença pro overlay de Prêmios da live" },
      { p: "A Vitrine não reage a eventos — ela só exibe a lista de prêmios disponíveis, passando da direita pra esquerda. Quem avisa quando ALGUÉM ganha um prêmio de verdade é o overlay \"Prêmios da live\"." },
    ],
  },
  {
    id: "eventos-personalizados",
    titulo: "Eventos personalizados",
    icone: "fa-solid fa-bolt",
    cor: "var(--ic-eventos)",
    resumo: "Crie suas próprias regras: quando algo acontecer na live, dispare uma ação na tela.",
    secoes: [
      { h: "As três peças" },
      { li: [
        "Ações: o que aparece na tela — um card com ícone, texto, som, animação, cor de fundo e barra de progresso, tudo configurável.",
        "Variáveis globais: contadores/valores que as regras podem ler e alterar (por exemplo, \"combos_hoje\"). Dá pra mostrar o valor atual no texto de uma ação com {var:nome}.",
        "Regras: dizem QUANDO uma ação dispara — escolha um gatilho (mensagem, like, presente, seguidor, compartilhamento), opcionalmente uma condição (ex: \"valor do evento é maior ou igual a 100\"), e qual ação disparar.",
      ] },
      { h: "Ações executáveis (passos)" },
      { p: "Depois de mostrar a ação principal, uma regra pode rodar passos extras em sequência: esperar alguns segundos, tocar ou parar um som, mostrar confete ou fogos, mexer numa variável, ou até disparar outra regra." },
      { h: "Fila de eventos" },
      { p: "Quando várias ações disparam quase ao mesmo tempo, elas entram numa fila em vez de aparecer todas empilhadas. Configure o máximo de itens na fila, se ações iguais devem se agrupar num contador, e se ações repetidas devem ser ignoradas enquanto a anterior ainda está na tela." },
      { h: "Biblioteca de templates" },
      { p: "Ao criar uma ação nova, você pode escolher um modelo pronto (Galaxy Premium, Lion, Rose, Follow, Like, Subscriber, PK, Meta, PIX, Doação) já com visual, som e animação configurados, ou começar do zero." },
      { h: "Barra de ferramentas" },
      { p: "No topo da aba Eventos: pesquise ações e regras pelo nome, desative todas as regras de uma vez, ou pule direto pro Simulador com o botão \"Testar tudo\"." },
    ],
  },
  {
    id: "simulador",
    titulo: "Simulador",
    icone: "fa-solid fa-flask",
    cor: "var(--ic-simulador)",
    resumo: "Teste a reação dos overlays sem precisar estar transmitindo ao vivo.",
    secoes: [
      { h: "O que é" },
      { p: "Uma aba onde você monta um evento de mentirinha (nickname, presente, coins, likes, comentário, seguidor, compartilhamento) e manda pros overlays reais, vendo e ouvindo exatamente como reagiriam numa live de verdade." },
      { h: "Os três botões" },
      { li: [
        "Testar Overlay: mostra a reação visual, sem som.",
        "Testar Som: toca só o áudio (presente, seguidor, e as ações de Eventos que baterem), sem abrir card.",
        "Testar Tudo: faz os dois juntos — igual aconteceria ao vivo.",
      ] },
      { h: "Fila de eventos ao vivo" },
      { p: "Dispare \"Testar Tudo\" algumas vezes seguidas pra ver a fila do overlay de Eventos em ação, com um botão pra cancelar a fila na hora." },
    ],
  },
  {
    id: "aparencia",
    titulo: "Aparência",
    icone: "fa-solid fa-wand-magic-sparkles",
    cor: "var(--ic-aparencia)",
    resumo: "Cores, fonte, arredondamento e animações — do jeito que combinar com sua marca.",
    secoes: [
      { h: "O que dá pra mudar" },
      { p: "Cor primária, cor de fundo, cor dos cards, cor da borda, cor do texto, arredondamento das bordas, fonte (incluindo fontes do Google Fonts), e o estilo de animação de entrada/saída dos cards." },
      { h: "Vale pra todos os overlays" },
      { p: "As configurações de Aparência valem globalmente. Se quiser um visual diferente só num overlay específico, dá pra sobrescrever cor por cor dentro do modal de config daquele overlay, sem afetar os outros." },
      { h: "Salva sozinho" },
      { p: "Essa aba não tem botão de salvar — cada mudança já grava na hora e atualiza os overlays abertos automaticamente." },
    ],
  },
  {
    id: "config",
    titulo: "Config",
    icone: "fa-solid fa-sliders",
    cor: "var(--ic-config)",
    resumo: "Conexão com a live (app desktop), pontos manuais e as ferramentas de reset de pontos.",
    secoes: [
      { h: "Conexão" },
      { p: "Cole aqui o endereço WebSocket que o app Central de Overlays — Desktop (ou o TikFinity, se preferir usar ele) mostra — é isso que faz os overlays receberem em tempo real os eventos da sua live (mensagens, likes, presentes, seguidores, compartilhamentos)." },
      { h: "Pontos manuais" },
      { p: "Dá pra somar pontos na mão pra um espectador (digite o nome e a quantidade — número negativo tira pontos) sem precisar de nenhum evento da live. Entra na fonte \"manual\": escolha em cada prêmio (aba Prêmios da live) se ele conta esses pontos também. Some direto no Ranking. Funciona mesmo com os overlays já abertos no OBS." },
      { h: "Zona de risco" },
      { p: "Todos os pontos (mensagem, like, presente, seguidor, compartilhamento, manual) acumulam sozinhos o mês inteiro, sem precisar de nada aqui — só zeram na virada do mês. O botão \"Zerar pontos de todos os espectadores\" apaga TUDO antes disso, sem volta. Use só se quiser mesmo começar do zero (por exemplo, numa nova temporada)." },
    ],
  },
  {
    id: "doar-links",
    titulo: "Doar e Meus links",
    icone: "fa-solid fa-heart",
    cor: "var(--ic-links)",
    resumo: "Os botões fixos da barra superior, disponíveis em qualquer tela do painel.",
    secoes: [
      { h: "O que é" },
      { p: "Dois botões que ficam sempre visíveis no topo do painel: \"Doar\", que leva direto pro seu LivePix, e \"Meus links\", que abre uma listinha com todas as suas redes sociais e outros links importantes." },
      { h: "Como editar" },
      { p: "Esses dados são fixos no código do site (não mudam pelo painel) — se precisar trocar algum link ou adicionar uma rede nova, é necessário editar o arquivo diretamente." },
    ],
  },
];

// mescla um bloco de sons salvo com o padrão, campo por campo
// (pra não perder chaves novas quando o config salvo é antigo)
function mesclarSons(padrao, salvo) {
  const out = structuredClone(padrao);
  if (!salvo) return out;
  if (typeof salvo.volume === "number") out.volume = salvo.volume;
  ["presente", "premio", "seguidor", "combo"].forEach(k => {
    if (salvo[k]) out[k] = Object.assign({}, padrao[k], salvo[k]);
  });
  return out;
}

function carregarConfig() {
  try {
    const salvo = (typeof window !== "undefined" && window.__cfgPreviewOverride) || JSON.parse(localStorage.getItem("configGeral"));
    if (!salvo) return structuredClone(CONFIG_PADRAO);
    const cfg = Object.assign(structuredClone(CONFIG_PADRAO), salvo);
    cfg.tema = Object.assign(structuredClone(CONFIG_PADRAO.tema), salvo.tema || {});
    cfg.valores = Object.assign(structuredClone(CONFIG_PADRAO.valores), salvo.valores || {});
    cfg.alerta = Object.assign(structuredClone(CONFIG_PADRAO.alerta), salvo.alerta || {});
    cfg.combo = Object.assign(structuredClone(CONFIG_PADRAO.combo), salvo.combo || {});
    cfg.metas = Object.assign(structuredClone(CONFIG_PADRAO.metas), salvo.metas || {});
    // tiers salvos com o campo "escopo" antigo (de quando existia balde
    // "da live" separado do "do mês") continuam funcionando normalmente —
    // o campo só fica sem uso, não precisa de migração: fontes já diz
    // tudo que aquele tier soma.
    cfg.tiers = cfg.tiers || [];
    cfg.sons = mesclarSons(CONFIG_PADRAO.sons, salvo.sons);
    cfg.animacoes = salvo.animacoes !== undefined ? salvo.animacoes : CONFIG_PADRAO.animacoes;
    cfg.overlayTema = Object.assign(structuredClone(CONFIG_PADRAO.overlayTema), salvo.overlayTema || {});
    cfg.automacoes = {
      acoes: (salvo.automacoes && salvo.automacoes.acoes) || [],
      eventos: (salvo.automacoes && salvo.automacoes.eventos) || [],
      variaveis: (salvo.automacoes && salvo.automacoes.variaveis) || [],
      filaConfig: Object.assign(structuredClone(CONFIG_PADRAO.automacoes.filaConfig), (salvo.automacoes && salvo.automacoes.filaConfig) || {}),
    };
    // tts/spinner são objetos aninhados (eventos/fatias) — merge raso
    // igual os outros perderia campo novo que não existia quando a
    // pessoa salvou a config pela última vez, então mescla um nível
    // mais fundo também.
    cfg.tts = Object.assign(structuredClone(CONFIG_PADRAO.tts), salvo.tts || {});
    cfg.tts.eventos = Object.assign(structuredClone(CONFIG_PADRAO.tts.eventos), (salvo.tts && salvo.tts.eventos) || {});
    cfg.spinner = Object.assign(structuredClone(CONFIG_PADRAO.spinner), salvo.spinner || {});
    cfg.spinner.fatias = (salvo.spinner && salvo.spinner.fatias) || CONFIG_PADRAO.spinner.fatias;
    return cfg;
  } catch (e) {
    return structuredClone(CONFIG_PADRAO);
  }
}
function salvarConfig(cfg) {
  localStorage.setItem("configGeral", JSON.stringify(cfg));
  if (dbRefConfig) {
    // O Firebase Realtime Database rejeita o set() inteiro (com um erro
    // síncrono, nem chega a virar rejeição de promise) se achar UM campo
    // "undefined" em qualquer lugar aninhado do objeto — coisa fácil de
    // acontecer com regra/passo ainda sendo editados. Isso fazia a config
    // nova nunca chegar na nuvem (silenciosamente), e os prêmios/ajustes
    // novos não apareciam no overlay ao vivo. O round-trip por JSON limpa
    // qualquer "undefined" antes de mandar, sem alterar o resto dos dados.
    try {
      const cfgLimpo = JSON.parse(JSON.stringify(cfg));
      dbRefConfig.set(cfgLimpo).catch(e => console.warn("[firebase] falha ao salvar na nuvem:", e));
    } catch (e) {
      console.warn("[firebase] falha ao salvar na nuvem:", e);
    }
  }
}
// Tema efetivo de um overlay: o tema global (Aparência) com a sobrescrita
// daquele overlay específico por cima, se existir (cfg.overlayTema[id]).
// Assim, mudar cor num overlay não mexe nos outros; só a Aparência muda tudo.
function temaEfetivo(cfg, overlayId) {
  const sobrescrita = (cfg.overlayTema && cfg.overlayTema[overlayId]) || {};
  return Object.assign({}, cfg.tema, sobrescrita);
}

// Codifica/decodifica a config inteira pra poder viajar dentro da própria
// URL do overlay. Isso existe porque o painel (aberto no seu navegador normal)
// e cada Browser Source do OBS rodam motores separados, cada um com seu
// próprio localStorage — mudar uma config no painel NÃO chega sozinha no
// overlay que já está rodando dentro do OBS. Ao colar um link novo (copiado
// depois de salvar) com "&cfg=...", o overlay lê essa config embutida e
// sobrescreve a própria cópia local automaticamente, no próximo carregamento.
function codificarConfigParaLink(cfg) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(cfg))));
  } catch (e) {
    return "";
  }
}
function decodificarConfigDaLink(str) {
  return JSON.parse(decodeURIComponent(escape(atob(str))));
}

function carregarFonteGoogle(fonteKey) {
  const f = FONTES[fonteKey] || FONTES.padrao;
  if (f.googleFamily) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=" + f.googleFamily + "&display=swap";
    document.head.appendChild(link);
  }
  return f.css;
}

const LEGENDA_FONTES = { mensagem: "chat", like: "likes", presente: "presente", seguidor: "seguidor", compartilhamento: "compartilhar", manual: "manual" };

// calcula o valor (diamantes x repetições) de um evento de presente,
// respeitando presentes "de sequência" (giftType 1, tipo Rosa): esses
// disparam um evento a cada repetição da combo, então só contamos de
// verdade quando repeatEnd:true chega (senão o mesmo presente é
// somado várias vezes enquanto o espectador segura o combo).
// devolve null quando o evento deve ser ignorado (combo em andamento).
function extrairValorPresente(data) {
  const giftType = data.giftDetails?.giftType ?? data.giftType;
  const repeatEnd = data.repeatEnd;
  const contavel = giftType !== 1 || repeatEnd === true || repeatEnd === undefined;
  if (!contavel) return null;
  const diamantes = data.diamondCount ?? data.giftDetails?.diamondCount ?? data.diamonds ?? data.value ?? 0;
  const repeticoes = data.repeatCount ?? data.combo ?? 1;
  return diamantes * repeticoes;
}

// converte "#1D9E75" em "29, 158, 117" pra usar em rgba(...)
function hexParaRgb(hex) {
  const limpo = String(hex).replace("#", "");
  const cheio = limpo.length === 3 ? limpo.split("").map(c => c + c).join("") : limpo;
  const n = parseInt(cheio, 16);
  if (isNaN(n)) return "255, 255, 255";
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

/* ------------------------------------------------------------
   Visual "estilo battle pass" pros prêmios: cada tier ganha uma
   raridade (cor) de acordo com a posição na lista (do mais barato
   pro mais caro) e um ícone escolhido pelo nome do prêmio — sem
   usar nenhuma arte de terceiros, só cor/ícone/CSS.
   ------------------------------------------------------------ */
const RARIDADES_TIER = [
  { nome: "Comum",    cor: "#9aa0a8" },
  { nome: "Raro",     cor: "#4b9eff" },
  { nome: "Épico",    cor: "#b34bff" },
  { nome: "Lendário", cor: "#ff9f2e" },
  { nome: "Mítico",   cor: "#ffd54b" },
];
function raridadeDoTier(index, total) {
  if (!total || total <= 1) return RARIDADES_TIER[0];
  const posicao = index / (total - 1);
  if (posicao >= 0.99) return RARIDADES_TIER[4];
  if (posicao >= 0.75) return RARIDADES_TIER[3];
  if (posicao >= 0.5) return RARIDADES_TIER[2];
  if (posicao >= 0.25) return RARIDADES_TIER[1];
  return RARIDADES_TIER[0];
}
// gradiente diagonal escuro -> cor da raridade, pro visual "item shop"
function gradienteRaridade(corHex) {
  const rgb = hexParaRgb(corHex);
  if (!rgb) return "";
  return `linear-gradient(135deg, rgba(${rgb.r},${rgb.g},${rgb.b},0.16) 0%, rgba(20,20,24,0.05) 55%)`;
}
function iconeDoTier(nome) {
  const n = (nome || "").toLowerCase();
  if (n.includes("passe") || n.includes("battle")) return "🎫";
  if (n.includes("skin") || n.includes("pacote") || n.includes("bundle") || n.includes("roupa")) return "👕";
  if (n.includes("emote") || n.includes("dança") || n.includes("danca")) return "💃";
  if (n.includes("música") || n.includes("musica") || n.includes("jam") || n.includes("som")) return "🎵";
  if (n.includes("vip") || n.includes("acesso") || n.includes("chave")) return "🔑";
  if (n.includes("arma") || n.includes("gun")) return "🔫";
  return "🏆";
}
// lista curada de ícones FontAwesome pra escolha manual nos prêmios (estilo Flaticon)
const ICONES_TIER_DISPONIVEIS = [
  { classe: "fa-solid fa-trophy", label: "Troféu" },
  { classe: "fa-solid fa-crown", label: "Coroa" },
  { classe: "fa-solid fa-gem", label: "Gema" },
  { classe: "fa-solid fa-medal", label: "Medalha" },
  { classe: "fa-solid fa-star", label: "Estrela" },
  { classe: "fa-solid fa-gift", label: "Presente" },
  { classe: "fa-solid fa-ticket", label: "Ingresso" },
  { classe: "fa-solid fa-shirt", label: "Roupa/Skin" },
  { classe: "fa-solid fa-music", label: "Música" },
  { classe: "fa-solid fa-key", label: "Chave/VIP" },
  { classe: "fa-solid fa-fire", label: "Fogo" },
  { classe: "fa-solid fa-bolt", label: "Raio" },
  { classe: "fa-solid fa-heart", label: "Coração" },
  { classe: "fa-solid fa-gun", label: "Arma" },
  { classe: "fa-solid fa-coins", label: "Moedas" },
  { classe: "fa-solid fa-wand-magic-sparkles", label: "Mágica" },
  { classe: "fa-solid fa-rocket", label: "Foguete" },
  { classe: "fa-solid fa-mask", label: "Máscara" },
  { classe: "fa-solid fa-dice", label: "Dado" },
  { classe: "fa-solid fa-headphones", label: "Fone" },
];
// retorna o HTML do ícone de um tier: usa o FA escolhido manualmente (tier.icone),
// senão cai pro emoji automático por palavra-chave (iconeDoTier)
function iconeTierHtml(tier, tamanhoPx) {
  const tam = tamanhoPx || 16;
  if (tier && tier.icone) return `<i class="${tier.icone}" style="font-size:${tam}px;"></i>`;
  return `<span style="font-size:${tam}px;">${iconeDoTier(tier && tier.nome)}</span>`;
}

// anima um número de "de" até "para" dentro do texto de um elemento
function animarNumero(el, de, para, duracaoMs) {
  duracaoMs = duracaoMs || 500;
  if (!el || de === para) { if (el) el.textContent = para; return; }
  const inicio = performance.now();
  function passo(agora) {
    const progresso = Math.min(1, (agora - inicio) / duracaoMs);
    const facilitado = 1 - Math.pow(1 - progresso, 3);
    el.textContent = Math.round(de + (para - de) * facilitado);
    if (progresso < 1) requestAnimationFrame(passo);
    else el.textContent = para;
  }
  requestAnimationFrame(passo);
}
