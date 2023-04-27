import {ddbClient} from "./ddbClient.js";
import { PutItemCommand, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

exports.handler = async (event) => {
    console.log("Received Request", JSON.stringify(event, null, 2));
    const eventType = event['event-detail'];
    if(event.Records != null){
        await sqsInvocation(event);
    }
    // This is no longer implemented as we have moved to Topic Queue Chaining,
    // Target function of Backet Checkout microservice is now invoked by SQS
    // else if(event['event-detail'] != undefined){
    //     await eventBridgeInvocation(event);
    // }
    else{
        await apiGatewayInvocation(event);
    }
};

async function apiGatewayInvocation(event)
{
    console.log("Received Request for API gateway invocation", event);
    try
    {
        let body = {}
        switch(event.httpMethod){
            case "GET":
                if(event.pathParameters != nulls){
                    body = await getOrder(event);
                }
                else{
                    body = await getAllOrders(event);
                }
                break;
            default:
                console.log("Unsupported method + " + event.httpMethod);
                throw new Error("Unsupported method + " + event.httpMethod);   
            }
        return {
            statusCode: 200,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        }
    }
    catch(err)
    {
        console.log("Error Occurred at Order Service", err);
        return {
            statusCode: 500,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(err)
        }
    }
}

async function getOrder(event)
{
    console.log("Received Request for Get Order", event);
    try
    {
        const userName = event.pathParameters.userName;
        const orderDate = event.queryStringParameters.orderDate;

        const params = {
            KeyConditionExpression: "userName = :userName and orderDate = :orderDate",
            ExpressionAttributeValues: {
                ":userName": { S: userName },
                ":orderDate": { S: orderDate }
            },
            TableName: process.env.TABLE_NAME
        }

        const {Items} = await ddbClient.send(new QueryCommand(params))
        console.log("Received Response from GetOrder", Items);
    return Items.map((item) => unmarshall(item));
  } catch(e) {
    console.error(e);
    throw e;
  }
}

async function getAllOrders(event){
    console.log("Received Request for GetAllOrders", event);
    try{
        const params =
        {
            TableName: process.env.TABLE_NAME
        }
        const {Items} = await ddbClient.send(new ScanCommand(params))
        console.log("Received Response from GetAllOrders", Items);
        return Items.map((item) => unmarshall(item));
    }
    catch(e){
        console.error(e);
        throw e;
    }
}

async function eventBridgeInvocation(event)
{
    console.log("Received Request for Event Bridge invocation", event);

    try
    {
        await createOrder(event);
    }
    catch(err)
    {
        console.log("Error Occurred at Order Service", err);
        throw err;
    }
}

async function createOrder(event)
{
console.log("Received Request for Create Order", event);
try{
    const orderDate = new Date().toISOString();
    event.orderDate = orderDate;
    console.log("Received Request for Create Order", event);
    const params = {
        TableName: process.env.TABLE_NAME,
        Item: marshall(event || {})
    };

    const message = await ddbClient.send(new PutItemCommand(params));
    console.log("Received Response from CreateOrder", message);
    return message;
}
catch(err)
{
    console.error("Error received in Create Order",err);
    throw err;
}
}

async function sqsInvocation(event){
    console.log("Received Request for SQS invocation", event);
    for(const record of event.Records){
        console.log("Received Record", record);
        const body = JSON.parse(record.body);
        await createOrder(body.detail)
            .then((data) => {console.log("Order Created", data);})
            .catch((err) => {console.log("Error Occurred", err);})
    }
}