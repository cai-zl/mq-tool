import {BaseEntity} from "typeorm";
import {Socket} from "socket.io";
import {ModelOption} from "./option";

/**
 * @author cai zl
 * @since 2023/4/7 11:01
 */
export interface Closeable {

    close(): void;
}

// Handler 处理程序接口
export interface Handler<T extends BaseEntity> {

    doRegistry(): void;

    handle(event: string, socket: Socket): void;

    list(option: string, entity: T, callback: Function): void;

    save(option: string, entity: T, callback: Function): void;

    update(option: string, entity: T, callback: Function): void;

    delete(option: string, entity: T, callback: Function): void;
}

export type Handle = (option: string, arg: any, callback: Function) => void

/**
 * 抽象处理程序
 * 使用模版方法模式
 */
export abstract class BaseHandler<T extends BaseEntity> implements Handler<T> {

    protected socket: Socket
    private handles: Map<string, Handle> = new Map<string, Handle>()

    protected constructor(socket: Socket) {
        this.socket = socket;
        this.registry(ModelOption.LIST, this.list)
        this.registry(ModelOption.SAVE, this.save)
        this.registry(ModelOption.UPDATE, this.update)
        this.registry(ModelOption.DELETE, this.delete)
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

    abstract doRegistry(): void;

    abstract delete(option: string, entity: T, callback: Function): void;

    abstract list(option: string, entity: T, callback: Function): void;

    abstract save(option: string, entity: T, callback: Function): void;

    abstract update(option: string, entity: T, callback: Function): void;
}

