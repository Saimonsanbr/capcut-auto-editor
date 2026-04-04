let selectedProjects = new Set();
let isProcessing = false;

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

    btnMagic.addEventListener('click', () => {
        if (selectedProjects.size === 0 || isProcessing) return;
        
        isProcessing = true;
        modal.classList.add('active');
        progressMsg.innerText = "Iniciando a edição mágica...";
        spinner.style.display = 'block';
        btnCloseModal.style.display = 'none';

        // Envia array de strings (caminhos dos projetos)
        const paths = Array.from(selectedProjects);
        window.api.processProjects(paths);
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
