// TODO: install node-cron — npm install node-cron
// TODO: import cron from 'node-cron'
// TODO: import pool from '../config/db.js'

// Scheduled job: clean up empty or expired rooms
// TODO: define what "expired" means — e.g. no active members for over 1 hour
//        or room has no members at all (everyone left)

// TODO: schedule with cron.schedule('0 * * * *', async () => { ... })
//        (runs every hour — adjust the cron expression if needed)

// Inside the job:
// TODO: query rooms that have no entries in room_members
//        OR where all members have been inactive for > 1 hour
// TODO: delete those rooms (room_members rows should cascade-delete if FK is set up)
// TODO: log how many rooms were cleaned each run

// Make sure this file is imported in src/index.js so the job registers on startup