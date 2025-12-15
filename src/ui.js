import { getElementByType } from "./utils.js";

export class UI {
  constructor() {
    this.elements = {
      load: getElementByType("id", "load"),
      all: getElementByType("id", "all"),
      userSelect: getElementByType("id", "userSelect"),
      stats: getElementByType("id", "stats"),
      completed: getElementByType("id", "completed"),
      pending: getElementByType("id", "pending"),
      searchInput: getElementByType("id", "searchInput"),
      searchBtn: getElementByType("id", "searchBtn"),
      leaderboard: getElementByType("id", "leaderboard"),
      tagsBtn: getElementByType("id", "tagsBtn"),
      panel: getElementByType("id", "panel"),
    };
  }

  // rendering helpers
  renderInfo(info) {
    this.elements.panel.innerHTML = info;
  }

  setLoading(loading = true) {
    if (loading) {
      this.renderInfo(
        `<div class='card'>
                    <p>Loading...</p>
                </div>`
      );
    }
  }

  showError(message) {
    this.renderInfo(
      `<div class='card'>
                <p style='style="color:#ef4444"'>Error: ${message}</p>
            </div>`
    );
  }

  showMessage(message) {
    this.renderInfo(
      `<div class='card'>
                <p>${message}</p>
            </div>`
    );
  }

  renderUsersSelect(users) {
    this.elements.userSelect.innerHTML =
      `<option value=''>
            (select user)
        </option>` +
      users
        .map(
          (user) => `<option value='${user.id}>
            #${user.id} ${user.name}
        </option>'`
        )
        .join("");
  }

  renderTasks(tasks, title = "Tasks") {
    if (!Array.isArray(tasks) || tasks.length == 0) {
      this.renderInfo(
        `<div class='card'>
                    <h3>${title}</h3>
                    <p>No tasks found.</p>
                </div>`
      );
      return;
    }

    const cards = tasks
      .slice(0, 50)
      .map((task) => {
        const statusClass = task.completed
          ? "Completed"
          : task.isOverdue()
          ? "Overdue"
          : "Pending";
        return `
                    <div class='card'>
                        <div class='status'>
                            <span class='${statusClass}'>
                                ${task.getStatus()}
                            </span>
                            &nbsp;•&nbsp; User ${task.userId} • #${task.id}
                        </div>
                        <div><strong>${task.title}</strong></div>
                    </div>
                `;
      })
      .join("");
    this.renderInfo(`
            <h3>${title}</h3>
            <div class='cards'>
                ${cards}
            </div>    
        `);
  }

  renderStats(stats) {
    const info = `
            <h3>Statistics</h3>
            <div class='stats'>
                <div class='stat'>
                    <div>Total</div><strong>${stats.totalTasks}</strong>
                <div>
                <div class='stat'>
                    <div>Completed</div><strong>${stats.completedTasks}</strong>
                </div>
                <div class='stat'>
                    <div>Pending</div><strong>${stats.pendingTasks}</strong>
                </div>
                <div class='stat'>
                    <div>Overdue</div><strong>${stats.overdueTasks}</strong>
                </div>
                <div class='stat'>
                    <div>Unique users</div><strong>${stats.uniqueUsers}</strong>
                </div>
            </div>
        `;
        this.renderInfo(info);
  }

  renderLeaderboard(rows){
    if(!Array.isArray(rows) || rows.length === 0){
        this.renderInfo(`
            <div class='card'>
                <h3>Leaderboard<h3>
                <p class='muted'>No users.<p>
            </div>
        `);
        return;
    }

    const rowsInfo = rows.map((row) => 
        `<tr><td>#${row.id}</td><td>${row.name} (@${row.username})</td><td>${row.rate}%</td></tr>`
    ).join('');

    this.renderInfo(
        `
            <h3>Leaderboard</h3>
            <table class='table'>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Name</th>
                        <th>Completion</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsInfo}
                </tbody>
            </table>
        `);
  }

  renderTags(set){
    const list = (set instanceof Set) ? [...set] : [];

    if(list.length === 0){
        this.renderInfo(
            `<div class='card'>
                <h3>Tags</h3>
                <p class='muted'>No tags detected</p>
            </div>`
        );
        return;
    }

    this.renderInfo(`
        <h3>Tags</h3>
        <p>${list.sort().join(',')}</p>
    `);
  }

  // event wiring
  bindActions(callbacks){
    const {onLoad, onAll, onUserChange, onStats, onCompleted, onPending, onSearch,
        onLeaderboard, onTags
    } = callbacks;


    if(onLoad){
        this.elements.load.addEventListener('click', onLoad);
    }

    if(onAll){
        this.elements.all.addEventListener('click', onAll);
    }

    if(onUserChange){
        this.elements.userSelect.addEventListener('change', (e) => {
            const userId = e.target.value;
            if(userId) onUserChange(userId);
        })
    }

    if(onStats){
        this.elements.stats.addEventListener('click', onStats);
    }

    if(onPending){
        this.elements.pending.addEventListener('click', onPending);
    }

    if(onCompleted){
        this.elements.completed.addEventListener('click', onCompleted);
    }

    if(onSearch){
        this.elements.searchBtn.addEventListener('click', () => {
            const query = this.elements.searchInput.value.trim();

            if(!query) return;

            const keywords = query.split(/\s+/).filter(Boolean);
            onSearch(keywords);
        });
    }

    if(onLeaderboard){
        this.elements.leaderboard.addEventListener('click', onLeaderboard);
    }

    if(onTags){
        this.elements.tagsBtn.addEventListener('click', onTags);
    }
  }
}
