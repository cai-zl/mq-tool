import {Server, Socket} from "socket.io";
import {KafkaHandler} from "../services/handle/kafka.handler";
import {RabbitHandler} from "../services/handle/rabbit.handler";
import {RabbitEntity} from "../services/entity/rabbit.entity";
import {MqOption} from "../services/common/common.handler";

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
    const rabbitHandler = RabbitHandler.getInstance(socket);
    rabbitHandler.handle(Event.RABBIT, socket)
    const rabbitEntity = new RabbitEntity();
    rabbitEntity.name = "dev"
    rabbitEntity.host = "127.0.0.1"
    rabbitEntity.port = 5672
    rabbitEntity.username = 'admin'
    rabbitEntity.password = '123456'
    rabbitHandler.connect( MqOption.CONNECT,rabbitEntity,()=>{})
    socket.emit(Event.RABBIT, MqOption.CONNECT, rabbitEntity,()=>{})
})

