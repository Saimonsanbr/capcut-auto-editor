const logs = [];

function addLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    logs.push(logEntry);
    console.log(logEntry); // Mantém no console pra debug

    // Mantém no máximo 500 linhas de log em memória pra não vazar RAM
    if (logs.length > 500) {
        logs.shift();
    }
}

function getLogs() {
    return logs;
}

module.exports = {
    addLog,
    getLogs
};
