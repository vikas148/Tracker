const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();  // Load environment variables

const app = express();

// Get configuration from environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;
const FILE_PATH = process.env.FILE_PATH;

if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME || !FILE_PATH) {
  console.error("Missing environment variables. Please check your .env file.");
  process.exit(1); // Exit if required environment variables are missing
}

const octokitPromise = import('@octokit/rest');  // Dynamically import Octokit

app.use(cors());
app.use(express.json());  // To parse JSON body from the request

// Function to generate markdown content
function generateMarkdown(data) {
  let markdown = `# GATE 90-Day Preparation Tracker\n\n`;
  markdown += `| Day | Date       | Topics                    | Hours Studied |\n`;
  markdown += `|-----|------------|---------------------------|---------------|\n`;

  data.forEach((entry) => {
    markdown += `| ${entry.day}  | ${entry.date} | ${entry.topics || "N/A"} | ${entry.hoursStudied} |\n`;
  });

  return markdown;
}

// API route to update the markdown file
app.post('/update-tracker', async (req, res) => {
  const trackerData = req.body; // Tracker data sent from the frontend

  if (!Array.isArray(trackerData) || trackerData.length === 0) {
    return res.status(400).json({ message: "Invalid tracker data!" });
  }

  try {
    const { Octokit } = await octokitPromise;  // Wait for Octokit to be dynamically imported
    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    const markdownContent = generateMarkdown(trackerData);

    // Check if the file exists in the repo
    const { data: fileData } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: FILE_PATH,
    });

    const { sha } = fileData; // Retrieve the SHA of the existing file
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: FILE_PATH,
      message: "Updated GATE preparation tracker",
      content: Buffer.from(markdownContent).toString("base64"),
      sha,
    });

    res.status(200).json({ message: 'Tracker updated successfully!' });
  } catch (error) {
    console.error('Error updating tracker:', error);
    res.status(500).json({ message: 'Error updating the tracker', error: error.message });
  }
});

// Start the Express server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Backend server is running on port ${port}`);
});
