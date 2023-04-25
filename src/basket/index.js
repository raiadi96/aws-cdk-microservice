import ddbClient from "./ddbClient.js";
import { GetItemCommand, PutItemCommand, ScanCommand, QueryCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { request } from "http";
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
import { v4 as uuidv4 } from 'uuid';

exports.handler = async (event) => {
    // Your code here
    console.log("Received Request", JSON.stringify(event, null, 2));
    try{

        /*
            basket microservice api gateway
            root name = basket
            GET /basket
            POST /basket
            POST /basket/checkout

            GET /basket/{userName}
            DELETE /basket/{userName}
          */

        let body = {}
        switch(event.httpMethod){
            case "GET":
                if(event.pathParameters != null){
                    body = await getBasketByUserName(event.pathParameters.userName);
                }
                else{
                    body = await getAllBaskets();
                }
                break;
            case "POST":
                if(event.path == "/basket/checkout"){
                    body = await checkoutBasket(JSON.parse(event));
                }
                else
                    body = await createBasket(JSON.parse(event));
                break;
            case "DELETE":
                body = await deleteBasketByUserName(event.pathParameters.userName);
                break;
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
            
        }
        console.log("Response received from Basket Service", body);
        return {
            statusCode: 200,
            headers: {"content-type": "application/json"},
            body: JSON.stringify({
            message:   `Basket Service Response: ${JSON.stringify(body)}`,
            }),
        };
    }
    catch(err){
        console.log("Error occured in Basket Service", err);
        return {
            statusCode: 500,
            headers: {"content-type": "application/json"},
            body: JSON.stringify({
            message:   `Basket Service Error: ${err}`,
            }),
        };
    }
}

const getBasketByUserName = async (userName) => {
    console.log("getBasketByUserName: ", userName);
    try{
        const params = {
            TableName: process.env.TABLE_NAME,
            Key: marshall({userName: userName})
        }
        const {Item} =  await ddbClient.send(new GetItemCommand(params));
        console.log("Received Response : getBasketByUserName: ", Item);
        return (Item) ? unmarshall(Item) : null;
    }
    catch(err){
        console.log("Error detected in getBasketByUserName: ", err);
        throw err;
    }
}

const getAllBaskets = async () => {
    console.log("Getting all Baskets");
    try{
        const params = {
            TableName: process.env.TABLE_NAME,
        }
        const {Items} =  await ddbClient.send(new ScanCommand(params));
        console.log("Received Response : getAllBaskets: ", Items);
        return (Items)?Items.map((item)=> unmarshall(item)):{}
    }
    catch(err){
        console.log("Error detected in getAllBaskets: ", err);
        throw err;
    }

}

const createBasket = async (basket) => {
    console.log("Creating Basket with data: ", basket);
    try{
        const requestBody = JSON.parse(event.body);
        requestBody.id = uuidv4();
        const params = {
            TableName: process.env.TABLE_NAME,
            Item: marshall(requestBody)
        }
        const message =  await ddbClient.send(new PutItemCommand(params));
        console.log("Received Response : createBasket: ", message);
        return message
    }
    catch{
        console.log("Error detected in createBasket: ", err);
        throw err;
    }
}

const deleteBasketByUserName = async (userName) => {
    console.log("deleteBasketByUserName: ", userName);
    try{
        const params = {
            TableName: process.env.TABLE_NAME,
            Key: marshall({userName: userName})
        }
        const message =  await ddbClient.send(new DeleteItemCommand(params));
        console.log("Received Response : deleteBasketByUserName: ", message);
        return message;

    }
    catch(err){
        console.log("Error detected in deleteBasketByUserName: ", err);
        throw err;
    }

}

const checkoutBasket = async (basket) => {

}