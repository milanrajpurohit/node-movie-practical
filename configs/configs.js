/*******************
 CONFIGURATION FILE
 ********************/
module.exports = {
    db:  {
        connectionLimit : 100,
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'movies',
    },
    baseApiUrl: '/api',
    serverPort: '5022',
    tokenExpiry: 361440,
};