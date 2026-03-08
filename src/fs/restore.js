import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

const restore = async () => {
  const snapshotPath = path.resolve('snapshot.json');

  let data;

  try {
    const file = await readFile(snapshotPath, 'utf-8');
    data = JSON.parse(file);
  } catch {
    throw new Error('FS operation failed');
  }

  const { rootPath, entries } = data;

  await mkdir(rootPath, { recursive: true });

  for (const entry of entries) {
    const fullPath = path.join(rootPath, entry.path);

    if (entry.type === 'directory') {
      await mkdir(fullPath, { recursive: true });
    }

    if (entry.type === 'file') {
      const buffer = Buffer.from(entry.content, 'base64');
      await writeFile(fullPath, buffer);
    }
  }
};

await restore();
