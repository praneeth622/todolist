"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic, Sun, Moon, Trash2, Settings, VolumeX } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useSpeechSynthesis } from "react-speech-kit";
import i18next from "i18next";

export default function AccessibleTodoList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState(16);
  const [language, setLanguage] = useState("en");
  const [dndMode, setDndMode] = useState(false);
  const [notification, setNotification] = useState(null);
  const { speak } = useSpeechSynthesis();
  const { t, i18n } = useTranslation("common");

  const addTask = async () => {
    if (newTask.trim()) {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTask, completed: false }),
      });
      const data = await res.json();
      setTasks([...tasks, data]);
      toast("Task Added");
      setNewTask("");
    }
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addTask();
      
    }
  };

  const toggleTask = async (id) => {
    console.log("Id is ", id);
    const taskToUpdate = tasks.find((task) => task._id === id);

    if (!taskToUpdate) {
      console.error("Task not found");
      toast("Task not Found");
      return;
    }

    const updatedCompletedStatus = !taskToUpdate.completed;

    const res = await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: updatedCompletedStatus }), // Correct _id and status
    });

    if (res.ok) {
      // Update the task in local state
      setTasks(
        tasks.map((task) =>
          task._id === id
            ? { ...task, completed: updatedCompletedStatus }
            : task
        )
      );
      toast("Task Updated");
    } else {
      console.error("Failed to update task");
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }), 
      });

      if (res.ok) {
        setTasks(tasks.filter((task) => task._id !== id)); 
        toast("Task Deleted ");
      } else {
        console.error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const showNotification = (message) => {
    //setNotification(message);
    setTimeout(() => setNotification(null), 3000);
    toast(message); 
    if (!dndMode) {
      speak({ text: message });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleDndMode = () => {
    setDndMode(!dndMode);
    showNotification(dndMode ? t("dnd deactivated") : t("dnd activated"));
  };

  useEffect(() => {
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  useEffect(() => {
    async function fetchTasks() {
      const res = await fetch("/api/tasks");
      const data = await res.json();
    //   console.log("Fetched tasks:", data);
      setTasks(data); 
    }
    fetchTasks();
  }, []);
  useEffect(() => {
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
      speechSynthesis.onvoiceschanged = () => {
        speak({ text: "Testing voice after voices loaded" });
      };
    } else {
      speak({ text: "Testing voice" });
    }
  }, []);
  

  return (
    <div
      className={`min-h-screen ${
        theme === "light" ? "bg-gray-100" : "bg-gray-900 text-white"
      }`}
    >
      <header className="p-4 flex justify-between items-center border-b">
        <h1
          className="text-2xl font-bold"
          style={{ fontSize: `${fontSize}px` }}
          role="heading"
          aria-level={1}
        >
          {t("AccessibleTodo")}
        </h1>

        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`${
                  theme === "light"
                    ? "bg-white text-black"
                    : "bg-black text-white"
                }`}
                aria-label={t("accessibility settings")}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle style={{ fontSize: `${fontSize}px` }}>
                  {t("accessibility settings")}
                </DialogTitle>
                <DialogDescription style={{ fontSize: `${fontSize}px` }}>
                  {t("customize experience")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t("font size")}</Label>
                  <Slider
                    min={12}
                    max={30}
                    step={1}
                    value={[fontSize]}
                    onValueChange={(value) => {
                      setFontSize(value[0]);
                      speak({
                        text: t("font value changed", { value: value[0] }),
                      });
                    }}
                  />
                </div>
                <div>
                  <Label>{t("language")}</Label>
                  <Select
                    value={language}
                    onValueChange={(value) => {
                      setLanguage(value);
                      speak({
                        text: t("language_changed", { value }),
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_language")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t("english")}</SelectItem>
                      <SelectItem value="telugu">{t("telugu")}</SelectItem>
                      <SelectItem value="hindi">{t("hindi")}</SelectItem>
                      <SelectItem value="tamil">{t("tamil")}</SelectItem>
                      <SelectItem value="kannada">{t("kannada")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label={t("toggle theme")}
            className={`${
              theme === "light" ? "bg-white text-black" : "bg-black text-white"
            }`}
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
          <Button
                onClick={() => speak({ text: "Testing voice" })}
                >
                Test Speech
            </Button>           

          <Button
            variant="outline"
            size="icon"
            onClick={toggleDndMode}
            className={`${
              theme === "light" ? "bg-white text-black" : "bg-black text-white"
            }`}
            aria-label={t("toggle dnd mode")}
          >
            {dndMode ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" /> 
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 h-screen">
        <div className="mb-4 flex">
          <Input
            type="text"
            placeholder={t("Add New Task")}
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={handleKeyPress}
            className="mr-2"
            aria-label={t("new task input")}
          />
          <Button
            onClick={addTask}
            style={{ fontSize: `${fontSize}px` }}
            className={`${
              theme === "light"
                ? "bg-black text-white "
                : "bg-white text-black hover:bg-gray-300"
            }`}
            aria-label={t("add task")}
          >
            {t("Add Task")}
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger style={{ fontSize: `${fontSize}px` }} value="all">
              {t("All")}
            </TabsTrigger>
            <TabsTrigger style={{ fontSize: `${fontSize}px` }} value="active">
              {t("Active")}
            </TabsTrigger>
            <TabsTrigger
              style={{ fontSize: `${fontSize}px` }}
              value="completed"
            >
              {t("Completed")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {Array.isArray(tasks) && tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center mb-2 p-2 rounded shadow"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <Switch
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task._id)}
                    aria-label={
                      task.completed ? t("mark incomplete") : t("mark complete")
                    }
                  />
                  <span
                    className={`ml-2 flex-grow ${
                      task.completed ? "line-through" : ""
                    }`}
                  >
                    {task.text}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteTask(task._id)}
                    aria-label={t("delete task")}
                    className={`${
                      theme === "light"
                        ? "bg-white text-black"
                        : "bg-black text-white"
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p>{t("No tasks available")}</p>
            )}
          </TabsContent>

          <TabsContent value="active">
            {tasks
              .filter((task) => !task.completed)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center mb-2 p-2 rounded shadow"
                >
                  <Switch
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    aria-label={t("mark complete")}
                  />
                  <span className="ml-2 flex-grow">{task.text}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                    aria-label={t("delete task")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </TabsContent>
          <TabsContent value="completed">
            {tasks
              .filter((task) => task.completed)
              .map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center mb-2 p-2 rounded shadow ${
                    theme === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  <Switch
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    aria-label={t("mark incomplete")}
                  />
                  <span className="ml-2 flex-grow line-through">
                    {task.text}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                    aria-label={t("delete task")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </TabsContent>
        </Tabs>
      </main>

      {notification && (
        <div
          className="fixed bottom-4 right-4 bg-green-500 text-white p-2 rounded"
          style={{ fontSize: `${fontSize}px` }}
          role="alert"
        >
          {notification}
        </div>
      )}

      <footer
        className="p-4 border-t text-center"
        style={{ fontSize: `${fontSize}px` }}
      >
        <a href="#" className="mx-2">
          {t("accessibility support")}
        </a>
        <a href="#" className="mx-2">
          {t("privacy policy")}
        </a>
        <a href="#" className="mx-2">
          {t("help")}
        </a>
      </footer>
      <Toaster />
    </div>
  );
}
