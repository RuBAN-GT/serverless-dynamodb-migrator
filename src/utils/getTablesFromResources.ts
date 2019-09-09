import { ConfigService } from 'aws-sdk'
import { DynamoDB } from 'aws-sdk'
import { omit, values } from 'lodash'

interface IResources {
  [key: string]: {
    Type: string
    Properties: any
  }
}

const DYNAMODB_TABLE_TYPE: ConfigService.ResourceType = 'AWS::DynamoDB::Table'

export function getTablesFromResources(resources: IResources): DynamoDB.CreateTableInput[] {
  return values(resources)
    .filter(item => item.Type === DYNAMODB_TABLE_TYPE)
    .map(resource => mapCloudFormationTemplate(resource.Properties))
}

// @TODO Map specific params for skipped attributes
function mapCloudFormationTemplate(tableDef: any): DynamoDB.CreateTableInput {
  return omit(tableDef, [
    'BillingMode',
    'PointInTimeRecoverySpecification',
    'SSESpecification',
    'Tags',
    'TimeToLiveSpecification'
  ]) as DynamoDB.CreateTableInput
}
