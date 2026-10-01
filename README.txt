===========================================================
                 HOW TO USE THE AUTOGRADER
===========================================================

1. Copy THEAutoGrader/ into the HW# folder you are grading.

   Example:
   AutoGrader/HW4/THEAutoGrader/

2. Open autograder.js and edit the CONFIG section at the top:

   const HW_NUMBER = 4;
   const REPO_PREFIX = "hw4-class-methods-";
   const MASTER_REPO_NAME = "hw4-class-methods-MASTER";
   const BASE_FOLDER = "C:/Users/DEVON/.../AutoGrader/HW4/";

3. Make sure your MASTER repo is inside the HW# folder.

4. Run run.bat (double-click).
   Alternatively, open a PowerShell, type "cmd", then cd to the "C:/Users/DEVON/.../AutoGrader/HW#/THEAutoGrader/"
   Then Run:
	node autograder.js

5. After grading:
   - HW#-PASS.txt contains [PASS] entries like [PASS] Student Name | githubUsername
   - Submissions.txt contains GitHub usernames for tracking
   - HW#-Failed/ contains all failed repos
   - Failed repo folders use names like hw4-class-methods-MatthewAchenchi
   - HW#-Failed/HW#-Failed-Log.txt contains entries like [FAIL] Student Name | githubUsername
   - Only MASTER repo remains in HW#/

===========================================================
