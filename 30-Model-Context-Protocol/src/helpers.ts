import { readFile } from "fs/promises";
import { extname } from "path";
import { randomUUID } from "crypto";
import { AwsCredentialIdentity } from "@smithy/types";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import {
  BedrockDataAutomationClient,
  GetDataAutomationProjectCommand,
  ListDataAutomationProjectsCommand,
} from "@aws-sdk/client-bedrock-data-automation";
import {
  BedrockDataAutomationRuntimeClient,
  InvokeDataAutomationAsyncCommand,
  GetDataAutomationStatusCommand,
  AutomationJobStatus,
} from "@aws-sdk/client-bedrock-data-automation-runtime";

const region = process.env.AWS_REGION || "us-east-1";
const credentials: AwsCredentialIdentity = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
};
const accountId = process.env.AWS_ACCOUNT_ID;
const bucketName = process.env.AWS_BUCKET_NAME;
const profileArn = `arn:aws:bedrock:${region}:${accountId}:data-automation-profile/us.data-automation-v1`;

const buildClient = new BedrockDataAutomationClient({ region, credentials });
const runClient = new BedrockDataAutomationRuntimeClient({
  region,
  credentials,
});
const s3Client = new S3Client({ region, credentials });

export async function listProjects() {
  const response = await buildClient.send(
    new ListDataAutomationProjectsCommand()
  );
  return response.projects;
}

export async function getProject(projectArn: string) {
  const response = await buildClient.send(
    new GetDataAutomationProjectCommand({ projectArn })
  );
  return response.project;
}

export async function invokeDataAutomationAndGetResults(
  assetPath: string,
  projectArn?: string
) {
  const assetUri = await uploadToS3(assetPath);
  if (!projectArn) {
    projectArn = `arn:aws:bedrock:${region}:aws:data-automation-project/public-default`;
  }
  console.error("Using assetUri:", assetUri, "and projectArn:", projectArn);

  const { invocationArn } = await runClient.send(
    new InvokeDataAutomationAsyncCommand({
      inputConfiguration: { s3Uri: assetUri },
      outputConfiguration: { s3Uri: `s3://${bucketName}/mcp/test-output` },
      dataAutomationConfiguration: { dataAutomationProjectArn: projectArn },
      dataAutomationProfileArn: profileArn,
    })
  );
  console.error("Data Automation invoked:", invocationArn);

  let getRespose;
  do {
    getRespose = await runClient.send(
      new GetDataAutomationStatusCommand({ invocationArn })
    );
    await new Promise((resolve) => setTimeout(resolve, 3000));
  } while (getRespose.status === AutomationJobStatus.IN_PROGRESS);

  console.error("Data Automation completed:", getRespose);
  if (
    getRespose.status !== AutomationJobStatus.SUCCESS ||
    !getRespose.outputConfiguration?.s3Uri
  ) {
    return null;
  }

  const outputUri = getRespose.outputConfiguration.s3Uri;
  const jobMetadata = await downloadFromS3(outputUri);
  if (!jobMetadata) {
    return null;
  }
  console.error("Job metadata:", jobMetadata);

  const standardOutputUri =
    jobMetadata?.output_metadata?.[0]?.segment_metadata?.[0]
      ?.standard_output_path;
  const customOutputUri =
    jobMetadata?.output_metadata?.[0]?.segment_metadata?.[0]
      ?.custom_output_path;
  if (!standardOutputUri && !customOutputUri) {
    return null;
  }

  const result = { standardOutput: null, customOutput: null };
  if (standardOutputUri) {
    result.standardOutput = await downloadFromS3(standardOutputUri);
  }
  if (customOutputUri) {
    result.customOutput = await downloadFromS3(customOutputUri);
  }

  return result;
}

async function uploadToS3(assetPath: string) {
  const assetContent = await readFile(assetPath);
  const extension = extname(assetPath);
  const key = `mcp/${randomUUID()}${extension}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: assetContent,
  });
  await s3Client.send(command);
  console.error(`Uploaded ${assetPath} to s3://${bucketName}/${key}`);

  return `s3://${bucketName}/${key}`;
}

async function downloadFromS3(s3Uri: string) {
  const { bucket, key } = getBucketAndKeyFromS3Uri(s3Uri);

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  const response = await s3Client.send(command);

  const output = await response.Body?.transformToString();
  return output ? JSON.parse(output) : null;
}

function getBucketAndKeyFromS3Uri(s3Uri: string) {
  const [bucket, ...keyParts] = s3Uri.split("/").slice(2);
  const key = keyParts.join("/");
  return { bucket, key };
}
