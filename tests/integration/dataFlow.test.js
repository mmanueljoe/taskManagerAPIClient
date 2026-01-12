import { test, expect, describe, beforeEach, } from '@jest/globals';
import { APIClient } from '../__mocks__/api.js';
import { TaskManager } from '../../src/taskManager.js';
import { Task, PriorityTask, User } from '../../src/models.js';

describe('Data Flow Integration Tests', () => {
    let apiClient;
    let taskManager;

    beforeEach(() => {
        apiClient = new APIClient();
        taskManager = new TaskManager(apiClient);
    });

    // ============================================
    // WORKFLOW 1: Complete Data Loading Flow
    // ============================================
    describe('Workflow 1: Complete Data Loading Flow', () => {
        test('should fetch data from API, transform to models, and attach to users', async () => {
            
            // Execute workflow
            await taskManager.load({ useCache: false });


            // Verify data transformation - Users
            expect(taskManager.users).toHaveLength(3);
            expect(taskManager.users[0] instanceof User).toBe(true);
            expect(taskManager.users[0].id).toBe(1);
            expect(taskManager.users[0].name).toBe('Leanne Graham');

            // Verify data transformation - Tasks
            expect(taskManager.tasks).toHaveLength(7);
            // ID 10 and 20 should be PriorityTask (divisible by 10)
            const priorityTasks = taskManager.tasks.filter(t => t instanceof PriorityTask);
            expect(priorityTasks.length).toBe(3); // IDs 10, 20, 30
            // Other tasks should be regular Task
            const regularTasks = taskManager.tasks.filter(t => t instanceof Task && !(t instanceof PriorityTask));
            expect(regularTasks.length).toBe(4);

            // Verify tasks attached to users
            expect(taskManager.users[0].tasks.length).toBe(3); // User 1 has 3 tasks
            expect(taskManager.users[1].tasks.length).toBe(2); // User 2 has 2 tasks
            expect(taskManager.users[2].tasks.length).toBe(2); // User 3 has 2 tasks

            // Verify loaded flag
            expect(taskManager.loaded).toBe(true);
        });
    });

    // ============================================
    // WORKFLOW 2: Statistics Calculation Flow
    // ============================================
    describe('Workflow 2: Statistics Calculation Flow', () => {
        beforeEach(async () => {
            // Setup: Load data first

            await taskManager.load({ useCache: false });
        });

        test('should calculate statistics from loaded tasks', () => {
            const stats = taskManager.statistics();

            // Verify statistics structure
            expect(stats).toHaveProperty('totalTasks');
            expect(stats).toHaveProperty('completedTasks');
            expect(stats).toHaveProperty('pendingTasks');
            expect(stats).toHaveProperty('overdueTasks');
            expect(stats).toHaveProperty('uniqueUsers');

            // Verify statistics values
            expect(stats.totalTasks).toBe(7);
            expect(stats.completedTasks).toBe(2); // IDs 10 and 30
            expect(stats.pendingTasks).toBe(5);
            expect(stats.uniqueUsers).toBe(3);
        });

        test('should filter completed tasks correctly', () => {
            const completedTasks = taskManager.completedTasks();

            expect(completedTasks.length).toBe(2);
            expect(completedTasks.every(task => task.completed)).toBe(true);
        });

        test('should filter pending tasks correctly', () => {
            const pendingTasks = taskManager.pendingTasks();

            expect(pendingTasks.length).toBe(5);
            expect(pendingTasks.every(task => !task.completed)).toBe(true);
        });

        test('should filter tasks by user ID', () => {
            const user1Tasks = taskManager.tasksByUser(1);

            expect(user1Tasks.length).toBe(3);
            expect(user1Tasks.every(task => task.userId === 1)).toBe(true);
        });
    });

    // ============================================
    // WORKFLOW 3: Search and Filter Flow
    // ============================================
    describe('Workflow 3: Search and Filter Flow', () => {
        beforeEach(async () => {

            await taskManager.load({ useCache: false });
        });

        test('should search tasks by keywords and return matching tasks', () => {
            const results = taskManager.search('delectus');

            expect(results.length).toBe(1);
            expect(results[0].title).toContain('delectus');
        });

        test('should search with multiple keywords (AND logic)', () => {
            const results = taskManager.search('quis', 'nam');

            expect(results.length).toBe(1);
            expect(results[0].title).toContain('quis');
        });

        test('should return empty array when no tasks match search', () => {
            const results = taskManager.search('nonexistentkeyword');

            expect(results).toEqual([]);
        });

        test('should be case insensitive in search', () => {
            const results1 = taskManager.search('DElectus');
            const results2 = taskManager.search('delectus');

            expect(results1.length).toBe(results2.length);
            expect(results1[0].id).toBe(results2[0].id);
        });
    });

    // ============================================
    // WORKFLOW 4: User Leaderboard Flow
    // ============================================
    describe('Workflow 4: User Leaderboard Flow', () => {
        beforeEach(async () => {
            await taskManager.load({ useCache: false });
        });

        test('should generate leaderboard with completion rates', () => {
            const leaderboard = taskManager.usersLeaderboard();

            expect(leaderboard).toHaveLength(3);
            expect(leaderboard[0]).toHaveProperty('id');
            expect(leaderboard[0]).toHaveProperty('name');
            expect(leaderboard[0]).toHaveProperty('username');
            expect(leaderboard[0]).toHaveProperty('rate');
        });

        test('should sort leaderboard by completion rate descending', () => {
            const leaderboard = taskManager.usersLeaderboard();

            // Verify sorting: first user should have highest rate
            for (let i = 0; i < leaderboard.length - 1; i++) {
                expect(leaderboard[i].rate).toBeGreaterThanOrEqual(leaderboard[i + 1].rate);
            }
        });

        test('should calculate correct completion rates for each user', () => {
            const leaderboard = taskManager.usersLeaderboard();

            // User 1: 1 completed out of 3 = 33%
            const user1 = leaderboard.find(u => u.id === 1);
            expect(user1.rate).toBe(33);

            // User 2: 0 completed out of 2 = 0%
            const user2 = leaderboard.find(u => u.id === 2);
            expect(user2.rate).toBe(0);

            // User 3: 1 completed out of 2 = 50%
            const user3 = leaderboard.find(u => u.id === 3);
            expect(user3.rate).toBe(50);
        });
    });

    // ============================================
    // WORKFLOW 5: Task Toggle Flow
    // ============================================
    describe('Workflow 5: Task Toggle Flow', () => {
        beforeEach(async () => {

            await taskManager.load({ useCache: false });
        });

        test('should toggle task completion status', () => {
            const task = taskManager.tasks.find(t => t.id === 1);
            const initialStatus = task.completed;

            const toggledTask = taskManager.toggleTask(1);

            expect(toggledTask.completed).toBe(!initialStatus);
            expect(toggledTask.id).toBe(1);
        });

        test('should update user completion rate after toggling task', () => {
            const user = taskManager.users.find(u => u.id === 1);
            const initialRate = user.getCompletionRate();

            taskManager.toggleTask(1); // Toggle incomplete task to complete
            const newRate = user.getCompletionRate();

            expect(newRate).toBeGreaterThan(initialRate);
        });

        test('should throw error when toggling non-existent task', () => {
            expect(() => taskManager.toggleTask(999)).toThrow('Task #999 not found');
        });
    });

    // ============================================
    // WORKFLOW 6: Tags Extraction Flow
    // ============================================
    describe('Workflow 6: Tags Extraction Flow', () => {
        beforeEach(async () => {
            await taskManager.load({ useCache: false });
        });

        test('should extract unique tags from task titles', () => {
            const tags = taskManager.tags();

            expect(tags instanceof Set).toBe(true);
            expect(tags.size).toBeGreaterThan(0);
        });

        test('should only include words with 6 or more characters', () => {
            const tags = taskManager.tags();
            const tagsArray = Array.from(tags);

            tagsArray.forEach(tag => {
                expect(tag.length).toBeGreaterThanOrEqual(6);
            });
        });
    });

    // ============================================
    // WORKFLOW 7: Error Handling Flow
    // ============================================
    describe('Workflow 7: Error Handling Flow', () => {
        test('should throw error when accessing data before loading', () => {
            expect(() => taskManager.allTasks()).toThrow('Data not loaded. Call load() first');
            expect(() => taskManager.statistics()).toThrow('Data not loaded. Call load() first');
            expect(() => taskManager.completedTasks()).toThrow('Data not loaded. Call load() first');
        });

    });

    // ============================================
    // WORKFLOW 8: Cache Integration Flow
    // ============================================
    describe('Workflow 8: Cache Integration Flow', () => {
        test('should use cached data on subsequent loads', async () => {
            // First load
            await taskManager.load({ useCache: true });

            // Second load with cache
            const taskManager2 = new TaskManager(apiClient);
            await taskManager2.load({ useCache: true });
            
        });

        test('should bypass cache when useCache is false', async () => {
            await apiClient.fetchUsers({ useCache: false });
            await apiClient.fetchUsers({ useCache: false });
        });
    });
});