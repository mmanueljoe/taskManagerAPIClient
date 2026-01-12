import { test, expect, describe, beforeEach } from '@jest/globals';
import { Task, PriorityTask, User } from '../../src/models.js';
import { TaskManager } from '../../src/taskManager.js';
import { APIClient } from '../__mocks__/api.js';
import {
    filterByStatus,
    filterByUser,
    calculateStatistics,
    groupByUser,
    searchTasks,
    uniqueTags,
    toTaskInstances
} from '../../src/taskProcessor.js';

// ============================================
// ERROR HANDLING TESTS - MODELS
// ============================================
describe('Error Handling - Models', () => {
    describe('Task Constructor Errors', () => {
        test('should handle null id gracefully', () => {
            expect(() => {
                new Task({ id: null, title: 'Test', completed: false, userId: 1 });
            }).not.toThrow();
        });

        test('should handle undefined title by converting to empty string', () => {
            const task = new Task({ id: 1, title: undefined, completed: false, userId: 1 });
            expect(task.title).toBe('');
        });

        test('should handle invalid completed type', () => {
            const task = new Task({ id: 1, title: 'Test', completed: 'invalid', userId: 1 });
            // Should convert to boolean
            expect(typeof task.completed).toBe('boolean');
        });
    });

    describe('PriorityTask Constructor Errors', () => {
        test('should handle invalid priority value', () => {
            const task = new PriorityTask({
                id: 1,
                title: 'Test',
                completed: false,
                userId: 1,
                priority: 'invalid'
            });
            // Should accept any string
            expect(task.priority).toBe('invalid');
        });

        test('should handle invalid dueDate format', () => {
            expect(() => {
                new PriorityTask({
                    id: 1,
                    title: 'Test',
                    completed: false,
                    userId: 1,
                    dueDate: 'invalid-date'
                });
            }).not.toThrow();
        });
    });

    describe('User Constructor Errors', () => {
        test('should handle null name', () => {
            const user = new User({
                id: 1,
                name: null,
                email: 'test@example.com',
                username: 'testuser'
            });
            expect(user.name).toBeNull();
        });

        test('should handle undefined email', () => {
            const user = new User({
                id: 1,
                name: 'Test User',
                email: undefined,
                username: 'testuser'
            });
            expect(user.email).toBeUndefined();
        });
    });
});

// ============================================
// ERROR HANDLING TESTS - TASK PROCESSOR
// ============================================
describe('Error Handling - Task Processor', () => {
    test('should handle null tasks array in filterByStatus', () => {
        expect(() => filterByStatus(null, 'Completed')).toThrow();
    });

    test('should handle undefined tasks array in calculateStatistics', () => {
        expect(() => calculateStatistics(undefined)).toThrow();
    });

    test('should handle empty array in groupByUser', () => {
        const result = groupByUser([]);
        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(0);
    });

    test('should handle null tasks array in searchTasks', () => {
        expect(() => searchTasks(null, 'test')).toThrow();
    });

    test('should handle non-array input in uniqueTags', () => {
        const result = uniqueTags(null);
        expect(result).toBeInstanceOf(Set);
        expect(result.size).toBe(0);
    });

    test('should handle invalid todos array in toTaskInstances', () => {
        expect(() => toTaskInstances(null)).toThrow();
    });

    test('should handle tasks with missing properties in filterByStatus', () => {
        const invalidTask = { id: 1 }; // Missing getStatus method
        expect(() => filterByStatus([invalidTask], 'Completed')).toThrow();
    });

    test('should handle type mismatch in filterByUser', () => {
        const tasks = [
            new Task({ id: 1, title: 'Task 1', completed: false, userId: 1 })
        ];
        // Should handle string userId
        const result = filterByUser(tasks, '1');
        expect(result.length).toBe(1);
    });
});

// ============================================
// ERROR HANDLING TESTS - TASK MANAGER
// ============================================
describe('Error Handling - Task Manager', () => {
    let taskManager;

    beforeEach(() => {
        taskManager = new TaskManager(new APIClient());
    });

    test('should throw error when accessing tasks before load', () => {
        expect(() => taskManager.allTasks()).toThrow('Data not loaded. Call load() first');
    });

    test('should throw error when accessing statistics before load', () => {
        expect(() => taskManager.statistics()).toThrow('Data not loaded. Call load() first');
    });

    test('should throw error when toggling non-existent task', async () => {
        await taskManager.load({ useCache: false });
        expect(() => taskManager.toggleTask(99999)).toThrow('Task #99999 not found');
    });

    test('should handle invalid userId in tasksByUser', async () => {
        await taskManager.load({ useCache: false });
        // Should return empty array for invalid userId
        const result = taskManager.tasksByUser(99999);
        expect(result).toEqual([]);
    });

    test('should handle null userId in getUserLabel', async () => {
        await taskManager.load({ useCache: false });
        const result = taskManager.getUserLabel(null);
        expect(result).toContain('User');
    });
});

// ============================================
// ERROR HANDLING TESTS - BOUNDARY CONDITIONS
// ============================================
describe('Error Handling - Boundary Conditions', () => {
    test('should handle empty string title in Task', () => {
        const task = new Task({ id: 1, title: '', completed: false, userId: 1 });
        expect(task.title).toBe('');
    });

    test('should handle zero userId', () => {
        const task = new Task({ id: 1, title: 'Test', completed: false, userId: 0 });
        expect(task.userId).toBe(0);
    });

    test('should handle negative id', () => {
        const task = new Task({ id: -1, title: 'Test', completed: false, userId: 1 });
        expect(task.id).toBe(-1);
    });

    test('should handle very large numbers', () => {
        const task = new Task({
            id: Number.MAX_SAFE_INTEGER,
            title: 'Test',
            completed: false,
            userId: 1
        });
        expect(task.id).toBe(Number.MAX_SAFE_INTEGER);
    });

    test('should handle empty tasks array in calculateStatistics', () => {
        const stats = calculateStatistics([]);
        expect(stats.totalTasks).toBe(0);
        expect(stats.completedTasks).toBe(0);
    });

    test('should handle single task array', () => {
        const tasks = [new Task({ id: 1, title: 'Test', completed: true, userId: 1 })];
        const stats = calculateStatistics(tasks);
        expect(stats.totalTasks).toBe(1);
        expect(stats.completedTasks).toBe(1);
    });
});