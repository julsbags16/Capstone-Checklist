const SUPABASE_URL = 'https://uypjfxlkcqukczskdwmt.supabase.co';
const SUPABASE_KEY = 'process.env.SUPABASE_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- AUTH LOGIC ---
async function handleSignup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Check your email for confirmation!");
}

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else checkUser();
}

async function handleLogout() {
    await supabase.auth.signOut();
    location.reload();
}

// --- DATABASE LOGIC ---
async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('appMain').style.display = 'flex';
        fetchTasks();
    }
}

async function fetchTasks() {
    const { data: tasks, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (tasks) {
        document.getElementById('taskList').innerHTML = '';
        tasks.forEach(renderTask);
    }
}

async function addTask() {
    const input = document.getElementById('taskInput');
    const priority = document.getElementById('priorityInput').value;
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('tasks').insert([
        { text: input.value, priority: priority, user_id: user.id }
    ]);
    
    input.value = '';
    fetchTasks();
}

async function toggleTask(id, currentStatus) {
    await supabase.from('tasks').update({ completed: !currentStatus }).eq('id', id);
    fetchTasks();
}

async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id);
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

// Initialize

checkUser();
