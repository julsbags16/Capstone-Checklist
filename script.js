const SUPABASE_URL = 'https://uypjfxlkcqukczskdwmt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_r8TrGXZdB56xhhTjukNZ8g_bxYY2o8U';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- AUTH LOGIC ---
async function handleSignup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Notice we use _supabase (the renamed variable from the last step)
    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Sign up successful! You can now login.");
    }
}

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else checkUser();
}

async function handleLogout() {
    await _supabase.auth.signOut();
    location.reload();
}

// --- DATABASE LOGIC ---
async function checkUser() {
    const { data: { user } } = await _supabase.auth.getUser();
    if (user) {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('appMain').style.display = 'flex';
        fetchTasks();
    }
}

async function fetchTasks() {
    const { data: tasks, error } = await _supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (tasks) {
        document.getElementById('taskList').innerHTML = '';
        tasks.forEach(renderTask);
    }
}

async function addTask() {
    const input = document.getElementById('taskInput');
    const priority = document.getElementById('priorityInput').value;
    const { data: { user } } = await _supabase.auth.getUser();

    const { error } = await _supabase.from('tasks').insert([
        { text: input.value, priority: priority, user_id: user.id }
    ]);
    
    input.value = '';
    fetchTasks();
}

async function toggleTask(id, currentStatus) {
    await _supabase.from('tasks').update({ completed: !currentStatus }).eq('id', id);
    fetchTasks();
}

async function deleteTask(id) {
    await _supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
}

function renderTask(task) {
    const li = document.createElement('li');
    li.className = task.completed ? 'completed' : '';
    li.innerHTML = `
        <div onclick="toggleTask('${task.id}', ${task.completed})">
            <span class="badge ${task.priority.toLowerCase()}">${task.priority}</span>
            <span>${task.text}</span>
        </div>
        <button onclick="deleteTask('${task.id}')">✕</button>
    `;
    document.getElementById('taskList').appendChild(li);
}
// Function to render the task with a deadline countdown
function renderTask(task) {
    const li = document.createElement('li');
    li.className = task.completed ? 'completed' : '';
    
    // Calculate Days Remaining
    const today = new Date();
    const deadline = new Date(task.due_date);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Style the deadline tag
    let dateClass = diffDays < 0 ? 'overdue' : (diffDays <= 3 ? 'soon' : 'on-track');
    let dateText = diffDays < 0 ? 'Overdue' : (diffDays === 0 ? 'Due Today' : `${diffDays} days left`);

    li.innerHTML = `
        <div class="task-info" onclick="toggleTask('${task.id}', ${task.completed})">
            <div class="check-circle"></div>
            <div class="task-details">
                <span class="task-label">${task.text}</span>
                <div class="task-meta">
                    <span class="badge ${task.priority.toLowerCase()}">${task.priority}</span>
                    <span class="date-tag ${dateClass}">${dateText}</span>
                </div>
            </div>
        </div>
        <span class="delete-btn" onclick="deleteTask('${task.id}')">✕</span>
    `;
    document.getElementById('taskList').appendChild(li);
}

// Updated addTask function to include date
async function addTask() {
    const text = document.getElementById('taskInput').value;
    const date = document.getElementById('dateInput').value;
    const priority = document.getElementById('priorityInput').value;
    const { data: { user } } = await _supabase.auth.getUser();

    if (!text || !date) return alert("Please fill in task and date");

    const { error } = await _supabase.from('tasks').insert([
        { 
            text: text, 
            due_date: date, 
            priority: priority, 
            user_id: user.id 
        }
    ]);

    fetchTasks();
}

// Initialize

checkUser();





