const validateEmail=(email)=>{
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email)
}

const validatePassword = (password)=>{
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-\\[\]\/+=~`]).{6,}$/;
    return regex.test(password);
}

const validateRole=(role)=>{
    return role==="member" || role==="admin"
}

const validateName=(name)=>{
    const regex = /^[A-Za-z]+( [A-Za-z]+)*$/;
    return regex.test(name);
}

module.exports={validateEmail,validateName,validatePassword,validateRole}
