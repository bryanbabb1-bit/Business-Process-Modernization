import archiver from "archiver";
import { Writable } from "stream";
import { log, logError } from "@/lib/logger";

interface ArtifactInput {
  fileName: string;
  category: string;
  description: string;
  content: string;
}

interface ConfigValue {
  key: string;
  label: string;
  description: string;
  type: string;
  defaultValue: string;
  required: boolean;
}

interface PackageInput {
  packageName: string;
  summary: string;
  artifacts: ArtifactInput[];
  configValues: ConfigValue[];
}

/**
 * Generate a ZIP buffer from package artifacts.
 * Organizes files into category folders and generates a config.json.
 */
export async function generatePackageZip(
  input: PackageInput
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    const writable = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(chunk);
        callback();
      },
    });

    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      logError("package-generator", err);
      reject(err);
    });

    writable.on("finish", () => {
      resolve(Buffer.concat(chunks));
    });

    archive.pipe(writable);

    // Category folder mapping
    const categoryFolders: Record<string, string> = {
      guide: "guides",
      config: "configs",
      spec: "specs",
      scaffold: "scaffolds",
      report: "reports",
    };

    // Add each artifact to the appropriate folder
    for (const artifact of input.artifacts) {
      const folder = categoryFolders[artifact.category] || "other";
      const path = `${folder}/${artifact.fileName}`;
      archive.append(artifact.content, { name: path });
    }

    // Generate config.json with all configurable values
    const configJson = JSON.stringify(
      Object.fromEntries(
        input.configValues.map((cv) => [cv.key, cv.defaultValue])
      ),
      null,
      2
    );
    archive.append(configJson, { name: "config.json" });

    // Generate config documentation
    const configDocs = input.configValues
      .map(
        (cv) =>
          `### ${cv.key}\n- **Label:** ${cv.label}\n- **Description:** ${cv.description}\n- **Type:** ${cv.type}\n- **Default:** \`${cv.defaultValue}\`\n- **Required:** ${cv.required ? "Yes" : "No"}`
      )
      .join("\n\n");

    const configReadme = `# Configuration Reference\n\nEdit \`config.json\` with your specific values before running the setup script.\n\n${configDocs}\n`;
    archive.append(configReadme, { name: "CONFIG.md" });

    // Generate manifest
    const manifest = {
      packageName: input.packageName,
      summary: input.summary,
      generatedAt: new Date().toISOString(),
      artifacts: input.artifacts.map((a) => ({
        fileName: a.fileName,
        category: a.category,
        description: a.description,
        path: `${categoryFolders[a.category] || "other"}/${a.fileName}`,
      })),
      configValuesCount: input.configValues.length,
    };
    archive.append(JSON.stringify(manifest, null, 2), {
      name: "manifest.json",
    });

    log(
      "INFO",
      "package-generator",
      `Generating ZIP: ${input.artifacts.length} artifacts, ${input.configValues.length} config values`
    );

    archive.finalize();
  });
}
