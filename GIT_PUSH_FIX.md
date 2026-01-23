# How to Fix Git Push Error

## The Problem
```
! [rejected]        main -> main (non-fast-forward)
error: failed to push some refs
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart.
```

This means someone (or you from another machine) pushed changes to GitHub that you don't have locally.

## Solution Options

### Option 1: Pull and Merge (Recommended)
This preserves both your local changes and remote changes:

```bash
# Pull the remote changes and merge them
git pull origin main

# If there are conflicts, resolve them, then:
git add .
git commit -m "Merge remote changes"

# Now push
git push origin main
```

### Option 2: Pull with Rebase (Cleaner History)
This puts your commits on top of the remote commits:

```bash
# Pull with rebase
git pull --rebase origin main

# If there are conflicts, resolve them, then:
git add .
git rebase --continue

# Now push
git push origin main
```

### Option 3: Force Push (⚠️ DANGEROUS - Only if you're sure)
**WARNING**: This will overwrite remote changes! Only use if you're CERTAIN the remote changes don't matter.

```bash
# Force push (overwrites remote)
git push --force origin main
```

## Step-by-Step Guide (Option 1 - Safest)

1. **Check your current status**:
   ```bash
   git status
   ```

2. **Commit any uncommitted changes**:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

3. **Pull remote changes**:
   ```bash
   git pull origin main
   ```

4. **If there are merge conflicts**:
   - Open the conflicted files
   - Look for markers like `<<<<<<< HEAD`, `=======`, `>>>>>>> origin/main`
   - Edit the files to resolve conflicts
   - Save the files
   - Then:
     ```bash
     git add .
     git commit -m "Resolve merge conflicts"
     ```

5. **Push your changes**:
   ```bash
   git push origin main
   ```

## Quick Commands (Copy-Paste)

```bash
# Save your current work
git add .
git commit -m "Fix: NaN error in CapacityTrendChart and add Todoist setup guide"

# Pull and merge remote changes
git pull origin main

# Push your changes
git push origin main
```

## If You Get Conflicts

Conflicts look like this in your files:
```
<<<<<<< HEAD
Your local changes
=======
Remote changes
>>>>>>> origin/main
```

To resolve:
1. Edit the file to keep what you want
2. Remove the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
3. Save the file
4. Run:
   ```bash
   git add <filename>
   git commit -m "Resolve conflicts"
   git push origin main
   ```

## Prevention

To avoid this in the future:
1. Always pull before you start working:
   ```bash
   git pull origin main
   ```

2. Pull frequently if working with others:
   ```bash
   git pull origin main
   ```

3. Push your changes regularly:
   ```bash
   git push origin main
   ```

## What Happened?

Most likely:
- You edited files on GitHub directly (through the web interface)
- OR you pushed from another computer
- OR someone else pushed to your repo

The remote has commits that your local doesn't have, so Git won't let you push until you integrate those changes.
