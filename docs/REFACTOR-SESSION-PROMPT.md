docs/REFACTOR-SESSION-PROMPT.md# 🔧 REFACTOR SESSION PROMPT

## Context
I have a Next.js 15 brain-log-app that builds successfully but has ~40+ ESLint warnings. I need to systematically clean up ALL code quality issues before production deployment. I have a comprehensive refactor plan documented in `docs/CODE-REFACTOR-IMPLEMENTATION-PLAN.md`.

## Current State
- ✅ Build succeeds with warnings
- ❌ ~40+ ESLint warnings (unused vars, any types, React Hook deps, etc.)
- ❌ Lazy fixes with `_` prefixes found in codebase
- ❌ Incomplete implementations disguised as "unused" variables
- ❌ Inconsistent TypeScript typing

## Task
Execute the comprehensive code refactor plan to achieve **ZERO ESLint warnings** and production-ready code quality.

## Refactor Philosophy
**ZERO TOLERANCE for lazy fixes**:
- ❌ NO prefixing unused variables with `_`
- ✅ DELETE truly unused code
- ✅ FIX incomplete implementations  
- ✅ PROPER TypeScript typing throughout

## Execution Strategy

### Phase 1: Fix Lazy Fixes (IMMEDIATE PRIORITY)
**Found these lazy `_` prefixed variables that need proper analysis:**

1. **`src/app/daily-log/page.tsx`**
   - `const [_isSubmitting, setIsSubmitting] = useState(false);`
   - **Analysis needed**: Is loading state actually needed? If yes, use it properly. If no, remove entirely.

2. **`src/app/weekly-reflection/page.tsx`**
   - `const [_isSubmitting, setIsSubmitting] = useState(false);`
   - **Analysis needed**: Same as above - determine if loading state is needed.

3. **`src/components/ui/slider.tsx`**
   - `const _values = React.useMemo(...)`
   - **Analysis needed**: This should be properly named or refactored.

### Phase 2: Systematic ESLint Warning Resolution
Work through each file systematically:

#### High Priority Files:
1. `src/lib/auth/AuthContext.tsx` - Remove unused router
2. `src/lib/utils/api-client.ts` - Remove unused imports, fix `any` types
3. `src/lib/services/dailyLogService.ts` - Fix unused parameters
4. `src/lib/services/weeklyReflectionService.ts` - Fix unused parameters
5. `src/lib/services/openaiService.ts` - Fix `any` types
6. `src/components/forms/*.tsx` - Fix form event types, unused variables

#### For Each File:
1. **Run build** to see current warnings
2. **Analyze each warning** - DELETE vs FIX vs REFACTOR
3. **Implement proper solution** (no lazy fixes)
4. **Test functionality** to ensure nothing breaks
5. **Verify warning is gone**

### Phase 3: TypeScript Type Improvements
Create proper types for:
- API responses
- Form events  
- Error handling
- OpenAI service responses

### Phase 4: React Hook Dependencies
Fix all missing dependencies in useEffect hooks.

### Phase 5: Final Cleanup
- JSX unescaped quotes
- Code organization
- Documentation

## Success Criteria
- [ ] `npm run build` produces **ZERO warnings**
- [ ] All functionality works as expected
- [ ] No `_` prefixed variables remain
- [ ] Proper TypeScript typing throughout
- [ ] Clean, maintainable code

## Implementation Notes

### For Unused Variables - Decision Tree:
1. **Is it truly unused?** → DELETE
2. **Is it incomplete implementation?** → FIX properly
3. **Is it architectural issue?** → REFACTOR

### For `any` Types:
- Create proper interfaces
- Use generic types where appropriate
- Add runtime validation if needed

### For React Hooks:
- Add missing dependencies
- Use useCallback for functions in dependencies
- Consider useMemo for expensive calculations

## Commands to Run
```bash
# Check current warnings
npm run build

# After each fix, verify
npm run build

# Final verification
npm run build && echo "SUCCESS: Zero warnings!"
```

## Expected Outcome
A production-ready codebase with:
- ✅ Zero ESLint warnings
- ✅ Proper TypeScript typing
- ✅ Clean, maintainable code
- ✅ No lazy fixes or technical debt
- ✅ Ready for production deployment

## Next Steps After Completion
Once refactoring is complete, proceed with production deployment plan from `docs/PRODUCTION-DEPLOYMENT-PLAN.md`.
