#!/usr/bin/env python3
"""
Granola Transcript Sync Tool
Automatically pulls meeting transcripts from Granola and saves them to the inbox.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
import subprocess

try:
    import requests
except ImportError:
    print("Installing required dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests


class GranolaSync:
    """Syncs Granola meeting notes and transcripts."""

    def __init__(self):
        self.api_base = "https://api.granola.ai/v2"
        self.output_dir = Path.home() / "Documents" / "LLM CONTEXT" / "WORK" / "DWA-PROJECT-HOME" / "00-inbox" / "transcripts"
        self.credentials_path = Path.home() / "Library" / "Application Support" / "Granola" / "supabase.json"
        self.token = None

    def load_credentials(self):
        """Load authentication token from Granola credentials."""
        try:
            with open(self.credentials_path) as f:
                creds = json.load(f)

                # workos_tokens is a JSON string, not a dict
                workos_tokens_str = creds.get("workos_tokens", "{}")
                if isinstance(workos_tokens_str, str):
                    workos_tokens = json.loads(workos_tokens_str)
                else:
                    workos_tokens = workos_tokens_str

                self.token = workos_tokens.get("access_token")
                if not self.token:
                    print("❌ Could not find access token in credentials")
                    return False
                return True
        except FileNotFoundError:
            print(f"❌ Credentials not found at {self.credentials_path}")
            print("   Make sure Granola is installed and you're logged in")
            return False
        except json.JSONDecodeError as e:
            print(f"❌ Could not parse credentials file: {e}")
            return False

    def fetch_documents(self, limit=100, offset=0):
        """Fetch documents from Granola API."""
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
            "User-Agent": "Granola/5.354.0",
            "X-Client-Version": "5.354.0"
        }

        payload = {
            "limit": limit,
            "offset": offset,
            "include_last_viewed_panel": True
        }

        try:
            response = requests.post(
                f"{self.api_base}/get-documents",
                headers=headers,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"❌ API request failed: {e}")
            return None

    def prosemirror_to_text(self, doc):
        """Convert ProseMirror JSON to plain text."""
        if not doc or "content" not in doc:
            return ""

        text_parts = []

        def extract_text(node):
            if isinstance(node, dict):
                # Handle text nodes
                if node.get("type") == "text":
                    text_parts.append(node.get("text", ""))

                # Recursively process content
                if "content" in node:
                    for child in node["content"]:
                        extract_text(child)

                # Add line breaks for paragraphs and headings
                if node.get("type") in ["paragraph", "heading"]:
                    text_parts.append("\n\n")
            elif isinstance(node, list):
                for item in node:
                    extract_text(item)

        extract_text(doc)
        return "".join(text_parts).strip()

    def save_document(self, doc, include_full_note=False):
        """Save a document to the transcripts directory."""
        doc_id = doc.get("id", "unknown")
        title = doc.get("title", "Untitled")
        created_at = doc.get("created_at", "")

        # Check if we've already saved this document (by doc ID)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        for existing_file in self.output_dir.glob("*.md"):
            if existing_file.name == ".gitkeep":
                continue
            try:
                with open(existing_file, 'r') as f:
                    # Check first few lines for document ID
                    for i, line in enumerate(f):
                        if i > 10:  # Only check first 10 lines
                            break
                        if f"**Document ID:** {doc_id}" in line or f"<!-- doc-id: {doc_id} -->" in line:
                            return existing_file  # Already saved, skip
            except:
                continue

        # Parse date for filename
        try:
            date_obj = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            date_str = date_obj.strftime("%Y-%m-%d")
        except:
            date_str = "no-date"

        # Clean title for filename
        safe_title = "".join(c if c.isalnum() or c in (' ', '-', '_') else '-' for c in title)
        safe_title = safe_title.replace(' ', '-')[:50]  # Limit length

        filename = f"{date_str}_{safe_title}.md"
        filepath = self.output_dir / filename

        # Handle filename collisions by appending number
        counter = 1
        while filepath.exists():
            filename = f"{date_str}_{safe_title}-{counter}.md"
            filepath = self.output_dir / filename
            counter += 1

        # Extract transcript if available
        transcript = ""
        transcription_doc = doc.get("transcription", {}).get("transcriptionDoc")
        if transcription_doc:
            transcript = self.prosemirror_to_text(transcription_doc)

        # Build content
        content = f"# {title}\n\n"
        content += f"**Date:** {created_at}\n"
        content += f"**Document ID:** {doc_id}\n\n"

        if transcript:
            content += "## Transcript\n\n"
            content += transcript
            content += "\n\n"

        if include_full_note:
            note_content = doc.get("content")
            if note_content:
                note_text = self.prosemirror_to_text(note_content)
                if note_text:
                    content += "## Meeting Notes\n\n"
                    content += note_text

        # Save file
        self.output_dir.mkdir(parents=True, exist_ok=True)
        with open(filepath, 'w') as f:
            f.write(content)

        return filepath

    def sync(self, days=7, include_notes=False):
        """Sync recent documents from Granola."""
        print("🔄 Syncing Granola transcripts...")

        if not self.load_credentials():
            return False

        print(f"✓ Authenticated with Granola API")

        # Fetch documents
        data = self.fetch_documents(limit=100)
        if not data:
            return False

        documents = data.get("docs", [])
        print(f"✓ Found {len(documents)} documents")

        # Filter by date if specified
        if days:
            cutoff = datetime.now().timestamp() - (days * 24 * 60 * 60)
            documents = [
                doc for doc in documents
                if datetime.fromisoformat(doc.get("created_at", "").replace("Z", "+00:00")).timestamp() > cutoff
            ]
            print(f"✓ Filtered to {len(documents)} documents from last {days} days")

        # Save documents
        saved_count = 0
        skipped_count = 0
        for doc in documents:
            try:
                filepath = self.save_document(doc, include_full_note=include_notes)
                if filepath:
                    # Check if file was just created (has recent timestamp) vs already existed
                    import time
                    if (time.time() - filepath.stat().st_mtime) < 10:  # Created in last 10 seconds
                        print(f"  ✓ {filepath.name}")
                        saved_count += 1
                    else:
                        skipped_count += 1
            except Exception as e:
                print(f"  ✗ Failed to save {doc.get('title', 'unknown')}: {e}")

        result_msg = f"\n✅ Saved {saved_count} new transcript(s)"
        if skipped_count > 0:
            result_msg += f", skipped {skipped_count} existing"
        result_msg += f" to {self.output_dir}"
        print(result_msg)
        return True


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Sync Granola meeting transcripts to your DWA project inbox"
    )
    parser.add_argument(
        "--days",
        type=int,
        default=7,
        help="Number of days to look back (default: 7)"
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Sync all documents (ignore --days)"
    )
    parser.add_argument(
        "--include-notes",
        action="store_true",
        help="Include full meeting notes in addition to transcripts"
    )

    args = parser.parse_args()

    syncer = GranolaSync()
    days = None if args.all else args.days
    success = syncer.sync(days=days, include_notes=args.include_notes)

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
