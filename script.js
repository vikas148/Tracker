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
