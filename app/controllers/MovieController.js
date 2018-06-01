/****************************
 MMOVIE CONTROLLER
 ****************************/
const Controller    = require("./Controller");
const _             = require("lodash");

class MovieController extends Controller {

    constructor(repo) {
        super();
        this.repo = repo;
    }

    // Sort Movies
    async collection() {
        let _this = this;

        try {
            // Validating the Search Parameters
            if(!this.req.query.userId) return _this.res.status(400).send({status: 0, message: "Bad request."});

            // Search Query
            let findMovieQuery = "SELECT tbl_movies.*, tbl_categories.title, COUNT(tbl_user_likes.id) AS likedCount FROM tbl_movies " +
                "LEFT JOIN tbl_categories ON tbl_movies.categoryId = tbl_categories.id " +
                "LEFT JOIN tbl_user_likes ON tbl_movies.id = tbl_user_likes.movieId " +
                "AND tbl_user_likes.is_liked = '1' GROUP BY tbl_movies.id";
            let movieResult =  await this.repo.query(findMovieQuery);
            if (!movieResult.length) return _this.res.status(404).send({status: 1, message: `Movies are not found.`});

            // Find like list for Movies
            let movies = [];
            for(let i = 0; i < movieResult.length; i++) {
                let tempMovieObject = {...movieResult[i]};
                tempMovieObject.likedArr = [];
                tempMovieObject.likedByUser = false;

                // Get list of like array
                let getLikedQuery = "SELECT tbl_user_likes.*, CONCAT(tbl_users.firstname, tbl_users.lastname) AS username FROM tbl_user_likes " +
                    "LEFT JOIN tbl_users ON tbl_user_likes.user_id = tbl_users.id " +
                    "WHERE tbl_user_likes.movieId = " + tempMovieObject.id + " AND tbl_user_likes.is_liked = 1";
                let likedUsersResult =  await this.repo.query(getLikedQuery);

                // Checking user liked or not
                if(likedUsersResult.length) {
                    tempMovieObject.likedArr = likedUsersResult;
                    likedUsersResult.filter((like) => {
                        if(like.user_id == this.req.query.userId) {
                            tempMovieObject.likedByUser = true;
                        }

                        return;
                    })
                }

                // Creating an array of movies
                movies.push(tempMovieObject);
            }

            // CLOSE DB CONNECTION
            const closeDbConnection = await this.repo.close();

            // Sending success response
            return _this.res.status(200).send({status: 1, message: "Movies found successfully", data: { movies }});

        } catch (err) {
            // Sending error
            return _this.res.status(500).send({status: 0, message: err});
        }

    }

    // Search Movie Method
    async searchMovie() {
        let _this = this;

        try {
            // Validating the Search Parameters
            if(!this.req.query.movie || !this.req.query.categoryId) return _this.res.status(400).send({status: 0, message: "Bad request."});

            // Search Query
            let searchQuery = "SELECT tbl_movies.*, tbl_categories.title FROM tbl_movies " +
                "LEFT JOIN tbl_categories ON tbl_movies.categoryId = tbl_categories.id " +
                "WHERE tbl_movies.title LIKE '%" + this.req.query.movie + "%' AND tbl_movies.categoryId = " + this.req.query.categoryId + ";"
            const movies =  await this.repo.query(searchQuery);
            if (!movies.length) return _this.res.status(404).send({status: 1, message: `Movies are not found.`});

            // CLOSE DB CONNECTION
            const closeDbConnection = await this.repo.close();

            // Sending success response
            return _this.res.status(200).send({status: 1, message: "Movies found successfully", data: movies});

        } catch (error) {
            // Sending error
            return _this.res.status(500).send({status: 0, message: error});
        }

    }

    // Like and Dislike Movie Method
    async likeDislikeMovie() {
        let _this = this;

        try {
            // Validating the Search Parameters
            if(!this.req.body.movieId || !this.req.body.userId) return _this.res.status(400).send({status: 0, message: "Bad request."});

            // Pass value in case to update the like dislike for existense record of like dislike
            let likeDislikeId = this.req.body.likeDislikeId;

            // Query to check for liked/disliked user
            let likeDislikeFlag = this.req.body.like;
            let query = "SELECT * FROM tbl_user_likes WHERE movieId = " + this.req.body.movieId + " AND user_id = " + this.req.body.userId;
            const likeDislikeData =  await this.repo.query(query);

            // Insert query for like/dislike
            if (!likeDislikeData.length) {
                let insertQueryForLikeDislike = "INSERT INTO `tbl_user_likes` (`movieId`, `user_id`, `is_liked`, `created_at`) " +
                    "VALUES ('" + this.req.body.movieId + "', '" + this.req.body.userId + "', '" + this.req.body.like + "', NOW());";
                const likeDislikeResult =  await this.repo.query(insertQueryForLikeDislike);

                // CLOSE DB CONNECTION
                const closeDbConnection = await this.repo.close();

                // Settings the message and sending the response
                let message = (likeDislikeFlag) ? "User has liked the movie" : "User has disliked the movie";
                return _this.res.status(200).send({status: 1, message});

            }

            // Update query for like/dislike
            let updateQueryForLikeDislike = "UPDATE tbl_user_likes SET is_liked = '" + likeDislikeFlag + "', created_at = NOW() WHERE id = " + likeDislikeId;
            const likeDislikeResult =  await this.repo.query(updateQueryForLikeDislike);

            // CLOSE DB CONNECTION
            const closeDbConnection = await this.repo.close();

            // Settings the message and sending the response
            let message = (likeDislikeFlag) ? "User has liked the movie" : "User has disliked the movie";
            return _this.res.status(200).send({status: 1, message});

        } catch (error) {
            // Sending error
            return _this.res.status(500).send({status: 0, message: error});
        }

    }

}

module.exports = MovieController;
