// test/hbs-loader.mjs
import fs from "node:fs";

export async function load(url, context, defaultLoad) {
  if (url.endsWith(".hbs")) {
    const source = await fs.promises.readFile(new URL(url), "utf8");
    return {
      format: "module",
      source: `export default ${JSON.stringify(source)};`,
      shortCircuit: true,   // ✅ tell Node this is final
    };
  }

  // Fallback: let Node handle it
  return defaultLoad(url, context, defaultLoad);
}
