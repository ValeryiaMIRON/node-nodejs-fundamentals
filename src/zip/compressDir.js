import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const compressDir = async () => {
  const srcDir = path.join(process.cwd(), 'workspace', 'toCompress');
  const destDir = path.join(process.cwd(), 'workspace', 'compressed');
  const archivePath = path.join(destDir, 'archive.br');

  if (!fs.existsSync(srcDir)) {
    throw new Error('FS operation failed');
  }

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const brotli = zlib.createBrotliCompress();
  const archiveStream = fs.createWriteStream(archivePath);

  brotli.pipe(archiveStream);

  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(srcDir, fullPath);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        const content = fs.readFileSync(fullPath);

        brotli.write(`FILE:${relativePath}\n`);
        brotli.write(content);
        brotli.write(`\nEND_FILE\n`);
      }
    }
  };

  walk(srcDir);

  brotli.end();
};

await compressDir();
