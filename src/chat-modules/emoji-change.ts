import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { Utils } from "../utils";
import { EventModule, IContext } from "./chat-module";
import { groups } from "./const";

export class EmojiChangeModule extends EventModule {
    public getHelpLine(threadID: string): string {
        let entry = groups[threadID];
        if (entry && entry.preferredEmoji) {
            return `Will keep the emoji at ${entry.preferredEmoji}`;
        }
    }

    public processMessage(ctx: IContext<fbapi.EventEvent>): void {
        let entry = groups[ctx.message.threadID];
        if (entry && entry.preferredEmoji) {
            if (ctx.message.logMessageType === "log:generic-admin-text" &&
                ctx.message.logMessageData.message_type === "change_thread_icon") {
                winston.info("emoji set to", ctx.message.logMessageData.untypedData.thread_icon);
                if (ctx.message.logMessageData.untypedData.thread_icon !== entry.preferredEmoji) {
                    winston.info("Changing emoji to " + entry.preferredEmoji);
                    ctx.api.changeThreadEmoji(entry.preferredEmoji, ctx.message.threadID, () => undefined);
                    let i = ctx.message.logMessageBody.indexOf(" set the emoji to ");
                    if (i > 0) {
                        let user = ctx.message.logMessageBody.substring(0, i);
                        Utils.sendMessage(ctx, "Don't change the emoji, " + user);
                    }
                }
            }
        }
    }
}
