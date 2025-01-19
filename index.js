const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// app.use(cors());
app.use(cors({
  origin:"http://localhost:3000",
  methods:['GET','POST'],
  credentials:true
}));
app.use(express.json());
app.options('*',cors())
app.post("/update-student", (req, res) => {
  const { stage, rollNumber, updatedStudent } = req.body;

  if (!stage || !rollNumber || !updatedStudent) {
    return res.status(400).json({ message: "البيانات غير مكتملة" });
  }

  const filePath = path.join(__dirname, "JSON",` ${stage}.json`);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "خطأ في قراءة الملف" });

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (error) {
      return res.status(500).json({ message: "تنسيق الملف غير صحيح" });
    }

    if (!jsonData.resalt || !Array.isArray(jsonData.resalt)) {
      return res.status(500).json({ message: "البيانات في الملف غير صالحة" });
    }

    const studentIndex = jsonData.resalt.findIndex(
      (student) => student.rollNumber && student.rollNumber.toString() === rollNumber.toString()
    );

    if (studentIndex === -1) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    const student = jsonData.resalt[studentIndex];
    for (let key in updatedStudent) {
      if (updatedStudent.hasOwnProperty(key) && student.hasOwnProperty(key)) {
        student[key] = updatedStudent[key];
      }
    }

    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "خطأ في حفظ البيانات" });

      res.json({ message: "تم حفظ التعديلات بنجاح" });
    });
  });
});

app.get("/get-file", (req, res) => {
  const { stage } = req.query;

  if (!stage) {
    return res.status(400).json({ message: "المرحلة غير محددة" });
  }

  const filePath = path.join(__dirname, "..", "json-edit-server", "JSON", `${stage}.json`);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "خطأ في قراءة الملف" });
    res.json({ content: data });
  });
});

// POST route لحفظ ملف JSON
app.post("/save-file", (req, res) => {
  const { stage, content } = req.body;

  if (!stage || !content) {
    return res.status(400).json({ message: "البيانات غير مكتملة" });
  }

  try {
    JSON.parse(content);
  } catch (error) {
    return res.status(400).json({ message: "تنسيق JSON غير صحيح" });
  }

  const filePath = path.join(__dirname, "..", "json-edit-server", "JSON", `${stage}.json`);
  fs.writeFile(filePath, content, "utf8", (err) => {
    if (err) return res.status(500).json({ message: "خطأ في حفظ الملف" });
    res.json({ message: "تم حفظ الملف بنجاح" });
  });
});

// GET route للبحث عن طالب
app.get("/get-result", (req, res) => {
  const { stage, rollNumber } = req.query; // استخدام req.query بدلاً من req.body

  if (!stage || !rollNumber) {
    return res.status(400).json({ message: "البيانات غير مكتملة" });
  }

  const filePath = path.join(__dirname, "JSON", `${stage}.json`);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "خطأ في قراءة الملف" });
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (error) {
      return res.status(500).json({ message: "تنسيق الملف غير صحيح" });
    }

    if (!jsonData.resalt || !Array.isArray(jsonData.resalt)) {
      return res.status(500).json({ message: "البيانات في الملف غير صالحة" });
    }

    const student = jsonData.resalt.find(
      (s) => s.rollNumber && s.rollNumber.toString() === rollNumber.toString()
    );

    if (!student) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    res.json({ message: "تم العثور على الطالب", student });
  });
});

// تشغيل الخادم
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})