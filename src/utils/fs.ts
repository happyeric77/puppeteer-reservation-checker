import path from 'path';
import fs from 'fs';

export const ensureFileExists = (logFilePath: string) => {
  const dir = path.dirname(logFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '');
  }
};

export const removeFs = (remainingFolders: number = 5, dir: string) => {
  // Only keep the most recent 5 folders
  // const screenshotDir = path.join(__dirname, '..', 'assets', 'screenshots');
  const folders = fs
    .readdirSync(dir)
    .filter((file) => fs.statSync(path.join(dir, file)).isDirectory())
    .sort((a, b) => {
      const aTime = fs.statSync(path.join(dir, a)).mtime;
      const bTime = fs.statSync(path.join(dir, b)).mtime;
      return bTime.getTime() - aTime.getTime();
    })
    .slice(remainingFolders);
  folders.forEach((folder) => {
    const folderPath = path.join(dir, folder);
    fs.rmSync(folderPath, { recursive: true, force: true });
    console.info(`Removed old folder: ${folderPath}`);
  });
};
