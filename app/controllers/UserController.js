/****************************
 USER CONTROLLER
 ****************************/
const Controller    = require("./Controller");
const bcrypt        = require('bcrypt')
const _             = require("lodash");

class UserController extends Controller {

    constructor(repo) {
        super();
        this.repo = repo;
    }

    // SignUP Method
    async signUp() {
        let _this = this;

        try {
            // Validating Fields
            if (!this.req.body.email || !this.req.body.password || !this.req.body.firstname || !this.req.body.lastname) return _this.res.status(400).send({status: 0, message: 'Please send all credentials.'});

            // Query to Find the User
            let query = `SELECT * FROM movies.tbl_users WHERE email=?;`;
            const user = await this.repo.query(query, this.req.body.email);
            if (user.length) return _this.res.status(404).send({status: 0, message: 'User already registered.'});

            // Hash the password with the salt
            let salt = bcrypt.genSaltSync(10);
            let hash = bcrypt.hashSync(this.req.body.password, salt);

            // Insert Query
            let insertQuery = "INSERT INTO `movies`.`tbl_users` (`firstname`, `lastname`, `email`, `password`, `address`, `phone`) " +
                "VALUES ('" + this.req.body.firstname + "', '" + this.req.body.lastname + "', " +
                "'" + this.req.body.email + "', '" + hash + "', '" + this.req.body.address + "', " +
                "'" + this.req.body.phone + "');"
            const savedUser = await this.repo.query(insertQuery);

            // CLOSE DB CONNECTION
            const closeDbConnection = await this.repo.close();

            // Sending Success Response
            return _this.res.status(200).send({status: 1, message: "User has been registered successfully"});

        } catch (err) {
            // Sending Error
            return _this.res.status(500).send({status: 0, message: err});
        }

    }

    // Login Method
    async logIn() {
        let _this = this;

        try {
            // Validating Fields
            if (!this.req.body.email || !this.req.body.password) return _this.res.status(400).send({status: 0, message: 'Please send all credentials.'});

            // Query to Find the User
            let query = `SELECT * FROM movies.tbl_users WHERE email=?;`;
            const user = await this.repo.query(query, this.req.body.email);
            if (!user.length) return _this.res.status(404).send({status: 0, message: 'User is not found.'});

            // Password Check
            const passwordCheck = await bcrypt.compare(_this.req.body.password, user[0].password);
            if(!passwordCheck) return _this.res.status(401).send({status: 0, message: 'Authentication Failed, Invalid Password.'});

            // CLOSE DB CONNECTION
            const closeDbConnection = await this.repo.close();

            // Sending Success Response
            return _this.res.status(200).send({status: 1, message: "User loggedin successfully", data: { user: user[0] }});

        } catch (err) {
            // Sending Error
            return _this.res.status(500).send({status: 0, message: err});
        }

    }

    // Search User
    async searchUser() {
        let _this = this;

        try {
            // Validating the Search Parameters
            if(!this.req.query.name) return _this.res.status(400).send({status: 0, message: "Bad request."});

            // Search Query
            let searchUsersQuery = "SELECT tbl_users.* FROM tbl_users WHERE tbl_users.firstname LIKE '%" +
                this.req.query.name + "%' OR tbl_users.lastname LIKE '%" + this.req.query.name + "%'";
            let searchUsersResult =  await this.repo.query(searchUsersQuery);
            if (!searchUsersResult.length) return _this.res.status(404).send({status: 1, message: `Users are not found.`});

            // Find like and dislike for searched users
            let users = [];
            for(let i = 0; i < searchUsersResult.length; i++) {
                let tempUserObject = {...searchUsersResult[i]};
                tempUserObject.likedDisliked = [];

                // Like and Dislike Query
                let getLikeDislikeQuery = "SELECT tbl_user_likes.movieId, tbl_user_likes.is_liked, tbl_movies.title FROM tbl_user_likes " +
                    "LEFT JOIN tbl_movies ON tbl_movies.id = tbl_user_likes.movieId WHERE tbl_user_likes.user_id = " + tempUserObject.id;
                let likeDislikeResult =  await this.repo.query(getLikeDislikeQuery);
                tempUserObject.likedDisliked = likeDislikeResult;

                // Creating an users array
                users.push(tempUserObject);
            }

            // CLOSE DB CONNECTION
            const closeDbConnection = await this.repo.close();

            // Sending Success Response
            return _this.res.status(200).send({status: 1, message: "List of searched users.", data: { users }});

        } catch (err) {
            // Sending Error
            return _this.res.status(500).send({status: 0, message: err});
        }

    }

}

module.exports = UserController;
