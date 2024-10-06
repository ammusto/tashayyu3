const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

router.post('/api/search', (req, res) => {
  const { query, texts } = req.body;
  
  const db = new sqlite3.Database('path/to/your/database.sqlite');
  
  const sql = `
    SELECT pc.text_id, pc.page_id, pc.position, pc.page_num
    FROM page_content pc
    JOIN texts t ON pc.text_id = t.text_id
    WHERE t.text_id IN (${texts.map(() => '?').join(',')})
    AND (${query})
    ORDER BY pc.text_id, pc.page_num, pc.position
  `;

  db.all(sql, texts, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while performing the search' });
      return;
    }
    
    res.json({ results: rows.map(row => `${row.text_id}#${row.page_id}#${row.position}#${row.page_num}`) });
  });

  db.close();
});

module.exports = router;