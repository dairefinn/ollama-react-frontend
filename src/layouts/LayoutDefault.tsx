import './LayoutDefault.css';

import { Outlet } from 'react-router';

function LayoutDefault()
{
    return (
        <div className='page-wrapper'>
            <Outlet />
        </div>
    )
}

export default LayoutDefault;