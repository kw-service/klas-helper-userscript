if (
  process.env.NODE_ENV !== 'production' &&
  process.env.NODE_ENV !== 'development' &&
  process.env.NODE_ENV !== 'test'
) {
  throw new Error(
    'The NODE_ENV environment variable is required but was not specified.'
  );
}

interface Env {
  NODE_ENV: 'production' | 'development' | 'test';
}

const env: Env = {
  NODE_ENV: process.env.NODE_ENV
};

export default env;