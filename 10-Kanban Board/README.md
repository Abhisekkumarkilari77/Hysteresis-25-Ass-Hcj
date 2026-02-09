# 📋 Kanban Board - Task Management Application

A professional, fully-functional Kanban-style task management web application built with **pure HTML, CSS, and Vanilla JavaScript**. No frameworks, no external libraries, no backend required. Everything is stored locally using Browser Local Storage.

---

## ✨ Features

### Core Functionality
- **Three-Column Kanban Board**: To Do, In Progress, Done
- **Task Management**: Create, read, update, and delete tasks (full CRUD)
- **Drag & Drop**: Seamlessly move tasks between columns
- **Local Storage**: All tasks persist automatically across browser sessions
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

### Task Operations
- **Add Tasks**: Quick task creation with title and optional description
- **Edit Tasks**: Update task details anytime
- **Delete Tasks**: Remove tasks with confirmation dialog
- **Task Information**: 
  - Task title
  - Description (optional)
  - Creation date and time
  - Current status (column)

### User Interface
- **Clean Design**: Professional, calm, productivity-focused aesthetic
- **Task Counters**: Real-time count of tasks in each column
- **Visual Feedback**: 
  - Hover effects on cards
  - Drag indicators
  - Toast notifications for actions
  - Smooth animations
- **Responsive Layout**: 
  - 3-column grid on desktop
  - Single column on mobile
  - Optimized for all screen sizes

### Technical Highlights
- **Browser Local Storage**: 100% frontend persistence
- **No Dependencies**: Pure vanilla JavaScript
- **Well-Commented Code**: Easy to understand and modify
- **Validation**: Required field checks and error messages
- **XSS Protection**: HTML escaping for secure content rendering

---

## 🚀 How to Use

### Starting the Application

1. **Quick Start**: Open `index.html` in any modern web browser
2. **With HTTP Server** (recommended for full functionality):
   ```bash
   cd "path/to/Kanban Board"
   python -m http.server 8000
   ```
   Then visit: `http://localhost:8000`

### Creating Tasks

1. Click the **"+ Add Task"** button in the header
2. Enter a task title (required)
3. Optionally add a description
4. Click **"Save Task"**
5. Task instantly appears in the "To Do" column

### Managing Tasks

**Edit a Task:**
- Click the **✏️ Edit** button on any task card
- Modify the title or description
- Click **"Save Task"**

**Delete a Task:**
- Click the **🗑️** button on any task card
- Confirm deletion in the popup dialog

### Organizing Work

**Move Tasks Between Columns:**
1. Click and drag any task card
2. Drag it to a different column
3. Drop it in the target column
4. Task status updates automatically
5. Changes are saved to Local Storage immediately

### Viewing Task Details

Each task card displays:
- Task title
- Description (truncated to 2 lines)
- Creation date and time (📅 format)

---

## 📁 Project Structure

```
Kanban Board/
├── index.html          # Main HTML structure
├── style.css           # All styling and responsive design
├── script.js           # JavaScript logic and state management
└── README.md           # This documentation
```

### File Descriptions

**index.html**
- Semantic HTML5 structure
- Three columns (To Do, In Progress, Done)
- Task form modal for add/edit
- Delete confirmation modal
- Toast notification system

**style.css**
- Soft, professional color palette (grays, blues)
- Responsive grid layout
- Smooth animations and transitions
- Mobile-first approach
- Accessible focus states

**script.js**
- `KanbanBoard` class for state management
- Local Storage integration
- Drag & drop event handling
- DOM manipulation and rendering
- Modal and form management
- Validation and error handling

---

## 💾 Local Storage Structure

Tasks are stored in Local Storage under the key `kanbanTasks` as a JSON array:

```javascript
[
  {
    "id": "task_1707507890234_abc123def",
    "title": "Complete project documentation",
    "description": "Write comprehensive README and code comments",
    "status": "inprogress",
    "createdAt": "2026-02-09T14:31:30.234Z"
  },
  {
    "id": "task_1707507945876_xyz789uvw",
    "title": "Review pull requests",
    "description": "",
    "status": "todo",
    "createdAt": "2026-02-09T14:32:25.876Z"
  }
]
```

Each task object includes:
- **id**: Unique identifier (timestamp + random string)
- **title**: Task name (required)
- **description**: Additional details (optional)
- **status**: `todo`, `inprogress`, or `done`
- **createdAt**: ISO timestamp of creation

---

## 🎨 Design Details

### Color Palette
- **Primary**: Indigo (#6366f1) - Action buttons, highlights
- **Background**: Light Gray (#f9fafb) - Page background
- **Cards**: White (#ffffff) - Task cards, containers
- **Text**: Dark Gray (#1f2937) - Primary text
- **Neutral**: Medium Gray (#9ca3af) - Secondary text
- **Danger**: Red (#ef4444) - Delete actions
- **Success**: Green (#10b981) - Confirmations

### Typography
- **Font Family**: System fonts (Segoe UI, Roboto, Helvetica)
- **Headers**: Bold, larger sizes
- **Body Text**: Regular weight, clear contrast
- **Task Cards**: Consistent spacing and hierarchy

### Layout
- **Desktop**: 3-column grid (350px+ per column)
- **Tablet**: Responsive grid (1-2 columns)
- **Mobile**: Single column stacked layout
- **Max Width**: 1400px for optimal viewing

---

## ⌨️ Keyboard & Accessibility

- **Tab Navigation**: Full keyboard navigation support
- **Enter Key**: Submit forms and confirm actions
- **Escape Key**: Close modals (standard browsers)
- **Focus States**: Clear visual indicators on interactive elements
- **ARIA Labels**: Semantic HTML for screen readers
- **High Contrast**: Text meets WCAG AA standards

---

## 🔧 Browser Compatibility

Works on all modern browsers that support:
- ES6 JavaScript (arrow functions, template literals, classes)
- CSS Grid and Flexbox
- Local Storage API
- Drag & Drop API

**Tested on:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📝 Code Examples

### Adding a Task Programmatically

```javascript
// Access the global kanbanBoard instance
kanbanBoard.addTask('Buy groceries', 'Milk, eggs, bread');
```

### Viewing Today's Tasks

```javascript
// Get all tasks
const allTasks = kanbanBoard.tasks;

// Get tasks by status
const todoTasks = kanbanBoard.getTasksByStatus('todo');
const doneTasks = kanbanBoard.getTasksByStatus('done');

// Console log for debugging
console.log('Total tasks:', allTasks.length);
console.log('To Do:', todoTasks.length);
```

### Clearing All Tasks (⚠️ Use with care)

```javascript
// Clear all tasks from storage
kanbanBoard.tasks = [];
kanbanBoard.saveToLocalStorage();
kanbanBoard.render();
```

---

## 🛠️ Customization Guide

### Changing Colors

Edit the CSS variables in `style.css`:

```css
:root {
    --primary-color: #6366f1;      /* Change button color */
    --text-primary: #1f2937;       /* Change text color */
    --danger-color: #ef4444;       /* Change delete button color */
    /* ... more variables ... */
}
```

### Adding More Columns

1. Add a new column div in `index.html`
2. Add new status value (e.g., "blocked")
3. Update column rendering logic in `script.js`

### Modifying Column Names

Edit the column titles in `index.html`:

```html
<h2 class="column-title">Your Custom Title</h2>
```

### Adjusting Spacing

Modify CSS variables for spacing:

```css
--spacing-md: 1rem;     /* Adjust padding */
--spacing-lg: 1.5rem;   /* Adjust gaps */
```

---

## 📊 Data Management

### Exporting Tasks

```javascript
// Get JSON of all tasks
const tasksJSON = JSON.stringify(kanbanBoard.tasks);
console.log(tasksJSON);

// Copy to clipboard or save to file
```

### Importing Tasks

```javascript
// Paste JSON data
const importedTasks = JSON.parse(jsonString);
kanbanBoard.tasks = importedTasks;
kanbanBoard.saveToLocalStorage();
kanbanBoard.render();
```

### Backing Up Data

1. Open browser DevTools (F12)
2. Go to Application > Local Storage
3. Find `kanbanTasks` key
4. Copy the value and save to a text file

---

## 🐛 Troubleshooting

### Tasks Not Persisting
- Check browser Local Storage is enabled
- Try clearing cache and reloading
- Verify Local Storage quota isn't exceeded (usually 5-10MB)

### Drag & Drop Not Working
- Ensure using a modern browser
- Check console for JavaScript errors (F12)
- Verify files are served over HTTP/HTTPS for full functionality

### Modal Not Showing
- Check browser console for errors
- Verify CSS file is loaded
- Try refreshing the page

### Tasks Disappearing
- Tasks are stored in Local Storage, not cloud
- Clearing browser data/cache will delete tasks
- Regular backups recommended for important data

---

## 📚 Learning Resources

This project demonstrates:

- **HTML**: Semantic structure, form validation
- **CSS**: Grid/Flexbox layouts, responsive design, animations
- **JavaScript**: 
  - Classes and object-oriented design
  - Event listeners and DOM manipulation
  - Local Storage API
  - Drag & Drop API
  - Async handling and promises

Perfect for learning modern frontend development without frameworks!

---

## 🎯 Future Enhancement Ideas

If you want to expand this project, consider adding:

- **Task Priority**: High/Medium/Low priority labels
- **Due Dates**: Calendar picker and deadline tracking
- **Search & Filter**: Find tasks by title or status
- **Dark Mode**: Toggle between light and dark themes
- **Task Categories**: Tag-based organization
- **Recurring Tasks**: Daily/weekly task templates
- **Statistics**: Task completion metrics
- **Data Export**: Download tasks as CSV/JSON
- **Keyboard Shortcuts**: Quick task creation (Ctrl+N)
- **Multi-user**: Different workspaces or boards

---

## 📄 License & Usage

This is a free educational project. Feel free to:
- Modify and customize for your needs
- Use as a learning reference
- Share with others
- Build upon it for portfolio projects

---

## 💡 Tips & Best Practices

1. **Regular Backups**: Export your tasks periodically
2. **Keyboard Navigation**: Use Tab and Enter for efficiency
3. **Mobile Friendly**: The app works great on phones and tablets
4. **Privacy**: All data stays in your browser, never sent to servers
5. **Multiple Browsers**: Tasks won't sync across different browsers (separate Local Storage)

---

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code comments in `script.js`
3. Check browser console (F12) for error messages
4. Verify the HTML, CSS, and JavaScript files are in the same folder

---

**Version**: 1.0  
**Created**: February 2026  
**Technology**: HTML5, CSS3, Vanilla JavaScript  
**Status**: ✅ Production Ready

Enjoy your new Kanban Board task manager! 🚀
