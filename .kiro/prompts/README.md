# Kiro Setup - I want to create a hub for AWS Kiro resources, for

Your project documentation has been exported and is ready to use with Kiro IDE.

**Generated:** 2025-12-08 22:35:27 UTC

---

## 🚀 What To Do Next

### Step 1: Set Up Your Project

1. **Create a new project folder** (or use an existing one)
2. **Extract this package** into your project root
3. **Copy files to Kiro's config folder:**

```bash
# Create Kiro directories
mkdir -p .kiro/steering
mkdir -p .kiro/specs
mkdir -p docs

# Copy steering files (Kiro will auto-load these)
cp steering/*.md .kiro/steering/

# Copy documentation for reference
cp docs/*.md docs/
```

### Step 2: Open in Kiro IDE

1. **Open Kiro IDE** (download from https://kiro.dev if needed)
2. **Open your project folder** in Kiro
3. Kiro will automatically detect the steering files

### Step 3: Generate Your First Spec

1. **Open Kiro chat** (Cmd/Ctrl + Shift + I)
2. **Type `#spec-generation`** to include the spec generation guide
3. **Copy and paste this prompt** (replace [FEATURE_NAME] with your first Phase 1 feature):

```
Create a new spec for "[FEATURE_NAME]" based on the roadmap at #[[file:docs/roadmap.md]].

Use the PRD at #[[file:docs/PRD.md]] for product context and the tech architecture at #[[file:docs/tech-architecture.md]] for technical guidance.

Generate three files in .kiro/specs/[feature-slug]/:
1. requirements.md - User story and acceptance criteria
2. design.md - Technical approach and component design
3. tasks.md - Implementation checklist
```

### Step 4: Implement the Spec

1. **Open the generated tasks.md** in `.kiro/specs/[feature-name]/`
2. **Click "Start task"** on the first task
3. **Review Kiro's changes** before accepting
4. **Repeat** for each task until the feature is complete

### Step 5: Continue with Next Feature

1. Check your roadmap for the next feature (respect dependencies!)
2. Generate a new spec using the prompt above
3. Implement, review, repeat

---

## 📁 What's Included

### Steering Files (`steering/`)
These provide context to Kiro for all your conversations:

| File | Purpose |
|------|---------|
| `product.md` | Product vision, target users, success metrics |
| `tech.md` | Technology stack, dependencies, setup |
| `architecture.md` | Code patterns, organization, conventions |
| `spec-generation.md` | Guide for generating specs (manual inclusion) |

### Documentation (`docs/`)
Reference documents for you and Kiro:

| File | Purpose |
|------|---------|
| `roadmap.md` | MVP roadmap with all features by phase |
| `PRD.md` | Product requirements document |
| `tech-architecture.md` | Technical architecture details |
| `design.md` | System design document |

---

## 💡 Tips for Success

### Build in Order
Your roadmap has 4 phases. Build Phase 1 features first — they have no dependencies.

### Review Before Implementing
Read through generated specs before starting tasks. Edit if something doesn't look right.

### Keep Specs Small
Each spec should be one feature. If it feels too big, split it.

### Update Steering Files
As your project evolves, update the steering files with new patterns and conventions.

### Use File References
Point Kiro to existing code with `#[[file:path/to/file]]` for consistency.

---

## 🔗 Quick Reference

**Generate a spec:**
```
#spec-generation Create a spec for "[FEATURE]" from #[[file:docs/roadmap.md]]
```

**Reference your docs:**
- Roadmap: `#[[file:docs/roadmap.md]]`
- PRD: `#[[file:docs/PRD.md]]`
- Tech: `#[[file:docs/tech-architecture.md]]`

**Start implementing:**
Open `.kiro/specs/[feature]/tasks.md` → Click "Start task"

---

## Need Help?

- **Kiro Documentation:** https://kiro.dev/docs
- **Spec Generation Guide:** See `steering/spec-generation.md`
- **Your Roadmap:** See `docs/roadmap.md` for feature list and dependencies
