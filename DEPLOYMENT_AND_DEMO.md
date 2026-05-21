# PromptArmor Deployment & Presentation Guide

This document contains everything you need to deploy PromptArmor to the internet and crush your 10-minute presentation.

---

## TASK 4: DEPLOYMENT INSTRUCTIONS

### A. Deploy Backend to Render
1. Create a free account at [Render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Because we created `backend/render.yaml`, Render should automatically detect your settings (Python 3, `pip install -r requirements.txt`, and the uvicorn start command).
5. Choose the **Free** tier.
6. Click **Create Web Service**. 
7. *Note the generated URL (e.g., `https://promptarmor-backend.onrender.com`). You will need this for the frontend.*

### B. Deploy Frontend to Vercel
1. Create a free account at [Vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Set the **Framework Preset** to `Vite`.
5. Set the **Root Directory** to `frontend`.
6. Open the **Environment Variables** section (see Section C below).
7. Click **Deploy**. Vercel will use the `vercel.json` file we created to route everything perfectly.

### C. Environment Variables
**In Vercel (Frontend):**
Navigate to Project Settings -> Environment Variables. Add:
* `VITE_SUPABASE_URL`: Get this from your Supabase Project Settings -> API (URL).
* `VITE_SUPABASE_ANON_KEY`: Get this from Supabase Project Settings -> API (anon public key).
* `VITE_API_BASE_URL`: This is your Render backend URL (e.g., `https://promptarmor-backend.onrender.com`). **Do not include a trailing slash.**

**In Render (Backend):**
Navigate to Web Service -> Environment. Add:
* `SUPABASE_URL`: (Same as above)
* `SUPABASE_SERVICE_KEY`: Get this from Supabase Project Settings -> API (service_role secret key).
* Any API keys needed for your ML models (e.g., `OPENAI_API_KEY`).

### D. How to Verify
1. **Backend:** Visit `https://promptarmor-backend.onrender.com/health`. You should see `{"status": "ok"}`.
2. **Frontend:** Visit your Vercel URL. Click the Demo page. The green `● LIVE` badge should be visible. Send a prompt—if it returns a response, the backend and frontend are talking successfully!

### E. Prevent Render Cold Starts (UptimeRobot)
Render free tiers spin down after 15 minutes of inactivity, causing a 50-second delay on the next request.
1. Go to [UptimeRobot.com](https://uptimerobot.com) and create a free account.
2. Click **Add New Monitor**.
3. Type: `HTTP(s)`
4. URL: `https://promptarmor-backend.onrender.com/health`
5. Interval: 5 minutes.
6. This will ping your backend constantly, keeping it awake for your demo.

---

## TASK 6: 10-MINUTE DEMO SCRIPT

**0:00 - 1:00 | The Hook**
*Action: Have the Split-Screen Demo page open. Nothing in the chat yet.*
"Hi everyone, I'm [Your Name], and I built PromptArmor. Today, every company is rushing to integrate AI, but they are leaving a massive backdoor wide open: Prompt Injection. Attackers can hijack AI bots to steal data, perform unauthorized actions, or damage brand reputation. Today, I'm going to show you how PromptArmor acts as an AI Firewall to stop this in milliseconds. On the left, we have a standard, unprotected AI. On the right, we have an AI protected by PromptArmor."

**1:00 - 2:30 | The Unprotected Failure**
*Action: Click the "🔓 DAN Jailbreak" quick attack button. Click Send.*
"Let's look at a classic jailbreak—the 'Do Anything Now' or DAN exploit. This is a highly structured prompt designed to break the AI out of its safety constraints. As you can see on the left, the unprotected AI completely falls for it and willingly provides dangerous instructions, completely ignoring its original system prompt. If this was your customer service bot, you'd be in trouble."

**2:30 - 5:00 | PromptArmor in Action**
*Action: The right side will have already flashed red and blocked the DAN prompt. Click the other attack buttons one by one (Role Play, Hindi Injection, System Leak).*
"But look at the right side. PromptArmor intercepted the request before it even reached the LLM. It detected the malicious intent, flagged the specific rules violated, and returned an instant block. 
*(Click Hindi Injection)* It even works across languages. Here's an injection attack translated into Hindi. The unprotected AI complies, but PromptArmor catches the underlying semantic intent and blocks it.
*(Click Safe Prompt)* And to prove we aren't just blocking everything, here is a completely benign question. PromptArmor analyzes it, confirms it's safe, and passes it through seamlessly with almost zero latency."

**5:00 - 6:30 | The Deep Dive (Inspector)**
*Action: Switch to the Inspector Page tab. Paste the Role Play prompt and hit Analyze.*
"How does it know? I built this Inspector tool for security teams to visualize the engine. When I feed an attack in, PromptArmor highlights the exact malicious vectors. Over here on the right, you can see our gauge, the exact attack category, the confidence score, and the specific security rules that were triggered. It provides a plain-English explanation of why this was dangerous, making it incredibly easy for security analysts to audit logs."

**6:30 - 7:30 | The Data (Eval Results)**
*Action: Switch to the Markdown tab showing your Eval Results table.*
"Security products live and die by their accuracy. I built a custom automated red-teaming framework and ran 130 unique, hand-crafted attacks and benign prompts against the engine. We achieved an overall F1 score of [X]%. For those unfamiliar, the F1 score proves that we are highly effective at catching attacks (True Positives) without accidentally blocking legitimate users (False Positives)."

**7:30 - 8:30 | The Integration**
*Action: Switch to your GitHub code snippet tab.*
"The best part is how easy this is to deploy. A company doesn't need to retrain their models or change their architecture. They literally just change their API endpoint to route through PromptArmor. It's three lines of code to add enterprise-grade security to any AI application."

**8:30 - 10:00 | The Close & Q&A**
*Action: Leave the screen on the beautiful Dashboard.*
"PromptArmor is live on the internet right now. You can visit [Your Vercel URL] to try to hack it yourself, or view the source code on my GitHub. I built this entirely solo over the last few weeks. Thank you, and I'd love to take any questions."

---

## TASK 7: Q&A CHEAT SHEET

**1. What is prompt injection?**
Prompt injection is when a user maliciously crafts their input to override the AI's original instructions. It tricks the AI into executing the user's hidden commands instead of what the developer intended. It's similar to SQL injection, but for natural language.

**2. Why is it dangerous?**
If an AI has access to internal databases or can take actions like sending emails, an attacker can use prompt injection to exfiltrate sensitive data or execute unauthorized commands. It essentially turns a helpful chatbot into a confused deputy working for the hacker.

**3. Why not just use regex or blocklists?**
Regex only looks for specific, known keywords, but human language is infinite. Attackers easily bypass regex by using synonyms, typos, or translating the attack into another language. PromptArmor uses semantic analysis to understand the *intent* of the prompt, not just the exact words.

**4. What is F1 score?**
The F1 score is a metric that balances precision and recall. It ensures that not only are we catching the bad guys (recall), but we aren't accidentally blocking legitimate users (precision). A high F1 score means the firewall is both highly secure and highly usable.

**5. What is your weakest area?**
*(Answer truthfully based on your eval, e.g.)* Currently, the system struggles slightly with heavily obfuscated text, like base64 encoding or complex ascii art. Future iterations will include pre-processing layers to decode these formats before analysis.

**6. How fast is it?**
The analysis adds only about [Your Latency] milliseconds of overhead to the request. Because LLM generation usually takes several seconds anyway, the security check is entirely imperceptible to the end user.

**7. Can it be bypassed?**
In cybersecurity, nothing is 100% impenetrable forever. However, PromptArmor raises the barrier to entry significantly, stopping all automated and script-kiddie attacks, and forcing advanced attackers to spend immense time and resources to find an edge case.

**8. How would a company integrate this?**
It acts as a reverse proxy. A company simply updates their API base URL to point to the PromptArmor endpoint instead of OpenAI/Anthropic directly. No architecture changes or model fine-tuning are required.

**9. What would v2 look like?**
Version 2 would include data loss prevention (DLP) to ensure the AI doesn't accidentally leak PII in its *responses*, even if the prompt was benign. I would also add streaming support so the firewall can analyze tokens in real-time as they are generated.

**10. What did you build solo vs what did the AI assistant help with?**
I drove the product vision, system architecture, API design, and security rule logic entirely on my own. I utilized an AI coding assistant to accelerate the frontend boilerplate, generate CSS styling, and rapidly scaffold the React components under my direct supervision and specifications.
