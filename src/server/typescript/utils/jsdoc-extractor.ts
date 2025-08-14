import { PropertySignature } from 'ts-morph';

export function extractMockTagValue(prop: PropertySignature): string | null {
  const mockTag = prop.getJsDocs()
    .flatMap(doc => doc.getTags())
    .find(tag => tag.getTagName() === 'mock');
  
  const mockValue = mockTag?.getComment();
  
  if (!mockValue) return null;
  
  return typeof mockValue === 'string' ? mockValue : null;
}
