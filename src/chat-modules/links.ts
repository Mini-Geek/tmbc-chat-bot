import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";

export class LinksModule extends MessageModule {
    public getHelpLine(): string {
        return "/links: show chat guide link and my source";
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body === "/links") {
            Utils.sendMessage(ctx,
                "Chat Guide: " +
                "https://docs.google.com/document/d/1wkVjnSpfyDuD5fvnUjhUVVV8Ow-0ZwhLhQeaHAs72oI/edit" + "\n\n" +
                "Other links: " +
                "https://www.blimeycow.com/cowmoonity" + "\n" +
                "https://github.com/Mini-Geek/tmbc-chat-bot" + "\n" +
                "https://bit.ly/TMBC-archive-2016-12-09");
        }
    }
}
