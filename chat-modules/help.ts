import fbapi = require("facebook-chat-api");
import { ChatModule } from "./chat-module";

export class HelpModule implements ChatModule {
    public getMessageType(): "message" { return "message"; }
    public getHelpLine(): string {
        return "Hello, Robby or /help: show this message";
    }

    public processMessage(api: fbapi.Api, message: fbapi.MessageEvent, stopListening: () => void, chatModules: ChatModule[]): void {
        if (message.body == "/help" ||
            message.body.toUpperCase() === "Hello, Robby".toUpperCase() ||
            message.body.toUpperCase() === "Hello Robby".toUpperCase()) {
            api.sendMessage(chatModules.map(m => m.getHelpLine()).join("\n"), message.threadID);
        }
    }
}
