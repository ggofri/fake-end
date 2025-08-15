import { createServer } from 'http';
import { Application } from 'express';
import { PORT_FALLBACK_MAX_ATTEMPTS } from '@/constants';

export interface PortResult {
  port: number;
  attempted: number[];
  fallbackUsed: boolean;
}

/**
 * Checks if a port is available
 */
export async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    
    server.on('error', () => {
      resolve(false);
    });
    
    server.on('listening', () => {
      server.close(() => {
        resolve(true);
      });
    });
    
    server.listen(port);
  });
}

/**
 * Finds an available port starting from the desired port and incrementing
 * @param desiredPort - The preferred port to start with
 * @param maxAttempts - Maximum number of ports to try (default: 10)
 * @returns Promise<PortResult> - Information about the port selection
 */
export async function findAvailablePort(
  desiredPort: number, 
  maxAttempts: number = PORT_FALLBACK_MAX_ATTEMPTS
): Promise<PortResult> {
  const attempted: number[] = [];
  
  for (let i = 0; i < maxAttempts; i++) {
    const port = desiredPort + i;
    attempted.push(port);
    
    if (await isPortAvailable(port)) {
      return {
        port,
        attempted,
        fallbackUsed: i > 0
      };
    }
  }
  
  throw new Error(
    `Could not find an available port after trying ${maxAttempts} ports starting from ${desiredPort}. ` +
    `Attempted ports: ${attempted.join(', ')}`
  );
}

/**
 * Starts a server on the first available port starting from the desired port
 * @param app - Express app or HTTP server
 * @param desiredPort - The preferred port
 * @param maxAttempts - Maximum number of ports to try
 * @param logger - Optional logger function for fallback messages
 * @returns Promise<PortResult> - Information about the port used
 */
export async function startServerWithPortFallback(
  app: Application,
  desiredPort: number,
  maxAttempts: number = PORT_FALLBACK_MAX_ATTEMPTS,
  logger?: {
    warn: (message: string) => void;
    info: (message: string) => void;
  }
): Promise<PortResult> {
  const portResult = await findAvailablePort(desiredPort, maxAttempts);
  
  return new Promise((resolve, reject) => {
    const server = app.listen(portResult.port, () => {
      if (portResult.fallbackUsed && logger) {
        logger.warn(`⚠️  Port ${desiredPort} was not available`);
        logger.info(`🔀 Using fallback port ${portResult.port}`);
      }
      resolve(portResult);
    });
    
    server.on('error', (error: Error) => {
      if ('code' in error && error.code === 'EADDRINUSE') {
        reject(new Error(`Port ${portResult.port} is still in use despite being detected as available`));
      } else {
        reject(new Error(`Failed to start server: ${error.message}`));
      }
    });
  });
}
