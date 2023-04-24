import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { SwnMicroServicesConstruct } from "./microservices";
import { IFunction } from "aws-cdk-lib/aws-lambda";

interface ApiGatewayConstructProps{
    productFunc: IFunction;
    basketFunc: IFunction;
}

export class ApiGatewayConstruct extends Construct{
    constructor(scope: Construct, id: string, props: ApiGatewayConstructProps){
        super(scope, id);

        const productApiGateway = new LambdaRestApi(
            this,
            'ProductApiGateway',
            {
              restApiName: 'Product Service',
              handler: props.productFunc,
              proxy: false
            }
          );

            /*
              product microservice api gateway
              root name = product
              GET /product
              POST /product

              GET /product/{id}
              PUT /product/{id}
              DELETE /product/{id}
            */
      
          const productRoute = productApiGateway.root.addResource('product');
          productRoute.addMethod('GET');
          productRoute.addMethod('POST');
      
          const productWithIdRoute = productRoute.addResource('{id}');
          productWithIdRoute.addMethod('GET');
          productWithIdRoute.addMethod('PUT');
          productWithIdRoute.addMethod('DELETE');

          /*
            basket microservice api gateway
            root name = basket
            GET /basket
            POST /basket

            GET /basket/{userName}
            DELETE /basket/{userName}
          */

          const basketApiGateway = new LambdaRestApi(
            this,
            'BasketApiGateway',
            {
              restApiName: 'Basket Service',
              handler: props.basketFunc,
              proxy: false
            }
          );

          const basketRoute = basketApiGateway.root.addResource('basket');
          basketRoute.addMethod('GET');
          basketRoute.addMethod('POST');
          const basketWithUserNameRoute = basketRoute.addResource('{userName}');
          basketWithUserNameRoute.addMethod('GET');
          basketWithUserNameRoute.addMethod('DELETE');
    }
}