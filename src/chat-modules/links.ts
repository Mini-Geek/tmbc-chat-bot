import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
import { IChatModule } from "./chat-module";

export class LinksModule implements IChatModule {
    public getMessageType(): string { return "message"; }
    public getHelpLine(): string {
        return "/links: show chat guide link and my source";
    }

    public processMessage(api: fbapi.Api, message: fbapi.MessageEvent): void {
        if (message.body === "/links") {
            Utils.sendMessage(api, message,
                "https://bit.ly/TMBCChatGuide" + "\n" +
                "https://github.com/Mini-Geek/tmbc-chat-bot");
        }
    }
}
