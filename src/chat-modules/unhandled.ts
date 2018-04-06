import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
import { AdminModule } from "./admin";
import { IContext, MessageModule } from "./chat-module";

export class UnhandledModule extends MessageModule {
    public getHelpLine(): string {
        return "If you type something that looks like a command (starts with a slash), " +
               "but isn't recognized, outputs a help message.";
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (!ctx.messageHandled && ctx.message.body[0] === "/") {
            Utils.sendMessage(ctx, "Huh? If you're talking to me, I don't know that command (try /help)");
        }
    }
}
