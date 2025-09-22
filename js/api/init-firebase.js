/**
 * @typedef {Object} FirebaseConfiguration
 * @property {string} databaseURL - Firebase Realtime Database URL.
 */

/**
 * @typedef {Object} LeaderboardInitOptions
 * @property {FirebaseConfiguration} appConfig - Firebase app configuration.
 * @property {string} databaseURL - Convenience pass-through of the database URL.
 */

/**
 * Initializes the leaderboard by preparing Firebase config and calling the API.
 * @returns {void}
 * @example
 * setupLeaderboard();
 */
setupLeaderboard();

/**
 * Orchestrates leaderboard initialization.
 * @returns {void}
 */
function setupLeaderboard() {
  const firebaseConfiguration = getFirebaseConfiguration();
  const leaderboardInitOptions = buildLeaderboardInitOptions(firebaseConfiguration);
  LeaderboardAPI.init(leaderboardInitOptions);
}

/**
 * Provides the Firebase configuration used by the leaderboard.
 * @returns {FirebaseConfiguration}
 * @example
 * const cfg = getFirebaseConfiguration();
 */
function getFirebaseConfiguration() {
  return {
    databaseURL: 'https://el-pollo-loco-5a521-default-rtdb.europe-west1.firebasedatabase.app'
  };
}

/**
 * Builds the options object expected by the Leaderboard API.
 * @param {FirebaseConfiguration} firebaseConfiguration - Firebase configuration.
 * @returns {LeaderboardInitOptions}
 * @example
 * const opts = buildLeaderboardInitOptions(getFirebaseConfiguration());
 * LeaderboardAPI.init(opts);
 */
function buildLeaderboardInitOptions(firebaseConfiguration) {
  return {
    appConfig: firebaseConfiguration,
    databaseURL: firebaseConfiguration.databaseURL
  };
}