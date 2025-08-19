import { promptUserForReplacement } from '@/mock-generation/utils/prompt';
import { fileExists } from './file-system-utils';

export type ContentMode = 'standard' | 'error' | 'success';

export interface ModeContext {
  errorMode: boolean;
  successMode: boolean;
  filePath: string;
}

export const resolveContentMode = async (context: ModeContext): Promise<ContentMode> => {
  const { errorMode, successMode, filePath } = context;
  const hasExplicitMode = errorMode || successMode;
  
  if (hasExplicitMode) {
    return errorMode ? 'error' : 'success';
  }
  
  const fileExistsResult = await fileExists(filePath);
  if (!fileExistsResult) {
    return 'standard';
  }
  
  const replacementMode = await promptUserForReplacement(filePath);
  return replacementMode === 'error' ? 'error' : 
         replacementMode === 'success' ? 'success' : 
         'standard';
};
