require('dotenv').config();
require('dd-trace').init();
const restify = require('restify');
const pino = require('pino');

const logger = pino();



const server = restify.createServer({
});
server.get('/sync',  (req, res, next) => {
    res.send("its me");
    next();
});


server.get('/discard', async (req, res) => {
    logger.info({}, 'making async call but discarding');
    await fetch('https://dummyjson.com/posts');
    logger.info({}, 'called');
    res.send("its me");
    return;
});

server.get('/used', async (req, res) => {
    logger.info({}, 'calling async but will use');
    try {
        const response = await fetch('https://dummyjson.com/posts');
        if (response.ok) {
            const json = await response.json();
            res.send(json.posts[0]);
            return;
        }
    } catch (err) {
        logger.error({err}, "An error");
    }
    
});

server.get('/old-way', (req, res, next) => {
    logger.info({}, 'making a promise');
    return fetch('https://dummyjson.com/posts')
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(json => {
            res.send(json.posts[0]);
            next();
        })
        .catch(err => {
            logger.error({err}, "An error");
        });
});

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
