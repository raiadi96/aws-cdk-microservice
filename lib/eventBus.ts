import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction, SqsQueue } from "aws-cdk-lib/aws-events-targets";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { IQueue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

/*
    Props for Mapping Lambda and Queue to EventBridge
*/
interface EventBusConstructProps{
    publisherFunction:IFunction;
    targetQueue: IQueue;
}

/*
    Construct for creating EventBridge
*/
export class EventBusConstruct extends Construct{
  constructor(scope: Construct, id: string, props: EventBusConstructProps){
    super(scope, id);
    
    //code for Infra setup
    const eventBus = new EventBus(this, "EventBus", {
        eventBusName: "swn-event-bus"
    });

    //setup rules for checkoutBasket
    const checkOutBasketRule = new Rule(this, "CheckOutBasketRule", {
        eventBus: eventBus,
        enabled:true,
        description: "Check out basket rule: When User checks out the products in the basket",
        eventPattern:{
            source: [
                "com.swn.basket.checkoutBasket",
            ],
            detailType: ["CheckoutBasket"]
        },
        ruleName: "CheckOutBasketRule"
    });
    checkOutBasketRule.addTarget(new SqsQueue(props.targetQueue));
    eventBus.grantPutEventsTo(props.publisherFunction);
  }
}