import { Container, Row, Col, Card, Nav, Tab } from "react-bootstrap";
import "../../css/HVACFeatures.css";

const roles = [

    {
        key:"manager",

        title:"Manager",

        icon:"👨‍💼",

        description:
        "Complete control over company operations, locations, employees and business performance.",

        features:[
            "Configure multiple cities",
            "Define service areas",
            "Create Managers, Dispatchers and Technicians",
            "Assign technicians by location",
            "Monitor service performance",
            "View business reports"
        ]

    },


    {
        key:"dispatcher",

        title:"Dispatcher",

        icon:"🧑‍💻",

        description:
        "Manage customers, requests and daily service operations efficiently.",

        features:[
            "Create customer profiles",
            "Register service requests",
            "Monitor pending jobs",
            "Assign available technicians",
            "Reassign jobs when required",
            "Track service progress"
        ]

    },


    {
        key:"technician",

        title:"Technician",

        icon:"👨‍🔧",

        description:
        "A powerful mobile workflow that helps technicians respond faster.",

        features:[
            "Receive instant notifications",
            "View customer details",
            "Accept service requests",
            "Update job status",
            "Complete assigned work",
            "Manage daily schedule"
        ]

    }

];


const HVACFeatures = () => {

return (

<section
id="features"
className="hvac-feature-section"
>

<Container>


<div className="feature-heading">


<span className="feature-tag">
HVAC SaaS Platform
</span>


<h2>
Everything Your HVAC Business Needs
</h2>


<p>
From managing multiple cities and technicians
to automating service dispatch,
our platform digitizes your complete HVAC workflow.
</p>


</div>



<Tab.Container defaultActiveKey="manager">


<Row className="role-container">


<Col
lg={4}
>

<Nav
variant="pills"
className="role-menu flex-column"
>


{
roles.map((role)=>(


<Nav.Item key={role.key}>

<Nav.Link
eventKey={role.key}
>

<span>
{role.icon}
</span>


{role.title}


</Nav.Link>

</Nav.Item>


))
}


</Nav>

</Col>



<Col
lg={8}
>


<Tab.Content>


{
roles.map((role)=>(


<Tab.Pane
key={role.key}
eventKey={role.key}
>


<Card className="role-card">


<Card.Body>


<div className="role-icon">

{role.icon}

</div>


<h3>
{role.title}
</h3>


<p>
{role.description}
</p>



<Row className="g-3 mt-4">


{
role.features.map(
(feature,index)=>(

<Col
md={6}
key={index}
>


<div className="feature-item">

✔ {feature}

</div>


</Col>

))
}


</Row>



</Card.Body>


</Card>


</Tab.Pane>


))
}


</Tab.Content>


</Col>


</Row>


</Tab.Container>


</Container>


</section>

);

};


export default HVACFeatures;