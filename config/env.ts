if (
  process.env.NODE_ENV !== 'production' &&
  process.env.NODE_ENV !== 'development' &&
  process.env.NODE_ENV !== 'test'
) {
  throw new Error(
    'The NODE_ENV environment variable is required but was not specified.'
  );
}

export const isEnvProduction = process.env.NODE_ENV === 'production';
export const isEnvDevelopment = process.env.NODE_ENV === 'development';
export const isEnvTest = process.env.NODE_ENV === 'test';

interface Env {
  NODE_ENV: 'production' | 'development' | 'test';
}

const env: Env = {
  NODE_ENV: process.env.NODE_ENV
};

export default env;