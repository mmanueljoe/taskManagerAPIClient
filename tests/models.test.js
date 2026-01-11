import { test, expect, describe } from '@jest/globals';
import { Task } from '../src/models.js';

describe('Task', () => {
    test('should create a task with correct properties', () => {
        const task = new Task({
            id: 1,
            title: 'Test Task',
            completed: false,
            userId: 1
        });
        expect(task.id).toBe(1);
        expect(task.title).toBe('Test Task');
        expect(task.completed).toBe(false);
        expect(task.userId).toBe(1);
    });
});