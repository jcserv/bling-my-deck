
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://api.manaql.com",
  documents: "src/hooks/**/*.ts",
  generates: {
    "src/__generated__/": {
      preset: "client",
      plugins: [],
      config: {
        avoidOptionals: true,
      }
    }
  }
};

export default config;
