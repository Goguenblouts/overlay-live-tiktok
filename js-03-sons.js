/* ============================================================
   SONS (sintetizados via Web Audio API — sem arquivo externo)
   ============================================================ */
let audioCtxCompartilhado = null;
function obterAudioCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!audioCtxCompartilhado) audioCtxCompartilhado = new AC();
  if (audioCtxCompartilhado.state === "suspended") audioCtxCompartilhado.resume();
  return audioCtxCompartilhado;
}

// toca uma nota simples: freq em Hz, duração/atraso em ms
function tocarTom(freq, duracaoMs, atrasoMs, tipoOnda, volume) {
  const ctx = obterAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = tipoOnda || "sine";
  osc.frequency.value = freq;
  const inicio = ctx.currentTime + (atrasoMs || 0) / 1000;
  const fim = inicio + duracaoMs / 1000;
  gain.gain.setValueAtTime(0.0001, inicio);
  gain.gain.linearRampToValueAtTime(Math.max(0.0001, volume), inicio + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, fim);
  osc.connect(gain).connect(ctx.destination);
  osc.start(inicio);
  osc.stop(fim + 0.03);
}

// ------------------------------------------------------------
// Registro de sons ativos (Fase 4): qualquer som que começa a tocar
// (embutido, link personalizado ou de uma ação) se registra aqui, e o
// passo "Parar som" de uma regra usa isso pra silenciar tudo que
// estiver tocando naquele instante — inclusive loops.
// ------------------------------------------------------------
function registrarSomAtivo(pararFn) {
  if (typeof window === "undefined") return;
  window.__registroSons = window.__registroSons || [];
  window.__registroSons.push(pararFn);
  if (window.__registroSons.length > 200) window.__registroSons.shift(); // nunca deixa crescer sem fim
}
function pararTodosOsSons() {
  if (typeof window === "undefined" || !window.__registroSons) return;
  window.__registroSons.forEach(fn => { try { fn(); } catch (e) {} });
  window.__registroSons = [];
}

const SONS_DISPONIVEIS = {
  ding:          { nome: "Ding",     tocar: (v) => tocarTom(880, 180, 0, "sine", v) },
  moeda:         { nome: "Moeda",    tocar: (v) => { tocarTom(988, 90, 0, "square", v * 0.5); tocarTom(1319, 140, 90, "square", v * 0.5); } },
  fanfarra:      { nome: "Fanfarra", tocar: (v) => { tocarTom(523, 140, 0, "triangle", v * 0.6); tocarTom(659, 140, 110, "triangle", v * 0.6); tocarTom(784, 240, 220, "triangle", v * 0.6); } },
  pop:           { nome: "Pop",      tocar: (v) => tocarTom(220, 70, 0, "square", v * 0.4) },
  personalizado: { nome: "Link personalizado (URL)" },
};

function tocarSom(nomeSom, volume0a100) {
  const som = SONS_DISPONIVEIS[nomeSom];
  if (!som || !som.tocar) return;
  try { som.tocar(((volume0a100 ?? 70) / 100) * 0.6); } catch (e) { console.warn("[som] falhou:", e); }
}

// toca um mp3/áudio de uma URL externa (ex: link copiado do myinstants) —
// devolve uma função pra parar na hora (usada pelo registro de sons ativos)
function tocarSomDeUrl(url, volume0a100) {
  if (!url) return () => {};
  try {
    const audio = new Audio(url);
    audio.volume = Math.min(1, Math.max(0, (volume0a100 ?? 70) / 100));
    audio.play().catch(e => console.warn("[som] não consegui tocar o link (o site pode bloquear uso externo):", e));
    return () => { try { audio.pause(); } catch (e) {} };
  } catch (e) { console.warn("[som] falhou:", e); return () => {}; }
}

// lê um arquivo de áudio escolhido no computador e devolve como data URL —
// assim dá pra usar QUALQUER som salvo no PC/celular, sem depender de link
// externo (evita problema de site bloquear uso fora dele / CORS).
function lerArquivoAudioComoDataUrl(arquivo) {
  return new Promise((resolve, reject) => {
    if (!arquivo) { reject(new Error("nenhum arquivo")); return; }
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = () => reject(leitor.error || new Error("falha ao ler arquivo"));
    leitor.readAsDataURL(arquivo);
  });
}

// liga um <input type="file"> a um <input> de URL: ao escolher um arquivo,
// converte pra data URL e joga no campo de URL (disparando input/change pra
// quem estiver ouvindo o campo perceber a mudança).
function wireUploadDeAudio(inputFileEl, inputUrlEl) {
  if (!inputFileEl || !inputUrlEl) return;
  inputFileEl.addEventListener("change", async () => {
    const arquivo = inputFileEl.files && inputFileEl.files[0];
    if (!arquivo) return;
    try {
      const dataUrl = await lerArquivoAudioComoDataUrl(arquivo);
      inputUrlEl.value = dataUrl;
      inputUrlEl.dispatchEvent(new Event("input", { bubbles: true }));
      inputUrlEl.dispatchEvent(new Event("change", { bubbles: true }));
    } catch (e) {
      console.warn("[som] falha ao carregar arquivo:", e);
      alert("Não consegui carregar esse arquivo de áudio. Tente outro arquivo.");
    } finally {
      inputFileEl.value = "";
    }
  });
}

// dispara o som configurado pra um evento (embutido ou link personalizado)
function tocarSomConfig(somCfg, volumeGeral) {
  if (!somCfg || !somCfg.ativo) return;
  // nas mini-prévias ao vivo embutidas nos cards o som fica mudo (&mudo=1) —
  // só toca de verdade no overlay real ou quando a pessoa clica em "Testar".
  if (typeof modoMudo !== "undefined" && modoMudo) return;
  // "Testar Overlay" do Simulador (Fase 3) pede visual sem som — sinaliza
  // isso por evento, não por URL, então checa a flag temporária também.
  if (typeof window !== "undefined" && window.__silenciarSom) return;
  if (somCfg.som === "personalizado") registrarSomAtivo(tocarSomDeUrl(somCfg.url, volumeGeral));
  else tocarSom(somCfg.som, volumeGeral);
}

// markup de um switch liga/desliga
function toggleHtml(id, label, checked) {
  return `<label class="toggle"><input type="checkbox" id="${id}" ${checked ? "checked" : ""}/><span class="trilha"></span>${label}</label>`;
}

// gera o HTML da grade de tiers (usado só na prévia estática do painel)
function gerarHtmlTiers(tema, tiers, pontosMap) {
  const raioCard = Math.max(4, tema.raio - 4);
  return `<div style="display:grid;grid-template-columns:repeat(${tiers.length},1fr);gap:10px;">` +
    tiers.map(tier => {
      const atual = pontosMap[tier.id] || 0;
      const batido = atual >= tier.pontos;
      const pct = Math.min(100, (atual / tier.pontos) * 100);
      const fonteTxt = tier.fontes.map(f => LEGENDA_FONTES[f] || f).join(" + ");
      const fundoCard = batido ? tema.corPrimaria : tema.corCard;
      const corTitulo = batido ? tema.corFundo : tema.corTexto;
      const corSub = batido ? tema.corFundo : tema.corTextoSec;
      const bordaCard = batido ? "none" : `1px solid ${tema.corBorda}`;
      return `
        <div style="border-radius:${raioCard}px;padding:12px 14px;background:${fundoCard};border:${bordaCard};">
          <div style="font-size:13px;color:${corTitulo};font-weight:bold;">${tier.nome}</div>
          <div style="font-size:11px;color:${corSub};margin:2px 0 8px;">via ${fonteTxt}</div>
          <div style="height:6px;background:rgba(255,255,255,0.15);border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:${batido ? tema.corFundo : tema.corPrimaria};"></div>
          </div>
          <div style="font-size:11px;color:${corSub};margin-top:6px;">${atual}/${tier.pontos} pts${batido ? " · concluído" : ""}</div>
        </div>
      `;
    }).join("") + `</div>`;
}

// gera o HTML do ranking (preview estática do painel E overlay ao vivo)
// posicoesAnteriores: mapa userId -> posição anterior (pra mostrar seta de subida/queda)
// animar: liga/desliga a entrada animada das linhas
function gerarHtmlRanking(tema, lista, posicoesAnteriores, animar) {
  posicoesAnteriores = posicoesAnteriores || {};
  animar = animar !== false;
  if (lista.length === 0) {
    return `<div style="font-size:13px;color:${tema.corTextoSec};">aguardando pontos...</div>`;
  }
  return lista.map((u, i) => {
    const posAnterior = posicoesAnteriores[u.id];
    let seta = "";
    if (posAnterior !== undefined) {
      if (posAnterior > i) seta = `<span style="color:#3ecf8e;font-size:10px;margin-right:4px;">▲</span>`;
      else if (posAnterior < i) seta = `<span style="color:#e0637a;font-size:10px;margin-right:4px;">▼</span>`;
    }
    const classeAnim = animar ? ' class="linha-ranking-anim"' : "";
    const atraso = animar ? `animation-delay:${i * 45}ms;` : "";
    const borda = i < lista.length - 1 ? `border-bottom:1px solid ${tema.corBorda};` : "";
    const qtdPremios = u.premios || 0;
    const badgePremio = qtdPremios > 0 ? `<span title="${qtdPremios} prêmio(s) desbloqueado(s)" style="margin-left:6px;font-size:11px;color:${tema.corTextoSec};">🏆${qtdPremios > 1 ? "×" + qtdPremios : ""}</span>` : "";
    return `
      <div${classeAnim} style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;${atraso}${borda}">
        <span style="font-size:14px;color:${tema.corTexto};display:flex;align-items:center;min-width:0;">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:${tema.corPrimaria}33;color:${tema.corPrimaria};font-size:11px;font-weight:700;margin-right:8px;flex-shrink:0;">${i + 1}</span>
          <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${seta}${u.nickname}</span>${badgePremio}
        </span>
        <span style="font-size:13px;color:${tema.corPrimaria};font-weight:bold;flex-shrink:0;margin-left:8px;">${u.pontos} pts</span>
      </div>
    `;
  }).join("");
}

document.body.style.margin = "0";
document.body.style.background = "transparent";
document.body.style.fontFamily = "Arial, sans-serif";
document.body.style.color = "#fff";

const params = new URLSearchParams(location.search);
const view = params.get("view");

// modo prévia: usado só pelos iframes de prévia ao vivo dentro do próprio
// painel. Nesse modo a config chega pela URL mas NUNCA é gravada no
// localStorage compartilhado (pra não sobrescrever a config real salva) e
// os dados de espectador (ranking/prêmios/seguidores) usam uma chave à
// parte, isolada da chave usada pelos overlays de verdade.
const modoPreview = params.get("preview") === "1";
// modoMudo: só usado pelas mini-prévias ao vivo embutidas nos cards do painel
// (?mudo=1) — silencia o som mesmo em modo prévia. O botão "Testar" usa
// preview=1 (isola os dados de espectador) mas SEM mudo=1, então o som toca
// normalmente pra você conferir como vai ficar de verdade.
const modoMudo = params.get("mudo") === "1";
function chaveEspectadores(nome) { return modoPreview ? nome + "__preview" : nome; }

if (params.get("cfg")) {
  try {
    const cfgDaLink = decodificarConfigDaLink(params.get("cfg"));
    if (modoPreview) {
      window.__cfgPreviewOverride = cfgDaLink;
    } else {
      localStorage.setItem("configGeral", JSON.stringify(cfgDaLink));
      console.log("[cfg] configuração atualizada a partir do link");
    }
  } catch (e) {
    console.warn("[cfg] link de configuração inválido, ignorando:", e);
  }
}

// Compara dois valores ignorando a ordem das chaves dos objetos — o
// Firebase Realtime Database não preserva a ordem original (e pode até
// omitir objetos/arrays vazios), então comparar JSON.stringify puro dava
// falso positivo de "mudou" e recarregava sem necessidade.
// Além de ordenar as chaves, também desfaz uma ambiguidade clássica do
// Firebase Realtime Database: um array salvo pode voltar como OBJETO com
// chaves "0","1","2"... em vez de array de verdade. Sem isso, a comparação
// achava "diferença" toda vez (mesmo com os dados idênticos) e o overlay
// ficava recarregando sem parar (o "piscando" que não atualiza nada de novo).
function normalizarParaComparacao(v) {
  if (Array.isArray(v)) return v.map(normalizarParaComparacao);
  if (v && typeof v === "object") {
    const chaves = Object.keys(v);
    const pareceArray = chaves.length > 0 && chaves.every((k, i) => k === String(i));
    if (pareceArray) return chaves.map(k => normalizarParaComparacao(v[k]));
    return chaves.sort().reduce((acc, k) => { acc[k] = normalizarParaComparacao(v[k]); return acc; }, {});
  }
  return v;
}
function jsonEstavel(valor) {
  return JSON.stringify(normalizarParaComparacao(valor));
}

// Escuta a nuvem SÓ nos overlays de verdade (não no painel — o painel já
// atualiza a própria tela sozinho quando salva, não precisa recarregar).
// Se a config de lá for diferente da que está salva aqui, atualiza e
// recarrega sozinho — é isso que faz a aparência mudar no overlay ao vivo
// sem copiar link. (Não roda em modo prévia, pra não recarregar o
// mini-preview sozinho.)
if (dbRefConfig && !modoPreview && view) {
  dbRefConfig.on("value", snap => {
    const remoto = snap.val();
    const localAtual = localStorage.getItem("configGeral");
    if (remoto) {
      const remotoEstavel = jsonEstavel(remoto);
      const localEstavel = localAtual ? jsonEstavel(JSON.parse(localAtual)) : null;
      if (localEstavel !== remotoEstavel) {
        localStorage.setItem("configGeral", JSON.stringify(remoto));
        // Trava de segurança: se esse mecanismo já recarregou a página há
        // pouco tempo, não recarrega de novo agora — só grava os dados
        // novos. Evita loop de reload (a tela "piscando" sem parar) caso
        // sobre alguma diferença residual entre o formato local e o da
        // nuvem; os dados corretos já foram salvos acima de qualquer jeito,
        // e a próxima navegação/reload de verdade já pega tudo atualizado.
        const agora = Date.now();
        const ultimaRecarga = Number(sessionStorage.getItem("ultimaRecargaConfigNuvem") || 0);
        if (agora - ultimaRecarga > 4000) {
          sessionStorage.setItem("ultimaRecargaConfigNuvem", String(agora));
          location.reload();
        }
      }
    } else if (localAtual) {
      // nuvem ainda vazia (primeira vez usando o sync): manda o que já
      // existe aqui pra servir de ponto de partida.
      dbRefConfig.set(JSON.parse(localAtual)).catch(() => {});
    }
  }, e => console.warn("[firebase] falha ao escutar mudanças:", e));
}

// Reset remoto: quando a pessoa clica em "Resetar espectadores" no painel,
// um sinal é mandado pra cá — qualquer overlay já aberto no OBS escuta e
// limpa o próprio progresso sozinho, sem precisar de link de reset separado.
// (Também só nos overlays de verdade — o painel não precisa recarregar.)
let resetPrimeiroSnapshot = true;
if (dbRefReset && !modoPreview && view) {
  dbRefReset.on("value", snap => {
    const remoto = snap.val();
    if (resetPrimeiroSnapshot) {
      resetPrimeiroSnapshot = false;
      if (remoto) localStorage.setItem("ultimoResetAplicado", String(remoto));
      return;
    }
    if (!remoto) return;
    const localMarca = localStorage.getItem("ultimoResetAplicado");
    if (String(remoto) !== localMarca) {
      localStorage.setItem("ultimoResetAplicado", String(remoto));
      localStorage.removeItem("rankingUsuarios");
      localStorage.removeItem("premiosPorUsuario");
      localStorage.removeItem("seguidoresConhecidos");
      location.reload();
    }
  }, e => console.warn("[firebase] falha ao escutar reset:", e));
}

// ------------------------------------------------------------
// MOTOR DE CONDIÇÕES (Fase 2 — "Regras"): cada regra tem no máximo UMA
// condição (regra.condicao = {campo, operador, valor}), comparando um
// "campo" (do evento ou de uma variável global) com um valor. Campo
// vazio = sem condição, a regra dispara sempre que o gatilho acontecer.
// Fica definido ANTES do painel (que roda logo abaixo, no "if (!view)")
// porque a lista de regras já existentes é lida nele — se ficasse mais
// pra baixo no arquivo, ia dar erro de "usado antes de existir".
// ------------------------------------------------------------
const CAMPOS_CONDICAO = {
  valor:        { nome: "Valor do evento (likes/diamantes/etc.)", tipo: "numero", gatilhos: ["mensagem", "like", "presente", "seguidor", "compartilhamento"] },
  nickname:     { nome: "Nome do espectador", tipo: "texto", gatilhos: ["mensagem", "like", "presente", "seguidor", "compartilhamento"] },
  comentario:   { nome: "Texto da mensagem", tipo: "texto", gatilhos: ["mensagem"] },
  nomePresente: { nome: "Nome do presente", tipo: "texto", gatilhos: ["presente"] },
};
function camposDisponiveisParaGatilho(gatilho) {
  return Object.entries(CAMPOS_CONDICAO).filter(([, meta]) => meta.gatilhos.includes(gatilho)).map(([id, meta]) => ({ id, nome: meta.nome }));
}
const OPERADORES_POR_TIPO = {
  numero: [
    { id: "igual", nome: "é igual a" }, { id: "diferente", nome: "é diferente de" },
    { id: "maior", nome: "é maior que" }, { id: "maiorIgual", nome: "é maior ou igual a" },
    { id: "menor", nome: "é menor que" }, { id: "menorIgual", nome: "é menor ou igual a" },
  ],
  texto: [
    { id: "igual", nome: "é igual a" }, { id: "diferente", nome: "é diferente de" },
    { id: "contem", nome: "contém" }, { id: "naoContem", nome: "não contém" },
    { id: "comecaCom", nome: "começa com" }, { id: "terminaCom", nome: "termina com" },
  ],
};
// tipo efetivo de um campo (leva em conta variáveis globais, que podem
// ser número ou texto conforme a pessoa configurou)
function tipoDoCampo(campo, cfg) {
  if (campo && campo.indexOf("variavel:") === 0) {
    const v = (cfg.automacoes.variaveis || []).find(v => v.id === campo.slice(9));
    return (v && v.tipo) || "numero";
  }
  return (CAMPOS_CONDICAO[campo] && CAMPOS_CONDICAO[campo].tipo) || "texto";
}
function valorDoCampo(campo, ctx) {
  if (campo === "valor") return ctx.valor;
  if (campo === "nickname") return ctx.nickname || "";
  if (campo === "comentario") return ctx.data.comment || "";
  if (campo === "nomePresente") return ctx.data.giftDetails?.giftName ?? ctx.data.giftName ?? "";
  if (campo && campo.indexOf("variavel:") === 0) return lerValorVariavel(campo.slice(9), ctx.cfg);
  return "";
}
function compararOperador(operador, valorCampo, valorComparado, tipo) {
  if (tipo === "numero") {
    const a = Number(valorCampo) || 0, b = Number(valorComparado) || 0;
    if (operador === "igual") return a === b;
    if (operador === "diferente") return a !== b;
    if (operador === "maior") return a > b;
    if (operador === "maiorIgual") return a >= b;
    if (operador === "menor") return a < b;
    if (operador === "menorIgual") return a <= b;
    return false;
  }
  const a = String(valorCampo ?? "").toLowerCase(), b = String(valorComparado ?? "").toLowerCase();
  if (operador === "igual") return a === b;
  if (operador === "diferente") return a !== b;
  if (operador === "contem") return a.includes(b);
  if (operador === "naoContem") return !a.includes(b);
  if (operador === "comecaCom") return a.startsWith(b);
  if (operador === "terminaCom") return a.endsWith(b);
  return false;
}
function avaliarCondicao(cond, ctx) {
  const tipo = tipoDoCampo(cond.campo, ctx.cfg);
  return compararOperador(cond.operador, valorDoCampo(cond.campo, ctx), cond.valor, tipo);
}
function avaliarRegra(regra, ctx) {
  if (regra.gatilho !== ctx.gatilho) return false;
  // formato atual: condição única
  if (regra.condicao) {
    if (!regra.condicao.campo) return true; // sem condição = sempre dispara
    return avaliarCondicao(regra.condicao, ctx);
  }
  // regra salva antes dessa versão (ainda não passou pelo painel pra
  // migrar): interpreta os formatos antigos direto, em vez de tratar
  // como "sem condição" — senão toda regra antiga passaria a disparar
  // sempre até a pessoa reabrir e salvar o painel de novo.
  if (regra.condicionamento) {
    const grupo = regra.condicionamento.grupos && regra.condicionamento.grupos[0];
    const cond = grupo && grupo.condicoes && grupo.condicoes[0];
    return cond ? avaliarCondicao(cond, ctx) : true;
  }
  if (regra.condicaoTipo === "valorMinimo") return (ctx.valor || 0) >= Number(regra.condicaoValor || 0);
  if (regra.condicaoTipo === "contemPalavra") return String(ctx.data.comment || "").toLowerCase().includes(String(regra.condicaoValor || "").toLowerCase());
  return true; // "sempre" ou regra sem condição antiga nenhuma
}

// ------------------------------------------------------------
// VARIÁVEIS GLOBAIS: contadores/valores que as regras podem ler (como
// campo de condição, "variavel:<id>") e escrever (efeitos, quando a
// regra dispara). Ficam salvas separado da config (localStorage, com a
// mesma chave isolada de preview/teste que ranking e prêmios usam) pra
// não precisar salvar a config inteira a cada incremento.
// ------------------------------------------------------------
function chaveVariaveisRuntime() { return chaveEspectadores("variaveisRuntime"); }
function lerVariaveisRuntime() {
  try { return JSON.parse(localStorage.getItem(chaveVariaveisRuntime())) || {}; } catch (e) { return {}; }
}
function salvarVariaveisRuntime(obj) {
  try { localStorage.setItem(chaveVariaveisRuntime(), JSON.stringify(obj)); } catch (e) {}
}
function lerValorVariavel(variavelId, cfg) {
  const runtime = lerVariaveisRuntime();
  if (runtime[variavelId] !== undefined) return runtime[variavelId];
  const def = (cfg.automacoes.variaveis || []).find(v => v.id === variavelId);
  return def ? def.valorInicial : 0;
}
// aplica UM efeito num objeto runtime já carregado (usado tanto pelos
// "efeitos" da regra quanto pelo passo "variavel" da sequência — mesma
// lógica, só muda quem carrega/salva o runtime em volta)
function aplicarUmEfeitoVariavel(ef, ctx, runtime) {
  const def = (ctx.cfg.automacoes.variaveis || []).find(v => v.id === ef.variavelId);
  if (!def) return;
  const atual = runtime[ef.variavelId] !== undefined ? runtime[ef.variavelId] : def.valorInicial;
  let novo = atual;
  if (def.tipo === "numero") {
    const n = Number(atual) || 0;
    if (ef.operacao === "incrementar") novo = n + (Number(ef.valor) || 1);
    else if (ef.operacao === "decrementar") novo = n - (Number(ef.valor) || 1);
    else if (ef.operacao === "definir") novo = Number(ef.valor) || 0;
    else if (ef.operacao === "somarValorEvento") novo = n + (ctx.valor || 0);
  } else if (ef.operacao === "definir") {
    novo = ef.valor;
  }
  runtime[ef.variavelId] = novo;
}
function aplicarEfeitosVariaveis(regra, ctx) {
  if (!regra.efeitos || !regra.efeitos.length) return;
  const runtime = lerVariaveisRuntime();
  regra.efeitos.forEach(ef => aplicarUmEfeitoVariavel(ef, ctx, runtime));
  salvarVariaveisRuntime(runtime);
}
// resolve {nickname}, {valor} e {var:nome} (nome da variável, não o id)
function textoComPlaceholders(texto, nickname, valor, cfg) {
  let out = (texto || "").replace(/\{nickname\}/g, nickname).replace(/\{valor\}/g, valor);
  if (cfg && cfg.automacoes.variaveis && cfg.automacoes.variaveis.length) {
    out = out.replace(/\{var:([^}]+)\}/g, (m, nome) => {
      const v = cfg.automacoes.variaveis.find(v => v.nome === nome.trim());
      return v ? String(lerValorVariavel(v.id, cfg)) : m;
    });
  }
  return out;
}
