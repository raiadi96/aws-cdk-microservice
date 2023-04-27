import { Duration } from "aws-cdk-lib";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

export class SQSConstruct extends Construct{

    constructor(scope: Construct, id: string){
        super(scope, id);

        const sqs = new Queue(this, "Queue", {
            queueName: "swnQueue",
            visibilityTimeout: Duration.seconds(30)
        });
        
    }
}