const recentActivity = [];
// Define a function to log and store the action in the session
function logAndStoreAction(req, action) {
    const user = req.user; // Assuming you have user information available in the request

    // Get the user's recent activities from the session or initialize an empty array
    const userActivities = req.session.userActivities || [];

    // Add the new action to the user's recent activities
    userActivities.unshift(action); // Add the new action to the beginning of the array

    // Keep only the most recent 4 activities
    if (userActivities.length > 4) {
        userActivities.pop(); // Remove the oldest activity if the array exceeds 4 activities
    }

    // Update the user's recent activities in the session
    req.session.userActivities = userActivities;

    return userActivities;
}


module.exports = {
    logAndStoreAction,
};