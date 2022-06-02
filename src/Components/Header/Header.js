import React from "react";
import "./Header.css"

function Header(props){
    return(
        <div className="header">
            <div className="background"/>
            <nav className="nav-bar">
                    <ul className="nav-items">
                        <li>Home</li>
                        <li>Project</li>
                        <li>Contact</li>
                    </ul>
            </nav>
            <div className="intro">
                <div className="info">
                        <h1>{props.name}</h1>
                        <h2>{props.role}</h2>
                </div>
                <div className="image">
                    <img src={props.imgsrc} alt="" />
                </div>
            </div>
            <div className="about">
                <p>{props.des}</p>
                <ul>
                    <li>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Explicabo, laudantium?</li>
                    <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores, ipsam.</li>
                    <li>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Et, nulla?</li>
                </ul>
            </div>
            
        </div>
    )
}


Header.defaultProps = {
    name: "Savio Fernando" ,
    role: "Software Developer",
    imgsrc: "https://i1.sndcdn.com/avatars-001039428259-xg4x4z-t500x500.jpg",
    des: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam, ipsam amet minima voluptatibus enim unde voluptatum reprehenderit corrupti cupiditate minus illo earum doloremque ipsum harum a ab, tempore expedita hic. Ipsum eveniet molestiae architecto totam dolorum, corrupti obcaecati reiciendis consequatur quas vel quam dolores doloremque aliquid, beatae recusandae exercitationem in."
}

export default Header;