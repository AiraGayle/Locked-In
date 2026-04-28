import cron from 'node-cron';
import { query } from '../config/db.js';

const closeEmptyRooms = async () => {
  const result = await query(
    `UPDATE rooms SET status = 'closed'
     WHERE status = 'active'
       AND empty_since IS NOT NULL
       AND empty_since <= NOW() - INTERVAL '10 minutes'
     RETURNING id, name`
  );

  if (result.rows.length > 0) {
    console.log(`[cron] Closed ${result.rows.length} empty room(s):`, result.rows.map(r => r.name));
  }
};

const startCleanRoomsJob = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('[cron] Running CleanRooms job...');
    await closeEmptyRooms();
  }, {
    timezone: 'Asia/Manila'
  });

  console.log('[cron] CleanRooms job scheduled (every hour)');
};

export { startCleanRoomsJob };