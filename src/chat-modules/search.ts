import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";
import { groups, userFriendlyName } from "./const";

export class SearchModule extends MessageModule {
    private pattern: RegExp = new RegExp("^/search (.*)$", "i");
    public handleSelf(): boolean { return true; }
    public getHelpLine(): string {
        return `/search [message] - Searches for [message] in the current thread`;
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body) {
            if (this.pattern.test(ctx.message.body)) {
                let matches = this.pattern.exec(ctx.message.body);
                let msg = matches[1];

                ctx.api.searchForMessages(msg, ctx.message.threadID, ctx.message.isGroup, (err, snippets) => {
                    if (err) {
                        winston.error("Error searching", err);
                    }
                    if (snippets) {
                        winston.info("Search results", snippets);
                        let response = "";
                        snippets.forEach(snippet => {
                            response += snippet.timestamp_datetime + ": ";
                            response += snippet.body + "\n";
                        });
                        Utils.sendMessage(ctx, response);
                        // Utils.sendMessage(ctx, "Found " + obj.length + " things: " + obj);
                    }
                });
            }
        }
    }
}
