import http from "http";
import mysql from 'mysql2/promise';

const port = '30002'

const db = await mysql.createConnection({
  host: '127.0.0.1',
  user: 'reurl',
  password: 'reurl',
  database: 'reurl'
});

async function getLinkById(str) {
  try {
    const [results, fields] = await db.query(
      'SELECT `link`, `views` FROM `transfer_data` WHERE id= ?;', [str]
    );
    if (results[0]) {
      await db.query(`UPDATE \`transfer_data\` SET views=${parseInt(results[0].views) + 1} WHERE id = ?;`, [str]);

      return results[0].link
    } else {
      return null
    }
  } catch (err) {
    console.log(err);
  }
}

async function getSerial() {
  try {
    const [results, fields] = await db.query('SELECT `data` FROM `global` WHERE name = "serial"');

    if (results[0]) {
      await db.query(`UPDATE \`global\` SET data="${parseInt(results[0].data) + 1}" WHERE name = "serial"`);
      return parseInt(results[0].data) + 1
    } else {
      return null
    }
  } catch (err) {
    console.log(err);
  }
}

function encode(n) {
  let str = (n * 95624).toString(36);

  const shift = (n * 97) % 36;
  const pattern = "0123456789abcdefghijklmnopqrstuvwxyz";

  let ret = "";

  for (let i = 0; i < str.length; i++) {
    ret += pattern[(pattern.indexOf(str[i]) + shift) % pattern.length];
  }

  ret = pattern[shift] + ret;

  return ret;
}

async function createReurl(link, id = undefined) {
  if (!id) {
    while (true) {
      id = encode(await getSerial());

      const [results, fields] = await db.query('SELECT `link` FROM `transfer_data` WHERE id = ?', [id]);

      if (!results[0]) {
        break;
      }
    }
  } else {
    const [results, fields] = await db.query('SELECT `link` FROM `transfer_data` WHERE id = ?', [id]);
    if (results[0]) {
      return { error: 1, message: "重複的ID" }
    }
  }

  const time = Math.floor((new Date()) / 1000)
  try {
    await db.query('INSERT INTO transfer_data VALUES (?, ?, ?, 0)', [id, link, time]);
    
    return { error: 0, message: id }
  } catch (err) {
    console.log(err);
    return { error: 1, message: err}
  }
}

const server = http.createServer(async (req, res) => {
  const path = req.url.split("?")[0]
  const urlParams = {};
  const queryString = req.url.split('?')[1];

  if (queryString) {
    const params = queryString.split('&');
    params.forEach(param => {
      const [key, value] = param.split('=');
      urlParams[key] = decodeURIComponent(value);
    });
  }

  switch (path) {
    case '':
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write('<html><body>HOME</body></html>');
      res.end();
      break
    case '/create':
      if (urlParams.link) {
        let link = await createReurl(urlParams.link, urlParams.id)
        if (link.error){
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write(`<html><meta charset="UTF-8"><body>${link.message} D:</a></body></html>`);
          res.end();
          return 
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`<html><meta charset="UTF-8"><body><a href="/${link.message}">已註冊 :D</a></body></html>`);
        res.end();
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<html><meta charset="UTF-8"><body>格式不正確 :(</body></html>');
        res.end();
      }
      break
    default:
      let search = await getLinkById(path.slice(1))
      if (search) {
        res.writeHead(302, {
          'Content-Type': 'text/html',
          // 'Location': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          'Location': search
        });
        res.write(`<html><body>${await search}</body></html>`);
        res.end();
      } else {
        res.writeHead(404, {
          'Content-Type': 'text/html'
        });
        res.write(`<html><meta charset="UTF-8"><body><h1 style="color:red">:( 您撥的號碼是空號，請查明後再撥</h1></body></html>`);
        res.end();

      }
      break
  }

})

server.listen(port);
console.log('LOG: server is running at', port);