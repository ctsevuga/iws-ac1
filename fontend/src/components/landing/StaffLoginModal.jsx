import { useState, useEffect } from "react";

import {
    Modal,
    Form,
    Button
} from "react-bootstrap";

import {
    useDispatch,
    useSelector
} from "react-redux";

import {
    useNavigate,
    useLocation
} from "react-router-dom";


import {
    useLoginMutation
} from "../../slices/usersApiSlice";


import {
    setCredentials
} from "../../slices/authSlice";


import {
    toast
} from "react-toastify";


import Loader from "../Loader";


const StaffLoginModal = ({
    show,
    onHide
}) => {


const [phone,setPhone] = useState("");

const [password,setPassword] = useState("");


const dispatch = useDispatch();

const navigate = useNavigate();

const {search} = useLocation();


const [login,{
    isLoading
}] = useLoginMutation();



const {
    userInfo
} = useSelector(
    state=>state.auth
);



const redirect =
new URLSearchParams(search)
.get("redirect")
||
"/home";



useEffect(()=>{

if(userInfo && show){

    onHide();

}

},[
    userInfo,
    show,
    onHide
]);





const submitHandler = async(e)=>{

e.preventDefault();



if(!phone || !password){

toast.error(
"Phone number and password are required"
);

return;

}



try{


const res =
await login({
    phone,
    password
}).unwrap();



dispatch(
    setCredentials({
        ...res
    })
);



toast.success(
"Login successful"
);



onHide();



if(res.mustChangePassword){

navigate(
"/change-password"
);

}
else{

navigate(
redirect
);

}



}
catch(err){


toast.error(
err?.data?.message ||
err.error
);


}


};





return (

<Modal
show={show}
onHide={onHide}
centered
size="md"
>


<Modal.Header
closeButton
>

<Modal.Title>

Staff Login

</Modal.Title>


</Modal.Header>



<Modal.Body>


<div className="text-center mb-4">


<h3 className="fw-bold text-primary">

HVAC Connect

</h3>


<p className="text-muted">

Manager • Dispatcher • Technician

</p>


</div>




<Form
onSubmit={submitHandler}
>


<Form.Group
className="mb-3"
controlId="phone"
>


<Form.Label>

Phone Number

</Form.Label>


<Form.Control

type="text"

placeholder="Enter phone number"

value={phone}

onChange={
e=>setPhone(
e.target.value
)
}

/>


</Form.Group>





<Form.Group
className="mb-3"
controlId="password"
>


<Form.Label>

Password

</Form.Label>


<Form.Control

type="password"

placeholder="Enter password"

value={password}

onChange={
e=>setPassword(
e.target.value
)
}

/>


</Form.Group>





<Button

type="submit"

variant="primary"

className="w-100 rounded-pill"

disabled={isLoading}

>


Staff Login


</Button>




{
isLoading &&
<div className="mt-3 text-center">

<Loader />

</div>
}



</Form>



<div className="text-center mt-3">

<a
href="/forgot-password"
>

Forgot Password?

</a>


</div>



</Modal.Body>



</Modal>

);

};


export default StaffLoginModal;