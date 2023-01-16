const dotenv = require("dotenv")

dotenv.config()
module.exports = {


    host: process.env.db_host,
    database: process.env.db_database,
    username: process.env.db_username,
    password: process.env.db_password
}