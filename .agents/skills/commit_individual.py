#!/usr/bin/env python3
import subprocess
import sys
import os

def run_command(cmd, input_data=None):
    result = subprocess.run(
        cmd,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        input=input_data
    )
    return result.returncode, result.stdout.strip(), result.stderr.strip()

def run_command_raw(cmd):
    result = subprocess.run(
        cmd,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    return result.returncode, result.stdout, result.stderr

def get_git_status():
    # Get unstaged (modified) and untracked files with raw stdout
    _, stdout, _ = run_command_raw("git status --porcelain")
    if not stdout:
        return []
    
    files = []
    for line in stdout.split("\n"):
        if not line or len(line) < 4:
            continue
        status = line[:2]
        filepath = line[3:]
        files.append((status, filepath))
    return files

def suggest_message(status, filepath):
    # Determine type of change (feat, fix, docs, style, refactor, chore)
    # Determine scope (marketing, docs, app, chore, etc.)
    basename = os.path.basename(filepath)
    ext = os.path.splitext(filepath)[1]
    
    # Scope detection
    scope = ""
    if "src/components/marketing/" in filepath:
        scope = "marketing"
    elif "src/components/docs/" in filepath or "src/app/docs/" in filepath:
        scope = "docs"
    elif "src/app/" in filepath:
        scope = "app"
    elif filepath == "AGENTS.md" or filepath == "CLAUDE.md":
        scope = ""
    elif filepath.startswith(".design/"):
        scope = "design"
        
    # Action type detection
    action = "refactor"
    if "?" in status:
        action = "feat"
    elif ext == ".md":
        action = "docs"
    elif ext == ".css":
        action = "style"
    elif "test" in basename:
        action = "test"
    elif filepath in ["package.json", "package-lock.json", "tsconfig.json", "next.config.js"]:
        action = "chore"
        
    # Build clean message
    if "?" in status:
        verb = "add"
    elif "D" in status:
        verb = "remove"
    else:
        verb = "update"
        
    # Build standard summary
    summary = f"{verb} {basename}"
    if scope:
        return f"{action}({scope}): {summary}"
    else:
        return f"{action}: {summary}"

def main():
    files = get_git_status()
    if not files:
        print("Working tree clean. Nothing to stage or commit.")
        sys.exit(0)
        
    auto_mode = "--auto" in sys.argv
    print(f"Found {len(files)} unstaged/untracked files.")
    
    for status, filepath in files:
        # Check if the file still exists (it might have been deleted)
        exists = os.path.exists(filepath)
        
        # Suggest a message
        suggestion = suggest_message(status, filepath)
        
        print("\n" + "="*60)
        print(f"File:   {filepath} (Status: {status})")
        print(f"Sugg:   {suggestion}")
        
        commit_msg = ""
        if auto_mode:
            commit_msg = suggestion
            print(f"Action: Automatically using suggestion")
        else:
            try:
                user_input = input(f"Enter commit message [Enter for default]: ").strip()
                commit_msg = user_input if user_input else suggestion
            except (KeyboardInterrupt, EOFError):
                print("\nOperation cancelled.")
                sys.exit(1)
                
        # Stage the file
        print(f"Staging {filepath}...")
        code, stdout, stderr = run_command(f"git add \"{filepath}\"")
        if code != 0:
            print(f"Error staging {filepath}: {stderr}")
            continue
            
        # Commit the file
        print(f"Committing {filepath} with message: \"{commit_msg}\"")
        # Ensure we do NOT add the Co-Authored-By line
        code, stdout, stderr = run_command(f"git commit -m \"{commit_msg}\"")
        if code != 0:
            print(f"Error committing {filepath}: {stderr}")
            # Try to unstage it to keep working tree clean
            run_command(f"git restore --staged \"{filepath}\"")
            continue
            
        print("Successfully committed!")

if __name__ == "__main__":
    main()
