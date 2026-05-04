/*const mongoose = require('mongoose');
const uri = "mongodb://mahdinechnech:mahdi2006@ac-lnj2fzz-shard-00-00.qyk7j50.mongodb.net:27017/?ssl=true&authSource=admin&directConnection=true";

mongoose.connect(uri)
  .then(() => {
    console.log('Connected!');
    const admin = mongoose.connection.db.admin();
    admin.command({ isMaster: 1 }).then(info => {
      console.log('ReplicaSet:', info.setName);
      process.exit(0);
    });
  })
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });
*/