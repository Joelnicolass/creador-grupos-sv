import express from "express";
import cors from "cors";
import crypto from "crypto";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 2001;

// eliminar grupos ( todos los archivos que empiezan por group-)

app.delete("/groups", async (req, res) => {
  try {
    const groups = fs
      .readdirSync("./")
      .filter((file) => file.startsWith("group-"));

    groups.forEach((group) => {
      fs.unlinkSync(group);
    });

    res.status(200).json({ message: "Groups deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error deleting groups" });
  }

  return;
});

// obtener alumnos (alumnos.json)
app.get("/students", async (req, res) => {
  try {
    const students = JSON.parse(fs.readFileSync("alumnos.json"));
    res.status(200).json(students);

    console.log("Students retrieved successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error getting students" });
  }

  return;
});

// obtener grupos (todos los archivos que empiezan por group-)
app.get("/groups", async (req, res) => {
  try {
    const groups = fs
      .readdirSync("./")
      .filter((file) => file.startsWith("group-"))
      .map((file) => {
        return JSON.parse(fs.readFileSync(file));
      });

    res.status(200).json(groups);

    console.log("Groups retrieved successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error getting groups" });
  }

  return;
});

// restaurar alumnos (alumnos.json)
app.post("/restore", async (req, res) => {
  try {
    const backup = JSON.parse(fs.readFileSync("backup.json"));

    fs.writeFileSync("alumnos.json", JSON.stringify(backup));

    res.status(200).json({ message: "Alumnos restaurados" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error restoring students" });
  }

  return;
});

// crear grupo (group-<id>.json)
app.post("/groups", async (req, res) => {
  const { members } = req.body;

  if (!members) {
    res.status(400).json({ error: "Members is required" });
  }

  const id = crypto.randomUUID();

  const group = {
    id,
    members,
  };

  try {
    fs.writeFileSync(`group-${id}.json`, JSON.stringify(group));

    const allStudents = JSON.parse(fs.readFileSync("alumnos.json")).emails;

    const newStudents = allStudents.filter((student) => {
      return !members.includes(student);
    });

    fs.writeFileSync("alumnos.json", JSON.stringify({ emails: newStudents }));

    console.log("Group created successfully ", group);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating group" });
  }

  res.status(201).json(group);

  return;
});

app.listen(port, () =>
  console.log("> Server is up and running on port : " + port)
);
