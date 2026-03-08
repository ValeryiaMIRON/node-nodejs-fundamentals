import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const decompressDir = async () => {
  const archivePath = path.join(process.cwd(), 'workspace', 'compressed', 'archive.br');
  const destDir = path.join(process.cwd(), 'workspace', 'decompressed');

  if (!fs.existsSync(archivePath)) {
    throw new Error('FS operation failed');
  }

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const brotli = zlib.createBrotliDecompress();
  const readStream = fs.createReadStream(archivePath);

  let buffer = '';

  readStream.pipe(brotli);

  brotli.on('data', (chunk) => {
    buffer += chunk.toString();
  });

  brotli.on('end', () => {
    const files = buffer.split('END_FILE\n');

    for (const file of files) {
      if (!file.trim()) continue;

      const [header, ...contentParts] = file.split('\n');
      const relativePath = header.replace('FILE:', '').trim();
      const content = contentParts.join('\n');

      const fullPath = path.join(destDir, relativePath);
      const dir = path.dirname(fullPath);

      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(fullPath, content.trim());
    }
  });
};

await decompressDir();