import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const split = async () => {
  const argv = process.argv;
  const linesArgIndex = argv.indexOf('--lines');
  const maxLines = linesArgIndex !== -1 ? parseInt(argv[linesArgIndex + 1], 10) : 10;

  const sourceFile = path.join(process.cwd(), 'source.txt');
  if (!fs.existsSync(sourceFile)) {
    throw new Error('FS operation failed');
  }

  const readStream = fs.createReadStream(sourceFile, { encoding: 'utf-8' });

  let leftover = '';
  let buffer = [];
  let chunkIndex = 1;

  const writeChunk = () => {
    if (buffer.length > 0) {
      const chunkFile = path.join(process.cwd(), `chunk_${chunkIndex}.txt`);
      fs.writeFileSync(chunkFile, buffer.join('\n') + '\n');
      chunkIndex++;
      buffer = [];
    }
  };

  readStream.on('data', (chunk) => {
    const data = leftover + chunk;
    const lines = data.split(/\r?\n/);
    leftover = lines.pop();

    for (const line of lines) {
      buffer.push(line);
      if (buffer.length >= maxLines) {
        writeChunk();
      }
    }
  });

  readStream.on('end', () => {
    if (leftover) {
      buffer.push(leftover);
    }
    writeChunk();
  });

  readStream.on('error', (err) => {
    throw err;
  });
};

await split();
