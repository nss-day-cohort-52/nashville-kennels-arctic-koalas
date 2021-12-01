import React, { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router";
import AnimalRepository from "../../repositories/AnimalRepository";
import AnimalOwnerRepository from "../../repositories/AnimalOwnerRepository";
import OwnerRepository from "../../repositories/OwnerRepository";
import useSimpleAuth from "../../hooks/ui/useSimpleAuth";
import useResourceResolver from "../../hooks/resource/useResourceResolver";
import "./AnimalCard.css"

export const Animal = ({ animal, syncAnimals,
    showTreatmentHistory, owners }) => {
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [isEmployee, setAuth] = useState(false)
    const [myOwners, setPeople] = useState([])
    const [allOwners, registerOwners] = useState([])
    const [classes, defineClasses] = useState("card animal")
    const { getCurrentUser } = useSimpleAuth()
    const history = useHistory()
    const { animalId } = useParams()
    const { resolveResource, resource: currentAnimal } = useResourceResolver()
    const [employees, setEmployees] = useState([])

    useEffect(() => {
        OwnerRepository.getAllEmployees().then(setEmployees) //pulls the list of employees for use with employees state
    }, [])

    useEffect(() => {
        setAuth(getCurrentUser().employee)//this line checks the current user to see if they are an employee
        resolveResource(animal, animalId, AnimalRepository.get) //builds the animal into a complex component and causes it to render
    }, [animal]) //added listening to the "animal". invoking "syncAnimals()" (passed in as param) should cause re-render

    useEffect(() => {
        if (owners) {
            registerOwners(owners)
        }
    }, [owners])

    const getPeople = () => {
        return AnimalOwnerRepository
            .getOwnersByAnimal(currentAnimal.id)
            .then(people => setPeople(people))
    }

    useEffect(() => {
        getPeople()
    }, [currentAnimal])

    useEffect(() => {
        if (animalId) {
            defineClasses("card animal--single")
            setDetailsOpen(true)

            AnimalOwnerRepository.getOwnersByAnimal(animalId).then(d => setPeople(d))
                .then(() => {
                    OwnerRepository.getAllCustomers().then(registerOwners)
                })
        }
    }, [animalId])

    return (
        <>
            <li className={classes}>
                <div className="card-body">
                    <div className="animal__header">
                        <h5 className="card-title">
                            <button className="link--card btn btn-link"
                                style={{
                                    cursor: "pointer",
                                    "textDecoration": "underline",
                                    "color": "rgb(94, 78, 196)"
                                }}
                                onClick={() => {
                                    if (isEmployee) {
                                        showTreatmentHistory(currentAnimal)
                                    }
                                    else {
                                        history.push(`/animals/${currentAnimal.id}`)
                                    }
                                }}> {currentAnimal.name} </button>
                        </h5>
                        <span className="card-text small">{currentAnimal.breed}</span>
                    </div>

                    <details open={detailsOpen}>
                        <summary className="smaller">
                            <meter min="0" max="100" value={Math.random() * 100} low="25" high="75" optimum="100"></meter>
                        </summary>

                        <section>
                            <h6>Caretaker(s)</h6>
                            <span className="small">
                                {currentAnimal?.animalCaretakers?.map((caretaker) => (caretaker.user.name)).join(", ")}
                            </span>
                            {
                                isEmployee
                                    ? <>
                                        <select defaultValue="" name={`caretaker${currentAnimal.id}`} className="form-control small">
                                            <option value="">
                                                Select {currentAnimal?.animalCaretakers?.length !== 0 ? "another" : "an"} caretaker
                                            </option>
                                            {
                                                employees.map(availableCaretaker => { //for each possible caretaker
                                                    (currentAnimal.animalCaretakers.find(currentCaretaker => currentCaretaker.user.id === availableCaretaker.id)) ? //checks if they are already caring for an animal  
                                                    null : //if they are, leave them off the select
                                                    (<option key={availableCaretaker.id} value={availableCaretaker.id}>{availableCaretaker.name}</option>) //otherwise, add them as an option
                                                }     
                                                )
                                            }

                                        </select>
                                        <button className="btn btn-warning mt-3 form-control small" onClick={() =>
                                            AnimalRepository.addAnimalCaretaker(
                                                {//construction of a new animal owner object based on current animal and selected caretaker from the dropdown
                                                    animalId: currentAnimal.id,
                                                    userId: parseInt(document.querySelector(`[name=caretaker${currentAnimal.id}]`).value)
                                                }
                                            ).then(syncAnimals())
                                        }>Assign Caretaker</button>
                                    </>
                                    : null
                            }


                            <h6>Owners</h6>
                            <span className="small">
                                {myOwners.map((owners) => (`${owners.user.name}`)).join(", ") //changed to myOwners to allow for state changes
                                }
                            </span>

                            {
                                (myOwners.length < 2) && isEmployee
                                    ? <select defaultValue=""
                                        name="owner"
                                        className="form-control small"
                                        onChange={(event) => {
                                            AnimalOwnerRepository.assignOwner(currentAnimal.id, parseInt(event.target.value)).then(syncAnimals()) //with animal listening in place, changed from get people to syncAnimals() for consistency
                                        }} >
                                        <option value="">
                                            Select {myOwners.length === 1 ? "another" : "an"} owner
                                        </option>
                                        {
                                            allOwners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)
                                        }
                                    </select>
                                    : null
                            }


                            {
                                detailsOpen && "treatments" in currentAnimal
                                    ? <div className="small">
                                        <h6>Treatment History</h6>
                                        {
                                            currentAnimal.treatments.map(t => (
                                                <div key={t.id}>
                                                    <p style={{ fontWeight: "bolder", color: "grey" }}>
                                                        {new Date(t.timestamp).toLocaleString("en-US")}
                                                    </p>
                                                    <p>{t.description}</p>
                                                </div>
                                            ))
                                        }
                                    </div>
                                    : ""
                            }

                        </section>

                        {
                            isEmployee
                                ? <button className="btn btn-warning mt-3 form-control small" onClick={() =>
                                    AnimalOwnerRepository
                                        .removeOwnersAndCaretakers(currentAnimal.id)
                                        .then(() => { }) // Remove animal
                                        .then(() => { }) // Get all animals
                                }>Discharge</button>
                                : ""
                        }

                    </details>
                </div>
            </li>
        </>
    )
}
