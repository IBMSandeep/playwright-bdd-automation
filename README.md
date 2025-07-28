# Playwright BDD Automation Framework

A robust automation framework built with Playwright, TypeScript, and Cucumber.js for BDD-style testing. Supports both UI and API testing.

## Features

- Page Object Model design pattern
- BDD approach with Cucumber.js
- TypeScript for type safety
- Allure reporting integration
- Cross-browser testing
- API testing capabilities
- Environment configuration via .env file
- Screenshot capture on test failures
- Cross-platform compatibility (Windows, Linux, macOS)
- Slack notifications for test results
- GitHub Pages integration for Allure reports

## Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)
- Java (required for Allure reporting)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/rrendon2025/playwright-bdd-automation.git
cd playwright-bdd-automation
```

2. Install dependencies and Playwright browsers (recommended):
```bash
npm run setup
```

Alternatively, install only npm dependencies:
```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
BROWSER=chromium
HEADLESS=true
BASE_URL=https://www.saucedemo.com
STANDARD_USER=standard_user
PASSWORD=secret_sauce
```

## Running Tests

### Run all tests
```bash
npm run test:all
```

### Run UI tests
```bash
npm run test:ui
```

### Run API tests
```bash
npm run test:api         # Run all API tests
npm run test:api:tc1     # Run specific API test case 1
```

### Run tests with GUI (browser visible)
```bash
npm run test:gui         # Run all tests with browser visible
npm run test:gui:login   # Run login tests with browser visible
```

### Run tests with Allure reporting

#### All-in-one commands (recommended)
These commands will run tests, generate the Allure report, and open it in your browser - all in one step:

```bash
# Run all tests (UI and API) with Allure report
npm run test:all:allure

# Run only API tests with Allure report
npm run test:api:allure

# Headless mode (CLI execution)
npm run test:allure:full          # Run all tests in headless mode with Allure report

# With browser visible (video recording)
npm run test:allure:full:video    # Run all tests with browser visible and Allure report
```

#### Two-step approach
If you prefer more control, you can run these commands separately:

1. First run tests and prepare Allure results:
```bash
npm run test:gui:allure          # Run all tests and prepare Allure results
```

2. Then generate and view the Allure report:
```bash
npm run allure:report    # Generate and open the Allure report
```

Or run these steps individually:
```bash
npm run allure:generate  # Generate the Allure report
npm run allure:open      # Open the Allure report in a browser
```

## Project Maintenance

### First-time Setup
For a new clone or installation on a different machine:
```bash
npm run setup  # Install all dependencies and Playwright browsers
```

### Cleaning Up
To remove dependencies and keep project size minimal:
```bash
npm run clean  # Remove node_modules and package-lock.json
```

To perform a complete cleanup of all generated files:
```bash
npm run clean:all  # Remove node_modules, test results, reports, and package-lock.json
```

### Reset Project
To completely reset the project and reinstall dependencies:
```bash
npm run reset  # Clean all files and reinstall dependencies
```

## Test Reports

### Cucumber HTML Reports
Cucumber HTML reports are generated in `src/reports/cucumber-html-report.html`.

### Allure Reports
Allure reports are generated in the `allure-report` directory. After generating the report, it should automatically open in your default browser.

## CI/CD Integration

### Setting Up Slack Notifications

To receive test results in Slack:

1. **Create a Slack App**:
   - Go to [Slack API Apps](https://api.slack.com/apps) and click "Create New App"
   - Choose "From scratch" and enter a name (e.g., "Test Automation")
   - Select your workspace and click "Create App"

2. **Enable Incoming Webhooks**:
   - In the left sidebar, click "Incoming Webhooks"
   - Toggle the switch to "On"
   - Click "Add New Webhook to Workspace"
   - Select the channel where you want to receive notifications
   - Click "Allow"

3. **Copy the Webhook URL**:
   - After allowing access, you'll see a webhook URL
   - Copy the entire URL (it starts with `https://hooks.slack.com/services/`)

4. **Add to GitHub Secrets**:
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `SLACK_WEBHOOK_URL`
   - Value: Paste the webhook URL
   - Click "Add secret"

The GitHub Actions workflow will automatically use this webhook to send notifications about test results to your Slack channel.

### Viewing Allure Reports on GitHub Pages

The framework is configured to automatically publish Allure reports to GitHub Pages:

1. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "Deploy from a branch"
   - Select the "gh-pages" branch
   - Click "Save"

2. **Access Your Reports**:
   - After the GitHub Actions workflow runs successfully, your Allure reports will be available at:
   - For example: https://rrendon2025.github.io/playwright-bdd-automation/

3. **Workflow Configuration**:
   - The GitHub Actions workflow automatically:
     - Runs your tests
     - Generates Allure reports
     - Publishes them to GitHub Pages
     - Sends results to Slack

4. **Manually Triggering the Workflow**:
   - Go to the Actions tab in your repository
   - Select the "Playwright BDD Tests" workflow
   - Click "Run workflow" to manually trigger a test run

## Project Structure

```
playwright-BDD/
├── allure-results/       # Raw Allure results
├── allure-report/        # Generated Allure reports
├── src/
│   ├── api/              # API testing implementation
│   │   ├── clients/      # API client functions (GET, POST, etc.)
│   │   ├── requests/     # Request payload builders or schema templates
│   │   ├── responses/    # Response validators or data extractors
│   │   └── utils/        # API utilities for authentication, etc.
│   ├── features/         # Cucumber feature files
│   │   ├── api/          # API feature files
│   │   └── ui/           # UI feature files
│   ├── helpers/          # Helper scripts
│   ├── pages/            # Page Object Model classes
│   ├── reports/          # Test reports
│   ├── steps/            # Cucumber step definitions
│   │   ├── api/          # API step definitions
│   │   └── ui/           # UI step definitions
│   └── utils/            # Utility functions
├── test-results/         # Test results, screenshots, and videos
│   ├── screenshots/      # Screenshots captured during tests
│   └── videos/           # Videos recorded during tests
├── .env                  # Environment variables
├── .gitignore            # Git ignore configuration
├── cucumber.js           # Cucumber configuration
├── package.json          # Project dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Troubleshooting

### Allure Report Issues
If you encounter issues with the Allure report:

1. **Ensure Java is installed** - Allure requires Java to run. Install the latest JDK or JRE.

2. **Check the allure-results directory** - Make sure it contains the test results files.

3. **Run commands individually** - If combined commands fail, try running them one by one:
   ```bash
   npm run allure:clear
   npm run allure:generate
   npm run allure:open
   ```

4. **Update allure-commandline** - Try reinstalling:
   ```bash
   npm install allure-commandline@latest --save-dev
   ```

### GitHub Pages Issues
If your Allure reports aren't appearing on GitHub Pages:

1. **Check workflow run** - Go to the Actions tab to ensure the workflow ran successfully
2. **Verify gh-pages branch** - Confirm the gh-pages branch was created with content
3. **Check Pages settings** - Ensure GitHub Pages is configured to deploy from gh-pages branch
4. **Allow time for deployment** - GitHub Pages can take up to 10 minutes to deploy after a successful workflow

## Step Navigation in Feature Files

To enable Ctrl+Click navigation from feature files to step definitions:

1. Install the "Cucumber (Gherkin) Full Support" extension in VSCode/Cursor

## Test Cases

### API Tests
- TC1: Verify homepage content through API (GET request, status 200, content validation)
- TC2: Verify manifest.json content (GET request, status 200, JSON structure validation)

### UI Tests

#### Login Tests
- Verify Title Page
- Login with valid credentials
- Login with invalid credentials

#### Inventory Tests
- Validate Sauce Labs Backpack product details
- Add Sauce Labs Backpack to cart

## Key Features

- Cross-platform compatibility (Windows, Linux, macOS)
- Uses a single browser instance for all tests
- API testing capabilities for complete end-to-end testing
- Environment variables are stored in a root-level `.env` file
- Automatically manages test result directories (screenshots, videos)
- Generates comprehensive HTML and Allure reports
- Slack notifications for test results
- GitHub Pages integration for Allure reports


Screenshot:
Passed Execution
<img width="1899" height="974" alt="Pic1" src="https://github.com/user-attachments/assets/adca84db-19ba-4a9f-80e3-2ef9f16972ee" />


<img width="1920" height="1066" alt="Pic2" src="https://github.com/user-attachments/assets/649a7f00-0e8f-4077-b882-821df779a896" />



Failed Execution
<img width="1912" height="989" alt="Pic1" src="https://github.com/user-attachments/assets/f9883973-fa11-496d-93ac-74679670ae49" />

<img width="1916" height="1016" alt="Pic2" src="https://github.com/user-attachments/assets/f51dcfbd-d1de-4275-8a5b-eac1b7f57c02" />

<img width="1916" height="977" alt="Pic3" src="https://github.com/user-attachments/assets/60e06744-e1e7-4421-87e7-359d36cb189f" />


<img width="1918" height="986" alt="Pic4" src="https://github.com/user-attachments/assets/2d09fa32-5a87-481a-8e60-8f4c75e03f87" />




## Author
Ralph Harris rendon
