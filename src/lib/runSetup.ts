import fs from 'fs';
import path from 'path';
import { setupDatabase } from './dbSetup';

// Parse .env.local manually to ensure compatibility across Node versions
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const firstEquals = trimmed.indexOf('=');
        if (firstEquals !== -1) {
          const key = trimmed.substring(0, firstEquals).trim();
          const val = trimmed.substring(firstEquals + 1).trim();
          process.env[key] = val;
        }
      }
    });
    console.log('Successfully loaded .env.local environment variables.');
  } else {
    console.log('.env.local file not found, using system environment variables.');
  }
} catch (err) {
  console.warn('Warning: Could not parse .env.local file:', err);
}

setupDatabase()
  .then(() => {
    console.log('Database setup executed successfully.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Database setup failed with error:', err);
    process.exit(1);
  });
