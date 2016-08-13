import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { IChatModule } from "./chat-module";

export class BrowseModule implements IChatModule {
    public getMessageType(): string { return "message"; }
    public getHelpLine(): string {
        return "/first [timestamp in millis Unix time]: (broken)";
    }

    public processMessage(api: fbapi.Api, message: fbapi.MessageEvent): void {
        if (message.body && message.body.lastIndexOf("/first", 0) === 0) {
            let parts = message.body.split(" ");
            let time: Date;
            if (parts.length > 1) {
                time = new Date(+parts[1]);
            } else {
                time = undefined;
            }
            winston.info("Time given is", time);
            api.getThreadInfo(message.threadID, function (infoErr, info) {
                if (infoErr) {
                    console.error(infoErr);
                } else {
                    api.getThreadHistory(message.threadID, 0, 10, time, function (historyErr, history) {
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
