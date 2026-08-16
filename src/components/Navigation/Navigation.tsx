import './Navigation.css';

import { NavLink } from "react-router";
import { BrainIcon, ChatsCircleIcon, GearIcon } from "@phosphor-icons/react";
import { useOllamaHealth } from '../../utils/use-ollama-health';

function Navigation() {
    const ollamaStatus = useOllamaHealth();

    return (
        <>
            <nav className="navigation">
                <NavLink className='navigation-link' to="/chat"><ChatsCircleIcon size={18} />Chat</NavLink>
                <NavLink className='navigation-link' to="/memory"><BrainIcon size={18} />Memory</NavLink>
                <div className="navigation-end">
                    <span
                        className="ollama-status-dot"
                        data-status={ollamaStatus}
                        title={`Ollama: ${ollamaStatus}`}
                    />
                    <NavLink className='navigation-link' to="/settings" title="Settings"><GearIcon size={18} /></NavLink>
                </div>
            </nav>
        </>
    )
}

export default Navigation;
