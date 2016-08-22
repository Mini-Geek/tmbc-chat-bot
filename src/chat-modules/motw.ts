import fbapi = require("facebook-chat-api");
import winston = require("winston");
import storage = require("node-persist");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";

/**
 * Message of the Week
 */
export class MotwModule extends MessageModule {
    private nomPattern: RegExp = /^\/motw nominate (.+)$/i;
    private votePattern: RegExp = /^\/motw vote (\d+)$/i;
    private unvotePattern: RegExp = /^\/motw unvote (\d+)$/i;
    private mergePattern: RegExp = /^\/motw merge (\d+) (\d+) (left|right)$/i;
    private storageInitialized = false;

    public constructor() {
        super();
        storage.init({ dir: "../../../../motw-data" }, () => {
            this.storageInitialized = true;
        });
    }
    public getHelpLine(): string {
        return "/motw - Message of the Week, /motw help for more details";
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (this.storageInitialized && ctx.message.body) {
            if (ctx.message.body === "/motw") {
                let data = this.getData(ctx.message.threadID).pastWinners;
                if (data.length > 0) {
                    Utils.sendMessage(ctx, `Last winner: ${this.winnerToString(data[data.length - 1])}`);
                } else {
                    Utils.sendMessage(ctx, "No winners yet");
                }
            } else if (ctx.message.body === "/motw help" || ctx.message.body === "/help motw") {
                Utils.sendMessage(ctx,
                    "'/motw help' or '/help motw': Show this help\n" +
                    "'/motw': Show the last winner\n" +
                    "'/motw history': Show all winners\n" +
                    "'/motw entries': Show this week's nominations\n" +
                    "'/motw nominate [Some text -Whoever]': Add a nomination\n" +
                    "'/motw vote [index]': Vote for a nomination, by its number. " +
                    "You can vote for multiple nominations in a week.\n" +
                    "'/motw unvote [index]': Remove your vote for a nomination, by its number.\n" +
                    "'/motw merge [index] [index] (left|right)': Merge two nominations, keeping the text of " +
                    "the one you specified on the left or right. Use with caution!");
            } else if (ctx.message.body === "/motw history") {
                let data = this.getData(ctx.message.threadID).pastWinners;
                let msg: string;
                if (data.length === 0) {
                    msg = "No history to show";
                } else {
                    msg = data.map(this.winnerToString, this).join("\n");
                }
                Utils.sendMessage(ctx, msg);
            } else if (ctx.message.body === "/motw entries") {
                let data = this.getData(ctx.message.threadID).currentEntries;
                let msg: string;
                if (data.length === 0) {
                    msg = "No entries yet";
                } else {
                    msg = data.map(this.entryToString, this).join("\n");
                }
                Utils.sendMessage(ctx, msg);
            } else if (this.nomPattern.test(ctx.message.body)) {
                let msg = this.nomPattern.exec(ctx.message.body)[1];
                let entry: IMotwEntry = {
                    message: msg,
                    votes: [ctx.message.senderID],
                };
                winston.info("Adding nomination", entry);
                this.addNomination(ctx, entry);
            } else if (this.votePattern.test(ctx.message.body)) {
                let msg = this.votePattern.exec(ctx.message.body)[1];
                winston.info("Adding vote", msg);
                this.addVote(ctx, +msg);
            } else if (this.unvotePattern.test(ctx.message.body)) {
                let msg = this.unvotePattern.exec(ctx.message.body)[1];
                winston.info("Removing vote", msg);
                this.removeVote(ctx, +msg);
            } else if (this.mergePattern.test(ctx.message.body)) {
                let matches = this.mergePattern.exec(ctx.message.body);
                let a = +matches[1];
                let b = +matches[2];
                let whichToKeep = matches[3];
                winston.info("Merging", a, b, whichToKeep);
                this.merge(ctx, a, b, whichToKeep);
            }
        }
    }

    private getData(threadID: string): IMotwData {
        let data: IMotwData = storage.getItemSync("motw-data-" + threadID) || { currentEntries: [], pastWinners: [] };
        return data;
    }

    private addNomination(ctx: IContext<fbapi.MessageEvent>, entry: IMotwEntry) {
        let data = this.getData(ctx.message.threadID);
        let collision = false;
        data.currentEntries.forEach(e => {
            if (entry.message === e.message) {
                Utils.sendMessage(ctx, "There's already an entry like that! Voting for that instead...");
                collision = true;
                this.addVoteByEntry(ctx, entry, data);
            }
        });
        if (!collision) {
            data.currentEntries.push(entry);
            storage.setItemSync("motw-data-" + ctx.message.threadID, data);
            Utils.sendMessage(ctx, "Your entry has been added as index " + data.currentEntries.length);
        }
    }

    private merge(ctx: IContext<fbapi.MessageEvent>, indexA: number, indexB: number, whichToKeep: string) {
        let invalid = false;
        let data = this.getData(ctx.message.threadID);
        // one-based indexes
        if (indexA < 1 || indexA > data.currentEntries.length) {
            Utils.sendMessage(ctx, "Invalid index: " + indexA);
            invalid = true;
        }
        if (indexB < 1 || indexB > data.currentEntries.length) {
            Utils.sendMessage(ctx, "Invalid index: " + indexB);
            invalid = true;
        }
        if (indexA === indexB) {
            Utils.sendMessage(ctx, "The indexes must be different.");
            invalid = true;
        }
        if (!invalid) {
            // indexA is one-based, iA is zero-based
            let iA = indexA - 1;
            let iB = indexB - 1;
            let entryA = data.currentEntries[iA];
            let entryB = data.currentEntries[iB];
            let newEntry: IMotwEntry = {
                message: whichToKeep === "left" ? entryA.message : entryB.message,
                votes: this.unionArrays(entryA.votes, entryB.votes),
            };
            let largerIndex = iA > iB ? iA : iB;
            let smallerIndex = iA > iB ? iB : iA;
            let laterEntry = data.currentEntries.splice(largerIndex, 1);
            let earlierEntry = data.currentEntries.splice(smallerIndex, 1);
            if (laterEntry.length !== 1 || earlierEntry.length !== 1) {
                invalid = true;
            }
            if (iA > iB) {
                if (laterEntry[0] !== entryA || earlierEntry[0] !== entryB) {
                    invalid = true;
                }
            } else {
                if (laterEntry[0] !== entryB || earlierEntry[0] !== entryA) {
                    invalid = true;
                }
            }
            if (invalid) {
                winston.error("Internal error merging", ctx, data.currentEntries, indexA, indexB, whichToKeep);
                Utils.sendMessage(ctx, "Error merging");
            } else {
                data.currentEntries.push(newEntry);
                storage.setItemSync("motw-data-" + ctx.message.threadID, data);
                winston.warn("Merged entries", entryA, entryB, newEntry);
                Utils.sendMessage(ctx, `Merged as ${newEntry.message} (${newEntry.votes.length} votes)`);
            }
        }
    }

    /**
     * This is not efficient, and should only be used for small lists.
     */
    private unionArrays<T>(x: T[], y: T[]): T[] {
        let newArray = x.slice();
        y.forEach(element => {
            if (newArray.indexOf(element) === -1) {
                newArray.push(element);
            }
        });
        return newArray;
    }

    private addVote(ctx: IContext<fbapi.MessageEvent>, index: number) {
        let data = this.getData(ctx.message.threadID);
        if (index < 1 || index > data.currentEntries.length) {
            Utils.sendMessage(ctx, "Invalid index");
        }
        let entry = data.currentEntries[index - 1];
        this.addVoteByEntry(ctx, entry, data);
    }

    private addVoteByEntry(ctx: IContext<fbapi.MessageEvent>, entry: IMotwEntry, data: IMotwData) {
        let collision = false;
        entry.votes.forEach(id => {
            if (ctx.message.senderID === id) {
                Utils.sendMessage(ctx, "You already voted for that one");
                collision = true;
            }
        });
        if (!collision) {
            entry.votes.push(ctx.message.senderID);
            storage.setItemSync("motw-data-" + ctx.message.threadID, data);
            Utils.sendMessage(ctx, `Your vote has been recorded (now ${entry.votes.length} votes)`);
        }
    }

    private removeVote(ctx: IContext<fbapi.MessageEvent>, index: number) {
        let data = this.getData(ctx.message.threadID);
        if (index < 1 || index > data.currentEntries.length) {
            Utils.sendMessage(ctx, "Invalid index");
        }
        let entry = data.currentEntries[index - 1];
        let voteIndex = entry.votes.indexOf(ctx.message.senderID);
        if (voteIndex === -1) {
            Utils.sendMessage(ctx, "You haven't voted for that one");
        } else {
            entry.votes.splice(voteIndex, 1);
            storage.setItemSync("motw-data-" + ctx.message.threadID, data);
            Utils.sendMessage(ctx, `Your vote has been removed (now ${entry.votes.length} votes)`);
        }
    }

    private entryToStringBase(entry: IMotwEntry): string {
        return `${entry.message} (${entry.votes.length} votes)`;
    }
    private entryToString(entry: IMotwEntry, index: number): string {
        return `${index + 1}: ${this.entryToStringBase(entry)}`;
    }
    private winnerToString(entry: IMotwHistoryEntry): string {
        return `${entry.date} - ` + this.entryToStringBase(entry);
    }
}
interface IMotwData {
    currentEntryWeek: Date;
    currentEntries: IMotwEntry[];
    pastWinners: IMotwHistoryEntry[];
}
interface IMotwHistoryEntry extends IMotwEntry {
    date: Date;
}
interface IMotwEntry {
    message: string;
    votes: fbapi.OutputID[];
}
