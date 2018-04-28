import fbapi = require("facebook-chat-api");
import storage = require("node-persist");
import winston = require("winston");
import { Utils } from "../utils";
import { IContext, ReadReceiptModule } from "./chat-module";
import { groups } from "./const";
import { StorageModule } from "./storage";

export class StalkerModule extends ReadReceiptModule {
    public getHelpLine(): string {
        return "";
    }

    public processMessage(ctx: IContext<fbapi.ReadReceiptEvent>): void {
        if (StorageModule.storageInitialized && ctx.message.threadID in groups) {
            const groupInfo = groups[ctx.message.threadID];
            if (groupInfo.stalkTarget === ctx.message.reader) {
                this.isTooRecent(ctx.message).then((tooRecent: boolean) => {
                    if (!tooRecent) {
                        Utils.sendMessage(ctx, groupInfo.stalkMessage);
                    }
                }).catch((error) => {
                    winston.error("Error getting stalker data", error);
                });
            }
        }
    }

    private async isTooRecent(message: fbapi.ReadReceiptEvent): Promise<boolean> {
        const fileName = `stalker-${message.threadID}-${message.reader}.json`;
        let prev: number = await storage.getItem(fileName);
        const now: number = Number(message.time);
        const tooRecent = prev && (now - prev < 3 * 3600 * 1000); // 3 hours
        if (!tooRecent) {
            if (!prev) {
                prev = -1;
            }
            winston.info(`Preparing to send stalker message based on ${prev} and ${now}, diff ${now - prev} ms`);
        }
        await storage.setItem(fileName, now);
        return tooRecent;
    }
}
