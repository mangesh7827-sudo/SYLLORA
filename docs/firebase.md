# Firebase setup

## Services to enable

1. Authentication: Email/Password and Google.
2. Firestore Database.
3. Storage.
4. Hosting (optional for deployment).

## Environment variables

Copy `.env.example` to `.env` and add the Firebase Web App values from Project Settings.

## Firestore model

Every user's application data lives under `users/{uid}`. This makes ownership explicit and lets the rules enforce `request.auth.uid == userId` for the entire subtree.

## Security

The client never decides which user's records it may read. Firebase Authentication supplies the identity and Firestore Rules enforce ownership.

## Notifications

Notification records and preferences are stored in Firestore. Automated scheduled notifications should use Firebase Cloud Functions and FCM when that feature is enabled.
