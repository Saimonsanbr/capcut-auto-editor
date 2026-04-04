const fs = require('fs/promises');
const path = require('path');
const { PROJECTS_DIR } = require('./paths');

async function getProjects() {
  try {
    const isReady = await fs.stat(PROJECTS_DIR).catch(() => null);
    if (!isReady) {
      console.error('Diretório de projetos não encontrado:', PROJECTS_DIR);
      return [];
    }

    const items = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    let projects = [];

    for (const item of items) {
      if (item.isDirectory()) {
        const projPath = path.join(PROJECTS_DIR, item.name);
        
        // Pula pastas internas não-projeto
        if (item.name.startsWith('.') || item.name === 'Resources' || item.name === 'Timelines') {
          continue;
        }

        const metaPath = path.join(projPath, 'draft_meta_info.json');
        
        try {
          // Verifica se é um projeto válido (tem o draft_meta_info)
          await fs.access(metaPath);
          const metaRaw = await fs.readFile(metaPath, 'utf-8');
          const meta = JSON.parse(metaRaw);

          const coverPath = path.join(projPath, 'draft_cover.jpg');
          let hasCover = true;
          try {
            await fs.access(coverPath);
          } catch {
            hasCover = false;
          }

          projects.push({
            id: item.name,
            path: projPath,
            name: item.name, // Nome visível do draft normalmente é o nome da pasta
            timestamp: meta.tm_draft_modified || 0,
            duration: meta.tm_duration || 0,
            hasCover,
            coverPath: hasCover ? coverPath : null
          });

        } catch (e) {
          // Não é um projeto válido do CapCut, ignorar pasta
        }
      }
    }

    // Ordenar do mais modificado recentemente para o mais antigo
    return projects.sort((a, b) => b.timestamp - a.timestamp);

  } catch (error) {
    console.error('Erro geral ao ler projetos:', error);
    throw error;
  }
}

module.exports = {
  getProjects
};
