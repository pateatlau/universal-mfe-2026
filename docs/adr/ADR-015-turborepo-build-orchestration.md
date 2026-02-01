# ADR-015: Turborepo for Build Orchestration

**Status**: Accepted
**Date**: 2025-12
**Decision Makers**: Platform Architecture Team

## Context

Monorepos with many packages need build orchestration that:

1. **Respects dependencies**: Build packages in correct order
2. **Enables parallelism**: Run independent tasks concurrently
3. **Provides caching**: Don't rebuild unchanged packages
4. **Simplifies commands**: Single command for complex pipelines
5. **Integrates with CI**: Cache sharing across builds

Tools evaluated:
- **Turborepo**: Vercel's monorepo build system
- **Nx**: Nrwl's monorepo toolkit
- **Lerna**: Original JS monorepo tool
- **Rush**: Microsoft's monorepo manager

## Decision

**Use Turborepo v2.7.3** for build orchestration.

Configuration in `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Consequences

### Positive

1. **Intelligent caching**: Unchanged packages skip build ("FULL TURBO")
2. **Dependency ordering**: `^build` ensures deps build first
3. **Parallel execution**: Independent packages build concurrently
4. **Simple CLI**: `turbo run build` handles everything
5. **Remote caching**: Optionally share cache across machines
6. **Fast adoption**: Minimal configuration required

### Negative

1. **Vercel dependency**: Tied to Vercel's ecosystem
2. **Learning curve**: Team must understand task graph
3. **Cache invalidation**: Sometimes need manual cache clear
4. **Limited customization**: Less flexible than Nx

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cache corruption | Low | Medium | `turbo clean` available; reproducible from scratch |
| Turborepo deprecated | Very Low | Medium | Config is simple; migration path exists |
| Task graph complexity | Medium | Low | Keep task definitions simple; document |

## Alternatives Considered

### Alternative 1: Nx

**Description**: Full-featured monorepo toolkit with plugins.

**Rejected because**:
- More complex setup and configuration
- Plugin ecosystem adds dependencies
- Overkill for our package count
- Turborepo sufficient for our needs

### Alternative 2: Lerna

**Description**: Original JavaScript monorepo tool.

**Rejected because**:
- No built-in caching
- Less active development
- Turborepo is spiritual successor
- Missing modern features

### Alternative 3: Rush

**Description**: Microsoft's enterprise monorepo manager.

**Rejected because**:
- Complex pnpm-based approach
- Steep learning curve
- Enterprise-focused features unnecessary
- Less community adoption

### Alternative 4: Custom Scripts

**Description**: Shell scripts for build orchestration.

**Rejected because**:
- No caching
- Complex dependency management
- Error-prone ordering
- Maintenance burden

## Task Configuration

### Cached Tasks

Tasks that produce deterministic output:

```json
{
  "build": {
    "dependsOn": ["^build"],
    "outputs": ["dist/**"],
    "cache": true
  },
  "typecheck": {
    "dependsOn": ["^build"],
    "outputs": [],
    "cache": true
  },
  "lint": {
    "outputs": [],
    "cache": true
  },
  "test": {
    "dependsOn": ["^build"],
    "outputs": ["coverage/**"],
    "cache": true
  }
}
```

### Non-Cached Tasks

Tasks with side effects or requiring fresh execution:

```json
{
  "dev": {
    "cache": false,
    "persistent": true
  },
  "clean": {
    "cache": false
  }
}
```

## Pipeline Commands

```bash
# Build all packages (respects dependencies, uses cache)
yarn build

# Build specific package and its dependencies
yarn build --filter=@universal/web-shell

# Build only shared packages
yarn build:shared

# Build only web packages
yarn build:web

# Type check all packages
yarn typecheck

# Run tests
yarn test

# Clean all outputs
yarn clean
```

## Cache Behavior

### Local Cache

Stored in `.turbo/` directory:

```
.turbo/
├── cache/
│   ├── abc123...  # Cached task outputs
│   └── def456...
└── runs/
    └── latest     # Run metadata
```

### Cache Hit ("FULL TURBO")

When task inputs unchanged:

```
@universal/shared-utils:build: cache hit, replaying output
@universal/shared-utils:build:
@universal/shared-utils:build: > build
@universal/shared-utils:build: > tsc -p tsconfig.build.json
@universal/shared-utils:build:
@universal/shared-utils:build: >>> FULL TURBO
```

### Cache Miss

When inputs changed, task runs fresh:

```
@universal/shared-utils:build: cache miss, executing
@universal/shared-utils:build:
@universal/shared-utils:build: > build
@universal/shared-utils:build: > tsc -p tsconfig.build.json
```

## CI Integration

```yaml
# .github/workflows/ci.yml
- name: Setup Turborepo cache
  uses: actions/cache@v5
  with:
    path: .turbo
    key: ${{ runner.os }}-turbo-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-turbo-

- name: Build
  run: yarn build
```

## Implementation

Root configuration:
- `turbo.json` - Task definitions
- `package.json` - Workspace scripts

```json
// package.json
{
  "scripts": {
    "build": "turbo run build",
    "build:shared": "turbo run build --filter='./packages/shared-*'",
    "build:web": "turbo run build --filter='./packages/web-*'",
    "typecheck": "turbo run typecheck",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean"
  }
}
```

## References

- [Turborepo Documentation](https://turbo.build/)
- [Turborepo Task Configuration](https://turbo.build/docs/reference/configuration)
- [Turborepo Caching](https://turbo.build/docs/core-concepts/caching)
