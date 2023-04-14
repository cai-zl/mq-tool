import {BaseHandler, Closeable, ConsumerInfo, MqOption, ProducerInfo} from "../common/common.handler";
import {RabbitEntity} from "../entity/rabbit.entity";
import {Socket} from "socket.io";

/**
 * @author cai zl
 * @since 2023/4/14 19:22
 */
export class RabbitHandler extends BaseHandler<RabbitEntity> implements Closeable {
    private static INSTANCE: RabbitHandler
    private name: string
    private host: string
    private port: number

    private constructor(socket: Socket) {
        super(socket);
    }

    static getInstance(socket: Socket): RabbitHandler {
        if (this.INSTANCE === undefined) {
            this.INSTANCE = new RabbitHandler(socket)
        }
        return this.INSTANCE
    }

    connect(option: string, entity: RabbitEntity, callback: Function): void {
    }

    consumer(option: string, consumerInfo: ConsumerInfo, callback: Function): void {
    }

    protected doRegistry(): void {
        super.registry(MqOption.STOP_CONSUMER, (option, arg, callback) => {
            this.close()
        })
    }

    producer(option: string, producerInfo: ProducerInfo, callback: Function): void {
    }

    close(): void {
    }

    list(option: string, entity: RabbitEntity, callback: Function) {
        RabbitEntity.find().then((value) => {
            callback(value)
        })
    }

    save(option: string, entity: RabbitEntity, callback: Function) {
        RabbitEntity.delete({
            name: entity.name
        }).then(() => {
            RabbitEntity.save(entity).then(() => {
                callback(true)
            })
        })
    }

    update(option: string, entity: RabbitEntity, callback: Function) {
        RabbitEntity.save(entity).then(() => {
            callback(true)
        })
    }

    delete(option: string, entity: RabbitEntity, callback: Function) {
        RabbitEntity.delete({
            id: entity.id
        }).then(() => {
            callback(true)
        })
    }

}
