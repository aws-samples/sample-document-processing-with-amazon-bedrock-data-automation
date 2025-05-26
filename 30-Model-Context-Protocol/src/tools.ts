import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  getProject,
  invokeDataAutomationAndGetResults,
  listProjects,
} from "./helpers.js";

export function configureTools(server: McpServer) {
  server.tool(
    "get-projects",
    "Get a list of data automation projects",
    async () => {
      try {
        const projects = await listProjects();

        return {
          content: [{ type: "text", text: JSON.stringify(projects) }],
        };
      } catch (error) {
        return {
          content: [
            { type: "text", text: `Error: ${(error as Error).message}` },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get-project-details",
    "Get details of a data automation project",
    {
      projectArn: z.string().describe("The ARN of the project"),
    },
    async ({ projectArn }) => {
      try {
        const projectDetails = await getProject(projectArn);

        return {
          content: [{ type: "text", text: JSON.stringify(projectDetails) }],
        };
      } catch (error) {
        return {
          content: [
            { type: "text", text: `Error: ${(error as Error).message}` },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "analyze-asset",
    "Extracts insights from unstructured content (documents, images, video, audio) using a data automation project",
    {
      assetPath: z.string().describe("The path to the asset"),
      projectArn: z
        .string()
        .describe(
          "The ARN of the project. Uses default public project if not provided"
        )
        .optional(),
    },
    async ({ projectArn, assetPath }) => {
      try {
        const results = await invokeDataAutomationAndGetResults(
          assetPath,
          projectArn
        );

        return {
          content: [{ type: "text", text: JSON.stringify(results) }],
        };
      } catch (error) {
        return {
          content: [
            { type: "text", text: `Error: ${(error as Error).message}` },
          ],
          isError: true,
        };
      }
    }
  );
}
