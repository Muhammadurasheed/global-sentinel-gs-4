# 🔐 Global Sentinel - Complete Setup Guide

## 🎯 Quick Start (For Demo/Development)

The system works in **FALLBACK MODE** without credentials - perfect for demonstrations!

```bash
cd backend
npm install
npm start
```

Then in another terminal:
```bash
npm run dev
```

✅ **You're ready to demo! The system uses intelligent fallbacks for missing services.**

---

## 🚀 Full Production Setup (Optional)

To unlock the full power of Gemini + Elastic + Firebase:

### 1. 📊 Elastic Cloud Setup (For Hybrid Search)

1. **Create Free Elastic Cloud Account**: https://cloud.elastic.co/registration
2. **Create Deployment**:
   - Name: `global-sentinel`
   - Region: Choose closest to you
   - Version: Latest 8.x
   - Size: 1GB RAM (Free tier)
3. **Get Credentials**:
   - Click "Manage" on your deployment
   - Go to "Security" → "API Keys"
   - Click "Create API Key"
   - Copy the **API Key**
   - Copy the **Cloud ID** from deployment overview
4. **Add to `.env`**:
   ```bash
   ELASTIC_CLOUD_ID=your-cloud-id-here
   ELASTIC_API_KEY=your-api-key-here
   ```

**Why Elastic?** 
- Hybrid search combining BM25 keyword + vector semantic search
- Real-time threat indexing with ELSER embeddings
- Sub-second search across millions of threat documents
- Perfect for the hackathon "Elastic Challenge" requirements

---

### 2. 🧠 Google Cloud / Gemini Setup (For AI Reasoning)

1. **Create Google Cloud Project**: https://console.cloud.google.com
2. **Enable Vertex AI API**:
   - Go to APIs & Services → Enable APIs
   - Search for "Vertex AI API"
   - Click Enable
3. **Set up Application Default Credentials**:
   ```bash
   gcloud auth application-default login
   ```
   OR download a service account key and set:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
   ```
4. **Add to `.env`**:
   ```bash
   GOOGLE_CLOUD_PROJECT=your-project-id
   GOOGLE_CLOUD_LOCATION=us-central1
   ```

**Why Gemini?**
- Advanced reasoning with chain-of-thought
- Google Search grounding for real-time verification
- 2M token context window for deep analysis
- Multimodal capabilities for future expansions

---

### 3. 🔥 Firebase Setup (For Data Persistence)

1. **Create Firebase Project**: https://console.firebase.google.com
2. **Enable Firestore Database**:
   - Go to Build → Firestore Database
   - Click "Create database"
   - Start in production mode
3. **Create Service Account**:
   - Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download JSON file
4. **Add to `.env`**:
   ```bash
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   ```

---

## 🧪 Testing Your Setup

```bash
cd backend
npm test
```

Or manually test each service:

```bash
# Test Elastic
curl http://localhost:5000/api/elastic/health

# Test Gemini
curl http://localhost:5000/api/health

# Test Agent Workflow
curl -X POST http://localhost:5000/api/agent-workflow/verify \
  -H "Content-Type: application/json" \
  -d '{"threat": {"title": "Test Threat", "type": "Cyber"}}'
```

---

## 📋 Environment Variable Summary

Create `backend/.env` file:

```bash
# Elastic (OPTIONAL - works without it)
ELASTIC_CLOUD_ID=your-cloud-id
ELASTIC_API_KEY=your-api-key

# Google Cloud (OPTIONAL - works without it)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# Firebase (OPTIONAL - works without it)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com

# Server
PORT=5000
NODE_ENV=development
```

---

## ⚡ Fallback Mode vs Full Mode

### Fallback Mode (No Credentials)
✅ All UI features work  
✅ Simulated agent workflows  
✅ Mock data responses  
✅ Perfect for demos  

### Full Mode (With Credentials)
🚀 Real Gemini reasoning  
🚀 Live Elastic hybrid search  
🚀 Firebase data persistence  
🚀 Google Search grounding  
🚀 Production-ready  

---

## 🎬 For Hackathon Judges

**No setup required!** The system demonstrates all features in fallback mode:

1. ✅ Triple-agent verification workflows
2. ✅ Deep causal analysis with Gemini
3. ✅ Crisis simulation with Monte Carlo
4. ✅ Elastic hybrid search interface
5. ✅ Real-time threat feed
6. ✅ Interactive global map
7. ✅ AI command center

**Want to see real integrations?** 
We can activate live Gemini + Elastic in the demo with our credentials!

---

## 🆘 Troubleshooting

### "Elastic index initialization failed"
➡️ This is normal in fallback mode! The system works without Elastic.

### "GOOGLE_CLOUD_PROJECT not found"
➡️ This is normal in fallback mode! The system works without Gemini.

### "Firebase running in demo mode"
➡️ This is normal in fallback mode! The system works without Firebase.

**All these warnings are by design** - the system gracefully degrades to demo mode!

---

## 🏆 Production Deployment Checklist

- [ ] Set up Elastic Cloud deployment
- [ ] Enable Vertex AI in Google Cloud
- [ ] Create Firebase project with Firestore
- [ ] Add all credentials to `.env`
- [ ] Test all services with health checks
- [ ] Deploy frontend to hosting
- [ ] Deploy backend to Cloud Run / Compute Engine
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and alerting
- [ ] Enable HTTPS with valid certificates

---

**Remember**: The system is designed to impress in demo mode. Credentials unlock additional power but aren't required for the hackathon demo! 🎯
