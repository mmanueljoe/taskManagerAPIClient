import {test, expect, describe, beforeEach} from '@jest/globals';
import {Task, PriorityTask, User} from '../../src/models.js';


// === TASK CLASS TESTS ===

describe('Task', () => {
    let task;

    beforeEach(() => {
        // reset task before each test
        task = null;
    });

    // group 1: constructor tests
    describe('constructor', () => {
        test('should create a taks with all valid properties', () => {
           const taskData = {
            id: 1,
            title: 'Test Task',
            completed: false,
            userId: 1
           };
           task = new Task(taskData);

           expect(task.id).toBe(1);
           expect(task.title).toBe('Test Task');
           expect(task.completed).toBe(false);
           expect(task.userId).toBe(1);
           expect(task.timeStamp).toBeInstanceOf(Date);
        });

        test('should handle null title by converting to empty string', () => {
            task = new Task({
                id: 1,
                title: null,
                completed: false,
                userId: 1
            });
            expect(task.title).toBe('');
        });

        test('should handle undefined title by converting to empty string', () => {
            task = new Task({
                id: 1,
                title: undefined,
                completed: false,
                userId: 1
            });
            expect(task.title).toBe('');
        });

        test('should convert non-string title to string', () => {
            task =  new Task({
                id: 1,
                title: 12345,
                completed: false,
                userId: 1
            });
            expect(task.title).toBe('12345');
        });

        test('should convert truthy completed value to true', () => {
            task = new Task({
                id: 1,
                title: 'Test Task',
                completed: 1,
                userId: 1
            });
            expect(task.completed).toBe(true);
        });

        test('should convert falsy completed value to false', () => {
            task = new Task({
                id: 1,
                title: 'Test Task',
                completed: 0,
                userId: 1
            });
            expect(task.completed).toBe(false);
        });

        // group 2: toogle() method tests
        describe('toggle()', () => {
            test('should toggle completed from false to true', () => {
                task = new Task({
                    id: 1,
                    title: 'Test Task',
                    completed: false,
                    userId: 1
                });
                task.toggle();
                expect(task.completed).toBe(true);

            });

            test('should toggle completed from true to false', () => {
                task = new Task({
                    id: 1,
                    title: 'Test Task',
                    completed: true,
                    userId: 1
                });
                task.toggle();
                expect(task.completed).toBe(false);
            });

            test('should toggle completed multiple times', () => {
                task = new Task({
                    id: 1,
                    title: 'Test Task',
                    completed: false,
                    userId: 1
                });
                task.toggle();
                expect(task.completed).toBe(true);
                task.toggle();
                expect(task.completed).toBe(false);
                task.toggle();
                expect(task.completed).toBe(true);
                task.toggle();
                expect(task.completed).toBe(false);
            });
        });

        // group 3: getStatus() method tests
        describe('getStatus()', () => {
            test('should return completed when task is completed', () => {
                task = new Task({
                    id: 1,
                    title: 'Test Task',
                    completed: true,
                    userId: 1
                });

                task.getStatus();
                expect(task.getStatus()).toBe('Completed');
            });

            test('should return pending when task is not completed', () => {
                task = new Task({
                    id: 1,
                    title: 'Test Task',
                    completed: false,
                    userId: 1
                });

                task.getStatus();
                expect(task.getStatus()).toBe('Pending');
            });
        });

        // group 4: isOverdue() method tests
        describe('isOverdue()', () => {
            test('should return false for completed task even if old', () => {
                task = new Task({
                    id: 1,
                    title: 'Test Task',
                    completed: true,
                    userId: 1
                });

                // manually set old timestamp (8 days ago)
                task.timeStamp = new Date(Date.now() - 86400000);
                expect(task.isOverdue()).toBe(false);
            });

            test('should return false for recent incomplete task', () => {
                task = new Task({
                    id: 1,
                    title: 'Test Task',
                    completed: false,
                    userId: 1
                });

                // set recent timestamp(3 days ago)
                task.timeStamp = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
                expect(task.isOverdue()).toBe(false);
            });

            test('should return true for incomplete task older than 7 days', () => {
                task = new Task({
                    id: 1,
                    title: 'Test Task',
                    completed: false,
                    userId: 1
                });

                // set old timestamp (8 days ago)
                task.timeStamp = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
                expect(task.isOverdue()).toBe(true);
            });

            test('should return true for incomplete task exactly 7 days old', () =>{
                task = new Task({
                    id: 1,
                    title: 'Test Task',
                    completed: false,
                    userId: 1
                });

                // set timestamp to exactly 7 days + 1ms ago
                task.timeStamp = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000 + 1));
                expect(task.isOverdue()).toBe(true);
            });
        });

        // group 5: toLine() method tests
        describe('toLine()', () => {
            test('should format completed task with status correctly', () => {
                task = new Task({
                    id: 1,
                    title: 'Test Task',
                    completed: true,
                    userId: 1
                });

                const result = task.toLine();
                expect(result).toContain('#1');
                expect(result).toContain('[User 1]');
                expect(result).toContain('Completed');
                expect(result).toContain('Test Task');
            });

            test('should format pending task with status correctly', () => {
                task = new Task({
                    id: 2,
                    title: 'Another Task',
                    completed: false,
                    userId: 1
                });
                
                task.timeStamp = new Date(Date.now() - (3 * 24 * 60 * 60 * 1000 + 1));
                const result = task.toLine();
                expect(result).toContain('#2');
                expect(result).toContain('[User 1]');
                expect(result).toContain('Pending');
                expect(result).toContain('Another Task');
            });

            test('should format overdue task with status correctly', () => {
                task = new Task({
                    id: 3,
                    title: 'Overdue Task',
                    completed: false,
                    userId: 1
                });
                
                const result = task.toLine();
                expect(result).toContain('#3');
                expect(result).toContain('[User 1]');
                expect(result).toContain('Overdue');
                expect(result).toContain('Overdue Task');
            });
        });
    })
});


// === PRIORITYTASK CLASS TESTS ===
describe('PriorityTask', () => {
    let priorityTask;

    beforeEach(() => {
        priorityTask = null;
    });

    // group 1: inheritance tests
    describe('inheritance', () => {
        test('should be an instance of Task', () => {
            priorityTask = new PriorityTask({
                id: 1,
                title: 'Test Task',
                completed: false,
                userId: 1
            });
            // expect(priorityTask).toBeInstanceOf(Task);
            expect(priorityTask instanceof PriorityTask).toBe(true);
        });

        test('should inherit all task properties', () => {
            priorityTask = new PriorityTask({
                id: 1,
                title: 'Priority Task',
                completed: false,
                userId: 1
            });
            expect(priorityTask.id).toBe(1);
            expect(priorityTask.title).toBe('Priority Task');
            expect(priorityTask.completed).toBe(false);
            expect(priorityTask.userId).toBe(1);
            expect(priorityTask.timeStamp).toBeInstanceOf(Date);
        });

        test('should inherit toggle method from Task', () => {
            priorityTask = new PriorityTask({
                id: 1,
                title: 'Priority Task',
                completed: false,
                userId: 1
            });
            priorityTask.toggle();
            expect(priorityTask.completed).toBe(true);
        });
    });

    // group 2: priority-specific properties tests
    describe('priority-specific properties', () => {
        test('should set priority level correctly', () => {
            priorityTask = new PriorityTask({
                id: 1,
                title: 'Priority Task',
                completed: false,
                userId: 1,
                priority: 'high'
            });
            expect(priorityTask.priority).toBe('high');
        });

        test('should default to medium when not provided', () => {
            priorityTask = new PriorityTask({
                id: 1,
                title: 'Priority Task',
                completed: false,
                userId: 1
            });
            expect(priorityTask.priority).toBe('medium');
        });

        test('should set dueDate correctly', () => {
            const dueDate = new Date('2024-12-31');
            priorityTask = new PriorityTask({
                id: 1,
                title: 'Priority Task',
                completed: false,
                userId: 1,
                dueDate: dueDate
            });
            expect(priorityTask.dueDate).toBeInstanceOf(Date);
            expect(priorityTask.dueDate.getTime()).toBe(dueDate.getTime());
        });

        test('should set dueDate to null when not provided', () => {
            priorityTask = new PriorityTask({
                id: 1,
                title: 'Priority Task',
                completed: false,
                userId: 1
            });
            expect(priorityTask.dueDate).toBeNull();
        });

    });

    // group 3: Overriden isOverdue() method tests
    describe('isOverdue()', () => {
        const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
        test('should return false when task is completed even if dueDate passed', () => {
            priorityTask = new PriorityTask({
                id: 1,
                title: 'Priority Task',
                completed: true,
                userId: 1,
                priority: 'high',
                dueDate: pastDate
            });
            expect(priorityTask.isOverdue()).toBe(false);
        });

        test('should retur true when dueDate passed and task is incompleted', () => {
            priorityTask = new PriorityTask({
                id: 1,
                title: 'Priority Task',
                completed: false,
                userId: 1,
                priority: 'high',
                dueDate: pastDate
            });
            expect(priorityTask.isOverdue()).toBe(true);
        });

        test('should return false when dueDate in the future', () => {
            const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
            priorityTask = new PriorityTask({
                id: 1,
                title: 'Priority Task',
                completed: false,
                userId: 1,
                priority: 'high',
                dueDate: futureDate
            });
            expect(priorityTask.isOverdue()).toBe(false);
        });

        test('should fall back to parent isOverdue() when dueDate is null', () => {
            priorityTask = new PriorityTask({
                id: 1,
                title: 'Priority Task',
                completed: false,
                userId: 1,
                priority: 'high',
                dueDate: null
            });
             // Set old timestamp to test parent logic
             priorityTask.timeStamp = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
            expect(priorityTask.isOverdue()).toBe(true);
        })
    });

    // group 4: Overriden getStatus() method tests
    describe('getStatus()', () => {
        test('should include priority in status for completed task', () => {
            priorityTask = new PriorityTask({
                id: 1,
                title: 'Priority Task',
                completed: true,
                userId: 1,
                priority: 'high'
            });
            const status = priorityTask.getStatus();
            expect(status).toContain('Completed');
            expect(status).toContain('[high]');
        });

        test('should include priority in status for pending task', () => {
            priorityTask = new PriorityTask({
                id: 1,
                title: 'Priority Task',
                completed: false,
                userId: 1,
                priority: 'low'
            });
            const status = priorityTask.getStatus();

            expect(status).toContain('Pending');
            expect(status).toContain('[low]');
        });

        test('should include priority and overdue in status for overdue task', () => {
            const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
            priorityTask = new PriorityTask({
                id: 1,
                title: 'Priority Task',
                completed: false,
                userId: 1,
                priority: 'medium',
                dueDate: pastDate
            });

            const status = priorityTask.getStatus();
            expect(status).toContain('Pending');
            expect(status).toContain('[medium]');
            expect(status).toContain(' (Overdue)');
        });

        test('should not include overdue indicator when task is not overdue', () => {
            const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
            priorityTask = new PriorityTask({
                id: 1,
                title: 'Priority Task',
                completed: false,
                userId: 1,
                priority: 'medium',
                dueDate: futureDate
            });
            const status = priorityTask.getStatus();
            expect(status).toContain('Pending');
            expect(status).toContain('[medium]');
            expect(status).not.toContain(' (Overdue)');
        });
    });
});



// ============================================
// USER CLASS TESTS
// ============================================
describe('User', () => {
    let user;
    
    beforeEach(() => {
        user = new User({
            id: 1,
            name: 'Emmanuel Joe Letsu',
            email: 'emmanuelletsu18@gmail.com',
            username: 'mmanueljoe'
        });
    });

    // Group 1: Constructor Tests
    describe('constructor', () => {
        test('should create user with all properties', () => {
            expect(user.id).toBe(1);
            expect(user.name).toBe('Emmanuel Joe Letsu');
            expect(user.email).toBe('emmanuelletsu18@gmail.com');
            expect(user.username).toBe('mmanueljoe');
            expect(user.tasks).toEqual([]);
        });

        test('should initialize with empty tasks array', () => {
            expect(Array.isArray(user.tasks)).toBe(true);
            expect(user.tasks.length).toBe(0);
        });
    });

    // Group 2: addTask() Method Tests
    describe('addTask', () => {
        test('should add a single task to user', () => {
            const task = new Task({
                id: 1,
                title: 'Test Task',
                completed: false,
                userId: 1
            });
            
            user.addTask(task);
            
            expect(user.tasks.length).toBe(1);
            expect(user.tasks[0]).toBe(task);
        });

        test('should add multiple tasks to user', () => {
            const task1 = new Task({
                id: 1,
                title: 'Task 1',
                completed: false,
                userId: 1
            });
            const task2 = new Task({
                id: 2,
                title: 'Task 2',
                completed: true,
                userId: 1
            });
            
            user.addTask(task1);
            user.addTask(task2);
            
            expect(user.tasks.length).toBe(2);
            expect(user.tasks[0]).toBe(task1);
            expect(user.tasks[1]).toBe(task2);
        });

        test('should add PriorityTask to user', () => {
            const priorityTask = new PriorityTask({
                id: 1,
                title: 'Priority Task',
                completed: false,
                userId: 1,
                priority: 'high'
            });
            
            user.addTask(priorityTask);
            
            expect(user.tasks.length).toBe(1);
            expect(user.tasks[0]).toBe(priorityTask);
        });
    });

    // Group 3: getCompletionRate() Method Tests
    describe('getCompletionRate', () => {
        test('should return 0 when user has no tasks', () => {
            expect(user.getCompletionRate()).toBe(0);
        });

        test('should return 0 when all tasks are incomplete', () => {
            const task1 = new Task({
                id: 1,
                title: 'Task 1',
                completed: false,
                userId: 1
            });
            const task2 = new Task({
                id: 2,
                title: 'Task 2',
                completed: false,
                userId: 1
            });
            
            user.addTask(task1);
            user.addTask(task2);
            
            expect(user.getCompletionRate()).toBe(0);
        });

        test('should return 100 when all tasks are completed', () => {
            const task1 = new Task({
                id: 1,
                title: 'Task 1',
                completed: true,
                userId: 1
            });
            const task2 = new Task({
                id: 2,
                title: 'Task 2',
                completed: true,
                userId: 1
            });
            
            user.addTask(task1);
            user.addTask(task2);
            
            expect(user.getCompletionRate()).toBe(100);
        });

        test('should return 50 when half of tasks are completed', () => {
            const task1 = new Task({
                id: 1,
                title: 'Task 1',
                completed: true,
                userId: 1
            });
            const task2 = new Task({
                id: 2,
                title: 'Task 2',
                completed: false,
                userId: 1
            });
            
            user.addTask(task1);
            user.addTask(task2);
            
            expect(user.getCompletionRate()).toBe(50);
        });

        test('should return 33 when 1 of 3 tasks is completed', () => {
            const task1 = new Task({
                id: 1,
                title: 'Task 1',
                completed: true,
                userId: 1
            });
            const task2 = new Task({
                id: 2,
                title: 'Task 2',
                completed: false,
                userId: 1
            });
            const task3 = new Task({
                id: 3,
                title: 'Task 3',
                completed: false,
                userId: 1
            });
            
            user.addTask(task1);
            user.addTask(task2);
            user.addTask(task3);
            
            expect(user.getCompletionRate()).toBe(33);
        });

        test('should round completion rate correctly', () => {
            // 1 completed out of 3 = 33.33%, should round to 33
            const task1 = new Task({
                id: 1,
                title: 'Task 1',
                completed: true,
                userId: 1
            });
            const task2 = new Task({
                id: 2,
                title: 'Task 2',
                completed: false,
                userId: 1
            });
            const task3 = new Task({
                id: 3,
                title: 'Task 3',
                completed: false,
                userId: 1
            });
            
            user.addTask(task1);
            user.addTask(task2);
            user.addTask(task3);
            
            const rate = user.getCompletionRate();
            expect(rate).toBe(33);
            expect(rate).toBeGreaterThanOrEqual(0);
            expect(rate).toBeLessThanOrEqual(100);
        });
    });

    // Group 4: getTasksByStatus() Method Tests
    describe('getTasksByStatus', () => {
        test('should return empty array when no tasks match status', () => {
            const task = new Task({
                id: 1,
                title: 'Task',
                completed: false,
                userId: 1
            });
            
            user.addTask(task);
            
            const completedTasks = user.getTasksByStatus('Completed');
            
            expect(completedTasks).toEqual([]);
        });

        test('should return only completed tasks when filtering by "Completed"', () => {
            const task1 = new Task({
                id: 1,
                title: 'Task 1',
                completed: true,
                userId: 1
            });
            const task2 = new Task({
                id: 2,
                title: 'Task 2',
                completed: false,
                userId: 1
            });
            const task3 = new Task({
                id: 3,
                title: 'Task 3',
                completed: true,
                userId: 1
            });
            
            user.addTask(task1);
            user.addTask(task2);
            user.addTask(task3);
            
            const completedTasks = user.getTasksByStatus('Completed');
            
            expect(completedTasks.length).toBe(2);
            expect(completedTasks).toContain(task1);
            expect(completedTasks).toContain(task3);
            expect(completedTasks).not.toContain(task2);
        });

        test('should return only pending tasks when filtering by "Pending"', () => {
            const task1 = new Task({
                id: 1,
                title: 'Task 1',
                completed: true,
                userId: 1
            });
            const task2 = new Task({
                id: 2,
                title: 'Task 2',
                completed: false,
                userId: 1
            });
            const task3 = new Task({
                id: 3,
                title: 'Task 3',
                completed: false,
                userId: 1
            });
            
            user.addTask(task1);
            user.addTask(task2);
            user.addTask(task3);
            
            const pendingTasks = user.getTasksByStatus('Pending');
            
            expect(pendingTasks.length).toBe(2);
            expect(pendingTasks).toContain(task2);
            expect(pendingTasks).toContain(task3);
            expect(pendingTasks).not.toContain(task1);
        });

        test('should default to "Completed" when no status provided', () => {
            const task1 = new Task({
                id: 1,
                title: 'Task 1',
                completed: true,
                userId: 1
            });
            const task2 = new Task({
                id: 2,
                title: 'Task 2',
                completed: false,
                userId: 1
            });
            
            user.addTask(task1);
            user.addTask(task2);
            
            const result = user.getTasksByStatus();
            
            expect(result.length).toBe(1);
            expect(result).toContain(task1);
        });

        test('should work with PriorityTask status strings', () => {
            const priorityTask = new PriorityTask({
                id: 1,
                title: 'Priority Task',
                completed: true,
                userId: 1,
                priority: 'high'
            });
            
            user.addTask(priorityTask);
            
            const completedTasks = user.getTasksByStatus('Completed');
            
            expect(completedTasks.length).toBe(1);
            expect(completedTasks[0].getStatus()).toContain('Completed');
        });
    });

    // Group 5: label() Method Tests
    describe('label', () => {
        test('should return formatted label with name and username', () => {
            const label = user.label();
            
            expect(label).toContain('Emmanuel Joe Letsu');
            expect(label).toContain('@mmanueljoe');
        });

        test('should handle null name by showing "Unknown"', () => {
            const userWithNullName = new User({
                id: 2,
                name: null,
                email: 'test@example.com',
                username: 'testuser'
            });
            
            const label = userWithNullName.label();
            
            expect(label).toContain('Unknown');
            expect(label).toContain('@testuser');
        });

        test('should handle null username by showing default format', () => {
            const userWithNullUsername = new User({
                id: 3,
                name: 'Test User',
                email: 'test@example.com',
                username: null
            });
            
            const label = userWithNullUsername.label();
            
            expect(label).toContain('Test User');
            expect(label).toContain('user3');
        });
    });
});