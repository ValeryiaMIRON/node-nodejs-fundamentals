import fs from 'fs/promises';
import path from 'path';

const findByExt = async () => {
  try {
    const workspace = path.resolve('workspace');

    await fs.access(workspace);

    const extArgIndex = process.argv.indexOf('--ext');
    const ext = extArgIndex !== -1 ? '.' + process.argv[extArgIndex + 1].replace(/^\./, '') : '.txt';

    const filesFound = [];

    const traverse = async (dir) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(workspace, fullPath);
        if (entry.isDirectory()) {
          await traverse(fullPath);
        } else if (entry.isFile() && path.extname(entry.name) === ext) {
          filesFound.push(relPath);
        }
      }
    };

    await traverse(workspace);

    filesFound.sort();
    filesFound.forEach(file => console.log(file));

  } catch (err) {
    throw new Error('FS operation failed');
  }
};

await findByExt();