import { db } from "../orm";
import { eq } from "drizzle-orm";
import { project } from "../schema/project-schema";

export async function getProjectById(projectId: string) {
    const result = await db
        .select()
        .from(project)
        .where(eq(project.id, projectId))
        .limit(1);

    return result.length > 0 ? result[0] : null;
}
