import { AttributeType, BillingMode, ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib";

export class SwnConstruct extends Construct{

    public readonly productTable: ITable;
    constructor(scope: Construct, id: string){
        super(scope, id);
        

        this.productTable = new Table(
            this, 'ProductTable', {
              partitionKey: { name: 'id', type: AttributeType.STRING },
              tableName: 'Product',
              removalPolicy: cdk.RemovalPolicy.DESTROY,
              billingMode: BillingMode.PAY_PER_REQUEST
            }
          );

    }
}