# VivaMais — Plano de saúde acessível

Projeto final da disciplina **SCC0580 — Acessibilidade em Sistemas Computacionais** (ICMC-USP).

Aplicação front-end de um plano de saúde, com foco em acessibilidade para **pessoas idosas** e **pessoas autistas**. O usuário percorre um fluxo completo de tarefa (o "caminho feliz"): agendar uma consulta médica.

## Fluxo (caminho feliz)

`index.html` → `login.html` → `passo1-especialidade.html` → `passo2-agendamento.html` → `passo3-confirmar.html` → `sucesso.html`

## Recursos de acessibilidade

- **Aumentar / diminuir fonte** (controle próprio, não o zoom do navegador), com preferência salva.
- **Alto contraste** (tema amarelo sobre preto).
- **Reduzir movimento** (apoio ao público autista; respeita `prefers-reduced-motion`).
- **VLibras** (tradução para Libras) em todas as páginas.
- **Responsivo**: smartphone, tablet e desktop.
- **WAI-ARIA**: `radiogroup` navegável por setas (especialidades) e região `aria-live="polite"` (avisos), além de `aria-describedby`, `aria-invalid`, `aria-current` e `aria-pressed`.
- **WCAG 2.1/2.2 A e AA**: `lang`, `alt` significativo, navegação por teclado, foco visível, validação com mensagens de erro, limite de tempo ajustável, contraste mínimo. Auditado com axe-core (0 violações).

## Tecnologias

HTML, CSS e JavaScript puro. Sem build. Pronto para GitHub Pages.

## Estrutura

```
index.html, login.html, passo1..passo3, sucesso.html   páginas do fluxo
css/estilo.css                                          estilos e temas
js/layout.js                                            barra de acessibilidade + VLibras + favicon
js/acessibilidade.js                                    fonte, contraste, movimento (persistência)
js/fluxo.js                                             lógica do agendamento (validação, estado, ARIA)
img/                                                    imagens reais (créditos no rodapé)
documento-complementar.html                             fonte do PDF complementar
Documento-Complementar-VivaMais.pdf                     documento de entrega
```

## Como rodar localmente

```sh
python3 -m http.server 8000
# abra http://localhost:8000
```

## Créditos das imagens

Imagens de uso livre do banco público [Pexels](https://www.pexels.com), creditadas no rodapé de cada página.
