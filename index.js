const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const connection = mysql.createConnection({
    host     : process.env.DATABASE_HOST,
    port     : process.env.DATABASE_PORT,
    user     : process.env.DATABASE_USERNAME,
    password : process.env.DATABASE_PASSWORD,
    database : process.env.DATABASE_DATABASE
});

const requiredPrefix = process.env.URL_PREFIX;
const installerUrl = process.env.INSTALLER_URL;

connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);

    app.listen(3000, function () {
        console.log('Web server listening on port 3000');
    });
});

app.get('/api/v1/download/_count', function (req, res) {
    connection.execute(
        'SELECT COUNT(*) as cnt FROM downloads',
        [],
        function (err, result) {
            if (err) {
                console.error(err);
                res.json({}).status(500);

                // Force restart
                throw err;
            }

            console.log("Total downloads", result[0].cnt);
            res.json(result[0].cnt);
        }
    );
});

app.get('/api/v1/download', function (req, res) {
    const url = req.query.url;

    if (!url.startsWith(requiredPrefix)) {
        res.json({error: "Invalid URL"}).status(400);
        return;
    }

    connection.execute(
        'INSERT INTO downloads (timestamp, url) VALUES (CURRENT_TIMESTAMP, ?)',
        [url],
        function (err) {
            if (err) {
                console.error(err);

                // Force restart
                throw err;
            }
        }
    );

    res.redirect(url);
});

app.get('/installer', function (req, res) {
    res.redirect(installerUrl);
});

app.get('/health', function (req, res) {
    connection.ping(function (err) {
        if (err) {
            console.error(err);
            res.status(500).json({});
            return;
        }

        res.json();
    })
})
