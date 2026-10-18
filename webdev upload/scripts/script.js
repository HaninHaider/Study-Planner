console.log("University Study Planner Loaded");


//calendar F1
const monthYear = document.getElementById("monthYear");
const datesContainer = document.getElementById("dates");


let currentDate = new Date();
let viewList = [];
let masterList = [];
let gradeChart = null;
// save to local storage 
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(masterList));
}

function saveGrades(grades) {
    localStorage.setItem("grades", JSON.stringify(grades));
}

function loadGrades() {
    const storedGrades = localStorage.getItem("grades");

    if (storedGrades) {
        return JSON.parse(storedGrades);
    }

    return {};
}
function saveGoal(goal) {
    localStorage.setItem("gradeGoal", goal);
}

function loadGoal() {
    return localStorage.getItem("gradeGoal");
}

//load task from local storage

function loadTaskFromStorage() {

    const storedTask = localStorage.getItem("tasks");
    if (storedTask) {
        masterList = JSON.parse(storedTask);

        masterList = masterList.map(function (task) {
            if (!task.id) {
                task.id = Date.now() + Math.random();
            }

            if (task.completed === undefined) {
                task.completed = task.completionDate ? true : false;
            }

            return task;
        });
    }

    updateViewList();
    showCalendar();
    displayTaskList();
    displayOverdueTasks();
    displayUpcomingTasks();
    SidebarNotification();
    displayGrades();
}

loadTaskFromStorage();

//upload json file like tut15
document.getElementById("fileInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {
        try {
            const data = JSON.parse(reader.result);

            if (!Array.isArray(data)) {
                alert("JSON must contain an array of assessments");
                return;
            }
            masterList = data.map(function (task) {
                if (!task.id) {
                    task.id = Date.now() + Math.random();
                }
                if (task.completed === undefined) {
                    task.completed = task.completionDate ? true : false;
                }
                return task;
            });

            saveTasks();
            updateViewList();
            showCalendar();
            displayTaskList();
            displayOverdueTasks();
            displayUpcomingTasks();
            SidebarNotification();
            displayGrades();

        } catch (error) {
            alert("Invalid JSON file");
        }
    };

    reader.readAsText(file);
});
//taks FR3
function updateViewList() {
    viewList = [...masterList];

    viewList.sort(function (a, b) {
        return new Date(a.deadline) - new Date(b.deadline);
    });
}

//diplays all task 
function displayTaskList() {
    const itemsContainer = document.getElementById("items");

    if (!itemsContainer) return;

    if (viewList.length === 0) {
        itemsContainer.innerHTML = "<p>There are no tasks yet.</p>";
        return;
    }

    let output = "";
    const todayDate = new Date().toISOString().split("T")[0];

    for (let i = 0; i < viewList.length; i++) {
        const task = viewList[i];

        let itemClass = "task-item";

        if (task.completed) {
            itemClass += " complete";
        } else if (task.deadline < todayDate) {
            itemClass += " overdue";
        } else {
            itemClass += " upcoming";
        }

        output += `
        <div class="${itemClass}">
            <span onclick="completeTask('${task.id}', this.parentElement)">
                ${task.assessmentName} (Due: ${task.deadline})
            </span>
            <button type="button" onclick="deleteTask('${task.id}')">Delete</button>
        </div>
        `;
    }

    itemsContainer.innerHTML = output;
}
//F1 calander and display tasl

function showCalendar() {
    datesContainer.innerHTML = "";
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];
    monthYear.textContent = `${monthNames[month]} ${year}`;

    let firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

    firstDayOfMonth = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.classList.add("date-cell", "empty-cell");
        datesContainer.appendChild(emptyCell);
    }

    for (let day = 1; day <= lastDateOfMonth; day++) {
        const dateCell = document.createElement("div");
        dateCell.classList.add("date-cell");

        const dayNumber = document.createElement("div");
        dayNumber.classList.add("day-number");
        dayNumber.textContent = day;
        dateCell.appendChild(dayNumber);

        const cellDate = year + "-" + String(month + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
        dateCell.dataset.day = cellDate;

        viewList.forEach(task => {
            if (task.deadline === cellDate) {

                const dueTask = document.createElement("div");

                const todayDate = new Date().toISOString().split("T")[0];

                if (task.completed) {
                    dueTask.classList.add("task-complete");
                } else if (task.deadline < todayDate) {
                    dueTask.classList.add("overdue");
                } else {
                    dueTask.classList.add("task-due");
                }
                let symbol = "";
                //use symbol as asked in spec
                if (task.completed) {
                    symbol = "✔️ ";
                } else if (task.deadline < todayDate) {
                    symbol = "⚠️ ";
                } else {
                    symbol = "⏳ ";
                }

                dueTask.textContent = "Due: " + task.assessmentName;
                dueTask.textContent = symbol + task.assessmentName;
                dateCell.appendChild(dueTask);
            }
        });

        datesContainer.appendChild(dateCell);
    }
}

function showTasksForDate(items) {
    const dialog = document.getElementById("calendarDayView");
    const itemsContainer = document.getElementById("dayItems");

    let output = "";

    if (items.length === 0) {
        output = "No tasks on this day";
    } else {
        output = "<ul>";

        items.forEach(function (item) {
            output += "<li>" + item.assessmentName + "</li>";
        });

        output += "</ul>";
    }

    itemsContainer.innerHTML = output;
    dialog.showModal();
}

function closeDialog() {
    const dialog = document.getElementById("calendarDayView");
    dialog.close();
}
// allow user to mark task completed
function completeTask(id, el) {

    id = Number(id);

    const task = masterList.find(function (item) {
        return item.id === id;
    });

    if (!task) return;

    if (task.completed) {
        task.completed = false;
        task.completionDate = "";
        el.classList.remove("complete", "strikethrough");
    } else {
        task.completed = true;
        task.completionDate = new Date().toISOString().split("T")[0];
        el.classList.add("complete", "strikethrough");
    }

    saveTasks();
    updateViewList();
    displayTaskList();
    showCalendar();
    displayOverdueTasks();
    displayUpcomingTasks();
    SidebarNotification();
    displayGrades();
}
//deletes task
function deleteTask(id) {

    id = Number(id);

    masterList = masterList.filter(function (task) {
        return task.id !== id;
    });

    saveTasks();
    updateViewList();
    displayTaskList();
    showCalendar();
    displayOverdueTasks();
    displayUpcomingTasks();
    SidebarNotification();
    displayGrades();
}
function clearCompletedTasks() {

    masterList = masterList.filter(function (task) {
        return !task.completed;
    });

    saveTasks();
    updateViewList();
    displayTaskList();
    showCalendar();
    displayOverdueTasks();
    displayUpcomingTasks();
    SidebarNotification();
    displayGrades();
}
//click on the day tp show task
function selectCalendarDay(event) {
    const clickedCell = event.target.closest(".date-cell");

    if (!clickedCell) return;

    const selectedDate = clickedCell.dataset.day;

    if (!selectedDate) return;

    const items = masterList.filter(function (item) {
        return item.deadline === selectedDate;
    });

    showTasksForDate(items);
}

//FR4 overdue task
function displayOverdueTasks() {

    const overdueSection = document.getElementById("overdue");
    overdueSection.innerHTML = "";

    let hasOverdue = false;

    const todayDate = new Date().toISOString().split("T")[0];
    for (let i = 0; i < viewList.length; i++) {
        const task = viewList[i];


        if (task.deadline < todayDate && !task.completed) {
            hasOverdue = true;

            const taskDiv = document.createElement("div");
            taskDiv.classList.add("overdue");
            taskDiv.textContent = `${task.assessmentName} (Due: ${task.deadline})`;

            overdueSection.appendChild(taskDiv);
        }
    }

    if (!hasOverdue) {
        const message = document.createElement("p");
        message.textContent = "No overdue tasks.";
        overdueSection.appendChild(message);
    }
}




//FR5 upcoming tasks in next 30 days
function displayUpcomingTasks() {

    const upcomingSection = document.getElementById("upcoming");
    upcomingSection.innerHTML = "";

    let hasUpcoming = false;
    const today = new Date().toISOString().split("T")[0];

    const next30Date = new Date();
    next30Date.setDate(next30Date.getDate() + 30);
    const next30 = next30Date.toISOString().split("T")[0];

    for (let i = 0; i < viewList.length; i++) {
        const task = viewList[i];

        if (task.deadline >= today && task.deadline <= next30 && !task.completed) {
            hasUpcoming = true;

            const taskDiv = document.createElement("div");
            taskDiv.classList.add("task-due");
            taskDiv.textContent = `${task.assessmentName} (Due: ${task.deadline})`;

            upcomingSection.appendChild(taskDiv);
        }
    }

    if (!hasUpcoming) {
        const message = document.createElement("p");
        message.textContent = "No upcoming tasks.";
        upcomingSection.appendChild(message);
    }
}

//  notify the user 
function SidebarNotification() {
    const SidebarNotification = document.getElementById("SidebarNotification");
    SidebarNotification.innerHTML = "";

    const todayDate = new Date().toISOString().split("T")[0];
    const next30Date = new Date();
    next30Date.setDate(next30Date.getDate() + 30);
    const next30 = next30Date.toISOString().split("T")[0];

    let overdueCount = 0;
    let upcomingCount = 0;

    for (let i = 0; i < viewList.length; i++) {
        const task = viewList[i];

        if (task.deadline < todayDate && !task.completed) {
            overdueCount++;
        }
        if (task.deadline >= todayDate && task.deadline <= next30 && !task.completed) {
            upcomingCount++;
        }
    }


    const overdueMessage = document.createElement("p");
    overdueMessage.classList.add("pulse-card");
    overdueMessage.textContent = `You have ${overdueCount} overdue task${overdueCount !== 1 ? "s" : ""}`;
    overdueMessage.style.cursor = "pointer";

    overdueMessage.addEventListener("click", function () {
        document.getElementById("overdueSection").scrollIntoView({ behavior: "smooth" });
    });

    const upcomingMessage = document.createElement("p");
    upcomingMessage.classList.add("pulse-card");
    upcomingMessage.textContent = `You have ${upcomingCount} upcoming task${upcomingCount !== 1 ? "s" : ""}`;
    upcomingMessage.style.cursor = "pointer";

    upcomingMessage.addEventListener("click", function () {
        document.getElementById("upcomingTaskk").scrollIntoView({ behavior: "smooth" });
    });

    SidebarNotification.appendChild(overdueMessage);
    SidebarNotification.appendChild(upcomingMessage);
}
// navigation between moths 
document.getElementById("prevMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    showCalendar();
});
document.getElementById("nextMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    showCalendar();
});



datesContainer.addEventListener("click", selectCalendarDay);
//fr6
const gradeGoalSelect = document.getElementById("gradeGoal");

const savedGoal = loadGoal();
if (savedGoal) {
    gradeGoalSelect.value = savedGoal;
}
showGoalFeedback();
showChart();
showLineChart();
//they can change their goal
gradeGoalSelect.addEventListener("change", function () {
    saveGoal(this.value);
    showGoalFeedback();
    showChart();
    showLineChart();
});

document.getElementById("clearCompleted").addEventListener("click", clearCompletedTasks);

updateViewList();
showCalendar();
displayTaskList();

//form
const form = document.querySelector(".advanced-form");

const descriptionInput = document.getElementById("description");
const descriptionError = document.getElementById("description-error");

const resourceInput = document.getElementById("resource");
const resourceError = document.getElementById("resource-error");

const dueDateInput = document.getElementById("dueDate");
const dueDateError = document.getElementById("dueDate-error");

const completiondateInput = document.getElementById("completion-date");
const completiondateError = document.getElementById("completion-date-error");

// adding new task with validation
form.addEventListener("submit", function (event) {
    event.preventDefault();
    let isValid = true;

    if (descriptionInput.value === "") {
        descriptionError.textContent = "Please enter description";
        isValid = false;

    } else if (/<[]+>/.test(descriptionInput.value)) {
        descriptionError.textContent = "Description cannot contain any HTML tags";
        isValid = false;

    } else {
        descriptionError.textContent = "";
    }

    if (resourceInput.value !== "" && !resourceInput.value.includes("http://") && !resourceInput.value.includes("https://")) {
        resourceError.textContent = "please enter a valid link";
        isValid = false;
    } else {
        resourceError.textContent = "";
    }

    if (dueDateInput.value === "") {
        dueDateError.textContent = "Please enter due date";
        isValid = false;
    } else {
        let today = new Date().toISOString().split("T")[0];

        if (dueDateInput.value < today) {
            dueDateError.textContent = "Due date cannot be in the past";
            isValid = false;
        } else {
            dueDateError.textContent = "";
        }
    }

    completiondateError.textContent = "";

    if (!isValid) {
        return;
    }

    const task = {
        id: Date.now() + Math.random(),
        assessmentName: descriptionInput.value,
        deadline: dueDateInput.value,
        completionDate: completiondateInput.value,
        resource: resourceInput.value,
        completed: completiondateInput.value !== ""
    };

    masterList.push(task);
    saveTasks();
    updateViewList();
    displayTaskList();
    showCalendar();
    displayOverdueTasks();
    displayUpcomingTasks();
    SidebarNotification();
    displayGrades();
    form.reset();
});

//error messege for user
descriptionInput.addEventListener("input", function () {
    if (descriptionInput.validity.valid) {
        descriptionError.textContent = "";
    }
});

resourceInput.addEventListener("input", function () {
    if (resourceInput.validity.valid) {
        resourceError.textContent = "";
    }
});

dueDateInput.addEventListener("input", function () {

    let today = new Date().toISOString().split("T")[0];

    if (dueDateInput.value >= today) {
        dueDateError.textContent = "";
    }
});

completiondateInput.addEventListener("input", function () {
    completiondateError.textContent = "";


});




//FR8 STudy Focus timer
const startTimerBtn = document.getElementById("startTimerBtn");
const stopTimerBtn = document.getElementById("stopTimerBtn");
const timerDisplay = document.getElementById("timerDisplay");
const focusTime = document.getElementById("focusTime");
const alarmSound = document.getElementById("alarmSound");

let timerInterval;
let totalSeconds = 0;

function formatTime(seconds) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
}

function saveTimerState(endTime, duration) {
    localStorage.setItem("timerEndTime", endTime);
    localStorage.setItem("timerDuration", duration);
}

function clearTimerState() {
    localStorage.removeItem("timerEndTime");
    localStorage.removeItem("timerDuration");
}

function runTimer(endTime) {
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const now = Date.now();
        const remainingSeconds = Math.max(0, Math.ceil((endTime - now) / 1000));

        timerDisplay.textContent = formatTime(remainingSeconds);

        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            clearTimerState();
            alarmSound.play();
        }
    }, 1000);
}
//start timer
function startTimer() {
    clearInterval(timerInterval);

    totalSeconds = Math.floor(Number(focusTime.value) * 60);
    const endTime = Date.now() + totalSeconds * 1000;

    saveTimerState(endTime, totalSeconds);
    timerDisplay.textContent = formatTime(totalSeconds);
    alarmSound.pause();
    alarmSound.currentTime = 0;

    runTimer(endTime);
}
//stop timer
function stopTimer() {
    clearInterval(timerInterval);
    clearTimerState();

    timerDisplay.textContent = formatTime(Number(focusTime.value) * 60);
    alarmSound.pause();
    alarmSound.currentTime = 0;
}
// if the site get refreshed the time is stored still
function loadTimerFromStorage() {
    const savedEndTime = localStorage.getItem("timerEndTime");
    const savedDuration = localStorage.getItem("timerDuration");

    if (!savedEndTime || !savedDuration) {
        timerDisplay.textContent = formatTime(Number(focusTime.value) * 60);
        return;
    }

    const endTime = Number(savedEndTime);
    const remainingSeconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

    if (remainingSeconds > 0) {
        timerDisplay.textContent = formatTime(remainingSeconds);
        runTimer(endTime);
    } else {
        clearTimerState();
        timerDisplay.textContent = formatTime(Number(focusTime.value) * 60);
    }
}

focusTime.addEventListener("change", function () {
    if (!localStorage.getItem("timerEndTime")) {
        timerDisplay.textContent = formatTime(Number(focusTime.value) * 60);
    }
});

startTimerBtn.addEventListener("click", startTimer);
stopTimerBtn.addEventListener("click", stopTimer);

loadTimerFromStorage();
//FR7 display grades in modules cards using a slider enter value 0-100
//https://www.w3schools.com/howto/howto_js_rangeslider.asp slider for value much nicer
function displayGrades() {
    const gradesContainer = document.getElementById("actualgrades-container");
    gradesContainer.innerHTML = "";

    const savedGrades = loadGrades();

    const modules = {};
    for (let i = 0; i < masterList.length; i++) {
        const task = masterList[i];

        if (!task.module || task.weighting === undefined) {
            continue;
        }

        if (!modules[task.module]) {
            modules[task.module] = [];
        }
        modules[task.module].push(task);
    }

    for (const moduleName in modules) {
        const moduleCard = document.createElement("div");
        moduleCard.classList.add("grade-card");

        const moduleTitle = document.createElement("h3");
        moduleTitle.textContent = moduleName;
        moduleCard.appendChild(moduleTitle);

        for (let i = 0; i < modules[moduleName].length; i++) {
            const assessment = modules[moduleName][i];

            const row = document.createElement("div");
            row.classList.add("grade-row");

            const label = document.createElement("label");
            label.textContent = assessment.assessmentName + " (weighting: " + (assessment.weighting * 100) + "%)";

            const slideContainer = document.createElement("div");
            slideContainer.classList.add("slidecontainer");

            const input = document.createElement("input");
            input.type = "range";
            input.min = "0";
            input.max = "100";

            const gradeKey = moduleName + "_" + assessment.assessmentName;
            input.value = savedGrades[gradeKey] || "0";

            input.classList.add("slider");
            input.dataset.weighting = assessment.weighting;
            input.dataset.gradeKey = gradeKey;

            const output = document.createElement("p");
            output.classList.add("slider-output");
            output.innerHTML = input.value;

            slideContainer.appendChild(input);

            row.appendChild(label);
            row.appendChild(slideContainer);
            row.appendChild(output);

            moduleCard.appendChild(row);
        }

        const gradeText = document.createElement("p");
        gradeText.classList.add("grade-total");
        gradeText.textContent = "Module grade so far: 0.0%";
        moduleCard.appendChild(gradeText);

        const allInputs = moduleCard.querySelectorAll(".slider");
        const allOutputs = moduleCard.querySelectorAll(".slider-output");

        for (let i = 0; i < allInputs.length; i++) {
            const slider = allInputs[i];
            const output = allOutputs[i];

            output.innerHTML = slider.value;
            
            slider.oninput = function () {
                output.innerHTML = this.value;

                const savedGrades = loadGrades();
                savedGrades[this.dataset.gradeKey] = this.value;
                saveGrades(savedGrades);

                let total = 0;

                for (let j = 0; j < allInputs.length; j++) {
                    const mark = Number(allInputs[j].value) || 0;
                    const weight = Number(allInputs[j].dataset.weighting);
                    total += mark * weight;
                }

                gradeText.textContent = `Module grade so far: ${total.toFixed(1)}%`;
                showGoalFeedback();
                showChart();
                showLineChart();
            };
        }

        let total = 0;

        for (let j = 0; j < allInputs.length; j++) {
            const mark = Number(allInputs[j].value) || 0;
            const weight = Number(allInputs[j].dataset.weighting);
            total += mark * weight;
        }

        gradeText.textContent = `Module grade so far: ${total.toFixed(1)}%`;

        gradesContainer.appendChild(moduleCard);
    }

    showGoalFeedback();
    showChart();
    showLineChart();

}

//feedback on the grade against the actual grade
function showGoalFeedback() {
    const container = document.getElementById("goal-feedback");
    const select = document.getElementById("gradeGoal");

    container.innerHTML = "";

    const target = Number(select.value);

    if (!target) {
        return;
    }

    const sliders = document.querySelectorAll("#actualgrades-container .slider");

    let weightedSum = 0;
    let totalWeight = 0;

    sliders.forEach(function (slider) {
        const mark = Number(slider.value) || 0;
        const weight = Number(slider.dataset.weighting) || 0;

        weightedSum += mark * weight;
        totalWeight += weight;
    });


    const currentAvg = totalWeight > 0 ? weightedSum / totalWeight : 0;
    let percentage = target > 0 ? (currentAvg / target) * 100 : 0;

    if (percentage > 100) {
        percentage = 100;
    }

    const statusText = currentAvg >= target
        ? `On track! Current average: ${currentAvg.toFixed(1)}%`
        : `Current average: ${currentAvg.toFixed(1)}% — you need ${target}% to reach your goal.`;

    container.innerHTML = `
    <p><strong>Goal: ${target}%+</strong></p>
    <div class="progress-bar-outer">
        <div class="progress-bar-inner" style="width: ${percentage}%"></div>
    </div>
    <p class="goal-status">${statusText}</p>
`;
}

// FR6 - Displays a bar chart comparing the user's current overall average with their selected goal grade.

function showChart() {
    const canvas = document.getElementById("barChart");
    if (!canvas) return;

    const goal = Number(document.getElementById("gradeGoal").value) || 0;
    const sliders = document.querySelectorAll("#actualgrades-container .slider");

    let weightedSum = 0;
    let totalWeight = 0;

    sliders.forEach(function (slider) {
        const mark = Number(slider.value) || 0;
        const weight = Number(slider.dataset.weighting) || 0;

        weightedSum += mark * weight;
        totalWeight += weight;
    });

    const overallAverage = totalWeight > 0 ? (weightedSum / totalWeight) : 0;

    if (gradeChart) {
        gradeChart.destroy();
    }

    gradeChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: ["Overall Average", "Goal Grade"],
            datasets: [{
                label: "Grade %",
                data: [overallAverage.toFixed(1), goal],
                backgroundColor: [
                    "rgba(54, 162, 235, 0.7)",
                    "rgba(255, 99, 132, 0.7)"
                ],
                borderColor: [
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 99, 132, 1)"
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,

        }


    });
}
// FR7 - Displays a line chart showing calculated module averages based on entered marks and weightings.

function showLineChart() {
    const canvas = document.getElementById("lineChart");
    if (!canvas) return;

    const savedGrades = loadGrades();

    const modules = {};
    for (let i = 0; i < masterList.length; i++) {
        const task = masterList[i];

        if (!task.module || task.weighting === undefined) {
            continue;
        }

        if (!modules[task.module]) {
            modules[task.module] = [];
        }

        modules[task.module].push(task);
    }

    const moduleNames = [];
    const moduleAverages = [];

    for (const moduleName in modules) {
        let total = 0;

        for (let i = 0; i < modules[moduleName].length; i++) {
            const assessment = modules[moduleName][i];
            const gradeKey = moduleName + "_" + assessment.assessmentName;

            const mark = Number(savedGrades[gradeKey]) || 0;
            const weight = Number(assessment.weighting) || 0;

            total += mark * weight;
        }

        moduleNames.push(moduleName);
        moduleAverages.push(Number(total.toFixed(1)));
    }

    if (window.lineChartInstance) {
        window.lineChartInstance.destroy();
    }

    window.lineChartInstance = new Chart(canvas, {
        type: "line",
        data: {
            labels: moduleNames,
            datasets: [{
                label: "Module Average",
                data: moduleAverages,
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}