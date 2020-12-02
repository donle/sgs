import * as fs from 'fs';
import * as path from 'path';
import { coreVersion } from './core/game/version';

function preRelease() {
  const args = process.argv[2] || '--micro';

  let fileContent = fs.readFileSync(path.resolve(__dirname, './core/game/version.ts'), 'utf-8');
  let [majorVersion, betaVersion, minorVersion, microVersion] = coreVersion.split('.').map(versionStr => parseInt(versionStr, 10));
  switch (args) {
    case '--major':
      majorVersion++;
      betaVersion = 0;
      minorVersion = 0;
      microVersion = 0;
      break;
    case '--beta':
      betaVersion++;
      minorVersion = 0;
      microVersion = 0;
      break;
    case '--minor':
      minorVersion++;
      microVersion = 0;
      break;
    case '--micro':
      microVersion++;
      break;
    default:
      throw new Error(`Unknown parameter: ${args}`);
  }

  const newVersion = `${majorVersion}.${betaVersion}.${minorVersion}.${microVersion}`;
  fileContent = fileContent.replace(coreVersion, newVersion);
  fs.writeFileSync(path.resolve(__dirname, './core/game/version.ts'), fileContent);
}

preRelease();
