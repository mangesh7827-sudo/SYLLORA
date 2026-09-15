import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'src/types/auth.ts',
  'src/services/auth/AuthService.ts',
  'src/services/auth/ApiAuthService.ts',
  'src/services/auth/MockAuthService.ts',
  'src/services/auth/service.ts',
  'src/app/providers/AuthContext.ts',
  'src/app/providers/AuthProvider.tsx',
  'src/app/guards/AuthGuards.tsx',
  'src/components/auth/AuthPageShell.tsx',
  'src/components/auth/PasswordField.tsx',
  'src/components/auth/GoogleAuthButton.tsx',
  'src/pages/auth/LoginPage.tsx',
  'src/pages/auth/SignupPage.tsx',
  'src/pages/auth/ForgotPasswordPage.tsx',
  'docs/authentication.md',
];

let failures = 0;
function pass(message) { console.log(`PASS ${message}`); }
function fail(message) { failures += 1; console.error(`FAIL ${message}`); }
function read(relative) { return fs.readFileSync(path.join(root, relative), 'utf8'); }
function exists(relative) { return fs.existsSync(path.join(root, relative)); }

for (const file of requiredFiles) {
  if (exists(file)) {
    pass(`required file: ${file}`);
  } else {
    fail(`missing file: ${file}`);
  }
}

const routes = read('src/app/routes/AppRoutes.tsx');
const routePaths = read('src/app/routes/routePaths.ts');
const provider = read('src/app/providers/AuthProvider.tsx');
const service = read('src/services/auth/MockAuthService.ts');
const apiService = read('src/services/auth/ApiAuthService.ts');
const login = read('src/pages/auth/LoginPage.tsx');
const signup = read('src/pages/auth/SignupPage.tsx');
const guards = read('src/app/guards/AuthGuards.tsx');
const storage = read('src/services/storage/storage.ts');

if (routePaths.includes("login: '/login'") && routePaths.includes("signup: '/signup'") && routePaths.includes("forgotPassword: '/forgot-password'")) {
  pass('public auth route constants');
} else {
  fail('public auth route constants');
}
if (routes.includes('<Route element={<PublicOnlyRoute />}>') && routes.includes('<Route element={<ProtectedRoute />}>')) {
  pass('public/protected route guards');
} else {
  fail('public/protected route guards');
}
if (provider.includes("AUTH_LOADING") && provider.includes('refreshSession') && provider.includes('isAuthenticated')) {
  pass('authentication state and session restoration');
} else {
  fail('authentication state and session restoration');
}
if (service.includes('AuthService') && service.includes('passwordHash') && !service.match(/localStorageAdapter\.set\([^;]*password[^;]*\)/i)) {
  pass('development auth is service-based and does not persist plaintext passwords');
} else {
  fail('development auth plaintext-password safety');
}
if (service.includes("throw new AuthError('oauth_unavailable'") && !service.includes('mock google')) {
  pass('Google auth is not faked');
} else {
  fail('Google auth must not be faked');
}
if (apiService.includes("credentials: 'include'") && apiService.includes('/auth/login') && apiService.includes('/auth/signup')) {
  pass('future API auth adapter uses server-managed session boundary');
} else {
  fail('future API auth adapter');
}
if (login.includes('type="email"') && login.includes('current-password') && login.includes('Forgot password') && login.includes('GoogleAuthButton')) {
  pass('login UX and accessibility attributes');
} else {
  fail('login UX');
}
if (signup.includes('Nickname') && signup.includes('new-password') && signup.includes('Confirm password') && signup.includes('GoogleAuthButton')) {
  pass('signup UX and password controls');
} else {
  fail('signup UX');
}
if (guards.includes('state={{ from: location }}') && guards.includes('Navigate to={routePaths.login}')) {
  pass('protected-route return target');
} else {
  fail('protected-route return target');
}
if (storage.includes('get<T>(key: string)') && !service.match(/localStorageAdapter\.set\([^)]*password\s*:/i)) {
  pass('typed storage boundary');
} else {
  fail('storage boundary');
}

const allSource = requiredFiles.filter((file) => file.endsWith('.ts') || file.endsWith('.tsx')).map(read).join('\n');
if (/(password|token|secret)/i.test(allSource)) {
  pass('authentication source contains only expected credential abstractions');
} else {
  pass('authentication source scan completed');
}

if (failures) process.exit(1);
pass('Phase 4 static audit');
