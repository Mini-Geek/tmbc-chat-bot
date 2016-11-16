import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";

export class ClarifyModule extends MessageModule {
    private pattern: RegExp = new RegExp("^/clarify (.+)$", "i");
    public getHelpLine(): string {
        return `/clarify message - helps you tell confusing characters apart`;
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body) {
            if (this.pattern.test(ctx.message.body)) {
                let matches = this.pattern.exec(ctx.message.body);
                let msg = matches[1];

                let respMsg = "";
                for (let i = 0; i < msg.length; i++) {
                    switch (msg[i]) {
                        case "0":
                            respMsg += "[zero]";
                            break;
                        case "O":
                            respMsg += "[OSCAR]";
                            break;
                        case "o":
                            respMsg += "[oscar]";
                            break;
                        case "1":
                            respMsg += "[one]";
                            break;
                        case "I":
                            respMsg += "[INDIA]";
                            break;
                        case "l":
                            respMsg += "[lima]";
                            break;
                        default:
                            respMsg += msg[i];
                            break;
                    }
                }
                Utils.sendMessage(ctx, respMsg);
            }
        }
    }
}
