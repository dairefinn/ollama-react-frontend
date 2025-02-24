import './Navigation.css';

import { NavLink } from "react-router";

function Navigation() {
    return (
        <>
            <nav className="navigation">
                <NavLink className='navigation-link' to="/chat">Chat</NavLink>
                <NavLink className='navigation-link' to="/query">Query</NavLink>
            </nav>
        </>
    )
}

export default Navigation;
