import io from "socket.io-client"

const socket = io.connect("http://localhost:8080" , {
  withCredentials: true
});

export default socket;