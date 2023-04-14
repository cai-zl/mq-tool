/**
 * @author cai zl
 * @since 2023/4/10 13:55
 */

export enum KafkaOption {

    EVENT = "kafka",
    CONSUMER_EVENT = "consumer",
    CONNECT = "connect",
    CONSUMER = "consumer",
    STOP_CONSUMER = "stopConsumer",
    PRODUCER = "producer",

}

export class KafkaEntity {
    id?: number
    name?: string
    host?: string
    port?: number
    topics?: string[]
}

export class KMessage {
    readonly key: string
    readonly value: string

    constructor(key: string, value: string) {
        this.key = key;
        this.value = value;
    }

    build(): string {
        return this.key.concat(": ").concat(this.value)
    }
}

export interface ConsumerInfo {
    topic: string
    groupId: string
    type: number
}

export interface ProducerInfo{
    topic: string,
    key: string,
    value: string
}
