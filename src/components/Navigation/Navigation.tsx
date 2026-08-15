import './Navigation.css';

import { NavLink } from "react-router";
import { ChatsCircle, MagnifyingGlass } from "@phosphor-icons/react";

function Navigation() {
    return (
        <>
            <nav className="navigation">
                <NavLink className='navigation-link' to="/chat"><ChatsCircle size={18} />Chat</NavLink>
                <NavLink className='navigation-link' to="/query"><MagnifyingGlass size={18} />Query</NavLink>
            </nav>
        </>
    )
}

export default Navigation;
