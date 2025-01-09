// routes/tasks.js
const express = require('express');
const Task = require('../models/Task');
const router = express.Router();

// Middleware to ensure a user is authenticated
// We'll use "req.isAuthenticated()" from Passport
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
}

// -----------------------------------------
// 1. Get tasks (for the logged-in user)
// -----------------------------------------
router.get('/', ensureAuth, async (req, res) => {
  try {
    // Tasks that belong to the user or are shared
    // If you want the user to also see tasks that are shared,
    // you can do a query with $or
    const tasks = await Task.find({
      $or: [
        { userId: req.user._id },
        { isShared: true }
      ]
    });
    return res.json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------
// 2. Create a new task
// -----------------------------------------
router.post('/', ensureAuth, async (req, res) => {
  try {
    const { title, description, isShared } = req.body;

    const newTask = new Task({
      title,
      description,
      userId: req.user._id,
      isShared: !!isShared // force boolean
    });

    await newTask.save();
    return res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------
// 3. Update a task
// -----------------------------------------
router.put('/:taskId', ensureAuth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, isShared } = req.body;

    // Find the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only the owner of the task can update it
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Update fields
    task.title = title !== undefined ? title : task.title;
    task.description = description !== undefined ? description : task.description;
    task.isShared = isShared !== undefined ? isShared : task.isShared;

    await task.save();
    return res.json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------
// 4. Delete a task
// -----------------------------------------
router.delete('/:taskId', ensureAuth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only the owner of the task can delete it
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await task.remove();
    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
