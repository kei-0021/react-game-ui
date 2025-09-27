// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: 'tsconfig.test.json',
      isolatedModules: true
    }
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: 'tsconfig.test.json',
      isolatedModules: true
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-dnd|dnd-core|@testing-library|react-dnd-html5-backend|nanoid|zustand)/)'
  ],
  moduleNameMapper: {
    '\\.module\\.css$': '<rootDir>/src/__mocks__/styleMock.ts',
    '\\.css$': '<rootDir>/src/__mocks__/styleMock.ts'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts']
};
