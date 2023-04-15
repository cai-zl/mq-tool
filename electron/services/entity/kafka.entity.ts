import {Entity, Column, PrimaryGeneratedColumn, BaseEntity} from "typeorm"
import {MqEntity} from "../common/common.handler";

@Entity({name: 'kafka'})
export class KafkaEntity extends BaseEntity implements MqEntity {
    @PrimaryGeneratedColumn()
    id: number
    @Column({type: 'text'})
    name: string
    @Column({type: 'text'})
    host: string
    @Column({type: 'int'})
    port: number
}

