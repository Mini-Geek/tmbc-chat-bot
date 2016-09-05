import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { Utils } from "../utils";
import { EventModule, IContext } from "./chat-module";
import { groups } from "./const";

export class NameChangeModule extends EventModule {
    public getHelpLine(threadID: string): string {
        let entry = groups[threadID];
        if (entry && entry.preferredTitle) {
            return `Will keep the chat title at ${entry.preferredTitle}`;
        }
    }

    public processMessage(ctx: IContext<fbapi.EventEvent>): void {
        let entry = groups[ctx.message.threadID];
        if (entry && entry.preferredTitle) {
            if (ctx.message.logMessageType === "log:thread-name") {
                winston.info("title set to", ctx.message.logMessageData.name);
                if (ctx.message.logMessageData.name !== entry.preferredTitle) {
                    winston.info("Changing title to " + entry.preferredTitle);
                    ctx.api.setTitle(entry.preferredTitle, ctx.message.threadID);
                    let i = ctx.message.logMessageBody.indexOf(" named the group ");
                    if (i > 0) {
                        let user = ctx.message.logMessageBody.substring(0, i);
                        Utils.sendMessage(ctx, "Don't rename the chat, " + user);
                    }
                }
            }
        }
    }
}
