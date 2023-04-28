import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { SwnMicroServicesConstruct } from "./microservices";
import { IFunction } from "aws-cdk-lib/aws-lambda";

/*
Props for ApiGatewayConstruct for mapping Lambda Functions to corresponding API Gatways.
*/
interface ApiGatewayConstructProps {
  productFunc: IFunction;
  basketFunc: IFunction;
  orderFunc: IFunction;
}

/*
Construct for creating API Gateways.
*/
export class ApiGatewayConstruct extends Construct {

  public readonly productApiGateway: LambdaRestApi;
  public readonly basketApiGateway: LambdaRestApi;
  public readonly orderApiGateway: LambdaRestApi;


  constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
    super(scope, id);
    this.productApiGateway = this.createProductApiGateway(props.productFunc);
    this.basketApiGateway = this.createBasketApiGateway(props.basketFunc);
    this.orderApiGateway = this.createOrderApiGateway(props.orderFunc);
  }


  /*
    Code for creating Order API Gateway.
    Routes:
    root name = order
    GET /order
    GET /order/{userName}?orderDate={Date}
  */
  createOrderApiGateway(orderFunc: IFunction): LambdaRestApi {

    //Route Infra code
    const orderApiGateway = new LambdaRestApi(
      this,
      'OrderApiGateway',
      {
        restApiName: 'Order Service',
        handler: orderFunc,
        proxy: false
      });

    // Define routes
    const orderRoute = orderApiGateway.root.addResource('order');
    orderRoute.addMethod('GET');
    const singleOrder = orderRoute.addResource('{userName}')
    singleOrder.addMethod('GET');
    return orderApiGateway;
  }

  /*
  Code for creating Basket API Gateway
  Routes:
     root name = basket
     GET /basket
     POST /basket

     root name = basket/{userName}
     GET /basket/{userName}
     DELETE /basket/{userName}

     root name = basket/checkout
     POST /basket/checkout
   */
  createBasketApiGateway(basketFunc: IFunction): LambdaRestApi {

    //Route Infra code
    const basketApiGateway = new LambdaRestApi(
      this,
      'BasketApiGateway',
      {
        restApiName: 'Basket Service',
        handler: basketFunc,
        proxy: false
      }
    );
    // Define routes
    const basketRoute = basketApiGateway.root.addResource('basket');
    basketRoute.addMethod('GET');
    basketRoute.addMethod('POST');
    const basketWithUserNameRoute = basketRoute.addResource('{userName}');
    basketWithUserNameRoute.addMethod('GET');
    basketWithUserNameRoute.addMethod('DELETE');
    basketRoute.addResource('checkout').addMethod('POST');
    return basketApiGateway;
  }

  /*
    Code for creating Product API Gateway.
    Routes:
      root name = product
      GET /product
      POST /product

      GET /product/{id}
      PUT /product/{id}
      DELETE /product/{id}
  */
  createProductApiGateway(productFunc: IFunction): LambdaRestApi {

    //Route Infra code
    const productApiGateway = new LambdaRestApi(
      this,
      'ProductApiGateway',
      {
        restApiName: 'Product Service',
        handler: productFunc,
        proxy: false
      }
    );

    // Define routes
    const productRoute = productApiGateway.root.addResource('product');
    productRoute.addMethod('GET');
    productRoute.addMethod('POST');

    const productWithIdRoute = productRoute.addResource('{id}');
    productWithIdRoute.addMethod('GET');
    productWithIdRoute.addMethod('PUT');
    productWithIdRoute.addMethod('DELETE');
    return productApiGateway;
  }
}