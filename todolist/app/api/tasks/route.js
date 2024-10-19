import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

// MongoDB connection function
const connectMongo = async () => {
  if (mongoose.connections[0].readyState) return; // Use existing connection
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

// Task schema
const TaskSchema = new mongoose.Schema({
  text: String,
  completed: Boolean,
  createdAt: { type: Date, default: Date.now },
});

// Create or use an existing Task model
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

// Handle GET request: fetch all tasks
export async function GET() {
  try {
    await connectMongo();
    const tasks = await Task.find({});
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load tasks' }, { status: 500 });
  }
}

// Handle POST request: create a new task
export async function POST(req) {
  try {
    await connectMongo();
    const data = await req.json(); // Parse request body
    const task = new Task(data); // Create new task
    await task.save();
    console.log('Task saved')
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 400 });
  }
}

// Handle DELETE request: delete a task by ID
export async function DELETE(req) {
    try {
      await connectMongo();  // Ensure you are connected to MongoDB
      const { id } = await req.json();  // Get the id from request body
  
      const deletedTask = await Task.findByIdAndDelete(id);  // Delete the task by _id
      if (!deletedTask) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
  
      return NextResponse.json({ success: true, deletedTask });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 400 });
    }
  }
  
  export async function PUT(req) {
    try {
      await connectMongo();
      const { id, completed } = await req.json(); // Parse request body
  
      const task = await Task.findByIdAndUpdate(id, { completed }, { new: true });
      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
  
      return NextResponse.json({ success: true, task });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
  }
  