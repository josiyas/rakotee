document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const signinForm = document.getElementById('signin-form');

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('register-name').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;

      if (!name || !email || !password) {
        alert('Please fill out all fields.');
        return;
      }

      localStorage.setItem('user', JSON.stringify({ name, email, password }));
      alert('🎉 Registration successful! Redirecting to sign-in...');
      setTimeout(() => {
        window.location.href = 'signin.html';
      }, 1000);
    });
  }

  if (signinForm) {
    signinForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('signin-email').value.trim();
      const password = document.getElementById('signin-password').value;
      const stored = JSON.parse(localStorage.getItem('user'));

      if (stored && stored.email === email && stored.password === password) {
        alert(`✅ Welcome back, ${stored.name}! Redirecting...`);
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        alert('❌ Invalid email or password. Please try again.');
      }
    });
  }
});
