import fs from 'fs/promises';
import { CurlSource, CurlProcessor } from '../types';

export class CurlCommandProcessor implements CurlProcessor {
  async getCurlCommand(source: CurlSource): Promise<string> {
    if (source.curl) {
      return source.curl;
    } else if (source.file) {
      return await fs.readFile(source.file, 'utf8');
    } else {
      throw new Error('Either --curl or --file option must be provided');
    }
  }
}