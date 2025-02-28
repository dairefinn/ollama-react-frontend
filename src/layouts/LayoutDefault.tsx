import { JSX, useEffect } from 'react';
import './LayoutDefault.css';

import { Outlet, useLocation, useNavigate } from 'react-router';

function LayoutDefault(): JSX.Element
{
    // If there is no child route, redirect to /chat
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.pathname.trim() === '/') {
            navigate('/chat');
        };
    });

    return (
        <div className='page-wrapper'>
            <Outlet />
        </div>
    )
}

export default LayoutDefault;
