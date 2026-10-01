===========================================================
                 HOW TO USE THE AUTOGRADER
===========================================================

0. Open AutoGraderMain/ and do "git pull" to pull most current version
   of the autograder

1. Copy AutoGraderMain/ into the HW# folder you are grading.

   Example:
   AutoGrader/HW4/THEAutoGrader/

2. Open autograder.js and edit the CONFIG section at the top:

   const HW_NUMBER = 4;
   const REPO_PREFIX = "hw4-class-methods-";
   const MASTER_REPO_NAME = "hw4-class-methods-MASTER";
   const BASE_FOLDER = "C:/Users/DEVON/.../AutoGrader/HW4/";

3. Make sure your MASTER repo is inside the HW# folder.
   - Additionally, make sure to do "npm install" in the MASTER repo

4. Run run.bat (double-click).

   Alternatively, open a PowerShell, type "cmd", then cd to the "C:/Users/DEVON/.../AutoGrader/HW#/AutoGraderMain/"
   Then Run:
	   node autograder.js

   This allows you to see the console.logs

5. After grading:
   - HW#-PASS.txt contains [PASS] entries like [PASS] Student Name | githubUsername
   - Submissions.txt contains GitHub usernames for tracking
   - HW#-Failed/ contains all failed repos
   - Failed repo folders use names like hw4-class-methods-*GitHub_Username*
   - HW#-Failed/HW#-Failed-Log.txt contains entries like [FAIL] Student Name | githubUsername
   - Only MASTER repo remains in HW#/
   - RunCnt.txt contains the amount of times the script has been run

===========================================================
                 DEVELOPMENT BRANCHING
===========================================================

Creating feature branches off dev:
   1. git checkout dev
      - Switch to dev branch
   2. git pull
      - Get all new changes
   3. git checkout -b feature/new-grading-logic
      - Make the new branch off of dev and switch to it

Developing Feature (normal workflow):
   1. git add .
   2. git commit -m "Implement new grading logic"
   3. git push -u origin feature/new-grading-logic
      - Only the first time. After just "git push"

When the feature is ready: 
   1. git checkout dev
      - Switch to dev branch
   2. git merge feature/new-grading-logic
      - Merge feature branch into dev branch
   3. git push

When dev is stable enough to become the new autograder:
   1. git checkout main
      - Switch to main branch
   2. git merge dev
      - Merge dev branch into main branch
   3. git push

   ===========================================================