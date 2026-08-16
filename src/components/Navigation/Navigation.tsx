import './Navigation.css';

import { NavLink } from "react-router";
import { BrainIcon, ChatsCircleIcon, GearIcon } from "@phosphor-icons/react";

function Navigation() {
    return (
        <>
            <nav className="navigation">
                <NavLink className='navigation-link' to="/chat"><ChatsCircleIcon size={18} />Chat</NavLink>
                <NavLink className='navigation-link' to="/memory"><BrainIcon size={18} />Memory</NavLink>
<NavLink className='navigation-link navigation-link-settings' to="/settings" title="Settings"><GearIcon size={18} /></NavLink>
            </nav>
        </>
    )
}

export default Navigation;
