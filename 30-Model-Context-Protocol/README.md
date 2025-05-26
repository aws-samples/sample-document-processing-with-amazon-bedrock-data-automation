# AWS Bedrock Data Automation MCP Server Demo

This demo project showcases how to build a Model Context Protocol (MCP) server that integrates with AWS Bedrock Data Automation - a service that helps automate data processing tasks like document analysis, text extraction, and data transformation.

## What is this Demo?

This is a companion project to the blog post about building MCP servers. It demonstrates how to:

1. Create a simple MCP server that connects to AWS services
2. Expose AWS Bedrock Data Automation capabilities to AI assistants
3. Process documents and files using AWS's powerful data automation tools

The demo server provides three main functions:

- List your available data automation projects in AWS
- Get detailed information about specific projects
- Analyze documents (PDFs, images, etc.) using these projects

Perfect for developers who want to learn how to:

- Build their first MCP server
- Integrate AWS services with AI assistants
- Understand MCP server development best practices

## Quick Start

1. Make sure you have AWS credentials with Bedrock Data Automation access
2. Clone and install:
   ```bash
   git clone https://github.com/modelcontextprotocol/aws-bedrock-data-automation-mcp
   cd aws-bedrock-data-automation-mcp
   npm install
   npm run build
   ```
3. Configure in Claude Desktop (see Configuration section below)
4. Try it out with the example commands in the Usage section!

## Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)
- AWS account with Bedrock Data Automation access
- AWS S3 bucket for storing assets and results

## Installation

### From source

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

### Using Docker

1. Clone the repository
2. Build the image:
   ```bash
   docker build -t mcp/aws-bedrock-data-automation .
   ```

## Configuration

The server requires the following environment variables:

| Variable                | Description                                                           | Default     |
| ----------------------- | --------------------------------------------------------------------- | ----------- |
| `AWS_REGION`            | AWS region where your Bedrock Data Automation resources are located   | `us-east-1` |
| `AWS_ACCESS_KEY_ID`     | AWS access key ID with permissions for Bedrock Data Automation and S3 | -           |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key                                                 | -           |
| `AWS_ACCOUNT_ID`        | Your AWS account ID                                                   | -           |
| `AWS_BUCKET_NAME`       | S3 bucket name for storing assets and results                         | -           |

You can set these environment variables in your shell before running the server, or configure them in the Claude Desktop configuration as shown below.

## Usage

### Running the server on Claude Desktop

Add the below config to the Claude Desktop following <https://modelcontextprotocol.io/quickstart/user>

```
{
  "mcpServers": {
    "aws-bedrock-data-automation": {
      "command": "node",
      "args": [
        "/path/to/your/repo/dist/index.js"
      ],
      "env": {
        "AWS_ACCESS_KEY_ID": "your-access-key-id",
        "AWS_SECRET_ACCESS_KEY": "your-secret-access-key",
        "AWS_REGION": "us-east-1",
        "AWS_ACCOUNT_ID": "your-account-id",
        "AWS_BUCKET_NAME": "your-bucket-name"
      }
    }
  }
}
```

Or the following when using with Docker

```
{
  "mcpServers": {
    "aws-bedrock-data-automation": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--mount",
        "type=bind,src=/some/path,dst=/projects",
        "-e",
        "AWS_ACCESS_KEY_ID",
        "-e",
        "AWS_SECRET_ACCESS_KEY",
        "-e",
        "AWS_REGION",
        "-e",
        "AWS_ACCOUNT_ID",
        "-e",
        "AWS_BUCKET_NAME",
        "mcp/aws-bedrock-data-automation"
      ],
      "env": {
        "AWS_ACCESS_KEY_ID": "your-access-key-id",
        "AWS_SECRET_ACCESS_KEY": "your-secret-access-key",
        "AWS_REGION": "us-east-1",
        "AWS_ACCOUNT_ID": "your-account-id",
        "AWS_BUCKET_NAME": "your-bucket-name"
      }
    }
  }
}
```

Restart Claude Desktop and talk to it!

## Example Workflow

Here's a typical workflow showing how to use the server:

1. List your available projects:

   ```
   get-projects
   ```

   This will return a list of your AWS Bedrock Data Automation projects like:

   ```json
   {
     "projects": [
       {
         "projectArn": "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/my-project",
         "name": "Document Analysis Project",
         "description": "Extracts text and data from documents"
       }
     ]
   }
   ```

2. Get details about a specific project:

   ```
   get-project-details
   projectArn: arn:aws:bedrock:us-east-1:123456789012:data-automation-project/my-project
   ```

   Returns detailed information about the project configuration and capabilities.

3. Analyze a document:
   ```
   analyze-asset
   assetPath: /path/to/my/document.pdf
   projectArn: arn:aws:bedrock:us-east-1:123456789012:data-automation-project/my-project
   ```
   This will:
   - Upload your document to S3
   - Process it using the specified project
   - Return the analysis results

## Troubleshooting

Common issues and solutions:

1. "AWS credentials not found"

   - Make sure you've set all required environment variables
   - Check that your AWS credentials have the necessary permissions

2. "File not found"

   - Ensure the file path is correct and accessible
   - Try using an absolute path instead of relative

3. "S3 bucket access denied"

   - Verify your AWS credentials have S3 access
   - Check that the bucket exists in the specified region

4. "Project not found"
   - Confirm the project ARN is correct
   - Ensure the project exists in the specified AWS region

## Learn More

This demo is part of a blog post series about building MCP servers. Check out the full blog post at:
[Building MCP Servers: AWS Bedrock Data Automation Integration](https://modelcontextprotocol.io/blog/aws-bedrock-data-automation)

For more information about:

- Model Context Protocol: https://modelcontextprotocol.io
- AWS Bedrock Data Automation: https://aws.amazon.com/bedrock/data-automation
