/*
===========================================================
                AUTOGRADER CONFIGURATION
===========================================================
CHANGE THESE FOUR VALUES FOR EACH HOMEWORK ASSIGNMENT
===========================================================
*/

const HW_NUMBER = 4;  
const REPO_PREFIX = "hw4-class-methods-";  
const MASTER_REPO_NAME = "hw4-class-methods-MASTER";  
const BASE_FOLDER = "C:/Users/DEVON/OneDrive/Documents/TA CISC 181/AutoGrader/HW4/";

/*
===========================================================
        DO NOT CHANGE ANYTHING BELOW THIS LINE
===========================================================
*/

import { execFileSync, execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const ROOT_FOLDER = path.resolve(BASE_FOLDER);
const MASTER_FOLDER = path.join(ROOT_FOLDER, MASTER_REPO_NAME);
const PASS_FILE = path.join(ROOT_FOLDER, `HW${HW_NUMBER}-PASS.txt`);
const SUBMISSIONS_FILE = path.join(ROOT_FOLDER, "Submissions.txt");
const FAILED_FOLDER = path.join(ROOT_FOLDER, `HW${HW_NUMBER}-Failed`);
const FAILED_LOG = path.join(FAILED_FOLDER, `HW${HW_NUMBER}-Failed-Log.txt`);
const RUN_FILE = path.join(ROOT_FOLDER, `RunCnt${HW_NUMBER}.txt`);
let runNumber = 0;

fs.mkdirSync(FAILED_FOLDER, { recursive: true });
if (!fs.existsSync(PASS_FILE)) fs.writeFileSync(PASS_FILE, "");
if (!fs.existsSync(SUBMISSIONS_FILE)) fs.writeFileSync(SUBMISSIONS_FILE, "");
if (!fs.existsSync(FAILED_LOG)) fs.writeFileSync(FAILED_LOG, "");
if (fs.existsSync(RUN_FILE)) {
  runNumber = parseInt(fs.readFileSync(RUN_FILE, "utf8")) || 0;
}

const previousErrors = new Set(
  fs.readFileSync(FAILED_LOG, "utf8")
    .split(/\r?\n/)
    .map(line => /^\[ERROR\]\s+(.+)$/.exec(line)?.[1]?.split(" | ").at(-1))
    .filter(Boolean)
);
const graded = new Set(
  fs.readFileSync(SUBMISSIONS_FILE, "utf8")
    .split(/\r?\n/)
    .map(username => username.trim())
    .filter(username => username && !previousErrors.has(username))
);

function append(file, text) {
  fs.appendFileSync(file, text + "\n");
}

function getStudentName(username) {
  try {
    const profileName = execFileSync(
      "gh",
      ["api", `users/${username}`, "--jq", ".name // empty"],
      { encoding: "utf8" }
    ).trim();
    if (profileName) return profileName;
  } catch (error) {
    console.warn(`Could not read GitHub profile name for ${username}.`);
  }

  return username
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_.]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function recordOutcome(username, studentName, outcome, markGraded = true) {
  const resultName = `${studentName} | ${username}`;
  const submissions = fs
    .readFileSync(SUBMISSIONS_FILE, "utf8")
    .split(/\r?\n/)
    .filter(entry => entry.trim() && entry.trim() !== username);
  if (markGraded) submissions.push(username);
  fs.writeFileSync(
    SUBMISSIONS_FILE,
    submissions.length ? `${submissions.join("\n")}\n` : ""
  );

  for (const file of [PASS_FILE, FAILED_LOG]) {
    const remainingLines = fs
      .readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter(line => {
        const statusEnd = line.indexOf("] ");
        const label = statusEnd < 0 ? "" : line.slice(statusEnd + 2);
        return (
          label !== username &&
          label !== studentName &&
          label !== resultName
        );
      })
      .filter(Boolean);
    fs.writeFileSync(file, remainingLines.length ? `${remainingLines.join("\n")}\n` : "");
  }

  if (outcome === "PASS") {
    append(PASS_FILE, `[PASS] ${resultName}`);
  } else {
    append(FAILED_LOG, `[${outcome}] ${resultName}`);
  }
  if (markGraded) graded.add(username);
}

function runTests() {
  const reportPath = path.join(
    os.tmpdir(),
    `autograder-jest-${process.pid}-${Date.now()}.json`
  );
  let output = "";

  try {
    output = execSync(
      `npm run test -- --json --outputFile="${reportPath}"`,
      {
        cwd: MASTER_FOLDER,
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      }
    );
  } catch (error) {
    output = [error.stdout, error.stderr]
      .filter(Boolean)
      .map(value => value.toString())
      .join("");
  }

  if (output) process.stdout.write(output);

  try {
    if (!fs.existsSync(reportPath)) return { outcome: "ERROR", log: output };
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    if (report.success) return { outcome: "PASS", log: output };
    return {
      outcome: report.numFailedTests > 0 ? "FAIL" : "ERROR",
      log: output,
    };
  } catch (error) {
    console.error(`Could not read Jest results: ${error.message}`);
    return { outcome: "ERROR", log: output };
  } finally {
    fs.rmSync(reportPath, { force: true });
  }
}

function failedRepoPath(username) {
  return path.join(FAILED_FOLDER, `${REPO_PREFIX}${username}`);
}

function moveToFailed(sourcePath, username) {
  const destination = failedRepoPath(username);
  if (fs.existsSync(destination)) {
    throw new Error(`Failed repo destination already exists: ${destination}`);
  }
  fs.renameSync(sourcePath, destination);
}

// ===========================================================
//                  MAIN EXECUTION START
// ===========================================================

append(PASS_FILE, `\n========= Run ${runNumber} =========`);
append(FAILED_LOG, `\n========= Run ${runNumber} =========`);

fs.writeFileSync(RUN_FILE, String(runNumber + 1));

console.log("Fetching GitHub repos...");

const raw = execFileSync(
  "gh",
  [
    "api",
    "/user/repos?affiliation=collaborator&per_page=100",
    "--paginate",
    "--jq",
    ".[].full_name",
  ],
  { encoding: "utf8" }
);

const allRepos = raw
  .split(/\r?\n/)
  .filter(Boolean)
  .map(fullName => {
    const repoJson = execFileSync(
      "gh",
      ["repo", "view", fullName, "--json", "name,url,pushedAt,owner"],
      { encoding: "utf8" }
    );
    return JSON.parse(repoJson);
  });

const repos = allRepos.filter(r => {
  const ageInDays = (Date.now() - new Date(r.pushedAt).getTime()) / 86400000;
  return (
    r.name.startsWith(REPO_PREFIX) &&
    r.name !== MASTER_REPO_NAME &&
    Number.isFinite(ageInDays) &&
    ageInDays >= 0 &&
    ageInDays <= 30
  );
});

console.log(`Found ${repos.length} repos to consider.`);

for (const repo of repos) {
  const username = repo.owner.login;
  const studentName = getStudentName(username);

  console.log(`\n=== Processing ${repo.name} (${username}) ===`);

  if (
    graded.has(username) &&
    !previousErrors.has(username) &&
    !previousErrors.has(studentName)
  ) {
    console.log(`Already graded ${username}, skipping.`);
    continue;
  }

  const failedPath = failedRepoPath(username);
  const tempRepoPath = path.join(
    ROOT_FOLDER,
    `.autograder-${username}-${process.pid}-${Date.now()}`
  );

  try {
    if (!fs.existsSync(MASTER_FOLDER)) {
      throw new Error(`Master repo not found: ${MASTER_FOLDER}`);
    }
    if (fs.existsSync(failedPath)) {
      throw new Error(`Failed repo destination already exists: ${failedPath}`);
    }

    try {
      execFileSync("gh", ["repo", "clone", repo.url, tempRepoPath], {
        stdio: "inherit",
      });
    } catch (error) {
      console.error(`Could not clone ${repo.name} over HTTPS: ${error.message}`);
      fs.rmSync(tempRepoPath, { recursive: true, force: true });
      recordOutcome(username, studentName, "ERROR", false);
      continue;
    }

    const srcPath = path.join(tempRepoPath, "src");
    if (!fs.existsSync(srcPath) || !fs.statSync(srcPath).isDirectory()) {
      console.log(`Missing src folder for ${studentName}. Marking as failed.`);
      moveToFailed(tempRepoPath, username);
      recordOutcome(username, studentName, "MISSING SRC");
      continue;
    }

    const masterSrc = path.join(MASTER_FOLDER, "src");
    const stagedSrc = path.join(MASTER_FOLDER, `.autograder-src-${process.pid}`);
    fs.rmSync(stagedSrc, { recursive: true, force: true });
    fs.cpSync(srcPath, stagedSrc, { recursive: true });
    fs.rmSync(masterSrc, { recursive: true, force: true });
    fs.renameSync(stagedSrc, masterSrc);

    const { outcome, log } = runTests();
    if (outcome === "PASS") {
      console.log(`PASS: ${studentName}`);
      fs.rmSync(tempRepoPath, { recursive: true, force: true });
      recordOutcome(username, studentName, "PASS");
      continue;
    }

    console.log(`${outcome}: ${studentName}`);
    fs.cpSync(MASTER_FOLDER, failedPath, {
      recursive: true,
      filter: source =>
        !path.relative(MASTER_FOLDER, source).split(path.sep).includes(".git"),
    });
    if (log) {
      const jestLog = log
        .replace(/\u001b\[[0-9;]*m/g, "") // Strip ANSI color codes for a plain-text log.
        .replace(/^Test results written to:.*(?:\r?\n|$)/gm, "")
        .replace(/^\s*(?:>.*(?:\r?\n|$))+\s*/, "") // Remove the npm run banner.
        .trim();
      if (jestLog) {
        fs.writeFileSync(path.join(failedPath, "JestLog.txt"), jestLog + "\n");
      }
    }
    fs.rmSync(tempRepoPath, { recursive: true, force: true });
    recordOutcome(username, studentName, outcome);
  } catch (error) {
    console.error(`ERROR while processing ${username}: ${error.message}`);
    if (fs.existsSync(tempRepoPath)) {
      if (!fs.existsSync(failedPath)) {
        moveToFailed(tempRepoPath, username);
      } else {
        fs.rmSync(tempRepoPath, { recursive: true, force: true });
      }
    }
    recordOutcome(username, studentName, "ERROR");
  }
}

console.log("\nAll repos processed.");