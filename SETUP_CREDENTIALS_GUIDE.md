# 🔐 Global Sentinel - Production Setup Guide

## ⚠️ CRITICAL: Credentials Are REQUIRED

Global Sentinel uses **100% real AI and search APIs** - no mocks, no fallbacks.

You **MUST** configure these credentials before running:
1. ✅ Elastic Cloud (Hybrid Search + Vector Embeddings)
2. ✅ Google Cloud / Gemini (AI Reasoning + Verification)
3. ⚡ Firebase (Optional - Data Persistence)

**Estimated Setup Time:** 20-25 minutes

---

## 🚀 Setup Instructions

### 1. 📊 Elastic Cloud Setup (CRITICAL - 10 min)

1. **Create Free Account**: https://cloud.elastic.co/registration

2. **Create Deployment**:
   - Click "Create deployment"
   - Name: `global-sentinel-threats`
   - Template: **General Purpose**
   - Region: `us-central1` (GCP - matches Gemini)
   - Size: **1GB RAM** (Free tier eligible)
   - Click "Create deployment"
   - ⏱️ Wait 2-3 minutes for provisioning

3. **Get Cloud ID**:
   - Go to deployment overview page
   - Find **Cloud ID** section
   - Click "Copy" button
   - Paste into `backend/.env`:
     ```bash
     ELASTIC_CLOUD_ID=deployment_name:base64_string_here
     ```

4. **Create API Key** (⚠️ MOST COMMON ERROR - READ CAREFULLY):
   
   **Navigation:**
   ```
   Deployment → Management → Stack Management → Security → API Keys
   ```
   
   **Create Key:**
   - Click "Create API key" button
   - Name: `global-sentinel-api`
   - Type: Personal
   - Expiration: **Never** (for development)
   - Privileges: Leave default (inherits permissions)
   
   **⚠️ CRITICAL - Copy the RIGHT field:**
   ```
   ✅ CORRECT: Copy the "Encoded" field
      - Very long base64 string (100+ characters)
      - Example: VnVaQ2EzUUJyM01CYm5aNFgyRnBPbVl5...
   
   ❌ WRONG: Don't copy the "ID" field  
      - Shorter string starting with essu_
      - Example: essu_YzNJMmVVVTFi...
   ```
   
   **Add to `.env`:**
   ```bash
   ELASTIC_API_KEY=VnVaQ2EzUUJyM01CYm5aNFgyRnBP...(full encoded string)
   ```

5. **Verify**:
   ```bash
   cd backend
   npm start
   ```
   You should see:
   ```
   ✅ Elastic Search client initialized
   🔌 Testing Elastic connection...
   ✅ Elastic connection successful
   ```

**🚨 Got 401 Error?** See `ELASTIC_TROUBLESHOOTING.md` for detailed fix.

**Why Elastic?**
- Hybrid search: BM25 keyword + cosine similarity vector search
- Real-time threat indexing with embeddings
- Sub-second queries across millions of documents
- ✅ **Required for Elastic Challenge submission**

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

Create `backend/.env` file with these **REQUIRED** credentials:

```bash
# ============================================
# 🔥 REQUIRED CREDENTIALS FOR PRODUCTION
# ============================================

# Elastic Cloud (REQUIRED)
ELASTIC_CLOUD_ID=your-cloud-id-here
ELASTIC_API_KEY=your-encoded-api-key-here

# Google Cloud / Gemini (REQUIRED)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# Firebase (OPTIONAL)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com

# Server Configuration
PORT=5000
NODE_ENV=development
```

---

## 🆘 Troubleshooting

### ❌ "401 Unauthorized" from Elastic
**Cause:** Wrong API key format or expired key

**Fix:** See `ELASTIC_TROUBLESHOOTING.md` for step-by-step guide

**Quick check:**
- Is your API key 100+ characters long?
- Did you copy the "Encoded" field (not "ID")?
- Does it start with random letters (not "essu_")?

### ❌ "GOOGLE_CLOUD_PROJECT not found"  
**Cause:** Missing Gemini credentials

**Fix:**
1. Set `GOOGLE_CLOUD_PROJECT=your-project-id` in `.env`
2. Run `gcloud auth application-default login`
3. Or set `GOOGLE_APPLICATION_CREDENTIALS` path

### ❌ "Failed to initialize Elastic index"
**Cause:** Can't connect to Elastic Cloud

**Fix:**
1. Check your deployment is running at https://cloud.elastic.co
2. Verify Cloud ID is correct
3. Regenerate API key if needed
4. Ensure deployment region matches (`us-central1`)

---

## 🏆 Production Deployment Checklist

- [ ] ✅ Elastic Cloud deployment created and tested
- [ ] ✅ Vertex AI API enabled in Google Cloud  
- [ ] ✅ Application Default Credentials configured
- [ ] ⚡ Firebase project created (optional)
- [ ] ✅ All credentials added to `backend/.env`
- [ ] ✅ Health checks passing for all services
- [ ] 🚀 Backend server starts without errors
- [ ] 🎯 Sample threats indexed successfully
- [ ] 🔍 Hybrid search returning results
- [ ] 🤖 Agent workflows executing with real AI

---

## 🎬 For Hackathon Judges

**This system uses 100% real APIs - no mocks, no fallbacks!**

### What You'll Experience:
1. 🔍 **Real Elastic Hybrid Search** - BM25 + vector similarity
2. 🧠 **Real Gemini 2.0 Reasoning** - Multi-agent verification
3. 🌐 **Google Search Grounding** - Live web verification
4. ⚡ **Production-Ready Architecture** - Scales to millions of threats

### Setup Time: ~20 minutes
Follow the guide above to see the system in full production mode.

### Demo Credentials Available
Contact us if you'd like pre-configured demo credentials for evaluation.

---

**Status:** ✅ 100% Production Ready | Zero Fallbacks | Real AI + Real Search
