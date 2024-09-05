const SUPABASE_URL = 'https://mtuoykwyjtxyusfdznta.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dW95a3d5anR4eXVzZmR6bnRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUyMzkzNTMsImV4cCI6MjA0MDgxNTM1M30.cPbXqCznx21mqWPAtRE1uyl5eFPKD5CvtvrhCJQ1B2g';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const isLoginPage = window.location.pathname === '/index.html' || window.location.pathname === '/';
    const isAppPage = window.location.pathname === '/app' || window.location.pathname === '/app.html';

    const { data: { session } } = await supabaseClient.auth.getSession();

    if (isLoginPage) {
        handleLoginPage(session);
    } else if (isAppPage) {
        handleAppPage(session);
    }
});

async function handleLoginPage(session) {
    if (session) {
        // If already logged in, redirect to app page
        window.location.href = '/app';
    } else {
        // Setup login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
                
                if (error) {
                    alert('Error logging in: ' + error.message);
                } else {
                    window.location.href = '/app';
                }
            });
        }
    }
}

async function handleAppPage(session) {
    if (!session) {
        // If not logged in, redirect to login page
        window.location.href = '/index.html';
    } else {
        // Display user email
        const userEmailElement = document.getElementById('user-email');
        if (userEmailElement) {
            userEmailElement.textContent = session.user.email;
        }

        // Setup logout button
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', async () => {
                const { error } = await supabaseClient.auth.signOut();
                if (error) {
                    alert('Error logging out: ' + error.message);
                } else {
                    window.location.href = '/index.html';
                }
            });
        }
    }
}
