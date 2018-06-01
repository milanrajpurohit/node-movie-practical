/*************
 COMMON MODEL
 **************/
let _ = require("lodash");
const mysql = require( 'mysql' );

class Database {

    // Establish Connection
    constructor( config ) {
        this.connection = mysql.createConnection( config );
    }

    // Execute the query
    query( sql, args ) {

        return new Promise( ( resolve, reject ) => {

            this.connection.query( sql, args, ( err, rows ) => {

                if ( err )
                    return reject( err );
                resolve( rows );

            } );

        } );

    }

    // Close the connection
    close() {

        return new Promise( ( resolve, reject ) => {

            this.connection.end( err => {

                if ( err )
                    return reject( err );

                resolve();

            } );

        } );

    }

}

module.exports = Database;