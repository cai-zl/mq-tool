/**
 * @author cai zl
 * @since 2023/4/6 15:38
 */

export const REGEX_IP = /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/

export class MqEntity {
    id?: number
    name?: string
    host?: string
    port?: number
    topics?: string[]
}

export class Message {
    readonly key: string
    readonly value: string

    constructor(key: string, value: string) {
        this.key = key;
        this.value = value;
    }

}

export enum ServerOption {
    PLACEHOLDER = "",

    CONSUMER_EVENT = "consumer",
    CONNECT = "connect",
    CONSUMER = "consumer",
    STOP_CONSUMER = "stopConsumer",
    PRODUCER = "producer",

}

export enum ModelOption {
    LIST = "list",
    ONE = "one",
    SAVE = "save",
    UPDATE = "update",
    DELETE = "delete",
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
