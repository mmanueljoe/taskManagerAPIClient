import {APIClient} from './api.js';
import {User} from './models.js';
import {
    toTaskInstances, filterByStatus, filterByUser,
    groupByUser, calculateStatistics, searchTasks,
    uniqueTags
} from './taskProcessor.js';



export class TaskManager {
    constructor(api = new APIClient()) {
        this.api = api;
        this.users = [];
        this.tasks = [];
        this.loaded = false;
    }

    // load users & todos concurrently using async/await

    async load({useCache = true} = {}) {
        try {
            const [usersRaw, todosRaw] = await Promise.all([
                this.api.fetchUsers({useCache}),
                this.api.fetchTodos({useCache})
            ]);

            this.users = usersRaw.map((user) => new User(user));
            this.tasks = toTaskInstances(todosRaw, {asPriority: true});

            // attach tasks to users
            const grouped = groupByUser(this.tasks);

            this.users.forEach(
                user => {(grouped.get(user.id) ?? [])
                    .forEach(task => user.addTask(task));
            });

            this.loaded = true;
            return true;
        }catch(err){
            throw new Error(`Load failed: ${err.message}`);
        }
    }

    ensureLoaded() {
        if (!this.loaded) throw new Error('Data not loaded. Call load() first');
    }

    // queries
    allTasks(){
        this.ensureLoaded();
        return this.tasks;
    }

    tasksByUser(userId){
        this.ensureLoaded();
        return filterByUser(this.tasks, userId);
    }

    completedTasks(){
        this.ensureLoaded();
        return filterByStatus(this.tasks, 'Completed');
    }

    pendingTasks(){
        this.ensureLoaded();
        return filterByStatus(this.tasks, 'Pending');
    }

    statistics(){
        this.ensureLoaded();
        return calculateStatistics(this.tasks);
    }

    usersLeaderboard(){
        this.ensureLoaded();
        return [...this.users]
        .map((user) => {
           return ({id: user.id, name: user.name, username: user.username, rate: user.getCompletionRate()})
        })
        .sort((a,b) => b.rate - a.rate);
    }

    search(...keywords){
        this.ensureLoaded();
        return searchTasks(this.tasks, ...keywords);
    }

    tags(){
        this.ensureLoaded();
        return uniqueTags(this.tasks);
    }

    getUserLabel(userId) {
        const user = this.users.find((user) => user.id === Number(userId));
        return user ? user.label() : `User ${userId}`;
    }

    toggleTask(taskId){
        this.ensureLoaded();
        const task = this.tasks.find(task => task.id === Number(taskId));

        if(!task) throw new Error(`Task #${taskId} not found`);

        task.toggle();

        return task;
    }

}