# Requirements Document

## Introduction

The To-Do List is a widget within the Life Dashboard web application that lets users capture, track, and manage personal tasks. It is implemented entirely in client-side Vanilla JavaScript with no backend — tasks are stored in the browser's `localStorage` under the key `dashboard_todos` and persist across page refreshes. The widget is part of a single-page dashboard alongside a Greeting, Focus Timer, and Quick Links section.

## Glossary

- **Dashboard**: The Life Dashboard single-page web application.
- **Todo_List**: The To-Do List widget rendered inside a card on the Dashboard.
- **Task**: A user-created item consisting of a `text` string (up to 120 characters) and a boolean `done` flag, stored as a JSON object.
- **Task_Input**: The text input field (`#todo-input`) where the user types a new task description.
- **Add_Button**: The "Add" button (`#todo-add`) that triggers task creation.
- **Checkbox**: The checkbox rendered beside each Task that toggles its completion state.
- **Edit_Button**: The ✏️ button rendered beside each Task that activates inline editing.
- **Delete_Button**: The 🗑 button rendered beside each Task that permanently removes it.
- **Edit_Input**: The inline text input that replaces the task text span during editing.
- **Warning_Message**: The `#todo-warning` element that displays duplicate-task feedback.
- **LocalStorage**: The browser Web Storage API used to persist tasks under the key `dashboard_todos`.
- **Empty_State**: The placeholder message shown when the task list contains no items.
- **Done_State**: A Task whose `done` property is `true`, rendered with strikethrough styling.

---

## Requirements

### Requirement 1: Add a New Task

**User Story:** As a user, I want to type a task description and add it to my list, so that I can keep track of things I need to do.

#### Acceptance Criteria

1. WHEN a user types a non-empty description into the Task_Input and clicks the Add_Button, THE Todo_List SHALL append a new Task displaying the trimmed description to the list.
2. WHEN a user types a non-empty description into the Task_Input and presses the Enter key, THE Todo_List SHALL append a new Task displaying the trimmed description to the list.
3. IF the Task_Input contains only whitespace characters when an add is attempted, THEN THE Todo_List SHALL ignore the action and leave the list unchanged.
4. WHEN a new Task is successfully added, THE Todo_List SHALL clear the Task_Input field.
5. THE Task_Input SHALL accept a maximum of 120 characters.
6. WHEN a new Task is successfully added, THE Todo_List SHALL return focus to the Task_Input.

### Requirement 2: Persist Tasks Across Sessions

**User Story:** As a user, I want my tasks to survive page refreshes, so that I do not lose my list when I close or reload the browser tab.

#### Acceptance Criteria

1. WHEN a Task is added, toggled, edited, or deleted, THE Todo_List SHALL synchronously write the updated task array to LocalStorage under the key `dashboard_todos` as a JSON-serialised array of `{ text, done }` objects.
2. WHEN the Dashboard loads or refreshes, THE Todo_List SHALL read the task array from LocalStorage and render all previously saved Tasks; IF the key `dashboard_todos` is absent, THE Todo_List SHALL treat it as an empty array and render no tasks.
3. IF LocalStorage contains a value under `dashboard_todos` that is either non-parsable JSON or a parsable but non-array value (including `null`, `{}`, or numbers), THEN THE Todo_List SHALL treat the stored value as an empty array and render no tasks.

### Requirement 3: Display the Task List

**User Story:** As a user, I want to see all my tasks in a list, so that I have a clear view of what I need to do.

#### Acceptance Criteria

1. THE Todo_List SHALL render each Task as a list item containing a Checkbox, the task text, an Edit_Button, and a Delete_Button; Done_State tasks MUST be rendered with a checked Checkbox and strikethrough styling on the task text.
2. WHILE the task array is empty, THE Todo_List SHALL display the Empty_State message "No tasks yet — add one above!" in place of the list items.
3. IF tasks are present, THEN THE Todo_List SHALL not display the Empty_State message.
4. THE Todo_List SHALL escape HTML special characters in task text before inserting it into the DOM to prevent cross-site scripting.

### Requirement 4: Mark a Task as Done

**User Story:** As a user, I want to check off completed tasks, so that I can track my progress.

#### Acceptance Criteria

1. WHEN a user clicks the Checkbox of a Task whose `done` flag is `false`, THE Todo_List SHALL set that Task's `done` flag to `true`, update the Checkbox's `checked` attribute to reflect the new state, apply strikethrough styling to its text, and persist the change to LocalStorage.
2. WHEN a user clicks the Checkbox of a Task whose `done` flag is `true`, THE Todo_List SHALL set that Task's `done` flag to `false`, update the Checkbox's `checked` attribute to reflect the new state, remove strikethrough styling from its text, and persist the change to LocalStorage.
3. WHEN the Todo_List renders a Task, THE Checkbox SHALL have its `checked` attribute set to match the Task's `done` flag.

### Requirement 5: Inline Edit a Task

**User Story:** As a user, I want to correct or update a task's text without deleting and re-creating it, so that I can keep my list accurate with minimal effort.

#### Acceptance Criteria

1. WHEN a user clicks the Edit_Button of a Task, THE Todo_List SHALL replace that Task's text span with an Edit_Input pre-populated with the current task text and give it focus.
2. WHEN the Edit_Input is focused and the user presses Enter, THE Todo_List SHALL save the trimmed Edit_Input value as the new task text, persist the change to LocalStorage, and restore the normal list view.
3. WHEN the Edit_Input loses focus (blur event) and the blur was not caused by the user pressing Escape, THE Todo_List SHALL save the trimmed Edit_Input value as the new task text, persist the change to LocalStorage, and restore the normal list view.
4. WHEN the Edit_Input is focused and the user presses Escape, THE Todo_List SHALL discard any changes and restore the normal list view without modifying the Task.
5. IF the user clears the Edit_Input (including input containing only whitespace) and confirms (Enter or blur), THEN THE Todo_List SHALL discard the empty value and restore the previous task text unchanged.
6. THE Edit_Input SHALL accept a maximum of 120 characters.
7. IF a user clicks the Edit_Button of a Task while another Task is already being edited, THEN THE Todo_List SHALL save and close the in-progress edit before opening the new one.

### Requirement 6: Delete a Task

**User Story:** As a user, I want to remove tasks I no longer need, so that my list stays relevant and uncluttered.

#### Acceptance Criteria

1. WHEN a user clicks the Delete_Button of a Task, THE Todo_List SHALL remove that Task from the list, persist the updated array to LocalStorage, and re-render the list.
2. WHEN the last Task is deleted, THE Todo_List SHALL display the Empty_State message.

### Requirement 7: Prevent Duplicate Tasks

**User Story:** As a user, I want to be warned when I try to add a task that already exists, so that I do not accidentally clutter my list with duplicates.

#### Acceptance Criteria

1. IF a user attempts to add a Task whose trimmed text matches any existing Task (case-insensitive), THEN THE Todo_List SHALL reject the addition and leave the list unchanged.
2. IF a duplicate is rejected, THEN THE Todo_List SHALL keep the duplicate text in the Task_Input so the user can modify it.
3. IF a duplicate is detected, THEN THE Todo_List SHALL display a Warning_Message of the form `⚠️ "<text>" is already in your list.` in the Warning_Message element.
4. WHEN a Warning_Message is displayed, THE Todo_List SHALL automatically clear the Warning_Message after 3 seconds; each new duplicate attempt SHALL reset the 3-second auto-clear timer.
5. WHEN a new Task is successfully added, THE Todo_List SHALL clear any previously displayed Warning_Message immediately.
