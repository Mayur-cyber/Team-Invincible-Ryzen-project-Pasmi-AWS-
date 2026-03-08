# Google Cloud Console Actions Required

## Issue 1: GCS Bucket Creation Permission Error

**Error:**
```
storage.buckets.create access to the Google Cloud project. 
Permission 'storage.buckets.create' denied on resource
```

**Service Account:** `pasmi-ai-service@pasmi-488614.iam.gserviceaccount.com`

### Option A: Grant Bucket Creation Permission (Recommended)

1. Go to [Google Cloud Console - IAM](https://console.cloud.google.com/iam-admin/iam?project=pasmi-488614)

2. Find your service account: `pasmi-ai-service@pasmi-488614.iam.gserviceaccount.com`

3. Click the **Edit** (pencil icon) button

4. Click **ADD ANOTHER ROLE**

5. Search for and add: **Storage Admin** role
   - Or use the more restrictive: **Storage Object Admin** + manual bucket creation (Option B)

6. Click **SAVE**

### Option B: Create Bucket Manually (If you don't want to grant Storage Admin)

1. Go to [Google Cloud Storage - Buckets](https://console.cloud.google.com/storage/browser?project=pasmi-488614)

2. Click **CREATE BUCKET**

3. Configure:
   - **Bucket name:** `pasmi-488614-pasmi-audio` (must be globally unique)
   - **Location type:** Region
   - **Location:** `us-central1` (matches your Vertex AI location)
   - **Storage class:** Standard
   - **Access control:** Uniform
   - **Protection tools:** None needed (temporary files)

4. Click **CREATE**

5. Add to your `.env` file:
   ```env
   GOOGLE_CLOUD_STORAGE_BUCKET=pasmi-488614-pasmi-audio
   ```

6. Grant your service account access to the bucket:
   - In the bucket, go to **PERMISSIONS** tab
   - Click **GRANT ACCESS**
   - Principal: `pasmi-ai-service@pasmi-488614.iam.gserviceaccount.com`
   - Role: **Storage Object Admin** (includes create, read, AND delete permissions)
   - Click **SAVE**

**Important**: Make sure you grant **Storage Object Admin** (not just Storage Object Creator), as the system needs to:
- ✅ Create objects (upload audio files)
- ✅ Read objects (for transcription)
- ✅ Delete objects (cleanup temporary files)

---

## Issue 2: Verify Required APIs are Enabled

Make sure these APIs are enabled in your Google Cloud project:

1. [Cloud Speech-to-Text API](https://console.cloud.google.com/apis/library/speech.googleapis.com?project=pasmi-488614)
   - Click **ENABLE** if not enabled

2. [Vertex AI API](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=pasmi-488614)
   - Click **ENABLE** if not enabled

3. [Cloud Storage API](https://console.cloud.google.com/apis/library/storage.googleapis.com?project=pasmi-488614)
   - Click **ENABLE** if not enabled

---

## Summary of Recommended Actions

### Quick Fix (5 minutes):
✅ **Option A:** Grant **Storage Admin** role to service account
✅ Verify all APIs are enabled

### Manual Fix (10 minutes):
✅ **Option B:** Create bucket manually: `pasmi-488614-pasmi-audio`
✅ Grant **Storage Object Admin** to service account on bucket
✅ Add `GOOGLE_CLOUD_STORAGE_BUCKET=pasmi-488614-pasmi-audio` to `.env`
✅ Verify all APIs are enabled

---

## After Fixing

Once you've completed either Option A or Option B:

1. **Restart your backend server:**
   ```bash
   # Press Ctrl+C to stop current server
   uvicorn main:app --reload
   ```

2. **Test with a video upload**

3. **Check logs** - You should see:
   ```
   Using existing GCS bucket: pasmi-488614-pasmi-audio
   Uploading audio to GCS: gs://pasmi-488614-pasmi-audio/...
   Audio uploaded successfully
   ```

---

## Current Service Account Permissions

Your service account currently has access to:
- ✅ Vertex AI (Imagen 3 working)
- ✅ Cloud Speech-to-Text API
- ❌ Cloud Storage bucket creation (needs fixing)

After fix:
- ✅ All services working
- ✅ Large audio files (>10MB) can be transcribed
- ✅ Automatic bucket management
