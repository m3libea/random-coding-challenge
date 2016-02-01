'use strict';

var dbConfig = require("../config/database.js"),
    mysql = require("mysql"),
    measure = require("measure");

var CreateDBTask = (function() {
    var db,
        collectTime = measure.measure('exec');

    function connect(db_config) {
        db = mysql.createConnection({
            host: db_config.host,
            user: db_config.user,
            password: db_config.password
        });

        db.connect(function(err){
            if(err){
                console.log("Error connecting to DB");
                console.log(err)
                return;
            }
            console.log('Connection established');
        });
    }

    function disconnect(cb) {
        db.end(function(err) {
            console.log("Ending DB connection.");
            err && console.log("Error: ", err);
            cb && cb(err);
        });
    }

    return {
        createSchema: function(db_config) {
            collectTime();
            connect(db_config);

            console.log("Creating DB");
            db.query('CREATE DATABASE IF NOT EXISTS ' + db_config.name);
            db.query('USE ' + db_config.name);

            db.query('CREATE TABLE IF NOT EXISTS Users (id BIGINT AUTO_INCREMENT, full_name varchar(50) NOT NULL, email varchar(50) NOT NULL, city varchar(20) NOT NULL, PRIMARY KEY(id)) ENGINE=MyISAM;', 
                function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("Table Users created");
                    }
            });


            db.query("ALTER TABLE Users ADD FULLTEXT (full_name)", function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("Index created");
                    }
            });

            disconnect(function(){
                collectTime();
                console.log("Execution time:", measure.stats('exec'));
            });            
        }
    }
})();

CreateDBTask.createSchema(dbConfig);
