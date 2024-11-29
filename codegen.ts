
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://api.manaql.com",
  documents: "src/api/manaql/**/*.ts",
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
