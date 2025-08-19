import { createServer } from '@/server-runtime/startup';
import { loadMockEndpoints } from '@/file-management/loader/loader';
import { ServerOptions } from '@/shared/types';
import { setVerbose, startServerWithPortFallback } from '@/shared/utils';
import { METHOD_PADDING_LENGTH, PORT_RETRY_MAX, RELOAD_DEBOUNCE_MS, SERVER_CLOSE_DELAY_MS } from '@/shared/constants';
import chalk from 'chalk';
import { existsSync, watch } from 'fs';
import { Server } from 'http';
import { interfaceResolver } from '@/typescript-processing/utils/interface-resolver';
import { log, warn, error } from '@/shared/utils/logger';

let currentServer: Server | null = null;

async function loadAndStartServer(options: ServerOptions): Promise<{ server: Server; port: number }> {
  const { port, mockDir, noCache, dynamicMocks } = options;

  log(`🔍 Loading mock endpoints from ${mockDir}...`);
  
  interfaceResolver.clearCache();
  
  const endpoints = await loadMockEndpoints(mockDir, { 
    ...(noCache && { noCache }), 
    ...(dynamicMocks && { dynamicMocks }) 
  });

  if (endpoints.length === 0) {
    warn(`⚠️  No mock endpoints found in ${mockDir}`);
    log('Create YAML files or TypeScript interface files with your mock API definitions to get started.');
  } else {
    log(`✅ Loaded ${endpoints.length} mock endpoint${endpoints.length > 1 ? 's' : ''}`);
  }

  const app = createServer(endpoints, mockDir);

  const serverResult = await startServerWithPortFallback(app, port, PORT_RETRY_MAX, {
    warn: (msg) => warn(msg),
    info: (msg) => log(msg)
  });

  log(`🚀 Mock server running on http://localhost:${serverResult.port}`);

  if (endpoints.length > 0) {
    log('\n📋 Available endpoints:');
    endpoints.forEach(endpoint => {
      const methodColor = getMethodColor(endpoint.method);
      log(`  ${methodColor(endpoint.method.padEnd(METHOD_PADDING_LENGTH))} ${chalk.gray(endpoint.fullPath)}`);
    });
  }

  return { server: serverResult.server, port: serverResult.port };
}

export async function startServer(options: ServerOptions): Promise<void> {
  const { mockDir, verbose, watch: watchMode } = options;
  
  if (verbose) {
    setVerbose(true);
  }

  if (!existsSync(mockDir)) {
    error(`Mock directory "${mockDir}" does not exist.`);
    warn(`Please create the directory and add YAML files or TypeScript interface files with your mock endpoints.`);
    process.exit(1);
  }

  try {
    
    const { server, port: actualPort } = await loadAndStartServer(options);
    currentServer = server;

    if (watchMode) {
      log('🔥 Hot reload enabled - watching for changes...');
      setupWatchers(options, actualPort);
      log('Press Ctrl+C to stop the server');
    } else {
      log('Press Ctrl+C to stop the server');
    }

  } catch (err) {
    error('Failed to start server:', err);
    process.exit(1);
  }
}

function setupWatchers(options: ServerOptions, actualPort: number): void {
  let reloadTimeout: NodeJS.Timeout | null = null;
  
  const debounceReload = (): void => {
    if (reloadTimeout) {
      clearTimeout(reloadTimeout);
    }
    reloadTimeout = setTimeout(() => {
      void reloadServer(options, actualPort);
    }, RELOAD_DEBOUNCE_MS); 
  };
  
  const mockWatcher = watch(options.mockDir, { recursive: true }, (_eventType, filename) => {
    if (filename && (filename.endsWith('.yaml') || filename.endsWith('.yml') || filename.endsWith('.ts'))) {
      log(`🔄 Mock file changed: ${filename}`);
      debounceReload();
    }
  });
  
  const srcWatcher = watch('src', { recursive: true }, (_eventType, filename) => {
    if (filename?.endsWith('.ts')) {
      log(`🔄 Source code changed: ${filename}`);
      debounceReload();
    }
  });
  
  process.on('SIGINT', () => {
    log('\n🛑 Shutting down server and watchers...');
    mockWatcher.close();
    srcWatcher.close();
    if (currentServer) {
      currentServer.close();
    }
    process.exit(0);
  });
}

async function reloadServer(options: ServerOptions, targetPort: number): Promise<void> {
  try {
    log('🔄 Reloading server...');
    
    if (currentServer) {
      await new Promise<void>((resolve) => {
        currentServer?.close(() => {
          setTimeout(resolve, SERVER_CLOSE_DELAY_MS);
        });
      });
    }
    
    const { server } = await loadAndStartServer({ ...options, port: targetPort });
    currentServer = server;
    
    log('✅ Server reloaded successfully');
  } catch (err) {
    error('❌ Failed to reload server:', err);
    log('Server will continue running with previous configuration');
  }
}

function getMethodColor(method: string): (text: string) => string {
  switch (method) {
    case 'GET': return chalk.blue;
    case 'POST': return chalk.green;
    case 'PUT': return chalk.yellow;
    case 'DELETE': return chalk.red;
    case 'PATCH': return chalk.magenta;
    default: return chalk.white;
  }
}
