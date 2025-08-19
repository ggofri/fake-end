import { GuardCondition } from "@/types";
import { HTTP_STATUS } from "@/constants";

export class GuardCommentGenerator {
  generateGuardComment(
    condition: GuardCondition,
    isSuccessMode: boolean = false
  ): string {
    const guardObj = {
      condition,
      left: {
        status: isSuccessMode
          ? this.inferSuccessStatus()
          : this.inferErrorStatus(condition),
        interface: isSuccessMode ? "SuccessResponse" : "ErrorResponse",
      },
      right: {
        status: isSuccessMode
          ? this.inferErrorStatus(condition)
          : this.inferSuccessStatus(),
        interface: isSuccessMode ? "ErrorResponse" : "SuccessResponse",
      },
    };

    return `/**
 * @guard ${JSON.stringify(guardObj, null, 1).replace(/\n/g, "\n * ")}
 */`;
  }

  private inferErrorStatus(condition: GuardCondition): number {
    const patterns: [RegExp, number][] = [
      [/\brole\b/, HTTP_STATUS.FORBIDDEN],
      [/\badmin\b/, HTTP_STATUS.FORBIDDEN],
      [/\brole\b/, HTTP_STATUS.FORBIDDEN],
      [/\bauth\b/, HTTP_STATUS.UNAUTHORIZED],
      [/\btoken\b/, HTTP_STATUS.UNAUTHORIZED],
      [/\bid\b/, HTTP_STATUS.NOT_FOUND],
      [/\bexists\b/, HTTP_STATUS.NOT_FOUND],
    ] as const;

    const field = condition.field ?? "";
    const match = patterns.find(([regex]) => regex.test(field));
    
    return match?.[1] ?? HTTP_STATUS.BAD_REQUEST;
  }

  private inferSuccessStatus(): number {
    return HTTP_STATUS.OK;
  }
}

export const guardCommentGenerator = new GuardCommentGenerator();
