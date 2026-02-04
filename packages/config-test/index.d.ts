export interface BaseTestConfig {
  test: {
    globals: boolean;
    reporters: string;
  };
}

export const baseConfig: BaseTestConfig;
