import { ExecutionConfig, ExecutionDecider } from '../types';
import { promptUserForExecution } from '../utils/prompt';

export class ExecutionDecisionMaker implements ExecutionDecider {
  async shouldExecuteCurl(config: ExecutionConfig): Promise<boolean> {
    if (config.execute === true) {
      return true;
    } else if (config.execute === false) {
      return false;
    } else {
      return await promptUserForExecution();
    }
  }
}