#Random Coding Challenge

### Part 1
1. Create an users table with the following fields and insert 10 million random rows into the table
  - id
  - full_name
  - email
  - city 

2. Find all the users who have `john` in their name so `John smith`, `Smith john`, `Johnny` etc should all be returned

3. Optimize query so it doesn’t take more than few milli seconds.

##My solution

I'm using three nodejs scripts to run several tasks (db creation, populating db and performing queries). I'm using several libraries: node-mysql, async and measure. This example is meant to be run in a MySQL server as is taking advantage of a FULLTEXT index to allow fast querying among the records (MyISAM engine).

Every script will provide timing information in milliseconds when they are done.

# Instructions

1. ```cd partOne```
2. ```npm install```

    will install all the abovementioned dependencies.
3. ```npm start```

    It will run scripts inside bootstrap folder create_db and populate_db. Populate DB will queue 10000 INSERT tasks in series. Each task will insert 1000 random user records. It will take a while to populate the DB depending on your machine. (As a stretch I would explore parallel db query and see how they could improve exec speed).
4. ```node index.js [term]```

    It will run a pair of queries against the DB. The first query is a slow query using classic LIKE syntax and therefore not taking advantage of the FULLTEXT index. (It's provided as a comparison). The second query it's a fast query using MATCH ... AGAINST in binary mode returning the same result set but with almost a ten-fold improvement in execution time by leveraging a FULLTEXT index.

Better results could be achieved by using Apache Lucerne or Solr as they will allow suffix searches, matching for example 'John' => John Johnson DeJohn. This is a limitation as FULLTEXT indexes use a B-Tree.

# Example

```
$ node partOne/index.js John
[+] Slow query using LIKE. NOT INDEXED
 ->  SELECT * FROM Users WHERE full_name LIKE '%John%'
[+] Slow query stats: { ct: 1, total: 3951, max: 3951, min: 3951 } num rows: 39995
[+] Fast query using MATCH AGAINST. INDEXED
 ->  SELECT * FROM Users WHERE MATCH(full_name) AGAINST('John*' IN BOOLEAN MODE);
39995
[+] Fast query stats: { ct: 1, total: 510, max: 510, min: 510 } num rows: 39995
```

### Part 2

1. Make a chat application using PHP, nodejs/socket.io. It should be simple chat application with 

one public channel.

2. Populate chat with 1000 random messages by random users every 5 seconds.

3. Make a list of 100 words. These words should be blocked on public channel. 

4. Deploy chat on a server.

##My solution

Here I'm using socket-io with express. When you enter in the chat, you get a prompt to introduce your username. I'm using bower in order to install the frontend dependencies. Then, I'm deploying it on Heroku.

#Instructions

1. ```cd partTwo```
2. ```npm install```
 
    will install all the dependencies
3. ```node index.js```

    It will set up and start the chat. A script will populate 1000 random messages by random users every 5 seconds. Frontend part delete old messages in order to improve the chat, if you don't do it, you can get tons of messages that will block your client. 

#Example

You can see a functional version on Heroku: https://mysterious-citadel-93288.herokuapp.com/ 

![Alt Text](http://s9.postimg.org/41dg6kzmn/chat.png)

