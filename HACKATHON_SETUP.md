# 🚀 AI Accelerate Hackathon - Setup Guide

## Phase 2 Complete ✅

### What Was Built

**Elastic Search Integration:**
- ✅ Hybrid search (BM25 + Vector embeddings)
- ✅ 768-dimension semantic search with Gemini
- ✅ Auto-indexing pipeline for real-time threats
- ✅ Advanced filtering (type, severity, regions)
- ✅ Statistics & aggregations
- ✅ Health checks & monitoring

**Backend Services:**
- `ElasticSearchService` - Full hybrid search engine
- `GET/POST /api/elastic/*` - Search endpoints
- Auto-index on threat ingestion
- Sync script for bulk indexing

**Frontend Hooks:**
- `useElasticSearch.ts` - React hook for search

---

## 🔧 Manual Setup Required

### 1. Google Cloud Setup (Phase 1)

```bash
# Install Google Cloud CLI
gcloud auth application-default login

# Enable APIs
gcloud services enable aiplatform.googleapis.com
gcloud services enable generativelanguage.googleapis.com

# Set project
export GOOGLE_CLOUD_PROJECT=your-project-id
```

### 2. Elastic Cloud Setup (Phase 2) ⭐ CRITICAL

**Step A: Create Elastic Deployment**
1. Go to https://cloud.elastic.co
2. Sign up (free 14-day trial)
3. Create deployment → Choose "Elastic Stack"
4. Region: Any (recommend same as Google Cloud)
5. Wait 2-3 minutes for deployment

**Step B: Get Credentials**
1. Copy **Cloud ID** from deployment page
2. Create **API Key**:
   - Click "Management" → "Dev Tools"
   - Run: 
   ```
   POST /_security/api_key
   {
     "name": "global-sentinel",
     "role_descriptors": {
       "global-sentinel-role": {
         "cluster": ["all"],
         "index": [{"names": ["*"], "privileges": ["all"]}]
       }
     }
   }
   ```
   - Copy the `encoded` value (this is your API key)

**Step C: Configure Backend**
```bash
# backend/.env
ELASTIC_CLOUD_ID=your-cloud-id-here
ELASTIC_API_KEY=your-api-key-here
```

### 3. Initialize & Test

```bash
# Start backend
cd backend && npm start

# In another terminal, test Elastic
node backend/test/testElasticSearch.js

# Sync existing threats to Elastic
node backend/scripts/syncFirestoreToElastic.js
```

### 4. Verify Setup

```bash
curl http://localhost:5000/api/elastic/health
# Should return: {"healthy": true, "indexExists": true}

curl -X POST http://localhost:5000/api/elastic/search \
  -H "Content-Type: application/json" \
  -d '{"query": "cyber attack", "searchType": "hybrid"}'
```

---

## 🎯 Ready for Phase 3

**Next: AI Agent with Function Calling**
- Gemini 2.0 with tools
- Chat interface
- Real-time streaming
- Tool visualization

---

## 📊 Architecture Summary

```
Google Cloud (Gemini) + Elastic Search + Firebase
         ↓                    ↓              ↓
    AI Analysis        Hybrid Search    Storage
         ↓                    ↓              ↓
              Backend API (Node.js)
                        ↓
              React Frontend Dashboard
```

**Technologies:**
- Google Cloud Vertex AI (Gemini 2.0 Flash)
- Elastic Search (BM25 + Vector)
- Firebase (Firestore + Auth)
- React + TypeScript
- Node.js + Express

**Winning Features:**
- Real-time threat intelligence
- Hybrid search (keyword + semantic)
- Crisis simulation
- Global impact visualization
- Conversational AI (Phase 3)
