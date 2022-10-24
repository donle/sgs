import { Buffer } from 'buffer';
import { promisify } from 'util';
import { gzip, gunzip } from 'zlib';

const gz = promisify(gzip);
const ugz = promisify(gunzip);

export const compress = async (s: string = '') => {
  const compressed: Buffer = await gz(s);
  return Buffer.from(compressed).toString('base64');
};

export const decompress = async (s: string = '') => {
  const decompressed: Buffer = await ugz(Buffer.from(Buffer.from(s, 'base64')));
  return decompressed.toString();
};
