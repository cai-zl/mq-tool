/**
 * @author cai zl
 * @since 2023/4/3 10:28
 */
import "reflect-metadata"
import {DataSource} from "typeorm"
import {APP_DATA, APP_NAME} from "../main";
import {KafkaEntity} from "../services/entity/kafka.entity";
import {RabbitEntity} from "../services/entity/rabbit.entity";

const DB_FILE: string = "datasource.db"
const dataSource = new DataSource({
    type: "sqlite",
    database: APP_DATA + "/" + APP_NAME + "/" + DB_FILE,
    entities: [KafkaEntity,RabbitEntity],
    synchronize: true,
    logging: false,
})

dataSource.initialize()
    .then(() => {

    })
    .catch((error) => console.log(error))

export {
    dataSource
}
