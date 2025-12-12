import { TaskManager } from "./taskManager.js";
import { runCLI } from "./cli.js";
import { UI } from "./ui.js";

const manager = new TaskManager();
const ui = new UI();

ui.bindActions({
  onLoad: async () => {
    try {
      ui.setLoading(true);
      await manager.load({ useCache: true });
      ui.renderUsersSelect(manager.users);
      ui.showMessage("Loaded. Choose an action.");
    } catch (err) {
      ui.showError(err.message);
    }
  },

  onAll: () => {
    try {
      ui.renderTasks(manager.allTasks(), "All Tasks");
    } catch (e) {
      ui.showError(e.message);
    }
  },

  onUserChange: (userId) => {
    try {
      ui.renderTasks(
        manager.tasksByUser(userId),
        `Tasks for ${manager.getUserLabel(userId)}`
      );
    } catch (e) {
      ui.showError(e.message);
    }
  },

  onStats: () => {
    try {
      ui.renderStats(manager.statistics());
    } catch (e) {
      ui.showError(e.message);
    }
  },

  onCompleted: () => {
    try {
      ui.renderTasks(manager.completedTasks(), "Completed Tasks");
    } catch (e) {
      ui.showError(e.message);
    }
  },

  onPending: () => {
    try {
      ui.renderTasks(manager.pendingTasks(), "Pending Tasks");
    } catch (e) {
      ui.showError(e.message);
    }
  },

  onSearch: (keywords) => {
    try {
      const res = manager.search(...keywords);
      ui.renderTasks(res, `Search: ${keywords.join(", ")}`);
    } catch (e) {
      ui.showError(e.message);
    }
  },

  onLeaderboard: () => {
    try {
      ui.renderLeaderboard(manager.usersLeaderboard());
    } catch (e) {
      ui.showError(e.message);
    }
  },

  onTags: () => {
    try {
      ui.renderTags(manager.tags());
    } catch (e) {
      ui.showError(e.message);
    }
  },
});

async function main() {
  const manager = new TaskManager();

  // load using async/await + promise.all

  try {
    await manager.load({ useCache: true });
  } catch (err) {
    console.error("Failed to load data: ", err.message);
    process.exit(1);
  }

  await runCLI(manager);
}

main().catch((err) => {
  console.log("Fatal: ", err.message);
  process.exit(1);
});
