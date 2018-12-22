import fbapi = require("facebook-chat-api");
import storage = require("node-persist");
import winston = require("winston");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";
import { StorageModule } from "./storage";

export class LastSeenModule extends MessageModule {
    private fileName: string = "last-seen-data.json";
    private patternUpdate: RegExp = new RegExp("^/lastseen update names (.+)?$");

    public getHelpLine(): string {
        return "/lastseen update names [thread-id (optional)]: update the list of names for the last-seen data";
    }

    public handleSelf(): boolean { return true; }

    public async processMessage(ctx: IContext<fbapi.MessageEvent>): Promise<void> {
        if (StorageModule.storageInitialized && ctx.message.body) {
            if (this.patternUpdate.test(ctx.message.body)) {
                // gather data and record; provide message
                const matches = this.patternUpdate.exec(ctx.message.body);
                const thread = Utils.getThreadIdFromInput(matches[1], ctx.message.threadID);
                this.updateNames(ctx, thread);
            }

            // record
            await this.recordCurrentMessage(ctx);
        }
    }

    private async recordCurrentMessage(ctx: IContext<fbapi.MessageEvent>) {
        const currFileData: IAllData = await storage.getItem(this.fileName) || {};
        let currThreadData = currFileData[ctx.message.threadID];
        if (!currThreadData) {
            currThreadData = {};
            currFileData[ctx.message.threadID] = currThreadData;
        }
        const userData = currThreadData[ctx.message.senderID] ||
            { lastMessageTime: -1, name: "", nickname: "" };
        userData.lastMessageTime = Date.now();
        currThreadData[ctx.message.senderID] = userData;
        await storage.setItem(this.fileName, currFileData);
    }

    private updateNames(ctx: IContext<fbapi.MessageEvent>, threadId: string) {
        ctx.messageHandled = true;
        ctx.api.getThreadInfo(threadId, async (errThread, retThread) => {
            if (errThread) {
                Utils.sendMessage(ctx, "Something went wrong.");
                return winston.error("Error getting thread info", errThread);
            }
            const currFileData: IAllData = await storage.getItem(this.fileName) || {};
            let currThreadData = currFileData[threadId];
            currThreadData = currThreadData || {};
            const nicknames = retThread.nicknames as any as {
                [userId: string]: string;
            };
            const newThreadData: IThreadData = {};
            ctx.api.getUserInfo(retThread.participantIDs, async (errUsers, retUsers) => {
                if (errUsers) {
                    Utils.sendMessage(ctx, "Something went wrong.");
                    return winston.error("Error getting user info", errUsers);
                }
                let count = 0;
                for (const userId in retUsers) {
                    if (retUsers.hasOwnProperty(userId)) {
                        const oldUserData: IUserData = currThreadData[userId] ||
                            { lastMessageTime: -1, name: "", nickname: "" };
                        const userData: IUserData = {
                            lastMessageTime: oldUserData.lastMessageTime,
                            name: retUsers[userId].name,
                            nickname: nicknames[userId],
                        };
                        newThreadData[userId] = userData;
                        count++;
                    }
                }
                currFileData[threadId] = newThreadData;
                await storage.setItem(this.fileName, currFileData);
                Utils.sendMessage(ctx, `Recorded names for ${count} users.`);
            });
        });
    }
}
export interface IAllData {
    [threadId: string]: IThreadData;
}
export interface IThreadData {
    [userId: string]: IUserData;
}
export interface IUserData {
    lastMessageTime: number;
    name: string;
    nickname: string;
}
