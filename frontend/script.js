// Selecting elements
const trackerBody = document.getElementById('trackerBody');
const updateForm = document.getElementById('updateForm'); // Correct ID from HTML

// Initialize tracker data
let trackerData = JSON.parse(localStorage.getItem('trackerData')) || initializeTracker();

// Function to initialize tracker with 90 days
function initializeTracker() {
    const today = new Date();
    let tracker = [];
    for (let i = 1; i <= 90; i++) {
        let day = new Date();
        day.setDate(today.getDate() + (i - 1));
        tracker.push({
            day: i,
            date: day.toISOString().split('T')[0],
            topics: "",
            hoursStudied: 0,
        });
    }
    localStorage.setItem('trackerData', JSON.stringify(tracker));
    return tracker;
}

// Render tracker data in the table
function renderTracker() {
    trackerBody.innerHTML = ""; // Clear previous rows
    trackerData.forEach((entry) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.day}</td>
            <td>${entry.date}</td>
            <td>${entry.topics || "N/A"}</td>
            <td>${entry.hoursStudied}</td>
            <td><button class="btn btn-sm btn-secondary" onclick="editDay(${entry.day})">Edit</button></td>
        `;
        trackerBody.appendChild(row);
    });
}

// Handle form submission to update a day's progress
updateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const day = parseInt(document.getElementById('day').value);
    const topics = document.getElementById('topics').value;
    const hours = parseFloat(document.getElementById('hours').value);

    if (day >= 1 && day <= 90) {
        trackerData[day - 1].topics = topics;
        trackerData[day - 1].hoursStudied = hours;
        localStorage.setItem('trackerData', JSON.stringify(trackerData));
        renderTracker();
        alert(`Day ${day} updated successfully!`);
        updateForm.reset();
        
        // Call the backend to update the markdown file on GitHub
        sendDataToBackend();
    } else {
        alert("Invalid day number! Please select a day between 1 and 90.");
    }
});

// Function to populate the form for editing
function editDay(day) {
    const entry = trackerData[day - 1];
    document.getElementById('day').value = entry.day;
    document.getElementById('topics').value = entry.topics;
    document.getElementById('hours').value = entry.hoursStudied;
}

// Initial render on page load
renderTracker();

// Generate Markdown content
function generateMarkdown(data) {
    let markdown = `# GATE 90-Day Preparation Tracker\n\n`;
    markdown += `| Day | Date       | Topics                    | Hours Studied |\n`;
    markdown += `|-----|------------|---------------------------|---------------|\n`;

    data.forEach((entry) => {
        markdown += `| ${entry.day}  | ${entry.date} | ${entry.topics || "N/A"} | ${entry.hoursStudied} |\n`;
    });

    return markdown;
}

// Fetch tracker data from localStorage
function getTrackerData() {
    return JSON.parse(localStorage.getItem("trackerData")) || [];
}

// Download markdown file
function downloadMarkdown() {
    const trackerData = getTrackerData();
    const markdownContent = generateMarkdown(trackerData);

    // Create a Blob and trigger download
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GATE_Preparation_Tracker.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Attach to a button click in your HTML
document.getElementById("downloadBtn").addEventListener("click", downloadMarkdown);

// ** Step 5 Code Starts Here **
// Send tracker data to the backend
async function sendDataToBackend() {
    const trackerData = JSON.parse(localStorage.getItem("trackerData"));

    try {
        const response = await fetch('http://localhost:3000/update-tracker', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(trackerData)
        });

        const result = await response.json();
        console.log(result.message); // Log success message from backend
    } catch (error) {
        console.error("Error sending data to backend:", error);
    }
}
