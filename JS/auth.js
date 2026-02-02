/**
 * Film Fusion - Authentication
 */

const RULES = {
  email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: 'Enter a valid email' },
  password: { pattern: /^.{6,}$/, msg: 'At least 6 characters' },
  firstName: { pattern: /^[a-zA-Z\s]{2,}$/, msg: 'Enter a valid name' },
  lastName: { pattern: /^[a-zA-Z\s]{2,}$/, msg: 'Enter a valid name' },
  confirmPassword: { msg: 'Passwords do not match' }
};

function initAuth(type) {
  const form = document.getElementById(`${type}Form`);
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    type === 'signin' ? handleSignIn(form) : handleSignUp(form);
  });

  form.querySelectorAll('input').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => clearFieldError(input));
  });
}

function validateField(input) {
  const { name, value } = input;
  const rule = RULES[name];
  const errorEl = document.getElementById(`${name}Error`);

  clearFieldError(input);

  if (!value.trim()) {
    showFieldError(input, errorEl, 'This field is required');
    return false;
  }

  if (name === 'confirmPassword') {
    const pw = document.getElementById('password');
    if (pw && value !== pw.value) {
      showFieldError(input, errorEl, rule.msg);
      return false;
    }
  } else if (rule?.pattern && !rule.pattern.test(value)) {
    showFieldError(input, errorEl, rule.msg);
    return false;
  }

  return true;
}

function showFieldError(input, errorEl, msg) {
  input.classList.add('error');
  if (errorEl) {
    errorEl.textContent = msg;
    errorEl.classList.add('show');
  }
}

function clearFieldError(input) {
  input.classList.remove('error');
  const errorEl = document.getElementById(`${input.name}Error`);
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('show');
  }
}

function handleSignIn(form) {
  const email = form.querySelector('#email');
  const password = form.querySelector('#password');

  if (!validateField(email) | !validateField(password)) return;

  const users = getUsers();
  const user = users.find(u => u.email === email.value);

  if (!user || user.password !== password.value) {
    showFieldError(password, document.getElementById('passwordError'), 'Invalid email or password');
    return;
  }

  sessionStorage.setItem(STORAGE.USER, JSON.stringify({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  }));

  showSuccess('Welcome back! Redirecting...');
  setTimeout(() => window.location.href = getHomePath(), 1000);
}

function handleSignUp(form) {
  const fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
  let valid = true;

  fields.forEach(name => {
    const input = form.querySelector(`#${name}`);
    if (!validateField(input)) valid = false;
  });

  if (!valid) return;

  const users = getUsers();
  const email = form.querySelector('#email').value;

  if (users.some(u => u.email === email)) {
    showFieldError(form.querySelector('#email'), document.getElementById('emailError'), 'Email already registered');
    return;
  }

  users.push({
    firstName: form.querySelector('#firstName').value.trim(),
    lastName: form.querySelector('#lastName').value.trim(),
    email: email,
    password: form.querySelector('#password').value
  });

  saveUsers(users);
  showSuccess('Account created! Redirecting...');
  setTimeout(() => window.location.href = 'Sign-in.html', 1500);
}

function showSuccess(msg) {
  const el = document.getElementById('successMsg');
  if (el) {
    el.textContent = msg;
    el.classList.add('show');
  }
}
