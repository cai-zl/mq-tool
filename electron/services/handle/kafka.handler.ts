import {Consumer, Kafka} from "kafkajs";
import {BaseHandler, Closeable} from "../common/common.handler";
import {Socket} from "socket.io";
import {KafkaEntity} from "../entity/kafka.entity";

/**
 * @author cai zl
 * @since 2023/3/29 19:12
 */
interface ConsumerInfo {
    topic: string
    groupId: string
    type: number
}

interface ProducerInfo {
    topic: string
    key: string
    value: string
}

export class KafkaHandler extends BaseHandler<KafkaEntity> implements Closeable {

    private static INSTANCE: KafkaHandler
    private active: Consumer
    private client: Kafka
    private name: string
    private host: string
    private port: number

    // 单例
    private constructor(socket: Socket) {
        super(socket)
    }

    static getInstance(socket: Socket): KafkaHandler {
        if (this.INSTANCE === undefined) {
            this.INSTANCE = new KafkaHandler(socket)
        }
        return this.INSTANCE
    }

    doRegistry() {
        super.registry(KafkaOption.CONNECT, (option, arg, callback) => {
            this.connect(arg, callback)
        })
        super.registry(KafkaOption.CONSUMER, (option, arg, callback) => {
            this.consumer(arg, callback)
        })
        super.registry(KafkaOption.STOP_CONSUMER, (option, arg, callback) => {
            this.close()
        })
        super.registry(KafkaOption.PRODUCER, (option, arg, callback) => {
            this.producer(arg as unknown as ProducerInfo, callback)
        })
    }

    close() {
        if (this.active !== null) {
            this.active.disconnect()
                .then(() => {
                    console.log("关闭成功")
                })
                .catch((reason) => {
                    console.log("关闭失败: ", reason)
                })
        }
    }

    private producer(producerInfo: ProducerInfo, callback: Function) {
        const producer = this.client.producer();
        producer.connect().then(() => {
            producer.send({
                topic: producerInfo.topic,
                messages: [
                    {key: producerInfo.key, value: producerInfo.value},
                ],
            }).then()
        })
    }

    private consumer(consumerInfo: ConsumerInfo, callback: Function) {
        const consumer = this.client.consumer({groupId: consumerInfo.groupId});
        consumer.connect().then(() => {
            this.active = consumer
            consumer.subscribe({topic: consumerInfo.topic, fromBeginning: true}).then(() => {
                consumer.run({
                    eachMessage: async ({topic, partition, message, heartbeat, pause}) => {
                        this.socket.emit(KafkaOption.CONSUMER_EVENT, message.key!.toString(), message.value!.toString())
                    },
                }).then(r => {
                    if (r !== null) {
                        console.log(r);
                    }
                })
            })
        })
    }

    private connect(entity: KafkaEntity, callback: Function) {
        if (this.name !== entity.name || this.host !== entity.host || this.port !== entity.port) {
            this.client = new Kafka({
                clientId: entity.name,
                brokers: [entity.host.concat(':').concat(entity.port.toString())],
            })
        }
        this.name = entity.name
        this.host = entity.host
        this.port = entity.port
        const admin = this.client.admin();
        admin.connect().then(() => {
            admin.listTopics().then((r: string[]) => {
                callback(r.filter((value) => {
                        return !value.includes('offsets')
                    }
                ))
                admin.disconnect()
                    .then(() => {
                        console.log('kafka-admin关闭成功')
                    })
                    .catch((reason) => {
                        console.log('kafka-admin关闭失败: ', reason)
                    })
            })
        }).catch((reason) => {
            console.log('kafka连接失败: ', reason)
        })
    }

    list(option: string, entity: KafkaEntity, callback: Function) {
        KafkaEntity.find().then((value) => {
            callback(value)
        })
    }

    save(option: string, entity: KafkaEntity, callback: Function) {
        KafkaEntity.delete({
            name: entity.name
        }).then(() => {
            KafkaEntity.save(entity).then(() => {
                callback(true)
            })
        })
    }

    update(option: string, entity: KafkaEntity, callback: Function) {
        KafkaEntity.save(entity).then(() => {
            callback(true)
        })
    }

    delete(option: string, entity: KafkaEntity, callback: Function) {
        KafkaEntity.delete({
            id: entity.id
        }).then(() => {
            callback(true)
        })
    }

}

export enum KafkaOption {

    EVENT = "kafka",
    CONSUMER_EVENT = "consumer",
    CONNECT = "connect",
    CONSUMER = "consumer",
    STOP_CONSUMER = "stopConsumer",
    PRODUCER = "producer",

}

