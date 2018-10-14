module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      user: 'postgres',
      password: 'postgres',
      database: 'scmaprepo_test'
    },
    migrations: {
      directory: __dirname + '/src/server/db/migrations',
    },
    seeds: {
      directory: __dirname + '/src/server/db/seeds',
    },
  },
  production: {
    client: 'pg',
    connection: {
      socketPath: '/cloudsql/scmaprepo:us-central1:scmaprepo',
      user: 'postgres',
      password: 'WdNP0Byf95RuLJHxHxu0',
      database: 'scmaprepo_test'
    },
    migrations: {
      directory: __dirname + '/src/server/db/migrations',
    },
    seeds: {
      directory: __dirname + '/src/server/db/seeds/production'
    },
  },
};
