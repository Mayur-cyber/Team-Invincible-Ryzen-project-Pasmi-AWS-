import os
import json
import time
import uuid
import tempfile
import logging
import base64
import io
import subprocess
from pathlib import Path

from fastapi import UploadFile
from PIL import Image

logger = logging.getLogger(__name__)

# --- Google Cloud Configuration ---
GOOGLE_CLOUD_API_KEY = os.getenv("GOOGLE_CLOUD_API_KEY")
GOOGLE_CLOUD_PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT_ID", "")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")  # Path to service account JSON
GOOGLE_CLOUD_STORAGE_BUCKET = os.getenv("GOOGLE_CLOUD_STORAGE_BUCKET")  # GCS bucket for audio files


def _extract_audio_from_video(video_path: str, audio_path: str) -> bool:
    """
    Extract audio from video file using ffmpeg.
    Returns True if successful, False otherwise.
    """
    try:
        # Try using ffmpeg directly (faster and more reliable)
        cmd = [
            'ffmpeg',
            '-i', video_path,
            '-vn',  # No video
            '-acodec', 'pcm_s16le',  # PCM 16-bit
            '-ar', '16000',  # 16kHz sample rate
            '-ac', '1',  # Mono
            '-y',  # Overwrite output file
            audio_path
        ]
        
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=300  # 5 minute timeout
        )
        
        if result.returncode == 0 and os.path.exists(audio_path):
            logger.info(f"Successfully extracted audio using ffmpeg")
            return True
        else:
            logger.warning(f"ffmpeg extraction failed: {result.stderr.decode()}")
            return False
            
    except FileNotFoundError:
        logger.warning("ffmpeg not found in PATH")
        return False
    except subprocess.TimeoutExpired:
        logger.error("Audio extraction timed out after 5 minutes")
        return False
    except Exception as e:
        logger.error(f"Error extracting audio with ffmpeg: {e}")
        return False


def _extract_audio_with_moviepy(video_path: str, audio_path: str) -> bool:
    """
    Extract audio from video using moviepy as fallback.
    Returns True if successful, False otherwise.
    """
    try:
        from moviepy.editor import VideoFileClip
        
        logger.info("Extracting audio using moviepy...")
        video = VideoFileClip(video_path)
        
        if video.audio is None:
            logger.error("Video file has no audio track")
            video.close()
            return False
        
        video.audio.write_audiofile(
            audio_path,
            fps=16000,  # 16kHz
            nbytes=2,   # 16-bit
            codec='pcm_s16le'
        )
        
        video.close()
        logger.info("Successfully extracted audio using moviepy")
        return True
        
    except ImportError:
        logger.error("moviepy not installed")
        return False
    except Exception as e:
        logger.error(f"Error extracting audio with moviepy: {e}")
        return False


# ─────────────────────────────────────────────────────────────────────────────
# Transcription  (Google Cloud Speech-to-Text)
# ─────────────────────────────────────────────────────────────────────────────

async def transcribe_video(file: UploadFile) -> str:
    """
    Transcribe an uploaded video/audio file using Google Cloud Speech-to-Text API.

    Flow:
      1. Save the upload to a temp file
      2. If video, extract audio to WAV format (16kHz, mono)
      3. Upload audio content to Google Cloud Speech-to-Text
      4. Get transcription result
      5. Return transcript text
    """
    # Check for credentials
    if not GOOGLE_APPLICATION_CREDENTIALS and not GOOGLE_CLOUD_API_KEY:
        raise RuntimeError(
            "Google Cloud credentials not set. Set GOOGLE_APPLICATION_CREDENTIALS in .env file. "
            "See GOOGLE_CLOUD_SETUP.md for instructions."
        )
    
    logger.info(f"Starting transcription for file: {file.filename}")
    
    # --- 1. Save upload to temp file ---
    suffix = os.path.splitext(file.filename or "upload.mp4")[1] or ".mp4"
    video_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    video_path = video_tmp.name
    
    try:
        # Write uploaded file
        file.file.seek(0)
        video_tmp.write(await file.read())
        video_tmp.close()
        
        # --- 2. Extract/prepare audio ---
        # Check if file is already audio or needs extraction
        audio_extensions = {'.mp3', '.wav', '.flac', '.ogg', '.opus', '.m4a'}
        video_extensions = {'.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv'}
        
        audio_path = None
        needs_extraction = suffix.lower() in video_extensions
        
        if needs_extraction:
            logger.info("Video file detected, extracting audio...")
            audio_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
            audio_path = audio_tmp.name
            audio_tmp.close()
            
            # Try ffmpeg first, then moviepy as fallback
            if not _extract_audio_from_video(video_path, audio_path):
                logger.info("Trying moviepy as fallback for audio extraction...")
                if not _extract_audio_with_moviepy(video_path, audio_path):
                    raise RuntimeError(
                        "Failed to extract audio from video. Please install ffmpeg or moviepy."
                    )
        else:
            # Audio file - use directly
            logger.info("Audio file detected, using directly")
            audio_path = video_path
        
        # --- 3. Read audio file ---
        with open(audio_path, 'rb') as audio_file:
            audio_content = audio_file.read()
        
        # Check file size (Google Cloud Speech-to-Text has a 10MB limit for synchronous requests)
        audio_size_mb = len(audio_content) / (1024 * 1024)
        logger.info(f"Audio file size: {audio_size_mb:.2f} MB")
        
        if audio_size_mb > 10:
            # For files > 10MB, we need to use async recognition or split the file
            logger.warning(f"Audio file is {audio_size_mb:.2f} MB (>10MB limit for sync API)")
            logger.info("Using chunked transcription for large file...")
            return await _transcribe_large_audio(audio_content, audio_path)
        
        # --- 4. Call Google Cloud Speech-to-Text API using client library ---
        try:
            from google.cloud import speech
            from google.oauth2 import service_account
            
            # Initialize client with credentials
            if GOOGLE_APPLICATION_CREDENTIALS:
                # Use service account credentials
                credentials = service_account.Credentials.from_service_account_file(
                    GOOGLE_APPLICATION_CREDENTIALS
                )
                client = speech.SpeechClient(credentials=credentials)
                logger.info("Using service account credentials for Speech-to-Text")
            else:
                # Try to use application default credentials or API key fallback
                client = speech.SpeechClient()
                logger.info("Using application default credentials for Speech-to-Text")
            
            # Prepare audio and config
            audio = speech.RecognitionAudio(content=audio_content)
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code="en-US",
                enable_automatic_punctuation=True,
                model="default",
                use_enhanced=True
            )
            
            logger.info("Sending audio to Google Cloud Speech-to-Text...")
            response = client.recognize(config=config, audio=audio)
            
            # Convert response to dict-like structure for compatibility
            result = {"results": []}
            for speech_result in response.results:
                result["results"].append({
                    "alternatives": [{
                        "transcript": speech_result.alternatives[0].transcript
                    }]
                })
                
        except Exception as api_error:
            error_str = str(api_error)
            logger.error(f"Speech-to-Text API error: {error_str}")
            
            if "UNAUTHENTICATED" in error_str or "401" in error_str:
                raise RuntimeError(
                    "Authentication failed. Google Cloud Speech-to-Text requires service account credentials. "
                    "Please set GOOGLE_APPLICATION_CREDENTIALS in .env. See GOOGLE_CLOUD_SETUP.md"
                )
            elif "PERMISSION_DENIED" in error_str or "403" in error_str:
                raise RuntimeError(
                    "Permission denied. Ensure Cloud Speech-to-Text API is enabled: "
                    "https://console.cloud.google.com/apis/library/speech.googleapis.com"
                )
            else:
                raise RuntimeError(f"Speech-to-Text API error: {error_str}")
        
        # --- 5. Extract transcript ---
        if not result.get('results'):
            logger.warning("No speech detected in audio")
            return "[No speech detected in the audio]"
        
        # Combine all transcript alternatives
        transcript_parts = []
        for result_item in result['results']:
            if result_item.get('alternatives'):
                transcript_parts.append(result_item['alternatives'][0]['transcript'])
        
        transcript_text = ' '.join(transcript_parts)
        logger.info(f"Transcription complete. Length: {len(transcript_text)} characters")
        
        return transcript_text
        
    finally:
        # Cleanup temp files
        try:
            os.unlink(video_path)
            if audio_path and audio_path != video_path and os.path.exists(audio_path):
                os.unlink(audio_path)
        except Exception as cleanup_err:
            logger.warning(f"Error cleaning up temp files: {cleanup_err}")


async def _transcribe_large_audio(audio_content: bytes, audio_path: str) -> str:
    """
    Transcribe large audio files (>10MB) using Google Cloud Storage and LongRunningRecognize API.
    
    Steps:
    1. Upload audio to GCS bucket
    2. Use long-running recognize with GCS URI
    3. Poll for operation completion
    4. Clean up GCS file
    5. Return transcript
    """
    logger.info("Transcribing large audio file using GCS and long-running API...")
    
    try:
        from google.cloud import speech, storage
        from google.oauth2 import service_account
        
        # Initialize credentials
        if GOOGLE_APPLICATION_CREDENTIALS:
            credentials = service_account.Credentials.from_service_account_file(
                GOOGLE_APPLICATION_CREDENTIALS
            )
            project_id = GOOGLE_CLOUD_PROJECT_ID or credentials.project_id
        else:
            logger.error("GOOGLE_APPLICATION_CREDENTIALS required for large audio files")
            return "[Transcription failed: Credentials required for files over 10MB]"
        
        # Initialize clients
        speech_client = speech.SpeechClient(credentials=credentials)
        storage_client = storage.Client(credentials=credentials, project=project_id)
        
        # Get or create bucket
        bucket_name = GOOGLE_CLOUD_STORAGE_BUCKET
        if not bucket_name:
            # Use a default bucket name based on project
            bucket_name = f"{project_id}-pasmi-audio"
            logger.info(f"No GOOGLE_CLOUD_STORAGE_BUCKET set, using default: {bucket_name}")
        
        # Get or create the bucket
        try:
            bucket = storage_client.get_bucket(bucket_name)
            logger.info(f"Using existing GCS bucket: {bucket_name}")
        except Exception:
            # Bucket doesn't exist, create it
            logger.info(f"Creating GCS bucket: {bucket_name}")
            bucket = storage_client.create_bucket(bucket_name, location="us-central1")
        
        # Upload audio file to GCS
        blob_name = f"audio-transcribe/{uuid.uuid4()}.wav"
        blob = bucket.blob(blob_name)
        
        logger.info(f"Uploading audio to GCS: gs://{bucket_name}/{blob_name}")
        blob.upload_from_filename(audio_path)
        gcs_uri = f"gs://{bucket_name}/{blob_name}"
        logger.info(f"Audio uploaded successfully to {gcs_uri}")
        
        # Configure long-running recognition
        audio = speech.RecognitionAudio(uri=gcs_uri)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code="en-US",
            enable_automatic_punctuation=True,
            model="default",
            use_enhanced=True
        )
        
        # Start long-running recognition
        logger.info("Starting long-running transcription...")
        operation = speech_client.long_running_recognize(config=config, audio=audio)
        
        # Poll for completion (with timeout)
        logger.info("Waiting for transcription to complete...")
        max_wait_time = 600  # 10 minutes max
        start_time = time.time()
        
        while not operation.done():
            elapsed = time.time() - start_time
            if elapsed > max_wait_time:
                logger.error(f"Transcription timed out after {max_wait_time} seconds")
                blob.delete()  # Clean up
                return "[Transcription timed out]"
            
            logger.info(f"Transcription in progress... ({elapsed:.0f}s elapsed)")
            time.sleep(10)  # Check every 10 seconds
        
        # Get result
        response = operation.result()
        
        # Extract transcript FIRST (before cleanup, so we don't lose it if cleanup fails)
        if response.results:
            transcript_parts = [
                result.alternatives[0].transcript
                for result in response.results
                if result.alternatives
            ]
            transcript = ' '.join(transcript_parts)
            logger.info(f"Long-running transcription complete. Length: {len(transcript)} characters")
        else:
            logger.warning("No speech detected in audio")
            transcript = "[No speech detected in the audio]"
        
        # Clean up GCS file (non-blocking - don't fail transcription if cleanup fails)
        try:
            logger.info(f"Deleting temporary GCS file: {gcs_uri}")
            blob.delete()
            logger.info("Temporary file deleted successfully")
        except Exception as cleanup_error:
            # Log the error but don't fail the transcription
            logger.warning(f"Failed to delete temporary file (transcription succeeded): {cleanup_error}")
            logger.warning("You may want to manually clean up GCS files or grant storage.objects.delete permission")
        
        return transcript
            
    except ImportError as e:
        logger.error(f"Required Google Cloud libraries not available: {e}")
        logger.info("Please install: pip install google-cloud-speech google-cloud-storage")
        return "[Transcription unavailable: Missing required libraries]"
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Large audio transcription failed: {error_msg}")
        
        # Provide helpful error messages
        if 'storage.buckets.create' in error_msg:
            logger.error(
                "[FIX REQUIRED] Service account lacks 'storage.buckets.create' permission. "
                "See GOOGLE_CLOUD_FIXES_REQUIRED.md for instructions."
            )
            return "[Transcription failed: GCS bucket permission error - See GOOGLE_CLOUD_FIXES_REQUIRED.md]"
        elif 'PERMISSION_DENIED' in error_msg or '403' in error_msg:
            logger.error(
                "[FIX REQUIRED] Permission denied. Check Cloud Storage API is enabled and "
                "service account has proper roles."
            )
            return "[Transcription failed: Permission denied - Check Google Cloud permissions]"
        else:
            return f"[Transcription failed: {error_msg[:100]}]"


# ─────────────────────────────────────────────────────────────────────────────
# Content Metadata Generation (Local keyword-based generation)
# ─────────────────────────────────────────────────────────────────────────────
async def generate_content_metadata(transcript: str) -> tuple[list[str], str]:
    """
    Generate multiple social titles/captions and hashtags from the transcript.
    Uses local keyword extraction and template-based generation.

    Returns (list_of_titles, hashtags_string).
    """
    if not transcript or len(transcript.strip()) < 10:
        return [
            "Amazing Video Content!",
            "Must-Watch Video!",
            "New Upload - Check This Out!",
            "Don't Miss This!"
        ], "#video #content #viral #trending"
    
    # Extract key information from transcript
    words = transcript.split()
    transcript_lower = transcript.lower()
    
    # Get first sentence or first 50 words for context
    sentences = transcript.split('.')
    first_sentence = sentences[0] if sentences else ' '.join(words[:50])
    
    # Extract subject if detected
    subject_data = _predict_video_topic_from_transcript(transcript)
    subject = subject_data.get('subject', 'content')
    
    # Generate click-worthy titles based on content
    if subject and subject != 'professional content':
        # Specific subject detected
        subject_title = subject.upper() if len(subject) <= 10 else subject.title()
        titles = [
            f"{subject_title} Tutorial - Everything You Need to Know!",
            f"Learn {subject_title}: Complete Guide",
            f"Master {subject_title} in Minutes!",
            f"{subject_title} Explained Simply"
        ]
        
        # Generate relevant hashtags
        hashtags = f"#{subject} #tutorial #learn #guide #howto #education #tips #tricks"
    else:
        # General content - use transcript context
        key_words = [w for w in words[:20] if len(w) > 4]
        context_words = ' '.join(key_words[:3]) if key_words else 'Video'
        
        titles = [
            f"{context_words.title()} - Must Watch!",
            f"Amazing {context_words.title()} Content!",
            f"Everything About {context_words.title()}",
            f"The Ultimate {context_words.title()} Guide"
        ]
        
        hashtags = "#video #content #viral #trending #mustwatch #youtube #shorts"
    
    # Ensure titles are under 150 characters
    titles = [t[:147] + '...' if len(t) > 150 else t for t in titles]
    
    logger.info(f"[METADATA] Generated {len(titles)} titles and hashtags")
    return titles, hashtags


# ─────────────────────────────────────────────────────────────────────────────
# Thumbnail Image Generation  (Google Cloud — Imagen 3)
# ─────────────────────────────────────────────────────────────────────────────

def _predict_video_topic_from_transcript(transcript: str) -> dict:
    """
    Extract the actual subject/message from the transcript to create specific thumbnail visuals.
    Instead of broad categories (tech, business), this extracts what the person is actually teaching/showing.
    
    Example: "CSS tutorial" -> thumbnail with CSS logo and person at computer
    Example: "Python functions" -> thumbnail with Python logo and code on screen
    Example: "pasta recipe" -> thumbnail with pasta dish and cooking scene
    
    Returns a dictionary with the specific subject, relevant visual elements, and scene description.
    """
    if not transcript or len(transcript.strip()) < 10:
        return {
            'subject': 'professional content',
            'visual_elements': [],
            'scene_description': 'professional YouTuber setup, modern background, engaging composition',
            'confidence': 0.0
        }
    
    transcript_lower = transcript.lower()
    words = transcript.split()
    
    # Extract key subjects and technologies with their visual representations
    subject_patterns = {
        # Programming & Web Development
        'css': {'visual_elements': ['CSS3 logo', 'code editor on screen', 'person at computer'],
                'scene': 'modern developer workspace, CSS code visible on screen, professional lighting'},
        'html': {'visual_elements': ['HTML5 logo', 'web browser', 'code editor', 'person at desk'],
                 'scene': 'web development setup, HTML code on screen, modern tech workspace'},
        'javascript': {'visual_elements': ['JavaScript logo', 'code on screen', 'developer at computer'],
                       'scene': 'programming environment, JS code visible, professional developer setup'},
        'python': {'visual_elements': ['Python logo', 'code editor', 'terminal window', 'programmer'],
                   'scene': 'Python development workspace, code on screen, technical setup'},
        'react': {'visual_elements': ['React logo', 'code editor', 'developer workspace'],
                  'scene': 'React development setup, component code visible, modern tech environment'},
        'programming': {'visual_elements': ['code on screen', 'multiple monitors', 'developer at keyboard'],
                        'scene': 'professional programming workspace, code visible, technical atmosphere'},
        
        # Design & Creative
        'photoshop': {'visual_elements': ['Photoshop logo', 'design workspace', 'creative at computer'],
                      'scene': 'creative workspace, Photoshop interface visible, artistic setup'},
        'design': {'visual_elements': ['design tools', 'creative workspace', 'designer at work'],
                   'scene': 'modern design studio, creative tools visible, artistic environment'},
        'drawing': {'visual_elements': ['drawing tablet', 'stylus', 'artist at work', 'artwork'],
                    'scene': 'digital art workspace, tablet and screen setup, creative atmosphere'},
        
        # Cooking & Food
        'recipe': {'visual_elements': ['finished dish', 'cooking ingredients', 'kitchen setup'],
                   'scene': 'professional kitchen, delicious food presentation, cooking in progress'},
        'cooking': {'visual_elements': ['chef cooking', 'food preparation', 'kitchen tools', 'ingredients'],
                    'scene': 'cooking demonstration, food being prepared, inviting kitchen atmosphere'},
        'baking': {'visual_elements': ['baked goods', 'oven', 'baking tools', 'baker at work'],
                   'scene': 'baking kitchen, fresh baked items, warm inviting atmosphere'},
        
        # Fitness & Health
        'workout': {'visual_elements': ['person exercising', 'gym equipment', 'fitness pose'],
                    'scene': 'gym environment, workout in action, energetic athletic atmosphere'},
        'yoga': {'visual_elements': ['yoga pose', 'yoga mat', 'peaceful setting'],
                 'scene': 'yoga studio, person in yoga pose, calm peaceful lighting'},
        'exercise': {'visual_elements': ['athletic person', 'exercise equipment', 'workout gear'],
                     'scene': 'fitness environment, exercise demonstration, motivational setup'},
        
        # Gaming
        'minecraft': {'visual_elements': ['Minecraft logo', 'game screenshot', 'gamer at setup'],
                      'scene': 'gaming setup with Minecraft visible, RGB lighting, gaming atmosphere'},
        'gaming': {'visual_elements': ['game controller', 'gaming PC', 'game on screen', 'gamer'],
                   'scene': 'gaming setup, colorful RGB lighting, game visible on screen'},
        'fortnite': {'visual_elements': ['Fortnite logo', 'game scene', 'gaming setup'],
                     'scene': 'gaming environment with Fortnite, vibrant colors, gaming atmosphere'},
        
        # Business & Finance
        'business': {'visual_elements': ['business person', 'office setting', 'professional attire'],
                     'scene': 'modern office, business professional, corporate environment'},
        'marketing': {'visual_elements': ['marketing charts', 'professional at desk', 'presentation'],
                      'scene': 'marketing workspace, analytics visible, professional business setup'},
        
        # Tutorial & Education
        'tutorial': {'visual_elements': ['instructor', 'teaching materials', 'educational setup'],
                     'scene': 'educational environment, clear teaching setup, professional instruction'},
        'course': {'visual_elements': ['instructor teaching', 'learning materials', 'educational space'],
                   'scene': 'course environment, instructor visible, educational atmosphere'},
        'guide': {'visual_elements': ['demonstration', 'step-by-step visuals', 'instructor'],
                  'scene': 'instructional setup, clear demonstration, guide presentation'},
    }
    
    # Find matching subjects in transcript
    detected_subjects = []
    for subject, details in subject_patterns.items():
        count = transcript_lower.count(subject)
        if count > 0:
            detected_subjects.append({
                'subject': subject,
                'count': count,
                'visual_elements': details['visual_elements'],
                'scene': details['scene']
            })
    
    # Sort by frequency
    detected_subjects.sort(key=lambda x: x['count'], reverse=True)
    
    if detected_subjects:
        # Use the most frequent subject
        primary = detected_subjects[0]
        
        # Extract context from transcript (first meaningful sentence)
        sentences = transcript.split('.')
        context = sentences[0][:100] if sentences else ' '.join(words[:15])
        
        result = {
            'subject': primary['subject'],
            'visual_elements': primary['visual_elements'],
            'scene_description': primary['scene'],
            'confidence': min(1.0, primary['count'] / len(words) * 10),
            'context': context
        }
        
        logger.info(f"[SUBJECT] VIDEO SUBJECT DETECTED: {primary['subject'].upper()}")
        logger.info(f"[VISUAL ELEMENTS] {', '.join(primary['visual_elements'][:3])}")
        
        return result
    else:
        # No specific subject detected - extract general description from transcript
        # Use the most frequent meaningful words as hints
        word_freq = {}
        for word in words:
            if len(word) > 4:  # Only meaningful words
                word_lower = word.lower()
                word_freq[word_lower] = word_freq.get(word_lower, 0) + 1
        
        top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:3]
        subject_hint = ' '.join([w[0] for w in top_words]) if top_words else 'content'
        
        result = {
            'subject': f"about {subject_hint}",
            'visual_elements': ['professional presenter', 'modern setup', 'engaging background'],
            'scene_description': 'professional YouTube setup, presenter visible, modern clean background, good lighting',
            'confidence': 0.2,
            'context': ' '.join(words[:20])
        }
        
        logger.info(f"[SUBJECT] GENERAL CONTENT DETECTED: {subject_hint}")
        return result


def _generate_image_prompt_from_transcript(transcript: str) -> str:
    """
    Generate a specific, content-focused image prompt based on what the video is actually about.
    
    Example: CSS tutorial -> "CSS3 logo prominently displayed, person sitting at computer coding, 
                              code editor visible on screen showing CSS code"
    """
    # Extract the actual subject/message from transcript
    subject_data = _predict_video_topic_from_transcript(transcript)
    
    if not transcript or len(transcript.strip()) < 10:
        return "Professional YouTube thumbnail, engaging presenter in modern setup, vibrant colors, high quality, 16:9 aspect ratio"
    
    subject = subject_data['subject']
    visual_elements = subject_data['visual_elements']
    scene = subject_data['scene_description']
    confidence = subject_data['confidence']
    
    # Build a specific prompt with actual visual elements
    if confidence > 0.3 and visual_elements:
        # High confidence - create detailed scene with specific elements
        elements_str = ', '.join(visual_elements[:3])  # Use top 3 visual elements
        prompt = (
            f"Professional YouTube thumbnail showing {elements_str}, {scene}, "
            f"photorealistic, high quality, vibrant colors, eye-catching composition, "
            f"clear and engaging, professional lighting, 16:9 aspect ratio"
        )
        logger.info(f"[PROMPT] SPECIFIC SUBJECT: {subject}")
        logger.info(f"[PROMPT] Visual elements: {elements_str}")
    else:
        # Lower confidence - use general description with context
        prompt = (
            f"Professional YouTube thumbnail about {subject}, "
            f"{scene}, photorealistic, vibrant colors, high quality, "
            f"engaging composition, professional lighting, 16:9 aspect ratio"
        )
        logger.info(f"[PROMPT] GENERAL SUBJECT: {subject}")
    
    logger.info(f"[PROMPT] Generated prompt: {prompt[:120]}...")
    return prompt


async def generate_thumbnail_images(transcript: str, count: int = 2) -> list[str]:
    """
    Use Google Cloud Imagen 3 to create content-specific thumbnails based on video transcript.
    Returns a list of base64 encoded data URLs.
    
    INTELLIGENT THUMBNAIL GENERATION WORKFLOW:
    ==========================================
    STEP 1: Extract audio from video (ffmpeg) - Done before this function
    STEP 2: Transcribe audio to text (Google Speech-to-Text) - Done before this function
    STEP 3: Detect actual video subject/message - THIS FUNCTION DOES THIS
    STEP 4: Generate content-specific image prompts - THIS FUNCTION DOES THIS
    STEP 5: Create 2 thumbnail variations with Imagen 3 - THIS FUNCTION DOES THIS
    
    Example: If transcript mentions CSS tutorial, the thumbnail will include CSS logo,
    person at computer, and code on screen - giving viewers a clear preview of content.
    
    Generates 2 thumbnails (instead of 3) to avoid quota limit issues.
    """
    logger.info(f"="*60)
    logger.info(f"CONTENT-SPECIFIC THUMBNAIL GENERATION")
    logger.info(f"="*60)
    logger.info(f"[TRANSCRIPT] Length: {len(transcript)} characters")
    logger.info(f"[THUMBNAILS] Count to generate: {count}")
    
    # Check for credentials
    if not GOOGLE_APPLICATION_CREDENTIALS and not GOOGLE_CLOUD_PROJECT_ID:
        logger.error("[ERROR] Google Cloud credentials not set. Falling back to placeholder thumbnails.")
        return _generate_placeholder_thumbnails(transcript, count)
    
    # Check if transcript is actually an error message
    if transcript.startswith('[') and 'failed' in transcript.lower():
        logger.warning(f"[WARNING] Transcript is an error message, using fallback")
        transcript = "General video content"
    
    # STEP 3: Detect actual video subject/message from transcript
    logger.info(f"")
    logger.info(f"[STEP 3] Analyzing transcript to detect video subject...")
    subject_data = _predict_video_topic_from_transcript(transcript)
    subject = subject_data.get('subject', 'VIDEO')
    base_prompt = _generate_image_prompt_from_transcript(transcript)
    
    # STEP 4 & 5: Generate thumbnails using Google Cloud Imagen 3
    logger.info(f"")
    logger.info(f"[STEP 4-5] Generating thumbnails with Imagen 3...")
    images = []
    
    try:
        from vertexai.preview.vision_models import ImageGenerationModel
        from google.oauth2 import service_account
        import vertexai
        
        # Initialize Vertex AI
        if GOOGLE_APPLICATION_CREDENTIALS:
            credentials = service_account.Credentials.from_service_account_file(
                GOOGLE_APPLICATION_CREDENTIALS
            )
            project_id = GOOGLE_CLOUD_PROJECT_ID or credentials.project_id
            vertexai.init(project=project_id, location="us-central1", credentials=credentials)
            logger.info("[SUCCESS] Initialized Vertex AI with service account credentials")
        else:
            # Try with project ID only (uses application default credentials)
            vertexai.init(project=GOOGLE_CLOUD_PROJECT_ID, location="us-central1")
            logger.info("[SUCCESS] Initialized Vertex AI with default credentials")
        
        # Load Imagen 3 model
        model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-001")
        
        # Create 2 prompt variations to avoid quota issues
        # Each variation offers a different composition style
        prompt_variations = [
            # Variation 1: Balanced professional composition
            {
                'prompt': f"{base_prompt}, centered composition, balanced framing, professional studio quality",
                'style': 'Balanced Professional'
            },
            # Variation 2: Dynamic angled composition
            {
                'prompt': f"{base_prompt}, dynamic angle, depth and dimension, eye-catching perspective",
                'style': 'Dynamic Perspective'
            }
        ]
        
        logger.info(f"")
        for i in range(count):
            # Use different prompt variations for diversity
            variation = prompt_variations[i % len(prompt_variations)]
            varied_prompt = variation['prompt']
            style_name = variation['style']
            
            try:
                logger.info(f"[GENERATING] Thumbnail {i+1}/{count} ({style_name})...")
                logger.debug(f"   Prompt: {varied_prompt[:120]}...")
                
                # Generate image with optimized parameters for thumbnails
                # Add text overlay to prompt for better thumbnail readability
                text_overlay = f"with bold text overlay saying '{subject.upper() if len(subject) <= 20 else 'TUTORIAL'}'"
                prompt_with_text = f"{varied_prompt}, {text_overlay}"
                
                response = model.generate_images(
                    prompt=prompt_with_text,
                    number_of_images=1
                    # Note: Parameters like add_watermark, safety_filter_level, person_generation
                    # are not supported in version 1.38.0
                )
                
                # Get the generated image
                if response.images:
                    image = response.images[0]
                    # Convert to base64
                    image_bytes = image._image_bytes
                    image_b64 = base64.b64encode(image_bytes).decode('utf-8')
                    images.append(f"data:image/png;base64,{image_b64}")
                    logger.info(f"   [SUCCESS] Generated thumbnail {i+1} ({style_name})")
                else:
                    logger.error(f"   [ERROR] No image generated for thumbnail {i+1}")
                    
            except Exception as img_error:
                error_str = str(img_error)
                logger.error(f"   [ERROR] Failed to generate thumbnail {i+1}: {error_str}")
                
                # Check for quota errors
                if "429" in error_str or "Quota exceeded" in error_str:
                    logger.warning(f"[WARNING] Quota exceeded, stopping at {len(images)} thumbnails")
                    break  # Stop trying if we hit quota
                continue
            
            # Small delay between requests to avoid rate limiting
            if i < count - 1:
                time.sleep(2)  # Increased to 2 seconds to avoid quota issues
                
    except ImportError as e:
        logger.error(f"[ERROR] Vertex AI SDK not available: {e}")
        logger.info("Falling back to placeholder thumbnails")
        return _generate_placeholder_thumbnails(transcript, count)
    except Exception as e:
        logger.error(f"[ERROR] Imagen 3 initialization failed: {e}")
        logger.info("Falling back to placeholder thumbnails")
        return _generate_placeholder_thumbnails(transcript, count)
    
    # If no thumbnails were generated, return placeholder thumbnails
    if not images:
        logger.warning("[WARNING] No thumbnails generated from Google Cloud Imagen 3. Using placeholder thumbnails.")
        images = _generate_placeholder_thumbnails(transcript, count)
    else:
        logger.info(f"")
        logger.info(f"[SUCCESS] Generated {len(images)} thumbnail(s)")
        
    logger.info(f"="*60)
    return images


def _generate_placeholder_thumbnails(transcript: str, count: int = 3) -> list[str]:
    """
    Generate simple placeholder thumbnail images when Bedrock is unavailable.
    Returns SVG data URLs with gradient backgrounds and text.
    """
    import hashlib
    
    # Extract first few words from transcript for thumbnail text
    words = transcript.split()[:3] if transcript else ["Your", "Video", "Here"]
    title_text = " ".join(words)[:30]
    
    # Generate color based on transcript hash for consistency
    hash_val = int(hashlib.md5(transcript.encode()).hexdigest()[:8], 16)
    
    colors = [
        ["#FF6B6B", "#4ECDC4"],  # Red to Teal
        ["#A8E6CF", "#FFD3B6"],  # Mint to Peach
        ["#667EEA", "#764BA2"],  # Purple to Violet
        ["#F093FB", "#F5576C"],  # Pink to Red
        ["#4FACFE", "#00F2FE"],  # Blue to Cyan
        ["#43E97B", "#38F9D7"],  # Green to Cyan
    ]
    
    thumbnails = []
    for i in range(count):
        color_pair = colors[(hash_val + i) % len(colors)]
        
        svg = f'''<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad{i}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{color_pair[0]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:{color_pair[1]};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad{i})"/>
  <text x="256" y="230" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle" opacity="0.9">{title_text}</text>
  <text x="256" y="280" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" opacity="0.7">Generated by PASMI AI</text>
  <circle cx="256" cy="320" r="40" fill="white" opacity="0.2"/>
  <polygon points="240,310 240,330 270,320" fill="white" opacity="0.9"/>
</svg>'''
        
        import base64
        svg_b64 = base64.b64encode(svg.encode()).decode()
        thumbnails.append(f"data:image/svg+xml;base64,{svg_b64}")
    
    return thumbnails

