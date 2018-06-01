/********************************
 USERS ROUTING INITIALISATION
 ********************************/
module.exports = function(app, express) {

    // Imports Dependency, models and controllers
	const router                = express.Router();
    const config                = require('../../configs/configs');
    const Model                 = require("../models/Model");
    const UserController        = require("../controllers/UserController");

    // Signup Routing
    router.post('/signup', (req, res) => {
        const UserObj = (new UserController(new Model(config.db))).boot(req, res);
        return UserObj.signUp();
    });

    // Login Routing
    router.post('/login', (req, res) => {
        const UserObj = (new UserController(new Model(config.db))).boot(req, res);
        return UserObj.logIn();
    });

    // Search User Routing
    router.get('/users/search', (req, res) => {
        const UserObj = (new UserController(new Model(config.db))).boot(req, res);
        return UserObj.searchUser();
    });


    app.use(config.baseApiUrl, router);

};