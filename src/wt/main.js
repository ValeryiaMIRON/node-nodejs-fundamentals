import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Worker } from 'node:worker_threads';

const merge = (arrays) => {
  const result = [];
  const indexes = new Array(arrays.length).fill(0);

  while (true) {
    let min = Infinity;
    let minIndex = -1;

    for (let i = 0; i < arrays.length; i++) {
      if (indexes[i] < arrays[i].length && arrays[i][indexes[i]] < min) {
        min = arrays[i][indexes[i]];
        minIndex = i;
      }
    }

    if (minIndex === -1) break;

    result.push(min);
    indexes[minIndex]++;
  }

  return result;
};

const main = async () => {
  const dataPath = path.join(process.cwd(), 'src', 'wt', 'data.json');
  const numbers = JSON.parse(fs.readFileSync(dataPath));

  const cpuCount = os.cpus().length;
  const chunkSize = Math.ceil(numbers.length / cpuCount);

  const chunks = [];
  for (let i = 0; i < cpuCount; i++) {
    chunks.push(numbers.slice(i * chunkSize, (i + 1) * chunkSize));
  }

  const workerPath = path.join(process.cwd(), 'src', 'wt', 'worker.js');

  const results = await Promise.all(
    chunks.map((chunk, index) => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(workerPath);

        worker.postMessage(chunk);

        worker.on('message', (sorted) => resolve({ index, sorted }));
        worker.on('error', reject);
      });
    })
  );

  const sortedChunks = results
    .sort((a, b) => a.index - b.index)
    .map((r) => r.sorted);

  const final = merge(sortedChunks);

  console.log(final);
};

await main();
