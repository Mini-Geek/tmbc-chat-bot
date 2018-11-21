import fbapi = require("facebook-chat-api");
import storage = require("node-persist");
import winston = require("winston");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";
import { StorageModule } from "./storage";

export class LastSeenModule extends MessageModule {
    private fileName: string = "last-seen-data.json";

    public getHelpLine(): string {
        return "/lastseen: show when each user last sent a message\n" +
                "/lastseen update names: update the list of names";
    }

    public handleSelf(): boolean { return true; }

    public async processMessage(ctx: IContext<fbapi.MessageEvent>): Promise<void> {
        if (StorageModule.storageInitialized) {
            if (ctx.message.body === "/lastseen") {
                // trying to call updateNames from here doesn't work right, because of how asyncs and callbacks work
                // read and display
                await this.showLastSeenData(ctx);
            }
            if (ctx.message.body === "/lastseen update names") {
                // gather data and record; provide message
                this.updateNames(ctx);
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

    private updateNames(ctx: IContext<fbapi.MessageEvent>) {
        ctx.messageHandled = true;
        ctx.api.getThreadInfo(ctx.message.threadID, async (errThread, retThread) => {
            if (errThread) {
                Utils.sendMessage(ctx, "Something went wrong.");
                return winston.error("Error getting thread info", errThread);
            }
            const currFileData: IAllData = await storage.getItem(this.fileName) || {};
            let currThreadData = currFileData[ctx.message.threadID];
            currThreadData = currThreadData || {};
            const nicknames = retThread.nicknames as any as {
                [userId: string]: string;
            };
            winston.info("nicknames obj" + JSON.stringify(nicknames));
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
                currFileData[ctx.message.threadID] = newThreadData;
                await storage.setItem(this.fileName, currFileData);
                Utils.sendMessage(ctx, `Recorded names for ${count} users.`);
            });
        });
    }

    private async showLastSeenData(ctx: IContext<fbapi.MessageEvent>) {
        ctx.messageHandled = true;
        const currFileData: IAllData = await storage.getItem(this.fileName) || {};
        const currThreadData = currFileData[ctx.message.threadID];
        if (currThreadData) {
            const users: IUserData[] = [];
            for (const userId in currThreadData) {
                if (currThreadData.hasOwnProperty(userId)) {
                    users.push(currThreadData[userId]);
                }
            }
            // most recent first
            users.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
            let message = "";
            users.forEach((user) => {
                const name = user.name
                    ? (user.nickname ? `${user.nickname} (${user.name})` : user.name)
                    : "[Unknown name]";
                const messageDate = user.lastMessageTime < 0
                    ? "Never seen"
                    : "Last message on " + new Date(user.lastMessageTime).toDateString();
                message += `${name}: ${messageDate}\n`;
            });
            message += `(that's ${users.length} users)`;
            Utils.sendMessage(ctx, message);
        } else {
            Utils.sendMessage(ctx, "No data recorded for this thread yet.");
        }
    }
}
interface IAllData {
    [threadId: string]: IThreadData;
}
interface IThreadData {
    [userId: string]: IUserData;
}
interface IUserData {
    lastMessageTime: number;
    name: string;
    nickname: string;
}
