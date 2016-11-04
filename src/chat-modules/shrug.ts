import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";

export class ShrugModule extends MessageModule {
    public getHelpLine(): string {
        return "/shrug: ¯\\_(ツ)_/¯";
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body === "/shrug") {
            Utils.sendMessage(ctx, "¯\\_(ツ)_/¯");
        }
    }
}
