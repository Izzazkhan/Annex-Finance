import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useWindowSize } from '../../hooks/useWindowSize';
import Footer from "./Footer";
import {toast, ToastContainer, Zoom} from "react-toastify";

function MainLayout({ children, mainClassName, title }) {
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
                className={`w-full h-full pr-6 py-6 my-contents ${
                    isOpen ? 'open container-fluid' : 'container pl-6'
                }`}
            >
                <Header onOpen={() => setIsOpen((bool) => !bool)} />
                <main className={`${mainClassName}`}>
                    <ToastContainer
                        autoClose={5000}
                        transition={Zoom}
                        hideProgressBar
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
