# 🔐 Complete Credentials Setup Guide

## ✅ What You've Already Provided

- ✅ **Firebase Client Config** - Updated in `src/config/firebase.ts`
- ✅ **Elastic Search Credentials** - Added to `backend/.env`
- ✅ **Gemini API Key** - Noted in `backend/.env` (optional)

---

## 🚨 CRITICAL: Missing Firebase Service Account (Required for Backend)

### What is it?
Your backend needs **admin access** to Firebase (different from the client config). This allows your Node.js server to:
- Read/write to Firestore database
- Verify user authentication tokens
- Manage users and data

### How to Get It (3 minutes):

**Step 1:** Go to Firebase Console
```
https://console.firebase.google.com/project/global-sentinel2/settings/serviceaccounts/adminsdk
```

**Step 2:** Click **"Generate new private key"**
- A JSON file will download to your computer
- **KEEP THIS FILE SECURE** - it has admin access to your Firebase project

**Step 3:** Open the downloaded JSON file
It will look like this:
```json
{
  "type": "service_account",
  "project_id": "global-sentinel2",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@global-sentinel2.iam.gserviceaccount.com",
  "client_id": "123456789",
  ...
}
```

**Step 4:** Copy these 3 values to `backend/.env`:

```bash
# In backend/.env file, replace these lines:
FIREBASE_PROJECT_ID=global-sentinel2  # Already correct ✅

FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"
# ⬆️ Copy the ENTIRE "private_key" value including quotes and \n characters

FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@global-sentinel2.iam.gserviceaccount.com
# ⬆️ Copy the "client_email" value
```

---

## 📋 Environment Files Checklist

### Backend Environment (`backend/.env`)

```bash
# Firebase Service Account (🚨 MUST COMPLETE)
FIREBASE_PROJECT_ID=global-sentinel2  ✅
FIREBASE_PRIVATE_KEY="..."  ❌ NEEDS YOUR SERVICE ACCOUNT KEY
FIREBASE_CLIENT_EMAIL=...  ❌ NEEDS YOUR SERVICE ACCOUNT EMAIL

# Google Cloud (Already Correct ✅)
GOOGLE_CLOUD_PROJECT=global-sentinel2  ✅
GOOGLE_CLOUD_LOCATION=us-central1  ✅

# Elastic Search (Already Correct ✅)
ELASTIC_NODE_URL=https://ddfdfec992b74b37a633b9918f24fd95.us-central1.gcp.cloud.es.io:443  ✅
ELASTIC_API_KEY=essu_YzNJMmVVVTFiMEo2YjAxellVSTJOREJvVldVNlRGcGhhVUZaTFVGWlMwTmpURTE0TjFkMVRWbE9RUT09AAAAAKhWXPA=  ✅

# Server Config (Already Correct ✅)
PORT=5000  ✅
NODE_ENV=development  ✅
```

### Frontend Config (`src/config/firebase.ts`)
✅ **Already updated with your Firebase client config**

---

## 🚀 Quick Start After Setup

Once you've added the Firebase service account credentials:

### 1. Start Backend Services
```bash
# Terminal 1: Main Backend
cd backend
npm install  # First time only
npm start

# Terminal 2: SIGINT Scraper
cd backend/sigint
npm install  # First time only
npm start

# Terminal 3: Frontend
cd ..  # Back to root
npm install  # First time only
npm run dev
```

### 2. Initialize Elastic Search
```bash
# Test connection
node backend/test/testElasticSearch.js

# Sync existing threats
node backend/scripts/syncFirestoreToElastic.js
```

### 3. Access Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000
- **SIGINT Service**: http://localhost:3001

---

## 🔍 How to Verify Everything Works

### Test 1: Backend Health
```bash
curl http://localhost:5000/api/health
# Should return: {"status": "ok", "timestamp": "..."}
```

### Test 2: Elastic Search
```bash
curl http://localhost:5000/api/elastic/health
# Should return: {"healthy": true, "indexExists": true}
```

### Test 3: AI Agent
```bash
curl -X POST http://localhost:5000/api/agent/health
# Should return: {"success": true, "geminiAvailable": true}
```

### Test 4: Frontend Authentication
1. Go to http://localhost:8080
2. Click "Sign In" (should see Firebase auth UI)
3. Create account or sign in with Google

---

## 🎯 Authentication Flow

### Google Cloud Authentication (for Gemini AI)
The backend uses **Application Default Credentials (ADC)** which means:

**Option A: Using gcloud CLI (Recommended for Development)**
```bash
# Install Google Cloud CLI
# https://cloud.google.com/sdk/docs/install

# Login with your Google account
gcloud auth application-default login

# Set project
gcloud config set project global-sentinel2
```

**Option B: Using Service Account File**
If you prefer to use the Firebase service account for Google Cloud too:
```bash
# Set environment variable pointing to your service account JSON
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
```

---

## 📊 What Each Service Does

### 1. **Main Backend** (Port 5000)
- Handles API requests from frontend
- Manages Firestore database operations
- Runs AI analysis with Gemini
- Coordinates Elastic Search
- Provides AI Agent chat functionality

### 2. **SIGINT Scraper** (Port 3001)
- Scrapes threat intelligence from 50+ sources
- Processes RSS feeds, APIs, Reddit, and HTML sources
- Runs automated scraping every 6 hours
- Sends threats to main backend for analysis

### 3. **Frontend** (Port 8080)
- React dashboard with real-time threat visualization
- Interactive global map
- AI chat interface
- Crisis simulation tools
- Advanced Elastic Search with autocomplete

### 4. **Elastic Search** (Cloud)
- Triple-hybrid search (ELSER + BM25 + Vector)
- Semantic understanding of threats
- Real-time aggregations and analytics
- Autocomplete suggestions

---

## 🐛 Troubleshooting

### Error: "Firebase initialization failed"
➡️ Check that your service account credentials are correct in `backend/.env`

### Error: "Elastic connection failed"
➡️ Verify your Elastic URL and API key are correct (already provided ✅)

### Error: "Gemini AI unavailable"
➡️ Run `gcloud auth application-default login` to authenticate

### Error: "Port already in use"
➡️ Kill existing processes:
```bash
# Find and kill process on port
lsof -ti:5000 | xargs kill  # Backend
lsof -ti:3001 | xargs kill  # SIGINT
lsof -ti:8080 | xargs kill  # Frontend
```

---

## 🎬 Ready for Demo?

Once all services are running, check out:
- **`DEMO_GUIDE.md`** - Complete demo script for judges
- **`ELASTIC_INTEGRATION.md`** - Showcase Elastic Search features
- **`README.md`** - Project overview and architecture

---

## 💡 Pro Tips

1. **Keep service account file secure** - Never commit to Git
2. **Use environment variables** - All sensitive data in `.env` files
3. **Monitor logs** - Watch terminal outputs for errors
4. **Test incrementally** - Verify each service before starting the next
5. **Backup your `.env`** - Keep a copy in a secure location

---

**Need Help?** Check the logs in each terminal window for detailed error messages.
