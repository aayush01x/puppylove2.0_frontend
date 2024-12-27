import React, { useState } from 'react';
import '../styles/card.css';

const Card = ({
  student,
  onClick,
  clickedCheck,
  isActive,
  hearts_submitted,
}: any) => {
  const userName = student.u;
  const roll = student.i;

  const stylesss = {
    backgroundImage: `url("https://home.iitk.ac.in/~${userName}/dp"), url("https://oa.cc.iitk.ac.in/Oa/Jsp/Photo/${roll}_0.jpg"), url("/dummy.png")`,
  };

  const isClicked = false;

  const clicked = () => {
    if (!isClicked) {
      onClick(student.i);
    } else {
      alert('This student has already been clicked!');
    }
  };

  return (
    <div className={`card ${isActive(student.i) ? '' : 'inactive'}`}>
      <div className="image-box">
        <div className="profile" style={stylesss}></div>
      </div>
      <p className="card-details">{student.n}</p>
      <p className="card-details">{student.i}</p>
      {hearts_submitted && isActive(student.i) ? (
        <div className="carddetails">Hearts Submitted</div>
      ) : isActive(student.i) ? (
        <div className="carddetails">
          <button className="button" onClick={clicked} disabled={clickedCheck}>
            {clickedCheck ? 'Selected' : 'Send Heart'}
          </button>
        </div>
      ) : (
        <div className="carddetails">
          <button className="button" disabled>
            Not Registered
          </button>
        </div>
      )}
    </div>
  );
};

export default Card;
