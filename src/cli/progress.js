import process from 'node:process';

const progress = () => {
  const argv = process.argv;
  const getArg = (name, def) => {
    const index = argv.indexOf(name);
    return index !== -1 ? argv[index + 1] : def;
  };

  const duration = parseInt(getArg('--duration', 5000));
  const interval = parseInt(getArg('--interval', 100));
  const length = parseInt(getArg('--length', 30));
  const color = getArg('--color', '');

  const isValidColor = /^#([0-9A-Fa-f]{6})$/.test(color);
  const colorCode = isValidColor ? `\x1b[38;2;${parseInt(color.slice(1,3),16)};${parseInt(color.slice(3,5),16)};${parseInt(color.slice(5,7),16)}m` : '';
  const resetCode = '\x1b[0m';

  let elapsed = 0;
  const timer = setInterval(() => {
    elapsed += interval;
    const percent = Math.min(elapsed / duration, 1);
    const filledLength = Math.round(length * percent);
    const emptyLength = length - filledLength;

    const bar = `[${colorCode}${'█'.repeat(filledLength)}${resetCode}${' '.repeat(emptyLength)}] ${Math.round(percent*100)}%`;

    process.stdout.write(`\r${bar}`);

    if (percent >= 1) {
      clearInterval(timer);
      process.stdout.write('\nDone!\n');
    }
  }, interval);
};

progress();
