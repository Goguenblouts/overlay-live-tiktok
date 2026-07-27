if (!view) {
  renderPainel();
} else if (view === "metas") {
  renderMetas();
} else if (view === "ranking") {
  renderRanking();
} else if (view === "alerta") {
  renderAlerta();
} else if (view === "combo") {
  renderCombo();
} else if (view === "vitrine") {
  renderVitrine();
} else if (view === "eventos") {
  renderEventos();
} else {
  document.body.innerHTML = "<div style='padding:20px;'>overlay desconhecido: " + view + "</div>";
}
