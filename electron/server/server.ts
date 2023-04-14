import {Server, Socket} from "socket.io";
import {KafkaHandler, KafkaOption} from "../services/handle/kafka.handler";

const io = new Server(3000, {
    cors: {
        origin: "*"
    }
})

io.on("connection", (socket:Socket) => {
    KafkaHandler.getInstance(socket).handle(KafkaOption.EVENT, socket)
})

