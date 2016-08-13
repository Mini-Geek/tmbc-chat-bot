import fbapi = require("facebook-chat-api");
import { IChatModule } from "./chat-module";

export class HelloModule implements IChatModule {
    public getMessageType(): string { return "message"; }
    public getHelpLine(): string {
        return "Hello, Robby: say hello";
    }

    public processMessage(api: fbapi.Api, message: fbapi.MessageEvent): void {
        if (message.body &&
            (message.body.toUpperCase() === "Hello, Robby".toUpperCase() ||
             message.body.toUpperCase() === "Hello Robby".toUpperCase())) {
            api.sendMessage("Hello", message.threadID);
        }
    }
}
