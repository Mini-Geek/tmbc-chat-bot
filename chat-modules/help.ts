import fbapi = require("facebook-chat-api");
import { IChatModule } from "./chat-module";

export class HelpModule implements IChatModule {
    public getMessageType(): "message" { return "message"; }
    public getHelpLine(): string {
        return "Hello, Robby or /help: show this message";
    }

    public processMessage(
        api: fbapi.Api,
        message: fbapi.MessageEvent,
        stopListening: () => void,
        chatModules: IChatModule[]): void {
        if (message.body &&
            (message.body === "/help" ||
             message.body.toUpperCase() === "Hello, Robby".toUpperCase() ||
             message.body.toUpperCase() === "Hello Robby".toUpperCase())) {
            api.sendMessage(chatModules.map(m => m.getHelpLine()).join("\n"), message.threadID);
        }
    }
}
