'use strict';
var dbConfig = require("./config/database.js"),
    mysql = require("mysql"),
    measure = require("measure"),
    async = require("async");

var FindUsersTask = (function() {
    var db;

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

    return {
        slowQuery: function(db_config, search, cb){
            var sql = "SELECT * FROM Users WHERE full_name LIKE '%" + search + "%'",
                collectTime = measure.measure('slow');

            connect(db_config);
            console.log("[+] Slow query using LIKE. NOT INDEXED");
            console.log(" -> ", sql);
            db.query(sql,function(err, rows){
                if (err) {
                    throw err
                }
                disconnect(function(err) {
                    collectTime();
                    console.log("[+] Slow query stats:", measure.stats('slow'), "num rows:", rows.length);
                    cb && cb();
                })
            });
        },
        fastQuery: function(db_config, search, cb){
            var sql = "SELECT * FROM Users WHERE MATCH(full_name) AGAINST('" + search + "*' IN BOOLEAN MODE);",
                collectTime = measure.measure('fast');

            connect(db_config);
            console.log("[+] Fast query using MATCH AGAINST. INDEXED");
            console.log(" -> ", sql);
            db.query(sql,function(err, rows){
                if (err) {
                    throw err
                }
                console.log(rows.length);
                disconnect(function(err) {
                    collectTime();
                    console.log("[+] Fast query stats:", measure.stats('fast'), "num rows:", rows.length);
                    cb && cb();
                })
            });
        }
    }  
})();

var searchTerm = process.argv[2];

async.series([
    function(cb) {
        FindUsersTask.slowQuery(dbConfig, searchTerm, cb);
    },
    function(cb) {
        FindUsersTask.fastQuery(dbConfig, searchTerm, cb);
    }
]);

