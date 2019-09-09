import { DynamoDB } from 'aws-sdk'
import { get } from 'lodash'
import Serverless from 'serverless'
import { DynamoDbMigrator, getTablesFromResources, IMigratorConfig } from './utils'

module.exports = class SfDeploymentEcr {
  private readonly serverless: Serverless
  private readonly config: IMigratorConfig

  private readonly commands: any
  private readonly hooks: any

  private migrator: DynamoDbMigrator

  constructor(serverless: Serverless) {
    this.serverless = serverless
    this.config = Object.assign(
      {
        endpoint: 'http://127.0.0.1:8000'
      },
      get(this.serverless.service, 'custom.dynamodb-migrator', {})
    )

    this.commands = {
      'dynamodb-migrator': {
        usage: 'The migration commands for your local DynamoDB instance',
        commands: {
          migrate: {
            usage: 'Start a migration from your resources',
            lifecycleEvents: ['migrate']
          }
        }
      }
    }

    this.hooks = {
      'dynamodb-migrator:migrate:migrate': () => this.runMigration()
    }
  }

  private async runMigration(): Promise<void> {
    return this.getDynamoDbMigrator().migrate(this.getProjectTables())
  }

  private getDynamoDbMigrator(): DynamoDbMigrator {
    if (!this.migrator) {
      this.migrator = new DynamoDbMigrator(
        { endpoint: this.config.endpoint, region: this.getRegion() },
        this.serverless.cli
      )
    }

    return this.migrator
  }

  private getProjectTables(): DynamoDB.CreateTableInput[] {
    const projectResources = get(this.serverless.service, 'resources.Resources', {})
    return getTablesFromResources(projectResources)
  }

  private getRegion(): string {
    return get(this.serverless, ['service', 'provider', 'region'], process.env.AWS_DEFAULT_REGION)
  }
}
