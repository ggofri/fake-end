import { TypeScriptField } from '@/cli/generate/utils/typescript-generator';

export function generateFieldDeclaration(field: TypeScriptField): string {
  const optional = field.isOptional ? '?' : '';
  const mockComment = field.mockValue ? `  /** @mock ${field.mockValue} */\n` : '';
  return `${mockComment}  ${field.name}${optional}: ${field.type};`;
}
