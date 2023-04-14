import {Server, Socket} from "socket.io";
import {KafkaHandler} from "../services/handle/kafka.handler";
import {RabbitHandler} from "../services/handle/rabbit.handler";

enum Event {
    KAFKA = "kafka",
    RABBIT = "rabbit",
}

const io = new Server(3000, {
    cors: {
        origin: "*"
    }
})

io.on("connection", (socket: Socket) => {
    KafkaHandler.getInstance(socket).handle(Event.KAFKA, socket)
    RabbitHandler.getInstance(socket).handle(Event.RABBIT, socket)
})

