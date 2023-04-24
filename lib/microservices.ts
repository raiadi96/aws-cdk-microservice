import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { join } from "path";
import { ITable } from "aws-cdk-lib/aws-dynamodb/index.js";


interface SwnConstructProps{
    productTable: ITable;
}
export class SwnMicroServicesConstruct extends Construct{

    public readonly ProductFunction: NodejsFunction;

    constructor(scope: Construct, id: string, props: SwnConstructProps){
        super(scope, id);

        const nodeJsFunctionProps:NodejsFunctionProps ={
            bundling: {
             externalModules: ['aws-sdk']
          },
          environment: {
            PRIMARY_KEY: 'id',
            TABLE_NAME: props.productTable.tableName
          },
          runtime: Runtime.NODEJS_14_X
        }
      
           this.ProductFunction = new NodejsFunction(
            this,
            'ProductFunction', 
            {
              entry:join(__dirname, '../src/product/index.js'),
              ...nodeJsFunctionProps
            }
          );
          
          props.productTable.grantReadWriteData(this.ProductFunction);

    }

}