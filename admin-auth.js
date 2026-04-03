// Check if the user is authenticated
if (sessionStorage.getItem('isAuthenticated') !== 'true') {
    // Redirect to login page if not authenticated
    window.location.href = 'login.html';
}
