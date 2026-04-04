const os = require('os');
const path = require('path');

const USER_HOME = os.homedir();
const isWin = os.platform() === 'win32';

// CAMINHOS DOS PROJETOS (PROJECTS)
// Mude aqui se a sua pasta "com.lveditor.draft" no Windows mudar no futuro.
const PROJECTS_WIN = path.join(process.env.LOCALAPPDATA || '', 'CapCut', 'User Data', 'Projects', 'com.lveditor.draft');
// Mude aqui se a sua pasta "com.lveditor.draft" no Mac mudar. (Estava em ~/Movies/CapCut/... no script original)
const PROJECTS_MAC = path.join(USER_HOME, 'Movies', 'CapCut', 'User Data', 'Projects', 'com.lveditor.draft');

// CAMINHOS DE CACHE DE EFEITOS E TRANSIÇÕES (EFFECTS/CACHE)
// Mude aqui caso você clone a pasta de Cache de efeitos para dentro do projeto futuramente (ex: assets/effects).
// PATH WINDOWS: C:\Users\name\AppData\Local\Capcut\User Data\Cache\effect
const EFFECTS_CACHE_WIN = path.join(process.env.LOCALAPPDATA || '', 'CapCut', 'User Data', 'Cache', 'effect');
const EFFECTS_CACHE_MAC = path.join(USER_HOME, 'Library', 'Containers', 'com.lemon.lvoverseas', 'Data', 'Movies', 'CapCut', 'User Data', 'Cache', 'effect');

module.exports = {
  PROJECTS_DIR: isWin ? PROJECTS_WIN : PROJECTS_MAC,
  EFFECTS_CACHE_DIR: isWin ? EFFECTS_CACHE_WIN : EFFECTS_CACHE_MAC,
  isWin
};
