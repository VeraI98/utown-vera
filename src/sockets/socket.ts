import { io } from 'socket.io-client'

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  'https://utown-api.habsida.net'

const TOKEN_KEY = 'token'

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: (callback) => {
    callback({
      token: localStorage.getItem(TOKEN_KEY),
    })
  },
})

export function connectSocket() {
  const token = localStorage.getItem(TOKEN_KEY)

  if (!token) {
    return
  }

  if (socket.connected) {
    return
  }

  socket.connect()
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect()
  }
}
