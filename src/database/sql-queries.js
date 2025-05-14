export const queries = {
    // Projects
    create_project: "INSERT INTO projects (title, description, status, start_date, end_date, priority, created) VALUES (?, ?, ?, ?, ?, ?, ?)",
    list_projects:  "SELECT * FROM projects",
    update_project: "UPDATE projects SET title = ?, description = ?, status = ?, start_date = ?, end_date = ?, priority = ? WHERE id = ?",
    delete_project: "DELETE FROM projects WHERE id = ?",

    // Tasks
    create_task: "INSERT INTO tasks (description, due_date, created) VALUES (?, ?, ?)",
    list_tasks: "SELECT * FROM tasks ORDER BY done ASC, due_date ASC",
    update_task: "UPDATE tasks SET description = ?, due_date = ?, done = ? WHERE id = ?",
    delete_task: "DELETE FROM tasks WHERE id = ?",

    // Events
    create_event: "INSERT INTO events (title, description, date, color, created) VALUES (?, ?, ?, ?, ?)",
    list_events: "SELECT * FROM events",
    update_event: "UPDATE events SET title = ?, description = ?, date = ?, color = ? WHERE id = ?",
    delete_event: "DELETE FROM events WHERE id = ?",

    // Notes
    create_note: "INSERT INTO notes (title, text, created) VALUES (?, ?, ?)",
    list_notes: "SELECT * FROM notes",
    update_note: "UPDATE notes SET title = ?, text = ? WHERE id = ?",
    delete_note: "DELETE FROM notes WHERE id = ?",

    // Resources
    create_resource: "INSERT INTO resources (title, description, url, created) VALUES (?, ?, ?, ?)",
    list_resources: "SELECT * FROM resources",
    update_resource: "UPDATE resources SET title = ?, description = ?, url = ? WHERE id = ?",
    delete_resource: "DELETE FROM resources WHERE id = ?",

    // Transactions
    create_transaction: "INSERT INTO transactions (description, amount, date, created) VALUES (?, ?, ?, ?)",
    list_transactions: "SELECT * FROM transactions",
    get_transaction: "SELECT * FROM transactions WHERE id = ?",
    update_transaction: "UPDATE transactions SET description = ?, amount = ?, date = ? WHERE id = ?",
    delete_transaction: "DELETE FROM transactions WHERE id = ?",

    // Goals
    create_goal: "INSERT INTO goals (title, description, target_date, created) VALUES (?, ?, ?, ?)",
    list_goals: "SELECT * FROM goals",
    update_goal: "UPDATE goals SET title = ?, description = ?, target_date = ? WHERE id = ?",
    delete_goal: "DELETE FROM goals WHERE id = ?"
};