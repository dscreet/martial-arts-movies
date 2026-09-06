const fs = require('node:fs');

const testResultsPath = '.vitest/json/output.json'; // default vitest 5 path
const coveragePath = 'coverage/coverage-summary.json';

function createTestResultsTable(results) {
  return [
    [
      { data: 'Category', header: true },
      { data: 'Passed', header: true },
      { data: 'Failed', header: true },
      { data: 'Total', header: true },
    ],
    [
      'Test suites',
      String(results.numPassedTestSuites),
      String(results.numFailedTestSuites),
      String(results.numTotalTestSuites),
    ],
    ['Tests', String(results.numPassedTests), String(results.numFailedTests), String(results.numTotalTests)],
  ];
}

function createCoverageTable(total) {
  const metrics = [
    ['Statements', total.statements],
    ['Branches', total.branches],
    ['Functions', total.functions],
    ['Lines', total.lines],
  ];

  return [
    [
      { data: 'Metric', header: true },
      { data: 'Coverage', header: true },
      { data: 'Covered', header: true },
      { data: 'Total', header: true },
    ],
    ...metrics.map(([name, coverage]) => [name, `${coverage.pct}%`, String(coverage.covered), String(coverage.total)]),
  ];
}

async function publishJobSummary(core, results, coverage) {
  if (results) {
    const outcome = results.success ? '✅' : '❌';
    core.summary.addHeading(`Test results ${outcome}`, 2).addTable(createTestResultsTable(results));
  } else {
    core.summary.addHeading('Test results', 2).addRaw('No test results were generated.\n');
  }

  if (coverage) {
    core.summary.addHeading('Coverage', 2).addTable(createCoverageTable(coverage));
  } else {
    core.summary.addHeading('Coverage', 2).addRaw('No coverage report was generated.\n');
  }

  await core.summary.write();
}

module.exports = async function publishTestSummary({ core }) {
  const results = fs.existsSync(testResultsPath) ? JSON.parse(fs.readFileSync(testResultsPath, 'utf8')) : undefined;
  const coverage = fs.existsSync(coveragePath) ? JSON.parse(fs.readFileSync(coveragePath, 'utf8')).total : undefined;

  try {
    await publishJobSummary(core, results, coverage);
  } catch (error) {
    core.warning(`Unable to publish the job summary: ${error.message}`);
  }
};
