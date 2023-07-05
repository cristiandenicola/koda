import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    MDBContainer,
    MDBCol,
    MDBRow,
    MDBBtn,
    MDBInput,
    MDBCard,
    MDBCardBody,
    MDBIcon
} from 'mdb-react-ui-kit';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, storage, db } from "../firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import sodium from "libsodium-wrappers";

import image from '../Assets/Data_security_26.jpg';
import Add from "../Assets/addAvatar.png";
import Validation from "../Validation";
import { updateProfile, createUserWithEmailAndPassword } from "firebase/auth";



const Registration = () => {

    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState('');

    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    let PUBLIC_KEY;
    let SECRET_KEY;



    const generateUserKeys = () => {
        const USER_KEYS = sodium.crypto_kx_keypair();
        //usando crypto_kx ottengo una coppia di key basate sull'algoritmo X25519 che usa la curva Curve25519

        //console.log("chiave pub: " + USER_KEYS.publicKey);
        //console.log("chiave seg: " + USER_KEYS.privateKey);

        const PUBLIC_KEY = sodium.to_hex(USER_KEYS.publicKey);
        const SECRET_KEY = sodium.to_hex(USER_KEYS.privateKey)

        return { PUBLIC_KEY, SECRET_KEY};
    };

    /**
     * DOC
     * const usata per gestire il sign up dello user, oltre i dati inseriti dallo user crea il suo unique tag
     * poi viene richiamata la funz @writeUserData per salvare il tutto sul db
     * @param {*} e usato come error trigger
     */
    const handleSignUp = async (e) => {
        setLoading(true);
        e.preventDefault();
        try {
            //create user authentication
            const res = await createUserWithEmailAndPassword(auth, email, password);

            //create unique image name
            const date = new Date().getTime();
            const storageRef = ref(storage, `${displayName + date}`);


            if(avatar === '') {
                setAvatar(Add)
            }
            
            await uploadBytesResumable(storageRef, avatar).then(() => {
                getDownloadURL(storageRef).then(async (getDownloadURL) => {
                    try {
                        await updateProfile(res.user, {
                            displayName,
                            photoURL: getDownloadURL,
                        });

                        await setDoc(doc(db, "users", res.user.uid), {
                            uid: res.user.uid,
                            displayName,
                            email,
                            photoURL: getDownloadURL,
                            publicKey: "",
                        });
                        //create empty chats on firestone
                        await setDoc(doc(db, "userChats", res.user.uid), {});
                        navigate('/account'); 

                        const keys = generateUserKeys();
                        PUBLIC_KEY = keys.PUBLIC_KEY;
                        SECRET_KEY = keys.SECRET_KEY;

                        //salvo la chiave segreta all'interno del local storage in modo da poterla usare per tutta la sessione
                        localStorage.setItem('secretKey', SECRET_KEY);

                        updateDoc(doc(db, "users", res.user.uid), { 
                            publicKey: PUBLIC_KEY,
                        });

                    } catch (error) {
                        console.log(error);
                        setError(true);
                        setLoading(false);
                    }
                });
            });
        } catch (error) {
            setError(true);
            setLoading(false);
        }
    };
    

    return (
        <MDBContainer fluid className="p-3 my-5">
            <MDBRow>
                <MDBCol col='10' md='6'>
                    <img src={image} className="img-fluid" alt="Phone image" />
                </MDBCol>
                <MDBCol col='4' md='5'>
                    <MDBCard className='bg-white' style={{borderRadius: '1rem', maxWidth: 'auto'}}>
                        <MDBCardBody className='p-5 w-100 d-flex flex-column'>
                            <form onSubmit={handleSignUp}>
                                <MDBInput wrapperClass='mb-4' label='Full name' id='formName' required type='text' size="lg" value={displayName} onChange={(e) => setDisplayName(e.target.value)}/>
                                {error.name && <p style={{color: "red"}}><MDBIcon fab icon='exclamation ' className="mx-2"/>{error.name}</p>}
                                <MDBInput wrapperClass='mb-4' label='Email address' id='formEmail' required type='email' size="lg" value={email} onChange={(e) => setEmail(e.target.value)}/>
                                {error.email && <p style={{color: "red"}}><MDBIcon fab icon='exclamation ' className="mx-2"/>{error.email}</p>}
                                <MDBInput wrapperClass='mb-4' label='Password' autoComplete="on" id='formPassword' required type='password' size="lg" value={password} onChange={(e) => setPassword(e.target.value)}/>
                                {error.password && <p style={{color: "red"}}><MDBIcon fab icon='exclamation ' className="mx-2"/>{error.password}</p>}

                                <input style={{display:"none"}}  required type="file" id="file" onChange={(e) => setAvatar(e.target.files[0])}/>
                                <label htmlFor="file" className="labelAvatar">
                                    <img className="imgAvatar" src={Add} alt="" style={{width: "32px"}}/>
                                    <span>Add an avatar</span>
                                </label>

                                <p style={{marginTop:"30px"}}>Already have an account?<Link to="/Login">  Log in</Link></p>
                                <MDBBtn disabled={loading} className="mb-4 w-100" size="lg">
                                    <MDBIcon icon='user-plus ' className="mx-2"/>
                                    Sign up
                                </MDBBtn>
                                {loading && "Uploading and compressing the image please wait..."}
                                {error && <span>Something went wrong</span>}
                            </form>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    )
}

export default Registration;