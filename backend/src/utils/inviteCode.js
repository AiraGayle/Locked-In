// generateInviteCode()
// TODO: generate a short random string (e.g. 6–8 alphanumeric characters)
// TODO: make sure it's unique — query the rooms table to check for collisions
//        and regenerate if the code already exists
// TODO: export the function for use in the rooms controller

// Example approach (without collision check — add that):
// export function generateInviteCode() {
//   return Math.random().toString(36).substring(2, 8).toUpperCase();
// }