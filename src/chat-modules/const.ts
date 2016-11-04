/**
 * Settings for message counts, emojis, and titles for different conversations.
 */
export const groups: {
    [key: string]: { preferredEmoji: string, preferredTitle: string, countBeforeMe: number, threadStrId: string }
} = {
    "890328284337788": {
        countBeforeMe: 169700,
        preferredEmoji: "🍻",
        preferredTitle: "They Might Be Christians",
        threadStrId: "tmbc",
    },
    "1170697212952081": {
        countBeforeMe: 0,
        preferredEmoji: "🍻",
        preferredTitle: "They Might Be Coders",
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
