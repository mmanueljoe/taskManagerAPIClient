import {test, expect, describe, beforeEach} from '@jest/globals';
import {Task, PriorityTask} from '../../src/models.js';
import {
    filterByStatus,
    calculateStatistics,
    groupByUser,
    filterByUser,
    searchTasks,
    uniqueTags,
    toTaskInstances
} from '../../src/taskProcessor.js';


// === FILTERBUSTATUS FUNCTION TESTS ===

describe('filterByStatus', () => {
    let tasks;

    beforeEach(() => {
        tasks = [
            new Task({ id: 1, title: 'Task 1', completed: true, userId: 1 }),
            new Task({ id: 2, title: 'Task 2', completed: false, userId: 1 }),
            new Task({ id: 3, title: 'Task 3', completed: true, userId: 2 }),
            new Task({ id: 4, title: 'Task 4', completed: false, userId: 2 })
        ];
    });

    test('should filter completed tasks when status is "Completed"', () => {
        const result = filterByStatus(tasks, 'Completed');

        expect(result.length).toBe(2);
        expect(result[0].id).toBe(1);
        expect(result[1].id).toBe(3);
        expect(result.every(task => task.completed)).toBe(true);
    });

    test('should filter pending tasks when status is "Pending"', () => {
        const result = filterByStatus(tasks, 'Pending');

        expect(result.length).toBe(2);
        expect(result[0].id).toBe(2);
        expect(result[1].id).toBe(4);
        expect(result.every(task => !task.completed)).toBe(true);
    });

    test('should default to "Completed" when status is not provided', () => {
        const result = filterByStatus(tasks);

        expect(result.length).toBe(2);
        expect(result[0].id).toBe(1);
        expect(result[1].id).toBe(3);
        expect(result.every(task => task.completed)).toBe(true);
    });

    test('should return empty array when no tasks match status', () => {
        const allCompleted = tasks.filter(t => t.completed);
        const result = filterByStatus(allCompleted, 'Pending');
        
        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
    });

    test('should return empty array when tasks array is empty', () => {
        const result = filterByStatus([], 'Completed');
        
        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
    });

    test('should work with PriorityTask status strings', () => {
        const priorityTask = new PriorityTask({
            id: 5,
            title: 'Priority Task',
            completed: true,
            userId: 1,
            priority: 'high'
        });
        
        const mixedTasks = [...tasks, priorityTask];
        const result = filterByStatus(mixedTasks, 'Completed');
        
        expect(result.length).toBe(3);
        expect(result.some(task => task.id === 5)).toBe(true);
    });

    test('should not mutate original array', () => {
        const originalLength = tasks.length;
        const originalIds = tasks.map(t => t.id);
        
        filterByStatus(tasks, 'Completed');
        
        expect(tasks.length).toBe(originalLength);
        expect(tasks.map(t => t.id)).toEqual(originalIds);
    });

    test('should handle null tasks array', () => {
        expect(() => filterByStatus(null, 'Completed')).toThrow();
    });

    test('should handle undefined tasks array', () => {
        expect(() => filterByStatus(undefined, 'Completed')).toThrow();
    });
});


// === CALCULATESTATISTICS FUNCTION TESTS ===

describe('calculateStatistics', () => {
    let tasks;

    beforeEach(() => {
    tasks = [];
    });
    
    test('should calculate correct statistics for mixed tasks', () => {
        
        tasks = [
            new Task({ id: 1, title: 'Task 1', completed: true, userId: 1 }),
            new Task({ id: 2, title: 'Task 2', completed: false, userId: 1 }),
            new Task({ id: 3, title: 'Task 3', completed: true, userId: 2 }),
            new Task({ id: 4, title: 'Task 4', completed: false, userId: 2 }),
            new Task({ id: 5, title: 'Task 5', completed: false, userId: 3 })
        ];
        // set one task as overdue
        tasks[1].timeStamp = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    
        const stats = calculateStatistics(tasks);
    
        expect(stats.totalTasks).toBe(5);
        expect(stats.completedTasks).toBe(2);
        expect(stats.pendingTasks).toBe(3);
        expect(stats.overdueTasks).toBe(1);
        expect(stats.uniqueUsers).toBe(3);
    });

    test('should return zeros for empty tasks array', () => {
        const stats = calculateStatistics([]);
        
        expect(stats.totalTasks).toBe(0);
        expect(stats.completedTasks).toBe(0);
        expect(stats.pendingTasks).toBe(0);
        expect(stats.uniqueUsers).toBe(0);
        expect(stats.overdueTasks).toBe(0);
    });

    test('should correctly count all completed tasks', () => {
        tasks = [
            new Task({ id: 1, title: 'Task 1', completed: true, userId: 1 }),
            new Task({ id: 2, title: 'Task 2', completed: true, userId: 1 }),
            new Task({ id: 3, title: 'Task 3', completed: true, userId: 2 })
        ];
        
        const stats = calculateStatistics(tasks);
        
        expect(stats.completedTasks).toBe(3);
        expect(stats.pendingTasks).toBe(0);
    });

    test('should correctly count all pending tasks', () => {
        tasks = [
            new Task({ id: 1, title: 'Task 1', completed: false, userId: 1 }),
            new Task({ id: 2, title: 'Task 2', completed: false, userId: 1 }),
            new Task({ id: 3, title: 'Task 3', completed: false, userId: 2 })
        ];
        
        const stats = calculateStatistics(tasks);
        
        expect(stats.completedTasks).toBe(0);
        expect(stats.pendingTasks).toBe(3);
    });

    test('should correctly count unique users', () => {
        tasks = [
            new Task({ id: 1, title: 'Task 1', completed: false, userId: 1 }),
            new Task({ id: 2, title: 'Task 2', completed: false, userId: 1 }),
            new Task({ id: 3, title: 'Task 3', completed: false, userId: 2 }),
            new Task({ id: 4, title: 'Task 4', completed: false, userId: 3 }),
            new Task({ id: 5, title: 'Task 5', completed: false, userId: 3 })
        ];
        
        const stats = calculateStatistics(tasks);
        
        expect(stats.uniqueUsers).toBe(3);
    });

    test('should correctly count overdue tasks', () => {
        tasks = [
            new Task({ id: 1, title: 'Task 1', completed: false, userId: 1 }),
            new Task({ id: 2, title: 'Task 2', completed: false, userId: 1 }),
            new Task({ id: 3, title: 'Task 3', completed: true, userId: 2 }) // Completed, not overdue
        ];
        
        // Set first two as overdue
        tasks[0].timeStamp = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
        tasks[1].timeStamp = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
        tasks[2].timeStamp = new Date(Date.now() - 9 * 24 * 60 * 60 * 1000); // Completed, shouldn't count
        
        const stats = calculateStatistics(tasks);
        
        expect(stats.overdueTasks).toBe(2);
    });

    test('should handle tasks with same user ID correctly', () => {
        tasks = [
            new Task({ id: 1, title: 'Task 1', completed: false, userId: 1 }),
            new Task({ id: 2, title: 'Task 2', completed: true, userId: 1 }),
            new Task({ id: 3, title: 'Task 3', completed: false, userId: 1 })
        ];
        
        const stats = calculateStatistics(tasks);
        
        expect(stats.uniqueUsers).toBe(1);
        expect(stats.totalTasks).toBe(3);
    });

    test('should return object with all required properties', () => {
        tasks = [
            new Task({ id: 1, title: 'Task 1', completed: true, userId: 1 })
        ];
        
        const stats = calculateStatistics(tasks);
        
        expect(stats).toHaveProperty('totalTasks');
        expect(stats).toHaveProperty('completedTasks');
        expect(stats).toHaveProperty('pendingTasks');
        expect(stats).toHaveProperty('overdueTasks');
        expect(stats).toHaveProperty('uniqueUsers');
    });

    test('should handle null tasks array', () => {
        expect(() => calculateStatistics(null)).toThrow();
    });

    test('should handle undefined tasks array', () => {
        expect(() => calculateStatistics(undefined)).toThrow();
    });

});

// === GROUPBYUSER FUNCTION TESTS ===
describe('groupByUser', () => {
    let tasks;

    beforeEach(() => {
        tasks = [];
    });

    test('should group tasks by user ID correctly', () => {
        tasks = [
            new Task({ id: 1, title: 'Task 1', completed: false, userId: 1 }),
            new Task({ id: 2, title: 'Task 2', completed: true, userId: 1 }),
            new Task({ id: 3, title: 'Task 3', completed: false, userId: 2 }),
            new Task({ id: 4, title: 'Task 4', completed: true, userId: 2 })
        ];
        
        const result = groupByUser(tasks);
        
        expect(result instanceof Map).toBe(true);
        expect(result.size).toBe(2);
        expect(result.get(1).length).toBe(2);
        expect(result.get(2).length).toBe(2);
    });

    test('should return empty Map for empty tasks array', () => {
        const result = groupByUser([]);
        
        expect(result instanceof Map).toBe(true);
        expect(result.size).toBe(0);
    });

    test('should handle single user with multiple tasks', () => {
        tasks = [
            new Task({ id: 1, title: 'Task 1', completed: false, userId: 1 }),
            new Task({ id: 2, title: 'Task 2', completed: true, userId: 1 }),
            new Task({ id: 3, title: 'Task 3', completed: false, userId: 1 })
        ];
        
        const result = groupByUser(tasks);
        
        expect(result.size).toBe(1);
        expect(result.get(1).length).toBe(3);
    });

    test('should preserve task order within each user group', () => {
        tasks = [
            new Task({ id: 1, title: 'Task 1', completed: false, userId: 1 }),
            new Task({ id: 2, title: 'Task 2', completed: true, userId: 1 }),
            new Task({ id: 3, title: 'Task 3', completed: false, userId: 1 })
        ];
        
        const result = groupByUser(tasks);
        const userTasks = result.get(1);
        
        expect(userTasks[0].id).toBe(1);
        expect(userTasks[1].id).toBe(2);
        expect(userTasks[2].id).toBe(3);
    });

    test('should work with PriorityTask instances', () => {
        tasks = [
            new Task({ id: 1, title: 'Task 1', completed: false, userId: 1 }),
            new PriorityTask({ id: 2, title: 'Priority Task', completed: true, userId: 1, priority: 'high' })
        ];
        
        const result = groupByUser(tasks);
        
        expect(result.get(1).length).toBe(2);
        expect(result.get(1)[0] instanceof Task).toBe(true);
        expect(result.get(1)[1] instanceof PriorityTask).toBe(true);
    });

    test('should not mutate original tasks array', () => {
        tasks = [
            new Task({ id: 1, title: 'Task 1', completed: false, userId: 1 }),
            new Task({ id: 2, title: 'Task 2', completed: true, userId: 2 })
        ];
        
        const originalLength = tasks.length;
        groupByUser(tasks);
        
        expect(tasks.length).toBe(originalLength);
    });

    test('should handle null tasks array', () => {
        expect(() => groupByUser(null)).toThrow();
    });

    test('should handle undefined tasks array', () => {
        expect(() => groupByUser(undefined)).toThrow();
    });

});


// === SEARCHTASKS FUNCTION TESTS ===
describe('searchTasks', () => {
    let tasks;

    beforeEach(() => {
        tasks = [
            new Task({ id: 1, title: 'Buy groceries', completed: false, userId: 1 }),
            new Task({ id: 2, title: 'Complete project', completed: true, userId: 1 }),
            new Task({ id: 3, title: 'Buy milk and eggs', completed: false, userId: 2 }),
            new Task({ id: 4, title: 'Project documentation', completed: false, userId: 2 })
        ];
    });

    test('should find tasks matching single keyword', () => {
        const result = searchTasks(tasks, 'buy');
        
        expect(result.length).toBe(2);
        expect(result.some(t => t.id === 1)).toBe(true);
        expect(result.some(t => t.id === 3)).toBe(true);
    });

    test('should find tasks matching multiple keywords (AND logic)', () => {
        const result = searchTasks(tasks, 'buy', 'milk');
        
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(3);
    });

    test('should return empty array when no tasks match keywords', () => {
        const result = searchTasks(tasks, 'nonexistent');
        
        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
    });

    test('should be case insensitive', () => {
        const result1 = searchTasks(tasks, 'BUY');
        const result2 = searchTasks(tasks, 'buy');
        const result3 = searchTasks(tasks, 'Buy');
        
        expect(result1.length).toBe(2);
        expect(result2.length).toBe(2);
        expect(result3.length).toBe(2);
        expect(result1.map(t => t.id).sort()).toEqual(result2.map(t => t.id).sort());
    });

    test('should return empty array when tasks array is empty', () => {
        const result = searchTasks([], 'test');
        
        expect(result).toEqual([]);
    });

    test('should handle empty keyword string', () => {
        const result = searchTasks(tasks, '');
        
        // Empty string should match all tasks (every task includes empty string)
        expect(result.length).toBe(tasks.length);
    });

    test('should handle multiple empty keywords', () => {
        const result = searchTasks(tasks, '', '');
        
        expect(result.length).toBe(tasks.length);
    });

    test('should not mutate original tasks array', () => {
        const originalLength = tasks.length;
        const originalIds = tasks.map(t => t.id);
        
        searchTasks(tasks, 'buy');
        
        expect(tasks.length).toBe(originalLength);
        expect(tasks.map(t => t.id)).toEqual(originalIds);
    });

    test('should handle numeric keywords by converting to string', () => {
        const taskWithNumber = new Task({ id: 5, title: 'Task 123', completed: false, userId: 1 });
        const tasksWithNumber = [...tasks, taskWithNumber];
        
        const result = searchTasks(tasksWithNumber, 123);
        
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(5);
    });

    test('should require all keywords to match (AND logic)', () => {
        const result = searchTasks(tasks, 'project', 'complete');
        
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(2);
    });

    test('should return empty array when not all keywords match', () => {
        const result = searchTasks(tasks, 'buy', 'nonexistent');
        
        expect(result).toEqual([]);
    });

    test('should handle null tasks array', () => {
        expect(() => searchTasks(null, 'test')).toThrow();
    });

    test('should handle undefined tasks array', () => {
        expect(() => searchTasks(undefined, 'test')).toThrow();
    });


});


// === FILTERBYUSER FUNCTION TESTS ===
describe('filterByUser', () => {
    let tasks;

    beforeEach(() => {
        tasks = [
            new Task({ id: 1, title: 'Task 1', completed: false, userId: 1 }),
            new Task({ id: 2, title: 'Task 2', completed: true, userId: 1 }),
            new Task({ id: 3, title: 'Task 3', completed: false, userId: 2 }),
            new Task({ id: 4, title: 'Task 4', completed: true, userId: 2 })
        ];
    });

    test('should filter tasks by user ID correctly', () => {
        const result = filterByUser(tasks, 1);
        
        expect(result.length).toBe(2);
        expect(result.every(task => task.userId === 1)).toBe(true);
    });

    test('should return empty array when no tasks match user ID', () => {
        const result = filterByUser(tasks, 999);
        
        expect(result).toEqual([]);
    });

    test('should convert string userId to number', () => {
        const result = filterByUser(tasks, '1');
        
        expect(result.length).toBe(2);
        expect(result.every(task => task.userId === 1)).toBe(true);
    });

    test('should return empty array for empty tasks array', () => {
        const result = filterByUser([], 1);
        
        expect(result).toEqual([]);
    });

    test('should not mutate original array', () => {
        const originalLength = tasks.length;
        filterByUser(tasks, 1);
        
        expect(tasks.length).toBe(originalLength);
    });
});

// === UNIQUETAGS FUNCTION TESTS ===
describe('uniqueTags', () => {
    let tasks;

    beforeEach(() => {
        tasks = [];
    });

    test('should extract unique tags from task titles', () => {
        tasks = [
            new Task({ id: 1, title: 'Complete project documentation', completed: false, userId: 1 }),
            new Task({ id: 2, title: 'Review project code', completed: false, userId: 1 })
        ];
        
        const tags = uniqueTags(tasks);
        
        expect(tags instanceof Set).toBe(true);
        expect(tags.has('complete')).toBe(true);
        expect(tags.has('project')).toBe(true);
        expect(tags.has('documentation')).toBe(true);
    });

    test('should only include words with 6 or more characters', () => {
        tasks = [
            new Task({ id: 1, title: 'Buy milk eggs bread', completed: false, userId: 1 })
        ];
        
        const tags = uniqueTags(tasks);
        
        // 'bread' has 5 chars, shouldn't be included
        expect(tags.has('bread')).toBe(false);
    });

    test('should return lowercase tags', () => {
        tasks = [
            new Task({ id: 1, title: 'COMPLETE PROJECT', completed: false, userId: 1 })
        ];
        
        const tags = uniqueTags(tasks);
        
        expect(tags.has('complete')).toBe(true);
        expect(tags.has('project')).toBe(true);
    });

    test('should return empty Set for empty tasks array', () => {
        const tags = uniqueTags([]);
        
        expect(tags instanceof Set).toBe(true);
        expect(tags.size).toBe(0);
    });

    test('should return empty Set for non-array input', () => {
        const tags = uniqueTags(null);
        
        expect(tags instanceof Set).toBe(true);
        expect(tags.size).toBe(0);
    });

    test('should handle tasks with empty titles', () => {
        tasks = [
            new Task({ id: 1, title: '', completed: false, userId: 1 }),
            new Task({ id: 2, title: 'Complete project', completed: false, userId: 1 })
        ];
        
        const tags = uniqueTags(tasks);
        
        expect(tags.size).toBeGreaterThan(0);
        expect(tags.has('complete')).toBe(true);
    });

    test('should remove duplicate tags', () => {
        tasks = [
            new Task({ id: 1, title: 'Complete project', completed: false, userId: 1 }),
            new Task({ id: 2, title: 'Complete documentation', completed: false, userId: 1 })
        ];
        
        const tags = uniqueTags(tasks);
        
        // 'complete' appears in both, should only be once in Set
        const completeArray = Array.from(tags).filter(t => t === 'complete');
        expect(completeArray.length).toBe(1);
    });

    test('should handle null task titles', () => {
        tasks = [
            new Task({ id: 1, title: null, completed: false, userId: 1 }),
            new Task({ id: 2, title: 'Complete project', completed: false, userId: 1 })
        ];
        
        const tags = uniqueTags(tasks);
        
        expect(tags.size).toBeGreaterThan(0);
    });
});

// === TOTASKINSTANCES FUNCTION TESTS ===
describe('toTaskInstances', () => {
    let rawTodos;

    beforeEach(() => {
        rawTodos = [
            { id: 10, title: 'Task 1', completed: false, userId: 1 },
            { id: 20, title: 'Task 2', completed: true, userId: 1 },
            { id: 3, title: 'Task 3', completed: false, userId: 2 }
        ];
    });

    test('should convert raw todos to Task instances', () => {
        const result = toTaskInstances(rawTodos, { asPriority: false });
        
        expect(result.length).toBe(3);
        expect(result.every(task => task instanceof Task)).toBe(true);
        expect(result[0].id).toBe(10);
        expect(result[1].id).toBe(20);
        expect(result[2].id).toBe(3);
    });

    test('should create PriorityTask for IDs divisible by 10 when asPriority is true', () => {
        const result = toTaskInstances(rawTodos, { asPriority: true });
        
        expect(result[0] instanceof PriorityTask).toBe(true);
        expect(result[1] instanceof PriorityTask).toBe(true);
        expect(result[2] instanceof Task).toBe(true);
    });

    test('should default to asPriority true', () => {
        const result = toTaskInstances(rawTodos);
        
        expect(result[0] instanceof PriorityTask).toBe(true);
        expect(result[1] instanceof PriorityTask).toBe(true);
        expect(result[2] instanceof Task).toBe(true);
    });

    test('should set correct properties on Task instances', () => {
        const result = toTaskInstances(rawTodos, { asPriority: false });
        
        expect(result[0].id).toBe(10);
        expect(result[0].title).toBe('Task 1');
        expect(result[0].completed).toBe(false);
        expect(result[0].userId).toBe(1);
    });

    test('should set priority and dueDate on PriorityTask instances', () => {
        const result = toTaskInstances(rawTodos, { asPriority: true });
        
        expect(result[0].priority).toBe('high');
        expect(result[0].dueDate).toBeInstanceOf(Date);
    });

    test('should return empty array for empty input', () => {
        const result = toTaskInstances([]);
        
        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
    });
});