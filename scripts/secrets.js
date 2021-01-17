const crypto = require("crypto");
const fs = require("fs");

function secret(path) {
  const secret = crypto.randomBytes(20).toString('hex');

  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, secret);
  }
}

const secrets = [
  "./secrets/db_root_password",
  "./secrets/db_password",
  "./secrets/jwt_secret",
]

if (!fs.existsSync('./secrets')) {
  fs.mkdirSync('./secrets');
}

secrets.forEach(secret);
