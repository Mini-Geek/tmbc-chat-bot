import fbapi = require("facebook-chat-api");
import { ChatModule } from "./chat-module";

export class BrowseModule implements ChatModule {
    public getMessageType(): "message" { return "message"; }
    public getHelpLine(): string {
        return "/first [timestamp in millis Unix time]: (broken)";
    }

    public processMessage(api: fbapi.Api, message: fbapi.MessageEvent): void {
        if (message.body.lastIndexOf("/first", 0) === 0) {
            let parts = message.body.split(" ");
            let time: Date;
            if (parts.length > 1) {
                time = new Date(+parts[1]);
            } else {
                time = undefined;
            }
            console.log(time);
            api.getThreadInfo(message.threadID, function (err, info) {
                if (err) {
                    console.error(err);
                } else {
                    api.getThreadHistory(message.threadID, 0, 10, time, function (err, history) {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log(history);
                        }
                    });
                }
            });
        }
    }
}
