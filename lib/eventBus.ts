import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface EventBusConstructProps{
    targetFunction: IFunction;
    publisherFunction:IFunction
}
export class EventBusConstruct extends Construct{
  constructor(scope: Construct, id: string, props: EventBusConstructProps){
    super(scope, id);
    const eventBus = new EventBus(this, "EventBus", {
        eventBusName: "swn-event-bus"
    });

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
    checkOutBasketRule.addTarget(new LambdaFunction(props.targetFunction));
    eventBus.grantPutEventsTo(props.publisherFunction);
  }
}