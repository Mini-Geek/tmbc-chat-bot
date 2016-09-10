import winston = require("winston");
import { AllModule, AnyEvent, IContext } from "./chat-module";

export class ReadNotificationModule extends AllModule {
    public getHelpLine(): string {
        return "Sends read receipts";
    }

    public processMessage(ctx: IContext<AnyEvent>): void {
        if (ctx.message.type === "message" || ctx.message.type === "event") {
            ctx.api.markAsRead(ctx.message.threadID, err => {
                if (err) {
                    winston.error("Error marking thread read", err);
                }
            });
        }
    }
}
