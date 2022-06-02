import React from 'react'
import "./Card.css"
function Card(props){

    return (
        <div className="card">

            <h1>{props.name}</h1>
            <h3>
                {props.tools.join("/")}
            </h3>
            <p>{props.description}</p>
        </div>
    )
}






Card.defaultProps = {
    name: "Sample Project",
    tools: ["HTML","CSS","JS"],
    description:"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Accusamus, commodi!",
    link: "github.com"
}

export default Card;