import chalk from 'chalk';
import { CurlInfo } from '../types';
import { generateBasicMockResponse } from './mock-generator';

export async function generateResponseWithOllama(curlInfo: CurlInfo, host: string, model: string): Promise<Record<string, unknown>> {
  try {
    const prompt = createOllamaPrompt(curlInfo);
    
    const response = await fetch(`${host}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Try to extract JSON from the response
    const jsonMatch = result.response.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1] || jsonMatch[2]);
      } catch {
        console.log(chalk.yellow('⚠️  Could not parse Ollama JSON response, using fallback'));
        return generateBasicMockResponse(curlInfo);
      }
    }

    return generateBasicMockResponse(curlInfo);
    
  } catch (error) {
    console.log(chalk.yellow(`⚠️  Ollama request failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    console.log(chalk.yellow('   Falling back to basic mock response'));
    return generateBasicMockResponse(curlInfo);
  }
}

function createOllamaPrompt(curlInfo: CurlInfo): string {
  const { method, path, data, headers } = curlInfo;
  
  return `You are helping to create a realistic mock API response. 

Analyze this HTTP request and generate a realistic JSON response:

Method: ${method}
Path: ${path}
Headers: ${JSON.stringify(headers, null, 2)}
${data ? `Request Body: ${data}` : ''}

Please generate a realistic JSON response that:
1. Matches the expected response structure for this type of API endpoint
2. Uses realistic data types and values
3. Includes common fields like id, timestamps, etc. when appropriate
4. Reflects the request data when relevant (for POST/PUT requests)

Return only the JSON response without any explanation or markdown formatting.`;
}