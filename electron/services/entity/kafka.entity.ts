import {Entity, Column, PrimaryGeneratedColumn, BaseEntity} from "typeorm"

@Entity({name: 'kafka'})
export class KafkaEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number
    @Column({type: 'text'})
    name: string
    @Column({type: 'text'})
    host: string
    @Column({type: 'int'})
    port: number
    topics: string[]

}

