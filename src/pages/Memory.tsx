import { JSX } from "react";
import { TrashIcon } from "@phosphor-icons/react";
import { useMemoryStorage } from "../utils/use-memory-storage";

function MemoryPage(): JSX.Element {
    const [memories, , deleteMemory] = useMemoryStorage();

    return (
        <div className="memory-page">
            <h1 className="settings-title">Memories</h1>
            {memories.length === 0 && (
                <p className="memory-empty">No memories saved yet. Ask the model to remember something.</p>
            )}
            <div className="memory-list">
                {memories.map(memory => (
                    <div key={memory.id} className="memory-card">
                        <div className="memory-card-header">
                            <span className="memory-card-title">{memory.title}</span>
                            <div className="memory-card-actions">
                                <span className="memory-card-timestamp">{new Date(memory.timestamp).toLocaleString()}</span>
                                <button className="icon-btn" title="Delete memory" onClick={() => deleteMemory(memory.id)}>
                                    <TrashIcon size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="memory-card-content">{memory.content}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MemoryPage;
