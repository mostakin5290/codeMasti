import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { githubLoginUser, checkAuth } from '../auth/authSlice';
import { toast } from 'react-toastify';
import { useEffect, useRef } from 'react';

const GitHubCallback = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const token = searchParams.get('token'); // For redirect-based approach

    // Prevent double execution in React StrictMode
    const hasProcessed = useRef(false);

    useEffect(() => {
        const handleGitHubLogin = async () => {
            // Prevent multiple executions
            if (hasProcessed.current) {
                return;
            }
            hasProcessed.current = true;

            // Handle direct token from redirect
            if (token) {
                try {
                    // If backend redirected with token, just check auth status
                    await dispatch(checkAuth()).unwrap();
                    navigate('/home');
                    return;
                } catch (err) {
                    console.error('Auth check failed:', err);
                    toast.error('Authentication failed');
                    navigate('/login');
                    return;
                }
            }

            // Handle error from GitHub
            if (error) {
                console.error('GitHub OAuth error:', error, errorDescription);
                toast.error(errorDescription || 'GitHub login failed');
                navigate('/login');
                return;
            }

            // Handle authorization code
            if (code) {
                try {
                    await dispatch(githubLoginUser(code)).unwrap();
                    navigate('/home');
                } catch (err) {
                    console.error('GitHub login dispatch error:', err);
                    
                    // Handle specific error messages
                    if (typeof err === 'string' && err.includes('expired')) {
                        toast.error('GitHub login session expired. Please try again.');
                    } else {
                        toast.error(err || 'GitHub login failed');
                    }
                    navigate('/login');
                }
            } else {
                toast.error('GitHub login failed - no authorization code received');
                navigate('/login');
            }
        };

        // Add a small delay to prevent rapid fire requests
        const timeoutId = setTimeout(handleGitHubLogin, 100);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [dispatch, navigate, code, error, errorDescription, token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg font-medium">Processing GitHub login...</p>
                <p className="text-sm text-white/60 mt-2">Please wait while we complete your authentication</p>
                
                {/* Debug info in development */}
                {/* {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 text-xs text-white/40">
                        <p>Code: {code ? 'Present' : 'Missing'}</p>
                        <p>Error: {error || 'None'}</p>
                        <p>Token: {token ? 'Present' : 'Missing'}</p>
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default GitHubCallback;