//MVC -> Model | View | Controller

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const cookieParser = require('cookie-parser') // a bit of middleware
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, { pingInterval: 500, pingTimeout: 1000 })

const port = 3000 || process.env.PORT

//view engine
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')

//static files & middleware
app.use(express.static(__dirname + '/public'))
app.use(cookieParser())

app.get('/', (req, res) => {
  res.render('startPage')
})
app.get('/game', (req, res) => {
  res.render('index')
})

const backEndPlayers = {}
const SPEED = 8

io.on('connection', (socket) => {
  console.log('a new user connected')
  backEndPlayers[socket.id] = {
    //create new player
    x: 500 * Math.random(),
    y: 500 * Math.random(),
    color: `hsl(${Math.random() * 360}, 50%, 50%)`,
    sequenceNumber: 0
  }

  io.emit('updatePlayers', backEndPlayers)

  socket.on('disconnect', (reason) => {
    console.log(reason)
    delete backEndPlayers[socket.id]
    io.emit('updatePlayers', backEndPlayers)
  })

  socket.on('keydown', ({ keyCode, sequenceNumber }) => {
    backEndPlayers[socket.id].sequenceNumber = sequenceNumber
    switch (keyCode) {
      case 'KeyW':
        backEndPlayers[socket.id].y -= SPEED
        break
      case 'KeyA':
        backEndPlayers[socket.id].x -= SPEED
        break
      case 'KeyS':
        backEndPlayers[socket.id].y += SPEED
        break
      case 'KeyD':
        backEndPlayers[socket.id].x += SPEED
        break
    }
  })

  console.log(backEndPlayers)
})

setInterval(() => {
  io.emit('updatePlayers', backEndPlayers)
}, 15)

//404 page
app.use((req, res) => {
  res.status(400).render('404')
})

server.listen(port, () => {
  console.log(`server is listening on port ${port}`)
})
