import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useWindowSize } from '../../hooks/useWindowSize';
import Footer from "./Footer";
import {toast, ToastContainer, Zoom} from "react-toastify";

function MainLayout({ children, mainClassName }) {
    const [isOpen, setIsOpen] = useState(true);

    const { width } = useWindowSize() || {};
    useEffect(() => {
        if (width < 1280) {
            setIsOpen(false);
        }
    }, [width]);

    return (
        <div className="flex bg-black">
            <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
            {isOpen && (
                <div
                    className="lg:hidden bg-black opacity-50 absolute top-0 bottom-0 left-0 right-0"
                    onClick={() => setIsOpen(false)}
                />
            )}
            <div
                className={`
                    w-full h-full pr-2 lg:pr-8 py-6 
                    ${width > 1023 && isOpen ? 'pl-68' : 'pl-2 lg:pl-8'}
                `}
            >
                <Header onOpen={() => setIsOpen((bool) => !bool)} />
                <main className={`relative ${mainClassName}`}>
                    <ToastContainer
                        autoClose={5000}
                        transition={Zoom}
                        hideProgressBar
                        newestOnTop
                        position={toast.POSITION.TOP_RIGHT}
                    />
                    {children}
                </main>
                <Footer/>
            </div>
        </div>
    );
}

export default MainLayout;
