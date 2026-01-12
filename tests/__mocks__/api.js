// Mock data for users
export const mockUsers = [
  {
    id: 1,
    name: "Leanne Graham",
    username: "Bret",
    email: "Sincere@april.biz",
    address: {
      street: "Kulas Light",
      suite: "Apt. 556",
      city: "Gwenborough",
      zipcode: "92998-3874",
      geo: {
        lat: "-37.3159",
        lng: "81.1496",
      },
    },
    phone: "1-770-736-8031 x56442",
    website: "hildegard.org",
    company: {
      name: "Romaguera-Crona",
      catchPhrase: "Multi-layered client-server neural-net",
      bs: "harness real-time e-markets",
    },
  },
  {
    id: 2,
    name: "Ervin Howell",
    username: "Antonette",
    email: "Shanna@melissa.tv",
    address: {
      street: "Victor Plains",
      suite: "Suite 879",
      city: "Wisokyburgh",
      zipcode: "90566-7771",
      geo: {
        lat: "-43.9509",
        lng: "-34.4618",
      },
    },
    phone: "010-692-6593 x09125",
    website: "anastasia.net",
    company: {
      name: "Deckow-Crist",
      catchPhrase: "Proactive didactic contingency",
      bs: "synergize scalable supply-chains",
    },
  },
  {
    id: 3,
    name: "Clementine Bauch",
    username: "Samantha",
    email: "Nathan@yesenia.net",
    address: {
      street: "Douglas Extension",
      suite: "Suite 847",
      city: "McKenziehaven",
      zipcode: "42295-4287",
      geo: {
        lat: "-68.6102",
        lng: "-47.0653",
      },
    },
    phone: "1-463-123-4447",
    website: "ramiro.info",
    company: {
      name: "Romaguera-Jacobson",
      catchPhrase: "Face to face bifurcated interface",
      bs: "e-enable strategic applications",
    },
  },
];

// Mock data for todos
export const mockTodos = [
  {
    id: 1,
    userId: 1,
    title: "delectus aut autem",
    completed: false,
  },
  {
    id: 2,
    userId: 1,
    title: "quis ut nam facilis et officia qui",
    completed: false,
  },
  {
    id: 10,
    userId: 1,
    title: "illo est ratione doloremque quia maiores aut",
    completed: true,
  },
  {
    id: 20,
    userId: 2,
    title: "molestias id nostrum excepturi molestiae dolore omnis repellendus",
    completed: false,
  },
  {
    id: 3,
    userId: 2,
    title: "fugiat veniam minus",
    completed: false,
  },
  {
    id: 30,
    userId: 3,
    title: "voluptatem sint quia modi accusantium",
    completed: true,
  },
  {
    id: 4,
    userId: 3,
    title: "ut quo aut ducimus alias",
    completed: false,
  },
];

// Mock implementation of APIClient
export class APIClient {
  constructor() {
    this.fetchCallCount = 0;
  }

  async fetchUsers(options = {}) {
    this.fetchCallCount++;
    // Acknowledge options parameter for API compatibility (unused in mock)
    void options;
    // Simulate async behavior
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockUsers]);
      }, 10);
    });
  }

  async fetchTodos(options = {}) {
    this.fetchCallCount++;
    // Acknowledge options parameter for API compatibility (unused in mock)
    void options;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockTodos]);
      }, 10);
    });
  }

  async fetchUserTodos(userId, options = {}) {
    this.fetchCallCount++;
    // Acknowledge options parameter for API compatibility (unused in mock)
    void options;
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = mockTodos.filter((todo) => todo.userId === userId);
        resolve([...filtered]);
      }, 10);
    });
  }

  // Promise-based methods (for compatibility)
  fetchUsersPromise(options = {}) {
    return this.fetchUsers(options);
  }

  async fetchTodosPromise(options = {}) {
    return this.fetchTodos(options);
  }

  async fetchUserTodosPromise(userId, options = {}) {
    return this.fetchUserTodos(userId, options);
  }

  clearCache() {
    // Mock cache clearing - no-op in mock
  }
}
