"use client"
import "../styles/result-page.css"
import Clear from "@/components/clear"
import Hearts from "@/components/Hearts"
import { motion } from "framer-motion";
// import GoToTop from "@/components/GoToTop"
import { admin_pulished, user } from "@/utils/UserData"
import Results from "@/components/matchedResults"
import Link from "next/link";

const ResultPage = () => {
          
    const stylesss = {
        backgroundImage: `url("https://home.iitk.ac.in/~${user?.u}/dp"), url("https://oa.cc.iitk.ac.in/Oa/Jsp/Photo/${user?.i}_0.jpg"), url("/_next/static/media/GenericMale.592f9e48.png")`,
      };

        return (
        <div className='box'>
            <Clear />
            <div className='hero'>
            <div className='section-Ar'>
                <div className='section_1r'>
                    <div className="info">
                        <div className="image-container">
                            <div className="image-box">
                            <div className="profile" style={stylesss}></div>
                            </div>
                            {user && <div className="detail">
                                <div className="details-text-name">{user?.n}</div>
                                <div className="details-text" >{user?.d}</div>
                                <div className="details-text" >{user?.i}</div>
                            </div>}

                        </div>
                    </div>
                </div>
                <div className='section_2r'><Hearts /></div>
               
            </div>
            <div className="section-Br">
                {admin_pulished ?
                
                <div className='section_3r'>
                    <h2>Matches :</h2>
                    <Results />
                </div>
                :

                <div className='section_3r'>
                    <h1>Results Yet to be Published</h1>
                </div>
                }
                <Link href={"/dashboard"}  style={{ color: "white" , fontSize : "20px"}}>Back</Link>
            </div>
            </div>
            <Clear />
        </div>

        );
}

export default ResultPage;