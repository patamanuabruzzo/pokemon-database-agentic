# Git Authentication Troubleshooting

This document explains how the ADW system handles git authentication and how to troubleshoot common issues.

## Authentication Methods

The ADW system uses a **hybrid authentication approach** that automatically tries multiple methods:

### 1. SSH Authentication (Primary)

**Default method** - Uses SSH keys with SSH agent.

**Requirements:**
- SSH key configured in GitHub account
- SSH agent running with key loaded
- Git remote using SSH URL: `git@github.com:user/repo.git`

**How it works:**
- ADW passes full environment (including `SSH_AUTH_SOCK` and `SSH_AGENT_PID`) to git commands
- Git uses SSH agent to authenticate with your SSH key
- No credentials stored in code or config files

**Verify SSH setup:**
```bash
# Test SSH connection to GitHub
ssh -T git@github.com

# Should see: "Hi username! You've successfully authenticated..."

# Check SSH agent
ssh-add -l

# Should list your SSH keys
```

### 2. HTTPS with Token (Fallback)

**Automatic fallback** if SSH authentication fails.

**Requirements:**
- `GITHUB_PAT` environment variable set with Personal Access Token
- Token must have `repo` scope

**How it works:**
1. SSH authentication is attempted first
2. If SSH fails with "Permission denied (publickey)", ADW automatically tries HTTPS
3. Temporarily switches git remote to HTTPS with embedded token
4. Performs the operation
5. Switches back to SSH remote

**Setup HTTPS fallback:**
```bash
# Generate token at: https://github.com/settings/tokens
# Token needs 'repo' scope

# Set in .env file:
GITHUB_PAT=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Common Issues

### Issue: "Permission denied (publickey)"

**Symptoms:**
```
Failed to push branch: git@github.com: Permission denied (publickey).
fatal: Could not read from remote repository.
```

**Cause:** SSH agent not available to Python subprocess.

**Solutions:**

**Option 1: Fix SSH Agent (Recommended)**
```bash
# Windows - Start SSH agent
eval $(ssh-agent -s)
ssh-add ~/.ssh/id_ed25519  # or your key name

# Linux/macOS
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

**Option 2: Use HTTPS Fallback**
```bash
# Set GitHub token in .env
GITHUB_PAT=ghp_your_token_here

# ADW will automatically fall back to HTTPS
```

### Issue: "Could not read from remote repository"

**Symptoms:**
```
fatal: Could not read from remote repository.
Please make sure you have the correct access rights.
```

**Possible causes:**
1. SSH key not added to GitHub account
2. SSH agent not running
3. Wrong remote URL
4. Repository access rights issue

**Diagnosis:**
```bash
# Check current remote
git remote -v

# Test SSH connection
ssh -T git@github.com

# Check if SSH agent has keys
ssh-add -l
```

**Fix:**
1. Add SSH key to GitHub: https://github.com/settings/keys
2. Start SSH agent (see above)
3. Or use HTTPS fallback with `GITHUB_PAT`

### Issue: HTTPS fallback also fails

**Symptoms:**
```
SSH failed: Permission denied (publickey)
HTTPS fallback also failed: ...
```

**Possible causes:**
1. Invalid or expired `GITHUB_PAT`
2. Token missing `repo` scope
3. Network/proxy issues

**Fix:**
```bash
# Generate new token with 'repo' scope
# https://github.com/settings/tokens

# Update .env
GITHUB_PAT=ghp_new_token_here

# Test token
gh auth status
```

## How It Works Internally

### Git Environment Setup

The `get_git_env()` function in `github.py`:

```python
def get_git_env() -> dict:
    """Get environment for git operations with SSH agent support."""
    # Copy full environment (includes SSH_AUTH_SOCK, PATH, etc.)
    env = os.environ.copy()

    # Add GitHub token if available (for HTTPS fallback)
    github_pat = os.getenv("GITHUB_PAT")
    if github_pat:
        env["GH_TOKEN"] = github_pat

    return env
```

**Key environment variables:**
- `SSH_AUTH_SOCK` - Socket for SSH agent communication
- `SSH_AGENT_PID` - Process ID of SSH agent
- `PATH` - System paths
- `HOME` / `USERPROFILE` - For SSH config files
- `GH_TOKEN` - GitHub token (optional, for HTTPS fallback)

### Push Operation Flow

1. **Attempt SSH push:**
   ```python
   git push -u origin branch_name
   # With full environment including SSH agent
   ```

2. **If SSH fails with auth error:**
   - Check if `GITHUB_PAT` is available
   - If yes, switch to HTTPS

3. **HTTPS fallback:**
   ```python
   # Temporarily change remote
   git remote set-url origin https://{token}@github.com/user/repo.git

   # Push
   git push -u origin branch_name

   # Restore SSH remote
   git remote set-url origin git@github.com:user/repo.git
   ```

## Best Practices

### For Development

**Use SSH** for best experience:
- No tokens in environment
- Works across all git operations
- More secure (key-based auth)

**Setup:**
```bash
# Generate SSH key (if needed)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to SSH agent
eval $(ssh-agent -s)
ssh-add ~/.ssh/id_ed25519

# Add public key to GitHub
cat ~/.ssh/id_ed25519.pub
# Copy and paste to: https://github.com/settings/keys
```

### For CI/CD / Automation

**Use HTTPS with token**:
- Easier to set up in automated environments
- No SSH agent configuration needed
- Works in containers/sandboxes

**Setup:**
```bash
# In CI/CD environment
export GITHUB_PAT=${{ secrets.GITHUB_TOKEN }}

# Or use .env file
echo "GITHUB_PAT=ghp_xxxx" >> .env
```

### Security Notes

- **Never commit** `GITHUB_PAT` to git
- `.env` is in `.gitignore` - keep it that way
- Use fine-grained tokens with minimal scopes
- Rotate tokens regularly
- SSH keys are generally more secure than tokens

## Testing Authentication

### Test SSH

```bash
# Test SSH connection
ssh -T git@github.com

# Expected: "Hi username! You've successfully authenticated..."
```

### Test HTTPS

```bash
# Set token
export GITHUB_PAT=ghp_your_token

# Test with gh CLI
gh auth status

# Test with git
git ls-remote https://github.com/user/repo.git
```

### Test ADW

```bash
cd adws

# Create test branch
git checkout -b test-auth-$(date +%s)

# Make a change
echo "test" >> test.txt
git add test.txt
git commit -m "Test auth"

# Try ADW push (will use hybrid auth)
uv run python -c "
from adw_modules.git_ops import push_branch
success, error = push_branch('$(git branch --show-current)')
print('Success!' if success else f'Failed: {error}')
"

# Clean up
git checkout main
git branch -D test-auth-*
```

## Environment Variables Reference

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `SSH_AUTH_SOCK` | No* | SSH agent socket | `/tmp/ssh-XXX/agent.123` |
| `SSH_AGENT_PID` | No* | SSH agent PID | `12345` |
| `GITHUB_PAT` | No** | GitHub token for HTTPS | `ghp_xxxxxxxxxxxx` |
| `GITHUB_REPO_URL` | Yes | Repository URL | `https://github.com/user/repo` |
| `ANTHROPIC_API_KEY` | Yes | Claude API key | `sk-ant-xxx` |

\* Required for SSH authentication (set automatically by SSH agent)
\** Required only if SSH fails and HTTPS fallback is needed

## Further Help

If you continue to experience issues:

1. **Check logs:** Look in `agents/{adw_id}/*/execution.log`
2. **Enable debug:** Set `ADW_DEBUG=true` environment variable
3. **Test manually:** Try git operations manually in terminal
4. **Check GitHub status:** https://www.githubstatus.com/

## Related Documentation

- [GitHub SSH Setup](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [SSH Agent Forwarding](https://docs.github.com/en/developers/overview/using-ssh-agent-forwarding)
