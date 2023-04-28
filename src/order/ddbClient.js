import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
//Initlialize DynamoDB Client
export const ddbClient = new DynamoDBClient({region: "us-east-1"});