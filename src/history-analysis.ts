import login = require("facebook-chat-api");
import fs = require("fs");
import storage = require("node-persist");
import winston = require("winston");
import "winston-daily-rotate-file";
import { credentials } from "./credentials";
import { Utils } from "./utils";

import { IUserData } from "./chat-modules/last-seen";
import { StorageModule } from "./chat-modules/storage";

winston.add(
    winston.transports.DailyRotateFile,
    {
        datePattern: "YYYY-MM",
        filename: "logs/%DATE%.history-analysis.log",
        level: "info",
    });
winston.warn("starting up!");

if (!credentials || !credentials.email || credentials.email === "<FILL IN>") {
    winston.error("Please fill in credentials.ts with the account's email and password.");
    process.exit();
}

async function main() {
    if (process.argv[3]) {
        const threadId = Utils.getThreadIdFromInput(process.argv[3], undefined);
        if (threadId) {
            if (process.argv[2] === "download") {
                loginAndDownload(threadId);
            } else if (process.argv[2] === "merge") {
                await mergeData(threadId);
            } else if (process.argv[2] === "analyze") {
                await analyzeData(threadId);
            } else if (process.argv[2] === "remove") {
                loginAndRemove(threadId);
            } else {
                winston.error("Command not recognized");
            }
        } else {
            winston.error("Unable to parse " + process.argv[3]);
        }
    } else {
        winston.error("Thread ID required");
    }
}

function loginAndDownload(threadId: string) {
    login(credentials, (loginErr, api) => {
        if (loginErr) {
            return winston.error("Error logging in", loginErr);
        }
        api.setOptions({ listenEvents: false, selfListen: false });

        const amount = 50;
        const getChunk = (timestamp: string) => {
            api.getThreadHistory(threadId, amount, timestamp, (err, history) => {
                if (err) {
                    winston.error("Error encountered.", err);
                } else {
                    const readableTimestamp = timestamp ? new Date(+timestamp).toISOString().replace(/:/g, "") : "now";
                    winston.info(
                        `Inputs: ${JSON.stringify({threadId, amount, readableTimestamp})},` +
                        ` found ${history.length}`);
                    fs.writeFileSync(`./history/${threadId}-${readableTimestamp}.json`, JSON.stringify(history));
                    if (history.length > 1) {
                        const newTimestamp = (history[0] as any).timestamp;
                        if (newTimestamp) {
                            getChunk(newTimestamp);
                        } else {
                            winston.error("Found something without a timestamp");
                        }
                    } else {
                        shutdown("At the end, I think");
                    }
                }
            });
        };
        getChunk(process.argv[4]);

        const shutdown = (reason: string) => {
            winston.warn(reason);
            api.logout(() => process.exit(0));
        };
        const sigintCallback = () => shutdown("SIGINT detected, logging out");
        process.on("SIGINT", sigintCallback);
    });
}

async function mergeData(threadId: string) {
    await StorageModule.init();
    const data: any[] = [];
    let lastMessageId: string = null;
    fs.readdirSync("./history/").forEach((file) => {
        // winston.info(file);
        if (file.startsWith(threadId + "-")) {
            const messages: any[] = JSON.parse(fs.readFileSync("./history/" + file, "utf-8"));
            messages.forEach((message) => {
                if (message.messageID !== lastMessageId) {
                    data.push(message);
                    lastMessageId = message.messageID;
                }
            });
        }
    });
    fs.writeFileSync(`./history/merge-${threadId}.json`, JSON.stringify(data));
}

interface IAnalysisData {
    [userId: string]: IUserDetails;
}
interface IUserDetails {
    userId: string;
    data: IUserData;
    lastMessageTimestamp: Date;
    messageCount: number;
    addTimestamp?: Date;
    recommendation?: string;
}

async function analyzeData(threadId: string) {
    await StorageModule.init();
    const currFileData = await storage.getItem("last-seen-data.json");
    const currThreadData = currFileData[threadId];
    const users: IUserData[] = [];
    const data: IAnalysisData = {};
    for (const userId in currThreadData) {
        if (currThreadData.hasOwnProperty(userId)) {
            data[userId] = {
                data: currThreadData[userId],
                lastMessageTimestamp: new Date(0),
                messageCount: 0,
                userId,
            };
            users.push(currThreadData[userId]);
        }
    }
    const messages: any[] = JSON.parse(fs.readFileSync(`./history/merge-${threadId}.json`, "utf-8"));
    messages.forEach((message) => {
        if (message.senderID && message.timestamp) {
            const msgTimestamp = new Date(+message.timestamp);
            const userDetails = getUser(data, message.senderID, msgTimestamp);
            userDetails.messageCount += 1;
            if (userDetails.lastMessageTimestamp.getDate() === 0 ||
                    msgTimestamp > userDetails.lastMessageTimestamp) {
                userDetails.lastMessageTimestamp = msgTimestamp;
            }
            if (message.eventType === "add_participants") {
                message.eventData.participantsAdded.forEach((addedUserId: string) => {
                    const user = getUser(data, addedUserId, new Date(0));
                    if (!user.addTimestamp || msgTimestamp > user.addTimestamp) {
                        user.addTimestamp = msgTimestamp;
                    }
                    data[addedUserId] = user;
                });
            }
            data[message.senderID] = userDetails;
        }
    });

    const postDeadline =    new Date(Date.now() - (1000 * 60 * 60 * 24 * 183));
    const newUserDeadline = new Date(Date.now() - (1000 * 60 * 60 * 24 * 14));
    const exemptUsers = [
        "100001387064213", // Tim
        "1477719009", // Caleb
        "100010370947257", // Chris
        "180201030", // Josh
        "100022743772878", // Robby
        "100004908452859", // Spock
        ];
    const removeUserIds: string[] = [];
    fs.writeFileSync(`./history/summary-${threadId}.csv`,
        "User ID\tLast\tCount\tName (if still present)\tNickname\tAdd date (if known)\tRecommendation\n");
    for (const userId in data) {
        if (data.hasOwnProperty(userId)) {
            const userDetails: IUserDetails = data[userId];
            const hasName: boolean = !!(userDetails.data && userDetails.data.name);
            const inactive = !userDetails.lastMessageTimestamp || userDetails.lastMessageTimestamp < postDeadline;
            const newUserException = !userDetails.lastMessageTimestamp && userDetails.addTimestamp > newUserDeadline;
            const isAdmin = userId in exemptUsers;
            if (!hasName) {
                userDetails.recommendation = "[removed]";
            } else if (!isAdmin && inactive && !newUserException) {
                userDetails.recommendation = "remove";
                removeUserIds.push(userId);
            } else {
                userDetails.recommendation = "keep";
            }

            const csvLine =
                userDetails.userId + "\t" +
                (userDetails.lastMessageTimestamp > new Date(0)
                    ? userDetails.lastMessageTimestamp.toISOString() : "never") + "\t" +
                userDetails.messageCount + "\t" +
                (userDetails.data && userDetails.data.name) + "\t" +
                (userDetails.data && userDetails.data.nickname) + "\t" +
                (userDetails.addTimestamp && userDetails.addTimestamp.toISOString()) + "\t" +
                userDetails.recommendation + "\n";
            fs.appendFileSync(`./history/summary-${threadId}.csv`, csvLine);
        }
    }
    fs.writeFileSync(`./history/remove-${threadId}.json`, JSON.stringify(removeUserIds));
    fs.writeFileSync(`./history/summary-${threadId}.json`, JSON.stringify(data, undefined, 4));
}

function loginAndRemove(threadId: string) {
    login(credentials, (loginErr, api) => {
        if (loginErr) {
            return winston.error("Error logging in", loginErr);
        }
        api.setOptions({ listenEvents: false, selfListen: false });

        const userIds: string[] = JSON.parse(fs.readFileSync(`./history/remove-${threadId}.json`, "utf-8"));
        userIds.forEach((userId) => {
            api.removeUserFromGroup(userId, threadId);
        });
    });
}

function getUser(data: IAnalysisData, userId: string, msgTimestamp: Date): IUserDetails {
    return data[userId] ||
    {
        data: undefined,
        lastMessageTimestamp: msgTimestamp,
        messageCount: 0,
        userId,
    };
}

main();
