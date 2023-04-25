import * as cdk from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { AssetCode, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';
import { SwnConstruct } from './database';
import { SwnMicroServicesConstruct } from './microservices';
import { ApiGatewayConstruct } from './apigw';
import { EventBusConstruct } from './eventBus';

export class AwsCdkMicroserviceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const database = new SwnConstruct(this, "Database");

    const microservices = new SwnMicroServicesConstruct(this, "ProductMicroservice", {
      productTable: database.productTable,
      basketTable: database.basketTable,
      orderTable: database.orderTable
    });

    const apigw = new ApiGatewayConstruct(this, "ApiGateway", {
      productFunc: microservices.ProductFunction,
      basketFunc: microservices.BasketFunction,
      orderFunc: microservices.OrderFunction
    });

    const eventBus = new EventBusConstruct(this, "EventBus", {
      publisherFunction: microservices.BasketFunction,
      targetFunction: microservices.OrderFunction
    });
  }
}
