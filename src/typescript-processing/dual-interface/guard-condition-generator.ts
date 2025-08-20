import { CurlInfo } from '@/mock-generation/types';
import { GuardCondition } from '@/shared/types';

export interface GuardConditionSuggestion {
  condition: GuardCondition;
  description: string;
  confidence: 'high' | 'medium' | 'low';
}

export class GuardConditionGenerator {
  generateConditions(curlInfo: CurlInfo): GuardConditionSuggestion[] {
    const suggestions: GuardConditionSuggestion[] = [];
    
    if (curlInfo.data) {
      const bodyAnalysis = this.analyzeRequestBody(curlInfo.data);
      suggestions.push(...bodyAnalysis);
    }
    
    const pathAnalysis = this.analyzeUrlPath(curlInfo.path);
    suggestions.push(...pathAnalysis);
    
    const queryAnalysis = this.analyzeQueryParams(curlInfo.queryParams);
    suggestions.push(...queryAnalysis);
    
    if (suggestions.length === 0) {
      suggestions.push(...this.getDefaultConditions(curlInfo));
    }

    return suggestions.sort((a, b) => this.getConfidenceScore(b.confidence) - this.getConfidenceScore(a.confidence));
  }

  getBestCondition(curlInfo: CurlInfo): GuardCondition {
    const suggestions = this.generateConditions(curlInfo);
    return suggestions[0]?.condition ?? {
      field: 'body',
      operator: 'exists'
    };
  }

  private analyzeRequestBody(data: string): GuardConditionSuggestion[] {
    const suggestions: GuardConditionSuggestion[] = [];

    try {
      const parsed: unknown = JSON.parse(data);
      if (typeof parsed === 'object' && parsed !== null) {
        Object.entries(parsed).forEach(([key, value]) => {
          if (value === '' || value === null || value === undefined) {
            suggestions.push({
              condition: { field: key, operator: 'exists' },
              description: `Check if '${key}' field is provided`,
              confidence: 'high'
            });
          }

          if (typeof value === 'string' && value.length === 0) {
            suggestions.push({
              condition: { field: key, operator: 'not_equals', value: '' },
              description: `Check if '${key}' is not empty`,
              confidence: 'high'
            });
          }

          if (key.toLowerCase().includes('email')) {
            suggestions.push({
              condition: { field: key, operator: 'contains', value: '@' },
              description: `Validate '${key}' contains @ symbol`,
              confidence: 'medium'
            });
          }

          if (key.toLowerCase().includes('name') && typeof value === 'string') {
            suggestions.push({
              condition: { field: key, operator: 'not_equals', value: '' },
              description: `Check if '${key}' is provided`,
              confidence: 'medium'
            });
          }
        });
      }
    } catch {
      
      suggestions.push({
        condition: { field: 'body', operator: 'exists' },
        description: 'Check if request body is provided',
        confidence: 'low'
      });
    }

    return suggestions;
  }

  private analyzeUrlPath(path: string): GuardConditionSuggestion[] {
    const suggestions: GuardConditionSuggestion[] = [];
    
    const pathParams = path.match(/:(\w+)/g);
    if (pathParams) {
      pathParams.forEach(param => {
        const paramName = param.substring(1);
        suggestions.push({
          condition: { field: paramName, operator: 'exists' },
          description: `Validate path parameter '${paramName}' exists`,
          confidence: 'medium'
        });
      });
    }
    
    if (path.includes('/admin/')) {
      suggestions.push({
        condition: { field: 'user.role', operator: 'equals', value: 'admin' },
        description: 'Check if user has admin role',
        confidence: 'high'
      });
    }

    if (path.includes('/users/') && path.includes('/:id')) {
      suggestions.push({
        condition: { field: 'userId', operator: 'exists' },
        description: 'Check if user ID is provided',
        confidence: 'medium'
      });
    }

    return suggestions;
  }

  private analyzeQueryParams(queryParams: Record<string, string>): GuardConditionSuggestion[] {
    const suggestions: GuardConditionSuggestion[] = [];

    Object.entries(queryParams).forEach(([key, _value]) => {
      if (key === 'page' || key === 'limit') {
        suggestions.push({
          condition: { field: `query.${key}`, operator: 'exists' },
          description: `Validate pagination parameter '${key}'`,
          confidence: 'low'
        });
      }

      if (key === 'filter' || key === 'search') {
        suggestions.push({
          condition: { field: `query.${key}`, operator: 'not_equals', value: '' },
          description: `Check if '${key}' parameter is not empty`,
          confidence: 'medium'
        });
      }
    });

    return suggestions;
  }

  private getDefaultConditions(curlInfo: CurlInfo): GuardConditionSuggestion[] {
    const suggestions: GuardConditionSuggestion[] = [];
    
    if (curlInfo.method === 'POST' || curlInfo.method === 'PUT') {
      suggestions.push({
        condition: { field: 'body', operator: 'exists' },
        description: 'Check if request body exists',
        confidence: 'low'
      });
    }
    
    suggestions.push({
      condition: { field: 'query.valid', operator: 'equals', value: "true" },
      description: 'Generic validation flag',
      confidence: 'low'
    });

    return suggestions;
  }

  private getConfidenceScore(confidence: 'high' | 'medium' | 'low'): number {
    const confidenceMap = {
      high: 3,
      medium: 2,
      low: 1
    } as const;

    return confidenceMap[confidence];
  }
}

export const guardConditionGenerator = new GuardConditionGenerator();
