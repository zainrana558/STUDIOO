"use client";

import { useState } from 'react';
import { SidebarNav } from './SidebarNav';

/**
 * Manages the responsive layout, including the collapsible sidebar and main content padding.
 */
export const ResponsiveLayout = ({ children }: { children: React.ReactNode }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <>
            <SidebarNav isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
            <main className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
                {children}
            </main>
        </>
    );
};
