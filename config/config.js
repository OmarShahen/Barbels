module.exports = {

    PORT: process.env.PORT,
    DB_URL: process.env.DB_URL,
    SALT_ROUNDS: process.env.SALT_ROUNDS,
    SECRET_KEY: process.env.SECRET_KEY,
    ADMIN_ROLES: ['SUPER'],
    PHONE_COUNTRY_CODES: ['+20'],
    EXPIRATION_PERIODS: ['day', 'days', 'week', 'weeks', 'month', 'months', 'year'],
    MAX_ATTENDANCE: 1095
}