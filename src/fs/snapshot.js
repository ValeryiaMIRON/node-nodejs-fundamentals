import { readdir, stat, readFile, writeFile } from 'fs/promises';
import path from 'path';

const snapshot = async () => {
  const workspacePath = path.resolve('workspace');

  const entries = [];

  const scan = async (dir, base = '') => {
    const items = await readdir(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(base, item);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        entries.push({
          path: relativePath,
          type: 'directory'
        });

        await scan(fullPath, relativePath);
      } else {
        const content = await readFile(fullPath);

        entries.push({
          path: relativePath,
          type: 'file',
          size: stats.size,
          content: content.toString('base64')
        });
      }
    }
  };

  try {
    await stat(workspacePath);
  } catch {
    throw new Error('FS operation failed');
  }

  await scan(workspacePath);

  const snapshotData = {
    rootPath: workspacePath,
    entries
  };

  await writeFile(
    path.join(workspacePath, '..', 'snapshot.json'),
    JSON.stringify(snapshotData, null, 2)
  );
};

await snapshot();
