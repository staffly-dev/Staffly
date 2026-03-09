// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.MONGO_URI_LOCAL = 'mongodb://localhost:27017/ats-test';
});
