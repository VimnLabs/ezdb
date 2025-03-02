import { Backup } from 'src/';

const backup = new Backup({
	backups: './backups',
	path: './',
	heartbeat: 60 * 1000,
	verbose: {
		start: true,
		open_folder: false,
		open_file: false,
		end: true,
		use: false
	}
});

backup.begin();
