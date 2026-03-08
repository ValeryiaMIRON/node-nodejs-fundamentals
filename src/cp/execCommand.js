import { spawn } from 'node:child_process';

const execCommand = () => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('No command provided');
    process.exit(1);
  }

  const [command, ...commandArgs] = args.join(' ').split(' ');

  const child = spawn(command, commandArgs, {
    stdio: ['inherit', 'pipe', 'pipe'], 
    env: process.env                     
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on('close', (code) => {
    process.exit(code);
  });
};

execCommand();
