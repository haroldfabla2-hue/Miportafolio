const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'diagnostic_result.txt');

function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
}

log('Starting diagnosis...');

try {
    require('ts-node/register');
    log('ts-node registered');

    // Attempt to require AppModule (this will fail if dependencies are missing)
    try {
        const { AppModule } = require('./src/app.module');
        log('AppModule loaded successfully');
    } catch (e) {
        log('FAILED to load AppModule: ' + e.message);
        log(e.stack);
    }

} catch (e) {
    log('Global error: ' + e.message);
    log(e.stack);
}
