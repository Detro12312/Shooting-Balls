const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()

const scoreEl = document.querySelector('#scoreEl')

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = window.innerWidth * devicePixelRatio
canvas.height = window.innerHeight * devicePixelRatio

const x = canvas.width / 2
const y = canvas.height / 2

const frontEndPlayers = {}

socket.on('updatePlayers', (bacEndPlayers) => {
  for (const id in bacEndPlayers) {
    const bacEndPlayer = bacEndPlayers[id]

    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({
        x: bacEndPlayer.x,
        y: bacEndPlayer.y,
        radius: 10,
        color: bacEndPlayer.color
      })
    } else {
      if (id === socket.id) {
        //for our player
        //if a player already exists
        frontEndPlayers[id].x = bacEndPlayer.x
        frontEndPlayers[id].y = bacEndPlayer.y

        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return bacEndPlayer.sequenceNumber === input.sequenceNumber
        })

        if (lastBackendInputIndex > -1) {
          playerInputs.splice(0, lastBackendInputIndex + 1)
        }

        playerInputs.forEach((input) => {
          frontEndPlayers[id].x += input.dx
          frontEndPlayers[id].y += input.dy
        })
      } else {
        //for other players
        // frontEndPlayers[id].x = bacEndPlayer.x
        // frontEndPlayers[id].y = bacEndPlayer.y

        gsap.to(frontEndPlayers[id], {
          x: bacEndPlayer.x,
          y: bacEndPlayer.y,
          duration: 0.015,
          ease: 'linaer'
        })
      }
    }
  }

  for (const id in frontEndPlayers) {
    if (!bacEndPlayers[id]) {
      delete frontEndPlayers[id]
    }
  }
})

let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  for (const id in frontEndPlayers) {
    const fontEndPlayer = frontEndPlayers[id]
    fontEndPlayer.draw()
  }
}

animate()

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}
let SPEED = 6
const playerInputs = []
let sequenceNumber = 0
setInterval(() => {
  if (keys.w.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED })
    frontEndPlayers[socket.id].y -= SPEED
    socket.emit('keydown', { keyCode: 'KeyW', sequenceNumber })
  }
  if (keys.a.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: -SPEED, dy: 0 })
    frontEndPlayers[socket.id].x -= SPEED
    socket.emit('keydown', { keyCode: 'KeyA', sequenceNumber })
  }
  if (keys.s.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: SPEED })
    frontEndPlayers[socket.id].y += SPEED
    socket.emit('keydown', { keyCode: 'KeyS', sequenceNumber })
  }
  if (keys.d.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 })
    frontEndPlayers[socket.id].x += SPEED
    socket.emit('keydown', { keyCode: 'KeyD', sequenceNumber })
  }
}, 15)

addEventListener('keydown', (event) => {
  if (!frontEndPlayers[socket.id]) return
  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = true
      break
    case 'KeyA':
      keys.a.pressed = true
      break
    case 'KeyS':
      keys.s.pressed = true
      break
    case 'KeyD':
      keys.d.pressed = true
      break
  }
})

addEventListener('keyup', (event) => {
  if (!frontEndPlayers[socket.id]) return
  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = false
      break
    case 'KeyA':
      keys.a.pressed = false
      break
    case 'KeyS':
      keys.s.pressed = false
      break
    case 'KeyD':
      keys.d.pressed = false
      break
  }
})
