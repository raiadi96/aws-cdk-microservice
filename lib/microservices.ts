import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { join } from "path";
import { ITable } from "aws-cdk-lib/aws-dynamodb/index.js";


interface SwnConstructProps{
    orderTable: ITable;
    productTable: ITable;
    basketTable: ITable;
}
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

  createBasketFunction(basketTable: ITable): NodejsFunction {
    const nodeJsFunctionProps:NodejsFunctionProps ={
      bundling: {
       externalModules: ['aws-sdk']
    },
    environment: {
      PRIMARY_KEY: 'userName',
      TABLE_NAME: basketTable.tableName
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