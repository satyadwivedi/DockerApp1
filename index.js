// const http = require('http');

// http.createServer((request, response) => {
    
//     if(request.method === 'GET') {
//         response.write('<html>');
//         response.write('<body>');
//         response.write('<h1>Hello, World!</h1>');
//         response.write('</body>');
//         response.write('</html>');
//         response.end();
//     } else if(request.method === 'POST' && request.url === 'echo') {
//         request.pipe(response)
//     } else {
//         response.statusCode = '404'
//         response.end()
//     }
// }).listen(8080);

const chalk  = require('chalk')
const express = require('express')
const http = require('http')
const https = require('https')
const config = require('./config')

const HTTP_PORT = config.HTTP_PORT
const HTTPS_PORT = config.HTTPS_PORT
const SERVER_CERT = config.SERVER_CERT
const SERVER_KEY = config.SERVER_KEY

const app = express()

const MainController = require('./controllers')

app.use('', MainController)
app.set("port", HTTPS_PORT)

/**
 * create HTTPS server
 */

const server = https.createServer({
    key: SERVER_KEY,
    cert: SERVER_CERT
},
app
)

const onError = (error) => {
    if (error.syscall !== "listen") {
        throw error;
    }
    const bind = typeof HTTPS_PORT === "string" ? "Pipe " + HTTPS_PORT : "Port " + HTTPS_PORT;
    switch (error.code) {
        case "EACCES":
          console.error(chalk.red(`[-] ${bind} requires elevated privileges`));
          process.exit(1);
          break;
        case "EADDRINUSE":
          console.error(chalk.red(`[-] ${bind} is already in use`));
          process.exit(1);
          break;
        default:
          throw error;
      }
}

const onListening = () => {
    const addr = server.address();
    const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
    console.log(chalk.yellow(`[!] Listening on HTTPS ${bind}`));
};

server.listen(HTTPS_PORT);
server.on("error", onError);
server.on("listening", onListening);



/**
 * Create HTTP Server (HTTP requests will be 301 redirected to HTTPS)
 */
http
  .createServer((req, res) => {
    res.writeHead(301, {
      Location:
        "https://" +
        req.headers["host"].replace(
          HTTP_PORT.toString(),
          HTTPS_PORT.toString()
        ) +
        req.url
    });
    res.end();
  })
  .listen(HTTP_PORT)
  .on("error", onError)
  .on("listening", () =>
    console.log(chalk.yellow(`[!] Listening on HTTP port ${HTTP_PORT}`))
  );
  
  module.exports = app;

// app.get('/', (req, res) => {
//     res.send('Hello World')
// })

// app.listen(PORT, () => {
//     console.log(chalk.blue(`Listening on HTTPS ${PORT}`));
// })
