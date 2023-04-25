import { EventBridgeClient } from "@aws-sdk/client-eventbridge";
export default eventBridgeClient = new EventBridgeClient({ region: "us-east-1" });