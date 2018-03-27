import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";

export class AdminModule extends MessageModule {
    public static AdminUrl: string =
        "https://docs.google.com/document/d/1rSDm7SfywNW3NmdurgPvjUhEDc5gANAGqFYSfAnBq3k/edit?usp=sharing";
    public static AdminChatId: string = "1448287721947838";
    public getHelpLine(): string {
        return "/admin info: Get info on group admins\n" +
                "/admin request [opt. message]: Send a message to the admin's group";
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body === "/admin info") {
            Utils.sendMessage(ctx, AdminModule.AdminUrl);
        } else if (ctx.message.body.indexOf("/admin request") === 0) {
            const message = (ctx.message.body === "/admin request")
                            ? "Somebody asked for y'all"
                            : "Message from chat: " + ctx.message.body.substring("/admin request ".length);
            Utils.sendMessage(ctx, message, AdminModule.AdminChatId);
            Utils.sendMessage(ctx, `Okay, I told the admins "${message}".`);
        }
    }
}
