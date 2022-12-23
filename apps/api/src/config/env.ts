import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

interface Config {
  DB_HOST: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASS: string;
  DB_PORT: number;
  SERVER_PORT: number;
  NODE_ENV: string;
}

const ZodEnvConfig = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  MYSQL_DATABASE: z.string(),
  MYSQL_USER: z.string(),
  MYSQL_PASSWORD: z.string(),
  MYSQL_PORT: z.string(),
  NODE_ENV: z.string(),
});

let envConfig: Config | undefined;

function getEnvConfig() {
  if (envConfig?.DB_HOST) {
    return envConfig;
  }

  // Set up dotenv files
  if (process.env.NODE_ENV === 'test') {
    dotenv.config({
      path: path.resolve(__dirname, '../../../../.env.test'),
    });
  } else if (process.env.NODE_ENV === 'docker') {
    dotenv.config({
      path: path.resolve(__dirname, '../../../../.env.docker'),
    });
  } else {
    dotenv.config();
  }

  const parsedConfig = ZodEnvConfig.safeParse(process.env);

  if (!parsedConfig.success) {
    throw new Error(
      'Invalid ENV vars' + JSON.stringify(parsedConfig.error.format(), null, 2)
    );
  }

  envConfig = {
    DB_HOST: parsedConfig.data.DB_HOST,
    DB_NAME: parsedConfig.data.MYSQL_DATABASE,
    DB_USER: parsedConfig.data.MYSQL_USER,
    DB_PASS: parsedConfig.data.MYSQL_PASSWORD,
    DB_PORT: parseInt(parsedConfig.data.MYSQL_PORT),
    SERVER_PORT: parseInt(parsedConfig.data.DB_PORT),
    NODE_ENV: parsedConfig.data.NODE_ENV,
  };

  return envConfig;
}

export { getEnvConfig };
