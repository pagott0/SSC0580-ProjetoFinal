/* =========================================================
   VivaMais - Elementos compartilhados (barra, VLibras)
   Monta a barra de acessibilidade e carrega o VLibras.
   A barra é inserida no início do <body> de toda página,
   garantindo padronização. O resto (cabeçalho, menu, rodapé)
   fica no HTML de cada página para manter alt/aria explícitos.
   ========================================================= */
(function () {
  "use strict";

  var barraHTML =
    '<a class="pular-link" href="#conteudo">Pular para o conteúdo principal</a>' +
    '<div class="barra-acess" role="region" aria-label="Opções de acessibilidade">' +
      '<div class="grupo">' +
        '<span class="rotulo" id="rot-fonte" aria-hidden="true">Tamanho do texto</span>' +
        '<button type="button" id="btn-fonte-menos"><span aria-hidden="true">A\u2212</span><span class="sr-only">Diminuir o texto</span></button>' +
        '<button type="button" id="btn-fonte-mais"><span aria-hidden="true">A+</span><span class="sr-only">Aumentar o texto</span></button>' +
      '</div>' +
      '<div class="grupo">' +
        '<button type="button" id="btn-contraste" aria-pressed="false">Alto contraste</button>' +
        '<button type="button" id="btn-movimento" aria-pressed="false">Reduzir movimento</button>' +
      '</div>' +
      '<div id="acess-status" class="sr-only" role="status" aria-live="polite" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;"></div>' +
    '</div>';

  function montarBarra() {
    if (document.querySelector(".barra-acess")) return;
    var frag = document.createElement("template");
    frag.innerHTML = barraHTML;
    document.body.insertBefore(frag.content, document.body.firstChild);
  }

  /* VLibras - tradução para Língua Brasileira de Sinais (widget oficial) */
  function carregarVLibras() {
    var markup = document.createElement("div");
    markup.setAttribute("vw", "");
    markup.className = "enabled";
    markup.innerHTML =
      '<div vw-access-button class="active"></div>' +
      '<div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
    document.body.appendChild(markup);

    var s = document.createElement("script");
    s.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    s.onload = function () {
      try { new window.VLibras.Widget("https://vlibras.gov.br/app"); } catch (e) {}
    };
    document.body.appendChild(s);
  }

  function iniciar() {
    adicionarFavicon();
    montarBarra();
    carregarVLibras();
  }

  /* Favicon embutido (SVG data URI) - evita 404 e mantém a marca */
  function adicionarFavicon() {
    if (document.querySelector('link[rel="icon"]')) return;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
      '<rect width="32" height="32" rx="8" fill="#1d4ed8"/>' +
      '<text x="16" y="22" font-family="Arial,Helvetica,sans-serif" font-size="16" font-weight="700" fill="#fff" text-anchor="middle">V+</text></svg>';
    var link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = "data:image/svg+xml," + encodeURIComponent(svg);
    document.head.appendChild(link);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
