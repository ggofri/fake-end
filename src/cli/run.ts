import { createServer } from '@/server';
import { loadMockEndpoints } from '@/server/loader';
import { ServerOptions } from '@/types';
import { setVerbose, startServerWithPortFallback } from '@/utils';
import { METHOD_PADDING_LENGTH, PORT_RETRY_MAX, RELOAD_DEBOUNCE_MS, SERVER_CLOSE_DELAY_MS } from '@/constants';
import chalk from 'chalk';
import { existsSync, watch } from 'fs';
import { Server } from 'http';
import { interfaceResolver } from '@/server/typescript/utils/interface-resolver';

let currentServer: Server | null = null;

async function loadAndStartServer(options: ServerOptions): Promise<{ server: Server; port: number }> {
  const { port, mockDir, noCache, dynamicMocks } = options;

  console.log(chalk.blue(`🔍 Loading mock endpoints from ${mockDir}...`));
  
  interfaceResolver.clearCache();
  
  const endpoints = await loadMockEndpoints(mockDir, { 
    ...(noCache && { noCache }), 
    ...(dynamicMocks && { dynamicMocks }) 
  });

  if (endpoints.length === 0) {
    console.log(chalk.yellow(`⚠️  No mock endpoints found in ${mockDir}`));
    console.log(chalk.gray('Create YAML files or TypeScript interface files with your mock API definitions to get started.'));
  } else {
    console.log(chalk.green(`✅ Loaded ${endpoints.length} mock endpoint${endpoints.length > 1 ? 's' : ''}`));
  }

  const app = createServer(endpoints, mockDir);

  const serverResult = await startServerWithPortFallback(app, port, PORT_RETRY_MAX, {
    warn: (msg) => console.log(chalk.yellow(msg)),
    info: (msg) => console.log(chalk.blue(msg))
  });

  console.log(chalk.green(`🚀 Mock server running on http://localhost:${serverResult.port}`));

  if (endpoints.length > 0) {
    console.log(chalk.blue('\n📋 Available endpoints:'));
    endpoints.forEach(endpoint => {
      const methodColor = getMethodColor(endpoint.method);
      console.log(`  ${methodColor(endpoint.method.padEnd(METHOD_PADDING_LENGTH))} ${chalk.gray(endpoint.fullPath)}`);
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
    console.error(chalk.red(`Mock directory "${mockDir}" does not exist.`));
    console.log(chalk.yellow(`Please create the directory and add YAML files or TypeScript interface files with your mock endpoints.`));
    process.exit(1);
  }

  try {
    
    const { server, port: actualPort } = await loadAndStartServer(options);
    currentServer = server;

    if (watchMode) {
      console.log(chalk.blue('🔥 Hot reload enabled - watching for changes...'));
      setupWatchers(options, actualPort);
      console.log(chalk.gray('Press Ctrl+C to stop the server'));
    } else {
      console.log(chalk.gray('Press Ctrl+C to stop the server'));
    }

  } catch (error) {
    console.error(chalk.red('Failed to start server:'), error);
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
      console.log(chalk.yellow(`🔄 Mock file changed: ${filename}`));
      debounceReload();
    }
  });
  
  const srcWatcher = watch('src', { recursive: true }, (_eventType, filename) => {
    if (filename?.endsWith('.ts')) {
      console.log(chalk.yellow(`🔄 Source code changed: ${filename}`));
      debounceReload();
    }
  });
  
  process.on('SIGINT', () => {
    console.log(chalk.blue('\n🛑 Shutting down server and watchers...'));
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
    console.log(chalk.yellow('🔄 Reloading server...'));
    
    if (currentServer) {
      await new Promise<void>((resolve) => {
        currentServer?.close(() => {
          setTimeout(resolve, SERVER_CLOSE_DELAY_MS);
        });
      });
    }
    
    const { server } = await loadAndStartServer({ ...options, port: targetPort });
    currentServer = server;
    
    console.log(chalk.green('✅ Server reloaded successfully'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to reload server:'), error);
    console.log(chalk.gray('Server will continue running with previous configuration'));
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
