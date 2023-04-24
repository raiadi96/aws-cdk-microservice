const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
import { DeleteItemCommand, GetItemCommand , PutItemCommand, ScanCommand, UpdateItemCommand, QueryCommand} from "@aws-sdk/client-dynamodb";
import ddbClient from "./ddbClient";
import { v4 as uuidv4 } from 'uuid';

exports.handler = async (event) => {
    console.log('Received Request:', JSON.stringify(event, null, 2));
    let body = {}
    //TODO: switch case http routing for different http methods
    try{
        switch (event.httpMethod ) {
            case 'GET':
                console.log("Received GET Request");
                if(event.queryParameters != null){
                    console.log("Received GET Request with Query Parameters: ", event.queryParameters);
                    body = await getProductByQueryParameter(event);
                }
                else if(event.pathParameters != null){
                    console.log("Received GET Request with ID: ", event.pathParameters.id);
                    body = await getProductById(event.pathParameters.id);
                }
                else{
                    console.log("Received GET Request for all products");
                    body = await getAllProducts();
                }
                break;
            case 'POST':
                console.log("Received POST Request");
                body =  await createProduct(event);
                break;
            case 'DELETE':
                console.log("Received DELETE Request");
                body = await deleteProduct(event.pathParameters.id);
                break;
            case "PUT":
                console.log("Received PUT Request");
                body = await updateProduct(event);
                break;
            default:
                console.log("Received Unsupported Request");
                throw  new Error(`Unsupported method "${event.httpMethod}"`);
        }
        console.log("Received Response: ", body, "200");
        return {
            statusCode: 200,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                message: `Hello, Received Event from Path ${event.path}`,
                body: body}),
        }
    }
    catch(err){
    console.log("Error detected in handler: ", err);
    return{
        statusCode: 500,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ message: `Error detected in handler: ${err}`, 
                               errorstack: err.stack, 
                               errorMessage: err.message }),
    }
    }
};

const getProductById = async (productId) => {
    console.log("getProductById: ", productId);
    try{
        
        const params = {
            TableName: process.env.PRODUCT_TABLE,
            Key: marshall({id: productId})
        }
        const {data} =  await ddbClient.send(new GetItemCommand(params));
        console.log("Received Response : getProductById: ", data);
        return (data) ? unmarshall(data) : null;
    }
    catch(err){
        console.log("Error detected in getByProductId: ", err);
        throw err;
    }
}

const getAllProducts = async () => {
    console.log("getAllProducts");
    try{

        const params = {
            TableName: 'Product',
        }
        const {data} =  await ddbClient.send(new ScanCommand(params));
        console.log("Received Response : getAllProducts: ", data);
        if(data===null || data == undefined) return {}
        return data;

    }
    catch(err){
        console.log("Error detected in getAllProducts: ", err);
        throw err;
    }
}

const getProductByQueryParameter = async (event) => {
    console.log("getProductByQueryParameter: ", event);
    try{

        const productId = event.pathParameters.id;
        const catergory = event.queryStringParameters.catergory;

        const params = {
            TableName: process.env.PRODUCT_TABLE,
            KeyConditionExpression: "id = :productId",
            FilterExpression: "contains (catergory = :catergory)",
            ExpressionAttributeValues: {
                ":productId": productId,  
                ":catergory": catergory
            }
        };

        const {data} = await ddbClient.send(new QueryCommand(params));
        console.log("Received Response : getProductByQueryParameter: ", data);
        return (data) ? data.map((d) => unmarshall(d)) : null;
    }
    catch(err){
        console.log("Error detected in getProductByQueryParameter: ", err);
        throw err;
    }
}

const createProduct = async (event) => {
    console.log("createProduct: ", event);
    try{
        const requestBody = JSON.parse(event.body);
        requestBody.id = uuidv4();
        const params = {
            TableName: process.env.PRODUCT_TABLE,
            Item: requestBody? marshall(requestBody) : null
        };
        const {data} =  await ddbClient.send(new PutItemCommand(params));
        console.log("Received Response : createProduct: ", data);
        return (data) ? unmarshall(data) : null;

    }
    catch(err){
        console.log("Error detected in createProduct: ", err);
        throw err;
    }
}

const deleteProduct = async (productId) => {
    console.log("deleteProduct: ", productId);
    try{
        const params = {
            TableName: process.env.PRODUCT_TABLE,
            Key: marshall({id: productId})
        }
        const {data} =  await ddbClient.send(new DeleteItemCommand(params));
        console.log("Received Response : deleteProduct: ", data);
        return (data) ? unmarshall(data) : null;

    }
    catch(err){
        console.log("Error detected in deleteProduct: ", err);
        throw err;
    }
}

const updateProduct = async (event) => {
    console.log("updateProduct: ", event);
    try{
        const requestBody = JSON.parse(event.body);
    const objKeys = Object.keys(requestBody);
    console.log(`updateProduct function. requestBody : "${requestBody}", objKeys: "${objKeys}"`);    

    const params = {
      TableName: process.env.PRODUCT_TABLE,
      Key: marshall({ id: event.pathParameters.id }),
      UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
      ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
          ...acc,
          [`#key${index}`]: key,
      }), {}),
      ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
          ...acc,
          [`:value${index}`]: requestBody[key],
      }), {})),
    };

    const updateResult = await ddbClient.send(new UpdateItemCommand(params));

    console.log(updateResult);
    return updateResult;
    }
    catch(err){
        console.log("Error detected in updateProduct: ", err);
        throw err;
    }
}
