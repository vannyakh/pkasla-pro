const http = require("http");
const { exec } = require("child_process");

function runDeploy() {
  exec("bash /www/wwwroot/project/deploy.sh", (err, stdout, stderr) => {
    if (err) {
      console.error("Deploy Error:", err);
      return;
    }
    console.log(stdout);
  });
}

http.createServer((req, res) => {
  if (req.url === "/deploy" && req.method === "POST") {
    runDeploy();
    res.writeHead(200);
    res.end("Phkasla Deployment Triggered");
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
}).listen(9020);

console.log("Webhook running on port 9020");
