# 🚀 Quick Start Guide - Kanban Board

Get your Kanban Board up and running in 30 seconds!

## ⚡ Fastest Way to Start

### Option 1: Direct Browser Open (Works Immediately)
1. Navigate to the folder containing `index.html`
2. Double-click `index.html`
3. ✅ Kanban Board opens in your default browser
4. Start adding tasks!

### Option 2: With Local HTTP Server (Recommended)

**On Windows (PowerShell):**
```powershell
cd "c:\Users\abhis\OneDrive\Desktop\Hysteresis-25-Asss\Kanban Board"
python -m http.server 8000
# Then open: http://localhost:8000
```

**On Mac/Linux (Terminal):**
```bash
cd ~/Desktop/Hysteresis-25-Asss/Kanban\ Board
python3 -m http.server 8000
# Then open: http://localhost:8000
```

---

## 📝 First Time Usage

### 1️⃣ Add Your First Task
- Click **"+ Add Task"** button (top right)
- Type a task title (required)
- Add description (optional)
- Click **"Save Task"**
- ✨ Your task appears in "To Do" column

### 2️⃣ Start Work
- Drag your task from "To Do" to "In Progress"
- Drop it in the "In Progress" column
- ✅ Status saves automatically

### 3️⃣ Complete Task
- Drag task to "Done" column
- 🎉 Task marked as complete

### 4️⃣ Edit or Delete
- **Edit**: Click ✏️ Edit button
- **Delete**: Click 🗑️ button and confirm

---

## 📂 What You Get

```
Kanban Board/
├── index.html          👈 Open this first
├── style.css           
├── script.js           
├── README.md           (Full documentation)
└── QUICKSTART.md       (This file)
```

**That's it!** Just 3 files for a complete task manager.

---

## ✅ Checklist

- [ ] All 3 files in same folder (index.html, style.css, script.js)
- [ ] Opened in a web browser
- [ ] Added first task
- [ ] Dragged task to another column
- [ ] Refreshed page (tasks still there!)
- [ ] Deleted a task
- [ ] Checked Local Storage in DevTools

---

## 🎯 Common Actions

| Action | How To |
|--------|--------|
| **Add Task** | Click "+ Add Task" button |
| **Move Task** | Drag & drop to column |
| **Edit Task** | Click ✏️ Edit button |
| **Delete Task** | Click 🗑️, then confirm |
| **View Details** | Hover over task card |
| **Check History** | See creation date on card |

---

## 💾 Data Persistence

✅ **Tasks automatically save** when you:
- Create a new task
- Move task between columns  
- Edit task details
- Delete a task

✅ **Refresh browser** - Tasks are still there!

⚠️ **Clearing browser cache/cookies** will delete all tasks
   → Backup important tasks by exporting

---

## 🔍 Check Local Storage (Optional)

1. Open DevTools: **F12** or **Ctrl+Shift+I**
2. Go to **Application** tab
3. Click **Local Storage** (left sidebar)
4. Find **localhost:8000** (or your domain)
5. Look for key: **kanbanTasks**
6. See your JSON data!

---

## 🎨 Customization

### Change Colors

Edit `style.css` line 10:
```css
--primary-color: #6366f1;      /* Change to your color */
```

### Change Column Names

Edit `index.html`:
```html
<h2 class="column-title">Your Custom Name</h2>
```

### More Customizations

See `README.md` for detailed guide

---

## 🐛 Troubleshooting

**Styles look wrong?**
- Make sure `style.css` is in same folder
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

**Can't drag tasks?**
- Use Firefox or Chrome for best compatibility
- Ensure serving over HTTP (python -m http.server)

**Tasks not saving?**
- Check browser allows Local Storage
- Not in private/incognito mode?
- Disk space available on computer?

**Still having issues?**
- Open DevTools (F12) → Console tab
- Look for red error messages
- Check folder has all 3 files

---

## 📚 Learn More

Want to understand the code? Check `README.md` for:
- Detailed feature list
- Code examples
- How Local Storage works
- Browser compatibility
- Learning resources

---

## 🎓 Perfect For Learning

This project demonstrates:
- ✅ HTML structure & forms
- ✅ CSS layouts & responsiveness  
- ✅ JavaScript classes & events
- ✅ Drag & drop APIs
- ✅ Local Storage persistence
- ✅ DOM manipulation

No frameworks, no libraries - **pure web fundamentals!**

---

## 🚀 Next Steps

1. **Start using it**: Add all your tasks
2. **Organize your work**: Drag tasks between columns
3. **Explore the code**: Read comments in `script.js`
4. **Customize**: Modify colors, style, or features
5. **Learn**: Study how Local Storage and drag-drop work
6. **Build on it**: Add your own features!

---

**Any questions?** Check `README.md` for comprehensive documentation!

Happy task managing! 📋✨
