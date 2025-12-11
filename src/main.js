import { TaskManager } from "./taskManager.js";
import { runCLI } from "./cli.js";

async function main() {
    const manager = new TaskManager();

    // load using async/await + promise.all

    try{
        await manager.load({useCache: true});
    }catch(err){
        console.error('Failed to load data: ', err.message);
        process.exit(1);
    }

    await runCLI(manager);
}

main().catch(err => {
    console.log('Fatal: ', err.message);
    process.exit(1);
});
