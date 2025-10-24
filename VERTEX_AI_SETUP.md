# 🚀 Vertex AI API Setup Guide - CRITICAL FOR GEMINI

## ⚠️ IMPORTANT: Required for AI Features

Your Global Sentinel system **REQUIRES** Vertex AI API to be enabled for:
- AI Agent Chat (Gemini-powered conversational intelligence)
- Threat Analysis (Deep causal chain analysis)
- Crisis Simulation (Monte Carlo scenario modeling)
- Threat Verification (Multi-source fact-checking)

**Without Vertex AI enabled, all AI features will fail with 403 errors.**

---

## 🔥 Quick Fix (5 Minutes)

### Step 1: Enable the Vertex AI API

1. **Click this activation link for your project:**
   ```
   https://console.developers.google.com/apis/api/aiplatform.googleapis.com/overview?project=global-sentinel2
   ```

2. **Click the blue "ENABLE" button** at the top of the page

3. **Wait 2-3 minutes** for the API to propagate across Google's systems

4. **Restart your backend server:**
   ```bash
   # In your backend terminal, type:
   rs
   
   # Or stop and restart:
   # Ctrl+C, then: node server.js
   ```

### Step 2: Verify It's Working

After restarting, you should see:
```
✅ Gemini client initialized with project: global-sentinel2
```

**NOT:**
```
🚨 Gemini API Error: [VertexAI.ClientError]: got status: 403 Forbidden
```

---

## 📋 Full Setup Checklist

### Prerequisites
- [ ] Google Cloud Project created (`global-sentinel2`)
- [ ] Firebase service account credentials in `.env`
- [ ] `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` set

### Enable Vertex AI
- [ ] Visit: https://console.cloud.google.com/apis/api/aiplatform.googleapis.com
- [ ] Click "Enable" button
- [ ] Wait for propagation (2-3 minutes)

### Test the Setup
- [ ] Restart backend server
- [ ] Try AI Agent chat in frontend
- [ ] Run a simulation or analysis
- [ ] Check backend logs for success messages

---

## 🔍 Troubleshooting

### Error: "403 Forbidden - SERVICE_DISABLED"

**Symptom:**
```
🚨 Gemini API Error: [VertexAI.ClientError]: got status: 403 Forbidden
{"error":{"code":403,"message":"Vertex AI API has not been used in project global-sentinel2 before or it is disabled..."}}
```

**Solution:**
1. The API is not enabled. Follow Step 1 above.
2. If you just enabled it, wait 3-5 minutes for propagation.
3. Clear any browser cache and restart your backend.

### Error: "Unable to authenticate your request"

**Symptom:**
```
🚨 Gemini API Error: [VertexAI.GoogleAuthError]: Unable to authenticate your request
```

**Solution:**
1. Verify `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` are in your `.env` file
2. Check that `FIREBASE_PRIVATE_KEY` includes the full key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
3. Ensure newlines in the private key are properly escaped as `\n`

### Error: "Project not found"

**Symptom:**
```
❌ GOOGLE_CLOUD_PROJECT is required!
```

**Solution:**
Add `GOOGLE_CLOUD_PROJECT=global-sentinel2` to your `backend/.env` file.

---

## 🎯 What Vertex AI Powers

### 1. **AI Agent Chat** 
The conversational intelligence system that answers questions about threats using:
- Tool calling (search_threats, simulate_crisis, verify_threat)
- Gemini 2.0 Flash reasoning
- Context-aware responses

### 2. **Threat Verification**
Multi-agent workflow that:
- Runs semantic search across threat database
- Uses Gemini grounding for real-time web research
- Provides credibility scores with source citations

### 3. **Causal Analysis**
Deep analysis system that:
- Builds 8-step causal chains
- Identifies intervention points
- Projects timelines and impact

### 4. **Crisis Simulation**
Monte Carlo simulation engine that:
- Generates 1,000+ scenario variations
- Identifies most likely outcomes
- Recommends mitigation strategies

---

## 🔐 Why We Use Firebase Credentials

Global Sentinel uses **Firebase service account credentials** to authenticate with Vertex AI:

```javascript
// In backend/utils/geminiClient.js
this.vertexAI = new VertexAI({
  project: this.projectId,
  location: this.location,
  googleAuthOptions: {
    credentials: {
      client_email: clientEmail,      // From FIREBASE_CLIENT_EMAIL
      private_key: privateKey          // From FIREBASE_PRIVATE_KEY
    }
  }
});
```

This approach:
- ✅ Works in any environment (local, cloud, containers)
- ✅ No need for `gcloud auth login`
- ✅ Consistent across development and production
- ✅ Reuses existing Firebase credentials

---

## 🚀 Production Deployment

For production, ensure:

1. **Environment Variables Set:**
   ```bash
   GOOGLE_CLOUD_PROJECT=global-sentinel2
   GOOGLE_CLOUD_LOCATION=us-central1
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@global-sentinel2.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

2. **Vertex AI API Enabled** in your production Google Cloud project

3. **Billing Enabled** on your Google Cloud project (Vertex AI requires billing)

4. **IAM Permissions:** The Firebase service account must have:
   - `roles/aiplatform.user` (for Vertex AI access)
   - `roles/firebase.admin` (for Firebase/Firestore access)

---

## 💰 Cost Considerations

Gemini 2.0 Flash (our model) pricing:
- **Input:** $0.075 per 1M tokens
- **Output:** $0.30 per 1M tokens

**Extremely affordable for production use:**
- Average threat analysis: ~2,000 tokens = $0.0006
- AI chat message: ~500 tokens = $0.0002
- Crisis simulation: ~4,000 tokens = $0.0012

**Monthly estimate for moderate usage:**
- 10,000 analyses = ~$6
- 50,000 chat messages = ~$10
- 5,000 simulations = ~$6
- **Total: ~$22/month**

---

## 📚 Additional Resources

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Gemini API Reference](https://cloud.google.com/vertex-ai/generative-ai/docs/reference)
- [Firebase Service Accounts](https://firebase.google.com/docs/admin/setup)
- [Google Cloud IAM Roles](https://cloud.google.com/iam/docs/understanding-roles)

---

## ✅ Success Indicators

When everything is working correctly, you'll see:

```
✅ Gemini client initialized with project: global-sentinel2
🧠 Starting hybrid Gemini analysis for: ...
✅ Retrieved X threats from Firestore
🎯 Workflow complete: { success: true, ... }
```

And your frontend will show:
- ✅ AI Agent responding to chat messages
- ✅ Simulations completing with detailed reports
- ✅ Analyses showing causal chains
- ✅ Verifications showing source credibility

---

**Ready to enable Vertex AI? Click the link in Step 1 above! 🚀**
