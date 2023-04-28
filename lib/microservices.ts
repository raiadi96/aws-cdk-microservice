import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { join } from "path";
import { ITable } from "aws-cdk-lib/aws-dynamodb/index.js";

/*
constructor props for mapping tables to Lambda Function.
*/
interface SwnConstructProps{
    orderTable: ITable;
    productTable: ITable;
    basketTable: ITable;
}
/*
Construct for creating Lambda Functions.
*/
export class SwnMicroServicesConstruct extends Construct{

    public readonly ProductFunction: NodejsFunction;
    public readonly BasketFunction: NodejsFunction;
    public readonly OrderFunction: NodejsFunction;

    constructor(scope: Construct, id: string, props: SwnConstructProps){
        super(scope, id);

        this.ProductFunction = this.createProductFunction(props.productTable);
        this.BasketFunction = this.createBasketFunction(props.basketTable);
        this.OrderFunction = this.createOrderFunction(props.orderTable);
    }
   
  /*
  Code for creating Order Lambda Function.
  DynamoDB Table:  Product
  Function Implementation code: src/order/index.js
  */  
  createOrderFunction(orderTable: ITable): NodejsFunction {
    const nodeJsFunctionProps:NodejsFunctionProps ={
      bundling: {
       externalModules: ['aws-sdk']
    },
    environment: {
      PRIMARY_KEY: 'userName',
      SORT_KEY: 'orderDate',
      TABLE_NAME: orderTable.tableName
    },
    runtime: Runtime.NODEJS_14_X
  }

     const OrderFunction = new NodejsFunction(
      this,
      'OrderFunction', 
      {
        entry:join(__dirname, '../src/order/index.js'),
        ...nodeJsFunctionProps
      }
    );
    
    orderTable.grantReadWriteData(OrderFunction);
    return OrderFunction;  
  }

  /*
  Code for creating Basket Lambda Function.
  DynamoDB Table:  Basket
  Function Implementation code: src/basket/index.js
  */
  createBasketFunction(basketTable: ITable): NodejsFunction {
    const nodeJsFunctionProps:NodejsFunctionProps ={
      bundling: {
       externalModules: ['aws-sdk']
    },
    environment: {
      PRIMARY_KEY: 'userName',
      TABLE_NAME: basketTable.tableName,
      EVENT_SOURCE : "com.swn.basket.checkoutBasket",
      EVENT_DETAILTYPE : "CheckoutBasket",
      EVENT_BUS_NAME : "swn-event-bus"
    },
    runtime: Runtime.NODEJS_14_X
  }

     const BasketFunction = new NodejsFunction(
      this,
      'BasketFunction', 
      {
        entry:join(__dirname, '../src/basket/index.js'),
        ...nodeJsFunctionProps
      }
    );
    
    basketTable.grantReadWriteData(BasketFunction);
    return BasketFunction;  
  }

  /*
    Code for creating Product Lambda Function.
    DynamoDB Table:  Product
    Function Implementation code: src/product/index.js
  */
  createProductFunction(productTable:ITable): NodejsFunction {
    const nodeJsFunctionProps:NodejsFunctionProps ={
      bundling: {
       externalModules: ['aws-sdk']
    },
    environment: {
      PRIMARY_KEY: 'id',
      TABLE_NAME: productTable.tableName
    },
    runtime: Runtime.NODEJS_14_X
  }

     const ProductFunction = new NodejsFunction(
      this,
      'ProductFunction', 
      {
        entry:join(__dirname, '../src/product/index.js'),
        ...nodeJsFunctionProps
      }
    );
    
    productTable.grantReadWriteData(ProductFunction);
    return ProductFunction;
  }

}