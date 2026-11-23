/* =========================================================
   VivaMais - Controles de acessibilidade
   Aumentar/diminuir fonte, alto contraste e reduzir movimento.
   As preferências são salvas em localStorage e aplicadas em
   todas as páginas. NÃO depende do zoom do navegador.
   ========================================================= */
(function () {
  "use strict";

  var CHAVE = "vivamais:acessibilidade";
  var ESCALA_MIN = 0.9;
  var ESCALA_MAX = 1.6;
  var ESCALA_PASSO = 0.1;

  var padrao = { escala: 1, contraste: false, movimento: true };
  var prefs = carregar();

  function carregar() {
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE));
      if (salvo && typeof salvo === "object") {
        return {
          escala: clamp(Number(salvo.escala) || 1, ESCALA_MIN, ESCALA_MAX),
          contraste: !!salvo.contraste,
          movimento: salvo.movimento !== false
        };
      }
    } catch (e) { /* ignora dados inválidos */ }
    return Object.assign({}, padrao);
  }

  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(prefs)); } catch (e) {}
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  /* Aplica as preferências ao documento */
  function aplicar() {
    document.documentElement.style.setProperty("--escala", String(prefs.escala));
    document.body.classList.toggle("alto-contraste", prefs.contraste);
    document.body.classList.toggle("sem-movimento", !prefs.movimento);

    sincronizarBotoes();
    anunciar();
  }

  function sincronizarBotoes() {
    var bC = document.getElementById("btn-contraste");
    var bM = document.getElementById("btn-movimento");
    if (bC) bC.setAttribute("aria-pressed", String(prefs.contraste));
    if (bM) bM.setAttribute("aria-pressed", String(!prefs.movimento));

    var bMenos = document.getElementById("btn-fonte-menos");
    var bMais = document.getElementById("btn-fonte-mais");
    if (bMenos) bMenos.disabled = prefs.escala <= ESCALA_MIN + 0.001;
    if (bMais) bMais.disabled = prefs.escala >= ESCALA_MAX - 0.001;
  }

  /* Região aria-live que informa a mudança sem interromper a leitura */
  function anunciar() {
    var regiao = document.getElementById("acess-status");
    if (!regiao) return;
    var pct = Math.round(prefs.escala * 100);
    regiao.textContent =
      "Fonte em " + pct + "%. " +
      "Contraste " + (prefs.contraste ? "alto" : "normal") + ". " +
      "Movimento " + (prefs.movimento ? "ativado" : "reduzido") + ".";
  }

  function mudarFonte(delta) {
    prefs.escala = clamp(
      Math.round((prefs.escala + delta) * 10) / 10,
      ESCALA_MIN, ESCALA_MAX
    );
    salvar(); aplicar();
  }

  function alternarContraste() { prefs.contraste = !prefs.contraste; salvar(); aplicar(); }
  function alternarMovimento() { prefs.movimento = !prefs.movimento; salvar(); aplicar(); }

  function ligar() {
    var map = {
      "btn-fonte-menos": function () { mudarFonte(-ESCALA_PASSO); },
      "btn-fonte-mais": function () { mudarFonte(ESCALA_PASSO); },
      "btn-contraste": alternarContraste,
      "btn-movimento": alternarMovimento
    };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("click", map[id]);
    });
    aplicar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ligar);
  } else {
    ligar();
  }
})();
