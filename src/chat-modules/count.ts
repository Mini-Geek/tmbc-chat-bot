import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";
import { groups } from "./groups";

export class CountModule extends MessageModule {
    public getHelpLine(): string {
        return "/count: show message count";
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body === "/count") {
            ctx.api.getThreadInfo(ctx.message.threadID, (err, info) => {
                if (err) {
                    winston.error("Error occurred getting thread info", err);
                } else {
                    winston.info("Thread info", info);
                    let entry = groups[ctx.message.threadID];
                    let count = (entry && entry.countBeforeMe) ? entry.countBeforeMe : 0;
                    Utils.sendMessage(ctx, "Message count: " + (count + info.messageCount));
                }
            });
        }
    }
}
