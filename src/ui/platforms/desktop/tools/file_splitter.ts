import * as fs from 'fs';

type PartInfo = { number: number; start: number; end: number };

export abstract class FileSplitter {
  static readonly splitFile = (file: string, parts: number) => {
    if (parts < 1) {
      return Promise.reject(new Error("Parameter 'parts' is invalid, must contain an integer value."));
    }

    const stat = fs.statSync(file);
    if (!stat.isFile) {
      return Promise.reject(new Error('Given file is not valid'));
    }
    if (!stat.size) {
      return Promise.reject(new Error('File is empty'));
    }

    const totalSize = stat.size;
    const splitSize = Math.floor(totalSize / parts);

    if (splitSize < 1) {
      return Promise.reject(new Error('Too many parts, or file too small!'));
    }

    const lastSplitSize = splitSize + (totalSize % parts);
    const partInfo: PartInfo[] = [];

    for (let i = 0; i < parts; i++) {
      partInfo[i] = {
        number: i + 1,
        start: i * splitSize,
        end: i * splitSize + splitSize,
      };

      if (i === parts - 1) {
        partInfo[i].end = i * splitSize + lastSplitSize;
      }
    }

    return FileSplitter.__splitFile(file, partInfo);
  };

  private static merge(file: string, writer: fs.WriteStream) {
    return new Promise(function (resolve, reject) {
      const reader = fs.createReadStream(file, { encoding: undefined });
      reader.pipe(writer, { end: false });
      reader.on('error', e => {
        reject(e.message);
      });
      reader.on('end', resolve);
    });
  }

  static async mergeFiles(inputFiles: string[], outputFile: string) {
    if (inputFiles.length <= 0) {
      return Promise.reject(new Error('Make sure you input an array with files as first parameter!'));
    }

    const writer = fs.createWriteStream(outputFile, {
      encoding: undefined,
    });

    for (const file of inputFiles) {
      await FileSplitter.merge(file, writer);
    }
    writer.close();
    return outputFile;
  }

  private static split(file: string, info: PartInfo, partInfo: PartInfo[]) {
    return new Promise<string>(function (resolve, reject) {
      const reader = fs.createReadStream(file, {
        encoding: undefined,
        start: info.start,
        end: info.end - 1,
      });

      const maxPaddingCount = String(partInfo.length).length;
      let currentPad = '';
      for (let i = 0; i < maxPaddingCount; i++) {
        currentPad += '0';
      }
      const unpaddedPartNumber = `${info.number}`;
      const partNumber = currentPad.substring(0, currentPad.length - unpaddedPartNumber.length) + unpaddedPartNumber;
      const partName = `${file}.part${partNumber}`;

      const writer = fs.createWriteStream(partName);
      const pipe = reader.pipe(writer);

      pipe.on('error', reject);
      pipe.on('finish', () => resolve(partName));
    });
  }

  private static async __splitFile(file: string, partInfo: PartInfo[]) {
    const partFiles: string[] = [];

    for (const info of partInfo) {
      const partName = await this.split(file, info, partInfo);
      partFiles.push(partName);
    }

    return partFiles;
  }
}
