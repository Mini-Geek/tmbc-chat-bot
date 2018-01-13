/**
 * Settings for message counts, emojis, and titles for different conversations.
 */
interface IThreadDetail {
    preferredEmoji: string;
    preferredTitle: string;
    threadStrId: string;
    stalkTarget: string;
    stalkMessage: string;
}
export const groups: {
    [key: string]: IThreadDetail
} = {
    "890328284337788": {
        preferredEmoji: "🍻",
        preferredTitle: "They Might Be Christians",
        stalkMessage: "ALL HAIL The Supreme Cowmander, The False Prophet, The First of His Name: Josh",
        stalkTarget: "180201030",
        threadStrId: "tmbc",
    },
    "1170697212952081": {
        preferredEmoji: "🍻",
        preferredTitle: "They Might Be Coders",
        stalkMessage: "Oh hai Tim",
        stalkTarget: "100001387064213",
        threadStrId: "tmbcoders",
    },
};
/**
 * The name of this bot that it will use to identify itself.
 */
export const userFriendlyName = "Robby";
/**
 * Pattern for listening for people talking to this bot.
 */
export const regexNamePattern = "(Robby( A[sz]imov)?)";
