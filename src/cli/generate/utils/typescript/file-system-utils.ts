import fs from 'fs/promises';

export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

export const ensureDirectory = async (dirPath: string): Promise<void> => {
  await fs.mkdir(dirPath, { recursive: true });
};

export const writeFileContent = async (filePath: string, content: string): Promise<void> => {
  await fs.writeFile(filePath, content, 'utf8');
};
