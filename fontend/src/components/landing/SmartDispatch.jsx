import { Container, Row, Col, Card } from "react-bootstrap";
import "../../css/SmartDispatch.css";

const dispatchSteps = [
    {
        icon:"📍",
        title:"Location Detection",
        description:
        "The system identifies the customer's city and service area."
    },

    {
        icon:"👨‍🔧",
        title:"Technician Matching",
        description:
        "Only technicians configured for that area receive the request."
    },

    {
        icon:"📲",
        title:"Instant Notification",
        description:
        "Available technicians receive the job notification on mobile."
    },

    {
        icon:"✅",
        title:"Automatic Assignment",
        description:
        "The first technician accepting the request gets the job automatically."
    }
];


const SmartDispatch = () => {

return (

<section
id="dispatch"
className="dispatch-section"
>


<Container>


<Row className="align-items-center">


{/* Left Content */}

<Col
lg={6}
>


<span className="dispatch-tag">
Intelligent Job Assignment
</span>


<h2 className="dispatch-title">

Smart Dispatch Engine

</h2>


<p className="dispatch-description">

Our intelligent dispatch system eliminates manual
coordination between customers, office staff,
and technicians.

When a customer creates a service request,
the platform automatically identifies suitable
technicians based on city and service area.

</p>



<div className="dispatch-flow">


<div className="flow-item">

<span>
🏠
</span>

Customer Request

</div>



<div className="flow-arrow">
↓
</div>



<div className="flow-item">

<span>
📍
</span>

Area Matching

</div>



<div className="flow-arrow">
↓

</div>


<div className="flow-item">

<span>
📲
</span>

Technician Notification

</div>



<div className="flow-arrow">
↓

</div>



<div className="flow-item">

<span>
🔧
</span>

Job Assigned

</div>


</div>


</Col>




{/* Right Content */}


<Col
lg={6}
>


<Card className="dispatch-card">


<Card.Body>


<h3>
Why Smart Dispatch?
</h3>



{
dispatchSteps.map(
(step,index)=>(


<div
className="dispatch-feature"
key={index}
>


<div className="dispatch-icon">

{step.icon}

</div>



<div>

<h5>
{step.title}
</h5>


<p>
{step.description}
</p>


</div>


</div>


))
}



</Card.Body>


</Card>


</Col>


</Row>


</Container>


</section>

);

};


export default SmartDispatch;