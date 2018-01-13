import storage = require("node-persist");

export class StorageModule {
    public static storageInitialized = false;

    public static init(): void {
        if (!StorageModule.storageInitialized) {
            storage.init({ dir: "./data" }, () => {
                StorageModule.storageInitialized = true;
            });
        }
    }
}
