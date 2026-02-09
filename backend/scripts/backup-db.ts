import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Get Database connection string from arguments or .env (here simplified for script)
// Ideally, use dotenv or similar to load process.env
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL is not defined in environment variables.');
    process.exit(1);
}

const backupDir = path.join(__dirname, '..', 'backups');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);

async function runBackup() {
    console.log('📦 Starting database backup...');
    console.log(`📂 Destination: ${backupFile}`);

    try {
        // Construct pg_dump command
        // Note: pg_dump must be available in the system PATH
        const command = `pg_dump "${DATABASE_URL}" -F p -f "${backupFile}"`;

        await execAsync(command);

        console.log('✅ Backup completed successfully!');

        // Optional: File stats
        const stats = fs.statSync(backupFile);
        console.log(`📊 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    } catch (error) {
        console.error('❌ Backup failed:', error);
        process.exit(1);
    }
}

runBackup();
