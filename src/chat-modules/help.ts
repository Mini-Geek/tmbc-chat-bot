import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
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
            Utils.sendMessage(api, message, chatModules.map(m => m.getHelpLine()).filter(x => !!x).join("\n"));
        }
    }
}
