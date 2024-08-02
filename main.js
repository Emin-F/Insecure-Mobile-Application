
var mysql = require('mysql2');
const express = require('express');
const {response} = require("express");
const app = express();
app.use(express.json());

app.listen(3000, () => {
    console.log("Server running on port 3000");

});

app.get("/status", (req, res, next) => {
    res.json({"message": "Server Running"});
});

//mysql bağlantısını yapmak için aşağıdaki komutları sırasıyla run et.
//brew install mysql
//brew services start mysql
//mysql -u root
//CREATE DATABASE users;
//burada mysql indirdik ve root  olarak bağlandık gerekirse root şifresini değiştir yoksa kalsın daha sonra senin içine veri yacacağın Table'yi create et ve devamke.

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'users'
};

// Bağlantıyı yönetmek için fonksiyon
function handleDisconnect() {
    const connection = mysql.createConnection(dbConfig);

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            setTimeout(handleDisconnect, 2000); // 2 saniye sonra yeniden bağlanmayı dene
        } else {
            console.log('Connected to the database');
        }
    });

    connection.on('error', (err) => {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect(); // Bağlantı kaybedildiğinde yeniden bağlanmayı dene
        } else {
            throw err;
        }
    });

    return connection;
}


let con = handleDisconnect();
con.query("INSERT INTO users (username, password) VALUES ('hasan', 'kaya')", function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
});

con.query("INSERT INTO users (username, password) VALUES ('emin', 'fidan')", function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
});
con.end();

     //   var sql5 = "CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY,username VARCHAR(255), password VARCHAR(255))";
/*
        con.query(sql5, function (err, result) {
            if (err) throw err;
            console.log("Table created");
          });
*/
// id değerlerini silsem de olur gibi



app.get("/profile/:id", (req, res, next) => {
    console.log("profile/:id  kismina istek attin");
    const connection = handleDisconnect();
    const userId = req.params.id;
    const sql = "SELECT username FROM users WHERE id = ?";
    connection.query(sql, [userId], function (error, results, fields) {
        connection.end();
        if (error) throw error;
        const username = results[0].username;
        // `username`'ı içeren JSON yanıtını döndür
        res.json({ username: username });
    //    res.json(results);
      //  console.log(result);
    });
});




app.post('/profile/admin', (req, res) => {
    const { isAdmin } = req.body;
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    if (isAdmin === "1") {
        res.json('Congratulations! You are an admin.');
        console.log("admin isteği başarili");
     
    } else {
       // console.log(res);
        res.status(403).json('Access denied');
        console.log("admin isteği olmadi");
        
    }
});





app.post("/register", (req, res, next) => {
    const connection = handleDisconnect();
    const { username, password } = req.body;
    console.log("register istegi geldi");
    console.log("register istegi geldi degerler"+username + " " + password);
    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    connection.query(sql, [username, password], function (err, result) {
        connection.end();
        if (err) throw err;
        console.log("1 record inserted");
        res.json("User registered");
    });
});


app.post("/login", function (req, res, next) {
    const connection = handleDisconnect();
    const { username, password } = req.body;
    console.log("login istegi geldi");

    if (username && password) {
        console.log(username,password)
        const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
        connection.query(sql, [username, password], function (error, results, fields) {
            connection.end();
            if (error) throw error;
            if (results.length > 0) {
                // Başarılı login: Kullanıcı ID'sini döndür
                res.json({
                    message: "Login successful",
                    userId: results[0].id
               
                    
                });
               // res.send(json)
                console.log(res.json)
                console.log("login başarılı");
            } else {
                res.send("Incorrect Username and/or Password!");
                console.log("Incorrect Username and/or Password! degerler"+ username + " "+ password)
            }
        });
    } else {
        res.send("Please enter Username and Password!");
    }
});