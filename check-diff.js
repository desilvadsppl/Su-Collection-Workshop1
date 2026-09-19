const { execSync } = require('child_process');
try {
  console.log('STATUS:\n', execSync('git status').toString());
  console.log('DIFF:\n', execSync('git diff').toString());
} catch (e) {
  console.log(e.toString());
}
