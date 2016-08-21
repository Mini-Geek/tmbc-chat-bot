import winston = require("winston");
import { Utils } from "../utils";
import { AllModule, AnyEvent, IContext } from "./chat-module";

export class DebugModule extends AllModule {
    private debugEnabled = false;

    public getHelpLine(): string {
        return "/debug on/off: Enable backend logging of message details";
    }

    public processMessage(ctx: IContext<AnyEvent>): void {
        // store in local variable so ts can understand type guard later
        let message = ctx.message;
        if (this.debugEnabled) {
            winston.info("Full message details", message);
        }
        if (Utils.isMessage(message) && message.body) {
            if (message.body === "/debug on") {
                winston.info("Enabling debugging, getting thread info");
                this.debugEnabled = true;
                ctx.api.getThreadInfo(message.threadID, (infoErr, result) => {
                    if (infoErr) {
                        winston.error("Error getting thread info", infoErr);
                    } else {
                        winston.info("Thread info", result);
                    }
                });
                Utils.sendMessage(ctx, "Debugging enabled");
            } else if (message.body === "/debug off") {
                this.debugEnabled = false;
                Utils.sendMessage(ctx, "Debugging disabled");
            }
        }
    }
}
