import { test, expect, describe, beforeEach, afterEach, jest } from '@jest/globals';

// Create mock fetch function
const mockFetch = jest.fn();

// Mock fetch globally - use globalThis (standard way to access global object)
globalThis.fetch = mockFetch;

import { APIClient } from '../../src/api.js';

describe('APIClient Integration Tests', () => {
    let apiClient;
    const BASE_URL = 'https://jsonplaceholder.typicode.com';

    beforeEach(() => {
        apiClient = new APIClient();
        // Clear fetch mock before each test
        mockFetch.mockClear();
        // Clear cache before each test
        apiClient.clearCache();
    });

    afterEach(() => {
        mockFetch.mockClear();
    });

    // ============================================
    // FETCHUSERS METHOD TESTS
    // ============================================
    describe('fetchUsers', () => {
        test('should call fetch with correct URL for users endpoint', async () => {
            const mockUsers = [
                { id: 1, name: 'John Doe', username: 'johndoe', email: 'john@example.com' }
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockUsers
            });

            await apiClient.fetchUsers();

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/users`);
        });

        test('should return users data when fetch succeeds', async () => {
            const mockUsers = [
                { id: 1, name: 'John Doe', username: 'johndoe', email: 'john@example.com' },
                { id: 2, name: 'Jane Smith', username: 'janesmith', email: 'jane@example.com' }
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockUsers
            });

            const result = await apiClient.fetchUsers();

            expect(result).toEqual(mockUsers);
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(2);
        });

        test('should use cache when useCache is true and data is cached', async () => {
            const mockUsers = [
                { id: 1, name: 'John Doe', username: 'johndoe', email: 'john@example.com' }
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockUsers
            });

            // First call - should fetch
            await apiClient.fetchUsers({ useCache: true });
            expect(mockFetch).toHaveBeenCalledTimes(1);

            // Second call - should use cache
            const result = await apiClient.fetchUsers({ useCache: true });
            expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, not 2
            expect(result).toEqual(mockUsers);
        });

        test('should bypass cache when useCache is false', async () => {
            const mockUsers = [
                { id: 1, name: 'John Doe', username: 'johndoe', email: 'john@example.com' }
            ];

            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => mockUsers
            });

            // First call
            await apiClient.fetchUsers({ useCache: false });
            // Second call
            await apiClient.fetchUsers({ useCache: false });

            expect(mockFetch).toHaveBeenCalledTimes(2);
        });

        test('should throw error when network request fails', async () => {
            const networkError = new Error('Network request failed');
            mockFetch.mockRejectedValueOnce(networkError);

            await expect(apiClient.fetchUsers()).rejects.toThrow('Network error fetching users');
        });

        test('should throw error when HTTP response is not OK (404)', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: async () => ({ error: 'Not Found' })
            });

            await expect(apiClient.fetchUsers()).rejects.toThrow('HTTP 404 while fetching users');
        });

        test('should throw error when HTTP response is not OK (500)', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({ error: 'Internal Server Error' })
            });

            await expect(apiClient.fetchUsers()).rejects.toThrow('HTTP 500 while fetching users');
        });

        test('should throw error when response JSON is invalid', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => {
                    throw new Error('Invalid JSON');
                }
            });

            await expect(apiClient.fetchUsers()).rejects.toThrow('Invalid JSON for users');
        });
    });

    // ============================================
    // FETCHTODOS METHOD TESTS
    // ============================================
    describe('fetchTodos', () => {
        test('should call fetch with correct URL for todos endpoint', async () => {
            const mockTodos = [
                { id: 1, userId: 1, title: 'Task 1', completed: false }
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockTodos
            });

            await apiClient.fetchTodos();

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/todos`);
        });

        test('should return todos data when fetch succeeds', async () => {
            const mockTodos = [
                { id: 1, userId: 1, title: 'Task 1', completed: false },
                { id: 2, userId: 1, title: 'Task 2', completed: true }
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockTodos
            });

            const result = await apiClient.fetchTodos();

            expect(result).toEqual(mockTodos);
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(2);
        });

        test('should handle network errors', async () => {
            const networkError = new Error('Network request failed');
            mockFetch.mockRejectedValueOnce(networkError);

            await expect(apiClient.fetchTodos()).rejects.toThrow('Network error fetching todos');
        });

        test('should handle non-OK HTTP responses', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 503,
                json: async () => ({ error: 'Service Unavailable' })
            });

            await expect(apiClient.fetchTodos()).rejects.toThrow('HTTP 503 while fetching todos');
        });
    });

    // ============================================
    // FETCHUSERTODOS METHOD TESTS
    // ============================================
    describe('fetchUserTodos', () => {
        test('should call fetch with correct URL including userId parameter', async () => {
            const mockTodos = [
                { id: 1, userId: 1, title: 'Task 1', completed: false }
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockTodos
            });

            await apiClient.fetchUserTodos(1);

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/todos?userId=1`);
        });

        test('should return todos for specific user when fetch succeeds', async () => {
            const mockTodos = [
                { id: 1, userId: 1, title: 'Task 1', completed: false },
                { id: 2, userId: 1, title: 'Task 2', completed: true }
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockTodos
            });

            const result = await apiClient.fetchUserTodos(1);

            expect(result).toEqual(mockTodos);
            expect(result.every(todo => todo.userId === 1)).toBe(true);
        });

        test('should handle different user IDs correctly', async () => {
            const mockTodos = [
                { id: 3, userId: 2, title: 'Task 3', completed: false }
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockTodos
            });

            const result = await apiClient.fetchUserTodos(2);

            expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/todos?userId=2`);
            expect(result.every(todo => todo.userId === 2)).toBe(true);
        });

        test('should handle network errors', async () => {
            const networkError = new Error('Network request failed');
            mockFetch.mockRejectedValueOnce(networkError);

            await expect(apiClient.fetchUserTodos(1)).rejects.toThrow('Network error fetching todos?userId=1');
        });

        test('should handle non-OK HTTP responses', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: async () => ({ error: 'Not Found' })
            });

            await expect(apiClient.fetchUserTodos(999)).rejects.toThrow('HTTP 404 while fetching todos?userId=999');
        });

        test('should respect useCache option', async () => {
            const mockTodos = [
                { id: 1, userId: 1, title: 'Task 1', completed: false }
            ];

            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => mockTodos
            });

            await apiClient.fetchUserTodos(1, { useCache: true });
            await apiClient.fetchUserTodos(1, { useCache: true });

            expect(mockFetch).toHaveBeenCalledTimes(1);
        });
    });

    // ============================================
    // CACHE FUNCTIONALITY TESTS
    // ============================================
    describe('cache functionality', () => {
        test('should cache responses for same endpoint', async () => {
            const mockData = [{ id: 1, name: 'Test' }];

            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => mockData
            });

            const result1 = await apiClient.fetchUsers({ useCache: true });
            const result2 = await apiClient.fetchUsers({ useCache: true });

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(result1).toEqual(result2);
        });

        test('should clear cache when clearCache is called', async () => {
            const mockData = [{ id: 1, name: 'Test' }];

            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => mockData
            });

            await apiClient.fetchUsers({ useCache: true });
            expect(mockFetch).toHaveBeenCalledTimes(1);

            apiClient.clearCache();

            await apiClient.fetchUsers({ useCache: true });
            expect(mockFetch).toHaveBeenCalledTimes(2);
        });
    });
});