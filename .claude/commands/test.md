# Application Validation Test Suite

Execute comprehensive validation tests for frontend and backend components, returning results in a standardized JSON format for automated processing.

## Purpose

Proactively identify and fix issues in the application before they impact users or developers. By running this comprehensive test suite, you can:
- Detect syntax errors and import failures
- Verify build processes and dependencies
- Ensure servers start correctly
- Validate API endpoints
- Ensure the application is in a healthy state

## Variables

TEST_COMMAND_TIMEOUT: 5 minutes

## Instructions

- Execute each test in the sequence provided below
- Capture the result (passed/failed) and any error messages
- IMPORTANT: Return ONLY the JSON array with test results
  - IMPORTANT: Do not include any additional text, explanations, or markdown formatting
  - We'll immediately run JSON.parse() on the output, so make sure it's valid JSON
- If a test passes, omit the error field
- If a test fails, include the error message in the error field
- Execute all tests even if some fail
- Error Handling:
  - If a command returns non-zero exit code, mark as failed and immediately stop processing tests
  - Capture stderr output for error field
  - Timeout commands after `TEST_COMMAND_TIMEOUT`
  - IMPORTANT: If a test fails, stop processing tests and return the results thus far
- Test execution order is important - dependencies should be validated first
- All file paths are relative to the project root
- Always run `pwd` and `cd` before each test to ensure you're operating in the correct directory for the given test

## Test Execution Sequence

### Frontend Tests

1. **Frontend Build**
   - Preparation Command: None
   - Command: `npm run build:client`
   - test_name: "frontend_build"
   - test_purpose: "Validates the complete Vite frontend build process including bundling, asset optimization, and production compilation"

2. **Frontend Dev Server**
   - Preparation Command: None
   - Command: `timeout 10 bash -c "npm run dev:client & sleep 5 && curl -f http://localhost:3000 && pkill -f vite" || pkill -f vite`
   - test_name: "frontend_dev_server"
   - test_purpose: "Validates that the Vite development server starts successfully and serves content on port 3000"

### Backend Tests

3. **Backend Health Check**
   - Preparation Command: None
   - Command: `timeout 10 bash -c "npm run dev:server & sleep 3 && curl -f http://localhost:3001/health && pkill -f 'node.*server'" || pkill -f 'node.*server'`
   - test_name: "backend_health_check"
   - test_purpose: "Validates that the Express backend starts and responds to health check endpoint on port 3001"

## Report

- IMPORTANT: Return results exclusively as a JSON array based on the `Output Structure` section below.
- Sort the JSON array with failed tests (passed: false) at the top
- Include all tests in the output, both passed and failed
- The execution_command field should contain the exact command that can be run to reproduce the test
- This allows subsequent agents to quickly identify and resolve errors

### Output Structure

```json
[
  {
    "test_name": "string",
    "passed": boolean,
    "execution_command": "string",
    "test_purpose": "string",
    "error": "optional string"
  },
  ...
]
```

### Example Output

```json
[
  {
    "test_name": "backend_health_check",
    "passed": false,
    "execution_command": "timeout 10 bash -c \"npm run dev:server & sleep 3 && curl -f http://localhost:3001/health && pkill -f 'node.*server'\" || pkill -f 'node.*server'",
    "test_purpose": "Validates that the Express backend starts and responds to health check endpoint on port 3001",
    "error": "curl: (7) Failed to connect to localhost port 3001: Connection refused"
  },
  {
    "test_name": "frontend_build",
    "passed": true,
    "execution_command": "npm run build:client",
    "test_purpose": "Validates the complete Vite frontend build process including bundling, asset optimization, and production compilation"
  },
  {
    "test_name": "frontend_dev_server",
    "passed": true,
    "execution_command": "timeout 10 bash -c \"npm run dev:client & sleep 5 && curl -f http://localhost:3000 && pkill -f vite\" || pkill -f vite",
    "test_purpose": "Validates that the Vite development server starts successfully and serves content on port 3000"
  }
]
```