'use strict';

var dbConfig = require("../config/database.js"),
    mysql = require("mysql"),
    async = require("async"),
    measure = require("measure"),
    dictionary = require("./dictionary.json");

var PopulateDBTask = (function() {
    var db,
        collectTime = measure.measure('populate'),
        sql = "INSERT INTO Users (full_name, email, city) VALUES ?";

    function connect(db_config) {
        db = mysql.createConnection({
            host: db_config.host,
            user: db_config.user,
            password: db_config.password,
            database: db_config.name
        });

        db.connect(function(err){
            if(err){
                console.log("Error connecting to DB");
                console.log(err)
                return;
            }
        });
    }


    function disconnect(cb) {
        db.end(function(err) {
            err && console.log("Error: ", err);
            cb && cb(err);
        });
    }

    function getRandom(max){
        return Math.floor((Math.random()* max));
    }

    return {
        addRandomUsers: function(db_config) {
            var rows,
                total = 0;
                        
            async.timesSeries(10000, 
                function(n, next) {
                    var fRandom = getRandom(dictionary.firstNames.length),
                        lRandom = getRandom(dictionary.lastNames.length),
                        cRandom = getRandom(dictionary.cities.length);
                    
                    rows = [];
                    for(var j = 0; j<1000; j++){                    
                        var fName = dictionary.firstNames[(fRandom+j)%dictionary.firstNames.length],
                            lName = dictionary.lastNames[(lRandom+j)%dictionary.lastNames.length],
                            email = fName + lName + "@example.org",
                            city = dictionary.cities[(cRandom+j)%dictionary.cities.length];

                        rows.push([fName + " " + lName, email, city]);
                    }
                    
                    console.log("Task", n, "generated", rows.length, "records");

                    connect(db_config);

                    db.query(sql, [rows], function(err){
                        if (err) {
                            throw err
                        }
                        total+=rows.length;
                        console.log("running total: " + total);

                        disconnect(function(err) {
                            collectTime();
                            next(err, n);    
                        });
                    });
                },
                function (err, results) {
                    console.log("Inserted", total, "elements");
                    console.log("Execution time:", measure.stats('populate'));
                });
        }
    }
})();

PopulateDBTask.addRandomUsers(dbConfig);

  