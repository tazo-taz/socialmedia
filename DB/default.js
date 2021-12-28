const data = require('../config/default');
const mysql = require('mysql');
const util = require('util');

var db;

function handleDisconnect() {
  db = mysql.createConnection(data.MySQL);

  db.connect((err) => {
    if (err) handleDisconnect();
    else console.log('Connected');
  });
  db.on('error', function (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') handleDisconnect();
    else throw err;
  });
}

handleDisconnect();

module.exports.DB = () => db;
module.exports._QUERY = (a) => util.promisify(db.query).bind(db)(a);
module.exports._QUERY_ONE = async (a) => (await this._QUERY(a))[0];
