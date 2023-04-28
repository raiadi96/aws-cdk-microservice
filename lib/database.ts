import { AttributeType, BillingMode, ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib";

export class SwnConstruct extends Construct{

    // public properties for accessing the tables
    public readonly productTable: ITable;
    public readonly basketTable: ITable;
    public readonly orderTable: ITable;

    constructor(scope: Construct, id: string){
        super(scope, id);
        this.productTable = this.createProductTable();
        this.basketTable = this.createBasketTable();
        this.orderTable = this.createOrderTable();
    }


  /*
  Dynamo DB Table : Order
  PK: userName
  SK: orderDate
  Attributes : totalPrice, firstName, lastName
  */
  private createOrderTable(): ITable {
    return new Table(
      this, 'OrderTable', {
        partitionKey: { 
          name: 'userName', 
          type: AttributeType.STRING 
        },
        sortKey: {
          name:"orderDate",
          type: AttributeType.STRING
        },
        tableName: 'Order',
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        billingMode: BillingMode.PAY_PER_REQUEST
      }
    );
  }


  /*
  Dynamo DB Table : Basket
  PK: userName
  Attributes: dictionary of Items to be purchased
  {
    quantity,
    color,
    price,
    productName,
    productID
  }
  */
  private createBasketTable(): ITable {
          return new Table(
            this, 'BasketTable', {
              partitionKey: { name: 'userName', type: AttributeType.STRING },
              tableName: 'Basket',
              removalPolicy: cdk.RemovalPolicy.DESTROY,
              billingMode: BillingMode.PAY_PER_REQUEST
            }
          );
  }

  /*
  Dynamo DB Table : Product
  PK: id
  Attributes: productName, price, color, quantity
  */
    private createProductTable() : ITable{
      return new Table(
        this, 'ProductTable', {
          partitionKey: { name: 'id', type: AttributeType.STRING },
          tableName: 'Product',
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          billingMode: BillingMode.PAY_PER_REQUEST
        }
      );
    }
}
