export class Task{
    constructor({id, title, completed, userId}){
        this.id = id;
        this.title = typeof title === 'string' ? title : String(title ?? '');
        this.completed = !!completed;
        this.userId = userId;
        this.timeStamp = new Date(Date.now() - Math.floor(Math.random() * 14) * 86400000);
    }

    toggle(){
        this.completed = !this.completed;
    }

    isOverdue(){
        const fullWeek = 7 * 24 * 60 * 60 * 1000;

        return Date.now() - this.timeStamp.getTime() > fullWeek && !this.completed;
    }

    getStatus(){
        return this.completed ? 'Completed' : 'Pending';
    }

    // optional method
    toLine() {
        const status = this.completed ? 'Completed' : (this.isOverdue() ? 'Overdue' : 'Pending');
        return `#${this.id} [User ${this.userId}] ${status} — ${this.title}`;
    }

}

export class PriorityTask extends Task{
    constructor({id, title, completed, userId, priority='medium', dueDate = null}){
        super({id, title, completed, userId});
        this.priority = priority;
        this.dueDate = dueDate ? new Date(dueDate) : null;
    }

    // override for priority-aware overdue logic
    isOverdue(){
        if(!this.dueDate) return super.isOverdue();

        return Date.now() > this.dueDate.getTime() && !this.completed;
    }

    getStatus(){
        return `
            ${super.getStatus()}
            [${this.priority}] ${this.isOverdue ? 'Overdue' : ''}

        `;
    }

    // check this functions
    
    // getStatus() {
    //     const base = super.getStatus();
    //     const overdue = this.isOverdue() ? ' (Overdue)' : '';
    //     return `${base} [${this.priority}]${overdue}`;
    // }

    toLine() {
        return `#${this.id} [User ${this.userId}] ${this.getStatus()} — ${this.title}`;
    }

}

export class User{
    constructor({id, name, email}){
        this.id = id;
        this.name = name;
        this.email = email;
        this.tasks = [];
    }

    addTask(task){
        this.tasks.push(task);
    }

    getCompletionRate(){
        const totalTasks = this.tasks.length;

        const completedTasks = this.tasks.filter(task => task.completed).length;

        return totalTasks ? Math.round((completedTasks/totalTasks) * 100) : 0;
    }

    getTasksByStatus(status = 'Completed'){
        return this.tasks.filter((task) => {
            task.getStatus().startsWith(status);
        });
    }

    label(){
        return `
            ${this.name ?? 'Unknown'}
            (@${this.username ?? 'user' + this.id})
        `;
    }
}