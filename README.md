# QuickDesk

QuickDesk is a simple, easy-to-use help desk solution designed to streamline communication between users and support teams. The system allows users to raise support tickets and enables support staff to efficiently manage and resolve them. Our goal is to provide a straightforward and effective ticketing system without unnecessary complexity.

# Team Members
  Rajan Pulse
  Pruthviraj Pasee

---

## Features

### For All Users
* **User Authentication**: Secure registration and login for all users.
* **Email Notifications**: Stay informed with email notifications for ticket creation and status changes.
* **Search and Filtering**: Easily find tickets with options to filter by status, category, and more.
* **Ticket Upvoting/Downvoting**: Users can upvote or downvote questions to prioritize them.

### For End Users (Employees/Customers)
* **Ticket Creation**: Create support tickets with a subject, description, category, and optional attachments.
* **Ticket Tracking**: View and track the status of all your submitted tickets.
* **Ticket Management**: Add comments and reply to your own tickets as they are being processed.
* **User Profile**: Manage your profile, settings, and notification preferences.

### For Support Agents
* **Agent Dashboard**: Manage tickets from a central dashboard with queues for "My Tickets" and "All Tickets."
* **Ticket Actions**: Update ticket statuses, add comments, and respond to user queries.
* **Ticket Workflow**: A clear ticket status flow: **Open** → **In Progress** → **Resolved** → **Closed**.

### For Admins
* **User Management**: Manage user roles and permissions within the system.
* **Category Management**: Create and manage different ticket categories to organize support requests effectively.

---

## User Flow

1.  A user registers or logs in to their account.
2.  They create a new ticket, providing details like a subject, description, and category.
3.  The ticket is automatically set to the "Open" status.
4.  A support agent picks up the ticket, updates its status, and begins working on it.
5.  Users receive email updates and can reply to the ticket if needed.
6.  Once the issue is resolved, the agent closes the ticket.

---

## Project Structure

### End User Screens
* **Dashboard**: A central hub with filtering, searching, sorting, and pagination for easy ticket management.
* **Ticket Creation**: A form with validation for creating new tickets, including an attachment option and category selector.
* **Ticket Detail**: A detailed view of a ticket, featuring a threaded conversation timeline.
* **Profile**: A section for managing user settings and notification preferences.

### Support Agent Screens
* **Agent Dashboard**: A specialized dashboard with multiple ticket queues to efficiently manage assigned and unassigned tickets.
* **Ticket Actions**: A dedicated interface for replying, sharing, and updating tickets.
* **Ticket Creation**: Agents can also create tickets on behalf of users.

### Admin Screens
* **User Management**: Tools to manage users, roles, and permissions.
* **Category Management**: A dedicated section for creating, editing, and deleting ticket categories.
