const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(cmd, args, opts = {}) {
	const cwd = opts.cwd || process.cwd();
	console.log(`\n> Running: ${cmd} ${args.join(' ')} (cwd: ${cwd})`);
	const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true, cwd });
	if (res.error) throw res.error;
	if (res.status !== 0) {
		throw new Error(`Command failed: ${cmd} ${args.join(' ')} (status ${res.status})`);
	}
}

function detectPackageManager() {
	try {
		spawnSync('pnpm', ['-v'], { stdio: 'ignore', shell: true });
		return 'pnpm';
	} catch (e) {
		// fallthrough
	}

	try {
		spawnSync('yarn', ['-v'], { stdio: 'ignore', shell: true });
		return 'yarn';
	} catch (e) {
		// fallthrough
	}

	return 'npm';
}

function copyIfNotExists(src, dest) {
	if (fs.existsSync(dest)) {
		console.log(`Skipping: ${dest} already exists`);
		return;
	}
	if (!fs.existsSync(src)) {
		console.log(`Skipping: ${src} not found`);
		return;
	}
	fs.copyFileSync(src, dest);
	console.log(`Created: ${dest} from ${src}`);
}

function ensureDir(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
		console.log(`Created directory: ${dir}`);
	} else {
		console.log(`Directory exists: ${dir}`);
	}
}

function main() {
	const repoRoot = path.join(__dirname, '..');
	const clientDir = path.join(repoRoot, 'client');
	const serverDir = path.join(repoRoot, 'server');
	const uploadsDir = path.join(repoRoot, 'uploads');

	const pkgManager = detectPackageManager();
	console.log(`Using package manager: ${pkgManager}`);

	// Install dependencies for client and server
	try {
		if (fs.existsSync(clientDir)) {
			if (pkgManager === 'yarn') runCommand('yarn', ['install'], { cwd: clientDir });
			else runCommand(pkgManager, ['install'], { cwd: clientDir });
		} else {
			console.log('No client directory found, skipping client install.');
		}

		if (fs.existsSync(serverDir)) {
			if (pkgManager === 'yarn') runCommand('yarn', ['install'], { cwd: serverDir });
			else runCommand(pkgManager, ['install'], { cwd: serverDir });
		} else {
			console.log('No server directory found, skipping server install.');
		}
	} catch (err) {
		console.error('\nDependency installation failed:', err.message || err);
		process.exit(1);
	}

	// Copy env example for server
	const serverEnvExample = path.join(serverDir, 'env.example');
	const serverEnv = path.join(serverDir, '.env');
	copyIfNotExists(serverEnvExample, serverEnv);

	// Ensure uploads directory exists
	ensureDir(uploadsDir);

	// Run server seed script if available
	try {
		const serverPkg = path.join(serverDir, 'package.json');
		if (fs.existsSync(serverPkg)) {
			const pkgJson = JSON.parse(fs.readFileSync(serverPkg, 'utf8'));
			if (pkgJson.scripts && pkgJson.scripts.seed) {
				console.log('\nRunning server seed script...');
				// run seed in server cwd so package manager specific invocation works
				if (pkgManager === 'yarn') runCommand('yarn', ['run', 'seed'], { cwd: serverDir });
				else runCommand(pkgManager, ['run', 'seed'], { cwd: serverDir });
			} else {
				console.log('No seed script found in server package.json, skipping seed.');
			}
		}
	} catch (err) {
		console.error('Seeding failed:', err.message || err);
	}

	console.log('\nSetup complete. Next steps:');
	console.log(`- Start the server: run \`node ${path.join('server', 'dist', 'server.js')}\` or \`npm --prefix server run dev\``);
	console.log(`- Start the client: run \`npm --prefix client run dev\` (or \`next dev\`)`);
}

main();

