const db = require('../config/db');

const createUsersTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      firstname VARCHAR(100) NOT NULL,
      lastname VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  try {
    await db.query(sql);
    console.log('users table created successfully');
  } catch (error) {
    console.error('Error creating users table:', error);
    process.exit(1);
  } finally {
    db.end();
  }
};

if (require.main === module) {
  createUsersTable();
}

module.exports = {
  createUsersTable,
};
