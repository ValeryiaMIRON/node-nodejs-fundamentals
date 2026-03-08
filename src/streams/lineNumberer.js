import { Transform } from 'node:stream';

const lineNumberer = () => {
  let lineNum = 1;
  let leftover = '';

  const transform = new Transform({
    transform(chunk, encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split(/\r?\n/);
      leftover = lines.pop(); 

      for (const line of lines) {
        this.push(`${lineNum} | ${line}\n`);
        lineNum++;
      }
      callback();
    },
    flush(callback) {
      if (leftover) {
        this.push(`${lineNum} | ${leftover}\n`);
      }
      callback();
    }
  });

  process.stdin.pipe(transform).pipe(process.stdout);
};

lineNumberer();
