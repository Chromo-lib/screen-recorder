import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export function replaceWord({ from, to }) {
  return {
    name: 'dist',
    writeBundle: {
      sequential: true,
      order: 'post',
      async handler({ file }) {
        const fileContent = await readFile(resolve(process.cwd(), file), 'utf8');
        writeFile(file, fileContent.replace(new RegExp(`${from}\\.`, 'g'), to + '.'));
      }
    }
  };
}