import cluster from 'cluster';
import dnscache from 'dnscache';
import dotenv from 'dotenv';
import {globalAgent as httpsGlobalAgent} from 'https';
import os from 'os';
import {appSetup} from './app';
import logger from './util/logger';

dotenv.config();

const cpus = os.cpus();
const port: number = process.env.APP_PORT
  ? parseInt(process.env.APP_PORT)
  : 3000;
const numCPUs: number = process.env.CPU_LIMIT
  ? parseInt(process.env.CPU_LIMIT)
  : 1;

httpsGlobalAgent.options.keepAlive = true;

dnscache({
  enable: true,
  ttl: 300,
  cachesize: 1000
});

const main = async (): Promise<void> => {
  const app = await appSetup();
  const onWorkerError = (code: number, signal: string | number) => {
    logger.error(`worker error: ${code}, signal: ${signal}`);
  };
  if (cluster.isPrimary && numCPUs > 1) {
    cpus.forEach(() => {
      const worker = cluster.fork();
      worker.on('error', onWorkerError);
    });

    cluster.on('exit', () => {
      const newWorker = cluster.fork();
      newWorker.on('error', onWorkerError);
      logger.info('A new worker rises', newWorker.process.pid);
    });
    cluster.on('exit', (err) => {
      logger.error(err);
    });
  } else {
    app.listen(
      {port, host: '0.0.0.0'},
      (err: Error | null, address: string) => {
        if (err !== null) {
          throw err;
        }
        console.info(`*************** Server Listening On: ${address}`);
      }
    );
  }
};

void main();
