# Authentication

Syllora uses Firebase Authentication directly from the web client.

Supported flows:

- Email/password sign up
- Email/password sign in
- Google sign in
- Password reset email
- Firebase-persisted sessions
- Sign out
- Account nickname/email update

The authenticated Firebase UID is the owner key for Firestore and Storage Security Rules.
