import { ExecutionConfig, ExecutionDecider } from '@/cli/generate/types';
import { promptUserForExecution } from '@/cli/generate/utils/prompt';

export class ExecutionDecisionMaker implements ExecutionDecider {
  async shouldExecuteCurl(config: ExecutionConfig): Promise<boolean> {
    if (config.execute === true) {
      return true;
    } else if (config.execute === false) {
      return false;
    } 
      return await promptUserForExecution();
    
  }
}
