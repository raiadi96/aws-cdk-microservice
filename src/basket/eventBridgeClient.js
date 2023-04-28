import { EventBridgeClient } from "@aws-sdk/client-eventbridge";
//Initialize Event Bridge Client
export const eventBridgeClient = new EventBridgeClient();