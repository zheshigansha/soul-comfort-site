# Process Safety Rules

## CRITICAL: Prevent system overload
- Max 10 concurrent processes
- Sequential execution only  
- No parallel spawning

## Safe command usage:
```bash
# ❌ AVOID
fd .                    # Can spawn too many threads
rg pattern             # Can hang on large output
cargo build            # Can spawn 100+ processes

# ✅ USE INSTEAD  
find . -type f  < /dev/null |  head -1000     # Limited results
grep -r pattern . | head -100   # Limited output
cargo build --jobs=2            # Limited parallelism