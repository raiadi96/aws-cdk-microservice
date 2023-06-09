import { Duration } from "aws-cdk-lib";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";


/*
Props for SQSConstruct for mapping Lambda Functions to corresponding SQS Queues.
*/
interface SQSConstructProps{
    consumer: IFunction;
}

/*
Construct code for SQS
*/
export class SQSConstruct extends Construct{

    public readonly queue: Queue;
    constructor(scope: Construct, id: string, props: SQSConstructProps){
        super(scope, id);

        this.queue = new Queue(this, "Queue", {
            queueName: "swnQueue",
            visibilityTimeout: Duration.seconds(30)
        });

        props.consumer.addEventSource(new SqsEventSource(this.queue, 
            {
                batchSize: 1
            }));
    }
}