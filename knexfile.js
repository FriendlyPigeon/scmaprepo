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
      socketPath: `cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DATABASE,
    },
    migrations: {
      directory: __dirname + '/src/server/db/migrations',
    },
    seeds: {
      directory: __dirname + '/src/server/db/seeds/production'
    },
  },
};
