import { DynamoDB } from 'aws-sdk'
import Bluebird = require('bluebird')

export interface IDynamoDbMigratorConfig {
  apiVersion?: string
  region?: string
  url: string
}

interface ILoggerDefinition {
  log(message: string): null
}

export class DynamoDbMigrator {
  private client: DynamoDB
  private logger: ILoggerDefinition

  constructor(clientConfig: DynamoDB.Types.ClientConfiguration, logger: ILoggerDefinition) {
    this.client = new DynamoDB(clientConfig)
    this.logger = logger
  }

  public async migrate(tables: DynamoDB.CreateTableInput[]): Promise<void> {
    this.logger.log('Start a migration process for DynamoDB')
    await Bluebird.each(tables, table => this.handleTable(table))
  }

  private async handleTable(table: DynamoDB.CreateTableInput): Promise<void> {
    this.logger.log(`Handle ${table.TableName}`)

    try {
      await this.client.createTable(table).promise()
    } catch (error) {
      if (error.code === 'ResourceInUseException') {
        this.logger.log(`Table ${table.TableName} already exists`)
        return
      }

      throw error
    }
  }
}
