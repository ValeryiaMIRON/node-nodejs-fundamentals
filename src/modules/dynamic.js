import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dynamic = async () => {
  try {
    const pluginName = process.argv[2]; 

    if (!pluginName) {
      console.log('Plugin not found');
      process.exit(1);
    }

    const pluginPath = path.join(__dirname, 'plugins', `${pluginName}.js`);

    const plugin = await import(pathToFileURL(pluginPath).href).catch(() => null);

    if (!plugin || typeof plugin.run !== 'function') {
      console.log('Plugin not found');
      process.exit(1);
    }

    const result = plugin.run();
    console.log(result);

  } catch (err) {
    console.log('Plugin not found');
    process.exit(1);
  }
};

import { pathToFileURL } from 'node:url';

await dynamic();
