import React, { useContext, useState } from "react";
import {
    MDBInput,
    MDBBtn,
    MDBIcon
} from 'mdb-react-ui-kit';
import { AuthContext } from "../Context/AuthContext";
import { ChatContext } from "../Context/ChatContext";
import { Timestamp, serverTimestamp, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuid } from "uuid";


const Input = () => {

    const [text, setText] = useState(""); //questo equivale a message del codice chatGPT
    //aggiungere [encryptedMessage, setEncryptedMessage] = useState(""), qui setteremo il messaggio cifrato

    const { currentUser } = useContext(AuthContext);
    const { data } = useContext(ChatContext);

    const handleKey = (e) => {
        e.code === "Enter" && handleSend();
    };

    const handleSend = async () => {
        if(text === ""){
            //controllo dell'input in caso il mex sia vuoto non viene inviato nulla
            console.log("seleziona una chat per inviare un messaggio!")
        } else {
            try {
                await updateDoc(doc(db, "chats", data.chatId), { //metodo usato per salvare dentro il db il messaggio
                    messages: arrayUnion({
                        id: uuid(),
                        text, //testo da cifrare
                        senderId: currentUser.uid,
                        date: Timestamp.now(),
                    }),
                });
        
                await updateDoc(doc(db, "userChats", currentUser.uid), { //metodo usato x salvare in userChats mittente l'ultimo mex
                    [data.chatId + ".lastMessage"]: {
                      text, //da cifrare
                    },
                    [data.chatId + ".date"]: serverTimestamp(),
                });
              
                await updateDoc(doc(db, "userChats", data.user.uid), { //metodo usato x salvare in userChats destinatario l'ultimo mex
                    [data.chatId + ".lastMessage"]: {
                      text, //testo da cifrare
                    },
                    [data.chatId + ".date"]: serverTimestamp(),
                });
                  
                setText("");
            } catch (error) {
                console.log("seleziona una chat per iniziare!")
            }
        }
    };

    return (
        <div className="input">
            <div className="inputType">
                <MDBInput className="prova" label='Type something...' id='formName' type='text' size="sm" onKeyDown={handleKey} value={text} onChange={(e) => setText(e.target.value)} style={{backgroundColor:'white'}}/>
                <div className="send">
                    <MDBBtn rounded size="sm" color='light' rippleColor='dark' onClick={handleSend}>
                        <MDBIcon fas icon='paper-plane' />
                    </MDBBtn>
                </div>
            </div>
        </div>
    );
};

export default Input;

