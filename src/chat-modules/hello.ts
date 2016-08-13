import fbapi = require("facebook-chat-api");
import { IChatModule } from "./chat-module";

export class HelloModule implements IChatModule {
    private pattern: RegExp = /^(Hello|hi),? Robby( A[sz]imov)?[\!\.\?]?$/i;
    public getMessageType(): string { return "message"; }
    public getHelpLine(): string {
        return "Hello, Robby: say hello";
    }

    public processMessage(api: fbapi.Api, message: fbapi.MessageEvent): void {
        if (message.body && this.pattern.test(message.body)) {
            api.sendMessage("Hello", message.threadID);
        }
    }
}
