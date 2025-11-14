# Supabase CLI Installation Guide (2025)

## Latest Version Information
- **Current Version**: v2.58.5 (released November 10, 2025)
- **Package Name**: `supabase`
- **GitHub Repository**: https://github.com/supabase/cli

## Prerequisites

### Required Software
1. **Node.js** (v16 or higher)
   - Download from https://nodejs.org/
   - Verify installation: `node --version`

2. **Docker Desktop** or compatible container runtime
   - Download from https://www.docker.com/products/docker-desktop/
   - Required for local Supabase development stack

3. **Git** (for version control operations)
   - Download from https://git-scm.com/

## Installation Methods for Windows

### Method 1: Global Installation with npm (Recommended)
```bash
npm install -g supabase
```

### Method 2: Global Installation with Yarn
```bash
yarn global add supabase
```

### Method 3: Global Installation with pnpm
```bash
pnpm add -g supabase
```

### Method 4: Chocolatey
```bash
choco install supabase
```

### Method 5: Windows Package Manager (winget)
```bash
winget install Supabase.CLI
```

### Method 6: Direct Binary Download
1. Visit https://github.com/supabase/cli/releases/latest
2. Download `supabase_windows_amd64.exe`
3. Add the executable to your system PATH

## Post-Installation Verification

### Check Installation
```bash
# Check version
supabase --version

# View help
supabase --help

# List all available commands
supabase --help
```

### Expected Output for Version Check
```
supabase 2.58.5
```

## Initial Setup & First Project

### 1. Initialize a New Supabase Project
```bash
# Navigate to your project directory
cd your-project-folder

# Initialize Supabase
supabase init
```

### 2. Start Local Development Stack
```bash
# Start the local Supabase stack
supabase start
```

### 3. Access Local Services
After running `supabase start`, you can access:
- **Studio**: http://localhost:54323
- **API**: http://localhost:54321
- **Database**: postgresql://postgres:postgres@localhost:54322/postgres

## Common Commands

### Project Management
```bash
# Initialize new project
supabase init

# Start local development
supabase start

# Stop local services
supabase stop

# Reset local database
supabase db reset

# Get project URL and keys
supabase status
```

### Database Operations
```bash
# Generate migrations
supabase db diff

# Apply migrations
supabase db push

# View database schema
supabase db schema
```

### Types Generation
```bash
# Generate TypeScript types
supabase gen types typescript --local > types/supabase.ts
```

## Configuration Files Created
After running `supabase init`, the following files are created:
- `supabase/config.toml` - Main configuration file
- `supabase/migrations/` - Database migration files
- `supabase/seed.sql` - Database seeding script

## Troubleshooting

### Common Issues
1. **Docker not running**: Ensure Docker Desktop is running
2. **Port conflicts**: Check if ports 54321-54323 are available
3. **Permission denied**: Run terminal as Administrator on Windows

### Reset Installation
```bash
# Uninstall globally
npm uninstall -g supabase

# Clean up Docker containers and volumes
docker system prune -a
```

## Environment Variables (Optional)
You can set these environment variables for convenience:
```bash
# Set your project reference
export SUPABASE_PROJECT_REF=your-project-ref

# Set your service role key
export SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

## Resources
- **Official Documentation**: https://supabase.com/docs/reference/cli
- **GitHub Repository**: https://github.com/supabase/cli
- **Community**: https://github.com/supabase/cli/discussions

## Next Steps After Installation
1. Create a new Supabase project at https://app.supabase.com/
2. Link your local project: `supabase link --project-ref your-project-ref`
3. Start building your application!

---

*Last Updated: November 2025*
*Version: v2.58.5*