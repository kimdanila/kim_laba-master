import React, { useState, useMemo, useEffect } from "react";
import { Doughnut, Pie } from "react-chartjs-2";
import { Chart, ArcElement } from "chart.js";
Chart.register(ArcElement);

function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [filter, setFilter] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (title.trim() === ""||deadline==="") {
      return;
    }
    if (editIndex === -1) {
      setNotes([
        ...notes,
        {
          title,
          content,
          completed: false,
          created_at: new Date(),
          deadline, // добавляем дедлайн в объект заметки
        },
      ]);
    } else {
      setNotes(
        notes.map((note, index) =>
          index === editIndex
            ? {
                ...note,
                title,
                content,
                deadline, // добавляем дедлайн в объект заметки
              }
            : note
        )
      );
      setEditIndex(-1);
    }
    setTitle("");
    setContent("");
    setDeadline(""); // очищаем дедлайн после добавления или редактирования заметки
  };

  const handleDelete = (index) => {
    const updatedNotes = notes.filter((note, i) => i !== index);
    setNotes(updatedNotes);
  };

  const handleEdit = (index) => {
    const note = notes[index];
    setTitle(note.title);
    setContent(note.content);
    setEditIndex(index);
  };

  const handleComplete = (index) => {
    const updatedNotes = [...notes];
    updatedNotes[index].completed = !updatedNotes[index].completed;
    setNotes(updatedNotes);
  };

  const filteredNotes = useMemo(() => {
    if (!filter) {
      return notes;
    }
    return notes.filter((note) =>
      note.title.toLowerCase().includes(filter.toLowerCase())
    );
  }, [notes, filter]);

  const [sortBy, setSortBy] = useState("all");

  const sortedNotes = useMemo(() => {
    switch (sortBy) {
      case "completed":
        return filteredNotes.filter((note) => note.completed);
      case "uncompleted":
        return filteredNotes.filter((note) => !note.completed);
      default:
        return filteredNotes;
    }
  }, [filteredNotes, sortBy]);

  const completedCount = sortedNotes.filter((note) => note.completed).length;
  const uncompletedCount = sortedNotes.filter((note) => !note.completed).length;

  const data1 = {
    labels: ["Выполнено", "Не выполнено"],
    datasets: [
      {
        data: [completedCount, uncompletedCount],
        backgroundColor: ["rgb(75, 192, 192)", "rgb(192, 75, 75)"],
        hoverBackgroundColor: [
          "rgb(75, 192, 192, 0.8)",
          "rgb(192, 75, 75, 0.8)",
        ],
      },
    ],
  };
  const totalTasks = sortedNotes.length;
  const completedPercentage = (completedCount / totalTasks) * 100;
  const uncompletedPercentage = 100 - completedPercentage;

  const data2 = {
    labels: ["Выполнено", "Не выполнено"],
    datasets: [
      {
        data: [completedPercentage, uncompletedPercentage],
        backgroundColor: ["black", "blue"],
        hoverBackgroundColor: [
          "rgb(75, 192, 192, 0.8)",
          "rgb(192, 75, 75, 0.8)",
        ],
      },
    ],
  };
  const options = {
    width: 200,
    height: 200,
    // Другие настройки графика
  };

  function isNoteExpired(note) {
    const currentDate = new Date();
    const deadline = new Date(note.deadline);
    return currentDate > deadline;
  }

  return (
    <div className="hui">
      <h1>RPIS 2DO Kim Edition</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Заголовок:
          <input
            placeholder="Заголовок"
            className="zagolovok"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <br />
        <label>
          Содержимое:
          <textarea
            placeholder="Введите текст"
            className="zagolovok2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>
        <br /> <br />
        <label>
          Крайний срок выполнения:
          <input
            className="filtra"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>
        <br />
        <button className="dodod" type="submit">
          {editIndex === -1 ? "Добавить" : "Сохранить"}
        </button>
        {editIndex !== -1 && (
          <button type="button" onClick={() => setEditIndex(-1)}>
            Отмена
          </button>
        )}
      </form>

      <div className="filtr">
        <label>
          Поиск:
          <input
            className="filtra"
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </label>
        <button className="filtra" onClick={() => setSortBy("all")}>
          Все
        </button>
        <button className="filtra" onClick={() => setSortBy("completed")}>
          Выполненные
        </button>
        <button className="filtra" onClick={() => setSortBy("uncompleted")}>
          Не выполненные
        </button>
      </div>
      <h2>График соотношения выполненных/невыполненных задач.</h2>
      <div className="chart-container">
        <div className="chart1">
          <Pie data={data1} options={options} />
        </div>
        <div className="chart2">
          <Doughnut data={data2} options={options} />
        </div>
      </div>

      <ul className="penis">
        {sortedNotes.map((note, index) => (
          <li
            key={index}
            className={`
        note-item
        ${note.completed ? "completed" : ""}
        ${isNoteExpired(note) ? "expired" : ""}
      `}
          >
            <div className="note-content">
              <h2>{note.title}</h2>
              <p>{note.content}</p>
              <p className="note-date">
                Добавлено: {new Date(note.created_at).toLocaleDateString()}
              </p>
              <p className="note-date">
                Дедлайн:{" "}
                {new Date(note.deadline).toLocaleDateString()}
              </p>
              <p className="note-status">
                Статус: {note.completed ? "Выполнено" : "Не выполнено"}
              </p>
            </div>
            <div className="note-actions">
              <button
                className="butt"
                type="button"
                onClick={() => handleDelete(index)}
              >
                Удалить
              </button>
              <button
                className="butt2"
                type="button"
                onClick={() => handleEdit(index)}
                disabled={isNoteExpired(note)}
              >
                Редактировать
              </button>
              <button
                className="butt3"
                type="button"
                onClick={() => handleComplete(index)}
                disabled={isNoteExpired(note)}
              >
                {note.completed ? "Отменить" : "Выполнить"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotesApp;
