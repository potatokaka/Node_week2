const http = require('http')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

const headers = require('./headers')
const handleSuccess = require('./utils/handleSuccess')
const handleError = require('./utils/handleError')

const Post = require('./models/posts')

// 環境變數
dotenv.config({ path: "./config.env" })
const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)

// 連線資料庫
// mongoose.connect('mongodb://localhost:27017/hexdeily')
mongoose.connect(DB)
  .then(() => {
    console.log('資料庫連線成功');
  })
  .catch(error => {
    console.log(error);
  })

const requestListener = async (req, res) => {
  let body = ''
  req.on('data', (chunk) => {
    body += chunk
  })

  if (req.url === '/posts' && req.method === 'GET') {
    const postData = await Post.find()
    handleSuccess(res, postData)
  } else if (req.url === '/posts' && req.method === 'POST') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (data.content) {
          const newPost = await Post.create({
            name: data.name,
            content: data.content,
            type: data.type,
            tags: data.type
          })
          handleSuccess(res, newPost)
        } else {
          handleError(res)
        }
      } catch(error) {
        handleError(res, error)
      }
    })
  } else if (req.url === '/posts' && req.method === 'DELETE') {
    const postData = await Post.deleteMany({})
    handleSuccess(res, postData)
  } else if (req.url.startsWith('/posts/') && req.method === 'DELETE') {
    const id = req.url.split('/').pop()
    const postData = await Post.findByIdAndDelete(id);
    handleSuccess(res, postData)
  } else if (req.url.startsWith('/posts/') && req.method === 'PATCH') {
    req.on('end', async () => {
      try {
        const id = req.url.split('/').pop()
        const data = JSON.parse(body)
        if (data.content) {
          const postData = await Post.findByIdAndUpdate(id, {
            $set: {
              content: data.content,
              type: data.type,
              tags: data.type,
              image: data.image
            }
          })
          handleSuccess(res, postData)
        } else {
          handleError(res)
        }
      } catch(error) {
        handleError(res, error)
      }
    })
  } else if (req.url === "OPTIONS" ) {
    res.writeHead(200, headers)
    res.end()
  } else {
    res.writeHead(404, headers);
    res.write(JSON.stringify({
      'status': 'false',
      'message': '無此網站路由'
    }))
    res.end();
  }
}
  
const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005)