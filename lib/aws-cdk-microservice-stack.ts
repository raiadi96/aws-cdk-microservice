import * as cdk from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { AssetCode, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsCdkMicroserviceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productTable = new Table(
      this, 'ProductTable', {
        partitionKey: { name: 'id', type: AttributeType.STRING },
        tableName: 'Product',
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        billingMode: BillingMode.PAY_PER_REQUEST
      }
    );

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
  }
}
