@echo off
REM TickTick Clone - Ralph Launcher
REM This starts autonomous development loop

echo.
echo ========================================
echo   TickTick Clone - Ralph Launcher
echo ========================================
echo.
echo Starting Ralph Wiggum loop...
echo Project: %CD%
echo Plan: Phase 1 - Core Task Management (12 tasks)
echo.
echo Ralph will work AUTONOMOUSLY on all tasks.
echo You can CLOSE this window - Ralph will continue working.
echo.
echo To monitor progress, open ANOTHER terminal and run:
echo   Get-Content .claude\ralph-loop.local.md -Wait
echo.
echo To STOP Ralph:
echo   Run: claude
echo   Then type: /ralph-wiggum:cancel-ralph
echo.
echo ========================================
echo.

REM Start Ralph loop
claude /ralph-wiggum:ralph-loop "Read docs/plans/phase-1-core-tasks.md and execute ALL tasks one by one. For each task: 1) Read the task requirements carefully, 2) Implement the solution completely, 3) Run ALL validation commands (npm run lint, npm run type-check, npm test), 4) Fix any issues found, 5) Mark the task as completed by changing - [ ] to - [x] in the plan file, 6) Commit changes with message 'Task N: [task title]'. Move to next task ONLY after current task is fully complete and tests pass. Continue until ALL 12 tasks are done. When complete, output: <promise>ALL 12 TASKS COMPLETED AND TESTS PASS</promise>" --completion-promise "ALL 12 TASKS COMPLETED AND TESTS PASS" --max-iterations 100

echo.
echo ========================================
echo Ralph loop finished!
echo ========================================
pause
