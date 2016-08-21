import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { IContext, MessageModule } from "./chat-module";

export class BrowseModule extends MessageModule {
    public getHelpLine(): string {
        return "/first [timestamp in millis Unix time]: (broken)";
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body && ctx.message.body.lastIndexOf("/first", 0) === 0) {
            let parts = ctx.message.body.split(" ");
            let time: Date;
            if (parts.length > 1) {
                time = new Date(+parts[1]);
            } else {
                time = undefined;
            }
            winston.info("Time given is", time);
            ctx.api.getThreadInfo(ctx.message.threadID, (infoErr, info) => {
                if (infoErr) {
                    console.error(infoErr);
                } else {
                    ctx.api.getThreadHistory(ctx.message.threadID, 0, 10, time, (historyErr, history) => {
                        if (historyErr) {
                            console.error(historyErr);
                        } else {
                            winston.info("thread history", history);
                        }
                    });
                }
            });
        }
    }
}
