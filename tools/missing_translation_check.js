/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { SimplifiedChinese } = require('./languages/zh_CN/index');

function doTranslationPickup(line, regexr) {
  const results = regexr.exec(line);
  if (!results || results.length < 2) {
    return;
  }

  return results[1];
}

async function processLineByLine(filePath) {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const rawTranslations = [];
  const translationRegexp = new RegExp("[^']*'([^']*)'.*");
  for await (let line of rl) {
    if (line.startsWith('import ') || line.startsWith('export ')) {
      continue;
    }

    do {
      const result = doTranslationPickup(line, translationRegexp);
      if (result) {
        if (!/\$\{.+\}/.exec(result) && result.includes('{0}')) {
          rawTranslations.push(result);
        }
        line = line.replace(`'${result}'`, '');
      } else {
        break;
      }
    } while (true);
  }

  return rawTranslations;
}

async function readDir(directory, rawTranslations = []) {
  for (const dir of fs.readdirSync(directory)) {
    if (dir.includes('languages')) {
      continue;
    }

    if (fs.lstatSync(path.join(directory, dir)).isDirectory()) {
      await readDir(path.join(directory, dir), rawTranslations);
    } else if ((dir.endsWith('ts') && !dir.endsWith('d.ts')) || (dir.endsWith('tsx') && !dir.endsWith('test.tsx'))) {
      const raw = await processLineByLine(path.join(directory, dir));
      rawTranslations.push(...raw);
    }
  }

  return rawTranslations;
}

async function readDictionary(baseDir = path.join(__dirname, './languages/zh_CN'), dictionary = {}) {
  for (const dir of fs.readdirSync(baseDir)) {
    if (fs.lstatSync(path.join(baseDir, dir)).isDirectory()) {
      await readDictionary(path.join(baseDir, dir), dictionary);
    } else if (dir.endsWith('js') && dir !== 'index.js') {
      const subDictionaries = await import(path.join(baseDir, dir));
      for (const key in subDictionaries) {
        dictionary = { ...dictionary, ...subDictionaries[key] };
      }
    }
  }

  return dictionary;
}

async function main() {
  const dictionary = SimplifiedChinese;
  const raw = await readDir(path.join(__dirname, '../src/core'));
  await readDir(path.join(__dirname, '../src/ui/platforms/desktop/src'), raw);

  for (const missingTranslation of raw.filter(text => !dictionary[text])) {
    console.log('Missing translation of: ', missingTranslation);
  }
}

main();
