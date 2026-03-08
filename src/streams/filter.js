import { Transform } from 'node:stream';

const filter = () => {
  const argv = process.argv;
  const patternIndex = argv.indexOf('--pattern');
  const pattern = patternIndex !== -1 ? argv[patternIndex + 1] : '';

  if (!pattern) {
    console.error('Please provide --pattern <string>');
    process.exit(1);
  }

  let leftover = '';

  const transform = new Transform({
    transform(chunk, encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split(/\r?\n/);
      leftover = lines.pop();

      for (const line of lines) {
        if (line.includes(pattern)) {
          this.push(line + '\n');
        }
      }
      callback();
    },
    flush(callback) {
      if (leftover && leftover.includes(pattern)) {
        this.push(leftover + '\n');
      }
      callback();
    }
  });

  process.stdin.pipe(transform).pipe(process.stdout);
};

filter();