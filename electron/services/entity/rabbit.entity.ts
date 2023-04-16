/**
 * @author cai zl
 * @since 2023/4/14 19:21
 */
import {Entity, Column, PrimaryGeneratedColumn, BaseEntity} from "typeorm"
import {MqEntity} from "../common/common.handler";

@Entity({name: 'rabbit'})
export class RabbitEntity extends BaseEntity implements MqEntity {
    @PrimaryGeneratedColumn()
    id: number
    @Column({type: 'text'})
    name: string
    @Column({type: 'text'})
    host: string
    @Column({type: 'int'})
    port: number
    @Column({type: 'text'})
    username: string
    @Column({type: 'text'})
    password: string

    get url() {
        return "amqp://" + this.username + ":" + this.password + "@" + this.host + ":" + this.port
    }

}

