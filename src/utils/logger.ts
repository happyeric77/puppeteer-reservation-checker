import fs from 'fs';
import { ensureFileExists } from './fs';

export const printLog = (
  msg: string,
  type: 'error' | 'info',
  filePath: string,
): void => {
  const message = `[${new Date().toLocaleString()}] ${msg}`;
  ensureFileExists(filePath);
  fs.appendFileSync(filePath, message + '\n', 'utf8');
  switch (type) {
    case 'error':
      console.error(message);
      break;
    case 'info':
      console.info(message);
      break;
    default:
      console.log(message);
      break;
  }
};
