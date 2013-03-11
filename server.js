var package = require('./package.json')
  , express = require('express')
  , swig = require('swig')
  , consolidate = require('consolidate')
  , http = require('http')
  , app = express()
  , conf = {
        path: {
            static: __dirname
          , views: __dirname
        }
    };

/*
 * HTTP Server Configuration
 */

swig.init({
    root: conf.path.views
});

app.configure(function () {
    app.engine('html', consolidate.swig);
    app.set('views', conf.path.views);
    app.set('view engine', 'html');
    app.use(express.static(conf.path.static));
});

http.createServer(app).listen(process.env.PORT || 5000);

/*
 * HTTP Server HTML View Bindings
 */

app.get('/', function (req, res) {
    res.render('application.html');
});