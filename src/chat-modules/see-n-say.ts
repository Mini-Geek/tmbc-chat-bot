import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";
import { groups, userFriendlyName } from "./const";

export class SayModule extends MessageModule {
    private pattern: RegExp = new RegExp("^/(say|emoji|title) (?:(" + this.getStrIds() + "|\\d+) )?(.*)$", "i");
    public getHelpLine(): string {
        return `/say [thread-id (optional)] [message] - makes ${userFriendlyName} say something
/emoji [thread-id (optional)] [emoji] - set the emoji
/title [thread-id (optional)] [title] - set the title`;
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body) {
            if (this.pattern.test(ctx.message.body)) {
                let matches = this.pattern.exec(ctx.message.body);
                // winston.info("got " + matches.length + " matches");
                let operation = matches[1];
                let thread = matches[2];
                let msg = matches[3];
                // winston.info(operation, thread, msg);

                if (isNaN(+thread)) {
                    // try to look up value
                    let converted = this.getByStrId(thread);
                    if (converted) {
                        // found, use target one
                        thread = converted;
                    } else {
                        // not found, assume it's going to current thread
                        thread = ctx.message.threadID;
                    }
                } else {
                    // it's a number, assume that's the thread id
                    thread = thread;
                }

                switch (operation) {
                    case "say":
                    default:
                        Utils.sendMessage(ctx, msg, thread);
                        break;
                    case "emoji":
                        Utils.sendMessage(ctx, "Nah, I'll try later", thread);
                        // ctx.api.changeThreadEmoji(msg, thread, err => {
                        //     winston.error("Error changing emoji", err);
                        // });
                        break;
                    case "title":
                        ctx.api.setTitle(msg, thread, (err, obj) => {
                            if (err) {
                                winston.error("Error changing title", err);
                            }
                            if (obj) {
                                winston.info("Title set", obj);
                            }
                        });
                        break;
                }
            }
        }
    }

    private getByStrId(strId: string): string {
        for (let key in groups) {
            if (groups.hasOwnProperty(key)) {
                let element = groups[key];
                if (element.threadStrId === strId) {
                    return key;
                }
            }
        }
        return undefined;
    }

    private getStrIds(): string {
        let ids: string[] = [];
        for (let key in groups) {
            if (groups.hasOwnProperty(key)) {
                let element = groups[key];
                ids.push(element.threadStrId);
            }
        }
        return ids.join("|");
    }
}
