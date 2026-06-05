import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MainLayout = () => {
    return (
        <div className="min-h-screen flex bg-gray-50">
            
            <Sidebar />

            
            <div className="flex-1 md:ml-16 flex flex-col min-h-screen">
                
                <Header />

                
                <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
