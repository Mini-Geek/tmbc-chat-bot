import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";

export class HelpModule extends MessageModule {
    public getHelpLine(): string {
        return "/help: show this message";
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body && ctx.message.body === "/help") {
            const help = ctx.chatModules.map((m) => m.getHelpLine(ctx.message.threadID)).filter((x) => !!x).join("\n");
            Utils.sendMessage(ctx, help);
        }
    }
}
