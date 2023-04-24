import * as cdk from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { AssetCode, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';
import { SwnConstruct } from './database';

export class AwsCdkMicroserviceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const database = new SwnConstruct(this, "Database");

    const nodeJsFunctionProps:NodejsFunctionProps ={
      bundling: {
       externalModules: ['aws-sdk']
    },
    environment: {
      PRIMARY_KEY: 'id',
      TABLE_NAME: database.productTable.tableName
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
    
    database.productTable.grantReadWriteData(ProductFunction);

    /*
    product microservice api gateway
    root name = product
    GET /product
    POST /product

    GET /product/{id}
    PUT /product/{id}
    DELETE /product/{id}
    */
    
    const productApiGateway = new LambdaRestApi(
      this,
      'ProductApiGateway',
      {
        restApiName: 'Product Service',
        handler: ProductFunction,
        proxy: false
      }
    );

    const productRoute = productApiGateway.root.addResource('product');
    productRoute.addMethod('GET');
    productRoute.addMethod('POST');

    const productWithIdRoute = productRoute.addResource('{id}');
    productWithIdRoute.addMethod('GET');
    productWithIdRoute.addMethod('PUT');
    productWithIdRoute.addMethod('DELETE');
  }
}
