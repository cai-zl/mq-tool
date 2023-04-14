import {BaseEntity} from "typeorm";
import {Socket} from "socket.io";
import {ModelOption} from "./option";

/**
 * @author cai zl
 * @since 2023/4/7 11:01
 */
// MqEntity mq服务的基础字段
export interface MqEntity {
    id: number
    name: string
    host: string
    port: number
}

// MqOption mq服务的基本操作事件名
export enum MqOption {
    CONSUMER_EVENT = "consumer",
    CONNECT = "connect",
    CONSUMER = "consumer",
    STOP_CONSUMER = "stopConsumer",
    PRODUCER = "producer",

}

// Closeable 可关闭
export interface Closeable {

    close(): void;
}

// ConsumerInfo 消费参数
export interface ConsumerInfo {
    topic: string
    groupId: string
    type: number
}

// ProducerInfo 生产参数
export interface ProducerInfo {
    topic: string
    key: string
    value: string
}

// Handler 处理程序接口
export interface Handler<T extends BaseEntity> {

    /**
     * handle 处理
     * @param event 事件名称
     * @param socket socket对象
     */
    handle(event: string, socket: Socket): void;

    /**
     * list 列表
     * @param option 操作名称
     * @param entity orm实体
     * @param callback 回调函数
     */
    list(option: string, entity: T, callback: Function): void;

    /**
     * save 添加
     * @param option 操作名称
     * @param entity orm实体
     * @param callback 回调函数
     */
    save(option: string, entity: T, callback: Function): void;

    /**
     * update 修改
     * @param option 操作名称
     * @param entity orm实体
     * @param callback 回调函数
     */
    update(option: string, entity: T, callback: Function): void;

    /**
     * delete 删除
     * @param option 操作名称
     * @param entity orm实体
     * @param callback 回调函数
     */
    delete(option: string, entity: T, callback: Function): void;
}

// MqHandler MQ处理程序接口
export interface MqHandler<T extends BaseEntity> {

    // connect 连接mq服务
    connect(option: string, entity: T, callback: Function): void

    // consumer 消费
    consumer(option: string, consumerInfo: ConsumerInfo, callback: Function): void

    // producer 生产
    producer(option: string, producerInfo: ProducerInfo, callback: Function): void

}

// Handle 处理函数
export type Handle = (option: string, arg: any, callback: Function) => void

/**
 * 抽象处理程序
 * 使用模版方法模式
 */
export abstract class BaseHandler<T extends BaseEntity> implements Handler<T>, MqHandler<T> {

    // Socket socket
    protected socket: Socket
    // handles 处理程序集
    private handles: Map<string, Handle> = new Map<string, Handle>()

    protected constructor(socket: Socket) {
        this.socket = socket;
        // 注册基础的mq服务处理策略
        this.registry(ModelOption.LIST, this.list)
        this.registry(ModelOption.SAVE, this.save)
        this.registry(ModelOption.UPDATE, this.update)
        this.registry(ModelOption.DELETE, this.delete)
        this.registry(MqOption.CONNECT, this.connect)
        this.registry(MqOption.CONSUMER, this.consumer)
        this.registry(MqOption.PRODUCER, this.producer)
        // 扩展其他处理策略
        this.doRegistry()
    }

    handle(event: string, socket: Socket) {
        socket.on(event, (option, arg, callback) => {
            const h = this.handles.get(option);
            if (h !== undefined) {
                h(option, arg, callback)
            }
        })
    }

    protected registry(option: string, handle: Handle) {
        this.handles.set(option, handle)
    }

    protected abstract doRegistry(): void;

    abstract delete(option: string, entity: T, callback: Function): void;

    abstract list(option: string, entity: T, callback: Function): void;

    abstract save(option: string, entity: T, callback: Function): void;

    abstract update(option: string, entity: T, callback: Function): void;

    abstract connect(option: string, entity: T, callback: Function): void

    abstract consumer(option: string, consumerInfo: ConsumerInfo, callback: Function): void

    abstract producer(option: string, producerInfo: ProducerInfo, callback: Function): void
}

