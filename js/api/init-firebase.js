const firebaseConfig = {
  databaseURL: 'https://el-pollo-loco-5a521-default-rtdb.europe-west1.firebasedatabase.app'
};

LeaderboardAPI.init({
  appConfig: firebaseConfig,
  databaseURL: firebaseConfig.databaseURL
});