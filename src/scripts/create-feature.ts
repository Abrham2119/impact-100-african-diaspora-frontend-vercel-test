#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toSingular(str: string): string {
  // Simple heuristic – good enough for most feature names
  if (str.endsWith("ies")) return str.slice(0, -3) + "y"; // categories → category
  if (str.endsWith("ses")) return str.slice(0, -2); // statuses → status
  if (str.endsWith("s") && !str.endsWith("ss")) return str.slice(0, -1); // orders → order
  return str;
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

async function createFeature(featureName: string) {
  if (!featureName) {
    console.error("❌ Please provide a feature name.");
    console.error("   Example: npx tsx scripts/create-feature.ts orders");
    process.exit(1);
  }

  const featureFolder = featureName.toLowerCase().replace(/\s+/g, "-");
  const singular = toSingular(featureFolder);
  const pascal = toPascalCase(featureFolder); // Orders
  const camel = toCamelCase(featureFolder); // orders
  const singularPascal = toPascalCase(singular); // Order
  const singularCamel = toCamelCase(singular); // order

  const baseDir = path.join(process.cwd(), "src", "features", featureFolder);

  // Check if already exists
  try {
    await fs.access(baseDir);
    console.error(`❌ Feature "${featureFolder}" already exists at ${baseDir}`);
    process.exit(1);
  } catch {
    // doesn't exist → good
  }

  // Create all directories
  const dirs = [
    path.join(baseDir, "api"),
    path.join(baseDir, "hooks"),
    path.join(baseDir, "lib"),
    path.join(baseDir, "schemas"),
    path.join(baseDir, "components"),
    path.join(baseDir, "types"),
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }

  // ─── File contents ──────────────────────────

  const files: Record<string, string> = {
    // api
    [`api/${singularCamel}.service.ts`]: `// network calls (depends on infrastructure)

export const ${singularCamel}Service = {
  // get${pascal}: async () => {},
  // create${singularPascal}: async (data) => {},
  // get${singularPascal}ById: async (id: string) => {},
};
`,

    // hooks
    [`hooks/use${pascal}.ts`]: `// TanStack Query hooks

// import { useQuery } from '@tanstack/react-query';
// import { ${singularCamel}Keys } from '../lib/${singularCamel}Keys';
// import { ${singularCamel}Service } from '../api/${singularCamel}.service';

export function use${pascal}() {
  // return useQuery({
  //   queryKey: ${singularCamel}Keys.lists(),
  //   queryFn: ${singularCamel}Service.get${pascal},
  // });
}
`,

    // lib
    [`lib/${singularCamel}Keys.ts`]: `// query-key factory

export const ${singularCamel}Keys = {
  all: ['${camel}'] as const,
  lists: () => [...${singularCamel}Keys.all, 'list'] as const,
  list: (filters: string) => [...${singularCamel}Keys.lists(), { filters }] as const,
  details: () => [...${singularCamel}Keys.all, 'detail'] as const,
  detail: (id: string) => [...${singularCamel}Keys.details(), id] as const,
};
`,

    // schemas
    [`schemas/${singularCamel}.schema.ts`]: `// Zod schemas (forms/validation)

// import { z } from 'zod';

// export const ${singularCamel}Schema = z.object({
//   // ...
// });

// export type ${singularPascal}FormValues = z.infer<typeof ${singularCamel}Schema>;
`,

    // components (arrow function + default export)
    [`components/${pascal}.tsx`]: `const ${pascal} = () => {
  return null;
};

export default ${pascal};
`,

    // types
    [`types/api.ts`]: `// feature-local request/response shapes

export type ${singularPascal} = {
  id: string;
  // add fields here
};

export type Create${singularPascal}Request = {
  // ...
};

export type ${singularPascal}Response = {
  // ...
};
`,

    // index.ts
    [`index.ts`]: `// public surface of the feature (barrel)

export { ${singularCamel}Service } from './api/${singularCamel}.service';
export { use${pascal} } from './hooks/use${pascal}';
export { ${singularCamel}Keys } from './lib/${singularCamel}Keys';
export { default  } from './components/${pascal}';
export type { ${singularPascal}, Create${singularPascal}Request, ${singularPascal}Response } from './types/api';
`,
  };

  // Write all files
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(baseDir, relativePath);
    await fs.writeFile(fullPath, content, "utf-8");
  }

  console.log(`\n✅ Feature "${featureFolder}" created successfully!\n`);
  console.log(`📁 Location: src/features/${featureFolder}/`);
  console.log(`\nGenerated files:`);
  Object.keys(files).forEach((f) => console.log(`   • ${f}`));
  console.log("");
}

// ─────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────

const featureName = process.argv[2];
createFeature(featureName).catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
