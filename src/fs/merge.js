import fs from 'fs/promises';
import path from 'path';

const merge = async () => {
  try {
    const partsDir = path.resolve('workspace/parts');
    const outputFile = path.resolve('workspace/merged.txt');

    await fs.access(partsDir);

    const filesArgIndex = process.argv.indexOf('--files');
    let filesToMerge = [];

    if (filesArgIndex !== -1) {
      filesToMerge = process.argv[filesArgIndex + 1].split(',');
      for (const file of filesToMerge) {
        await fs.access(path.join(partsDir, file));
      }
    } else {
      const allFiles = await fs.readdir(partsDir);
      filesToMerge = allFiles.filter(f => path.extname(f) === '.txt').sort();
      if (filesToMerge.length === 0) throw new Error();
    }

    let mergedContent = '';
    for (const file of filesToMerge) {
      const content = await fs.readFile(path.join(partsDir, file), 'utf-8');
      mergedContent += content;
    }

    await fs.writeFile(outputFile, mergedContent, 'utf-8');
    console.log(`Merged ${filesToMerge.length} file(s) into merged.txt`);

  } catch (err) {
    throw new Error('FS operation failed');
  }
};

await merge();