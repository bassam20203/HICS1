const express = require("express");
const fs = require("fs").promises; // استخدام الـ Promises بدلاً من Callbacks
const path = require("path");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// CORS Configuration
app.use(cors({
  origin: "http://localhost:3000",
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());



// POST route لتحديث بيانات الطالب
app.post("/update-student", async (req, res) => {
  const { stage, rollNumber, updatedStudent } = req.body;

  if (!stage || !rollNumber || !updatedStudent) {
    return res.status(400).json({ message: "البيانات غير مكتملة" });
  }

  const filePath = path.join(__dirname, "JSON", `${stage}.json`);

  try {
    const data = await fs.readFile(filePath, "utf8");
    const jsonData = JSON.parse(data);

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

    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));
    res.json({ message: "تم حفظ التعديلات بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "خطأ في قراءة أو حفظ الملف" });
  }
});

// GET route لقراءة ملف JSON
app.get("/get-file", async (req, res) => {
  const { stage } = req.query;

  if (!stage) {
    return res.status(400).json({ message: "المرحلة غير محددة" });
  }

  const filePath = path.join(__dirname, "JSON", `${stage}.json`);

  try {
    const data = await fs.readFile(filePath, "utf8");
    res.json({ content: data });
  } catch (err) {
    res.status(500).json({ message: "خطأ في قراءة الملف" });
  }
});

// POST route لحفظ ملف JSON
app.post("/save-file", async (req, res) => {
  const { stage, content } = req.body;

  if (!stage || !content) {
    return res.status(400).json({ message: "البيانات غير مكتملة" });
  }

  try {
    JSON.parse(content); // التحقق من صحة تنسيق JSON
  } catch (error) {
    return res.status(400).json({ message: "تنسيق JSON غير صحيح" });
  }

  const filePath = path.join(__dirname, "JSON", `${stage}.json`);

  try {
    await fs.writeFile(filePath, content, "utf8");
    res.json({ message: "تم حفظ الملف بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "خطأ في حفظ الملف" });
  }
});

// GET route للبحث عن طالب
app.get("/get-result", async (req, res) => {
  const { stage, rollNumber } = req.query;

  if (!stage || !rollNumber) {
    return res.status(400).json({ message: "البيانات غير مكتملة" });
  }

  const filePath = path.join(__dirname, "JSON", `${stage}.json`);

  try {
    const data = await fs.readFile(filePath, "utf8");
    const jsonData = JSON.parse(data);

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
  } catch (err) {
    res.status(500).json({ message: "خطأ في قراءة الملف" });
  }
});

// تشغيل الخادم
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})
