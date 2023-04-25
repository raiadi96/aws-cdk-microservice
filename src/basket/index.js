import ddbClient from "./ddbClient.js";
import { GetItemCommand, PutItemCommand, ScanCommand, QueryCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { request } from "http";
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
import { v4 as uuidv4 } from 'uuid';
import eventBridgeClient from "./eventBridgeClient.js";

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
                    body = await checkoutBasket(event);
                }
                else
                    body = await createBasket(event);
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

const createBasket = async (event) => {
    console.log("Creating Basket with data: ", event);
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
    catch(err){
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

const checkoutBasket = async (event) => {
    console.log("checkoutBasket: ", event);
    const checkoutRequest = JSON.parse(event.body);
    if(checkoutRequest == null || checkoutRequest.userName == null)
        throw new Error("userName is required for checkout");
    try
    {
        const basket = await getBasketByUserName(checkoutRequest.userName);
        if(basket == null){
            throw new Error("Basket not found for userName: " + checkoutRequest.userName);
        }
        var checkoutPayload = preparePayload(checkoutRequest, basket);
        const publishEvent = await publishCheckoutEvent(checkoutPayload);
        await deleteBasket(checkoutRequest.userName);
    }
    catch(err){
        console.log("Error detected in checkoutBasket: ", err);
        throw err;
    }
}

const preparePayload = (checkoutRequest, basket) => {
    console.log("preparePayload: ", checkoutRequest, basket);
    try
    {
        if(basket == null || basket.items == null){
            throw new Error("Basket is empty for userName: " + checkoutRequest.userName);
        }

        //calculate total price
        var totalPrice = 0;
        basket.items.forEach(item => totalPrice = totalPrice + item.price);
        checkoutRequest.totalPrice = totalPrice;
        console.log("checkoutRequest: ", checkoutRequest);

        Object.assign(checkoutRequest, basket);
        console.log("Final Payload checkoutRequest: ", checkoutRequest);
        return checkoutRequest;
    }
    catch(err)
    {
        console.log("Error detected in preparePayload: ", err);
        throw err;
    }
}

const publishCheckoutEvent = async (checkoutPayload) => {
    console.log("publishCheckoutEvent: ", checkoutPayload);
    try{
        const params = {
            Entries: [{
            Source: process.env.EVENT_SOURCE,
            Detail: JSON.stringify(checkoutPayload),
            DetailType: process.env.EVENT_DETAILTYPE,
            Resources:[],
            EventBusName: process.env.EVENT_BUS_NAME
        },
        ],
    };
    const message =  await eventBridgeClient.send(new PutEventsCommand(params));
    console.log("Success, event sent; requestID:", message);
    return message;
    }
    catch(err){
        console.log("Error detected in publishCheckoutEvent: ", err);
    }
}