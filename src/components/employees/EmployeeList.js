import React, { useState, useEffect } from "react"
import Employee from "./Employee"
import EmployeeRepository from "../../repositories/EmployeeRepository"
import "./EmployeeList.css"


export default () => {
    const [emps, setEmployees] = useState([])
    const syncEmployees = () => { //created function to allow calls from empolyee while on the list
        EmployeeRepository.getAll().then(data=>setEmployees(data))
    }

    useEffect(
        () => {
            syncEmployees() //replaced with the function call created above
        }, []
    )

    return (
        <>
            <div className="employees">
                {
                    emps.map(a => <Employee key={a.id} employee={a} syncEmployees={syncEmployees} />) //passed sync employees to allow employee component to force employee list to rerender
                }
            </div>
        </>
    )
}
