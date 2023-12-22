"use client"
import React, { useEffect, useState } from 'react'
import { Button } from "@chakra-ui/react";
import { FaSignOutAlt } from "react-icons/fa";
import {motion} from "framer-motion";
import styles from "../styles/login.module.css";
import "../styles/dashboard.css"
import { BsSearch } from "react-icons/bs";
import Card from "@/components/card";
import Hearts from "@/components/Hearts";
import ClickedStudent from "@/components/clickedstudent";
import "../app/globals.css";
import GoToTop from '@/components/GoToTop';
import { useRouter } from 'next/router';
import Clear from '@/components/clear';import { SendHeart } from '@/utils/API_Calls/Send_Heart';
import {receiverIds} from '../utils/UserData';
import { handle_Logout } from '@/utils/API_Calls/login_api';
import { Id, Submit} from "../utils/UserData"
import { search_students,Student } from '@/utils/API_Calls/search';
const SERVER_IP = process.env.SERVER_IP

const New = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [students, setStudents] = useState<Student[]>([]);
    const [activeUsers, setActiveUsers] = useState<string[]>([]);
    const [hearts_submitted, set_hearts_submitted] = useState(Submit);
    const [user,setUser] = useState("")
    const [clickedStudents, setClickedStudents] = useState<Student[]>([]);

    useEffect(() => {
        
        if (Id === '') {
          router.push('/login');
        } else {
          setUser(search_students(Id)[0]);
        }
      }, []);
    
    useEffect(() => {
        const handle_Tab_Close = (e: any) => {
            e.preventDefault();
            // Browser may show its defualt message because of Security Reasons
            return 'Your selections will not be saved if you do not logout. Are you sure you want to leave?';
        };

        if(!hearts_submitted) {
            window.addEventListener('beforeunload', handle_Tab_Close);
        }
      
        return () => {
          window.removeEventListener('beforeunload', handle_Tab_Close);
        };
    }, []);

    const fetchAndSelectStudents =  () => {
        const selected: Student[] = []
        for(let i=0; i < 4; i++) {
            const id = receiverIds[i]
            if(id === '') {
                continue
            }
            const data = search_students(id);
            if (data == undefined) {
                return;
            }
            const student = data[0];
            if (student) {
                selected.push(student);
            }
        }
        setClickedStudents([...clickedStudents,...selected])
    }

    useEffect(()=>{
        fetchAndSelectStudents()
    },[])

    const handleButtonClick = async (studentRoll: string) => {
        if (clickedStudents.length >= 4) {
            alert('You have already selected the maximum number of students 4.');
            return;
        }
        const student = students.find((s) => s.i === studentRoll);

        if (student && !clickedStudents.find((s) => s.i === studentRoll)) {
            setClickedStudents([...clickedStudents,student])
        } else {
            alert('This student has already been clicked!');
        }
    };

    const handleUnselectStudent = async (studentRoll: string) => {
        const updatedStudents = clickedStudents.filter((s) => s.i !== studentRoll);
        setClickedStudents(updatedStudents)
    };

    const Handle_SendHeart = async () => {
        await SendHeart_api(true)
    }
    
    const SendHeart_api = async (Submit: boolean) => {
        if(hearts_submitted) {
            return;
        }
        if(Submit) {
            set_hearts_submitted(true);
        }
        for(let j=0; j < clickedStudents.length; j++) {
            const id: string = clickedStudents[j].i
            receiverIds[j] = id
        }
        for(let j = clickedStudents.length; j < 4; j++) {
            receiverIds[j] = ''
        }
        const isValid = await SendHeart(Id, receiverIds, Submit)
        if(isValid && Submit) {
            alert('HEARTS SENT')
            console.log("HEARTS SEND")
        }
        else if(!isValid && Submit) {
            alert('Error Occurred , Hearts not sent')
            console.log("Error")
        }
        else if(!isValid && !Submit) {
            console.log('Choices Not Saved')
        }
    }

    const Logout = async () => {

        console.log(clickedStudents)

        await SendHeart_api(false);
        const isValid = await handle_Logout()
        router.push('/')
        if(!isValid) {
            alert('Some Error Occured while Logging Out')
        }
        else {
            console.log('Logged Out')
        }
    }

    useEffect( ()=>{
        const updateVirtualHeart = async () => {
            console.log(clickedStudents)
            await SendHeart_api(false);
        }

        updateVirtualHeart()
    },[clickedStudents])

    useEffect(() => {
        const fetchActiveUsers = async () => {
            try {
                const res = await fetch(
                    `${SERVER_IP}/users/activeusers`, {
                        method: "GET",
                        credentials:"include",// For CORS
                    }
                )
                if (!res.ok) {
                    throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
                }
                const active = await res.json()
                setActiveUsers(active.users)
            }
            catch(err) {
                // Cannot fetch Active users
                console.log(err)
            }
        }

        fetchActiveUsers()
    }, []);

    const isActive = (id: string) => {
        return activeUsers.includes(id);
    };

    useEffect(() => {
        fetchStudents();
    }, [searchQuery]);

    const fetchStudents = () => {
            if (searchQuery === ""){
                setStudents([])
                return 
            }
            const studentData = search_students(searchQuery);
            if(studentData == undefined) {
                console.log("Not able to Fetch Students");
                return;
            }
            setStudents(studentData);
    };

    const stylesss = {
        backgroundImage: `url("https://home.iitk.ac.in/~${user?.u}/dp"), url("https://oa.cc.iitk.ac.in/Oa/Jsp/Photo/${user?.i}_0.jpg"), url("/dummy.png")`,
      };

      if (Id=='') return ;
        return (
            <div className='box'>
                <Clear />
                {/* LOGOUT BUTTON */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button as="a" className="chakra-button css-q9srah" onClick={Logout} leftIcon={<FaSignOutAlt />} style={{ top: '10px', left: '1310px' }}>
                    Logout
                </Button>
                </div>
                <div className='hero'>
                <div className='section-A'>
                    <div className='section_1'>
                        <div className="info">
                            <div className="image-container">
                                <div className="image-box">
                                <div className="profile" style={stylesss}></div>
                                </div>
                                {user && <div className="detail">
                                    <div className="details-text-name">{user?.n}</div>
                                    <div className="details-text" >{user?.d}</div>
                                    <div className="details-text" >{user?.i}</div>
                                    {!hearts_submitted ? (
                                        <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={styles["heart-submit-button"]}
                                        onClick={Handle_SendHeart}
                                        style={{ color: "white" }}
                                        >
                                            Submit Hearts
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={styles["heart-submit-button"]}
                                        style={{ color: "white" }}
                                        >
                                            Hearts Submitted
                                        </motion.div>
                                    )}
                                </div>}
                            </div>
                        </div>
                    </div>

                    <div className='section_2'>
                        {clickedStudents.length > 0 ?
                        <div>
                            <ClickedStudent clickedStudents={clickedStudents} onUnselectStudent={handleUnselectStudent} hearts_submitted={hearts_submitted} />
                        </div>
                            :
                            <h2>Clicked Students :</h2>
                        }

                        {/* Automatic Save on Login , So no need of Save Button */}
                        {/* <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={styles["save-button"]}
                            onClick={Handle_SendHeart}
                            style={{ color: "black"}}
                        >
                            Save
                        </motion.div> */}

                    </div>
                </div>
                <div className="section-B">
                <div className='section_3'><Hearts /></div>
                    <div className="section_4">
                        <div className="search-div">
                            <BsSearch className="icon" size={20} />
                            <input
                                type="text"
                                className="search-bar details-text "
                                placeholder="Enter Name To Search."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="student-container">

                            {students.length == 0 && <p>Welcome to Puppy Love</p>}

                            {students.map((student) => (
                                student.i!=Id &&
                                <Card key={student._id} student={student} onClick={handleButtonClick} clickedCheck={clickedStudents.includes(student)}
                                isActive={isActive} hearts_submitted={hearts_submitted}/>
                            ))}
                        </div>
                    </div>
                    <GoToTop />
                </div>
                </div>
                <Clear />
            </div>
        )
}

export default New