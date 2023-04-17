import {BaseHandler, Closeable, ConsumerInfo, MqOption, ProducerInfo} from "../common/common.handler";
import {RabbitEntity} from "../entity/rabbit.entity";
import {Socket} from "socket.io";
import {AMQPClient, AMQPConsumer} from '@cloudamqp/amqp-client'
import {AMQPBaseClient} from "@cloudamqp/amqp-client/types/amqp-base-client";

/**
 * @author cai zl
 * @since 2023/4/14 19:22
 */
export class RabbitHandler extends BaseHandler<RabbitEntity> implements Closeable {
    private static INSTANCE: RabbitHandler
    private name: string
    private host: string
    private port: number
    private username: string
    private password: string
    private client: AMQPClient
    private baseClient: AMQPBaseClient
    private active: AMQPConsumer

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
        this.client = new AMQPClient( "amqp://" + entity.username + ":" + entity.password + "@" + entity.host + ":" + entity.port)
        this.name = entity.name
        this.host = entity.host
        this.port = entity.port
        this.username = entity.username
        this.password = entity.password
        this.client.connect().then((conn) => {
            this.baseClient = conn
        }).catch((reason) => {
            console.log('连接失败: ', reason)
        })
    }

    consumer(option: string, consumerInfo: ConsumerInfo, callback: Function): void {
        this.baseClient.channel().then((ch) => {
            ch.queue(consumerInfo.topic).then((q) => {
                q.subscribe({noAck: true}, (msg) => {
                    this.socket.emit(MqOption.CONSUMER, '', msg.bodyToString())
                }).then((value) => {
                    this.active = value
                })
            })
        })
    }

    protected doRegistry(): void {
        super.registry(MqOption.STOP_CONSUMER, (option, arg, callback) => {
            this.close()
        })
    }

    producer(option: string, producerInfo: ProducerInfo, callback: Function): void {
        this.baseClient.channel().then((ch) => {
            ch.queue(producerInfo.topic).then((q) => {
                q.publish(producerInfo.value, {deliveryMode: 2})
                    .then(() => {
                        console.log('发送成功')
                    })
            })
        })
    }

    close(): void {
        if (this.active != undefined) {
            this.active.cancel().then(() => {
                console.log('消费停止成功')
            }).catch((reason) => {
                console.log('消费停止失败')
            })
        }
        // if (this.baseClient != undefined) {
        //     this.baseClient.close().then(() => {
        //         console.log('amqp客户端关闭成功')
        //     }).catch((reason) => {
        //         console.log('amqp客户端关闭失败')
        //     })
        // }
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
