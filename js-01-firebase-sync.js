/* ============================================================
   SYNC AUTOMÁTICO (Firebase Realtime Database)
   - Guarda a configuração geral num banco na nuvem, além do
     localStorage de cada navegador. Uma config só, sem conta —
     é uma ferramenta de um streamer só.
   - Toda vez que o painel salva, manda a config pra nuvem.
   - Toda vez que qualquer overlay (ou o próprio painel) abre,
     ele escuta essa mesma chave. Se a nuvem tiver algo diferente
     do que já está salvo localmente, atualiza e recarrega a
     página sozinho — sem precisar copiar link de novo.
   - Se der qualquer problema pra conectar (sem internet, etc),
     tudo continua funcionando do jeito antigo, só que sem o
     sync automático entre telas.
   ============================================================ */
const firebaseConfig = {
  apiKey: "AIzaSyAZkrdcciHLXsV01nNwpvsz7MbvTQPB8uA",
  authDomain: "meus-links-c0839.firebaseapp.com",
  databaseURL: "https://meus-links-c0839-default-rtdb.firebaseio.com",
  projectId: "meus-links-c0839",
  storageBucket: "meus-links-c0839.firebasestorage.app",
  messagingSenderId: "751984968027",
  appId: "1:751984968027:web:8b870195b9ce89ad3dda7e",
};
let dbRefConfig = null;
let dbRefReset = null;
// prêmios/ranking (pontos dos espectadores) também sincronizam pela nuvem —
// sem isso, cada tela (painel no seu PC vs overlay dentro do OBS) é um
// navegador separado com seu próprio localStorage, então os pontos "somem"
// toda vez que abre uma live nova numa tela que não tinha os dados salvos.
let dbRefPremios = null;
let dbRefRanking = null;
try {
  firebase.initializeApp(firebaseConfig);
  dbRefConfig = firebase.database().ref("overlay_tiktok/config");
  dbRefReset = firebase.database().ref("overlay_tiktok/resetTrigger");
  dbRefPremios = firebase.database().ref("overlay_tiktok/premios");
  dbRefRanking = firebase.database().ref("overlay_tiktok/ranking");
} catch (e) {
  console.warn("[firebase] não consegui iniciar o sync automático:", e);
}
