Todo List – Full Stack Project

מערכת ניהול משימות (Todo List) מלאה, הכוללת **Backend ב‑FastAPI** ו‑**Frontend ב‑React** עם מערכת משתמשים, הרשאות Admin, ולוח שנה.

---
 תכונות עיקריות

משתמשים
### משתמש רגיל (User)
- יכול ליצור, לערוך ולמחוק משימות אישיות
- יכול לסמן משימה כבוצעה
- יכול לצפות במשימות לפי תאריך
- יכול להשתמש בלוח שנה אינטראקטיבי

---

### מנהל מערכת (Admin)
- יכול לצפות בכל המשתמשים במערכת
- יכול ליצור, לערוך ולמחוק משימות עבור משתמשים
- רואה את סטטוס הביצוע של כל משימה
- משימות שבוצעו מוצגות עם קו חוצה


משימות (Todos)

* יצירת משימה עם:
  * כותרת
  * תיאור
  * תאריך יעד
* עריכת משימה
* מחיקת משימה
* סימון משימה כהושלמה
* חסימת תאריכי עבר (Backend + Frontend)
* הדגשת משימות באדום שפג תוקפן
* מיון משימות לפי תאריך ולפי האם בוצעו

Admin Panel

* צפייה בכל המשתמשים
* בחירת משתמש
* יצירה / עריכה / מחיקה של משימות עבור משתמשים אחרים
* הצגת מי יצר כל משימה (admin / user)
* מיון משימות לפי תאריך ולפי האם בוצעו

Calendar

* תצוגת לוח שנה
* צפייה במשימות לפי תאריך יעד
* סימון ימים בהם יש משימות
---

## 🧱 טכנולוגיות

### Backend

* **Python**
* **FastAPI**
* **SQLAlchemy**
* **SQLite**
* **Pydantic**
* **Passlib (bcrypt)**
* **jwt**

### Frontend

* **React**
* **React Router**
* **Fetch API**
* **CSS (Custom)**
* **react-calendar**

---

## 📁 מבנה הפרויקט

```
backend/
├── main.py          # FastAPI routes
├── models.py        # SQLAlchemy models
├── schemas.py       # Pydantic schemas
├── database.py 
├── auth.py      
├── todo.db 
         # SQLite database

frontend/
├── App.js
├── api.js
├── AdminPage.js
├── TodoPage.js
├── LoginPage.js
├── SignupPage.js
├── CalendarPage.js
├── APP.css
```

---

## ⚙️ התקנה והרצה

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # או venv\\Scripts\\activate ב-Windows
pip install fastapi uvicorn sqlalchemy pydantic passlib[bcrypt]

uvicorn main:app --reload
```

השרת ירוץ על:

```
http://127.0.0.1:8000
```

---

### Frontend

```bash
cd frontend
npm install
npm start
```

האפליקציה תרוץ על:

```
http://localhost:3000
```

---

הרשאות

* משתמש רגיל (`role = user`):

  * יכול לנהל רק את המשימות של עצמו

* Admin (`role = admin`):

  * גישה ל‑Admin Panel
  * יכול לנהל משימות של כל המשתמשים

> ⚠️ ההרשאה מנוהלת כרגע בצד השרת לפי `admin_id` (לצורכי לימוד).


---

שיפורים עתידיים

* חיפוש וסינון
* Docker

---

פיתוח

נבנה כפרויקט Full Stack לימודי עם דגש על:

* הפרדת אחריות (Models / Schemas / Routes)
* תקשורת REST
* UI ברור ונוח

---

