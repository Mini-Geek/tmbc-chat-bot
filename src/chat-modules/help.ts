import fbapi = require("facebook-chat-api");
import { IChatModule } from "./chat-module";

export class HelpModule implements IChatModule {
    public getMessageType(): string { return "message"; }
    public getHelpLine(): string {
        return "/help: show this message";
    }

    public processMessage(
        api: fbapi.Api,
        message: fbapi.MessageEvent,
        shutdown: (reason: string) => void,
        chatModules: IChatModule[]): void {
        if (message.body && message.body === "/help") {
            api.sendMessage(chatModules.map(m => m.getHelpLine()).join("\n"), message.threadID);
        }
    }
}
