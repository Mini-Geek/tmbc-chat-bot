import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";

export class TyrantModule extends MessageModule {
    private removeDelay = 2000;
    private addBackDelay = 10000;
    public getHelpLine(): string {
        return "";
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body === "What're you gonna do, Robby, kick me?" && ctx.message.isGroup) {
            Utils.sendMessage(ctx, "Yes.");
            setTimeout(() => {
                winston.info("Removing user from group (tyrant)", ctx.message.senderID, ctx.message.threadID);
                ctx.api.removeUserFromGroup(ctx.message.senderID, ctx.message.threadID);
                setTimeout(() => {
                    winston.info("Adding user back to group (tyrant)", ctx.message.senderID, ctx.message.threadID);
                    ctx.api.addUserToGroup(ctx.message.senderID, ctx.message.threadID);
                }, this.addBackDelay);
            }, this.removeDelay);
        }
    }
}
