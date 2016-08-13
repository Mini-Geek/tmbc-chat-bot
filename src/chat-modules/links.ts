import fbapi = require("facebook-chat-api");
import { IChatModule } from "./chat-module";

export class LinksModule implements IChatModule {
    public getMessageType(): string { return "message"; }
    public getHelpLine(): string {
        return "/links: show chat guide link and my source";
    }

    public processMessage(api: fbapi.Api, message: fbapi.MessageEvent): void {
        if (message.body === "/links") {
            api.sendMessage("https://bit.ly/TMBCChatGuide\nhttps://github.com/Mini-Geek/tmbc-chat-bot",
                message.threadID);
        }
    }
}
