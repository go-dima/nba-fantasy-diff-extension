export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.ts$": "@swc/jest",
  },
  moduleDirectories: ["node_modules", "src"],
  roots: ["<rootDir>/src/", "<rootDir>/tests/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
