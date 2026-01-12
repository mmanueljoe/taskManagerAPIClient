import { test, expect, describe, beforeEach, afterEach, jest } from '@jest/globals';
import { Task, User } from '../../src/models.js';
import {
    filterByStatus,
    calculateStatistics,
    uniqueTags,
} from '../../src/taskProcessor.js';
import { TaskManager } from '../../src/taskManager.js';
import { APIClient } from '../__mocks__/api.js';

// ============================================
// SPY TESTS - ARRAY METHODS
// ============================================
describe('Spy Tests - Array Methods', () => {
    let tasks;
    let spyFilter;
    let spyMap;
    let spyReduce;
    let spyForEach;

    beforeEach(() => {
        tasks = [
            new Task({ id: 1, title: 'Task 1', completed: true, userId: 1 }),
            new Task({ id: 2, title: 'Task 2', completed: false, userId: 1 }),
            new Task({ id: 3, title: 'Task 3', completed: true, userId: 2 })
        ];
    });

    afterEach(() => {
        // Restore all spies
        if (spyFilter) spyFilter.mockRestore();
        if (spyMap) spyMap.mockRestore();
        if (spyReduce) spyReduce.mockRestore();
        if (spyForEach) spyForEach.mockRestore();
    });

    test('should spy on Array.filter() in filterByStatus', () => {
        spyFilter = jest.spyOn(Array.prototype, 'filter');
        
        filterByStatus(tasks, 'Completed');
        
        expect(spyFilter).toHaveBeenCalledTimes(1);
        expect(spyFilter).toHaveBeenCalledWith(expect.any(Function));
        
        spyFilter.mockRestore();
    });

    test('should spy on Array.map() in calculateStatistics', () => {
        spyMap = jest.spyOn(Array.prototype, 'map');
        
        calculateStatistics(tasks);
        
        expect(spyMap).toHaveBeenCalledTimes(1);
        expect(spyMap).toHaveBeenCalledWith(expect.any(Function));
        
        spyMap.mockRestore();
    });

    test('should spy on Array.reduce() in calculateStatistics', () => {
        spyReduce = jest.spyOn(Array.prototype, 'reduce');
        
        calculateStatistics(tasks);
        
        // reduce is called twice (for completedTasks and overdueTasks)
        expect(spyReduce).toHaveBeenCalledTimes(2);
        expect(spyReduce).toHaveBeenCalledWith(expect.any(Function), 0);
        
        spyReduce.mockRestore();
    });

    test('should spy on Array.forEach() in uniqueTags', () => {
        spyForEach = jest.spyOn(Array.prototype, 'forEach');
        
        uniqueTags(tasks);
        
        expect(spyForEach).toHaveBeenCalled();
        
        spyForEach.mockRestore();
    });
});

// ============================================
// SPY TESTS - INTERNAL METHOD CALLS
// ============================================
describe('Spy Tests - Internal Method Calls', () => {
    let task;
    let taskManager;
    let spyToggle;
    let spyGetStatus;
    let spyIsOverdue;
    let spyAddTask;
    let spyGetCompletionRate;

    beforeEach(() => {
        task = new Task({ id: 1, title: 'Test Task', completed: false, userId: 1 });
        taskManager = new TaskManager(new APIClient());
    });

    afterEach(() => {
        if (spyToggle) spyToggle.mockRestore();
        if (spyGetStatus) spyGetStatus.mockRestore();
        if (spyIsOverdue) spyIsOverdue.mockRestore();
        if (spyAddTask) spyAddTask.mockRestore();
        if (spyGetCompletionRate) spyGetCompletionRate.mockRestore();
    });

    test('should spy on toggle() method when TaskManager.toggleTask() is called', () => {
        spyToggle = jest.spyOn(task, 'toggle');
        
        taskManager.tasks = [task];
        taskManager.loaded = true;
        taskManager.toggleTask(1);
        
        expect(spyToggle).toHaveBeenCalledTimes(1);
        expect(spyToggle).toHaveBeenCalledWith();
        
        spyToggle.mockRestore();
    });

    test('should spy on getStatus() method in filterByStatus', () => {
        spyGetStatus = jest.spyOn(task, 'getStatus');
        
        filterByStatus([task], 'Pending');
        
        expect(spyGetStatus).toHaveBeenCalledTimes(1);
        expect(spyGetStatus).toHaveReturnedWith('Pending');
        
        spyGetStatus.mockRestore();
    });

    test('should spy on isOverdue() method in calculateStatistics', () => {
        spyIsOverdue = jest.spyOn(task, 'isOverdue');
        
        calculateStatistics([task]);
        
        expect(spyIsOverdue).toHaveBeenCalledTimes(1);
        
        spyIsOverdue.mockRestore();
    });

    test('should spy on addTask() when TaskManager loads data', async () => {
        spyAddTask = jest.spyOn(User.prototype, 'addTask');
        
        await taskManager.load({ useCache: false });
        
        // Should be called for each task assigned to users
        expect(spyAddTask).toHaveBeenCalled();
        expect(spyAddTask).toHaveBeenCalledWith(expect.any(Task));
        
        spyAddTask.mockRestore();
    });

    test('should spy on getCompletionRate() in usersLeaderboard', async () => {
        await taskManager.load({ useCache: false });
        
        const user = taskManager.users[0];
        spyGetCompletionRate = jest.spyOn(user, 'getCompletionRate');
        
        taskManager.usersLeaderboard();
        
        expect(spyGetCompletionRate).toHaveBeenCalled();
        
        spyGetCompletionRate.mockRestore();
    });
});

// ============================================
// SPY TESTS - CONSOLE METHODS
// ============================================
describe('Spy Tests - Console Methods', () => {
    let consoleLogSpy;
    let consoleErrorSpy;
    let consoleWarnSpy;

    beforeEach(() => {
        // Spy on console methods
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore all console spies
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    test('should spy on console.log() calls', () => {
        console.log('Test message');
        
        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledWith('Test message');
    });

    test('should spy on console.error() calls', () => {
        console.error('Error message');
        
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error message');
    });

    test('should spy on console.warn() calls', () => {
        console.warn('Warning message');
        
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledWith('Warning message');
    });

    test('should verify console.log is called with multiple arguments', () => {
        console.log('Message 1', 'Message 2', { data: 'test' });
        
        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledWith('Message 1', 'Message 2', { data: 'test' });
    });

    test('should verify console.error call count', () => {
        console.error('Error 1');
        console.error('Error 2');
        console.error('Error 3');
        
        expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
    });
});

// ============================================
// SPY TESTS - FUNCTION CALL SEQUENCES
// ============================================
describe('Spy Tests - Function Call Sequences', () => {
    let task;
    let spyGetStatus;
    let spyFilter;

    beforeEach(() => {
        task = new Task({ id: 1, title: 'Test Task', completed: false, userId: 1 });
    });

    afterEach(() => {
        if (spyGetStatus) spyGetStatus.mockRestore();
        if (spyFilter) spyFilter.mockRestore();
    });

    test('should verify call sequence: getStatus() then filter()', () => {
        spyGetStatus = jest.spyOn(task, 'getStatus');
        spyFilter = jest.spyOn(Array.prototype, 'filter');
        
        filterByStatus([task], 'Pending');
        
        // Verify both were called
        expect(spyGetStatus).toHaveBeenCalled();
        expect(spyFilter).toHaveBeenCalled();
        
        spyGetStatus.mockRestore();
        spyFilter.mockRestore();
    });

    test('should verify multiple calls to getStatus() in filterByStatus', () => {
        const tasks = [
            new Task({ id: 1, title: 'Task 1', completed: true, userId: 1 }),
            new Task({ id: 2, title: 'Task 2', completed: true, userId: 1 }),
            new Task({ id: 3, title: 'Task 3', completed: false, userId: 2 })
        ];
        
        const spies = tasks.map(task => jest.spyOn(task, 'getStatus'));
        
        filterByStatus(tasks, 'Completed');
        
        // Each task's getStatus should be called
        spies.forEach(spy => {
            expect(spy).toHaveBeenCalled();
        });
        
        spies.forEach(spy => spy.mockRestore());
    });
});