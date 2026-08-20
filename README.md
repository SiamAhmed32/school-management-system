# ABCIS SchoolOS

An industry-style, responsive frontend prototype for ABC International School. The experience translates the supplied school-management UML into six focused portals and adds a read-only AI data companion for historical school insights.

## Demo access

The login screen has one-click access for:

- Admin
- Principal
- Teacher
- Student
- Parent
- Librarian

You can also sign in with any displayed demo email and the prefilled demo password. Use the role selector in the top-right corner to switch portals without signing out.

## Included modules

- Student registration, generated IDs, profiles, guardians and discipline review
- Attendance capture, status checks, trends and threshold alerts
- Subjects, notes, assignments and online classes
- Exam setup, student enrolment, timetables, questions and published results
- Fees, receipts, outstanding accounts, salaries, cash, cheque and net-banking queues
- Library catalogue, issues, renewals, returns, reservations, inventory and events
- School events, secure messaging and notifications
- Users, permissions, role assignment, reports and audit trail
- Campus switcher, global search, CSV exports and interactive quick actions
- ABCIS Assist with realistic 6–12 month fee, attendance, academic and library answers

## Prototype scope

This deliverable is a frontend demonstration using realistic sample data. Sign-in, AI replies and record actions are simulated in the browser; a production implementation would connect these interfaces to approved authentication, databases, payment services and an AI retrieval layer with row-level permissions and audit logging.

## Run locally

```bash
npm install
npm run dev
```

Open the local address shown by the development server. Create a production build with `npm run build`.
