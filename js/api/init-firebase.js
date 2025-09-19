setupLeaderboard();

function setupLeaderboard() {
  const firebaseConfiguration = getFirebaseConfiguration();
  const leaderboardInitOptions = buildLeaderboardInitOptions(firebaseConfiguration);
  LeaderboardAPI.init(leaderboardInitOptions);
}

function getFirebaseConfiguration() {
  return {
    databaseURL: 'https://el-pollo-loco-5a521-default-rtdb.europe-west1.firebasedatabase.app'
  };
}

function buildLeaderboardInitOptions(firebaseConfiguration) {
  return {
    appConfig: firebaseConfiguration,
    databaseURL: firebaseConfiguration.databaseURL
  };
}