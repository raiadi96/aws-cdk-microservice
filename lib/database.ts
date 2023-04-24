import { AttributeType, BillingMode, ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib";

export class SwnConstruct extends Construct{

    public readonly productTable: ITable;
    public readonly basketTable: ITable;
    constructor(scope: Construct, id: string){
        super(scope, id);
        this.productTable = this.createProductTable();
        this.basketTable = this.createBasketTable();
    }

  private createBasketTable(): ITable {
          //basket table
          //basket PK : username 
          //basket -- ITEMS( dictionary -> 
          //                                Item1 {quantity, color, price, productName, productID} ,
          //                                Item2 {quantity, color, price, productName, productID} )

          return new Table(
            this, 'BasketTable', {
              partitionKey: { name: 'userName', type: AttributeType.STRING },
              tableName: 'Basket',
              removalPolicy: cdk.RemovalPolicy.DESTROY,
              billingMode: BillingMode.PAY_PER_REQUEST
            }
          );
  }

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
