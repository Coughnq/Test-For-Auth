// Assuming Supabase has been added globally via a script tag
const SUPABASE_URL = 'https://mtuoykwyjtxyusfdznta.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dW95a3d5anR4eXVzZmR6bnRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUyMzkzNTMsImV4cCI6MjA0MDgxNTM1M30.cPbXqCznx21mqWPAtRE1uyl5eFPKD5CvtvrhCJQ1B2g';

// Initialize Supabase client using the global supabase object
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && window.location.pathname !== '/index.html') {
        window.location.href = '/index.html';
    } else if (session && window.location.pathname === '/index.html') {
        window.location.href = '/app';
    }
    return session?.user;
}

function startTokenValidationInterval() {
    setInterval(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '/index.html';
        }
    }, 60000); // Check every minute
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Document loaded');
    if (window.location.pathname === '/index.html') {
        const loginForm = document.getElementById('login-form');
        const errorMessage = document.getElementById('error-message');

        console.log('Login form:', loginForm);

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submission intercepted');

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                console.log('Login successful, redirecting...');
                window.location.href = '/app';
            } catch (error) {
                console.error('Login error:', error);
                errorMessage.textContent = error.message;
            }
        });
    } else if (window.location.pathname === '/app.html') {
        const userEmail = document.getElementById('user-email');
        const logoutButton = document.getElementById('logout-button');

        const user = await checkAuth();
        if (user) {
            userEmail.textContent = `Logged in as: ${user.email}`;
        }

        logoutButton.addEventListener('click', async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Logout error:', error);
            } else {
                window.location.href = '/index.html';
            }
        });

        startTokenValidationInterval();
    }
});

// When redirecting to /app, include the token
const { data: { session } } = await supabase.auth.getSession();
if (session) {
    fetch('/app', {
        headers: {
            'Authorization': `Bearer ${session.access_token}`
        }
    })
    .then(response => response.text())
    .then(html => {
        document.open();
        document.write(html);
        document.close();
    })
    .catch(error => {
        console.error('Error fetching app:', error);
        window.location.href = '/index.html';
    });
} else {
    window.location.href = '/index.html';
}
