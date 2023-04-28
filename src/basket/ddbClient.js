import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
//Initialise Dynamo DB Client for easy access
const ddbClient = new DynamoDBClient({region: "us-east-1"});
export default ddbClient;