# Inbox

Staging area for content before it's organized into the proper location in the DWA project.

## Transcripts

Meeting transcripts automatically synced from Granola are stored in `transcripts/`.

### Syncing Granola Transcripts

Use the `sync-granola.py` script in the project root to automatically pull meeting transcripts:

```bash
# Sync last 7 days of transcripts
python3 sync-granola.py

# Sync all transcripts
python3 sync-granola.py --all

# Sync last 30 days
python3 sync-granola.py --days 30

# Include full meeting notes in addition to transcripts
python3 sync-granola.py --include-notes
```

**What it does:**
- Pulls meeting transcripts from Granola API
- Saves each meeting as a markdown file with format: `YYYY-MM-DD_Meeting-Title.md`
- Includes meeting metadata (date, document ID)
- Extracts transcripts automatically

**Requirements:**
- Granola app must be installed and you must be logged in
- Python 3.7+ with `requests` library (auto-installed on first run)

### Processing Transcripts

After syncing:
1. Review transcripts in `00-inbox/transcripts/`
2. Extract key insights and action items
3. Move relevant content to appropriate departments/projects
4. Archive or delete the transcript file once processed
