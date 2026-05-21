# DEMO DAY CHECKLIST

### ☀️ Morning Prep (2 hours before)
- [ ] **Laptop Charge:** Plugged in and at 100%. Do not rely on battery.
- [ ] **Notifications Off:** Turn on "Do Not Disturb" / Focus Assist on Windows. Quit Slack/Discord/WhatsApp entirely.
- [ ] **Clean Desktop:** Hide messy icons. Close irrelevant browser tabs.

### 🔌 Systems Check (1 hour before)
- [ ] **Run Smoke Test:** Double-click `infra/smoke_test.bat`. Verify it prints `ALL SYSTEMS GO`.
- [ ] **Backend Live Check:** Open `https://promptarmor-backend.onrender.com/health` in browser. Should say "ok".
- [ ] **Frontend Live Check:** Open your Vercel URL. Check that the UI loads and no white screens appear.
- [ ] **Supabase Check:** Look for the green `● LIVE` badge in the top right of the dashboard.
- [ ] **UptimeRobot Check:** Verify UptimeRobot is green and pinging the backend so it doesn't sleep.

### 🎭 Browser Setup (30 mins before)
Have these exactly 4 tabs open and ready, in this exact order:
1. **Split-Screen Demo Page:** `https://your-vercel-url.com/demo`
2. **Inspector Page:** `https://your-vercel-url.com/inspect`
3. **Eval Results Markdown:** Open the rendered markdown file showing your F1 scores.
4. **GitHub Repo / Code Snippet:** Open to the 3 lines of integration code you'll show at the end.

### 🧠 Mental Prep (15 mins before)
- [ ] **Breathe:** You are a solo dev who built a full-stack security product. You've got this.
- [ ] **Numbers Memorized:** 
      - Total evaluation dataset size: 130 prompts
      - Overall F1 Score: [Insert Score]%
      - Latency impact: ~[Insert]ms
- [ ] **Water:** Have a glass of water nearby.

## GO CRUSH IT!
