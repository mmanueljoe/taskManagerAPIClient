import {Task, PriorityTask} from './models.js';

// transform raw todos/prioritytask instances
export const toTaskInstances = (todos, {asPriority = true} = {}) => {

    return todos.map(
        ({id, title, completed, userId}) => {
            if(asPriority && id % 10 === 0){
                return new PriorityTask({
                    id, title, completed, userId,
                    priority: 'high',
                    dueDate: new Date(Date.now() + 2 * 86400000).toISOString()
                });
            }
            return new Task({id, title, completed, userId});
        });
}

// filter by status using method status
export const filterByStatus = (tasks, status = 'Completed') => {
    return tasks.filter(t => t.getStatus().startsWith(status));
}

// filter by user
export const filterByUser = (tasks, userId) => {
    return tasks.filter(t => t.userId === Number(userId));
}

// search by keywords(s)
export const searchTasks = (tasks, ...keywords) =>{
    const needles = keywords.map(k => String(k).toLowerCase());


    return tasks.filter(t => 
        needles.every(k => String(t.title).toLowerCase().includes(k))
    );
}


// group task by user using map
export const groupByUser = (tasks) => {
    const mapOfUsers = new Map();

    for (const task of tasks) {
        const arr = mapOfUsers.get(task.userId) ?? [];
        arr.push(task);
        mapOfUsers.set(task.userId, arr);
    }

    return mapOfUsers;
}

// extract unique 'tags' from titles
export const uniqueTags = (tasks) => {
    const tags = new Set();
    
    if(!Array.isArray(tasks)) return tags; // 



    tasks.forEach(task => {
        const title = String(task?.title ?? '');
        
        if(!title) return;

        task.title
        .split(/\W+/)
        .filter(word => word.length >= 6)
        .forEach(word => tags.add(word.toLowerCase()));
    });

    return tags;
}

// calculate statistics
export const calculateStatistics = (tasks) => {
    const totalTasks = tasks.length;

    const completedTasks = tasks.reduce((accumulated, task) => {
        return accumulated + (task.completed ? 1 : 0)
    }, 0);

    const pendingTasks = totalTasks - completedTasks;
    
    const uniqueUsers = new Set(tasks.map(task => task.userId)).size;

    const overdueTasks = tasks.reduce((accumulated, task) => {
        return accumulated + (task.isOverdue() ? 1 : 0)
    }, 0);

    return {totalTasks, completedTasks, pendingTasks, overdueTasks, uniqueUsers}
}
