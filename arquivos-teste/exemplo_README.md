<div align="center">

<img src="assets/logo.png" width="120" alt="easybrawto logo" />

# easybrawto

**Simple browser automation via CDP — write scripts in your own language**

*A personal project by an enthusiast — contributions welcome!*

[![Release](https://img.shields.io/github/v/release/Saimonsanbr/easybrawto?style=flat-square&color=black)](https://github.com/Saimonsanbr/easybrawto/releases/latest)
[![License](https://img.shields.io/badge/license-MIT-black?style=flat-square)](LICENSE)
[![Built with Crystal](https://img.shields.io/badge/built_with-Crystal-black?style=flat-square)](https://crystal-lang.org)
[![Languages](https://img.shields.io/badge/scripts-EN%20%7C%20PT--BR%20%7C%20JP-black?style=flat-square)](#multilingual-scripts)

<br/>

[**⬇ Download for macOS (Apple Silicon)**](https://github.com/Saimonsanbr/easybrawto/releases/latest/download/easybrawto-macos-arm64)
&nbsp;&nbsp;
[**⬇ Download for macOS (Intel)**](https://github.com/Saimonsanbr/easybrawto/releases/latest/download/easybrawto-macos-x64)
&nbsp;&nbsp;
[**⬇ Download for Linux**](https://github.com/Saimonsanbr/easybrawto/releases/latest/download/easybrawto-linux-x64)

<br/>

[**📖 Full Documentation & Examples →**](https://easybrawto.mintlify.app)
&nbsp;&nbsp;
[**🤖 AI Agent Skill →**](https://github.com/Saimonsanbr/easybrawto/blob/main/ai/SKILL.md)

</div>

---

## What is this?

easybrawto is a small CLI tool that lets you automate any website using a simple `.auto` script.

```
chrome.persistProfile('my_profile')

functions searchWikipedia {
  .navigate('https://en.wikipedia.org')
  .waitLoad()
  .insertText('search', 'Crystal language')
  .clickButton('Search')
  .waitLoad()
  .screenshot('result.png')
  .log('Done!')
}

run searchWikipedia
```

```bash
./easybrawto run script.auto
```

No Selenium. No WebDriver. No Python. No `npm install`.  
Just a binary and a `.auto` file.

---

## Honest intro

This is a personal project. I'm not a professional developer — I built this because I needed browser automation that wouldn't get blocked by websites, and I wanted something dead simple to write and read.

It talks directly to Chrome via the **Chrome DevTools Protocol (CDP)** — the same internal protocol the browser's DevTools uses. Real browser, real profile, no injected drivers.

It's rough around the edges. There are probably bugs. But it works for most common tasks, and the script format is simple enough that an AI agent can write it for you.

If you find it useful, great. If you find bugs or want to contribute, even better — I'm still learning Crystal and open to help.

---

## Quick start

**1. Download the binary** for your platform above

**2. Make it executable:**
```bash
chmod +x easybrawto
```

**3. Write a script** — save as `script.auto`:
```
chrome.persistProfile('my_profile')

functions openSite {
  .navigate('https://example.com')
  .waitLoad()
  .screenshot('result.png')
  .log('Done!')
}

run openSite
```

**4. Run:**
```bash
./easybrawto run script.auto
```

Requires Chrome, Brave, or Edge installed on your machine.

---

## CLI commands

easybrawto has a few direct terminal commands — no script needed.

### `open` — create or open a profile

```bash
./easybrawto open profile_name
./easybrawto open profile_name brave    # specify browser
```

Opens a browser window with a persistent profile. If the profile doesn't exist, it creates one. The browser stays open until you press `Ctrl+C`. Use this to log into your accounts once — everything is saved for future script runs.

```
easybrawto — Gerenciador de perfis
─────────────────────────────────
[easybrawto] Abrindo perfil existente: 'work'
[easybrawto] Navegador aberto com o perfil 'work'

  Faça login nas suas contas normalmente.
  Tudo ficará salvo para próximas execuções.

  Pressione Ctrl+C para fechar.
```

Profile data is stored in `~/.easybrawto/profiles/profile_name/`. A metadata file at `~/.easybrawto/profiles.json` keeps track of profile names, creation dates, and last opened time — nothing sensitive.

**Aliases:** `abrir` (PT), `開く` (JP)

---

### `profiles` — list saved profiles

```bash
./easybrawto profiles
```

```
easybrawto — Perfis salvos
──────────────────────────

  Nome                 Navegador  Criado em              Último uso
  ──────────────────── ────────── ────────────────────── ──────────────────────
  work                 chrome     2026-03-20T10:30:00Z   2026-03-20T14:22:00Z
  personal             brave      2026-03-18T09:15:00Z   2026-03-19T11:00:00Z

Total: 2 perfil(s)

Abrir perfil: ./easybrawto open <nome>
```

**Aliases:** `perfis` (PT), `プロファイル` (JP)

---

### `run` — run a script

```bash
./easybrawto run script.auto
```

---

## Try the test sites

Four test sites are live and ready — no setup needed. Each one has three sections that require scrolling, a cookie popup, and a newsletter modal that appears mid-scroll.

| Level | Stack | URL |
|---|---|---|
| Level 1 | Plain HTML + CSS + JS | [easybrawto-level1.pages.dev](https://easybrawto-level1.pages.dev) |
| Level 2 | Tailwind CSS | [easybrawto-level2.pages.dev](https://easybrawto-level2.pages.dev) |
| Level 3 | React (hooks, controlled inputs) | [easybrawto-level3.pages.dev](https://easybrawto-level3.pages.dev) |
| Level 4 | Next.js style (hashed classes, data-attributes) | [easybrawto-level4.pages.dev](https://easybrawto-level4.pages.dev) |

The matching `.auto` scripts are in `test-scripts/scripts/`. Point them at the live URLs and run:
```bash
./easybrawto run test-scripts/scripts/level1.auto
```

The four levels are progressively harder for automation tools — but the `.auto` scripts stay nearly identical across all of them. That's the point.

> **Level 1** — plain HTML, direct IDs and names. The easiest baseline.
> **Level 2** — Tailwind CSS, no IDs on most elements. Forces use of `name` and `aria-label`.
> **Level 3** — React with controlled inputs and async rendering. Tests framework compatibility.
> **Level 4** — Next.js style with hashed CSS classes and `data-attributes`. Closest to real production sites.

The sites are also in `test-scripts/` if you want to run them locally:
```bash
cd test-scripts && python3 -m http.server 8080
```

Play with them. Break them. Modify the scripts. It's the best way to understand what easybrawto can and can't do.

---

## Multilingual scripts

easybrawto supports writing `.auto` scripts in **English, Portuguese (PT-BR), and Japanese**. No configuration needed — just write in your language and it works.

The same script in three languages:

**English**
```
chrome.persistProfile('my_profile')

functions searchSite {
  .navigate('https://example.com')
  .waitLoad()
  .insertText('search', 'Crystal')
  .clickButton('Search')
  .screenshot('result.png')
  .log('Done!')
}

run searchSite
```

**Português (PT-BR)**
```
navegador.manterPerfil('meu_perfil')

funcoes buscarSite {
  .navegar('https://example.com')
  .esperarCarregar()
  .inserirTexto('search', 'Crystal')
  .clicarBotao('Buscar')
  .capturarTela('resultado.png')
  .imprimir('Funcionou!')
}

rodar buscarSite
```

**日本語**
```
chrome.persistProfile('マイプロファイル')

関数 サイト検索 {
  .ナビゲート('https://example.com')
  .読み込み待機()
  .テキスト入力('search', 'Crystal')
  .ボタンクリック('検索')
  .スクリーンショット('結果.png')
  .ログ('完了!')
}

実行 サイト検索
```

Languages can even be mixed in the same script — each line is resolved independently. The `lang/` folder contains YAML files mapping aliases to canonical commands. Adding a new language is just creating a new `.yml` file.

> **Full command reference for each language** → [Documentation](https://easybrawto.mintlify.app)

---

## Script syntax

### Browser setup
Place at the top of the script, before any functions.

```
# Persistent profile — saves cookies, logins, sessions between runs
# First run creates the profile. Next runs reuse it.
chrome.persistProfile('profile_name')

# Use a specific profile from your browser installation
chrome.profile('/Users/you/Library/Application Support/Google/Chrome', 'Profile 3')

# Clean temporary profile — deleted after the script ends (default)
chrome.tempProfile()

# Choose browser — default is chrome
chrome.browser('brave')
chrome.browser('edge')
```

### All commands

| Command | What it does |
|---|---|
| `.navigate('url')` | Go to a URL |
| `.waitLoad()` | Wait for the page to finish loading |
| `.waitFor('selector')` | Wait for a specific element to appear |
| `.waitForText('text')` | Wait for a specific text to appear anywhere on the page |
| `.waitSeconds(n)` | Wait a fixed number of seconds |
| `.insertText('selector', 'text')` | Type into a field — works with React, Vue, Angular |
| `.clearField('selector')` | Clear a field before typing |
| `.clickButton('text or selector')` | Click a button, link, or element |
| `.clickIfExists('text or selector')` | Click only if the element exists — never fails |
| `.pressKey('key')` | Press Enter, Tab, Escape... |
| `.selectOption('selector', 'value')` | Select a dropdown option by visible text |
| `.checkBox('selector')` | Check a checkbox |
| `.scroll('direction', amount)` | Scroll the page — `down`, `up`, `top`, `bottom` |
| `.reload()` | Reload the current page |
| `.goBack()` | Navigate back in history |
| `.goForward()` | Navigate forward in history |
| `.getValue('selector')` | Read the current value of an input field |
| `.getAttribute('selector', 'attr')` | Read any HTML attribute of an element |
| `.runJS('code')` | Run arbitrary JavaScript — supports multiline |
| `.scrapePageTo('folder')` | Save page structure as `raw.json` + `llm.txt` |
| `.screenshot('file.png')` | Save a screenshot |
| `.log('message')` | Print a message in the terminal |

### Selectors

| What you write | What it matches |
|---|---|
| `'Sign in'` | Button or link with that visible text |
| `'search'` | Input field with `name="search"` |
| `'#email'` | Element with `id="email"` |
| `'.submit-btn'` | Element with `class="submit-btn"` |
| `'Enter your email'` | Input with that placeholder |
| `'Send message'` | Input with that `aria-label` |

The selector cascade tries multiple strategies automatically — text, name, id, class, placeholder, aria-label — so scripts stay readable without inspecting the DOM for the perfect CSS selector.

### Functions and run

```
functions login {
  .navigate('https://site.com/login')
  .waitLoad()
  .insertText('#email', 'user@mail.com')
  .insertText('#password', 'password')
  .clickButton('Sign in')
  .waitLoad()
}

functions doWork {
  .navigate('https://site.com/dashboard')
  .screenshot('dashboard.png')
}

run login
run doWork
```

---

## Examples

### Stay logged in across runs
```
chrome.persistProfile('work')

functions login {
  .navigate('https://site.com/login')
  .waitLoad()
  .insertText('#email', 'user@mail.com')
  .insertText('#password', 'password')
  .clickButton('Sign in')
  .waitLoad()
  .log('Logged in!')
}

run login
```
> Run once to log in. Next time it opens already logged in.

---

### Fill a complete form
```
chrome.persistProfile('automation')

functions fillForm {
  .navigate('https://site.com/contact')
  .waitLoad()
  .waitSeconds(2)
  .clickIfExists('Accept cookies')
  .insertText('nome', 'John Doe')
  .insertText('email', 'john@mail.com')
  .selectOption('assunto', 'Support')
  .insertText('mensagem', 'Hello from easybrawto!')
  .checkBox('#terms')
  .clickButton('Send')
  .waitForText('Message sent')
  .screenshot('sent.png')
}

run fillForm
```

---

### Handle popups gracefully
```
chrome.persistProfile('my_profile')

functions browse {
  .navigate('https://site.com')
  .waitLoad()
  .waitSeconds(3)
  .clickIfExists('Accept cookies')
  .scroll('down', 500)
  .waitSeconds(2)
  .clickIfExists('No thanks')
  .scroll('bottom')
  .screenshot('result.png')
}

run browse
```

---

### Scrape page structure for AI agents
```
chrome.persistProfile('my_profile')

functions scrape {
  .navigate('https://site.com')
  .waitLoad()
  .scrapePageTo('output/site')
  .log('Done!')
}

run scrape
```

Saves two files in `output/site/`:
- `raw.json` — full interactive element structure, readable by humans
- `llm.txt` — compact DSL format optimized for LLMs

---

### Run custom JavaScript (multiline supported)
```
chrome.persistProfile('my_profile')

functions customJs {
  .navigate('https://site.com')
  .waitLoad()
  .runJS("(function() {
    document.querySelector('.cookie-banner').remove();
    return 'done';
  })()")
  .screenshot('clean.png')
}

run customJs
```

---

### Browse Chrome history
```
chrome.persistProfile('my_profile')

functions history {
  .navigate('chrome://history')
  .waitLoad()
  .screenshot('history.png')
}

run history
```

---

## Building from source

Requires [Crystal](https://crystal-lang.org/install/).

```bash
git clone https://github.com/Saimonsanbr/easybrawto
cd easybrawto
crystal build src/main.cr -o easybrawto --release
```

---

## How it works

1. Reads the `.auto` script and parses functions and commands
2. Launches Chrome/Brave/Edge with `--remote-debugging-port=9222`
3. Connects via WebSocket to the Chrome DevTools Protocol
4. Sends CDP commands and JavaScript directly to the open tab
5. Each command runs in sequence, waiting for the browser before continuing

No WebDriver. No browser extension. No persistent injected scripts.

---

## Current status — v0.2.6

**Working:**
- `navigate`, `waitLoad`, `waitFor`, `waitForText`, `waitSeconds`
- `insertText` — compatible with React, Vue, Angular, Shadow DOM
- `clearField`, `clickButton`, `clickIfExists`, `pressKey`
- `selectOption` — by visible text or value
- `checkBox`
- `scroll` — down, up, top, bottom
- `reload`, `goBack`, `goForward`
- `getValue`, `getAttribute`
- `runJS` — multiline JavaScript support
- `scrapePageTo` — saves `raw.json` + `llm.txt` for AI agents
- `screenshot`, `log`
- Persistent, temporary, and system profiles
- Chrome, Brave, Edge on **macOS and Linux**
- **Multilingual scripts — English, Portuguese, Japanese**
- **CLI profile manager** — `open` and `profiles` commands

**Known limitations (maybe you can help):**
- No Windows support yet
- `waitLoad` can be slow on heavy SPAs — prefer `waitFor` when possible
- No variables or conditionals in scripts yet

**Coming next if god allows:**
- `watch()` — background observers that react to popups automatically
- `rules{}` block — global script behavior configuration
- Variables in scripts
- Windows support
- More languages in `lang/`

---

## Contributing

Issues and PRs are welcome. I'm not an expert in Crystal — if you see something wrong or have a better approach, please open an issue or send a PR. This project exists because I needed it, and it'll get better with help.

Want to add a new language? Just create `lang/your-language.yml` with the command aliases and open a PR. That's it.

---

## License

MIT