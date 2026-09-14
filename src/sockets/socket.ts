import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL

if (!SOCKET_URL) {
  throw new Error('VITE_SOCKET_URL is not defined')
}

export const socket = io(SOCKET_URL, {
  autoConnect: false,
})
