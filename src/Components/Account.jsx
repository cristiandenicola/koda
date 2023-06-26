import React, { useState, useContext } from "react";
import Chat from "./Chat";
import Sidebar from "./Sidebar";
import { AuthContext } from "../Context/AuthContext";

const Account = () => {

    const { currentUser } = useContext(AuthContext);

    return (
        <div className="home">
            <div className="container">
                <Sidebar/>
                <Chat/>
            </div>
        </div>
    );
}

export default Account;