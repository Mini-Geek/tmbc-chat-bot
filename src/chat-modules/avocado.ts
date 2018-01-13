import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";

export class AvocadoModule extends MessageModule {
    public getHelpLine(): string {
        return "";
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body === "/avocado") {
            Utils.sendMessage(ctx, "Hold my 🥑");
        }
    }
}
