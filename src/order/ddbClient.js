import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
export const ddbClient = new DynamoDBClient({region: "us-east-1"});