import { exec } from 'child_process';
import { promisify } from 'util';
import { COMMAND_PREVIEW_LENGTH, BUFFER_SIZE_MB, ERROR_PREVIEW_LENGTH } from '@/shared/constants';
import { log, warn } from '@/shared/utils/logger';

const execAsync = promisify(exec);

export async function executeCurlCommand(curlCommand: string): Promise<string | null> {
  try {
    const cleanedCommand = curlCommand
      .replace(/\\\s*\n\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const executableCommand = cleanedCommand.startsWith('http') 
      ? `curl -s "${cleanedCommand}"` 
      : cleanedCommand;

    log(`   Running: ${executableCommand.substring(0, COMMAND_PREVIEW_LENGTH)}${executableCommand.length > COMMAND_PREVIEW_LENGTH ? '...' : ''}`);
    
    const { stdout, stderr } = await execAsync(executableCommand, {
      timeout: 30000,
      maxBuffer: BUFFER_SIZE_MB * BUFFER_SIZE_MB,
    });

    if (stderr && !stdout) {
      warn(`⚠️  cURL stderr: ${stderr.substring(0, ERROR_PREVIEW_LENGTH)}`);
      return null;
    }

    if (!stdout.trim()) {
      warn('⚠️  cURL returned empty response');
      return null;
    }

    return stdout.trim();
    
  } catch (error) {
    warn(`⚠️  cURL execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}
