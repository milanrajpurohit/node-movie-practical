/********************************
 MOVIE ROUTING INITIALISATION
 ********************************/
module.exports = function(app, express) {

    // Imports Dependency, models and controllers
	const router                = express.Router();
    const config                = require('../../configs/configs');
    const Model                 = require("../models/Model");
    const MovieController       = require("../controllers/MovieController");

    // Sorted Movie Routing
    router.get('/movies', (req, res) => {
        const MovieObj = (new MovieController(new Model(config.db))).boot(req, res);
        return MovieObj.collection();
    });

    // Movies Search Routing
    router.get('/movies/search', (req, res) => {
        const MovieObj = (new MovieController(new Model(config.db))).boot(req, res);
        return MovieObj.searchMovie();
    });

    // Movies LIKE/DISLIKE Routing
    router.post('/movies/likedislike', (req, res) => {
        const MovieObj = (new MovieController(new Model(config.db))).boot(req, res);
        return MovieObj.likeDislikeMovie();
    });

	app.use(config.baseApiUrl, router);

};