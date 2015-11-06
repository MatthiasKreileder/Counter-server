var express = require('express');
var router = express.Router();
var redis = require('redis');
var url = require('url');
var _client = null;

module.exports = router;

/* POST */
router.post('/', function(req, res, next) {

    var path = url.parse(req.originalUrl, true);

    if (!path.query || !path.query["clock"]) {
        res.status(400).send("Missing clock parameter");
        return;
    }

    var clock = path.query["clock"];
    var numClock = Number(clock);
    if (!numClock) {
        res.status(400).send("Clock parameter is not a number");
        return;
    }

    getCurrent(function (err, state) {
        if (err) {
            res.status(500).send(err);
        } else {
            var trueClock = state["clock"];
            if (trueClock !== numClock) {
                res.status(400).send("Sending clock " + clock + " but server is at clock " + trueClock);
                return;
            }

            var newState = req.body;
            handleUpdate(trueClock, newState, function (err, newClock) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).send({"newClock": newClock});
                }
            });
        }
    });
});

//actually handle the update in the database and increment the clock
function handleUpdate(clock, state, completion) {

    var newClock = clock + 1;
    state["clock"] = newClock;
    setCurrent(state, function(err) {
        if (err) {
            completion(err, null);
        } else {
            completion(null, newClock);
        }
    });
}

/* GET */
router.get('/', function (req, res, next) {
    getCurrent(function (err, state) {
       if (err) {
           res.status(500).send(err);
       } else {
           res.send(state);
       }
    });
});

function getCurrent(completion) {
    db().get("state", function (err, reply) {
        if (err) {
            completion(err, null);
        } else {
            var state = null;
            if (!reply) {
                state = {clock:1}
            } else {
                state = JSON.parse(reply);
            }
            completion(null, state);
        }
    });
}

function setCurrent(state, completion) {
    db().set("state", JSON.stringify(state), function (err, reply) {
        if (err) {
            completion(err);
        } else {
            completion(null);
        }
    });
}

//utils
function db() {
    if (!_client) {
        var redisURL = url.parse(process.env.REDIS_URL);
        var client = redis.createClient(redisURL.port, redisURL.hostname);
        client.auth(redisURL.auth.split(":")[1]);
        _client = client;
    }
    return _client;
}



