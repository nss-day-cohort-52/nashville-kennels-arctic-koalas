import React, { useState, useEffect } from "react"
import { Link, useParams, useHistory } from "react-router-dom"
import EmployeeRepository from "../../repositories/EmployeeRepository";
import useResourceResolver from "../../hooks/resource/useResourceResolver";
import useSimpleAuth from "../../hooks/ui/useSimpleAuth";
import person from "./person.png"
import "./Employee.css"


export default ({ employee, syncEmployees }) => {
    const [animalCount, setCount] = useState(0)
    const [location, markLocation] = useState({ name: "" })
    const [classes, defineClasses] = useState("card employee")
    const { employeeId } = useParams()
    const { getCurrentUser } = useSimpleAuth()
    const { resolveResource, resource } = useResourceResolver()
    const history = useHistory()

    useEffect(() => {
        if (employeeId) {
            defineClasses("card employee--single")
        }
        resolveResource(employee, employeeId, EmployeeRepository.get)
    }, [employee]) //made sure that individual cards listen to employeeList when it rerenders

    useEffect(() => {
        if (resource?.employeeLocations?.length > 0) {
            markLocation(resource.employeeLocations[0])
        }
    }, [resource])

    return (
        <article className={classes}>
            <section className="card-body">
                <img alt="Kennel employee icon" src={person} className="icon--person" />
                <h5 className="card-title">
                    {
                        employeeId
                            ? resource.name
                            : <Link className="card-link"
                                to={{
                                    pathname: `/employees/${resource.id}`,
                                    state: { employee: resource }
                                }}>
                                {resource.name}
                            </Link>

                    }
                </h5>
                {
                    employeeId
                        ? <>
                            <section>
                                Caring for {resource.animals?.length} animal{resource.animals?.length === 1 ? "" : "s"}
                            </section>
                            <section>
                                Working at {resource?.locations?.map((location) => (`${location.location.name}`)).join(" and ")}                            </section>
                        </>
                        : ""
                }

                {
                    getCurrentUser().employee ?
                        <button className="btn--fireEmployee" onClick={() => {
                            EmployeeRepository.delete(resource.id).then(() => {
                                if (!employeeId) {
                                    syncEmployees()
                                }
                                history.push("/employees")
                            })
                        }}>Fire</button> :
                        null
                }

            </section>

        </article>
    )
}
