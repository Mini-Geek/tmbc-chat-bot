import storage = require("node-persist");

export class StorageModule {
    public static storageInitialized = false;

    public static async init(): Promise<void> {
        if (!StorageModule.storageInitialized) {
            await storage.init({ dir: "./data" });
            StorageModule.storageInitialized = true;
        }
    }
}
