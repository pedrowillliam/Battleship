const { Pool } = require('pg');

const pool = new Pool({
    user: 'battleship_user',
    host: 'localhost',
    database: 'battleship',
    password: '123456',
    port: 5432,
});

module.exports = pool;