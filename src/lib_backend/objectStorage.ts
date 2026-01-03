import {
    S3Client,
    PutObjectCommand,
    CreateBucketCommand,
    ListObjectsV2Command,
    DeleteObjectsCommand,
    PutBucketLifecycleConfigurationCommand,
    GetBucketLifecycleConfigurationCommand,
    DeleteBucketLifecycleCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

//////////////////////////////////////////////////
// CONFIG
//////////////////////////////////////////////////

export const PROJECT_BUCKET_NAME = "projects";

const s3 = new S3Client({
    region: "us-east-1",
    endpoint: import.meta.env.S3_URL_LOCAL,
    forcePathStyle: true,
    credentials: {
        accessKeyId: import.meta.env.S3_ACCESS_KEY as string,
        secretAccessKey: import.meta.env.S3_SECRET_KEY as string,
    },
});

//////////////////////////////////////////////////
// UPLOADS
//////////////////////////////////////////////////

export async function projectBucketUploadFile(
    key: string,
    body: Buffer | Uint8Array | Blob | string | ReadableStream,
    contentType = "application/octet-stream"
) {
    await s3.send(
        new PutObjectCommand({
            Bucket: PROJECT_BUCKET_NAME,
            Key: key,
            Body: body,
            ContentType: contentType,
        })
    );
}

export async function projectBucketGenerateUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 900
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: PROJECT_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    return getSignedUrl(s3, command, { expiresIn });
}

//////////////////////////////////////////////////
// PREFIX CLEANUP
//////////////////////////////////////////////////

export async function deleteProjectBucketPrefix(prefix: string) {
    let continuationToken: string | undefined;

    do {
        const list = await s3.send(
            new ListObjectsV2Command({
                Bucket: PROJECT_BUCKET_NAME,
                Prefix: prefix,
                ContinuationToken: continuationToken,
            })
        );

        if (!list.Contents?.length) break;

        await s3.send(
            new DeleteObjectsCommand({
                Bucket: PROJECT_BUCKET_NAME,
                Delete: {
                    Objects: list.Contents.map(obj => ({ Key: obj.Key! })),
                },
            })
        );

        continuationToken = list.IsTruncated
            ? list.NextContinuationToken
            : undefined;
    } while (continuationToken);
}

//////////////////////////////////////////////////
// LIFECYCLE
//////////////////////////////////////////////////

export async function setProjectAutoDelete(
    prefix: string,
    daysUntilDelete: number
) {
    await s3.send(
        new PutBucketLifecycleConfigurationCommand({
            Bucket: PROJECT_BUCKET_NAME,
            LifecycleConfiguration: {
                Rules: [
                    {
                        ID: `AutoDelete_${prefix}`,
                        Prefix: prefix,
                        Status: "Enabled",
                        Expiration: { Days: daysUntilDelete },
                    },
                ],
            },
        })
    );
}

export async function cancelProjectAutoDelete(prefix: string) {
    const ruleId = `AutoDelete_${prefix}`;

    const current = await s3.send(
        new GetBucketLifecycleConfigurationCommand({
            Bucket: PROJECT_BUCKET_NAME,
        })
    );

    const rules = (current.Rules ?? []).filter(r => r.ID !== ruleId);

    if (rules.length === 0) {
        await s3.send(
            new DeleteBucketLifecycleCommand({ Bucket: PROJECT_BUCKET_NAME })
        );
        return;
    }

    await s3.send(
        new PutBucketLifecycleConfigurationCommand({
            Bucket: PROJECT_BUCKET_NAME,
            LifecycleConfiguration: { Rules: rules },
        })
    );
}

//////////////////////////////////////////////////
// DATA ACCESS
//////////////////////////////////////////////////

export async function projectBucketGenerateDownloadUrl(
    key: string,
    expiresIn = 900 // 15 min
): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: PROJECT_BUCKET_NAME,
        Key: key,
    });

    return getSignedUrl(s3, command, { expiresIn });
}

//////////////////////////////////////////////////
// BUCKET MANAGEMENT
//////////////////////////////////////////////////

export async function ensureProjectBucketExists() {
    try {
        await s3.send(
            new CreateBucketCommand({
                Bucket: PROJECT_BUCKET_NAME,
            })
        );
        console.log(`Bucket "${PROJECT_BUCKET_NAME}" created successfully.`);
    } catch (err: any) {
        // Ignore "BucketAlreadyOwnedByYou" errors
        if (err.name === "BucketAlreadyOwnedByYou") {
            console.log(`Bucket "${PROJECT_BUCKET_NAME}" already exists.`);
        } else {
            throw err;
        }
    }
}

//////////////////////////////////////////////////
// STARTUP INITIALIZATION
//////////////////////////////////////////////////

(async () => {
    await ensureProjectBucketExists();
})().catch(err => {
    console.error(err);
});