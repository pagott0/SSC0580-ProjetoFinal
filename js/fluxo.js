/* =========================================================
   VivaMais - Lógica do fluxo "caminho feliz"
   Agendamento de consulta em 3 passos. O estado é guardado
   em sessionStorage e lido nas telas seguintes.
   ========================================================= */
(function () {
  "use strict";

  var CHAVE = "vivamais:agendamento";

  function estado() {
    try { return JSON.parse(sessionStorage.getItem(CHAVE)) || {}; }
    catch (e) { return {}; }
  }
  function gravar(dados) {
    var atual = estado();
    Object.assign(atual, dados);
    try { sessionStorage.setItem(CHAVE, JSON.stringify(atual)); } catch (e) {}
    return atual;
  }

  /* Mostra/esconde mensagem de erro e marca o campo (aria-invalid) */
  function erro(campo, idErro, mostrar) {
    var msg = document.getElementById(idErro);
    if (campo) campo.setAttribute("aria-invalid", mostrar ? "true" : "false");
    if (msg) msg.classList.toggle("visivel", mostrar);
  }

  function anunciar(idStatus, texto) {
    var r = document.getElementById(idStatus);
    if (!r) return;
    r.textContent = "";               // reinicia para garantir anúncio
    window.setTimeout(function () { r.textContent = texto; r.classList.add("visivel"); }, 30);
  }

  function formatarData(iso) {
    if (!iso) return "—";
    var p = iso.split("-");
    if (p.length !== 3) return iso;
    var meses = ["janeiro","fevereiro","março","abril","maio","junho","julho",
                 "agosto","setembro","outubro","novembro","dezembro"];
    var dia = parseInt(p[2], 10);
    var mes = meses[parseInt(p[1], 10) - 1] || "";
    return dia + " de " + mes + " de " + p[0];
  }

  /* ---------------- LOGIN ---------------- */
  function initLogin() {
    var form = document.getElementById("form-login");
    if (!form) return;

    var cpf = document.getElementById("cpf");
    var senha = document.getElementById("senha");

    // Máscara de CPF: 000.000.000-00 (apenas números)
    cpf.addEventListener("input", function () {
      var v = cpf.value.replace(/\D/g, "").slice(0, 11);
      var out = v;
      if (v.length > 9) out = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
      else if (v.length > 6) out = v.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
      else if (v.length > 3) out = v.replace(/(\d{3})(\d{1,3})/, "$1.$2");
      cpf.value = out;
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var numeros = cpf.value.replace(/\D/g, "");
      var cpfOk = numeros.length === 11;
      var senhaOk = senha.value.length >= 6;

      erro(cpf, "cpf-erro", !cpfOk);
      erro(senha, "senha-erro", !senhaOk);

      if (!cpfOk) { cpf.focus(); return; }
      if (!senhaOk) { senha.focus(); return; }

      window.location.href = "passo1-especialidade.html";
    });

    // Aviso de limite de tempo ajustável (WCAG 2.2.1) - demonstração
    var aviso = document.getElementById("aviso-tempo");
    var temporizador = window.setTimeout(function () {
      if (aviso) { aviso.hidden = false; aviso.focus && aviso.focus(); }
    }, 20000); // após 20s mostra o aviso

    var btnMais = document.getElementById("btn-mais-tempo");
    if (btnMais) btnMais.addEventListener("click", function () {
      window.clearTimeout(temporizador);
      document.getElementById("aviso-tempo-titulo").textContent = "Sessão prolongada";
      document.getElementById("aviso-tempo-texto").textContent =
        "Pronto! Você tem mais tempo para preencher com calma.";
      btnMais.hidden = true;
    });
  }

  /* ---------------- PASSO 1: radiogroup acessível ---------------- */
  function initEspecialidade() {
    var grupo = document.getElementById("grupo-especialidade");
    var form = document.getElementById("form-especialidade");
    if (!grupo || !form) return;

    var opcoes = Array.prototype.slice.call(grupo.querySelectorAll('[role="radio"]'));

    function selecionar(alvo, focar) {
      opcoes.forEach(function (o) {
        var sel = o === alvo;
        o.setAttribute("aria-checked", sel ? "true" : "false");
        o.tabIndex = sel ? 0 : -1;
      });
      if (focar) alvo.focus();
      anunciar("status-escolha", "Especialidade selecionada: " + alvo.dataset.valor + ".");
    }

    opcoes.forEach(function (o, i) {
      o.addEventListener("click", function () { selecionar(o, false); });
      o.addEventListener("keydown", function (e) {
        var k = e.key;
        if (k === " " || k === "Enter") { e.preventDefault(); selecionar(o, false); return; }
        var prox = null;
        if (k === "ArrowDown" || k === "ArrowRight") prox = opcoes[(i + 1) % opcoes.length];
        if (k === "ArrowUp" || k === "ArrowLeft") prox = opcoes[(i - 1 + opcoes.length) % opcoes.length];
        if (prox) { e.preventDefault(); selecionar(prox, true); }
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var escolhida = grupo.querySelector('[aria-checked="true"]');
      gravar({ especialidade: escolhida ? escolhida.dataset.valor : "Clínica Geral" });
      window.location.href = "passo2-agendamento.html";
    });
  }

  /* ---------------- PASSO 2: médico, data, hora ---------------- */
  function initAgendamento() {
    var form = document.getElementById("form-agendamento");
    if (!form) return;

    var eco = document.getElementById("especialidade-eco");
    var dados = estado();
    if (eco && dados.especialidade) eco.textContent = dados.especialidade;

    var medico = document.getElementById("medico");
    var data = document.getElementById("data");
    var hora = document.getElementById("hora");

    // Data mínima = hoje
    var hoje = new Date().toISOString().split("T")[0];
    data.min = hoje;

    // Salva rascunho e anuncia (polite), sem interromper
    function rascunho() {
      gravar({ medico: medico.value, data: data.value, hora: hora.value });
      anunciar("status-salvo", "Rascunho salvo.");
    }
    [medico, data, hora].forEach(function (c) { c.addEventListener("change", rascunho); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var medOk = !!medico.value;
      var dataOk = !!data.value && data.value >= hoje;
      var horaOk = !!hora.value;

      erro(medico, "medico-erro", !medOk);
      erro(data, "data-erro", !dataOk);
      erro(hora, "hora-erro", !horaOk);

      if (!medOk) { medico.focus(); return; }
      if (!dataOk) { data.focus(); return; }
      if (!horaOk) { hora.focus(); return; }

      gravar({ medico: medico.value, data: data.value, hora: hora.value });
      window.location.href = "passo3-confirmar.html";
    });
  }

  /* ---------------- PASSO 3: confirmar ---------------- */
  function initConfirmar() {
    var btn = document.getElementById("btn-confirmar");
    if (!btn) return;
    var d = estado();

    preencher("r-especialidade", d.especialidade);
    preencher("r-medico", d.medico);
    preencher("r-data", formatarData(d.data));
    preencher("r-hora", d.hora);

    btn.addEventListener("click", function () {
      anunciar("status-confirmar", "Agendamento confirmado. Redirecionando para a confirmação.");
      gravar({ confirmado: true });
      window.setTimeout(function () { window.location.href = "sucesso.html"; }, 700);
    });
  }

  /* ---------------- SUCESSO ---------------- */
  function initSucesso() {
    var alvo = document.getElementById("resumo-final");
    if (!alvo) return;
    var d = estado();
    preencher("f-especialidade", d.especialidade);
    preencher("f-medico", d.medico);
    preencher("f-data", formatarData(d.data));
    preencher("f-hora", d.hora);
  }

  function preencher(id, valor) {
    var el = document.getElementById(id);
    if (el && valor) el.textContent = valor;
  }

  function iniciar() {
    initLogin();
    initEspecialidade();
    initAgendamento();
    initConfirmar();
    initSucesso();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
