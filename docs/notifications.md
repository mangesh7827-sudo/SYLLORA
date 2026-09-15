# Notifications

Syllora stores notification records and notification preferences in Firestore.

Preferences:

- Lecture reminders
- Assignment reminders
- Experiment reminders
- Attendance alerts
- Study reminders
- Habit reminders

The current client supports reading and marking notification records as read. Scheduled push notifications are intentionally separated from the client and can be added with Firebase Cloud Functions + Firebase Cloud Messaging.
