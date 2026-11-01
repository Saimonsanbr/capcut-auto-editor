let selectedProjects = new Set();
let isProcessing = false;
let allEffects = [];
let allTransitions = [];
const LS_EFFECTS_KEY = 'cae-enabled-effects';
const LS_TRANSITIONS_KEY = 'cae-enabled-transitions';
const LS_EFFECT_CHANCE_KEY = 'cae-effect-chance';
const LS_TRANSITION_CHANCE_KEY = 'cae-transition-chance';
const LS_PROC_IMAGES_KEY = 'cae-process-images';
const LS_PROC_VIDEOS_KEY = 'cae-process-videos';
const DEFAULT_CHANCE = 30;

function getEnabledEffects() {
    try {
        const saved = JSON.parse(localStorage.getItem(LS_EFFECTS_KEY) || 'null');
        if (Array.isArray(saved)) {
            // Filtra ids que ainda existem (se um efeito for removido do app, some da lista)
            const known = new Set(allEffects.map(e => e.effect_id));
            const filtered = saved.filter(id => known.size === 0 || known.has(id));
            if (filtered.length > 0 || saved.length === 0) return filtered;
        }
    } catch (e) { /* ignora e usa todos */ }
    return allEffects.map(e => e.effect_id);
}

function setEnabledEffects(ids) {
    try {
        localStorage.setItem(LS_EFFECTS_KEY, JSON.stringify(ids));
    } catch (e) { /* storage indisponível, segue sem persistir */ }
}

function renderEffectsList(container) {
    renderCheckList(container, allEffects, new Set(getEnabledEffects()));
}

function getEnabledTransitions() {
    try {
        const saved = JSON.parse(localStorage.getItem(LS_TRANSITIONS_KEY) || 'null');
        if (Array.isArray(saved)) {
            const known = new Set(allTransitions.map(t => t.effect_id));
            const filtered = saved.filter(id => known.size === 0 || known.has(id));
            if (filtered.length > 0 || saved.length === 0) return filtered;
        }
    } catch (e) { /* ignora e usa todas */ }
    return allTransitions.map(t => t.effect_id);
}

function setEnabledTransitions(ids) {
    try {
        localStorage.setItem(LS_TRANSITIONS_KEY, JSON.stringify(ids));
    } catch (e) { /* storage indisponível, segue sem persistir */ }
}

function renderTransitionsList(container) {
    renderCheckList(container, allTransitions, new Set(getEnabledTransitions()));
}

function renderCheckList(container, items, enabled) {
    container.innerHTML = '';
    if (items.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">Nenhum item carregado.</p>';
        return;
    }
    items.forEach(it => {
        const label = document.createElement('label');
        label.className = 'effect-item';
        const checked = enabled.has(it.effect_id) ? 'checked' : '';
        label.innerHTML = `<input type="checkbox" data-effect-id="${it.effect_id}" ${checked}> <span>${it.name}</span>`;
        container.appendChild(label);
    });
}

function readEffectsSelection(container) {
    return Array.from(container.querySelectorAll('input[type="checkbox"]'))
        .filter(cb => cb.checked)
        .map(cb => cb.dataset.effectId);
}

function getChance(lsKey) {
    try {
        const v = parseInt(localStorage.getItem(lsKey), 10);
        if (!isNaN(v)) return Math.min(100, Math.max(0, v));
    } catch (e) { /* ignora */ }
    return DEFAULT_CHANCE;
}

function setChance(lsKey, value) {
    try {
        localStorage.setItem(lsKey, String(value));
    } catch (e) { /* segue sem persistir */ }
}

function getProcessFlag(lsKey) {
    try {
        const saved = localStorage.getItem(lsKey);
        if (saved !== null) return saved === 'true';
    } catch (e) { /* ignora, usa padrão ligado */ }
    return true;
}

function setProcessFlag(lsKey, value) {
    try {
        localStorage.setItem(lsKey, String(!!value));
    } catch (e) { /* segue sem persistir */ }
}

document.addEventListener('DOMContentLoaded', async () => {
    const loadingEl = document.getElementById('loading');
    const gridEl = document.getElementById('projects-grid');
    
    try {
        // Busca projetos usando a IPC Api do Preload
        const projects = await window.api.getProjects();
        loadingEl.style.display = 'none';
        
        if (!projects || projects.length === 0) {
            gridEl.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1/-1;">Nenhum projeto encontrado ou pasta CapCut inacessível no momento.</p>';
            gridEl.style.display = 'block';
            return;
        }

        gridEl.style.display = 'grid';
        renderProjects(projects, gridEl);

    } catch (err) {
        loadingEl.innerText = "Erro ao carregar projetos: " + err.message;
    }

    // Botões e Ações
    const btnMagic = document.getElementById('btn-magic');
    const modal = document.getElementById('progress-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const progressMsg = document.getElementById('progress-msg');
    const spinner = document.querySelector('.spinner');

    // Carrega catálogos (para a engrenagem de config)
    try {
        allEffects = await window.api.getEffects();
    } catch (e) {
        allEffects = [];
    }
    try {
        allTransitions = await window.api.getTransitions();
    } catch (e) {
        allTransitions = [];
    }

    btnMagic.addEventListener('click', () => {
        if (selectedProjects.size === 0 || isProcessing) return;
        
        isProcessing = true;
        modal.classList.add('active');
        progressMsg.innerText = "Iniciando a edição mágica...";
        spinner.style.display = 'block';
        btnCloseModal.style.display = 'none';

        // Envia array de strings (caminhos dos projetos), o modo selecionado e as configs
        const paths = Array.from(selectedProjects);
        const mode = document.querySelector('input[name="editMode"]:checked').value;
        window.api.processProjects(paths, mode, {
            enabledEffects: getEnabledEffects(),
            enabledTransitions: getEnabledTransitions(),
            effectChance: getChance(LS_EFFECT_CHANCE_KEY) / 100,
            transitionChance: getChance(LS_TRANSITION_CHANCE_KEY) / 100,
            processImages: getProcessFlag(LS_PROC_IMAGES_KEY),
            processVideos: getProcessFlag(LS_PROC_VIDEOS_KEY)
        });
    });

    btnCloseModal.addEventListener('click', () => {
        modal.classList.remove('active');
        // Deselecionar tudo ao fechar a fim de evitar clique duplo sem querer
        selectedProjects.clear();
        updateActionBar();
        document.querySelectorAll('.project-card.selected').forEach(card => card.classList.remove('selected'));
    });

    // Lógica do Modal de Logs
    const btnLogs = document.getElementById('btn-logs');
    const logsModal = document.getElementById('logs-modal');
    const btnCloseLogs = document.getElementById('btn-close-logs');
    const logsContainer = document.getElementById('logs-container');

    btnLogs.addEventListener('click', async () => {
        logsModal.classList.add('active');
        logsContainer.innerHTML = 'Carregando logs...';
        try {
            const logs = await window.api.getLogs();
            logsContainer.innerHTML = '';
            if (logs.length === 0) {
                logsContainer.innerHTML = 'Nenhum log encontrado.';
            } else {
                logs.forEach(msg => {
                    const div = document.createElement('div');
                    let typeClass = 'info';
                    if (msg.includes('[WARN]')) typeClass = 'warn';
                    if (msg.includes('[ERROR]')) typeClass = 'error';
                    if (msg.includes('[SUCCESS]')) typeClass = 'success';
                    
                    div.className = `log-entry ${typeClass}`;
                    div.innerText = msg;
                    logsContainer.appendChild(div);
                });
                logsContainer.scrollTop = logsContainer.scrollHeight;
            }
        } catch(e) {
            logsContainer.innerHTML = 'Erro ao buscar logs.';
        }
    });

    btnCloseLogs.addEventListener('click', () => {
        logsModal.classList.remove('active');
    });

    // Lógica do Modal de Config (engrenagem)
    const btnConfig = document.getElementById('btn-config');
    const configModal = document.getElementById('config-modal');
    const btnCloseConfig = document.getElementById('btn-close-config');
    const btnAllEffects = document.getElementById('btn-all-effects');
    const effectsList = document.getElementById('effects-list');
    const transitionsList = document.getElementById('transitions-list');

    btnConfig.addEventListener('click', () => {
        renderEffectsList(effectsList);
        renderTransitionsList(transitionsList);
        document.getElementById('proc-images').checked = getProcessFlag(LS_PROC_IMAGES_KEY);
        document.getElementById('proc-videos').checked = getProcessFlag(LS_PROC_VIDEOS_KEY);
        const effectChance = document.getElementById('effect-chance');
        const effectChanceVal = document.getElementById('effect-chance-val');
        const transitionChance = document.getElementById('transition-chance');
        const transitionChanceVal = document.getElementById('transition-chance-val');
        effectChance.value = getChance(LS_EFFECT_CHANCE_KEY);
        effectChanceVal.innerText = `${effectChance.value}%`;
        transitionChance.value = getChance(LS_TRANSITION_CHANCE_KEY);
        transitionChanceVal.innerText = `${transitionChance.value}%`;
        configModal.classList.add('active');
    });

    effectsList.addEventListener('change', () => {
        setEnabledEffects(readEffectsSelection(effectsList));
    });

    transitionsList.addEventListener('change', () => {
        setEnabledTransitions(readEffectsSelection(transitionsList));
    });

    btnAllEffects.addEventListener('click', () => {
        effectsList.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = true; });
        transitionsList.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = true; });
        setEnabledEffects(readEffectsSelection(effectsList));
        setEnabledTransitions(readEffectsSelection(transitionsList));
    });

    btnCloseConfig.addEventListener('click', () => {
        setEnabledEffects(readEffectsSelection(effectsList));
        setEnabledTransitions(readEffectsSelection(transitionsList));
        configModal.classList.remove('active');
    });

    // Checkboxes de tipo (imagens / vídeos)
    const procImages = document.getElementById('proc-images');
    const procVideos = document.getElementById('proc-videos');

    procImages.addEventListener('change', () => {
        setProcessFlag(LS_PROC_IMAGES_KEY, procImages.checked);
    });

    procVideos.addEventListener('change', () => {
        setProcessFlag(LS_PROC_VIDEOS_KEY, procVideos.checked);
    });

    // Sliders de chance (valores salvos a cada ajuste)
    const effectChanceInput = document.getElementById('effect-chance');
    const effectChanceVal = document.getElementById('effect-chance-val');
    const transitionChanceInput = document.getElementById('transition-chance');
    const transitionChanceVal = document.getElementById('transition-chance-val');

    effectChanceInput.addEventListener('input', () => {
        effectChanceVal.innerText = `${effectChanceInput.value}%`;
        setChance(LS_EFFECT_CHANCE_KEY, parseInt(effectChanceInput.value, 10));
    });

    transitionChanceInput.addEventListener('input', () => {
        transitionChanceVal.innerText = `${transitionChanceInput.value}%`;
        setChance(LS_TRANSITION_CHANCE_KEY, parseInt(transitionChanceInput.value, 10));
    });

    // Listeners do Backend de Edição
    window.api.onProgress((data) => {
        progressMsg.innerText = data.msg;
    });

    window.api.onFinished((data) => {
        isProcessing = false;
        spinner.style.display = 'none';
        btnCloseModal.style.display = 'inline-block';
        if (data.success) {
            progressMsg.innerText = "✨ Edição Mágica concluída com sucesso!";
        } else {
            progressMsg.innerText = "❌ Erro durante a edição: " + data.error;
        }
    });
});

function renderProjects(projects, container) {
    projects.forEach(proj => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.path = proj.path;

        let thumbHtml = '';
        if (proj.hasCover) {
            // O Electron permite 'file://' no Renderer se não houver restrições extras para paths locais.
            // Para maior robustez em dev puro ignoramos CSP que bloqueiam imagens locais diretas para o funcionamento imediato do proof of concept
            thumbHtml = `<img src="file://${proj.coverPath}" class="project-thumb" alt="Cover">`;
        } else {
            // SVG Icon placeholder
            thumbHtml = `<div class="fallback-thumb">
                <svg viewBox="0 0 24 24"><path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z"/></svg>
            </div>`;
        }

        const dateStr = new Date(proj.timestamp / 1000).toLocaleString('pt-BR');

        card.innerHTML = `
            ${thumbHtml}
            <div class="check-badge"></div>
            <div class="project-info">
                <div class="project-title" title="${proj.name}">${proj.name}</div>
                <div class="project-meta">${dateStr}</div>
            </div>
        `;

        card.addEventListener('click', () => {
            if (isProcessing) return;
            const path = card.dataset.path;
            
            if (selectedProjects.has(path)) {
                selectedProjects.delete(path);
                card.classList.remove('selected');
            } else {
                selectedProjects.add(path);
                card.classList.add('selected');
            }
            
            updateActionBar();
        });

        container.appendChild(card);
    });
}

function updateActionBar() {
    const actionBar = document.getElementById('action-bar');
    const selCount = document.getElementById('selected-count');
    
    if (selectedProjects.size > 0) {
        actionBar.classList.add('visible');
        selCount.innerText = `${selectedProjects.size} selecionado(s)`;
    } else {
        actionBar.classList.remove('visible');
    }
}
