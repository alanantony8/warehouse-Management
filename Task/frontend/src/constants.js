export const ProtectedRoute = ({ element }) => {
    const isAdmin =true;
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }
    return element;
};