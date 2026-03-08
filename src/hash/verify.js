import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const verify = async () => {
  const checksumsPath = path.join(process.cwd(), 'checksums.json');

  if (!fs.existsSync(checksumsPath)) {
    throw new Error('FS operation failed');
  }

  const checksumsData = JSON.parse(fs.readFileSync(checksumsPath, 'utf-8'));

  for (const [filename, expectedHash] of Object.entries(checksumsData)) {
    const filePath = path.join(process.cwd(), filename);

    if (!fs.existsSync(filePath)) {
      console.log(`${filename} — FAIL`);
      continue;
    }

    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    await new Promise((resolve, reject) => {
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => {
        const actualHash = hash.digest('hex');
        console.log(`${filename} — ${actualHash === expectedHash ? 'OK' : 'FAIL'}`);
        resolve();
      });
      stream.on('error', (err) => reject(err));
    });
  }
};

await verify();
