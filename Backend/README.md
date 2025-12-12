# E-Ujian Backend

1. Copy .env.example -> .env dan isi DATABASE_URL, JWT_SECRET, REDIS_URL (opsional)
2. npm install
3. npm run seed      # buat admin awal (opsional)
4. npm run dev       # jalankan server dev
5. API base: http://localhost:5000/api
   - POST /api/auth/register
   - POST /api/auth/login
   - GET  /api/auth/profile (requires Authorization: Bearer <token>)
   - GET  /api/users (admin)
   - POST /api/exams
   - GET  /api/exams
   - POST /api/questions
   - GET  /api/questions
   - POST /api/results/submit
