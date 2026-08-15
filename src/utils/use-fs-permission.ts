import { useState } from "react";
import { FsPermission } from "../tools/tool.types";

const FS_PERMISSION_KEY = 'ollama-fs-permission';
const DEFAULT: FsPermission = 'read';

export function useFsPermission(): [FsPermission, (p: FsPermission) => void] {
    const [permission, setPermissionState] = useState<FsPermission>(() => {
        const stored = localStorage.getItem(FS_PERMISSION_KEY);
        return (stored as FsPermission | null) ?? DEFAULT;
    });

    const setPermission = (p: FsPermission) => {
        localStorage.setItem(FS_PERMISSION_KEY, p);
        setPermissionState(p);
    };

    return [permission, setPermission];
}
