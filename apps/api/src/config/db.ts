import { createConnection } from 'mysql2';
import { getEnvConfig } from './env';

const config = getEnvConfig();

// TODO: This needs to be fixed...
const db = createConnection(config.DB_HOST);

export { db };
