import './Navigation.css';

import { NavLink } from "react-router";
import { Brain, ChatsCircle, Gear } from "@phosphor-icons/react";

function Navigation() {
    return (
        <>
            <nav className="navigation">
                <NavLink className='navigation-link' to="/chat"><ChatsCircle size={18} />Chat</NavLink>
                <NavLink className='navigation-link' to="/memory"><Brain size={18} />Memory</NavLink>
<NavLink className='navigation-link navigation-link-settings' to="/settings" title="Settings"><Gear size={18} /></NavLink>
            </nav>
        </>
    )
}

export default Navigation;
