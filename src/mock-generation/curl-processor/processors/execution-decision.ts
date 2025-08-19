import { ExecutionConfig, ExecutionDecider } from '@/mock-generation/types';
import { promptUserForExecution } from '@/mock-generation/utils/prompt';

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
